// Apoio aos testes: monta despesas brutas como sairiam do leitor de JSON.

import { expect } from 'vitest';
import { lerJson } from '../src/io/json.ts';
import { validarDespesa } from '../src/nucleo/despesa.ts';
import { gerarParcelas } from '../src/nucleo/diarias.ts';
import { alocar } from '../src/nucleo/limites.ts';
import type { Alocacao } from '../src/nucleo/limites.ts';
import { calcularItens, passada1 } from '../src/nucleo/motor.ts';
import { statusDe } from '../src/nucleo/status.ts';
import { POLITICA } from '../src/nucleo/politica.ts';
import type { DespesaElegivel, DespesaValida, Entrada, ResultadoItem } from '../src/nucleo/tipos.ts';

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
export function entrada(
  despesas: (Record<string, unknown> | Cru)[],
  periodo: { inicio: string; fim: string } = PERIODO_PADRAO,
): Entrada {
  return {
    colaborador: { id: 'c-0001' },
    centroCusto: null,
    periodo,
    inicio: periodo.inicio,
    fim: periodo.fim,
    despesas: despesas.map((campos, i) => (campos instanceof Cru ? lerJson(campos.texto) : bruta({ id: `e-${i + 1}`, ...campos }))),
  };
}

/** Código de recusa de cada despesa na passada 1 do motor (`null` = elegível). */
export function codigosPassada1(e: Entrada): (string | null)[] {
  return passada1(e).map((a) => (a.tipo === 'elegivel' ? null : a.recusa.codigo));
}

/** `DespesaElegivel` a partir do padrão com `campos` trocados. */
export function elegivel(campos: Record<string, unknown> = {}, indice = 0): DespesaElegivel {
  const d = valida(campos, indice);
  expect(Object.hasOwn(POLITICA.limites, d.categoria), d.categoria).toBe(true);
  return d as DespesaElegivel;
}

/** Aloca o limite para despesas elegíveis montadas do padrão, na ordem dada. */
export function alocarDespesas(despesas: Record<string, unknown>[], diasDeViagem: ReadonlySet<string> = new Set()): Alocacao[] {
  return alocar(
    despesas.flatMap((campos, i) => gerarParcelas(elegivel({ id: `e-${i + 1}`, ...campos }, i))),
    diasDeViagem,
  );
}

/** Itens do motor para as despesas montadas do padrão (ver `entrada`). */
export function rodar(
  despesas: (Record<string, unknown> | Cru)[],
  periodo?: { inicio: string; fim: string },
): ResultadoItem[] {
  return calcularItens(entrada(despesas, periodo));
}

/** `[status, código, reembolsável]` de cada item do motor. */
export function decisoes(despesas: (Record<string, unknown> | Cru)[], periodo?: { inicio: string; fim: string }) {
  return rodar(despesas, periodo).map((i) => [statusDe(i), i.motivo.codigo, i.valorReembolsavel] as const);
}
