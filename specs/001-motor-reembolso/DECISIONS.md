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
