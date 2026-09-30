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
  { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valor: -4500n } },
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
  { codigo: 'NOTA_FISCAL_AUSENTE', detalhes: { valor: 10001n, limiar: { digitos: 10000n, escala: 2 } } },
];

describe('RN-013 — Justificativa obrigatória', () => {
  it('RN-013 › todo código da seção 4 gera descrição não vazia', () => {
    expect(Object.keys(MODELOS).sort()).toEqual([...new Set(EXEMPLOS.map((e) => e.codigo))].sort());
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

  it('RN-013 › hospedagem cita o limite por diária', () => {
    const [h] = rodar([{ categoria: 'hospedagem', descricao: '2 diarias', valor: 600 }]);
    expect(h?.motivo.descricao).toMatch(/R\$ 250,00 por diária.*2 diárias.*saldo disponível R\$ 500,00.*R\$ 100,00/);
  });
});
