// A saída respeita contracts/saida.schema.json (seção 4 da spec).

import { readFileSync } from 'node:fs';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';
import { lerEntrada } from '../src/io/entrada.ts';
import { serializarJson } from '../src/io/json.ts';
import { montarSaida } from '../src/io/saida.ts';
import { calcularV4 } from './apoio.ts';

const schema = JSON.parse(readFileSync('specs/001-motor-reembolso/contracts/saida.schema.json', 'utf8'));
// multipleOf: 0.01 com float dá falso negativo (ex.: 0.07) sem a precisão (plan §7).
const validar = new Ajv2020({ multipleOfPrecision: 2, allErrors: true }).compile(schema);

/** Saída como o CLI a gravaria, relida como JSON. */
function saida(texto: string): unknown {
  return JSON.parse(serializarJson(montarSaida(calcularV4(lerEntrada(texto)))));
}

function conferir(json: unknown): void {
  const ok = validar(json);
  expect(validar.errors ?? [], JSON.stringify(validar.errors, null, 2)).toEqual([]);
  expect(ok).toBe(true);
}

describe('Contrato da saída', () => {
  it('RN-013 › saída do exemplo valida contra contracts/saida.schema.json', () => {
    conferir(saida(readFileSync('exemplos/despesas-exemplo.json', 'utf8')));
  });

  it('RN-013 › saída com itens DADO_INVALIDO (valor_solicitado nulo, ecos brutos) valida contra o schema', () => {
    const json = saida(`{
      "colaborador": {"id": "c-1"},
      "periodo": {"inicio": "2026-07-01", "fim": "2026-07-31"},
      "despesas": [
        {"id": "a", "data": "2026-07-03", "categoria": 123, "valor": "R$ 45,00"},
        {"id": null, "data": 20260703, "categoria": ["x"], "valor": 0.07},
        42,
        {"id": "b", "data": "2026-07-03", "categoria": "alimentacao", "valor": 0.07, "tem_nota_fiscal": "sim"},
        {"id": "c", "data": "2026-07-03", "categoria": "alimentacao", "valor": 10.005},
        {"id": "d", "data": "2026-07-14", "categoria": "hospedagem", "descricao": "3 noites", "valor": 100, "tem_nota_fiscal": true}
      ]
    }`) as { itens: { valor_solicitado: unknown; motivo: { codigo: string } }[] };
    conferir(json);
    expect(json.itens.slice(0, 4).map((i) => i.motivo.codigo)).toEqual(Array(4).fill('DADO_INVALIDO'));
    expect(json.itens[0]?.valor_solicitado).toBeNull();
  });

  it('RN-013 › saída do envelope (PENDENTE, CAMBIO_INDISPONIVEL, moeda estrangeira) valida contra o schema', () => {
    const json = saida(readFileSync('exemplos/envelope/despesas-envelope.json', 'utf8')) as {
      itens: { status: string; motivo: { codigo: string }; moeda: string }[];
    };
    conferir(json);
    expect(json.itens.map((i) => i.status)).toContain('PENDENTE');
    expect(json.itens.map((i) => i.motivo.codigo)).toContain('CAMBIO_INDISPONIVEL');
    expect(json.itens.map((i) => i.moeda)).toEqual(expect.arrayContaining(['EUR', 'USD', 'GBP', 'BRL']));
    conferir(saida(readFileSync('exemplos/envelope/despesas-envelope-cc-desconhecido.json', 'utf8')));
  });

  it('RN-013 › item com taxa_cambio e valor_solicitado nulo é rejeitado pelo schema (AMB-043)', () => {
    const json = saida(readFileSync('exemplos/envelope/despesas-envelope.json', 'utf8')) as { itens: Record<string, unknown>[] };
    const e002 = json.itens[1]!;
    expect(e002.taxa_cambio).toBe(5.93);
    e002.valor_solicitado = null;
    expect(validar(json)).toBe(false);
    // os três nulos juntos são válidos
    e002.taxa_cambio = null;
    e002.data_cotacao = null;
    expect(validar(json)).toBe(true);
    // PENDENTE só com REQUER_APROVACAO
    (json.itens[6]!.motivo as { codigo: string }).codigo = 'APROVADO_INTEGRAL';
    expect(validar(json)).toBe(false);
  });
});
