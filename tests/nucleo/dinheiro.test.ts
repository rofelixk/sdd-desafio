import { describe, expect, it } from 'vitest';
import { formatarDecimal, formatarReais } from '../../src/nucleo/dinheiro.ts';

describe('Infra › dinheiro', () => {
  it('Infra › dinheiro: formatarDecimal 4500n → "45.00", -4500n → "-45.00", 5n → "0.05", 0n → "0.00"', () => {
    expect(formatarDecimal(4500n)).toBe('45.00');
    expect(formatarDecimal(-4500n)).toBe('-45.00');
    expect(formatarDecimal(5n)).toBe('0.05');
    expect(formatarDecimal(0n)).toBe('0.00');
    expect(formatarDecimal(-5n)).toBe('-0.05');
    expect(formatarDecimal(123456789012345678901n)).toBe('1234567890123456789.01');
  });

  it('Infra › dinheiro: formatarReais 6000n → "R$ 60,00" e 186184n → "R$ 1.861,84"', () => {
    expect(formatarReais(6000n)).toBe('R$ 60,00');
    expect(formatarReais(186184n)).toBe('R$ 1.861,84');
    expect(formatarReais(0n)).toBe('R$ 0,00');
    expect(formatarReais(100000000n)).toBe('R$ 1.000.000,00');
    expect(formatarReais(-4500n)).toBe('-R$ 45,00');
  });
});
