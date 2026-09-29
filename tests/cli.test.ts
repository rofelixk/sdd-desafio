// CLI ponta a ponta, em processo filho (contracts/cli.md).

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

const pasta = mkdtempSync(join(tmpdir(), 'reembolso-cli-'));
afterAll(() => rmSync(pasta, { recursive: true, force: true }));

let contador = 0;

/** Caminho novo na pasta temporária; com `conteudo`, o arquivo é criado. */
function arquivo(conteudo?: string): string {
  const caminho = join(pasta, `arquivo-${++contador}.json`);
  if (conteudo !== undefined) writeFileSync(caminho, conteudo);
  return caminho;
}

function cli(...args: string[]) {
  return cliCom({}, ...args);
}

function cliCom(env: Record<string, string>, ...args: string[]) {
  const r = spawnSync(process.execPath, ['src/cli.ts', ...args], { encoding: 'utf8', env: { ...process.env, ...env } });
  return { codigo: r.status, stdout: r.stdout, stderr: r.stderr };
}

function calcular(entrada: string, saida: string) {
  return cli('calcular', '--input', entrada, '--output', saida);
}

const SEM_PERIODO = JSON.stringify({ colaborador: { id: 'c-1' }, despesas: [] });

describe('CLI', () => {
  it('RN-015 › CLI: arquivo sem periodo → código 1, stderr cita periodo, nenhum arquivo de saída', () => {
    const saida = arquivo();
    const r = calcular(arquivo(SEM_PERIODO), saida);
    expect(r.codigo).toBe(1);
    expect(r.stderr).toMatch(/^erro: .*periodo/);
    expect(r.stdout).toBe('');
    expect(existsSync(saida)).toBe(false);
  });

  it('RN-015 › CLI: arquivo de entrada inexistente → código 1, nenhum arquivo de saída', () => {
    const saida = arquivo();
    const r = calcular(join(pasta, 'nao-existe.json'), saida);
    expect(r.codigo).toBe(1);
    expect(r.stderr).toMatch(/^erro: .*nao-existe\.json/);
    expect(existsSync(saida)).toBe(false);
  });

  it('RN-015 › CLI: arquivo que não é JSON → código 1', () => {
    const saida = arquivo();
    const r = calcular(arquivo('isto não é json'), saida);
    expect(r.codigo).toBe(1);
    expect(r.stderr).toMatch(/^erro: .*JSON/);
    expect(existsSync(saida)).toBe(false);
  });

  it('RN-015 › CLI: em erro, arquivo de saída pré-existente não é alterado', () => {
    const saida = arquivo('conteúdo anterior');
    expect(calcular(arquivo(SEM_PERIODO), saida).codigo).toBe(1);
    expect(readFileSync(saida, 'utf8')).toBe('conteúdo anterior');
  });

  it('RN-003 › CLI: despesa inválida não aborta (código 0)', () => {
    const saida = arquivo();
    const entrada = JSON.stringify({
      colaborador: { id: 'c-1' },
      periodo: { inicio: '2026-07-01', fim: '2026-07-31' },
      despesas: [{ id: 'a', data: '2026-07-32', categoria: 'alimentacao', valor: 10 }, 42],
    });
    const r = calcular(arquivo(entrada), saida);
    expect(r.codigo).toBe(0);
    const json = JSON.parse(readFileSync(saida, 'utf8'));
    expect(json.itens.map((i: { motivo: { codigo: string } }) => i.motivo.codigo)).toEqual(['DADO_INVALIDO', 'DADO_INVALIDO']);
  });

  it('Infra › CLI: exemplo → código 0, resumo no stdout, JSON indentado com \n final', () => {
    const saida = arquivo();
    const r = calcular('exemplos/despesas-exemplo.json', saida);
    expect(r.codigo).toBe(0);
    expect(r.stderr).toBe('');
    expect(r.stdout).toBe('14 itens processados; total reembolsável R$ 815,43\n');
    const texto = readFileSync(saida, 'utf8');
    expect(texto.startsWith('{\n  "colaborador": {\n    "id": "c-0417",')).toBe(true);
    expect(texto.endsWith('}\n')).toBe(true);
    expect(JSON.parse(texto).resumo.total_reembolsavel).toBe(815.43);
  });

  it('Infra › CLI: subcomando ou opção ausente → código 2 com "uso:"', () => {
    const saida = arquivo();
    const entrada = 'exemplos/despesas-exemplo.json';
    for (const args of [
      [],
      ['--input', entrada, '--output', saida],
      ['somar', '--input', entrada, '--output', saida],
      ['calcular', '--output', saida],
      ['calcular', '--input', entrada],
      ['calcular', '--input', entrada, '--output', saida, '--verbose'],
      ['calcular', 'extra', '--input', entrada, '--output', saida],
    ]) {
      const r = cli(...args);
      expect(r.codigo, args.join(' ')).toBe(2);
      expect(r.stderr, args.join(' ')).toMatch(/^uso: /);
    }
    expect(existsSync(saida)).toBe(false);
  });

  it('Infra › CLI: duas execuções com a mesma entrada geram bytes idênticos', () => {
    const [a, b] = [arquivo(), arquivo()];
    const entrada = 'exemplos/despesas-exemplo.json';
    expect(cliCom({ TZ: 'UTC', LANG: 'C' }, 'calcular', '--input', entrada, '--output', a).codigo).toBe(0);
    expect(cliCom({ TZ: 'Pacific/Kiritimati', LANG: 'pt_BR.UTF-8' }, 'calcular', '--input', entrada, '--output', b).codigo).toBe(0);
    expect(readFileSync(b).equals(readFileSync(a))).toBe(true);
  });
});
