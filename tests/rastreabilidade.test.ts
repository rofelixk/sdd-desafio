// Spec × testes (DT-005): toda RN e toda linha da seção 7 têm teste.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const spec = readFileSync('specs/001-motor-reembolso/spec.md', 'utf8');

const regras = [...spec.matchAll(/^### (RN-\d{3})\b/gm)].map((m) => m[1]!);

/** 1ª coluna da tabela da seção 7, sem as crases do markdown. */
function casosDeBorda(): string[] {
  const inicio = spec.search(/^## 7\./m);
  const fim = spec.indexOf('\n## ', inicio + 1);
  return spec
    .slice(inicio, fim)
    .split('\n')
    .filter((linha) => linha.startsWith('|') && !/^\|\s*(Caso\s*\||-)/.test(linha))
    .map((linha) => linha.split('|')[1]!.replaceAll('`', '').trim());
}

const arquivosDeTeste = readdirSync('tests', { recursive: true, encoding: 'utf8' })
  .map((caminho) => caminho.replaceAll('\\', '/'))
  .filter((caminho) => caminho.endsWith('.test.ts'));

/** Títulos de `it(...)` de todos os arquivos de teste. */
const titulos = arquivosDeTeste.flatMap((caminho) =>
  [...readFileSync(join('tests', caminho), 'utf8').matchAll(/\bit\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g)].map((m) =>
    m[2]!.replace(/\\(.)/g, '$1'),
  ),
);

describe('Infra › rastreabilidade', () => {
  it('Infra › rastreabilidade: toda RN-NNN da spec aparece no início de um título de teste', () => {
    expect(regras.length).toBeGreaterThanOrEqual(18);
    const semTeste = regras.filter((rn) => !titulos.some((t) => t.startsWith(`${rn} ›`)));
    expect(semTeste, `RNs sem teste: ${semTeste.join(', ')}`).toEqual([]);
  });

  it('Infra › rastreabilidade: toda linha da seção 7 tem um teste Borda › <Caso>', () => {
    const casos = casosDeBorda();
    expect(casos.length).toBeGreaterThanOrEqual(121);
    const semTeste = casos.filter((caso) => !titulos.includes(`Borda › ${caso}`));
    expect(semTeste, `casos de borda sem teste:\n${semTeste.join('\n')}`).toEqual([]);
  });

  it('Infra › rastreabilidade: toda RN-NNN tem exatamente um arquivo rn-NNN-*.test.ts', () => {
    const porRegra = regras.map((rn) => {
      const padrao = new RegExp(`(^|/)${rn.toLowerCase()}-[^/]*\\.test\\.ts$`);
      return [rn, arquivosDeTeste.filter((c) => padrao.test(c)).length] as const;
    });
    expect(porRegra.filter(([, n]) => n !== 1), 'RN com zero ou mais de um arquivo').toEqual([]);
  });
});
