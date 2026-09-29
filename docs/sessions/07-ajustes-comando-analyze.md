
> /speckit-analyze

  Read 5 files, ran 3 shell commands (ctrl+o to expand)

● Análise lida por completo (spec 1.2, plan 1.1, tasks, data-model, contratos,
  constituição, DECISIONS). Segue o relatório. Nenhum arquivo foi alterado.

  Relatório de análise da especificação

  ID: I1
  Categoria: Inconsistência
  Severidade: MEDIUM
  Local(is): spec.md:95 (specs/001-motor-reembolso/spec.md#L95), spec.md:108
  (specs/001-motor-reembolso/spec.md#L108)
  Resumo: valor_reembolsavel aparece como "em centavos", mas a frase logo abaixo

  diz que todo valor monetário da saída é "um número em reais".
  Recomendação: Trocar "em centavos" por "em reais, com precisão de centavos".
  ────────────────────────────────────────
  ID: I2
  Categoria: Inconsistência
  Severidade: MEDIUM
  Local(is): spec.md:804 (specs/001-motor-reembolso/spec.md#L804) vs spec.md:99
  (specs/001-motor-reembolso/spec.md#L99)
  Resumo: A linha de borda "Diárias na descrição" diz "limite 500,00", mas pela
  seção 4 o limite_diario_aplicado de hospedagem é o valor por diária (250,00).
   O teste da T-030 pode acabar verificando o valor errado.
  Recomendação: Reescrever como "limite 250,00 × 2 noites" ou deixar explícito
  que limite_diario_aplicado = 250,00.
  ────────────────────────────────────────
  ID: U1
  Categoria: Subespecificação
  Severidade: MEDIUM
  Local(is): RN-003, RN-007 (spec.md:280
  (specs/001-motor-reembolso/spec.md#L280)), RN-012
  Resumo: A spec não diz o que fazer quando fornecedor ou descricao vêm null,
  como número (123), lista ou objeto. Ela só cobre "ausente ou só com espaços".
   A T-015 e a T-018 teriam que decidir isso no código, o que é proibido pelo
  princípio III.
  Recomendação: Criar AMB-026 (por exemplo: tipo que não é texto conta como
  vazio, ou vira DADO_INVALIDO), registrar em DECISIONS e adicionar linhas na
  seção 7.
  ────────────────────────────────────────
  ID: U2
  Categoria: Subespecificação
  Severidade: MEDIUM
  Local(is): RN-015 (spec.md:406 (specs/001-motor-reembolso/spec.md#L406)),
  T-025
  Resumo: Faltam regras para colaborador.id vazio, nulo ou numérico, para
  periodo.inicio numérico e para um JSON cuja raiz não é objeto (lista,
  número). Da forma atual, a T-025 decide sozinha.
  Recomendação: Estender a RN-015 com o mesmo critério da RN-003 ("vazio, nulo
  ou
  de outro tipo = ausente").
  ────────────────────────────────────────
  ID: U3
  Categoria: Subespecificação
  Severidade: MEDIUM
  Local(is): RN-013, T-021, T-023
  Resumo: A RN-013 exige que o motivo cite o "saldo disponível" e o "valor
  cortado". Numa hospedagem de várias noites, não está definido se esses
  números são por noite ou a soma das noites. A T-021 diz que devolve "o saldo
  disponível" por despesa.
  Recomendação: Definir na spec (por exemplo: soma dos saldos das noites e soma
  dos cortes) ou declarar que a descrição cita noite por noite.
  ────────────────────────────────────────
  ID: U4
  Categoria: Subespecificação
  Severidade: LOW
  Local(is): spec.md:797 (specs/001-motor-reembolso/spec.md#L797)
  Resumo: A linha "Duplicata com e sem NF" não informa o valor nem qual das duas

  tem NF. O caso em que a 1ª está sem NF e acima de 100 (a 1ª é recusada por NF
   e a 2ª é DUPLICATA, então nada é pago) não aparece explicitamente.
  Recomendação: Fixar valor e ordem nessa linha. Opcionalmente, criar uma linha
  para o caso acima de 100 com a 1ª sem NF.
  ────────────────────────────────────────
  ID: F1
  Categoria: Inconsistência
  Severidade: MEDIUM
  Local(is): tasks.md:138 (specs/001-motor-reembolso/tasks.md#L138),
  tasks.md:143
  (specs/001-motor-reembolso/tasks.md#L143)
  Resumo: A T-023 e a T-024 estão marcadas [P], mas as duas editam motor.ts
  ("ligar no motor.ts").
  Recomendação: Tirar o [P] de uma delas ou mover a ligação no motor para uma
  etapa sequencial.
  ────────────────────────────────────────
  ID: F2
  Categoria: Inconsistência
  Severidade: MEDIUM
  Local(is): plan.md:101-108 (specs/001-motor-reembolso/plan.md#L101-L108),
  tasks.md:19 (specs/001-motor-reembolso/tasks.md#L19)
  Resumo: Estrutura de testes divergente entre plan e tasks: (1) o plan põe
  rn-015 em tests/nucleo/, e a T-025 põe em tests/io/; (2) motor.test.ts,
  io/json.test.ts, io/saida.test.ts, infra.test.ts, datas, dinheiro e politica
  não estão no plan; (3) a regra "um arquivo por RN" é quebrada pelo título
  RN-001 › dentro de rn-008-nota-fiscal.test.ts (T-016).
  Recomendação: Atualizar o plan §2 com a estrutura real e ajustar a convenção
  nas tasks (permitir testes multi-RN em motor.test.ts).
  ────────────────────────────────────────
  ID: F3
  Categoria: Inconsistência
  Severidade: LOW
  Local(is): CLAUDE.md, tasks.md:18 (specs/001-motor-reembolso/tasks.md#L18)
  Resumo: As tasks criam o prefixo Infra › ..., que não existe no CLAUDE.md.
  Pela
  Governança da constituição, uma convenção nova do agente deve ir para o
  CLAUDE.md.
  Recomendação: Acrescentar Infra › na seção "Convenções de código" do
  CLAUDE.md.
  ────────────────────────────────────────
  ID: F4
  Categoria: Inconsistência
  Severidade: LOW
  Local(is): CLAUDE.md, constitution.md
  Resumo: O CLAUDE.md e a constituição citam DECISIONS.md como se ficasse na
  raiz, mas o arquivo está em specs/001-motor-reembolso/DECISIONS.md.
  Recomendação: Informar o caminho completo nos dois documentos.
  ────────────────────────────────────────
  ID: F5
  Categoria: Inconsistência
  Severidade: LOW
  Local(is): saida.schema.json:5
  (specs/001-motor-reembolso/contracts/saida.schema.json#L5)
  Resumo: A description do schema diz "spec (v1.1)", mas a base atual é a 1.2.
  Recomendação: Atualizar para v1.2.
  ────────────────────────────────────────
  ID: G1
  Categoria: Cobertura
  Severidade: LOW
  Local(is): plan.md:244 (specs/001-motor-reembolso/plan.md#L244), T-038
  Resumo: O risco do plan prevê uma "verificação no início do cli.ts" de que
  JSON.rawJSON e context.source existem. Nenhuma task inclui isso.
  Recomendação: Adicionar à T-038 (ou a uma task nova) junto com um teste Infra
  ›.
  ────────────────────────────────────────
  ID: G2
  Categoria: Cobertura
  Severidade: LOW
  Local(is): contracts/cli.md (specs/001-motor-reembolso/contracts/cli.md),
  T-038
  Resumo: Dois comportamentos do contrato não têm teste: opção desconhecida →
  código 2, e falha ao gravar → código 1.
  Recomendação: Incluir no aceite da T-038.
  ────────────────────────────────────────
  ID: G3
  Categoria: Cobertura
  Severidade: LOW
  Local(is): spec.md:93 (specs/001-motor-reembolso/spec.md#L93)
  Resumo: Nenhum teste verifica que uma categoria desconhecida sai como veio
  (por
  exemplo, " Coworking " não sai normalizada).
  Recomendação: Adicionar um teste na T-014 ou na T-035.
  ────────────────────────────────────────
  ID: D1
  Categoria: Duplicação
  Severidade: LOW
  Local(is): spec.md:825 (specs/001-motor-reembolso/spec.md#L825)/830
  (specs/001-motor-reembolso/spec.md#L830), 841
  (specs/001-motor-reembolso/spec.md#L841)/842
  (specs/001-motor-reembolso/spec.md#L842)
  Resumo: Linhas de borda com a mesma entrada: "Eco de campo inválido" e
  "Categoria não textual" (as duas usam categoria: 123); "tem_nota_fiscal nulo"
   e "vazio, valor 50,00" (as duas usam null).
  Recomendação: Aceitável. As duas verificam aspectos diferentes. Opcionalmente,

  usar outra entrada em uma delas.
  ────────────────────────────────────────
  ID: D2
  Categoria: Duplicação
  Severidade: LOW
  Local(is): RN-007 "com id diferente", T-015
  Resumo: Essa condição nunca chega a ser avaliada. Um id normalizado repetido
  já
  foi recusado na etapa 2, e uma despesa DADO_INVALIDO nunca chega à etapa 6.
  Recomendação: Anotar isso na RN-007 ou tirar a condição da T-015 para não
  gerar
  código morto.
  ────────────────────────────────────────
  ID: A1
  Categoria: Ambiguidade
  Severidade: LOW
  Local(is): spec.md:855-856 (specs/001-motor-reembolso/spec.md#L855-L856) vs
  RN-003
  Resumo: A seção 8 põe o arredondamento (etapa 1) antes da validação (etapa 2).

  Mas é a RN-003 que converte o texto em número "antes da RN-001". O plan já
  trata as duas etapas juntas.
  Recomendação: Unificar as etapas 1 e 2 na seção 8 ou explicar a ordem.
  ────────────────────────────────────────
  ID: A2
  Categoria: Ambiguidade
  Severidade: LOW
  Local(is): tasks.md:251 (specs/001-motor-reembolso/tasks.md#L251)
  Resumo: Placeholders <Novas tasks...> e <hash preenchido depois>.
  Recomendação: Intencionais (Dia 2 e commits). Nenhuma ação.

  Resumo de cobertura:

  ┌────────────────────┬───────┬────────────────┬──────────────────────────┐
  │       Chave        │ Tem   │     Tasks      │       Observações        │
  │                    │ task? │                │                          │
  ├────────────────────┼───────┼────────────────┼──────────────────────────┤
  │ RN-001…RN-015      │ ✅    │ ver matriz em  │ Todas têm teste unitário │
  │                    │ 15/15 │ tasks.md       │  e de borda.             │
  ├────────────────────┼───────┼────────────────┼──────────────────────────┤
  │ AMB-001…AMB-025    │ ✅    │ ver matriz em  │ —                        │
  │                    │ 25/25 │ tasks.md       │                          │
  ├────────────────────┼───────┼────────────────┼──────────────────────────┤
  │                    │       │                │ Resumo conferido:        │
  │ §9 exemplo oficial │ ✅    │ T-036          │ 1.861,84 / 815,43 /      │
  │                    │       │                │ 1.046,41 · 4/3/7 bate    │
  │                    │       │                │ com os itens.            │
  ├────────────────────┼───────┼────────────────┼──────────────────────────┤
  │ §9 cada linha da   │       │ T-026…T-034,   │ 73 linhas, e todas foram │
  │ §7 com teste       │ ✅    │ T-040, T-041   │  atribuídas (conferi uma │
  │                    │       │                │  por uma).               │
  ├────────────────────┼───────┼────────────────┼──────────────────────────┤
  │ §9 cada RN com     │ ✅    │ T-041          │ —                        │
  │ teste              │       │                │                          │
  ├────────────────────┼───────┼────────────────┼──────────────────────────┤
  │ §9 schema da saída │ ✅    │ T-037          │ —                        │
  ├────────────────────┼───────┼────────────────┼──────────────────────────┤
  │ §9 determinismo    │ ✅    │ T-039          │ —                        │
  ├────────────────────┼───────┼────────────────┼──────────────────────────┤
  │ §9 entrada         │ ✅    │ T-025, T-038,  │ Ver U2 (casos de tipo    │
  │ inválida           │       │ T-040          │ não cobertos).           │
  └────────────────────┴───────┴────────────────┴──────────────────────────┘

  Problemas com a constituição: nenhum. Um risco: se U1 e U2 não forem
  resolvidos na spec, a implementação vai decidir no código, o que viola o
  princípio III.

  Tasks sem requisito associado: nenhuma. T-001 a T-005 são infraestrutura e
  estão ligadas ao plan/research, e a T-042 à entrega (§9).

  Métricas:
  - Requisitos: 46 (15 RN + 25 AMB + 6 critérios da §9)
  - Tasks: 42
  - Cobertura: 100%
  - Ambiguidades: 2 (mais 4 subespecificações)
  - Duplicações: 2
  - Problemas CRITICAL: 0

  Próximas ações

  Não há problema CRITICAL, então dá para seguir para /speckit-implement. Antes,
  recomendo resolver:

  1. U1 e U2 na spec: nova AMB, entrada em DECISIONS e novas linhas de borda.
     Assim a implementação não precisa decidir regra no código.
  2. I2 (limite de 500 contra 250 na linha de borda), antes que o teste da T-030
     seja escrito.
  3. F1 (tirar o [P] que conflita em motor.ts) e F2 (estrutura de testes),
     editando tasks.md e plan.md à mão.

  O resto (LOW) pode ser corrigido junto com as tasks correspondentes.

  Quer que eu sugira as edições concretas para os 5 problemas principais (U1,
  U2, I2, F1, F2)?

> <ide_opened_file>The user opened the file
  d:\Usuario\Projetos\Dev\Apps\sdd-desafio\specs\001-motor-reembolso\tasks.md
  in the IDE. This may or may not be related to the current
  task.</ide_opened_file>

> I2: deixar explicito o limite diario sendo 250; U1: fornecedor e descricao
  aceita qualquer valor, é tratado como string, nulo é vazio. categoria
  hospedagem sem descricao que declara diária é tratatdo como um único dia; U2:
  estender RN-015 para o mesmo critério de RN-003; F1: Tire o P da task T-024;
  F2: garanta um arquivo de testes para cada RN

● Vou aplicar na ordem da constituição: spec → DECISIONS → plan/data-model →
  tasks. Primeiro vejo o formato de uma entrada do DECISIONS.

  Read 1 file (ctrl+o to expand)

● Agora a spec (v1.2 → 1.3).

  Ran 1 shell command (ctrl+o to expand)

● Vou gravar o script em arquivo e executar.

  Made 1 scratchpad edit +148 (ctrl+o to expand)

● Bash(python
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/e7cf012c-2e88-4b90-966a-1018e8cc7c62/scratchpad/edit_spec.py" &&
      cd "D…)
  ⎿  Updated specs\001-motor-reembolso\spec.md (+78 -19)
      1  # Spec — Motor de Cálculo de Reembolso
      2  
      3 -**Versão:** 1.2 · **Status:** rascunho · **Última alteração:** `
        -2026-09-29`                                                     
      3 +**Versão:** 1.3 · **Status:** rascunho · **Última alteração:** `
        +2026-09-29`                                                     
      4  
      5  > **Regra de ouro deste arquivo:** ele descreve o QUÊ e o PORQUÊ
         . Nenhuma linha
      6  > aqui pode citar linguagem, biblioteca, classe, função ou estru
         tura de pasta.
     ...
      37  - Q: Em "Hotel 5 estrelas - 2 diarias", N é 2 ou 1? → A: 2. Val
          e a primeira ocorrência do padrão completo "<inteiro> diária(s)
          /noite(s)". Números soltos antes dela são ignorados (RN-012, AM
          B-008).
      38  - Q: `"d-001"`, `" d-001 "` e `"D-001"` são o mesmo `id` para a
           RN-003? → A: Sim. O `id` é normalizado como a categoria (maiús
          culas/minúsculas, espaços nas bordas, acentos) antes de compara
          r (RN-003, AMB-024).
      39  - Q: Uma despesa com o mesmo `id` de uma anterior que foi recus
          ada com `DADO_INVALIDO` também é `DADO_INVALIDO`? → A: Não. Ela
           é tratada como a correção da anterior e segue normalmente. Só 
          uma despesa que passou pela validação reserva o `id`. Recusas d
          e etapas posteriores (período, duplicata, nota fiscal...) conti
          nuam reservando o `id` (RN-003, AMB-025).
      40 +- Q: `fornecedor` ou `descricao` com valor que não é texto (`12
         +3`, `true`, lista, `null`) são aceitos? → A: Sim, qualquer valo
         +r é aceito e tratado como texto. Nulo vale vazio. Uma hospedage
         +m sem descrição que declare diárias vale uma única diária (RN-0
         +03, RN-007, RN-012, AMB-026).                                  
      41 +- Q: `colaborador.id`, `periodo.inicio` ou `periodo.fim` vazios
         +, nulos ou de tipo errado são o mesmo que ausentes? → A: Sim, c
         +om o mesmo critério da RN-003. O arquivo é recusado pela RN-015
         + (AMB-027).                                                    
      42 +- Q: Em "Diárias na descrição" (2 diárias, 480,00), qual é o `l
         +imite_diario_aplicado`? → A: 250,00, o limite por diária. O lim
         +ite da estadia inteira (500,00) não aparece na saída (seção 4).
      43  
      44  ## 3. Fora de escopo
      45  
     ...
      79  | `despesas[].id` | texto | Identificador único da despesa no a
          rquivo | sim |
      80  | `despesas[].data` | data `AAAA-MM-DD` | Data em que a despesa
           ocorreu | sim |
      81  | `despesas[].categoria` | texto | Categoria declarada (ver RN-
          002) | sim |
      79 -| `despesas[].descricao` | texto | Texto livre. Em hospedagem, 
         -é de onde se extrai o número de diárias (RN-012). Ausente = 1 d
         -iária | não |                                                  
      80 -| `despesas[].fornecedor` | texto | Fornecedor, usado na detecç
         -ão de duplicata. Ausente equivale a vazio (RN-007) | não |     
      82 +| `despesas[].descricao` | qualquer valor, tratado como texto |
         + Texto livre. Em hospedagem, é de onde se extrai o número de di
         +árias (RN-012). Ausente ou nulo = vazio = 1 diária (RN-003) | n
         +ão |                                                           
      83 +| `despesas[].fornecedor` | qualquer valor, tratado como texto 
         +| Fornecedor, usado na detecção de duplicata. Ausente ou nulo e
         +quivale a vazio (RN-003, RN-007) | não |                       
      84  | `despesas[].valor` | número ou texto numérico | Valor solicit
          ado em reais, pode ter qualquer número de casas decimais. També
          m é aceito como texto no formato fechado da RN-003 (`"45.00"`, 
          `"45,00"`) | sim |
      85  | `despesas[].tem_nota_fiscal` | booleano | Se há nota fiscal. 
          Vazio (ausente, nulo ou texto vazio) equivale a `false`. Qualqu
          er outro valor não booleano é `DADO_INVALIDO` (RN-003) | não |
      86  
     ...
      234  ausente, nulo, ou texto vazio ou só com espaços) vale `false`.
            Qualquer outro
      235  valor (textos como `"true"` ou `"sim"`, números como `1` ou `0
           `, listas,
      236  objetos) é `DADO_INVALIDO`.
      234 -**Origem:** ausente na política (AMB-018, AMB-021, AMB-022, AM
          -B-023, AMB-024, AMB-025)                                      
      237 +                                                              
      238 +`fornecedor` e `descricao` nunca causam `DADO_INVALIDO`: qualq
          +uer valor é                                                   
      239 +aceito e tratado como texto. Ausente ou nulo vale texto **vazi
          +o**. Texto é                                                  
      240 +usado como veio. Número e booleano viram o texto com que apare
          +cem no arquivo                                                
      241 +(`123` → `"123"`, `true` → `"true"`). Lista e objeto viram o s
          +eu texto JSON                                                 
      242 +compacto, sem espaços (AMB-026).                              
      243 +**Origem:** ausente na política (AMB-018, AMB-021, AMB-022, AM
          +B-023, AMB-024, AMB-025, AMB-026)                             
      244  **Aceite:** uma despesa com `"data": "2026-07-32"` sai RECUSAD
           O/`DADO_INVALIDO`
      245  com `data` `"2026-07-32"` na saída, e as outras despesas do ar
           quivo têm o
      246  resultado de sempre. `"valor": "R$ 45,00"` sai com `valor_soli
           citado` nulo.
     … 144 more lines (ctrl+o to expand)

  Ran 1 shell command (ctrl+o to expand)

● 80 linhas (73 + 7), confere. Agora o DECISIONS.

● Update(specs\001-motor-reembolso\DECISIONS.md)
  ⎿  Added 51 lines
      17  
      18  ---
      19  
      20 +## D-018 — Lacunas achadas no `/speckit-analyze` (RN-003, RN-00
         +7, RN-012, RN-015, AMB-026, AMB-027) · `2026-09-29`            
      21 +                                                               
      22 +**Gatilho:** `/speckit-analyze`, depois das tasks. A análise cr
         +uzada apontou                                                  
      23 +três pontos da spec que a implementação teria de decidir sozinh
         +a (I2, U1 e                                                    
      24 +U2 do relatório) e dois problemas nas tasks (F1 e F2). O usuári
         +o decidiu                                                      
      25 +cada um.                                                       
      26 +                                                               
      27 +**O que mudou na spec (versão 1.2 → 1.3):**                    
      28 +- RN-003: `fornecedor` e `descricao` aceitam qualquer valor, tr
         +atado como                                                     
      29 +  texto. Nulo vale vazio. Número e booleano viram o texto como 
         +aparecem no                                                    
      30 +  arquivo, e lista e objeto viram o texto JSON compacto. Nenhum
         + dos dois causa                                                
      31 +  `DADO_INVALIDO`. Seção 4 (tabela de entrada) atualizada.     
      32 +- RN-007: `fornecedor` nulo vale vazio, e `123` é igual a `"123
         +"`.                                                            
      33 +- RN-012: deixa explícito que hospedagem sem descrição (ausente
         +, nula, vazia)                                                 
      34 +  ou sem o padrão de diárias vale uma única diária.            
      35 +- RN-015: o mesmo critério da RN-003 para `colaborador.id`, `pe
         +riodo.inicio`                                                  
      36 +  e `periodo.fim` (vazio, nulo ou de outro tipo = ausente), e u
         +m arquivo que                                                  
      37 +  não é objeto é recusado.                                     
      38 +- Novas AMB-026 (fornecedor/descrição que não são texto) e AMB-
         +027 (campos                                                    
      39 +  obrigatórios do arquivo vazios ou de outro tipo).            
      40 +- Seção 7: "Diárias na descrição" passa a dizer que `limite_dia
         +rio_aplicado`                                                  
      41 +  é 250,00 (por diária), e não "limite 500,00". Sete casos novo
         +s: "Fornecedor                                                 
      42 +  numérico", "Fornecedor nulo", "Hospedagem sem descrição", "De
         +scrição não                                                    
      43 +  textual", "`colaborador.id` vazio", "`periodo.inicio` não tex
         +tual" e                                                        
      44 +  "Arquivo que não é objeto".                                  
      45 +- Três entradas em `Clarifications`.                           
      46 +                                                               
      47 +**Como se chegou lá:** o usuário respondeu ao relatório: "deixa
         +r explícito o                                                  
      48 +limite diário sendo 250"; "fornecedor e descricao aceita qualqu
         +er valor, é                                                    
      49 +tratado como string, nulo é vazio. categoria hospedagem sem des
         +cricao que                                                     
      50 +declara diária é tratado como um único dia"; "estender RN-015 p
         +ara o mesmo                                                    
      51 +critério de RN-003". O Claude escolheu como lista e objeto vira
         +m texto (JSON                                                  
      52 +compacto), porque "tratado como string" não dizia isso.        
      53 +                                                               
      54 +**Por quê:** ver AMB-026 e AMB-027. Na I2, a linha de borda con
         +tradizia a                                                     
      55 +seção 4 e poderia gerar um teste que verifica o limite errado. 
      56 +                                                               
      57 +**O que isso invalidou:** nada implementado (nenhuma task concl
         +uída). Nenhum                                                  
      58 +item do exemplo muda: todos têm `fornecedor` e `descricao` em t
         +exto.                                                          
      59 +                                                               
      60 +**Tasks afetadas:** T-007 e T-008 (conversão para texto), T-015
         + e T-018                                                       
      61 +(testes), T-025 (aceite da RN-015), T-029, T-030 e T-040 (casos
         + de borda                                                      
      62 +novos), T-024 (sai o `[P]`, porque também edita `motor.ts`, igu
         +al à T-023) e                                                  
      63 +a organização dos testes: um arquivo por RN, sem `motor.test.ts
         +` (T-016,                                                      
      64 +T-017, T-022, T-041). Numeração preservada.                    
      65 +                                                               
      66 +**Custo:** `spec.md` (15 trechos), `DECISIONS.md`, `plan.md` (v
         +1.1 → 1.2),                                                    
      67 +`data-model.md` e `tasks.md`.                                  
      68 +                                                               
      69 +---                                                            
      70 +                                                               
      71  ## D-017 — Correção de item inválido com o mesmo `id` (RN-003, 
          AMB-025) · `2026-09-29`
      72  
      73  **Gatilho:** `/speckit-tasks`. Ao escrever a T-011 (detecção de
           `id`

● Plan e data-model:

  Made 1 scratchpad edit +53, ran 1 shell command (ctrl+o to expand)

● Bash(python
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/e7cf012c-2e88-4b90-966a-1018e8cc7c62/scratchpad/edit_plan.py")
  ⎿  Updated specs\001-motor-reembolso\data-model.md (+3 -3)
      1  # Modelo de dados — Motor de Cálculo de Reembolso
      2  
      3 -**Fase 1 do `/speckit-plan`** · Base: `spec.md` v1.2            
      3 +**Fase 1 do `/speckit-plan`** · Base: `spec.md` v1.3            
      4  
      5  Estruturas internas do núcleo. Os tipos são TypeScript, mas as r
         egras de
      6  validação são só **referências** à spec. Nenhuma regra nova nasc
         e aqui.
     ...
      60  | `data` | `DataISO` | RN-003 |
      61  | `categoriaOriginal` | texto | como veio |
      62  | `categoria` | texto normalizado | RN-002. Ainda pode ser desc
          onhecida (a recusa vem na RN-006) |
      63 -| `descricao` | texto ou vazio | só ecoado. Na hospedagem, font
         -e do N (RN-012) |                                              
      64 -| `fornecedorChave` | texto | RN-007: `trim` + minúsculas. Ause
         -nte = `""` |                                                   
      63 +| `descricao` | texto | RN-003/AMB-026: qualquer valor vira tex
         +to, ausente ou nulo = `""`. Na hospedagem, fonte do N (RN-012) 
         +|                                                              
      64 +| `fornecedorChave` | texto | RN-003/AMB-026: qualquer valor vi
         +ra texto. RN-007: `trim` + minúsculas. Ausente ou nulo = `""` |
      65  | `valorSolicitado` | `Centavos` | RN-003 → RN-001 (meio para o
           par) |
      66  | `temNotaFiscal` | booleano | RN-003: vazio vale `false` |
      67  
  ⎿  Updated specs\001-motor-reembolso\plan.md (+19 -4)
      1  # Plano Técnico — Motor de Cálculo de Reembolso
      2  
      3 -**Versão:** 1.1 · **Baseado na spec:** 1.2 · **Branch:** `001-mo
        -tor-reembolso` · **Data:** 2026-09-29                           
      3 +**Versão:** 1.2 · **Baseado na spec:** 1.3 · **Branch:** `001-mo
        +tor-reembolso` · **Data:** 2026-09-29                           
      4  
      5  > Aqui mora o COMO. Este arquivo pode e deve falar de linguagem,
          biblioteca e
      6  > arquitetura. O que ele **não** pode é introduzir regra de negó
         cio nova — se
     ...
      18  recebe o `id` de despesas que passaram pela validação (etapa 2)
          . Nenhuma
      19  decisão técnica mudou.
      20  
      21 +**v1.2:** ajuste à spec 1.3 (D-018, AMB-026, AMB-027). `texto.t
         +s` ganha a                                                     
      22 +conversão de `fornecedor`/`descricao` de qualquer tipo para tex
         +to, e                                                          
      23 +`io/entrada.ts` aplica à RN-015 o critério de ausente da RN-003
         +. Os testes                                                    
      24 +passam a ter **um arquivo por RN**: os testes do motor em memór
         +ia vão para o                                                  
      25 +arquivo da RN que verificam, e não existe `motor.test.ts`.     
      26 +                                                               
      27  ---
      28  
      29  ## 0. Contexto técnico
     ...
      105      despesa.ts  elegibilidade.ts  viagem.ts  diarias.ts  limit
           es.ts
      106      motivos.ts  resumo.ts  motor.ts
      107  tests/
      102 -  nucleo/rn-001-arredondamento.test.ts … rn-015-*.test.ts     
      108 +  infra.test.ts               # runtime (rawJSON, context.sour
          +ce)                                                           
      109 +  nucleo/rn-001-arredondamento.test.ts … rn-014-resumo.test.ts
          +   # um arquivo por RN                                        
      110 +  nucleo/politica.test.ts  datas.test.ts  dinheiro.test.ts    
          +    # Infra › (sem regra)                                     
      111 +  io/rn-015-entrada.test.ts   # a RN-015 vive em io/entrada.ts
      112 +  io/json.test.ts  io/saida.test.ts                           
      113    casos-de-borda.test.ts      # uma linha da seção 7 = um test
           e
      114    exemplo.test.ts             # tabela da seção 9
      115    contrato-saida.test.ts      # saida.schema.json
     ...
      232    com despesas montadas no teste); ~15% ponta a ponta do motor
            (exemplo,
      233    contrato); ~5% CLI por processo filho (sucesso, RN-015, dete
           rminismo,
      234    códigos de saída).
      225 -- **Cada `RN-NNN` tem teste?** Sim, um arquivo por RN em `test
          -s/nucleo/`,                                                   
      226 -  com `describe('RN-00X — <título da spec>')`. Os critérios de
          - **Aceite** da                                                
      235 +- **Cada `RN-NNN` tem teste?** Sim, **exatamente um arquivo po
          +r RN**,                                                       
      236 +  `rn-0NN-<tema>.test.ts` (em `tests/nucleo/`, ou em `tests/io
          +/` para a                                                     
      237 +  RN-015), com `describe('RN-0NN — <título da spec>')`. Todo t
          +este de unidade                                               
      238 +  ou do motor em memória cujo título começa por `RN-0NN ›` fic
          +a no arquivo                                                  
     … 6 more lines (ctrl+o to expand)

● Agora o tasks.md.

  Made 1 scratchpad edit +129 (ctrl+o to expand)

● Bash(python
      "C:/Users/rofel/AppData/Local/Temp/claude/d--Usuario-Projetos-Dev-Apps-sdd
      -desafio/e7cf012c-2e88-4b90-966a-1018e8cc7c62/scratchpad/edit_tasks.py" &&
      cd "…)
  ⎿  Updated specs\001-motor-reembolso\tasks.md (+42 -34)
       8  
       9  **Formato do commit:** `feat(T-003): <descrição>` · `test(T-003
          ): <descrição>`
      10  
      11 -**Base:** `spec.md` v1.2 · `plan.md` v1.1 · `data-model.md` · `
         -research.md` · `contracts/`                                    
      11 +**Base:** `spec.md` v1.3 · `plan.md` v1.2 · `data-model.md` · `
         +research.md` · `contracts/`                                    
      12  
      13  **Convenções que valem para todas as tasks** (do `plan.md` §2 e
           §6 e do `CLAUDE.md`):
      14  
     ...
      16  - Só sintaxe apagável (`erasableSyntaxOnly`): sem `enum`/`names
          pace`/parameter properties; imports relativos com `.ts`.
      17  - Dinheiro é `Centavos = bigint` em todo o núcleo. Nunca `numbe
          r` para dinheiro. Nenhum número da política fora de `src/nucleo
          /politica.ts`.
      18  - Título de teste começa pelo ID: `RN-010 › ...`, ou `Borda › <
          Caso>` com o texto **exato** da coluna "Caso" da seção 7 da spe
          c, sem as crases do markdown (ex.: `` `id` repetido `` → `Borda
           › id repetido`). Testes que não verificam regra de negócio usa
          m `Infra › ...`.
      19 -- Um arquivo de teste por RN em `tests/nucleo/rn-0NN-<tema>.tes
         -t.ts`, com `describe('RN-0NN — <título da spec>')`.            
      19 +- **Exatamente um arquivo de teste por RN**: `tests/nucleo/rn-0
         +NN-<tema>.test.ts` (a RN-015 em `tests/io/rn-015-entrada.test.t
         +s`), com `describe('RN-0NN — <título da spec>')`. Todo teste de
         + unidade ou do motor em memória com título `RN-0NN › ...` fica 
         +no arquivo **dessa** RN, mesmo que a task seja de outro módulo 
         +(não existe `motor.test.ts`). Só os testes ponta a ponta (`exem
         +plo`, `contrato-saida`, `cli`, `io/saida`) citam RNs fora do ar
         +quivo delas (plan §6).                                         
      20  - "Aceite" = os testes listados passam em `npm test` **e** `npm
           run typecheck` fica sem erros.
      21  
      22  ---
     ...
      55    - **Aceite:** em `tests/nucleo/rn-001-arredondamento.test.ts`
           passam `RN-001 › 33.333 → 33.33`, `RN-001 › 10.005 → 10.00 (me
          io, 0 é par)`, `RN-001 › 10.015 → 10.02 (meio, 2 é par)`, `RN-0
          01 › 33.345 → 33.34`, `RN-001 › 33.3451 → 33.35 (fora do meio)`
          , `RN-001 › 100.004 → 100.00`, `RN-001 › -45.005 → -45.00 (meio
           para o par também no negativo)` e `RN-001 › expoente 1.00005e2
           → 100.00`
      56    - **Commit:** `<hash preenchido depois>`
      57  
      58 -- [ ] **T-007** — [P] Criar `src/nucleo/texto.ts` (R-06): `norm
         -alizar(texto)` = `trim` → minúsculas → `NFD` → remove `\p{M}`; 
         -e `normalizarFornecedor(texto)` = só `trim` + minúsculas (a RN-
         -007 não manda tirar acento do fornecedor)                      
      59 -  - **Atende:** RN-002, AMB-014                                
      60 -  - **Aceite:** em `tests/nucleo/rn-002-categoria.test.ts` pass
         -am `RN-002 › "ALIMENTACAO", " Alimentação " e "alimentacao" vir
         -am alimentacao` e `RN-002 › "Transporte_Urbano" e "HOSPEDAGEM" 
         -viram transporte_urbano e hospedagem`                          
      58 +- [ ] **T-007** — [P] Criar `src/nucleo/texto.ts` (R-06): `norm
         +alizar(texto)` = `trim` → minúsculas → `NFD` → remove `\p{M}`; 
         +e `normalizarFornecedor(texto)` = só `trim` + minúsculas (a RN-
         +007 não manda tirar acento do fornecedor); e `comoTexto(bruto)`
         + (AMB-026): ausente/`null` → `""`, texto como veio, `NumeroJson
         +` → o seu texto, booleano → `"true"`/`"false"`, lista/objeto → 
         +texto JSON compacto (`NumeroJson` reemitido com o texto origina
         +l)                                                             
      59 +  - **Atende:** RN-002, AMB-014, RN-003, AMB-026               
      60 +  - **Aceite:** em `tests/nucleo/rn-002-categoria.test.ts` pass
         +am `RN-002 › "ALIMENTACAO", " Alimentação " e "alimentacao" vir
         +am alimentacao` e `RN-002 › "Transporte_Urbano" e "HOSPEDAGEM" 
         +viram transporte_urbano e hospedagem`; em `tests/nucleo/rn-003-
         +validacao.test.ts` passa `RN-003 › fornecedor/descricao como te
         +xto: ausente e null → "", 123 → "123", true → "true", [1, 2] → 
         +"[1,2]"`                                                       
      61    - **Commit:** `<hash preenchido depois>`
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
         -cida                                                           
      64 -  - **Atende:** RN-003, AMB-018, AMB-023                       
      65 -  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pass
         -am `RN-003 › "data": "2026-07-32" → DADO_INVALIDO com data "202
         -6-07-32" no eco`, `RN-003 › id, data, categoria ou valor ausent
         -es → DADO_INVALIDO`, `RN-003 › id, data ou categoria nulos, vaz
         -ios ou só com espaços → DADO_INVALIDO`, `RN-003 › "categoria": 
         -"" e "categoria": 123 → DADO_INVALIDO, e não CATEGORIA_NAO_REEM
         -BOLSAVEL`, `RN-003 › item que não é objeto (42, "x", null) → DA
         -DO_INVALIDO com ecos e valor_solicitado nulos` e `RN-003 › eco 
         -sai exatamente como veio (categoria 123 continua o NumeroJson "
         -123")`                                                         
      63 +- [ ] **T-008** — Criar `src/nucleo/despesa.ts` com `validarDes
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
      64 +  - **Atende:** RN-003, AMB-018, AMB-023, AMB-026              
      65 +  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` pass
         +am `RN-003 › "data": "2026-07-32" → DADO_INVALIDO com data "202
         +6-07-32" no eco`, `RN-003 › id, data, categoria ou valor ausent
         +es → DADO_INVALIDO`, `RN-003 › id, data ou categoria nulos, vaz
         +ios ou só com espaços → DADO_INVALIDO`, `RN-003 › "categoria": 
         +"" e "categoria": 123 → DADO_INVALIDO, e não CATEGORIA_NAO_REEM
         +BOLSAVEL`, `RN-003 › item que não é objeto (42, "x", null) → DA
         +DO_INVALIDO com ecos e valor_solicitado nulos` , `RN-003 › eco 
         +sai exatamente como veio (categoria 123 continua o NumeroJson "
         +123")` e `RN-003 › "fornecedor": 123 e "descricao": null não re
         +cusam a despesa`                                               
      66    - **Commit:** `<hash preenchido depois>`
      67  
      68  - [ ] **T-009** — Aceitar `valor` como texto no formato fechado
           em `src/nucleo/despesa.ts`: sem os espaços das bordas, casa `^
          -?\d+([.,]\d+)?$`; vírgula vira ponto e segue para `paraCentavo
          s` (RN-001). Qualquer outro texto ou tipo (vazio, milhar, moeda
          , dois separadores, letras, booleano, lista, objeto, nulo) → `D
          ADO_INVALIDO` com `valor_solicitado` nulo
     ...
       96    - **Commit:** `<hash preenchido depois>`
       97  
       98  - [ ] **T-015** — Etapa 6 em `src/nucleo/elegibilidade.ts`: es
           tado com chave `(data, categoria normalizada, normalizarFornec
           edor(fornecedor) — ausente/só espaços = "", valorSolicitado)` 
           → `id` da primeira ocorrência; ocorrência seguinte com `id` di
           ferente → `Recusa(DUPLICATA)` com `detalhes.idAceito`. `descri
           cao` e `tem_nota_fiscal` fora da chave
       99 -  - **Atende:** RN-007, AMB-011                               
     … 138 more lines (ctrl+o to expand)

● Apliquei as cinco decisões na ordem que a constituição pede: spec → DECISIONS
  → plan/data-model → tasks. Nada foi commitado e nenhum código foi escrito.

  Spec (versão 1.2 → 1.3)
  - I2: o caso de borda "Diárias na descrição" agora diz que o
    limite_diario_aplicado é 250,00 por diária, e não mais "limite 500,00".
  - U1: fornecedor e descricao aceitam qualquer valor, que é tratado como texto,
    e nunca recusam a despesa. Nulo vale vazio.
    - Na duplicata (RN-007), 123 e "123" são o mesmo fornecedor.
    - Na hospedagem (RN-012), uma descrição ausente, nula, vazia ou sem o padrão
      de diárias vale uma única diária.
    - Nova AMB-026.
  - U2: a RN-015 usa o mesmo critério da RN-003. colaborador.id, periodo.inicio
    e periodo.fim vazios, nulos ou que não são texto contam como ausentes, e um
    arquivo que não é objeto dá erro. Nova AMB-027.
  - Três perguntas novas em Clarifications e 7 casos de borda novos (a seção 7
    passou de 73 para 80 linhas).

  DECISIONS: nova entrada D-018, com gatilho, o que mudou, suas falas, tasks
  afetadas e custo.

  Plan (v1.1 → 1.2) e data-model: atualizei a árvore de testes e a regra de um
  arquivo por RN. descricao e fornecedorChave passam a converter qualquer valor
  em texto.

  Tasks (a numeração continua a mesma):
  - F1: tirei o [P] da T-024.
  - F2: cada RN tem exatamente um arquivo rn-0NN-*.test.ts, e a RN-015 fica em
    tests/io/.
    - motor.test.ts deixou de existir. Os testes da T-017 e da T-022 foram para
      o arquivo da RN que cada um verifica.
    - O teste RN-001 › que estava no arquivo da RN-008 (T-016) passou a se
      chamar RN-008 › ....
    - A T-041 agora também falha se alguma RN não tiver exatamente um arquivo de
      teste.
  - U1: comoTexto entra em texto.ts pela T-007 e é aplicado na T-008.
    Acrescentei testes na T-015 e na T-018 e casos de borda na T-029 e na T-030.
  - U2: novos critérios de aceite na T-025 e 3 casos de borda na T-040.
  - Atualizei a tabela de Cobertura (com AMB-026 e AMB-027) e a contagem por
    task.

  Uma decisão que tomei sem você pedir: "tratado como string" não dizia como
  fica uma lista ou um objeto. Defini que eles viram o texto JSON compacto ([1,
  2] → "[1,2]"). Isso tem um efeito curioso: "descricao": ["2 diarias"] resulta
  em N = 2. Se preferir outro tratamento (por exemplo, lista e objeto contarem
  como vazio), eu ajusto.

  Os problemas LOW do relatório e o I1 ("em centavos" contra "em reais")
  continuam sem correção, porque você não pediu para mexer neles. Quer que eu
  faça o commit agora como docs(spec): ...?