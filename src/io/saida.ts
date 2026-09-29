// Resultado do núcleo → objeto da saída JSON (seção 4 da spec).

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

function item(i: ResultadoItem) {
  return {
    id: i.id,
    data: i.data,
    categoria: i.categoria,
    valor_solicitado: dinheiroOuNulo(i.valorSolicitado),
    valor_reembolsavel: dinheiro(i.valorReembolsavel),
    status: statusDe(i),
    motivo: { codigo: i.motivo.codigo, descricao: i.motivo.descricao },
    limite_diario_aplicado: dinheiroOuNulo(i.limiteDiarioAplicado),
    em_viagem: i.emViagem,
    diarias: i.diarias,
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
    itens: resultado.itens.map(item),
    resumo: {
      quantidade_itens: resumo.quantidadeItens,
      aprovados: resumo.aprovados,
      parciais: resumo.parciais,
      recusados: resumo.recusados,
      total_solicitado: dinheiro(resumo.totalSolicitado),
      total_reembolsavel: dinheiro(resumo.totalReembolsavel),
      total_nao_reembolsado: dinheiro(resumo.totalNaoReembolsado),
    },
  };
}
