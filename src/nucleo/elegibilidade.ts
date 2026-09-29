// Etapas 3 a 7 da seção 8. Cada função devolve a recusa da etapa ou `null`;
// a ordem das etapas vive só no `motor.ts` (DT-002).

import type { DataISO, DespesaValida, Recusa } from './tipos.ts';

/** Etapa 3 (RN-004, AMB-012). */
export function verificarValorPositivo(d: DespesaValida): Recusa | null {
  return d.valorSolicitado <= 0n
    ? { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valor: d.valorSolicitado } }
    : null;
}
