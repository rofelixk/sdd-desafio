import { describe, expect, it } from 'vitest';
import { ErroEntrada, lerEntrada } from '../../src/io/entrada.ts';

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
