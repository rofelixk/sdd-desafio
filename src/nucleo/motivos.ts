// Justificativa de cada item (RN-013): um modelo de texto por código da seção 4.

import { formatarReais, formatarReaisDecimal } from './dinheiro.ts';
import type { Categoria, CodigoLimite, CodigoMotivo, DecisaoLimite, Motivo, ProblemaDado, Recusa } from './tipos.ts';

/** O que decidiu o item: a recusa de uma etapa ou a decisão do limite. */
export type Decisao = Recusa | DecisaoLimite;

type DetalhesDe<C extends CodigoMotivo> = C extends CodigoLimite
  ? DecisaoLimite['detalhes']
  : Extract<Recusa, { codigo: C }>['detalhes'];

type Modelos = { [C in CodigoMotivo]: (detalhes: DetalhesDe<C>) => string };

/** Só apresentação (R-15): categoria fora do mapa aparece pela própria chave. */
const NOMES_CATEGORIA: Readonly<Record<string, string>> = {
  alimentacao: 'alimentação',
  transporte_urbano: 'transporte urbano',
  hospedagem: 'hospedagem',
  representacao: 'representação',
};

function nomeCategoria(categoria: Categoria): string {
  return Object.hasOwn(NOMES_CATEGORIA, categoria) ? NOMES_CATEGORIA[categoria]! : categoria;
}

const PROBLEMA: Record<ProblemaDado, (campo: string) => string> = {
  nao_objeto: () => 'A despesa não é um objeto com os campos esperados.',
  ausente: (campo) => `Campo obrigatório '${campo}' ausente, vazio ou com tipo diferente de texto.`,
  data_invalida: () => "Campo 'data' não é uma data de calendário válida no formato AAAA-MM-DD.",
  nao_numerico: () => "Campo 'valor' não é numérico.",
  nao_booleano: () => "Campo 'tem_nota_fiscal' não é booleano (true ou false).",
  repetido: () => "O 'id' repete o de uma despesa anterior do arquivo.",
};

/** Limite da categoria na data; na periodicidade `diaria`, por diária e com o período das noites. */
function limiteDoDia(d: DecisaoLimite['detalhes']): string {
  const nome = nomeCategoria(d.categoria);
  if (d.periodicidade !== 'diaria') return `Limite diário de ${nome} ${formatarReais(d.limite)} em ${d.data}`;
  const noites = d.diarias === 1 ? `1 diária em ${d.data}` : `${d.diarias} diárias a partir de ${d.data}`;
  return `Limite de ${nome} ${formatarReais(d.limite)} por diária (${noites})`;
}

export const MODELOS: Modelos = {
  APROVADO_INTEGRAL: (d) =>
    d.periodicidade === 'diaria'
      ? `Dentro do limite de ${nomeCategoria(d.categoria)} (${formatarReais(d.limite)} por diária, ${d.diarias === 1 ? '1 diária' : `${d.diarias} diárias`}); saldo após este item: ${formatarReais(d.saldoApos)}.`
      : `Dentro do limite diário de ${nomeCategoria(d.categoria)} (${formatarReais(d.limite)}); saldo do dia após este item: ${formatarReais(d.saldoApos)}.`,
  LIMITE_DIARIO_EXCEDIDO: (d) =>
    `${limiteDoDia(d)}; saldo disponível ${formatarReais(d.saldoDisponivel)}; excedente de ${formatarReais(d.solicitado - d.reembolsavel)} não reembolsado.`,
  LIMITE_DIARIO_ESGOTADO: (d) =>
    `${limiteDoDia(d)} já esgotado por despesas anteriores; saldo disponível ${formatarReais(d.saldoDisponivel)}; ${formatarReais(d.solicitado)} não reembolsado.`,
  DADO_INVALIDO: (d) => PROBLEMA[d.problema](d.campo),
  VALOR_NAO_POSITIVO: (d) =>
    `Valor solicitado ${formatarReais(d.valor)} não é positivo; estornos e valores zerados não são reembolsados.`,
  FORA_DO_PERIODO: (d) => `Data ${d.data} fora do período de ${d.inicio} a ${d.fim}.`,
  CATEGORIA_NAO_REEMBOLSAVEL: (d) =>
    d.caso === 'limite_zero'
      ? `Categoria '${d.categoria}' não é reembolsável no centro de custo ${d.centroCusto} (limite 0 na política ${d.versao}).`
      : d.centroCusto === null
        ? `Categoria '${d.categoria}' não consta na tabela padrão da política ${d.versao}.`
        : `Categoria '${d.categoria}' não consta na tabela do centro de custo ${d.centroCusto} nem na tabela padrão da política ${d.versao}.`,
  DUPLICATA: (d) =>
    `Mesma data, categoria, fornecedor e valor da despesa '${d.idAceito}', que já foi considerada; este lançamento repetido não é reembolsado.`,
  NOTA_FISCAL_AUSENTE: (d) =>
    `Valor ${formatarReais(d.valor)} acima de ${formatarReaisDecimal(d.limiar)} exige nota fiscal, que não foi informada.`,
};

export function montarMotivo(decisao: Decisao): Motivo {
  const modelo = MODELOS[decisao.codigo] as (detalhes: Decisao['detalhes']) => string;
  return { codigo: decisao.codigo, descricao: modelo(decisao.detalhes) };
}
