import { describe, expect, it } from 'vitest';
import { verificarCategoria } from '../../src/nucleo/elegibilidade.ts';
import { TABELA_PADRAO, codigosPassada1, entrada, rodar, tabela, valida } from '../apoio.ts';

describe('RN-006 — Categorias reembolsáveis', () => {
  it('RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBOLSAVEL', () => {
    const r = verificarCategoria(valida({ id: 'd-005', categoria: 'coworking', valor: 89 }), TABELA_PADRAO);
    expect(r).toMatchObject({ codigo: 'CATEGORIA_NAO_REEMBOLSAVEL', detalhes: { categoria: 'coworking', caso: 'ausente' } });
  });

  it('RN-006 › alimentacao, transporte_urbano e hospedagem são reembolsáveis', () => {
    for (const categoria of ['alimentacao', 'transporte_urbano', 'hospedagem', ' Hospedagem ', 'ALIMENTAÇÃO']) {
      expect(verificarCategoria(valida({ categoria }), TABELA_PADRAO), categoria).toBeNull();
    }
    for (const categoria of ['transporte', 'constructor', 'toString', '__proto__']) {
      expect(verificarCategoria(valida({ categoria }), TABELA_PADRAO)?.codigo, categoria).toBe('CATEGORIA_NAO_REEMBOLSAVEL');
    }
  });

  it('RN-006 › hospedagem no CC-ENG-PLATAFORMA → CATEGORIA_NAO_REEMBOLSAVEL, descrição cita "CC-ENG-PLATAFORMA"', () => {
    const opcoes = { centroCusto: 'cc-eng-plataforma' };
    const r = verificarCategoria(valida({ categoria: 'Hospedagem', valor: 200 }), tabela(opcoes));
    expect(r).toEqual({
      codigo: 'CATEGORIA_NAO_REEMBOLSAVEL',
      detalhes: { categoria: 'hospedagem', tabela: 'CC-ENG-PLATAFORMA', versao: 'v4', caso: 'limite_zero', centroCusto: 'CC-ENG-PLATAFORMA' },
    });
    const [i] = rodar([{ categoria: 'Hospedagem', valor: 200 }], opcoes);
    expect(i).toMatchObject({ categoria: 'hospedagem', valorReembolsavel: 0n, limiteDiarioAplicado: null, diarias: null });
    expect(i?.motivo.codigo).toBe('CATEGORIA_NAO_REEMBOLSAVEL');
    expect(i?.motivo.descricao).toContain('CC-ENG-PLATAFORMA');
    expect(i?.motivo.descricao).toMatch(/não é reembolsável no centro de custo/);
  });

  it('RN-006 › representacao na tabela padrão → CATEGORIA_NAO_REEMBOLSAVEL, descrição diz que não consta na política', () => {
    const [i] = rodar([{ categoria: 'representacao', valor: 190 }]);
    expect(i?.motivo.codigo).toBe('CATEGORIA_NAO_REEMBOLSAVEL');
    expect(i?.motivo.descricao).toBe("Categoria 'representacao' não consta na tabela padrão da política v4.");
    const [j] = rodar([{ categoria: 'coworking', valor: 89 }], { centroCusto: 'CC-ADM' });
    expect(j?.motivo.descricao).toMatch(/não consta na tabela do centro de custo CC-ADM nem na tabela padrão da política v4/);
  });

  it('RN-006 › limite 0 recusa na etapa 5: hospedagem 690,00 sem NF no CC-ENG-PLATAFORMA sai CATEGORIA_NAO_REEMBOLSAVEL', () => {
    const hospedagem = { categoria: 'hospedagem', valor: 690, tem_nota_fiscal: false, descricao: '3 noites' };
    const opcoes = { centroCusto: 'CC-ENG-PLATAFORMA' };
    expect(codigosPassada1(entrada([hospedagem], opcoes), opcoes)).toEqual(['CATEGORIA_NAO_REEMBOLSAVEL']);
    expect(codigosPassada1(entrada([hospedagem]))).toEqual(['NOTA_FISCAL_AUSENTE']);
  });
});
