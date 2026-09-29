// Dinheiro em centavos `bigint` (R-02).

import type { Centavos } from './tipos.ts';

function partes(c: Centavos): { sinal: string; inteiros: string; centavos: string } {
  const abs = c < 0n ? -c : c;
  return {
    sinal: c < 0n ? '-' : '',
    inteiros: (abs / 100n).toString(),
    centavos: (abs % 100n).toString().padStart(2, '0'),
  };
}

/** `4500n` → `"45.00"`: texto de número JSON (R-04). */
export function formatarDecimal(c: Centavos): string {
  const { sinal, inteiros, centavos } = partes(c);
  return `${sinal}${inteiros}.${centavos}`;
}

/** `186184n` → `"R$ 1.861,84"`: para `motivo.descricao`. */
export function formatarReais(c: Centavos): string {
  const { sinal, inteiros, centavos } = partes(c);
  const milhar = inteiros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sinal}R$ ${milhar},${centavos}`;
}

const NUMERO = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;

/**
 * Texto de número (sinal, dígitos, ponto decimal, expoente) → centavos,
 * arredondando meio para o par sobre os dígitos, sem float (RN-001, DT-001).
 * Devolve `null` se o texto não é um número nesse formato.
 */
export function paraCentavos(texto: string): Centavos | null {
  const m = NUMERO.exec(texto);
  if (!m) return null;
  const [, sinal, inteiros, fracao = '', expoente = '0'] = m;
  const digitos = BigInt(inteiros! + fracao);
  // valor × 100 = digitos × 10^escala
  const escala = Number(expoente) - fracao.length + 2;
  let abs: bigint;
  if (escala >= 0) {
    abs = digitos * 10n ** BigInt(escala);
  } else {
    const divisor = 10n ** BigInt(-escala);
    const quociente = digitos / divisor;
    const dobroDoResto = (digitos % divisor) * 2n;
    const sobe = dobroDoResto > divisor || (dobroDoResto === divisor && quociente % 2n === 1n);
    abs = sobe ? quociente + 1n : quociente;
  }
  return sinal === '-' ? -abs : abs;
}
