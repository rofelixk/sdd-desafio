// Etapa 8 da seção 8: dias de viagem (RN-011, AMB-007).

import { somarDias } from './datas.ts';
import { diariasDe } from './diarias.ts';
import type { DataISO, DespesaElegivel } from './tipos.ts';

/** Todas as noites D…D+N−1 das despesas elegíveis de periodicidade `diaria`; o check-out (D+N) não entra. */
export function diasDeViagem(elegiveis: readonly DespesaElegivel[]): Set<DataISO> {
  const dias = new Set<DataISO>();
  for (const d of elegiveis) {
    if (d.regra.periodicidade !== 'diaria') continue;
    for (let k = 0; k < diariasDe(d); k++) dias.add(somarDias(d.data, k));
  }
  return dias;
}
