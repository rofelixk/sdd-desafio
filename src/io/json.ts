// Leitura e escrita de JSON sem passar número por float (R-03, R-04).

import { NumeroJson } from '../nucleo/tipos.ts';

/** `JSON.parse` em que todo número vira `NumeroJson` com o texto original (R-03). */
export function lerJson(texto: string): unknown {
  return JSON.parse(texto, (_chave, valor, contexto) =>
    typeof valor === 'number' ? new NumeroJson(contexto.source ?? String(valor)) : valor,
  );
}

/** JSON com indentação de 2 espaços e `\n` final; `NumeroJson` sai com o texto original (R-04). */
export function serializarJson(valor: unknown): string {
  return JSON.stringify(valor, (_chave, v: unknown) => (v instanceof NumeroJson ? JSON.rawJSON(v.texto) : v), 2) + '\n';
}
