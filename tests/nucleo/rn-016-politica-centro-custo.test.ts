import { describe, expect, it } from 'vitest';
import { tabelaAplicavel } from '../../src/nucleo/politica.ts';
import { POLITICA_V4 } from '../apoio.ts';

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

  it('RN-016 › limiar de nota fiscal e acréscimo de viagem são os da tabela, iguais para todo centro de custo', () => {
    for (const cc of [null, 'CC-COMERCIAL', 'CC-ADM', 'CC-ENG-PLATAFORMA', 'CC-X']) {
      const t = tabelaAplicavel(POLITICA_V4, cc);
      expect(t.limiarNotaFiscal, String(cc)).toEqual({ digitos: 10000n, escala: 2 });
      expect(t.acrescimoViagemPercentual, String(cc)).toEqual({ digitos: 50n, escala: 0 });
    }
  });
});
