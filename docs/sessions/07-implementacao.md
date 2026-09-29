
> <ide_opened_file>The user opened the file
  d:\Usuario\Projetos\Dev\Apps\sdd-desafio\specs\001-motor-reembolso\tasks.md
  in the IDE. This may or may not be related to the current
  task.</ide_opened_file>

> execute t-001

  Searched for 1 pattern, ran 2 shell commands (ctrl+o to expand)

● Now I'll write the files.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && mkdir -p tests && cat >
      package.json <<'EOF'
      {…)
  ⎿  Created package.json (+21 -0)
       1 +{                                                              
       2 +  "name": "motor-reembolso",                                   
       3 +  "version": "0.1.0",                                          
       4 +  "private": true,                                             
       5 +  "description": "Motor de cálculo de reembolso de despesas cor
         +porativas (CLI).",                                             
       6 +  "type": "module",                                            
       7 +  "engines": {                                                 
       8 +    "node": ">=24"                                             
       9 +  },                                                           
      10 +  "scripts": {                                                 
      11 +    "test": "vitest run",                                      
      12 +    "typecheck": "tsc --noEmit",                               
      13 +    "reembolso": "node src/cli.ts"                             
      14 +  },                                                           
      15 +  "devDependencies": {                                         
      16 +    "@types/node": "^24.19.0",                                 
      17 +    "ajv": "^8.20.0",                                          
      18 +    "typescript": "~5.9.3",                                    
      19 +    "vitest": "^5.0.2"                                         
      20 +  }                                                            
      21 +}                                                              
  ⎿  Created tests\infra.test.ts (+14 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +                                                               
       3 +describe('Infra', () => {                                      
       4 +  it('Infra › runtime oferece JSON.rawJSON e context.source no 
         +reviver do JSON.parse', () => {                                
       5 +    const fontes: string[] = [];                               
       6 +    JSON.parse('{"a": 10.005, "b": [1.00005e2]}', function (_ch
         +ave, valor, contexto?: { source?: string }) {                  
       7 +      if (typeof valor === 'number' && contexto?.source !== und
         +efined) fontes.push(contexto.source);                          
       8 +      return valor;                                            
       9 +    });                                                        
      10 +    expect(fontes).toEqual(['10.005', '1.00005e2']);           
      11 +                                                               
      12 +    expect(JSON.stringify({ v: JSON.rawJSON('45.00') })).toBe('
         +{"v":45.00}');                                                 
      13 +  });                                                          
      14 +});                                                            
  ⎿  Created tsconfig.json (+18 -0)
       1 +{                                                              
       2 +  "compilerOptions": {                                         
       3 +    "target": "ES2024",                                        
       4 +    "lib": ["ES2024"],                                         
       5 +    "module": "nodenext",                                      
       6 +    "moduleResolution": "nodenext",                            
       7 +    "types": ["node"],                                         
       8 +    "strict": true,                                            
       9 +    "noEmit": true,                                            
      10 +    "erasableSyntaxOnly": true,                                
      11 +    "allowImportingTsExtensions": true,                        
      12 +    "verbatimModuleSyntax": true,                              
      13 +    "resolveJsonModule": true,                                 
      14 +    "skipLibCheck": true,                                      
      15 +    "forceConsistentCasingInFileNames": true                   
      16 +  },                                                           
      17 +  "include": ["src/**/*.ts", "tests/**/*.ts", "vitest.config.ts
         +"]                                                             
      18 +}                                                              
  ⎿  Created vitest.config.ts (+7 -0)
      1 +import { defineConfig } from 'vitest/config';                   
      2 +                                                                
      3 +export default defineConfig({                                   
      4 +  test: {                                                       
      5 +    include: ['tests/**/*.test.ts'],                            
      6 +  },                                                            
      7 +});                                                             
  ⎿  … 1 more file changed
  ⎿  (timeout 5m)

  Ran 2 shell commands (ctrl+o to expand)

● TypeScript 5.9 has no types for JSON.rawJSON or the reviver's context (they
  exist in Node 24 at runtime, but not in TS's lib or @types/node). I'll add an
  ambient declaration for them.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && mkdir -p src && cat >
      src/json-nativo.d.ts <<'EOF'
      // Tipos de recursos do JSON presentes no Node >= 24 (V8) e…)
  ⎿  Created src\json-nativo.d.ts (+20 -0)
       1 +// Tipos de recursos do JSON presentes no Node >= 24 (V8) e ain
         +da ausentes do                                                 
       2 +// lib do TypeScript 5.9 e do @types/node (R-01, R-03, R-04).  
       3 +                                                               
       4 +interface RawJSON {                                            
       5 +  readonly rawJSON: string;                                    
       6 +}                                                              
       7 +                                                               
       8 +interface ContextoReviverJson {                                
       9 +  /** Texto original do valor primitivo no JSON de entrada. */ 
      10 +  readonly source?: string;                                    
      11 +}                                                              
      12 +                                                               
      13 +interface JSON {                                               
      14 +  rawJSON(texto: string): RawJSON;                             
      15 +  isRawJSON(valor: unknown): valor is RawJSON;                 
      16 +  parse(                                                       
      17 +    texto: string,                                             
      18 +    reviver: (this: any, chave: string, valor: any, contexto: C
         +ontextoReviverJson) => any,                                    
      19 +  ): any;                                                      
      20 +}                                                              
  ⎿  Updated tests\infra.test.ts (+2 -2)
       3  describe('Infra', () => {
       4    it('Infra › runtime oferece JSON.rawJSON e context.source no 
          reviver do JSON.parse', () => {
       5      const fontes: string[] = [];
       6 -    JSON.parse('{"a": 10.005, "b": [1.00005e2]}', function (_ch
         -ave, valor, contexto?: { source?: string }) {                  
       7 -      if (typeof valor === 'number' && contexto?.source !== und
         -efined) fontes.push(contexto.source);                          
       6 +    JSON.parse('{"a": 10.005, "b": [1.00005e2]}', (_chave, valo
         +r, contexto) {                                                 
       7 +      if (typeof valor === 'number' && contexto.source !== unde
         +fined) fontes.push(contexto.source);                           
       8        return valor;
       9      });
      10      expect(fontes).toEqual(['10.005', '1.00005e2']);

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && sed -i 's/(_chave,
      valor, contexto) {/(_chave, valor, contexto) => {/' tests/infra.test.ts &&
      npm test 2>&1 | t…)
  ⎿  Updated tests\infra.test.ts (+1 -1)
      3  describe('Infra', () => {
      4    it('Infra › runtime oferece JSON.rawJSON e context.source no r
         eviver do JSON.parse', () => {
      5      const fontes: string[] = [];
      6 -    JSON.parse('{"a": 10.005, "b": [1.00005e2]}', (_chave, valor
        -, contexto) {                                                   
      6 +    JSON.parse('{"a": 10.005, "b": [1.00005e2]}', (_chave, valor
        +, contexto) => {                                                
      7        if (typeof valor === 'number' && contexto.source !== undef
         ined) fontes.push(contexto.source);
      8        return valor;
      9      });

● T-001 is done: the test Infra › runtime oferece JSON.rawJSON e context.source
  no reviver do JSON.parse passes in npm test, and npm run typecheck shows no
  errors.

  Files created:
  - package.json — ESM package, requires Node ≥ 24, has the scripts test,
    typecheck and reembolso. It installs typescript 5.9.3, vitest 5.0.2, ajv
    8.20 and @types/node 24.
  - tsconfig.json — strict, noEmit, erasableSyntaxOnly,
    allowImportingTsExtensions, verbatimModuleSyntax, target and lib set to
    ES2024, module and moduleResolution set to nodenext.
  - vitest.config.ts — runs tests/**/*.test.ts.
  - tests/infra.test.ts — checks that the reviver gets the original number text
    ("10.005", "1.00005e2") and that JSON.rawJSON('45.00') is written out as
    45.00.
  - package-lock.json, produced by npm install.

  One file the task doesn't list: src/json-nativo.d.ts. Node 24 has
  JSON.rawJSON, JSON.isRawJSON and the reviver's context.source, but TypeScript
  5.9 and @types/node don't have types for them yet, so typecheck failed without
  this file. It only adds those type declarations for the typechecker and
  contains no business rules. It isn't in the file structure in plan §2. If you
  want it recorded there, it needs a small docs(plan): update.

  Not done yet: I haven't committed or marked the task [x] in tasks.md. If you
  want, I'll commit it as feat(T-001): esqueleto do projeto (package.json,
  tsconfig, vitest, teste de infra) and then fill in the hash in tasks.md.

> <ide_opened_file>The user opened the file
  d:\Usuario\Projetos\Dev\Apps\sdd-desafio\src\json-nativo.d.ts in the IDE.
  This may or may not be related to the current task.</ide_opened_file>

> fill has on task and then commit

● A commit can't contain its own hash, so I'll commit the code first, then write
  that hash into tasks.md and commit that as a separate docs(tasks) change.

  Ran 1 shell command (ctrl+o to expand)

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && sed -i '26s/^- \[ \]
      \*\*T-001\*\*/- [x] **T-001**/; 29s/`<hash preenchido depois>`/`48a4c76`/'
      specs/001-motor…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      23  
      24  ## Fase 1 — Fundação
      25  
      26 -- [ ] **T-001** — Criar o esqueleto do projeto: `package.json` 
         -(`"type": "module"`, `engines.node >= 24`, scripts `test` = `vi
         -test run`, `typecheck` = `tsc --noEmit`, `reembolso` = `node sr
         -c/cli.ts`; devDependencies `typescript@5.9`, `vitest@5`, `ajv`,
         - `@types/node`), `tsconfig.json` (`strict`, `noEmit`, `erasable
         -SyntaxOnly`, `allowImportingTsExtensions`, `verbatimModuleSynta
         -x`, `target`/`lib` ES2024+, `module`/`moduleResolution` `nodene
         -xt`), `vitest.config.ts` e `tests/infra.test.ts`               
      26 +- [x] **T-001** — Criar o esqueleto do projeto: `package.json` 
         +(`"type": "module"`, `engines.node >= 24`, scripts `test` = `vi
         +test run`, `typecheck` = `tsc --noEmit`, `reembolso` = `node sr
         +c/cli.ts`; devDependencies `typescript@5.9`, `vitest@5`, `ajv`,
         + `@types/node`), `tsconfig.json` (`strict`, `noEmit`, `erasable
         +SyntaxOnly`, `allowImportingTsExtensions`, `verbatimModuleSynta
         +x`, `target`/`lib` ES2024+, `module`/`moduleResolution` `nodene
         +xt`), `vitest.config.ts` e `tests/infra.test.ts`               
      27    - **Atende:** (infraestrutura) — plan §0, R-01
      28    - **Aceite:** `Infra › runtime oferece JSON.rawJSON e context
          .source no reviver do JSON.parse` passa; `npm run typecheck` se
          m erros
      29 -  - **Commit:** `<hash preenchido depois>`                     
      29 +  - **Commit:** `48a4c76`                                      
      30  
      31  - [ ] **T-002** — [P] Criar `src/nucleo/tipos.ts` (tipos do `da
          ta-model.md`: `Centavos`, `DataISO`, `Categoria`, `NumeroJson`,
           `Entrada`, `DespesaValida`, `DespesaElegivel`, `Recusa`, `Parc
          ela`, `ResultadoItem`, `Motivo`, `Resumo`, `Resultado`, e a uni
          ão de códigos de motivo da seção 4 da spec como tipo literal) e
           `src/nucleo/politica.ts` com o objeto `POLITICA` exatamente co
          mo no plan §4 (cada valor com o ID da RN em comentário)
      32    - **Atende:** (infraestrutura) — plan §3 e §4, data-model §5

● I made two commits:

  - 48a4c76 feat(T-001): esqueleto do projeto (package.json, tsconfig, vitest,
    teste de infra) has the six files from T-001.
  - 36bd0e3 docs(tasks): marca T-001 como concluída (48a4c76) marks T-001 as [x]
    in tasks.md (specs/001-motor-reembolso/tasks.md) and fills its Commit field
    with 48a4c76, the hash of the first commit.

  The working tree is clean and nothing has been pushed.

  Following the dependency notes, T-002, T-003 and T-004 come next and can run
  in parallel.

> <ide_opened_file>The user opened the file
  d:\Usuario\Projetos\Dev\Apps\sdd-desafio\specs\001-motor-reembolso\tasks.md
  in the IDE. This may or may not be related to the current
  task.</ide_opened_file>

> execute t-002

  Ran 1 shell command (ctrl+o to expand)

● Now section 4 of the spec (codes and output fields).

  Ran 1 shell command (ctrl+o to expand)

● I'll create the two files. Categoria is derived from the keys of
  POLITICA.limites, so there's only one list of categories (plan §4).

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && mkdir -p src/nucleo
      tests/nucleo && cat > src/nucleo/politica.ts <<'EOF'
      // Única fonte dos valores da política…)
  ⎿  Created src\nucleo\politica.ts (+12 -0)
       1 +// Única fonte dos valores da política (plan §4). Mudar um valo
         +r exige mudar a                                                
       2 +// spec antes.                                                 
       3 +                                                               
       4 +export const POLITICA = {                                      
       5 +  limites: {                                                   
       6 +    alimentacao:       { diario: 60_00n,  ampliaEmViagem: true 
         + }, // RN-009                                                  
       7 +    transporte_urbano: { diario: 80_00n,  ampliaEmViagem: true 
         + }, // RN-009                                                  
       8 +    hospedagem:        { diario: 250_00n, ampliaEmViagem: false
         + }, // RN-009, AMB-020                                         
       9 +  },                                                           
      10 +  fatorViagem: { num: 3n, den: 2n },                           
         +    // RN-011                                                  
      11 +  limiarNotaFiscal: 100_00n,                                   
         +    // RN-008 (estritamente maior)                             
      12 +} as const;                                                    
  ⎿  Created src\nucleo\tipos.ts (+130 -0)
        1 +// Tipos do núcleo (data-model.md). Nenhuma regra nasce aqui. 
        2 +                                                              
        3 +import type { POLITICA } from './politica.ts';                
        4 +                                                              
        5 +/** Dinheiro em centavos inteiros (R-02). */                  
        6 +export type Centavos = bigint;                                
        7 +                                                              
        8 +/** Texto `AAAA-MM-DD` já validado (R-05). */                 
        9 +export type DataISO = string;                                 
       10 +                                                              
       11 +/** Categorias reconhecidas: as chaves de `POLITICA.limites` (
          +RN-006, plan §4). */                                          
       12 +export type Categoria = keyof typeof POLITICA.limites;        
       13 +                                                              
       14 +/** Número como apareceu no arquivo, ex.: `{ texto: "33.333" }
          +` (R-03). */                                                  
       15 +export interface NumeroJson {                                 
       16 +  readonly texto: string;                                     
       17 +}                                                             
       18 +                                                              
       19 +/** Arquivo de entrada válido (RN-015). */                    
       20 +export interface Entrada {                                    
       21 +  /** Eco integral. */                                        
       22 +  readonly colaborador: unknown;                              
       23 +  /** Eco integral. */                                        
       24 +  readonly periodo: unknown;                                  
       25 +  readonly inicio: DataISO;                                   
       26 +  readonly fim: DataISO;                                      
       27 +  /** Cada elemento é bruto (RN-003, AMB-023). */             
       28 +  readonly despesas: readonly unknown[];                      
       29 +}                                                             
       30 +                                                              
       31 +/** Despesa que passou da RN-003 (etapas 1-2). */             
       32 +export interface DespesaValida {                              
       33 +  /** Posição na entrada: ordem da RN-007 e da RN-010. */     
       34 +  readonly indice: number;                                    
       35 +  readonly id: string;                                        
       36 +  /** AMB-024, AMB-025. */                                    
       37 +  readonly idNormalizado: string;                             
       38 +  readonly data: DataISO;                                     
       39 +  readonly categoriaOriginal: string;                         
       40 +  /** RN-002. Ainda pode ser desconhecida (RN-006). */        
     … 90 more lines (ctrl+o to expand)
  ⎿  Created tests\nucleo\politica.test.ts (+10 -0)
       1 +import { describe, expect, expectTypeOf, it } from 'vitest';   
       2 +import { POLITICA } from '../../src/nucleo/politica.ts';       
       3 +import type { Categoria } from '../../src/nucleo/tipos.ts';    
       4 +                                                               
       5 +describe('Infra › política', () => {                           
       6 +  it('Infra › política: categorias reconhecidas são exatamente 
         +as chaves de POLITICA.limites', () => {                        
       7 +    expect(Object.keys(POLITICA.limites).sort()).toEqual(['alim
         +entacao', 'hospedagem', 'transporte_urbano']);                 
       8 +    expectTypeOf<Categoria>().toEqualTypeOf<'alimentacao' | 'tr
         +ansporte_urbano' | 'hospedagem'>();                            
       9 +  });                                                          
      10 +});                                                            
  ⎿  (timeout 2m)

● T-002 is done. Infra › política: categorias reconhecidas são exatamente as
  chaves de POLITICA.limites passes, and npm test (2 of 2) and npm run typecheck
  are both clean.

  What I created:
  - src/nucleo/politica.ts holds POLITICA, copied exactly from plan §4, with the
    RN ID in a comment next to each value.
  - src/nucleo/tipos.ts has all the types from the task: Centavos, DataISO,
    Categoria, NumeroJson, Entrada, DespesaValida, DespesaElegivel, Recusa,
    Parcela, ResultadoItem, Motivo, Resumo, Resultado and CodigoMotivo, which
    lists all 9 codes from section 4.
  - tests/nucleo/politica.test.ts checks the category list when the tests run,
    and also checks that Categoria has exactly those three values when typecheck
    runs.

  Choices that go a little beyond the data model:
  - Categoria comes from the policy. It is built from the keys of
    POLITICA.limites rather than written out as a separate list, so there's only
    one list to keep in sync (plan §4).
  - Two extra types. CodigoRecusa is the 6 refusal codes that Recusa.codigo
    uses. Status is only a type; ResultadoItem doesn't store it, because the
    status is always calculated from the values.
  - DespesaElegivel.diarias is optional. In plan §2 the number of nights is only
    worked out later, in diarias.ts.
  - NumeroJson is a plain { texto } shape, as in the data model. The JSON reader
    in T-003 has to be able to tell it apart from an ordinary {"texto": ...}
    object in the input file, probably by making it a class. If T-003 does that,
    this type may need a small change.

  I haven't committed yet. Should I do what we did for T-001: a feat(T-002)
  commit, then write its hash into tasks.md and commit that as docs(tasks)?

> commit

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && git add src/nucleo
      tests/nucleo && git commit -q -F - <<'EOF'
      feat(T-002): tipos do núcleo e módulo POLITICA…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      28    - **Aceite:** `Infra › runtime oferece JSON.rawJSON e context
          .source no reviver do JSON.parse` passa; `npm run typecheck` se
          m erros
      29    - **Commit:** `48a4c76`
      30  
      31 -- [ ] **T-002** — [P] Criar `src/nucleo/tipos.ts` (tipos do `da
         -ta-model.md`: `Centavos`, `DataISO`, `Categoria`, `NumeroJson`,
         - `Entrada`, `DespesaValida`, `DespesaElegivel`, `Recusa`, `Parc
         -ela`, `ResultadoItem`, `Motivo`, `Resumo`, `Resultado`, e a uni
         -ão de códigos de motivo da seção 4 da spec como tipo literal) e
         - `src/nucleo/politica.ts` com o objeto `POLITICA` exatamente co
         -mo no plan §4 (cada valor com o ID da RN em comentário)        
      31 +- [x] **T-002** — [P] Criar `src/nucleo/tipos.ts` (tipos do `da
         +ta-model.md`: `Centavos`, `DataISO`, `Categoria`, `NumeroJson`,
         + `Entrada`, `DespesaValida`, `DespesaElegivel`, `Recusa`, `Parc
         +ela`, `ResultadoItem`, `Motivo`, `Resumo`, `Resultado`, e a uni
         +ão de códigos de motivo da seção 4 da spec como tipo literal) e
         + `src/nucleo/politica.ts` com o objeto `POLITICA` exatamente co
         +mo no plan §4 (cada valor com o ID da RN em comentário)        
      32    - **Atende:** (infraestrutura) — plan §3 e §4, data-model §5
      33    - **Aceite:** `Infra › política: categorias reconhecidas são 
          exatamente as chaves de POLITICA.limites` passa (em `tests/nucl
          eo/politica.test.ts`); `npm run typecheck` sem erros
      34 -  - **Commit:** `<hash preenchido depois>`                     
      34 +  - **Commit:** `874fe94`                                      
      35  
      36  - [ ] **T-003** — [P] Criar `src/io/json.ts`: `lerJson(texto)` 
          com `JSON.parse` + reviver que troca **todo** número por `Numer
          oJson { texto }` usando `context.source` (R-03); `serializarJso
          n(valor)` com indentação de 2 espaços e `\n` final, reemitindo 
          `NumeroJson` e valores monetários via `JSON.rawJSON` (R-04)
      37    - **Atende:** (infraestrutura) — R-03, R-04, contracts/cli.md

● I noticed the T-002 commit message is malformed—the blank line before
  Co-Authored-By was missing, merging it into the subject. Since neither commit
  is pushed yet, I'll redo both and update tasks.md with the new hash.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && git reset -q --soft
      36bd0e3 && git restore --staged specs/001-motor-reembolso/tasks.md && sed
      -i 's/`874fe94`/`…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+1 -1)
      31  - [x] **T-002** — [P] Criar `src/nucleo/tipos.ts` (tipos do `da
          ta-model.md`: `Centavos`, `DataISO`, `Categoria`, `NumeroJson`,
           `Entrada`, `DespesaValida`, `DespesaElegivel`, `Recusa`, `Parc
          ela`, `ResultadoItem`, `Motivo`, `Resumo`, `Resultado`, e a uni
          ão de códigos de motivo da seção 4 da spec como tipo literal) e
           `src/nucleo/politica.ts` com o objeto `POLITICA` exatamente co
          mo no plan §4 (cada valor com o ID da RN em comentário)
      32    - **Atende:** (infraestrutura) — plan §3 e §4, data-model §5
      33    - **Aceite:** `Infra › política: categorias reconhecidas são 
          exatamente as chaves de POLITICA.limites` passa (em `tests/nucl
          eo/politica.test.ts`); `npm run typecheck` sem erros
      34 -  - **Commit:** `874fe94`                                      
      34 +  - **Commit:** `053d39d`                                      
      35  
      36  - [ ] **T-003** — [P] Criar `src/io/json.ts`: `lerJson(texto)` 
          com `JSON.parse` + reviver que troca **todo** número por `Numer
          oJson { texto }` usando `context.source` (R-03); `serializarJso
          n(valor)` com indentação de 2 espaços e `\n` final, reemitindo 
          `NumeroJson` e valores monetários via `JSON.rawJSON` (R-04)
      37    - **Atende:** (infraestrutura) — R-03, R-04, contracts/cli.md

  Ran 2 shell commands (ctrl+o to expand)

● T-002 is committed, and its hash is filled in tasks.md:

  - 053d39d feat(T-002): tipos do núcleo e módulo POLITICA has politica.ts,
    tipos.ts and politica.test.ts.
  - 7db2f8a docs(tasks): marca T-002 como concluída (053d39d) marks T-002 as [x]
    in tasks.md and fills in the hash.

  My first attempt left out the blank line between the subject and
  Co-Authored-By, so both ended up on the subject line. The commits weren't
  pushed yet, so I undid them and made them again with the right format. That's
  why the hash is 053d39d and not 874fe94.

  The working tree is clean and nothing has been pushed. T-003 (src/io/json.ts)
  and T-004 (src/nucleo/datas.ts) are next.

> execute t-003
  Ran 1 shell command (ctrl+o to expand)

● I'll convert NumeroJson in tipos.ts into a small class, since a plain { texto
  } shape can't be reliably distinguished from an ordinary object at
  runtime—something the pure core will need for comoTexto (T-007).

  Ran 1 shell command (ctrl+o to expand)

● That command hung, probably on the Windows python stub, so I'll stop it and
  use Edit.

● Stop Task
  ⎿  cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && python - <<'EOF'
     2>/dev/null || node -e "
     const fs=require('fs');const p='src/nucleo/tipos.ts';let
     s=fs.readFile… · stopped

  Read 1 file (ctrl+o to expand)

● Update(src\nucleo\tipos.ts)
  ⎿  Added 9 lines, removed 2 lines
      11  /** Categorias reconhecidas: as chaves de `POLITICA.limites` (R
          N-006, plan §4). */
      12  export type Categoria = keyof typeof POLITICA.limites;
      13  
      14 -/** Número como apareceu no arquivo, ex.: `{ texto: "33.333" }`
         - (R-03). */                                                    
      15 -export interface NumeroJson {                                  
      14 +/**                                                            
      15 + * Número como apareceu no arquivo, ex.: `{ texto: "33.333" }` 
         +(R-03).                                                        
      16 + * Classe para distinguir de um objeto `{"texto": ...}` vindo d
         +a entrada.                                                     
      17 + */                                                            
      18 +export class NumeroJson {                                      
      19    readonly texto: string;
      20 +                                                               
      21 +  constructor(texto: string) {                                 
      22 +    this.texto = texto;                                        
      23 +  }                                                            
      24  }
      25  
      26  /** Arquivo de entrada válido (RN-015). */

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && mkdir -p src/io tests/io
      && cat > src/io/json.ts <<'EOF'
      // Leitura e escrita de JSON sem passar número por flo…)
  ⎿  Created src\io\json.ts (+15 -0)
       1 +// Leitura e escrita de JSON sem passar número por float (R-03,
         + R-04).                                                        
       2 +                                                               
       3 +import { NumeroJson } from '../nucleo/tipos.ts';               
       4 +                                                               
       5 +/** `JSON.parse` em que todo número vira `NumeroJson` com o tex
         +to original (R-03). */                                         
       6 +export function lerJson(texto: string): unknown {              
       7 +  return JSON.parse(texto, (_chave, valor, contexto) =>        
       8 +    typeof valor === 'number' ? new NumeroJson(contexto.source 
         +?? String(valor)) : valor,                                     
       9 +  );                                                           
      10 +}                                                              
      11 +                                                               
      12 +/** JSON com indentação de 2 espaços e `\n` final; `NumeroJson`
         + sai com o texto original (R-04). */                           
      13 +export function serializarJson(valor: unknown): string {       
      14 +  return JSON.stringify(valor, (_chave, v: unknown) => (v insta
         +nceof NumeroJson ? JSON.rawJSON(v.texto) : v), 2) + '\n';      
      15 +}                                                              
  ⎿  Created tests\io\json.test.ts (+39 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { lerJson, serializarJson } from '../../src/io/json.ts';
       3 +import { NumeroJson } from '../../src/nucleo/tipos.ts';        
       4 +                                                               
       5 +describe('Infra › json', () => {                               
       6 +  it('Infra › json: número vira NumeroJson com o texto original
         + ("10.005", "1.00005e2")', () => {                             
       7 +    const lido = lerJson('{"a": 10.005, "b": 1.00005e2}') as Re
         +cord<string, unknown>;                                         
       8 +    expect(lido.a).toBeInstanceOf(NumeroJson);                 
       9 +    expect(lido.a).toEqual(new NumeroJson('10.005'));          
      10 +    expect(lido.b).toEqual(new NumeroJson('1.00005e2'));       
      11 +  });                                                          
      12 +                                                               
      13 +  it('Infra › json: números aninhados em objetos e listas també
         +m são embrulhados', () => {                                    
      14 +    const lido = lerJson('{"x": {"y": [1, {"z": -0.50}]}, "t": 
         +"10", "u": true, "n": null}');                                 
      15 +    expect(lido).toEqual({                                     
      16 +      x: { y: [new NumeroJson('1'), { z: new NumeroJson('-0.50'
         +) }] },                                                        
      17 +      t: '10',                                                 
      18 +      u: true,                                                 
      19 +      n: null,                                                 
      20 +    });                                                        
      21 +  });                                                          
      22 +                                                               
      23 +  it('Infra › json: NumeroJson é reemitido com o mesmo texto', 
         +() => {                                                        
      24 +    const texto = '{"a": 10.005, "b": [1.00005e2, 45.00], "c": 
         +{"d": -0}}';                                                   
      25 +    expect(serializarJson(lerJson(texto))).toBe(               
      26 +      '{\n  "a": 10.005,\n  "b": [\n    1.00005e2,\n    45.00\n
         +  ],\n  "c": {\n    "d": -0\n  }\n}\n',                        
      27 +    );                                                         
      28 +  });                                                          
      29 +                                                               
      30 +  it('Infra › json: JSON.rawJSON("45.00") sai como número 45.00
         +, não como texto', () => {                                     
      31 +    expect(serializarJson({ v: JSON.rawJSON('45.00') })).toBe('
         +{\n  "v": 45.00\n}\n');                                        
      32 +  });                                                          
      33 +                                                               
      34 +  it('Infra › json: objeto {"texto": ...} da entrada não é conf
         +undido com NumeroJson', () => {                                
      35 +    const lido = lerJson('{"texto": "1"}');                    
      36 +    expect(lido).not.toBeInstanceOf(NumeroJson);               
      37 +    expect(serializarJson(lido)).toBe('{\n  "texto": "1"\n}\n')
         +;                                                              
      38 +  });                                                          
      39 +});                                                            
  ⎿  (timeout 2m)

● T-003 is done. All 4 tests named in the task pass, and npm test (7 of 7) and
  npm run typecheck are both clean.

  What I created:
  - src/io/json.ts has two functions:
    - lerJson reads JSON and replaces every number, at any depth, with a
      NumeroJson holding its original text.
    - serializarJson writes JSON with 2-space indentation and a trailing \n.
      Each NumeroJson comes out with its original text, so 1.00005e2, 45.00 and
      -0 are written exactly as they were read.
  - tests/io/json.test.ts has the 4 tests from the task plus one I added: Infra
    › json: objeto {"texto": ...} da entrada não é confundido com NumeroJson.

  A change to an earlier task: in src/nucleo/tipos.ts, NumeroJson is now a small
  class instead of a plain { texto } shape. Without that, a {"texto": "1"}
  object in the input would look exactly like a number from the file. The core
  needs this check too, later on, for comoTexto in T-007. The class still counts
  as erasable syntax. data-model.md §1 still describes it as { texto: string };
  if you want the doc to match, it needs a small docs(plan): change.

  Money is not serialized here yet. serializarJson writes any value that was
  built with JSON.rawJSON(...) as a number, but it doesn't turn a bigint into
  money itself. Turning centavos into "45.00" is formatarDecimal, which is
  T-005, and building the output object is io/saida. A bigint passed straight to
  serializarJson would throw an error.

  One of my commands hung for 2 minutes on Windows' python placeholder, so I
  stopped it and made the edit with Edit instead. Nothing else was affected.

  Should I commit it the same way as before: feat(T-003), then the hash in
  tasks.md as docs(tasks)?

> do it

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && git status --short &&
      git add src/io src/nucleo/tipos.ts tests/io && git commit -q -F - <<'EOF'
      feat(T-003): le…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      33    - **Aceite:** `Infra › política: categorias reconhecidas são 
          exatamente as chaves de POLITICA.limites` passa (em `tests/nucl
          eo/politica.test.ts`); `npm run typecheck` sem erros
      34    - **Commit:** `053d39d`
      35  
      36 -- [ ] **T-003** — [P] Criar `src/io/json.ts`: `lerJson(texto)` 
         -com `JSON.parse` + reviver que troca **todo** número por `Numer
         -oJson { texto }` usando `context.source` (R-03); `serializarJso
         -n(valor)` com indentação de 2 espaços e `\n` final, reemitindo 
         -`NumeroJson` e valores monetários via `JSON.rawJSON` (R-04)    
      36 +- [x] **T-003** — [P] Criar `src/io/json.ts`: `lerJson(texto)` 
         +com `JSON.parse` + reviver que troca **todo** número por `Numer
         +oJson { texto }` usando `context.source` (R-03); `serializarJso
         +n(valor)` com indentação de 2 espaços e `\n` final, reemitindo 
         +`NumeroJson` e valores monetários via `JSON.rawJSON` (R-04)    
      37    - **Atende:** (infraestrutura) — R-03, R-04, contracts/cli.md
      38    - **Aceite:** em `tests/io/json.test.ts` passam `Infra › json
          : número vira NumeroJson com o texto original ("10.005", "1.000
          05e2")`, `Infra › json: números aninhados em objetos e listas t
          ambém são embrulhados`, `Infra › json: NumeroJson é reemitido c
          om o mesmo texto` e `Infra › json: JSON.rawJSON("45.00") sai co
          mo número 45.00, não como texto`
      39 -  - **Commit:** `<hash preenchido depois>`                     
      39 +  - **Commit:** `cdcf3cc`                                      
      40  
      41  - [ ] **T-004** — [P] Criar `src/nucleo/datas.ts` (R-05): `ehDa
          taValida(texto)` (regex `^\d{4}-\d{2}-\d{2}$` + existência no c
          alendário), `somarDias(data, k)` com `Date.UTC` e comparação po
          r texto
      42    - **Atende:** (infraestrutura) — R-05

● I committed T-003 and wrote its hash into tasks.md:

  - cdcf3cc feat(T-003): leitura e escrita de JSON preservando o texto dos
    números contains src/io/json.ts, the NumeroJson class change in tipos.ts,
    and tests/io/json.test.ts.
  - 10cf805 docs(tasks): marca T-003 como concluída (cdcf3cc) marks T-003 as [x]
    and fills in the hash.

  The working tree is clean and nothing has been pushed. T-004
  (src/nucleo/datas.ts) is next, and T-005 comes after it.

> /speckit-implement

  Ran 3 shell commands (ctrl+o to expand)

● The requirements.md checklist passes all 15 items, and no extensions.yml hooks
  are configured. Next, I'll read the full context: tasks, spec, plan,
  research, and the constitution.

  Read 2 files, ran 1 shell command (ctrl+o to expand)

● I've finished reading the spec and plan. Next I'll read the constitution, the
  output schema and the example file, then start on T-004.

  Ran 1 shell command (ctrl+o to expand)

● .gitignore already covers node_modules, dist, build, .env, and OS/editor
  files, so no changes needed there. I'll write a scratchpad helper script to
  keep the per-task commit pattern (feat commit + docs commit marking
  completion) consistent across all ~38 tasks.

  Ran 1 shell command (ctrl+o to expand)

● Starting T-004 (dates).

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      src/nucleo/datas.ts <<'EOF'
      // Datas `AAAA-MM-DD` em UTC (R-05). Por ter largura fixa, `DataISO` se
      compa…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      38    - **Aceite:** em `tests/io/json.test.ts` passam `Infra › json
          : número vira NumeroJson com o texto original ("10.005", "1.000
          05e2")`, `Infra › json: números aninhados em objetos e listas t
          ambém são embrulhados`, `Infra › json: NumeroJson é reemitido c
          om o mesmo texto` e `Infra › json: JSON.rawJSON("45.00") sai co
          mo número 45.00, não como texto`
      39    - **Commit:** `cdcf3cc`
      40  
      41 -- [ ] **T-004** — [P] Criar `src/nucleo/datas.ts` (R-05): `ehDa
         -taValida(texto)` (regex `^\d{4}-\d{2}-\d{2}$` + existência no c
         -alendário), `somarDias(data, k)` com `Date.UTC` e comparação po
         -r texto                                                        
      41 +- [x] **T-004** — [P] Criar `src/nucleo/datas.ts` (R-05): `ehDa
         +taValida(texto)` (regex `^\d{4}-\d{2}-\d{2}$` + existência no c
         +alendário), `somarDias(data, k)` com `Date.UTC` e comparação po
         +r texto                                                        
      42    - **Atende:** (infraestrutura) — R-05
      43    - **Aceite:** em `tests/nucleo/datas.test.ts` passam `Infra ›
           datas: 2026-02-30 e 2026-07-32 são inválidas e 2024-02-29 é vá
          lida`, `Infra › datas: formato diferente de AAAA-MM-DD é inváli
          do ("2026-7-3", "03/07/2026")` e `Infra › datas: 2026-07-31 + 1
           dia = 2026-08-01, independente do fuso`
      44 -  - **Commit:** `<hash preenchido depois>`                     
      44 +  - **Commit:** `c356fd3`                                      
      45  
      46  - [ ] **T-005** — Criar `src/nucleo/dinheiro.ts` com a formataç
          ão de centavos: `formatarDecimal(c)` (`4500n` → `"45.00"`, para
           a saída JSON) e `formatarReais(c)` (`6000n` → `"R$ 60,00"`, pa
          ra `motivo.descricao`)
      47    - **Atende:** (infraestrutura) — R-02, R-04
  ⎿  Created src\nucleo\datas.ts (+24 -0)
       1 +// Datas `AAAA-MM-DD` em UTC (R-05). Por ter largura fixa, `Dat
         +aISO` se compara                                               
       2 +// como texto (`<`, `<=`).                                     
       3 +                                                               
       4 +import type { DataISO } from './tipos.ts';                     
       5 +                                                               
       6 +const FORMATO = /^\d{4}-\d{2}-\d{2}$/;                         
       7 +                                                               
       8 +/** Formato `AAAA-MM-DD` e data existente no calendário. */    
       9 +export function ehDataValida(texto: string): texto is DataISO {
      10 +  if (!FORMATO.test(texto)) return false;                      
      11 +  const [ano, mes, dia] = texto.split('-').map(Number) as [numb
         +er, number, number];                                           
      12 +  const d = new Date(Date.UTC(ano, mes - 1, dia));             
      13 +  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes 
         +- 1 && d.getUTCDate() === dia;                                 
      14 +}                                                              
      15 +                                                               
      16 +/** `data + k` dias. */                                        
      17 +export function somarDias(data: DataISO, k: number): DataISO { 
      18 +  const [ano, mes, dia] = data.split('-').map(Number) as [numbe
         +r, number, number];                                            
      19 +  const d = new Date(Date.UTC(ano, mes - 1, dia + k));         
      20 +  const aaaa = String(d.getUTCFullYear()).padStart(4, '0');    
      21 +  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');     
      22 +  const dd = String(d.getUTCDate()).padStart(2, '0');          
      23 +  return `${aaaa}-${mm}-${dd}`;                                
      24 +}                                                              
  ⎿  Created tests\nucleo\datas.test.ts (+34 -0)
       1 +import { afterEach, describe, expect, it } from 'vitest';      
       2 +import { ehDataValida, somarDias } from '../../src/nucleo/datas
         +.ts';                                                          
       3 +                                                               
       4 +describe('Infra › datas', () => {                              
       5 +  const tzOriginal = process.env.TZ;                           
       6 +  afterEach(() => {                                            
       7 +    process.env.TZ = tzOriginal;                               
       8 +  });                                                          
       9 +                                                               
      10 +  it('Infra › datas: 2026-02-30 e 2026-07-32 são inválidas e 20
         +24-02-29 é válida', () => {                                    
      11 +    expect(ehDataValida('2026-02-30')).toBe(false);            
      12 +    expect(ehDataValida('2026-07-32')).toBe(false);            
      13 +    expect(ehDataValida('2026-13-01')).toBe(false);            
      14 +    expect(ehDataValida('2025-02-29')).toBe(false);            
      15 +    expect(ehDataValida('2024-02-29')).toBe(true);             
      16 +    expect(ehDataValida('2026-07-31')).toBe(true);             
      17 +  });                                                          
      18 +                                                               
      19 +  it('Infra › datas: formato diferente de AAAA-MM-DD é inválido
         + ("2026-7-3", "03/07/2026")', () => {                          
      20 +    for (const texto of ['2026-7-3', '03/07/2026', '2026-07-03T
         +00:00', ' 2026-07-03', '', '20260703']) {                      
      21 +      expect(ehDataValida(texto), texto).toBe(false);          
      22 +    }                                                          
      23 +  });                                                          
      24 +                                                               
      25 +  it('Infra › datas: 2026-07-31 + 1 dia = 2026-08-01, independe
         +nte do fuso', () => {                                          
      26 +    for (const tz of ['UTC', 'America/Sao_Paulo', 'Pacific/Kiri
         +timati', 'Pacific/Pago_Pago']) {                               
      27 +      process.env.TZ = tz;                                     
      28 +      expect(somarDias('2026-07-31', 1), tz).toBe('2026-08-01')
         +;                                                              
      29 +      expect(somarDias('2026-12-31', 1), tz).toBe('2027-01-01')
         +;                                                              
      30 +      expect(somarDias('2024-02-28', 1), tz).toBe('2024-02-29')
         +;                                                              
      31 +      expect(somarDias('2026-07-14', 0), tz).toBe('2026-07-14')
         +;                                                              
      32 +    }                                                          
      33 +  });                                                          
      34 +});                                                            
  ⎿  (timeout 3m)

● T-004 is done. Next is T-005 (money formatting).

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      src/nucleo/dinheiro.ts <<'EOF'
      // Dinheiro em centavos `bigint` (R-02).…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      43    - **Aceite:** em `tests/nucleo/datas.test.ts` passam `Infra ›
           datas: 2026-02-30 e 2026-07-32 são inválidas e 2024-02-29 é vá
          lida`, `Infra › datas: formato diferente de AAAA-MM-DD é inváli
          do ("2026-7-3", "03/07/2026")` e `Infra › datas: 2026-07-31 + 1
           dia = 2026-08-01, independente do fuso`
      44    - **Commit:** `c356fd3`
      45  
      46 -- [ ] **T-005** — Criar `src/nucleo/dinheiro.ts` com a formataç
         -ão de centavos: `formatarDecimal(c)` (`4500n` → `"45.00"`, para
         - a saída JSON) e `formatarReais(c)` (`6000n` → `"R$ 60,00"`, pa
         -ra `motivo.descricao`)                                         
      46 +- [x] **T-005** — Criar `src/nucleo/dinheiro.ts` com a formataç
         +ão de centavos: `formatarDecimal(c)` (`4500n` → `"45.00"`, para
         + a saída JSON) e `formatarReais(c)` (`6000n` → `"R$ 60,00"`, pa
         +ra `motivo.descricao`)                                         
      47    - **Atende:** (infraestrutura) — R-02, R-04
      48    - **Aceite:** em `tests/nucleo/dinheiro.test.ts` passam `Infr
          a › dinheiro: formatarDecimal 4500n → "45.00", -4500n → "-45.00
          ", 5n → "0.05", 0n → "0.00"` e `Infra › dinheiro: formatarReais
           6000n → "R$ 60,00" e 186184n → "R$ 1.861,84"`
      49 -  - **Commit:** `<hash preenchido depois>`                     
      49 +  - **Commit:** `98def79`                                      
      50  
      51  ## Fase 2 — Regras de negócio
      52  
  ⎿  Created src\nucleo\dinheiro.ts (+25 -0)
       1 +// Dinheiro em centavos `bigint` (R-02).                       
       2 +                                                               
       3 +import type { Centavos } from './tipos.ts';                    
       4 +                                                               
       5 +function partes(c: Centavos): { sinal: string; inteiros: string
         +; centavos: string } {                                         
       6 +  const abs = c < 0n ? -c : c;                                 
       7 +  return {                                                     
       8 +    sinal: c < 0n ? '-' : '',                                  
       9 +    inteiros: (abs / 100n).toString(),                         
      10 +    centavos: (abs % 100n).toString().padStart(2, '0'),        
      11 +  };                                                           
      12 +}                                                              
      13 +                                                               
      14 +/** `4500n` → `"45.00"`: texto de número JSON (R-04). */       
      15 +export function formatarDecimal(c: Centavos): string {         
      16 +  const { sinal, inteiros, centavos } = partes(c);             
      17 +  return `${sinal}${inteiros}.${centavos}`;                    
      18 +}                                                              
      19 +                                                               
      20 +/** `186184n` → `"R$ 1.861,84"`: para `motivo.descricao`. */   
      21 +export function formatarReais(c: Centavos): string {           
      22 +  const { sinal, inteiros, centavos } = partes(c);             
      23 +  const milhar = inteiros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
         +;                                                              
      24 +  return `${sinal}R$ ${milhar},${centavos}`;                   
      25 +}                                                              
  ⎿  Created tests\nucleo\dinheiro.test.ts (+21 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { formatarDecimal, formatarReais } from '../../src/nucle
         +o/dinheiro.ts';                                                
       3 +                                                               
       4 +describe('Infra › dinheiro', () => {                           
       5 +  it('Infra › dinheiro: formatarDecimal 4500n → "45.00", -4500n
         + → "-45.00", 5n → "0.05", 0n → "0.00"', () => {                
       6 +    expect(formatarDecimal(4500n)).toBe('45.00');              
       7 +    expect(formatarDecimal(-4500n)).toBe('-45.00');            
       8 +    expect(formatarDecimal(5n)).toBe('0.05');                  
       9 +    expect(formatarDecimal(0n)).toBe('0.00');                  
      10 +    expect(formatarDecimal(-5n)).toBe('-0.05');                
      11 +    expect(formatarDecimal(123456789012345678901n)).toBe('12345
         +67890123456789.01');                                           
      12 +  });                                                          
      13 +                                                               
      14 +  it('Infra › dinheiro: formatarReais 6000n → "R$ 60,00" e 1861
         +84n → "R$ 1.861,84"', () => {                                  
      15 +    expect(formatarReais(6000n)).toBe('R$ 60,00');             
      16 +    expect(formatarReais(186184n)).toBe('R$ 1.861,84');        
      17 +    expect(formatarReais(0n)).toBe('R$ 0,00');                 
      18 +    expect(formatarReais(100000000n)).toBe('R$ 1.000.000,00'); 
      19 +    expect(formatarReais(-4500n)).toBe('-R$ 45,00');           
      20 +  });                                                          
      21 +});                                                            
  ⎿  (timeout 3m)

● Phase 1 (T-001 to T-005) is complete. Phase 2 starts with T-006, paraCentavos
  (round half to even).

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >>
      src/nucleo/dinheiro.ts <<'EOF'…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      50  
      51  ## Fase 2 — Regras de negócio
      52  
      53 -- [ ] **T-006** — [P] Implementar `paraCentavos(texto)` em `src
         -/nucleo/dinheiro.ts`: converte o texto de um número (sinal, díg
         -itos, ponto decimal, expoente) em `Centavos` arredondando **mei
         -o para o par** sobre os dígitos, sem passar por float (DT-001) 
      53 +- [x] **T-006** — [P] Implementar `paraCentavos(texto)` em `src
         +/nucleo/dinheiro.ts`: converte o texto de um número (sinal, díg
         +itos, ponto decimal, expoente) em `Centavos` arredondando **mei
         +o para o par** sobre os dígitos, sem passar por float (DT-001) 
      54    - **Atende:** RN-001, AMB-013
      55    - **Aceite:** em `tests/nucleo/rn-001-arredondamento.test.ts`
           passam `RN-001 › 33.333 → 33.33`, `RN-001 › 10.005 → 10.00 (me
          io, 0 é par)`, `RN-001 › 10.015 → 10.02 (meio, 2 é par)`, `RN-0
          01 › 33.345 → 33.34`, `RN-001 › 33.3451 → 33.35 (fora do meio)`
          , `RN-001 › 100.004 → 100.00`, `RN-001 › -45.005 → -45.00 (meio
           para o par também no negativo)` e `RN-001 › expoente 1.00005e2
           → 100.00`
      56 -  - **Commit:** `<hash preenchido depois>`                     
      56 +  - **Commit:** `e089af9`                                      
      57  
      58  - [ ] **T-007** — [P] Criar `src/nucleo/texto.ts` (R-06): `norm
          alizar(texto)` = `trim` → minúsculas → `NFD` → remove `\p{M}`; 
          e `normalizarFornecedor(texto)` = só `trim` + minúsculas (a RN-
          007 não manda tirar acento do fornecedor); e `comoTexto(bruto)`
           (AMB-026): ausente/`null` → `""`, texto como veio, `NumeroJson
          ` → o seu texto, booleano → `"true"`/`"false"`, lista/objeto → 
          texto JSON compacto (`NumeroJson` reemitido com o texto origina
          l)
      59    - **Atende:** RN-002, AMB-014, RN-003, AMB-026
  ⎿  Updated src\nucleo\dinheiro.ts (+27 -0)
      23    const milhar = inteiros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
          ;
      24    return `${sinal}R$ ${milhar},${centavos}`;
      25  }
      26 +                                                               
      27 +const NUMERO = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/;   
      28 +                                                               
      29 +/**                                                            
      30 + * Texto de número (sinal, dígitos, ponto decimal, expoente) → 
         +centavos,                                                      
      31 + * arredondando meio para o par sobre os dígitos, sem float (RN
         +-001, DT-001).                                                 
      32 + * Devolve `null` se o texto não é um número nesse formato.    
      33 + */                                                            
      34 +export function paraCentavos(texto: string): Centavos | null { 
      35 +  const m = NUMERO.exec(texto);                                
      36 +  if (!m) return null;                                         
      37 +  const [, sinal, inteiros, fracao = '', expoente = '0'] = m;  
      38 +  const digitos = BigInt(inteiros! + fracao);                  
      39 +  // valor × 100 = digitos × 10^escala                         
      40 +  const escala = Number(expoente) - fracao.length + 2;         
      41 +  let abs: bigint;                                             
      42 +  if (escala >= 0) {                                           
      43 +    abs = digitos * 10n ** BigInt(escala);                     
      44 +  } else {                                                     
      45 +    const divisor = 10n ** BigInt(-escala);                    
      46 +    const quociente = digitos / divisor;                       
      47 +    const dobroDoResto = (digitos % divisor) * 2n;             
      48 +    const sobe = dobroDoResto > divisor || (dobroDoResto === di
         +visor && quociente % 2n === 1n);                               
      49 +    abs = sobe ? quociente + 1n : quociente;                   
      50 +  }                                                            
      51 +  return sinal === '-' ? -abs : abs;                           
      52 +}                                                              
  ⎿  Created tests\nucleo\rn-001-arredondamento.test.ts (+47 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { paraCentavos } from '../../src/nucleo/dinheiro.ts';   
       3 +                                                               
       4 +describe('RN-001 — Arredondamento de valores para centavos', ()
         + => {                                                          
       5 +  it('RN-001 › 33.333 → 33.33', () => {                        
       6 +    expect(paraCentavos('33.333')).toBe(3333n);                
       7 +  });                                                          
       8 +                                                               
       9 +  it('RN-001 › 10.005 → 10.00 (meio, 0 é par)', () => {        
      10 +    expect(paraCentavos('10.005')).toBe(1000n);                
      11 +  });                                                          
      12 +                                                               
      13 +  it('RN-001 › 10.015 → 10.02 (meio, 2 é par)', () => {        
      14 +    expect(paraCentavos('10.015')).toBe(1002n);                
      15 +  });                                                          
      16 +                                                               
      17 +  it('RN-001 › 33.345 → 33.34', () => {                        
      18 +    expect(paraCentavos('33.345')).toBe(3334n);                
      19 +  });                                                          
      20 +                                                               
      21 +  it('RN-001 › 33.3451 → 33.35 (fora do meio)', () => {        
      22 +    expect(paraCentavos('33.3451')).toBe(3335n);               
      23 +  });                                                          
      24 +                                                               
      25 +  it('RN-001 › 100.004 → 100.00', () => {                      
      26 +    expect(paraCentavos('100.004')).toBe(10000n);              
      27 +  });                                                          
      28 +                                                               
      29 +  it('RN-001 › -45.005 → -45.00 (meio para o par também no nega
         +tivo)', () => {                                                
      30 +    expect(paraCentavos('-45.005')).toBe(-4500n);              
      31 +    expect(paraCentavos('-45.015')).toBe(-4502n);              
      32 +  });                                                          
      33 +                                                               
      34 +  it('RN-001 › expoente 1.00005e2 → 100.00', () => {           
      35 +    expect(paraCentavos('1.00005e2')).toBe(10000n);            
      36 +    expect(paraCentavos('1.00015E2')).toBe(10002n);            
      37 +    expect(paraCentavos('4500e-2')).toBe(4500n);               
      38 +    expect(paraCentavos('45e+0')).toBe(4500n);                 
      39 +  });                                                          
      40 +                                                               
     … 7 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      src/nucleo/texto.ts <<'EOF'
      // Normalização de texto (R-06) e conversão de valor bruto em texto
      (AMB-026)…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      55    - **Aceite:** em `tests/nucleo/rn-001-arredondamento.test.ts`
           passam `RN-001 › 33.333 → 33.33`, `RN-001 › 10.005 → 10.00 (me
          io, 0 é par)`, `RN-001 › 10.015 → 10.02 (meio, 2 é par)`, `RN-0
          01 › 33.345 → 33.34`, `RN-001 › 33.3451 → 33.35 (fora do meio)`
          , `RN-001 › 100.004 → 100.00`, `RN-001 › -45.005 → -45.00 (meio
           para o par também no negativo)` e `RN-001 › expoente 1.00005e2
           → 100.00`
      56    - **Commit:** `e089af9`
      57  
      58 -- [ ] **T-007** — [P] Criar `src/nucleo/texto.ts` (R-06): `norm
         -alizar(texto)` = `trim` → minúsculas → `NFD` → remove `\p{M}`; 
         -e `normalizarFornecedor(texto)` = só `trim` + minúsculas (a RN-
         -007 não manda tirar acento do fornecedor); e `comoTexto(bruto)`
         - (AMB-026): ausente/`null` → `""`, texto como veio, `NumeroJson
         -` → o seu texto, booleano → `"true"`/`"false"`, lista/objeto → 
         -texto JSON compacto (`NumeroJson` reemitido com o texto origina
         -l)                                                             
      58 +- [x] **T-007** — [P] Criar `src/nucleo/texto.ts` (R-06): `norm
         +alizar(texto)` = `trim` → minúsculas → `NFD` → remove `\p{M}`; 
         +e `normalizarFornecedor(texto)` = só `trim` + minúsculas (a RN-
         +007 não manda tirar acento do fornecedor); e `comoTexto(bruto)`
         + (AMB-026): ausente/`null` → `""`, texto como veio, `NumeroJson
         +` → o seu texto, booleano → `"true"`/`"false"`, lista/objeto → 
         +texto JSON compacto (`NumeroJson` reemitido com o texto origina
         +l)                                                             
      59    - **Atende:** RN-002, AMB-014, RN-003, AMB-026
      60    - **Aceite:** em `tests/nucleo/rn-002-categoria.test.ts` pass
          am `RN-002 › "ALIMENTACAO", " Alimentação " e "alimentacao" vir
          am alimentacao` e `RN-002 › "Transporte_Urbano" e "HOSPEDAGEM" 
          viram transporte_urbano e hospedagem`; em `tests/nucleo/rn-003-
          validacao.test.ts` passa `RN-003 › fornecedor/descricao como te
          xto: ausente e null → "", 123 → "123", true → "true", [1, 2] → 
          "[1,2]"`
      61 -  - **Commit:** `<hash preenchido depois>`                     
      61 +  - **Commit:** `6a5e1b4`                                      
      62  
      63  - [ ] **T-008** — Criar `src/nucleo/despesa.ts` com `validarDes
          pesa(bruta, indice)` → `DespesaValida | Recusa(DADO_INVALIDO)`:
           item que não é objeto; `id`, `data`, `categoria` ausentes, nul
          os, vazios/só espaços ou não textuais; `data` inválida (T-004);
           `valor` ausente. A `Recusa` carrega os ecos **brutos** de `id`
          /`data`/`categoria` (ausente → `null`) e o `valor_solicitado` a
          rredondado quando o `valor` é um `NumeroJson` (neste passo só `
          NumeroJson` é aceito como valor; texto vem na T-009). Aplica `n
          ormalizar` na categoria (RN-002) sem recusar categoria desconhe
          cida. Preenche `descricao` e `fornecedorChave` com `comoTexto` 
          (T-007); esses dois campos nunca recusam a despesa (AMB-026)
      64    - **Atende:** RN-003, AMB-018, AMB-023, AMB-026
  ⎿  Created src\nucleo\texto.ts (+22 -0)
       1 +// Normalização de texto (R-06) e conversão de valor bruto em t
         +exto (AMB-026).                                                
       2 +                                                               
       3 +import { NumeroJson } from './tipos.ts';                       
       4 +                                                               
       5 +/** Categoria e `id`: sem espaços nas bordas, minúsculas, sem a
         +centos (RN-002, AMB-024). */                                   
       6 +export function normalizar(texto: string): string {            
       7 +  return texto.trim().toLowerCase().normalize('NFD').replace(/\
         +p{M}/gu, '');                                                  
       8 +}                                                              
       9 +                                                               
      10 +/** Fornecedor: só sem espaços nas bordas e minúsculas; mantém 
         +acentos (RN-007). */                                           
      11 +export function normalizarFornecedor(texto: string): string {  
      12 +  return texto.trim().toLowerCase();                           
      13 +}                                                              
      14 +                                                               
      15 +/** Qualquer valor bruto como texto (RN-003, AMB-026). */      
      16 +export function comoTexto(bruto: unknown): string {            
      17 +  if (bruto === undefined || bruto === null) return '';        
      18 +  if (typeof bruto === 'string') return bruto;                 
      19 +  if (bruto instanceof NumeroJson) return bruto.texto;         
      20 +  if (typeof bruto === 'boolean') return String(bruto);        
      21 +  return JSON.stringify(bruto, (_chave, v: unknown) => (v insta
         +nceof NumeroJson ? JSON.rawJSON(v.texto) : v));                
      22 +}                                                              
  ⎿  Created tests\nucleo\rn-002-categoria.test.ts (+15 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { normalizar } from '../../src/nucleo/texto.ts';        
       3 +                                                               
       4 +describe('RN-002 — Normalização da categoria', () => {         
       5 +  it('RN-002 › "ALIMENTACAO", " Alimentação " e "alimentacao" v
         +iram alimentacao', () => {                                     
       6 +    expect(normalizar('ALIMENTACAO')).toBe('alimentacao');     
       7 +    expect(normalizar(' Alimentação ')).toBe('alimentacao');   
       8 +    expect(normalizar('alimentacao')).toBe('alimentacao');     
       9 +  });                                                          
      10 +                                                               
      11 +  it('RN-002 › "Transporte_Urbano" e "HOSPEDAGEM" viram transpo
         +rte_urbano e hospedagem', () => {                              
      12 +    expect(normalizar('Transporte_Urbano')).toBe('transporte_ur
         +bano');                                                        
      13 +    expect(normalizar('HOSPEDAGEM')).toBe('hospedagem');       
      14 +  });                                                          
      15 +});                                                            
  ⎿  Created tests\nucleo\rn-003-validacao.test.ts (+17 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { lerJson } from '../../src/io/json.ts';                
       3 +import { comoTexto } from '../../src/nucleo/texto.ts';         
       4 +                                                               
       5 +describe('RN-003 — Validação dos dados do item', () => {       
       6 +  it('RN-003 › fornecedor/descricao como texto: ausente e null 
         +→ "", 123 → "123", true → "true", [1, 2] → "[1,2]"', () => {   
       7 +    const bruto = lerJson('{"n": 123, "b": true, "l": [1, 2], "
         +o": {"a": 1.50}, "x": null, "t": " Café "}') as Record<string, 
         +unknown>;                                                      
       8 +    expect(comoTexto(undefined)).toBe('');                     
       9 +    expect(comoTexto(bruto.x)).toBe('');                       
      10 +    expect(comoTexto(bruto.n)).toBe('123');                    
      11 +    expect(comoTexto(bruto.b)).toBe('true');                   
      12 +    expect(comoTexto(false)).toBe('false');                    
      13 +    expect(comoTexto(bruto.l)).toBe('[1,2]');                  
      14 +    expect(comoTexto(bruto.o)).toBe('{"a":1.50}');             
      15 +    expect(comoTexto(bruto.t)).toBe(' Café ');                 
      16 +  });                                                          
      17 +});                                                            
  ⎿  (timeout 3m)

● Next is T-008 (validarDespesa). A DADO_INVALIDO refusal has to carry the raw
  echoes and valor_solicitado, so I'll add a RecusaDadoInvalido type to
  tipos.ts.

● Update(src\nucleo\tipos.ts)
  ⎿  Added 9 lines
       87    readonly detalhes: Readonly<Record<string, unknown>>;
       88  }
       89  
       90 +/** Recusa da RN-003: leva os ecos brutos e o valor, se numéri
          +co (AMB-023). */                                              
       91 +export interface RecusaDadoInvalido extends Recusa {          
       92 +  readonly codigo: 'DADO_INVALIDO';                           
       93 +  readonly detalhes: { readonly campo: string; readonly proble
          +ma: string };                                                 
       94 +  /** Como vieram; ausente → `null`. */                       
       95 +  readonly eco: { readonly id: unknown; readonly data: unknown
          +; readonly categoria: unknown };                              
       96 +  readonly valorSolicitado: Centavos | null;                  
       97 +}                                                             
       98 +                                                              
       99  /** Fatia de despesa elegível que consome limite de uma data (
           RN-012). */
      100  export interface Parcela {
      101    readonly indiceDespesa: number;

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      src/nucleo/despesa.ts <<'EOF'
      // Etapas 1 e 2 da seção 8: arredondamento, normalização e validação
      (RN-00…)  ⎿  Created src\nucleo\despesa.ts (+62 -0)
       1 +// Etapas 1 e 2 da seção 8: arredondamento, normalização e vali
         +dação (RN-001, RN-002, RN-003).                                
       2 +                                                               
       3 +import { ehDataValida } from './datas.ts';                     
       4 +import { paraCentavos } from './dinheiro.ts';                  
       5 +import { comoTexto, normalizar, normalizarFornecedor } from './
         +texto.ts';                                                     
       6 +import { NumeroJson } from './tipos.ts';                       
       7 +import type { Centavos, DespesaValida, RecusaDadoInvalido } fro
         +m './tipos.ts';                                                
       8 +                                                               
       9 +type Bruta = Readonly<Record<string, unknown>>;                
      10 +                                                               
      11 +function ehObjeto(v: unknown): v is Bruta {                    
      12 +  return typeof v === 'object' && v !== null && !Array.isArray(
         +v) && !(v instanceof NumeroJson);                              
      13 +}                                                              
      14 +                                                               
      15 +/** Texto não vazio; vazio, só espaços, nulo ou outro tipo cont
         +am como ausente (RN-003). */                                   
      16 +function textoPreenchido(v: unknown): v is string {            
      17 +  return typeof v === 'string' && v.trim() !== '';             
      18 +}                                                              
      19 +                                                               
      20 +/** `valor` numérico → centavos (RN-001); não numérico ou ausen
         +te → `null`. */                                                
      21 +function lerValor(v: unknown): Centavos | null {               
      22 +  if (v instanceof NumeroJson) return paraCentavos(v.texto);   
      23 +  return null;                                                 
      24 +}                                                              
      25 +                                                               
      26 +export function validarDespesa(bruta: unknown, indice: number):
         + DespesaValida | RecusaDadoInvalido {                          
      27 +  if (!ehObjeto(bruta)) {                                      
      28 +    return recusar({ id: null, data: null, categoria: null }, n
         +ull, 'despesa', 'nao_objeto');                                 
      29 +  }                                                            
      30 +  const eco = { id: bruta.id ?? null, data: bruta.data ?? null,
         + categoria: bruta.categoria ?? null };                         
      31 +  const valor = lerValor(bruta.valor);                         
      32 +  const { id, data, categoria } = bruta;                       
      33 +                                                               
      34 +  if (!textoPreenchido(id)) return recusar(eco, valor, 'id', 'a
         +usente');                                                      
      35 +  if (!textoPreenchido(data)) return recusar(eco, valor, 'data'
         +, 'ausente');                                                  
      36 +  if (!ehDataValida(data)) return recusar(eco, valor, 'data', '
         +data_invalida');                                               
      37 +  if (!textoPreenchido(categoria)) return recusar(eco, valor, '
         +categoria', 'ausente');                                        
      38 +  if (bruta.valor === undefined) return recusar(eco, valor, 'va
         +lor', 'ausente');                                              
      39 +  if (valor === null) return recusar(eco, valor, 'valor', 'nao_
         +numerico');                                                    
      40 +                                                               
     … 22 more lines (ctrl+o to expand)

● Now the T-008 tests in rn-003-validacao.test.ts.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      tests/nucleo/rn-003-validacao.test.ts <<'EOF'
      import { describe, expect, it } from 'vitest';…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      60    - **Aceite:** em `tests/nucleo/rn-002-categoria.test.ts` pass
          am `RN-002 › "ALIMENTACAO", " Alimentação " e "alimentacao" vir
          am alimentacao` e `RN-002 › "Transporte_Urbano" e "HOSPEDAGEM" 
          viram transporte_urbano e hospedagem`; em `tests/nucleo/rn-003-
          validacao.test.ts` passa `RN-003 › fornecedor/descricao como te
          xto: ausente e null → "", 123 → "123", true → "true", [1, 2] → 
          "[1,2]"`
      61    - **Commit:** `6a5e1b4`
      62  
      63 -- [ ] **T-008** — Criar `src/nucleo/despesa.ts` com `validarDes
         -pesa(bruta, indice)` → `DespesaValida | Recusa(DADO_INVALIDO)`:
         - item que não é objeto; `id`, `data`, `categoria` ausentes, nul
         -os, vazios/só espaços ou não textuais; `data` inválida (T-004);
         - `valor` ausente. A `Recusa` carrega os ecos **brutos** de `id`
         -/`data`/`categoria` (ausente → `null`) e o `valor_solicitado` a
         -rredondado quando o `valor` é um `NumeroJson` (neste passo só `
         -NumeroJson` é aceito como valor; texto vem na T-009). Aplica `n
         -ormalizar` na categoria (RN-002) sem recusar categoria desconhe
         -cida. Preenche `descricao` e `fornecedorChave` com `comoTexto` 
         -(T-007); esses dois campos nunca recusam a despesa (AMB-026)   
      63 +- [x] **T-008** — Criar `src/nucleo/despesa.ts` com `validarDes
         +pesa(bruta, indice)` → `DespesaValida | Recusa(DADO_INVALIDO)`:
         + item que não é objeto; `id`, `data`, `categoria` ausentes, nul
         +os, vazios/só espaços ou não textuais; `data` inválida (T-004);
         + `valor` ausente. A `Recusa` carrega os ecos **brutos** de `id`
         +/`data`/`categoria` (ausente → `null`) e o `valor_solicitado` a
         +rredondado quando o `valor` é um `NumeroJson` (neste passo só `
         +NumeroJson` é aceito como valor; texto vem na T-009). Aplica `n
         +ormalizar` na categoria (RN-002) sem recusar categoria desconhe
         +cida. Preenche `descricao` e `fornecedorChave` com `comoTexto` 
         +(T-007); esses dois campos nunca recusam a despesa (AMB-026)   
      64    - **Atende:** RN-003, AMB-018, AMB-023, AMB-026
      65    - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pass
          am `RN-003 › "data": "2026-07-32" → DADO_INVALIDO com data "202
          6-07-32" no eco`, `RN-003 › id, data, categoria ou valor ausent
          es → DADO_INVALIDO`, `RN-003 › id, data ou categoria nulos, vaz
          ios ou só com espaços → DADO_INVALIDO`, `RN-003 › "categoria": 
          "" e "categoria": 123 → DADO_INVALIDO, e não CATEGORIA_NAO_REEM
          BOLSAVEL`, `RN-003 › item que não é objeto (42, "x", null) → DA
          DO_INVALIDO com ecos e valor_solicitado nulos` , `RN-003 › eco 
          sai exatamente como veio (categoria 123 continua o NumeroJson "
          123")` e `RN-003 › "fornecedor": 123 e "descricao": null não re
          cusam a despesa`
      66 -  - **Commit:** `<hash preenchido depois>`                     
      66 +  - **Commit:** `9dec873`                                      
      67  
      68  - [ ] **T-009** — Aceitar `valor` como texto no formato fechado
           em `src/nucleo/despesa.ts`: sem os espaços das bordas, casa `^
          -?\d+([.,]\d+)?$`; vírgula vira ponto e segue para `paraCentavo
          s` (RN-001). Qualquer outro texto ou tipo (vazio, milhar, moeda
          , dois separadores, letras, booleano, lista, objeto, nulo) → `D
          ADO_INVALIDO` com `valor_solicitado` nulo
      69    - **Atende:** RN-003, AMB-021, AMB-023
  ⎿  Updated tests\nucleo\rn-003-validacao.test.ts (+86 -0)
       1  import { describe, expect, it } from 'vitest';
       2  import { lerJson } from '../../src/io/json.ts';
       3 +import { validarDespesa } from '../../src/nucleo/despesa.ts';  
       4  import { comoTexto } from '../../src/nucleo/texto.ts';
       5 +import { NumeroJson } from '../../src/nucleo/tipos.ts';        
       6 +import type { DespesaValida, RecusaDadoInvalido } from '../../s
         +rc/nucleo/tipos.ts';                                           
       7 +                                                               
       8 +/** Despesa válida com os campos trocados por `trocas` (texto J
         +SON de cada valor; `undefined` remove o campo). */             
       9 +function despesa(trocas: Record<string, string | undefined> = {
         +}): unknown {                                                  
      10 +  const campos: Record<string, string | undefined> = {         
      11 +    id: '"d-001"',                                             
      12 +    data: '"2026-07-03"',                                      
      13 +    categoria: '"alimentacao"',                                
      14 +    descricao: '"Almoco"',                                     
      15 +    fornecedor: '"Tavola"',                                    
      16 +    valor: '45.00',                                            
      17 +    tem_nota_fiscal: 'true',                                   
      18 +    ...trocas,                                                 
      19 +  };                                                           
      20 +  const pares = Object.entries(campos)                         
      21 +    .filter(([, v]) => v !== undefined)                        
      22 +    .map(([k, v]) => `"${k}": ${v}`);                          
      23 +  return lerJson(`{${pares.join(', ')}}`);                     
      24 +}                                                              
      25 +                                                               
      26 +function validar(bruta: unknown): DespesaValida | RecusaDadoInv
         +alido {                                                        
      27 +  return validarDespesa(bruta, 0);                             
      28 +}                                                              
      29 +                                                               
      30 +function recusada(r: DespesaValida | RecusaDadoInvalido): Recus
         +aDadoInvalido {                                                
      31 +  expect('codigo' in r && r.codigo).toBe('DADO_INVALIDO');     
      32 +  return r as RecusaDadoInvalido;                              
      33 +}                                                              
      34 +                                                               
      35 +function valida(r: DespesaValida | RecusaDadoInvalido): Despesa
         +Valida {                                                       
      36 +  expect('codigo' in r).toBe(false);                           
      37 +  return r as DespesaValida;                                   
      38 +}                                                              
      39  
      40  describe('RN-003 — Validação dos dados do item', () => {
     … 56 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-009: accept valor given as text in the closed format.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && node -e "
      const fs=require('fs');const p='src/nucleo/despesa.ts';let
      s=fs.readFileSync(p,'utf8');…)
  ⎿  Updated src\nucleo\despesa.ts (+8 -1)
      17    return typeof v === 'string' && v.trim() !== '';
      18  }
      19  
      20 -/** `valor` numérico → centavos (RN-001); não numérico ou ausen
         -te → `null`. */                                                
      20 +/** Formato fechado de `valor` em texto (RN-003, AMB-021). */  
      21 +const VALOR_TEXTO = /^-?d+([.,]d+)?$/;                         
      22 +                                                               
      23 +/** `valor` numérico → centavos (RN-001); não numérico ou ausen
         +te → `null` (AMB-023). */                                      
      24  function lerValor(v: unknown): Centavos | null {
      25    if (v instanceof NumeroJson) return paraCentavos(v.texto);
      26 +  if (typeof v === 'string') {                                 
      27 +    const texto = v.trim();                                    
      28 +    return VALOR_TEXTO.test(texto) ? paraCentavos(texto.replace
         +(',', '.')) : null;                                            
      29 +  }                                                            
      30    return null;
      31  }
      32  

● Shell escaping swallowed the backslashes in the regex, so I'll fix it with
  Edit.

● Update(src\nucleo\despesa.ts)
  ⎿  Added 1 line, removed 1 line
      18  }
      19  
      20  /** Formato fechado de `valor` em texto (RN-003, AMB-021). */
      21 -const VALOR_TEXTO = /^-?d+([.,]d+)?$/;                         
      21 +const VALOR_TEXTO = /^-?\d+([.,]\d+)?$/;                       
      22  
      23  /** `valor` numérico → centavos (RN-001); não numérico ou ausen
          te → `null` (AMB-023). */
      24  function lerValor(v: unknown): Centavos | null {

● I'll add a small helper that inserts new it blocks before the closing }); of a
  test file's describe.

● Bash(S="C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-
      sdd-desafio/f8a7bb5f-129f-4039-97c7-47940cae57fe/scratchpad"; cat >
      "$S/add-its.mjs" <<…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      65    - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pass
          am `RN-003 › "data": "2026-07-32" → DADO_INVALIDO com data "202
          6-07-32" no eco`, `RN-003 › id, data, categoria ou valor ausent
          es → DADO_INVALIDO`, `RN-003 › id, data ou categoria nulos, vaz
          ios ou só com espaços → DADO_INVALIDO`, `RN-003 › "categoria": 
          "" e "categoria": 123 → DADO_INVALIDO, e não CATEGORIA_NAO_REEM
          BOLSAVEL`, `RN-003 › item que não é objeto (42, "x", null) → DA
          DO_INVALIDO com ecos e valor_solicitado nulos` , `RN-003 › eco 
          sai exatamente como veio (categoria 123 continua o NumeroJson "
          123")` e `RN-003 › "fornecedor": 123 e "descricao": null não re
          cusam a despesa`
      66    - **Commit:** `9dec873`
      67  
      68 -- [ ] **T-009** — Aceitar `valor` como texto no formato fechado
         - em `src/nucleo/despesa.ts`: sem os espaços das bordas, casa `^
         --?\d+([.,]\d+)?$`; vírgula vira ponto e segue para `paraCentavo
         -s` (RN-001). Qualquer outro texto ou tipo (vazio, milhar, moeda
         -, dois separadores, letras, booleano, lista, objeto, nulo) → `D
         -ADO_INVALIDO` com `valor_solicitado` nulo                      
      68 +- [x] **T-009** — Aceitar `valor` como texto no formato fechado
         + em `src/nucleo/despesa.ts`: sem os espaços das bordas, casa `^
         +-?\d+([.,]\d+)?$`; vírgula vira ponto e segue para `paraCentavo
         +s` (RN-001). Qualquer outro texto ou tipo (vazio, milhar, moeda
         +, dois separadores, letras, booleano, lista, objeto, nulo) → `D
         +ADO_INVALIDO` com `valor_solicitado` nulo                      
      69    - **Atende:** RN-003, AMB-021, AMB-023
      70    - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pass
          am `RN-003 › "45.00", "45,00" e 45.00 dão valor_solicitado 45,0
          0`, `RN-003 › "1.234,56" e "R$ 45,00" → DADO_INVALIDO`, `RN-003
           › "valor": "R$ 45,00" → valor_solicitado nulo`, `RN-003 › "", 
          "45.", ",5", "1,2,3", "abc", true, [], {} e null não são numéri
          cos`, `RN-003 › " -45,00 " (espaços nas bordas) é numérico` e `
          RN-003 › recusa por outro campo mantém valor_solicitado arredon
          dado quando o valor é numérico`
      71 -  - **Commit:** `<hash preenchido depois>`                     
      71 +  - **Commit:** `32b515d`                                      
      72  
      73  - [ ] **T-010** — Validar `tem_nota_fiscal` em `src/nucleo/desp
          esa.ts`: só `true`/`false` são aceitos; ausente, nulo ou texto 
          vazio/só espaços vale `false`; qualquer outro valor → `DADO_INV
          ALIDO`
      74    - **Atende:** RN-003, AMB-022, AMB-018
  ⎿  Updated tests\nucleo\rn-003-validacao.test.ts (+34 -0)
      100      const d2 = valida(validar(despesa({ fornecedor: '[true, {"
           a": 1}]', descricao: undefined })));
      101      expect(d2.fornecedorChave).toBe('[true,{"a":1}]');
      102    });
      103 +                                                              
      104 +  it('RN-003 › "45.00", "45,00" e 45.00 dão valor_solicitado 4
          +5,00', () => {                                                
      105 +    for (const valor of ['"45.00"', '"45,00"', '45.00', '45', 
          +'"45"']) {                                                    
      106 +      expect(valida(validar(despesa({ valor }))).valorSolicita
          +do, valor).toBe(4500n);                                       
      107 +    }                                                         
      108 +    expect(valida(validar(despesa({ valor: '"33,333"' }))).val
          +orSolicitado).toBe(3333n);                                    
      109 +  });                                                         
      110 +                                                              
      111 +  it('RN-003 › "1.234,56" e "R$ 45,00" → DADO_INVALIDO', () =>
          + {                                                            
      112 +    for (const valor of ['"1.234,56"', '"R$ 45,00"', '"1,234.5
          +6"']) {                                                       
      113 +      expect(recusada(validar(despesa({ valor }))).detalhes.ca
          +mpo, valor).toBe('valor');                                    
      114 +    }                                                         
      115 +  });                                                         
      116 +                                                              
      117 +  it('RN-003 › "valor": "R$ 45,00" → valor_solicitado nulo', (
          +) => {                                                        
      118 +    expect(recusada(validar(despesa({ valor: '"R$ 45,00"' })))
          +.valorSolicitado).toBeNull();                                 
      119 +  });                                                         
      120 +                                                              
      121 +  it('RN-003 › "", "45.", ",5", "1,2,3", "abc", true, [], {} e
          + null não são numéricos', () => {                             
      122 +    for (const valor of ['""', '"45."', '",5"', '"1,2,3"', '"a
          +bc"', 'true', '[]', '{}', 'null', '"   "', '"4 5"', '"+45"', '
          +"1e2"']) {                                                    
      123 +      const r = recusada(validar(despesa({ valor })));        
      124 +      expect(r.detalhes.campo, valor).toBe('valor');          
      125 +      expect(r.valorSolicitado, valor).toBeNull();            
      126 +    }                                                         
      127 +  });                                                         
      128 +                                                              
      129 +  it('RN-003 › " -45,00 " (espaços nas bordas) é numérico', ()
          + => {                                                         
      130 +    expect(valida(validar(despesa({ valor: '" -45,00 "' }))).v
          +alorSolicitado).toBe(-4500n);                                 
      131 +  });                                                         
      132 +                                                              
      133 +  it('RN-003 › recusa por outro campo mantém valor_solicitado 
          +arredondado quando o valor é numérico', () => {               
      134 +    expect(recusada(validar(despesa({ id: 'null', valor: '10.0
          +05' }))).valorSolicitado).toBe(1000n);                        
      135 +    expect(recusada(validar(despesa({ categoria: '""', valor: 
          +'"10,015"' }))).valorSolicitado).toBe(1002n);                 
      136 +  });                                                         
      137  });
  ⎿  (timeout 3m)

● T-010: validating tem_nota_fiscal.

  Ran 1 shell command (ctrl+o to expand)

● A stray cat > /tmp/x in that command is waiting on stdin. I'll stop it and
  check what ran.

● Stop Task
  ⎿  cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat > /tmp/x
     2>/dev/null; node -e "
     const fs=require('fs');const p='src/nucleo/despesa.ts';let
     s=fs.readFileSync… · stopped

  Ran 1 shell command (ctrl+o to expand)

● Nothing had run yet, so I'll redo the change with Edit and without the stray
  command.

● Update(src\nucleo\despesa.ts)
  ⎿  Added 7 lines
      30    return null;
      31  }
      32  
      33 +/** `tem_nota_fiscal`: só booleano; vazio vale `false`; o resto
         + é inválido (`null`) (RN-003, AMB-022). */                     
      34 +function lerNotaFiscal(v: unknown): boolean | null {           
      35 +  if (typeof v === 'boolean') return v;                        
      36 +  if (v === undefined || v === null || (typeof v === 'string' &
         +& v.trim() === '')) return false;                              
      37 +  return null;                                                 
      38 +}                                                              
      39 +                                                               
      40  export function validarDespesa(bruta: unknown, indice: number):
           DespesaValida | RecusaDadoInvalido {
      41    if (!ehObjeto(bruta)) {
      42      return recusar({ id: null, data: null, categoria: null }, n
          ull, 'despesa', 'nao_objeto');

● Update(src\nucleo\despesa.ts)
  ⎿  Added 2 lines
      51    if (!textoPreenchido(categoria)) return recusar(eco, valor, '
          categoria', 'ausente');
      52    if (bruta.valor === undefined) return recusar(eco, valor, 'va
          lor', 'ausente');
      53    if (valor === null) return recusar(eco, valor, 'valor', 'nao_
          numerico');
      54 +  const temNotaFiscal = lerNotaFiscal(bruta.tem_nota_fiscal);  
      55 +  if (temNotaFiscal === null) return recusar(eco, valor, 'tem_n
         +ota_fiscal', 'nao_booleano');                                  
      56  
      57    return {
      58      indice,

● Update(src\nucleo\despesa.ts)
  ⎿  Added 1 line, removed 1 line
      64      descricao: comoTexto(bruta.descricao),
      65      fornecedorChave: normalizarFornecedor(comoTexto(bruta.forne
          cedor)),
      66      valorSolicitado: valor,
      67 -    temNotaFiscal: bruta.tem_nota_fiscal === true,             
      67 +    temNotaFiscal,                                             
      68    };
      69  }
      70  

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" &&
      S="C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-s
      dd-desafio/f8a7bb5f-129f-4039-97c7-47…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      70    - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pass
          am `RN-003 › "45.00", "45,00" e 45.00 dão valor_solicitado 45,0
          0`, `RN-003 › "1.234,56" e "R$ 45,00" → DADO_INVALIDO`, `RN-003
           › "valor": "R$ 45,00" → valor_solicitado nulo`, `RN-003 › "", 
          "45.", ",5", "1,2,3", "abc", true, [], {} e null não são numéri
          cos`, `RN-003 › " -45,00 " (espaços nas bordas) é numérico` e `
          RN-003 › recusa por outro campo mantém valor_solicitado arredon
          dado quando o valor é numérico`
      71    - **Commit:** `32b515d`
      72  
      73 -- [ ] **T-010** — Validar `tem_nota_fiscal` em `src/nucleo/desp
         -esa.ts`: só `true`/`false` são aceitos; ausente, nulo ou texto 
         -vazio/só espaços vale `false`; qualquer outro valor → `DADO_INV
         -ALIDO`                                                         
      73 +- [x] **T-010** — Validar `tem_nota_fiscal` em `src/nucleo/desp
         +esa.ts`: só `true`/`false` são aceitos; ausente, nulo ou texto 
         +vazio/só espaços vale `false`; qualquer outro valor → `DADO_INV
         +ALIDO`                                                         
      74    - **Atende:** RN-003, AMB-022, AMB-018
      75    - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pass
          am `RN-003 › "tem_nota_fiscal": "sim" → DADO_INVALIDO`, `RN-003
           › "tem_nota_fiscal": null vale false`, `RN-003 › tem_nota_fisc
          al ausente, "" ou "   " vale false` e `RN-003 › tem_nota_fiscal
           "true", 1, 0, [] ou {} → DADO_INVALIDO`
      76 -  - **Commit:** `<hash preenchido depois>`                     
      76 +  - **Commit:** `90ea5f7`                                      
      77  
      78  - [ ] **T-011** — Detectar `id` repetido em `src/nucleo/despesa
          .ts`: `validarDespesa` recebe o conjunto de ids vistos (ids nor
          malizados com `normalizar`, T-007) e recusa com `DADO_INVALIDO`
           se o `id` normalizado já estiver nele; o eco do `id` sai como 
          veio. O conjunto só recebe o `id` de despesas que **passaram pe
          la validação** (resultado `DespesaValida`); uma `Recusa(DADO_IN
          VALIDO)`, por qualquer motivo, inclusive o próprio `id` repetid
          o, não reserva o `id` (AMB-025). Expor o helper `registrarId(id
          sVistos, resultado)` que só adiciona quando o resultado é `Desp
          esaValida`
      79    - **Atende:** RN-003, AMB-024, AMB-025
  ⎿  Updated tests\nucleo\rn-003-validacao.test.ts (+24 -0)
      134      expect(recusada(validar(despesa({ id: 'null', valor: '10.0
           05' }))).valorSolicitado).toBe(1000n);
      135      expect(recusada(validar(despesa({ categoria: '""', valor: 
           '"10,015"' }))).valorSolicitado).toBe(1002n);
      136    });
      137 +                                                              
      138 +  it('RN-003 › "tem_nota_fiscal": "sim" → DADO_INVALIDO', () =
          +> {                                                           
      139 +    expect(recusada(validar(despesa({ tem_nota_fiscal: '"sim"'
          + }))).detalhes.campo).toBe('tem_nota_fiscal');                
      140 +  });                                                         
      141 +                                                              
      142 +  it('RN-003 › "tem_nota_fiscal": null vale false', () => {   
      143 +    expect(valida(validar(despesa({ tem_nota_fiscal: 'null' })
          +)).temNotaFiscal).toBe(false);                                
      144 +  });                                                         
      145 +                                                              
      146 +  it('RN-003 › tem_nota_fiscal ausente, "" ou "   " vale false
          +', () => {                                                    
      147 +    for (const tem_nota_fiscal of [undefined, '""', '"   "']) 
          +{                                                             
      148 +      expect(valida(validar(despesa({ tem_nota_fiscal }))).tem
          +NotaFiscal, String(tem_nota_fiscal)).toBe(false);             
      149 +    }                                                         
      150 +    expect(valida(validar(despesa({ tem_nota_fiscal: 'true' })
          +)).temNotaFiscal).toBe(true);                                 
      151 +    expect(valida(validar(despesa({ tem_nota_fiscal: 'false' }
          +))).temNotaFiscal).toBe(false);                               
      152 +  });                                                         
      153 +                                                              
      154 +  it('RN-003 › tem_nota_fiscal "true", 1, 0, [] ou {} → DADO_I
          +NVALIDO', () => {                                             
      155 +    for (const tem_nota_fiscal of ['"true"', '1', '0', '[]', '
          +{}', '"false"']) {                                            
      156 +      const r = recusada(validar(despesa({ tem_nota_fiscal }))
          +);                                                            
      157 +      expect(r.detalhes.campo, tem_nota_fiscal).toBe('tem_nota
          +_fiscal');                                                    
      158 +      expect(r.valorSolicitado).toBe(4500n);                  
      159 +    }                                                         
      160 +  });                                                         
      161  });
  ⎿  (timeout 3m)

● T-011: detecting repeated ids and adding registrarId.

  Ran 1 shell command (ctrl+o to expand)

● Update(src\nucleo\despesa.ts)
  ⎿  Added 9 lines, removed 1 line
      37    return null;
      38  }
      39  
      40 -export function validarDespesa(bruta: unknown, indice: number):
         - DespesaValida | RecusaDadoInvalido {                          
      40 +/**                                                            
      41 + * Valida uma despesa bruta. `idsVistos` tem os ids normalizado
         +s das despesas                                                 
      42 + * anteriores que passaram por esta validação (AMB-024, AMB-025
         +).                                                             
      43 + */                                                            
      44 +export function validarDespesa(                                
      45 +  bruta: unknown,                                              
      46 +  indice: number,                                              
      47 +  idsVistos: ReadonlySet<string> = new Set(),                  
      48 +): DespesaValida | RecusaDadoInvalido {                        
      49    if (!ehObjeto(bruta)) {
      50      return recusar({ id: null, data: null, categoria: null }, n
          ull, 'despesa', 'nao_objeto');
      51    }

● Update(src\nucleo\despesa.ts)
  ⎿  Added 3 lines, removed 1 line
      61    if (valor === null) return recusar(eco, valor, 'valor', 'nao_
          numerico');
      62    const temNotaFiscal = lerNotaFiscal(bruta.tem_nota_fiscal);
      63    if (temNotaFiscal === null) return recusar(eco, valor, 'tem_n
          ota_fiscal', 'nao_booleano');
      64 +  const idNormalizado = normalizar(id);                        
      65 +  if (idsVistos.has(idNormalizado)) return recusar(eco, valor, 
         +'id', 'repetido');                                             
      66  
      67    return {
      68      indice,
      69      id,
      68 -    idNormalizado: normalizar(id),                             
      70 +    idNormalizado,                                             
      71      data,
      72      categoriaOriginal: categoria,
      73      categoria: normalizar(categoria),

● Update(src\nucleo\despesa.ts)
  ⎿  Added 5 lines
      78    };
      79  }
      80  
      81 +/** Só a despesa que passou pela validação reserva o `id` (AMB-
         +025). */                                                       
      82 +export function registrarId(idsVistos: Set<string>, resultado: 
         +DespesaValida | RecusaDadoInvalido): void {                    
      83 +  if (!('codigo' in resultado)) idsVistos.add(resultado.idNorma
         +lizado);                                                       
      84 +}                                                              
      85 +                                                               
      86  function recusar(
      87    eco: RecusaDadoInvalido['eco'],
      88    valorSolicitado: Centavos | null,

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && sed -i "s|^import {
      validarDespesa } from '../../src/nucleo/despesa.ts';|import { registrarId,
      validarDespesa }…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      75    - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pass
          am `RN-003 › "tem_nota_fiscal": "sim" → DADO_INVALIDO`, `RN-003
           › "tem_nota_fiscal": null vale false`, `RN-003 › tem_nota_fisc
          al ausente, "" ou "   " vale false` e `RN-003 › tem_nota_fiscal
           "true", 1, 0, [] ou {} → DADO_INVALIDO`
      76    - **Commit:** `90ea5f7`
      77  
      78 -- [ ] **T-011** — Detectar `id` repetido em `src/nucleo/despesa
         -.ts`: `validarDespesa` recebe o conjunto de ids vistos (ids nor
         -malizados com `normalizar`, T-007) e recusa com `DADO_INVALIDO`
         - se o `id` normalizado já estiver nele; o eco do `id` sai como 
         -veio. O conjunto só recebe o `id` de despesas que **passaram pe
         -la validação** (resultado `DespesaValida`); uma `Recusa(DADO_IN
         -VALIDO)`, por qualquer motivo, inclusive o próprio `id` repetid
         -o, não reserva o `id` (AMB-025). Expor o helper `registrarId(id
         -sVistos, resultado)` que só adiciona quando o resultado é `Desp
         -esaValida`                                                     
      78 +- [x] **T-011** — Detectar `id` repetido em `src/nucleo/despesa
         +.ts`: `validarDespesa` recebe o conjunto de ids vistos (ids nor
         +malizados com `normalizar`, T-007) e recusa com `DADO_INVALIDO`
         + se o `id` normalizado já estiver nele; o eco do `id` sai como 
         +veio. O conjunto só recebe o `id` de despesas que **passaram pe
         +la validação** (resultado `DespesaValida`); uma `Recusa(DADO_IN
         +VALIDO)`, por qualquer motivo, inclusive o próprio `id` repetid
         +o, não reserva o `id` (AMB-025). Expor o helper `registrarId(id
         +sVistos, resultado)` que só adiciona quando o resultado é `Desp
         +esaValida`                                                     
      79    - **Atende:** RN-003, AMB-024, AMB-025
      80    - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pass
          am `RN-003 › "D-001" depois de "d-001" → DADO_INVALIDO`, `RN-00
          3 › " d-001 " depois de "d-001" → DADO_INVALIDO, com id " d-001
           " no eco`, `RN-003 › a primeira ocorrência de "d-001" segue no
          rmalmente`, `RN-003 › "d-001" com data inválida, depois "d-001"
           válido → o 2º segue (correção, AMB-025)` e `RN-003 › "d-001" i
          nválido, "d-001" válido e outro "d-001" válido → 1º e 3º DADO_I
          NVALIDO, 2º segue`
      81 -  - **Commit:** `<hash preenchido depois>`                     
      81 +  - **Commit:** `2de0c2f`                                      
      82  
      83  - [ ] **T-012** — [P] Criar `src/nucleo/elegibilidade.ts` com a
           etapa 3: `valorSolicitado ≤ 0` → `Recusa(VALOR_NAO_POSITIVO)`
      84    - **Atende:** RN-004, AMB-012
  ⎿  Updated tests\nucleo\rn-003-validacao.test.ts (+47 -1)
      1  import { describe, expect, it } from 'vitest';
      2  import { lerJson } from '../../src/io/json.ts';
      3 -import { validarDespesa } from '../../src/nucleo/despesa.ts';   
      3 +import { registrarId, validarDespesa } from '../../src/nucleo/de
        +spesa.ts';                                                      
      4  import { comoTexto } from '../../src/nucleo/texto.ts';
      5  import { NumeroJson } from '../../src/nucleo/tipos.ts';
      6  import type { DespesaValida, RecusaDadoInvalido } from '../../sr
         c/nucleo/tipos.ts';
     ...
      158        expect(r.valorSolicitado).toBe(4500n);
      159      }
      160    });
      161 +                                                              
      162 +  /** Valida em sequência, registrando os ids como o motor faz
          +. */                                                          
      163 +  function emSequencia(...brutas: unknown[]): (DespesaValida |
          + RecusaDadoInvalido)[] {                                      
      164 +    const idsVistos = new Set<string>();                      
      165 +    return brutas.map((bruta, i) => {                         
      166 +      const r = validarDespesa(bruta, i, idsVistos);          
      167 +      registrarId(idsVistos, r);                              
      168 +      return r;                                               
      169 +    });                                                       
      170 +  }                                                           
      171 +                                                              
      172 +  it('RN-003 › "D-001" depois de "d-001" → DADO_INVALIDO', () 
          +=> {                                                          
      173 +    const [, segunda] = emSequencia(despesa({ id: '"d-001"' })
          +, despesa({ id: '"D-001"' }));                                
      174 +    expect(recusada(segunda!).detalhes).toEqual({ campo: 'id',
          + problema: 'repetido' });                                     
      175 +  });                                                         
      176 +                                                              
      177 +  it('RN-003 › " d-001 " depois de "d-001" → DADO_INVALIDO, co
          +m id " d-001 " no eco', () => {                               
      178 +    const [, segunda] = emSequencia(despesa({ id: '"d-001"' })
          +, despesa({ id: '" d-001 "' }));                              
      179 +    expect(recusada(segunda!).eco.id).toBe(' d-001 ');        
      180 +  });                                                         
      181 +                                                              
      182 +  it('RN-003 › a primeira ocorrência de "d-001" segue normalme
          +nte', () => {                                                 
      183 +    const [primeira] = emSequencia(despesa({ id: '"d-001"' }),
          + despesa({ id: '"d-001"' }));                                 
      184 +    expect(valida(primeira!).id).toBe('d-001');               
      185 +  });                                                         
      186 +                                                              
      187 +  it('RN-003 › "d-001" com data inválida, depois "d-001" válid
          +o → o 2º segue (correção, AMB-025)', () => {                  
      188 +    const [primeira, segunda] = emSequencia(despesa({ data: '"
          +2026-07-32"' }), despesa());                                  
      189 +    recusada(primeira!);                                      
      190 +    valida(segunda!);                                         
     … 17 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● Validation (T-008–T-011) is complete. Moving on to eligibility (T-012–T-016):
  I'll build elegibilidade.ts with one function per stage, keeping stage order
  in motor.ts per DT-002, and add a shared tests/apoio.ts helper for building
  despesas.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat > tests/apoio.ts
      <<'EOF'
      // Apoio aos testes: monta despesas brutas como sairiam do leitor de
      JSON.…)  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      80    - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pass
          am `RN-003 › "D-001" depois de "d-001" → DADO_INVALIDO`, `RN-00
          3 › " d-001 " depois de "d-001" → DADO_INVALIDO, com id " d-001
           " no eco`, `RN-003 › a primeira ocorrência de "d-001" segue no
          rmalmente`, `RN-003 › "d-001" com data inválida, depois "d-001"
           válido → o 2º segue (correção, AMB-025)` e `RN-003 › "d-001" i
          nválido, "d-001" válido e outro "d-001" válido → 1º e 3º DADO_I
          NVALIDO, 2º segue`
      81    - **Commit:** `2de0c2f`
      82  
      83 -- [ ] **T-012** — [P] Criar `src/nucleo/elegibilidade.ts` com a
         - etapa 3: `valorSolicitado ≤ 0` → `Recusa(VALOR_NAO_POSITIVO)` 
      83 +- [x] **T-012** — [P] Criar `src/nucleo/elegibilidade.ts` com a
         + etapa 3: `valorSolicitado ≤ 0` → `Recusa(VALOR_NAO_POSITIVO)` 
      84    - **Atende:** RN-004, AMB-012
      85    - **Aceite:** em `tests/nucleo/rn-004-valor-nao-positivo.test
          .ts` passam `RN-004 › d-009 (−45,00) → RECUSADO VALOR_NAO_POSIT
          IVO, reembolsável 0,00`, `RN-004 › 0,00 → VALOR_NAO_POSITIVO` e
           `RN-004 › -0.004 arredonda para 0,00 → VALOR_NAO_POSITIVO`
      86 -  - **Commit:** `<hash preenchido depois>`                     
      86 +  - **Commit:** `772e8b6`                                      
      87  
      88  - [ ] **T-013** — Etapa 4 em `src/nucleo/elegibilidade.ts`: `da
          ta` fora de `[periodo.inicio, periodo.fim]` (inclusive) → `Recu
          sa(FORA_DO_PERIODO)`; `periodo.competencia` nunca é lido
      89    - **Atende:** RN-005, AMB-009, AMB-010
  ⎿  Created src\nucleo\elegibilidade.ts (+11 -0)
       1 +// Etapas 3 a 7 da seção 8. Cada função devolve a recusa da eta
         +pa ou `null`;                                                  
       2 +// a ordem das etapas vive só no `motor.ts` (DT-002).          
       3 +                                                               
       4 +import type { DataISO, DespesaValida, Recusa } from './tipos.ts
         +';                                                             
       5 +                                                               
       6 +/** Etapa 3 (RN-004, AMB-012). */                              
       7 +export function verificarValorPositivo(d: DespesaValida): Recus
         +a | null {                                                     
       8 +  return d.valorSolicitado <= 0n                               
       9 +    ? { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valor: d.valo
         +rSolicitado } }                                                
      10 +    : null;                                                    
      11 +}                                                              
  ⎿  Created tests\apoio.ts (+28 -0)
       1 +// Apoio aos testes: monta despesas brutas como sairiam do leit
         +or de JSON.                                                    
       2 +                                                               
       3 +import { expect } from 'vitest';                               
       4 +import { lerJson } from '../src/io/json.ts';                   
       5 +import { validarDespesa } from '../src/nucleo/despesa.ts';     
       6 +import type { DespesaValida } from '../src/nucleo/tipos.ts';   
       7 +                                                               
       8 +export const DESPESA_PADRAO = {                                
       9 +  id: 'd-001',                                                 
      10 +  data: '2026-07-03',                                          
      11 +  categoria: 'alimentacao',                                    
      12 +  descricao: 'Almoco',                                         
      13 +  fornecedor: 'Tavola',                                        
      14 +  valor: 45,                                                   
      15 +  tem_nota_fiscal: true,                                       
      16 +} as const;                                                    
      17 +                                                               
      18 +/** Despesa bruta: o padrão com `campos` trocados (`undefined` 
         +remove o campo), passada pelo `lerJson`. */                    
      19 +export function bruta(campos: Record<string, unknown> = {}): un
         +known {                                                        
      20 +  return lerJson(JSON.stringify({ ...DESPESA_PADRAO, ...campos 
         +}));                                                           
      21 +}                                                              
      22 +                                                               
      23 +/** `DespesaValida` a partir do padrão com `campos` trocados. *
         +/                                                              
      24 +export function valida(campos: Record<string, unknown> = {}, in
         +dice = 0): DespesaValida {                                     
      25 +  const r = validarDespesa(bruta(campos), indice);             
      26 +  expect('codigo' in r, JSON.stringify(r, (_k, v: unknown) => (
         +typeof v === 'bigint' ? String(v) : v))).toBe(false);          
      27 +  return r as DespesaValida;                                   
      28 +}                                                              
  ⎿  Created tests\nucleo\rn-004-valor-nao-positivo.test.ts (+24 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { verificarValorPositivo } from '../../src/nucleo/elegib
         +ilidade.ts';                                                   
       3 +import { valida } from '../apoio.ts';                          
       4 +                                                               
       5 +describe('RN-004 — Valores não positivos', () => {             
       6 +  it('RN-004 › d-009 (−45,00) → RECUSADO VALOR_NAO_POSITIVO, re
         +embolsável 0,00', () => {                                      
       7 +    const d = valida({ id: 'd-009', data: '2026-07-11', categor
         +ia: 'transporte_urbano', valor: -45 });                        
       8 +    expect(verificarValorPositivo(d)?.codigo).toBe('VALOR_NAO_P
         +OSITIVO');                                                     
       9 +  });                                                          
      10 +                                                               
      11 +  it('RN-004 › 0,00 → VALOR_NAO_POSITIVO', () => {             
      12 +    expect(verificarValorPositivo(valida({ valor: 0 }))?.codigo
         +).toBe('VALOR_NAO_POSITIVO');                                  
      13 +  });                                                          
      14 +                                                               
      15 +  it('RN-004 › -0.004 arredonda para 0,00 → VALOR_NAO_POSITIVO'
         +, () => {                                                      
      16 +    const d = valida({ valor: -0.004 });                       
      17 +    expect(d.valorSolicitado).toBe(0n);                        
      18 +    expect(verificarValorPositivo(d)?.codigo).toBe('VALOR_NAO_P
         +OSITIVO');                                                     
      19 +  });                                                          
      20 +                                                               
      21 +  it('RN-004 › 0,01 é positivo', () => {                       
      22 +    expect(verificarValorPositivo(valida({ valor: 0.01 }))).toB
         +eNull();                                                       
      23 +  });                                                          
      24 +});                                                            
  ⎿  (timeout 3m)

● T-013: the period check.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >>
      src/nucleo/elegibilidade.ts <<'EOF'…)
  ⎿  Updated src\nucleo\elegibilidade.ts (+7 -0)
       9      ? { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valor: d.valo
          rSolicitado } }
      10      : null;
      11  }
      12 +                                                               
      13 +/** Etapa 4 (RN-005, AMB-009, AMB-010): `[inicio, fim]`, inclus
         +ive. */                                                        
      14 +export function verificarPeriodo(d: DespesaValida, inicio: Data
         +ISO, fim: DataISO): Recusa | null {                            
      15 +  return d.data < inicio || d.data > fim                       
      16 +    ? { codigo: 'FORA_DO_PERIODO', detalhes: { data: d.data, in
         +icio, fim } }                                                  
      17 +    : null;                                                    
      18 +}                                                              
  ⎿  Created tests\nucleo\rn-005-periodo.test.ts (+22 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { lerJson } from '../../src/io/json.ts';                
       3 +import { verificarPeriodo } from '../../src/nucleo/elegibilidad
         +e.ts';                                                         
       4 +import { validarEntrada } from '../../src/io/entrada.ts';      
       5 +import { valida } from '../apoio.ts';                          
       6 +                                                               
       7 +describe('RN-005 — Período de competência', () => {            
       8 +  it('RN-005 › d-008 (2026-04-15, período de julho) → FORA_DO_P
         +ERIODO', () => {                                               
       9 +    const r = verificarPeriodo(valida({ id: 'd-008', data: '202
         +6-04-15' }), '2026-07-01', '2026-07-31');                      
      10 +    expect(r?.codigo).toBe('FORA_DO_PERIODO');                 
      11 +  });                                                          
      12 +                                                               
      13 +  it('RN-005 › d-014 (2026-07-31 = fim) é elegível', () => {   
      14 +    expect(verificarPeriodo(valida({ id: 'd-014', data: '2026-0
         +7-31' }), '2026-07-01', '2026-07-31')).toBeNull();             
      15 +    expect(verificarPeriodo(valida({ data: '2026-08-01' }), '20
         +26-07-01', '2026-07-31')?.codigo).toBe('FORA_DO_PERIODO');     
      16 +  });                                                          
      17 +                                                               
      18 +  it('RN-005 › data = inicio é elegível', () => {              
      19 +    expect(verificarPeriodo(valida({ data: '2026-07-01' }), '20
         +26-07-01', '2026-07-31')).toBeNull();                          
      20 +    expect(verificarPeriodo(valida({ data: '2026-06-30' }), '20
         +26-07-01', '2026-07-31')?.codigo).toBe('FORA_DO_PERIODO');     
      21 +  });                                                          
      22 +});                                                            

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && sed -i "/import {
      validarEntrada }/d" tests/nucleo/rn-005-periodo.test.ts &&
      S="C:/Users/rofel/AppData/Local/Te…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      85    - **Aceite:** em `tests/nucleo/rn-004-valor-nao-positivo.test
          .ts` passam `RN-004 › d-009 (−45,00) → RECUSADO VALOR_NAO_POSIT
          IVO, reembolsável 0,00`, `RN-004 › 0,00 → VALOR_NAO_POSITIVO` e
           `RN-004 › -0.004 arredonda para 0,00 → VALOR_NAO_POSITIVO`
      86    - **Commit:** `772e8b6`
      87  
      88 -- [ ] **T-013** — Etapa 4 em `src/nucleo/elegibilidade.ts`: `da
         -ta` fora de `[periodo.inicio, periodo.fim]` (inclusive) → `Recu
         -sa(FORA_DO_PERIODO)`; `periodo.competencia` nunca é lido       
      88 +- [x] **T-013** — Etapa 4 em `src/nucleo/elegibilidade.ts`: `da
         +ta` fora de `[periodo.inicio, periodo.fim]` (inclusive) → `Recu
         +sa(FORA_DO_PERIODO)`; `periodo.competencia` nunca é lido       
      89    - **Atende:** RN-005, AMB-009, AMB-010
      90    - **Aceite:** em `tests/nucleo/rn-005-periodo.test.ts` passam
           `RN-005 › d-008 (2026-04-15, período de julho) → FORA_DO_PERIO
          DO`, `RN-005 › d-014 (2026-07-31 = fim) é elegível`, `RN-005 › 
          data = inicio é elegível` e `RN-005 › competencia divergente de
           inicio/fim é ignorada`
      91 -  - **Commit:** `<hash preenchido depois>`                     
      91 +  - **Commit:** `2da1238`                                      
      92  
      93  - [ ] **T-014** — Etapa 5 em `src/nucleo/elegibilidade.ts`: cat
          egoria normalizada que não é chave de `POLITICA.limites` → `Rec
          usa(CATEGORIA_NAO_REEMBOLSAVEL)`, sem reclassificar
      94    - **Atende:** RN-006, AMB-019
  ⎿  Updated tests\nucleo\rn-005-periodo.test.ts (+9 -1)
      1  import { describe, expect, it } from 'vitest';
      2  import { lerJson } from '../../src/io/json.ts';
      3  import { verificarPeriodo } from '../../src/nucleo/elegibilidade
         .ts';
      4 -import { validarEntrada } from '../../src/io/entrada.ts';       
      4  import { valida } from '../apoio.ts';
      5  
      6  describe('RN-005 — Período de competência', () => {
     ...
      18      expect(verificarPeriodo(valida({ data: '2026-07-01' }), '20
          26-07-01', '2026-07-31')).toBeNull();
      19      expect(verificarPeriodo(valida({ data: '2026-06-30' }), '20
          26-07-01', '2026-07-31')?.codigo).toBe('FORA_DO_PERIODO');
      20    });
      21 +                                                               
      22 +  it('RN-005 › competencia divergente de inicio/fim é ignorada'
         +, () => {                                                      
      23 +    const periodo = lerJson('{"competencia": "2026-08", "inicio
         +": "2026-07-01", "fim": "2026-07-31"}') as {                   
      24 +      inicio: string;                                          
      25 +      fim: string;                                             
      26 +    };                                                         
      27 +    expect(verificarPeriodo(valida({ data: '2026-07-15' }), per
         +iodo.inicio, periodo.fim)).toBeNull();                         
      28 +    expect(verificarPeriodo(valida({ data: '2026-08-15' }), per
         +iodo.inicio, periodo.fim)?.codigo).toBe('FORA_DO_PERIODO');    
      29 +  });                                                          
      30  });
  ⎿  (timeout 3m)

● T-014: the category check.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && sed -i "s|^import type {
      DataISO, DespesaValida, Recusa } from './tipos.ts';|import { POLITICA }
      from './politi…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      90    - **Aceite:** em `tests/nucleo/rn-005-periodo.test.ts` passam
           `RN-005 › d-008 (2026-04-15, período de julho) → FORA_DO_PERIO
          DO`, `RN-005 › d-014 (2026-07-31 = fim) é elegível`, `RN-005 › 
          data = inicio é elegível` e `RN-005 › competencia divergente de
           inicio/fim é ignorada`
      91    - **Commit:** `2da1238`
      92  
      93 -- [ ] **T-014** — Etapa 5 em `src/nucleo/elegibilidade.ts`: cat
         -egoria normalizada que não é chave de `POLITICA.limites` → `Rec
         -usa(CATEGORIA_NAO_REEMBOLSAVEL)`, sem reclassificar            
      93 +- [x] **T-014** — Etapa 5 em `src/nucleo/elegibilidade.ts`: cat
         +egoria normalizada que não é chave de `POLITICA.limites` → `Rec
         +usa(CATEGORIA_NAO_REEMBOLSAVEL)`, sem reclassificar            
      94    - **Atende:** RN-006, AMB-019
      95    - **Aceite:** em `tests/nucleo/rn-006-categorias.test.ts` pas
          sam `RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBOLS
          AVEL` e `RN-006 › alimentacao, transporte_urbano e hospedagem s
          ão reembolsáveis`
      96 -  - **Commit:** `<hash preenchido depois>`                     
      96 +  - **Commit:** `a86a420`                                      
      97  
      98  - [ ] **T-015** — Etapa 6 em `src/nucleo/elegibilidade.ts`: est
          ado com chave `(data, categoria normalizada, normalizarForneced
          or(fornecedor) — ausente/só espaços = "", valorSolicitado)` → `
          id` da primeira ocorrência; ocorrência seguinte com `id` difere
          nte → `Recusa(DUPLICATA)` com `detalhes.idAceito`. `descricao` 
          e `tem_nota_fiscal` fora da chave
      99    - **Atende:** RN-007, AMB-011, AMB-026
  ⎿  Updated src\nucleo\elegibilidade.ts (+14 -1)
      1  // Etapas 3 a 7 da seção 8. Cada função devolve a recusa da etap
         a ou `null`;
      2  // a ordem das etapas vive só no `motor.ts` (DT-002).
      3  
      4 -import type { DataISO, DespesaValida, Recusa } from './tipos.ts'
        -;                                                               
      4 +import { POLITICA } from './politica.ts';                       
      5 +import type { Categoria, DataISO, DespesaValida, Recusa } from '
        +./tipos.ts';                                                    
      6  
      7  /** Etapa 3 (RN-004, AMB-012). */
      8  export function verificarValorPositivo(d: DespesaValida): Recusa
          | null {
     ...
      17      ? { codigo: 'FORA_DO_PERIODO', detalhes: { data: d.data, in
          icio, fim } }
      18      : null;
      19  }
      20 +                                                               
      21 +/** Categoria reconhecida: chave de `POLITICA.limites` (RN-006)
         +. */                                                           
      22 +export function ehCategoria(categoria: string): categoria is Ca
         +tegoria {                                                      
      23 +  return Object.hasOwn(POLITICA.limites, categoria);           
      24 +}                                                              
      25 +                                                               
      26 +/** Etapa 5 (RN-006, AMB-019): sem reclassificar. */           
      27 +export function verificarCategoria(d: DespesaValida): Recusa | 
         +null {                                                         
      28 +  return ehCategoria(d.categoria)                              
      29 +    ? null                                                     
      30 +    : { codigo: 'CATEGORIA_NAO_REEMBOLSAVEL', detalhes: { categ
         +oria: d.categoriaOriginal } };                                 
      31 +}                                                              
  ⎿  Created tests\nucleo\rn-006-categorias.test.ts (+20 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { verificarCategoria } from '../../src/nucleo/elegibilid
         +ade.ts';                                                       
       3 +import { valida } from '../apoio.ts';                          
       4 +                                                               
       5 +describe('RN-006 — Categorias reembolsáveis', () => {          
       6 +  it('RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBOL
         +SAVEL', () => {                                                
       7 +    const r = verificarCategoria(valida({ id: 'd-005', categori
         +a: 'coworking', valor: 89 }));                                 
       8 +    expect(r?.codigo).toBe('CATEGORIA_NAO_REEMBOLSAVEL');      
       9 +    expect(r?.detalhes.categoria).toBe('coworking');           
      10 +  });                                                          
      11 +                                                               
      12 +  it('RN-006 › alimentacao, transporte_urbano e hospedagem são 
         +reembolsáveis', () => {                                        
      13 +    for (const categoria of ['alimentacao', 'transporte_urbano'
         +, 'hospedagem', ' Hospedagem ', 'ALIMENTAÇÃO']) {              
      14 +      expect(verificarCategoria(valida({ categoria })), categor
         +ia).toBeNull();                                                
      15 +    }                                                          
      16 +    for (const categoria of ['transporte', 'constructor', 'toSt
         +ring', '__proto__']) {                                         
      17 +      expect(verificarCategoria(valida({ categoria }))?.codigo,
         + categoria).toBe('CATEGORIA_NAO_REEMBOLSAVEL');                
      18 +    }                                                          
      19 +  });                                                          
      20 +});                                                            
  ⎿  (timeout 3m)

● T-015: duplicate detection.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >>
      src/nucleo/elegibilidade.ts <<'EOF'…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
       95    - **Aceite:** em `tests/nucleo/rn-006-categorias.test.ts` pa
           ssam `RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBO
           LSAVEL` e `RN-006 › alimentacao, transporte_urbano e hospedage
           m são reembolsáveis`
       96    - **Commit:** `a86a420`
       97  
       98 -- [ ] **T-015** — Etapa 6 em `src/nucleo/elegibilidade.ts`: es
          -tado com chave `(data, categoria normalizada, normalizarFornec
          -edor(fornecedor) — ausente/só espaços = "", valorSolicitado)` 
          -→ `id` da primeira ocorrência; ocorrência seguinte com `id` di
          -ferente → `Recusa(DUPLICATA)` com `detalhes.idAceito`. `descri
          -cao` e `tem_nota_fiscal` fora da chave                        
       98 +- [x] **T-015** — Etapa 6 em `src/nucleo/elegibilidade.ts`: es
          +tado com chave `(data, categoria normalizada, normalizarFornec
          +edor(fornecedor) — ausente/só espaços = "", valorSolicitado)` 
          +→ `id` da primeira ocorrência; ocorrência seguinte com `id` di
          +ferente → `Recusa(DUPLICATA)` com `detalhes.idAceito`. `descri
          +cao` e `tem_nota_fiscal` fora da chave                        
       99    - **Atende:** RN-007, AMB-011, AMB-026
      100    - **Aceite:** em `tests/nucleo/rn-007-duplicatas.test.ts` pa
           ssam `RN-007 › d-006 segue e d-007 → DUPLICATA`, `RN-007 › dua
           s alimentações de 40,00 sem fornecedor na mesma data → a 2ª DU
           PLICATA`, `RN-007 › só uma com fornecedor → as duas seguem`, `
           RN-007 › "Café" e "Cafe" são fornecedores diferentes (forneced
           or não tira acento)`, `RN-007 › descricao e tem_nota_fiscal nã
           o entram no critério`, `RN-007 › recusa DUPLICATA traz o id da
            ocorrência aceita`, `RN-007 › fornecedor 123 e "123" são o me
           smo fornecedor` e `RN-007 › fornecedor null é igual a forneced
           or ausente`
      101 -  - **Commit:** `<hash preenchido depois>`                    
      101 +  - **Commit:** `6036df0`                                     
      102  
      103  - [ ] **T-016** — Etapa 7 em `src/nucleo/elegibilidade.ts`: `v
           alorSolicitado > POLITICA.limiarNotaFiscal` (estritamente maio
           r, sobre o valor arredondado) e sem nota → `Recusa(NOTA_FISCAL
           _AUSENTE)`
      104    - **Atende:** RN-008, AMB-004, AMB-005, AMB-006
  ⎿  Updated src\nucleo\elegibilidade.ts (+16 -0)
      29      ? null
      30      : { codigo: 'CATEGORIA_NAO_REEMBOLSAVEL', detalhes: { categ
          oria: d.categoriaOriginal } };
      31  }
      32 +                                                               
      33 +/** Chave da RN-007 → `id` da primeira ocorrência. */          
      34 +export type ChavesDuplicata = Map<string, string>;             
      35 +                                                               
      36 +/**                                                            
      37 + * Etapa 6 (RN-007, AMB-011, AMB-026): mesma data, categoria no
         +rmalizada,                                                     
      38 + * fornecedor (`trim` + minúsculas; vazio é um valor) e valor. 
         +A primeira                                                     
      39 + * ocorrência é registrada em `aceitas` e segue; as seguintes s
         +ão recusadas.                                                  
      40 + */                                                            
      41 +export function verificarDuplicata(d: DespesaValida, aceitas: C
         +havesDuplicata): Recusa | null {                               
      42 +  const chave = JSON.stringify([d.data, d.categoria, d.forneced
         +orChave, d.valorSolicitado.toString()]);                       
      43 +  const idAceito = aceitas.get(chave);                         
      44 +  if (idAceito !== undefined) return { codigo: 'DUPLICATA', det
         +alhes: { idAceito } };                                         
      45 +  aceitas.set(chave, d.id);                                    
      46 +  return null;                                                 
      47 +}                                                              
  ⎿  Created tests\nucleo\rn-007-duplicatas.test.ts (+66 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { verificarDuplicata } from '../../src/nucleo/elegibilid
         +ade.ts';                                                       
       3 +import type { ChavesDuplicata } from '../../src/nucleo/elegibil
         +idade.ts';                                                     
       4 +import { valida } from '../apoio.ts';                          
       5 +                                                               
       6 +/** Códigos da etapa 6 para as despesas em sequência (`null` = 
         +segue). */                                                     
       7 +function codigos(...campos: Record<string, unknown>[]): (string
         + | null)[] {                                                   
       8 +  const aceitas: ChavesDuplicata = new Map();                  
       9 +  return campos.map((c, i) => verificarDuplicata(valida({ id: `
         +x-${i}`, ...c }, i), aceitas)?.codigo ?? null);                
      10 +}                                                              
      11 +                                                               
      12 +describe('RN-007 — Duplicatas', () => {                        
      13 +  it('RN-007 › d-006 segue e d-007 → DUPLICATA', () => {       
      14 +    const d006 = { id: 'd-006', data: '2026-07-09', fornecedor:
         + 'Bistro Central', valor: 54.9, descricao: 'Almoco' };         
      15 +    expect(codigos(d006, { ...d006, id: 'd-007' })).toEqual([nu
         +ll, 'DUPLICATA']);                                             
      16 +  });                                                          
      17 +                                                               
      18 +  it('RN-007 › duas alimentações de 40,00 sem fornecedor na mes
         +ma data → a 2ª DUPLICATA', () => {                             
      19 +    expect(codigos({ fornecedor: undefined, valor: 40 }, { forn
         +ecedor: undefined, valor: 40 })).toEqual([null, 'DUPLICATA']); 
      20 +  });                                                          
      21 +                                                               
      22 +  it('RN-007 › só uma com fornecedor → as duas seguem', () => {
      23 +    expect(codigos({ fornecedor: 'Tavola', valor: 40 }, { forne
         +cedor: undefined, valor: 40 })).toEqual([null, null]);         
      24 +    expect(codigos({ fornecedor: undefined, valor: 40 }, { forn
         +ecedor: 'Tavola', valor: 40 })).toEqual([null, null]);         
      25 +  });                                                          
      26 +                                                               
      27 +  it('RN-007 › "Café" e "Cafe" são fornecedores diferentes (for
         +necedor não tira acento)', () => {                             
      28 +    expect(codigos({ fornecedor: 'Café' }, { fornecedor: 'Cafe'
         + })).toEqual([null, null]);                                    
      29 +    expect(codigos({ fornecedor: 'Café' }, { fornecedor: ' CAFÉ
         + ' })).toEqual([null, 'DUPLICATA']);                           
      30 +  });                                                          
      31 +                                                               
      32 +  it('RN-007 › descricao e tem_nota_fiscal não entram no critér
         +io', () => {                                                   
      33 +    expect(                                                    
      34 +      codigos({ descricao: 'Almoco', tem_nota_fiscal: true }, {
         + descricao: 'Jantar', tem_nota_fiscal: false }),               
      35 +    ).toEqual([null, 'DUPLICATA']);                            
      36 +  });                                                          
      37 +                                                               
      38 +  it('RN-007 › recusa DUPLICATA traz o id da ocorrência aceita'
         +, () => {                                                      
      39 +    const aceitas: ChavesDuplicata = new Map();                
      40 +    verificarDuplicata(valida({ id: 'd-006' }), aceitas);      
     … 26 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-016: the invoice (nota fiscal) check.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >>
      src/nucleo/elegibilidade.ts <<'EOF'…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      100    - **Aceite:** em `tests/nucleo/rn-007-duplicatas.test.ts` pa
           ssam `RN-007 › d-006 segue e d-007 → DUPLICATA`, `RN-007 › dua
           s alimentações de 40,00 sem fornecedor na mesma data → a 2ª DU
           PLICATA`, `RN-007 › só uma com fornecedor → as duas seguem`, `
           RN-007 › "Café" e "Cafe" são fornecedores diferentes (forneced
           or não tira acento)`, `RN-007 › descricao e tem_nota_fiscal nã
           o entram no critério`, `RN-007 › recusa DUPLICATA traz o id da
            ocorrência aceita`, `RN-007 › fornecedor 123 e "123" são o me
           smo fornecedor` e `RN-007 › fornecedor null é igual a forneced
           or ausente`
      101    - **Commit:** `6036df0`
      102  
      103 -- [ ] **T-016** — Etapa 7 em `src/nucleo/elegibilidade.ts`: `v
          -alorSolicitado > POLITICA.limiarNotaFiscal` (estritamente maio
          -r, sobre o valor arredondado) e sem nota → `Recusa(NOTA_FISCAL
          -_AUSENTE)`                                                    
      103 +- [x] **T-016** — Etapa 7 em `src/nucleo/elegibilidade.ts`: `v
          +alorSolicitado > POLITICA.limiarNotaFiscal` (estritamente maio
          +r, sobre o valor arredondado) e sem nota → `Recusa(NOTA_FISCAL
          +_AUSENTE)`                                                    
      104    - **Atende:** RN-008, AMB-004, AMB-005, AMB-006
      105    - **Aceite:** em `tests/nucleo/rn-008-nota-fiscal.test.ts` p
           assam `RN-008 › d-003 (100,00, sem NF) não é recusada por nota
            fiscal`, `RN-008 › d-004 (100,01, sem NF) → NOTA_FISCAL_AUSEN
           TE`, `RN-008 › d-013 (690,00, sem NF) → NOTA_FISCAL_AUSENTE` e
            `RN-008 › 100.004 arredonda para 100,00 e não exige nota fisc
           al`
      106 -  - **Commit:** `<hash preenchido depois>`                    
      106 +  - **Commit:** `cb1783a`                                     
      107  
      108  - [ ] **T-017** — Criar `src/nucleo/motor.ts` com a **passada 
           1** (DT-002): percorre `entrada.despesas` na ordem, aplica eta
           pas 1–2 (`despesa.ts`, registrando o `id` nos ids vistos com `
           registrarId` logo após a etapa 2) e 3–7 (`elegibilidade.ts`) n
           a ordem da seção 8, com a primeira recusa encerrando a avaliaç
           ão; a duplicata só compara despesas que passaram das etapas 1–
           5. Por enquanto as elegíveis saem sem alocação de limite
      109    - **Atende:** RN-003, RN-004, RN-007, RN-008, AMB-025 (seção
            8)
  ⎿  Updated src\nucleo\elegibilidade.ts (+7 -0)
      45    aceitas.set(chave, d.id);
      46    return null;
      47  }
      48 +                                                               
      49 +/** Etapa 7 (RN-008, AMB-004, AMB-005, AMB-006): estritamente a
         +cima do limiar, sem nota. */                                   
      50 +export function verificarNotaFiscal(d: DespesaValida): Recusa |
         + null {                                                        
      51 +  return d.valorSolicitado > POLITICA.limiarNotaFiscal && !d.te
         +mNotaFiscal                                                    
      52 +    ? { codigo: 'NOTA_FISCAL_AUSENTE', detalhes: { valor: d.val
         +orSolicitado, limiar: POLITICA.limiarNotaFiscal } }            
      53 +    : null;                                                    
      54 +}                                                              
  ⎿  Created tests\nucleo\rn-008-nota-fiscal.test.ts (+27 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { verificarNotaFiscal } from '../../src/nucleo/elegibili
         +dade.ts';                                                      
       3 +import { valida } from '../apoio.ts';                          
       4 +                                                               
       5 +const semNf = { categoria: 'transporte_urbano', tem_nota_fiscal
         +: false };                                                     
       6 +                                                               
       7 +describe('RN-008 — Nota fiscal obrigatória', () => {           
       8 +  it('RN-008 › d-003 (100,00, sem NF) não é recusada por nota f
         +iscal', () => {                                                
       9 +    expect(verificarNotaFiscal(valida({ ...semNf, id: 'd-003', 
         +valor: 100 }))).toBeNull();                                    
      10 +  });                                                          
      11 +                                                               
      12 +  it('RN-008 › d-004 (100,01, sem NF) → NOTA_FISCAL_AUSENTE', (
         +) => {                                                         
      13 +    expect(verificarNotaFiscal(valida({ ...semNf, id: 'd-004', 
         +valor: 100.01 }))?.codigo).toBe('NOTA_FISCAL_AUSENTE');        
      14 +    expect(verificarNotaFiscal(valida({ ...semNf, valor: 100.01
         +, tem_nota_fiscal: true }))).toBeNull();                       
      15 +  });                                                          
      16 +                                                               
      17 +  it('RN-008 › d-013 (690,00, sem NF) → NOTA_FISCAL_AUSENTE', (
         +) => {                                                         
      18 +    const d = valida({ id: 'd-013', categoria: 'hospedagem', va
         +lor: 690, tem_nota_fiscal: false });                           
      19 +    expect(verificarNotaFiscal(d)?.codigo).toBe('NOTA_FISCAL_AU
         +SENTE');                                                       
      20 +  });                                                          
      21 +                                                               
      22 +  it('RN-008 › 100.004 arredonda para 100,00 e não exige nota f
         +iscal', () => {                                                
      23 +    const d = valida({ ...semNf, valor: 100.004 });            
      24 +    expect(d.valorSolicitado).toBe(10000n);                    
      25 +    expect(verificarNotaFiscal(d)).toBeNull();                 
      26 +  });                                                          
      27 +});                                                            
  ⎿  (timeout 3m)

● The eligibility stage (T-012 to T-016) is done. Next is T-017, pass 1 of the
  motor. It returns one evaluation per despesa, and the order of stages 3 to 7
  is a single ?? chain in motor.ts.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      src/nucleo/motor.ts <<'EOF'
      // Ordem da seção 8 da spec, num lugar só (DT-002).…)
  ⎿  Created src\nucleo\motor.ts (+40 -0)
       1 +// Ordem da seção 8 da spec, num lugar só (DT-002).            
       2 +                                                               
       3 +import { registrarId, validarDespesa } from './despesa.ts';    
       4 +import {                                                       
       5 +  verificarCategoria,                                          
       6 +  verificarDuplicata,                                          
       7 +  verificarNotaFiscal,                                         
       8 +  verificarPeriodo,                                            
       9 +  verificarValorPositivo,                                      
      10 +} from './elegibilidade.ts';                                   
      11 +import type { ChavesDuplicata } from './elegibilidade.ts';     
      12 +import type { Categoria, DespesaElegivel, DespesaValida, Entrad
         +a, Recusa, RecusaDadoInvalido } from './tipos.ts';             
      13 +                                                               
      14 +/** Resultado da passada 1 para uma despesa. */                
      15 +export type Avaliacao =                                        
      16 +  | { readonly tipo: 'invalida'; readonly recusa: RecusaDadoInv
         +alido }                                                        
      17 +  | { readonly tipo: 'recusada'; readonly despesa: DespesaValid
         +a; readonly recusa: Recusa }                                   
      18 +  | { readonly tipo: 'elegivel'; readonly despesa: DespesaElegi
         +vel };                                                         
      19 +                                                               
      20 +/** Passada 1: etapas 1 a 7, na ordem da entrada; a primeira re
         +cusa encerra a avaliação. */                                   
      21 +export function passada1(entrada: Entrada): Avaliacao[] {      
      22 +  const idsVistos = new Set<string>();                         
      23 +  const aceitas: ChavesDuplicata = new Map();                  
      24 +  return entrada.despesas.map((bruta, indice): Avaliacao => {  
      25 +    const validada = validarDespesa(bruta, indice, idsVistos); 
         +// etapas 1 e 2                                                
      26 +    registrarId(idsVistos, validada);                          
      27 +    if ('codigo' in validada) return { tipo: 'invalida', recusa
         +: validada };                                                  
      28 +                                                               
      29 +    const recusa =                                             
      30 +      verificarValorPositivo(validada) ?? // etapa 3           
      31 +      verificarPeriodo(validada, entrada.inicio, entrada.fim) ?
         +? // etapa 4                                                   
      32 +      verificarCategoria(validada) ?? // etapa 5               
      33 +      verificarDuplicata(validada, aceitas) ?? // etapa 6      
      34 +      verificarNotaFiscal(validada); // etapa 7                
      35 +    if (recusa) return { tipo: 'recusada', despesa: validada, r
         +ecusa };                                                       
      36 +                                                               
      37 +    // A etapa 5 garante que a categoria é reconhecida.        
      38 +    return { tipo: 'elegivel', despesa: { ...validada, categori
         +a: validada.categoria as Categoria } };                        
      39 +  });                                                          
      40 +}                                                              
  ⎿  Updated tests\apoio.ts (+17 -1)
      3  import { expect } from 'vitest';
      4  import { lerJson } from '../src/io/json.ts';
      5  import { validarDespesa } from '../src/nucleo/despesa.ts';
      6 -import type { DespesaValida } from '../src/nucleo/tipos.ts';    
      6 +import type { DespesaValida, Entrada } from '../src/nucleo/tipos
        +.ts';                                                           
      7  
      8  export const DESPESA_PADRAO = {
      9    id: 'd-001',
     ...
      26    expect('codigo' in r, JSON.stringify(r, (_k, v: unknown) => (
          typeof v === 'bigint' ? String(v) : v))).toBe(false);
      27    return r as DespesaValida;
      28  }
      29 +                                                               
      30 +export const PERIODO_PADRAO = { inicio: '2026-07-01', fim: '202
         +6-07-31' } as const;                                           
      31 +                                                               
      32 +/**                                                            
      33 + * `Entrada` com as despesas do padrão com `campos` trocados; s
         +em `id`                                                        
      34 + * explícito, cada uma recebe `e-1`, `e-2`...                  
      35 + */                                                            
      36 +export function entrada(despesas: Record<string, unknown>[], pe
         +riodo: { inicio: string; fim: string } = PERIODO_PADRAO): Entra
         +da {                                                           
      37 +  return {                                                     
      38 +    colaborador: { id: 'c-0001' },                             
      39 +    periodo,                                                   
      40 +    inicio: periodo.inicio,                                    
      41 +    fim: periodo.fim,                                          
      42 +    despesas: despesas.map((campos, i) => bruta({ id: `e-${i + 
         +1}`, ...campos })),                                            
      43 +  };                                                           
      44 +}                                                              

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >> tests/apoio.ts
      <<'EOF'…)
  ⎿  Updated tests\apoio.ts (+6 -0)
      3  import { expect } from 'vitest';
      4  import { lerJson } from '../src/io/json.ts';
      5  import { validarDespesa } from '../src/nucleo/despesa.ts';
      6 +import { passada1 } from '../src/nucleo/motor.ts';              
      7  import type { DespesaValida, Entrada } from '../src/nucleo/tipos
         .ts';
      8  
      9  export const DESPESA_PADRAO = {
     ...
      43      despesas: despesas.map((campos, i) => bruta({ id: `e-${i + 
          1}`, ...campos })),
      44    };
      45  }
      46 +                                                               
      47 +/** Código de recusa de cada despesa na passada 1 do motor (`nu
         +ll` = elegível). */                                            
      48 +export function codigosPassada1(e: Entrada): (string | null)[] 
         +{                                                              
      49 +  return passada1(e).map((a) => (a.tipo === 'elegivel' ? null :
         + a.recusa.codigo));                                            
      50 +}                                                              
  ⎿  Updated tests\nucleo\rn-003-validacao.test.ts (+14 -0)
      3  import { registrarId, validarDespesa } from '../../src/nucleo/de
         spesa.ts';
      4  import { comoTexto } from '../../src/nucleo/texto.ts';
      5  import { NumeroJson } from '../../src/nucleo/tipos.ts';
      6 +import { codigosPassada1, entrada } from '../apoio.ts';         
      7  import type { DespesaValida, RecusaDadoInvalido } from '../../sr
         c/nucleo/tipos.ts';
      8  
      9  /** Despesa válida com os campos trocados por `trocas` (texto JS
         ON de cada valor; `undefined` remove o campo). */
     ...
      205      registrarId(idsVistos, repetida);
      206      expect([...idsVistos]).toEqual(['d-001']);
      207    });
      208 +                                                              
      209 +  it('RN-003 › despesa inválida não impede o processamento das
          + outras', () => {                                             
      210 +    const e = entrada([{}, { data: '2026-07-32' }, 42 as unkno
          +wn as Record<string, unknown>, { categoria: 'coworking' }, {}]
          +);                                                            
      211 +    expect(codigosPassada1(e)).toEqual([null, 'DADO_INVALIDO',
          + 'DADO_INVALIDO', 'CATEGORIA_NAO_REEMBOLSAVEL', 'DUPLICATA']);
      212 +  });                                                         
      213 +                                                              
      214 +  it('RN-003 › id de despesa recusada por FORA_DO_PERIODO cont
          +inua reservado (AMB-025)', () => {                            
      215 +    const e = entrada([                                       
      216 +      { id: 'd-001', data: '2026-06-30' },                    
      217 +      { id: 'd-001', data: '2026-07-03' },                    
      218 +    ]);                                                       
      219 +    expect(codigosPassada1(e)).toEqual(['FORA_DO_PERIODO', 'DA
          +DO_INVALIDO']);                                               
      220 +  });                                                         
      221  });

● entrada() would spread 42 into a normal default despesa. I'll add a cru()
  marker so tests can pass raw items straight through.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && node - <<'EOF'
      const fs = require('fs');…)
  ⎿  Updated tests\apoio.ts (+19 -2)
      30  
      31  export const PERIODO_PADRAO = { inicio: '2026-07-01', fim: '202
          6-07-31' } as const;
      32  
      33 +/** Item de `despesas` que vai para a entrada sem ser completad
         +o pelo padrão. */                                              
      34 +export class Cru {                                             
      35 +  readonly texto: string;                                      
      36 +                                                               
      37 +  constructor(texto: string) {                                 
      38 +    this.texto = texto;                                        
      39 +  }                                                            
      40 +}                                                              
      41 +                                                               
      42 +/** Item cru, escrito como texto JSON (ex.: `cru('42')`). */   
      43 +export function cru(texto: string): Cru {                      
      44 +  return new Cru(texto);                                       
      45 +}                                                              
      46 +                                                               
      47  /**
      48   * `Entrada` com as despesas do padrão com `campos` trocados; s
          em `id`
      49   * explícito, cada uma recebe `e-1`, `e-2`...
      50   */
      37 -export function entrada(despesas: Record<string, unknown>[], pe
         -riodo: { inicio: string; fim: string } = PERIODO_PADRAO): Entra
         -da {                                                           
      51 +export function entrada(                                       
      52 +  despesas: (Record<string, unknown> | Cru)[],                 
      53 +  periodo: { inicio: string; fim: string } = PERIODO_PADRAO,   
      54 +): Entrada {                                                   
      55    return {
      56      colaborador: { id: 'c-0001' },
      57      periodo,
      58      inicio: periodo.inicio,
      59      fim: periodo.fim,
      43 -    despesas: despesas.map((campos, i) => bruta({ id: `e-${i + 
         -1}`, ...campos })),                                            
      60 +    despesas: despesas.map((campos, i) => (campos instanceof Cr
         +u ? lerJson(campos.texto) : bruta({ id: `e-${i + 1}`, ...campos
         + }))),                                                         
      61    };
      62  }
      63  
  ⎿  Updated tests\nucleo\rn-003-validacao.test.ts (+2 -2)
      3  import { registrarId, validarDespesa } from '../../src/nucleo/de
         spesa.ts';
      4  import { comoTexto } from '../../src/nucleo/texto.ts';
      5  import { NumeroJson } from '../../src/nucleo/tipos.ts';
      6 -import { codigosPassada1, entrada } from '../apoio.ts';         
      6 +import { codigosPassada1, cru, entrada } from '../apoio.ts';    
      7  import type { DespesaValida, RecusaDadoInvalido } from '../../sr
         c/nucleo/tipos.ts';
      8  
      9  /** Despesa válida com os campos trocados por `trocas` (texto JS
         ON de cada valor; `undefined` remove o campo). */
     ...
      207    });
      208  
      209    it('RN-003 › despesa inválida não impede o processamento das
            outras', () => {
      210 -    const e = entrada([{}, { data: '2026-07-32' }, 42 as unkno
          -wn as Record<string, unknown>, { categoria: 'coworking' }, {}]
          -);                                                            
      210 +    const e = entrada([{}, { data: '2026-07-32' }, cru('42'), 
          +{ categoria: 'coworking' }, {}]);                             
      211      expect(codigosPassada1(e)).toEqual([null, 'DADO_INVALIDO',
            'DADO_INVALIDO', 'CATEGORIA_NAO_REEMBOLSAVEL', 'DUPLICATA']);
      212    });
      213  
  ⎿  (timeout 2m)

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" &&
      S="C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-s
      dd-desafio/f8a7bb5f-129f-4039-97c7-47…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      105    - **Aceite:** em `tests/nucleo/rn-008-nota-fiscal.test.ts` p
           assam `RN-008 › d-003 (100,00, sem NF) não é recusada por nota
            fiscal`, `RN-008 › d-004 (100,01, sem NF) → NOTA_FISCAL_AUSEN
           TE`, `RN-008 › d-013 (690,00, sem NF) → NOTA_FISCAL_AUSENTE` e
            `RN-008 › 100.004 arredonda para 100,00 e não exige nota fisc
           al`
      106    - **Commit:** `cb1783a`
      107  
      108 -- [ ] **T-017** — Criar `src/nucleo/motor.ts` com a **passada 
          -1** (DT-002): percorre `entrada.despesas` na ordem, aplica eta
          -pas 1–2 (`despesa.ts`, registrando o `id` nos ids vistos com `
          -registrarId` logo após a etapa 2) e 3–7 (`elegibilidade.ts`) n
          -a ordem da seção 8, com a primeira recusa encerrando a avaliaç
          -ão; a duplicata só compara despesas que passaram das etapas 1–
          -5. Por enquanto as elegíveis saem sem alocação de limite      
      108 +- [x] **T-017** — Criar `src/nucleo/motor.ts` com a **passada 
          +1** (DT-002): percorre `entrada.despesas` na ordem, aplica eta
          +pas 1–2 (`despesa.ts`, registrando o `id` nos ids vistos com `
          +registrarId` logo após a etapa 2) e 3–7 (`elegibilidade.ts`) n
          +a ordem da seção 8, com a primeira recusa encerrando a avaliaç
          +ão; a duplicata só compara despesas que passaram das etapas 1–
          +5. Por enquanto as elegíveis saem sem alocação de limite      
      109    - **Atende:** RN-003, RN-004, RN-007, RN-008, AMB-025 (seção
            8)
      110    - **Aceite:** chamando o motor em memória, passam em `tests/
           nucleo/rn-003-validacao.test.ts` `RN-003 › despesa inválida nã
           o impede o processamento das outras` e `RN-003 › id de despesa
            recusada por FORA_DO_PERIODO continua reservado (AMB-025)`; e
           m `tests/nucleo/rn-007-duplicatas.test.ts` `RN-007 › cópia for
           a do período não gera duplicata (só compara quem passou das et
           apas 1 a 5)` e `RN-007 › duplicata vem antes da nota fiscal (2
           ª cópia sem NF sai DUPLICATA)`; em `tests/nucleo/rn-004-valor-
           nao-positivo.test.ts` `RN-004 › estorno fora do período sai VA
           LOR_NAO_POSITIVO (etapa 3 antes da 4)`
      111 -  - **Commit:** `<hash preenchido depois>`                    
      111 +  - **Commit:** `07f9724`                                     
      112  
      113  - [ ] **T-018** — [P] Criar `src/nucleo/diarias.ts` com `extra
           irDiarias(descricao)` (R-07): recebe a `descricao` já em texto
            (`comoTexto`, T-007) e, na descrição normalizada, busca a pri
           meira ocorrência de `(?<!\d[.,]?)(\d+)(?![.,]\d)\s*(diarias?|n
           oites?)(?![a-z])`; sem ocorrência, descrição vazia (ausente ou
            nula) ou N = 0 → 1 (uma única diária)
      114    - **Atende:** RN-012, AMB-008, AMB-026
  ⎿  Updated tests\nucleo\rn-004-valor-nao-positivo.test.ts (+6 -1)
      1  import { describe, expect, it } from 'vitest';
      2  import { verificarValorPositivo } from '../../src/nucleo/elegibi
         lidade.ts';
      3 -import { valida } from '../apoio.ts';                           
      3 +import { codigosPassada1, entrada, valida } from '../apoio.ts'; 
      4  
      5  describe('RN-004 — Valores não positivos', () => {
      6    it('RN-004 › d-009 (−45,00) → RECUSADO VALOR_NAO_POSITIVO, ree
         mbolsável 0,00', () => {
     ...
      21    it('RN-004 › 0,01 é positivo', () => {
      22      expect(verificarValorPositivo(valida({ valor: 0.01 }))).toB
          eNull();
      23    });
      24 +                                                               
      25 +  it('RN-004 › estorno fora do período sai VALOR_NAO_POSITIVO (
         +etapa 3 antes da 4)', () => {                                  
      26 +    expect(codigosPassada1(entrada([{ data: '2026-04-15', valor
         +: -45 }]))).toEqual(['VALOR_NAO_POSITIVO']);                   
      27 +    expect(codigosPassada1(entrada([{ categoria: 'coworking', v
         +alor: 0 }]))).toEqual(['VALOR_NAO_POSITIVO']);                 
      28 +  });                                                          
      29  });
  ⎿  Updated tests\nucleo\rn-007-duplicatas.test.ts (+27 -1)
      1  import { describe, expect, it } from 'vitest';
      2  import { verificarDuplicata } from '../../src/nucleo/elegibilida
         de.ts';
      3  import type { ChavesDuplicata } from '../../src/nucleo/elegibili
         dade.ts';
      4 -import { valida } from '../apoio.ts';                           
      4 +import { codigosPassada1, entrada, valida } from '../apoio.ts'; 
      5  
      6  /** Códigos da etapa 6 para as despesas em sequência (`null` = s
         egue). */
      7  function codigos(...campos: Record<string, unknown>[]): (string 
         | null)[] {
     ...
      63      ]);
      64      expect(codigos({ categoria: 'alimentacao' }, { categoria: '
          ALIMENTAÇÃO', valor: '45,00' })).toEqual([null, 'DUPLICATA']);
      65    });
      66 +                                                               
      67 +  it('RN-007 › cópia fora do período não gera duplicata (só com
         +para quem passou das etapas 1 a 5)', () => {                   
      68 +    const copia = { data: '2026-08-01', fornecedor: 'Tavola', v
         +alor: 40 };                                                    
      69 +    expect(codigosPassada1(entrada([copia, copia, { ...copia, d
         +ata: '2026-07-31' }]))).toEqual([                              
      70 +      'FORA_DO_PERIODO',                                       
      71 +      'FORA_DO_PERIODO',                                       
      72 +      null,                                                    
      73 +    ]);                                                        
      74 +    const coworking = { categoria: 'coworking', valor: 40 };   
      75 +    expect(codigosPassada1(entrada([coworking, coworking]))).to
         +Equal([                                                        
      76 +      'CATEGORIA_NAO_REEMBOLSAVEL',                            
      77 +      'CATEGORIA_NAO_REEMBOLSAVEL',                            
      78 +    ]);                                                        
      79 +  });                                                          
      80 +                                                               
      81 +  it('RN-007 › duplicata vem antes da nota fiscal (2ª cópia sem
         + NF sai DUPLICATA)', () => {                                   
      82 +    const gasto = { categoria: 'transporte_urbano', valor: 150 
         +};                                                             
      83 +    expect(codigosPassada1(entrada([{ ...gasto, tem_nota_fiscal
         +: true }, { ...gasto, tem_nota_fiscal: false }]))).toEqual([   
      84 +      null,                                                    
      85 +      'DUPLICATA',                                             
      86 +    ]);                                                        
      87 +    expect(codigosPassada1(entrada([{ ...gasto, tem_nota_fiscal
         +: false }, { ...gasto, tem_nota_fiscal: false }]))).toEqual([  
      88 +      'NOTA_FISCAL_AUSENTE',                                   
      89 +      'DUPLICATA',                                             
      90 +    ]);                                                        
      91 +  });                                                          
      92  });
  ⎿  (timeout 3m)

● Pass 1 is done. T-018 next: extracting the number of nights (diarias).

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      src/nucleo/diarias.ts <<'EOF'
      // Diárias de hospedagem (RN-012, AMB-008).…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      110    - **Aceite:** chamando o motor em memória, passam em `tests/
           nucleo/rn-003-validacao.test.ts` `RN-003 › despesa inválida nã
           o impede o processamento das outras` e `RN-003 › id de despesa
            recusada por FORA_DO_PERIODO continua reservado (AMB-025)`; e
           m `tests/nucleo/rn-007-duplicatas.test.ts` `RN-007 › cópia for
           a do período não gera duplicata (só compara quem passou das et
           apas 1 a 5)` e `RN-007 › duplicata vem antes da nota fiscal (2
           ª cópia sem NF sai DUPLICATA)`; em `tests/nucleo/rn-004-valor-
           nao-positivo.test.ts` `RN-004 › estorno fora do período sai VA
           LOR_NAO_POSITIVO (etapa 3 antes da 4)`
      111    - **Commit:** `07f9724`
      112  
      113 -- [ ] **T-018** — [P] Criar `src/nucleo/diarias.ts` com `extra
          -irDiarias(descricao)` (R-07): recebe a `descricao` já em texto
          - (`comoTexto`, T-007) e, na descrição normalizada, busca a pri
          -meira ocorrência de `(?<!\d[.,]?)(\d+)(?![.,]\d)\s*(diarias?|n
          -oites?)(?![a-z])`; sem ocorrência, descrição vazia (ausente ou
          - nula) ou N = 0 → 1 (uma única diária)                        
      113 +- [x] **T-018** — [P] Criar `src/nucleo/diarias.ts` com `extra
          +irDiarias(descricao)` (R-07): recebe a `descricao` já em texto
          + (`comoTexto`, T-007) e, na descrição normalizada, busca a pri
          +meira ocorrência de `(?<!\d[.,]?)(\d+)(?![.,]\d)\s*(diarias?|n
          +oites?)(?![a-z])`; sem ocorrência, descrição vazia (ausente ou
          + nula) ou N = 0 → 1 (uma única diária)                        
      114    - **Atende:** RN-012, AMB-008, AMB-026
      115    - **Aceite:** em `tests/nucleo/rn-012-diarias.test.ts` passa
           m `RN-012 › "Hotel Rio - 2 diarias" → N = 2`, `RN-012 › "Airbn
           b 3 noites" → N = 3`, `RN-012 › "Hotel 5 estrelas" → N = 1`, `
           RN-012 › "Hotel 5 estrelas - 2 diarias" → N = 2`, `RN-012 › "H
           otel 1.5 diarias" → N = 1 (e não 5)`, `RN-012 › "Pousada" e de
           scrição ausente → N = 1`, `RN-012 › "0 diarias" → N = 1`, `RN-
           012 › "3 Diárias" → N = 3`, `RN-012 › "12 noites" → N = 12 (in
           teiro completo)`, `RN-012 › "2diarias" → N = 2 (sem espaço)`, 
           `RN-012 › "2 noitadas" → N = 1` e `RN-012 › descricao nula ou 
           2 (número) → N = 1`
      116 -  - **Commit:** `<hash preenchido depois>`                    
      116 +  - **Commit:** `94c9883`                                     
      117  
      118  - [ ] **T-019** — `gerarParcelas(elegivel)` em `src/nucleo/dia
           rias.ts` (DT-003): hospedagem com N diárias vira N `Parcela`s 
           nas datas D…D+N−1 com `valor ÷ N` e o resto distribuído um cen
           tavo por vez nas primeiras noites; qualquer outra categoria vi
           ra uma parcela na própria data
      119    - **Atende:** RN-012, AMB-008
  ⎿  Created src\nucleo\diarias.ts (+13 -0)
       1 +// Diárias de hospedagem (RN-012, AMB-008).                    
       2 +                                                               
       3 +import { normalizar } from './texto.ts';                       
       4 +                                                               
       5 +/** Primeiro "<inteiro> diária(s)/noite(s)", sem pegar pedaço d
         +e fracionário (R-07). */                                       
       6 +const PADRAO_DIARIAS = /(?<!\d[.,]?)(\d+)(?![.,]\d)\s*(diarias?
         +|noites?)(?![a-z])/;                                           
       7 +                                                               
       8 +/** N a partir da `descricao` já em texto; sem o padrão, vazia 
         +ou N = 0 → 1. */                                               
       9 +export function extrairDiarias(descricao: string): number {    
      10 +  const m = PADRAO_DIARIAS.exec(normalizar(descricao));        
      11 +  const n = m ? Number(m[1]) : 0;                              
      12 +  return n > 0 ? n : 1;                                        
      13 +}                                                              
  ⎿  Created tests\nucleo\rn-012-diarias.test.ts (+61 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { extrairDiarias } from '../../src/nucleo/diarias.ts';  
       3 +import { comoTexto } from '../../src/nucleo/texto.ts';         
       4 +import { NumeroJson } from '../../src/nucleo/tipos.ts';        
       5 +                                                               
       6 +describe('RN-012 — Hospedagem com mais de uma diária', () => { 
       7 +  it('RN-012 › "Hotel Rio - 2 diarias" → N = 2', () => {       
       8 +    expect(extrairDiarias('Hotel Rio - 2 diarias')).toBe(2);   
       9 +  });                                                          
      10 +                                                               
      11 +  it('RN-012 › "Airbnb 3 noites" → N = 3', () => {             
      12 +    expect(extrairDiarias('Airbnb 3 noites')).toBe(3);         
      13 +  });                                                          
      14 +                                                               
      15 +  it('RN-012 › "Hotel 5 estrelas" → N = 1', () => {            
      16 +    expect(extrairDiarias('Hotel 5 estrelas')).toBe(1);        
      17 +  });                                                          
      18 +                                                               
      19 +  it('RN-012 › "Hotel 5 estrelas - 2 diarias" → N = 2', () => {
      20 +    expect(extrairDiarias('Hotel 5 estrelas - 2 diarias')).toBe
         +(2);                                                           
      21 +  });                                                          
      22 +                                                               
      23 +  it('RN-012 › "Hotel 1.5 diarias" → N = 1 (e não 5)', () => { 
      24 +    expect(extrairDiarias('Hotel 1.5 diarias')).toBe(1);       
      25 +    expect(extrairDiarias('Hotel 1,5 diarias')).toBe(1);       
      26 +    expect(extrairDiarias('Hotel 1.5 diarias e 2 noites')).toBe
         +(2);                                                           
      27 +  });                                                          
      28 +                                                               
      29 +  it('RN-012 › "Pousada" e descrição ausente → N = 1', () => { 
      30 +    expect(extrairDiarias('Pousada')).toBe(1);                 
      31 +    expect(extrairDiarias(comoTexto(undefined))).toBe(1);      
      32 +  });                                                          
      33 +                                                               
      34 +  it('RN-012 › "0 diarias" → N = 1', () => {                   
      35 +    expect(extrairDiarias('0 diarias')).toBe(1);               
      36 +  });                                                          
      37 +                                                               
      38 +  it('RN-012 › "3 Diárias" → N = 3', () => {                   
      39 +    expect(extrairDiarias('3 Diárias')).toBe(3);               
      40 +    expect(extrairDiarias('1 DIÁRIA')).toBe(1);                
     … 21 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-019: splitting a stay into per-night Parcelas. The number of nights comes
  from diariasDe(d), so I'll remove the unused optional DespesaElegivel.diarias.

● Update(src\nucleo\tipos.ts)
  ⎿  Removed 2 lines
      59  /** Despesa que passou das etapas 3 a 7. */
      60  export interface DespesaElegivel extends Omit<DespesaValida, 'c
          ategoria'> {
      61    readonly categoria: Categoria;
      62 -  /** Só em hospedagem (RN-012). */                            
      63 -  readonly diarias?: number;                                   
      62  }
      63  
      64  /** Códigos de motivo da seção 4 da spec. */

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && sed -i "s|^import {
      normalizar } from './texto.ts';|import { somarDias } from
      './datas.ts';\nimport { normaliza…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      115    - **Aceite:** em `tests/nucleo/rn-012-diarias.test.ts` passa
           m `RN-012 › "Hotel Rio - 2 diarias" → N = 2`, `RN-012 › "Airbn
           b 3 noites" → N = 3`, `RN-012 › "Hotel 5 estrelas" → N = 1`, `
           RN-012 › "Hotel 5 estrelas - 2 diarias" → N = 2`, `RN-012 › "H
           otel 1.5 diarias" → N = 1 (e não 5)`, `RN-012 › "Pousada" e de
           scrição ausente → N = 1`, `RN-012 › "0 diarias" → N = 1`, `RN-
           012 › "3 Diárias" → N = 3`, `RN-012 › "12 noites" → N = 12 (in
           teiro completo)`, `RN-012 › "2diarias" → N = 2 (sem espaço)`, 
           `RN-012 › "2 noitadas" → N = 1` e `RN-012 › descricao nula ou 
           2 (número) → N = 1`
      116    - **Commit:** `94c9883`
      117  
      118 -- [ ] **T-019** — `gerarParcelas(elegivel)` em `src/nucleo/dia
          -rias.ts` (DT-003): hospedagem com N diárias vira N `Parcela`s 
          -nas datas D…D+N−1 com `valor ÷ N` e o resto distribuído um cen
          -tavo por vez nas primeiras noites; qualquer outra categoria vi
          -ra uma parcela na própria data                                
      118 +- [x] **T-019** — `gerarParcelas(elegivel)` em `src/nucleo/dia
          +rias.ts` (DT-003): hospedagem com N diárias vira N `Parcela`s 
          +nas datas D…D+N−1 com `valor ÷ N` e o resto distribuído um cen
          +tavo por vez nas primeiras noites; qualquer outra categoria vi
          +ra uma parcela na própria data                                
      119    - **Atende:** RN-012, AMB-008
      120    - **Aceite:** em `tests/nucleo/rn-012-diarias.test.ts` passa
           m `RN-012 › d-010 (480,00, N = 2) → 240,00 em 14/07 e 240,00 e
           m 15/07`, `RN-012 › 100,00 em 3 noites → 33,34 / 33,33 / 33,33
           `, `RN-012 › noites atravessam o fim do mês (31/07 → 01/08)` e
            `RN-012 › despesa que não é hospedagem gera uma parcela`
      121 -  - **Commit:** `<hash preenchido depois>`                    
      121 +  - **Commit:** `47d672d`                                     
      122  
      123  - [ ] **T-020** — Criar `src/nucleo/viagem.ts` com `diasDeViag
           em(elegiveis)` → conjunto de todas as noites (D…D+N−1) das hos
           pedagens **elegíveis** recebidas; o check-out (D+N) não entra
      124    - **Atende:** RN-011, AMB-007
  ⎿  Updated src\nucleo\diarias.ts (+23 -0)
      1  // Diárias de hospedagem (RN-012, AMB-008).
      2  
      3 +import { somarDias } from './datas.ts';                         
      4  import { normalizar } from './texto.ts';
      5 +import type { DespesaElegivel, Parcela } from './tipos.ts';     
      6  
      7  /** Primeiro "<inteiro> diária(s)/noite(s)", sem pegar pedaço de
          fracionário (R-07). */
      8  const PADRAO_DIARIAS = /(?<!\d[.,]?)(\d+)(?![.,]\d)\s*(diarias?|
         noites?)(?![a-z])/;
     ...
      13    const n = m ? Number(m[1]) : 0;
      14    return n > 0 ? n : 1;
      15  }
      16 +                                                               
      17 +/** N da despesa: extraído da descrição na hospedagem, 1 nas de
         +mais. */                                                       
      18 +export function diariasDe(d: DespesaElegivel): number {        
      19 +  return d.categoria === 'hospedagem' ? extrairDiarias(d.descri
         +cao) : 1;                                                      
      20 +}                                                              
      21 +                                                               
      22 +/**                                                            
      23 + * Parcelas que consomem limite (DT-003): N noites D…D+N−1 com 
         +`valor ÷ N`,                                                   
      24 + * o resto um centavo por vez nas primeiras noites.            
      25 + */                                                            
      26 +export function gerarParcelas(d: DespesaElegivel): Parcela[] { 
      27 +  const n = diariasDe(d);                                      
      28 +  const base = d.valorSolicitado / BigInt(n);                  
      29 +  const resto = d.valorSolicitado % BigInt(n);                 
      30 +  return Array.from({ length: n }, (_, k) => ({                
      31 +    indiceDespesa: d.indice,                                   
      32 +    data: somarDias(d.data, k),                                
      33 +    categoria: d.categoria,                                    
      34 +    valor: base + (BigInt(k) < resto ? 1n : 0n),               
      35 +  }));                                                         
      36 +}                                                              
  ⎿  Updated tests\apoio.ts (+9 -1)
       4  import { lerJson } from '../src/io/json.ts';
       5  import { validarDespesa } from '../src/nucleo/despesa.ts';
       6  import { passada1 } from '../src/nucleo/motor.ts';
       7 -import type { DespesaValida, Entrada } from '../src/nucleo/tipo
         -s.ts';                                                         
       7 +import { POLITICA } from '../src/nucleo/politica.ts';          
       8 +import type { DespesaElegivel, DespesaValida, Entrada } from '.
         +./src/nucleo/tipos.ts';                                        
       9  
      10  export const DESPESA_PADRAO = {
      11    id: 'd-001',
     ...
      66  export function codigosPassada1(e: Entrada): (string | null)[] 
          {
      67    return passada1(e).map((a) => (a.tipo === 'elegivel' ? null :
           a.recusa.codigo));
      68  }
      69 +                                                               
      70 +/** `DespesaElegivel` a partir do padrão com `campos` trocados.
         + */                                                            
      71 +export function elegivel(campos: Record<string, unknown> = {}, 
         +indice = 0): DespesaElegivel {                                 
      72 +  const d = valida(campos, indice);                            
      73 +  expect(Object.hasOwn(POLITICA.limites, d.categoria), d.catego
         +ria).toBe(true);                                               
      74 +  return d as DespesaElegivel;                                 
      75 +}                                                              
  ⎿  Updated tests\nucleo\rn-012-diarias.test.ts (+42 -1)
      1  import { describe, expect, it } from 'vitest';
      2 -import { extrairDiarias } from '../../src/nucleo/diarias.ts';   
      2 +import { extrairDiarias, gerarParcelas } from '../../src/nucleo/
        +diarias.ts';                                                    
      3  import { comoTexto } from '../../src/nucleo/texto.ts';
      4  import { NumeroJson } from '../../src/nucleo/tipos.ts';
      5 +import { elegivel } from '../apoio.ts';                         
      6  
      7  describe('RN-012 — Hospedagem com mais de uma diária', () => {
      8    it('RN-012 › "Hotel Rio - 2 diarias" → N = 2', () => {
     ...
       59      expect(extrairDiarias(comoTexto(null))).toBe(1);
       60      expect(extrairDiarias(comoTexto(new NumeroJson('2')))).toB
           e(1);
       61    });
       62 +                                                              
       63 +  /** Parcelas como `[data, valor em centavos]`. */           
       64 +  function parcelas(campos: Record<string, unknown>): [string,
          + bigint][] {                                                  
       65 +    return gerarParcelas(elegivel(campos)).map((p) => [p.data,
          + p.valor]);                                                   
       66 +  }                                                           
       67 +                                                              
       68 +  it('RN-012 › d-010 (480,00, N = 2) → 240,00 em 14/07 e 240,0
          +0 em 15/07', () => {                                          
       69 +    const d010 = { id: 'd-010', data: '2026-07-14', categoria:
          + 'hospedagem', descricao: 'Hotel Rio - 2 diarias', valor: 480 
          +};                                                            
       70 +    expect(parcelas(d010)).toEqual([                          
       71 +      ['2026-07-14', 24000n],                                 
       72 +      ['2026-07-15', 24000n],                                 
       73 +    ]);                                                       
       74 +    expect(gerarParcelas(elegivel(d010, 9)).every((p) => p.ind
          +iceDespesa === 9 && p.categoria === 'hospedagem')).toBe(true);
       75 +  });                                                         
       76 +                                                              
       77 +  it('RN-012 › 100,00 em 3 noites → 33,34 / 33,33 / 33,33', ()
          + => {                                                         
       78 +    expect(parcelas({ data: '2026-07-14', categoria: 'hospedag
          +em', descricao: '3 diarias', valor: 100 })).toEqual([         
       79 +      ['2026-07-14', 3334n],                                  
       80 +      ['2026-07-15', 3333n],                                  
       81 +      ['2026-07-16', 3333n],                                  
       82 +    ]);                                                       
       83 +    expect(parcelas({ data: '2026-07-14', categoria: 'hospedag
          +em', descricao: '3 noites', valor: 0.05 })).toEqual([         
       84 +      ['2026-07-14', 2n],                                     
       85 +      ['2026-07-15', 2n],                                     
       86 +      ['2026-07-16', 1n],                                     
       87 +    ]);                                                       
       88 +  });                                                         
       89 +                                                              
     … 13 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-020: travel days (dias de viagem).

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      src/nucleo/viagem.ts <<'EOF'
      // Etapa 8 da seção 8: dias de viagem (RN-011, AMB-007).…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      120    - **Aceite:** em `tests/nucleo/rn-012-diarias.test.ts` passa
           m `RN-012 › d-010 (480,00, N = 2) → 240,00 em 14/07 e 240,00 e
           m 15/07`, `RN-012 › 100,00 em 3 noites → 33,34 / 33,33 / 33,33
           `, `RN-012 › noites atravessam o fim do mês (31/07 → 01/08)` e
            `RN-012 › despesa que não é hospedagem gera uma parcela`
      121    - **Commit:** `47d672d`
      122  
      123 -- [ ] **T-020** — Criar `src/nucleo/viagem.ts` com `diasDeViag
          -em(elegiveis)` → conjunto de todas as noites (D…D+N−1) das hos
          -pedagens **elegíveis** recebidas; o check-out (D+N) não entra 
      123 +- [x] **T-020** — Criar `src/nucleo/viagem.ts` com `diasDeViag
          +em(elegiveis)` → conjunto de todas as noites (D…D+N−1) das hos
          +pedagens **elegíveis** recebidas; o check-out (D+N) não entra 
      124    - **Atende:** RN-011, AMB-007
      125    - **Aceite:** em `tests/nucleo/rn-011-viagem.test.ts` passam
            `RN-011 › hospedagem de 1 diária em D: só D é dia de viagem`,
            `RN-011 › hospedagem de 2 diárias em D: D e D+1 são dias de v
           iagem` e `RN-011 › sem hospedagem elegível não há dia de viage
           m`
      126 -  - **Commit:** `<hash preenchido depois>`                    
      126 +  - **Commit:** `d6a3445`                                     
      127  
      128  - [ ] **T-021** — [P] Criar `src/nucleo/limites.ts` com `aloca
           r(parcelas, diasDeViagem)`: saldo por `(data, categoria)` inic
           iado com `POLITICA.limites[cat].diario`, multiplicado por `fat
           orViagem` só se a data é de viagem **e** `ampliaEmViagem`; cad
           a parcela, na ordem da entrada, recebe `min(valor, saldo)`; so
           ma por `indiceDespesa`; devolve por despesa o reembolsável, o 
           limite aplicado, o saldo disponível e o código (`APROVADO_INTE
           GRAL` / `LIMITE_DIARIO_EXCEDIDO` / `LIMITE_DIARIO_ESGOTADO`)
      129    - **Atende:** RN-009, RN-010, AMB-001, AMB-002, AMB-003, AMB
           -015, AMB-016, AMB-020
  ⎿  Created src\nucleo\viagem.ts (+15 -0)
       1 +// Etapa 8 da seção 8: dias de viagem (RN-011, AMB-007).       
       2 +                                                               
       3 +import { somarDias } from './datas.ts';                        
       4 +import { diariasDe } from './diarias.ts';                      
       5 +import type { DataISO, DespesaElegivel } from './tipos.ts';    
       6 +                                                               
       7 +/** Todas as noites D…D+N−1 das hospedagens elegíveis; o check-
         +out (D+N) não entra. */                                        
       8 +export function diasDeViagem(elegiveis: readonly DespesaElegive
         +l[]): Set<DataISO> {                                           
       9 +  const dias = new Set<DataISO>();                             
      10 +  for (const d of elegiveis) {                                 
      11 +    if (d.categoria !== 'hospedagem') continue;                
      12 +    for (let k = 0; k < diariasDe(d); k++) dias.add(somarDias(d
         +.data, k));                                                    
      13 +  }                                                            
      14 +  return dias;                                                 
      15 +}                                                              
  ⎿  Created tests\nucleo\rn-011-viagem.test.ts (+23 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { diasDeViagem } from '../../src/nucleo/viagem.ts';     
       3 +import { elegivel } from '../apoio.ts';                        
       4 +                                                               
       5 +const hospedagem = { categoria: 'hospedagem', data: '2026-07-14
         +', valor: 200 };                                               
       6 +                                                               
       7 +describe('RN-011 — Colaborador em viagem', () => {             
       8 +  it('RN-011 › hospedagem de 1 diária em D: só D é dia de viage
         +m', () => {                                                    
       9 +    expect([...diasDeViagem([elegivel({ ...hospedagem, descrica
         +o: 'Hotel' })])]).toEqual(['2026-07-14']);                     
      10 +  });                                                          
      11 +                                                               
      12 +  it('RN-011 › hospedagem de 2 diárias em D: D e D+1 são dias d
         +e viagem', () => {                                             
      13 +    expect([...diasDeViagem([elegivel({ ...hospedagem, descrica
         +o: 'Hotel - 2 diarias' })])]).toEqual([                        
      14 +      '2026-07-14',                                            
      15 +      '2026-07-15',                                            
      16 +    ]);                                                        
      17 +  });                                                          
      18 +                                                               
      19 +  it('RN-011 › sem hospedagem elegível não há dia de viagem', (
         +) => {                                                         
      20 +    expect(diasDeViagem([]).size).toBe(0);                     
      21 +    expect(diasDeViagem([elegivel({ categoria: 'alimentacao', d
         +escricao: '2 diarias' })]).size).toBe(0);                      
      22 +  });                                                          
      23 +});                                                            
  ⎿  (timeout 3m)

● T-021: daily limit allocation (limites.ts).

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      src/nucleo/limites.ts <<'EOF'
      // Etapa 9 da seção 8: limite diário por (data, categoria) (RN-009,
      RN-010)…)
  ⎿  Created src\nucleo\limites.ts (+67 -0)
       1 +// Etapa 9 da seção 8: limite diário por (data, categoria) (RN-
         +009, RN-010).                                                  
       2 +                                                               
       3 +import { POLITICA } from './politica.ts';                      
       4 +import type { Categoria, Centavos, CodigoMotivo, DataISO, Parce
         +la } from './tipos.ts';                                        
       5 +                                                               
       6 +/** Resultado do limite para uma despesa (soma das suas parcela
         +s). */                                                         
       7 +export interface Alocacao {                                    
       8 +  readonly indiceDespesa: number;                              
       9 +  readonly solicitado: Centavos;                               
      10 +  readonly reembolsavel: Centavos;                             
      11 +  /** Limite da categoria na data da 1ª parcela, já ampliado se
         + for dia de viagem. */                                         
      12 +  readonly limiteAplicado: Centavos;                           
      13 +  /** Saldo que as parcelas encontraram antes de consumir. */  
      14 +  readonly saldoDisponivel: Centavos;                          
      15 +  /** Saldo que as parcelas deixaram. */                       
      16 +  readonly saldoApos: Centavos;                                
      17 +  readonly codigo: Extract<CodigoMotivo, 'APROVADO_INTEGRAL' | 
         +'LIMITE_DIARIO_EXCEDIDO' | 'LIMITE_DIARIO_ESGOTADO'>;          
      18 +}                                                              
      19 +                                                               
      20 +/** Limite de (data, categoria): ampliado só em dia de viagem e
         + se a categoria amplia (RN-009, RN-011, AMB-020). */           
      21 +export function limiteDiario(categoria: Categoria, data: DataIS
         +O, diasDeViagem: ReadonlySet<DataISO>): Centavos {             
      22 +  const { diario, ampliaEmViagem } = POLITICA.limites[categoria
         +];                                                             
      23 +  if (!ampliaEmViagem || !diasDeViagem.has(data)) return diario
         +;                                                              
      24 +  const { num, den } = POLITICA.fatorViagem;                   
      25 +  if ((diario * num) % den !== 0n) {                           
      26 +    // A spec não define arredondamento de limite ampliado (pla
         +n §7).                                                         
      27 +    throw new Error(`limite ampliado de ${categoria} não é exat
         +o em centavos`);                                               
      28 +  }                                                            
      29 +  return (diario * num) / den;                                 
      30 +}                                                              
      31 +                                                               
      32 +/**                                                            
      33 + * Cada parcela, na ordem recebida (a da entrada), leva `min(va
         +lor, saldo)` do                                                
      34 + * saldo de (data, categoria). Devolve uma alocação por despesa
         +, na ordem.                                                    
      35 + */                                                            
      36 +export function alocar(parcelas: readonly Parcela[], diasDeViag
         +em: ReadonlySet<DataISO>): Alocacao[] {                        
      37 +  const saldos = new Map<string, Centavos>();                  
      38 +  const porDespesa = new Map<number, Omit<Alocacao, 'codigo'>>(
         +);                                                             
      39 +                                                               
      40 +  for (const p of parcelas) {                                  
     … 27 more lines (ctrl+o to expand)
  ⎿  Updated tests\apoio.ts (+11 -0)
       3  import { expect } from 'vitest';
       4  import { lerJson } from '../src/io/json.ts';
       5  import { validarDespesa } from '../src/nucleo/despesa.ts';
       6 +import { gerarParcelas } from '../src/nucleo/diarias.ts';      
       7 +import { alocar } from '../src/nucleo/limites.ts';             
       8 +import type { Alocacao } from '../src/nucleo/limites.ts';      
       9  import { passada1 } from '../src/nucleo/motor.ts';
      10  import { POLITICA } from '../src/nucleo/politica.ts';
      11  import type { DespesaElegivel, DespesaValida, Entrada } from '.
          ./src/nucleo/tipos.ts';
     ...
      76    expect(Object.hasOwn(POLITICA.limites, d.categoria), d.catego
          ria).toBe(true);
      77    return d as DespesaElegivel;
      78  }
      79 +                                                               
      80 +/** Aloca o limite para despesas elegíveis montadas do padrão, 
         +na ordem dada. */                                              
      81 +export function alocarDespesas(despesas: Record<string, unknown
         +>[], diasDeViagem: ReadonlySet<string> = new Set()): Alocacao[]
         + {                                                             
      82 +  return alocar(                                               
      83 +    despesas.flatMap((campos, i) => gerarParcelas(elegivel({ id
         +: `e-${i + 1}`, ...campos }, i))),                             
      84 +    diasDeViagem,                                              
      85 +  );                                                           
      86 +}                                                              

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      tests/nucleo/rn-009-limites.test.ts <<'EOF'
      import { describe, expect, it } from 'vitest';…)  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      125    - **Aceite:** em `tests/nucleo/rn-011-viagem.test.ts` passam
            `RN-011 › hospedagem de 1 diária em D: só D é dia de viagem`,
            `RN-011 › hospedagem de 2 diárias em D: D e D+1 são dias de v
           iagem` e `RN-011 › sem hospedagem elegível não há dia de viage
           m`
      126    - **Commit:** `d6a3445`
      127  
      128 -- [ ] **T-021** — [P] Criar `src/nucleo/limites.ts` com `aloca
          -r(parcelas, diasDeViagem)`: saldo por `(data, categoria)` inic
          -iado com `POLITICA.limites[cat].diario`, multiplicado por `fat
          -orViagem` só se a data é de viagem **e** `ampliaEmViagem`; cad
          -a parcela, na ordem da entrada, recebe `min(valor, saldo)`; so
          -ma por `indiceDespesa`; devolve por despesa o reembolsável, o 
          -limite aplicado, o saldo disponível e o código (`APROVADO_INTE
          -GRAL` / `LIMITE_DIARIO_EXCEDIDO` / `LIMITE_DIARIO_ESGOTADO`)  
      128 +- [x] **T-021** — [P] Criar `src/nucleo/limites.ts` com `aloca
          +r(parcelas, diasDeViagem)`: saldo por `(data, categoria)` inic
          +iado com `POLITICA.limites[cat].diario`, multiplicado por `fat
          +orViagem` só se a data é de viagem **e** `ampliaEmViagem`; cad
          +a parcela, na ordem da entrada, recebe `min(valor, saldo)`; so
          +ma por `indiceDespesa`; devolve por despesa o reembolsável, o 
          +limite aplicado, o saldo disponível e o código (`APROVADO_INTE
          +GRAL` / `LIMITE_DIARIO_EXCEDIDO` / `LIMITE_DIARIO_ESGOTADO`)  
      129    - **Atende:** RN-009, RN-010, AMB-001, AMB-002, AMB-003, AMB
           -015, AMB-016, AMB-020
      130    - **Aceite:** em `tests/nucleo/rn-009-limites.test.ts` passa
           m `RN-009 › alimentação isolada de 60,00 → APROVADO 60,00`, `R
           N-009 › d-012 (sábado, 47,20) → APROVADO 47,20`, `RN-009 › cat
           egorias diferentes no mesmo dia têm limites independentes` e `
           RN-009 › em dia de viagem alimentação vai a 90,00 e transporte
            a 120,00, hospedagem fica em 250,00`; em `tests/nucleo/rn-010
           -parcial.test.ts` passam `RN-010 › d-001 e d-002 em 03/07: 1ª 
           PARCIAL 60,00, 2ª ESGOTADO`, `RN-010 › d-014 (61,00) → PARCIAL
            60,00` e `RN-010 › despesa que usa exatamente o saldo restant
           e → APROVADO_INTEGRAL`
      131 -  - **Commit:** `<hash preenchido depois>`                    
      131 +  - **Commit:** `388604d`                                     
      132  
      133  - [ ] **T-022** — **Passada 2** em `src/nucleo/motor.ts`: com 
           as elegíveis da passada 1, calcula `diasDeViagem`, gera parcel
           as e chama `alocar`; monta cada `ResultadoItem` com `limite_di
           ario_aplicado`, `em_viagem`, `diarias` (só hospedagem alocada)
            e `status` **derivado** de (reembolsável, solicitado); recusa
           das saem com esses três campos nulos e reembolsável 0
      134    - **Atende:** RN-011, RN-012, RN-002, RN-004, RN-008, AMB-00
           7, AMB-017, AMB-020
  ⎿  Created tests\nucleo\rn-009-limites.test.ts (+54 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { limiteDiario } from '../../src/nucleo/limites.ts';    
       3 +import { alocarDespesas } from '../apoio.ts';                  
       4 +                                                               
       5 +/** `[código, reembolsável]` de cada despesa. */               
       6 +function resumo(despesas: Record<string, unknown>[], dias?: Rea
         +donlySet<string>): [string, bigint][] {                        
       7 +  return alocarDespesas(despesas, dias).map((a) => [a.codigo, a
         +.reembolsavel]);                                               
       8 +}                                                              
       9 +                                                               
      10 +describe('RN-009 — Limites diários por categoria', () => {     
      11 +  it('RN-009 › alimentação isolada de 60,00 → APROVADO 60,00', 
         +() => {                                                        
      12 +    expect(resumo([{ valor: 60 }])).toEqual([['APROVADO_INTEGRA
         +L', 6000n]]);                                                  
      13 +  });                                                          
      14 +                                                               
      15 +  it('RN-009 › d-012 (sábado, 47,20) → APROVADO 47,20', () => {
      16 +    expect(resumo([{ id: 'd-012', data: '2026-07-18', valor: 47
         +.2 }])).toEqual([['APROVADO_INTEGRAL', 4720n]]);               
      17 +  });                                                          
      18 +                                                               
      19 +  it('RN-009 › categorias diferentes no mesmo dia têm limites i
         +ndependentes', () => {                                         
      20 +    expect(                                                    
      21 +      resumo([                                                 
      22 +        { categoria: 'alimentacao', valor: 60 },               
      23 +        { categoria: 'transporte_urbano', valor: 80 },         
      24 +        { categoria: 'hospedagem', valor: 250 },               
      25 +      ]),                                                      
      26 +    ).toEqual([                                                
      27 +      ['APROVADO_INTEGRAL', 6000n],                            
      28 +      ['APROVADO_INTEGRAL', 8000n],                            
      29 +      ['APROVADO_INTEGRAL', 25000n],                           
      30 +    ]);                                                        
      31 +  });                                                          
      32 +                                                               
      33 +  it('RN-009 › em dia de viagem alimentação vai a 90,00 e trans
         +porte a 120,00, hospedagem fica em 250,00', () => {            
      34 +    const viagem = new Set(['2026-07-03']);                    
      35 +    expect(limiteDiario('alimentacao', '2026-07-03', viagem)).t
         +oBe(9000n);                                                    
      36 +    expect(limiteDiario('transporte_urbano', '2026-07-03', viag
         +em)).toBe(12000n);                                             
      37 +    expect(limiteDiario('hospedagem', '2026-07-03', viagem)).to
         +Be(25000n);                                                    
      38 +    expect(limiteDiario('alimentacao', '2026-07-04', viagem)).t
         +oBe(6000n);                                                    
      39 +    expect(                                                    
      40 +      resumo(                                                  
     … 14 more lines (ctrl+o to expand)
  ⎿  Created tests\nucleo\rn-010-parcial.test.ts (+31 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { alocarDespesas } from '../apoio.ts';                  
       3 +                                                               
       4 +describe('RN-010 — Reembolso parcial e distribuição do limite n
         +o dia', () => {                                                
       5 +  it('RN-010 › d-001 e d-002 em 03/07: 1ª PARCIAL 60,00, 2ª ESG
         +OTADO', () => {                                                
       6 +    const [d001, d002] = alocarDespesas([                      
       7 +      { id: 'd-001', valor: 72.5, fornecedor: 'Restaurante Tavo
         +la' },                                                         
       8 +      { id: 'd-002', valor: 38, fornecedor: 'Cantina do Porto' 
         +},                                                             
       9 +    ]);                                                        
      10 +    expect(d001).toMatchObject({ codigo: 'LIMITE_DIARIO_EXCEDID
         +O', reembolsavel: 6000n, limiteAplicado: 6000n, saldoDisponivel
         +: 6000n });                                                    
      11 +    expect(d002).toMatchObject({ codigo: 'LIMITE_DIARIO_ESGOTAD
         +O', reembolsavel: 0n, saldoDisponivel: 0n });                  
      12 +  });                                                          
      13 +                                                               
      14 +  it('RN-010 › d-014 (61,00) → PARCIAL 60,00', () => {         
      15 +    const [d014] = alocarDespesas([{ id: 'd-014', data: '2026-0
         +7-31', valor: 61 }]);                                          
      16 +    expect(d014).toMatchObject({ codigo: 'LIMITE_DIARIO_EXCEDID
         +O', reembolsavel: 6000n, solicitado: 6100n });                 
      17 +  });                                                          
      18 +                                                               
      19 +  it('RN-010 › despesa que usa exatamente o saldo restante → AP
         +ROVADO_INTEGRAL', () => {                                      
      20 +    const [a, b, c] = alocarDespesas([{ valor: 45 }, { valor: 1
         +5 }, { valor: 0.01 }]);                                        
      21 +    expect(a).toMatchObject({ codigo: 'APROVADO_INTEGRAL', reem
         +bolsavel: 4500n, saldoApos: 1500n });                          
      22 +    expect(b).toMatchObject({ codigo: 'APROVADO_INTEGRAL', reem
         +bolsavel: 1500n, saldoDisponivel: 1500n, saldoApos: 0n });     
      23 +    expect(c).toMatchObject({ codigo: 'LIMITE_DIARIO_ESGOTADO',
         + reembolsavel: 0n });                                          
      24 +  });                                                          
      25 +                                                               
      26 +  it('RN-010 › a ordem da entrada decide quem consome o saldo',
         + () => {                                                       
      27 +    const [a, b] = alocarDespesas([{ valor: 38 }, { valor: 72.5
         + }]);                                                          
      28 +    expect(a).toMatchObject({ codigo: 'APROVADO_INTEGRAL', reem
         +bolsavel: 3800n });                                            
      29 +    expect(b).toMatchObject({ codigo: 'LIMITE_DIARIO_EXCEDIDO',
         + reembolsavel: 2200n });                                       
      30 +  });                                                          
      31 +});                                                            
  ⎿  (timeout 3m)

● The limit module is finished. Next up is T-022 pass 2 — handling travel days,
  per-night parcels, allocation, and building ResultadoItem — and I'll extract
  statusDe into its own module (src/nucleo/status.ts) since it's shared by
  motor.ts, resumo.ts, and io/saida.ts.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      src/nucleo/status.ts <<'EOF'
      // Status derivado dos valores (seção 4); nunca guardado no item.…)
  ⎿  Updated src\nucleo\motor.ts (+65 -1)
      1  // Ordem da seção 8 da spec, num lugar só (DT-002).
      2  
      3  import { registrarId, validarDespesa } from './despesa.ts';
      4 +import { diariasDe, gerarParcelas } from './diarias.ts';        
      5  import {
      6    verificarCategoria,
      7    verificarDuplicata,
     ...
       9    verificarPeriodo,
      10    verificarValorPositivo,
      11  } from './elegibilidade.ts';
      12 +import { ehCategoria } from './elegibilidade.ts';              
      13  import type { ChavesDuplicata } from './elegibilidade.ts';
      12 -import type { Categoria, DespesaElegivel, DespesaValida, Entrad
         -a, Recusa, RecusaDadoInvalido } from './tipos.ts';             
      14 +import { alocar } from './limites.ts';                         
      15 +import type { Alocacao } from './limites.ts';                  
      16 +import type {                                                  
      17 +  Categoria,                                                   
      18 +  CodigoMotivo,                                                
      19 +  DespesaElegivel,                                             
      20 +  DespesaValida,                                               
      21 +  Entrada,                                                     
      22 +  Motivo,                                                      
      23 +  Recusa,                                                      
      24 +  RecusaDadoInvalido,                                          
      25 +  ResultadoItem,                                               
      26 +} from './tipos.ts';                                           
      27 +import { diasDeViagem } from './viagem.ts';                    
      28  
      29  /** Resultado da passada 1 para uma despesa. */
      30  export type Avaliacao =
     ...
       53      return { tipo: 'elegivel', despesa: { ...validada, categor
           ia: validada.categoria as Categoria } };
       54    });
       55  }
       56 +                                                              
       57 +/** Passada 2: etapas 8 e 9 sobre as elegíveis; monta um item 
          +por despesa, na ordem da entrada. */                          
       58 +export function calcularItens(entrada: Entrada): ResultadoItem
          +[] {                                                          
       59 +  const avaliacoes = passada1(entrada);                       
       60 +  const elegiveis = avaliacoes.flatMap((a) => (a.tipo === 'ele
          +givel' ? [a.despesa] : []));                                  
       61 +  const viagem = diasDeViagem(elegiveis); // etapa 8          
       62 +  const alocacoes = new Map<number, Alocacao>(                
     … 42 more lines (ctrl+o to expand)
  ⎿  Created src\nucleo\status.ts (+8 -0)
      1 +// Status derivado dos valores (seção 4); nunca guardado no item
        +.                                                               
      2 +                                                                
      3 +import type { ResultadoItem, Status } from './tipos.ts';        
      4 +                                                                
      5 +export function statusDe(item: Pick<ResultadoItem, 'valorSolicit
        +ado' | 'valorReembolsavel'>): Status {                          
      6 +  if (item.valorReembolsavel === 0n) return 'RECUSADO';         
      7 +  return item.valorReembolsavel === item.valorSolicitado ? 'APRO
        +VADO' : 'PARCIAL';                                              
      8 +}                                                               

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && sed -i "s|^import {
      passada1 } from '../src/nucleo/motor.ts';|import { calcularItens, passada1
      } from '../src/n…)
  ⎿  Updated tests\apoio.ts (+16 -2)
       6  import { gerarParcelas } from '../src/nucleo/diarias.ts';
       7  import { alocar } from '../src/nucleo/limites.ts';
       8  import type { Alocacao } from '../src/nucleo/limites.ts';
       9 -import { passada1 } from '../src/nucleo/motor.ts';             
       9 +import { calcularItens, passada1 } from '../src/nucleo/motor.ts
         +';                                                             
      10 +import { statusDe } from '../src/nucleo/status.ts';            
      11  import { POLITICA } from '../src/nucleo/politica.ts';
      11 -import type { DespesaElegivel, DespesaValida, Entrada } from '.
         -./src/nucleo/tipos.ts';                                        
      12 +import type { DespesaElegivel, DespesaValida, Entrada, Resultad
         +oItem } from '../src/nucleo/tipos.ts';                         
      13  
      14  export const DESPESA_PADRAO = {
      15    id: 'd-001',
     ...
       85      diasDeViagem,
       86    );
       87  }
       88 +                                                              
       89 +/** Itens do motor para as despesas montadas do padrão (ver `e
          +ntrada`). */                                                  
       90 +export function rodar(                                        
       91 +  despesas: (Record<string, unknown> | Cru)[],                
       92 +  periodo?: { inicio: string; fim: string },                  
       93 +): ResultadoItem[] {                                          
       94 +  return calcularItens(entrada(despesas, periodo));           
       95 +}                                                             
       96 +                                                              
       97 +/** `[status, código, reembolsável]` de cada item do motor. */
       98 +export function decisoes(despesas: (Record<string, unknown> | 
          +Cru)[], periodo?: { inicio: string; fim: string }) {          
       99 +  return rodar(despesas, periodo).map((i) => [statusDe(i), i.m
          +otivo.codigo, i.valorReembolsavel] as const);                 
      100 +}                                                             
  ⎿  Updated tests\nucleo\rn-002-categoria.test.ts (+16 -0)
      1  import { describe, expect, it } from 'vitest';
      2  import { normalizar } from '../../src/nucleo/texto.ts';
      3 +import { decisoes, rodar } from '../apoio.ts';                  
      4  
      5  describe('RN-002 — Normalização da categoria', () => {
      6    it('RN-002 › "ALIMENTACAO", " Alimentação " e "alimentacao" vi
         ram alimentacao', () => {
     ...
      13      expect(normalizar('Transporte_Urbano')).toBe('transporte_ur
          bano');
      14      expect(normalizar('HOSPEDAGEM')).toBe('hospedagem');
      15    });
      16 +                                                               
      17 +  it('RN-002 › "ALIMENTACAO" e "alimentacao" na mesma data soma
         +m no mesmo limite diário', () => {                             
      18 +    expect(                                                    
      19 +      decisoes([                                               
      20 +        { categoria: 'ALIMENTACAO', valor: 40, fornecedor: 'A' 
         +},                                                             
      21 +        { categoria: 'alimentacao', valor: 40, fornecedor: 'B' 
         +},                                                             
      22 +        { categoria: ' Alimentação ', valor: 40, fornecedor: 'C
         +' },                                                           
      23 +      ]),                                                      
      24 +    ).toEqual([                                                
      25 +      ['APROVADO', 'APROVADO_INTEGRAL', 4000n],                
      26 +      ['PARCIAL', 'LIMITE_DIARIO_EXCEDIDO', 2000n],            
      27 +      ['RECUSADO', 'LIMITE_DIARIO_ESGOTADO', 0n],              
      28 +    ]);                                                        
      29 +    expect(rodar([{ categoria: 'ALIMENTACAO' }])[0]?.categoria)
         +.toBe('alimentacao');                                          
      30 +  });                                                          
      31  });
  ⎿  Updated tests\nucleo\rn-004-valor-nao-positivo.test.ts (+16 -1)
      1  import { describe, expect, it } from 'vitest';
      2  import { verificarValorPositivo } from '../../src/nucleo/elegibi
         lidade.ts';
      3 -import { codigosPassada1, entrada, valida } from '../apoio.ts'; 
      3 +import { codigosPassada1, decisoes, entrada, valida } from '../a
        +poio.ts';                                                       
      4  
      5  describe('RN-004 — Valores não positivos', () => {
      6    it('RN-004 › d-009 (−45,00) → RECUSADO VALOR_NAO_POSITIVO, ree
         mbolsável 0,00', () => {
     ...
      26      expect(codigosPassada1(entrada([{ data: '2026-04-15', valor
          : -45 }]))).toEqual(['VALOR_NAO_POSITIVO']);
      27      expect(codigosPassada1(entrada([{ categoria: 'coworking', v
          alor: 0 }]))).toEqual(['VALOR_NAO_POSITIVO']);
      28    });
      29 +                                                               
      30 +  it('RN-004 › d-009 não afeta as despesas de transporte de 202
         +6-07-11', () => {                                              
      31 +    const transporte = { categoria: 'transporte_urbano', data: 
         +'2026-07-11', tem_nota_fiscal: false };                        
      32 +    expect(                                                    
      33 +      decisoes([                                               
      34 +        { ...transporte, id: 'd-009', valor: -45 },            
      35 +        { ...transporte, valor: 80, fornecedor: 'A' },         
      36 +        { ...transporte, valor: 10, fornecedor: 'B' },         
      37 +      ]),                                                      
      38 +    ).toEqual([                                                
      39 +      ['RECUSADO', 'VALOR_NAO_POSITIVO', 0n],                  
      40 +      ['APROVADO', 'APROVADO_INTEGRAL', 8000n],                
      41 +      ['RECUSADO', 'LIMITE_DIARIO_ESGOTADO', 0n],              
      42 +    ]);                                                        
      43 +  });                                                          
      44  });
  ⎿  Updated tests\nucleo\rn-008-nota-fiscal.test.ts (+9 -1)
      1  import { describe, expect, it } from 'vitest';
      2  import { verificarNotaFiscal } from '../../src/nucleo/elegibilid
         ade.ts';
      3 -import { valida } from '../apoio.ts';                           
      3 +import { decisoes, valida } from '../apoio.ts';                 
      4  
      5  const semNf = { categoria: 'transporte_urbano', tem_nota_fiscal:
          false };
      6  
     ...
      24      expect(d.valorSolicitado).toBe(10000n);
      25      expect(verificarNotaFiscal(d)).toBeNull();
      26    });
      27 +                                                               
      28 +  it('RN-008 › dia de viagem não amplia o limiar de nota fiscal
         +', () => {                                                     
      29 +    const hotel = { categoria: 'hospedagem', valor: 200, descri
         +cao: 'Hotel', fornecedor: 'Hotel' };                           
      30 +    expect(decisoes([hotel, { ...semNf, valor: 110 }, { ...semN
         +f, valor: 100, fornecedor: 'Outro' }]).slice(1)).toEqual([     
      31 +      ['RECUSADO', 'NOTA_FISCAL_AUSENTE', 0n],                 
      32 +      ['APROVADO', 'APROVADO_INTEGRAL', 10000n],               
      33 +    ]);                                                        
      34 +  });                                                          
      35  });
  ⎿  Updated tests\nucleo\rn-011-viagem.test.ts (+37 -1)
      1  import { describe, expect, it } from 'vitest';
      2  import { diasDeViagem } from '../../src/nucleo/viagem.ts';
      3 -import { elegivel } from '../apoio.ts';                         
      3 +import { decisoes, elegivel, rodar } from '../apoio.ts';        
      4  
      5  const hospedagem = { categoria: 'hospedagem', data: '2026-07-14'
         , valor: 200 };
      6  
     ...
      20      expect(diasDeViagem([]).size).toBe(0);
      21      expect(diasDeViagem([elegivel({ categoria: 'alimentacao', d
          escricao: '2 diarias' })]).size).toBe(0);
      22    });
      23 +                                                               
      24 +  const hotel = { categoria: 'hospedagem', data: '2026-07-14', 
         +valor: 200, descricao: 'Hotel', fornecedor: 'Hotel' };         
      25 +  const alimentacao80 = { categoria: 'alimentacao', valor: 80 }
         +;                                                              
      26 +                                                               
      27 +  it('RN-011 › alimentação de 80,00 na data de hospedagem elegí
         +vel → APROVADO 80,00 (limite 90,00)', () => {                  
      28 +    const [, a] = rodar([hotel, { ...alimentacao80, data: '2026
         +-07-14' }]);                                                   
      29 +    expect(a).toMatchObject({ valorReembolsavel: 8000n, limiteD
         +iarioAplicado: 9000n, emViagem: true });                       
      30 +    expect(a?.motivo.codigo).toBe('APROVADO_INTEGRAL');        
      31 +  });                                                          
      32 +                                                               
      33 +  it('RN-011 › hospedagem de 1 diária em D e alimentação 80,00 
         +em D+1 → PARCIAL 60,00', () => {                               
      34 +    expect(decisoes([hotel, { ...alimentacao80, data: '2026-07-
         +15' }])[1]).toEqual([                                          
      35 +      'PARCIAL',                                               
      36 +      'LIMITE_DIARIO_EXCEDIDO',                                
      37 +      6000n,                                                   
      38 +    ]);                                                        
      39 +  });                                                          
      40 +                                                               
      41 +  it('RN-011 › hospedagem de 2 diárias em D e alimentação 80,00
         + em D+1 → APROVADO 80,00', () => {                             
      42 +    const [, a] = rodar([{ ...hotel, descricao: 'Hotel 2 diaria
         +s' }, { ...alimentacao80, data: '2026-07-15' }]);              
      43 +    expect(a).toMatchObject({ valorReembolsavel: 8000n, limiteD
         +iarioAplicado: 9000n, emViagem: true });                       
      44 +  });                                                          
      45 +                                                               
      46 +  it('RN-011 › d-013 recusada por NF não torna 22 a 24/07 dias 
         +de viagem', () => {                                            
      47 +    const d013 = { id: 'd-013', categoria: 'hospedagem', data: 
         +'2026-07-22', valor: 690, descricao: 'Airbnb 3 noites', tem_not
         +a_fiscal: false };                                             
      48 +    const itens = rodar([                                      
      49 +      d013,                                                    
      50 +      { ...alimentacao80, data: '2026-07-22' },                
      51 +      { ...alimentacao80, data: '2026-07-23' },                
      52 +      { ...alimentacao80, data: '2026-07-24' },                
     … 7 more lines (ctrl+o to expand)
  ⎿  … 1 more file changed

● All 111 tests pass. Committing T-022.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/f8a7bb5f-129f-4039-97c7…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      130    - **Aceite:** em `tests/nucleo/rn-009-limites.test.ts` passa
           m `RN-009 › alimentação isolada de 60,00 → APROVADO 60,00`, `R
           N-009 › d-012 (sábado, 47,20) → APROVADO 47,20`, `RN-009 › cat
           egorias diferentes no mesmo dia têm limites independentes` e `
           RN-009 › em dia de viagem alimentação vai a 90,00 e transporte
            a 120,00, hospedagem fica em 250,00`; em `tests/nucleo/rn-010
           -parcial.test.ts` passam `RN-010 › d-001 e d-002 em 03/07: 1ª 
           PARCIAL 60,00, 2ª ESGOTADO`, `RN-010 › d-014 (61,00) → PARCIAL
            60,00` e `RN-010 › despesa que usa exatamente o saldo restant
           e → APROVADO_INTEGRAL`
      131    - **Commit:** `388604d`
      132  
      133 -- [ ] **T-022** — **Passada 2** em `src/nucleo/motor.ts`: com 
          -as elegíveis da passada 1, calcula `diasDeViagem`, gera parcel
          -as e chama `alocar`; monta cada `ResultadoItem` com `limite_di
          -ario_aplicado`, `em_viagem`, `diarias` (só hospedagem alocada)
          - e `status` **derivado** de (reembolsável, solicitado); recusa
          -das saem com esses três campos nulos e reembolsável 0         
      133 +- [x] **T-022** — **Passada 2** em `src/nucleo/motor.ts`: com 
          +as elegíveis da passada 1, calcula `diasDeViagem`, gera parcel
          +as e chama `alocar`; monta cada `ResultadoItem` com `limite_di
          +ario_aplicado`, `em_viagem`, `diarias` (só hospedagem alocada)
          + e `status` **derivado** de (reembolsável, solicitado); recusa
          +das saem com esses três campos nulos e reembolsável 0         
      134    - **Atende:** RN-011, RN-012, RN-002, RN-004, RN-008, AMB-00
           7, AMB-017, AMB-020
      135    - **Aceite:** chamando o motor em memória, passam em `tests/
           nucleo/rn-011-viagem.test.ts` `RN-011 › alimentação de 80,00 n
           a data de hospedagem elegível → APROVADO 80,00 (limite 90,00)`
           , `RN-011 › hospedagem de 1 diária em D e alimentação 80,00 em
            D+1 → PARCIAL 60,00`, `RN-011 › hospedagem de 2 diárias em D 
           e alimentação 80,00 em D+1 → APROVADO 80,00` e `RN-011 › d-013
            recusada por NF não torna 22 a 24/07 dias de viagem`; em `tes
           ts/nucleo/rn-008-nota-fiscal.test.ts` `RN-008 › dia de viagem 
           não amplia o limiar de nota fiscal`; em `tests/nucleo/rn-012-d
           iarias.test.ts` `RN-012 › h1 14/07 "2 diarias" 480,00 e h2 15/
           07 "1 diaria" 200,00 → h1 APROVADO 480,00, h2 PARCIAL 10,00` e
            `RN-012 › diarias só é preenchido em hospedagem que chegou ao
            limite; limite e em_viagem nulos nas recusadas`; em `tests/nu
           cleo/rn-002-categoria.test.ts` `RN-002 › "ALIMENTACAO" e "alim
           entacao" na mesma data somam no mesmo limite diário`; em `test
           s/nucleo/rn-004-valor-nao-positivo.test.ts` `RN-004 › d-009 nã
           o afeta as despesas de transporte de 2026-07-11`
      136 -  - **Commit:** `<hash preenchido depois>`                    
      136 +  - **Commit:** `b2f1c4d`                                     
      137  
      138  - [ ] **T-023** — [P] Criar `src/nucleo/motivos.ts`: `montarMo
           tivo(codigo, detalhes)` → `{ codigo, descricao }` com um model
           o de texto por código da seção 4, valores via `formatarReais`;
            códigos de limite citam limite aplicado, saldo disponível e v
           alor cortado; `DUPLICATA` cita o `id` aceito sem falar em frau
           de/suspeita. Ligar no `motor.ts`
      139    - **Atende:** RN-013, RN-007
  ⎿  (timeout 3m)

● Pass 2 is done. Next is T-023, the reason texts (motivos.ts). I'll tighten
  Recusa.detalhes into a typed DetalhesMotivo, so each reason template reads
  fields that are guaranteed to exist.

  Ran 1 shell command (ctrl+o to expand)

● I'll make Recusa a union keyed by codigo, where each variant has its own typed
  detalhes.

  Read 1 file (ctrl+o to expand)

● Update(src\nucleo\tipos.ts)
  ⎿  Added 34 lines, removed 12 lines
       73    | 'DUPLICATA'
       74    | 'NOTA_FISCAL_AUSENTE';
       75  
       76 +/** Códigos da etapa de limite (seção 8, etapa 9). */         
       77 +export type CodigoLimite = 'APROVADO_INTEGRAL' | 'LIMITE_DIARI
          +O_EXCEDIDO' | 'LIMITE_DIARIO_ESGOTADO';                       
       78 +                                                              
       79  /** Códigos de recusa das etapas 1 a 7 (seção 8 da spec). */
       77 -export type CodigoRecusa = Exclude<                           
       78 -  CodigoMotivo,                                               
       79 -  'APROVADO_INTEGRAL' | 'LIMITE_DIARIO_EXCEDIDO' | 'LIMITE_DIA
          -RIO_ESGOTADO'                                                 
       80 ->;                                                            
       80 +export type CodigoRecusa = Exclude<CodigoMotivo, CodigoLimite>
          +;                                                             
       81  
       82 -export interface Recusa {                                     
       83 -  readonly codigo: CodigoRecusa;                              
       84 -  /** Dados para a descrição (ex.: `idAceito` da duplicata, da
          -tas do período). */                                           
       85 -  readonly detalhes: Readonly<Record<string, unknown>>;       
       86 -}                                                             
       82 +/** Por que a RN-003 recusou. */                              
       83 +export type ProblemaDado = 'nao_objeto' | 'ausente' | 'data_in
          +valida' | 'nao_numerico' | 'nao_booleano' | 'repetido';       
       84  
       85 +/** Recusa de uma etapa, com os dados para a descrição do moti
          +vo (RN-013). */                                               
       86 +export type Recusa =                                          
       87 +  | { readonly codigo: 'DADO_INVALIDO'; readonly detalhes: { r
          +eadonly campo: string; readonly problema: ProblemaDado } }    
       88 +  | { readonly codigo: 'VALOR_NAO_POSITIVO'; readonly detalhes
          +: { readonly valor: Centavos } }                              
       89 +  | {                                                         
       90 +      readonly codigo: 'FORA_DO_PERIODO';                     
       91 +      readonly detalhes: { readonly data: DataISO; readonly in
          +icio: DataISO; readonly fim: DataISO };                       
       92 +    }                                                         
       93 +  | { readonly codigo: 'CATEGORIA_NAO_REEMBOLSAVEL'; readonly 
          +detalhes: { readonly categoria: string } }                    
       94 +  | { readonly codigo: 'DUPLICATA'; readonly detalhes: { reado
          +nly idAceito: string } }                                      
       95 +  | { readonly codigo: 'NOTA_FISCAL_AUSENTE'; readonly detalhe
          +s: { readonly valor: Centavos; readonly limiar: Centavos } }; 
       96 +                                                              
       97  /** Recusa da RN-003: leva os ecos brutos e o valor, se numéri
           co (AMB-023). */
       89 -export interface RecusaDadoInvalido extends Recusa {          
       90 -  readonly codigo: 'DADO_INVALIDO';                           
       91 -  readonly detalhes: { readonly campo: string; readonly proble
          -ma: string };                                                 
       98 +export type RecusaDadoInvalido = Extract<Recusa, { codigo: 'DA
          +DO_INVALIDO' }> & {                                           
       99    /** Como vieram; ausente → `null`. */
      100    readonly eco: { readonly id: unknown; readonly data: unknown
           ; readonly categoria: unknown };
      101    readonly valorSolicitado: Centavos | null;
      102 +};                                                            
      103 +                                                              
      104 +/** Decisão da etapa de limite, com os números para a descriçã
          +o (RN-013). */                                                
      105 +export interface DecisaoLimite {                              
      106 +  readonly codigo: CodigoLimite;                              
      107 +  readonly detalhes: {                                        
      108 +    readonly categoria: Categoria;                            
      109 +    readonly data: DataISO;                                   
      110 +    readonly diarias: number;                                 
      111 +    readonly limite: Centavos;                                
      112 +    readonly saldoDisponivel: Centavos;                       
      113 +    readonly saldoApos: Centavos;                             
      114 +    readonly solicitado: Centavos;                            
      115 +    readonly reembolsavel: Centavos;                          
      116 +  };                                                          
      117  }
      118  
      119  /** Fatia de despesa elegível que consome limite de uma data (
           RN-012). */

  Ran 2 shell commands (ctrl+o to expand)

● Update(tests\nucleo\rn-006-categorias.test.ts)
  ⎿  Added 1 line, removed 2 lines
       5  describe('RN-006 — Categorias reembolsáveis', () => {
       6    it('RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBOL
          SAVEL', () => {
       7      const r = verificarCategoria(valida({ id: 'd-005', categori
          a: 'coworking', valor: 89 }));
       8 -    expect(r?.codigo).toBe('CATEGORIA_NAO_REEMBOLSAVEL');      
       9 -    expect(r?.detalhes.categoria).toBe('coworking');           
       8 +    expect(r).toEqual({ codigo: 'CATEGORIA_NAO_REEMBOLSAVEL', d
         +etalhes: { categoria: 'coworking' } });                        
       9    });
      10  
      11    it('RN-006 › alimentacao, transporte_urbano e hospedagem são 
          reembolsáveis', () => {

● Now motivos.ts, one template per code.

● Write(src\nucleo\motivos.ts)
  ⎿  Wrote 57 lines to src\nucleo\motivos.ts
      1 // Justificativa de cada item (RN-013): um modelo de texto por có
        digo da seção 4.
      3 import { formatarReais } from './dinheiro.ts';
      4 import type { Categoria, CodigoMotivo, DecisaoLimite, Motivo, Pro
        blemaDado, Recusa } from './tipos.ts';
      6 /** O que decidiu o item: a recusa de uma etapa ou a decisão do l
        imite. */
      7 export type Decisao = Recusa | DecisaoLimite;
      9 type Modelos = { [C in CodigoMotivo]: (detalhes: Extract<Decisao,
         { codigo: C }>['detalhes']) => string };
     … +76 lines (ctrl+o to expand)

● Now I'll wire it into the motor.

  Ran 1 shell command (ctrl+o to expand)

● DecisaoLimite has a union codigo, so Extract gives never for the limit codes.
  I'll map the details type per code explicitly.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && node - <<'EOF'
      const fs = require('fs');…)
  ⎿  Updated src\nucleo\motivos.ts (+6 -2)
       1  // Justificativa de cada item (RN-013): um modelo de texto por 
          código da seção 4.
       2  
       3  import { formatarReais } from './dinheiro.ts';
       4 -import type { Categoria, CodigoMotivo, DecisaoLimite, Motivo, P
         -roblemaDado, Recusa } from './tipos.ts';                       
       4 +import type { Categoria, CodigoLimite, CodigoMotivo, DecisaoLim
         +ite, Motivo, ProblemaDado, Recusa } from './tipos.ts';         
       5  
       6  /** O que decidiu o item: a recusa de uma etapa ou a decisão do
           limite. */
       7  export type Decisao = Recusa | DecisaoLimite;
       8  
       9 -type Modelos = { [C in CodigoMotivo]: (detalhes: Extract<Decisa
         -o, { codigo: C }>['detalhes']) => string };                    
       9 +type DetalhesDe<C extends CodigoMotivo> = C extends CodigoLimit
         +e                                                              
      10 +  ? DecisaoLimite['detalhes']                                  
      11 +  : Extract<Recusa, { codigo: C }>['detalhes'];                
      12 +                                                               
      13 +type Modelos = { [C in CodigoMotivo]: (detalhes: DetalhesDe<C>)
         + => string };                                                  
      14  
      15  const NOME_CATEGORIA: Record<Categoria, string> = {
      16    alimentacao: 'alimentação',

● Types check. Now the RN-013 tests, plus the RN-007 description test, which
  goes in the RN-007 file (one test file per RN).

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      tests/nucleo/rn-013-motivos.test.ts <<'EOF'
      import { describe, expect, it } from 'vitest';…)
  ⎿  Updated tests\nucleo\rn-007-duplicatas.test.ts (+9 -1)
      1  import { describe, expect, it } from 'vitest';
      2  import { verificarDuplicata } from '../../src/nucleo/elegibilida
         de.ts';
      3  import type { ChavesDuplicata } from '../../src/nucleo/elegibili
         dade.ts';
      4 -import { codigosPassada1, entrada, valida } from '../apoio.ts'; 
      4 +import { codigosPassada1, entrada, rodar, valida } from '../apoi
        +o.ts';                                                          
      5  
      6  /** Códigos da etapa 6 para as despesas em sequência (`null` = s
         egue). */
      7  function codigos(...campos: Record<string, unknown>[]): (string 
         | null)[] {
     ...
       89        'DUPLICATA',
       90      ]);
       91    });
       92 +                                                              
       93 +  it('RN-007 › descrição de DUPLICATA cita o id da ocorrência 
          +aceita', () => {                                              
       94 +    const d006 = { id: 'd-006', data: '2026-07-09', fornecedor
          +: 'Bistro Central', valor: 54.9 };                            
       95 +    const [, d007] = rodar([d006, { ...d006, id: 'd-007' }]); 
       96 +    expect(d007?.motivo.codigo).toBe('DUPLICATA');            
       97 +    expect(d007?.motivo.descricao).toContain("'d-006'");      
       98 +    expect(d007?.motivo.descricao).not.toMatch(/fraude|suspeit
          +|má-fé|irregular/i);                                          
       99 +  });                                                         
      100  });
  ⎿  Created tests\nucleo\rn-013-motivos.test.ts (+69 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { MODELOS, montarMotivo } from '../../src/nucleo/motivos
         +.ts';                                                          
       3 +import type { Decisao } from '../../src/nucleo/motivos.ts';    
       4 +import { rodar } from '../apoio.ts';                           
       5 +                                                               
       6 +const LIMITE = {                                               
       7 +  categoria: 'alimentacao',                                    
       8 +  data: '2026-07-03',                                          
       9 +  diarias: 1,                                                  
      10 +  limite: 6000n,                                               
      11 +  saldoDisponivel: 1500n,                                      
      12 +  saldoApos: 0n,                                               
      13 +  solicitado: 3000n,                                           
      14 +  reembolsavel: 1500n,                                         
      15 +} as const;                                                    
      16 +                                                               
      17 +/** Uma decisão de exemplo para cada código da tabela da seção 
         +4. */                                                          
      18 +const EXEMPLOS: Decisao[] = [                                  
      19 +  { codigo: 'APROVADO_INTEGRAL', detalhes: { ...LIMITE, reembol
         +savel: 3000n } },                                              
      20 +  { codigo: 'LIMITE_DIARIO_EXCEDIDO', detalhes: LIMITE },      
      21 +  { codigo: 'LIMITE_DIARIO_ESGOTADO', detalhes: { ...LIMITE, sa
         +ldoDisponivel: 0n, reembolsavel: 0n } },                       
      22 +  { codigo: 'DADO_INVALIDO', detalhes: { campo: 'data', problem
         +a: 'data_invalida' } },                                        
      23 +  { codigo: 'VALOR_NAO_POSITIVO', detalhes: { valor: -4500n } }
         +,                                                              
      24 +  { codigo: 'FORA_DO_PERIODO', detalhes: { data: '2026-04-15', 
         +inicio: '2026-07-01', fim: '2026-07-31' } },                   
      25 +  { codigo: 'CATEGORIA_NAO_REEMBOLSAVEL', detalhes: { categoria
         +: 'coworking' } },                                             
      26 +  { codigo: 'DUPLICATA', detalhes: { idAceito: 'd-006' } },    
      27 +  { codigo: 'NOTA_FISCAL_AUSENTE', detalhes: { valor: 10001n, l
         +imiar: 10000n } },                                             
      28 +];                                                             
      29 +                                                               
      30 +describe('RN-013 — Justificativa obrigatória', () => {         
      31 +  it('RN-013 › todo código da seção 4 gera descrição não vazia'
         +, () => {                                                      
      32 +    expect(Object.keys(MODELOS).sort()).toEqual(EXEMPLOS.map((e
         +) => e.codigo).sort());                                        
      33 +    for (const decisao of EXEMPLOS) {                          
      34 +      const m = montarMotivo(decisao);                         
      35 +      expect(m.codigo).toBe(decisao.codigo);                   
      36 +      expect(m.descricao.trim(), decisao.codigo).not.toBe(''); 
      37 +    }                                                          
      38 +    for (const problema of ['nao_objeto', 'ausente', 'data_inva
         +lida', 'nao_numerico', 'nao_booleano', 'repetido'] as const) { 
      39 +      expect(montarMotivo({ codigo: 'DADO_INVALIDO', detalhes: 
         +{ campo: 'id', problema } }).descricao, problema).not.toBe('');
      40 +    }                                                          
     … 29 more lines (ctrl+o to expand)

● Everything passes. The EXCEDIDO test ended up convoluted, so I'll simplify it
  before committing.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && node - <<'EOF'
      const fs = require('fs');…)
  ⎿  Updated tests\nucleo\rn-013-motivos.test.ts (+5 -10)
      41    });
      42  
      43    it('RN-013 › LIMITE_DIARIO_EXCEDIDO cita limite, saldo dispon
          ível e valor cortado', () => {
      44 -    const [d001, , b] = rodar([                                
      45 -      { id: 'd-001', valor: 72.5, fornecedor: 'Tavola' },      
      46 -      { id: 'd-002', valor: 38, fornecedor: 'Porto' },         
      47 -      { id: 'b', data: '2026-07-04', valor: 45 },              
      48 -      { id: 'c', data: '2026-07-04', valor: 30, fornecedor: 'Y'
         - },                                                            
      49 -    ]).filter((i) => i.motivo.codigo !== 'LIMITE_DIARIO_ESGOTAD
         -O' || i.id === 'd-002');                                       
      50 -    expect(d001?.motivo.descricao).toMatch(/R\$ 60,00.*saldo di
         -sponível R\$ 60,00.*R\$ 12,50/);                               
      51 -    expect(b?.motivo.codigo).toBe('APROVADO_INTEGRAL');        
      52 -    const [, c] = rodar([{ id: 'b', valor: 45 }, { id: 'c', val
         -or: 30, fornecedor: 'Y' }]);                                   
      53 -    expect(c?.motivo.descricao).toMatch(/R\$ 60,00.*saldo dispo
         -nível R\$ 15,00.*excedente de R\$ 15,00/);                     
      44 +    const [d001] = rodar([{ id: 'd-001', valor: 72.5 }]);      
      45 +    expect(d001?.motivo.descricao).toMatch(/R$ 60,00.*saldo dis
         +ponível R$ 60,00.*excedente de R$ 12,50/);                     
      46 +    const [, b] = rodar([{ id: 'a', valor: 45 }, { id: 'b', val
         +or: 30, fornecedor: 'Y' }]);                                   
      47 +    expect(b?.motivo.codigo).toBe('LIMITE_DIARIO_EXCEDIDO');   
      48 +    expect(b?.motivo.descricao).toMatch(/R$ 60,00.*saldo dispon
         +ível R$ 15,00.*excedente de R$ 15,00/);                        
      49    });
      50  
      51    it('RN-013 › LIMITE_DIARIO_ESGOTADO cita o limite e o saldo z
          erado', () => {

  Ran 1 shell command (ctrl+o to expand)

● The shell escaping dropped the \$ in the regexes, so I'll fix them with Edit.

● Update(tests\nucleo\rn-013-motivos.test.ts)
  ⎿  Added 1 line, removed 1 line
      42  
      43    it('RN-013 › LIMITE_DIARIO_EXCEDIDO cita limite, saldo dispon
          ível e valor cortado', () => {
      44      const [d001] = rodar([{ id: 'd-001', valor: 72.5 }]);
      45 -    expect(d001?.motivo.descricao).toMatch(/R$ 60,00.*saldo dis
         -ponível R$ 60,00.*excedente de R$ 12,50/);                     
      45 +    expect(d001?.motivo.descricao).toMatch(/R\$ 60,00.*saldo di
         +sponível R\$ 60,00.*excedente de R\$ 12,50/);                  
      46      const [, b] = rodar([{ id: 'a', valor: 45 }, { id: 'b', val
          or: 30, fornecedor: 'Y' }]);
      47      expect(b?.motivo.codigo).toBe('LIMITE_DIARIO_EXCEDIDO');
      48      expect(b?.motivo.descricao).toMatch(/R$ 60,00.*saldo dispon
          ível R$ 15,00.*excedente de R$ 15,00/);

● Update(tests\nucleo\rn-013-motivos.test.ts)
  ⎿  Added 1 line, removed 1 line
      45      expect(d001?.motivo.descricao).toMatch(/R\$ 60,00.*saldo di
          sponível R\$ 60,00.*excedente de R\$ 12,50/);
      46      const [, b] = rodar([{ id: 'a', valor: 45 }, { id: 'b', val
          or: 30, fornecedor: 'Y' }]);
      47      expect(b?.motivo.codigo).toBe('LIMITE_DIARIO_EXCEDIDO');
      48 -    expect(b?.motivo.descricao).toMatch(/R$ 60,00.*saldo dispon
         -ível R$ 15,00.*excedente de R$ 15,00/);                        
      48 +    expect(b?.motivo.descricao).toMatch(/R\$ 60,00.*saldo dispo
         +nível R\$ 15,00.*excedente de R\$ 15,00/);                     
      49    });
      50  
      51    it('RN-013 › LIMITE_DIARIO_ESGOTADO cita o limite e o saldo z
          erado', () => {

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/f8a7bb5f-129f-4039-97c7…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      135    - **Aceite:** chamando o motor em memória, passam em `tests/
           nucleo/rn-011-viagem.test.ts` `RN-011 › alimentação de 80,00 n
           a data de hospedagem elegível → APROVADO 80,00 (limite 90,00)`
           , `RN-011 › hospedagem de 1 diária em D e alimentação 80,00 em
            D+1 → PARCIAL 60,00`, `RN-011 › hospedagem de 2 diárias em D 
           e alimentação 80,00 em D+1 → APROVADO 80,00` e `RN-011 › d-013
            recusada por NF não torna 22 a 24/07 dias de viagem`; em `tes
           ts/nucleo/rn-008-nota-fiscal.test.ts` `RN-008 › dia de viagem 
           não amplia o limiar de nota fiscal`; em `tests/nucleo/rn-012-d
           iarias.test.ts` `RN-012 › h1 14/07 "2 diarias" 480,00 e h2 15/
           07 "1 diaria" 200,00 → h1 APROVADO 480,00, h2 PARCIAL 10,00` e
            `RN-012 › diarias só é preenchido em hospedagem que chegou ao
            limite; limite e em_viagem nulos nas recusadas`; em `tests/nu
           cleo/rn-002-categoria.test.ts` `RN-002 › "ALIMENTACAO" e "alim
           entacao" na mesma data somam no mesmo limite diário`; em `test
           s/nucleo/rn-004-valor-nao-positivo.test.ts` `RN-004 › d-009 nã
           o afeta as despesas de transporte de 2026-07-11`
      136    - **Commit:** `b2f1c4d`
      137  
      138 -- [ ] **T-023** — [P] Criar `src/nucleo/motivos.ts`: `montarMo
          -tivo(codigo, detalhes)` → `{ codigo, descricao }` com um model
          -o de texto por código da seção 4, valores via `formatarReais`;
          - códigos de limite citam limite aplicado, saldo disponível e v
          -alor cortado; `DUPLICATA` cita o `id` aceito sem falar em frau
          -de/suspeita. Ligar no `motor.ts`                              
      138 +- [x] **T-023** — [P] Criar `src/nucleo/motivos.ts`: `montarMo
          +tivo(codigo, detalhes)` → `{ codigo, descricao }` com um model
          +o de texto por código da seção 4, valores via `formatarReais`;
          + códigos de limite citam limite aplicado, saldo disponível e v
          +alor cortado; `DUPLICATA` cita o `id` aceito sem falar em frau
          +de/suspeita. Ligar no `motor.ts`                              
      139    - **Atende:** RN-013, RN-007
      140    - **Aceite:** em `tests/nucleo/rn-013-motivos.test.ts` passa
           m `RN-013 › todo código da seção 4 gera descrição não vazia`, 
           `RN-013 › LIMITE_DIARIO_EXCEDIDO cita limite, saldo disponível
            e valor cortado`, `RN-013 › LIMITE_DIARIO_ESGOTADO cita o lim
           ite e o saldo zerado` e `RN-007 › descrição de DUPLICATA cita 
           o id da ocorrência aceita`
      141 -  - **Commit:** `<hash preenchido depois>`                    
      141 +  - **Commit:** `2761b61`                                     
      142  
      143  - [ ] **T-024** — Criar `src/nucleo/resumo.ts` e ligá-lo no `m
           otor.ts`: contagens por status; `total_solicitado` soma só `va
           lor_solicitado` positivo e não nulo; `total_reembolsavel` soma
            todos os itens; `total_nao_reembolsado = total_solicitado − t
           otal_reembolsavel` em centavos
      144    - **Atende:** RN-014, AMB-012, AMB-023
  ⎿  (timeout 3m)
● T-024: the summary (resumo), plus calcular(entrada) in the motor.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      src/nucleo/resumo.ts <<'EOF'
      // Totais do resumo (RN-014).…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      140    - **Aceite:** em `tests/nucleo/rn-013-motivos.test.ts` passa
           m `RN-013 › todo código da seção 4 gera descrição não vazia`, 
           `RN-013 › LIMITE_DIARIO_EXCEDIDO cita limite, saldo disponível
            e valor cortado`, `RN-013 › LIMITE_DIARIO_ESGOTADO cita o lim
           ite e o saldo zerado` e `RN-007 › descrição de DUPLICATA cita 
           o id da ocorrência aceita`
      141    - **Commit:** `2761b61`
      142  
      143 -- [ ] **T-024** — Criar `src/nucleo/resumo.ts` e ligá-lo no `m
          -otor.ts`: contagens por status; `total_solicitado` soma só `va
          -lor_solicitado` positivo e não nulo; `total_reembolsavel` soma
          - todos os itens; `total_nao_reembolsado = total_solicitado − t
          -otal_reembolsavel` em centavos                                
      143 +- [x] **T-024** — Criar `src/nucleo/resumo.ts` e ligá-lo no `m
          +otor.ts`: contagens por status; `total_solicitado` soma só `va
          +lor_solicitado` positivo e não nulo; `total_reembolsavel` soma
          + todos os itens; `total_nao_reembolsado = total_solicitado − t
          +otal_reembolsavel` em centavos                                
      144    - **Atende:** RN-014, AMB-012, AMB-023
      145    - **Aceite:** em `tests/nucleo/rn-014-resumo.test.ts` passam
            `RN-014 › soma de valor_reembolsavel dos itens = total_reembo
           lsavel e contagens somam quantidade_itens`, `RN-014 › total_so
           licitado ignora valores não positivos e nulos`, `RN-014 › tota
           l_nao_reembolsado = total_solicitado − total_reembolsavel, exa
           to em centavos` e `RN-014 › lista vazia → contagens 0 e totais
            0,00`
      146 -  - **Commit:** `<hash preenchido depois>`                    
      146 +  - **Commit:** `9ebda81`                                     
      147  
      148  - [ ] **T-025** — [P] Criar `src/io/entrada.ts` com `validarEn
           trada(json)` → `Entrada` ou lança `ErroEntrada { mensagem }`: 
           exige que o JSON seja objeto, `colaborador.id`, `periodo.inici
           o` e `periodo.fim` (datas válidas pela T-004, `inicio ≤ fim`) 
           e `despesas` como lista; `colaborador.id`/`periodo.inicio`/`pe
           riodo.fim` vazios, só com espaços, nulos ou não textuais conta
           m como ausentes, e `colaborador`/`periodo` que não são objeto 
           têm todos os campos ausentes (AMB-027); a mensagem cita o camp
           o ou o problema. `colaborador`/`periodo` guardados brutos para
            eco
      149    - **Atende:** RN-015, AMB-018, AMB-027
  ⎿  Updated src\nucleo\motor.ts (+8 -0)
      14  import { alocar } from './limites.ts';
      15  import type { Alocacao } from './limites.ts';
      16  import { montarMotivo } from './motivos.ts';
      17 +import { calcularResumo } from './resumo.ts';                  
      18  import type {
      19    Categoria,
      20    DespesaElegivel,
     ...
      22    Entrada,
      23    Recusa,
      24    RecusaDadoInvalido,
      25 +  Resultado,                                                   
      26    ResultadoItem,
      27  } from './tipos.ts';
      28  import { diasDeViagem } from './viagem.ts';
     ...
      112  
      113  /** Recusada antes da etapa de limite (seção 4). */
      114  const foraDoLimite = { limiteDiarioAplicado: null, emViagem: n
           ull, diarias: null } as const;
      115 +                                                              
      116 +/** Resultado completo: ecos, itens na ordem da entrada e resu
          +mo (RN-014). */                                               
      117 +export function calcular(entrada: Entrada): Resultado {       
      118 +  const itens = calcularItens(entrada);                       
      119 +  return { colaborador: entrada.colaborador, periodo: entrada.
          +periodo, itens, resumo: calcularResumo(itens) };              
      120 +}                                                             
  ⎿  Created src\nucleo\resumo.ts (+25 -0)
       1 +// Totais do resumo (RN-014).                                  
       2 +                                                               
       3 +import { statusDe } from './status.ts';                        
       4 +import type { ResultadoItem, Resumo } from './tipos.ts';       
       5 +                                                               
       6 +export function calcularResumo(itens: readonly ResultadoItem[])
         +: Resumo {                                                     
       7 +  const contagem = { APROVADO: 0, PARCIAL: 0, RECUSADO: 0 };   
       8 +  let totalSolicitado = 0n;                                    
       9 +  let totalReembolsavel = 0n;                                  
      10 +  for (const item of itens) {                                  
      11 +    contagem[statusDe(item)]++;                                
      12 +    // Só valor positivo e não nulo entra no solicitado (RN-004
         +, AMB-012, AMB-023).                                           
      13 +    if (item.valorSolicitado !== null && item.valorSolicitado >
         + 0n) totalSolicitado += item.valorSolicitado;                  
      14 +    totalReembolsavel += item.valorReembolsavel;               
      15 +  }                                                            
      16 +  return {                                                     
      17 +    quantidadeItens: itens.length,                             
      18 +    aprovados: contagem.APROVADO,                              
      19 +    parciais: contagem.PARCIAL,                                
      20 +    recusados: contagem.RECUSADO,                              
      21 +    totalSolicitado,                                           
      22 +    totalReembolsavel,                                         
      23 +    totalNaoReembolsado: totalSolicitado - totalReembolsavel,  
      24 +  };                                                           
      25 +}                                                              
  ⎿  Created tests\nucleo\rn-014-resumo.test.ts (+48 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { calcular } from '../../src/nucleo/motor.ts';          
       3 +import { cru, entrada } from '../apoio.ts';                    
       4 +                                                               
       5 +const variado = entrada([                                      
       6 +  { id: 'a', valor: 72.5 },                                    
       7 +  { id: 'b', valor: 38, fornecedor: 'Y' },                     
       8 +  { id: 'c', valor: -45 },                                     
       9 +  { id: 'd', valor: 0 },                                       
      10 +  { id: 'e', valor: 'R$ 45,00' },                              
      11 +  { id: 'f', data: '2026-07-32', valor: 10 },                  
      12 +  { id: 'g', categoria: 'transporte_urbano', valor: 33.333 },  
      13 +  cru('42'),                                                   
      14 +]);                                                            
      15 +                                                               
      16 +describe('RN-014 — Totais do resumo', () => {                  
      17 +  it('RN-014 › soma de valor_reembolsavel dos itens = total_ree
         +mbolsavel e contagens somam quantidade_itens', () => {         
      18 +    const { itens, resumo } = calcular(variado);               
      19 +    expect(resumo.totalReembolsavel).toBe(itens.reduce((s, i) =
         +> s + i.valorReembolsavel, 0n));                               
      20 +    expect(resumo.quantidadeItens).toBe(8);                    
      21 +    expect(resumo.aprovados + resumo.parciais + resumo.recusado
         +s).toBe(resumo.quantidadeItens);                               
      22 +    expect([resumo.aprovados, resumo.parciais, resumo.recusados
         +]).toEqual([1, 1, 6]);                                         
      23 +  });                                                          
      24 +                                                               
      25 +  it('RN-014 › total_solicitado ignora valores não positivos e 
         +nulos', () => {                                                
      26 +    // a 72,50 + b 38,00 + f 10,00 (recusada, mas com valor num
         +érico) + g 33,33                                               
      27 +    expect(calcular(variado).resumo.totalSolicitado).toBe(7250n
         + + 3800n + 1000n + 3333n);                                     
      28 +  });                                                          
      29 +                                                               
      30 +  it('RN-014 › total_nao_reembolsado = total_solicitado − total
         +_reembolsavel, exato em centavos', () => {                     
      31 +    const { resumo } = calcular(variado);                      
      32 +    expect(resumo.totalReembolsavel).toBe(6000n + 3333n);      
      33 +    expect(resumo.totalNaoReembolsado).toBe(resumo.totalSolicit
         +ado - resumo.totalReembolsavel);                               
      34 +    expect(resumo.totalNaoReembolsado).toBe(6050n);            
      35 +  });                                                          
      36 +                                                               
      37 +  it('RN-014 › lista vazia → contagens 0 e totais 0,00', () => 
         +{                                                              
      38 +    expect(calcular(entrada([])).resumo).toEqual({             
      39 +      quantidadeItens: 0,                                      
      40 +      aprovados: 0,                                            
     … 8 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-025: validating the input file (io/entrada.ts, RN-015). Besides
  validarEntrada(json), I'll expose lerEntrada(texto), so invalid JSON also
  turns into ErroEntrada.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat > src/io/entrada.ts
      <<'EOF'
      // Arquivo de entrada (RN-015, AMB-027): o que falha aqui aborta a
      execução.…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      145    - **Aceite:** em `tests/nucleo/rn-014-resumo.test.ts` passam
            `RN-014 › soma de valor_reembolsavel dos itens = total_reembo
           lsavel e contagens somam quantidade_itens`, `RN-014 › total_so
           licitado ignora valores não positivos e nulos`, `RN-014 › tota
           l_nao_reembolsado = total_solicitado − total_reembolsavel, exa
           to em centavos` e `RN-014 › lista vazia → contagens 0 e totais
            0,00`
      146    - **Commit:** `9ebda81`
      147  
      148 -- [ ] **T-025** — [P] Criar `src/io/entrada.ts` com `validarEn
          -trada(json)` → `Entrada` ou lança `ErroEntrada { mensagem }`: 
          -exige que o JSON seja objeto, `colaborador.id`, `periodo.inici
          -o` e `periodo.fim` (datas válidas pela T-004, `inicio ≤ fim`) 
          -e `despesas` como lista; `colaborador.id`/`periodo.inicio`/`pe
          -riodo.fim` vazios, só com espaços, nulos ou não textuais conta
          -m como ausentes, e `colaborador`/`periodo` que não são objeto 
          -têm todos os campos ausentes (AMB-027); a mensagem cita o camp
          -o ou o problema. `colaborador`/`periodo` guardados brutos para
          - eco                                                          
      148 +- [x] **T-025** — [P] Criar `src/io/entrada.ts` com `validarEn
          +trada(json)` → `Entrada` ou lança `ErroEntrada { mensagem }`: 
          +exige que o JSON seja objeto, `colaborador.id`, `periodo.inici
          +o` e `periodo.fim` (datas válidas pela T-004, `inicio ≤ fim`) 
          +e `despesas` como lista; `colaborador.id`/`periodo.inicio`/`pe
          +riodo.fim` vazios, só com espaços, nulos ou não textuais conta
          +m como ausentes, e `colaborador`/`periodo` que não são objeto 
          +têm todos os campos ausentes (AMB-027); a mensagem cita o camp
          +o ou o problema. `colaborador`/`periodo` guardados brutos para
          + eco                                                          
      149    - **Atende:** RN-015, AMB-018, AMB-027
      150    - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `R
           N-015 › sem periodo → erro cuja mensagem cita periodo`, `RN-01
           5 › sem colaborador.id → erro cuja mensagem cita colaborador.i
           d`, `RN-015 › periodo.inicio ou periodo.fim inválidos → erro`,
            `RN-015 › inicio depois de fim → erro`, `RN-015 › despesas au
           sente ou que não é lista → erro cuja mensagem cita despesas`, 
           `RN-015 › texto que não é JSON → erro`, `RN-015 › despesas: []
            é entrada válida`, `RN-015 › colaborador.id "", "  ", null ou
            123 → erro cuja mensagem cita colaborador.id`, `RN-015 › peri
           odo.inicio 20260701 ou null → erro cuja mensagem cita periodo.
           inicio`, `RN-015 › colaborador ou periodo que não é objeto → e
           rro` e `RN-015 › JSON que não é objeto ([], 42, "x") → erro`
      151 -  - **Commit:** `<hash preenchido depois>`                    
      151 +  - **Commit:** `358b59f`                                     
      152  
      153  ## Fase 3 — Casos de borda
      154  
  ⎿  Created src\io\entrada.ts (+59 -0)
       1 +// Arquivo de entrada (RN-015, AMB-027): o que falha aqui abort
         +a a execução.                                                  
       2 +                                                               
       3 +import { ehDataValida } from '../nucleo/datas.ts';             
       4 +import { NumeroJson } from '../nucleo/tipos.ts';               
       5 +import type { DataISO, Entrada } from '../nucleo/tipos.ts';    
       6 +import { lerJson } from './json.ts';                           
       7 +                                                               
       8 +export class ErroEntrada extends Error {                       
       9 +  override name = 'ErroEntrada';                               
      10 +}                                                              
      11 +                                                               
      12 +type Objeto = Readonly<Record<string, unknown>>;               
      13 +                                                               
      14 +function ehObjeto(v: unknown): v is Objeto {                   
      15 +  return typeof v === 'object' && v !== null && !Array.isArray(
         +v) && !(v instanceof NumeroJson);                              
      16 +}                                                              
      17 +                                                               
      18 +/** Vazio, só espaços, nulo ou outro tipo que não texto contam 
         +como ausentes (AMB-027). */                                    
      19 +function textoPreenchido(v: unknown): v is string {            
      20 +  return typeof v === 'string' && v.trim() !== '';             
      21 +}                                                              
      22 +                                                               
      23 +function data(periodo: Objeto, campo: 'inicio' | 'fim'): DataIS
         +O {                                                            
      24 +  const v = periodo[campo];                                    
      25 +  if (!textoPreenchido(v)) throw new ErroEntrada(`periodo.${cam
         +po} ausente, vazio ou não é texto`);                           
      26 +  if (!ehDataValida(v)) throw new ErroEntrada(`periodo.${campo}
         + não é uma data válida no formato AAAA-MM-DD: "${v}"`);        
      27 +  return v;                                                    
      28 +}                                                              
      29 +                                                               
      30 +/** JSON já lido → `Entrada`, ou `ErroEntrada` com mensagem que
         + cita o campo. */                                              
      31 +export function validarEntrada(json: unknown): Entrada {       
      32 +  if (!ehObjeto(json)) throw new ErroEntrada('o conteúdo do arq
         +uivo não é um objeto JSON');                                   
      33 +                                                               
      34 +  const colaborador = json.colaborador;                        
      35 +  const idColaborador = ehObjeto(colaborador) ? colaborador.id 
         +: undefined;                                                   
      36 +  if (!textoPreenchido(idColaborador)) throw new ErroEntrada('c
         +olaborador.id ausente, vazio ou não é texto');                 
      37 +                                                               
      38 +  const periodo = json.periodo;                                
      39 +  if (!ehObjeto(periodo)) throw new ErroEntrada('periodo ausent
         +e ou não é um objeto (periodo.inicio e periodo.fim)');         
      40 +  const inicio = data(periodo, 'inicio');                      
     … 19 more lines (ctrl+o to expand)
  ⎿  Created tests\io\rn-015-entrada.test.ts (+95 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { ErroEntrada, lerEntrada } from '../../src/io/entrada.t
         +s';                                                            
       3 +                                                               
       4 +const VALIDO = {                                               
       5 +  colaborador: { id: 'c-0417', nome: 'Marina' },               
       6 +  periodo: { competencia: '2026-07', inicio: '2026-07-01', fim:
         + '2026-07-31' },                                               
       7 +  despesas: [],                                                
       8 +};                                                             
       9 +                                                               
      10 +/** Entrada válida com trocas no primeiro nível ou em `colabora
         +dor`/`periodo` (`undefined` remove). */                        
      11 +function arquivo(trocas: { raiz?: Record<string, unknown>; cola
         +borador?: Record<string, unknown>; periodo?: Record<string, unk
         +nown> }): string {                                             
      12 +  return JSON.stringify({                                      
      13 +    ...VALIDO,                                                 
      14 +    colaborador: { ...VALIDO.colaborador, ...trocas.colaborador
         + },                                                            
      15 +    periodo: { ...VALIDO.periodo, ...trocas.periodo },         
      16 +    ...trocas.raiz,                                            
      17 +  });                                                          
      18 +}                                                              
      19 +                                                               
      20 +/** Mensagem do `ErroEntrada` lançado ao ler `texto`. */       
      21 +function erro(texto: string): string {                         
      22 +  try {                                                        
      23 +    lerEntrada(texto);                                         
      24 +  } catch (e) {                                                
      25 +    expect(e).toBeInstanceOf(ErroEntrada);                     
      26 +    return (e as Error).message;                               
      27 +  }                                                            
      28 +  throw new Error(`entrada aceita: ${texto}`);                 
      29 +}                                                              
      30 +                                                               
      31 +describe('RN-015 — Arquivo de entrada inválido', () => {       
      32 +  it('RN-015 › sem periodo → erro cuja mensagem cita periodo', 
         +() => {                                                        
      33 +    expect(erro(arquivo({ raiz: { periodo: undefined } }))).toC
         +ontain('periodo');                                             
      34 +  });                                                          
      35 +                                                               
      36 +  it('RN-015 › sem colaborador.id → erro cuja mensagem cita col
         +aborador.id', () => {                                          
      37 +    expect(erro(arquivo({ colaborador: { id: undefined } }))).t
         +oContain('colaborador.id');                                    
      38 +    expect(erro(arquivo({ raiz: { colaborador: undefined } })))
         +.toContain('colaborador.id');                                  
      39 +  });                                                          
      40 +                                                               
     … 55 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● Phase 2 is done, and Phase 3 covers the edge case tests, which per tasks.md
  should use test(T-NNN) commits — I'll add that option to the commit script.

  Ran 2 shell commands (ctrl+o to expand)

● Now tests/casos-de-borda.test.ts, starting with T-026 (invoice and rounding).

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      tests/casos-de-borda.test.ts <<'EOF'
      // Um teste por linha da tabela da seção 7 da spec, com o título exa…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      157  > por linha da tabela da seção 7, título `Borda › <Caso>`. Se 
           um teste falhar,
      158  > o conserto no código faz parte da mesma task.
      159  
      160 -- [ ] **T-026** — Casos de borda de nota fiscal e arredondamen
          -to em `tests/casos-de-borda.test.ts`                          
      160 +- [x] **T-026** — Casos de borda de nota fiscal e arredondamen
          +to em `tests/casos-de-borda.test.ts`                          
      161    - **Atende:** RN-001, RN-008, RN-010, AMB-004, AMB-013
      162    - **Aceite:** passam `Borda › Nota fiscal no limiar exato`, 
           `Borda › Um centavo acima do limiar`, `Borda › Arredondamento 
           que cruza o limiar`, `Borda › Arredondamento meio-para-o-par n
           o limiar`, `Borda › Meio-para-o-par sobe`, `Borda › Fora do po
           nto médio` e `Borda › Três casas decimais`
      163 -  - **Commit:** `<hash preenchido depois>`                    
      163 +  - **Commit:** `3f72db7`                                     
      164  
      165  - [ ] **T-027** — Casos de borda de limite diário em `tests/ca
           sos-de-borda.test.ts`
      166    - **Atende:** RN-009, RN-010, AMB-001, AMB-002, AMB-015, AMB
           -016
  ⎿  Created tests\casos-de-borda.test.ts (+74 -0)
       1 +// Um teste por linha da tabela da seção 7 da spec, com o títul
         +o exato da coluna "Caso".                                      
       2 +// Período padrão: 2026-07-01 a 2026-07-31.                    
       3 +                                                               
       4 +import { describe, expect, it } from 'vitest';                 
       5 +import { statusDe } from '../src/nucleo/status.ts';            
       6 +import type { ResultadoItem } from '../src/nucleo/tipos.ts';   
       7 +import { rodar } from './apoio.ts';                            
       8 +                                                               
       9 +/** O que a seção 7 verifica em cada item. */                  
      10 +function decisao(i: ResultadoItem | undefined) {               
      11 +  if (!i) throw new Error('item ausente');                     
      12 +  return { status: statusDe(i), codigo: i.motivo.codigo, solici
         +tado: i.valorSolicitado, reembolsavel: i.valorReembolsavel };  
      13 +}                                                              
      14 +                                                               
      15 +const transporteSemNf = { categoria: 'transporte_urbano', tem_n
         +ota_fiscal: false };                                           
      16 +                                                               
      17 +describe('Casos de borda — nota fiscal e arredondamento', () =>
         + {                                                             
      18 +  it('Borda › Nota fiscal no limiar exato', () => {            
      19 +    expect(decisao(rodar([{ ...transporteSemNf, valor: 100 }])[
         +0])).toEqual({                                                 
      20 +      status: 'PARCIAL',                                       
      21 +      codigo: 'LIMITE_DIARIO_EXCEDIDO',                        
      22 +      solicitado: 10000n,                                      
      23 +      reembolsavel: 8000n,                                     
      24 +    });                                                        
      25 +  });                                                          
      26 +                                                               
      27 +  it('Borda › Um centavo acima do limiar', () => {             
      28 +    expect(decisao(rodar([{ ...transporteSemNf, valor: 100.01 }
         +])[0])).toMatchObject({                                        
      29 +      status: 'RECUSADO',                                      
      30 +      codigo: 'NOTA_FISCAL_AUSENTE',                           
      31 +    });                                                        
      32 +  });                                                          
      33 +                                                               
      34 +  it('Borda › Arredondamento que cruza o limiar', () => {      
      35 +    expect(decisao(rodar([{ ...transporteSemNf, valor: 100.004 
         +}])[0])).toEqual({                                             
      36 +      status: 'PARCIAL',                                       
      37 +      codigo: 'LIMITE_DIARIO_EXCEDIDO',                        
      38 +      solicitado: 10000n,                                      
      39 +      reembolsavel: 8000n,                                     
      40 +    });                                                        
     … 34 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-027: daily limit cases.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >>
      tests/casos-de-borda.test.ts <<'EOF'…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      162    - **Aceite:** passam `Borda › Nota fiscal no limiar exato`, 
           `Borda › Um centavo acima do limiar`, `Borda › Arredondamento 
           que cruza o limiar`, `Borda › Arredondamento meio-para-o-par n
           o limiar`, `Borda › Meio-para-o-par sobe`, `Borda › Fora do po
           nto médio` e `Borda › Três casas decimais`
      163    - **Commit:** `3f72db7`
      164  
      165 -- [ ] **T-027** — Casos de borda de limite diário em `tests/ca
          -sos-de-borda.test.ts`                                         
      165 +- [x] **T-027** — Casos de borda de limite diário em `tests/ca
          +sos-de-borda.test.ts`                                         
      166    - **Atende:** RN-009, RN-010, AMB-001, AMB-002, AMB-015, AMB
           -016
      167    - **Aceite:** passam `Borda › Exatamente no limite diário`, 
           `Borda › Um centavo acima do limite`, `Borda › Várias no mesmo
            dia`, `Borda › Recusada não consome limite`, `Borda › Mesmo d
           ia, categorias diferentes` e `Borda › Fim de semana`
      168 -  - **Commit:** `<hash preenchido depois>`                    
      168 +  - **Commit:** `7a4991c`                                     
      169  
      170  - [ ] **T-028** — Casos de borda de período, valor não positiv
           o e categoria em `tests/casos-de-borda.test.ts`
      171    - **Atende:** RN-002, RN-004, RN-005, RN-006, AMB-009, AMB-0
           12, AMB-014, AMB-019
  ⎿  Updated tests\casos-de-borda.test.ts (+47 -0)
       72      });
       73    });
       74  });
       75 +                                                              
       76 +describe('Casos de borda — limite diário', () => {            
       77 +  it('Borda › Exatamente no limite diário', () => {           
       78 +    expect(decisao(rodar([{ valor: 60 }])[0])).toMatchObject({
          + status: 'APROVADO', reembolsavel: 6000n });                  
       79 +  });                                                         
       80 +                                                              
       81 +  it('Borda › Um centavo acima do limite', () => {            
       82 +    expect(decisao(rodar([{ valor: 60.01 }])[0])).toMatchObjec
          +t({ status: 'PARCIAL', reembolsavel: 6000n });                
       83 +  });                                                         
       84 +                                                              
       85 +  it('Borda › Várias no mesmo dia', () => {                   
       86 +    const itens = rodar([                                     
       87 +      { valor: 72.5, fornecedor: 'Tavola' },                  
       88 +      { valor: 38, fornecedor: 'Porto' },                     
       89 +    ]);                                                       
       90 +    expect(itens.map(decisao)).toEqual([                      
       91 +      { status: 'PARCIAL', codigo: 'LIMITE_DIARIO_EXCEDIDO', s
          +olicitado: 7250n, reembolsavel: 6000n },                      
       92 +      { status: 'RECUSADO', codigo: 'LIMITE_DIARIO_ESGOTADO', 
          +solicitado: 3800n, reembolsavel: 0n },                        
       93 +    ]);                                                       
       94 +  });                                                         
       95 +                                                              
       96 +  it('Borda › Recusada não consome limite', () => {           
       97 +    const itens = rodar([                                     
       98 +      { ...transporteSemNf, valor: 100.01 },                  
       99 +      { ...transporteSemNf, valor: 100 },                     
      100 +    ]);                                                       
      101 +    expect(itens.map(decisao)).toEqual([                      
      102 +      { status: 'RECUSADO', codigo: 'NOTA_FISCAL_AUSENTE', sol
          +icitado: 10001n, reembolsavel: 0n },                          
      103 +      { status: 'PARCIAL', codigo: 'LIMITE_DIARIO_EXCEDIDO', s
          +olicitado: 10000n, reembolsavel: 8000n },                     
      104 +    ]);                                                       
      105 +  });                                                         
      106 +                                                              
      107 +  it('Borda › Mesmo dia, categorias diferentes', () => {      
      108 +    const itens = rodar([                                     
      109 +      { categoria: 'alimentacao', valor: 60 },                
      110 +      { categoria: 'transporte_urbano', valor: 80 },          
      111 +    ]);                                                       
     … 10 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-028: period, non-positive value and category cases.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && sed -i "s|^import {
      rodar } from './apoio.ts';|import { calcular } from
      '../src/nucleo/motor.ts';\nimport { ent…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      167    - **Aceite:** passam `Borda › Exatamente no limite diário`, 
           `Borda › Um centavo acima do limite`, `Borda › Várias no mesmo
            dia`, `Borda › Recusada não consome limite`, `Borda › Mesmo d
           ia, categorias diferentes` e `Borda › Fim de semana`
      168    - **Commit:** `7a4991c`
      169  
      170 -- [ ] **T-028** — Casos de borda de período, valor não positiv
          -o e categoria em `tests/casos-de-borda.test.ts`               
      170 +- [x] **T-028** — Casos de borda de período, valor não positiv
          +o e categoria em `tests/casos-de-borda.test.ts`               
      171    - **Atende:** RN-002, RN-004, RN-005, RN-006, AMB-009, AMB-0
           12, AMB-014, AMB-019
      172    - **Aceite:** passam `Borda › Primeiro dia do período`, `Bor
           da › Último dia do período`, `Borda › Dia seguinte ao período`
           , `Borda › Estorno`, `Borda › Valor zero`, `Borda › Categoria 
           em maiúsculas`, `Borda › Categoria com acento` e `Borda › Cate
           goria desconhecida`
      173 -  - **Commit:** `<hash preenchido depois>`                    
      173 +  - **Commit:** `3bf4d63`                                     
      174  
      175  - [ ] **T-029** — Casos de borda de duplicatas em `tests/casos
           -de-borda.test.ts`
      176    - **Atende:** RN-007, RN-003, AMB-011, AMB-026
  ⎿  Updated tests\casos-de-borda.test.ts (+44 -1)
       4  import { describe, expect, it } from 'vitest';
       5  import { statusDe } from '../src/nucleo/status.ts';
       6  import type { ResultadoItem } from '../src/nucleo/tipos.ts';
       7 -import { rodar } from './apoio.ts';                            
       7 +import { calcular } from '../src/nucleo/motor.ts';             
       8 +import { entrada, rodar } from './apoio.ts';                   
       9  
      10  /** O que a seção 7 verifica em cada item. */
      11  function decisao(i: ResultadoItem | undefined) {
     ...
      120      });
      121    });
      122  });
      123 +                                                              
      124 +describe('Casos de borda — período, valor não positivo e categ
          +oria', () => {                                                
      125 +  it('Borda › Primeiro dia do período', () => {               
      126 +    expect(decisao(rodar([{ data: '2026-07-01' }])[0]).codigo)
          +.toBe('APROVADO_INTEGRAL');                                   
      127 +  });                                                         
      128 +                                                              
      129 +  it('Borda › Último dia do período', () => {                 
      130 +    expect(decisao(rodar([{ data: '2026-07-31' }])[0]).codigo)
          +.toBe('APROVADO_INTEGRAL');                                   
      131 +  });                                                         
      132 +                                                              
      133 +  it('Borda › Dia seguinte ao período', () => {               
      134 +    expect(decisao(rodar([{ data: '2026-08-01' }])[0])).toMatc
          +hObject({ status: 'RECUSADO', codigo: 'FORA_DO_PERIODO' });   
      135 +  });                                                         
      136 +                                                              
      137 +  it('Borda › Estorno', () => {                               
      138 +    const r = calcular(entrada([{ valor: -45 }, { valor: 10, f
          +ornecedor: 'Y' }]));                                          
      139 +    expect(decisao(r.itens[0])).toEqual({ status: 'RECUSADO', 
          +codigo: 'VALOR_NAO_POSITIVO', solicitado: -4500n, reembolsavel
          +: 0n });                                                      
      140 +    expect(r.resumo.totalSolicitado).toBe(1000n);             
      141 +  });                                                         
      142 +                                                              
      143 +  it('Borda › Valor zero', () => {                            
      144 +    expect(decisao(rodar([{ valor: 0 }])[0])).toMatchObject({ 
          +status: 'RECUSADO', codigo: 'VALOR_NAO_POSITIVO' });          
      145 +  });                                                         
      146 +                                                              
      147 +  it('Borda › Categoria em maiúsculas', () => {               
      148 +    const [i] = rodar([{ categoria: 'ALIMENTACAO' }]);        
      149 +    expect(i?.categoria).toBe('alimentacao');                 
      150 +    expect(i?.limiteDiarioAplicado).toBe(6000n);              
     … 14 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-029: duplicate cases.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >>
      tests/casos-de-borda.test.ts <<'EOF'…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      172    - **Aceite:** passam `Borda › Primeiro dia do período`, `Bor
           da › Último dia do período`, `Borda › Dia seguinte ao período`
           , `Borda › Estorno`, `Borda › Valor zero`, `Borda › Categoria 
           em maiúsculas`, `Borda › Categoria com acento` e `Borda › Cate
           goria desconhecida`
      173    - **Commit:** `3bf4d63`
      174  
      175 -- [ ] **T-029** — Casos de borda de duplicatas em `tests/casos
          --de-borda.test.ts`                                            
      175 +- [x] **T-029** — Casos de borda de duplicatas em `tests/casos
          +-de-borda.test.ts`                                            
      176    - **Atende:** RN-007, RN-003, AMB-011, AMB-026
      177    - **Aceite:** passam `Borda › Mesmo fornecedor, datas difere
           ntes`, `Borda › Duplicata com e sem NF`, `Borda › Três cópias 
           idênticas`, `Borda › Fornecedor com grafia diferente`, `Borda 
           › Fornecedores diferentes`, `Borda › Ambas sem fornecedor`, `B
           orda › Só uma com fornecedor`, `Borda › Fornecedor vazio`, `Bo
           rda › Fornecedor numérico` e `Borda › Fornecedor nulo`
      178 -  - **Commit:** `<hash preenchido depois>`                    
      178 +  - **Commit:** `8edd03e`                                     
      179  
      180  - [ ] **T-030** — Casos de borda de hospedagem e diárias em `t
           ests/casos-de-borda.test.ts`
      181    - **Atende:** RN-012, RN-005, RN-003, AMB-008, AMB-026
  ⎿  Updated tests\casos-de-borda.test.ts (+73 -0)
      162      expect(i?.categoria).toBe('coworking');
      163    });
      164  });
      165 +                                                              
      166 +/** Código do motivo de cada item. */                         
      167 +function codigos(despesas: Record<string, unknown>[]): string[
          +] {                                                           
      168 +  return rodar(despesas).map((i) => i.motivo.codigo);         
      169 +}                                                             
      170 +                                                              
      171 +describe('Casos de borda — duplicatas', () => {               
      172 +  const almoco = { data: '2026-07-03', fornecedor: 'Tavola', v
          +alor: 40 };                                                   
      173 +                                                              
      174 +  it('Borda › Mesmo fornecedor, datas diferentes', () => {    
      175 +    expect(codigos([almoco, { ...almoco, data: '2026-07-31' }]
          +)).toEqual(['APROVADO_INTEGRAL', 'APROVADO_INTEGRAL']);       
      176 +  });                                                         
      177 +                                                              
      178 +  it('Borda › Duplicata com e sem NF', () => {                
      179 +    expect(codigos([{ ...almoco, tem_nota_fiscal: true }, { ..
          +.almoco, tem_nota_fiscal: false }])).toEqual([                
      180 +      'APROVADO_INTEGRAL',                                    
      181 +      'DUPLICATA',                                            
      182 +    ]);                                                       
      183 +  });                                                         
      184 +                                                              
      185 +  it('Borda › Três cópias idênticas', () => {                 
      186 +    expect(codigos([almoco, almoco, almoco])).toEqual(['APROVA
          +DO_INTEGRAL', 'DUPLICATA', 'DUPLICATA']);                     
      187 +  });                                                         
      188 +                                                              
      189 +  it('Borda › Fornecedor com grafia diferente', () => {       
      190 +    expect(codigos([{ ...almoco, fornecedor: 'Bistro Central' 
          +}, { ...almoco, fornecedor: 'bistro central ' }])).toEqual([  
      191 +      'APROVADO_INTEGRAL',                                    
      192 +      'DUPLICATA',                                            
      193 +    ]);                                                       
      194 +  });                                                         
      195 +                                                              
      196 +  it('Borda › Fornecedores diferentes', () => {               
      197 +    expect(codigos([{ ...almoco, fornecedor: 'Tavola' }, { ...
          +almoco, fornecedor: 'Porto' }])).not.toContain('DUPLICATA');  
      198 +  });                                                         
      199 +                                                              
      200 +  it('Borda › Ambas sem fornecedor', () => {                  
      201 +    expect(codigos([{ ...almoco, fornecedor: undefined }, { ..
          +.almoco, fornecedor: undefined }])).toEqual([                 
     … 36 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-030: stay and nights (diarias) cases.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >>
      tests/casos-de-borda.test.ts <<'EOF'…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      177    - **Aceite:** passam `Borda › Mesmo fornecedor, datas difere
           ntes`, `Borda › Duplicata com e sem NF`, `Borda › Três cópias 
           idênticas`, `Borda › Fornecedor com grafia diferente`, `Borda 
           › Fornecedores diferentes`, `Borda › Ambas sem fornecedor`, `B
           orda › Só uma com fornecedor`, `Borda › Fornecedor vazio`, `Bo
           rda › Fornecedor numérico` e `Borda › Fornecedor nulo`
      178    - **Commit:** `8edd03e`
      179  
      180 -- [ ] **T-030** — Casos de borda de hospedagem e diárias em `t
          -ests/casos-de-borda.test.ts`                                  
      180 +- [x] **T-030** — Casos de borda de hospedagem e diárias em `t
          +ests/casos-de-borda.test.ts`                                  
      181    - **Atende:** RN-012, RN-005, RN-003, AMB-008, AMB-026
      182    - **Aceite:** passam `Borda › Diárias na descrição` (conferi
           ndo `limite_diario_aplicado` 250,00), `Borda › Diárias com ace
           nto e maiúscula`, `Borda › Duas hospedagens na mesma noite`, `
           Borda › Diária média acima do limite`, `Borda › Divisão com ce
           ntavos`, `Borda › Noite fora do período`, `Borda › Número que 
           não é diária`, `Borda › Descrição sem número`, `Borda › Zero d
           iárias`, `Borda › Número solto antes das diárias`, `Borda › Di
           árias fracionárias`, `Borda › Hospedagem sem descrição` e `Bor
           da › Descrição não textual`
      183 -  - **Commit:** `<hash preenchido depois>`                    
      183 +  - **Commit:** `68e7db7`                                     
      184  
      185  - [ ] **T-031** — Casos de borda de viagem em `tests/casos-de-
           borda.test.ts`
      186    - **Atende:** RN-011, RN-008, AMB-007, AMB-017, AMB-020
  ⎿  Updated tests\casos-de-borda.test.ts (+72 -0)
      235      ]);
      236    });
      237  });
      238 +                                                              
      239 +describe('Casos de borda — hospedagem e diárias', () => {     
      240 +  const hotel = { categoria: 'hospedagem', data: '2026-07-14',
          + fornecedor: 'Hotel' };                                       
      241 +                                                              
      242 +  /** `[status, reembolsável, diarias]` de uma hospedagem isol
          +ada. */                                                       
      243 +  function hospedagem(campos: Record<string, unknown>) {      
      244 +    const [i] = rodar([{ ...hotel, ...campos }]);             
      245 +    return [decisao(i).status, i?.valorReembolsavel, i?.diaria
          +s];                                                           
      246 +  }                                                           
      247 +                                                              
      248 +  it('Borda › Diárias na descrição', () => {                  
      249 +    const [i] = rodar([{ ...hotel, descricao: 'Hotel Rio - 2 d
          +iarias', valor: 480 }]);                                      
      250 +    expect(decisao(i)).toMatchObject({ status: 'APROVADO', ree
          +mbolsavel: 48000n });                                         
      251 +    expect(i).toMatchObject({ diarias: 2, limiteDiarioAplicado
          +: 25000n });                                                  
      252 +  });                                                         
      253 +                                                              
      254 +  it('Borda › Diárias com acento e maiúscula', () => {        
      255 +    expect(hospedagem({ descricao: '3 Diárias', valor: 600 }))
          +.toEqual(['APROVADO', 60000n, 3]);                            
      256 +  });                                                         
      257 +                                                              
      258 +  it('Borda › Duas hospedagens na mesma noite', () => {       
      259 +    const itens = rodar([                                     
      260 +      { ...hotel, id: 'h1', data: '2026-07-14', descricao: '2 
          +diarias', valor: 480 },                                       
      261 +      { ...hotel, id: 'h2', data: '2026-07-15', descricao: '1 
          +diaria', valor: 200, fornecedor: 'Pousada' },                 
      262 +    ]);                                                       
      263 +    expect(itens.map((i) => [decisao(i).status, i.valorReembol
          +savel])).toEqual([                                            
      264 +      ['APROVADO', 48000n],                                   
      265 +      ['PARCIAL', 1000n],                                     
      266 +    ]);                                                       
      267 +  });                                                         
      268 +                                                              
      269 +  it('Borda › Diária média acima do limite', () => {          
      270 +    expect(hospedagem({ descricao: '2 diarias', valor: 600 }))
          +.toEqual(['PARCIAL', 50000n, 2]);                             
      271 +  });                                                         
      272 +                                                              
      273 +  it('Borda › Divisão com centavos', () => {                  
      274 +    expect(hospedagem({ descricao: '3 diarias', valor: 100 }))
          +.toEqual(['APROVADO', 10000n, 3]);                            
     … 35 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-031: travel cases.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >>
      tests/casos-de-borda.test.ts <<'EOF'…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      182    - **Aceite:** passam `Borda › Diárias na descrição` (conferi
           ndo `limite_diario_aplicado` 250,00), `Borda › Diárias com ace
           nto e maiúscula`, `Borda › Duas hospedagens na mesma noite`, `
           Borda › Diária média acima do limite`, `Borda › Divisão com ce
           ntavos`, `Borda › Noite fora do período`, `Borda › Número que 
           não é diária`, `Borda › Descrição sem número`, `Borda › Zero d
           iárias`, `Borda › Número solto antes das diárias`, `Borda › Di
           árias fracionárias`, `Borda › Hospedagem sem descrição` e `Bor
           da › Descrição não textual`
      183    - **Commit:** `68e7db7`
      184  
      185 -- [ ] **T-031** — Casos de borda de viagem em `tests/casos-de-
          -borda.test.ts`                                                
      185 +- [x] **T-031** — Casos de borda de viagem em `tests/casos-de-
          +borda.test.ts`                                                
      186    - **Atende:** RN-011, RN-008, AMB-007, AMB-017, AMB-020
      187    - **Aceite:** passam `Borda › Alimentação em dia de viagem`,
            `Borda › Transporte em dia de viagem`, `Borda › Dia do check-
           out`, `Borda › Noite seguinte da estadia`, `Borda › Hospedagem
            recusada não gera viagem` e `Borda › Viagem não altera o limi
           ar de NF`
      188 -  - **Commit:** `<hash preenchido depois>`                    
      188 +  - **Commit:** `e8d5dec`                                     
      189  
      190  - [ ] **T-032** — Casos de borda de `id`, `data`, `categoria` 
           e eco inválidos em `tests/casos-de-borda.test.ts`
      191    - **Atende:** RN-003, RN-014, AMB-018, AMB-023, AMB-024, AMB
           -025
  ⎿  Updated tests\casos-de-borda.test.ts (+44 -0)
      307      expect(hospedagem({ descricao: 2, valor: 300 })).toEqual([
           'PARCIAL', 25000n, 1]);
      308    });
      309  });
      310 +                                                              
      311 +describe('Casos de borda — viagem', () => {                   
      312 +  const hotel = { categoria: 'hospedagem', data: '2026-07-14',
          + descricao: 'Hotel', fornecedor: 'Hotel', valor: 200 };       
      313 +  const alimentacao80 = { categoria: 'alimentacao', valor: 80 
          +};                                                            
      314 +                                                              
      315 +  it('Borda › Alimentação em dia de viagem', () => {          
      316 +    const [, a] = rodar([hotel, { ...alimentacao80, data: '202
          +6-07-14' }]);                                                 
      317 +    expect(decisao(a)).toMatchObject({ status: 'APROVADO', ree
          +mbolsavel: 8000n });                                          
      318 +    expect(a).toMatchObject({ limiteDiarioAplicado: 9000n, emV
          +iagem: true });                                               
      319 +  });                                                         
      320 +                                                              
      321 +  it('Borda › Transporte em dia de viagem', () => {           
      322 +    const [, t] = rodar([hotel, { categoria: 'transporte_urban
          +o', data: '2026-07-14', valor: 130, tem_nota_fiscal: true }]);
      323 +    expect(decisao(t)).toMatchObject({ status: 'PARCIAL', reem
          +bolsavel: 12000n });                                          
      324 +  });                                                         
      325 +                                                              
      326 +  it('Borda › Dia do check-out', () => {                      
      327 +    const [, a] = rodar([hotel, { ...alimentacao80, data: '202
          +6-07-15' }]);                                                 
      328 +    expect(decisao(a)).toMatchObject({ status: 'PARCIAL', reem
          +bolsavel: 6000n });                                           
      329 +    expect(a?.emViagem).toBe(false);                          
      330 +  });                                                         
      331 +                                                              
      332 +  it('Borda › Noite seguinte da estadia', () => {             
      333 +    const [, a] = rodar([{ ...hotel, descricao: 'Hotel 2 diari
          +as' }, { ...alimentacao80, data: '2026-07-15' }]);            
      334 +    expect(decisao(a)).toMatchObject({ status: 'APROVADO', ree
          +mbolsavel: 8000n });                                          
      335 +    expect(a?.emViagem).toBe(true);                           
      336 +  });                                                         
      337 +                                                              
      338 +  it('Borda › Hospedagem recusada não gera viagem', () => {   
      339 +    const itens = rodar([                                     
      340 +      { ...hotel, valor: 690, tem_nota_fiscal: false },       
      341 +      { ...alimentacao80, data: '2026-07-14' },               
      342 +    ]);                                                       
      343 +    expect(itens.map((i) => [decisao(i).status, decisao(i).ree
          +mbolsavel])).toEqual([                                        
      344 +      ['RECUSADO', 0n],                                       
      345 +      ['PARCIAL', 6000n],                                     
      346 +    ]);                                                       
     … 7 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-032: invalid id, data, categoria and echo cases.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && sed -i "s|^import {
      entrada, rodar } from './apoio.ts';|import { NumeroJson } from
      '../src/nucleo/tipos.ts';\ni…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      187    - **Aceite:** passam `Borda › Alimentação em dia de viagem`,
            `Borda › Transporte em dia de viagem`, `Borda › Dia do check-
           out`, `Borda › Noite seguinte da estadia`, `Borda › Hospedagem
            recusada não gera viagem` e `Borda › Viagem não altera o limi
           ar de NF`
      188    - **Commit:** `e8d5dec`
      189  
      190 -- [ ] **T-032** — Casos de borda de `id`, `data`, `categoria` 
          -e eco inválidos em `tests/casos-de-borda.test.ts`             
      190 +- [x] **T-032** — Casos de borda de `id`, `data`, `categoria` 
          +e eco inválidos em `tests/casos-de-borda.test.ts`             
      191    - **Atende:** RN-003, RN-014, AMB-018, AMB-023, AMB-024, AMB
           -025
      192    - **Aceite:** passam `Borda › Data impossível`, `Borda › id 
           repetido`, `Borda › id repetido com outra grafia`, `Borda › Co
           rreção de item inválido`, `Borda › id de item recusado depois 
           da validação`, `Borda › Valor inválido na saída`, `Borda › Eco
            de campo inválido`, `Borda › Despesa que não é objeto`, `Bord
           a › Categoria vazia`, `Borda › Categoria não textual`, `Borda 
           › id vazio` e `Borda › data nula`
      193 -  - **Commit:** `<hash preenchido depois>`                    
      193 +  - **Commit:** `d7ab5eb`                                     
      194  
      195  - [ ] **T-033** — Casos de borda de `valor` como texto em `tes
           ts/casos-de-borda.test.ts`
      196    - **Atende:** RN-003, RN-001, RN-004, AMB-021
  ⎿  Updated tests\casos-de-borda.test.ts (+72 -1)
       5  import { statusDe } from '../src/nucleo/status.ts';
       6  import type { ResultadoItem } from '../src/nucleo/tipos.ts';
       7  import { calcular } from '../src/nucleo/motor.ts';
       8 -import { entrada, rodar } from './apoio.ts';                   
       8 +import { NumeroJson } from '../src/nucleo/tipos.ts';           
       9 +import { cru, entrada, rodar } from './apoio.ts';              
      10  
      11  /** O que a seção 7 verifica em cada item. */
      12  function decisao(i: ResultadoItem | undefined) {
     ...
      352      expect(decisao(t)).toMatchObject({ status: 'RECUSADO', cod
           igo: 'NOTA_FISCAL_AUSENTE' });
      353    });
      354  });
      355 +                                                              
      356 +describe('Casos de borda — id, data, categoria e eco inválidos
          +', () => {                                                    
      357 +  it('Borda › Data impossível', () => {                       
      358 +    const itens = rodar([{ data: '2026-02-30' }, { data: '2026
          +-07-04' }]);                                                  
      359 +    expect(itens.map(decisao)).toEqual([                      
      360 +      { status: 'RECUSADO', codigo: 'DADO_INVALIDO', solicitad
          +o: 4500n, reembolsavel: 0n },                                 
      361 +      { status: 'APROVADO', codigo: 'APROVADO_INTEGRAL', solic
          +itado: 4500n, reembolsavel: 4500n },                          
      362 +    ]);                                                       
      363 +    expect(itens[0]?.data).toBe('2026-02-30');                
      364 +  });                                                         
      365 +                                                              
      366 +  it('Borda › id repetido', () => {                           
      367 +    expect(codigos([{ id: 'd-001' }, { id: 'd-001', data: '202
          +6-07-04' }])).toEqual(['APROVADO_INTEGRAL', 'DADO_INVALIDO']);
      368 +  });                                                         
      369 +                                                              
      370 +  it('Borda › id repetido com outra grafia', () => {          
      371 +    const itens = rodar([{ id: 'd-001' }, { id: ' D-001 ', dat
          +a: '2026-07-04' }]);                                          
      372 +    expect(itens.map((i) => i.motivo.codigo)).toEqual(['APROVA
          +DO_INTEGRAL', 'DADO_INVALIDO']);                              
      373 +    expect(itens[1]?.id).toBe(' D-001 ');                     
      374 +  });                                                         
      375 +                                                              
      376 +  it('Borda › Correção de item inválido', () => {             
      377 +    expect(codigos([{ id: 'd-001', data: '2026-07-32' }, { id:
          + 'd-001' }])).toEqual(['DADO_INVALIDO', 'APROVADO_INTEGRAL']);
      378 +  });                                                         
      379 +                                                              
      380 +  it('Borda › id de item recusado depois da validação', () => 
          +{                                                             
      381 +    expect(codigos([{ id: 'd-001', data: '2026-08-15' }, { id:
          + 'd-001' }])).toEqual(['FORA_DO_PERIODO', 'DADO_INVALIDO']);  
      382 +  });                                                         
     … 42 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-033 (valor as text) and T-034 (tem_nota_fiscal).

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >>
      tests/casos-de-borda.test.ts <<'EOF'…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+4 -4)
      192    - **Aceite:** passam `Borda › Data impossível`, `Borda › id 
           repetido`, `Borda › id repetido com outra grafia`, `Borda › Co
           rreção de item inválido`, `Borda › id de item recusado depois 
           da validação`, `Borda › Valor inválido na saída`, `Borda › Eco
            de campo inválido`, `Borda › Despesa que não é objeto`, `Bord
           a › Categoria vazia`, `Borda › Categoria não textual`, `Borda 
           › id vazio` e `Borda › data nula`
      193    - **Commit:** `d7ab5eb`
      194  
      195 -- [ ] **T-033** — Casos de borda de `valor` como texto em `tes
          -ts/casos-de-borda.test.ts`                                    
      195 +- [x] **T-033** — Casos de borda de `valor` como texto em `tes
          +ts/casos-de-borda.test.ts`                                    
      196    - **Atende:** RN-003, RN-001, RN-004, AMB-021
      197    - **Aceite:** passam `Borda › Valor como texto com ponto`, `
           Borda › Valor como texto com vírgula`, `Borda › Valor texto co
           m 3 casas`, `Borda › Valor texto negativo`, `Borda › Separador
            de milhar`, `Borda › Símbolo de moeda` e `Borda › Valor boole
           ano`
      198 -  - **Commit:** `<hash preenchido depois>`                    
      198 +  - **Commit:** `087ac52`                                     
      199  
      200 -- [ ] **T-034** — Casos de borda de `tem_nota_fiscal` em `test
          -s/casos-de-borda.test.ts`                                     
      200 +- [x] **T-034** — Casos de borda de `tem_nota_fiscal` em `test
          +s/casos-de-borda.test.ts`                                     
      201    - **Atende:** RN-003, RN-008, AMB-018, AMB-022
      202    - **Aceite:** passam `Borda › tem_nota_fiscal ausente, valor
            150,00`, `Borda › tem_nota_fiscal nulo ou "", valor 150,00`, 
           `Borda › tem_nota_fiscal vazio, valor 50,00`, `Borda › tem_not
           a_fiscal texto` e `Borda › tem_nota_fiscal número`
      203 -  - **Commit:** `<hash preenchido depois>`                    
      203 +  - **Commit:** `dfac0c5`                                     
      204  
      205  ## Fase 4 — Saída e CLI
      206  
  ⎿  Updated tests\casos-de-borda.test.ts (+66 -0)
      422      expect(i?.data).toBeNull();
      423    });
      424  });
      425 +                                                              
      426 +describe('Casos de borda — valor como texto', () => {         
      427 +  it('Borda › Valor como texto com ponto', () => {            
      428 +    expect(decisao(rodar([{ valor: '45.00' }])[0])).toEqual({ 
      429 +      status: 'APROVADO',                                     
      430 +      codigo: 'APROVADO_INTEGRAL',                            
      431 +      solicitado: 4500n,                                      
      432 +      reembolsavel: 4500n,                                    
      433 +    });                                                       
      434 +  });                                                         
      435 +                                                              
      436 +  it('Borda › Valor como texto com vírgula', () => {          
      437 +    expect(decisao(rodar([{ valor: '45,00' }])[0])).toMatchObj
          +ect({ status: 'APROVADO', solicitado: 4500n });               
      438 +  });                                                         
      439 +                                                              
      440 +  it('Borda › Valor texto com 3 casas', () => {               
      441 +    expect(decisao(rodar([{ valor: '33,333' }])[0])).toMatchOb
          +ject({ solicitado: 3333n, reembolsavel: 3333n });             
      442 +  });                                                         
      443 +                                                              
      444 +  it('Borda › Valor texto negativo', () => {                  
      445 +    expect(decisao(rodar([{ valor: '-45,00' }])[0])).toMatchOb
          +ject({ status: 'RECUSADO', codigo: 'VALOR_NAO_POSITIVO' });   
      446 +  });                                                         
      447 +                                                              
      448 +  it('Borda › Separador de milhar', () => {                   
      449 +    expect(decisao(rodar([{ valor: '1.234,56' }])[0])).toMatch
          +Object({ codigo: 'DADO_INVALIDO', solicitado: null });        
      450 +  });                                                         
      451 +                                                              
      452 +  it('Borda › Símbolo de moeda', () => {                      
      453 +    expect(decisao(rodar([{ valor: 'R$ 45,00' }])[0])).toMatch
          +Object({ codigo: 'DADO_INVALIDO', solicitado: null });        
      454 +  });                                                         
      455 +                                                              
      456 +  it('Borda › Valor booleano', () => {                        
      457 +    expect(decisao(rodar([{ valor: true }])[0])).toMatchObject
          +({ codigo: 'DADO_INVALIDO', solicitado: null });              
      458 +  });                                                         
      459 +});                                                           
      460 +                                                              
      461 +describe('Casos de borda — tem_nota_fiscal', () => {          
     … 29 more lines (ctrl+o to expand)
  ⎿  (timeout 5m)

● Phase 3 is complete except T-040, which requires the CLI. I'll move on to
  Phase 4's T-035, building the output module in io/saida.ts, where montarSaida
  just needs the result since Resultado already includes the colaborador and
  periodo echoes.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat > src/io/saida.ts
      <<'EOF'
      // Resultado do núcleo → objeto da saída JSON (seção 4 da spec).…)
  ⎿  Created src\io\saida.ts (+51 -0)
       1 +// Resultado do núcleo → objeto da saída JSON (seção 4 da spec)
         +.                                                              
       2 +                                                               
       3 +import { formatarDecimal } from '../nucleo/dinheiro.ts';       
       4 +import { statusDe } from '../nucleo/status.ts';                
       5 +import type { Centavos, Resultado, ResultadoItem } from '../nuc
         +leo/tipos.ts';                                                 
       6 +                                                               
       7 +/** Número JSON com duas casas, sem passar por float (R-04). */
       8 +function dinheiro(c: Centavos): unknown {                      
       9 +  return JSON.rawJSON(formatarDecimal(c));                     
      10 +}                                                              
      11 +                                                               
      12 +function dinheiroOuNulo(c: Centavos | null): unknown {         
      13 +  return c === null ? null : dinheiro(c);                      
      14 +}                                                              
      15 +                                                               
      16 +function item(i: ResultadoItem) {                              
      17 +  return {                                                     
      18 +    id: i.id,                                                  
      19 +    data: i.data,                                              
      20 +    categoria: i.categoria,                                    
      21 +    valor_solicitado: dinheiroOuNulo(i.valorSolicitado),       
      22 +    valor_reembolsavel: dinheiro(i.valorReembolsavel),         
      23 +    status: statusDe(i),                                       
      24 +    motivo: { codigo: i.motivo.codigo, descricao: i.motivo.desc
         +ricao },                                                       
      25 +    limite_diario_aplicado: dinheiroOuNulo(i.limiteDiarioAplica
         +do),                                                           
      26 +    em_viagem: i.emViagem,                                     
      27 +    diarias: i.diarias,                                        
      28 +  };                                                           
      29 +}                                                              
      30 +                                                               
      31 +/**                                                            
      32 + * Objeto pronto para `serializarJson`, na ordem de campos da s
         +eção 4. Ecos                                                   
      33 + * brutos (inclusive `NumeroJson`) são reemitidos como vieram p
         +elo serializador.                                              
      34 + */                                                            
      35 +export function montarSaida(resultado: Resultado) {            
      36 +  const { resumo } = resultado;                                
      37 +  return {                                                     
      38 +    colaborador: resultado.colaborador,                        
      39 +    periodo: resultado.periodo,                                
      40 +    itens: resultado.itens.map(item),                          
     … 11 more lines (ctrl+o to expand)
  ⎿  Created tests\io\saida.test.ts (+79 -0)
       1 +import { describe, expect, it } from 'vitest';                 
       2 +import { lerEntrada } from '../../src/io/entrada.ts';          
       3 +import { serializarJson } from '../../src/io/json.ts';         
       4 +import { montarSaida } from '../../src/io/saida.ts';           
       5 +import { calcular } from '../../src/nucleo/motor.ts';          
       6 +                                                               
       7 +/** Texto da saída para o arquivo de entrada `texto`. */       
       8 +function saida(texto: string): string {                        
       9 +  return serializarJson(montarSaida(calcular(lerEntrada(texto))
         +));                                                            
      10 +}                                                              
      11 +                                                               
      12 +const cabecalho = '"colaborador": {"id": "c-1"}, "periodo": {"i
         +nicio": "2026-07-01", "fim": "2026-07-31"}';                   
      13 +                                                               
      14 +describe('Infra › saída', () => {                              
      15 +  it('RN-001 › valores monetários saem com duas casas (60.00, n
         +ão 60; 0.00, não 0)', () => {                                  
      16 +    const texto = saida(`{${cabecalho}, "despesas": [          
      17 +      {"id": "a", "data": "2026-07-03", "categoria": "alimentac
         +ao", "valor": 72.5, "tem_nota_fiscal": true},                  
      18 +      {"id": "b", "data": "2026-07-03", "categoria": "alimentac
         +ao", "valor": 38, "fornecedor": "Y", "tem_nota_fiscal": true}  
      19 +    ]}`);                                                      
      20 +    expect(texto).toContain('"valor_solicitado": 72.50');      
      21 +    expect(texto).toContain('"valor_reembolsavel": 60.00');    
      22 +    expect(texto).toContain('"limite_diario_aplicado": 60.00');
      23 +    expect(texto).toContain('"valor_solicitado": 38.00');      
      24 +    expect(texto).toContain('"valor_reembolsavel": 0.00');     
      25 +    expect(texto).toContain('"total_solicitado": 110.50');     
      26 +    expect(texto).toContain('"total_nao_reembolsado": 50.50'); 
      27 +    expect(texto).not.toMatch(/: -?\d+(\.\d)?,?\n/);           
      28 +    const json = JSON.parse(texto);                            
      29 +    expect(json.itens[0].valor_reembolsavel).toBe(60);         
      30 +    expect(Object.keys(json)).toEqual(['colaborador', 'periodo'
         +, 'itens', 'resumo']);                                         
      31 +    expect(Object.keys(json.itens[0])).toEqual([               
      32 +      'id',                                                    
      33 +      'data',                                                  
      34 +      'categoria',                                             
      35 +      'valor_solicitado',                                      
      36 +      'valor_reembolsavel',                                    
      37 +      'status',                                                
      38 +      'motivo',                                                
      39 +      'limite_diario_aplicado',                                
      40 +      'em_viagem',                                             
     … 39 more lines (ctrl+o to expand)

  Ran 1 shell command (ctrl+o to expand)

● My negative regex also matches integer fields like quantidade_itens, so I'll
  narrow it to the money fields.

● Update(tests\io\saida.test.ts)
  ⎿  Added 1 line, removed 1 line
      24      expect(texto).toContain('"valor_reembolsavel": 0.00');
      25      expect(texto).toContain('"total_solicitado": 110.50');
      26      expect(texto).toContain('"total_nao_reembolsado": 50.50');
      27 -    expect(texto).not.toMatch(/: -?\d+(\.\d)?,?\n/);           
      27 +    expect(texto).not.toMatch(/"(valor_\w+|total_\w+|limite_dia
         +rio_aplicado)": -?\d+(\.\d)?,?\n/);                            
      28      const json = JSON.parse(texto);
      29      expect(json.itens[0].valor_reembolsavel).toBe(60);
      30      expect(Object.keys(json)).toEqual(['colaborador', 'periodo'
          , 'itens', 'resumo']);

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/f8a7bb5f-129f-4039-97c7…)  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      204  
      205  ## Fase 4 — Saída e CLI
      206  
      207 -- [ ] **T-035** — Criar `src/io/saida.ts` com `montarSaida(res
          -ultado, entrada)`: objeto na ordem de campos da seção 4 (`cola
          -borador`, `periodo`, `itens`, `resumo`), `colaborador`/`period
          -o` ecoados brutos, dinheiro via `JSON.rawJSON(formatarDecimal(
          -c))`, ecos brutos de item inválido reemitidos como vieram (`Nu
          -meroJson` com o mesmo texto, ausente → `null`)                
      207 +- [x] **T-035** — Criar `src/io/saida.ts` com `montarSaida(res
          +ultado, entrada)`: objeto na ordem de campos da seção 4 (`cola
          +borador`, `periodo`, `itens`, `resumo`), `colaborador`/`period
          +o` ecoados brutos, dinheiro via `JSON.rawJSON(formatarDecimal(
          +c))`, ecos brutos de item inválido reemitidos como vieram (`Nu
          +meroJson` com o mesmo texto, ausente → `null`)                
      208    - **Atende:** RN-001, RN-003, RN-013, AMB-023
      209    - **Aceite:** em `tests/io/saida.test.ts` passam `RN-001 › v
           alores monetários saem com duas casas (60.00, não 60; 0.00, nã
           o 0)`, `RN-003 › eco de campo inválido sai como veio (categori
           a 123 → 123, "  " → "  ", ausente → null)`, `RN-003 › valor_so
           licitado nulo sai como null` e `Infra › saída: colaborador e p
           eriodo ecoados com os números no texto original`
      210 -  - **Commit:** `<hash preenchido depois>`                    
      210 +  - **Commit:** `18fa1d1`                                     
      211  
      212  - [ ] **T-036** — [P] Teste do arquivo oficial em `tests/exemp
           lo.test.ts`: lê `exemplos/despesas-exemplo.json`, roda `valida
           rEntrada` → motor → `montarSaida` e compara com a tabela da se
           ção 9 da spec. Um `it` por despesa, com o ID da regra do códig
           o esperado
      213    - **Atende:** RN-001, RN-004, RN-005, RN-006, RN-007, RN-008
           , RN-009, RN-010, RN-011, RN-012, RN-013, RN-014 (seção 9)
  ⎿  (timeout 3m)

● T-036: the official example file.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      tests/exemplo.test.ts <<'EOF'
      // Arquivo oficial × tabela da seção 9 da spec.…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      209    - **Aceite:** em `tests/io/saida.test.ts` passam `RN-001 › v
           alores monetários saem com duas casas (60.00, não 60; 0.00, nã
           o 0)`, `RN-003 › eco de campo inválido sai como veio (categori
           a 123 → 123, "  " → "  ", ausente → null)`, `RN-003 › valor_so
           licitado nulo sai como null` e `Infra › saída: colaborador e p
           eriodo ecoados com os números no texto original`
      210    - **Commit:** `18fa1d1`
      211  
      212 -- [ ] **T-036** — [P] Teste do arquivo oficial em `tests/exemp
          -lo.test.ts`: lê `exemplos/despesas-exemplo.json`, roda `valida
          -rEntrada` → motor → `montarSaida` e compara com a tabela da se
          -ção 9 da spec. Um `it` por despesa, com o ID da regra do códig
          -o esperado                                                    
      212 +- [x] **T-036** — [P] Teste do arquivo oficial em `tests/exemp
          +lo.test.ts`: lê `exemplos/despesas-exemplo.json`, roda `valida
          +rEntrada` → motor → `montarSaida` e compara com a tabela da se
          +ção 9 da spec. Um `it` por despesa, com o ID da regra do códig
          +o esperado                                                    
      213    - **Atende:** RN-001, RN-004, RN-005, RN-006, RN-007, RN-008
           , RN-009, RN-010, RN-011, RN-012, RN-013, RN-014 (seção 9)
      214    - **Aceite:** passam `RN-010 › exemplo d-001: PARCIAL 60,00`
           , `RN-010 › exemplo d-002: RECUSADO LIMITE_DIARIO_ESGOTADO`, `
           RN-010 › exemplo d-003: PARCIAL 80,00`, `RN-008 › exemplo d-00
           4: NOTA_FISCAL_AUSENTE`, `RN-006 › exemplo d-005: CATEGORIA_NA
           O_REEMBOLSAVEL`, `RN-009 › exemplo d-006: APROVADO 54,90`, `RN
           -007 › exemplo d-007: DUPLICATA`, `RN-005 › exemplo d-008: FOR
           A_DO_PERIODO`, `RN-004 › exemplo d-009: VALOR_NAO_POSITIVO`, `
           RN-012 › exemplo d-010: APROVADO 480,00, diarias 2`, `RN-011 ›
            exemplo d-011: APROVADO 33,33, em_viagem true, limite 90,00`,
            `RN-009 › exemplo d-012: APROVADO 47,20`, `RN-008 › exemplo d
           -013: NOTA_FISCAL_AUSENTE`, `RN-010 › exemplo d-014: PARCIAL 6
           0,00`, `RN-014 › exemplo: resumo 1861.84 / 815.43 / 1046.41 · 
           4/3/7` e `RN-013 › exemplo: nenhum item com motivo ausente ou 
           vazio`
      215 -  - **Commit:** `<hash preenchido depois>`                    
      215 +  - **Commit:** `fadedb0`                                     
      216  
      217  - [ ] **T-037** — [P] Teste de contrato em `tests/contrato-sai
           da.test.ts`: valida a saída contra `contracts/saida.schema.jso
           n` com `ajv` (`multipleOfPrecision: 2`)
      218    - **Atende:** RN-013, RN-003 (seção 4)
  ⎿  Created tests\exemplo.test.ts (+117 -0)
        1 +// Arquivo oficial × tabela da seção 9 da spec.               
        2 +                                                              
        3 +import { readFileSync } from 'node:fs';                       
        4 +import { describe, expect, it } from 'vitest';                
        5 +import { lerEntrada } from '../src/io/entrada.ts';            
        6 +import { serializarJson } from '../src/io/json.ts';           
        7 +import { montarSaida } from '../src/io/saida.ts';             
        8 +import { calcular } from '../src/nucleo/motor.ts';            
        9 +                                                              
       10 +interface ItemSaida {                                         
       11 +  id: string;                                                 
       12 +  valor_solicitado: number | null;                            
       13 +  valor_reembolsavel: number;                                 
       14 +  status: string;                                             
       15 +  motivo: { codigo: string; descricao: string };              
       16 +  limite_diario_aplicado: number | null;                      
       17 +  em_viagem: boolean | null;                                  
       18 +  diarias: number | null;                                     
       19 +}                                                             
       20 +                                                              
       21 +const texto = serializarJson(montarSaida(calcular(lerEntrada(r
          +eadFileSync('exemplos/despesas-exemplo.json', 'utf8')))));    
       22 +const saida = JSON.parse(texto) as { itens: ItemSaida[]; resum
          +o: Record<string, number> };                                  
       23 +                                                              
       24 +function item(id: string): ItemSaida {                        
       25 +  const encontrado = saida.itens.find((i) => i.id === id);    
       26 +  if (!encontrado) throw new Error(`item ${id} ausente`);     
       27 +  return encontrado;                                          
       28 +}                                                             
       29 +                                                              
       30 +/** Linha da tabela da seção 9: solicitado, reembolsável, stat
          +us, código. */                                                
       31 +function linha(id: string) {                                  
       32 +  const i = item(id);                                         
       33 +  return [i.valor_solicitado, i.valor_reembolsavel, i.status, 
          +i.motivo.codigo];                                             
       34 +}                                                             
       35 +                                                              
       36 +describe('Exemplo oficial (seção 9)', () => {                 
       37 +  it('RN-010 › exemplo d-001: PARCIAL 60,00', () => {         
       38 +    expect(linha('d-001')).toEqual([72.5, 60, 'PARCIAL', 'LIMI
          +TE_DIARIO_EXCEDIDO']);                                        
       39 +  });                                                         
       40 +                                                              
     … 77 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● The example output matches the section 9 table exactly. Next, T-037: the
  contract test with ajv. First I'll check how ajv/dist/2020 exports.

  Ran 1 shell command (ctrl+o to expand)

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      tests/contrato-saida.test.ts <<'EOF'
      // A saída respeita contracts/saida.schema.json (seção 4 da spec).…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      214    - **Aceite:** passam `RN-010 › exemplo d-001: PARCIAL 60,00`
           , `RN-010 › exemplo d-002: RECUSADO LIMITE_DIARIO_ESGOTADO`, `
           RN-010 › exemplo d-003: PARCIAL 80,00`, `RN-008 › exemplo d-00
           4: NOTA_FISCAL_AUSENTE`, `RN-006 › exemplo d-005: CATEGORIA_NA
           O_REEMBOLSAVEL`, `RN-009 › exemplo d-006: APROVADO 54,90`, `RN
           -007 › exemplo d-007: DUPLICATA`, `RN-005 › exemplo d-008: FOR
           A_DO_PERIODO`, `RN-004 › exemplo d-009: VALOR_NAO_POSITIVO`, `
           RN-012 › exemplo d-010: APROVADO 480,00, diarias 2`, `RN-011 ›
            exemplo d-011: APROVADO 33,33, em_viagem true, limite 90,00`,
            `RN-009 › exemplo d-012: APROVADO 47,20`, `RN-008 › exemplo d
           -013: NOTA_FISCAL_AUSENTE`, `RN-010 › exemplo d-014: PARCIAL 6
           0,00`, `RN-014 › exemplo: resumo 1861.84 / 815.43 / 1046.41 · 
           4/3/7` e `RN-013 › exemplo: nenhum item com motivo ausente ou 
           vazio`
      215    - **Commit:** `fadedb0`
      216  
      217 -- [ ] **T-037** — [P] Teste de contrato em `tests/contrato-sai
          -da.test.ts`: valida a saída contra `contracts/saida.schema.jso
          -n` com `ajv` (`multipleOfPrecision: 2`)                       
      217 +- [x] **T-037** — [P] Teste de contrato em `tests/contrato-sai
          +da.test.ts`: valida a saída contra `contracts/saida.schema.jso
          +n` com `ajv` (`multipleOfPrecision: 2`)                       
      218    - **Atende:** RN-013, RN-003 (seção 4)
      219    - **Aceite:** passam `RN-013 › saída do exemplo valida contr
           a contracts/saida.schema.json` e `RN-013 › saída com itens DAD
           O_INVALIDO (valor_solicitado nulo, ecos brutos) valida contra 
           o schema`
      220 -  - **Commit:** `<hash preenchido depois>`                    
      220 +  - **Commit:** `702de1c`                                     
      221  
      222  - [ ] **T-038** — Criar `src/cli.ts` (R-08, DT-004, `contracts
           /cli.md`): `parseArgs` com subcomando `calcular` e `--input`/`
           --output` obrigatórios; lê, valida, calcula e serializa tudo e
           m memória antes de `writeFile`; sucesso → código 0 e uma linha
            de resumo no `stdout`; `ErroEntrada`/falha de leitura → `erro
           : <mensagem>` no `stderr` e código 1, sem criar nem alterar a 
           saída; uso incorreto → `uso: ...` e código 2
      223    - **Atende:** RN-015, RN-003, AMB-018
  ⎿  Created tests\contrato-saida.test.ts (+48 -0)
       1 +// A saída respeita contracts/saida.schema.json (seção 4 da spe
         +c).                                                            
       2 +                                                               
       3 +import { readFileSync } from 'node:fs';                        
       4 +import { Ajv2020 } from 'ajv/dist/2020.js';                    
       5 +import { describe, expect, it } from 'vitest';                 
       6 +import { lerEntrada } from '../src/io/entrada.ts';             
       7 +import { serializarJson } from '../src/io/json.ts';            
       8 +import { montarSaida } from '../src/io/saida.ts';              
       9 +import { calcular } from '../src/nucleo/motor.ts';             
      10 +                                                               
      11 +const schema = JSON.parse(readFileSync('specs/001-motor-reembol
         +so/contracts/saida.schema.json', 'utf8'));                     
      12 +// multipleOf: 0.01 com float dá falso negativo (ex.: 0.07) sem
         + a precisão (plan §7).                                         
      13 +const validar = new Ajv2020({ multipleOfPrecision: 2, allErrors
         +: true }).compile(schema);                                     
      14 +                                                               
      15 +/** Saída como o CLI a gravaria, relida como JSON. */          
      16 +function saida(texto: string): unknown {                       
      17 +  return JSON.parse(serializarJson(montarSaida(calcular(lerEntr
         +ada(texto)))));                                                
      18 +}                                                              
      19 +                                                               
      20 +function conferir(json: unknown): void {                       
      21 +  const ok = validar(json);                                    
      22 +  expect(validar.errors ?? [], JSON.stringify(validar.errors, n
         +ull, 2)).toEqual([]);                                          
      23 +  expect(ok).toBe(true);                                       
      24 +}                                                              
      25 +                                                               
      26 +describe('Contrato da saída', () => {                          
      27 +  it('RN-013 › saída do exemplo valida contra contracts/saida.s
         +chema.json', () => {                                           
      28 +    conferir(saida(readFileSync('exemplos/despesas-exemplo.json
         +', 'utf8')));                                                  
      29 +  });                                                          
      30 +                                                               
      31 +  it('RN-013 › saída com itens DADO_INVALIDO (valor_solicitado 
         +nulo, ecos brutos) valida contra o schema', () => {            
      32 +    const json = saida(`{                                      
      33 +      "colaborador": {"id": "c-1"},                            
      34 +      "periodo": {"inicio": "2026-07-01", "fim": "2026-07-31"},
      35 +      "despesas": [                                            
      36 +        {"id": "a", "data": "2026-07-03", "categoria": 123, "va
         +lor": "R$ 45,00"},                                             
      37 +        {"id": null, "data": 20260703, "categoria": ["x"], "val
         +or": 0.07},                                                    
      38 +        42,                                                    
      39 +        {"id": "b", "data": "2026-07-03", "categoria": "aliment
         +acao", "valor": 0.07, "tem_nota_fiscal": "sim"},               
      40 +        {"id": "c", "data": "2026-07-03", "categoria": "aliment
         +acao", "valor": 10.005},                                       
     … 8 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-038: the CLI (src/cli.ts).

● Write(src\cli.ts)
  ⎿  Wrote 79 lines to src\cli.ts
      1 // CLI (R-08, DT-004, contracts/cli.md): tudo é calculado em memó
        ria antes de gravar.
      2
      3 import { readFile, writeFile } from 'node:fs/promises';
      4 import { parseArgs } from 'node:util';
      5 import { ErroEntrada, lerEntrada } from './io/entrada.ts';
      6 import { serializarJson } from './io/json.ts';
      7 import { montarSaida } from './io/saida.ts';
      8 import { formatarReais } from './nucleo/dinheiro.ts';
      9 import { calcular } from './nucleo/motor.ts';
     … +82 lines (ctrl+o to expand)

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat > tests/cli.test.ts
      <<'EOF'
      // CLI ponta a ponta, em processo filho (contracts/cli.md).…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      219    - **Aceite:** passam `RN-013 › saída do exemplo valida contr
           a contracts/saida.schema.json` e `RN-013 › saída com itens DAD
           O_INVALIDO (valor_solicitado nulo, ecos brutos) valida contra 
           o schema`
      220    - **Commit:** `702de1c`
      221  
      222 -- [ ] **T-038** — Criar `src/cli.ts` (R-08, DT-004, `contracts
          -/cli.md`): `parseArgs` com subcomando `calcular` e `--input`/`
          ---output` obrigatórios; lê, valida, calcula e serializa tudo e
          -m memória antes de `writeFile`; sucesso → código 0 e uma linha
          - de resumo no `stdout`; `ErroEntrada`/falha de leitura → `erro
          -: <mensagem>` no `stderr` e código 1, sem criar nem alterar a 
          -saída; uso incorreto → `uso: ...` e código 2                  
      222 +- [x] **T-038** — Criar `src/cli.ts` (R-08, DT-004, `contracts
          +/cli.md`): `parseArgs` com subcomando `calcular` e `--input`/`
          +--output` obrigatórios; lê, valida, calcula e serializa tudo e
          +m memória antes de `writeFile`; sucesso → código 0 e uma linha
          + de resumo no `stdout`; `ErroEntrada`/falha de leitura → `erro
          +: <mensagem>` no `stderr` e código 1, sem criar nem alterar a 
          +saída; uso incorreto → `uso: ...` e código 2                  
      223    - **Atende:** RN-015, RN-003, AMB-018
      224    - **Aceite:** em `tests/cli.test.ts` (processo filho) passam
            `RN-015 › CLI: arquivo sem periodo → código 1, stderr cita pe
           riodo, nenhum arquivo de saída`, `RN-015 › CLI: arquivo de ent
           rada inexistente → código 1, nenhum arquivo de saída`, `RN-015
            › CLI: arquivo que não é JSON → código 1`, `RN-015 › CLI: em 
           erro, arquivo de saída pré-existente não é alterado`, `RN-003 
           › CLI: despesa inválida não aborta (código 0)`, `Infra › CLI: 
           exemplo → código 0, resumo no stdout, JSON indentado com \n fi
           nal` e `Infra › CLI: subcomando ou opção ausente → código 2 co
           m "uso:"`
      225 -  - **Commit:** `<hash preenchido depois>`                    
      225 +  - **Commit:** `3feda6b`                                     
      226  
      227  - [ ] **T-039** — Teste de determinismo em `tests/cli.test.ts`
      228    - **Atende:** seção 9 (critério "duas execuções geram saídas
            idênticas")
  ⎿  Created tests\cli.test.ts (+107 -0)
        1 +// CLI ponta a ponta, em processo filho (contracts/cli.md).   
        2 +                                                              
        3 +import { spawnSync } from 'node:child_process';               
        4 +import { existsSync, mkdtempSync, readFileSync, rmSync, writeF
          +ileSync } from 'node:fs';                                     
        5 +import { tmpdir } from 'node:os';                             
        6 +import { join } from 'node:path';                             
        7 +import { afterAll, describe, expect, it } from 'vitest';      
        8 +                                                              
        9 +const pasta = mkdtempSync(join(tmpdir(), 'reembolso-cli-'));  
       10 +afterAll(() => rmSync(pasta, { recursive: true, force: true })
          +);                                                            
       11 +                                                              
       12 +let contador = 0;                                             
       13 +                                                              
       14 +/** Caminho novo na pasta temporária; com `conteudo`, o arquiv
          +o é criado. */                                                
       15 +function arquivo(conteudo?: string): string {                 
       16 +  const caminho = join(pasta, `arquivo-${++contador}.json`);  
       17 +  if (conteudo !== undefined) writeFileSync(caminho, conteudo)
          +;                                                             
       18 +  return caminho;                                             
       19 +}                                                             
       20 +                                                              
       21 +function cli(...args: string[]) {                             
       22 +  const r = spawnSync(process.execPath, ['src/cli.ts', ...args
          +], { encoding: 'utf8' });                                     
       23 +  return { codigo: r.status, stdout: r.stdout, stderr: r.stder
          +r };                                                          
       24 +}                                                             
       25 +                                                              
       26 +function calcular(entrada: string, saida: string) {           
       27 +  return cli('calcular', '--input', entrada, '--output', saida
          +);                                                            
       28 +}                                                             
       29 +                                                              
       30 +const SEM_PERIODO = JSON.stringify({ colaborador: { id: 'c-1' 
          +}, despesas: [] });                                           
       31 +                                                              
       32 +describe('CLI', () => {                                       
       33 +  it('RN-015 › CLI: arquivo sem periodo → código 1, stderr cit
          +a periodo, nenhum arquivo de saída', () => {                  
       34 +    const saida = arquivo();                                  
       35 +    const r = calcular(arquivo(SEM_PERIODO), saida);          
       36 +    expect(r.codigo).toBe(1);                                 
       37 +    expect(r.stderr).toMatch(/^erro: .*periodo/);             
       38 +    expect(r.stdout).toBe('');                                
       39 +    expect(existsSync(saida)).toBe(false);                    
       40 +  });                                                         
     … 67 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● T-039: the determinism test. I'll run the CLI twice under different time zones
  and compare the bytes.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && node - <<'EOF'
      const fs = require('fs');…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      224    - **Aceite:** em `tests/cli.test.ts` (processo filho) passam
            `RN-015 › CLI: arquivo sem periodo → código 1, stderr cita pe
           riodo, nenhum arquivo de saída`, `RN-015 › CLI: arquivo de ent
           rada inexistente → código 1, nenhum arquivo de saída`, `RN-015
            › CLI: arquivo que não é JSON → código 1`, `RN-015 › CLI: em 
           erro, arquivo de saída pré-existente não é alterado`, `RN-003 
           › CLI: despesa inválida não aborta (código 0)`, `Infra › CLI: 
           exemplo → código 0, resumo no stdout, JSON indentado com \n fi
           nal` e `Infra › CLI: subcomando ou opção ausente → código 2 co
           m "uso:"`
      225    - **Commit:** `3feda6b`
      226  
      227 -- [ ] **T-039** — Teste de determinismo em `tests/cli.test.ts`
      227 +- [x] **T-039** — Teste de determinismo em `tests/cli.test.ts`
      228    - **Atende:** seção 9 (critério "duas execuções geram saídas
            idênticas")
      229    - **Aceite:** passa `Infra › CLI: duas execuções com a mesma
            entrada geram bytes idênticos`
      230 -  - **Commit:** `<hash preenchido depois>`                    
      230 +  - **Commit:** `45f2d25`                                     
      231  
      232  - [ ] **T-040** — Casos de borda de arquivo em `tests/casos-de
           -borda.test.ts`: lista vazia pelo motor; os casos de RN-015 pe
           lo CLI (processo filho), conferindo que o arquivo de saída não
            existe e que o `stderr` cita o campo
      233    - **Atende:** RN-014, RN-015, AMB-027
  ⎿  Updated tests\cli.test.ts (+13 -1)
      19  }
      20  
      21  function cli(...args: string[]) {
      22 -  const r = spawnSync(process.execPath, ['src/cli.ts', ...args]
         -, { encoding: 'utf8' });                                       
      22 +  return cliCom({}, ...args);                                  
      23 +}                                                              
      24 +                                                               
      25 +function cliCom(env: Record<string, string>, ...args: string[])
         + {                                                             
      26 +  const r = spawnSync(process.execPath, ['src/cli.ts', ...args]
         +, { encoding: 'utf8', env: { ...process.env, ...env } });      
      27    return { codigo: r.status, stdout: r.stdout, stderr: r.stderr
           };
      28  }
      29  
     ...
      108      }
      109      expect(existsSync(saida)).toBe(false);
      110    });
      111 +                                                              
      112 +  it('Infra › CLI: duas execuções com a mesma entrada geram by
          +tes idênticos', () => {                                       
      113 +    const [a, b] = [arquivo(), arquivo()];                    
      114 +    const entrada = 'exemplos/despesas-exemplo.json';         
      115 +    expect(cliCom({ TZ: 'UTC', LANG: 'C' }, 'calcular', '--inp
          +ut', entrada, '--output', a).codigo).toBe(0);                 
      116 +    expect(cliCom({ TZ: 'Pacific/Kiritimati', LANG: 'pt_BR.UTF
          +-8' }, 'calcular', '--input', entrada, '--output', b).codigo).
          +toBe(0);                                                      
      117 +    expect(readFileSync(b).equals(readFileSync(a))).toBe(true)
          +;                                                             
      118 +  });                                                         
      119  });
  ⎿  (timeout 3m)

● T-040: file edge cases. The empty list goes through the motor; the RN-015
  cases go through the CLI as a child process.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && node - <<'EOF'
      const fs = require('fs');…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      229    - **Aceite:** passa `Infra › CLI: duas execuções com a mesma
            entrada geram bytes idênticos`
      230    - **Commit:** `45f2d25`
      231  
      232 -- [ ] **T-040** — Casos de borda de arquivo em `tests/casos-de
          --borda.test.ts`: lista vazia pelo motor; os casos de RN-015 pe
          -lo CLI (processo filho), conferindo que o arquivo de saída não
          - existe e que o `stderr` cita o campo                         
      232 +- [x] **T-040** — Casos de borda de arquivo em `tests/casos-de
          +-borda.test.ts`: lista vazia pelo motor; os casos de RN-015 pe
          +lo CLI (processo filho), conferindo que o arquivo de saída não
          + existe e que o `stderr` cita o campo                         
      233    - **Atende:** RN-014, RN-015, AMB-027
      234    - **Aceite:** passam `Borda › Lista de despesas vazia`, `Bor
           da › Arquivo sem periodo`, `Borda › inicio depois de fim`, `Bo
           rda › colaborador.id vazio`, `Borda › periodo.inicio não textu
           al` e `Borda › Arquivo que não é objeto`
      235 -  - **Commit:** `<hash preenchido depois>`                    
      235 +  - **Commit:** `247de37`                                     
      236  
      237  - [ ] **T-041** — Criar `tests/rastreabilidade.test.ts` (DT-00
           5): lê `specs/001-motor-reembolso/spec.md`, extrai todo `### R
           N-NNN` e a 1ª coluna da tabela da seção 7 (sem as crases), lê 
           os títulos de teste em `tests/**/*.test.ts` e falha listando o
            que ficou sem teste; confere também que toda RN tem **exatame
           nte um** arquivo `tests/**/rn-NNN-*.test.ts`
      238    - **Atende:** RN-001, RN-002, RN-003, RN-004, RN-005, RN-006
           , RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-0
           14, RN-015 (seção 9, critérios 2 e 3)
  ⎿  Updated tests\casos-de-borda.test.ts (+62 -1)
       1  // Um teste por linha da tabela da seção 7 da spec, com o títul
          o exato da coluna "Caso".
       2  // Período padrão: 2026-07-01 a 2026-07-31.
       3  
       4 -import { describe, expect, it } from 'vitest';                 
       4 +import { spawnSync } from 'node:child_process';                
       5 +import { existsSync, mkdtempSync, rmSync, writeFileSync } from 
         +'node:fs';                                                     
       6 +import { tmpdir } from 'node:os';                              
       7 +import { join } from 'node:path';                              
       8 +import { afterAll, describe, expect, it } from 'vitest';       
       9 +import { serializarJson } from '../src/io/json.ts';            
      10 +import { montarSaida } from '../src/io/saida.ts';              
      11  import { statusDe } from '../src/nucleo/status.ts';
      12  import type { ResultadoItem } from '../src/nucleo/tipos.ts';
      13  import { calcular } from '../src/nucleo/motor.ts';
     ...
      494      expect(codigos([{ valor: 50, tem_nota_fiscal: 0 }])).toEqu
           al(['DADO_INVALIDO']);
      495    });
      496  });
      497 +                                                              
      498 +describe('Casos de borda — arquivo', () => {                  
      499 +  const pasta = mkdtempSync(join(tmpdir(), 'reembolso-borda-')
          +);                                                            
      500 +  afterAll(() => rmSync(pasta, { recursive: true, force: true 
          +}));                                                          
      501 +  let contador = 0;                                           
      502 +                                                              
      503 +  /** Roda o CLI com `conteudo` como entrada; confere que nenh
          +uma saída foi gerada. */                                      
      504 +  function cliComErro(conteudo: string): string {             
      505 +    const entradaArq = join(pasta, `entrada-${++contador}.json
          +`);                                                           
      506 +    const saidaArq = join(pasta, `saida-${contador}.json`);   
      507 +    writeFileSync(entradaArq, conteudo);                      
      508 +    const r = spawnSync(process.execPath, ['src/cli.ts', 'calc
          +ular', '--input', entradaArq, '--output', saidaArq], {        
      509 +      encoding: 'utf8',                                       
      510 +    });                                                       
      511 +    expect(r.status).toBe(1);                                 
      512 +    expect(existsSync(saidaArq)).toBe(false);                 
      513 +    return r.stderr;                                          
      514 +  }                                                           
      515 +                                                              
      516 +  const valido = {                                            
      517 +    colaborador: { id: 'c-1' },                               
      518 +    periodo: { inicio: '2026-07-01', fim: '2026-07-31' },     
      519 +    despesas: [],                                             
     … 32 more lines (ctrl+o to expand)
  ⎿  (timeout 3m)

● The shell ate the \. escapes in three regexes, so an unescaped . matches any
  character. The tests still pass, but I'll escape them properly in a small
  follow-up test(T-040) commit.

  Ran 1 shell command (ctrl+o to expand)

● sed didn't apply, so I'll use Edit.

● Update(tests\casos-de-borda.test.ts)
  ⎿  Added 2 lines, removed 2 lines
      533  
      534    it('Borda › inicio depois de fim', () => {
      535      const stderr = cliComErro(JSON.stringify({ ...valido, peri
           odo: { inicio: '2026-07-31', fim: '2026-07-01' } }));
      536 -    expect(stderr).toMatch(/^erro: .*periodo.inicio/);        
      536 +    expect(stderr).toMatch(/^erro: .*periodo\.inicio/);       
      537    });
      538  
      539    it('Borda › colaborador.id vazio', () => {
      540 -    expect(cliComErro(JSON.stringify({ ...valido, colaborador:
          - { id: '  ' } }))).toMatch(/^erro: .*colaborador.id/);        
      540 +    expect(cliComErro(JSON.stringify({ ...valido, colaborador:
          + { id: '  ' } }))).toMatch(/^erro: .*colaborador\.id/);       
      541    });
      542  
      543    it('Borda › periodo.inicio não textual', () => {

● Update(tests\casos-de-borda.test.ts)
  ⎿  Added 1 line, removed 1 line
      542  
      543    it('Borda › periodo.inicio não textual', () => {
      544      const stderr = cliComErro('{"colaborador": {"id": "c-1"}, 
           "periodo": {"inicio": 20260701, "fim": "2026-07-31"}, "despesa
           s": []}');
      545 -    expect(stderr).toMatch(/^erro: .*periodo.inicio/);        
      545 +    expect(stderr).toMatch(/^erro: .*periodo\.inicio/);       
      546    });
      547  
      548    it('Borda › Arquivo que não é objeto', () => {

  Ran 1 shell command (ctrl+o to expand)

● That's all 80 edge-case tests, one per row of section 7. Next, T-041: the
  traceability test.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && cat >
      tests/rastreabilidade.test.ts <<'EOF'
      // Spec × testes (DT-005): toda RN e toda linha da seção 7 têm test…)
  ⎿  Created tests\rastreabilidade.test.ts (+54 -0)
       1 +// Spec × testes (DT-005): toda RN e toda linha da seção 7 têm 
         +teste.                                                         
       2 +                                                               
       3 +import { readdirSync, readFileSync } from 'node:fs';           
       4 +import { join } from 'node:path';                              
       5 +import { describe, expect, it } from 'vitest';                 
       6 +                                                               
       7 +const spec = readFileSync('specs/001-motor-reembolso/spec.md', 
         +'utf8');                                                       
       8 +                                                               
       9 +const regras = [...spec.matchAll(/^### (RN-\d{3})\b/gm)].map((m
         +) => m[1]!);                                                   
      10 +                                                               
      11 +/** 1ª coluna da tabela da seção 7, sem as crases do markdown. 
         +*/                                                             
      12 +function casosDeBorda(): string[] {                            
      13 +  const inicio = spec.search(/^## 7\./m);                      
      14 +  const fim = spec.indexOf('\n## ', inicio + 1);               
      15 +  return spec                                                  
      16 +    .slice(inicio, fim)                                        
      17 +    .split('\n')                                               
      18 +    .filter((linha) => linha.startsWith('|') && !/^\|\s*(Caso\s
         +*\||-)/.test(linha))                                           
      19 +    .map((linha) => linha.split('|')[1]!.replaceAll('`', '').tr
         +im());                                                         
      20 +}                                                              
      21 +                                                               
      22 +const arquivosDeTeste = readdirSync('tests', { recursive: true,
         + encoding: 'utf8' })                                           
      23 +  .map((caminho) => caminho.replaceAll('\', '/'))              
      24 +  .filter((caminho) => caminho.endsWith('.test.ts'));          
      25 +                                                               
      26 +/** Títulos de `it(...)` de todos os arquivos de teste. */     
      27 +const titulos = arquivosDeTeste.flatMap((caminho) =>           
      28 +  [...readFileSync(join('tests', caminho), 'utf8').matchAll(/\b
         +it\(\s*(['"`])((?:\.|(?!\1).)*)\1/g)].map((m) =>               
      29 +    m[2]!.replace(/\(.)/g, '$1'),                              
      30 +  ),                                                           
      31 +);                                                             
      32 +                                                               
      33 +describe('Infra › rastreabilidade', () => {                    
      34 +  it('Infra › rastreabilidade: toda RN-NNN da spec aparece no i
         +nício de um título de teste', () => {                          
      35 +    expect(regras.length).toBeGreaterThanOrEqual(15);          
      36 +    const semTeste = regras.filter((rn) => !titulos.some((t) =>
         + t.startsWith(`${rn} ›`)));                                    
      37 +    expect(semTeste, `RNs sem teste: ${semTeste.join(', ')}`).t
         +oEqual([]);                                                    
      38 +  });                                                          
      39 +                                                               
      40 +  it('Infra › rastreabilidade: toda linha da seção 7 tem um tes
         +te Borda › <Caso>', () => {                                    
     … 14 more lines (ctrl+o to expand)

  Searched for 1 pattern, ran 1 shell command (ctrl+o to expand)

● The heredoc collapsed the double backslashes, the same problem as earlier.
  I'll rewrite the file with Write.

● Write(tests\rastreabilidade.test.ts)
  ⎿  Added 5 lines, removed 5 lines
      20  }
      21  
      22  const arquivosDeTeste = readdirSync('tests', { recursive: true,
           encoding: 'utf8' })
      23 -  .map((caminho) => caminho.replaceAll('\', '/'))              
      23 +  .map((caminho) => caminho.replaceAll('\\', '/'))             
      24    .filter((caminho) => caminho.endsWith('.test.ts'));
      25  
      26  /** Títulos de `it(...)` de todos os arquivos de teste. */
      27  const titulos = arquivosDeTeste.flatMap((caminho) =>
      28 -  [...readFileSync(join('tests', caminho), 'utf8').matchAll(/\b
         -it\(\s*(['"`])((?:\.|(?!\1).)*)\1/g)].map((m) =>               
      29 -    m[2]!.replace(/\(.)/g, '$1'),                              
      28 +  [...readFileSync(join('tests', caminho), 'utf8').matchAll(/\b
         +it\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g)].map((m) =>              
      29 +    m[2]!.replace(/\\(.)/g, '$1'),                             
      30    ),
      31  );
      32  
     ...
      46  
      47    it('Infra › rastreabilidade: toda RN-NNN tem exatamente um ar
          quivo rn-NNN-*.test.ts', () => {
      48      const porRegra = regras.map((rn) => {
      49 -      const arquivos = arquivosDeTeste.filter((c) => new RegExp
         -(`(^|/)${rn.toLowerCase()}-[^/]*\.test\.ts$`).test(c));        
      50 -      return [rn, arquivos.length] as const;                   
      49 +      const padrao = new RegExp(`(^|/)${rn.toLowerCase()}-[^/]*
         +\\.test\\.ts$`);                                               
      50 +      return [rn, arquivosDeTeste.filter((c) => padrao.test(c))
         +.length] as const;                                             
      51      });
      52      expect(porRegra.filter(([, n]) => n !== 1), 'RN com zero ou
           mais de um arquivo').toEqual([]);
      53    });

● Heredocs in this shell collapse \\ to \. I'll check every file I wrote that
  way for lost escapes.

  Searched for 1 pattern (ctrl+o to expand)

● Only the CLI test title lost its escape: it now contains a real newline
  instead of \n. I'll fix that with Edit and make sure single-backslash regexes
  survived.

● Update(tests\cli.test.ts)
  ⎿  Added 1 line, removed 1 line
      78      expect(json.itens.map((i: { motivo: { codigo: string } }) =
          > i.motivo.codigo)).toEqual(['DADO_INVALIDO', 'DADO_INVALIDO'])
          ;
      79    });
      80  
      81 -  it('Infra › CLI: exemplo → código 0, resumo no stdout, JSON i
         -ndentado com \n final', () => {                                
      81 +  it('Infra › CLI: exemplo → código 0, resumo no stdout, JSON i
         +ndentado com \\n final', () => {                               
      82      const saida = arquivo();
      83      const r = calcular('exemplos/despesas-exemplo.json', saida)
          ;
      84      expect(r.codigo).toBe(0);

  Searched for 1 pattern (ctrl+o to expand)
● The source regexes are intact. I'll commit the title fix, then check that the
  traceability test actually fails when an edge-case it is missing.

  Ran 1 shell command (ctrl+o to expand)

● With the "Fim de semana" it removed, the suite failed and named the missing
  case. The file is restored. Committing T-041.

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && TIPO=test bash
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/f8a7bb5f-129f…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      234    - **Aceite:** passam `Borda › Lista de despesas vazia`, `Bor
           da › Arquivo sem periodo`, `Borda › inicio depois de fim`, `Bo
           rda › colaborador.id vazio`, `Borda › periodo.inicio não textu
           al` e `Borda › Arquivo que não é objeto`
      235    - **Commit:** `247de37`
      236  
      237 -- [ ] **T-041** — Criar `tests/rastreabilidade.test.ts` (DT-00
          -5): lê `specs/001-motor-reembolso/spec.md`, extrai todo `### R
          -N-NNN` e a 1ª coluna da tabela da seção 7 (sem as crases), lê 
          -os títulos de teste em `tests/**/*.test.ts` e falha listando o
          - que ficou sem teste; confere também que toda RN tem **exatame
          -nte um** arquivo `tests/**/rn-NNN-*.test.ts`                  
      237 +- [x] **T-041** — Criar `tests/rastreabilidade.test.ts` (DT-00
          +5): lê `specs/001-motor-reembolso/spec.md`, extrai todo `### R
          +N-NNN` e a 1ª coluna da tabela da seção 7 (sem as crases), lê 
          +os títulos de teste em `tests/**/*.test.ts` e falha listando o
          + que ficou sem teste; confere também que toda RN tem **exatame
          +nte um** arquivo `tests/**/rn-NNN-*.test.ts`                  
      238    - **Atende:** RN-001, RN-002, RN-003, RN-004, RN-005, RN-006
           , RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-0
           14, RN-015 (seção 9, critérios 2 e 3)
      239    - **Aceite:** passam `Infra › rastreabilidade: toda RN-NNN d
           a spec aparece no início de um título de teste` , `Infra › ras
           treabilidade: toda linha da seção 7 tem um teste Borda › <Caso
           >` e `Infra › rastreabilidade: toda RN-NNN tem exatamente um a
           rquivo rn-NNN-*.test.ts`; removendo temporariamente um `it` de
            borda, a suíte fica vermelha
      240 -  - **Commit:** `<hash preenchido depois>`                    
      240 +  - **Commit:** `65e8dc0`                                     
      241  
      242  - [ ] **T-042** — Reescrever `README.md` com como instalar, ro
           dar e testar (Node ≥ 24, `npm install`, `npm test`, `npm run t
           ypecheck`, comando `calcular`), apontando para `specs/001-moto
           r-reembolso/` e `quickstart.md`
      243    - **Atende:** seção 9 (entrega: "como rodar e como testar", 
           DESAFIO.md)
  ⎿  (timeout 3m)

● T-042: rewriting the README. I'll read the current README and quickstart.md
  first.

  Ran 1 shell command (ctrl+o to expand)

● Write(README.md)
  ⎿  Added 78 lines, removed 73 lines
        1 -# Desafio Prático — Spec Driven Development                   
        1 +# Motor de Cálculo de Reembolso                               
        2  
        3 -Aula bônus de SDD, fechando a trilha:                         
        3 +CLI que lê um JSON com as despesas de um colaborador num perío
          +do e grava um                                                 
        4 +JSON com, para cada despesa, o valor reembolsável, o status e 
          +o motivo                                                      
        5 +padronizado da decisão, mais um resumo com os totais. As regra
          +s vêm da                                                      
        6 +Política de Reembolso v3 do RH, com as ambiguidades decididas 
          +e registradas                                                 
        7 +na spec.                                                      
        8  
        5 -`AI Fluency` → `Claude 101` → `Claude Code 101` → `Building wi
          -th the Claude API` → `Claude Code in Action` → `Módulo SDD` → 
          -**Desafio**                                                   
        9 +O projeto foi feito com Spec Driven Development. O enunciado d
          +o desafio está                                                
       10 +em [`DESAFIO.md`](DESAFIO.md).                                
       11  
        7 -**Individual · 2 dias · Claude Code**                         
       12 +## Requisitos                                                 
       13  
        9 ----                                                           
       14 +- **Node ≥ 24.** O TypeScript roda direto no Node, sem etapa d
          +e build                                                       
       15 +  (`node --version` para conferir).                           
       16 +- npm (vem com o Node).                                       
       17  
       11 -## Comece por aqui                                            
       18 +## Instalar                                                   
       19  
       13 -1. **[`DESAFIO.md`](DESAFIO.md)** — o enunciado. Leia inteiro 
          -antes de escrever qualquer coisa.                             
       14 -2. **[`RUBRICA.md`](RUBRICA.md)** — como você é avaliado. É pú
          -blica de propósito; leia antes de começar.                    
       15 -3. **[`exemplos/despesas-exemplo.json`](exemplos/despesas-exem
          -plo.json)** — a entrada de referência. Não é decoração: percor
          -ra item por item antes de escrever a spec.                    
       16 -4. **[`FAQ.md`](FAQ.md)** — travou? Comece por aqui. **O instr
          -utor está fora durante o desafio**, então o FAQ é o canal de s
          -uporte.                                                       
       20 +```bash                                                       
       21 +npm install                                                   
       22 +```                                                           
       23  
       18 ----                                                           
       24 +Só instala as dependências de desenvolvimento (TypeScript, Vit
          +est, Ajv). O                                                  
       25 +motor não tem dependência de runtime.                         
       26  
       20 -## Como participar                                            
       27 +## Rodar                                                      
       28  
       22 -**1. Faça um fork deste repositório.** Ele precisa ser público
          -, ou você não conseguirá compartilhar depois.                 
       23 -                                                              
       24 -**2. Clone o seu fork e prepare a estrutura de trabalho:**    
       25 -                                                              
       29  ```bash
       27 -git clone https://github.com/<seu-usuario>/sdd-desafio.git    
       28 -cd sdd-desafio                                                
       29 -cp template/CLAUDE.md .                                       
       30 -cp -r template/specs .                                        
       31 -cp -r template/docs .                                         
       32 -git add -A && git commit -m "chore: estrutura inicial a partir
          - do template"                                                 
       30 +node src/cli.ts calcular --input exemplos/despesas-exemplo.jso
          +n --output resultado.json                                     
       31 +# ou                                                          
       32 +npm run reembolso -- calcular --input exemplos/despesas-exempl
          +o.json --output resultado.json                                
       33  ```
       34  
       35 -<details>                                                     
       36 -<summary>PowerShell</summary>                                 
       35 +Saída esperada no terminal:                                   
       36  
       38 -```powershell                                                 
       39 -git clone https://github.com/<seu-usuario>/sdd-desafio.git    
       40 -cd sdd-desafio                                                
       41 -Copy-Item template\CLAUDE.md .                                
       42 -Copy-Item template\specs . -Recurse                           
       43 -Copy-Item template\docs . -Recurse                            
       44 -git add -A; git commit -m "chore: estrutura inicial a partir d
          -o template"                                                   
       37  ```
       46 -</details>                                                    
       38 +14 itens processados; total reembolsável R$ 815,43            
       39 +```                                                           
       40  
       48 -Os arquivos em `template/` são esqueletos com as perguntas que
          - cada documento precisa responder. Deixe a pasta `template/` o
          -nde está — ela serve de referência.                           
       41 +| Situação | Código de saída | O que acontece |               
       42 +|---|---|---|                                                 
       43 +| Sucesso | `0` | grava o arquivo de saída (JSON indentado, `\
          +n` no fim) e imprime o resumo |                               
       44 +| Entrada inválida: arquivo inexistente, JSON inválido, sem `c
          +olaborador.id`, `periodo` ou `despesas`, datas inválidas, `ini
          +cio` depois de `fim` (RN-015) | `1` | `erro: ...` no `stderr`;
          + o arquivo de saída **não** é criado nem alterado |           
       45 +| Uso incorreto (subcomando ou opção ausente/desconhecida) | `
          +2` | `uso: ...` no `stderr` |                                 
       46  
       50 -**3. Trabalhe no seu fork**, seguindo as três regras do jogo d
          -escritas no [`DESAFIO.md`](DESAFIO.md):                       
       47 +Uma despesa com dado inválido **não** é erro de execução: ela 
          +sai recusada                                                  
       48 +com `DADO_INVALIDO` e as outras seguem normalmente (RN-003).  
       49  
       52 -- Nenhum commit sem task                                      
       53 -- Explicação no chat que não está na spec é bug de spec       
       54 -- Interações exportadas (`/export`) e commitadas em `docs/sess
          -ions/`                                                        
       50 +A interface completa está em                                  
       51 +[`contracts/cli.md`](specs/001-motor-reembolso/contracts/cli.m
          +d), e o formato                                               
       52 +da saída em                                                   
       53 +[`contracts/saida.schema.json`](specs/001-motor-reembolso/cont
          +racts/saida.schema.json).                                     
       54  
       56 -**4. No Dia 2, às 10h**, você recebe uma mudança de requisito 
          -pelo canal da turma. Ela é obrigatória e vale 20 pontos. Chegu
          -e nesse momento com o sistema base funcionando e testado.     
       55 +## Testar                                                     
       56  
       58 -> Durante os dois dias o instrutor está de férias e não respon
          -de mensagens. Dúvida de processo: [`FAQ.md`](FAQ.md). Dúvida s
          -obre o que a política do RH significa não tem resposta — decid
          -ir isso é o exercício.                                        
       59 -                                                              
       60 -**5. Entregue** enviando o link do seu fork no formulário. Pra
          -zo: **Dia 2, 18h**.                                           
       61 -                                                              
       62 ----                                                           
       63 -                                                              
       64 -## O que o seu fork precisa conter ao final                   
       65 -                                                              
       57 +```bash                                                       
       58 +npm test           # Vitest: regras, casos de borda, exemplo o
          +ficial, contrato, CLI e rastreabilidade                       
       59 +npm run typecheck  # tsc --noEmit                             
       60  ```
       67 -seu-fork/                                                     
       68 -├── CLAUDE.md                     # convenções do projeto para
          - o agente                                                     
       69 -├── README.md                     # como rodar e como testar o
          - SEU projeto                                                  
       70 -├── specs/                                                    
       71 -│   └── 001-motor-reembolso/                                  
       72 -│       ├── spec.md               # o QUÊ e o PORQUÊ          
       73 -│       ├── plan.md               # o COMO                    
       74 -│       ├── tasks.md              # T-001..T-0NN, com critério
          - de aceite                                                    
       75 -│       └── DECISIONS.md          # log de mudanças de spec   
       76 -├── src/                                                      
       77 -├── tests/                                                    
       78 -└── docs/                                                     
       79 -    ├── sessions/                 # exports das suas conversas
          - com o Claude                                                 
       80 -    └── RELATORIO.md              # o relatório final         
       81 -```                                                           
       61  
       83 -Sobre o `README.md`: substitua este arquivo pelo README do **s
          -eu** projeto — como rodar, como testar, o que você construiu. 
          -Um README que não permite rodar o projeto custa pontos.       
       62 +A suíte cobre:                                                
       63  
       85 ----                                                           
       64 +- **Uma regra, um arquivo:** cada `RN-NNN` da spec tem o seu  
       65 +  `tests/**/rn-NNN-*.test.ts`, com títulos que começam pelo ID
       66 +  (`RN-010 › ...`).                                           
       67 +- **Casos de borda:** cada linha da tabela da seção 7 da spec 
          +é um teste                                                    
       68 +  `Borda › <Caso>` em `tests/casos-de-borda.test.ts`.         
       69 +- **Exemplo oficial:** `tests/exemplo.test.ts` confere        
       70 +  `exemplos/despesas-exemplo.json` item a item com a tabela da
          + seção 9.                                                     
       71 +- **Contrato:** `tests/contrato-saida.test.ts` valida a saída 
          +contra o JSON                                                 
       72 +  Schema.                                                     
       73 +- **CLI:** `tests/cli.test.ts` roda o comando num processo fil
          +ho (códigos de                                                
       74 +  saída, nenhuma saída parcial em erro, determinismo).        
       75 +- **Rastreabilidade:** `tests/rastreabilidade.test.ts` lê a sp
          +ec e falha se                                                 
       76 +  alguma `RN-NNN` ou linha da seção 7 ficar sem teste.        
       77  
       87 -## Antes de começar, confirme que o `/export` funciona        
       78 +O roteiro de validação manual está em                         
       79 +[`quickstart.md`](specs/001-motor-reembolso/quickstart.md).   
       80  
       89 -Abra o Claude Code, troque duas mensagens, rode `/export` e co
          -nfirme que o arquivo foi gerado.                              
       81 +## Documentação                                               
       82  
       91 -Faça isso **agora**, não no Dia 2. Sem `docs/sessions/`, o cri
          -tério de relatório vale zero — e já aconteceu de gente que fez
          - tudo certo descobrir no último dia que não tinha registro nen
          -hum do trabalho.                                              
       83 +| Arquivo | Conteúdo |                                        
       84 +|---|---|                                                     
       85 +| [`spec.md`](specs/001-motor-reembolso/spec.md) | **o quê**: 
          +regras (`RN-NNN`), ambiguidades decididas (`AMB-NNN`), casos d
          +e borda e critérios de aceite |                               
       86 +| [`plan.md`](specs/001-motor-reembolso/plan.md) | **como**: a
          +rquitetura, representação da política e decisões técnicas |   
       87 +| [`research.md`](specs/001-motor-reembolso/research.md) · [`d
          +ata-model.md`](specs/001-motor-reembolso/data-model.md) | deci
          +sões técnicas detalhadas e modelo de dados |                  
       88 +| [`tasks.md`](specs/001-motor-reembolso/tasks.md) | **em que 
          +ordem**: tasks `T-NNN`, cada uma com critério de aceite e o co
          +mmit que a fechou |                                           
       89 +| [`DECISIONS.md`](specs/001-motor-reembolso/DECISIONS.md) | l
          +og das mudanças de spec |                                     
       90 +| [`docs/sessions/`](docs/sessions/) | exports das sessões com
          + o Claude Code |                                              
       91  
       93 -Exporte ao final de **cada** sessão, nomeando `docs/sessions/0
          -1-descricao-curta.md`, `02-...`, e assim por diante.          
       92 +## Estrutura                                                  
       93  
       95 ----                                                           
       94 +```                                                           
       95 +src/                                                          
       96 +  cli.ts          # argumentos, leitura e gravação de arquivos
          +, códigos de saída                                            
       97 +  io/             # JSON sem float (json.ts), validação do arq
          +uivo (entrada.ts), montagem da saída (saida.ts)               
       98 +  nucleo/         # regras em funções puras, sem E/S; a ordem 
          +da seção 8 da spec vive em motor.ts                           
       99 +tests/            # um arquivo por RN, casos de borda, exemplo
          +, contrato, CLI, rastreabilidade                              
      100 +exemplos/         # arquivo de entrada de referência          
      101 +```                                                           
      102  
       97 -## O resumo em um parágrafo                                   
       98 -                                                              
       99 -Você vai receber uma política de reembolso escrita por um RH, 
          -com a redação ruim que uma política de RH real tem. Ela é ambí
          -gua em vários pontos, e você não tem acesso a ninguém para tir
          -ar dúvida. O trabalho não é implementar — é **especificar**: e
          -ncontrar cada ambiguidade, decidir explicitamente, justificar 
          -e registrar. O produto funcionando vale **10 dos 100 pontos**.
          - Os outros 90 estão na spec, na rastreabilidade `spec → tasks 
          -→ commits → testes`, na resposta à mudança de requisito do Dia
          - 2 e no relatório.                                            
      100 -                                                              
      101 -Isso é deliberado. Um projeto que roda perfeitamente com spec 
          -fraca tira nota baixa; um projeto com bug conhecido, spec impe
          -cável e trilha limpa tira nota alta.                          
      103 +Valores em dinheiro são centavos inteiros (`bigint`) do começo
          + ao fim. A                                                    
      104 +entrada é lida pelo texto de cada número e a saída é gravada c
          +om duas casas,                                                
      105 +sem passar por ponto flutuante. Todos os valores da política (
          +limites, fator                                                
      106 +de viagem, limiar de nota fiscal) ficam em `src/nucleo/politic
          +a.ts`.                                                        

● Before committing I'll check the README against quickstart.md sections 1–4 in
  a clean clone in the scratchpad.

  Ran 1 shell command (ctrl+o to expand)

● Quickstart sections 1–4 all behave as described in the clean clone. I'll also
  check section 5.

  Ran 1 shell command (ctrl+o to expand)

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" &&
      S="C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-s
      dd-desafio/f8a7bb5f-129f-4039-97c7-47…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+2 -2)
      239    - **Aceite:** passam `Infra › rastreabilidade: toda RN-NNN d
           a spec aparece no início de um título de teste` , `Infra › ras
           treabilidade: toda linha da seção 7 tem um teste Borda › <Caso
           >` e `Infra › rastreabilidade: toda RN-NNN tem exatamente um a
           rquivo rn-NNN-*.test.ts`; removendo temporariamente um `it` de
            borda, a suíte fica vermelha
      240    - **Commit:** `65e8dc0`
      241  
      242 -- [ ] **T-042** — Reescrever `README.md` com como instalar, ro
          -dar e testar (Node ≥ 24, `npm install`, `npm test`, `npm run t
          -ypecheck`, comando `calcular`), apontando para `specs/001-moto
          -r-reembolso/` e `quickstart.md`                               
      242 +- [x] **T-042** — Reescrever `README.md` com como instalar, ro
          +dar e testar (Node ≥ 24, `npm install`, `npm test`, `npm run t
          +ypecheck`, comando `calcular`), apontando para `specs/001-moto
          +r-reembolso/` e `quickstart.md`                               
      243    - **Atende:** seção 9 (entrega: "como rodar e como testar", 
           DESAFIO.md)
      244    - **Aceite:** seguir o README do zero num clone limpo reprod
           uz as seções 1 a 4 do `quickstart.md` com o resultado esperado
      245 -  - **Commit:** `<hash preenchido depois>`                    
      245 +  - **Commit:** `d180c28`                                     
      246  
      247  ---
      248  
  ⎿  (timeout 3m)

● Every task has a commit. Last, I'll check that tasks.md has no unchecked tasks
  or placeholders left, then run the full suite once more.

  Ran 1 shell command (ctrl+o to expand)

● I've finished all 42 tasks in tasks.md. The last run passed all 244 tests, and
  npm run typecheck shows no errors. Each task is marked [x] with its commit
  hash, and there were no hooks to run.

  - Example file: the output for exemplos/despesas-exemplo.json matches the
    section 9 table item for item, including the totals: 1861.84 requested,
    815.43 reimbursable, 1046.41 not reimbursed, and 4 approved, 3 partial, 7
    refused. The output also passes the contract schema check.
  - Traceability: each RN-NNN has exactly one test file, and each of the 80 rows
    in section 7 has its own Borda › <Caso> test. I checked that removing one
    of those tests makes the traceability test fail and name the missing case.
  - Clean clone: following the README from scratch, npm install, the tests and
    quickstart sections 1–5 all gave the expected results, including
    byte-identical output from two runs.

  Commits: there are 86 local commits and nothing has been pushed. Each task has
  a feat, test or docs(T-NNN) commit plus a docs(tasks) commit that marks it
  done. Two small fixes got their own commits: an unescaped dot in the T-040
  test regexes, and a real line break that had ended up in a T-038 test title.

  Where the code differs from the plan documents (no business rule changed, but
  you may want a docs(plan): update):
  - NumeroJson is a class, so a number read from the file can't be confused with
    an ordinary {"texto": ...} object. data-model.md still shows it as { texto
    }.
  - DespesaElegivel.diarias was removed. The number of nights is worked out when
    needed, in diariasDe.
  - Recusa is now one type per code, each with its own details, instead of a
    generic record.
  - Two files are not in the plan §2 folder list: src/nucleo/status.ts (derives
    the status, used by the motor, the summary and the output) and
    src/json-nativo.d.ts (types for JSON.rawJSON).
  - montarSaida takes only the result, not (resultado, entrada), because the
    result already carries the colaborador/periodo echoes. I also added
    lerEntrada(texto), so invalid JSON is reported the same way as the other
    input errors.
  - If a future policy change produced a travel-extended limit that isn't a
    whole number of centavos, the program stops with an error rather than
    rounding. That follows plan §7: decide the rounding in the spec first.

  Left for you:
  - The checkboxes in spec section 9 are still unticked. Changing the spec
    requires a DECISIONS.md entry, so I didn't touch it.
  - The constitution asks for sessions to be exported, so export this one with
    /export to docs/sessions/.
  - Push when you're ready.