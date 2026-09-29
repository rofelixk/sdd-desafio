# Plano Técnico — Motor de Cálculo de Reembolso

**Versão:** 1.2 · **Baseado na spec:** 1.3 · **Branch:** `001-motor-reembolso` · **Data:** 2026-09-29

> Aqui mora o COMO. Este arquivo pode e deve falar de linguagem, biblioteca e
> arquitetura. O que ele **não** pode é introduzir regra de negócio nova — se
> apareceu uma, ela pertence à `spec.md`.

Artefatos de apoio: [`research.md`](research.md) (decisões R-01 a R-10, com
as alternativas descartadas), [`data-model.md`](data-model.md),
[`contracts/`](contracts/) e [`quickstart.md`](quickstart.md).

Ao escrever este plano, três lacunas de regra foram encontradas e levadas à
spec **antes** de qualquer decisão técnica (DECISIONS D-015: eco de item
inválido, `id` normalizado e primeira ocorrência das diárias).

**v1.1:** ajuste à spec 1.2 (D-017, AMB-025). O conjunto de ids vistos só
recebe o `id` de despesas que passaram pela validação (etapa 2). Nenhuma
decisão técnica mudou.

**v1.2:** ajuste à spec 1.3 (D-018, AMB-026, AMB-027). `texto.ts` ganha a
conversão de `fornecedor`/`descricao` de qualquer tipo para texto, e
`io/entrada.ts` aplica à RN-015 o critério de ausente da RN-003. Os testes
passam a ter **um arquivo por RN**: os testes do motor em memória vão para o
arquivo da RN que verificam, e não existe `motor.test.ts`.

---

## 0. Contexto técnico

| Item | Valor |
|---|---|
| Linguagem / runtime | TypeScript em Node **≥ 24**, com type stripping nativo, sem build (R-01) |
| Dependências de runtime | **nenhuma** (só a stdlib do Node) |
| Dependências de desenvolvimento | `typescript` (só typecheck), `vitest` 5, `ajv` (testes de contrato), `@types/node` |
| Armazenamento | nenhum. Um arquivo entra e um arquivo sai |
| Testes | Vitest (`npm test`) |
| Plataforma | CLI multiplataforma (Windows/Linux/macOS) |
| Tipo de projeto | CLI única, com o núcleo em funções puras |
| Desempenho | irrelevante no volume esperado. O custo é linear no número de despesas + diárias |
| Restrições | nada de float em dinheiro. Saída determinística. Nenhuma saída parcial em erro |

## 0.1 Constitution Check

| Princípio | Como o plano cumpre | Status |
|---|---|---|
| I. Spec é a fonte da verdade | O plano não redefine regra. Onde faltou regra, a spec foi corrigida antes (D-015) | ✅ |
| II. Regra de negócio só na spec | Os valores da política ficam num módulo só (§4), que reproduz a RN-009, a RN-008 e a RN-011, com o ID ao lado de cada valor. Comentário de código cita o ID e não explica a regra | ✅ |
| III. Ambiguidade registrada | 3 lacunas viraram AMB-023, AMB-024 e um ajuste na AMB-008 antes do plano | ✅ |
| IV. Spec sem tecnologia | Tudo o que é técnico ficou neste arquivo e no `research.md`. A spec continua sem nome de tecnologia | ✅ |
| V. Rastreabilidade | Os nomes dos testes começam pelo ID (§6). Um teste de rastreabilidade lê a spec (R-10) | ✅ |
| VI. Nenhuma regra sem teste | Um teste por RN e um por linha da seção 7, verificado automaticamente | ✅ |
| VII. Mudança de spec registrada | D-015 registrada antes deste plano | ✅ |
| Restrição: dinheiro sem float | Centavos em `bigint`. A entrada é lida pelo texto do número e a saída é emitida por `JSON.rawJSON` (R-02 a R-04) | ✅ |

**Reavaliação depois da Fase 1:** o modelo de dados e os contratos não criam
regra. O `saida.schema.json` só formaliza a seção 4. **Nenhuma violação.**

## 1. Stack

| Escolha | O quê | Por quê | O que descartei e por quê |
|---|---|---|---|
| Linguagem | TypeScript, Node ≥ 24, rodando `.ts` direto | stack do usuário. Sem build, não existe `dist/` desatualizado | `tsc`→`dist` e `tsx`: uma etapa ou uma dependência a mais para o mesmo resultado |
| Testes | Vitest 5 | escolha do usuário. Roda TS sem configuração | Jest: exige transformação de TS/ESM |
| Parsing/validação | `JSON.parse` com reviver `context.source` + validação escrita à mão | o texto exato de cada número chega ao núcleo. A RN-003 tem regras específicas demais para uma lib de schema | `zod`/`ajv` na entrada, porque traduzir os erros para a RN-003 dá mais código que escrevê-la; `lossless-json` duplica o que o runtime já faz |
| Aritmética monetária | **centavos em `bigint`**. Arredondamento meio-para-o-par feito nos dígitos do texto. Saída por `JSON.rawJSON` | exato de ponta a ponta, sem teto. `10.005` fica **exatamente** no meio (RN-001) | float (erra `10.005`); `number` em centavos (teto de 2^53 viraria regra implícita); `decimal.js` (dependência para operações só com inteiros) |

## 2. Arquitetura

```
arquivo ─► io/json (parse com texto dos números) ─► io/entrada (RN-015) ─► Entrada
                                                                            │
          ┌─────────────────────── núcleo (puro, sem E/S) ─────────────────┘
          ▼
   motor: para cada despesa, na ordem
     despesa.ts        etapas 1-2  RN-001, RN-002, RN-003 (estado: ids vistos, só de validadas, AMB-025)
     elegibilidade.ts  etapas 3-7  RN-004 … RN-008 (estado: chaves de duplicata)
          ▼  elegíveis
     viagem.ts         etapa 8     RN-011 (noites das hospedagens elegíveis)
     diarias.ts        etapa 9a    RN-012 (N e parcelas por noite)
     limites.ts        etapa 9b    RN-009, RN-010 (saldo por (data, categoria), na ordem)
          ▼
     motivos.ts RN-013 · resumo.ts RN-014
          │
          ▼ Resultado (Centavos, valores brutos de eco)
io/saida (JSON.rawJSON) ─► cli grava o arquivo ─► exit 0
```

**Fronteiras:** só `src/cli.ts` e `src/io/` fazem E/S e conhecem JSON.
`src/nucleo/` é feito de funções puras: recebe `Entrada` e devolve
`Resultado`, sem ler relógio, disco nem ambiente. Por isso quase todos os
testes rodam em memória, e uma mudança de regra fica dentro de uma etapa do
núcleo. A ordem da seção 8 vive **só** em `motor.ts`: mudar a ordem é mudar
uma lista, e não caçar condicionais espalhadas.

Estrutura de pastas:

```
src/
  cli.ts                      # parseArgs, lê/grava arquivos, códigos de saída
  io/json.ts                  # parse com NumeroJson; serialização com rawJSON
  io/entrada.ts               # RN-015 → Entrada | ErroEntrada
  nucleo/
    tipos.ts  politica.ts  dinheiro.ts  datas.ts  texto.ts
    despesa.ts  elegibilidade.ts  viagem.ts  diarias.ts  limites.ts
    motivos.ts  resumo.ts  motor.ts
tests/
  infra.test.ts               # runtime (rawJSON, context.source)
  nucleo/rn-001-arredondamento.test.ts … rn-014-resumo.test.ts   # um arquivo por RN
  nucleo/politica.test.ts  datas.test.ts  dinheiro.test.ts        # Infra › (sem regra)
  io/rn-015-entrada.test.ts   # a RN-015 vive em io/entrada.ts
  io/json.test.ts  io/saida.test.ts
  casos-de-borda.test.ts      # uma linha da seção 7 = um teste
  exemplo.test.ts             # tabela da seção 9
  contrato-saida.test.ts      # saida.schema.json
  cli.test.ts                 # ponta a ponta: sucesso, RN-015, determinismo
  rastreabilidade.test.ts     # spec.md × nomes de teste
```

## 3. Modelo de dados

Detalhado em [`data-model.md`](data-model.md). Resumo:

- A despesa passa por estados tipados: `DespesaBruta` → `DespesaValida` →
  `DespesaElegivel` → alocada. Em qualquer etapa ela pode virar `Recusa`
  com um código. A primeira recusa encerra a avaliação (seção 8).
- A hospedagem vira N `Parcela`s (uma por noite). As outras categorias viram
  uma parcela. O limite (etapa 9) só enxerga parcelas, então hospedagem e
  alimentação seguem o mesmo caminho de cálculo.
- `ResultadoItem` guarda os valores em `Centavos` e os ecos brutos. O
  `status` é **derivado** dos valores (reembolsável = solicitado → APROVADO
  etc.) e nunca é guardado separado.
- A justificativa (`Motivo`) é montada a partir do código e dos números que
  a etapa decisiva devolveu: limite, saldo, corte, `id` aceito da duplicata.

## 4. Como a política é representada

**Um módulo de constantes tipadas, `src/nucleo/politica.ts`**, e em nenhum
outro lugar aparece número mágico de regra:

```ts
export const POLITICA = {
  limites: {
    alimentacao:       { diario: 60_00n,  ampliaEmViagem: true  }, // RN-009
    transporte_urbano: { diario: 80_00n,  ampliaEmViagem: true  }, // RN-009
    hospedagem:        { diario: 250_00n, ampliaEmViagem: false }, // RN-009, AMB-020
  },
  fatorViagem: { num: 3n, den: 2n },                               // RN-011
  limiarNotaFiscal: 100_00n,                                       // RN-008 (estritamente maior)
} as const;
```

Mudar um valor da política exige mudar a spec e depois uma linha neste
arquivo. As categorias reconhecidas (RN-006) são as chaves de `limites`, e
não existe uma segunda lista para manter sincronizada.

**Descartado:** arquivo de configuração externo (JSON/YAML). Ele exigiria
validação própria e um parâmetro de CLI que a interface fixa não tem, e o
desafio não pede política configurável em tempo de execução. Se a mudança de
requisito pedir isso, a troca fica restrita a quem monta `POLITICA`.

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
`typeof x === 'number'`. Isso fica concentrado em `despesa.ts`.

### DT-002 — Núcleo puro com a ordem da seção 8 num lugar só

**Contexto:** a seção 8 define 9 etapas em que a primeira recusa encerra a
avaliação. A etapa 6 (duplicata) depende do que passou das etapas 1 a 5, e a
etapa 8 (viagem) depende de todas as hospedagens elegíveis.
**Decisão:** `motor.ts` faz duas passadas. A **passada 1** percorre as
despesas na ordem e aplica as etapas 1 a 7 (validação e elegibilidade), com
o estado acumulado de ids vistos e chaves de duplicata. Um `id` só entra nos
ids vistos quando a despesa passa da etapa 2, mesmo que seja recusada numa
etapa posterior (AMB-025). A **passada 2** usa as
elegíveis: calcula os dias de viagem, gera as parcelas e consome os saldos.
**Alternativa descartada:** um pipeline genérico de "regras plugáveis".
Com uma ordem fixa e conhecida, seria abstração sem uso, e o FAQ alerta para
isso.
**Consequência:** fácil: incluir, remover ou reordenar uma etapa de
elegibilidade. Difícil: uma regra que precise de informação da passada 2
dentro da passada 1. Hoje nenhuma precisa.

### DT-003 — Hospedagem entra no limite como parcelas

**Contexto:** a RN-012 divide a hospedagem por noite, e cada noite disputa o
limite daquela data com outras hospedagens, na ordem da entrada.
**Decisão:** toda despesa elegível vira uma lista de `Parcela`s (N para
hospedagem, 1 para as demais). `limites.ts` só conhece parcelas e soma o que
cada uma recebeu por `indiceDespesa`.
**Alternativa descartada:** um caminho especial para hospedagem em
`limites.ts`, que duplicaria a lógica de saldo e ordem.
**Consequência:** o exemplo de sobreposição da RN-012 (`h1`/`h2`) sai sem
código específico. O status de hospedagem vem da soma das parcelas.

### DT-004 — Saída cria o arquivo só no fim

**Contexto:** a RN-015 exige que nenhum arquivo de saída seja gerado em erro.
**Decisão:** ler, validar, calcular e serializar tudo em memória. Só então
chamar `writeFile`. Um erro de entrada lança `ErroEntrada`, que o `cli.ts`
converte em `stderr` + código 1.
**Alternativa descartada:** gravar em streaming (deixaria saída parcial).
**Consequência:** o arquivo inteiro fica em memória, o que é irrelevante no
volume do problema.

### DT-005 — Teste de rastreabilidade automático

**Contexto:** a seção 9 exige teste para cada RN e para cada linha da seção 7.
**Decisão:** `rastreabilidade.test.ts` extrai da spec os IDs
`### RN-NNN` e os nomes da 1ª coluna da tabela da seção 7, e confere se
cada um aparece em algum título de teste (`RN-NNN ›` ou `Borda › <nome>`).
**Alternativa descartada:** matriz mantida à mão só no `tasks.md`, que
desatualiza em silêncio.
**Consequência:** um caso de borda novo na spec (ex.: no envelope do Dia 2)
deixa a suíte vermelha até ganhar teste. Isso é intencional.

## 6. Estratégia de testes

- **Nível:** ~80% testes do núcleo em memória (uma função ou o `motor`
  com despesas montadas no teste); ~15% ponta a ponta do motor (exemplo,
  contrato); ~5% CLI por processo filho (sucesso, RN-015, determinismo,
  códigos de saída).
- **Cada `RN-NNN` tem teste?** Sim, **exatamente um arquivo por RN**,
  `rn-0NN-<tema>.test.ts` (em `tests/nucleo/`, ou em `tests/io/` para a
  RN-015), com `describe('RN-0NN — <título da spec>')`. Todo teste de unidade
  ou do motor em memória cujo título começa por `RN-0NN ›` fica no arquivo
  dessa RN, inclusive os que montam várias despesas e chamam o motor. Só os
  testes ponta a ponta (`exemplo`, `contrato-saida`, `cli`, `io/saida`) citam
  RNs fora do arquivo delas. Os critérios de **Aceite** da
  spec viram testes literais. O `rastreabilidade.test.ts` garante isso.
- **Casos de borda da seção 7:** `casos-de-borda.test.ts`, com um `it` por
  linha da tabela e o título **idêntico** à coluna "Caso"
  (`Borda › Três casas decimais`).
- **Nomenclatura:** `RN-010 › d-001 e d-002 em 03/07: 1ª PARCIAL 60,00, 2ª ESGOTADO`.
  O ID no início fecha a cadeia spec → teste. O nome do arquivo repete o ID
  (`rn-010-parcial.test.ts`), o que facilita o `grep`.
- **Exemplo oficial:** `exemplo.test.ts` compara item a item com a tabela da
  seção 9 e com o resumo esperado.

## 7. Riscos

| Risco | Probabilidade | O que faço se acontecer |
|---|---|---|
| Mudança do Dia 2 altera um valor da política ou acrescenta categoria | alta | spec → DECISIONS → uma linha em `politica.ts` + testes da RN afetada |
| Limite ampliado com centavos fracionários (ex.: limite 60,01 × 1,5 = 90,015) numa política futura | média | hoje todos são exatos. Se acontecer, parar e levar à spec a regra de arredondamento do limite (não decidir no código) |
| Mudança do Dia 2 cria um campo de viagem na entrada | média | trocar só `viagem.ts`. A etapa 8 já é isolada (AMB-007 prevê a troca) |
| `JSON.rawJSON` ou `context.source` indisponível no Node do avaliador | baixa | `engines: node >= 24` no `package.json` + verificação no início do `cli.ts` com mensagem clara |
| TypeScript 7 incompatível com `erasableSyntaxOnly`/`allowImportingTsExtensions` | baixa | fixar `typescript@5.9` (só afeta o typecheck, não a execução) |
| `ajv` e `multipleOf: 0.01` com float dão falso negativo (`0.07`) | média | `multipleOfPrecision: 2` na instância de teste |
| `"999999 diarias"` gera ~1M de parcelas | baixa | aceitável. Se virar problema, levar à spec um teto de N |
