// Conversão para reais (RN-017, DT-007, R-13, R-14).

import { decimalDe, dividirMeioParaPar } from './decimal.ts';
import { NumeroJson } from './tipos.ts';
import type { Cambio, Centavos, Conversao, Cotacao, DataISO, Moeda } from './tipos.ts';

const TAXA_BRL = new NumeroJson('1');

/** Última cotação com `data ≤ dataDespesa` (busca binária por texto, R-05), ou `undefined`. */
function cotacaoAte(cotacoes: readonly Cotacao[], dataDespesa: DataISO): Cotacao | undefined {
  let inicio = 0;
  let fim = cotacoes.length; // procura o primeiro índice com data > dataDespesa
  while (inicio < fim) {
    const meio = (inicio + fim) >> 1;
    if (cotacoes[meio]!.data <= dataDespesa) inicio = meio + 1;
    else fim = meio;
  }
  return cotacoes[inicio - 1];
}

/**
 * `valorOriginal` (centavos na moeda da despesa) em reais. BRL: taxa 1, sem
 * data de cotação e sem olhar a data. Outra moeda: a cotação da data ou a
 * mais recente anterior, sem limite de dias (AMB-035), e o produto
 * arredondado meio para o par (AMB-037). Sem cotação até a data → `null`.
 */
export function converter(valorOriginal: Centavos, moeda: Moeda, data: DataISO, cambio: Cambio): Conversao | null {
  if (moeda === 'BRL') return { taxa: TAXA_BRL, dataCotacao: null, valorSolicitado: valorOriginal };
  const cotacao = cotacaoAte(cambio.get(moeda) ?? [], data);
  if (!cotacao) return null;
  const { digitos, escala } = decimalDe(cotacao.taxa.texto)!;
  return {
    taxa: cotacao.taxa,
    dataCotacao: cotacao.data,
    valorSolicitado: dividirMeioParaPar(valorOriginal * digitos, 10n ** BigInt(escala)),
  };
}
