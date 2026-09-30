import { describe, expect, it } from 'vitest';
import { verificarDuplicata } from '../../src/nucleo/elegibilidade.ts';
import type { ChavesDuplicata } from '../../src/nucleo/elegibilidade.ts';
import { codigosPassada1, entrada, rodar, valida } from '../apoio.ts';

/** Códigos da etapa 6 para as despesas em sequência (`null` = segue). */
function codigos(...campos: Record<string, unknown>[]): (string | null)[] {
  const aceitas: ChavesDuplicata = new Map();
  return campos.map((c, i) => verificarDuplicata(valida({ id: `x-${i}`, ...c }, i), aceitas)?.codigo ?? null);
}

describe('RN-007 — Duplicatas', () => {
  it('RN-007 › d-006 segue e d-007 → DUPLICATA', () => {
    const d006 = { id: 'd-006', data: '2026-07-09', fornecedor: 'Bistro Central', valor: 54.9, descricao: 'Almoco' };
    expect(codigos(d006, { ...d006, id: 'd-007' })).toEqual([null, 'DUPLICATA']);
  });

  it('RN-007 › duas alimentações de 40,00 sem fornecedor na mesma data → a 2ª DUPLICATA', () => {
    expect(codigos({ fornecedor: undefined, valor: 40 }, { fornecedor: undefined, valor: 40 })).toEqual([null, 'DUPLICATA']);
  });

  it('RN-007 › só uma com fornecedor → as duas seguem', () => {
    expect(codigos({ fornecedor: 'Tavola', valor: 40 }, { fornecedor: undefined, valor: 40 })).toEqual([null, null]);
    expect(codigos({ fornecedor: undefined, valor: 40 }, { fornecedor: 'Tavola', valor: 40 })).toEqual([null, null]);
  });

  it('RN-007 › "Café" e "Cafe" são fornecedores diferentes (fornecedor não tira acento)', () => {
    expect(codigos({ fornecedor: 'Café' }, { fornecedor: 'Cafe' })).toEqual([null, null]);
    expect(codigos({ fornecedor: 'Café' }, { fornecedor: ' CAFÉ ' })).toEqual([null, 'DUPLICATA']);
  });

  it('RN-007 › descricao e tem_nota_fiscal não entram no critério', () => {
    expect(
      codigos({ descricao: 'Almoco', tem_nota_fiscal: true }, { descricao: 'Jantar', tem_nota_fiscal: false }),
    ).toEqual([null, 'DUPLICATA']);
  });

  it('RN-007 › recusa DUPLICATA traz o id da ocorrência aceita', () => {
    const aceitas: ChavesDuplicata = new Map();
    verificarDuplicata(valida({ id: 'd-006' }), aceitas);
    expect(verificarDuplicata(valida({ id: 'd-007' }, 1), aceitas)?.detalhes).toEqual({ idAceito: 'd-006' });
    expect(verificarDuplicata(valida({ id: 'd-008' }, 2), aceitas)?.detalhes).toEqual({ idAceito: 'd-006' });
  });

  it('RN-007 › fornecedor 123 e "123" são o mesmo fornecedor', () => {
    expect(codigos({ fornecedor: 123 }, { fornecedor: '123' })).toEqual([null, 'DUPLICATA']);
  });

  it('RN-007 › fornecedor null é igual a fornecedor ausente', () => {
    expect(codigos({ fornecedor: null }, { fornecedor: undefined }, { fornecedor: '   ' })).toEqual([
      null,
      'DUPLICATA',
      'DUPLICATA',
    ]);
  });

  it('RN-007 › data, categoria ou valor diferentes não são duplicatas', () => {
    expect(codigos({}, { data: '2026-07-04' }, { categoria: 'transporte_urbano' }, { valor: 45.01 })).toEqual([
      null,
      null,
      null,
      null,
    ]);
    expect(codigos({ categoria: 'alimentacao' }, { categoria: 'ALIMENTAÇÃO', valor: '45,00' })).toEqual([null, 'DUPLICATA']);
  });

  it('RN-007 › 20,00 EUR e 20,00 USD, resto igual → as duas seguem', () => {
    const gasto = { data: '2026-07-14', valor: 20 };
    expect(codigos({ ...gasto, moeda: 'EUR' }, { ...gasto, moeda: 'USD' })).toEqual([null, null]);
    expect(codigos({ ...gasto, moeda: 'EUR' }, { ...gasto })).toEqual([null, null]);
  });

  it('RN-007 › sem moeda e "BRL", resto igual → a 2ª DUPLICATA', () => {
    expect(codigos({ moeda: undefined }, { moeda: 'BRL' }, { moeda: null }, { moeda: ' brl ' })).toEqual([
      null,
      'DUPLICATA',
      'DUPLICATA',
      'DUPLICATA',
    ]);
  });

  it('RN-007 › "eur" e "EUR", resto igual → a 2ª DUPLICATA', () => {
    const gasto = { data: '2026-07-14', valor: 20 };
    expect(codigos({ ...gasto, moeda: 'eur' }, { ...gasto, moeda: 'EUR' })).toEqual([null, 'DUPLICATA']);
    // o valor comparado é o original, não o convertido
    expect(codigos({ ...gasto, moeda: 'EUR' }, { ...gasto, moeda: 'EUR', valor: 20.01 })).toEqual([null, null]);
  });

  it('RN-007 › cópia fora do período não gera duplicata (só compara quem passou das etapas 1 a 5)', () => {
    const copia = { data: '2026-08-01', fornecedor: 'Tavola', valor: 40 };
    expect(codigosPassada1(entrada([copia, copia, { ...copia, data: '2026-07-31' }]))).toEqual([
      'FORA_DO_PERIODO',
      'FORA_DO_PERIODO',
      null,
    ]);
    const coworking = { categoria: 'coworking', valor: 40 };
    expect(codigosPassada1(entrada([coworking, coworking]))).toEqual([
      'CATEGORIA_NAO_REEMBOLSAVEL',
      'CATEGORIA_NAO_REEMBOLSAVEL',
    ]);
  });

  it('RN-007 › duplicata vem antes da nota fiscal (2ª cópia sem NF sai DUPLICATA)', () => {
    const gasto = { categoria: 'transporte_urbano', valor: 150 };
    expect(codigosPassada1(entrada([{ ...gasto, tem_nota_fiscal: true }, { ...gasto, tem_nota_fiscal: false }]))).toEqual([
      null,
      'DUPLICATA',
    ]);
    expect(codigosPassada1(entrada([{ ...gasto, tem_nota_fiscal: false }, { ...gasto, tem_nota_fiscal: false }]))).toEqual([
      'NOTA_FISCAL_AUSENTE',
      'DUPLICATA',
    ]);
  });

  it('RN-007 › descrição de DUPLICATA cita o id da ocorrência aceita', () => {
    const d006 = { id: 'd-006', data: '2026-07-09', fornecedor: 'Bistro Central', valor: 54.9 };
    const [, d007] = rodar([d006, { ...d006, id: 'd-007' }]);
    expect(d007?.motivo.codigo).toBe('DUPLICATA');
    expect(d007?.motivo.descricao).toContain("'d-006'");
    expect(d007?.motivo.descricao).not.toMatch(/fraude|suspeit|má-fé|irregular/i);
  });
});
