import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CAMINHO_CAMBIO, CAMINHO_POLITICA } from '../../src/io/externos.ts';

describe('Infra › externos', () => {
  it('Infra › externos: caminhos apontam para <raiz>/dados/, independente de process.cwd()', () => {
    expect(CAMINHO_POLITICA).toBe(resolve('dados', 'politica.json'));
    expect(CAMINHO_CAMBIO).toBe(resolve('dados', 'cambio.json'));
    expect(existsSync(CAMINHO_POLITICA) && existsSync(CAMINHO_CAMBIO)).toBe(true);

    // o mesmo módulo importado de outra pasta de trabalho
    const modulo = resolve('src/io/externos.ts');
    const r = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', `const m = await import(${JSON.stringify(`file:///${modulo.replaceAll('\\', '/')}`)}); console.log(JSON.stringify([m.CAMINHO_POLITICA, m.CAMINHO_CAMBIO]))`],
      { cwd: tmpdir(), encoding: 'utf8' },
    );
    expect(r.stderr).toBe('');
    expect(JSON.parse(r.stdout)).toEqual([CAMINHO_POLITICA, CAMINHO_CAMBIO]);
  });
});
