import { expect, Page, test } from '@playwright/test';

const claves = {
  admin: process.env['E2E_ADMIN_PASSWORD'] ?? 'Admin2026*',
  vendedor: process.env['E2E_VENDEDOR_PASSWORD'] ?? 'Vendedor2026*',
  almacen: process.env['E2E_ALMACEN_PASSWORD'] ?? 'Almacen2026*',
};

async function enviarLogin(page: Page, usuario: string, clave: string) {
  await page.getByLabel('Usuario', { exact: true }).fill(usuario);
  await page.getByLabel('Contraseña', { exact: true }).fill(clave);
  await page.getByRole('button', { name: 'Ingresar' }).click();
}

async function entrar(page: Page, usuario: keyof typeof claves, ruta: string) {
  await page.goto(ruta);
  await expect(page).toHaveURL(/\/login/);
  await enviarLogin(page, usuario, claves[usuario]);
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
}

test('una ruta protegida guarda la URL de retorno', async ({ page }) => {
  await page.goto('/ventas');
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fventas/);
});

test('el login muestra el error de credenciales incorrectas', async ({ page }) => {
  await page.goto('/login');
  await enviarLogin(page, 'admin', 'incorrecta');
  await expect(page.getByRole('alert')).toContainText('Usuario o contraseña incorrectos');
});

test('el vendedor vuelve a la ruta solicitada después del login', async ({ page }) => {
  await entrar(page, 'vendedor', '/ventas');
  await expect(page).toHaveURL(/\/ventas$/);
});

test('almacén no puede entrar a ventas', async ({ page }) => {
  await entrar(page, 'almacen', '/inicio');
  await expect(page.getByRole('link', { name: 'Ventas', exact: true })).toHaveCount(0);
  await page.goto('/ventas');
  await expect(page.getByRole('heading', { name: /Acceso denegado/ })).toBeVisible();
});

test('el vendedor ve productos sin acciones de edición', async ({ page }) => {
  await entrar(page, 'vendedor', '/productos');
  await expect(page.getByTestId('tabla-productos')).toBeVisible();
  await expect(page.getByRole('link', { name: /Nuevo producto|Editar/ })).toHaveCount(0);
});

test('la segunda página de productos se consulta en el servidor y persiste al recargar', async ({ page }) => {
  await entrar(page, 'admin', '/productos');
  await expect(page.getByTestId('tabla-productos').locator('tbody tr')).toHaveCount(20);
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 1 de/);
  const respuesta = page.waitForResponse((r) => {
    const url = new URL(r.url());
    return url.pathname.endsWith('/api/v1/productos') && url.searchParams.get('pagina') === '1';
  });
  await page.getByRole('button', { name: 'Siguiente' }).click();
  expect((await respuesta).status()).toBe(200);
  await expect(page).toHaveURL(/pagina=1/);
  await page.reload();
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 2 de/);
});

test('una venta genera comprobante y descuenta stock en el catálogo', async ({ page }) => {
  const cliente = process.env['E2E_CLIENTE'] ?? 'Mamani';
  const producto = process.env['E2E_PRODUCTO'] ?? 'Paracetamol';
  const errores: string[] = [];
  page.on('pageerror', (error) => errores.push(error.message));
  page.on('response', (response) => {
    if (response.url().includes('/api/v1/') && response.status() >= 500) errores.push(response.url());
  });
  await entrar(page, 'vendedor', '/ventas/nueva');
  await page.getByTestId('buscar-cliente').fill(cliente);
  await page.getByTestId('opcion-cliente').first().click();
  await page.getByTestId('buscar-producto').fill(producto);
  const opcion = page.getByTestId('opcion-producto').filter({ hasText: producto }).first();
  await expect(opcion).toBeVisible();
  const stock = Number(await opcion.getAttribute('data-stock'));
  expect(stock).toBeGreaterThanOrEqual(2);
  await opcion.click();
  await page.getByTestId('cantidad').last().fill('2');
  await expect(page.getByTestId('total-venta')).not.toHaveText('S/ 0.00');
  await page.getByRole('button', { name: 'Revisar venta' }).click();
  await page.getByLabel('Imprimir el comprobante al registrar').uncheck();
  const registro = page.waitForResponse((r) => r.url().endsWith('/api/v1/ventas') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Confirmar venta' }).click();
  expect((await registro).status()).toBe(201);
  await expect(page).toHaveURL(/\/ventas\/\d+/);
  await expect(page.getByRole('heading', { name: 'Comprobante de venta' })).toBeVisible();
  await page.getByRole('link', { name: 'Productos', exact: true }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre o categoría' }).fill(producto);
  const fila = page.getByTestId('tabla-productos').getByRole('row').filter({ has: page.getByText(producto, { exact: true }) });
  await expect(fila.getByTestId('stock-producto')).toHaveText(String(stock - 2));
  expect(errores).toEqual([]);
});
