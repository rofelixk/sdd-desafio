// Diárias de hospedagem (RN-012, AMB-008).

import { somarDias } from './datas.ts';
import { normalizar } from './texto.ts';
import type { DespesaElegivel, Parcela } from './tipos.ts';

/** Primeiro "<inteiro> diária(s)/noite(s)", sem pegar pedaço de fracionário (R-07). */
const PADRAO_DIARIAS = /(?<!\d[.,]?)(\d+)(?![.,]\d)\s*(diarias?|noites?)(?![a-z])/;

/** N a partir da `descricao` já em texto; sem o padrão, vazia ou N = 0 → 1. */
export function extrairDiarias(descricao: string): number {
  const m = PADRAO_DIARIAS.exec(normalizar(descricao));
  const n = m ? Number(m[1]) : 0;
  return n > 0 ? n : 1;
}

/** N da despesa: extraído da descrição na periodicidade `diaria` (hospedagem), 1 nas demais (R-15). */
export function diariasDe(d: DespesaElegivel): number {
  return d.regra.periodicidade === 'diaria' ? extrairDiarias(d.descricao) : 1;
}

/**
 * Parcelas que consomem limite (DT-003): N noites D…D+N−1 com `valor em reais ÷ N`,
 * o resto um centavo por vez nas primeiras noites.
 */
export function gerarParcelas(d: DespesaElegivel): Parcela[] {
  const n = diariasDe(d);
  const valor = d.conversao.valorSolicitado;
  const base = valor / BigInt(n);
  const resto = valor % BigInt(n);
  return Array.from({ length: n }, (_, k) => ({
    indiceDespesa: d.indice,
    data: somarDias(d.data, k),
    categoria: d.categoria,
    valor: base + (BigInt(k) < resto ? 1n : 0n),
  }));
}
