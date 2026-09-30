// Montagem da tabela aplicável (RN-016) e o único número de política que a
// spec fixa e a tabela não traz (AMB-040). Os limites, o limiar de nota
// fiscal e o percentual de viagem vêm da tabela de limites.

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
