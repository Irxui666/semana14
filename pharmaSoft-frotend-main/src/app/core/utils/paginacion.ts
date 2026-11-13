export function enteroEnRango(valor: string | null, minimo: number, maximo: number, defecto: number): number {
  const numero = Number(valor);
  return valor !== null && /^\d+$/.test(valor) && Number.isInteger(numero) &&
    numero >= minimo && numero <= maximo ? numero : defecto;
}
