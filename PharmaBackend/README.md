# PharmaBackend · Sesión 14

Copia de trabajo de PharmaBackend de SEMANA12. Java 21 y Spring Boot 4. En Oracle, el perfil dev usa la conexión de `src/main/resources/application-dev.yaml`. Flyway descubre V1, V2 y V4. La base disponible no incluía la sesión 13 ni una migración V3.

## Pruebas locales con H2

En una terminal del backend, con Java 21:

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:test-run "-Dspring-boot.run.profiles=test" "-Dspring-boot.run.arguments=--spring.datasource.url=jdbc:h2:mem:pharma-e2e;MODE=Oracle --spring.sql.init.data-locations=classpath:seguridad-datos.sql,classpath:e2e-datos.sql"
```

En otra terminal, desde `pharmaSoft-frotend-main`:

```powershell
npm.cmd ci
npx.cmd playwright install chromium
npm.cmd run e2e -- --repeat-each=3
npx.cmd playwright show-report
```

El perfil test usa una base temporal y deja el backend en el puerto 8080. Playwright inicia Angular en 4200. En Oracle, utiliza una base de desarrollo, carga un cliente y una categoría y ejecuta `docs/sql/volumen_pruebas.sql` del frontend después de V4. Las contraseñas y nombres de los datos de Playwright se pueden ajustar con `E2E_ADMIN_PASSWORD`, `E2E_VENDEDOR_PASSWORD`, `E2E_ALMACEN_PASSWORD`, `E2E_CLIENTE` y `E2E_PRODUCTO`.
