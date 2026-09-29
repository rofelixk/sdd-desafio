// Ordem da seção 8 da spec, num lugar só (DT-002).

import { registrarId, validarDespesa } from './despesa.ts';
import {
  verificarCategoria,
  verificarDuplicata,
  verificarNotaFiscal,
  verificarPeriodo,
  verificarValorPositivo,
} from './elegibilidade.ts';
import type { ChavesDuplicata } from './elegibilidade.ts';
import type { Categoria, DespesaElegivel, DespesaValida, Entrada, Recusa, RecusaDadoInvalido } from './tipos.ts';

/** Resultado da passada 1 para uma despesa. */
export type Avaliacao =
  | { readonly tipo: 'invalida'; readonly recusa: RecusaDadoInvalido }
  | { readonly tipo: 'recusada'; readonly despesa: DespesaValida; readonly recusa: Recusa }
  | { readonly tipo: 'elegivel'; readonly despesa: DespesaElegivel };

/** Passada 1: etapas 1 a 7, na ordem da entrada; a primeira recusa encerra a avaliação. */
export function passada1(entrada: Entrada): Avaliacao[] {
  const idsVistos = new Set<string>();
  const aceitas: ChavesDuplicata = new Map();
  return entrada.despesas.map((bruta, indice): Avaliacao => {
    const validada = validarDespesa(bruta, indice, idsVistos); // etapas 1 e 2
    registrarId(idsVistos, validada);
    if ('codigo' in validada) return { tipo: 'invalida', recusa: validada };

    const recusa =
      verificarValorPositivo(validada) ?? // etapa 3
      verificarPeriodo(validada, entrada.inicio, entrada.fim) ?? // etapa 4
      verificarCategoria(validada) ?? // etapa 5
      verificarDuplicata(validada, aceitas) ?? // etapa 6
      verificarNotaFiscal(validada); // etapa 7
    if (recusa) return { tipo: 'recusada', despesa: validada, recusa };

    // A etapa 5 garante que a categoria é reconhecida.
    return { tipo: 'elegivel', despesa: { ...validada, categoria: validada.categoria as Categoria } };
  });
}
