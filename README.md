# Motor de Cálculo de Reembolso

CLI que lê um JSON com as despesas de um colaborador num período e grava um
JSON com, para cada despesa, o valor reembolsável, o status e o motivo
padronizado da decisão, mais um resumo com os totais. As regras vêm da
Política de Reembolso v4 do RH (limites por centro de custo, moeda
estrangeira e aprovação manual acima de R$ 500), com as ambiguidades
decididas e registradas na spec.

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
14 itens processados; total reembolsável R$ 351,43
```

Os três arquivos de exemplo da seção 9 da spec:

| Arquivo | Colaborador | Linha no terminal |
|---|---|---|
| `exemplos/despesas-exemplo.json` | CC-ENG-PLATAFORMA (hospedagem não reembolsável) | `14 itens processados; total reembolsável R$ 351,43` |
| `exemplos/envelope/despesas-envelope.json` | CC-COMERCIAL, com EUR, USD, GBP e um item pendente | `10 itens processados; total reembolsável R$ 748,26; total pendente de aprovação R$ 1.200,00` |
| `exemplos/envelope/despesas-envelope-cc-desconhecido.json` | CC-SUPORTE-N2, sem entrada na tabela (tabela padrão) | `4 itens processados; total reembolsável R$ 373,76` |

O resultado esperado de cada item está nas tabelas da
[seção 9 da spec](specs/001-motor-reembolso/spec.md#9-critérios-de-aceite).

| Situação | Código de saída | O que acontece |
|---|---|---|
| Sucesso | `0` | grava o arquivo de saída (JSON indentado, `\n` no fim) e imprime o resumo |
| Entrada inválida: arquivo inexistente, JSON inválido, sem `colaborador.id`, `periodo` ou `despesas`, datas inválidas, `inicio` depois de `fim`, `colaborador.centro_custo` que não é texto (RN-015) | `1` | `erro: ...` no `stderr`; o arquivo de saída **não** é criado nem alterado |
| Tabela de limites ou câmbio ausente, que não é JSON ou fora do formato (RN-015) | `1` | `erro: <arquivo> (<caminho>): <campo e problema>`; nenhuma saída |
| Uso incorreto (subcomando ou opção ausente/desconhecida) | `2` | `uso: ...` no `stderr` |

Uma despesa com dado inválido, ou numa moeda sem cotação, **não** é erro de
execução: ela sai recusada (`DADO_INVALIDO` ou `CAMBIO_INDISPONIVEL`) e as
outras seguem normalmente (RN-003, RN-017).

A interface completa está em
[`contracts/cli.md`](specs/001-motor-reembolso/contracts/cli.md), e o formato
da saída em
[`contracts/saida.schema.json`](specs/001-motor-reembolso/contracts/saida.schema.json).

## Tabela de limites e câmbio (`dados/`)

Além do arquivo de entrada, toda execução lê dois arquivos num local fixo
(AMB-028). Eles simulam o serviço do financeiro: quem pede o reembolso não
escolhe os próprios limites, e por isso eles não vêm na linha de comando nem
no arquivo de entrada.

| Arquivo | O que é | Conteúdo inicial |
|---|---|---|
| `dados/politica.json` | tabela de limites: padrão e por centro de custo, limiar de nota fiscal e acréscimo de viagem | cópia de `exemplos/envelope/politica-v4.json` |
| `dados/cambio.json` | taxas de câmbio por data (quantos reais vale 1 unidade da moeda) | cópia de `exemplos/envelope/cambio.json` |

O caminho é resolvido a partir do código, e não da pasta de onde o comando é
chamado: rodar o CLI de outra pasta lê os mesmos arquivos.

**Para calcular com outra tabela ou outras taxas**, edite ou substitua o
arquivo em `dados/` (mesmo nome, formato da seção 4 da spec) e rode o comando
de novo. Nenhum código muda. Por exemplo, trocando `padrao.hospedagem.limite`
de `250.00` para `320.00` em `dados/politica.json`, a `f-002` do exemplo
`despesas-envelope-cc-desconhecido.json` passa de PARCIAL 250,00 para
APROVADO 310,00.

**Para restaurar os arquivos originais:**

```bash
git checkout dados/
git status dados/   # nada a mostrar
```

Um arquivo de `dados/` ausente ou fora do formato interrompe a execução com
código `1`, e a mensagem cita o arquivo e o campo:

```
erro: tabela de limites (dados/politica.json): centros_custo.CC-ADM.alimentacao.limite é negativo (-10)
erro: arquivo de câmbio (dados/cambio.json): arquivo não encontrado
```

Os testes automatizados **não** leem `dados/`: usam a tabela e o câmbio de
`exemplos/envelope/`. Trocar `dados/` não quebra a suíte. O contrato dos dois
arquivos está em
[`contracts/arquivos-externos.md`](specs/001-motor-reembolso/contracts/arquivos-externos.md).

## Testar

```bash
npm test           # Vitest: regras, casos de borda, exemplos, contrato, CLI e rastreabilidade
npm run typecheck  # tsc --noEmit
```

A suíte cobre:

- **Uma regra, um arquivo:** cada `RN-NNN` da spec (RN-001 a RN-018) tem o
  seu `tests/**/rn-NNN-*.test.ts`, com títulos que começam pelo ID
  (`RN-010 › ...`).
- **Casos de borda:** cada linha da tabela da seção 7 da spec (121 linhas) é
  um teste `Borda › <Caso>` em `tests/casos-de-borda.test.ts`.
- **Exemplos oficiais:** `tests/exemplo.test.ts` confere os três arquivos da
  seção 9 item a item (moeda, taxa, data da cotação, valores, status, código)
  e os três resumos.
- **Contrato:** `tests/contrato-saida.test.ts` valida a saída contra o JSON
  Schema.
- **CLI:** `tests/cli.test.ts` roda o comando num processo filho (códigos de
  saída, nenhuma saída parcial em erro, determinismo, chamada de outra pasta
  e, numa cópia temporária do projeto, `dados/` trocado ou removido).
- **Rastreabilidade:** `tests/rastreabilidade.test.ts` lê a spec e falha se
  alguma `RN-NNN` ou linha da seção 7 ficar sem teste.

O roteiro de validação manual, com os seis passos (suíte, exemplos, tabela
trocada, determinismo, arquivos inválidos e itens inválidos), está em
[`quickstart.md`](specs/001-motor-reembolso/quickstart.md).

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [`spec.md`](specs/001-motor-reembolso/spec.md) | **o quê**: regras (`RN-NNN`), ambiguidades decididas (`AMB-NNN`), casos de borda e critérios de aceite |
| [`plan.md`](specs/001-motor-reembolso/plan.md) | **como**: arquitetura, representação da política e decisões técnicas |
| [`research.md`](specs/001-motor-reembolso/research.md) · [`data-model.md`](specs/001-motor-reembolso/data-model.md) | decisões técnicas detalhadas e modelo de dados |
| [`contracts/`](specs/001-motor-reembolso/contracts/) | CLI, arquivos externos e schema da saída |
| [`tasks.md`](specs/001-motor-reembolso/tasks.md) | **em que ordem**: tasks `T-NNN`, cada uma com critério de aceite e o commit que a fechou |
| [`DECISIONS.md`](specs/001-motor-reembolso/DECISIONS.md) | log das mudanças de spec |
| [`docs/sessions/`](docs/sessions/) | exports das sessões com o Claude Code |

## Estrutura

```
src/
  cli.ts          # argumentos, leitura e gravação de arquivos, códigos de saída
  io/             # JSON sem float (json.ts), entrada (entrada.ts), tabela de limites (politica.ts),
                  # câmbio (cambio.ts), local fixo de dados/ (externos.ts), montagem da saída (saida.ts)
  nucleo/         # regras em funções puras, sem E/S; a ordem da seção 8 da spec vive em motor.ts
dados/            # tabela de limites e câmbio lidos a cada execução (local fixo)
tests/            # um arquivo por RN, casos de borda, exemplos, contrato, CLI, rastreabilidade
exemplos/         # arquivos de entrada de referência; envelope/ traz a tabela e o câmbio da v4
```

Valores em dinheiro são centavos inteiros (`bigint`) do começo ao fim; taxas
de câmbio e percentuais são decimais exatos. A entrada, a tabela e o câmbio
são lidos pelo texto de cada número e a saída é gravada com duas casas, sem
passar por ponto flutuante. Os limites, o limiar de nota fiscal e o acréscimo
de viagem vêm de `dados/politica.json`; o único valor de política no código é
o limiar de aprovação manual de R$ 500,00 (RN-018), em
`src/nucleo/politica.ts`.
