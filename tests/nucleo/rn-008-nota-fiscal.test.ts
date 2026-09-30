import { describe, expect, it } from 'vitest';
import { verificarNotaFiscal } from '../../src/nucleo/elegibilidade.ts';
import { TABELA_PADRAO, decisoes, politicaCom, tabela, valida } from '../apoio.ts';

const semNf = { categoria: 'transporte_urbano', tem_nota_fiscal: false };

describe('RN-008 — Nota fiscal obrigatória', () => {
  it('RN-008 › d-003 (100,00, sem NF) não é recusada por nota fiscal', () => {
    expect(verificarNotaFiscal(valida({ ...semNf, id: 'd-003', valor: 100 }), TABELA_PADRAO)).toBeNull();
  });

  it('RN-008 › d-004 (100,01, sem NF) → NOTA_FISCAL_AUSENTE', () => {
    expect(verificarNotaFiscal(valida({ ...semNf, id: 'd-004', valor: 100.01 }), TABELA_PADRAO)?.codigo).toBe('NOTA_FISCAL_AUSENTE');
    expect(verificarNotaFiscal(valida({ ...semNf, valor: 100.01, tem_nota_fiscal: true }), TABELA_PADRAO)).toBeNull();
  });

  it('RN-008 › d-013 (690,00, sem NF) → NOTA_FISCAL_AUSENTE', () => {
    const d = valida({ id: 'd-013', categoria: 'hospedagem', valor: 690, tem_nota_fiscal: false });
    expect(verificarNotaFiscal(d, TABELA_PADRAO)?.codigo).toBe('NOTA_FISCAL_AUSENTE');
  });

  it('RN-008 › 100.004 arredonda para 100,00 e não exige nota fiscal', () => {
    const d = valida({ ...semNf, valor: 100.004 });
    expect(d.conversao?.valorSolicitado).toBe(10000n);
    expect(verificarNotaFiscal(d, TABELA_PADRAO)).toBeNull();
  });

  it('RN-008 › limiar trocado para 150,00 na tabela: 120,00 sem NF não é recusada', () => {
    const tabela150 = tabela({ politica: politicaCom((p) => (p.nota_fiscal_obrigatoria_acima_de = 150.0)) });
    expect(verificarNotaFiscal(valida({ ...semNf, valor: 120 }), tabela150)).toBeNull();
    expect(verificarNotaFiscal(valida({ ...semNf, valor: 150 }), tabela150)).toBeNull();
    expect(verificarNotaFiscal(valida({ ...semNf, valor: 150.01 }), tabela150)?.codigo).toBe('NOTA_FISCAL_AUSENTE');
    expect(verificarNotaFiscal(valida({ ...semNf, valor: 120 }), TABELA_PADRAO)?.codigo).toBe('NOTA_FISCAL_AUSENTE');
    // limiar com mais de 2 casas comparado sem arredondar
    const tabelaFina = tabela({ politica: politicaCom((p) => (p.nota_fiscal_obrigatoria_acima_de = 100.005)) });
    expect(verificarNotaFiscal(valida({ ...semNf, valor: 100 }), tabelaFina)).toBeNull();
    expect(verificarNotaFiscal(valida({ ...semNf, valor: 100.01 }), tabelaFina)?.codigo).toBe('NOTA_FISCAL_AUSENTE');
  });

  it('RN-008 › e-005 (40,00 USD × 5,50 = R$ 220,00, sem NF) → NOTA_FISCAL_AUSENTE', () => {
    const e005 = { ...semNf, id: 'e-005', data: '2026-07-20', valor: 40, moeda: 'USD' };
    const d = valida(e005);
    expect(verificarNotaFiscal(d, TABELA_PADRAO)).toEqual({
      codigo: 'NOTA_FISCAL_AUSENTE',
      detalhes: { valor: 22000n, limiar: { digitos: 10000n, escala: 2 } },
    });
    expect(decisoes([e005], { centroCusto: 'CC-COMERCIAL' })).toEqual([['RECUSADO', 'NOTA_FISCAL_AUSENTE', 0n]]);
  });

  it('RN-008 › e-003 (14,50 EUR × 5,88 = R$ 85,26, sem NF) não é recusada por nota fiscal', () => {
    const e003 = { id: 'e-003', data: '2026-07-15', categoria: 'alimentacao', valor: 14.5, moeda: 'EUR', tem_nota_fiscal: false };
    expect(verificarNotaFiscal(valida(e003), TABELA_PADRAO)).toBeNull();
    expect(decisoes([e003], { centroCusto: 'CC-COMERCIAL' })).toEqual([['APROVADO', 'APROVADO_INTEGRAL', 8526n]]);
  });

  it('RN-008 › dia de viagem não amplia o limiar de nota fiscal', () => {
    const hotel = { categoria: 'hospedagem', valor: 200, descricao: 'Hotel', fornecedor: 'Hotel' };
    expect(decisoes([hotel, { ...semNf, valor: 110 }, { ...semNf, valor: 100, fornecedor: 'Outro' }]).slice(1)).toEqual([
      ['RECUSADO', 'NOTA_FISCAL_AUSENTE', 0n],
      ['APROVADO', 'APROVADO_INTEGRAL', 10000n],
    ]);
  });
});
