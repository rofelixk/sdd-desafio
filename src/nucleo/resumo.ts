// Totais do resumo (RN-014).

import { statusDe } from './status.ts';
import type { ResultadoItem, Resumo } from './tipos.ts';

export function calcularResumo(itens: readonly ResultadoItem[]): Resumo {
  const contagem = { APROVADO: 0, PARCIAL: 0, RECUSADO: 0 };
  let totalSolicitado = 0n;
  let totalReembolsavel = 0n;
  for (const item of itens) {
    contagem[statusDe(item)]++;
    // Só valor positivo e não nulo entra no solicitado (RN-004, AMB-012, AMB-023).
    if (item.valorSolicitado !== null && item.valorSolicitado > 0n) totalSolicitado += item.valorSolicitado;
    totalReembolsavel += item.valorReembolsavel;
  }
  return {
    quantidadeItens: itens.length,
    aprovados: contagem.APROVADO,
    parciais: contagem.PARCIAL,
    recusados: contagem.RECUSADO,
    totalSolicitado,
    totalReembolsavel,
    totalNaoReembolsado: totalSolicitado - totalReembolsavel,
  };
}
