import { describe, expect, it } from 'vitest';
import { limiteDiario } from '../../src/nucleo/limites.ts';
import { TABELA_PADRAO, alocarDespesas } from '../apoio.ts';

/** `[código, reembolsável]` de cada despesa. */
function resumo(despesas: Record<string, unknown>[], dias?: ReadonlySet<string>): [string, bigint][] {
  return alocarDespesas(despesas, dias).map((a) => [a.codigo, a.reembolsavel]);
}

describe('RN-009 — Limites diários por categoria', () => {
  it('RN-009 › alimentação isolada de 60,00 → APROVADO 60,00', () => {
    expect(resumo([{ valor: 60 }])).toEqual([['APROVADO_INTEGRAL', 6000n]]);
  });

  it('RN-009 › d-012 (sábado, 47,20) → APROVADO 47,20', () => {
    expect(resumo([{ id: 'd-012', data: '2026-07-18', valor: 47.2 }])).toEqual([['APROVADO_INTEGRAL', 4720n]]);
  });

  it('RN-009 › categorias diferentes no mesmo dia têm limites independentes', () => {
    expect(
      resumo([
        { categoria: 'alimentacao', valor: 60 },
        { categoria: 'transporte_urbano', valor: 80 },
        { categoria: 'hospedagem', valor: 250 },
      ]),
    ).toEqual([
      ['APROVADO_INTEGRAL', 6000n],
      ['APROVADO_INTEGRAL', 8000n],
      ['APROVADO_INTEGRAL', 25000n],
    ]);
  });

  it('RN-009 › em dia de viagem alimentação vai a 90,00 e transporte a 120,00, hospedagem fica em 250,00', () => {
    const viagem = new Set(['2026-07-03']);
    expect(limiteDiario('alimentacao', '2026-07-03', viagem, TABELA_PADRAO)).toBe(9000n);
    expect(limiteDiario('transporte_urbano', '2026-07-03', viagem, TABELA_PADRAO)).toBe(12000n);
    expect(limiteDiario('hospedagem', '2026-07-03', viagem, TABELA_PADRAO)).toBe(25000n);
    expect(limiteDiario('alimentacao', '2026-07-04', viagem, TABELA_PADRAO)).toBe(6000n);
    expect(
      resumo(
        [
          { categoria: 'alimentacao', valor: 100 },
          { categoria: 'transporte_urbano', valor: 130 },
          { categoria: 'hospedagem', valor: 300 },
        ],
        viagem,
      ),
    ).toEqual([
      ['LIMITE_DIARIO_EXCEDIDO', 9000n],
      ['LIMITE_DIARIO_EXCEDIDO', 12000n],
      ['LIMITE_DIARIO_EXCEDIDO', 25000n],
    ]);
  });
});
