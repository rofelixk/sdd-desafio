// Ordem da seção 8 da spec, num lugar só (DT-002).

import { registrarId, validarDespesa } from './despesa.ts';
import { diariasDe, gerarParcelas } from './diarias.ts';
import {
  ehCategoria,
  verificarCambio,
  verificarCategoria,
  verificarDuplicata,
  verificarNotaFiscal,
  verificarPeriodo,
  verificarValorPositivo,
} from './elegibilidade.ts';
import type { ChavesDuplicata } from './elegibilidade.ts';
import { alocar } from './limites.ts';
import type { Alocacao } from './limites.ts';
import { montarMotivo } from './motivos.ts';
import { LIMIAR_APROVACAO, tabelaAplicavel } from './politica.ts';
import { calcularResumo } from './resumo.ts';
import type {
  Cambio,
  Centavos,
  Conversao,
  DecisaoAprovacao,
  DecisaoLimite,
  DespesaElegivel,
  DespesaValida,
  Entrada,
  Politica,
  Recusa,
  RecusaDadoInvalido,
  Resultado,
  ResultadoItem,
  TabelaAplicavel,
} from './tipos.ts';
import { diasDeViagem } from './viagem.ts';

/** Resultado da passada 1 para uma despesa. */
export type Avaliacao =
  | { readonly tipo: 'invalida'; readonly recusa: RecusaDadoInvalido }
  | { readonly tipo: 'recusada'; readonly despesa: DespesaValida; readonly recusa: Recusa }
  | { readonly tipo: 'elegivel'; readonly despesa: DespesaElegivel };

/** Passada 1: etapas 1 a 8, na ordem da entrada; a primeira recusa encerra a avaliação. */
export function passada1(entrada: Entrada, tabela: TabelaAplicavel, cambio: Cambio): Avaliacao[] {
  const idsVistos = new Set<string>();
  const aceitas: ChavesDuplicata = new Map();
  return entrada.despesas.map((bruta, indice): Avaliacao => {
    const validada = validarDespesa(bruta, indice, idsVistos, cambio); // etapas 1 e 2
    registrarId(idsVistos, validada);
    if ('codigo' in validada) return { tipo: 'invalida', recusa: validada };

    const recusa =
      verificarValorPositivo(validada) ?? // etapa 3
      verificarPeriodo(validada, entrada.inicio, entrada.fim) ?? // etapa 4
      verificarCategoria(validada, tabela) ?? // etapa 5
      verificarCambio(validada) ?? // etapa 6
      verificarDuplicata(validada, aceitas) ?? // etapa 7
      verificarNotaFiscal(validada, tabela); // etapa 8
    if (recusa) return { tipo: 'recusada', despesa: validada, recusa };

    // As etapas 5 e 6 garantem a categoria na tabela aplicável e a conversão.
    const despesa = { ...validada, conversao: validada.conversao!, regra: tabela.categorias.get(validada.categoria)! };
    return { tipo: 'elegivel', despesa };
  });
}

/** Passada 2: etapas 9 e 10 sobre as elegíveis; monta um item por despesa, na ordem da entrada. */
export function calcularItens(entrada: Entrada, tabela: TabelaAplicavel, cambio: Cambio): ResultadoItem[] {
  const avaliacoes = passada1(entrada, tabela, cambio);
  const elegiveis = avaliacoes.flatMap((a) => (a.tipo === 'elegivel' ? [a.despesa] : []));
  const viagem = diasDeViagem(elegiveis); // etapa 9
  const alocacoes = new Map<number, Alocacao>(
    alocar(elegiveis.flatMap(gerarParcelas), viagem, tabela).map((a) => [a.indiceDespesa, a]), // etapa 10
  );

  return avaliacoes.map((a): ResultadoItem => {
    if (a.tipo === 'invalida') {
      const { eco, valorOriginal, conversao } = a.recusa;
      return {
        id: eco.id,
        data: eco.data,
        categoria: eco.categoria,
        moeda: eco.moeda,
        ...valores(valorOriginal, conversao),
        valorReembolsavel: 0n,
        motivo: montarMotivo(a.recusa),
        ...foraDoLimite,
      };
    }
    if (a.tipo === 'recusada') {
      const d = a.despesa;
      return {
        id: d.id,
        data: d.data,
        categoria: ehCategoria(d.categoria, tabela) ? d.categoria : d.categoriaOriginal,
        moeda: d.moeda,
        ...valores(d.valorOriginal, d.conversao),
        valorReembolsavel: 0n,
        motivo: montarMotivo(a.recusa),
        ...foraDoLimite,
      };
    }
    const d = a.despesa;
    const alocacao = alocacoes.get(d.indice)!;
    const diarias = diariasDe(d);
    return {
      id: d.id,
      data: d.data,
      categoria: d.categoria,
      moeda: d.moeda,
      ...valores(d.valorOriginal, d.conversao),
      valorReembolsavel: alocacao.reembolsavel,
      motivo: montarMotivo(
        aprovacaoManual({
          codigo: alocacao.codigo,
          detalhes: {
            categoria: d.categoria,
            periodicidade: d.regra.periodicidade,
            data: d.data,
            diarias,
            limite: alocacao.limiteAplicado,
            saldoDisponivel: alocacao.saldoDisponivel,
            saldoApos: alocacao.saldoApos,
            solicitado: alocacao.solicitado,
            reembolsavel: alocacao.reembolsavel,
          },
        }), // etapa 11
      ),
      limiteDiarioAplicado: alocacao.limiteAplicado,
      emViagem: viagem.has(d.data),
      diarias: d.regra.periodicidade === 'diaria' ? diarias : null,
    };
  });
}

/**
 * Etapa 11 (RN-018, DT-008): reembolsável acima do limiar troca o motivo por
 * `REQUER_APROVACAO`, com os números do limite; valor e saldo não mudam.
 */
function aprovacaoManual(decisao: DecisaoLimite): DecisaoLimite | DecisaoAprovacao {
  return decisao.detalhes.reembolsavel > LIMIAR_APROVACAO ? { codigo: 'REQUER_APROVACAO', detalhes: decisao.detalhes } : decisao;
}

/** Valor original e conversão; o solicitado em reais sai só da conversão (AMB-043). */
function valores(valorOriginal: Centavos | null, conversao: Conversao | null) {
  return { valorOriginal, conversao, valorSolicitado: conversao?.valorSolicitado ?? null };
}

/** Recusada antes da etapa de limite (seção 4). */
const foraDoLimite = { limiteDiarioAplicado: null, emViagem: null, diarias: null } as const;

/**
 * Resultado completo: ecos, tabela aplicada, itens na ordem da entrada e
 * resumo (RN-014). A tabela aplicável é montada uma vez, antes de tudo (seção 8).
 */
export function calcular(entrada: Entrada, politica: Politica, cambio: Cambio): Resultado {
  const tabela = tabelaAplicavel(politica, entrada.centroCusto);
  const itens = calcularItens(entrada, tabela, cambio);
  return {
    colaborador: entrada.colaborador,
    periodo: entrada.periodo,
    politica: { versao: tabela.versao, tabela: tabela.nome },
    itens,
    resumo: calcularResumo(itens),
  };
}
