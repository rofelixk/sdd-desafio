# Research — Motor de Cálculo de Reembolso

**Fase 0 do `/speckit-plan`** · Base: `spec.md` v1.1 · Data: 2026-09-29

Cada item fecha uma incógnita técnica do `plan.md`. Nenhum item cria regra de
negócio. Os pontos em que o plano esbarrou numa lacuna de regra foram levados
à spec antes (D-015).

Ambiente verificado na máquina: Node 24.20, npm, vitest 5.0.2 e
typescript 7.0.2 disponíveis no registry.

---

## R-01 — Linguagem e runtime

- **Decisão:** TypeScript rodando direto no **Node ≥ 24**, com o type
  stripping nativo (`node src/cli.ts`), sem etapa de build. `tsc` só faz o
  typecheck (`noEmit`).
- **Justificativa:** é a stack de especialidade do usuário. Sem build, o
  README roda com `npm install` e um comando, sem `dist/` desatualizado.
  O Node 24 também traz os dois recursos de JSON que resolvem a R-03 e a R-04.
- **Alternativas descartadas:** `tsc` → `dist/`, que adiciona uma etapa que
  pode ficar desatualizada; `tsx`/`ts-node`, que são dependências a mais
  para o mesmo resultado.
- **Restrição que isso impõe:** só sintaxe apagável
  (`erasableSyntaxOnly`): sem `enum`, `namespace` nem parameter properties.
  Imports relativos levam a extensão `.ts`.

## R-02 — Representação de dinheiro

- **Decisão:** **centavos inteiros em `bigint`** (`type Centavos = bigint`)
  em todo o núcleo.
- **Justificativa:** a constituição proíbe ponto flutuante binário.
  Com `bigint`, soma, subtração, `min` e a divisão das diárias
  (quociente + resto) são exatas e não há teto de valor. Inventar um teto
  seria regra de negócio nova.
- **Alternativas descartadas:** `number` em centavos (exato só até
  2^53 centavos, e o limite precisaria virar regra);
  `decimal.js`/`big.js` (dependência para operações que se resumem a inteiros);
  `number` em reais (é o bug que a constituição proíbe).

## R-03 — Ler o `valor` sem passar por float

- **Problema:** `JSON.parse('10.005')` devolve o float `10.00499999…`. A
  RN-001 exige que `10.005` esteja **exatamente no meio** e vire 10,00, e que
  `10.015` vire 10,02. Arredondar o float daria um resultado errado.
- **Decisão:** `JSON.parse` com reviver. O terceiro argumento
  (`context.source`, Node ≥ 21) traz o texto original de cada número. O
  reviver troca **todo número** por um `NumeroJson { texto }`, e o
  arredondamento meio-para-o-par (RN-001) trabalha nos dígitos desse texto.
  Expoente (`1.0005e2`) é aceito, porque é número JSON válido.
- **Justificativa:** o texto exato chega ao núcleo sem dependência e sem
  escrever um parser de JSON. Embrulhar todos os números, e não só o `valor`,
  faz `tem_nota_fiscal: 1` continuar reconhecível como número
  (`DADO_INVALIDO`, RN-003). Também permite ecoar `colaborador`/`periodo`
  byte a byte.
- **Alternativas descartadas:** parser de JSON próprio (mais código a
  testar); `lossless-json` (dependência para algo que o runtime já faz);
  `toFixed`/`Math.round` em float (erra os pontos médios).

## R-04 — Emitir valores com duas casas

- **Decisão:** o valor monetário é formatado a partir dos centavos
  (`4500n` → `"45.00"`) e emitido com **`JSON.rawJSON`**. O resultado é um
  número JSON `45.00`, e não texto nem float.
- **Justificativa:** a seção 4 pede número com no máximo duas casas.
  `rawJSON` escreve o número sem passar por float, então `0.1 + 0.2` nunca
  aparece na saída.
- **Alternativas descartadas:** converter para `number` (sai `45` em vez de
  `45.00`, e há risco de float); emitir texto `"45.00"` (quebra o tipo
  "número" do schema).

## R-05 — Datas

- **Decisão:** módulo próprio. Valida `^\d{4}-\d{2}-\d{2}$`, confere se a data
  existe no calendário e calcula `D + k` com `Date.UTC`. As datas são
  formatadas de volta em `AAAA-MM-DD` e comparadas como texto, o que funciona
  porque o formato ISO tem largura fixa.
- **Justificativa:** as operações são poucas (validar, somar dias, comparar).
  Trabalhar só em UTC elimina o fuso horário da máquina, e o resultado é
  determinístico.
- **Alternativas descartadas:** `new Date('2026-02-30')`, que aceita e
  "corrige" datas impossíveis; `date-fns`/`dayjs` (dependência);
  `Temporal` (ainda não vem sem flag no Node 24).

## R-06 — Normalização de texto (RN-002, RN-007, AMB-024)

- **Decisão:** uma única função `normalizar(texto)`:
  `trim()` → `toLowerCase()` → `normalize('NFD')` → remove `\p{M}`
  (acentos). Ela é usada na categoria, no `id` e na descrição de hospedagem.
  O fornecedor (RN-007) usa só `trim` e `toLowerCase`, porque a spec não
  manda tirar acento do fornecedor.
- **Justificativa:** uma função para uma regra. A diferença do fornecedor é
  deliberada e está nomeada no código (`normalizarFornecedor`), para que
  ninguém "unifique" as duas por engano.

## R-07 — Extração de diárias (RN-012)

- **Decisão:** na descrição normalizada (R-06), a primeira ocorrência de
  `(?<!\d[.,]?)(\d+)(?![.,]\d)\s*(diarias?|noites?)(?![a-z])`. N = inteiro
  capturado. Sem ocorrência, ou N = 0, N = 1.
- **Justificativa:** o lookbehind `(?<!\d[.,]?)` garante que o inteiro está
  completo (`"12 noites"` dá 12, e não 2) e que ele não é a parte decimal de
  um fracionário (`"1.5 diarias"` não captura o `5`). O `(?![.,]\d)` impede
  que a parte inteira de um fracionário seja capturada. O lookahead final
  impede que `"2 noitadas"` conte. Pegar a primeira ocorrência é a regra da
  D-015, e ignorar fracionários é a da D-016.

## R-08 — CLI

- **Decisão:** `node:util` `parseArgs`, com o subcomando `calcular` e as
  opções obrigatórias `--input` e `--output`. Códigos de saída: `0` sucesso,
  `1` entrada inválida (RN-015) ou falha de E/S, `2` uso incorreto. A
  mensagem de erro vai para `stderr`.
- **Justificativa:** a interface é fixa e pequena, e o `parseArgs` da stdlib
  basta.
- **Alternativas descartadas:** `commander`/`yargs` (dependência para
  um subcomando só).

## R-09 — Validação da entrada

- **Decisão:** validação escrita à mão em dois níveis. O **arquivo**
  (RN-015) aborta a execução. O **item** (RN-003) é recusado com
  `DADO_INVALIDO`.
- **Justificativa:** as regras da RN-003 são específicas: vazio conta como
  ausente, o formato numérico é fechado, `tem_nota_fiscal` vazio vale
  `false` e o `id` repetido é normalizado. Traduzir erros de schema para
  essas regras daria mais código que escrevê-las diretamente.
- **Alternativas descartadas:** `zod`/`ajv` na entrada.

## R-10 — Testes e rastreabilidade

- **Decisão:** **Vitest 5** (escolha do usuário). Os nomes dos testes
  começam pelo ID da regra (`RN-010 › …`) ou pelo nome exato do caso de borda
  da seção 7 (`Borda › Um centavo acima do limiar`). Um teste de
  rastreabilidade lê `spec.md` e falha se alguma `RN-NNN` ou alguma linha da
  seção 7 não aparecer em nenhum nome de teste.
- **Justificativa:** o critério 9 da spec ("cada RN tem teste que cita o ID",
  "cada linha da seção 7 tem teste") passa a ser verificado pela máquina, e
  não só na revisão manual. Um caso de borda novo na spec sem teste faz a
  suíte falhar.
- **Validação do schema de saída:** `ajv` como devDependency, só nos testes
  de contrato (`contracts/saida.schema.json`).
