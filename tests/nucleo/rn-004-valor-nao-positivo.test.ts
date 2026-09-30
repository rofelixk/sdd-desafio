import { describe, expect, it } from 'vitest';
import { verificarValorPositivo } from '../../src/nucleo/elegibilidade.ts';
import { lerCambio } from '../../src/io/cambio.ts';
import { codigosPassada1, decisoes, entrada, rodar, valida } from '../apoio.ts';

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
    expect(d.valorOriginal).toBe(0n);
    expect(verificarValorPositivo(d)?.codigo).toBe('VALOR_NAO_POSITIVO');
  });

  it('RN-004 › 0,01 é positivo', () => {
    expect(verificarValorPositivo(valida({ valor: 0.01 }))).toBeNull();
  });

  it('RN-004 › estorno fora do período sai VALOR_NAO_POSITIVO (etapa 3 antes da 4)', () => {
    expect(codigosPassada1(entrada([{ data: '2026-04-15', valor: -45 }]))).toEqual(['VALOR_NAO_POSITIVO']);
    expect(codigosPassada1(entrada([{ categoria: 'coworking', valor: 0 }]))).toEqual(['VALOR_NAO_POSITIVO']);
  });

  it('RN-004 › −10,00 GBP (sem cotação) → VALOR_NAO_POSITIVO', () => {
    const [i] = rodar([{ valor: -10, moeda: 'GBP' }]);
    expect(i?.motivo.codigo).toBe('VALOR_NAO_POSITIVO');
    expect(i).toMatchObject({ valorOriginal: -1000n, conversao: null, valorSolicitado: null, valorReembolsavel: 0n });
    expect(codigosPassada1(entrada([{ valor: -10, moeda: 'GBP', data: '2026-06-30' }]))).toEqual(['VALOR_NAO_POSITIVO']);
  });

  it('RN-004 › 0,01 numa moeda de taxa 0.20 → R$ 0,00 → VALOR_NAO_POSITIVO', () => {
    const cambio = lerCambio('{"moeda_base": "BRL", "taxas": {"2026-07-01": {"XYZ": 0.20}}}');
    const [i, j] = rodar([{ valor: 0.01, moeda: 'XYZ' }, { valor: 0.03, moeda: 'XYZ', fornecedor: 'Y' }], { cambio });
    expect(i?.motivo.codigo).toBe('VALOR_NAO_POSITIVO');
    expect(i).toMatchObject({ valorOriginal: 1n, valorSolicitado: 0n, valorReembolsavel: 0n });
    expect(i?.motivo.descricao).toMatch(/XYZ 0,01 convertido para R\$ 0,00/);
    // 0,03 × 0,20 = 0,006 → R$ 0,01, positivo
    expect(j).toMatchObject({ valorSolicitado: 1n, valorReembolsavel: 1n });
  });

  it('RN-004 › d-009 não afeta as despesas de transporte de 2026-07-11', () => {
    const transporte = { categoria: 'transporte_urbano', data: '2026-07-11', tem_nota_fiscal: false };
    expect(
      decisoes([
        { ...transporte, id: 'd-009', valor: -45 },
        { ...transporte, valor: 80, fornecedor: 'A' },
        { ...transporte, valor: 10, fornecedor: 'B' },
      ]),
    ).toEqual([
      ['RECUSADO', 'VALOR_NAO_POSITIVO', 0n],
      ['APROVADO', 'APROVADO_INTEGRAL', 8000n],
      ['RECUSADO', 'LIMITE_DIARIO_ESGOTADO', 0n],
    ]);
  });
});
