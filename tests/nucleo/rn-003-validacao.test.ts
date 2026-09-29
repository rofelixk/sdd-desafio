import { describe, expect, it } from 'vitest';
import { lerJson } from '../../src/io/json.ts';
import { validarDespesa } from '../../src/nucleo/despesa.ts';
import { comoTexto } from '../../src/nucleo/texto.ts';
import { NumeroJson } from '../../src/nucleo/tipos.ts';
import type { DespesaValida, RecusaDadoInvalido } from '../../src/nucleo/tipos.ts';

/** Despesa válida com os campos trocados por `trocas` (texto JSON de cada valor; `undefined` remove o campo). */
function despesa(trocas: Record<string, string | undefined> = {}): unknown {
  const campos: Record<string, string | undefined> = {
    id: '"d-001"',
    data: '"2026-07-03"',
    categoria: '"alimentacao"',
    descricao: '"Almoco"',
    fornecedor: '"Tavola"',
    valor: '45.00',
    tem_nota_fiscal: 'true',
    ...trocas,
  };
  const pares = Object.entries(campos)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `"${k}": ${v}`);
  return lerJson(`{${pares.join(', ')}}`);
}

function validar(bruta: unknown): DespesaValida | RecusaDadoInvalido {
  return validarDespesa(bruta, 0);
}

function recusada(r: DespesaValida | RecusaDadoInvalido): RecusaDadoInvalido {
  expect('codigo' in r && r.codigo).toBe('DADO_INVALIDO');
  return r as RecusaDadoInvalido;
}

function valida(r: DespesaValida | RecusaDadoInvalido): DespesaValida {
  expect('codigo' in r).toBe(false);
  return r as DespesaValida;
}

describe('RN-003 — Validação dos dados do item', () => {
  it('RN-003 › fornecedor/descricao como texto: ausente e null → "", 123 → "123", true → "true", [1, 2] → "[1,2]"', () => {
    const bruto = lerJson('{"n": 123, "b": true, "l": [1, 2], "o": {"a": 1.50}, "x": null, "t": " Café "}') as Record<string, unknown>;
    expect(comoTexto(undefined)).toBe('');
    expect(comoTexto(bruto.x)).toBe('');
    expect(comoTexto(bruto.n)).toBe('123');
    expect(comoTexto(bruto.b)).toBe('true');
    expect(comoTexto(false)).toBe('false');
    expect(comoTexto(bruto.l)).toBe('[1,2]');
    expect(comoTexto(bruto.o)).toBe('{"a":1.50}');
    expect(comoTexto(bruto.t)).toBe(' Café ');
  });

  it('RN-003 › "data": "2026-07-32" → DADO_INVALIDO com data "2026-07-32" no eco', () => {
    const r = recusada(validar(despesa({ data: '"2026-07-32"' })));
    expect(r.eco.data).toBe('2026-07-32');
    expect(r.valorSolicitado).toBe(4500n);
  });

  it('RN-003 › id, data, categoria ou valor ausentes → DADO_INVALIDO', () => {
    for (const campo of ['id', 'data', 'categoria', 'valor']) {
      const r = recusada(validar(despesa({ [campo]: undefined })));
      expect(r.detalhes.campo, campo).toBe(campo);
    }
    expect(recusada(validar(despesa({ id: undefined }))).eco.id).toBeNull();
  });

  it('RN-003 › id, data ou categoria nulos, vazios ou só com espaços → DADO_INVALIDO', () => {
    for (const campo of ['id', 'data', 'categoria']) {
      for (const valor of ['null', '""', '"   "']) {
        const r = recusada(validar(despesa({ [campo]: valor })));
        expect(r.detalhes.campo, `${campo} = ${valor}`).toBe(campo);
      }
    }
  });

  it('RN-003 › "categoria": "" e "categoria": 123 → DADO_INVALIDO, e não CATEGORIA_NAO_REEMBOLSAVEL', () => {
    expect(recusada(validar(despesa({ categoria: '""' }))).detalhes.campo).toBe('categoria');
    expect(recusada(validar(despesa({ categoria: '123' }))).detalhes.campo).toBe('categoria');
  });

  it('RN-003 › item que não é objeto (42, "x", null) → DADO_INVALIDO com ecos e valor_solicitado nulos', () => {
    for (const bruta of [lerJson('42'), 'x', null, lerJson('[1]')]) {
      const r = recusada(validar(bruta));
      expect(r.eco).toEqual({ id: null, data: null, categoria: null });
      expect(r.valorSolicitado).toBeNull();
    }
  });

  it('RN-003 › eco sai exatamente como veio (categoria 123 continua o NumeroJson "123")', () => {
    const r = recusada(validar(despesa({ categoria: '123', id: '"  "', data: undefined })));
    expect(r.eco.categoria).toEqual(new NumeroJson('123'));
    expect(r.eco.id).toBe('  ');
    expect(r.eco.data).toBeNull();
  });

  it('RN-003 › "fornecedor": 123 e "descricao": null não recusam a despesa', () => {
    const d = valida(validar(despesa({ fornecedor: '123', descricao: 'null' })));
    expect(d.fornecedorChave).toBe('123');
    expect(d.descricao).toBe('');
    const d2 = valida(validar(despesa({ fornecedor: '[true, {"a": 1}]', descricao: undefined })));
    expect(d2.fornecedorChave).toBe('[true,{"a":1}]');
  });
});
