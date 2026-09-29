// Tipos do núcleo (data-model.md). Nenhuma regra nasce aqui.

import type { POLITICA } from './politica.ts';

/** Dinheiro em centavos inteiros (R-02). */
export type Centavos = bigint;

/** Texto `AAAA-MM-DD` já validado (R-05). */
export type DataISO = string;

/** Categorias reconhecidas: as chaves de `POLITICA.limites` (RN-006, plan §4). */
export type Categoria = keyof typeof POLITICA.limites;

/**
 * Número como apareceu no arquivo, ex.: `{ texto: "33.333" }` (R-03).
 * Classe para distinguir de um objeto `{"texto": ...}` vindo da entrada.
 */
export class NumeroJson {
  readonly texto: string;

  constructor(texto: string) {
    this.texto = texto;
  }
}

/** Arquivo de entrada válido (RN-015). */
export interface Entrada {
  /** Eco integral. */
  readonly colaborador: unknown;
  /** Eco integral. */
  readonly periodo: unknown;
  readonly inicio: DataISO;
  readonly fim: DataISO;
  /** Cada elemento é bruto (RN-003, AMB-023). */
  readonly despesas: readonly unknown[];
}

/** Despesa que passou da RN-003 (etapas 1-2). */
export interface DespesaValida {
  /** Posição na entrada: ordem da RN-007 e da RN-010. */
  readonly indice: number;
  readonly id: string;
  /** AMB-024, AMB-025. */
  readonly idNormalizado: string;
  readonly data: DataISO;
  readonly categoriaOriginal: string;
  /** RN-002. Ainda pode ser desconhecida (RN-006). */
  readonly categoria: string;
  /** RN-003, AMB-026. Fonte do N na hospedagem (RN-012). */
  readonly descricao: string;
  /** RN-003, AMB-026, RN-007. */
  readonly fornecedorChave: string;
  /** RN-001. */
  readonly valorSolicitado: Centavos;
  /** RN-003. */
  readonly temNotaFiscal: boolean;
}

/** Despesa que passou das etapas 3 a 7. */
export interface DespesaElegivel extends Omit<DespesaValida, 'categoria'> {
  readonly categoria: Categoria;
  /** Só em hospedagem (RN-012). */
  readonly diarias?: number;
}

/** Códigos de motivo da seção 4 da spec. */
export type CodigoMotivo =
  | 'APROVADO_INTEGRAL'
  | 'LIMITE_DIARIO_EXCEDIDO'
  | 'LIMITE_DIARIO_ESGOTADO'
  | 'DADO_INVALIDO'
  | 'VALOR_NAO_POSITIVO'
  | 'FORA_DO_PERIODO'
  | 'CATEGORIA_NAO_REEMBOLSAVEL'
  | 'DUPLICATA'
  | 'NOTA_FISCAL_AUSENTE';

/** Códigos de recusa das etapas 1 a 7 (seção 8 da spec). */
export type CodigoRecusa = Exclude<
  CodigoMotivo,
  'APROVADO_INTEGRAL' | 'LIMITE_DIARIO_EXCEDIDO' | 'LIMITE_DIARIO_ESGOTADO'
>;

export interface Recusa {
  readonly codigo: CodigoRecusa;
  /** Dados para a descrição (ex.: `idAceito` da duplicata, datas do período). */
  readonly detalhes: Readonly<Record<string, unknown>>;
}

/** Fatia de despesa elegível que consome limite de uma data (RN-012). */
export interface Parcela {
  readonly indiceDespesa: number;
  readonly data: DataISO;
  readonly categoria: Categoria;
  readonly valor: Centavos;
}

export interface Motivo {
  readonly codigo: CodigoMotivo;
  readonly descricao: string;
}

/** Derivado de (reembolsável, solicitado); nunca guardado no item. */
export type Status = 'APROVADO' | 'PARCIAL' | 'RECUSADO';

/** Um por despesa, na ordem da entrada (seção 4 da spec). */
export interface ResultadoItem {
  /** Eco bruto: em `DADO_INVALIDO` sai como veio. */
  readonly id: unknown;
  readonly data: unknown;
  readonly categoria: unknown;
  /** Nulo só em `DADO_INVALIDO` com `valor` não numérico (AMB-023). */
  readonly valorSolicitado: Centavos | null;
  readonly valorReembolsavel: Centavos;
  readonly motivo: Motivo;
  readonly limiteDiarioAplicado: Centavos | null;
  readonly emViagem: boolean | null;
  readonly diarias: number | null;
}

/** RN-014. */
export interface Resumo {
  readonly quantidadeItens: number;
  readonly aprovados: number;
  readonly parciais: number;
  readonly recusados: number;
  readonly totalSolicitado: Centavos;
  readonly totalReembolsavel: Centavos;
  readonly totalNaoReembolsado: Centavos;
}

export interface Resultado {
  readonly colaborador: unknown;
  readonly periodo: unknown;
  readonly itens: readonly ResultadoItem[];
  readonly resumo: Resumo;
}
