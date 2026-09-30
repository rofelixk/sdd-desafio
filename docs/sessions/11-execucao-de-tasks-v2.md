
> /speckit-tasks

  Read 3 files, ran 2 shell commands (ctrl+o to expand)

● Estou lendo a spec v2.2 (é grande) para gerar as tasks da Fase 5 (v4).
  Continuando.

  Read 3 files, ran 4 shell commands (ctrl+o to expand)

● Já revisei tudo (spec, plano, research, data-model, contratos e código); a
  suíte está vermelha por rastreabilidade, então vou investigar as outras 2
  falhas antes de escrever as tasks.

  Ran 2 shell commands (ctrl+o to expand)

● Tenho tudo o que preciso. As tasks da v4 entram na Fase 5 (T-043 em diante),
  sem mexer nas T-001 a T-042. Escrevendo agora.

● Update(tasks.md)
  ⎿  Added 1 line, removed 1 line
       8  
       9  **Formato do commit:** `feat(T-003): <descrição>` · `test(T-003
          ): <descrição>`
      10  
      11 -**Base:** `spec.md` v1.3 · `plan.md` v1.2 · `data-model.md` · `
         -research.md` · `contracts/`                                    
      11 +**Base:** Fases 1–4: `spec.md` v1.3 · `plan.md` v1.2. Fase 5: `
         +spec.md` v2.2 · `plan.md` v2.0 · `data-model.md` · `research.md
         +` (R-11 a R-17) · `contracts/`                                 
      12  
      13  **Convenções que valem para todas as tasks** (do `plan.md` §2 e
           §6 e do `CLAUDE.md`):
      14  

● Update(tasks.md)
  ⎿  Added 182 lines, removed 2 lines
      248  
      249  ## Fase 5 — Envelope (criar no Dia 2)
      250  
      251 -<Novas tasks a partir da mudança de requisito. Numeração conti
          -nua de onde parou —                                           
      252 -não reinicie e não renumere as antigas: a numeração é o eixo d
          -a rastreabilidade.>                                           
      251 +> Política v4 (D-019 a D-021): tabela de limites por centro de
          + custo lida de                                                
      252 +> fora, moeda estrangeira e aprovação manual. As tasks da v1 q
          +ue a v4 afeta                                                 
      253 +> (lista em D-019) **não** são reabertas: cada mudança entra n
          +uma task nova,                                                
      254 +> que cita a antiga quando a estende.                         
      255 +>                                                             
      256 +> **Convenções extras da Fase 5** (plan §2, §6, R-10, R-11):  
      257 +>                                                             
      258 +> - **Suíte vermelha conhecida:** desde a spec 2.2, `tests/ras
          +treabilidade.test.ts`                                         
      259 +>   (RN-016 a RN-018 e 41 casos de borda sem teste) e `tests/c
          +ontrato-saida.test.ts`                                        
      260 +>   (schema já na v4) falham. Até a T-066 (contrato) e a T-070
      261 +>   (rastreabilidade), o "Aceite" de cada task é: os testes li
          +stados passam,                                                
      262 +>   `npm run typecheck` sem erros e **nenhuma falha além dessa
          +s duas**.                                                     
      263 +> - **Fixture da v4:** os testes de regra e de borda usam a ta
          +bela de                                                       
      264 +>   `exemplos/envelope/politica-v4.json` e o câmbio de        
      265 +>   `exemplos/envelope/cambio.json`, carregados por `tests/apo
          +io.ts`, **nunca**                                             
      266 +>   `dados/`. Sem centro de custo e sem `moeda`, os testes da 
          +v1 continuam                                                  
      267 +>   valendo sem mudar a expectativa (tabela padrão, BRL).     
      268 +> - **Arquivos de teste novos:** `tests/nucleo/rn-016-politica
          +-centro-custo.test.ts`                                        
      269 +>   (`describe('RN-016 — Política por centro de custo')`),    
      270 +>   `tests/nucleo/rn-017-cambio.test.ts` (`describe('RN-017 — 
          +Moeda e conversão para reais')`)                              
      271 +>   e `tests/nucleo/rn-018-aprovacao.test.ts`                 
      272 +>   (`describe('RN-018 — Aprovação manual de itens acima de R$
          + 500')`). Testes                                              
      273 +>   `RN-015 ›` dos arquivos externos ficam em `tests/io/rn-015
          +-entrada.test.ts`.                                            
      274  
      275 +### 5.1 Fundação da v4                                        
      276 +                                                              
      277 +- [ ] **T-043** — Acrescentar em `src/nucleo/tipos.ts` os tipo
          +s novos do `data-model.md` §2–§3, **sem remover nem alterar** 
          +os da v1: `Decimal` (`{ digitos: bigint; escala: number }`), `
          +Moeda`, `Periodicidade` (`'dia' | 'diaria'`), `RegraCategoria`
          +, `TabelaCategorias`, `Politica`, `Cotacao`, `Cambio`, `Tabela
          +Aplicavel` e `Conversao` (`{ taxa: NumeroJson; dataCotacao: Da
          +taISO | null; valorSolicitado: Centavos }`). `Categoria`, `Sta
          +tus`, a união de códigos, `Entrada`, `DespesaValida` e `Result
          +adoItem` só mudam nas tasks que os usam (T-048, T-050, T-055, 
          +T-056, T-058)                                                 
      278 +  - **Atende:** RN-016, RN-017, AMB-043                       
      279 +  - **Aceite:** `npm run typecheck` sem erros e `npm test` sem
          + falhas além das duas conhecidas                              
      280 +  - **Commit:** `<hash preenchido depois>`                    
      281 +                                                              
      282 +- [ ] **T-044** — [P] Criar `src/nucleo/decimal.ts` (R-13): `d
          +ecimalDe(texto)` lê sinal, dígitos, ponto e expoente (o mesmo 
          +leitor de `paraCentavos`) e devolve `Decimal`; `dividirMeioPar
          +aPar(numerador: bigint, denominador: bigint): bigint` é o únic
          +o arredondamento do sistema. `paraCentavos` em `src/nucleo/din
          +heiro.ts` passa a usá-la                                      
      283 +  - **Atende:** RN-001, AMB-013, AMB-037                      
      284 +  - **Aceite:** em `tests/nucleo/decimal.test.ts` passam `Infr
          +a › decimal: "5.93" → 593 × 10^-2, "50" → 50 × 10^0 e "1.00005
          +e2" → 100005 × 10^-3` e `Infra › decimal: dividirMeioParaPar 2
          +5/10 → 2, 35/10 → 4, 26/10 → 3, 24/10 → 2 e -25/10 → -2`; todo
          +s os `RN-001 ›` de `tests/nucleo/rn-001-arredondamento.test.ts
          +` continuam passando                                          
      285 +  - **Commit:** `<hash preenchido depois>`                    
      286 +                                                              
      287 +- [ ] **T-045** — [P] Criar `src/io/politica.ts` (R-12): `lerP
          +olitica(texto, rotulo = 'tabela de limites (dados/politica.jso
          +n)')` → `Politica` ou lança `ErroEntrada`, com a mensagem come
          +çando pelo `rotulo` e citando o caminho do campo (`centros_cus
          +to.CC-ADM.alimentacao.limite`). Valida a lista da RN-016 e a A
          +MB-044: objeto; `versao` texto não vazio; `vigencia` data váli
          +da (T-004); `moeda_base` = `"BRL"`; `padrao` e `centros_custo`
          + objetos; cada centro de custo e cada categoria objeto; `limit
          +e` número ≥ 0 exato em centavos; `periodicidade` `dia`/`diaria
          +`, com `diaria` ⇔ `hospedagem`; `nota_fiscal_obrigatoria_acima
          +_de` e `acrescimo_em_viagem_percentual` números ≥ 0 (viram `De
          +cimal`); centros de custo e categorias de uma mesma tabela sem
          + colisão depois de `normalizar` (T-007). `observacao` e campos
          + desconhecidos são ignorados. Guarda o nome do centro de custo
          + como está escrito                                            
      288 +  - **Atende:** RN-015, RN-016, AMB-034, AMB-044              
      289 +  - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `R
          +N-015 › tabela de limites de exemplos/envelope/politica-v4.jso
          +n é lida: versao v4, padrão com 3 categorias, 3 centros de cus
          +to, limiar 100.00 e acréscimo 50`, `RN-015 › tabela de limites
          + com "limite": -10 → erro que cita a tabela de limites e o cam
          +po`, `RN-015 › tabela de limites: limite que não é número ou c
          +om mais de 2 casas (60.001) → erro que cita o campo`, `RN-015 
          +› tabela de limites sem versao, com versao vazia ou com vigenc
          +ia que não é data → erro que cita o campo`, `RN-015 › tabela d
          +e limites: moeda_base diferente de BRL → erro`, `RN-015 › tabe
          +la de limites: periodicidade fora de dia/diaria, diaria em ali
          +mentacao ou hospedagem com dia → erro`, `RN-015 › tabela de li
          +mites: nota_fiscal_obrigatoria_acima_de ou acrescimo_em_viagem
          +_percentual ausente, não numérico ou negativo → erro`, `RN-015
          + › tabela de limites: "CC-ADM" e " cc-adm " em centros_custo, 
          +ou "Alimentação" e "alimentacao" na mesma tabela → erro`, `RN-
          +015 › tabela de limites: arquivo, padrao, centros_custo, centr
          +o de custo ou categoria que não é objeto → erro`, `RN-015 › ta
          +bela de limites: observacao e campos desconhecidos são ignorad
          +os` e `RN-015 › tabela de limites que não é JSON → erro que ci
          +ta a tabela de limites`                                       
      290 +  - **Commit:** `<hash preenchido depois>`                    
      291 +                                                              
      292 +- [ ] **T-046** — [P] Criar `src/io/cambio.ts` (R-12, R-14): `
          +lerCambio(texto, rotulo = 'arquivo de câmbio (dados/cambio.jso
          +n)')` → `Cambio` ou lança `ErroEntrada` (mesmo formato de mens
          +agem da T-045). Valida a lista da RN-017 e a AMB-044: objeto; 
          +`moeda_base` = `"BRL"`; `taxas` objeto; cada chave de `taxas` 
          +data válida; cada valor de data objeto; cada moeda com 3 letra
          +s; cada taxa número > 0, **inclusive** a de uma moeda repetida
          + que vai ser sobrescrita. Monta o índice `Map<Moeda, Cotacao[]
          +>` com a moeda em maiúsculas (`normalizarMoeda`, criada aqui e
          +m `src/nucleo/texto.ts`: `trim` + `toUpperCase`), datas em ord
          +em crescente e, para a mesma moeda na mesma data, a **última**
          + do arquivo. `fonte`, `observacao` e campos desconhecidos são 
          +ignorados                                                     
      293 +  - **Atende:** RN-015, RN-017, AMB-042, AMB-044              
      294 +  - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `R
          +N-015 › câmbio de exemplos/envelope/cambio.json é lido: USD e 
          +EUR com 12 cotações cada, em ordem de data`, `RN-015 › câmbio:
          + moeda_base diferente de BRL, ou taxas ausente ou que não é ob
          +jeto → erro que cita o arquivo de câmbio`, `RN-015 › câmbio: c
          +have de taxas que não é data válida (2026-07-32) ou valor de d
          +ata que não é objeto → erro que cita o campo`, `RN-015 › câmbi
          +o: moeda sem 3 letras ("EURO", "US") → erro`, `RN-015 › câmbio
          +: taxa 0, negativa ou texto → erro, inclusive numa moeda repet
          +ida que acaba sobrescrita`, `RN-015 › câmbio: fonte, observaca
          +o e campos desconhecidos são ignorados` e `RN-015 › câmbio que
          + não é JSON → erro que cita o arquivo de câmbio`; em `tests/nu
          +cleo/rn-017-cambio.test.ts` passam `RN-017 › câmbio: "usd" no 
          +arquivo é indexado como USD`, `RN-017 › câmbio: "USD": 5.42 e 
          +depois "usd": 5.50 na mesma data → vale 5.50, sem erro` e `RN-
          +017 › câmbio: datas fora de ordem no arquivo ficam em ordem cr
          +escente no índice`                                            
      295 +  - **Commit:** `<hash preenchido depois>`                    
      296 +                                                              
      297 +- [ ] **T-047** — Criar `dados/politica.json` e `dados/cambio.
          +json` como cópias byte a byte de `exemplos/envelope/politica-v
          +4.json` e `exemplos/envelope/cambio.json`, e `src/io/externos.
          +ts` (R-11, DT-006): `CAMINHO_POLITICA` e `CAMINHO_CAMBIO` reso
          +lvidos a partir de `import.meta.dirname` (`../../dados/`), e `
          +lerExternos(caminhos = { politica: CAMINHO_POLITICA, cambio: C
          +AMINHO_CAMBIO })` → `{ politica, cambio }`, lendo a tabela **a
          +ntes** do câmbio (T-045, T-046). Arquivo ausente ou ilegível →
          + `ErroEntrada` `"<rótulo> (<caminho relativo à raiz>): arquivo
          + não encontrado"`                                             
      298 +  - **Atende:** RN-015, AMB-028                               
      299 +  - **Aceite:** em `tests/io/externos.test.ts` passa `Infra › 
          +externos: caminhos apontam para <raiz>/dados/, independente de
          + process.cwd()`; em `tests/io/rn-015-entrada.test.ts` passam `
          +RN-015 › arquivo de câmbio ausente → erro que cita o arquivo d
          +e câmbio`, `RN-015 › tabela de limites ausente → erro que cita
          + a tabela de limites` e `RN-015 › tabela e câmbio inválidos → 
          +a mensagem é a da tabela (ordem de leitura)`; `git diff --no-i
          +ndex exemplos/envelope/politica-v4.json dados/politica.json` e
          + o mesmo para o câmbio não mostram diferença                  
      300 +  - **Commit:** `<hash preenchido depois>`                    
      301 +                                                              
      302 +- [ ] **T-048** — [P] Ler `colaborador.centro_custo` em `src/i
          +o/entrada.ts` (estende T-025): `Entrada` ganha `centroCusto: s
          +tring | null`; ausente, nulo, texto vazio ou só espaços → `nul
          +l`; texto → como veio (a normalização é da T-049); qualquer ou
          +tro tipo → `ErroEntrada` que cita `colaborador.centro_custo`. 
          +`tests/apoio.ts` passa a preencher `centroCusto` (padrão `null
          +`). O motor ainda não lê o campo                              
      303 +  - **Atende:** RN-015, AMB-032                               
      304 +  - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `R
          +N-015 › "centro_custo": 42, true, [] ou {} → erro que cita col
          +aborador.centro_custo` e `RN-015 › centro_custo ausente, null,
          + "" ou "  " é aceito (centroCusto nulo)`                      
      305 +  - **Commit:** `<hash preenchido depois>`                    
      306 +                                                              
      307 +### 5.2 Regras de negócio da v4                               
      308 +                                                              
      309 +- [ ] **T-049** — Em `src/nucleo/politica.ts`, acrescentar `LI
          +MIAR_APROVACAO = 500_00n` (com `// RN-018, AMB-040`) e `tabela
          +Aplicavel(politica, centroCusto)` → `TabelaAplicavel` (RN-016)
          +: `centroCusto` nulo ou sem entrada em `centros_custo` (compar
          +ado com `normalizar`) → `padrao` inteiro, `nome` `"padrao"`; c
          +om entrada → cada categoria do centro de custo por cima do pad
          +rão, categoria que falta herda do padrão (`origem: 'padrao'`),
          + limite 0 **não** herda; `nome` = centro de custo como está es
          +crito na tabela; limiar de NF e acréscimo únicos. `POLITICA` c
          +ontinua existindo até a T-050                                 
      310 +  - **Atende:** RN-016, AMB-029, AMB-030, AMB-031, AMB-032    
      311 +  - **Aceite:** em `tests/nucleo/rn-016-politica-centro-custo.
          +test.ts` passam `RN-016 › CC-SUPORTE-N2 (sem entrada) → tabela
          + "padrao", alimentação 60,00`, `RN-016 › " cc-comercial " → ta
          +bela "CC-COMERCIAL"`, `RN-016 › sem centro de custo → tabela "
          +padrao"`, `RN-016 › CC-ADM sem hospedagem → hospedagem 250,00 
          +herdada do padrão`, `RN-016 › CC-ENG-PLATAFORMA: hospedagem co
          +m limite 0 não herda do padrão`, `RN-016 › representacao só ex
          +iste na tabela do CC-COMERCIAL` e `RN-016 › limiar de nota fis
          +cal e acréscimo de viagem são os da tabela, iguais para todo c
          +entro de custo`                                               
      312 +  - **Commit:** `<hash preenchido depois>`                    
      313 +                                                              
      314 +- [ ] **T-050** — Refatorar o núcleo para receber a `TabelaApl
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
      315 +  - **Atende:** RN-002, RN-006, RN-008, RN-009, RN-011, RN-012
          +, AMB-020, AMB-033                                            
      316 +  - **Aceite:** todos os testes das Fases 1–4 continuam passan
          +do sem mudar expectativa; em `tests/nucleo/politica.test.ts` p
          +assa `Infra › política: src/nucleo/politica.ts não tem limite,
          + limiar de nota fiscal nem percentual (só LIMIAR_APROVACAO e t
          +abelaAplicavel)`; em `tests/nucleo/rn-011-viagem.test.ts` pass
          +a `RN-011 › limite 60,01 ampliado em 50% → 90,02 e 60,03 → 90,
          +04 (meio para o par, AMB-033)`                                
      317 +  - **Commit:** `<hash preenchido depois>`                    
      318 +                                                              
      319 +- [ ] **T-051** — Ligar o centro de custo: `motor.calcular(ent
          +rada, politica)` monta a `TabelaAplicavel` uma vez com `entrad
          +a.centroCusto` (seção 8, "antes de tudo") e `Resultado` ganha 
          +`politica: { versao, tabela }`; `src/cli.ts` passa a `Politica
          +`. `tests/exemplo.test.ts` passa a usar a tabela de `exemplos/
          +envelope/politica-v4.json` e a tabela 1 da seção 9 (colaborado
          +r do CC-ENG-PLATAFORMA), substituindo os títulos da T-036     
      320 +  - **Atende:** RN-016, RN-005, RN-006, RN-009, RN-010, RN-014
          +, AMB-029, AMB-032, AMB-034                                   
      321 +  - **Aceite:** em `tests/nucleo/rn-016-politica-centro-custo.
          +test.ts` passam `RN-016 › CC-SUPORTE-N2: alimentação 65,00 → P
          +ARCIAL 60,00`, `RN-016 › " cc-comercial ": alimentação 85,00 →
          + APROVADO 85,00`, `RN-016 › CC-ADM: hospedagem 1 diária 300,00
          + → PARCIAL 250,00`, `RN-016 › representacao no CC-SUPORTE-N2 →
          + CATEGORIA_NAO_REEMBOLSAVEL`, `RN-016 › limite de alimentação 
          +do padrão trocado para 70,00 na tabela: alimentação 65,00 pass
          +a de PARCIAL a APROVADO` e `RN-016 › vigencia 2026-08-01 não r
          +ecusa nem muda despesas de julho (AMB-034)`; em `tests/exemplo
          +.test.ts` passam `RN-009 › exemplo d-001: APROVADO 72,50 (limi
          +te 75,00 do CC-ENG-PLATAFORMA)`, `RN-010 › exemplo d-002: PARC
          +IAL 2,50`, `RN-010 › exemplo d-003: PARCIAL 80,00`, `RN-008 › 
          +exemplo d-004: NOTA_FISCAL_AUSENTE`, `RN-006 › exemplo d-005: 
          +CATEGORIA_NAO_REEMBOLSAVEL`, `RN-009 › exemplo d-006: APROVADO
          + 54,90`, `RN-007 › exemplo d-007: DUPLICATA`, `RN-005 › exempl
          +o d-008: FORA_DO_PERIODO`, `RN-004 › exemplo d-009: VALOR_NAO_
          +POSITIVO`, `RN-001 › exemplo d-011: APROVADO 33,33`, `RN-009 ›
          + exemplo d-012: APROVADO 47,20`, `RN-009 › exemplo d-014: APRO
          +VADO 61,00`, `RN-014 › exemplo: resumo 1861.84 / 351.43 / 1510
          +.41 · 5/2/7` e `RN-016 › exemplo: tabela aplicada CC-ENG-PLATA
          +FORMA` (d-010 e d-013 entram na T-052)                        
      322 +  - **Commit:** `<hash preenchido depois>`                    
      323 +                                                              
      324 +- [ ] **T-052** — Categoria com limite 0 na etapa 5 (estende T
          +-014) em `src/nucleo/elegibilidade.ts`: reembolsável = limite 
          +> 0 na tabela aplicável; `Recusa(CATEGORIA_NAO_REEMBOLSAVEL)` 
          +leva `{ categoria, tabela, caso: 'ausente' | 'limite_zero', ce
          +ntroCusto }`. Em `src/nucleo/motivos.ts`, `ausente` diz que a 
          +categoria não consta na tabela (padrão ou do centro de custo) 
          +da política `<versao>`, e `limite_zero` diz que ela não é reem
          +bolsável no centro de custo e cita o nome dele                
      325 +  - **Atende:** RN-006, RN-002, RN-011, AMB-019, AMB-030, AMB-
          +031                                                           
      326 +  - **Aceite:** em `tests/nucleo/rn-006-categorias.test.ts` pa
          +ssam `RN-006 › hospedagem no CC-ENG-PLATAFORMA → CATEGORIA_NAO
          +_REEMBOLSAVEL, descrição cita "CC-ENG-PLATAFORMA"`, `RN-006 › 
          +representacao na tabela padrão → CATEGORIA_NAO_REEMBOLSAVEL, d
          +escrição diz que não consta na política` e `RN-006 › limite 0 
          +recusa na etapa 5: hospedagem 690,00 sem NF no CC-ENG-PLATAFOR
          +MA sai CATEGORIA_NAO_REEMBOLSAVEL`; em `tests/nucleo/rn-011-vi
          +agem.test.ts` passa `RN-011 › hospedagem com limite 0 no centr
          +o de custo não gera dia de viagem`; em `tests/nucleo/rn-002-ca
          +tegoria.test.ts` passa `RN-002 › "Representação" é representac
          +ao no CC-COMERCIAL e sai como veio na tabela padrão`; em `test
          +s/exemplo.test.ts` passam `RN-006 › exemplo d-010: CATEGORIA_N
          +AO_REEMBOLSAVEL (hospedagem com limite 0)` e `RN-006 › exemplo
          + d-013: CATEGORIA_NAO_REEMBOLSAVEL (antes da nota fiscal)`    
      327 +  - **Commit:** `<hash preenchido depois>`                    
      328 +                                                              
      329 +- [ ] **T-053** — Testes de limite, viagem e nota fiscal com a
          + tabela de outro centro de custo e com a tabela alterada em me
          +mória. Se algum falhar, o conserto faz parte desta task       
      330 +  - **Atende:** RN-008, RN-009, RN-010, RN-011, AMB-029, AMB-0
          +33                                                            
      331 +  - **Aceite:** passam, em `tests/nucleo/rn-009-limites.test.t
          +s`, `RN-009 › alimentação 80,00 no CC-COMERCIAL → APROVADO 80,
          +00 (limite 90,00)` e `RN-009 › alimentação 50,00 no CC-ADM → P
          +ARCIAL 45,00`; em `tests/nucleo/rn-010-parcial.test.ts`, `RN-0
          +10 › CC-ENG-PLATAFORMA (75,00): d-001 72,50 → APROVADO 72,50 e
          + d-002 38,00 → PARCIAL 2,50`; em `tests/nucleo/rn-011-viagem.t
          +est.ts`, `RN-011 › CC-COMERCIAL: representacao 420,00 em dia d
          +e viagem → APROVADO 420,00 (limite 450,00)` e `RN-011 › acrésc
          +imo trocado para 20 na tabela: alimentação em dia de viagem te
          +m limite 72,00`; em `tests/nucleo/rn-008-nota-fiscal.test.ts`,
          + `RN-008 › limiar trocado para 150,00 na tabela: 120,00 sem NF
          + não é recusada`                                              
      332 +  - **Commit:** `<hash preenchido depois>`                    
      333 +                                                              
      334 +- [ ] **T-054** — [P] Criar `src/nucleo/cambio.ts` (DT-007, R-
          +13, R-14): `converter(valorOriginal, moeda, data, cambio)` → `
          +Conversao | null`. `BRL` → `{ taxa: NumeroJson "1", dataCotaca
          +o: null, valorSolicitado: valorOriginal }`, sem olhar a data. 
          +Outra moeda → último elemento do índice com `data ≤ D` (busca 
          +binária, comparação de texto); `valorSolicitado = dividirMeioP
          +araPar(valorOriginal × taxa.digitos, 10^taxa.escala)`; sem cot
          +ação até D (ou moeda fora do índice) → `null`                 
      335 +  - **Atende:** RN-017, RN-001, AMB-035, AMB-037              
      336 +  - **Aceite:** em `tests/nucleo/rn-017-cambio.test.ts` passam
          + `RN-017 › e-002 (22,00 EUR em 14/07) → taxa 5.93, cotação 202
          +6-07-14, R$ 130,46`, `RN-017 › e-004 (30,00 EUR no sábado 18/0
          +7) → taxa 5.96 de 2026-07-17, R$ 178,80`, `RN-017 › 10,05 USD 
          +em 13/07 × 5,42 = 54,471 → R$ 54,47`, `RN-017 › 0,50 USD em 16
          +/07 × 5,41 = 2,705 → R$ 2,70 (meio para o par, AMB-037)`, `RN-
          +017 › EUR em 2026-07-10 (antes da primeira cotação) → sem conv
          +ersão`, `RN-017 › GBP e EURO (fora do câmbio) → sem conversão`
          +, `RN-017 › BRL → taxa 1, data_cotacao nula, valor igual ao or
          +iginal` e `RN-017 › cotação antiga continua valendo: EUR em 20
          +26-12-31 usa a de 2026-07-28 (AMB-035)`                       
      337 +  - **Commit:** `<hash preenchido depois>`                    
      338 +                                                              
      339 +- [ ] **T-055** — Validar `moeda` em `src/nucleo/despesa.ts` (
          +estende T-008): ausente, nula, texto vazio ou só espaços → `"B
          +RL"`; texto → `normalizarMoeda` (T-046), **sem checagem de for
          +mato**; outro tipo (número, booleano, lista, objeto) → `DADO_I
          +NVALIDO`. `DespesaValida` ganha `moeda`; `RecusaDadoInvalido` 
          +ganha o eco bruto de `moeda` (ausente → `null`)               
      340 +  - **Atende:** RN-003, AMB-036, AMB-023                      
      341 +  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pas
          +sam `RN-003 › "moeda": " eur " vale EUR`, `RN-003 › moeda ause
          +nte, null, "" ou "  " vale BRL`, `RN-003 › "moeda": 978, true,
          + [] ou {} → DADO_INVALIDO com a moeda como veio no eco` e `RN-
          +003 › "moeda": "EURO" passa pela validação (moeda EURO)`      
      342 +  - **Commit:** `<hash preenchido depois>`                    
      343 +                                                              
      344 +- [ ] **T-056** — Ligar a conversão (etapas 1 e 6, DT-007): `v
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
      345 +  - **Atende:** RN-017, RN-001, RN-003, RN-004, RN-008, RN-012
          +, RN-014, AMB-025, AMB-036, AMB-037, AMB-038, AMB-039, AMB-043
      346 +  - **Aceite:** passam, em `tests/nucleo/rn-017-cambio.test.ts
          +`, `RN-017 › e-006 (55,00 GBP) → CAMBIO_INDISPONIVEL, valor_so
          +licitado nulo`, `RN-017 › 10,00 "EURO" → CAMBIO_INDISPONIVEL, 
          +e não DADO_INVALIDO`, `RN-017 › EUR em 2026-07-10 → CAMBIO_IND
          +ISPONIVEL`, `RN-017 › EUR em 2026-06-30 num período de julho →
          + FORA_DO_PERIODO, e não CAMBIO_INDISPONIVEL`, `RN-017 › GBP co
          +m categoria coworking → CATEGORIA_NAO_REEMBOLSAVEL (etapa 5 an
          +tes da 6)`, `RN-017 › e-010 (sem moeda) → BRL, taxa_cambio 1` 
          +e `RN-017 › limite compara o valor em reais: 22,00 EUR (R$ 130
          +,46) de alimentação na tabela padrão → PARCIAL 60,00`; em `tes
          +ts/nucleo/rn-004-valor-nao-positivo.test.ts`, `RN-004 › −10,00
          + GBP (sem cotação) → VALOR_NAO_POSITIVO` e `RN-004 › 0,01 numa
          + moeda de taxa 0.20 → R$ 0,00 → VALOR_NAO_POSITIVO`; em `tests
          +/nucleo/rn-008-nota-fiscal.test.ts`, `RN-008 › e-005 (40,00 US
          +D × 5,50 = R$ 220,00, sem NF) → NOTA_FISCAL_AUSENTE` e `RN-008
          + › e-003 (14,50 EUR × 5,88 = R$ 85,26, sem NF) não é recusada 
          +por nota fiscal`; em `tests/nucleo/rn-003-validacao.test.ts`, 
          +`RN-003 › id de despesa recusada por CAMBIO_INDISPONIVEL conti
          +nua reservado (AMB-025)`, `RN-003 › valor inválido: valor_orig
          +inal e os três campos de conversão nulos, mesmo em BRL ou com 
          +cotação (AMB-043)`, `RN-003 › BRL com valor numérico e data in
          +válida → DADO_INVALIDO com taxa 1 e valor_solicitado preenchid
          +o`, `RN-003 › EUR com valor numérico e data inválida → DADO_IN
          +VALIDO com conversão nula` e `RN-003 › DADO_INVALIDO por outro
          + campo, EUR com cotação → valor_solicitado convertido`; em `te
          +sts/nucleo/rn-012-diarias.test.ts`, `RN-012 › parcelas em reai
          +s: 100,00 USD em 13/07 (R$ 542,00) "2 diarias" → 271,00 + 271,
          +00 → PARCIAL 500,00`; em `tests/nucleo/rn-014-resumo.test.ts`,
          + `RN-014 › total_solicitado soma o valor em reais e ignora CAM
          +BIO_INDISPONIVEL (nulo)`                                      
      347 +  - **Commit:** `<hash preenchido depois>`                    
      348 +                                                              
      349 +- [ ] **T-057** — Duplicata com moeda (estende T-015) em `src/
          +nucleo/elegibilidade.ts`: a chave passa a ser `(data, categori
          +a, fornecedor, moeda normalizada, valorOriginal)`             
      350 +  - **Atende:** RN-007, AMB-038                               
      351 +  - **Aceite:** em `tests/nucleo/rn-007-duplicatas.test.ts` pa
          +ssam `RN-007 › 20,00 EUR e 20,00 USD, resto igual → as duas se
          +guem`, `RN-007 › sem moeda e "BRL", resto igual → a 2ª DUPLICA
          +TA` e `RN-007 › "eur" e "EUR", resto igual → a 2ª DUPLICATA`; 
          +todos os `RN-007 ›` da T-015 continuam passando               
      352 +  - **Commit:** `<hash preenchido depois>`                    
      353 +                                                              
      354 +- [ ] **T-058** — Aprovação manual (etapa 11, DT-008, R-16): `
          +Status` ganha `PENDENTE` e a união de códigos ganha `REQUER_AP
          +ROVACAO`; `statusDe` em `src/nucleo/status.ts` devolve `PENDEN
          +TE` quando `reembolsável > LIMIAR_APROVACAO`, antes das outras
          + regras; em `src/nucleo/motor.ts`, um `map` depois da alocação
          + troca o motivo por `REQUER_APROVACAO` (com os detalhes do lim
          +ite), sem mudar valor nem saldo; em `src/nucleo/motivos.ts`, a
          + descrição cita o valor calculado, o limiar de R$ 500,00 e, se
          + houve, o valor cortado pelo limite                           
      355 +  - **Atende:** RN-018, RN-011, RN-013, AMB-040, AMB-041      
      356 +  - **Aceite:** em `tests/nucleo/rn-018-aprovacao.test.ts` pas
          +sam `RN-018 › e-007 (hospedagem 1.200,00, 3 × 400,00 no CC-COM
          +ERCIAL) → PENDENTE REQUER_APROVACAO, reembolsável 1.200,00`, `
          +RN-018 › reembolsável exatamente 500,00 → APROVADO, não PENDEN
          +TE`, `RN-018 › reembolsável 500,01 (CC-COMERCIAL, "2 diarias" 
          +500,01) → PENDENTE`, `RN-018 › hospedagem 1.200,00 com 1 diári
          +a na tabela padrão → PARCIAL 250,00, não PENDENTE`, `RN-018 › 
          +PENDENTE consome o limite: hospedagem seguinte na mesma noite 
          +→ LIMITE_DIARIO_ESGOTADO` e `RN-018 › descrição cita o valor c
          +alculado, o limiar de R$ 500,00 e o corte de limite`; em `test
          +s/nucleo/rn-011-viagem.test.ts`, `RN-011 › CC-COMERCIAL: e-008
          + (alimentação 95,00 em 23/07, noite de e-007 PENDENTE) → APROV
          +ADO 95,00 (limite 135,00)`; em `tests/nucleo/rn-013-motivos.te
          +st.ts`, `RN-013 › todo código da seção 4 gera descrição não va
          +zia` cobre os 11 códigos                                      
      357 +  - **Commit:** `<hash preenchido depois>`                    
      358 +                                                              
      359 +- [ ] **T-059** — [P] Resumo da v4 em `src/nucleo/resumo.ts` (
          +estende T-024): `pendentes`; `totalReembolsavel` só dos itens 
          +não PENDENTE; `totalPendente` dos PENDENTE; `totalNaoReembolsa
          +do = solicitado − reembolsável − pendente`                    
      360 +  - **Atende:** RN-014, AMB-041                               
      361 +  - **Aceite:** em `tests/nucleo/rn-014-resumo.test.ts` passam
          + `RN-014 › PENDENTE entra em total_solicitado e total_pendente
          +, e não em total_reembolsavel`, `RN-014 › total_nao_reembolsad
          +o = total_solicitado − total_reembolsavel − total_pendente, ex
          +ato em centavos`, `RN-014 › contagens (aprovados, parciais, re
          +cusados, pendentes) somam quantidade_itens` e `RN-014 › lista 
          +vazia → pendentes 0 e total_pendente 0,00`; o teste da T-024 `
          +RN-014 › soma de valor_reembolsavel dos itens = total_reembols
          +avel ...` passa a somar só os itens não PENDENTE              
      362 +  - **Commit:** `<hash preenchido depois>`                    
      363 +                                                              
      364 +- [ ] **T-060** — [P] Descrições da v4 em `src/nucleo/motivos.
          +ts` (RN-013): todo item com conversão em moeda estrangeira tra
          +z `"<MOEDA> <original> × <taxa> (cotação de <data>) = R$ <reai
          +s>"` antes do texto do código; `CAMBIO_INDISPONIVEL` cita a mo
          +eda e a data da despesa; `NOTA_FISCAL_AUSENTE` em moeda estran
          +geira cita o valor em reais e o limiar                        
      365 +  - **Atende:** RN-013, RN-017, RN-008                        
      366 +  - **Aceite:** em `tests/nucleo/rn-013-motivos.test.ts` passa
          +m `RN-013 › item em moeda estrangeira: descrição traz valor or
          +iginal × taxa, data da cotação e valor em reais`, `RN-013 › CA
          +MBIO_INDISPONIVEL cita a moeda e a data da despesa` e `RN-013 
          +› NOTA_FISCAL_AUSENTE em moeda estrangeira cita o valor em rea
          +is e o limiar`                                                
      367 +  - **Commit:** `<hash preenchido depois>`                    
      368 +                                                              
      369 +### 5.3 Casos de borda da v4                                  
      370 +                                                              
      371 +> Todos em `tests/casos-de-borda.test.ts`, chamando o motor em
          + memória com a                                                
      372 +> fixture da v4 (`tests/apoio.ts`, com centro de custo, tabela
          + e câmbio                                                     
      373 +> opcionais). Um `it` por linha da seção 7, título `Borda › <C
          +aso>` com o texto                                             
      374 +> exato da coluna "Caso". Se um teste falhar, o conserto faz p
          +arte da mesma task.                                           
      375 +> Os 4 casos de arquivo externo ficam na T-069.               
      376 +                                                              
      377 +- [ ] **T-061** — Casos de borda de centro de custo e tabela a
          +plicável em `tests/casos-de-borda.test.ts`                    
      378 +  - **Atende:** RN-002, RN-006, RN-009, RN-011, RN-016, AMB-02
          +9, AMB-030, AMB-031, AMB-032, AMB-033                         
      379 +  - **Aceite:** passam `Borda › Centro de custo sem entrada na
          + tabela`, `Borda › Colaborador sem centro de custo`, `Borda › 
          +Centro de custo com outra grafia`, `Borda › Categoria herdada 
          +do padrão`, `Borda › Categoria só em outro centro de custo`, `
          +Borda › Categoria nova no centro de custo`, `Borda › Categoria
          + com limite zero`, `Borda › Limite zero não gera viagem`, `Bor
          +da › Limite zero vem antes da nota fiscal` e `Borda › Represen
          +tação em dia de viagem`                                       
      380 +  - **Commit:** `<hash preenchido depois>`                    
      381 +                                                              
      382 +- [ ] **T-062** — Casos de borda de `moeda` e de valor inválid
          +o com conversão em `tests/casos-de-borda.test.ts`             
      383 +  - **Atende:** RN-003, RN-017, AMB-023, AMB-036, AMB-043     
      384 +  - **Aceite:** passam `Borda › Valor inválido em moeda estran
          +geira`, `Borda › Valor inválido em BRL`, `Borda › Moeda ausent
          +e`, `Borda › Moeda nula ou vazia`, `Borda › Moeda em minúscula
          +s`, `Borda › Moeda não textual` e `Borda › Moeda fora do câmbi
          +o`                                                            
      385 +  - **Commit:** `<hash preenchido depois>`                    
      386 +                                                              
      387 +- [ ] **T-063** — Casos de borda de conversão e do arquivo de 
          +câmbio em `tests/casos-de-borda.test.ts` ("Moeda repetida no c
          +âmbio" e "Moeda minúscula no câmbio" montam o câmbio a partir 
          +do texto com `lerCambio`, R-14)                               
      388 +  - **Atende:** RN-001, RN-004, RN-005, RN-014, RN-017, AMB-03
          +5, AMB-037, AMB-039, AMB-042                                  
      389 +  - **Aceite:** passam `Borda › Conversão em dia útil`, `Borda
          + › Conversão no fim de semana`, `Borda › Antes da primeira cot
          +ação`, `Borda › Moeda sem cotação`, `Borda › Estrangeira fora 
          +do período`, `Borda › Estrangeira negativa sem cotação`, `Bord
          +a › Arredondamento da conversão`, `Borda › Moeda repetida no c
          +âmbio` e `Borda › Moeda minúscula no câmbio`                  
      390 +  - **Commit:** `<hash preenchido depois>`                    
      391 +                                                              
      392 +- [ ] **T-064** — Casos de borda de nota fiscal e duplicata em
          + moeda estrangeira em `tests/casos-de-borda.test.ts`          
      393 +  - **Atende:** RN-007, RN-008, AMB-038                       
      394 +  - **Aceite:** passam `Borda › Nota fiscal sobre o valor conv
          +ertido`, `Borda › Estrangeira abaixo do limiar de NF`, `Borda 
          +› Mesmo valor em moedas diferentes` e `Borda › BRL explícito e
          + implícito`                                                   
      395 +  - **Commit:** `<hash preenchido depois>`                    
      396 +                                                              
      397 +- [ ] **T-065** — Casos de borda de aprovação manual em `tests
          +/casos-de-borda.test.ts`                                      
      398 +  - **Atende:** RN-010, RN-011, RN-012, RN-014, RN-018, AMB-04
          +0, AMB-041                                                    
      399 +  - **Aceite:** passam `Borda › Reembolsável exatamente 500,00
          +`, `Borda › Reembolsável acima de 500,00`, `Borda › Solicitado
          + alto cortado pelo limite`, `Borda › Pendente com corte de lim
          +ite`, `Borda › Pendente consome o limite`, `Borda › Hospedagem
          + pendente gera viagem` e `Borda › Pendente fora do total reemb
          +olsável`                                                      
      400 +  - **Commit:** `<hash preenchido depois>`                    
      401 +                                                              
      402 +### 5.4 Saída e CLI da v4                                     
      403 +                                                              
      404 +- [ ] **T-066** — Saída da v4 em `src/io/saida.ts` (estende T-
          +035, R-17): bloco `politica` (`versao`, `tabela`) entre `perio
          +do` e `itens`; item com os 14 campos na ordem `id`, `data`, `c
          +ategoria`, `moeda`, `valor_original`, `taxa_cambio`, `data_cot
          +acao`, `valor_solicitado`, `valor_reembolsavel`, `status`, `li
          +mite_diario_aplicado`, `em_viagem`, `diarias`, `motivo`; `taxa
          +_cambio` via `JSON.rawJSON` do texto do arquivo (`1` em BRL); 
          +os três campos de conversão saem de `conversao` (nulos juntos)
          +; `moeda` de item `DADO_INVALIDO` sai como veio; resumo com `p
          +endentes` e `total_pendente`                                  
      405 +  - **Atende:** RN-003, RN-013, RN-014, RN-016, RN-017, AMB-02
          +3, AMB-043                                                    
      406 +  - **Aceite:** em `tests/io/saida.test.ts` passam `Infra › sa
          +ída: campos do item na ordem da seção 4 (id … diarias, motivo)
          + e politica entre periodo e itens`, `RN-017 › taxa_cambio sai 
          +com o texto do arquivo (5.90 continua 5.90) e 1 em BRL`, `RN-0
          +03 › DADO_INVALIDO: moeda sai como veio (978 → 978, ausente → 
          +null)`, `RN-016 › saída traz politica { versao: "v4", tabela }
          +` e `RN-014 › resumo traz pendentes e total_pendente com duas 
          +casas`; em `tests/contrato-saida.test.ts` voltam a passar os d
          +ois testes da T-037 e passam `RN-013 › saída do envelope (PEND
          +ENTE, CAMBIO_INDISPONIVEL, moeda estrangeira) valida contra o 
          +schema` e `RN-013 › item com taxa_cambio e valor_solicitado nu
          +lo é rejeitado pelo schema (AMB-043)`                         
      407 +  - **Commit:** `<hash preenchido depois>`                    
      408 +                                                              
      409 +- [ ] **T-067** — [P] Exemplos oficiais em `tests/exemplo.test
          +.ts` (estende T-051): lê os três arquivos da seção 9 com a tab
          +ela e o câmbio de `exemplos/envelope/`, roda `validarEntrada` 
          +→ motor → `montarSaida` e compara com as três tabelas e os trê
          +s resumos. Um `it` por despesa (moeda, original, taxa, data da
          + cotação, solicitado, reembolsável, status, código)           
      410 +  - **Atende:** RN-001, RN-004, RN-005, RN-006, RN-007, RN-008
          +, RN-009, RN-010, RN-011, RN-012, RN-013, RN-014, RN-016, RN-0
          +17, RN-018 (seção 9)                                          
      411 +  - **Aceite:** passam os `it` da T-051 e da T-052 (com `RN-01
          +4 › exemplo: resumo 1861.84 / 351.43 / 0.00 / 1510.41 · 5/2/7/
          +0` no lugar do resumo da T-051), `RN-010 › envelope e-001: rep
          +resentacao 340,00 → PARCIAL 300,00`, `RN-017 › envelope e-002:
          + EUR 22,00 × 5.93 (07-14) = 130,46 → PARCIAL 90,00`, `RN-017 ›
          + envelope e-003: EUR 14,50 × 5.88 (07-15) = 85,26 → APROVADO 8
          +5,26`, `RN-017 › envelope e-004: EUR 30,00 × 5.96 (07-17) = 17
          +8,80 → PARCIAL 90,00`, `RN-008 › envelope e-005: USD 40,00 × 5
          +.50 = 220,00 → NOTA_FISCAL_AUSENTE`, `RN-017 › envelope e-006:
          + GBP → CAMBIO_INDISPONIVEL, conversão nula`, `RN-018 › envelop
          +e e-007: PENDENTE 1.200,00, diarias 3`, `RN-011 › envelope e-0
          +08: APROVADO 95,00, em_viagem, limite 135,00`, `RN-006 › envel
          +ope e-009: coworking → CATEGORIA_NAO_REEMBOLSAVEL`, `RN-017 › 
          +envelope e-010: sem moeda → BRL, taxa 1, APROVADO 88,00`, `RN-
          +014 › envelope: resumo 2457.52 / 748.26 / 1200.00 / 509.26 · 3
          +/3/3/1`, `RN-016 › envelope: tabela aplicada CC-COMERCIAL`, `R
          +N-016 › cc-desconhecido f-001: APROVADO 58,00 (tabela padrão)`
          +, `RN-012 › cc-desconhecido f-002: PARCIAL 250,00`, `RN-006 › 
          +cc-desconhecido f-003: representacao → CATEGORIA_NAO_REEMBOLSA
          +VEL`, `RN-017 › cc-desconhecido f-004: USD 12,00 × 5.48 (07-21
          +) = 65,76 → APROVADO`, `RN-014 › cc-desconhecido: resumo 623.7
          +6 / 373.76 / 0.00 / 250.00 · 2/1/1/0`, `RN-016 › cc-desconheci
          +do: politica.tabela "padrao"` e `RN-013 › exemplos: nenhum ite
          +m com motivo ausente ou vazio nos três arquivos`              
      412 +  - **Commit:** `<hash preenchido depois>`                    
      413 +                                                              
      414 +- [ ] **T-068** — [P] CLI da v4 em `src/cli.ts` e `tests/cli.t
          +est.ts` (estende T-038, R-08, R-11): a linha de resumo no `std
          +out` inclui o total pendente quando houver; helper de teste qu
          +e copia `src/`, `dados/` e `package.json` para uma pasta tempo
          +rária e roda o CLI dessa cópia com um arquivo de `dados/` troc
          +ado ou removido                                               
      415 +  - **Atende:** RN-015, RN-016, RN-017, AMB-028, AMB-032, AMB-
          +044                                                           
      416 +  - **Aceite:** em `tests/cli.test.ts` passam `RN-015 › CLI: "
          +centro_custo": 42 → código 1, stderr cita colaborador.centro_c
          +usto, nenhum arquivo de saída`, `RN-015 › CLI: dados/cambio.js
          +on ausente (cópia temporária) → código 1, stderr cita o arquiv
          +o de câmbio, nenhum arquivo de saída`, `RN-015 › CLI: limite n
          +egativo em dados/politica.json (cópia temporária) → código 1, 
          +stderr cita a tabela de limites e o campo`, `RN-016 › CLI: pad
          +rao.hospedagem.limite 320.00 em dados/ (cópia temporária) muda
          + f-002 de PARCIAL 250,00 para APROVADO 310,00 sem mudar o códi
          +go`, `Infra › CLI: chamado de outra pasta lê o mesmo dados/`, 
          +`Infra › CLI: envelope → código 0, stdout cita o total pendent
          +e` e `Infra › CLI: duas execuções do envelope geram bytes idên
          +ticos`; os testes da T-038 e da T-039 continuam passando      
      417 +  - **Commit:** `<hash preenchido depois>`                    
      418 +                                                              
      419 +- [ ] **T-069** — Casos de borda de arquivo da v4 em `tests/ca
          +sos-de-borda.test.ts`: "Centro de custo não textual" por `vali
          +darEntrada`; "Tabela de limites inválida" e "Tabela sem versão
          +" por `lerPolitica` com o texto do arquivo; "Arquivo de câmbio
          + ausente" por `lerExternos` com um caminho inexistente **e** p
          +elo CLI numa cópia temporária (helper da T-068), conferindo qu
          +e o arquivo de saída não existe                               
      420 +  - **Atende:** RN-015, RN-016, RN-017, AMB-028, AMB-032, AMB-
          +044                                                           
      421 +  - **Aceite:** passam `Borda › Centro de custo não textual`, 
          +`Borda › Tabela de limites inválida`, `Borda › Arquivo de câmb
          +io ausente` e `Borda › Tabela sem versão`                     
      422 +  - **Commit:** `<hash preenchido depois>`                    
      423 +                                                              
      424 +- [ ] **T-070** — Fechar a rastreabilidade (estende T-041, DT-
          +005): em `tests/rastreabilidade.test.ts`, subir os mínimos par
          +a 18 RNs e 121 casos de borda; nada mais muda no teste        
      425 +  - **Atende:** RN-001, RN-002, RN-003, RN-004, RN-005, RN-006
          +, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-0
          +14, RN-015, RN-016, RN-017, RN-018 (seção 9, critérios 3 e 4) 
      426 +  - **Aceite:** passam `Infra › rastreabilidade: toda RN-NNN d
          +a spec aparece no início de um título de teste`, `Infra › rast
          +reabilidade: toda linha da seção 7 tem um teste Borda › <Caso>
          +` e `Infra › rastreabilidade: toda RN-NNN tem exatamente um ar
          +quivo rn-NNN-*.test.ts`; `npm test` inteiro verde, sem falhas 
          +conhecidas                                                    
      427 +  - **Commit:** `<hash preenchido depois>`                    
      428 +                                                              
      429 +- [ ] **T-071** — Atualizar `README.md` (estende T-042): os do
          +is arquivos em `dados/` (o que são, que simulam o serviço do f
          +inanceiro, como trocá-los e restaurá-los com `git checkout dad
          +os/`), os três exemplos da seção 9 e o apontamento para `quick
          +start.md` e `contracts/arquivos-externos.md`                  
      430 +  - **Atende:** AMB-028 (seção 9, entrega: "como rodar e como 
          +testar")                                                      
      431 +  - **Aceite:** seguir o README do zero num clone limpo reprod
          +uz as seções 1 a 6 do `quickstart.md` com o resultado esperado
      432 +  - **Commit:** `<hash preenchido depois>`                    
      433 +                                                              
      434  ---
      435  
      436  ## Cobertura

● Ajuste: T-045, T-046 e T-047 escrevem no mesmo arquivo de teste (e a T-045 usa
  o Decimal da T-044), então não podem ter [P].

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio/specs/001-motor-reembolso"
      && sed -i 's/^- \[ \] \*\*T-045\*\* — \[P\] /- [ ] **T-045** — /; s/^- \[
      \] \*\*T-046\*…)
  ⎿  Updated tasks.md (+2 -2)
      284    - **Aceite:** em `tests/nucleo/decimal.test.ts` passam `Infr
           a › decimal: "5.93" → 593 × 10^-2, "50" → 50 × 10^0 e "1.00005
           e2" → 100005 × 10^-3` e `Infra › decimal: dividirMeioParaPar 2
           5/10 → 2, 35/10 → 4, 26/10 → 3, 24/10 → 2 e -25/10 → -2`; todo
           s os `RN-001 ›` de `tests/nucleo/rn-001-arredondamento.test.ts
           ` continuam passando
      285    - **Commit:** `<hash preenchido depois>`
      286  
      287 -- [ ] **T-045** — [P] Criar `src/io/politica.ts` (R-12): `lerP
          -olitica(texto, rotulo = 'tabela de limites (dados/politica.jso
          -n)')` → `Politica` ou lança `ErroEntrada`, com a mensagem come
          -çando pelo `rotulo` e citando o caminho do campo (`centros_cus
          -to.CC-ADM.alimentacao.limite`). Valida a lista da RN-016 e a A
          -MB-044: objeto; `versao` texto não vazio; `vigencia` data váli
          -da (T-004); `moeda_base` = `"BRL"`; `padrao` e `centros_custo`
          - objetos; cada centro de custo e cada categoria objeto; `limit
          -e` número ≥ 0 exato em centavos; `periodicidade` `dia`/`diaria
          -`, com `diaria` ⇔ `hospedagem`; `nota_fiscal_obrigatoria_acima
          -_de` e `acrescimo_em_viagem_percentual` números ≥ 0 (viram `De
          -cimal`); centros de custo e categorias de uma mesma tabela sem
          - colisão depois de `normalizar` (T-007). `observacao` e campos
          - desconhecidos são ignorados. Guarda o nome do centro de custo
          - como está escrito                                            
      287 +- [ ] **T-045** — Criar `src/io/politica.ts` (R-12): `lerPolit
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
      290    - **Commit:** `<hash preenchido depois>`
      291  
      292 -- [ ] **T-046** — [P] Criar `src/io/cambio.ts` (R-12, R-14): `
          -lerCambio(texto, rotulo = 'arquivo de câmbio (dados/cambio.jso
          -n)')` → `Cambio` ou lança `ErroEntrada` (mesmo formato de mens
          -agem da T-045). Valida a lista da RN-017 e a AMB-044: objeto; 
          -`moeda_base` = `"BRL"`; `taxas` objeto; cada chave de `taxas` 
          -data válida; cada valor de data objeto; cada moeda com 3 letra
          -s; cada taxa número > 0, **inclusive** a de uma moeda repetida
          - que vai ser sobrescrita. Monta o índice `Map<Moeda, Cotacao[]
          ->` com a moeda em maiúsculas (`normalizarMoeda`, criada aqui e
          -m `src/nucleo/texto.ts`: `trim` + `toUpperCase`), datas em ord
          -em crescente e, para a mesma moeda na mesma data, a **última**
          - do arquivo. `fonte`, `observacao` e campos desconhecidos são 
          -ignorados                                                     
      292 +- [ ] **T-046** — Criar `src/io/cambio.ts` (R-12, R-14): `lerC
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
      295    - **Commit:** `<hash preenchido depois>`

● Agora a tabela de Cobertura e as notas de dependência.

  Made 1 scratchpad edit +69, read 1 file (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio/specs/001-motor-reembolso"
      && node -e "
      const fs=require('fs');…)
  ⎿  Updated tasks.md (+41 -21)
      440  
      441  | Regra da spec | Task | Teste |
      442  |---|---|---|
      443 -| RN-001 | T-006, T-026, T-033, T-035 | `RN-001 › 10.005 → 10.
          -00 (meio, 0 é par)` (+ demais `RN-001 ›`), `Borda › Arredondam
          -ento meio-para-o-par no limiar` |                             
      444 -| RN-002 | T-007, T-022, T-028 | `RN-002 › "ALIMENTACAO", " Al
          -imentação " e "alimentacao" viram alimentacao`, `RN-002 › "ALI
          -MENTACAO" e "alimentacao" na mesma data somam no mesmo limite 
          -diário` |                                                     
      445 -| RN-003 | T-007, T-008, T-009, T-010, T-011, T-017, T-029, T-
          -030, T-032, T-033, T-034, T-035, T-038 | `RN-003 › "data": "20
          -26-07-32" → DADO_INVALIDO com data "2026-07-32" no eco` (+ dem
          -ais `RN-003 ›`), `Borda › Data impossível` |                  
      446 -| RN-004 | T-012, T-017, T-022, T-028 | `RN-004 › d-009 (−45,0
          -0) → RECUSADO VALOR_NAO_POSITIVO, reembolsável 0,00`, `Borda ›
          - Estorno` |                                                   
      447 -| RN-005 | T-013, T-028, T-030 | `RN-005 › d-008 (2026-04-15, 
          -período de julho) → FORA_DO_PERIODO`, `Borda › Último dia do p
          -eríodo` |                                                     
      448 -| RN-006 | T-014, T-028 | `RN-006 › d-005 (coworking, 89,00) →
          - CATEGORIA_NAO_REEMBOLSAVEL`, `Borda › Categoria desconhecida`
          - |                                                            
      449 -| RN-007 | T-015, T-017, T-023, T-029 | `RN-007 › d-006 segue 
          -e d-007 → DUPLICATA`, `Borda › Ambas sem fornecedor` |        
      450 -| RN-008 | T-016, T-022, T-026, T-031, T-034 | `RN-008 › d-004
          - (100,01, sem NF) → NOTA_FISCAL_AUSENTE`, `Borda › Nota fiscal
          - no limiar exato` |                                           
      451 -| RN-009 | T-021, T-027 | `RN-009 › alimentação isolada de 60,
          -00 → APROVADO 60,00`, `Borda › Exatamente no limite diário` | 
      452 -| RN-010 | T-021, T-026, T-027 | `RN-010 › d-001 e d-002 em 03
          -/07: 1ª PARCIAL 60,00, 2ª ESGOTADO`, `Borda › Várias no mesmo 
          -dia` |                                                        
      453 -| RN-011 | T-020, T-022, T-031 | `RN-011 › d-013 recusada por 
          -NF não torna 22 a 24/07 dias de viagem`, `Borda › Dia do check
          --out` |                                                       
      454 -| RN-012 | T-018, T-019, T-022, T-030 | `RN-012 › h1 14/07 "2 
          -diarias" 480,00 e h2 15/07 "1 diaria" 200,00 → h1 APROVADO 480
          -,00, h2 PARCIAL 10,00`, `Borda › Divisão com centavos` |      
      455 -| RN-013 | T-023, T-035, T-036, T-037 | `RN-013 › LIMITE_DIARI
          -O_EXCEDIDO cita limite, saldo disponível e valor cortado`, `RN
          --013 › exemplo: nenhum item com motivo ausente ou vazio` |    
      456 -| RN-014 | T-024, T-032, T-036, T-040 | `RN-014 › total_solici
          -tado ignora valores não positivos e nulos`, `Borda › Lista de 
          -despesas vazia` |                                             
      457 -| RN-015 | T-025, T-038, T-040 | `RN-015 › CLI: arquivo sem pe
          -riodo → código 1, stderr cita periodo, nenhum arquivo de saída
          -`, `Borda › inicio depois de fim`, `Borda › colaborador.id vaz
          -io` |                                                         
      443 +| RN-001 | T-006, T-026, T-033, T-035, T-044, T-054, T-056, T-
          +063 | `RN-001 › 10.005 → 10.00 (meio, 0 é par)` (+ demais `RN-
          +001 ›`), `RN-017 › 0,50 USD em 16/07 × 5,41 = 2,705 → R$ 2,70 
          +(meio para o par, AMB-037)`, `Borda › Arredondamento meio-para
          +-o-par no limiar`, `Borda › Arredondamento da conversão` |    
      444 +| RN-002 | T-007, T-022, T-028, T-050, T-052, T-061 | `RN-002 
          +› "ALIMENTACAO" e "alimentacao" na mesma data somam no mesmo l
          +imite diário`, `RN-002 › "Representação" é representacao no CC
          +-COMERCIAL e sai como veio na tabela padrão` |                
      445 +| RN-003 | T-007, T-008, T-009, T-010, T-011, T-017, T-029, T-
          +030, T-032, T-033, T-034, T-035, T-038, T-055, T-056, T-062, T
          +-066 | `RN-003 › "data": "2026-07-32" → DADO_INVALIDO com data
          + "2026-07-32" no eco` (+ demais `RN-003 ›`), `RN-003 › "moeda"
          +: 978, true, [] ou {} → DADO_INVALIDO com a moeda como veio no
          + eco`, `Borda › Data impossível`, `Borda › Moeda não textual` 
          +|                                                             
      446 +| RN-004 | T-012, T-017, T-022, T-028, T-056, T-063 | `RN-004 
          +› d-009 (−45,00) → RECUSADO VALOR_NAO_POSITIVO, reembolsável 0
          +,00`, `RN-004 › −10,00 GBP (sem cotação) → VALOR_NAO_POSITIVO`
          +, `Borda › Estorno`, `Borda › Estrangeira negativa sem cotação
          +` |                                                           
      447 +| RN-005 | T-013, T-028, T-030, T-051, T-063 | `RN-005 › d-008
          + (2026-04-15, período de julho) → FORA_DO_PERIODO`, `Borda › Ú
          +ltimo dia do período`, `Borda › Estrangeira fora do período` |
      448 +| RN-006 | T-014, T-028, T-050, T-052, T-061 | `RN-006 › d-005
          + (coworking, 89,00) → CATEGORIA_NAO_REEMBOLSAVEL`, `RN-006 › h
          +ospedagem no CC-ENG-PLATAFORMA → CATEGORIA_NAO_REEMBOLSAVEL, d
          +escrição cita "CC-ENG-PLATAFORMA"`, `Borda › Categoria com lim
          +ite zero` |                                                   
      449 +| RN-007 | T-015, T-017, T-023, T-029, T-057, T-064 | `RN-007 
          +› d-006 segue e d-007 → DUPLICATA`, `RN-007 › 20,00 EUR e 20,0
          +0 USD, resto igual → as duas seguem`, `Borda › Ambas sem forne
          +cedor`, `Borda › BRL explícito e implícito` |                 
      450 +| RN-008 | T-016, T-022, T-026, T-031, T-034, T-050, T-053, T-
          +056, T-060, T-064 | `RN-008 › d-004 (100,01, sem NF) → NOTA_FI
          +SCAL_AUSENTE`, `RN-008 › e-005 (40,00 USD × 5,50 = R$ 220,00, 
          +sem NF) → NOTA_FISCAL_AUSENTE`, `Borda › Nota fiscal no limiar
          + exato`, `Borda › Nota fiscal sobre o valor convertido` |     
      451 +| RN-009 | T-021, T-027, T-050, T-051, T-053, T-061 | `RN-009 
          +› alimentação isolada de 60,00 → APROVADO 60,00`, `RN-009 › al
          +imentação 50,00 no CC-ADM → PARCIAL 45,00`, `Borda › Exatament
          +e no limite diário`, `Borda › Categoria nova no centro de cust
          +o` |                                                          
      452 +| RN-010 | T-021, T-026, T-027, T-051, T-053, T-065 | `RN-010 
          +› CC-ENG-PLATAFORMA (75,00): d-001 72,50 → APROVADO 72,50 e d-
          +002 38,00 → PARCIAL 2,50`, `Borda › Várias no mesmo dia`, `Bor
          +da › Pendente consome o limite` |                             
      453 +| RN-011 | T-020, T-022, T-031, T-050, T-052, T-053, T-058, T-
          +061, T-065 | `RN-011 › limite 60,01 ampliado em 50% → 90,02 e 
          +60,03 → 90,04 (meio para o par, AMB-033)`, `RN-011 › CC-COMERC
          +IAL: e-008 (alimentação 95,00 em 23/07, noite de e-007 PENDENT
          +E) → APROVADO 95,00 (limite 135,00)`, `Borda › Dia do check-ou
          +t`, `Borda › Hospedagem pendente gera viagem` |               
      454 +| RN-012 | T-018, T-019, T-022, T-030, T-050, T-056, T-065 | `
          +RN-012 › h1 14/07 "2 diarias" 480,00 e h2 15/07 "1 diaria" 200
          +,00 → h1 APROVADO 480,00, h2 PARCIAL 10,00`, `RN-012 › parcela
          +s em reais: 100,00 USD em 13/07 (R$ 542,00) "2 diarias" → 271,
          +00 + 271,00 → PARCIAL 500,00`, `Borda › Divisão com centavos` 
          +|                                                             
      455 +| RN-013 | T-023, T-035, T-036, T-037, T-058, T-060, T-066, T-
          +067 | `RN-013 › LIMITE_DIARIO_EXCEDIDO cita limite, saldo disp
          +onível e valor cortado`, `RN-013 › item em moeda estrangeira: 
          +descrição traz valor original × taxa, data da cotação e valor 
          +em reais`, `RN-013 › saída do envelope (PENDENTE, CAMBIO_INDIS
          +PONIVEL, moeda estrangeira) valida contra o schema` |         
      456 +| RN-014 | T-024, T-032, T-036, T-040, T-051, T-056, T-059, T-
          +063, T-065, T-066 | `RN-014 › total_nao_reembolsado = total_so
          +licitado − total_reembolsavel − total_pendente, exato em centa
          +vos`, `Borda › Lista de despesas vazia`, `Borda › Pendente for
          +a do total reembolsável` |                                    
      457 +| RN-015 | T-025, T-038, T-040, T-045, T-046, T-047, T-048, T-
          +068, T-069 | `RN-015 › tabela de limites com "limite": -10 → e
          +rro que cita a tabela de limites e o campo`, `RN-015 › CLI: da
          +dos/cambio.json ausente (cópia temporária) → código 1, stderr 
          +cita o arquivo de câmbio, nenhum arquivo de saída`, `Borda › C
          +entro de custo não textual`, `Borda › Tabela sem versão` |    
      458 +| RN-016 | T-045, T-049, T-051, T-061, T-066, T-067, T-068, T-
          +069 | `RN-016 › CC-ADM: hospedagem 1 diária 300,00 → PARCIAL 2
          +50,00`, `RN-016 › CLI: padrao.hospedagem.limite 320.00 em dado
          +s/ (cópia temporária) muda f-002 de PARCIAL 250,00 para APROVA
          +DO 310,00 sem mudar o código`, `Borda › Categoria herdada do p
          +adrão` |                                                      
      459 +| RN-017 | T-043, T-046, T-054, T-056, T-060, T-062, T-063, T-
          +066, T-067, T-069 | `RN-017 › e-004 (30,00 EUR no sábado 18/07
          +) → taxa 5.96 de 2026-07-17, R$ 178,80`, `RN-017 › e-006 (55,0
          +0 GBP) → CAMBIO_INDISPONIVEL, valor_solicitado nulo`, `Borda ›
          + Conversão no fim de semana`, `Borda › Moeda sem cotação` |   
      460 +| RN-018 | T-049, T-058, T-065, T-067 | `RN-018 › e-007 (hospe
          +dagem 1.200,00, 3 × 400,00 no CC-COMERCIAL) → PENDENTE REQUER_
          +APROVACAO, reembolsável 1.200,00`, `RN-018 › reembolsável exat
          +amente 500,00 → APROVADO, não PENDENTE`, `Borda › Reembolsável
          + acima de 500,00` |                                           
      461  | AMB-001 | T-021, T-027 | `RN-009 › categorias diferentes no 
           mesmo dia têm limites independentes`, `Borda › Mesmo dia, cate
           gorias diferentes` |
      462  | AMB-002 | T-021, T-027 | `RN-010 › d-001 e d-002 em 03/07: 1
           ª PARCIAL 60,00, 2ª ESGOTADO` |
      463  | AMB-003 | T-021 | `RN-010 › d-014 (61,00) → PARCIAL 60,00` |
     ...
      470  | AMB-010 | T-013 | `RN-005 › competencia divergente de inicio
           /fim é ignorada` |
     … 47 more lines (ctrl+o to expand)

● Bash(cd "D:/Usuario/Projetos/Dev/Apps/sdd-desafio/specs/001-motor-reembolso"
      && cat >> tasks.md <<'EOF'
      - **Fase 5 (v4, D-019 a D-021):** as tasks da v1 afetadas pel…)
  ⎿  Updated tasks.md (+14 -0)
      526    T-022 precisa de T-017 a T-021. A Fase 3 precisa de T-024. T
           -040 precisa
      527    de T-038; T-041 fecha a Fase 4 e só fica verde com todos os 
           testes de RN e
      528    de borda escritos.
      529 +- **Fase 5 (v4, D-019 a D-021):** as tasks da v1 afetadas pela
          + v4 (lista em                                                 
      530 +  D-019) continuam `[x]`, e a mudança entra numa task nova que
          + diz "estende                                                 
      531 +  T-0NN". Os títulos de `tests/exemplo.test.ts` da T-036 são s
          +ubstituídos na                                                
      532 +  T-051/T-052/T-067, porque a tabela 1 da seção 9 mudou (CC-EN
          +G-PLATAFORMA).                                                
      533 +- **Dependências da Fase 5:** T-043 → (T-044 ∥ T-048). T-044 →
          + T-045 → T-046                                                
      534 +  → T-047 (as três escrevem em `tests/io/rn-015-entrada.test.t
          +s`). T-049                                                    
      535 +  precisa de T-045 e T-048; T-050 de T-047 e T-049; depois, em
          + sequência,                                                   
      536 +  T-051 → T-052 → T-053. T-054 pode correr em paralelo com T-0
          +49 a T-053                                                    
      537 +  (só precisa de T-044 e T-046). T-055 precisa de T-050; T-056
          + precisa de                                                   
      538 +  T-051, T-054 e T-055; depois T-057 → T-058 → (T-059 ∥ T-060)
          +. A seção 5.3                                                 
      539 +  precisa de T-060. T-066 precisa de T-059; depois (T-067 ∥ T-
          +068) →                                                        
      540 +  T-069 → T-070 → T-071. A T-050 é um refactor **sem mudança d
          +e                                                             
      541 +  comportamento** e a T-051 é o único passo que muda a tabela 
          +1 da seção 9:                                                 
      542 +  por isso o centro de custo só entra no motor depois do refac
          +tor.                                                          

● Conferindo a cobertura (todo RN/AMB em algum Atende:) e o formato de cada task
  nova:

  Ran 1 shell command (ctrl+o to expand)

● Gerei o tasks.md da v4: são 29 tasks novas, de T-043 a T-071. As T-001 a T-042
  ficaram intactas, todas [x] e com os hashes de commit. Não fiz commit.

  Arquivo: specs/001-motor-reembolso/tasks.md

  Um desvio da skill: ela manda deixar a Fase 5 como placeholder. Mas o template
  diz "criar no Dia 2", e o envelope do Dia 2 já entrou na spec 2.2. Por isso
  as tasks da v4 foram para a Fase 5, divididas em 4 subseções que seguem as
  fases originais.

  ┌─────────────────────────────────────────────────────────┬─────────┬─────┐
  │                        Subseção                         │  Tasks  │ Qtd │
  ├─────────────────────────────────────────────────────────┼─────────┼─────┤
  │ 5.1 Fundação da v4 (tipos, Decimal, leitura da tabela e │ T-043 a │ 6   │
  │  do câmbio, dados/, centro_custo)                       │  T-048  │     │
  ├─────────────────────────────────────────────────────────┼─────────┼─────┤
  │ 5.2 Regras de negócio (tabela aplicável, refactor sem   │ T-049 a │     │
  │ POLITICA, limite 0, conversão, duplicata com moeda,     │  T-060  │ 12  │
  │ aprovação manual, resumo, descrições)                   │         │     │
  ├─────────────────────────────────────────────────────────┼─────────┼─────┤
  │ 5.3 Casos de borda da v4                                │ T-061 a │ 5   │
  │                                                         │  T-065  │     │
  ├─────────────────────────────────────────────────────────┼─────────┼─────┤
  │ 5.4 Saída e CLI (saída v4, os 3 exemplos da §9, CLI com │ T-066 a │     │
  │  cópia temporária de dados/, bordas de arquivo,         │  T-071  │ 6   │
  │ rastreabilidade, README)                                │         │     │
  └─────────────────────────────────────────────────────────┴─────────┴─────┘

  Cobertura:
  - Todos os 18 RN e as 44 AMB aparecem no Atende: de pelo menos uma task. Não
    ficou nenhum ID sem cobertura.
  - Os 41 casos de borda novos da seção 7 têm task: 37 na 5.3 e 4 na T-069. Com
    os 80 da v1, são 121.
  - A tabela de Cobertura agora tem uma linha para cada RN e AMB, incluindo
    RN-016 a RN-018 e AMB-028 a AMB-044.

  Tasks paralelas [P]: T-044 junto com T-048; T-054 em paralelo com T-049 a
  T-053; T-059 junto com T-060; T-067 junto com T-068. Tirei o [P] de T-045 e
  T-046, porque as duas escrevem no mesmo arquivo de teste e a T-045 depende do
  Decimal da T-044.

  Formato: conferi com um script que todas as tasks novas têm - [ ], **T-NNN**,
  Atende, Aceite com os testes pelo nome, e Commit como placeholder.

  Para você saber antes de implementar:
  - A suíte já está vermelha hoje. Falham 5 testes: os 3 de rastreabilidade,
    porque RN-016 a RN-018 e os casos de borda novos ainda não têm teste, e 2 de
    contrato-saida, porque o schema já está na v4. Registrei isso como "falha
    conhecida" nas convenções da Fase 5. Até a T-066, o critério de aceite de
    cada task é "nenhuma falha além dessas". Elas ficam verdes na T-066 e na
    T-070.
  - Ordem escolhida para cada commit ficar verde:
    - A T-050 troca POLITICA pela tabela lida de fora, sem mudar comportamento,
      usando a tabela padrão.
    - A T-051 liga o centro de custo ao motor. É o único passo que muda a tabela
      1 da §9, porque o colaborador do exemplo é do CC-ENG-PLATAFORMA.
    - Os resultados de d-010 e d-013 só ficam certos na T-052, que faz o limite
      0 recusar a categoria.
  - Tasks antigas afetadas pela v4 (lista da D-019): não reabri nenhuma. Cada
    mudança entra numa task nova que diz "estende T-0NN".

  Não existe .specify/extensions.yml, então nenhum hook rodou.

  Próximo passo sugerido: /speckit-analyze para checar spec × plan × tasks antes
  de começar pela T-043.