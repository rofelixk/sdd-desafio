# Research — Motor de Cálculo de Reembolso

**Fase 0 do `/speckit-plan`** · Base: `spec.md` v2.2 · Data: 2026-09-30

Cada item fecha uma incógnita técnica do `plan.md`. Nenhum item cria regra de
negócio. Os pontos em que o plano esbarrou numa lacuna de regra foram levados
à spec antes: D-015 (v1) e D-021 (v4: AMB-042, AMB-043, AMB-044).

R-01 a R-10 são da v1 e continuam valendo, com os ajustes marcados
**(v4)**. R-11 a R-17 são novos, para a Política v4 (D-019).

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
- **(v4)** Taxa de câmbio e percentual de viagem não são dinheiro e não cabem
  em centavos. Eles usam o `Decimal` exato da R-13, e o resultado de cada
  conta volta a ser `Centavos`.

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
- **(v4)** A tabela de limites e o arquivo de câmbio passam pelo mesmo
  `lerJson`. Assim `limite: 60.00`, `taxa: 5.93` e o percentual chegam como
  texto exato, e a `taxa_cambio` pode sair "como está no arquivo" (seção 4).

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
- **(v4)** `taxa_cambio` é emitida com `JSON.rawJSON` do texto original do
  arquivo de câmbio (`5.93` sai `5.93`), e o `1` do BRL sai como `1`.

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
- **(v4)** A busca da cotação (R-14) usa a mesma comparação de texto: "a data
  mais recente ≤ D" é o maior texto ≤ D.

## R-06 — Normalização de texto (RN-002, RN-007, AMB-024)

- **Decisão:** uma única função `normalizar(texto)`:
  `trim()` → `toLowerCase()` → `normalize('NFD')` → remove `\p{M}`
  (acentos). Ela é usada na categoria, no `id` e na descrição de hospedagem.
  O fornecedor (RN-007) usa só `trim` e `toLowerCase`, porque a spec não
  manda tirar acento do fornecedor.
- **Justificativa:** uma função para uma regra. A diferença do fornecedor é
  deliberada e está nomeada no código (`normalizarFornecedor`), para que
  ninguém "unifique" as duas por engano.
- **(v4)** `normalizar` também compara o `centro_custo` com as chaves de
  `centros_custo` e as categorias com as chaves de cada tabela (RN-016,
  AMB-032). A moeda tem a sua função, `normalizarMoeda` (`trim` +
  `toUpperCase`), usada nos dois lados: na despesa (AMB-036) e nas chaves do
  arquivo de câmbio (AMB-042). Maiúsculas deixam a moeda na grafia ISO para a
  saída (`" eur "` → `"EUR"`).

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
- **(v4)** A interface não muda (AMB-028). Tabela de limites ou câmbio
  ausente ou inválido também é código `1` (RN-015).

## R-09 — Validação da entrada

- **Decisão:** validação escrita à mão em dois níveis. O **arquivo**
  (RN-015) aborta a execução. O **item** (RN-003) é recusado com
  `DADO_INVALIDO`.
- **Justificativa:** as regras da RN-003 são específicas: vazio conta como
  ausente, o formato numérico é fechado, `tem_nota_fiscal` vazio vale
  `false` e o `id` repetido é normalizado. Traduzir erros de schema para
  essas regras daria mais código que escrevê-las diretamente.
- **Alternativas descartadas:** `zod`/`ajv` na entrada.
- **(v4)** Os arquivos externos seguem a mesma linha (R-12).

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
- **(v4)** Os testes do núcleo recebem a tabela e o câmbio de
  `exemplos/envelope/` (fixture explícita), **nunca** de `dados/`. Assim,
  trocar os arquivos do local fixo (R-11) não quebra os testes de regra. Os
  casos de borda antigos continuam iguais, porque a spec diz que eles usam a
  tabela padrão e BRL (RN-009), e o padrão da v4 tem os mesmos valores da v3.

---

## R-11 — Local fixo da tabela de limites e do câmbio (AMB-028)

- **Decisão:** `dados/politica.json` e `dados/cambio.json` na raiz do
  repositório, resolvidos **a partir do código**
  (`import.meta.dirname` de `src/io/externos.ts` → `../../dados/`), e não do
  diretório de trabalho. Os dois começam como cópias de
  `exemplos/envelope/politica-v4.json` e `exemplos/envelope/cambio.json`.
- **Justificativa:** "local fixo" tem de ser o mesmo qualquer que seja a pasta
  de onde o comando é chamado. Resolver pelo código faz isso sem configuração.
  Uma pasta `dados/` separada de `exemplos/` deixa claro que é o "serviço do
  financeiro" (AMB-028), e trocá-la não altera os exemplos da §9.
- **Alternativas descartadas:** caminho relativo ao diretório de trabalho
  (quebra quando o comando roda de outra pasta); variável de ambiente ou opção
  de linha de comando (seria uma segunda interface, e a AMB-028 fixa o local);
  apontar direto para `exemplos/envelope/` (trocar a política para um teste
  alteraria o exemplo oficial).
- **Consequência para os testes:** o teste de CLI que precisa de outra tabela
  (critério da §9 "mudar um limite muda o resultado sem mudar o sistema",
  arquivo de câmbio ausente, tabela inválida) copia `src/`, `dados/` e
  `package.json` para uma pasta temporária, troca o arquivo lá e roda o CLI
  dessa cópia. É exatamente o procedimento que o README ensina.

## R-12 — Leitura e validação dos arquivos externos (RN-015, RN-016, RN-017, AMB-044)

- **Decisão:** validação escrita à mão, como na R-09, em
  `src/io/politica.ts` e `src/io/cambio.ts`. Cada um recebe o texto do
  arquivo e devolve um valor tipado (`Politica`, `Cambio`) ou lança
  `ErroEntrada`. A mensagem cita **qual arquivo** (`tabela de limites
  (dados/politica.json)` ou `arquivo de câmbio (dados/cambio.json)`) e o
  **caminho do campo** (`centros_custo.CC-ADM.alimentacao.limite`). Para no
  primeiro erro, como a RN-015 já faz com a entrada.
- **Ordem de leitura:** entrada → tabela de limites → câmbio. Com mais de um
  arquivo inválido, a mensagem é sempre a do primeiro, e o resultado é
  determinístico.
- **O que é validado:** as listas da RN-016 e da RN-017 mais o critério da
  AMB-044 (todo campo não informativo da §4 presente e com o tipo declarado).
  Campos desconhecidos e `observacao`/`fonte` não são lidos.
- **Justificativa:** as regras são específicas (periodicidade amarrada a
  `hospedagem`, colisões depois da normalização, até 2 casas no limite) e a
  mensagem precisa citar o arquivo e o campo. Um JSON Schema daria mensagens
  genéricas e ainda precisaria de código para as colisões.
- **Alternativas descartadas:** `ajv` em runtime (primeira dependência de
  runtime do projeto, e as colisões ficariam fora do schema).

## R-13 — Aritmética exata de taxa, percentual e limiares (RN-001, RN-008, RN-011, RN-017)

- **Problema:** a conversão (`valor_original × 5.93`), a ampliação de viagem
  (`limite × (1 + p/100)`, com `p` vindo do arquivo) e a comparação com o
  limiar de nota fiscal usam números do arquivo que não são centavos. Qualquer
  float aqui volta ao bug da R-03.
- **Decisão:** um tipo `Decimal = { digitos: bigint; escala: number }`
  (valor = `digitos × 10^−escala`), criado a partir do texto de um
  `NumeroJson` com o mesmo leitor de `dinheiro.ts` (sinal, dígitos, ponto,
  expoente). Uma única função `dividirMeioParaPar(numerador, denominador)`
  faz todo arredondamento, e `paraCentavos` passa a usá-la. Com ela:
  - **conversão** (RN-017, AMB-037): `centavos × taxa.digitos /
    10^taxa.escala`, meio para o par;
  - **limite ampliado** (RN-011, AMB-033): `limite × (100 + p) / 100`, meio
    para o par, com `p` exato;
  - **limiar de nota fiscal** (RN-008): comparação exata, sem arredondar
    (`valor > limiar`), porque "estritamente maior" não precisa de
    arredondamento;
  - **limite da tabela** (RN-016): aceito só se for exato em centavos (até
    2 casas depois de tirar zeros à direita), e aí vira `Centavos`.
- **Justificativa:** uma função de arredondamento para todo o sistema
  (AMB-037: "evita dois critérios de arredondamento"). O `bigint` já está no
  projeto, e não há dependência nova.
- **Alternativas descartadas:** guardar a taxa em "centésimos de centavo"
  (impõe uma precisão máxima que a spec não tem); `decimal.js` (dependência
  para duas contas).
- **Efeito na v1:** o `throw` de `limites.ts` para limite ampliado inexato
  (risco da v1) some, porque a AMB-033 agora define o arredondamento.

## R-14 — Busca da cotação (RN-017, AMB-035, AMB-042)

- **Decisão:** na leitura, o câmbio vira um índice
  `Map<moeda, { data, taxa }[]>`, com a moeda em maiúsculas (R-06) e as datas
  em ordem crescente. Para uma despesa (moeda M, data D), a cotação é o último
  elemento com `data ≤ D` (busca binária; a comparação é de texto, R-05). Sem
  elemento, não há cotação (`CAMBIO_INDISPONIVEL`).
- **Moeda repetida na mesma data (AMB-042):** ao montar o índice, as moedas
  de cada data são percorridas na ordem do arquivo, e uma moeda que já estava
  no índice para aquela data é **sobrescrita**. Assim vale a última. Isso
  depende da ordem das chaves, e ela é garantida: o `JSON.parse` (com ou sem
  reviver) cria as chaves na ordem do texto, e o JS mantém a ordem de inserção
  de chaves que não são índices numéricos (códigos de moeda nunca são). A
  validação (taxa > 0, 3 letras) roda em **todas** as entradas, inclusive a
  que é sobrescrita.
- **Justificativa:** o índice é montado uma vez por execução, e a busca por
  data não depende da ordem das datas no arquivo.
- **Alternativas descartadas:** andar para trás dia a dia a partir de D (sem
  limite de dias, AMB-035, isso não tem fim garantido para uma moeda
  desconhecida).

## R-15 — Tabela aplicável e categorias dinâmicas (RN-002, RN-006, RN-016)

- **Decisão:** as categorias deixam de ser um tipo fechado (`'alimentacao' |
  ...`) e passam a ser o texto normalizado. Uma vez por execução, o núcleo
  monta a `TabelaAplicavel` (RN-016): `Map<categoria, RegraCategoria>` com
  `limite`, `periodicidade` e a origem (`centro_custo` ou `padrao`), mais o
  nome da tabela para `politica.tabela`. Categoria reconhecida (RN-002) =
  chave da tabela aplicável. Reembolsável (RN-006) = limite > 0.
- **Comportamento de hospedagem por periodicidade:** a divisão em noites
  (RN-012) e os dias de viagem (RN-011) disparam por `periodicidade ===
  'diaria'`, e a ampliação (RN-011) por `periodicidade === 'dia'`. A
  validação da tabela (RN-016) garante que `diaria` ⇔ `hospedagem`, então o
  resultado é o mesmo, sem o texto `'hospedagem'` espalhado no núcleo.
- **Nomes nas descrições:** `motivos.ts` mantém um mapa só de apresentação
  (`alimentacao` → "alimentação", `representacao` → "representação"), que
  **volta para a própria chave** se a categoria não está nele. Uma categoria
  nova no arquivo funciona sem mudar o código. Só o texto da descrição
  (orientativo, §4) fica sem acento.
- **Alternativas descartadas:** manter o tipo fechado e acrescentar
  `representacao` (a v4 diz que a tabela muda sem aviso, então uma categoria
  nova quebraria o sistema).

## R-16 — Status PENDENTE e o limiar fixo de R$ 500 (RN-018, AMB-040, AMB-041)

- **Decisão:** o status continua **derivado** dos valores (v1, data-model
  §4), com uma regra a mais antes das outras: `reembolsável > LIMIAR_APROVACAO`
  → `PENDENTE`. `LIMIAR_APROVACAO = 500_00n` fica em `src/nucleo/politica.ts`,
  que passa a ter só esse número: é o único valor de política que a spec fixa
  (AMB-040), e a convenção do `CLAUDE.md` ("números mágicos de política só em
  `politica.ts`") continua valendo. A etapa 11 do `motor.ts` só troca o
  motivo (`REQUER_APROVACAO`, com o corte de limite na descrição) e não
  mexe em nenhum valor, então saldo e dias de viagem já estão certos.
- **Justificativa:** status derivado não pode contradizer os valores, e o
  resumo (RN-014) continua saindo de `statusDe`.
- **Alternativas descartadas:** guardar o status no item (dois lugares para
  a mesma informação); ler o limiar da tabela (a tabela não o traz, AMB-040).

## R-17 — Saída v4 (seção 4, AMB-043)

- **Decisão:** a ordem dos campos de cada item segue o exemplo da §4 (`id`,
  `data`, `categoria`, `moeda`, `valor_original`, `taxa_cambio`,
  `data_cotacao`, `valor_solicitado`, `valor_reembolsavel`, `status`,
  `limite_diario_aplicado`, `em_viagem`, `diarias`, `motivo`). No núcleo, os
  três campos de conversão ficam num só valor `Conversao | null`: ou o item
  tem os três, ou nenhum. É a AMB-043 garantida pelo tipo.
- **Justificativa:** JSON não dá significado à ordem, mas seguir o exemplo
  facilita comparar à mão. Um só `Conversao | null` impede, em tempo de
  compilação, um item com taxa e sem valor em reais.
- **`contracts/saida.schema.json`** é atualizado para a spec 2.2 (campos
  novos, `PENDENTE`, códigos novos, bloco `politica`, resumo novo).
