import { describe, expect, it } from 'vitest';
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

describe('RN-014 — Totais do resumo', () => {
  it('RN-014 › soma de valor_reembolsavel dos itens = total_reembolsavel e contagens somam quantidade_itens', () => {
    const { itens, resumo } = calcularV4(variado);
    expect(resumo.totalReembolsavel).toBe(itens.reduce((s, i) => s + i.valorReembolsavel, 0n));
    expect(resumo.quantidadeItens).toBe(8);
    expect(resumo.aprovados + resumo.parciais + resumo.recusados).toBe(resumo.quantidadeItens);
    expect([resumo.aprovados, resumo.parciais, resumo.recusados]).toEqual([1, 1, 6]);
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

  it('RN-014 › lista vazia → contagens 0 e totais 0,00', () => {
    expect(calcularV4(entrada([])).resumo).toEqual({
      quantidadeItens: 0,
      aprovados: 0,
      parciais: 0,
      recusados: 0,
      totalSolicitado: 0n,
      totalReembolsavel: 0n,
      totalNaoReembolsado: 0n,
    });
  });
});
