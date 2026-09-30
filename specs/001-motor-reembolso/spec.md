# Spec — Motor de Cálculo de Reembolso

**Versão:** 2.1 · **Status:** rascunho · **Última alteração:** `2026-09-30`

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

A partir da **Política de Reembolso v4** (comunicado do RH recebido em
2026-09-30, vigência imediata e retroativa à competência atual), a política
deixa de ser única: os limites variam por **centro de custo** e são mantidos
pelo financeiro numa tabela à parte, que muda sem aviso. Colaboradores em
viagem internacional lançam despesas em **moeda estrangeira**, e itens de valor
alto passam a depender de **aprovação do gestor**.

## 2. Objetivo

Dado o conjunto de despesas de um colaborador num período, a tabela de limites
vigente e as taxas de câmbio, o sistema decide de forma determinística quanto
de cada despesa é reembolsável (em reais), justifica cada decisão com um
motivo padronizado e separa os itens que precisam de aprovação manual.

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
- Q: `fornecedor` ou `descricao` com valor que não é texto (`123`, `true`, lista, `null`) são aceitos? → A: Sim, qualquer valor é aceito e tratado como texto. Nulo vale vazio. Uma hospedagem sem descrição que declare diárias vale uma única diária (RN-003, RN-007, RN-012, AMB-026).
- Q: `colaborador.id`, `periodo.inicio` ou `periodo.fim` vazios, nulos ou de tipo errado são o mesmo que ausentes? → A: Sim, com o mesmo critério da RN-003. O arquivo é recusado pela RN-015 (AMB-027).
- Q: Em "Diárias na descrição" (2 diárias, 480,00), qual é o `limite_diario_aplicado`? → A: 250,00, o limite por diária. O limite da estadia inteira (500,00) não aparece na saída (seção 4).

### Session 2026-09-30 (envelope do Dia 2 — Política v4)

- Q: A interface `calcular --input --output` é fixa. De onde vêm a tabela de limites e as taxas de câmbio? → A: De dois arquivos externos em **local fixo**, fora do arquivo de entrada, como se viessem de um serviço do financeiro. A interface não muda. Para testar com outros dados, esses arquivos precisam ser trocados (RN-016, RN-017, AMB-028).
- Q: O que é a "política padrão" de um centro de custo sem entrada na tabela? → A: O bloco padrão da própria tabela vigente, e não as constantes da v3 (RN-016, AMB-029).
- Q: Um centro de custo que está na tabela mas não lista uma categoria (o CC-ADM não tem `hospedagem`)? → A: A categoria que falta usa o limite do padrão. Se ela também não está no padrão, não é reembolsável (RN-016, AMB-030).
- Q: Hospedagem no CC-ENG-PLATAFORMA (limite 0, "não reembolsável")? → A: RECUSADO com o mesmo código `CATEGORIA_NAO_REEMBOLSAVEL`, com uma descrição que cita o centro de custo. É recusada na etapa de categoria, então não gera dia de viagem e vem antes da nota fiscal (RN-006, AMB-031).
- Q: Despesa em moeda estrangeira num dia sem cotação (fim de semana, feriado)? → A: Usa a última cotação publicada **até a data da despesa, inclusive**. A cotação fica valendo até o próximo dia útil (RN-017, AMB-035).
- Q: O câmbio muda o tratamento de uma despesa fora do período? → A: Não. Uma despesa fora do período continua `FORA_DO_PERIODO`, tenha ou não cotação (seção 8, AMB-039).
- Q: Despesa sem `moeda`? E com moeda sem cotação? → A: Sem `moeda` vale BRL. Moeda informada sem nenhuma cotação até a data → RECUSADO com o novo código `CAMBIO_INDISPONIVEL`, só aquele item (RN-017, AMB-036).
- Q: O item C (aprovação manual) entra agora? Qual valor dispara a pendência? → A: Entra, por decisão do usuário. O gatilho é o **valor reembolsável**, depois dos limites e já em BRL, **estritamente maior** que R$ 500,00. O item sai PENDENTE/`REQUER_APROVACAO` (RN-018, AMB-040).
- Q: (revisão) `"moeda": "EURO"` ou outro texto fora do padrão de 3 letras é dado inválido? → A: Não. Texto de moeda só é descartado se não tiver um igual no arquivo de câmbio, e aí é `CAMBIO_INDISPONIVEL`, como o GBP. `DADO_INVALIDO` fica só para tipo que não é texto (RN-003, RN-017, AMB-036).
- Q: Como um item PENDENTE aparece na saída e no resumo? → A: `valor_reembolsavel` mostra o valor calculado. O item consome o limite do dia normalmente, mas fica **fora** do `total_reembolsavel`. O resumo ganha `pendentes` e `total_pendente` (RN-014, RN-018, AMB-041).

## 3. Fora de escopo

- Não efetua pagamento nem integra com folha, ERP ou banco. Só calcula.
- Não verifica se a nota fiscal é autêntica. Confia no indicador de nota fiscal
  informado na entrada.
- Não interpreta texto livre (`descricao`, `fornecedor`) para deduzir dados
  como motivo da despesa ou situação de viagem. Texto livre só é ecoado ou
  comparado literalmente. **Única exceção:** o número de diárias de hospedagem
  é extraído de `descricao` pelo padrão fechado da RN-012.
- Não busca cotações nem consulta serviços externos. Converte moeda usando
  só as taxas do arquivo de câmbio (RN-017). O resultado é sempre em reais
  (BRL). Os limites da política são sempre em BRL.
- Não mantém a tabela de limites nem as taxas. Os dois arquivos são mantidos
  pelo financeiro, e o sistema só os lê.
- Não guarda versões antigas da política. A tabela vigente vale para todas as
  despesas da execução, qualquer que seja a data delas (AMB-034).
- Não valida diferença de preço entre as noites de uma estadia nem tarifas
  promocionais. O valor da hospedagem é sempre dividido igualmente entre as
  noites (RN-012).
- Não processa mais de um colaborador ou mais de um período por execução.
- Não guarda histórico entre execuções. Duplicatas só são detectadas dentro do
  mesmo arquivo, e despesas fora do período não ficam guardadas para um
  período futuro.
- Não reembolsa categorias que não estão na tabela aplicável ao centro de
  custo do colaborador (ver RN-006 e RN-016).
- Não executa a aprovação do gestor. O sistema só marca como pendente o item
  que precisa dela (RN-018). A aprovação acontece fora do motor, e o resultado
  dela não volta para ser processado. Não há alçadas, exceções manuais nem
  interface gráfica.

## 4. Entrada e saída

**Entrada:** conforme `exemplos/despesas-exemplo.json`. Campos e significado:

| Campo | Tipo | Significado | Obrigatório |
|---|---|---|---|
| `colaborador.id` | texto | Identificador do colaborador | sim |
| `colaborador.nome` | texto | Nome, apenas ecoado na saída | não |
| `colaborador.centro_custo` | texto | Centro de custo. Decide qual tabela de limites se aplica (RN-016). Ausente, nulo ou vazio → tabela padrão. Tipo diferente de texto → arquivo recusado (RN-015) | não |
| `periodo.competencia` | texto `AAAA-MM` | Mês de competência, informativo (ver AMB-010) | não |
| `periodo.inicio` | data `AAAA-MM-DD` | Primeiro dia do período, inclusivo | sim |
| `periodo.fim` | data `AAAA-MM-DD` | Último dia do período, inclusivo | sim |
| `despesas` | lista | Despesas a avaliar (pode ser vazia) | sim |
| `despesas[].id` | texto | Identificador único da despesa no arquivo | sim |
| `despesas[].data` | data `AAAA-MM-DD` | Data em que a despesa ocorreu | sim |
| `despesas[].categoria` | texto | Categoria declarada (ver RN-002) | sim |
| `despesas[].descricao` | qualquer valor, tratado como texto | Texto livre. Em hospedagem, é de onde se extrai o número de diárias (RN-012). Ausente ou nulo = vazio = 1 diária (RN-003) | não |
| `despesas[].fornecedor` | qualquer valor, tratado como texto | Fornecedor, usado na detecção de duplicata. Ausente ou nulo equivale a vazio (RN-003, RN-007) | não |
| `despesas[].valor` | número ou texto numérico | Valor solicitado **na moeda da despesa** (`moeda`), pode ter qualquer número de casas decimais. Também é aceito como texto no formato fechado da RN-003 (`"45.00"`, `"45,00"`) | sim |
| `despesas[].moeda` | texto, código ISO 4217 | Moeda em que o `valor` foi pago. Ausente, nulo ou vazio = `BRL`. Comparado sem diferenciar maiúsculas e sem espaços nas bordas (`"eur"` = `EUR`). Tipo diferente de texto é `DADO_INVALIDO`. Texto que não está no arquivo de câmbio é `CAMBIO_INDISPONIVEL` (RN-003, RN-017) | não |
| `despesas[].tem_nota_fiscal` | booleano | Se há nota fiscal. Vazio (ausente, nulo ou texto vazio) equivale a `false`. Qualquer outro valor não booleano é `DADO_INVALIDO` (RN-003) | não |

**Dados externos:** além do arquivo de entrada, toda execução lê dois arquivos
mantidos pelo financeiro, num **local fixo** (não são indicados na linha de
comando, AMB-028). Os formatos são os de `exemplos/envelope/politica-v4.json` e
`exemplos/envelope/cambio.json`.

*Tabela de limites (política):*

| Campo | Tipo | Significado |
|---|---|---|
| `versao` | texto | Versão da política. Só ecoada na saída |
| `vigencia` | data `AAAA-MM-DD` | Início da vigência. Só lida, não restringe nenhuma despesa (AMB-034) |
| `moeda_base` | texto | Moeda dos limites. Tem de ser `BRL` |
| `padrao` | objeto | Tabela padrão: categoria → `{limite, periodicidade}` (RN-016) |
| `centros_custo` | objeto | Centro de custo → tabela própria, no mesmo formato de `padrao`. Pode listar só algumas categorias (RN-016) |
| `<categoria>.limite` | número ≥ 0, no máximo 2 casas | Limite em reais. `0` = categoria não reembolsável naquele centro de custo (RN-006) |
| `<categoria>.periodicidade` | `dia` ou `diaria` | `dia`: limite por data de calendário (RN-009). `diaria`: limite por noite de hospedagem (RN-012). Só a categoria `hospedagem` usa `diaria` |
| `<categoria>.observacao` | texto | Informativo, ignorado |
| `nota_fiscal_obrigatoria_acima_de` | número ≥ 0 | Limiar da nota fiscal em reais (RN-008) |
| `acrescimo_em_viagem_percentual` | número ≥ 0 | Ampliação dos limites em dia de viagem, em % (RN-011) |

*Taxas de câmbio:*

| Campo | Tipo | Significado |
|---|---|---|
| `moeda_base` | texto | Moeda para a qual se converte. Tem de ser `BRL` |
| `taxas` | objeto | Data `AAAA-MM-DD` → objeto moeda (ISO 4217) → quantos reais vale 1 unidade da moeda (número > 0). Só existem datas com cotação publicada (dias úteis) |
| `fonte`, `observacao` | texto | Informativos, ignorados |

Os nomes de categoria e de centro de custo da tabela são comparados com a
mesma normalização da RN-002. Um arquivo externo ausente, que não é JSON ou
que não segue estes formatos, interrompe a execução (RN-015).

**Saída:** definida por mim. Estrutura e significado de cada campo:

| Campo | Tipo | Significado |
|---|---|---|
| `colaborador` | objeto | Eco do objeto de entrada |
| `periodo` | objeto | Eco do objeto de entrada |
| `politica.versao` | texto | `versao` da tabela de limites usada |
| `politica.tabela` | texto | Centro de custo cuja tabela foi aplicada, como está escrito na tabela (`"CC-COMERCIAL"`), ou `"padrao"` quando o centro de custo não tem entrada ou está vazio (RN-016) |
| `itens` | lista | Um item por despesa de entrada, **na mesma ordem da entrada** |
| `itens[].id` | texto | `id` da despesa, como veio |
| `itens[].data` | texto | `data` da despesa, como veio |
| `itens[].categoria` | texto | Categoria normalizada (RN-002), ou a original, como veio, se não for reconhecida |
| `itens[].moeda` | texto ou nulo | Moeda normalizada da despesa (`"BRL"` se ausente). Num item `DADO_INVALIDO`, sai como veio (ausente → nulo) |
| `itens[].valor_original` | número ou nulo | `valor` da entrada arredondado para centavos (RN-001), **na moeda da despesa**. Nulo se o `valor` é ausente ou não numérico (RN-003) |
| `itens[].taxa_cambio` | número ou nulo | Taxa usada na conversão (RN-017), como está no arquivo de câmbio. `1` em BRL. Nulo se não houve conversão |
| `itens[].data_cotacao` | texto ou nulo | Data da cotação usada (a da despesa ou a última anterior, RN-017). Nulo em BRL ou se não houve conversão |
| `itens[].valor_solicitado` | número ou nulo | Valor solicitado **em reais**: `valor_original` convertido (RN-017), ou igual a ele em BRL. Nulo se o `valor` é ausente ou não numérico (RN-003) ou se não há cotação para a moeda (RN-017) |
| `itens[].valor_reembolsavel` | número | Valor a reembolsar em reais, `0 ≤ valor_reembolsavel ≤ max(valor_solicitado, 0)` (nulo conta como 0). Num item PENDENTE, é o valor que será pago se o gestor aprovar |
| `itens[].status` | texto | `APROVADO` (reembolsável = solicitado), `PARCIAL` (0 < reembolsável < solicitado), `RECUSADO` (reembolsável = 0) ou `PENDENTE` (reembolsável > R$ 500,00, aguardando aprovação do gestor, RN-018) |
| `itens[].motivo.codigo` | texto | Código padronizado da decisão (tabela abaixo) |
| `itens[].motivo.descricao` | texto | Frase legível em português, com os números que justificam a decisão |
| `itens[].limite_diario_aplicado` | número ou nulo | Limite diário da categoria usado no cálculo, já ampliado se for dia de viagem. Em hospedagem é o limite por diária. Nulo se a despesa não chegou à etapa de limite |
| `itens[].em_viagem` | booleano ou nulo | Se a data da despesa foi considerada dia de viagem (RN-011). Nulo se a despesa não chegou à etapa de limite |
| `itens[].diarias` | inteiro ou nulo | Número de diárias considerado (RN-012). Só preenchido em hospedagem que chegou à etapa de limite; nulo nos demais casos |
| `resumo.quantidade_itens` | inteiro | Total de despesas na entrada |
| `resumo.aprovados` / `parciais` / `recusados` / `pendentes` | inteiro | Contagem por status |
| `resumo.total_solicitado` | número | Soma de `valor_solicitado` (em reais) dos itens com valor **positivo** (nulo não entra) |
| `resumo.total_reembolsavel` | número | Soma de `valor_reembolsavel` dos itens que **não** estão PENDENTE |
| `resumo.total_pendente` | número | Soma de `valor_reembolsavel` dos itens PENDENTE |
| `resumo.total_nao_reembolsado` | número | `total_solicitado − total_reembolsavel − total_pendente` |

Todo valor monetário da saída é um número com no máximo duas casas decimais.
Todos são em reais, exceto `valor_original`, que está na moeda da despesa. A
`taxa_cambio` sai com as casas decimais que tem no arquivo de câmbio.

Num item recusado com `DADO_INVALIDO`, os campos de eco (`id`, `data`,
`categoria`, `moeda`) saem **exatamente como vieram**, inclusive nulos, vazios
ou de outro tipo (um campo ausente sai nulo). Assim a própria saída mostra o
dado que causou a recusa. O `valor_original` é o valor arredondado quando o
`valor` é numérico (a recusa veio de outro campo) e nulo quando não é
(AMB-023). O `valor_solicitado` segue a RN-017 quando `valor`, `data` e
`moeda` permitem a conversão, e é nulo nos demais casos.

Em qualquer item, se a moeda não tem cotação até a data da despesa,
`valor_solicitado`, `taxa_cambio` e `data_cotacao` saem nulos, mesmo que o
item tenha sido recusado por uma etapa anterior à de câmbio (por exemplo,
`FORA_DO_PERIODO`). O código continua sendo o da primeira etapa que recusou o
item (seção 8).

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
| `CAMBIO_INDISPONIVEL` | RECUSADO | RN-017 |
| `DUPLICATA` | RECUSADO | RN-007 |
| `NOTA_FISCAL_AUSENTE` | RECUSADO | RN-008 |
| `REQUER_APROVACAO` | PENDENTE | RN-018 |

Num item `REQUER_APROVACAO`, a descrição também informa o corte de limite,
quando houve (o código de limite é substituído pelo de aprovação).

**Exemplo** (período 2026-07-01 a 2026-07-31, sem viagem, centro de custo sem
entrada na tabela, portanto tabela padrão da v4):

Entrada (só `despesas`):

```json
[
  {"id": "a", "data": "2026-07-03", "categoria": "alimentacao", "fornecedor": "X", "valor": 45.00, "tem_nota_fiscal": true},
  {"id": "b", "data": "2026-07-03", "categoria": "Alimentacao", "fornecedor": "Y", "valor": 30.00, "tem_nota_fiscal": true},
  {"id": "c", "data": "2026-07-04", "categoria": "coworking",   "fornecedor": "Z", "valor": 89.00, "tem_nota_fiscal": true},
  {"id": "d", "data": "2026-07-14", "categoria": "alimentacao", "fornecedor": "W", "valor": 10.00, "moeda": "EUR", "tem_nota_fiscal": true}
]
```

Saída:

```json
{
  "colaborador": {"id": "c-0001"},
  "periodo": {"inicio": "2026-07-01", "fim": "2026-07-31"},
  "politica": {"versao": "v4", "tabela": "padrao"},
  "itens": [
    {"id": "a", "data": "2026-07-03", "categoria": "alimentacao",
     "moeda": "BRL", "valor_original": 45.00, "taxa_cambio": 1, "data_cotacao": null, "valor_solicitado": 45.00,
     "valor_reembolsavel": 45.00, "status": "APROVADO", "limite_diario_aplicado": 60.00, "em_viagem": false, "diarias": null,
     "motivo": {"codigo": "APROVADO_INTEGRAL", "descricao": "Dentro do limite diário de alimentação (R$ 60,00); saldo do dia após este item: R$ 15,00."}},
    {"id": "b", "data": "2026-07-03", "categoria": "alimentacao",
     "moeda": "BRL", "valor_original": 30.00, "taxa_cambio": 1, "data_cotacao": null, "valor_solicitado": 30.00,
     "valor_reembolsavel": 15.00, "status": "PARCIAL", "limite_diario_aplicado": 60.00, "em_viagem": false, "diarias": null,
     "motivo": {"codigo": "LIMITE_DIARIO_EXCEDIDO", "descricao": "Limite diário de alimentação R$ 60,00 em 2026-07-03; saldo disponível R$ 15,00; excedente de R$ 15,00 não reembolsado."}},
    {"id": "c", "data": "2026-07-04", "categoria": "coworking",
     "moeda": "BRL", "valor_original": 89.00, "taxa_cambio": 1, "data_cotacao": null, "valor_solicitado": 89.00,
     "valor_reembolsavel": 0.00, "status": "RECUSADO", "limite_diario_aplicado": null, "em_viagem": null, "diarias": null,
     "motivo": {"codigo": "CATEGORIA_NAO_REEMBOLSAVEL", "descricao": "Categoria 'coworking' não consta na tabela padrão da política v4."}},
    {"id": "d", "data": "2026-07-14", "categoria": "alimentacao",
     "moeda": "EUR", "valor_original": 10.00, "taxa_cambio": 5.93, "data_cotacao": "2026-07-14", "valor_solicitado": 59.30,
     "valor_reembolsavel": 59.30, "status": "APROVADO", "limite_diario_aplicado": 60.00, "em_viagem": false, "diarias": null,
     "motivo": {"codigo": "APROVADO_INTEGRAL", "descricao": "EUR 10,00 × 5,93 (cotação de 2026-07-14) = R$ 59,30; dentro do limite diário de alimentação (R$ 60,00)."}}
  ],
  "resumo": {"quantidade_itens": 4, "aprovados": 2, "parciais": 1, "recusados": 1, "pendentes": 0,
             "total_solicitado": 223.30, "total_reembolsavel": 119.30, "total_pendente": 0.00, "total_nao_reembolsado": 104.00}
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

O arredondamento vale para o `valor` na moeda da despesa (`valor_original`).
Em moeda estrangeira, o valor convertido para reais é arredondado de novo, com
a mesma regra (RN-017).
**Origem:** ausente na política (AMB-013, AMB-037)
**Aceite:** `33.333` → `valor_solicitado` 33.33. `10.005` → 10.00.
`10.015` → 10.02. `33.345` → 33.34. `33.3451` → 33.35 (fora do meio).
`100.004` → 100.00 e não exige nota fiscal (RN-008).

### RN-002 — Normalização da categoria

**Regra:** A categoria é comparada sem diferenciar maiúsculas de minúsculas,
sem espaços nas bordas e sem acentos. As categorias reconhecidas são as que
aparecem na tabela aplicável ao colaborador (RN-016), comparadas com a mesma
normalização. Na saída, uma categoria reconhecida sai normalizada, e uma não
reconhecida sai como veio.
**Origem:** política do RH v3, item 9, e v4, item A (AMB-014, AMB-030)
**Aceite:** `"ALIMENTACAO"`, `" Alimentação "` e `"alimentacao"` são todas
tratadas como `alimentacao` e somam no mesmo limite diário. `"Representação"`
é reconhecida como `representacao` para o CC-COMERCIAL, mas não para um
colaborador na tabela padrão.

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
câmbio, duplicata, nota fiscal) passou por esta validação e reserva o `id` (AMB-025).

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

`moeda` ausente, nula, ou texto vazio ou só com espaços vale `BRL`. Um texto
é comparado sem espaços nas bordas e sem diferenciar maiúsculas de
minúsculas. Não há checagem de formato: todo texto é procurado no arquivo de
câmbio, e um texto que não está lá (`"GBP"`, `"EURO"`, `"R$"`) não é dado
inválido, e sim moeda sem cotação, tratada pela RN-017. Só um valor que não é
texto (número, booleano, lista, objeto) é `DADO_INVALIDO` (AMB-036).

`fornecedor` e `descricao` nunca causam `DADO_INVALIDO`: qualquer valor é
aceito e tratado como texto. Ausente ou nulo vale texto **vazio**. Texto é
usado como veio. Número e booleano viram o texto com que aparecem no arquivo
(`123` → `"123"`, `true` → `"true"`). Lista e objeto viram o seu texto JSON
compacto, sem espaços (AMB-026).
**Origem:** ausente na política (AMB-018, AMB-021, AMB-022, AMB-023, AMB-024, AMB-025, AMB-026, AMB-036)
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
`CATEGORIA_NAO_REEMBOLSAVEL`. `"fornecedor": 123` e `"descricao": null`
não recusam a despesa. `"moeda": " eur "` vale `EUR`. `"moeda": 978` →
RECUSADO/`DADO_INVALIDO`. `"moeda": "EURO"` passa pela validação (e sai
`CAMBIO_INDISPONIVEL` pela RN-017).

### RN-004 — Valores não positivos

**Regra:** Uma despesa com `valor_original` ≤ 0,00 (estorno, cancelamento,
zero) é **RECUSADA** com `VALOR_NAO_POSITIVO`, não abate nenhuma outra despesa
e não entra em `total_solicitado`. O sinal não depende da moeda (toda taxa é
positiva), então a regra vale mesmo sem cotação. Uma despesa em moeda
estrangeira positiva cuja conversão arredonda para 0,00 real também é
recusada com `VALOR_NAO_POSITIVO`.
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

**Regra:** Só é reembolsável a categoria (depois da RN-002) que tem limite
**maior que zero** na tabela aplicável ao colaborador (RN-016). Qualquer outra
é **RECUSADA** integralmente com `CATEGORIA_NAO_REEMBOLSAVEL`. São dois casos,
com o mesmo código e descrições diferentes:
- a categoria não está nem na tabela do centro de custo nem na padrão → a
  descrição diz que a categoria não consta na política;
- a categoria tem limite 0 na tabela do centro de custo → a descrição diz que
  a categoria não é reembolsável **naquele centro de custo** e cita o nome
  dele.
**Origem:** política do RH v3, item 9, e v4, item A (AMB-019, AMB-031)
**Aceite:** `d-005` (`coworking`, 89,00) → RECUSADO/`CATEGORIA_NAO_REEMBOLSAVEL`.
Hospedagem de colaborador do CC-ENG-PLATAFORMA → RECUSADO/`CATEGORIA_NAO_REEMBOLSAVEL`,
descrição cita "CC-ENG-PLATAFORMA". `representacao` na tabela padrão →
RECUSADO/`CATEGORIA_NAO_REEMBOLSAVEL`.

### RN-007 — Duplicatas

**Regra:** Duas despesas são duplicatas quando têm a mesma `data`, a mesma
categoria normalizada, o mesmo `fornecedor` (comparado sem diferenciar
maiúsculas de minúsculas e sem espaços nas bordas), a mesma `moeda` e o
mesmo `valor_original`, com `id` diferente. Em BRL, `valor_original` é o
próprio `valor_solicitado`. Despesas em moedas diferentes nunca são
duplicatas (AMB-038). `fornecedor` é tratado como texto
(RN-003). Ausente, nulo ou só com espaços vale como fornecedor **vazio**, que é comparado como qualquer outro valor:
vazio é igual a vazio, e um fornecedor preenchido nunca é igual a vazio.
`descricao` e `tem_nota_fiscal` não entram no critério.
Num grupo de duplicatas, **só a primeira ocorrência na ordem da entrada**
segue para as próximas regras. As demais são **RECUSADAS** com `DUPLICATA`. A
descrição do motivo cita o `id` da ocorrência aceita e não pressupõe má-fé.
**Origem:** política do RH, item 8 (AMB-011, AMB-038)
**Aceite:** `d-006` e `d-007` (2026-07-09, alimentação, Bistro Central, 54,90):
`d-006` segue normalmente (APROVADO 54,90) e `d-007` → RECUSADO/`DUPLICATA`.
Duas despesas de alimentação de 40,00 na mesma data, as duas sem fornecedor →
a 2ª RECUSADO/`DUPLICATA`. Se só uma delas tiver fornecedor, as duas seguem
normalmente. `"fornecedor": 123` e `"fornecedor": "123"` são o mesmo
fornecedor, e `"fornecedor": null` é igual a fornecedor ausente. Duas
despesas iguais de 20,00, uma em EUR e outra em USD → as duas seguem
normalmente. Uma sem `moeda` e outra com `"moeda": "BRL"`, o resto igual → a
2ª RECUSADO/`DUPLICATA`.

### RN-008 — Nota fiscal obrigatória

**Regra:** Uma despesa com `valor_solicitado` **estritamente maior** que o
limiar de nota fiscal e sem nota fiscal é **RECUSADA integralmente** com
`NOTA_FISCAL_AUSENTE`. O limiar é o `nota_fiscal_obrigatoria_acima_de` da
tabela de limites (R$ 100,00 na v4), é o mesmo para todos os centros de custo
e está em reais. O limiar vale por despesa individual, usa o valor solicitado
**em reais, depois da conversão** (não o reembolsável nem o valor na moeda
original) e não é ampliado pela viagem.
**Origem:** política do RH v3, item 5, e v4, item B (AMB-004, AMB-005, AMB-006, AMB-017, AMB-038)
**Aceite:** `d-003` (100,00, sem NF) **não** é recusado por nota fiscal.
`d-004` (100,01, sem NF) → RECUSADO/`NOTA_FISCAL_AUSENTE`.
`e-005` (40,00 USD × 5,50 = R$ 220,00, sem NF) → RECUSADO/`NOTA_FISCAL_AUSENTE`.
`e-003` (14,50 EUR × 5,88 = R$ 85,26, sem NF) **não** é recusado por nota fiscal.

### RN-009 — Limites diários por categoria

**Regra:** Para cada combinação (data, categoria), a soma dos valores
reembolsáveis (em reais) não passa do limite da categoria na tabela aplicável
ao colaborador (RN-016). Categorias de periodicidade `dia` têm o limite por
data de calendário. A hospedagem (periodicidade `diaria`) tem o limite por
noite, e as diárias são distribuídas por noite (RN-012). Nos dias de viagem,
o limite das categorias `dia` é ampliado (RN-011). A hospedagem nunca é
ampliada (AMB-020).

Valores da v4, só para referência (valem os do arquivo vigente):

| Categoria | Padrão | CC-ENG-PLATAFORMA | CC-COMERCIAL | CC-ADM |
|---|---|---|---|---|
| `alimentacao` (dia) | 60,00 | 75,00 | 90,00 | 45,00 |
| `transporte_urbano` (dia) | 80,00 | 80,00 | 150,00 | 60,00 |
| `hospedagem` (diária) | 250,00 | 0,00 (não reembolsável) | 400,00 | 250,00 (herdado do padrão) |
| `representacao` (dia) | — (não reembolsável) | — (não reembolsável) | 300,00 | — (não reembolsável) |

Os casos de borda da seção 7 que não citam centro de custo usam a tabela
padrão, e os que não citam moeda usam BRL.

O limite é inclusivo: uma despesa que usa exatamente o saldo restante é
`APROVADO_INTEGRAL`. O "dia" é a data de calendário da despesa, sem distinção
entre dia útil, fim de semana ou feriado. Só despesas que passaram por todas as
regras anteriores (seção 8) consomem limite.
**Origem:** política do RH v3, itens 1, 2 e 3, e v4, item A (AMB-001, AMB-008, AMB-015, AMB-016, AMB-029, AMB-030)
**Aceite:** uma despesa isolada de alimentação de 60,00, tabela padrão →
APROVADO 60,00. `d-012` (sábado, 47,20) → APROVADO 47,20. Alimentação de
80,00 no CC-COMERCIAL → APROVADO 80,00 (limite 90,00). Alimentação de 50,00 no
CC-ADM → PARCIAL 45,00.

### RN-010 — Reembolso parcial e distribuição do limite no dia

**Regra:** Dentro de cada (data, categoria), as despesas elegíveis consomem o
limite **na ordem em que aparecem na entrada**. Cada uma recebe
`min(valor_solicitado, saldo_restante)`:
- recebe tudo → APROVADO/`APROVADO_INTEGRAL`;
- recebe parte (> 0) → PARCIAL/`LIMITE_DIARIO_EXCEDIDO`, o excedente é cortado;
- saldo já zerado → RECUSADO/`LIMITE_DIARIO_ESGOTADO`.
**Origem:** política do RH, item 4 (AMB-002, AMB-003)
**Aceite:** na tabela padrão (60,00), alimentação de 72,50 e depois de 38,00
na mesma data: a 1ª → PARCIAL 60,00 e a 2ª → RECUSADO/`LIMITE_DIARIO_ESGOTADO`
0,00. No CC-ENG-PLATAFORMA (75,00), `d-001` (72,50) e `d-002` (38,00) em
2026-07-03: `d-001` → APROVADO 72,50 e `d-002` → PARCIAL 2,50.

### RN-011 — Colaborador em viagem

**Regra:** Uma data é **dia de viagem** quando é uma das noites (D, D+1, …,
D+N−1, ver RN-012) de ao menos uma despesa de hospedagem **elegível**, ou
seja, que passou pelas etapas 2 a 8 da seção 8. O dia do check-out (D+N) não é
dia de viagem. Nos dias de viagem, o limite de **toda categoria de
periodicidade `dia`** (alimentação, transporte urbano, representação) é
ampliado pelo `acrescimo_em_viagem_percentual` da tabela de limites (50% na
v4, ou seja, × 1,5). Se o limite ampliado não der centavos exatos, ele é
arredondado pela regra da RN-001 (AMB-033). O limite de
hospedagem **não** é ampliado (AMB-020). Uma hospedagem recusada (sem nota,
duplicada, fora do período, não reembolsável no centro de custo, sem
cotação...) não torna a data dia de viagem. Uma hospedagem PENDENTE (RN-018)
é elegível e torna a data dia de viagem.
**Origem:** política do RH v3, item 6 (AMB-007, AMB-031, AMB-033)
**Aceite:** tabela padrão: alimentação de 80,00 na mesma data de uma
hospedagem elegível → APROVADO 80,00 (limite 90,00). Hospedagem de 1 diária em
D e alimentação de 80,00 em D+1 (check-out) → PARCIAL 60,00. Hospedagem de 2
diárias em D e alimentação de 80,00 em D+1 → APROVADO 80,00. `d-013` (3 noites)
é recusada, então 2026-07-22 a 2026-07-24 **não** são dias de viagem. No
CC-COMERCIAL, `e-008` (alimentação 95,00 em 23/07, noite de `e-007`, que está
PENDENTE) → APROVADO 95,00 (limite 135,00).

### RN-012 — Hospedagem com mais de uma diária

**Regra:** O número de diárias `N` de uma despesa de hospedagem é o número
inteiro da **primeira ocorrência**, na `descricao`, de um inteiro seguido (com
ou sem espaço) de uma das palavras `diaria`, `diarias`, `noite` ou `noites`.
Números que aparecem antes dessa ocorrência sem ser seguidos de uma dessas
palavras são ignorados. Número **fracionário** (dígitos, separador `.` ou `,`
e mais dígitos, como `1.5` ou `1,5`) também é ignorado, mesmo seguido de
diária/noite, e nenhum pedaço dele conta como inteiro. A comparação não diferencia
maiúsculas de minúsculas nem acentos, então "diária" e "Diárias" também
contam. A `descricao` é tratada como texto (RN-003). Se ela está ausente,
nula ou vazia, ou se não tem esse padrão, a hospedagem vale **uma única
diária** (`N` = 1). Se `N` = 0, também vale `N` = 1.

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
**Origem:** política do RH, item 3 (AMB-008, AMB-026)
**Aceite:** "Hotel Rio - 2 diarias" → N = 2. "Airbnb 3 noites" → N = 3.
"Hotel 5 estrelas" → N = 1 (5 não vem seguido de diária/noite).
"Hotel 5 estrelas - 2 diarias" → N = 2. "Hotel 1.5 diarias" → N = 1
(e não 5). "Pousada" → N = 1. `descricao` ausente, nula ou `2` (número) → N = 1.
Na tabela padrão (250,00 por noite): "Hotel Rio - 2 diarias", 480,00, em 14/07
→ 240,00 na noite de 14/07 e 240,00 na de 15/07 → APROVADO 480,00. Exemplo de sobreposição, com
`h1` = 14/07 "2 diarias" 480,00 e depois `h2` = 15/07 "1 diaria" 200,00:
`h1` → 240 + 240 = APROVADO 480,00; `h2` → só restam 10,00 na noite de 15/07
→ PARCIAL 10,00. No CC-COMERCIAL (400,00 por noite), `e-007` ("3 noites",
1.200,00) → 400,00 em cada noite, reembolsável 1.200,00 (sai PENDENTE pela
RN-018).

### RN-013 — Justificativa obrigatória

**Regra:** Todo item da saída tem exatamente um `motivo.codigo` da tabela da
seção 4 e uma `motivo.descricao` não vazia. Quando o motivo é de limite, a
descrição informa o limite aplicado, o saldo disponível e o valor cortado.
**Origem:** objetivo do sistema ("justifica cada decisão")
**Aceite:** nenhum item da saída do arquivo de exemplo tem motivo ausente ou vazio.

### RN-014 — Totais do resumo

**Regra:** `resumo` é calculado conforme a seção 4, e
`total_nao_reembolsado = total_solicitado − total_reembolsavel − total_pendente`,
exato em centavos. Todos os totais são em reais. Um item PENDENTE entra em
`total_solicitado` e em `total_pendente`, e não entra em `total_reembolsavel`
(AMB-041).
**Origem:** objetivo do sistema (AMB-041)
**Aceite:** a soma de `valor_reembolsavel` dos itens não PENDENTE é igual a
`resumo.total_reembolsavel`, a dos itens PENDENTE é igual a
`resumo.total_pendente`, e as contagens por status (aprovados, parciais,
recusados, pendentes) somam `quantidade_itens`.

### RN-015 — Arquivo de entrada inválido

**Regra:** Se o arquivo de entrada não existe, não é JSON válido, não é um
objeto ou não tem `colaborador.id`, `periodo.inicio`, `periodo.fim` (datas
válidas, com `inicio` ≤ `fim`) ou a lista `despesas`, a execução termina
**com indicação de erro**, com mensagem que aponta o problema, e **nenhum
arquivo de saída é gerado**.

Vale o mesmo critério da RN-003: `colaborador.id`, `periodo.inicio` e
`periodo.fim` que vêm vazios (texto vazio ou só com espaços), nulos ou com
tipo diferente de texto contam como **ausentes**. Um `colaborador` ou
`periodo` que não é objeto tem todos os seus campos ausentes (AMB-027).

Também termina com erro, sem saída, a execução em que:
- `colaborador.centro_custo` existe com tipo diferente de texto (número,
  booleano, lista, objeto) (AMB-032);
- a tabela de limites ou o arquivo de câmbio não existe, não é JSON válido ou
  não segue o formato da seção 4 (RN-016, RN-017). A mensagem cita qual dos
  dois arquivos e o campo com problema.
**Origem:** interface fixa do desafio (AMB-027, AMB-028, AMB-032)
**Aceite:** executar com um arquivo sem `periodo` resulta em erro, mensagem que
cita `periodo` e nenhum arquivo de saída. `"colaborador": {"id": ""}` ou
`{"id": 123}` → erro que cita `colaborador.id`. `"inicio": 20260701` → erro
que cita `periodo.inicio`. Um arquivo cujo conteúdo é uma lista (`[]`) → erro.
`"centro_custo": 42` → erro que cita `colaborador.centro_custo`. Tabela de
limites com `"limite": -10` → erro que cita a tabela de limites e o campo.
Arquivo de câmbio ausente → erro que cita o arquivo de câmbio.

### RN-016 — Política por centro de custo

**Regra:** Os limites vêm da tabela de limites mantida pelo financeiro (seção
4), lida a cada execução. Nenhum limite, limiar ou percentual da política é
fixo no sistema. A **tabela aplicável** ao colaborador é montada assim:
1. Se `colaborador.centro_custo` está ausente, nulo ou vazio, ou se não há
   entrada para ele em `centros_custo`, vale a tabela `padrao` inteira. O
   centro de custo é comparado com a normalização da RN-002 (AMB-029, AMB-032).
2. Se há entrada, cada categoria dela usa o limite do centro de custo. Cada
   categoria que não aparece no centro de custo usa o limite do `padrao`
   (AMB-030).
3. Uma categoria que não aparece em nenhum dos dois não é reembolsável
   (RN-006).

Uma categoria com limite 0 no centro de custo **não** herda do padrão: o 0 é a
forma como o financeiro exclui a categoria (RN-006, AMB-031). O
`nota_fiscal_obrigatoria_acima_de` e o `acrescimo_em_viagem_percentual` são
únicos para todos os centros de custo. A `vigencia` não restringe nenhuma
despesa (AMB-034). Na saída, `politica.tabela` diz qual tabela foi aplicada.

A tabela é **inválida** (RN-015) quando: não é um objeto; `moeda_base` não é
`BRL`; `padrao` ou `centros_custo` não são objetos; um limite não é número, é
negativo ou tem mais de 2 casas decimais; a periodicidade não é `dia` ou
`diaria`, ou `diaria` aparece numa categoria que não é `hospedagem`, ou
`hospedagem` não é `diaria`; `nota_fiscal_obrigatoria_acima_de` ou
`acrescimo_em_viagem_percentual` estão ausentes, não são números ou são
negativos; dois centros de custo (ou duas categorias da mesma tabela) ficam
iguais depois da normalização.
**Origem:** política do RH v4, item A (AMB-028, AMB-029, AMB-030, AMB-031, AMB-032, AMB-034)
**Aceite:** colaborador do `CC-SUPORTE-N2` (sem entrada) → `politica.tabela`
`"padrao"`, alimentação limitada a 60,00. `" cc-comercial "` → tabela do
CC-COMERCIAL. Colaborador sem `centro_custo` → padrão. Hospedagem de 300,00
no CC-ADM (sem hospedagem na tabela) → limite 250,00 do padrão → PARCIAL
250,00. `representacao` no CC-SUPORTE-N2 → RECUSADO/`CATEGORIA_NAO_REEMBOLSAVEL`.
Trocar o limite de alimentação do padrão no arquivo para 70,00 muda o
resultado de uma alimentação de 65,00 de PARCIAL para APROVADO, sem mudar o
sistema.

### RN-017 — Moeda e conversão para reais

**Regra:** Toda despesa tem uma moeda (RN-003: ausente vale `BRL`). Em `BRL`,
`valor_solicitado` = `valor_original`, `taxa_cambio` = 1 e `data_cotacao` é
nulo. Em outra moeda, o valor é convertido para reais pela taxa do arquivo de
câmbio:
1. A **data da cotação** é a data da despesa, se o arquivo tem cotação daquela
   moeda nessa data. Senão, é a **data mais recente anterior** à despesa que
   tem cotação daquela moeda (a cotação vale até a próxima publicada). Não há
   limite de dias para trás (AMB-035).
2. `valor_solicitado` = `valor_original` × taxa, arredondado para centavos
   pela regra da RN-001 (AMB-037).
3. Se a moeda não tem nenhuma cotação até a data da despesa (texto que não
   está no arquivo, como `"GBP"` ou `"EURO"`, ou despesa anterior à primeira
   cotação dela), a despesa é
   **RECUSADA** com `CAMBIO_INDISPONIVEL`, e `valor_solicitado`,
   `taxa_cambio` e `data_cotacao` saem nulos. Só aquele item é afetado
   (AMB-036).

A conversão é calculada antes das regras de elegibilidade, para que todas usem
o valor em reais, mas a recusa por falta de cotação só acontece na etapa 6 da
seção 8. Uma despesa recusada antes (fora do período, categoria não
reembolsável...) mantém o motivo dessa etapa (AMB-039). Todos os limites e o
limiar de nota fiscal são comparados com o valor em reais.

O arquivo de câmbio é **inválido** (RN-015) quando: não é um objeto;
`moeda_base` não é `BRL`; `taxas` não é objeto; uma chave de `taxas` não é
uma data válida; uma moeda não tem 3 letras; uma taxa não é número ou não é
maior que zero.
**Origem:** política do RH v4, item B (AMB-035, AMB-036, AMB-037, AMB-038, AMB-039)
**Aceite:** `e-002` (22,00 EUR em 14/07) → taxa 5,93 de 14/07 → R$ 130,46.
`e-004` (30,00 EUR no sábado 18/07) → taxa 5,96 de sexta 17/07 →
`data_cotacao` "2026-07-17", R$ 178,80. `e-006` (55,00 GBP) →
RECUSADO/`CAMBIO_INDISPONIVEL`, `valor_solicitado` nulo. 10,00 `"EURO"` →
RECUSADO/`CAMBIO_INDISPONIVEL`, e não `DADO_INVALIDO`. EUR em 2026-07-10
(antes da primeira cotação, 13/07) → RECUSADO/`CAMBIO_INDISPONIVEL`. EUR em
2026-06-30 num período de julho → RECUSADO/`FORA_DO_PERIODO`, e não
`CAMBIO_INDISPONIVEL`. `e-010` (sem `moeda`) → BRL, `taxa_cambio` 1.

### RN-018 — Aprovação manual de itens acima de R$ 500

**Regra:** Depois do limite diário (etapa 10 da seção 8), um item com
`valor_reembolsavel` **estritamente maior** que R$ 500,00 (em reais) não é
aprovado automaticamente: sai com status **PENDENTE** e código
`REQUER_APROVACAO`, aguardando aprovação do gestor. O `valor_reembolsavel`
mostra o valor calculado, que é o que será pago se o gestor aprovar. Um item
PENDENTE:
- consome o limite do dia normalmente (quem vem depois disputa o saldo que
  sobrou);
- se for hospedagem, torna suas noites dias de viagem (RN-011);
- entra em `total_pendente` e não em `total_reembolsavel` (RN-014);
- tem na descrição o valor calculado, o limiar de R$ 500,00 e, se houve corte
  de limite, o valor cortado.

O limiar de R$ 500,00 é fixo nesta spec: o comunicado do RH o define, e a
tabela de limites do financeiro não o traz (AMB-040). O limiar usa o
reembolsável, não o solicitado: uma despesa de 1.200,00 cortada para 400,00
pelo limite não fica pendente.
**Origem:** política do RH v4, item C (AMB-040, AMB-041)
**Aceite:** `e-007` (hospedagem 1.200,00, 3 × 400,00 no CC-COMERCIAL) →
PENDENTE/`REQUER_APROVACAO`, `valor_reembolsavel` 1.200,00, fora do
`total_reembolsavel`. Reembolsável exatamente 500,00 → não fica pendente.
Reembolsável 500,01 → PENDENTE. Hospedagem de 1.200,00 com 1 diária na tabela
padrão → PARCIAL 250,00, não PENDENTE.

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
urbano. A hospedagem fica sempre em R$ 250,00 por noite. *(Atualizado na
v2.0: a ampliação vale para toda categoria de periodicidade `dia`, e a
hospedagem fica sempre no limite por noite da tabela aplicável, ver AMB-033.)*
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

### AMB-026 — `fornecedor` e `descricao` que não são texto

**Texto original do RH:** a política não fala do assunto.
**O que não está claro:** a entrada declara `fornecedor` e `descricao` como
texto, mas pode trazer `123`, `true`, uma lista ou `null`. Leituras
possíveis: (a) `DADO_INVALIDO`; (b) valor que não é texto vale vazio;
(c) qualquer valor é aceito e tratado como texto.
**Decisão:** (c). Nulo vale vazio. Número e booleano viram o texto com que
aparecem no arquivo, e lista e objeto viram seu texto JSON compacto. Na
duplicata (RN-007), `123` e `"123"` são o mesmo fornecedor. Na hospedagem
(RN-012), uma descrição que não declara diárias vale uma única diária.
**Justificativa:** decisão do usuário. Os dois campos são opcionais e não
decidem sozinhos se a despesa é paga, então recusar a despesa pelo tipo deles
puniria o colaborador por formatação. Tratar como vazio (b) esconderia um
fornecedor que foi informado e juntaria na duplicata despesas de fornecedores
diferentes.
**Regra afetada:** RN-003, RN-007, RN-012

### AMB-027 — Campos obrigatórios do arquivo vazios ou de tipo errado

**Texto original do RH:** a política não fala do assunto.
**O que não está claro:** a RN-015 recusa o arquivo sem `colaborador.id`,
`periodo.inicio` ou `periodo.fim`, mas não diz se `""`, `null` ou `123`
contam como ausentes, nem o que acontece quando o arquivo é uma lista.
**Decisão:** o mesmo critério da RN-003. Vazio, nulo ou de tipo diferente de
texto conta como ausente, e o arquivo é recusado. Um arquivo que não é objeto
também é recusado.
**Justificativa:** decisão do usuário, por coerência com a RN-003. Sem
colaborador ou período não há como calcular nenhuma despesa, então o erro é
do arquivo inteiro, e não de um item.
**Regra afetada:** RN-015

### AMB-028 — De onde vêm a tabela de limites e as taxas de câmbio

**Texto original do RH (v4):** "O motor precisa ler a política de fora, não de
dentro do código." / "As taxas estão em `cambio.json`."
**O que não está claro:** a interface `calcular --input --output` é fixa pelo
desafio. Os dois arquivos podem (a) ser indicados por novas opções na linha de
comando; (b) vir dentro do arquivo de entrada; (c) ficar num local fixo,
conhecido pelo sistema.
**Decisão:** (c). Os dois arquivos ficam num local fixo e são lidos a cada
execução. A interface não muda. A documentação de uso explica que, para
testar com outra tabela ou outras taxas, é preciso trocar esses arquivos.
Arquivo ausente ou inválido interrompe a execução (RN-015).
**Justificativa:** decisão do usuário. A interface é fixa, e num sistema real
esses dados viriam de um serviço do financeiro, não de quem gera o arquivo de
despesas. Deixar a tabela fora do arquivo de entrada impede que quem pede o
reembolso escolha os próprios limites.
**Regra afetada:** RN-015, RN-016, RN-017

### AMB-029 — O que é "a política padrão"

**Texto original do RH (v4):** "Alguns centros de custo não têm entrada na
tabela. Nesse caso, aplica-se a política padrão."
**O que não está claro:** "política padrão" pode ser (a) o bloco `padrao` da
tabela vigente; (b) as constantes da v3 (60/80/250). Também não se diz o que
acontece com o colaborador **sem** centro de custo.
**Decisão:** (a) o bloco `padrao` da tabela vigente. Colaborador sem centro de
custo (ausente, nulo ou vazio) também usa o padrão.
**Justificativa:** a v4 manda ler a política de fora do código. Usar as
constantes da v3 manteria uma política escondida no sistema, que não mudaria
quando o financeiro alterasse o padrão. Hoje os valores coincidem, mas só por
acaso. Confirmado pelo usuário na revisão: nenhum valor de fora da tabela
vigente entra no cálculo, e o colaborador sem centro de custo já é coberto
pelo texto da v4 ("centros de custo [que] não têm entrada na tabela").
**Regra afetada:** RN-016

### AMB-030 — Centro de custo que não lista todas as categorias

**Texto original do RH (v4):** "Cada centro de custo tem a sua tabela."
**O que não está claro:** o `CC-ADM` está na tabela, mas não tem
`hospedagem`. (a) A tabela do centro de custo substitui a padrão inteira, e a
hospedagem não é reembolsável; (b) a categoria que falta herda do padrão.
**Decisão:** (b). A categoria que falta usa o limite do padrão. Se ela também
não está no padrão, não é reembolsável.
**Justificativa:** decisão do usuário. O financeiro exclui categorias de forma
explícita, com limite 0 (o `CC-ENG-PLATAFORMA` faz isso com hospedagem).
Então, uma categoria que não aparece é uma que não foi alterada para aquele
centro de custo.
**Regra afetada:** RN-006, RN-009, RN-016

### AMB-031 — Categoria com limite 0 ("não reembolsa de forma alguma")

**Texto original do RH (v4):** "`CC-ENG-PLATAFORMA` não reembolsa
`hospedagem` de forma alguma."
**O que não está claro:** a tabela traz `limite: 0`. A despesa pode (a) passar
pelas regras e ser recusada no limite (`LIMITE_DIARIO_ESGOTADO`), gerando dia
de viagem; (b) ser recusada como categoria não reembolsável, com o código que
já existe; (c) ganhar um código novo.
**Decisão:** (b). RECUSADO/`CATEGORIA_NAO_REEMBOLSAVEL` na etapa de categoria,
com uma descrição que cita o centro de custo. Por ser recusada nessa etapa,
ela não gera dia de viagem e vem antes da checagem de nota fiscal. Limite 0
não herda do padrão.
**Justificativa:** decisão do usuário. "De forma alguma" é exclusão da
categoria, e não um saldo que acabou: `LIMITE_DIARIO_ESGOTADO` daria a
entender que houve saldo. Um código novo acrescentaria pouco, porque a
descrição já diferencia os dois casos. Uma hospedagem que a empresa não paga
não deve ampliar outros limites, assim como uma hospedagem recusada (AMB-007).
**Regra afetada:** RN-006, RN-011, RN-016

### AMB-032 — Grafia e tipo do centro de custo

**Texto original do RH (v4):** a política não fala do assunto.
**O que não está claro:** `"cc-comercial"` ou `" CC-COMERCIAL "` casam com
`CC-COMERCIAL`? E um `centro_custo` numérico?
**Decisão:** o centro de custo é comparado com a normalização da RN-002.
Ausente, nulo ou vazio → padrão. Tipo diferente de texto → o arquivo é
recusado (RN-015).
**Justificativa:** a mesma da AMB-014: diferença de grafia é digitação. Já um
tipo errado não tem leitura segura, e o centro de custo decide todos os
limites da execução. Cair no padrão em silêncio poderia pagar mais ou menos
do que o devido em todos os itens, então o erro é do arquivo inteiro, como na
AMB-027.
**Regra afetada:** RN-015, RN-016

### AMB-033 — Ampliação de viagem nas categorias novas

**Texto original do RH:** v3: "Colaborador em viagem tem limites ampliados em
50%." v4: a tabela traz `acrescimo_em_viagem_percentual: 50` e a categoria
nova `representacao`.
**O que não está claro:** a ampliação vale para `representacao`? E o
percentual continua fixo em 50%?
**Decisão:** o percentual vem do campo `acrescimo_em_viagem_percentual` da
tabela. O campo é único, fica fora de `padrao` e de `centros_custo`, e vale
para todos os centros de custo (RN-016). Ele vale para **toda categoria de
periodicidade `dia`** (alimentação, transporte urbano, representação), e
nunca para a hospedagem (`diaria`). Um limite ampliado que não dá centavos
exatos é arredondado pela RN-001.
**Justificativa:** a política fala em "limites" sem restringir categoria. A
única exceção (AMB-020) existe porque a viagem é inferida pela própria
hospedagem. Amarrar a regra à periodicidade, e não a uma lista de nomes, faz
uma categoria nova seguir a regra sem mudar a spec.
**Regra afetada:** RN-009, RN-011

### AMB-034 — Vigência e retroatividade

**Texto original do RH (v4):** "Vigência imediata, retroativa à competência
atual." A tabela traz `vigencia: 2026-07-01`.
**O que não está claro:** despesas com data anterior à vigência seguem a v3?
A vigência muda o que é elegível?
**Decisão:** a tabela vigente vale para toda a execução, qualquer que seja a
data da despesa. A `vigencia` só é lida. Quem decide a elegibilidade pela data
continua sendo o período (RN-005).
**Justificativa:** a v4 é retroativa à competência atual, e despesas fora do
período já são recusadas pela RN-005. Manter a v3 ao lado da v4 exigiria
guardar versões antigas da política, o que está fora de escopo (seção 3).
**Regra afetada:** RN-005, RN-016

### AMB-035 — "A taxa da data da despesa" num dia sem cotação

**Texto original do RH (v4):** "A conversão usa a taxa da data da despesa, não
a taxa de hoje." O arquivo de câmbio avisa: "Cotações publicadas apenas em
dias úteis bancários."
**O que não está claro:** `e-004` é de um sábado (18/07), sem cotação. (a)
Usar a última cotação anterior; (b) usar a próxima; (c) recusar a despesa.
**Decisão:** (a). Vale a cotação mais recente publicada até a data da
despesa, inclusive. Não há limite de dias para trás.
**Justificativa:** decisão do usuário. É a prática da PTAX: a cotação vale até
a próxima ser publicada. A próxima cotação (b) ainda não existia no dia do
gasto, e recusar (c) puniria o colaborador por viajar num fim de semana.
**Regra afetada:** RN-017

### AMB-036 — Moeda ausente, inválida ou sem cotação

**Texto original do RH (v4):** "A entrada agora pode trazer um campo `moeda`
(ISO 4217). Quando ausente, assume-se `BRL`."
**O que não está claro:** (1) `null`, `""` ou `"eur"` valem o quê? (2) E uma
moeda válida que não está no arquivo de câmbio (`e-006`, GBP), ou uma despesa
anterior à primeira cotação?
**Decisão:** (1) nulo ou vazio vale `BRL`, como ausente. Um texto é comparado
sem diferenciar maiúsculas e sem espaços nas bordas, sem checagem de formato.
Só um tipo que não é texto → `DADO_INVALIDO`. (2) Todo texto que não tem
cotação até a data (inclusive um que não está no arquivo, como `"GBP"` ou
`"EURO"`) → RECUSADO com o novo código `CAMBIO_INDISPONIVEL`, só aquele item,
com `valor_solicitado` nulo.
**Justificativa:** decisão do usuário para (1) e (2), na revisão: "texto de
moeda só é descartado como inválido caso não tenha um igual nos câmbios". O
arquivo de câmbio é quem diz quais moedas o sistema conhece, e uma regra de
formato à parte seria um segundo critério que pode discordar dele. Falta de
cotação não é erro de preenchimento do colaborador (então não é
`DADO_INVALIDO`) e não deve impedir o cálculo das outras despesas (então não é
erro do arquivo). O valor em reais sai nulo porque ele não existe, pelo mesmo
motivo da AMB-023. Nulo e vazio seguem a AMB-022, e a comparação segue a
AMB-014.
**Regra afetada:** RN-003, RN-017

### AMB-037 — Arredondamento na conversão

**Texto original do RH (v4):** "Uma despesa em EUR é convertida antes de ser
comparada ao limite."
**O que não está claro:** arredonda o valor original e depois o convertido, ou
só uma vez, no fim? Com que regra?
**Decisão:** o valor original é arredondado para centavos (RN-001). O produto
pela taxa é arredondado de novo, com a mesma regra (meio para o par).
**Justificativa:** o valor original arredondado é o que aparece na saída, e a
conta `valor_original × taxa` tem de fechar com o que o leitor vê. Usar a
mesma regra de desempate evita dois critérios de arredondamento no sistema.
**Regra afetada:** RN-001, RN-017

### AMB-038 — Nota fiscal e duplicata em moeda estrangeira

**Texto original do RH (v4):** "Os limites da política são sempre em BRL."
**O que não está claro:** (1) o limiar de nota fiscal ("acima de R$ 100")
compara o valor em reais ou na moeda original? (2) Duas despesas duplicadas
são comparadas pelo valor original ou pelo convertido?
**Decisão:** (1) em reais, depois da conversão. (2) pela mesma moeda e pelo
mesmo valor original.
**Justificativa:** (1) o limiar é um limite da política, e a v4 diz que os
limites são em reais. Comparar 40 USD com 100 deixaria sem nota um gasto de
R$ 220. (2) A cópia de um lançamento repete a moeda e o valor digitados. Duas
despesas em moedas diferentes que por acaso dão o mesmo valor em reais não
são o mesmo lançamento.
**Regra afetada:** RN-007, RN-008

### AMB-039 — Em que etapa entra a falta de cotação

**Texto original do RH (v4):** a política não fala do assunto.
**O que não está claro:** uma despesa em moeda sem cotação que também está
fora do período ou tem categoria não reembolsável: qual motivo prevalece?
**Decisão:** a conversão é calculada no início, mas a recusa por falta de
cotação é a etapa 6, depois de período e categoria. Uma despesa fora do
período continua `FORA_DO_PERIODO`.
**Justificativa:** decisão do usuário: "a regra de câmbio não deve alterar"
o funcionamento do período. Período e categoria dizem se a despesa poderia
ser paga de qualquer jeito. A falta de cotação só importa para despesas que
poderiam ser pagas. Assim, os motivos de antes da v4 não mudam.
**Regra afetada:** RN-017, seção 8

### AMB-040 — Qual valor dispara a aprovação manual

**Texto original do RH (v4):** "Itens cujo valor reembolsável passe de R$ 500
não são mais aprovados automaticamente."
**O que não está claro:** (1) "passe de" é > ou ≥? (2) O valor é o
reembolsável (depois dos limites) ou o solicitado? (3) O limiar varia por
centro de custo?
**Decisão:** (1) estritamente maior, como na AMB-004. (2) o reembolsável, em
reais, depois dos limites. (3) não, é fixo em R$ 500,00, porque a tabela do
financeiro não o traz.
**Justificativa:** decisão do usuário para (2), seguindo o texto do RH:
"valor reembolsável". O gestor aprova o que a empresa vai pagar, e um pedido
alto cortado para um valor pequeno pelo limite não precisa de aprovação.
**Regra afetada:** RN-018

### AMB-041 — Como o item pendente aparece na saída

**Texto original do RH (v4):** "Eles entram em estado de pendência aguardando
aprovação do gestor. O resultado deixa de ser apenas um valor: cada item passa
a ter um estado."
**O que não está claro:** o item pendente mostra algum valor? Soma no total a
reembolsar? Consome o limite do dia enquanto espera?
**Decisão:** status `PENDENTE`, código `REQUER_APROVACAO`. `valor_reembolsavel`
mostra o valor calculado. O item consome o limite do dia e gera dia de viagem
(se for hospedagem), mas fica fora do `total_reembolsavel`. O resumo ganha
`pendentes` e `total_pendente`.
**Justificativa:** decisão do usuário. O gestor precisa ver quanto vai
aprovar. Somar o pendente no total a reembolsar misturaria valor aprovado com
valor que ainda depende de decisão. Não consumir o limite exigiria
reprocessar depois da aprovação, e o sistema não guarda histórico entre
execuções (seção 3).
**Regra afetada:** RN-011, RN-014, RN-018

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
| Fornecedor numérico | mesma data/categoria/valor, `123` vs `"123"` | 1ª segue; 2ª RECUSADO `DUPLICATA` | RN-003, RN-007 |
| Fornecedor nulo | mesma data/categoria/valor, `null` vs ausente | 1ª segue; 2ª RECUSADO `DUPLICATA` | RN-003, RN-007 |
| Diárias na descrição | hospedagem "Hotel Rio - 2 diarias", 480,00 | N = 2, 240,00 por noite, `limite_diario_aplicado` 250,00 (por diária) → APROVADO 480,00 | RN-012 |
| Diárias com acento e maiúscula | "3 Diárias" | N = 3 | RN-012 |
| Duas hospedagens na mesma noite | `h1` 14/07 "2 diarias" 480,00; depois `h2` 15/07 "1 diaria" 200,00 | `h1` APROVADO 480,00 (240 + 240); `h2` PARCIAL 10,00 | RN-012 |
| Diária média acima do limite | 14/07 "2 diarias" 600,00 | 300 + 300 → 250 + 250 → PARCIAL 500,00 | RN-012 |
| Divisão com centavos | 14/07 "3 diarias" 100,00 | parcelas 33,34 / 33,33 / 33,33 → APROVADO 100,00 | RN-012 |
| Noite fora do período | 31/07 (= `fim`) "2 diarias" 400,00 | noites 31/07 e 01/08 contam → APROVADO 400,00 | RN-012, RN-005 |
| Número que não é diária | "Hotel 5 estrelas", 300,00 | N = 1 → PARCIAL 250,00 | RN-012 |
| Descrição sem número | "Pousada", 300,00 | N = 1 → PARCIAL 250,00 | RN-012 |
| Zero diárias | "0 diarias", 100,00 | N = 1 → APROVADO 100,00 | RN-012 |
| Hospedagem sem descrição | `descricao` ausente ou nula, 300,00 | uma única diária, N = 1 → PARCIAL 250,00 | RN-012 |
| Descrição não textual | hospedagem, `"descricao": 2`, 300,00 | aceita, vira `"2"`, N = 1 → PARCIAL 250,00 | RN-003, RN-012 |
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
| `colaborador.id` vazio | `"colaborador": {"id": "  "}` | erro que cita `colaborador.id`, nenhuma saída gerada | RN-015 |
| `periodo.inicio` não textual | `"inicio": 20260701` | erro que cita `periodo.inicio`, nenhuma saída gerada | RN-015 |
| Arquivo que não é objeto | conteúdo `[]` | erro, nenhuma saída gerada | RN-015 |
| Centro de custo sem entrada na tabela | `CC-SUPORTE-N2`, alimentação 65,00 | tabela padrão, `politica.tabela` `"padrao"` → PARCIAL 60,00 | RN-016 |
| Colaborador sem centro de custo | `centro_custo` ausente, alimentação 65,00 | tabela padrão → PARCIAL 60,00 | RN-016 |
| Centro de custo com outra grafia | `" cc-comercial "`, alimentação 85,00 | tabela do CC-COMERCIAL → APROVADO 85,00 | RN-016 |
| Centro de custo não textual | `"centro_custo": 42` | erro que cita `colaborador.centro_custo`, nenhuma saída gerada | RN-015 |
| Categoria herdada do padrão | CC-ADM, hospedagem 1 diária 300,00 | limite 250,00 do padrão → PARCIAL 250,00 | RN-016 |
| Categoria só em outro centro de custo | tabela padrão, `representacao` 190,00 | RECUSADO `CATEGORIA_NAO_REEMBOLSAVEL` | RN-006, RN-016 |
| Categoria nova no centro de custo | CC-COMERCIAL, `representacao` 340,00 com NF | PARCIAL 300,00 | RN-009, RN-016 |
| Categoria com limite zero | CC-ENG-PLATAFORMA, hospedagem 200,00 com NF | RECUSADO `CATEGORIA_NAO_REEMBOLSAVEL`, descrição cita o centro de custo | RN-006 |
| Limite zero não gera viagem | CC-ENG-PLATAFORMA, hospedagem + alimentação 80,00, mesma data | hospedagem RECUSADO; alimentação PARCIAL 75,00 (sem ampliação) | RN-006, RN-011 |
| Limite zero vem antes da nota fiscal | CC-ENG-PLATAFORMA, hospedagem 690,00 sem NF | RECUSADO `CATEGORIA_NAO_REEMBOLSAVEL` (não `NOTA_FISCAL_AUSENTE`) | RN-006, seção 8 |
| Representação em dia de viagem | CC-COMERCIAL, hospedagem elegível + `representacao` 420,00 com NF, mesma data | limite 450,00 → APROVADO 420,00 | RN-011 |
| Tabela de limites inválida | limite negativo na tabela | erro que cita a tabela de limites, nenhuma saída gerada | RN-015, RN-016 |
| Arquivo de câmbio ausente | — | erro que cita o arquivo de câmbio, nenhuma saída gerada | RN-015, RN-017 |
| Moeda ausente | sem `moeda`, 45,00 | BRL, `taxa_cambio` 1, `valor_solicitado` 45,00 | RN-003, RN-017 |
| Moeda nula ou vazia | `"moeda": null` / `""` | vale BRL | RN-003 |
| Moeda em minúsculas | `"moeda": " eur "` | tratada como EUR | RN-003, RN-017 |
| Moeda não textual | `"moeda": 978` | RECUSADO `DADO_INVALIDO`, `moeda` sai `978` | RN-003 |
| Moeda fora do câmbio | `"moeda": "EURO"` | RECUSADO `CAMBIO_INDISPONIVEL` (não `DADO_INVALIDO`), `moeda` sai `"EURO"` | RN-003, RN-017 |
| Conversão em dia útil | 22,00 EUR em 2026-07-14 | taxa 5,93, `data_cotacao` 2026-07-14, `valor_solicitado` 130,46 | RN-017 |
| Conversão no fim de semana | 30,00 EUR em 2026-07-18 (sábado) | taxa 5,96 de 2026-07-17, `valor_solicitado` 178,80 | RN-017 |
| Antes da primeira cotação | 10,00 EUR em 2026-07-10 | RECUSADO `CAMBIO_INDISPONIVEL`, `valor_solicitado` nulo | RN-017 |
| Moeda sem cotação | 55,00 GBP | RECUSADO `CAMBIO_INDISPONIVEL`, `valor_solicitado` nulo, fora do `total_solicitado` | RN-017, RN-014 |
| Estrangeira fora do período | 10,00 EUR em 2026-06-30, período de julho | RECUSADO `FORA_DO_PERIODO` (não `CAMBIO_INDISPONIVEL`) | RN-005, RN-017 |
| Estrangeira negativa sem cotação | −10,00 GBP | RECUSADO `VALOR_NAO_POSITIVO` | RN-004, RN-017 |
| Arredondamento da conversão | 10,05 USD em 2026-07-13 (× 5,42) | 54,471 → `valor_solicitado` 54,47 | RN-001, RN-017 |
| Nota fiscal sobre o valor convertido | 40,00 USD em 2026-07-20 (× 5,50), sem NF | R$ 220,00 → RECUSADO `NOTA_FISCAL_AUSENTE` | RN-008, RN-017 |
| Estrangeira abaixo do limiar de NF | 14,50 EUR em 2026-07-15 (× 5,88), sem NF | R$ 85,26, não exige NF → segue para o limite | RN-008, RN-017 |
| Mesmo valor em moedas diferentes | mesma data/categoria/fornecedor, 20,00 EUR e 20,00 USD | não são duplicatas | RN-007 |
| BRL explícito e implícito | mesma data/categoria/fornecedor/valor, sem `moeda` e `"BRL"` | 1ª segue; 2ª RECUSADO `DUPLICATA` | RN-007 |
| Reembolsável exatamente 500,00 | CC-COMERCIAL, hospedagem "2 diarias" 500,00 | APROVADO 500,00 (não fica pendente) | RN-018 |
| Reembolsável acima de 500,00 | CC-COMERCIAL, hospedagem "2 diarias" 500,02 | PENDENTE `REQUER_APROVACAO`, `valor_reembolsavel` 500,02 | RN-018 |
| Solicitado alto cortado pelo limite | tabela padrão, hospedagem 1 diária 1.200,00 | PARCIAL 250,00 (não fica pendente) | RN-018 |
| Pendente com corte de limite | CC-COMERCIAL, hospedagem "2 diarias" 1.000,00 | 500 + 500 → 400 + 400 → PENDENTE 800,00, descrição cita o corte de 200,00 | RN-012, RN-018 |
| Pendente consome o limite | CC-COMERCIAL, hospedagem "2 diarias" 800,00 em D; depois hospedagem 1 diária 100,00 em D | 1ª PENDENTE 800,00; 2ª RECUSADO `LIMITE_DIARIO_ESGOTADO` | RN-010, RN-018 |
| Hospedagem pendente gera viagem | CC-COMERCIAL, hospedagem "3 noites" 1.200,00 em D; alimentação 95,00 em D+1 | hospedagem PENDENTE; alimentação APROVADO 95,00 (limite 135,00) | RN-011, RN-018 |
| Pendente fora do total reembolsável | um item PENDENTE 1.200,00 e um APROVADO 88,00 | `total_reembolsavel` 88,00, `total_pendente` 1.200,00, `pendentes` 1 | RN-014, RN-018 |

## 8. Ordem de aplicação das regras

Cada despesa passa pelas etapas abaixo, em ordem. **A primeira etapa que recusa
a despesa define o motivo e encerra a avaliação dela.** Uma despesa recusada em
qualquer etapa não consome limite diário.

Antes de tudo, uma vez por execução, é montada a **tabela aplicável** ao
colaborador (RN-016).

1. **Arredondamento, normalização e conversão** (RN-001, RN-002, RN-017). A
   conversão para reais é calculada aqui quando há cotação. A falta de
   cotação ainda não recusa a despesa.
2. **Validação dos dados** (RN-003) → `DADO_INVALIDO`.
3. **Valor não positivo** (RN-004) → `VALOR_NAO_POSITIVO`.
4. **Período** (RN-005) → `FORA_DO_PERIODO`.
5. **Categoria** (RN-006, na tabela aplicável) → `CATEGORIA_NAO_REEMBOLSAVEL`.
6. **Câmbio** (RN-017) → `CAMBIO_INDISPONIVEL`.
7. **Duplicata** (RN-007) → `DUPLICATA`. Só compara despesas que passaram pelas
   etapas 1 a 6.
8. **Nota fiscal** (RN-008, sobre o valor em reais) → `NOTA_FISCAL_AUSENTE`.
9. **Dias de viagem** (RN-011): definidos pelas hospedagens que sobraram
   depois da etapa 8.
10. **Limite diário** (RN-009, RN-010, RN-012), nas despesas que sobraram.
    Antes, cada hospedagem é dividida em parcelas por noite (RN-012). As
    despesas e parcelas são agrupadas por (data, categoria) e processadas na
    ordem da entrada, com o limite ampliado nos dias de viagem.
11. **Aprovação manual** (RN-018): um item com reembolsável acima de R$ 500,00
    passa a PENDENTE/`REQUER_APROVACAO`. Essa etapa não muda nenhum valor e
    não devolve saldo ao limite.

Por que esta ordem: primeiro vêm as regras que tratam de **elegibilidade**
(etapas 2 a 8), e só depois as regras de **quanto pagar** (etapas 9 e 10) e
de **quem aprova** (etapa 11). Os dias de viagem são definidos depois da
elegibilidade para que uma hospedagem recusada não amplie limites. Se o limite
fosse aplicado antes, uma despesa inelegível consumiria saldo do dia e
prejudicaria uma despesa legítima. A duplicata vem antes da nota fiscal para
que a segunda cópia de um gasto seja sempre identificada como duplicata, não
importa o que diga o indicador de nota. O câmbio vem depois de período e
categoria para que a falta de cotação não troque o motivo de uma despesa que
não seria paga de qualquer jeito (AMB-039), e antes da nota fiscal e do
limite, que precisam do valor em reais. A aprovação manual vem por último
porque depende do reembolsável final.

## 9. Critérios de aceite

O sistema está pronto quando:

- [ ] Com a tabela de limites `exemplos/envelope/politica-v4.json` e as taxas
      `exemplos/envelope/cambio.json`, processar `exemplos/despesas-exemplo.json`,
      `exemplos/envelope/despesas-envelope.json` e
      `exemplos/envelope/despesas-envelope-cc-desconhecido.json` produz
      exatamente os resultados por item das tabelas abaixo.
- [ ] Mudar um limite na tabela de limites muda o resultado sem mudar o
      sistema (RN-016).
- [ ] Cada linha da tabela da seção 7 tem um teste automatizado que passa.
- [ ] Cada `RN-NNN` tem ao menos um teste automatizado cujo nome cita o ID.
- [ ] A saída sempre respeita o schema da seção 4: um item por despesa, na
      ordem de entrada, com um código de motivo válido.
- [ ] Executar duas vezes com a mesma entrada gera saídas idênticas.
- [ ] Uma entrada inválida (RN-015) gera erro com mensagem e nenhum arquivo de
      saída.

**Resultado esperado para `exemplos/despesas-exemplo.json`** (colaborador do
`CC-ENG-PLATAFORMA`: alimentação 75,00, transporte 80,00, hospedagem não
reembolsável; tudo em BRL):

| id | solicitado | reembolsável | status | código |
|---|---|---|---|---|
| d-001 | 72,50 | 72,50 | APROVADO | `APROVADO_INTEGRAL` |
| d-002 | 38,00 | 2,50 | PARCIAL | `LIMITE_DIARIO_EXCEDIDO` |
| d-003 | 100,00 | 80,00 | PARCIAL | `LIMITE_DIARIO_EXCEDIDO` |
| d-004 | 100,01 | 0,00 | RECUSADO | `NOTA_FISCAL_AUSENTE` |
| d-005 | 89,00 | 0,00 | RECUSADO | `CATEGORIA_NAO_REEMBOLSAVEL` |
| d-006 | 54,90 | 54,90 | APROVADO | `APROVADO_INTEGRAL` |
| d-007 | 54,90 | 0,00 | RECUSADO | `DUPLICATA` |
| d-008 | 41,00 | 0,00 | RECUSADO | `FORA_DO_PERIODO` |
| d-009 | −45,00 | 0,00 | RECUSADO | `VALOR_NAO_POSITIVO` |
| d-010 | 480,00 | 0,00 | RECUSADO | `CATEGORIA_NAO_REEMBOLSAVEL` |
| d-011 | 33,33 | 33,33 | APROVADO | `APROVADO_INTEGRAL` |
| d-012 | 47,20 | 47,20 | APROVADO | `APROVADO_INTEGRAL` |
| d-013 | 690,00 | 0,00 | RECUSADO | `CATEGORIA_NAO_REEMBOLSAVEL` |
| d-014 | 61,00 | 61,00 | APROVADO | `APROVADO_INTEGRAL` |

Resumo esperado: `politica.tabela` "CC-ENG-PLATAFORMA" · `total_solicitado`
1.861,84 · `total_reembolsavel` 351,43 · `total_pendente` 0,00 ·
`total_nao_reembolsado` 1.510,41 · aprovados 5 · parciais 2 · recusados 7 ·
pendentes 0.

As duas hospedagens (`d-010` e `d-013`) são recusadas na etapa de categoria,
então o exemplo não tem dias de viagem, e `d-013` não chega à nota fiscal.
`d-011` tem limite de 75,00. *(Na v1.3, com a política única v3, o resultado era
815,43 reembolsáveis: ver D-019 no `DECISIONS.md`.)*

**Resultado esperado para `exemplos/envelope/despesas-envelope.json`**
(`CC-COMERCIAL`: alimentação 90,00, transporte 150,00, hospedagem 400,00 por
noite, representação 300,00; dias de viagem 2026-07-22 a 24, pelas noites de
`e-007`):

| id | moeda | original | taxa (data) | solicitado | reembolsável | status | código |
|---|---|---|---|---|---|---|---|
| e-001 | BRL | 340,00 | 1 | 340,00 | 300,00 | PARCIAL | `LIMITE_DIARIO_EXCEDIDO` |
| e-002 | EUR | 22,00 | 5,93 (07-14) | 130,46 | 90,00 | PARCIAL | `LIMITE_DIARIO_EXCEDIDO` |
| e-003 | EUR | 14,50 | 5,88 (07-15) | 85,26 | 85,26 | APROVADO | `APROVADO_INTEGRAL` |
| e-004 | EUR | 30,00 | 5,96 (07-17) | 178,80 | 90,00 | PARCIAL | `LIMITE_DIARIO_EXCEDIDO` |
| e-005 | USD | 40,00 | 5,50 (07-20) | 220,00 | 0,00 | RECUSADO | `NOTA_FISCAL_AUSENTE` |
| e-006 | GBP | 55,00 | — | nulo | 0,00 | RECUSADO | `CAMBIO_INDISPONIVEL` |
| e-007 | BRL | 1.200,00 | 1 | 1.200,00 | 1.200,00 | PENDENTE | `REQUER_APROVACAO` |
| e-008 | BRL | 95,00 | 1 | 95,00 | 95,00 | APROVADO | `APROVADO_INTEGRAL` |
| e-009 | BRL | 120,00 | 1 | 120,00 | 0,00 | RECUSADO | `CATEGORIA_NAO_REEMBOLSAVEL` |
| e-010 | BRL | 88,00 | 1 | 88,00 | 88,00 | APROVADO | `APROVADO_INTEGRAL` |

Resumo esperado: `politica.tabela` "CC-COMERCIAL" · `total_solicitado`
2.457,52 · `total_reembolsavel` 748,26 · `total_pendente` 1.200,00 ·
`total_nao_reembolsado` 509,26 · aprovados 3 · parciais 3 · recusados 3 ·
pendentes 1.

`e-004` é de um sábado e usa a cotação de sexta. `e-007` são 400,00 por
noite, no limite, e fica pendente porque o reembolsável passa de 500,00. Como
continua elegível, torna 22 a 24/07 dias de viagem, e `e-008` (23/07) tem
limite de 135,00. `e-001` (13/07) não é dia de viagem.

**Resultado esperado para `exemplos/envelope/despesas-envelope-cc-desconhecido.json`**
(`CC-SUPORTE-N2`, sem entrada na tabela → tabela padrão; dia de viagem
2026-07-17, pela noite de `f-002`):

| id | moeda | original | taxa (data) | solicitado | reembolsável | status | código |
|---|---|---|---|---|---|---|---|
| f-001 | BRL | 58,00 | 1 | 58,00 | 58,00 | APROVADO | `APROVADO_INTEGRAL` |
| f-002 | BRL | 310,00 | 1 | 310,00 | 250,00 | PARCIAL | `LIMITE_DIARIO_EXCEDIDO` |
| f-003 | BRL | 190,00 | 1 | 190,00 | 0,00 | RECUSADO | `CATEGORIA_NAO_REEMBOLSAVEL` |
| f-004 | USD | 12,00 | 5,48 (07-21) | 65,76 | 65,76 | APROVADO | `APROVADO_INTEGRAL` |

Resumo esperado: `politica.tabela` "padrao" · `total_solicitado` 623,76 ·
`total_reembolsavel` 373,76 · `total_pendente` 0,00 · `total_nao_reembolsado`
250,00 · aprovados 2 · parciais 1 · recusados 1 · pendentes 0.

`f-003` (`representacao`) não está no padrão: só o CC-COMERCIAL a reembolsa.

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
- **Local fixo da política e do câmbio (AMB-028):** simula um serviço do
  financeiro. Quando esse serviço existir, a leitura dos arquivos deve ser
  trocada por ele, com registro em `DECISIONS.md`.
- **Cotação anterior sem limite de dias (AMB-035):** se o arquivo de câmbio
  ficar semanas sem cotação de uma moeda, a última taxa continua valendo. Um
  limite de defasagem pode ser acrescentado se o financeiro pedir.
- **Moedas sem centavos ou com 3 casas (JPY, KWD):** o valor original é
  arredondado para 2 casas como qualquer outro (RN-001). Com as moedas do
  arquivo atual (USD, EUR), isso não muda nada.
- **Sem histórico de política (AMB-034):** a execução usa a tabela vigente
  inteira. Reprocessar um mês antigo depois de uma mudança na tabela dá outro
  resultado.
- **Aprovação do gestor (AMB-041):** o sistema só marca o item como PENDENTE.
  A decisão do gestor, e o que acontece com o saldo do dia se ele recusar, fica
  fora do motor.
- **Limiar de R$ 500 fixo na spec (AMB-040):** se o financeiro passar a
  mantê-lo na tabela de limites, a RN-018 deve passar a lê-lo de lá.
