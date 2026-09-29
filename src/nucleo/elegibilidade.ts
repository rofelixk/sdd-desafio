// Etapas 3 a 7 da seção 8. Cada função devolve a recusa da etapa ou `null`;
// a ordem das etapas vive só no `motor.ts` (DT-002).

import type { DataISO, DespesaValida, Recusa } from './tipos.ts';

/** Etapa 3 (RN-004, AMB-012). */
export function verificarValorPositivo(d: DespesaValida): Recusa | null {
  return d.valorSolicitado <= 0n
    ? { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valor: d.valorSolicitado } }
    : null;
}

/** Etapa 4 (RN-005, AMB-009, AMB-010): `[inicio, fim]`, inclusive. */
export function verificarPeriodo(d: DespesaValida, inicio: DataISO, fim: DataISO): Recusa | null {
  return d.data < inicio || d.data > fim
    ? { codigo: 'FORA_DO_PERIODO', detalhes: { data: d.data, inicio, fim } }
    : null;
}
