// Arquivo de câmbio (RN-015, RN-017, AMB-042, AMB-044, R-12, R-14): o que falha aqui aborta a execução.

import { ehDataValida } from '../nucleo/datas.ts';
import { decimalDe } from '../nucleo/decimal.ts';
import { normalizarMoeda } from '../nucleo/texto.ts';
import { NumeroJson } from '../nucleo/tipos.ts';
import type { Cambio, Cotacao, DataISO, Moeda } from '../nucleo/tipos.ts';
import { ErroEntrada } from './entrada.ts';
import { lerJson } from './json.ts';

type Objeto = Readonly<Record<string, unknown>>;

function ehObjeto(v: unknown): v is Objeto {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof NumeroJson);
}

const TRES_LETRAS = /^[A-Z]{3}$/;

/**
 * Texto do arquivo → índice `Cambio` (moeda em maiúsculas → cotações em ordem
 * crescente de data), ou `ErroEntrada` cuja mensagem começa por `rotulo` e
 * cita o caminho do campo. Mesma moeda na mesma data: vale a última (AMB-042).
 */
export function lerCambio(texto: string, rotulo = 'arquivo de câmbio (dados/cambio.json)'): Cambio {
  const falha = (mensagem: string): never => {
    throw new ErroEntrada(`${rotulo}: ${mensagem}`);
  };

  let json: unknown;
  try {
    json = lerJson(texto);
  } catch (e) {
    return falha(`o arquivo não é um JSON válido (${(e as Error).message})`);
  }
  if (!ehObjeto(json)) return falha('o conteúdo do arquivo não é um objeto JSON');
  if (json.moeda_base !== 'BRL') falha('moeda_base não é "BRL"');
  const taxas = json.taxas;
  if (!ehObjeto(taxas)) return falha('taxas ausente ou não é um objeto');

  const porMoeda = new Map<Moeda, Map<DataISO, NumeroJson>>();
  for (const [data, moedas] of Object.entries(taxas)) {
    if (!ehDataValida(data)) falha(`taxas.${data}: a chave não é uma data válida no formato AAAA-MM-DD`);
    if (!ehObjeto(moedas)) return falha(`taxas.${data} não é um objeto`);
    for (const [codigo, taxa] of Object.entries(moedas)) {
      const campo = `taxas.${data}.${codigo}`;
      const moeda = normalizarMoeda(codigo);
      if (!TRES_LETRAS.test(moeda)) falha(`${campo}: a moeda não tem 3 letras`);
      const d = taxa instanceof NumeroJson ? decimalDe(taxa.texto) : null;
      if (d === null) falha(`${campo} não é um número`);
      if (d!.digitos <= 0n) falha(`${campo} não é maior que zero (${(taxa as NumeroJson).texto})`);
      if (!porMoeda.has(moeda)) porMoeda.set(moeda, new Map());
      porMoeda.get(moeda)!.set(data, taxa as NumeroJson); // a última da data sobrescreve (AMB-042)
    }
  }

  const indice = new Map<Moeda, readonly Cotacao[]>();
  for (const [moeda, datas] of porMoeda) {
    indice.set(
      moeda,
      [...datas].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([data, taxa]) => ({ data, taxa })),
    );
  }
  return indice;
}
