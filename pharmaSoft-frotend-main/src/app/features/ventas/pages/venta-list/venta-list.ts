import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { enteroEnRango } from '../../../../core/utils/paginacion';
import { Paginador } from '../../../../shared/components/paginador/paginador';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { VentaService } from '../../services/venta-service';
import { EstadoVenta, FiltroVentas, Venta } from '../../models/venta.model';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { mensajeError } from '../../../../core/utils/http-error';
import { redondear } from '../../../../core/utils/numeros';
@Component({
  selector: 'app-venta-list',
  imports: [SiPermiso, ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, Paginador],
  templateUrl: './venta-list.html',
})
export class VentaList implements OnInit, OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private request?: Subscription;
  private readonly subs = new Subscription();
  private pagina = 0;
  private tamanio = 10;
  readonly clientes = signal<Cliente[]>([]);
  readonly error = signal('');
  readonly errorClientes = signal('');
  readonly cargando = signal(false);
  readonly resultado = signal<PaginaResponse<Venta> | null>(null);
  readonly ahora = signal(new Date());
  readonly filtros = this.fb.group({
    clienteId: this.fb.control<number | null>(null),
    estado: this.fb.control<EstadoVenta | null>(null),
    desde: [''],
    hasta: [''],
  });
  readonly aplicados = signal<FiltroVentas>({
    clienteId: null,
    estado: null,
    desde: null,
    hasta: null,
  });
  readonly totalPagina = computed(() =>
    redondear(
      (this.resultado()?.contenido ?? [])
        .filter((v) => v.estado === 'REGISTRADA')
        .reduce((s, v) => s + v.total, 0),
    ),
  );
  readonly resumenFiltros = computed(() => {
    const f = this.aplicados();
    const c = this.clientes().find((c) => c.id === f.clienteId);
    return (
      [
        c ? `Cliente: ${c.apellidos}, ${c.nombres}` : f.clienteId ? `Cliente ${f.clienteId}` : '',
        f.estado ? `Estado: ${f.estado}` : '',
        f.desde ? `Desde: ${f.desde}` : '',
        f.hasta ? `Hasta: ${f.hasta}` : '',
      ]
        .filter(Boolean)
        .join(' · ') || 'Todas las ventas'
    );
  });
  ngOnInit() {
    this.subs.add(this.clienteService
      .listar()
      .subscribe({
        next: (c) => this.clientes.set(c),
        error: (e) => this.errorClientes.set(mensajeError(e)),
      }));
    this.subs.add(this.route.queryParamMap.subscribe((q) => {
      const estado = q.get('estado');
      const clienteId = enteroEnRango(q.get('clienteId'), 1, Number.MAX_SAFE_INTEGER, 0);
      const filtros: FiltroVentas = {
        clienteId: clienteId || null,
        estado: estado === 'REGISTRADA' || estado === 'ANULADA' ? estado : null,
        desde: q.get('desde'),
        hasta: q.get('hasta'),
      };
      this.aplicados.set(filtros);
      this.filtros.setValue({ ...filtros, desde: filtros.desde ?? '', hasta: filtros.hasta ?? '' });
      this.pagina = enteroEnRango(q.get('pagina'), 0, 2147483647, 0);
      this.tamanio = enteroEnRango(q.get('tamanio'), 1, 100, 10);
      this.cargar(this.pagina);
    }));
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
    this.request?.unsubscribe();
  }
  buscar() {
    const f = this.filtros.getRawValue();
    if (f.desde && f.hasta && f.desde > f.hasta) {
      this.error.set('La fecha desde no puede ser posterior a la fecha hasta.');
      return;
    }
    this.navegar({ ...f, desde: f.desde || null, hasta: f.hasta || null, pagina: 0 });
  }
  limpiar() {
    this.filtros.reset();
    this.buscar();
  }
  irA(pagina: number) {
    const r = this.resultado();
    if (!r || pagina < 0 || pagina >= r.totalPaginas || this.cargando()) return;
    this.navegar({ pagina });
  }
  cambiarTamanio(tamanio: number) {
    this.navegar({ tamanio, pagina: 0 });
  }
  private navegar(queryParams: Record<string, string | number | null>) {
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }
  reintentar() {
    this.cargar(this.pagina);
  }
  private cargar(pagina: number) {
    this.request?.unsubscribe();
    this.cargando.set(true);
    this.error.set('');
    this.request = this.service.buscar(this.aplicados(), pagina, this.tamanio).subscribe({
      next: (r) => {
        this.resultado.set(r);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargando.set(false);
      },
    });
  }
  imprimirConsulta() {
    if (!this.resultado()?.contenido.length || this.cargando()) return;
    this.ahora.set(new Date());
    setTimeout(() => window.print());
  }
}
