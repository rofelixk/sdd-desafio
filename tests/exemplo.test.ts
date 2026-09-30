// Arquivos oficiais × tabelas da seção 9 da spec, com a tabela de limites de
// exemplos/envelope/ (fixture da v4).

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { lerEntrada } from '../src/io/entrada.ts';
import { serializarJson } from '../src/io/json.ts';
import { montarSaida } from '../src/io/saida.ts';
import { calcularV4 } from './apoio.ts';

interface ItemSaida {
  id: string;
  valor_solicitado: number | null;
  valor_reembolsavel: number;
  status: string;
  motivo: { codigo: string; descricao: string };
  limite_diario_aplicado: number | null;
  em_viagem: boolean | null;
  diarias: number | null;
}

const resultado = calcularV4(lerEntrada(readFileSync('exemplos/despesas-exemplo.json', 'utf8')));
const texto = serializarJson(montarSaida(resultado));
const saida = JSON.parse(texto) as { itens: ItemSaida[]; resumo: Record<string, number> };

function item(id: string): ItemSaida {
  const encontrado = saida.itens.find((i) => i.id === id);
  if (!encontrado) throw new Error(`item ${id} ausente`);
  return encontrado;
}

/** Linha da tabela da seção 9: solicitado, reembolsável, status, código. */
function linha(id: string) {
  const i = item(id);
  return [i.valor_solicitado, i.valor_reembolsavel, i.status, i.motivo.codigo];
}

describe('Exemplo oficial (seção 9, CC-ENG-PLATAFORMA)', () => {
  it('RN-009 › exemplo d-001: APROVADO 72,50 (limite 75,00 do CC-ENG-PLATAFORMA)', () => {
    expect(linha('d-001')).toEqual([72.5, 72.5, 'APROVADO', 'APROVADO_INTEGRAL']);
    expect(item('d-001')).toMatchObject({ limite_diario_aplicado: 75, em_viagem: false });
  });

  it('RN-010 › exemplo d-002: PARCIAL 2,50', () => {
    expect(linha('d-002')).toEqual([38, 2.5, 'PARCIAL', 'LIMITE_DIARIO_EXCEDIDO']);
  });

  it('RN-010 › exemplo d-003: PARCIAL 80,00', () => {
    expect(linha('d-003')).toEqual([100, 80, 'PARCIAL', 'LIMITE_DIARIO_EXCEDIDO']);
  });

  it('RN-008 › exemplo d-004: NOTA_FISCAL_AUSENTE', () => {
    expect(linha('d-004')).toEqual([100.01, 0, 'RECUSADO', 'NOTA_FISCAL_AUSENTE']);
  });

  it('RN-006 › exemplo d-005: CATEGORIA_NAO_REEMBOLSAVEL', () => {
    expect(linha('d-005')).toEqual([89, 0, 'RECUSADO', 'CATEGORIA_NAO_REEMBOLSAVEL']);
  });

  it('RN-009 › exemplo d-006: APROVADO 54,90', () => {
    expect(linha('d-006')).toEqual([54.9, 54.9, 'APROVADO', 'APROVADO_INTEGRAL']);
  });

  it('RN-007 › exemplo d-007: DUPLICATA', () => {
    expect(linha('d-007')).toEqual([54.9, 0, 'RECUSADO', 'DUPLICATA']);
  });

  it('RN-005 › exemplo d-008: FORA_DO_PERIODO', () => {
    expect(linha('d-008')).toEqual([41, 0, 'RECUSADO', 'FORA_DO_PERIODO']);
  });

  it('RN-004 › exemplo d-009: VALOR_NAO_POSITIVO', () => {
    expect(linha('d-009')).toEqual([-45, 0, 'RECUSADO', 'VALOR_NAO_POSITIVO']);
  });

  it('RN-006 › exemplo d-010: CATEGORIA_NAO_REEMBOLSAVEL (hospedagem com limite 0)', () => {
    expect(linha('d-010')).toEqual([480, 0, 'RECUSADO', 'CATEGORIA_NAO_REEMBOLSAVEL']);
    expect(item('d-010')).toMatchObject({ diarias: null, limite_diario_aplicado: null, em_viagem: null });
    expect(item('d-010').motivo.descricao).toContain('CC-ENG-PLATAFORMA');
  });

  it('RN-001 › exemplo d-011: APROVADO 33,33', () => {
    expect(linha('d-011')).toEqual([33.33, 33.33, 'APROVADO', 'APROVADO_INTEGRAL']);
  });

  it('RN-009 › exemplo d-012: APROVADO 47,20', () => {
    expect(linha('d-012')).toEqual([47.2, 47.2, 'APROVADO', 'APROVADO_INTEGRAL']);
  });

  it('RN-006 › exemplo d-013: CATEGORIA_NAO_REEMBOLSAVEL (antes da nota fiscal)', () => {
    expect(linha('d-013')).toEqual([690, 0, 'RECUSADO', 'CATEGORIA_NAO_REEMBOLSAVEL']);
    expect(item('d-013').motivo.descricao).toContain('CC-ENG-PLATAFORMA');
    // sem hospedagem elegível, nenhum dia de viagem no exemplo
    expect(saida.itens.every((i) => i.em_viagem !== true)).toBe(true);
    expect(item('d-011')).toMatchObject({ limite_diario_aplicado: 75, em_viagem: false });
  });

  it('RN-009 › exemplo d-014: APROVADO 61,00', () => {
    expect(linha('d-014')).toEqual([61, 61, 'APROVADO', 'APROVADO_INTEGRAL']);
    expect(item('d-014')).toMatchObject({ limite_diario_aplicado: 75, em_viagem: false });
  });

  it('RN-014 › exemplo: resumo 1861.84 / 351.43 / 1510.41 · 5/2/7', () => {
    expect(saida.itens.map((i) => i.id)).toEqual(Array.from({ length: 14 }, (_, k) => `d-${String(k + 1).padStart(3, '0')}`));
    expect(saida.resumo).toMatchObject({
      quantidade_itens: 14,
      aprovados: 5,
      parciais: 2,
      recusados: 7,
      total_solicitado: 1861.84,
      total_reembolsavel: 351.43,
      total_nao_reembolsado: 1510.41,
    });
    expect(texto).toContain('"total_reembolsavel": 351.43');
    expect(texto).toContain('"total_nao_reembolsado": 1510.41');
  });

  it('RN-016 › exemplo: tabela aplicada CC-ENG-PLATAFORMA', () => {
    expect(resultado.politica).toEqual({ versao: 'v4', tabela: 'CC-ENG-PLATAFORMA' });
  });

  it('RN-013 › exemplo: nenhum item com motivo ausente ou vazio', () => {
    for (const i of saida.itens) {
      expect(i.motivo.codigo, i.id).toBeTruthy();
      expect(i.motivo.descricao.trim(), i.id).not.toBe('');
    }
  });
});
