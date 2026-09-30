// Resultado do núcleo → objeto da saída JSON (seção 4 da spec, R-17).

import { formatarDecimal } from '../nucleo/dinheiro.ts';
import { statusDe } from '../nucleo/status.ts';
import type { Centavos, Resultado, ResultadoItem } from '../nucleo/tipos.ts';

/** Número JSON com duas casas, sem passar por float (R-04). */
function dinheiro(c: Centavos): unknown {
  return JSON.rawJSON(formatarDecimal(c));
}

function dinheiroOuNulo(c: Centavos | null): unknown {
  return c === null ? null : dinheiro(c);
}

/** Os 14 campos na ordem do exemplo da seção 4; os três de conversão saem juntos de `conversao` (AMB-043). */
function item(i: ResultadoItem) {
  const { conversao } = i;
  return {
    id: i.id,
    data: i.data,
    categoria: i.categoria,
    moeda: i.moeda,
    valor_original: dinheiroOuNulo(i.valorOriginal),
    // `taxa` é o `NumeroJson` do arquivo de câmbio: sai com o texto original (R-04).
    taxa_cambio: conversao === null ? null : conversao.taxa,
    data_cotacao: conversao === null ? null : conversao.dataCotacao,
    valor_solicitado: conversao === null ? null : dinheiro(conversao.valorSolicitado),
    valor_reembolsavel: dinheiro(i.valorReembolsavel),
    status: statusDe(i),
    limite_diario_aplicado: dinheiroOuNulo(i.limiteDiarioAplicado),
    em_viagem: i.emViagem,
    diarias: i.diarias,
    motivo: { codigo: i.motivo.codigo, descricao: i.motivo.descricao },
  };
}

/**
 * Objeto pronto para `serializarJson`, na ordem de campos da seção 4. Ecos
 * brutos (inclusive `NumeroJson`) são reemitidos como vieram pelo serializador.
 */
export function montarSaida(resultado: Resultado) {
  const { resumo } = resultado;
  return {
    colaborador: resultado.colaborador,
    periodo: resultado.periodo,
    politica: { versao: resultado.politica.versao, tabela: resultado.politica.tabela },
    itens: resultado.itens.map(item),
    resumo: {
      quantidade_itens: resumo.quantidadeItens,
      aprovados: resumo.aprovados,
      parciais: resumo.parciais,
      recusados: resumo.recusados,
      pendentes: resumo.pendentes,
      total_solicitado: dinheiro(resumo.totalSolicitado),
      total_reembolsavel: dinheiro(resumo.totalReembolsavel),
      total_pendente: dinheiro(resumo.totalPendente),
      total_nao_reembolsado: dinheiro(resumo.totalNaoReembolsado),
    },
  };
}
