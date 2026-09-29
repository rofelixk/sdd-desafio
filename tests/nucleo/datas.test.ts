import { afterEach, describe, expect, it } from 'vitest';
import { ehDataValida, somarDias } from '../../src/nucleo/datas.ts';

describe('Infra › datas', () => {
  const tzOriginal = process.env.TZ;
  afterEach(() => {
    process.env.TZ = tzOriginal;
  });

  it('Infra › datas: 2026-02-30 e 2026-07-32 são inválidas e 2024-02-29 é válida', () => {
    expect(ehDataValida('2026-02-30')).toBe(false);
    expect(ehDataValida('2026-07-32')).toBe(false);
    expect(ehDataValida('2026-13-01')).toBe(false);
    expect(ehDataValida('2025-02-29')).toBe(false);
    expect(ehDataValida('2024-02-29')).toBe(true);
    expect(ehDataValida('2026-07-31')).toBe(true);
  });

  it('Infra › datas: formato diferente de AAAA-MM-DD é inválido ("2026-7-3", "03/07/2026")', () => {
    for (const texto of ['2026-7-3', '03/07/2026', '2026-07-03T00:00', ' 2026-07-03', '', '20260703']) {
      expect(ehDataValida(texto), texto).toBe(false);
    }
  });

  it('Infra › datas: 2026-07-31 + 1 dia = 2026-08-01, independente do fuso', () => {
    for (const tz of ['UTC', 'America/Sao_Paulo', 'Pacific/Kiritimati', 'Pacific/Pago_Pago']) {
      process.env.TZ = tz;
      expect(somarDias('2026-07-31', 1), tz).toBe('2026-08-01');
      expect(somarDias('2026-12-31', 1), tz).toBe('2027-01-01');
      expect(somarDias('2024-02-28', 1), tz).toBe('2024-02-29');
      expect(somarDias('2026-07-14', 0), tz).toBe('2026-07-14');
    }
  });
});
