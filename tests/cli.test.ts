// CLI ponta a ponta, em processo filho (contracts/cli.md).

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { copiaDoProjeto, rodarCli } from './apoio.ts';

const pasta = mkdtempSync(join(tmpdir(), 'reembolso-cli-'));
const copias: string[] = [];
afterAll(() => {
  for (const p of [pasta, ...copias]) rmSync(p, { recursive: true, force: true });
});

/** Cópia temporária do projeto (R-11), removida no fim. */
function copia(): string {
  const raiz = copiaDoProjeto();
  copias.push(raiz);
  return raiz;
}

/** Troca o texto de `dados/politica.json` da cópia. */
function trocarPolitica(raiz: string, trocar: (texto: string) => string): void {
  const caminho = join(raiz, 'dados', 'politica.json');
  const texto = readFileSync(caminho, 'utf8');
  const novo = trocar(texto);
  expect(novo).not.toBe(texto);
  writeFileSync(caminho, novo);
}

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

  it('Infra › CLI: exemplo → código 0, resumo no stdout, JSON indentado com \\n final', () => {
    const saida = arquivo();
    const r = calcular('exemplos/despesas-exemplo.json', saida);
    expect(r.codigo).toBe(0);
    expect(r.stderr).toBe('');
    expect(r.stdout).toBe('14 itens processados; total reembolsável R$ 351,43\n');
    const texto = readFileSync(saida, 'utf8');
    expect(texto.startsWith('{\n  "colaborador": {\n    "id": "c-0417",')).toBe(true);
    expect(texto.endsWith('}\n')).toBe(true);
    expect(JSON.parse(texto).resumo.total_reembolsavel).toBe(351.43);
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

  it('RN-015 › CLI: "centro_custo": 42 → código 1, stderr cita colaborador.centro_custo, nenhum arquivo de saída', () => {
    const saida = arquivo();
    const entrada = '{"colaborador": {"id": "c-1", "centro_custo": 42}, "periodo": {"inicio": "2026-07-01", "fim": "2026-07-31"}, "despesas": []}';
    const r = calcular(arquivo(entrada), saida);
    expect(r.codigo).toBe(1);
    expect(r.stderr).toMatch(/^erro: .*colaborador\.centro_custo/);
    expect(existsSync(saida)).toBe(false);
  });

  it('RN-015 › CLI: dados/cambio.json ausente (cópia temporária) → código 1, stderr cita o arquivo de câmbio, nenhum arquivo de saída', () => {
    const raiz = copia();
    rmSync(join(raiz, 'dados', 'cambio.json'));
    const saida = arquivo();
    const r = rodarCli(['calcular', '--input', resolve('exemplos/despesas-exemplo.json'), '--output', saida], { raiz, cwd: raiz });
    expect(r.codigo).toBe(1);
    expect(r.stderr).toBe('erro: arquivo de câmbio (dados/cambio.json): arquivo não encontrado\n');
    expect(existsSync(saida)).toBe(false);
  });

  it('RN-015 › CLI: limite negativo em dados/politica.json (cópia temporária) → código 1, stderr cita a tabela de limites e o campo', () => {
    const raiz = copia();
    trocarPolitica(raiz, (texto) => texto.replace('"limite": 45.00', '"limite": -10'));
    const saida = arquivo();
    const r = rodarCli(['calcular', '--input', resolve('exemplos/despesas-exemplo.json'), '--output', saida], { raiz });
    expect(r.codigo).toBe(1);
    expect(r.stderr).toMatch(/^erro: tabela de limites \(dados\/politica\.json\): centros_custo\.CC-ADM\.alimentacao\.limite/);
    expect(existsSync(saida)).toBe(false);
  });

  it('RN-016 › CLI: padrao.hospedagem.limite 320.00 em dados/ (cópia temporária) muda f-002 de PARCIAL 250,00 para APROVADO 310,00 sem mudar o código', () => {
    const raiz = copia();
    const entrada = resolve('exemplos/envelope/despesas-envelope-cc-desconhecido.json');
    const f002 = (saida: string) => JSON.parse(readFileSync(saida, 'utf8')).itens[1];

    const antes = arquivo();
    expect(rodarCli(['calcular', '--input', entrada, '--output', antes], { raiz }).codigo).toBe(0);
    expect(f002(antes)).toMatchObject({ id: 'f-002', status: 'PARCIAL', valor_reembolsavel: 250 });

    trocarPolitica(raiz, (texto) => texto.replace('"limite": 250.00', '"limite": 320.00'));
    const depois = arquivo();
    const r = rodarCli(['calcular', '--input', entrada, '--output', depois], { raiz });
    expect(r.codigo).toBe(0);
    expect(f002(depois)).toMatchObject({ id: 'f-002', status: 'APROVADO', valor_reembolsavel: 310 });
    expect(JSON.parse(readFileSync(depois, 'utf8')).resumo.total_reembolsavel).toBe(433.76);
    // nenhum arquivo de código mudou na cópia
    for (const f of readdirSync('src', { recursive: true, encoding: 'utf8' }).filter((c) => c.endsWith('.ts'))) {
      expect(readFileSync(join(raiz, 'src', f)).equals(readFileSync(join('src', f))), f).toBe(true);
    }
  });

  it('Infra › CLI: chamado de outra pasta lê o mesmo dados/', () => {
    const entrada = resolve('exemplos/envelope/despesas-envelope.json');
    const [daRaiz, deFora] = [arquivo(), arquivo()];
    expect(rodarCli(['calcular', '--input', entrada, '--output', daRaiz]).codigo).toBe(0);
    const r = rodarCli(['calcular', '--input', entrada, '--output', deFora], { cwd: pasta });
    expect(r.codigo).toBe(0);
    expect(readFileSync(deFora).equals(readFileSync(daRaiz))).toBe(true);
  });

  it('Infra › CLI: envelope → código 0, stdout cita o total pendente', () => {
    const saida = arquivo();
    const r = calcular('exemplos/envelope/despesas-envelope.json', saida);
    expect(r.codigo).toBe(0);
    expect(r.stderr).toBe('');
    expect(r.stdout).toBe('10 itens processados; total reembolsável R$ 748,26; total pendente de aprovação R$ 1.200,00\n');
    expect(JSON.parse(readFileSync(saida, 'utf8')).resumo).toMatchObject({ pendentes: 1, total_pendente: 1200 });
  });

  it('Infra › CLI: duas execuções do envelope geram bytes idênticos', () => {
    const [a, b] = [arquivo(), arquivo()];
    const entrada = 'exemplos/envelope/despesas-envelope.json';
    expect(cliCom({ TZ: 'UTC', LANG: 'C' }, 'calcular', '--input', entrada, '--output', a).codigo).toBe(0);
    expect(cliCom({ TZ: 'Asia/Tokyo', LANG: 'pt_BR.UTF-8' }, 'calcular', '--input', entrada, '--output', b).codigo).toBe(0);
    expect(readFileSync(b).equals(readFileSync(a))).toBe(true);
  });

  it('Infra › CLI: duas execuções com a mesma entrada geram bytes idênticos', () => {
    const [a, b] = [arquivo(), arquivo()];
    const entrada = 'exemplos/despesas-exemplo.json';
    expect(cliCom({ TZ: 'UTC', LANG: 'C' }, 'calcular', '--input', entrada, '--output', a).codigo).toBe(0);
    expect(cliCom({ TZ: 'Pacific/Kiritimati', LANG: 'pt_BR.UTF-8' }, 'calcular', '--input', entrada, '--output', b).codigo).toBe(0);
    expect(readFileSync(b).equals(readFileSync(a))).toBe(true);
  });
});
