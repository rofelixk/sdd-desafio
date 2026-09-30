import { describe, expect, it } from 'vitest';
import { lerEntrada } from '../../src/io/entrada.ts';
import { serializarJson } from '../../src/io/json.ts';
import { montarSaida } from '../../src/io/saida.ts';
import { calcularV4 } from '../apoio.ts';

/** Texto da saída para o arquivo de entrada `texto`. */
function saida(texto: string): string {
  return serializarJson(montarSaida(calcularV4(lerEntrada(texto))));
}

const cabecalho = '"colaborador": {"id": "c-1"}, "periodo": {"inicio": "2026-07-01", "fim": "2026-07-31"}';

describe('Infra › saída', () => {
  it('RN-001 › valores monetários saem com duas casas (60.00, não 60; 0.00, não 0)', () => {
    const texto = saida(`{${cabecalho}, "despesas": [
      {"id": "a", "data": "2026-07-03", "categoria": "alimentacao", "valor": 72.5, "tem_nota_fiscal": true},
      {"id": "b", "data": "2026-07-03", "categoria": "alimentacao", "valor": 38, "fornecedor": "Y", "tem_nota_fiscal": true}
    ]}`);
    expect(texto).toContain('"valor_solicitado": 72.50');
    expect(texto).toContain('"valor_reembolsavel": 60.00');
    expect(texto).toContain('"limite_diario_aplicado": 60.00');
    expect(texto).toContain('"valor_solicitado": 38.00');
    expect(texto).toContain('"valor_reembolsavel": 0.00');
    expect(texto).toContain('"total_solicitado": 110.50');
    expect(texto).toContain('"total_nao_reembolsado": 50.50');
    expect(texto).not.toMatch(/"(valor_\w+|total_\w+|limite_diario_aplicado)": -?\d+(\.\d)?,?\n/);
    const json = JSON.parse(texto);
    expect(json.itens[0].valor_reembolsavel).toBe(60);
    expect(Object.keys(json)).toEqual(['colaborador', 'periodo', 'itens', 'resumo']);
    expect(Object.keys(json.itens[0])).toEqual([
      'id',
      'data',
      'categoria',
      'valor_solicitado',
      'valor_reembolsavel',
      'status',
      'motivo',
      'limite_diario_aplicado',
      'em_viagem',
      'diarias',
    ]);
  });

  it('RN-003 › eco de campo inválido sai como veio (categoria 123 → 123, "  " → "  ", ausente → null)', () => {
    const json = JSON.parse(
      saida(`{${cabecalho}, "despesas": [
        {"id": "a", "data": "2026-07-03", "categoria": 123, "valor": 10},
        {"id": "  ", "data": "2026-07-03", "categoria": "alimentacao", "valor": 10},
        {"data": "2026-07-03", "categoria": [1.50, true], "valor": 10},
        42
      ]}`),
    );
    expect(json.itens.map((i: { id: unknown; categoria: unknown }) => [i.id, i.categoria])).toEqual([
      ['a', 123],
      ['  ', 'alimentacao'],
      [null, [1.5, true]],
      [null, null],
    ]);
    expect(json.itens.every((i: { motivo: { codigo: string } }) => i.motivo.codigo === 'DADO_INVALIDO')).toBe(true);
  });

  it('RN-003 › valor_solicitado nulo sai como null', () => {
    const texto = saida(`{${cabecalho}, "despesas": [{"id": "a", "data": "2026-07-03", "categoria": "alimentacao", "valor": "R$ 45,00"}]}`);
    expect(texto).toContain('"valor_solicitado": null');
    expect(texto).toContain('"total_solicitado": 0.00');
  });

  it('Infra › saída: colaborador e periodo ecoados com os números no texto original', () => {
    const texto = saida(
      '{"colaborador": {"id": "c-1", "matricula": 1.50e3, "extra": [0.10]}, "periodo": {"competencia": "2026-07", "inicio": "2026-07-01", "fim": "2026-07-31", "n": 7.0}, "despesas": []}',
    );
    expect(texto).toContain('"matricula": 1.50e3');
    expect(texto).toContain('0.10');
    expect(texto).toContain('"n": 7.0');
    expect(texto).toContain('"competencia": "2026-07"');
    expect(texto.endsWith('}\n')).toBe(true);
  });
});
