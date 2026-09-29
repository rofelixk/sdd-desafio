// Etapas 3 a 7 da seção 8. Cada função devolve a recusa da etapa ou `null`;
// a ordem das etapas vive só no `motor.ts` (DT-002).

import { POLITICA } from './politica.ts';
import type { Categoria, DataISO, DespesaValida, Recusa } from './tipos.ts';

/** Etapa 3 (RN-004, AMB-012). */
export function verificarValorPositivo(d: DespesaValida): Recusa | null {
  return d.valorSolicitado <= 0n
    ? { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valor: d.valorSolicitado } }
    : null;
}

/** Etapa 4 (RN-005, AMB-009, AMB-010): `[inicio, fim]`, inclusive. */
export function verificarPeriodo(d: DespesaValida, inicio: DataISO, fim: DataISO): Recusa | null {
  return d.data < inicio || d.data > fim
    ? { codigo: 'FORA_DO_PERIODO', detalhes: { data: d.data, inicio, fim } }
    : null;
}

/** Categoria reconhecida: chave de `POLITICA.limites` (RN-006). */
export function ehCategoria(categoria: string): categoria is Categoria {
  return Object.hasOwn(POLITICA.limites, categoria);
}

/** Etapa 5 (RN-006, AMB-019): sem reclassificar. */
export function verificarCategoria(d: DespesaValida): Recusa | null {
  return ehCategoria(d.categoria)
    ? null
    : { codigo: 'CATEGORIA_NAO_REEMBOLSAVEL', detalhes: { categoria: d.categoriaOriginal } };
}

/** Chave da RN-007 → `id` da primeira ocorrência. */
export type ChavesDuplicata = Map<string, string>;

/**
 * Etapa 6 (RN-007, AMB-011, AMB-026): mesma data, categoria normalizada,
 * fornecedor (`trim` + minúsculas; vazio é um valor) e valor. A primeira
 * ocorrência é registrada em `aceitas` e segue; as seguintes são recusadas.
 */
export function verificarDuplicata(d: DespesaValida, aceitas: ChavesDuplicata): Recusa | null {
  const chave = JSON.stringify([d.data, d.categoria, d.fornecedorChave, d.valorSolicitado.toString()]);
  const idAceito = aceitas.get(chave);
  if (idAceito !== undefined) return { codigo: 'DUPLICATA', detalhes: { idAceito } };
  aceitas.set(chave, d.id);
  return null;
}
