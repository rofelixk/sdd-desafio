import { describe, expect, it } from 'vitest';
import { lerJson, serializarJson } from '../../src/io/json.ts';
import { NumeroJson } from '../../src/nucleo/tipos.ts';

describe('Infra › json', () => {
  it('Infra › json: número vira NumeroJson com o texto original ("10.005", "1.00005e2")', () => {
    const lido = lerJson('{"a": 10.005, "b": 1.00005e2}') as Record<string, unknown>;
    expect(lido.a).toBeInstanceOf(NumeroJson);
    expect(lido.a).toEqual(new NumeroJson('10.005'));
    expect(lido.b).toEqual(new NumeroJson('1.00005e2'));
  });

  it('Infra › json: números aninhados em objetos e listas também são embrulhados', () => {
    const lido = lerJson('{"x": {"y": [1, {"z": -0.50}]}, "t": "10", "u": true, "n": null}');
    expect(lido).toEqual({
      x: { y: [new NumeroJson('1'), { z: new NumeroJson('-0.50') }] },
      t: '10',
      u: true,
      n: null,
    });
  });

  it('Infra › json: NumeroJson é reemitido com o mesmo texto', () => {
    const texto = '{"a": 10.005, "b": [1.00005e2, 45.00], "c": {"d": -0}}';
    expect(serializarJson(lerJson(texto))).toBe(
      '{\n  "a": 10.005,\n  "b": [\n    1.00005e2,\n    45.00\n  ],\n  "c": {\n    "d": -0\n  }\n}\n',
    );
  });

  it('Infra › json: JSON.rawJSON("45.00") sai como número 45.00, não como texto', () => {
    expect(serializarJson({ v: JSON.rawJSON('45.00') })).toBe('{\n  "v": 45.00\n}\n');
  });

  it('Infra › json: objeto {"texto": ...} da entrada não é confundido com NumeroJson', () => {
    const lido = lerJson('{"texto": "1"}');
    expect(lido).not.toBeInstanceOf(NumeroJson);
    expect(serializarJson(lido)).toBe('{\n  "texto": "1"\n}\n');
  });
});
