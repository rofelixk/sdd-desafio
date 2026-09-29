# Quickstart — validação ponta a ponta

Roteiro para provar que o motor atende a spec. O comportamento esperado está
na [`spec.md`](spec.md) (seções 7 e 9), a interface em
[`contracts/cli.md`](contracts/cli.md) e o formato da saída em
[`contracts/saida.schema.json`](contracts/saida.schema.json).

## Pré-requisitos

- Node **≥ 24** (`node --version`). O código TypeScript roda direto, sem build
  (R-01).
- Na raiz do repositório: `npm install`.

## 1. Suíte automatizada

```bash
npm test          # vitest run: regras, casos de borda, exemplo, CLI, rastreabilidade
npm run typecheck # tsc --noEmit
```

**Esperado:** tudo verde. O teste de rastreabilidade falha se alguma
`RN-NNN` da spec ou alguma linha da tabela da seção 7 ficar sem teste com o
nome correspondente.

## 2. Arquivo de exemplo

```bash
node src/cli.ts calcular --input exemplos/despesas-exemplo.json --output resultado.json
```

**Esperado:** código de saída `0`, e `resultado.json` com os 14 itens na
ordem da entrada, exatamente como na tabela da **seção 9 da spec**. Pontos
rápidos para conferir à mão:

| Conferir | Esperado |
|---|---|
| `resumo` | solicitado 1861.84 · reembolsável 815.43 · não reembolsado 1046.41 · 4/3/7 |
| `d-011` | `valor_solicitado` 33.33, `em_viagem` true, `limite_diario_aplicado` 90.00 |
| `d-010` | `diarias` 2, APROVADO 480.00 |
| `d-004` | `NOTA_FISCAL_AUSENTE` (100.01), enquanto `d-003` (100.00) sai PARCIAL 80.00 |
| valores monetários | sempre com duas casas (`60.00`, não `60`) |

## 3. Determinismo

```bash
node src/cli.ts calcular --input exemplos/despesas-exemplo.json --output r1.json
node src/cli.ts calcular --input exemplos/despesas-exemplo.json --output r2.json
cmp r1.json r2.json   # sem diferença
```

## 4. Entrada inválida (RN-015)

Crie um arquivo sem `periodo` e rode o comando:

```bash
node src/cli.ts calcular --input sem-periodo.json --output nao-deve-existir.json
echo $?   # 1
```

**Esperado:** a mensagem em `stderr` cita `periodo`, o código de saída é `1`
e `nao-deve-existir.json` não é criado. Repita com `inicio` depois de `fim` e
com um arquivo que não é JSON.

## 5. Dado inválido num item não aborta (RN-003)

Copie o exemplo e troque o `valor` de `d-001` por `"R$ 72,50"`.

**Esperado:** código de saída `0`. `d-001` sai RECUSADO/`DADO_INVALIDO` com
`valor_solicitado` null (AMB-023), e `d-002` passa a ser APROVADO 38,00
(o limite do dia 03/07 ficou livre).
