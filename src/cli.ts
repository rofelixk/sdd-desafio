// CLI (R-08, DT-004, contracts/cli.md): tudo é calculado em memória antes de gravar.

import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { ErroEntrada, lerEntrada } from './io/entrada.ts';
import { lerExternos } from './io/externos.ts';
import { serializarJson } from './io/json.ts';
import { montarSaida } from './io/saida.ts';
import { formatarReais } from './nucleo/dinheiro.ts';
import { calcular } from './nucleo/motor.ts';

const USO = 'uso: node src/cli.ts calcular --input <arquivo-entrada.json> --output <arquivo-saida.json>';

/** Erro que encerra a execução com uma mensagem e um código de saída. */
class Falha extends Error {
  readonly codigo: number;

  constructor(mensagem: string, codigo: number) {
    super(mensagem);
    this.codigo = codigo;
  }
}

function lerArgumentos(argv: string[]): { input: string; output: string } {
  let args;
  try {
    args = parseArgs({
      args: argv,
      allowPositionals: true,
      strict: true,
      options: { input: { type: 'string' }, output: { type: 'string' } },
    });
  } catch (e) {
    throw new Falha(`${USO}\n${(e as Error).message}`, 2);
  }
  const { positionals, values } = args;
  if (positionals.length !== 1 || positionals[0] !== 'calcular') throw new Falha(USO, 2);
  if (!values.input || !values.output) throw new Falha(`${USO}\n--input e --output são obrigatórios`, 2);
  return { input: values.input, output: values.output };
}

async function executar(argv: string[]): Promise<void> {
  const { input, output } = lerArgumentos(argv);
  if (typeof JSON.rawJSON !== 'function') {
    throw new Falha('erro: este Node não tem JSON.rawJSON; use Node 24 ou mais novo', 1);
  }

  let texto: string;
  try {
    texto = await readFile(input, 'utf8');
  } catch (e) {
    throw new Falha(`erro: não foi possível ler o arquivo de entrada ${input}: ${(e as Error).message}`, 1);
  }

  let conteudo: string;
  let resumo: string;
  try {
    const entrada = lerEntrada(texto);
    const { politica, cambio } = lerExternos(); // entrada → tabela de limites → câmbio (R-12)
    const resultado = calcular(entrada, politica, cambio);
    conteudo = serializarJson(montarSaida(resultado));
    const { quantidadeItens, totalReembolsavel, totalPendente } = resultado.resumo;
    resumo = `${quantidadeItens} itens processados; total reembolsável ${formatarReais(totalReembolsavel)}`;
    if (totalPendente > 0n) resumo += `; total pendente de aprovação ${formatarReais(totalPendente)}`;
  } catch (e) {
    if (e instanceof ErroEntrada) throw new Falha(`erro: ${e.message}`, 1);
    throw e;
  }

  try {
    await writeFile(output, conteudo, 'utf8');
  } catch (e) {
    throw new Falha(`erro: não foi possível gravar o arquivo de saída ${output}: ${(e as Error).message}`, 1);
  }
  process.stdout.write(`${resumo}\n`);
}

try {
  await executar(process.argv.slice(2));
} catch (e) {
  if (!(e instanceof Falha)) throw e;
  process.stderr.write(`${e.message}\n`);
  process.exitCode = e.codigo;
}
