// Local fixo da tabela de limites e do câmbio (AMB-028, R-11, DT-006).

import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Cambio, Politica } from '../nucleo/tipos.ts';
import { lerCambio } from './cambio.ts';
import { ErroEntrada } from './entrada.ts';
import { lerPolitica } from './politica.ts';

/** Raiz do repositório, resolvida pelo código e não pela pasta de trabalho (R-11). */
const RAIZ = join(import.meta.dirname, '..', '..');

export const CAMINHO_POLITICA = join(RAIZ, 'dados', 'politica.json');
export const CAMINHO_CAMBIO = join(RAIZ, 'dados', 'cambio.json');

/** Texto do arquivo, ou `ErroEntrada` que cita `rotulo`. */
function lerArquivo(caminho: string, rotulo: string): string {
  try {
    return readFileSync(caminho, 'utf8');
  } catch (e) {
    const codigo = (e as NodeJS.ErrnoException).code;
    throw new ErroEntrada(
      codigo === 'ENOENT' ? `${rotulo}: arquivo não encontrado` : `${rotulo}: não foi possível ler o arquivo (${(e as Error).message})`,
    );
  }
}

/** `tabela de limites (dados/politica.json)`: nome e caminho relativo à raiz. */
function rotulo(nome: string, caminho: string): string {
  return `${nome} (${relative(RAIZ, caminho).replaceAll('\\', '/')})`;
}

/** Lê a tabela de limites e depois o câmbio (R-12: a mensagem é a do primeiro inválido). */
export function lerExternos(
  caminhos: { readonly politica: string; readonly cambio: string } = { politica: CAMINHO_POLITICA, cambio: CAMINHO_CAMBIO },
): { politica: Politica; cambio: Cambio } {
  const rotuloPolitica = rotulo('tabela de limites', caminhos.politica);
  const politica = lerPolitica(lerArquivo(caminhos.politica, rotuloPolitica), rotuloPolitica);
  const rotuloCambio = rotulo('arquivo de câmbio', caminhos.cambio);
  const cambio = lerCambio(lerArquivo(caminhos.cambio, rotuloCambio), rotuloCambio);
  return { politica, cambio };
}
