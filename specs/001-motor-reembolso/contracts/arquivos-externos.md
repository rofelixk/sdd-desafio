# Contrato — Arquivos externos (tabela de limites e câmbio)

Os dois arquivos que o motor lê a cada execução, além da entrada (AMB-028).
O **formato** e o que os torna inválidos estão na spec (seção 4, RN-016,
RN-017, AMB-042, AMB-044) e não são repetidos aqui. Este contrato só fixa o
**onde** e o **como** técnicos (R-11, R-12).

## Local fixo

| Arquivo | Caminho | Conteúdo inicial |
|---|---|---|
| Tabela de limites | `dados/politica.json` | cópia de `exemplos/envelope/politica-v4.json` |
| Taxas de câmbio | `dados/cambio.json` | cópia de `exemplos/envelope/cambio.json` |

O caminho é relativo à **raiz do repositório** e é resolvido a partir do
código (`src/io/externos.ts`), e não da pasta de onde o comando é chamado.
Rodar o CLI de outra pasta lê os mesmos arquivos.

## Como trocar

Para calcular com outra tabela ou outras taxas, substitua o arquivo em
`dados/` (mesmo nome, formato da seção 4 da spec) e rode o comando de novo.
Nenhum código muda (critério da §9 da spec: "mudar um limite na tabela muda
o resultado sem mudar o sistema").

## Erros

Arquivo ausente, que não é JSON ou fora do formato → código de saída `1`,
nenhuma saída gerada (RN-015). A mensagem cita o arquivo e o campo:

```
erro: tabela de limites (dados/politica.json): centros_custo.CC-ADM.alimentacao.limite é negativo (-10)
erro: arquivo de câmbio (dados/cambio.json): arquivo não encontrado
erro: arquivo de câmbio (dados/cambio.json): taxas.2026-07-13.EUR não é maior que zero (0)
```

O texto exato das mensagens é orientativo. O que se verifica é o código de
saída, a ausência do arquivo de saída e que a mensagem cita o arquivo e o
campo.

## Leitura

- Os números passam pelo mesmo leitor da entrada (R-03): nenhum limite, taxa
  ou percentual passa por float.
- Campos informativos (`observacao`, `fonte`) e campos que a seção 4 não
  conhece são ignorados (AMB-044).
