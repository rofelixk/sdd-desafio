// Única fonte dos valores da política (plan §4). Mudar um valor exige mudar a
// spec antes.

import { normalizar } from './texto.ts';
import type { Politica, RegraCategoria, TabelaAplicavel } from './tipos.ts';

export const LIMIAR_APROVACAO = 500_00n; // RN-018, AMB-040 (estritamente maior)

/**
 * Tabela aplicável ao colaborador (RN-016): sem centro de custo ou sem entrada
 * na tabela → `padrao` inteiro; com entrada → o centro de custo por cima do
 * padrão, inclusive o limite 0, que não herda (AMB-029 a AMB-032).
 */
export function tabelaAplicavel(politica: Politica, centroCusto: string | null): TabelaAplicavel {
  const categorias = new Map<string, RegraCategoria & { origem: 'centro_custo' | 'padrao' }>();
  for (const [categoria, regra] of politica.padrao) categorias.set(categoria, { ...regra, origem: 'padrao' });

  const entrada = centroCusto === null ? undefined : politica.centrosCusto.get(normalizar(centroCusto));
  if (entrada) {
    for (const [categoria, regra] of entrada.categorias) categorias.set(categoria, { ...regra, origem: 'centro_custo' });
  }
  return {
    nome: entrada?.nome ?? 'padrao',
    versao: politica.versao,
    centroCusto: entrada?.nome ?? null,
    categorias,
    limiarNotaFiscal: politica.limiarNotaFiscal,
    acrescimoViagemPercentual: politica.acrescimoViagemPercentual,
  };
}

export const POLITICA = {
  limites: {
    alimentacao:       { diario: 60_00n,  ampliaEmViagem: true  }, // RN-009
    transporte_urbano: { diario: 80_00n,  ampliaEmViagem: true  }, // RN-009
    hospedagem:        { diario: 250_00n, ampliaEmViagem: false }, // RN-009, AMB-020
  },
  fatorViagem: { num: 3n, den: 2n },                               // RN-011
  limiarNotaFiscal: 100_00n,                                       // RN-008 (estritamente maior)
} as const;
