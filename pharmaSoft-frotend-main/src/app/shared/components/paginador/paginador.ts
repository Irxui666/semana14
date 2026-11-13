import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-paginador',
  styles: ['nav { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-top: .75rem; }'],
  template: `
    <nav aria-label="Paginación">
      <span data-testid="resumen-paginacion">{{ desde() }}–{{ hasta() }} de {{ totalElementos() }}</span>
      <label>Filas
        <select (change)="cambioTamanio.emit(+$any($event.target).value)" [disabled]="cargando()">
          @for (t of tamanios(); track t) {
            <option [value]="t" [selected]="t === tamanio()">{{ t }}</option>
          }
        </select>
      </label>
      <button type="button" class="btn" aria-label="Primera página" [disabled]="primera()" (click)="cambioPagina.emit(0)">«</button>
      <button type="button" class="btn" [disabled]="primera()" (click)="cambioPagina.emit(pagina() - 1)">Anterior</button>
      <span data-testid="pagina-actual">Página {{ pagina() + 1 }} de {{ totalPaginas() || 1 }}</span>
      <button type="button" class="btn" [disabled]="ultima()" (click)="cambioPagina.emit(pagina() + 1)">Siguiente</button>
      <button type="button" class="btn" aria-label="Última página" [disabled]="ultima()" (click)="cambioPagina.emit(totalPaginas() - 1)">»</button>
    </nav>
  `,
})
export class Paginador {
  readonly pagina = input.required<number>();
  readonly tamanio = input.required<number>();
  readonly totalPaginas = input.required<number>();
  readonly totalElementos = input.required<number>();
  readonly cargando = input(false);
  readonly cambioPagina = output<number>();
  readonly cambioTamanio = output<number>();
  protected readonly tamanios = computed(() =>
    [...new Set([10, 20, 50, 100, this.tamanio()])].sort((a, b) => a - b),
  );
  protected readonly hasta = computed(() => Math.min((this.pagina() + 1) * this.tamanio(), this.totalElementos()));
  protected readonly desde = computed(() => Math.min(this.pagina() * this.tamanio() + 1, this.hasta()));
  protected readonly primera = computed(() => this.cargando() || this.pagina() <= 0);
  protected readonly ultima = computed(() => this.cargando() || this.pagina() >= this.totalPaginas() - 1);
}
