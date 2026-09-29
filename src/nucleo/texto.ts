// Normalização de texto (R-06) e conversão de valor bruto em texto (AMB-026).

import { NumeroJson } from './tipos.ts';

/** Categoria e `id`: sem espaços nas bordas, minúsculas, sem acentos (RN-002, AMB-024). */
export function normalizar(texto: string): string {
  return texto.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

/** Fornecedor: só sem espaços nas bordas e minúsculas; mantém acentos (RN-007). */
export function normalizarFornecedor(texto: string): string {
  return texto.trim().toLowerCase();
}

/** Qualquer valor bruto como texto (RN-003, AMB-026). */
export function comoTexto(bruto: unknown): string {
  if (bruto === undefined || bruto === null) return '';
  if (typeof bruto === 'string') return bruto;
  if (bruto instanceof NumeroJson) return bruto.texto;
  if (typeof bruto === 'boolean') return String(bruto);
  return JSON.stringify(bruto, (_chave, v: unknown) => (v instanceof NumeroJson ? JSON.rawJSON(v.texto) : v));
}
