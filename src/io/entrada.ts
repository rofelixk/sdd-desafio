// Arquivo de entrada (RN-015, AMB-027): o que falha aqui aborta a execução.

import { ehDataValida } from '../nucleo/datas.ts';
import { NumeroJson } from '../nucleo/tipos.ts';
import type { DataISO, Entrada } from '../nucleo/tipos.ts';
import { lerJson } from './json.ts';

export class ErroEntrada extends Error {
  override name = 'ErroEntrada';
}

type Objeto = Readonly<Record<string, unknown>>;

function ehObjeto(v: unknown): v is Objeto {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof NumeroJson);
}

/** Vazio, só espaços, nulo ou outro tipo que não texto contam como ausentes (AMB-027). */
function textoPreenchido(v: unknown): v is string {
  return typeof v === 'string' && v.trim() !== '';
}

function data(periodo: Objeto, campo: 'inicio' | 'fim'): DataISO {
  const v = periodo[campo];
  if (!textoPreenchido(v)) throw new ErroEntrada(`periodo.${campo} ausente, vazio ou não é texto`);
  if (!ehDataValida(v)) throw new ErroEntrada(`periodo.${campo} não é uma data válida no formato AAAA-MM-DD: "${v}"`);
  return v;
}

/** JSON já lido → `Entrada`, ou `ErroEntrada` com mensagem que cita o campo. */
export function validarEntrada(json: unknown): Entrada {
  if (!ehObjeto(json)) throw new ErroEntrada('o conteúdo do arquivo não é um objeto JSON');

  const colaborador = json.colaborador;
  const idColaborador = ehObjeto(colaborador) ? colaborador.id : undefined;
  if (!textoPreenchido(idColaborador)) throw new ErroEntrada('colaborador.id ausente, vazio ou não é texto');

  const bruto = ehObjeto(colaborador) ? colaborador.centro_custo : undefined;
  // AMB-032: vazio vale padrão; tipo errado aborta.
  if (bruto !== undefined && bruto !== null && typeof bruto !== 'string') {
    throw new ErroEntrada('colaborador.centro_custo não é texto');
  }
  const centroCusto = typeof bruto === 'string' && bruto.trim() !== '' ? bruto : null;

  const periodo = json.periodo;
  if (!ehObjeto(periodo)) throw new ErroEntrada('periodo ausente ou não é um objeto (periodo.inicio e periodo.fim)');
  const inicio = data(periodo, 'inicio');
  const fim = data(periodo, 'fim');
  if (inicio > fim) throw new ErroEntrada(`periodo.inicio (${inicio}) é posterior a periodo.fim (${fim})`);

  const despesas = json.despesas;
  if (!Array.isArray(despesas)) throw new ErroEntrada('despesas ausente ou não é uma lista');

  return { colaborador, centroCusto, periodo, inicio, fim, despesas };
}

/** Texto do arquivo → `Entrada`; JSON inválido também é `ErroEntrada`. */
export function lerEntrada(texto: string): Entrada {
  let json: unknown;
  try {
    json = lerJson(texto);
  } catch (e) {
    throw new ErroEntrada(`o arquivo não é um JSON válido (${(e as Error).message})`);
  }
  return validarEntrada(json);
}
