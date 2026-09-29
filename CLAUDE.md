# CLAUDE.md

> Este arquivo é lido pelo Claude Code no início de toda sessão. É onde moram as
> convenções que você não quer repetir em todo prompt.
> Substitua os `<...>` e apague o que não usar. Mantenha curto — CLAUDE.md longo
> é CLAUDE.md ignorado.

## O projeto

Motor de cálculo de reembolso de despesas corporativas. CLI que lê um JSON de
despesas e emite um JSON com o valor reembolsável e a justificativa de cada item.

## Fonte da verdade

`specs/001-motor-reembolso/spec.md` define **o que** o sistema faz.
`specs/001-motor-reembolso/plan.md` define **como**.
`specs/001-motor-reembolso/tasks.md` define **em que ordem**.

Quando o código e a spec discordarem, a spec está certa e o código é o bug —
a menos que a spec esteja errada, e nesse caso corrigimos a spec primeiro e
registramos em `DECISIONS.md`.

**Antes de implementar qualquer coisa, leia a task correspondente em `tasks.md`.**
Se o que eu pedi não está coberto por nenhuma task, me avise em vez de implementar.

## Regras de trabalho

- Toda regra de negócio vive na spec, não no chat e não em comentário de código.
- Se eu te explicar uma regra que não está na spec, **pare e me diga isso** antes
  de escrever código. Isso é um bug de spec.
- Todo commit referencia uma task: `feat(T-003): <descrição>`.
  Mudanças de documentação: `docs(spec):`, `docs(plan):`, `docs(tasks):`.
- Nenhuma regra de negócio entra sem teste.

## Stack e comandos

- Linguagem: TypeScript em Node ≥ 24, rodando `.ts` direto (type stripping, sem build)
- Rodar: `node src/cli.ts calcular --input <entrada.json> --output <saida.json>`
- Testes: `npm test` (Vitest)
- Lint/format: `npm run typecheck` (`tsc --noEmit`)

## Convenções de código

- Estrutura e decisões técnicas: `specs/001-motor-reembolso/plan.md` e `research.md`.
- `src/nucleo/` é puro (sem E/S, relógio ou ambiente); só `src/cli.ts` e `src/io/` tocam em arquivo/JSON.
- Só sintaxe apagável (`erasableSyntaxOnly`): sem `enum`/`namespace`; imports relativos com `.ts`.
- Números mágicos de política só em `src/nucleo/politica.ts`.
- Nome de teste começa pelo ID: `RN-010 › ...` ou `Borda › <nome exato do caso da seção 7>`.
- Valores monetários: centavos em `bigint`; entrada lida pelo texto do número, saída via `JSON.rawJSON`. Nunca `number` para dinheiro.

## Fora de escopo

- Ver seção 3 da spec. Na dúvida, não implemente: pergunte.
