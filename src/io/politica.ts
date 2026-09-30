// Tabela de limites (RN-015, RN-016, AMB-044, R-12): o que falha aqui aborta a execução.

import { ehDataValida } from '../nucleo/datas.ts';
import { decimalDe } from '../nucleo/decimal.ts';
import { normalizar } from '../nucleo/texto.ts';
import { NumeroJson } from '../nucleo/tipos.ts';
import type { Centavos, Decimal, Politica, RegraCategoria, TabelaCategorias } from '../nucleo/tipos.ts';
import { ErroEntrada } from './entrada.ts';
import { lerJson } from './json.ts';

type Objeto = Readonly<Record<string, unknown>>;

function ehObjeto(v: unknown): v is Objeto {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof NumeroJson);
}

/** Número ≥ 0 do arquivo, exato (R-13); `falha` recebe o problema. */
function naoNegativo(v: unknown, falha: (problema: string) => never): Decimal {
  const d = v instanceof NumeroJson ? decimalDe(v.texto) : null;
  if (d === null) return falha(v === undefined ? 'ausente' : 'não é um número');
  if (d.digitos < 0n) return falha(`é negativo (${(v as NumeroJson).texto})`);
  return d;
}

/**
 * Texto do arquivo → `Politica`, ou `ErroEntrada` cuja mensagem começa por
 * `rotulo` e cita o caminho do campo (R-12).
 */
export function lerPolitica(texto: string, rotulo = 'tabela de limites (dados/politica.json)'): Politica {
  const falha = (mensagem: string): never => {
    throw new ErroEntrada(`${rotulo}: ${mensagem}`);
  };

  let json: unknown;
  try {
    json = lerJson(texto);
  } catch (e) {
    return falha(`o arquivo não é um JSON válido (${(e as Error).message})`);
  }
  if (!ehObjeto(json)) return falha('o conteúdo do arquivo não é um objeto JSON');

  const { versao, vigencia } = json;
  if (typeof versao !== 'string' || versao.trim() === '') falha('versao ausente, vazia ou não é texto');
  if (typeof vigencia !== 'string' || !ehDataValida(vigencia)) {
    falha('vigencia ausente ou não é uma data válida no formato AAAA-MM-DD');
  }
  if (json.moeda_base !== 'BRL') falha('moeda_base não é "BRL"');

  function categorias(bruto: unknown, caminho: string): TabelaCategorias {
    if (!ehObjeto(bruto)) return falha(`${caminho} ausente ou não é um objeto`);
    const tabela = new Map<string, RegraCategoria>();
    const nomes = new Map<string, string>();
    for (const [nome, regra] of Object.entries(bruto)) {
      const campo = `${caminho}.${nome}`;
      const chave = normalizar(nome);
      const anterior = nomes.get(chave);
      if (anterior !== undefined) falha(`${caminho}: categorias "${anterior}" e "${nome}" ficam iguais depois da normalização`);
      nomes.set(chave, nome);
      if (!ehObjeto(regra)) return falha(`${campo} não é um objeto`);

      const limite = naoNegativo(regra.limite, (problema) => falha(`${campo}.limite ${problema}`));
      const centavos = limite.digitos * 100n;
      const divisor = 10n ** BigInt(limite.escala);
      if (centavos % divisor !== 0n) {
        falha(`${campo}.limite tem mais de 2 casas decimais (${(regra.limite as NumeroJson).texto})`);
      }

      const { periodicidade } = regra;
      if (periodicidade !== 'dia' && periodicidade !== 'diaria') falha(`${campo}.periodicidade não é "dia" nem "diaria"`);
      if ((periodicidade === 'diaria') !== (chave === 'hospedagem')) {
        falha(`${campo}.periodicidade "${String(periodicidade)}": só hospedagem usa "diaria", e hospedagem só usa "diaria"`);
      }

      tabela.set(chave, { limite: (centavos / divisor) as Centavos, periodicidade: periodicidade as RegraCategoria['periodicidade'] });
    }
    return tabela;
  }

  const padrao = categorias(json.padrao, 'padrao');

  const brutos = json.centros_custo;
  if (!ehObjeto(brutos)) return falha('centros_custo ausente ou não é um objeto');
  const centrosCusto = new Map<string, { nome: string; categorias: TabelaCategorias }>();
  for (const [nome, tabela] of Object.entries(brutos)) {
    const chave = normalizar(nome);
    const anterior = centrosCusto.get(chave);
    if (anterior) falha(`centros_custo: "${anterior.nome}" e "${nome}" ficam iguais depois da normalização`);
    centrosCusto.set(chave, { nome, categorias: categorias(tabela, `centros_custo.${nome}`) });
  }

  const limiarNotaFiscal = naoNegativo(json.nota_fiscal_obrigatoria_acima_de, (problema) =>
    falha(`nota_fiscal_obrigatoria_acima_de ${problema}`),
  );
  const acrescimoViagemPercentual = naoNegativo(json.acrescimo_em_viagem_percentual, (problema) =>
    falha(`acrescimo_em_viagem_percentual ${problema}`),
  );

  return {
    versao: versao as string,
    vigencia: vigencia as string,
    padrao,
    centrosCusto,
    limiarNotaFiscal,
    acrescimoViagemPercentual,
  };
}
