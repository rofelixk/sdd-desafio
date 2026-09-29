# Tasks — Motor de Cálculo de Reembolso

> Cada task é pequena o bastante para virar **um commit**. Se você não consegue
> descrever o critério de aceite como "o teste X passa", a task está grande demais.
>
> Marque `[x]` conforme conclui — ao longo do caminho, não tudo no fim. O histórico
> de quando cada task foi marcada é lido na correção.

**Formato do commit:** `feat(T-003): <descrição>` · `test(T-003): <descrição>`

**Base:** `spec.md` v1.3 · `plan.md` v1.2 · `data-model.md` · `research.md` · `contracts/`

**Convenções que valem para todas as tasks** (do `plan.md` §2 e §6 e do `CLAUDE.md`):

- `src/nucleo/` é puro (sem E/S, relógio ou ambiente). Só `src/cli.ts` e `src/io/` tocam em arquivo/JSON.
- Só sintaxe apagável (`erasableSyntaxOnly`): sem `enum`/`namespace`/parameter properties; imports relativos com `.ts`.
- Dinheiro é `Centavos = bigint` em todo o núcleo. Nunca `number` para dinheiro. Nenhum número da política fora de `src/nucleo/politica.ts`.
- Título de teste começa pelo ID: `RN-010 › ...`, ou `Borda › <Caso>` com o texto **exato** da coluna "Caso" da seção 7 da spec, sem as crases do markdown (ex.: `` `id` repetido `` → `Borda › id repetido`). Testes que não verificam regra de negócio usam `Infra › ...`.
- **Exatamente um arquivo de teste por RN**: `tests/nucleo/rn-0NN-<tema>.test.ts` (a RN-015 em `tests/io/rn-015-entrada.test.ts`), com `describe('RN-0NN — <título da spec>')`. Todo teste de unidade ou do motor em memória com título `RN-0NN › ...` fica no arquivo **dessa** RN, mesmo que a task seja de outro módulo (não existe `motor.test.ts`). Só os testes ponta a ponta (`exemplo`, `contrato-saida`, `cli`, `io/saida`) citam RNs fora do arquivo delas (plan §6).
- "Aceite" = os testes listados passam em `npm test` **e** `npm run typecheck` fica sem erros.

---

## Fase 1 — Fundação

- [x] **T-001** — Criar o esqueleto do projeto: `package.json` (`"type": "module"`, `engines.node >= 24`, scripts `test` = `vitest run`, `typecheck` = `tsc --noEmit`, `reembolso` = `node src/cli.ts`; devDependencies `typescript@5.9`, `vitest@5`, `ajv`, `@types/node`), `tsconfig.json` (`strict`, `noEmit`, `erasableSyntaxOnly`, `allowImportingTsExtensions`, `verbatimModuleSyntax`, `target`/`lib` ES2024+, `module`/`moduleResolution` `nodenext`), `vitest.config.ts` e `tests/infra.test.ts`
  - **Atende:** (infraestrutura) — plan §0, R-01
  - **Aceite:** `Infra › runtime oferece JSON.rawJSON e context.source no reviver do JSON.parse` passa; `npm run typecheck` sem erros
  - **Commit:** `48a4c76`

- [x] **T-002** — [P] Criar `src/nucleo/tipos.ts` (tipos do `data-model.md`: `Centavos`, `DataISO`, `Categoria`, `NumeroJson`, `Entrada`, `DespesaValida`, `DespesaElegivel`, `Recusa`, `Parcela`, `ResultadoItem`, `Motivo`, `Resumo`, `Resultado`, e a união de códigos de motivo da seção 4 da spec como tipo literal) e `src/nucleo/politica.ts` com o objeto `POLITICA` exatamente como no plan §4 (cada valor com o ID da RN em comentário)
  - **Atende:** (infraestrutura) — plan §3 e §4, data-model §5
  - **Aceite:** `Infra › política: categorias reconhecidas são exatamente as chaves de POLITICA.limites` passa (em `tests/nucleo/politica.test.ts`); `npm run typecheck` sem erros
  - **Commit:** `053d39d`

- [x] **T-003** — [P] Criar `src/io/json.ts`: `lerJson(texto)` com `JSON.parse` + reviver que troca **todo** número por `NumeroJson { texto }` usando `context.source` (R-03); `serializarJson(valor)` com indentação de 2 espaços e `\n` final, reemitindo `NumeroJson` e valores monetários via `JSON.rawJSON` (R-04)
  - **Atende:** (infraestrutura) — R-03, R-04, contracts/cli.md
  - **Aceite:** em `tests/io/json.test.ts` passam `Infra › json: número vira NumeroJson com o texto original ("10.005", "1.00005e2")`, `Infra › json: números aninhados em objetos e listas também são embrulhados`, `Infra › json: NumeroJson é reemitido com o mesmo texto` e `Infra › json: JSON.rawJSON("45.00") sai como número 45.00, não como texto`
  - **Commit:** `cdcf3cc`

- [x] **T-004** — [P] Criar `src/nucleo/datas.ts` (R-05): `ehDataValida(texto)` (regex `^\d{4}-\d{2}-\d{2}$` + existência no calendário), `somarDias(data, k)` com `Date.UTC` e comparação por texto
  - **Atende:** (infraestrutura) — R-05
  - **Aceite:** em `tests/nucleo/datas.test.ts` passam `Infra › datas: 2026-02-30 e 2026-07-32 são inválidas e 2024-02-29 é válida`, `Infra › datas: formato diferente de AAAA-MM-DD é inválido ("2026-7-3", "03/07/2026")` e `Infra › datas: 2026-07-31 + 1 dia = 2026-08-01, independente do fuso`
  - **Commit:** `c356fd3`

- [x] **T-005** — Criar `src/nucleo/dinheiro.ts` com a formatação de centavos: `formatarDecimal(c)` (`4500n` → `"45.00"`, para a saída JSON) e `formatarReais(c)` (`6000n` → `"R$ 60,00"`, para `motivo.descricao`)
  - **Atende:** (infraestrutura) — R-02, R-04
  - **Aceite:** em `tests/nucleo/dinheiro.test.ts` passam `Infra › dinheiro: formatarDecimal 4500n → "45.00", -4500n → "-45.00", 5n → "0.05", 0n → "0.00"` e `Infra › dinheiro: formatarReais 6000n → "R$ 60,00" e 186184n → "R$ 1.861,84"`
  - **Commit:** `98def79`

## Fase 2 — Regras de negócio

- [x] **T-006** — [P] Implementar `paraCentavos(texto)` em `src/nucleo/dinheiro.ts`: converte o texto de um número (sinal, dígitos, ponto decimal, expoente) em `Centavos` arredondando **meio para o par** sobre os dígitos, sem passar por float (DT-001)
  - **Atende:** RN-001, AMB-013
  - **Aceite:** em `tests/nucleo/rn-001-arredondamento.test.ts` passam `RN-001 › 33.333 → 33.33`, `RN-001 › 10.005 → 10.00 (meio, 0 é par)`, `RN-001 › 10.015 → 10.02 (meio, 2 é par)`, `RN-001 › 33.345 → 33.34`, `RN-001 › 33.3451 → 33.35 (fora do meio)`, `RN-001 › 100.004 → 100.00`, `RN-001 › -45.005 → -45.00 (meio para o par também no negativo)` e `RN-001 › expoente 1.00005e2 → 100.00`
  - **Commit:** `e089af9`

- [x] **T-007** — [P] Criar `src/nucleo/texto.ts` (R-06): `normalizar(texto)` = `trim` → minúsculas → `NFD` → remove `\p{M}`; e `normalizarFornecedor(texto)` = só `trim` + minúsculas (a RN-007 não manda tirar acento do fornecedor); e `comoTexto(bruto)` (AMB-026): ausente/`null` → `""`, texto como veio, `NumeroJson` → o seu texto, booleano → `"true"`/`"false"`, lista/objeto → texto JSON compacto (`NumeroJson` reemitido com o texto original)
  - **Atende:** RN-002, AMB-014, RN-003, AMB-026
  - **Aceite:** em `tests/nucleo/rn-002-categoria.test.ts` passam `RN-002 › "ALIMENTACAO", " Alimentação " e "alimentacao" viram alimentacao` e `RN-002 › "Transporte_Urbano" e "HOSPEDAGEM" viram transporte_urbano e hospedagem`; em `tests/nucleo/rn-003-validacao.test.ts` passa `RN-003 › fornecedor/descricao como texto: ausente e null → "", 123 → "123", true → "true", [1, 2] → "[1,2]"`
  - **Commit:** `6a5e1b4`

- [x] **T-008** — Criar `src/nucleo/despesa.ts` com `validarDespesa(bruta, indice)` → `DespesaValida | Recusa(DADO_INVALIDO)`: item que não é objeto; `id`, `data`, `categoria` ausentes, nulos, vazios/só espaços ou não textuais; `data` inválida (T-004); `valor` ausente. A `Recusa` carrega os ecos **brutos** de `id`/`data`/`categoria` (ausente → `null`) e o `valor_solicitado` arredondado quando o `valor` é um `NumeroJson` (neste passo só `NumeroJson` é aceito como valor; texto vem na T-009). Aplica `normalizar` na categoria (RN-002) sem recusar categoria desconhecida. Preenche `descricao` e `fornecedorChave` com `comoTexto` (T-007); esses dois campos nunca recusam a despesa (AMB-026)
  - **Atende:** RN-003, AMB-018, AMB-023, AMB-026
  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` passam `RN-003 › "data": "2026-07-32" → DADO_INVALIDO com data "2026-07-32" no eco`, `RN-003 › id, data, categoria ou valor ausentes → DADO_INVALIDO`, `RN-003 › id, data ou categoria nulos, vazios ou só com espaços → DADO_INVALIDO`, `RN-003 › "categoria": "" e "categoria": 123 → DADO_INVALIDO, e não CATEGORIA_NAO_REEMBOLSAVEL`, `RN-003 › item que não é objeto (42, "x", null) → DADO_INVALIDO com ecos e valor_solicitado nulos` , `RN-003 › eco sai exatamente como veio (categoria 123 continua o NumeroJson "123")` e `RN-003 › "fornecedor": 123 e "descricao": null não recusam a despesa`
  - **Commit:** `9dec873`

- [x] **T-009** — Aceitar `valor` como texto no formato fechado em `src/nucleo/despesa.ts`: sem os espaços das bordas, casa `^-?\d+([.,]\d+)?$`; vírgula vira ponto e segue para `paraCentavos` (RN-001). Qualquer outro texto ou tipo (vazio, milhar, moeda, dois separadores, letras, booleano, lista, objeto, nulo) → `DADO_INVALIDO` com `valor_solicitado` nulo
  - **Atende:** RN-003, AMB-021, AMB-023
  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` passam `RN-003 › "45.00", "45,00" e 45.00 dão valor_solicitado 45,00`, `RN-003 › "1.234,56" e "R$ 45,00" → DADO_INVALIDO`, `RN-003 › "valor": "R$ 45,00" → valor_solicitado nulo`, `RN-003 › "", "45.", ",5", "1,2,3", "abc", true, [], {} e null não são numéricos`, `RN-003 › " -45,00 " (espaços nas bordas) é numérico` e `RN-003 › recusa por outro campo mantém valor_solicitado arredondado quando o valor é numérico`
  - **Commit:** `32b515d`

- [x] **T-010** — Validar `tem_nota_fiscal` em `src/nucleo/despesa.ts`: só `true`/`false` são aceitos; ausente, nulo ou texto vazio/só espaços vale `false`; qualquer outro valor → `DADO_INVALIDO`
  - **Atende:** RN-003, AMB-022, AMB-018
  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` passam `RN-003 › "tem_nota_fiscal": "sim" → DADO_INVALIDO`, `RN-003 › "tem_nota_fiscal": null vale false`, `RN-003 › tem_nota_fiscal ausente, "" ou "   " vale false` e `RN-003 › tem_nota_fiscal "true", 1, 0, [] ou {} → DADO_INVALIDO`
  - **Commit:** `90ea5f7`

- [x] **T-011** — Detectar `id` repetido em `src/nucleo/despesa.ts`: `validarDespesa` recebe o conjunto de ids vistos (ids normalizados com `normalizar`, T-007) e recusa com `DADO_INVALIDO` se o `id` normalizado já estiver nele; o eco do `id` sai como veio. O conjunto só recebe o `id` de despesas que **passaram pela validação** (resultado `DespesaValida`); uma `Recusa(DADO_INVALIDO)`, por qualquer motivo, inclusive o próprio `id` repetido, não reserva o `id` (AMB-025). Expor o helper `registrarId(idsVistos, resultado)` que só adiciona quando o resultado é `DespesaValida`
  - **Atende:** RN-003, AMB-024, AMB-025
  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` passam `RN-003 › "D-001" depois de "d-001" → DADO_INVALIDO`, `RN-003 › " d-001 " depois de "d-001" → DADO_INVALIDO, com id " d-001 " no eco`, `RN-003 › a primeira ocorrência de "d-001" segue normalmente`, `RN-003 › "d-001" com data inválida, depois "d-001" válido → o 2º segue (correção, AMB-025)` e `RN-003 › "d-001" inválido, "d-001" válido e outro "d-001" válido → 1º e 3º DADO_INVALIDO, 2º segue`
  - **Commit:** `2de0c2f`

- [x] **T-012** — [P] Criar `src/nucleo/elegibilidade.ts` com a etapa 3: `valorSolicitado ≤ 0` → `Recusa(VALOR_NAO_POSITIVO)`
  - **Atende:** RN-004, AMB-012
  - **Aceite:** em `tests/nucleo/rn-004-valor-nao-positivo.test.ts` passam `RN-004 › d-009 (−45,00) → RECUSADO VALOR_NAO_POSITIVO, reembolsável 0,00`, `RN-004 › 0,00 → VALOR_NAO_POSITIVO` e `RN-004 › -0.004 arredonda para 0,00 → VALOR_NAO_POSITIVO`
  - **Commit:** `772e8b6`

- [x] **T-013** — Etapa 4 em `src/nucleo/elegibilidade.ts`: `data` fora de `[periodo.inicio, periodo.fim]` (inclusive) → `Recusa(FORA_DO_PERIODO)`; `periodo.competencia` nunca é lido
  - **Atende:** RN-005, AMB-009, AMB-010
  - **Aceite:** em `tests/nucleo/rn-005-periodo.test.ts` passam `RN-005 › d-008 (2026-04-15, período de julho) → FORA_DO_PERIODO`, `RN-005 › d-014 (2026-07-31 = fim) é elegível`, `RN-005 › data = inicio é elegível` e `RN-005 › competencia divergente de inicio/fim é ignorada`
  - **Commit:** `2da1238`

- [x] **T-014** — Etapa 5 em `src/nucleo/elegibilidade.ts`: categoria normalizada que não é chave de `POLITICA.limites` → `Recusa(CATEGORIA_NAO_REEMBOLSAVEL)`, sem reclassificar
  - **Atende:** RN-006, AMB-019
  - **Aceite:** em `tests/nucleo/rn-006-categorias.test.ts` passam `RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBOLSAVEL` e `RN-006 › alimentacao, transporte_urbano e hospedagem são reembolsáveis`
  - **Commit:** `a86a420`

- [x] **T-015** — Etapa 6 em `src/nucleo/elegibilidade.ts`: estado com chave `(data, categoria normalizada, normalizarFornecedor(fornecedor) — ausente/só espaços = "", valorSolicitado)` → `id` da primeira ocorrência; ocorrência seguinte com `id` diferente → `Recusa(DUPLICATA)` com `detalhes.idAceito`. `descricao` e `tem_nota_fiscal` fora da chave
  - **Atende:** RN-007, AMB-011, AMB-026
  - **Aceite:** em `tests/nucleo/rn-007-duplicatas.test.ts` passam `RN-007 › d-006 segue e d-007 → DUPLICATA`, `RN-007 › duas alimentações de 40,00 sem fornecedor na mesma data → a 2ª DUPLICATA`, `RN-007 › só uma com fornecedor → as duas seguem`, `RN-007 › "Café" e "Cafe" são fornecedores diferentes (fornecedor não tira acento)`, `RN-007 › descricao e tem_nota_fiscal não entram no critério`, `RN-007 › recusa DUPLICATA traz o id da ocorrência aceita`, `RN-007 › fornecedor 123 e "123" são o mesmo fornecedor` e `RN-007 › fornecedor null é igual a fornecedor ausente`
  - **Commit:** `6036df0`

- [x] **T-016** — Etapa 7 em `src/nucleo/elegibilidade.ts`: `valorSolicitado > POLITICA.limiarNotaFiscal` (estritamente maior, sobre o valor arredondado) e sem nota → `Recusa(NOTA_FISCAL_AUSENTE)`
  - **Atende:** RN-008, AMB-004, AMB-005, AMB-006
  - **Aceite:** em `tests/nucleo/rn-008-nota-fiscal.test.ts` passam `RN-008 › d-003 (100,00, sem NF) não é recusada por nota fiscal`, `RN-008 › d-004 (100,01, sem NF) → NOTA_FISCAL_AUSENTE`, `RN-008 › d-013 (690,00, sem NF) → NOTA_FISCAL_AUSENTE` e `RN-008 › 100.004 arredonda para 100,00 e não exige nota fiscal`
  - **Commit:** `cb1783a`

- [x] **T-017** — Criar `src/nucleo/motor.ts` com a **passada 1** (DT-002): percorre `entrada.despesas` na ordem, aplica etapas 1–2 (`despesa.ts`, registrando o `id` nos ids vistos com `registrarId` logo após a etapa 2) e 3–7 (`elegibilidade.ts`) na ordem da seção 8, com a primeira recusa encerrando a avaliação; a duplicata só compara despesas que passaram das etapas 1–5. Por enquanto as elegíveis saem sem alocação de limite
  - **Atende:** RN-003, RN-004, RN-007, RN-008, AMB-025 (seção 8)
  - **Aceite:** chamando o motor em memória, passam em `tests/nucleo/rn-003-validacao.test.ts` `RN-003 › despesa inválida não impede o processamento das outras` e `RN-003 › id de despesa recusada por FORA_DO_PERIODO continua reservado (AMB-025)`; em `tests/nucleo/rn-007-duplicatas.test.ts` `RN-007 › cópia fora do período não gera duplicata (só compara quem passou das etapas 1 a 5)` e `RN-007 › duplicata vem antes da nota fiscal (2ª cópia sem NF sai DUPLICATA)`; em `tests/nucleo/rn-004-valor-nao-positivo.test.ts` `RN-004 › estorno fora do período sai VALOR_NAO_POSITIVO (etapa 3 antes da 4)`
  - **Commit:** `07f9724`

- [x] **T-018** — [P] Criar `src/nucleo/diarias.ts` com `extrairDiarias(descricao)` (R-07): recebe a `descricao` já em texto (`comoTexto`, T-007) e, na descrição normalizada, busca a primeira ocorrência de `(?<!\d[.,]?)(\d+)(?![.,]\d)\s*(diarias?|noites?)(?![a-z])`; sem ocorrência, descrição vazia (ausente ou nula) ou N = 0 → 1 (uma única diária)
  - **Atende:** RN-012, AMB-008, AMB-026
  - **Aceite:** em `tests/nucleo/rn-012-diarias.test.ts` passam `RN-012 › "Hotel Rio - 2 diarias" → N = 2`, `RN-012 › "Airbnb 3 noites" → N = 3`, `RN-012 › "Hotel 5 estrelas" → N = 1`, `RN-012 › "Hotel 5 estrelas - 2 diarias" → N = 2`, `RN-012 › "Hotel 1.5 diarias" → N = 1 (e não 5)`, `RN-012 › "Pousada" e descrição ausente → N = 1`, `RN-012 › "0 diarias" → N = 1`, `RN-012 › "3 Diárias" → N = 3`, `RN-012 › "12 noites" → N = 12 (inteiro completo)`, `RN-012 › "2diarias" → N = 2 (sem espaço)`, `RN-012 › "2 noitadas" → N = 1` e `RN-012 › descricao nula ou 2 (número) → N = 1`
  - **Commit:** `94c9883`

- [x] **T-019** — `gerarParcelas(elegivel)` em `src/nucleo/diarias.ts` (DT-003): hospedagem com N diárias vira N `Parcela`s nas datas D…D+N−1 com `valor ÷ N` e o resto distribuído um centavo por vez nas primeiras noites; qualquer outra categoria vira uma parcela na própria data
  - **Atende:** RN-012, AMB-008
  - **Aceite:** em `tests/nucleo/rn-012-diarias.test.ts` passam `RN-012 › d-010 (480,00, N = 2) → 240,00 em 14/07 e 240,00 em 15/07`, `RN-012 › 100,00 em 3 noites → 33,34 / 33,33 / 33,33`, `RN-012 › noites atravessam o fim do mês (31/07 → 01/08)` e `RN-012 › despesa que não é hospedagem gera uma parcela`
  - **Commit:** `47d672d`

- [x] **T-020** — Criar `src/nucleo/viagem.ts` com `diasDeViagem(elegiveis)` → conjunto de todas as noites (D…D+N−1) das hospedagens **elegíveis** recebidas; o check-out (D+N) não entra
  - **Atende:** RN-011, AMB-007
  - **Aceite:** em `tests/nucleo/rn-011-viagem.test.ts` passam `RN-011 › hospedagem de 1 diária em D: só D é dia de viagem`, `RN-011 › hospedagem de 2 diárias em D: D e D+1 são dias de viagem` e `RN-011 › sem hospedagem elegível não há dia de viagem`
  - **Commit:** `d6a3445`

- [x] **T-021** — [P] Criar `src/nucleo/limites.ts` com `alocar(parcelas, diasDeViagem)`: saldo por `(data, categoria)` iniciado com `POLITICA.limites[cat].diario`, multiplicado por `fatorViagem` só se a data é de viagem **e** `ampliaEmViagem`; cada parcela, na ordem da entrada, recebe `min(valor, saldo)`; soma por `indiceDespesa`; devolve por despesa o reembolsável, o limite aplicado, o saldo disponível e o código (`APROVADO_INTEGRAL` / `LIMITE_DIARIO_EXCEDIDO` / `LIMITE_DIARIO_ESGOTADO`)
  - **Atende:** RN-009, RN-010, AMB-001, AMB-002, AMB-003, AMB-015, AMB-016, AMB-020
  - **Aceite:** em `tests/nucleo/rn-009-limites.test.ts` passam `RN-009 › alimentação isolada de 60,00 → APROVADO 60,00`, `RN-009 › d-012 (sábado, 47,20) → APROVADO 47,20`, `RN-009 › categorias diferentes no mesmo dia têm limites independentes` e `RN-009 › em dia de viagem alimentação vai a 90,00 e transporte a 120,00, hospedagem fica em 250,00`; em `tests/nucleo/rn-010-parcial.test.ts` passam `RN-010 › d-001 e d-002 em 03/07: 1ª PARCIAL 60,00, 2ª ESGOTADO`, `RN-010 › d-014 (61,00) → PARCIAL 60,00` e `RN-010 › despesa que usa exatamente o saldo restante → APROVADO_INTEGRAL`
  - **Commit:** `388604d`

- [x] **T-022** — **Passada 2** em `src/nucleo/motor.ts`: com as elegíveis da passada 1, calcula `diasDeViagem`, gera parcelas e chama `alocar`; monta cada `ResultadoItem` com `limite_diario_aplicado`, `em_viagem`, `diarias` (só hospedagem alocada) e `status` **derivado** de (reembolsável, solicitado); recusadas saem com esses três campos nulos e reembolsável 0
  - **Atende:** RN-011, RN-012, RN-002, RN-004, RN-008, AMB-007, AMB-017, AMB-020
  - **Aceite:** chamando o motor em memória, passam em `tests/nucleo/rn-011-viagem.test.ts` `RN-011 › alimentação de 80,00 na data de hospedagem elegível → APROVADO 80,00 (limite 90,00)`, `RN-011 › hospedagem de 1 diária em D e alimentação 80,00 em D+1 → PARCIAL 60,00`, `RN-011 › hospedagem de 2 diárias em D e alimentação 80,00 em D+1 → APROVADO 80,00` e `RN-011 › d-013 recusada por NF não torna 22 a 24/07 dias de viagem`; em `tests/nucleo/rn-008-nota-fiscal.test.ts` `RN-008 › dia de viagem não amplia o limiar de nota fiscal`; em `tests/nucleo/rn-012-diarias.test.ts` `RN-012 › h1 14/07 "2 diarias" 480,00 e h2 15/07 "1 diaria" 200,00 → h1 APROVADO 480,00, h2 PARCIAL 10,00` e `RN-012 › diarias só é preenchido em hospedagem que chegou ao limite; limite e em_viagem nulos nas recusadas`; em `tests/nucleo/rn-002-categoria.test.ts` `RN-002 › "ALIMENTACAO" e "alimentacao" na mesma data somam no mesmo limite diário`; em `tests/nucleo/rn-004-valor-nao-positivo.test.ts` `RN-004 › d-009 não afeta as despesas de transporte de 2026-07-11`
  - **Commit:** `b2f1c4d`

- [x] **T-023** — [P] Criar `src/nucleo/motivos.ts`: `montarMotivo(codigo, detalhes)` → `{ codigo, descricao }` com um modelo de texto por código da seção 4, valores via `formatarReais`; códigos de limite citam limite aplicado, saldo disponível e valor cortado; `DUPLICATA` cita o `id` aceito sem falar em fraude/suspeita. Ligar no `motor.ts`
  - **Atende:** RN-013, RN-007
  - **Aceite:** em `tests/nucleo/rn-013-motivos.test.ts` passam `RN-013 › todo código da seção 4 gera descrição não vazia`, `RN-013 › LIMITE_DIARIO_EXCEDIDO cita limite, saldo disponível e valor cortado`, `RN-013 › LIMITE_DIARIO_ESGOTADO cita o limite e o saldo zerado` e `RN-007 › descrição de DUPLICATA cita o id da ocorrência aceita`
  - **Commit:** `2761b61`

- [x] **T-024** — Criar `src/nucleo/resumo.ts` e ligá-lo no `motor.ts`: contagens por status; `total_solicitado` soma só `valor_solicitado` positivo e não nulo; `total_reembolsavel` soma todos os itens; `total_nao_reembolsado = total_solicitado − total_reembolsavel` em centavos
  - **Atende:** RN-014, AMB-012, AMB-023
  - **Aceite:** em `tests/nucleo/rn-014-resumo.test.ts` passam `RN-014 › soma de valor_reembolsavel dos itens = total_reembolsavel e contagens somam quantidade_itens`, `RN-014 › total_solicitado ignora valores não positivos e nulos`, `RN-014 › total_nao_reembolsado = total_solicitado − total_reembolsavel, exato em centavos` e `RN-014 › lista vazia → contagens 0 e totais 0,00`
  - **Commit:** `9ebda81`

- [x] **T-025** — [P] Criar `src/io/entrada.ts` com `validarEntrada(json)` → `Entrada` ou lança `ErroEntrada { mensagem }`: exige que o JSON seja objeto, `colaborador.id`, `periodo.inicio` e `periodo.fim` (datas válidas pela T-004, `inicio ≤ fim`) e `despesas` como lista; `colaborador.id`/`periodo.inicio`/`periodo.fim` vazios, só com espaços, nulos ou não textuais contam como ausentes, e `colaborador`/`periodo` que não são objeto têm todos os campos ausentes (AMB-027); a mensagem cita o campo ou o problema. `colaborador`/`periodo` guardados brutos para eco
  - **Atende:** RN-015, AMB-018, AMB-027
  - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `RN-015 › sem periodo → erro cuja mensagem cita periodo`, `RN-015 › sem colaborador.id → erro cuja mensagem cita colaborador.id`, `RN-015 › periodo.inicio ou periodo.fim inválidos → erro`, `RN-015 › inicio depois de fim → erro`, `RN-015 › despesas ausente ou que não é lista → erro cuja mensagem cita despesas`, `RN-015 › texto que não é JSON → erro`, `RN-015 › despesas: [] é entrada válida`, `RN-015 › colaborador.id "", "  ", null ou 123 → erro cuja mensagem cita colaborador.id`, `RN-015 › periodo.inicio 20260701 ou null → erro cuja mensagem cita periodo.inicio`, `RN-015 › colaborador ou periodo que não é objeto → erro` e `RN-015 › JSON que não é objeto ([], 42, "x") → erro`
  - **Commit:** `358b59f`

## Fase 3 — Casos de borda

> Todas em `tests/casos-de-borda.test.ts`, chamando o motor em memória com uma
> `Entrada` montada no teste (período padrão 2026-07-01 a 2026-07-31). Um `it`
> por linha da tabela da seção 7, título `Borda › <Caso>`. Se um teste falhar,
> o conserto no código faz parte da mesma task.

- [x] **T-026** — Casos de borda de nota fiscal e arredondamento em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-001, RN-008, RN-010, AMB-004, AMB-013
  - **Aceite:** passam `Borda › Nota fiscal no limiar exato`, `Borda › Um centavo acima do limiar`, `Borda › Arredondamento que cruza o limiar`, `Borda › Arredondamento meio-para-o-par no limiar`, `Borda › Meio-para-o-par sobe`, `Borda › Fora do ponto médio` e `Borda › Três casas decimais`
  - **Commit:** `3f72db7`

- [x] **T-027** — Casos de borda de limite diário em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-009, RN-010, AMB-001, AMB-002, AMB-015, AMB-016
  - **Aceite:** passam `Borda › Exatamente no limite diário`, `Borda › Um centavo acima do limite`, `Borda › Várias no mesmo dia`, `Borda › Recusada não consome limite`, `Borda › Mesmo dia, categorias diferentes` e `Borda › Fim de semana`
  - **Commit:** `7a4991c`

- [x] **T-028** — Casos de borda de período, valor não positivo e categoria em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-002, RN-004, RN-005, RN-006, AMB-009, AMB-012, AMB-014, AMB-019
  - **Aceite:** passam `Borda › Primeiro dia do período`, `Borda › Último dia do período`, `Borda › Dia seguinte ao período`, `Borda › Estorno`, `Borda › Valor zero`, `Borda › Categoria em maiúsculas`, `Borda › Categoria com acento` e `Borda › Categoria desconhecida`
  - **Commit:** `3bf4d63`

- [x] **T-029** — Casos de borda de duplicatas em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-007, RN-003, AMB-011, AMB-026
  - **Aceite:** passam `Borda › Mesmo fornecedor, datas diferentes`, `Borda › Duplicata com e sem NF`, `Borda › Três cópias idênticas`, `Borda › Fornecedor com grafia diferente`, `Borda › Fornecedores diferentes`, `Borda › Ambas sem fornecedor`, `Borda › Só uma com fornecedor`, `Borda › Fornecedor vazio`, `Borda › Fornecedor numérico` e `Borda › Fornecedor nulo`
  - **Commit:** `8edd03e`

- [x] **T-030** — Casos de borda de hospedagem e diárias em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-012, RN-005, RN-003, AMB-008, AMB-026
  - **Aceite:** passam `Borda › Diárias na descrição` (conferindo `limite_diario_aplicado` 250,00), `Borda › Diárias com acento e maiúscula`, `Borda › Duas hospedagens na mesma noite`, `Borda › Diária média acima do limite`, `Borda › Divisão com centavos`, `Borda › Noite fora do período`, `Borda › Número que não é diária`, `Borda › Descrição sem número`, `Borda › Zero diárias`, `Borda › Número solto antes das diárias`, `Borda › Diárias fracionárias`, `Borda › Hospedagem sem descrição` e `Borda › Descrição não textual`
  - **Commit:** `68e7db7`

- [x] **T-031** — Casos de borda de viagem em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-011, RN-008, AMB-007, AMB-017, AMB-020
  - **Aceite:** passam `Borda › Alimentação em dia de viagem`, `Borda › Transporte em dia de viagem`, `Borda › Dia do check-out`, `Borda › Noite seguinte da estadia`, `Borda › Hospedagem recusada não gera viagem` e `Borda › Viagem não altera o limiar de NF`
  - **Commit:** `e8d5dec`

- [ ] **T-032** — Casos de borda de `id`, `data`, `categoria` e eco inválidos em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-003, RN-014, AMB-018, AMB-023, AMB-024, AMB-025
  - **Aceite:** passam `Borda › Data impossível`, `Borda › id repetido`, `Borda › id repetido com outra grafia`, `Borda › Correção de item inválido`, `Borda › id de item recusado depois da validação`, `Borda › Valor inválido na saída`, `Borda › Eco de campo inválido`, `Borda › Despesa que não é objeto`, `Borda › Categoria vazia`, `Borda › Categoria não textual`, `Borda › id vazio` e `Borda › data nula`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-033** — Casos de borda de `valor` como texto em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-003, RN-001, RN-004, AMB-021
  - **Aceite:** passam `Borda › Valor como texto com ponto`, `Borda › Valor como texto com vírgula`, `Borda › Valor texto com 3 casas`, `Borda › Valor texto negativo`, `Borda › Separador de milhar`, `Borda › Símbolo de moeda` e `Borda › Valor booleano`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-034** — Casos de borda de `tem_nota_fiscal` em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-003, RN-008, AMB-018, AMB-022
  - **Aceite:** passam `Borda › tem_nota_fiscal ausente, valor 150,00`, `Borda › tem_nota_fiscal nulo ou "", valor 150,00`, `Borda › tem_nota_fiscal vazio, valor 50,00`, `Borda › tem_nota_fiscal texto` e `Borda › tem_nota_fiscal número`
  - **Commit:** `<hash preenchido depois>`

## Fase 4 — Saída e CLI

- [ ] **T-035** — Criar `src/io/saida.ts` com `montarSaida(resultado, entrada)`: objeto na ordem de campos da seção 4 (`colaborador`, `periodo`, `itens`, `resumo`), `colaborador`/`periodo` ecoados brutos, dinheiro via `JSON.rawJSON(formatarDecimal(c))`, ecos brutos de item inválido reemitidos como vieram (`NumeroJson` com o mesmo texto, ausente → `null`)
  - **Atende:** RN-001, RN-003, RN-013, AMB-023
  - **Aceite:** em `tests/io/saida.test.ts` passam `RN-001 › valores monetários saem com duas casas (60.00, não 60; 0.00, não 0)`, `RN-003 › eco de campo inválido sai como veio (categoria 123 → 123, "  " → "  ", ausente → null)`, `RN-003 › valor_solicitado nulo sai como null` e `Infra › saída: colaborador e periodo ecoados com os números no texto original`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-036** — [P] Teste do arquivo oficial em `tests/exemplo.test.ts`: lê `exemplos/despesas-exemplo.json`, roda `validarEntrada` → motor → `montarSaida` e compara com a tabela da seção 9 da spec. Um `it` por despesa, com o ID da regra do código esperado
  - **Atende:** RN-001, RN-004, RN-005, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-014 (seção 9)
  - **Aceite:** passam `RN-010 › exemplo d-001: PARCIAL 60,00`, `RN-010 › exemplo d-002: RECUSADO LIMITE_DIARIO_ESGOTADO`, `RN-010 › exemplo d-003: PARCIAL 80,00`, `RN-008 › exemplo d-004: NOTA_FISCAL_AUSENTE`, `RN-006 › exemplo d-005: CATEGORIA_NAO_REEMBOLSAVEL`, `RN-009 › exemplo d-006: APROVADO 54,90`, `RN-007 › exemplo d-007: DUPLICATA`, `RN-005 › exemplo d-008: FORA_DO_PERIODO`, `RN-004 › exemplo d-009: VALOR_NAO_POSITIVO`, `RN-012 › exemplo d-010: APROVADO 480,00, diarias 2`, `RN-011 › exemplo d-011: APROVADO 33,33, em_viagem true, limite 90,00`, `RN-009 › exemplo d-012: APROVADO 47,20`, `RN-008 › exemplo d-013: NOTA_FISCAL_AUSENTE`, `RN-010 › exemplo d-014: PARCIAL 60,00`, `RN-014 › exemplo: resumo 1861.84 / 815.43 / 1046.41 · 4/3/7` e `RN-013 › exemplo: nenhum item com motivo ausente ou vazio`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-037** — [P] Teste de contrato em `tests/contrato-saida.test.ts`: valida a saída contra `contracts/saida.schema.json` com `ajv` (`multipleOfPrecision: 2`)
  - **Atende:** RN-013, RN-003 (seção 4)
  - **Aceite:** passam `RN-013 › saída do exemplo valida contra contracts/saida.schema.json` e `RN-013 › saída com itens DADO_INVALIDO (valor_solicitado nulo, ecos brutos) valida contra o schema`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-038** — Criar `src/cli.ts` (R-08, DT-004, `contracts/cli.md`): `parseArgs` com subcomando `calcular` e `--input`/`--output` obrigatórios; lê, valida, calcula e serializa tudo em memória antes de `writeFile`; sucesso → código 0 e uma linha de resumo no `stdout`; `ErroEntrada`/falha de leitura → `erro: <mensagem>` no `stderr` e código 1, sem criar nem alterar a saída; uso incorreto → `uso: ...` e código 2
  - **Atende:** RN-015, RN-003, AMB-018
  - **Aceite:** em `tests/cli.test.ts` (processo filho) passam `RN-015 › CLI: arquivo sem periodo → código 1, stderr cita periodo, nenhum arquivo de saída`, `RN-015 › CLI: arquivo de entrada inexistente → código 1, nenhum arquivo de saída`, `RN-015 › CLI: arquivo que não é JSON → código 1`, `RN-015 › CLI: em erro, arquivo de saída pré-existente não é alterado`, `RN-003 › CLI: despesa inválida não aborta (código 0)`, `Infra › CLI: exemplo → código 0, resumo no stdout, JSON indentado com \n final` e `Infra › CLI: subcomando ou opção ausente → código 2 com "uso:"`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-039** — Teste de determinismo em `tests/cli.test.ts`
  - **Atende:** seção 9 (critério "duas execuções geram saídas idênticas")
  - **Aceite:** passa `Infra › CLI: duas execuções com a mesma entrada geram bytes idênticos`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-040** — Casos de borda de arquivo em `tests/casos-de-borda.test.ts`: lista vazia pelo motor; os casos de RN-015 pelo CLI (processo filho), conferindo que o arquivo de saída não existe e que o `stderr` cita o campo
  - **Atende:** RN-014, RN-015, AMB-027
  - **Aceite:** passam `Borda › Lista de despesas vazia`, `Borda › Arquivo sem periodo`, `Borda › inicio depois de fim`, `Borda › colaborador.id vazio`, `Borda › periodo.inicio não textual` e `Borda › Arquivo que não é objeto`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-041** — Criar `tests/rastreabilidade.test.ts` (DT-005): lê `specs/001-motor-reembolso/spec.md`, extrai todo `### RN-NNN` e a 1ª coluna da tabela da seção 7 (sem as crases), lê os títulos de teste em `tests/**/*.test.ts` e falha listando o que ficou sem teste; confere também que toda RN tem **exatamente um** arquivo `tests/**/rn-NNN-*.test.ts`
  - **Atende:** RN-001, RN-002, RN-003, RN-004, RN-005, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-014, RN-015 (seção 9, critérios 2 e 3)
  - **Aceite:** passam `Infra › rastreabilidade: toda RN-NNN da spec aparece no início de um título de teste` , `Infra › rastreabilidade: toda linha da seção 7 tem um teste Borda › <Caso>` e `Infra › rastreabilidade: toda RN-NNN tem exatamente um arquivo rn-NNN-*.test.ts`; removendo temporariamente um `it` de borda, a suíte fica vermelha
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-042** — Reescrever `README.md` com como instalar, rodar e testar (Node ≥ 24, `npm install`, `npm test`, `npm run typecheck`, comando `calcular`), apontando para `specs/001-motor-reembolso/` e `quickstart.md`
  - **Atende:** seção 9 (entrega: "como rodar e como testar", DESAFIO.md)
  - **Aceite:** seguir o README do zero num clone limpo reproduz as seções 1 a 4 do `quickstart.md` com o resultado esperado
  - **Commit:** `<hash preenchido depois>`

---

## Fase 5 — Envelope (criar no Dia 2)

<Novas tasks a partir da mudança de requisito. Numeração continua de onde parou —
não reinicie e não renumere as antigas: a numeração é o eixo da rastreabilidade.>

---

## Cobertura

Preencha ao fechar cada fase. É a sua própria checagem de rastreabilidade — e é
exatamente a matriz que a correção vai montar.

| Regra da spec | Task | Teste |
|---|---|---|
| RN-001 | T-006, T-026, T-033, T-035 | `RN-001 › 10.005 → 10.00 (meio, 0 é par)` (+ demais `RN-001 ›`), `Borda › Arredondamento meio-para-o-par no limiar` |
| RN-002 | T-007, T-022, T-028 | `RN-002 › "ALIMENTACAO", " Alimentação " e "alimentacao" viram alimentacao`, `RN-002 › "ALIMENTACAO" e "alimentacao" na mesma data somam no mesmo limite diário` |
| RN-003 | T-007, T-008, T-009, T-010, T-011, T-017, T-029, T-030, T-032, T-033, T-034, T-035, T-038 | `RN-003 › "data": "2026-07-32" → DADO_INVALIDO com data "2026-07-32" no eco` (+ demais `RN-003 ›`), `Borda › Data impossível` |
| RN-004 | T-012, T-017, T-022, T-028 | `RN-004 › d-009 (−45,00) → RECUSADO VALOR_NAO_POSITIVO, reembolsável 0,00`, `Borda › Estorno` |
| RN-005 | T-013, T-028, T-030 | `RN-005 › d-008 (2026-04-15, período de julho) → FORA_DO_PERIODO`, `Borda › Último dia do período` |
| RN-006 | T-014, T-028 | `RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBOLSAVEL`, `Borda › Categoria desconhecida` |
| RN-007 | T-015, T-017, T-023, T-029 | `RN-007 › d-006 segue e d-007 → DUPLICATA`, `Borda › Ambas sem fornecedor` |
| RN-008 | T-016, T-022, T-026, T-031, T-034 | `RN-008 › d-004 (100,01, sem NF) → NOTA_FISCAL_AUSENTE`, `Borda › Nota fiscal no limiar exato` |
| RN-009 | T-021, T-027 | `RN-009 › alimentação isolada de 60,00 → APROVADO 60,00`, `Borda › Exatamente no limite diário` |
| RN-010 | T-021, T-026, T-027 | `RN-010 › d-001 e d-002 em 03/07: 1ª PARCIAL 60,00, 2ª ESGOTADO`, `Borda › Várias no mesmo dia` |
| RN-011 | T-020, T-022, T-031 | `RN-011 › d-013 recusada por NF não torna 22 a 24/07 dias de viagem`, `Borda › Dia do check-out` |
| RN-012 | T-018, T-019, T-022, T-030 | `RN-012 › h1 14/07 "2 diarias" 480,00 e h2 15/07 "1 diaria" 200,00 → h1 APROVADO 480,00, h2 PARCIAL 10,00`, `Borda › Divisão com centavos` |
| RN-013 | T-023, T-035, T-036, T-037 | `RN-013 › LIMITE_DIARIO_EXCEDIDO cita limite, saldo disponível e valor cortado`, `RN-013 › exemplo: nenhum item com motivo ausente ou vazio` |
| RN-014 | T-024, T-032, T-036, T-040 | `RN-014 › total_solicitado ignora valores não positivos e nulos`, `Borda › Lista de despesas vazia` |
| RN-015 | T-025, T-038, T-040 | `RN-015 › CLI: arquivo sem periodo → código 1, stderr cita periodo, nenhum arquivo de saída`, `Borda › inicio depois de fim`, `Borda › colaborador.id vazio` |
| AMB-001 | T-021, T-027 | `RN-009 › categorias diferentes no mesmo dia têm limites independentes`, `Borda › Mesmo dia, categorias diferentes` |
| AMB-002 | T-021, T-027 | `RN-010 › d-001 e d-002 em 03/07: 1ª PARCIAL 60,00, 2ª ESGOTADO` |
| AMB-003 | T-021 | `RN-010 › d-014 (61,00) → PARCIAL 60,00` |
| AMB-004 | T-016, T-026 | `RN-008 › d-003 (100,00, sem NF) não é recusada por nota fiscal`, `Borda › Um centavo acima do limiar` |
| AMB-005 | T-016 | `RN-008 › 100.004 arredonda para 100,00 e não exige nota fiscal` |
| AMB-006 | T-016 | `RN-008 › d-013 (690,00, sem NF) → NOTA_FISCAL_AUSENTE` |
| AMB-007 | T-020, T-022, T-031 | `RN-011 › alimentação de 80,00 na data de hospedagem elegível → APROVADO 80,00 (limite 90,00)`, `Borda › Hospedagem recusada não gera viagem` |
| AMB-008 | T-018, T-019, T-030 | `RN-012 › "Hotel 5 estrelas - 2 diarias" → N = 2`, `Borda › Diárias fracionárias` |
| AMB-009 | T-013, T-028 | `RN-005 › d-008 (2026-04-15, período de julho) → FORA_DO_PERIODO` |
| AMB-010 | T-013 | `RN-005 › competencia divergente de inicio/fim é ignorada` |
| AMB-011 | T-015, T-029 | `RN-007 › só uma com fornecedor → as duas seguem`, `Borda › Fornecedor vazio` |
| AMB-012 | T-012, T-024, T-028 | `RN-004 › d-009 (−45,00) → RECUSADO VALOR_NAO_POSITIVO, reembolsável 0,00`, `RN-014 › total_solicitado ignora valores não positivos e nulos` |
| AMB-013 | T-006, T-026 | `RN-001 › 10.015 → 10.02 (meio, 2 é par)`, `Borda › Meio-para-o-par sobe` |
| AMB-014 | T-007, T-028 | `RN-002 › "ALIMENTACAO", " Alimentação " e "alimentacao" viram alimentacao`, `Borda › Categoria em maiúsculas` |
| AMB-015 | T-021, T-027 | `RN-010 › despesa que usa exatamente o saldo restante → APROVADO_INTEGRAL`, `Borda › Exatamente no limite diário` |
| AMB-016 | T-021, T-027 | `RN-009 › d-012 (sábado, 47,20) → APROVADO 47,20`, `Borda › Fim de semana` |
| AMB-017 | T-022, T-031 | `RN-008 › dia de viagem não amplia o limiar de nota fiscal`, `Borda › Viagem não altera o limiar de NF` |
| AMB-018 | T-008, T-010, T-025, T-032, T-034, T-038 | `RN-003 › id, data ou categoria nulos, vazios ou só com espaços → DADO_INVALIDO`, `RN-003 › CLI: despesa inválida não aborta (código 0)` |
| AMB-019 | T-014, T-028 | `RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBOLSAVEL` |
| AMB-020 | T-021, T-022, T-031 | `RN-009 › em dia de viagem alimentação vai a 90,00 e transporte a 120,00, hospedagem fica em 250,00` |
| AMB-021 | T-009, T-033 | `RN-003 › "45.00", "45,00" e 45.00 dão valor_solicitado 45,00`, `Borda › Separador de milhar` |
| AMB-022 | T-010, T-034 | `RN-003 › "tem_nota_fiscal": "sim" → DADO_INVALIDO`, `Borda › tem_nota_fiscal número` |
| AMB-023 | T-008, T-009, T-024, T-032, T-035 | `RN-003 › "valor": "R$ 45,00" → valor_solicitado nulo`, `Borda › Eco de campo inválido` |
| AMB-024 | T-011, T-032 | `RN-003 › " d-001 " depois de "d-001" → DADO_INVALIDO, com id " d-001 " no eco`, `Borda › id repetido com outra grafia` |
| AMB-025 | T-011, T-017, T-032 | `RN-003 › "d-001" com data inválida, depois "d-001" válido → o 2º segue (correção, AMB-025)`, `RN-003 › id de despesa recusada por FORA_DO_PERIODO continua reservado (AMB-025)`, `Borda › Correção de item inválido`, `Borda › id de item recusado depois da validação` |
| AMB-026 | T-007, T-008, T-015, T-018, T-029, T-030 | `RN-007 › fornecedor 123 e "123" são o mesmo fornecedor`, `RN-012 › descricao nula ou 2 (número) → N = 1`, `Borda › Descrição não textual` |
| AMB-027 | T-025, T-040 | `RN-015 › colaborador.id "", "  ", null ou 123 → erro cuja mensagem cita colaborador.id`, `Borda › Arquivo que não é objeto` |

**IDs sem cobertura:** nenhum.

**Casos de borda da seção 7:** 80 linhas → T-026 (7), T-027 (6), T-028 (8), T-029 (10), T-030 (13), T-031 (6), T-032 (12), T-033 (7), T-034 (5), T-040 (6).

---

## Notas para a implementação

- **T-011 (resolvido):** o ponto sobre `id` de despesa anterior já recusada
  foi decidido na spec 1.2 (AMB-025, D-017): só despesa validada reserva o
  `id`. T-011, T-017, T-032 e a Cobertura foram atualizadas sem renumeração.
- **`/speckit-analyze` (D-018, spec 1.3):** fornecedor/descrição de qualquer
  tipo viram texto (T-007, T-008, T-015, T-018, T-029, T-030); RN-015 com o
  critério de ausente da RN-003 (T-025, T-040); `limite_diario_aplicado`
  250,00 em "Diárias na descrição" (T-030); T-024 sem `[P]` (edita
  `motor.ts`, como a T-023); um arquivo de teste por RN, sem
  `motor.test.ts` (T-016, T-017, T-022, T-041). Sem renumeração.
- **Dependências:** T-001 → (T-002, T-003, T-004 em paralelo) → T-005 → Fase 2.
  Dentro de `despesa.ts` (T-008 → T-011) e de `elegibilidade.ts`
  (T-012 → T-016) a ordem é sequencial. T-017 precisa de T-011 e T-016;
  T-022 precisa de T-017 a T-021. A Fase 3 precisa de T-024. T-040 precisa
  de T-038; T-041 fecha a Fase 4 e só fica verde com todos os testes de RN e
  de borda escritos.
