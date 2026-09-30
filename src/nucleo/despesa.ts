// Etapas 1 e 2 da seção 8: arredondamento, normalização, conversão e validação
// (RN-001, RN-002, RN-003, RN-017).

import { converter } from './cambio.ts';
import { ehDataValida } from './datas.ts';
import { paraCentavos } from './dinheiro.ts';
import { comoTexto, normalizar, normalizarFornecedor, normalizarMoeda } from './texto.ts';
import { NumeroJson } from './tipos.ts';
import type { Cambio, Centavos, Conversao, DespesaValida, Moeda, ProblemaDado, RecusaDadoInvalido } from './tipos.ts';

type Bruta = Readonly<Record<string, unknown>>;

function ehObjeto(v: unknown): v is Bruta {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof NumeroJson);
}

/** Texto não vazio; vazio, só espaços, nulo ou outro tipo contam como ausente (RN-003). */
function textoPreenchido(v: unknown): v is string {
  return typeof v === 'string' && v.trim() !== '';
}

/** Formato fechado de `valor` em texto (RN-003, AMB-021). */
const VALOR_TEXTO = /^-?\d+([.,]\d+)?$/;

/** `valor` numérico → centavos (RN-001); não numérico ou ausente → `null` (AMB-023). */
function lerValor(v: unknown): Centavos | null {
  if (v instanceof NumeroJson) return paraCentavos(v.texto);
  if (typeof v === 'string') {
    const texto = v.trim();
    return VALOR_TEXTO.test(texto) ? paraCentavos(texto.replace(',', '.')) : null;
  }
  return null;
}

/** `moeda`: vazio vale `BRL`; texto é normalizado, sem checar formato; outro tipo é inválido (`null`) (RN-003, AMB-036). */
function lerMoeda(v: unknown): Moeda | null {
  if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) return 'BRL';
  return typeof v === 'string' ? normalizarMoeda(v) : null;
}

/** `tem_nota_fiscal`: só booleano; vazio vale `false`; o resto é inválido (`null`) (RN-003, AMB-022). */
function lerNotaFiscal(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v;
  if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) return false;
  return null;
}

/**
 * Valida uma despesa bruta. `idsVistos` tem os ids normalizados das despesas
 * anteriores que passaram por esta validação (AMB-024, AMB-025). A conversão
 * para reais é calculada antes, também para a despesa recusada aqui (seção 4).
 */
export function validarDespesa(
  bruta: unknown,
  indice: number,
  idsVistos: ReadonlySet<string>,
  cambio: Cambio,
): DespesaValida | RecusaDadoInvalido {
  if (!ehObjeto(bruta)) {
    return recusar({ id: null, data: null, categoria: null, moeda: null }, null, null, 'despesa', 'nao_objeto');
  }
  const eco = {
    id: bruta.id ?? null,
    data: bruta.data ?? null,
    categoria: bruta.categoria ?? null,
    moeda: bruta.moeda ?? null,
  };
  const valor = lerValor(bruta.valor);
  const moeda = lerMoeda(bruta.moeda);
  const { id, data, categoria } = bruta;

  // Etapa 1: sem valor numérico ou moeda legível não há conversão (AMB-043); BRL não precisa da data.
  const dataValida = typeof data === 'string' && ehDataValida(data) ? data : null;
  const conversao =
    valor !== null && moeda !== null && (moeda === 'BRL' || dataValida !== null)
      ? converter(valor, moeda, dataValida ?? '', cambio)
      : null;
  const recusa = (campo: string, problema: ProblemaDado) => recusar(eco, valor, conversao, campo, problema);

  if (!textoPreenchido(id)) return recusa('id', 'ausente');
  if (!textoPreenchido(data)) return recusa('data', 'ausente');
  if (!ehDataValida(data)) return recusa('data', 'data_invalida');
  if (!textoPreenchido(categoria)) return recusa('categoria', 'ausente');
  if (bruta.valor === undefined) return recusa('valor', 'ausente');
  if (valor === null) return recusa('valor', 'nao_numerico');
  const temNotaFiscal = lerNotaFiscal(bruta.tem_nota_fiscal);
  if (temNotaFiscal === null) return recusa('tem_nota_fiscal', 'nao_booleano');
  if (moeda === null) return recusa('moeda', 'nao_textual');
  const idNormalizado = normalizar(id);
  if (idsVistos.has(idNormalizado)) return recusa('id', 'repetido');

  return {
    indice,
    id,
    idNormalizado,
    data,
    categoriaOriginal: categoria,
    categoria: normalizar(categoria),
    descricao: comoTexto(bruta.descricao),
    fornecedorChave: normalizarFornecedor(comoTexto(bruta.fornecedor)),
    moeda,
    valorOriginal: valor,
    conversao,
    temNotaFiscal,
  };
}

/** Só a despesa que passou pela validação reserva o `id` (AMB-025). */
export function registrarId(idsVistos: Set<string>, resultado: DespesaValida | RecusaDadoInvalido): void {
  if (!('codigo' in resultado)) idsVistos.add(resultado.idNormalizado);
}

function recusar(
  eco: RecusaDadoInvalido['eco'],
  valorOriginal: Centavos | null,
  conversao: Conversao | null,
  campo: string,
  problema: ProblemaDado,
): RecusaDadoInvalido {
  return { codigo: 'DADO_INVALIDO', detalhes: { campo, problema }, eco, valorOriginal, conversao };
}
