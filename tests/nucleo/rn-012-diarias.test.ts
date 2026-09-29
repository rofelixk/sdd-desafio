import { describe, expect, it } from 'vitest';
import { extrairDiarias } from '../../src/nucleo/diarias.ts';
import { comoTexto } from '../../src/nucleo/texto.ts';
import { NumeroJson } from '../../src/nucleo/tipos.ts';

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
});
