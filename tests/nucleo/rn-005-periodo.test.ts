import { describe, expect, it } from 'vitest';
import { lerJson } from '../../src/io/json.ts';
import { verificarPeriodo } from '../../src/nucleo/elegibilidade.ts';
import { valida } from '../apoio.ts';

describe('RN-005 — Período de competência', () => {
  it('RN-005 › d-008 (2026-04-15, período de julho) → FORA_DO_PERIODO', () => {
    const r = verificarPeriodo(valida({ id: 'd-008', data: '2026-04-15' }), '2026-07-01', '2026-07-31');
    expect(r?.codigo).toBe('FORA_DO_PERIODO');
  });

  it('RN-005 › d-014 (2026-07-31 = fim) é elegível', () => {
    expect(verificarPeriodo(valida({ id: 'd-014', data: '2026-07-31' }), '2026-07-01', '2026-07-31')).toBeNull();
    expect(verificarPeriodo(valida({ data: '2026-08-01' }), '2026-07-01', '2026-07-31')?.codigo).toBe('FORA_DO_PERIODO');
  });

  it('RN-005 › data = inicio é elegível', () => {
    expect(verificarPeriodo(valida({ data: '2026-07-01' }), '2026-07-01', '2026-07-31')).toBeNull();
    expect(verificarPeriodo(valida({ data: '2026-06-30' }), '2026-07-01', '2026-07-31')?.codigo).toBe('FORA_DO_PERIODO');
  });

  it('RN-005 › competencia divergente de inicio/fim é ignorada', () => {
    const periodo = lerJson('{"competencia": "2026-08", "inicio": "2026-07-01", "fim": "2026-07-31"}') as {
      inicio: string;
      fim: string;
    };
    expect(verificarPeriodo(valida({ data: '2026-07-15' }), periodo.inicio, periodo.fim)).toBeNull();
    expect(verificarPeriodo(valida({ data: '2026-08-15' }), periodo.inicio, periodo.fim)?.codigo).toBe('FORA_DO_PERIODO');
  });
});
