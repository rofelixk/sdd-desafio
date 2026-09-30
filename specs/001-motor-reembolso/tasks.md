# Tasks — Motor de Cálculo de Reembolso

> Cada task é pequena o bastante para virar **um commit**. Se você não consegue
> descrever o critério de aceite como "o teste X passa", a task está grande demais.
>
> Marque `[x]` conforme conclui — ao longo do caminho, não tudo no fim. O histórico
> de quando cada task foi marcada é lido na correção.

**Formato do commit:** `feat(T-003): <descrição>` · `test(T-003): <descrição>`

**Base:** Fases 1–4: `spec.md` v1.3 · `plan.md` v1.2. Fase 5: `spec.md` v2.2 · `plan.md` v2.0 · `data-model.md` · `research.md` (R-11 a R-17) · `contracts/`

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

- [x] **T-032** — Casos de borda de `id`, `data`, `categoria` e eco inválidos em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-003, RN-014, AMB-018, AMB-023, AMB-024, AMB-025
  - **Aceite:** passam `Borda › Data impossível`, `Borda › id repetido`, `Borda › id repetido com outra grafia`, `Borda › Correção de item inválido`, `Borda › id de item recusado depois da validação`, `Borda › Valor inválido na saída`, `Borda › Eco de campo inválido`, `Borda › Despesa que não é objeto`, `Borda › Categoria vazia`, `Borda › Categoria não textual`, `Borda › id vazio` e `Borda › data nula`
  - **Commit:** `d7ab5eb`

- [x] **T-033** — Casos de borda de `valor` como texto em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-003, RN-001, RN-004, AMB-021
  - **Aceite:** passam `Borda › Valor como texto com ponto`, `Borda › Valor como texto com vírgula`, `Borda › Valor texto com 3 casas`, `Borda › Valor texto negativo`, `Borda › Separador de milhar`, `Borda › Símbolo de moeda` e `Borda › Valor booleano`
  - **Commit:** `087ac52`

- [x] **T-034** — Casos de borda de `tem_nota_fiscal` em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-003, RN-008, AMB-018, AMB-022
  - **Aceite:** passam `Borda › tem_nota_fiscal ausente, valor 150,00`, `Borda › tem_nota_fiscal nulo ou "", valor 150,00`, `Borda › tem_nota_fiscal vazio, valor 50,00`, `Borda › tem_nota_fiscal texto` e `Borda › tem_nota_fiscal número`
  - **Commit:** `dfac0c5`

## Fase 4 — Saída e CLI

- [x] **T-035** — Criar `src/io/saida.ts` com `montarSaida(resultado, entrada)`: objeto na ordem de campos da seção 4 (`colaborador`, `periodo`, `itens`, `resumo`), `colaborador`/`periodo` ecoados brutos, dinheiro via `JSON.rawJSON(formatarDecimal(c))`, ecos brutos de item inválido reemitidos como vieram (`NumeroJson` com o mesmo texto, ausente → `null`)
  - **Atende:** RN-001, RN-003, RN-013, AMB-023
  - **Aceite:** em `tests/io/saida.test.ts` passam `RN-001 › valores monetários saem com duas casas (60.00, não 60; 0.00, não 0)`, `RN-003 › eco de campo inválido sai como veio (categoria 123 → 123, "  " → "  ", ausente → null)`, `RN-003 › valor_solicitado nulo sai como null` e `Infra › saída: colaborador e periodo ecoados com os números no texto original`
  - **Commit:** `18fa1d1`

- [x] **T-036** — [P] Teste do arquivo oficial em `tests/exemplo.test.ts`: lê `exemplos/despesas-exemplo.json`, roda `validarEntrada` → motor → `montarSaida` e compara com a tabela da seção 9 da spec. Um `it` por despesa, com o ID da regra do código esperado
  - **Atende:** RN-001, RN-004, RN-005, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-014 (seção 9)
  - **Aceite:** passam `RN-010 › exemplo d-001: PARCIAL 60,00`, `RN-010 › exemplo d-002: RECUSADO LIMITE_DIARIO_ESGOTADO`, `RN-010 › exemplo d-003: PARCIAL 80,00`, `RN-008 › exemplo d-004: NOTA_FISCAL_AUSENTE`, `RN-006 › exemplo d-005: CATEGORIA_NAO_REEMBOLSAVEL`, `RN-009 › exemplo d-006: APROVADO 54,90`, `RN-007 › exemplo d-007: DUPLICATA`, `RN-005 › exemplo d-008: FORA_DO_PERIODO`, `RN-004 › exemplo d-009: VALOR_NAO_POSITIVO`, `RN-012 › exemplo d-010: APROVADO 480,00, diarias 2`, `RN-011 › exemplo d-011: APROVADO 33,33, em_viagem true, limite 90,00`, `RN-009 › exemplo d-012: APROVADO 47,20`, `RN-008 › exemplo d-013: NOTA_FISCAL_AUSENTE`, `RN-010 › exemplo d-014: PARCIAL 60,00`, `RN-014 › exemplo: resumo 1861.84 / 815.43 / 1046.41 · 4/3/7` e `RN-013 › exemplo: nenhum item com motivo ausente ou vazio`
  - **Commit:** `fadedb0`

- [x] **T-037** — [P] Teste de contrato em `tests/contrato-saida.test.ts`: valida a saída contra `contracts/saida.schema.json` com `ajv` (`multipleOfPrecision: 2`)
  - **Atende:** RN-013, RN-003 (seção 4)
  - **Aceite:** passam `RN-013 › saída do exemplo valida contra contracts/saida.schema.json` e `RN-013 › saída com itens DADO_INVALIDO (valor_solicitado nulo, ecos brutos) valida contra o schema`
  - **Commit:** `702de1c`

- [x] **T-038** — Criar `src/cli.ts` (R-08, DT-004, `contracts/cli.md`): `parseArgs` com subcomando `calcular` e `--input`/`--output` obrigatórios; lê, valida, calcula e serializa tudo em memória antes de `writeFile`; sucesso → código 0 e uma linha de resumo no `stdout`; `ErroEntrada`/falha de leitura → `erro: <mensagem>` no `stderr` e código 1, sem criar nem alterar a saída; uso incorreto → `uso: ...` e código 2
  - **Atende:** RN-015, RN-003, AMB-018
  - **Aceite:** em `tests/cli.test.ts` (processo filho) passam `RN-015 › CLI: arquivo sem periodo → código 1, stderr cita periodo, nenhum arquivo de saída`, `RN-015 › CLI: arquivo de entrada inexistente → código 1, nenhum arquivo de saída`, `RN-015 › CLI: arquivo que não é JSON → código 1`, `RN-015 › CLI: em erro, arquivo de saída pré-existente não é alterado`, `RN-003 › CLI: despesa inválida não aborta (código 0)`, `Infra › CLI: exemplo → código 0, resumo no stdout, JSON indentado com \n final` e `Infra › CLI: subcomando ou opção ausente → código 2 com "uso:"`
  - **Commit:** `3feda6b`

- [x] **T-039** — Teste de determinismo em `tests/cli.test.ts`
  - **Atende:** seção 9 (critério "duas execuções geram saídas idênticas")
  - **Aceite:** passa `Infra › CLI: duas execuções com a mesma entrada geram bytes idênticos`
  - **Commit:** `45f2d25`

- [x] **T-040** — Casos de borda de arquivo em `tests/casos-de-borda.test.ts`: lista vazia pelo motor; os casos de RN-015 pelo CLI (processo filho), conferindo que o arquivo de saída não existe e que o `stderr` cita o campo
  - **Atende:** RN-014, RN-015, AMB-027
  - **Aceite:** passam `Borda › Lista de despesas vazia`, `Borda › Arquivo sem periodo`, `Borda › inicio depois de fim`, `Borda › colaborador.id vazio`, `Borda › periodo.inicio não textual` e `Borda › Arquivo que não é objeto`
  - **Commit:** `247de37`

- [x] **T-041** — Criar `tests/rastreabilidade.test.ts` (DT-005): lê `specs/001-motor-reembolso/spec.md`, extrai todo `### RN-NNN` e a 1ª coluna da tabela da seção 7 (sem as crases), lê os títulos de teste em `tests/**/*.test.ts` e falha listando o que ficou sem teste; confere também que toda RN tem **exatamente um** arquivo `tests/**/rn-NNN-*.test.ts`
  - **Atende:** RN-001, RN-002, RN-003, RN-004, RN-005, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-014, RN-015 (seção 9, critérios 2 e 3)
  - **Aceite:** passam `Infra › rastreabilidade: toda RN-NNN da spec aparece no início de um título de teste` , `Infra › rastreabilidade: toda linha da seção 7 tem um teste Borda › <Caso>` e `Infra › rastreabilidade: toda RN-NNN tem exatamente um arquivo rn-NNN-*.test.ts`; removendo temporariamente um `it` de borda, a suíte fica vermelha
  - **Commit:** `65e8dc0`

- [x] **T-042** — Reescrever `README.md` com como instalar, rodar e testar (Node ≥ 24, `npm install`, `npm test`, `npm run typecheck`, comando `calcular`), apontando para `specs/001-motor-reembolso/` e `quickstart.md`
  - **Atende:** seção 9 (entrega: "como rodar e como testar", DESAFIO.md)
  - **Aceite:** seguir o README do zero num clone limpo reproduz as seções 1 a 4 do `quickstart.md` com o resultado esperado
  - **Commit:** `d180c28`

---

## Fase 5 — Envelope (criar no Dia 2)

> Política v4 (D-019 a D-021): tabela de limites por centro de custo lida de
> fora, moeda estrangeira e aprovação manual. As tasks da v1 que a v4 afeta
> (lista em D-019) **não** são reabertas: cada mudança entra numa task nova,
> que cita a antiga quando a estende.
>
> **Convenções extras da Fase 5** (plan §2, §6, R-10, R-11):
>
> - **Suíte vermelha conhecida:** desde a spec 2.2, `tests/rastreabilidade.test.ts`
>   (RN-016 a RN-018 e 41 casos de borda sem teste) e `tests/contrato-saida.test.ts`
>   (schema já na v4) falham. Até a T-066 (contrato) e a T-070
>   (rastreabilidade), o "Aceite" de cada task é: os testes listados passam,
>   `npm run typecheck` sem erros e **nenhuma falha além dessas duas**.
> - **Fixture da v4:** os testes de regra e de borda usam a tabela de
>   `exemplos/envelope/politica-v4.json` e o câmbio de
>   `exemplos/envelope/cambio.json`, carregados por `tests/apoio.ts`, **nunca**
>   `dados/`. Sem centro de custo e sem `moeda`, os testes da v1 continuam
>   valendo sem mudar a expectativa (tabela padrão, BRL).
> - **Arquivos de teste novos:** `tests/nucleo/rn-016-politica-centro-custo.test.ts`
>   (`describe('RN-016 — Política por centro de custo')`),
>   `tests/nucleo/rn-017-cambio.test.ts` (`describe('RN-017 — Moeda e conversão para reais')`)
>   e `tests/nucleo/rn-018-aprovacao.test.ts`
>   (`describe('RN-018 — Aprovação manual de itens acima de R$ 500')`). Testes
>   `RN-015 ›` dos arquivos externos ficam em `tests/io/rn-015-entrada.test.ts`.

### 5.1 Fundação da v4

- [x] **T-043** — Acrescentar em `src/nucleo/tipos.ts` os tipos novos do `data-model.md` §2–§3, **sem remover nem alterar** os da v1: `Decimal` (`{ digitos: bigint; escala: number }`), `Moeda`, `Periodicidade` (`'dia' | 'diaria'`), `RegraCategoria`, `TabelaCategorias`, `Politica`, `Cotacao`, `Cambio`, `TabelaAplicavel` e `Conversao` (`{ taxa: NumeroJson; dataCotacao: DataISO | null; valorSolicitado: Centavos }`). `Categoria`, `Status`, a união de códigos, `Entrada`, `DespesaValida` e `ResultadoItem` só mudam nas tasks que os usam (T-048, T-050, T-055, T-056, T-058)
  - **Atende:** RN-016, RN-017, AMB-043
  - **Aceite:** `npm run typecheck` sem erros e `npm test` sem falhas além das duas conhecidas
  - **Commit:** `063c073`

- [x] **T-044** — [P] Criar `src/nucleo/decimal.ts` (R-13): `decimalDe(texto)` lê sinal, dígitos, ponto e expoente (o mesmo leitor de `paraCentavos`) e devolve `Decimal`; `dividirMeioParaPar(numerador: bigint, denominador: bigint): bigint` é o único arredondamento do sistema. `paraCentavos` em `src/nucleo/dinheiro.ts` passa a usá-la
  - **Atende:** RN-001, AMB-013, AMB-037
  - **Aceite:** em `tests/nucleo/decimal.test.ts` passam `Infra › decimal: "5.93" → 593 × 10^-2, "50" → 50 × 10^0 e "1.00005e2" → 100005 × 10^-3` e `Infra › decimal: dividirMeioParaPar 25/10 → 2, 35/10 → 4, 26/10 → 3, 24/10 → 2 e -25/10 → -2`; todos os `RN-001 ›` de `tests/nucleo/rn-001-arredondamento.test.ts` continuam passando
  - **Commit:** `d660733`

- [x] **T-045** — Criar `src/io/politica.ts` (R-12): `lerPolitica(texto, rotulo = 'tabela de limites (dados/politica.json)')` → `Politica` ou lança `ErroEntrada`, com a mensagem começando pelo `rotulo` e citando o caminho do campo (`centros_custo.CC-ADM.alimentacao.limite`). Valida a lista da RN-016 e a AMB-044: objeto; `versao` texto não vazio; `vigencia` data válida (T-004); `moeda_base` = `"BRL"`; `padrao` e `centros_custo` objetos; cada centro de custo e cada categoria objeto; `limite` número ≥ 0 exato em centavos; `periodicidade` `dia`/`diaria`, com `diaria` ⇔ `hospedagem`; `nota_fiscal_obrigatoria_acima_de` e `acrescimo_em_viagem_percentual` números ≥ 0 (viram `Decimal`); centros de custo e categorias de uma mesma tabela sem colisão depois de `normalizar` (T-007). `observacao` e campos desconhecidos são ignorados. Guarda o nome do centro de custo como está escrito
  - **Atende:** RN-015, RN-016, AMB-034, AMB-044
  - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `RN-015 › tabela de limites de exemplos/envelope/politica-v4.json é lida: versao v4, padrão com 3 categorias, 3 centros de custo, limiar 100.00 e acréscimo 50`, `RN-015 › tabela de limites com "limite": -10 → erro que cita a tabela de limites e o campo`, `RN-015 › tabela de limites: limite que não é número ou com mais de 2 casas (60.001) → erro que cita o campo`, `RN-015 › tabela de limites sem versao, com versao vazia ou com vigencia que não é data → erro que cita o campo`, `RN-015 › tabela de limites: moeda_base diferente de BRL → erro`, `RN-015 › tabela de limites: periodicidade fora de dia/diaria, diaria em alimentacao ou hospedagem com dia → erro`, `RN-015 › tabela de limites: nota_fiscal_obrigatoria_acima_de ou acrescimo_em_viagem_percentual ausente, não numérico ou negativo → erro`, `RN-015 › tabela de limites: "CC-ADM" e " cc-adm " em centros_custo, ou "Alimentação" e "alimentacao" na mesma tabela → erro`, `RN-015 › tabela de limites: arquivo, padrao, centros_custo, centro de custo ou categoria que não é objeto → erro`, `RN-015 › tabela de limites: observacao e campos desconhecidos são ignorados` e `RN-015 › tabela de limites que não é JSON → erro que cita a tabela de limites`
  - **Commit:** `dbb0f6e`

- [x] **T-046** — Criar `src/io/cambio.ts` (R-12, R-14): `lerCambio(texto, rotulo = 'arquivo de câmbio (dados/cambio.json)')` → `Cambio` ou lança `ErroEntrada` (mesmo formato de mensagem da T-045). Valida a lista da RN-017 e a AMB-044: objeto; `moeda_base` = `"BRL"`; `taxas` objeto; cada chave de `taxas` data válida; cada valor de data objeto; cada moeda com 3 letras; cada taxa número > 0, **inclusive** a de uma moeda repetida que vai ser sobrescrita. Monta o índice `Map<Moeda, Cotacao[]>` com a moeda em maiúsculas (`normalizarMoeda`, criada aqui em `src/nucleo/texto.ts`: `trim` + `toUpperCase`), datas em ordem crescente e, para a mesma moeda na mesma data, a **última** do arquivo. `fonte`, `observacao` e campos desconhecidos são ignorados
  - **Atende:** RN-015, RN-017, AMB-042, AMB-044
  - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `RN-015 › câmbio de exemplos/envelope/cambio.json é lido: USD e EUR com 12 cotações cada, em ordem de data`, `RN-015 › câmbio: moeda_base diferente de BRL, ou taxas ausente ou que não é objeto → erro que cita o arquivo de câmbio`, `RN-015 › câmbio: chave de taxas que não é data válida (2026-07-32) ou valor de data que não é objeto → erro que cita o campo`, `RN-015 › câmbio: moeda sem 3 letras ("EURO", "US") → erro`, `RN-015 › câmbio: taxa 0, negativa ou texto → erro, inclusive numa moeda repetida que acaba sobrescrita`, `RN-015 › câmbio: fonte, observacao e campos desconhecidos são ignorados` e `RN-015 › câmbio que não é JSON → erro que cita o arquivo de câmbio`; em `tests/nucleo/rn-017-cambio.test.ts` passam `RN-017 › câmbio: "usd" no arquivo é indexado como USD`, `RN-017 › câmbio: "USD": 5.42 e depois "usd": 5.50 na mesma data → vale 5.50, sem erro` e `RN-017 › câmbio: datas fora de ordem no arquivo ficam em ordem crescente no índice`
  - **Commit:** `231f34a`

- [x] **T-047** — Criar `dados/politica.json` e `dados/cambio.json` como cópias byte a byte de `exemplos/envelope/politica-v4.json` e `exemplos/envelope/cambio.json`, e `src/io/externos.ts` (R-11, DT-006): `CAMINHO_POLITICA` e `CAMINHO_CAMBIO` resolvidos a partir de `import.meta.dirname` (`../../dados/`), e `lerExternos(caminhos = { politica: CAMINHO_POLITICA, cambio: CAMINHO_CAMBIO })` → `{ politica, cambio }`, lendo a tabela **antes** do câmbio (T-045, T-046). Arquivo ausente ou ilegível → `ErroEntrada` `"<rótulo> (<caminho relativo à raiz>): arquivo não encontrado"`
  - **Atende:** RN-015, AMB-028
  - **Aceite:** em `tests/io/externos.test.ts` passa `Infra › externos: caminhos apontam para <raiz>/dados/, independente de process.cwd()`; em `tests/io/rn-015-entrada.test.ts` passam `RN-015 › arquivo de câmbio ausente → erro que cita o arquivo de câmbio`, `RN-015 › tabela de limites ausente → erro que cita a tabela de limites` e `RN-015 › tabela e câmbio inválidos → a mensagem é a da tabela (ordem de leitura)`; `git diff --no-index exemplos/envelope/politica-v4.json dados/politica.json` e o mesmo para o câmbio não mostram diferença
  - **Commit:** `5c6414a`

- [ ] **T-048** — Ler `colaborador.centro_custo` em `src/io/entrada.ts` (estende T-025): `Entrada` ganha `centroCusto: string | null`; ausente, nulo, texto vazio ou só espaços → `null`; texto → como veio (a normalização é da T-049); qualquer outro tipo → `ErroEntrada` que cita `colaborador.centro_custo`. `tests/apoio.ts` passa a preencher `centroCusto` (padrão `null`). O motor ainda não lê o campo
  - **Atende:** RN-015, AMB-032
  - **Aceite:** em `tests/io/rn-015-entrada.test.ts` passam `RN-015 › "centro_custo": 42, true, [] ou {} → erro que cita colaborador.centro_custo` e `RN-015 › centro_custo ausente, null, "" ou "  " é aceito (centroCusto nulo)`
  - **Commit:** `<hash preenchido depois>`

### 5.2 Regras de negócio da v4

- [ ] **T-049** — Em `src/nucleo/politica.ts`, acrescentar `LIMIAR_APROVACAO = 500_00n` (com `// RN-018, AMB-040`) e `tabelaAplicavel(politica, centroCusto)` → `TabelaAplicavel` (RN-016): `centroCusto` nulo ou sem entrada em `centros_custo` (comparado com `normalizar`) → `padrao` inteiro, `nome` `"padrao"`; com entrada → cada categoria do centro de custo por cima do padrão, categoria que falta herda do padrão (`origem: 'padrao'`), limite 0 **não** herda; `nome` = centro de custo como está escrito na tabela; limiar de NF e acréscimo únicos. `POLITICA` continua existindo até a T-050
  - **Atende:** RN-016, AMB-029, AMB-030, AMB-031, AMB-032
  - **Aceite:** em `tests/nucleo/rn-016-politica-centro-custo.test.ts` passam `RN-016 › CC-SUPORTE-N2 (sem entrada) → tabela "padrao", alimentação 60,00`, `RN-016 › " cc-comercial " → tabela "CC-COMERCIAL"`, `RN-016 › sem centro de custo → tabela "padrao"`, `RN-016 › CC-ADM sem hospedagem → hospedagem 250,00 herdada do padrão`, `RN-016 › CC-ENG-PLATAFORMA: hospedagem com limite 0 não herda do padrão`, `RN-016 › representacao só existe na tabela do CC-COMERCIAL` e `RN-016 › limiar de nota fiscal e acréscimo de viagem são os da tabela, iguais para todo centro de custo`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-050** — Refatorar o núcleo para receber a `TabelaAplicavel` no lugar de `POLITICA`, **sem mudar comportamento** na tabela padrão (plan §2, §8 "resistiu"; R-15): `Categoria` vira texto normalizado; categoria reconhecida (RN-002, RN-006) = chave da tabela aplicável; `elegibilidade.ts` compara o limiar de NF da tabela com `Decimal`, sem arredondar (RN-008); `limites.ts` inicia o saldo com o limite da tabela e, em dia de viagem e periodicidade `dia`, usa `dividirMeioParaPar(limite × (100 + p), 100)` (RN-011, AMB-033; sai o `throw` de limite inexato); `viagem.ts` e `diarias.ts` disparam por `periodicidade === 'diaria'`; `motivos.ts` usa um mapa de nomes só de apresentação com volta para a própria chave. `motor.calcular(entrada, tabela)`; `src/cli.ts` lê `dados/politica.json` por `lerExternos` (T-047) e passa `tabelaAplicavel(politica, null)` (o centro de custo entra na T-051); `tests/apoio.ts` monta a tabela da fixture da v4 com um centro de custo opcional. Remover `POLITICA` e trocar o teste de `tests/nucleo/politica.test.ts`
  - **Atende:** RN-002, RN-006, RN-008, RN-009, RN-011, RN-012, AMB-020, AMB-033
  - **Aceite:** todos os testes das Fases 1–4 continuam passando sem mudar expectativa; em `tests/nucleo/politica.test.ts` passa `Infra › política: src/nucleo/politica.ts não tem limite, limiar de nota fiscal nem percentual (só LIMIAR_APROVACAO e tabelaAplicavel)`; em `tests/nucleo/rn-011-viagem.test.ts` passa `RN-011 › limite 60,01 ampliado em 50% → 90,02 e 60,03 → 90,04 (meio para o par, AMB-033)`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-051** — Ligar o centro de custo: `motor.calcular(entrada, politica)` monta a `TabelaAplicavel` uma vez com `entrada.centroCusto` (seção 8, "antes de tudo") e `Resultado` ganha `politica: { versao, tabela }`; `src/cli.ts` passa a `Politica`. `tests/exemplo.test.ts` passa a usar a tabela de `exemplos/envelope/politica-v4.json` e a tabela 1 da seção 9 (colaborador do CC-ENG-PLATAFORMA), substituindo os títulos da T-036
  - **Atende:** RN-016, RN-005, RN-006, RN-009, RN-010, RN-014, AMB-029, AMB-032, AMB-034
  - **Aceite:** em `tests/nucleo/rn-016-politica-centro-custo.test.ts` passam `RN-016 › CC-SUPORTE-N2: alimentação 65,00 → PARCIAL 60,00`, `RN-016 › " cc-comercial ": alimentação 85,00 → APROVADO 85,00`, `RN-016 › CC-ADM: hospedagem 1 diária 300,00 → PARCIAL 250,00`, `RN-016 › representacao no CC-SUPORTE-N2 → CATEGORIA_NAO_REEMBOLSAVEL`, `RN-016 › limite de alimentação do padrão trocado para 70,00 na tabela: alimentação 65,00 passa de PARCIAL a APROVADO` e `RN-016 › vigencia 2026-08-01 não recusa nem muda despesas de julho (AMB-034)`; em `tests/exemplo.test.ts` passam `RN-009 › exemplo d-001: APROVADO 72,50 (limite 75,00 do CC-ENG-PLATAFORMA)`, `RN-010 › exemplo d-002: PARCIAL 2,50`, `RN-010 › exemplo d-003: PARCIAL 80,00`, `RN-008 › exemplo d-004: NOTA_FISCAL_AUSENTE`, `RN-006 › exemplo d-005: CATEGORIA_NAO_REEMBOLSAVEL`, `RN-009 › exemplo d-006: APROVADO 54,90`, `RN-007 › exemplo d-007: DUPLICATA`, `RN-005 › exemplo d-008: FORA_DO_PERIODO`, `RN-004 › exemplo d-009: VALOR_NAO_POSITIVO`, `RN-001 › exemplo d-011: APROVADO 33,33`, `RN-009 › exemplo d-012: APROVADO 47,20`, `RN-009 › exemplo d-014: APROVADO 61,00`, `RN-014 › exemplo: resumo 1861.84 / 351.43 / 1510.41 · 5/2/7` e `RN-016 › exemplo: tabela aplicada CC-ENG-PLATAFORMA` (d-010 e d-013 entram na T-052)
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-052** — Categoria com limite 0 na etapa 5 (estende T-014) em `src/nucleo/elegibilidade.ts`: reembolsável = limite > 0 na tabela aplicável; `Recusa(CATEGORIA_NAO_REEMBOLSAVEL)` leva `{ categoria, tabela, caso: 'ausente' | 'limite_zero', centroCusto }`. Em `src/nucleo/motivos.ts`, `ausente` diz que a categoria não consta na tabela (padrão ou do centro de custo) da política `<versao>`, e `limite_zero` diz que ela não é reembolsável no centro de custo e cita o nome dele
  - **Atende:** RN-006, RN-002, RN-011, AMB-019, AMB-030, AMB-031
  - **Aceite:** em `tests/nucleo/rn-006-categorias.test.ts` passam `RN-006 › hospedagem no CC-ENG-PLATAFORMA → CATEGORIA_NAO_REEMBOLSAVEL, descrição cita "CC-ENG-PLATAFORMA"`, `RN-006 › representacao na tabela padrão → CATEGORIA_NAO_REEMBOLSAVEL, descrição diz que não consta na política` e `RN-006 › limite 0 recusa na etapa 5: hospedagem 690,00 sem NF no CC-ENG-PLATAFORMA sai CATEGORIA_NAO_REEMBOLSAVEL`; em `tests/nucleo/rn-011-viagem.test.ts` passa `RN-011 › hospedagem com limite 0 no centro de custo não gera dia de viagem`; em `tests/nucleo/rn-002-categoria.test.ts` passa `RN-002 › "Representação" é representacao no CC-COMERCIAL e sai como veio na tabela padrão`; em `tests/exemplo.test.ts` passam `RN-006 › exemplo d-010: CATEGORIA_NAO_REEMBOLSAVEL (hospedagem com limite 0)` e `RN-006 › exemplo d-013: CATEGORIA_NAO_REEMBOLSAVEL (antes da nota fiscal)`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-053** — Testes de limite, viagem e nota fiscal com a tabela de outro centro de custo e com a tabela alterada em memória. Se algum falhar, o conserto faz parte desta task
  - **Atende:** RN-008, RN-009, RN-010, RN-011, AMB-029, AMB-033
  - **Aceite:** passam, em `tests/nucleo/rn-009-limites.test.ts`, `RN-009 › alimentação 80,00 no CC-COMERCIAL → APROVADO 80,00 (limite 90,00)` e `RN-009 › alimentação 50,00 no CC-ADM → PARCIAL 45,00`; em `tests/nucleo/rn-010-parcial.test.ts`, `RN-010 › CC-ENG-PLATAFORMA (75,00): d-001 72,50 → APROVADO 72,50 e d-002 38,00 → PARCIAL 2,50`; em `tests/nucleo/rn-011-viagem.test.ts`, `RN-011 › CC-COMERCIAL: representacao 420,00 em dia de viagem → APROVADO 420,00 (limite 450,00)` e `RN-011 › acréscimo trocado para 20 na tabela: alimentação em dia de viagem tem limite 72,00`; em `tests/nucleo/rn-008-nota-fiscal.test.ts`, `RN-008 › limiar trocado para 150,00 na tabela: 120,00 sem NF não é recusada`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-054** — [P] Criar `src/nucleo/cambio.ts` (DT-007, R-13, R-14): `converter(valorOriginal, moeda, data, cambio)` → `Conversao | null`. `BRL` → `{ taxa: NumeroJson "1", dataCotacao: null, valorSolicitado: valorOriginal }`, sem olhar a data. Outra moeda → último elemento do índice com `data ≤ D` (busca binária, comparação de texto); `valorSolicitado = dividirMeioParaPar(valorOriginal × taxa.digitos, 10^taxa.escala)`; sem cotação até D (ou moeda fora do índice) → `null`
  - **Atende:** RN-017, RN-001, AMB-035, AMB-037
  - **Aceite:** em `tests/nucleo/rn-017-cambio.test.ts` passam `RN-017 › e-002 (22,00 EUR em 14/07) → taxa 5.93, cotação 2026-07-14, R$ 130,46`, `RN-017 › e-004 (30,00 EUR no sábado 18/07) → taxa 5.96 de 2026-07-17, R$ 178,80`, `RN-017 › 10,05 USD em 13/07 × 5,42 = 54,471 → R$ 54,47`, `RN-017 › 0,50 USD em 16/07 × 5,41 = 2,705 → R$ 2,70 (meio para o par, AMB-037)`, `RN-017 › EUR em 2026-07-10 (antes da primeira cotação) → sem conversão`, `RN-017 › GBP e EURO (fora do câmbio) → sem conversão`, `RN-017 › BRL → taxa 1, data_cotacao nula, valor igual ao original` e `RN-017 › cotação antiga continua valendo: EUR em 2026-12-31 usa a de 2026-07-28 (AMB-035)`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-055** — Validar `moeda` em `src/nucleo/despesa.ts` (estende T-008): ausente, nula, texto vazio ou só espaços → `"BRL"`; texto → `normalizarMoeda` (T-046), **sem checagem de formato**; outro tipo (número, booleano, lista, objeto) → `DADO_INVALIDO`. `DespesaValida` ganha `moeda`; `RecusaDadoInvalido` ganha o eco bruto de `moeda` (ausente → `null`)
  - **Atende:** RN-003, AMB-036, AMB-023
  - **Aceite:** em `tests/nucleo/rn-003-validacao.test.ts` passam `RN-003 › "moeda": " eur " vale EUR`, `RN-003 › moeda ausente, null, "" ou "  " vale BRL`, `RN-003 › "moeda": 978, true, [] ou {} → DADO_INVALIDO com a moeda como veio no eco` e `RN-003 › "moeda": "EURO" passa pela validação (moeda EURO)`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-056** — Ligar a conversão (etapas 1 e 6, DT-007): `validarDespesa` recebe o `Cambio` e `DespesaValida` troca `valorSolicitado` por `valorOriginal` + `conversao` (T-054). `RecusaDadoInvalido` guarda `valorOriginal` (nulo se `valor` não numérico) e `conversao` (nula se `valor` não numérico, AMB-043; BRL com `valor` numérico e `data` inválida → taxa 1; estrangeira com `data` inválida → nula). Em `elegibilidade.ts`: etapa 3 recusa `valorOriginal ≤ 0` ou valor em reais ≤ 0 (RN-004); nova etapa 6 `verificarCambio` → `Recusa(CAMBIO_INDISPONIVEL)` com `{ moeda, data }` quando `conversao` é nula, entre categoria e duplicata; etapa 8 compara o limiar com o valor em reais; a chave de duplicata usa `valorOriginal` (a moeda entra na T-057). Parcelas, alocação e `total_solicitado` usam o valor em reais. `ResultadoItem` ganha `moeda`, `valorOriginal` e `conversao` (o `valor_solicitado` da saída sai de `conversao`). Código `CAMBIO_INDISPONIVEL` na união e um modelo simples em `motivos.ts` (texto completo na T-060). `motor.calcular(entrada, politica, cambio)`; `src/cli.ts` lê o câmbio pelo `lerExternos`; `tests/apoio.ts` carrega o câmbio da fixture
  - **Atende:** RN-017, RN-001, RN-003, RN-004, RN-008, RN-012, RN-014, AMB-025, AMB-036, AMB-037, AMB-038, AMB-039, AMB-043
  - **Aceite:** passam, em `tests/nucleo/rn-017-cambio.test.ts`, `RN-017 › e-006 (55,00 GBP) → CAMBIO_INDISPONIVEL, valor_solicitado nulo`, `RN-017 › 10,00 "EURO" → CAMBIO_INDISPONIVEL, e não DADO_INVALIDO`, `RN-017 › EUR em 2026-07-10 → CAMBIO_INDISPONIVEL`, `RN-017 › EUR em 2026-06-30 num período de julho → FORA_DO_PERIODO, e não CAMBIO_INDISPONIVEL`, `RN-017 › GBP com categoria coworking → CATEGORIA_NAO_REEMBOLSAVEL (etapa 5 antes da 6)`, `RN-017 › e-010 (sem moeda) → BRL, taxa_cambio 1` e `RN-017 › limite compara o valor em reais: 22,00 EUR (R$ 130,46) de alimentação na tabela padrão → PARCIAL 60,00`; em `tests/nucleo/rn-004-valor-nao-positivo.test.ts`, `RN-004 › −10,00 GBP (sem cotação) → VALOR_NAO_POSITIVO` e `RN-004 › 0,01 numa moeda de taxa 0.20 → R$ 0,00 → VALOR_NAO_POSITIVO`; em `tests/nucleo/rn-008-nota-fiscal.test.ts`, `RN-008 › e-005 (40,00 USD × 5,50 = R$ 220,00, sem NF) → NOTA_FISCAL_AUSENTE` e `RN-008 › e-003 (14,50 EUR × 5,88 = R$ 85,26, sem NF) não é recusada por nota fiscal`; em `tests/nucleo/rn-003-validacao.test.ts`, `RN-003 › id de despesa recusada por CAMBIO_INDISPONIVEL continua reservado (AMB-025)`, `RN-003 › valor inválido: valor_original e os três campos de conversão nulos, mesmo em BRL ou com cotação (AMB-043)`, `RN-003 › BRL com valor numérico e data inválida → DADO_INVALIDO com taxa 1 e valor_solicitado preenchido`, `RN-003 › EUR com valor numérico e data inválida → DADO_INVALIDO com conversão nula` e `RN-003 › DADO_INVALIDO por outro campo, EUR com cotação → valor_solicitado convertido`; em `tests/nucleo/rn-012-diarias.test.ts`, `RN-012 › parcelas em reais: 100,00 USD em 13/07 (R$ 542,00) "2 diarias" → 271,00 + 271,00 → PARCIAL 500,00`; em `tests/nucleo/rn-014-resumo.test.ts`, `RN-014 › total_solicitado soma o valor em reais e ignora CAMBIO_INDISPONIVEL (nulo)`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-057** — Duplicata com moeda (estende T-015) em `src/nucleo/elegibilidade.ts`: a chave passa a ser `(data, categoria, fornecedor, moeda normalizada, valorOriginal)`
  - **Atende:** RN-007, AMB-038
  - **Aceite:** em `tests/nucleo/rn-007-duplicatas.test.ts` passam `RN-007 › 20,00 EUR e 20,00 USD, resto igual → as duas seguem`, `RN-007 › sem moeda e "BRL", resto igual → a 2ª DUPLICATA` e `RN-007 › "eur" e "EUR", resto igual → a 2ª DUPLICATA`; todos os `RN-007 ›` da T-015 continuam passando
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-058** — Aprovação manual (etapa 11, DT-008, R-16): `Status` ganha `PENDENTE` e a união de códigos ganha `REQUER_APROVACAO`; `statusDe` em `src/nucleo/status.ts` devolve `PENDENTE` quando `reembolsável > LIMIAR_APROVACAO`, antes das outras regras; em `src/nucleo/motor.ts`, um `map` depois da alocação troca o motivo por `REQUER_APROVACAO` (com os detalhes do limite), sem mudar valor nem saldo; em `src/nucleo/motivos.ts`, a descrição cita o valor calculado, o limiar de R$ 500,00 e, se houve, o valor cortado pelo limite
  - **Atende:** RN-018, RN-011, RN-013, AMB-040, AMB-041
  - **Aceite:** em `tests/nucleo/rn-018-aprovacao.test.ts` passam `RN-018 › e-007 (hospedagem 1.200,00, 3 × 400,00 no CC-COMERCIAL) → PENDENTE REQUER_APROVACAO, reembolsável 1.200,00`, `RN-018 › reembolsável exatamente 500,00 → APROVADO, não PENDENTE`, `RN-018 › reembolsável 500,01 (CC-COMERCIAL, "2 diarias" 500,01) → PENDENTE`, `RN-018 › hospedagem 1.200,00 com 1 diária na tabela padrão → PARCIAL 250,00, não PENDENTE`, `RN-018 › PENDENTE consome o limite: hospedagem seguinte na mesma noite → LIMITE_DIARIO_ESGOTADO` e `RN-018 › descrição cita o valor calculado, o limiar de R$ 500,00 e o corte de limite`; em `tests/nucleo/rn-011-viagem.test.ts`, `RN-011 › CC-COMERCIAL: e-008 (alimentação 95,00 em 23/07, noite de e-007 PENDENTE) → APROVADO 95,00 (limite 135,00)`; em `tests/nucleo/rn-013-motivos.test.ts`, `RN-013 › todo código da seção 4 gera descrição não vazia` cobre os 11 códigos
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-059** — [P] Resumo da v4 em `src/nucleo/resumo.ts` (estende T-024): `pendentes`; `totalReembolsavel` só dos itens não PENDENTE; `totalPendente` dos PENDENTE; `totalNaoReembolsado = solicitado − reembolsável − pendente`
  - **Atende:** RN-014, AMB-041
  - **Aceite:** em `tests/nucleo/rn-014-resumo.test.ts` passam `RN-014 › PENDENTE entra em total_solicitado e total_pendente, e não em total_reembolsavel`, `RN-014 › total_nao_reembolsado = total_solicitado − total_reembolsavel − total_pendente, exato em centavos`, `RN-014 › contagens (aprovados, parciais, recusados, pendentes) somam quantidade_itens` e `RN-014 › lista vazia → pendentes 0 e total_pendente 0,00`; o teste da T-024 `RN-014 › soma de valor_reembolsavel dos itens = total_reembolsavel ...` passa a somar só os itens não PENDENTE
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-060** — [P] Descrições da v4 em `src/nucleo/motivos.ts` (RN-013): todo item com conversão em moeda estrangeira traz `"<MOEDA> <original> × <taxa> (cotação de <data>) = R$ <reais>"` antes do texto do código; `CAMBIO_INDISPONIVEL` cita a moeda e a data da despesa; `NOTA_FISCAL_AUSENTE` em moeda estrangeira cita o valor em reais e o limiar
  - **Atende:** RN-013, RN-017, RN-008
  - **Aceite:** em `tests/nucleo/rn-013-motivos.test.ts` passam `RN-013 › item em moeda estrangeira: descrição traz valor original × taxa, data da cotação e valor em reais`, `RN-013 › CAMBIO_INDISPONIVEL cita a moeda e a data da despesa` e `RN-013 › NOTA_FISCAL_AUSENTE em moeda estrangeira cita o valor em reais e o limiar`
  - **Commit:** `<hash preenchido depois>`

### 5.3 Casos de borda da v4

> Todos em `tests/casos-de-borda.test.ts`, chamando o motor em memória com a
> fixture da v4 (`tests/apoio.ts`, com centro de custo, tabela e câmbio
> opcionais). Um `it` por linha da seção 7, título `Borda › <Caso>` com o texto
> exato da coluna "Caso". Se um teste falhar, o conserto faz parte da mesma task.
> Os 4 casos de arquivo externo ficam na T-069.

- [ ] **T-061** — Casos de borda de centro de custo e tabela aplicável em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-002, RN-006, RN-009, RN-011, RN-016, AMB-029, AMB-030, AMB-031, AMB-032, AMB-033
  - **Aceite:** passam `Borda › Centro de custo sem entrada na tabela`, `Borda › Colaborador sem centro de custo`, `Borda › Centro de custo com outra grafia`, `Borda › Categoria herdada do padrão`, `Borda › Categoria só em outro centro de custo`, `Borda › Categoria nova no centro de custo`, `Borda › Categoria com limite zero`, `Borda › Limite zero não gera viagem`, `Borda › Limite zero vem antes da nota fiscal` e `Borda › Representação em dia de viagem`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-062** — Casos de borda de `moeda` e de valor inválido com conversão em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-003, RN-017, AMB-023, AMB-036, AMB-043
  - **Aceite:** passam `Borda › Valor inválido em moeda estrangeira`, `Borda › Valor inválido em BRL`, `Borda › Moeda ausente`, `Borda › Moeda nula ou vazia`, `Borda › Moeda em minúsculas`, `Borda › Moeda não textual` e `Borda › Moeda fora do câmbio`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-063** — Casos de borda de conversão e do arquivo de câmbio em `tests/casos-de-borda.test.ts` ("Moeda repetida no câmbio" e "Moeda minúscula no câmbio" montam o câmbio a partir do texto com `lerCambio`, R-14)
  - **Atende:** RN-001, RN-004, RN-005, RN-014, RN-017, AMB-035, AMB-037, AMB-039, AMB-042
  - **Aceite:** passam `Borda › Conversão em dia útil`, `Borda › Conversão no fim de semana`, `Borda › Antes da primeira cotação`, `Borda › Moeda sem cotação`, `Borda › Estrangeira fora do período`, `Borda › Estrangeira negativa sem cotação`, `Borda › Arredondamento da conversão`, `Borda › Moeda repetida no câmbio` e `Borda › Moeda minúscula no câmbio`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-064** — Casos de borda de nota fiscal e duplicata em moeda estrangeira em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-007, RN-008, AMB-038
  - **Aceite:** passam `Borda › Nota fiscal sobre o valor convertido`, `Borda › Estrangeira abaixo do limiar de NF`, `Borda › Mesmo valor em moedas diferentes` e `Borda › BRL explícito e implícito`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-065** — Casos de borda de aprovação manual em `tests/casos-de-borda.test.ts`
  - **Atende:** RN-010, RN-011, RN-012, RN-014, RN-018, AMB-040, AMB-041
  - **Aceite:** passam `Borda › Reembolsável exatamente 500,00`, `Borda › Reembolsável acima de 500,00`, `Borda › Solicitado alto cortado pelo limite`, `Borda › Pendente com corte de limite`, `Borda › Pendente consome o limite`, `Borda › Hospedagem pendente gera viagem` e `Borda › Pendente fora do total reembolsável`
  - **Commit:** `<hash preenchido depois>`

### 5.4 Saída e CLI da v4

- [ ] **T-066** — Saída da v4 em `src/io/saida.ts` (estende T-035, R-17): bloco `politica` (`versao`, `tabela`) entre `periodo` e `itens`; item com os 14 campos na ordem `id`, `data`, `categoria`, `moeda`, `valor_original`, `taxa_cambio`, `data_cotacao`, `valor_solicitado`, `valor_reembolsavel`, `status`, `limite_diario_aplicado`, `em_viagem`, `diarias`, `motivo`; `taxa_cambio` via `JSON.rawJSON` do texto do arquivo (`1` em BRL); os três campos de conversão saem de `conversao` (nulos juntos); `moeda` de item `DADO_INVALIDO` sai como veio; resumo com `pendentes` e `total_pendente`
  - **Atende:** RN-003, RN-013, RN-014, RN-016, RN-017, AMB-023, AMB-043
  - **Aceite:** em `tests/io/saida.test.ts` passam `Infra › saída: campos do item na ordem da seção 4 (id … diarias, motivo) e politica entre periodo e itens`, `RN-017 › taxa_cambio sai com o texto do arquivo (5.90 continua 5.90) e 1 em BRL`, `RN-003 › DADO_INVALIDO: moeda sai como veio (978 → 978, ausente → null)`, `RN-016 › saída traz politica { versao: "v4", tabela }` e `RN-014 › resumo traz pendentes e total_pendente com duas casas`; em `tests/contrato-saida.test.ts` voltam a passar os dois testes da T-037 e passam `RN-013 › saída do envelope (PENDENTE, CAMBIO_INDISPONIVEL, moeda estrangeira) valida contra o schema` e `RN-013 › item com taxa_cambio e valor_solicitado nulo é rejeitado pelo schema (AMB-043)`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-067** — [P] Exemplos oficiais em `tests/exemplo.test.ts` (estende T-051): lê os três arquivos da seção 9 com a tabela e o câmbio de `exemplos/envelope/`, roda `validarEntrada` → motor → `montarSaida` e compara com as três tabelas e os três resumos. Um `it` por despesa (moeda, original, taxa, data da cotação, solicitado, reembolsável, status, código)
  - **Atende:** RN-001, RN-004, RN-005, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-014, RN-016, RN-017, RN-018 (seção 9)
  - **Aceite:** passam os `it` da T-051 e da T-052 (com `RN-014 › exemplo: resumo 1861.84 / 351.43 / 0.00 / 1510.41 · 5/2/7/0` no lugar do resumo da T-051), `RN-010 › envelope e-001: representacao 340,00 → PARCIAL 300,00`, `RN-017 › envelope e-002: EUR 22,00 × 5.93 (07-14) = 130,46 → PARCIAL 90,00`, `RN-017 › envelope e-003: EUR 14,50 × 5.88 (07-15) = 85,26 → APROVADO 85,26`, `RN-017 › envelope e-004: EUR 30,00 × 5.96 (07-17) = 178,80 → PARCIAL 90,00`, `RN-008 › envelope e-005: USD 40,00 × 5.50 = 220,00 → NOTA_FISCAL_AUSENTE`, `RN-017 › envelope e-006: GBP → CAMBIO_INDISPONIVEL, conversão nula`, `RN-018 › envelope e-007: PENDENTE 1.200,00, diarias 3`, `RN-011 › envelope e-008: APROVADO 95,00, em_viagem, limite 135,00`, `RN-006 › envelope e-009: coworking → CATEGORIA_NAO_REEMBOLSAVEL`, `RN-017 › envelope e-010: sem moeda → BRL, taxa 1, APROVADO 88,00`, `RN-014 › envelope: resumo 2457.52 / 748.26 / 1200.00 / 509.26 · 3/3/3/1`, `RN-016 › envelope: tabela aplicada CC-COMERCIAL`, `RN-016 › cc-desconhecido f-001: APROVADO 58,00 (tabela padrão)`, `RN-012 › cc-desconhecido f-002: PARCIAL 250,00`, `RN-006 › cc-desconhecido f-003: representacao → CATEGORIA_NAO_REEMBOLSAVEL`, `RN-017 › cc-desconhecido f-004: USD 12,00 × 5.48 (07-21) = 65,76 → APROVADO`, `RN-014 › cc-desconhecido: resumo 623.76 / 373.76 / 0.00 / 250.00 · 2/1/1/0`, `RN-016 › cc-desconhecido: politica.tabela "padrao"` e `RN-013 › exemplos: nenhum item com motivo ausente ou vazio nos três arquivos`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-068** — [P] CLI da v4 em `src/cli.ts` e `tests/cli.test.ts` (estende T-038, R-08, R-11): a linha de resumo no `stdout` inclui o total pendente quando houver; helper de teste que copia `src/`, `dados/` e `package.json` para uma pasta temporária e roda o CLI dessa cópia com um arquivo de `dados/` trocado ou removido
  - **Atende:** RN-015, RN-016, RN-017, AMB-028, AMB-032, AMB-044
  - **Aceite:** em `tests/cli.test.ts` passam `RN-015 › CLI: "centro_custo": 42 → código 1, stderr cita colaborador.centro_custo, nenhum arquivo de saída`, `RN-015 › CLI: dados/cambio.json ausente (cópia temporária) → código 1, stderr cita o arquivo de câmbio, nenhum arquivo de saída`, `RN-015 › CLI: limite negativo em dados/politica.json (cópia temporária) → código 1, stderr cita a tabela de limites e o campo`, `RN-016 › CLI: padrao.hospedagem.limite 320.00 em dados/ (cópia temporária) muda f-002 de PARCIAL 250,00 para APROVADO 310,00 sem mudar o código`, `Infra › CLI: chamado de outra pasta lê o mesmo dados/`, `Infra › CLI: envelope → código 0, stdout cita o total pendente` e `Infra › CLI: duas execuções do envelope geram bytes idênticos`; os testes da T-038 e da T-039 continuam passando
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-069** — Casos de borda de arquivo da v4 em `tests/casos-de-borda.test.ts`: "Centro de custo não textual" por `validarEntrada`; "Tabela de limites inválida" e "Tabela sem versão" por `lerPolitica` com o texto do arquivo; "Arquivo de câmbio ausente" por `lerExternos` com um caminho inexistente **e** pelo CLI numa cópia temporária (helper da T-068), conferindo que o arquivo de saída não existe
  - **Atende:** RN-015, RN-016, RN-017, AMB-028, AMB-032, AMB-044
  - **Aceite:** passam `Borda › Centro de custo não textual`, `Borda › Tabela de limites inválida`, `Borda › Arquivo de câmbio ausente` e `Borda › Tabela sem versão`
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-070** — Fechar a rastreabilidade (estende T-041, DT-005): em `tests/rastreabilidade.test.ts`, subir os mínimos para 18 RNs e 121 casos de borda; nada mais muda no teste
  - **Atende:** RN-001, RN-002, RN-003, RN-004, RN-005, RN-006, RN-007, RN-008, RN-009, RN-010, RN-011, RN-012, RN-013, RN-014, RN-015, RN-016, RN-017, RN-018 (seção 9, critérios 3 e 4)
  - **Aceite:** passam `Infra › rastreabilidade: toda RN-NNN da spec aparece no início de um título de teste`, `Infra › rastreabilidade: toda linha da seção 7 tem um teste Borda › <Caso>` e `Infra › rastreabilidade: toda RN-NNN tem exatamente um arquivo rn-NNN-*.test.ts`; `npm test` inteiro verde, sem falhas conhecidas
  - **Commit:** `<hash preenchido depois>`

- [ ] **T-071** — Atualizar `README.md` (estende T-042): os dois arquivos em `dados/` (o que são, que simulam o serviço do financeiro, como trocá-los e restaurá-los com `git checkout dados/`), os três exemplos da seção 9 e o apontamento para `quickstart.md` e `contracts/arquivos-externos.md`
  - **Atende:** AMB-028 (seção 9, entrega: "como rodar e como testar")
  - **Aceite:** seguir o README do zero num clone limpo reproduz as seções 1 a 6 do `quickstart.md` com o resultado esperado
  - **Commit:** `<hash preenchido depois>`

---

## Cobertura

Preencha ao fechar cada fase. É a sua própria checagem de rastreabilidade — e é
exatamente a matriz que a correção vai montar.

| Regra da spec | Task | Teste |
|---|---|---|
| RN-001 | T-006, T-026, T-033, T-035, T-044, T-054, T-056, T-063 | `RN-001 › 10.005 → 10.00 (meio, 0 é par)` (+ demais `RN-001 ›`), `RN-017 › 0,50 USD em 16/07 × 5,41 = 2,705 → R$ 2,70 (meio para o par, AMB-037)`, `Borda › Arredondamento meio-para-o-par no limiar`, `Borda › Arredondamento da conversão` |
| RN-002 | T-007, T-022, T-028, T-050, T-052, T-061 | `RN-002 › "ALIMENTACAO" e "alimentacao" na mesma data somam no mesmo limite diário`, `RN-002 › "Representação" é representacao no CC-COMERCIAL e sai como veio na tabela padrão` |
| RN-003 | T-007, T-008, T-009, T-010, T-011, T-017, T-029, T-030, T-032, T-033, T-034, T-035, T-038, T-055, T-056, T-062, T-066 | `RN-003 › "data": "2026-07-32" → DADO_INVALIDO com data "2026-07-32" no eco` (+ demais `RN-003 ›`), `RN-003 › "moeda": 978, true, [] ou {} → DADO_INVALIDO com a moeda como veio no eco`, `Borda › Data impossível`, `Borda › Moeda não textual` |
| RN-004 | T-012, T-017, T-022, T-028, T-056, T-063 | `RN-004 › d-009 (−45,00) → RECUSADO VALOR_NAO_POSITIVO, reembolsável 0,00`, `RN-004 › −10,00 GBP (sem cotação) → VALOR_NAO_POSITIVO`, `Borda › Estorno`, `Borda › Estrangeira negativa sem cotação` |
| RN-005 | T-013, T-028, T-030, T-051, T-063 | `RN-005 › d-008 (2026-04-15, período de julho) → FORA_DO_PERIODO`, `Borda › Último dia do período`, `Borda › Estrangeira fora do período` |
| RN-006 | T-014, T-028, T-050, T-052, T-061 | `RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBOLSAVEL`, `RN-006 › hospedagem no CC-ENG-PLATAFORMA → CATEGORIA_NAO_REEMBOLSAVEL, descrição cita "CC-ENG-PLATAFORMA"`, `Borda › Categoria com limite zero` |
| RN-007 | T-015, T-017, T-023, T-029, T-057, T-064 | `RN-007 › d-006 segue e d-007 → DUPLICATA`, `RN-007 › 20,00 EUR e 20,00 USD, resto igual → as duas seguem`, `Borda › Ambas sem fornecedor`, `Borda › BRL explícito e implícito` |
| RN-008 | T-016, T-022, T-026, T-031, T-034, T-050, T-053, T-056, T-060, T-064 | `RN-008 › d-004 (100,01, sem NF) → NOTA_FISCAL_AUSENTE`, `RN-008 › e-005 (40,00 USD × 5,50 = R$ 220,00, sem NF) → NOTA_FISCAL_AUSENTE`, `Borda › Nota fiscal no limiar exato`, `Borda › Nota fiscal sobre o valor convertido` |
| RN-009 | T-021, T-027, T-050, T-051, T-053, T-061 | `RN-009 › alimentação isolada de 60,00 → APROVADO 60,00`, `RN-009 › alimentação 50,00 no CC-ADM → PARCIAL 45,00`, `Borda › Exatamente no limite diário`, `Borda › Categoria nova no centro de custo` |
| RN-010 | T-021, T-026, T-027, T-051, T-053, T-065 | `RN-010 › CC-ENG-PLATAFORMA (75,00): d-001 72,50 → APROVADO 72,50 e d-002 38,00 → PARCIAL 2,50`, `Borda › Várias no mesmo dia`, `Borda › Pendente consome o limite` |
| RN-011 | T-020, T-022, T-031, T-050, T-052, T-053, T-058, T-061, T-065 | `RN-011 › limite 60,01 ampliado em 50% → 90,02 e 60,03 → 90,04 (meio para o par, AMB-033)`, `RN-011 › CC-COMERCIAL: e-008 (alimentação 95,00 em 23/07, noite de e-007 PENDENTE) → APROVADO 95,00 (limite 135,00)`, `Borda › Dia do check-out`, `Borda › Hospedagem pendente gera viagem` |
| RN-012 | T-018, T-019, T-022, T-030, T-050, T-056, T-065 | `RN-012 › h1 14/07 "2 diarias" 480,00 e h2 15/07 "1 diaria" 200,00 → h1 APROVADO 480,00, h2 PARCIAL 10,00`, `RN-012 › parcelas em reais: 100,00 USD em 13/07 (R$ 542,00) "2 diarias" → 271,00 + 271,00 → PARCIAL 500,00`, `Borda › Divisão com centavos` |
| RN-013 | T-023, T-035, T-036, T-037, T-058, T-060, T-066, T-067 | `RN-013 › LIMITE_DIARIO_EXCEDIDO cita limite, saldo disponível e valor cortado`, `RN-013 › item em moeda estrangeira: descrição traz valor original × taxa, data da cotação e valor em reais`, `RN-013 › saída do envelope (PENDENTE, CAMBIO_INDISPONIVEL, moeda estrangeira) valida contra o schema` |
| RN-014 | T-024, T-032, T-036, T-040, T-051, T-056, T-059, T-063, T-065, T-066 | `RN-014 › total_nao_reembolsado = total_solicitado − total_reembolsavel − total_pendente, exato em centavos`, `Borda › Lista de despesas vazia`, `Borda › Pendente fora do total reembolsável` |
| RN-015 | T-025, T-038, T-040, T-045, T-046, T-047, T-048, T-068, T-069 | `RN-015 › tabela de limites com "limite": -10 → erro que cita a tabela de limites e o campo`, `RN-015 › CLI: dados/cambio.json ausente (cópia temporária) → código 1, stderr cita o arquivo de câmbio, nenhum arquivo de saída`, `Borda › Centro de custo não textual`, `Borda › Tabela sem versão` |
| RN-016 | T-045, T-049, T-051, T-061, T-066, T-067, T-068, T-069 | `RN-016 › CC-ADM: hospedagem 1 diária 300,00 → PARCIAL 250,00`, `RN-016 › CLI: padrao.hospedagem.limite 320.00 em dados/ (cópia temporária) muda f-002 de PARCIAL 250,00 para APROVADO 310,00 sem mudar o código`, `Borda › Categoria herdada do padrão` |
| RN-017 | T-043, T-046, T-054, T-056, T-060, T-062, T-063, T-066, T-067, T-069 | `RN-017 › e-004 (30,00 EUR no sábado 18/07) → taxa 5.96 de 2026-07-17, R$ 178,80`, `RN-017 › e-006 (55,00 GBP) → CAMBIO_INDISPONIVEL, valor_solicitado nulo`, `Borda › Conversão no fim de semana`, `Borda › Moeda sem cotação` |
| RN-018 | T-049, T-058, T-065, T-067 | `RN-018 › e-007 (hospedagem 1.200,00, 3 × 400,00 no CC-COMERCIAL) → PENDENTE REQUER_APROVACAO, reembolsável 1.200,00`, `RN-018 › reembolsável exatamente 500,00 → APROVADO, não PENDENTE`, `Borda › Reembolsável acima de 500,00` |
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
| AMB-013 | T-006, T-026, T-044 | `RN-001 › 10.015 → 10.02 (meio, 2 é par)`, `Borda › Meio-para-o-par sobe` |
| AMB-014 | T-007, T-028 | `RN-002 › "ALIMENTACAO", " Alimentação " e "alimentacao" viram alimentacao`, `Borda › Categoria em maiúsculas` |
| AMB-015 | T-021, T-027 | `RN-010 › despesa que usa exatamente o saldo restante → APROVADO_INTEGRAL`, `Borda › Exatamente no limite diário` |
| AMB-016 | T-021, T-027 | `RN-009 › d-012 (sábado, 47,20) → APROVADO 47,20`, `Borda › Fim de semana` |
| AMB-017 | T-022, T-031 | `RN-008 › dia de viagem não amplia o limiar de nota fiscal`, `Borda › Viagem não altera o limiar de NF` |
| AMB-018 | T-008, T-010, T-025, T-032, T-034, T-038 | `RN-003 › id, data ou categoria nulos, vazios ou só com espaços → DADO_INVALIDO`, `RN-003 › CLI: despesa inválida não aborta (código 0)` |
| AMB-019 | T-014, T-028, T-052 | `RN-006 › d-005 (coworking, 89,00) → CATEGORIA_NAO_REEMBOLSAVEL`, `RN-006 › representacao na tabela padrão → CATEGORIA_NAO_REEMBOLSAVEL, descrição diz que não consta na política` |
| AMB-020 | T-021, T-022, T-031, T-050 | `RN-009 › em dia de viagem alimentação vai a 90,00 e transporte a 120,00, hospedagem fica em 250,00` |
| AMB-021 | T-009, T-033 | `RN-003 › "45.00", "45,00" e 45.00 dão valor_solicitado 45,00`, `Borda › Separador de milhar` |
| AMB-022 | T-010, T-034 | `RN-003 › "tem_nota_fiscal": "sim" → DADO_INVALIDO`, `Borda › tem_nota_fiscal número` |
| AMB-023 | T-008, T-009, T-024, T-032, T-035, T-055, T-062, T-066 | `RN-003 › "valor": "R$ 45,00" → valor_solicitado nulo`, `RN-003 › DADO_INVALIDO: moeda sai como veio (978 → 978, ausente → null)`, `Borda › Eco de campo inválido` |
| AMB-024 | T-011, T-032 | `RN-003 › " d-001 " depois de "d-001" → DADO_INVALIDO, com id " d-001 " no eco`, `Borda › id repetido com outra grafia` |
| AMB-025 | T-011, T-017, T-032, T-056 | `RN-003 › "d-001" com data inválida, depois "d-001" válido → o 2º segue (correção, AMB-025)`, `RN-003 › id de despesa recusada por CAMBIO_INDISPONIVEL continua reservado (AMB-025)`, `Borda › Correção de item inválido`, `Borda › id de item recusado depois da validação` |
| AMB-026 | T-007, T-008, T-015, T-018, T-029, T-030 | `RN-007 › fornecedor 123 e "123" são o mesmo fornecedor`, `RN-012 › descricao nula ou 2 (número) → N = 1`, `Borda › Descrição não textual` |
| AMB-027 | T-025, T-040 | `RN-015 › colaborador.id "", "  ", null ou 123 → erro cuja mensagem cita colaborador.id`, `Borda › Arquivo que não é objeto` |
| AMB-028 | T-047, T-068, T-069, T-071 | `RN-015 › arquivo de câmbio ausente → erro que cita o arquivo de câmbio`, `Infra › CLI: chamado de outra pasta lê o mesmo dados/`, `Borda › Arquivo de câmbio ausente` |
| AMB-029 | T-049, T-051, T-053, T-061 | `RN-016 › CC-SUPORTE-N2 (sem entrada) → tabela "padrao", alimentação 60,00`, `Borda › Centro de custo sem entrada na tabela`, `Borda › Colaborador sem centro de custo` |
| AMB-030 | T-049, T-052, T-061 | `RN-016 › CC-ADM sem hospedagem → hospedagem 250,00 herdada do padrão`, `Borda › Categoria herdada do padrão` |
| AMB-031 | T-049, T-052, T-061 | `RN-016 › CC-ENG-PLATAFORMA: hospedagem com limite 0 não herda do padrão`, `RN-011 › hospedagem com limite 0 no centro de custo não gera dia de viagem`, `Borda › Limite zero não gera viagem`, `Borda › Limite zero vem antes da nota fiscal` |
| AMB-032 | T-048, T-049, T-051, T-061, T-068, T-069 | `RN-015 › "centro_custo": 42, true, [] ou {} → erro que cita colaborador.centro_custo`, `RN-016 › " cc-comercial " → tabela "CC-COMERCIAL"`, `Borda › Centro de custo com outra grafia`, `Borda › Centro de custo não textual` |
| AMB-033 | T-050, T-053, T-061 | `RN-011 › limite 60,01 ampliado em 50% → 90,02 e 60,03 → 90,04 (meio para o par, AMB-033)`, `RN-011 › CC-COMERCIAL: representacao 420,00 em dia de viagem → APROVADO 420,00 (limite 450,00)`, `Borda › Representação em dia de viagem` |
| AMB-034 | T-045, T-051 | `RN-016 › vigencia 2026-08-01 não recusa nem muda despesas de julho (AMB-034)` |
| AMB-035 | T-054, T-063 | `RN-017 › cotação antiga continua valendo: EUR em 2026-12-31 usa a de 2026-07-28 (AMB-035)`, `Borda › Conversão no fim de semana` |
| AMB-036 | T-055, T-056, T-062 | `RN-003 › "moeda": "EURO" passa pela validação (moeda EURO)`, `RN-017 › 10,00 "EURO" → CAMBIO_INDISPONIVEL, e não DADO_INVALIDO`, `Borda › Moeda fora do câmbio` |
| AMB-037 | T-044, T-054, T-056, T-063 | `RN-017 › 10,05 USD em 13/07 × 5,42 = 54,471 → R$ 54,47`, `Borda › Arredondamento da conversão` |
| AMB-038 | T-056, T-057, T-064 | `RN-008 › e-003 (14,50 EUR × 5,88 = R$ 85,26, sem NF) não é recusada por nota fiscal`, `RN-007 › 20,00 EUR e 20,00 USD, resto igual → as duas seguem`, `Borda › Mesmo valor em moedas diferentes` |
| AMB-039 | T-056, T-063 | `RN-017 › EUR em 2026-06-30 num período de julho → FORA_DO_PERIODO, e não CAMBIO_INDISPONIVEL`, `Borda › Estrangeira fora do período` |
| AMB-040 | T-049, T-058, T-065 | `RN-018 › reembolsável exatamente 500,00 → APROVADO, não PENDENTE`, `Borda › Solicitado alto cortado pelo limite` |
| AMB-041 | T-058, T-059, T-065 | `RN-014 › PENDENTE entra em total_solicitado e total_pendente, e não em total_reembolsavel`, `Borda › Pendente fora do total reembolsável` |
| AMB-042 | T-046, T-063 | `RN-017 › câmbio: "USD": 5.42 e depois "usd": 5.50 na mesma data → vale 5.50, sem erro`, `Borda › Moeda repetida no câmbio`, `Borda › Moeda minúscula no câmbio` |
| AMB-043 | T-043, T-056, T-062, T-066 | `RN-003 › valor inválido: valor_original e os três campos de conversão nulos, mesmo em BRL ou com cotação (AMB-043)`, `RN-013 › item com taxa_cambio e valor_solicitado nulo é rejeitado pelo schema (AMB-043)`, `Borda › Valor inválido em BRL` |
| AMB-044 | T-045, T-046, T-068, T-069 | `RN-015 › tabela de limites sem versao, com versao vazia ou com vigencia que não é data → erro que cita o campo`, `RN-015 › câmbio: fonte, observacao e campos desconhecidos são ignorados`, `Borda › Tabela sem versão` |

**IDs sem cobertura:** nenhum.

**Casos de borda da seção 7:** 121 linhas → v1: 80 (T-026 (7), T-027 (6), T-028 (8), T-029 (10), T-030 (13), T-031 (6), T-032 (12), T-033 (7), T-034 (5), T-040 (6)); v4: 41 (T-061 (10), T-062 (7), T-063 (9), T-064 (4), T-065 (7), T-069 (4)).

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
- **Fase 5 (v4, D-019 a D-021):** as tasks da v1 afetadas pela v4 (lista em
  D-019) continuam `[x]`, e a mudança entra numa task nova que diz "estende
  T-0NN". Os títulos de `tests/exemplo.test.ts` da T-036 são substituídos na
  T-051/T-052/T-067, porque a tabela 1 da seção 9 mudou (CC-ENG-PLATAFORMA).
- **Títulos da v1 que citam `d-013` (D-022):** `RN-008 › d-013 (690,00, sem NF) → NOTA_FISCAL_AUSENTE`
  (T-016, usado na linha AMB-006 da Cobertura) e `RN-011 › d-013 recusada por NF…`
  (T-022) se referem à **tabela padrão** da fixture, em que a hospedagem é
  reembolsável. Não descrevem o resultado da seção 9, em que o colaborador é
  do CC-ENG-PLATAFORMA e `d-013` sai `CATEGORIA_NAO_REEMBOLSAVEL` (T-052).
- **Dependências da Fase 5:** T-043 → T-044 → T-045 → T-046 → T-047 → T-048
  (as quatro últimas escrevem em `tests/io/rn-015-entrada.test.ts`; D-022). T-049
  precisa de T-048; T-050 de T-047 e T-049; depois, em sequência,
  T-051 → T-052 → T-053. T-054 pode correr em paralelo com T-049 a T-053
  (só precisa de T-044 e T-046). T-055 precisa de T-050; T-056 precisa de
  T-051, T-054 e T-055; depois T-057 → T-058 → (T-059 ∥ T-060). A seção 5.3
  precisa de T-060. T-066 precisa de T-059; depois (T-067 ∥ T-068) →
  T-069 → T-070 → T-071. A T-050 é um refactor **sem mudança de
  comportamento** e a T-051 é o único passo que muda a tabela 1 da seção 9:
  por isso o centro de custo só entra no motor depois do refactor.
