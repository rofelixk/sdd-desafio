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
    expect(texto).toContain('"valor_original": 72.50');
    expect(texto).toContain('"total_pendente": 0.00');
    const json = JSON.parse(texto);
    expect(json.itens[0].valor_reembolsavel).toBe(60);
  });

  it('Infra › saída: campos do item na ordem da seção 4 (id … diarias, motivo) e politica entre periodo e itens', () => {
    const json = JSON.parse(
      saida(`{${cabecalho}, "despesas": [
        {"id": "a", "data": "2026-07-03", "categoria": "alimentacao", "valor": 45, "tem_nota_fiscal": true},
        {"id": "b", "data": "2026-07-32", "categoria": "alimentacao", "valor": 45},
        42
      ]}`),
    );
    expect(Object.keys(json)).toEqual(['colaborador', 'periodo', 'politica', 'itens', 'resumo']);
    const campos = [
      'id',
      'data',
      'categoria',
      'moeda',
      'valor_original',
      'taxa_cambio',
      'data_cotacao',
      'valor_solicitado',
      'valor_reembolsavel',
      'status',
      'limite_diario_aplicado',
      'em_viagem',
      'diarias',
      'motivo',
    ];
    for (const i of json.itens) expect(Object.keys(i)).toEqual(campos);
    expect(Object.keys(json.resumo)).toEqual([
      'quantidade_itens',
      'aprovados',
      'parciais',
      'recusados',
      'pendentes',
      'total_solicitado',
      'total_reembolsavel',
      'total_pendente',
      'total_nao_reembolsado',
    ]);
  });

  it('RN-017 › taxa_cambio sai com o texto do arquivo (5.90 continua 5.90) e 1 em BRL', () => {
    const texto = saida(`{${cabecalho}, "despesas": [
      {"id": "a", "data": "2026-07-16", "categoria": "alimentacao", "valor": 10, "moeda": "EUR", "tem_nota_fiscal": true},
      {"id": "b", "data": "2026-07-03", "categoria": "alimentacao", "valor": 10, "tem_nota_fiscal": true},
      {"id": "c", "data": "2026-07-21", "categoria": "alimentacao", "valor": 10, "moeda": "GBP", "tem_nota_fiscal": true}
    ]}`);
    expect(texto).toContain('"taxa_cambio": 5.90,');
    expect(texto).toContain('"data_cotacao": "2026-07-16"');
    expect(texto).toContain('"valor_solicitado": 59.00');
    expect(texto).toContain('"taxa_cambio": 1,');
    const [eur, brl, gbp] = JSON.parse(texto).itens;
    expect([eur.moeda, eur.valor_original, eur.taxa_cambio]).toEqual(['EUR', 10, 5.9]);
    expect([brl.moeda, brl.taxa_cambio, brl.data_cotacao, brl.valor_solicitado]).toEqual(['BRL', 1, null, 10]);
    expect([gbp.taxa_cambio, gbp.data_cotacao, gbp.valor_solicitado, gbp.valor_original]).toEqual([null, null, null, 10]);
  });

  it('RN-003 › DADO_INVALIDO: moeda sai como veio (978 → 978, ausente → null)', () => {
    const texto = saida(`{${cabecalho}, "despesas": [
      {"id": "a", "data": "2026-07-03", "categoria": "alimentacao", "valor": 10, "moeda": 978.0},
      {"id": "b", "data": "2026-07-32", "categoria": "alimentacao", "valor": 10},
      {"id": "c", "data": "2026-07-32", "categoria": "alimentacao", "valor": 10, "moeda": " eur "}
    ]}`);
    expect(texto).toContain('"moeda": 978.0,');
    const [a, b, c] = JSON.parse(texto).itens;
    expect([a.moeda, b.moeda, c.moeda]).toEqual([978, null, ' eur ']);
    expect([a.motivo.codigo, b.motivo.codigo, c.motivo.codigo]).toEqual(Array(3).fill('DADO_INVALIDO'));
    // BRL com data inválida sai com taxa 1; EUR com data inválida, sem conversão
    expect([b.taxa_cambio, b.valor_solicitado, c.taxa_cambio, c.valor_solicitado]).toEqual([1, 10, null, null]);
  });

  it('RN-016 › saída traz politica { versao: "v4", tabela }', () => {
    const colaborador = (cc: string) => `"colaborador": {"id": "c-1", "centro_custo": "${cc}"}`;
    const periodo = '"periodo": {"inicio": "2026-07-01", "fim": "2026-07-31"}';
    expect(JSON.parse(saida(`{${cabecalho}, "despesas": []}`)).politica).toEqual({ versao: 'v4', tabela: 'padrao' });
    expect(JSON.parse(saida(`{${colaborador(' cc-adm ')}, ${periodo}, "despesas": []}`)).politica).toEqual({
      versao: 'v4',
      tabela: 'CC-ADM',
    });
  });

  it('RN-014 › resumo traz pendentes e total_pendente com duas casas', () => {
    const texto = saida(`{"colaborador": {"id": "c-1", "centro_custo": "CC-COMERCIAL"}, "periodo": {"inicio": "2026-07-01", "fim": "2026-07-31"}, "despesas": [
      {"id": "h", "data": "2026-07-22", "categoria": "hospedagem", "descricao": "3 noites", "valor": 1200, "tem_nota_fiscal": true},
      {"id": "a", "data": "2026-07-27", "categoria": "alimentacao", "valor": 88, "tem_nota_fiscal": true}
    ]}`);
    expect(texto).toContain('"pendentes": 1,');
    expect(texto).toContain('"total_pendente": 1200.00,');
    expect(texto).toContain('"total_reembolsavel": 88.00,');
    expect(texto).toContain('"total_nao_reembolsado": 0.00');
    expect(texto).toContain('"status": "PENDENTE"');
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
