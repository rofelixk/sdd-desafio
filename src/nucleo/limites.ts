// Etapa 9 da seção 8: limite diário por (data, categoria) (RN-009, RN-010).

import { dividirMeioParaPar } from './decimal.ts';
import type { Categoria, Centavos, CodigoLimite, DataISO, Parcela, TabelaAplicavel } from './tipos.ts';

/** Resultado do limite para uma despesa (soma das suas parcelas). */
export interface Alocacao {
  readonly indiceDespesa: number;
  readonly solicitado: Centavos;
  readonly reembolsavel: Centavos;
  /** Limite da categoria na data da 1ª parcela, já ampliado se for dia de viagem. */
  readonly limiteAplicado: Centavos;
  /** Saldo que as parcelas encontraram antes de consumir. */
  readonly saldoDisponivel: Centavos;
  /** Saldo que as parcelas deixaram. */
  readonly saldoApos: Centavos;
  readonly codigo: CodigoLimite;
}

/**
 * Limite de (data, categoria) na tabela aplicável: em dia de viagem, a
 * periodicidade `dia` é ampliada pelo percentual da tabela, meio para o par
 * (RN-009, RN-011, AMB-020, AMB-033).
 */
export function limiteDiario(
  categoria: Categoria,
  data: DataISO,
  diasDeViagem: ReadonlySet<DataISO>,
  tabela: TabelaAplicavel,
): Centavos {
  const { limite, periodicidade } = tabela.categorias.get(categoria)!;
  if (periodicidade !== 'dia' || !diasDeViagem.has(data)) return limite;
  const { digitos, escala } = tabela.acrescimoViagemPercentual;
  const cem = 100n * 10n ** BigInt(escala);
  return dividirMeioParaPar(limite * (cem + digitos), cem);
}

/**
 * Cada parcela, na ordem recebida (a da entrada), leva `min(valor, saldo)` do
 * saldo de (data, categoria). Devolve uma alocação por despesa, na ordem.
 */
export function alocar(
  parcelas: readonly Parcela[],
  diasDeViagem: ReadonlySet<DataISO>,
  tabela: TabelaAplicavel,
): Alocacao[] {
  const saldos = new Map<string, Centavos>();
  const porDespesa = new Map<number, Omit<Alocacao, 'codigo'>>();

  for (const p of parcelas) {
    const limite = limiteDiario(p.categoria, p.data, diasDeViagem, tabela);
    const chave = `${p.data}|${p.categoria}`;
    const saldo = saldos.get(chave) ?? limite;
    const recebe = p.valor < saldo ? p.valor : saldo;
    saldos.set(chave, saldo - recebe);

    const atual = porDespesa.get(p.indiceDespesa);
    porDespesa.set(p.indiceDespesa, {
      indiceDespesa: p.indiceDespesa,
      solicitado: (atual?.solicitado ?? 0n) + p.valor,
      reembolsavel: (atual?.reembolsavel ?? 0n) + recebe,
      limiteAplicado: atual?.limiteAplicado ?? limite,
      saldoDisponivel: (atual?.saldoDisponivel ?? 0n) + saldo,
      saldoApos: (atual?.saldoApos ?? 0n) + (saldo - recebe),
    });
  }

  return [...porDespesa.values()].map((a) => ({
    ...a,
    codigo:
      a.reembolsavel === a.solicitado
        ? 'APROVADO_INTEGRAL'
        : a.reembolsavel > 0n
          ? 'LIMITE_DIARIO_EXCEDIDO'
          : 'LIMITE_DIARIO_ESGOTADO',
  }));
}
