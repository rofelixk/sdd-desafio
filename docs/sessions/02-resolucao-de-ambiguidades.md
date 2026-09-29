
> AMB-004: o limiar é explicito "acima de R$100" então despesas de exatamente
  100 não requerem nota fiscal, despesas a partir de 100,01 requerem

  Searched for 1 pattern, read 2 files (ctrl+o to expand)

● Nenhuma mudança é necessária: a spec já diz exatamente isso.

  - A AMB-004 (spec.md:381-388 (specs/001-motor-reembolso/spec.md#L381-L388))
    define que só valores estritamente maiores que R$ 100,00 exigem nota. Pelo
    texto, 100,00 não exige e 100,01 exige.
  - A RN-008 (spec.md:222-230 (specs/001-motor-reembolso/spec.md#L222-L230))
    aplica a mesma comparação estrita. Os critérios de aceite são d-003 (100,00,
    sem nota, não é recusado por nota) e d-004 (100,01, sem nota, recusado com
    NOTA_FISCAL_AUSENTE).
  - Os casos de borda (spec.md:594-597
    (specs/001-motor-reembolso/spec.md#L594-L597)) também cobrem o
    arredondamento, que acontece antes da comparação (RN-001): 100,004 vira
    100,00 e não exige nota; 100,005 vira 100,01 e exige. Por isso, "a partir de
    100,01" é o mesmo que "acima de 100" depois do arredondamento para
    centavos.

  Esta era uma das ambiguidades que eu decidi sozinho na D-001 e que estavam
  esperando sua revisão. Com a sua resposta, ela fica confirmada. Como a spec
  não mudou, pela regra do DECISIONS.md (specs/001-motor-reembolso/DECISIONS.md)
  ("uma entrada toda vez que a spec mudar") não criei uma entrada nova.

  Se quiser deixar registro de quais AMBs você já revisou, posso anotar isso de
  uma vez quando terminar a revisão, em vez de uma entrada para cada uma.

> me retorne quais AMBs faltam revisão

  Searched for 2 patterns, ran 1 shell command (ctrl+o to expand)

● Das 20 ambiguidades, 15 ainda não foram revisadas por você. Todas foram
  decididas por mim na D-001.

  ┌─────────┬───────────────────────────────────────────────────────┬────────┐
  │   AMB   │                         Tema                          │ Regra  │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-001 │ Limite por dia ou por despesa?                        │ RN-009 │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-002 │ Como dividir o limite do dia entre várias despesas    │ RN-010 │
  │         │ (ordem da entrada)                                    │        │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-003 │ O que é "reembolsada parcialmente"                    │ RN-010 │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-005 │ O limiar de nota fiscal vale sobre qual valor         │ RN-008 │
  │         │ (solicitado ou reembolsável)                          │        │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-006 │ Consequência da falta de nota fiscal (recusa total)   │ RN-008 │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-009 │ "Lançadas dentro do período de competência"           │ —      │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-010 │ competencia vs. inicio/fim                            │ —      │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-012 │ Valores negativos (estorno) e zero                    │ RN-004 │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-013 │ Valores com mais de duas casas decimais               │ RN-001 │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-014 │ Grafia da categoria                                   │ —      │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-015 │ Fronteira do limite diário                            │ RN-009 │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-016 │ Fins de semana e feriados                             │ RN-009 │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-017 │ A ampliação de viagem vale para o limiar de nota      │ RN-008 │
  │         │ fiscal?                                               │        │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-018 │ Dados ausentes ou inválidos numa despesa              │ —      │
  ├─────────┼───────────────────────────────────────────────────────┼────────┤
  │ AMB-019 │ Categoria fora da política: recusa total ou parcial?  │ —      │
  └─────────┴───────────────────────────────────────────────────────┴────────┘

  Nos itens com "—", não confirmei a regra.

  Já revisadas por você:
  - AMB-004 (agora mesmo)
  - AMB-007 (D-003 e D-007)
  - AMB-008 (D-002 e D-006)
  - AMB-011 (D-004)
  - AMB-020 (D-008)

  Para montar essa lista, cruzei as decisões registradas no DECISIONS.md
  (specs/001-motor-reembolso/DECISIONS.md) com as suas mensagens no log da
  sessão 02 (docs/sessions/02-criacao-speck-e-decisoes.md).

  Algumas decisões estão encadeadas: AMB-004, 005, 006 e 017 compõem juntas a
  RN-008, e AMB-001, 002, 003 e 015 compõem as RN-009 e RN-010. Revisar cada
  grupo de uma vez tende a ser mais rápido.

> AMB-001 - limite por dia está claro nas regras do desafio, contar por despesa
  seria um erro.
  AMB-002 - será lido por ordem de entrada para garantir consistência ao rodar
  diversas vezes
  AMB-003 - paga até o limite por falta de regras claras de como tratar
  AMB-005 - nota fiscal entendo como sendo de cada despesa, logo toda despesa
  que vale mais de 100 deve vir com tem_nota_fiscal true para ser contabilizada
  no reembolso
  AMB-006 - recusa integralmente por ser obrigatória na politica de reembolso
  AMB-009 - cada despesa que tem uma data fora do periodo.inicio e periodo.fim
  deve ser entendida como fora de competência e não será reembolsada
  AMB-010 - valem as datas explicitas de inicio e fim para garantir resultados
  mais consistentes, removendo ambiguidades que possam surgir por regras
  financeiras
  AMB012 - Valores negativos não tem regra especificada na politica dde
  reembolso, é recusado
  AMB-013 - Será arredondado antes do funcionamento para garantir consistência
  entre testes
  AMB014 - normalizar ajuda na alocação de categorias de cada despesa
  AMB015 - o limite na politica de reembolso exemplifica o total máximo por
  dia, então 60 seria aceito pra alimentação em um dia, 60,01 não
  AMB016 - Não há regra na política indicando fins de semana e feriados então
  serão contados como dia normal
  AMB017 - Não há nenhuma menção na política sobre alteração de valor para
  requerir nota fiscal, somente limites, então a obrigatoriedade de notas em
  despesas acima de 100 é mantida em viagem
  AMB-018 - deve ser recusado por dados insuficientes, não há menção de
  tratamento para despesas lançadas indevidamente
  AMB-019 - pela regra 9 da politica de reembolso, nenhuma categoria fora das
  especificadas são reembolsáveis

  Read 2 files (ctrl+o to expand)

● Comparei suas respostas com a spec: em 11 das 15 a decisão bate, mudando só a
  justificativa. Nas outras 4 (AMB-018, 015, 012, 013) há detalhes que a spec
  resolve de um jeito diferente ou não coberto — principalmente uma possível
  contradição em AMB-018 sobre dado ausente vs. inválido.

● User answered Claude's questions:
  ⎿  · AMB-018: uma despesa sem o campo tem_nota_fiscal deve ser tratada como? →
     Como 'sem nota' (atual)
     · AMB-015: uma despesa de alimentação de R$ 60,01 sozinha no dia deve
     resultar em? → PARCIAL 60,00 (atual)
     · AMB-012: e despesas com valor zero? → Recusa, VALOR_NAO_POSITIVO (atual)
     · AMB-013: qual regra de desempate no arredondamento (ex.: 33,335)? →
     explique meio para o par (bancário)

● Nas AMB-018, 015 e 012 ficou como está na spec. Falta decidir o desempate da
  AMB-013.

  Arredondamento meio para o par (bancário)

  Ele só muda o resultado quando o valor cai exatamente no meio entre dois
  centavos, ou seja, quando termina em 5 na terceira casa decimal. Nesse caso,
  em vez de sempre subir, o valor vai para o centavo par mais próximo.

  ┌─────────┬──────────────────────┬────────────────────────────────────────┐
  │  Valor  │   Meio para cima     │            Meio para o par             │
  │         │       (atual)        │                                        │
  ├─────────┼──────────────────────┼────────────────────────────────────────┤
  │ 33,334  │ 33,33                │ 33,33 (não está no meio, arredonda     │
  │         │                      │ normal)                                │
  ├─────────┼──────────────────────┼────────────────────────────────────────┤
  │ 33,325  │ 33,33                │ 33,32 (2 é par, desce)                 │
  ├─────────┼──────────────────────┼────────────────────────────────────────┤
  │ 33,335  │ 33,34                │ 33,34 (4 é par, sobe)                  │
  ├─────────┼──────────────────────┼────────────────────────────────────────┤
  │ 33,345  │ 33,35                │ 33,34 (4 é par, desce)                 │
  ├─────────┼──────────────────────┼────────────────────────────────────────┤
  │ 100,005 │ 100,01, exige nota   │ 100,00, não exige nota                 │
  └─────────┴──────────────────────┴────────────────────────────────────────┘

  Para que serve: quando se somam milhares de valores arredondados, subir sempre
  no meio gera um viés para cima. Alternando, metade dos casos sobe e metade
  desce, e o viés se anula. Por isso é padrão em sistemas bancários e contábeis
  de alto volume.

  O que muda aqui:
  - Neste sistema, cada despesa é arredondada uma vez só. O viés acumulado seria
    de no máximo alguns centavos por relatório, então a vantagem prática é
    pequena.
  - A desvantagem é que ninguém confere uma justificativa de cabeça: 33,325
    virar 33,32 e 33,335 virar 33,34 parece inconsistente para o colaborador e
    para o RH.
  - O caso de borda "Arredondamento meio-para-cima" (spec.md:597
    (specs/001-motor-reembolso/spec.md#L597)) teria que mudar: 100,005 deixaria
    de exigir nota fiscal.

  Minha recomendação: manter meio para cima. É o que uma pessoa espera ao
  conferir o valor, e o viés não pesa numa escala por item. Qualquer que seja a
  escolha, o código precisa usar um tipo decimal (e não ponto flutuante). Em
  float, 100,005 pode virar 100,00499… e arredondar para o lado errado. Isso vai
  para o plan.

  Me diga qual regra prefere. Depois disso, registro as confirmações da revisão
  numa entrada só do DECISIONS.md, acrescentando as suas justificativas onde
  elas complementam as da spec. Se você escolher o bancário, também registro a
  mudança na AMB-013, na RN-001 e no caso de borda.

> vamos manter arredondamento meio para o par, não sabemos o tamanho dos
  arquivos que serão utilizados fora o exemplo e seria interessante reduzir o
  viés num projeto em escala real

  Searched for 1 pattern, read 1 file (ctrl+o to expand)

● Update(d:\Usuario\Projetos\Dev\Apps\sdd-desafio\specs\001-motor-reembolso\spec
        .md)
  ⎿  Added 7 lines, removed 4 lines
      153  ### RN-001 — Arredondamento de valores para centavos
      154  
      155  **Regra:** Antes de qualquer outra regra, todo `valor` de entr
           ada é arredondado
      156 -para duas casas decimais pelo arredondamento comercial (meio p
          -ara cima, com                                                 
      157 -0,005 → 0,01). Todas as comparações e cálculos seguintes usam 
          -o valor                                                       
      158 -arredondado e são exatos em centavos, sem erro de representaçã
          -o.                                                            
      156 +para duas casas decimais pelo arredondamento **meio para o par
          +** (bancário):                                                
      157 +fora do ponto médio, vai para o centavo mais próximo; exatamen
          +te no meio                                                    
      158 +(terceira casa 5 e nada depois), vai para o centavo **par**. T
          +odas as                                                       
      159 +comparações e cálculos seguintes usam o valor arredondado e sã
          +o exatos em                                                   
      160 +centavos, sem erro de representação.                          
      161  **Origem:** ausente na política (AMB-013)
      160 -**Aceite:** `33.333` → `valor_solicitado` 33.33. `10.005` → 10
          -.01.                                                          
      162 +**Aceite:** `33.333` → `valor_solicitado` 33.33. `10.005` → 10
          +.00.                                                          
      163 +`10.015` → 10.02. `33.345` → 33.34. `33.3451` → 33.35 (fora do
          + meio).                                                       
      164  `100.004` → 100.00 e não exige nota fiscal (RN-008).
      165  
      166  ### RN-002 — Normalização da categoria

● Update(d:\Usuario\Projetos\Dev\Apps\sdd-desafio\specs\001-motor-reembolso\spec
        .md)
  ⎿  Added 7 lines, removed 2 lines
      504  **Texto original do RH:** a política não fala do assunto.
      505  **O que não está claro:** `d-011` vale 33,333. (a) arredonda; 
           (b) trunca;
      506  (c) recusa como dado inválido. Em que momento, e com que regra
            de desempate?
      507 -**Decisão:** arredonda para centavos, meio para cima, **antes*
          -* de qualquer                                                 
      508 -outra regra (RN-001).                                         
      507 +**Decisão:** arredonda para centavos, **meio para o par** (ban
          +cário),                                                       
      508 +**antes** de qualquer outra regra (RN-001).                   
      509  **Justificativa:** dinheiro só existe em centavos. Arredondar 
           antes garante que
      510  todas as comparações (limite, nota fiscal) usem o mesmo valor 
           que é exibido.
      511 +O desempate meio para o par foi escolhido pelo usuário: o tama
          +nho real dos                                                  
      512 +arquivos é desconhecido, e subir sempre no meio acumula viés p
          +ara cima em                                                   
      513 +volume; alternando, o viés se anula. O custo aceito é que caso
          +s no ponto                                                    
      514 +médio parecem menos intuitivos ao conferir à mão (33,325 → 33,
          +32, mas                                                       
      515 +33,335 → 33,34).                                              
      516  **Regra afetada:** RN-001
      517  
      518  ### AMB-014 — Grafia da categoria

● Update(d:\Usuario\Projetos\Dev\Apps\sdd-desafio\specs\001-motor-reembolso\spec
        .md)
  ⎿  Added 3 lines, removed 1 line
      602  | Nota fiscal no limiar exato | transporte 100,00, sem NF | nã
           o exige NF. Segue para o limite: PARCIAL 80,00 | RN-008, RN-01
           0 |
      603  | Um centavo acima do limiar | transporte 100,01, sem NF | REC
           USADO `NOTA_FISCAL_AUSENTE` | RN-008 |
      604  | Arredondamento que cruza o limiar | valor 100,004, sem NF | 
           vira 100,00, não exige NF | RN-001, RN-008 |
      605 -| Arredondamento meio-para-cima | valor 100,005, sem NF | vira
          - 100,01, RECUSADO `NOTA_FISCAL_AUSENTE` | RN-001, RN-008 |    
      605 +| Arredondamento meio-para-o-par no limiar | valor 100,005, se
          +m NF | vira 100,00 (0 é par), não exige NF | RN-001, RN-008 | 
      606 +| Meio-para-o-par sobe | valor 100,015, sem NF | vira 100,02 (
          +2 é par), RECUSADO `NOTA_FISCAL_AUSENTE` | RN-001, RN-008 |   
      607 +| Fora do ponto médio | valor 100,0051, sem NF | vira 100,01, 
          +RECUSADO `NOTA_FISCAL_AUSENTE` | RN-001, RN-008 |             
      608  | Três casas decimais | 33,333 | `valor_solicitado` 33,33 | RN
           -001 |
      609  | Exatamente no limite diário | alimentação 60,00 isolada | AP
           ROVADO 60,00 | RN-009 |
      610  | Um centavo acima do limite | alimentação 60,01 isolada | PAR
           CIAL 60,00 | RN-010 |

  Searched for 1 pattern (ctrl+o to expand)

● Update(d:\Usuario\Projetos\Dev\Apps\sdd-desafio\specs\001-motor-reembolso\DECI
        SIONS.md)
  ⎿  Added 71 lines
      17  
      18  ---
      19  
      20 +## D-010 — Arredondamento meio para o par (RN-001, AMB-013) · `
         +2026-09-29`                                                    
      21 +                                                               
      22 +**Gatilho:** revisão da AMB-013 pelo usuário (D-009). O Claude 
         +perguntou qual                                                 
      23 +regra de desempate usar e explicou o arredondamento bancário.  
      24 +                                                               
      25 +**O que mudou na spec:**                                       
      26 +- RN-001 e AMB-013: o desempate passa de "meio para cima" para 
         +**meio para o                                                  
      27 +  par**. O aceite da RN-001 foi atualizado: `10.005` agora vira
         + 10.00, e não                                                  
      28 +  mais 10.01. Também entraram `10.015` → 10.02, `33.345` → 33.3
         +4 e                                                            
      29 +  `33.3451` → 33.35.                                           
      30 +- Casos de borda: o caso "Arredondamento meio-para-cima" (100,0
         +05 vira                                                        
      31 +  100,01 e é RECUSADO) foi substituído por três casos: 100,005 
         +→ 100,00, não                                                  
      32 +  exige NF; 100,015 → 100,02, RECUSADO; 100,0051 → 100,01, RECU
         +SADO.                                                          
      33 +                                                               
      34 +**Por quê:** nas palavras do usuário, "não sabemos o tamanho do
         +s arquivos que                                                 
      35 +serão utilizados fora o exemplo e seria interessante reduzir o 
         +viés num                                                       
      36 +projeto em escala real". O Claude tinha recomendado manter meio
         + para cima,                                                    
      37 +porque o arredondamento acontece uma vez por item e é mais fáci
         +l de conferir                                                  
      38 +à mão. O usuário preferiu a neutralidade estatística.          
      39 +                                                               
      40 +**O que isso invalidou:** o aceite `10.005` → 10.01 e o caso de
         + borda                                                         
      41 +100,005 → RECUSADO. Nenhum item do exemplo muda: `d-011` (33,33
         +3) não cai no                                                  
      42 +ponto médio.                                                   
      43 +                                                               
      44 +**Tasks afetadas:** nenhuma (tasks ainda não existiam).        
      45 +                                                               
      46 +**Custo:** 1 arquivo, 3 trechos.                               
      47 +                                                               
      48 +---                                                            
      49 +                                                               
      50 +## D-009 — Revisão pelo usuário das ambiguidades decididas pelo
         + Claude · `2026-09-29`                                         
      51 +                                                               
      52 +**Gatilho:** revisão das 16 ambiguidades que o Claude decidiu s
         +ozinho na                                                      
      53 +D-001 (todas, exceto AMB-007, AMB-008 e AMB-011, e a AMB-020 cr
         +iada depois).                                                  
      54 +                                                               
      55 +**O que mudou na spec:** só a AMB-013 (registrada na D-010). As
         + outras 15                                                     
      56 +foram confirmadas como estavam. As justificativas do usuário es
         +tão abaixo                                                     
      57 +porque às vezes o motivo é diferente do que está na spec:      
      58 +                                                               
      59 +| AMB | Confirmação | Justificativa do usuário |               
      60 +|---|---|---|                                                  
      61 +| 001 | limite por dia | a política diz "por dia", contar por d
         +espesa seria erro |                                            
      62 +| 002 | ordem da entrada | garante o mesmo resultado em execuçõ
         +es repetidas |                                                 
      63 +| 003 | paga até o limite | falta regra clara para outro tratam
         +ento |                                                         
      64 +| 004 | estritamente > 100,00 | "acima de R$ 100" é explícito: 
         +100,00 não exige, 100,01 exige |                               
      65 +| 005 | valor de cada despesa | toda despesa acima de 100 preci
         +sa de nota para ser reembolsada |                              
      66 +| 006 | recusa integral | a nota é obrigatória pela política | 
      67 +| 009 | data fora de `inicio`/`fim` é recusada | fora do períod
         +o é fora da competência |                                      
      68 +| 010 | valem `inicio`/`fim` | datas explícitas evitam ambiguid
         +ade de regras financeiras |                                    
      69 +| 012 | negativo e zero recusados | a política não trata esses 
         +valores |                                                      
      70 +| 013 | arredondar antes das regras | consistência entre testes
         + (desempate alterado na D-010) |                               
      71 +| 014 | normalizar a categoria | ajuda a classificar cada despe
         +sa |                                                           
      72 +| 015 | limite inclusivo | 60,00 cabe; 60,01 sai PARCIAL 60,00 
         +(AMB-003) |                                                    
      73 +| 016 | dia de calendário | a política não diferencia fim de se
         +mana nem feriado |                                             
      74 +| 017 | NF continua > 100 em viagem | a ampliação é de limites,
         + não da exigência de nota |                                    
      75 +| 018 | recusa só o item; `tem_nota_fiscal` ausente = sem nota 
         +| a política não trata despesa lançada errado |                
      76 +| 019 | recusa integral | item 9 da política |                 
      77 +                                                               
      78 +Quatro pontos que a resposta do usuário não cobria foram confir
         +mados                                                          
      79 +explicitamente: `tem_nota_fiscal` ausente vale como "sem nota" 
         +(AMB-018);                                                     
      80 +60,01 sai PARCIAL e não é recusado (AMB-015); valor zero é recu
         +sado como o                                                    
      81 +negativo (AMB-012); e o desempate do arredondamento, que mudou 
         +(D-010).                                                       
      82 +                                                               
      83 +**O que isso invalidou:** nada.                                
      84 +                                                               
      85 +**Tasks afetadas:** nenhuma.                                   
      86 +                                                               
      87 +**Custo:** 0 arquivos (a mudança está na D-010).               
      88 +                                                               
      89 +---                                                            
      90 +                                                               
      91  ## D-008 — Hospedagem fora da ampliação de viagem (AMB-020) · `
          2026-09-29`
      92  
      93  **Gatilho:** o Claude apontou que, com a viagem inferida pela p
          rópria

● A AMB-013 agora usa o arredondamento meio para o par, e as duas entradas novas
  estão no log de decisões. Não fiz commit.

  O que mudou no spec.md (specs/001-motor-reembolso/spec.md):
  - RN-001 (spec.md:153-164 (specs/001-motor-reembolso/spec.md#L153-L164)): a
    regra agora é meio para o par. Nos critérios de aceite, 10.005 passou a
    virar 10.00 (antes virava 10.01). Entraram três exemplos novos: 10.015 →
    10.02, 33.345 → 33.34 e 33.3451 → 33.35, que mostra um valor fora do ponto
    médio.
  - AMB-013 (spec.md:502-515 (specs/001-motor-reembolso/spec.md#L502-L515)): a
    decisão mudou, e a justificativa registra o seu motivo e o custo de conferir
    à mão.
  - Casos de borda (spec.md:605-607
    (specs/001-motor-reembolso/spec.md#L605-L607)): o caso "100,005 → RECUSADO"
    deu lugar a três casos:

  ┌────────────────┬────────────────┬────────────────┐
  │ Valor sem nota │ Arredonda para │   Resultado    │
  ├────────────────┼────────────────┼────────────────┤
  │ 100,005        │ 100,00         │ não exige nota │
  ├────────────────┼────────────────┼────────────────┤
  │ 100,015        │ 100,02         │ RECUSADO       │
  ├────────────────┼────────────────┼────────────────┤
  │ 100,0051       │ 100,01         │ RECUSADO       │
  └────────────────┴────────────────┴────────────────┘

  Nenhum resultado do arquivo de exemplo muda: o d-011 (33,333) não cai no ponto
  médio.

  Entradas novas no DECISIONS.md (specs/001-motor-reembolso/DECISIONS.md):
  - D-010: a mudança do arredondamento. Registra o seu motivo e que eu tinha
    recomendado manter o meio para cima.
  - D-009: a revisão das outras 15 ambiguidades, todas confirmadas como estavam.
    Tem uma tabela com a sua justificativa para cada uma e os quatro pontos que
    confirmamos à parte (AMB-018, 015, 012 e 013).

  Com isso, as 20 ambiguidades estão revisadas por você.

  Quando escrevermos o plan.md, ele precisa usar um tipo decimal com
  arredondamento meio para o par. Em ponto flutuante, 100,005 pode ser guardado
  como 100,00499… e arredondar para o lado errado. Isso é assunto do plan, então
  não coloquei na spec.

  Quer que eu faça o commit como docs(spec): revisão das ambiguidades e
  arredondamento meio para o par (D-009, D-010)?