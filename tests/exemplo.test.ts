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
  moeda: string;
  valor_original: number | null;
  taxa_cambio: number | null;
  data_cotacao: string | null;
  valor_solicitado: number | null;
  valor_reembolsavel: number;
  status: string;
  motivo: { codigo: string; descricao: string };
  limite_diario_aplicado: number | null;
  em_viagem: boolean | null;
  diarias: number | null;
}

interface Saida {
  politica: { versao: string; tabela: string };
  itens: ItemSaida[];
  resumo: Record<string, number>;
}

/** Arquivo da seção 9 → texto e JSON da saída, como o CLI gravaria. */
function processar(caminho: string) {
  const resultado = calcularV4(lerEntrada(readFileSync(caminho, 'utf8')));
  const texto = serializarJson(montarSaida(resultado));
  return { resultado, texto, saida: JSON.parse(texto) as Saida };
}

const { resultado, texto, saida } = processar('exemplos/despesas-exemplo.json');
const envelope = processar('exemplos/envelope/despesas-envelope.json');
const ccDesconhecido = processar('exemplos/envelope/despesas-envelope-cc-desconhecido.json');

function item(id: string, de: Saida = saida): ItemSaida {
  const encontrado = de.itens.find((i) => i.id === id);
  if (!encontrado) throw new Error(`item ${id} ausente`);
  return encontrado;
}

/** Linha da tabela 1 da seção 9: solicitado, reembolsável, status, código. */
function linha(id: string) {
  const i = item(id);
  return [i.valor_solicitado, i.valor_reembolsavel, i.status, i.motivo.codigo];
}

/** Linha das tabelas 2 e 3 da seção 9: moeda, original, taxa, data da cotação, solicitado, reembolsável, status, código. */
function linhaV4(de: Saida, id: string) {
  const i = item(id, de);
  return [i.moeda, i.valor_original, i.taxa_cambio, i.data_cotacao, i.valor_solicitado, i.valor_reembolsavel, i.status, i.motivo.codigo];
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

  it('RN-014 › exemplo: resumo 1861.84 / 351.43 / 0.00 / 1510.41 · 5/2/7/0', () => {
    expect(saida.itens.map((i) => i.id)).toEqual(Array.from({ length: 14 }, (_, k) => `d-${String(k + 1).padStart(3, '0')}`));
    expect(saida.resumo).toEqual({
      quantidade_itens: 14,
      aprovados: 5,
      parciais: 2,
      recusados: 7,
      pendentes: 0,
      total_solicitado: 1861.84,
      total_reembolsavel: 351.43,
      total_pendente: 0,
      total_nao_reembolsado: 1510.41,
    });
    expect(texto).toContain('"total_reembolsavel": 351.43');
    expect(texto).toContain('"total_pendente": 0.00');
    expect(texto).toContain('"total_nao_reembolsado": 1510.41');
  });

  it('RN-016 › exemplo: tabela aplicada CC-ENG-PLATAFORMA', () => {
    expect(resultado.politica).toEqual({ versao: 'v4', tabela: 'CC-ENG-PLATAFORMA' });
    expect(saida.politica).toEqual({ versao: 'v4', tabela: 'CC-ENG-PLATAFORMA' });
  });
});

describe('Exemplo do envelope (seção 9, CC-COMERCIAL)', () => {
  const e = envelope.saida;

  it('RN-010 › envelope e-001: representacao 340,00 → PARCIAL 300,00', () => {
    expect(linhaV4(e, 'e-001')).toEqual(['BRL', 340, 1, null, 340, 300, 'PARCIAL', 'LIMITE_DIARIO_EXCEDIDO']);
    expect(item('e-001', e)).toMatchObject({ categoria: 'representacao', em_viagem: false, limite_diario_aplicado: 300 });
  });

  it('RN-017 › envelope e-002: EUR 22,00 × 5.93 (07-14) = 130,46 → PARCIAL 90,00', () => {
    expect(linhaV4(e, 'e-002')).toEqual(['EUR', 22, 5.93, '2026-07-14', 130.46, 90, 'PARCIAL', 'LIMITE_DIARIO_EXCEDIDO']);
  });

  it('RN-017 › envelope e-003: EUR 14,50 × 5.88 (07-15) = 85,26 → APROVADO 85,26', () => {
    expect(linhaV4(e, 'e-003')).toEqual(['EUR', 14.5, 5.88, '2026-07-15', 85.26, 85.26, 'APROVADO', 'APROVADO_INTEGRAL']);
  });

  it('RN-017 › envelope e-004: EUR 30,00 × 5.96 (07-17) = 178,80 → PARCIAL 90,00', () => {
    expect(linhaV4(e, 'e-004')).toEqual(['EUR', 30, 5.96, '2026-07-17', 178.8, 90, 'PARCIAL', 'LIMITE_DIARIO_EXCEDIDO']);
  });

  it('RN-008 › envelope e-005: USD 40,00 × 5.50 = 220,00 → NOTA_FISCAL_AUSENTE', () => {
    expect(linhaV4(e, 'e-005')).toEqual(['USD', 40, 5.5, '2026-07-20', 220, 0, 'RECUSADO', 'NOTA_FISCAL_AUSENTE']);
    expect(envelope.texto).toContain('"taxa_cambio": 5.50,');
  });

  it('RN-017 › envelope e-006: GBP → CAMBIO_INDISPONIVEL, conversão nula', () => {
    expect(linhaV4(e, 'e-006')).toEqual(['GBP', 55, null, null, null, 0, 'RECUSADO', 'CAMBIO_INDISPONIVEL']);
  });

  it('RN-018 › envelope e-007: PENDENTE 1.200,00, diarias 3', () => {
    expect(linhaV4(e, 'e-007')).toEqual(['BRL', 1200, 1, null, 1200, 1200, 'PENDENTE', 'REQUER_APROVACAO']);
    expect(item('e-007', e)).toMatchObject({ diarias: 3, limite_diario_aplicado: 400, em_viagem: true });
  });

  it('RN-011 › envelope e-008: APROVADO 95,00, em_viagem, limite 135,00', () => {
    expect(linhaV4(e, 'e-008')).toEqual(['BRL', 95, 1, null, 95, 95, 'APROVADO', 'APROVADO_INTEGRAL']);
    expect(item('e-008', e)).toMatchObject({ em_viagem: true, limite_diario_aplicado: 135 });
  });

  it('RN-006 › envelope e-009: coworking → CATEGORIA_NAO_REEMBOLSAVEL', () => {
    expect(linhaV4(e, 'e-009')).toEqual(['BRL', 120, 1, null, 120, 0, 'RECUSADO', 'CATEGORIA_NAO_REEMBOLSAVEL']);
  });

  it('RN-017 › envelope e-010: sem moeda → BRL, taxa 1, APROVADO 88,00', () => {
    expect(linhaV4(e, 'e-010')).toEqual(['BRL', 88, 1, null, 88, 88, 'APROVADO', 'APROVADO_INTEGRAL']);
  });

  it('RN-014 › envelope: resumo 2457.52 / 748.26 / 1200.00 / 509.26 · 3/3/3/1', () => {
    expect(e.itens.map((i) => i.id)).toEqual(Array.from({ length: 10 }, (_, k) => `e-${String(k + 1).padStart(3, '0')}`));
    expect(e.resumo).toEqual({
      quantidade_itens: 10,
      aprovados: 3,
      parciais: 3,
      recusados: 3,
      pendentes: 1,
      total_solicitado: 2457.52,
      total_reembolsavel: 748.26,
      total_pendente: 1200,
      total_nao_reembolsado: 509.26,
    });
    expect(envelope.texto).toContain('"total_pendente": 1200.00');
  });

  it('RN-016 › envelope: tabela aplicada CC-COMERCIAL', () => {
    expect(e.politica).toEqual({ versao: 'v4', tabela: 'CC-COMERCIAL' });
  });
});

describe('Exemplo com centro de custo sem entrada (seção 9, tabela padrão)', () => {
  const f = ccDesconhecido.saida;

  it('RN-016 › cc-desconhecido f-001: APROVADO 58,00 (tabela padrão)', () => {
    expect(linhaV4(f, 'f-001')).toEqual(['BRL', 58, 1, null, 58, 58, 'APROVADO', 'APROVADO_INTEGRAL']);
    expect(item('f-001', f)).toMatchObject({ limite_diario_aplicado: 60 });
  });

  it('RN-012 › cc-desconhecido f-002: PARCIAL 250,00', () => {
    expect(linhaV4(f, 'f-002')).toEqual(['BRL', 310, 1, null, 310, 250, 'PARCIAL', 'LIMITE_DIARIO_EXCEDIDO']);
    expect(item('f-002', f)).toMatchObject({ diarias: 1, limite_diario_aplicado: 250, em_viagem: true });
  });

  it('RN-006 › cc-desconhecido f-003: representacao → CATEGORIA_NAO_REEMBOLSAVEL', () => {
    expect(linhaV4(f, 'f-003')).toEqual(['BRL', 190, 1, null, 190, 0, 'RECUSADO', 'CATEGORIA_NAO_REEMBOLSAVEL']);
  });

  it('RN-017 › cc-desconhecido f-004: USD 12,00 × 5.48 (07-21) = 65,76 → APROVADO', () => {
    expect(linhaV4(f, 'f-004')).toEqual(['USD', 12, 5.48, '2026-07-21', 65.76, 65.76, 'APROVADO', 'APROVADO_INTEGRAL']);
  });

  it('RN-014 › cc-desconhecido: resumo 623.76 / 373.76 / 0.00 / 250.00 · 2/1/1/0', () => {
    expect(f.resumo).toEqual({
      quantidade_itens: 4,
      aprovados: 2,
      parciais: 1,
      recusados: 1,
      pendentes: 0,
      total_solicitado: 623.76,
      total_reembolsavel: 373.76,
      total_pendente: 0,
      total_nao_reembolsado: 250,
    });
  });

  it('RN-016 › cc-desconhecido: politica.tabela "padrao"', () => {
    expect(f.politica).toEqual({ versao: 'v4', tabela: 'padrao' });
  });
});

describe('Exemplos oficiais (seção 9)', () => {
  it('RN-013 › exemplos: nenhum item com motivo ausente ou vazio nos três arquivos', () => {
    for (const s of [saida, envelope.saida, ccDesconhecido.saida]) {
      for (const i of s.itens) {
        expect(i.motivo.codigo, i.id).toBeTruthy();
        expect(i.motivo.descricao.trim(), i.id).not.toBe('');
      }
    }
  });
});
