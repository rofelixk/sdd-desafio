import { describe, expect, it } from 'vitest';
import { extrairDiarias, gerarParcelas } from '../../src/nucleo/diarias.ts';
import { comoTexto } from '../../src/nucleo/texto.ts';
import { NumeroJson } from '../../src/nucleo/tipos.ts';
import { elegivel } from '../apoio.ts';

describe('RN-012 — Hospedagem com mais de uma diária', () => {
  it('RN-012 › "Hotel Rio - 2 diarias" → N = 2', () => {
    expect(extrairDiarias('Hotel Rio - 2 diarias')).toBe(2);
  });

  it('RN-012 › "Airbnb 3 noites" → N = 3', () => {
    expect(extrairDiarias('Airbnb 3 noites')).toBe(3);
  });

  it('RN-012 › "Hotel 5 estrelas" → N = 1', () => {
    expect(extrairDiarias('Hotel 5 estrelas')).toBe(1);
  });

  it('RN-012 › "Hotel 5 estrelas - 2 diarias" → N = 2', () => {
    expect(extrairDiarias('Hotel 5 estrelas - 2 diarias')).toBe(2);
  });

  it('RN-012 › "Hotel 1.5 diarias" → N = 1 (e não 5)', () => {
    expect(extrairDiarias('Hotel 1.5 diarias')).toBe(1);
    expect(extrairDiarias('Hotel 1,5 diarias')).toBe(1);
    expect(extrairDiarias('Hotel 1.5 diarias e 2 noites')).toBe(2);
  });

  it('RN-012 › "Pousada" e descrição ausente → N = 1', () => {
    expect(extrairDiarias('Pousada')).toBe(1);
    expect(extrairDiarias(comoTexto(undefined))).toBe(1);
  });

  it('RN-012 › "0 diarias" → N = 1', () => {
    expect(extrairDiarias('0 diarias')).toBe(1);
  });

  it('RN-012 › "3 Diárias" → N = 3', () => {
    expect(extrairDiarias('3 Diárias')).toBe(3);
    expect(extrairDiarias('1 DIÁRIA')).toBe(1);
    expect(extrairDiarias('4 Noite')).toBe(4);
  });

  it('RN-012 › "12 noites" → N = 12 (inteiro completo)', () => {
    expect(extrairDiarias('12 noites')).toBe(12);
  });

  it('RN-012 › "2diarias" → N = 2 (sem espaço)', () => {
    expect(extrairDiarias('2diarias')).toBe(2);
  });

  it('RN-012 › "2 noitadas" → N = 1', () => {
    expect(extrairDiarias('2 noitadas')).toBe(1);
    expect(extrairDiarias('2 diariamente')).toBe(1);
  });

  it('RN-012 › descricao nula ou 2 (número) → N = 1', () => {
    expect(extrairDiarias(comoTexto(null))).toBe(1);
    expect(extrairDiarias(comoTexto(new NumeroJson('2')))).toBe(1);
  });

  /** Parcelas como `[data, valor em centavos]`. */
  function parcelas(campos: Record<string, unknown>): [string, bigint][] {
    return gerarParcelas(elegivel(campos)).map((p) => [p.data, p.valor]);
  }

  it('RN-012 › d-010 (480,00, N = 2) → 240,00 em 14/07 e 240,00 em 15/07', () => {
    const d010 = { id: 'd-010', data: '2026-07-14', categoria: 'hospedagem', descricao: 'Hotel Rio - 2 diarias', valor: 480 };
    expect(parcelas(d010)).toEqual([
      ['2026-07-14', 24000n],
      ['2026-07-15', 24000n],
    ]);
    expect(gerarParcelas(elegivel(d010, 9)).every((p) => p.indiceDespesa === 9 && p.categoria === 'hospedagem')).toBe(true);
  });

  it('RN-012 › 100,00 em 3 noites → 33,34 / 33,33 / 33,33', () => {
    expect(parcelas({ data: '2026-07-14', categoria: 'hospedagem', descricao: '3 diarias', valor: 100 })).toEqual([
      ['2026-07-14', 3334n],
      ['2026-07-15', 3333n],
      ['2026-07-16', 3333n],
    ]);
    expect(parcelas({ data: '2026-07-14', categoria: 'hospedagem', descricao: '3 noites', valor: 0.05 })).toEqual([
      ['2026-07-14', 2n],
      ['2026-07-15', 2n],
      ['2026-07-16', 1n],
    ]);
  });

  it('RN-012 › noites atravessam o fim do mês (31/07 → 01/08)', () => {
    expect(parcelas({ data: '2026-07-31', categoria: 'hospedagem', descricao: '2 diarias', valor: 400 })).toEqual([
      ['2026-07-31', 20000n],
      ['2026-08-01', 20000n],
    ]);
  });

  it('RN-012 › despesa que não é hospedagem gera uma parcela', () => {
    expect(parcelas({ data: '2026-07-03', categoria: 'alimentacao', descricao: 'Almoco 2 diarias', valor: 72.5 })).toEqual([
      ['2026-07-03', 7250n],
    ]);
  });
});
