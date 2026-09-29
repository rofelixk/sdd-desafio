import { describe, expect, it } from 'vitest';
import { normalizar } from '../../src/nucleo/texto.ts';

describe('RN-002 — Normalização da categoria', () => {
  it('RN-002 › "ALIMENTACAO", " Alimentação " e "alimentacao" viram alimentacao', () => {
    expect(normalizar('ALIMENTACAO')).toBe('alimentacao');
    expect(normalizar(' Alimentação ')).toBe('alimentacao');
    expect(normalizar('alimentacao')).toBe('alimentacao');
  });

  it('RN-002 › "Transporte_Urbano" e "HOSPEDAGEM" viram transporte_urbano e hospedagem', () => {
    expect(normalizar('Transporte_Urbano')).toBe('transporte_urbano');
    expect(normalizar('HOSPEDAGEM')).toBe('hospedagem');
  });
});
