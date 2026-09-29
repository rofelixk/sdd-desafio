# Modelo de dados — Motor de Cálculo de Reembolso

**Fase 1 do `/speckit-plan`** · Base: `spec.md` v1.3

Estruturas internas do núcleo. Os tipos são TypeScript, mas as regras de
validação são só **referências** à spec. Nenhuma regra nova nasce aqui.

Convenções: `Centavos = bigint` (R-02). `DataISO` = texto `AAAA-MM-DD` já
validado (R-05). `Categoria = 'alimentacao' | 'transporte_urbano' | 'hospedagem'`.

---

## 1. Entrada

### `NumeroJson`
Número como apareceu no arquivo: `{ texto: string }`, por exemplo
`{ texto: "33.333" }`. É criado pelo leitor de JSON (R-03) e é o único jeito
de um número chegar ao núcleo.

### `Entrada` (arquivo válido, RN-015)
| Campo | Tipo | Origem / regra |
|---|---|---|
| `colaborador` | objeto bruto | eco integral (seção 4) |
| `periodo` | objeto bruto | eco integral |
| `inicio`, `fim` | `DataISO` | RN-015: datas válidas, `inicio ≤ fim` |
| `despesas` | `unknown[]` | RN-015: precisa ser lista. Cada elemento é bruto |

Qualquer falha aqui gera `ErroEntrada { mensagem }` e **não gera saída**.

### `DespesaBruta`
Elemento de `despesas` sem nenhuma garantia (`unknown`). Pode nem ser objeto
(RN-003, AMB-023).

## 2. Estados de uma despesa

Cada despesa percorre as etapas da seção 8 da spec. Em cada etapa ela segue ou
é **recusada**, e a primeira recusa é definitiva:

```
DespesaBruta
  │ etapa 1-2  RN-001, RN-002, RN-003 ─────────────► Recusada(DADO_INVALIDO)
  ▼
DespesaValida
  │ etapas 3-7 RN-004 → RN-005 → RN-006 → RN-007 → RN-008
  │                                   ─────────────► Recusada(VALOR_NAO_POSITIVO |
  ▼                                                   FORA_DO_PERIODO | CATEGORIA_NAO_
DespesaElegivel                                       REEMBOLSAVEL | DUPLICATA |
  │ etapa 8  RN-011 (dias de viagem)                  NOTA_FISCAL_AUSENTE)
  │ etapa 9  RN-012 (parcelas) + RN-009/RN-010 (limite)
  ▼
Alocada(APROVADO_INTEGRAL | LIMITE_DIARIO_EXCEDIDO | LIMITE_DIARIO_ESGOTADO)
```

### `DespesaValida` (passou da RN-003)
| Campo | Tipo | Regra |
|---|---|---|
| `indice` | inteiro | posição na entrada. É a ordem da RN-007 e da RN-010 |
| `id` | texto | como veio (para a saída) |
| `idNormalizado` | texto | AMB-024. Usado só na detecção de `id` repetido. Só uma `DespesaValida` entra no conjunto de ids vistos. Uma `Recusa(DADO_INVALIDO)` não reserva o `id` (AMB-025) |
| `data` | `DataISO` | RN-003 |
| `categoriaOriginal` | texto | como veio |
| `categoria` | texto normalizado | RN-002. Ainda pode ser desconhecida (a recusa vem na RN-006) |
| `descricao` | texto | RN-003/AMB-026: qualquer valor vira texto, ausente ou nulo = `""`. Na hospedagem, fonte do N (RN-012) |
| `fornecedorChave` | texto | RN-003/AMB-026: qualquer valor vira texto. RN-007: `trim` + minúsculas. Ausente ou nulo = `""` |
| `valorSolicitado` | `Centavos` | RN-003 → RN-001 (meio para o par) |
| `temNotaFiscal` | booleano | RN-003: vazio vale `false` |

### `DespesaElegivel` (passou das etapas 3 a 7)
`DespesaValida` com `categoria: Categoria` (já reconhecida) e
`valorSolicitado > 0`. Para hospedagem, também `diarias: N` (RN-012).

### `Recusa`
| Campo | Tipo |
|---|---|
| `codigo` | um dos 6 códigos de recusa de elegibilidade da seção 4 |
| `detalhes` | dados para montar a descrição (ex.: `idAceito` da duplicata, datas do período) |

## 3. Cálculo do limite

### `Parcela` (RN-012)
Uma fatia de despesa elegível que consome limite de uma data. Uma despesa que
não é hospedagem gera uma parcela. Uma hospedagem com N diárias gera N.

| Campo | Tipo | Regra |
|---|---|---|
| `indiceDespesa` | inteiro | a quem a parcela pertence (ordem de consumo) |
| `data` | `DataISO` | D + k, com k = 0…N−1 |
| `categoria` | `Categoria` | |
| `valor` | `Centavos` | `valor ÷ N`. Os centavos que sobram vão um a um para as primeiras noites |

### `DiasDeViagem` (RN-011)
Conjunto de `DataISO`: todas as noites de todas as hospedagens **elegíveis**.

### `Saldo`
Tabela `(data, categoria) → Centavos`, iniciada com o limite da categoria
naquela data. O limite é ampliado 1,5× se a data é dia de viagem e a
categoria amplia (RN-009, AMB-020). Cada parcela, na ordem da entrada,
recebe `min(valor, saldo)` e desconta isso do saldo (RN-010).

## 4. Saída

### `ResultadoItem` (um por despesa, na ordem da entrada)
Campos e significado: **seção 4 da spec**. Observações de implementação:
- Os valores monetários são `Centavos` no núcleo e só viram número JSON
  `0.00` na serialização (R-04).
- `valor_solicitado` é `Centavos | null`. É nulo só em `DADO_INVALIDO` com
  `valor` não numérico (AMB-023).
- Os ecos de `id`/`data`/`categoria` num `DADO_INVALIDO` guardam o **valor
  bruto** (`unknown`) e ele é reemitido como veio. Um `NumeroJson` volta como
  o mesmo texto numérico.
- `status` é **derivado** de (`reembolsavel`, `solicitado`) e nunca é
  guardado separado. Assim ele não pode contradizer os valores.

### `Motivo`
`{ codigo, descricao }`. A descrição sai de um modelo de texto por código,
com valores formatados em `R$ 0,00` (RN-013). Para os códigos de limite, a
descrição traz o limite aplicado, o saldo disponível e o valor cortado.

### `Resumo` (RN-014)
Contagens por status e três totais em `Centavos`. `total_solicitado` soma só
os `valor_solicitado` positivos e não nulos.

## 5. Política

`Politica` é um valor constante e tipado (ver plan §4):

| Campo | Valor | Regra |
|---|---|---|
| `limites.alimentacao` | `{ diario: 6000n, ampliaEmViagem: true }` | RN-009 |
| `limites.transporte_urbano` | `{ diario: 8000n, ampliaEmViagem: true }` | RN-009 |
| `limites.hospedagem` | `{ diario: 25000n, ampliaEmViagem: false }` | RN-009, AMB-020 |
| `fatorViagem` | `{ num: 3n, den: 2n }` | RN-011 |
| `limiarNotaFiscal` | `10000n` (estritamente maior) | RN-008 |
