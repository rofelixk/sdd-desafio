// Etapas 3 a 8 da seção 8. Cada função devolve a recusa da etapa ou `null`;
// a ordem das etapas vive só no `motor.ts` (DT-002).

import type { Centavos, DataISO, Decimal, DespesaValida, Recusa, TabelaAplicavel } from './tipos.ts';

/**
 * Etapa 3 (RN-004, AMB-012): valor original ≤ 0, mesmo sem cotação, ou valor
 * em reais que arredonda para ≤ 0.
 */
export function verificarValorPositivo(d: DespesaValida): Recusa | null {
  const emReais = d.conversao?.valorSolicitado ?? null;
  return d.valorOriginal <= 0n || (emReais !== null && emReais <= 0n)
    ? { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valorOriginal: d.valorOriginal, moeda: d.moeda, emReais } }
    : null;
}

/** Etapa 4 (RN-005, AMB-009, AMB-010): `[inicio, fim]`, inclusive. */
export function verificarPeriodo(d: DespesaValida, inicio: DataISO, fim: DataISO): Recusa | null {
  return d.data < inicio || d.data > fim
    ? { codigo: 'FORA_DO_PERIODO', detalhes: { data: d.data, inicio, fim } }
    : null;
}

/** Categoria reconhecida: chave da tabela aplicável (RN-002, RN-006, R-15). */
export function ehCategoria(categoria: string, tabela: TabelaAplicavel): boolean {
  return tabela.categorias.has(categoria);
}

/**
 * Etapa 5 (RN-006, AMB-019, AMB-031): reembolsável é a categoria com limite
 * maior que zero na tabela aplicável; sem reclassificar.
 */
export function verificarCategoria(d: DespesaValida, tabela: TabelaAplicavel): Recusa | null {
  const regra = tabela.categorias.get(d.categoria);
  if (regra && regra.limite > 0n) return null;
  return {
    codigo: 'CATEGORIA_NAO_REEMBOLSAVEL',
    detalhes: {
      categoria: regra ? d.categoria : d.categoriaOriginal,
      tabela: tabela.nome,
      versao: tabela.versao,
      caso: regra ? 'limite_zero' : 'ausente',
      centroCusto: tabela.centroCusto,
    },
  };
}

/** Etapa 6 (RN-017, AMB-036, AMB-039): sem cotação até a data. */
export function verificarCambio(d: DespesaValida): Recusa | null {
  return d.conversao === null ? { codigo: 'CAMBIO_INDISPONIVEL', detalhes: { moeda: d.moeda, data: d.data } } : null;
}

/** Chave da RN-007 → `id` da primeira ocorrência. */
export type ChavesDuplicata = Map<string, string>;

/**
 * Etapa 7 (RN-007, AMB-011, AMB-026, AMB-038): mesma data, categoria
 * normalizada, fornecedor (`trim` + minúsculas; vazio é um valor), moeda
 * normalizada e valor original. A primeira ocorrência é registrada em
 * `aceitas` e segue; as seguintes são recusadas.
 */
export function verificarDuplicata(d: DespesaValida, aceitas: ChavesDuplicata): Recusa | null {
  const chave = JSON.stringify([d.data, d.categoria, d.fornecedorChave, d.moeda, d.valorOriginal.toString()]);
  const idAceito = aceitas.get(chave);
  if (idAceito !== undefined) return { codigo: 'DUPLICATA', detalhes: { idAceito } };
  aceitas.set(chave, d.id);
  return null;
}

/** `valor` (centavos) > `limiar` (reais), exato, sem arredondar (R-13). */
function acimaDe(valor: Centavos, limiar: Decimal): boolean {
  return valor * 10n ** BigInt(limiar.escala) > limiar.digitos * 100n;
}

/**
 * Etapa 8 (RN-008, AMB-004 a AMB-006, AMB-038): valor em reais estritamente
 * acima do limiar da tabela, sem nota. Só chega aqui despesa com conversão (etapa 6).
 */
export function verificarNotaFiscal(d: DespesaValida, tabela: TabelaAplicavel): Recusa | null {
  const emReais = d.conversao!.valorSolicitado;
  return acimaDe(emReais, tabela.limiarNotaFiscal) && !d.temNotaFiscal
    ? { codigo: 'NOTA_FISCAL_AUSENTE', detalhes: { valor: emReais, limiar: tabela.limiarNotaFiscal } }
    : null;
}
