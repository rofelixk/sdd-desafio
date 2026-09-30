// Números exatos do arquivo e o único arredondamento do sistema (R-13).

import type { Decimal } from './tipos.ts';

const NUMERO = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;

/**
 * Texto de número (sinal, dígitos, ponto decimal, expoente) → `Decimal`, com
 * `escala ≥ 0`. Devolve `null` se o texto não é um número nesse formato.
 */
export function decimalDe(texto: string): Decimal | null {
  const m = NUMERO.exec(texto);
  if (!m) return null;
  const [, sinal, inteiros, fracao = '', expoente = '0'] = m;
  const abs = BigInt(inteiros! + fracao);
  const digitos = sinal === '-' ? -abs : abs;
  const escala = fracao.length - Number(expoente);
  return escala >= 0 ? { digitos, escala } : { digitos: digitos * 10n ** BigInt(-escala), escala: 0 };
}

/** `numerador ÷ denominador` (denominador > 0) arredondado meio para o par (RN-001, AMB-037). */
export function dividirMeioParaPar(numerador: bigint, denominador: bigint): bigint {
  const abs = numerador < 0n ? -numerador : numerador;
  const quociente = abs / denominador;
  const dobroDoResto = (abs % denominador) * 2n;
  const sobe = dobroDoResto > denominador || (dobroDoResto === denominador && quociente % 2n === 1n);
  const resultado = sobe ? quociente + 1n : quociente;
  return numerador < 0n ? -resultado : resultado;
}
