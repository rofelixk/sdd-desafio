# Spec — Motor de Cálculo de Reembolso

**Versão:** 1.2 · **Status:** rascunho · **Última alteração:** `2026-09-29`

> **Regra de ouro deste arquivo:** ele descreve o QUÊ e o PORQUÊ. Nenhuma linha
> aqui pode citar linguagem, biblioteca, classe, função ou estrutura de pasta.
> Se apareceu solução, o lugar dela é o `plan.md`.
>
> **Teste de aceitação da própria spec:** uma pessoa que nunca viu o projeto
> consegue, lendo só este arquivo, verificar se o sistema está correto?

---

## 1. Problema

Hoje o financeiro confere manualmente, item por item, as despesas de cada
colaborador contra a Política de Reembolso v3 do RH. O processo é lento, e como
a política é ambígua, cada analista a interpreta de um jeito. O resultado é
reembolso inconsistente e sem justificativa rastreável.

## 2. Objetivo

Dado o conjunto de despesas de um colaborador num período, o sistema decide de
forma determinística quanto de cada despesa é reembolsável e justifica cada
decisão com um motivo padronizado.

## Clarifications

### Session 2026-09-29

- Q: Duas despesas sem `fornecedor`, com mesma data, categoria e valor, são duplicatas? → A: Sim. Fornecedor ausente, vazio ou só com espaços vale como fornecedor **vazio**, que é um valor comparado como qualquer outro: vazio casa com vazio, e fornecedor preenchido nunca casa com vazio (RN-007, AMB-011).
- Q: Quando uma despesa sem fornecedor casaria com duas outras de fornecedores diferentes, com quais ela é comparada? → A: O caso deixa de existir, porque vazio não casa com fornecedor preenchido. O fornecedor é sempre comparado, então a relação de duplicata é transitiva.
- Q: Uma despesa com `valor` escrito como texto (`"45.00"`, `"45,00"`) deve ser aceita? → A: Sim, com ponto ou vírgula decimal, além de número direto. Formato fechado: sinal opcional, dígitos e no máximo um separador decimal. Separador de milhar e símbolo de moeda → `DADO_INVALIDO` (RN-003, AMB-021).
- Q: Um `tem_nota_fiscal` não booleano (`"true"`, `"sim"`, `1`, `null`) conta como o quê? → A: Só booleanos são aceitos. Vazio (ausente, nulo, texto vazio) vale `false`. Qualquer outro valor → `DADO_INVALIDO` (RN-003, AMB-022).
- Q: `id`, `categoria` ou `data` vazios, nulos ou de tipo errado são o mesmo que ausentes? → A: Sim. Sem essa informação não dá para calcular a despesa corretamente, então ela é recusada com `DADO_INVALIDO` (RN-003, AMB-018).
- Q: Num item `DADO_INVALIDO` com `valor` não numérico ou ausente, o que sai em `valor_solicitado`? E `id`, `data` e `categoria` inválidos? → A: `valor_solicitado` sai nulo, e os campos de eco saem exatamente como vieram, para que a saída mostre o motivo da recusa (seção 4, AMB-023).
- Q: Em "Hotel 5 estrelas - 2 diarias", N é 2 ou 1? → A: 2. Vale a primeira ocorrência do padrão completo "<inteiro> diária(s)/noite(s)". Números soltos antes dela são ignorados (RN-012, AMB-008).
- Q: `"d-001"`, `" d-001 "` e `"D-001"` são o mesmo `id` para a RN-003? → A: Sim. O `id` é normalizado como a categoria (maiúsculas/minúsculas, espaços nas bordas, acentos) antes de comparar (RN-003, AMB-024).
- Q: Uma despesa com o mesmo `id` de uma anterior que foi recusada com `DADO_INVALIDO` também é `DADO_INVALIDO`? → A: Não. Ela é tratada como a correção da anterior e segue normalmente. Só uma despesa que passou pela validação reserva o `id`. Recusas de etapas posteriores (período, duplicata, nota fiscal...) continuam reservando o `id` (RN-003, AMB-025).

## 3. Fora de escopo

- Não efetua pagamento nem integra com folha, ERP ou banco. Só calcula.
- Não verifica se a nota fiscal é autêntica. Confia no indicador de nota fiscal
  informado na entrada.
- Não interpreta texto livre (`descricao`, `fornecedor`) para deduzir dados
  como motivo da despesa ou situação de viagem. Texto livre só é ecoado ou
  comparado literalmente. **Única exceção:** o número de diárias de hospedagem
  é extraído de `descricao` pelo padrão fechado da RN-012.
- Não converte moeda. Todo valor é tratado como Real (BRL).
- Não valida diferença de preço entre as noites de uma estadia nem tarifas
  promocionais. O valor da hospedagem é sempre dividido igualmente entre as
  noites (RN-012).
- Não processa mais de um colaborador ou mais de um período por execução.
- Não guarda histórico entre execuções. Duplicatas só são detectadas dentro do
  mesmo arquivo, e despesas fora do período não ficam guardadas para um
  período futuro.
- Não reembolsa categorias além de alimentação, transporte urbano e hospedagem
  (ver RN-006).
- Não tem fluxo de aprovação humana, alçadas, exceções manuais nem interface
  gráfica.

## 4. Entrada e saída

**Entrada:** conforme `exemplos/despesas-exemplo.json`. Campos e significado:

| Campo | Tipo | Significado | Obrigatório |
|---|---|---|---|
| `colaborador.id` | texto | Identificador do colaborador | sim |
| `colaborador.nome` | texto | Nome, apenas ecoado na saída | não |
| `colaborador.centro_custo` | texto | Centro de custo, apenas ecoado na saída | não |
| `periodo.competencia` | texto `AAAA-MM` | Mês de competência, informativo (ver AMB-010) | não |
| `periodo.inicio` | data `AAAA-MM-DD` | Primeiro dia do período, inclusivo | sim |
| `periodo.fim` | data `AAAA-MM-DD` | Último dia do período, inclusivo | sim |
| `despesas` | lista | Despesas a avaliar (pode ser vazia) | sim |
| `despesas[].id` | texto | Identificador único da despesa no arquivo | sim |
| `despesas[].data` | data `AAAA-MM-DD` | Data em que a despesa ocorreu | sim |
| `despesas[].categoria` | texto | Categoria declarada (ver RN-002) | sim |
| `despesas[].descricao` | texto | Texto livre. Em hospedagem, é de onde se extrai o número de diárias (RN-012). Ausente = 1 diária | não |
| `despesas[].fornecedor` | texto | Fornecedor, usado na detecção de duplicata. Ausente equivale a vazio (RN-007) | não |
| `despesas[].valor` | número ou texto numérico | Valor solicitado em reais, pode ter qualquer número de casas decimais. Também é aceito como texto no formato fechado da RN-003 (`"45.00"`, `"45,00"`) | sim |
| `despesas[].tem_nota_fiscal` | booleano | Se há nota fiscal. Vazio (ausente, nulo ou texto vazio) equivale a `false`. Qualquer outro valor não booleano é `DADO_INVALIDO` (RN-003) | não |

**Saída:** definida por mim. Estrutura e significado de cada campo:

| Campo | Tipo | Significado |
|---|---|---|
| `colaborador` | objeto | Eco do objeto de entrada |
| `periodo` | objeto | Eco do objeto de entrada |
| `itens` | lista | Um item por despesa de entrada, **na mesma ordem da entrada** |
| `itens[].id` | texto | `id` da despesa, como veio |
| `itens[].data` | texto | `data` da despesa, como veio |
| `itens[].categoria` | texto | Categoria normalizada (RN-002), ou a original, como veio, se não for reconhecida |
| `itens[].valor_solicitado` | número ou nulo | Valor da entrada arredondado para centavos (RN-001). Nulo se o `valor` é ausente ou não numérico (RN-003) |
| `itens[].valor_reembolsavel` | número | Valor a reembolsar, em centavos, `0 ≤ valor_reembolsavel ≤ max(valor_solicitado, 0)` |
| `itens[].status` | texto | `APROVADO` (reembolsável = solicitado), `PARCIAL` (0 < reembolsável < solicitado) ou `RECUSADO` (reembolsável = 0) |
| `itens[].motivo.codigo` | texto | Código padronizado da decisão (tabela abaixo) |
| `itens[].motivo.descricao` | texto | Frase legível em português, com os números que justificam a decisão |
| `itens[].limite_diario_aplicado` | número ou nulo | Limite diário da categoria usado no cálculo, já ampliado se for dia de viagem. Em hospedagem é o limite por diária. Nulo se a despesa não chegou à etapa de limite |
| `itens[].em_viagem` | booleano ou nulo | Se a data da despesa foi considerada dia de viagem (RN-011). Nulo se a despesa não chegou à etapa de limite |
| `itens[].diarias` | inteiro ou nulo | Número de diárias considerado (RN-012). Só preenchido em hospedagem que chegou à etapa de limite; nulo nos demais casos |
| `resumo.quantidade_itens` | inteiro | Total de despesas na entrada |
| `resumo.aprovados` / `parciais` / `recusados` | inteiro | Contagem por status |
| `resumo.total_solicitado` | número | Soma de `valor_solicitado` dos itens com valor **positivo** (nulo não entra) |
| `resumo.total_reembolsavel` | número | Soma de `valor_reembolsavel` de todos os itens |
| `resumo.total_nao_reembolsado` | número | `total_solicitado − total_reembolsavel` |

Todo valor monetário da saída é um número em reais com no máximo duas casas
decimais.

Num item recusado com `DADO_INVALIDO`, os campos de eco (`id`, `data`,
`categoria`) saem **exatamente como vieram**, inclusive nulos, vazios ou de
outro tipo (um campo ausente sai nulo). Assim a própria saída mostra o dado
que causou a recusa. O `valor_solicitado` é o valor arredondado quando o
`valor` é numérico (a recusa veio de outro campo) e nulo quando não é (AMB-023).

O mesmo `id` pode aparecer em mais de um item da saída quando uma despesa
`DADO_INVALIDO` é seguida pela sua correção, com o mesmo `id` (AMB-025).

**Códigos de motivo** (exatamente um por item, o da primeira regra que decidiu
o item, conforme a seção 8):

| Código | Status resultante | Regra |
|---|---|---|
| `APROVADO_INTEGRAL` | APROVADO | RN-009 |
| `LIMITE_DIARIO_EXCEDIDO` | PARCIAL | RN-010 |
| `LIMITE_DIARIO_ESGOTADO` | RECUSADO | RN-010 |
| `DADO_INVALIDO` | RECUSADO | RN-003 |
| `VALOR_NAO_POSITIVO` | RECUSADO | RN-004 |
| `FORA_DO_PERIODO` | RECUSADO | RN-005 |
| `CATEGORIA_NAO_REEMBOLSAVEL` | RECUSADO | RN-006 |
| `DUPLICATA` | RECUSADO | RN-007 |
| `NOTA_FISCAL_AUSENTE` | RECUSADO | RN-008 |

**Exemplo** (período 2026-07-01 a 2026-07-31, sem viagem):

Entrada (só `despesas`):

```json
[
  {"id": "a", "data": "2026-07-03", "categoria": "alimentacao", "fornecedor": "X", "valor": 45.00, "tem_nota_fiscal": true},
  {"id": "b", "data": "2026-07-03", "categoria": "Alimentacao", "fornecedor": "Y", "valor": 30.00, "tem_nota_fiscal": true},
  {"id": "c", "data": "2026-07-04", "categoria": "coworking",   "fornecedor": "Z", "valor": 89.00, "tem_nota_fiscal": true}
]
```

Saída:

```json
{
  "colaborador": {"id": "c-0001"},
  "periodo": {"inicio": "2026-07-01", "fim": "2026-07-31"},
  "itens": [
    {"id": "a", "data": "2026-07-03", "categoria": "alimentacao", "valor_solicitado": 45.00,
     "valor_reembolsavel": 45.00, "status": "APROVADO", "limite_diario_aplicado": 60.00, "em_viagem": false, "diarias": null,
     "motivo": {"codigo": "APROVADO_INTEGRAL", "descricao": "Dentro do limite diário de alimentação (R$ 60,00); saldo do dia após este item: R$ 15,00."}},
    {"id": "b", "data": "2026-07-03", "categoria": "alimentacao", "valor_solicitado": 30.00,
     "valor_reembolsavel": 15.00, "status": "PARCIAL", "limite_diario_aplicado": 60.00, "em_viagem": false, "diarias": null,
     "motivo": {"codigo": "LIMITE_DIARIO_EXCEDIDO", "descricao": "Limite diário de alimentação R$ 60,00 em 2026-07-03; saldo disponível R$ 15,00; excedente de R$ 15,00 não reembolsado."}},
    {"id": "c", "data": "2026-07-04", "categoria": "coworking", "valor_solicitado": 89.00,
     "valor_reembolsavel": 0.00, "status": "RECUSADO", "limite_diario_aplicado": null, "em_viagem": null, "diarias": null,
     "motivo": {"codigo": "CATEGORIA_NAO_REEMBOLSAVEL", "descricao": "Categoria 'coworking' não consta na política de reembolso."}}
  ],
  "resumo": {"quantidade_itens": 3, "aprovados": 1, "parciais": 1, "recusados": 1,
             "total_solicitado": 164.00, "total_reembolsavel": 60.00, "total_nao_reembolsado": 104.00}
}
```

O texto de `motivo.descricao` é orientativo. O que se verifica é o `codigo`, o
`status` e os valores.

## 5. Regras de negócio

Cada regra recebe um ID (`RN-001`, ...). As tasks vão referenciar esses IDs.

### RN-001 — Arredondamento de valores para centavos

**Regra:** Antes de qualquer outra regra, todo `valor` de entrada é arredondado
para duas casas decimais pelo arredondamento **meio para o par** (bancário):
fora do ponto médio, vai para o centavo mais próximo; exatamente no meio
(terceira casa 5 e nada depois), vai para o centavo **par**. Todas as
comparações e cálculos seguintes usam o valor arredondado e são exatos em
centavos, sem erro de representação.
**Origem:** ausente na política (AMB-013)
**Aceite:** `33.333` → `valor_solicitado` 33.33. `10.005` → 10.00.
`10.015` → 10.02. `33.345` → 33.34. `33.3451` → 33.35 (fora do meio).
`100.004` → 100.00 e não exige nota fiscal (RN-008).

### RN-002 — Normalização da categoria

**Regra:** A categoria é comparada sem diferenciar maiúsculas de minúsculas,
sem espaços nas bordas e sem acentos. As categorias reconhecidas são
`alimentacao`, `transporte_urbano` e `hospedagem`.
**Origem:** política do RH, item 9 (AMB-014)
**Aceite:** `"ALIMENTACAO"`, `" Alimentação "` e `"alimentacao"` são todas
tratadas como `alimentacao` e somam no mesmo limite diário.

### RN-003 — Validação dos dados do item

**Regra:** Uma despesa com `id`, `data`, `categoria` ou `valor` ausente, com
`data` que não é uma data de calendário válida no formato `AAAA-MM-DD`, com
`valor` não numérico, ou com `id` igual ao de uma despesa anterior no arquivo
**que passou por esta validação**, é **RECUSADA** com `DADO_INVALIDO`. As demais despesas continuam sendo
processadas normalmente. Uma despesa que não é um objeto (um número, um texto,
nulo) tem todos os campos ausentes e também é `DADO_INVALIDO`.

Para saber se o `id` repete, ele é comparado depois da mesma normalização da
categoria (RN-002): sem diferenciar maiúsculas de minúsculas, sem espaços nas
bordas e sem acentos. `"d-001"`, `" d-001 "` e `"D-001"` são o mesmo `id`
(AMB-024).

Só reserva o `id` a despesa que passou por esta validação. Uma despesa
recusada com `DADO_INVALIDO`, por qualquer motivo (inclusive o próprio `id`
repetido), não reserva, e a seguinte com o mesmo `id` é tratada como a
correção dela. Uma despesa recusada numa etapa posterior (período, categoria,
duplicata, nota fiscal) passou por esta validação e reserva o `id` (AMB-025).

`valor` é numérico quando é um número ou um texto que, sem os espaços das
bordas, tem sinal `-` opcional, um ou mais dígitos e, opcionalmente, **um**
separador decimal (ponto `.` ou vírgula `,`) seguido de um ou mais dígitos. O
texto é convertido para o número correspondente antes da RN-001. Qualquer
outro texto (vazio, com separador de milhar, com símbolo de moeda, com dois
separadores, com letras) e qualquer outro tipo (booleano, lista, objeto,
nulo) não são numéricos.

`id`, `data` e `categoria` que vêm vazios (texto vazio ou só com espaços),
nulos ou com tipo diferente de texto contam como **ausentes** →
`DADO_INVALIDO`.

`tem_nota_fiscal` só aceita os booleanos `true` e `false`. Vazio (campo
ausente, nulo, ou texto vazio ou só com espaços) vale `false`. Qualquer outro
valor (textos como `"true"` ou `"sim"`, números como `1` ou `0`, listas,
objetos) é `DADO_INVALIDO`.
**Origem:** ausente na política (AMB-018, AMB-021, AMB-022, AMB-023, AMB-024, AMB-025)
**Aceite:** uma despesa com `"data": "2026-07-32"` sai RECUSADO/`DADO_INVALIDO`
com `data` `"2026-07-32"` na saída, e as outras despesas do arquivo têm o
resultado de sempre. `"valor": "R$ 45,00"` sai com `valor_solicitado` nulo.
Uma despesa `"id": "D-001"` depois de uma `"id": "d-001"` →
RECUSADO/`DADO_INVALIDO`. `"d-001"` com `"data": "2026-07-32"`, depois
`"d-001"` válido e depois outro `"d-001"` válido → a 1ª RECUSADO/`DADO_INVALIDO`,
a 2ª segue normalmente e a 3ª RECUSADO/`DADO_INVALIDO`. `"45.00"`,
`"45,00"` e `45.00` dão o mesmo resultado (`valor_solicitado` 45,00).
`"1.234,56"` e `"R$ 45,00"` → RECUSADO/`DADO_INVALIDO`.
`"tem_nota_fiscal": "sim"` → RECUSADO/`DADO_INVALIDO`.
`"tem_nota_fiscal": null` vale `false`.
`"categoria": ""` e `"categoria": 123` → RECUSADO/`DADO_INVALIDO`, e não
`CATEGORIA_NAO_REEMBOLSAVEL`.

### RN-004 — Valores não positivos

**Regra:** Uma despesa com `valor_solicitado` ≤ 0,00 (estorno, cancelamento,
zero) é **RECUSADA** com `VALOR_NAO_POSITIVO`, não abate nenhuma outra despesa
e não entra em `total_solicitado`.
**Origem:** ausente na política (AMB-012)
**Aceite:** `d-009` (−45,00) → RECUSADO/`VALOR_NAO_POSITIVO`, reembolsável 0,00.
As despesas de transporte de 2026-07-11 não são afetadas.

### RN-005 — Período de competência

**Regra:** Só é elegível a despesa cuja `data` está entre `periodo.inicio` e
`periodo.fim`, **inclusive nos dois extremos**. Fora disso é **RECUSADA** com
`FORA_DO_PERIODO`.
**Origem:** política do RH, item 7 (AMB-009, AMB-010)
**Aceite:** `d-008` (2026-04-15, período de julho) → RECUSADO/`FORA_DO_PERIODO`.
`d-014` (2026-07-31 = `fim`) é elegível.

### RN-006 — Categorias reembolsáveis

**Regra:** Só as categorias `alimentacao`, `transporte_urbano` e `hospedagem`
(depois da RN-002) são reembolsáveis. Qualquer outra é **RECUSADA**
integralmente com `CATEGORIA_NAO_REEMBOLSAVEL`.
**Origem:** política do RH, item 9 (AMB-019)
**Aceite:** `d-005` (`coworking`, 89,00) → RECUSADO/`CATEGORIA_NAO_REEMBOLSAVEL`.

### RN-007 — Duplicatas

**Regra:** Duas despesas são duplicatas quando têm a mesma `data`, a mesma
categoria normalizada, o mesmo `fornecedor` (comparado sem diferenciar
maiúsculas de minúsculas e sem espaços nas bordas) e o mesmo
`valor_solicitado`, com `id` diferente. `fornecedor` ausente ou só com espaços
vale como fornecedor **vazio**, que é comparado como qualquer outro valor:
vazio é igual a vazio, e um fornecedor preenchido nunca é igual a vazio.
`descricao` e `tem_nota_fiscal` não entram no critério.
Num grupo de duplicatas, **só a primeira ocorrência na ordem da entrada**
segue para as próximas regras. As demais são **RECUSADAS** com `DUPLICATA`. A
descrição do motivo cita o `id` da ocorrência aceita e não pressupõe má-fé.
**Origem:** política do RH, item 8 (AMB-011)
**Aceite:** `d-006` e `d-007` (2026-07-09, alimentação, Bistro Central, 54,90):
`d-006` segue normalmente (APROVADO 54,90) e `d-007` → RECUSADO/`DUPLICATA`.
Duas despesas de alimentação de 40,00 na mesma data, as duas sem fornecedor →
a 2ª RECUSADO/`DUPLICATA`. Se só uma delas tiver fornecedor, as duas seguem
normalmente.

### RN-008 — Nota fiscal obrigatória

**Regra:** Uma despesa com `valor_solicitado` **estritamente maior** que
R$ 100,00 e sem nota fiscal é **RECUSADA integralmente** com
`NOTA_FISCAL_AUSENTE`. O limiar vale por despesa individual, usa o valor
solicitado (não o reembolsável) e não é ampliado pela viagem.
**Origem:** política do RH, item 5 (AMB-004, AMB-005, AMB-006, AMB-017)
**Aceite:** `d-003` (100,00, sem NF) **não** é recusado por nota fiscal.
`d-004` (100,01, sem NF) → RECUSADO/`NOTA_FISCAL_AUSENTE`.
`d-013` (690,00, sem NF) → RECUSADO/`NOTA_FISCAL_AUSENTE`.

### RN-009 — Limites diários por categoria

**Regra:** Para cada combinação (data, categoria), a soma dos valores
reembolsáveis não passa de:

| Categoria | Limite padrão | Limite em viagem (RN-011) |
|---|---|---|
| `alimentacao` | R$ 60,00 por dia | R$ 90,00 por dia |
| `transporte_urbano` | R$ 80,00 por dia | R$ 120,00 por dia |
| `hospedagem` | R$ 250,00 por noite (as diárias são distribuídas por noite, ver RN-012) | R$ 250,00 por noite, sem ampliação (AMB-020) |

O limite é inclusivo: uma despesa que usa exatamente o saldo restante é
`APROVADO_INTEGRAL`. O "dia" é a data de calendário da despesa, sem distinção
entre dia útil, fim de semana ou feriado. Só despesas que passaram por todas as
regras anteriores (seção 8) consomem limite.
**Origem:** política do RH, itens 1, 2 e 3 (AMB-001, AMB-008, AMB-015, AMB-016)
**Aceite:** uma despesa isolada de alimentação de 60,00 → APROVADO 60,00.
`d-012` (sábado, 47,20) → APROVADO 47,20.

### RN-010 — Reembolso parcial e distribuição do limite no dia

**Regra:** Dentro de cada (data, categoria), as despesas elegíveis consomem o
limite **na ordem em que aparecem na entrada**. Cada uma recebe
`min(valor_solicitado, saldo_restante)`:
- recebe tudo → APROVADO/`APROVADO_INTEGRAL`;
- recebe parte (> 0) → PARCIAL/`LIMITE_DIARIO_EXCEDIDO`, o excedente é cortado;
- saldo já zerado → RECUSADO/`LIMITE_DIARIO_ESGOTADO`.
**Origem:** política do RH, item 4 (AMB-002, AMB-003)
**Aceite:** `d-001` (72,50) e `d-002` (38,00) em 2026-07-03: `d-001` → PARCIAL
60,00 e `d-002` → RECUSADO/`LIMITE_DIARIO_ESGOTADO` 0,00. `d-014` (61,00) →
PARCIAL 60,00.

### RN-011 — Colaborador em viagem

**Regra:** Uma data é **dia de viagem** quando é uma das noites (D, D+1, …,
D+N−1, ver RN-012) de ao menos uma despesa de hospedagem **elegível**, ou
seja, que passou pelas etapas 2 a 7 da seção 8. O dia do check-out (D+N) não é
dia de viagem. Nos dias de viagem, os limites de alimentação e transporte
urbano são multiplicados por 1,5 (coluna "em viagem" da RN-009). O limite de
hospedagem **não** é ampliado e continua R$ 250,00 por noite (AMB-020). Uma
hospedagem recusada (sem nota, duplicada, fora do período...) não torna a data
dia de viagem.
**Origem:** política do RH, item 6 (AMB-007)
**Aceite:** alimentação de 80,00 na mesma data de uma hospedagem elegível →
APROVADO 80,00 (limite 90,00). Hospedagem de 1 diária em D e alimentação de
80,00 em D+1 (check-out) → PARCIAL 60,00. Hospedagem de 2 diárias em D e
alimentação de 80,00 em D+1 → APROVADO 80,00. `d-013` (3 noites) é recusada por
nota fiscal, então 2026-07-22 a 2026-07-24 **não** são dias de viagem.

### RN-012 — Hospedagem com mais de uma diária

**Regra:** O número de diárias `N` de uma despesa de hospedagem é o número
inteiro da **primeira ocorrência**, na `descricao`, de um inteiro seguido (com
ou sem espaço) de uma das palavras `diaria`, `diarias`, `noite` ou `noites`.
Números que aparecem antes dessa ocorrência sem ser seguidos de uma dessas
palavras são ignorados. Número **fracionário** (dígitos, separador `.` ou `,`
e mais dígitos, como `1.5` ou `1,5`) também é ignorado, mesmo seguido de
diária/noite, e nenhum pedaço dele conta como inteiro. A comparação não diferencia
maiúsculas de minúsculas nem acentos, então "diária" e "Diárias" também
contam. Se não houver esse padrão, ou se `N` = 0, vale `N` = 1.

Uma hospedagem com data D e N diárias ocupa as noites **D, D+1, …, D+N−1**. O
valor é **dividido igualmente entre as noites**, em centavos. Quando a divisão
não é exata, os centavos que sobram vão um a um para as primeiras noites. Cada
parcela entra no limite diário de hospedagem **da data daquela noite** (RN-009)
como se fosse uma despesa daquela data. Assim, hospedagens diferentes que
caem na mesma noite dividem o mesmo limite, consumido na ordem da entrada
(RN-010). O reembolsável da despesa é a soma do que cada parcela recebeu, e o
status sai dessa soma (APROVADO / PARCIAL / RECUSADO por limite esgotado).
Noites fora do período contam normalmente, porque a elegibilidade (RN-005) é
decidida pela data da despesa.
**Origem:** política do RH, item 3 (AMB-008)
**Aceite:** "Hotel Rio - 2 diarias" → N = 2. "Airbnb 3 noites" → N = 3.
"Hotel 5 estrelas" → N = 1 (5 não vem seguido de diária/noite).
"Hotel 5 estrelas - 2 diarias" → N = 2. "Hotel 1.5 diarias" → N = 1
(e não 5). "Pousada" → N = 1. `d-010` (480,00, N = 2) → 240,00 na noite de 14/07 e
240,00 na de 15/07 → APROVADO 480,00. Exemplo de sobreposição, com
`h1` = 14/07 "2 diarias" 480,00 e depois `h2` = 15/07 "1 diaria" 200,00:
`h1` → 240 + 240 = APROVADO 480,00; `h2` → só restam 10,00 na noite de 15/07
→ PARCIAL 10,00.

### RN-013 — Justificativa obrigatória

**Regra:** Todo item da saída tem exatamente um `motivo.codigo` da tabela da
seção 4 e uma `motivo.descricao` não vazia. Quando o motivo é de limite, a
descrição informa o limite aplicado, o saldo disponível e o valor cortado.
**Origem:** objetivo do sistema ("justifica cada decisão")
**Aceite:** nenhum item da saída do arquivo de exemplo tem motivo ausente ou vazio.

### RN-014 — Totais do resumo

**Regra:** `resumo` é calculado conforme a seção 4, e
`total_nao_reembolsado = total_solicitado − total_reembolsavel`, exato em
centavos.
**Origem:** objetivo do sistema
**Aceite:** a soma de `valor_reembolsavel` dos itens é igual a
`resumo.total_reembolsavel`, e as contagens por status somam
`quantidade_itens`.

### RN-015 — Arquivo de entrada inválido

**Regra:** Se o arquivo de entrada não existe, não é JSON válido ou não tem
`colaborador.id`, `periodo.inicio`, `periodo.fim` (datas válidas, com
`inicio` ≤ `fim`) ou a lista `despesas`, a execução termina **com indicação de
erro**, com mensagem que aponta o problema, e **nenhum arquivo de saída é
gerado**.
**Origem:** interface fixa do desafio
**Aceite:** executar com um arquivo sem `periodo` resulta em erro, mensagem que
cita `periodo` e nenhum arquivo de saída.

---

## 6. Ambiguidades identificadas e decisões

> **Esta seção é o coração da spec e vale a maior parte dos 25 pontos do critério 1.**
> Uma ambiguidade que você resolveu no código sem registrar aqui conta como
> não resolvida.

### AMB-001 — Limite por dia ou por despesa?

**Texto original do RH:** "Alimentação tem limite de R$ 60 por dia."
**O que não está claro:** (a) cada despesa pode ir até R$ 60, ou (b) a soma do
dia não pode passar de R$ 60? E a soma é por categoria ou de todas as categorias
juntas?
**Decisão:** soma por **(data, categoria)**. Cada categoria tem seu próprio
limite diário, independente das outras.
**Justificativa:** "por dia" é unidade de tempo, não de item. Ler por despesa
deixaria reembolsar R$ 60 em cada um de vários almoços no mesmo dia.
**Regra afetada:** RN-009

### AMB-002 — Como dividir o limite do dia entre várias despesas

**Texto original do RH:** "limite de R$ 60 por dia" + "reembolsadas parcialmente"
**O que não está claro:** quando várias despesas do mesmo dia passam do limite
juntas (`d-001` + `d-002` = 110,50), qual delas é cortada? (a) na ordem de
lançamento; (b) proporcionalmente; (c) primeiro a mais barata ou a mais cara.
**Decisão:** o limite é consumido **na ordem em que as despesas aparecem na
entrada**. A primeira despesa pega o que cabe e a seguinte pega o saldo.
**Justificativa:** o resultado é determinístico e explicável item a item. O
rateio proporcional espalha centavos de arredondamento por vários itens e
deixa a justificativa mais difícil de auditar.
**Regra afetada:** RN-010

### AMB-003 — O que é "reembolsada parcialmente"

**Texto original do RH:** "Despesas acima do limite são reembolsadas parcialmente."
**O que não está claro:** (a) paga até o limite e corta o excedente; (b) paga
uma fração fixa do valor; (c) recusa o item inteiro.
**Decisão:** (a) paga até o saldo do limite e corta só o excedente.
**Justificativa:** é a leitura literal de "parcialmente" que não pune o
colaborador por mais do que o excesso.
**Regra afetada:** RN-010

### AMB-004 — "Acima de R$ 100": o limiar é inclusivo?

**Texto original do RH:** "Nota fiscal é obrigatória acima de R$ 100."
**O que não está claro:** uma despesa de exatamente R$ 100,00 exige nota?
**Decisão:** não. Só valores **estritamente maiores** que R$ 100,00 exigem
nota (100,00 não exige, 100,01 exige).
**Justificativa:** "acima de" em português é comparação estrita.
**Regra afetada:** RN-008

### AMB-005 — O limiar de nota fiscal vale sobre qual valor?

**Texto original do RH:** "Nota fiscal é obrigatória acima de R$ 100."
**O que não está claro:** (a) valor solicitado da despesa; (b) valor
reembolsável depois do limite; (c) soma do dia.
**Decisão:** (a) o valor solicitado de cada despesa individual (depois do
arredondamento da RN-001).
**Justificativa:** a nota comprova o gasto que foi feito, não a parte que a
empresa aceita pagar.
**Regra afetada:** RN-008

### AMB-006 — Consequência da falta de nota fiscal

**Texto original do RH:** "Nota fiscal é obrigatória acima de R$ 100."
**O que não está claro:** sem a nota, (a) recusa o item todo; (b) reembolsa
até R$ 100,00; (c) aceita e sinaliza.
**Decisão:** (a) recusa integral com `NOTA_FISCAL_AUSENTE`.
**Justificativa:** "obrigatória" é condição de elegibilidade. Pagar R$ 100 sem
comprovante tornaria a obrigação inócua.
**Regra afetada:** RN-008

### AMB-007 — O que caracteriza "em viagem"

**Texto original do RH:** "Colaborador em viagem tem limites ampliados em 50%."
**O que não está claro:** a entrada não tem campo de viagem. Leituras
possíveis: (a) a regra fica inativa até o dado existir; (b) um dia é "em
viagem" se houver hospedagem naquela data; (c) o período inteiro é "em viagem"
se houver qualquer hospedagem.
**Decisão:** (b) é dia de viagem toda data coberta por uma noite de hospedagem
**elegível**, de D até D+N−1 (RN-011, RN-012). O dia do check-out não conta. O
limite da própria hospedagem não é ampliado (AMB-020).
**Justificativa:** ainda não existe um indicador exclusivo de viagem, e ter
uma noite de hospedagem naquela data é o sinal explícito mais objetivo
disponível. As noites seguintes à primeira contam porque o colaborador
continua fora de casa. A regra é
declarada, não adivinhada, e deve ser trocada pelo indicador quando ele
existir. Hospedagem recusada não conta porque um gasto que não foi comprovado
não deve ampliar outros limites.
**Regra afetada:** RN-011, RN-009

### AMB-008 — Hospedagem: "por diária" quando a despesa cobre várias noites

**Texto original do RH:** "Hospedagem tem limite de R$ 250 por diária."
**O que não está claro:** `d-010` ("Hotel Rio - 2 diarias", 480,00) e `d-013`
("Airbnb 3 noites", 690,00) cobrem várias noites numa só despesa, mas a
entrada não tem campo com o número de noites. O limite é 250 × 1 ou 250 × N?
**Decisão:** 250 × N, com N extraído de `descricao` pelo padrão fechado da
RN-012 ("<inteiro> diária(s)/noite(s)"). Vale a primeira ocorrência do padrão
completo, e números soltos antes dela são ignorados. Número fracionário
("1.5 diarias") não conta. Sem esse padrão, N = 1. O valor é
dividido igualmente entre as noites D…D+N−1, e cada noite disputa o limite de
R$ 250 daquela data com as outras hospedagens que caem na mesma noite.
**Justificativa:** limitar a uma diária uma estadia de várias noites paga numa
cobrança só puniria o colaborador pela forma de pagamento. O padrão é fechado
para não confundir outros números da descrição ("5 estrelas") com diárias.
Dividir por noite, em vez de lançar tudo na data D, impede que duas
hospedagens cobrindo a mesma noite sejam pagas integralmente. A divisão
igualitária é usada porque a entrada não traz o valor de cada noite. Essa
decisão abre uma exceção à regra de não interpretar texto livre (seção 3).
**Regra afetada:** RN-012, RN-009

### AMB-009 — "Lançadas dentro do período de competência"

**Texto original do RH:** "Despesas devem ser lançadas dentro do período de competência."
**O que não está claro:** "lançada" sugere data de lançamento, que não existe
na entrada. Também não se diz o que acontece com despesa fora do período:
recusa, adia para outro período ou aceita com alerta.
**Decisão:** vale a **data da despesa**, que precisa estar entre
`periodo.inicio` e `periodo.fim`, inclusive. Fora disso a despesa é recusada
com `FORA_DO_PERIODO` e não é guardada para outro período.
**Justificativa:** a data da despesa é o único dado temporal disponível.
Aceitar despesa atrasada (`d-008`, de abril) contrariaria o propósito da regra.
**Regra afetada:** RN-005

### AMB-010 — `competencia` vs. `inicio`/`fim`

**Texto original do RH:** "período de competência"
**O que não está claro:** a entrada traz `competencia` ("2026-07") e também
`inicio`/`fim`. Se os dois discordarem, qual vale?
**Decisão:** valem `inicio` e `fim`. `competencia` é só ecoada.
**Justificativa:** as datas explícitas são mais precisas que o mês e
comportam períodos que não coincidem com o mês civil.
**Regra afetada:** RN-005

### AMB-011 — "Duplicatas devem ser tratadas"

**Texto original do RH:** "Duplicatas devem ser tratadas."
**O que não está claro:** (1) o que é uma duplicata; (2) como ela é tratada.
**Decisão:** (1) critério: mesma data, categoria normalizada, fornecedor e
valor, com `id` diferente. Fornecedor ausente vale como vazio, e vazio só é
igual a vazio (RN-007). (2) Só a primeira ocorrência na ordem da
entrada segue. As demais são recusadas com `DUPLICATA`, sem nenhuma marcação
de suspeita de fraude.
**Justificativa:** erros de cadastro acontecem, então nesta etapa não se
presume má-fé. Paga-se o gasto real uma vez e a cópia é descartada. `id`
diferente não prova que a despesa é outra, porque o mesmo gasto lançado duas
vezes recebe dois ids. A descrição fica fora do critério porque é texto livre e
varia à toa. Fornecedor vazio é tratado literalmente como vazio: duas
despesas sem fornecedor e com o resto igual são indistinguíveis. Já uma
despesa sem fornecedor não tem dado suficiente para ser declarada cópia de
uma que tem fornecedor. Assim a relação de duplicata é transitiva, e o grupo
de duplicatas não depende da ordem de comparação.
**Regra afetada:** RN-007

### AMB-012 — Valores negativos (estorno) e zero

**Texto original do RH:** a política não fala do assunto.
**O que não está claro:** `d-009` (−45,00, "estorno de corrida cancelada"):
(a) abate outras despesas do dia ou do período; (b) é ignorado; (c) é erro.
**Decisão:** recusado com `VALOR_NAO_POSITIVO`, não abate nada e fica fora de
`total_solicitado`.
**Justificativa:** reembolso é pagamento ao colaborador. Um estorno sem a
despesa original correspondente na entrada não tem o que abater com
segurança.
**Regra afetada:** RN-004

### AMB-013 — Valores com mais de duas casas decimais

**Texto original do RH:** a política não fala do assunto.
**O que não está claro:** `d-011` vale 33,333. (a) arredonda; (b) trunca;
(c) recusa como dado inválido. Em que momento, e com que regra de desempate?
**Decisão:** arredonda para centavos, **meio para o par** (bancário),
**antes** de qualquer outra regra (RN-001).
**Justificativa:** dinheiro só existe em centavos. Arredondar antes garante que
todas as comparações (limite, nota fiscal) usem o mesmo valor que é exibido.
O desempate meio para o par foi escolhido pelo usuário: o tamanho real dos
arquivos é desconhecido, e subir sempre no meio acumula viés para cima em
volume; alternando, o viés se anula. O custo aceito é que casos no ponto
médio parecem menos intuitivos ao conferir à mão (33,325 → 33,32, mas
33,335 → 33,34).
**Regra afetada:** RN-001

### AMB-014 — Grafia da categoria

**Texto original do RH:** "Categorias fora da política não são reembolsáveis."
**O que não está claro:** `d-014` tem categoria `"ALIMENTACAO"`. Uma grafia
diferente é "categoria fora da política"?
**Decisão:** não. A categoria é normalizada (maiúsculas/minúsculas, espaços
nas bordas, acentos) antes da comparação (RN-002).
**Justificativa:** diferença de grafia é problema de digitação, não de
natureza da despesa.
**Regra afetada:** RN-002

### AMB-015 — Fronteira do limite diário

**Texto original do RH:** "limite de R$ 60 por dia"
**O que não está claro:** gastar exatamente R$ 60,00 está dentro ou acima do
limite?
**Decisão:** dentro. O limite é o máximo reembolsável, inclusive.
**Justificativa:** "limite de X" define o teto permitido, e X faz parte do
permitido.
**Regra afetada:** RN-009

### AMB-016 — Fins de semana e feriados

**Texto original do RH:** "por dia"
**O que não está claro:** `d-012` é um almoço de sábado ("plantão"). "Dia" é
dia útil ou dia corrido? Despesa de fim de semana é elegível?
**Decisão:** dia de calendário, sem distinção entre dia útil, fim de semana e
feriado. A despesa é elegível normalmente.
**Justificativa:** a política não restringe dias da semana, e trabalho em
plantão é legítimo.
**Regra afetada:** RN-009

### AMB-017 — A ampliação de viagem vale para o limiar de nota fiscal?

**Texto original do RH:** "Colaborador em viagem tem limites ampliados em 50%."
**O que não está claro:** "limites" inclui o limiar de R$ 100 da nota fiscal?
**Decisão:** não. A ampliação vale só para os limites de valor por categoria
(itens 1 a 3). O limiar de nota fiscal continua R$ 100,00.
**Justificativa:** o limiar de nota é regra de comprovação, não de quanto pagar.
Estar em viagem não reduz a necessidade de comprovante.
**Regra afetada:** RN-008, RN-011

### AMB-018 — Dados ausentes ou inválidos numa despesa

**Texto original do RH:** a política não fala do assunto.
**O que não está claro:** uma despesa sem valor, com data inválida ou com id
repetido invalida o arquivo inteiro ou só aquele item? E `tem_nota_fiscal`
ausente?
**Decisão:** só o item é recusado (`DADO_INVALIDO`). Obrigatório vazio, nulo
ou de tipo errado conta como ausente. `tem_nota_fiscal` ausente equivale a
"sem nota" (ver AMB-022). Erro estrutural do arquivo interrompe a execução
(RN-015).
**Justificativa:** um item mal preenchido não deve bloquear o reembolso das
outras despesas. Um campo obrigatório vazio não permite calcular a despesa
corretamente, igual a um ausente. Recusar como `CATEGORIA_NAO_REEMBOLSAVEL`
daria a entender que existe uma categoria. O ônus de comprovar a nota é de
quem pede.
**Regra afetada:** RN-003, RN-008, RN-015

### AMB-019 — Categoria fora da política: recusa total ou parcial?

**Texto original do RH:** "Categorias fora da política não são reembolsáveis."
**O que não está claro:** `d-005` (`coworking`) poderia ser reclassificado
numa categoria parecida, reembolsado com algum teto genérico ou recusado.
**Decisão:** recusa integral. O sistema não reclassifica categorias.
**Justificativa:** reclassificar exigiria interpretar a despesa, e isso é
decisão humana fora do escopo (seção 3).
**Regra afetada:** RN-006

### AMB-020 — A ampliação de viagem vale para o limite da própria hospedagem?

**Texto original do RH:** "Colaborador em viagem tem limites ampliados em 50%."
**O que não está claro:** "limites" inclui o limite de hospedagem? Pela
AMB-007, toda noite de hospedagem elegível já é dia de viagem. Se a hospedagem
fosse ampliada, o limite de R$ 250 do item 3 nunca seria aplicado.
**Decisão:** não. A ampliação de 50% vale só para alimentação e transporte
urbano. A hospedagem fica sempre em R$ 250,00 por noite.
**Justificativa:** como a viagem é inferida pela própria hospedagem, ampliar a
hospedagem anularia o item 3 da política. Entre as duas leituras, fica a que
mantém todos os itens da política com efeito.
**Regra afetada:** RN-009, RN-011

### AMB-021 — `valor` escrito como texto

**Texto original do RH:** a política não fala do assunto.
**O que não está claro:** a RN-003 recusa "valor não numérico", mas um texto
como `"45.00"` ou `"45,00"` pode ou não ser considerado numérico: (a) só o tipo
número é aceito; (b) texto com ponto decimal é aceito; (c) texto com ponto ou
vírgula decimal é aceito.
**Decisão:** (c). Número e texto com ponto ou vírgula decimal são aceitos, no
formato fechado da RN-003. Texto com separador de milhar, símbolo de moeda ou
mais de um separador é `DADO_INVALIDO`.
**Justificativa:** não se sabe quem gera o arquivo de entrada, e recusar
`"45,00"` puniria o colaborador por um detalhe de formatação. O separador de
milhar fica de fora porque `"1.234"` não tem leitura única (1234 ou 1,234), e
ambiguidade em valor monetário não pode ser resolvida por adivinhação.
**Regra afetada:** RN-003

### AMB-022 — `tem_nota_fiscal` com valor não booleano

**Texto original do RH:** a política não fala do assunto.
**O que não está claro:** a entrada pode trazer `"true"`, `"sim"`, `1` ou
`null` em vez de um booleano. Leituras possíveis: (a) só `true` é "tem nota" e
o resto vale "sem nota"; (b) aceitar um conjunto de textos e números
afirmativos; (c) aceitar só booleano e recusar o resto.
**Decisão:** (c), com uma exceção para o vazio: campo ausente, nulo, ou texto
vazio ou só com espaços vale `false`. Qualquer outro valor não booleano é
`DADO_INVALIDO`.
**Justificativa:** a nota fiscal decide se uma despesa acima de R$ 100,00 é
paga. Um valor fora do padrão não deve virar "sem nota" em silêncio (isso
recusaria uma despesa legítima com o motivo errado), nem "tem nota" por
adivinhação. O vazio segue a AMB-018: o ônus de informar a nota é de quem
pede. Diferente do `valor` (AMB-021), aqui não há texto afirmativo com
leitura única, então nenhum texto é aceito.
**Regra afetada:** RN-003, RN-008

### AMB-023 — O que a saída mostra num item com dado inválido

**Texto original do RH:** a política não fala do assunto.
**O que não está claro:** a saída tem um item por despesa, com
`valor_solicitado` numérico. Numa despesa `DADO_INVALIDO` com `valor`
ausente ou não numérico (`"R$ 45,00"`), não há valor para arredondar. E
`id`, `data` ou `categoria` inválidos (nulos, vazios, `123`): (a) saem
normalizados ou convertidos; (b) saem vazios; (c) saem como vieram.
**Decisão:** `valor_solicitado` sai **nulo** quando o `valor` não é numérico.
`id`, `data` e `categoria` saem **exatamente como vieram**, e um campo
ausente sai nulo. Um item com `valor_solicitado` nulo não entra em
`total_solicitado`.
**Justificativa:** nas palavras do usuário, é "para ficar claro na saída o
motivo de recusa". Mostrar 0,00 daria a entender que existe um valor real, e
converter o dado esconderia o erro de quem gerou o arquivo.
**Regra afetada:** RN-003, RN-014

### AMB-024 — Quando dois `id` são o mesmo

**Texto original do RH:** a política não fala do assunto.
**O que não está claro:** a RN-003 recusa `id` repetido. `"d-001"`,
`" d-001 "` e `"D-001"` são o mesmo `id`? (a) só texto idêntico; (b) sem
espaços nas bordas; (c) com a normalização da categoria.
**Decisão:** (c). O `id` é comparado sem diferenciar maiúsculas de
minúsculas, sem espaços nas bordas e sem acentos (como a RN-002). Na saída,
o `id` sai como veio.
**Justificativa:** decisão do usuário, pelo mesmo motivo da AMB-014: grafia
diferente é problema de digitação, e dois ids que só diferem na grafia
provavelmente são o mesmo lançamento.
**Regra afetada:** RN-003

### AMB-025 — `id` repetido depois de uma despesa com dado inválido

**Texto original do RH:** a política não fala do assunto.
**O que não está claro:** a RN-003 recusa o `id` "igual ao de uma despesa
anterior no arquivo", sem dizer se conta uma despesa anterior que já foi
recusada. Leituras possíveis: (a) toda despesa anterior reserva o `id`;
(b) só a que passou pela validação da RN-003 reserva; (c) só a que foi
reembolsada, total ou parcialmente, reserva.
**Decisão:** (b). Uma despesa recusada com `DADO_INVALIDO`, por qualquer
motivo (inclusive o próprio `id` repetido), não reserva o `id`, e a seguinte
com o mesmo `id` é tratada como a correção dela e segue normalmente. Uma
despesa recusada numa etapa posterior (período, categoria, duplicata, nota
fiscal) reserva o `id`. As duas despesas aparecem na saída, cada uma com seu
resultado, então o mesmo `id` pode aparecer em mais de um item.
**Justificativa:** decisão do usuário. Uma despesa com dado inválido seguida de
outra completa com o mesmo `id` é, com toda probabilidade, uma tentativa de
corrigir o lançamento. Recusar a correção puniria o colaborador duas vezes pelo
mesmo erro de preenchimento. Já uma despesa recusada depois da validação tinha
dados completos, e repetir o `id` dela não é correção de dado: é outro
lançamento com identificador repetido. A leitura (c) foi descartada porque
deixaria reusar o `id` de uma despesa recusada por período ou nota fiscal.
**Regra afetada:** RN-003

---

## 7. Casos de borda

| Caso | Entrada | Comportamento esperado | Regra |
|---|---|---|---|
| Nota fiscal no limiar exato | transporte 100,00, sem NF | não exige NF. Segue para o limite: PARCIAL 80,00 | RN-008, RN-010 |
| Um centavo acima do limiar | transporte 100,01, sem NF | RECUSADO `NOTA_FISCAL_AUSENTE` | RN-008 |
| Arredondamento que cruza o limiar | valor 100,004, sem NF | vira 100,00, não exige NF | RN-001, RN-008 |
| Arredondamento meio-para-o-par no limiar | valor 100,005, sem NF | vira 100,00 (0 é par), não exige NF | RN-001, RN-008 |
| Meio-para-o-par sobe | valor 100,015, sem NF | vira 100,02 (2 é par), RECUSADO `NOTA_FISCAL_AUSENTE` | RN-001, RN-008 |
| Fora do ponto médio | valor 100,0051, sem NF | vira 100,01, RECUSADO `NOTA_FISCAL_AUSENTE` | RN-001, RN-008 |
| Três casas decimais | 33,333 | `valor_solicitado` 33,33 | RN-001 |
| Exatamente no limite diário | alimentação 60,00 isolada | APROVADO 60,00 | RN-009 |
| Um centavo acima do limite | alimentação 60,01 isolada | PARCIAL 60,00 | RN-010 |
| Várias no mesmo dia | 72,50 + 38,00 alimentação, mesma data | 1ª PARCIAL 60,00; 2ª RECUSADO `LIMITE_DIARIO_ESGOTADO` | RN-010 |
| Recusada não consome limite | 100,01 sem NF + 100,00 sem NF, transporte, mesma data | 100,01 RECUSADO por NF; 100,00 PARCIAL 80,00 | seção 8 |
| Mesmo dia, categorias diferentes | alimentação 60,00 + transporte 80,00 | ambos APROVADO (limites independentes) | RN-009 |
| Primeiro dia do período | data = `inicio` | elegível | RN-005 |
| Último dia do período | data = `fim` | elegível | RN-005 |
| Dia seguinte ao período | data = `fim` + 1 | RECUSADO `FORA_DO_PERIODO` | RN-005 |
| Estorno | valor −45,00 | RECUSADO `VALOR_NAO_POSITIVO`, fora do total solicitado | RN-004 |
| Valor zero | 0,00 | RECUSADO `VALOR_NAO_POSITIVO` | RN-004 |
| Categoria em maiúsculas | `"ALIMENTACAO"` | tratada como `alimentacao` | RN-002 |
| Categoria com acento | `"alimentação"` | tratada como `alimentacao` | RN-002 |
| Categoria desconhecida | `coworking` | RECUSADO `CATEGORIA_NAO_REEMBOLSAVEL` | RN-006 |
| Fim de semana | sábado, alimentação 47,20 | APROVADO 47,20 | RN-009 |
| Mesmo fornecedor, datas diferentes | Tavola em 03/07 e 31/07 | não são duplicatas | RN-007 |
| Duplicata com e sem NF | idênticas, só `tem_nota_fiscal` difere | continuam duplicatas; a 1ª segue, a 2ª RECUSADO `DUPLICATA` | RN-007 |
| Três cópias idênticas | mesmo data/categoria/fornecedor/valor ×3 | 1ª segue; 2ª e 3ª RECUSADO `DUPLICATA` | RN-007 |
| Fornecedor com grafia diferente | "Bistro Central" vs "bistro central " | são duplicatas | RN-007 |
| Fornecedores diferentes | mesma data/categoria/valor, "Tavola" vs "Porto" | não são duplicatas | RN-007 |
| Ambas sem fornecedor | mesma data/categoria/valor, `fornecedor` ausente nas duas | 1ª segue; 2ª RECUSADO `DUPLICATA` | RN-007 |
| Só uma com fornecedor | mesma data/categoria/valor, "Tavola" vs `fornecedor` ausente | não são duplicatas; as duas seguem | RN-007 |
| Fornecedor vazio | mesma data/categoria/valor, `""` vs `"   "` vs ausente | 1ª segue; 2ª e 3ª RECUSADO `DUPLICATA` | RN-007 |
| Diárias na descrição | hospedagem "Hotel Rio - 2 diarias", 480,00 | N = 2, limite 500,00 → APROVADO 480,00 | RN-012 |
| Diárias com acento e maiúscula | "3 Diárias" | N = 3 | RN-012 |
| Duas hospedagens na mesma noite | `h1` 14/07 "2 diarias" 480,00; depois `h2` 15/07 "1 diaria" 200,00 | `h1` APROVADO 480,00 (240 + 240); `h2` PARCIAL 10,00 | RN-012 |
| Diária média acima do limite | 14/07 "2 diarias" 600,00 | 300 + 300 → 250 + 250 → PARCIAL 500,00 | RN-012 |
| Divisão com centavos | 14/07 "3 diarias" 100,00 | parcelas 33,34 / 33,33 / 33,33 → APROVADO 100,00 | RN-012 |
| Noite fora do período | 31/07 (= `fim`) "2 diarias" 400,00 | noites 31/07 e 01/08 contam → APROVADO 400,00 | RN-012, RN-005 |
| Número que não é diária | "Hotel 5 estrelas", 300,00 | N = 1 → PARCIAL 250,00 | RN-012 |
| Descrição sem número | "Pousada", 300,00 | N = 1 → PARCIAL 250,00 | RN-012 |
| Zero diárias | "0 diarias", 100,00 | N = 1 → APROVADO 100,00 | RN-012 |
| Alimentação em dia de viagem | hospedagem elegível + alimentação 80,00, mesma data | alimentação APROVADO 80,00 (limite 90,00) | RN-011 |
| Transporte em dia de viagem | hospedagem elegível + transporte 130,00 com NF, mesma data | PARCIAL 120,00 | RN-011 |
| Dia do check-out | hospedagem de 1 diária em D; alimentação 80,00 em D+1 | PARCIAL 60,00 (não é dia de viagem) | RN-011 |
| Noite seguinte da estadia | hospedagem de 2 diárias em D; alimentação 80,00 em D+1 | APROVADO 80,00 (D+1 é dia de viagem) | RN-011, RN-012 |
| Hospedagem recusada não gera viagem | hospedagem 690,00 sem NF + alimentação 80,00, mesma data | hospedagem RECUSADO; alimentação PARCIAL 60,00 | RN-011 |
| Viagem não altera o limiar de NF | dia de viagem, transporte 110,00 sem NF | RECUSADO `NOTA_FISCAL_AUSENTE` | RN-008 |
| Data impossível | `2026-02-30` | RECUSADO `DADO_INVALIDO`, os outros itens seguem | RN-003 |
| `id` repetido | dois itens com `id` "d-001" | o segundo RECUSADO `DADO_INVALIDO` | RN-003 |
| `id` repetido com outra grafia | `"d-001"` e depois `" D-001 "` | o segundo RECUSADO `DADO_INVALIDO`, `id` sai `" D-001 "` | RN-003 |
| Correção de item inválido | `"d-001"` com data `2026-07-32`; depois `"d-001"` válido | 1º RECUSADO `DADO_INVALIDO`; 2º segue normalmente | RN-003 |
| `id` de item recusado depois da validação | `"d-001"` fora do período; depois `"d-001"` válido | 1º RECUSADO `FORA_DO_PERIODO`; 2º RECUSADO `DADO_INVALIDO` | RN-003 |
| Valor inválido na saída | `"valor": "R$ 45,00"` | RECUSADO `DADO_INVALIDO`, `valor_solicitado` nulo, fora do `total_solicitado` | RN-003, RN-014 |
| Eco de campo inválido | `"categoria": 123` | `categoria` sai `123` na saída | RN-003 |
| Despesa que não é objeto | um item `42` na lista `despesas` | RECUSADO `DADO_INVALIDO`, `id`/`data`/`categoria`/`valor_solicitado` nulos | RN-003 |
| Número solto antes das diárias | "Hotel 5 estrelas - 2 diarias", 480,00 | N = 2 → APROVADO 480,00 | RN-012 |
| Diárias fracionárias | "Hotel 1.5 diarias", 300,00 | fracionário ignorado, N = 1 → PARCIAL 250,00 | RN-012 |
| Categoria vazia | `"categoria": "  "` | RECUSADO `DADO_INVALIDO` (não `CATEGORIA_NAO_REEMBOLSAVEL`) | RN-003 |
| Categoria não textual | `"categoria": 123` | RECUSADO `DADO_INVALIDO` | RN-003 |
| `id` vazio | `"id": ""` | RECUSADO `DADO_INVALIDO` | RN-003 |
| `data` nula | `"data": null` | RECUSADO `DADO_INVALIDO` | RN-003 |
| Valor como texto com ponto | `"valor": "45.00"` | tratado como 45,00 | RN-003 |
| Valor como texto com vírgula | `"valor": "45,00"` | tratado como 45,00 | RN-003 |
| Valor texto com 3 casas | `"valor": "33,333"` | 33,333 → `valor_solicitado` 33,33 | RN-003, RN-001 |
| Valor texto negativo | `"valor": "-45,00"` | RECUSADO `VALOR_NAO_POSITIVO` | RN-003, RN-004 |
| Separador de milhar | `"valor": "1.234,56"` | RECUSADO `DADO_INVALIDO` | RN-003 |
| Símbolo de moeda | `"valor": "R$ 45,00"` | RECUSADO `DADO_INVALIDO` | RN-003 |
| Valor booleano | `"valor": true` | RECUSADO `DADO_INVALIDO` | RN-003 |
| `tem_nota_fiscal` ausente, valor 150,00 | — | RECUSADO `NOTA_FISCAL_AUSENTE` | RN-008 |
| `tem_nota_fiscal` nulo ou `""`, valor 150,00 | `null` / `""` | vale `false` → RECUSADO `NOTA_FISCAL_AUSENTE` | RN-003, RN-008 |
| `tem_nota_fiscal` vazio, valor 50,00 | `null` | vale `false`, não exige NF → segue para o limite | RN-003, RN-008 |
| `tem_nota_fiscal` texto | `"true"` ou `"sim"` | RECUSADO `DADO_INVALIDO` (mesmo com valor ≤ 100,00) | RN-003 |
| `tem_nota_fiscal` número | `1` ou `0` | RECUSADO `DADO_INVALIDO` | RN-003 |
| Lista de despesas vazia | `despesas: []` | saída com `itens` vazio e totais 0,00 | RN-014 |
| Arquivo sem `periodo` | — | erro, nenhuma saída gerada | RN-015 |
| `inicio` depois de `fim` | — | erro, nenhuma saída gerada | RN-015 |

## 8. Ordem de aplicação das regras

Cada despesa passa pelas etapas abaixo, em ordem. **A primeira etapa que recusa
a despesa define o motivo e encerra a avaliação dela.** Uma despesa recusada em
qualquer etapa não consome limite diário.

1. **Arredondamento e normalização** (RN-001, RN-002).
2. **Validação dos dados** (RN-003) → `DADO_INVALIDO`.
3. **Valor não positivo** (RN-004) → `VALOR_NAO_POSITIVO`.
4. **Período** (RN-005) → `FORA_DO_PERIODO`.
5. **Categoria** (RN-006) → `CATEGORIA_NAO_REEMBOLSAVEL`.
6. **Duplicata** (RN-007) → `DUPLICATA`. Só compara despesas que passaram pelas
   etapas 1 a 5.
7. **Nota fiscal** (RN-008) → `NOTA_FISCAL_AUSENTE`.
8. **Dias de viagem** (RN-011): definidos pelas hospedagens que sobraram
   depois da etapa 7.
9. **Limite diário** (RN-009, RN-010, RN-012), nas despesas que sobraram.
   Antes, cada hospedagem é dividida em parcelas por noite (RN-012). As
   despesas e parcelas são agrupadas por (data, categoria) e processadas na
   ordem da entrada, com o limite ampliado nos dias de viagem.

Por que esta ordem: primeiro vêm as regras que tratam de **elegibilidade**
(etapas 2 a 7), e só depois as regras de **quanto pagar** (etapas 8 e 9). Os
dias de viagem são definidos depois da elegibilidade para que uma hospedagem
recusada não amplie limites. Se o limite
fosse aplicado antes, uma despesa inelegível consumiria saldo do dia e
prejudicaria uma despesa legítima. A duplicata vem antes da nota fiscal para
que a segunda cópia de um gasto seja sempre identificada como duplicata, não
importa o que diga o indicador de nota.

## 9. Critérios de aceite

O sistema está pronto quando:

- [ ] Processar `exemplos/despesas-exemplo.json` produz exatamente os resultados
      por item da tabela abaixo.
- [ ] Cada linha da tabela da seção 7 tem um teste automatizado que passa.
- [ ] Cada `RN-NNN` tem ao menos um teste automatizado cujo nome cita o ID.
- [ ] A saída sempre respeita o schema da seção 4: um item por despesa, na
      ordem de entrada, com um código de motivo válido.
- [ ] Executar duas vezes com a mesma entrada gera saídas idênticas.
- [ ] Uma entrada inválida (RN-015) gera erro com mensagem e nenhum arquivo de
      saída.

Resultado esperado para `exemplos/despesas-exemplo.json`:

| id | solicitado | reembolsável | status | código |
|---|---|---|---|---|
| d-001 | 72,50 | 60,00 | PARCIAL | `LIMITE_DIARIO_EXCEDIDO` |
| d-002 | 38,00 | 0,00 | RECUSADO | `LIMITE_DIARIO_ESGOTADO` |
| d-003 | 100,00 | 80,00 | PARCIAL | `LIMITE_DIARIO_EXCEDIDO` |
| d-004 | 100,01 | 0,00 | RECUSADO | `NOTA_FISCAL_AUSENTE` |
| d-005 | 89,00 | 0,00 | RECUSADO | `CATEGORIA_NAO_REEMBOLSAVEL` |
| d-006 | 54,90 | 54,90 | APROVADO | `APROVADO_INTEGRAL` |
| d-007 | 54,90 | 0,00 | RECUSADO | `DUPLICATA` |
| d-008 | 41,00 | 0,00 | RECUSADO | `FORA_DO_PERIODO` |
| d-009 | −45,00 | 0,00 | RECUSADO | `VALOR_NAO_POSITIVO` |
| d-010 | 480,00 | 480,00 | APROVADO | `APROVADO_INTEGRAL` |
| d-011 | 33,33 | 33,33 | APROVADO | `APROVADO_INTEGRAL` |
| d-012 | 47,20 | 47,20 | APROVADO | `APROVADO_INTEGRAL` |
| d-013 | 690,00 | 0,00 | RECUSADO | `NOTA_FISCAL_AUSENTE` |
| d-014 | 61,00 | 60,00 | PARCIAL | `LIMITE_DIARIO_EXCEDIDO` |

Resumo esperado: `total_solicitado` 1.861,84 · `total_reembolsavel` 815,43 ·
`total_nao_reembolsado` 1.046,41 · aprovados 4 · parciais 3 · recusados 7.

`d-010` são 240,00 por noite, dentro do limite de 250,00. Os dias de viagem do
exemplo são 2026-07-14 e 2026-07-15 (as 2 noites de `d-010`). `d-011` (15/07, alimentação 33,33) tem limite de 90,00 e é aprovada
integralmente, como seria sem viagem. 2026-07-22 a 24 não são dias de viagem
porque `d-013` foi recusada.

## 10. O que fica em aberto

- **Indicador de viagem (AMB-007):** "noite de hospedagem na data" é uma
  aproximação provisória. Viagens sem hospedagem (bate-volta) e o dia do
  check-out não contam como viagem. Quando a entrada tiver um indicador explícito, esta
  regra deve ser substituída, com registro em `DECISIONS.md`.
- **Extração de diárias (AMB-008):** depende do colaborador escrever
  "N diárias" ou "N noites". Descrições como "estadia de dois dias" (número por
  extenso) ou "15 a 17/07" resultam em N = 1. Número fracionário de diárias
  ("1.5 diarias") é ignorado e resulta em N = 1, porque não é habitual e meia
  diária não tem leitura segura.
- **Ordem de entrada como critério de distribuição (AMB-002):** a entrada não
  traz horário, então "ordem de entrada" é aproximação da ordem cronológica
  dentro do dia. Se um dia vier horário, a regra deve ser revista.
- **Estorno sem abatimento (AMB-012):** se o estorno se referir a uma despesa
  paga em período anterior, o sistema não compensa. Isso é tratado fora do
  motor.
- **Critério de duplicata (AMB-011):** duas despesas legítimas e idênticas no
  mesmo dia (ex.: dois cafés iguais no mesmo lugar, ou almoço e jantar de
  mesmo valor no mesmo restaurante, ou ambos sem fornecedor) serão tratadas
  como duplicata, porque a entrada não traz horário. O risco foi aceito porque
  o caso é raro e o colaborador pode relançar a despesa com o fornecedor
  detalhado.
