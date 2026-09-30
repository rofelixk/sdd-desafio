// Apoio aos testes: monta despesas brutas como sairiam do leitor de JSON, com
// a tabela de limites da fixture da v4 (R-10).

import { readFileSync } from 'node:fs';
import { expect } from 'vitest';
import { lerJson } from '../src/io/json.ts';
import { lerPolitica } from '../src/io/politica.ts';
import { validarDespesa } from '../src/nucleo/despesa.ts';
import { gerarParcelas } from '../src/nucleo/diarias.ts';
import { alocar } from '../src/nucleo/limites.ts';
import type { Alocacao } from '../src/nucleo/limites.ts';
import { calcular, calcularItens, passada1 } from '../src/nucleo/motor.ts';
import { tabelaAplicavel } from '../src/nucleo/politica.ts';
import { statusDe } from '../src/nucleo/status.ts';
import type {
  DespesaElegivel,
  DespesaValida,
  Entrada,
  Politica,
  Resultado,
  ResultadoItem,
  TabelaAplicavel,
} from '../src/nucleo/tipos.ts';

/** Texto da tabela de limites da fixture da v4 (R-10: nunca `dados/`). */
export const TEXTO_POLITICA_V4 = readFileSync('exemplos/envelope/politica-v4.json', 'utf8');

/** Tabela de limites da fixture da v4. */
export const POLITICA_V4 = lerPolitica(TEXTO_POLITICA_V4);

/** Tabela de limites da fixture com `trocar` aplicado ao JSON (ex.: um limite alterado). */
export function politicaCom(trocar: (json: Record<string, any>) => void): Politica {
  const json = JSON.parse(TEXTO_POLITICA_V4);
  trocar(json);
  return lerPolitica(JSON.stringify(json));
}

/** O que muda em relação ao cenário padrão (tabela padrão da v4, período de julho). */
export interface Opcoes {
  readonly periodo?: { inicio: string; fim: string };
  readonly centroCusto?: string | null;
  readonly politica?: Politica;
}

/** Tabela aplicável da fixture para as `opcoes` (sem centro de custo: a padrão). */
export function tabela(opcoes: Opcoes = {}): TabelaAplicavel {
  return tabelaAplicavel(opcoes.politica ?? POLITICA_V4, opcoes.centroCusto ?? null);
}

/** Tabela padrão da v4 (mesmos valores da v3). */
export const TABELA_PADRAO = tabela();

export const DESPESA_PADRAO = {
  id: 'd-001',
  data: '2026-07-03',
  categoria: 'alimentacao',
  descricao: 'Almoco',
  fornecedor: 'Tavola',
  valor: 45,
  tem_nota_fiscal: true,
} as const;

/** Despesa bruta: o padrão com `campos` trocados (`undefined` remove o campo), passada pelo `lerJson`. */
export function bruta(campos: Record<string, unknown> = {}): unknown {
  return lerJson(JSON.stringify({ ...DESPESA_PADRAO, ...campos }));
}

/** `DespesaValida` a partir do padrão com `campos` trocados. */
export function valida(campos: Record<string, unknown> = {}, indice = 0): DespesaValida {
  const r = validarDespesa(bruta(campos), indice);
  expect('codigo' in r, JSON.stringify(r, (_k, v: unknown) => (typeof v === 'bigint' ? String(v) : v))).toBe(false);
  return r as DespesaValida;
}

export const PERIODO_PADRAO = { inicio: '2026-07-01', fim: '2026-07-31' } as const;

/** Item de `despesas` que vai para a entrada sem ser completado pelo padrão. */
export class Cru {
  readonly texto: string;

  constructor(texto: string) {
    this.texto = texto;
  }
}

/** Item cru, escrito como texto JSON (ex.: `cru('42')`). */
export function cru(texto: string): Cru {
  return new Cru(texto);
}

/**
 * `Entrada` com as despesas do padrão com `campos` trocados; sem `id`
 * explícito, cada uma recebe `e-1`, `e-2`...
 */
export function entrada(despesas: (Record<string, unknown> | Cru)[], opcoes: Opcoes = {}): Entrada {
  const periodo = opcoes.periodo ?? PERIODO_PADRAO;
  const centroCusto = opcoes.centroCusto ?? null;
  return {
    colaborador: centroCusto === null ? { id: 'c-0001' } : { id: 'c-0001', centro_custo: centroCusto },
    centroCusto,
    periodo,
    inicio: periodo.inicio,
    fim: periodo.fim,
    despesas: despesas.map((campos, i) => (campos instanceof Cru ? lerJson(campos.texto) : bruta({ id: `e-${i + 1}`, ...campos }))),
  };
}

/** Resultado do motor para uma `Entrada` (com o centro de custo dela), com a fixture da v4. */
export function calcularV4(e: Entrada, opcoes: Pick<Opcoes, 'politica'> = {}): Resultado {
  return calcular(e, opcoes.politica ?? POLITICA_V4);
}

/** Código de recusa de cada despesa na passada 1 do motor (`null` = elegível). */
export function codigosPassada1(e: Entrada, opcoes: Opcoes = {}): (string | null)[] {
  return passada1(e, tabela(opcoes)).map((a) => (a.tipo === 'elegivel' ? null : a.recusa.codigo));
}

/** `DespesaElegivel` a partir do padrão com `campos` trocados, com a regra da tabela aplicável. */
export function elegivel(campos: Record<string, unknown> = {}, indice = 0, opcoes: Opcoes = {}): DespesaElegivel {
  const d = valida(campos, indice);
  const regra = tabela(opcoes).categorias.get(d.categoria);
  expect(regra, d.categoria).toBeDefined();
  return { ...d, regra: regra! };
}

/** Aloca o limite para despesas elegíveis montadas do padrão, na ordem dada. */
export function alocarDespesas(
  despesas: Record<string, unknown>[],
  diasDeViagem: ReadonlySet<string> = new Set(),
  opcoes: Opcoes = {},
): Alocacao[] {
  return alocar(
    despesas.flatMap((campos, i) => gerarParcelas(elegivel({ id: `e-${i + 1}`, ...campos }, i, opcoes))),
    diasDeViagem,
    tabela(opcoes),
  );
}

/** Itens do motor para as despesas montadas do padrão (ver `entrada`). */
export function rodar(despesas: (Record<string, unknown> | Cru)[], opcoes: Opcoes = {}): ResultadoItem[] {
  return calcularItens(entrada(despesas, opcoes), tabela(opcoes));
}

/** `[status, código, reembolsável]` de cada item do motor. */
export function decisoes(despesas: (Record<string, unknown> | Cru)[], opcoes: Opcoes = {}) {
  return rodar(despesas, opcoes).map((i) => [statusDe(i), i.motivo.codigo, i.valorReembolsavel] as const);
}
