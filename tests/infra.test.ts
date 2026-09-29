import { describe, expect, it } from 'vitest';

describe('Infra', () => {
  it('Infra › runtime oferece JSON.rawJSON e context.source no reviver do JSON.parse', () => {
    const fontes: string[] = [];
    JSON.parse('{"a": 10.005, "b": [1.00005e2]}', (_chave, valor, contexto) => {
      if (typeof valor === 'number' && contexto.source !== undefined) fontes.push(contexto.source);
      return valor;
    });
    expect(fontes).toEqual(['10.005', '1.00005e2']);

    expect(JSON.stringify({ v: JSON.rawJSON('45.00') })).toBe('{"v":45.00}');
  });
});
