
> /speckit-plan

  Listed 1 directory, ran 3 shell commands (ctrl+o to expand)

● Setup ok (o plan.md existente é o template do desafio e não foi sobrescrito).
  Agora leio a spec e o contexto do desafio.

  Searched for 1 pattern, read 2 files, listed 1 directory, ran 2 shell commands (ctrl+o to expand)

● A escolha da linguagem é sua (o desafio diz "a que você domina", e o CLAUDE.md
  ainda está com <...>). Tenho Python 3.14, Node 24 e Java 21 disponíveis na
  máquina.

● User answered Claude's questions:
  ⎿  · Qual stack o plano deve usar para o motor de reembolso? → Typescript e
     testes com vitest dado que essa é a minha stack de especialidade

● Confirmei TypeScript + Vitest, mas ao modelar os dados encontrei três pontos
  que a spec não define. Como o CLAUDE.md trata isso como regra de negócio, vou
  levar essas lacunas para a spec antes de seguir com o plano.

● User answered Claude's questions:
  ⎿  · Item recusado por DADO_INVALIDO cujo `valor` é inválido ou ausente (ex.:
     "R$ 45,00", null): o que sai em `valor_solicitado`? A seção 4 diz que o
     campo é sempre número, mas não há número para arredondar. (E, no mesmo
     caso, `id`/`data`/`categoria` inválidos saem como vieram?) → null + echo
     bruto para ficar claro na saída o motivo de recusa
     · RN-012 diz "primeiro número inteiro da descricao seguido de
     diária/noite". Em "Hotel 5 estrelas - 2 diarias", N é 2 (primeira
     ocorrência do padrão número+palavra) ou 1 (o primeiro número é 5, que não é
     seguido de diária)? → N = 2 (Recommended)
     · RN-003 recusa `id` repetido. "d-001" e " d-001 " (espaços nas bordas) são
     o mesmo id? E "D-001"? → é feito o mesmo tratamneto de categoria,
     normalizando o texto antes da análise

● Obrigado. Pela ordem do projeto (spec → DECISIONS → plano), primeiro registro
  as três decisões na spec e depois escrevo o plano.

  Searched for 1 pattern (ctrl+o to expand)

● Agora as edições na spec.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 3 lines
      33  - Q: Uma despesa com `valor` escrito como texto (`"45.00"`, `"4
          5,00"`) deve ser aceita? → A: Sim, com ponto ou vírgula decimal
          , além de número direto. Formato fechado: sinal opcional, dígit
          os e no máximo um separador decimal. Separador de milhar e símb
          olo de moeda → `DADO_INVALIDO` (RN-003, AMB-021).
      34  - Q: Um `tem_nota_fiscal` não booleano (`"true"`, `"sim"`, `1`,
           `null`) conta como o quê? → A: Só booleanos são aceitos. Vazio
           (ausente, nulo, texto vazio) vale `false`. Qualquer outro valo
          r → `DADO_INVALIDO` (RN-003, AMB-022).
      35  - Q: `id`, `categoria` ou `data` vazios, nulos ou de tipo errad
          o são o mesmo que ausentes? → A: Sim. Sem essa informação não d
          á para calcular a despesa corretamente, então ela é recusada co
          m `DADO_INVALIDO` (RN-003, AMB-018).
      36 +- Q: Num item `DADO_INVALIDO` com `valor` não numérico ou ausen
         +te, o que sai em `valor_solicitado`? E `id`, `data` e `categori
         +a` inválidos? → A: `valor_solicitado` sai nulo, e os campos de 
         +eco saem exatamente como vieram, para que a saída mostre o moti
         +vo da recusa (seção 4, AMB-023).                               
      37 +- Q: Em "Hotel 5 estrelas - 2 diarias", N é 2 ou 1? → A: 2. Val
         +e a primeira ocorrência do padrão completo "<inteiro> diária(s)
         +/noite(s)". Números soltos antes dela são ignorados (RN-012, AM
         +B-008).                                                        
      38 +- Q: `"d-001"`, `" d-001 "` e `"D-001"` são o mesmo `id` para a
         + RN-003? → A: Sim. O `id` é normalizado como a categoria (maiús
         +culas/minúsculas, espaços nas bordas, acentos) antes de compara
         +r (RN-003, AMB-024).                                           
      39  
      40  ## 3. Fora de escopo
      41  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 3 lines, removed 3 lines
      87  | `colaborador` | objeto | Eco do objeto de entrada |
      88  | `periodo` | objeto | Eco do objeto de entrada |
      89  | `itens` | lista | Um item por despesa de entrada, **na mesma 
          ordem da entrada** |
      90 -| `itens[].id` | texto | `id` da despesa |                     
      90 +| `itens[].id` | texto | `id` da despesa, como veio |          
      91  | `itens[].data` | texto | `data` da despesa, como veio |
      92 -| `itens[].categoria` | texto | Categoria normalizada (RN-002),
         - ou a original se não for reconhecida |                        
      93 -| `itens[].valor_solicitado` | número | Valor da entrada arredo
         -ndado para centavos (RN-001) |                                 
      92 +| `itens[].categoria` | texto | Categoria normalizada (RN-002),
         + ou a original, como veio, se não for reconhecida |            
      93 +| `itens[].valor_solicitado` | número ou nulo | Valor da entrad
         +a arredondado para centavos (RN-001). Nulo se o `valor` é ausen
         +te ou não numérico (RN-003) |                                  
      94  | `itens[].valor_reembolsavel` | número | Valor a reembolsar, e
          m centavos, `0 ≤ valor_reembolsavel ≤ max(valor_solicitado, 0)`
           |
      95  | `itens[].status` | texto | `APROVADO` (reembolsável = solicit
          ado), `PARCIAL` (0 < reembolsável < solicitado) ou `RECUSADO` (
          reembolsável = 0) |
      96  | `itens[].motivo.codigo` | texto | Código padronizado da decis
          ão (tabela abaixo) |

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 6 lines
      107  Todo valor monetário da saída é um número em reais com no máxi
           mo duas casas
      108  decimais.
      109  
      110 +Num item recusado com `DADO_INVALIDO`, os campos de eco (`id`,
          + `data`,                                                      
      111 +`categoria`) saem **exatamente como vieram**, inclusive nulos,
          + vazios ou de                                                 
      112 +outro tipo (um campo ausente sai nulo). Assim a própria saída 
          +mostra o dado                                                 
      113 +que causou a recusa. O `valor_solicitado` é o valor arredondad
          +o quando o                                                    
      114 +`valor` é numérico (a recusa veio de outro campo) e nulo quand
          +o não é (AMB-023).                                            
      115 +                                                              
      116  **Códigos de motivo** (exatamente um por item, o da primeira r
           egra que decidiu
      117  o item, conforme a seção 8):
      118  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 7 lines, removed 1 line
      197  `data` que não é uma data de calendário válida no formato `AAA
           A-MM-DD`, com
      198  `valor` não numérico, ou com `id` igual ao de uma despesa ante
           rior no arquivo, é
      199  **RECUSADA** com `DADO_INVALIDO`. As demais despesas continuam
            sendo
      200 -processadas normalmente.                                      
      200 +processadas normalmente. Uma despesa que não é um objeto (um n
          +úmero, um texto,                                              
      201 +nulo) tem todos os campos ausentes e também é `DADO_INVALIDO`.
      202  
      203 +Para saber se o `id` repete, ele é comparado depois da mesma n
          +ormalização da                                                
      204 +categoria (RN-002): sem diferenciar maiúsculas de minúsculas, 
          +sem espaços nas                                               
      205 +bordas e sem acentos. `"d-001"`, `" d-001 "` e `"D-001"` são o
          + mesmo `id`                                                   
      206 +(AMB-024).                                                    
      207 +                                                              
      208  `valor` é numérico quando é um número ou um texto que, sem os 
           espaços das
      209  bordas, tem sinal `-` opcional, um ou mais dígitos e, opcional
           mente, **um**
      210  separador decimal (ponto `.` ou vírgula `,`) seguido de um ou 
           mais dígitos. O

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 5 lines, removed 2 lines
      221  ausente, nulo, ou texto vazio ou só com espaços) vale `false`.
            Qualquer outro
      222  valor (textos como `"true"` ou `"sim"`, números como `1` ou `0
           `, listas,
      223  objetos) é `DADO_INVALIDO`.
      224 -**Origem:** ausente na política (AMB-018, AMB-021, AMB-022)   
      224 +**Origem:** ausente na política (AMB-018, AMB-021, AMB-022, AM
          +B-023, AMB-024)                                               
      225  **Aceite:** uma despesa com `"data": "2026-07-32"` sai RECUSAD
           O/`DADO_INVALIDO`
      226 -e as outras despesas do arquivo têm o resultado de sempre. `"4
          -5.00"`,                                                       
      226 +com `data` `"2026-07-32"` na saída, e as outras despesas do ar
          +quivo têm o                                                   
      227 +resultado de sempre. `"valor": "R$ 45,00"` sai com `valor_soli
          +citado` nulo.                                                 
      228 +Uma despesa `"id": "D-001"` depois de uma `"id": "d-001"` →   
      229 +RECUSADO/`DADO_INVALIDO`. `"45.00"`,                          
      230  `"45,00"` e `45.00` dão o mesmo resultado (`valor_solicitado` 
           45,00).
      231  `"1.234,56"` e `"R$ 45,00"` → RECUSADO/`DADO_INVALIDO`.
      232  `"tem_nota_fiscal": "sim"` → RECUSADO/`DADO_INVALIDO`.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 5 lines, removed 3 lines
      341  
      342  ### RN-012 — Hospedagem com mais de uma diária
      343  
      344 -**Regra:** O número de diárias `N` de uma despesa de hospedage
          -m é o **primeiro                                              
      345 -número inteiro** da `descricao` seguido (com ou sem espaço) de
          - uma das                                                      
      346 -palavras `diaria`, `diarias`, `noite` ou `noites`. A comparaçã
          -o não diferencia                                              
      344 +**Regra:** O número de diárias `N` de uma despesa de hospedage
          +m é o número                                                  
      345 +inteiro da **primeira ocorrência**, na `descricao`, de um inte
          +iro seguido (com                                              
      346 +ou sem espaço) de uma das palavras `diaria`, `diarias`, `noite
          +` ou `noites`.                                                
      347 +Números que aparecem antes dessa ocorrência sem ser seguidos d
          +e uma dessas                                                  
      348 +palavras são ignorados. A comparação não diferencia           
      349  maiúsculas de minúsculas nem acentos, então "diária" e "Diária
           s" também
      350  contam. Se não houver esse padrão, ou se `N` = 0, vale `N` = 1
           .
      351  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      362  **Origem:** política do RH, item 3 (AMB-008)
      363  **Aceite:** "Hotel Rio - 2 diarias" → N = 2. "Airbnb 3 noites"
            → N = 3.
      364  "Hotel 5 estrelas" → N = 1 (5 não vem seguido de diária/noite)
           .
      365 -"Pousada" → N = 1. `d-010` (480,00, N = 2) → 240,00 na noite d
          -e 14/07 e                                                     
      365 +"Hotel 5 estrelas - 2 diarias" → N = 2. "Pousada" → N = 1. `d-
          +010` (480,00, N = 2) → 240,00 na noite de 14/07 e             
      366  240,00 na de 15/07 → APROVADO 480,00. Exemplo de sobreposição,
            com
      367  `h1` = 14/07 "2 diarias" 480,00 e depois `h2` = 15/07 "1 diari
           a" 200,00:
      368  `h1` → 240 + 240 = APROVADO 480,00; `h2` → só restam 10,00 na 
           noite de 15/07

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines, removed 1 line
      496  ("Airbnb 3 noites", 690,00) cobrem várias noites numa só despe
           sa, mas a
      497  entrada não tem campo com o número de noites. O limite é 250 ×
            1 ou 250 × N?
      498  **Decisão:** 250 × N, com N extraído de `descricao` pelo padrã
           o fechado da
      499 -RN-012 ("<inteiro> diária(s)/noite(s)"). Sem esse padrão, N = 
          -1. O valor é                                                  
      499 +RN-012 ("<inteiro> diária(s)/noite(s)"). Vale a primeira ocorr
          +ência do padrão                                               
      500 +completo, e números soltos antes dela são ignorados. Sem esse 
          +padrão, N = 1. O valor é                                      
      501  dividido igualmente entre as noites D…D+N−1, e cada noite disp
           uta o limite de
      502  R$ 250 daquela data com as outras hospedagens que caem na mesm
           a noite.
      503  **Justificativa:** limitar a uma diária uma estadia de várias 
           noites paga numa

● Agora as duas AMB novas e os casos de borda.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 31 lines
      696  leitura única, então nenhum texto é aceito.
      697  **Regra afetada:** RN-003, RN-008
      698  
      699 +### AMB-023 — O que a saída mostra num item com dado inválido 
      700 +                                                              
      701 +**Texto original do RH:** a política não fala do assunto.     
      702 +**O que não está claro:** a saída tem um item por despesa, com
      703 +`valor_solicitado` numérico. Numa despesa `DADO_INVALIDO` com 
          +`valor`                                                       
      704 +ausente ou não numérico (`"R$ 45,00"`), não há valor para arre
          +dondar. E                                                     
      705 +`id`, `data` ou `categoria` inválidos (nulos, vazios, `123`): 
          +(a) saem                                                      
      706 +normalizados ou convertidos; (b) saem vazios; (c) saem como vi
          +eram.                                                         
      707 +**Decisão:** `valor_solicitado` sai **nulo** quando o `valor` 
          +não é numérico.                                               
      708 +`id`, `data` e `categoria` saem **exatamente como vieram**, e 
          +um campo                                                      
      709 +ausente sai nulo. Um item com `valor_solicitado` nulo não entr
          +a em                                                          
      710 +`total_solicitado`.                                           
      711 +**Justificativa:** nas palavras do usuário, é "para ficar clar
          +o na saída o                                                  
      712 +motivo de recusa". Mostrar 0,00 daria a entender que existe um
          + valor real, e                                                
      713 +converter o dado esconderia o erro de quem gerou o arquivo.   
      714 +**Regra afetada:** RN-003, RN-014                             
      715 +                                                              
      716 +### AMB-024 — Quando dois `id` são o mesmo                    
      717 +                                                              
      718 +**Texto original do RH:** a política não fala do assunto.     
      719 +**O que não está claro:** a RN-003 recusa `id` repetido. `"d-0
          +01"`,                                                         
      720 +`" d-001 "` e `"D-001"` são o mesmo `id`? (a) só texto idêntic
          +o; (b) sem                                                    
      721 +espaços nas bordas; (c) com a normalização da categoria.      
      722 +**Decisão:** (c). O `id` é comparado sem diferenciar maiúscula
          +s de                                                          
      723 +minúsculas, sem espaços nas bordas e sem acentos (como a RN-00
          +2). Na saída,                                                 
      724 +o `id` sai como veio.                                         
      725 +**Justificativa:** decisão do usuário, pelo mesmo motivo da AM
          +B-014: grafia                                                 
      726 +diferente é problema de digitação, e dois ids que só diferem n
          +a grafia                                                      
      727 +provavelmente são o mesmo lançamento.                         
      728 +**Regra afetada:** RN-003                                     
      729 +                                                              
      730  ---
      731  
      732  ## 7. Casos de borda

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 5 lines
      779  | Viagem não altera o limiar de NF | dia de viagem, transporte
            110,00 sem NF | RECUSADO `NOTA_FISCAL_AUSENTE` | RN-008 |
      780  | Data impossível | `2026-02-30` | RECUSADO `DADO_INVALIDO`, o
           s outros itens seguem | RN-003 |
      781  | `id` repetido | dois itens com `id` "d-001" | o segundo RECU
           SADO `DADO_INVALIDO` | RN-003 |
      782 +| `id` repetido com outra grafia | `"d-001"` e depois `" D-001
          + "` | o segundo RECUSADO `DADO_INVALIDO`, `id` sai `" D-001 "`
          + | RN-003 |                                                   
      783 +| Valor inválido na saída | `"valor": "R$ 45,00"` | RECUSADO `
          +DADO_INVALIDO`, `valor_solicitado` nulo, fora do `total_solici
          +tado` | RN-003, RN-014 |                                      
      784 +| Eco de campo inválido | `"categoria": 123` | `categoria` sai
          + `123` na saída | RN-003 |                                    
      785 +| Despesa que não é objeto | um item `42` na lista `despesas` 
          +| RECUSADO `DADO_INVALIDO`, `id`/`data`/`categoria`/`valor_sol
          +icitado` nulos | RN-003 |                                     
      786 +| Número solto antes das diárias | "Hotel 5 estrelas - 2 diari
          +as", 480,00 | N = 2 → APROVADO 480,00 | RN-012 |              
      787  | Categoria vazia | `"categoria": "  "` | RECUSADO `DADO_INVAL
           IDO` (não `CATEGORIA_NAO_REEMBOLSAVEL`) | RN-003 |
      788  | Categoria não textual | `"categoria": 123` | RECUSADO `DADO_
           INVALIDO` | RN-003 |
      789  | `id` vazio | `"id": ""` | RECUSADO `DADO_INVALIDO` | RN-003 
           |

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      100  | `itens[].diarias` | inteiro ou nulo | Número de diárias cons
           iderado (RN-012). Só preenchido em hospedagem que chegou à eta
           pa de limite; nulo nos demais casos |
      101  | `resumo.quantidade_itens` | inteiro | Total de despesas na e
           ntrada |
      102  | `resumo.aprovados` / `parciais` / `recusados` | inteiro | Co
           ntagem por status |
      103 -| `resumo.total_solicitado` | número | Soma de `valor_solicita
          -do` dos itens com valor **positivo** |                        
      103 +| `resumo.total_solicitado` | número | Soma de `valor_solicita
          +do` dos itens com valor **positivo** (nulo não entra) |       
      104  | `resumo.total_reembolsavel` | número | Soma de `valor_reembo
           lsavel` de todos os itens |
      105  | `resumo.total_nao_reembolsado` | número | `total_solicitado 
           − total_reembolsavel` |
      106  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      1  # Spec — Motor de Cálculo de Reembolso
      2  
      3 -**Versão:** 1.0 · **Status:** rascunho · **Última alteração:** `
        -2026-09-29`                                                     
      3 +**Versão:** 1.1 · **Status:** rascunho · **Última alteração:** `
        +2026-09-29`                                                     
      4  
      5  > **Regra de ouro deste arquivo:** ele descreve o QUÊ e o PORQUÊ
         . Nenhuma linha
      6  > aqui pode citar linguagem, biblioteca, classe, função ou estru
         tura de pasta.
● Entrada no DECISIONS.md:

● Update(specs\001-motor-reembolso\DECISIONS.md)
  ⎿  Added 38 lines
      17  
      18  ---
      19  
      20 +## D-015 — Lacunas achadas no `/speckit-plan` (seção 4, RN-003,
         + RN-012, AMB-023, AMB-024) · `2026-09-29`                      
      21 +                                                               
      22 +**Gatilho:** `/speckit-plan`. Ao desenhar o modelo de dados, o 
         +Claude                                                         
      23 +encontrou três pontos que a spec não fechava e que o plano teri
         +a de                                                           
      24 +decidir sozinho. Parou e perguntou antes de escrever o plano.  
      25 +                                                               
      26 +**O que mudou na spec (versão 1.0 → 1.1):**                    
      27 +- Seção 4 e nova AMB-023: num item `DADO_INVALIDO`, `valor_soli
         +citado` sai                                                    
      28 +  nulo quando o `valor` não é numérico, e `id`, `data` e `categ
         +oria` saem                                                     
      29 +  como vieram. O tipo de `valor_solicitado` passou a "número ou
         + nulo".                                                        
      30 +  `total_solicitado` ignora os nulos.                          
      31 +- RN-003 e nova AMB-024: o `id` repetido é comparado com a norm
         +alização da                                                    
      32 +  categoria (caixa, bordas, acentos). Também ficou escrito que 
         +uma despesa                                                    
      33 +  que não é objeto tem todos os campos ausentes → `DADO_INVALID
         +O`. Isso é                                                     
      34 +  consequência da AMB-018, explicitada pelo Claude e avisada ao
         + usuário.                                                      
      35 +- RN-012 e AMB-008: N vem da **primeira ocorrência do padrão co
         +mpleto**                                                       
      36 +  "<inteiro> diária(s)/noite(s)". Números soltos antes dela são
         + ignorados                                                     
      37 +  ("Hotel 5 estrelas - 2 diarias" → N = 2).                    
      38 +- Entraram 5 casos de borda e 3 entradas em `Clarifications`.  
      39 +                                                               
      40 +**Por quê:**                                                   
      41 +- Eco bruto: nas palavras do usuário, "para ficar claro na saíd
         +a o motivo de                                                  
      42 +  recusa". É a opção que o Claude tinha recomendado.           
      43 +- `id`: o usuário escolheu "o mesmo tratamento de categoria". O
         + Claude tinha                                                  
      44 +  recomendado ignorar só as bordas e diferenciar a caixa.      
      45 +- Diárias: a opção que o Claude tinha recomendado. É a leitura 
         +coerente com o                                                 
      46 +  aceite "Hotel 5 estrelas" → N = 1.                           
      47 +                                                               
      48 +**O que isso invalidou:** nada. O texto anterior da RN-012 ("pr
         +imeiro número                                                  
      49 +inteiro seguido de...") admitia as duas leituras, e nenhum acei
         +te dependia                                                    
      50 +disso. Nenhum item do exemplo muda.                            
      51 +                                                               
      52 +**Tasks afetadas:** nenhuma (`tasks.md` ainda é o template).   
      53 +                                                               
      54 +**Custo:** 2 arquivos, 12 trechos.                             
      55 +                                                               
      56 +---                                                            
      57 +                                                               
      58  ## D-014 — Obrigatório vazio conta como ausente (RN-003, AMB-01
          8) · `2026-09-29`
      59  
      60  **Gatilho:** `/speckit-clarify`. O Claude perguntou se `id`, `c
          ategoria` ou

● Spec atualizada. Antes de fixar a stack no plano, verifico no Node 24 os
  recursos que resolvem o problema dos valores monetários sem ponto flutuante:

  Ran 1 shell command (ctrl+o to expand)

● Confirmei tudo no Node 24: type stripping nativo, context.source no reviver do
  JSON.parse e JSON.rawJSON. Agora vou escrever o research.md.

● Write(specs\001-motor-reembolso\research.md)
  ⎿  Wrote 143 lines to specs\001-motor-reembolso\research.md
       1 # Research — Motor de Cálculo de Reembolso
       2
         6-09-29
       4
       5 Cada item fecha uma incógnita técnica do `plan.md`. Nenhum item
       6 negócio. Os pontos em que o plano esbarrou numa lacuna de regra
         foram levados
       7 à spec antes (D-015).
       9 Ambiente verificado na máquina: Node 24.20, npm, vitest 5.0.2 e
      10 typescript 7.0.2 disponíveis no registry.
     … +192 lines (ctrl+o to expand)

● Agora o data-model.md:

● Write(specs\001-motor-reembolso\data-model.md)
  ⎿  Wrote 133 lines to specs\001-motor-reembolso\data-model.md
      1 # Modelo de dados — Motor de Cálculo de Reembolso
      2
      4
      5 Estruturas internas do núcleo. Os tipos são TypeScript, mas as re
        gras de
         aqui.
      7
      8 Convenções: `Centavos = bigint` (R-02). `DataISO` = texto `AAAA-M
      9 validado (R-05). `Categoria = 'alimentacao' | 'transporte_urbano'
         | 'hospedagem'`.
     … +168 lines (ctrl+o to expand)

● Contratos (CLI e schema da saída):

● Write(specs\001-motor-reembolso\contracts\cli.md)
  ⎿  Wrote 40 lines to specs\001-motor-reembolso\contracts\cli.md
       1 # Contrato — CLI
       2
         didos no plano
       4 (R-08). O formato do conteúdo da saída é o da seção 4 da spec, f
         ormalizado em
       6
       7 ## Invocação
       8
      10 node src/cli.ts calcular --input <arquivo-entrada.json> --output
          <arquivo-saida.json>
     … +47 lines (ctrl+o to expand)

● Write(specs\001-motor-reembolso\contracts\saida.schema.json)
  ⎿  Wrote 79 lines to
     specs\001-motor-reembolso\contracts\saida.schema.json
       1 {
       2   "$schema": "https://json-schema.org/draft/2020-12/schema",
       3   "$id": "saida.schema.json",
       5   "description": "Formaliza a seção 4 da spec (v1.1). Em caso de
          divergência, a spec prevalece.",
       6   "type": "object",
       7   "required": ["colaborador", "periodo", "itens", "resumo"],
       9   "properties": {
      10     "colaborador": { "type": "object", "description": "Eco do ob
         jeto de entrada" },
     … +89 lines (ctrl+o to expand)

● Agora o quickstart.md:

● Write(specs\001-motor-reembolso\quickstart.md)
  ⎿  Wrote 70 lines to specs\001-motor-reembolso\quickstart.md
       1 # Quickstart — validação ponta a ponta
       2
       3 Roteiro para provar que o motor atende a spec. O comportamento e
       4 na [`spec.md`](spec.md) (seções 7 e 9), a interface em
       5 [`contracts/cli.md`](contracts/cli.md) e o formato da saída em
       6 [`contracts/saida.schema.json`](contracts/saida.schema.json).
       7
       9
      10 - Node **≥ 24** (`node --version`). O código TypeScript roda dir
         eto, sem build
     … +77 lines (ctrl+o to expand)

● Agora o plan.md, na estrutura do template do desafio, com o Technical Context
  e o Constitution Check do spec-kit:

● Write(specs\001-motor-reembolso\plan.md)
  ⎿  Added 204 lines, removed 31 lines
        1  # Plano Técnico — Motor de Cálculo de Reembolso
        2  
        3 -**Versão:** 1.0 · **Baseado na spec:** 1.0                    
        3 +**Versão:** 1.0 · **Baseado na spec:** 1.1 · **Branch:** `001-
          +motor-reembolso` · **Data:** 2026-09-29                       
        4  
        5  > Aqui mora o COMO. Este arquivo pode e deve falar de linguage
           m, biblioteca e
        6  > arquitetura. O que ele **não** pode é introduzir regra de ne
           gócio nova — se
        7  > apareceu uma, ela pertence à `spec.md`.
        8  
        9 +Artefatos de apoio: [`research.md`](research.md) (decisões R-0
          +1 a R-10, com                                                 
       10 +as alternativas descartadas), [`data-model.md`](data-model.md)
          +,                                                             
       11 +[`contracts/`](contracts/) e [`quickstart.md`](quickstart.md).
       12 +                                                              
       13 +Ao escrever este plano, três lacunas de regra foram encontrada
          +s e levadas à                                                 
       14 +spec **antes** de qualquer decisão técnica (DECISIONS D-015: e
          +co de item                                                    
       15 +inválido, `id` normalizado e primeira ocorrência das diárias).
       16 +                                                              
       17  ---
       18  
       19 +## 0. Contexto técnico                                        
       20 +                                                              
       21 +| Item | Valor |                                              
       22 +|---|---|                                                     
       23 +| Linguagem / runtime | TypeScript em Node **≥ 24**, com type 
          +stripping nativo, sem build (R-01) |                          
       24 +| Dependências de runtime | **nenhuma** (só a stdlib do Node) 
          +|                                                             
       25 +| Dependências de desenvolvimento | `typescript` (só typecheck
          +), `vitest` 5, `ajv` (testes de contrato), `@types/node` |    
       26 +| Armazenamento | nenhum. Um arquivo entra e um arquivo sai | 
       27 +| Testes | Vitest (`npm test`) |                              
       28 +| Plataforma | CLI multiplataforma (Windows/Linux/macOS) |    
       29 +| Tipo de projeto | CLI única, com o núcleo em funções puras |
       30 +| Desempenho | irrelevante no volume esperado. O custo é linea
          +r no número de despesas + diárias |                           
       31 +| Restrições | nada de float em dinheiro. Saída determinística
          +. Nenhuma saída parcial em erro |                             
       32 +                                                              
       33 +## 0.1 Constitution Check                                     
       34 +                                                              
       35 +| Princípio | Como o plano cumpre | Status |                  
       36 +|---|---|---|                                                 
       37 +| I. Spec é a fonte da verdade | O plano não redefine regra. O
          +nde faltou regra, a spec foi corrigida antes (D-015) | ✅ |   
       38 +| II. Regra de negócio só na spec | Os valores da política fic
          +am num módulo só (§4), que reproduz a RN-009, a RN-008 e a RN-
          +011, com o ID ao lado de cada valor. Comentário de código cita
          + o ID e não explica a regra | ✅ |                            
       39 +| III. Ambiguidade registrada | 3 lacunas viraram AMB-023, AMB
          +-024 e um ajuste na AMB-008 antes do plano | ✅ |             
       40 +| IV. Spec sem tecnologia | Tudo o que é técnico ficou neste a
          +rquivo e no `research.md`. A spec continua sem nome de tecnolo
          +gia | ✅ |                                                    
       41 +| V. Rastreabilidade | Os nomes dos testes começam pelo ID (§6
          +). Um teste de rastreabilidade lê a spec (R-10) | ✅ |        
       42 +| VI. Nenhuma regra sem teste | Um teste por RN e um por linha
          + da seção 7, verificado automaticamente | ✅ |                
       43 +| VII. Mudança de spec registrada | D-015 registrada antes des
          +te plano | ✅ |                                               
       44 +| Restrição: dinheiro sem float | Centavos em `bigint`. A entr
          +ada é lida pelo texto do número e a saída é emitida por `JSON.
          +rawJSON` (R-02 a R-04) | ✅ |                                 
       45 +                                                              
       46 +**Reavaliação depois da Fase 1:** o modelo de dados e os contr
          +atos não criam                                                
       47 +regra. O `saida.schema.json` só formaliza a seção 4. **Nenhuma
          + violação.**                                                  
       48 +                                                              
       49  ## 1. Stack
       50  
       51  | Escolha | O quê | Por quê | O que descartei e por quê |
       52  |---|---|---|---|
       15 -| Linguagem | | | |                                           
       16 -| Testes | | | |                                              
       17 -| Parsing/validação | | | |                                   
       18 -| Aritmética monetária | | | |                                
       53 +| Linguagem | TypeScript, Node ≥ 24, rodando `.ts` direto | st
          +ack do usuário. Sem build, não existe `dist/` desatualizado | 
          +`tsc`→`dist` e `tsx`: uma etapa ou uma dependência a mais para
          + o mesmo resultado |                                          
       54 +| Testes | Vitest 5 | escolha do usuário. Roda TS sem configur
          +ação | Jest: exige transformação de TS/ESM |                  
       55 +| Parsing/validação | `JSON.parse` com reviver `context.source
          +` + validação escrita à mão | o texto exato de cada número che
          +ga ao núcleo. A RN-003 tem regras específicas demais para uma 
          +lib de schema | `zod`/`ajv` na entrada, porque traduzir os err
          +os para a RN-003 dá mais código que escrevê-la; `lossless-json
          +` duplica o que o runtime já faz |                            
       56 +| Aritmética monetária | **centavos em `bigint`**. Arredondame
          +nto meio-para-o-par feito nos dígitos do texto. Saída por `JSO
          +N.rawJSON` | exato de ponta a ponta, sem teto. `10.005` fica *
          +*exatamente** no meio (RN-001) | float (erra `10.005`); `numbe
          +r` em centavos (teto de 2^53 viraria regra implícita); `decima
          +l.js` (dependência para operações só com inteiros) |          
       57  
       20 -<A linha de aritmética monetária não é decoração. Ponto flutua
          -nte em dinheiro é                                             
       21 -a fonte de bug mais previsível deste projeto.>                
       22 -                                                              
       58  ## 2. Arquitetura
       59  
       25 -<Diagrama em blocos ou lista. Quais são as peças, o que cada u
          -ma faz, como                                                  
       26 -conversam. Uma tela, não uma tese.>                           
       27 -                                                              
       60  ```
       29 -entrada JSON → <...> → <...> → saída JSON                     
       61 +arquivo ─► io/json (parse com texto dos números) ─► io/entrada
          + (RN-015) ─► Entrada                                          
       62 +                                                              
          +              │                                               
       63 +          ┌─────────────────────── núcleo (puro, sem E/S) ────
          +─────────────┘                                                
       64 +          ▼                                                   
       65 +   motor: para cada despesa, na ordem                         
       66 +     despesa.ts        etapas 1-2  RN-001, RN-002, RN-003     
       67 +     elegibilidade.ts  etapas 3-7  RN-004 … RN-008 (estado: id
          +s vistos, chaves de duplicata)                                
       68 +          ▼  elegíveis                                        
       69 +     viagem.ts         etapa 8     RN-011 (noites das hospedag
          +ens elegíveis)                                                
       70 +     diarias.ts        etapa 9a    RN-012 (N e parcelas por no
          +ite)                                                          
       71 +     limites.ts        etapa 9b    RN-009, RN-010 (saldo por (
          +data, categoria), na ordem)                                   
       72 +          ▼                                                   
       73 +     motivos.ts RN-013 · resumo.ts RN-014                     
       74 +          │                                                   
       75 +          ▼ Resultado (Centavos, valores brutos de eco)       
       76 +io/saida (JSON.rawJSON) ─► cli grava o arquivo ─► exit 0      
       77  ```
       78  
       32 -**Fronteiras:** <o que é núcleo de regra de negócio puro e o q
          -ue é I/O. Onde                                                
       33 -essa linha está desenhada determina o quanto o sistema vai res
          -istir a mudança                                               
       34 -de requisito.>                                                
       79 +**Fronteiras:** só `src/cli.ts` e `src/io/` fazem E/S e conhec
          +em JSON.                                                      
       80 +`src/nucleo/` é feito de funções puras: recebe `Entrada` e dev
          +olve                                                          
       81 +`Resultado`, sem ler relógio, disco nem ambiente. Por isso qua
          +se todos os                                                   
       82 +testes rodam em memória, e uma mudança de regra fica dentro de
          + uma etapa do                                                 
       83 +núcleo. A ordem da seção 8 vive **só** em `motor.ts`: mudar a 
          +ordem é mudar                                                 
       84 +uma lista, e não caçar condicionais espalhadas.               
       85  
       86 +Estrutura de pastas:                                          
       87 +                                                              
       88 +```                                                           
       89 +src/                                                          
       90 +  cli.ts                      # parseArgs, lê/grava arquivos, 
          +códigos de saída                                              
       91 +  io/json.ts                  # parse com NumeroJson; serializ
          +ação com rawJSON                                              
       92 +  io/entrada.ts               # RN-015 → Entrada | ErroEntrada
       93 +  nucleo/                                                     
       94 +    tipos.ts  politica.ts  dinheiro.ts  datas.ts  texto.ts    
       95 +    despesa.ts  elegibilidade.ts  viagem.ts  diarias.ts  limit
          +es.ts                                                         
       96 +    motivos.ts  resumo.ts  motor.ts                           
       97 +tests/                                                        
       98 +  nucleo/rn-001-arredondamento.test.ts … rn-015-*.test.ts     
       99 +  casos-de-borda.test.ts      # uma linha da seção 7 = um test
          +e                                                             
      100 +  exemplo.test.ts             # tabela da seção 9             
      101 +  contrato-saida.test.ts      # saida.schema.json             
      102 +  cli.test.ts                 # ponta a ponta: sucesso, RN-015
          +, determinismo                                                
      103 +  rastreabilidade.test.ts     # spec.md × nomes de teste      
      104 +```                                                           
      105 +                                                              
      106  ## 3. Modelo de dados
      107  
       38 -<Estruturas internas. Como uma despesa é representada, como um
          - resultado de                                                 
       39 -avaliação é representado, o que carrega a justificativa.>     
      108 +Detalhado em [`data-model.md`](data-model.md). Resumo:        
      109  
      110 +- A despesa passa por estados tipados: `DespesaBruta` → `Despe
          +saValida` →                                                   
      111 +  `DespesaElegivel` → alocada. Em qualquer etapa ela pode vira
          +r `Recusa`                                                    
      112 +  com um código. A primeira recusa encerra a avaliação (seção 
          +8).                                                           
      113 +- A hospedagem vira N `Parcela`s (uma por noite). As outras ca
          +tegorias viram                                                
      114 +  uma parcela. O limite (etapa 9) só enxerga parcelas, então h
          +ospedagem e                                                   
      115 +  alimentação seguem o mesmo caminho de cálculo.              
      116 +- `ResultadoItem` guarda os valores em `Centavos` e os ecos br
          +utos. O                                                       
      117 +  `status` é **derivado** dos valores (reembolsável = solicita
          +do → APROVADO                                                 
      118 +  etc.) e nunca é guardado separado.                          
      119 +- A justificativa (`Motivo`) é montada a partir do código e do
          +s números que                                                 
      120 +  a etapa decisiva devolveu: limite, saldo, corte, `id` aceito
          + da duplicata.                                                
      121 +                                                              
      122  ## 4. Como a política é representada
      123  
       43 -<Os limites vivem onde? Constantes no código, arquivo de confi
          -guração, tabela?                                              
       44 -Esta decisão é a que mais barato ou mais caro vai custar se a 
          -política mudar.>                                              
      124 +**Um módulo de constantes tipadas, `src/nucleo/politica.ts`**,
          + e em nenhum                                                  
      125 +outro lugar aparece número mágico de regra:                   
      126  
      127 +```ts                                                         
      128 +export const POLITICA = {                                     
      129 +  limites: {                                                  
      130 +    alimentacao:       { diario: 60_00n,  ampliaEmViagem: true
          +  }, // RN-009                                                
      131 +    transporte_urbano: { diario: 80_00n,  ampliaEmViagem: true
          +  }, // RN-009                                                
      132 +    hospedagem:        { diario: 250_00n, ampliaEmViagem: fals
          +e }, // RN-009, AMB-020                                       
      133 +  },                                                          
      134 +  fatorViagem: { num: 3n, den: 2n },                          
          +     // RN-011                                                
      135 +  limiarNotaFiscal: 100_00n,                                  
          +     // RN-008 (estritamente maior)                           
      136 +} as const;                                                   
      137 +```                                                           
      138 +                                                              
      139 +Mudar um valor da política exige mudar a spec e depois uma lin
          +ha neste                                                      
      140 +arquivo. As categorias reconhecidas (RN-006) são as chaves de 
          +`limites`, e                                                  
      141 +não existe uma segunda lista para manter sincronizada.        
      142 +                                                              
      143 +**Descartado:** arquivo de configuração externo (JSON/YAML). E
          +le exigiria                                                   
      144 +validação própria e um parâmetro de CLI que a interface fixa n
          +ão tem, e o                                                   
      145 +desafio não pede política configurável em tempo de execução. S
          +e a mudança de                                                
      146 +requisito pedir isso, a troca fica restrita a quem monta `POLI
          +TICA`.                                                        
      147 +                                                              
      148  ## 5. Decisões técnicas
      149  
       48 -### DT-001 — <decisão>                                        
      150 +### DT-001 — Dinheiro em centavos `bigint`, lido do texto e es
          +crito cru                                                     
      151  
       50 -**Contexto:** <o que forçou a escolha>                        
       51 -**Decisão:** <o que foi decidido>                             
       52 -**Alternativa descartada:** <e por quê>                       
       53 -**Consequência:** <o que isso torna fácil e o que torna difíci
          -l>                                                            
      152 +**Contexto:** a RN-001 exige meio para o par num ponto médio e
          +xato                                                          
      153 +(`10.005` → 10,00). O float `10.005` vale `10.00499…`, então n
          +ão está no meio.                                              
      154 +**Decisão:** o reviver do `JSON.parse` guarda o texto de todo 
          +número                                                        
      155 +(`NumeroJson`). `dinheiro.ts` converte texto (inclusive com ex
          +poente e com o                                                
      156 +formato texto da RN-003) em centavos `bigint`, arredondando me
          +io para o par                                                 
      157 +sobre os dígitos. A saída usa `JSON.rawJSON("45.00")`.        
      158 +**Alternativa descartada:** `Math.round(valor * 100)` e `toFix
          +ed`, que                                                      
      159 +falham nos pontos médios; `decimal.js`, dependência sem ganho.
      160 +**Consequência:** fácil: exatidão garantida e testável por tab
          +ela. Difícil:                                                 
      161 +todo número do JSON chega embrulhado, e o núcleo nunca pode us
          +ar                                                            
      162 +`typeof x === 'number'`. Isso fica concentrado em `despesa.ts`
          +.                                                             
      163  
       55 -### DT-002 — ...                                              
      164 +### DT-002 — Núcleo puro com a ordem da seção 8 num lugar só  
      165  
      166 +**Contexto:** a seção 8 define 9 etapas em que a primeira recu
          +sa encerra a                                                  
      167 +avaliação. A etapa 6 (duplicata) depende do que passou das eta
          +pas 1 a 5, e a                                                
      168 +etapa 8 (viagem) depende de todas as hospedagens elegíveis.   
      169 +**Decisão:** `motor.ts` faz duas passadas. A **passada 1** per
          +corre as                                                      
      170 +despesas na ordem e aplica as etapas 1 a 7 (validação e elegib
          +ilidade), com                                                 
      171 +o estado acumulado de ids vistos e chaves de duplicata. A **pa
          +ssada 2** usa as                                              
      172 +elegíveis: calcula os dias de viagem, gera as parcelas e conso
          +me os saldos.                                                 
      173 +**Alternativa descartada:** um pipeline genérico de "regras pl
          +ugáveis".                                                     
      174 +Com uma ordem fixa e conhecida, seria abstração sem uso, e o F
          +AQ alerta para                                                
      175 +isso.                                                         
      176 +**Consequência:** fácil: incluir, remover ou reordenar uma eta
          +pa de                                                         
      177 +elegibilidade. Difícil: uma regra que precise de informação da
          + passada 2                                                    
      178 +dentro da passada 1. Hoje nenhuma precisa.                    
      179 +                                                              
      180 +### DT-003 — Hospedagem entra no limite como parcelas         
      181 +                                                              
      182 +**Contexto:** a RN-012 divide a hospedagem por noite, e cada n
          +oite disputa o                                                
      183 +limite daquela data com outras hospedagens, na ordem da entrad
          +a.                                                            
      184 +**Decisão:** toda despesa elegível vira uma lista de `Parcela`
          +s (N para                                                     
      185 +hospedagem, 1 para as demais). `limites.ts` só conhece parcela
          +s e soma o que                                                
      186 +cada uma recebeu por `indiceDespesa`.                         
      187 +**Alternativa descartada:** um caminho especial para hospedage
          +m em                                                          
      188 +`limites.ts`, que duplicaria a lógica de saldo e ordem.       
      189 +**Consequência:** o exemplo de sobreposição da RN-012 (`h1`/`h
          +2`) sai sem                                                   
      190 +código específico. O status de hospedagem vem da soma das parc
          +elas.                                                         
      191 +                                                              
      192 +### DT-004 — Saída cria o arquivo só no fim                   
      193 +                                                              
      194 +**Contexto:** a RN-015 exige que nenhum arquivo de saída seja 
          +gerado em erro.                                               
      195 +**Decisão:** ler, validar, calcular e serializar tudo em memór
          +ia. Só então                                                  
      196 +chamar `writeFile`. Um erro de entrada lança `ErroEntrada`, qu
          +e o `cli.ts`                                                  
      197 +converte em `stderr` + código 1.                              
      198 +**Alternativa descartada:** gravar em streaming (deixaria saíd
          +a parcial).                                                   
      199 +**Consequência:** o arquivo inteiro fica em memória, o que é i
          +rrelevante no                                                 
      200 +volume do problema.                                           
      201 +                                                              
      202 +### DT-005 — Teste de rastreabilidade automático              
      203 +                                                              
      204 +**Contexto:** a seção 9 exige teste para cada RN e para cada l
          +inha da seção 7.                                              
      205 +**Decisão:** `rastreabilidade.test.ts` extrai da spec os IDs  
      206 +`### RN-NNN` e os nomes da 1ª coluna da tabela da seção 7, e c
          +onfere se                                                     
      207 +cada um aparece em algum título de teste (`RN-NNN ›` ou `Borda
          + › <nome>`).                                                  
      208 +**Alternativa descartada:** matriz mantida à mão só no `tasks.
          +md`, que                                                      
      209 +desatualiza em silêncio.                                      
      210 +**Consequência:** um caso de borda novo na spec (ex.: no envel
          +ope do Dia 2)                                                 
      211 +deixa a suíte vermelha até ganhar teste. Isso é intencional.  
      212 +                                                              
      213  ## 6. Estratégia de testes
      214  
       59 -- **Nível:** <unitário, integração, ponta a ponta — e a propor
          -ção entre eles>                                               
       60 -- **Cada `RN-NNN` da spec tem teste?** <como você garante isso
          ->                                                             
       61 -- **Casos de borda da seção 7 da spec:** <cobertos como>      
       62 -- **Nomenclatura:** <como o nome do teste remete ao requisito 
          -— isso é o que                                                
       63 -  fecha a rastreabilidade na correção>                        
      215 +- **Nível:** ~80% testes do núcleo em memória (uma função ou o
          + `motor`                                                      
      216 +  com despesas montadas no teste); ~15% ponta a ponta do motor
          + (exemplo,                                                    
      217 +  contrato); ~5% CLI por processo filho (sucesso, RN-015, dete
          +rminismo,                                                     
      218 +  códigos de saída).                                          
      219 +- **Cada `RN-NNN` tem teste?** Sim, um arquivo por RN em `test
          +s/nucleo/`,                                                   
      220 +  com `describe('RN-00X — <título da spec>')`. Os critérios de
          + **Aceite** da                                                
      221 +  spec viram testes literais. O `rastreabilidade.test.ts` gara
          +nte isso.                                                     
      222 +- **Casos de borda da seção 7:** `casos-de-borda.test.ts`, com
          + um `it` por                                                  
      223 +  linha da tabela e o título **idêntico** à coluna "Caso"     
      224 +  (`Borda › Três casas decimais`).                            
      225 +- **Nomenclatura:** `RN-010 › d-001 e d-002 em 03/07: 1ª PARCI
          +AL 60,00, 2ª ESGOTADO`.                                       
      226 +  O ID no início fecha a cadeia spec → teste. O nome do arquiv
          +o repete o ID                                                 
      227 +  (`rn-010-parcial.test.ts`), o que facilita o `grep`.        
      228 +- **Exemplo oficial:** `exemplo.test.ts` compara item a item c
          +om a tabela da                                                
      229 +  seção 9 e com o resumo esperado.                            
      230  
      231  ## 7. Riscos
      232  
      233  | Risco | Probabilidade | O que faço se acontecer |
      234  |---|---|---|
       69 -| | | |                                                       
      235 +| Mudança do Dia 2 altera um valor da política ou acrescenta c
          +ategoria | alta | spec → DECISIONS → uma linha em `politica.ts
          +` + testes da RN afetada |                                    
      236 +| Limite ampliado com centavos fracionários (ex.: limite 60,01
          + × 1,5 = 90,015) numa política futura | média | hoje todos são
          + exatos. Se acontecer, parar e levar à spec a regra de arredon
          +damento do limite (não decidir no código) |                   
      237 +| Mudança do Dia 2 cria um campo de viagem na entrada | média 
          +| trocar só `viagem.ts`. A etapa 8 já é isolada (AMB-007 prevê
          + a troca) |                                                   
      238 +| `JSON.rawJSON` ou `context.source` indisponível no Node do a
          +valiador | baixa | `engines: node >= 24` no `package.json` + v
          +erificação no início do `cli.ts` com mensagem clara |         
      239 +| TypeScript 7 incompatível com `erasableSyntaxOnly`/`allowImp
          +ortingTsExtensions` | baixa | fixar `typescript@5.9` (só afeta
          + o typecheck, não a execução) |                               
      240 +| `ajv` e `multipleOf: 0.01` com float dão falso negativo (`0.
          +07`) | média | `multipleOfPrecision: 2` na instância de teste 
          +|                                                             
      241 +| Descrição como `"1.5 diarias"` dá N = 5 (leitura literal da 
          +RN-012) | baixa | se aparecer, é lacuna de spec: registrar AMB
          + e decidir, não remendar a regex |                            
      242 +| `"999999 diarias"` gera ~1M de parcelas | baixa | aceitável.
          + Se virar problema, levar à spec um teto de N |               

● Por fim, preencho os placeholders de stack e convenções no CLAUDE.md (o passo
  do spec-kit que atualiza o contexto do agente):

● Update(CLAUDE.md)
  ⎿  Added 11 lines, removed 7 lines
      34  
      35  ## Stack e comandos
      36  
      37 -- Linguagem: `<...>`                                           
      38 -- Rodar: `<comando>`                                           
      39 -- Testes: `<comando>`                                          
      40 -- Lint/format: `<comando>`                                     
      37 +- Linguagem: TypeScript em Node ≥ 24, rodando `.ts` direto (typ
         +e stripping, sem build)                                        
      38 +- Rodar: `node src/cli.ts calcular --input <entrada.json> --out
         +put <saida.json>`                                              
      39 +- Testes: `npm test` (Vitest)                                  
      40 +- Lint/format: `npm run typecheck` (`tsc --noEmit`)            
      41  
      42  ## Convenções de código
      43  
      44 -- `<nomenclatura, estrutura de pastas, tratamento de erro, o qu
         -e for relevante>`                                              
      45 -- Valores monetários: `<como são representados — decimal, centa
         -vos em inteiro, etc.>`                                         
      44 +- Estrutura e decisões técnicas: `specs/001-motor-reembolso/pla
         +n.md` e `research.md`.                                         
      45 +- `src/nucleo/` é puro (sem E/S, relógio ou ambiente); só `src/
         +cli.ts` e `src/io/` tocam em arquivo/JSON.                     
      46 +- Só sintaxe apagável (`erasableSyntaxOnly`): sem `enum`/`names
         +pace`; imports relativos com `.ts`.                            
      47 +- Números mágicos de política só em `src/nucleo/politica.ts`.  
      48 +- Nome de teste começa pelo ID: `RN-010 › ...` ou `Borda › <nom
         +e exato do caso da seção 7>`.                                  
      49 +- Valores monetários: centavos em `bigint`; entrada lida pelo t
         +exto do número, saída via `JSON.rawJSON`. Nunca `number` para d
         +inheiro.                                                       
      50  
      51  ## Fora de escopo
      52  
      49 -- `<o que este projeto explicitamente não faz — evita que o age
         -nte invente feature>`                                          
      53 +- Ver seção 3 da spec. Na dúvida, não implemente: pergunte.    

● Não há .specify/extensions.yml, então não havia hooks para rodar. O plano está
  pronto. Antes de escrevê-lo, precisei corrigir a spec: ao montar o modelo de
  dados apareceram três lacunas de regra de negócio, e pelo CLAUDE.md elas vão
  para a spec, não para o plano.

  Branch: 001-motor-reembolso · Plano: plan.md
  (specs/001-motor-reembolso/plan.md)

  Mudanças na spec (v1.0 → v1.1, registradas em D-015)

  - AMB-023: num item recusado por dado inválido, valor_solicitado sai nulo
    quando o valor não é numérico, e id, data e categoria saem exatamente como
    vieram. Itens com valor nulo ficam fora de total_solicitado.
  - AMB-024: para detectar id repetido, o id é normalizado como a categoria.
    "d-001", " d-001 " e "D-001" contam como o mesmo id.
  - RN-012 e AMB-008: N é o inteiro da primeira ocorrência de "número +
    diária(s)/noite(s)". Então "Hotel 5 estrelas - 2 diarias" dá N = 2.
  - Entraram 5 casos de borda. Um deles eu deixei explícito por conta própria,
    confira: uma despesa que não é objeto (por exemplo 42 na lista) vira
    DADO_INVALIDO. Segue da AMB-018 (campo ausente conta como inválido).

  Principais decisões do plano

  - Stack: TypeScript rodando direto no Node 24, sem etapa de build, com Vitest.
    Não há dependência em tempo de execução.
  - Dinheiro: centavos inteiros em bigint. O leitor de JSON guarda o texto
    original de cada número, então 10.005 chega exatamente no meio e o
    arredondamento para o par funciona. Na saída, os valores são escritos com
    duas casas (45.00) sem passar por ponto flutuante. Testei os três recursos
    do Node que isso usa e todos funcionam na sua máquina.
  - Arquitetura: as regras ficam em funções puras. A ordem das etapas da seção 8
    fica num arquivo só, e os valores da política ficam só em politica.ts.
  - Hospedagem: entra no cálculo de limite dividida em uma parcela por noite,
    pelo mesmo caminho das outras categorias.
  - Rastreabilidade: um teste lê a spec.md e falha se alguma RN ou algum caso de
    borda da seção 7 ficar sem teste com o nome correspondente.

  Arquivos

  - Criados: research.md (specs/001-motor-reembolso/research.md), data-model.md
    (specs/001-motor-reembolso/data-model.md), contracts/cli.md
    (specs/001-motor-reembolso/contracts/cli.md), contracts/saida.schema.json
    (specs/001-motor-reembolso/contracts/saida.schema.json), quickstart.md
    (specs/001-motor-reembolso/quickstart.md)
  - Alterados: plan.md (specs/001-motor-reembolso/plan.md), spec.md
    (specs/001-motor-reembolso/spec.md), DECISIONS.md
    (specs/001-motor-reembolso/DECISIONS.md) e os campos de stack e convenções
    do CLAUDE.md

  Pontos que dependem de você

  - Diárias: pela leitura literal da RN-012, "1.5 diarias" dá N = 5. Deixei como
    risco no plano, sem tratar no código. Se quiser outro comportamento, é uma
    nova ambiguidade para a spec.
  - Commits: não fiz nenhum. Pela convenção do projeto, sugiro separar em
    docs(spec): ... (spec + DECISIONS da D-015) e docs(plan): ... (plano e
    demais artefatos, incluindo o CLAUDE.md).

  O próximo passo é /speckit-tasks.

> <ide_opened_file>The user opened the file d:\Usuario\Projetos\Dev\Apps\sdd-de
  safio\specs\001-motor-reembolso\research.md in the IDE. This may or may not
  be related to the current task.</ide_opened_file>

> vamos lidar primeiro com o ponto das diárias, o caso onde o usuário escreve
  "1.5 diárias" não deve ser levado em consideração por não se tratar de algo
  habitual

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 4 lines, removed 1 line
      883    regra deve ser substituída, com registro em `DECISIONS.md`.
      884  - **Extração de diárias (AMB-008):** depende do colaborador es
           crever
      885    "N diárias" ou "N noites". Descrições como "estadia de dois 
           dias" (número por
      886 -  extenso) ou "15 a 17/07" resultam em N = 1.                 
      886 +  extenso) ou "15 a 17/07" resultam em N = 1. Número fracionár
          +io de diárias                                                 
      887 +  ("1.5 diarias") não é tratado de forma especial, porque não 
          +é habitual: vale                                              
      888 +  a leitura literal da RN-012, em que o inteiro `5` vem seguid
          +o de "diarias", e                                             
      889 +  o resultado é N = 5.                                        
      890  - **Ordem de entrada como critério de distribuição (AMB-002):*
           * a entrada não
      891    traz horário, então "ordem de entrada" é aproximação da orde
           m cronológica
      892    dentro do dia. Se um dia vier horário, a regra deve ser revi
           sta.

● Update(specs\001-motor-reembolso\DECISIONS.md)
  ⎿  Added 22 lines
      17  
      18  ---
      19  
      20 +## D-016 — Diárias fracionárias ficam fora do tratamento (seção
         + 10, AMB-008) · `2026-09-29`                                   
      21 +                                                               
      22 +**Gatilho:** revisão do `/speckit-plan`. O Claude apontou como 
         +risco que,                                                     
      23 +pela leitura literal da RN-012, `"1.5 diarias"` resulta em N = 
         +5.                                                             
      24 +                                                               
      25 +**O que mudou na spec:** seção 10 ("Extração de diárias"): núme
         +ro                                                             
      26 +fracionário de diárias não recebe tratamento especial. Fica val
         +endo a leitura                                                 
      27 +literal, com N = 5, e a consequência está escrita. A RN-012 não
         + mudou.                                                        
      28 +                                                               
      29 +**Por quê:** nas palavras do usuário, o caso "não deve ser leva
         +do em                                                          
      30 +consideração por não se tratar de algo habitual". Uma regra par
         +a ele                                                          
      31 +complicaria a extração sem benefício prático.                  
      32 +                                                               
      33 +**O que isso invalidou:** nada. O risco do `plan.md` virou comp
         +ortamento                                                      
      34 +aceito e documentado.                                          
      35 +                                                               
      36 +**Tasks afetadas:** nenhuma (`tasks.md` ainda é o template).   
      37 +                                                               
      38 +**Custo:** 3 arquivos (`spec.md`, `plan.md`, `research.md`), 3 
         +trechos.                                                       
      39 +                                                               
      40 +---                                                            
      41 +                                                               
      42  ## D-015 — Lacunas achadas no `/speckit-plan` (seção 4, RN-003,
           RN-012, AMB-023, AMB-024) · `2026-09-29`
      43  
      44  **Gatilho:** `/speckit-plan`. Ao desenhar o modelo de dados, o 
          Claude

● Update(specs\001-motor-reembolso\research.md)
  ⎿  Added 3 lines, removed 2 lines
      103    (`"12 noites"` dá 12, e não 2). O lookahead impede que `"2 n
           oitadas"`
      104    conte. Pegar a primeira ocorrência é a regra decidida na D-0
           15.
      105  - **Nota:** `"1.5 diarias"` dá N = 5, porque `5` é um inteiro 
           seguido de
      106 -  "diarias" e o `.` não é dígito. É a leitura literal da RN-01
          -2. O caso está                                                
      107 -  registrado como risco no plano e não foi tratado como exceçã
          -o no código.                                                  
      106 +  "diarias" e o `.` não é dígito. É a leitura literal da RN-01
          +2, aceita                                                     
      107 +  explicitamente na seção 10 da spec (D-016), e o código não t
          +em exceção                                                    
      108 +  para ela.                                                   
      109  
      110  ## R-08 — CLI
      111  

● Update(specs\001-motor-reembolso\plan.md)
  ⎿  Removed 1 line
      238  | `JSON.rawJSON` ou `context.source` indisponível no Node do a
           valiador | baixa | `engines: node >= 24` no `package.json` + v
           erificação no início do `cli.ts` com mensagem clara |
      239  | TypeScript 7 incompatível com `erasableSyntaxOnly`/`allowImp
           ortingTsExtensions` | baixa | fixar `typescript@5.9` (só afeta
            o typecheck, não a execução) |
      240  | `ajv` e `multipleOf: 0.01` com float dão falso negativo (`0.
           07`) | média | `multipleOfPrecision: 2` na instância de teste 
           |
      241 -| Descrição como `"1.5 diarias"` dá N = 5 (leitura literal da 
          -RN-012) | baixa | se aparecer, é lacuna de spec: registrar AMB
          - e decidir, não remendar a regex |                            
      241  | `"999999 diarias"` gera ~1M de parcelas | baixa | aceitável.
            Se virar problema, levar à spec um teto de N |

● Registrei a decisão: o caso "1.5 diárias" não recebe tratamento especial.

  O que mudou:
  - spec.md (specs/001-motor-reembolso/spec.md), seção 10: o item "Extração de
    diárias" agora diz que número fracionário de diárias não é tratado, porque
    não é habitual. Vale a leitura literal da RN-012, então "1.5 diarias" dá N
    = 5. A RN-012 em si não mudou.
  - DECISIONS.md (specs/001-motor-reembolso/DECISIONS.md): nova entrada D-016,
    com a sua justificativa citada.
  - research.md (specs/001-motor-reembolso/research.md): a nota da R-07 aponta
    para a D-016.
  - plan.md (specs/001-motor-reembolso/plan.md): tirei essa linha da tabela de
    riscos, porque agora é comportamento aceito e escrito.

  Não pus o caso na tabela da seção 7 (casos de borda) de propósito. Tudo o que
  está lá precisa ter teste automatizado, e aí o caso deixaria de ser "não
  considerado".

  Li "não levar em consideração" como "não tratar de forma especial". Se você
  quis dizer que um número fracionário deve ser ignorado e o resultado ser N =
  1, me avise: aí vira regra na RN-012 e um caso de borda com teste.

  Nada foi commitado. Os pontos pendentes da rodada anterior eram só este e os
  commits.

> exatamente, o significado era ignorar números fracionários e ler somente como
  1 o caso de 1.5 diárias

● Entendido: número fracionário não conta e, no caso de "1.5 diárias", N = 1.
  Corrijo a spec e reescrevo a D-016, registrando que a primeira leitura foi a
  errada.

● Update(specs\001-motor-reembolso\spec.md)  ⎿  Added 3 lines, removed 1 line
      345  inteiro da **primeira ocorrência**, na `descricao`, de um inte
           iro seguido (com
      346  ou sem espaço) de uma das palavras `diaria`, `diarias`, `noite
           ` ou `noites`.
      347  Números que aparecem antes dessa ocorrência sem ser seguidos d
           e uma dessas
      348 -palavras são ignorados. A comparação não diferencia           
      348 +palavras são ignorados. Número **fracionário** (dígitos, separ
          +ador `.` ou `,`                                               
      349 +e mais dígitos, como `1.5` ou `1,5`) também é ignorado, mesmo 
          +seguido de                                                    
      350 +diária/noite, e nenhum pedaço dele conta como inteiro. A compa
          +ração não diferencia                                          
      351  maiúsculas de minúsculas nem acentos, então "diária" e "Diária
           s" também
      352  contam. Se não houver esse padrão, ou se `N` = 0, vale `N` = 1
           .
      353  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines, removed 1 line
      364  **Origem:** política do RH, item 3 (AMB-008)
      365  **Aceite:** "Hotel Rio - 2 diarias" → N = 2. "Airbnb 3 noites"
            → N = 3.
      366  "Hotel 5 estrelas" → N = 1 (5 não vem seguido de diária/noite)
           .
      367 -"Hotel 5 estrelas - 2 diarias" → N = 2. "Pousada" → N = 1. `d-
          -010` (480,00, N = 2) → 240,00 na noite de 14/07 e             
      367 +"Hotel 5 estrelas - 2 diarias" → N = 2. "Hotel 1.5 diarias" → 
          +N = 1                                                         
      368 +(e não 5). "Pousada" → N = 1. `d-010` (480,00, N = 2) → 240,00
          + na noite de 14/07 e                                          
      369  240,00 na de 15/07 → APROVADO 480,00. Exemplo de sobreposição,
            com
      370  `h1` = 14/07 "2 diarias" 480,00 e depois `h2` = 15/07 "1 diari
           a" 200,00:
      371  `h1` → 240 + 240 = APROVADO 480,00; `h2` → só restam 10,00 na 
           noite de 15/07

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines, removed 1 line
      500  entrada não tem campo com o número de noites. O limite é 250 ×
            1 ou 250 × N?
      501  **Decisão:** 250 × N, com N extraído de `descricao` pelo padrã
           o fechado da
      502  RN-012 ("<inteiro> diária(s)/noite(s)"). Vale a primeira ocorr
           ência do padrão
      503 -completo, e números soltos antes dela são ignorados. Sem esse 
          -padrão, N = 1. O valor é                                      
      503 +completo, e números soltos antes dela são ignorados. Número fr
          +acionário                                                     
      504 +("1.5 diarias") não conta. Sem esse padrão, N = 1. O valor é  
      505  dividido igualmente entre as noites D…D+N−1, e cada noite disp
           uta o limite de
      506  R$ 250 daquela data com as outras hospedagens que caem na mesm
           a noite.
      507  **Justificativa:** limitar a uma diária uma estadia de várias 
           noites paga numa

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line
      788  | Eco de campo inválido | `"categoria": 123` | `categoria` sai
            `123` na saída | RN-003 |
      789  | Despesa que não é objeto | um item `42` na lista `despesas` 
           | RECUSADO `DADO_INVALIDO`, `id`/`data`/`categoria`/`valor_sol
           icitado` nulos | RN-003 |
      790  | Número solto antes das diárias | "Hotel 5 estrelas - 2 diari
           as", 480,00 | N = 2 → APROVADO 480,00 | RN-012 |
      791 +| Diárias fracionárias | "Hotel 1.5 diarias", 300,00 | fracion
          +ário ignorado, N = 1 → PARCIAL 250,00 | RN-012 |              
      792  | Categoria vazia | `"categoria": "  "` | RECUSADO `DADO_INVAL
           IDO` (não `CATEGORIA_NAO_REEMBOLSAVEL`) | RN-003 |
      793  | Categoria não textual | `"categoria": 123` | RECUSADO `DADO_
           INVALIDO` | RN-003 |
      794  | `id` vazio | `"id": ""` | RECUSADO `DADO_INVALIDO` | RN-003 
           |

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines, removed 3 lines
      889  - **Extração de diárias (AMB-008):** depende do colaborador es
           crever
      890    "N diárias" ou "N noites". Descrições como "estadia de dois 
           dias" (número por
      891    extenso) ou "15 a 17/07" resultam em N = 1. Número fracionár
           io de diárias
      892 -  ("1.5 diarias") não é tratado de forma especial, porque não 
          -é habitual: vale                                              
      893 -  a leitura literal da RN-012, em que o inteiro `5` vem seguid
          -o de "diarias", e                                             
      894 -  o resultado é N = 5.                                        
      892 +  ("1.5 diarias") é ignorado e resulta em N = 1, porque não é 
          +habitual e meia                                               
      893 +  diária não tem leitura segura.                              
      894  - **Ordem de entrada como critério de distribuição (AMB-002):*
           * a entrada não
      895    traz horário, então "ordem de entrada" é aproximação da orde
           m cronológica
      896    dentro do dia. Se um dia vier horário, a regra deve ser revi
           sta.

● Agora a D-016 e a regex do research:

● Update(specs\001-motor-reembolso\DECISIONS.md)
  ⎿  Added 23 lines, removed 11 lines
      17  
      18  ---
      19  
      20 -## D-016 — Diárias fracionárias ficam fora do tratamento (seção
         - 10, AMB-008) · `2026-09-29`                                   
      20 +## D-016 — Diárias fracionárias são ignoradas (RN-012, AMB-008)
         + · `2026-09-29`                                                
      21  
      22  **Gatilho:** revisão do `/speckit-plan`. O Claude apontou como 
          risco que,
      23 -pela leitura literal da RN-012, `"1.5 diarias"` resulta em N = 
         -5.                                                             
      23 +pela leitura literal da RN-012, `"1.5 diarias"` resulta em N = 
         +5, porque o                                                    
      24 +`5` é um inteiro seguido de "diarias".                         
      25  
      25 -**O que mudou na spec:** seção 10 ("Extração de diárias"): núme
         -ro                                                             
      26 -fracionário de diárias não recebe tratamento especial. Fica val
         -endo a leitura                                                 
      27 -literal, com N = 5, e a consequência está escrita. A RN-012 não
         - mudou.                                                        
      26 +**O que mudou na spec:**                                       
      27 +- RN-012: número fracionário (`1.5`, `1,5`) é ignorado, mesmo s
         +eguido de                                                      
      28 +  diária/noite, e nenhum pedaço dele conta como inteiro. Novo a
         +ceite:                                                         
      29 +  "Hotel 1.5 diarias" → N = 1.                                 
      30 +- AMB-008 e seção 10 atualizadas.                              
      31 +- Novo caso de borda "Diárias fracionárias" (300,00 → N = 1 → P
         +ARCIAL 250,00).                                                
      32  
      29 -**Por quê:** nas palavras do usuário, o caso "não deve ser leva
         -do em                                                          
      30 -consideração por não se tratar de algo habitual". Uma regra par
         -a ele                                                          
      31 -complicaria a extração sem benefício prático.                  
      33 +**Como se chegou lá (2 rodadas):** a primeira resposta do usuár
         +io ("não deve                                                  
      34 +ser levado em consideração por não se tratar de algo habitual")
         + foi lida pelo                                                 
      35 +Claude como "não tratar de forma especial", e a seção 10 chegou
         + a registrar                                                   
      36 +N = 5. Ao relatar a mudança, o Claude avisou dessa leitura e pe
         +rguntou se o                                                   
      37 +usuário queria N = 1. O usuário esclareceu: "o significado era 
         +ignorar                                                        
      38 +números fracionários e ler somente como 1". A versão com N = 5 
         +ficou só na                                                    
      39 +área de trabalho e nunca foi commitada.                        
      40  
      33 -**O que isso invalidou:** nada. O risco do `plan.md` virou comp
         -ortamento                                                      
      34 -aceito e documentado.                                          
      41 +**Por quê:** diária fracionária não é habitual e não tem leitur
         +a segura.                                                      
      42 +Tratar o `5` de `1.5` como cinco diárias pagaria até 5 × R$ 250
         + por um                                                        
      43 +erro de digitação.                                             
      44  
      45 +**O que isso invalidou:** a leitura intermediária (N = 5) e o r
         +isco                                                           
      46 +correspondente no `plan.md`, que foi removido.                 
      47 +                                                               
      48  **Tasks afetadas:** nenhuma (`tasks.md` ainda é o template).
      49  
      38 -**Custo:** 3 arquivos (`spec.md`, `plan.md`, `research.md`), 3 
         -trechos.                                                       
      50 +**Custo:** 4 arquivos (`spec.md`, `DECISIONS.md`, `plan.md`, `r
         +esearch.md`), 7 trechos.                                       
      51  
      52  ---
      53  

● Update(specs\001-motor-reembolso\research.md)
  ⎿  Added 8 lines, removed 9 lines
       97  ## R-07 — Extração de diárias (RN-012)
       98  
       99  - **Decisão:** na descrição normalizada (R-06), a primeira oco
           rrência de
      100 -  `(?<!\d)(\d+)\s*(diarias?|noites?)(?![a-z])`. N = inteiro ca
          -pturado. Sem                                                  
      101 -  ocorrência, ou N = 0, N = 1.                                
      102 -- **Justificativa:** o lookbehind garante que o inteiro está c
          -ompleto                                                       
      103 -  (`"12 noites"` dá 12, e não 2). O lookahead impede que `"2 n
          -oitadas"`                                                     
      104 -  conte. Pegar a primeira ocorrência é a regra decidida na D-0
          -15.                                                           
      105 -- **Nota:** `"1.5 diarias"` dá N = 5, porque `5` é um inteiro 
          -seguido de                                                    
      106 -  "diarias" e o `.` não é dígito. É a leitura literal da RN-01
          -2, aceita                                                     
      107 -  explicitamente na seção 10 da spec (D-016), e o código não t
          -em exceção                                                    
      108 -  para ela.                                                   
      100 +  `(?<!\d[.,]?)(\d+)(?![.,]\d)\s*(diarias?|noites?)(?![a-z])`.
          + N = inteiro                                                  
      101 +  capturado. Sem ocorrência, ou N = 0, N = 1.                 
      102 +- **Justificativa:** o lookbehind `(?<!\d[.,]?)` garante que o
          + inteiro está                                                 
      103 +  completo (`"12 noites"` dá 12, e não 2) e que ele não é a pa
          +rte decimal de                                                
      104 +  um fracionário (`"1.5 diarias"` não captura o `5`). O `(?![.
          +,]\d)` impede                                                 
      105 +  que a parte inteira de um fracionário seja capturada. O look
          +ahead final                                                   
      106 +  impede que `"2 noitadas"` conte. Pegar a primeira ocorrência
          + é a regra da                                                 
      107 +  D-015, e ignorar fracionários é a da D-016.                 
      108  
      109  ## R-08 — CLI
      110  

● Testo a regex contra os casos da spec:

  Ran 2 shell commands (ctrl+o to expand)

● Pronto. "1.5 diárias" agora dá N = 1, e está escrito como regra na spec.

  Mudanças:
  - spec.md (specs/001-motor-reembolso/spec.md):
    - A RN-012 diz que número fracionário (1.5 ou 1,5) é ignorado, mesmo quando
      vem seguido de diária ou noite, e que nenhum pedaço dele conta como
      inteiro.
    - A RN-012 ganhou um aceite novo: "Hotel 1.5 diarias" → N = 1.
    - A AMB-008 e a seção 10 foram atualizadas.
    - Entrou o caso de borda "Diárias fracionárias": hospedagem de 300,00 → N =
      1 → PARCIAL 250,00. Ele vai precisar de teste.
  - DECISIONS.md (specs/001-motor-reembolso/DECISIONS.md): reescrevi a D-016 com
    as duas rodadas, no mesmo formato da D-011. A primeira leitura (N = 5) foi
    minha interpretação errada da sua resposta e nunca foi commitada.
  - research.md (specs/001-motor-reembolso/research.md): a regex da R-07 agora
    descarta o número inteiro de um fracionário e também o pedaço depois do
    separador.

  Verificação da regex: não consegui rodar o teste rápido no Node, porque a
  checagem de permissão do terminal falhou duas vezes. Conferi à mão contra os
  casos da spec:
  - "2 diarias" → 2, "3 noites" → 3, "12 noites" → 12, "2noites" → 2
  - "Hotel 5 estrelas - 2 diarias" → 2
  - "1.5 diarias", "1,5 diarias", "1.50 diarias" e "10.5 diarias" → 1
  - "Hotel 5 estrelas", "Pousada", "0 diarias" e "2 noitadas" → 1

  A confirmação de verdade vem com o teste do caso de borda na implementação.

  Continua tudo sem commit. Sugiro docs(spec): ... para spec + DECISIONS (D-015
  e D-016) e docs(plan): ... para os artefatos do plano e o CLAUDE.md. Depois,
  /speckit-tasks.

> realize os commits separando os arquivos de acordo com docs(spec) e
  docs(plan) diretamente na branch main

  Ran 4 shell commands (ctrl+o to expand)

● Não fiz os commits. O verificador de permissão do terminal falhou cinco vezes
  seguidas sem responder, então nenhum comando rodou, nem o git status. O
  repositório está como estava: nada foi adicionado ao stage nem commitado.

  Você pode rodar os comandos abaixo na raiz do repositório (PowerShell), ou me
  pedir para tentar de novo daqui a pouco.

  git add specs/001-motor-reembolso/spec.md
  specs/001-motor-reembolso/DECISIONS.md
  git commit -m @'
  docs(spec): lacunas do speckit-plan: eco de item inválido, id normalizado e
  diárias (D-015, D-016)

  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  '@

  git add specs/001-motor-reembolso/plan.md
  specs/001-motor-reembolso/research.md specs/001-motor-reembolso/data-model.md
  specs/001-motor-reembolso/quickstart.md specs/001-motor-reembolso/contracts
  CLAUDE.md
  git commit -m @'
  docs(plan): plano técnico TypeScript/Node 24 com research, modelo de dados,
  contratos e quickstart

  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  '@

  git status --short

  - Primeiro commit (docs(spec)): a spec e o DECISIONS, que foram corrigidos
    antes do plano.
  - Segundo commit (docs(plan)): o plano e os demais artefatos da fase de
    planejamento. Coloquei o CLAUDE.md aqui porque as mudanças nele são só de
    stack e comandos.
  - Branch: os comandos commitam na branch em que você estiver. Pelo snapshot do
    início da sessão, é a main. Confira com git branch --show-current antes de
    rodar.
  - Depois dos commits: o git status --short deve sair vazio. Se aparecer algum
    arquivo, ele não foi alterado nesta sessão, e vale olhar antes de incluir.