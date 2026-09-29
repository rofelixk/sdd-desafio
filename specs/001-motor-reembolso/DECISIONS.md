# Log de Decisões e Mudanças de Spec

> Uma entrada **toda vez** que a spec mudar. Este arquivo é a prova de que a spec
> foi tratada como artefato vivo e não como cerimônia de abertura.
>
> Spec que não muda em dois dias é spec que ninguém consultou. Mudança não é
> demérito — mudança não registrada é.

Ordem cronológica inversa: a mais recente primeiro.

> **Contexto das entradas D-001 a D-008:** todas aconteceram na mesma sessão
> (`/speckit-specify`, 2026-09-29), durante a redação da versão 1.0 da spec e
> **antes do primeiro commit** dela. Não havia tasks nem código ainda, então
> nenhuma task ou teste foi afetado. Estão registradas para mostrar como cada
> ambiguidade foi decidida e quais propostas do Claude foram aceitas, alteradas
> ou recusadas.

---

## D-017 — Correção de item inválido com o mesmo `id` (RN-003, AMB-025) · `2026-09-29`

**Gatilho:** `/speckit-tasks`. Ao escrever a T-011 (detecção de `id`
repetido), o Claude notou que a RN-003 ("`id` igual ao de uma despesa
anterior no arquivo") não dizia se uma despesa anterior **já recusada** conta.
Parou, marcou a T-011 com um ponto a confirmar e levou a pergunta ao usuário,
em vez de decidir na task.

**O que mudou na spec (versão 1.1 → 1.2):**
- RN-003: só reserva o `id` a despesa que passou pela validação. Uma despesa
  `DADO_INVALIDO`, por qualquer motivo (inclusive o próprio `id` repetido),
  não reserva, e a seguinte com o mesmo `id` segue como correção. Recusas de
  etapas posteriores (período, categoria, duplicata, nota fiscal) reservam o
  `id`. Novo aceite com três `"d-001"` em sequência.
- Nova AMB-025, com as leituras (a) toda anterior, (b) só as validadas e
  (c) só as reembolsadas.
- Seção 4: o mesmo `id` pode aparecer em mais de um item da saída.
- Seção 7: casos "Correção de item inválido" e "`id` de item recusado depois
  da validação".
- Uma entrada em `Clarifications`.

**Como se chegou lá:** a leitura literal do texto anterior era (a), e foi a
que o Claude deixou anotada na T-011. O usuário decidiu por (b): "dá pra
assumir que um id duplicado onde o anterior foi recusado por dados inválidos
foi uma tentativa de correção de input inserindo um segundo completo". O
Claude propôs fechar três pontos junto com a decisão (quem reserva o `id`, as
recusas posteriores continuam reservando, `id` repetido na saída), e o
usuário confirmou os três.

**Por quê:** recusar a correção puniria o colaborador duas vezes pelo mesmo
erro de preenchimento. Uma despesa recusada depois da validação tinha dados
completos, então repetir o `id` dela não é correção, é outro lançamento com
identificador repetido.

**O que isso invalidou:** a leitura (a), que só existia como nota na T-011 e
nunca virou código. Nenhum item do exemplo muda (não há `id` repetido nele).

**Tasks afetadas:** T-011 (descrição e aceite: o conjunto de ids vistos só
recebe despesas validadas), T-032 (dois casos de borda novos) e a tabela de
Cobertura (AMB-025). Nenhuma task estava concluída. Os ajustes entram pelo
`/speckit-tasks`, que preserva a numeração.

**Custo:** 2 arquivos (`spec.md`, `DECISIONS.md`), 9 trechos.

---

## D-016 — Diárias fracionárias são ignoradas (RN-012, AMB-008) · `2026-09-29`

**Gatilho:** revisão do `/speckit-plan`. O Claude apontou como risco que,
pela leitura literal da RN-012, `"1.5 diarias"` resulta em N = 5, porque o
`5` é um inteiro seguido de "diarias".

**O que mudou na spec:**
- RN-012: número fracionário (`1.5`, `1,5`) é ignorado, mesmo seguido de
  diária/noite, e nenhum pedaço dele conta como inteiro. Novo aceite:
  "Hotel 1.5 diarias" → N = 1.
- AMB-008 e seção 10 atualizadas.
- Novo caso de borda "Diárias fracionárias" (300,00 → N = 1 → PARCIAL 250,00).

**Como se chegou lá (2 rodadas):** a primeira resposta do usuário ("não deve
ser levado em consideração por não se tratar de algo habitual") foi lida pelo
Claude como "não tratar de forma especial", e a seção 10 chegou a registrar
N = 5. Ao relatar a mudança, o Claude avisou dessa leitura e perguntou se o
usuário queria N = 1. O usuário esclareceu: "o significado era ignorar
números fracionários e ler somente como 1". A versão com N = 5 ficou só na
área de trabalho e nunca foi commitada.

**Por quê:** diária fracionária não é habitual e não tem leitura segura.
Tratar o `5` de `1.5` como cinco diárias pagaria até 5 × R$ 250 por um
erro de digitação.

**O que isso invalidou:** a leitura intermediária (N = 5) e o risco
correspondente no `plan.md`, que foi removido.

**Tasks afetadas:** nenhuma (`tasks.md` ainda é o template).

**Custo:** 4 arquivos (`spec.md`, `DECISIONS.md`, `plan.md`, `research.md`), 7 trechos.

---

## D-015 — Lacunas achadas no `/speckit-plan` (seção 4, RN-003, RN-012, AMB-023, AMB-024) · `2026-09-29`

**Gatilho:** `/speckit-plan`. Ao desenhar o modelo de dados, o Claude
encontrou três pontos que a spec não fechava e que o plano teria de
decidir sozinho. Parou e perguntou antes de escrever o plano.

**O que mudou na spec (versão 1.0 → 1.1):**
- Seção 4 e nova AMB-023: num item `DADO_INVALIDO`, `valor_solicitado` sai
  nulo quando o `valor` não é numérico, e `id`, `data` e `categoria` saem
  como vieram. O tipo de `valor_solicitado` passou a "número ou nulo".
  `total_solicitado` ignora os nulos.
- RN-003 e nova AMB-024: o `id` repetido é comparado com a normalização da
  categoria (caixa, bordas, acentos). Também ficou escrito que uma despesa
  que não é objeto tem todos os campos ausentes → `DADO_INVALIDO`. Isso é
  consequência da AMB-018, explicitada pelo Claude e avisada ao usuário.
- RN-012 e AMB-008: N vem da **primeira ocorrência do padrão completo**
  "<inteiro> diária(s)/noite(s)". Números soltos antes dela são ignorados
  ("Hotel 5 estrelas - 2 diarias" → N = 2).
- Entraram 5 casos de borda e 3 entradas em `Clarifications`.

**Por quê:**
- Eco bruto: nas palavras do usuário, "para ficar claro na saída o motivo de
  recusa". É a opção que o Claude tinha recomendado.
- `id`: o usuário escolheu "o mesmo tratamento de categoria". O Claude tinha
  recomendado ignorar só as bordas e diferenciar a caixa.
- Diárias: a opção que o Claude tinha recomendado. É a leitura coerente com o
  aceite "Hotel 5 estrelas" → N = 1.

**O que isso invalidou:** nada. O texto anterior da RN-012 ("primeiro número
inteiro seguido de...") admitia as duas leituras, e nenhum aceite dependia
disso. Nenhum item do exemplo muda.

**Tasks afetadas:** nenhuma (`tasks.md` ainda é o template).

**Custo:** 2 arquivos, 12 trechos.

---

## D-014 — Obrigatório vazio conta como ausente (RN-003, AMB-018) · `2026-09-29`

**Gatilho:** `/speckit-clarify`. O Claude perguntou se `id`, `categoria` ou
`data` vazios, nulos ou de tipo errado equivalem a ausentes.

**O que mudou na spec:**
- RN-003: esses casos contam como ausentes → `DADO_INVALIDO`. Novo aceite:
  `"categoria": ""` sai `DADO_INVALIDO`, não `CATEGORIA_NAO_REEMBOLSAVEL`.
- AMB-018: a decisão e a justificativa foram ampliadas.
- Entraram 4 casos de borda.

**Por quê:** nas palavras do usuário, "não será possível calcular
corretamente aquela despesa pela falta de informação". É a opção que o Claude
tinha recomendado.

**O que isso invalidou:** nada. Nenhum item do exemplo muda.

**Tasks afetadas:** nenhuma (tasks ainda não existiam).

**Custo:** 2 arquivos, 6 trechos.

---

## D-013 — `tem_nota_fiscal` só booleano (RN-003, AMB-022) · `2026-09-29`

**Gatilho:** `/speckit-clarify`. O Claude perguntou como tratar
`tem_nota_fiscal` não booleano (`"true"`, `"sim"`, `1`, `null`).

**O que mudou na spec:**
- RN-003: só `true`/`false` booleanos são aceitos. Vazio (ausente, nulo, ou
  texto vazio ou só com espaços) vale `false`. Qualquer outro valor é
  `DADO_INVALIDO`.
- Seção 4: a descrição do campo foi atualizada.
- Nova AMB-022. Entraram 4 casos de borda.

**Por quê:** decisão do usuário: "vamos aceitar somente booleanos, vazio conta
como false. Qualquer outro valor DADO_INVALIDO". O Claude tinha recomendado
aceitar um conjunto fechado de textos e números (`"sim"`, `1`...), na mesma
linha tolerante do `valor` (D-012). O usuário preferiu ser estrito. Incluir
`null` e texto só com espaços em "vazio" foi interpretação do Claude,
avisada ao usuário, para ficar coerente com o fornecedor vazio (D-011).

**O que isso invalidou:** nada. "Ausente = `false`" (AMB-018) continua
valendo e foi estendido ao nulo e ao texto vazio. Nenhum item do exemplo
muda.

**Tasks afetadas:** nenhuma (tasks ainda não existiam).

**Custo:** 2 arquivos, 7 trechos.

---

## D-012 — `valor` aceito como texto (RN-003, AMB-021) · `2026-09-29`

**Gatilho:** `/speckit-clarify`. O Claude perguntou se `"45.00"` (texto) conta
como valor numérico na RN-003.

**O que mudou na spec:**
- RN-003: definição fechada de "valor numérico". Pode ser número ou texto com
  sinal opcional, dígitos e no máximo um separador decimal (`.` ou `,`), sem
  os espaços das bordas. Qualquer outro texto ou tipo é `DADO_INVALIDO`.
- Seção 4: o tipo do campo `valor` passou a "número ou texto numérico".
- Nova AMB-021. Entraram 7 casos de borda.

**Por quê:** nas palavras do usuário, "não temos informação suficiente sobre
quem gera o json de entrada, então vamos aceitar tanto 45.00 como 45,00 e
número diretos". O Claude tinha recomendado aceitar só número. A exclusão do
separador de milhar e do símbolo de moeda foi complemento do Claude, para
manter o formato fechado (`"1.234"` é ambíguo). O usuário foi avisado.

**O que isso invalidou:** nada. Nenhum item do exemplo muda, porque todos os
valores são números.

**Tasks afetadas:** nenhuma (tasks ainda não existiam).

**Custo:** 2 arquivos, 6 trechos.

---

## D-011 — Duplicata com fornecedor ausente (RN-007, AMB-011) · `2026-09-29`

**Gatilho:** `/speckit-clarify`. O Claude perguntou se duas despesas sem
`fornecedor` (campo opcional), com mesma data, categoria e valor, são
duplicatas.

**O que mudou na spec:**
- RN-007 e AMB-011: fornecedor ausente ou só com espaços vale como fornecedor
  **vazio**, e vazio é comparado como qualquer outro valor. Duas despesas sem
  fornecedor e com o resto igual são duplicatas. Uma despesa com fornecedor
  preenchido nunca é duplicata de uma com fornecedor vazio.
- Seção 4: a descrição do campo `fornecedor` diz que ausente equivale a vazio.
- Casos de borda: entraram 3 casos (fornecedores diferentes, ambas sem
  fornecedor, só uma com fornecedor) e 1 caso de vazio equivalente
  (`""`, `"   "` e ausente).
- Seção 10: o risco aceito agora inclui almoço e jantar de mesmo valor, porque
  a entrada não traz horário.
- Nova seção `Clarifications`.

**Como se chegou lá (3 rodadas):** a primeira resposta do usuário ("como não
tem nenhuma regra sobre fornecedor na política...") foi lida pelo Claude como
"basta uma das duas não ter fornecedor para o critério ignorá-lo", e isso
chegou a ser gravado. A pergunta seguinte do Claude mostrou o efeito dessa
leitura: com `A` = Tavola, `B` = vazio e `C` = Porto, `B` casava com `A` e com
`C`, mas `A` não casava com `C`. O usuário então esclareceu: "uma despesa com
fornecedor vazio deve ser tratada como fornecedor exatamente isso, vazio [...]
uma despesa com fornecedor preenchido nunca irá contar como duplicado de uma
com fornecedor vazio". Essa é a opção que o Claude tinha recomendado na
primeira pergunta.

**Por quê:** fornecedor ausente é um dado desfalcado. Sem horário na entrada,
ele não basta para declarar que uma despesa é cópia de outra que tem
fornecedor. Duas despesas igualmente sem fornecedor, porém, são
indistinguíveis. Além disso, a relação de duplicata fica transitiva, e o
resultado não depende da ordem das comparações.

**O que isso invalidou:** a leitura intermediária ("só uma com fornecedor" era
duplicata), que ficou só na área de trabalho e nunca foi commitada. O critério
da D-004 continua valendo, agora com o caso de fornecedor vazio explícito.
Nenhum item do exemplo muda, porque todos têm fornecedor.

**Tasks afetadas:** nenhuma (tasks ainda não existiam).

**Custo:** 2 arquivos, 8 trechos.

---

## D-010 — Arredondamento meio para o par (RN-001, AMB-013) · `2026-09-29`

**Gatilho:** revisão da AMB-013 pelo usuário (D-009). O Claude perguntou qual
regra de desempate usar e explicou o arredondamento bancário.

**O que mudou na spec:**
- RN-001 e AMB-013: o desempate passa de "meio para cima" para **meio para o
  par**. O aceite da RN-001 foi atualizado: `10.005` agora vira 10.00, e não
  mais 10.01. Também entraram `10.015` → 10.02, `33.345` → 33.34 e
  `33.3451` → 33.35.
- Casos de borda: o caso "Arredondamento meio-para-cima" (100,005 vira
  100,01 e é RECUSADO) foi substituído por três casos: 100,005 → 100,00, não
  exige NF; 100,015 → 100,02, RECUSADO; 100,0051 → 100,01, RECUSADO.

**Por quê:** nas palavras do usuário, "não sabemos o tamanho dos arquivos que
serão utilizados fora o exemplo e seria interessante reduzir o viés num
projeto em escala real". O Claude tinha recomendado manter meio para cima,
porque o arredondamento acontece uma vez por item e é mais fácil de conferir
à mão. O usuário preferiu a neutralidade estatística.

**O que isso invalidou:** o aceite `10.005` → 10.01 e o caso de borda
100,005 → RECUSADO. Nenhum item do exemplo muda: `d-011` (33,333) não cai no
ponto médio.

**Tasks afetadas:** nenhuma (tasks ainda não existiam).

**Custo:** 1 arquivo, 3 trechos.

---

## D-009 — Revisão pelo usuário das ambiguidades decididas pelo Claude · `2026-09-29`

**Gatilho:** revisão das 16 ambiguidades que o Claude decidiu sozinho na
D-001 (todas, exceto AMB-007, AMB-008 e AMB-011, e a AMB-020 criada depois).

**O que mudou na spec:** só a AMB-013 (registrada na D-010). As outras 15
foram confirmadas como estavam. As justificativas do usuário estão abaixo
porque às vezes o motivo é diferente do que está na spec:

| AMB | Confirmação | Justificativa do usuário |
|---|---|---|
| 001 | limite por dia | a política diz "por dia", contar por despesa seria erro |
| 002 | ordem da entrada | garante o mesmo resultado em execuções repetidas |
| 003 | paga até o limite | falta regra clara para outro tratamento |
| 004 | estritamente > 100,00 | "acima de R$ 100" é explícito: 100,00 não exige, 100,01 exige |
| 005 | valor de cada despesa | toda despesa acima de 100 precisa de nota para ser reembolsada |
| 006 | recusa integral | a nota é obrigatória pela política |
| 009 | data fora de `inicio`/`fim` é recusada | fora do período é fora da competência |
| 010 | valem `inicio`/`fim` | datas explícitas evitam ambiguidade de regras financeiras |
| 012 | negativo e zero recusados | a política não trata esses valores |
| 013 | arredondar antes das regras | consistência entre testes (desempate alterado na D-010) |
| 014 | normalizar a categoria | ajuda a classificar cada despesa |
| 015 | limite inclusivo | 60,00 cabe; 60,01 sai PARCIAL 60,00 (AMB-003) |
| 016 | dia de calendário | a política não diferencia fim de semana nem feriado |
| 017 | NF continua > 100 em viagem | a ampliação é de limites, não da exigência de nota |
| 018 | recusa só o item; `tem_nota_fiscal` ausente = sem nota | a política não trata despesa lançada errado |
| 019 | recusa integral | item 9 da política |

Quatro pontos que a resposta do usuário não cobria foram confirmados
explicitamente: `tem_nota_fiscal` ausente vale como "sem nota" (AMB-018);
60,01 sai PARCIAL e não é recusado (AMB-015); valor zero é recusado como o
negativo (AMB-012); e o desempate do arredondamento, que mudou (D-010).

**O que isso invalidou:** nada.

**Tasks afetadas:** nenhuma.

**Custo:** 0 arquivos (a mudança está na D-010).

---

## D-008 — Hospedagem fora da ampliação de viagem (AMB-020) · `2026-09-29`

**Gatilho:** o Claude apontou que, com a viagem inferida pela própria
hospedagem (D-003, D-007), ampliar também o limite de hospedagem faria o
limite de R$ 250 do item 3 da política nunca ser aplicado.

**O que mudou na spec:** RN-011 e RN-009: a ampliação de 50% em viagem passa a
valer só para alimentação (R$ 90) e transporte urbano (R$ 120). A hospedagem
fica sempre em R$ 250,00 por noite. Foi criada a AMB-020, e o marcador
`[NEEDS CLARIFICATION]` da RN-011 foi removido.

**Por quê:** ampliar a hospedagem anularia o item 3 da política. Entre as duas
leituras, fica a que mantém todos os itens com efeito.

**O que isso invalidou:** nada escrito. Primeiro a decisão foi a oposta
("não há regra excluindo a hospedagem, então ela também é ampliada"), e o
Claude começou a recalcular os casos de borda para R$ 375. Antes de qualquer
edição ser gravada, o usuário interrompeu, entendeu a consequência e reverteu.
A spec nunca chegou a conter a versão com R$ 375.

**Tasks afetadas:** nenhuma (tasks ainda não existiam).

**Custo:** 2 arquivos (`spec.md`, `checklists/requirements.md`), 6 edições.

---

## D-007 — Todas as noites da estadia contam como viagem · `2026-09-29`

**Gatilho:** o Claude apontou uma incoerência. Com a hospedagem distribuída
por noite (D-006), a estadia "existe" em D+1, mas pela D-003 só a data D era
dia de viagem.

**O que mudou na spec:**
- RN-011 / AMB-007: dia de viagem passa de "data da hospedagem" para "toda
  noite D…D+N−1 de hospedagem elegível". O dia do check-out não conta.
- Seção 3 (fora de escopo): entrou "não valida diferença de preço entre noites
  nem tarifas promocionais" (antes era um item de "O que fica em aberto").
- Viraram decisões explícitas três detalhes que o Claude tinha definido
  sozinho e o usuário confirmou: (1) os centavos que sobram da divisão vão para
  as primeiras noites; (2) noites fora do período são reembolsadas, porque a
  despesa foi lançada dentro do período; (3) se o valor por noite passa do
  limite, só o limite é pago.
- Casos de borda: "Dia seguinte à hospedagem" foi dividido em "Dia do
  check-out" e "Noite seguinte da estadia".

**Por quê:** o colaborador continua fora de casa em todas as noites da estadia.

**O que isso invalidou:** a nota sobre o exemplo na seção 9 ("14/07 é o único
dia de viagem"). Agora 14 e 15/07 são dias de viagem. O resultado de `d-011`
não muda (33,33 cabe no limite de 60 ou de 90).

**Tasks afetadas:** nenhuma.

**Custo:** 1 arquivo, 9 trechos.

---

## D-006 — Diárias distribuídas por noite (RN-012) · `2026-09-29`

**Gatilho:** pergunta do Claude sobre como as N diárias ocupam o calendário:
(1) uma noite por data, D…D+N−1, ou (2) todo o limite na data D. O usuário
pediu explicação e respondeu com um exemplo próprio.

**O que mudou na spec:** RN-012 passa a dizer que o valor da hospedagem é
dividido igualmente entre as noites D…D+N−1, e que cada parcela entra no limite
de R$ 250 daquela data, junto com as outras hospedagens da mesma noite, na
ordem da entrada. O exemplo do usuário virou caso de aceite: `h1` 14/07
"2 diarias" R$ 480 → 240 + 240, APROVADO; `h2` 15/07 R$ 200 → PARCIAL R$ 10.
A etapa 9 da seção 8 e a AMB-008 foram atualizadas, e entraram 4 casos de
borda (sobreposição, média acima do limite, centavos, noite fora do período).

**Por quê:** impede que duas hospedagens na mesma noite sejam pagas
integralmente. A divisão igualitária foi escolha do usuário, e não o
"preenchimento da primeira noite até o limite" que o Claude tinha descrito
na pergunta.

**O que isso invalidou:** nenhuma decisão anterior. A proposta original do
Claude para consumir o limite noite a noite (encher a 1ª noite e depois a 2ª)
foi substituída pela divisão igualitária.

**Tasks afetadas:** nenhuma.

**Custo:** 2 arquivos, ~10 trechos.

---

## D-005 — Proposta descartada: lote com vários colaboradores · `2026-09-29`

**Gatilho:** o usuário pediu para aceitar como entrada um array de
colaboradores, além do objeto simples.

**O que mudou na spec:** nada. O Claude apontou que isso contradizia o item
de fora de escopo "não processa mais de um colaborador ou mais de um período
por execução" e abria novas decisões (isolamento de limites e duplicatas
entre colaboradores, formato da saída, erro de um elemento do lote). O
usuário reconheceu a mudança de escopo e descartou o pedido antes de
qualquer edição.

**Por quê:** a interface do desafio fixa a entrada no formato de
`exemplos/despesas-exemplo.json`, e o pedido era expansão de escopo, não
correção.

**O que isso invalidou:** nada.

**Tasks afetadas:** nenhuma.

**Custo:** 0 arquivos alterados.

---

## D-004 — Tratamento de duplicatas (RN-007, AMB-011) · `2026-09-29`

**Gatilho:** resposta à pergunta Q3 da D-001.

**O que mudou na spec:** RN-007 passou de "[NEEDS CLARIFICATION] tratamento"
para: a primeira ocorrência na ordem da entrada segue e as demais são
RECUSADAS com `DUPLICATA`, sem pressupor má-fé. O critério (mesma data,
categoria, fornecedor e valor) não mudou. Entraram casos de borda para três
cópias e para fornecedor com grafia diferente.

**Por quê:** nas palavras do usuário, "erros de cadastro acontecem, então não
iremos assumir má-fé nesse estágio".

**O que isso invalidou:** nada. É a opção que o Claude tinha recomendado.

**Tasks afetadas:** nenhuma.

**Custo:** 1 arquivo, 3 trechos.

---

## D-003 — Viagem inferida pela hospedagem (RN-011, AMB-007) · `2026-09-29`

**Gatilho:** resposta à pergunta Q1 da D-001.

**O que mudou na spec:** RN-011 passou de "[NEEDS CLARIFICATION]" para: dia de
viagem é a data em que há hospedagem **elegível** lançada. Hospedagem recusada
(sem NF, duplicada etc.) não gera viagem, e a seção 8 ganhou a etapa "dias de
viagem" depois da elegibilidade. O Claude tinha recomendado deixar a regra
inativa (opção A). O usuário escolheu inferir pela hospedagem, "por ainda não
termos um indicador exclusivo de viagem mas ser uma regra explícita".
Depois isso foi ampliado pela D-007.

**Por quê:** é o único sinal objetivo de viagem que existe na entrada.

**O que isso invalidou:** a recomendação inicial do Claude (regra inativa).
"Hospedagem recusada não gera viagem" foi decisão complementar do Claude,
registrada na AMB-007.

**Tasks afetadas:** nenhuma.

**Custo:** 1 arquivo, 5 trechos.

---

## D-002 — Número de diárias lido da descrição (RN-012, AMB-008) · `2026-09-29`

**Gatilho:** resposta à pergunta Q2 da D-001. O usuário decidiu que "será
necessário ler o campo `descricao` para validar o valor de hospedagem por
diária". O Claude tinha recomendado a opção oposta (1 diária por despesa,
sem ler texto livre).

**O que mudou na spec:**
- Seção 3: o item "não interpreta texto livre" ganhou uma exceção única, o
  número de diárias.
- Seção 4: o campo `descricao` passou de "apenas ecoado" a fonte do número de
  diárias, e entrou o campo de saída `diarias`.
- RN-012: N = primeiro inteiro seguido de diária(s)/noite(s), sem diferenciar
  maiúsculas nem acentos. Sem esse padrão, ou com N = 0, N = 1. O padrão
  fechado foi escolhido pelo usuário para que "Hotel 5 estrelas" não vire 5
  diárias.
- Resultado esperado: `d-010` passou de PARCIAL 250,00 para APROVADO 480,00,
  e o total reembolsável de 585,43 para 815,43.

**Por quê:** limitar a uma diária uma estadia de várias noites puniria o
colaborador pela forma de cobrança.

**O que isso invalidou:** o item de fora de escopo sobre texto livre (virou
exceção) e a tabela de resultado esperado do exemplo.

**Tasks afetadas:** nenhuma.

**Custo:** 2 arquivos, ~8 trechos.

---

## D-001 — Versão inicial da spec a partir do DESAFIO.md · `2026-09-29`

**Gatilho:** `/speckit-specify com base no arquivo DESAFIO.md`.

**O que mudou na spec:** o template foi preenchido. O Claude cruzou cada item
de `exemplos/despesas-exemplo.json` com a política v3 e propôs 19
ambiguidades (AMB-001 a AMB-019), 15 regras (RN-001 a RN-015), o schema de
saída com 9 códigos de motivo, a ordem de aplicação das regras, 27 casos de
borda e o resultado esperado dos 14 itens do exemplo. Três pontos ficaram
como `[NEEDS CLARIFICATION]` para decisão do usuário: Q1 viagem, Q2 diárias,
Q3 duplicatas.

**Por quê:** as três dependem de dado que a entrada não traz ou de critério
de negócio sem padrão razoável. As demais 16 ambiguidades foram decididas
pelo Claude e ficam para revisão do usuário.

**O que isso invalidou:** nada (era o template vazio).

**Tasks afetadas:** nenhuma (`tasks.md` ainda não foi gerado).

**Custo:** 2 arquivos criados/preenchidos (`spec.md`,
`checklists/requirements.md`).
