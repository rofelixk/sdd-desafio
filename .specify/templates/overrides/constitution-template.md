# Constituição — Motor de Cálculo de Reembolso

> Princípios não negociáveis do projeto. Derivados de `CLAUDE.md` e das regras do
> desafio (`DESAFIO.md`). Todo comando do spec-kit verifica conformidade com eles.

## Princípios

### I. A spec é a fonte da verdade

`specs/<feature>/spec.md` define **o quê**, `plan.md` define **como**, `tasks.md`
define **em que ordem**. Quando código e spec discordam, o código é o bug — a menos
que a spec esteja errada; nesse caso a spec é corrigida primeiro e a mudança é
registrada em `DECISIONS.md`.

### II. Toda regra de negócio vive na spec

Nenhuma regra de negócio mora no chat, em comentário de código ou só no teste.
Uma regra explicada fora da spec é um **bug de spec**: pare, registre na spec
(e em `DECISIONS.md`), só então implemente.

### III. Ambiguidade se decide e se registra

Toda ambiguidade da política é registrada na seção de ambiguidades da spec
(`AMB-NNN`) com texto original, leituras possíveis, decisão e justificativa.
Resolver ambiguidade no código sem registro é proibido.

### IV. A spec não conhece tecnologia

`spec.md` não cita linguagem, biblioteca, classe, função ou estrutura de pastas.
Teste: *se eu trocasse de linguagem amanhã, isso mudaria?* Se sim, é `plan.md`.

### V. Rastreabilidade spec → tasks → commits → testes (NÃO NEGOCIÁVEL)

- Toda regra recebe ID (`RN-NNN`, `AMB-NNN`).
- Toda task (`T-NNN`) declara quais IDs atende e seu critério de aceite.
- Todo commit referencia uma task: `feat(T-NNN): ...`, `test(T-NNN): ...`;
  documentação usa `docs(spec):`, `docs(plan):`, `docs(tasks):`.
- Numeração de tasks nunca é reiniciada nem renumerada.

### VI. Nenhuma regra de negócio sem teste

Todo `RN-NNN` testável tem teste automatizado cujo nome remete ao ID da regra.
Casos de borda da spec têm teste próprio.

### VII. Mudança de spec é registrada

Toda alteração em `spec.md` gera uma entrada em `DECISIONS.md` (gatilho, de → para,
por quê, o que invalidou, tasks afetadas, custo). Ordem obrigatória para absorver
mudança: spec → `DECISIONS.md` → tasks → código.

## Restrições

- Valores monetários nunca em ponto flutuante binário (a representação é decidida no `plan.md`).
- Escopo limitado ao que a spec declara; o que não está na spec não é implementado.
- Sessões com o agente são exportadas para `docs/sessions/NN-descricao.md`.

## Fluxo de trabalho

1. Antes de implementar, ler a task correspondente em `tasks.md`.
2. Pedido não coberto por task → avisar em vez de implementar.
3. Histórico de commits honesto: não reescrever para maquiar.

## Governança

Esta constituição prevalece sobre qualquer outra prática. Emendas exigem entrada em
`DECISIONS.md` e atualização de `CLAUDE.md` quando afetarem convenções do agente.

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
