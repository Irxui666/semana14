export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  estado: boolean;
  categoriaId: number;
  categoriaNombre: string;
  fechaCreacion: string;
  fechaModificacion: string | null;
  creadoPor?: string | null;
  modificadoPor?: string | null;
}
export interface ProductoRequest {
  nombre: string;
  precio: number;
  stock: number;
  estado: boolean;
  categoria: number;
}
