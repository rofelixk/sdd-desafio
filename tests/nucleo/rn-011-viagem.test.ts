import { describe, expect, it } from 'vitest';
import { limiteDiario } from '../../src/nucleo/limites.ts';
import { diasDeViagem } from '../../src/nucleo/viagem.ts';
import { decisoes, elegivel, politicaCom, rodar, tabela } from '../apoio.ts';

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

  it('RN-011 › limite 60,01 ampliado em 50% → 90,02 e 60,03 → 90,04 (meio para o par, AMB-033)', () => {
    const viagem = new Set(['2026-07-14']);
    const comLimite = (limite: number) =>
      tabela({ politica: politicaCom((p) => (p.padrao.alimentacao.limite = limite)) });
    expect(limiteDiario('alimentacao', '2026-07-14', viagem, comLimite(60.01))).toBe(9002n); // 90,015
    expect(limiteDiario('alimentacao', '2026-07-14', viagem, comLimite(60.03))).toBe(9004n); // 90,045
    expect(limiteDiario('alimentacao', '2026-07-14', viagem, comLimite(60.05))).toBe(9008n); // 90,075
    expect(limiteDiario('alimentacao', '2026-07-15', viagem, comLimite(60.01))).toBe(6001n);
  });

  it('RN-011 › hospedagem com limite 0 no centro de custo não gera dia de viagem', () => {
    const opcoes = { centroCusto: 'CC-ENG-PLATAFORMA' };
    const itens = rodar([{ ...hotel, descricao: 'Hotel 2 diarias' }, { ...alimentacao80, data: '2026-07-14' }], opcoes);
    expect(itens[0]?.motivo.codigo).toBe('CATEGORIA_NAO_REEMBOLSAVEL');
    expect(itens[1]).toMatchObject({ valorReembolsavel: 7500n, limiteDiarioAplicado: 7500n, emViagem: false });
  });

  it('RN-011 › CC-COMERCIAL: representacao 420,00 em dia de viagem → APROVADO 420,00 (limite 450,00)', () => {
    const opcoes = { centroCusto: 'CC-COMERCIAL' };
    const representacao = { categoria: 'representacao', data: '2026-07-14', valor: 420, tem_nota_fiscal: true };
    const [, r] = rodar([hotel, representacao], opcoes);
    expect(r).toMatchObject({ valorReembolsavel: 42000n, limiteDiarioAplicado: 45000n, emViagem: true });
    expect(r?.motivo.codigo).toBe('APROVADO_INTEGRAL');
    // fora da viagem, o limite é 300,00
    expect(rodar([representacao], opcoes)[0]).toMatchObject({ valorReembolsavel: 30000n, limiteDiarioAplicado: 30000n });
  });

  it('RN-011 › acréscimo trocado para 20 na tabela: alimentação em dia de viagem tem limite 72,00', () => {
    const politica = politicaCom((p) => (p.acrescimo_em_viagem_percentual = 20));
    const [, a] = rodar([hotel, { ...alimentacao80, data: '2026-07-14' }], { politica });
    expect(a).toMatchObject({ valorReembolsavel: 7200n, limiteDiarioAplicado: 7200n, emViagem: true });
    expect(a?.motivo.codigo).toBe('LIMITE_DIARIO_EXCEDIDO');
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
