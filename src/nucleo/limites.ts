// Etapa 9 da seção 8: limite diário por (data, categoria) (RN-009, RN-010).

import { POLITICA } from './politica.ts';
import type { Categoria, Centavos, CodigoMotivo, DataISO, Parcela } from './tipos.ts';

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
  readonly codigo: Extract<CodigoMotivo, 'APROVADO_INTEGRAL' | 'LIMITE_DIARIO_EXCEDIDO' | 'LIMITE_DIARIO_ESGOTADO'>;
}

/** Limite de (data, categoria): ampliado só em dia de viagem e se a categoria amplia (RN-009, RN-011, AMB-020). */
export function limiteDiario(categoria: Categoria, data: DataISO, diasDeViagem: ReadonlySet<DataISO>): Centavos {
  const { diario, ampliaEmViagem } = POLITICA.limites[categoria];
  if (!ampliaEmViagem || !diasDeViagem.has(data)) return diario;
  const { num, den } = POLITICA.fatorViagem;
  if ((diario * num) % den !== 0n) {
    // A spec não define arredondamento de limite ampliado (plan §7).
    throw new Error(`limite ampliado de ${categoria} não é exato em centavos`);
  }
  return (diario * num) / den;
}

/**
 * Cada parcela, na ordem recebida (a da entrada), leva `min(valor, saldo)` do
 * saldo de (data, categoria). Devolve uma alocação por despesa, na ordem.
 */
export function alocar(parcelas: readonly Parcela[], diasDeViagem: ReadonlySet<DataISO>): Alocacao[] {
  const saldos = new Map<string, Centavos>();
  const porDespesa = new Map<number, Omit<Alocacao, 'codigo'>>();

  for (const p of parcelas) {
    const limite = limiteDiario(p.categoria, p.data, diasDeViagem);
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
