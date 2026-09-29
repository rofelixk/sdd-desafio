// Diárias de hospedagem (RN-012, AMB-008).

import { normalizar } from './texto.ts';

/** Primeiro "<inteiro> diária(s)/noite(s)", sem pegar pedaço de fracionário (R-07). */
const PADRAO_DIARIAS = /(?<!\d[.,]?)(\d+)(?![.,]\d)\s*(diarias?|noites?)(?![a-z])/;

/** N a partir da `descricao` já em texto; sem o padrão, vazia ou N = 0 → 1. */
export function extrairDiarias(descricao: string): number {
  const m = PADRAO_DIARIAS.exec(normalizar(descricao));
  const n = m ? Number(m[1]) : 0;
  return n > 0 ? n : 1;
}
