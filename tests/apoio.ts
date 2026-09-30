// Apoio aos testes: monta despesas brutas como sairiam do leitor de JSON, com
// a tabela de limites da fixture da v4 (R-10).

import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect } from 'vitest';
import { lerCambio } from '../src/io/cambio.ts';
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
  Cambio,
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

/** Câmbio da fixture da v4 (R-10: nunca `dados/`). */
export const CAMBIO_V4 = lerCambio(readFileSync('exemplos/envelope/cambio.json', 'utf8'));

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
  readonly cambio?: Cambio;
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
  const r = validarDespesa(bruta(campos), indice, new Set(), CAMBIO_V4);
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
export function calcularV4(e: Entrada, opcoes: Pick<Opcoes, 'politica' | 'cambio'> = {}): Resultado {
  return calcular(e, opcoes.politica ?? POLITICA_V4, opcoes.cambio ?? CAMBIO_V4);
}

/** Código de recusa de cada despesa na passada 1 do motor (`null` = elegível). */
export function codigosPassada1(e: Entrada, opcoes: Opcoes = {}): (string | null)[] {
  return passada1(e, tabela(opcoes), opcoes.cambio ?? CAMBIO_V4).map((a) => (a.tipo === 'elegivel' ? null : a.recusa.codigo));
}

/** `DespesaElegivel` a partir do padrão com `campos` trocados, com a regra da tabela aplicável. */
export function elegivel(campos: Record<string, unknown> = {}, indice = 0, opcoes: Opcoes = {}): DespesaElegivel {
  const d = valida(campos, indice);
  const regra = tabela(opcoes).categorias.get(d.categoria);
  expect(regra, d.categoria).toBeDefined();
  expect(d.conversao, d.moeda).not.toBeNull();
  return { ...d, conversao: d.conversao!, regra: regra! };
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
  return calcularItens(entrada(despesas, opcoes), tabela(opcoes), opcoes.cambio ?? CAMBIO_V4);
}

/** `[status, código, reembolsável]` de cada item do motor. */
export function decisoes(despesas: (Record<string, unknown> | Cru)[], opcoes: Opcoes = {}) {
  return rodar(despesas, opcoes).map((i) => [statusDe(i), i.motivo.codigo, i.valorReembolsavel] as const);
}

// ---------------------------------------------------------------------------
// CLI em processo filho (R-11): o projeto, ou uma cópia com dados/ trocado
// ---------------------------------------------------------------------------

/** Raiz do repositório. */
export const RAIZ = resolve('.');

/**
 * Copia `src/`, `dados/` e `package.json` para uma pasta temporária (é o que
 * o README ensina para testar outra tabela). Devolve a raiz da cópia; quem
 * chama remove a pasta.
 */
export function copiaDoProjeto(): string {
  const raiz = mkdtempSync(join(tmpdir(), 'reembolso-copia-'));
  for (const item of ['src', 'dados', 'package.json']) cpSync(join(RAIZ, item), join(raiz, item), { recursive: true });
  return raiz;
}

/** Roda `node <raiz>/src/cli.ts ...args` a partir de `cwd`. */
export function rodarCli(args: string[], { raiz = RAIZ, cwd = RAIZ, env = {} }: { raiz?: string; cwd?: string; env?: Record<string, string> } = {}) {
  const r = spawnSync(process.execPath, [join(raiz, 'src', 'cli.ts'), ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  return { codigo: r.status, stdout: r.stdout, stderr: r.stderr };
}
