import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, linkedSignal, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { mensajeError } from '../../../../core/utils/http-error';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { enteroEnRango } from '../../../../core/utils/paginacion';
import { Paginador } from '../../../../shared/components/paginador/paginador';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';

@Component({
  selector: 'app-producto-list',
  imports: [SiPermiso, RouterLink, CurrencyPipe, Paginador],
  templateUrl: './producto-list.html',
})
export class ProductoList {
  private readonly service = inject(ProductoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  private readonly cambiosFiltro = new Subject<string>();
  private readonly consulta = computed(() => {
    const q = this.query();
    const orden = q.get('orden') ?? 'nombre';
    return {
      pagina: enteroEnRango(q.get('pagina'), 0, 2147483647, 0),
      tamanio: enteroEnRango(q.get('tamanio'), 1, 100, 20),
      ordenarPor: ['id', 'nombre', 'precio', 'stock'].includes(orden) ? orden : 'nombre',
      direccion: q.get('dir') === 'desc' ? 'desc' : 'asc',
      filtro: q.get('filtro') ?? '',
    };
  });
  private readonly productos = rxResource({
    params: this.consulta,
    stream: ({ params }) => this.service.buscar(params),
  });
  readonly resultado = linkedSignal<PaginaResponse<Producto> | undefined, PaginaResponse<Producto> | undefined>({
    source: () => this.productos.hasValue() ? this.productos.value() : undefined,
    computation: (pagina, anterior) => pagina ?? anterior?.value,
  });
  readonly filtro = linkedSignal(() => this.consulta().filtro);
  readonly cargando = this.productos.isLoading;
  readonly eliminando = signal(false);
  private readonly errorEliminar = signal('');
  readonly error = computed(() => {
    const error = this.productos.error();
    const mensaje = error instanceof HttpErrorResponse ? mensajeError(error) : error?.message;
    return this.errorEliminar() || mensaje || '';
  });
  readonly exito = signal(this.query().has('guardado') ? 'Producto guardado correctamente.' : '');

  constructor() {
    this.cambiosFiltro.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((filtro) =>
      this.navegar({ filtro: filtro.trim() || null, pagina: 0 }),
    );
  }

  buscar(filtro: string) {
    this.filtro.set(filtro);
    this.cambiosFiltro.next(filtro);
  }

  cargar() {
    this.productos.reload();
  }

  ordenarPor(orden: string) {
    const actual = this.consulta();
    const dir = actual.ordenarPor === orden && actual.direccion === 'asc' ? 'desc' : 'asc';
    this.navegar({ orden, dir, pagina: 0 });
  }

  navegar(queryParams: Record<string, string | number | null>) {
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }

  eliminar(p: Producto) {
    if (this.eliminando() || !confirm(`¿Eliminar el producto ${p.nombre}?`)) return;
    this.eliminando.set(true);
    this.errorEliminar.set('');
    this.exito.set('');
    this.service.eliminar(p.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        const resultado = this.resultado();
        if (resultado && resultado.pagina > 0 && resultado.contenido.length === 1) {
          this.navegar({ pagina: resultado.pagina - 1 });
        } else {
          this.cargar();
        }
        this.eliminando.set(false);
        this.exito.set('Producto eliminado.');
      },
      error: (e) => {
        this.errorEliminar.set(mensajeError(e));
        this.eliminando.set(false);
      },
    });
  }
}
