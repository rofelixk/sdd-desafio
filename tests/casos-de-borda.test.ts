// Um teste por linha da tabela da seção 7 da spec, com o título exato da coluna "Caso".
// Período padrão: 2026-07-01 a 2026-07-31.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { serializarJson } from '../src/io/json.ts';
import { montarSaida } from '../src/io/saida.ts';
import { statusDe } from '../src/nucleo/status.ts';
import type { ResultadoItem } from '../src/nucleo/tipos.ts';
import { calcular } from '../src/nucleo/motor.ts';
import { NumeroJson } from '../src/nucleo/tipos.ts';
import { cru, entrada, rodar } from './apoio.ts';

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

describe('Casos de borda — id, data, categoria e eco inválidos', () => {
  it('Borda › Data impossível', () => {
    const itens = rodar([{ data: '2026-02-30' }, { data: '2026-07-04' }]);
    expect(itens.map(decisao)).toEqual([
      { status: 'RECUSADO', codigo: 'DADO_INVALIDO', solicitado: 4500n, reembolsavel: 0n },
      { status: 'APROVADO', codigo: 'APROVADO_INTEGRAL', solicitado: 4500n, reembolsavel: 4500n },
    ]);
    expect(itens[0]?.data).toBe('2026-02-30');
  });

  it('Borda › id repetido', () => {
    expect(codigos([{ id: 'd-001' }, { id: 'd-001', data: '2026-07-04' }])).toEqual(['APROVADO_INTEGRAL', 'DADO_INVALIDO']);
  });

  it('Borda › id repetido com outra grafia', () => {
    const itens = rodar([{ id: 'd-001' }, { id: ' D-001 ', data: '2026-07-04' }]);
    expect(itens.map((i) => i.motivo.codigo)).toEqual(['APROVADO_INTEGRAL', 'DADO_INVALIDO']);
    expect(itens[1]?.id).toBe(' D-001 ');
  });

  it('Borda › Correção de item inválido', () => {
    expect(codigos([{ id: 'd-001', data: '2026-07-32' }, { id: 'd-001' }])).toEqual(['DADO_INVALIDO', 'APROVADO_INTEGRAL']);
  });

  it('Borda › id de item recusado depois da validação', () => {
    expect(codigos([{ id: 'd-001', data: '2026-08-15' }, { id: 'd-001' }])).toEqual(['FORA_DO_PERIODO', 'DADO_INVALIDO']);
  });

  it('Borda › Valor inválido na saída', () => {
    const r = calcular(entrada([{ valor: 'R$ 45,00' }, { valor: 10, fornecedor: 'Y' }]));
    expect(decisao(r.itens[0])).toEqual({ status: 'RECUSADO', codigo: 'DADO_INVALIDO', solicitado: null, reembolsavel: 0n });
    expect(r.resumo.totalSolicitado).toBe(1000n);
  });

  it('Borda › Eco de campo inválido', () => {
    const [i] = rodar([{ categoria: 123 }]);
    expect(i?.motivo.codigo).toBe('DADO_INVALIDO');
    expect(i?.categoria).toEqual(new NumeroJson('123'));
  });

  it('Borda › Despesa que não é objeto', () => {
    const [i, j] = rodar([cru('42'), {}]);
    expect(i).toMatchObject({ id: null, data: null, categoria: null, valorSolicitado: null, valorReembolsavel: 0n });
    expect(decisao(i)).toMatchObject({ status: 'RECUSADO', codigo: 'DADO_INVALIDO' });
    expect(decisao(j).codigo).toBe('APROVADO_INTEGRAL');
  });

  it('Borda › Categoria vazia', () => {
    const [i] = rodar([{ categoria: '  ' }]);
    expect(i?.motivo.codigo).toBe('DADO_INVALIDO');
    expect(i?.categoria).toBe('  ');
  });

  it('Borda › Categoria não textual', () => {
    expect(codigos([{ categoria: 123 }])).toEqual(['DADO_INVALIDO']);
  });

  it('Borda › id vazio', () => {
    const [i] = rodar([{ id: '' }]);
    expect(i?.motivo.codigo).toBe('DADO_INVALIDO');
    expect(i?.id).toBe('');
  });

  it('Borda › data nula', () => {
    const [i] = rodar([{ data: null }]);
    expect(i?.motivo.codigo).toBe('DADO_INVALIDO');
    expect(i?.data).toBeNull();
  });
});

describe('Casos de borda — valor como texto', () => {
  it('Borda › Valor como texto com ponto', () => {
    expect(decisao(rodar([{ valor: '45.00' }])[0])).toEqual({
      status: 'APROVADO',
      codigo: 'APROVADO_INTEGRAL',
      solicitado: 4500n,
      reembolsavel: 4500n,
    });
  });

  it('Borda › Valor como texto com vírgula', () => {
    expect(decisao(rodar([{ valor: '45,00' }])[0])).toMatchObject({ status: 'APROVADO', solicitado: 4500n });
  });

  it('Borda › Valor texto com 3 casas', () => {
    expect(decisao(rodar([{ valor: '33,333' }])[0])).toMatchObject({ solicitado: 3333n, reembolsavel: 3333n });
  });

  it('Borda › Valor texto negativo', () => {
    expect(decisao(rodar([{ valor: '-45,00' }])[0])).toMatchObject({ status: 'RECUSADO', codigo: 'VALOR_NAO_POSITIVO' });
  });

  it('Borda › Separador de milhar', () => {
    expect(decisao(rodar([{ valor: '1.234,56' }])[0])).toMatchObject({ codigo: 'DADO_INVALIDO', solicitado: null });
  });

  it('Borda › Símbolo de moeda', () => {
    expect(decisao(rodar([{ valor: 'R$ 45,00' }])[0])).toMatchObject({ codigo: 'DADO_INVALIDO', solicitado: null });
  });

  it('Borda › Valor booleano', () => {
    expect(decisao(rodar([{ valor: true }])[0])).toMatchObject({ codigo: 'DADO_INVALIDO', solicitado: null });
  });
});

describe('Casos de borda — tem_nota_fiscal', () => {
  const transporte150 = { categoria: 'transporte_urbano', valor: 150 };

  it('Borda › tem_nota_fiscal ausente, valor 150,00', () => {
    expect(codigos([{ ...transporte150, tem_nota_fiscal: undefined }])).toEqual(['NOTA_FISCAL_AUSENTE']);
  });

  it('Borda › tem_nota_fiscal nulo ou "", valor 150,00', () => {
    expect(codigos([{ ...transporte150, tem_nota_fiscal: null }])).toEqual(['NOTA_FISCAL_AUSENTE']);
    expect(codigos([{ ...transporte150, tem_nota_fiscal: '' }])).toEqual(['NOTA_FISCAL_AUSENTE']);
  });

  it('Borda › tem_nota_fiscal vazio, valor 50,00', () => {
    expect(decisao(rodar([{ valor: 50, tem_nota_fiscal: null }])[0])).toMatchObject({
      status: 'APROVADO',
      codigo: 'APROVADO_INTEGRAL',
      reembolsavel: 5000n,
    });
  });

  it('Borda › tem_nota_fiscal texto', () => {
    expect(codigos([{ valor: 50, tem_nota_fiscal: 'true' }])).toEqual(['DADO_INVALIDO']);
    expect(codigos([{ valor: 50, tem_nota_fiscal: 'sim' }])).toEqual(['DADO_INVALIDO']);
  });

  it('Borda › tem_nota_fiscal número', () => {
    expect(codigos([{ valor: 50, tem_nota_fiscal: 1 }])).toEqual(['DADO_INVALIDO']);
    expect(codigos([{ valor: 50, tem_nota_fiscal: 0 }])).toEqual(['DADO_INVALIDO']);
  });
});

describe('Casos de borda — arquivo', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'reembolso-borda-'));
  afterAll(() => rmSync(pasta, { recursive: true, force: true }));
  let contador = 0;

  /** Roda o CLI com `conteudo` como entrada; confere que nenhuma saída foi gerada. */
  function cliComErro(conteudo: string): string {
    const entradaArq = join(pasta, `entrada-${++contador}.json`);
    const saidaArq = join(pasta, `saida-${contador}.json`);
    writeFileSync(entradaArq, conteudo);
    const r = spawnSync(process.execPath, ['src/cli.ts', 'calcular', '--input', entradaArq, '--output', saidaArq], {
      encoding: 'utf8',
    });
    expect(r.status).toBe(1);
    expect(existsSync(saidaArq)).toBe(false);
    return r.stderr;
  }

  const valido = {
    colaborador: { id: 'c-1' },
    periodo: { inicio: '2026-07-01', fim: '2026-07-31' },
    despesas: [],
  };

  it('Borda › Lista de despesas vazia', () => {
    const texto = serializarJson(montarSaida(calcular(entrada([]))));
    expect(JSON.parse(texto).itens).toEqual([]);
    expect(texto).toContain('"total_solicitado": 0.00');
    expect(texto).toContain('"total_reembolsavel": 0.00');
    expect(texto).toContain('"total_nao_reembolsado": 0.00');
  });

  it('Borda › Arquivo sem periodo', () => {
    expect(cliComErro(JSON.stringify({ ...valido, periodo: undefined }))).toMatch(/^erro: .*periodo/);
  });

  it('Borda › inicio depois de fim', () => {
    const stderr = cliComErro(JSON.stringify({ ...valido, periodo: { inicio: '2026-07-31', fim: '2026-07-01' } }));
    expect(stderr).toMatch(/^erro: .*periodo.inicio/);
  });

  it('Borda › colaborador.id vazio', () => {
    expect(cliComErro(JSON.stringify({ ...valido, colaborador: { id: '  ' } }))).toMatch(/^erro: .*colaborador.id/);
  });

  it('Borda › periodo.inicio não textual', () => {
    const stderr = cliComErro('{"colaborador": {"id": "c-1"}, "periodo": {"inicio": 20260701, "fim": "2026-07-31"}, "despesas": []}');
    expect(stderr).toMatch(/^erro: .*periodo.inicio/);
  });

  it('Borda › Arquivo que não é objeto', () => {
    expect(cliComErro('[]')).toMatch(/^erro: /);
  });
});
