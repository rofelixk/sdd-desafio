import { describe, expect, it } from 'vitest';
import { MODELOS, montarMotivo } from '../../src/nucleo/motivos.ts';
import type { Decisao } from '../../src/nucleo/motivos.ts';
import { rodar } from '../apoio.ts';

const LIMITE = {
  categoria: 'alimentacao',
  periodicidade: 'dia',
  data: '2026-07-03',
  diarias: 1,
  limite: 6000n,
  saldoDisponivel: 1500n,
  saldoApos: 0n,
  solicitado: 3000n,
  reembolsavel: 1500n,
} as const;

/** Uma decisão de exemplo para cada código da tabela da seção 4. */
const EXEMPLOS: Decisao[] = [
  { codigo: 'APROVADO_INTEGRAL', detalhes: { ...LIMITE, reembolsavel: 3000n } },
  { codigo: 'LIMITE_DIARIO_EXCEDIDO', detalhes: LIMITE },
  { codigo: 'LIMITE_DIARIO_ESGOTADO', detalhes: { ...LIMITE, saldoDisponivel: 0n, reembolsavel: 0n } },
  { codigo: 'DADO_INVALIDO', detalhes: { campo: 'data', problema: 'data_invalida' } },
  { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valorOriginal: -4500n, moeda: 'BRL', emReais: -4500n } },
  { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valorOriginal: 1n, moeda: 'XYZ', emReais: 0n } },
  { codigo: 'CAMBIO_INDISPONIVEL', detalhes: { moeda: 'GBP', data: '2026-07-21' } },
  { codigo: 'FORA_DO_PERIODO', detalhes: { data: '2026-04-15', inicio: '2026-07-01', fim: '2026-07-31' } },
  {
    codigo: 'CATEGORIA_NAO_REEMBOLSAVEL',
    detalhes: { categoria: 'coworking', tabela: 'padrao', versao: 'v4', caso: 'ausente', centroCusto: null },
  },
  {
    codigo: 'CATEGORIA_NAO_REEMBOLSAVEL',
    detalhes: { categoria: 'hospedagem', tabela: 'CC-X', versao: 'v4', caso: 'limite_zero', centroCusto: 'CC-X' },
  },
  { codigo: 'DUPLICATA', detalhes: { idAceito: 'd-006' } },
  {
    codigo: 'REQUER_APROVACAO',
    detalhes: { ...LIMITE, categoria: 'hospedagem', periodicidade: 'diaria', diarias: 3, solicitado: 120000n, reembolsavel: 120000n },
  },
  { codigo: 'NOTA_FISCAL_AUSENTE', detalhes: { valor: 10001n, limiar: { digitos: 10000n, escala: 2 } } },
];

describe('RN-013 — Justificativa obrigatória', () => {
  it('RN-013 › todo código da seção 4 gera descrição não vazia', () => {
    expect(Object.keys(MODELOS).sort()).toEqual([...new Set(EXEMPLOS.map((e) => e.codigo))].sort());
    expect(Object.keys(MODELOS)).toHaveLength(11);
    for (const decisao of EXEMPLOS) {
      const m = montarMotivo(decisao);
      expect(m.codigo).toBe(decisao.codigo);
      expect(m.descricao.trim(), decisao.codigo).not.toBe('');
    }
    for (const problema of ['nao_objeto', 'ausente', 'data_invalida', 'nao_numerico', 'nao_booleano', 'repetido'] as const) {
      expect(montarMotivo({ codigo: 'DADO_INVALIDO', detalhes: { campo: 'id', problema } }).descricao, problema).not.toBe('');
    }
  });

  it('RN-013 › LIMITE_DIARIO_EXCEDIDO cita limite, saldo disponível e valor cortado', () => {
    const [d001] = rodar([{ id: 'd-001', valor: 72.5 }]);
    expect(d001?.motivo.descricao).toMatch(/R\$ 60,00.*saldo disponível R\$ 60,00.*excedente de R\$ 12,50/);
    const [, b] = rodar([{ id: 'a', valor: 45 }, { id: 'b', valor: 30, fornecedor: 'Y' }]);
    expect(b?.motivo.codigo).toBe('LIMITE_DIARIO_EXCEDIDO');
    expect(b?.motivo.descricao).toMatch(/R\$ 60,00.*saldo disponível R\$ 15,00.*excedente de R\$ 15,00/);
  });

  it('RN-013 › LIMITE_DIARIO_ESGOTADO cita o limite e o saldo zerado', () => {
    const [, d002] = rodar([
      { id: 'd-001', valor: 72.5, fornecedor: 'Tavola' },
      { id: 'd-002', valor: 38, fornecedor: 'Porto' },
    ]);
    expect(d002?.motivo.codigo).toBe('LIMITE_DIARIO_ESGOTADO');
    expect(d002?.motivo.descricao).toMatch(/R\$ 60,00.*saldo disponível R\$ 0,00/);
  });

  it('RN-013 › item em moeda estrangeira: descrição traz valor original × taxa, data da cotação e valor em reais', () => {
    const [d, e002, e004, fora] = rodar([
      { data: '2026-07-14', valor: 10, moeda: 'EUR' },
      { data: '2026-07-14', valor: 22, moeda: 'EUR', fornecedor: 'Taberna', categoria: 'transporte_urbano' },
      { data: '2026-07-18', valor: 30, moeda: 'eur' },
      { data: '2026-08-03', valor: 10, moeda: 'USD' },
    ]);
    expect(d?.motivo.descricao).toBe(
      'EUR 10,00 × 5,93 (cotação de 2026-07-14) = R$ 59,30; dentro do limite diário de alimentação (R$ 60,00); saldo do dia após este item: R$ 0,70.',
    );
    expect(e002?.motivo.descricao).toMatch(/^EUR 22,00 × 5,93 \(cotação de 2026-07-14\) = R\$ 130,46; /);
    expect(e004?.motivo.descricao).toMatch(/^EUR 30,00 × 5,96 \(cotação de 2026-07-17\) = R\$ 178,80; limite diário/);
    // também nos recusados antes do limite
    expect(fora?.motivo.descricao).toMatch(/^USD 10,00 × 5,51 \(cotação de 2026-07-28\) = R\$ 55,10; data 2026-08-03 fora do período/);
    // BRL não traz a conta
    expect(rodar([{ valor: 45 }])[0]?.motivo.descricao).not.toMatch(/×/);
  });

  it('RN-013 › CAMBIO_INDISPONIVEL cita a moeda e a data da despesa', () => {
    const [gbp, eur] = rodar([
      { data: '2026-07-21', valor: 55, moeda: 'GBP' },
      { data: '2026-07-10', valor: 10, moeda: ' eur ' },
    ]);
    expect(gbp?.motivo).toEqual({
      codigo: 'CAMBIO_INDISPONIVEL',
      descricao: 'Sem cotação de GBP até 2026-07-21 no arquivo de câmbio; o valor não pode ser convertido para reais.',
    });
    expect(eur?.motivo.descricao).toMatch(/EUR até 2026-07-10/);
  });

  it('RN-013 › NOTA_FISCAL_AUSENTE em moeda estrangeira cita o valor em reais e o limiar', () => {
    const [e005] = rodar([{ categoria: 'transporte_urbano', data: '2026-07-20', valor: 40, moeda: 'USD', tem_nota_fiscal: false }]);
    expect(e005?.motivo.codigo).toBe('NOTA_FISCAL_AUSENTE');
    expect(e005?.motivo.descricao).toBe(
      'USD 40,00 × 5,50 (cotação de 2026-07-20) = R$ 220,00; valor R$ 220,00 acima de R$ 100,00 exige nota fiscal, que não foi informada.',
    );
  });

  it('RN-013 › hospedagem cita o limite por diária', () => {
    const [h] = rodar([{ categoria: 'hospedagem', descricao: '2 diarias', valor: 600 }]);
    expect(h?.motivo.descricao).toMatch(/R\$ 250,00 por diária.*2 diárias.*saldo disponível R\$ 500,00.*R\$ 100,00/);
  });
});
