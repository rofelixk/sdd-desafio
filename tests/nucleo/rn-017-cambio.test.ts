import { describe, expect, it } from 'vitest';
import { lerCambio } from '../../src/io/cambio.ts';
import { converter } from '../../src/nucleo/cambio.ts';
import { statusDe } from '../../src/nucleo/status.ts';
import { CAMBIO_V4, rodar } from '../apoio.ts';
import type { Opcoes } from '../apoio.ts';

/** `[taxa, data da cotação, valor em reais]` da conversão, ou `null`. */
function conversao(centavos: bigint, moeda: string, data: string) {
  const c = converter(centavos, moeda, data, CAMBIO_V4);
  return c && [c.taxa.texto, c.dataCotacao, c.valorSolicitado];
}

describe('RN-017 — Moeda e conversão para reais', () => {
  it('RN-017 › e-002 (22,00 EUR em 14/07) → taxa 5.93, cotação 2026-07-14, R$ 130,46', () => {
    expect(conversao(2200n, 'EUR', '2026-07-14')).toEqual(['5.93', '2026-07-14', 13046n]);
  });

  it('RN-017 › e-004 (30,00 EUR no sábado 18/07) → taxa 5.96 de 2026-07-17, R$ 178,80', () => {
    expect(conversao(3000n, 'EUR', '2026-07-18')).toEqual(['5.96', '2026-07-17', 17880n]);
    expect(conversao(3000n, 'EUR', '2026-07-19')).toEqual(['5.96', '2026-07-17', 17880n]);
    expect(conversao(3000n, 'EUR', '2026-07-20')).toEqual(['6.01', '2026-07-20', 18030n]);
  });

  it('RN-017 › 10,05 USD em 13/07 × 5,42 = 54,471 → R$ 54,47', () => {
    expect(conversao(1005n, 'USD', '2026-07-13')).toEqual(['5.42', '2026-07-13', 5447n]);
  });

  it('RN-017 › 0,50 USD em 16/07 × 5,41 = 2,705 → R$ 2,70 (meio para o par, AMB-037)', () => {
    expect(conversao(50n, 'USD', '2026-07-16')).toEqual(['5.41', '2026-07-16', 270n]);
    // 0,70 USD × 5,45 = 3,815 → 3,82 (1 é ímpar, sobe)
    expect(conversao(70n, 'USD', '2026-07-22')).toEqual(['5.45', '2026-07-22', 382n]);
    // negativo também meio para o par
    expect(conversao(-50n, 'USD', '2026-07-16')).toEqual(['5.41', '2026-07-16', -270n]);
  });

  it('RN-017 › EUR em 2026-07-10 (antes da primeira cotação) → sem conversão', () => {
    expect(conversao(1000n, 'EUR', '2026-07-10')).toBeNull();
    expect(conversao(1000n, 'EUR', '2026-07-12')).toBeNull();
    expect(conversao(1000n, 'EUR', '2026-07-13')).toEqual(['5.91', '2026-07-13', 5910n]);
  });

  it('RN-017 › GBP e EURO (fora do câmbio) → sem conversão', () => {
    expect(conversao(5500n, 'GBP', '2026-07-21')).toBeNull();
    expect(conversao(1000n, 'EURO', '2026-07-21')).toBeNull();
    expect(conversao(1000n, 'R$', '2026-07-21')).toBeNull();
  });

  it('RN-017 › BRL → taxa 1, data_cotacao nula, valor igual ao original', () => {
    expect(conversao(8800n, 'BRL', '2026-07-27')).toEqual(['1', null, 8800n]);
    expect(conversao(-4500n, 'BRL', '1999-01-01')).toEqual(['1', null, -4500n]);
  });

  it('RN-017 › cotação antiga continua valendo: EUR em 2026-12-31 usa a de 2026-07-28 (AMB-035)', () => {
    expect(conversao(1000n, 'EUR', '2026-12-31')).toEqual(['6.02', '2026-07-28', 6020n]);
  });

  /** `[código, valor em reais, reembolsável]` de cada item pelo motor. */
  function motor(despesas: Record<string, unknown>[], opcoes: Opcoes = {}) {
    return rodar(despesas, opcoes).map((i) => [i.motivo.codigo, i.valorSolicitado, i.valorReembolsavel]);
  }

  it('RN-017 › e-006 (55,00 GBP) → CAMBIO_INDISPONIVEL, valor_solicitado nulo', () => {
    const e006 = { id: 'e-006', data: '2026-07-21', categoria: 'representacao', valor: 55, moeda: 'GBP' };
    const [i] = rodar([e006], { centroCusto: 'CC-COMERCIAL' });
    expect(i).toMatchObject({ moeda: 'GBP', valorOriginal: 5500n, conversao: null, valorSolicitado: null, valorReembolsavel: 0n });
    expect(i?.motivo.codigo).toBe('CAMBIO_INDISPONIVEL');
    expect(statusDe(i!)).toBe('RECUSADO');
  });

  it('RN-017 › 10,00 "EURO" → CAMBIO_INDISPONIVEL, e não DADO_INVALIDO', () => {
    expect(motor([{ valor: 10, moeda: 'EURO' }])).toEqual([['CAMBIO_INDISPONIVEL', null, 0n]]);
    expect(rodar([{ valor: 10, moeda: ' euro ' }])[0]?.moeda).toBe('EURO');
  });

  it('RN-017 › EUR em 2026-07-10 → CAMBIO_INDISPONIVEL', () => {
    expect(motor([{ data: '2026-07-10', valor: 10, moeda: 'EUR' }])).toEqual([['CAMBIO_INDISPONIVEL', null, 0n]]);
    expect(motor([{ data: '2026-07-13', valor: 10, moeda: 'EUR' }])).toEqual([['APROVADO_INTEGRAL', 5910n, 5910n]]);
  });

  it('RN-017 › EUR em 2026-06-30 num período de julho → FORA_DO_PERIODO, e não CAMBIO_INDISPONIVEL', () => {
    const [i] = rodar([{ data: '2026-06-30', valor: 10, moeda: 'EUR' }]);
    expect(i?.motivo.codigo).toBe('FORA_DO_PERIODO');
    // sem cotação até a data: os três campos de conversão nulos (seção 4)
    expect(i).toMatchObject({ conversao: null, valorSolicitado: null, valorOriginal: 1000n });
    // com cotação, o recusado antes do câmbio sai convertido
    const [j] = rodar([{ data: '2026-08-03', valor: 10, moeda: 'EUR' }]);
    expect(j?.motivo.codigo).toBe('FORA_DO_PERIODO');
    expect(j?.conversao).toMatchObject({ dataCotacao: '2026-07-28', valorSolicitado: 6020n });
  });

  it('RN-017 › GBP com categoria coworking → CATEGORIA_NAO_REEMBOLSAVEL (etapa 5 antes da 6)', () => {
    expect(motor([{ categoria: 'coworking', valor: 55, moeda: 'GBP' }])).toEqual([['CATEGORIA_NAO_REEMBOLSAVEL', null, 0n]]);
  });

  it('RN-017 › e-010 (sem moeda) → BRL, taxa_cambio 1', () => {
    const e010 = { id: 'e-010', data: '2026-07-27', valor: 88, fornecedor: 'Bistro Central', moeda: undefined };
    const [i] = rodar([e010], { centroCusto: 'CC-COMERCIAL' });
    expect(i).toMatchObject({ moeda: 'BRL', valorOriginal: 8800n, valorSolicitado: 8800n, valorReembolsavel: 8800n });
    expect(i?.conversao).toEqual({ taxa: expect.objectContaining({ texto: '1' }), dataCotacao: null, valorSolicitado: 8800n });
  });

  it('RN-017 › limite compara o valor em reais: 22,00 EUR (R$ 130,46) de alimentação na tabela padrão → PARCIAL 60,00', () => {
    expect(motor([{ data: '2026-07-14', valor: 22, moeda: 'EUR' }])).toEqual([['LIMITE_DIARIO_EXCEDIDO', 13046n, 6000n]]);
    const [i] = rodar([{ data: '2026-07-14', valor: 22, moeda: 'EUR' }]);
    expect(i?.valorOriginal).toBe(2200n);
    expect(statusDe(i!)).toBe('PARCIAL');
  });

  it('RN-017 › câmbio: "usd" no arquivo é indexado como USD', () => {
    const c = lerCambio('{"moeda_base": "BRL", "taxas": {"2026-07-13": {"usd": 5.42, " Eur ": 5.91}}}');
    expect([...c.keys()]).toEqual(['USD', 'EUR']);
    expect(c.get('USD')?.[0]?.taxa.texto).toBe('5.42');
  });

  it('RN-017 › câmbio: "USD": 5.42 e depois "usd": 5.50 na mesma data → vale 5.50, sem erro', () => {
    const c = lerCambio('{"moeda_base": "BRL", "taxas": {"2026-07-13": {"USD": 5.42, "usd": 5.50}}}');
    expect(c.get('USD')).toEqual([{ data: '2026-07-13', taxa: expect.objectContaining({ texto: '5.50' }) }]);
    const inverso = lerCambio('{"moeda_base": "BRL", "taxas": {"2026-07-13": {"usd": 5.50, "USD": 5.42}}}');
    expect(inverso.get('USD')?.[0]?.taxa.texto).toBe('5.42');
  });

  it('RN-017 › câmbio: datas fora de ordem no arquivo ficam em ordem crescente no índice', () => {
    const c = lerCambio(
      '{"moeda_base": "BRL", "taxas": {"2026-07-20": {"USD": 5.50}, "2026-07-13": {"USD": 5.42}, "2026-07-17": {"USD": 5.47, "EUR": 5.96}}}',
    );
    expect(c.get('USD')?.map((k) => k.data)).toEqual(['2026-07-13', '2026-07-17', '2026-07-20']);
    expect(c.get('EUR')?.map((k) => k.data)).toEqual(['2026-07-17']);
  });
});
