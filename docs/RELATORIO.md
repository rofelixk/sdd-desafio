# Relatório — Desafio SDD

**Aluno:** Rodrigo Felix Kraljevic · **Repositório:** https://github.com/rofelixk/sdd-desafio · **Data:** 30/09/2026

> Isto não é redação. São **evidências**. Toda afirmação deve vir acompanhada de
> arquivo, hash de commit ou trecho de sessão exportada. Um parágrafo bonito sem
> evidência vale menos que uma frase curta com um hash.
>
> Vale 20 dos 100 pontos, e é a seção que mais separa notas.

---

## Delegação

*O que você fez, o que o Claude fez, e por que dividiu assim.*

**A divisão:**

| Atividade | Quem | Por quê |
|---|---|---|
| Identificar ambiguidades | Claude, com revisão minha | O `/speckit-specify` cruzou os 14 itens de `exemplos/despesas-exemplo.json` com a política v3 e levantou 19 ambiguidades de uma vez (D-001, `ee19638`). As demais saíram das rodadas `/speckit-clarify` (D-011 a D-014), `/speckit-plan` (D-015, D-016, D-021), `/speckit-tasks` (D-017) e `/speckit-analyze` (D-018, D-022). Varrer a política atrás de lacunas é trabalho exaustivo e mecânico, em que o modelo rende mais que eu. |
| Decidir as ambiguidades | Eu | Decisão de negócio não é delegável. Os 3 `[NEEDS CLARIFICATION]` (viagem, diárias, duplicatas) foram decididos por mim (D-002 a D-004). As 16 que o Claude decidiu sozinho passaram por revisão item a item (D-009), e uma foi revertida (AMB-013, meio para o par, D-010). Em várias contrariei a recomendação dele: D-002, D-003, D-006, D-012, D-013, D-015 e AMB-043 na D-021. |
| Escrever a spec | Claude escreveu o texto, eu ditei o conteúdo | A redação saiu dos comandos do spec-kit. Toda regra nova veio de uma resposta minha, registrada com a minha justificativa em `DECISIONS.md` (D-001 a D-022). |
| Desenhar a arquitetura | Claude, com decisões pontuais minhas | `plan.md`, `research.md` e `data-model.md` foram gerados pelo `/speckit-plan` (`23a414d`, `f37183d`). Decidi os pontos com efeito fora do código, por exemplo política e câmbio em local fixo, `dados/` (AMB-028, D-019). |
| Implementar | Claude | T-001 a T-003 uma a uma, com meu comando e commit a cada task (`docs/sessions/07-implementacao.md`, prompts `execute t-001`, `execute t-002`, `execute t-003`). Validada a forma de trabalho, o restante saiu com `/speckit-implement`: T-004 a T-042 (`c356fd3` → `ce44444`) e, no dia 2, T-043 a T-071 (`063c073` → `171683b`, sessão 13). Cada task virou um commit `feat(T-NNN)` e um `docs(tasks)` que marca a conclusão. |
| Escrever testes | Claude | Tasks próprias de teste (T-026 a T-034, T-036 a T-041, T-053, T-061 a T-065, T-067, T-069, T-070). O `tests/rastreabilidade.test.ts` (T-041, `65e8dc0`; T-070, `3d44b6b`) falha se alguma RN ou algum caso de borda da seção 7 da spec ficar sem teste com o título correspondente. Hoje exige 18 RNs e 121 casos de borda. |
| Absorver o envelope | Claude executou, eu decidi | Copiei o envelope para `exemplos/envelope/` (`540c05a`). O Claude leu o envelope e fez três rodadas de perguntas (D-019). Revisei o que ele decidiu sozinho (D-020) e rodei de novo plan → tasks → analyze → implement. |

**Onde deleguei e me arrependi:** Não atuei muito na direção que o código seria feito, não tenho muita experiência em gerar comandos executaveis pelo prompt, mas entendi que essa era somente parte da proposta. Dito isso, foi complciado entender a disposição de arquivos e as alterações específicas que teriam que ser feitas nele para v2.

**Onde não deleguei e deveria ter delegado:** Eu acho que foi um erro deixar ele me trazer as ambiguidades iniciais, acredito que isso era parte do exercício. Mesmo assim, validei todas para construir o produto final.

**Usei subagentes / skills / MCP / hooks?** <se sim: o quê, como configurou,
valeu a pena. Se não: por que não.> Sim, utilizei o speckit do github, perguntei ao proprio claude quais seriam os passos para configurar e aceitar os overrides de tempaltes exigidos pelo desafio, o log completo está na sessão 01.

---

## Descrição

*Como você transformou requisito ambíguo em requisito verificável.*

Requisito escolhido: **item 8 da política, "Duplicatas devem ser tratadas"** (RN-007, AMB-011).

**Versão 1 (minha primeira escrita):** rascunho do `/speckit-specify`, antes do
primeiro commit da spec (`docs/sessions/02-criacao-speck-e-decisoes.md`, linhas 328–340)
> ```
> ### RN-007 — Duplicatas
>
> **Regra:** Duas despesas são duplicatas quando têm a mesma `data`, a mesma
> categoria normalizada, o mesmo `fornecedor` (comparado sem diferenciar
> maiúsculas de minúsculas e sem espaços nas bordas) e o mesmo `valor_solicitado`,
> com `id` diferente. `descricao` e `tem_nota_fiscal` não entram no critério.
> [NEEDS CLARIFICATION: tratamento — recusar as ocorrências após a primeira,
> só sinalizar sem afetar o valor, ou recusar todas as ocorrências?]
> **Origem:** política do RH, item 8 (AMB-011)
> **Aceite:** `d-006` e `d-007` (2026-07-09, alimentação, Bistro Central, 54,90)
> são duplicatas entre si.
> ```

**Versão final:** `specs/001-motor-reembolso/spec.md`, RN-007 (spec 2.3)
> ```
> ### RN-007 — Duplicatas
>
> **Regra:** Duas despesas são duplicatas quando têm a mesma `data`, a mesma
> categoria normalizada, o mesmo `fornecedor` (comparado sem diferenciar
> maiúsculas de minúsculas e sem espaços nas bordas), a mesma `moeda` e o
> mesmo `valor_original`, com `id` diferente. Em BRL, `valor_original` é o
> próprio `valor_solicitado`. Despesas em moedas diferentes nunca são
> duplicatas (AMB-038). `fornecedor` é tratado como texto
> (RN-003). Ausente, nulo ou só com espaços vale como fornecedor **vazio**, que é comparado como qualquer outro valor:
> vazio é igual a vazio, e um fornecedor preenchido nunca é igual a vazio.
> `descricao` e `tem_nota_fiscal` não entram no critério.
> Num grupo de duplicatas, **só a primeira ocorrência na ordem da entrada**
> segue para as próximas regras. As demais são **RECUSADAS** com `DUPLICATA`. A
> descrição do motivo cita o `id` da ocorrência aceita e não pressupõe má-fé.
> **Origem:** política do RH, item 8 (AMB-011, AMB-038)
> **Aceite:** `d-006` e `d-007` (2026-07-09, alimentação, Bistro Central, 54,90):
> `d-006` segue normalmente (APROVADO 54,90) e `d-007` → RECUSADO/`DUPLICATA`.
> Duas despesas de alimentação de 40,00 na mesma data, as duas sem fornecedor →
> a 2ª RECUSADO/`DUPLICATA`. Se só uma delas tiver fornecedor, as duas seguem
> normalmente. `"fornecedor": 123` e `"fornecedor": "123"` são o mesmo
> fornecedor, e `"fornecedor": null` é igual a fornecedor ausente. Duas
> despesas iguais de 20,00, uma em EUR e outra em USD → as duas seguem
> normalmente. Uma sem `moeda` e outra com `"moeda": "BRL"`, o resto igual → a
> 2ª RECUSADO/`DUPLICATA`.
> ```

**O que estava ambíguo:** "tratadas" não dizia nada sobre o que fazer. A
política também não definia o que é uma duplicata. Foram quatro camadas,
cada uma aberta por uma pergunta diferente:

1. **Tratamento:** recusar as cópias, só sinalizar, ou recusar todas? Decidido:
   a primeira segue e as demais são RECUSADAS com `DUPLICATA`, sem pressupor
   má-fé, porque "erros de cadastro acontecem" (D-004).
2. **Fornecedor ausente:** o campo é opcional. Duas despesas sem fornecedor são
   duplicatas? E uma com e outra sem? A primeira leitura gravada (basta uma não
   ter fornecedor) tornava a relação não transitiva (A = Tavola, B = vazio,
   C = Porto: B casa com A e com C, mas A não casa com C). Decidido: vazio é um
   valor como outro qualquer, e vazio só casa com vazio (D-011).
3. **Fornecedor que não é texto:** `123`, `null`, lista. Decidido: tudo vira
   texto, `123` = `"123"`, e `null` = vazio (D-018, AMB-026).
4. **Moeda estrangeira (envelope v4):** comparar pelo valor em reais ou pelo
   valor original? Decidido: mesma moeda e mesmo valor original. Moedas
   diferentes nunca são duplicatas (D-019, AMB-038).

**Como percebi:** <testando? o Claude perguntou? bateu o olho no JSON de exemplo
e não soube dizer qual era a resposta certa?> Cada decisão levou a uma nova possivel ambiguidade, meu trabalho foi entender a nuance de uso de uma aplicação (como na primeira ambiguidade) e alguns casos mais diretos como resolução de comparação de valores ou valores em tipos diferentes.

**Commit da mudança:** a RN-007 mudou em quatro commits:
`ee19638` (tratamento, D-004), `8b3290b` (fornecedor vazio, D-011), `08523a5`
(fornecedor não textual, D-018) e `1873bf8` (moeda, D-019). Conferido com
`git show <hash>:specs/001-motor-reembolso/spec.md` em cada commit da spec.

---

## Discernimento

*Onde o Claude errou e você pegou.*

> **Sem um caso concreto e verificável, esta seção vale zero.** Não existe projeto
> de dois dias em que o modelo acertou tudo. A ausência do caso não prova que o
> modelo foi perfeito — prova que ninguém estava conferindo.

### Caso 1 — Estrutura inventada do `politica-v4.json` (AMB-033)

**O que ele propôs:** na revisão das ambiguidades da v4, o Claude explicou a
pergunta sobre o percentual de viagem assim: *"A tabela da v4 traz, em cada
bloco, o campo acrescimo_em_viagem_percentual, e hoje ele vale 50 em todos"*.
Em cima disso, montou as opções (por exemplo, *"Se o financeiro mudar o
CC-COMERCIAL para 30, a alimentação em viagem nesse centro de custo passa a
ter limite ampliado em 30%"*) e pediu que eu escolhesse entre "vem da tabela"
e "fixo em 50%".

**Por que estava errado:** o campo não existe em cada bloco. Aparece uma
única vez, na raiz do arquivo, fora de `padrao` e de `centros_custo`
(`exemplos/envelope/politica-v4.json`, linha 28). Não existe "percentual do
CC-COMERCIAL". A pergunta partia de uma premissa falsa sobre um arquivo de
entrada que o Claude tinha lido. Se eu aceitasse a explicação, o modelo de
dados poderia ganhar um percentual por centro de custo que a política não tem.
A regra escrita na spec já estava certa (a RN-016 dizia que o campo vale para
todos os centros de custo). O erro estava na explicação que embasava a minha
decisão.

**Como eu detectei:** <li o diff? o teste quebrou? só percebi dias depois?
"como detectei" é a informação mais útil deste relatório inteiro> comparando o arquivo provido de politicas com a politica v4 e a spec gerada. A resposta do Claude não batia com os exemplos disponíveis.

**O que eu fiz:**

**Onde está a evidência:** `docs/sessions/09-ajustes-ambiguidades-v2.md`,
linhas 283–299 (a explicação errada), linhas 300–307 (minha correção, com o
arquivo selecionado no IDE) e linha 411 (*"Você tem razão, eu expliquei
errado..."*). Registrado em `DECISIONS.md`, D-020, último parágrafo antes de
"Por quê". Commit `6935594`.

### Caso 2 — Regra de negócio inventada por analogia (AMB-042)

**O que ele propôs:** eu tinha respondido que no arquivo de câmbio `"usd"`
casa com `USD`. Ao gravar isso na spec durante o `/speckit-plan`, o Claude
acrescentou por conta própria uma regra que eu não tinha dado: se `"usd"` e
`"USD"` aparecem na mesma data, **o arquivo de câmbio é recusado**. Justificou
por analogia com as categorias repetidas da RN-016. A regra entrou na spec da
área de trabalho, e só depois ele pediu confirmação, no resumo final do plano.

**Por que estava errado:** era regra de negócio nova, sem origem na política
nem numa decisão minha, o que o `CLAUDE.md` proíbe ("Toda regra de negócio
vive na spec, não no chat"; decisão de negócio é minha). A consequência
também era desproporcional. Pela RN-015, arquivo externo inválido encerra a
execução inteira sem saída. Uma grafia repetida numa cotação qualquer
derrubaria o cálculo de todas as despesas, inclusive das que estão em BRL. A
analogia também não se sustenta: categoria repetida na tabela deixa o limite
indefinido, e a cotação repetida tem um desempate natural (a última).

**Como eu detectei:** O próprio Claude apontou como uma decisão não tomada por mim e revisei a lista de ambiguidades.

**O que eu fiz:**

**Onde está a evidência:** `docs/sessions/10-execucao-de-plan-v2.md`, linhas
2655–2658 (*"Needs your confirmation: in AMB-042 I added a rule you didn't
state [...] the file is rejected"*) e linhas 2707–2709 (minha resposta:
*"Não, use o último valor disponível"*). Registrado em `DECISIONS.md`, D-021
("A versão com arquivo inválido ficou só na área de trabalho e nunca foi
commitada"). A versão final está na spec, `Clarifications` (linha 67) e
RN-017 (linha 690). Commit `f37183d`.

**Padrão que eu notei:** <em que tipo de tarefa ele erra mais? teve um sinal
recorrente que passou a te deixar em alerta?> Com esse desafio percebi que ele tem dificuldades com grande snueros de regras, provavelmente pela própria natureza do desafio.

---

## Diligência

*O que você verificou antes de aceitar.*

**Meu procedimento de verificação:** <o que você de fato fazia — não o que
deveria ter feito> Eu revisei todas as ambiguidades geradas na spec antes de passar para o próximo passo, rodei os comandos de geração e verificação em sessões diferentes para pegar mais furos no fluxo, não avancei até ter uma boa noção de quais regras estavam em lugar e o comparei o resultado final com o meu próprio (fazendo a regra funcionar no papel)

**Li o diff inteiro em que porcentagem das entregas?** <seja honesto; a
honestidade aqui vale ponto e a maquiagem custa> Inteiro? Somente a primeira sessão de setup, a terceira de ambiguidades e as três primeiras tarefas da primeira implementação. Sessões seguintes eu foquei no conceito do trabalho sendo feito e suas repercursões, mas deleguei a implementação.

**O que aceitei sem verificar direito, e o que me custou:** Eu não consigo lembrar agora um caso específico, mas tiveram vários momentos que um aceite de uma ambiguidade gerava novas e isso virou um loop bem chatinho de sair. me custou vários tokens e tempo.

**Testes: quem escreveu, e como você sabe que eles testam a coisa certa?**
<teste escrito pelo mesmo agente que escreveu o código passa com muita facilidade> não vou mentir, acreditei 100% no claude e no seu funcionamento por conta das tabelas de resultado descritas na spec e o resultado ao rodar o projeto.

---

## O envelope

*A mudança de requisito do Dia 2.*

**Quantos arquivos toquei na mão:** `5`. Foram os arquivos do envelope,
copiados para `exemplos/envelope/` (`540c05a`: `00-ENVELOPE-LACRADO.md`,
`politica-v4.json`, `cambio.json`, `despesas-envelope.json`,
`despesas-envelope-cc-desconhecido.json`). Não editei à mão nenhum arquivo de
spec, plan, tasks, código ou teste. Toda a absorção passou pelos comandos do
spec-kit, com as decisões dadas por mim no chat e registradas em
`DECISIONS.md` (D-019 a D-022).

**Quanto tempo levou:** cerca de 3h05, do commit do envelope (`540c05a`,
15:18) ao export da última sessão (`a93a966`, 18:23). Cerca de 2h30 foram
de spec, plan, tasks e analyze (15:18 → `1a43a93`, 17:44), e cerca de 35 min
de implementação (`063c073`, 17:47 → `171683b`, 18:21).

**Diff de absorção:** `66 arquivos, +5231/-725 linhas` (`git diff 712b5a5 HEAD --stat`,
sem `docs/sessions/`). Por área:

- `specs/`: 10 arquivos, +2065/−387
- `src/`: 21 arquivos, +824/−181
- `tests/`: 26 arquivos, +1919/−135
- o resto: `README.md`, `dados/`, `exemplos/envelope/`, `.gitignore`

**Absorveu de graça:** (detalhado em `plan.md` §8)

- **Etapa nova de câmbio.** A passada 1 do motor já era uma cadeia de etapas
  na ordem da seção 8 da spec (DT-002). O câmbio virou mais uma etapa.
- **Hospedagem por noite com limites diferentes** (CC-COMERCIAL a R$ 400,
  `e-007`, pendente consumindo limite). O caminho de parcelas por noite
  (DT-003, T-019) já resolvia.
- **Leitura exata de limites, taxas e percentuais.** O `NumeroJson` da v1 já
  lia números pelo texto, sem `number` (DT-001, T-003).
- **Status PENDENTE.** O status já era derivado do código de motivo, então
  bastou uma condição a mais em `statusDe` (R-16, T-058).
- **Testes da v1.** A tabela `padrao` da v4 tem os valores da v3, e a fixture
  padrão (`tests/apoio.ts`) manteve os testes antigos verdes.
- **Rastreabilidade.** O `tests/rastreabilidade.test.ts` passou a cobrar os
  testes das RN-016 a RN-018 e dos casos de borda novos sem mudar de forma
  (T-070 só atualizou as contagens para 18 RNs e 121 casos, +4/−2).

**Resistiu:**

- **`Categoria` como união fechada**, derivada das chaves de `POLITICA`. Estava
  em `tipos.ts`, `elegibilidade.ts`, `limites.ts`, `motivos.ts` e
  `tests/apoio.ts`. Com categorias vindas da tabela (`representacao` só no
  CC-COMERCIAL), virou texto mais `TabelaAplicavel` (R-15, T-043, T-050).
- **`POLITICA` importada direto** por quem calculava. Cada consumidor passou a
  receber a tabela aplicável como parâmetro (T-050, `f35e10b`). A decisão da v1
  já previa que "a troca fica restrita a quem monta `POLITICA`" (`plan.md` §4).
- **`valorSolicitado` com dois papéis:** era "o valor da entrada" e também "o
  valor em reais". Separar em `valorOriginal` + `Conversao` tocou validação,
  duplicata, nota fiscal, parcelas, resumo e saída (T-054 a T-060).
- **Schema de saída.** Entraram quatro campos por item e o bloco `politica`:
  `contracts/saida.schema.json`, `io/saida.ts` e o teste de contrato (T-066).
- **Tabela de resultado esperado do exemplo** (spec §9). A v4 é retroativa a
  julho e o colaborador do exemplo é do CC-ENG-PLATAFORMA, então d-001, d-002,
  d-010, d-013 e d-014 mudaram, e o total reembolsável caiu de 815,43 para
  351,43 (D-019).

**Ordem em que fiz:** spec → plan → tasks → analyze → código, sem código antes
da spec. Os timestamps dos commits:

| Hora | Commit | Etapa |
|---|---|---|
| 15:18 | `540c05a` | envelope no repositório |
| 16:29 | `1873bf8` | spec 2.0 (D-019) |
| 16:58 | `6935594` | revisão das ambiguidades decididas pelo Claude (D-020) |
| 17:21 | `f37183d` | plan e lacunas da spec (D-021) |
| 17:35 | `b66df04` | tasks T-043 a T-071 |
| 17:43 | `d04a184` | ajustes do analyze (D-022) |
| 17:47 → 18:21 | `063c073` → `171683b` | implementação, um commit por task |

**Se eu tivesse escrito a spec original sabendo desta mudança:** A quantidade de ambiguidades teria sido alta de qualquer jeito, mas o planejamento, divisão de tasks e implementação teriam sido bem mais eficientes.

**O que a spec me poupou, em concreto:** revalidar todas as decisões já feitas antes, foi possível absorver grande parte das alterações e editar exatamente os pontos que precisavam de mudança.

---

## Fechamento

**Para qual tamanho de projeto isto valeu a pena?**
Do jeito que o desafio é proposto? Para nenhum, tem ambiguidades demais antes da primeira especificação que deixa o uso desse processo inviável

**Para qual não valeria?** Não valeria para todos

**O que eu faria diferente:** 
- Sessões de brainstorm com a equipe de RH para avaliar todas as nuances e dados extras que precisariamos para garantir o funcionamento correto do produto;
- Uma spec para cada momento da implementação, a politica v4 teria sido feita em uma spec separada para garantir uma boa evolução do projeto e não ficar requentando conceitos anteriores;
- Um layout para uso da aplicação (teria levado um tanto mais de tempo, mas testaria melhor meus conehcimentos);
- Não teria gerado a spec inicial com base no DESAFIO.md para ter tido um pouco mais de controle na geração inicial

**A coisa mais desconfortável que aprendi sobre como eu trabalho com IA:** Que depois de usar por quase um mês estou ficando um pouco preguiçoso na leitura do diff, especialmente partes que não entendo muito.
