import { describe, expect, it } from 'vitest';
import { diasDeViagem } from '../../src/nucleo/viagem.ts';
import { decisoes, elegivel, rodar } from '../apoio.ts';

const hospedagem = { categoria: 'hospedagem', data: '2026-07-14', valor: 200 };

describe('RN-011 — Colaborador em viagem', () => {
  it('RN-011 › hospedagem de 1 diária em D: só D é dia de viagem', () => {
    expect([...diasDeViagem([elegivel({ ...hospedagem, descricao: 'Hotel' })])]).toEqual(['2026-07-14']);
  });

  it('RN-011 › hospedagem de 2 diárias em D: D e D+1 são dias de viagem', () => {
    expect([...diasDeViagem([elegivel({ ...hospedagem, descricao: 'Hotel - 2 diarias' })])]).toEqual([
      '2026-07-14',
      '2026-07-15',
    ]);
  });

  it('RN-011 › sem hospedagem elegível não há dia de viagem', () => {
    expect(diasDeViagem([]).size).toBe(0);
    expect(diasDeViagem([elegivel({ categoria: 'alimentacao', descricao: '2 diarias' })]).size).toBe(0);
  });

  const hotel = { categoria: 'hospedagem', data: '2026-07-14', valor: 200, descricao: 'Hotel', fornecedor: 'Hotel' };
  const alimentacao80 = { categoria: 'alimentacao', valor: 80 };

  it('RN-011 › alimentação de 80,00 na data de hospedagem elegível → APROVADO 80,00 (limite 90,00)', () => {
    const [, a] = rodar([hotel, { ...alimentacao80, data: '2026-07-14' }]);
    expect(a).toMatchObject({ valorReembolsavel: 8000n, limiteDiarioAplicado: 9000n, emViagem: true });
    expect(a?.motivo.codigo).toBe('APROVADO_INTEGRAL');
  });

  it('RN-011 › hospedagem de 1 diária em D e alimentação 80,00 em D+1 → PARCIAL 60,00', () => {
    expect(decisoes([hotel, { ...alimentacao80, data: '2026-07-15' }])[1]).toEqual([
      'PARCIAL',
      'LIMITE_DIARIO_EXCEDIDO',
      6000n,
    ]);
  });

  it('RN-011 › hospedagem de 2 diárias em D e alimentação 80,00 em D+1 → APROVADO 80,00', () => {
    const [, a] = rodar([{ ...hotel, descricao: 'Hotel 2 diarias' }, { ...alimentacao80, data: '2026-07-15' }]);
    expect(a).toMatchObject({ valorReembolsavel: 8000n, limiteDiarioAplicado: 9000n, emViagem: true });
  });

  it('RN-011 › d-013 recusada por NF não torna 22 a 24/07 dias de viagem', () => {
    const d013 = { id: 'd-013', categoria: 'hospedagem', data: '2026-07-22', valor: 690, descricao: 'Airbnb 3 noites', tem_nota_fiscal: false };
    const itens = rodar([
      d013,
      { ...alimentacao80, data: '2026-07-22' },
      { ...alimentacao80, data: '2026-07-23' },
      { ...alimentacao80, data: '2026-07-24' },
    ]);
    expect(itens[0]?.motivo.codigo).toBe('NOTA_FISCAL_AUSENTE');
    for (const a of itens.slice(1)) {
      expect(a).toMatchObject({ valorReembolsavel: 6000n, limiteDiarioAplicado: 6000n, emViagem: false });
    }
  });
});
