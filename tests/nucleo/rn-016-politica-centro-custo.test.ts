import { describe, expect, it } from 'vitest';
import { tabelaAplicavel } from '../../src/nucleo/politica.ts';
import { statusDe } from '../../src/nucleo/status.ts';
import { POLITICA_V4, calcularV4, entrada, politicaCom } from '../apoio.ts';
import type { Opcoes } from '../apoio.ts';

/** `categoria → [limite, origem]` da tabela aplicável. */
function limites(centroCusto: string | null): Record<string, [bigint, string]> {
  const t = tabelaAplicavel(POLITICA_V4, centroCusto);
  return Object.fromEntries([...t.categorias].map(([c, r]) => [c, [r.limite, r.origem]]));
}

describe('RN-016 — Política por centro de custo', () => {
  it('RN-016 › CC-SUPORTE-N2 (sem entrada) → tabela "padrao", alimentação 60,00', () => {
    const t = tabelaAplicavel(POLITICA_V4, 'CC-SUPORTE-N2');
    expect(t).toMatchObject({ nome: 'padrao', versao: 'v4', centroCusto: null });
    expect(limites('CC-SUPORTE-N2')).toEqual({
      alimentacao: [6000n, 'padrao'],
      transporte_urbano: [8000n, 'padrao'],
      hospedagem: [25000n, 'padrao'],
    });
  });

  it('RN-016 › " cc-comercial " → tabela "CC-COMERCIAL"', () => {
    const t = tabelaAplicavel(POLITICA_V4, ' cc-comercial ');
    expect(t).toMatchObject({ nome: 'CC-COMERCIAL', centroCusto: 'CC-COMERCIAL' });
    expect(t.categorias.get('alimentacao')).toEqual({ limite: 9000n, periodicidade: 'dia', origem: 'centro_custo' });
    expect(tabelaAplicavel(POLITICA_V4, 'Cc-Comercial').nome).toBe('CC-COMERCIAL');
  });

  it('RN-016 › sem centro de custo → tabela "padrao"', () => {
    expect(tabelaAplicavel(POLITICA_V4, null)).toMatchObject({ nome: 'padrao', centroCusto: null });
    expect(limites(null)).toEqual(limites('CC-SUPORTE-N2'));
  });

  it('RN-016 › CC-ADM sem hospedagem → hospedagem 250,00 herdada do padrão', () => {
    expect(limites('CC-ADM')).toEqual({
      alimentacao: [4500n, 'centro_custo'],
      transporte_urbano: [6000n, 'centro_custo'],
      hospedagem: [25000n, 'padrao'],
    });
    expect(tabelaAplicavel(POLITICA_V4, 'CC-ADM').categorias.get('hospedagem')?.periodicidade).toBe('diaria');
  });

  it('RN-016 › CC-ENG-PLATAFORMA: hospedagem com limite 0 não herda do padrão', () => {
    expect(limites('CC-ENG-PLATAFORMA')).toEqual({
      alimentacao: [7500n, 'centro_custo'],
      transporte_urbano: [8000n, 'centro_custo'],
      hospedagem: [0n, 'centro_custo'],
    });
  });

  it('RN-016 › representacao só existe na tabela do CC-COMERCIAL', () => {
    expect(limites('CC-COMERCIAL').representacao).toEqual([30000n, 'centro_custo']);
    for (const cc of [null, 'CC-SUPORTE-N2', 'CC-ADM', 'CC-ENG-PLATAFORMA']) {
      expect(tabelaAplicavel(POLITICA_V4, cc).categorias.has('representacao'), String(cc)).toBe(false);
    }
  });

  /** `[status, código, reembolsável]` e a tabela aplicada, pelo motor completo. */
  function motor(despesas: Record<string, unknown>[], opcoes: Opcoes = {}) {
    const r = calcularV4(entrada(despesas, opcoes), opcoes);
    return { tabela: r.politica.tabela, itens: r.itens.map((i) => [statusDe(i), i.motivo.codigo, i.valorReembolsavel]) };
  }

  it('RN-016 › CC-SUPORTE-N2: alimentação 65,00 → PARCIAL 60,00', () => {
    expect(motor([{ valor: 65 }], { centroCusto: 'CC-SUPORTE-N2' })).toEqual({
      tabela: 'padrao',
      itens: [['PARCIAL', 'LIMITE_DIARIO_EXCEDIDO', 6000n]],
    });
  });

  it('RN-016 › " cc-comercial ": alimentação 85,00 → APROVADO 85,00', () => {
    expect(motor([{ valor: 85 }], { centroCusto: ' cc-comercial ' })).toEqual({
      tabela: 'CC-COMERCIAL',
      itens: [['APROVADO', 'APROVADO_INTEGRAL', 8500n]],
    });
  });

  it('RN-016 › CC-ADM: hospedagem 1 diária 300,00 → PARCIAL 250,00', () => {
    const r = calcularV4(entrada([{ categoria: 'hospedagem', descricao: 'Hotel - 1 diaria', valor: 300 }], { centroCusto: 'CC-ADM' }));
    expect(r.politica).toEqual({ versao: 'v4', tabela: 'CC-ADM' });
    expect(r.itens[0]).toMatchObject({ valorReembolsavel: 25000n, limiteDiarioAplicado: 25000n, diarias: 1 });
    expect(r.itens[0]?.motivo.codigo).toBe('LIMITE_DIARIO_EXCEDIDO');
  });

  it('RN-016 › representacao no CC-SUPORTE-N2 → CATEGORIA_NAO_REEMBOLSAVEL', () => {
    expect(motor([{ categoria: 'representacao', valor: 190 }], { centroCusto: 'CC-SUPORTE-N2' }).itens).toEqual([
      ['RECUSADO', 'CATEGORIA_NAO_REEMBOLSAVEL', 0n],
    ]);
  });

  it('RN-016 › limite de alimentação do padrão trocado para 70,00 na tabela: alimentação 65,00 passa de PARCIAL a APROVADO', () => {
    const politica = politicaCom((p) => (p.padrao.alimentacao.limite = 70.0));
    expect(motor([{ valor: 65 }]).itens).toEqual([['PARCIAL', 'LIMITE_DIARIO_EXCEDIDO', 6000n]]);
    expect(motor([{ valor: 65 }], { politica }).itens).toEqual([['APROVADO', 'APROVADO_INTEGRAL', 6500n]]);
    expect(motor([{ valor: 65 }], { politica, centroCusto: 'CC-SUPORTE-N2' }).itens).toEqual([['APROVADO', 'APROVADO_INTEGRAL', 6500n]]);
  });

  it('RN-016 › vigencia 2026-08-01 não recusa nem muda despesas de julho (AMB-034)', () => {
    const despesas = [
      { data: '2026-07-01', valor: 65 },
      { data: '2026-07-31', categoria: 'transporte_urbano', valor: 50 },
      { data: '2026-06-30', valor: 10 },
    ];
    const futura = politicaCom((p) => (p.vigencia = '2026-08-01'));
    expect(motor(despesas, { politica: futura })).toEqual(motor(despesas));
    expect(motor(despesas, { politica: futura }).itens.map((i) => i[1])).toEqual([
      'LIMITE_DIARIO_EXCEDIDO',
      'APROVADO_INTEGRAL',
      'FORA_DO_PERIODO',
    ]);
  });

  it('RN-016 › limiar de nota fiscal e acréscimo de viagem são os da tabela, iguais para todo centro de custo', () => {
    for (const cc of [null, 'CC-COMERCIAL', 'CC-ADM', 'CC-ENG-PLATAFORMA', 'CC-X']) {
      const t = tabelaAplicavel(POLITICA_V4, cc);
      expect(t.limiarNotaFiscal, String(cc)).toEqual({ digitos: 10000n, escala: 2 });
      expect(t.acrescimoViagemPercentual, String(cc)).toEqual({ digitos: 50n, escala: 0 });
    }
  });
});
