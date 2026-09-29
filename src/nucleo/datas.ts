// Datas `AAAA-MM-DD` em UTC (R-05). Por ter largura fixa, `DataISO` se compara
// como texto (`<`, `<=`).

import type { DataISO } from './tipos.ts';

const FORMATO = /^\d{4}-\d{2}-\d{2}$/;

/** Formato `AAAA-MM-DD` e data existente no calendário. */
export function ehDataValida(texto: string): texto is DataISO {
  if (!FORMATO.test(texto)) return false;
  const [ano, mes, dia] = texto.split('-').map(Number) as [number, number, number];
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

/** `data + k` dias. */
export function somarDias(data: DataISO, k: number): DataISO {
  const [ano, mes, dia] = data.split('-').map(Number) as [number, number, number];
  const d = new Date(Date.UTC(ano, mes - 1, dia + k));
  const aaaa = String(d.getUTCFullYear()).padStart(4, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${aaaa}-${mm}-${dd}`;
}
