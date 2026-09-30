# Contrato — CLI

Interface fixa do desafio, com os detalhes de implementação decididos no plano
(R-08, R-11). O formato do conteúdo da saída é o da seção 4 da spec (v2.2),
formalizado em [`saida.schema.json`](saida.schema.json). Os dois arquivos
externos lidos a cada execução estão em
[`arquivos-externos.md`](arquivos-externos.md).

## Invocação

```
node src/cli.ts calcular --input <arquivo-entrada.json> --output <arquivo-saida.json>
npm run reembolso -- calcular --input <...> --output <...>   # equivalente
```

| Argumento | Obrigatório | Significado |
|---|---|---|
| `calcular` | sim | único subcomando |
| `--input <caminho>` | sim | JSON no formato de `exemplos/despesas-exemplo.json` (com `centro_custo` e `moeda` opcionais, seção 4) |
| `--output <caminho>` | sim | onde gravar o resultado. Se o arquivo existir, é sobrescrito |

Não existe opção para a tabela de limites nem para o câmbio: eles ficam num
local fixo (AMB-028, R-11).

## Comportamento

| Situação | Código de saída | `stdout` | `stderr` | Arquivo de saída |
|---|---|---|---|---|
| Sucesso | `0` | uma linha de resumo (qtd. de itens, total reembolsável e, se houver, total pendente) | — | gravado (UTF-8, JSON indentado com 2 espaços, `\n` no fim) |
| Entrada inválida (RN-015): arquivo inexistente, JSON inválido, não é objeto, falta `colaborador.id` / `periodo.inicio` / `periodo.fim` / `despesas`, data inválida, `inicio > fim`, `colaborador.centro_custo` que não é texto | `1` | — | `erro: <mensagem citando o campo ou o problema>` | **não é criado nem alterado** |
| Tabela de limites ou câmbio ausente, não JSON ou fora do formato (RN-015, RN-016, RN-017, AMB-044) | `1` | — | `erro: <tabela de limites \| arquivo de câmbio> (<caminho>): <campo e problema>` | **não é criado nem alterado** |
| Falha ao gravar a saída | `1` | — | `erro: <mensagem>` | o que o sistema operacional deixou |
| Uso incorreto (subcomando ou opção ausente/desconhecida) | `2` | — | `uso: ...` | não é criado |

A ordem de leitura é entrada → tabela de limites → câmbio. Com mais de um
arquivo inválido, a mensagem é a do primeiro (R-12).

Uma despesa inválida, ou sem cotação para a moeda, **não** é erro de
execução. Ela vira um item `DADO_INVALIDO` ou `CAMBIO_INDISPONIVEL` e o
código de saída continua `0` (RN-003, RN-017).

## Garantias

- **Determinismo:** a mesma entrada, a mesma tabela e o mesmo câmbio geram
  bytes idênticos na saída. O resultado não depende de hora, fuso, locale,
  pasta de trabalho nem ordem de iteração que não seja a da entrada.
- **Nenhuma saída parcial:** tudo é lido, validado e calculado em memória
  antes de gravar qualquer byte.
- **Eco fiel:** `colaborador` e `periodo` saem com o mesmo conteúdo da
  entrada. Os números mantêm o texto original (R-03), e a `taxa_cambio` sai
  com o texto do arquivo de câmbio (R-04).
