// Ordem da seção 8 da spec, num lugar só (DT-002).

import { registrarId, validarDespesa } from './despesa.ts';
import { diariasDe, gerarParcelas } from './diarias.ts';
import {
  verificarCategoria,
  verificarDuplicata,
  verificarNotaFiscal,
  verificarPeriodo,
  verificarValorPositivo,
} from './elegibilidade.ts';
import { ehCategoria } from './elegibilidade.ts';
import type { ChavesDuplicata } from './elegibilidade.ts';
import { alocar } from './limites.ts';
import type { Alocacao } from './limites.ts';
import { montarMotivo } from './motivos.ts';
import { calcularResumo } from './resumo.ts';
import type {
  Categoria,
  DespesaElegivel,
  DespesaValida,
  Entrada,
  Recusa,
  RecusaDadoInvalido,
  Resultado,
  ResultadoItem,
} from './tipos.ts';
import { diasDeViagem } from './viagem.ts';

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

/** Passada 2: etapas 8 e 9 sobre as elegíveis; monta um item por despesa, na ordem da entrada. */
export function calcularItens(entrada: Entrada): ResultadoItem[] {
  const avaliacoes = passada1(entrada);
  const elegiveis = avaliacoes.flatMap((a) => (a.tipo === 'elegivel' ? [a.despesa] : []));
  const viagem = diasDeViagem(elegiveis); // etapa 8
  const alocacoes = new Map<number, Alocacao>(
    alocar(elegiveis.flatMap(gerarParcelas), viagem).map((a) => [a.indiceDespesa, a]), // etapa 9
  );

  return avaliacoes.map((a): ResultadoItem => {
    if (a.tipo === 'invalida') {
      const { eco, valorSolicitado } = a.recusa;
      return { ...eco, valorSolicitado, valorReembolsavel: 0n, motivo: montarMotivo(a.recusa), ...foraDoLimite };
    }
    if (a.tipo === 'recusada') {
      const d = a.despesa;
      return {
        id: d.id,
        data: d.data,
        categoria: ehCategoria(d.categoria) ? d.categoria : d.categoriaOriginal,
        valorSolicitado: d.valorSolicitado,
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
      valorSolicitado: d.valorSolicitado,
      valorReembolsavel: alocacao.reembolsavel,
      motivo: montarMotivo({
        codigo: alocacao.codigo,
        detalhes: {
          categoria: d.categoria,
          data: d.data,
          diarias,
          limite: alocacao.limiteAplicado,
          saldoDisponivel: alocacao.saldoDisponivel,
          saldoApos: alocacao.saldoApos,
          solicitado: alocacao.solicitado,
          reembolsavel: alocacao.reembolsavel,
        },
      }),
      limiteDiarioAplicado: alocacao.limiteAplicado,
      emViagem: viagem.has(d.data),
      diarias: d.categoria === 'hospedagem' ? diarias : null,
    };
  });
}

/** Recusada antes da etapa de limite (seção 4). */
const foraDoLimite = { limiteDiarioAplicado: null, emViagem: null, diarias: null } as const;

/** Resultado completo: ecos, itens na ordem da entrada e resumo (RN-014). */
export function calcular(entrada: Entrada): Resultado {
  const itens = calcularItens(entrada);
  return { colaborador: entrada.colaborador, periodo: entrada.periodo, itens, resumo: calcularResumo(itens) };
}
