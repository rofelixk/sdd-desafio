
> /speckit-tasks

  Read 8 files, ran 3 shell commands (ctrl+o to expand)

● Lendo a spec, o plano e os artefatos; agora confiro o layout do repositório
  antes de gerar o tasks.md.

  Searched for 3 patterns, read 1 file (ctrl+o to expand)

● Tenho tudo o que preciso. O tasks.md atual ainda é só o template (nenhuma task
  real para preservar), então vou gerá-lo do zero, numerando a partir de T-001.

● Write(specs\001-motor-reembolso\tasks.md)
  ⎿  Added 279 lines, removed 16 lines
        8  
        9  **Formato do commit:** `feat(T-003): <descrição>` · `test(T-00
           3): <descrição>`
       10  
       11 +**Base:** `spec.md` v1.1 · `plan.md` v1.0 · `data-model.md` · 
          +`research.md` · `contracts/`                                  
       12 +                                                              
       13 +**Convenções que valem para todas as tasks** (do `plan.md` §2 
          +e §6 e do `CLAUDE.md`):                                       
       14 +                                                              
       15 +- `src/nucleo/` é puro (sem E/S, relógio ou ambiente). Só `src
          +/cli.ts` e `src/io/` tocam em arquivo/JSON.                   
       16 +- Só sintaxe apagável (`erasableSyntaxOnly`): sem `enum`/`name
          +space`/parameter properties; imports relativos com `.ts`.     
       17 +- Dinheiro é `Centavos = bigint` em todo o núcleo. Nunca `numb
          +er` para dinheiro. Nenhum número da política fora de `src/nucl
          +eo/politica.ts`.                                              
       18 +- Título de teste começa pelo ID: `RN-010 › ...`, ou `Borda › 
          +<Caso>` com o texto **exato** da coluna "Caso" da seção 7 da s
          +pec, sem as crases do markdown (ex.: `` `id` repetido `` → `Bo
          +rda › id repetido`). Testes que não verificam regra de negócio
          + usam `Infra › ...`.                                          
       19 +- Um arquivo de teste por RN em `tests/nucleo/rn-0NN-<tema>.te
          +st.ts`, com `describe('RN-0NN — <título da spec>')`.          
       20 +- "Aceite" = os testes listados passam em `npm test` **e** `np
          +m run typecheck` fica sem erros.                              
       21 +                                                              
       22  ---
       23  
       24  ## Fase 1 — Fundação
       25  
       15 -- [ ] **T-001** — <o que faz>                                 
       16 -  - **Atende:** RN-001                                        
       17 -  - **Aceite:** <o teste que precisa passar>                  
       26 +- [ ] **T-001** — Criar o esqueleto do projeto: `package.json`
          + (`"type": "module"`, `engines.node >= 24`, scripts `test` = `
          +vitest run`, `typecheck` = `tsc --noEmit`, `reembolso` = `node
          + src/cli.ts`; devDependencies `typescript@5.9`, `vitest@5`, `a
          +jv`, `@types/node`), `tsconfig.json` (`strict`, `noEmit`, `era
          +sableSyntaxOnly`, `allowImportingTsExtensions`, `verbatimModul
          +eSyntax`, `target`/`lib` ES2024+, `module`/`moduleResolution` 
          +`nodenext`), `vitest.config.ts` e `tests/infra.test.ts`       
       27 +  - **Atende:** (infraestrutura) — plan §0, R-01              
       28 +  - **Aceite:** `Infra › runtime oferece JSON.rawJSON e contex
          +t.source no reviver do JSON.parse` passa; `npm run typecheck` 
          +sem erros                                                     
       29    - **Commit:** `<hash preenchido depois>`
       30  
       20 -- [ ] **T-002** — <...>                                       
       21 -  - **Atende:**                                               
       22 -  - **Aceite:**                                               
       23 -  - **Commit:**                                               
       31 +- [ ] **T-002** — [P] Criar `src/nucleo/tipos.ts` (tipos do `d
          +ata-model.md`: `Centavos`, `DataISO`, `Categoria`, `NumeroJson
          +`, `Entrada`, `DespesaValida`, `DespesaElegivel`, `Recusa`, `P
          +arcela`, `ResultadoItem`, `Motivo`, `Resumo`, `Resultado`, e a
          + união de códigos de motivo da seção 4 da spec como tipo liter
          +al) e `src/nucleo/politica.ts` com o objeto `POLITICA` exatame
          +nte como no plan §4 (cada valor com o ID da RN em comentário) 
       32 +  - **Atende:** (infraestrutura) — plan §3 e §4, data-model §5
       33 +  - **Aceite:** `Infra › política: categorias reconhecidas são
          + exatamente as chaves de POLITICA.limites` passa (em `tests/nu
          +cleo/politica.test.ts`); `npm run typecheck` sem erros        
       34 +  - **Commit:** `<hash preenchido depois>`                    
       35  
       36 +- [ ] **T-003** — [P] Criar `src/io/json.ts`: `lerJson(texto)`
          + com `JSON.parse` + reviver que troca **todo** número por `Num
          +eroJson { texto }` usando `context.source` (R-03); `serializar
          +Json(valor)` com indentação de 2 espaços e `\n` final, reemiti
          +ndo `NumeroJson` e valores monetários via `JSON.rawJSON` (R-04
          +)                                                             
       37 +  - **Atende:** (infraestrutura) — R-03, R-04, contracts/cli.m
          +d                                                             
       38 +  - **Aceite:** em `tests/io/json.test.ts` passam `Infra › jso
          +n: número vira NumeroJson com o texto original ("10.005", "1.0
          +0005e2")`, `Infra › json: números aninhados em objetos e lista
          +s também são embrulhados`, `Infra › json: NumeroJson é reemiti
          +do com o mesmo texto` e `Infra › json: JSON.rawJSON("45.00") s
          +ai como número 45.00, não como texto`                         
       39 +  - **Commit:** `<hash preenchido depois>`                    
       40 +                                                              
       41 +- [ ] **T-004** — [P] Criar `src/nucleo/datas.ts` (R-05): `ehD
          +ataValida(texto)` (regex `^\d{4}-\d{2}-\d{2}$` + existência no
          + calendário), `somarDias(data, k)` com `Date.UTC` e comparação
          + por texto                                                    
       42 +  - **Atende:** (infraestrutura) — R-05                       
       43 +  - **Aceite:** em `tests/nucleo/datas.test.ts` passam `Infra 
          +› datas: 2026-02-30 e 2026-07-32 são inválidas e 2024-02-29 é 
          +válida`, `Infra › datas: formato diferente de AAAA-MM-DD é inv
          +álido ("2026-7-3", "03/07/2026")` e `Infra › datas: 2026-07-31
          + + 1 dia = 2026-08-01, independente do fuso`                  
       44 +  - **Commit:** `<hash preenchido depois>`                    
       45 +                                                              
       46 +- [ ] **T-005** — Criar `src/nucleo/dinheiro.ts` com a formata
          +ção de centavos: `formatarDecimal(c)` (`4500n` → `"45.00"`, pa
          +ra a saída JSON) e `formatarReais(c)` (`6000n` → `"R$ 60,00"`,
          + para `motivo.descricao`)                                     
       47 +  - **Atende:** (infraestrutura) — R-02, R-04                 
       48 +  - **Aceite:** em `tests/nucleo/dinheiro.test.ts` passam `Inf
          +ra › dinheiro: formatarDecimal 4500n → "45.00", -4500n → "-45.
          +00", 5n → "0.05", 0n → "0.00"` e `Infra › dinheiro: formatarRe
          +ais 6000n → "R$ 60,00" e 186184n → "R$ 1.861,84"`             
       49 +  - **Commit:** `<hash preenchido depois>`                    
       50 +                                                              
       51  ## Fase 2 — Regras de negócio
       52  
       27 -- [ ] **T-00N** — <...>                                       
       28 -  - **Atende:** RN-00X, AMB-00Y                               
       29 -  - **Aceite:**                                               
       30 -  - **Commit:**                                               
       53 +- [ ] **T-006** — [P] Implementar `paraCentavos(texto)` em `sr
          +c/nucleo/dinheiro.ts`: converte o texto de um número (sinal, d
          +ígitos, ponto decimal, expoente) em `Centavos` arredondando **
          +meio para o par** sobre os dígitos, sem passar por float (DT-0
          +01)                                                           
       54 +  - **Atende:** RN-001, AMB-013                               
       55 +  - **Aceite:** em `tests/nucleo/rn-001-arredondamento.test.ts
          +` passam `RN-001 › 33.333 → 33.33`, `RN-001 › 10.005 → 10.00 (
          +meio, 0 é par)`, `RN-001 › 10.015 → 10.02 (meio, 2 é par)`, `R
          +N-001 › 33.345 → 33.34`, `RN-001 › 33.3451 → 33.35 (fora do me
          +io)`, `RN-001 › 100.004 → 100.00`, `RN-001 › -45.005 → -45.00 
          +(meio para o par também no negativo)` e `RN-001 › expoente 1.0
          +0005e2 → 100.00`                                              
       56 +  - **Commit:** `<hash preenchido depois>`                    
       57  
       58 +- [ ] **T-007** — [P] Criar `src/nucleo/texto.ts` (R-06): `nor
          +malizar(texto)` = `trim` → minúsculas → `NFD` → remove `\p{M}`
          +; e `normalizarFornecedor(texto)` = só `trim` + minúsculas (a 
          +RN-007 não manda tirar acento do fornecedor)                  
       59 +  - **Atende:** RN-002, AMB-014                               
       60 +  - **Aceite:** em `tests/nucleo/rn-002-categoria.test.ts` pas
          +sam `RN-002 › "ALIMENTACAO", " Alimentação " e "alimentacao" v
          +iram alimentacao` e `RN-002 › "Transporte_Urbano" e "HOSPEDAGE
          +M" viram transporte_urbano e hospedagem`                      
       61 +  - **Commit:** `<hash preenchido depois>`                    
       62 +                                                              
       63 +- [ ] **T-008** — Criar `src/nucleo/despesa.ts` com `validarDe
          +spesa(bruta, indice)` → `DespesaValida | Recusa(DADO_INVALIDO)
          +`: item que não é objeto; `id`, `data`, `categoria` ausentes, 
          +nulos, vazios/só espaços ou não textuais; `data` inválida (T-0
          +04); `valor` ausente. A `Recusa` carrega os ecos **brutos** de
          + `id`/`data`/`categoria` (ausente → `null`) e o `valor_solicit
          +ado` arredondado quando o `valor` é um `NumeroJson` (neste pas
          +so só `NumeroJson` é aceito como valor; texto vem na T-009). A
          +plica `normalizar` na categoria (RN-002) sem recusar categoria
          + desconhecida                                                 
       64 +  - **Atende:** RN-003, AMB-018, AMB-023                      
       65 +  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pas
          +sam `RN-003 › "data": "2026-07-32" → DADO_INVALIDO com data "2
          +026-07-32" no eco`, `RN-003 › id, data, categoria ou valor aus
          +entes → DADO_INVALIDO`, `RN-003 › id, data ou categoria nulos,
          + vazios ou só com espaços → DADO_INVALIDO`, `RN-003 › "categor
          +ia": "" e "categoria": 123 → DADO_INVALIDO, e não CATEGORIA_NA
          +O_REEMBOLSAVEL`, `RN-003 › item que não é objeto (42, "x", nul
          +l) → DADO_INVALIDO com ecos e valor_solicitado nulos` e `RN-00
          +3 › eco sai exatamente como veio (categoria 123 continua o Num
          +eroJson "123")`                                               
       66 +  - **Commit:** `<hash preenchido depois>`                    
       67 +                                                              
       68 +- [ ] **T-009** — Aceitar `valor` como texto no formato fechad
          +o em `src/nucleo/despesa.ts`: sem os espaços das bordas, casa 
          +`^-?\d+([.,]\d+)?$`; vírgula vira ponto e segue para `paraCent
          +avos` (RN-001). Qualquer outro texto ou tipo (vazio, milhar, m
          +oeda, dois separadores, letras, booleano, lista, objeto, nulo)
          + → `DADO_INVALIDO` com `valor_solicitado` nulo                
       69 +  - **Atende:** RN-003, AMB-021, AMB-023                      
       70 +  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pas
          +sam `RN-003 › "45.00", "45,00" e 45.00 dão valor_solicitado 45
          +,00`, `RN-003 › "1.234,56" e "R$ 45,00" → DADO_INVALIDO`, `RN-
          +003 › "valor": "R$ 45,00" → valor_solicitado nulo`, `RN-003 › 
          +"", "45.", ",5", "1,2,3", "abc", true, [], {} e null não são n
          +uméricos`, `RN-003 › " -45,00 " (espaços nas bordas) é numéric
          +o` e `RN-003 › recusa por outro campo mantém valor_solicitado 
          +arredondado quando o valor é numérico`                        
       71 +  - **Commit:** `<hash preenchido depois>`                    
       72 +                                                              
       73 +- [ ] **T-010** — Validar `tem_nota_fiscal` em `src/nucleo/des
          +pesa.ts`: só `true`/`false` são aceitos; ausente, nulo ou text
          +o vazio/só espaços vale `false`; qualquer outro valor → `DADO_
          +INVALIDO`                                                     
       74 +  - **Atende:** RN-003, AMB-022, AMB-018                      
       75 +  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pas
          +sam `RN-003 › "tem_nota_fiscal": "sim" → DADO_INVALIDO`, `RN-0
          +03 › "tem_nota_fiscal": null vale false`, `RN-003 › tem_nota_f
          +iscal ausente, "" ou "   " vale false` e `RN-003 › tem_nota_fi
          +scal "true", 1, 0, [] ou {} → DADO_INVALIDO`                  
       76 +  - **Commit:** `<hash preenchido depois>`                    
       77 +                                                              
       78 +- [ ] **T-011** — Detectar `id` repetido em `src/nucleo/despes
          +a.ts`: `validarDespesa` recebe o conjunto de ids normalizados 
          +(`normalizar`, T-007) das despesas **anteriores no arquivo** e
          + recusa com `DADO_INVALIDO` se o `id` normalizado já estiver n
          +ele; o eco do `id` sai como veio. ⚠️ Antes de implementar, con
          +firmar na spec se o id de uma despesa anterior **já recusada**
          + conta como "anterior" (ver nota no fim deste arquivo)        
       79 +  - **Atende:** RN-003, AMB-024                               
       80 +  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pas
          +sam `RN-003 › "D-001" depois de "d-001" → DADO_INVALIDO`, `RN-
          +003 › " d-001 " depois de "d-001" → DADO_INVALIDO, com id " d-
          +001 " no eco` e `RN-003 › a primeira ocorrência de "d-001" seg
          +ue normalmente`                                               
       81 +  - **Commit:** `<hash preenchido depois>`                    
       82 +                                                              
       83 +- [ ] **T-012** — [P] Criar `src/nucleo/elegibilidade.ts` com 
          +a etapa 3: `valorSolicitado ≤ 0` → `Recusa(VALOR_NAO_POSITIVO)
          +`                                                             
       84 +  - **Atende:** RN-004, AMB-012                               
       85 +  - **Aceite:** em `tests/nucleo/rn-004-valor-nao-positivo.tes
          +t.ts` passam `RN-004 › d-009 (−45,00) → RECUSADO VALOR_NAO_POS
          +ITIVO, reembolsável 0,00`, `RN-004 › 0,00 → VALOR_NAO_POSITIVO
          +` e `RN-004 › -0.004 arredonda para 0,00 → VALOR_NAO_POSITIVO`
       86 +  - **Commit:** `<hash preenchido depois>`                    
       87 +                                                              
       88 +- [ ] **T-013** — Etapa 4 em `src/nucleo/elegibilidade.ts`: `d
          +ata` fora de `[periodo.inicio, periodo.fim]` (inclusive) → `Re
          +cusa(FORA_DO_PERIODO)`; `periodo.competencia` nunca é lido    
       89 +  - **Atende:** RN-005, AMB-009, AMB-010                      
       90 +  - **Aceite:** em `tests/nucleo/rn-005-periodo.test.ts` passa
          +m `RN-005 › d-008 (2026-04-15, período de julho) → FORA_DO_PER
          +IODO`, `RN-005 › d-014 (2026-07-31 = fim) é elegível`, `RN-005
          + › data = inicio é elegível` e `RN-005 › competencia divergent
          +e de inicio/fim é ignorada`                                   
       91 +  - **Commit:** `<hash preenchido depois>`                    
       92 +                                                              
       93 +- [ ] **T-014** — Etapa 5 em `src/nucleo/elegibilidade.ts`: ca
          +tegoria normalizada que não é chave de `POLITICA.limites` → `R
          +ecusa(CATEGORIA_NAO_REEMBOLSAVEL)`, sem reclassificar         
       94 +  - **Atende:** RN-006, AMB-019                               
       95 +  - **Aceite:** em `tests/nucleo/rn-006-categorias.test.ts` pa
          +ssam `RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBO
          +LSAVEL` e `RN-006 › alimentacao, transporte_urbano e hospedage
          +m são reembolsáveis`                                          
       96 +  - **Commit:** `<hash preenchido depois>`                    
       97 +                                                              
       98 +- [ ] **T-015** — Etapa 6 em `src/nucleo/elegibilidade.ts`: es
          +tado com chave `(data, categoria normalizada, normalizarFornec
          +edor(fornecedor) — ausente/só espaços = "", valorSolicitado)` 
          +→ `id` da primeira ocorrência; ocorrência seguinte com `id` di
          +ferente → `Recusa(DUPLICATA)` com `detalhes.idAceito`. `descri
          +cao` e `tem_nota_fiscal` fora da chave                        
       99 +  - **Atende:** RN-007, AMB-011                               
      100 +  - **Aceite:** em `tests/nucleo/rn-007-duplicatas.test.ts` pa
          +ssam `RN-007 › d-006 segue e d-007 → DUPLICATA`, `RN-007 › dua
          +s alimentações de 40,00 sem fornecedor na mesma data → a 2ª DU
          +PLICATA`, `RN-007 › só uma com fornecedor → as duas seguem`, `
          +RN-007 › "Café" e "Cafe" são fornecedores diferentes (forneced
          +or não tira acento)`, `RN-007 › descricao e tem_nota_fiscal nã
          +o entram no critério` e `RN-007 › recusa DUPLICATA traz o id d
          +a ocorrência aceita`                                          
      101 +  - **Commit:** `<hash preenchido depois>`                    
      102 +                                                              
      103 +- [ ] **T-016** — Etapa 7 em `src/nucleo/elegibilidade.ts`: `v
          +alorSolicitado > POLITICA.limiarNotaFiscal` (estritamente maio
          +r, sobre o valor arredondado) e sem nota → `Recusa(NOTA_FISCAL
          +_AUSENTE)`                                                    
      104 +  - **Atende:** RN-008, AMB-004, AMB-005, AMB-006             
      105 +  - **Aceite:** em `tests/nucleo/rn-008-nota-fiscal.test.ts` p
          +assam `RN-008 › d-003 (100,00, sem NF) não é recusada por nota
          + fiscal`, `RN-008 › d-004 (100,01, sem NF) → NOTA_FISCAL_AUSEN
          +TE`, `RN-008 › d-013 (690,00, sem NF) → NOTA_FISCAL_AUSENTE` e
          + `RN-001 › 100.004 → 100,00 e não exige nota fiscal`          
      106 +  - **Commit:** `<hash preenchido depois>`                    
      107 +                                                              
      108 +- [ ] **T-017** — Criar `src/nucleo/motor.ts` com a **passada 
          +1** (DT-002): percorre `entrada.despesas` na ordem, aplica eta
          +pas 1–2 (`despesa.ts`) e 3–7 (`elegibilidade.ts`) na ordem da 
          +seção 8, com a primeira recusa encerrando a avaliação; a dupli
          +cata só compara despesas que passaram das etapas 1–5. Por enqu
          +anto as elegíveis saem sem alocação de limite                 
      109 +  - **Atende:** RN-003, RN-004, RN-007, RN-008 (seção 8)      
      110 +  - **Aceite:** em `tests/nucleo/motor.test.ts` passam `RN-003
          + › despesa inválida não impede o processamento das outras`, `R
          +N-007 › cópia fora do período não gera duplicata (só compara q
          +uem passou das etapas 1 a 5)`, `RN-007 › duplicata vem antes d
          +a nota fiscal (2ª cópia sem NF sai DUPLICATA)` e `RN-004 › est
          +orno fora do período sai VALOR_NAO_POSITIVO (etapa 3 antes da 
          +4)`                                                           
      111 +  - **Commit:** `<hash preenchido depois>`                    
      112 +                                                              
      113 +- [ ] **T-018** — [P] Criar `src/nucleo/diarias.ts` com `extra
          +irDiarias(descricao)` (R-07): na descrição normalizada, primei
          +ra ocorrência de `(?<!\d[.,]?)(\d+)(?![.,]\d)\s*(diarias?|noit
          +es?)(?![a-z])`; sem ocorrência, descrição ausente ou N = 0 → 1
      114 +  - **Atende:** RN-012, AMB-008                               
      115 +  - **Aceite:** em `tests/nucleo/rn-012-diarias.test.ts` passa
          +m `RN-012 › "Hotel Rio - 2 diarias" → N = 2`, `RN-012 › "Airbn
          +b 3 noites" → N = 3`, `RN-012 › "Hotel 5 estrelas" → N = 1`, `
          +RN-012 › "Hotel 5 estrelas - 2 diarias" → N = 2`, `RN-012 › "H
          +otel 1.5 diarias" → N = 1 (e não 5)`, `RN-012 › "Pousada" e de
          +scrição ausente → N = 1`, `RN-012 › "0 diarias" → N = 1`, `RN-
          +012 › "3 Diárias" → N = 3`, `RN-012 › "12 noites" → N = 12 (in
          +teiro completo)`, `RN-012 › "2diarias" → N = 2 (sem espaço)` e
          + `RN-012 › "2 noitadas" → N = 1`                              
      116 +  - **Commit:** `<hash preenchido depois>`                    
      117 +                                                              
      118 +- [ ] **T-019** — `gerarParcelas(elegivel)` em `src/nucleo/dia
          +rias.ts` (DT-003): hospedagem com N diárias vira N `Parcela`s 
          +nas datas D…D+N−1 com `valor ÷ N` e o resto distribuído um cen
          +tavo por vez nas primeiras noites; qualquer outra categoria vi
          +ra uma parcela na própria data                                
      119 +  - **Atende:** RN-012, AMB-008                               
      120 +  - **Aceite:** em `tests/nucleo/rn-012-diarias.test.ts` passa
          +m `RN-012 › d-010 (480,00, N = 2) → 240,00 em 14/07 e 240,00 e
          +m 15/07`, `RN-012 › 100,00 em 3 noites → 33,34 / 33,33 / 33,33
          +`, `RN-012 › noites atravessam o fim do mês (31/07 → 01/08)` e
          + `RN-012 › despesa que não é hospedagem gera uma parcela`     
      121 +  - **Commit:** `<hash preenchido depois>`                    
      122 +                                                              
      123 +- [ ] **T-020** — Criar `src/nucleo/viagem.ts` com `diasDeViag
          +em(elegiveis)` → conjunto de todas as noites (D…D+N−1) das hos
          +pedagens **elegíveis** recebidas; o check-out (D+N) não entra 
      124 +  - **Atende:** RN-011, AMB-007                               
      125 +  - **Aceite:** em `tests/nucleo/rn-011-viagem.test.ts` passam
          + `RN-011 › hospedagem de 1 diária em D: só D é dia de viagem`,
          + `RN-011 › hospedagem de 2 diárias em D: D e D+1 são dias de v
          +iagem` e `RN-011 › sem hospedagem elegível não há dia de viage
          +m`                                                            
      126 +  - **Commit:** `<hash preenchido depois>`                    
      127 +                                                              
      128 +- [ ] **T-021** — [P] Criar `src/nucleo/limites.ts` com `aloca
          +r(parcelas, diasDeViagem)`: saldo por `(data, categoria)` inic
          +iado com `POLITICA.limites[cat].diario`, multiplicado por `fat
          +orViagem` só se a data é de viagem **e** `ampliaEmViagem`; cad
          +a parcela, na ordem da entrada, recebe `min(valor, saldo)`; so
          +ma por `indiceDespesa`; devolve por despesa o reembolsável, o 
          +limite aplicado, o saldo disponível e o código (`APROVADO_INTE
          +GRAL` / `LIMITE_DIARIO_EXCEDIDO` / `LIMITE_DIARIO_ESGOTADO`)  
      129 +  - **Atende:** RN-009, RN-010, AMB-001, AMB-002, AMB-003, AMB
          +-015, AMB-016, AMB-020                                        
      130 +  - **Aceite:** em `tests/nucleo/rn-009-limites.test.ts` passa
          +m `RN-009 › alimentação isolada de 60,00 → APROVADO 60,00`, `R
          +N-009 › d-012 (sábado, 47,20) → APROVADO 47,20`, `RN-009 › cat
          +egorias diferentes no mesmo dia têm limites independentes` e `
          +RN-009 › em dia de viagem alimentação vai a 90,00 e transporte
          + a 120,00, hospedagem fica em 250,00`; em `tests/nucleo/rn-010
          +-parcial.test.ts` passam `RN-010 › d-001 e d-002 em 03/07: 1ª 
          +PARCIAL 60,00, 2ª ESGOTADO`, `RN-010 › d-014 (61,00) → PARCIAL
          + 60,00` e `RN-010 › despesa que usa exatamente o saldo restant
          +e → APROVADO_INTEGRAL`                                        
      131 +  - **Commit:** `<hash preenchido depois>`                    
      132 +                                                              
      133 +- [ ] **T-022** — **Passada 2** em `src/nucleo/motor.ts`: com 
          +as elegíveis da passada 1, calcula `diasDeViagem`, gera parcel
          +as e chama `alocar`; monta cada `ResultadoItem` com `limite_di
          +ario_aplicado`, `em_viagem`, `diarias` (só hospedagem alocada)
          + e `status` **derivado** de (reembolsável, solicitado); recusa
          +das saem com esses três campos nulos e reembolsável 0         
      134 +  - **Atende:** RN-011, RN-012, RN-002, RN-004, RN-008, AMB-00
          +7, AMB-017, AMB-020                                           
      135 +  - **Aceite:** em `tests/nucleo/motor.test.ts` passam `RN-011
          + › alimentação de 80,00 na data de hospedagem elegível → APROV
          +ADO 80,00 (limite 90,00)`, `RN-011 › hospedagem de 1 diária em
          + D e alimentação 80,00 em D+1 → PARCIAL 60,00`, `RN-011 › hosp
          +edagem de 2 diárias em D e alimentação 80,00 em D+1 → APROVADO
          + 80,00`, `RN-011 › d-013 recusada por NF não torna 22 a 24/07 
          +dias de viagem`, `RN-008 › dia de viagem não amplia o limiar d
          +e nota fiscal`, `RN-012 › h1 14/07 "2 diarias" 480,00 e h2 15/
          +07 "1 diaria" 200,00 → h1 APROVADO 480,00, h2 PARCIAL 10,00`, 
          +`RN-002 › "ALIMENTACAO" e "alimentacao" na mesma data somam no
          + mesmo limite diário`, `RN-004 › d-009 não afeta as despesas d
          +e transporte de 2026-07-11` e `RN-012 › diarias só é preenchid
          +o em hospedagem que chegou ao limite; limite e em_viagem nulos
          + nas recusadas`                                               
      136 +  - **Commit:** `<hash preenchido depois>`                    
      137 +                                                              
      138 +- [ ] **T-023** — [P] Criar `src/nucleo/motivos.ts`: `montarMo
          +tivo(codigo, detalhes)` → `{ codigo, descricao }` com um model
          +o de texto por código da seção 4, valores via `formatarReais`;
          + códigos de limite citam limite aplicado, saldo disponível e v
          +alor cortado; `DUPLICATA` cita o `id` aceito sem falar em frau
          +de/suspeita. Ligar no `motor.ts`                              
      139 +  - **Atende:** RN-013, RN-007                                
      140 +  - **Aceite:** em `tests/nucleo/rn-013-motivos.test.ts` passa
          +m `RN-013 › todo código da seção 4 gera descrição não vazia`, 
          +`RN-013 › LIMITE_DIARIO_EXCEDIDO cita limite, saldo disponível
          + e valor cortado`, `RN-013 › LIMITE_DIARIO_ESGOTADO cita o lim
          +ite e o saldo zerado` e `RN-007 › descrição de DUPLICATA cita 
          +o id da ocorrência aceita`                                    
      141 +  - **Commit:** `<hash preenchido depois>`                    
      142 +                                                              
      143 +- [ ] **T-024** — [P] Criar `src/nucleo/resumo.ts` e ligá-lo n
          +o `motor.ts`: contagens por status; `total_solicitado` soma só
          + `valor_solicitado` positivo e não nulo; `total_reembolsavel` 
          +soma todos os itens; `total_nao_reembolsado = total_solicitado
          + − total_reembolsavel` em centavos                            
      144 +  - **Atende:** RN-014, AMB-012, AMB-023                      
      145 +  - **Aceite:** em `tests/nucleo/rn-014-resumo.test.ts` passam
          + `RN-014 › soma de valor_reembolsavel dos itens = total_reembo
          +lsavel e contagens somam quantidade_itens`, `RN-014 › total_so
          +licitado ignora valores não positivos e nulos`, `RN-014 › tota
          +l_nao_reembolsado = total_solicitado − total_reembolsavel, exa
          +to em centavos` e `RN-014 › lista vazia → contagens 0 e totais
          + 0,00`                                                        
      146 +  - **Commit:** `<hash preenchido depois>`                    
      147 +                                                              
      148 +- [ ] **T-025** — [P] Criar `src/io/entrada.ts` com `validarEn
          +trada(json)` → `Entrada` ou lança `ErroEntrada { mensagem }`: 
          +exige `colaborador.id`, `periodo.inicio` e `periodo.fim` (data
          +s válidas pela T-004, `inicio ≤ fim`) e `despesas` como lista;
          + a mensagem cita o campo ou o problema. `colaborador`/`periodo
          +` guardados brutos para eco                                   
      149 +  - **Atende:** RN-015, AMB-018                               
      150 +  - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `R
          +N-015 › sem periodo → erro cuja mensagem cita periodo`, `RN-01
          +5 › sem colaborador.id → erro cuja mensagem cita colaborador.i
          +d`, `RN-015 › periodo.inicio ou periodo.fim inválidos → erro`,
          + `RN-015 › inicio depois de fim → erro`, `RN-015 › despesas au
          +sente ou que não é lista → erro cuja mensagem cita despesas`, 
          +`RN-015 › texto que não é JSON → erro` e `RN-015 › despesas: [
          +] é entrada válida`                                           
      151 +  - **Commit:** `<hash preenchido depois>`                    
      152 +                                                              
      153  ## Fase 3 — Casos de borda
      154  
       34 -- [ ] **T-00N** — <...>                                       
      155 +> Todas em `tests/casos-de-borda.test.ts`, chamando o motor em
          + memória com uma                                              
      156 +> `Entrada` montada no teste (período padrão 2026-07-01 a 2026
          +-07-31). Um `it`                                              
      157 +> por linha da tabela da seção 7, título `Borda › <Caso>`. Se 
          +um teste falhar,                                              
      158 +> o conserto no código faz parte da mesma task.               
      159  
      160 +- [ ] **T-026** — Casos de borda de nota fiscal e arredondamen
          +to em `tests/casos-de-borda.test.ts`                          
      161 +  - **Atende:** RN-001, RN-008, RN-010, AMB-004, AMB-013      
      162 +  - **Aceite:** passam `Borda › Nota fiscal no limiar exato`, 
          +`Borda › Um centavo acima do limiar`, `Borda › Arredondamento 
          +que cruza o limiar`, `Borda › Arredondamento meio-para-o-par n
          +o limiar`, `Borda › Meio-para-o-par sobe`, `Borda › Fora do po
          +nto médio` e `Borda › Três casas decimais`                    
      163 +  - **Commit:** `<hash preenchido depois>`                    
      164 +                                                              
      165 +- [ ] **T-027** — Casos de borda de limite diário em `tests/ca
          +sos-de-borda.test.ts`                                         
      166 +  - **Atende:** RN-009, RN-010, AMB-001, AMB-002, AMB-015, AMB
          +-016                                                          
      167 +  - **Aceite:** passam `Borda › Exatamente no limite diário`, 
          +`Borda › Um centavo acima do limite`, `Borda › Várias no mesmo
          + dia`, `Borda › Recusada não consome limite`, `Borda › Mesmo d
          +ia, categorias diferentes` e `Borda › Fim de semana`          
      168 +  - **Commit:** `<hash preenchido depois>`                    
      169 +                                                              
      170 +- [ ] **T-028** — Casos de borda de período, valor não positiv
          +o e categoria em `tests/casos-de-borda.test.ts`               
      171 +  - **Atende:** RN-002, RN-004, RN-005, RN-006, AMB-009, AMB-0
          +12, AMB-014, AMB-019                                          
      172 +  - **Aceite:** passam `Borda › Primeiro dia do período`, `Bor
          +da › Último dia do período`, `Borda › Dia seguinte ao período`
          +, `Borda › Estorno`, `Borda › Valor zero`, `Borda › Categoria 
          +em maiúsculas`, `Borda › Categoria com acento` e `Borda › Cate
          +goria desconhecida`                                           
      173 +  - **Commit:** `<hash preenchido depois>`                    
      174 +                                                              
      175 +- [ ] **T-029** — Casos de borda de duplicatas em `tests/casos
          +-de-borda.test.ts`                                            
      176 +  - **Atende:** RN-007, AMB-011                               
      177 +  - **Aceite:** passam `Borda › Mesmo fornecedor, datas difere
          +ntes`, `Borda › Duplicata com e sem NF`, `Borda › Três cópias 
          +idênticas`, `Borda › Fornecedor com grafia diferente`, `Borda 
          +› Fornecedores diferentes`, `Borda › Ambas sem fornecedor`, `B
          +orda › Só uma com fornecedor` e `Borda › Fornecedor vazio`    
      178 +  - **Commit:** `<hash preenchido depois>`                    
      179 +                                                              
      180 +- [ ] **T-030** — Casos de borda de hospedagem e diárias em `t
          +ests/casos-de-borda.test.ts`                                  
      181 +  - **Atende:** RN-012, RN-005, AMB-008                       
      182 +  - **Aceite:** passam `Borda › Diárias na descrição`, `Borda 
          +› Diárias com acento e maiúscula`, `Borda › Duas hospedagens n
          +a mesma noite`, `Borda › Diária média acima do limite`, `Borda
          + › Divisão com centavos`, `Borda › Noite fora do período`, `Bo
          +rda › Número que não é diária`, `Borda › Descrição sem número`
          +, `Borda › Zero diárias`, `Borda › Número solto antes das diár
          +ias` e `Borda › Diárias fracionárias`                         
      183 +  - **Commit:** `<hash preenchido depois>`                    
      184 +                                                              
      185 +- [ ] **T-031** — Casos de borda de viagem em `tests/casos-de-
          +borda.test.ts`                                                
      186 +  - **Atende:** RN-011, RN-008, AMB-007, AMB-017, AMB-020     
      187 +  - **Aceite:** passam `Borda › Alimentação em dia de viagem`,
          + `Borda › Transporte em dia de viagem`, `Borda › Dia do check-
          +out`, `Borda › Noite seguinte da estadia`, `Borda › Hospedagem
          + recusada não gera viagem` e `Borda › Viagem não altera o limi
          +ar de NF`                                                     
      188 +  - **Commit:** `<hash preenchido depois>`                    
      189 +                                                              
      190 +- [ ] **T-032** — Casos de borda de `id`, `data`, `categoria` 
          +e eco inválidos em `tests/casos-de-borda.test.ts`             
      191 +  - **Atende:** RN-003, RN-014, AMB-018, AMB-023, AMB-024     
      192 +  - **Aceite:** passam `Borda › Data impossível`, `Borda › id 
          +repetido`, `Borda › id repetido com outra grafia`, `Borda › Va
          +lor inválido na saída`, `Borda › Eco de campo inválido`, `Bord
          +a › Despesa que não é objeto`, `Borda › Categoria vazia`, `Bor
          +da › Categoria não textual`, `Borda › id vazio` e `Borda › dat
          +a nula`                                                       
      193 +  - **Commit:** `<hash preenchido depois>`                    
      194 +                                                              
      195 +- [ ] **T-033** — Casos de borda de `valor` como texto em `tes
          +ts/casos-de-borda.test.ts`                                    
      196 +  - **Atende:** RN-003, RN-001, RN-004, AMB-021               
      197 +  - **Aceite:** passam `Borda › Valor como texto com ponto`, `
          +Borda › Valor como texto com vírgula`, `Borda › Valor texto co
          +m 3 casas`, `Borda › Valor texto negativo`, `Borda › Separador
          + de milhar`, `Borda › Símbolo de moeda` e `Borda › Valor boole
          +ano`                                                          
      198 +  - **Commit:** `<hash preenchido depois>`                    
      199 +                                                              
      200 +- [ ] **T-034** — Casos de borda de `tem_nota_fiscal` em `test
          +s/casos-de-borda.test.ts`                                     
      201 +  - **Atende:** RN-003, RN-008, AMB-018, AMB-022              
      202 +  - **Aceite:** passam `Borda › tem_nota_fiscal ausente, valor
          + 150,00`, `Borda › tem_nota_fiscal nulo ou "", valor 150,00`, 
          +`Borda › tem_nota_fiscal vazio, valor 50,00`, `Borda › tem_not
          +a_fiscal texto` e `Borda › tem_nota_fiscal número`            
      203 +  - **Commit:** `<hash preenchido depois>`                    
      204 +                                                              
      205  ## Fase 4 — Saída e CLI
      206  
       38 -- [ ] **T-00N** — <...>                                       
      207 +- [ ] **T-035** — Criar `src/io/saida.ts` com `montarSaida(res
          +ultado, entrada)`: objeto na ordem de campos da seção 4 (`cola
          +borador`, `periodo`, `itens`, `resumo`), `colaborador`/`period
          +o` ecoados brutos, dinheiro via `JSON.rawJSON(formatarDecimal(
          +c))`, ecos brutos de item inválido reemitidos como vieram (`Nu
          +meroJson` com o mesmo texto, ausente → `null`)                
      208 +  - **Atende:** RN-001, RN-003, RN-013, AMB-023               
      209 +  - **Aceite:** em `tests/io/saida.test.ts` passam `RN-001 › v
          +alores monetários saem com duas casas (60.00, não 60; 0.00, nã
          +o 0)`, `RN-003 › eco de campo inválido sai como veio (categori
          +a 123 → 123, "  " → "  ", ausente → null)`, `RN-003 › valor_so
          +licitado nulo sai como null` e `Infra › saída: colaborador e p
          +eriodo ecoados com os números no texto original`              
      210 +  - **Commit:** `<hash preenchido depois>`                    
      211  
      212 +- [ ] **T-036** — [P] Teste do arquivo oficial em `tests/exemp
          +lo.test.ts`: lê `exemplos/despesas-exemplo.json`, roda `valida
          +rEntrada` → motor → `montarSaida` e compara com a tabela da se
          +ção 9 da spec. Um `it` por despesa, com o ID da regra do códig
          +o esperado                                                    
      213 +  - **Atende:** RN-001, RN-004, RN-005, RN-006, RN-007, RN-008
          +, RN-009, RN-010, RN-011, RN-012, RN-013, RN-014 (seção 9)    
      214 +  - **Aceite:** passam `RN-010 › exemplo d-001: PARCIAL 60,00`
          +, `RN-010 › exemplo d-002: RECUSADO LIMITE_DIARIO_ESGOTADO`, `
          +RN-010 › exemplo d-003: PARCIAL 80,00`, `RN-008 › exemplo d-00
          +4: NOTA_FISCAL_AUSENTE`, `RN-006 › exemplo d-005: CATEGORIA_NA
          +O_REEMBOLSAVEL`, `RN-009 › exemplo d-006: APROVADO 54,90`, `RN
          +-007 › exemplo d-007: DUPLICATA`, `RN-005 › exemplo d-008: FOR
          +A_DO_PERIODO`, `RN-004 › exemplo d-009: VALOR_NAO_POSITIVO`, `
          +RN-012 › exemplo d-010: APROVADO 480,00, diarias 2`, `RN-011 ›
          + exemplo d-011: APROVADO 33,33, em_viagem true, limite 90,00`,
          + `RN-009 › exemplo d-012: APROVADO 47,20`, `RN-008 › exemplo d
          +-013: NOTA_FISCAL_AUSENTE`, `RN-010 › exemplo d-014: PARCIAL 6
          +0,00`, `RN-014 › exemplo: resumo 1861.84 / 815.43 / 1046.41 · 
          +4/3/7` e `RN-013 › exemplo: nenhum item com motivo ausente ou 
          +vazio`                                                        
      215 +  - **Commit:** `<hash preenchido depois>`                    
      216 +                                                              
      217 +- [ ] **T-037** — [P] Teste de contrato em `tests/contrato-sai
          +da.test.ts`: valida a saída contra `contracts/saida.schema.jso
          +n` com `ajv` (`multipleOfPrecision: 2`)                       
      218 +  - **Atende:** RN-013, RN-003 (seção 4)                      
      219 +  - **Aceite:** passam `RN-013 › saída do exemplo valida contr
          +a contracts/saida.schema.json` e `RN-013 › saída com itens DAD
          +O_INVALIDO (valor_solicitado nulo, ecos brutos) valida contra 
          +o schema`                                                     
      220 +  - **Commit:** `<hash preenchido depois>`                    
      221 +                                                              
      222 +- [ ] **T-038** — Criar `src/cli.ts` (R-08, DT-004, `contracts
          +/cli.md`): `parseArgs` com subcomando `calcular` e `--input`/`
          +--output` obrigatórios; lê, valida, calcula e serializa tudo e
          +m memória antes de `writeFile`; sucesso → código 0 e uma linha
          + de resumo no `stdout`; `ErroEntrada`/falha de leitura → `erro
          +: <mensagem>` no `stderr` e código 1, sem criar nem alterar a 
          +saída; uso incorreto → `uso: ...` e código 2                  
      223 +  - **Atende:** RN-015, RN-003, AMB-018                       
      224 +  - **Aceite:** em `tests/cli.test.ts` (processo filho) passam
          + `RN-015 › CLI: arquivo sem periodo → código 1, stderr cita pe
          +riodo, nenhum arquivo de saída`, `RN-015 › CLI: arquivo de ent
          +rada inexistente → código 1, nenhum arquivo de saída`, `RN-015
          + › CLI: arquivo que não é JSON → código 1`, `RN-015 › CLI: em 
          +erro, arquivo de saída pré-existente não é alterado`, `RN-003 
          +› CLI: despesa inválida não aborta (código 0)`, `Infra › CLI: 
          +exemplo → código 0, resumo no stdout, JSON indentado com \n fi
          +nal` e `Infra › CLI: subcomando ou opção ausente → código 2 co
          +m "uso:"`                                                     
      225 +  - **Commit:** `<hash preenchido depois>`                    
      226 +                                                              
      227 +- [ ] **T-039** — Teste de determinismo em `tests/cli.test.ts`
      228 +  - **Atende:** seção 9 (critério "duas execuções geram saídas
          + idênticas")                                                  
      229 +  - **Aceite:** passa `Infra › CLI: duas execuções com a mesma
          + entrada geram bytes idênticos`                               
      230 +  - **Commit:** `<hash preenchido depois>`                    
      231 +                                                              
      232 +- [ ] **T-040** — Casos de borda de arquivo em `tests/casos-de
          +-borda.test.ts`: lista vazia pelo motor; `periodo` ausente e `
          +inicio > fim` pelo CLI (processo filho), conferindo que o arqu
          +ivo de saída não existe                                       
      233 +  - **Atende:** RN-014, RN-015                                
      234 +  - **Aceite:** passam `Borda › Lista de despesas vazia`, `Bor
          +da › Arquivo sem periodo` e `Borda › inicio depois de fim`    
      235 +  - **Commit:** `<hash preenchido depois>`                    
      236 +                                                              
      237 +- [ ] **T-041** — Criar `tests/rastreabilidade.test.ts` (DT-00
          +5): lê `specs/001-motor-reembolso/spec.md`, extrai todo `### R
          +N-NNN` e a 1ª coluna da tabela da seção 7 (sem as crases), lê 
          +os títulos de teste em `tests/**/*.test.ts` e falha listando o
          + que ficou sem teste                                          
      238 +  - **Atende:** RN-001, RN-002, RN-003, RN-004, RN-005, RN-006
          +, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-0
          +14, RN-015 (seção 9, critérios 2 e 3)                         
      239 +  - **Aceite:** passam `Infra › rastreabilidade: toda RN-NNN d
          +a spec aparece no início de um título de teste` e `Infra › ras
          +treabilidade: toda linha da seção 7 tem um teste Borda › <Caso
          +>`; removendo temporariamente um `it` de borda, a suíte fica v
          +ermelha                                                       
      240 +  - **Commit:** `<hash preenchido depois>`                    
      241 +                                                              
      242 +- [ ] **T-042** — Reescrever `README.md` com como instalar, ro
          +dar e testar (Node ≥ 24, `npm install`, `npm test`, `npm run t
          +ypecheck`, comando `calcular`), apontando para `specs/001-moto
          +r-reembolso/` e `quickstart.md`                               
      243 +  - **Atende:** seção 9 (entrega: "como rodar e como testar", 
          +DESAFIO.md)                                                   
      244 +  - **Aceite:** seguir o README do zero num clone limpo reprod
          +uz as seções 1 a 4 do `quickstart.md` com o resultado esperado
      245 +  - **Commit:** `<hash preenchido depois>`                    
      246 +                                                              
      247  ---
      248  
      249  ## Fase 5 — Envelope (criar no Dia 2)
     ...
      260  
      261  | Regra da spec | Task | Teste |
      262  |---|---|---|
       56 -| RN-001 | T-00X | `<nome do teste>` |                        
       57 -| RN-002 | | |                                                
       58 -| AMB-001 | | |                                               
      263 +| RN-001 | T-006, T-016, T-026, T-033, T-035 | `RN-001 › 10.00
          +5 → 10.00 (meio, 0 é par)` (+ demais `RN-001 ›`), `Borda › Arr
          +edondamento meio-para-o-par no limiar` |                      
      264 +| RN-002 | T-007, T-022, T-028 | `RN-002 › "ALIMENTACAO", " Al
          +imentação " e "alimentacao" viram alimentacao`, `RN-002 › "ALI
          +MENTACAO" e "alimentacao" na mesma data somam no mesmo limite 
          +diário` |                                                     
      265 +| RN-003 | T-008, T-009, T-010, T-011, T-017, T-032, T-033, T-
          +034, T-035, T-038 | `RN-003 › "data": "2026-07-32" → DADO_INVA
          +LIDO com data "2026-07-32" no eco` (+ demais `RN-003 ›`), `Bor
          +da › Data impossível` |                                       
      266 +| RN-004 | T-012, T-017, T-022, T-028 | `RN-004 › d-009 (−45,0
          +0) → RECUSADO VALOR_NAO_POSITIVO, reembolsável 0,00`, `Borda ›
          + Estorno` |                                                   
      267 +| RN-005 | T-013, T-028, T-030 | `RN-005 › d-008 (2026-04-15, 
          +período de julho) → FORA_DO_PERIODO`, `Borda › Último dia do p
          +eríodo` |                                                     
      268 +| RN-006 | T-014, T-028 | `RN-006 › d-005 (coworking, 89,00) →
          + CATEGORIA_NAO_REEMBOLSAVEL`, `Borda › Categoria desconhecida`
          + |                                                            
      269 +| RN-007 | T-015, T-017, T-023, T-029 | `RN-007 › d-006 segue 
          +e d-007 → DUPLICATA`, `Borda › Ambas sem fornecedor` |        
      270 +| RN-008 | T-016, T-022, T-026, T-031, T-034 | `RN-008 › d-004
          + (100,01, sem NF) → NOTA_FISCAL_AUSENTE`, `Borda › Nota fiscal
          + no limiar exato` |                                           
      271 +| RN-009 | T-021, T-027 | `RN-009 › alimentação isolada de 60,
          +00 → APROVADO 60,00`, `Borda › Exatamente no limite diário` | 
      272 +| RN-010 | T-021, T-026, T-027 | `RN-010 › d-001 e d-002 em 03
          +/07: 1ª PARCIAL 60,00, 2ª ESGOTADO`, `Borda › Várias no mesmo 
          +dia` |                                                        
      273 +| RN-011 | T-020, T-022, T-031 | `RN-011 › d-013 recusada por 
          +NF não torna 22 a 24/07 dias de viagem`, `Borda › Dia do check
          +-out` |                                                       
      274 +| RN-012 | T-018, T-019, T-022, T-030 | `RN-012 › h1 14/07 "2 
          +diarias" 480,00 e h2 15/07 "1 diaria" 200,00 → h1 APROVADO 480
          +,00, h2 PARCIAL 10,00`, `Borda › Divisão com centavos` |      
      275 +| RN-013 | T-023, T-035, T-036, T-037 | `RN-013 › LIMITE_DIARI
          +O_EXCEDIDO cita limite, saldo disponível e valor cortado`, `RN
          +-013 › exemplo: nenhum item com motivo ausente ou vazio` |    
      276 +| RN-014 | T-024, T-032, T-036, T-040 | `RN-014 › total_solici
          +tado ignora valores não positivos e nulos`, `Borda › Lista de 
          +despesas vazia` |                                             
      277 +| RN-015 | T-025, T-038, T-040 | `RN-015 › CLI: arquivo sem pe
          +riodo → código 1, stderr cita periodo, nenhum arquivo de saída
          +`, `Borda › inicio depois de fim` |                           
      278 +| AMB-001 | T-021, T-027 | `RN-009 › categorias diferentes no 
          +mesmo dia têm limites independentes`, `Borda › Mesmo dia, cate
          +gorias diferentes` |                                          
      279 +| AMB-002 | T-021, T-027 | `RN-010 › d-001 e d-002 em 03/07: 1
          +ª PARCIAL 60,00, 2ª ESGOTADO` |                               
      280 +| AMB-003 | T-021 | `RN-010 › d-014 (61,00) → PARCIAL 60,00` |
      281 +| AMB-004 | T-016, T-026 | `RN-008 › d-003 (100,00, sem NF) nã
          +o é recusada por nota fiscal`, `Borda › Um centavo acima do li
          +miar` |                                                       
      282 +| AMB-005 | T-016 | `RN-001 › 100.004 → 100,00 e não exige not
          +a fiscal` |                                                   
      283 +| AMB-006 | T-016 | `RN-008 › d-013 (690,00, sem NF) → NOTA_FI
          +SCAL_AUSENTE` |                                               
      284 +| AMB-007 | T-020, T-022, T-031 | `RN-011 › alimentação de 80,
          +00 na data de hospedagem elegível → APROVADO 80,00 (limite 90,
          +00)`, `Borda › Hospedagem recusada não gera viagem` |         
      285 +| AMB-008 | T-018, T-019, T-030 | `RN-012 › "Hotel 5 estrelas 
          +- 2 diarias" → N = 2`, `Borda › Diárias fracionárias` |       
      286 +| AMB-009 | T-013, T-028 | `RN-005 › d-008 (2026-04-15, períod
          +o de julho) → FORA_DO_PERIODO` |                              
      287 +| AMB-010 | T-013 | `RN-005 › competencia divergente de inicio
          +/fim é ignorada` |                                            
      288 +| AMB-011 | T-015, T-029 | `RN-007 › só uma com fornecedor → a
          +s duas seguem`, `Borda › Fornecedor vazio` |                  
      289 +| AMB-012 | T-012, T-024, T-028 | `RN-004 › d-009 (−45,00) → R
          +ECUSADO VALOR_NAO_POSITIVO, reembolsável 0,00`, `RN-014 › tota
          +l_solicitado ignora valores não positivos e nulos` |          
      290 +| AMB-013 | T-006, T-026 | `RN-001 › 10.015 → 10.02 (meio, 2 é
          + par)`, `Borda › Meio-para-o-par sobe` |                      
      291 +| AMB-014 | T-007, T-028 | `RN-002 › "ALIMENTACAO", " Alimenta
          +ção " e "alimentacao" viram alimentacao`, `Borda › Categoria e
          +m maiúsculas` |                                               
      292 +| AMB-015 | T-021, T-027 | `RN-010 › despesa que usa exatament
          +e o saldo restante → APROVADO_INTEGRAL`, `Borda › Exatamente n
          +o limite diário` |                                            
      293 +| AMB-016 | T-021, T-027 | `RN-009 › d-012 (sábado, 47,20) → A
          +PROVADO 47,20`, `Borda › Fim de semana` |                     
      294 +| AMB-017 | T-022, T-031 | `RN-008 › dia de viagem não amplia 
          +o limiar de nota fiscal`, `Borda › Viagem não altera o limiar 
          +de NF` |                                                      
      295 +| AMB-018 | T-008, T-010, T-025, T-032, T-034, T-038 | `RN-003
          + › id, data ou categoria nulos, vazios ou só com espaços → DAD
          +O_INVALIDO`, `RN-003 › CLI: despesa inválida não aborta (códig
          +o 0)` |                                                       
      296 +| AMB-019 | T-014, T-028 | `RN-006 › d-005 (coworking, 89,00) 
          +→ CATEGORIA_NAO_REEMBOLSAVEL` |                               
      297 +| AMB-020 | T-021, T-022, T-031 | `RN-009 › em dia de viagem a
          +limentação vai a 90,00 e transporte a 120,00, hospedagem fica 
          +em 250,00` |                                                  
      298 +| AMB-021 | T-009, T-033 | `RN-003 › "45.00", "45,00" e 45.00 
          +dão valor_solicitado 45,00`, `Borda › Separador de milhar` |  
      299 +| AMB-022 | T-010, T-034 | `RN-003 › "tem_nota_fiscal": "sim" 
          +→ DADO_INVALIDO`, `Borda › tem_nota_fiscal número` |          
      300 +| AMB-023 | T-008, T-009, T-024, T-032, T-035 | `RN-003 › "val
          +or": "R$ 45,00" → valor_solicitado nulo`, `Borda › Eco de camp
          +o inválido` |                                                 
      301 +| AMB-024 | T-011, T-032 | `RN-003 › " d-001 " depois de "d-00
          +1" → DADO_INVALIDO, com id " d-001 " no eco`, `Borda › id repe
          +tido com outra grafia` |                                      
      302 +                                                              
      303 +**IDs sem cobertura:** nenhum.                                
      304 +                                                              
      305 +**Casos de borda da seção 7:** 71 linhas → T-026 (7), T-027 (6
          +), T-028 (8), T-029 (8), T-030 (11), T-031 (6), T-032 (10), T-
          +033 (7), T-034 (5), T-040 (3).                                
      306 +                                                              
      307 +---                                                           
      308 +                                                              
      309 +## Notas para a implementação                                 
      310 +                                                              
      311 +- **Ponto a confirmar antes da T-011:** a RN-003 diz "`id` igu
          +al ao de uma                                                  
      312 +  despesa anterior no arquivo", sem dizer se uma despesa anter
          +ior **já                                                      
      313 +  recusada** (por exemplo, `DADO_INVALIDO` por data inválida) 
          +conta. A leitura                                              
      314 +  literal é que conta. Se a decisão for outra, ela vai para a 
          +spec (nova AMB)                                               
      315 +  e para o `DECISIONS.md` antes do código, não para esta task.
      316 +- **Dependências:** T-001 → (T-002, T-003, T-004 em paralelo) 
          +→ T-005 → Fase 2.                                             
      317 +  Dentro de `despesa.ts` (T-008 → T-011) e de `elegibilidade.t
          +s`                                                            
      318 +  (T-012 → T-016) a ordem é sequencial. T-017 precisa de T-011
          + e T-016;                                                     
      319 +  T-022 precisa de T-017 a T-021. A Fase 3 precisa de T-024. T
          +-040 precisa                                                  
      320 +  de T-038; T-041 fecha a Fase 4 e só fica verde com todos os 
          +testes de RN e                                                
      321 +  de borda escritos.                                          

● Vou conferir por script se os 71 nomes de casos de borda da seção 7 aparecem
  exatamente no tasks.md.

  Ran 1 shell command (ctrl+o to expand)

● The split in the check script was wrong; fixing the field extraction.

  Ran 1 shell command (ctrl+o to expand)

● Gerei o tasks.md (specs/001-motor-reembolso/tasks.md) com 42 tasks (T-001 a
  T-042). O arquivo anterior era só o template, então não havia task real para
  preservar. Conferi por script: todos os RN e AMB estão no campo Atende: de
  alguma task, e os 71 casos de borda da seção 7 aparecem com o nome exato. Não
  existe .specify/extensions.yml, então não havia hooks para rodar.

  Tasks por fase

  ┌───────────────────────┬───────────────────────────┬──────┐
  │         Fase          │           Tasks           │ Qtd. │
  ├───────────────────────┼───────────────────────────┼──────┤
  │ 1 — Fundação          │ T-001 a T-005             │ 5    │
  ├───────────────────────┼───────────────────────────┼──────┤
  │ 2 — Regras de negócio │ T-006 a T-025             │ 20   │
  ├───────────────────────┼───────────────────────────┼──────┤
  │ 3 — Casos de borda    │ T-026 a T-034             │ 9    │
  ├───────────────────────┼───────────────────────────┼──────┤
  │ 4 — Saída e CLI       │ T-035 a T-042             │ 8    │
  ├───────────────────────┼───────────────────────────┼──────┤
  │ 5 — Envelope          │ continua como placeholder │ 0    │
  └───────────────────────┴───────────────────────────┴──────┘

  Cobertura
  - RN-001 a RN-015 e AMB-001 a AMB-024 estão todos cobertos. Nenhum ID ficou de
    fora.
  - Os 71 casos de borda estão divididos por tema em T-026 a T-034. Os três que
    precisam do arquivo ou do CLI (lista vazia, sem periodo e inicio > fim)
    ficaram em T-040, depois do CLI.
  - A T-041 cria o teste de rastreabilidade previsto na DT-005. Ele lê a spec e
    deixa a suíte vermelha se alguma RN ou caso de borda ficar sem teste.

  Tasks que podem rodar em paralelo [P]: T-002, T-003, T-004 · T-006, T-007 ·
  T-012, T-018, T-021, T-023, T-024, T-025 · T-036, T-037. As tasks da Fase 3
  dividem o mesmo arquivo casos-de-borda.test.ts, como pede o plano, por isso
  nenhuma é [P].

  Formato: todas as tasks seguem - [ ] **T-NNN** — com Atende, Aceite e Commit.
  O Aceite de cada uma lista nomes de teste no padrão RN-NNN › ou Borda ›
  <Caso>.

  Adotei três convenções que não estão escritas em nenhum lugar. Vale você
  conferir:
  - Prefixo Infra › nos testes que não verificam regra de negócio, como runtime,
    JSON, datas, determinismo e o uso do CLI.
  - Nomes de borda sem crase: `id` repetido na spec vira Borda › id repetido no
    teste. O teste de rastreabilidade tira as crases antes de comparar.
  - README em T-042, porque o DESAFIO.md exige um README com "como rodar e como
    testar".

  Lacuna na spec, a decidir antes da T-011: a RN-003 recusa um id "igual ao de
  uma despesa anterior no arquivo", mas não diz se conta o id de uma despesa
  anterior que já foi recusada, por exemplo por DADO_INVALIDO com data inválida.
  Pela leitura literal, conta. Deixei um ⚠️ na T-011 e uma nota no fim do
  tasks.md. Se a resposta for outra, ela precisa entrar na spec e no
  DECISIONS.md antes do código.

  Não fiz commit. Quando quiser, a mensagem seria docs(tasks): .... O próximo
  passo sugerido é rodar /speckit-analyze.

> <ide_opened_file>The user opened the file
  d:\Usuario\Projetos\Dev\Apps\sdd-desafio\specs\001-motor-reembolso\tasks.md
  in the IDE. This may or may not be related to the current
  task.</ide_opened_file>

> dá pra assumir que um id duplicado onde o anterior foi recusado pro dados
  inválidos foi uma tentativa de correão de input inserindo um segundo
  completo. É um bom ponto para adicionar an spec. se a spec muda nesse passo
  do processo SDD quais comandos precisarei rodar depois?

● Sim, faz sentido. Se a primeira despesa foi recusada por DADO_INVALIDO, a
  segunda com o mesmo id é mais provavelmente a correção do que uma cópia. Antes
  de escrever na spec, porém, a regra precisa de três definições que hoje ela
  não traz:

  Proposta de regra (seria a AMB-025, ajustando a RN-003)
  1. Quais despesas "reservam" o id: só as que passaram da validação (RN-003).
     Uma despesa recusada por qualquer motivo de dado inválido não reserva o id,
     inclusive quando o motivo foi o próprio id repetido.
  2. Recusas de outras etapas continuam reservando o id. Uma despesa
     FORA_DO_PERIODO, DUPLICATA, NOTA_FISCAL_AUSENTE etc. foi validada, então um
     id igual depois dela é DADO_INVALIDO. A correção só vale para dado
     inválido.
  3. Consequência na saída: os dois itens aparecem, cada um com seu resultado. A
     saída passa a poder ter dois itens com o mesmo id (um DADO_INVALIDO e o
     corrigido). Hoje a spec não promete id único na saída, mas vale deixar isso
     explícito.

  Exemplo: d-001 com data 2026-07-32, depois d-001 válido, depois d-001 válido
  de novo. A 1ª sai DADO_INVALIDO, a 2ª segue normalmente e a 3ª sai
  DADO_INVALIDO.

  Isso inclui ainda uma linha nova na seção 7, algo como "Correção de item
  inválido", e um exemplo no Aceite da RN-003.

  O que rodar depois que a spec mudar, nesta etapa do SDD

  Como ainda não há código, o custo é só de documentos. A ordem da constituição
  (princípio VII) é spec → DECISIONS.md → tasks → código:

  1. Editar a spec: RN-003, nova AMB-025, linha na seção 7 e registro em
     Clarifications. Dá para fazer à mão ou pelo /speckit-clarify. Commit
     docs(spec): ....
  2. Registrar a D-017 no DECISIONS.md: gatilho, de → para, motivo, tasks
     afetadas (T-011 e T-032). Vai no mesmo commit da spec ou num commit
     docs(spec) logo depois.
  3. /speckit-plan: não precisa rodar de novo. Nenhuma decisão técnica muda. Só
     vale ajustar uma linha do data-model.md, porque o conjunto de ids vistos
     passa a receber apenas despesas validadas.
  4. /speckit-tasks: ele preserva a numeração. A T-011 muda de descrição e
     aceite, a T-032 ganha o novo caso de borda e a Cobertura ganha a AMB-025.
     Commit docs(tasks): ....
  5. /speckit-analyze: confere se spec, plan e tasks continuam consistentes
     antes de implementar.

  Se esquecer o caso de borda novo, o teste de rastreabilidade (T-041) acusa,
  porque ele lê a seção 7 da spec.

  Confirma as definições 1 a 3? Se sim, eu aplico os passos 1 e 2 agora.

> <ide_opened_file>The user opened the file
  d:\Usuario\Projetos\Dev\Apps\sdd-desafio\specs\001-motor-reembolso\spec.md in
  the IDE. This may or may not be related to the current
  task.</ide_opened_file>

> as definições 1-3 estão de acordo com a minah decisão, pode aplicar ela e os
  passos 1 e 2

  Read 1 file (ctrl+o to expand)

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      1  # Spec — Motor de Cálculo de Reembolso
      2  
      3 -**Versão:** 1.1 · **Status:** rascunho · **Última alteração:** `
        -2026-09-29`                                                     
      3 +**Versão:** 1.2 · **Status:** rascunho · **Última alteração:** `
        +2026-09-29`                                                     
      4  
      5  > **Regra de ouro deste arquivo:** ele descreve o QUÊ e o PORQUÊ
         . Nenhuma linha
      6  > aqui pode citar linguagem, biblioteca, classe, função ou estru
         tura de pasta.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line
      36  - Q: Num item `DADO_INVALIDO` com `valor` não numérico ou ausen
          te, o que sai em `valor_solicitado`? E `id`, `data` e `categori
          a` inválidos? → A: `valor_solicitado` sai nulo, e os campos de 
          eco saem exatamente como vieram, para que a saída mostre o moti
          vo da recusa (seção 4, AMB-023).
      37  - Q: Em "Hotel 5 estrelas - 2 diarias", N é 2 ou 1? → A: 2. Val
          e a primeira ocorrência do padrão completo "<inteiro> diária(s)
          /noite(s)". Números soltos antes dela são ignorados (RN-012, AM
          B-008).
      38  - Q: `"d-001"`, `" d-001 "` e `"D-001"` são o mesmo `id` para a
           RN-003? → A: Sim. O `id` é normalizado como a categoria (maiús
          culas/minúsculas, espaços nas bordas, acentos) antes de compara
          r (RN-003, AMB-024).
      39 +- Q: Uma despesa com o mesmo `id` de uma anterior que foi recus
         +ada com `DADO_INVALIDO` também é `DADO_INVALIDO`? → A: Não. Ela
         + é tratada como a correção da anterior e segue normalmente. Só 
         +uma despesa que passou pela validação reserva o `id`. Recusas d
         +e etapas posteriores (período, duplicata, nota fiscal...) conti
         +nuam reservando o `id` (RN-003, AMB-025).                      
      40  
      41  ## 3. Fora de escopo
      42  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 3 lines
      114  que causou a recusa. O `valor_solicitado` é o valor arredondad
           o quando o
      115  `valor` é numérico (a recusa veio de outro campo) e nulo quand
           o não é (AMB-023).
      116  
      117 +O mesmo `id` pode aparecer em mais de um item da saída quando 
          +uma despesa                                                   
      118 +`DADO_INVALIDO` é seguida pela sua correção, com o mesmo `id` 
          +(AMB-025).                                                    
      119 +                                                              
      120  **Códigos de motivo** (exatamente um por item, o da primeira r
           egra que decidiu
      121  o item, conforme a seção 8):
      122  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines, removed 2 lines
      199  
      200  **Regra:** Uma despesa com `id`, `data`, `categoria` ou `valor
           ` ausente, com
      201  `data` que não é uma data de calendário válida no formato `AAA
           A-MM-DD`, com
      202 -`valor` não numérico, ou com `id` igual ao de uma despesa ante
          -rior no arquivo, é                                            
      203 -**RECUSADA** com `DADO_INVALIDO`. As demais despesas continuam
          - sendo                                                        
      202 +`valor` não numérico, ou com `id` igual ao de uma despesa ante
          +rior no arquivo                                               
      203 +**que passou por esta validação**, é **RECUSADA** com `DADO_IN
          +VALIDO`. As demais despesas continuam sendo                   
      204  processadas normalmente. Uma despesa que não é um objeto (um n
           úmero, um texto,
      205  nulo) tem todos os campos ausentes e também é `DADO_INVALIDO`.
      206  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 6 lines
      209  bordas e sem acentos. `"d-001"`, `" d-001 "` e `"D-001"` são o
            mesmo `id`
      210  (AMB-024).
      211  
      212 +Só reserva o `id` a despesa que passou por esta validação. Uma
          + despesa                                                      
      213 +recusada com `DADO_INVALIDO`, por qualquer motivo (inclusive o
          + próprio `id`                                                 
      214 +repetido), não reserva, e a seguinte com o mesmo `id` é tratad
          +a como a                                                      
      215 +correção dela. Uma despesa recusada numa etapa posterior (perí
          +odo, categoria,                                               
      216 +duplicata, nota fiscal) passou por esta validação e reserva o 
          +`id` (AMB-025).                                               
      217 +                                                              
      218  `valor` é numérico quando é um número ou um texto que, sem os 
           espaços das
      219  bordas, tem sinal `-` opcional, um ou mais dígitos e, opcional
           mente, **um**
      220  separador decimal (ponto `.` ou vírgula `,`) seguido de um ou 
           mais dígitos. O

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      231  ausente, nulo, ou texto vazio ou só com espaços) vale `false`.
            Qualquer outro
      232  valor (textos como `"true"` ou `"sim"`, números como `1` ou `0
           `, listas,
      233  objetos) é `DADO_INVALIDO`.
      234 -**Origem:** ausente na política (AMB-018, AMB-021, AMB-022, AM
          -B-023, AMB-024)                                               
      234 +**Origem:** ausente na política (AMB-018, AMB-021, AMB-022, AM
          +B-023, AMB-024, AMB-025)                                      
      235  **Aceite:** uma despesa com `"data": "2026-07-32"` sai RECUSAD
           O/`DADO_INVALIDO`
      236  com `data` `"2026-07-32"` na saída, e as outras despesas do ar
           quivo têm o
      237  resultado de sempre. `"valor": "R$ 45,00"` sai com `valor_soli
           citado` nulo.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 3 lines, removed 1 line
      236  com `data` `"2026-07-32"` na saída, e as outras despesas do ar
           quivo têm o
      237  resultado de sempre. `"valor": "R$ 45,00"` sai com `valor_soli
           citado` nulo.
      238  Uma despesa `"id": "D-001"` depois de uma `"id": "d-001"` →
      239 -RECUSADO/`DADO_INVALIDO`. `"45.00"`,                          
      239 +RECUSADO/`DADO_INVALIDO`. `"d-001"` com `"data": "2026-07-32"`
          +, depois                                                      
      240 +`"d-001"` válido e depois outro `"d-001"` válido → a 1ª RECUSA
          +DO/`DADO_INVALIDO`,                                           
      241 +a 2ª segue normalmente e a 3ª RECUSADO/`DADO_INVALIDO`. `"45.0
          +0"`,                                                          
      242  `"45,00"` e `45.00` dão o mesmo resultado (`valor_solicitado` 
           45,00).
      243  `"1.234,56"` e `"R$ 45,00"` → RECUSADO/`DADO_INVALIDO`.
      244  `"tem_nota_fiscal": "sim"` → RECUSADO/`DADO_INVALIDO`.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 23 lines
      743  provavelmente são o mesmo lançamento.
      744  **Regra afetada:** RN-003
      745  
      746 +### AMB-025 — `id` repetido depois de uma despesa com dado inv
          +álido                                                         
      747 +                                                              
      748 +**Texto original do RH:** a política não fala do assunto.     
      749 +**O que não está claro:** a RN-003 recusa o `id` "igual ao de 
          +uma despesa                                                   
      750 +anterior no arquivo", sem dizer se conta uma despesa anterior 
          +que já foi                                                    
      751 +recusada. Leituras possíveis: (a) toda despesa anterior reserv
          +a o `id`;                                                     
      752 +(b) só a que passou pela validação da RN-003 reserva; (c) só a
          + que foi                                                      
      753 +reembolsada, total ou parcialmente, reserva.                  
      754 +**Decisão:** (b). Uma despesa recusada com `DADO_INVALIDO`, po
          +r qualquer                                                    
      755 +motivo (inclusive o próprio `id` repetido), não reserva o `id`
          +, e a seguinte                                                
      756 +com o mesmo `id` é tratada como a correção dela e segue normal
          +mente. Uma                                                    
      757 +despesa recusada numa etapa posterior (período, categoria, dup
          +licata, nota                                                  
      758 +fiscal) reserva o `id`. As duas despesas aparecem na saída, ca
          +da uma com seu                                                
      759 +resultado, então o mesmo `id` pode aparecer em mais de um item
          +.                                                             
      760 +**Justificativa:** decisão do usuário. Uma despesa com dado in
          +válido seguida de                                             
      761 +outra completa com o mesmo `id` é, com toda probabilidade, uma
          + tentativa de                                                 
      762 +corrigir o lançamento. Recusar a correção puniria o colaborado
          +r duas vezes pelo                                             
      763 +mesmo erro de preenchimento. Já uma despesa recusada depois da
          + validação tinha                                              
      764 +dados completos, e repetir o `id` dela não é correção de dado:
          + é outro                                                      
      765 +lançamento com identificador repetido. A leitura (c) foi desca
          +rtada porque                                                  
      766 +deixaria reusar o `id` de uma despesa recusada por período ou 
          +nota fiscal.                                                  
      767 +**Regra afetada:** RN-003                                     
      768 +                                                              
      769  ---
      770  
      771  ## 7. Casos de borda

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines
      819  | Data impossível | `2026-02-30` | RECUSADO `DADO_INVALIDO`, o
           s outros itens seguem | RN-003 |
      820  | `id` repetido | dois itens com `id` "d-001" | o segundo RECU
           SADO `DADO_INVALIDO` | RN-003 |
      821  | `id` repetido com outra grafia | `"d-001"` e depois `" D-001
            "` | o segundo RECUSADO `DADO_INVALIDO`, `id` sai `" D-001 "`
            | RN-003 |
      822 +| Correção de item inválido | `"d-001"` com data `2026-07-32`;
          + depois `"d-001"` válido | 1º RECUSADO `DADO_INVALIDO`; 2º seg
          +ue normalmente | RN-003 |                                     
      823 +| `id` de item recusado depois da validação | `"d-001"` fora d
          +o período; depois `"d-001"` válido | 1º RECUSADO `FORA_DO_PERI
          +ODO`; 2º RECUSADO `DADO_INVALIDO` | RN-003 |                  
      824  | Valor inválido na saída | `"valor": "R$ 45,00"` | RECUSADO `
           DADO_INVALIDO`, `valor_solicitado` nulo, fora do `total_solici
           tado` | RN-003, RN-014 |
      825  | Eco de campo inválido | `"categoria": 123` | `categoria` sai
            `123` na saída | RN-003 |
      826  | Despesa que não é objeto | um item `42` na lista `despesas` 
           | RECUSADO `DADO_INVALIDO`, `id`/`data`/`categoria`/`valor_sol
           icitado` nulos | RN-003 |

● Agora registro a D-017 no DECISIONS.md.

● Update(specs\001-motor-reembolso\DECISIONS.md)  ⎿  Added 46 lines
      17  
      18  ---
      19  
      20 +## D-017 — Correção de item inválido com o mesmo `id` (RN-003, 
         +AMB-025) · `2026-09-29`                                        
      21 +                                                               
      22 +**Gatilho:** `/speckit-tasks`. Ao escrever a T-011 (detecção de
         + `id`                                                          
      23 +repetido), o Claude notou que a RN-003 ("`id` igual ao de uma d
         +espesa                                                         
      24 +anterior no arquivo") não dizia se uma despesa anterior **já re
         +cusada** conta.                                                
      25 +Parou, marcou a T-011 com um ponto a confirmar e levou a pergun
         +ta ao usuário,                                                 
      26 +em vez de decidir na task.                                     
      27 +                                                               
      28 +**O que mudou na spec (versão 1.1 → 1.2):**                    
      29 +- RN-003: só reserva o `id` a despesa que passou pela validação
         +. Uma despesa                                                  
      30 +  `DADO_INVALIDO`, por qualquer motivo (inclusive o próprio `id
         +` repetido),                                                   
      31 +  não reserva, e a seguinte com o mesmo `id` segue como correçã
         +o. Recusas de                                                  
      32 +  etapas posteriores (período, categoria, duplicata, nota fisca
         +l) reservam o                                                  
      33 +  `id`. Novo aceite com três `"d-001"` em sequência.           
      34 +- Nova AMB-025, com as leituras (a) toda anterior, (b) só as va
         +lidadas e                                                      
      35 +  (c) só as reembolsadas.                                      
      36 +- Seção 4: o mesmo `id` pode aparecer em mais de um item da saí
         +da.                                                            
      37 +- Seção 7: casos "Correção de item inválido" e "`id` de item re
         +cusado depois                                                  
      38 +  da validação".                                               
      39 +- Uma entrada em `Clarifications`.                             
      40 +                                                               
      41 +**Como se chegou lá:** a leitura literal do texto anterior era 
         +(a), e foi a                                                   
      42 +que o Claude deixou anotada na T-011. O usuário decidiu por (b)
         +: "dá pra                                                      
      43 +assumir que um id duplicado onde o anterior foi recusado por da
         +dos inválidos                                                  
      44 +foi uma tentativa de correção de input inserindo um segundo com
         +pleto". O                                                      
      45 +Claude propôs fechar três pontos junto com a decisão (quem rese
         +rva o `id`, as                                                 
      46 +recusas posteriores continuam reservando, `id` repetido na saíd
         +a), e o                                                        
      47 +usuário confirmou os três.                                     
      48 +                                                               
      49 +**Por quê:** recusar a correção puniria o colaborador duas veze
         +s pelo mesmo                                                   
      50 +erro de preenchimento. Uma despesa recusada depois da validação
         + tinha dados                                                   
      51 +completos, então repetir o `id` dela não é correção, é outro la
         +nçamento com                                                   
      52 +identificador repetido.                                        
      53 +                                                               
      54 +**O que isso invalidou:** a leitura (a), que só existia como no
         +ta na T-011 e                                                  
      55 +nunca virou código. Nenhum item do exemplo muda (não há `id` re
         +petido nele).                                                  
      56 +                                                               
      57 +**Tasks afetadas:** T-011 (descrição e aceite: o conjunto de id
         +s vistos só                                                    
      58 +recebe despesas validadas), T-032 (dois casos de borda novos) e
         + a tabela de                                                   
      59 +Cobertura (AMB-025). Nenhuma task estava concluída. Os ajustes 
         +entram pelo                                                    
      60 +`/speckit-tasks`, que preserva a numeração.                    
      61 +                                                               
      62 +**Custo:** 2 arquivos (`spec.md`, `DECISIONS.md`), 9 trechos.  
      63 +                                                               
      64 +---                                                            
      65 +                                                               
      66  ## D-016 — Diárias fracionárias são ignoradas (RN-012, AMB-008)
           · `2026-09-29`
      67  
      68  **Gatilho:** revisão do `/speckit-plan`. O Claude apontou como 
          risco que,

● Apliquei a sua decisão na spec (agora versão 1.2) e registrei a mudança no
  DECISIONS.md, que são os passos 1 e 2. Não fiz commit.

  Na spec (spec.md (specs/001-motor-reembolso/spec.md)), são 9 trechos:
  - RN-003: só reserva o id a despesa que passou pela validação. Uma despesa
    recusada com DADO_INVALIDO, por qualquer motivo, deixa o id livre para a
    correção seguinte. Recusas de etapas posteriores (período, categoria,
    duplicata, nota fiscal) continuam reservando o id. O Aceite ganhou o exemplo
    dos três "d-001" em sequência.
  - Nova AMB-025: registra as três leituras possíveis, a decisão (b) e por que
    ela foi escolhida.
  - Seção 4: agora diz que o mesmo id pode aparecer em mais de um item da saída.
  - Seção 7: dois casos de borda novos, "Correção de item inválido" e "id de
    item recusado depois da validação". O segundo cobre a sua definição 2.
  - Clarifications: uma entrada nova com a pergunta e a resposta. O número da
    versão também subiu de 1.1 para 1.2.

  No DECISIONS.md (DECISIONS.md (specs/001-motor-reembolso/DECISIONS.md)), a
  nova D-017 traz o gatilho, a sua frase original, as três definições
  confirmadas, as tasks afetadas (T-011, T-032 e a Cobertura) e o custo.

  Próximos passos:
  1. Commit docs(spec): ... com os dois arquivos.
  2. Ajuste manual pequeno no plano, sem rodar o /speckit-plan de novo. O
     plan.md (specs/001-motor-reembolso/plan.md) ainda diz que se baseia na spec
     1.1. O data-model.md (specs/001-motor-reembolso/data-model.md) precisa de
     uma frase dizendo que o conjunto de ids vistos só recebe despesas
     validadas.
  3. /speckit-tasks, que atualiza a T-011, a T-032 e a Cobertura sem renumerar.
     Commit docs(tasks): ....
  4. /speckit-analyze.

  Se quiser, faço o commit e o ajuste do passo 2.

> <ide_opened_file>The user opened the file
  d:\Usuario\Projetos\Dev\Apps\sdd-desafio\specs\001-motor-reembolso\tasks.md
  in the IDE. This may or may not be related to the current
  task.</ide_opened_file>

> realize o ajuste do passo 2

  Searched for 2 patterns, read 1 file (ctrl+o to expand)

● Update(specs\001-motor-reembolso\plan.md)
  ⎿  Added 1 line, removed 1 line
      1  # Plano Técnico — Motor de Cálculo de Reembolso
      2  
      3 -**Versão:** 1.0 · **Baseado na spec:** 1.1 · **Branch:** `001-mo
        -tor-reembolso` · **Data:** 2026-09-29                           
      3 +**Versão:** 1.1 · **Baseado na spec:** 1.2 · **Branch:** `001-mo
        +tor-reembolso` · **Data:** 2026-09-29                           
      4  
      5  > Aqui mora o COMO. Este arquivo pode e deve falar de linguagem,
          biblioteca e
      6  > arquitetura. O que ele **não** pode é introduzir regra de negó
         cio nova — se

● Update(specs\001-motor-reembolso\plan.md)
  ⎿  Added 4 lines
      14  spec **antes** de qualquer decisão técnica (DECISIONS D-015: ec
          o de item
      15  inválido, `id` normalizado e primeira ocorrência das diárias).
      16  
      17 +**v1.1:** ajuste à spec 1.2 (D-017, AMB-025). O conjunto de ids
         + vistos só                                                     
      18 +recebe o `id` de despesas que passaram pela validação (etapa 2)
         +. Nenhuma                                                      
      19 +decisão técnica mudou.                                         
      20 +                                                               
      21  ---
      22  
      23  ## 0. Contexto técnico

● Update(specs\001-motor-reembolso\plan.md)
  ⎿  Added 2 lines, removed 2 lines
      67            ┌─────────────────────── núcleo (puro, sem E/S) ─────
          ────────────┘
      68            ▼
      69     motor: para cada despesa, na ordem
      70 -     despesa.ts        etapas 1-2  RN-001, RN-002, RN-003      
      71 -     elegibilidade.ts  etapas 3-7  RN-004 … RN-008 (estado: ids
         - vistos, chaves de duplicata)                                  
      70 +     despesa.ts        etapas 1-2  RN-001, RN-002, RN-003 (esta
         +do: ids vistos, só de validadas, AMB-025)                      
      71 +     elegibilidade.ts  etapas 3-7  RN-004 … RN-008 (estado: cha
         +ves de duplicata)                                              
      72            ▼  elegíveis
      73       viagem.ts         etapa 8     RN-011 (noites das hospedage
          ns elegíveis)
      74       diarias.ts        etapa 9a    RN-012 (N e parcelas por noi
          te)

● Update(specs\001-motor-reembolso\plan.md)
  ⎿  Added 3 lines, removed 1 line
      172  etapa 8 (viagem) depende de todas as hospedagens elegíveis.
      173  **Decisão:** `motor.ts` faz duas passadas. A **passada 1** per
           corre as
      174  despesas na ordem e aplica as etapas 1 a 7 (validação e elegib
           ilidade), com
      175 -o estado acumulado de ids vistos e chaves de duplicata. A **pa
          -ssada 2** usa as                                              
      175 +o estado acumulado de ids vistos e chaves de duplicata. Um `id
          +` só entra nos                                                
      176 +ids vistos quando a despesa passa da etapa 2, mesmo que seja r
          +ecusada numa                                                  
      177 +etapa posterior (AMB-025). A **passada 2** usa as             
      178  elegíveis: calcula os dias de viagem, gera as parcelas e conso
           me os saldos.
      179  **Alternativa descartada:** um pipeline genérico de "regras pl
           ugáveis".
      180  Com uma ordem fixa e conhecida, seria abstração sem uso, e o F
           AQ alerta para

● Update(specs\001-motor-reembolso\data-model.md)
  ⎿  Added 1 line, removed 1 line
      1  # Modelo de dados — Motor de Cálculo de Reembolso
      2  
      3 -**Fase 1 do `/speckit-plan`** · Base: `spec.md` v1.1            
      3 +**Fase 1 do `/speckit-plan`** · Base: `spec.md` v1.2            
      4  
      5  Estruturas internas do núcleo. Os tipos são TypeScript, mas as r
         egras de
      6  validação são só **referências** à spec. Nenhuma regra nova nasc
         e aqui.

● Update(specs\001-motor-reembolso\data-model.md)
  ⎿  Added 1 line, removed 1 line
      56  |---|---|---|
      57  | `indice` | inteiro | posição na entrada. É a ordem da RN-007 
          e da RN-010 |
      58  | `id` | texto | como veio (para a saída) |
      59 -| `idNormalizado` | texto | AMB-024. Usado só na detecção de `i
         -d` repetido |                                                  
      59 +| `idNormalizado` | texto | AMB-024. Usado só na detecção de `i
         +d` repetido. Só uma `DespesaValida` entra no conjunto de ids vi
         +stos. Uma `Recusa(DADO_INVALIDO)` não reserva o `id` (AMB-025) 
         +|                                                              
      60  | `data` | `DataISO` | RN-003 |
      61  | `categoriaOriginal` | texto | como veio |
      62  | `categoria` | texto normalizado | RN-002. Ainda pode ser desc
          onhecida (a recusa vem na RN-006) |

● Atualizo o custo da D-017 para incluir esse ajuste.

● Update(specs\001-motor-reembolso\DECISIONS.md)
  ⎿  Added 4 lines, removed 1 line
      59  Cobertura (AMB-025). Nenhuma task estava concluída. Os ajustes 
          entram pelo
      60  `/speckit-tasks`, que preserva a numeração.
      61  
      62 -**Custo:** 2 arquivos (`spec.md`, `DECISIONS.md`), 9 trechos.  
      62 +**Custo:** 2 arquivos (`spec.md`, `DECISIONS.md`), 9 trechos. D
         +epois, ajuste                                                  
      63 +no plano sem rodar o `/speckit-plan` de novo: `plan.md` (v1.0 →
         + 1.1, 4 trechos)                                               
      64 +e `data-model.md` (2 trechos). O conjunto de ids vistos passou 
         +para a etapa 2                                                 
      65 +e só recebe despesas validadas.                                
      66  
      67  ---
      68  

● Ajustei o plano e o modelo de dados para a spec 1.2. Nenhuma decisão técnica
  mudou. Não fiz commit.

  plan.md (specs/001-motor-reembolso/plan.md), agora na versão 1.1, baseado na
  spec 1.2:
  - Uma nota logo abaixo do cabeçalho resume o ajuste e cita a D-017.
  - Diagrama da arquitetura: o controle de ids vistos saiu da linha de
    elegibilidade.ts e foi para a de despesa.ts, porque o id repetido é
    conferido na etapa 2 da seção 8. Esse controle já estava na linha errada
    antes, e a mudança de agora deixou isso evidente.
  - DT-002: um id só entra nos ids vistos quando a despesa passa da etapa 2,
    mesmo que ela seja recusada numa etapa posterior.

  data-model.md (specs/001-motor-reembolso/data-model.md):
  - O cabeçalho agora diz que se baseia na spec 1.2.
  - Linha do idNormalizado: só uma despesa validada entra no conjunto de ids
    vistos. Uma recusada por DADO_INVALIDO não reserva o id.

  DECISIONS.md (specs/001-motor-reembolso/DECISIONS.md): atualizei o custo da
  D-017 para incluir esses dois arquivos.

  Deixei sem alterar o research.md e o saida.schema.json, porque o conteúdo
  deles não muda. Eles ainda dizem que se baseiam na spec 1.1. O schema não
  exige id único na saída, então continua valendo com a regra nova.

  Próximo passo: commit docs(plan): ... (ou um único docs(spec) junto com a
  spec), depois /speckit-tasks e /speckit-analyze.

> /speckit-tasks

  Ran 1 shell command (ctrl+o to expand)

● Não há hooks. O tasks.md já existe com T-001 a T-042, nenhuma concluída. Vou
  atualizar no lugar o que a D-017 afetou, sem renumerar nada.

● Update(specs\001-motor-reembolso\tasks.md)
  ⎿  Added 1 line, removed 1 line
       8  
       9  **Formato do commit:** `feat(T-003): <descrição>` · `test(T-003
          ): <descrição>`
      10  
      11 -**Base:** `spec.md` v1.1 · `plan.md` v1.0 · `data-model.md` · `
         -research.md` · `contracts/`                                    
      11 +**Base:** `spec.md` v1.2 · `plan.md` v1.1 · `data-model.md` · `
         +research.md` · `contracts/`                                    
      12  
      13  **Convenções que valem para todas as tasks** (do `plan.md` §2 e
           §6 e do `CLAUDE.md`):
      14  

● Update(specs\001-motor-reembolso\tasks.md)
  ⎿  Added 3 lines, removed 3 lines
      75    - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pass
          am `RN-003 › "tem_nota_fiscal": "sim" → DADO_INVALIDO`, `RN-003
           › "tem_nota_fiscal": null vale false`, `RN-003 › tem_nota_fisc
          al ausente, "" ou "   " vale false` e `RN-003 › tem_nota_fiscal
           "true", 1, 0, [] ou {} → DADO_INVALIDO`
      76    - **Commit:** `<hash preenchido depois>`
      77  
      78 -- [ ] **T-011** — Detectar `id` repetido em `src/nucleo/despesa
         -.ts`: `validarDespesa` recebe o conjunto de ids normalizados (`
         -normalizar`, T-007) das despesas **anteriores no arquivo** e re
         -cusa com `DADO_INVALIDO` se o `id` normalizado já estiver nele;
         - o eco do `id` sai como veio. ⚠️ Antes de implementar, confirma
         -r na spec se o id de uma despesa anterior **já recusada** conta
         - como "anterior" (ver nota no fim deste arquivo)               
      79 -  - **Atende:** RN-003, AMB-024                                
      80 -  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pass
         -am `RN-003 › "D-001" depois de "d-001" → DADO_INVALIDO`, `RN-00
         -3 › " d-001 " depois de "d-001" → DADO_INVALIDO, com id " d-001
         - " no eco` e `RN-003 › a primeira ocorrência de "d-001" segue n
         -ormalmente`                                                    
      78 +- [ ] **T-011** — Detectar `id` repetido em `src/nucleo/despesa
         +.ts`: `validarDespesa` recebe o conjunto de ids vistos (ids nor
         +malizados com `normalizar`, T-007) e recusa com `DADO_INVALIDO`
         + se o `id` normalizado já estiver nele; o eco do `id` sai como 
         +veio. O conjunto só recebe o `id` de despesas que **passaram pe
         +la validação** (resultado `DespesaValida`); uma `Recusa(DADO_IN
         +VALIDO)`, por qualquer motivo, inclusive o próprio `id` repetid
         +o, não reserva o `id` (AMB-025). Expor o helper `registrarId(id
         +sVistos, resultado)` que só adiciona quando o resultado é `Desp
         +esaValida`                                                     
      79 +  - **Atende:** RN-003, AMB-024, AMB-025                       
      80 +  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pass
         +am `RN-003 › "D-001" depois de "d-001" → DADO_INVALIDO`, `RN-00
         +3 › " d-001 " depois de "d-001" → DADO_INVALIDO, com id " d-001
         + " no eco`, `RN-003 › a primeira ocorrência de "d-001" segue no
         +rmalmente`, `RN-003 › "d-001" com data inválida, depois "d-001"
         + válido → o 2º segue (correção, AMB-025)` e `RN-003 › "d-001" i
         +nválido, "d-001" válido e outro "d-001" válido → 1º e 3º DADO_I
         +NVALIDO, 2º segue`                                             
      81    - **Commit:** `<hash preenchido depois>`
      82  
      83  - [ ] **T-012** — [P] Criar `src/nucleo/elegibilidade.ts` com a
           etapa 3: `valorSolicitado ≤ 0` → `Recusa(VALOR_NAO_POSITIVO)`

● Update(specs\001-motor-reembolso\tasks.md)
  ⎿  Added 2 lines, removed 2 lines
      106    - **Commit:** `<hash preenchido depois>`
      107  
      108  - [ ] **T-017** — Criar `src/nucleo/motor.ts` com a **passada 
           1** (DT-002): percorre `entrada.despesas` na ordem, aplica eta
           pas 1–2 (`despesa.ts`) e 3–7 (`elegibilidade.ts`) na ordem da 
           seção 8, com a primeira recusa encerrando a avaliação; a dupli
           cata só compara despesas que passaram das etapas 1–5. Por enqu
           anto as elegíveis saem sem alocação de limite
      109 -  - **Atende:** RN-003, RN-004, RN-007, RN-008 (seção 8)      
      110 -  - **Aceite:** em `tests/nucleo/motor.test.ts` passam `RN-003
          - › despesa inválida não impede o processamento das outras`, `R
          -N-007 › cópia fora do período não gera duplicata (só compara q
          -uem passou das etapas 1 a 5)`, `RN-007 › duplicata vem antes d
          -a nota fiscal (2ª cópia sem NF sai DUPLICATA)` e `RN-004 › est
          -orno fora do período sai VALOR_NAO_POSITIVO (etapa 3 antes da 
          -4)`                                                           
      109 +  - **Atende:** RN-003, RN-004, RN-007, RN-008, AMB-025 (seção
          + 8)                                                           
      110 +  - **Aceite:** em `tests/nucleo/motor.test.ts` passam `RN-003
          + › despesa inválida não impede o processamento das outras`, `R
          +N-003 › id de despesa recusada por FORA_DO_PERIODO continua re
          +servado (AMB-025)`, `RN-007 › cópia fora do período não gera d
          +uplicata (só compara quem passou das etapas 1 a 5)`, `RN-007 ›
          + duplicata vem antes da nota fiscal (2ª cópia sem NF sai DUPLI
          +CATA)` e `RN-004 › estorno fora do período sai VALOR_NAO_POSIT
          +IVO (etapa 3 antes da 4)`                                     
      111    - **Commit:** `<hash preenchido depois>`
      112  
      113  - [ ] **T-018** — [P] Criar `src/nucleo/diarias.ts` com `extra
           irDiarias(descricao)` (R-07): na descrição normalizada, primei
           ra ocorrência de `(?<!\d[.,]?)(\d+)(?![.,]\d)\s*(diarias?|noit
           es?)(?![a-z])`; sem ocorrência, descrição ausente ou N = 0 → 1

● Update(specs\001-motor-reembolso\tasks.md)
  ⎿  Error editing file

● Update(specs\001-motor-reembolso\tasks.md)
  ⎿  Added 2 lines, removed 2 lines
      188    - **Commit:** `<hash preenchido depois>`
      189  
      190  - [ ] **T-032** — Casos de borda de `id`, `data`, `categoria` 
           e eco inválidos em `tests/casos-de-borda.test.ts`
      191 -  - **Atende:** RN-003, RN-014, AMB-018, AMB-023, AMB-024     
      192 -  - **Aceite:** passam `Borda › Data impossível`, `Borda › id 
          -repetido`, `Borda › id repetido com outra grafia`, `Borda › Va
          -lor inválido na saída`, `Borda › Eco de campo inválido`, `Bord
          -a › Despesa que não é objeto`, `Borda › Categoria vazia`, `Bor
          -da › Categoria não textual`, `Borda › id vazio` e `Borda › dat
          -a nula`                                                       
      191 +  - **Atende:** RN-003, RN-014, AMB-018, AMB-023, AMB-024, AMB
          +-025                                                          
      192 +  - **Aceite:** passam `Borda › Data impossível`, `Borda › id 
          +repetido`, `Borda › id repetido com outra grafia`, `Borda › Co
          +rreção de item inválido`, `Borda › id de item recusado depois 
          +da validação`, `Borda › Valor inválido na saída`, `Borda › Eco
          + de campo inválido`, `Borda › Despesa que não é objeto`, `Bord
          +a › Categoria vazia`, `Borda › Categoria não textual`, `Borda 
          +› id vazio` e `Borda › data nula`                             
      193    - **Commit:** `<hash preenchido depois>`
      194  
      195  - [ ] **T-033** — Casos de borda de `valor` como texto em `tes
           ts/casos-de-borda.test.ts`

● Update(specs\001-motor-reembolso\tasks.md)
  ⎿  Added 1 line
      299  | AMB-022 | T-010, T-034 | `RN-003 › "tem_nota_fiscal": "sim" 
           → DADO_INVALIDO`, `Borda › tem_nota_fiscal número` |
      300  | AMB-023 | T-008, T-009, T-024, T-032, T-035 | `RN-003 › "val
           or": "R$ 45,00" → valor_solicitado nulo`, `Borda › Eco de camp
           o inválido` |
      301  | AMB-024 | T-011, T-032 | `RN-003 › " d-001 " depois de "d-00
           1" → DADO_INVALIDO, com id " d-001 " no eco`, `Borda › id repe
           tido com outra grafia` |
      302 +| AMB-025 | T-011, T-017, T-032 | `RN-003 › "d-001" com data i
          +nválida, depois "d-001" válido → o 2º segue (correção, AMB-025
          +)`, `RN-003 › id de despesa recusada por FORA_DO_PERIODO conti
          +nua reservado (AMB-025)`, `Borda › Correção de item inválido`,
          + `Borda › id de item recusado depois da validação` |          
      303  
      304  **IDs sem cobertura:** nenhum.
      305  

● Update(specs\001-motor-reembolso\tasks.md)
  ⎿  Error editing file

● Update(specs\001-motor-reembolso\tasks.md)
  ⎿  Added 1 line, removed 1 line
      303  
      304  **IDs sem cobertura:** nenhum.
      305  
      306 -**Casos de borda da seção 7:** 71 linhas → T-026 (7), T-027 (6
          -), T-028 (8), T-029 (8), T-030 (11), T-031 (6), T-032 (10), T-
          -033 (7), T-034 (5), T-040 (3).                                
      306 +**Casos de borda da seção 7:** 73 linhas → T-026 (7), T-027 (6
          +), T-028 (8), T-029 (8), T-030 (11), T-031 (6), T-032 (12), T-
          +033 (7), T-034 (5), T-040 (3).                                
      307  
      308  ---
      309  
● Update(specs\001-motor-reembolso\tasks.md)
  ⎿  Added 3 lines, removed 5 lines
      309  
      310  ## Notas para a implementação
      311  
      312 -- **Ponto a confirmar antes da T-011:** a RN-003 diz "`id` igu
          -al ao de uma                                                  
      313 -  despesa anterior no arquivo", sem dizer se uma despesa anter
          -ior **já                                                      
      314 -  recusada** (por exemplo, `DADO_INVALIDO` por data inválida) 
          -conta. A leitura                                              
      315 -  literal é que conta. Se a decisão for outra, ela vai para a 
          -spec (nova AMB)                                               
      316 -  e para o `DECISIONS.md` antes do código, não para esta task.
      312 +- **T-011 (resolvido):** o ponto sobre `id` de despesa anterio
          +r já recusada                                                 
      313 +  foi decidido na spec 1.2 (AMB-025, D-017): só despesa valida
          +da reserva o                                                  
      314 +  `id`. T-011, T-017, T-032 e a Cobertura foram atualizadas se
          +m renumeração.                                                
      315  - **Dependências:** T-001 → (T-002, T-003, T-004 em paralelo) 
           → T-005 → Fase 2.
      316    Dentro de `despesa.ts` (T-008 → T-011) e de `elegibilidade.t
           s`
      317    (T-012 → T-016) a ordem é sequencial. T-017 precisa de T-011
            e T-016;

● Update(specs\001-motor-reembolso\tasks.md)
  ⎿  Added 1 line, removed 1 line
      105    - **Aceite:** em `tests/nucleo/rn-008-nota-fiscal.test.ts` p
           assam `RN-008 › d-003 (100,00, sem NF) não é recusada por nota
            fiscal`, `RN-008 › d-004 (100,01, sem NF) → NOTA_FISCAL_AUSEN
           TE`, `RN-008 › d-013 (690,00, sem NF) → NOTA_FISCAL_AUSENTE` e
            `RN-001 › 100.004 → 100,00 e não exige nota fiscal`
      106    - **Commit:** `<hash preenchido depois>`
      107  
      108 -- [ ] **T-017** — Criar `src/nucleo/motor.ts` com a **passada 
          -1** (DT-002): percorre `entrada.despesas` na ordem, aplica eta
          -pas 1–2 (`despesa.ts`) e 3–7 (`elegibilidade.ts`) na ordem da 
          -seção 8, com a primeira recusa encerrando a avaliação; a dupli
          -cata só compara despesas que passaram das etapas 1–5. Por enqu
          -anto as elegíveis saem sem alocação de limite                 
      108 +- [ ] **T-017** — Criar `src/nucleo/motor.ts` com a **passada 
          +1** (DT-002): percorre `entrada.despesas` na ordem, aplica eta
          +pas 1–2 (`despesa.ts`, registrando o `id` nos ids vistos com `
          +registrarId` logo após a etapa 2) e 3–7 (`elegibilidade.ts`) n
          +a ordem da seção 8, com a primeira recusa encerrando a avaliaç
          +ão; a duplicata só compara despesas que passaram das etapas 1–
          +5. Por enquanto as elegíveis saem sem alocação de limite      
      109    - **Atende:** RN-003, RN-004, RN-007, RN-008, AMB-025 (seção
            8)
      110    - **Aceite:** em `tests/nucleo/motor.test.ts` passam `RN-003
            › despesa inválida não impede o processamento das outras`, `R
           N-003 › id de despesa recusada por FORA_DO_PERIODO continua re
           servado (AMB-025)`, `RN-007 › cópia fora do período não gera d
           uplicata (só compara quem passou das etapas 1 a 5)`, `RN-007 ›
            duplicata vem antes da nota fiscal (2ª cópia sem NF sai DUPLI
           CATA)` e `RN-004 › estorno fora do período sai VALOR_NAO_POSIT
           IVO (etapa 3 antes da 4)`
      111    - **Commit:** `<hash preenchido depois>`

  Ran 1 shell command (ctrl+o to expand)

● Atualizei o tasks.md (specs/001-motor-reembolso/tasks.md) para a spec 1.2. O
  arquivo já existia, então mantive as 42 tasks (T-001 a T-042) com a mesma
  numeração e nenhuma task nova. Nenhuma estava concluída. Conferi por script:
  os 73 casos de borda da seção 7 aparecem com o nome exato, e cada RN e AMB
  aparece no Atende: de alguma task e tem linha na Cobertura. Não existe
  .specify/extensions.yml, então não havia hooks para rodar.

  O que mudou por causa da D-017 / AMB-025
  - T-011: o conjunto de ids vistos só recebe despesas que passaram pela
    validação. Criei o helper registrarId, que só adiciona o id nesses casos. O
    Atende: ganhou a AMB-025 e o Aceite ganhou dois testes: a correção segue, e
    na sequência inválido → válido → válido o 1º e o 3º saem DADO_INVALIDO.
  - T-017: o motor registra o id logo depois da etapa 2. Novo teste: um id
    recusado por FORA_DO_PERIODO continua reservado.
  - T-032: ganhou os dois casos de borda novos, Borda › Correção de item
    inválido e Borda › id de item recusado depois da validação.
  - Cobertura: nova linha para a AMB-025, e o total de casos de borda passou de
    71 para 73.
  - Cabeçalho e notas: a base agora é spec 1.2 / plan 1.1, e a nota "ponto a
    confirmar" da T-011 virou "resolvido", com referência à D-017.

  Tasks por fase: Fundação 5 · Regras de negócio 20 · Casos de borda 9 · Saída e
  CLI 8 · Envelope 0.

  Cobertura: RN-001 a RN-015 e AMB-001 a AMB-025 estão todos cobertos. Nenhum ID
  ficou de fora.

  Tasks que podem rodar em paralelo [P]: as mesmas de antes (T-002, T-003,
  T-004, T-006, T-007, T-012, T-018, T-021, T-023, T-024, T-025, T-036, T-037).

  Formato: todas as tasks mantêm checkbox, T-NNN, Atende, Aceite e Commit.

  Não fiz commit. Hoje estão pendentes a spec, o DECISIONS.md, o plan.md, o
  data-model.md e o tasks.md. Sugiro separar em docs(spec) (spec + DECISIONS),
  docs(plan) e docs(tasks), e depois rodar /speckit-analyze.

> olhe novamente os arquivos pendentes, só tem a alteração de tasks agora

  Ran 1 shell command (ctrl+o to expand)

● Você tem razão. Eu me baseei no que tinha visto antes, sem conferir de novo.
  Agora o git status mostra só o tasks.md pendente, e o resto você já commitou:

  - 42370e1 docs(tasks): geração inicial das tasks
  - 59d4863 docs(spec): spec 1.2 e D-017
  - bd155ad docs(spec): ajuste de plan.md e data-model.md

  O bd155ad saiu com o prefixo docs(spec), mas pela convenção do CLAUDE.md
  alteração de plan e data-model usa docs(plan). Não sugiro reescrever o commit,
  porque a constituição pede histórico honesto. Se quiser, dá para citar isso
  no relatório final.

  O próximo commit seria só o tasks.md, por exemplo docs(tasks): T-011, T-017 e
  T-032 ajustadas para a AMB-025. Faço esse commit?