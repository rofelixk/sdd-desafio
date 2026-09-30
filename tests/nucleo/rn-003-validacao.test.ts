import { describe, expect, it } from 'vitest';
import { lerJson } from '../../src/io/json.ts';
import { registrarId, validarDespesa } from '../../src/nucleo/despesa.ts';
import { comoTexto } from '../../src/nucleo/texto.ts';
import { NumeroJson } from '../../src/nucleo/tipos.ts';
import { CAMBIO_V4, codigosPassada1, cru, entrada, rodar } from '../apoio.ts';
import type { DespesaValida, RecusaDadoInvalido } from '../../src/nucleo/tipos.ts';

/** Despesa válida com os campos trocados por `trocas` (texto JSON de cada valor; `undefined` remove o campo). */
function despesa(trocas: Record<string, string | undefined> = {}): unknown {
  const campos: Record<string, string | undefined> = {
    id: '"d-001"',
    data: '"2026-07-03"',
    categoria: '"alimentacao"',
    descricao: '"Almoco"',
    fornecedor: '"Tavola"',
    valor: '45.00',
    tem_nota_fiscal: 'true',
    ...trocas,
  };
  const pares = Object.entries(campos)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `"${k}": ${v}`);
  return lerJson(`{${pares.join(', ')}}`);
}

function validar(bruta: unknown): DespesaValida | RecusaDadoInvalido {
  return validarDespesa(bruta, 0, new Set(), CAMBIO_V4);
}

function recusada(r: DespesaValida | RecusaDadoInvalido): RecusaDadoInvalido {
  expect('codigo' in r && r.codigo).toBe('DADO_INVALIDO');
  return r as RecusaDadoInvalido;
}

function valida(r: DespesaValida | RecusaDadoInvalido): DespesaValida {
  expect('codigo' in r).toBe(false);
  return r as DespesaValida;
}

describe('RN-003 — Validação dos dados do item', () => {
  it('RN-003 › fornecedor/descricao como texto: ausente e null → "", 123 → "123", true → "true", [1, 2] → "[1,2]"', () => {
    const bruto = lerJson('{"n": 123, "b": true, "l": [1, 2], "o": {"a": 1.50}, "x": null, "t": " Café "}') as Record<string, unknown>;
    expect(comoTexto(undefined)).toBe('');
    expect(comoTexto(bruto.x)).toBe('');
    expect(comoTexto(bruto.n)).toBe('123');
    expect(comoTexto(bruto.b)).toBe('true');
    expect(comoTexto(false)).toBe('false');
    expect(comoTexto(bruto.l)).toBe('[1,2]');
    expect(comoTexto(bruto.o)).toBe('{"a":1.50}');
    expect(comoTexto(bruto.t)).toBe(' Café ');
  });

  it('RN-003 › "data": "2026-07-32" → DADO_INVALIDO com data "2026-07-32" no eco', () => {
    const r = recusada(validar(despesa({ data: '"2026-07-32"' })));
    expect(r.eco.data).toBe('2026-07-32');
    expect(r.valorOriginal).toBe(4500n);
  });

  it('RN-003 › id, data, categoria ou valor ausentes → DADO_INVALIDO', () => {
    for (const campo of ['id', 'data', 'categoria', 'valor']) {
      const r = recusada(validar(despesa({ [campo]: undefined })));
      expect(r.detalhes.campo, campo).toBe(campo);
    }
    expect(recusada(validar(despesa({ id: undefined }))).eco.id).toBeNull();
  });

  it('RN-003 › id, data ou categoria nulos, vazios ou só com espaços → DADO_INVALIDO', () => {
    for (const campo of ['id', 'data', 'categoria']) {
      for (const valor of ['null', '""', '"   "']) {
        const r = recusada(validar(despesa({ [campo]: valor })));
        expect(r.detalhes.campo, `${campo} = ${valor}`).toBe(campo);
      }
    }
  });

  it('RN-003 › "categoria": "" e "categoria": 123 → DADO_INVALIDO, e não CATEGORIA_NAO_REEMBOLSAVEL', () => {
    expect(recusada(validar(despesa({ categoria: '""' }))).detalhes.campo).toBe('categoria');
    expect(recusada(validar(despesa({ categoria: '123' }))).detalhes.campo).toBe('categoria');
  });

  it('RN-003 › item que não é objeto (42, "x", null) → DADO_INVALIDO com ecos e valor_solicitado nulos', () => {
    for (const bruta of [lerJson('42'), 'x', null, lerJson('[1]')]) {
      const r = recusada(validar(bruta));
      expect(r.eco).toEqual({ id: null, data: null, categoria: null, moeda: null });
      expect(r.valorOriginal).toBeNull();
    }
  });

  it('RN-003 › eco sai exatamente como veio (categoria 123 continua o NumeroJson "123")', () => {
    const r = recusada(validar(despesa({ categoria: '123', id: '"  "', data: undefined })));
    expect(r.eco.categoria).toEqual(new NumeroJson('123'));
    expect(r.eco.id).toBe('  ');
    expect(r.eco.data).toBeNull();
  });

  it('RN-003 › "fornecedor": 123 e "descricao": null não recusam a despesa', () => {
    const d = valida(validar(despesa({ fornecedor: '123', descricao: 'null' })));
    expect(d.fornecedorChave).toBe('123');
    expect(d.descricao).toBe('');
    const d2 = valida(validar(despesa({ fornecedor: '[true, {"a": 1}]', descricao: undefined })));
    expect(d2.fornecedorChave).toBe('[true,{"a":1}]');
  });

  it('RN-003 › "45.00", "45,00" e 45.00 dão valor_solicitado 45,00', () => {
    for (const valor of ['"45.00"', '"45,00"', '45.00', '45', '"45"']) {
      expect(valida(validar(despesa({ valor }))).valorOriginal, valor).toBe(4500n);
    }
    expect(valida(validar(despesa({ valor: '"33,333"' }))).valorOriginal).toBe(3333n);
  });

  it('RN-003 › "1.234,56" e "R$ 45,00" → DADO_INVALIDO', () => {
    for (const valor of ['"1.234,56"', '"R$ 45,00"', '"1,234.56"']) {
      expect(recusada(validar(despesa({ valor }))).detalhes.campo, valor).toBe('valor');
    }
  });

  it('RN-003 › "valor": "R$ 45,00" → valor_solicitado nulo', () => {
    expect(recusada(validar(despesa({ valor: '"R$ 45,00"' }))).valorOriginal).toBeNull();
  });

  it('RN-003 › "", "45.", ",5", "1,2,3", "abc", true, [], {} e null não são numéricos', () => {
    for (const valor of ['""', '"45."', '",5"', '"1,2,3"', '"abc"', 'true', '[]', '{}', 'null', '"   "', '"4 5"', '"+45"', '"1e2"']) {
      const r = recusada(validar(despesa({ valor })));
      expect(r.detalhes.campo, valor).toBe('valor');
      expect(r.valorOriginal, valor).toBeNull();
    }
  });

  it('RN-003 › " -45,00 " (espaços nas bordas) é numérico', () => {
    expect(valida(validar(despesa({ valor: '" -45,00 "' }))).valorOriginal).toBe(-4500n);
  });

  it('RN-003 › recusa por outro campo mantém valor_solicitado arredondado quando o valor é numérico', () => {
    expect(recusada(validar(despesa({ id: 'null', valor: '10.005' }))).valorOriginal).toBe(1000n);
    expect(recusada(validar(despesa({ categoria: '""', valor: '"10,015"' }))).valorOriginal).toBe(1002n);
  });

  it('RN-003 › "tem_nota_fiscal": "sim" → DADO_INVALIDO', () => {
    expect(recusada(validar(despesa({ tem_nota_fiscal: '"sim"' }))).detalhes.campo).toBe('tem_nota_fiscal');
  });

  it('RN-003 › "tem_nota_fiscal": null vale false', () => {
    expect(valida(validar(despesa({ tem_nota_fiscal: 'null' }))).temNotaFiscal).toBe(false);
  });

  it('RN-003 › tem_nota_fiscal ausente, "" ou "   " vale false', () => {
    for (const tem_nota_fiscal of [undefined, '""', '"   "']) {
      expect(valida(validar(despesa({ tem_nota_fiscal }))).temNotaFiscal, String(tem_nota_fiscal)).toBe(false);
    }
    expect(valida(validar(despesa({ tem_nota_fiscal: 'true' }))).temNotaFiscal).toBe(true);
    expect(valida(validar(despesa({ tem_nota_fiscal: 'false' }))).temNotaFiscal).toBe(false);
  });

  it('RN-003 › tem_nota_fiscal "true", 1, 0, [] ou {} → DADO_INVALIDO', () => {
    for (const tem_nota_fiscal of ['"true"', '1', '0', '[]', '{}', '"false"']) {
      const r = recusada(validar(despesa({ tem_nota_fiscal })));
      expect(r.detalhes.campo, tem_nota_fiscal).toBe('tem_nota_fiscal');
      expect(r.valorOriginal).toBe(4500n);
    }
  });

  it('RN-003 › "moeda": " eur " vale EUR', () => {
    expect(valida(validar(despesa({ moeda: '" eur "' }))).moeda).toBe('EUR');
    expect(valida(validar(despesa({ moeda: '"Usd"' }))).moeda).toBe('USD');
  });

  it('RN-003 › moeda ausente, null, "" ou "  " vale BRL', () => {
    for (const moeda of [undefined, 'null', '""', '"  "']) {
      expect(valida(validar(despesa({ moeda }))).moeda, String(moeda)).toBe('BRL');
    }
    expect(valida(validar(despesa({ moeda: '"brl"' }))).moeda).toBe('BRL');
  });

  it('RN-003 › "moeda": 978, true, [] ou {} → DADO_INVALIDO com a moeda como veio no eco', () => {
    for (const [moeda, eco] of [
      ['978', new NumeroJson('978')],
      ['true', true],
      ['[]', []],
      ['{}', {}],
      ['false', false],
    ] as const) {
      const r = recusada(validar(despesa({ moeda })));
      expect(r.detalhes, moeda).toEqual({ campo: 'moeda', problema: 'nao_textual' });
      expect(r.eco.moeda, moeda).toEqual(eco);
      expect(r.valorOriginal).toBe(4500n);
    }
    expect(recusada(validar(despesa({ data: '"2026-07-32"', moeda: undefined }))).eco.moeda).toBeNull();
    expect(recusada(validar(despesa({ data: '"2026-07-32"', moeda: '" eur "' }))).eco.moeda).toBe(' eur ');
  });

  it('RN-003 › "moeda": "EURO" passa pela validação (moeda EURO)', () => {
    expect(valida(validar(despesa({ moeda: '"EURO"' }))).moeda).toBe('EURO');
    expect(valida(validar(despesa({ moeda: '" r$ "' }))).moeda).toBe('R$');
  });

  /** Valida em sequência, registrando os ids como o motor faz. */
  function emSequencia(...brutas: unknown[]): (DespesaValida | RecusaDadoInvalido)[] {
    const idsVistos = new Set<string>();
    return brutas.map((bruta, i) => {
      const r = validarDespesa(bruta, i, idsVistos, CAMBIO_V4);
      registrarId(idsVistos, r);
      return r;
    });
  }

  it('RN-003 › "D-001" depois de "d-001" → DADO_INVALIDO', () => {
    const [, segunda] = emSequencia(despesa({ id: '"d-001"' }), despesa({ id: '"D-001"' }));
    expect(recusada(segunda!).detalhes).toEqual({ campo: 'id', problema: 'repetido' });
  });

  it('RN-003 › " d-001 " depois de "d-001" → DADO_INVALIDO, com id " d-001 " no eco', () => {
    const [, segunda] = emSequencia(despesa({ id: '"d-001"' }), despesa({ id: '" d-001 "' }));
    expect(recusada(segunda!).eco.id).toBe(' d-001 ');
  });

  it('RN-003 › a primeira ocorrência de "d-001" segue normalmente', () => {
    const [primeira] = emSequencia(despesa({ id: '"d-001"' }), despesa({ id: '"d-001"' }));
    expect(valida(primeira!).id).toBe('d-001');
  });

  it('RN-003 › "d-001" com data inválida, depois "d-001" válido → o 2º segue (correção, AMB-025)', () => {
    const [primeira, segunda] = emSequencia(despesa({ data: '"2026-07-32"' }), despesa());
    recusada(primeira!);
    valida(segunda!);
  });

  it('RN-003 › "d-001" inválido, "d-001" válido e outro "d-001" válido → 1º e 3º DADO_INVALIDO, 2º segue', () => {
    const [a, b, c] = emSequencia(despesa({ data: '"2026-07-32"' }), despesa(), despesa({ id: '"D-001"' }));
    expect(recusada(a!).detalhes.campo).toBe('data');
    valida(b!);
    expect(recusada(c!).detalhes.problema).toBe('repetido');
  });

  it('RN-003 › id repetido também não reserva o id', () => {
    const idsVistos = new Set<string>();
    registrarId(idsVistos, validarDespesa(despesa(), 0, idsVistos, CAMBIO_V4));
    const repetida = validarDespesa(despesa(), 1, idsVistos, CAMBIO_V4);
    registrarId(idsVistos, repetida);
    expect([...idsVistos]).toEqual(['d-001']);
  });

  it('RN-003 › despesa inválida não impede o processamento das outras', () => {
    const e = entrada([{}, { data: '2026-07-32' }, cru('42'), { categoria: 'coworking' }, {}]);
    expect(codigosPassada1(e)).toEqual([null, 'DADO_INVALIDO', 'DADO_INVALIDO', 'CATEGORIA_NAO_REEMBOLSAVEL', 'DUPLICATA']);
  });

  it('RN-003 › id de despesa recusada por CAMBIO_INDISPONIVEL continua reservado (AMB-025)', () => {
    const e = entrada([
      { id: 'd-001', valor: 10, moeda: 'GBP' },
      { id: 'd-001', valor: 10 },
    ]);
    expect(codigosPassada1(e)).toEqual(['CAMBIO_INDISPONIVEL', 'DADO_INVALIDO']);
  });

  it('RN-003 › valor inválido: valor_original e os três campos de conversão nulos, mesmo em BRL ou com cotação (AMB-043)', () => {
    for (const moeda of [undefined, '"BRL"', '"EUR"']) {
      for (const valor of ['"R$ 45,00"', 'true', undefined]) {
        const r = recusada(validar(despesa({ data: '"2026-07-14"', valor, moeda })));
        expect(r.valorOriginal, `${moeda} ${valor}`).toBeNull();
        expect(r.conversao, `${moeda} ${valor}`).toBeNull();
      }
    }
    const [i] = rodar([{ data: '2026-07-14', valor: 'R$ 45,00', moeda: 'EUR' }]);
    expect(i).toMatchObject({ moeda: 'EUR', valorOriginal: null, conversao: null, valorSolicitado: null });
  });

  it('RN-003 › BRL com valor numérico e data inválida → DADO_INVALIDO com taxa 1 e valor_solicitado preenchido', () => {
    for (const data of ['"2026-07-32"', 'null', undefined]) {
      const r = recusada(validar(despesa({ data, moeda: undefined })));
      expect(r.valorOriginal, String(data)).toBe(4500n);
      expect(r.conversao, String(data)).toEqual({ taxa: new NumeroJson('1'), dataCotacao: null, valorSolicitado: 4500n });
    }
    const [i] = rodar([{ data: '2026-07-32', moeda: 'brl' }]);
    expect(i).toMatchObject({ moeda: 'brl', valorOriginal: 4500n, valorSolicitado: 4500n });
  });

  it('RN-003 › EUR com valor numérico e data inválida → DADO_INVALIDO com conversão nula', () => {
    for (const data of ['"2026-07-32"', 'null', '"14/07/2026"']) {
      const r = recusada(validar(despesa({ data, moeda: '"EUR"' })));
      expect(r.valorOriginal, data).toBe(4500n);
      expect(r.conversao, data).toBeNull();
    }
    // moeda não textual também anula a conversão
    expect(recusada(validar(despesa({ moeda: '978' }))).conversao).toBeNull();
  });

  it('RN-003 › DADO_INVALIDO por outro campo, EUR com cotação → valor_solicitado convertido', () => {
    const r = recusada(validar(despesa({ data: '"2026-07-14"', valor: '22', moeda: '"eur"', tem_nota_fiscal: '"sim"' })));
    expect(r.detalhes.campo).toBe('tem_nota_fiscal');
    expect(r.conversao).toEqual({ taxa: new NumeroJson('5.93'), dataCotacao: '2026-07-14', valorSolicitado: 13046n });
    const [i] = rodar([{ id: '', data: '2026-07-18', valor: 30, moeda: 'EUR' }]);
    expect(i?.motivo.codigo).toBe('DADO_INVALIDO');
    expect(i).toMatchObject({ valorOriginal: 3000n, valorSolicitado: 17880n });
    expect(i?.conversao?.dataCotacao).toBe('2026-07-17');
  });

  it('RN-003 › id de despesa recusada por FORA_DO_PERIODO continua reservado (AMB-025)', () => {
    const e = entrada([
      { id: 'd-001', data: '2026-06-30' },
      { id: 'd-001', data: '2026-07-03' },
    ]);
    expect(codigosPassada1(e)).toEqual(['FORA_DO_PERIODO', 'DADO_INVALIDO']);
  });
});
