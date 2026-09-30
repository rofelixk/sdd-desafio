import { describe, expect, it } from 'vitest';
import { normalizar } from '../../src/nucleo/texto.ts';
import { decisoes, rodar } from '../apoio.ts';

describe('RN-002 — Normalização da categoria', () => {
  it('RN-002 › "ALIMENTACAO", " Alimentação " e "alimentacao" viram alimentacao', () => {
    expect(normalizar('ALIMENTACAO')).toBe('alimentacao');
    expect(normalizar(' Alimentação ')).toBe('alimentacao');
    expect(normalizar('alimentacao')).toBe('alimentacao');
  });

  it('RN-002 › "Transporte_Urbano" e "HOSPEDAGEM" viram transporte_urbano e hospedagem', () => {
    expect(normalizar('Transporte_Urbano')).toBe('transporte_urbano');
    expect(normalizar('HOSPEDAGEM')).toBe('hospedagem');
  });

  it('RN-002 › "ALIMENTACAO" e "alimentacao" na mesma data somam no mesmo limite diário', () => {
    expect(
      decisoes([
        { categoria: 'ALIMENTACAO', valor: 40, fornecedor: 'A' },
        { categoria: 'alimentacao', valor: 40, fornecedor: 'B' },
        { categoria: ' Alimentação ', valor: 40, fornecedor: 'C' },
      ]),
    ).toEqual([
      ['APROVADO', 'APROVADO_INTEGRAL', 4000n],
      ['PARCIAL', 'LIMITE_DIARIO_EXCEDIDO', 2000n],
      ['RECUSADO', 'LIMITE_DIARIO_ESGOTADO', 0n],
    ]);
    expect(rodar([{ categoria: 'ALIMENTACAO' }])[0]?.categoria).toBe('alimentacao');
  });

  it('RN-002 › "Representação" é representacao no CC-COMERCIAL e sai como veio na tabela padrão', () => {
    const despesa = { categoria: 'Representação', valor: 200 };
    const [comercial] = rodar([despesa], { centroCusto: 'CC-COMERCIAL' });
    expect(comercial?.categoria).toBe('representacao');
    expect(comercial?.motivo.codigo).toBe('APROVADO_INTEGRAL');
    const [padrao] = rodar([despesa]);
    expect(padrao?.categoria).toBe('Representação');
    expect(padrao?.motivo.codigo).toBe('CATEGORIA_NAO_REEMBOLSAVEL');
  });
});
