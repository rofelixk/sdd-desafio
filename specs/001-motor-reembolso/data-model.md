# Modelo de dados — Motor de Cálculo de Reembolso

**Fase 1 do `/speckit-plan`** · Base: `spec.md` v2.2

Estruturas internas do núcleo. Os tipos são TypeScript, mas as regras de
validação são só **referências** à spec. Nenhuma regra nova nasce aqui.

Convenções: `Centavos = bigint` (R-02). `DataISO` = texto `AAAA-MM-DD` já
validado (R-05). `Categoria` = texto normalizado (RN-002, R-15), **não** mais
uma união fechada. `Moeda` = texto em maiúsculas, sem espaços nas bordas
(R-06). `Decimal = { digitos: bigint; escala: number }`, número exato do
arquivo (R-13).

---

## 1. Entrada

### `NumeroJson`
Número como apareceu no arquivo: `{ texto: string }`, por exemplo
`{ texto: "33.333" }`. É criado pelo leitor de JSON (R-03) e é o único jeito
de um número chegar ao núcleo, inclusive vindo da tabela de limites e do
câmbio.

### `Entrada` (arquivo válido, RN-015)
| Campo | Tipo | Origem / regra |
|---|---|---|
| `colaborador` | objeto bruto | eco integral (seção 4) |
| `periodo` | objeto bruto | eco integral |
| `inicio`, `fim` | `DataISO` | RN-015: datas válidas, `inicio ≤ fim` |
| `centroCusto` | texto ou `null` | RN-015, AMB-032: tipo diferente de texto aborta. Ausente, nulo ou vazio → `null` (tabela padrão) |
| `despesas` | `unknown[]` | RN-015: precisa ser lista. Cada elemento é bruto |

Qualquer falha aqui gera `ErroEntrada { mensagem }` e **não gera saída**.

### `DespesaBruta`
Elemento de `despesas` sem nenhuma garantia (`unknown`). Pode nem ser objeto
(RN-003, AMB-023).

## 2. Dados externos (novos na v4)

### `Politica` (tabela de limites válida, RN-016, AMB-044)
Lida de `dados/politica.json` por `io/politica.ts` (R-11, R-12).

| Campo | Tipo | Regra |
|---|---|---|
| `versao` | texto | eco em `politica.versao` |
| `vigencia` | `DataISO` | só validada (AMB-034) |
| `padrao` | `TabelaCategorias` | RN-016 |
| `centrosCusto` | `Map<nomeNormalizado, { nome, categorias: TabelaCategorias }>` | `nome` como está escrito (para `politica.tabela`). Colisão depois de normalizar → inválida |
| `limiarNotaFiscal` | `Decimal` | RN-008, comparação exata (R-13) |
| `acrescimoViagemPercentual` | `Decimal` | RN-011, AMB-033 |

`TabelaCategorias = Map<categoriaNormalizada, RegraCategoria>`, e
`RegraCategoria = { limite: Centavos; periodicidade: 'dia' | 'diaria' }`.
Validação (RN-016): limite ≥ 0 e exato em centavos; `diaria` ⇔ `hospedagem`;
colisão de categorias → inválida.

### `Cambio` (arquivo de câmbio válido, RN-017, AMB-042, AMB-044)
Lido de `dados/cambio.json` por `io/cambio.ts`. Guardado já como índice
(R-14):

`Map<Moeda, readonly Cotacao[]>`, com `Cotacao = { data: DataISO; taxa:
NumeroJson }` em ordem crescente de data. A taxa guarda o texto original,
para sair "como está no arquivo" (R-04), e vira `Decimal` na conta.
Validação (RN-017): chave de data válida; valor da data é objeto; moeda com 3
letras; taxa > 0 (em todas as entradas). Moeda repetida na mesma data
(`"usd"` e `"USD"`): fica a última do arquivo (AMB-042, R-14).

### `TabelaAplicavel` (montada uma vez por execução, RN-016)
| Campo | Tipo | Regra |
|---|---|---|
| `nome` | texto | `"padrao"` ou o centro de custo como está na tabela (`politica.tabela`) |
| `versao` | texto | eco da `Politica` |
| `centroCusto` | texto ou `null` | nome do CC quando há entrada, para a descrição da RN-006 |
| `categorias` | `Map<Categoria, RegraCategoria & { origem: 'centro_custo' \| 'padrao' }>` | RN-016 itens 1 a 3. Limite 0 do CC **não** herda (AMB-031) |
| `limiarNotaFiscal`, `acrescimoViagemPercentual` | `Decimal` | únicos para todos os CC |

Montada por `nucleo/politica.ts` a partir de `Politica` + `Entrada.centroCusto`.

## 3. Estados de uma despesa

Cada despesa percorre as etapas da seção 8 da spec. Em cada etapa ela segue ou
é **recusada**, e a primeira recusa é definitiva:

```
DespesaBruta
  │ etapa 1  RN-001, RN-002, RN-017 (conversão, sem recusar)
  │ etapa 2  RN-003 ───────────────────────────────► Recusada(DADO_INVALIDO)
  ▼
DespesaValida
  │ etapas 3-8  RN-004 → RN-005 → RN-006 → RN-017 → RN-007 → RN-008
  │                                   ─────────────► Recusada(VALOR_NAO_POSITIVO |
  ▼                                                   FORA_DO_PERIODO | CATEGORIA_NAO_
DespesaElegivel                                       REEMBOLSAVEL | CAMBIO_INDISPONIVEL |
  │ etapa 9   RN-011 (dias de viagem)                 DUPLICATA | NOTA_FISCAL_AUSENTE)
  │ etapa 10  RN-012 (parcelas) + RN-009/RN-010 (limite)
  ▼
Alocada(APROVADO_INTEGRAL | LIMITE_DIARIO_EXCEDIDO | LIMITE_DIARIO_ESGOTADO)
  │ etapa 11  RN-018: reembolsável > R$ 500,00
  ▼
Alocada(REQUER_APROVACAO)   (mesmos valores; só o motivo muda)
```

### `Conversao` (etapa 1, RN-017, AMB-043)
| Campo | Tipo | Regra |
|---|---|---|
| `taxa` | `NumeroJson` | do câmbio; `1` em BRL |
| `dataCotacao` | `DataISO` ou `null` | a da despesa ou a última anterior (AMB-035); `null` em BRL |
| `valorSolicitado` | `Centavos` | `valorOriginal × taxa`, meio para o par (AMB-037); igual ao original em BRL |

É `null` quando não houve conversão: `valor` inválido (sempre, mesmo em BRL,
AMB-043), moeda não textual, data inválida numa moeda estrangeira, ou moeda
sem cotação até a data. Os três campos da saída saem juntos desse valor.

### `DespesaValida` (passou da RN-003)
| Campo | Tipo | Regra |
|---|---|---|
| `indice` | inteiro | posição na entrada. É a ordem da RN-007 e da RN-010 |
| `id` | texto | como veio (para a saída) |
| `idNormalizado` | texto | AMB-024. Só uma `DespesaValida` entra no conjunto de ids vistos (AMB-025) |
| `data` | `DataISO` | RN-003 |
| `categoriaOriginal` | texto | como veio |
| `categoria` | `Categoria` | RN-002. Ainda pode não estar na tabela (a recusa vem na RN-006) |
| `descricao` | texto | RN-003/AMB-026. Na hospedagem, fonte do N (RN-012) |
| `fornecedorChave` | texto | RN-003/AMB-026, RN-007: `trim` + minúsculas |
| `moeda` | `Moeda` | RN-003, AMB-036: ausente/nulo/vazio → `"BRL"` |
| `valorOriginal` | `Centavos` | RN-003 → RN-001, na moeda da despesa |
| `conversao` | `Conversao \| null` | etapa 1. `null` aqui só por falta de cotação (a recusa vem na etapa 6) |
| `temNotaFiscal` | booleano | RN-003: vazio vale `false` |

### `DespesaElegivel` (passou das etapas 3 a 8)
`DespesaValida` com a categoria na tabela aplicável e limite > 0, `conversao`
não nula e `valorSolicitado` (em reais) > 0. Carrega a `RegraCategoria` da
tabela aplicável. Para `periodicidade: 'diaria'`, também `diarias: N`
(RN-012).

### `Recusa`
| Campo | Tipo |
|---|---|
| `codigo` | um dos 7 códigos de recusa das etapas 2 a 8 da seção 8 |
| `detalhes` | dados para montar a descrição. Novos na v4: CATEGORIA_NAO_REEMBOLSAVEL leva `{ categoria, tabela, caso: 'ausente' \| 'limite_zero', centroCusto }` (RN-006); CAMBIO_INDISPONIVEL leva `{ moeda, data }`; NOTA_FISCAL_AUSENTE leva também a moeda e o valor original, quando estrangeira |

`RecusaDadoInvalido` guarda os ecos brutos `id`, `data`, `categoria` **e
`moeda`** (AMB-023), o `valorOriginal` (ou `null`) e a `conversao` (ou `null`).

## 4. Cálculo do limite

### `Parcela` (RN-012)
Uma fatia de despesa elegível que consome limite de uma data. Uma despesa de
periodicidade `dia` gera uma parcela. Uma de periodicidade `diaria` com N
diárias gera N.

| Campo | Tipo | Regra |
|---|---|---|
| `indiceDespesa` | inteiro | a quem a parcela pertence (ordem de consumo) |
| `data` | `DataISO` | D + k, com k = 0…N−1 |
| `categoria` | `Categoria` | |
| `valor` | `Centavos` | `valorSolicitado ÷ N` **em reais**. Os centavos que sobram vão um a um para as primeiras noites |

### `DiasDeViagem` (RN-011)
Conjunto de `DataISO`: todas as noites de todas as despesas elegíveis de
periodicidade `diaria`. Inclui as que vão sair PENDENTE (RN-018), porque a
etapa 11 vem depois.

### `Saldo`
Tabela `(data, categoria) → Centavos`, iniciada com o limite da categoria na
tabela aplicável. Se a data é dia de viagem e a periodicidade é `dia`, o
limite é `limite × (100 + p) / 100`, meio para o par (RN-011, AMB-033, R-13).
Cada parcela, na ordem da entrada, recebe `min(valor, saldo)` e desconta isso
do saldo (RN-010). PENDENTE não devolve saldo.

## 5. Saída

### `ResultadoItem` (um por despesa, na ordem da entrada)
Campos e significado: **seção 4 da spec**. Observações de implementação:
- Os valores monetários são `Centavos` no núcleo e só viram número JSON
  `0.00` na serialização (R-04).
- `moeda`: normalizada; num `DADO_INVALIDO`, o eco bruto (ausente → `null`).
- `valorOriginal`: `Centavos | null`. Nulo só com `valor` não numérico.
- `conversao: Conversao | null` gera `taxa_cambio`, `data_cotacao` e
  `valor_solicitado` juntos (R-17, AMB-043).
- Os ecos de `id`/`data`/`categoria`/`moeda` num `DADO_INVALIDO` guardam o
  **valor bruto** (`unknown`) e ele é reemitido como veio.
- `status` é **derivado** de (`reembolsavel`, `solicitado`) e nunca é
  guardado separado: `> LIMIAR_APROVACAO` → PENDENTE; senão como na v1 (R-16).

### `Motivo`
`{ codigo, descricao }`. A descrição sai de um modelo de texto por código,
com valores formatados em `R$ 0,00` (RN-013). Nos códigos de limite, traz o
limite aplicado, o saldo disponível e o valor cortado. Em moeda estrangeira,
traz a conta da conversão (valor original × taxa, data da cotação). Em
REQUER_APROVACAO, traz o valor calculado, o limiar de R$ 500,00 e o corte de
limite, se houve (RN-018).

### `Resumo` (RN-014)
Contagens por status (agora com `pendentes`) e quatro totais em `Centavos`:
`totalSolicitado` (só `valor_solicitado` positivos e não nulos),
`totalReembolsavel` (itens **não** PENDENTE), `totalPendente` (itens
PENDENTE) e `totalNaoReembolsado = solicitado − reembolsável − pendente`.

### Bloco `politica` da saída
`{ versao, tabela }`, vindo da `TabelaAplicavel`.

## 6. Constante de política

`src/nucleo/politica.ts` guarda só o que a spec fixa e a tabela não traz:

| Nome | Valor | Regra |
|---|---|---|
| `LIMIAR_APROVACAO` | `500_00n` (estritamente maior) | RN-018, AMB-040 |

Os limites, o limiar de nota fiscal e o percentual de viagem **não** existem
mais no código (RN-016).
