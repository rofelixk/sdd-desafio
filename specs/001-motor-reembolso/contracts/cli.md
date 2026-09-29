# Contrato — CLI

Interface fixa do desafio, com os detalhes de implementação decididos no plano
(R-08). O formato do conteúdo da saída é o da seção 4 da spec, formalizado em
[`saida.schema.json`](saida.schema.json).

## Invocação

```
node src/cli.ts calcular --input <arquivo-entrada.json> --output <arquivo-saida.json>
npm run reembolso -- calcular --input <...> --output <...>   # equivalente
```

| Argumento | Obrigatório | Significado |
|---|---|---|
| `calcular` | sim | único subcomando |
| `--input <caminho>` | sim | JSON no formato de `exemplos/despesas-exemplo.json` |
| `--output <caminho>` | sim | onde gravar o resultado. Se o arquivo existir, é sobrescrito |

## Comportamento

| Situação | Código de saída | `stdout` | `stderr` | Arquivo de saída |
|---|---|---|---|---|
| Sucesso | `0` | uma linha de resumo (qtd. de itens, total reembolsável) | — | gravado (UTF-8, JSON indentado com 2 espaços, `\n` no fim) |
| Entrada inválida (RN-015): arquivo inexistente, JSON inválido, falta `colaborador.id` / `periodo.inicio` / `periodo.fim` / `despesas`, data inválida, `inicio > fim` | `1` | — | `erro: <mensagem citando o campo ou o problema>` | **não é criado nem alterado** |
| Falha ao gravar a saída | `1` | — | `erro: <mensagem>` | o que o sistema operacional deixou |
| Uso incorreto (subcomando ou opção ausente/desconhecida) | `2` | — | `uso: ...` | não é criado |

Uma despesa inválida **não** é erro de execução. Ela vira um item
`DADO_INVALIDO` e o código de saída continua `0` (RN-003, AMB-018).

## Garantias

- **Determinismo:** a mesma entrada gera bytes idênticos na saída. O
  resultado não depende de hora, fuso, locale nem ordem de iteração que não
  seja a da entrada.
- **Nenhuma saída parcial:** tudo é calculado em memória antes de gravar
  qualquer byte.
- **Eco fiel:** `colaborador` e `periodo` saem com o mesmo conteúdo da
  entrada. Os números mantêm o texto original (R-03).
