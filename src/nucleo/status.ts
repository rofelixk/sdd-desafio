// Status derivado dos valores (seção 4); nunca guardado no item.

import type { ResultadoItem, Status } from './tipos.ts';

export function statusDe(item: Pick<ResultadoItem, 'valorSolicitado' | 'valorReembolsavel'>): Status {
  if (item.valorReembolsavel === 0n) return 'RECUSADO';
  return item.valorReembolsavel === item.valorSolicitado ? 'APROVADO' : 'PARCIAL';
}
