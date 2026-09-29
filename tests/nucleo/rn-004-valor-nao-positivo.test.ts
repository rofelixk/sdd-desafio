import { describe, expect, it } from 'vitest';
import { verificarValorPositivo } from '../../src/nucleo/elegibilidade.ts';
import { valida } from '../apoio.ts';

describe('RN-004 — Valores não positivos', () => {
  it('RN-004 › d-009 (−45,00) → RECUSADO VALOR_NAO_POSITIVO, reembolsável 0,00', () => {
    const d = valida({ id: 'd-009', data: '2026-07-11', categoria: 'transporte_urbano', valor: -45 });
    expect(verificarValorPositivo(d)?.codigo).toBe('VALOR_NAO_POSITIVO');
  });

  it('RN-004 › 0,00 → VALOR_NAO_POSITIVO', () => {
    expect(verificarValorPositivo(valida({ valor: 0 }))?.codigo).toBe('VALOR_NAO_POSITIVO');
  });

  it('RN-004 › -0.004 arredonda para 0,00 → VALOR_NAO_POSITIVO', () => {
    const d = valida({ valor: -0.004 });
    expect(d.valorSolicitado).toBe(0n);
    expect(verificarValorPositivo(d)?.codigo).toBe('VALOR_NAO_POSITIVO');
  });

  it('RN-004 › 0,01 é positivo', () => {
    expect(verificarValorPositivo(valida({ valor: 0.01 }))).toBeNull();
  });
});
