// Apoio aos testes: monta despesas brutas como sairiam do leitor de JSON.

import { expect } from 'vitest';
import { lerJson } from '../src/io/json.ts';
import { validarDespesa } from '../src/nucleo/despesa.ts';
import type { DespesaValida } from '../src/nucleo/tipos.ts';

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
