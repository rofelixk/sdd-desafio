import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ErroEntrada, lerEntrada } from '../../src/io/entrada.ts';
import { lerPolitica } from '../../src/io/politica.ts';

const VALIDO = {
  colaborador: { id: 'c-0417', nome: 'Marina' },
  periodo: { competencia: '2026-07', inicio: '2026-07-01', fim: '2026-07-31' },
  despesas: [],
};

/** Entrada válida com trocas no primeiro nível ou em `colaborador`/`periodo` (`undefined` remove). */
function arquivo(trocas: { raiz?: Record<string, unknown>; colaborador?: Record<string, unknown>; periodo?: Record<string, unknown> }): string {
  return JSON.stringify({
    ...VALIDO,
    colaborador: { ...VALIDO.colaborador, ...trocas.colaborador },
    periodo: { ...VALIDO.periodo, ...trocas.periodo },
    ...trocas.raiz,
  });
}

/** Mensagem do `ErroEntrada` lançado ao ler `texto`. */
function erro(texto: string): string {
  try {
    lerEntrada(texto);
  } catch (e) {
    expect(e).toBeInstanceOf(ErroEntrada);
    return (e as Error).message;
  }
  throw new Error(`entrada aceita: ${texto}`);
}

describe('RN-015 — Arquivo de entrada inválido', () => {
  it('RN-015 › sem periodo → erro cuja mensagem cita periodo', () => {
    expect(erro(arquivo({ raiz: { periodo: undefined } }))).toContain('periodo');
  });

  it('RN-015 › sem colaborador.id → erro cuja mensagem cita colaborador.id', () => {
    expect(erro(arquivo({ colaborador: { id: undefined } }))).toContain('colaborador.id');
    expect(erro(arquivo({ raiz: { colaborador: undefined } }))).toContain('colaborador.id');
  });

  it('RN-015 › periodo.inicio ou periodo.fim inválidos → erro', () => {
    expect(erro(arquivo({ periodo: { inicio: '2026-02-30' } }))).toContain('periodo.inicio');
    expect(erro(arquivo({ periodo: { fim: '31/07/2026' } }))).toContain('periodo.fim');
    expect(erro(arquivo({ periodo: { fim: undefined } }))).toContain('periodo.fim');
  });

  it('RN-015 › inicio depois de fim → erro', () => {
    expect(erro(arquivo({ periodo: { inicio: '2026-08-01' } }))).toMatch(/periodo\.inicio.*periodo\.fim/);
  });

  it('RN-015 › despesas ausente ou que não é lista → erro cuja mensagem cita despesas', () => {
    for (const despesas of [undefined, null, {}, 'x', 1]) {
      expect(erro(arquivo({ raiz: { despesas } })), String(despesas)).toContain('despesas');
    }
  });

  it('RN-015 › texto que não é JSON → erro', () => {
    for (const texto of ['', 'não é json', '{"colaborador": ', "{'a': 1}"]) {
      expect(erro(texto), texto).toContain('JSON');
    }
  });

  it('RN-015 › despesas: [] é entrada válida', () => {
    const e = lerEntrada(arquivo({}));
    expect(e.despesas).toEqual([]);
    expect([e.inicio, e.fim]).toEqual(['2026-07-01', '2026-07-31']);
    expect(e.periodo).toMatchObject({ competencia: '2026-07' });
    expect(lerEntrada(arquivo({ periodo: { fim: '2026-07-01' } })).fim).toBe('2026-07-01');
  });

  it('RN-015 › colaborador.id "", "  ", null ou 123 → erro cuja mensagem cita colaborador.id', () => {
    for (const id of ['', '  ', null, 123, true, ['c-1']]) {
      expect(erro(arquivo({ colaborador: { id } })), JSON.stringify(id)).toContain('colaborador.id');
    }
  });

  it('RN-015 › periodo.inicio 20260701 ou null → erro cuja mensagem cita periodo.inicio', () => {
    for (const inicio of [20260701, null, '', '  ']) {
      expect(erro(arquivo({ periodo: { inicio } })), JSON.stringify(inicio)).toContain('periodo.inicio');
    }
  });

  it('RN-015 › colaborador ou periodo que não é objeto → erro', () => {
    expect(erro(JSON.stringify({ ...VALIDO, colaborador: 'c-0417' }))).toContain('colaborador.id');
    expect(erro(JSON.stringify({ ...VALIDO, colaborador: ['c-0417'] }))).toContain('colaborador.id');
    expect(erro(JSON.stringify({ ...VALIDO, periodo: '2026-07' }))).toContain('periodo');
    expect(erro(JSON.stringify({ ...VALIDO, periodo: null }))).toContain('periodo');
  });

  it('RN-015 › JSON que não é objeto ([], 42, "x") → erro', () => {
    for (const texto of ['[]', '42', '"x"', 'null', 'true']) {
      expect(erro(texto), texto).toContain('objeto');
    }
  });
});

// ---------------------------------------------------------------------------
// Arquivos externos (RN-015, RN-016, RN-017, AMB-044)
// ---------------------------------------------------------------------------

const POLITICA_V4 = readFileSync('exemplos/envelope/politica-v4.json', 'utf8');

/** Tabela da v4 relida como objeto comum, para trocar campos no teste. */
function politicaV4(): Record<string, any> {
  return JSON.parse(POLITICA_V4);
}

/** Mensagem do `ErroEntrada` lançado por `ler(texto)`. */
function erroDe(ler: (texto: string) => unknown, texto: string): string {
  try {
    ler(texto);
  } catch (e) {
    expect(e).toBeInstanceOf(ErroEntrada);
    return (e as Error).message;
  }
  throw new Error(`arquivo aceito: ${texto}`);
}

/** Mensagem do erro da tabela de limites depois de `trocar` a tabela da v4. */
function erroTabela(trocar: (p: Record<string, any>) => void): string {
  const p = politicaV4();
  trocar(p);
  return erroDe(lerPolitica, JSON.stringify(p));
}

describe('RN-015 — Arquivo de entrada inválido (tabela de limites)', () => {
  it('RN-015 › tabela de limites de exemplos/envelope/politica-v4.json é lida: versao v4, padrão com 3 categorias, 3 centros de custo, limiar 100.00 e acréscimo 50', () => {
    const p = lerPolitica(POLITICA_V4);
    expect(p.versao).toBe('v4');
    expect(p.vigencia).toBe('2026-07-01');
    expect([...p.padrao.keys()]).toEqual(['alimentacao', 'transporte_urbano', 'hospedagem']);
    expect(p.padrao.get('hospedagem')).toEqual({ limite: 25000n, periodicidade: 'diaria' });
    expect([...p.centrosCusto.values()].map((c) => c.nome)).toEqual(['CC-ENG-PLATAFORMA', 'CC-COMERCIAL', 'CC-ADM']);
    expect(p.centrosCusto.get('cc-comercial')?.categorias.get('representacao')).toEqual({ limite: 30000n, periodicidade: 'dia' });
    expect(p.centrosCusto.get('cc-eng-plataforma')?.categorias.get('hospedagem')?.limite).toBe(0n);
    expect(p.limiarNotaFiscal).toEqual({ digitos: 10000n, escala: 2 });
    expect(p.acrescimoViagemPercentual).toEqual({ digitos: 50n, escala: 0 });
  });

  it('RN-015 › tabela de limites com "limite": -10 → erro que cita a tabela de limites e o campo', () => {
    const m = erroTabela((p) => (p.centros_custo['CC-ADM'].alimentacao.limite = -10));
    expect(m).toMatch(/^tabela de limites \(dados\/politica\.json\): /);
    expect(m).toContain('centros_custo.CC-ADM.alimentacao.limite');
    expect(erroTabela((p) => (p.padrao.hospedagem.limite = -0.01))).toContain('padrao.hospedagem.limite');
  });

  it('RN-015 › tabela de limites: limite que não é número ou com mais de 2 casas (60.001) → erro que cita o campo', () => {
    for (const limite of ['60.00', null, true, [60], undefined]) {
      expect(erroTabela((p) => (p.padrao.alimentacao.limite = limite)), String(limite)).toContain('padrao.alimentacao.limite');
    }
    const texto = JSON.stringify(politicaV4());
    expect(erroDe(lerPolitica, texto.replace('"limite":60,', '"limite":60.001,'))).toMatch(/padrao\.alimentacao\.limite.*60\.001/);
    // zeros à direita não contam como casas
    const lida = lerPolitica(texto.replace('"limite":60,', '"limite":60.0100,'));
    expect(lida.padrao.get('alimentacao')?.limite).toBe(6001n);
  });

  it('RN-015 › tabela de limites sem versao, com versao vazia ou com vigencia que não é data → erro que cita o campo', () => {
    for (const versao of [undefined, '', '   ', 4, null]) {
      expect(erroTabela((p) => (p.versao = versao)), String(versao)).toContain('versao');
    }
    for (const vigencia of [undefined, '2026-02-30', '01/07/2026', 20260701]) {
      expect(erroTabela((p) => (p.vigencia = vigencia)), String(vigencia)).toContain('vigencia');
    }
  });

  it('RN-015 › tabela de limites: moeda_base diferente de BRL → erro', () => {
    for (const moeda_base of ['USD', undefined, null]) {
      expect(erroTabela((p) => (p.moeda_base = moeda_base)), String(moeda_base)).toContain('moeda_base');
    }
  });

  it('RN-015 › tabela de limites: periodicidade fora de dia/diaria, diaria em alimentacao ou hospedagem com dia → erro', () => {
    expect(erroTabela((p) => (p.padrao.alimentacao.periodicidade = 'mes'))).toContain('padrao.alimentacao.periodicidade');
    expect(erroTabela((p) => delete p.padrao.alimentacao.periodicidade)).toContain('padrao.alimentacao.periodicidade');
    expect(erroTabela((p) => (p.padrao.alimentacao.periodicidade = 'diaria'))).toContain('padrao.alimentacao.periodicidade');
    expect(erroTabela((p) => (p.centros_custo['CC-COMERCIAL'].hospedagem.periodicidade = 'dia'))).toContain(
      'centros_custo.CC-COMERCIAL.hospedagem.periodicidade',
    );
  });

  it('RN-015 › tabela de limites: nota_fiscal_obrigatoria_acima_de ou acrescimo_em_viagem_percentual ausente, não numérico ou negativo → erro', () => {
    for (const campo of ['nota_fiscal_obrigatoria_acima_de', 'acrescimo_em_viagem_percentual']) {
      for (const valor of [undefined, '100', null, -1]) {
        expect(erroTabela((p) => (p[campo] = valor)), `${campo} = ${String(valor)}`).toContain(campo);
      }
    }
  });

  it('RN-015 › tabela de limites: "CC-ADM" e " cc-adm " em centros_custo, ou "Alimentação" e "alimentacao" na mesma tabela → erro', () => {
    const regra = { limite: 10, periodicidade: 'dia' };
    expect(erroTabela((p) => (p.centros_custo[' cc-adm '] = { alimentacao: regra }))).toMatch(/centros_custo.*CC-ADM.* cc-adm /);
    expect(erroTabela((p) => (p.padrao['Alimentação'] = regra))).toMatch(/padrao.*alimentacao.*Alimentação/);
    expect(erroTabela((p) => (p.centros_custo['CC-ADM']['ALIMENTACAO'] = regra))).toContain('centros_custo.CC-ADM');
  });

  it('RN-015 › tabela de limites: arquivo, padrao, centros_custo, centro de custo ou categoria que não é objeto → erro', () => {
    for (const texto of ['[]', '42', '"x"', 'null']) {
      expect(erroDe(lerPolitica, texto), texto).toMatch(/^tabela de limites .*objeto/);
    }
    expect(erroTabela((p) => (p.padrao = []))).toContain('padrao');
    expect(erroTabela((p) => delete p.padrao)).toContain('padrao');
    expect(erroTabela((p) => (p.centros_custo = 'CC-ADM'))).toContain('centros_custo');
    expect(erroTabela((p) => (p.centros_custo['CC-ADM'] = 45))).toContain('centros_custo.CC-ADM');
    expect(erroTabela((p) => (p.padrao.alimentacao = 60))).toContain('padrao.alimentacao');
  });

  it('RN-015 › tabela de limites: observacao e campos desconhecidos são ignorados', () => {
    const p = politicaV4();
    p.observacao = 'nota do financeiro';
    p.aprovacao_manual = { acima_de: 500 };
    p.padrao.alimentacao.observacao = 42;
    p.padrao.alimentacao.teto = 'x';
    const lida = lerPolitica(JSON.stringify(p));
    expect(lida.padrao.get('alimentacao')).toEqual({ limite: 6000n, periodicidade: 'dia' });
    expect(lida.centrosCusto.get('cc-eng-plataforma')?.categorias.get('hospedagem')).toEqual({ limite: 0n, periodicidade: 'diaria' });
  });

  it('RN-015 › tabela de limites que não é JSON → erro que cita a tabela de limites', () => {
    for (const texto of ['', 'não é json', '{"versao": ']) {
      expect(erroDe(lerPolitica, texto), texto).toMatch(/^tabela de limites \(dados\/politica\.json\): .*JSON/);
    }
    expect(erroDe((t) => lerPolitica(t, 'tabela X'), '{')).toMatch(/^tabela X: /);
  });
});
