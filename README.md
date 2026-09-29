# Motor de Cálculo de Reembolso

CLI que lê um JSON com as despesas de um colaborador num período e grava um
JSON com, para cada despesa, o valor reembolsável, o status e o motivo
padronizado da decisão, mais um resumo com os totais. As regras vêm da
Política de Reembolso v3 do RH, com as ambiguidades decididas e registradas
na spec.

O projeto foi feito com Spec Driven Development. O enunciado do desafio está
em [`DESAFIO.md`](DESAFIO.md).

## Requisitos

- **Node ≥ 24.** O TypeScript roda direto no Node, sem etapa de build
  (`node --version` para conferir).
- npm (vem com o Node).

## Instalar

```bash
npm install
```

Só instala as dependências de desenvolvimento (TypeScript, Vitest, Ajv). O
motor não tem dependência de runtime.

## Rodar

```bash
node src/cli.ts calcular --input exemplos/despesas-exemplo.json --output resultado.json
# ou
npm run reembolso -- calcular --input exemplos/despesas-exemplo.json --output resultado.json
```

Saída esperada no terminal:

```
14 itens processados; total reembolsável R$ 815,43
```

| Situação | Código de saída | O que acontece |
|---|---|---|
| Sucesso | `0` | grava o arquivo de saída (JSON indentado, `\n` no fim) e imprime o resumo |
| Entrada inválida: arquivo inexistente, JSON inválido, sem `colaborador.id`, `periodo` ou `despesas`, datas inválidas, `inicio` depois de `fim` (RN-015) | `1` | `erro: ...` no `stderr`; o arquivo de saída **não** é criado nem alterado |
| Uso incorreto (subcomando ou opção ausente/desconhecida) | `2` | `uso: ...` no `stderr` |

Uma despesa com dado inválido **não** é erro de execução: ela sai recusada
com `DADO_INVALIDO` e as outras seguem normalmente (RN-003).

A interface completa está em
[`contracts/cli.md`](specs/001-motor-reembolso/contracts/cli.md), e o formato
da saída em
[`contracts/saida.schema.json`](specs/001-motor-reembolso/contracts/saida.schema.json).

## Testar

```bash
npm test           # Vitest: regras, casos de borda, exemplo oficial, contrato, CLI e rastreabilidade
npm run typecheck  # tsc --noEmit
```

A suíte cobre:

- **Uma regra, um arquivo:** cada `RN-NNN` da spec tem o seu
  `tests/**/rn-NNN-*.test.ts`, com títulos que começam pelo ID
  (`RN-010 › ...`).
- **Casos de borda:** cada linha da tabela da seção 7 da spec é um teste
  `Borda › <Caso>` em `tests/casos-de-borda.test.ts`.
- **Exemplo oficial:** `tests/exemplo.test.ts` confere
  `exemplos/despesas-exemplo.json` item a item com a tabela da seção 9.
- **Contrato:** `tests/contrato-saida.test.ts` valida a saída contra o JSON
  Schema.
- **CLI:** `tests/cli.test.ts` roda o comando num processo filho (códigos de
  saída, nenhuma saída parcial em erro, determinismo).
- **Rastreabilidade:** `tests/rastreabilidade.test.ts` lê a spec e falha se
  alguma `RN-NNN` ou linha da seção 7 ficar sem teste.

O roteiro de validação manual está em
[`quickstart.md`](specs/001-motor-reembolso/quickstart.md).

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [`spec.md`](specs/001-motor-reembolso/spec.md) | **o quê**: regras (`RN-NNN`), ambiguidades decididas (`AMB-NNN`), casos de borda e critérios de aceite |
| [`plan.md`](specs/001-motor-reembolso/plan.md) | **como**: arquitetura, representação da política e decisões técnicas |
| [`research.md`](specs/001-motor-reembolso/research.md) · [`data-model.md`](specs/001-motor-reembolso/data-model.md) | decisões técnicas detalhadas e modelo de dados |
| [`tasks.md`](specs/001-motor-reembolso/tasks.md) | **em que ordem**: tasks `T-NNN`, cada uma com critério de aceite e o commit que a fechou |
| [`DECISIONS.md`](specs/001-motor-reembolso/DECISIONS.md) | log das mudanças de spec |
| [`docs/sessions/`](docs/sessions/) | exports das sessões com o Claude Code |

## Estrutura

```
src/
  cli.ts          # argumentos, leitura e gravação de arquivos, códigos de saída
  io/             # JSON sem float (json.ts), validação do arquivo (entrada.ts), montagem da saída (saida.ts)
  nucleo/         # regras em funções puras, sem E/S; a ordem da seção 8 da spec vive em motor.ts
tests/            # um arquivo por RN, casos de borda, exemplo, contrato, CLI, rastreabilidade
exemplos/         # arquivo de entrada de referência
```

Valores em dinheiro são centavos inteiros (`bigint`) do começo ao fim. A
entrada é lida pelo texto de cada número e a saída é gravada com duas casas,
sem passar por ponto flutuante. Todos os valores da política (limites, fator
de viagem, limiar de nota fiscal) ficam em `src/nucleo/politica.ts`.
