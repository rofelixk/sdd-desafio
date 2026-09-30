
> /speckit-implement

  Ran 3 shell commands (ctrl+o to expand)

● Checklist: requirements.md 15/15 ✓ PASS. Reading tasks.md.

  Read 1 file (ctrl+o to expand)

● Checklist requirements.md: 15/15 ✓ PASS. Phases 1–4 are done; Phase 5 (T-043 →
  T-071) remains. Let me load the design docs and current code.

  Read 1 file, ran 4 shell commands (ctrl+o to expand)

● Now the current source code.

  Read 1 file, ran 2 shell commands (ctrl+o to expand)

● Now the example files and current test status.

  Ran 2 shell commands (ctrl+o to expand)

● Baseline matches the "known red" in tasks.md (rastreabilidade + contrato). Let
  me read the test files I'll be extending.

  Read 1 file, ran 5 shell commands (ctrl+o to expand)

● I have the full picture of the code. Quick look at the latest decisions and
  quickstart before starting.

  Ran 1 shell command (ctrl+o to expand)

● Pattern from history: one feat/test(T-NNN) commit per task, then docs(tasks):
  marca T-NNN como concluída (<hash>). I'll follow it.

  Ran 1 shell command (ctrl+o to expand)

● Setup verified (.gitignore exists; I'll append the missing *.log). I'll write
  a small helper to mark tasks and commit, then start Phase 5.

  Ran 1 shell command (ctrl+o to expand)

● T-043 — v4 types in tipos.ts

● Update(src\nucleo\tipos.ts)
  ⎿  Added 69 lines
      164    readonly itens: readonly ResultadoItem[];
      165    readonly resumo: Resumo;
      166  }
      167 +                                                              
      168 +// -----------------------------------------------------------
          +----------------                                              
      169 +// Política v4 (data-model.md §2 e §3)                        
      170 +// -----------------------------------------------------------
          +----------------                                              
      171 +                                                              
      172 +/** Número exato do arquivo: `digitos × 10^−escala` (R-13). */
      173 +export interface Decimal {                                    
      174 +  readonly digitos: bigint;                                   
      175 +  readonly escala: number;                                    
      176 +}                                                             
      177 +                                                              
      178 +/** Código de moeda em maiúsculas, sem espaços nas bordas (R-0
          +6). */                                                        
      179 +export type Moeda = string;                                   
      180 +                                                              
      181 +/** `dia`: limite por data (RN-009); `diaria`: limite por noit
          +e (RN-012). */                                                
      182 +export type Periodicidade = 'dia' | 'diaria';                 
      183 +                                                              
      184 +export interface RegraCategoria {                             
      185 +  readonly limite: Centavos;                                  
      186 +  readonly periodicidade: Periodicidade;                      
      187 +}                                                             
      188 +                                                              
      189 +/** Categoria normalizada (RN-002) → regra. */                
      190 +export type TabelaCategorias = ReadonlyMap<string, RegraCatego
          +ria>;                                                         
      191 +                                                              
      192 +/** Tabela de limites válida (RN-016, AMB-044). */            
      193 +export interface Politica {                                   
      194 +  readonly versao: string;                                    
      195 +  /** Só validada (AMB-034). */                               
      196 +  readonly vigencia: DataISO;                                 
      197 +  readonly padrao: TabelaCategorias;                          
      198 +  /** Nome normalizado → nome como está escrito e as categoria
          +s do centro de custo. */                                      
      199 +  readonly centrosCusto: ReadonlyMap<string, { readonly nome: 
          +string; readonly categorias: TabelaCategorias }>;             
      200 +  /** RN-008. */                                              
      201 +  readonly limiarNotaFiscal: Decimal;                         
      202 +  /** RN-011, AMB-033. */                                     
      203 +  readonly acrescimoViagemPercentual: Decimal;                
      204 +}                                                             
      205 +                                                              
      206 +/** Taxa publicada numa data; o texto original sai na saída (R
          +-04). */                                                      
      207 +export interface Cotacao {                                    
      208 +  readonly data: DataISO;                                     
      209 +  readonly taxa: NumeroJson;                                  
      210 +}                                                             
      211 +                                                              
      212 +/** Índice do câmbio: moeda → cotações em ordem crescente de d
          +ata (R-14). */                                                
      213 +export type Cambio = ReadonlyMap<Moeda, readonly Cotacao[]>;  
      214 +                                                              
      215 +/** Tabela montada uma vez por execução (RN-016). */          
      216 +export interface TabelaAplicavel {                            
      217 +  /** `"padrao"` ou o centro de custo como está na tabela (`po
          +litica.tabela`). */                                           
      218 +  readonly nome: string;                                      
      219 +  readonly versao: string;                                    
      220 +  /** Nome do centro de custo quando há entrada na tabela (RN-
          +006). */                                                      
      221 +  readonly centroCusto: string | null;                        
      222 +  readonly categorias: ReadonlyMap<string, RegraCategoria & { 
          +readonly origem: 'centro_custo' | 'padrao' }>;                
      223 +  readonly limiarNotaFiscal: Decimal;                         
      224 +  readonly acrescimoViagemPercentual: Decimal;                
      225 +}                                                             
      226 +                                                              
      227 +/** Conversão para reais (RN-017); os três campos andam juntos
          + (AMB-043). */                                                
      228 +export interface Conversao {                                  
      229 +  /** Do câmbio; `1` em BRL. */                               
      230 +  readonly taxa: NumeroJson;                                  
      231 +  /** `null` em BRL. */                                       
      232 +  readonly dataCotacao: DataISO | null;                       
      233 +  /** Em reais, meio para o par (AMB-037). */                 
      234 +  readonly valorSolicitado: Centavos;                         
      235 +}                                                             

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; printf '\n# Logs\n*.log\n'
      >> .gitignore; npm run typecheck 2>&1 | tail -3 && npx vitest run 2>&1 |
      grep -E "Test…)
  ⎿  Updated .gitignore (+48 -45)
       1 -# -------------------------------------------------------------
         ---------------                                                 
       2 -# MATERIAL DO INSTRUTOR — NUNCA COMMITAR NESTE REPOSITORIO     
       3 -# Contem o envelope lacrado do Dia 2, o gabarito das ambiguidad
         -es e o                                                         
       4 -# avaliador. Publicar qualquer um destes arquivos invalida o de
         -safio.                                                         
       5 -# -------------------------------------------------------------
         ---------------                                                 
       6 -instrutor/                                                     
       1 +# -------------------------------------------------------------
         +--------------                                                 
       2 +# MATERIAL DO INSTRUTOR — NUNCA COMMITAR NESTE REPOSITORIO     
       3 +# Contem o envelope lacrado do Dia 2, o gabarito das ambiguidad
         +es e o                                                         
       4 +# avaliador. Publicar qualquer um destes arquivos invalida o de
         +safio.                                                         
       5 +# -------------------------------------------------------------
         +--------------                                                 
       6 +instrutor/                                                     
       7 +                                                               
       8 +# Pareceres de correcao, caso sejam gerados dentro do repo     
       9 +PARECER-*.md                                                   
      10 +                                                               
      11 +# -------------------------------------------------------------
         +--------------                                                 
      12 +# Ruido de ambiente                                            
      13 +# -------------------------------------------------------------
         +--------------                                                 
      14 +.DS_Store                                                      
      15 +Thumbs.db                                                      
      16 +desktop.ini                                                    
      17 +*.swp                                                          
      18 +*~                                                             
      19 +                                                               
      20 +.idea/                                                         
      21 +.vscode/                                                       
      22 +*.code-workspace                                               
      23 +                                                               
      24 +.env                                                           
      25 +.env.*                                                         
      26 +!.env.example                                                  
      27 +                                                               
      28 +# Dependencias e artefatos (stack livre — cobrindo as mais prov
         +aveis)                                                         
      29 +node_modules/                                                  
      30 +dist/                                                          
      31 +build/                                                         
      32 +coverage/                                                      
      33 +.venv/                                                         
      34 +venv/                                                          
     … 54 more lines (ctrl+o to expand)

● Bash(bash "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Ap
      ps-sdd-desafio/19301ba9-012b-420b-aeb4-4892b4a12f23/scratchpad/fechar.sh"
      T-043 "feat(T…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      274  
      275  ### 5.1 Fundação da v4
      276  
      277 -- [ ] **T-043** — Acrescentar em `src/nucleo/tipos.ts` os tipo
          -s novos do `data-model.md` §2–§3, **sem remover nem alterar** 
          -os da v1: `Decimal` (`{ digitos: bigint; escala: number }`), `
          -Moeda`, `Periodicidade` (`'dia' | 'diaria'`), `RegraCategoria`
          -, `TabelaCategorias`, `Politica`, `Cotacao`, `Cambio`, `Tabela
          -Aplicavel` e `Conversao` (`{ taxa: NumeroJson; dataCotacao: Da
          -taISO | null; valorSolicitado: Centavos }`). `Categoria`, `Sta
          -tus`, a união de códigos, `Entrada`, `DespesaValida` e `Result
          -adoItem` só mudam nas tasks que os usam (T-048, T-050, T-055, 
          -T-056, T-058)                                                 
      277 +- [x] **T-043** — Acrescentar em `src/nucleo/tipos.ts` os tipo
          +s novos do `data-model.md` §2–§3, **sem remover nem alterar** 
          +os da v1: `Decimal` (`{ digitos: bigint; escala: number }`), `
          +Moeda`, `Periodicidade` (`'dia' | 'diaria'`), `RegraCategoria`
          +, `TabelaCategorias`, `Politica`, `Cotacao`, `Cambio`, `Tabela
          +Aplicavel` e `Conversao` (`{ taxa: NumeroJson; dataCotacao: Da
          +taISO | null; valorSolicitado: Centavos }`). `Categoria`, `Sta
          +tus`, a união de códigos, `Entrada`, `DespesaValida` e `Result
          +adoItem` só mudam nas tasks que os usam (T-048, T-050, T-055, 
          +T-056, T-058)                                                 
      278    - **Atende:** RN-016, RN-017, AMB-043
      279    - **Aceite:** `npm run typecheck` sem erros e `npm test` sem
            falhas além das duas conhecidas
      280 -  - **Commit:** `<hash preenchido depois>`                    
      280 +  - **Commit:** `063c073`                                     
      281  
      282  - [ ] **T-044** — [P] Criar `src/nucleo/decimal.ts` (R-13): `d
           ecimalDe(texto)` lê sinal, dígitos, ponto e expoente (o mesmo 
           leitor de `paraCentavos`) e devolve `Decimal`; `dividirMeioPar
           aPar(numerador: bigint, denominador: bigint): bigint` é o únic
           o arredondamento do sistema. `paraCentavos` em `src/nucleo/din
           heiro.ts` passa a usá-la
      283    - **Atende:** RN-001, AMB-013, AMB-037

● T-044 — decimal.ts

● Write(src\nucleo\decimal.ts)
  ⎿  Wrote 29 lines to src\nucleo\decimal.ts
       1 // Números exatos do arquivo e o único arredondamento do sistema
          (R-13).
       3 import type { Decimal } from './tipos.ts';
       4
       5 const NUMERO = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;
       7 /**
       8  * Texto de número (sinal, dígitos, ponto decimal, expoente) → `
         Decimal`, com
          formato.
      10  */
     … +26 lines (ctrl+o to expand)

● Update(src\nucleo\dinheiro.ts)
  ⎿  Added 2 lines, removed 19 lines
      24    return `${sinal}R$ ${milhar},${centavos}`;
      25  }
      26  
      27 -const NUMERO = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;   
      28 -                                                               
      27  /**
      28   * Texto de número (sinal, dígitos, ponto decimal, expoente) → 
          centavos,
      29   * arredondando meio para o par sobre os dígitos, sem float (RN
          -001, DT-001).
      30   * Devolve `null` se o texto não é um número nesse formato.
      31   */
      32  export function paraCentavos(texto: string): Centavos | null {
      35 -  const m = NUMERO.exec(texto);                                
      36 -  if (!m) return null;                                         
      37 -  const [, sinal, inteiros, fracao = '', expoente = '0'] = m;  
      38 -  const digitos = BigInt(inteiros! + fracao);                  
      39 -  // valor × 100 = digitos × 10^escala                         
      40 -  const escala = Number(expoente) - fracao.length + 2;         
      41 -  let abs: bigint;                                             
      42 -  if (escala >= 0) {                                           
      43 -    abs = digitos * 10n ** BigInt(escala);                     
      44 -  } else {                                                     
      45 -    const divisor = 10n ** BigInt(-escala);                    
      46 -    const quociente = digitos / divisor;                       
      47 -    const dobroDoResto = (digitos % divisor) * 2n;             
      48 -    const sobe = dobroDoResto > divisor || (dobroDoResto === di
         -visor && quociente % 2n === 1n);                               
      49 -    abs = sobe ? quociente + 1n : quociente;                   
      50 -  }                                                            
      51 -  return sinal === '-' ? -abs : abs;                           
      33 +  const d = decimalDe(texto);                                  
      34 +  return d === null ? null : dividirMeioParaPar(d.digitos * 100
         +n, 10n ** BigInt(d.escala));                                   
      35  }

● Update(src\nucleo\dinheiro.ts)
  ⎿  Added 1 line
      1  // Dinheiro em centavos `bigint` (R-02).
      2  
      3 +import { decimalDe, dividirMeioParaPar } from './decimal.ts';   
      4  import type { Centavos } from './tipos.ts';
      5  
      6  function partes(c: Centavos): { sinal: string; inteiros: string;
          centavos: string } {

● Write(tests\nucleo\decimal.test.ts)
  ⎿  Wrote 28 lines to tests\nucleo\decimal.test.ts
       1 import { describe, expect, it } from 'vitest';
         decimal.ts';
       4 describe('Infra › decimal', () => {
       5   it('Infra › decimal: "5.93" → 593 × 10^-2, "50" → 50 × 10^0 e
       6     expect(decimalDe('5.93')).toEqual({ digitos: 593n, escala: 2
       7     expect(decimalDe('50')).toEqual({ digitos: 50n, escala: 0 })
       8     expect(decimalDe('1.00005e2')).toEqual({ digitos: 100005n, e
         scala: 3 });
         2 });
          });
     … +24 lines (ctrl+o to expand)

  Ran 1 shell command (ctrl+o to expand)

● Bash(bash "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Ap
      ps-sdd-desafio/19301ba9-012b-420b-aeb4-4892b4a12f23/scratchpad/fechar.sh"
      T-044 "feat(T…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      279    - **Aceite:** `npm run typecheck` sem erros e `npm test` sem
            falhas além das duas conhecidas
      280    - **Commit:** `063c073`
      281  
      282 -- [ ] **T-044** — [P] Criar `src/nucleo/decimal.ts` (R-13): `d
          -ecimalDe(texto)` lê sinal, dígitos, ponto e expoente (o mesmo 
          -leitor de `paraCentavos`) e devolve `Decimal`; `dividirMeioPar
          -aPar(numerador: bigint, denominador: bigint): bigint` é o únic
          -o arredondamento do sistema. `paraCentavos` em `src/nucleo/din
          -heiro.ts` passa a usá-la                                      
      282 +- [x] **T-044** — [P] Criar `src/nucleo/decimal.ts` (R-13): `d
          +ecimalDe(texto)` lê sinal, dígitos, ponto e expoente (o mesmo 
          +leitor de `paraCentavos`) e devolve `Decimal`; `dividirMeioPar
          +aPar(numerador: bigint, denominador: bigint): bigint` é o únic
          +o arredondamento do sistema. `paraCentavos` em `src/nucleo/din
          +heiro.ts` passa a usá-la                                      
      283    - **Atende:** RN-001, AMB-013, AMB-037
      284    - **Aceite:** em `tests/nucleo/decimal.test.ts` passam `Infr
           a › decimal: "5.93" → 593 × 10^-2, "50" → 50 × 10^0 e "1.00005
           e2" → 100005 × 10^-3` e `Infra › decimal: dividirMeioParaPar 2
           5/10 → 2, 35/10 → 4, 26/10 → 3, 24/10 → 2 e -25/10 → -2`; todo
           s os `RN-001 ›` de `tests/nucleo/rn-001-arredondamento.test.ts
           ` continuam passando
      285 -  - **Commit:** `<hash preenchido depois>`                    
      285 +  - **Commit:** `d660733`                                     
      286  
      287  - [ ] **T-045** — Criar `src/io/politica.ts` (R-12): `lerPolit
           ica(texto, rotulo = 'tabela de limites (dados/politica.json)')
           ` → `Politica` ou lança `ErroEntrada`, com a mensagem começand
           o pelo `rotulo` e citando o caminho do campo (`centros_custo.C
           C-ADM.alimentacao.limite`). Valida a lista da RN-016 e a AMB-0
           44: objeto; `versao` texto não vazio; `vigencia` data válida (
           T-004); `moeda_base` = `"BRL"`; `padrao` e `centros_custo` obj
           etos; cada centro de custo e cada categoria objeto; `limite` n
           úmero ≥ 0 exato em centavos; `periodicidade` `dia`/`diaria`, c
           om `diaria` ⇔ `hospedagem`; `nota_fiscal_obrigatoria_acima_de`
            e `acrescimo_em_viagem_percentual` números ≥ 0 (viram `Decima
           l`); centros de custo e categorias de uma mesma tabela sem col
           isão depois de `normalizar` (T-007). `observacao` e campos des
           conhecidos são ignorados. Guarda o nome do centro de custo com
           o está escrito
      288    - **Atende:** RN-015, RN-016, AMB-034, AMB-044

● T-045 — io/politica.ts
● Write(src\io\politica.ts)
  ⎿  Wrote 106 lines to src\io\politica.ts
      1 // Tabela de limites (RN-015, RN-016, AMB-044, R-12): o que falha
         aqui aborta a execução.
      2
      3 import { ehDataValida } from '../nucleo/datas.ts';
      4 import { decimalDe } from '../nucleo/decimal.ts';
      6 import { NumeroJson } from '../nucleo/tipos.ts';
      7 import type { Centavos, Decimal, Politica, RegraCategoria, Tabela
        Categorias } from '../nucleo/tipos.ts';
      8 import { ErroEntrada } from './entrada.ts';
      9 import { lerJson } from './json.ts';
     … +125 lines (ctrl+o to expand)

● Now the T-045 tests in tests/io/rn-015-entrada.test.ts.

  Ran 2 shell commands (ctrl+o to expand)

● Shell parse issue; nothing was written. I'll use the Edit tool instead.

● Update(tests\io\rn-015-entrada.test.ts)
  ⎿  Added 2 lines
      1 +import { readFileSync } from 'node:fs';                         
      2  import { describe, expect, it } from 'vitest';
      3  import { ErroEntrada, lerEntrada } from '../../src/io/entrada.ts
         ';
      4 +import { lerPolitica } from '../../src/io/politica.ts';         
      5  
      6  const VALIDO = {
      7    colaborador: { id: 'c-0417', nome: 'Marina' },

● Update(tests\io\rn-015-entrada.test.ts)
  ⎿  Added 130 lines
       95      }
       96    });
       97  });
       98 +                                                              
       99 +// -----------------------------------------------------------
          +----------------                                              
      100 +// Arquivos externos (RN-015, RN-016, RN-017, AMB-044)        
      101 +// -----------------------------------------------------------
          +----------------                                              
      102 +                                                              
      103 +const POLITICA_V4 = readFileSync('exemplos/envelope/politica-v
          +4.json', 'utf8');                                             
      104 +                                                              
      105 +/** Tabela da v4 relida como objeto comum, para trocar campos 
          +no teste. */                                                  
      106 +function politicaV4(): Record<string, any> {                  
      107 +  return JSON.parse(POLITICA_V4);                             
      108 +}                                                             
      109 +                                                              
      110 +/** Mensagem do `ErroEntrada` lançado por `ler(texto)`. */    
      111 +function erroDe(ler: (texto: string) => unknown, texto: string
          +): string {                                                   
      112 +  try {                                                       
      113 +    ler(texto);                                               
      114 +  } catch (e) {                                               
      115 +    expect(e).toBeInstanceOf(ErroEntrada);                    
      116 +    return (e as Error).message;                              
      117 +  }                                                           
      118 +  throw new Error(`arquivo aceito: ${texto}`);                
      119 +}                                                             
      120 +                                                              
      121 +/** Mensagem do erro da tabela de limites depois de `trocar` a
          + tabela da v4. */                                             
      122 +function erroTabela(trocar: (p: Record<string, any>) => void):
          + string {                                                     
      123 +  const p = politicaV4();                                     
      124 +  trocar(p);                                                  
      125 +  return erroDe(lerPolitica, JSON.stringify(p));              
      126 +}                                                             
      127 +                                                              
      128 +describe('RN-015 — Arquivo de entrada inválido (tabela de limi
          +tes)', () => {                                                
      129 +  it('RN-015 › tabela de limites de exemplos/envelope/politica
          +-v4.json é lida: versao v4, padrão com 3 categorias, 3 centros
          + de custo, limiar 100.00 e acréscimo 50', () => {             
      130 +    const p = lerPolitica(POLITICA_V4);                       
      131 +    expect(p.versao).toBe('v4');                              
      132 +    expect(p.vigencia).toBe('2026-07-01');                    
      133 +    expect([...p.padrao.keys()]).toEqual(['alimentacao', 'tran
          +sporte_urbano', 'hospedagem']);                               
      134 +    expect(p.padrao.get('hospedagem')).toEqual({ limite: 25000
          +n, periodicidade: 'diaria' });                                
      135 +    expect([...p.centrosCusto.values()].map((c) => c.nome)).to
          +Equal(['CC-ENG-PLATAFORMA', 'CC-COMERCIAL', 'CC-ADM']);       
      136 +    expect(p.centrosCusto.get('cc-comercial')?.categorias.get(
          +'representacao')).toEqual({ limite: 30000n, periodicidade: 'di
          +a' });                                                        
      137 +    expect(p.centrosCusto.get('cc-eng-plataforma')?.categorias
          +.get('hospedagem')?.limite).toBe(0n);                         
      138 +    expect(p.limiarNotaFiscal).toEqual({ digitos: 10000n, esca
          +la: 2 });                                                     
      139 +    expect(p.acrescimoViagemPercentual).toEqual({ digitos: 50n
          +, escala: 0 });                                               
      140 +  });                                                         
      141 +                                                              
      142 +  it('RN-015 › tabela de limites com "limite": -10 → erro que 
          +cita a tabela de limites e o campo', () => {                  
      143 +    const m = erroTabela((p) => (p.centros_custo['CC-ADM'].ali
          +mentacao.limite = -10));                                      
      144 +    expect(m).toMatch(/^tabela de limites \(dados\/politica\.j
          +son\): /);                                                    
      145 +    expect(m).toContain('centros_custo.CC-ADM.alimentacao.limi
          +te');                                                         
      146 +    expect(erroTabela((p) => (p.padrao.hospedagem.limite = -0.
          +01))).toContain('padrao.hospedagem.limite');                  
      147 +  });                                                         
      148 +                                                              
      149 +  it('RN-015 › tabela de limites: limite que não é número ou c
          +om mais de 2 casas (60.001) → erro que cita o campo', () => { 
      150 +    for (const limite of ['60.00', null, true, [60], undefined
          +]) {                                                          
      151 +      expect(erroTabela((p) => (p.padrao.alimentacao.limite = 
          +limite)), String(limite)).toContain('padrao.alimentacao.limite
          +');                                                           
      152 +    }                                                         
      153 +    const texto = JSON.stringify(politicaV4());               
      154 +    expect(erroDe(lerPolitica, texto.replace('"limite":60,', '
          +"limite":60.001,'))).toMatch(/padrao\.alimentacao\.limite.*60\
          +.001/);                                                       
      155 +    // zeros à direita não contam como casas                  
      156 +    const lida = lerPolitica(texto.replace('"limite":60,', '"l
          +imite":60.0100,'));                                           
      157 +    expect(lida.padrao.get('alimentacao')?.limite).toBe(6001n)
          +;                                                             
      158 +  });                                                         
      159 +                                                              
      160 +  it('RN-015 › tabela de limites sem versao, com versao vazia 
          +ou com vigencia que não é data → erro que cita o campo', () =>
          + {                                                            
      161 +    for (const versao of [undefined, '', '   ', 4, null]) {   
      162 +      expect(erroTabela((p) => (p.versao = versao)), String(ve
          +rsao)).toContain('versao');                                   
      163 +    }                                                         
      164 +    for (const vigencia of [undefined, '2026-02-30', '01/07/20
          +26', 20260701]) {                                             
      165 +      expect(erroTabela((p) => (p.vigencia = vigencia)), Strin
          +g(vigencia)).toContain('vigencia');                           
      166 +    }                                                         
      167 +  });                                                         
      168 +                                                              
      169 +  it('RN-015 › tabela de limites: moeda_base diferente de BRL 
          +→ erro', () => {                                              
      170 +    for (const moeda_base of ['USD', undefined, null]) {      
      171 +      expect(erroTabela((p) => (p.moeda_base = moeda_base)), S
          +tring(moeda_base)).toContain('moeda_base');                   
      172 +    }                                                         
      173 +  });                                                         
      174 +                                                              
      175 +  it('RN-015 › tabela de limites: periodicidade fora de dia/di
          +aria, diaria em alimentacao ou hospedagem com dia → erro', () 
          +=> {                                                          
      176 +    expect(erroTabela((p) => (p.padrao.alimentacao.periodicida
          +de = 'mes'))).toContain('padrao.alimentacao.periodicidade');  
      177 +    expect(erroTabela((p) => delete p.padrao.alimentacao.perio
          +dicidade)).toContain('padrao.alimentacao.periodicidade');     
      178 +    expect(erroTabela((p) => (p.padrao.alimentacao.periodicida
          +de = 'diaria'))).toContain('padrao.alimentacao.periodicidade')
          +;                                                             
      179 +    expect(erroTabela((p) => (p.centros_custo['CC-COMERCIAL'].
          +hospedagem.periodicidade = 'dia'))).toContain(                
      180 +      'centros_custo.CC-COMERCIAL.hospedagem.periodicidade',  
      181 +    );                                                        
      182 +  });                                                         
      183 +                                                              
      184 +  it('RN-015 › tabela de limites: nota_fiscal_obrigatoria_acim
          +a_de ou acrescimo_em_viagem_percentual ausente, não numérico o
          +u negativo → erro', () => {                                   
      185 +    for (const campo of ['nota_fiscal_obrigatoria_acima_de', '
          +acrescimo_em_viagem_percentual']) {                           
      186 +      for (const valor of [undefined, '100', null, -1]) {     
      187 +        expect(erroTabela((p) => (p[campo] = valor)), `${campo
          +} = ${String(valor)}`).toContain(campo);                      
      188 +      }                                                       
      189 +    }                                                         
      190 +  });                                                         
      191 +                                                              
      192 +  it('RN-015 › tabela de limites: "CC-ADM" e " cc-adm " em cen
          +tros_custo, ou "Alimentação" e "alimentacao" na mesma tabela →
          + erro', () => {                                               
      193 +    const regra = { limite: 10, periodicidade: 'dia' };       
      194 +    expect(erroTabela((p) => (p.centros_custo[' cc-adm '] = { 
          +alimentacao: regra }))).toMatch(/centros_custo.*CC-ADM.* cc-ad
          +m /);                                                         
      195 +    expect(erroTabela((p) => (p.padrao['Alimentação'] = regra)
          +)).toMatch(/padrao.*alimentacao.*Alimentação/);               
      196 +    expect(erroTabela((p) => (p.centros_custo['CC-ADM']['ALIME
          +NTACAO'] = regra))).toContain('centros_custo.CC-ADM');        
      197 +  });                                                         
      198 +                                                              
      199 +  it('RN-015 › tabela de limites: arquivo, padrao, centros_cus
          +to, centro de custo ou categoria que não é objeto → erro', () 
          +=> {                                                          
      200 +    for (const texto of ['[]', '42', '"x"', 'null']) {        
      201 +      expect(erroDe(lerPolitica, texto), texto).toMatch(/^tabe
          +la de limites .*objeto/);                                     
      202 +    }                                                         
      203 +    expect(erroTabela((p) => (p.padrao = []))).toContain('padr
          +ao');                                                         
      204 +    expect(erroTabela((p) => delete p.padrao)).toContain('padr
          +ao');                                                         
      205 +    expect(erroTabela((p) => (p.centros_custo = 'CC-ADM'))).to
          +Contain('centros_custo');                                     
      206 +    expect(erroTabela((p) => (p.centros_custo['CC-ADM'] = 45))
          +).toContain('centros_custo.CC-ADM');                          
      207 +    expect(erroTabela((p) => (p.padrao.alimentacao = 60))).toC
          +ontain('padrao.alimentacao');                                 
      208 +  });                                                         
      209 +                                                              
      210 +  it('RN-015 › tabela de limites: observacao e campos desconhe
          +cidos são ignorados', () => {                                 
      211 +    const p = politicaV4();                                   
      212 +    p.observacao = 'nota do financeiro';                      
      213 +    p.aprovacao_manual = { acima_de: 500 };                   
      214 +    p.padrao.alimentacao.observacao = 42;                     
      215 +    p.padrao.alimentacao.teto = 'x';                          
      216 +    const lida = lerPolitica(JSON.stringify(p));              
      217 +    expect(lida.padrao.get('alimentacao')).toEqual({ limite: 6
          +000n, periodicidade: 'dia' });                                
      218 +    expect(lida.centrosCusto.get('cc-eng-plataforma')?.categor
          +ias.get('hospedagem')).toEqual({ limite: 0n, periodicidade: 'd
          +iaria' });                                                    
      219 +  });                                                         
      220 +                                                              
      221 +  it('RN-015 › tabela de limites que não é JSON → erro que cit
          +a a tabela de limites', () => {                               
      222 +    for (const texto of ['', 'não é json', '{"versao": ']) {  
      223 +      expect(erroDe(lerPolitica, texto), texto).toMatch(/^tabe
          +la de limites \(dados\/politica\.json\): .*JSON/);            
      224 +    }                                                         
      225 +    expect(erroDe((t) => lerPolitica(t, 'tabela X'), '{')).toM
          +atch(/^tabela X: /);                                          
      226 +  });                                                         
      227 +});                                                           

  Ran 1 shell command (ctrl+o to expand)

● All pass. Committing T-045.

● Bash(bash "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Ap
      ps-sdd-desafio/19301ba9-012b-420b-aeb4-4892b4a12f23/scratchpad/fechar.sh"
      T-045 "feat(T…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      284    - **Aceite:** em `tests/nucleo/decimal.test.ts` passam `Infr
           a › decimal: "5.93" → 593 × 10^-2, "50" → 50 × 10^0 e "1.00005
           e2" → 100005 × 10^-3` e `Infra › decimal: dividirMeioParaPar 2
           5/10 → 2, 35/10 → 4, 26/10 → 3, 24/10 → 2 e -25/10 → -2`; todo
           s os `RN-001 ›` de `tests/nucleo/rn-001-arredondamento.test.ts
           ` continuam passando
      285    - **Commit:** `d660733`
      286  
      287 -- [ ] **T-045** — Criar `src/io/politica.ts` (R-12): `lerPolit
          -ica(texto, rotulo = 'tabela de limites (dados/politica.json)')
          -` → `Politica` ou lança `ErroEntrada`, com a mensagem começand
          -o pelo `rotulo` e citando o caminho do campo (`centros_custo.C
          -C-ADM.alimentacao.limite`). Valida a lista da RN-016 e a AMB-0
          -44: objeto; `versao` texto não vazio; `vigencia` data válida (
          -T-004); `moeda_base` = `"BRL"`; `padrao` e `centros_custo` obj
          -etos; cada centro de custo e cada categoria objeto; `limite` n
          -úmero ≥ 0 exato em centavos; `periodicidade` `dia`/`diaria`, c
          -om `diaria` ⇔ `hospedagem`; `nota_fiscal_obrigatoria_acima_de`
          - e `acrescimo_em_viagem_percentual` números ≥ 0 (viram `Decima
          -l`); centros de custo e categorias de uma mesma tabela sem col
          -isão depois de `normalizar` (T-007). `observacao` e campos des
          -conhecidos são ignorados. Guarda o nome do centro de custo com
          -o está escrito                                                
      287 +- [x] **T-045** — Criar `src/io/politica.ts` (R-12): `lerPolit
          +ica(texto, rotulo = 'tabela de limites (dados/politica.json)')
          +` → `Politica` ou lança `ErroEntrada`, com a mensagem começand
          +o pelo `rotulo` e citando o caminho do campo (`centros_custo.C
          +C-ADM.alimentacao.limite`). Valida a lista da RN-016 e a AMB-0
          +44: objeto; `versao` texto não vazio; `vigencia` data válida (
          +T-004); `moeda_base` = `"BRL"`; `padrao` e `centros_custo` obj
          +etos; cada centro de custo e cada categoria objeto; `limite` n
          +úmero ≥ 0 exato em centavos; `periodicidade` `dia`/`diaria`, c
          +om `diaria` ⇔ `hospedagem`; `nota_fiscal_obrigatoria_acima_de`
          + e `acrescimo_em_viagem_percentual` números ≥ 0 (viram `Decima
          +l`); centros de custo e categorias de uma mesma tabela sem col
          +isão depois de `normalizar` (T-007). `observacao` e campos des
          +conhecidos são ignorados. Guarda o nome do centro de custo com
          +o está escrito                                                
      288    - **Atende:** RN-015, RN-016, AMB-034, AMB-044
      289    - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `R
           N-015 › tabela de limites de exemplos/envelope/politica-v4.jso
           n é lida: versao v4, padrão com 3 categorias, 3 centros de cus
           to, limiar 100.00 e acréscimo 50`, `RN-015 › tabela de limites
            com "limite": -10 → erro que cita a tabela de limites e o cam
           po`, `RN-015 › tabela de limites: limite que não é número ou c
           om mais de 2 casas (60.001) → erro que cita o campo`, `RN-015 
           › tabela de limites sem versao, com versao vazia ou com vigenc
           ia que não é data → erro que cita o campo`, `RN-015 › tabela d
           e limites: moeda_base diferente de BRL → erro`, `RN-015 › tabe
           la de limites: periodicidade fora de dia/diaria, diaria em ali
           mentacao ou hospedagem com dia → erro`, `RN-015 › tabela de li
           mites: nota_fiscal_obrigatoria_acima_de ou acrescimo_em_viagem
           _percentual ausente, não numérico ou negativo → erro`, `RN-015
            › tabela de limites: "CC-ADM" e " cc-adm " em centros_custo, 
           ou "Alimentação" e "alimentacao" na mesma tabela → erro`, `RN-
           015 › tabela de limites: arquivo, padrao, centros_custo, centr
           o de custo ou categoria que não é objeto → erro`, `RN-015 › ta
           bela de limites: observacao e campos desconhecidos são ignorad
           os` e `RN-015 › tabela de limites que não é JSON → erro que ci
           ta a tabela de limites`
      290 -  - **Commit:** `<hash preenchido depois>`                    
      290 +  - **Commit:** `dbb0f6e`                                     
      291  
      292  - [ ] **T-046** — Criar `src/io/cambio.ts` (R-12, R-14): `lerC
           ambio(texto, rotulo = 'arquivo de câmbio (dados/cambio.json)')
           ` → `Cambio` ou lança `ErroEntrada` (mesmo formato de mensagem
            da T-045). Valida a lista da RN-017 e a AMB-044: objeto; `moe
           da_base` = `"BRL"`; `taxas` objeto; cada chave de `taxas` data
            válida; cada valor de data objeto; cada moeda com 3 letras; c
           ada taxa número > 0, **inclusive** a de uma moeda repetida que
            vai ser sobrescrita. Monta o índice `Map<Moeda, Cotacao[]>` c
           om a moeda em maiúsculas (`normalizarMoeda`, criada aqui em `s
           rc/nucleo/texto.ts`: `trim` + `toUpperCase`), datas em ordem c
           rescente e, para a mesma moeda na mesma data, a **última** do 
           arquivo. `fonte`, `observacao` e campos desconhecidos são igno
           rados
      293    - **Atende:** RN-015, RN-017, AMB-042, AMB-044

● T-046 — io/cambio.ts + normalizarMoeda

● Update(src\nucleo\texto.ts)
  ⎿  Added 5 lines
      12    return texto.trim().toLowerCase();
      13  }
      14  
      15 +/** Moeda: sem espaços nas bordas e maiúsculas (RN-003, RN-017,
         + AMB-036, AMB-042). */                                         
      16 +export function normalizarMoeda(texto: string): string {       
      17 +  return texto.trim().toUpperCase();                           
      18 +}                                                              
      19 +                                                               
      20  /** Qualquer valor bruto como texto (RN-003, AMB-026). */
      21  export function comoTexto(bruto: unknown): string {
      22    if (bruto === undefined || bruto === null) return '';

● Write(src\io\cambio.ts)
  ⎿  Wrote 64 lines to src\io\cambio.ts
      1 // Arquivo de câmbio (RN-015, RN-017, AMB-042, AMB-044, R-12, R-1
        4): o que falha aqui aborta a execução.
      2
      3 import { ehDataValida } from '../nucleo/datas.ts';
      4 import { decimalDe } from '../nucleo/decimal.ts';
      6 import { NumeroJson } from '../nucleo/tipos.ts';
      7 import type { Cambio, Cotacao, DataISO, Moeda } from '../nucleo/t
        ipos.ts';
      8 import { ErroEntrada } from './entrada.ts';
      9 import { lerJson } from './json.ts';
     … +71 lines (ctrl+o to expand)

● Update(tests\io\rn-015-entrada.test.ts)
  ⎿  Added 2 lines
      1  import { readFileSync } from 'node:fs';
      2  import { describe, expect, it } from 'vitest';
      3  import { ErroEntrada, lerEntrada } from '../../src/io/entrada.ts
         ';
      4 +import { lerCambio } from '../../src/io/cambio.ts';             
      5  import { lerPolitica } from '../../src/io/politica.ts';
      6 +import { NumeroJson } from '../../src/nucleo/tipos.ts';         
      7  
      8  const VALIDO = {
      9    colaborador: { id: 'c-0417', nome: 'Marina' },

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; cat >>
      tests/io/rn-015-entrada.test.ts <<'FIM'…)
  ⎿  Updated tests\io\rn-015-entrada.test.ts (+72 -0)
      227      expect(erroDe((t) => lerPolitica(t, 'tabela X'), '{')).toM
           atch(/^tabela X: /);
      228    });
      229  });
      230 +                                                              
      231 +const CAMBIO = readFileSync('exemplos/envelope/cambio.json', '
          +utf8');                                                       
      232 +                                                              
      233 +/** Mensagem do erro do câmbio para o objeto `c`. */          
      234 +function erroCambio(c: unknown): string {                     
      235 +  return erroDe(lerCambio, JSON.stringify(c));                
      236 +}                                                             
      237 +                                                              
      238 +/** Câmbio mínimo válido com `taxas` trocadas. */             
      239 +function cambio(taxas: unknown): Record<string, unknown> {    
      240 +  return { moeda_base: 'BRL', taxas };                        
      241 +}                                                             
      242 +                                                              
      243 +describe('RN-015 — Arquivo de entrada inválido (câmbio)', () =
          +> {                                                           
      244 +  it('RN-015 › câmbio de exemplos/envelope/cambio.json é lido:
          + USD e EUR com 12 cotações cada, em ordem de data', () => {   
      245 +    const c = lerCambio(CAMBIO);                              
      246 +    expect([...c.keys()]).toEqual(['USD', 'EUR']);            
      247 +    for (const moeda of ['USD', 'EUR']) {                     
      248 +      const datas = c.get(moeda)!.map((k) => k.data);         
      249 +      expect(datas).toHaveLength(12);                         
      250 +      expect(datas).toEqual([...datas].sort());               
      251 +    }                                                         
      252 +    expect(c.get('EUR')![1]).toEqual({ data: '2026-07-14', tax
          +a: new NumeroJson('5.93') });                                 
      253 +    expect(c.get('EUR')![3]?.taxa.texto).toBe('5.90');        
      254 +  });                                                         
      255 +                                                              
      256 +  it('RN-015 › câmbio: moeda_base diferente de BRL, ou taxas a
          +usente ou que não é objeto → erro que cita o arquivo de câmbio
          +', () => {                                                    
      257 +    expect(erroCambio({ moeda_base: 'USD', taxas: {} })).toMat
          +ch(/^arquivo de câmbio \(dados\/cambio\.json\): .*moeda_base/)
          +;                                                             
      258 +    expect(erroCambio({ taxas: {} })).toContain('moeda_base');
      259 +    for (const taxas of [undefined, [], 'x', null, 5]) {      
      260 +      expect(erroCambio(cambio(taxas)), String(taxas)).toMatch
          +(/^arquivo de câmbio .*taxas/);                               
      261 +    }                                                         
      262 +    for (const texto of ['[]', '42', 'null']) {               
      263 +      expect(erroDe(lerCambio, texto), texto).toMatch(/^arquiv
          +o de câmbio .*objeto/);                                       
      264 +    }                                                         
      265 +  });                                                         
      266 +                                                              
     … 35 more lines (ctrl+o to expand)
  ⎿  Created tests\nucleo\rn-017-cambio.test.ts (+25 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { lerCambio } from '../../src/io/cambio.ts';            
       3 +                                                               
       4 +describe('RN-017 — Moeda e conversão para reais', () => {      
       5 +  it('RN-017 › câmbio: "usd" no arquivo é indexado como USD', (
         +) => {                                                         
       6 +    const c = lerCambio('{"moeda_base": "BRL", "taxas": {"2026-
         +07-13": {"usd": 5.42, " Eur ": 5.91}}}');                      
       7 +    expect([...c.keys()]).toEqual(['USD', 'EUR']);             
       8 +    expect(c.get('USD')?.[0]?.taxa.texto).toBe('5.42');        
       9 +  });                                                          
      10 +                                                               
      11 +  it('RN-017 › câmbio: "USD": 5.42 e depois "usd": 5.50 na mesm
         +a data → vale 5.50, sem erro', () => {                         
      12 +    const c = lerCambio('{"moeda_base": "BRL", "taxas": {"2026-
         +07-13": {"USD": 5.42, "usd": 5.50}}}');                        
      13 +    expect(c.get('USD')).toEqual([{ data: '2026-07-13', taxa: e
         +xpect.objectContaining({ texto: '5.50' }) }]);                 
      14 +    const inverso = lerCambio('{"moeda_base": "BRL", "taxas": {
         +"2026-07-13": {"usd": 5.50, "USD": 5.42}}}');                  
      15 +    expect(inverso.get('USD')?.[0]?.taxa.texto).toBe('5.42');  
      16 +  });                                                          
      17 +                                                               
      18 +  it('RN-017 › câmbio: datas fora de ordem no arquivo ficam em 
         +ordem crescente no índice', () => {                            
      19 +    const c = lerCambio(                                       
      20 +      '{"moeda_base": "BRL", "taxas": {"2026-07-20": {"USD": 5.
         +50}, "2026-07-13": {"USD": 5.42}, "2026-07-17": {"USD": 5.47, "
         +EUR": 5.96}}}',                                                
      21 +    );                                                         
      22 +    expect(c.get('USD')?.map((k) => k.data)).toEqual(['2026-07-
         +13', '2026-07-17', '2026-07-20']);                             
      23 +    expect(c.get('EUR')?.map((k) => k.data)).toEqual(['2026-07-
         +17']);                                                         
      24 +  });                                                          
      25 +});                                                            

● Bash(bash "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Ap
      ps-sdd-desafio/19301ba9-012b-420b-aeb4-4892b4a12f23/scratchpad/fechar.sh"
      T-046 "feat(T…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      289    - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `R
           N-015 › tabela de limites de exemplos/envelope/politica-v4.jso
           n é lida: versao v4, padrão com 3 categorias, 3 centros de cus
           to, limiar 100.00 e acréscimo 50`, `RN-015 › tabela de limites
            com "limite": -10 → erro que cita a tabela de limites e o cam
           po`, `RN-015 › tabela de limites: limite que não é número ou c
           om mais de 2 casas (60.001) → erro que cita o campo`, `RN-015 
           › tabela de limites sem versao, com versao vazia ou com vigenc
           ia que não é data → erro que cita o campo`, `RN-015 › tabela d
           e limites: moeda_base diferente de BRL → erro`, `RN-015 › tabe
           la de limites: periodicidade fora de dia/diaria, diaria em ali
           mentacao ou hospedagem com dia → erro`, `RN-015 › tabela de li
           mites: nota_fiscal_obrigatoria_acima_de ou acrescimo_em_viagem
           _percentual ausente, não numérico ou negativo → erro`, `RN-015
            › tabela de limites: "CC-ADM" e " cc-adm " em centros_custo, 
           ou "Alimentação" e "alimentacao" na mesma tabela → erro`, `RN-
           015 › tabela de limites: arquivo, padrao, centros_custo, centr
           o de custo ou categoria que não é objeto → erro`, `RN-015 › ta
           bela de limites: observacao e campos desconhecidos são ignorad
           os` e `RN-015 › tabela de limites que não é JSON → erro que ci
           ta a tabela de limites`
      290    - **Commit:** `dbb0f6e`
      291  
      292 -- [ ] **T-046** — Criar `src/io/cambio.ts` (R-12, R-14): `lerC
          -ambio(texto, rotulo = 'arquivo de câmbio (dados/cambio.json)')
          -` → `Cambio` ou lança `ErroEntrada` (mesmo formato de mensagem
          - da T-045). Valida a lista da RN-017 e a AMB-044: objeto; `moe
          -da_base` = `"BRL"`; `taxas` objeto; cada chave de `taxas` data
          - válida; cada valor de data objeto; cada moeda com 3 letras; c
          -ada taxa número > 0, **inclusive** a de uma moeda repetida que
          - vai ser sobrescrita. Monta o índice `Map<Moeda, Cotacao[]>` c
          -om a moeda em maiúsculas (`normalizarMoeda`, criada aqui em `s
          -rc/nucleo/texto.ts`: `trim` + `toUpperCase`), datas em ordem c
          -rescente e, para a mesma moeda na mesma data, a **última** do 
          -arquivo. `fonte`, `observacao` e campos desconhecidos são igno
          -rados                                                         
      292 +- [x] **T-046** — Criar `src/io/cambio.ts` (R-12, R-14): `lerC
          +ambio(texto, rotulo = 'arquivo de câmbio (dados/cambio.json)')
          +` → `Cambio` ou lança `ErroEntrada` (mesmo formato de mensagem
          + da T-045). Valida a lista da RN-017 e a AMB-044: objeto; `moe
          +da_base` = `"BRL"`; `taxas` objeto; cada chave de `taxas` data
          + válida; cada valor de data objeto; cada moeda com 3 letras; c
          +ada taxa número > 0, **inclusive** a de uma moeda repetida que
          + vai ser sobrescrita. Monta o índice `Map<Moeda, Cotacao[]>` c
          +om a moeda em maiúsculas (`normalizarMoeda`, criada aqui em `s
          +rc/nucleo/texto.ts`: `trim` + `toUpperCase`), datas em ordem c
          +rescente e, para a mesma moeda na mesma data, a **última** do 
          +arquivo. `fonte`, `observacao` e campos desconhecidos são igno
          +rados                                                         
      293    - **Atende:** RN-015, RN-017, AMB-042, AMB-044
      294    - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `R
           N-015 › câmbio de exemplos/envelope/cambio.json é lido: USD e 
           EUR com 12 cotações cada, em ordem de data`, `RN-015 › câmbio:
            moeda_base diferente de BRL, ou taxas ausente ou que não é ob
           jeto → erro que cita o arquivo de câmbio`, `RN-015 › câmbio: c
           have de taxas que não é data válida (2026-07-32) ou valor de d
           ata que não é objeto → erro que cita o campo`, `RN-015 › câmbi
           o: moeda sem 3 letras ("EURO", "US") → erro`, `RN-015 › câmbio
           : taxa 0, negativa ou texto → erro, inclusive numa moeda repet
           ida que acaba sobrescrita`, `RN-015 › câmbio: fonte, observaca
           o e campos desconhecidos são ignorados` e `RN-015 › câmbio que
            não é JSON → erro que cita o arquivo de câmbio`; em `tests/nu
           cleo/rn-017-cambio.test.ts` passam `RN-017 › câmbio: "usd" no 
           arquivo é indexado como USD`, `RN-017 › câmbio: "USD": 5.42 e 
           depois "usd": 5.50 na mesma data → vale 5.50, sem erro` e `RN-
           017 › câmbio: datas fora de ordem no arquivo ficam em ordem cr
           escente no índice`
      295 -  - **Commit:** `<hash preenchido depois>`                    
      295 +  - **Commit:** `231f34a`                                     
      296  
      297  - [ ] **T-047** — Criar `dados/politica.json` e `dados/cambio.
           json` como cópias byte a byte de `exemplos/envelope/politica-v
           4.json` e `exemplos/envelope/cambio.json`, e `src/io/externos.
           ts` (R-11, DT-006): `CAMINHO_POLITICA` e `CAMINHO_CAMBIO` reso
           lvidos a partir de `import.meta.dirname` (`../../dados/`), e `
           lerExternos(caminhos = { politica: CAMINHO_POLITICA, cambio: C
           AMINHO_CAMBIO })` → `{ politica, cambio }`, lendo a tabela **a
           ntes** do câmbio (T-045, T-046). Arquivo ausente ou ilegível →
            `ErroEntrada` `"<rótulo> (<caminho relativo à raiz>): arquivo
            não encontrado"`
      298    - **Atende:** RN-015, AMB-028

● T-047 — dados/ and io/externos.ts

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; mkdir -p dados && cp
      exemplos/envelope/politica-v4.json dados/politica.json && cp
      exemplos/envelope/cambio.json d…)
  ⎿  Created dados\cambio.json (+19 -0)
       1 +{                                                              
       2 +  "moeda_base": "BRL",                                         
       3 +  "fonte": "Banco Central - PTAX de fechamento",               
       4 +  "observacao": "Cotacoes publicadas apenas em dias uteis banca
         +rios.",                                                        
       5 +  "taxas": {                                                   
       6 +    "2026-07-13": { "USD": 5.42, "EUR": 5.91 },                
       7 +    "2026-07-14": { "USD": 5.44, "EUR": 5.93 },                
       8 +    "2026-07-15": { "USD": 5.39, "EUR": 5.88 },                
       9 +    "2026-07-16": { "USD": 5.41, "EUR": 5.90 },                
      10 +    "2026-07-17": { "USD": 5.47, "EUR": 5.96 },                
      11 +    "2026-07-20": { "USD": 5.50, "EUR": 6.01 },                
      12 +    "2026-07-21": { "USD": 5.48, "EUR": 5.99 },                
      13 +    "2026-07-22": { "USD": 5.45, "EUR": 5.95 },                
      14 +    "2026-07-23": { "USD": 5.44, "EUR": 5.94 },                
      15 +    "2026-07-24": { "USD": 5.46, "EUR": 5.97 },                
      16 +    "2026-07-27": { "USD": 5.52, "EUR": 6.03 },                
      17 +    "2026-07-28": { "USD": 5.51, "EUR": 6.02 }                 
      18 +  }                                                            
      19 +}                                                              
  ⎿  Created dados\politica.json (+29 -0)
       1 +{                                                              
       2 +  "versao": "v4",                                              
       3 +  "vigencia": "2026-07-01",                                    
       4 +  "moeda_base": "BRL",                                         
       5 +  "padrao": {                                                  
       6 +    "alimentacao": { "limite": 60.00, "periodicidade": "dia" },
       7 +    "transporte_urbano": { "limite": 80.00, "periodicidade": "d
         +ia" },                                                         
       8 +    "hospedagem": { "limite": 250.00, "periodicidade": "diaria"
         + }                                                             
       9 +  },                                                           
      10 +  "centros_custo": {                                           
      11 +    "CC-ENG-PLATAFORMA": {                                     
      12 +      "alimentacao": { "limite": 75.00, "periodicidade": "dia" 
         +},                                                             
      13 +      "transporte_urbano": { "limite": 80.00, "periodicidade": 
         +"dia" },                                                       
      14 +      "hospedagem": { "limite": 0.00, "periodicidade": "diaria"
         +, "observacao": "nao reembolsavel" }                           
      15 +    },                                                         
      16 +    "CC-COMERCIAL": {                                          
      17 +      "alimentacao": { "limite": 90.00, "periodicidade": "dia" 
         +},                                                             
      18 +      "transporte_urbano": { "limite": 150.00, "periodicidade":
         + "dia" },                                                      
      19 +      "hospedagem": { "limite": 400.00, "periodicidade": "diari
         +a" },                                                          
      20 +      "representacao": { "limite": 300.00, "periodicidade": "di
         +a" }                                                           
      21 +    },                                                         
      22 +    "CC-ADM": {                                                
      23 +      "alimentacao": { "limite": 45.00, "periodicidade": "dia" 
         +},                                                             
      24 +      "transporte_urbano": { "limite": 60.00, "periodicidade": 
         +"dia" }                                                        
      25 +    }                                                          
      26 +  },                                                           
      27 +  "nota_fiscal_obrigatoria_acima_de": 100.00,                  
      28 +  "acrescimo_em_viagem_percentual": 50                         
      29 +}                                                              

● Write(src\io\externos.ts)
  ⎿  Wrote 42 lines to src\io\externos.ts
       1 // Local fixo da tabela de limites e do câmbio (AMB-028, R-11, D
         T-006).
       2
       4 import { join, relative } from 'node:path';
       5 import type { Cambio, Politica } from '../nucleo/tipos.ts';
       6 import { lerCambio } from './cambio.ts';
       7 import { ErroEntrada } from './entrada.ts';
       9
      10 /** Raiz do repositório, resolvida pelo código e não pela pasta
         de trabalho (R-11). */
     … +43 lines (ctrl+o to expand)

● Write(tests\io\externos.test.ts)
  ⎿  Wrote 24 lines to tests\io\externos.test.ts
       1 import { spawnSync } from 'node:child_process';
       2 import { existsSync } from 'node:fs';
       4 import { resolve } from 'node:path';
       5 import { describe, expect, it } from 'vitest';
       6 import { CAMINHO_CAMBIO, CAMINHO_POLITICA } from '../../src/io/e
       7
       8 describe('Infra › externos', () => {
       9   it('Infra › externos: caminhos apontam para <raiz>/dados/, ind
      10     expect(CAMINHO_POLITICA).toBe(resolve('dados', 'politica.jso
         n'));
     … +21 lines (ctrl+o to expand)

● Update(tests\io\rn-015-entrada.test.ts)
  ⎿  Added 42 lines
      299      }
      300    });
      301  });
      302 +                                                              
      303 +describe('RN-015 — Arquivo de entrada inválido (local fixo)', 
          +() => {                                                       
      304 +  const pasta = mkdtempSync(join(tmpdir(), 'reembolso-externos
          +-'));                                                         
      305 +  afterAll(() => rmSync(pasta, { recursive: true, force: true 
          +}));                                                          
      306 +                                                              
      307 +  /** Caminho na pasta temporária; com `conteudo`, o arquivo é
          + criado. */                                                   
      308 +  function arq(nome: string, conteudo?: string): string {     
      309 +    const caminho = join(pasta, nome);                        
      310 +    if (conteudo !== undefined) writeFileSync(caminho, conteud
          +o);                                                           
      311 +    return caminho;                                           
      312 +  }                                                           
      313 +                                                              
      314 +  /** Mensagem do `ErroEntrada` de `lerExternos(caminhos)`. */
      315 +  function erroExternos(caminhos: { politica: string; cambio: 
          +string }): string {                                           
      316 +    return erroDe(() => lerExternos(caminhos), '');           
      317 +  }                                                           
      318 +                                                              
      319 +  it('RN-015 › arquivo de câmbio ausente → erro que cita o arq
          +uivo de câmbio', () => {                                      
      320 +    const m = erroExternos({ politica: CAMINHO_POLITICA, cambi
          +o: arq('nao-existe-cambio.json') });                          
      321 +    expect(m).toMatch(/^arquivo de câmbio \(.*nao-existe-cambi
          +o\.json\): arquivo não encontrado$/);                         
      322 +  });                                                         
      323 +                                                              
      324 +  it('RN-015 › tabela de limites ausente → erro que cita a tab
          +ela de limites', () => {                                      
      325 +    const m = erroExternos({ politica: arq('nao-existe-politic
          +a.json'), cambio: CAMINHO_CAMBIO });                          
      326 +    expect(m).toMatch(/^tabela de limites \(.*nao-existe-polit
          +ica\.json\): arquivo não encontrado$/);                       
      327 +  });                                                         
      328 +                                                              
      329 +  it('RN-015 › tabela e câmbio inválidos → a mensagem é a da t
          +abela (ordem de leitura)', () => {                            
      330 +    const m = erroExternos({ politica: arq('politica-invalida.
          +json', '{"versao": '), cambio: arq('cambio-invalido.json', '[]
          +') });                                                        
      331 +    expect(m).toMatch(/^tabela de limites \(.*politica-invalid
          +a\.json\): /);                                                
      332 +    expect(erroExternos({ politica: CAMINHO_POLITICA, cambio: 
          +arq('cambio-invalido.json') })).toMatch(/^arquivo de câmbio /)
          +;                                                             
      333 +  });                                                         
      334 +                                                              
      335 +  it('RN-015 › local fixo: dados/ é lido com o caminho relativ
          +o à raiz na mensagem', () => {                                
      336 +    const { politica, cambio } = lerExternos();               
      337 +    expect(politica.versao).toBe('v4');                       
      338 +    expect(cambio.has('EUR')).toBe(true);                     
      339 +    expect(erroExternos({ politica: CAMINHO_POLITICA.replace('
          +politica.json', 'nada.json'), cambio: CAMINHO_CAMBIO })).toBe(
      340 +      'tabela de limites (dados/nada.json): arquivo não encont
          +rado',                                                        
      341 +    );                                                        
      342 +  });                                                         
      343 +});                                                           

● Update(tests\io\rn-015-entrada.test.ts)
  ⎿  Added 5 lines, removed 2 lines
       1 -import { readFileSync } from 'node:fs';                        
       2 -import { describe, expect, it } from 'vitest';                 
       1 +import { mkdtempSync, readFileSync, rmSync, writeFileSync } fro
         +m 'node:fs';                                                   
       2 +import { tmpdir } from 'node:os';                              
       3 +import { join } from 'node:path';                              
       4 +import { afterAll, describe, expect, it } from 'vitest';       
       5  import { ErroEntrada, lerEntrada } from '../../src/io/entrada.t
          s';
       6  import { lerCambio } from '../../src/io/cambio.ts';
       7 +import { CAMINHO_CAMBIO, CAMINHO_POLITICA, lerExternos } from '
         +../../src/io/externos.ts';                                     
       8  import { lerPolitica } from '../../src/io/politica.ts';
       9  import { NumeroJson } from '../../src/nucleo/tipos.ts';
      10  

  Ran 1 shell command (ctrl+o to expand)

● Bash(bash "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Ap
      ps-sdd-desafio/19301ba9-012b-420b-aeb4-4892b4a12f23/scratchpad/fechar.sh"
      T-047 "feat(T…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      294    - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `R
           N-015 › câmbio de exemplos/envelope/cambio.json é lido: USD e 
           EUR com 12 cotações cada, em ordem de data`, `RN-015 › câmbio:
            moeda_base diferente de BRL, ou taxas ausente ou que não é ob
           jeto → erro que cita o arquivo de câmbio`, `RN-015 › câmbio: c
           have de taxas que não é data válida (2026-07-32) ou valor de d
           ata que não é objeto → erro que cita o campo`, `RN-015 › câmbi
           o: moeda sem 3 letras ("EURO", "US") → erro`, `RN-015 › câmbio
           : taxa 0, negativa ou texto → erro, inclusive numa moeda repet
           ida que acaba sobrescrita`, `RN-015 › câmbio: fonte, observaca
           o e campos desconhecidos são ignorados` e `RN-015 › câmbio que
            não é JSON → erro que cita o arquivo de câmbio`; em `tests/nu
           cleo/rn-017-cambio.test.ts` passam `RN-017 › câmbio: "usd" no 
           arquivo é indexado como USD`, `RN-017 › câmbio: "USD": 5.42 e 
           depois "usd": 5.50 na mesma data → vale 5.50, sem erro` e `RN-
           017 › câmbio: datas fora de ordem no arquivo ficam em ordem cr
           escente no índice`
      295    - **Commit:** `231f34a`
      296  
      297 -- [ ] **T-047** — Criar `dados/politica.json` e `dados/cambio.
          -json` como cópias byte a byte de `exemplos/envelope/politica-v
          -4.json` e `exemplos/envelope/cambio.json`, e `src/io/externos.
          -ts` (R-11, DT-006): `CAMINHO_POLITICA` e `CAMINHO_CAMBIO` reso
          -lvidos a partir de `import.meta.dirname` (`../../dados/`), e `
          -lerExternos(caminhos = { politica: CAMINHO_POLITICA, cambio: C
          -AMINHO_CAMBIO })` → `{ politica, cambio }`, lendo a tabela **a
          -ntes** do câmbio (T-045, T-046). Arquivo ausente ou ilegível →
          - `ErroEntrada` `"<rótulo> (<caminho relativo à raiz>): arquivo
          - não encontrado"`                                             
      297 +- [x] **T-047** — Criar `dados/politica.json` e `dados/cambio.
          +json` como cópias byte a byte de `exemplos/envelope/politica-v
          +4.json` e `exemplos/envelope/cambio.json`, e `src/io/externos.
          +ts` (R-11, DT-006): `CAMINHO_POLITICA` e `CAMINHO_CAMBIO` reso
          +lvidos a partir de `import.meta.dirname` (`../../dados/`), e `
          +lerExternos(caminhos = { politica: CAMINHO_POLITICA, cambio: C
          +AMINHO_CAMBIO })` → `{ politica, cambio }`, lendo a tabela **a
          +ntes** do câmbio (T-045, T-046). Arquivo ausente ou ilegível →
          + `ErroEntrada` `"<rótulo> (<caminho relativo à raiz>): arquivo
          + não encontrado"`                                             
      298    - **Atende:** RN-015, AMB-028
      299    - **Aceite:** em `tests/io/externos.test.ts` passa `Infra › 
           externos: caminhos apontam para <raiz>/dados/, independente de
            process.cwd()`; em `tests/io/rn-015-entrada.test.ts` passam `
           RN-015 › arquivo de câmbio ausente → erro que cita o arquivo d
           e câmbio`, `RN-015 › tabela de limites ausente → erro que cita
            a tabela de limites` e `RN-015 › tabela e câmbio inválidos → 
           a mensagem é a da tabela (ordem de leitura)`; `git diff --no-i
           ndex exemplos/envelope/politica-v4.json dados/politica.json` e
            o mesmo para o câmbio não mostram diferença
      300 -  - **Commit:** `<hash preenchido depois>`                    
      300 +  - **Commit:** `5c6414a`                                     
      301  
      302  - [ ] **T-048** — Ler `colaborador.centro_custo` em `src/io/en
           trada.ts` (estende T-025): `Entrada` ganha `centroCusto: strin
           g | null`; ausente, nulo, texto vazio ou só espaços → `null`; 
           texto → como veio (a normalização é da T-049); qualquer outro 
           tipo → `ErroEntrada` que cita `colaborador.centro_custo`. `tes
           ts/apoio.ts` passa a preencher `centroCusto` (padrão `null`). 
           O motor ainda não lê o campo
      303    - **Atende:** RN-015, AMB-032

● T-048 — colaborador.centro_custo

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; python - <<'PY'
      2>/dev/null || node -e "
      const fs=require('fs');…)  ⎿  Updated src\io\entrada.ts (+8 -1)
      35    const idColaborador = ehObjeto(colaborador) ? colaborador.id 
          : undefined;
      36    if (!textoPreenchido(idColaborador)) throw new ErroEntrada('c
          olaborador.id ausente, vazio ou não é texto');
      37  
      38 +  const bruto = ehObjeto(colaborador) ? colaborador.centro_cust
         +o : undefined;                                                 
      39 +  // AMB-032: vazio vale padrão; tipo errado aborta.           
      40 +  if (bruto !== undefined && bruto !== null && typeof bruto !==
         + 'string') {                                                   
      41 +    throw new ErroEntrada('colaborador.centro_custo não é texto
         +');                                                            
      42 +  }                                                            
      43 +  const centroCusto = typeof bruto === 'string' && bruto.trim()
         + !== '' ? bruto : null;                                        
      44 +                                                               
      45    const periodo = json.periodo;
      46    if (!ehObjeto(periodo)) throw new ErroEntrada('periodo ausent
          e ou não é um objeto (periodo.inicio e periodo.fim)');
      47    const inicio = data(periodo, 'inicio');
     ...
      51    const despesas = json.despesas;
      52    if (!Array.isArray(despesas)) throw new ErroEntrada('despesas
           ausente ou não é uma lista');
      53  
      47 -  return { colaborador, periodo, inicio, fim, despesas };      
      54 +  return { colaborador, centroCusto, periodo, inicio, fim, desp
         +esas };                                                        
      55  }
      56  
      57  /** Texto do arquivo → `Entrada`; JSON inválido também é `ErroE
          ntrada`. */
  ⎿  Updated src\nucleo\tipos.ts (+2 -0)
      27  export interface Entrada {
      28    /** Eco integral. */
      29    readonly colaborador: unknown;
      30 +  /**  como veio; ausente, nulo ou vazio →  (RN-015, AMB-032). 
         +*/                                                             
      31 +  readonly centroCusto: string | null;                         
      32    /** Eco integral. */
      33    readonly periodo: unknown;
      34    readonly inicio: DataISO;
  ⎿  Updated tests\apoio.ts (+1 -0)
      59  ): Entrada {
      60    return {
      61      colaborador: { id: 'c-0001' },
      62 +    centroCusto: null,                                         
      63      periodo,
      64      inicio: periodo.inicio,
      65      fim: periodo.fim,

● That shell edit was garbled — checking what actually changed.

  Ran 1 shell command (ctrl+o to expand)

● Mostly right; fixing the mangled doc comment.

● Update(src\nucleo\tipos.ts)
  ⎿  Added 1 line, removed 1 line
      27  export interface Entrada {
      28    /** Eco integral. */
      29    readonly colaborador: unknown;
      30 -  /**  como veio; ausente, nulo ou vazio →  (RN-015, AMB-032). 
         -*/                                                             
      30 +  /** `colaborador.centro_custo` como veio; ausente, nulo ou va
         +zio → `null` (RN-015, AMB-032). */                             
      31    readonly centroCusto: string | null;
      32    /** Eco integral. */
      33    readonly periodo: unknown;

● Update(tests\io\rn-015-entrada.test.ts)
  ⎿  Added 16 lines
       94      expect(erro(JSON.stringify({ ...VALIDO, periodo: null })))
           .toContain('periodo');
       95    });
       96  
       97 +  it('RN-015 › "centro_custo": 42, true, [] ou {} → erro que c
          +ita colaborador.centro_custo', () => {                        
       98 +    for (const centro_custo of [42, true, [], {}, ['CC-ADM'], 
          +0]) {                                                         
       99 +      expect(erro(arquivo({ colaborador: { centro_custo } })),
          + JSON.stringify(centro_custo)).toContain('colaborador.centro_c
          +usto');                                                       
      100 +    }                                                         
      101 +  });                                                         
      102 +                                                              
      103 +  it('RN-015 › centro_custo ausente, null, "" ou "  " é aceito
          + (centroCusto nulo)', () => {                                 
      104 +    for (const centro_custo of [undefined, null, '', '  ']) { 
      105 +      expect(lerEntrada(arquivo({ colaborador: { centro_custo 
          +} })).centroCusto, JSON.stringify(centro_custo)).toBeNull();  
      106 +    }                                                         
      107 +    expect(lerEntrada(arquivo({ colaborador: { centro_custo: '
          + cc-comercial ' } })).centroCusto).toBe(' cc-comercial ');    
      108 +    expect(lerEntrada(arquivo({ colaborador: { centro_custo: '
          +CC-SUPORTE-N2' } })).colaborador).toMatchObject({             
      109 +      centro_custo: 'CC-SUPORTE-N2',                          
      110 +    });                                                       
      111 +  });                                                         
      112 +                                                              
      113    it('RN-015 › JSON que não é objeto ([], 42, "x") → erro', ()
            => {
      114      for (const texto of ['[]', '42', '"x"', 'null', 'true']) {
      115        expect(erro(texto), texto).toContain('objeto');

  Ran 1 shell command (ctrl+o to expand)

● Bash(bash "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Ap
      ps-sdd-desafio/19301ba9-012b-420b-aeb4-4892b4a12f23/scratchpad/fechar.sh"
      T-048 "feat(T…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      299    - **Aceite:** em `tests/io/externos.test.ts` passa `Infra › 
           externos: caminhos apontam para <raiz>/dados/, independente de
            process.cwd()`; em `tests/io/rn-015-entrada.test.ts` passam `
           RN-015 › arquivo de câmbio ausente → erro que cita o arquivo d
           e câmbio`, `RN-015 › tabela de limites ausente → erro que cita
            a tabela de limites` e `RN-015 › tabela e câmbio inválidos → 
           a mensagem é a da tabela (ordem de leitura)`; `git diff --no-i
           ndex exemplos/envelope/politica-v4.json dados/politica.json` e
            o mesmo para o câmbio não mostram diferença
      300    - **Commit:** `5c6414a`
      301  
      302 -- [ ] **T-048** — Ler `colaborador.centro_custo` em `src/io/en
          -trada.ts` (estende T-025): `Entrada` ganha `centroCusto: strin
          -g | null`; ausente, nulo, texto vazio ou só espaços → `null`; 
          -texto → como veio (a normalização é da T-049); qualquer outro 
          -tipo → `ErroEntrada` que cita `colaborador.centro_custo`. `tes
          -ts/apoio.ts` passa a preencher `centroCusto` (padrão `null`). 
          -O motor ainda não lê o campo                                  
      302 +- [x] **T-048** — Ler `colaborador.centro_custo` em `src/io/en
          +trada.ts` (estende T-025): `Entrada` ganha `centroCusto: strin
          +g | null`; ausente, nulo, texto vazio ou só espaços → `null`; 
          +texto → como veio (a normalização é da T-049); qualquer outro 
          +tipo → `ErroEntrada` que cita `colaborador.centro_custo`. `tes
          +ts/apoio.ts` passa a preencher `centroCusto` (padrão `null`). 
          +O motor ainda não lê o campo                                  
      303    - **Atende:** RN-015, AMB-032
      304    - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `R
           N-015 › "centro_custo": 42, true, [] ou {} → erro que cita col
           aborador.centro_custo` e `RN-015 › centro_custo ausente, null,
            "" ou "  " é aceito (centroCusto nulo)`
      305 -  - **Commit:** `<hash preenchido depois>`                    
      305 +  - **Commit:** `cd11568`                                     
      306  
      307  ### 5.2 Regras de negócio da v4
      308  

● T-049 — tabelaAplicavel and LIMIAR_APROVACAO

● Update(src\nucleo\politica.ts)
  ⎿  Added 28 lines
       1  // Única fonte dos valores da política (plan §4). Mudar um valo
          r exige mudar a
       2  // spec antes.
       3  
       4 +import { normalizar } from './texto.ts';                       
       5 +import type { Politica, RegraCategoria, TabelaAplicavel } from 
         +'./tipos.ts';                                                  
       6 +                                                               
       7 +export const LIMIAR_APROVACAO = 500_00n; // RN-018, AMB-040 (es
         +tritamente maior)                                              
       8 +                                                               
       9 +/**                                                            
      10 + * Tabela aplicável ao colaborador (RN-016): sem centro de cust
         +o ou sem entrada                                               
      11 + * na tabela → `padrao` inteiro; com entrada → o centro de cust
         +o por cima do                                                  
      12 + * padrão, inclusive o limite 0, que não herda (AMB-029 a AMB-0
         +32).                                                           
      13 + */                                                            
      14 +export function tabelaAplicavel(politica: Politica, centroCusto
         +: string | null): TabelaAplicavel {                            
      15 +  const categorias = new Map<string, RegraCategoria & { origem:
         + 'centro_custo' | 'padrao' }>();                               
      16 +  for (const [categoria, regra] of politica.padrao) categorias.
         +set(categoria, { ...regra, origem: 'padrao' });                
      17 +                                                               
      18 +  const entrada = centroCusto === null ? undefined : politica.c
         +entrosCusto.get(normalizar(centroCusto));                      
      19 +  if (entrada) {                                               
      20 +    for (const [categoria, regra] of entrada.categorias) catego
         +rias.set(categoria, { ...regra, origem: 'centro_custo' });     
      21 +  }                                                            
      22 +  return {                                                     
      23 +    nome: entrada?.nome ?? 'padrao',                           
      24 +    versao: politica.versao,                                   
      25 +    centroCusto: entrada?.nome ?? null,                        
      26 +    categorias,                                                
      27 +    limiarNotaFiscal: politica.limiarNotaFiscal,               
      28 +    acrescimoViagemPercentual: politica.acrescimoViagemPercentu
         +al,                                                            
      29 +  };                                                           
      30 +}                                                              
      31 +                                                               
      32  export const POLITICA = {
      33    limites: {
      34      alimentacao:       { diario: 60_00n,  ampliaEmViagem: true 
           }, // RN-009

● Update(tests\apoio.ts)
  ⎿  Added 2 lines
      1  // Apoio aos testes: monta despesas brutas como sairiam do leito
         r de JSON.
      2  
      3 +import { readFileSync } from 'node:fs';                         
      4  import { expect } from 'vitest';
      5  import { lerJson } from '../src/io/json.ts';
      6 +import { lerPolitica } from '../src/io/politica.ts';            
      7  import { validarDespesa } from '../src/nucleo/despesa.ts';
      8  import { gerarParcelas } from '../src/nucleo/diarias.ts';
      9  import { alocar } from '../src/nucleo/limites.ts';

● Update(tests\apoio.ts)
  ⎿  Added 6 lines
      13  import { POLITICA } from '../src/nucleo/politica.ts';
      14  import type { DespesaElegivel, DespesaValida, Entrada, Resultad
          oItem } from '../src/nucleo/tipos.ts';
      15  
      16 +/** Texto da tabela de limites da fixture da v4 (R-10: nunca `d
         +ados/`). */                                                    
      17 +export const TEXTO_POLITICA_V4 = readFileSync('exemplos/envelop
         +e/politica-v4.json', 'utf8');                                  
      18 +                                                               
      19 +/** Tabela de limites da fixture da v4. */                     
      20 +export const POLITICA_V4 = lerPolitica(TEXTO_POLITICA_V4);     
      21 +                                                               
      22  export const DESPESA_PADRAO = {
      23    id: 'd-001',
      24    data: '2026-07-03',

● Write(tests\nucleo\rn-016-politica-centro-custo.test.ts)
  ⎿  Wrote 65 lines to tests\nucleo\rn-016-politica-centro-custo.test.ts
      1 import { describe, expect, it } from 'vitest';
      2 import { tabelaAplicavel } from '../../src/nucleo/politica.ts';
      3 import { POLITICA_V4 } from '../apoio.ts';
      4
      5 /** `categoria → [limite, origem]` da tabela aplicável. */
        int, string]> {
      7   const t = tabelaAplicavel(POLITICA_V4, centroCusto);
      8   return Object.fromEntries([...t.categorias].map(([c, r]) => [c,
         [r.limite, r.origem]]));
      9 }
     … +74 lines (ctrl+o to expand)

  Ran 1 shell command (ctrl+o to expand)

● Bash(bash "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Ap
      ps-sdd-desafio/19301ba9-012b-420b-aeb4-4892b4a12f23/scratchpad/fechar.sh"
      T-049 "feat(T…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      306  
      307  ### 5.2 Regras de negócio da v4
      308  
      309 -- [ ] **T-049** — Em `src/nucleo/politica.ts`, acrescentar `LI
          -MIAR_APROVACAO = 500_00n` (com `// RN-018, AMB-040`) e `tabela
          -Aplicavel(politica, centroCusto)` → `TabelaAplicavel` (RN-016)
          -: `centroCusto` nulo ou sem entrada em `centros_custo` (compar
          -ado com `normalizar`) → `padrao` inteiro, `nome` `"padrao"`; c
          -om entrada → cada categoria do centro de custo por cima do pad
          -rão, categoria que falta herda do padrão (`origem: 'padrao'`),
          - limite 0 **não** herda; `nome` = centro de custo como está es
          -crito na tabela; limiar de NF e acréscimo únicos. `POLITICA` c
          -ontinua existindo até a T-050                                 
      309 +- [x] **T-049** — Em `src/nucleo/politica.ts`, acrescentar `LI
          +MIAR_APROVACAO = 500_00n` (com `// RN-018, AMB-040`) e `tabela
          +Aplicavel(politica, centroCusto)` → `TabelaAplicavel` (RN-016)
          +: `centroCusto` nulo ou sem entrada em `centros_custo` (compar
          +ado com `normalizar`) → `padrao` inteiro, `nome` `"padrao"`; c
          +om entrada → cada categoria do centro de custo por cima do pad
          +rão, categoria que falta herda do padrão (`origem: 'padrao'`),
          + limite 0 **não** herda; `nome` = centro de custo como está es
          +crito na tabela; limiar de NF e acréscimo únicos. `POLITICA` c
          +ontinua existindo até a T-050                                 
      310    - **Atende:** RN-016, AMB-029, AMB-030, AMB-031, AMB-032
      311    - **Aceite:** em `tests/nucleo/rn-016-politica-centro-custo.
           test.ts` passam `RN-016 › CC-SUPORTE-N2 (sem entrada) → tabela
            "padrao", alimentação 60,00`, `RN-016 › " cc-comercial " → ta
           bela "CC-COMERCIAL"`, `RN-016 › sem centro de custo → tabela "
           padrao"`, `RN-016 › CC-ADM sem hospedagem → hospedagem 250,00 
           herdada do padrão`, `RN-016 › CC-ENG-PLATAFORMA: hospedagem co
           m limite 0 não herda do padrão`, `RN-016 › representacao só ex
           iste na tabela do CC-COMERCIAL` e `RN-016 › limiar de nota fis
           cal e acréscimo de viagem são os da tabela, iguais para todo c
           entro de custo`
      312 -  - **Commit:** `<hash preenchido depois>`                    
      312 +  - **Commit:** `3b70310`                                     
      313  
      314  - [ ] **T-050** — Refatorar o núcleo para receber a `TabelaApl
           icavel` no lugar de `POLITICA`, **sem mudar comportamento** na
            tabela padrão (plan §2, §8 "resistiu"; R-15): `Categoria` vir
           a texto normalizado; categoria reconhecida (RN-002, RN-006) = 
           chave da tabela aplicável; `elegibilidade.ts` compara o limiar
            de NF da tabela com `Decimal`, sem arredondar (RN-008); `limi
           tes.ts` inicia o saldo com o limite da tabela e, em dia de via
           gem e periodicidade `dia`, usa `dividirMeioParaPar(limite × (1
           00 + p), 100)` (RN-011, AMB-033; sai o `throw` de limite inexa
           to); `viagem.ts` e `diarias.ts` disparam por `periodicidade ==
           = 'diaria'`; `motivos.ts` usa um mapa de nomes só de apresenta
           ção com volta para a própria chave. `motor.calcular(entrada, t
           abela)`; `src/cli.ts` lê `dados/politica.json` por `lerExterno
           s` (T-047) e passa `tabelaAplicavel(politica, null)` (o centro
            de custo entra na T-051); `tests/apoio.ts` monta a tabela da 
           fixture da v4 com um centro de custo opcional. Remover `POLITI
           CA` e trocar o teste de `tests/nucleo/politica.test.ts`
      315    - **Atende:** RN-002, RN-006, RN-008, RN-009, RN-011, RN-012
           , AMB-020, AMB-033

● T-050 — refactor the core onto TabelaAplicavel (no behavior change)

  Let me map every consumer of POLITICA, Categoria, and the motor entry points.

  Searched for 2 patterns (ctrl+o to expand)

● No test passes a custom period, so the helpers' second parameter can become an
  options object. Now the refactor — tipos.ts first.

  Read 1 file (ctrl+o to expand)

● Update(src\nucleo\tipos.ts)
  ⎿  Added 2 lines, removed 4 lines
       1  // Tipos do núcleo (data-model.md). Nenhuma regra nasce aqui.
       2  
       3 -import type { POLITICA } from './politica.ts';                 
       4 -                                                               
       3  /** Dinheiro em centavos inteiros (R-02). */
       4  export type Centavos = bigint;
       5  
       6  /** Texto `AAAA-MM-DD` já validado (R-05). */
       7  export type DataISO = string;
       8  
      11 -/** Categorias reconhecidas: as chaves de `POLITICA.limites` (R
         -N-006, plan §4). */                                            
      12 -export type Categoria = keyof typeof POLITICA.limites;         
       9 +/** Categoria normalizada (RN-002); reconhecida quando é chave 
         +da tabela aplicável (R-15). */                                 
      10 +export type Categoria = string;                                
      11  
      12  /**
      13   * Número como apareceu no arquivo, ex.: `{ texto: "33.333" }` 
          (R-03).

● Update(src\nucleo\tipos.ts)
  ⎿  Added 3 lines, removed 3 lines
      56    readonly temNotaFiscal: boolean;
      57  }
      58  
      59 -/** Despesa que passou das etapas 3 a 7. */                    
      60 -export interface DespesaElegivel extends Omit<DespesaValida, 'c
         -ategoria'> {                                                   
      61 -  readonly categoria: Categoria;                               
      59 +/** Despesa que passou das etapas 3 a 7, com a regra da sua cat
         +egoria na tabela aplicável. */                                 
      60 +export interface DespesaElegivel extends DespesaValida {       
      61 +  readonly regra: RegraCategoria;                              
      62  }
      63  
      64  /** Códigos de motivo da seção 4 da spec. */

● Update(src\nucleo\tipos.ts)
  ⎿  Added 1 line, removed 1 line
      92      }
      93    | { readonly codigo: 'CATEGORIA_NAO_REEMBOLSAVEL'; readonly d
          etalhes: { readonly categoria: string } }
      94    | { readonly codigo: 'DUPLICATA'; readonly detalhes: { readon
          ly idAceito: string } }
      95 -  | { readonly codigo: 'NOTA_FISCAL_AUSENTE'; readonly detalhes
         -: { readonly valor: Centavos; readonly limiar: Centavos } };   
      95 +  | { readonly codigo: 'NOTA_FISCAL_AUSENTE'; readonly detalhes
         +: { readonly valor: Centavos; readonly limiar: Decimal } };    
      96  
      97  /** Recusa da RN-003: leva os ecos brutos e o valor, se numéric
          o (AMB-023). */
      98  export type RecusaDadoInvalido = Extract<Recusa, { codigo: 'DAD
          O_INVALIDO' }> & {

● Update(src\nucleo\tipos.ts)
  ⎿  Added 1 line
      106    readonly codigo: CodigoLimite;
      107    readonly detalhes: {
      108      readonly categoria: Categoria;
      109 +    readonly periodicidade: Periodicidade;                    
      110      readonly data: DataISO;
      111      readonly diarias: number;
      112      readonly limite: Centavos;

● Now dinheiro.ts (format a Decimal limiar for descriptions), elegibilidade.ts,
  limites.ts, viagem.ts, diarias.ts.

● Update(src\nucleo\dinheiro.ts)
  ⎿  Added 9 lines
      25    return `${sinal}R$ ${milhar},${centavos}`;
      26  }
      27  
      28 +/** Valor exato da tabela em reais: `100.00` → `"R$ 100,00"`; m
         +ais de 2 casas aparecem todas. */                              
      29 +export function formatarReaisDecimal(d: Decimal): string {     
      30 +  if (d.escala <= 2) return formatarReais(d.digitos * 10n ** Bi
         +gInt(2 - d.escala));                                           
      31 +  const { sinal, inteiros } = partes(d.digitos / 10n ** BigInt(
         +d.escala - 2));                                                
      32 +  const abs = d.digitos < 0n ? -d.digitos : d.digitos;         
      33 +  const fracao = (abs % 10n ** BigInt(d.escala)).toString().pad
         +Start(d.escala, '0');                                          
      34 +  return `${sinal}R$ ${inteiros.replace(/\B(?=(\d{3})+(?!\d))/g
         +, '.')},${fracao}`;                                            
      35 +}                                                              
      36 +                                                               
      37  /**
      38   * Texto de número (sinal, dígitos, ponto decimal, expoente) → 
          centavos,
      39   * arredondando meio para o par sobre os dígitos, sem float (RN
          -001, DT-001).

● Update(src\nucleo\dinheiro.ts)
  ⎿  Added 1 line, removed 1 line
      1  // Dinheiro em centavos `bigint` (R-02).
      2  
      3  import { decimalDe, dividirMeioParaPar } from './decimal.ts';
      4 -import type { Centavos } from './tipos.ts';                     
      4 +import type { Centavos, Decimal } from './tipos.ts';            
      5  
      6  function partes(c: Centavos): { sinal: string; inteiros: string;
          centavos: string } {
      7    const abs = c < 0n ? -c : c;
● Write(src\nucleo\elegibilidade.ts)
  ⎿  Added 15 lines, removed 11 lines
      1  // Etapas 3 a 7 da seção 8. Cada função devolve a recusa da etap
         a ou `null`;
      2  // a ordem das etapas vive só no `motor.ts` (DT-002).
      3  
      4 -import { POLITICA } from './politica.ts';                       
      5 -import type { Categoria, DataISO, DespesaValida, Recusa } from '
        -./tipos.ts';                                                    
      4 +import type { Centavos, DataISO, Decimal, DespesaValida, Recusa,
        + TabelaAplicavel } from './tipos.ts';                           
      5  
      6  /** Etapa 3 (RN-004, AMB-012). */
      7  export function verificarValorPositivo(d: DespesaValida): Recusa
          | null {
     ...
      17      : null;
      18  }
      19  
      21 -/** Categoria reconhecida: chave de `POLITICA.limites` (RN-006)
         -. */                                                           
      22 -export function ehCategoria(categoria: string): categoria is Ca
         -tegoria {                                                      
      23 -  return Object.hasOwn(POLITICA.limites, categoria);           
      20 +/** Categoria reconhecida: chave da tabela aplicável (RN-002, R
         +N-006, R-15). */                                               
      21 +export function ehCategoria(categoria: string, tabela: TabelaAp
         +licavel): boolean {                                            
      22 +  return tabela.categorias.has(categoria);                     
      23  }
      24  
      25  /** Etapa 5 (RN-006, AMB-019): sem reclassificar. */
      27 -export function verificarCategoria(d: DespesaValida): Recusa | 
         -null {                                                         
      28 -  return ehCategoria(d.categoria)                              
      26 +export function verificarCategoria(d: DespesaValida, tabela: Ta
         +belaAplicavel): Recusa | null {                                
      27 +  return ehCategoria(d.categoria, tabela)                      
      28      ? null
      29      : { codigo: 'CATEGORIA_NAO_REEMBOLSAVEL', detalhes: { categ
          oria: d.categoriaOriginal } };
      30  }
     ...
      45    return null;
      46  }
      47  
      49 -/** Etapa 7 (RN-008, AMB-004, AMB-005, AMB-006): estritamente a
         -cima do limiar, sem nota. */                                   
      50 -export function verificarNotaFiscal(d: DespesaValida): Recusa |
         - null {                                                        
      51 -  return d.valorSolicitado > POLITICA.limiarNotaFiscal && !d.te
         -mNotaFiscal                                                    
      52 -    ? { codigo: 'NOTA_FISCAL_AUSENTE', detalhes: { valor: d.val
         -orSolicitado, limiar: POLITICA.limiarNotaFiscal } }            
      48 +/** `valor` (centavos) > `limiar` (reais), exato, sem arredonda
         +r (R-13). */                                                   
      49 +function acimaDe(valor: Centavos, limiar: Decimal): boolean {  
      50 +  return valor * 10n ** BigInt(limiar.escala) > limiar.digitos 
         +* 100n;                                                        
      51 +}                                                              
      52 +                                                               
      53 +/** Etapa 7 (RN-008, AMB-004, AMB-005, AMB-006): estritamente a
         +cima do limiar da tabela, sem nota. */                         
      54 +export function verificarNotaFiscal(d: DespesaValida, tabela: T
         +abelaAplicavel): Recusa | null {                               
      55 +  return acimaDe(d.valorSolicitado, tabela.limiarNotaFiscal) &&
         + !d.temNotaFiscal                                              
      56 +    ? { codigo: 'NOTA_FISCAL_AUSENTE', detalhes: { valor: d.val
         +orSolicitado, limiar: tabela.limiarNotaFiscal } }              
      57      : null;
      58  }

● Write(src\nucleo\limites.ts)
  ⎿  Added 24 lines, removed 14 lines
      1  // Etapa 9 da seção 8: limite diário por (data, categoria) (RN-0
         09, RN-010).
      2  
      3 -import { POLITICA } from './politica.ts';                       
      4 -import type { Categoria, Centavos, CodigoLimite, DataISO, Parcel
        -a } from './tipos.ts';                                          
      3 +import { dividirMeioParaPar } from './decimal.ts';              
      4 +import type { Categoria, Centavos, CodigoLimite, DataISO, Parcel
        +a, TabelaAplicavel } from './tipos.ts';                         
      5  
      6  /** Resultado do limite para uma despesa (soma das suas parcelas
         ). */
      7  export interface Alocacao {
     ...
      17    readonly codigo: CodigoLimite;
      18  }
      19  
      20 -/** Limite de (data, categoria): ampliado só em dia de viagem e
         - se a categoria amplia (RN-009, RN-011, AMB-020). */           
      21 -export function limiteDiario(categoria: Categoria, data: DataIS
         -O, diasDeViagem: ReadonlySet<DataISO>): Centavos {             
      22 -  const { diario, ampliaEmViagem } = POLITICA.limites[categoria
         -];                                                             
      23 -  if (!ampliaEmViagem || !diasDeViagem.has(data)) return diario
         -;                                                              
      24 -  const { num, den } = POLITICA.fatorViagem;                   
      25 -  if ((diario * num) % den !== 0n) {                           
      26 -    // A spec não define arredondamento de limite ampliado (pla
         -n §7).                                                         
      27 -    throw new Error(`limite ampliado de ${categoria} não é exat
         -o em centavos`);                                               
      28 -  }                                                            
      29 -  return (diario * num) / den;                                 
      20 +/**                                                            
      21 + * Limite de (data, categoria) na tabela aplicável: em dia de v
         +iagem, a                                                       
      22 + * periodicidade `dia` é ampliada pelo percentual da tabela, me
         +io para o par                                                  
      23 + * (RN-009, RN-011, AMB-020, AMB-033).                         
      24 + */                                                            
      25 +export function limiteDiario(                                  
      26 +  categoria: Categoria,                                        
      27 +  data: DataISO,                                               
      28 +  diasDeViagem: ReadonlySet<DataISO>,                          
      29 +  tabela: TabelaAplicavel,                                     
      30 +): Centavos {                                                  
      31 +  const { limite, periodicidade } = tabela.categorias.get(categ
         +oria)!;                                                        
      32 +  if (periodicidade !== 'dia' || !diasDeViagem.has(data)) retur
         +n limite;                                                      
      33 +  const { digitos, escala } = tabela.acrescimoViagemPercentual;
      34 +  const cem = 100n * 10n ** BigInt(escala);                    
      35 +  return dividirMeioParaPar(limite * (cem + digitos), cem);    
      36  }
      37  
      38  /**
      39   * Cada parcela, na ordem recebida (a da entrada), leva `min(va
          lor, saldo)` do
      40   * saldo de (data, categoria). Devolve uma alocação por despesa
          , na ordem.
      41   */
      36 -export function alocar(parcelas: readonly Parcela[], diasDeViag
         -em: ReadonlySet<DataISO>): Alocacao[] {                        
      42 +export function alocar(                                        
      43 +  parcelas: readonly Parcela[],                                
      44 +  diasDeViagem: ReadonlySet<DataISO>,                          
      45 +  tabela: TabelaAplicavel,                                     
      46 +): Alocacao[] {                                                
      47    const saldos = new Map<string, Centavos>();
      48    const porDespesa = new Map<number, Omit<Alocacao, 'codigo'>>(
          );
      49  
      50    for (const p of parcelas) {
      41 -    const limite = limiteDiario(p.categoria, p.data, diasDeViag
         -em);                                                           
      51 +    const limite = limiteDiario(p.categoria, p.data, diasDeViag
         +em, tabela);                                                   
      52      const chave = `${p.data}|${p.categoria}`;
      53      const saldo = saldos.get(chave) ?? limite;
      54      const recebe = p.valor < saldo ? p.valor : saldo;

● Update(src\nucleo\viagem.ts)
  ⎿  Added 2 lines, removed 2 lines
       4  import { diariasDe } from './diarias.ts';
       5  import type { DataISO, DespesaElegivel } from './tipos.ts';
       6  
       7 -/** Todas as noites D…D+N−1 das hospedagens elegíveis; o check-
         -out (D+N) não entra. */                                        
       7 +/** Todas as noites D…D+N−1 das despesas elegíveis de periodici
         +dade `diaria`; o check-out (D+N) não entra. */                 
       8  export function diasDeViagem(elegiveis: readonly DespesaElegive
          l[]): Set<DataISO> {
       9    const dias = new Set<DataISO>();
      10    for (const d of elegiveis) {
      11 -    if (d.categoria !== 'hospedagem') continue;                
      11 +    if (d.regra.periodicidade !== 'diaria') continue;          
      12      for (let k = 0; k < diariasDe(d); k++) dias.add(somarDias(d
          .data, k));
      13    }
      14    return dias;

● Update(src\nucleo\diarias.ts)
  ⎿  Added 2 lines, removed 2 lines
      14    return n > 0 ? n : 1;
      15  }
      16  
      17 -/** N da despesa: extraído da descrição na hospedagem, 1 nas de
         -mais. */                                                       
      17 +/** N da despesa: extraído da descrição na periodicidade `diari
         +a` (hospedagem), 1 nas demais (R-15). */                       
      18  export function diariasDe(d: DespesaElegivel): number {
      19 -  return d.categoria === 'hospedagem' ? extrairDiarias(d.descri
         -cao) : 1;                                                      
      19 +  return d.regra.periodicidade === 'diaria' ? extrairDiarias(d.
         +descricao) : 1;                                                
      20  }
      21  
      22  /**

● Now motivos.ts with a presentation-only name map and periodicity-based
  wording.

● Update(src\nucleo\motivos.ts)
  ⎿  Added 7 lines, removed 1 line
      12  
      13  type Modelos = { [C in CodigoMotivo]: (detalhes: DetalhesDe<C>)
           => string };
      14  
      15 -const NOME_CATEGORIA: Record<Categoria, string> = {            
      15 +/** Só apresentação (R-15): categoria fora do mapa aparece pela
         + própria chave. */                                             
      16 +const NOMES_CATEGORIA: Readonly<Record<string, string>> = {    
      17    alimentacao: 'alimentação',
      18    transporte_urbano: 'transporte urbano',
      19    hospedagem: 'hospedagem',
      20 +  representacao: 'representação',                              
      21  };
      22  
      23 +function nomeCategoria(categoria: Categoria): string {         
      24 +  return Object.hasOwn(NOMES_CATEGORIA, categoria) ? NOMES_CATE
         +GORIA[categoria]! : categoria;                                 
      25 +}                                                              
      26 +                                                               
      27  const PROBLEMA: Record<ProblemaDado, (campo: string) => string>
           = {
      28    nao_objeto: () => 'A despesa não é um objeto com os campos es
          perados.',
      29    ausente: (campo) => `Campo obrigatório '${campo}' ausente, va
          zio ou com tipo diferente de texto.`,

● Update(src\nucleo\motivos.ts)
  ⎿  Added 6 lines, removed 6 lines
      33    repetido: () => "O 'id' repete o de uma despesa anterior do a
          rquivo.",
      34  };
      35  
      36 -/** Limite da categoria na data; em hospedagem, por diária e co
         -m o período das noites. */                                     
      36 +/** Limite da categoria na data; na periodicidade `diaria`, por
         + diária e com o período das noites. */                         
      37  function limiteDoDia(d: DecisaoLimite['detalhes']): string {
      38 -  const nome = NOME_CATEGORIA[d.categoria];                    
      39 -  if (d.categoria !== 'hospedagem') return `Limite diário de ${
         -nome} ${formatarReais(d.limite)} em ${d.data}`;                
      38 +  const nome = nomeCategoria(d.categoria);                     
      39 +  if (d.periodicidade !== 'diaria') return `Limite diário de ${
         +nome} ${formatarReais(d.limite)} em ${d.data}`;                
      40    const noites = d.diarias === 1 ? `1 diária em ${d.data}` : `$
          {d.diarias} diárias a partir de ${d.data}`;
      41    return `Limite de ${nome} ${formatarReais(d.limite)} por diár
          ia (${noites})`;
      42  }
      43  
      44  export const MODELOS: Modelos = {
      45    APROVADO_INTEGRAL: (d) =>
      46 -    d.categoria === 'hospedagem'                               
      47 -      ? `Dentro do limite de hospedagem (${formatarReais(d.limi
         -te)} por diária, ${d.diarias === 1 ? '1 diária' : `${d.diarias}
         - diárias`}); saldo após este item: ${formatarReais(d.saldoApos)
         -}.`                                                            
      48 -      : `Dentro do limite diário de ${NOME_CATEGORIA[d.categori
         -a]} (${formatarReais(d.limite)}); saldo do dia após este item: 
         -${formatarReais(d.saldoApos)}.`,                               
      46 +    d.periodicidade === 'diaria'                               
      47 +      ? `Dentro do limite de ${nomeCategoria(d.categoria)} (${f
         +ormatarReais(d.limite)} por diária, ${d.diarias === 1 ? '1 diár
         +ia' : `${d.diarias} diárias`}); saldo após este item: ${formata
         +rReais(d.saldoApos)}.`                                         
      48 +      : `Dentro do limite diário de ${nomeCategoria(d.categoria
         +)} (${formatarReais(d.limite)}); saldo do dia após este item: $
         +{formatarReais(d.saldoApos)}.`,                                
      49    LIMITE_DIARIO_EXCEDIDO: (d) =>
      50      `${limiteDoDia(d)}; saldo disponível ${formatarReais(d.sald
          oDisponivel)}; excedente de ${formatarReais(d.solicitado - d.re
          embolsavel)} não reembolsado.`,
      51    LIMITE_DIARIO_ESGOTADO: (d) =>

● Update(src\nucleo\motivos.ts)
  ⎿  Added 1 line, removed 1 line
      58    DUPLICATA: (d) =>
      59      `Mesma data, categoria, fornecedor e valor da despesa '${d.
          idAceito}', que já foi considerada; este lançamento repetido nã
          o é reembolsado.`,
      60    NOTA_FISCAL_AUSENTE: (d) =>
      61 -    `Valor ${formatarReais(d.valor)} acima de ${formatarReais(d
         -.limiar)} exige nota fiscal, que não foi informada.`,          
      61 +    `Valor ${formatarReais(d.valor)} acima de ${formatarReaisDe
         +cimal(d.limiar)} exige nota fiscal, que não foi informada.`,   
      62  };
      63  
      64  export function montarMotivo(decisao: Decisao): Motivo {

● Update(src\nucleo\motivos.ts)
  ⎿  Added 1 line, removed 1 line
      1  // Justificativa de cada item (RN-013): um modelo de texto por c
         ódigo da seção 4.
      2  
      3 -import { formatarReais } from './dinheiro.ts';                  
      3 +import { formatarReais, formatarReaisDecimal } from './dinheiro.
        +ts';                                                            
      4  import type { Categoria, CodigoLimite, CodigoMotivo, DecisaoLimi
         te, Motivo, ProblemaDado, Recusa } from './tipos.ts';
      5  
      6  /** O que decidiu o item: a recusa de uma etapa ou a decisão do 
         limite. */

● Now motor.ts.

● Write(src\nucleo\motor.ts)
  ⎿  Added 15 lines, removed 14 lines
       3  import { registrarId, validarDespesa } from './despesa.ts';
       4  import { diariasDe, gerarParcelas } from './diarias.ts';
       5  import {
       6 +  ehCategoria,                                                 
       7    verificarCategoria,
       8    verificarDuplicata,
       9    verificarNotaFiscal,
      10    verificarPeriodo,
      11    verificarValorPositivo,
      12  } from './elegibilidade.ts';
      12 -import { ehCategoria } from './elegibilidade.ts';              
      13  import type { ChavesDuplicata } from './elegibilidade.ts';
      14  import { alocar } from './limites.ts';
      15  import type { Alocacao } from './limites.ts';
      16  import { montarMotivo } from './motivos.ts';
      17  import { calcularResumo } from './resumo.ts';
      18  import type {
      19 -  Categoria,                                                   
      19    DespesaElegivel,
      20    DespesaValida,
      21    Entrada,
     ...
      23    RecusaDadoInvalido,
      24    Resultado,
      25    ResultadoItem,
      26 +  TabelaAplicavel,                                             
      27  } from './tipos.ts';
      28  import { diasDeViagem } from './viagem.ts';
      29  
     ...
      34    | { readonly tipo: 'elegivel'; readonly despesa: DespesaElegi
          vel };
      35  
      36  /** Passada 1: etapas 1 a 7, na ordem da entrada; a primeira re
          cusa encerra a avaliação. */
      37 -export function passada1(entrada: Entrada): Avaliacao[] {      
      37 +export function passada1(entrada: Entrada, tabela: TabelaAplica
         +vel): Avaliacao[] {                                            
      38    const idsVistos = new Set<string>();
      39    const aceitas: ChavesDuplicata = new Map();
      40    return entrada.despesas.map((bruta, indice): Avaliacao => {
     ...
      45      const recusa =
      46        verificarValorPositivo(validada) ?? // etapa 3
      47        verificarPeriodo(validada, entrada.inicio, entrada.fim) ?
          ? // etapa 4
      48 -      verificarCategoria(validada) ?? // etapa 5               
      48 +      verificarCategoria(validada, tabela) ?? // etapa 5       
      49        verificarDuplicata(validada, aceitas) ?? // etapa 6
      50 -      verificarNotaFiscal(validada); // etapa 7                
      50 +      verificarNotaFiscal(validada, tabela); // etapa 7        
      51      if (recusa) return { tipo: 'recusada', despesa: validada, r
          ecusa };
      52  
      53 -    // A etapa 5 garante que a categoria é reconhecida.        
      54 -    return { tipo: 'elegivel', despesa: { ...validada, categori
         -a: validada.categoria as Categoria } };                        
      53 +    // A etapa 5 garante que a categoria está na tabela aplicáv
         +el.                                                            
      54 +    return { tipo: 'elegivel', despesa: { ...validada, regra: t
         +abela.categorias.get(validada.categoria)! } };                 
      55    });
      56  }
      57  
      58  /** Passada 2: etapas 8 e 9 sobre as elegíveis; monta um item p
          or despesa, na ordem da entrada. */
      59 -export function calcularItens(entrada: Entrada): ResultadoItem[
         -] {                                                            
      60 -  const avaliacoes = passada1(entrada);                        
      59 +export function calcularItens(entrada: Entrada, tabela: TabelaA
         +plicavel): ResultadoItem[] {                                   
      60 +  const avaliacoes = passada1(entrada, tabela);                
      61    const elegiveis = avaliacoes.flatMap((a) => (a.tipo === 'eleg
          ivel' ? [a.despesa] : []));
      62    const viagem = diasDeViagem(elegiveis); // etapa 8
      63    const alocacoes = new Map<number, Alocacao>(
      64 -    alocar(elegiveis.flatMap(gerarParcelas), viagem).map((a) =>
         - [a.indiceDespesa, a]), // etapa 9                             
      64 +    alocar(elegiveis.flatMap(gerarParcelas), viagem, tabela).ma
         +p((a) => [a.indiceDespesa, a]), // etapa 9                     
      65    );
      66  
      67    return avaliacoes.map((a): ResultadoItem => {
     ...
      74        return {
      75          id: d.id,
      76          data: d.data,
      77 -        categoria: ehCategoria(d.categoria) ? d.categoria : d.c
         -ategoriaOriginal,                                              
      77 +        categoria: ehCategoria(d.categoria, tabela) ? d.categor
         +ia : d.categoriaOriginal,                                      
      78          valorSolicitado: d.valorSolicitado,
      79          valorReembolsavel: 0n,
      80          motivo: montarMotivo(a.recusa),
     ...
       94          codigo: alocacao.codigo,
       95          detalhes: {
       96            categoria: d.categoria,
       97 +          periodicidade: d.regra.periodicidade,               
       98            data: d.data,
       99            diarias,
      100            limite: alocacao.limiteAplicado,
     ...
      106        }),
      107        limiteDiarioAplicado: alocacao.limiteAplicado,
      108        emViagem: viagem.has(d.data),
      108 -      diarias: d.categoria === 'hospedagem' ? diarias : null, 
      109 +      diarias: d.regra.periodicidade === 'diaria' ? diarias : 
          +null,                                                         
      110      };
      111    });
      112  }
     ...
      115  const foraDoLimite = { limiteDiarioAplicado: null, emViagem: n
           ull, diarias: null } as const;
      116  
      117  /** Resultado completo: ecos, itens na ordem da entrada e resu
           mo (RN-014). */
      117 -export function calcular(entrada: Entrada): Resultado {       
      118 -  const itens = calcularItens(entrada);                       
      118 +export function calcular(entrada: Entrada, tabela: TabelaAplic
          +avel): Resultado {                                            
      119 +  const itens = calcularItens(entrada, tabela);               
      120    return { colaborador: entrada.colaborador, periodo: entrada.
           periodo, itens, resumo: calcularResumo(itens) };
      121  }

● Write(src\nucleo\politica.ts)
  ⎿  Added 3 lines, removed 12 lines
      1 -// Única fonte dos valores da política (plan §4). Mudar um valor
        - exige mudar a                                                  
      2 -// spec antes.                                                  
      1 +// Montagem da tabela aplicável (RN-016) e o único número de pol
        +ítica que a                                                     
      2 +// spec fixa e a tabela não traz (AMB-040). Os limites, o limiar
        + de nota                                                        
      3 +// fiscal e o percentual de viagem vêm da tabela de limites.    
      4  
      5  import { normalizar } from './texto.ts';
      6  import type { Politica, RegraCategoria, TabelaAplicavel } from '
         ./tipos.ts';
     ...
      29      acrescimoViagemPercentual: politica.acrescimoViagemPercentu
          al,
      30    };
      31  }
      31 -                                                               
      32 -export const POLITICA = {                                      
      33 -  limites: {                                                   
      34 -    alimentacao:       { diario: 60_00n,  ampliaEmViagem: true 
         - }, // RN-009                                                  
      35 -    transporte_urbano: { diario: 80_00n,  ampliaEmViagem: true 
         - }, // RN-009                                                  
      36 -    hospedagem:        { diario: 250_00n, ampliaEmViagem: false
         - }, // RN-009, AMB-020                                         
      37 -  },                                                           
      38 -  fatorViagem: { num: 3n, den: 2n },                           
         -    // RN-011                                                  
      39 -  limiarNotaFiscal: 100_00n,                                   
         -    // RN-008 (estritamente maior)                             
      40 -} as const;                                                    

● Now the CLI and the test helper.

● Update(src\cli.ts)
  ⎿  Added 3 lines, removed 1 line
      54    let conteudo: string;
      55    let resumo: string;
      56    try {
      57 -    const resultado = calcular(lerEntrada(texto));             
      57 +    const entrada = lerEntrada(texto);                         
      58 +    const { politica } = lerExternos(); // entrada → tabela de 
         +limites → câmbio (R-12)                                        
      59 +    const resultado = calcular(entrada, tabelaAplicavel(politic
         +a, null));                                                     
      60      conteudo = serializarJson(montarSaida(resultado));
      61      resumo = `${resultado.resumo.quantidadeItens} itens process
          ados; total reembolsável ${formatarReais(resultado.resumo.total
          Reembolsavel)}`;
      62    } catch (e) {

● Update(src\cli.ts)
  ⎿  Added 2 lines
       3  import { readFile, writeFile } from 'node:fs/promises';
       4  import { parseArgs } from 'node:util';
       5  import { ErroEntrada, lerEntrada } from './io/entrada.ts';
       6 +import { lerExternos } from './io/externos.ts';                
       7  import { serializarJson } from './io/json.ts';
       8  import { montarSaida } from './io/saida.ts';
       9  import { formatarReais } from './nucleo/dinheiro.ts';
      10  import { calcular } from './nucleo/motor.ts';
      11 +import { tabelaAplicavel } from './nucleo/politica.ts';        
      12  
      13  const USO = 'uso: node src/cli.ts calcular --input <arquivo-ent
          rada.json> --output <arquivo-saida.json>';
      14  

  Read 1 file (ctrl+o to expand)

● Write(tests\apoio.ts)
  ⎿  Added 63 lines, removed 25 lines
      1 -// Apoio aos testes: monta despesas brutas como sairiam do leito
        -r de JSON.                                                      
      1 +// Apoio aos testes: monta despesas brutas como sairiam do leito
        +r de JSON, com                                                  
      2 +// a tabela de limites da fixture da v4 (R-10).                 
      3  
      4  import { readFileSync } from 'node:fs';
      5  import { expect } from 'vitest';
     ...
       9  import { gerarParcelas } from '../src/nucleo/diarias.ts';
      10  import { alocar } from '../src/nucleo/limites.ts';
      11  import type { Alocacao } from '../src/nucleo/limites.ts';
      11 -import { calcularItens, passada1 } from '../src/nucleo/motor.ts
         -';                                                             
      12 +import { calcular, calcularItens, passada1 } from '../src/nucle
         +o/motor.ts';                                                   
      13 +import { tabelaAplicavel } from '../src/nucleo/politica.ts';   
      14  import { statusDe } from '../src/nucleo/status.ts';
      13 -import { POLITICA } from '../src/nucleo/politica.ts';          
      14 -import type { DespesaElegivel, DespesaValida, Entrada, Resultad
         -oItem } from '../src/nucleo/tipos.ts';                         
      15 +import type {                                                  
      16 +  DespesaElegivel,                                             
      17 +  DespesaValida,                                               
      18 +  Entrada,                                                     
      19 +  Politica,                                                    
      20 +  Resultado,                                                   
      21 +  ResultadoItem,                                               
      22 +  TabelaAplicavel,                                             
      23 +} from '../src/nucleo/tipos.ts';                               
      24  
      25  /** Texto da tabela de limites da fixture da v4 (R-10: nunca `d
          ados/`). */
      26  export const TEXTO_POLITICA_V4 = readFileSync('exemplos/envelop
          e/politica-v4.json', 'utf8');
     ...
      28  /** Tabela de limites da fixture da v4. */
      29  export const POLITICA_V4 = lerPolitica(TEXTO_POLITICA_V4);
      30  
      31 +/** Tabela de limites da fixture com `trocar` aplicado ao JSON 
         +(ex.: um limite alterado). */                                  
      32 +export function politicaCom(trocar: (json: Record<string, any>)
         + => void): Politica {                                          
      33 +  const json = JSON.parse(TEXTO_POLITICA_V4);                  
      34 +  trocar(json);                                                
      35 +  return lerPolitica(JSON.stringify(json));                    
      36 +}                                                              
      37 +                                                               
      38 +/** O que muda em relação ao cenário padrão (tabela padrão da v
         +4, período de julho). */                                       
      39 +export interface Opcoes {                                      
      40 +  readonly periodo?: { inicio: string; fim: string };          
      41 +  readonly centroCusto?: string | null;                        
      42 +  readonly politica?: Politica;                                
      43 +}                                                              
      44 +                                                               
      45 +/** Tabela aplicável da fixture para as `opcoes` (sem centro de
         + custo: a padrão). */                                          
      46 +export function tabela(opcoes: Opcoes = {}): TabelaAplicavel { 
      47 +  return tabelaAplicavel(opcoes.politica ?? POLITICA_V4, opcoes
         +.centroCusto ?? null);                                         
      48 +}                                                              
      49 +                                                               
      50 +/** Tabela padrão da v4 (mesmos valores da v3). */             
      51 +export const TABELA_PADRAO = tabela();                         
      52 +                                                               
      53  export const DESPESA_PADRAO = {
      54    id: 'd-001',
      55    data: '2026-07-03',
     ...
       92   * `Entrada` com as despesas do padrão com `campos` trocados; 
           sem `id`
       93   * explícito, cada uma recebe `e-1`, `e-2`...
       94   */
       64 -export function entrada(                                      
       65 -  despesas: (Record<string, unknown> | Cru)[],                
       66 -  periodo: { inicio: string; fim: string } = PERIODO_PADRAO,  
       67 -): Entrada {                                                  
       95 +export function entrada(despesas: (Record<string, unknown> | C
          +ru)[], opcoes: Opcoes = {}): Entrada {                        
       96 +  const periodo = opcoes.periodo ?? PERIODO_PADRAO;           
       97 +  const centroCusto = opcoes.centroCusto ?? null;             
       98    return {
       69 -    colaborador: { id: 'c-0001' },                            
       70 -    centroCusto: null,                                        
       99 +    colaborador: centroCusto === null ? { id: 'c-0001' } : { i
          +d: 'c-0001', centro_custo: centroCusto },                     
      100 +    centroCusto,                                              
      101      periodo,
      102      inicio: periodo.inicio,
      103      fim: periodo.fim,
     ...
      105    };
      106  }
      107  
      108 +/** Resultado do motor para uma `Entrada`, com a fixture da v4
          +. */                                                          
      109 +export function calcularV4(e: Entrada, opcoes: Opcoes = {}): R
          +esultado {                                                    
      110 +  return calcular(e, tabela(opcoes));                         
      111 +}                                                             
      112 +                                                              
      113  /** Código de recusa de cada despesa na passada 1 do motor (`n
           ull` = elegível). */
       79 -export function codigosPassada1(e: Entrada): (string | null)[]
          - {                                                            
       80 -  return passada1(e).map((a) => (a.tipo === 'elegivel' ? null 
          -: a.recusa.codigo));                                          
      114 +export function codigosPassada1(e: Entrada, opcoes: Opcoes = {
          +}): (string | null)[] {                                       
      115 +  return passada1(e, tabela(opcoes)).map((a) => (a.tipo === 'e
          +legivel' ? null : a.recusa.codigo));                          
      116  }
      117  
       83 -/** `DespesaElegivel` a partir do padrão com `campos` trocados
          -. */                                                          
       84 -export function elegivel(campos: Record<string, unknown> = {},
          - indice = 0): DespesaElegivel {                               
      118 +/** `DespesaElegivel` a partir do padrão com `campos` trocados
          +, com a regra da tabela aplicável. */                         
      119 +export function elegivel(campos: Record<string, unknown> = {},
          + indice = 0, opcoes: Opcoes = {}): DespesaElegivel {          
      120    const d = valida(campos, indice);
       86 -  expect(Object.hasOwn(POLITICA.limites, d.categoria), d.categ
          -oria).toBe(true);                                             
       87 -  return d as DespesaElegivel;                                
      121 +  const regra = tabela(opcoes).categorias.get(d.categoria);   
      122 +  expect(regra, d.categoria).toBeDefined();                   
      123 +  return { ...d, regra: regra! };                             
      124  }
      125  
      126  /** Aloca o limite para despesas elegíveis montadas do padrão,
            na ordem dada. */
       91 -export function alocarDespesas(despesas: Record<string, unknow
          -n>[], diasDeViagem: ReadonlySet<string> = new Set()): Alocacao
          -[] {                                                          
      127 +export function alocarDespesas(                               
      128 +  despesas: Record<string, unknown>[],                        
      129 +  diasDeViagem: ReadonlySet<string> = new Set(),              
      130 +  opcoes: Opcoes = {},                                        
      131 +): Alocacao[] {                                               
      132    return alocar(
       93 -    despesas.flatMap((campos, i) => gerarParcelas(elegivel({ i
          -d: `e-${i + 1}`, ...campos }, i))),                           
      133 +    despesas.flatMap((campos, i) => gerarParcelas(elegivel({ i
          +d: `e-${i + 1}`, ...campos }, i, opcoes))),                   
      134      diasDeViagem,
      135 +    tabela(opcoes),                                           
      136    );
      137  }
      138  
      139  /** Itens do motor para as despesas montadas do padrão (ver `e
           ntrada`). */
       99 -export function rodar(                                        
      100 -  despesas: (Record<string, unknown> | Cru)[],                
      101 -  periodo?: { inicio: string; fim: string },                  
      102 -): ResultadoItem[] {                                          
      103 -  return calcularItens(entrada(despesas, periodo));           
      140 +export function rodar(despesas: (Record<string, unknown> | Cru
          +)[], opcoes: Opcoes = {}): ResultadoItem[] {                  
      141 +  return calcularItens(entrada(despesas, opcoes), tabela(opcoe
          +s));                                                          
      142  }
      143  
      144  /** `[status, código, reembolsável]` de cada item do motor. */
      107 -export function decisoes(despesas: (Record<string, unknown> | 
          -Cru)[], periodo?: { inicio: string; fim: string }) {          
      108 -  return rodar(despesas, periodo).map((i) => [statusDe(i), i.m
          -otivo.codigo, i.valorReembolsavel] as const);                 
      145 +export function decisoes(despesas: (Record<string, unknown> | 
          +Cru)[], opcoes: Opcoes = {}) {                                
      146 +  return rodar(despesas, opcoes).map((i) => [statusDe(i), i.mo
          +tivo.codigo, i.valorReembolsavel] as const);                  
      147  }

● Now update test call sites mechanically.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio/tests"
      # motor.calcular → apoio.calcularV4…)
  ⎿  Updated tests\casos-de-borda.test.ts (+4 -5)
      10  import { montarSaida } from '../src/io/saida.ts';
      11  import { statusDe } from '../src/nucleo/status.ts';
      12  import type { ResultadoItem } from '../src/nucleo/tipos.ts';
      13 -import { calcular } from '../src/nucleo/motor.ts';             
      13  import { NumeroJson } from '../src/nucleo/tipos.ts';
      15 -import { cru, entrada, rodar } from './apoio.ts';              
      14 +import { calcularV4, cru, entrada, rodar } from './apoio.ts';  
      15  
      16  /** O que a seção 7 verifica em cada item. */
      17  function decisao(i: ResultadoItem | undefined) {
     ...
      141    });
      142  
      143    it('Borda › Estorno', () => {
      145 -    const r = calcular(entrada([{ valor: -45 }, { valor: 10, f
          -ornecedor: 'Y' }]));                                          
      144 +    const r = calcularV4(entrada([{ valor: -45 }, { valor: 10,
          + fornecedor: 'Y' }]));                                        
      145      expect(decisao(r.itens[0])).toEqual({ status: 'RECUSADO', 
           codigo: 'VALOR_NAO_POSITIVO', solicitado: -4500n, reembolsavel
           : 0n });
      146      expect(r.resumo.totalSolicitado).toBe(1000n);
      147    });
     ...
      387    });
      388  
      389    it('Borda › Valor inválido na saída', () => {
      391 -    const r = calcular(entrada([{ valor: 'R$ 45,00' }, { valor
          -: 10, fornecedor: 'Y' }]));                                   
      390 +    const r = calcularV4(entrada([{ valor: 'R$ 45,00' }, { val
          +or: 10, fornecedor: 'Y' }]));                                 
      391      expect(decisao(r.itens[0])).toEqual({ status: 'RECUSADO', 
           codigo: 'DADO_INVALIDO', solicitado: null, reembolsavel: 0n })
           ;
      392      expect(r.resumo.totalSolicitado).toBe(1000n);
      393    });
     ...
      519    };
      520  
      521    it('Borda › Lista de despesas vazia', () => {
      523 -    const texto = serializarJson(montarSaida(calcular(entrada(
          -[]))));                                                       
      522 +    const texto = serializarJson(montarSaida(calcularV4(entrad
          +a([]))));                                                     
      523      expect(JSON.parse(texto).itens).toEqual([]);
      524      expect(texto).toContain('"total_solicitado": 0.00');
      525      expect(texto).toContain('"total_reembolsavel": 0.00');
  ⎿  Updated tests\contrato-saida.test.ts (+2 -2)
       6  import { lerEntrada } from '../src/io/entrada.ts';
       7  import { serializarJson } from '../src/io/json.ts';
       8  import { montarSaida } from '../src/io/saida.ts';
       9 -import { calcular } from '../src/nucleo/motor.ts';             
       9 +import { calcularV4 } from './apoio.ts';                       
      10  
      11  const schema = JSON.parse(readFileSync('specs/001-motor-reembol
          so/contracts/saida.schema.json', 'utf8'));
      12  // multipleOf: 0.01 com float dá falso negativo (ex.: 0.07) sem
           a precisão (plan §7).
     ...
      14  
      15  /** Saída como o CLI a gravaria, relida como JSON. */
      16  function saida(texto: string): unknown {
      17 -  return JSON.parse(serializarJson(montarSaida(calcular(lerEntr
         -ada(texto)))));                                                
      17 +  return JSON.parse(serializarJson(montarSaida(calcularV4(lerEn
         +trada(texto)))));                                              
      18  }
      19  
      20  function conferir(json: unknown): void {
  ⎿  Updated tests\exemplo.test.ts (+2 -2)
       5  import { lerEntrada } from '../src/io/entrada.ts';
       6  import { serializarJson } from '../src/io/json.ts';
       7  import { montarSaida } from '../src/io/saida.ts';
       8 -import { calcular } from '../src/nucleo/motor.ts';             
       8 +import { calcularV4 } from './apoio.ts';                       
       9  
      10  interface ItemSaida {
      11    id: string;
     ...
      18    diarias: number | null;
      19  }
      20  
      21 -const texto = serializarJson(montarSaida(calcular(lerEntrada(re
         -adFileSync('exemplos/despesas-exemplo.json', 'utf8')))));      
      21 +const texto = serializarJson(montarSaida(calcularV4(lerEntrada(
         +readFileSync('exemplos/despesas-exemplo.json', 'utf8')))));    
      22  const saida = JSON.parse(texto) as { itens: ItemSaida[]; resumo
          : Record<string, number> };
      23  
      24  function item(id: string): ItemSaida {
  ⎿  Updated tests\io\saida.test.ts (+2 -2)
       2  import { lerEntrada } from '../../src/io/entrada.ts';
       3  import { serializarJson } from '../../src/io/json.ts';
       4  import { montarSaida } from '../../src/io/saida.ts';
       5 -import { calcular } from '../../src/nucleo/motor.ts';          
       5 +import { calcularV4 } from '../apoio.ts';                      
       6  
       7  /** Texto da saída para o arquivo de entrada `texto`. */
       8  function saida(texto: string): string {
       9 -  return serializarJson(montarSaida(calcular(lerEntrada(texto))
         -));                                                            
       9 +  return serializarJson(montarSaida(calcularV4(lerEntrada(texto
         +))));                                                          
      10  }
      11  
      12  const cabecalho = '"colaborador": {"id": "c-1"}, "periodo": {"i
          nicio": "2026-07-01", "fim": "2026-07-31"}';
  ⎿  Updated tests\nucleo\rn-006-categorias.test.ts (+4 -4)
       1  import { describe, expect, it } from 'vitest';
       2  import { verificarCategoria } from '../../src/nucleo/elegibilid
          ade.ts';
       3 -import { valida } from '../apoio.ts';                          
       3 +import { TABELA_PADRAO, valida } from '../apoio.ts';           
       4  
       5  describe('RN-006 — Categorias reembolsáveis', () => {
       6    it('RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBOL
          SAVEL', () => {
       7 -    const r = verificarCategoria(valida({ id: 'd-005', categori
         -a: 'coworking', valor: 89 }));                                 
       7 +    const r = verificarCategoria(valida({ id: 'd-005', categori
         +a: 'coworking', valor: 89 }), TABELA_PADRAO);                  
       8      expect(r).toEqual({ codigo: 'CATEGORIA_NAO_REEMBOLSAVEL', d
          etalhes: { categoria: 'coworking' } });
       9    });
      10  
      11    it('RN-006 › alimentacao, transporte_urbano e hospedagem são 
          reembolsáveis', () => {
      12      for (const categoria of ['alimentacao', 'transporte_urbano'
          , 'hospedagem', ' Hospedagem ', 'ALIMENTAÇÃO']) {
      13 -      expect(verificarCategoria(valida({ categoria })), categor
         -ia).toBeNull();                                                
      13 +      expect(verificarCategoria(valida({ categoria }), TABELA_P
         +ADRAO), categoria).toBeNull();                                 
      14      }
      15      for (const categoria of ['transporte', 'constructor', 'toSt
          ring', '__proto__']) {
      16 -      expect(verificarCategoria(valida({ categoria }))?.codigo,
         - categoria).toBe('CATEGORIA_NAO_REEMBOLSAVEL');                
      16 +      expect(verificarCategoria(valida({ categoria }), TABELA_P
         +ADRAO)?.codigo, categoria).toBe('CATEGORIA_NAO_REEMBOLSAVEL'); 
      17      }
      18    });
      19  });
  ⎿  … 4 more files changed

● Now the replacement politica.test.ts and the new RN-011 rounding test.

● Write(tests\nucleo\politica.test.ts)
  ⎿  Added 11 lines, removed 6 lines
       1 -import { describe, expect, expectTypeOf, it } from 'vitest';   
       2 -import { POLITICA } from '../../src/nucleo/politica.ts';       
       3 -import type { Categoria } from '../../src/nucleo/tipos.ts';    
       1 +import { readFileSync } from 'node:fs';                        
       2 +import { describe, expect, it } from 'vitest';                 
       3 +import * as politica from '../../src/nucleo/politica.ts';      
       4  
       5  describe('Infra › política', () => {
       6 -  it('Infra › política: categorias reconhecidas são exatamente 
         -as chaves de POLITICA.limites', () => {                        
       7 -    expect(Object.keys(POLITICA.limites).sort()).toEqual(['alim
         -entacao', 'hospedagem', 'transporte_urbano']);                 
       8 -    expectTypeOf<Categoria>().toEqualTypeOf<'alimentacao' | 'tr
         -ansporte_urbano' | 'hospedagem'>();                            
       6 +  it('Infra › política: src/nucleo/politica.ts não tem limite, 
         +limiar de nota fiscal nem percentual (só LIMIAR_APROVACAO e tab
         +elaAplicavel)', () => {                                        
       7 +    expect(Object.keys(politica).sort()).toEqual(['LIMIAR_APROV
         +ACAO', 'tabelaAplicavel']);                                    
       8 +    expect(politica.LIMIAR_APROVACAO).toBe(500_00n);           
       9 +    // Nenhum outro número no código (fora de comentários): os 
         +valores vêm da tabela (RN-016).                                
      10 +    const codigo = readFileSync('src/nucleo/politica.ts', 'utf8
         +')                                                             
      11 +      .replace(/\/\*[\s\S]*?\*\//g, '')                        
      12 +      .replace(/\/\/.*$/gm, '');                               
      13 +    expect(codigo.match(/\b\d[\d_]*n?\b/g)).toEqual(['500_00n']
         +);                                                             
      14    });
      15  });

● Update(tests\nucleo\rn-011-viagem.test.ts)
  ⎿  Added 10 lines
      43      expect(a).toMatchObject({ valorReembolsavel: 8000n, limiteD
          iarioAplicado: 9000n, emViagem: true });
      44    });
      45  
      46 +  it('RN-011 › limite 60,01 ampliado em 50% → 90,02 e 60,03 → 9
         +0,04 (meio para o par, AMB-033)', () => {                      
      47 +    const viagem = new Set(['2026-07-14']);                    
      48 +    const comLimite = (limite: number) =>                      
      49 +      tabela({ politica: politicaCom((p) => (p.padrao.alimentac
         +ao.limite = limite)) });                                       
      50 +    expect(limiteDiario('alimentacao', '2026-07-14', viagem, co
         +mLimite(60.01))).toBe(9002n); // 90,015                        
      51 +    expect(limiteDiario('alimentacao', '2026-07-14', viagem, co
         +mLimite(60.03))).toBe(9004n); // 90,045                        
      52 +    expect(limiteDiario('alimentacao', '2026-07-14', viagem, co
         +mLimite(60.05))).toBe(9008n); // 90,075                        
      53 +    expect(limiteDiario('alimentacao', '2026-07-15', viagem, co
         +mLimite(60.01))).toBe(6001n);                                  
      54 +  });                                                          
      55 +                                                               
      56    it('RN-011 › d-013 recusada por NF não torna 22 a 24/07 dias 
          de viagem', () => {
      57      const d013 = { id: 'd-013', categoria: 'hospedagem', data: 
          '2026-07-22', valor: 690, descricao: 'Airbnb 3 noites', tem_not
          a_fiscal: false };
      58      const itens = rodar([

● Update(tests\nucleo\rn-011-viagem.test.ts)
  ⎿  Added 2 lines, removed 1 line
      1  import { describe, expect, it } from 'vitest';
      2 +import { limiteDiario } from '../../src/nucleo/limites.ts';     
      3  import { diasDeViagem } from '../../src/nucleo/viagem.ts';
      3 -import { decisoes, elegivel, rodar } from '../apoio.ts';        
      4 +import { decisoes, elegivel, politicaCom, rodar, tabela } from '
        +../apoio.ts';                                                   
      5  
      6  const hospedagem = { categoria: 'hospedagem', data: '2026-07-14'
         , valor: 200 };
      7  
  Ran 1 shell command (ctrl+o to expand)

● Only the two known-red files fail. Let me verify the test diffs only touched
  call sites, not expectations.

  Ran 1 shell command (ctrl+o to expand)

● Only call-site changes; no expectation touched. Committing T-050.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      311    - **Aceite:** em `tests/nucleo/rn-016-politica-centro-custo.
           test.ts` passam `RN-016 › CC-SUPORTE-N2 (sem entrada) → tabela
            "padrao", alimentação 60,00`, `RN-016 › " cc-comercial " → ta
           bela "CC-COMERCIAL"`, `RN-016 › sem centro de custo → tabela "
           padrao"`, `RN-016 › CC-ADM sem hospedagem → hospedagem 250,00 
           herdada do padrão`, `RN-016 › CC-ENG-PLATAFORMA: hospedagem co
           m limite 0 não herda do padrão`, `RN-016 › representacao só ex
           iste na tabela do CC-COMERCIAL` e `RN-016 › limiar de nota fis
           cal e acréscimo de viagem são os da tabela, iguais para todo c
           entro de custo`
      312    - **Commit:** `3b70310`
      313  
      314 -- [ ] **T-050** — Refatorar o núcleo para receber a `TabelaApl
          -icavel` no lugar de `POLITICA`, **sem mudar comportamento** na
          - tabela padrão (plan §2, §8 "resistiu"; R-15): `Categoria` vir
          -a texto normalizado; categoria reconhecida (RN-002, RN-006) = 
          -chave da tabela aplicável; `elegibilidade.ts` compara o limiar
          - de NF da tabela com `Decimal`, sem arredondar (RN-008); `limi
          -tes.ts` inicia o saldo com o limite da tabela e, em dia de via
          -gem e periodicidade `dia`, usa `dividirMeioParaPar(limite × (1
          -00 + p), 100)` (RN-011, AMB-033; sai o `throw` de limite inexa
          -to); `viagem.ts` e `diarias.ts` disparam por `periodicidade ==
          -= 'diaria'`; `motivos.ts` usa um mapa de nomes só de apresenta
          -ção com volta para a própria chave. `motor.calcular(entrada, t
          -abela)`; `src/cli.ts` lê `dados/politica.json` por `lerExterno
          -s` (T-047) e passa `tabelaAplicavel(politica, null)` (o centro
          - de custo entra na T-051); `tests/apoio.ts` monta a tabela da 
          -fixture da v4 com um centro de custo opcional. Remover `POLITI
          -CA` e trocar o teste de `tests/nucleo/politica.test.ts`       
      314 +- [x] **T-050** — Refatorar o núcleo para receber a `TabelaApl
          +icavel` no lugar de `POLITICA`, **sem mudar comportamento** na
          + tabela padrão (plan §2, §8 "resistiu"; R-15): `Categoria` vir
          +a texto normalizado; categoria reconhecida (RN-002, RN-006) = 
          +chave da tabela aplicável; `elegibilidade.ts` compara o limiar
          + de NF da tabela com `Decimal`, sem arredondar (RN-008); `limi
          +tes.ts` inicia o saldo com o limite da tabela e, em dia de via
          +gem e periodicidade `dia`, usa `dividirMeioParaPar(limite × (1
          +00 + p), 100)` (RN-011, AMB-033; sai o `throw` de limite inexa
          +to); `viagem.ts` e `diarias.ts` disparam por `periodicidade ==
          += 'diaria'`; `motivos.ts` usa um mapa de nomes só de apresenta
          +ção com volta para a própria chave. `motor.calcular(entrada, t
          +abela)`; `src/cli.ts` lê `dados/politica.json` por `lerExterno
          +s` (T-047) e passa `tabelaAplicavel(politica, null)` (o centro
          + de custo entra na T-051); `tests/apoio.ts` monta a tabela da 
          +fixture da v4 com um centro de custo opcional. Remover `POLITI
          +CA` e trocar o teste de `tests/nucleo/politica.test.ts`       
      315    - **Atende:** RN-002, RN-006, RN-008, RN-009, RN-011, RN-012
           , AMB-020, AMB-033
      316    - **Aceite:** todos os testes das Fases 1–4 continuam passan
           do sem mudar expectativa; em `tests/nucleo/politica.test.ts` p
           assa `Infra › política: src/nucleo/politica.ts não tem limite,
            limiar de nota fiscal nem percentual (só LIMIAR_APROVACAO e t
           abelaAplicavel)`; em `tests/nucleo/rn-011-viagem.test.ts` pass
           a `RN-011 › limite 60,01 ampliado em 50% → 90,02 e 60,03 → 90,
           04 (meio para o par, AMB-033)`
      317 -  - **Commit:** `<hash preenchido depois>`                    
      317 +  - **Commit:** `f35e10b`                                     
      318  
      319  - [ ] **T-051** — Ligar o centro de custo: `motor.calcular(ent
           rada, politica)` monta a `TabelaAplicavel` uma vez com `entrad
           a.centroCusto` (seção 8, "antes de tudo") e `Resultado` ganha 
           `politica: { versao, tabela }`; `src/cli.ts` passa a `Politica
           `. `tests/exemplo.test.ts` passa a usar a tabela de `exemplos/
           envelope/politica-v4.json` e a tabela 1 da seção 9 (colaborado
           r do CC-ENG-PLATAFORMA), substituindo os títulos da T-036
      320    - **Atende:** RN-016, RN-005, RN-006, RN-009, RN-010, RN-014
           , AMB-029, AMB-032, AMB-034

● T-051 — wire the cost center into the motor

● Update(src\nucleo\motor.ts)
  ⎿  Added 13 lines, removed 3 lines
      114  /** Recusada antes da etapa de limite (seção 4). */
      115  const foraDoLimite = { limiteDiarioAplicado: null, emViagem: n
           ull, diarias: null } as const;
      116  
      117 -/** Resultado completo: ecos, itens na ordem da entrada e resu
          -mo (RN-014). */                                               
      118 -export function calcular(entrada: Entrada, tabela: TabelaAplic
          -avel): Resultado {                                            
      117 +/**                                                           
      118 + * Resultado completo: ecos, tabela aplicada, itens na ordem d
          +a entrada e                                                   
      119 + * resumo (RN-014). A tabela aplicável é montada uma vez, ante
          +s de tudo (seção 8).                                          
      120 + */                                                           
      121 +export function calcular(entrada: Entrada, politica: Politica)
          +: Resultado {                                                 
      122 +  const tabela = tabelaAplicavel(politica, entrada.centroCusto
          +);                                                            
      123    const itens = calcularItens(entrada, tabela);
      120 -  return { colaborador: entrada.colaborador, periodo: entrada.
          -periodo, itens, resumo: calcularResumo(itens) };              
      124 +  return {                                                    
      125 +    colaborador: entrada.colaborador,                         
      126 +    periodo: entrada.periodo,                                 
      127 +    politica: { versao: tabela.versao, tabela: tabela.nome }, 
      128 +    itens,                                                    
      129 +    resumo: calcularResumo(itens),                            
      130 +  };                                                          
      131  }

● Update(src\nucleo\motor.ts)
  ⎿  Added 2 lines
      14  import { alocar } from './limites.ts';
      15  import type { Alocacao } from './limites.ts';
      16  import { montarMotivo } from './motivos.ts';
      17 +import { tabelaAplicavel } from './politica.ts';               
      18  import { calcularResumo } from './resumo.ts';
      19  import type {
      20    DespesaElegivel,
      21    DespesaValida,
      22    Entrada,
      23 +  Politica,                                                    
      24    Recusa,
      25    RecusaDadoInvalido,
      26    Resultado,

● Update(src\nucleo\tipos.ts)
  ⎿  Added 2 lines
      162  export interface Resultado {
      163    readonly colaborador: unknown;
      164    readonly periodo: unknown;
      165 +  /** `versao` da tabela de limites e a tabela aplicada (RN-01
          +6). */                                                        
      166 +  readonly politica: { readonly versao: string; readonly tabel
          +a: string };                                                  
      167    readonly itens: readonly ResultadoItem[];
      168    readonly resumo: Resumo;
      169  }

● Update(src\cli.ts)
  ⎿  Added 1 line, removed 1 line
      58    try {
      59      const entrada = lerEntrada(texto);
      60      const { politica } = lerExternos(); // entrada → tabela de 
          limites → câmbio (R-12)
      61 -    const resultado = calcular(entrada, tabelaAplicavel(politic
         -a, null));                                                     
      61 +    const resultado = calcular(entrada, politica);             
      62      conteudo = serializarJson(montarSaida(resultado));
      63      resumo = `${resultado.resumo.quantidadeItens} itens process
          ados; total reembolsável ${formatarReais(resultado.resumo.total
          Reembolsavel)}`;
      64    } catch (e) {

● Update(src\cli.ts)
  ⎿  Removed 1 line
       8  import { montarSaida } from './io/saida.ts';
       9  import { formatarReais } from './nucleo/dinheiro.ts';
      10  import { calcular } from './nucleo/motor.ts';
      11 -import { tabelaAplicavel } from './nucleo/politica.ts';        
      11  
      12  const USO = 'uso: node src/cli.ts calcular --input <arquivo-ent
          rada.json> --output <arquivo-saida.json>';
      13  

● Update(tests\apoio.ts)
  ⎿  Added 3 lines, removed 3 lines
      105    };
      106  }
      107  
      108 -/** Resultado do motor para uma `Entrada`, com a fixture da v4
          -. */                                                          
      109 -export function calcularV4(e: Entrada, opcoes: Opcoes = {}): R
          -esultado {                                                    
      110 -  return calcular(e, tabela(opcoes));                         
      108 +/** Resultado do motor para uma `Entrada` (com o centro de cus
          +to dela), com a fixture da v4. */                             
      109 +export function calcularV4(e: Entrada, opcoes: Pick<Opcoes, 'p
          +olitica'> = {}): Resultado {                                  
      110 +  return calcular(e, opcoes.politica ?? POLITICA_V4);         
      111  }
      112  
      113  /** Código de recusa de cada despesa na passada 1 do motor (`n
           ull` = elegível). */

● Now the RN-016 motor tests. Let me check the example file for exact items.

  Ran 1 shell command (ctrl+o to expand)

● Update(tests\nucleo\rn-016-politica-centro-custo.test.ts)
  ⎿  Added 55 lines
       55      }
       56    });
       57  
       58 +  /** `[status, código, reembolsável]` e a tabela aplicada, pe
          +lo motor completo. */                                         
       59 +  function motor(despesas: Record<string, unknown>[], opcoes: 
          +Opcoes = {}) {                                                
       60 +    const r = calcularV4(entrada(despesas, opcoes), opcoes);  
       61 +    return { tabela: r.politica.tabela, itens: r.itens.map((i)
          + => [statusDe(i), i.motivo.codigo, i.valorReembolsavel]) };   
       62 +  }                                                           
       63 +                                                              
       64 +  it('RN-016 › CC-SUPORTE-N2: alimentação 65,00 → PARCIAL 60,0
          +0', () => {                                                   
       65 +    expect(motor([{ valor: 65 }], { centroCusto: 'CC-SUPORTE-N
          +2' })).toEqual({                                              
       66 +      tabela: 'padrao',                                       
       67 +      itens: [['PARCIAL', 'LIMITE_DIARIO_EXCEDIDO', 6000n]],  
       68 +    });                                                       
       69 +  });                                                         
       70 +                                                              
       71 +  it('RN-016 › " cc-comercial ": alimentação 85,00 → APROVADO 
          +85,00', () => {                                               
       72 +    expect(motor([{ valor: 85 }], { centroCusto: ' cc-comercia
          +l ' })).toEqual({                                             
       73 +      tabela: 'CC-COMERCIAL',                                 
       74 +      itens: [['APROVADO', 'APROVADO_INTEGRAL', 8500n]],      
       75 +    });                                                       
       76 +  });                                                         
       77 +                                                              
       78 +  it('RN-016 › CC-ADM: hospedagem 1 diária 300,00 → PARCIAL 25
          +0,00', () => {                                                
       79 +    const r = calcularV4(entrada([{ categoria: 'hospedagem', d
          +escricao: 'Hotel - 1 diaria', valor: 300 }], { centroCusto: 'C
          +C-ADM' }));                                                   
       80 +    expect(r.politica).toEqual({ versao: 'v4', tabela: 'CC-ADM
          +' });                                                         
       81 +    expect(r.itens[0]).toMatchObject({ valorReembolsavel: 2500
          +0n, limiteDiarioAplicado: 25000n, diarias: 1 });              
       82 +    expect(r.itens[0]?.motivo.codigo).toBe('LIMITE_DIARIO_EXCE
          +DIDO');                                                       
       83 +  });                                                         
       84 +                                                              
       85 +  it('RN-016 › representacao no CC-SUPORTE-N2 → CATEGORIA_NAO_
          +REEMBOLSAVEL', () => {                                        
       86 +    expect(motor([{ categoria: 'representacao', valor: 190 }],
          + { centroCusto: 'CC-SUPORTE-N2' }).itens).toEqual([           
       87 +      ['RECUSADO', 'CATEGORIA_NAO_REEMBOLSAVEL', 0n],         
       88 +    ]);                                                       
       89 +  });                                                         
       90 +                                                              
       91 +  it('RN-016 › limite de alimentação do padrão trocado para 70
          +,00 na tabela: alimentação 65,00 passa de PARCIAL a APROVADO',
          + () => {                                                      
       92 +    const politica = politicaCom((p) => (p.padrao.alimentacao.
          +limite = 70.0));                                              
       93 +    expect(motor([{ valor: 65 }]).itens).toEqual([['PARCIAL', 
          +'LIMITE_DIARIO_EXCEDIDO', 6000n]]);                           
       94 +    expect(motor([{ valor: 65 }], { politica }).itens).toEqual
          +([['APROVADO', 'APROVADO_INTEGRAL', 6500n]]);                 
       95 +    expect(motor([{ valor: 65 }], { politica, centroCusto: 'CC
          +-SUPORTE-N2' }).itens).toEqual([['APROVADO', 'APROVADO_INTEGRA
          +L', 6500n]]);                                                 
       96 +  });                                                         
       97 +                                                              
       98 +  it('RN-016 › vigencia 2026-08-01 não recusa nem muda despesa
          +s de julho (AMB-034)', () => {                                
       99 +    const despesas = [                                        
      100 +      { data: '2026-07-01', valor: 65 },                      
      101 +      { data: '2026-07-31', categoria: 'transporte_urbano', va
          +lor: 50 },                                                    
      102 +      { data: '2026-06-30', valor: 10 },                      
      103 +    ];                                                        
      104 +    const futura = politicaCom((p) => (p.vigencia = '2026-08-0
          +1'));                                                         
      105 +    expect(motor(despesas, { politica: futura })).toEqual(moto
          +r(despesas));                                                 
      106 +    expect(motor(despesas, { politica: futura }).itens.map((i)
          + => i[1])).toEqual([                                          
      107 +      'LIMITE_DIARIO_EXCEDIDO',                               
      108 +      'APROVADO_INTEGRAL',                                    
      109 +      'FORA_DO_PERIODO',                                      
      110 +    ]);                                                       
      111 +  });                                                         
      112 +                                                              
      113    it('RN-016 › limiar de nota fiscal e acréscimo de viagem são
            os da tabela, iguais para todo centro de custo', () => {
      114      for (const cc of [null, 'CC-COMERCIAL', 'CC-ADM', 'CC-ENG-
           PLATAFORMA', 'CC-X']) {
      115        const t = tabelaAplicavel(POLITICA_V4, cc);

● Update(tests\nucleo\rn-016-politica-centro-custo.test.ts)
  ⎿  Added 3 lines, removed 1 line
      1  import { describe, expect, it } from 'vitest';
      2  import { tabelaAplicavel } from '../../src/nucleo/politica.ts';
      3 -import { POLITICA_V4 } from '../apoio.ts';                      
      3 +import { statusDe } from '../../src/nucleo/status.ts';          
      4 +import { POLITICA_V4, calcularV4, entrada, politicaCom } from '.
        +./apoio.ts';                                                    
      5 +import type { Opcoes } from '../apoio.ts';                      
      6  
      7  /** `categoria → [limite, origem]` da tabela aplicável. */
      8  function limites(centroCusto: string | null): Record<string, [bi
         gint, string]> {

● Now rewrite tests/exemplo.test.ts for table 1 of §9 (CC-ENG-PLATAFORMA).

● Write(tests\exemplo.test.ts)
  ⎿  Added 26 lines, removed 29 lines
      1 -// Arquivo oficial × tabela da seção 9 da spec.                 
      1 +// Arquivos oficiais × tabelas da seção 9 da spec, com a tabela 
        +de limites de                                                   
      2 +// exemplos/envelope/ (fixture da v4).                          
      3  
      4  import { readFileSync } from 'node:fs';
      5  import { describe, expect, it } from 'vitest';
     ...
      19    diarias: number | null;
      20  }
      21  
      21 -const texto = serializarJson(montarSaida(calcularV4(lerEntrada(
         -readFileSync('exemplos/despesas-exemplo.json', 'utf8')))));    
      22 +const resultado = calcularV4(lerEntrada(readFileSync('exemplos/
         +despesas-exemplo.json', 'utf8')));                             
      23 +const texto = serializarJson(montarSaida(resultado));          
      24  const saida = JSON.parse(texto) as { itens: ItemSaida[]; resumo
          : Record<string, number> };
      25  
      26  function item(id: string): ItemSaida {
     ...
      35    return [i.valor_solicitado, i.valor_reembolsavel, i.status, i
          .motivo.codigo];
      36  }
      37  
      36 -describe('Exemplo oficial (seção 9)', () => {                  
      37 -  it('RN-010 › exemplo d-001: PARCIAL 60,00', () => {          
      38 -    expect(linha('d-001')).toEqual([72.5, 60, 'PARCIAL', 'LIMIT
         -E_DIARIO_EXCEDIDO']);                                          
      38 +describe('Exemplo oficial (seção 9, CC-ENG-PLATAFORMA)', () => 
         +{                                                              
      39 +  it('RN-009 › exemplo d-001: APROVADO 72,50 (limite 75,00 do C
         +C-ENG-PLATAFORMA)', () => {                                    
      40 +    expect(linha('d-001')).toEqual([72.5, 72.5, 'APROVADO', 'AP
         +ROVADO_INTEGRAL']);                                            
      41 +    expect(item('d-001')).toMatchObject({ limite_diario_aplicad
         +o: 75, em_viagem: false });                                    
      42    });
      43  
      41 -  it('RN-010 › exemplo d-002: RECUSADO LIMITE_DIARIO_ESGOTADO',
         - () => {                                                       
      42 -    expect(linha('d-002')).toEqual([38, 0, 'RECUSADO', 'LIMITE_
         -DIARIO_ESGOTADO']);                                            
      44 +  it('RN-010 › exemplo d-002: PARCIAL 2,50', () => {           
      45 +    expect(linha('d-002')).toEqual([38, 2.5, 'PARCIAL', 'LIMITE
         +_DIARIO_EXCEDIDO']);                                           
      46    });
      47  
      48    it('RN-010 › exemplo d-003: PARCIAL 80,00', () => {
     ...
       73      expect(linha('d-009')).toEqual([-45, 0, 'RECUSADO', 'VALOR
           _NAO_POSITIVO']);
       74    });
       75  
       73 -  it('RN-012 › exemplo d-010: APROVADO 480,00, diarias 2', () 
          -=> {                                                          
       74 -    expect(linha('d-010')).toEqual([480, 480, 'APROVADO', 'APR
          -OVADO_INTEGRAL']);                                            
       75 -    expect(item('d-010')).toMatchObject({ diarias: 2, limite_d
          -iario_aplicado: 250, em_viagem: true });                      
       76 -  });                                                         
       77 -                                                              
       78 -  it('RN-011 › exemplo d-011: APROVADO 33,33, em_viagem true, 
          -limite 90,00', () => {                                        
       76 +  it('RN-001 › exemplo d-011: APROVADO 33,33', () => {        
       77      expect(linha('d-011')).toEqual([33.33, 33.33, 'APROVADO', 
           'APROVADO_INTEGRAL']);
       80 -    expect(item('d-011')).toMatchObject({ em_viagem: true, lim
          -ite_diario_aplicado: 90 });                                   
       78    });
       79  
       80    it('RN-009 › exemplo d-012: APROVADO 47,20', () => {
       81      expect(linha('d-012')).toEqual([47.2, 47.2, 'APROVADO', 'A
           PROVADO_INTEGRAL']);
       82    });
       83  
       87 -  it('RN-008 › exemplo d-013: NOTA_FISCAL_AUSENTE', () => {   
       88 -    expect(linha('d-013')).toEqual([690, 0, 'RECUSADO', 'NOTA_
          -FISCAL_AUSENTE']);                                            
       84 +  it('RN-009 › exemplo d-014: APROVADO 61,00', () => {        
       85 +    expect(linha('d-014')).toEqual([61, 61, 'APROVADO', 'APROV
          +ADO_INTEGRAL']);                                              
       86 +    expect(item('d-014')).toMatchObject({ limite_diario_aplica
          +do: 75, em_viagem: false });                                  
       87    });
       88  
       91 -  it('RN-010 › exemplo d-014: PARCIAL 60,00', () => {         
       92 -    expect(linha('d-014')).toEqual([61, 60, 'PARCIAL', 'LIMITE
          -_DIARIO_EXCEDIDO']);                                          
       93 -    expect(item('d-014')).toMatchObject({ em_viagem: false });
       94 -  });                                                         
       95 -                                                              
       96 -  it('RN-014 › exemplo: resumo 1861.84 / 815.43 / 1046.41 · 4/
          -3/7', () => {                                                 
       89 +  it('RN-014 › exemplo: resumo 1861.84 / 351.43 / 1510.41 · 5/
          +2/7', () => {                                                 
       90      expect(saida.itens.map((i) => i.id)).toEqual(Array.from({ 
           length: 14 }, (_, k) => `d-${String(k + 1).padStart(3, '0')}`)
           );
       98 -    expect(saida.resumo).toEqual({                            
       91 +    expect(saida.resumo).toMatchObject({                      
       92        quantidade_itens: 14,
      100 -      aprovados: 4,                                           
      101 -      parciais: 3,                                            
       93 +      aprovados: 5,                                           
       94 +      parciais: 2,                                            
       95        recusados: 7,
       96        total_solicitado: 1861.84,
      104 -      total_reembolsavel: 815.43,                             
      105 -      total_nao_reembolsado: 1046.41,                         
       97 +      total_reembolsavel: 351.43,                             
       98 +      total_nao_reembolsado: 1510.41,                         
       99      });
      107 -    expect(texto).toContain('"total_solicitado": 1861.84');   
      108 -    expect(texto).toContain('"total_nao_reembolsado": 1046.41'
          -);                                                            
      100 +    expect(texto).toContain('"total_reembolsavel": 351.43');  
      101 +    expect(texto).toContain('"total_nao_reembolsado": 1510.41'
          +);                                                            
      102    });
      103  
      104 +  it('RN-016 › exemplo: tabela aplicada CC-ENG-PLATAFORMA', ()
          + => {                                                         
      105 +    expect(resultado.politica).toEqual({ versao: 'v4', tabela:
          + 'CC-ENG-PLATAFORMA' });                                      
      106 +  });                                                         
      107 +                                                              
      108    it('RN-013 › exemplo: nenhum item com motivo ausente ou vazi
           o', () => {
      109      for (const i of saida.itens) {
      110        expect(i.motivo.codigo, i.id).toBeTruthy();

  Ran 1 shell command (ctrl+o to expand)

● The only new failure is T-038's CLI test still expecting the old §9 total (R$
  815,43), which is expected since T-051 switched table 1 to CC-ENG-PLATAFORMA,
  correctly yielding R$ 351,43. I'll update that test expectation.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; perl -pi -e "s/total
      reembolsável R\\\$ 815,43/total reembolsável R\\\$ 351,43/;
      s/total_reembolsavel\)\.toBe\(81…)
  ⎿  Updated tests\cli.test.ts (+2 -2)
      83      const r = calcular('exemplos/despesas-exemplo.json', saida)
          ;
      84      expect(r.codigo).toBe(0);
      85      expect(r.stderr).toBe('');
      86 -    expect(r.stdout).toBe('14 itens processados; total reembols
         -ável R$ 815,43\n');                                            
      86 +    expect(r.stdout).toBe('14 itens processados; total reembols
         +ável R$ 351,43\n');                                            
      87      const texto = readFileSync(saida, 'utf8');
      88      expect(texto.startsWith('{\n  "colaborador": {\n    "id": "
          c-0417",')).toBe(true);
      89      expect(texto.endsWith('}\n')).toBe(true);
      90 -    expect(JSON.parse(texto).resumo.total_reembolsavel).toBe(81
         -5.43);                                                         
      90 +    expect(JSON.parse(texto).resumo.total_reembolsavel).toBe(35
         +1.43);                                                         
      91    });
      92  
      93    it('Infra › CLI: subcomando ou opção ausente → código 2 com "
          uso:"', () => {

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      316    - **Aceite:** todos os testes das Fases 1–4 continuam passan
           do sem mudar expectativa; em `tests/nucleo/politica.test.ts` p
           assa `Infra › política: src/nucleo/politica.ts não tem limite,
            limiar de nota fiscal nem percentual (só LIMIAR_APROVACAO e t
           abelaAplicavel)`; em `tests/nucleo/rn-011-viagem.test.ts` pass
           a `RN-011 › limite 60,01 ampliado em 50% → 90,02 e 60,03 → 90,
           04 (meio para o par, AMB-033)`
      317    - **Commit:** `f35e10b`
      318  
      319 -- [ ] **T-051** — Ligar o centro de custo: `motor.calcular(ent
          -rada, politica)` monta a `TabelaAplicavel` uma vez com `entrad
          -a.centroCusto` (seção 8, "antes de tudo") e `Resultado` ganha 
          -`politica: { versao, tabela }`; `src/cli.ts` passa a `Politica
          -`. `tests/exemplo.test.ts` passa a usar a tabela de `exemplos/
          -envelope/politica-v4.json` e a tabela 1 da seção 9 (colaborado
          -r do CC-ENG-PLATAFORMA), substituindo os títulos da T-036     
      319 +- [x] **T-051** — Ligar o centro de custo: `motor.calcular(ent
          +rada, politica)` monta a `TabelaAplicavel` uma vez com `entrad
          +a.centroCusto` (seção 8, "antes de tudo") e `Resultado` ganha 
          +`politica: { versao, tabela }`; `src/cli.ts` passa a `Politica
          +`. `tests/exemplo.test.ts` passa a usar a tabela de `exemplos/
          +envelope/politica-v4.json` e a tabela 1 da seção 9 (colaborado
          +r do CC-ENG-PLATAFORMA), substituindo os títulos da T-036     
      320    - **Atende:** RN-016, RN-005, RN-006, RN-009, RN-010, RN-014
           , AMB-029, AMB-032, AMB-034
      321    - **Aceite:** em `tests/nucleo/rn-016-politica-centro-custo.
           test.ts` passam `RN-016 › CC-SUPORTE-N2: alimentação 65,00 → P
           ARCIAL 60,00`, `RN-016 › " cc-comercial ": alimentação 85,00 →
            APROVADO 85,00`, `RN-016 › CC-ADM: hospedagem 1 diária 300,00
            → PARCIAL 250,00`, `RN-016 › representacao no CC-SUPORTE-N2 →
            CATEGORIA_NAO_REEMBOLSAVEL`, `RN-016 › limite de alimentação 
           do padrão trocado para 70,00 na tabela: alimentação 65,00 pass
           a de PARCIAL a APROVADO` e `RN-016 › vigencia 2026-08-01 não r
           ecusa nem muda despesas de julho (AMB-034)`; em `tests/exemplo
           .test.ts` passam `RN-009 › exemplo d-001: APROVADO 72,50 (limi
           te 75,00 do CC-ENG-PLATAFORMA)`, `RN-010 › exemplo d-002: PARC
           IAL 2,50`, `RN-010 › exemplo d-003: PARCIAL 80,00`, `RN-008 › 
           exemplo d-004: NOTA_FISCAL_AUSENTE`, `RN-006 › exemplo d-005: 
           CATEGORIA_NAO_REEMBOLSAVEL`, `RN-009 › exemplo d-006: APROVADO
            54,90`, `RN-007 › exemplo d-007: DUPLICATA`, `RN-005 › exempl
           o d-008: FORA_DO_PERIODO`, `RN-004 › exemplo d-009: VALOR_NAO_
           POSITIVO`, `RN-001 › exemplo d-011: APROVADO 33,33`, `RN-009 ›
            exemplo d-012: APROVADO 47,20`, `RN-009 › exemplo d-014: APRO
           VADO 61,00`, `RN-014 › exemplo: resumo 1861.84 / 351.43 / 1510
           .41 · 5/2/7` e `RN-016 › exemplo: tabela aplicada CC-ENG-PLATA
           FORMA` (d-010 e d-013 entram na T-052)
      322 -  - **Commit:** `<hash preenchido depois>`                    
      322 +  - **Commit:** `bae9a92`                                     
      323  
      324  - [ ] **T-052** — Categoria com limite 0 na etapa 5 (estende T
           -014) em `src/nucleo/elegibilidade.ts`: reembolsável = limite 
           > 0 na tabela aplicável; `Recusa(CATEGORIA_NAO_REEMBOLSAVEL)` 
           leva `{ categoria, tabela, caso: 'ausente' | 'limite_zero', ce
           ntroCusto }`. Em `src/nucleo/motivos.ts`, `ausente` diz que a 
           categoria não consta na tabela (padrão ou do centro de custo) 
           da política `<versao>`, e `limite_zero` diz que ela não é reem
           bolsável no centro de custo e cita o nome dele
      325    - **Atende:** RN-006, RN-002, RN-011, AMB-019, AMB-030, AMB-
           031

● T-052 — limit 0 rejects at step 5

● Update(src\nucleo\tipos.ts)
  ⎿  Added 12 lines, removed 1 line
       90        readonly codigo: 'FORA_DO_PERIODO';
       91        readonly detalhes: { readonly data: DataISO; readonly in
           icio: DataISO; readonly fim: DataISO };
       92      }
       93 -  | { readonly codigo: 'CATEGORIA_NAO_REEMBOLSAVEL'; readonly 
          -detalhes: { readonly categoria: string } }                    
       93 +  | {                                                         
       94 +      readonly codigo: 'CATEGORIA_NAO_REEMBOLSAVEL';          
       95 +      readonly detalhes: {                                    
       96 +        readonly categoria: string;                           
       97 +        /** Nome da tabela aplicada e versão da política. */  
       98 +        readonly tabela: string;                              
       99 +        readonly versao: string;                              
      100 +        /** Fora da tabela aplicável, ou com limite 0 no centr
          +o de custo (RN-006, AMB-031). */                              
      101 +        readonly caso: 'ausente' | 'limite_zero';             
      102 +        readonly centroCusto: string | null;                  
      103 +      };                                                      
      104 +    }                                                         
      105    | { readonly codigo: 'DUPLICATA'; readonly detalhes: { reado
           nly idAceito: string } }
      106    | { readonly codigo: 'NOTA_FISCAL_AUSENTE'; readonly detalhe
           s: { readonly valor: Centavos; readonly limiar: Decimal } };
      107  

● Update(src\nucleo\elegibilidade.ts)
  ⎿  Added 16 lines, removed 4 lines
      22    return tabela.categorias.has(categoria);
      23  }
      24  
      25 -/** Etapa 5 (RN-006, AMB-019): sem reclassificar. */           
      25 +/**                                                            
      26 + * Etapa 5 (RN-006, AMB-019, AMB-031): reembolsável é a categor
         +ia com limite                                                  
      27 + * maior que zero na tabela aplicável; sem reclassificar.      
      28 + */                                                            
      29  export function verificarCategoria(d: DespesaValida, tabela: Ta
          belaAplicavel): Recusa | null {
      27 -  return ehCategoria(d.categoria, tabela)                      
      28 -    ? null                                                     
      29 -    : { codigo: 'CATEGORIA_NAO_REEMBOLSAVEL', detalhes: { categ
         -oria: d.categoriaOriginal } };                                 
      30 +  const regra = tabela.categorias.get(d.categoria);            
      31 +  if (regra && regra.limite > 0n) return null;                 
      32 +  return {                                                     
      33 +    codigo: 'CATEGORIA_NAO_REEMBOLSAVEL',                      
      34 +    detalhes: {                                                
      35 +      categoria: regra ? d.categoria : d.categoriaOriginal,    
      36 +      tabela: tabela.nome,                                     
      37 +      versao: tabela.versao,                                   
      38 +      caso: regra ? 'limite_zero' : 'ausente',                 
      39 +      centroCusto: tabela.centroCusto,                         
      40 +    },                                                         
      41 +  };                                                           
      42  }
      43  
      44  /** Chave da RN-007 → `id` da primeira ocorrência. */

● Update(src\nucleo\motivos.ts)  ⎿  Added 6 lines, removed 1 line
      54    VALOR_NAO_POSITIVO: (d) =>
      55      `Valor solicitado ${formatarReais(d.valor)} não é positivo;
           estornos e valores zerados não são reembolsados.`,
      56    FORA_DO_PERIODO: (d) => `Data ${d.data} fora do período de ${
          d.inicio} a ${d.fim}.`,
      57 -  CATEGORIA_NAO_REEMBOLSAVEL: (d) => `Categoria '${d.categoria}
         -' não consta na política de reembolso.`,                       
      57 +  CATEGORIA_NAO_REEMBOLSAVEL: (d) =>                           
      58 +    d.caso === 'limite_zero'                                   
      59 +      ? `Categoria '${d.categoria}' não é reembolsável no centr
         +o de custo ${d.centroCusto} (limite 0 na política ${d.versao}).
         +`                                                              
      60 +      : d.centroCusto === null                                 
      61 +        ? `Categoria '${d.categoria}' não consta na tabela padr
         +ão da política ${d.versao}.`                                   
      62 +        : `Categoria '${d.categoria}' não consta na tabela do c
         +entro de custo ${d.centroCusto} nem na tabela padrão da polític
         +a ${d.versao}.`,                                               
      63    DUPLICATA: (d) =>
      64      `Mesma data, categoria, fornecedor e valor da despesa '${d.
          idAceito}', que já foi considerada; este lançamento repetido nã
          o é reembolsado.`,
      65    NOTA_FISCAL_AUSENTE: (d) =>

● Now the T-052 tests (RN-006, RN-011, RN-002, exemplo) and the RN-013 fixture
  type update.

● Write(tests\nucleo\rn-006-categorias.test.ts)
  ⎿  Added 31 lines, removed 2 lines
       1  import { describe, expect, it } from 'vitest';
       2  import { verificarCategoria } from '../../src/nucleo/elegibilid
          ade.ts';
       3 -import { TABELA_PADRAO, valida } from '../apoio.ts';           
       3 +import { TABELA_PADRAO, codigosPassada1, entrada, rodar, tabela
         +, valida } from '../apoio.ts';                                 
       4  
       5  describe('RN-006 — Categorias reembolsáveis', () => {
       6    it('RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBOL
          SAVEL', () => {
       7      const r = verificarCategoria(valida({ id: 'd-005', categori
          a: 'coworking', valor: 89 }), TABELA_PADRAO);
       8 -    expect(r).toEqual({ codigo: 'CATEGORIA_NAO_REEMBOLSAVEL', d
         -etalhes: { categoria: 'coworking' } });                        
       8 +    expect(r).toMatchObject({ codigo: 'CATEGORIA_NAO_REEMBOLSAV
         +EL', detalhes: { categoria: 'coworking', caso: 'ausente' } }); 
       9    });
      10  
      11    it('RN-006 › alimentacao, transporte_urbano e hospedagem são 
          reembolsáveis', () => {
     ...
      16        expect(verificarCategoria(valida({ categoria }), TABELA_P
          ADRAO)?.codigo, categoria).toBe('CATEGORIA_NAO_REEMBOLSAVEL');
      17      }
      18    });
      19 +                                                               
      20 +  it('RN-006 › hospedagem no CC-ENG-PLATAFORMA → CATEGORIA_NAO_
         +REEMBOLSAVEL, descrição cita "CC-ENG-PLATAFORMA"', () => {     
      21 +    const opcoes = { centroCusto: 'cc-eng-plataforma' };       
      22 +    const r = verificarCategoria(valida({ categoria: 'Hospedage
         +m', valor: 200 }), tabela(opcoes));                            
      23 +    expect(r).toEqual({                                        
      24 +      codigo: 'CATEGORIA_NAO_REEMBOLSAVEL',                    
      25 +      detalhes: { categoria: 'hospedagem', tabela: 'CC-ENG-PLAT
         +AFORMA', versao: 'v4', caso: 'limite_zero', centroCusto: 'CC-EN
         +G-PLATAFORMA' },                                               
      26 +    });                                                        
      27 +    const [i] = rodar([{ categoria: 'Hospedagem', valor: 200 }]
         +, opcoes);                                                     
      28 +    expect(i).toMatchObject({ categoria: 'hospedagem', valorRee
         +mbolsavel: 0n, limiteDiarioAplicado: null, diarias: null });   
      29 +    expect(i?.motivo.codigo).toBe('CATEGORIA_NAO_REEMBOLSAVEL')
         +;                                                              
      30 +    expect(i?.motivo.descricao).toContain('CC-ENG-PLATAFORMA');
      31 +    expect(i?.motivo.descricao).toMatch(/não é reembolsável no 
         +centro de custo/);                                             
      32 +  });                                                          
      33 +                                                               
      34 +  it('RN-006 › representacao na tabela padrão → CATEGORIA_NAO_R
         +EEMBOLSAVEL, descrição diz que não consta na política', () => {
      35 +    const [i] = rodar([{ categoria: 'representacao', valor: 190
         + }]);                                                          
      36 +    expect(i?.motivo.codigo).toBe('CATEGORIA_NAO_REEMBOLSAVEL')
         +;                                                              
      37 +    expect(i?.motivo.descricao).toBe("Categoria 'representacao'
         + não consta na tabela padrão da política v4.");                
      38 +    const [j] = rodar([{ categoria: 'coworking', valor: 89 }], 
         +{ centroCusto: 'CC-ADM' });                                    
      39 +    expect(j?.motivo.descricao).toMatch(/não consta na tabela d
         +o centro de custo CC-ADM nem na tabela padrão da política v4/);
      40 +  });                                                          
      41 +                                                               
      42 +  it('RN-006 › limite 0 recusa na etapa 5: hospedagem 690,00 se
         +m NF no CC-ENG-PLATAFORMA sai CATEGORIA_NAO_REEMBOLSAVEL', () =
         +> {                                                            
      43 +    const hospedagem = { categoria: 'hospedagem', valor: 690, t
         +em_nota_fiscal: false, descricao: '3 noites' };                
      44 +    const opcoes = { centroCusto: 'CC-ENG-PLATAFORMA' };       
      45 +    expect(codigosPassada1(entrada([hospedagem], opcoes), opcoe
         +s)).toEqual(['CATEGORIA_NAO_REEMBOLSAVEL']);                   
      46 +    expect(codigosPassada1(entrada([hospedagem]))).toEqual(['NO
         +TA_FISCAL_AUSENTE']);                                          
      47 +  });                                                          
      48  });

● Update(tests\nucleo\rn-011-viagem.test.ts)
  ⎿  Added 7 lines
      54      expect(limiteDiario('alimentacao', '2026-07-15', viagem, co
          mLimite(60.01))).toBe(6001n);
      55    });
      56  
      57 +  it('RN-011 › hospedagem com limite 0 no centro de custo não g
         +era dia de viagem', () => {                                    
      58 +    const opcoes = { centroCusto: 'CC-ENG-PLATAFORMA' };       
      59 +    const itens = rodar([{ ...hotel, descricao: 'Hotel 2 diaria
         +s' }, { ...alimentacao80, data: '2026-07-14' }], opcoes);      
      60 +    expect(itens[0]?.motivo.codigo).toBe('CATEGORIA_NAO_REEMBOL
         +SAVEL');                                                       
      61 +    expect(itens[1]).toMatchObject({ valorReembolsavel: 7500n, 
         +limiteDiarioAplicado: 7500n, emViagem: false });               
      62 +  });                                                          
      63 +                                                               
      64    it('RN-011 › d-013 recusada por NF não torna 22 a 24/07 dias 
          de viagem', () => {
      65      const d013 = { id: 'd-013', categoria: 'hospedagem', data: 
          '2026-07-22', valor: 690, descricao: 'Airbnb 3 noites', tem_not
          a_fiscal: false };
      66      const itens = rodar([

● Update(tests\nucleo\rn-002-categoria.test.ts)
  ⎿  Added 10 lines
      28      ]);
      29      expect(rodar([{ categoria: 'ALIMENTACAO' }])[0]?.categoria)
          .toBe('alimentacao');
      30    });
      31 +                                                               
      32 +  it('RN-002 › "Representação" é representacao no CC-COMERCIAL 
         +e sai como veio na tabela padrão', () => {                     
      33 +    const despesa = { categoria: 'Representação', valor: 200 };
      34 +    const [comercial] = rodar([despesa], { centroCusto: 'CC-COM
         +ERCIAL' });                                                    
      35 +    expect(comercial?.categoria).toBe('representacao');        
      36 +    expect(comercial?.motivo.codigo).toBe('APROVADO_INTEGRAL');
      37 +    const [padrao] = rodar([despesa]);                         
      38 +    expect(padrao?.categoria).toBe('Representação');           
      39 +    expect(padrao?.motivo.codigo).toBe('CATEGORIA_NAO_REEMBOLSA
         +VEL');                                                         
      40 +  });                                                          
      41  });

● Update(tests\nucleo\rn-013-motivos.test.ts)
  ⎿  Added 8 lines, removed 1 line
      23    { codigo: 'DADO_INVALIDO', detalhes: { campo: 'data', problem
          a: 'data_invalida' } },
      24    { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valor: -4500n } }
          ,
      25    { codigo: 'FORA_DO_PERIODO', detalhes: { data: '2026-04-15', 
          inicio: '2026-07-01', fim: '2026-07-31' } },
      26 -  { codigo: 'CATEGORIA_NAO_REEMBOLSAVEL', detalhes: { categoria
         -: 'coworking' } },                                             
      26 +  {                                                            
      27 +    codigo: 'CATEGORIA_NAO_REEMBOLSAVEL',                      
      28 +    detalhes: { categoria: 'coworking', tabela: 'padrao', versa
         +o: 'v4', caso: 'ausente', centroCusto: null },                 
      29 +  },                                                           
      30 +  {                                                            
      31 +    codigo: 'CATEGORIA_NAO_REEMBOLSAVEL',                      
      32 +    detalhes: { categoria: 'hospedagem', tabela: 'CC-X', versao
         +: 'v4', caso: 'limite_zero', centroCusto: 'CC-X' },            
      33 +  },                                                           
      34    { codigo: 'DUPLICATA', detalhes: { idAceito: 'd-006' } },
      35    { codigo: 'NOTA_FISCAL_AUSENTE', detalhes: { valor: 10001n, l
          imiar: { digitos: 10000n, escala: 2 } } },
      36  ];

● Update(tests\exemplo.test.ts)
  ⎿  Added 6 lines
      73      expect(linha('d-009')).toEqual([-45, 0, 'RECUSADO', 'VALOR_
          NAO_POSITIVO']);
      74    });
      75  
      76 +  it('RN-006 › exemplo d-010: CATEGORIA_NAO_REEMBOLSAVEL (hospe
         +dagem com limite 0)', () => {                                  
      77 +    expect(linha('d-010')).toEqual([480, 0, 'RECUSADO', 'CATEGO
         +RIA_NAO_REEMBOLSAVEL']);                                       
      78 +    expect(item('d-010')).toMatchObject({ diarias: null, limite
         +_diario_aplicado: null, em_viagem: null });                    
      79 +    expect(item('d-010').motivo.descricao).toContain('CC-ENG-PL
         +ATAFORMA');                                                    
      80 +  });                                                          
      81 +                                                               
      82    it('RN-001 › exemplo d-011: APROVADO 33,33', () => {
      83      expect(linha('d-011')).toEqual([33.33, 33.33, 'APROVADO', '
          APROVADO_INTEGRAL']);
      84    });

● Update(tests\exemplo.test.ts)
  ⎿  Added 8 lines
       87      expect(linha('d-012')).toEqual([47.2, 47.2, 'APROVADO', 'A
           PROVADO_INTEGRAL']);
       88    });
       89  
       90 +  it('RN-006 › exemplo d-013: CATEGORIA_NAO_REEMBOLSAVEL (ante
          +s da nota fiscal)', () => {                                   
       91 +    expect(linha('d-013')).toEqual([690, 0, 'RECUSADO', 'CATEG
          +ORIA_NAO_REEMBOLSAVEL']);                                     
       92 +    expect(item('d-013').motivo.descricao).toContain('CC-ENG-P
          +LATAFORMA');                                                  
       93 +    // sem hospedagem elegível, nenhum dia de viagem no exempl
          +o                                                             
       94 +    expect(saida.itens.every((i) => i.em_viagem !== true)).toB
          +e(true);                                                      
       95 +    expect(item('d-011')).toMatchObject({ limite_diario_aplica
          +do: 75, em_viagem: false });                                  
       96 +  });                                                         
       97 +                                                              
       98    it('RN-009 › exemplo d-014: APROVADO 61,00', () => {
       99      expect(linha('d-014')).toEqual([61, 61, 'APROVADO', 'APROV
           ADO_INTEGRAL']);
      100      expect(item('d-014')).toMatchObject({ limite_diario_aplica
           do: 75, em_viagem: false });

  Ran 1 shell command (ctrl+o to expand)

● The RN-013 test compares model keys to the example codes; I added a second
  example for the same code. Dedupe in the comparison.

● Update(tests\nucleo\rn-013-motivos.test.ts)
  ⎿  Added 1 line, removed 1 line
      37  
      38  describe('RN-013 — Justificativa obrigatória', () => {
      39    it('RN-013 › todo código da seção 4 gera descrição não vazia'
          , () => {
      40 -    expect(Object.keys(MODELOS).sort()).toEqual(EXEMPLOS.map((e
         -) => e.codigo).sort());                                        
      40 +    expect(Object.keys(MODELOS).sort()).toEqual([...new Set(EXE
         +MPLOS.map((e) => e.codigo))].sort());                          
      41      for (const decisao of EXEMPLOS) {
      42        const m = montarMotivo(decisao);
      43        expect(m.codigo).toBe(decisao.codigo);

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; npx vitest run 2>&1 | grep
      -E "FAIL|Test Files|Tests " | head -20 && bash
      "C:/Users/rofel/AppData/Local/Temp/clau…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      321    - **Aceite:** em `tests/nucleo/rn-016-politica-centro-custo.
           test.ts` passam `RN-016 › CC-SUPORTE-N2: alimentação 65,00 → P
           ARCIAL 60,00`, `RN-016 › " cc-comercial ": alimentação 85,00 →
            APROVADO 85,00`, `RN-016 › CC-ADM: hospedagem 1 diária 300,00
            → PARCIAL 250,00`, `RN-016 › representacao no CC-SUPORTE-N2 →
            CATEGORIA_NAO_REEMBOLSAVEL`, `RN-016 › limite de alimentação 
           do padrão trocado para 70,00 na tabela: alimentação 65,00 pass
           a de PARCIAL a APROVADO` e `RN-016 › vigencia 2026-08-01 não r
           ecusa nem muda despesas de julho (AMB-034)`; em `tests/exemplo
           .test.ts` passam `RN-009 › exemplo d-001: APROVADO 72,50 (limi
           te 75,00 do CC-ENG-PLATAFORMA)`, `RN-010 › exemplo d-002: PARC
           IAL 2,50`, `RN-010 › exemplo d-003: PARCIAL 80,00`, `RN-008 › 
           exemplo d-004: NOTA_FISCAL_AUSENTE`, `RN-006 › exemplo d-005: 
           CATEGORIA_NAO_REEMBOLSAVEL`, `RN-009 › exemplo d-006: APROVADO
            54,90`, `RN-007 › exemplo d-007: DUPLICATA`, `RN-005 › exempl
           o d-008: FORA_DO_PERIODO`, `RN-004 › exemplo d-009: VALOR_NAO_
           POSITIVO`, `RN-001 › exemplo d-011: APROVADO 33,33`, `RN-009 ›
            exemplo d-012: APROVADO 47,20`, `RN-009 › exemplo d-014: APRO
           VADO 61,00`, `RN-014 › exemplo: resumo 1861.84 / 351.43 / 1510
           .41 · 5/2/7` e `RN-016 › exemplo: tabela aplicada CC-ENG-PLATA
           FORMA` (d-010 e d-013 entram na T-052)
      322    - **Commit:** `bae9a92`
      323  
      324 -- [ ] **T-052** — Categoria com limite 0 na etapa 5 (estende T
          --014) em `src/nucleo/elegibilidade.ts`: reembolsável = limite 
          -> 0 na tabela aplicável; `Recusa(CATEGORIA_NAO_REEMBOLSAVEL)` 
          -leva `{ categoria, tabela, caso: 'ausente' | 'limite_zero', ce
          -ntroCusto }`. Em `src/nucleo/motivos.ts`, `ausente` diz que a 
          -categoria não consta na tabela (padrão ou do centro de custo) 
          -da política `<versao>`, e `limite_zero` diz que ela não é reem
          -bolsável no centro de custo e cita o nome dele                
      324 +- [x] **T-052** — Categoria com limite 0 na etapa 5 (estende T
          +-014) em `src/nucleo/elegibilidade.ts`: reembolsável = limite 
          +> 0 na tabela aplicável; `Recusa(CATEGORIA_NAO_REEMBOLSAVEL)` 
          +leva `{ categoria, tabela, caso: 'ausente' | 'limite_zero', ce
          +ntroCusto }`. Em `src/nucleo/motivos.ts`, `ausente` diz que a 
          +categoria não consta na tabela (padrão ou do centro de custo) 
          +da política `<versao>`, e `limite_zero` diz que ela não é reem
          +bolsável no centro de custo e cita o nome dele                
      325    - **Atende:** RN-006, RN-002, RN-011, AMB-019, AMB-030, AMB-
           031
      326    - **Aceite:** em `tests/nucleo/rn-006-categorias.test.ts` pa
           ssam `RN-006 › hospedagem no CC-ENG-PLATAFORMA → CATEGORIA_NAO
           _REEMBOLSAVEL, descrição cita "CC-ENG-PLATAFORMA"`, `RN-006 › 
           representacao na tabela padrão → CATEGORIA_NAO_REEMBOLSAVEL, d
           escrição diz que não consta na política` e `RN-006 › limite 0 
           recusa na etapa 5: hospedagem 690,00 sem NF no CC-ENG-PLATAFOR
           MA sai CATEGORIA_NAO_REEMBOLSAVEL`; em `tests/nucleo/rn-011-vi
           agem.test.ts` passa `RN-011 › hospedagem com limite 0 no centr
           o de custo não gera dia de viagem`; em `tests/nucleo/rn-002-ca
           tegoria.test.ts` passa `RN-002 › "Representação" é representac
           ao no CC-COMERCIAL e sai como veio na tabela padrão`; em `test
           s/exemplo.test.ts` passam `RN-006 › exemplo d-010: CATEGORIA_N
           AO_REEMBOLSAVEL (hospedagem com limite 0)` e `RN-006 › exemplo
            d-013: CATEGORIA_NAO_REEMBOLSAVEL (antes da nota fiscal)`
      327 -  - **Commit:** `<hash preenchido depois>`                    
      327 +  - **Commit:** `61a54ac`                                     
      328  
      329  - [ ] **T-053** — Testes de limite, viagem e nota fiscal com a
            tabela de outro centro de custo e com a tabela alterada em me
           mória. Se algum falhar, o conserto faz parte desta task
      330    - **Atende:** RN-008, RN-009, RN-010, RN-011, AMB-029, AMB-0
           33

● T-053 — tests with other cost-center tables and tables changed in memory

● Update(tests\nucleo\rn-009-limites.test.ts)
  ⎿  Added 10 lines
      30      ]);
      31    });
      32  
      33 +  it('RN-009 › alimentação 80,00 no CC-COMERCIAL → APROVADO 80,
         +00 (limite 90,00)', () => {                                    
      34 +    const [a] = alocarDespesas([{ valor: 80 }], new Set(), { ce
         +ntroCusto: 'CC-COMERCIAL' });                                  
      35 +    expect(a).toMatchObject({ codigo: 'APROVADO_INTEGRAL', reem
         +bolsavel: 8000n, limiteAplicado: 9000n });                     
      36 +    expect(decisoes([{ valor: 80 }], { centroCusto: 'CC-COMERCI
         +AL' })).toEqual([['APROVADO', 'APROVADO_INTEGRAL', 8000n]]);   
      37 +  });                                                          
      38 +                                                               
      39 +  it('RN-009 › alimentação 50,00 no CC-ADM → PARCIAL 45,00', ()
         + => {                                                          
      40 +    expect(decisoes([{ valor: 50 }], { centroCusto: 'CC-ADM' })
         +).toEqual([['PARCIAL', 'LIMITE_DIARIO_EXCEDIDO', 4500n]]);     
      41 +  });                                                          
      42 +                                                               
      43    it('RN-009 › em dia de viagem alimentação vai a 90,00 e trans
          porte a 120,00, hospedagem fica em 250,00', () => {
      44      const viagem = new Set(['2026-07-03']);
      45      expect(limiteDiario('alimentacao', '2026-07-03', viagem, TA
          BELA_PADRAO)).toBe(9000n);

● Update(tests\nucleo\rn-009-limites.test.ts)
  ⎿  Added 1 line, removed 1 line
      1  import { describe, expect, it } from 'vitest';
      2  import { limiteDiario } from '../../src/nucleo/limites.ts';
      3 -import { TABELA_PADRAO, alocarDespesas } from '../apoio.ts';    
      3 +import { TABELA_PADRAO, alocarDespesas, decisoes } from '../apoi
        +o.ts';                                                          
      4  
      5  /** `[código, reembolsável]` de cada despesa. */
      6  function resumo(despesas: Record<string, unknown>[], dias?: Read
         onlySet<string>): [string, bigint][] {

● Update(tests\nucleo\rn-010-parcial.test.ts)
  ⎿  Added 13 lines
      11      expect(d002).toMatchObject({ codigo: 'LIMITE_DIARIO_ESGOTAD
          O', reembolsavel: 0n, saldoDisponivel: 0n });
      12    });
      13  
      14 +  it('RN-010 › CC-ENG-PLATAFORMA (75,00): d-001 72,50 → APROVAD
         +O 72,50 e d-002 38,00 → PARCIAL 2,50', () => {                 
      15 +    const [d001, d002] = alocarDespesas(                       
      16 +      [                                                        
      17 +        { id: 'd-001', valor: 72.5, fornecedor: 'Restaurante Ta
         +vola' },                                                       
      18 +        { id: 'd-002', valor: 38, fornecedor: 'Cantina do Porto
         +' },                                                           
      19 +      ],                                                       
      20 +      new Set(),                                               
      21 +      { centroCusto: 'CC-ENG-PLATAFORMA' },                    
      22 +    );                                                         
      23 +    expect(d001).toMatchObject({ codigo: 'APROVADO_INTEGRAL', r
         +eembolsavel: 7250n, limiteAplicado: 7500n, saldoApos: 250n }); 
      24 +    expect(d002).toMatchObject({ codigo: 'LIMITE_DIARIO_EXCEDID
         +O', reembolsavel: 250n, saldoDisponivel: 250n, saldoApos: 0n })
         +;                                                              
      25 +  });                                                          
      26 +                                                               
      27    it('RN-010 › d-014 (61,00) → PARCIAL 60,00', () => {
      28      const [d014] = alocarDespesas([{ id: 'd-014', data: '2026-0
          7-31', valor: 61 }]);
      29      expect(d014).toMatchObject({ codigo: 'LIMITE_DIARIO_EXCEDID
          O', reembolsavel: 6000n, solicitado: 6100n });

● Update(tests\nucleo\rn-011-viagem.test.ts)
  ⎿  Added 17 lines
      61      expect(itens[1]).toMatchObject({ valorReembolsavel: 7500n, 
          limiteDiarioAplicado: 7500n, emViagem: false });
      62    });
      63  
      64 +  it('RN-011 › CC-COMERCIAL: representacao 420,00 em dia de via
         +gem → APROVADO 420,00 (limite 450,00)', () => {                
      65 +    const opcoes = { centroCusto: 'CC-COMERCIAL' };            
      66 +    const representacao = { categoria: 'representacao', data: '
         +2026-07-14', valor: 420, tem_nota_fiscal: true };              
      67 +    const [, r] = rodar([hotel, representacao], opcoes);       
      68 +    expect(r).toMatchObject({ valorReembolsavel: 42000n, limite
         +DiarioAplicado: 45000n, emViagem: true });                     
      69 +    expect(r?.motivo.codigo).toBe('APROVADO_INTEGRAL');        
      70 +    // fora da viagem, o limite é 300,00                       
      71 +    expect(rodar([representacao], opcoes)[0]).toMatchObject({ v
         +alorReembolsavel: 30000n, limiteDiarioAplicado: 30000n });     
      72 +  });                                                          
      73 +                                                               
      74 +  it('RN-011 › acréscimo trocado para 20 na tabela: alimentação
         + em dia de viagem tem limite 72,00', () => {                   
      75 +    const politica = politicaCom((p) => (p.acrescimo_em_viagem_
         +percentual = 20));                                             
      76 +    const [, a] = rodar([hotel, { ...alimentacao80, data: '2026
         +-07-14' }], { politica });                                     
      77 +    expect(a).toMatchObject({ valorReembolsavel: 7200n, limiteD
         +iarioAplicado: 7200n, emViagem: true });                       
      78 +    expect(a?.motivo.codigo).toBe('LIMITE_DIARIO_EXCEDIDO');   
      79 +  });                                                          
      80 +                                                               
      81    it('RN-011 › d-013 recusada por NF não torna 22 a 24/07 dias 
          de viagem', () => {
      82      const d013 = { id: 'd-013', categoria: 'hospedagem', data: 
          '2026-07-22', valor: 690, descricao: 'Airbnb 3 noites', tem_not
          a_fiscal: false };
      83      const itens = rodar([

● Update(tests\nucleo\rn-008-nota-fiscal.test.ts)
  ⎿  Added 12 lines
      25      expect(verificarNotaFiscal(d, TABELA_PADRAO)).toBeNull();
      26    });
      27  
      28 +  it('RN-008 › limiar trocado para 150,00 na tabela: 120,00 sem
         + NF não é recusada', () => {                                   
      29 +    const tabela150 = tabela({ politica: politicaCom((p) => (p.
         +nota_fiscal_obrigatoria_acima_de = 150.0)) });                 
      30 +    expect(verificarNotaFiscal(valida({ ...semNf, valor: 120 })
         +, tabela150)).toBeNull();                                      
      31 +    expect(verificarNotaFiscal(valida({ ...semNf, valor: 150 })
         +, tabela150)).toBeNull();                                      
      32 +    expect(verificarNotaFiscal(valida({ ...semNf, valor: 150.01
         + }), tabela150)?.codigo).toBe('NOTA_FISCAL_AUSENTE');          
      33 +    expect(verificarNotaFiscal(valida({ ...semNf, valor: 120 })
         +, TABELA_PADRAO)?.codigo).toBe('NOTA_FISCAL_AUSENTE');         
      34 +    // limiar com mais de 2 casas comparado sem arredondar     
      35 +    const tabelaFina = tabela({ politica: politicaCom((p) => (p
         +.nota_fiscal_obrigatoria_acima_de = 100.005)) });              
      36 +    expect(verificarNotaFiscal(valida({ ...semNf, valor: 100 })
         +, tabelaFina)).toBeNull();                                     
      37 +    expect(verificarNotaFiscal(valida({ ...semNf, valor: 100.01
         + }), tabelaFina)?.codigo).toBe('NOTA_FISCAL_AUSENTE');         
      38 +  });                                                          
      39 +                                                               
      40    it('RN-008 › dia de viagem não amplia o limiar de nota fiscal
          ', () => {
      41      const hotel = { categoria: 'hospedagem', valor: 200, descri
          cao: 'Hotel', fornecedor: 'Hotel' };
      42      expect(decisoes([hotel, { ...semNf, valor: 110 }, { ...semN
          f, valor: 100, fornecedor: 'Outro' }]).slice(1)).toEqual([

● Update(tests\nucleo\rn-008-nota-fiscal.test.ts)
  ⎿  Added 1 line, removed 1 line
      1  import { describe, expect, it } from 'vitest';
      2  import { verificarNotaFiscal } from '../../src/nucleo/elegibilid
         ade.ts';
      3 -import { TABELA_PADRAO, decisoes, valida } from '../apoio.ts';  
      3 +import { TABELA_PADRAO, decisoes, politicaCom, tabela, valida } 
        +from '../apoio.ts';                                             
      4  
      5  const semNf = { categoria: 'transporte_urbano', tem_nota_fiscal:
          false };
      6  

  Ran 1 shell command (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      326    - **Aceite:** em `tests/nucleo/rn-006-categorias.test.ts` pa
           ssam `RN-006 › hospedagem no CC-ENG-PLATAFORMA → CATEGORIA_NAO
           _REEMBOLSAVEL, descrição cita "CC-ENG-PLATAFORMA"`, `RN-006 › 
           representacao na tabela padrão → CATEGORIA_NAO_REEMBOLSAVEL, d
           escrição diz que não consta na política` e `RN-006 › limite 0 
           recusa na etapa 5: hospedagem 690,00 sem NF no CC-ENG-PLATAFOR
           MA sai CATEGORIA_NAO_REEMBOLSAVEL`; em `tests/nucleo/rn-011-vi
           agem.test.ts` passa `RN-011 › hospedagem com limite 0 no centr
           o de custo não gera dia de viagem`; em `tests/nucleo/rn-002-ca
           tegoria.test.ts` passa `RN-002 › "Representação" é representac
           ao no CC-COMERCIAL e sai como veio na tabela padrão`; em `test
           s/exemplo.test.ts` passam `RN-006 › exemplo d-010: CATEGORIA_N
           AO_REEMBOLSAVEL (hospedagem com limite 0)` e `RN-006 › exemplo
            d-013: CATEGORIA_NAO_REEMBOLSAVEL (antes da nota fiscal)`
      327    - **Commit:** `61a54ac`
      328  
      329 -- [ ] **T-053** — Testes de limite, viagem e nota fiscal com a
          - tabela de outro centro de custo e com a tabela alterada em me
          -mória. Se algum falhar, o conserto faz parte desta task       
      329 +- [x] **T-053** — Testes de limite, viagem e nota fiscal com a
          + tabela de outro centro de custo e com a tabela alterada em me
          +mória. Se algum falhar, o conserto faz parte desta task       
      330    - **Atende:** RN-008, RN-009, RN-010, RN-011, AMB-029, AMB-0
           33
      331    - **Aceite:** passam, em `tests/nucleo/rn-009-limites.test.t
           s`, `RN-009 › alimentação 80,00 no CC-COMERCIAL → APROVADO 80,
           00 (limite 90,00)` e `RN-009 › alimentação 50,00 no CC-ADM → P
           ARCIAL 45,00`; em `tests/nucleo/rn-010-parcial.test.ts`, `RN-0
           10 › CC-ENG-PLATAFORMA (75,00): d-001 72,50 → APROVADO 72,50 e
            d-002 38,00 → PARCIAL 2,50`; em `tests/nucleo/rn-011-viagem.t
           est.ts`, `RN-011 › CC-COMERCIAL: representacao 420,00 em dia d
           e viagem → APROVADO 420,00 (limite 450,00)` e `RN-011 › acrésc
           imo trocado para 20 na tabela: alimentação em dia de viagem te
           m limite 72,00`; em `tests/nucleo/rn-008-nota-fiscal.test.ts`,
            `RN-008 › limiar trocado para 150,00 na tabela: 120,00 sem NF
            não é recusada`
      332 -  - **Commit:** `<hash preenchido depois>`                    
      332 +  - **Commit:** `45720a2`                                     
      333  
      334  - [ ] **T-054** — [P] Criar `src/nucleo/cambio.ts` (DT-007, R-
           13, R-14): `converter(valorOriginal, moeda, data, cambio)` → `
           Conversao | null`. `BRL` → `{ taxa: NumeroJson "1", dataCotaca
           o: null, valorSolicitado: valorOriginal }`, sem olhar a data. 
           Outra moeda → último elemento do índice com `data ≤ D` (busca 
           binária, comparação de texto); `valorSolicitado = dividirMeioP
           araPar(valorOriginal × taxa.digitos, 10^taxa.escala)`; sem cot
           ação até D (ou moeda fora do índice) → `null`
      335    - **Atende:** RN-017, RN-001, AMB-035, AMB-037

● T-054 — nucleo/cambio.ts conversion

● Write(src\nucleo\cambio.ts)
  ⎿  Wrote 37 lines to src\nucleo\cambio.ts
       1 // Conversão para reais (RN-017, DT-007, R-13, R-14).
       2
       4 import { NumeroJson } from './tipos.ts';
       5 import type { Cambio, Centavos, Conversao, Cotacao, DataISO, Moe
         da } from './tipos.ts';
       7 const TAXA_BRL = new NumeroJson('1');
       8
       9 /** Última cotação com `data ≤ dataDespesa` (busca binária por t
      10 function cotacaoAte(cotacoes: readonly Cotacao[], dataDespesa: D
         ataISO): Cotacao | undefined {
     … +37 lines (ctrl+o to expand)

● Update(tests\apoio.ts)  ⎿  Error editing file

● Update(tests\apoio.ts)
  ⎿  Added 1 line
      3  
      4  import { readFileSync } from 'node:fs';
      5  import { expect } from 'vitest';
      6 +import { lerCambio } from '../src/io/cambio.ts';                
      7  import { lerJson } from '../src/io/json.ts';
      8  import { lerPolitica } from '../src/io/politica.ts';
      9  import { validarDespesa } from '../src/nucleo/despesa.ts';

● Update(tests\nucleo\rn-017-cambio.test.ts)
  ⎿  Added 51 lines
       1  import { describe, expect, it } from 'vitest';
       2  import { lerCambio } from '../../src/io/cambio.ts';
       3 +import { converter } from '../../src/nucleo/cambio.ts';        
       4 +import { CAMBIO_V4 } from '../apoio.ts';                       
       5  
       6 +/** `[taxa, data da cotação, valor em reais]` da conversão, ou 
         +`null`. */                                                     
       7 +function conversao(centavos: bigint, moeda: string, data: strin
         +g) {                                                           
       8 +  const c = converter(centavos, moeda, data, CAMBIO_V4);       
       9 +  return c && [c.taxa.texto, c.dataCotacao, c.valorSolicitado];
      10 +}                                                              
      11 +                                                               
      12  describe('RN-017 — Moeda e conversão para reais', () => {
      13 +  it('RN-017 › e-002 (22,00 EUR em 14/07) → taxa 5.93, cotação 
         +2026-07-14, R$ 130,46', () => {                                
      14 +    expect(conversao(2200n, 'EUR', '2026-07-14')).toEqual(['5.9
         +3', '2026-07-14', 13046n]);                                    
      15 +  });                                                          
      16 +                                                               
      17 +  it('RN-017 › e-004 (30,00 EUR no sábado 18/07) → taxa 5.96 de
         + 2026-07-17, R$ 178,80', () => {                               
      18 +    expect(conversao(3000n, 'EUR', '2026-07-18')).toEqual(['5.9
         +6', '2026-07-17', 17880n]);                                    
      19 +    expect(conversao(3000n, 'EUR', '2026-07-19')).toEqual(['5.9
         +6', '2026-07-17', 17880n]);                                    
      20 +    expect(conversao(3000n, 'EUR', '2026-07-20')).toEqual(['6.0
         +1', '2026-07-20', 18030n]);                                    
      21 +  });                                                          
      22 +                                                               
      23 +  it('RN-017 › 10,05 USD em 13/07 × 5,42 = 54,471 → R$ 54,47', 
         +() => {                                                        
      24 +    expect(conversao(1005n, 'USD', '2026-07-13')).toEqual(['5.4
         +2', '2026-07-13', 5447n]);                                     
      25 +  });                                                          
      26 +                                                               
      27 +  it('RN-017 › 0,50 USD em 16/07 × 5,41 = 2,705 → R$ 2,70 (meio
         + para o par, AMB-037)', () => {                                
      28 +    expect(conversao(50n, 'USD', '2026-07-16')).toEqual(['5.41'
         +, '2026-07-16', 270n]);                                        
      29 +    // 0,70 USD × 5,45 = 3,815 → 3,82 (1 é ímpar, sobe)        
      30 +    expect(conversao(70n, 'USD', '2026-07-22')).toEqual(['5.45'
         +, '2026-07-22', 382n]);                                        
      31 +    // negativo também meio para o par                         
      32 +    expect(conversao(-50n, 'USD', '2026-07-16')).toEqual(['5.41
         +', '2026-07-16', -270n]);                                      
      33 +  });                                                          
      34 +                                                               
      35 +  it('RN-017 › EUR em 2026-07-10 (antes da primeira cotação) → 
         +sem conversão', () => {                                        
      36 +    expect(conversao(1000n, 'EUR', '2026-07-10')).toBeNull();  
      37 +    expect(conversao(1000n, 'EUR', '2026-07-12')).toBeNull();  
      38 +    expect(conversao(1000n, 'EUR', '2026-07-13')).toEqual(['5.9
         +1', '2026-07-13', 5910n]);                                     
      39 +  });                                                          
      40 +                                                               
      41 +  it('RN-017 › GBP e EURO (fora do câmbio) → sem conversão', ()
         + => {                                                          
      42 +    expect(conversao(5500n, 'GBP', '2026-07-21')).toBeNull();  
      43 +    expect(conversao(1000n, 'EURO', '2026-07-21')).toBeNull(); 
      44 +    expect(conversao(1000n, 'R$', '2026-07-21')).toBeNull();   
      45 +  });                                                          
      46 +                                                               
      47 +  it('RN-017 › BRL → taxa 1, data_cotacao nula, valor igual ao 
         +original', () => {                                             
      48 +    expect(conversao(8800n, 'BRL', '2026-07-27')).toEqual(['1',
         + null, 8800n]);                                                
      49 +    expect(conversao(-4500n, 'BRL', '1999-01-01')).toEqual(['1'
         +, null, -4500n]);                                              
      50 +  });                                                          
      51 +                                                               
      52 +  it('RN-017 › cotação antiga continua valendo: EUR em 2026-12-
         +31 usa a de 2026-07-28 (AMB-035)', () => {                     
      53 +    expect(conversao(1000n, 'EUR', '2026-12-31')).toEqual(['6.0
         +2', '2026-07-28', 6020n]);                                     
      54 +  });                                                          
      55 +                                                               
      56    it('RN-017 › câmbio: "usd" no arquivo é indexado como USD', (
          ) => {
      57      const c = lerCambio('{"moeda_base": "BRL", "taxas": {"2026-
          07-13": {"usd": 5.42, " Eur ": 5.91}}}');
      58      expect([...c.keys()]).toEqual(['USD', 'EUR']);

  Ran 1 shell command (ctrl+o to expand)

● One helper edit missed its anchor; adding CAMBIO_V4 next to POLITICA_V4.

● Update(tests\apoio.ts)
  ⎿  Added 3 lines
      29  /** Tabela de limites da fixture da v4. */
      30  export const POLITICA_V4 = lerPolitica(TEXTO_POLITICA_V4);
      31  
      32 +/** Câmbio da fixture da v4 (R-10: nunca `dados/`). */         
      33 +export const CAMBIO_V4 = lerCambio(readFileSync('exemplos/envel
         +ope/cambio.json', 'utf8'));                                    
      34 +                                                               
      35  /** Tabela de limites da fixture com `trocar` aplicado ao JSON 
          (ex.: um limite alterado). */
      36  export function politicaCom(trocar: (json: Record<string, any>)
           => void): Politica {
      37    const json = JSON.parse(TEXTO_POLITICA_V4);

  Ran 1 shell command (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      331    - **Aceite:** passam, em `tests/nucleo/rn-009-limites.test.t
           s`, `RN-009 › alimentação 80,00 no CC-COMERCIAL → APROVADO 80,
           00 (limite 90,00)` e `RN-009 › alimentação 50,00 no CC-ADM → P
           ARCIAL 45,00`; em `tests/nucleo/rn-010-parcial.test.ts`, `RN-0
           10 › CC-ENG-PLATAFORMA (75,00): d-001 72,50 → APROVADO 72,50 e
            d-002 38,00 → PARCIAL 2,50`; em `tests/nucleo/rn-011-viagem.t
           est.ts`, `RN-011 › CC-COMERCIAL: representacao 420,00 em dia d
           e viagem → APROVADO 420,00 (limite 450,00)` e `RN-011 › acrésc
           imo trocado para 20 na tabela: alimentação em dia de viagem te
           m limite 72,00`; em `tests/nucleo/rn-008-nota-fiscal.test.ts`,
            `RN-008 › limiar trocado para 150,00 na tabela: 120,00 sem NF
            não é recusada`
      332    - **Commit:** `45720a2`
      333  
      334 -- [ ] **T-054** — [P] Criar `src/nucleo/cambio.ts` (DT-007, R-
          -13, R-14): `converter(valorOriginal, moeda, data, cambio)` → `
          -Conversao | null`. `BRL` → `{ taxa: NumeroJson "1", dataCotaca
          -o: null, valorSolicitado: valorOriginal }`, sem olhar a data. 
          -Outra moeda → último elemento do índice com `data ≤ D` (busca 
          -binária, comparação de texto); `valorSolicitado = dividirMeioP
          -araPar(valorOriginal × taxa.digitos, 10^taxa.escala)`; sem cot
          -ação até D (ou moeda fora do índice) → `null`                 
      334 +- [x] **T-054** — [P] Criar `src/nucleo/cambio.ts` (DT-007, R-
          +13, R-14): `converter(valorOriginal, moeda, data, cambio)` → `
          +Conversao | null`. `BRL` → `{ taxa: NumeroJson "1", dataCotaca
          +o: null, valorSolicitado: valorOriginal }`, sem olhar a data. 
          +Outra moeda → último elemento do índice com `data ≤ D` (busca 
          +binária, comparação de texto); `valorSolicitado = dividirMeioP
          +araPar(valorOriginal × taxa.digitos, 10^taxa.escala)`; sem cot
          +ação até D (ou moeda fora do índice) → `null`                 
      335    - **Atende:** RN-017, RN-001, AMB-035, AMB-037
      336    - **Aceite:** em `tests/nucleo/rn-017-cambio.test.ts` passam
            `RN-017 › e-002 (22,00 EUR em 14/07) → taxa 5.93, cotação 202
           6-07-14, R$ 130,46`, `RN-017 › e-004 (30,00 EUR no sábado 18/0
           7) → taxa 5.96 de 2026-07-17, R$ 178,80`, `RN-017 › 10,05 USD 
           em 13/07 × 5,42 = 54,471 → R$ 54,47`, `RN-017 › 0,50 USD em 16
           /07 × 5,41 = 2,705 → R$ 2,70 (meio para o par, AMB-037)`, `RN-
           017 › EUR em 2026-07-10 (antes da primeira cotação) → sem conv
           ersão`, `RN-017 › GBP e EURO (fora do câmbio) → sem conversão`
           , `RN-017 › BRL → taxa 1, data_cotacao nula, valor igual ao or
           iginal` e `RN-017 › cotação antiga continua valendo: EUR em 20
           26-12-31 usa a de 2026-07-28 (AMB-035)`
      337 -  - **Commit:** `<hash preenchido depois>`                    
      337 +  - **Commit:** `6ae9e25`                                     
      338  
      339  - [ ] **T-055** — Validar `moeda` em `src/nucleo/despesa.ts` (
           estende T-008): ausente, nula, texto vazio ou só espaços → `"B
           RL"`; texto → `normalizarMoeda` (T-046), **sem checagem de for
           mato**; outro tipo (número, booleano, lista, objeto) → `DADO_I
           NVALIDO`. `DespesaValida` ganha `moeda`; `RecusaDadoInvalido` 
           ganha o eco bruto de `moeda` (ausente → `null`)
      340    - **Atende:** RN-003, AMB-036, AMB-023

● T-055 — validate moeda

  Ran 1 shell command (ctrl+o to expand)

● Update(src\nucleo\tipos.ts)
  ⎿  Added 8 lines, removed 1 line
      80  export type CodigoRecusa = Exclude<CodigoMotivo, CodigoLimite>;
      81  
      82  /** Por que a RN-003 recusou. */
      83 -export type ProblemaDado = 'nao_objeto' | 'ausente' | 'data_inv
         -alida' | 'nao_numerico' | 'nao_booleano' | 'repetido';         
      83 +export type ProblemaDado =                                     
      84 +  | 'nao_objeto'                                               
      85 +  | 'ausente'                                                  
      86 +  | 'data_invalida'                                            
      87 +  | 'nao_numerico'                                             
      88 +  | 'nao_booleano'                                             
      89 +  | 'nao_textual'                                              
      90 +  | 'repetido';                                                
      91  
      92  /** Recusa de uma etapa, com os dados para a descrição do motiv
          o (RN-013). */
      93  export type Recusa =

● Update(src\nucleo\tipos.ts)
  ⎿  Added 1 line, removed 1 line
      115  /** Recusa da RN-003: leva os ecos brutos e o valor, se numéri
           co (AMB-023). */
      116  export type RecusaDadoInvalido = Extract<Recusa, { codigo: 'DA
           DO_INVALIDO' }> & {
      117    /** Como vieram; ausente → `null`. */
      118 -  readonly eco: { readonly id: unknown; readonly data: unknown
          -; readonly categoria: unknown };                              
      118 +  readonly eco: { readonly id: unknown; readonly data: unknown
          +; readonly categoria: unknown; readonly moeda: unknown };     
      119    readonly valorSolicitado: Centavos | null;
      120  };
      121  

  Read 1 file (ctrl+o to expand)

● Update(src\nucleo\tipos.ts)
  ⎿  Added 2 lines
      50    readonly descricao: string;
      51    /** RN-003, AMB-026, RN-007. */
      52    readonly fornecedorChave: string;
      53 +  /** RN-003, AMB-036: normalizada; ausente, nula ou vazia → `B
         +RL`. */                                                        
      54 +  readonly moeda: Moeda;                                       
      55    /** RN-001. */
      56    readonly valorSolicitado: Centavos;
      57    /** RN-003. */

● Update(src\nucleo\despesa.ts)
  ⎿  Added 6 lines
      30    return null;
      31  }
      32  
      33 +/** `moeda`: vazio vale `BRL`; texto é normalizado, sem checar 
         +formato; outro tipo é inválido (`null`) (RN-003, AMB-036). */  
      34 +function lerMoeda(v: unknown): Moeda | null {                  
      35 +  if (v === undefined || v === null || (typeof v === 'string' &
         +& v.trim() === '')) return 'BRL';                              
      36 +  return typeof v === 'string' ? normalizarMoeda(v) : null;    
      37 +}                                                              
      38 +                                                               
      39  /** `tem_nota_fiscal`: só booleano; vazio vale `false`; o resto
           é inválido (`null`) (RN-003, AMB-022). */
      40  function lerNotaFiscal(v: unknown): boolean | null {
      41    if (typeof v === 'boolean') return v;

● Update(src\nucleo\despesa.ts)
  ⎿  Added 7 lines, removed 2 lines
      53    idsVistos: ReadonlySet<string> = new Set(),
      54  ): DespesaValida | RecusaDadoInvalido {
      55    if (!ehObjeto(bruta)) {
      56 -    return recusar({ id: null, data: null, categoria: null }, n
         -ull, 'despesa', 'nao_objeto');                                 
      56 +    return recusar({ id: null, data: null, categoria: null, moe
         +da: null }, null, 'despesa', 'nao_objeto');                    
      57    }
      58 -  const eco = { id: bruta.id ?? null, data: bruta.data ?? null,
         - categoria: bruta.categoria ?? null };                         
      58 +  const eco = {                                                
      59 +    id: bruta.id ?? null,                                      
      60 +    data: bruta.data ?? null,                                  
      61 +    categoria: bruta.categoria ?? null,                        
      62 +    moeda: bruta.moeda ?? null,                                
      63 +  };                                                           
      64    const valor = lerValor(bruta.valor);
      65    const { id, data, categoria } = bruta;
      66  

● Update(src\nucleo\despesa.ts)
  ⎿  Added 2 lines
      72    if (valor === null) return recusar(eco, valor, 'valor', 'nao_
          numerico');
      73    const temNotaFiscal = lerNotaFiscal(bruta.tem_nota_fiscal);
      74    if (temNotaFiscal === null) return recusar(eco, valor, 'tem_n
          ota_fiscal', 'nao_booleano');
      75 +  const moeda = lerMoeda(bruta.moeda);                         
      76 +  if (moeda === null) return recusar(eco, valor, 'moeda', 'nao_
         +textual');                                                     
      77    const idNormalizado = normalizar(id);
      78    if (idsVistos.has(idNormalizado)) return recusar(eco, valor, 
          'id', 'repetido');
      79  

● Update(src\nucleo\despesa.ts)
  ⎿  Added 1 line
      86      categoria: normalizar(categoria),
      87      descricao: comoTexto(bruta.descricao),
      88      fornecedorChave: normalizarFornecedor(comoTexto(bruta.forne
          cedor)),
      89 +    moeda,                                                     
      90      valorSolicitado: valor,
      91      temNotaFiscal,
      92    };

● Update(src\nucleo\despesa.ts)
  ⎿  Added 2 lines, removed 2 lines
       2  
       3  import { ehDataValida } from './datas.ts';
       4  import { paraCentavos } from './dinheiro.ts';
       5 -import { comoTexto, normalizar, normalizarFornecedor } from './
         -texto.ts';                                                     
       5 +import { comoTexto, normalizar, normalizarFornecedor, normaliza
         +rMoeda } from './texto.ts';                                    
       6  import { NumeroJson } from './tipos.ts';
       7 -import type { Centavos, DespesaValida, ProblemaDado, RecusaDado
         -Invalido } from './tipos.ts';                                  
       7 +import type { Centavos, DespesaValida, Moeda, ProblemaDado, Rec
         +usaDadoInvalido } from './tipos.ts';                           
       8  
       9  type Bruta = Readonly<Record<string, unknown>>;
      10  

● Update(src\nucleo\motor.ts)
  ⎿  Added 9 lines, removed 1 line
      69    return avaliacoes.map((a): ResultadoItem => {
      70      if (a.tipo === 'invalida') {
      71        const { eco, valorSolicitado } = a.recusa;
      72 -      return { ...eco, valorSolicitado, valorReembolsavel: 0n, 
         -motivo: montarMotivo(a.recusa), ...foraDoLimite };             
      72 +      return {                                                 
      73 +        id: eco.id,                                            
      74 +        data: eco.data,                                        
      75 +        categoria: eco.categoria,                              
      76 +        valorSolicitado,                                       
      77 +        valorReembolsavel: 0n,                                 
      78 +        motivo: montarMotivo(a.recusa),                        
      79 +        ...foraDoLimite,                                       
      80 +      };                                                       
      81      }
      82      if (a.tipo === 'recusada') {
      83        const d = a.despesa;

● Update(src\nucleo\motivos.ts)
  ⎿  Added 1 line
      30    data_invalida: () => "Campo 'data' não é uma data de calendár
          io válida no formato AAAA-MM-DD.",
      31    nao_numerico: () => "Campo 'valor' não é numérico.",
      32    nao_booleano: () => "Campo 'tem_nota_fiscal' não é booleano (
          true ou false).",
      33 +  nao_textual: (campo) => `Campo '${campo}' não é texto.`,     
      34    repetido: () => "O 'id' repete o de uma despesa anterior do a
          rquivo.",
      35  };
      36  

● Now the RN-003 tests for moeda.

● Update(tests\nucleo\rn-003-validacao.test.ts)
  ⎿  Added 1 line, removed 1 line
      82    it('RN-003 › item que não é objeto (42, "x", null) → DADO_INV
          ALIDO com ecos e valor_solicitado nulos', () => {
      83      for (const bruta of [lerJson('42'), 'x', null, lerJson('[1]
          ')]) {
      84        const r = recusada(validar(bruta));
      85 -      expect(r.eco).toEqual({ id: null, data: null, categoria: 
         -null });                                                       
      85 +      expect(r.eco).toEqual({ id: null, data: null, categoria: 
         +null, moeda: null });                                          
      86        expect(r.valorSolicitado).toBeNull();
      87      }
      88    });

● Update(tests\nucleo\rn-003-validacao.test.ts)
  ⎿  Added 34 lines
      160      }
      161    });
      162  
      163 +  it('RN-003 › "moeda": " eur " vale EUR', () => {            
      164 +    expect(valida(validar(despesa({ moeda: '" eur "' }))).moed
          +a).toBe('EUR');                                               
      165 +    expect(valida(validar(despesa({ moeda: '"Usd"' }))).moeda)
          +.toBe('USD');                                                 
      166 +  });                                                         
      167 +                                                              
      168 +  it('RN-003 › moeda ausente, null, "" ou "  " vale BRL', () =
          +> {                                                           
      169 +    for (const moeda of [undefined, 'null', '""', '"  "']) {  
      170 +      expect(valida(validar(despesa({ moeda }))).moeda, String
          +(moeda)).toBe('BRL');                                         
      171 +    }                                                         
      172 +    expect(valida(validar(despesa({ moeda: '"brl"' }))).moeda)
          +.toBe('BRL');                                                 
      173 +  });                                                         
      174 +                                                              
      175 +  it('RN-003 › "moeda": 978, true, [] ou {} → DADO_INVALIDO co
          +m a moeda como veio no eco', () => {                          
      176 +    for (const [moeda, eco] of [                              
      177 +      ['978', new NumeroJson('978')],                         
      178 +      ['true', true],                                         
      179 +      ['[]', []],                                             
      180 +      ['{}', {}],                                             
      181 +      ['false', false],                                       
      182 +    ] as const) {                                             
      183 +      const r = recusada(validar(despesa({ moeda })));        
      184 +      expect(r.detalhes, moeda).toEqual({ campo: 'moeda', prob
          +lema: 'nao_textual' });                                       
      185 +      expect(r.eco.moeda, moeda).toEqual(eco);                
      186 +      expect(r.valorSolicitado).toBe(4500n);                  
      187 +    }                                                         
      188 +    expect(recusada(validar(despesa({ data: '"2026-07-32"', mo
          +eda: undefined }))).eco.moeda).toBeNull();                    
      189 +    expect(recusada(validar(despesa({ data: '"2026-07-32"', mo
          +eda: '" eur "' }))).eco.moeda).toBe(' eur ');                 
      190 +  });                                                         
      191 +                                                              
      192 +  it('RN-003 › "moeda": "EURO" passa pela validação (moeda EUR
          +O)', () => {                                                  
      193 +    expect(valida(validar(despesa({ moeda: '"EURO"' }))).moeda
          +).toBe('EURO');                                               
      194 +    expect(valida(validar(despesa({ moeda: '" r$ "' }))).moeda
          +).toBe('R$');                                                 
      195 +  });                                                         
      196 +                                                              
      197    /** Valida em sequência, registrando os ids como o motor faz
           . */
      198    function emSequencia(...brutas: unknown[]): (DespesaValida |
            RecusaDadoInvalido)[] {
      199      const idsVistos = new Set<string>();
  Ran 3 shell commands (ctrl+o to expand)

● Classifier hiccup; retrying the commit.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      336    - **Aceite:** em `tests/nucleo/rn-017-cambio.test.ts` passam
            `RN-017 › e-002 (22,00 EUR em 14/07) → taxa 5.93, cotação 202
           6-07-14, R$ 130,46`, `RN-017 › e-004 (30,00 EUR no sábado 18/0
           7) → taxa 5.96 de 2026-07-17, R$ 178,80`, `RN-017 › 10,05 USD 
           em 13/07 × 5,42 = 54,471 → R$ 54,47`, `RN-017 › 0,50 USD em 16
           /07 × 5,41 = 2,705 → R$ 2,70 (meio para o par, AMB-037)`, `RN-
           017 › EUR em 2026-07-10 (antes da primeira cotação) → sem conv
           ersão`, `RN-017 › GBP e EURO (fora do câmbio) → sem conversão`
           , `RN-017 › BRL → taxa 1, data_cotacao nula, valor igual ao or
           iginal` e `RN-017 › cotação antiga continua valendo: EUR em 20
           26-12-31 usa a de 2026-07-28 (AMB-035)`
      337    - **Commit:** `6ae9e25`
      338  
      339 -- [ ] **T-055** — Validar `moeda` em `src/nucleo/despesa.ts` (
          -estende T-008): ausente, nula, texto vazio ou só espaços → `"B
          -RL"`; texto → `normalizarMoeda` (T-046), **sem checagem de for
          -mato**; outro tipo (número, booleano, lista, objeto) → `DADO_I
          -NVALIDO`. `DespesaValida` ganha `moeda`; `RecusaDadoInvalido` 
          -ganha o eco bruto de `moeda` (ausente → `null`)               
      339 +- [x] **T-055** — Validar `moeda` em `src/nucleo/despesa.ts` (
          +estende T-008): ausente, nula, texto vazio ou só espaços → `"B
          +RL"`; texto → `normalizarMoeda` (T-046), **sem checagem de for
          +mato**; outro tipo (número, booleano, lista, objeto) → `DADO_I
          +NVALIDO`. `DespesaValida` ganha `moeda`; `RecusaDadoInvalido` 
          +ganha o eco bruto de `moeda` (ausente → `null`)               
      340    - **Atende:** RN-003, AMB-036, AMB-023
      341    - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pas
           sam `RN-003 › "moeda": " eur " vale EUR`, `RN-003 › moeda ause
           nte, null, "" ou "  " vale BRL`, `RN-003 › "moeda": 978, true,
            [] ou {} → DADO_INVALIDO com a moeda como veio no eco` e `RN-
           003 › "moeda": "EURO" passa pela validação (moeda EURO)`
      342 -  - **Commit:** `<hash preenchido depois>`                    
      342 +  - **Commit:** `ab4116d`                                     
      343  
      344  - [ ] **T-056** — Ligar a conversão (etapas 1 e 6, DT-007): `v
           alidarDespesa` recebe o `Cambio` e `DespesaValida` troca `valo
           rSolicitado` por `valorOriginal` + `conversao` (T-054). `Recus
           aDadoInvalido` guarda `valorOriginal` (nulo se `valor` não num
           érico) e `conversao` (nula se `valor` não numérico, AMB-043; B
           RL com `valor` numérico e `data` inválida → taxa 1; estrangeir
           a com `data` inválida → nula). Em `elegibilidade.ts`: etapa 3 
           recusa `valorOriginal ≤ 0` ou valor em reais ≤ 0 (RN-004); nov
           a etapa 6 `verificarCambio` → `Recusa(CAMBIO_INDISPONIVEL)` co
           m `{ moeda, data }` quando `conversao` é nula, entre categoria
            e duplicata; etapa 8 compara o limiar com o valor em reais; a
            chave de duplicata usa `valorOriginal` (a moeda entra na T-05
           7). Parcelas, alocação e `total_solicitado` usam o valor em re
           ais. `ResultadoItem` ganha `moeda`, `valorOriginal` e `convers
           ao` (o `valor_solicitado` da saída sai de `conversao`). Código
            `CAMBIO_INDISPONIVEL` na união e um modelo simples em `motivo
           s.ts` (texto completo na T-060). `motor.calcular(entrada, poli
           tica, cambio)`; `src/cli.ts` lê o câmbio pelo `lerExternos`; `
           tests/apoio.ts` carrega o câmbio da fixture
      345    - **Atende:** RN-017, RN-001, RN-003, RN-004, RN-008, RN-012
           , RN-014, AMB-025, AMB-036, AMB-037, AMB-038, AMB-039, AMB-043

● T-056 — wire the conversion (steps 1 and 6)

  Types first.

  Read 1 file (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; node - <<'JS'
      const fs = require('fs');…)
  ⎿  Updated src\nucleo\tipos.ts (+26 -8)
      52    readonly fornecedorChave: string;
      53    /** RN-003, AMB-036: normalizada; ausente, nula ou vazia → `B
          RL`. */
      54    readonly moeda: Moeda;
      55 -  /** RN-001. */                                               
      56 -  readonly valorSolicitado: Centavos;                          
      55 +  /** RN-001, na moeda da despesa. */                          
      56 +  readonly valorOriginal: Centavos;                            
      57 +  /** Etapa 1 (RN-017, DT-007). `null` aqui só por falta de cot
         +ação (a recusa vem na etapa 6). */                             
      58 +  readonly conversao: Conversao | null;                        
      59    /** RN-003. */
      60    readonly temNotaFiscal: boolean;
      61  }
      62  
      61 -/** Despesa que passou das etapas 3 a 7, com a regra da sua cat
         -egoria na tabela aplicável. */                                 
      62 -export interface DespesaElegivel extends DespesaValida {       
      63 +/** Despesa que passou das etapas 3 a 8: com conversão e com a 
         +regra da sua categoria na tabela aplicável. */                 
      64 +export interface DespesaElegivel extends Omit<DespesaValida, 'c
         +onversao'> {                                                   
      65 +  readonly conversao: Conversao;                               
      66    readonly regra: RegraCategoria;
      67  }
      68  
     ...
      75    | 'VALOR_NAO_POSITIVO'
      76    | 'FORA_DO_PERIODO'
      77    | 'CATEGORIA_NAO_REEMBOLSAVEL'
      78 +  | 'CAMBIO_INDISPONIVEL'                                      
      79    | 'DUPLICATA'
      80    | 'NOTA_FISCAL_AUSENTE';
      81  
     ...
       98  /** Recusa de uma etapa, com os dados para a descrição do moti
           vo (RN-013). */
       99  export type Recusa =
      100    | { readonly codigo: 'DADO_INVALIDO'; readonly detalhes: { r
           eadonly campo: string; readonly problema: ProblemaDado } }
       97 -  | { readonly codigo: 'VALOR_NAO_POSITIVO'; readonly detalhes
          -: { readonly valor: Centavos } }                              
      101 +  | {                                                         
      102 +      readonly codigo: 'VALOR_NAO_POSITIVO';                  
      103 +      /** `emReais`: o valor convertido, quando há conversão (
          +RN-004). */                                                   
      104 +      readonly detalhes: { readonly valorOriginal: Centavos; r
          +eadonly moeda: Moeda; readonly emReais: Centavos | null };    
      105 +    }                                                         
      106    | {
      107        readonly codigo: 'FORA_DO_PERIODO';
      108        readonly detalhes: { readonly data: DataISO; readonly in
           icio: DataISO; readonly fim: DataISO };
     … 34 more lines (ctrl+o to expand)

● Now despesa.ts.

  Read 1 file (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; node - <<'JS'
      const fs = require('fs');…)
  ⎿  Updated src\nucleo\despesa.ts (+32 -18)
       1 -// Etapas 1 e 2 da seção 8: arredondamento, normalização e vali
         -dação (RN-001, RN-002, RN-003).                                
       1 +// Etapas 1 e 2 da seção 8: arredondamento, normalização, conve
         +rsão e validação                                               
       2 +// (RN-001, RN-002, RN-003, RN-017).                           
       3  
       4 +import { converter } from './cambio.ts';                       
       5  import { ehDataValida } from './datas.ts';
       6  import { paraCentavos } from './dinheiro.ts';
       7  import { comoTexto, normalizar, normalizarFornecedor, normaliza
          rMoeda } from './texto.ts';
       8  import { NumeroJson } from './tipos.ts';
       7 -import type { Centavos, DespesaValida, Moeda, ProblemaDado, Rec
         -usaDadoInvalido } from './tipos.ts';                           
       9 +import type { Cambio, Centavos, Conversao, DespesaValida, Moeda
         +, ProblemaDado, RecusaDadoInvalido } from './tipos.ts';        
      10  
      11  type Bruta = Readonly<Record<string, unknown>>;
      12  
     ...
      47  
      48  /**
      49   * Valida uma despesa bruta. `idsVistos` tem os ids normalizado
          s das despesas
      48 - * anteriores que passaram por esta validação (AMB-024, AMB-025
         -).                                                             
      50 + * anteriores que passaram por esta validação (AMB-024, AMB-025
         +). A conversão                                                 
      51 + * para reais é calculada antes, também para a despesa recusada
         + aqui (seção 4).                                               
      52   */
      53  export function validarDespesa(
      54    bruta: unknown,
      55    indice: number,
      53 -  idsVistos: ReadonlySet<string> = new Set(),                  
      56 +  idsVistos: ReadonlySet<string>,                              
      57 +  cambio: Cambio,                                              
      58  ): DespesaValida | RecusaDadoInvalido {
      59    if (!ehObjeto(bruta)) {
      56 -    return recusar({ id: null, data: null, categoria: null, moe
         -da: null }, null, 'despesa', 'nao_objeto');                    
      60 +    return recusar({ id: null, data: null, categoria: null, moe
         +da: null }, null, null, 'despesa', 'nao_objeto');              
      61    }
      62    const eco = {
      63      id: bruta.id ?? null,
     ...
      66      moeda: bruta.moeda ?? null,
      67    };
      68    const valor = lerValor(bruta.valor);
      69 +  const moeda = lerMoeda(bruta.moeda);                         
      70    const { id, data, categoria } = bruta;
      71  
     … 53 more lines (ctrl+o to expand)

● Now elegibilidade.ts: step 3 on original or BRL value, new step 6, NF in
  reais, duplicate key on valorOriginal.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; node - <<'JS'
      const fs = require('fs');…)
  ⎿  Updated src\nucleo\elegibilidade.ts (+24 -11)
       1 -// Etapas 3 a 7 da seção 8. Cada função devolve a recusa da eta
         -pa ou `null`;                                                  
       1 +// Etapas 3 a 8 da seção 8. Cada função devolve a recusa da eta
         +pa ou `null`;                                                  
       2  // a ordem das etapas vive só no `motor.ts` (DT-002).
       3  
       4  import type { Centavos, DataISO, Decimal, DespesaValida, Recusa
          , TabelaAplicavel } from './tipos.ts';
       5  
       6 -/** Etapa 3 (RN-004, AMB-012). */                              
       6 +/**                                                            
       7 + * Etapa 3 (RN-004, AMB-012): valor original ≤ 0, mesmo sem cot
         +ação, ou valor                                                 
       8 + * em reais que arredonda para ≤ 0.                            
       9 + */                                                            
      10  export function verificarValorPositivo(d: DespesaValida): Recus
          a | null {
       8 -  return d.valorSolicitado <= 0n                               
       9 -    ? { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valor: d.valo
         -rSolicitado } }                                                
      11 +  const emReais = d.conversao?.valorSolicitado ?? null;        
      12 +  return d.valorOriginal <= 0n || (emReais !== null && emReais 
         +<= 0n)                                                         
      13 +    ? { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valorOriginal
         +: d.valorOriginal, moeda: d.moeda, emReais } }                 
      14      : null;
      15  }
      16  
     ...
      45    };
      46  }
      47  
      48 +/** Etapa 6 (RN-017, AMB-036, AMB-039): sem cotação até a data.
         + */                                                            
      49 +export function verificarCambio(d: DespesaValida): Recusa | nul
         +l {                                                            
      50 +  return d.conversao === null ? { codigo: 'CAMBIO_INDISPONIVEL'
         +, detalhes: { moeda: d.moeda, data: d.data } } : null;         
      51 +}                                                              
      52 +                                                               
      53  /** Chave da RN-007 → `id` da primeira ocorrência. */
      54  export type ChavesDuplicata = Map<string, string>;
      55  
      56  /**
      48 - * Etapa 6 (RN-007, AMB-011, AMB-026): mesma data, categoria no
         -rmalizada,                                                     
      49 - * fornecedor (`trim` + minúsculas; vazio é um valor) e valor. 
         -A primeira                                                     
      50 - * ocorrência é registrada em `aceitas` e segue; as seguintes s
         -ão recusadas.                                                  
      57 + * Etapa 7 (RN-007, AMB-011, AMB-026): mesma data, categoria no
         +rmalizada,                                                     
      58 + * fornecedor (`trim` + minúsculas; vazio é um valor) e valor o
         +riginal. A                                                     
      59 + * primeira ocorrência é registrada em `aceitas` e segue; as se
         +guintes são recusadas.                                         
      60   */
      61  export function verificarDuplicata(d: DespesaValida, aceitas: C
          havesDuplicata): Recusa | null {
     … 21 more lines (ctrl+o to expand)

● Now diarias.ts, motivos.ts, and motor.ts.

  Ran 1 shell command (ctrl+o to expand)

● The heredoc got cut inside motivos.ts. Let me inspect.

  Read 1 file (ctrl+o to expand)

● JS String.replace treated $' in 'R$' as a special pattern and spliced text.
  Restoring motivos.ts from git and redoing those edits with the Edit tool.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; git checkout --
      src/nucleo/motivos.ts && git diff --stat && npm run typecheck 2>&1 | grep
      "src/" | head)
  ⎿  Updated src\nucleo\motivos.ts (+73 -121)
        1 -// Justificativa de cada item (RN-013): um modelo de texto por
          - código da seção 4.                                           
        2 -                                                              
        3 -import { formatarReais, formatarReaisDecimal } from './dinheir
          -o.ts';                                                        
        4 -import type { Categoria, Centavos, CodigoLimite, CodigoMotivo,
          - DecisaoLimite, Motivo, ProblemaDado, Recusa } from './tipos.t
          -s';                                                           
        5 -                                                              
        6 -/** O que decidiu o item: a recusa de uma etapa ou a decisão d
          -o limite. */                                                  
        7 -export type Decisao = Recusa | DecisaoLimite;                 
        8 -                                                              
        9 -type DetalhesDe<C extends CodigoMotivo> = C extends CodigoLimi
          -te                                                            
       10 -  ? DecisaoLimite['detalhes']                                 
       11 -  : Extract<Recusa, { codigo: C }>['detalhes'];               
       12 -                                                              
       13 -type Modelos = { [C in CodigoMotivo]: (detalhes: DetalhesDe<C>
          -) => string };                                                
       14 -                                                              
       15 -/** Só apresentação (R-15): categoria fora do mapa aparece pel
          -a própria chave. */                                           
       16 -const NOMES_CATEGORIA: Readonly<Record<string, string>> = {   
       17 -  alimentacao: 'alimentação',                                 
       18 -  transporte_urbano: 'transporte urbano',                     
       19 -  hospedagem: 'hospedagem',                                   
       20 -  representacao: 'representação',                             
       21 -};                                                            
       22 -                                                              
       23 -function nomeCategoria(categoria: Categoria): string {        
       24 -  return Object.hasOwn(NOMES_CATEGORIA, categoria) ? NOMES_CAT
          -EGORIA[categoria]! : categoria;                               
       25 -}                                                             
       26 -                                                              
       27 -const PROBLEMA: Record<ProblemaDado, (campo: string) => string
          -> = {                                                         
       28 -  nao_objeto: () => 'A despesa não é um objeto com os campos e
          -sperados.',                                                   
       29 -  ausente: (campo) => `Campo obrigatório '${campo}' ausente, v
          -azio ou com tipo diferente de texto.`,                        
       30 -  data_invalida: () => "Campo 'data' não é uma data de calendá
          -rio válida no formato AAAA-MM-DD.",                           
       31 -  nao_numerico: () => "Campo 'valor' não é numérico.",        
       32 -  nao_booleano: () => "Campo 'tem_nota_fiscal' não é booleano 
          -(true ou false).",                                            
       33 -  nao_textual: (campo) => `Campo '${campo}' não é texto.`,    
       34 -  repetido: () => "O 'id' repete o de uma despesa anterior do 
          -arquivo.",                                                    
       35 -};                                                            
       36 -                                                              
       37 -/** Valor na moeda da despesa: `R$ 45,00` em BRL, `EUR 22,00` 
          -nas demais. */                                                
       38 -function formatarValor(c: Centavos, moeda: string): string {  
       39 -  return moeda === 'BRL' ? formatarReais(c) : formatarReais(c)
          -.replace('R na periodicidade `diaria`, por diária e com o perí
          -odo das noites. */                                            
       40 -function limiteDoDia(d: DecisaoLimite['detalhes']): string {  
     … 154 more lines (ctrl+o to expand)

● Other files are fine. Redoing the motivos.ts edits.

● Update(src\nucleo\motivos.ts)
  ⎿  Added 5 lines, removed 1 line
      53      `${limiteDoDia(d)} já esgotado por despesas anteriores; sal
          do disponível ${formatarReais(d.saldoDisponivel)}; ${formatarRe
          ais(d.solicitado)} não reembolsado.`,
      54    DADO_INVALIDO: (d) => PROBLEMA[d.problema](d.campo),
      55    VALOR_NAO_POSITIVO: (d) =>
      56 -    `Valor solicitado ${formatarReais(d.valor)} não é positivo;
         - estornos e valores zerados não são reembolsados.`,            
      56 +    d.moeda === 'BRL' || d.valorOriginal <= 0n                 
      57 +      ? `Valor solicitado ${formatarValor(d.valorOriginal, d.mo
         +eda)} não é positivo; estornos e valores zerados não são reembo
         +lsados.`                                                       
      58 +      : `Valor solicitado ${formatarValor(d.valorOriginal, d.mo
         +eda)} convertido para ${formatarReais(d.emReais ?? 0n)} não é p
         +ositivo; valores zerados não são reembolsados.`,               
      59    FORA_DO_PERIODO: (d) => `Data ${d.data} fora do período de ${
          d.inicio} a ${d.fim}.`,
      60 +  CAMBIO_INDISPONIVEL: (d) =>                                  
      61 +    `Sem cotação de ${d.moeda} até ${d.data} no arquivo de câmb
         +io; o valor não pode ser convertido para reais.`,              
      62    CATEGORIA_NAO_REEMBOLSAVEL: (d) =>
      63      d.caso === 'limite_zero'
      64        ? `Categoria '${d.categoria}' não é reembolsável no centr
          o de custo ${d.centroCusto} (limite 0 na política ${d.versao}).
          `

● Update(src\nucleo\motivos.ts)
  ⎿  Added 5 lines
      34    repetido: () => "O 'id' repete o de uma despesa anterior do a
          rquivo.",
      35  };
      36  
      37 +/** Valor na moeda da despesa: `R$ 45,00` em BRL, `EUR 22,00` n
         +as demais. */                                                  
      38 +function formatarValor(c: Centavos, moeda: string): string {   
      39 +  return moeda === 'BRL' ? formatarReais(c) : `${moeda} ${forma
         +tarReais(c).replace('R$ ', '')}`;                              
      40 +}                                                              
      41 +                                                               
      42  /** Limite da categoria na data; na periodicidade `diaria`, por
           diária e com o período das noites. */
      43  function limiteDoDia(d: DecisaoLimite['detalhes']): string {
      44    const nome = nomeCategoria(d.categoria);

● Update(src\nucleo\motivos.ts)
  ⎿  Added 1 line, removed 1 line
      1  // Justificativa de cada item (RN-013): um modelo de texto por c
         ódigo da seção 4.
      2  
      3  import { formatarReais, formatarReaisDecimal } from './dinheiro.
         ts';
      4 -import type { Categoria, CodigoLimite, CodigoMotivo, DecisaoLimi
        -te, Motivo, ProblemaDado, Recusa } from './tipos.ts';           
      4 +import type { Categoria, Centavos, CodigoLimite, CodigoMotivo, D
        +ecisaoLimite, Motivo, ProblemaDado, Recusa } from './tipos.ts'; 
      5  
      6  /** O que decidiu o item: a recusa de uma etapa ou a decisão do 
         limite. */
      7  export type Decisao = Recusa | DecisaoLimite;

  Ran 1 shell command (ctrl+o to expand)

● Source compiles. Now updating the test helper and the tests that read the
  renamed fields.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; node - <<'JS'
      const fs = require('fs');…)
  ⎿  Updated tests\apoio.ts (+9 -6)
      14  import { tabelaAplicavel } from '../src/nucleo/politica.ts';
      15  import { statusDe } from '../src/nucleo/status.ts';
      16  import type {
      17 +  Cambio,                                                      
      18    DespesaElegivel,
      19    DespesaValida,
      20    Entrada,
     ...
      45    readonly periodo?: { inicio: string; fim: string };
      46    readonly centroCusto?: string | null;
      47    readonly politica?: Politica;
      48 +  readonly cambio?: Cambio;                                    
      49  }
      50  
      51  /** Tabela aplicável da fixture para as `opcoes` (sem centro de
           custo: a padrão). */
     ...
      73  
      74  /** `DespesaValida` a partir do padrão com `campos` trocados. *
          /
      75  export function valida(campos: Record<string, unknown> = {}, in
          dice = 0): DespesaValida {
      74 -  const r = validarDespesa(bruta(campos), indice);             
      76 +  const r = validarDespesa(bruta(campos), indice, new Set(), CA
         +MBIO_V4);                                                      
      77    expect('codigo' in r, JSON.stringify(r, (_k, v: unknown) => (
          typeof v === 'bigint' ? String(v) : v))).toBe(false);
      78    return r as DespesaValida;
      79  }
     ...
      112  }
      113  
      114  /** Resultado do motor para uma `Entrada` (com o centro de cus
           to dela), com a fixture da v4. */
      113 -export function calcularV4(e: Entrada, opcoes: Pick<Opcoes, 'p
          -olitica'> = {}): Resultado {                                  
      114 -  return calcular(e, opcoes.politica ?? POLITICA_V4);         
      115 +export function calcularV4(e: Entrada, opcoes: Pick<Opcoes, 'p
          +olitica' | 'cambio'> = {}): Resultado {                       
      116 +  return calcular(e, opcoes.politica ?? POLITICA_V4, opcoes.ca
          +mbio ?? CAMBIO_V4);                                           
      117  }
      118  
      119  /** Código de recusa de cada despesa na passada 1 do motor (`n
           ull` = elegível). */
      120  export function codigosPassada1(e: Entrada, opcoes: Opcoes = {
           }): (string | null)[] {
      119 -  return passada1(e, tabela(opcoes)).map((a) => (a.tipo === 'e
          -legivel' ? null : a.recusa.codigo));                          
      121 +  return passada1(e, tabela(opcoes), opcoes.cambio ?? CAMBIO_V
          +4).map((a) => (a.tipo === 'elegivel' ? null : a.recusa.codigo)
          +);                                                            
      122  }
      123  
      124  /** `DespesaElegivel` a partir do padrão com `campos` trocados
           , com a regra da tabela aplicável. */
     ...
      126    const d = valida(campos, indice);
      127    const regra = tabela(opcoes).categorias.get(d.categoria);
     … 15 more lines (ctrl+o to expand)
  ⎿  Updated tests\nucleo\rn-003-validacao.test.ts (+16 -16)
      3  import { registrarId, validarDespesa } from '../../src/nucleo/de
         spesa.ts';
      4  import { comoTexto } from '../../src/nucleo/texto.ts';
      5  import { NumeroJson } from '../../src/nucleo/tipos.ts';
      6 -import { codigosPassada1, cru, entrada } from '../apoio.ts';    
      6 +import { CAMBIO_V4, codigosPassada1, cru, entrada } from '../apo
        +io.ts';                                                         
      7  import type { DespesaValida, RecusaDadoInvalido } from '../../sr
         c/nucleo/tipos.ts';
      8  
      9  /** Despesa válida com os campos trocados por `trocas` (texto JS
         ON de cada valor; `undefined` remove o campo). */
     ...
      25  }
      26  
      27  function validar(bruta: unknown): DespesaValida | RecusaDadoInv
          alido {
      28 -  return validarDespesa(bruta, 0);                             
      28 +  return validarDespesa(bruta, 0, new Set(), CAMBIO_V4);       
      29  }
      30  
      31  function recusada(r: DespesaValida | RecusaDadoInvalido): Recus
          aDadoInvalido {
     ...
      54    it('RN-003 › "data": "2026-07-32" → DADO_INVALIDO com data "2
          026-07-32" no eco', () => {
      55      const r = recusada(validar(despesa({ data: '"2026-07-32"' }
          )));
      56      expect(r.eco.data).toBe('2026-07-32');
      57 -    expect(r.valorSolicitado).toBe(4500n);                     
      57 +    expect(r.valorOriginal).toBe(4500n);                       
      58    });
      59  
      60    it('RN-003 › id, data, categoria ou valor ausentes → DADO_INV
          ALIDO', () => {
     ...
      83      for (const bruta of [lerJson('42'), 'x', null, lerJson('[1]
          ')]) {
      84        const r = recusada(validar(bruta));
      85        expect(r.eco).toEqual({ id: null, data: null, categoria: 
          null, moeda: null });
      86 -      expect(r.valorSolicitado).toBeNull();                    
      86 +      expect(r.valorOriginal).toBeNull();                      
      87      }
      88    });
      89  
     ...
      104  
      105    it('RN-003 › "45.00", "45,00" e 45.00 dão valor_solicitado 4
           5,00', () => {
      106      for (const valor of ['"45.00"', '"45,00"', '45.00', '45', 
           '"45"']) {
      107 -      expect(valida(validar(despesa({ valor }))).valorSolicita
          -do, valor).toBe(4500n);                                       
      107 +      expect(valida(validar(despesa({ valor }))).valorOriginal
          +, valor).toBe(4500n);                                         
      108      }
      109 -    expect(valida(validar(despesa({ valor: '"33,333"' }))).val
          -orSolicitado).toBe(3333n);                                    
      109 +    expect(valida(validar(despesa({ valor: '"33,333"' }))).val
          +orOriginal).toBe(3333n);                                      
     … 66 more lines (ctrl+o to expand)
  ⎿  Updated tests\nucleo\rn-004-valor-nao-positivo.test.ts (+1 -1)
      14  
      15    it('RN-004 › -0.004 arredonda para 0,00 → VALOR_NAO_POSITIVO'
          , () => {
      16      const d = valida({ valor: -0.004 });
      17 -    expect(d.valorSolicitado).toBe(0n);                        
      17 +    expect(d.valorOriginal).toBe(0n);                          
      18      expect(verificarValorPositivo(d)?.codigo).toBe('VALOR_NAO_P
          OSITIVO');
      19    });
      20  
  ⎿  Updated tests\nucleo\rn-008-nota-fiscal.test.ts (+1 -1)
      21  
      22    it('RN-008 › 100.004 arredonda para 100,00 e não exige nota f
          iscal', () => {
      23      const d = valida({ ...semNf, valor: 100.004 });
      24 -    expect(d.valorSolicitado).toBe(10000n);                    
      24 +    expect(d.conversao?.valorSolicitado).toBe(10000n);         
      25      expect(verificarNotaFiscal(d, TABELA_PADRAO)).toBeNull();
      26    });
      27  
  ⎿  Updated tests\nucleo\rn-013-motivos.test.ts (+3 -1)
      21    { codigo: 'LIMITE_DIARIO_EXCEDIDO', detalhes: LIMITE },
      22    { codigo: 'LIMITE_DIARIO_ESGOTADO', detalhes: { ...LIMITE, sa
          ldoDisponivel: 0n, reembolsavel: 0n } },
      23    { codigo: 'DADO_INVALIDO', detalhes: { campo: 'data', problem
          a: 'data_invalida' } },
      24 -  { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valor: -4500n } }
         -,                                                              
      24 +  { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valorOriginal: -4
         +500n, moeda: 'BRL', emReais: -4500n } },                       
      25 +  { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valorOriginal: 1n
         +, moeda: 'XYZ', emReais: 0n } },                               
      26 +  { codigo: 'CAMBIO_INDISPONIVEL', detalhes: { moeda: 'GBP', da
         +ta: '2026-07-21' } },                                          
      27    { codigo: 'FORA_DO_PERIODO', detalhes: { data: '2026-04-15', 
          inicio: '2026-07-01', fim: '2026-07-31' } },
      28    {
      29      codigo: 'CATEGORIA_NAO_REEMBOLSAVEL',

● Existing suite green. Now the T-056 acceptance tests.

● Update(tests\nucleo\rn-017-cambio.test.ts)
  ⎿  Added 52 lines
       53      expect(conversao(1000n, 'EUR', '2026-12-31')).toEqual(['6.
           02', '2026-07-28', 6020n]);
       54    });
       55  
       56 +  /** `[código, valor em reais, reembolsável]` de cada item pe
          +lo motor. */                                                  
       57 +  function motor(despesas: Record<string, unknown>[], opcoes: 
          +Opcoes = {}) {                                                
       58 +    return rodar(despesas, opcoes).map((i) => [i.motivo.codigo
          +, i.valorSolicitado, i.valorReembolsavel]);                   
       59 +  }                                                           
       60 +                                                              
       61 +  it('RN-017 › e-006 (55,00 GBP) → CAMBIO_INDISPONIVEL, valor_
          +solicitado nulo', () => {                                     
       62 +    const e006 = { id: 'e-006', data: '2026-07-21', categoria:
          + 'representacao', valor: 55, moeda: 'GBP' };                  
       63 +    const [i] = rodar([e006], { centroCusto: 'CC-COMERCIAL' })
          +;                                                             
       64 +    expect(i).toMatchObject({ moeda: 'GBP', valorOriginal: 550
          +0n, conversao: null, valorSolicitado: null, valorReembolsavel:
          + 0n });                                                       
       65 +    expect(i?.motivo.codigo).toBe('CAMBIO_INDISPONIVEL');     
       66 +    expect(statusDe(i!)).toBe('RECUSADO');                    
       67 +  });                                                         
       68 +                                                              
       69 +  it('RN-017 › 10,00 "EURO" → CAMBIO_INDISPONIVEL, e não DADO_
          +INVALIDO', () => {                                            
       70 +    expect(motor([{ valor: 10, moeda: 'EURO' }])).toEqual([['C
          +AMBIO_INDISPONIVEL', null, 0n]]);                             
       71 +    expect(rodar([{ valor: 10, moeda: ' euro ' }])[0]?.moeda).
          +toBe('EURO');                                                 
       72 +  });                                                         
       73 +                                                              
       74 +  it('RN-017 › EUR em 2026-07-10 → CAMBIO_INDISPONIVEL', () =>
          + {                                                            
       75 +    expect(motor([{ data: '2026-07-10', valor: 10, moeda: 'EUR
          +' }])).toEqual([['CAMBIO_INDISPONIVEL', null, 0n]]);          
       76 +    expect(motor([{ data: '2026-07-13', valor: 10, moeda: 'EUR
          +' }])).toEqual([['APROVADO_INTEGRAL', 5910n, 5910n]]);        
       77 +  });                                                         
       78 +                                                              
       79 +  it('RN-017 › EUR em 2026-06-30 num período de julho → FORA_D
          +O_PERIODO, e não CAMBIO_INDISPONIVEL', () => {                
       80 +    const [i] = rodar([{ data: '2026-06-30', valor: 10, moeda:
          + 'EUR' }]);                                                   
       81 +    expect(i?.motivo.codigo).toBe('FORA_DO_PERIODO');         
       82 +    // sem cotação até a data: os três campos de conversão nul
          +os (seção 4)                                                  
       83 +    expect(i).toMatchObject({ conversao: null, valorSolicitado
          +: null, valorOriginal: 1000n });                              
       84 +    // com cotação, o recusado antes do câmbio sai convertido 
       85 +    const [j] = rodar([{ data: '2026-08-03', valor: 10, moeda:
          + 'EUR' }]);                                                   
       86 +    expect(j?.motivo.codigo).toBe('FORA_DO_PERIODO');         
       87 +    expect(j?.conversao).toMatchObject({ dataCotacao: '2026-07
          +-28', valorSolicitado: 6020n });                              
       88 +  });                                                         
       89 +                                                              
       90 +  it('RN-017 › GBP com categoria coworking → CATEGORIA_NAO_REE
          +MBOLSAVEL (etapa 5 antes da 6)', () => {                      
       91 +    expect(motor([{ categoria: 'coworking', valor: 55, moeda: 
          +'GBP' }])).toEqual([['CATEGORIA_NAO_REEMBOLSAVEL', null, 0n]])
          +;                                                             
       92 +  });                                                         
       93 +                                                              
       94 +  it('RN-017 › e-010 (sem moeda) → BRL, taxa_cambio 1', () => 
          +{                                                             
       95 +    const e010 = { id: 'e-010', data: '2026-07-27', valor: 88,
          + fornecedor: 'Bistro Central', moeda: undefined };            
       96 +    const [i] = rodar([e010], { centroCusto: 'CC-COMERCIAL' })
          +;                                                             
       97 +    expect(i).toMatchObject({ moeda: 'BRL', valorOriginal: 880
          +0n, valorSolicitado: 8800n, valorReembolsavel: 8800n });      
       98 +    expect(i?.conversao).toEqual({ taxa: expect.objectContaini
          +ng({ texto: '1' }), dataCotacao: null, valorSolicitado: 8800n 
          +});                                                           
       99 +  });                                                         
      100 +                                                              
      101 +  it('RN-017 › limite compara o valor em reais: 22,00 EUR (R$ 
          +130,46) de alimentação na tabela padrão → PARCIAL 60,00', () =
          +> {                                                           
      102 +    expect(motor([{ data: '2026-07-14', valor: 22, moeda: 'EUR
          +' }])).toEqual([['LIMITE_DIARIO_EXCEDIDO', 13046n, 6000n]]);  
      103 +    const [i] = rodar([{ data: '2026-07-14', valor: 22, moeda:
          + 'EUR' }]);                                                   
      104 +    expect(i?.valorOriginal).toBe(2200n);                     
      105 +    expect(statusDe(i!)).toBe('PARCIAL');                     
      106 +  });                                                         
      107 +                                                              
      108    it('RN-017 › câmbio: "usd" no arquivo é indexado como USD', 
           () => {
      109      const c = lerCambio('{"moeda_base": "BRL", "taxas": {"2026
           -07-13": {"usd": 5.42, " Eur ": 5.91}}}');
      110      expect([...c.keys()]).toEqual(['USD', 'EUR']);

● Update(tests\nucleo\rn-017-cambio.test.ts)
  ⎿  Added 3 lines, removed 1 line
      1  import { describe, expect, it } from 'vitest';
      2  import { lerCambio } from '../../src/io/cambio.ts';
      3  import { converter } from '../../src/nucleo/cambio.ts';
      4 -import { CAMBIO_V4 } from '../apoio.ts';                        
      4 +import { statusDe } from '../../src/nucleo/status.ts';          
      5 +import { CAMBIO_V4, rodar } from '../apoio.ts';                 
      6 +import type { Opcoes } from '../apoio.ts';                      
      7  
      8  /** `[taxa, data da cotação, valor em reais]` da conversão, ou `
         null`. */
      9  function conversao(centavos: bigint, moeda: string, data: string
         ) {

● Update(tests\nucleo\rn-004-valor-nao-positivo.test.ts)
  ⎿  Added 17 lines
      27      expect(codigosPassada1(entrada([{ categoria: 'coworking', v
          alor: 0 }]))).toEqual(['VALOR_NAO_POSITIVO']);
      28    });
      29  
      30 +  it('RN-004 › −10,00 GBP (sem cotação) → VALOR_NAO_POSITIVO', 
         +() => {                                                        
      31 +    const [i] = rodar([{ valor: -10, moeda: 'GBP' }]);         
      32 +    expect(i?.motivo.codigo).toBe('VALOR_NAO_POSITIVO');       
      33 +    expect(i).toMatchObject({ valorOriginal: -1000n, conversao:
         + null, valorSolicitado: null, valorReembolsavel: 0n });        
      34 +    expect(codigosPassada1(entrada([{ valor: -10, moeda: 'GBP',
         + data: '2026-06-30' }]))).toEqual(['VALOR_NAO_POSITIVO']);     
      35 +  });                                                          
      36 +                                                               
      37 +  it('RN-004 › 0,01 numa moeda de taxa 0.20 → R$ 0,00 → VALOR_N
         +AO_POSITIVO', () => {                                          
      38 +    const cambio = lerCambio('{"moeda_base": "BRL", "taxas": {"
         +2026-07-01": {"XYZ": 0.20}}}');                                
      39 +    const [i, j] = rodar([{ valor: 0.01, moeda: 'XYZ' }, { valo
         +r: 0.03, moeda: 'XYZ', fornecedor: 'Y' }], { cambio });        
      40 +    expect(i?.motivo.codigo).toBe('VALOR_NAO_POSITIVO');       
      41 +    expect(i).toMatchObject({ valorOriginal: 1n, valorSolicitad
         +o: 0n, valorReembolsavel: 0n });                               
      42 +    expect(i?.motivo.descricao).toMatch(/XYZ 0,01 convertido pa
         +ra R\$ 0,00/);                                                 
      43 +    // 0,03 × 0,20 = 0,006 → R$ 0,01, positivo                 
      44 +    expect(j).toMatchObject({ valorSolicitado: 1n, valorReembol
         +savel: 1n });                                                  
      45 +  });                                                          
      46 +                                                               
      47    it('RN-004 › d-009 não afeta as despesas de transporte de 202
          6-07-11', () => {
      48      const transporte = { categoria: 'transporte_urbano', data: 
          '2026-07-11', tem_nota_fiscal: false };
      49      expect(
● Update(tests\nucleo\rn-004-valor-nao-positivo.test.ts)
  ⎿  Added 2 lines, removed 1 line
      1  import { describe, expect, it } from 'vitest';
      2  import { verificarValorPositivo } from '../../src/nucleo/elegibi
         lidade.ts';
      3 -import { codigosPassada1, decisoes, entrada, valida } from '../a
        -poio.ts';                                                       
      3 +import { lerCambio } from '../../src/io/cambio.ts';             
      4 +import { codigosPassada1, decisoes, entrada, rodar, valida } fro
        +m '../apoio.ts';                                                
      5  
      6  describe('RN-004 — Valores não positivos', () => {
      7    it('RN-004 › d-009 (−45,00) → RECUSADO VALOR_NAO_POSITIVO, ree
         mbolsável 0,00', () => {

● Update(tests\nucleo\rn-008-nota-fiscal.test.ts)
  ⎿  Added 16 lines
      37      expect(verificarNotaFiscal(valida({ ...semNf, valor: 100.01
           }), tabelaFina)?.codigo).toBe('NOTA_FISCAL_AUSENTE');
      38    });
      39  
      40 +  it('RN-008 › e-005 (40,00 USD × 5,50 = R$ 220,00, sem NF) → N
         +OTA_FISCAL_AUSENTE', () => {                                   
      41 +    const e005 = { ...semNf, id: 'e-005', data: '2026-07-20', v
         +alor: 40, moeda: 'USD' };                                      
      42 +    const d = valida(e005);                                    
      43 +    expect(verificarNotaFiscal(d, TABELA_PADRAO)).toEqual({    
      44 +      codigo: 'NOTA_FISCAL_AUSENTE',                           
      45 +      detalhes: { valor: 22000n, limiar: { digitos: 10000n, esc
         +ala: 2 } },                                                    
      46 +    });                                                        
      47 +    expect(decisoes([e005], { centroCusto: 'CC-COMERCIAL' })).t
         +oEqual([['RECUSADO', 'NOTA_FISCAL_AUSENTE', 0n]]);             
      48 +  });                                                          
      49 +                                                               
      50 +  it('RN-008 › e-003 (14,50 EUR × 5,88 = R$ 85,26, sem NF) não 
         +é recusada por nota fiscal', () => {                           
      51 +    const e003 = { id: 'e-003', data: '2026-07-15', categoria: 
         +'alimentacao', valor: 14.5, moeda: 'EUR', tem_nota_fiscal: fals
         +e };                                                           
      52 +    expect(verificarNotaFiscal(valida(e003), TABELA_PADRAO)).to
         +BeNull();                                                      
      53 +    expect(decisoes([e003], { centroCusto: 'CC-COMERCIAL' })).t
         +oEqual([['APROVADO', 'APROVADO_INTEGRAL', 8526n]]);            
      54 +  });                                                          
      55 +                                                               
      56    it('RN-008 › dia de viagem não amplia o limiar de nota fiscal
          ', () => {
      57      const hotel = { categoria: 'hospedagem', valor: 200, descri
          cao: 'Hotel', fornecedor: 'Hotel' };
      58      expect(decisoes([hotel, { ...semNf, valor: 110 }, { ...semN
          f, valor: 100, fornecedor: 'Outro' }]).slice(1)).toEqual([

● Update(tests\nucleo\rn-012-diarias.test.ts)
  ⎿  Added 11 lines
      109      ]);
      110    });
      111  
      112 +  it('RN-012 › parcelas em reais: 100,00 USD em 13/07 (R$ 542,
          +00) "2 diarias" → 271,00 + 271,00 → PARCIAL 500,00', () => {  
      113 +    const hotel = { categoria: 'hospedagem', data: '2026-07-13
          +', descricao: 'Hotel NY - 2 diarias', valor: 100, moeda: 'USD'
          + };                                                           
      114 +    expect(parcelas(hotel)).toEqual([                         
      115 +      ['2026-07-13', 27100n],                                 
      116 +      ['2026-07-14', 27100n],                                 
      117 +    ]);                                                       
      118 +    const [i] = rodar([hotel]);                               
      119 +    expect(i).toMatchObject({ valorOriginal: 10000n, valorSoli
          +citado: 54200n, valorReembolsavel: 50000n, diarias: 2 });     
      120 +    expect(i?.motivo.codigo).toBe('LIMITE_DIARIO_EXCEDIDO');  
      121 +  });                                                         
      122 +                                                              
      123    it('RN-012 › diarias só é preenchido em hospedagem que chego
           u ao limite; limite e em_viagem nulos nas recusadas', () => {
      124      const itens = rodar([
      125        { categoria: 'hospedagem', descricao: '3 noites', valor:
            300 },

● Update(tests\nucleo\rn-014-resumo.test.ts)
  ⎿  Added 20 lines
      33      expect(resumo.totalNaoReembolsado).toBe(6050n);
      34    });
      35  
      36 +  it('RN-014 › total_solicitado soma o valor em reais e ignora 
         +CAMBIO_INDISPONIVEL (nulo)', () => {                           
      37 +    const { itens, resumo } = calcularV4(                      
      38 +      entrada([                                                
      39 +        { data: '2026-07-14', valor: 22, moeda: 'EUR' }, // R$ 
         +130,46 → 60,00                                                 
      40 +        { data: '2026-07-21', valor: 55, moeda: 'GBP' }, // sem
         + cotação                                                       
      41 +        { data: '2026-07-10', valor: 10, moeda: 'EUR', forneced
         +or: 'Y' }, // antes da 1ª cotação                              
      42 +        { data: '2026-07-27', valor: 30, fornecedor: 'Z' }, // 
         +BRL                                                            
      43 +      ]),                                                      
      44 +    );                                                         
      45 +    expect(itens.map((i) => i.motivo.codigo)).toEqual([        
      46 +      'LIMITE_DIARIO_EXCEDIDO',                                
      47 +      'CAMBIO_INDISPONIVEL',                                   
      48 +      'CAMBIO_INDISPONIVEL',                                   
      49 +      'APROVADO_INTEGRAL',                                     
      50 +    ]);                                                        
      51 +    expect(resumo.totalSolicitado).toBe(13046n + 3000n);       
      52 +    expect(resumo.totalReembolsavel).toBe(6000n + 3000n);      
      53 +    expect(resumo.totalNaoReembolsado).toBe(7046n);            
      54 +  });                                                          
      55 +                                                               
      56    it('RN-014 › lista vazia → contagens 0 e totais 0,00', () => 
          {
      57      expect(calcularV4(entrada([])).resumo).toEqual({
      58        quantidadeItens: 0,

● Now the five RN-003 tests for T-056.

● Update(tests\nucleo\rn-003-validacao.test.ts)
  ⎿  Added 50 lines
      245      expect(codigosPassada1(e)).toEqual([null, 'DADO_INVALIDO',
            'DADO_INVALIDO', 'CATEGORIA_NAO_REEMBOLSAVEL', 'DUPLICATA']);
      246    });
      247  
      248 +  it('RN-003 › id de despesa recusada por CAMBIO_INDISPONIVEL 
          +continua reservado (AMB-025)', () => {                        
      249 +    const e = entrada([                                       
      250 +      { id: 'd-001', valor: 10, moeda: 'GBP' },               
      251 +      { id: 'd-001', valor: 10 },                             
      252 +    ]);                                                       
      253 +    expect(codigosPassada1(e)).toEqual(['CAMBIO_INDISPONIVEL',
          + 'DADO_INVALIDO']);                                           
      254 +  });                                                         
      255 +                                                              
      256 +  it('RN-003 › valor inválido: valor_original e os três campos
          + de conversão nulos, mesmo em BRL ou com cotação (AMB-043)', (
          +) => {                                                        
      257 +    for (const moeda of [undefined, '"BRL"', '"EUR"']) {      
      258 +      for (const valor of ['"R$ 45,00"', 'true', undefined]) {
      259 +        const r = recusada(validar(despesa({ data: '"2026-07-1
          +4"', valor, moeda })));                                       
      260 +        expect(r.valorOriginal, `${moeda} ${valor}`).toBeNull(
          +);                                                            
      261 +        expect(r.conversao, `${moeda} ${valor}`).toBeNull();  
      262 +      }                                                       
      263 +    }                                                         
      264 +    const [i] = rodar([{ data: '2026-07-14', valor: 'R$ 45,00'
          +, moeda: 'EUR' }]);                                           
      265 +    expect(i).toMatchObject({ moeda: 'EUR', valorOriginal: nul
          +l, conversao: null, valorSolicitado: null });                 
      266 +  });                                                         
      267 +                                                              
      268 +  it('RN-003 › BRL com valor numérico e data inválida → DADO_I
          +NVALIDO com taxa 1 e valor_solicitado preenchido', () => {    
      269 +    for (const data of ['"2026-07-32"', 'null', undefined]) { 
      270 +      const r = recusada(validar(despesa({ data, moeda: undefi
          +ned })));                                                     
      271 +      expect(r.valorOriginal, String(data)).toBe(4500n);      
      272 +      expect(r.conversao, String(data)).toEqual({ taxa: new Nu
          +meroJson('1'), dataCotacao: null, valorSolicitado: 4500n });  
      273 +    }                                                         
      274 +    const [i] = rodar([{ data: '2026-07-32', moeda: 'brl' }]);
      275 +    expect(i).toMatchObject({ moeda: 'brl', valorOriginal: 450
          +0n, valorSolicitado: 4500n });                                
      276 +  });                                                         
      277 +                                                              
      278 +  it('RN-003 › EUR com valor numérico e data inválida → DADO_I
          +NVALIDO com conversão nula', () => {                          
      279 +    for (const data of ['"2026-07-32"', 'null', '"14/07/2026"'
          +]) {                                                          
      280 +      const r = recusada(validar(despesa({ data, moeda: '"EUR"
          +' })));                                                       
      281 +      expect(r.valorOriginal, data).toBe(4500n);              
      282 +      expect(r.conversao, data).toBeNull();                   
      283 +    }                                                         
      284 +    // moeda não textual também anula a conversão             
      285 +    expect(recusada(validar(despesa({ moeda: '978' }))).conver
          +sao).toBeNull();                                              
      286 +  });                                                         
      287 +                                                              
      288 +  it('RN-003 › DADO_INVALIDO por outro campo, EUR com cotação 
          +→ valor_solicitado convertido', () => {                       
      289 +    const r = recusada(validar(despesa({ data: '"2026-07-14"',
          + valor: '22', moeda: '"eur"', tem_nota_fiscal: '"sim"' })));  
      290 +    expect(r.detalhes.campo).toBe('tem_nota_fiscal');         
      291 +    expect(r.conversao).toEqual({ taxa: new NumeroJson('5.93')
          +, dataCotacao: '2026-07-14', valorSolicitado: 13046n });      
      292 +    const [i] = rodar([{ id: '', data: '2026-07-18', valor: 30
          +, moeda: 'EUR' }]);                                           
      293 +    expect(i?.motivo.codigo).toBe('DADO_INVALIDO');           
      294 +    expect(i).toMatchObject({ valorOriginal: 3000n, valorSolic
          +itado: 17880n });                                             
      295 +    expect(i?.conversao?.dataCotacao).toBe('2026-07-17');     
      296 +  });                                                         
      297 +                                                              
      298    it('RN-003 › id de despesa recusada por FORA_DO_PERIODO cont
           inua reservado (AMB-025)', () => {
      299      const e = entrada([
      300        { id: 'd-001', data: '2026-06-30' },

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; perl -pi -e "s#^import \{
      CAMBIO_V4, codigosPassada1, cru, entrada \} from '\.\./apoio\.ts';#import
      { CAMBIO_V4,…)
  ⎿  Updated tests\nucleo\rn-003-validacao.test.ts (+1 -1)
      3  import { registrarId, validarDespesa } from '../../src/nucleo/de
         spesa.ts';
      4  import { comoTexto } from '../../src/nucleo/texto.ts';
      5  import { NumeroJson } from '../../src/nucleo/tipos.ts';
      6 -import { CAMBIO_V4, codigosPassada1, cru, entrada } from '../apo
        -io.ts';                                                         
      6 +import { CAMBIO_V4, codigosPassada1, cru, entrada, rodar } from 
        +'../apoio.ts';                                                  
      7  import type { DespesaValida, RecusaDadoInvalido } from '../../sr
         c/nucleo/tipos.ts';
      8  
      9  /** Despesa válida com os campos trocados por `trocas` (texto JS
         ON de cada valor; `undefined` remove o campo). */

● All T-056 tests pass. Committing.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      341    - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pas
           sam `RN-003 › "moeda": " eur " vale EUR`, `RN-003 › moeda ause
           nte, null, "" ou "  " vale BRL`, `RN-003 › "moeda": 978, true,
            [] ou {} → DADO_INVALIDO com a moeda como veio no eco` e `RN-
           003 › "moeda": "EURO" passa pela validação (moeda EURO)`
      342    - **Commit:** `ab4116d`
      343  
      344 -- [ ] **T-056** — Ligar a conversão (etapas 1 e 6, DT-007): `v
          -alidarDespesa` recebe o `Cambio` e `DespesaValida` troca `valo
          -rSolicitado` por `valorOriginal` + `conversao` (T-054). `Recus
          -aDadoInvalido` guarda `valorOriginal` (nulo se `valor` não num
          -érico) e `conversao` (nula se `valor` não numérico, AMB-043; B
          -RL com `valor` numérico e `data` inválida → taxa 1; estrangeir
          -a com `data` inválida → nula). Em `elegibilidade.ts`: etapa 3 
          -recusa `valorOriginal ≤ 0` ou valor em reais ≤ 0 (RN-004); nov
          -a etapa 6 `verificarCambio` → `Recusa(CAMBIO_INDISPONIVEL)` co
          -m `{ moeda, data }` quando `conversao` é nula, entre categoria
          - e duplicata; etapa 8 compara o limiar com o valor em reais; a
          - chave de duplicata usa `valorOriginal` (a moeda entra na T-05
          -7). Parcelas, alocação e `total_solicitado` usam o valor em re
          -ais. `ResultadoItem` ganha `moeda`, `valorOriginal` e `convers
          -ao` (o `valor_solicitado` da saída sai de `conversao`). Código
          - `CAMBIO_INDISPONIVEL` na união e um modelo simples em `motivo
          -s.ts` (texto completo na T-060). `motor.calcular(entrada, poli
          -tica, cambio)`; `src/cli.ts` lê o câmbio pelo `lerExternos`; `
          -tests/apoio.ts` carrega o câmbio da fixture                   
      344 +- [x] **T-056** — Ligar a conversão (etapas 1 e 6, DT-007): `v
          +alidarDespesa` recebe o `Cambio` e `DespesaValida` troca `valo
          +rSolicitado` por `valorOriginal` + `conversao` (T-054). `Recus
          +aDadoInvalido` guarda `valorOriginal` (nulo se `valor` não num
          +érico) e `conversao` (nula se `valor` não numérico, AMB-043; B
          +RL com `valor` numérico e `data` inválida → taxa 1; estrangeir
          +a com `data` inválida → nula). Em `elegibilidade.ts`: etapa 3 
          +recusa `valorOriginal ≤ 0` ou valor em reais ≤ 0 (RN-004); nov
          +a etapa 6 `verificarCambio` → `Recusa(CAMBIO_INDISPONIVEL)` co
          +m `{ moeda, data }` quando `conversao` é nula, entre categoria
          + e duplicata; etapa 8 compara o limiar com o valor em reais; a
          + chave de duplicata usa `valorOriginal` (a moeda entra na T-05
          +7). Parcelas, alocação e `total_solicitado` usam o valor em re
          +ais. `ResultadoItem` ganha `moeda`, `valorOriginal` e `convers
          +ao` (o `valor_solicitado` da saída sai de `conversao`). Código
          + `CAMBIO_INDISPONIVEL` na união e um modelo simples em `motivo
          +s.ts` (texto completo na T-060). `motor.calcular(entrada, poli
          +tica, cambio)`; `src/cli.ts` lê o câmbio pelo `lerExternos`; `
          +tests/apoio.ts` carrega o câmbio da fixture                   
      345    - **Atende:** RN-017, RN-001, RN-003, RN-004, RN-008, RN-012
           , RN-014, AMB-025, AMB-036, AMB-037, AMB-038, AMB-039, AMB-043
      346    - **Aceite:** passam, em `tests/nucleo/rn-017-cambio.test.ts
           `, `RN-017 › e-006 (55,00 GBP) → CAMBIO_INDISPONIVEL, valor_so
           licitado nulo`, `RN-017 › 10,00 "EURO" → CAMBIO_INDISPONIVEL, 
           e não DADO_INVALIDO`, `RN-017 › EUR em 2026-07-10 → CAMBIO_IND
           ISPONIVEL`, `RN-017 › EUR em 2026-06-30 num período de julho →
            FORA_DO_PERIODO, e não CAMBIO_INDISPONIVEL`, `RN-017 › GBP co
           m categoria coworking → CATEGORIA_NAO_REEMBOLSAVEL (etapa 5 an
           tes da 6)`, `RN-017 › e-010 (sem moeda) → BRL, taxa_cambio 1` 
           e `RN-017 › limite compara o valor em reais: 22,00 EUR (R$ 130
           ,46) de alimentação na tabela padrão → PARCIAL 60,00`; em `tes
           ts/nucleo/rn-004-valor-nao-positivo.test.ts`, `RN-004 › −10,00
            GBP (sem cotação) → VALOR_NAO_POSITIVO` e `RN-004 › 0,01 numa
            moeda de taxa 0.20 → R$ 0,00 → VALOR_NAO_POSITIVO`; em `tests
           /nucleo/rn-008-nota-fiscal.test.ts`, `RN-008 › e-005 (40,00 US
           D × 5,50 = R$ 220,00, sem NF) → NOTA_FISCAL_AUSENTE` e `RN-008
            › e-003 (14,50 EUR × 5,88 = R$ 85,26, sem NF) não é recusada 
           por nota fiscal`; em `tests/nucleo/rn-003-validacao.test.ts`, 
           `RN-003 › id de despesa recusada por CAMBIO_INDISPONIVEL conti
           nua reservado (AMB-025)`, `RN-003 › valor inválido: valor_orig
           inal e os três campos de conversão nulos, mesmo em BRL ou com 
           cotação (AMB-043)`, `RN-003 › BRL com valor numérico e data in
           válida → DADO_INVALIDO com taxa 1 e valor_solicitado preenchid
           o`, `RN-003 › EUR com valor numérico e data inválida → DADO_IN
           VALIDO com conversão nula` e `RN-003 › DADO_INVALIDO por outro
            campo, EUR com cotação → valor_solicitado convertido`; em `te
           sts/nucleo/rn-012-diarias.test.ts`, `RN-012 › parcelas em reai
           s: 100,00 USD em 13/07 (R$ 542,00) "2 diarias" → 271,00 + 271,
           00 → PARCIAL 500,00`; em `tests/nucleo/rn-014-resumo.test.ts`,
            `RN-014 › total_solicitado soma o valor em reais e ignora CAM
           BIO_INDISPONIVEL (nulo)`
      347 -  - **Commit:** `<hash preenchido depois>`                    
      347 +  - **Commit:** `e515eb6`                                     
      348  
      349  - [ ] **T-057** — Duplicata com moeda (estende T-015) em `src/
           nucleo/elegibilidade.ts`: a chave passa a ser `(data, categori
           a, fornecedor, moeda normalizada, valorOriginal)`
      350    - **Atende:** RN-007, AMB-038

● T-057 — duplicate key includes currency

● Update(src\nucleo\elegibilidade.ts)
  ⎿  Added 5 lines, removed 4 lines
      54  export type ChavesDuplicata = Map<string, string>;
      55  
      56  /**
      57 - * Etapa 7 (RN-007, AMB-011, AMB-026): mesma data, categoria no
         -rmalizada,                                                     
      58 - * fornecedor (`trim` + minúsculas; vazio é um valor) e valor o
         -riginal. A                                                     
      59 - * primeira ocorrência é registrada em `aceitas` e segue; as se
         -guintes são recusadas.                                         
      57 + * Etapa 7 (RN-007, AMB-011, AMB-026, AMB-038): mesma data, cat
         +egoria                                                         
      58 + * normalizada, fornecedor (`trim` + minúsculas; vazio é um val
         +or), moeda                                                     
      59 + * normalizada e valor original. A primeira ocorrência é regist
         +rada em                                                        
      60 + * `aceitas` e segue; as seguintes são recusadas.              
      61   */
      62  export function verificarDuplicata(d: DespesaValida, aceitas: C
          havesDuplicata): Recusa | null {
      62 -  const chave = JSON.stringify([d.data, d.categoria, d.forneced
         -orChave, d.valorOriginal.toString()]);                         
      63 +  const chave = JSON.stringify([d.data, d.categoria, d.forneced
         +orChave, d.moeda, d.valorOriginal.toString()]);                
      64    const idAceito = aceitas.get(chave);
      65    if (idAceito !== undefined) return { codigo: 'DUPLICATA', det
          alhes: { idAceito } };
      66    aceitas.set(chave, d.id);

● Update(tests\nucleo\rn-007-duplicatas.test.ts)
  ⎿  Added 22 lines
      64      expect(codigos({ categoria: 'alimentacao' }, { categoria: '
          ALIMENTAÇÃO', valor: '45,00' })).toEqual([null, 'DUPLICATA']);
      65    });
      66  
      67 +  it('RN-007 › 20,00 EUR e 20,00 USD, resto igual → as duas seg
         +uem', () => {                                                  
      68 +    const gasto = { data: '2026-07-14', valor: 20 };           
      69 +    expect(codigos({ ...gasto, moeda: 'EUR' }, { ...gasto, moed
         +a: 'USD' })).toEqual([null, null]);                            
      70 +    expect(codigos({ ...gasto, moeda: 'EUR' }, { ...gasto })).t
         +oEqual([null, null]);                                          
      71 +  });                                                          
      72 +                                                               
      73 +  it('RN-007 › sem moeda e "BRL", resto igual → a 2ª DUPLICATA'
         +, () => {                                                      
      74 +    expect(codigos({ moeda: undefined }, { moeda: 'BRL' }, { mo
         +eda: null }, { moeda: ' brl ' })).toEqual([                    
      75 +      null,                                                    
      76 +      'DUPLICATA',                                             
      77 +      'DUPLICATA',                                             
      78 +      'DUPLICATA',                                             
      79 +    ]);                                                        
      80 +  });                                                          
      81 +                                                               
      82 +  it('RN-007 › "eur" e "EUR", resto igual → a 2ª DUPLICATA', ()
         + => {                                                          
      83 +    const gasto = { data: '2026-07-14', valor: 20 };           
      84 +    expect(codigos({ ...gasto, moeda: 'eur' }, { ...gasto, moed
         +a: 'EUR' })).toEqual([null, 'DUPLICATA']);                     
      85 +    // o valor comparado é o original, não o convertido        
      86 +    expect(codigos({ ...gasto, moeda: 'EUR' }, { ...gasto, moed
         +a: 'EUR', valor: 20.01 })).toEqual([null, null]);              
      87 +  });                                                          
      88 +                                                               
      89    it('RN-007 › cópia fora do período não gera duplicata (só com
          para quem passou das etapas 1 a 5)', () => {
      90      const copia = { data: '2026-08-01', fornecedor: 'Tavola', v
          alor: 40 };
      91      expect(codigosPassada1(entrada([copia, copia, { ...copia, d
          ata: '2026-07-31' }]))).toEqual([

  Ran 1 shell command (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      346    - **Aceite:** passam, em `tests/nucleo/rn-017-cambio.test.ts
           `, `RN-017 › e-006 (55,00 GBP) → CAMBIO_INDISPONIVEL, valor_so
           licitado nulo`, `RN-017 › 10,00 "EURO" → CAMBIO_INDISPONIVEL, 
           e não DADO_INVALIDO`, `RN-017 › EUR em 2026-07-10 → CAMBIO_IND
           ISPONIVEL`, `RN-017 › EUR em 2026-06-30 num período de julho →
            FORA_DO_PERIODO, e não CAMBIO_INDISPONIVEL`, `RN-017 › GBP co
           m categoria coworking → CATEGORIA_NAO_REEMBOLSAVEL (etapa 5 an
           tes da 6)`, `RN-017 › e-010 (sem moeda) → BRL, taxa_cambio 1` 
           e `RN-017 › limite compara o valor em reais: 22,00 EUR (R$ 130
           ,46) de alimentação na tabela padrão → PARCIAL 60,00`; em `tes
           ts/nucleo/rn-004-valor-nao-positivo.test.ts`, `RN-004 › −10,00
            GBP (sem cotação) → VALOR_NAO_POSITIVO` e `RN-004 › 0,01 numa
            moeda de taxa 0.20 → R$ 0,00 → VALOR_NAO_POSITIVO`; em `tests
           /nucleo/rn-008-nota-fiscal.test.ts`, `RN-008 › e-005 (40,00 US
           D × 5,50 = R$ 220,00, sem NF) → NOTA_FISCAL_AUSENTE` e `RN-008
            › e-003 (14,50 EUR × 5,88 = R$ 85,26, sem NF) não é recusada 
           por nota fiscal`; em `tests/nucleo/rn-003-validacao.test.ts`, 
           `RN-003 › id de despesa recusada por CAMBIO_INDISPONIVEL conti
           nua reservado (AMB-025)`, `RN-003 › valor inválido: valor_orig
           inal e os três campos de conversão nulos, mesmo em BRL ou com 
           cotação (AMB-043)`, `RN-003 › BRL com valor numérico e data in
           válida → DADO_INVALIDO com taxa 1 e valor_solicitado preenchid
           o`, `RN-003 › EUR com valor numérico e data inválida → DADO_IN
           VALIDO com conversão nula` e `RN-003 › DADO_INVALIDO por outro
            campo, EUR com cotação → valor_solicitado convertido`; em `te
           sts/nucleo/rn-012-diarias.test.ts`, `RN-012 › parcelas em reai
           s: 100,00 USD em 13/07 (R$ 542,00) "2 diarias" → 271,00 + 271,
           00 → PARCIAL 500,00`; em `tests/nucleo/rn-014-resumo.test.ts`,
            `RN-014 › total_solicitado soma o valor em reais e ignora CAM
           BIO_INDISPONIVEL (nulo)`
      347    - **Commit:** `e515eb6`
      348  
      349 -- [ ] **T-057** — Duplicata com moeda (estende T-015) em `src/
          -nucleo/elegibilidade.ts`: a chave passa a ser `(data, categori
          -a, fornecedor, moeda normalizada, valorOriginal)`             
      349 +- [x] **T-057** — Duplicata com moeda (estende T-015) em `src/
          +nucleo/elegibilidade.ts`: a chave passa a ser `(data, categori
          +a, fornecedor, moeda normalizada, valorOriginal)`             
      350    - **Atende:** RN-007, AMB-038
      351    - **Aceite:** em `tests/nucleo/rn-007-duplicatas.test.ts` pa
           ssam `RN-007 › 20,00 EUR e 20,00 USD, resto igual → as duas se
           guem`, `RN-007 › sem moeda e "BRL", resto igual → a 2ª DUPLICA
           TA` e `RN-007 › "eur" e "EUR", resto igual → a 2ª DUPLICATA`; 
           todos os `RN-007 ›` da T-015 continuam passando
      352 -  - **Commit:** `<hash preenchido depois>`                    
      352 +  - **Commit:** `f5dd2ed`                                     
      353  
      354  - [ ] **T-058** — Aprovação manual (etapa 11, DT-008, R-16): `
           Status` ganha `PENDENTE` e a união de códigos ganha `REQUER_AP
           ROVACAO`; `statusDe` em `src/nucleo/status.ts` devolve `PENDEN
           TE` quando `reembolsável > LIMIAR_APROVACAO`, antes das outras
            regras; em `src/nucleo/motor.ts`, um `map` depois da alocação
            troca o motivo por `REQUER_APROVACAO` (com os detalhes do lim
           ite), sem mudar valor nem saldo; em `src/nucleo/motivos.ts`, a
            descrição cita o valor calculado, o limiar de R$ 500,00 e, se
            houve, o valor cortado pelo limite
      355    - **Atende:** RN-018, RN-011, RN-013, AMB-040, AMB-041

● T-058 — manual approval (step 11)

  Read 1 file, ran 1 shell command (ctrl+o to expand)

● Update(src\nucleo\tipos.ts)
  ⎿  Added 5 lines, removed 4 lines
      77    | 'CATEGORIA_NAO_REEMBOLSAVEL'
      78    | 'CAMBIO_INDISPONIVEL'
      79    | 'DUPLICATA'
      80 -  | 'NOTA_FISCAL_AUSENTE';                                     
      80 +  | 'NOTA_FISCAL_AUSENTE'                                      
      81 +  | 'REQUER_APROVACAO';                                        
      82  
      82 -/** Códigos da etapa de limite (seção 8, etapa 9). */          
      83 +/** Códigos da etapa de limite (seção 8, etapa 10). */         
      84  export type CodigoLimite = 'APROVADO_INTEGRAL' | 'LIMITE_DIARIO
          _EXCEDIDO' | 'LIMITE_DIARIO_ESGOTADO';
      85  
      85 -/** Códigos de recusa das etapas 1 a 7 (seção 8 da spec). */   
      86 -export type CodigoRecusa = Exclude<CodigoMotivo, CodigoLimite>;
      86 +/** Códigos de recusa das etapas 2 a 8 (seção 8 da spec). */   
      87 +export type CodigoRecusa = Exclude<CodigoMotivo, CodigoLimite |
         + 'REQUER_APROVACAO'>;                                          
      88  
      89  /** Por que a RN-003 recusou. */
      90  export type ProblemaDado =

  Ran 1 shell command (ctrl+o to expand)

● Update(src\nucleo\tipos.ts)
  ⎿  Added 6 lines
      150    };
      151  }
      152  
      153 +/** Etapa 11 (RN-018, DT-008): só o motivo muda; leva os númer
          +os do limite para citar o corte. */                           
      154 +export interface DecisaoAprovacao {                           
      155 +  readonly codigo: 'REQUER_APROVACAO';                        
      156 +  readonly detalhes: DecisaoLimite['detalhes'];               
      157 +}                                                             
      158 +                                                              
      159  /** Fatia de despesa elegível que consome limite de uma data (
           RN-012). */
      160  export interface Parcela {
      161    readonly indiceDespesa: number;

● Update(src\nucleo\tipos.ts)
  ⎿  Added 1 line, removed 1 line
      170  }
      171  
      172  /** Derivado de (reembolsável, solicitado); nunca guardado no 
           item. */
      173 -export type Status = 'APROVADO' | 'PARCIAL' | 'RECUSADO';     
      173 +export type Status = 'APROVADO' | 'PARCIAL' | 'RECUSADO' | 'PE
          +NDENTE';                                                      
      174  
      175  /** Um por despesa, na ordem da entrada (seção 4 da spec). */
      176  export interface ResultadoItem {

● Write(src\nucleo\status.ts)
  ⎿  Added 2 lines
       1  // Status derivado dos valores (seção 4); nunca guardado no ite
          m.
       2  
       3 +import { LIMIAR_APROVACAO } from './politica.ts';              
       4  import type { ResultadoItem, Status } from './tipos.ts';
       5  
       6  export function statusDe(item: Pick<ResultadoItem, 'valorSolici
          tado' | 'valorReembolsavel'>): Status {
       7 +  if (item.valorReembolsavel > LIMIAR_APROVACAO) return 'PENDEN
         +TE'; // RN-018, AMB-040                                        
       8    if (item.valorReembolsavel === 0n) return 'RECUSADO';
       9    return item.valorReembolsavel === item.valorSolicitado ? 'APR
          OVADO' : 'PARCIAL';
      10  }

● Now motivos.ts and the step-11 map in motor.ts.

● Update(src\nucleo\motivos.ts)
  ⎿  Added 15 lines, removed 4 lines
       1  // Justificativa de cada item (RN-013): um modelo de texto por 
          código da seção 4.
       2  
       3  import { formatarReais, formatarReaisDecimal } from './dinheiro
          .ts';
       4 -import type { Categoria, Centavos, CodigoLimite, CodigoMotivo, 
         -DecisaoLimite, Motivo, ProblemaDado, Recusa } from './tipos.ts'
         -;                                                              
       4 +import { LIMIAR_APROVACAO } from './politica.ts';              
       5 +import type {                                                  
       6 +  Categoria,                                                   
       7 +  Centavos,                                                    
       8 +  CodigoLimite,                                                
       9 +  CodigoMotivo,                                                
      10 +  DecisaoAprovacao,                                            
      11 +  DecisaoLimite,                                               
      12 +  Motivo,                                                      
      13 +  ProblemaDado,                                                
      14 +  Recusa,                                                      
      15 +} from './tipos.ts';                                           
      16  
       6 -/** O que decidiu o item: a recusa de uma etapa ou a decisão do
         - limite. */                                                    
       7 -export type Decisao = Recusa | DecisaoLimite;                  
      17 +/** O que decidiu o item: a recusa de uma etapa, a decisão do l
         +imite ou a aprovação manual. */                                
      18 +export type Decisao = Recusa | DecisaoLimite | DecisaoAprovacao
         +;                                                              
      19  
       9 -type DetalhesDe<C extends CodigoMotivo> = C extends CodigoLimit
         -e                                                              
      20 +type DetalhesDe<C extends CodigoMotivo> = C extends CodigoLimit
         +e | 'REQUER_APROVACAO'                                         
      21    ? DecisaoLimite['detalhes']
      22    : Extract<Recusa, { codigo: C }>['detalhes'];
      23  

● Update(src\nucleo\motivos.ts)
  ⎿  Added 8 lines
      85      `Mesma data, categoria, fornecedor e valor da despesa '${d.
          idAceito}', que já foi considerada; este lançamento repetido nã
          o é reembolsado.`,
      86    NOTA_FISCAL_AUSENTE: (d) =>
      87      `Valor ${formatarReais(d.valor)} acima de ${formatarReaisDe
          cimal(d.limiar)} exige nota fiscal, que não foi informada.`,
      88 +  REQUER_APROVACAO: (d) => {                                   
      89 +    const corte = d.solicitado - d.reembolsavel;               
      90 +    const limite =                                             
      91 +      corte > 0n                                               
      92 +        ? `${limiteDoDia(d)}; excedente de ${formatarReais(cort
         +e)} não reembolsado`                                           
      93 +        : `dentro do limite de ${nomeCategoria(d.categoria)} ($
         +{formatarReais(d.limite)}${d.periodicidade === 'diaria' ? ' por
         + diária' : ''})`;                                              
      94 +    return `Valor calculado ${formatarReais(d.reembolsavel)} ac
         +ima de ${formatarReais(LIMIAR_APROVACAO)} aguarda aprovação do 
         +gestor; ${limite}.`;                                           
      95 +  },                                                           
      96  };
      97  
      98  export function montarMotivo(decisao: Decisao): Motivo {
  Read 1 file (ctrl+o to expand)

● Update(src\nucleo\motor.ts)
  ⎿  Added 16 lines, removed 14 lines
      109        moeda: d.moeda,
      110        ...valores(d.valorOriginal, d.conversao),
      111        valorReembolsavel: alocacao.reembolsavel,
      112 -      motivo: montarMotivo({                                  
      113 -        codigo: alocacao.codigo,                              
      114 -        detalhes: {                                           
      115 -          categoria: d.categoria,                             
      116 -          periodicidade: d.regra.periodicidade,               
      117 -          data: d.data,                                       
      118 -          diarias,                                            
      119 -          limite: alocacao.limiteAplicado,                    
      120 -          saldoDisponivel: alocacao.saldoDisponivel,          
      121 -          saldoApos: alocacao.saldoApos,                      
      122 -          solicitado: alocacao.solicitado,                    
      123 -          reembolsavel: alocacao.reembolsavel,                
      124 -        },                                                    
      125 -      }),                                                     
      112 +      motivo: montarMotivo(                                   
      113 +        aprovacaoManual({                                     
      114 +          codigo: alocacao.codigo,                            
      115 +          detalhes: {                                         
      116 +            categoria: d.categoria,                           
      117 +            periodicidade: d.regra.periodicidade,             
      118 +            data: d.data,                                     
      119 +            diarias,                                          
      120 +            limite: alocacao.limiteAplicado,                  
      121 +            saldoDisponivel: alocacao.saldoDisponivel,        
      122 +            saldoApos: alocacao.saldoApos,                    
      123 +            solicitado: alocacao.solicitado,                  
      124 +            reembolsavel: alocacao.reembolsavel,              
      125 +          },                                                  
      126 +        }), // etapa 11                                       
      127 +      ),                                                      
      128        limiteDiarioAplicado: alocacao.limiteAplicado,
      129        emViagem: viagem.has(d.data),
      130        diarias: d.regra.periodicidade === 'diaria' ? diarias : 
           null,

● Update(src\nucleo\motor.ts)
  ⎿  Added 8 lines
      132    });
      133  }
      134  
      135 +/**                                                           
      136 + * Etapa 11 (RN-018, DT-008): reembolsável acima do limiar tro
          +ca o motivo por                                               
      137 + * `REQUER_APROVACAO`, com os números do limite; valor e saldo
          + não mudam.                                                   
      138 + */                                                           
      139 +function aprovacaoManual(decisao: DecisaoLimite): DecisaoLimit
          +e | DecisaoAprovacao {                                        
      140 +  return decisao.detalhes.reembolsavel > LIMIAR_APROVACAO ? { 
          +codigo: 'REQUER_APROVACAO', detalhes: decisao.detalhes } : dec
          +isao;                                                         
      141 +}                                                             
      142 +                                                              
      143  /** Valor original e conversão; o solicitado em reais sai só d
           a conversão (AMB-043). */
      144  function valores(valorOriginal: Centavos | null, conversao: Co
           nversao | null) {
      145    return { valorOriginal, conversao, valorSolicitado: conversa
           o?.valorSolicitado ?? null };

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; perl -0pi -e "s#import \{
      tabelaAplicavel \} from './politica\.ts';#import { LIMIAR_APROVACAO,
      tabelaAplicavel }…)
  ⎿  Updated src\nucleo\motor.ts (+3 -1)
      15  import { alocar } from './limites.ts';
      16  import type { Alocacao } from './limites.ts';
      17  import { montarMotivo } from './motivos.ts';
      18 -import { tabelaAplicavel } from './politica.ts';               
      18 +import { LIMIAR_APROVACAO, tabelaAplicavel } from './politica.t
         +s';                                                            
      19  import { calcularResumo } from './resumo.ts';
      20  import type {
      21    Cambio,
      22    Centavos,
      23    Conversao,
      24 +  DecisaoAprovacao,                                            
      25 +  DecisaoLimite,                                               
      26    DespesaElegivel,
      27    DespesaValida,
      28    Entrada,
  ⎿  Updated src\nucleo\resumo.ts (+1 -1)
       4  import type { ResultadoItem, Resumo } from './tipos.ts';
       5  
       6  export function calcularResumo(itens: readonly ResultadoItem[])
          : Resumo {
       7 -  const contagem = { APROVADO: 0, PARCIAL: 0, RECUSADO: 0 };   
       7 +  const contagem = { APROVADO: 0, PARCIAL: 0, RECUSADO: 0, PEND
         +ENTE: 0 };                                                     
       8    let totalSolicitado = 0n;
       9    let totalReembolsavel = 0n;
      10    for (const item of itens) {

● Typecheck is clean. Now the RN-018 test file plus RN-011 and RN-013 additions.

● Write(tests\nucleo\rn-018-aprovacao.test.ts)
  ⎿  Wrote 62 lines to tests\nucleo\rn-018-aprovacao.test.ts
       1 import { describe, expect, it } from 'vitest';
       3 import { decisoes, rodar } from '../apoio.ts';
       4
       6 const hospedagem = { categoria: 'hospedagem', data: '2026-07-22'
         , fornecedor: 'Hotel', tem_nota_fiscal: true };
       8 describe('RN-018 — Aprovação manual de itens acima de R$ 500', (
         ) => {
         RCIAL) → PENDENTE REQUER_APROVACAO, reembolsável 1.200,00', () =
         > {
          Londres - 3 noites', fornecedor: 'Premier Inn', valor: 1200 };
     … +70 lines (ctrl+o to expand)

● Update(tests\nucleo\rn-011-viagem.test.ts)
  ⎿  Added 9 lines
      71      expect(rodar([representacao], opcoes)[0]).toMatchObject({ v
          alorReembolsavel: 30000n, limiteDiarioAplicado: 30000n });
      72    });
      73  
      74 +  it('RN-011 › CC-COMERCIAL: e-008 (alimentação 95,00 em 23/07,
         + noite de e-007 PENDENTE) → APROVADO 95,00 (limite 135,00)', ()
         + => {                                                          
      75 +    const e007 = { id: 'e-007', categoria: 'hospedagem', data: 
         +'2026-07-22', descricao: 'Hotel Londres - 3 noites', valor: 120
         +0 };                                                           
      76 +    const e008 = { id: 'e-008', categoria: 'alimentacao', data:
         + '2026-07-23', fornecedor: 'Restaurante Tavola', valor: 95 };  
      77 +    const [h, a] = rodar([e007, e008], { centroCusto: 'CC-COMER
         +CIAL' });                                                      
      78 +    expect(h?.motivo.codigo).toBe('REQUER_APROVACAO');         
      79 +    expect(a).toMatchObject({ valorReembolsavel: 9500n, limiteD
         +iarioAplicado: 13500n, emViagem: true });                      
      80 +    expect(a?.motivo.codigo).toBe('APROVADO_INTEGRAL');        
      81 +  });                                                          
      82 +                                                               
      83    it('RN-011 › acréscimo trocado para 20 na tabela: alimentação
           em dia de viagem tem limite 72,00', () => {
      84      const politica = politicaCom((p) => (p.acrescimo_em_viagem_
          percentual = 20));
      85      const [, a] = rodar([hotel, { ...alimentacao80, data: '2026
          -07-14' }], { politica });

● Update(tests\nucleo\rn-013-motivos.test.ts)
  ⎿  Added 4 lines
      34      detalhes: { categoria: 'hospedagem', tabela: 'CC-X', versao
          : 'v4', caso: 'limite_zero', centroCusto: 'CC-X' },
      35    },
      36    { codigo: 'DUPLICATA', detalhes: { idAceito: 'd-006' } },
      37 +  {                                                            
      38 +    codigo: 'REQUER_APROVACAO',                                
      39 +    detalhes: { ...LIMITE, categoria: 'hospedagem', periodicida
         +de: 'diaria', diarias: 3, solicitado: 120000n, reembolsavel: 12
         +0000n },                                                       
      40 +  },                                                           
      41    { codigo: 'NOTA_FISCAL_AUSENTE', detalhes: { valor: 10001n, l
          imiar: { digitos: 10000n, escala: 2 } } },
      42  ];
      43  

● Update(tests\nucleo\rn-013-motivos.test.ts)
  ⎿  Added 1 line
      44  describe('RN-013 — Justificativa obrigatória', () => {
      45    it('RN-013 › todo código da seção 4 gera descrição não vazia'
          , () => {
      46      expect(Object.keys(MODELOS).sort()).toEqual([...new Set(EXE
          MPLOS.map((e) => e.codigo))].sort());
      47 +    expect(Object.keys(MODELOS)).toHaveLength(11);             
      48      for (const decisao of EXEMPLOS) {
      49        const m = montarMotivo(decisao);
      50        expect(m.codigo).toBe(decisao.codigo);

  Ran 1 shell command (ctrl+o to expand)

● Found that the "Diárias com acento e maiúscula" test broke legitimately, since
  RN-018 now correctly flags its 600,00 amount as PENDENTE instead of APROVADO.
  I'll lower the test amount to 300,00 to keep it focused on validating N=3
  without crossing the R$500 threshold.

● Update(tests\casos-de-borda.test.ts)
  ⎿  Added 2 lines, removed 1 line
      258    });
      259  
      260    it('Borda › Diárias com acento e maiúscula', () => {
      261 -    expect(hospedagem({ descricao: '3 Diárias', valor: 600 }))
          -.toEqual(['APROVADO', 60000n, 3]);                            
      261 +    // 300,00 (3 × 100,00): abaixo do limiar de aprovação manu
          +al da RN-018                                                  
      262 +    expect(hospedagem({ descricao: '3 Diárias', valor: 300 }))
          +.toEqual(['APROVADO', 30000n, 3]);                            
      263    });
      264  
      265    it('Borda › Duas hospedagens na mesma noite', () => {

  Ran 1 shell command (ctrl+o to expand)

● Only the known-red files remain (rastreabilidade is down to the missing edge
  cases). Committing T-058.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      351    - **Aceite:** em `tests/nucleo/rn-007-duplicatas.test.ts` pa
           ssam `RN-007 › 20,00 EUR e 20,00 USD, resto igual → as duas se
           guem`, `RN-007 › sem moeda e "BRL", resto igual → a 2ª DUPLICA
           TA` e `RN-007 › "eur" e "EUR", resto igual → a 2ª DUPLICATA`; 
           todos os `RN-007 ›` da T-015 continuam passando
      352    - **Commit:** `f5dd2ed`
      353  
      354 -- [ ] **T-058** — Aprovação manual (etapa 11, DT-008, R-16): `
          -Status` ganha `PENDENTE` e a união de códigos ganha `REQUER_AP
          -ROVACAO`; `statusDe` em `src/nucleo/status.ts` devolve `PENDEN
          -TE` quando `reembolsável > LIMIAR_APROVACAO`, antes das outras
          - regras; em `src/nucleo/motor.ts`, um `map` depois da alocação
          - troca o motivo por `REQUER_APROVACAO` (com os detalhes do lim
          -ite), sem mudar valor nem saldo; em `src/nucleo/motivos.ts`, a
          - descrição cita o valor calculado, o limiar de R$ 500,00 e, se
          - houve, o valor cortado pelo limite                           
      354 +- [x] **T-058** — Aprovação manual (etapa 11, DT-008, R-16): `
          +Status` ganha `PENDENTE` e a união de códigos ganha `REQUER_AP
          +ROVACAO`; `statusDe` em `src/nucleo/status.ts` devolve `PENDEN
          +TE` quando `reembolsável > LIMIAR_APROVACAO`, antes das outras
          + regras; em `src/nucleo/motor.ts`, um `map` depois da alocação
          + troca o motivo por `REQUER_APROVACAO` (com os detalhes do lim
          +ite), sem mudar valor nem saldo; em `src/nucleo/motivos.ts`, a
          + descrição cita o valor calculado, o limiar de R$ 500,00 e, se
          + houve, o valor cortado pelo limite                           
      355    - **Atende:** RN-018, RN-011, RN-013, AMB-040, AMB-041
      356    - **Aceite:** em `tests/nucleo/rn-018-aprovacao.test.ts` pas
           sam `RN-018 › e-007 (hospedagem 1.200,00, 3 × 400,00 no CC-COM
           ERCIAL) → PENDENTE REQUER_APROVACAO, reembolsável 1.200,00`, `
           RN-018 › reembolsável exatamente 500,00 → APROVADO, não PENDEN
           TE`, `RN-018 › reembolsável 500,01 (CC-COMERCIAL, "2 diarias" 
           500,01) → PENDENTE`, `RN-018 › hospedagem 1.200,00 com 1 diári
           a na tabela padrão → PARCIAL 250,00, não PENDENTE`, `RN-018 › 
           PENDENTE consome o limite: hospedagem seguinte na mesma noite 
           → LIMITE_DIARIO_ESGOTADO` e `RN-018 › descrição cita o valor c
           alculado, o limiar de R$ 500,00 e o corte de limite`; em `test
           s/nucleo/rn-011-viagem.test.ts`, `RN-011 › CC-COMERCIAL: e-008
            (alimentação 95,00 em 23/07, noite de e-007 PENDENTE) → APROV
           ADO 95,00 (limite 135,00)`; em `tests/nucleo/rn-013-motivos.te
           st.ts`, `RN-013 › todo código da seção 4 gera descrição não va
           zia` cobre os 11 códigos
      357 -  - **Commit:** `<hash preenchido depois>`                    
      357 +  - **Commit:** `be9da18`                                     
      358  
      359  - [ ] **T-059** — [P] Resumo da v4 em `src/nucleo/resumo.ts` (
           estende T-024): `pendentes`; `totalReembolsavel` só dos itens 
           não PENDENTE; `totalPendente` dos PENDENTE; `totalNaoReembolsa
           do = solicitado − reembolsável − pendente`
      360    - **Atende:** RN-014, AMB-041

● T-059 — v4 summary

● Write(src\nucleo\resumo.ts)
  ⎿  Added 10 lines, removed 4 lines
      1 -// Totais do resumo (RN-014).                                   
      1 +// Totais do resumo (RN-014, AMB-041).                          
      2  
      3  import { statusDe } from './status.ts';
      4  import type { ResultadoItem, Resumo } from './tipos.ts';
     ...
       7    const contagem = { APROVADO: 0, PARCIAL: 0, RECUSADO: 0, PEND
          ENTE: 0 };
       8    let totalSolicitado = 0n;
       9    let totalReembolsavel = 0n;
      10 +  let totalPendente = 0n;                                      
      11    for (const item of itens) {
      11 -    contagem[statusDe(item)]++;                                
      12 +    const status = statusDe(item);                             
      13 +    contagem[status]++;                                        
      14      // Só valor positivo e não nulo entra no solicitado (RN-004
          , AMB-012, AMB-023).
      15      if (item.valorSolicitado !== null && item.valorSolicitado >
           0n) totalSolicitado += item.valorSolicitado;
      14 -    totalReembolsavel += item.valorReembolsavel;               
      16 +    // O pendente fica fora do reembolsável (AMB-041).         
      17 +    if (status === 'PENDENTE') totalPendente += item.valorReemb
         +olsavel;                                                       
      18 +    else totalReembolsavel += item.valorReembolsavel;          
      19    }
      20    return {
      21      quantidadeItens: itens.length,
      22      aprovados: contagem.APROVADO,
      23      parciais: contagem.PARCIAL,
      24      recusados: contagem.RECUSADO,
      25 +    pendentes: contagem.PENDENTE,                              
      26      totalSolicitado,
      27      totalReembolsavel,
      23 -    totalNaoReembolsado: totalSolicitado - totalReembolsavel,  
      28 +    totalPendente,                                             
      29 +    totalNaoReembolsado: totalSolicitado - totalReembolsavel - 
         +totalPendente,                                                 
      30    };
      31  }

● Update(src\nucleo\tipos.ts)
  ⎿  Added 5 lines
      199    readonly aprovados: number;
      200    readonly parciais: number;
      201    readonly recusados: number;
      202 +  readonly pendentes: number;                                 
      203    readonly totalSolicitado: Centavos;
      204 +  /** Só os itens que não estão PENDENTE (AMB-041). */        
      205    readonly totalReembolsavel: Centavos;
      206 +  /** Reembolsável dos itens PENDENTE. */                     
      207 +  readonly totalPendente: Centavos;                           
      208 +  /** `totalSolicitado − totalReembolsavel − totalPendente`. *
          +/                                                             
      209    readonly totalNaoReembolsado: Centavos;
      210  }
      211  

  Read 1 file (ctrl+o to expand)

● Write(tests\nucleo\rn-014-resumo.test.ts)
  ⎿  Added 44 lines, removed 5 lines
      1  import { describe, expect, it } from 'vitest';
      2 +import { statusDe } from '../../src/nucleo/status.ts';          
      3  import { calcularV4, cru, entrada } from '../apoio.ts';
      4  
      5  const variado = entrada([
     ...
      13    cru('42'),
      14  ]);
      15  
      16 +/** CC-COMERCIAL com um item PENDENTE (e-007) e itens APROVADO,
         + PARCIAL e RECUSADO. */                                        
      17 +const comPendente = entrada(                                   
      18 +  [                                                            
      19 +    { id: 'h', categoria: 'hospedagem', data: '2026-07-22', des
         +cricao: '3 noites', valor: 1200 }, // PENDENTE 1.200,00        
      20 +    { id: 'a', data: '2026-07-27', valor: 88 }, // APROVADO 88,
         +00                                                             
      21 +    { id: 'p', data: '2026-07-13', categoria: 'representacao', 
         +valor: 340 }, // PARCIAL 300,00                                
      22 +    { id: 'r', data: '2026-07-24', categoria: 'coworking', valo
         +r: 120 }, // RECUSADO                                          
      23 +  ],                                                           
      24 +  { centroCusto: 'CC-COMERCIAL' },                             
      25 +);                                                             
      26 +                                                               
      27  describe('RN-014 — Totais do resumo', () => {
      28    it('RN-014 › soma de valor_reembolsavel dos itens = total_ree
          mbolsavel e contagens somam quantidade_itens', () => {
      17 -    const { itens, resumo } = calcularV4(variado);             
      18 -    expect(resumo.totalReembolsavel).toBe(itens.reduce((s, i) =
         -> s + i.valorReembolsavel, 0n));                               
      29 +    for (const e of [variado, comPendente]) {                  
      30 +      const { itens, resumo } = calcularV4(e);                 
      31 +      const naoPendentes = itens.filter((i) => statusDe(i) !== 
         +'PENDENTE');                                                   
      32 +      expect(resumo.totalReembolsavel).toBe(naoPendentes.reduce
         +((s, i) => s + i.valorReembolsavel, 0n));                      
      33 +      expect(resumo.aprovados + resumo.parciais + resumo.recusa
         +dos + resumo.pendentes).toBe(resumo.quantidadeItens);          
      34 +    }                                                          
      35 +    const { resumo } = calcularV4(variado);                    
      36      expect(resumo.quantidadeItens).toBe(8);
      20 -    expect(resumo.aprovados + resumo.parciais + resumo.recusado
         -s).toBe(resumo.quantidadeItens);                               
      21 -    expect([resumo.aprovados, resumo.parciais, resumo.recusados
         -]).toEqual([1, 1, 6]);                                         
      37 +    expect([resumo.aprovados, resumo.parciais, resumo.recusados
         +, resumo.pendentes]).toEqual([1, 1, 6, 0]);                    
      38    });
      39  
      40    it('RN-014 › total_solicitado ignora valores não positivos e 
          nulos', () => {
     ...
      69      expect(resumo.totalNaoReembolsado).toBe(7046n);
      70    });
      71  
      72 +  it('RN-014 › PENDENTE entra em total_solicitado e total_pende
         +nte, e não em total_reembolsavel', () => {                     
      73 +    const { resumo } = calcularV4(comPendente);                
      74 +    expect(resumo.totalSolicitado).toBe(120000n + 8800n + 34000
         +n + 12000n);                                                   
      75 +    expect(resumo.totalPendente).toBe(120000n);                
      76 +    expect(resumo.totalReembolsavel).toBe(8800n + 30000n);     
      77 +  });                                                          
      78 +                                                               
      79 +  it('RN-014 › total_nao_reembolsado = total_solicitado − total
         +_reembolsavel − total_pendente, exato em centavos', () => {    
      80 +    const { resumo } = calcularV4(comPendente);                
      81 +    expect(resumo.totalNaoReembolsado).toBe(resumo.totalSolicit
         +ado - resumo.totalReembolsavel - resumo.totalPendente);        
      82 +    expect(resumo.totalNaoReembolsado).toBe(4000n + 12000n);   
      83 +  });                                                          
      84 +                                                               
      85 +  it('RN-014 › contagens (aprovados, parciais, recusados, pende
         +ntes) somam quantidade_itens', () => {                         
      86 +    const { resumo } = calcularV4(comPendente);                
      87 +    expect([resumo.aprovados, resumo.parciais, resumo.recusados
         +, resumo.pendentes]).toEqual([1, 1, 1, 1]);                    
      88 +    expect(resumo.quantidadeItens).toBe(4);                    
      89 +  });                                                          
      90 +                                                               
      91    it('RN-014 › lista vazia → contagens 0 e totais 0,00', () => 
          {
      57 -    expect(calcularV4(entrada([])).resumo).toEqual({           
      92 +    expect(calcularV4(entrada([])).resumo).toMatchObject({     
      93        quantidadeItens: 0,
      94        aprovados: 0,
      95        parciais: 0,
     ...
       99        totalNaoReembolsado: 0n,
      100      });
      101    });
      102 +                                                              
      103 +  it('RN-014 › lista vazia → pendentes 0 e total_pendente 0,00
          +', () => {                                                    
      104 +    expect(calcularV4(entrada([])).resumo).toMatchObject({ pen
          +dentes: 0, totalPendente: 0n });                              
      105 +  });                                                         
      106  });

  Ran 1 shell command (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      356    - **Aceite:** em `tests/nucleo/rn-018-aprovacao.test.ts` pas
           sam `RN-018 › e-007 (hospedagem 1.200,00, 3 × 400,00 no CC-COM
           ERCIAL) → PENDENTE REQUER_APROVACAO, reembolsável 1.200,00`, `
           RN-018 › reembolsável exatamente 500,00 → APROVADO, não PENDEN
           TE`, `RN-018 › reembolsável 500,01 (CC-COMERCIAL, "2 diarias" 
           500,01) → PENDENTE`, `RN-018 › hospedagem 1.200,00 com 1 diári
           a na tabela padrão → PARCIAL 250,00, não PENDENTE`, `RN-018 › 
           PENDENTE consome o limite: hospedagem seguinte na mesma noite 
           → LIMITE_DIARIO_ESGOTADO` e `RN-018 › descrição cita o valor c
           alculado, o limiar de R$ 500,00 e o corte de limite`; em `test
           s/nucleo/rn-011-viagem.test.ts`, `RN-011 › CC-COMERCIAL: e-008
            (alimentação 95,00 em 23/07, noite de e-007 PENDENTE) → APROV
           ADO 95,00 (limite 135,00)`; em `tests/nucleo/rn-013-motivos.te
           st.ts`, `RN-013 › todo código da seção 4 gera descrição não va
           zia` cobre os 11 códigos
      357    - **Commit:** `be9da18`
      358  
      359 -- [ ] **T-059** — [P] Resumo da v4 em `src/nucleo/resumo.ts` (
          -estende T-024): `pendentes`; `totalReembolsavel` só dos itens 
          -não PENDENTE; `totalPendente` dos PENDENTE; `totalNaoReembolsa
          -do = solicitado − reembolsável − pendente`                    
      359 +- [x] **T-059** — [P] Resumo da v4 em `src/nucleo/resumo.ts` (
          +estende T-024): `pendentes`; `totalReembolsavel` só dos itens 
          +não PENDENTE; `totalPendente` dos PENDENTE; `totalNaoReembolsa
          +do = solicitado − reembolsável − pendente`                    
      360    - **Atende:** RN-014, AMB-041
      361    - **Aceite:** em `tests/nucleo/rn-014-resumo.test.ts` passam
            `RN-014 › PENDENTE entra em total_solicitado e total_pendente
           , e não em total_reembolsavel`, `RN-014 › total_nao_reembolsad
           o = total_solicitado − total_reembolsavel − total_pendente, ex
           ato em centavos`, `RN-014 › contagens (aprovados, parciais, re
           cusados, pendentes) somam quantidade_itens` e `RN-014 › lista 
           vazia → pendentes 0 e total_pendente 0,00`; o teste da T-024 `
           RN-014 › soma de valor_reembolsavel dos itens = total_reembols
           avel ...` passa a somar só os itens não PENDENTE
      362 -  - **Commit:** `<hash preenchido depois>`                    
      362 +  - **Commit:** `2d38319`                                     
      363  
      364  - [ ] **T-060** — [P] Descrições da v4 em `src/nucleo/motivos.
           ts` (RN-013): todo item com conversão em moeda estrangeira tra
           z `"<MOEDA> <original> × <taxa> (cotação de <data>) = R$ <reai
           s>"` antes do texto do código; `CAMBIO_INDISPONIVEL` cita a mo
           eda e a data da despesa; `NOTA_FISCAL_AUSENTE` em moeda estran
           geira cita o valor em reais e o limiar
      365    - **Atende:** RN-013, RN-017, RN-008

● T-060 — v4 descriptions

  Ran 1 shell command (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; node - <<'JS'
      const fs = require('fs');…)
  ⎿  Updated src\nucleo\despesa.ts (+4 -3)
      57    cambio: Cambio,
      58  ): DespesaValida | RecusaDadoInvalido {
      59    if (!ehObjeto(bruta)) {
      60 -    return recusar({ id: null, data: null, categoria: null, moe
         -da: null }, null, null, 'despesa', 'nao_objeto');              
      60 +    return recusar({ id: null, data: null, categoria: null, moe
         +da: null }, null, null, null, 'despesa', 'nao_objeto');        
      61    }
      62    const eco = {
      63      id: bruta.id ?? null,
     ...
      75      valor !== null && moeda !== null && (moeda === 'BRL' || dat
          aValida !== null)
      76        ? converter(valor, moeda, dataValida ?? '', cambio)
      77        : null;
      78 -  const recusa = (campo: string, problema: ProblemaDado) => rec
         -usar(eco, valor, conversao, campo, problema);                  
      78 +  const recusa = (campo: string, problema: ProblemaDado) => rec
         +usar(eco, valor, moeda, conversao, campo, problema);           
      79  
      80    if (!textoPreenchido(id)) return recusa('id', 'ausente');
      81    if (!textoPreenchido(data)) return recusa('data', 'ausente');
     ...
      113  function recusar(
      114    eco: RecusaDadoInvalido['eco'],
      115    valorOriginal: Centavos | null,
      116 +  moedaLida: Moeda | null,                                    
      117    conversao: Conversao | null,
      118    campo: string,
      119    problema: ProblemaDado,
      120  ): RecusaDadoInvalido {
      120 -  return { codigo: 'DADO_INVALIDO', detalhes: { campo, problem
          -a }, eco, valorOriginal, conversao };                         
      121 +  return { codigo: 'DADO_INVALIDO', detalhes: { campo, problem
          +a }, eco, valorOriginal, moedaLida, conversao };              
      122  }
  ⎿  Updated src\nucleo\tipos.ts (+2 -0)
      130    readonly eco: { readonly id: unknown; readonly data: unknown
           ; readonly categoria: unknown; readonly moeda: unknown };
      131    /** Nulo se `valor` não é numérico. */
      132    readonly valorOriginal: Centavos | null;
      133 +  /** `moeda` normalizada (vazia → `BRL`); nula se não é texto
          +. */                                                          
      134 +  readonly moedaLida: Moeda | null;                           
      135    /** Nula se `valor` não é numérico, se a moeda não é texto, 
           ou sem data válida/cotação numa moeda estrangeira. */
      136    readonly conversao: Conversao | null;
      137  };

● The earlier git checkout gave motivos.ts CRLF line endings, which is breaking
  my multi-line edit matches. I'll normalize it to LF and reapply the remaining
  edits.
● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; grep -rlI $'\r' src tests
      | head; perl -pi -e 's/\r$//' src/nucleo/motivos.ts; git diff --stat
      src/nucleo/motivos…)
  ⎿  Updated src\nucleo\motivos.ts (+101 -101)
        1 -// Justificativa de cada item (RN-013): um modelo de texto por
          - código da seção 4.                                           
        2 -                                                              
        3 -import { formatarReais, formatarReaisDecimal } from './dinheir
          -o.ts';                                                        
        4 -import { LIMIAR_APROVACAO } from './politica.ts';             
        5 -import type {                                                 
        6 -  Categoria,                                                  
        7 -  Centavos,                                                   
        8 -  CodigoLimite,                                               
        9 -  CodigoMotivo,                                               
       10 -  DecisaoAprovacao,                                           
       11 -  DecisaoLimite,                                              
       12 -  Motivo,                                                     
       13 -  ProblemaDado,                                               
       14 -  Recusa,                                                     
       15 -} from './tipos.ts';                                          
       16 -                                                              
       17 -/** O que decidiu o item: a recusa de uma etapa, a decisão do 
          -limite ou a aprovação manual. */                              
       18 -export type Decisao = Recusa | DecisaoLimite | DecisaoAprovaca
          -o;                                                            
       19 -                                                              
       20 -type DetalhesDe<C extends CodigoMotivo> = C extends CodigoLimi
          -te | 'REQUER_APROVACAO'                                       
       21 -  ? DecisaoLimite['detalhes']                                 
       22 -  : Extract<Recusa, { codigo: C }>['detalhes'];               
       23 -                                                              
       24 -type Modelos = { [C in CodigoMotivo]: (detalhes: DetalhesDe<C>
          -) => string };                                                
       25 -                                                              
       26 -/** Só apresentação (R-15): categoria fora do mapa aparece pel
          -a própria chave. */                                           
       27 -const NOMES_CATEGORIA: Readonly<Record<string, string>> = {   
       28 -  alimentacao: 'alimentação',                                 
       29 -  transporte_urbano: 'transporte urbano',                     
       30 -  hospedagem: 'hospedagem',                                   
       31 -  representacao: 'representação',                             
       32 -};                                                            
       33 -                                                              
       34 -function nomeCategoria(categoria: Categoria): string {        
       35 -  return Object.hasOwn(NOMES_CATEGORIA, categoria) ? NOMES_CAT
          -EGORIA[categoria]! : categoria;                               
       36 -}                                                             
       37 -                                                              
       38 -const PROBLEMA: Record<ProblemaDado, (campo: string) => string
          -> = {                                                         
       39 -  nao_objeto: () => 'A despesa não é um objeto com os campos e
          -sperados.',                                                   
       40 -  ausente: (campo) => `Campo obrigatório '${campo}' ausente, v
          -azio ou com tipo diferente de texto.`,                        
     … 162 more lines (ctrl+o to expand)

  Ran 1 shell command (ctrl+o to expand)

● It was CRLF (now normalized). Re-running the motivos.ts and motor.ts edits.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; node - <<'JS'
      const fs = require('fs');…)
  ⎿  Updated src\nucleo\motivos.ts (+31 -2)
      1  // Justificativa de cada item (RN-013): um modelo de texto por c
         ódigo da seção 4.
      2  
      3 +import { decimalDe } from './decimal.ts';                       
      4  import { formatarReais, formatarReaisDecimal } from './dinheiro.
         ts';
      5  import { LIMIAR_APROVACAO } from './politica.ts';
      6  import type {
     ...
       8    Centavos,
       9    CodigoLimite,
      10    CodigoMotivo,
      11 +  Conversao,                                                   
      12    DecisaoAprovacao,
      13    DecisaoLimite,
      14 +  Moeda,                                                       
      15    Motivo,
      16    ProblemaDado,
      17    Recusa,
     ...
       98    },
       99  };
      100  
       98 -export function montarMotivo(decisao: Decisao): Motivo {      
      101 +/** A conta da conversão, quando a despesa está em moeda estra
          +ngeira (RN-013, RN-017). */                                   
      102 +export interface ContaConversao {                             
      103 +  readonly moeda: Moeda;                                      
      104 +  readonly valorOriginal: Centavos;                           
      105 +  readonly conversao: Conversao;                              
      106 +}                                                             
      107 +                                                              
      108 +/** Taxa como está no arquivo, com vírgula decimal: `5.93` → `
          +5,93`. */                                                     
      109 +function formatarTaxa(taxa: Conversao['taxa']): string {      
      110 +  const { digitos, escala } = decimalDe(taxa.texto)!;         
      111 +  const texto = digitos.toString().padStart(escala + 1, '0'); 
      112 +  return escala === 0 ? texto : `${texto.slice(0, -escala)},${
          +texto.slice(-escala)}`;                                       
      113 +}                                                             
      114 +                                                              
      115 +/** `EUR 22,00 × 5,93 (cotação de 2026-07-14) = R$ 130,46`. */
      116 +function contaConversao({ moeda, valorOriginal, conversao }: C
          +ontaConversao): string {                                      
      117 +  const cotacao = conversao.dataCotacao === null ? '' : ` (cot
          +ação de ${conversao.dataCotacao})`;                           
      118 +  return `${formatarValor(valorOriginal, moeda)} × ${formatarT
          +axa(conversao.taxa)}${cotacao} = ${formatarReais(conversao.val
          +orSolicitado)}`;                                              
      119 +}                                                             
      120 +                                                              
     … 11 more lines (ctrl+o to expand)
  ⎿  Updated src\nucleo\motor.ts (+10 -2)
      15  import { alocar } from './limites.ts';
      16  import type { Alocacao } from './limites.ts';
      17  import { montarMotivo } from './motivos.ts';
      18 +import type { ContaConversao } from './motivos.ts';            
      19  import { LIMIAR_APROVACAO, tabelaAplicavel } from './politica.t
          s';
      20  import { calcularResumo } from './resumo.ts';
      21  import type {
     ...
      27    DespesaElegivel,
      28    DespesaValida,
      29    Entrada,
      30 +  Moeda,                                                       
      31    Politica,
      32    Recusa,
      33    RecusaDadoInvalido,
     ...
      86          moeda: eco.moeda,
      87          ...valores(valorOriginal, conversao),
      88          valorReembolsavel: 0n,
      87 -        motivo: montarMotivo(a.recusa),                        
      89 +        motivo: montarMotivo(a.recusa, conta(a.recusa.moedaLida
         +, valorOriginal, conversao)),                                  
      90          ...foraDoLimite,
      91        };
      92      }
     ...
       99          moeda: d.moeda,
      100          ...valores(d.valorOriginal, d.conversao),
      101          valorReembolsavel: 0n,
      100 -        motivo: montarMotivo(a.recusa),                       
      102 +        motivo: montarMotivo(a.recusa, conta(d.moeda, d.valorO
          +riginal, d.conversao)),                                       
      103          ...foraDoLimite,
      104        };
      105      }
     ...
      128              reembolsavel: alocacao.reembolsavel,
      129            },
      130          }), // etapa 11
      131 +        conta(d.moeda, d.valorOriginal, d.conversao),         
      132        ),
      133        limiteDiarioAplicado: alocacao.limiteAplicado,
      134        emViagem: viagem.has(d.data),
     ...
      145    return decisao.detalhes.reembolsavel > LIMIAR_APROVACAO ? { 
           codigo: 'REQUER_APROVACAO', detalhes: decisao.detalhes } : dec
           isao;
      146  }
      147  
     … 8 more lines (ctrl+o to expand)

● Typecheck clean. Adding the three RN-013 tests.

● Update(tests\nucleo\rn-013-motivos.test.ts)
  ⎿  Added 38 lines
       72      expect(d002?.motivo.descricao).toMatch(/R\$ 60,00.*saldo d
           isponível R\$ 0,00/);
       73    });
       74  
       75 +  it('RN-013 › item em moeda estrangeira: descrição traz valor
          + original × taxa, data da cotação e valor em reais', () => {  
       76 +    const [d, e002, e004, fora] = rodar([                     
       77 +      { data: '2026-07-14', valor: 10, moeda: 'EUR' },        
       78 +      { data: '2026-07-14', valor: 22, moeda: 'EUR', fornecedo
          +r: 'Taberna', categoria: 'transporte_urbano' },               
       79 +      { data: '2026-07-18', valor: 30, moeda: 'eur' },        
       80 +      { data: '2026-08-03', valor: 10, moeda: 'USD' },        
       81 +    ]);                                                       
       82 +    expect(d?.motivo.descricao).toBe(                         
       83 +      'EUR 10,00 × 5,93 (cotação de 2026-07-14) = R$ 59,30; de
          +ntro do limite diário de alimentação (R$ 60,00); saldo do dia 
          +após este item: R$ 0,70.',                                    
       84 +    );                                                        
       85 +    expect(e002?.motivo.descricao).toMatch(/^EUR 22,00 × 5,93 
          +\(cotação de 2026-07-14\) = R\$ 130,46; /);                   
       86 +    expect(e004?.motivo.descricao).toMatch(/^EUR 30,00 × 5,96 
          +\(cotação de 2026-07-17\) = R\$ 178,80; limite diário/);      
       87 +    // também nos recusados antes do limite                   
       88 +    expect(fora?.motivo.descricao).toMatch(/^USD 10,00 × 5,51 
          +\(cotação de 2026-07-28\) = R\$ 55,10; data 2026-08-03 fora do
          + período/);                                                   
       89 +    // BRL não traz a conta                                   
       90 +    expect(rodar([{ valor: 45 }])[0]?.motivo.descricao).not.to
          +Match(/×/);                                                   
       91 +  });                                                         
       92 +                                                              
       93 +  it('RN-013 › CAMBIO_INDISPONIVEL cita a moeda e a data da de
          +spesa', () => {                                               
       94 +    const [gbp, eur] = rodar([                                
       95 +      { data: '2026-07-21', valor: 55, moeda: 'GBP' },        
       96 +      { data: '2026-07-10', valor: 10, moeda: ' eur ' },      
       97 +    ]);                                                       
       98 +    expect(gbp?.motivo).toEqual({                             
       99 +      codigo: 'CAMBIO_INDISPONIVEL',                          
      100 +      descricao: 'Sem cotação de GBP até 2026-07-21 no arquivo
          + de câmbio; o valor não pode ser convertido para reais.',     
      101 +    });                                                       
      102 +    expect(eur?.motivo.descricao).toMatch(/EUR até 2026-07-10/
          +);                                                            
      103 +  });                                                         
      104 +                                                              
      105 +  it('RN-013 › NOTA_FISCAL_AUSENTE em moeda estrangeira cita o
          + valor em reais e o limiar', () => {                          
      106 +    const [e005] = rodar([{ categoria: 'transporte_urbano', da
          +ta: '2026-07-20', valor: 40, moeda: 'USD', tem_nota_fiscal: fa
          +lse }]);                                                      
      107 +    expect(e005?.motivo.codigo).toBe('NOTA_FISCAL_AUSENTE');  
      108 +    expect(e005?.motivo.descricao).toBe(                      
      109 +      'USD 40,00 × 5,50 (cotação de 2026-07-20) = R$ 220,00; v
          +alor R$ 220,00 acima de R$ 100,00 exige nota fiscal, que não f
          +oi informada.',                                               
      110 +    );                                                        
      111 +  });                                                         
      112 +                                                              
      113    it('RN-013 › hospedagem cita o limite por diária', () => {
      114      const [h] = rodar([{ categoria: 'hospedagem', descricao: '
           2 diarias', valor: 600 }]);
      115      expect(h?.motivo.descricao).toMatch(/R\$ 250,00 por diária
           .*2 diárias.*saldo disponível R\$ 500,00.*R\$ 100,00/);

  Ran 1 shell command (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      361    - **Aceite:** em `tests/nucleo/rn-014-resumo.test.ts` passam
            `RN-014 › PENDENTE entra em total_solicitado e total_pendente
           , e não em total_reembolsavel`, `RN-014 › total_nao_reembolsad
           o = total_solicitado − total_reembolsavel − total_pendente, ex
           ato em centavos`, `RN-014 › contagens (aprovados, parciais, re
           cusados, pendentes) somam quantidade_itens` e `RN-014 › lista 
           vazia → pendentes 0 e total_pendente 0,00`; o teste da T-024 `
           RN-014 › soma de valor_reembolsavel dos itens = total_reembols
           avel ...` passa a somar só os itens não PENDENTE
      362    - **Commit:** `2d38319`
      363  
      364 -- [ ] **T-060** — [P] Descrições da v4 em `src/nucleo/motivos.
          -ts` (RN-013): todo item com conversão em moeda estrangeira tra
          -z `"<MOEDA> <original> × <taxa> (cotação de <data>) = R$ <reai
          -s>"` antes do texto do código; `CAMBIO_INDISPONIVEL` cita a mo
          -eda e a data da despesa; `NOTA_FISCAL_AUSENTE` em moeda estran
          -geira cita o valor em reais e o limiar                        
      364 +- [x] **T-060** — [P] Descrições da v4 em `src/nucleo/motivos.
          +ts` (RN-013): todo item com conversão em moeda estrangeira tra
          +z `"<MOEDA> <original> × <taxa> (cotação de <data>) = R$ <reai
          +s>"` antes do texto do código; `CAMBIO_INDISPONIVEL` cita a mo
          +eda e a data da despesa; `NOTA_FISCAL_AUSENTE` em moeda estran
          +geira cita o valor em reais e o limiar                        
      365    - **Atende:** RN-013, RN-017, RN-008
      366    - **Aceite:** em `tests/nucleo/rn-013-motivos.test.ts` passa
           m `RN-013 › item em moeda estrangeira: descrição traz valor or
           iginal × taxa, data da cotação e valor em reais`, `RN-013 › CA
           MBIO_INDISPONIVEL cita a moeda e a data da despesa` e `RN-013 
           › NOTA_FISCAL_AUSENTE em moeda estrangeira cita o valor em rea
           is e o limiar`
      367 -  - **Commit:** `<hash preenchido depois>`                    
      367 +  - **Commit:** `2a23dd4`                                     
      368  
      369  ### 5.3 Casos de borda da v4
      370  

● T-061 — edge cases: cost center and applicable table

  Ran 1 shell command (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; cat >>
      tests/casos-de-borda.test.ts <<'FIM'…)
  ⎿  Updated tests\casos-de-borda.test.ts (+66 -0)
      549      expect(cliComErro('[]')).toMatch(/^erro: /);
      550    });
      551  });
      552 +                                                              
      553 +describe('Casos de borda — centro de custo e tabela aplicável'
          +, () => {                                                     
      554 +  const comercial = { centroCusto: 'CC-COMERCIAL' };          
      555 +  const engenharia = { centroCusto: 'CC-ENG-PLATAFORMA' };    
      556 +  const hotel = { categoria: 'hospedagem', data: '2026-07-14',
          + descricao: 'Hotel', fornecedor: 'Hotel', valor: 200 };       
      557 +                                                              
      558 +  it('Borda › Centro de custo sem entrada na tabela', () => { 
      559 +    const r = calcularV4(entrada([{ valor: 65 }], { centroCust
          +o: 'CC-SUPORTE-N2' }));                                       
      560 +    expect(r.politica.tabela).toBe('padrao');                 
      561 +    expect(decisao(r.itens[0])).toMatchObject({ status: 'PARCI
          +AL', reembolsavel: 6000n });                                  
      562 +  });                                                         
      563 +                                                              
      564 +  it('Borda › Colaborador sem centro de custo', () => {       
      565 +    const r = calcularV4(entrada([{ valor: 65 }]));           
      566 +    expect(r.politica.tabela).toBe('padrao');                 
      567 +    expect(decisao(r.itens[0])).toMatchObject({ status: 'PARCI
          +AL', reembolsavel: 6000n });                                  
      568 +  });                                                         
      569 +                                                              
      570 +  it('Borda › Centro de custo com outra grafia', () => {      
      571 +    const r = calcularV4(entrada([{ valor: 85 }], { centroCust
          +o: ' cc-comercial ' }));                                      
      572 +    expect(r.politica.tabela).toBe('CC-COMERCIAL');           
      573 +    expect(decisao(r.itens[0])).toMatchObject({ status: 'APROV
          +ADO', reembolsavel: 8500n });                                 
      574 +  });                                                         
      575 +                                                              
      576 +  it('Borda › Categoria herdada do padrão', () => {           
      577 +    const [i] = rodar([{ ...hotel, valor: 300 }], { centroCust
          +o: 'CC-ADM' });                                               
      578 +    expect(decisao(i)).toMatchObject({ status: 'PARCIAL', codi
          +go: 'LIMITE_DIARIO_EXCEDIDO', reembolsavel: 25000n });        
      579 +    expect(i?.limiteDiarioAplicado).toBe(25000n);             
      580 +  });                                                         
      581 +                                                              
      582 +  it('Borda › Categoria só em outro centro de custo', () => { 
      583 +    const [i] = rodar([{ categoria: 'representacao', valor: 19
          +0 }]);                                                        
      584 +    expect(decisao(i)).toMatchObject({ status: 'RECUSADO', cod
          +igo: 'CATEGORIA_NAO_REEMBOLSAVEL' });                         
      585 +  });                                                         
      586 +                                                              
      587 +  it('Borda › Categoria nova no centro de custo', () => {     
      588 +    const [i] = rodar([{ categoria: 'representacao', valor: 34
          +0, tem_nota_fiscal: true }], comercial);                      
     … 29 more lines (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; npm run typecheck 2>&1 |
      grep error | head -3; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      374  > exato da coluna "Caso". Se um teste falhar, o conserto faz p
           arte da mesma task.
      375  > Os 4 casos de arquivo externo ficam na T-069.
      376  
      377 -- [ ] **T-061** — Casos de borda de centro de custo e tabela a
          -plicável em `tests/casos-de-borda.test.ts`                    
      377 +- [x] **T-061** — Casos de borda de centro de custo e tabela a
          +plicável em `tests/casos-de-borda.test.ts`                    
      378    - **Atende:** RN-002, RN-006, RN-009, RN-011, RN-016, AMB-02
           9, AMB-030, AMB-031, AMB-032, AMB-033
      379    - **Aceite:** passam `Borda › Centro de custo sem entrada na
            tabela`, `Borda › Colaborador sem centro de custo`, `Borda › 
           Centro de custo com outra grafia`, `Borda › Categoria herdada 
           do padrão`, `Borda › Categoria só em outro centro de custo`, `
           Borda › Categoria nova no centro de custo`, `Borda › Categoria
            com limite zero`, `Borda › Limite zero não gera viagem`, `Bor
           da › Limite zero vem antes da nota fiscal` e `Borda › Represen
           tação em dia de viagem`
      380 -  - **Commit:** `<hash preenchido depois>`                    
      380 +  - **Commit:** `0cf5429`                                     
      381  
      382  - [ ] **T-062** — Casos de borda de `moeda` e de valor inválid
           o com conversão em `tests/casos-de-borda.test.ts`
      383    - **Atende:** RN-003, RN-017, AMB-023, AMB-036, AMB-043

● T-062 — edge cases: moeda and invalid value with conversion

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; cat >>
      tests/casos-de-borda.test.ts <<'FIM'…)
  ⎿  Updated tests\casos-de-borda.test.ts (+55 -0)
      615      expect(r).toMatchObject({ limiteDiarioAplicado: 45000n, em
           Viagem: true });
      616    });
      617  });
      618 +                                                              
      619 +/** Moeda, valor original e os três campos de conversão de um 
          +item (seção 4). */                                            
      620 +function conversao(i: ResultadoItem | undefined) {            
      621 +  if (!i) throw new Error('item ausente');                    
      622 +  return {                                                    
      623 +    moeda: i.moeda,                                           
      624 +    original: i.valorOriginal,                                
      625 +    taxa: i.conversao?.taxa.texto ?? null,                    
      626 +    cotacao: i.conversao?.dataCotacao ?? null,                
      627 +    solicitado: i.valorSolicitado,                            
      628 +  };                                                          
      629 +}                                                             
      630 +                                                              
      631 +describe('Casos de borda — moeda e valor inválido com conversã
          +o', () => {                                                   
      632 +  it('Borda › Valor inválido em moeda estrangeira', () => {   
      633 +    const [i] = rodar([{ data: '2026-07-14', valor: 'R$ 45,00'
          +, moeda: 'EUR' }]);                                           
      634 +    expect(decisao(i)).toMatchObject({ status: 'RECUSADO', cod
          +igo: 'DADO_INVALIDO' });                                      
      635 +    expect(conversao(i)).toEqual({ moeda: 'EUR', original: nul
          +l, taxa: null, cotacao: null, solicitado: null });            
      636 +  });                                                         
      637 +                                                              
      638 +  it('Borda › Valor inválido em BRL', () => {                 
      639 +    const [i] = rodar([{ valor: true, moeda: undefined }]);   
      640 +    expect(decisao(i)).toMatchObject({ status: 'RECUSADO', cod
          +igo: 'DADO_INVALIDO' });                                      
      641 +    expect(conversao(i)).toEqual({ moeda: null, original: null
          +, taxa: null, cotacao: null, solicitado: null });             
      642 +  });                                                         
      643 +                                                              
      644 +  it('Borda › Moeda ausente', () => {                         
      645 +    const [i] = rodar([{ valor: 45, moeda: undefined }]);     
      646 +    expect(conversao(i)).toEqual({ moeda: 'BRL', original: 450
          +0n, taxa: '1', cotacao: null, solicitado: 4500n });           
      647 +    expect(decisao(i).codigo).toBe('APROVADO_INTEGRAL');      
      648 +  });                                                         
      649 +                                                              
      650 +  it('Borda › Moeda nula ou vazia', () => {                   
      651 +    for (const moeda of [null, '']) {                         
      652 +      expect(conversao(rodar([{ valor: 45, moeda }])[0]), Stri
          +ng(moeda)).toMatchObject({ moeda: 'BRL', taxa: '1', solicitado
          +: 4500n });                                                   
      653 +    }                                                         
      654 +  });                                                         
     … 18 more lines (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      379    - **Aceite:** passam `Borda › Centro de custo sem entrada na
            tabela`, `Borda › Colaborador sem centro de custo`, `Borda › 
           Centro de custo com outra grafia`, `Borda › Categoria herdada 
           do padrão`, `Borda › Categoria só em outro centro de custo`, `
           Borda › Categoria nova no centro de custo`, `Borda › Categoria
            com limite zero`, `Borda › Limite zero não gera viagem`, `Bor
           da › Limite zero vem antes da nota fiscal` e `Borda › Represen
           tação em dia de viagem`
      380    - **Commit:** `0cf5429`
      381  
      382 -- [ ] **T-062** — Casos de borda de `moeda` e de valor inválid
          -o com conversão em `tests/casos-de-borda.test.ts`             
      382 +- [x] **T-062** — Casos de borda de `moeda` e de valor inválid
          +o com conversão em `tests/casos-de-borda.test.ts`             
      383    - **Atende:** RN-003, RN-017, AMB-023, AMB-036, AMB-043
      384    - **Aceite:** passam `Borda › Valor inválido em moeda estran
           geira`, `Borda › Valor inválido em BRL`, `Borda › Moeda ausent
           e`, `Borda › Moeda nula ou vazia`, `Borda › Moeda em minúscula
           s`, `Borda › Moeda não textual` e `Borda › Moeda fora do câmbi
           o`
      385 -  - **Commit:** `<hash preenchido depois>`                    
      385 +  - **Commit:** `b7f5630`                                     
      386  
      387  - [ ] **T-063** — Casos de borda de conversão e do arquivo de 
           câmbio em `tests/casos-de-borda.test.ts` ("Moeda repetida no c
           âmbio" e "Moeda minúscula no câmbio" montam o câmbio a partir 
           do texto com `lerCambio`, R-14)
      388    - **Atende:** RN-001, RN-004, RN-005, RN-014, RN-017, AMB-03
           5, AMB-037, AMB-039, AMB-042

● T-063 — edge cases: conversion and exchange-rate file

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; cat >>
      tests/casos-de-borda.test.ts <<'FIM'…)
  ⎿  Updated tests\casos-de-borda.test.ts (+65 -0)
       6  import { tmpdir } from 'node:os';
       7  import { join } from 'node:path';
       8  import { afterAll, describe, expect, it } from 'vitest';
       9 +import { lerCambio } from '../src/io/cambio.ts';               
      10  import { serializarJson } from '../src/io/json.ts';
      11  import { montarSaida } from '../src/io/saida.ts';
      12  import { statusDe } from '../src/nucleo/status.ts';
     ...
      671      expect(i?.moeda).toBe('EURO');
      672    });
      673  });
      674 +                                                              
      675 +describe('Casos de borda — conversão e arquivo de câmbio', () 
          +=> {                                                          
      676 +  it('Borda › Conversão em dia útil', () => {                 
      677 +    expect(conversao(rodar([{ data: '2026-07-14', valor: 22, m
          +oeda: 'EUR' }])[0])).toEqual({                                
      678 +      moeda: 'EUR',                                           
      679 +      original: 2200n,                                        
      680 +      taxa: '5.93',                                           
      681 +      cotacao: '2026-07-14',                                  
      682 +      solicitado: 13046n,                                     
      683 +    });                                                       
      684 +  });                                                         
      685 +                                                              
      686 +  it('Borda › Conversão no fim de semana', () => {            
      687 +    expect(conversao(rodar([{ data: '2026-07-18', valor: 30, m
          +oeda: 'EUR' }])[0])).toMatchObject({                          
      688 +      taxa: '5.96',                                           
      689 +      cotacao: '2026-07-17',                                  
      690 +      solicitado: 17880n,                                     
      691 +    });                                                       
      692 +  });                                                         
      693 +                                                              
      694 +  it('Borda › Antes da primeira cotação', () => {             
      695 +    const [i] = rodar([{ data: '2026-07-10', valor: 10, moeda:
          + 'EUR' }]);                                                   
      696 +    expect(decisao(i)).toEqual({ status: 'RECUSADO', codigo: '
          +CAMBIO_INDISPONIVEL', solicitado: null, reembolsavel: 0n });  
      697 +  });                                                         
      698 +                                                              
      699 +  it('Borda › Moeda sem cotação', () => {                     
      700 +    const r = calcularV4(entrada([{ data: '2026-07-21', valor:
          + 55, moeda: 'GBP' }, { valor: 10, fornecedor: 'Y' }]));       
      701 +    expect(decisao(r.itens[0])).toEqual({ status: 'RECUSADO', 
          +codigo: 'CAMBIO_INDISPONIVEL', solicitado: null, reembolsavel:
          + 0n });                                                       
      702 +    expect(conversao(r.itens[0])).toMatchObject({ taxa: null, 
          +cotacao: null });                                             
      703 +    expect(r.resumo.totalSolicitado).toBe(1000n);             
     … 34 more lines (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      384    - **Aceite:** passam `Borda › Valor inválido em moeda estran
           geira`, `Borda › Valor inválido em BRL`, `Borda › Moeda ausent
           e`, `Borda › Moeda nula ou vazia`, `Borda › Moeda em minúscula
           s`, `Borda › Moeda não textual` e `Borda › Moeda fora do câmbi
           o`
      385    - **Commit:** `b7f5630`
      386  
      387 -- [ ] **T-063** — Casos de borda de conversão e do arquivo de 
          -câmbio em `tests/casos-de-borda.test.ts` ("Moeda repetida no c
          -âmbio" e "Moeda minúscula no câmbio" montam o câmbio a partir 
          -do texto com `lerCambio`, R-14)                               
      387 +- [x] **T-063** — Casos de borda de conversão e do arquivo de 
          +câmbio em `tests/casos-de-borda.test.ts` ("Moeda repetida no c
          +âmbio" e "Moeda minúscula no câmbio" montam o câmbio a partir 
          +do texto com `lerCambio`, R-14)                               
      388    - **Atende:** RN-001, RN-004, RN-005, RN-014, RN-017, AMB-03
           5, AMB-037, AMB-039, AMB-042
      389    - **Aceite:** passam `Borda › Conversão em dia útil`, `Borda
            › Conversão no fim de semana`, `Borda › Antes da primeira cot
           ação`, `Borda › Moeda sem cotação`, `Borda › Estrangeira fora 
           do período`, `Borda › Estrangeira negativa sem cotação`, `Bord
           a › Arredondamento da conversão`, `Borda › Moeda repetida no c
           âmbio` e `Borda › Moeda minúscula no câmbio`
      390 -  - **Commit:** `<hash preenchido depois>`                    
      390 +  - **Commit:** `ff88cbe`                                     
      391  
      392  - [ ] **T-064** — Casos de borda de nota fiscal e duplicata em
            moeda estrangeira em `tests/casos-de-borda.test.ts`
      393    - **Atende:** RN-007, RN-008, AMB-038

● T-064 — edge cases: NF and duplicates in foreign currency

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; cat >>
      tests/casos-de-borda.test.ts <<'FIM'…)
  ⎿  Updated tests\casos-de-borda.test.ts (+23 -0)
      735      expect(decisao(i).codigo).toBe('APROVADO_INTEGRAL');
      736    });
      737  });
      738 +                                                              
      739 +describe('Casos de borda — nota fiscal e duplicata em moeda es
          +trangeira', () => {                                           
      740 +  it('Borda › Nota fiscal sobre o valor convertido', () => {  
      741 +    const [i] = rodar([{ categoria: 'transporte_urbano', data:
          + '2026-07-20', valor: 40, moeda: 'USD', tem_nota_fiscal: false
          + }]);                                                         
      742 +    expect(decisao(i)).toEqual({ status: 'RECUSADO', codigo: '
          +NOTA_FISCAL_AUSENTE', solicitado: 22000n, reembolsavel: 0n });
      743 +  });                                                         
      744 +                                                              
      745 +  it('Borda › Estrangeira abaixo do limiar de NF', () => {    
      746 +    const [i] = rodar([{ data: '2026-07-15', valor: 14.5, moed
          +a: 'EUR', tem_nota_fiscal: false }]);                         
      747 +    expect(i?.valorSolicitado).toBe(8526n);                   
      748 +    // segue para o limite (alimentação 60,00 na tabela padrão
          +)                                                             
      749 +    expect(decisao(i)).toMatchObject({ status: 'PARCIAL', codi
          +go: 'LIMITE_DIARIO_EXCEDIDO', reembolsavel: 6000n });         
      750 +  });                                                         
      751 +                                                              
      752 +  it('Borda › Mesmo valor em moedas diferentes', () => {      
      753 +    const gasto = { data: '2026-07-14', categoria: 'transporte
          +_urbano', fornecedor: 'Bolt', valor: 20 };                    
      754 +    expect(codigos([{ ...gasto, moeda: 'EUR' }, { ...gasto, mo
          +eda: 'USD' }])).not.toContain('DUPLICATA');                   
      755 +  });                                                         
      756 +                                                              
      757 +  it('Borda › BRL explícito e implícito', () => {             
      758 +    expect(codigos([{ moeda: undefined }, { moeda: 'BRL' }])).
          +toEqual(['APROVADO_INTEGRAL', 'DUPLICATA']);                  
      759 +  });                                                         
      760 +});                                                           

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      389    - **Aceite:** passam `Borda › Conversão em dia útil`, `Borda
            › Conversão no fim de semana`, `Borda › Antes da primeira cot
           ação`, `Borda › Moeda sem cotação`, `Borda › Estrangeira fora 
           do período`, `Borda › Estrangeira negativa sem cotação`, `Bord
           a › Arredondamento da conversão`, `Borda › Moeda repetida no c
           âmbio` e `Borda › Moeda minúscula no câmbio`
      390    - **Commit:** `ff88cbe`
      391  
      392 -- [ ] **T-064** — Casos de borda de nota fiscal e duplicata em
          - moeda estrangeira em `tests/casos-de-borda.test.ts`          
      392 +- [x] **T-064** — Casos de borda de nota fiscal e duplicata em
          + moeda estrangeira em `tests/casos-de-borda.test.ts`          
      393    - **Atende:** RN-007, RN-008, AMB-038
      394    - **Aceite:** passam `Borda › Nota fiscal sobre o valor conv
           ertido`, `Borda › Estrangeira abaixo do limiar de NF`, `Borda 
           › Mesmo valor em moedas diferentes` e `Borda › BRL explícito e
            implícito`
      395 -  - **Commit:** `<hash preenchido depois>`                    
      395 +  - **Commit:** `c04c857`                                     
      396  
      397  - [ ] **T-065** — Casos de borda de aprovação manual em `tests
           /casos-de-borda.test.ts`
      398    - **Atende:** RN-010, RN-011, RN-012, RN-014, RN-018, AMB-04
           0, AMB-041

● T-065 — edge cases: manual approval

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; cat >>
      tests/casos-de-borda.test.ts <<'FIM'…)
  ⎿  Updated tests\casos-de-borda.test.ts (+61 -0)
      758      expect(codigos([{ moeda: undefined }, { moeda: 'BRL' }])).
           toEqual(['APROVADO_INTEGRAL', 'DUPLICATA']);
      759    });
      760  });
      761 +                                                              
      762 +describe('Casos de borda — aprovação manual', () => {         
      763 +  const comercial = { centroCusto: 'CC-COMERCIAL' };          
      764 +  const hospedagem = { categoria: 'hospedagem', data: '2026-07
          +-22', fornecedor: 'Hotel', tem_nota_fiscal: true };           
      765 +                                                              
      766 +  it('Borda › Reembolsável exatamente 500,00', () => {        
      767 +    const [i] = rodar([{ ...hospedagem, descricao: '2 diarias'
          +, valor: 500 }], comercial);                                  
      768 +    expect(decisao(i)).toMatchObject({ status: 'APROVADO', cod
          +igo: 'APROVADO_INTEGRAL', reembolsavel: 50000n });            
      769 +  });                                                         
      770 +                                                              
      771 +  it('Borda › Reembolsável acima de 500,00', () => {          
      772 +    const [i] = rodar([{ ...hospedagem, descricao: '2 diarias'
          +, valor: 500.02 }], comercial);                               
      773 +    expect(decisao(i)).toMatchObject({ status: 'PENDENTE', cod
          +igo: 'REQUER_APROVACAO', reembolsavel: 50002n });             
      774 +  });                                                         
      775 +                                                              
      776 +  it('Borda › Solicitado alto cortado pelo limite', () => {   
      777 +    const [i] = rodar([{ ...hospedagem, descricao: 'Hotel', va
          +lor: 1200 }]);                                                
      778 +    expect(decisao(i)).toMatchObject({ status: 'PARCIAL', codi
          +go: 'LIMITE_DIARIO_EXCEDIDO', reembolsavel: 25000n });        
      779 +  });                                                         
      780 +                                                              
      781 +  it('Borda › Pendente com corte de limite', () => {          
      782 +    const [i] = rodar([{ ...hospedagem, descricao: '2 diarias'
          +, valor: 1000 }], comercial);                                 
      783 +    expect(decisao(i)).toEqual({ status: 'PENDENTE', codigo: '
          +REQUER_APROVACAO', solicitado: 100000n, reembolsavel: 80000n }
          +);                                                            
      784 +    expect(i?.motivo.descricao).toContain('R$ 200,00');       
      785 +  });                                                         
      786 +                                                              
      787 +  it('Borda › Pendente consome o limite', () => {             
      788 +    const itens = rodar(                                      
      789 +      [                                                       
      790 +        { ...hospedagem, descricao: '2 diarias', valor: 800 },
      791 +        { ...hospedagem, descricao: '1 diaria', valor: 100, fo
          +rnecedor: 'Pousada' },                                        
      792 +      ],                                                      
      793 +      comercial,                                              
      794 +    );                                                        
      795 +    expect(itens.map((i) => [decisao(i).status, decisao(i).cod
          +igo, decisao(i).reembolsavel])).toEqual([                     
      796 +      ['PENDENTE', 'REQUER_APROVACAO', 80000n],               
      797 +      ['RECUSADO', 'LIMITE_DIARIO_ESGOTADO', 0n],             
     … 24 more lines (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      394    - **Aceite:** passam `Borda › Nota fiscal sobre o valor conv
           ertido`, `Borda › Estrangeira abaixo do limiar de NF`, `Borda 
           › Mesmo valor em moedas diferentes` e `Borda › BRL explícito e
            implícito`
      395    - **Commit:** `c04c857`
      396  
      397 -- [ ] **T-065** — Casos de borda de aprovação manual em `tests
          -/casos-de-borda.test.ts`                                      
      397 +- [x] **T-065** — Casos de borda de aprovação manual em `tests
          +/casos-de-borda.test.ts`                                      
      398    - **Atende:** RN-010, RN-011, RN-012, RN-014, RN-018, AMB-04
           0, AMB-041
      399    - **Aceite:** passam `Borda › Reembolsável exatamente 500,00
           `, `Borda › Reembolsável acima de 500,00`, `Borda › Solicitado
            alto cortado pelo limite`, `Borda › Pendente com corte de lim
           ite`, `Borda › Pendente consome o limite`, `Borda › Hospedagem
            pendente gera viagem` e `Borda › Pendente fora do total reemb
           olsável`
      400 -  - **Commit:** `<hash preenchido depois>`                    
      400 +  - **Commit:** `4462f33`                                     
      401  
      402  ### 5.4 Saída e CLI da v4
      403  

● T-066 — v4 output

● Write(src\io\saida.ts)  ⎿  Added 13 lines, removed 3 lines
      1 -// Resultado do núcleo → objeto da saída JSON (seção 4 da spec).
      1 +// Resultado do núcleo → objeto da saída JSON (seção 4 da spec, 
        +R-17).                                                          
      2  
      3  import { formatarDecimal } from '../nucleo/dinheiro.ts';
      4  import { statusDe } from '../nucleo/status.ts';
     ...
      13    return c === null ? null : dinheiro(c);
      14  }
      15  
      16 +/** Os 14 campos na ordem do exemplo da seção 4; os três de con
         +versão saem juntos de `conversao` (AMB-043). */                
      17  function item(i: ResultadoItem) {
      18 +  const { conversao } = i;                                     
      19    return {
      20      id: i.id,
      21      data: i.data,
      22      categoria: i.categoria,
      21 -    valor_solicitado: dinheiroOuNulo(i.valorSolicitado),       
      23 +    moeda: i.moeda,                                            
      24 +    valor_original: dinheiroOuNulo(i.valorOriginal),           
      25 +    // `taxa` é o `NumeroJson` do arquivo de câmbio: sai com o 
         +texto original (R-04).                                         
      26 +    taxa_cambio: conversao === null ? null : conversao.taxa,   
      27 +    data_cotacao: conversao === null ? null : conversao.dataCot
         +acao,                                                          
      28 +    valor_solicitado: conversao === null ? null : dinheiro(conv
         +ersao.valorSolicitado),                                        
      29      valor_reembolsavel: dinheiro(i.valorReembolsavel),
      30      status: statusDe(i),
      24 -    motivo: { codigo: i.motivo.codigo, descricao: i.motivo.desc
         -ricao },                                                       
      31      limite_diario_aplicado: dinheiroOuNulo(i.limiteDiarioAplica
          do),
      32      em_viagem: i.emViagem,
      33      diarias: i.diarias,
      34 +    motivo: { codigo: i.motivo.codigo, descricao: i.motivo.desc
         +ricao },                                                       
      35    };
      36  }
      37  
     ...
      44    return {
      45      colaborador: resultado.colaborador,
      46      periodo: resultado.periodo,
      47 +    politica: { versao: resultado.politica.versao, tabela: resu
         +ltado.politica.tabela },                                       
      48      itens: resultado.itens.map(item),
      49      resumo: {
      50        quantidade_itens: resumo.quantidadeItens,
      51        aprovados: resumo.aprovados,
      52        parciais: resumo.parciais,
      53        recusados: resumo.recusados,
      54 +      pendentes: resumo.pendentes,                             
      55        total_solicitado: dinheiro(resumo.totalSolicitado),
      56        total_reembolsavel: dinheiro(resumo.totalReembolsavel),
      57 +      total_pendente: dinheiro(resumo.totalPendente),          
      58        total_nao_reembolsado: dinheiro(resumo.totalNaoReembolsad
          o),
      59      },
      60    };

  Read 1 file (ctrl+o to expand)

● The v1 key-order assertion in the RN-001 test now contradicts §4 (v2.2); I'll
  move key order into the new Infra › test and keep RN-001 about two-decimal
  money.

● Update(tests\io\saida.test.ts)
  ⎿  Added 83 lines, removed 3 lines
       25      expect(texto).toContain('"total_solicitado": 110.50');
       26      expect(texto).toContain('"total_nao_reembolsado": 50.50');
       27      expect(texto).not.toMatch(/"(valor_\w+|total_\w+|limite_di
           ario_aplicado)": -?\d+(\.\d)?,?\n/);
       28 +    expect(texto).toContain('"valor_original": 72.50');       
       29 +    expect(texto).toContain('"total_pendente": 0.00');        
       30      const json = JSON.parse(texto);
       31      expect(json.itens[0].valor_reembolsavel).toBe(60);
       30 -    expect(Object.keys(json)).toEqual(['colaborador', 'periodo
          -', 'itens', 'resumo']);                                       
       31 -    expect(Object.keys(json.itens[0])).toEqual([              
       32 +  });                                                         
       33 +                                                              
       34 +  it('Infra › saída: campos do item na ordem da seção 4 (id … 
          +diarias, motivo) e politica entre periodo e itens', () => {   
       35 +    const json = JSON.parse(                                  
       36 +      saida(`{${cabecalho}, "despesas": [                     
       37 +        {"id": "a", "data": "2026-07-03", "categoria": "alimen
          +tacao", "valor": 45, "tem_nota_fiscal": true},                
       38 +        {"id": "b", "data": "2026-07-32", "categoria": "alimen
          +tacao", "valor": 45},                                         
       39 +        42                                                    
       40 +      ]}`),                                                   
       41 +    );                                                        
       42 +    expect(Object.keys(json)).toEqual(['colaborador', 'periodo
          +', 'politica', 'itens', 'resumo']);                           
       43 +    const campos = [                                          
       44        'id',
       45        'data',
       46        'categoria',
       47 +      'moeda',                                                
       48 +      'valor_original',                                       
       49 +      'taxa_cambio',                                          
       50 +      'data_cotacao',                                         
       51        'valor_solicitado',
       52        'valor_reembolsavel',
       53        'status',
       38 -      'motivo',                                               
       54        'limite_diario_aplicado',
       55        'em_viagem',
       56        'diarias',
       57 +      'motivo',                                               
       58 +    ];                                                        
       59 +    for (const i of json.itens) expect(Object.keys(i)).toEqual
          +(campos);                                                     
       60 +    expect(Object.keys(json.resumo)).toEqual([                
       61 +      'quantidade_itens',                                     
       62 +      'aprovados',                                            
       63 +      'parciais',                                             
       64 +      'recusados',                                            
       65 +      'pendentes',                                            
       66 +      'total_solicitado',                                     
       67 +      'total_reembolsavel',                                   
       68 +      'total_pendente',                                       
       69 +      'total_nao_reembolsado',                                
       70      ]);
       71    });
       72  
       73 +  it('RN-017 › taxa_cambio sai com o texto do arquivo (5.90 co
          +ntinua 5.90) e 1 em BRL', () => {                             
       74 +    const texto = saida(`{${cabecalho}, "despesas": [         
       75 +      {"id": "a", "data": "2026-07-16", "categoria": "alimenta
          +cao", "valor": 10, "moeda": "EUR", "tem_nota_fiscal": true},  
       76 +      {"id": "b", "data": "2026-07-03", "categoria": "alimenta
          +cao", "valor": 10, "tem_nota_fiscal": true},                  
       77 +      {"id": "c", "data": "2026-07-21", "categoria": "alimenta
          +cao", "valor": 10, "moeda": "GBP", "tem_nota_fiscal": true}   
       78 +    ]}`);                                                     
       79 +    expect(texto).toContain('"taxa_cambio": 5.90,');          
       80 +    expect(texto).toContain('"data_cotacao": "2026-07-16"');  
       81 +    expect(texto).toContain('"valor_solicitado": 59.00');     
       82 +    expect(texto).toContain('"taxa_cambio": 1,');             
       83 +    const [eur, brl, gbp] = JSON.parse(texto).itens;          
       84 +    expect([eur.moeda, eur.valor_original, eur.taxa_cambio]).t
          +oEqual(['EUR', 10, 5.9]);                                     
       85 +    expect([brl.moeda, brl.taxa_cambio, brl.data_cotacao, brl.
          +valor_solicitado]).toEqual(['BRL', 1, null, 10]);             
       86 +    expect([gbp.taxa_cambio, gbp.data_cotacao, gbp.valor_solic
          +itado, gbp.valor_original]).toEqual([null, null, null, 10]);  
       87 +  });                                                         
       88 +                                                              
       89 +  it('RN-003 › DADO_INVALIDO: moeda sai como veio (978 → 978, 
          +ausente → null)', () => {                                     
       90 +    const texto = saida(`{${cabecalho}, "despesas": [         
       91 +      {"id": "a", "data": "2026-07-03", "categoria": "alimenta
          +cao", "valor": 10, "moeda": 978.0},                           
       92 +      {"id": "b", "data": "2026-07-32", "categoria": "alimenta
          +cao", "valor": 10},                                           
       93 +      {"id": "c", "data": "2026-07-32", "categoria": "alimenta
          +cao", "valor": 10, "moeda": " eur "}                          
       94 +    ]}`);                                                     
       95 +    expect(texto).toContain('"moeda": 978.0,');               
       96 +    const [a, b, c] = JSON.parse(texto).itens;                
       97 +    expect([a.moeda, b.moeda, c.moeda]).toEqual([978, null, ' 
          +eur ']);                                                      
       98 +    expect([a.motivo.codigo, b.motivo.codigo, c.motivo.codigo]
          +).toEqual(Array(3).fill('DADO_INVALIDO'));                    
       99 +    // BRL com data inválida sai com taxa 1; EUR com data invá
          +lida, sem conversão                                           
      100 +    expect([b.taxa_cambio, b.valor_solicitado, c.taxa_cambio, 
          +c.valor_solicitado]).toEqual([1, 10, null, null]);            
      101 +  });                                                         
      102 +                                                              
      103 +  it('RN-016 › saída traz politica { versao: "v4", tabela }', 
          +() => {                                                       
      104 +    const colaborador = (cc: string) => `"colaborador": {"id":
          + "c-1", "centro_custo": "${cc}"}`;                            
      105 +    const periodo = '"periodo": {"inicio": "2026-07-01", "fim"
          +: "2026-07-31"}';                                             
      106 +    expect(JSON.parse(saida(`{${cabecalho}, "despesas": []}`))
          +.politica).toEqual({ versao: 'v4', tabela: 'padrao' });       
      107 +    expect(JSON.parse(saida(`{${colaborador(' cc-adm ')}, ${pe
          +riodo}, "despesas": []}`)).politica).toEqual({                
      108 +      versao: 'v4',                                           
      109 +      tabela: 'CC-ADM',                                       
      110 +    });                                                       
      111 +  });                                                         
      112 +                                                              
      113 +  it('RN-014 › resumo traz pendentes e total_pendente com duas
          + casas', () => {                                              
      114 +    const texto = saida(`{"colaborador": {"id": "c-1", "centro
          +_custo": "CC-COMERCIAL"}, "periodo": {"inicio": "2026-07-01", 
          +"fim": "2026-07-31"}, "despesas": [                           
      115 +      {"id": "h", "data": "2026-07-22", "categoria": "hospedag
          +em", "descricao": "3 noites", "valor": 1200, "tem_nota_fiscal"
          +: true},                                                      
      116 +      {"id": "a", "data": "2026-07-27", "categoria": "alimenta
          +cao", "valor": 88, "tem_nota_fiscal": true}                   
      117 +    ]}`);                                                     
      118 +    expect(texto).toContain('"pendentes": 1,');               
      119 +    expect(texto).toContain('"total_pendente": 1200.00,');    
      120 +    expect(texto).toContain('"total_reembolsavel": 88.00,');  
      121 +    expect(texto).toContain('"total_nao_reembolsado": 0.00'); 
      122 +    expect(texto).toContain('"status": "PENDENTE"');          
      123 +  });                                                         
      124 +                                                              
      125    it('RN-003 › eco de campo inválido sai como veio (categoria 
           123 → 123, "  " → "  ", ausente → null)', () => {
      126      const json = JSON.parse(
      127        saida(`{${cabecalho}, "despesas": [

● Now the contract tests.

● Update(tests\contrato-saida.test.ts)
  ⎿  Added 26 lines
      45      expect(json.itens.slice(0, 4).map((i) => i.motivo.codigo)).
          toEqual(Array(4).fill('DADO_INVALIDO'));
      46      expect(json.itens[0]?.valor_solicitado).toBeNull();
      47    });
      48 +                                                               
      49 +  it('RN-013 › saída do envelope (PENDENTE, CAMBIO_INDISPONIVEL
         +, moeda estrangeira) valida contra o schema', () => {          
      50 +    const json = saida(readFileSync('exemplos/envelope/despesas
         +-envelope.json', 'utf8')) as {                                 
      51 +      itens: { status: string; motivo: { codigo: string }; moed
         +a: string }[];                                                 
      52 +    };                                                         
      53 +    conferir(json);                                            
      54 +    expect(json.itens.map((i) => i.status)).toContain('PENDENTE
         +');                                                            
      55 +    expect(json.itens.map((i) => i.motivo.codigo)).toContain('C
         +AMBIO_INDISPONIVEL');                                          
      56 +    expect(json.itens.map((i) => i.moeda)).toEqual(expect.array
         +Containing(['EUR', 'USD', 'GBP', 'BRL']));                     
      57 +    conferir(saida(readFileSync('exemplos/envelope/despesas-env
         +elope-cc-desconhecido.json', 'utf8')));                        
      58 +  });                                                          
      59 +                                                               
      60 +  it('RN-013 › item com taxa_cambio e valor_solicitado nulo é r
         +ejeitado pelo schema (AMB-043)', () => {                       
      61 +    const json = saida(readFileSync('exemplos/envelope/despesas
         +-envelope.json', 'utf8')) as { itens: Record<string, unknown>[]
         + };                                                            
      62 +    const e002 = json.itens[1]!;                               
      63 +    expect(e002.taxa_cambio).toBe(5.93);                       
      64 +    e002.valor_solicitado = null;                              
      65 +    expect(validar(json)).toBe(false);                         
      66 +    // os três nulos juntos são válidos                        
      67 +    e002.taxa_cambio = null;                                   
      68 +    e002.data_cotacao = null;                                  
      69 +    expect(validar(json)).toBe(true);                          
      70 +    // PENDENTE só com REQUER_APROVACAO                        
      71 +    (json.itens[6]!.motivo as { codigo: string }).codigo = 'APR
         +OVADO_INTEGRAL';                                               
      72 +    expect(validar(json)).toBe(false);                         
      73 +  });                                                          
      74  });

  Ran 1 shell command (ctrl+o to expand)

● Contract tests are green again; the only red left is the 4 edge cases slated
  for T-069. Committing T-066.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      401  
      402  ### 5.4 Saída e CLI da v4
      403  
      404 -- [ ] **T-066** — Saída da v4 em `src/io/saida.ts` (estende T-
          -035, R-17): bloco `politica` (`versao`, `tabela`) entre `perio
          -do` e `itens`; item com os 14 campos na ordem `id`, `data`, `c
          -ategoria`, `moeda`, `valor_original`, `taxa_cambio`, `data_cot
          -acao`, `valor_solicitado`, `valor_reembolsavel`, `status`, `li
          -mite_diario_aplicado`, `em_viagem`, `diarias`, `motivo`; `taxa
          -_cambio` via `JSON.rawJSON` do texto do arquivo (`1` em BRL); 
          -os três campos de conversão saem de `conversao` (nulos juntos)
          -; `moeda` de item `DADO_INVALIDO` sai como veio; resumo com `p
          -endentes` e `total_pendente`                                  
      404 +- [x] **T-066** — Saída da v4 em `src/io/saida.ts` (estende T-
          +035, R-17): bloco `politica` (`versao`, `tabela`) entre `perio
          +do` e `itens`; item com os 14 campos na ordem `id`, `data`, `c
          +ategoria`, `moeda`, `valor_original`, `taxa_cambio`, `data_cot
          +acao`, `valor_solicitado`, `valor_reembolsavel`, `status`, `li
          +mite_diario_aplicado`, `em_viagem`, `diarias`, `motivo`; `taxa
          +_cambio` via `JSON.rawJSON` do texto do arquivo (`1` em BRL); 
          +os três campos de conversão saem de `conversao` (nulos juntos)
          +; `moeda` de item `DADO_INVALIDO` sai como veio; resumo com `p
          +endentes` e `total_pendente`                                  
      405    - **Atende:** RN-003, RN-013, RN-014, RN-016, RN-017, AMB-02
           3, AMB-043
      406    - **Aceite:** em `tests/io/saida.test.ts` passam `Infra › sa
           ída: campos do item na ordem da seção 4 (id … diarias, motivo)
            e politica entre periodo e itens`, `RN-017 › taxa_cambio sai 
           com o texto do arquivo (5.90 continua 5.90) e 1 em BRL`, `RN-0
           03 › DADO_INVALIDO: moeda sai como veio (978 → 978, ausente → 
           null)`, `RN-016 › saída traz politica { versao: "v4", tabela }
           ` e `RN-014 › resumo traz pendentes e total_pendente com duas 
           casas`; em `tests/contrato-saida.test.ts` voltam a passar os d
           ois testes da T-037 e passam `RN-013 › saída do envelope (PEND
           ENTE, CAMBIO_INDISPONIVEL, moeda estrangeira) valida contra o 
           schema` e `RN-013 › item com taxa_cambio e valor_solicitado nu
           lo é rejeitado pelo schema (AMB-043)`
      407 -  - **Commit:** `<hash preenchido depois>`                    
      407 +  - **Commit:** `fc71db2`                                     
      408  
      409  - [ ] **T-067** — [P] Exemplos oficiais em `tests/exemplo.test
           .ts` (estende T-051): lê os três arquivos da seção 9 com a tab
           ela e o câmbio de `exemplos/envelope/`, roda `validarEntrada` 
           → motor → `montarSaida` e compara com as três tabelas e os trê
           s resumos. Um `it` por despesa (moeda, original, taxa, data da
            cotação, solicitado, reembolsável, status, código)
      410    - **Atende:** RN-001, RN-004, RN-005, RN-006, RN-007, RN-008
           , RN-009, RN-010, RN-011, RN-012, RN-013, RN-014, RN-016, RN-0
           17, RN-018 (seção 9)

● T-067 — the three official examples

  Read 1 file (ctrl+o to expand)

● Update(tests\exemplo.test.ts)
  ⎿  Added 29 lines, removed 6 lines
      10  
      11  interface ItemSaida {
      12    id: string;
      13 +  moeda: string;                                               
      14 +  valor_original: number | null;                               
      15 +  taxa_cambio: number | null;                                  
      16 +  data_cotacao: string | null;                                 
      17    valor_solicitado: number | null;
      18    valor_reembolsavel: number;
      19    status: string;
     ...
      23    diarias: number | null;
      24  }
      25  
      22 -const resultado = calcularV4(lerEntrada(readFileSync('exemplos/
         -despesas-exemplo.json', 'utf8')));                             
      23 -const texto = serializarJson(montarSaida(resultado));          
      24 -const saida = JSON.parse(texto) as { itens: ItemSaida[]; resumo
         -: Record<string, number> };                                    
      26 +interface Saida {                                              
      27 +  politica: { versao: string; tabela: string };                
      28 +  itens: ItemSaida[];                                          
      29 +  resumo: Record<string, number>;                              
      30 +}                                                              
      31  
      26 -function item(id: string): ItemSaida {                         
      27 -  const encontrado = saida.itens.find((i) => i.id === id);     
      32 +/** Arquivo da seção 9 → texto e JSON da saída, como o CLI grav
         +aria. */                                                       
      33 +function processar(caminho: string) {                          
      34 +  const resultado = calcularV4(lerEntrada(readFileSync(caminho,
         + 'utf8')));                                                    
      35 +  const texto = serializarJson(montarSaida(resultado));        
      36 +  return { resultado, texto, saida: JSON.parse(texto) as Saida 
         +};                                                             
      37 +}                                                              
      38 +                                                               
      39 +const { resultado, texto, saida } = processar('exemplos/despesa
         +s-exemplo.json');                                              
      40 +const envelope = processar('exemplos/envelope/despesas-envelope
         +.json');                                                       
      41 +const ccDesconhecido = processar('exemplos/envelope/despesas-en
         +velope-cc-desconhecido.json');                                 
      42 +                                                               
      43 +function item(id: string, de: Saida = saida): ItemSaida {      
      44 +  const encontrado = de.itens.find((i) => i.id === id);        
      45    if (!encontrado) throw new Error(`item ${id} ausente`);
      46    return encontrado;
      47  }
      48  
      32 -/** Linha da tabela da seção 9: solicitado, reembolsável, statu
         -s, código. */                                                  
      49 +/** Linha da tabela 1 da seção 9: solicitado, reembolsável, sta
         +tus, código. */                                                
      50  function linha(id: string) {
      51    const i = item(id);
      52    return [i.valor_solicitado, i.valor_reembolsavel, i.status, i
          .motivo.codigo];
      53  }
      54  
      55 +/** Linha das tabelas 2 e 3 da seção 9: moeda, original, taxa, 
         +data da cotação, solicitado, reembolsável, status, código. */  
      56 +function linhaV4(de: Saida, id: string) {                      
      57 +  const i = item(id, de);                                      
      58 +  return [i.moeda, i.valor_original, i.taxa_cambio, i.data_cota
         +cao, i.valor_solicitado, i.valor_reembolsavel, i.status, i.moti
         +vo.codigo];                                                    
      59 +}                                                              
      60 +                                                               
      61  describe('Exemplo oficial (seção 9, CC-ENG-PLATAFORMA)', () => 
          {
      62    it('RN-009 › exemplo d-001: APROVADO 72,50 (limite 75,00 do C
          C-ENG-PLATAFORMA)', () => {
      63      expect(linha('d-001')).toEqual([72.5, 72.5, 'APROVADO', 'AP
          ROVADO_INTEGRAL']);

  Read 1 file (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; node - <<'JS'
      const fs = require('fs');…)
  ⎿  Updated tests\exemplo.test.ts (+122 -6)
      123      expect(item('d-014')).toMatchObject({ limite_diario_aplica
           do: 75, em_viagem: false });
      124    });
      125  
      126 -  it('RN-014 › exemplo: resumo 1861.84 / 351.43 / 1510.41 · 5/
          -2/7', () => {                                                 
      126 +  it('RN-014 › exemplo: resumo 1861.84 / 351.43 / 0.00 / 1510.
          +41 · 5/2/7/0', () => {                                        
      127      expect(saida.itens.map((i) => i.id)).toEqual(Array.from({ 
           length: 14 }, (_, k) => `d-${String(k + 1).padStart(3, '0')}`)
           );
      128 -    expect(saida.resumo).toMatchObject({                      
      128 +    expect(saida.resumo).toEqual({                            
      129        quantidade_itens: 14,
      130        aprovados: 5,
      131        parciais: 2,
      132        recusados: 7,
      133 +      pendentes: 0,                                           
      134        total_solicitado: 1861.84,
      135        total_reembolsavel: 351.43,
      136 +      total_pendente: 0,                                      
      137        total_nao_reembolsado: 1510.41,
      138      });
      139      expect(texto).toContain('"total_reembolsavel": 351.43');
      140 +    expect(texto).toContain('"total_pendente": 0.00');        
      141      expect(texto).toContain('"total_nao_reembolsado": 1510.41'
           );
      142    });
      143  
      144    it('RN-016 › exemplo: tabela aplicada CC-ENG-PLATAFORMA', ()
            => {
      145      expect(resultado.politica).toEqual({ versao: 'v4', tabela:
            'CC-ENG-PLATAFORMA' });
      146 +    expect(saida.politica).toEqual({ versao: 'v4', tabela: 'CC
          +-ENG-PLATAFORMA' });                                          
      147    });
      148 +});                                                           
      149 +                                                              
      150 +describe('Exemplo do envelope (seção 9, CC-COMERCIAL)', () => 
          +{                                                             
      151 +  const e = envelope.saida;                                   
      152 +                                                              
      153 +  it('RN-010 › envelope e-001: representacao 340,00 → PARCIAL 
          +300,00', () => {                                              
      154 +    expect(linhaV4(e, 'e-001')).toEqual(['BRL', 340, 1, null, 
          +340, 300, 'PARCIAL', 'LIMITE_DIARIO_EXCEDIDO']);              
      155 +    expect(item('e-001', e)).toMatchObject({ categoria: 'repre
          +sentacao', em_viagem: false, limite_diario_aplicado: 300 });  
      156 +  });                                                         
      157 +                                                              
      158 +  it('RN-017 › envelope e-002: EUR 22,00 × 5.93 (07-14) = 130,
          +46 → PARCIAL 90,00', () => {                                  
      159 +    expect(linhaV4(e, 'e-002')).toEqual(['EUR', 22, 5.93, '202
          +6-07-14', 130.46, 90, 'PARCIAL', 'LIMITE_DIARIO_EXCEDIDO']);  
      160 +  });                                                         
     … 111 more lines (ctrl+o to expand)

● All 35 example tests pass. Committing T-067.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      406    - **Aceite:** em `tests/io/saida.test.ts` passam `Infra › sa
           ída: campos do item na ordem da seção 4 (id … diarias, motivo)
            e politica entre periodo e itens`, `RN-017 › taxa_cambio sai 
           com o texto do arquivo (5.90 continua 5.90) e 1 em BRL`, `RN-0
           03 › DADO_INVALIDO: moeda sai como veio (978 → 978, ausente → 
           null)`, `RN-016 › saída traz politica { versao: "v4", tabela }
           ` e `RN-014 › resumo traz pendentes e total_pendente com duas 
           casas`; em `tests/contrato-saida.test.ts` voltam a passar os d
           ois testes da T-037 e passam `RN-013 › saída do envelope (PEND
           ENTE, CAMBIO_INDISPONIVEL, moeda estrangeira) valida contra o 
           schema` e `RN-013 › item com taxa_cambio e valor_solicitado nu
           lo é rejeitado pelo schema (AMB-043)`
      407    - **Commit:** `fc71db2`
      408  
      409 -- [ ] **T-067** — [P] Exemplos oficiais em `tests/exemplo.test
          -.ts` (estende T-051): lê os três arquivos da seção 9 com a tab
          -ela e o câmbio de `exemplos/envelope/`, roda `validarEntrada` 
          -→ motor → `montarSaida` e compara com as três tabelas e os trê
          -s resumos. Um `it` por despesa (moeda, original, taxa, data da
          - cotação, solicitado, reembolsável, status, código)           
      409 +- [x] **T-067** — [P] Exemplos oficiais em `tests/exemplo.test
          +.ts` (estende T-051): lê os três arquivos da seção 9 com a tab
          +ela e o câmbio de `exemplos/envelope/`, roda `validarEntrada` 
          +→ motor → `montarSaida` e compara com as três tabelas e os trê
          +s resumos. Um `it` por despesa (moeda, original, taxa, data da
          + cotação, solicitado, reembolsável, status, código)           
      410    - **Atende:** RN-001, RN-004, RN-005, RN-006, RN-007, RN-008
           , RN-009, RN-010, RN-011, RN-012, RN-013, RN-014, RN-016, RN-0
           17, RN-018 (seção 9)
      411    - **Aceite:** passam os `it` da T-051 e da T-052 (com `RN-01
           4 › exemplo: resumo 1861.84 / 351.43 / 0.00 / 1510.41 · 5/2/7/
           0` no lugar do resumo da T-051), `RN-010 › envelope e-001: rep
           resentacao 340,00 → PARCIAL 300,00`, `RN-017 › envelope e-002:
            EUR 22,00 × 5.93 (07-14) = 130,46 → PARCIAL 90,00`, `RN-017 ›
            envelope e-003: EUR 14,50 × 5.88 (07-15) = 85,26 → APROVADO 8
           5,26`, `RN-017 › envelope e-004: EUR 30,00 × 5.96 (07-17) = 17
           8,80 → PARCIAL 90,00`, `RN-008 › envelope e-005: USD 40,00 × 5
           .50 = 220,00 → NOTA_FISCAL_AUSENTE`, `RN-017 › envelope e-006:
            GBP → CAMBIO_INDISPONIVEL, conversão nula`, `RN-018 › envelop
           e e-007: PENDENTE 1.200,00, diarias 3`, `RN-011 › envelope e-0
           08: APROVADO 95,00, em_viagem, limite 135,00`, `RN-006 › envel
           ope e-009: coworking → CATEGORIA_NAO_REEMBOLSAVEL`, `RN-017 › 
           envelope e-010: sem moeda → BRL, taxa 1, APROVADO 88,00`, `RN-
           014 › envelope: resumo 2457.52 / 748.26 / 1200.00 / 509.26 · 3
           /3/3/1`, `RN-016 › envelope: tabela aplicada CC-COMERCIAL`, `R
           N-016 › cc-desconhecido f-001: APROVADO 58,00 (tabela padrão)`
           , `RN-012 › cc-desconhecido f-002: PARCIAL 250,00`, `RN-006 › 
           cc-desconhecido f-003: representacao → CATEGORIA_NAO_REEMBOLSA
           VEL`, `RN-017 › cc-desconhecido f-004: USD 12,00 × 5.48 (07-21
           ) = 65,76 → APROVADO`, `RN-014 › cc-desconhecido: resumo 623.7
           6 / 373.76 / 0.00 / 250.00 · 2/1/1/0`, `RN-016 › cc-desconheci
           do: politica.tabela "padrao"` e `RN-013 › exemplos: nenhum ite
           m com motivo ausente ou vazio nos três arquivos`
      412 -  - **Commit:** `<hash preenchido depois>`                    
      412 +  - **Commit:** `2975363`                                     
      413  
      414  - [ ] **T-068** — [P] CLI da v4 em `src/cli.ts` e `tests/cli.t
           est.ts` (estende T-038, R-08, R-11): a linha de resumo no `std
           out` inclui o total pendente quando houver; helper de teste qu
           e copia `src/`, `dados/` e `package.json` para uma pasta tempo
           rária e roda o CLI dessa cópia com um arquivo de `dados/` troc
           ado ou removido
      415    - **Atende:** RN-015, RN-016, RN-017, AMB-028, AMB-032, AMB-
           044

● T-068 — CLI v4 (pending total in stdout; temp-copy helper)

● Update(src\cli.ts)
  ⎿  Added 3 lines, removed 1 line
      59      const { politica, cambio } = lerExternos(); // entrada → ta
          bela de limites → câmbio (R-12)
      60      const resultado = calcular(entrada, politica, cambio);
      61      conteudo = serializarJson(montarSaida(resultado));
      62 -    resumo = `${resultado.resumo.quantidadeItens} itens process
         -ados; total reembolsável ${formatarReais(resultado.resumo.total
         -Reembolsavel)}`;                                               
      62 +    const { quantidadeItens, totalReembolsavel, totalPendente }
         + = resultado.resumo;                                           
      63 +    resumo = `${quantidadeItens} itens processados; total reemb
         +olsável ${formatarReais(totalReembolsavel)}`;                  
      64 +    if (totalPendente > 0n) resumo += `; total pendente de apro
         +vação ${formatarReais(totalPendente)}`;                        
      65    } catch (e) {
      66      if (e instanceof ErroEntrada) throw new Falha(`erro: ${e.me
          ssage}`, 1);
      67      throw e;

● Update(tests\apoio.ts)
  ⎿  Added 4 lines, removed 1 line
       1  // Apoio aos testes: monta despesas brutas como sairiam do leit
          or de JSON, com
       2  // a tabela de limites da fixture da v4 (R-10).
       3  
       4 -import { readFileSync } from 'node:fs';                        
       4 +import { spawnSync } from 'node:child_process';                
       5 +import { cpSync, mkdtempSync, readFileSync } from 'node:fs';   
       6 +import { tmpdir } from 'node:os';                              
       7 +import { join, resolve } from 'node:path';                     
       8  import { expect } from 'vitest';
       9  import { lerCambio } from '../src/io/cambio.ts';
      10  import { lerJson } from '../src/io/json.ts';

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; cat >> tests/apoio.ts
      <<'FIM'…)
  ⎿  Updated tests\apoio.ts (+28 -0)
      155  export function decisoes(despesas: (Record<string, unknown> | 
           Cru)[], opcoes: Opcoes = {}) {
      156    return rodar(despesas, opcoes).map((i) => [statusDe(i), i.mo
           tivo.codigo, i.valorReembolsavel] as const);
      157  }
      158 +                                                              
      159 +// -----------------------------------------------------------
          +----------------                                              
      160 +// CLI em processo filho (R-11): o projeto, ou uma cópia com d
          +ados/ trocado                                                 
      161 +// -----------------------------------------------------------
          +----------------                                              
      162 +                                                              
      163 +/** Raiz do repositório. */                                   
      164 +export const RAIZ = resolve('.');                             
      165 +                                                              
      166 +/**                                                           
      167 + * Copia `src/`, `dados/` e `package.json` para uma pasta temp
          +orária (é o que                                               
      168 + * o README ensina para testar outra tabela). Devolve a raiz d
          +a cópia; quem                                                 
      169 + * chama remove a pasta.                                      
      170 + */                                                           
      171 +export function copiaDoProjeto(): string {                    
      172 +  const raiz = mkdtempSync(join(tmpdir(), 'reembolso-copia-'))
          +;                                                             
      173 +  for (const item of ['src', 'dados', 'package.json']) cpSync(
          +join(RAIZ, item), join(raiz, item), { recursive: true });     
      174 +  return raiz;                                                
      175 +}                                                             
      176 +                                                              
      177 +/** Roda `node <raiz>/src/cli.ts ...args` a partir de `cwd`. *
          +/                                                             
      178 +export function rodarCli(args: string[], { raiz = RAIZ, cwd = 
          +RAIZ, env = {} }: { raiz?: string; cwd?: string; env?: Record<
          +string, string> } = {}) {                                     
      179 +  const r = spawnSync(process.execPath, [join(raiz, 'src', 'cl
          +i.ts'), ...args], {                                           
      180 +    cwd,                                                      
      181 +    encoding: 'utf8',                                         
      182 +    env: { ...process.env, ...env },                          
      183 +  });                                                         
      184 +  return { codigo: r.status, stdout: r.stdout, stderr: r.stder
          +r };                                                          
      185 +}                                                             

● Now the seven CLI tests.

● Update(tests\cli.test.ts)
  ⎿  Added 76 lines
      109      expect(existsSync(saida)).toBe(false);
      110    });
      111  
      112 +  it('RN-015 › CLI: "centro_custo": 42 → código 1, stderr cita
          + colaborador.centro_custo, nenhum arquivo de saída', () => {  
      113 +    const saida = arquivo();                                  
      114 +    const entrada = '{"colaborador": {"id": "c-1", "centro_cus
          +to": 42}, "periodo": {"inicio": "2026-07-01", "fim": "2026-07-
          +31"}, "despesas": []}';                                       
      115 +    const r = calcular(arquivo(entrada), saida);              
      116 +    expect(r.codigo).toBe(1);                                 
      117 +    expect(r.stderr).toMatch(/^erro: .*colaborador\.centro_cus
          +to/);                                                         
      118 +    expect(existsSync(saida)).toBe(false);                    
      119 +  });                                                         
      120 +                                                              
      121 +  it('RN-015 › CLI: dados/cambio.json ausente (cópia temporári
          +a) → código 1, stderr cita o arquivo de câmbio, nenhum arquivo
          + de saída', () => {                                           
      122 +    const raiz = copia();                                     
      123 +    rmSync(join(raiz, 'dados', 'cambio.json'));               
      124 +    const saida = arquivo();                                  
      125 +    const r = rodarCli(['calcular', '--input', resolve('exempl
          +os/despesas-exemplo.json'), '--output', saida], { raiz, cwd: r
          +aiz });                                                       
      126 +    expect(r.codigo).toBe(1);                                 
      127 +    expect(r.stderr).toBe('erro: arquivo de câmbio (dados/camb
          +io.json): arquivo não encontrado\n');                         
      128 +    expect(existsSync(saida)).toBe(false);                    
      129 +  });                                                         
      130 +                                                              
      131 +  it('RN-015 › CLI: limite negativo em dados/politica.json (có
          +pia temporária) → código 1, stderr cita a tabela de limites e 
          +o campo', () => {                                             
      132 +    const raiz = copia();                                     
      133 +    trocarPolitica(raiz, (texto) => texto.replace('"limite": 4
          +5.00', '"limite": -10'));                                     
      134 +    const saida = arquivo();                                  
      135 +    const r = rodarCli(['calcular', '--input', resolve('exempl
          +os/despesas-exemplo.json'), '--output', saida], { raiz });    
      136 +    expect(r.codigo).toBe(1);                                 
      137 +    expect(r.stderr).toMatch(/^erro: tabela de limites \(dados
          +\/politica\.json\): centros_custo\.CC-ADM\.alimentacao\.limite
          +/);                                                           
      138 +    expect(existsSync(saida)).toBe(false);                    
      139 +  });                                                         
      140 +                                                              
      141 +  it('RN-016 › CLI: padrao.hospedagem.limite 320.00 em dados/ 
          +(cópia temporária) muda f-002 de PARCIAL 250,00 para APROVADO 
          +310,00 sem mudar o código', () => {                           
      142 +    const raiz = copia();                                     
      143 +    const entrada = resolve('exemplos/envelope/despesas-envelo
          +pe-cc-desconhecido.json');                                    
      144 +    const f002 = (saida: string) => JSON.parse(readFileSync(sa
          +ida, 'utf8')).itens[1];                                       
      145 +                                                              
      146 +    const antes = arquivo();                                  
      147 +    expect(rodarCli(['calcular', '--input', entrada, '--output
          +', antes], { raiz }).codigo).toBe(0);                         
      148 +    expect(f002(antes)).toMatchObject({ id: 'f-002', status: '
          +PARCIAL', valor_reembolsavel: 250 });                         
      149 +                                                              
      150 +    trocarPolitica(raiz, (texto) => texto.replace('"limite": 2
          +50.00', '"limite": 320.00'));                                 
      151 +    const depois = arquivo();                                 
      152 +    const r = rodarCli(['calcular', '--input', entrada, '--out
          +put', depois], { raiz });                                     
      153 +    expect(r.codigo).toBe(0);                                 
      154 +    expect(f002(depois)).toMatchObject({ id: 'f-002', status: 
          +'APROVADO', valor_reembolsavel: 310 });                       
      155 +    expect(JSON.parse(readFileSync(depois, 'utf8')).resumo.tot
          +al_reembolsavel).toBe(433.76);                                
      156 +    // nenhum arquivo de código mudou na cópia                
      157 +    for (const f of readdirSync('src', { recursive: true, enco
          +ding: 'utf8' }).filter((c) => c.endsWith('.ts'))) {           
      158 +      expect(readFileSync(join(raiz, 'src', f)).equals(readFil
          +eSync(join('src', f))), f).toBe(true);                        
      159 +    }                                                         
      160 +  });                                                         
      161 +                                                              
      162 +  it('Infra › CLI: chamado de outra pasta lê o mesmo dados/', 
          +() => {                                                       
      163 +    const entrada = resolve('exemplos/envelope/despesas-envelo
          +pe.json');                                                    
      164 +    const [daRaiz, deFora] = [arquivo(), arquivo()];          
      165 +    expect(rodarCli(['calcular', '--input', entrada, '--output
          +', daRaiz]).codigo).toBe(0);                                  
      166 +    const r = rodarCli(['calcular', '--input', entrada, '--out
          +put', deFora], { cwd: pasta });                               
      167 +    expect(r.codigo).toBe(0);                                 
      168 +    expect(readFileSync(deFora).equals(readFileSync(daRaiz))).
          +toBe(true);                                                   
      169 +  });                                                         
      170 +                                                              
      171 +  it('Infra › CLI: envelope → código 0, stdout cita o total pe
          +ndente', () => {                                              
      172 +    const saida = arquivo();                                  
      173 +    const r = calcular('exemplos/envelope/despesas-envelope.js
          +on', saida);                                                  
      174 +    expect(r.codigo).toBe(0);                                 
      175 +    expect(r.stderr).toBe('');                                
      176 +    expect(r.stdout).toBe('10 itens processados; total reembol
          +sável R$ 748,26; total pendente de aprovação R$ 1.200,00\n'); 
      177 +    expect(JSON.parse(readFileSync(saida, 'utf8')).resumo).toM
          +atchObject({ pendentes: 1, total_pendente: 1200 });           
      178 +  });                                                         
      179 +                                                              
      180 +  it('Infra › CLI: duas execuções do envelope geram bytes idên
          +ticos', () => {                                               
      181 +    const [a, b] = [arquivo(), arquivo()];                    
      182 +    const entrada = 'exemplos/envelope/despesas-envelope.json'
          +;                                                             
      183 +    expect(cliCom({ TZ: 'UTC', LANG: 'C' }, 'calcular', '--inp
          +ut', entrada, '--output', a).codigo).toBe(0);                 
      184 +    expect(cliCom({ TZ: 'Asia/Tokyo', LANG: 'pt_BR.UTF-8' }, '
          +calcular', '--input', entrada, '--output', b).codigo).toBe(0);
      185 +    expect(readFileSync(b).equals(readFileSync(a))).toBe(true)
          +;                                                             
      186 +  });                                                         
      187 +                                                              
      188    it('Infra › CLI: duas execuções com a mesma entrada geram by
           tes idênticos', () => {
      189      const [a, b] = [arquivo(), arquivo()];
      190      const entrada = 'exemplos/despesas-exemplo.json';

● Update(tests\cli.test.ts)
  ⎿  Added 23 lines, removed 3 lines
       1  // CLI ponta a ponta, em processo filho (contracts/cli.md).
       2  
       3  import { spawnSync } from 'node:child_process';
       4 -import { existsSync, mkdtempSync, readFileSync, rmSync, writeFi
         -leSync } from 'node:fs';                                       
       4 +import { existsSync, mkdtempSync, readdirSync, readFileSync, rm
         +Sync, writeFileSync } from 'node:fs';                          
       5  import { tmpdir } from 'node:os';
       6 -import { join } from 'node:path';                              
       6 +import { join, resolve } from 'node:path';                     
       7  import { afterAll, describe, expect, it } from 'vitest';
       8 +import { copiaDoProjeto, rodarCli } from './apoio.ts';         
       9  
      10  const pasta = mkdtempSync(join(tmpdir(), 'reembolso-cli-'));
      10 -afterAll(() => rmSync(pasta, { recursive: true, force: true }))
         -;                                                              
      11 +const copias: string[] = [];                                   
      12 +afterAll(() => {                                               
      13 +  for (const p of [pasta, ...copias]) rmSync(p, { recursive: tr
         +ue, force: true });                                            
      14 +});                                                            
      15  
      16 +/** Cópia temporária do projeto (R-11), removida no fim. */    
      17 +function copia(): string {                                     
      18 +  const raiz = copiaDoProjeto();                               
      19 +  copias.push(raiz);                                           
      20 +  return raiz;                                                 
      21 +}                                                              
      22 +                                                               
      23 +/** Troca o texto de `dados/politica.json` da cópia. */        
      24 +function trocarPolitica(raiz: string, trocar: (texto: string) =
         +> string): void {                                              
      25 +  const caminho = join(raiz, 'dados', 'politica.json');        
      26 +  const texto = readFileSync(caminho, 'utf8');                 
      27 +  const novo = trocar(texto);                                  
      28 +  expect(novo).not.toBe(texto);                                
      29 +  writeFileSync(caminho, novo);                                
      30 +}                                                              
      31 +                                                               
      32  let contador = 0;
      33  
      34  /** Caminho novo na pasta temporária; com `conteudo`, o arquivo
           é criado. */

  Ran 1 shell command (ctrl+o to expand)

● All 15 CLI tests pass (the T-038/T-039 ones included). Committing T-068.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; npx vitest run 2>&1 | grep
      -E "FAIL|Test Files|Tests "; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      411    - **Aceite:** passam os `it` da T-051 e da T-052 (com `RN-01
           4 › exemplo: resumo 1861.84 / 351.43 / 0.00 / 1510.41 · 5/2/7/
           0` no lugar do resumo da T-051), `RN-010 › envelope e-001: rep
           resentacao 340,00 → PARCIAL 300,00`, `RN-017 › envelope e-002:
            EUR 22,00 × 5.93 (07-14) = 130,46 → PARCIAL 90,00`, `RN-017 ›
            envelope e-003: EUR 14,50 × 5.88 (07-15) = 85,26 → APROVADO 8
           5,26`, `RN-017 › envelope e-004: EUR 30,00 × 5.96 (07-17) = 17
           8,80 → PARCIAL 90,00`, `RN-008 › envelope e-005: USD 40,00 × 5
           .50 = 220,00 → NOTA_FISCAL_AUSENTE`, `RN-017 › envelope e-006:
            GBP → CAMBIO_INDISPONIVEL, conversão nula`, `RN-018 › envelop
           e e-007: PENDENTE 1.200,00, diarias 3`, `RN-011 › envelope e-0
           08: APROVADO 95,00, em_viagem, limite 135,00`, `RN-006 › envel
           ope e-009: coworking → CATEGORIA_NAO_REEMBOLSAVEL`, `RN-017 › 
           envelope e-010: sem moeda → BRL, taxa 1, APROVADO 88,00`, `RN-
           014 › envelope: resumo 2457.52 / 748.26 / 1200.00 / 509.26 · 3
           /3/3/1`, `RN-016 › envelope: tabela aplicada CC-COMERCIAL`, `R
           N-016 › cc-desconhecido f-001: APROVADO 58,00 (tabela padrão)`
           , `RN-012 › cc-desconhecido f-002: PARCIAL 250,00`, `RN-006 › 
           cc-desconhecido f-003: representacao → CATEGORIA_NAO_REEMBOLSA
           VEL`, `RN-017 › cc-desconhecido f-004: USD 12,00 × 5.48 (07-21
           ) = 65,76 → APROVADO`, `RN-014 › cc-desconhecido: resumo 623.7
           6 / 373.76 / 0.00 / 250.00 · 2/1/1/0`, `RN-016 › cc-desconheci
           do: politica.tabela "padrao"` e `RN-013 › exemplos: nenhum ite
           m com motivo ausente ou vazio nos três arquivos`
      412    - **Commit:** `2975363`
      413  
      414 -- [ ] **T-068** — [P] CLI da v4 em `src/cli.ts` e `tests/cli.t
          -est.ts` (estende T-038, R-08, R-11): a linha de resumo no `std
          -out` inclui o total pendente quando houver; helper de teste qu
          -e copia `src/`, `dados/` e `package.json` para uma pasta tempo
          -rária e roda o CLI dessa cópia com um arquivo de `dados/` troc
          -ado ou removido                                               
      414 +- [x] **T-068** — [P] CLI da v4 em `src/cli.ts` e `tests/cli.t
          +est.ts` (estende T-038, R-08, R-11): a linha de resumo no `std
          +out` inclui o total pendente quando houver; helper de teste qu
          +e copia `src/`, `dados/` e `package.json` para uma pasta tempo
          +rária e roda o CLI dessa cópia com um arquivo de `dados/` troc
          +ado ou removido                                               
      415    - **Atende:** RN-015, RN-016, RN-017, AMB-028, AMB-032, AMB-
           044
      416    - **Aceite:** em `tests/cli.test.ts` passam `RN-015 › CLI: "
           centro_custo": 42 → código 1, stderr cita colaborador.centro_c
           usto, nenhum arquivo de saída`, `RN-015 › CLI: dados/cambio.js
           on ausente (cópia temporária) → código 1, stderr cita o arquiv
           o de câmbio, nenhum arquivo de saída`, `RN-015 › CLI: limite n
           egativo em dados/politica.json (cópia temporária) → código 1, 
           stderr cita a tabela de limites e o campo`, `RN-016 › CLI: pad
           rao.hospedagem.limite 320.00 em dados/ (cópia temporária) muda
            f-002 de PARCIAL 250,00 para APROVADO 310,00 sem mudar o códi
           go`, `Infra › CLI: chamado de outra pasta lê o mesmo dados/`, 
           `Infra › CLI: envelope → código 0, stdout cita o total pendent
           e` e `Infra › CLI: duas execuções do envelope geram bytes idên
           ticos`; os testes da T-038 e da T-039 continuam passando
      417 -  - **Commit:** `<hash preenchido depois>`                    
      417 +  - **Commit:** `4ac2d5f`                                     
      418  
      419  - [ ] **T-069** — Casos de borda de arquivo da v4 em `tests/ca
           sos-de-borda.test.ts`: "Centro de custo não textual" por `vali
           darEntrada`; "Tabela de limites inválida" e "Tabela sem versão
           " por `lerPolitica` com o texto do arquivo; "Arquivo de câmbio
            ausente" por `lerExternos` com um caminho inexistente **e** p
           elo CLI numa cópia temporária (helper da T-068), conferindo qu
           e o arquivo de saída não existe
      420    - **Atende:** RN-015, RN-016, RN-017, AMB-028, AMB-032, AMB-
           044

● T-069 — v4 file-level edge cases

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; cat >>
      tests/casos-de-borda.test.ts <<'FIM'…)  ⎿  Updated tests\casos-de-borda.test.ts (+61 -2)
       7  import { join } from 'node:path';
       8  import { afterAll, describe, expect, it } from 'vitest';
       9  import { lerCambio } from '../src/io/cambio.ts';
      10 -import { serializarJson } from '../src/io/json.ts';            
      10 +import { ErroEntrada, validarEntrada } from '../src/io/entrada.
         +ts';                                                           
      11 +import { CAMINHO_POLITICA, lerExternos } from '../src/io/extern
         +os.ts';                                                        
      12 +import { lerJson, serializarJson } from '../src/io/json.ts';   
      13 +import { lerPolitica } from '../src/io/politica.ts';           
      14  import { montarSaida } from '../src/io/saida.ts';
      15  import { statusDe } from '../src/nucleo/status.ts';
      16  import type { ResultadoItem } from '../src/nucleo/tipos.ts';
      17  import { NumeroJson } from '../src/nucleo/tipos.ts';
      15 -import { calcularV4, cru, entrada, rodar } from './apoio.ts';  
      18 +import { RAIZ, TEXTO_POLITICA_V4, calcularV4, copiaDoProjeto, c
         +ru, entrada, rodar, rodarCli } from './apoio.ts';              
      19  
      20  /** O que a seção 7 verifica em cada item. */
      21  function decisao(i: ResultadoItem | undefined) {
     ...
      822      expect(r.resumo).toMatchObject({ totalReembolsavel: 8800n,
            totalPendente: 120000n, pendentes: 1 });
      823    });
      824  });
      825 +                                                              
      826 +describe('Casos de borda — arquivos da v4', () => {           
      827 +  const copias: string[] = [];                                
      828 +  afterAll(() => {                                            
      829 +    for (const p of copias) rmSync(p, { recursive: true, force
          +: true });                                                    
      830 +  });                                                         
      831 +                                                              
      832 +  /** Mensagem do `ErroEntrada` de `ler()`. */                
      833 +  function erro(ler: () => unknown): string {                 
      834 +    try {                                                     
      835 +      ler();                                                  
      836 +    } catch (e) {                                             
      837 +      expect(e).toBeInstanceOf(ErroEntrada);                  
      838 +      return (e as Error).message;                            
      839 +    }                                                         
      840 +    throw new Error('arquivo aceito');                        
      841 +  }                                                           
      842 +                                                              
      843 +  const politica = () => JSON.parse(TEXTO_POLITICA_V4) as Reco
          +rd<string, any>;                                              
      844 +                                                              
     … 36 more lines (ctrl+o to expand)

● Whole suite is green (420/420). Committing T-069.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      416    - **Aceite:** em `tests/cli.test.ts` passam `RN-015 › CLI: "
           centro_custo": 42 → código 1, stderr cita colaborador.centro_c
           usto, nenhum arquivo de saída`, `RN-015 › CLI: dados/cambio.js
           on ausente (cópia temporária) → código 1, stderr cita o arquiv
           o de câmbio, nenhum arquivo de saída`, `RN-015 › CLI: limite n
           egativo em dados/politica.json (cópia temporária) → código 1, 
           stderr cita a tabela de limites e o campo`, `RN-016 › CLI: pad
           rao.hospedagem.limite 320.00 em dados/ (cópia temporária) muda
            f-002 de PARCIAL 250,00 para APROVADO 310,00 sem mudar o códi
           go`, `Infra › CLI: chamado de outra pasta lê o mesmo dados/`, 
           `Infra › CLI: envelope → código 0, stdout cita o total pendent
           e` e `Infra › CLI: duas execuções do envelope geram bytes idên
           ticos`; os testes da T-038 e da T-039 continuam passando
      417    - **Commit:** `4ac2d5f`
      418  
      419 -- [ ] **T-069** — Casos de borda de arquivo da v4 em `tests/ca
          -sos-de-borda.test.ts`: "Centro de custo não textual" por `vali
          -darEntrada`; "Tabela de limites inválida" e "Tabela sem versão
          -" por `lerPolitica` com o texto do arquivo; "Arquivo de câmbio
          - ausente" por `lerExternos` com um caminho inexistente **e** p
          -elo CLI numa cópia temporária (helper da T-068), conferindo qu
          -e o arquivo de saída não existe                               
      419 +- [x] **T-069** — Casos de borda de arquivo da v4 em `tests/ca
          +sos-de-borda.test.ts`: "Centro de custo não textual" por `vali
          +darEntrada`; "Tabela de limites inválida" e "Tabela sem versão
          +" por `lerPolitica` com o texto do arquivo; "Arquivo de câmbio
          + ausente" por `lerExternos` com um caminho inexistente **e** p
          +elo CLI numa cópia temporária (helper da T-068), conferindo qu
          +e o arquivo de saída não existe                               
      420    - **Atende:** RN-015, RN-016, RN-017, AMB-028, AMB-032, AMB-
           044
      421    - **Aceite:** passam `Borda › Centro de custo não textual`, 
           `Borda › Tabela de limites inválida`, `Borda › Arquivo de câmb
           io ausente` e `Borda › Tabela sem versão`
      422 -  - **Commit:** `<hash preenchido depois>`                    
      422 +  - **Commit:** `f7da03d`                                     
      423  
      424  - [ ] **T-070** — Fechar a rastreabilidade (estende T-041, DT-
           005): em `tests/rastreabilidade.test.ts`, subir os mínimos par
           a 18 RNs e 121 casos de borda; nada mais muda no teste
      425    - **Atende:** RN-001, RN-002, RN-003, RN-004, RN-005, RN-006
           , RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-0
           14, RN-015, RN-016, RN-017, RN-018 (seção 9, critérios 3 e 4)

● T-070 — close traceability (minimums 18 RNs / 121 edge cases)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; perl -pi -e
      's/expect\(regras\.length\)\.toBeGreaterThanOrEqual\(15\);/expect(regras.l
      ength).toBeGreaterThanOrEqu…)
  ⎿  Updated tests\rastreabilidade.test.ts (+2 -2)
      32  
      33  describe('Infra › rastreabilidade', () => {
      34    it('Infra › rastreabilidade: toda RN-NNN da spec aparece no i
          nício de um título de teste', () => {
      35 -    expect(regras.length).toBeGreaterThanOrEqual(15);          
      35 +    expect(regras.length).toBeGreaterThanOrEqual(18);          
      36      const semTeste = regras.filter((rn) => !titulos.some((t) =>
           t.startsWith(`${rn} ›`)));
      37      expect(semTeste, `RNs sem teste: ${semTeste.join(', ')}`).t
          oEqual([]);
      38    });
      39  
      40    it('Infra › rastreabilidade: toda linha da seção 7 tem um tes
          te Borda › <Caso>', () => {
      41      const casos = casosDeBorda();
      42 -    expect(casos.length).toBeGreaterThanOrEqual(80);           
      42 +    expect(casos.length).toBeGreaterThanOrEqual(121);          
      43      const semTeste = casos.filter((caso) => !titulos.includes(`
          Borda › ${caso}`));
      44      expect(semTeste, `casos de borda sem teste:\n${semTeste.joi
          n('\n')}`).toEqual([]);
      45    });

● Suite green. Quick sanity check that traceability still catches a missing v4
  edge case (temporarily renaming one test, then restoring):

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; cp
      tests/casos-de-borda.test.ts "$TEMP/borda.bak" 2>/dev/null || cp
      tests/casos-de-borda.test.ts /tmp/borda.bak;…)
  ⎿  1 file changed (binary, mode only or too large to show)

● Detection works and the file is restored. Committing T-070.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; git status --short; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      421    - **Aceite:** passam `Borda › Centro de custo não textual`, 
           `Borda › Tabela de limites inválida`, `Borda › Arquivo de câmb
           io ausente` e `Borda › Tabela sem versão`
      422    - **Commit:** `f7da03d`
      423  
      424 -- [ ] **T-070** — Fechar a rastreabilidade (estende T-041, DT-
          -005): em `tests/rastreabilidade.test.ts`, subir os mínimos par
          -a 18 RNs e 121 casos de borda; nada mais muda no teste        
      424 +- [x] **T-070** — Fechar a rastreabilidade (estende T-041, DT-
          +005): em `tests/rastreabilidade.test.ts`, subir os mínimos par
          +a 18 RNs e 121 casos de borda; nada mais muda no teste        
      425    - **Atende:** RN-001, RN-002, RN-003, RN-004, RN-005, RN-006
           , RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-0
           14, RN-015, RN-016, RN-017, RN-018 (seção 9, critérios 3 e 4)
      426    - **Aceite:** passam `Infra › rastreabilidade: toda RN-NNN d
           a spec aparece no início de um título de teste`, `Infra › rast
           reabilidade: toda linha da seção 7 tem um teste Borda › <Caso>
           ` e `Infra › rastreabilidade: toda RN-NNN tem exatamente um ar
           quivo rn-NNN-*.test.ts`; `npm test` inteiro verde, sem falhas 
           conhecidas
      427 -  - **Commit:** `<hash preenchido depois>`                    
      427 +  - **Commit:** `3d44b6b`                                     
      428  
      429  - [ ] **T-071** — Atualizar `README.md` (estende T-042): os do
           is arquivos em `dados/` (o que são, que simulam o serviço do f
           inanceiro, como trocá-los e restaurá-los com `git checkout dad
           os/`), os três exemplos da seção 9 e o apontamento para `quick
           start.md` e `contracts/arquivos-externos.md`
      430    - **Atende:** AMB-028 (seção 9, entrega: "como rodar e como 
           testar")

● T-071 — README

  Ran 1 shell command (ctrl+o to expand)

● Write(README.md)
  ⎿  Added 87 lines, removed 22 lines
       3  CLI que lê um JSON com as despesas de um colaborador num períod
          o e grava um
       4  JSON com, para cada despesa, o valor reembolsável, o status e o
           motivo
       5  padronizado da decisão, mais um resumo com os totais. As regras
           vêm da
       6 -Política de Reembolso v3 do RH, com as ambiguidades decididas e
         - registradas                                                   
       7 -na spec.                                                       
       6 +Política de Reembolso v4 do RH (limites por centro de custo, mo
         +eda                                                            
       7 +estrangeira e aprovação manual acima de R$ 500), com as ambigui
         +dades                                                          
       8 +decididas e registradas na spec.                               
       9  
      10  O projeto foi feito com Spec Driven Development. O enunciado do
           desafio está
      11  em [`DESAFIO.md`](DESAFIO.md).
     ...
       36  Saída esperada no terminal:
       37  
       38  ```
       38 -14 itens processados; total reembolsável R$ 815,43            
       39 +14 itens processados; total reembolsável R$ 351,43            
       40  ```
       41  
       42 +Os três arquivos de exemplo da seção 9 da spec:               
       43 +                                                              
       44 +| Arquivo | Colaborador | Linha no terminal |                 
       45 +|---|---|---|                                                 
       46 +| `exemplos/despesas-exemplo.json` | CC-ENG-PLATAFORMA (hosped
          +agem não reembolsável) | `14 itens processados; total reembols
          +ável R$ 351,43` |                                             
       47 +| `exemplos/envelope/despesas-envelope.json` | CC-COMERCIAL, c
          +om EUR, USD, GBP e um item pendente | `10 itens processados; t
          +otal reembolsável R$ 748,26; total pendente de aprovação R$ 1.
          +200,00` |                                                     
       48 +| `exemplos/envelope/despesas-envelope-cc-desconhecido.json` |
          + CC-SUPORTE-N2, sem entrada na tabela (tabela padrão) | `4 ite
          +ns processados; total reembolsável R$ 373,76` |               
       49 +                                                              
       50 +O resultado esperado de cada item está nas tabelas da         
       51 +[seção 9 da spec](specs/001-motor-reembolso/spec.md#9-critério
          +s-de-aceite).                                                 
       52 +                                                              
       53  | Situação | Código de saída | O que acontece |
       54  |---|---|---|
       55  | Sucesso | `0` | grava o arquivo de saída (JSON indentado, `\
           n` no fim) e imprime o resumo |
       44 -| Entrada inválida: arquivo inexistente, JSON inválido, sem `c
          -olaborador.id`, `periodo` ou `despesas`, datas inválidas, `ini
          -cio` depois de `fim` (RN-015) | `1` | `erro: ...` no `stderr`;
          - o arquivo de saída **não** é criado nem alterado |           
       56 +| Entrada inválida: arquivo inexistente, JSON inválido, sem `c
          +olaborador.id`, `periodo` ou `despesas`, datas inválidas, `ini
          +cio` depois de `fim`, `colaborador.centro_custo` que não é tex
          +to (RN-015) | `1` | `erro: ...` no `stderr`; o arquivo de saíd
          +a **não** é criado nem alterado |                             
       57 +| Tabela de limites ou câmbio ausente, que não é JSON ou fora 
          +do formato (RN-015) | `1` | `erro: <arquivo> (<caminho>): <cam
          +po e problema>`; nenhuma saída |                              
       58  | Uso incorreto (subcomando ou opção ausente/desconhecida) | `
           2` | `uso: ...` no `stderr` |
       59  
       47 -Uma despesa com dado inválido **não** é erro de execução: ela 
          -sai recusada                                                  
       48 -com `DADO_INVALIDO` e as outras seguem normalmente (RN-003).  
       60 +Uma despesa com dado inválido, ou numa moeda sem cotação, **nã
          +o** é erro de                                                 
       61 +execução: ela sai recusada (`DADO_INVALIDO` ou `CAMBIO_INDISPO
          +NIVEL`) e as                                                  
       62 +outras seguem normalmente (RN-003, RN-017).                   
       63  
       64  A interface completa está em
       65  [`contracts/cli.md`](specs/001-motor-reembolso/contracts/cli.m
           d), e o formato
       66  da saída em
       67  [`contracts/saida.schema.json`](specs/001-motor-reembolso/cont
           racts/saida.schema.json).
       68  
       69 +## Tabela de limites e câmbio (`dados/`)                      
       70 +                                                              
       71 +Além do arquivo de entrada, toda execução lê dois arquivos num
          + local fixo                                                   
       72 +(AMB-028). Eles simulam o serviço do financeiro: quem pede o r
          +eembolso não                                                  
       73 +escolhe os próprios limites, e por isso eles não vêm na linha 
          +de comando nem                                                
       74 +no arquivo de entrada.                                        
       75 +                                                              
       76 +| Arquivo | O que é | Conteúdo inicial |                      
       77 +|---|---|---|                                                 
       78 +| `dados/politica.json` | tabela de limites: padrão e por cent
          +ro de custo, limiar de nota fiscal e acréscimo de viagem | cóp
          +ia de `exemplos/envelope/politica-v4.json` |                  
       79 +| `dados/cambio.json` | taxas de câmbio por data (quantos reai
          +s vale 1 unidade da moeda) | cópia de `exemplos/envelope/cambi
          +o.json` |                                                     
       80 +                                                              
       81 +O caminho é resolvido a partir do código, e não da pasta de on
          +de o comando é                                                
       82 +chamado: rodar o CLI de outra pasta lê os mesmos arquivos.    
       83 +                                                              
       84 +**Para calcular com outra tabela ou outras taxas**, edite ou s
          +ubstitua o                                                    
       85 +arquivo em `dados/` (mesmo nome, formato da seção 4 da spec) e
          + rode o comando                                               
       86 +de novo. Nenhum código muda. Por exemplo, trocando `padrao.hos
          +pedagem.limite`                                               
       87 +de `250.00` para `320.00` em `dados/politica.json`, a `f-002` 
          +do exemplo                                                    
       88 +`despesas-envelope-cc-desconhecido.json` passa de PARCIAL 250,
          +00 para                                                       
       89 +APROVADO 310,00.                                              
       90 +                                                              
       91 +**Para restaurar os arquivos originais:**                     
       92 +                                                              
       93 +```bash                                                       
       94 +git checkout dados/                                           
       95 +git status dados/   # nada a mostrar                          
       96 +```                                                           
       97 +                                                              
       98 +Um arquivo de `dados/` ausente ou fora do formato interrompe a
          + execução com                                                 
       99 +código `1`, e a mensagem cita o arquivo e o campo:            
      100 +                                                              
      101 +```                                                           
      102 +erro: tabela de limites (dados/politica.json): centros_custo.C
          +C-ADM.alimentacao.limite é negativo (-10)                     
      103 +erro: arquivo de câmbio (dados/cambio.json): arquivo não encon
          +trado                                                         
      104 +```                                                           
      105 +                                                              
      106 +Os testes automatizados **não** leem `dados/`: usam a tabela e
          + o câmbio de                                                  
      107 +`exemplos/envelope/`. Trocar `dados/` não quebra a suíte. O co
          +ntrato dos dois                                               
      108 +arquivos está em                                              
      109 +[`contracts/arquivos-externos.md`](specs/001-motor-reembolso/c
          +ontracts/arquivos-externos.md).                               
      110 +                                                              
      111  ## Testar
      112  
      113  ```bash
       58 -npm test           # Vitest: regras, casos de borda, exemplo o
          -ficial, contrato, CLI e rastreabilidade                       
      114 +npm test           # Vitest: regras, casos de borda, exemplos,
          + contrato, CLI e rastreabilidade                              
      115  npm run typecheck  # tsc --noEmit
      116  ```
      117  
      118  A suíte cobre:
      119  
       64 -- **Uma regra, um arquivo:** cada `RN-NNN` da spec tem o seu  
       65 -  `tests/**/rn-NNN-*.test.ts`, com títulos que começam pelo ID
      120 +- **Uma regra, um arquivo:** cada `RN-NNN` da spec (RN-001 a R
          +N-018) tem o                                                  
      121 +  seu `tests/**/rn-NNN-*.test.ts`, com títulos que começam pel
          +o ID                                                          
      122    (`RN-010 › ...`).
       67 -- **Casos de borda:** cada linha da tabela da seção 7 da spec 
          -é um teste                                                    
       68 -  `Borda › <Caso>` em `tests/casos-de-borda.test.ts`.         
       69 -- **Exemplo oficial:** `tests/exemplo.test.ts` confere        
       70 -  `exemplos/despesas-exemplo.json` item a item com a tabela da
          - seção 9.                                                     
      123 +- **Casos de borda:** cada linha da tabela da seção 7 da spec 
          +(121 linhas) é                                                
      124 +  um teste `Borda › <Caso>` em `tests/casos-de-borda.test.ts`.
      125 +- **Exemplos oficiais:** `tests/exemplo.test.ts` confere os tr
          +ês arquivos da                                                
      126 +  seção 9 item a item (moeda, taxa, data da cotação, valores, 
          +status, código)                                               
      127 +  e os três resumos.                                          
      128  - **Contrato:** `tests/contrato-saida.test.ts` valida a saída 
           contra o JSON
      129    Schema.
      130  - **CLI:** `tests/cli.test.ts` roda o comando num processo fil
           ho (códigos de
       74 -  saída, nenhuma saída parcial em erro, determinismo).        
      131 +  saída, nenhuma saída parcial em erro, determinismo, chamada 
          +de outra pasta                                                
      132 +  e, numa cópia temporária do projeto, `dados/` trocado ou rem
          +ovido).                                                       
      133  - **Rastreabilidade:** `tests/rastreabilidade.test.ts` lê a sp
           ec e falha se
      134    alguma `RN-NNN` ou linha da seção 7 ficar sem teste.
      135  
       78 -O roteiro de validação manual está em                         
      136 +O roteiro de validação manual, com os seis passos (suíte, exem
          +plos, tabela                                                  
      137 +trocada, determinismo, arquivos inválidos e itens inválidos), 
          +está em                                                       
      138  [`quickstart.md`](specs/001-motor-reembolso/quickstart.md).
      139  
      140  ## Documentação
     ...
      144  | [`spec.md`](specs/001-motor-reembolso/spec.md) | **o quê**: 
           regras (`RN-NNN`), ambiguidades decididas (`AMB-NNN`), casos d
           e borda e critérios de aceite |
      145  | [`plan.md`](specs/001-motor-reembolso/plan.md) | **como**: a
           rquitetura, representação da política e decisões técnicas |
      146  | [`research.md`](specs/001-motor-reembolso/research.md) · [`d
           ata-model.md`](specs/001-motor-reembolso/data-model.md) | deci
           sões técnicas detalhadas e modelo de dados |
      147 +| [`contracts/`](specs/001-motor-reembolso/contracts/) | CLI, 
          +arquivos externos e schema da saída |                         
      148  | [`tasks.md`](specs/001-motor-reembolso/tasks.md) | **em que 
           ordem**: tasks `T-NNN`, cada uma com critério de aceite e o co
           mmit que a fechou |
      149  | [`DECISIONS.md`](specs/001-motor-reembolso/DECISIONS.md) | l
           og das mudanças de spec |
      150  | [`docs/sessions/`](docs/sessions/) | exports das sessões com
            o Claude Code |
     ...
      154  ```
      155  src/
      156    cli.ts          # argumentos, leitura e gravação de arquivos
           , códigos de saída
       97 -  io/             # JSON sem float (json.ts), validação do arq
          -uivo (entrada.ts), montagem da saída (saida.ts)               
      157 +  io/             # JSON sem float (json.ts), entrada (entrada
          +.ts), tabela de limites (politica.ts),                        
      158 +                  # câmbio (cambio.ts), local fixo de dados/ (
          +externos.ts), montagem da saída (saida.ts)                    
      159    nucleo/         # regras em funções puras, sem E/S; a ordem 
           da seção 8 da spec vive em motor.ts
       99 -tests/            # um arquivo por RN, casos de borda, exemplo
          -, contrato, CLI, rastreabilidade                              
      100 -exemplos/         # arquivo de entrada de referência          
      160 +dados/            # tabela de limites e câmbio lidos a cada ex
          +ecução (local fixo)                                           
      161 +tests/            # um arquivo por RN, casos de borda, exemplo
          +s, contrato, CLI, rastreabilidade                             
      162 +exemplos/         # arquivos de entrada de referência; envelop
          +e/ traz a tabela e o câmbio da v4                             
      163  ```
      164  
      103 -Valores em dinheiro são centavos inteiros (`bigint`) do começo
          - ao fim. A                                                    
      104 -entrada é lida pelo texto de cada número e a saída é gravada c
          -om duas casas,                                                
      105 -sem passar por ponto flutuante. Todos os valores da política (
          -limites, fator                                                
      106 -de viagem, limiar de nota fiscal) ficam em `src/nucleo/politic
          -a.ts`.                                                        
      165 +Valores em dinheiro são centavos inteiros (`bigint`) do começo
          + ao fim; taxas                                                
      166 +de câmbio e percentuais são decimais exatos. A entrada, a tabe
          +la e o câmbio                                                 
      167 +são lidos pelo texto de cada número e a saída é gravada com du
          +as casas, sem                                                 
      168 +passar por ponto flutuante. Os limites, o limiar de nota fisca
          +l e o acréscimo                                               
      169 +de viagem vêm de `dados/politica.json`; o único valor de polít
          +ica no código é                                               
      170 +o limiar de aprovação manual de R$ 500,00 (RN-018), em        
      171 +`src/nucleo/politica.ts`.                                     

● Quick check of quickstart §6 (not covered by an automated test) before
  committing:

  Ran 1 shell command (ctrl+o to expand)

● Matches quickstart §6 exactly. Committing T-071.

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio"; bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/19301ba9-012b-420b-aeb4-4…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      426    - **Aceite:** passam `Infra › rastreabilidade: toda RN-NNN d
           a spec aparece no início de um título de teste`, `Infra › rast
           reabilidade: toda linha da seção 7 tem um teste Borda › <Caso>
           ` e `Infra › rastreabilidade: toda RN-NNN tem exatamente um ar
           quivo rn-NNN-*.test.ts`; `npm test` inteiro verde, sem falhas 
           conhecidas
      427    - **Commit:** `3d44b6b`
      428  
      429 -- [ ] **T-071** — Atualizar `README.md` (estende T-042): os do
          -is arquivos em `dados/` (o que são, que simulam o serviço do f
          -inanceiro, como trocá-los e restaurá-los com `git checkout dad
          -os/`), os três exemplos da seção 9 e o apontamento para `quick
          -start.md` e `contracts/arquivos-externos.md`                  
      429 +- [x] **T-071** — Atualizar `README.md` (estende T-042): os do
          +is arquivos em `dados/` (o que são, que simulam o serviço do f
          +inanceiro, como trocá-los e restaurá-los com `git checkout dad
          +os/`), os três exemplos da seção 9 e o apontamento para `quick
          +start.md` e `contracts/arquivos-externos.md`                  
      430    - **Atende:** AMB-028 (seção 9, entrega: "como rodar e como 
           testar")
      431    - **Aceite:** seguir o README do zero num clone limpo reprod
           uz as seções 1 a 6 do `quickstart.md` com o resultado esperado
      432 -  - **Commit:** `<hash preenchido depois>`                    
      432 +  - **Commit:** `c689604`                                     
      433  
      434  ---
      435  

● All 71 tasks are [x]. Final validation pass:

  Ran 1 shell command (ctrl+o to expand)

● All 29 Phase 5 tasks (T-043 to T-071) are implemented and marked [x] in
  tasks.md, so all 71 tasks are now closed. The full suite passes (420 tests in
  31 files), npm run typecheck shows no errors, and the working tree is clean.

  Checks before starting: checklists/requirements.md was 15/15 checked. There is
  no .specify/extensions.yml, so no hooks ran before or after.

  What was built:
  - Limits by cost center (RN-016): dados/politica.json and dados/cambio.json
    are read on every run from a fixed location, found relative to the code, so
    running from another folder reads the same files. POLITICA is gone from the
    code. The only policy number left in code is the R$ 500 manual-approval
    threshold, as the spec says.
  - Foreign currency (RN-017): amounts are converted to reals when the expense
    is read. If the exchange file has no rate up to that date, the item is
    refused at step 6 with CAMBIO_INDISPONIVEL. The three conversion fields are
    either all filled or all null.
  - Manual approval (RN-018): an item whose reimbursable amount is over R$ 500
    comes out as PENDENTE / REQUER_APROVACAO. It still uses up the day's limit
    and still makes its nights count as travel days. It is counted in
    total_pendente and left out of total_reembolsavel.
  - Output: each item now has 14 fields in the §4 order. There is a politica
    block, and the summary has pending counts and totals. The output schema test
    passes again.
  - Examples: the three example files match the §9 tables item by item.
  - Traceability: the test now requires 18 rules and 121 edge cases. I checked
    that removing one edge-case test turns the suite red.

  Changes to earlier-phase tests (all forced by the v4 spec, not by bugs):
  1. T-051: the T-038 CLI test expected R$ 815,43 for the first example. With
     the collaborator now in CC-ENG-PLATAFORMA (D-019), the correct total is R$
     351,43, and I updated the test to that.
  2. T-058: Borda › Diárias com acento e maiúscula used 600,00, which is now
     correctly PENDENTE. The §7 row only checks N = 3, so I lowered the amount
     to 300,00 rather than making the test depend on RN-018.
  3. T-066: the old v1 field-order check inside an RN-001 output test
     contradicted §4 v2.2. I moved it into the new Infra › saída: campos do item
     na ordem… test, using the v4 order.

  Additions not spelled out in the design docs:
  - ResultadoItem keeps a valorSolicitado field, set only by the motor from the
    conversion. The saved output writes the three conversion fields from the
    conversion itself.
  - RecusaDadoInvalido has a new moedaLida field (the cleaned-up currency). It
    lets an invalid-data item in a foreign currency still show the conversion in
    its description.
  - I added *.log to .gitignore.

  There are 58 new commits: one feat/test/docs(T-0NN) per task plus a
  docs(tasks): marca … commit for each, following the existing history. Nothing
  has been pushed.