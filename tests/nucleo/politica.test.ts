import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as politica from '../../src/nucleo/politica.ts';

describe('Infra › política', () => {
  it('Infra › política: src/nucleo/politica.ts não tem limite, limiar de nota fiscal nem percentual (só LIMIAR_APROVACAO e tabelaAplicavel)', () => {
    expect(Object.keys(politica).sort()).toEqual(['LIMIAR_APROVACAO', 'tabelaAplicavel']);
    expect(politica.LIMIAR_APROVACAO).toBe(500_00n);
    // Nenhum outro número no código (fora de comentários): os valores vêm da tabela (RN-016).
    const codigo = readFileSync('src/nucleo/politica.ts', 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(codigo.match(/\b\d[\d_]*n?\b/g)).toEqual(['500_00n']);
  });
});
