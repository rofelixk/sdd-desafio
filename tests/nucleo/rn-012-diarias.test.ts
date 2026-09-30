import { describe, expect, it } from 'vitest';
import { extrairDiarias, gerarParcelas } from '../../src/nucleo/diarias.ts';
import { comoTexto } from '../../src/nucleo/texto.ts';
import { NumeroJson } from '../../src/nucleo/tipos.ts';
import { decisoes, elegivel, rodar } from '../apoio.ts';

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

  it('RN-012 › h1 14/07 "2 diarias" 480,00 e h2 15/07 "1 diaria" 200,00 → h1 APROVADO 480,00, h2 PARCIAL 10,00', () => {
    const h1 = { id: 'h1', categoria: 'hospedagem', data: '2026-07-14', descricao: 'Hotel - 2 diarias', valor: 480 };
    const h2 = { id: 'h2', categoria: 'hospedagem', data: '2026-07-15', descricao: 'Pousada - 1 diaria', valor: 200 };
    expect(decisoes([h1, h2])).toEqual([
      ['APROVADO', 'APROVADO_INTEGRAL', 48000n],
      ['PARCIAL', 'LIMITE_DIARIO_EXCEDIDO', 1000n],
    ]);
  });

  it('RN-012 › parcelas em reais: 100,00 USD em 13/07 (R$ 542,00) "2 diarias" → 271,00 + 271,00 → PARCIAL 500,00', () => {
    const hotel = { categoria: 'hospedagem', data: '2026-07-13', descricao: 'Hotel NY - 2 diarias', valor: 100, moeda: 'USD' };
    expect(parcelas(hotel)).toEqual([
      ['2026-07-13', 27100n],
      ['2026-07-14', 27100n],
    ]);
    const [i] = rodar([hotel]);
    expect(i).toMatchObject({ valorOriginal: 10000n, valorSolicitado: 54200n, valorReembolsavel: 50000n, diarias: 2 });
    expect(i?.motivo.codigo).toBe('LIMITE_DIARIO_EXCEDIDO');
  });

  it('RN-012 › diarias só é preenchido em hospedagem que chegou ao limite; limite e em_viagem nulos nas recusadas', () => {
    const itens = rodar([
      { categoria: 'hospedagem', descricao: '3 noites', valor: 300 },
      { categoria: 'hospedagem', descricao: '2 noites', valor: 690, tem_nota_fiscal: false },
      { categoria: 'alimentacao', valor: 30 },
      { categoria: 'coworking', valor: 30 },
      { data: '2026-07-32' },
    ]);
    expect(itens.map((i) => [i.diarias, i.limiteDiarioAplicado, i.emViagem])).toEqual([
      [3, 25000n, true],
      [null, null, null],
      [null, 9000n, true],
      [null, null, null],
      [null, null, null],
    ]);
  });
});
