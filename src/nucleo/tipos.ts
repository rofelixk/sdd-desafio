// Tipos do núcleo (data-model.md). Nenhuma regra nasce aqui.

/** Dinheiro em centavos inteiros (R-02). */
export type Centavos = bigint;

/** Texto `AAAA-MM-DD` já validado (R-05). */
export type DataISO = string;

/** Categoria normalizada (RN-002); reconhecida quando é chave da tabela aplicável (R-15). */
export type Categoria = string;

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
  /** `colaborador.centro_custo` como veio; ausente, nulo ou vazio → `null` (RN-015, AMB-032). */
  readonly centroCusto: string | null;
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
  /** RN-003, AMB-036: normalizada; ausente, nula ou vazia → `BRL`. */
  readonly moeda: Moeda;
  /** RN-001, na moeda da despesa. */
  readonly valorOriginal: Centavos;
  /** Etapa 1 (RN-017, DT-007). `null` aqui só por falta de cotação (a recusa vem na etapa 6). */
  readonly conversao: Conversao | null;
  /** RN-003. */
  readonly temNotaFiscal: boolean;
}

/** Despesa que passou das etapas 3 a 8: com conversão e com a regra da sua categoria na tabela aplicável. */
export interface DespesaElegivel extends Omit<DespesaValida, 'conversao'> {
  readonly conversao: Conversao;
  readonly regra: RegraCategoria;
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
  | 'CAMBIO_INDISPONIVEL'
  | 'DUPLICATA'
  | 'NOTA_FISCAL_AUSENTE';

/** Códigos da etapa de limite (seção 8, etapa 9). */
export type CodigoLimite = 'APROVADO_INTEGRAL' | 'LIMITE_DIARIO_EXCEDIDO' | 'LIMITE_DIARIO_ESGOTADO';

/** Códigos de recusa das etapas 1 a 7 (seção 8 da spec). */
export type CodigoRecusa = Exclude<CodigoMotivo, CodigoLimite>;

/** Por que a RN-003 recusou. */
export type ProblemaDado =
  | 'nao_objeto'
  | 'ausente'
  | 'data_invalida'
  | 'nao_numerico'
  | 'nao_booleano'
  | 'nao_textual'
  | 'repetido';

/** Recusa de uma etapa, com os dados para a descrição do motivo (RN-013). */
export type Recusa =
  | { readonly codigo: 'DADO_INVALIDO'; readonly detalhes: { readonly campo: string; readonly problema: ProblemaDado } }
  | {
      readonly codigo: 'VALOR_NAO_POSITIVO';
      /** `emReais`: o valor convertido, quando há conversão (RN-004). */
      readonly detalhes: { readonly valorOriginal: Centavos; readonly moeda: Moeda; readonly emReais: Centavos | null };
    }
  | {
      readonly codigo: 'FORA_DO_PERIODO';
      readonly detalhes: { readonly data: DataISO; readonly inicio: DataISO; readonly fim: DataISO };
    }
  | {
      readonly codigo: 'CATEGORIA_NAO_REEMBOLSAVEL';
      readonly detalhes: {
        readonly categoria: string;
        /** Nome da tabela aplicada e versão da política. */
        readonly tabela: string;
        readonly versao: string;
        /** Fora da tabela aplicável, ou com limite 0 no centro de custo (RN-006, AMB-031). */
        readonly caso: 'ausente' | 'limite_zero';
        readonly centroCusto: string | null;
      };
    }
  | { readonly codigo: 'CAMBIO_INDISPONIVEL'; readonly detalhes: { readonly moeda: Moeda; readonly data: DataISO } }
  | { readonly codigo: 'DUPLICATA'; readonly detalhes: { readonly idAceito: string } }
  | { readonly codigo: 'NOTA_FISCAL_AUSENTE'; readonly detalhes: { readonly valor: Centavos; readonly limiar: Decimal } };

/** Recusa da RN-003: leva os ecos brutos, o valor, se numérico, e a conversão, se possível (AMB-023, AMB-043). */
export type RecusaDadoInvalido = Extract<Recusa, { codigo: 'DADO_INVALIDO' }> & {
  /** Como vieram; ausente → `null`. */
  readonly eco: { readonly id: unknown; readonly data: unknown; readonly categoria: unknown; readonly moeda: unknown };
  /** Nulo se `valor` não é numérico. */
  readonly valorOriginal: Centavos | null;
  /** Nula se `valor` não é numérico, se a moeda não é texto, ou sem data válida/cotação numa moeda estrangeira. */
  readonly conversao: Conversao | null;
};

/** Decisão da etapa de limite, com os números para a descrição (RN-013). */
export interface DecisaoLimite {
  readonly codigo: CodigoLimite;
  readonly detalhes: {
    readonly categoria: Categoria;
    readonly periodicidade: Periodicidade;
    readonly data: DataISO;
    readonly diarias: number;
    readonly limite: Centavos;
    readonly saldoDisponivel: Centavos;
    readonly saldoApos: Centavos;
    readonly solicitado: Centavos;
    readonly reembolsavel: Centavos;
  };
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
  /** Normalizada; em `DADO_INVALIDO` sai como veio (ausente → `null`). */
  readonly moeda: unknown;
  /** Nulo só com `valor` não numérico (AMB-023). */
  readonly valorOriginal: Centavos | null;
  /** Os três campos de conversão da saída saem daqui, juntos (AMB-043, R-17). */
  readonly conversao: Conversao | null;
  /** Em reais: `conversao?.valorSolicitado ?? null`, montado só pelo motor. */
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
  /** `versao` da tabela de limites e a tabela aplicada (RN-016). */
  readonly politica: { readonly versao: string; readonly tabela: string };
  readonly itens: readonly ResultadoItem[];
  readonly resumo: Resumo;
}

// ---------------------------------------------------------------------------
// Política v4 (data-model.md §2 e §3)
// ---------------------------------------------------------------------------

/** Número exato do arquivo: `digitos × 10^−escala` (R-13). */
export interface Decimal {
  readonly digitos: bigint;
  readonly escala: number;
}

/** Código de moeda em maiúsculas, sem espaços nas bordas (R-06). */
export type Moeda = string;

/** `dia`: limite por data (RN-009); `diaria`: limite por noite (RN-012). */
export type Periodicidade = 'dia' | 'diaria';

export interface RegraCategoria {
  readonly limite: Centavos;
  readonly periodicidade: Periodicidade;
}

/** Categoria normalizada (RN-002) → regra. */
export type TabelaCategorias = ReadonlyMap<string, RegraCategoria>;

/** Tabela de limites válida (RN-016, AMB-044). */
export interface Politica {
  readonly versao: string;
  /** Só validada (AMB-034). */
  readonly vigencia: DataISO;
  readonly padrao: TabelaCategorias;
  /** Nome normalizado → nome como está escrito e as categorias do centro de custo. */
  readonly centrosCusto: ReadonlyMap<string, { readonly nome: string; readonly categorias: TabelaCategorias }>;
  /** RN-008. */
  readonly limiarNotaFiscal: Decimal;
  /** RN-011, AMB-033. */
  readonly acrescimoViagemPercentual: Decimal;
}

/** Taxa publicada numa data; o texto original sai na saída (R-04). */
export interface Cotacao {
  readonly data: DataISO;
  readonly taxa: NumeroJson;
}

/** Índice do câmbio: moeda → cotações em ordem crescente de data (R-14). */
export type Cambio = ReadonlyMap<Moeda, readonly Cotacao[]>;

/** Tabela montada uma vez por execução (RN-016). */
export interface TabelaAplicavel {
  /** `"padrao"` ou o centro de custo como está na tabela (`politica.tabela`). */
  readonly nome: string;
  readonly versao: string;
  /** Nome do centro de custo quando há entrada na tabela (RN-006). */
  readonly centroCusto: string | null;
  readonly categorias: ReadonlyMap<string, RegraCategoria & { readonly origem: 'centro_custo' | 'padrao' }>;
  readonly limiarNotaFiscal: Decimal;
  readonly acrescimoViagemPercentual: Decimal;
}

/** Conversão para reais (RN-017); os três campos andam juntos (AMB-043). */
export interface Conversao {
  /** Do câmbio; `1` em BRL. */
  readonly taxa: NumeroJson;
  /** `null` em BRL. */
  readonly dataCotacao: DataISO | null;
  /** Em reais, meio para o par (AMB-037). */
  readonly valorSolicitado: Centavos;
}
