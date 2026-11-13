import { inject, Injectable } from '@angular/core';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Producto, ProductoRequest } from '../models/producto.model';
@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/productos`;
  listar() {
    return this.http.get<Producto[]>(this.url);
  }
  buscar(consulta: { pagina: number; tamanio: number; ordenarPor: string; direccion: string; filtro: string }) {
    return this.http.get<PaginaResponse<Producto>>(this.url, { params: consulta });
  }
  obtener(id: number) {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }
  crear(dto: ProductoRequest) {
    return this.http.post<Producto>(this.url, dto);
  }
  actualizar(id: number, dto: ProductoRequest) {
    return this.http.put<Producto>(`${this.url}/${id}`, dto);
  }
  eliminar(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
