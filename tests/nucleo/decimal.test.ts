import { describe, expect, it } from 'vitest';
import { decimalDe, dividirMeioParaPar } from '../../src/nucleo/decimal.ts';

describe('Infra › decimal', () => {
  it('Infra › decimal: "5.93" → 593 × 10^-2, "50" → 50 × 10^0 e "1.00005e2" → 100005 × 10^-3', () => {
    expect(decimalDe('5.93')).toEqual({ digitos: 593n, escala: 2 });
    expect(decimalDe('50')).toEqual({ digitos: 50n, escala: 0 });
    expect(decimalDe('1.00005e2')).toEqual({ digitos: 100005n, escala: 3 });
    expect(decimalDe('-0.50')).toEqual({ digitos: -50n, escala: 2 });
    expect(decimalDe('5e3')).toEqual({ digitos: 5000n, escala: 0 });
    expect(decimalDe('45E-2')).toEqual({ digitos: 45n, escala: 2 });
    for (const texto of ['', 'abc', '1,5', '.5', '5.', '+5', '1e']) {
      expect(decimalDe(texto), texto).toBeNull();
    }
  });

  it('Infra › decimal: dividirMeioParaPar 25/10 → 2, 35/10 → 4, 26/10 → 3, 24/10 → 2 e -25/10 → -2', () => {
    expect(dividirMeioParaPar(25n, 10n)).toBe(2n);
    expect(dividirMeioParaPar(35n, 10n)).toBe(4n);
    expect(dividirMeioParaPar(26n, 10n)).toBe(3n);
    expect(dividirMeioParaPar(24n, 10n)).toBe(2n);
    expect(dividirMeioParaPar(-25n, 10n)).toBe(-2n);
    expect(dividirMeioParaPar(-35n, 10n)).toBe(-4n);
    expect(dividirMeioParaPar(-26n, 10n)).toBe(-3n);
    expect(dividirMeioParaPar(40n, 10n)).toBe(4n);
    expect(dividirMeioParaPar(0n, 7n)).toBe(0n);
  });
});
