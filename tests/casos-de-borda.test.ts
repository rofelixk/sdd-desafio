// Um teste por linha da tabela da seção 7 da spec, com o título exato da coluna "Caso".
// Período padrão: 2026-07-01 a 2026-07-31.

import { describe, expect, it } from 'vitest';
import { statusDe } from '../src/nucleo/status.ts';
import type { ResultadoItem } from '../src/nucleo/tipos.ts';
import { rodar } from './apoio.ts';

/** O que a seção 7 verifica em cada item. */
function decisao(i: ResultadoItem | undefined) {
  if (!i) throw new Error('item ausente');
  return { status: statusDe(i), codigo: i.motivo.codigo, solicitado: i.valorSolicitado, reembolsavel: i.valorReembolsavel };
}

const transporteSemNf = { categoria: 'transporte_urbano', tem_nota_fiscal: false };

describe('Casos de borda — nota fiscal e arredondamento', () => {
  it('Borda › Nota fiscal no limiar exato', () => {
    expect(decisao(rodar([{ ...transporteSemNf, valor: 100 }])[0])).toEqual({
      status: 'PARCIAL',
      codigo: 'LIMITE_DIARIO_EXCEDIDO',
      solicitado: 10000n,
      reembolsavel: 8000n,
    });
  });

  it('Borda › Um centavo acima do limiar', () => {
    expect(decisao(rodar([{ ...transporteSemNf, valor: 100.01 }])[0])).toMatchObject({
      status: 'RECUSADO',
      codigo: 'NOTA_FISCAL_AUSENTE',
    });
  });

  it('Borda › Arredondamento que cruza o limiar', () => {
    expect(decisao(rodar([{ ...transporteSemNf, valor: 100.004 }])[0])).toEqual({
      status: 'PARCIAL',
      codigo: 'LIMITE_DIARIO_EXCEDIDO',
      solicitado: 10000n,
      reembolsavel: 8000n,
    });
  });

  it('Borda › Arredondamento meio-para-o-par no limiar', () => {
    expect(decisao(rodar([{ ...transporteSemNf, valor: 100.005 }])[0])).toMatchObject({
      codigo: 'LIMITE_DIARIO_EXCEDIDO',
      solicitado: 10000n,
    });
  });

  it('Borda › Meio-para-o-par sobe', () => {
    expect(decisao(rodar([{ ...transporteSemNf, valor: 100.015 }])[0])).toMatchObject({
      status: 'RECUSADO',
      codigo: 'NOTA_FISCAL_AUSENTE',
      solicitado: 10002n,
    });
  });

  it('Borda › Fora do ponto médio', () => {
    expect(decisao(rodar([{ ...transporteSemNf, valor: 100.0051 }])[0])).toMatchObject({
      status: 'RECUSADO',
      codigo: 'NOTA_FISCAL_AUSENTE',
      solicitado: 10001n,
    });
  });

  it('Borda › Três casas decimais', () => {
    expect(decisao(rodar([{ valor: 33.333 }])[0])).toEqual({
      status: 'APROVADO',
      codigo: 'APROVADO_INTEGRAL',
      solicitado: 3333n,
      reembolsavel: 3333n,
    });
  });
});

describe('Casos de borda — limite diário', () => {
  it('Borda › Exatamente no limite diário', () => {
    expect(decisao(rodar([{ valor: 60 }])[0])).toMatchObject({ status: 'APROVADO', reembolsavel: 6000n });
  });

  it('Borda › Um centavo acima do limite', () => {
    expect(decisao(rodar([{ valor: 60.01 }])[0])).toMatchObject({ status: 'PARCIAL', reembolsavel: 6000n });
  });

  it('Borda › Várias no mesmo dia', () => {
    const itens = rodar([
      { valor: 72.5, fornecedor: 'Tavola' },
      { valor: 38, fornecedor: 'Porto' },
    ]);
    expect(itens.map(decisao)).toEqual([
      { status: 'PARCIAL', codigo: 'LIMITE_DIARIO_EXCEDIDO', solicitado: 7250n, reembolsavel: 6000n },
      { status: 'RECUSADO', codigo: 'LIMITE_DIARIO_ESGOTADO', solicitado: 3800n, reembolsavel: 0n },
    ]);
  });

  it('Borda › Recusada não consome limite', () => {
    const itens = rodar([
      { ...transporteSemNf, valor: 100.01 },
      { ...transporteSemNf, valor: 100 },
    ]);
    expect(itens.map(decisao)).toEqual([
      { status: 'RECUSADO', codigo: 'NOTA_FISCAL_AUSENTE', solicitado: 10001n, reembolsavel: 0n },
      { status: 'PARCIAL', codigo: 'LIMITE_DIARIO_EXCEDIDO', solicitado: 10000n, reembolsavel: 8000n },
    ]);
  });

  it('Borda › Mesmo dia, categorias diferentes', () => {
    const itens = rodar([
      { categoria: 'alimentacao', valor: 60 },
      { categoria: 'transporte_urbano', valor: 80 },
    ]);
    expect(itens.map((i) => decisao(i).status)).toEqual(['APROVADO', 'APROVADO']);
  });

  it('Borda › Fim de semana', () => {
    expect(decisao(rodar([{ data: '2026-07-18', valor: 47.2 }])[0])).toMatchObject({
      status: 'APROVADO',
      reembolsavel: 4720n,
    });
  });
});
