import { describe, expect, it } from 'vitest';
import { statusDe } from '../../src/nucleo/status.ts';
import { calcularV4, cru, entrada } from '../apoio.ts';

const variado = entrada([
  { id: 'a', valor: 72.5 },
  { id: 'b', valor: 38, fornecedor: 'Y' },
  { id: 'c', valor: -45 },
  { id: 'd', valor: 0 },
  { id: 'e', valor: 'R$ 45,00' },
  { id: 'f', data: '2026-07-32', valor: 10 },
  { id: 'g', categoria: 'transporte_urbano', valor: 33.333 },
  cru('42'),
]);

/** CC-COMERCIAL com um item PENDENTE (e-007) e itens APROVADO, PARCIAL e RECUSADO. */
const comPendente = entrada(
  [
    { id: 'h', categoria: 'hospedagem', data: '2026-07-22', descricao: '3 noites', valor: 1200 }, // PENDENTE 1.200,00
    { id: 'a', data: '2026-07-27', valor: 88 }, // APROVADO 88,00
    { id: 'p', data: '2026-07-13', categoria: 'representacao', valor: 340 }, // PARCIAL 300,00
    { id: 'r', data: '2026-07-24', categoria: 'coworking', valor: 120 }, // RECUSADO
  ],
  { centroCusto: 'CC-COMERCIAL' },
);

describe('RN-014 — Totais do resumo', () => {
  it('RN-014 › soma de valor_reembolsavel dos itens = total_reembolsavel e contagens somam quantidade_itens', () => {
    for (const e of [variado, comPendente]) {
      const { itens, resumo } = calcularV4(e);
      const naoPendentes = itens.filter((i) => statusDe(i) !== 'PENDENTE');
      expect(resumo.totalReembolsavel).toBe(naoPendentes.reduce((s, i) => s + i.valorReembolsavel, 0n));
      expect(resumo.aprovados + resumo.parciais + resumo.recusados + resumo.pendentes).toBe(resumo.quantidadeItens);
    }
    const { resumo } = calcularV4(variado);
    expect(resumo.quantidadeItens).toBe(8);
    expect([resumo.aprovados, resumo.parciais, resumo.recusados, resumo.pendentes]).toEqual([1, 1, 6, 0]);
  });

  it('RN-014 › total_solicitado ignora valores não positivos e nulos', () => {
    // a 72,50 + b 38,00 + f 10,00 (recusada, mas com valor numérico) + g 33,33
    expect(calcularV4(variado).resumo.totalSolicitado).toBe(7250n + 3800n + 1000n + 3333n);
  });

  it('RN-014 › total_nao_reembolsado = total_solicitado − total_reembolsavel, exato em centavos', () => {
    const { resumo } = calcularV4(variado);
    expect(resumo.totalReembolsavel).toBe(6000n + 3333n);
    expect(resumo.totalNaoReembolsado).toBe(resumo.totalSolicitado - resumo.totalReembolsavel);
    expect(resumo.totalNaoReembolsado).toBe(6050n);
  });

  it('RN-014 › total_solicitado soma o valor em reais e ignora CAMBIO_INDISPONIVEL (nulo)', () => {
    const { itens, resumo } = calcularV4(
      entrada([
        { data: '2026-07-14', valor: 22, moeda: 'EUR' }, // R$ 130,46 → 60,00
        { data: '2026-07-21', valor: 55, moeda: 'GBP' }, // sem cotação
        { data: '2026-07-10', valor: 10, moeda: 'EUR', fornecedor: 'Y' }, // antes da 1ª cotação
        { data: '2026-07-27', valor: 30, fornecedor: 'Z' }, // BRL
      ]),
    );
    expect(itens.map((i) => i.motivo.codigo)).toEqual([
      'LIMITE_DIARIO_EXCEDIDO',
      'CAMBIO_INDISPONIVEL',
      'CAMBIO_INDISPONIVEL',
      'APROVADO_INTEGRAL',
    ]);
    expect(resumo.totalSolicitado).toBe(13046n + 3000n);
    expect(resumo.totalReembolsavel).toBe(6000n + 3000n);
    expect(resumo.totalNaoReembolsado).toBe(7046n);
  });

  it('RN-014 › PENDENTE entra em total_solicitado e total_pendente, e não em total_reembolsavel', () => {
    const { resumo } = calcularV4(comPendente);
    expect(resumo.totalSolicitado).toBe(120000n + 8800n + 34000n + 12000n);
    expect(resumo.totalPendente).toBe(120000n);
    expect(resumo.totalReembolsavel).toBe(8800n + 30000n);
  });

  it('RN-014 › total_nao_reembolsado = total_solicitado − total_reembolsavel − total_pendente, exato em centavos', () => {
    const { resumo } = calcularV4(comPendente);
    expect(resumo.totalNaoReembolsado).toBe(resumo.totalSolicitado - resumo.totalReembolsavel - resumo.totalPendente);
    expect(resumo.totalNaoReembolsado).toBe(4000n + 12000n);
  });

  it('RN-014 › contagens (aprovados, parciais, recusados, pendentes) somam quantidade_itens', () => {
    const { resumo } = calcularV4(comPendente);
    expect([resumo.aprovados, resumo.parciais, resumo.recusados, resumo.pendentes]).toEqual([1, 1, 1, 1]);
    expect(resumo.quantidadeItens).toBe(4);
  });

  it('RN-014 › lista vazia → contagens 0 e totais 0,00', () => {
    expect(calcularV4(entrada([])).resumo).toMatchObject({
      quantidadeItens: 0,
      aprovados: 0,
      parciais: 0,
      recusados: 0,
      totalSolicitado: 0n,
      totalReembolsavel: 0n,
      totalNaoReembolsado: 0n,
    });
  });

  it('RN-014 › lista vazia → pendentes 0 e total_pendente 0,00', () => {
    expect(calcularV4(entrada([])).resumo).toMatchObject({ pendentes: 0, totalPendente: 0n });
  });
});
