# Quickstart — validação ponta a ponta

Roteiro para provar que o motor atende a spec (v2.2). O comportamento
esperado está na [`spec.md`](spec.md) (seções 7 e 9), a interface em
[`contracts/cli.md`](contracts/cli.md), os arquivos externos em
[`contracts/arquivos-externos.md`](contracts/arquivos-externos.md) e o
formato da saída em [`contracts/saida.schema.json`](contracts/saida.schema.json).

## Pré-requisitos

- Node **≥ 24** (`node --version`). O código TypeScript roda direto, sem build
  (R-01).
- Na raiz do repositório: `npm install`.
- `dados/politica.json` e `dados/cambio.json` iguais aos de
  `exemplos/envelope/` (é o estado do repositório; confira com
  `git status dados/`).

## 1. Suíte automatizada

```bash
npm test          # vitest run: regras, casos de borda, exemplos, CLI, rastreabilidade
npm run typecheck # tsc --noEmit
```

**Esperado:** tudo verde. O teste de rastreabilidade falha se alguma
`RN-NNN` da spec (RN-001 a RN-018) ou alguma linha da tabela da seção 7
ficar sem teste com o nome correspondente.

## 2. Os três arquivos da seção 9

```bash
node src/cli.ts calcular --input exemplos/despesas-exemplo.json --output r-exemplo.json
node src/cli.ts calcular --input exemplos/envelope/despesas-envelope.json --output r-envelope.json
node src/cli.ts calcular --input exemplos/envelope/despesas-envelope-cc-desconhecido.json --output r-cc.json
```

**Esperado:** código de saída `0` nos três, e itens exatamente como nas
tabelas da **seção 9 da spec**. Pontos rápidos para conferir à mão:

| Arquivo | Conferir | Esperado |
|---|---|---|
| exemplo | `politica` | `{"versao": "v4", "tabela": "CC-ENG-PLATAFORMA"}` |
| exemplo | `resumo` | solicitado 1861.84 · reembolsável 351.43 · pendente 0.00 · não reembolsado 1510.41 · 5/2/7/0 |
| exemplo | `d-010`, `d-013` | `CATEGORIA_NAO_REEMBOLSAVEL`, descrição cita CC-ENG-PLATAFORMA |
| envelope | `e-004` | `taxa_cambio` 5.96, `data_cotacao` "2026-07-17" (sábado → sexta), `valor_solicitado` 178.80 |
| envelope | `e-006` | `CAMBIO_INDISPONIVEL`; `valor_solicitado`, `taxa_cambio`, `data_cotacao` nulos |
| envelope | `e-007` | PENDENTE/`REQUER_APROVACAO`, `valor_reembolsavel` 1200.00, `diarias` 3 |
| envelope | `e-008` | `em_viagem` true, `limite_diario_aplicado` 135.00 |
| envelope | `resumo` | reembolsável 748.26 · pendente 1200.00 · não reembolsado 509.26 · 3/3/3/1 |
| cc-desconhecido | `politica.tabela` | `"padrao"` |
| todos | valores monetários | sempre com duas casas (`60.00`, não `60`) |

## 3. A tabela vem de fora (RN-016, AMB-028)

```bash
# edite dados/politica.json: padrao.hospedagem.limite de 250.00 para 320.00
node src/cli.ts calcular --input exemplos/envelope/despesas-envelope-cc-desconhecido.json --output r-320.json
git checkout dados/politica.json
```

**Esperado:** `f-002` (hospedagem 310,00, 1 diária, CC-SUPORTE-N2 → padrão)
passa de PARCIAL 250,00 para APROVADO 310,00, e `total_reembolsavel` sobe de
373.76 para 433.76. Nenhum arquivo de código muda.

Repita de outra pasta (`cd /tmp && node <repo>/src/cli.ts calcular ...`): os
arquivos lidos são os mesmos de `dados/` (R-11).

## 4. Determinismo

```bash
node src/cli.ts calcular --input exemplos/envelope/despesas-envelope.json --output r1.json
node src/cli.ts calcular --input exemplos/envelope/despesas-envelope.json --output r2.json
cmp r1.json r2.json   # sem diferença
```

## 5. Entrada ou arquivo externo inválido (RN-015)

```bash
node src/cli.ts calcular --input sem-periodo.json --output nao-deve-existir.json
echo $?   # 1
```

**Esperado:** a mensagem em `stderr` cita `periodo`, o código de saída é `1`
e `nao-deve-existir.json` não é criado. Repita com:

- `"centro_custo": 42` na entrada → mensagem cita `colaborador.centro_custo`;
- `dados/cambio.json` renomeado → mensagem cita o arquivo de câmbio;
- um `limite` negativo em `dados/politica.json` → mensagem cita a tabela de
  limites e o campo;
- sem `versao` em `dados/politica.json` → mensagem cita `versao` (AMB-044).

Restaure `dados/` depois (`git checkout dados/`).

## 6. Dado inválido ou sem cotação num item não aborta (RN-003, RN-017)

Copie o exemplo do envelope e troque o `valor` de `e-002` por `"R$ 22,00"`.

**Esperado:** código de saída `0`. `e-002` sai RECUSADO/`DADO_INVALIDO` com
`valor_solicitado`, `taxa_cambio` e `data_cotacao` nulos (AMB-043), `moeda`
`"EUR"` como veio, e os outros itens não mudam. `e-006` (GBP) continua
`CAMBIO_INDISPONIVEL` sem abortar a execução.
