# Plano Técnico — Motor de Cálculo de Reembolso

**Versão:** 2.0 · **Baseado na spec:** 2.2 · **Branch:** `001-motor-reembolso` · **Data:** 2026-09-30

> Aqui mora o COMO. Este arquivo pode e deve falar de linguagem, biblioteca e
> arquitetura. O que ele **não** pode é introduzir regra de negócio nova — se
> apareceu uma, ela pertence à `spec.md`.

Artefatos de apoio: [`research.md`](research.md) (decisões R-01 a R-17, com
as alternativas descartadas), [`data-model.md`](data-model.md),
[`contracts/`](contracts/) (CLI, arquivos externos, schema da saída) e
[`quickstart.md`](quickstart.md).

**v1.0 a v1.2** (spec 1.0 a 1.3): ver D-015, D-017 e D-018. Plano da política
única v3, com os valores em constantes.

**v2.0** (spec 2.2, Política v4, D-019 a D-021): a política passa a vir de
fora (tabela por centro de custo), entram moeda estrangeira e aprovação
manual. Ao escrever este plano, três lacunas de regra foram levadas à spec
**antes** de qualquer decisão técnica (D-021: grafia da moeda no câmbio,
campos de conversão sem valor válido, formato dos arquivos externos). A
interface do CLI não muda.

---

## 0. Contexto técnico

| Item | Valor |
|---|---|
| Linguagem / runtime | TypeScript em Node **≥ 24**, com type stripping nativo, sem build (R-01) |
| Dependências de runtime | **nenhuma** (só a stdlib do Node) |
| Dependências de desenvolvimento | `typescript` (só typecheck), `vitest` 5, `ajv` (testes de contrato), `@types/node` |
| Armazenamento | nenhum banco. Lê a entrada e dois arquivos fixos (`dados/politica.json`, `dados/cambio.json`, R-11) e grava a saída |
| Testes | Vitest (`npm test`) |
| Plataforma | CLI multiplataforma (Windows/Linux/macOS) |
| Tipo de projeto | CLI única, com o núcleo em funções puras |
| Desempenho | irrelevante no volume esperado. Linear em despesas + diárias, mais uma busca binária de cotação por despesa estrangeira |
| Restrições | nada de float em dinheiro, taxa ou percentual (R-13). Saída determinística. Nenhuma saída parcial em erro |

## 0.1 Constitution Check

| Princípio | Como o plano cumpre | Status |
|---|---|---|
| I. Spec é a fonte da verdade | O plano não redefine regra. Onde faltou regra, a spec foi corrigida antes (D-015 na v1, D-021 na v4) | ✅ |
| II. Regra de negócio só na spec | Os valores da política saem do código e passam a vir da tabela (RN-016). Só o limiar de R$ 500, fixado pela spec (AMB-040), fica em `politica.ts`, com o ID ao lado. Comentário de código cita o ID e não explica a regra | ✅ |
| III. Ambiguidade registrada | As 3 lacunas da v4 viraram AMB-042 a AMB-044 antes do plano | ✅ |
| IV. Spec sem tecnologia | Local fixo, `Decimal`, índice de câmbio e nomes de módulo ficam aqui e no `research.md`. A spec só diz "local fixo" | ✅ |
| V. Rastreabilidade | Os nomes dos testes começam pelo ID (§6). O teste de rastreabilidade (R-10) passa a exigir RN-016 a RN-018 e os 41 casos de borda novos sem mudar de código | ✅ |
| VI. Nenhuma regra sem teste | Um arquivo de teste por RN (três novos) e um teste por linha da seção 7 | ✅ |
| VII. Mudança de spec registrada | D-021 registrada antes deste plano | ✅ |
| Restrição: dinheiro sem float | Centavos em `bigint`. Taxa e percentual em `Decimal` exato (R-13). Entrada, tabela e câmbio lidos pelo texto do número; saída por `JSON.rawJSON` | ✅ |
| Restrição: escopo | Nada além da spec: sem opção de CLI para os arquivos (AMB-028), sem histórico de política (AMB-034), sem executar a aprovação (§3) | ✅ |

**Reavaliação depois da Fase 1:** o modelo de dados e os contratos não criam
regra. `saida.schema.json` formaliza a seção 4 (inclusive a AMB-043 como
restrição `if/then`), e `arquivos-externos.md` só fixa o caminho e remete o
formato à spec. **Nenhuma violação.**

## 1. Stack

| Escolha | O quê | Por quê | O que descartei e por quê |
|---|---|---|---|
| Linguagem | TypeScript, Node ≥ 24, rodando `.ts` direto | stack do usuário. Sem build, não existe `dist/` desatualizado | `tsc`→`dist` e `tsx`: uma etapa ou uma dependência a mais para o mesmo resultado |
| Testes | Vitest 5 | escolha do usuário. Roda TS sem configuração | Jest: exige transformação de TS/ESM |
| Parsing/validação | `JSON.parse` com reviver `context.source` + validação escrita à mão, para a entrada **e** para os dois arquivos externos | o texto exato de cada número chega ao núcleo. As regras da RN-003, RN-016 e RN-017 são específicas demais para uma lib de schema, e a mensagem tem de citar arquivo e campo | `zod`/`ajv` em runtime (R-12) |
| Aritmética | **centavos em `bigint`** para dinheiro; **`Decimal` (`bigint` + escala)** para taxa e percentual; um único arredondamento meio-para-o-par (R-13) | exato de ponta a ponta, sem teto, um critério só de arredondamento (AMB-037) | float; `decimal.js` (dependência para duas contas) |

## 2. Arquitetura

```
entrada ──► io/json ──► io/entrada (RN-015) ─────────────► Entrada (+ centroCusto)
dados/politica.json ─► io/json ─► io/politica (RN-015/016) ► Politica
dados/cambio.json ───► io/json ─► io/cambio (RN-015/017) ──► Cambio (índice)
                     (caminhos em io/externos.ts, R-11)          │
          ┌──────────────────── núcleo (puro, sem E/S) ──────────┘
          ▼
   politica.ts       uma vez: TabelaAplicavel                   RN-016
   motor: passada 1, para cada despesa, na ordem
     despesa.ts      etapas 1-2   RN-001, RN-002, RN-003 (+ moeda)
     cambio.ts       etapa 1      RN-017 (conversão, sem recusar)
     elegibilidade.ts etapas 3-8  RN-004, RN-005, RN-006, RN-017, RN-007, RN-008
          ▼  elegíveis
   motor: passada 2
     viagem.ts       etapa 9      RN-011 (noites das `diaria` elegíveis)
     diarias.ts      etapa 10a    RN-012 (N e parcelas, em reais)
     limites.ts      etapa 10b    RN-009, RN-010 (+ ampliação pela tabela)
     motor.ts        etapa 11     RN-018 (troca o motivo; valores intactos)
          ▼
     motivos.ts RN-013 · resumo.ts RN-014 · status.ts (PENDENTE derivado)
          │
          ▼ Resultado (Centavos, Conversao, ecos brutos, politica)
io/saida (JSON.rawJSON) ─► cli grava o arquivo ─► exit 0
```

**Fronteiras:** só `src/cli.ts` e `src/io/` fazem E/S e conhecem JSON e
caminhos. `src/nucleo/` é feito de funções puras: recebe `Entrada`,
`Politica` e `Cambio` e devolve `Resultado`, sem ler relógio, disco nem
ambiente. A ordem da seção 8 vive **só** em `motor.ts`.

**O que muda em cada módulo** (para as tasks da v4):

| Módulo | v1 | v4 |
|---|---|---|
| `io/externos.ts` | — | **novo**: caminhos fixos (R-11) e leitura dos dois arquivos, com a mensagem que cita o arquivo |
| `io/politica.ts`, `io/cambio.ts` | — | **novos**: validação e conversão para `Politica` / `Cambio` (R-12, R-14) |
| `io/entrada.ts` | RN-015 | + `centro_custo` (tipo, vazio → `null`) |
| `io/saida.ts` | 10 campos por item | 14 campos na ordem da §4, bloco `politica`, resumo novo (R-17) |
| `cli.ts` | lê 1 arquivo | lê 3 (entrada → tabela → câmbio), mesma interface; resumo no stdout inclui o pendente |
| `nucleo/politica.ts` | constantes da v3 | `LIMIAR_APROVACAO` + montagem da `TabelaAplicavel` (RN-016) |
| `nucleo/decimal.ts` | — | **novo**: `Decimal`, `dividirMeioParaPar` (R-13) |
| `nucleo/dinheiro.ts` | `paraCentavos` | passa a usar `dividirMeioParaPar` |
| `nucleo/cambio.ts` | — | **novo**: busca da cotação e conversão (RN-017, R-14) |
| `nucleo/texto.ts` | `normalizar`, `normalizarFornecedor` | + `normalizarMoeda` |
| `nucleo/despesa.ts` | RN-003 | + `moeda` (RN-003, AMB-036), `valorOriginal`, `conversao` |
| `nucleo/elegibilidade.ts` | etapas 3-7, `POLITICA` | etapas 3-8 pela `TabelaAplicavel`; + câmbio (etapa 6); duplicata com moeda e valor original; NF sobre reais com `Decimal` |
| `nucleo/viagem.ts`, `diarias.ts` | `categoria === 'hospedagem'` | `periodicidade === 'diaria'` (R-15) |
| `nucleo/limites.ts` | `POLITICA`, `throw` se inexato | limite da tabela; ampliação por percentual, meio para o par (AMB-033) |
| `nucleo/motor.ts` | 2 passadas, etapas 1-9 | mesmas 2 passadas; etapas 1-11; recebe `Politica` e `Cambio` |
| `nucleo/motivos.ts` | 9 modelos | 11 modelos; conversão e CC nas descrições; nome de categoria com fallback (R-15) |
| `nucleo/status.ts`, `resumo.ts` | 3 status | + PENDENTE; totais pendentes (R-16) |
| `nucleo/tipos.ts` | `Categoria` fechada | tipos da v4 (`data-model.md`) |

Estrutura de pastas (novos na v4 marcados com `+`):

```
dados/
+ politica.json               # local fixo (R-11); cópia de exemplos/envelope/politica-v4.json
+ cambio.json                 # local fixo (R-11); cópia de exemplos/envelope/cambio.json
src/
  cli.ts                      # parseArgs, lê/grava arquivos, códigos de saída
  io/json.ts                  # parse com NumeroJson; serialização com rawJSON
  io/entrada.ts               # RN-015 → Entrada | ErroEntrada
+ io/externos.ts              # caminhos fixos e leitura dos dois arquivos
+ io/politica.ts              # RN-015/RN-016 → Politica
+ io/cambio.ts                # RN-015/RN-017 → Cambio (índice)
  io/saida.ts
  nucleo/
    tipos.ts  politica.ts  dinheiro.ts  datas.ts  texto.ts
  + decimal.ts  cambio.ts
    despesa.ts  elegibilidade.ts  viagem.ts  diarias.ts  limites.ts
    motivos.ts  resumo.ts  status.ts  motor.ts
tests/
  apoio.ts                    # + fixture: tabela e câmbio de exemplos/envelope/ (R-10)
  nucleo/rn-001 … rn-014      # um arquivo por RN (existentes, ajustados à v4)
+ nucleo/rn-016-politica-centro-custo.test.ts
+ nucleo/rn-017-cambio.test.ts
+ nucleo/rn-018-aprovacao.test.ts
  nucleo/politica.test.ts     # Infra › passa a testar decimal/tabela sem regra
  io/rn-015-entrada.test.ts   # + centro_custo e arquivos externos inválidos
  io/json.test.ts  io/saida.test.ts
  casos-de-borda.test.ts      # uma linha da seção 7 = um teste (121 linhas)
  exemplo.test.ts             # as três tabelas da seção 9
  contrato-saida.test.ts
  cli.test.ts                 # + cópia temporária com dados/ trocado (R-11)
  rastreabilidade.test.ts
```

## 3. Modelo de dados

Detalhado em [`data-model.md`](data-model.md). Resumo do que muda na v4:

- **Entram `Politica`, `Cambio` e `TabelaAplicavel`.** A tabela aplicável é
  montada uma vez (RN-016) e é a única fonte de limite, categoria reconhecida
  e periodicidade dentro do núcleo.
- **`Categoria` vira texto.** Uma categoria nova no arquivo
  (`representacao`) funciona sem mudar tipo nem código (R-15).
- **`Conversao | null`** junta `taxa`, `dataCotacao` e `valorSolicitado`. A
  AMB-043 (os três andam juntos) fica garantida pelo tipo (R-17).
- **O que não muda:** os estados tipados (`DespesaBruta` → `DespesaValida` →
  `DespesaElegivel` → alocada, com `Recusa` em qualquer etapa), as parcelas
  (DT-003) e o status derivado (agora com PENDENTE, R-16).

## 4. Como a política é representada

**Lida de fora, a cada execução** (RN-016, AMB-028). `io/politica.ts` valida
`dados/politica.json` e devolve `Politica`. `nucleo/politica.ts` monta a
`TabelaAplicavel` do colaborador:

```ts
// nucleo/politica.ts (esboço)
export const LIMIAR_APROVACAO = 500_00n; // RN-018, AMB-040 (estritamente maior)

export function tabelaAplicavel(politica: Politica, centroCusto: string | null): TabelaAplicavel;
// RN-016: sem CC ou sem entrada → padrão inteiro; com entrada → CC por cima do padrão;
// limite 0 do CC não herda (AMB-031).
```

Nenhum limite, limiar de nota fiscal ou percentual existe no código. O
`LIMIAR_APROVACAO` é o único número de política que resta, porque a spec o
fixa e a tabela não o traz (AMB-040). Se o financeiro passar a mantê-lo na
tabela (§10 da spec), ele sai daqui.

**Substitui** a decisão da v1 (constantes em `POLITICA`, "arquivo externo
descartado"). Aquela decisão já dizia que, se a mudança pedisse política
configurável, "a troca fica restrita a quem monta `POLITICA`". Foi o que
aconteceu: quem consumia `POLITICA` (elegibilidade, limites, `tipos.ts`) passa
a receber a `TabelaAplicavel`.

## 5. Decisões técnicas

### DT-001 — Dinheiro em centavos `bigint`, lido do texto e escrito cru

**Contexto:** a RN-001 exige meio para o par num ponto médio exato
(`10.005` → 10,00). O float `10.005` vale `10.00499…`, então não está no meio.
**Decisão:** o reviver do `JSON.parse` guarda o texto de todo número
(`NumeroJson`). `dinheiro.ts` converte texto (inclusive com expoente e com o
formato texto da RN-003) em centavos `bigint`, arredondando meio para o par
sobre os dígitos. A saída usa `JSON.rawJSON("45.00")`.
**Alternativa descartada:** `Math.round(valor * 100)` e `toFixed`, que
falham nos pontos médios; `decimal.js`, dependência sem ganho.
**Consequência:** fácil: exatidão garantida e testável por tabela. Difícil:
todo número do JSON chega embrulhado, e o núcleo nunca pode usar
`typeof x === 'number'`. **(v4)** A tabela e o câmbio herdam isso de graça, e
taxa e percentual ganham o `Decimal` (DT-007).

### DT-002 — Núcleo puro com a ordem da seção 8 num lugar só

**Contexto:** a seção 8 define 11 etapas em que a primeira recusa encerra a
avaliação. A duplicata depende do que passou das etapas anteriores, e os
dias de viagem dependem de todas as hospedagens elegíveis.
**Decisão:** `motor.ts` faz duas passadas. A **passada 1** percorre as
despesas na ordem e aplica as etapas 1 a 8 (validação, conversão e
elegibilidade), com o estado acumulado de ids vistos e chaves de duplicata.
Um `id` só entra nos ids vistos quando a despesa passa da etapa 2 (AMB-025).
A **passada 2** usa as elegíveis: dias de viagem (9), parcelas e saldos (10)
e aprovação manual (11).
**Alternativa descartada:** um pipeline genérico de "regras plugáveis".
**Consequência:** **(v4)** a nova etapa 6 (câmbio) entrou na cadeia `??` da
passada 1 como uma linha, e a etapa 11 como um passo no fim da passada 2.
Nenhuma etapa existente mudou de lugar relativo.

### DT-003 — Hospedagem entra no limite como parcelas

**Contexto:** a RN-012 divide a hospedagem por noite, e cada noite disputa o
limite daquela data com outras hospedagens, na ordem da entrada.
**Decisão:** toda despesa elegível vira uma lista de `Parcela`s (N para
periodicidade `diaria`, 1 para `dia`). `limites.ts` só conhece parcelas e
soma o que cada uma recebeu por `indiceDespesa`. **(v4)** A parcela é do
valor **em reais** (`conversao.valorSolicitado`).
**Alternativa descartada:** um caminho especial para hospedagem em
`limites.ts`.
**Consequência:** o `e-007` (3 × 400,00 no CC-COMERCIAL) e o caso "Pendente
consome o limite" saem sem código específico.

### DT-004 — Saída cria o arquivo só no fim

**Contexto:** a RN-015 exige que nenhum arquivo de saída seja gerado em erro,
agora também quando a tabela ou o câmbio são inválidos.
**Decisão:** ler e validar os **três** arquivos, calcular e serializar tudo em
memória. Só então chamar `writeFile`. Qualquer erro de leitura lança
`ErroEntrada`, que o `cli.ts` converte em `stderr` + código 1.
**Alternativa descartada:** gravar em streaming (deixaria saída parcial).
**Consequência:** o arquivo inteiro fica em memória, o que é irrelevante no
volume do problema.

### DT-005 — Teste de rastreabilidade automático

**Contexto:** a seção 9 exige teste para cada RN e para cada linha da seção 7.
**Decisão:** `rastreabilidade.test.ts` extrai da spec os IDs `### RN-NNN` e
os nomes da 1ª coluna da tabela da seção 7, e confere se cada um aparece em
algum título de teste (`RN-NNN ›` ou `Borda › <nome>`).
**Consequência:** **(v4)** confirmado na prática. Assim que a spec 2.x
entrou, a suíte passou a acusar RN-016 a RN-018 e os casos de borda novos sem
teste, sem nenhuma mudança no teste de rastreabilidade.

### DT-006 — Arquivos externos em local fixo, lidos só pela camada `io` (novo na v4)

**Contexto:** a v4 manda ler a política de fora (item A), a interface é fixa
(AMB-028), e o núcleo não pode fazer E/S.
**Decisão:** `io/externos.ts` conhece os caminhos (`dados/*.json`, resolvidos
pelo código, R-11) e lê os arquivos. `io/politica.ts` e `io/cambio.ts`
validam (R-12). O núcleo recebe `Politica` e `Cambio` já tipados, como
recebe `Entrada`. A `TabelaAplicavel` é montada no núcleo, porque é regra
(RN-016), e não formato de arquivo.
**Alternativa descartada:** o núcleo ler os arquivos (quebra a pureza e
obriga todo teste de regra a tocar em disco); montar a tabela aplicável na
camada `io` (regra de negócio fora do núcleo).
**Consequência:** fácil: trocar o local fixo por um serviço (§10 da spec,
AMB-028) é trocar só `io/externos.ts`. Os testes de regra passam `Politica` e
`Cambio` em memória. Difícil: o teste de CLI com outra tabela precisa copiar
o projeto para uma pasta temporária (R-11).

### DT-007 — Conversão calculada na etapa 1, recusa na etapa 6 (novo na v4)

**Contexto:** a seção 8 manda calcular a conversão no início (etapa 1), para
que período, nota fiscal e limite usem reais, mas recusar por falta de
cotação só na etapa 6 (AMB-039). A AMB-043 manda os três campos de conversão
saírem juntos.
**Decisão:** `nucleo/cambio.ts` expõe `converter(valorOriginal, moeda, data,
cambio): Conversao | null`, chamada por `despesa.ts` durante a etapa 1 (e
também para os itens `DADO_INVALIDO` com `valor` numérico, seção 4). A etapa 6
de `elegibilidade.ts` só olha se `conversao` é `null`. A conta usa `Decimal`
e `dividirMeioParaPar` (R-13).
**Alternativa descartada:** converter só na etapa 6 (período e nota fiscal
precisariam de dois caminhos, um com e outro sem reais); três campos opcionais
soltos (permitiria taxa sem valor, contra a AMB-043).
**Consequência:** um item recusado antes da etapa 6 já sai com a conversão
correta, ou com os três nulos se não há cotação (seção 4, "Estrangeira fora do
período").

### DT-008 — Aprovação manual como troca de motivo depois do limite (novo na v4)

**Contexto:** a RN-018 diz que o item PENDENTE consome limite, gera viagem e
mantém o valor calculado. Só o status e o motivo mudam.
**Decisão:** a etapa 11 é um `map` sobre as alocações da etapa 10: se
`reembolsável > LIMIAR_APROVACAO`, o motivo vira `REQUER_APROVACAO`, com os
detalhes do limite (para citar o corte). O status é derivado (R-16), então
não há campo a atualizar.
**Alternativa descartada:** tirar o PENDENTE da alocação (devolveria saldo,
contra a RN-018); decidir a pendência dentro de `limites.ts` (misturaria "quanto
pagar" com "quem aprova", duas etapas da seção 8).
**Consequência:** a hospedagem PENDENTE gera dias de viagem sem código
especial, porque a etapa 9 vem antes da 11.

## 6. Estratégia de testes

- **Nível:** ~80% testes do núcleo em memória (uma função ou o `motor`
  com despesas montadas no teste); ~15% ponta a ponta do motor (os três
  exemplos, contrato); ~5% CLI por processo filho (sucesso, RN-015,
  determinismo, códigos de saída, local fixo).
- **Fixture da v4 (R-10):** `tests/apoio.ts` carrega
  `exemplos/envelope/politica-v4.json` e `exemplos/envelope/cambio.json` uma
  vez e usa como padrão em `entrada()`/`rodar()`, com a opção de passar um
  centro de custo, outra tabela ou outro câmbio. Sem `centro_custo` e sem
  `moeda`, a despesa usa a tabela padrão e BRL, então **os testes da v1
  continuam valendo sem mudar a expectativa** (RN-009: "os casos de borda que
  não citam centro de custo usam a tabela padrão").
- **Cada `RN-NNN` tem teste?** Sim, **exatamente um arquivo por RN**,
  `rn-0NN-<tema>.test.ts` (em `tests/nucleo/`, ou em `tests/io/` para a
  RN-015), com `describe('RN-0NN — <título da spec>')`. Na v4 entram
  `rn-016-politica-centro-custo`, `rn-017-cambio` e `rn-018-aprovacao`. Os
  aceites de RN que mudaram na spec 2.x (RN-001, RN-002, RN-003, RN-004,
  RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-014, RN-015)
  ganham testes nos arquivos que já existem. Os aceites da validação dos
  arquivos externos (tabela e câmbio inválidos) ficam em
  `io/rn-015-entrada.test.ts`, com título `RN-015 › ...`, porque a
  consequência é a da RN-015 (execução abortada).
- **Casos de borda da seção 7:** `casos-de-borda.test.ts`, com um `it` por
  linha da tabela e o título **idêntico** à coluna "Caso". Os que citam o
  arquivo externo (tabela inválida, tabela sem versão, câmbio ausente) testam
  a função de `io/` com o texto do arquivo; o de câmbio ausente também roda no
  CLI. "Moeda repetida no câmbio" e "Moeda minúscula no câmbio" montam o
  câmbio a partir do texto (para exercitar a ordem das chaves, R-14) e rodam o
  motor.
- **Nomenclatura:** `RN-017 › e-004 (30,00 EUR no sábado 18/07) → taxa 5,96 de 17/07, R$ 178,80`.
- **Exemplos oficiais:** `exemplo.test.ts` compara item a item com as **três**
  tabelas da seção 9 e os três resumos, com a tabela e o câmbio de
  `exemplos/envelope/` (o critério da §9 cita esses arquivos).
- **Local fixo e "sem mudar o sistema" (§9):** `cli.test.ts` copia `src/`,
  `dados/` e `package.json` para uma pasta temporária, troca
  `dados/politica.json` (um limite) e confere que o resultado muda. Também:
  câmbio ausente e tabela inválida → código 1, nenhuma saída; CLI chamado de
  outra pasta lê o mesmo `dados/`.

## 7. Riscos

| Risco | Probabilidade | O que faço se acontecer |
|---|---|---|
| O financeiro troca `dados/politica.json` por um arquivo com campo novo ou formato diferente | média | a validação (R-12, AMB-044) aborta com mensagem que cita o campo. Se o campo novo for regra (ex.: limiar de aprovação na tabela, §10), levar à spec antes |
| `dados/` divergir de `exemplos/envelope/` sem ninguém perceber | média | os testes de regra e dos exemplos não leem `dados/` (R-10). O quickstart manda conferir com `git status dados/`. O README explica o papel de cada pasta |
| Percentual de viagem com muitas casas (ex.: 33,333…) | baixa | `Decimal` exato + meio para o par (AMB-033). Coberto por teste de `decimal.ts` |
| Categoria nova no arquivo sem nome bonito na descrição | alta | fallback para a chave (R-15). A descrição é orientativa (§4) |
| Moeda com 0 ou 3 casas (JPY, KWD) | baixa | a spec já decide: arredonda para 2 casas (§10). Nada a fazer no código |
| `JSON.rawJSON` ou `context.source` indisponível no Node do avaliador | baixa | `engines: node >= 24` no `package.json` + verificação no início do `cli.ts` com mensagem clara |
| TypeScript 7 incompatível com `erasableSyntaxOnly`/`allowImportingTsExtensions` | baixa | fixar `typescript@5.9` (só afeta o typecheck, não a execução) |
| `ajv` e `multipleOf: 0.01` com float dão falso negativo (`0.07`) | média | `multipleOfPrecision: 2` na instância de teste |
| `"999999 diarias"` gera ~1M de parcelas | baixa | aceitável. Se virar problema, levar à spec um teto de N |

Riscos da v1 que **se resolveram** na v4: "limite ampliado com centavos
fracionários" (a AMB-033 definiu o arredondamento; o `throw` de `limites.ts`
sai) e "mudança do Dia 2 altera um valor da política" (a política saiu do
código).

## 8. O que a arquitetura absorveu e o que resistiu (para o relatório)

**Absorveu sem mudança de forma:**
- Etapa nova de câmbio: uma linha na cadeia de etapas da passada 1 (DT-002).
- Hospedagem por noite no CC-COMERCIAL, `e-007` e "pendente consome o
  limite": o caminho de parcelas (DT-003) já resolvia.
- Leitura exata de limites, taxas e percentuais: o `NumeroJson` (DT-001).
- PENDENTE: o status já era derivado, então foi uma condição a mais em
  `statusDe` (R-16).
- Os testes da v1: a tabela padrão da v4 tem os valores da v3, e a fixture
  padrão os mantém verdes.
- A rastreabilidade (DT-005) passou a cobrar os testes novos sozinha.

**Resistiu (onde o custo está):**
- `Categoria` como união fechada, derivada das chaves de `POLITICA`: estava
  em `tipos.ts`, `elegibilidade.ts`, `limites.ts`, `motivos.ts` e no
  `tests/apoio.ts`. Virou texto + `TabelaAplicavel` (R-15).
- `POLITICA` importada direto por quem calculava: cada consumidor passou a
  receber a tabela como parâmetro.
- `valorSolicitado` era ao mesmo tempo "o valor da entrada" e "o valor em
  reais". Separar em `valorOriginal` + `Conversao` toca validação,
  duplicata, nota fiscal, parcelas, resumo e saída.
- A saída ganhou quatro campos por item e o bloco `politica`: schema,
  `io/saida.ts` e o teste de contrato.
