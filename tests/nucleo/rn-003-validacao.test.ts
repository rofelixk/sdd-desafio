import { describe, expect, it } from 'vitest';
import { lerJson } from '../../src/io/json.ts';
import { comoTexto } from '../../src/nucleo/texto.ts';

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
});
