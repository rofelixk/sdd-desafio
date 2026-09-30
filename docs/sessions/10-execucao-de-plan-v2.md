
> /speckit-plan

  Ran 1 shell command (ctrl+o to expand)

● The plan already exists and the spec just moved to v2, so this is a plan
  update. Before running the setup script, I'll check whether it would overwrite
  the existing plan.md.

  Ran 1 shell command (ctrl+o to expand)

● Safe — the script skips the copy when a plan already exists. Running it:

  Read 4 files, ran 1 shell command (ctrl+o to expand)

● Now the supporting artifacts, the current code, and the envelope data files.

  Read 5 files, ran 1 shell command (ctrl+o to expand)

● Now the current code, so the plan reflects what exists.

  Ran 2 shell commands (ctrl+o to expand)

● I've reviewed spec 2.1, plan v1.2 (still tied to spec 1.3 and the hard-coded
  POLITICA), and the code, and found three points the spec leaves unresolved
  that would otherwise force the plan to decide them. Per the constitution, I'll
  ask about these before drafting the plan, as with D-015.

● User answered Claude's questions:
  ⎿  · No arquivo de câmbio, como tratar o código da moeda (chave dentro de cada
     data)? A spec diz que a moeda da despesa é comparada sem diferenciar
     maiúsculas, e que o arquivo é inválido se 'uma moeda não tem 3 letras', mas
     não diz nada sobre "usd" minúsculo no arquivo nem sobre "usd" e "USD" na
     mesma data. → uds casa com USD, maiuscula e minuscula é irrelevante
     · Quando valor_solicitado é nulo porque o `valor` é inválido
     (DADO_INVALIDO), mas a moeda e a data permitem achar a cotação, o que saem
     em taxa_cambio e data_cotacao? (A spec diz que taxa_cambio é 'nulo se não
     houve conversão', mas não fecha este caso.) → Tudo nulo
     · O que torna a tabela de limites ou o câmbio inválidos, além da lista
     explícita da RN-016/RN-017? A §4 diz 'que não segue estes formatos' e lista
     `versao` (texto), `vigencia` (data), `fonte`/`observacao`. → Tabela da §4
     à risca (Recomendado)

● Noted your answers: currency codes are case-insensitive in the exchange file
  (treating same-date case-variant duplicates as invalid, like RN-016's category
  collisions), the three fields are null together, and the §4 table applies
  as-is. I'll now record these as AMB-042 to 044 in spec v2.2 before updating
  the plan, per the constitution's required order.

● Update(spec.md)
  ⎿  Added 1 line, removed 1 line
      1  # Spec — Motor de Cálculo de Reembolso
      2  
      3 -**Versão:** 2.1 · **Status:** rascunho · **Última alteração:** `
        -2026-09-30`                                                     
      3 +**Versão:** 2.2 · **Status:** rascunho · **Última alteração:** `
        +2026-09-30`                                                     
      4  
      5  > **Regra de ouro deste arquivo:** ele descreve o QUÊ e o PORQUÊ
         . Nenhuma linha
      6  > aqui pode citar linguagem, biblioteca, classe, função ou estru
         tura de pasta.

● Update(spec.md)
  ⎿  Added 6 lines
      62  - Q: (revisão) `"moeda": "EURO"` ou outro texto fora do padrão 
          de 3 letras é dado inválido? → A: Não. Texto de moeda só é desc
          artado se não tiver um igual no arquivo de câmbio, e aí é `CAMB
          IO_INDISPONIVEL`, como o GBP. `DADO_INVALIDO` fica só para tipo
           que não é texto (RN-003, RN-017, AMB-036).
      63  - Q: Como um item PENDENTE aparece na saída e no resumo? → A: `
          valor_reembolsavel` mostra o valor calculado. O item consome o 
          limite do dia normalmente, mas fica **fora** do `total_reembols
          avel`. O resumo ganha `pendentes` e `total_pendente` (RN-014, R
          N-018, AMB-041).
      64  
      65 +### Session 2026-09-30 (plano da v4)                           
      66 +                                                               
      67 +- Q: No arquivo de câmbio, `"usd"` é o mesmo que `USD`? → A: Si
         +m. Maiúsculas e minúsculas são irrelevantes também no arquivo. 
         +Duas moedas iguais nessa comparação, na mesma data, tornam o ar
         +quivo inválido (RN-017, AMB-042).                              
      68 +- Q: Num item com `valor` inválido, em que a moeda e a data per
         +mitiriam achar a cotação, o que sai em `taxa_cambio` e `data_co
         +tacao`? → A: Nulo. Os três campos de conversão (`valor_solicita
         +do`, `taxa_cambio`, `data_cotacao`) saem nulos juntos, inclusiv
         +e em BRL (seção 4, AMB-043).                                   
      69 +- Q: O que torna a tabela de limites ou o câmbio inválidos além
         + das listas da RN-016 e da RN-017? → A: Todo campo das tabelas 
         +da seção 4 é obrigatório e tem o tipo declarado. Campos informa
         +tivos e campos que não estão na seção 4 são ignorados (RN-015, 
         +AMB-044).                                                      
      70 +                                                               
      71  ## 3. Fora de escopo
      72  
      73  - Não efetua pagamento nem integra com folha, ERP ou banco. Só 
          calcula.

● Update(spec.md)
  ⎿  Added 7 lines, removed 2 lines
      145  | Campo | Tipo | Significado |
      146  |---|---|---|
      147  | `moeda_base` | texto | Moeda para a qual se converte. Tem de
            ser `BRL` |
      148 -| `taxas` | objeto | Data `AAAA-MM-DD` → objeto moeda (ISO 421
          -7) → quantos reais vale 1 unidade da moeda (número > 0). Só ex
          -istem datas com cotação publicada (dias úteis) |              
      148 +| `taxas` | objeto | Data `AAAA-MM-DD` → objeto moeda (ISO 421
          +7, sem diferenciar maiúsculas, AMB-042) → quantos reais vale 1
          + unidade da moeda (número > 0). Só existem datas com cotação p
          +ublicada (dias úteis) |                                       
      149  | `fonte`, `observacao` | texto | Informativos, ignorados |
      150  
      151  Os nomes de categoria e de centro de custo da tabela são compa
           rados com a
      152  mesma normalização da RN-002. Um arquivo externo ausente, que 
           não é JSON ou
      153 -que não segue estes formatos, interrompe a execução (RN-015). 
      153 +que não segue estes formatos, interrompe a execução (RN-015). 
          +"Seguir o                                                     
      154 +formato" quer dizer: todo campo das duas tabelas acima, exceto
          + os                                                           
      155 +informativos (`observacao`, `fonte`), está presente e tem o ti
          +po declarado                                                  
      156 +(`versao` texto não vazio, `vigencia` data válida, e assim por
          + diante). Os                                                  
      157 +campos informativos e qualquer campo que não aparece nessas ta
          +belas são                                                     
      158 +ignorados (AMB-044).                                          
      159  
      160  **Saída:** definida por mim. Estrutura e significado de cada c
           ampo:
      161  

● Update(spec.md)
  ⎿  Added 2 lines, removed 2 lines
      171  | `itens[].categoria` | texto | Categoria normalizada (RN-002)
           , ou a original, como veio, se não for reconhecida |
      172  | `itens[].moeda` | texto ou nulo | Moeda normalizada da despe
           sa (`"BRL"` se ausente). Num item `DADO_INVALIDO`, sai como ve
           io (ausente → nulo) |
      173  | `itens[].valor_original` | número ou nulo | `valor` da entra
           da arredondado para centavos (RN-001), **na moeda da despesa**
           . Nulo se o `valor` é ausente ou não numérico (RN-003) |
      174 -| `itens[].taxa_cambio` | número ou nulo | Taxa usada na conve
          -rsão (RN-017), como está no arquivo de câmbio. `1` em BRL. Nul
          -o se não houve conversão |                                    
      175 -| `itens[].data_cotacao` | texto ou nulo | Data da cotação usa
          -da (a da despesa ou a última anterior, RN-017). Nulo em BRL ou
          - se não houve conversão |                                     
      174 +| `itens[].taxa_cambio` | número ou nulo | Taxa usada na conve
          +rsão (RN-017), como está no arquivo de câmbio. `1` em BRL. Nul
          +o se não houve conversão, ou seja, sempre que `valor_solicitad
          +o` é nulo (AMB-043) |                                         
      175 +| `itens[].data_cotacao` | texto ou nulo | Data da cotação usa
          +da (a da despesa ou a última anterior, RN-017). Nulo em BRL ou
          + se não houve conversão (`valor_solicitado` nulo, AMB-043) |  
      176  | `itens[].valor_solicitado` | número ou nulo | Valor solicita
           do **em reais**: `valor_original` convertido (RN-017), ou igua
           l a ele em BRL. Nulo se o `valor` é ausente ou não numérico (R
           N-003) ou se não há cotação para a moeda (RN-017) |
      177  | `itens[].valor_reembolsavel` | número | Valor a reembolsar e
           m reais, `0 ≤ valor_reembolsavel ≤ max(valor_solicitado, 0)` (
           nulo conta como 0). Num item PENDENTE, é o valor que será pago
            se o gestor aprovar |
      178  | `itens[].status` | texto | `APROVADO` (reembolsável = solici
           tado), `PARCIAL` (0 < reembolsável < solicitado), `RECUSADO` (
           reembolsável = 0) ou `PENDENTE` (reembolsável > R$ 500,00, agu
           ardando aprovação do gestor, RN-018) |

● Update(spec.md)
  ⎿  Added 8 lines
      200  (AMB-023). O `valor_solicitado` segue a RN-017 quando `valor`,
            `data` e
      201  `moeda` permitem a conversão, e é nulo nos demais casos.
      202  
      203 +Os três campos de conversão (`valor_solicitado`, `taxa_cambio`
          + e                                                            
      204 +`data_cotacao`) andam juntos em qualquer item: ou houve conver
          +são e eles saem                                               
      205 +preenchidos (`data_cotacao` continua nulo em BRL), ou não houv
          +e e os três                                                   
      206 +saem nulos. Um `valor` ausente ou não numérico anula os três, 
          +mesmo em BRL ou                                               
      207 +quando haveria cotação para a moeda e a data (AMB-043). Em BRL
          + a conversão                                                  
      208 +não precisa da data, então uma despesa BRL com `valor` numéric
          +o e `data`                                                    
      209 +inválida sai com `taxa_cambio` 1.                             
      210 +                                                              
      211  Em qualquer item, se a moeda não tem cotação até a data da des
           pesa,
      212  `valor_solicitado`, `taxa_cambio` e `data_cotacao` saem nulos,
            mesmo que o
      213  item tenha sido recusado por uma etapa anterior à de câmbio (p
           or exemplo,

● Update(spec.md)
  ⎿  Added 8 lines, removed 3 lines
      681  reembolsável...) mantém o motivo dessa etapa (AMB-039). Todos 
           os limites e o
      682  limiar de nota fiscal são comparados com o valor em reais.
      683  
      684 +O código de moeda do arquivo é comparado com a moeda da despes
          +a sem                                                         
      685 +diferenciar maiúsculas de minúsculas: `"usd"` no arquivo é `US
          +D` (AMB-042).                                                 
      686 +                                                              
      687  O arquivo de câmbio é **inválido** (RN-015) quando: não é um o
           bjeto;
      688  `moeda_base` não é `BRL`; `taxas` não é objeto; uma chave de `
           taxas` não é
      686 -uma data válida; uma moeda não tem 3 letras; uma taxa não é nú
          -mero ou não é                                                 
      687 -maior que zero.                                               
      688 -**Origem:** política do RH v4, item B (AMB-035, AMB-036, AMB-0
          -37, AMB-038, AMB-039)                                         
      689 +uma data válida; o valor de uma data não é objeto; uma moeda n
          +ão tem 3                                                      
      690 +letras; duas moedas da mesma data ficam iguais sem diferenciar
          + maiúsculas                                                   
      691 +(`"usd"` e `"USD"`); uma taxa não é número ou não é maior que 
          +zero; ou falta                                                
      692 +um campo da seção 4 (AMB-044).                                
      693 +**Origem:** política do RH v4, item B (AMB-035, AMB-036, AMB-0
          +37, AMB-038, AMB-039, AMB-042, AMB-043, AMB-044)              
      694  **Aceite:** `e-002` (22,00 EUR em 14/07) → taxa 5,93 de 14/07 
           → R$ 130,46.
      695  `e-004` (30,00 EUR no sábado 18/07) → taxa 5,96 de sexta 17/07
            →
      696  `data_cotacao` "2026-07-17", R$ 178,80. `e-006` (55,00 GBP) →

● Update(spec.md)
  ⎿  Added 4 lines, removed 2 lines
      645  `hospedagem` não é `diaria`; `nota_fiscal_obrigatoria_acima_de
           ` ou
      646  `acrescimo_em_viagem_percentual` estão ausentes, não são númer
           os ou são
      647  negativos; dois centros de custo (ou duas categorias da mesma 
           tabela) ficam
      648 -iguais depois da normalização.                                
      649 -**Origem:** política do RH v4, item A (AMB-028, AMB-029, AMB-0
          -30, AMB-031, AMB-032, AMB-034)                                
      648 +iguais depois da normalização; ou falta um campo da seção 4, o
          +u ele tem outro                                               
      649 +tipo (`versao` que não é texto preenchido, `vigencia` que não 
          +é data válida,                                                
      650 +um centro de custo ou uma categoria que não é objeto) (AMB-044
          +).                                                            
      651 +**Origem:** política do RH v4, item A (AMB-028, AMB-029, AMB-0
          +30, AMB-031, AMB-032, AMB-034, AMB-044)                       
      652  **Aceite:** colaborador do `CC-SUPORTE-N2` (sem entrada) → `po
           litica.tabela`
      653  `"padrao"`, alimentação limitada a 60,00. `" cc-comercial "` →
            tabela do
      654  CC-COMERCIAL. Colaborador sem `centro_custo` → padrão. Hospeda
           gem de 300,00

● Update(spec.md)
  ⎿  Added 47 lines
      1345  execuções (seção 3).
      1346  **Regra afetada:** RN-011, RN-014, RN-018
      1347  
      1348 +### AMB-042 — Grafia da moeda no arquivo de câmbio           
      1349 +                                                             
      1350 +**Texto original do RH (v4):** "A entrada agora pode trazer u
           +m campo `moeda`                                              
      1351 +(ISO 4217)." O arquivo de câmbio traz `"USD"` e `"EUR"`.     
      1352 +**O que não está claro:** a moeda da despesa é comparada sem 
           +diferenciar                                                  
      1353 +maiúsculas (AMB-036), mas nada se diz sobre o arquivo. `"usd"
           +` no arquivo casa                                            
      1354 +com `USD`? E `"usd"` e `"USD"` na mesma data?                
      1355 +**Decisão:** maiúsculas e minúsculas são irrelevantes também 
           +no arquivo:                                                  
      1356 +`"usd"` é `USD`. Duas moedas da mesma data que ficam iguais n
           +essa comparação                                              
      1357 +tornam o arquivo inválido (RN-015).                          
      1358 +**Justificativa:** decisão do usuário: "maiúscula e minúscula
           + é irrelevante".                                             
      1359 +A invalidez da colisão foi complemento do Claude, pela mesma 
           +razão das                                                    
      1360 +categorias repetidas da RN-016: duas taxas para a mesma moeda
           + e a mesma data                                              
      1361 +não têm leitura única.                                       
      1362 +**Regra afetada:** RN-015, RN-017                            
      1363 +                                                             
      1364 +### AMB-043 — Campos de conversão num item sem valor válido  
      1365 +                                                             
      1366 +**Texto original do RH (v4):** a política não fala do assunto
           +.                                                            
      1367 +**O que não está claro:** num item com `valor` ausente ou não
           + numérico                                                    
      1368 +(`DADO_INVALIDO`), a moeda e a data podem permitir achar a co
           +tação. Saem                                                  
      1369 +(a) a taxa e a data da cotação, com só o `valor_solicitado` n
           +ulo, ou (b) os                                               
      1370 +três nulos?                                                  
      1371 +**Decisão:** (b). `valor_solicitado`, `taxa_cambio` e `data_c
           +otacao` saem                                                 
      1372 +nulos juntos sempre que não houve conversão, inclusive em BRL
           +.                                                            
      1373 +**Justificativa:** decisão do usuário. Sem valor não há conve
           +rsão, e mostrar                                              
      1374 +uma taxa usada numa conta que não aconteceu daria a entender 
           +que ela                                                      
      1375 +aconteceu.                                                   
      1376 +**Regra afetada:** seção 4, RN-017                           
      1377 +                                                             
      1378 +### AMB-044 — O que é "não seguir o formato" dos arquivos ext
           +ernos                                                        
      1379 +                                                             
      1380 +**Texto original do RH (v4):** a política não fala do assunto
           +.                                                            
      1381 +**O que não está claro:** a RN-016 e a RN-017 listam os casos
           + de arquivo                                                  
      1382 +inválido, mas a seção 4 também declara campos que essas lista
           +s não citam                                                  
      1383 +(`versao`, `vigencia`). Um `versao` ausente ou uma `vigencia`
           + que não é data                                              
      1384 +invalidam o arquivo? E um campo que a seção 4 não conhece?   
      1385 +**Decisão:** todo campo das tabelas da seção 4 é obrigatório 
           +e tem o tipo                                                 
      1386 +declarado. Os campos informativos (`observacao`, `fonte`) e o
           +s campos que a                                               
      1387 +seção 4 não conhece são ignorados.                           
      1388 +**Justificativa:** decisão do usuário. Um arquivo que só pare
           +ce certo pode                                                
      1389 +esconder um erro do financeiro (uma `vigencia` digitada errad
           +o indica que a                                               
      1390 +tabela inteira pode estar errada), e o erro deve aparecer, nã
           +o passar em                                                  
      1391 +silêncio. Ignorar campos desconhecidos deixa o financeiro acr
           +escentar                                                     
      1392 +anotações sem quebrar o motor.                               
      1393 +**Regra afetada:** RN-015, RN-016, RN-017                    
      1394 +                                                             
      1395  ---
      1396  
      1397  ## 7. Casos de borda

● Update(spec.md)
  ⎿  Added 5 lines
      1491  | Representação em dia de viagem | CC-COMERCIAL, hospedagem e
            legível + `representacao` 420,00 com NF, mesma data | limite 
            450,00 → APROVADO 420,00 | RN-011 |
      1492  | Tabela de limites inválida | limite negativo na tabela | er
            ro que cita a tabela de limites, nenhuma saída gerada | RN-01
            5, RN-016 |
      1493  | Arquivo de câmbio ausente | — | erro que cita o arquivo de 
            câmbio, nenhuma saída gerada | RN-015, RN-017 |
      1494 +| Tabela sem versão | tabela de limites sem `versao` | erro q
           +ue cita a tabela de limites e `versao`, nenhuma saída gerada 
           +| RN-015, RN-016 |                                           
      1495 +| Moeda repetida no câmbio | `"usd"` e `"USD"` na mesma data 
           +| erro que cita o arquivo de câmbio, nenhuma saída gerada | R
           +N-015, RN-017 |                                              
      1496 +| Moeda minúscula no câmbio | arquivo com `"eur"`; despesa 10
           +,00 `"EUR"` em data com cotação | convertida normalmente pela
           + taxa de `"eur"` | RN-017 |                                  
      1497 +| Valor inválido em moeda estrangeira | `"valor": "R$ 45,00"`
           +, `"moeda": "EUR"`, data com cotação | RECUSADO `DADO_INVALID
           +O`; `valor_solicitado`, `taxa_cambio` e `data_cotacao` nulos 
           +| RN-003, RN-017 |                                           
      1498 +| Valor inválido em BRL | `"valor": true`, sem `moeda` | RECU
           +SADO `DADO_INVALIDO`; `taxa_cambio` nulo (não 1) | RN-003, RN
           +-017 |                                                       
      1499  | Moeda ausente | sem `moeda`, 45,00 | BRL, `taxa_cambio` 1, 
            `valor_solicitado` 45,00 | RN-003, RN-017 |
      1500  | Moeda nula ou vazia | `"moeda": null` / `""` | vale BRL | R
            N-003 |
      1501  | Moeda em minúsculas | `"moeda": " eur "` | tratada como EUR
             | RN-003, RN-017 |

● Now the DECISIONS entry (D-021):

● Update(DECISIONS.md)
  ⎿  Added 43 lines
      17  
      18  ---
      19  
      20 +## D-021 — Lacunas achadas no `/speckit-plan` da v4 (AMB-042, A
         +MB-043, AMB-044) · `2026-09-30`                                
      21 +                                                               
      22 +**Gatilho:** `/speckit-plan` sobre a spec 2.1. Ao desenhar a le
         +itura dos                                                      
      23 +arquivos externos e os campos de conversão da saída, o Claude e
         +ncontrou três                                                  
      24 +pontos que o plano teria de decidir sozinho. Parou e perguntou 
         +antes de                                                       
      25 +escrever o plano, como na D-015.                               
      26 +                                                               
      27 +**O que mudou na spec (versão 2.1 → 2.2):**                    
      28 +- RN-017 e seção 4 (`taxas`): o código de moeda do arquivo de c
         +âmbio é                                                        
      29 +  comparado sem diferenciar maiúsculas. Duas moedas iguais ness
         +a comparação,                                                  
      30 +  na mesma data, invalidam o arquivo. O valor de uma data que n
         +ão é objeto                                                    
      31 +  também invalida.                                             
      32 +- Seção 4 (`taxa_cambio`, `data_cotacao` e o parágrafo sobre it
         +ens                                                            
      33 +  `DADO_INVALIDO`): os três campos de conversão saem nulos junt
         +os quando não                                                  
      34 +  houve conversão, inclusive em BRL com `valor` inválido.      
      35 +- Seção 4 (arquivos externos), RN-016 e RN-017: "seguir o forma
         +to" quer dizer                                                 
      36 +  que todo campo não informativo das tabelas da seção 4 está pr
         +esente e tem o                                                 
      37 +  tipo declarado. Campos informativos e desconhecidos são ignor
         +ados.                                                          
      38 +- Novas AMB-042, AMB-043 e AMB-044. Cinco casos de borda novos:
         + "Tabela sem                                                   
      39 +  versão", "Moeda repetida no câmbio", "Moeda minúscula no câmb
         +io", "Valor                                                    
      40 +  inválido em moeda estrangeira" e "Valor inválido em BRL".    
      41 +- Três entradas em `Clarifications`.                           
      42 +                                                               
      43 +**Como se chegou lá:** o Claude recomendou (a) na AMB-043 (a co
         +tação sai mesmo                                                
      44 +sem valor). O usuário escolheu (b), os três nulos. Na AMB-042 o
         + usuário                                                       
      45 +respondeu "`usd` casa com `USD`, maiúscula e minúscula é irrele
         +vante". A                                                      
      46 +invalidez de `"usd"` e `"USD"` na mesma data foi complemento do
         + Claude, pelo                                                  
      47 +mesmo critério das categorias repetidas da RN-016, e fica para 
         +confirmação. Na                                                
      48 +AMB-044 o usuário aceitou a recomendação.                      
      49 +                                                               
      50 +**Por quê:** ver AMB-042 a AMB-044.                            
      51 +                                                               
      52 +**O que isso invalidou:** nada implementado da v4. A leitura "`
         +taxa_cambio` 1                                                 
      53 +em todo item BRL", que só existia no rascunho do plano, não val
         +e num item com                                                 
      54 +`valor` inválido.                                              
      55 +                                                               
      56 +**Tasks afetadas:** nenhuma concluída. Entram nas tasks novas d
         +a v4 (leitura                                                  
      57 +dos arquivos externos, conversão e saída), ainda não geradas.  
      58 +                                                               
      59 +**Custo:** `spec.md` (9 trechos) e `DECISIONS.md`.             
      60 +                                                               
      61 +---                                                            
      62 +                                                               
      63  ## D-020 — Revisão das ambiguidades da v4 decididas pelo Claude
           (AMB-036) · `2026-09-30`
      64  
      65  **Gatilho:** revisão pelo usuário dos pontos que o Claude propô
          s sozinho na

  Searched for 1 pattern, ran 1 shell command (ctrl+o to expand)

● Spec 2.2 and D-021 are recorded. Next, the Phase 0 research: R-01 to R-10
  stay, and R-11 to R-17 are new for the v4.

  Ran 1 shell command (ctrl+o to expand)
● Write(research.md)
  ⎿  Added 169 lines, removed 2 lines
       1  # Research — Motor de Cálculo de Reembolso
       2  
       3 -**Fase 0 do `/speckit-plan`** · Base: `spec.md` v1.1 · Data: 20
         -26-09-29                                                       
       3 +**Fase 0 do `/speckit-plan`** · Base: `spec.md` v2.2 · Data: 20
         +26-09-30                                                       
       4  
       5  Cada item fecha uma incógnita técnica do `plan.md`. Nenhum item
           cria regra de
       6  negócio. Os pontos em que o plano esbarrou numa lacuna de regra
           foram levados
       7 -à spec antes (D-015).                                          
       7 +à spec antes: D-015 (v1) e D-021 (v4: AMB-042, AMB-043, AMB-044
         +).                                                             
       8  
       9 +R-01 a R-10 são da v1 e continuam valendo, com os ajustes marca
         +dos                                                            
      10 +**(v4)**. R-11 a R-17 são novos, para a Política v4 (D-019).   
      11 +                                                               
      12  Ambiente verificado na máquina: Node 24.20, npm, vitest 5.0.2 e
      13  typescript 7.0.2 disponíveis no registry.
      14  
     ...
      41    2^53 centavos, e o limite precisaria virar regra);
      42    `decimal.js`/`big.js` (dependência para operações que se resu
          mem a inteiros);
      43    `number` em reais (é o bug que a constituição proíbe).
      44 +- **(v4)** Taxa de câmbio e percentual de viagem não são dinhei
         +ro e não cabem                                                 
      45 +  em centavos. Eles usam o `Decimal` exato da R-13, e o resulta
         +do de cada                                                     
      46 +  conta volta a ser `Centavos`.                                
      47  
      48  ## R-03 — Ler o `valor` sem passar por float
      49  
     ...
      63  - **Alternativas descartadas:** parser de JSON próprio (mais có
          digo a
      64    testar); `lossless-json` (dependência para algo que o runtime
           já faz);
      65    `toFixed`/`Math.round` em float (erra os pontos médios).
      66 +- **(v4)** A tabela de limites e o arquivo de câmbio passam pel
         +o mesmo                                                        
      67 +  `lerJson`. Assim `limite: 60.00`, `taxa: 5.93` e o percentual
         + chegam como                                                   
      68 +  texto exato, e a `taxa_cambio` pode sair "como está no arquiv
         +o" (seção 4).                                                  
      69  
      70  ## R-04 — Emitir valores com duas casas
      71  
     ...
      78  - **Alternativas descartadas:** converter para `number` (sai `4
          5` em vez de
      79    `45.00`, e há risco de float); emitir texto `"45.00"` (quebra
           o tipo
      80    "número" do schema).
      81 +- **(v4)** `taxa_cambio` é emitida com `JSON.rawJSON` do texto 
         +original do                                                    
      82 +  arquivo de câmbio (`5.93` sai `5.93`), e o `1` do BRL sai com
         +o `1`.                                                         
      83  
      84  ## R-05 — Datas
      85  
     ...
       93  - **Alternativas descartadas:** `new Date('2026-02-30')`, que 
           aceita e
       94    "corrige" datas impossíveis; `date-fns`/`dayjs` (dependência
           );
       95    `Temporal` (ainda não vem sem flag no Node 24).
       96 +- **(v4)** A busca da cotação (R-14) usa a mesma comparação de
          + texto: "a data                                               
       97 +  mais recente ≤ D" é o maior texto ≤ D.                      
       98  
       99  ## R-06 — Normalização de texto (RN-002, RN-007, AMB-024)
      100  
     ...
      106  - **Justificativa:** uma função para uma regra. A diferença do
            fornecedor é
      107    deliberada e está nomeada no código (`normalizarFornecedor`)
           , para que
      108    ninguém "unifique" as duas por engano.
      109 +- **(v4)** `normalizar` também compara o `centro_custo` com as
          + chaves de                                                    
      110 +  `centros_custo` e as categorias com as chaves de cada tabela
          + (RN-016,                                                     
      111 +  AMB-032). A moeda tem a sua função, `normalizarMoeda` (`trim
          +` +                                                           
      112 +  `toUpperCase`), usada nos dois lados: na despesa (AMB-036) e
          + nas chaves do                                                
      113 +  arquivo de câmbio (AMB-042). Maiúsculas deixam a moeda na gr
          +afia ISO para a                                               
      114 +  saída (`" eur "` → `"EUR"`).                                
      115  
      116  ## R-07 — Extração de diárias (RN-012)
      117  
     ...
      135    basta.
      136  - **Alternativas descartadas:** `commander`/`yargs` (dependênc
           ia para
      137    um subcomando só).
      138 +- **(v4)** A interface não muda (AMB-028). Tabela de limites o
          +u câmbio                                                      
      139 +  ausente ou inválido também é código `1` (RN-015).           
      140  
      141  ## R-09 — Validação da entrada
      142  
     ...
      148    `false` e o `id` repetido é normalizado. Traduzir erros de s
           chema para
      149    essas regras daria mais código que escrevê-las diretamente.
      150  - **Alternativas descartadas:** `zod`/`ajv` na entrada.
      151 +- **(v4)** Os arquivos externos seguem a mesma linha (R-12).  
      152  
      153  ## R-10 — Testes e rastreabilidade
      154  
     ...
      163    suíte falhar.
      164  - **Validação do schema de saída:** `ajv` como devDependency, 
           só nos testes
      165    de contrato (`contracts/saida.schema.json`).
      166 +- **(v4)** Os testes do núcleo recebem a tabela e o câmbio de 
      167 +  `exemplos/envelope/` (fixture explícita), **nunca** de `dado
          +s/`. Assim,                                                   
      168 +  trocar os arquivos do local fixo (R-11) não quebra os testes
          + de regra. Os                                                 
      169 +  casos de borda antigos continuam iguais, porque a spec diz q
          +ue eles usam a                                                
      170 +  tabela padrão e BRL (RN-009), e o padrão da v4 tem os mesmos
          + valores da v3.                                               
      171 +                                                              
      172 +---                                                           
      173 +                                                              
      174 +## R-11 — Local fixo da tabela de limites e do câmbio (AMB-028
          +)                                                             
      175 +                                                              
      176 +- **Decisão:** `dados/politica.json` e `dados/cambio.json` na 
          +raiz do                                                       
      177 +  repositório, resolvidos **a partir do código**              
      178 +  (`import.meta.dirname` de `src/io/externos.ts` → `../../dado
          +s/`), e não do                                                
      179 +  diretório de trabalho. Os dois começam como cópias de       
      180 +  `exemplos/envelope/politica-v4.json` e `exemplos/envelope/ca
          +mbio.json`.                                                   
      181 +- **Justificativa:** "local fixo" tem de ser o mesmo qualquer 
          +que seja a pasta                                              
      182 +  de onde o comando é chamado. Resolver pelo código faz isso s
          +em configuração.                                              
      183 +  Uma pasta `dados/` separada de `exemplos/` deixa claro que é
          + o "serviço do                                                
      184 +  financeiro" (AMB-028), e trocá-la não altera os exemplos da 
          +§9.                                                           
      185 +- **Alternativas descartadas:** caminho relativo ao diretório 
          +de trabalho                                                   
      186 +  (quebra quando o comando roda de outra pasta); variável de a
          +mbiente ou opção                                              
      187 +  de linha de comando (seria uma segunda interface, e a AMB-02
          +8 fixa o local);                                              
      188 +  apontar direto para `exemplos/envelope/` (trocar a política 
          +para um teste                                                 
      189 +  alteraria o exemplo oficial).                               
      190 +- **Consequência para os testes:** o teste de CLI que precisa 
          +de outra tabela                                               
      191 +  (critério da §9 "mudar um limite muda o resultado sem mudar 
          +o sistema",                                                   
      192 +  arquivo de câmbio ausente, tabela inválida) copia `src/`, `d
          +ados/` e                                                      
      193 +  `package.json` para uma pasta temporária, troca o arquivo lá
          + e roda o CLI                                                 
      194 +  dessa cópia. É exatamente o procedimento que o README ensina
          +.                                                             
      195 +                                                              
      196 +## R-12 — Leitura e validação dos arquivos externos (RN-015, R
          +N-016, RN-017, AMB-044)                                       
      197 +                                                              
      198 +- **Decisão:** validação escrita à mão, como na R-09, em      
      199 +  `src/io/politica.ts` e `src/io/cambio.ts`. Cada um recebe o 
          +texto do                                                      
      200 +  arquivo e devolve um valor tipado (`Politica`, `Cambio`) ou 
          +lança                                                         
      201 +  `ErroEntrada`. A mensagem cita **qual arquivo** (`tabela de 
          +limites                                                       
      202 +  (dados/politica.json)` ou `arquivo de câmbio (dados/cambio.j
          +son)`) e o                                                    
      203 +  **caminho do campo** (`centros_custo.CC-ADM.alimentacao.limi
          +te`). Para no                                                 
      204 +  primeiro erro, como a RN-015 já faz com a entrada.          
      205 +- **Ordem de leitura:** entrada → tabela de limites → câmbio. 
          +Com mais de um                                                
      206 +  arquivo inválido, a mensagem é sempre a do primeiro, e o res
          +ultado é                                                      
      207 +  determinístico.                                             
      208 +- **O que é validado:** as listas da RN-016 e da RN-017 mais o
          + critério da                                                  
      209 +  AMB-044 (todo campo não informativo da §4 presente e com o t
          +ipo declarado).                                               
      210 +  Campos desconhecidos e `observacao`/`fonte` não são lidos.  
      211 +- **Justificativa:** as regras são específicas (periodicidade 
          +amarrada a                                                    
      212 +  `hospedagem`, colisões depois da normalização, até 2 casas n
          +o limite) e a                                                 
      213 +  mensagem precisa citar o arquivo e o campo. Um JSON Schema d
          +aria mensagens                                                
      214 +  genéricas e ainda precisaria de código para as colisões.    
      215 +- **Alternativas descartadas:** `ajv` em runtime (primeira dep
          +endência de                                                   
      216 +  runtime do projeto, e as colisões ficariam fora do schema). 
      217 +                                                              
      218 +## R-13 — Aritmética exata de taxa, percentual e limiares (RN-
          +001, RN-008, RN-011, RN-017)                                  
      219 +                                                              
      220 +- **Problema:** a conversão (`valor_original × 5.93`), a ampli
          +ação de viagem                                                
      221 +  (`limite × (1 + p/100)`, com `p` vindo do arquivo) e a compa
          +ração com o                                                   
      222 +  limiar de nota fiscal usam números do arquivo que não são ce
          +ntavos. Qualquer                                              
      223 +  float aqui volta ao bug da R-03.                            
      224 +- **Decisão:** um tipo `Decimal = { digitos: bigint; escala: n
          +umber }`                                                      
      225 +  (valor = `digitos × 10^−escala`), criado a partir do texto d
          +e um                                                          
      226 +  `NumeroJson` com o mesmo leitor de `dinheiro.ts` (sinal, díg
          +itos, ponto,                                                  
      227 +  expoente). Uma única função `dividirMeioParaPar(numerador, d
          +enominador)`                                                  
      228 +  faz todo arredondamento, e `paraCentavos` passa a usá-la. Co
          +m ela:                                                        
      229 +  - **conversão** (RN-017, AMB-037): `centavos × taxa.digitos 
          +/                                                             
      230 +    10^taxa.escala`, meio para o par;                         
      231 +  - **limite ampliado** (RN-011, AMB-033): `limite × (100 + p)
          + / 100`, meio                                                 
      232 +    para o par, com `p` exato;                                
      233 +  - **limiar de nota fiscal** (RN-008): comparação exata, sem 
          +arredondar                                                    
      234 +    (`valor > limiar`), porque "estritamente maior" não precis
          +a de                                                          
      235 +    arredondamento;                                           
      236 +  - **limite da tabela** (RN-016): aceito só se for exato em c
          +entavos (até                                                  
      237 +    2 casas depois de tirar zeros à direita), e aí vira `Centa
          +vos`.                                                         
      238 +- **Justificativa:** uma função de arredondamento para todo o 
          +sistema                                                       
      239 +  (AMB-037: "evita dois critérios de arredondamento"). O `bigi
          +nt` já está no                                                
      240 +  projeto, e não há dependência nova.                         
      241 +- **Alternativas descartadas:** guardar a taxa em "centésimos 
          +de centavo"                                                   
      242 +  (impõe uma precisão máxima que a spec não tem); `decimal.js`
          + (dependência                                                 
      243 +  para duas contas).                                          
      244 +- **Efeito na v1:** o `throw` de `limites.ts` para limite ampl
          +iado inexato                                                  
      245 +  (risco da v1) some, porque a AMB-033 agora define o arredond
          +amento.                                                       
      246 +                                                              
      247 +## R-14 — Busca da cotação (RN-017, AMB-035, AMB-042)         
      248 +                                                              
      249 +- **Decisão:** na leitura, o câmbio vira um índice            
      250 +  `Map<moeda, { data, taxa }[]>`, com a moeda em maiúsculas (R
          +-06) e as datas                                               
      251 +  em ordem crescente. Para uma despesa (moeda M, data D), a co
          +tação é o último                                              
      252 +  elemento com `data ≤ D` (busca binária; a comparação é de te
          +xto, R-05). Sem                                               
      253 +  elemento, não há cotação (`CAMBIO_INDISPONIVEL`).           
      254 +- **Justificativa:** o índice é montado uma vez por execução, 
          +e a busca não                                                 
      255 +  depende da ordem das chaves no arquivo. Uma colisão `"usd"`/
          +`"USD"` na mesma                                              
      256 +  data é detectada ao montar o índice (AMB-042).              
      257 +- **Alternativas descartadas:** andar para trás dia a dia a pa
          +rtir de D (sem                                                
      258 +  limite de dias, AMB-035, isso não tem fim garantido para uma
          + moeda                                                        
      259 +  desconhecida).                                              
      260 +                                                              
      261 +## R-15 — Tabela aplicável e categorias dinâmicas (RN-002, RN-
          +006, RN-016)                                                  
      262 +                                                              
      263 +- **Decisão:** as categorias deixam de ser um tipo fechado (`'
          +alimentacao' |                                                
      264 +  ...`) e passam a ser o texto normalizado. Uma vez por execuç
          +ão, o núcleo                                                  
      265 +  monta a `TabelaAplicavel` (RN-016): `Map<categoria, RegraCat
          +egoria>` com                                                  
      266 +  `limite`, `periodicidade` e a origem (`centro_custo` ou `pad
          +rao`), mais o                                                 
      267 +  nome da tabela para `politica.tabela`. Categoria reconhecida
          + (RN-002) =                                                   
      268 +  chave da tabela aplicável. Reembolsável (RN-006) = limite > 
          +0.                                                            
      269 +- **Comportamento de hospedagem por periodicidade:** a divisão
          + em noites                                                    
      270 +  (RN-012) e os dias de viagem (RN-011) disparam por `periodic
          +idade ===                                                     
      271 +  'diaria'`, e a ampliação (RN-011) por `periodicidade === 'di
          +a'`. A                                                        
      272 +  validação da tabela (RN-016) garante que `diaria` ⇔ `hospeda
          +gem`, então o                                                 
      273 +  resultado é o mesmo, sem o texto `'hospedagem'` espalhado no
          + núcleo.                                                      
      274 +- **Nomes nas descrições:** `motivos.ts` mantém um mapa só de 
          +apresentação                                                  
      275 +  (`alimentacao` → "alimentação", `representacao` → "represent
          +ação"), que                                                   
      276 +  **volta para a própria chave** se a categoria não está nele.
          + Uma categoria                                                
      277 +  nova no arquivo funciona sem mudar o código. Só o texto da d
          +escrição                                                      
      278 +  (orientativo, §4) fica sem acento.                          
      279 +- **Alternativas descartadas:** manter o tipo fechado e acresc
          +entar                                                         
      280 +  `representacao` (a v4 diz que a tabela muda sem aviso, então
          + uma categoria                                                
      281 +  nova quebraria o sistema).                                  
      282 +                                                              
      283 +## R-16 — Status PENDENTE e o limiar fixo de R$ 500 (RN-018, A
          +MB-040, AMB-041)                                              
      284 +                                                              
      285 +- **Decisão:** o status continua **derivado** dos valores (v1,
          + data-model                                                   
      286 +  §4), com uma regra a mais antes das outras: `reembolsável > 
          +LIMIAR_APROVACAO`                                             
      287 +  → `PENDENTE`. `LIMIAR_APROVACAO = 500_00n` fica em `src/nucl
          +eo/politica.ts`,                                              
      288 +  que passa a ter só esse número: é o único valor de política 
          +que a spec fixa                                               
      289 +  (AMB-040), e a convenção do `CLAUDE.md` ("números mágicos de
          + política só em                                               
      290 +  `politica.ts`") continua valendo. A etapa 11 do `motor.ts` s
          +ó troca o                                                     
      291 +  motivo (`REQUER_APROVACAO`, com o corte de limite na descriç
          +ão) e não                                                     
      292 +  mexe em nenhum valor, então saldo e dias de viagem já estão 
          +certos.                                                       
      293 +- **Justificativa:** status derivado não pode contradizer os v
          +alores, e o                                                   
      294 +  resumo (RN-014) continua saindo de `statusDe`.              
      295 +- **Alternativas descartadas:** guardar o status no item (dois
          + lugares para                                                 
      296 +  a mesma informação); ler o limiar da tabela (a tabela não o 
          +traz, AMB-040).                                               
      297 +                                                              
      298 +## R-17 — Saída v4 (seção 4, AMB-043)                         
      299 +                                                              
      300 +- **Decisão:** a ordem dos campos de cada item segue o exemplo
          + da §4 (`id`,                                                 
      301 +  `data`, `categoria`, `moeda`, `valor_original`, `taxa_cambio
          +`,                                                            
      302 +  `data_cotacao`, `valor_solicitado`, `valor_reembolsavel`, `s
          +tatus`,                                                       
      303 +  `limite_diario_aplicado`, `em_viagem`, `diarias`, `motivo`).
          + No núcleo, os                                                
      304 +  três campos de conversão ficam num só valor `Conversao | nul
          +l`: ou o item                                                 
      305 +  tem os três, ou nenhum. É a AMB-043 garantida pelo tipo.    
      306 +- **Justificativa:** JSON não dá significado à ordem, mas segu
          +ir o exemplo                                                  
      307 +  facilita comparar à mão. Um só `Conversao | null` impede, em
          + tempo de                                                     
      308 +  compilação, um item com taxa e sem valor em reais.          
      309 +- **`contracts/saida.schema.json`** é atualizado para a spec 2
          +.2 (campos                                                    
      310 +  novos, `PENDENTE`, códigos novos, bloco `politica`, resumo n
          +ovo).                                                         

● Phase 1: data model.

● Write(data-model.md)
  ⎿  Added 126 lines, removed 47 lines
       1  # Modelo de dados — Motor de Cálculo de Reembolso
       2  
       3 -**Fase 1 do `/speckit-plan`** · Base: `spec.md` v1.3           
       3 +**Fase 1 do `/speckit-plan`** · Base: `spec.md` v2.2           
       4  
       5  Estruturas internas do núcleo. Os tipos são TypeScript, mas as 
          regras de
       6  validação são só **referências** à spec. Nenhuma regra nova nas
          ce aqui.
       7  
       8  Convenções: `Centavos = bigint` (R-02). `DataISO` = texto `AAAA
          -MM-DD` já
       9 -validado (R-05). `Categoria = 'alimentacao' | 'transporte_urban
         -o' | 'hospedagem'`.                                            
       9 +validado (R-05). `Categoria` = texto normalizado (RN-002, R-15)
         +, **não** mais                                                 
      10 +uma união fechada. `Moeda` = texto em maiúsculas, sem espaços n
         +as bordas                                                      
      11 +(R-06). `Decimal = { digitos: bigint; escala: number }`, número
         + exato do                                                      
      12 +arquivo (R-13).                                                
      13  
      14  ---
      15  
     ...
      18  ### `NumeroJson`
      19  Número como apareceu no arquivo: `{ texto: string }`, por exemp
          lo
      20  `{ texto: "33.333" }`. É criado pelo leitor de JSON (R-03) e é 
          o único jeito
      18 -de um número chegar ao núcleo.                                 
      21 +de um número chegar ao núcleo, inclusive vindo da tabela de lim
         +ites e do                                                      
      22 +câmbio.                                                        
      23  
      24  ### `Entrada` (arquivo válido, RN-015)
      25  | Campo | Tipo | Origem / regra |
     ...
      27  | `colaborador` | objeto bruto | eco integral (seção 4) |
      28  | `periodo` | objeto bruto | eco integral |
      29  | `inicio`, `fim` | `DataISO` | RN-015: datas válidas, `inicio 
          ≤ fim` |
      30 +| `centroCusto` | texto ou `null` | RN-015, AMB-032: tipo difer
         +ente de texto aborta. Ausente, nulo ou vazio → `null` (tabela p
         +adrão) |                                                       
      31  | `despesas` | `unknown[]` | RN-015: precisa ser lista. Cada el
          emento é bruto |
      32  
      33  Qualquer falha aqui gera `ErroEntrada { mensagem }` e **não ger
          a saída**.
     ...
       36  Elemento de `despesas` sem nenhuma garantia (`unknown`). Pode 
           nem ser objeto
       37  (RN-003, AMB-023).
       38  
       34 -## 2. Estados de uma despesa                                  
       39 +## 2. Dados externos (novos na v4)                            
       40  
       41 +### `Politica` (tabela de limites válida, RN-016, AMB-044)    
       42 +Lida de `dados/politica.json` por `io/politica.ts` (R-11, R-12
          +).                                                            
       43 +                                                              
       44 +| Campo | Tipo | Regra |                                      
       45 +|---|---|---|                                                 
       46 +| `versao` | texto | eco em `politica.versao` |               
       47 +| `vigencia` | `DataISO` | só validada (AMB-034) |            
       48 +| `padrao` | `TabelaCategorias` | RN-016 |                    
       49 +| `centrosCusto` | `Map<nomeNormalizado, { nome, categorias: T
          +abelaCategorias }>` | `nome` como está escrito (para `politica
          +.tabela`). Colisão depois de normalizar → inválida |          
       50 +| `limiarNotaFiscal` | `Decimal` | RN-008, comparação exata (R
          +-13) |                                                        
       51 +| `acrescimoViagemPercentual` | `Decimal` | RN-011, AMB-033 | 
       52 +                                                              
       53 +`TabelaCategorias = Map<categoriaNormalizada, RegraCategoria>`
          +, e                                                           
       54 +`RegraCategoria = { limite: Centavos; periodicidade: 'dia' | '
          +diaria' }`.                                                   
       55 +Validação (RN-016): limite ≥ 0 e exato em centavos; `diaria` ⇔
          + `hospedagem`;                                                
       56 +colisão de categorias → inválida.                             
       57 +                                                              
       58 +### `Cambio` (arquivo de câmbio válido, RN-017, AMB-042, AMB-0
          +44)                                                           
       59 +Lido de `dados/cambio.json` por `io/cambio.ts`. Guardado já co
          +mo índice                                                     
       60 +(R-14):                                                       
       61 +                                                              
       62 +`Map<Moeda, readonly Cotacao[]>`, com `Cotacao = { data: DataI
          +SO; taxa:                                                     
       63 +NumeroJson }` em ordem crescente de data. A taxa guarda o text
          +o original,                                                   
       64 +para sair "como está no arquivo" (R-04), e vira `Decimal` na c
          +onta.                                                         
       65 +Validação (RN-017): chave de data válida; valor da data é obje
          +to; moeda com 3                                               
       66 +letras; colisão `"usd"`/`"USD"` na mesma data → inválido; taxa
          + > 0.                                                         
       67 +                                                              
       68 +### `TabelaAplicavel` (montada uma vez por execução, RN-016)  
       69 +| Campo | Tipo | Regra |                                      
       70 +|---|---|---|                                                 
       71 +| `nome` | texto | `"padrao"` ou o centro de custo como está n
          +a tabela (`politica.tabela`) |                                
       72 +| `versao` | texto | eco da `Politica` |                      
       73 +| `centroCusto` | texto ou `null` | nome do CC quando há entra
          +da, para a descrição da RN-006 |                              
       74 +| `categorias` | `Map<Categoria, RegraCategoria & { origem: 'c
          +entro_custo' \| 'padrao' }>` | RN-016 itens 1 a 3. Limite 0 do
          + CC **não** herda (AMB-031) |                                 
       75 +| `limiarNotaFiscal`, `acrescimoViagemPercentual` | `Decimal` 
          +| únicos para todos os CC |                                   
       76 +                                                              
       77 +Montada por `nucleo/politica.ts` a partir de `Politica` + `Ent
          +rada.centroCusto`.                                            
       78 +                                                              
       79 +## 3. Estados de uma despesa                                  
       80 +                                                              
       81  Cada despesa percorre as etapas da seção 8 da spec. Em cada et
           apa ela segue ou
       82  é **recusada**, e a primeira recusa é definitiva:
       83  
       84  ```
       85  DespesaBruta
       41 -  │ etapa 1-2  RN-001, RN-002, RN-003 ─────────────► Recusada(
          -DADO_INVALIDO)                                                
       86 +  │ etapa 1  RN-001, RN-002, RN-017 (conversão, sem recusar)  
       87 +  │ etapa 2  RN-003 ───────────────────────────────► Recusada(
          +DADO_INVALIDO)                                                
       88    ▼
       89  DespesaValida
       44 -  │ etapas 3-7 RN-004 → RN-005 → RN-006 → RN-007 → RN-008     
       90 +  │ etapas 3-8  RN-004 → RN-005 → RN-006 → RN-017 → RN-007 → R
          +N-008                                                         
       91    │                                   ─────────────► Recusada(
           VALOR_NAO_POSITIVO |
       92    ▼                                                   FORA_DO_
           PERIODO | CATEGORIA_NAO_
       47 -DespesaElegivel                                       REEMBOLS
          -AVEL | DUPLICATA |                                            
       48 -  │ etapa 8  RN-011 (dias de viagem)                  NOTA_FIS
          -CAL_AUSENTE)                                                  
       49 -  │ etapa 9  RN-012 (parcelas) + RN-009/RN-010 (limite)       
       93 +DespesaElegivel                                       REEMBOLS
          +AVEL | CAMBIO_INDISPONIVEL |                                  
       94 +  │ etapa 9   RN-011 (dias de viagem)                 DUPLICAT
          +A | NOTA_FISCAL_AUSENTE)                                      
       95 +  │ etapa 10  RN-012 (parcelas) + RN-009/RN-010 (limite)      
       96    ▼
       97  Alocada(APROVADO_INTEGRAL | LIMITE_DIARIO_EXCEDIDO | LIMITE_DI
           ARIO_ESGOTADO)
       98 +  │ etapa 11  RN-018: reembolsável > R$ 500,00                
       99 +  ▼                                                           
      100 +Alocada(REQUER_APROVACAO)   (mesmos valores; só o motivo muda)
      101  ```
      102  
      103 +### `Conversao` (etapa 1, RN-017, AMB-043)                    
      104 +| Campo | Tipo | Regra |                                      
      105 +|---|---|---|                                                 
      106 +| `taxa` | `NumeroJson` | do câmbio; `1` em BRL |             
      107 +| `dataCotacao` | `DataISO` ou `null` | a da despesa ou a últi
          +ma anterior (AMB-035); `null` em BRL |                        
      108 +| `valorSolicitado` | `Centavos` | `valorOriginal × taxa`, mei
          +o para o par (AMB-037); igual ao original em BRL |            
      109 +                                                              
      110 +É `null` quando não houve conversão: `valor` inválido (sempre,
          + mesmo em BRL,                                                
      111 +AMB-043), moeda não textual, data inválida numa moeda estrange
          +ira, ou moeda                                                 
      112 +sem cotação até a data. Os três campos da saída saem juntos de
          +sse valor.                                                    
      113 +                                                              
      114  ### `DespesaValida` (passou da RN-003)
      115  | Campo | Tipo | Regra |
      116  |---|---|---|
      117  | `indice` | inteiro | posição na entrada. É a ordem da RN-007
            e da RN-010 |
      118  | `id` | texto | como veio (para a saída) |
       59 -| `idNormalizado` | texto | AMB-024. Usado só na detecção de `
          -id` repetido. Só uma `DespesaValida` entra no conjunto de ids 
          -vistos. Uma `Recusa(DADO_INVALIDO)` não reserva o `id` (AMB-02
          -5) |                                                          
      119 +| `idNormalizado` | texto | AMB-024. Só uma `DespesaValida` en
          +tra no conjunto de ids vistos (AMB-025) |                     
      120  | `data` | `DataISO` | RN-003 |
      121  | `categoriaOriginal` | texto | como veio |
       62 -| `categoria` | texto normalizado | RN-002. Ainda pode ser des
          -conhecida (a recusa vem na RN-006) |                          
       63 -| `descricao` | texto | RN-003/AMB-026: qualquer valor vira te
          -xto, ausente ou nulo = `""`. Na hospedagem, fonte do N (RN-012
          -) |                                                           
       64 -| `fornecedorChave` | texto | RN-003/AMB-026: qualquer valor v
          -ira texto. RN-007: `trim` + minúsculas. Ausente ou nulo = `""`
          - |                                                            
       65 -| `valorSolicitado` | `Centavos` | RN-003 → RN-001 (meio para 
          -o par) |                                                      
      122 +| `categoria` | `Categoria` | RN-002. Ainda pode não estar na 
          +tabela (a recusa vem na RN-006) |                             
      123 +| `descricao` | texto | RN-003/AMB-026. Na hospedagem, fonte d
          +o N (RN-012) |                                                
      124 +| `fornecedorChave` | texto | RN-003/AMB-026, RN-007: `trim` +
          + minúsculas |                                                 
      125 +| `moeda` | `Moeda` | RN-003, AMB-036: ausente/nulo/vazio → `"
          +BRL"` |                                                       
      126 +| `valorOriginal` | `Centavos` | RN-003 → RN-001, na moeda da 
          +despesa |                                                     
      127 +| `conversao` | `Conversao \| null` | etapa 1. `null` aqui só 
          +por falta de cotação (a recusa vem na etapa 6) |              
      128  | `temNotaFiscal` | booleano | RN-003: vazio vale `false` |
      129  
       68 -### `DespesaElegivel` (passou das etapas 3 a 7)               
       69 -`DespesaValida` com `categoria: Categoria` (já reconhecida) e 
       70 -`valorSolicitado > 0`. Para hospedagem, também `diarias: N` (R
          -N-012).                                                       
      130 +### `DespesaElegivel` (passou das etapas 3 a 8)               
      131 +`DespesaValida` com a categoria na tabela aplicável e limite >
          + 0, `conversao`                                               
      132 +não nula e `valorSolicitado` (em reais) > 0. Carrega a `RegraC
          +ategoria` da                                                  
      133 +tabela aplicável. Para `periodicidade: 'diaria'`, também `diar
          +ias: N`                                                       
      134 +(RN-012).                                                     
      135  
      136  ### `Recusa`
      137  | Campo | Tipo |
      138  |---|---|
       75 -| `codigo` | um dos 6 códigos de recusa de elegibilidade da se
          -ção 4 |                                                       
       76 -| `detalhes` | dados para montar a descrição (ex.: `idAceito` 
          -da duplicata, datas do período) |                             
      139 +| `codigo` | um dos 7 códigos de recusa das etapas 2 a 8 da se
          +ção 8 |                                                       
      140 +| `detalhes` | dados para montar a descrição. Novos na v4: CAT
          +EGORIA_NAO_REEMBOLSAVEL leva `{ categoria, tabela, caso: 'ause
          +nte' \| 'limite_zero', centroCusto }` (RN-006); CAMBIO_INDISPO
          +NIVEL leva `{ moeda, data }`; NOTA_FISCAL_AUSENTE leva também 
          +a moeda e o valor original, quando estrangeira |              
      141  
       78 -## 3. Cálculo do limite                                       
      142 +`RecusaDadoInvalido` guarda os ecos brutos `id`, `data`, `cate
          +goria` **e                                                    
      143 +`moeda`** (AMB-023), o `valorOriginal` (ou `null`) e a `conver
          +sao` (ou `null`).                                             
      144  
      145 +## 4. Cálculo do limite                                       
      146 +                                                              
      147  ### `Parcela` (RN-012)
       81 -Uma fatia de despesa elegível que consome limite de uma data. 
          -Uma despesa que                                               
       82 -não é hospedagem gera uma parcela. Uma hospedagem com N diária
          -s gera N.                                                     
      148 +Uma fatia de despesa elegível que consome limite de uma data. 
          +Uma despesa de                                                
      149 +periodicidade `dia` gera uma parcela. Uma de periodicidade `di
          +aria` com N                                                   
      150 +diárias gera N.                                               
      151  
      152  | Campo | Tipo | Regra |
      153  |---|---|---|
      154  | `indiceDespesa` | inteiro | a quem a parcela pertence (ordem
            de consumo) |
      155  | `data` | `DataISO` | D + k, com k = 0…N−1 |
      156  | `categoria` | `Categoria` | |
       89 -| `valor` | `Centavos` | `valor ÷ N`. Os centavos que sobram v
          -ão um a um para as primeiras noites |                         
      157 +| `valor` | `Centavos` | `valorSolicitado ÷ N` **em reais**. O
          +s centavos que sobram vão um a um para as primeiras noites |  
      158  
      159  ### `DiasDeViagem` (RN-011)
       92 -Conjunto de `DataISO`: todas as noites de todas as hospedagens
          - **elegíveis**.                                               
      160 +Conjunto de `DataISO`: todas as noites de todas as despesas el
          +egíveis de                                                    
      161 +periodicidade `diaria`. Inclui as que vão sair PENDENTE (RN-01
          +8), porque a                                                  
      162 +etapa 11 vem depois.                                          
      163  
      164  ### `Saldo`
       95 -Tabela `(data, categoria) → Centavos`, iniciada com o limite d
          -a categoria                                                   
       96 -naquela data. O limite é ampliado 1,5× se a data é dia de viag
          -em e a                                                        
       97 -categoria amplia (RN-009, AMB-020). Cada parcela, na ordem da 
          -entrada,                                                      
       98 -recebe `min(valor, saldo)` e desconta isso do saldo (RN-010). 
      165 +Tabela `(data, categoria) → Centavos`, iniciada com o limite d
          +a categoria na                                                
      166 +tabela aplicável. Se a data é dia de viagem e a periodicidade 
          +é `dia`, o                                                    
      167 +limite é `limite × (100 + p) / 100`, meio para o par (RN-011, 
          +AMB-033, R-13).                                               
      168 +Cada parcela, na ordem da entrada, recebe `min(valor, saldo)` 
          +e desconta isso                                               
      169 +do saldo (RN-010). PENDENTE não devolve saldo.                
      170  
      100 -## 4. Saída                                                   
      171 +## 5. Saída                                                   
      172  
      173  ### `ResultadoItem` (um por despesa, na ordem da entrada)
      174  Campos e significado: **seção 4 da spec**. Observações de impl
           ementação:
      175  - Os valores monetários são `Centavos` no núcleo e só viram nú
           mero JSON
      176    `0.00` na serialização (R-04).
      106 -- `valor_solicitado` é `Centavos | null`. É nulo só em `DADO_I
          -NVALIDO` com                                                  
      107 -  `valor` não numérico (AMB-023).                             
      108 -- Os ecos de `id`/`data`/`categoria` num `DADO_INVALIDO` guard
          -am o **valor                                                  
      109 -  bruto** (`unknown`) e ele é reemitido como veio. Um `NumeroJ
          -son` volta como                                               
      110 -  o mesmo texto numérico.                                     
      177 +- `moeda`: normalizada; num `DADO_INVALIDO`, o eco bruto (ause
          +nte → `null`).                                                
      178 +- `valorOriginal`: `Centavos | null`. Nulo só com `valor` não 
          +numérico.                                                     
      179 +- `conversao: Conversao | null` gera `taxa_cambio`, `data_cota
          +cao` e                                                        
      180 +  `valor_solicitado` juntos (R-17, AMB-043).                  
      181 +- Os ecos de `id`/`data`/`categoria`/`moeda` num `DADO_INVALID
          +O` guardam o                                                  
      182 +  **valor bruto** (`unknown`) e ele é reemitido como veio.    
      183  - `status` é **derivado** de (`reembolsavel`, `solicitado`) e 
           nunca é
      112 -  guardado separado. Assim ele não pode contradizer os valores
          -.                                                             
      184 +  guardado separado: `> LIMIAR_APROVACAO` → PENDENTE; senão co
          +mo na v1 (R-16).                                              
      185  
      186  ### `Motivo`
      187  `{ codigo, descricao }`. A descrição sai de um modelo de texto
            por código,
      116 -com valores formatados em `R$ 0,00` (RN-013). Para os códigos 
          -de limite, a                                                  
      117 -descrição traz o limite aplicado, o saldo disponível e o valor
          - cortado.                                                     
      188 +com valores formatados em `R$ 0,00` (RN-013). Nos códigos de l
          +imite, traz o                                                 
      189 +limite aplicado, o saldo disponível e o valor cortado. Em moed
          +a estrangeira,                                                
      190 +traz a conta da conversão (valor original × taxa, data da cota
          +ção). Em                                                      
      191 +REQUER_APROVACAO, traz o valor calculado, o limiar de R$ 500,0
          +0 e o corte de                                                
      192 +limite, se houve (RN-018).                                    
      193  
      194  ### `Resumo` (RN-014)
      120 -Contagens por status e três totais em `Centavos`. `total_solic
          -itado` soma só                                                
      121 -os `valor_solicitado` positivos e não nulos.                  
      195 +Contagens por status (agora com `pendentes`) e quatro totais e
          +m `Centavos`:                                                 
      196 +`totalSolicitado` (só `valor_solicitado` positivos e não nulos
          +),                                                            
      197 +`totalReembolsavel` (itens **não** PENDENTE), `totalPendente` 
          +(itens                                                        
      198 +PENDENTE) e `totalNaoReembolsado = solicitado − reembolsável −
          + pendente`.                                                   
      199  
      123 -## 5. Política                                                
      200 +### Bloco `politica` da saída                                 
      201 +`{ versao, tabela }`, vindo da `TabelaAplicavel`.             
      202  
      125 -`Politica` é um valor constante e tipado (ver plan §4):       
      203 +## 6. Constante de política                                   
      204  
      127 -| Campo | Valor | Regra |                                     
      205 +`src/nucleo/politica.ts` guarda só o que a spec fixa e a tabel
          +a não traz:                                                   
      206 +                                                              
      207 +| Nome | Valor | Regra |                                      
      208  |---|---|---|
      129 -| `limites.alimentacao` | `{ diario: 6000n, ampliaEmViagem: tr
          -ue }` | RN-009 |                                              
      130 -| `limites.transporte_urbano` | `{ diario: 8000n, ampliaEmViag
          -em: true }` | RN-009 |                                        
      131 -| `limites.hospedagem` | `{ diario: 25000n, ampliaEmViagem: fa
          -lse }` | RN-009, AMB-020 |                                    
      132 -| `fatorViagem` | `{ num: 3n, den: 2n }` | RN-011 |           
      133 -| `limiarNotaFiscal` | `10000n` (estritamente maior) | RN-008 
          -|                                                             
      209 +| `LIMIAR_APROVACAO` | `500_00n` (estritamente maior) | RN-018
          +, AMB-040 |                                                   
      210 +                                                              
      211 +Os limites, o limiar de nota fiscal e o percentual de viagem *
          +*não** existem                                                
      212 +mais no código (RN-016).                                      

● Now the contracts: the CLI contract, the output schema, and a new contract for
  the external files.

● Write(contracts\cli.md)
  ⎿  Added 24 lines, removed 13 lines
       1  # Contrato — CLI
       2  
       3  Interface fixa do desafio, com os detalhes de implementação dec
          ididos no plano
       4 -(R-08). O formato do conteúdo da saída é o da seção 4 da spec, 
         -formalizado em                                                 
       5 -[`saida.schema.json`](saida.schema.json).                      
       4 +(R-08, R-11). O formato do conteúdo da saída é o da seção 4 da 
         +spec (v2.2),                                                   
       5 +formalizado em [`saida.schema.json`](saida.schema.json). Os doi
         +s arquivos                                                     
       6 +externos lidos a cada execução estão em                        
       7 +[`arquivos-externos.md`](arquivos-externos.md).                
       8  
       9  ## Invocação
      10  
     ...
      16  | Argumento | Obrigatório | Significado |
      17  |---|---|---|
      18  | `calcular` | sim | único subcomando |
      17 -| `--input <caminho>` | sim | JSON no formato de `exemplos/desp
         -esas-exemplo.json` |                                           
      19 +| `--input <caminho>` | sim | JSON no formato de `exemplos/desp
         +esas-exemplo.json` (com `centro_custo` e `moeda` opcionais, seç
         +ão 4) |                                                        
      20  | `--output <caminho>` | sim | onde gravar o resultado. Se o ar
          quivo existir, é sobrescrito |
      21  
      22 +Não existe opção para a tabela de limites nem para o câmbio: el
         +es ficam num                                                   
      23 +local fixo (AMB-028, R-11).                                    
      24 +                                                               
      25  ## Comportamento
      26  
      27  | Situação | Código de saída | `stdout` | `stderr` | Arquivo de
           saída |
      28  |---|---|---|---|---|
      24 -| Sucesso | `0` | uma linha de resumo (qtd. de itens, total ree
         -mbolsável) | — | gravado (UTF-8, JSON indentado com 2 espaços, 
         -`\n` no fim) |                                                 
      25 -| Entrada inválida (RN-015): arquivo inexistente, JSON inválido
         -, falta `colaborador.id` / `periodo.inicio` / `periodo.fim` / `
         -despesas`, data inválida, `inicio > fim` | `1` | — | `erro: <me
         -nsagem citando o campo ou o problema>` | **não é criado nem alt
         -erado** |                                                      
      29 +| Sucesso | `0` | uma linha de resumo (qtd. de itens, total ree
         +mbolsável e, se houver, total pendente) | — | gravado (UTF-8, J
         +SON indentado com 2 espaços, `\n` no fim) |                    
      30 +| Entrada inválida (RN-015): arquivo inexistente, JSON inválido
         +, não é objeto, falta `colaborador.id` / `periodo.inicio` / `pe
         +riodo.fim` / `despesas`, data inválida, `inicio > fim`, `colabo
         +rador.centro_custo` que não é texto | `1` | — | `erro: <mensage
         +m citando o campo ou o problema>` | **não é criado nem alterado
         +** |                                                           
      31 +| Tabela de limites ou câmbio ausente, não JSON ou fora do form
         +ato (RN-015, RN-016, RN-017, AMB-044) | `1` | — | `erro: <tabel
         +a de limites \| arquivo de câmbio> (<caminho>): <campo e proble
         +ma>` | **não é criado nem alterado** |                         
      32  | Falha ao gravar a saída | `1` | — | `erro: <mensagem>` | o qu
          e o sistema operacional deixou |
      33  | Uso incorreto (subcomando ou opção ausente/desconhecida) | `2
          ` | — | `uso: ...` | não é criado |
      34  
      29 -Uma despesa inválida **não** é erro de execução. Ela vira um it
         -em                                                             
      30 -`DADO_INVALIDO` e o código de saída continua `0` (RN-003, AMB-0
         -18).                                                           
      35 +A ordem de leitura é entrada → tabela de limites → câmbio. Com 
         +mais de um                                                     
      36 +arquivo inválido, a mensagem é a do primeiro (R-12).           
      37  
      38 +Uma despesa inválida, ou sem cotação para a moeda, **não** é er
         +ro de                                                          
      39 +execução. Ela vira um item `DADO_INVALIDO` ou `CAMBIO_INDISPONI
         +VEL` e o                                                       
      40 +código de saída continua `0` (RN-003, RN-017).                 
      41 +                                                               
      42  ## Garantias
      43  
      34 -- **Determinismo:** a mesma entrada gera bytes idênticos na saí
         -da. O                                                          
      35 -  resultado não depende de hora, fuso, locale nem ordem de iter
         -ação que não                                                   
      36 -  seja a da entrada.                                           
      37 -- **Nenhuma saída parcial:** tudo é calculado em memória antes 
         -de gravar                                                      
      38 -  qualquer byte.                                               
      44 +- **Determinismo:** a mesma entrada, a mesma tabela e o mesmo c
         +âmbio geram                                                    
      45 +  bytes idênticos na saída. O resultado não depende de hora, fu
         +so, locale,                                                    
      46 +  pasta de trabalho nem ordem de iteração que não seja a da ent
         +rada.                                                          
      47 +- **Nenhuma saída parcial:** tudo é lido, validado e calculado 
         +em memória                                                     
      48 +  antes de gravar qualquer byte.                               
      49  - **Eco fiel:** `colaborador` e `periodo` saem com o mesmo cont
          eúdo da
      40 -  entrada. Os números mantêm o texto original (R-03).          
      50 +  entrada. Os números mantêm o texto original (R-03), e a `taxa
         +_cambio` sai                                                   
      51 +  com o texto do arquivo de câmbio (R-04).                     

● Write(contracts\arquivos-externos.md)
  ⎿  Wrote 46 lines to contracts\arquivos-externos.md
       1 # Contrato — Arquivos externos (tabela de limites e câmbio)
       2
          (AMB-028).
       4 O **formato** e o que os torna inválidos estão na spec (seção 4,
          RN-016,
         o só fixa o
       6 **onde** e o **como** técnicos (R-11, R-12).
       7
       9
      10 | Arquivo | Caminho | Conteúdo inicial |
     … +53 lines (ctrl+o to expand)

● Write(contracts\saida.schema.json)
  ⎿  Added 51 lines, removed 11 lines
       2    "$schema": "https://json-schema.org/draft/2020-12/schema",
       3    "$id": "saida.schema.json",
       4    "title": "Resultado do motor de reembolso",
       5 -  "description": "Formaliza a seção 4 da spec (v1.1). Em caso d
         -e divergência, a spec prevalece.",                             
       5 +  "description": "Formaliza a seção 4 da spec (v2.2). Em caso d
         +e divergência, a spec prevalece.",                             
       6    "type": "object",
       7 -  "required": ["colaborador", "periodo", "itens", "resumo"],   
       7 +  "required": ["colaborador", "periodo", "politica", "itens", "
         +resumo"],                                                      
       8    "additionalProperties": false,
       9    "properties": {
      10      "colaborador": { "type": "object", "description": "Eco do o
          bjeto de entrada" },
      11      "periodo": { "type": "object", "description": "Eco do objet
          o de entrada" },
      12 +    "politica": {                                              
      13 +      "type": "object",                                        
      14 +      "required": ["versao", "tabela"],                        
      15 +      "additionalProperties": false,                           
      16 +      "properties": {                                          
      17 +        "versao": { "type": "string", "minLength": 1, "descript
         +ion": "versao da tabela de limites usada" },                   
      18 +        "tabela": { "type": "string", "minLength": 1, "descript
         +ion": "\"padrao\" ou o centro de custo como está na tabela (RN-
         +016)" }                                                        
      19 +      }                                                        
      20 +    },                                                         
      21      "itens": { "type": "array", "items": { "$ref": "#/$defs/ite
          m" } },
      22      "resumo": { "$ref": "#/$defs/resumo" }
      23    },
     ...
      25      "dinheiro": {
      26        "type": "number",
      27        "multipleOf": 0.01,
      19 -      "description": "Reais com no máximo duas casas decimais" 
      28 +      "description": "Valor com no máximo duas casas decimais" 
      29      },
      30      "dinheiroNaoNegativo": { "allOf": [{ "$ref": "#/$defs/dinhe
          iro" }, { "minimum": 0 }] },
      31 +    "data": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{
         +2}$" },                                                        
      32      "item": {
      33        "type": "object",
      34        "required": [
      25 -        "id", "data", "categoria", "valor_solicitado", "valor_r
         -eembolsavel", "status",                                        
      26 -        "limite_diario_aplicado", "em_viagem", "diarias", "moti
         -vo"                                                            
      35 +        "id", "data", "categoria", "moeda", "valor_original", "
         +taxa_cambio", "data_cotacao",                                  
      36 +        "valor_solicitado", "valor_reembolsavel", "status", "li
         +mite_diario_aplicado", "em_viagem",                            
      37 +        "diarias", "motivo"                                    
      38        ],
      39        "additionalProperties": false,
      40        "properties": {
      41          "id": { "description": "Como veio; qualquer tipo em DAD
          O_INVALIDO (AMB-023)" },
      42          "data": { "description": "Como veio; qualquer tipo em D
          ADO_INVALIDO (AMB-023)" },
      43          "categoria": { "description": "Normalizada (RN-002) ou 
          como veio (AMB-023)" },
      44 +        "moeda": { "description": "Normalizada (\"BRL\" se ause
         +nte); como veio em DADO_INVALIDO, ausente → null (RN-003)" },  
      45 +        "valor_original": {                                    
      46 +          "oneOf": [{ "$ref": "#/$defs/dinheiro" }, { "type": "
         +null" }],                                                      
      47 +          "description": "Na moeda da despesa (RN-001). Nulo se
         + valor ausente ou não numérico"                                
      48 +        },                                                     
      49 +        "taxa_cambio": {                                       
      50 +          "oneOf": [{ "type": "number", "exclusiveMinimum": 0 }
         +, { "type": "null" }],                                         
      51 +          "description": "Como está no arquivo de câmbio; 1 em 
         +BRL. Nulo sem conversão (AMB-043)"                             
      52 +        },                                                     
      53 +        "data_cotacao": {                                      
      54 +          "oneOf": [{ "$ref": "#/$defs/data" }, { "type": "null
         +" }],                                                          
      55 +          "description": "Nulo em BRL ou sem conversão (RN-017,
         + AMB-043)"                                                     
      56 +        },                                                     
      57          "valor_solicitado": {
      58            "oneOf": [{ "$ref": "#/$defs/dinheiro" }, { "type": "
          null" }],
      35 -          "description": "Nulo só em DADO_INVALIDO com valor nã
         -o numérico (AMB-023)"                                          
      59 +          "description": "Em reais. Nulo sem conversão: valor i
         +nválido ou sem cotação (AMB-023, AMB-043)"                     
      60          },
      61          "valor_reembolsavel": { "$ref": "#/$defs/dinheiroNaoNeg
          ativo" },
      38 -        "status": { "enum": ["APROVADO", "PARCIAL", "RECUSADO"]
         - },                                                            
      62 +        "status": { "enum": ["APROVADO", "PARCIAL", "RECUSADO",
         + "PENDENTE"] },                                                
      63          "limite_diario_aplicado": {
      64            "oneOf": [{ "$ref": "#/$defs/dinheiroNaoNegativo" }, 
          { "type": "null" }]
      65          },
     ...
       74                "enum": [
       75                  "APROVADO_INTEGRAL", "LIMITE_DIARIO_EXCEDIDO",
            "LIMITE_DIARIO_ESGOTADO",
       76                  "DADO_INVALIDO", "VALOR_NAO_POSITIVO", "FORA_D
           O_PERIODO",
       53 -                "CATEGORIA_NAO_REEMBOLSAVEL", "DUPLICATA", "NO
          -TA_FISCAL_AUSENTE"                                            
       77 +                "CATEGORIA_NAO_REEMBOLSAVEL", "CAMBIO_INDISPON
          +IVEL", "DUPLICATA",                                           
       78 +                "NOTA_FISCAL_AUSENTE", "REQUER_APROVACAO"     
       79                ]
       80              },
       81              "descricao": { "type": "string", "minLength": 1 }
       82            }
       83          }
       59 -      }                                                       
       84 +      },                                                      
       85 +      "allOf": [                                              
       86 +        {                                                     
       87 +          "description": "AMB-043: os três campos de conversão
          + andam juntos",                                               
       88 +          "if": { "properties": { "valor_solicitado": { "type"
          +: "null" } } },                                               
       89 +          "then": { "properties": { "taxa_cambio": { "type": "
          +null" }, "data_cotacao": { "type": "null" } } }               
       90 +        },                                                    
       91 +        {                                                     
       92 +          "description": "Seção 4: PENDENTE ⇔ REQUER_APROVACAO
          +",                                                            
       93 +          "if": { "properties": { "status": { "const": "PENDEN
          +TE" } } },                                                    
       94 +          "then": { "properties": { "motivo": { "properties": 
          +{ "codigo": { "const": "REQUER_APROVACAO" } } } } },          
       95 +          "else": { "properties": { "motivo": { "properties": 
          +{ "codigo": { "not": { "const": "REQUER_APROVACAO" } } } } } }
       96 +        }                                                     
       97 +      ]                                                       
       98      },
       99      "resumo": {
      100        "type": "object",
      101        "required": [
       64 -        "quantidade_itens", "aprovados", "parciais", "recusado
          -s",                                                           
       65 -        "total_solicitado", "total_reembolsavel", "total_nao_r
          -eembolsado"                                                   
      102 +        "quantidade_itens", "aprovados", "parciais", "recusado
          +s", "pendentes",                                              
      103 +        "total_solicitado", "total_reembolsavel", "total_pende
          +nte", "total_nao_reembolsado"                                 
      104        ],
      105        "additionalProperties": false,
      106        "properties": {
     ...
      108          "aprovados": { "type": "integer", "minimum": 0 },
      109          "parciais": { "type": "integer", "minimum": 0 },
      110          "recusados": { "type": "integer", "minimum": 0 },
      111 +        "pendentes": { "type": "integer", "minimum": 0 },     
      112          "total_solicitado": { "$ref": "#/$defs/dinheiroNaoNega
           tivo" },
      113          "total_reembolsavel": { "$ref": "#/$defs/dinheiroNaoNe
           gativo" },
      114 +        "total_pendente": { "$ref": "#/$defs/dinheiroNaoNegati
          +vo" },                                                        
      115          "total_nao_reembolsado": { "$ref": "#/$defs/dinheiroNa
           oNegativo" }
      116        }
      117      }

● Write(quickstart.md)
  ⎿  Added 65 lines, removed 32 lines
        1  # Quickstart — validação ponta a ponta
        2  
        3 -Roteiro para provar que o motor atende a spec. O comportamento
          - esperado está                                                
        4 -na [`spec.md`](spec.md) (seções 7 e 9), a interface em        
        5 -[`contracts/cli.md`](contracts/cli.md) e o formato da saída em
        6 -[`contracts/saida.schema.json`](contracts/saida.schema.json). 
        3 +Roteiro para provar que o motor atende a spec (v2.2). O compor
          +tamento                                                       
        4 +esperado está na [`spec.md`](spec.md) (seções 7 e 9), a interf
          +ace em                                                        
        5 +[`contracts/cli.md`](contracts/cli.md), os arquivos externos e
          +m                                                             
        6 +[`contracts/arquivos-externos.md`](contracts/arquivos-externos
          +.md) e o                                                      
        7 +formato da saída em [`contracts/saida.schema.json`](contracts/
          +saida.schema.json).                                           
        8  
        9  ## Pré-requisitos
       10  
       11  - Node **≥ 24** (`node --version`). O código TypeScript roda d
           ireto, sem build
       12    (R-01).
       13  - Na raiz do repositório: `npm install`.
       14 +- `dados/politica.json` e `dados/cambio.json` iguais aos de   
       15 +  `exemplos/envelope/` (é o estado do repositório; confira com
       16 +  `git status dados/`).                                       
       17  
       18  ## 1. Suíte automatizada
       19  
       20  ```bash
       17 -npm test          # vitest run: regras, casos de borda, exempl
          -o, CLI, rastreabilidade                                       
       21 +npm test          # vitest run: regras, casos de borda, exempl
          +os, CLI, rastreabilidade                                      
       22  npm run typecheck # tsc --noEmit
       23  ```
       24  
       25  **Esperado:** tudo verde. O teste de rastreabilidade falha se 
           alguma
       22 -`RN-NNN` da spec ou alguma linha da tabela da seção 7 ficar se
          -m teste com o                                                 
       23 -nome correspondente.                                          
       26 +`RN-NNN` da spec (RN-001 a RN-018) ou alguma linha da tabela d
          +a seção 7                                                     
       27 +ficar sem teste com o nome correspondente.                    
       28  
       25 -## 2. Arquivo de exemplo                                      
       29 +## 2. Os três arquivos da seção 9                             
       30  
       31  ```bash
       28 -node src/cli.ts calcular --input exemplos/despesas-exemplo.jso
          -n --output resultado.json                                     
       32 +node src/cli.ts calcular --input exemplos/despesas-exemplo.jso
          +n --output r-exemplo.json                                     
       33 +node src/cli.ts calcular --input exemplos/envelope/despesas-en
          +velope.json --output r-envelope.json                          
       34 +node src/cli.ts calcular --input exemplos/envelope/despesas-en
          +velope-cc-desconhecido.json --output r-cc.json                
       35  ```
       36  
       31 -**Esperado:** código de saída `0`, e `resultado.json` com os 1
          -4 itens na                                                    
       32 -ordem da entrada, exatamente como na tabela da **seção 9 da sp
          -ec**. Pontos                                                  
       33 -rápidos para conferir à mão:                                  
       37 +**Esperado:** código de saída `0` nos três, e itens exatamente
          + como nas                                                     
       38 +tabelas da **seção 9 da spec**. Pontos rápidos para conferir à
          + mão:                                                         
       39  
       35 -| Conferir | Esperado |                                       
       36 -|---|---|                                                     
       37 -| `resumo` | solicitado 1861.84 · reembolsável 815.43 · não re
          -embolsado 1046.41 · 4/3/7 |                                   
       38 -| `d-011` | `valor_solicitado` 33.33, `em_viagem` true, `limit
          -e_diario_aplicado` 90.00 |                                    
       39 -| `d-010` | `diarias` 2, APROVADO 480.00 |                    
       40 -| `d-004` | `NOTA_FISCAL_AUSENTE` (100.01), enquanto `d-003` (
          -100.00) sai PARCIAL 80.00 |                                   
       41 -| valores monetários | sempre com duas casas (`60.00`, não `60
          -`) |                                                          
       40 +| Arquivo | Conferir | Esperado |                             
       41 +|---|---|---|                                                 
       42 +| exemplo | `politica` | `{"versao": "v4", "tabela": "CC-ENG-P
          +LATAFORMA"}` |                                                
       43 +| exemplo | `resumo` | solicitado 1861.84 · reembolsável 351.4
          +3 · pendente 0.00 · não reembolsado 1510.41 · 5/2/7/0 |       
       44 +| exemplo | `d-010`, `d-013` | `CATEGORIA_NAO_REEMBOLSAVEL`, d
          +escrição cita CC-ENG-PLATAFORMA |                             
       45 +| envelope | `e-004` | `taxa_cambio` 5.96, `data_cotacao` "202
          +6-07-17" (sábado → sexta), `valor_solicitado` 178.80 |        
       46 +| envelope | `e-006` | `CAMBIO_INDISPONIVEL`; `valor_solicitad
          +o`, `taxa_cambio`, `data_cotacao` nulos |                     
       47 +| envelope | `e-007` | PENDENTE/`REQUER_APROVACAO`, `valor_ree
          +mbolsavel` 1200.00, `diarias` 3 |                             
       48 +| envelope | `e-008` | `em_viagem` true, `limite_diario_aplica
          +do` 135.00 |                                                  
       49 +| envelope | `resumo` | reembolsável 748.26 · pendente 1200.00
          + · não reembolsado 509.26 · 3/3/3/1 |                         
       50 +| cc-desconhecido | `politica.tabela` | `"padrao"` |          
       51 +| todos | valores monetários | sempre com duas casas (`60.00`,
          + não `60`) |                                                  
       52  
       43 -## 3. Determinismo                                            
       53 +## 3. A tabela vem de fora (RN-016, AMB-028)                  
       54  
       55  ```bash
       46 -node src/cli.ts calcular --input exemplos/despesas-exemplo.jso
          -n --output r1.json                                            
       47 -node src/cli.ts calcular --input exemplos/despesas-exemplo.jso
          -n --output r2.json                                            
       48 -cmp r1.json r2.json   # sem diferença                         
       56 +cp dados/politica.json /tmp/politica.bak                      
       57 +# edite dados/politica.json: padrao.alimentacao.limite de 60.0
          +0 para 70.00                                                  
       58 +node src/cli.ts calcular --input exemplos/envelope/despesas-en
          +velope-cc-desconhecido.json --output r-70.json                
       59 +cp /tmp/politica.bak dados/politica.json                      
       60  ```
       61  
       51 -## 4. Entrada inválida (RN-015)                               
       62 +**Esperado:** `f-001` (58,00) continua APROVADO, e o total mud
          +a só se algum                                                 
       63 +item de alimentação passava de 60,00. Para ver a mudança num i
          +tem, use uma                                                  
       64 +entrada com alimentação de 65,00 sem `centro_custo`: PARCIAL 6
          +0,00 antes,                                                   
       65 +APROVADO 65,00 depois. Nenhum arquivo de código muda.         
       66  
       53 -Crie um arquivo sem `periodo` e rode o comando:               
       67 +Repita de outra pasta (`cd /tmp && node <repo>/src/cli.ts calc
          +ular ...`): os                                                
       68 +arquivos lidos são os mesmos de `dados/` (R-11).              
       69  
       70 +## 4. Determinismo                                            
       71 +                                                              
       72  ```bash
       73 +node src/cli.ts calcular --input exemplos/envelope/despesas-en
          +velope.json --output r1.json                                  
       74 +node src/cli.ts calcular --input exemplos/envelope/despesas-en
          +velope.json --output r2.json                                  
       75 +cmp r1.json r2.json   # sem diferença                         
       76 +```                                                           
       77 +                                                              
       78 +## 5. Entrada ou arquivo externo inválido (RN-015)            
       79 +                                                              
       80 +```bash                                                       
       81  node src/cli.ts calcular --input sem-periodo.json --output nao
           -deve-existir.json
       82  echo $?   # 1
       83  ```
       84  
       85  **Esperado:** a mensagem em `stderr` cita `periodo`, o código 
           de saída é `1`
       61 -e `nao-deve-existir.json` não é criado. Repita com `inicio` de
          -pois de `fim` e                                               
       62 -com um arquivo que não é JSON.                                
       86 +e `nao-deve-existir.json` não é criado. Repita com:           
       87  
       64 -## 5. Dado inválido num item não aborta (RN-003)              
       88 +- `"centro_custo": 42` na entrada → mensagem cita `colaborador
          +.centro_custo`;                                               
       89 +- `dados/cambio.json` renomeado → mensagem cita o arquivo de c
          +âmbio;                                                        
       90 +- um `limite` negativo em `dados/politica.json` → mensagem cit
          +a a tabela de                                                 
       91 +  limites e o campo;                                          
       92 +- sem `versao` em `dados/politica.json` → mensagem cita `versa
          +o` (AMB-044).                                                 
       93  
       66 -Copie o exemplo e troque o `valor` de `d-001` por `"R$ 72,50"`
          -.                                                             
       94 +Restaure `dados/` depois (`git checkout dados/`).             
       95  
       68 -**Esperado:** código de saída `0`. `d-001` sai RECUSADO/`DADO_
          -INVALIDO` com                                                 
       69 -`valor_solicitado` null (AMB-023), e `d-002` passa a ser APROV
          -ADO 38,00                                                     
       70 -(o limite do dia 03/07 ficou livre).                          
       96 +## 6. Dado inválido ou sem cotação num item não aborta (RN-003
          +, RN-017)                                                     
       97 +                                                              
       98 +Copie o exemplo do envelope e troque o `valor` de `e-002` por 
          +`"R$ 22,00"`.                                                 
       99 +                                                              
      100 +**Esperado:** código de saída `0`. `e-002` sai RECUSADO/`DADO_
          +INVALIDO` com                                                 
      101 +`valor_solicitado`, `taxa_cambio` e `data_cotacao` nulos (AMB-
          +043), `moeda`                                                 
      102 +`"EUR"` como veio, e os outros itens não mudam. `e-006` (GBP) 
          +continua                                                      
      103 +`CAMBIO_INDISPONIVEL` sem abortar a execução.                 

● Step 3 of the quickstart is muddled. I'll check the cc-desconhecido file for
  an example that visibly changes.

  Ran 1 shell command (ctrl+o to expand)

● Update(quickstart.md)
  ⎿  Added 6 lines, removed 8 lines
      53  ## 3. A tabela vem de fora (RN-016, AMB-028)
      54  
      55  ```bash
      56 -cp dados/politica.json /tmp/politica.bak                       
      57 -# edite dados/politica.json: padrao.alimentacao.limite de 60.00
         - para 70.00                                                    
      58 -node src/cli.ts calcular --input exemplos/envelope/despesas-env
         -elope-cc-desconhecido.json --output r-70.json                  
      59 -cp /tmp/politica.bak dados/politica.json                       
      56 +# edite dados/politica.json: padrao.hospedagem.limite de 250.00
         + para 320.00                                                   
      57 +node src/cli.ts calcular --input exemplos/envelope/despesas-env
         +elope-cc-desconhecido.json --output r-320.json                 
      58 +git checkout dados/politica.json                               
      59  ```
      60  
      62 -**Esperado:** `f-001` (58,00) continua APROVADO, e o total muda
         - só se algum                                                   
      63 -item de alimentação passava de 60,00. Para ver a mudança num it
         -em, use uma                                                    
      64 -entrada com alimentação de 65,00 sem `centro_custo`: PARCIAL 60
         -,00 antes,                                                     
      65 -APROVADO 65,00 depois. Nenhum arquivo de código muda.          
      61 +**Esperado:** `f-002` (hospedagem 310,00, 1 diária, CC-SUPORTE-
         +N2 → padrão)                                                   
      62 +passa de PARCIAL 250,00 para APROVADO 310,00, e `total_reembols
         +avel` sobe de                                                  
      63 +373.76 para 433.76. Nenhum arquivo de código muda.             
      64  
      65  Repita de outra pasta (`cd /tmp && node <repo>/src/cli.ts calcu
          lar ...`): os
      66  arquivos lidos são os mesmos de `dados/` (R-11).

● Now the plan itself, v2.0:

● Write(plan.md)
  ⎿  Added 269 lines, removed 136 lines
       1  # Plano Técnico — Motor de Cálculo de Reembolso
       2  
       3 -**Versão:** 1.2 · **Baseado na spec:** 1.3 · **Branch:** `001-m
         -otor-reembolso` · **Data:** 2026-09-29                         
       3 +**Versão:** 2.0 · **Baseado na spec:** 2.2 · **Branch:** `001-m
         +otor-reembolso` · **Data:** 2026-09-30                         
       4  
       5  > Aqui mora o COMO. Este arquivo pode e deve falar de linguagem
          , biblioteca e
       6  > arquitetura. O que ele **não** pode é introduzir regra de neg
          ócio nova — se
       7  > apareceu uma, ela pertence à `spec.md`.
       8  
       9 -Artefatos de apoio: [`research.md`](research.md) (decisões R-01
         - a R-10, com                                                   
       9 +Artefatos de apoio: [`research.md`](research.md) (decisões R-01
         + a R-17, com                                                   
      10  as alternativas descartadas), [`data-model.md`](data-model.md),
      11 -[`contracts/`](contracts/) e [`quickstart.md`](quickstart.md). 
      11 +[`contracts/`](contracts/) (CLI, arquivos externos, schema da s
         +aída) e                                                        
      12 +[`quickstart.md`](quickstart.md).                              
      13  
      13 -Ao escrever este plano, três lacunas de regra foram encontradas
         - e levadas à                                                   
      14 -spec **antes** de qualquer decisão técnica (DECISIONS D-015: ec
         -o de item                                                      
      15 -inválido, `id` normalizado e primeira ocorrência das diárias). 
      14 +**v1.0 a v1.2** (spec 1.0 a 1.3): ver D-015, D-017 e D-018. Pla
         +no da política                                                 
      15 +única v3, com os valores em constantes.                        
      16  
      17 -**v1.1:** ajuste à spec 1.2 (D-017, AMB-025). O conjunto de ids
         - vistos só                                                     
      18 -recebe o `id` de despesas que passaram pela validação (etapa 2)
         -. Nenhuma                                                      
      19 -decisão técnica mudou.                                         
      17 +**v2.0** (spec 2.2, Política v4, D-019 a D-021): a política pas
         +sa a vir de                                                    
      18 +fora (tabela por centro de custo), entram moeda estrangeira e a
         +provação                                                       
      19 +manual. Ao escrever este plano, três lacunas de regra foram lev
         +adas à spec                                                    
      20 +**antes** de qualquer decisão técnica (D-021: grafia da moeda n
         +o câmbio,                                                      
      21 +campos de conversão sem valor válido, formato dos arquivos exte
         +rnos). A                                                       
      22 +interface do CLI não muda.                                     
      23  
      21 -**v1.2:** ajuste à spec 1.3 (D-018, AMB-026, AMB-027). `texto.t
         -s` ganha a                                                     
      22 -conversão de `fornecedor`/`descricao` de qualquer tipo para tex
         -to, e                                                          
      23 -`io/entrada.ts` aplica à RN-015 o critério de ausente da RN-003
         -. Os testes                                                    
      24 -passam a ter **um arquivo por RN**: os testes do motor em memór
         -ia vão para o                                                  
      25 -arquivo da RN que verificam, e não existe `motor.test.ts`.     
      26 -                                                               
      24  ---
      25  
      26  ## 0. Contexto técnico
     ...
      30  | Linguagem / runtime | TypeScript em Node **≥ 24**, com type s
          tripping nativo, sem build (R-01) |
      31  | Dependências de runtime | **nenhuma** (só a stdlib do Node) |
      32  | Dependências de desenvolvimento | `typescript` (só typecheck)
          , `vitest` 5, `ajv` (testes de contrato), `@types/node` |
      36 -| Armazenamento | nenhum. Um arquivo entra e um arquivo sai |  
      33 +| Armazenamento | nenhum banco. Lê a entrada e dois arquivos fi
         +xos (`dados/politica.json`, `dados/cambio.json`, R-11) e grava 
         +a saída |                                                      
      34  | Testes | Vitest (`npm test`) |
      35  | Plataforma | CLI multiplataforma (Windows/Linux/macOS) |
      36  | Tipo de projeto | CLI única, com o núcleo em funções puras |
      40 -| Desempenho | irrelevante no volume esperado. O custo é linear
         - no número de despesas + diárias |                             
      41 -| Restrições | nada de float em dinheiro. Saída determinística.
         - Nenhuma saída parcial em erro |                               
      37 +| Desempenho | irrelevante no volume esperado. Linear em despes
         +as + diárias, mais uma busca binária de cotação por despesa est
         +rangeira |                                                     
      38 +| Restrições | nada de float em dinheiro, taxa ou percentual (R
         +-13). Saída determinística. Nenhuma saída parcial em erro |    
      39  
      40  ## 0.1 Constitution Check
      41  
      42  | Princípio | Como o plano cumpre | Status |
      43  |---|---|---|
      47 -| I. Spec é a fonte da verdade | O plano não redefine regra. On
         -de faltou regra, a spec foi corrigida antes (D-015) | ✅ |     
      48 -| II. Regra de negócio só na spec | Os valores da política fica
         -m num módulo só (§4), que reproduz a RN-009, a RN-008 e a RN-01
         -1, com o ID ao lado de cada valor. Comentário de código cita o 
         -ID e não explica a regra | ✅ |                                
      49 -| III. Ambiguidade registrada | 3 lacunas viraram AMB-023, AMB-
         -024 e um ajuste na AMB-008 antes do plano | ✅ |               
      50 -| IV. Spec sem tecnologia | Tudo o que é técnico ficou neste ar
         -quivo e no `research.md`. A spec continua sem nome de tecnologi
         -a | ✅ |                                                       
      51 -| V. Rastreabilidade | Os nomes dos testes começam pelo ID (§6)
         -. Um teste de rastreabilidade lê a spec (R-10) | ✅ |          
      52 -| VI. Nenhuma regra sem teste | Um teste por RN e um por linha 
         -da seção 7, verificado automaticamente | ✅ |                  
      53 -| VII. Mudança de spec registrada | D-015 registrada antes dest
         -e plano | ✅ |                                                 
      54 -| Restrição: dinheiro sem float | Centavos em `bigint`. A entra
         -da é lida pelo texto do número e a saída é emitida por `JSON.ra
         -wJSON` (R-02 a R-04) | ✅ |                                    
      44 +| I. Spec é a fonte da verdade | O plano não redefine regra. On
         +de faltou regra, a spec foi corrigida antes (D-015 na v1, D-021
         + na v4) | ✅ |                                                 
      45 +| II. Regra de negócio só na spec | Os valores da política saem
         + do código e passam a vir da tabela (RN-016). Só o limiar de R$
         + 500, fixado pela spec (AMB-040), fica em `politica.ts`, com o 
         +ID ao lado. Comentário de código cita o ID e não explica a regr
         +a | ✅ |                                                       
      46 +| III. Ambiguidade registrada | As 3 lacunas da v4 viraram AMB-
         +042 a AMB-044 antes do plano | ✅ |                            
      47 +| IV. Spec sem tecnologia | Local fixo, `Decimal`, índice de câ
         +mbio e nomes de módulo ficam aqui e no `research.md`. A spec só
         + diz "local fixo" | ✅ |                                       
      48 +| V. Rastreabilidade | Os nomes dos testes começam pelo ID (§6)
         +. O teste de rastreabilidade (R-10) passa a exigir RN-016 a RN-
         +018 e os 41 casos de borda novos sem mudar de código | ✅ |    
      49 +| VI. Nenhuma regra sem teste | Um arquivo de teste por RN (trê
         +s novos) e um teste por linha da seção 7 | ✅ |                
      50 +| VII. Mudança de spec registrada | D-021 registrada antes dest
         +e plano | ✅ |                                                 
      51 +| Restrição: dinheiro sem float | Centavos em `bigint`. Taxa e 
         +percentual em `Decimal` exato (R-13). Entrada, tabela e câmbio 
         +lidos pelo texto do número; saída por `JSON.rawJSON` | ✅ |    
      52 +| Restrição: escopo | Nada além da spec: sem opção de CLI para 
         +os arquivos (AMB-028), sem histórico de política (AMB-034), sem
         + executar a aprovação (§3) | ✅ |                              
      53  
      54  **Reavaliação depois da Fase 1:** o modelo de dados e os contra
          tos não criam
      57 -regra. O `saida.schema.json` só formaliza a seção 4. **Nenhuma 
         -violação.**                                                    
      55 +regra. `saida.schema.json` formaliza a seção 4 (inclusive a AMB
         +-043 como                                                      
      56 +restrição `if/then`), e `arquivos-externos.md` só fixa o caminh
         +o e remete o                                                   
      57 +formato à spec. **Nenhuma violação.**                          
      58  
      59  ## 1. Stack
      60  
     ...
       62  |---|---|---|---|
       63  | Linguagem | TypeScript, Node ≥ 24, rodando `.ts` direto | st
           ack do usuário. Sem build, não existe `dist/` desatualizado | 
           `tsc`→`dist` e `tsx`: uma etapa ou uma dependência a mais para
            o mesmo resultado |
       64  | Testes | Vitest 5 | escolha do usuário. Roda TS sem configur
           ação | Jest: exige transformação de TS/ESM |
       65 -| Parsing/validação | `JSON.parse` com reviver `context.source
          -` + validação escrita à mão | o texto exato de cada número che
          -ga ao núcleo. A RN-003 tem regras específicas demais para uma 
          -lib de schema | `zod`/`ajv` na entrada, porque traduzir os err
          -os para a RN-003 dá mais código que escrevê-la; `lossless-json
          -` duplica o que o runtime já faz |                            
       66 -| Aritmética monetária | **centavos em `bigint`**. Arredondame
          -nto meio-para-o-par feito nos dígitos do texto. Saída por `JSO
          -N.rawJSON` | exato de ponta a ponta, sem teto. `10.005` fica *
          -*exatamente** no meio (RN-001) | float (erra `10.005`); `numbe
          -r` em centavos (teto de 2^53 viraria regra implícita); `decima
          -l.js` (dependência para operações só com inteiros) |          
       65 +| Parsing/validação | `JSON.parse` com reviver `context.source
          +` + validação escrita à mão, para a entrada **e** para os dois
          + arquivos externos | o texto exato de cada número chega ao núc
          +leo. As regras da RN-003, RN-016 e RN-017 são específicas dema
          +is para uma lib de schema, e a mensagem tem de citar arquivo e
          + campo | `zod`/`ajv` em runtime (R-12) |                      
       66 +| Aritmética | **centavos em `bigint`** para dinheiro; **`Deci
          +mal` (`bigint` + escala)** para taxa e percentual; um único ar
          +redondamento meio-para-o-par (R-13) | exato de ponta a ponta, 
          +sem teto, um critério só de arredondamento (AMB-037) | float; 
          +`decimal.js` (dependência para duas contas) |                 
       67  
       68  ## 2. Arquitetura
       69  
       70  ```
       71 -arquivo ─► io/json (parse com texto dos números) ─► io/entrada
          - (RN-015) ─► Entrada                                          
       72 -                                                              
          -              │                                               
       73 -          ┌─────────────────────── núcleo (puro, sem E/S) ────
          -─────────────┘                                                
       71 +entrada ──► io/json ──► io/entrada (RN-015) ─────────────► Ent
          +rada (+ centroCusto)                                          
       72 +dados/politica.json ─► io/json ─► io/politica (RN-015/016) ► P
          +olitica                                                       
       73 +dados/cambio.json ───► io/json ─► io/cambio (RN-015/017) ──► C
          +ambio (índice)                                                
       74 +                     (caminhos em io/externos.ts, R-11)       
          +   │                                                          
       75 +          ┌──────────────────── núcleo (puro, sem E/S) ───────
          +───┘                                                          
       76            ▼
       75 -   motor: para cada despesa, na ordem                         
       76 -     despesa.ts        etapas 1-2  RN-001, RN-002, RN-003 (est
          -ado: ids vistos, só de validadas, AMB-025)                    
       77 -     elegibilidade.ts  etapas 3-7  RN-004 … RN-008 (estado: ch
          -aves de duplicata)                                            
       77 +   politica.ts       uma vez: TabelaAplicavel                 
          +  RN-016                                                      
       78 +   motor: passada 1, para cada despesa, na ordem              
       79 +     despesa.ts      etapas 1-2   RN-001, RN-002, RN-003 (+ mo
          +eda)                                                          
       80 +     cambio.ts       etapa 1      RN-017 (conversão, sem recus
          +ar)                                                           
       81 +     elegibilidade.ts etapas 3-8  RN-004, RN-005, RN-006, RN-0
          +17, RN-007, RN-008                                            
       82            ▼  elegíveis
       79 -     viagem.ts         etapa 8     RN-011 (noites das hospedag
          -ens elegíveis)                                                
       80 -     diarias.ts        etapa 9a    RN-012 (N e parcelas por no
          -ite)                                                          
       81 -     limites.ts        etapa 9b    RN-009, RN-010 (saldo por (
          -data, categoria), na ordem)                                   
       83 +   motor: passada 2                                           
       84 +     viagem.ts       etapa 9      RN-011 (noites das `diaria` 
          +elegíveis)                                                    
       85 +     diarias.ts      etapa 10a    RN-012 (N e parcelas, em rea
          +is)                                                           
       86 +     limites.ts      etapa 10b    RN-009, RN-010 (+ ampliação 
          +pela tabela)                                                  
       87 +     motor.ts        etapa 11     RN-018 (troca o motivo; valo
          +res intactos)                                                 
       88            ▼
       83 -     motivos.ts RN-013 · resumo.ts RN-014                     
       89 +     motivos.ts RN-013 · resumo.ts RN-014 · status.ts (PENDENT
          +E derivado)                                                   
       90            │
       85 -          ▼ Resultado (Centavos, valores brutos de eco)       
       91 +          ▼ Resultado (Centavos, Conversao, ecos brutos, polit
          +ica)                                                          
       92  io/saida (JSON.rawJSON) ─► cli grava o arquivo ─► exit 0
       93  ```
       94  
       89 -**Fronteiras:** só `src/cli.ts` e `src/io/` fazem E/S e conhec
          -em JSON.                                                      
       90 -`src/nucleo/` é feito de funções puras: recebe `Entrada` e dev
          -olve                                                          
       91 -`Resultado`, sem ler relógio, disco nem ambiente. Por isso qua
          -se todos os                                                   
       92 -testes rodam em memória, e uma mudança de regra fica dentro de
          - uma etapa do                                                 
       93 -núcleo. A ordem da seção 8 vive **só** em `motor.ts`: mudar a 
          -ordem é mudar                                                 
       94 -uma lista, e não caçar condicionais espalhadas.               
       95 +**Fronteiras:** só `src/cli.ts` e `src/io/` fazem E/S e conhec
          +em JSON e                                                     
       96 +caminhos. `src/nucleo/` é feito de funções puras: recebe `Entr
          +ada`,                                                         
       97 +`Politica` e `Cambio` e devolve `Resultado`, sem ler relógio, 
          +disco nem                                                     
       98 +ambiente. A ordem da seção 8 vive **só** em `motor.ts`.       
       99  
       96 -Estrutura de pastas:                                          
      100 +**O que muda em cada módulo** (para as tasks da v4):          
      101  
      102 +| Módulo | v1 | v4 |                                          
      103 +|---|---|---|                                                 
      104 +| `io/externos.ts` | — | **novo**: caminhos fixos (R-11) e lei
          +tura dos dois arquivos, com a mensagem que cita o arquivo |   
      105 +| `io/politica.ts`, `io/cambio.ts` | — | **novos**: validação 
          +e conversão para `Politica` / `Cambio` (R-12, R-14) |         
      106 +| `io/entrada.ts` | RN-015 | + `centro_custo` (tipo, vazio → `
          +null`) |                                                      
      107 +| `io/saida.ts` | 10 campos por item | 14 campos na ordem da §
          +4, bloco `politica`, resumo novo (R-17) |                     
      108 +| `cli.ts` | lê 1 arquivo | lê 3 (entrada → tabela → câmbio), 
          +mesma interface; resumo no stdout inclui o pendente |         
      109 +| `nucleo/politica.ts` | constantes da v3 | `LIMIAR_APROVACAO`
          + + montagem da `TabelaAplicavel` (RN-016) |                   
      110 +| `nucleo/decimal.ts` | — | **novo**: `Decimal`, `dividirMeioP
          +araPar` (R-13) |                                              
      111 +| `nucleo/dinheiro.ts` | `paraCentavos` | passa a usar `dividi
          +rMeioParaPar` |                                               
      112 +| `nucleo/cambio.ts` | — | **novo**: busca da cotação e conver
          +são (RN-017, R-14) |                                          
      113 +| `nucleo/texto.ts` | `normalizar`, `normalizarFornecedor` | +
          + `normalizarMoeda` |                                          
      114 +| `nucleo/despesa.ts` | RN-003 | + `moeda` (RN-003, AMB-036), 
          +`valorOriginal`, `conversao` |                                
      115 +| `nucleo/elegibilidade.ts` | etapas 3-7, `POLITICA` | etapas 
          +3-8 pela `TabelaAplicavel`; + câmbio (etapa 6); duplicata com 
          +moeda e valor original; NF sobre reais com `Decimal` |        
      116 +| `nucleo/viagem.ts`, `diarias.ts` | `categoria === 'hospedage
          +m'` | `periodicidade === 'diaria'` (R-15) |                   
      117 +| `nucleo/limites.ts` | `POLITICA`, `throw` se inexato | limit
          +e da tabela; ampliação por percentual, meio para o par (AMB-03
          +3) |                                                          
      118 +| `nucleo/motor.ts` | 2 passadas, etapas 1-9 | mesmas 2 passad
          +as; etapas 1-11; recebe `Politica` e `Cambio` |               
      119 +| `nucleo/motivos.ts` | 9 modelos | 11 modelos; conversão e CC
          + nas descrições; nome de categoria com fallback (R-15) |      
      120 +| `nucleo/status.ts`, `resumo.ts` | 3 status | + PENDENTE; tot
          +ais pendentes (R-16) |                                        
      121 +| `nucleo/tipos.ts` | `Categoria` fechada | tipos da v4 (`data
          +-model.md`) |                                                 
      122 +                                                              
      123 +Estrutura de pastas (novos na v4 marcados com `+`):           
      124 +                                                              
      125  ```
      126 +dados/                                                        
      127 ++ politica.json               # local fixo (R-11); cópia de ex
          +emplos/envelope/politica-v4.json                              
      128 ++ cambio.json                 # local fixo (R-11); cópia de ex
          +emplos/envelope/cambio.json                                   
      129  src/
      130    cli.ts                      # parseArgs, lê/grava arquivos, 
           códigos de saída
      131    io/json.ts                  # parse com NumeroJson; serializ
           ação com rawJSON
      132    io/entrada.ts               # RN-015 → Entrada | ErroEntrada
      133 ++ io/externos.ts              # caminhos fixos e leitura dos d
          +ois arquivos                                                  
      134 ++ io/politica.ts              # RN-015/RN-016 → Politica      
      135 ++ io/cambio.ts                # RN-015/RN-017 → Cambio (índice
          +)                                                             
      136 +  io/saida.ts                                                 
      137    nucleo/
      138      tipos.ts  politica.ts  dinheiro.ts  datas.ts  texto.ts
      139 +  + decimal.ts  cambio.ts                                     
      140      despesa.ts  elegibilidade.ts  viagem.ts  diarias.ts  limit
           es.ts
      106 -    motivos.ts  resumo.ts  motor.ts                           
      141 +    motivos.ts  resumo.ts  status.ts  motor.ts                
      142  tests/
      108 -  infra.test.ts               # runtime (rawJSON, context.sour
          -ce)                                                           
      109 -  nucleo/rn-001-arredondamento.test.ts … rn-014-resumo.test.ts
          -   # um arquivo por RN                                        
      110 -  nucleo/politica.test.ts  datas.test.ts  dinheiro.test.ts    
          -    # Infra › (sem regra)                                     
      111 -  io/rn-015-entrada.test.ts   # a RN-015 vive em io/entrada.ts
      143 +  apoio.ts                    # + fixture: tabela e câmbio de 
          +exemplos/envelope/ (R-10)                                     
      144 +  nucleo/rn-001 … rn-014      # um arquivo por RN (existentes,
          + ajustados à v4)                                              
      145 ++ nucleo/rn-016-politica-centro-custo.test.ts                 
      146 ++ nucleo/rn-017-cambio.test.ts                                
      147 ++ nucleo/rn-018-aprovacao.test.ts                             
      148 +  nucleo/politica.test.ts     # Infra › passa a testar decimal
          +/tabela sem regra                                             
      149 +  io/rn-015-entrada.test.ts   # + centro_custo e arquivos exte
          +rnos inválidos                                                
      150    io/json.test.ts  io/saida.test.ts
      113 -  casos-de-borda.test.ts      # uma linha da seção 7 = um test
          -e                                                             
      114 -  exemplo.test.ts             # tabela da seção 9             
      115 -  contrato-saida.test.ts      # saida.schema.json             
      116 -  cli.test.ts                 # ponta a ponta: sucesso, RN-015
          -, determinismo                                                
      117 -  rastreabilidade.test.ts     # spec.md × nomes de teste      
      151 +  casos-de-borda.test.ts      # uma linha da seção 7 = um test
          +e (121 linhas)                                                
      152 +  exemplo.test.ts             # as três tabelas da seção 9    
      153 +  contrato-saida.test.ts                                      
      154 +  cli.test.ts                 # + cópia temporária com dados/ 
          +trocado (R-11)                                                
      155 +  rastreabilidade.test.ts                                     
      156  ```
      157  
      158  ## 3. Modelo de dados
      159  
      122 -Detalhado em [`data-model.md`](data-model.md). Resumo:        
      160 +Detalhado em [`data-model.md`](data-model.md). Resumo do que m
          +uda na v4:                                                    
      161  
      124 -- A despesa passa por estados tipados: `DespesaBruta` → `Despe
          -saValida` →                                                   
      125 -  `DespesaElegivel` → alocada. Em qualquer etapa ela pode vira
          -r `Recusa`                                                    
      126 -  com um código. A primeira recusa encerra a avaliação (seção 
          -8).                                                           
      127 -- A hospedagem vira N `Parcela`s (uma por noite). As outras ca
          -tegorias viram                                                
      128 -  uma parcela. O limite (etapa 9) só enxerga parcelas, então h
          -ospedagem e                                                   
      129 -  alimentação seguem o mesmo caminho de cálculo.              
      130 -- `ResultadoItem` guarda os valores em `Centavos` e os ecos br
          -utos. O                                                       
      131 -  `status` é **derivado** dos valores (reembolsável = solicita
          -do → APROVADO                                                 
      132 -  etc.) e nunca é guardado separado.                          
      133 -- A justificativa (`Motivo`) é montada a partir do código e do
          -s números que                                                 
      134 -  a etapa decisiva devolveu: limite, saldo, corte, `id` aceito
          - da duplicata.                                                
      162 +- **Entram `Politica`, `Cambio` e `TabelaAplicavel`.** A tabel
          +a aplicável é                                                 
      163 +  montada uma vez (RN-016) e é a única fonte de limite, catego
          +ria reconhecida                                               
      164 +  e periodicidade dentro do núcleo.                           
      165 +- **`Categoria` vira texto.** Uma categoria nova no arquivo   
      166 +  (`representacao`) funciona sem mudar tipo nem código (R-15).
      167 +- **`Conversao | null`** junta `taxa`, `dataCotacao` e `valorS
          +olicitado`. A                                                 
      168 +  AMB-043 (os três andam juntos) fica garantida pelo tipo (R-1
          +7).                                                           
      169 +- **O que não muda:** os estados tipados (`DespesaBruta` → `De
          +spesaValida` →                                                
      170 +  `DespesaElegivel` → alocada, com `Recusa` em qualquer etapa)
          +, as parcelas                                                 
      171 +  (DT-003) e o status derivado (agora com PENDENTE, R-16).    
      172  
      173  ## 4. Como a política é representada
      174  
      138 -**Um módulo de constantes tipadas, `src/nucleo/politica.ts`**,
          - e em nenhum                                                  
      139 -outro lugar aparece número mágico de regra:                   
      175 +**Lida de fora, a cada execução** (RN-016, AMB-028). `io/polit
          +ica.ts` valida                                                
      176 +`dados/politica.json` e devolve `Politica`. `nucleo/politica.t
          +s` monta a                                                    
      177 +`TabelaAplicavel` do colaborador:                             
      178  
      179  ```ts
      142 -export const POLITICA = {                                     
      143 -  limites: {                                                  
      144 -    alimentacao:       { diario: 60_00n,  ampliaEmViagem: true
          -  }, // RN-009                                                
      145 -    transporte_urbano: { diario: 80_00n,  ampliaEmViagem: true
          -  }, // RN-009                                                
      146 -    hospedagem:        { diario: 250_00n, ampliaEmViagem: fals
          -e }, // RN-009, AMB-020                                       
      147 -  },                                                          
      148 -  fatorViagem: { num: 3n, den: 2n },                          
          -     // RN-011                                                
      149 -  limiarNotaFiscal: 100_00n,                                  
          -     // RN-008 (estritamente maior)                           
      150 -} as const;                                                   
      180 +// nucleo/politica.ts (esboço)                                
      181 +export const LIMIAR_APROVACAO = 500_00n; // RN-018, AMB-040 (e
          +stritamente maior)                                            
      182 +                                                              
      183 +export function tabelaAplicavel(politica: Politica, centroCust
          +o: string | null): TabelaAplicavel;                           
      184 +// RN-016: sem CC ou sem entrada → padrão inteiro; com entrada
          + → CC por cima do padrão;                                     
      185 +// limite 0 do CC não herda (AMB-031).                        
      186  ```
      187  
      153 -Mudar um valor da política exige mudar a spec e depois uma lin
          -ha neste                                                      
      154 -arquivo. As categorias reconhecidas (RN-006) são as chaves de 
          -`limites`, e                                                  
      155 -não existe uma segunda lista para manter sincronizada.        
      188 +Nenhum limite, limiar de nota fiscal ou percentual existe no c
          +ódigo. O                                                      
      189 +`LIMIAR_APROVACAO` é o único número de política que resta, por
          +que a spec o                                                  
      190 +fixa e a tabela não o traz (AMB-040). Se o financeiro passar a
          + mantê-lo na                                                  
      191 +tabela (§10 da spec), ele sai daqui.                          
      192  
      157 -**Descartado:** arquivo de configuração externo (JSON/YAML). E
          -le exigiria                                                   
      158 -validação própria e um parâmetro de CLI que a interface fixa n
          -ão tem, e o                                                   
      159 -desafio não pede política configurável em tempo de execução. S
          -e a mudança de                                                
      160 -requisito pedir isso, a troca fica restrita a quem monta `POLI
          -TICA`.                                                        
      193 +**Substitui** a decisão da v1 (constantes em `POLITICA`, "arqu
          +ivo externo                                                   
      194 +descartado"). Aquela decisão já dizia que, se a mudança pediss
          +e política                                                    
      195 +configurável, "a troca fica restrita a quem monta `POLITICA`".
          + Foi o que                                                    
      196 +aconteceu: quem consumia `POLITICA` (elegibilidade, limites, `
          +tipos.ts`) passa                                              
      197 +a receber a `TabelaAplicavel`.                                
      198  
      199  ## 5. Decisões técnicas
      200  
     ...
      210  falham nos pontos médios; `decimal.js`, dependência sem ganho.
      211  **Consequência:** fácil: exatidão garantida e testável por tab
           ela. Difícil:
      212  todo número do JSON chega embrulhado, e o núcleo nunca pode us
           ar
      176 -`typeof x === 'number'`. Isso fica concentrado em `despesa.ts`
          -.                                                             
      213 +`typeof x === 'number'`. **(v4)** A tabela e o câmbio herdam i
          +sso de graça, e                                               
      214 +taxa e percentual ganham o `Decimal` (DT-007).                
      215  
      216  ### DT-002 — Núcleo puro com a ordem da seção 8 num lugar só
      217  
      180 -**Contexto:** a seção 8 define 9 etapas em que a primeira recu
          -sa encerra a                                                  
      181 -avaliação. A etapa 6 (duplicata) depende do que passou das eta
          -pas 1 a 5, e a                                                
      182 -etapa 8 (viagem) depende de todas as hospedagens elegíveis.   
      218 +**Contexto:** a seção 8 define 11 etapas em que a primeira rec
          +usa encerra a                                                 
      219 +avaliação. A duplicata depende do que passou das etapas anteri
          +ores, e os                                                    
      220 +dias de viagem dependem de todas as hospedagens elegíveis.    
      221  **Decisão:** `motor.ts` faz duas passadas. A **passada 1** per
           corre as
      184 -despesas na ordem e aplica as etapas 1 a 7 (validação e elegib
          -ilidade), com                                                 
      185 -o estado acumulado de ids vistos e chaves de duplicata. Um `id
          -` só entra nos                                                
      186 -ids vistos quando a despesa passa da etapa 2, mesmo que seja r
          -ecusada numa                                                  
      187 -etapa posterior (AMB-025). A **passada 2** usa as             
      188 -elegíveis: calcula os dias de viagem, gera as parcelas e conso
          -me os saldos.                                                 
      222 +despesas na ordem e aplica as etapas 1 a 8 (validação, convers
          +ão e                                                          
      223 +elegibilidade), com o estado acumulado de ids vistos e chaves 
          +de duplicata.                                                 
      224 +Um `id` só entra nos ids vistos quando a despesa passa da etap
          +a 2 (AMB-025).                                                
      225 +A **passada 2** usa as elegíveis: dias de viagem (9), parcelas
          + e saldos (10)                                                
      226 +e aprovação manual (11).                                      
      227  **Alternativa descartada:** um pipeline genérico de "regras pl
           ugáveis".
      190 -Com uma ordem fixa e conhecida, seria abstração sem uso, e o F
          -AQ alerta para                                                
      191 -isso.                                                         
      192 -**Consequência:** fácil: incluir, remover ou reordenar uma eta
          -pa de                                                         
      193 -elegibilidade. Difícil: uma regra que precise de informação da
          - passada 2                                                    
      194 -dentro da passada 1. Hoje nenhuma precisa.                    
      228 +**Consequência:** **(v4)** a nova etapa 6 (câmbio) entrou na c
          +adeia `??` da                                                 
      229 +passada 1 como uma linha, e a etapa 11 como um passo no fim da
          + passada 2.                                                   
      230 +Nenhuma etapa existente mudou de lugar relativo.              
      231  
      232  ### DT-003 — Hospedagem entra no limite como parcelas
      233  
      234  **Contexto:** a RN-012 divide a hospedagem por noite, e cada n
           oite disputa o
      235  limite daquela data com outras hospedagens, na ordem da entrad
           a.
      236  **Decisão:** toda despesa elegível vira uma lista de `Parcela`
           s (N para
      201 -hospedagem, 1 para as demais). `limites.ts` só conhece parcela
          -s e soma o que                                                
      202 -cada uma recebeu por `indiceDespesa`.                         
      237 +periodicidade `diaria`, 1 para `dia`). `limites.ts` só conhece
          + parcelas e                                                   
      238 +soma o que cada uma recebeu por `indiceDespesa`. **(v4)** A pa
          +rcela é do                                                    
      239 +valor **em reais** (`conversao.valorSolicitado`).             
      240  **Alternativa descartada:** um caminho especial para hospedage
           m em
      204 -`limites.ts`, que duplicaria a lógica de saldo e ordem.       
      205 -**Consequência:** o exemplo de sobreposição da RN-012 (`h1`/`h
          -2`) sai sem                                                   
      206 -código específico. O status de hospedagem vem da soma das parc
          -elas.                                                         
      241 +`limites.ts`.                                                 
      242 +**Consequência:** o `e-007` (3 × 400,00 no CC-COMERCIAL) e o c
          +aso "Pendente                                                 
      243 +consome o limite" saem sem código específico.                 
      244  
      245  ### DT-004 — Saída cria o arquivo só no fim
      246  
      210 -**Contexto:** a RN-015 exige que nenhum arquivo de saída seja 
          -gerado em erro.                                               
      211 -**Decisão:** ler, validar, calcular e serializar tudo em memór
          -ia. Só então                                                  
      212 -chamar `writeFile`. Um erro de entrada lança `ErroEntrada`, qu
          -e o `cli.ts`                                                  
      213 -converte em `stderr` + código 1.                              
      247 +**Contexto:** a RN-015 exige que nenhum arquivo de saída seja 
          +gerado em erro,                                               
      248 +agora também quando a tabela ou o câmbio são inválidos.       
      249 +**Decisão:** ler e validar os **três** arquivos, calcular e se
          +rializar tudo em                                              
      250 +memória. Só então chamar `writeFile`. Qualquer erro de leitura
          + lança                                                        
      251 +`ErroEntrada`, que o `cli.ts` converte em `stderr` + código 1.
      252  **Alternativa descartada:** gravar em streaming (deixaria saíd
           a parcial).
      253  **Consequência:** o arquivo inteiro fica em memória, o que é i
           rrelevante no
      254  volume do problema.
     ...
      256  ### DT-005 — Teste de rastreabilidade automático
      257  
      258  **Contexto:** a seção 9 exige teste para cada RN e para cada l
           inha da seção 7.
      221 -**Decisão:** `rastreabilidade.test.ts` extrai da spec os IDs  
      222 -`### RN-NNN` e os nomes da 1ª coluna da tabela da seção 7, e c
          -onfere se                                                     
      223 -cada um aparece em algum título de teste (`RN-NNN ›` ou `Borda
          - › <nome>`).                                                  
      224 -**Alternativa descartada:** matriz mantida à mão só no `tasks.
          -md`, que                                                      
      225 -desatualiza em silêncio.                                      
      226 -**Consequência:** um caso de borda novo na spec (ex.: no envel
          -ope do Dia 2)                                                 
      227 -deixa a suíte vermelha até ganhar teste. Isso é intencional.  
      259 +**Decisão:** `rastreabilidade.test.ts` extrai da spec os IDs `
          +### RN-NNN` e                                                 
      260 +os nomes da 1ª coluna da tabela da seção 7, e confere se cada 
          +um aparece em                                                 
      261 +algum título de teste (`RN-NNN ›` ou `Borda › <nome>`).       
      262 +**Consequência:** **(v4)** confirmado na prática. Assim que a 
          +spec 2.x                                                      
      263 +entrou, a suíte passou a acusar RN-016 a RN-018 e os casos de 
          +borda novos sem                                               
      264 +teste, sem nenhuma mudança no teste de rastreabilidade.       
      265  
      266 +### DT-006 — Arquivos externos em local fixo, lidos só pela ca
          +mada `io` (novo na v4)                                        
      267 +                                                              
      268 +**Contexto:** a v4 manda ler a política de fora (item A), a in
          +terface é fixa                                                
      269 +(AMB-028), e o núcleo não pode fazer E/S.                     
      270 +**Decisão:** `io/externos.ts` conhece os caminhos (`dados/*.js
          +on`, resolvidos                                               
      271 +pelo código, R-11) e lê os arquivos. `io/politica.ts` e `io/ca
          +mbio.ts`                                                      
      272 +validam (R-12). O núcleo recebe `Politica` e `Cambio` já tipad
          +os, como                                                      
      273 +recebe `Entrada`. A `TabelaAplicavel` é montada no núcleo, por
          +que é regra                                                   
      274 +(RN-016), e não formato de arquivo.                           
      275 +**Alternativa descartada:** o núcleo ler os arquivos (quebra a
          + pureza e                                                     
      276 +obriga todo teste de regra a tocar em disco); montar a tabela 
          +aplicável na                                                  
      277 +camada `io` (regra de negócio fora do núcleo).                
      278 +**Consequência:** fácil: trocar o local fixo por um serviço (§
          +10 da spec,                                                   
      279 +AMB-028) é trocar só `io/externos.ts`. Os testes de regra pass
          +am `Politica` e                                               
      280 +`Cambio` em memória. Difícil: o teste de CLI com outra tabela 
          +precisa copiar                                                
      281 +o projeto para uma pasta temporária (R-11).                   
      282 +                                                              
      283 +### DT-007 — Conversão calculada na etapa 1, recusa na etapa 6
          + (novo na v4)                                                 
      284 +                                                              
      285 +**Contexto:** a seção 8 manda calcular a conversão no início (
          +etapa 1), para                                                
      286 +que período, nota fiscal e limite usem reais, mas recusar por 
          +falta de                                                      
      287 +cotação só na etapa 6 (AMB-039). A AMB-043 manda os três campo
          +s de conversão                                                
      288 +saírem juntos.                                                
      289 +**Decisão:** `nucleo/cambio.ts` expõe `converter(valorOriginal
          +, moeda, data,                                                
      290 +cambio): Conversao | null`, chamada por `despesa.ts` durante a
          + etapa 1 (e                                                   
      291 +também para os itens `DADO_INVALIDO` com `valor` numérico, seç
          +ão 4). A etapa 6                                              
      292 +de `elegibilidade.ts` só olha se `conversao` é `null`. A conta
          + usa `Decimal`                                                
      293 +e `dividirMeioParaPar` (R-13).                                
      294 +**Alternativa descartada:** converter só na etapa 6 (período e
          + nota fiscal                                                  
      295 +precisariam de dois caminhos, um com e outro sem reais); três 
          +campos opcionais                                              
      296 +soltos (permitiria taxa sem valor, contra a AMB-043).         
      297 +**Consequência:** um item recusado antes da etapa 6 já sai com
          + a conversão                                                  
      298 +correta, ou com os três nulos se não há cotação (seção 4, "Est
          +rangeira fora do                                              
      299 +período").                                                    
      300 +                                                              
      301 +### DT-008 — Aprovação manual como troca de motivo depois do l
          +imite (novo na v4)                                            
      302 +                                                              
      303 +**Contexto:** a RN-018 diz que o item PENDENTE consome limite,
          + gera viagem e                                                
      304 +mantém o valor calculado. Só o status e o motivo mudam.       
      305 +**Decisão:** a etapa 11 é um `map` sobre as alocações da etapa
          + 10: se                                                       
      306 +`reembolsável > LIMIAR_APROVACAO`, o motivo vira `REQUER_APROV
          +ACAO`, com os                                                 
      307 +detalhes do limite (para citar o corte). O status é derivado (
          +R-16), então                                                  
      308 +não há campo a atualizar.                                     
      309 +**Alternativa descartada:** tirar o PENDENTE da alocação (devo
          +lveria saldo,                                                 
      310 +contra a RN-018); decidir a pendência dentro de `limites.ts` (
          +misturaria "quanto                                            
      311 +pagar" com "quem aprova", duas etapas da seção 8).            
      312 +**Consequência:** a hospedagem PENDENTE gera dias de viagem se
          +m código                                                      
      313 +especial, porque a etapa 9 vem antes da 11.                   
      314 +                                                              
      315  ## 6. Estratégia de testes
      316  
      317  - **Nível:** ~80% testes do núcleo em memória (uma função ou o
            `motor`
      232 -  com despesas montadas no teste); ~15% ponta a ponta do motor
          - (exemplo,                                                    
      233 -  contrato); ~5% CLI por processo filho (sucesso, RN-015, dete
          -rminismo,                                                     
      234 -  códigos de saída).                                          
      318 +  com despesas montadas no teste); ~15% ponta a ponta do motor
          + (os três                                                     
      319 +  exemplos, contrato); ~5% CLI por processo filho (sucesso, RN
          +-015,                                                         
      320 +  determinismo, códigos de saída, local fixo).                
      321 +- **Fixture da v4 (R-10):** `tests/apoio.ts` carrega          
      322 +  `exemplos/envelope/politica-v4.json` e `exemplos/envelope/ca
          +mbio.json` uma                                                
      323 +  vez e usa como padrão em `entrada()`/`rodar()`, com a opção 
          +de passar um                                                  
      324 +  centro de custo, outra tabela ou outro câmbio. Sem `centro_c
          +usto` e sem                                                   
      325 +  `moeda`, a despesa usa a tabela padrão e BRL, então **os tes
          +tes da v1                                                     
      326 +  continuam valendo sem mudar a expectativa** (RN-009: "os cas
          +os de borda que                                               
      327 +  não citam centro de custo usam a tabela padrão").           
      328  - **Cada `RN-NNN` tem teste?** Sim, **exatamente um arquivo po
           r RN**,
      329    `rn-0NN-<tema>.test.ts` (em `tests/nucleo/`, ou em `tests/io
           /` para a
      237 -  RN-015), com `describe('RN-0NN — <título da spec>')`. Todo t
          -este de unidade                                               
      238 -  ou do motor em memória cujo título começa por `RN-0NN ›` fic
          -a no arquivo                                                  
      239 -  dessa RN, inclusive os que montam várias despesas e chamam o
          - motor. Só os                                                 
      240 -  testes ponta a ponta (`exemplo`, `contrato-saida`, `cli`, `i
          -o/saida`) citam                                               
      241 -  RNs fora do arquivo delas. Os critérios de **Aceite** da    
      242 -  spec viram testes literais. O `rastreabilidade.test.ts` gara
          -nte isso.                                                     
      330 +  RN-015), com `describe('RN-0NN — <título da spec>')`. Na v4 
          +entram                                                        
      331 +  `rn-016-politica-centro-custo`, `rn-017-cambio` e `rn-018-ap
          +rovacao`. Os                                                  
      332 +  aceites de RN que mudaram na spec 2.x (RN-001, RN-002, RN-00
          +3, RN-004,                                                    
      333 +  RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-0
          +14, RN-015)                                                   
      334 +  ganham testes nos arquivos que já existem. Os aceites da val
          +idação dos                                                    
      335 +  arquivos externos (tabela e câmbio inválidos) ficam em      
      336 +  `io/rn-015-entrada.test.ts`, com título `RN-015 › ...`, porq
          +ue a                                                          
      337 +  consequência é a da RN-015 (execução abortada).             
      338  - **Casos de borda da seção 7:** `casos-de-borda.test.ts`, com
            um `it` por
      244 -  linha da tabela e o título **idêntico** à coluna "Caso"     
      245 -  (`Borda › Três casas decimais`).                            
      246 -- **Nomenclatura:** `RN-010 › d-001 e d-002 em 03/07: 1ª PARCI
          -AL 60,00, 2ª ESGOTADO`.                                       
      247 -  O ID no início fecha a cadeia spec → teste. O nome do arquiv
          -o repete o ID                                                 
      248 -  (`rn-010-parcial.test.ts`), o que facilita o `grep`.        
      249 -- **Exemplo oficial:** `exemplo.test.ts` compara item a item c
          -om a tabela da                                                
      250 -  seção 9 e com o resumo esperado.                            
      339 +  linha da tabela e o título **idêntico** à coluna "Caso". Os 
          +que citam o                                                   
      340 +  arquivo externo (tabela inválida, câmbio ausente, moeda repe
          +tida) testam a                                                
      341 +  função de `io/` com o texto do arquivo; o de câmbio ausente 
          +também roda no                                                
      342 +  CLI.                                                        
      343 +- **Nomenclatura:** `RN-017 › e-004 (30,00 EUR no sábado 18/07
          +) → taxa 5,96 de 17/07, R$ 178,80`.                           
      344 +- **Exemplos oficiais:** `exemplo.test.ts` compara item a item
          + com as **três**                                              
      345 +  tabelas da seção 9 e os três resumos, com a tabela e o câmbi
          +o de                                                          
      346 +  `exemplos/envelope/` (o critério da §9 cita esses arquivos).
      347 +- **Local fixo e "sem mudar o sistema" (§9):** `cli.test.ts` c
          +opia `src/`,                                                  
      348 +  `dados/` e `package.json` para uma pasta temporária, troca  
      349 +  `dados/politica.json` (um limite) e confere que o resultado 
          +muda. Também:                                                 
      350 +  câmbio ausente e tabela inválida → código 1, nenhuma saída; 
          +CLI chamado de                                                
      351 +  outra pasta lê o mesmo `dados/`.                            
      352  
      353  ## 7. Riscos
      354  
      355  | Risco | Probabilidade | O que faço se acontecer |
      356  |---|---|---|
      256 -| Mudança do Dia 2 altera um valor da política ou acrescenta c
          -ategoria | alta | spec → DECISIONS → uma linha em `politica.ts
          -` + testes da RN afetada |                                    
      257 -| Limite ampliado com centavos fracionários (ex.: limite 60,01
          - × 1,5 = 90,015) numa política futura | média | hoje todos são
          - exatos. Se acontecer, parar e levar à spec a regra de arredon
          -damento do limite (não decidir no código) |                   
      258 -| Mudança do Dia 2 cria um campo de viagem na entrada | média 
          -| trocar só `viagem.ts`. A etapa 8 já é isolada (AMB-007 prevê
          - a troca) |                                                   
      357 +| O financeiro troca `dados/politica.json` por um arquivo com 
          +campo novo ou formato diferente | média | a validação (R-12, A
          +MB-044) aborta com mensagem que cita o campo. Se o campo novo 
          +for regra (ex.: limiar de aprovação na tabela, §10), levar à s
          +pec antes |                                                   
      358 +| `dados/` divergir de `exemplos/envelope/` sem ninguém perceb
          +er | média | os testes de regra e dos exemplos não leem `dados
          +/` (R-10). O quickstart manda conferir com `git status dados/`
          +. O README explica o papel de cada pasta |                    
      359 +| Percentual de viagem com muitas casas (ex.: 33,333…) | baixa
          + | `Decimal` exato + meio para o par (AMB-033). Coberto por te
          +ste de `decimal.ts` |                                         
      360 +| Categoria nova no arquivo sem nome bonito na descrição | alt
          +a | fallback para a chave (R-15). A descrição é orientativa (§
          +4) |                                                          
      361 +| Moeda com 0 ou 3 casas (JPY, KWD) | baixa | a spec já decide
          +: arredonda para 2 casas (§10). Nada a fazer no código |      
      362  | `JSON.rawJSON` ou `context.source` indisponível no Node do a
           valiador | baixa | `engines: node >= 24` no `package.json` + v
           erificação no início do `cli.ts` com mensagem clara |
      363  | TypeScript 7 incompatível com `erasableSyntaxOnly`/`allowImp
           ortingTsExtensions` | baixa | fixar `typescript@5.9` (só afeta
            o typecheck, não a execução) |
      364  | `ajv` e `multipleOf: 0.01` com float dão falso negativo (`0.
           07`) | média | `multipleOfPrecision: 2` na instância de teste 
           |
      365  | `"999999 diarias"` gera ~1M de parcelas | baixa | aceitável.
            Se virar problema, levar à spec um teto de N |
      366 +                                                              
      367 +Riscos da v1 que **se resolveram** na v4: "limite ampliado com
          + centavos                                                     
      368 +fracionários" (a AMB-033 definiu o arredondamento; o `throw` d
          +e `limites.ts`                                                
      369 +sai) e "mudança do Dia 2 altera um valor da política" (a polít
          +ica saiu do                                                   
      370 +código).                                                      
      371 +                                                              
      372 +## 8. O que a arquitetura absorveu e o que resistiu (para o re
          +latório)                                                      
      373 +                                                              
      374 +**Absorveu sem mudança de forma:**                            
      375 +- Etapa nova de câmbio: uma linha na cadeia de etapas da passa
          +da 1 (DT-002).                                                
      376 +- Hospedagem por noite no CC-COMERCIAL, `e-007` e "pendente co
          +nsome o                                                       
      377 +  limite": o caminho de parcelas (DT-003) já resolvia.        
      378 +- Leitura exata de limites, taxas e percentuais: o `NumeroJson
          +` (DT-001).                                                   
      379 +- PENDENTE: o status já era derivado, então foi uma condição a
          + mais em                                                      
      380 +  `statusDe` (R-16).                                          
      381 +- Os testes da v1: a tabela padrão da v4 tem os valores da v3,
          + e a fixture                                                  
      382 +  padrão os mantém verdes.                                    
      383 +- A rastreabilidade (DT-005) passou a cobrar os testes novos s
          +ozinha.                                                       
      384 +                                                              
      385 +**Resistiu (onde o custo está):**                             
      386 +- `Categoria` como união fechada, derivada das chaves de `POLI
          +TICA`: estava                                                 
      387 +  em `tipos.ts`, `elegibilidade.ts`, `limites.ts`, `motivos.ts
          +` e no                                                        
      388 +  `tests/apoio.ts`. Virou texto + `TabelaAplicavel` (R-15).   
      389 +- `POLITICA` importada direto por quem calculava: cada consumi
          +dor passou a                                                  
      390 +  receber a tabela como parâmetro.                            
      391 +- `valorSolicitado` era ao mesmo tempo "o valor da entrada" e 
          +"o valor em                                                   
      392 +  reais". Separar em `valorOriginal` + `Conversao` toca valida
          +ção,                                                          
      393 +  duplicata, nota fiscal, parcelas, resumo e saída.           
      394 +- A saída ganhou quatro campos por item e o bloco `politica`: 
          +schema,                                                       
      395 +  `io/saida.ts` e o teste de contrato.                        

● I'll check the edge-case counts I cited against the spec.

  Ran 1 shell command (ctrl+o to expand)

● I updated the plan to v2.0 for the v4 policy. Before writing it, I stopped on
  three gaps in the spec and put your answers into the spec first.

  Branch: 001-motor-reembolso · Plan: plan.md
  (specs/001-motor-reembolso/plan.md) (v2.0, based on spec 2.2)

  Spec changes before the plan (spec 2.1 → 2.2, decision D-021)

  - AMB-042: the exchange file's currency code is also compared without regard
    to case ("usd" = USD).
  - AMB-043: valor_solicitado, taxa_cambio and data_cotacao are null together
    whenever no conversion happened. This includes BRL with an invalid valor. My
    recommendation was different; I followed your choice.
  - AMB-044: every field in the §4 tables is required and must have the declared
    type. Informative fields and unknown fields are ignored.
  - 5 new edge cases in §7 (the table now has 121 rows) and 3 new entries in
    Clarifications.

  Needs your confirmation: in AMB-042 I added a rule you didn't state. If "usd"
  and "USD" appear on the same date in the exchange file, the file is rejected.
  I based this on how RN-016 treats categories that end up identical after
  normalization. It's marked in D-021 as a point to confirm.

  Generated artifacts

  - plan.md (specs/001-motor-reembolso/plan.md):
    - The policy is now read from outside. Only the fixed R$ 500 limit stays in
      the code, in politica.ts.
    - Three new technical decisions: DT-006 (external files), DT-007 (conversion
      is calculated in step 1, refusal happens in step 6) and DT-008 (pending
      status is only a change of reason code).
    - A table of what changes in each module.
    - §8, "what the architecture absorbed and what resisted", for the report the
      envelope asks for.
  - research.md (specs/001-motor-reembolso/research.md): R-01 to R-10 are
    adjusted, and R-11 to R-17 are new:
    - The two external files live in a fixed location: dados/politica.json and
      dados/cambio.json. The path is resolved from the code, so it doesn't
      depend on the folder the command runs from.
    - Exchange rates and the travel percentage use an exact decimal type built
      on bigint, with a single half-to-even rounding.
    - The exchange data is indexed so the most recent rate on or before the
      expense date is found quickly.
    - Categories become plain text.
  - data-model.md (specs/001-motor-reembolso/data-model.md): adds the policy
    table, the exchange data, the applicable table and the conversion result.
    The conversion fields are one nullable value, so the types enforce AMB-043.
  - Contracts:
    - cli.md (specs/001-motor-reembolso/contracts/cli.md): updated.
    - arquivos-externos.md
      (specs/001-motor-reembolso/contracts/arquivos-externos.md): new.
    - saida.schema.json (specs/001-motor-reembolso/contracts/saida.schema.json):
      v2.2, with AMB-043 and "PENDENTE ⇔ REQUER_APROVACAO" written as schema
      conditions.
  - quickstart.md (specs/001-motor-reembolso/quickstart.md): the three §9 files,
    and swapping the table in dados/ with no code change.

  Constitution check: no violations, before or after the design phase.
  .specify/extensions.yml doesn't exist, so there were no hooks to run.

  I didn't commit anything. Next steps:
  1. Commit as docs(spec): and docs(plan):.
  2. Run /speckit-tasks to create T-043 onward. The dados/ folder, the new test
     files and the README update all come from those tasks.

> <ide_opened_file>The user opened the file
  d:\Usuario\Projetos\Dev\Apps\sdd-desafio\specs\001-motor-reembolso\spec.md in
  the IDE. This may or may not be related to the current
  task.</ide_opened_file>

> "Needs your confirmation: in AMB-042 I added a rule you didn't state. If
  "usd" and "USD" appear on the same date in the exchange file, the file is
  rejected. " Não, use o último valor disponível

● Understood: the file isn't rejected, and the last value in the file wins. I'll
  look for every place that mentions the collision.

  Searched for 1 pattern (ctrl+o to expand)

● Update(spec.md)
  ⎿  Added 1 line, removed 1 line
      64  
      65  ### Session 2026-09-30 (plano da v4)
      66  
      67 -- Q: No arquivo de câmbio, `"usd"` é o mesmo que `USD`? → A: Si
         -m. Maiúsculas e minúsculas são irrelevantes também no arquivo. 
         -Duas moedas iguais nessa comparação, na mesma data, tornam o ar
         -quivo inválido (RN-017, AMB-042).                              
      67 +- Q: No arquivo de câmbio, `"usd"` é o mesmo que `USD`? → A: Si
         +m. Maiúsculas e minúsculas são irrelevantes também no arquivo. 
         +Se duas moedas ficam iguais nessa comparação na mesma data (`"u
         +sd"` e `"USD"`), vale a taxa da **última** que aparece no arqui
         +vo, e o arquivo não é recusado (RN-017, AMB-042).              
      68  - Q: Num item com `valor` inválido, em que a moeda e a data per
          mitiriam achar a cotação, o que sai em `taxa_cambio` e `data_co
          tacao`? → A: Nulo. Os três campos de conversão (`valor_solicita
          do`, `taxa_cambio`, `data_cotacao`) saem nulos juntos, inclusiv
          e em BRL (seção 4, AMB-043).
      69  - Q: O que torna a tabela de limites ou o câmbio inválidos além
           das listas da RN-016 e da RN-017? → A: Todo campo das tabelas 
          da seção 4 é obrigatório e tem o tipo declarado. Campos informa
          tivos e campos que não estão na seção 4 são ignorados (RN-015, 
          AMB-044).
      70  

● Update(spec.md)
  ⎿  Added 3 lines, removed 1 line
      684  limiar de nota fiscal são comparados com o valor em reais.
      685  
      686  O código de moeda do arquivo é comparado com a moeda da despes
           a sem
      687 -diferenciar maiúsculas de minúsculas: `"usd"` no arquivo é `US
          -D` (AMB-042).                                                 
      687 +diferenciar maiúsculas de minúsculas: `"usd"` no arquivo é `US
          +D`. Se a                                                      
      688 +mesma moeda aparece mais de uma vez na mesma data com grafias 
          +diferentes                                                    
      689 +(`"usd"` e `"USD"`), vale a taxa da última que aparece no arqu
          +ivo (AMB-042).                                                
      690  
      691  O arquivo de câmbio é **inválido** (RN-015) quando: não é um o
           bjeto;
      692  `moeda_base` não é `BRL`; `taxas` não é objeto; uma chave de `
           taxas` não é

  Read 1 file (ctrl+o to expand)

● Update(spec.md)
  ⎿  Added 3 lines, removed 3 lines
      691  O arquivo de câmbio é **inválido** (RN-015) quando: não é um o
           bjeto;
      692  `moeda_base` não é `BRL`; `taxas` não é objeto; uma chave de `
           taxas` não é
      693  uma data válida; o valor de uma data não é objeto; uma moeda n
           ão tem 3
      694 -letras; duas moedas da mesma data ficam iguais sem diferenciar
          - maiúsculas                                                   
      695 -(`"usd"` e `"USD"`); uma taxa não é número ou não é maior que 
          -zero; ou falta                                                
      696 -um campo da seção 4 (AMB-044).                                
      694 +letras; uma taxa não é número ou não é maior que zero (inclusi
          +ve a de uma                                                   
      695 +moeda repetida que acaba não sendo usada); ou falta um campo d
          +a seção 4                                                     
      696 +(AMB-044).                                                    
      697  **Origem:** política do RH v4, item B (AMB-035, AMB-036, AMB-0
           37, AMB-038, AMB-039, AMB-042, AMB-043, AMB-044)
      698  **Aceite:** `e-002` (22,00 EUR em 14/07) → taxa 5,93 de 14/07 
           → R$ 130,46.
      699  `e-004` (30,00 EUR no sábado 18/07) → taxa 5,96 de sexta 17/07
            →

  Read 1 file (ctrl+o to expand)

● Update(spec.md)
  ⎿  Added 8 lines, removed 7 lines
      1355  maiúsculas (AMB-036), mas nada se diz sobre o arquivo. `"usd"
            ` no arquivo casa
      1356  com `USD`? E `"usd"` e `"USD"` na mesma data?
      1357  **Decisão:** maiúsculas e minúsculas são irrelevantes também 
            no arquivo:
      1358 -`"usd"` é `USD`. Duas moedas da mesma data que ficam iguais n
           -essa comparação                                              
      1359 -tornam o arquivo inválido (RN-015).                          
      1360 -**Justificativa:** decisão do usuário: "maiúscula e minúscula
           - é irrelevante".                                             
      1361 -A invalidez da colisão foi complemento do Claude, pela mesma 
           -razão das                                                    
      1362 -categorias repetidas da RN-016: duas taxas para a mesma moeda
           - e a mesma data                                              
      1363 -não têm leitura única.                                       
      1364 -**Regra afetada:** RN-015, RN-017                            
      1358 +`"usd"` é `USD`. Se duas moedas da mesma data ficam iguais ne
           +ssa comparação,                                              
      1359 +vale a taxa da **última** que aparece no arquivo, e o arquivo
           + não é recusado.                                             
      1360 +**Justificativa:** decisão do usuário: "maiúscula e minúscula
           + é irrelevante" e,                                           
      1361 +para a repetição, "use o último valor disponível". O Claude t
           +inha proposto                                                
      1362 +recusar o arquivo, pelo critério das categorias repetidas da 
           +RN-016. O usuário                                            
      1363 +preferiu não interromper a execução por uma repetição que tem
           + leitura única:                                              
      1364 +a última entrada do arquivo é a mais recente que o financeiro
           + escreveu.                                                   
      1365 +**Regra afetada:** RN-017                                    
      1366  
      1367  ### AMB-043 — Campos de conversão num item sem valor válido
      1368  

● Update(spec.md)
  ⎿  Added 1 line, removed 1 line
      1495  | Tabela de limites inválida | limite negativo na tabela | er
            ro que cita a tabela de limites, nenhuma saída gerada | RN-01
            5, RN-016 |
      1496  | Arquivo de câmbio ausente | — | erro que cita o arquivo de 
            câmbio, nenhuma saída gerada | RN-015, RN-017 |
      1497  | Tabela sem versão | tabela de limites sem `versao` | erro q
            ue cita a tabela de limites e `versao`, nenhuma saída gerada 
            | RN-015, RN-016 |
      1498 -| Moeda repetida no câmbio | `"usd"` e `"USD"` na mesma data 
           -| erro que cita o arquivo de câmbio, nenhuma saída gerada | R
           -N-015, RN-017 |                                              
      1498 +| Moeda repetida no câmbio | `"USD": 5.42` e depois `"usd": 5
           +.50` na mesma data; despesa 10,00 USD nessa data | sem erro; 
           +usa a última, taxa 5,50 → `valor_solicitado` 55,00 | RN-017 |
      1499  | Moeda minúscula no câmbio | arquivo com `"eur"`; despesa 10
            ,00 `"EUR"` em data com cotação | convertida normalmente pela
             taxa de `"eur"` | RN-017 |
      1500  | Valor inválido em moeda estrangeira | `"valor": "R$ 45,00"`
            , `"moeda": "EUR"`, data com cotação | RECUSADO `DADO_INVALID
            O`; `valor_solicitado`, `taxa_cambio` e `data_cotacao` nulos 
            | RN-003, RN-017 |
      1501  | Valor inválido em BRL | `"valor": true`, sem `moeda` | RECU
            SADO `DADO_INVALIDO`; `taxa_cambio` nulo (não 1) | RN-003, RN
            -017 |
● Spec updated. Next, D-021 in DECISIONS:

  Read 1 file (ctrl+o to expand)

● Update(DECISIONS.md)
  ⎿  Added 3 lines, removed 3 lines
      26  
      27  **O que mudou na spec (versão 2.1 → 2.2):**
      28  - RN-017 e seção 4 (`taxas`): o código de moeda do arquivo de c
          âmbio é
      29 -  comparado sem diferenciar maiúsculas. Duas moedas iguais ness
         -a comparação,                                                  
      30 -  na mesma data, invalidam o arquivo. O valor de uma data que n
         -ão é objeto                                                    
      31 -  também invalida.                                             
      29 +  comparado sem diferenciar maiúsculas. Se duas moedas ficam ig
         +uais nessa                                                     
      30 +  comparação na mesma data, vale a taxa da última que aparece n
         +o arquivo. O                                                   
      31 +  valor de uma data que não é objeto invalida o arquivo.       
      32  - Seção 4 (`taxa_cambio`, `data_cotacao` e o parágrafo sobre it
          ens
      33    `DADO_INVALIDO`): os três campos de conversão saem nulos junt
          os quando não
      34    houve conversão, inclusive em BRL com `valor` inválido.

● Update(DECISIONS.md)
  ⎿  Added 6 lines, removed 4 lines
      42  
      43  **Como se chegou lá:** o Claude recomendou (a) na AMB-043 (a co
          tação sai mesmo
      44  sem valor). O usuário escolheu (b), os três nulos. Na AMB-042 o
           usuário
      45 -respondeu "`usd` casa com `USD`, maiúscula e minúscula é irrele
         -vante". A                                                      
      46 -invalidez de `"usd"` e `"USD"` na mesma data foi complemento do
         - Claude, pelo                                                  
      47 -mesmo critério das categorias repetidas da RN-016, e fica para 
         -confirmação. Na                                                
      48 -AMB-044 o usuário aceitou a recomendação.                      
      45 +respondeu "`usd` casa com `USD`, maiúscula e minúscula é irrele
         +vante". Para                                                   
      46 +`"usd"` e `"USD"` na mesma data, o Claude complementou sozinho 
         +com "arquivo                                                   
      47 +inválido", pelo critério das categorias repetidas da RN-016, e 
         +pediu                                                          
      48 +confirmação ao relatar o plano. O usuário recusou: "use o últim
         +o valor                                                        
      49 +disponível". A versão com arquivo inválido ficou só na área de 
         +trabalho e                                                     
      50 +nunca foi commitada. Na AMB-044 o usuário aceitou a recomendaçã
         +o.                                                             
      51  
      52  **Por quê:** ver AMB-042 a AMB-044.
      53  

● Update(DECISIONS.md)
  ⎿  Added 2 lines, removed 1 line
      53  
      54  **O que isso invalidou:** nada implementado da v4. A leitura "`
          taxa_cambio` 1
      55  em todo item BRL", que só existia no rascunho do plano, não val
          e num item com
      56 -`valor` inválido.                                              
      56 +`valor` inválido. A recusa do câmbio com moeda repetida, que só
         + existiu na                                                    
      57 +área de trabalho.                                              
      58  
      59  **Tasks afetadas:** nenhuma concluída. Entram nas tasks novas d
          a v4 (leitura
      60  dos arquivos externos, conversão e saída), ainda não geradas.

● Update(DECISIONS.md)
  ⎿  Added 3 lines, removed 1 line
      59  **Tasks afetadas:** nenhuma concluída. Entram nas tasks novas d
          a v4 (leitura
      60  dos arquivos externos, conversão e saída), ainda não geradas.
      61  
      62 -**Custo:** `spec.md` (9 trechos) e `DECISIONS.md`.             
      62 +**Custo:** `spec.md` (9 trechos, 5 deles refeitos na 2ª rodada)
         +, `DECISIONS.md`                                               
      63 +e os artefatos do plano (`research.md`, `data-model.md`,       
      64 +`contracts/arquivos-externos.md`).                             
      65  
      66  ---
      67  

● Now the plan artifacts. There's one technical point: "the last in the file"
  depends on the order of keys in the parsed object. I'll write it into R-14.

  Read 1 file (ctrl+o to expand)

● Update(research.md)
  ⎿  Added 10 lines, removed 3 lines
      251    em ordem crescente. Para uma despesa (moeda M, data D), a co
           tação é o último
      252    elemento com `data ≤ D` (busca binária; a comparação é de te
           xto, R-05). Sem
      253    elemento, não há cotação (`CAMBIO_INDISPONIVEL`).
      254 -- **Justificativa:** o índice é montado uma vez por execução, 
          -e a busca não                                                 
      255 -  depende da ordem das chaves no arquivo. Uma colisão `"usd"`/
          -`"USD"` na mesma                                              
      256 -  data é detectada ao montar o índice (AMB-042).              
      254 +- **Moeda repetida na mesma data (AMB-042):** ao montar o índi
          +ce, as moedas                                                 
      255 +  de cada data são percorridas na ordem do arquivo, e uma moed
          +a que já estava                                               
      256 +  no índice para aquela data é **sobrescrita**. Assim vale a ú
          +ltima. Isso                                                   
      257 +  depende da ordem das chaves, e ela é garantida: o `JSON.pars
          +e` (com ou sem                                                
      258 +  reviver) cria as chaves na ordem do texto, e o JS mantém a o
          +rdem de inserção                                              
      259 +  de chaves que não são índices numéricos (códigos de moeda nu
          +nca são). A                                                   
      260 +  validação (taxa > 0, 3 letras) roda em **todas** as entradas
          +, inclusive a                                                 
      261 +  que é sobrescrita.                                          
      262 +- **Justificativa:** o índice é montado uma vez por execução, 
          +e a busca por                                                 
      263 +  data não depende da ordem das datas no arquivo.             
      264  - **Alternativas descartadas:** andar para trás dia a dia a pa
           rtir de D (sem
      265    limite de dias, AMB-035, isso não tem fim garantido para uma
            moeda
      266    desconhecida).

● Update(data-model.md)
  ⎿  Added 2 lines, removed 1 line
      63  NumeroJson }` em ordem crescente de data. A taxa guarda o texto
           original,
      64  para sair "como está no arquivo" (R-04), e vira `Decimal` na co
          nta.
      65  Validação (RN-017): chave de data válida; valor da data é objet
          o; moeda com 3
      66 -letras; colisão `"usd"`/`"USD"` na mesma data → inválido; taxa 
         -> 0.                                                           
      66 +letras; taxa > 0 (em todas as entradas). Moeda repetida na mesm
         +a data                                                         
      67 +(`"usd"` e `"USD"`): fica a última do arquivo (AMB-042, R-14). 
      68  
      69  ### `TabelaAplicavel` (montada uma vez por execução, RN-016)
      70  | Campo | Tipo | Regra |

● Update(contracts\arquivos-externos.md)
  ⎿  Added 1 line, removed 1 line
      31  ```
      32  erro: tabela de limites (dados/politica.json): centros_custo.CC
          -ADM.alimentacao.limite é negativo (-10)
      33  erro: arquivo de câmbio (dados/cambio.json): arquivo não encont
          rado
      34 -erro: arquivo de câmbio (dados/cambio.json): taxas.2026-07-13 t
         -em "usd" e "USD" (a mesma moeda duas vezes)                    
      34 +erro: arquivo de câmbio (dados/cambio.json): taxas.2026-07-13.E
         +UR não é maior que zero (0)                                    
      35  ```
      36  
      37  O texto exato das mensagens é orientativo. O que se verifica é 
          o código de

  Searched for 1 pattern, read 1 file, ran 1 shell command (ctrl+o to expand)

● Update(plan.md)
  ⎿  Added 5 lines, removed 3 lines
      337    consequência é a da RN-015 (execução abortada).
      338  - **Casos de borda da seção 7:** `casos-de-borda.test.ts`, com
            um `it` por
      339    linha da tabela e o título **idêntico** à coluna "Caso". Os 
           que citam o
      340 -  arquivo externo (tabela inválida, câmbio ausente, moeda repe
          -tida) testam a                                                
      341 -  função de `io/` com o texto do arquivo; o de câmbio ausente 
          -também roda no                                                
      342 -  CLI.                                                        
      340 +  arquivo externo (tabela inválida, tabela sem versão, câmbio 
          +ausente) testam                                               
      341 +  a função de `io/` com o texto do arquivo; o de câmbio ausent
          +e também roda no                                              
      342 +  CLI. "Moeda repetida no câmbio" e "Moeda minúscula no câmbio
          +" montam o                                                    
      343 +  câmbio a partir do texto (para exercitar a ordem das chaves,
          + R-14) e rodam o                                              
      344 +  motor.                                                      
      345  - **Nomenclatura:** `RN-017 › e-004 (30,00 EUR no sábado 18/07
           ) → taxa 5,96 de 17/07, R$ 178,80`.
      346  - **Exemplos oficiais:** `exemplo.test.ts` compara item a item
            com as **três**
      347    tabelas da seção 9 e os três resumos, com a tabela e o câmbi
           o de

● I've changed it: when the same currency appears twice on the same date in the
  exchange file ("usd" and "USD"), the file is no longer rejected. The rate from
  whichever entry comes last in the file is used.

  Spec (still 2.2, nothing committed yet)
  - Clarifications, RN-017 and AMB-042: now say the last entry's rate is used.
    The rejection is gone from the list of reasons the exchange file is invalid.
    AMB-042 no longer lists RN-015 as an affected rule.
  - Your call: a duplicate entry must still be valid, even though its rate won't
    be used. So a negative or non-numeric rate on the entry that loses still
    rejects the file. Let me know if you'd rather ignore the entry that loses
    completely.
  - §7 edge case "Moeda repetida no câmbio": it's now a success case. With
    "USD": 5.42 followed by "usd": 5.50, a USD 10,00 expense uses 5,50 →
    valor_solicitado 55,00.

  DECISIONS (D-021): records the second round. I had proposed rejecting the
  file, you chose "use o último valor disponível", and the rejecting version was
  never committed.

  Plan artifacts
  - research.md (specs/001-motor-reembolso/research.md) (R-14): when the
    exchange data is indexed, a repeated currency overwrites the earlier entry,
    so the last one wins. This relies on the order of keys in the file. JSON
    parsing keeps that order, and JS keeps insertion order for keys that aren't
    numbers. Currency codes never are, so the order is guaranteed.
  - data-model.md (specs/001-motor-reembolso/data-model.md): the exchange-file
    validation now matches this rule.
  - contracts/arquivos-externos.md
    (specs/001-motor-reembolso/contracts/arquivos-externos.md): the "duplicate
    currency" error message example is replaced by a zero-rate example.
  - plan.md (specs/001-motor-reembolso/plan.md) §6: the "Moeda repetida" test
    builds the exchange data from text and runs the engine, so it actually
    checks the key order.

  Next steps are the same: commit (docs(spec): / docs(plan):), then
  /speckit-tasks.