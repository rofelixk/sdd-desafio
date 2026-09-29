// Um teste por linha da tabela da seção 7 da spec, com o título exato da coluna "Caso".
// Período padrão: 2026-07-01 a 2026-07-31.

import { describe, expect, it } from 'vitest';
import { statusDe } from '../src/nucleo/status.ts';
import type { ResultadoItem } from '../src/nucleo/tipos.ts';
import { calcular } from '../src/nucleo/motor.ts';
import { entrada, rodar } from './apoio.ts';

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

describe('Casos de borda — período, valor não positivo e categoria', () => {
  it('Borda › Primeiro dia do período', () => {
    expect(decisao(rodar([{ data: '2026-07-01' }])[0]).codigo).toBe('APROVADO_INTEGRAL');
  });

  it('Borda › Último dia do período', () => {
    expect(decisao(rodar([{ data: '2026-07-31' }])[0]).codigo).toBe('APROVADO_INTEGRAL');
  });

  it('Borda › Dia seguinte ao período', () => {
    expect(decisao(rodar([{ data: '2026-08-01' }])[0])).toMatchObject({ status: 'RECUSADO', codigo: 'FORA_DO_PERIODO' });
  });

  it('Borda › Estorno', () => {
    const r = calcular(entrada([{ valor: -45 }, { valor: 10, fornecedor: 'Y' }]));
    expect(decisao(r.itens[0])).toEqual({ status: 'RECUSADO', codigo: 'VALOR_NAO_POSITIVO', solicitado: -4500n, reembolsavel: 0n });
    expect(r.resumo.totalSolicitado).toBe(1000n);
  });

  it('Borda › Valor zero', () => {
    expect(decisao(rodar([{ valor: 0 }])[0])).toMatchObject({ status: 'RECUSADO', codigo: 'VALOR_NAO_POSITIVO' });
  });

  it('Borda › Categoria em maiúsculas', () => {
    const [i] = rodar([{ categoria: 'ALIMENTACAO' }]);
    expect(i?.categoria).toBe('alimentacao');
    expect(i?.limiteDiarioAplicado).toBe(6000n);
  });

  it('Borda › Categoria com acento', () => {
    const [i] = rodar([{ categoria: 'alimentação' }]);
    expect(i?.categoria).toBe('alimentacao');
    expect(decisao(i).codigo).toBe('APROVADO_INTEGRAL');
  });

  it('Borda › Categoria desconhecida', () => {
    const [i] = rodar([{ categoria: 'coworking', valor: 89 }]);
    expect(decisao(i)).toMatchObject({ status: 'RECUSADO', codigo: 'CATEGORIA_NAO_REEMBOLSAVEL' });
    expect(i?.categoria).toBe('coworking');
  });
});

/** Código do motivo de cada item. */
function codigos(despesas: Record<string, unknown>[]): string[] {
  return rodar(despesas).map((i) => i.motivo.codigo);
}

describe('Casos de borda — duplicatas', () => {
  const almoco = { data: '2026-07-03', fornecedor: 'Tavola', valor: 40 };

  it('Borda › Mesmo fornecedor, datas diferentes', () => {
    expect(codigos([almoco, { ...almoco, data: '2026-07-31' }])).toEqual(['APROVADO_INTEGRAL', 'APROVADO_INTEGRAL']);
  });

  it('Borda › Duplicata com e sem NF', () => {
    expect(codigos([{ ...almoco, tem_nota_fiscal: true }, { ...almoco, tem_nota_fiscal: false }])).toEqual([
      'APROVADO_INTEGRAL',
      'DUPLICATA',
    ]);
  });

  it('Borda › Três cópias idênticas', () => {
    expect(codigos([almoco, almoco, almoco])).toEqual(['APROVADO_INTEGRAL', 'DUPLICATA', 'DUPLICATA']);
  });

  it('Borda › Fornecedor com grafia diferente', () => {
    expect(codigos([{ ...almoco, fornecedor: 'Bistro Central' }, { ...almoco, fornecedor: 'bistro central ' }])).toEqual([
      'APROVADO_INTEGRAL',
      'DUPLICATA',
    ]);
  });

  it('Borda › Fornecedores diferentes', () => {
    expect(codigos([{ ...almoco, fornecedor: 'Tavola' }, { ...almoco, fornecedor: 'Porto' }])).not.toContain('DUPLICATA');
  });

  it('Borda › Ambas sem fornecedor', () => {
    expect(codigos([{ ...almoco, fornecedor: undefined }, { ...almoco, fornecedor: undefined }])).toEqual([
      'APROVADO_INTEGRAL',
      'DUPLICATA',
    ]);
  });

  it('Borda › Só uma com fornecedor', () => {
    expect(codigos([{ ...almoco, fornecedor: 'Tavola' }, { ...almoco, fornecedor: undefined }])).toEqual([
      'APROVADO_INTEGRAL',
      'LIMITE_DIARIO_EXCEDIDO',
    ]);
  });

  it('Borda › Fornecedor vazio', () => {
    expect(
      codigos([
        { ...almoco, fornecedor: '' },
        { ...almoco, fornecedor: '   ' },
        { ...almoco, fornecedor: undefined },
      ]),
    ).toEqual(['APROVADO_INTEGRAL', 'DUPLICATA', 'DUPLICATA']);
  });

  it('Borda › Fornecedor numérico', () => {
    expect(codigos([{ ...almoco, fornecedor: 123 }, { ...almoco, fornecedor: '123' }])).toEqual([
      'APROVADO_INTEGRAL',
      'DUPLICATA',
    ]);
  });

  it('Borda › Fornecedor nulo', () => {
    expect(codigos([{ ...almoco, fornecedor: null }, { ...almoco, fornecedor: undefined }])).toEqual([
      'APROVADO_INTEGRAL',
      'DUPLICATA',
    ]);
  });
});

describe('Casos de borda — hospedagem e diárias', () => {
  const hotel = { categoria: 'hospedagem', data: '2026-07-14', fornecedor: 'Hotel' };

  /** `[status, reembolsável, diarias]` de uma hospedagem isolada. */
  function hospedagem(campos: Record<string, unknown>) {
    const [i] = rodar([{ ...hotel, ...campos }]);
    return [decisao(i).status, i?.valorReembolsavel, i?.diarias];
  }

  it('Borda › Diárias na descrição', () => {
    const [i] = rodar([{ ...hotel, descricao: 'Hotel Rio - 2 diarias', valor: 480 }]);
    expect(decisao(i)).toMatchObject({ status: 'APROVADO', reembolsavel: 48000n });
    expect(i).toMatchObject({ diarias: 2, limiteDiarioAplicado: 25000n });
  });

  it('Borda › Diárias com acento e maiúscula', () => {
    expect(hospedagem({ descricao: '3 Diárias', valor: 600 })).toEqual(['APROVADO', 60000n, 3]);
  });

  it('Borda › Duas hospedagens na mesma noite', () => {
    const itens = rodar([
      { ...hotel, id: 'h1', data: '2026-07-14', descricao: '2 diarias', valor: 480 },
      { ...hotel, id: 'h2', data: '2026-07-15', descricao: '1 diaria', valor: 200, fornecedor: 'Pousada' },
    ]);
    expect(itens.map((i) => [decisao(i).status, i.valorReembolsavel])).toEqual([
      ['APROVADO', 48000n],
      ['PARCIAL', 1000n],
    ]);
  });

  it('Borda › Diária média acima do limite', () => {
    expect(hospedagem({ descricao: '2 diarias', valor: 600 })).toEqual(['PARCIAL', 50000n, 2]);
  });

  it('Borda › Divisão com centavos', () => {
    expect(hospedagem({ descricao: '3 diarias', valor: 100 })).toEqual(['APROVADO', 10000n, 3]);
  });

  it('Borda › Noite fora do período', () => {
    expect(hospedagem({ data: '2026-07-31', descricao: '2 diarias', valor: 400 })).toEqual(['APROVADO', 40000n, 2]);
  });

  it('Borda › Número que não é diária', () => {
    expect(hospedagem({ descricao: 'Hotel 5 estrelas', valor: 300 })).toEqual(['PARCIAL', 25000n, 1]);
  });

  it('Borda › Descrição sem número', () => {
    expect(hospedagem({ descricao: 'Pousada', valor: 300 })).toEqual(['PARCIAL', 25000n, 1]);
  });

  it('Borda › Zero diárias', () => {
    expect(hospedagem({ descricao: '0 diarias', valor: 100 })).toEqual(['APROVADO', 10000n, 1]);
  });

  it('Borda › Número solto antes das diárias', () => {
    expect(hospedagem({ descricao: 'Hotel 5 estrelas - 2 diarias', valor: 480 })).toEqual(['APROVADO', 48000n, 2]);
  });

  it('Borda › Diárias fracionárias', () => {
    expect(hospedagem({ descricao: 'Hotel 1.5 diarias', valor: 300 })).toEqual(['PARCIAL', 25000n, 1]);
  });

  it('Borda › Hospedagem sem descrição', () => {
    expect(hospedagem({ descricao: undefined, valor: 300 })).toEqual(['PARCIAL', 25000n, 1]);
    expect(hospedagem({ descricao: null, valor: 300 })).toEqual(['PARCIAL', 25000n, 1]);
  });

  it('Borda › Descrição não textual', () => {
    expect(hospedagem({ descricao: 2, valor: 300 })).toEqual(['PARCIAL', 25000n, 1]);
  });
});

describe('Casos de borda — viagem', () => {
  const hotel = { categoria: 'hospedagem', data: '2026-07-14', descricao: 'Hotel', fornecedor: 'Hotel', valor: 200 };
  const alimentacao80 = { categoria: 'alimentacao', valor: 80 };

  it('Borda › Alimentação em dia de viagem', () => {
    const [, a] = rodar([hotel, { ...alimentacao80, data: '2026-07-14' }]);
    expect(decisao(a)).toMatchObject({ status: 'APROVADO', reembolsavel: 8000n });
    expect(a).toMatchObject({ limiteDiarioAplicado: 9000n, emViagem: true });
  });

  it('Borda › Transporte em dia de viagem', () => {
    const [, t] = rodar([hotel, { categoria: 'transporte_urbano', data: '2026-07-14', valor: 130, tem_nota_fiscal: true }]);
    expect(decisao(t)).toMatchObject({ status: 'PARCIAL', reembolsavel: 12000n });
  });

  it('Borda › Dia do check-out', () => {
    const [, a] = rodar([hotel, { ...alimentacao80, data: '2026-07-15' }]);
    expect(decisao(a)).toMatchObject({ status: 'PARCIAL', reembolsavel: 6000n });
    expect(a?.emViagem).toBe(false);
  });

  it('Borda › Noite seguinte da estadia', () => {
    const [, a] = rodar([{ ...hotel, descricao: 'Hotel 2 diarias' }, { ...alimentacao80, data: '2026-07-15' }]);
    expect(decisao(a)).toMatchObject({ status: 'APROVADO', reembolsavel: 8000n });
    expect(a?.emViagem).toBe(true);
  });

  it('Borda › Hospedagem recusada não gera viagem', () => {
    const itens = rodar([
      { ...hotel, valor: 690, tem_nota_fiscal: false },
      { ...alimentacao80, data: '2026-07-14' },
    ]);
    expect(itens.map((i) => [decisao(i).status, decisao(i).reembolsavel])).toEqual([
      ['RECUSADO', 0n],
      ['PARCIAL', 6000n],
    ]);
  });

  it('Borda › Viagem não altera o limiar de NF', () => {
    const [, t] = rodar([hotel, { ...transporteSemNf, data: '2026-07-14', valor: 110 }]);
    expect(decisao(t)).toMatchObject({ status: 'RECUSADO', codigo: 'NOTA_FISCAL_AUSENTE' });
  });
});
