import { describe, expect, it } from 'vitest';
import { verificarNotaFiscal } from '../../src/nucleo/elegibilidade.ts';
import { TABELA_PADRAO, decisoes, valida } from '../apoio.ts';

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
    expect(d.valorSolicitado).toBe(10000n);
    expect(verificarNotaFiscal(d, TABELA_PADRAO)).toBeNull();
  });

  it('RN-008 › dia de viagem não amplia o limiar de nota fiscal', () => {
    const hotel = { categoria: 'hospedagem', valor: 200, descricao: 'Hotel', fornecedor: 'Hotel' };
    expect(decisoes([hotel, { ...semNf, valor: 110 }, { ...semNf, valor: 100, fornecedor: 'Outro' }]).slice(1)).toEqual([
      ['RECUSADO', 'NOTA_FISCAL_AUSENTE', 0n],
      ['APROVADO', 'APROVADO_INTEGRAL', 10000n],
    ]);
  });
});
