import { describe, expect, it } from 'vitest';
import { statusDe } from '../../src/nucleo/status.ts';
import { decisoes, rodar } from '../apoio.ts';

const comercial = { centroCusto: 'CC-COMERCIAL' };
const hospedagem = { categoria: 'hospedagem', data: '2026-07-22', fornecedor: 'Hotel', tem_nota_fiscal: true };

describe('RN-018 — Aprovação manual de itens acima de R$ 500', () => {
  it('RN-018 › e-007 (hospedagem 1.200,00, 3 × 400,00 no CC-COMERCIAL) → PENDENTE REQUER_APROVACAO, reembolsável 1.200,00', () => {
    const e007 = { ...hospedagem, id: 'e-007', descricao: 'Hotel Londres - 3 noites', fornecedor: 'Premier Inn', valor: 1200 };
    const [i] = rodar([e007], comercial);
    expect(statusDe(i!)).toBe('PENDENTE');
    expect(i).toMatchObject({ valorSolicitado: 120000n, valorReembolsavel: 120000n, diarias: 3, limiteDiarioAplicado: 40000n });
    expect(i?.motivo.codigo).toBe('REQUER_APROVACAO');
  });

  it('RN-018 › reembolsável exatamente 500,00 → APROVADO, não PENDENTE', () => {
    expect(decisoes([{ ...hospedagem, descricao: '2 diarias', valor: 500 }], comercial)).toEqual([
      ['APROVADO', 'APROVADO_INTEGRAL', 50000n],
    ]);
  });

  it('RN-018 › reembolsável 500,01 (CC-COMERCIAL, "2 diarias" 500,01) → PENDENTE', () => {
    expect(decisoes([{ ...hospedagem, descricao: '2 diarias', valor: 500.01 }], comercial)).toEqual([
      ['PENDENTE', 'REQUER_APROVACAO', 50001n],
    ]);
  });

  it('RN-018 › hospedagem 1.200,00 com 1 diária na tabela padrão → PARCIAL 250,00, não PENDENTE', () => {
    expect(decisoes([{ ...hospedagem, descricao: 'Hotel', valor: 1200 }])).toEqual([['PARCIAL', 'LIMITE_DIARIO_EXCEDIDO', 25000n]]);
  });

  it('RN-018 › PENDENTE consome o limite: hospedagem seguinte na mesma noite → LIMITE_DIARIO_ESGOTADO', () => {
    expect(
      decisoes(
        [
          { ...hospedagem, descricao: '2 diarias', valor: 800 },
          { ...hospedagem, descricao: '1 diaria', valor: 100, fornecedor: 'Pousada' },
          { ...hospedagem, data: '2026-07-24', descricao: '1 diaria', valor: 100, fornecedor: 'Pousada' },
        ],
        comercial,
      ),
    ).toEqual([
      ['PENDENTE', 'REQUER_APROVACAO', 80000n],
      ['RECUSADO', 'LIMITE_DIARIO_ESGOTADO', 0n],
      ['APROVADO', 'APROVADO_INTEGRAL', 10000n],
    ]);
  });

  it('RN-018 › descrição cita o valor calculado, o limiar de R$ 500,00 e o corte de limite', () => {
    const [cortado, inteiro] = rodar(
      [
        { ...hospedagem, descricao: '2 diarias', valor: 1000 },
        { ...hospedagem, data: '2026-07-25', descricao: '3 noites', valor: 1200 },
      ],
      comercial,
    );
    expect(cortado?.motivo.descricao).toMatch(/R\$ 800,00.*R\$ 500,00.*R\$ 400,00 por diária.*excedente de R\$ 200,00/);
    expect(inteiro?.motivo.descricao).toMatch(/R\$ 1\.200,00.*R\$ 500,00/);
    expect(inteiro?.motivo.descricao).not.toMatch(/excedente/);
  });
});
