// Etapas 1 e 2 da seção 8: arredondamento, normalização e validação (RN-001, RN-002, RN-003).

import { ehDataValida } from './datas.ts';
import { paraCentavos } from './dinheiro.ts';
import { comoTexto, normalizar, normalizarFornecedor } from './texto.ts';
import { NumeroJson } from './tipos.ts';
import type { Centavos, DespesaValida, RecusaDadoInvalido } from './tipos.ts';

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

export function validarDespesa(bruta: unknown, indice: number): DespesaValida | RecusaDadoInvalido {
  if (!ehObjeto(bruta)) {
    return recusar({ id: null, data: null, categoria: null }, null, 'despesa', 'nao_objeto');
  }
  const eco = { id: bruta.id ?? null, data: bruta.data ?? null, categoria: bruta.categoria ?? null };
  const valor = lerValor(bruta.valor);
  const { id, data, categoria } = bruta;

  if (!textoPreenchido(id)) return recusar(eco, valor, 'id', 'ausente');
  if (!textoPreenchido(data)) return recusar(eco, valor, 'data', 'ausente');
  if (!ehDataValida(data)) return recusar(eco, valor, 'data', 'data_invalida');
  if (!textoPreenchido(categoria)) return recusar(eco, valor, 'categoria', 'ausente');
  if (bruta.valor === undefined) return recusar(eco, valor, 'valor', 'ausente');
  if (valor === null) return recusar(eco, valor, 'valor', 'nao_numerico');

  return {
    indice,
    id,
    idNormalizado: normalizar(id),
    data,
    categoriaOriginal: categoria,
    categoria: normalizar(categoria),
    descricao: comoTexto(bruta.descricao),
    fornecedorChave: normalizarFornecedor(comoTexto(bruta.fornecedor)),
    valorSolicitado: valor,
    temNotaFiscal: bruta.tem_nota_fiscal === true,
  };
}

function recusar(
  eco: RecusaDadoInvalido['eco'],
  valorSolicitado: Centavos | null,
  campo: string,
  problema: string,
): RecusaDadoInvalido {
  return { codigo: 'DADO_INVALIDO', detalhes: { campo, problema }, eco, valorSolicitado };
}
