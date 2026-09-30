// Status derivado dos valores (seção 4); nunca guardado no item.

import { LIMIAR_APROVACAO } from './politica.ts';
import type { ResultadoItem, Status } from './tipos.ts';

export function statusDe(item: Pick<ResultadoItem, 'valorSolicitado' | 'valorReembolsavel'>): Status {
  if (item.valorReembolsavel > LIMIAR_APROVACAO) return 'PENDENTE'; // RN-018, AMB-040
  if (item.valorReembolsavel === 0n) return 'RECUSADO';
  return item.valorReembolsavel === item.valorSolicitado ? 'APROVADO' : 'PARCIAL';
}
