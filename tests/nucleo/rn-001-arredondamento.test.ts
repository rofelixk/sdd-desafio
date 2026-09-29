import { describe, expect, it } from 'vitest';
import { paraCentavos } from '../../src/nucleo/dinheiro.ts';

describe('RN-001 — Arredondamento de valores para centavos', () => {
  it('RN-001 › 33.333 → 33.33', () => {
    expect(paraCentavos('33.333')).toBe(3333n);
  });

  it('RN-001 › 10.005 → 10.00 (meio, 0 é par)', () => {
    expect(paraCentavos('10.005')).toBe(1000n);
  });

  it('RN-001 › 10.015 → 10.02 (meio, 2 é par)', () => {
    expect(paraCentavos('10.015')).toBe(1002n);
  });

  it('RN-001 › 33.345 → 33.34', () => {
    expect(paraCentavos('33.345')).toBe(3334n);
  });

  it('RN-001 › 33.3451 → 33.35 (fora do meio)', () => {
    expect(paraCentavos('33.3451')).toBe(3335n);
  });

  it('RN-001 › 100.004 → 100.00', () => {
    expect(paraCentavos('100.004')).toBe(10000n);
  });

  it('RN-001 › -45.005 → -45.00 (meio para o par também no negativo)', () => {
    expect(paraCentavos('-45.005')).toBe(-4500n);
    expect(paraCentavos('-45.015')).toBe(-4502n);
  });

  it('RN-001 › expoente 1.00005e2 → 100.00', () => {
    expect(paraCentavos('1.00005e2')).toBe(10000n);
    expect(paraCentavos('1.00015E2')).toBe(10002n);
    expect(paraCentavos('4500e-2')).toBe(4500n);
    expect(paraCentavos('45e+0')).toBe(4500n);
  });

  it('RN-001 › inteiros e valores com até duas casas não mudam', () => {
    expect(paraCentavos('45')).toBe(4500n);
    expect(paraCentavos('45.5')).toBe(4550n);
    expect(paraCentavos('0.00')).toBe(0n);
    expect(paraCentavos('-0.004')).toBe(0n);
  });
});
