import { describe, expect, it } from 'vitest';
import { verificarCategoria } from '../../src/nucleo/elegibilidade.ts';
import { TABELA_PADRAO, valida } from '../apoio.ts';

describe('RN-006 — Categorias reembolsáveis', () => {
  it('RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBOLSAVEL', () => {
    const r = verificarCategoria(valida({ id: 'd-005', categoria: 'coworking', valor: 89 }), TABELA_PADRAO);
    expect(r).toEqual({ codigo: 'CATEGORIA_NAO_REEMBOLSAVEL', detalhes: { categoria: 'coworking' } });
  });

  it('RN-006 › alimentacao, transporte_urbano e hospedagem são reembolsáveis', () => {
    for (const categoria of ['alimentacao', 'transporte_urbano', 'hospedagem', ' Hospedagem ', 'ALIMENTAÇÃO']) {
      expect(verificarCategoria(valida({ categoria }), TABELA_PADRAO), categoria).toBeNull();
    }
    for (const categoria of ['transporte', 'constructor', 'toString', '__proto__']) {
      expect(verificarCategoria(valida({ categoria }), TABELA_PADRAO)?.codigo, categoria).toBe('CATEGORIA_NAO_REEMBOLSAVEL');
    }
  });
});
