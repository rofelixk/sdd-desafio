
> /speckit-clarify

  Searched for 1 pattern, read 1 file, ran 2 shell commands (ctrl+o to expand)

● Spec está bem madura; encontrei poucas lacunas que ainda afetam testes.
  Primeira pergunta:

  Question: Duas despesas sem fornecedor (campo ausente ou vazio), com mesma
  data, categoria e valor, devem ser tratadas como duplicatas? (RN-007)

  Why it matters: fornecedor é opcional, mas faz parte do critério de duplicata.
  A spec não diz se "ausente = ausente" conta como igual, e isso muda o
  resultado de um teste de aceite.

  Recommended: Option A - Ausente e vazio contam como o mesmo fornecedor
  (vazio). Assim a regra continua determinística e evita pagar duas vezes um
  lançamento repetido só porque o campo não foi preenchido. O risco de falso
  positivo já foi aceito na seção 10.

  ┌────────┬─────────────────────────────────────────────────────────────────┐
  │ Option │                           Description                           │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ A      │ Ausente e vazio contam como fornecedor vazio. Duas despesas sem │
  │        │  fornecedor e com os demais campos iguais são duplicatas        │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ B      │ Despesa sem fornecedor nunca é duplicata. Falta informação para │
  │        │  afirmar que é o mesmo gasto                                    │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ C      │ Despesa sem fornecedor é recusada com DADO_INVALIDO (o          │
  │        │ fornecedor passa a ser obrigatório)                             │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ Short  │ Outra resposta curta (até 5 palavras)                           │
  └────────┴─────────────────────────────────────────────────────────────────┘

  Responda com a letra (ex.: "A"), aceite a recomendação com "yes" /
  "recommended", ou escreva sua própria resposta curta.

> como não tem nenhuma regra sobre fornecedor na política de reembolso duas
  despesas com mesma data, categoria e valor devem ser tratadas como duplicadas

● Sua resposta pode ser lida de dois jeitos, e cada um muda a RN-007 de forma
  diferente. Preciso confirmar qual antes de gravar:

  Question: O fornecedor deve sair do critério de duplicata para todas as
  despesas, ou só não conta quando está ausente?

  Why it matters: na opção A, dois almoços de R$ 54,90 no mesmo dia em
  restaurantes diferentes passam a ser duplicata e o segundo é recusado. Na
  opção B, fornecedores diferentes continuam separando as despesas.

  Recommended: Option A - É a leitura literal do que você disse: a política não
  fala de fornecedor, então ele não entra no critério. Isso deixa a regra mais
  simples e sem depender de um campo opcional. O custo é que aumenta o risco de
  falso positivo, já aceito na seção 10, e vou registrar isso lá.

  ┌────────┬─────────────────────────────────────────────────────────────────┐
  │ Option │                           Description                           │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ A      │ Critério = mesma data + mesma categoria normalizada + mesmo     │
  │        │ valor. fornecedor é ignorado sempre                             │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ B      │ fornecedor continua no critério quando os dois têm. Se algum    │
  │        │ dos dois não tem, compara só data, categoria e valor            │
  └────────┴─────────────────────────────────────────────────────────────────┘

  Responda com a letra ou "yes" para a recomendação.

> fornecedor continua como critério caso duas tenham, um almoço e jantar no
  mesmo dia com o exato mesmo valor será lido como duplicata por falta de
  horário específico. mesma categoria e mesmo fornecedor vazio registra como
  "mesmo fornecedor"

● Entendi: é a opção B. O fornecedor só é comparado quando as duas despesas têm
  fornecedor. Se uma delas ou as duas não têm, o critério é só data, categoria e
  valor, e duas sem fornecedor são "o mesmo fornecedor". Também vou registrar
  como risco aceito o caso de almoço e jantar com o mesmo valor. Vou gravar isso
  na spec e no DECISIONS.md, como a constituição exige.

  Read 1 file, ran 1 shell command (ctrl+o to expand)

● Plan e tasks ainda são templates, então nenhuma task é afetada. Aplicando as
  edições na spec:

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 6 lines
      24  forma determinística quanto de cada despesa é reembolsável e ju
          stifica cada
      25  decisão com um motivo padronizado.
      26  
      27 +## Clarifications                                              
      28 +                                                               
      29 +### Session 2026-09-29                                         
      30 +                                                               
      31 +- Q: Duas despesas sem `fornecedor`, com mesma data, categoria 
         +e valor, são duplicatas? → A: Sim. O fornecedor só é comparado 
         +quando as duas despesas têm fornecedor. Se uma ou as duas não t
         +êm (ausente ou vazio), o critério é só data, categoria normaliz
         +ada e valor (RN-007, AMB-011).                                 
      32 +                                                               
      33  ## 3. Fora de escopo
      34  
      35  - Não efetua pagamento nem integra com folha, ERP ou banco. Só 
          calcula.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      69  | `despesas[].data` | data `AAAA-MM-DD` | Data em que a despesa
           ocorreu | sim |
      70  | `despesas[].categoria` | texto | Categoria declarada (ver RN-
          002) | sim |
      71  | `despesas[].descricao` | texto | Texto livre. Em hospedagem, 
          é de onde se extrai o número de diárias (RN-012). Ausente = 1 d
          iária | não |
      72 -| `despesas[].fornecedor` | texto | Fornecedor, usado na detecç
         -ão de duplicata | não |                                        
      72 +| `despesas[].fornecedor` | texto | Fornecedor, usado na detecç
         +ão de duplicata quando as duas despesas o informam (RN-007) | n
         +ão |                                                           
      73  | `despesas[].valor` | número | Valor solicitado em reais, pode
           ter qualquer número de casas decimais | sim |
      74  | `despesas[].tem_nota_fiscal` | booleano | Se há nota fiscal. 
          Ausente equivale a `false` | não |
      75  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 6 lines, removed 3 lines
      218  ### RN-007 — Duplicatas
      219  
      220  **Regra:** Duas despesas são duplicatas quando têm a mesma `da
           ta`, a mesma
      221 -categoria normalizada, o mesmo `fornecedor` (comparado sem dif
          -erenciar                                                      
      222 -maiúsculas de minúsculas e sem espaços nas bordas) e o mesmo `
          -valor_solicitado`,                                            
      223 -com `id` diferente. `descricao` e `tem_nota_fiscal` não entram
          - no critério.                                                 
      221 +categoria normalizada e o mesmo `valor_solicitado`, com `id` d
          +iferente, e,                                                  
      222 +**se as duas informam `fornecedor`**, o mesmo fornecedor (comp
          +arado sem                                                     
      223 +diferenciar maiúsculas de minúsculas e sem espaços nas bordas)
          +. `fornecedor`                                                
      224 +ausente, vazio ou só com espaços conta como "não informado". S
          +e ao menos uma                                                
      225 +das duas não informa fornecedor, o fornecedor não entra na com
          +paração.                                                      
      226 +`descricao` e `tem_nota_fiscal` não entram no critério.       
      227  Num grupo de duplicatas, **só a primeira ocorrência na ordem d
           a entrada**
      228  segue para as próximas regras. As demais são **RECUSADAS** com
            `DUPLICATA`. A
      229  descrição do motivo cita o `id` da ocorrência aceita e não pre
           ssupõe má-fé.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines
      230  **Origem:** política do RH, item 8 (AMB-011)
      231  **Aceite:** `d-006` e `d-007` (2026-07-09, alimentação, Bistro
            Central, 54,90):
      232  `d-006` segue normalmente (APROVADO 54,90) e `d-007` → RECUSAD
           O/`DUPLICATA`.
      233 +Duas despesas de alimentação de 40,00 na mesma data, as duas s
          +em fornecedor →                                               
      234 +a 2ª RECUSADO/`DUPLICATA`.                                    
      235  
      236  ### RN-008 — Nota fiscal obrigatória
      237  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 3 lines, removed 2 lines
      487  
      488  **Texto original do RH:** "Duplicatas devem ser tratadas."
      489  **O que não está claro:** (1) o que é uma duplicata; (2) como 
           ela é tratada.
      490 -**Decisão:** (1) critério: mesma data, categoria normalizada, 
          -fornecedor e                                                  
      491 -valor, com `id` diferente (RN-007). (2) Só a primeira ocorrênc
          -ia na ordem da                                                
      490 +**Decisão:** (1) critério: mesma data, categoria normalizada e
          + valor, com `id`                                              
      491 +diferente. O fornecedor só é comparado quando as duas despesas
          + o informam. Se                                               
      492 +uma delas não informa, ele não entra no critério (RN-007). (2)
          + Só a primeira ocorrência na ordem da                         
      493  entrada segue. As demais são recusadas com `DUPLICATA`, sem ne
           nhuma marcação
      494  de suspeita de fraude.
      495  **Justificativa:** erros de cadastro acontecem, então nesta et
           apa não se

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 3 lines, removed 1 line
      496  presume má-fé. Paga-se o gasto real uma vez e a cópia é descar
           tada. `id`
      497  diferente não prova que a despesa é outra, porque o mesmo gast
           o lançado duas
      498  vezes recebe dois ids. A descrição fica fora do critério porqu
           e é texto livre e
      499 -varia à toa.                                                  
      499 +varia à toa. A política não fala de fornecedor. Por isso forne
          +cedores                                                       
      500 +diferentes só separam duas despesas quando os dois foram infor
          +mados, e a                                                    
      501 +falta do campo não impede de reconhecer uma duplicata.        
      502  **Regra afetada:** RN-007
      503  
      504  ### AMB-012 — Valores negativos (estorno) e zero

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 4 lines
      638  | Duplicata com e sem NF | idênticas, só `tem_nota_fiscal` dif
           ere | continuam duplicatas; a 1ª segue, a 2ª RECUSADO `DUPLICA
           TA` | RN-007 |
      639  | Três cópias idênticas | mesmo data/categoria/fornecedor/valo
           r ×3 | 1ª segue; 2ª e 3ª RECUSADO `DUPLICATA` | RN-007 |
      640  | Fornecedor com grafia diferente | "Bistro Central" vs "bistr
           o central " | são duplicatas | RN-007 |
      641 +| Fornecedores diferentes | mesma data/categoria/valor, "Tavol
          +a" vs "Porto" | não são duplicatas | RN-007 |                 
      642 +| Ambas sem fornecedor | mesma data/categoria/valor, `forneced
          +or` ausente nas duas | 1ª segue; 2ª RECUSADO `DUPLICATA` | RN-
          +007 |                                                         
      643 +| Só uma com fornecedor | mesma data/categoria/valor, "Tavola"
          + vs `fornecedor` ausente | 1ª segue; 2ª RECUSADO `DUPLICATA` |
          + RN-007 |                                                     
      644 +| Fornecedor vazio | mesma data/categoria/valor, `""` vs `"   
          +"` | 1ª segue; 2ª RECUSADO `DUPLICATA` | RN-007 |             
      645  | Diárias na descrição | hospedagem "Hotel Rio - 2 diarias", 4
           80,00 | N = 2, limite 500,00 → APROVADO 480,00 | RN-012 |
      646  | Diárias com acento e maiúscula | "3 Diárias" | N = 3 | RN-01
           2 |
      647  | Duas hospedagens na mesma noite | `h1` 14/07 "2 diarias" 480
           ,00; depois `h2` 15/07 "1 diaria" 200,00 | `h1` APROVADO 480,0
           0 (240 + 240); `h2` PARCIAL 10,00 | RN-012 |

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 5 lines, removed 3 lines
      751    paga em período anterior, o sistema não compensa. Isso é tra
           tado fora do
      752    motor.
      753  - **Critério de duplicata (AMB-011):** duas despesas legítimas
            e idênticas no
      754 -  mesmo dia (ex.: dois cafés iguais no mesmo lugar) serão trat
          -adas como                                                     
      755 -  duplicata. O risco foi aceito porque o caso é raro e o colab
          -orador pode                                                   
      756 -  relançar a despesa com o fornecedor detalhado.              
      754 +  mesmo dia (ex.: dois cafés iguais no mesmo lugar, ou almoço 
          +e jantar de                                                   
      755 +  mesmo valor no mesmo restaurante ou sem fornecedor informado
          +) serão tratadas                                              
      756 +  como duplicata, porque a entrada não traz horário. O risco f
          +oi aceito porque                                              
      757 +  o caso é raro e o colaborador pode relançar a despesa com o 
          +fornecedor                                                    
      758 +  detalhado.                                                  

● Registrando no DECISIONS.md:

● Update(specs\001-motor-reembolso\DECISIONS.md)
  ⎿  Added 34 lines
      17  
      18  ---
      19  
      20 +## D-011 — Duplicata com fornecedor ausente (RN-007, AMB-011) ·
         + `2026-09-29`                                                  
      21 +                                                               
      22 +**Gatilho:** `/speckit-clarify`. O Claude perguntou se duas des
         +pesas sem                                                      
      23 +`fornecedor` (campo opcional), com mesma data, categoria e valo
         +r, são                                                         
      24 +duplicatas.                                                    
      25 +                                                               
      26 +**O que mudou na spec:**                                       
      27 +- RN-007 e AMB-011: o fornecedor só é comparado quando as duas 
         +despesas o                                                     
      28 +  informam. Ausente, vazio ou só com espaços conta como "não in
         +formado". Se                                                   
      29 +  ao menos uma não informa, o critério é só data, categoria nor
         +malizada e                                                     
      30 +  valor.                                                       
      31 +- Seção 4: a descrição do campo `fornecedor` foi atualizada.   
      32 +- Casos de borda: entraram 4 casos (fornecedores diferentes, am
         +bas sem                                                        
      33 +  fornecedor, só uma com fornecedor, fornecedor vazio).        
      34 +- Seção 10: o risco aceito agora inclui almoço e jantar de mesm
         +o valor, porque                                                
      35 +  a entrada não traz horário.                                  
      36 +- Nova seção `Clarifications`.                                 
      37 +                                                               
      38 +**Por quê:** nas palavras do usuário, "como não tem nenhuma reg
         +ra sobre                                                       
      39 +fornecedor na política", a falta do fornecedor não pode impedir
         + que se                                                        
      40 +reconheça uma duplicata. Fornecedores diferentes, quando os doi
         +s foram                                                        
      41 +informados, continuam separando as despesas. O Claude tinha rec
         +omendado                                                       
      42 +tratar "ausente = ausente" (duplicata só se as duas não tiverem
      43 +fornecedor). O usuário ampliou para "basta uma não ter".       
      44 +                                                               
      45 +**O que isso invalidou:** o critério anterior, que exigia forne
         +cedor igual                                                    
      46 +sempre. Nenhum item do exemplo muda, porque todos têm fornecedo
         +r.                                                             
      47 +                                                               
      48 +**Tasks afetadas:** nenhuma (tasks ainda não existiam).        
      49 +                                                               
      50 +**Custo:** 2 arquivos, 8 trechos.                              
      51 +                                                               
      52 +---                                                            
      53 +                                                               
      54  ## D-010 — Arredondamento meio para o par (RN-001, AMB-013) · `
          2026-09-29`
      55  
      56  **Gatilho:** revisão da AMB-013 pelo usuário (D-009). O Claude 
          perguntou qual

● Gravado. Essa decisão cria uma lacuna nova, então a próxima pergunta é sobre
  ela:

  Question: Quando uma despesa sem fornecedor "casa" com duas outras que têm
  fornecedores diferentes entre si, com quais despesas cada nova despesa deve
  ser comparada? (RN-007)

  Why it matters: veja A = Tavola, B = sem fornecedor e C = Porto, todas no
  mesmo dia, mesma categoria e mesmo valor. B é duplicata de A e de C, mas A e C
  não são duplicatas entre si. Sem uma regra, o resultado de C depende de como
  o código monta o "grupo", e dois desenvolvedores chegariam a respostas
  diferentes.

  Recommended: Option A - Cada despesa é comparada só com as anteriores que
  foram aceitas (as que não foram recusadas como duplicata). Fica determinístico
  e explicável item a item: A segue, B vira duplicata de A e C segue, porque só
  é comparada com A, que tem outro fornecedor. O motivo sempre cita a
  ocorrência aceita.

  ┌────────┬─────────────────────────────────────────────────────────────────┐
  │ Option │                           Description                           │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ A      │ Compara com as anteriores aceitas. A segue, B DUPLICATA de A, C │
  │        │  segue                                                          │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ B      │ Compara com todas as anteriores, inclusive as já recusadas por  │
  │        │ duplicata. A segue, B DUPLICATA, C DUPLICATA (casa com B)       │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ C      │ Uma despesa sem fornecedor que casa com fornecedores diferentes │
  │        │  é ambígua e segue normalmente (não é duplicata)                │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ Short  │ Outra resposta curta (até 5 palavras)                           │
  └────────┴─────────────────────────────────────────────────────────────────┘

  Responda com a letra, "yes" para a recomendação, ou uma resposta curta.

> uma despesa sem fornecedor não pode ser definida como sendo duplicata de
  outra despesa da mesma categoria somente pelos outros valores, mesma
  racionalização de não ter um horário que definiria com mais segurança
  duplicidade em objetos desfalcados

● Essa resposta contradiz em parte o que acabei de gravar na D-011, onde "só uma
  com fornecedor" virou duplicata. Antes de mudar a spec de novo, preciso saber
  até onde vai a nova regra:

  Question: Com a nova regra, o que acontece quando as duas despesas não têm
  fornecedor (mesma data, categoria e valor)?

  Why it matters: na sua resposta anterior, "fornecedor vazio registra como
  mesmo fornecedor", então duas despesas sem fornecedor eram duplicatas. O
  argumento de agora ("objeto desfalcado não prova duplicidade") vale para esse
  caso também. É preciso escolher uma das duas regras, e os casos de borda que
  acabei de escrever dependem disso.

  Recommended: Option A - Segue o seu raciocínio de agora até o fim. Se falta
  fornecedor, não há prova suficiente de duplicidade, seja em uma ou nas duas
  despesas. É a regra mais simples de explicar e elimina o problema de A/B/C da
  pergunta anterior. O custo: uma despesa lançada duas vezes sem fornecedor é
  paga duas vezes, só que dentro do limite diário, que continua limitando o
  dano.

  ┌────────┬─────────────────────────────────────────────────────────────────┐
  │ Option │                           Description                           │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ A      │ Sem fornecedor em qualquer uma das duas → nunca é duplicata.    │
  │        │ Duplicata exige fornecedor informado e igual nas duas           │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ B      │ Só uma sem fornecedor → não é duplicata. As duas sem fornecedor │
  │        │  → são duplicatas (vazio = mesmo fornecedor)                    │
  └────────┴─────────────────────────────────────────────────────────────────┘

  Responda com a letra ou "yes" para a recomendação.

> o meu texto não foi claro suficiente. Uma despesa com fornecedor vazio deve
  ser tratado como fornecedor exatamente isso, vazio. uma despesa vazia
  comparada com outra vazia pode dar duplicaçaõ caso seus outros valores sejam
  iguais. uma despesa com fornecedor preenchido nunca irá contar como duplicado
  de uma com fornecedor vazio

● Agora ficou claro, e é a regra mais simples: fornecedor vazio é um valor como
  qualquer outro. Ele é sempre comparado, vazio só casa com vazio, e fornecedor
  preenchido nunca casa com vazio. Isso também resolve o problema de A/B/C,
  porque a relação passa a ser transitiva: se A casa com B e B casa com C, então
  A casa com C. Vou considerar ausente e só espaços como vazio (a regra já tira
  os espaços das bordas). Corrigindo a spec e a D-011:

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines, removed 1 line
      28  
      29  ### Session 2026-09-29
      30  
      31 -- Q: Duas despesas sem `fornecedor`, com mesma data, categoria 
         -e valor, são duplicatas? → A: Sim. O fornecedor só é comparado 
         -quando as duas despesas têm fornecedor. Se uma ou as duas não t
         -êm (ausente ou vazio), o critério é só data, categoria normaliz
         -ada e valor (RN-007, AMB-011).                                 
      31 +- Q: Duas despesas sem `fornecedor`, com mesma data, categoria 
         +e valor, são duplicatas? → A: Sim. Fornecedor ausente, vazio ou
         + só com espaços vale como fornecedor **vazio**, que é um valor 
         +comparado como qualquer outro: vazio casa com vazio, e forneced
         +or preenchido nunca casa com vazio (RN-007, AMB-011).          
      32 +- Q: Quando uma despesa sem fornecedor casaria com duas outras 
         +de fornecedores diferentes, com quais ela é comparada? → A: O c
         +aso deixa de existir, porque vazio não casa com fornecedor pree
         +nchido. O fornecedor é sempre comparado, então a relação de dup
         +licata é transitiva.                                           
      33  
      34  ## 3. Fora de escopo
      35  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      70  | `despesas[].data` | data `AAAA-MM-DD` | Data em que a despesa
           ocorreu | sim |
      71  | `despesas[].categoria` | texto | Categoria declarada (ver RN-
          002) | sim |
      72  | `despesas[].descricao` | texto | Texto livre. Em hospedagem, 
          é de onde se extrai o número de diárias (RN-012). Ausente = 1 d
          iária | não |
      73 -| `despesas[].fornecedor` | texto | Fornecedor, usado na detecç
         -ão de duplicata quando as duas despesas o informam (RN-007) | n
         -ão |                                                           
      73 +| `despesas[].fornecedor` | texto | Fornecedor, usado na detecç
         +ão de duplicata. Ausente equivale a vazio (RN-007) | não |     
      74  | `despesas[].valor` | número | Valor solicitado em reais, pode
           ter qualquer número de casas decimais | sim |
      75  | `despesas[].tem_nota_fiscal` | booleano | Se há nota fiscal. 
          Ausente equivale a `false` | não |
      76  

● Update(specs\001-motor-reembolso\spec.md)  ⎿  Added 5 lines, removed 5 lines
      219  ### RN-007 — Duplicatas
      220  
      221  **Regra:** Duas despesas são duplicatas quando têm a mesma `da
           ta`, a mesma
      222 -categoria normalizada e o mesmo `valor_solicitado`, com `id` d
          -iferente, e,                                                  
      223 -**se as duas informam `fornecedor`**, o mesmo fornecedor (comp
          -arado sem                                                     
      224 -diferenciar maiúsculas de minúsculas e sem espaços nas bordas)
          -. `fornecedor`                                                
      225 -ausente, vazio ou só com espaços conta como "não informado". S
          -e ao menos uma                                                
      226 -das duas não informa fornecedor, o fornecedor não entra na com
          -paração.                                                      
      222 +categoria normalizada, o mesmo `fornecedor` (comparado sem dif
          +erenciar                                                      
      223 +maiúsculas de minúsculas e sem espaços nas bordas) e o mesmo  
      224 +`valor_solicitado`, com `id` diferente. `fornecedor` ausente o
          +u só com espaços                                              
      225 +vale como fornecedor **vazio**, que é comparado como qualquer 
          +outro valor:                                                  
      226 +vazio é igual a vazio, e um fornecedor preenchido nunca é igua
          +l a vazio.                                                    
      227  `descricao` e `tem_nota_fiscal` não entram no critério.
      228  Num grupo de duplicatas, **só a primeira ocorrência na ordem d
           a entrada**
      229  segue para as próximas regras. As demais são **RECUSADAS** com
            `DUPLICATA`. A

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines, removed 1 line
      232  **Aceite:** `d-006` e `d-007` (2026-07-09, alimentação, Bistro
            Central, 54,90):
      233  `d-006` segue normalmente (APROVADO 54,90) e `d-007` → RECUSAD
           O/`DUPLICATA`.
      234  Duas despesas de alimentação de 40,00 na mesma data, as duas s
           em fornecedor →
      235 -a 2ª RECUSADO/`DUPLICATA`.                                    
      235 +a 2ª RECUSADO/`DUPLICATA`. Se só uma delas tiver fornecedor, a
          +s duas seguem                                                 
      236 +normalmente.                                                  
      237  
      238  ### RN-008 — Nota fiscal obrigatória
      239  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 3 lines, removed 3 lines
      489  
      490  **Texto original do RH:** "Duplicatas devem ser tratadas."
      491  **O que não está claro:** (1) o que é uma duplicata; (2) como 
           ela é tratada.
      492 -**Decisão:** (1) critério: mesma data, categoria normalizada e
          - valor, com `id`                                              
      493 -diferente. O fornecedor só é comparado quando as duas despesas
          - o informam. Se                                               
      494 -uma delas não informa, ele não entra no critério (RN-007). (2)
          - Só a primeira ocorrência na ordem da                         
      492 +**Decisão:** (1) critério: mesma data, categoria normalizada, 
          +fornecedor e                                                  
      493 +valor, com `id` diferente. Fornecedor ausente vale como vazio,
          + e vazio só é                                                 
      494 +igual a vazio (RN-007). (2) Só a primeira ocorrência na ordem 
          +da                                                            
      495  entrada segue. As demais são recusadas com `DUPLICATA`, sem ne
           nhuma marcação
      496  de suspeita de fraude.
      497  **Justificativa:** erros de cadastro acontecem, então nesta et
           apa não se

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 5 lines, removed 3 lines
      498  presume má-fé. Paga-se o gasto real uma vez e a cópia é descar
           tada. `id`
      499  diferente não prova que a despesa é outra, porque o mesmo gast
           o lançado duas
      500  vezes recebe dois ids. A descrição fica fora do critério porqu
           e é texto livre e
      501 -varia à toa. A política não fala de fornecedor. Por isso forne
          -cedores                                                       
      502 -diferentes só separam duas despesas quando os dois foram infor
          -mados, e a                                                    
      503 -falta do campo não impede de reconhecer uma duplicata.        
      501 +varia à toa. Fornecedor vazio é tratado literalmente como vazi
          +o: duas                                                       
      502 +despesas sem fornecedor e com o resto igual são indistinguívei
          +s. Já uma                                                     
      503 +despesa sem fornecedor não tem dado suficiente para ser declar
          +ada cópia de                                                  
      504 +uma que tem fornecedor. Assim a relação de duplicata é transit
          +iva, e o grupo                                                
      505 +de duplicatas não depende da ordem de comparação.             
      506  **Regra afetada:** RN-007
      507  
      508  ### AMB-012 — Valores negativos (estorno) e zero

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines, removed 2 lines
      644  | Fornecedor com grafia diferente | "Bistro Central" vs "bistr
           o central " | são duplicatas | RN-007 |
      645  | Fornecedores diferentes | mesma data/categoria/valor, "Tavol
           a" vs "Porto" | não são duplicatas | RN-007 |
      646  | Ambas sem fornecedor | mesma data/categoria/valor, `forneced
           or` ausente nas duas | 1ª segue; 2ª RECUSADO `DUPLICATA` | RN-
           007 |
      647 -| Só uma com fornecedor | mesma data/categoria/valor, "Tavola"
          - vs `fornecedor` ausente | 1ª segue; 2ª RECUSADO `DUPLICATA` |
          - RN-007 |                                                     
      648 -| Fornecedor vazio | mesma data/categoria/valor, `""` vs `"   
          -"` | 1ª segue; 2ª RECUSADO `DUPLICATA` | RN-007 |             
      647 +| Só uma com fornecedor | mesma data/categoria/valor, "Tavola"
          + vs `fornecedor` ausente | não são duplicatas; as duas seguem 
          +| RN-007 |                                                    
      648 +| Fornecedor vazio | mesma data/categoria/valor, `""` vs `"   
          +"` vs ausente | 1ª segue; 2ª e 3ª RECUSADO `DUPLICATA` | RN-00
          +7 |                                                           
      649  | Diárias na descrição | hospedagem "Hotel Rio - 2 diarias", 4
           80,00 | N = 2, limite 500,00 → APROVADO 480,00 | RN-012 |
      650  | Diárias com acento e maiúscula | "3 Diárias" | N = 3 | RN-01
           2 |
      651  | Duas hospedagens na mesma noite | `h1` 14/07 "2 diarias" 480
           ,00; depois `h2` 15/07 "1 diaria" 200,00 | `h1` APROVADO 480,0
           0 (240 + 240); `h2` PARCIAL 10,00 | RN-012 |

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      756    motor.
      757  - **Critério de duplicata (AMB-011):** duas despesas legítimas
            e idênticas no
      758    mesmo dia (ex.: dois cafés iguais no mesmo lugar, ou almoço 
           e jantar de
      759 -  mesmo valor no mesmo restaurante ou sem fornecedor informado
          -) serão tratadas                                              
      759 +  mesmo valor no mesmo restaurante, ou ambos sem fornecedor) s
          +erão tratadas                                                 
      760    como duplicata, porque a entrada não traz horário. O risco f
           oi aceito porque
      761    o caso é raro e o colaborador pode relançar a despesa com o 
           fornecedor
      762    detalhado.

● Now the D-011 correction (the D-011 entry had not been committed yet, so I'm
  rewriting it rather than adding a new one):

● Update(specs\001-motor-reembolso\DECISIONS.md)
  ⎿  Added 28 lines, removed 15 lines
      24  duplicatas.
      25  
      26  **O que mudou na spec:**
      27 -- RN-007 e AMB-011: o fornecedor só é comparado quando as duas 
         -despesas o                                                     
      28 -  informam. Ausente, vazio ou só com espaços conta como "não in
         -formado". Se                                                   
      29 -  ao menos uma não informa, o critério é só data, categoria nor
         -malizada e                                                     
      30 -  valor.                                                       
      31 -- Seção 4: a descrição do campo `fornecedor` foi atualizada.   
      32 -- Casos de borda: entraram 4 casos (fornecedores diferentes, am
         -bas sem                                                        
      33 -  fornecedor, só uma com fornecedor, fornecedor vazio).        
      27 +- RN-007 e AMB-011: fornecedor ausente ou só com espaços vale c
         +omo fornecedor                                                 
      28 +  **vazio**, e vazio é comparado como qualquer outro valor. Dua
         +s despesas sem                                                 
      29 +  fornecedor e com o resto igual são duplicatas. Uma despesa co
         +m fornecedor                                                   
      30 +  preenchido nunca é duplicata de uma com fornecedor vazio.    
      31 +- Seção 4: a descrição do campo `fornecedor` diz que ausente eq
         +uivale a vazio.                                                
      32 +- Casos de borda: entraram 3 casos (fornecedores diferentes, am
         +bas sem                                                        
      33 +  fornecedor, só uma com fornecedor) e 1 caso de vazio equivale
         +nte                                                            
      34 +  (`""`, `"   "` e ausente).                                   
      35  - Seção 10: o risco aceito agora inclui almoço e jantar de mesm
          o valor, porque
      36    a entrada não traz horário.
      37  - Nova seção `Clarifications`.
      38  
      38 -**Por quê:** nas palavras do usuário, "como não tem nenhuma reg
         -ra sobre                                                       
      39 -fornecedor na política", a falta do fornecedor não pode impedir
         - que se                                                        
      40 -reconheça uma duplicata. Fornecedores diferentes, quando os doi
         -s foram                                                        
      41 -informados, continuam separando as despesas. O Claude tinha rec
         -omendado                                                       
      42 -tratar "ausente = ausente" (duplicata só se as duas não tiverem
      43 -fornecedor). O usuário ampliou para "basta uma não ter".       
      39 +**Como se chegou lá (3 rodadas):** a primeira resposta do usuár
         +io ("como não                                                  
      40 +tem nenhuma regra sobre fornecedor na política...") foi lida pe
         +lo Claude como                                                 
      41 +"basta uma das duas não ter fornecedor para o critério ignorá-l
         +o", e isso                                                     
      42 +chegou a ser gravado. A pergunta seguinte do Claude mostrou o e
         +feito dessa                                                    
      43 +leitura: com `A` = Tavola, `B` = vazio e `C` = Porto, `B` casav
         +a com `A` e com                                                
      44 +`C`, mas `A` não casava com `C`. O usuário então esclareceu: "u
         +ma despesa com                                                 
      45 +fornecedor vazio deve ser tratada como fornecedor exatamente is
         +so, vazio [...]                                                
      46 +uma despesa com fornecedor preenchido nunca irá contar como dup
         +licado de uma                                                  
      47 +com fornecedor vazio". Essa é a opção que o Claude tinha recome
         +ndado na                                                       
      48 +primeira pergunta.                                             
      49  
      45 -**O que isso invalidou:** o critério anterior, que exigia forne
         -cedor igual                                                    
      46 -sempre. Nenhum item do exemplo muda, porque todos têm fornecedo
         -r.                                                             
      50 +**Por quê:** fornecedor ausente é um dado desfalcado. Sem horár
         +io na entrada,                                                 
      51 +ele não basta para declarar que uma despesa é cópia de outra qu
         +e tem                                                          
      52 +fornecedor. Duas despesas igualmente sem fornecedor, porém, são
      53 +indistinguíveis. Além disso, a relação de duplicata fica transi
         +tiva, e o                                                      
      54 +resultado não depende da ordem das comparações.                
      55  
      56 +**O que isso invalidou:** a leitura intermediária ("só uma com 
         +fornecedor" era                                                
      57 +duplicata), que ficou só na área de trabalho e nunca foi commit
         +ada. O critério                                                
      58 +da D-004 continua valendo, agora com o caso de fornecedor vazio
         + explícito.                                                    
      59 +Nenhum item do exemplo muda, porque todos têm fornecedor.      
      60 +                                                               
      61  **Tasks afetadas:** nenhuma (tasks ainda não existiam).
      62  
      63  **Custo:** 2 arquivos, 8 trechos.

● Duplicatas resolvidas. Próxima pergunta (3 de 5):

  Question: Uma despesa com valor escrito como texto, por exemplo "45.00" ou
  "45,00" entre aspas em vez de número, deve ser aceita ou recusada? (RN-003)

  Why it matters: a RN-003 recusa "valor não numérico", mas não diz se um texto
  que parece número conta como numérico. Duas implementações corretas da spec
  dariam resultados diferentes, e o DADO_INVALIDO desse caso precisa de um
  teste.

  Recommended: Option A - O valor precisa ser do tipo número. Texto é recusado
  com DADO_INVALIDO, mesmo quando parece número. Isso bate com a seção 3 ("não
  interpreta texto livre"), evita ter que decidir entre vírgula e ponto como
  separador decimal e mantém a entrada no formato do arquivo de exemplo.

  ┌────────┬─────────────────────────────────────────────────────────────────┐
  │ Option │                           Description                           │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ A      │ Só número é aceito. "45.00" → RECUSADO DADO_INVALIDO            │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ B      │ Texto com número no formato 45.00 (ponto decimal) é aceito como │
  │        │  número. Qualquer outro texto é DADO_INVALIDO                   │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ C      │ Texto é aceito com ponto ou vírgula decimal ("45.00" e "45,00") │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ Short  │ Outra resposta curta (até 5 palavras)                           │
  └────────┴─────────────────────────────────────────────────────────────────┘

  Responda com a letra, "yes" para a recomendação, ou uma resposta curta.

> não temos informação suficiente sobre quem gera o json de entrada, então
  vamos aceitar tanto 45.00 como 45,00 e número diretos

● Registrado como opção C. Para a regra ficar testável, ela precisa de um
  formato fechado. Vou gravar assim: texto com sinal opcional, dígitos e no
  máximo um separador decimal (ponto ou vírgula) é aceito. Espaços nas bordas
  são ignorados. Separador de milhar ("1.234,56") é recusado com DADO_INVALIDO,
  porque "1.234" poderia ser mil duzentos e trinta e quatro ou um vírgula dois
  três quatro. Se quiser outra coisa para o separador de milhar, me diga.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      71  | `despesas[].categoria` | texto | Categoria declarada (ver RN-
          002) | sim |
      72  | `despesas[].descricao` | texto | Texto livre. Em hospedagem, 
          é de onde se extrai o número de diárias (RN-012). Ausente = 1 d
          iária | não |
      73  | `despesas[].fornecedor` | texto | Fornecedor, usado na detecç
          ão de duplicata. Ausente equivale a vazio (RN-007) | não |
      74 -| `despesas[].valor` | número | Valor solicitado em reais, pode
         - ter qualquer número de casas decimais | sim |                 
      74 +| `despesas[].valor` | número ou texto numérico | Valor solicit
         +ado em reais, pode ter qualquer número de casas decimais. També
         +m é aceito como texto no formato fechado da RN-003 (`"45.00"`, 
         +`"45,00"`) | sim |                                             
      75  | `despesas[].tem_nota_fiscal` | booleano | Se há nota fiscal. 
          Ausente equivale a `false` | não |
      76  
      77  **Saída:** definida por mim. Estrutura e significado de cada ca
          mpo:

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 12 lines, removed 2 lines
      186  `valor` não numérico, ou com `id` igual ao de uma despesa ante
           rior no arquivo, é
      187  **RECUSADA** com `DADO_INVALIDO`. As demais despesas continuam
            sendo
      188  processadas normalmente.
      189 -**Origem:** ausente na política (AMB-018)                     
      189 +                                                              
      190 +`valor` é numérico quando é um número ou um texto que, sem os 
          +espaços das                                                   
      191 +bordas, tem sinal `-` opcional, um ou mais dígitos e, opcional
          +mente, **um**                                                 
      192 +separador decimal (ponto `.` ou vírgula `,`) seguido de um ou 
          +mais dígitos. O                                               
      193 +texto é convertido para o número correspondente antes da RN-00
          +1. Qualquer                                                   
      194 +outro texto (vazio, com separador de milhar, com símbolo de mo
          +eda, com dois                                                 
      195 +separadores, com letras) e qualquer outro tipo (booleano, list
          +a, objeto,                                                    
      196 +nulo) não são numéricos.                                      
      197 +**Origem:** ausente na política (AMB-018, AMB-021)            
      198  **Aceite:** uma despesa com `"data": "2026-07-32"` sai RECUSAD
           O/`DADO_INVALIDO`
      191 -e as outras despesas do arquivo têm o resultado de sempre.    
      199 +e as outras despesas do arquivo têm o resultado de sempre. `"4
          +5.00"`,                                                       
      200 +`"45,00"` e `45.00` dão o mesmo resultado (`valor_solicitado` 
          +45,00).                                                       
      201 +`"1.234,56"` e `"R$ 45,00"` → RECUSADO/`DADO_INVALIDO`.       
      202  
      203  ### RN-004 — Valores não positivos
      204  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 7 lines
      673  | Viagem não altera o limiar de NF | dia de viagem, transporte
            110,00 sem NF | RECUSADO `NOTA_FISCAL_AUSENTE` | RN-008 |
      674  | Data impossível | `2026-02-30` | RECUSADO `DADO_INVALIDO`, o
           s outros itens seguem | RN-003 |
      675  | `id` repetido | dois itens com `id` "d-001" | o segundo RECU
           SADO `DADO_INVALIDO` | RN-003 |
      676 +| Valor como texto com ponto | `"valor": "45.00"` | tratado co
          +mo 45,00 | RN-003 |                                           
      677 +| Valor como texto com vírgula | `"valor": "45,00"` | tratado 
          +como 45,00 | RN-003 |                                         
      678 +| Valor texto com 3 casas | `"valor": "33,333"` | 33,333 → `va
          +lor_solicitado` 33,33 | RN-003, RN-001 |                      
      679 +| Valor texto negativo | `"valor": "-45,00"` | RECUSADO `VALOR
          +_NAO_POSITIVO` | RN-003, RN-004 |                             
      680 +| Separador de milhar | `"valor": "1.234,56"` | RECUSADO `DADO
          +_INVALIDO` | RN-003 |                                         
      681 +| Símbolo de moeda | `"valor": "R$ 45,00"` | RECUSADO `DADO_IN
          +VALIDO` | RN-003 |                                            
      682 +| Valor booleano | `"valor": true` | RECUSADO `DADO_INVALIDO` 
          +| RN-003 |                                                    
      683  | `tem_nota_fiscal` ausente, valor 150,00 | — | RECUSADO `NOTA
           _FISCAL_AUSENTE` | RN-008 |
      684  | Lista de despesas vazia | `despesas: []` | saída com `itens`
            vazio e totais 0,00 | RN-014 |
      685  | Arquivo sem `periodo` | — | erro, nenhuma saída gerada | RN-
           015 |

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line
      30  
      31  - Q: Duas despesas sem `fornecedor`, com mesma data, categoria 
          e valor, são duplicatas? → A: Sim. Fornecedor ausente, vazio ou
           só com espaços vale como fornecedor **vazio**, que é um valor 
          comparado como qualquer outro: vazio casa com vazio, e forneced
          or preenchido nunca casa com vazio (RN-007, AMB-011).
      32  - Q: Quando uma despesa sem fornecedor casaria com duas outras 
          de fornecedores diferentes, com quais ela é comparada? → A: O c
          aso deixa de existir, porque vazio não casa com fornecedor pree
          nchido. O fornecedor é sempre comparado, então a relação de dup
          licata é transitiva.
      33 +- Q: Uma despesa com `valor` escrito como texto (`"45.00"`, `"4
         +5,00"`) deve ser aceita? → A: Sim, com ponto ou vírgula decimal
         +, além de número direto. Formato fechado: sinal opcional, dígit
         +os e no máximo um separador decimal. Separador de milhar e símb
         +olo de moeda → `DADO_INVALIDO` (RN-003, AMB-021).              
      34  
      35  ## 3. Fora de escopo
      36  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 16 lines
      622  mantém todos os itens da política com efeito.
      623  **Regra afetada:** RN-009, RN-011
      624  
      625 +### AMB-021 — `valor` escrito como texto                      
      626 +                                                              
      627 +**Texto original do RH:** a política não fala do assunto.     
      628 +**O que não está claro:** a RN-003 recusa "valor não numérico"
          +, mas um texto                                                
      629 +como `"45.00"` ou `"45,00"` pode ou não ser considerado numéri
          +co: (a) só o tipo                                             
      630 +número é aceito; (b) texto com ponto decimal é aceito; (c) tex
          +to com ponto ou                                               
      631 +vírgula decimal é aceito.                                     
      632 +**Decisão:** (c). Número e texto com ponto ou vírgula decimal 
          +são aceitos, no                                               
      633 +formato fechado da RN-003. Texto com separador de milhar, símb
          +olo de moeda ou                                               
      634 +mais de um separador é `DADO_INVALIDO`.                       
      635 +**Justificativa:** não se sabe quem gera o arquivo de entrada,
          + e recusar                                                    
      636 +`"45,00"` puniria o colaborador por um detalhe de formatação. 
          +O separador de                                                
      637 +milhar fica de fora porque `"1.234"` não tem leitura única (12
          +34 ou 1,234), e                                               
      638 +ambiguidade em valor monetário não pode ser resolvida por adiv
          +inhação.                                                      
      639 +**Regra afetada:** RN-003                                     
      640 +                                                              
      641  ---
      642  
      643  ## 7. Casos de borda

● Update(specs\001-motor-reembolso\DECISIONS.md)
  ⎿  Added 27 lines
      17  
      18  ---
      19  
      20 +## D-012 — `valor` aceito como texto (RN-003, AMB-021) · `2026-
         +09-29`                                                         
      21 +                                                               
      22 +**Gatilho:** `/speckit-clarify`. O Claude perguntou se `"45.00"
         +` (texto) conta                                                
      23 +como valor numérico na RN-003.                                 
      24 +                                                               
      25 +**O que mudou na spec:**                                       
      26 +- RN-003: definição fechada de "valor numérico". Pode ser númer
         +o ou texto com                                                 
      27 +  sinal opcional, dígitos e no máximo um separador decimal (`.`
         + ou `,`), sem                                                  
      28 +  os espaços das bordas. Qualquer outro texto ou tipo é `DADO_I
         +NVALIDO`.                                                      
      29 +- Seção 4: o tipo do campo `valor` passou a "número ou texto nu
         +mérico".                                                       
      30 +- Nova AMB-021. Entraram 7 casos de borda.                     
      31 +                                                               
      32 +**Por quê:** nas palavras do usuário, "não temos informação suf
         +iciente sobre                                                  
      33 +quem gera o json de entrada, então vamos aceitar tanto 45.00 co
         +mo 45,00 e                                                     
      34 +número diretos". O Claude tinha recomendado aceitar só número. 
         +A exclusão do                                                  
      35 +separador de milhar e do símbolo de moeda foi complemento do Cl
         +aude, para                                                     
      36 +manter o formato fechado (`"1.234"` é ambíguo). O usuário foi a
         +visado.                                                        
      37 +                                                               
      38 +**O que isso invalidou:** nada. Nenhum item do exemplo muda, po
         +rque todos os                                                  
      39 +valores são números.                                           
      40 +                                                               
      41 +**Tasks afetadas:** nenhuma (tasks ainda não existiam).        
      42 +                                                               
      43 +**Custo:** 2 arquivos, 6 trechos.                              
      44 +                                                               
      45 +---                                                            
      46 +                                                               
      47  ## D-011 — Duplicata com fornecedor ausente (RN-007, AMB-011) ·
           `2026-09-29`
      48  
      49  **Gatilho:** `/speckit-clarify`. O Claude perguntou se duas des
          pesas sem

● Gravado. Próxima pergunta (4 de 5), sobre o campo irmão:

  Question: Um tem_nota_fiscal que não é booleano, por exemplo "true", "sim", 1
  ou null, deve contar como "tem nota", "sem nota" ou recusar a despesa?
  (RN-008)

  Why it matters: a spec só diz que ausente vale "sem nota". Com a entrada de
  origem desconhecida (mesmo argumento da pergunta anterior), um "sim" que vire
  "sem nota" recusa uma despesa de R$ 150 que deveria ser paga. O resultado muda
  e precisa de teste.

  Recommended: Option B - null vale como ausente ("sem nota"), e um conjunto
  fechado de textos e números afirmativos/negativos é aceito: "true"/"false",
  "sim"/"nao", 1/0, sem diferenciar maiúsculas nem acentos. Qualquer outro valor
  é DADO_INVALIDO. Segue a mesma linha tolerante e fechada que você escolheu
  para o valor, e nunca adivinha: um valor estranho não vira "sem nota" em
  silêncio.

  ┌────────┬─────────────────────────────────────────────────────────────────┐
  │ Option │                           Description                           │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ A      │ Só true é "tem nota". Qualquer outro valor, inclusive texto,    │
  │        │ vale "sem nota"                                                 │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │        │ null = ausente = sem nota. Aceita true/false, "true"/"false",   │
  │ B      │ "sim"/"nao", 1/0 (sem diferenciar maiúsculas e acentos). O      │
  │        │ resto → DADO_INVALIDO                                           │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ C      │ Só booleano ou ausente. Qualquer outro valor (inclusive null) → │
  │        │  DADO_INVALIDO                                                  │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ Short  │ Outra resposta curta (até 5 palavras)                           │
  └────────┴─────────────────────────────────────────────────────────────────┘

  Responda com a letra, "yes" para a recomendação, ou uma resposta curta.

> para esse vamos aceitar somente booleanos, vazio conta como false. Qualquer
  outro valor DADO_INVALIDO

● Registrado. Vou tratar como "vazio" o campo ausente, null e texto vazio ou só
  com espaços (o mesmo critério de vazio do fornecedor). Tudo isso vale false.
  Só true/false booleanos são aceitos além disso, e qualquer outro valor
  ("true", "sim", 1, 0) → DADO_INVALIDO.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      73  | `despesas[].descricao` | texto | Texto livre. Em hospedagem, 
          é de onde se extrai o número de diárias (RN-012). Ausente = 1 d
          iária | não |
      74  | `despesas[].fornecedor` | texto | Fornecedor, usado na detecç
          ão de duplicata. Ausente equivale a vazio (RN-007) | não |
      75  | `despesas[].valor` | número ou texto numérico | Valor solicit
          ado em reais, pode ter qualquer número de casas decimais. També
          m é aceito como texto no formato fechado da RN-003 (`"45.00"`, 
          `"45,00"`) | sim |
      76 -| `despesas[].tem_nota_fiscal` | booleano | Se há nota fiscal. 
         -Ausente equivale a `false` | não |                             
      76 +| `despesas[].tem_nota_fiscal` | booleano | Se há nota fiscal. 
         +Vazio (ausente, nulo ou texto vazio) equivale a `false`. Qualqu
         +er outro valor não booleano é `DADO_INVALIDO` (RN-003) | não | 
      77  
      78  **Saída:** definida por mim. Estrutura e significado de cada ca
          mpo:
      79  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 6 lines, removed 1 line
      195  outro texto (vazio, com separador de milhar, com símbolo de mo
           eda, com dois
      196  separadores, com letras) e qualquer outro tipo (booleano, list
           a, objeto,
      197  nulo) não são numéricos.
      198 -**Origem:** ausente na política (AMB-018, AMB-021)            
      198 +                                                              
      199 +`tem_nota_fiscal` só aceita os booleanos `true` e `false`. Vaz
          +io (campo                                                     
      200 +ausente, nulo, ou texto vazio ou só com espaços) vale `false`.
          + Qualquer outro                                               
      201 +valor (textos como `"true"` ou `"sim"`, números como `1` ou `0
          +`, listas,                                                    
      202 +objetos) é `DADO_INVALIDO`.                                   
      203 +**Origem:** ausente na política (AMB-018, AMB-021, AMB-022)   
      204  **Aceite:** uma despesa com `"data": "2026-07-32"` sai RECUSAD
           O/`DADO_INVALIDO`
      205  e as outras despesas do arquivo têm o resultado de sempre. `"4
           5.00"`,
      206  `"45,00"` e `45.00` dão o mesmo resultado (`valor_solicitado` 
           45,00).

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines
      205  e as outras despesas do arquivo têm o resultado de sempre. `"4
           5.00"`,
      206  `"45,00"` e `45.00` dão o mesmo resultado (`valor_solicitado` 
           45,00).
      207  `"1.234,56"` e `"R$ 45,00"` → RECUSADO/`DADO_INVALIDO`.
      208 +`"tem_nota_fiscal": "sim"` → RECUSADO/`DADO_INVALIDO`.        
      209 +`"tem_nota_fiscal": null` vale `false`.                       
      210  
      211  ### RN-004 — Valores não positivos
      212  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 4 lines
      705  | Símbolo de moeda | `"valor": "R$ 45,00"` | RECUSADO `DADO_IN
           VALIDO` | RN-003 |
      706  | Valor booleano | `"valor": true` | RECUSADO `DADO_INVALIDO` 
           | RN-003 |
      707  | `tem_nota_fiscal` ausente, valor 150,00 | — | RECUSADO `NOTA
           _FISCAL_AUSENTE` | RN-008 |
      708 +| `tem_nota_fiscal` nulo ou `""`, valor 150,00 | `null` / `""`
          + | vale `false` → RECUSADO `NOTA_FISCAL_AUSENTE` | RN-003, RN-
          +008 |                                                         
      709 +| `tem_nota_fiscal` vazio, valor 50,00 | `null` | vale `false`
          +, não exige NF → segue para o limite | RN-003, RN-008 |       
      710 +| `tem_nota_fiscal` texto | `"true"` ou `"sim"` | RECUSADO `DA
          +DO_INVALIDO` (mesmo com valor ≤ 100,00) | RN-003 |            
      711 +| `tem_nota_fiscal` número | `1` ou `0` | RECUSADO `DADO_INVAL
          +IDO` | RN-003 |                                               
      712  | Lista de despesas vazia | `despesas: []` | saída com `itens`
            vazio e totais 0,00 | RN-014 |
      713  | Arquivo sem `periodo` | — | erro, nenhuma saída gerada | RN-
           015 |
      714  | `inicio` depois de `fim` | — | erro, nenhuma saída gerada | 
           RN-015 |
● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line
      31  - Q: Duas despesas sem `fornecedor`, com mesma data, categoria 
          e valor, são duplicatas? → A: Sim. Fornecedor ausente, vazio ou
           só com espaços vale como fornecedor **vazio**, que é um valor 
          comparado como qualquer outro: vazio casa com vazio, e forneced
          or preenchido nunca casa com vazio (RN-007, AMB-011).
      32  - Q: Quando uma despesa sem fornecedor casaria com duas outras 
          de fornecedores diferentes, com quais ela é comparada? → A: O c
          aso deixa de existir, porque vazio não casa com fornecedor pree
          nchido. O fornecedor é sempre comparado, então a relação de dup
          licata é transitiva.
      33  - Q: Uma despesa com `valor` escrito como texto (`"45.00"`, `"4
          5,00"`) deve ser aceita? → A: Sim, com ponto ou vírgula decimal
          , além de número direto. Formato fechado: sinal opcional, dígit
          os e no máximo um separador decimal. Separador de milhar e símb
          olo de moeda → `DADO_INVALIDO` (RN-003, AMB-021).
      34 +- Q: Um `tem_nota_fiscal` não booleano (`"true"`, `"sim"`, `1`,
         + `null`) conta como o quê? → A: Só booleanos são aceitos. Vazio
         + (ausente, nulo, texto vazio) vale `false`. Qualquer outro valo
         +r → `DADO_INVALIDO` (RN-003, AMB-022).                         
      35  
      36  ## 3. Fora de escopo
      37  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 18 lines
      646  ambiguidade em valor monetário não pode ser resolvida por adiv
           inhação.
      647  **Regra afetada:** RN-003
      648  
      649 +### AMB-022 — `tem_nota_fiscal` com valor não booleano        
      650 +                                                              
      651 +**Texto original do RH:** a política não fala do assunto.     
      652 +**O que não está claro:** a entrada pode trazer `"true"`, `"si
          +m"`, `1` ou                                                   
      653 +`null` em vez de um booleano. Leituras possíveis: (a) só `true
          +` é "tem nota" e                                              
      654 +o resto vale "sem nota"; (b) aceitar um conjunto de textos e n
          +úmeros                                                        
      655 +afirmativos; (c) aceitar só booleano e recusar o resto.       
      656 +**Decisão:** (c), com uma exceção para o vazio: campo ausente,
          + nulo, ou texto                                               
      657 +vazio ou só com espaços vale `false`. Qualquer outro valor não
          + booleano é                                                   
      658 +`DADO_INVALIDO`.                                              
      659 +**Justificativa:** a nota fiscal decide se uma despesa acima d
          +e R$ 100,00 é                                                 
      660 +paga. Um valor fora do padrão não deve virar "sem nota" em sil
          +êncio (isso                                                   
      661 +recusaria uma despesa legítima com o motivo errado), nem "tem 
          +nota" por                                                     
      662 +adivinhação. O vazio segue a AMB-018: o ônus de informar a not
          +a é de quem                                                   
      663 +pede. Diferente do `valor` (AMB-021), aqui não há texto afirma
          +tivo com                                                      
      664 +leitura única, então nenhum texto é aceito.                   
      665 +**Regra afetada:** RN-003, RN-008                             
      666 +                                                              
      667  ---
      668  
      669  ## 7. Casos de borda

● Update(specs\001-motor-reembolso\DECISIONS.md)
  ⎿  Added 29 lines
      17  
      18  ---
      19  
      20 +## D-013 — `tem_nota_fiscal` só booleano (RN-003, AMB-022) · `2
         +026-09-29`                                                     
      21 +                                                               
      22 +**Gatilho:** `/speckit-clarify`. O Claude perguntou como tratar
      23 +`tem_nota_fiscal` não booleano (`"true"`, `"sim"`, `1`, `null`)
         +.                                                              
      24 +                                                               
      25 +**O que mudou na spec:**                                       
      26 +- RN-003: só `true`/`false` booleanos são aceitos. Vazio (ausen
         +te, nulo, ou                                                   
      27 +  texto vazio ou só com espaços) vale `false`. Qualquer outro v
         +alor é                                                         
      28 +  `DADO_INVALIDO`.                                             
      29 +- Seção 4: a descrição do campo foi atualizada.                
      30 +- Nova AMB-022. Entraram 4 casos de borda.                     
      31 +                                                               
      32 +**Por quê:** decisão do usuário: "vamos aceitar somente boolean
         +os, vazio conta                                                
      33 +como false. Qualquer outro valor DADO_INVALIDO". O Claude tinha
         + recomendado                                                   
      34 +aceitar um conjunto fechado de textos e números (`"sim"`, `1`..
         +.), na mesma                                                   
      35 +linha tolerante do `valor` (D-012). O usuário preferiu ser estr
         +ito. Incluir                                                   
      36 +`null` e texto só com espaços em "vazio" foi interpretação do C
         +laude,                                                         
      37 +avisada ao usuário, para ficar coerente com o fornecedor vazio 
         +(D-011).                                                       
      38 +                                                               
      39 +**O que isso invalidou:** nada. "Ausente = `false`" (AMB-018) c
         +ontinua                                                        
      40 +valendo e foi estendido ao nulo e ao texto vazio. Nenhum item d
         +o exemplo                                                      
      41 +muda.                                                          
      42 +                                                               
      43 +**Tasks afetadas:** nenhuma (tasks ainda não existiam).        
      44 +                                                               
      45 +**Custo:** 2 arquivos, 7 trechos.                              
      46 +                                                               
      47 +---                                                            
      48 +                                                               
      49  ## D-012 — `valor` aceito como texto (RN-003, AMB-021) · `2026-
          09-29`
      50  
      51  **Gatilho:** `/speckit-clarify`. O Claude perguntou se `"45.00"
          ` (texto) conta

● Gravado. Última pergunta (5 de 5):

  Question: Uma despesa com id, categoria ou data presentes mas vazios ("" ou só
  espaços), ou com tipo errado (ex.: "categoria": 123), deve ser tratada como
  campo ausente, isto é, DADO_INVALIDO? (RN-003)

  Why it matters: a RN-003 recusa campo "ausente", mas não diz nada sobre campo
  vazio. Sem regra, "categoria": "" pode sair como DADO_INVALIDO (etapa 2) ou
  CATEGORIA_NAO_REEMBOLSAVEL (etapa 5), e um id vazio repetido pode ou não virar
  "id repetido". O código de motivo muda, e é ele que os testes verificam.

  Recommended: Option A - Um obrigatório vazio ou com tipo errado é o mesmo que
  ausente → DADO_INVALIDO. Fica coerente com o que você decidiu para
  tem_nota_fiscal (vazio = ausente) e com a spirit da RN-003: não dá para
  avaliar um item sem esses dados, e CATEGORIA_NAO_REEMBOLSAVEL passaria a ideia
  errada de que existe uma categoria.

  ┌────────┬─────────────────────────────────────────────────────────────────┐
  │ Option │                           Description                           │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ A      │ Obrigatório vazio, só espaços ou de tipo errado = ausente →     │
  │        │ DADO_INVALIDO                                                   │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │        │ Só a ausência do campo é DADO_INVALIDO. Vazio segue as regras   │
  │ B      │ normais (categoria "" → CATEGORIA_NAO_REEMBOLSAVEL, id "" é um  │
  │        │ id como outro)                                                  │
  ├────────┼─────────────────────────────────────────────────────────────────┤
  │ Short  │ Outra resposta curta (até 5 palavras)                           │
  └────────┴─────────────────────────────────────────────────────────────────┘

  Responda com a letra, "yes" para a recomendação, ou uma resposta curta.

> conta como o mesmo que ausente, não será possível calcular corretamente
  aquela despesa pela falta de informação. recusar como dado invalido

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 4 lines
      197  separadores, com letras) e qualquer outro tipo (booleano, list
           a, objeto,
      198  nulo) não são numéricos.
      199  
      200 +`id`, `data` e `categoria` que vêm vazios (texto vazio ou só c
          +om espaços),                                                  
      201 +nulos ou com tipo diferente de texto contam como **ausentes** 
          +→                                                             
      202 +`DADO_INVALIDO`.                                              
      203 +                                                              
      204  `tem_nota_fiscal` só aceita os booleanos `true` e `false`. Vaz
           io (campo
      205  ausente, nulo, ou texto vazio ou só com espaços) vale `false`.
            Qualquer outro
      206  valor (textos como `"true"` ou `"sim"`, números como `1` ou `0
           `, listas,

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines
      212  `"1.234,56"` e `"R$ 45,00"` → RECUSADO/`DADO_INVALIDO`.
      213  `"tem_nota_fiscal": "sim"` → RECUSADO/`DADO_INVALIDO`.
      214  `"tem_nota_fiscal": null` vale `false`.
      215 +`"categoria": ""` e `"categoria": 123` → RECUSADO/`DADO_INVALI
          +DO`, e não                                                    
      216 +`CATEGORIA_NAO_REEMBOLSAVEL`.                                 
      217  
      218  ### RN-004 — Valores não positivos
      219  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 4 lines
      722  | Viagem não altera o limiar de NF | dia de viagem, transporte
            110,00 sem NF | RECUSADO `NOTA_FISCAL_AUSENTE` | RN-008 |
      723  | Data impossível | `2026-02-30` | RECUSADO `DADO_INVALIDO`, o
           s outros itens seguem | RN-003 |
      724  | `id` repetido | dois itens com `id` "d-001" | o segundo RECU
           SADO `DADO_INVALIDO` | RN-003 |
      725 +| Categoria vazia | `"categoria": "  "` | RECUSADO `DADO_INVAL
          +IDO` (não `CATEGORIA_NAO_REEMBOLSAVEL`) | RN-003 |            
      726 +| Categoria não textual | `"categoria": 123` | RECUSADO `DADO_
          +INVALIDO` | RN-003 |                                          
      727 +| `id` vazio | `"id": ""` | RECUSADO `DADO_INVALIDO` | RN-003 
          +|                                                             
      728 +| `data` nula | `"data": null` | RECUSADO `DADO_INVALIDO` | RN
          +-003 |                                                        
      729  | Valor como texto com ponto | `"valor": "45.00"` | tratado co
           mo 45,00 | RN-003 |
      730  | Valor como texto com vírgula | `"valor": "45,00"` | tratado 
           como 45,00 | RN-003 |
      731  | Valor texto com 3 casas | `"valor": "33,333"` | 33,333 → `va
           lor_solicitado` 33,33 | RN-003, RN-001 |

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line
      32  - Q: Quando uma despesa sem fornecedor casaria com duas outras 
          de fornecedores diferentes, com quais ela é comparada? → A: O c
          aso deixa de existir, porque vazio não casa com fornecedor pree
          nchido. O fornecedor é sempre comparado, então a relação de dup
          licata é transitiva.
      33  - Q: Uma despesa com `valor` escrito como texto (`"45.00"`, `"4
          5,00"`) deve ser aceita? → A: Sim, com ponto ou vírgula decimal
          , além de número direto. Formato fechado: sinal opcional, dígit
          os e no máximo um separador decimal. Separador de milhar e símb
          olo de moeda → `DADO_INVALIDO` (RN-003, AMB-021).
      34  - Q: Um `tem_nota_fiscal` não booleano (`"true"`, `"sim"`, `1`,
           `null`) conta como o quê? → A: Só booleanos são aceitos. Vazio
           (ausente, nulo, texto vazio) vale `false`. Qualquer outro valo
          r → `DADO_INVALIDO` (RN-003, AMB-022).
      35 +- Q: `id`, `categoria` ou `data` vazios, nulos ou de tipo errad
         +o são o mesmo que ausentes? → A: Sim. Sem essa informação não d
         +á para calcular a despesa corretamente, então ela é recusada co
         +m `DADO_INVALIDO` (RN-003, AMB-018).                           
      36  
      37  ## 3. Fora de escopo
      38  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 3 lines, removed 2 lines
      607  **O que não está claro:** uma despesa sem valor, com data invá
           lida ou com id
      608  repetido invalida o arquivo inteiro ou só aquele item? E `tem_
           nota_fiscal`
      609  ausente?
      610 -**Decisão:** só o item é recusado (`DADO_INVALIDO`). `tem_nota
          -_fiscal` ausente                                              
      611 -equivale a "sem nota". Erro estrutural do arquivo interrompe a
          - execução                                                     
      610 +**Decisão:** só o item é recusado (`DADO_INVALIDO`). Obrigatór
          +io vazio, nulo                                                
      611 +ou de tipo errado conta como ausente. `tem_nota_fiscal` ausent
          +e equivale a                                                  
      612 +"sem nota" (ver AMB-022). Erro estrutural do arquivo interromp
          +e a execução                                                  
      613  (RN-015).
      614  **Justificativa:** um item mal preenchido não deve bloquear o 
           reembolso das
      615  outras despesas. O ônus de comprovar a nota é de quem pede.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 4 lines, removed 1 line
      612  "sem nota" (ver AMB-022). Erro estrutural do arquivo interromp
           e a execução
      613  (RN-015).
      614  **Justificativa:** um item mal preenchido não deve bloquear o 
           reembolso das
      615 -outras despesas. O ônus de comprovar a nota é de quem pede.   
      615 +outras despesas. Um campo obrigatório vazio não permite calcul
          +ar a despesa                                                  
      616 +corretamente, igual a um ausente. Recusar como `CATEGORIA_NAO_
          +REEMBOLSAVEL`                                                 
      617 +daria a entender que existe uma categoria. O ônus de comprovar
          + a nota é de                                                  
      618 +quem pede.                                                    
      619  **Regra afetada:** RN-003, RN-008, RN-015
      620  
      621  ### AMB-019 — Categoria fora da política: recusa total ou parc
           ial?

● Update(specs\001-motor-reembolso\DECISIONS.md)
  ⎿  Added 23 lines
      17  
      18  ---
      19  
      20 +## D-014 — Obrigatório vazio conta como ausente (RN-003, AMB-01
         +8) · `2026-09-29`                                              
      21 +                                                               
      22 +**Gatilho:** `/speckit-clarify`. O Claude perguntou se `id`, `c
         +ategoria` ou                                                   
      23 +`data` vazios, nulos ou de tipo errado equivalem a ausentes.   
      24 +                                                               
      25 +**O que mudou na spec:**                                       
      26 +- RN-003: esses casos contam como ausentes → `DADO_INVALIDO`. N
         +ovo aceite:                                                    
      27 +  `"categoria": ""` sai `DADO_INVALIDO`, não `CATEGORIA_NAO_REE
         +MBOLSAVEL`.                                                    
      28 +- AMB-018: a decisão e a justificativa foram ampliadas.        
      29 +- Entraram 4 casos de borda.                                   
      30 +                                                               
      31 +**Por quê:** nas palavras do usuário, "não será possível calcul
         +ar                                                             
      32 +corretamente aquela despesa pela falta de informação". É a opçã
         +o que o Claude                                                 
      33 +tinha recomendado.                                             
      34 +                                                               
      35 +**O que isso invalidou:** nada. Nenhum item do exemplo muda.   
      36 +                                                               
      37 +**Tasks afetadas:** nenhuma (tasks ainda não existiam).        
      38 +                                                               
      39 +**Custo:** 2 arquivos, 6 trechos.                              
      40 +                                                               
      41 +---                                                            
      42 +                                                               
      43  ## D-013 — `tem_nota_fiscal` só booleano (RN-003, AMB-022) · `2
          026-09-29`
      44  
      45  **Gatilho:** `/speckit-clarify`. O Claude perguntou como tratar

● Final validation pass:

  Searched for 1 pattern (ctrl+o to expand)

● Resumo

  A sessão de esclarecimento terminou: fiz as 5 perguntas e todas foram
  respondidas. A pergunta sobre duplicatas levou 3 rodadas até a regra ficar
  clara.

  Arquivos alterados (nada foi commitado ainda):
  - spec.md (specs/001-motor-reembolso/spec.md): nova seção Clarifications.
    Mudaram a seção 4 (campos fornecedor, valor e tem_nota_fiscal), a RN-003, a
    RN-007, a AMB-011 e a AMB-018. Criei a AMB-021 e a AMB-022, somei 19 casos
    de borda na seção 7 e atualizei a seção 10.
  - DECISIONS.md (specs/001-motor-reembolso/DECISIONS.md): entradas D-011 a
    D-014, como a constituição exige. A D-011 conta a leitura errada que eu fiz
    no meio do caminho e a correção.

  O que foi decidido:

  #: 1–2
  Tema: Duplicata sem fornecedor
  Decisão: Fornecedor ausente conta como vazio. Vazio só é igual a vazio, e
  fornecedor preenchido nunca é igual a vazio. Com isso, a regra de duplicata
  não depende da ordem em que as despesas são comparadas.
  ────────────────────────────────────────
  #: 3
  Tema: valor como texto
  Decisão: Aceita número e texto como "45.00" ou "45,00". Recusa com
  DADO_INVALIDO texto com separador de milhar ou com R$. Essa exclusão foi
  ideia minha.
  ────────────────────────────────────────
  #: 4
  Tema: tem_nota_fiscal
  Decisão: Só aceita true ou false. Vazio ou null vale false. Qualquer outro
  valor é DADO_INVALIDO.
  ────────────────────────────────────────
  #: 5
  Tema: id, categoria ou data vazios ou de tipo errado
  Decisão: Contam como ausentes: DADO_INVALIDO.

  Nenhum item de exemplos/despesas-exemplo.json muda de resultado. Nenhuma task
  é afetada, porque plan.md e tasks.md ainda são templates.

  Checklist de qualidade da spec: 16/16 → 16/16, sem mudanças.

  Cobertura:

  ┌────────────────────────────────────────┬────────────────────────────────┐
  │               Categoria                │             Status             │
  ├────────────────────────────────────────┼────────────────────────────────┤
  │ Escopo, objetivo, fora de escopo       │ Clear                          │
  ├────────────────────────────────────────┼────────────────────────────────┤
  │ Modelo de dados e validação de entrada │ Resolved                       │
  ├────────────────────────────────────────┼────────────────────────────────┤
  │ Duplicatas                             │ Resolved                       │
  ├────────────────────────────────────────┼────────────────────────────────┤
  │ Casos de borda e falhas                │ Resolved                       │
  ├────────────────────────────────────────┼────────────────────────────────┤
  │ Critérios de aceite e testabilidade    │ Clear                          │
  ├────────────────────────────────────────┼────────────────────────────────┤
  │ Terminologia                           │ Clear                          │
  ├────────────────────────────────────────┼────────────────────────────────┤
  │ Performance e volume                   │ Outstanding (baixo impacto)    │
  ├────────────────────────────────────────┼────────────────────────────────┤
  │ Formato da saída (ex.: 45.0 vs 45.00)  │ Deferred (fica para o plan.md) │
  └────────────────────────────────────────┴────────────────────────────────┘

  Três pontos pequenos ficaram em aberto, sem risco de retrabalho grande:
  - Limite para o número de diárias: a RN-012 não limita o N. Uma descrição com
    "400 diarias" espalharia a hospedagem por mais de um ano.
  - Id repetido: falta dizer se o id de uma despesa já recusada com
    DADO_INVALIDO conta como "id anterior" na regra de id repetido.
  - Campos extras: falta dizer o que fazer com campos da entrada que a spec não
    conhece.

  Dá para resolver qualquer um deles numa nova rodada de /speckit-clarify depois
  do plano.

  Próximo passo: /speckit-plan. Posso antes fazer o commit como docs(spec):
  esclarecimentos de duplicata e validação de entrada (D-011 a D-014).