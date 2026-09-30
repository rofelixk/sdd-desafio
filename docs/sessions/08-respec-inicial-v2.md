
> <ide_opened_file>The user opened the file d:\Usuario\Projetos\Dev\Apps\sdd-de
  safio\exemplos\envelope\00-ENVELOPE-LACRADO.md in the IDE. This may or may
  not be related to the current task.</ide_opened_file>

> Recebemos o envelope do dia 2, ele se encontra em
  "exemplos\envelope\00-ENVELOPE-LACRADO.md". Precisamos atualizar a spec atual
  para integrar as regras novas, pode repassar por ela e me trazer os ajustes
  necessários? Nâo trate o item C agora, somente A e B.

  Searched for 1 pattern, read 7 files, ran 2 shell commands (ctrl+o to expand)

● Li o envelope, a spec inteira e os 4 arquivos anexos. Agora estou cruzando as
  regras novas com a spec para listar o que quebra e as ambiguidades.

  Ran 2 shell commands (ctrl+o to expand)

● Encontrei um ponto importante: o colaborador de exemplos/despesas-exemplo.json
  pertence ao CC-ENG-PLATAFORMA, e com a v4 a tabela de resultados esperados da
  seção 9 muda inteira (alimentação passa a 75, hospedagem deixa de ser
  reembolsável). Antes de fechar o plano, preciso que você decida quatro pontos
  de regra.

● User answered Claude's questions:
  ⎿  · A interface `calcular --input --output` é fixa. Como o motor recebe o
     arquivo da política e o de câmbio? → o Desafio deixa claro que a interface
     de entrada é fixa, vamos tratar como se cambio.json e politica-v4.json
     ficam em locais fixos (provavelmente uma chamada de API num projeto real).
     Vamos garantir de adicionar no READ.me uma seção sobre a necessidade de
     alterar as informações caso for feito um teste com entradas diferentes.
     · Um centro de custo que está na tabela mas não lista uma categoria (o
     CC-ADM não tem `hospedagem`). O que vale para essa categoria? → de acordo
     com a politica esse caso é real e deve ser aplicada a politica padrão, se
     um centro de custo não tem uma categoria específica e ela não é coberta no
     padrão ela é tratada como não reembolsável
     · Hospedagem no CC-ENG-PLATAFORMA (limite 0, "não reembolsável"): como ela
     sai? → recusado num novo motivo de CATEGORIA_NAO_REEMBOLSAVEL
     · `cambio.json` só tem cotação em dias úteis. Uma despesa em EUR num sábado
     (e-004, 2026-07-18) usa qual taxa? → Vamos assumir que a cotação fica fixa
     até o próximo dia útil (usa primeira data disponível antes da data da
     despesa). Despesas fora da data de igência não tem alteração

● Três das respostas ficaram claras. Duas precisam de confirmação, e ainda falta
  uma decisão:

● User answered Claude's questions:
  ⎿  · Na hospedagem do CC-ENG-PLATAFORMA, qual das duas leituras da sua
     resposta está certa? → Mesmo código, descrição nova
     · O que "despesas fora da data de vigência não têm alteração" quer dizer? →
     se uma despesa não está dentro do período de competência(entre inicio e
     fim) ela continua sendo recusada por FORA_DO_PERIODO, a regra de câmbio não
     deve alterar o funcionamento disso
     · Despesa em moeda que não está no cambio.json (e-006 em GBP, f-004 está
     ok) ou sem nenhuma cotação anterior. Como ela sai? → se não tem uma moeda
     especificada na despesa, utilizar BRL. Se tiver moeda especificada e ela
     não tiver câmbio criar um novo códig de saída de
     RECUSADO/CAMBIO_INDISPONIVEL. Adicionar qualquer valor de despesa acima de
     500 (pós conversão para BRL) seria somente uma adição de novo código
     PENDENTE/REQUER_APROVACAO e descrição. Vamos adicionar ele também pois
     parece ser algo pequeno

● Você pediu para incluir o item C. Antes de colocá-lo no plano, ele tem duas
  diferenças em relação ao envelope que precisam de decisão:

● User answered Claude's questions:
  ⎿  · O envelope diz "valor **reembolsável** que passe de R$ 500", e a sua
     resposta fala em "valor da despesa acima de 500". Qual valor dispara a
     pendência? → Reembolsável > 500 (Recommended)
     · Como um item PENDENTE entra na saída e no resumo? → Valor calculado, fora
     do total (Recommended)

  Ran 1 shell command (ctrl+o to expand)

● Updated plan
  ⎿  /plan to preview

● User approved Claude's plan
  ⎿  Plan saved to:
     C:\Users\rofel\.claude\plans\recebemos-o-envelope-do-elegant-crab.md ·
     /plan to edit
     Plano — Integrar o envelope do Dia 2 (Política v4) na spec

     Contexto

     O envelope (exemplos/envelope/00-ENVELOPE-LACRADO.md) troca a política
     única v3
     por limites por centro de custo lidos de politica-v4.json (A), introduz
     despesas em moeda estrangeira convertidas por cambio.json (B) e, por
     decisão
     do usuário nesta sessão, também a fila de aprovação manual > R$ 500 (C).
     O processo exigido: spec primeiro → DECISIONS.md → tasks → código. Este
     plano
     cobre só spec.md + DECISIONS.md (a spec é a fonte da verdade; tasks e
     código
     vêm depois, em outro passo).

     Achado crítico: exemplos/despesas-exemplo.json é do CC-ENG-PLATAFORMA
     (alimentação 75, hospedagem não reembolsável). A v4 é retroativa a julho,
     então
     a tabela da seção 9 muda inteira e o teste T-036 quebra.

     Decisões do usuário (sessão 2026-09-30)

     1. Política e câmbio ficam em local fixo (simula chamada de API); interface
        calcular --input --output não muda. README ganha seção explicando que,
        para
        testar com outros dados, é preciso alterar esses arquivos.
     2. CC ausente da tabela → bloco padrao. CC presente sem a categoria → herda
        do
        padrao. Categoria nem no CC nem no padrão → CATEGORIA_NAO_REEMBOLSAVEL.
     3. Limite 0 (hospedagem no CC-ENG-PLATAFORMA) → mesmo código
        CATEGORIA_NAO_REEMBOLSAVEL, descrição nova citando o centro de custo.
        Etapa 5,
        portanto não gera dia de viagem e precede a nota fiscal.
     4. Dia sem cotação → última cotação disponível até a data (inclusive).
     5. Câmbio não altera período: despesa fora do período continua
        FORA_DO_PERIODO.
     6. Sem moeda → BRL. Moeda informada sem taxa (ou sem cotação anterior) →
        RECUSADO/CAMBIO_INDISPONIVEL (novo código), só o item.
     7. Item C incluído: reembolsável (pós-limites, em BRL) > R$ 500,00 →
        PENDENTE/REQUER_APROVACAO. Valor calculado aparece, consome limite, fica
        fora do total_reembolsavel; resumo ganha pendentes e total_pendente.

     Decisões complementares que eu proponho (registrar como AMB; revisar no
     diff)

     - centro_custo comparado com a normalização da RN-002; ausente/nulo/vazio →
       padrão; tipo não texto → erro de arquivo (RN-015, coerente com AMB-027).
     - moeda: ausente/nula/vazia → BRL; texto normalizado (bordas, maiúsculas);
       não texto ou fora de 3 letras → DADO_INVALIDO. BRL não consulta taxa.
     - Conversão: RN-001 no valor original (centavos da moeda original) → × taxa
       →
       arredonda meio-para-o-par. valor_solicitado passa a ser sempre em BRL.
     - Limiar de NF (vindo do arquivo, 100) compara o valor em BRL.
     - Duplicata compara moeda + valor original (além de
       data/categoria/fornecedor).
     - Ampliação de viagem (percentual vindo do arquivo) vale para todas as
       categorias
       de periodicidade dia (inclui representacao); hospedagem (diaria) continua
       sem ampliação (generaliza AMB-020).
     - Hospedagem PENDENTE continua elegível → gera dia de viagem.
     - Limiar de R$ 500 do item C é fixo na spec (não está no arquivo do
       financeiro).
     - vigencia e versao da política só são lidas e ecoadas; a v4 vale para toda
       a
       execução (retroativa). Não há histórico de versões.
     - Arquivo de política/câmbio ausente, não JSON ou malformado (limite
       negativo ou não
       numérico, periodicidade desconhecida, taxa ≤ 0) → erro, nenhuma saída.

     Alterações em specs/001-motor-reembolso/spec.md (v1.3 → v2.0)

     - Cabeçalho / §1 / §2: versão 2.0, data 2026-09-30; referência à Política
       v4.
     - Clarifications: nova ### Session 2026-09-30 com as perguntas e respostas
       acima.
     - §3 Fora de escopo: remover "Não converte moeda" → "não busca cotações;
       usa só
       as taxas do arquivo de câmbio; resultado sempre em BRL". Trocar a linha
       das 3
       categorias por "só categorias da tabela aplicável". Trocar "sem fluxo de
       aprovação"
       por "só marca pendência; a aprovação do gestor acontece fora do motor e
       não é
       reprocessada". Novo: "não guarda versões antigas da política".
     - §4 Entrada: colaborador.centro_custo passa a decidir a tabela; novo
       despesas[].moeda (ISO 4217, opcional, padrão BRL); valor passa a ser na
       moeda
       da despesa. Descrever os dois arquivos externos (política e câmbio) e o
       que se
       espera de cada campo, sem caminho (caminho é do plan).
     - §4 Saída: item ganha moeda, valor_original, taxa_cambio,
       data_cotacao (nulos quando não se aplica); valor_solicitado em BRL (nulo
       em
       CAMBIO_INDISPONIVEL); status PENDENTE; nível raiz ganha politica
       (versao, tabela = CC aplicado ou padrao); resumo ganha pendentes,
       total_pendente, e total_nao_reembolsado = solicitado − reembolsável −
       pendente.
       Tabela de códigos: CAMBIO_INDISPONIVEL (RECUSADO) e REQUER_APROVACAO
       (PENDENTE). Atualizar o exemplo JSON.
     - Regras alteradas: RN-002 (categorias reconhecidas vêm da tabela), RN-006
       (reembolsável = limite > 0 na tabela aplicável; descrição cita CC),
       RN-008
       (limiar do arquivo, em BRL), RN-009 (limites da tabela aplicável; tabela
       da v3
       vira exemplo com os valores atuais do padrão), RN-011 (percentual do
       arquivo;
       categorias dia; "etapas 2 a 8"), RN-003 (validação de moeda;
       CAMBIO_INDISPONIVEL reserva id), RN-007 (moeda + valor original), RN-013
       (novos códigos), RN-014 (pendentes/total_pendente), RN-015 (arquivos
       externos e
       centro_custo não texto).
     - Regras novas: RN-016 Política por centro de custo (resolução CC → padrão
       →
       não reembolsável; periodicidade; validação do arquivo). RN-017 Moeda e
       conversão
       (taxa da data ou última anterior; arredondamento; CAMBIO_INDISPONIVEL).
       RN-018 Aprovação manual (> 500 estrito, sobre o reembolsável).
     - §6: novas AMB-028 a ~AMB-040 (uma por decisão acima: local dos arquivos,
       significado de "política padrão", categoria faltante no CC, limite 0, CC
       normalizado/ausente, vigência/retroatividade, moeda ausente/inválida, dia
       sem
       cotação, moeda sem taxa, arredondamento da conversão, limiar NF e
       duplicata em
       moeda, ampliação de representacao, base e contabilização do PENDENTE).
       Atualizar AMB-007/AMB-020 onde citam valores fixos.
     - §7 Casos de borda: novas linhas, por exemplo: CC ausente → padrão; CC sem
       a
       categoria → padrão; categoria só em outro CC (representacao no padrão);
       hospedagem no CC-ENG-PLATAFORMA; CC com grafia diferente; moeda
       ausente/"eur"/
       123; EUR em dia útil; EUR no sábado (cotação de sexta); EUR antes da 1ª
       cotação; GBP; estrangeira fora do período → FORA_DO_PERIODO; NF sobre
       valor
       convertido; reembolsável 500,00 (não pendente) vs 500,01 (pendente);
       solicitado
       1.200 cortado para 400 (não pendente); pendente consome limite do dia;
       hospedagem
       pendente gera viagem. Revisar linhas existentes que citam 60/80/250 fixos
       (continuam valendo sob a tabela padrão; explicitar isso).
     - §8 Ordem: 1 arredondamento/normalização/conversão · 2 validação · 3 valor
       não
       positivo · 4 período · 5 categoria (tabela do CC) · 6 câmbio →
       CAMBIO_INDISPONIVEL · 7 duplicata · 8 NF · 9 viagem · 10 limite · 11
       aprovação
       manual → PENDENTE. Justificar a posição do câmbio (não mascara período
       nem
       categoria) e da aprovação (depende do valor final).
     - §9 Aceite: refazer a tabela de despesas-exemplo.json sob
       CC-ENG-PLATAFORMA
       e acrescentar as de despesas-envelope.json e
       despesas-envelope-cc-desconhecido.json
       (valores calculados abaixo; reconferir ao editar).
     - §10 Em aberto: cotação anterior sem limite de dias; ausência de histórico
       de
       política; pendência não reprocessada; moedas com casas decimais
       diferentes de 2.

     Resultados esperados (pré-calculados)

     despesas-exemplo.json (CC-ENG-PLATAFORMA, sem dias de viagem): d-001
     APROVADO
     72,50 · d-002 PARCIAL 2,50 · d-003 PARCIAL 80,00 · d-004 NF · d-005 CAT ·
     d-006
     APROVADO 54,90 · d-007 DUP · d-008 FORA · d-009 VNP · d-010 CAT (hospedagem
     no CC) ·
     d-011 APROVADO 33,33 (limite 75) · d-012 APROVADO 47,20 · d-013 CAT (antes
     da NF) ·
     d-014 APROVADO 61,00. Resumo: 1.861,84 / 351,43 / 1.510,41 · 5/2/7/0
     pendentes.

     despesas-envelope.json (CC-COMERCIAL: 90/150/400/300; viagem 22–24/07):
     e-001 PARCIAL 300,00 · e-002 22 EUR×5,93=130,46 → PARCIAL 90,00 · e-003
     14,50
     EUR×5,88=85,26 → APROVADO · e-004 30 EUR×5,96 (17/07)=178,80 → PARCIAL
     90,00 ·
     e-005 40 USD×5,50=220,00 sem NF → NF · e-006 GBP → CAMBIO_INDISPONIVEL
     (solicitado
     nulo) · e-007 1.200 (3×400) → PENDENTE 1.200,00 · e-008 95,00 (limite 135)
     →
     APROVADO · e-009 CAT · e-010 APROVADO 88,00. Resumo: solicitado 2.457,52 ·
     reembolsável 748,26 · pendente 1.200,00 · não reembolsado 509,26 · 3/3/3
     rec./1 pend.

     despesas-envelope-cc-desconhecido.json (CC-SUPORTE-N2 → padrão): f-001
     APROVADO
     58,00 · f-002 PARCIAL 250,00 · f-003 CAT (representacao fora do padrão) ·
     f-004 12
     USD×5,48=65,76 → APROVADO. Resumo: 623,76 / 373,76 / 250,00 · 2/1/1.

     specs/001-motor-reembolso/DECISIONS.md

     Nova entrada no topo, D-019 — Envelope do Dia 2: Política v4 (A, B e C)
     · 2026-09-30, no formato das anteriores: gatilho, o que mudou (1.3 → 2.0),
     RNs
     alteradas/novas, AMBs novas, requisitos invalidados (constantes fixas da v3
     na
     RN-009/RN-008/RN-011, "não converte moeda", "sem aprovação", tabela da §9)
     e tasks
     afetadas: T-002 (tipos), T-008 (moeda), T-014/T-016/T-021 (limites e limiar
     vindos
     da tabela), T-015 (duplicata com moeda), T-020 (percentual/categorias dia),
     T-023 (novos motivos), T-024 (pendentes), T-025/T-038 (leitura dos arquivos
     externos), T-035/T-037 (saída e schema), T-036 (exemplo), T-041 (novas
     RNs),
     T-042 (README). Registrar que o usuário incluiu o C por decisão nesta
     sessão.

     Fora deste plano (próximo passo, após revisão da spec)

     plan.md/research.md/contracts/ (local fixo dos arquivos, carga da política
     no
     lugar de src/nucleo/politica.ts), novas tasks T-043+ em tasks.md (Fase 5,
     incluindo a seção do README) e código.

     Verificação

     - Reler a spec inteira procurando valores fixos remanescentes (60, 80, 250,
       100,
       1,5) fora de exemplos, e toda menção a "etapas N a M" (renumeradas).
     - Conferir que nenhuma linha da spec cita caminho, arquivo de código ou
       biblioteca.
     - Recalcular à mão as três tabelas da §9 contra
       politica-v4.json/cambio.json.
     - Rodar /speckit-analyze depois das tasks novas para checar consistência
       spec ↔ plan ↔ tasks.
     - Commit docs(spec): integra política v4 (envelope dia 2) só depois da sua
       revisão.

● Plano aprovado. Começo pela spec, de cima para baixo.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      1  # Spec — Motor de Cálculo de Reembolso
      2  
      3 -**Versão:** 1.3 · **Status:** rascunho · **Última alteração:** `
        -2026-09-29`                                                     
      3 +**Versão:** 2.0 · **Status:** rascunho · **Última alteração:** `
        +2026-09-30`                                                     
      4  
      5  > **Regra de ouro deste arquivo:** ele descreve o QUÊ e o PORQUÊ
         . Nenhuma linha
      6  > aqui pode citar linguagem, biblioteca, classe, função ou estru
         tura de pasta.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 11 lines, removed 3 lines
      18  a política é ambígua, cada analista a interpreta de um jeito. O
           resultado é
      19  reembolso inconsistente e sem justificativa rastreável.
      20  
      21 +A partir da **Política de Reembolso v4** (comunicado do RH rece
         +bido em                                                        
      22 +2026-09-30, vigência imediata e retroativa à competência atual)
         +, a política                                                   
      23 +deixa de ser única: os limites variam por **centro de custo** e
         + são mantidos                                                  
      24 +pelo financeiro numa tabela à parte, que muda sem aviso. Colabo
         +radores em                                                     
      25 +viagem internacional lançam despesas em **moeda estrangeira**, 
         +e itens de valor                                               
      26 +alto passam a depender de **aprovação do gestor**.             
      27 +                                                               
      28  ## 2. Objetivo
      29  
      23 -Dado o conjunto de despesas de um colaborador num período, o si
         -stema decide de                                                
      24 -forma determinística quanto de cada despesa é reembolsável e ju
         -stifica cada                                                   
      25 -decisão com um motivo padronizado.                             
      30 +Dado o conjunto de despesas de um colaborador num período, a ta
         +bela de limites                                                
      31 +vigente e as taxas de câmbio, o sistema decide de forma determi
         +nística quanto                                                 
      32 +de cada despesa é reembolsável (em reais), justifica cada decis
         +ão com um                                                      
      33 +motivo padronizado e separa os itens que precisam de aprovação 
         +manual.                                                        
      34  
      35  ## Clarifications
      36  

● Agora a sessão de Clarifications e o Fora de escopo.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 12 lines
      49  - Q: `colaborador.id`, `periodo.inicio` ou `periodo.fim` vazios
          , nulos ou de tipo errado são o mesmo que ausentes? → A: Sim, c
          om o mesmo critério da RN-003. O arquivo é recusado pela RN-015
           (AMB-027).
      50  - Q: Em "Diárias na descrição" (2 diárias, 480,00), qual é o `l
          imite_diario_aplicado`? → A: 250,00, o limite por diária. O lim
          ite da estadia inteira (500,00) não aparece na saída (seção 4).
      51  
      52 +### Session 2026-09-30 (envelope do Dia 2 — Política v4)       
      53 +                                                               
      54 +- Q: A interface `calcular --input --output` é fixa. De onde vê
         +m a tabela de limites e as taxas de câmbio? → A: De dois arquiv
         +os externos em **local fixo**, fora do arquivo de entrada, como
         + se viessem de um serviço do financeiro. A interface não muda. 
         +Para testar com outros dados, esses arquivos precisam ser troca
         +dos (RN-016, RN-017, AMB-028).                                 
      55 +- Q: O que é a "política padrão" de um centro de custo sem entr
         +ada na tabela? → A: O bloco padrão da própria tabela vigente, e
         + não as constantes da v3 (RN-016, AMB-029).                    
      56 +- Q: Um centro de custo que está na tabela mas não lista uma ca
         +tegoria (o CC-ADM não tem `hospedagem`)? → A: A categoria que f
         +alta usa o limite do padrão. Se ela também não está no padrão, 
         +não é reembolsável (RN-016, AMB-030).                          
      57 +- Q: Hospedagem no CC-ENG-PLATAFORMA (limite 0, "não reembolsáv
         +el")? → A: RECUSADO com o mesmo código `CATEGORIA_NAO_REEMBOLSA
         +VEL`, com uma descrição que cita o centro de custo. É recusada 
         +na etapa de categoria, então não gera dia de viagem e vem antes
         + da nota fiscal (RN-006, AMB-031).                             
      58 +- Q: Despesa em moeda estrangeira num dia sem cotação (fim de s
         +emana, feriado)? → A: Usa a última cotação publicada **até a da
         +ta da despesa, inclusive**. A cotação fica valendo até o próxim
         +o dia útil (RN-017, AMB-035).                                  
      59 +- Q: O câmbio muda o tratamento de uma despesa fora do período?
         + → A: Não. Uma despesa fora do período continua `FORA_DO_PERIOD
         +O`, tenha ou não cotação (seção 8, AMB-039).                   
      60 +- Q: Despesa sem `moeda`? E com moeda sem cotação? → A: Sem `mo
         +eda` vale BRL. Moeda informada sem nenhuma cotação até a data →
         + RECUSADO com o novo código `CAMBIO_INDISPONIVEL`, só aquele it
         +em (RN-017, AMB-036).                                          
      61 +- Q: O item C (aprovação manual) entra agora? Qual valor dispar
         +a a pendência? → A: Entra, por decisão do usuário. O gatilho é 
         +o **valor reembolsável**, depois dos limites e já em BRL, **est
         +ritamente maior** que R$ 500,00. O item sai PENDENTE/`REQUER_AP
         +ROVACAO` (RN-018, AMB-040).                                    
      62 +- Q: Como um item PENDENTE aparece na saída e no resumo? → A: `
         +valor_reembolsavel` mostra o valor calculado. O item consome o 
         +limite do dia normalmente, mas fica **fora** do `total_reembols
         +avel`. O resumo ganha `pendentes` e `total_pendente` (RN-014, R
         +N-018, AMB-041).                                               
      63 +                                                               
      64  ## 3. Fora de escopo
      65  
      66  - Não efetua pagamento nem integra com folha, ERP ou banco. Só 
          calcula.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 7 lines, removed 1 line
      70    como motivo da despesa ou situação de viagem. Texto livre só 
          é ecoado ou
      71    comparado literalmente. **Única exceção:** o número de diária
          s de hospedagem
      72    é extraído de `descricao` pelo padrão fechado da RN-012.
      73 -- Não converte moeda. Todo valor é tratado como Real (BRL).    
      73 +- Não busca cotações nem consulta serviços externos. Converte m
         +oeda usando                                                    
      74 +  só as taxas do arquivo de câmbio (RN-017). O resultado é semp
         +re em reais                                                    
      75 +  (BRL). Os limites da política são sempre em BRL.             
      76 +- Não mantém a tabela de limites nem as taxas. Os dois arquivos
         + são mantidos                                                  
      77 +  pelo financeiro, e o sistema só os lê.                       
      78 +- Não guarda versões antigas da política. A tabela vigente vale
         + para todas as                                                 
      79 +  despesas da execução, qualquer que seja a data delas (AMB-034
         +).                                                             
      80  - Não valida diferença de preço entre as noites de uma estadia 
          nem tarifas
      81    promocionais. O valor da hospedagem é sempre dividido igualme
          nte entre as
      82    noites (RN-012).

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 6 lines, removed 4 lines
      84  - Não guarda histórico entre execuções. Duplicatas só são detec
          tadas dentro do
      85    mesmo arquivo, e despesas fora do período não ficam guardadas
           para um
      86    período futuro.
      87 -- Não reembolsa categorias além de alimentação, transporte urba
         -no e hospedagem                                                
      88 -  (ver RN-006).                                                
      89 -- Não tem fluxo de aprovação humana, alçadas, exceções manuais 
         -nem interface                                                  
      90 -  gráfica.                                                     
      87 +- Não reembolsa categorias que não estão na tabela aplicável ao
         + centro de                                                     
      88 +  custo do colaborador (ver RN-006 e RN-016).                  
      89 +- Não executa a aprovação do gestor. O sistema só marca como pe
         +ndente o item                                                  
      90 +  que precisa dela (RN-018). A aprovação acontece fora do motor
         +, e o resultado                                                
      91 +  dela não volta para ser processado. Não há alçadas, exceções 
         +manuais nem                                                    
      92 +  interface gráfica.                                           
      93  
      94  ## 4. Entrada e saída
      95  

● Agora a seção 4, começando pela entrada:

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
       99  |---|---|---|---|
      100  | `colaborador.id` | texto | Identificador do colaborador | si
           m |
      101  | `colaborador.nome` | texto | Nome, apenas ecoado na saída | 
           não |
      102 -| `colaborador.centro_custo` | texto | Centro de custo, apenas
          - ecoado na saída | não |                                      
      102 +| `colaborador.centro_custo` | texto | Centro de custo. Decide
          + qual tabela de limites se aplica (RN-016). Ausente, nulo ou v
          +azio → tabela padrão. Tipo diferente de texto → arquivo recusa
          +do (RN-015) | não |                                           
      103  | `periodo.competencia` | texto `AAAA-MM` | Mês de competência
           , informativo (ver AMB-010) | não |
      104  | `periodo.inicio` | data `AAAA-MM-DD` | Primeiro dia do perío
           do, inclusivo | sim |
      105  | `periodo.fim` | data `AAAA-MM-DD` | Último dia do período, i
           nclusivo | sim |

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines, removed 1 line
      109  | `despesas[].categoria` | texto | Categoria declarada (ver RN
           -002) | sim |
      110  | `despesas[].descricao` | qualquer valor, tratado como texto 
           | Texto livre. Em hospedagem, é de onde se extrai o número de 
           diárias (RN-012). Ausente ou nulo = vazio = 1 diária (RN-003) 
           | não |
      111  | `despesas[].fornecedor` | qualquer valor, tratado como texto
            | Fornecedor, usado na detecção de duplicata. Ausente ou nulo
            equivale a vazio (RN-003, RN-007) | não |
      112 -| `despesas[].valor` | número ou texto numérico | Valor solici
          -tado em reais, pode ter qualquer número de casas decimais. Tam
          -bém é aceito como texto no formato fechado da RN-003 (`"45.00"
          -`, `"45,00"`) | sim |                                         
      112 +| `despesas[].valor` | número ou texto numérico | Valor solici
          +tado **na moeda da despesa** (`moeda`), pode ter qualquer núme
          +ro de casas decimais. Também é aceito como texto no formato fe
          +chado da RN-003 (`"45.00"`, `"45,00"`) | sim |                
      113 +| `despesas[].moeda` | texto, código ISO 4217 de 3 letras | Mo
          +eda em que o `valor` foi pago. Ausente, nulo ou vazio = `BRL`.
          + Comparado sem diferenciar maiúsculas e sem espaços nas bordas
          + (`"eur"` = `EUR`). Outro tipo ou texto que não tem 3 letras é
          + `DADO_INVALIDO` (RN-003, RN-017) | não |                     
      114  | `despesas[].tem_nota_fiscal` | booleano | Se há nota fiscal.
            Vazio (ausente, nulo ou texto vazio) equivale a `false`. Qual
           quer outro valor não booleano é `DADO_INVALIDO` (RN-003) | não
            |
      115  
      116  **Saída:** definida por mim. Estrutura e significado de cada c
           ampo:

● Agora descrevo os dois arquivos externos e atualizo a tabela de saída:
● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 32 lines
      113  | `despesas[].moeda` | texto, código ISO 4217 de 3 letras | Mo
           eda em que o `valor` foi pago. Ausente, nulo ou vazio = `BRL`.
            Comparado sem diferenciar maiúsculas e sem espaços nas bordas
            (`"eur"` = `EUR`). Outro tipo ou texto que não tem 3 letras é
            `DADO_INVALIDO` (RN-003, RN-017) | não |
      114  | `despesas[].tem_nota_fiscal` | booleano | Se há nota fiscal.
            Vazio (ausente, nulo ou texto vazio) equivale a `false`. Qual
           quer outro valor não booleano é `DADO_INVALIDO` (RN-003) | não
            |
      115  
      116 +**Dados externos:** além do arquivo de entrada, toda execução 
          +lê dois arquivos                                              
      117 +mantidos pelo financeiro, num **local fixo** (não são indicado
          +s na linha de                                                 
      118 +comando, AMB-028). Os formatos são os de `exemplos/envelope/po
          +litica-v4.json` e                                             
      119 +`exemplos/envelope/cambio.json`.                              
      120 +                                                              
      121 +*Tabela de limites (política):*                               
      122 +                                                              
      123 +| Campo | Tipo | Significado |                                
      124 +|---|---|---|                                                 
      125 +| `versao` | texto | Versão da política. Só ecoada na saída | 
      126 +| `vigencia` | data `AAAA-MM-DD` | Início da vigência. Só lida
          +, não restringe nenhuma despesa (AMB-034) |                   
      127 +| `moeda_base` | texto | Moeda dos limites. Tem de ser `BRL` |
      128 +| `padrao` | objeto | Tabela padrão: categoria → `{limite, per
          +iodicidade}` (RN-016) |                                       
      129 +| `centros_custo` | objeto | Centro de custo → tabela própria,
          + no mesmo formato de `padrao`. Pode listar só algumas categori
          +as (RN-016) |                                                 
      130 +| `<categoria>.limite` | número ≥ 0, no máximo 2 casas | Limit
          +e em reais. `0` = categoria não reembolsável naquele centro de
          + custo (RN-006) |                                             
      131 +| `<categoria>.periodicidade` | `dia` ou `diaria` | `dia`: lim
          +ite por data de calendário (RN-009). `diaria`: limite por noit
          +e de hospedagem (RN-012). Só a categoria `hospedagem` usa `dia
          +ria` |                                                        
      132 +| `<categoria>.observacao` | texto | Informativo, ignorado |  
      133 +| `nota_fiscal_obrigatoria_acima_de` | número ≥ 0 | Limiar da 
          +nota fiscal em reais (RN-008) |                               
      134 +| `acrescimo_em_viagem_percentual` | número ≥ 0 | Ampliação do
          +s limites em dia de viagem, em % (RN-011) |                   
      135 +                                                              
      136 +*Taxas de câmbio:*                                            
      137 +                                                              
      138 +| Campo | Tipo | Significado |                                
      139 +|---|---|---|                                                 
      140 +| `moeda_base` | texto | Moeda para a qual se converte. Tem de
          + ser `BRL` |                                                  
      141 +| `taxas` | objeto | Data `AAAA-MM-DD` → objeto moeda (ISO 421
          +7) → quantos reais vale 1 unidade da moeda (número > 0). Só ex
          +istem datas com cotação publicada (dias úteis) |              
      142 +| `fonte`, `observacao` | texto | Informativos, ignorados |   
      143 +                                                              
      144 +Os nomes de categoria e de centro de custo da tabela são compa
          +rados com a                                                   
      145 +mesma normalização da RN-002. Um arquivo externo ausente, que 
          +não é JSON ou                                                 
      146 +que não segue estes formatos, interrompe a execução (RN-015). 
      147 +                                                              
      148  **Saída:** definida por mim. Estrutura e significado de cada c
           ampo:
      149  
      150  | Campo | Tipo | Significado |

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines
      151  |---|---|---|
      152  | `colaborador` | objeto | Eco do objeto de entrada |
      153  | `periodo` | objeto | Eco do objeto de entrada |
      154 +| `politica.versao` | texto | `versao` da tabela de limites us
          +ada |                                                         
      155 +| `politica.tabela` | texto | Centro de custo cuja tabela foi 
          +aplicada, como está escrito na tabela (`"CC-COMERCIAL"`), ou `
          +"padrao"` quando o centro de custo não tem entrada ou está vaz
          +io (RN-016) |                                                 
      156  | `itens` | lista | Um item por despesa de entrada, **na mesma
            ordem da entrada** |
      157  | `itens[].id` | texto | `id` da despesa, como veio |
      158  | `itens[].data` | texto | `data` da despesa, como veio |

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 7 lines, removed 3 lines
      157  | `itens[].id` | texto | `id` da despesa, como veio |
      158  | `itens[].data` | texto | `data` da despesa, como veio |
      159  | `itens[].categoria` | texto | Categoria normalizada (RN-002)
           , ou a original, como veio, se não for reconhecida |
      160 -| `itens[].valor_solicitado` | número ou nulo | Valor da entra
          -da arredondado para centavos (RN-001). Nulo se o `valor` é aus
          -ente ou não numérico (RN-003) |                               
      161 -| `itens[].valor_reembolsavel` | número | Valor a reembolsar, 
          -em centavos, `0 ≤ valor_reembolsavel ≤ max(valor_solicitado, 0
          -)` |                                                          
      162 -| `itens[].status` | texto | `APROVADO` (reembolsável = solici
          -tado), `PARCIAL` (0 < reembolsável < solicitado) ou `RECUSADO`
          - (reembolsável = 0) |                                         
      160 +| `itens[].moeda` | texto ou nulo | Moeda normalizada da despe
          +sa (`"BRL"` se ausente). Num item `DADO_INVALIDO`, sai como ve
          +io (ausente → nulo) |                                         
      161 +| `itens[].valor_original` | número ou nulo | `valor` da entra
          +da arredondado para centavos (RN-001), **na moeda da despesa**
          +. Nulo se o `valor` é ausente ou não numérico (RN-003) |      
      162 +| `itens[].taxa_cambio` | número ou nulo | Taxa usada na conve
          +rsão (RN-017), como está no arquivo de câmbio. `1` em BRL. Nul
          +o se não houve conversão |                                    
      163 +| `itens[].data_cotacao` | texto ou nulo | Data da cotação usa
          +da (a da despesa ou a última anterior, RN-017). Nulo em BRL ou
          + se não houve conversão |                                     
      164 +| `itens[].valor_solicitado` | número ou nulo | Valor solicita
          +do **em reais**: `valor_original` convertido (RN-017), ou igua
          +l a ele em BRL. Nulo se o `valor` é ausente ou não numérico (R
          +N-003) ou se não há cotação para a moeda (RN-017) |           
      165 +| `itens[].valor_reembolsavel` | número | Valor a reembolsar e
          +m reais, `0 ≤ valor_reembolsavel ≤ max(valor_solicitado, 0)` (
          +nulo conta como 0). Num item PENDENTE, é o valor que será pago
          + se o gestor aprovar |                                        
      166 +| `itens[].status` | texto | `APROVADO` (reembolsável = solici
          +tado), `PARCIAL` (0 < reembolsável < solicitado), `RECUSADO` (
          +reembolsável = 0) ou `PENDENTE` (reembolsável > R$ 500,00, agu
          +ardando aprovação do gestor, RN-018) |                        
      167  | `itens[].motivo.codigo` | texto | Código padronizado da deci
           são (tabela abaixo) |
      168  | `itens[].motivo.descricao` | texto | Frase legível em portug
           uês, com os números que justificam a decisão |
      169  | `itens[].limite_diario_aplicado` | número ou nulo | Limite d
           iário da categoria usado no cálculo, já ampliado se for dia de
            viagem. Em hospedagem é o limite por diária. Nulo se a despes
           a não chegou à etapa de limite |

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 8 lines, removed 6 lines
      170  | `itens[].em_viagem` | booleano ou nulo | Se a data da despes
           a foi considerada dia de viagem (RN-011). Nulo se a despesa nã
           o chegou à etapa de limite |
      171  | `itens[].diarias` | inteiro ou nulo | Número de diárias cons
           iderado (RN-012). Só preenchido em hospedagem que chegou à eta
           pa de limite; nulo nos demais casos |
      172  | `resumo.quantidade_itens` | inteiro | Total de despesas na e
           ntrada |
      173 -| `resumo.aprovados` / `parciais` / `recusados` | inteiro | Co
          -ntagem por status |                                           
      174 -| `resumo.total_solicitado` | número | Soma de `valor_solicita
          -do` dos itens com valor **positivo** (nulo não entra) |       
      175 -| `resumo.total_reembolsavel` | número | Soma de `valor_reembo
          -lsavel` de todos os itens |                                   
      176 -| `resumo.total_nao_reembolsado` | número | `total_solicitado 
          -− total_reembolsavel` |                                       
      173 +| `resumo.aprovados` / `parciais` / `recusados` / `pendentes` 
          +| inteiro | Contagem por status |                             
      174 +| `resumo.total_solicitado` | número | Soma de `valor_solicita
          +do` (em reais) dos itens com valor **positivo** (nulo não entr
          +a) |                                                          
      175 +| `resumo.total_reembolsavel` | número | Soma de `valor_reembo
          +lsavel` dos itens que **não** estão PENDENTE |                
      176 +| `resumo.total_pendente` | número | Soma de `valor_reembolsav
          +el` dos itens PENDENTE |                                      
      177 +| `resumo.total_nao_reembolsado` | número | `total_solicitado 
          +− total_reembolsavel − total_pendente` |                      
      178  
      178 -Todo valor monetário da saída é um número em reais com no máxi
          -mo duas casas                                                 
      179 -decimais.                                                     
      179 +Todo valor monetário da saída é um número com no máximo duas c
          +asas decimais.                                                
      180 +Todos são em reais, exceto `valor_original`, que está na moeda
          + da despesa. A                                                
      181 +`taxa_cambio` sai com as casas decimais que tem no arquivo de 
          +câmbio.                                                       
      182  
      183  Num item recusado com `DADO_INVALIDO`, os campos de eco (`id`,
            `data`,
      184  `categoria`) saem **exatamente como vieram**, inclusive nulos,
            vazios ou de

● Agora o parágrafo sobre DADO_INVALIDO, a tabela de códigos e o exemplo:

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 12 lines, removed 4 lines
      181  `taxa_cambio` sai com as casas decimais que tem no arquivo de 
           câmbio.
      182  
      183  Num item recusado com `DADO_INVALIDO`, os campos de eco (`id`,
            `data`,
      184 -`categoria`) saem **exatamente como vieram**, inclusive nulos,
          - vazios ou de                                                 
      185 -outro tipo (um campo ausente sai nulo). Assim a própria saída 
          -mostra o dado                                                 
      186 -que causou a recusa. O `valor_solicitado` é o valor arredondad
          -o quando o                                                    
      187 -`valor` é numérico (a recusa veio de outro campo) e nulo quand
          -o não é (AMB-023).                                            
      184 +`categoria`, `moeda`) saem **exatamente como vieram**, inclusi
          +ve nulos, vazios                                              
      185 +ou de outro tipo (um campo ausente sai nulo). Assim a própria 
          +saída mostra o                                                
      186 +dado que causou a recusa. O `valor_original` é o valor arredon
          +dado quando o                                                 
      187 +`valor` é numérico (a recusa veio de outro campo) e nulo quand
          +o não é                                                       
      188 +(AMB-023). O `valor_solicitado` segue a RN-017 quando `valor`,
          + `data` e                                                     
      189 +`moeda` permitem a conversão, e é nulo nos demais casos.      
      190  
      191 +Em qualquer item, se a moeda não tem cotação até a data da des
          +pesa,                                                         
      192 +`valor_solicitado`, `taxa_cambio` e `data_cotacao` saem nulos,
          + mesmo que o                                                  
      193 +item tenha sido recusado por uma etapa anterior à de câmbio (p
          +or exemplo,                                                   
      194 +`FORA_DO_PERIODO`). O código continua sendo o da primeira etap
          +a que recusou o                                               
      195 +item (seção 8).                                               
      196 +                                                              
      197  O mesmo `id` pode aparecer em mais de um item da saída quando 
           uma despesa
      198  `DADO_INVALIDO` é seguida pela sua correção, com o mesmo `id` 
           (AMB-025).
      199  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 7 lines, removed 1 line
      209  | `VALOR_NAO_POSITIVO` | RECUSADO | RN-004 |
      210  | `FORA_DO_PERIODO` | RECUSADO | RN-005 |
      211  | `CATEGORIA_NAO_REEMBOLSAVEL` | RECUSADO | RN-006 |
      212 +| `CAMBIO_INDISPONIVEL` | RECUSADO | RN-017 |                 
      213  | `DUPLICATA` | RECUSADO | RN-007 |
      214  | `NOTA_FISCAL_AUSENTE` | RECUSADO | RN-008 |
      215 +| `REQUER_APROVACAO` | PENDENTE | RN-018 |                    
      216  
      215 -**Exemplo** (período 2026-07-01 a 2026-07-31, sem viagem):    
      217 +Num item `REQUER_APROVACAO`, a descrição também informa o cort
          +e de limite,                                                  
      218 +quando houve (o código de limite é substituído pelo de aprovaç
          +ão).                                                          
      219  
      220 +**Exemplo** (período 2026-07-01 a 2026-07-31, sem viagem, cent
          +ro de custo sem                                               
      221 +entrada na tabela, portanto tabela padrão da v4):             
      222 +                                                              
      223  Entrada (só `despesas`):
      224  
      225  ```json

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 16 lines, removed 7 lines
      226  [
      227    {"id": "a", "data": "2026-07-03", "categoria": "alimentacao"
           , "fornecedor": "X", "valor": 45.00, "tem_nota_fiscal": true},
      228    {"id": "b", "data": "2026-07-03", "categoria": "Alimentacao"
           , "fornecedor": "Y", "valor": 30.00, "tem_nota_fiscal": true},
      229 -  {"id": "c", "data": "2026-07-04", "categoria": "coworking", 
          -  "fornecedor": "Z", "valor": 89.00, "tem_nota_fiscal": true} 
      229 +  {"id": "c", "data": "2026-07-04", "categoria": "coworking", 
          +  "fornecedor": "Z", "valor": 89.00, "tem_nota_fiscal": true},
      230 +  {"id": "d", "data": "2026-07-14", "categoria": "alimentacao"
          +, "fornecedor": "W", "valor": 10.00, "moeda": "EUR", "tem_nota
          +_fiscal": true}                                               
      231  ]
      232  ```
      233  
     ...
      237  {
      238    "colaborador": {"id": "c-0001"},
      239    "periodo": {"inicio": "2026-07-01", "fim": "2026-07-31"},
      240 +  "politica": {"versao": "v4", "tabela": "padrao"},           
      241    "itens": [
      240 -    {"id": "a", "data": "2026-07-03", "categoria": "alimentaca
          -o", "valor_solicitado": 45.00,                                
      242 +    {"id": "a", "data": "2026-07-03", "categoria": "alimentaca
          +o",                                                           
      243 +     "moeda": "BRL", "valor_original": 45.00, "taxa_cambio": 1
          +, "data_cotacao": null, "valor_solicitado": 45.00,            
      244       "valor_reembolsavel": 45.00, "status": "APROVADO", "limit
           e_diario_aplicado": 60.00, "em_viagem": false, "diarias": null
           ,
      245       "motivo": {"codigo": "APROVADO_INTEGRAL", "descricao": "D
           entro do limite diário de alimentação (R$ 60,00); saldo do dia
            após este item: R$ 15,00."}},
      243 -    {"id": "b", "data": "2026-07-03", "categoria": "alimentaca
          -o", "valor_solicitado": 30.00,                                
      246 +    {"id": "b", "data": "2026-07-03", "categoria": "alimentaca
          +o",                                                           
      247 +     "moeda": "BRL", "valor_original": 30.00, "taxa_cambio": 1
          +, "data_cotacao": null, "valor_solicitado": 30.00,            
      248       "valor_reembolsavel": 15.00, "status": "PARCIAL", "limite
           _diario_aplicado": 60.00, "em_viagem": false, "diarias": null,
      249       "motivo": {"codigo": "LIMITE_DIARIO_EXCEDIDO", "descricao
           ": "Limite diário de alimentação R$ 60,00 em 2026-07-03; saldo
            disponível R$ 15,00; excedente de R$ 15,00 não reembolsado."}
           },
      246 -    {"id": "c", "data": "2026-07-04", "categoria": "coworking"
          -, "valor_solicitado": 89.00,                                  
      250 +    {"id": "c", "data": "2026-07-04", "categoria": "coworking"
          +,                                                             
      251 +     "moeda": "BRL", "valor_original": 89.00, "taxa_cambio": 1
          +, "data_cotacao": null, "valor_solicitado": 89.00,            
      252       "valor_reembolsavel": 0.00, "status": "RECUSADO", "limite
           _diario_aplicado": null, "em_viagem": null, "diarias": null,
      248 -     "motivo": {"codigo": "CATEGORIA_NAO_REEMBOLSAVEL", "descr
          -icao": "Categoria 'coworking' não consta na política de reembo
          -lso."}}                                                       
      253 +     "motivo": {"codigo": "CATEGORIA_NAO_REEMBOLSAVEL", "descr
          +icao": "Categoria 'coworking' não consta na tabela padrão da p
          +olítica v4."}},                                               
      254 +    {"id": "d", "data": "2026-07-14", "categoria": "alimentaca
          +o",                                                           
      255 +     "moeda": "EUR", "valor_original": 10.00, "taxa_cambio": 5
          +.93, "data_cotacao": "2026-07-14", "valor_solicitado": 59.30, 
      256 +     "valor_reembolsavel": 59.30, "status": "APROVADO", "limit
          +e_diario_aplicado": 60.00, "em_viagem": false, "diarias": null
          +,                                                             
      257 +     "motivo": {"codigo": "APROVADO_INTEGRAL", "descricao": "E
          +UR 10,00 × 5,93 (cotação de 2026-07-14) = R$ 59,30; dentro do 
          +limite diário de alimentação (R$ 60,00)."}}                   
      258    ],
      250 -  "resumo": {"quantidade_itens": 3, "aprovados": 1, "parciais"
          -: 1, "recusados": 1,                                          
      251 -             "total_solicitado": 164.00, "total_reembolsavel":
          - 60.00, "total_nao_reembolsado": 104.00}                      
      259 +  "resumo": {"quantidade_itens": 4, "aprovados": 2, "parciais"
          +: 1, "recusados": 1, "pendentes": 0,                          
      260 +             "total_solicitado": 223.30, "total_reembolsavel":
          + 119.30, "total_pendente": 0.00, "total_nao_reembolsado": 104.
          +00}                                                           
      261  }
      262  ```
      263  

● Seção 4 pronta. Agora as regras de negócio, começando por RN-001, RN-002 e
  RN-003:

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 5 lines, removed 1 line
      276  (terceira casa 5 e nada depois), vai para o centavo **par**. T
           odas as
      277  comparações e cálculos seguintes usam o valor arredondado e sã
           o exatos em
      278  centavos, sem erro de representação.
      279 -**Origem:** ausente na política (AMB-013)                     
      279 +                                                              
      280 +O arredondamento vale para o `valor` na moeda da despesa (`val
          +or_original`).                                                
      281 +Em moeda estrangeira, o valor convertido para reais é arredond
          +ado de novo, com                                              
      282 +a mesma regra (RN-017).                                       
      283 +**Origem:** ausente na política (AMB-013, AMB-037)            
      284  **Aceite:** `33.333` → `valor_solicitado` 33.33. `10.005` → 10
           .00.
      285  `10.015` → 10.02. `33.345` → 33.34. `33.3451` → 33.35 (fora do
            meio).
      286  `100.004` → 100.00 e não exige nota fiscal (RN-008).

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 8 lines, removed 4 lines
      288  ### RN-002 — Normalização da categoria
      289  
      290  **Regra:** A categoria é comparada sem diferenciar maiúsculas 
           de minúsculas,
      291 -sem espaços nas bordas e sem acentos. As categorias reconhecid
          -as são                                                        
      292 -`alimentacao`, `transporte_urbano` e `hospedagem`.            
      293 -**Origem:** política do RH, item 9 (AMB-014)                  
      291 +sem espaços nas bordas e sem acentos. As categorias reconhecid
          +as são as que                                                 
      292 +aparecem na tabela aplicável ao colaborador (RN-016), comparad
          +as com a mesma                                                
      293 +normalização. Na saída, uma categoria reconhecida sai normaliz
          +ada, e uma não                                                
      294 +reconhecida sai como veio.                                    
      295 +**Origem:** política do RH v3, item 9, e v4, item A (AMB-014, 
          +AMB-030)                                                      
      296  **Aceite:** `"ALIMENTACAO"`, `" Alimentação "` e `"alimentacao
           "` são todas
      295 -tratadas como `alimentacao` e somam no mesmo limite diário.   
      297 +tratadas como `alimentacao` e somam no mesmo limite diário. `"
          +Representação"`                                               
      298 +é reconhecida como `representacao` para o CC-COMERCIAL, mas nã
          +o para um                                                     
      299 +colaborador na tabela padrão.                                 
      300  
      301  ### RN-003 — Validação dos dados do item
      302  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      316  recusada com `DADO_INVALIDO`, por qualquer motivo (inclusive o
            próprio `id`
      317  repetido), não reserva, e a seguinte com o mesmo `id` é tratad
           a como a
      318  correção dela. Uma despesa recusada numa etapa posterior (perí
           odo, categoria,
      319 -duplicata, nota fiscal) passou por esta validação e reserva o 
          -`id` (AMB-025).                                               
      319 +câmbio, duplicata, nota fiscal) passou por esta validação e re
          +serva o `id` (AMB-025).                                       
      320  
      321  `valor` é numérico quando é um número ou um texto que, sem os 
           espaços das
      322  bordas, tem sinal `-` opcional, um ou mais dígitos e, opcional
           mente, **um**

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 7 lines
      335  valor (textos como `"true"` ou `"sim"`, números como `1` ou `0
           `, listas,
      336  objetos) é `DADO_INVALIDO`.
      337  
      338 +`moeda` ausente, nula, ou texto vazio ou só com espaços vale `
          +BRL`. Um texto                                                
      339 +é comparado sem espaços nas bordas e sem diferenciar maiúscula
          +s de                                                          
      340 +minúsculas, e precisa ter exatamente 3 letras de A a Z. Qualqu
          +er outro valor                                                
      341 +(número, booleano, lista, objeto, texto como `"R$"` ou `"EURO"
          +`) é                                                          
      342 +`DADO_INVALIDO`. Uma moeda com formato válido mas sem cotação 
          +não é dado                                                    
      343 +inválido: ela é tratada pela RN-017 (AMB-036).                
      344 +                                                              
      345  `fornecedor` e `descricao` nunca causam `DADO_INVALIDO`: qualq
           uer valor é
      346  aceito e tratado como texto. Ausente ou nulo vale texto **vazi
           o**. Texto é
      347  usado como veio. Número e booleano viram o texto com que apare
           cem no arquivo

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      347  usado como veio. Número e booleano viram o texto com que apare
           cem no arquivo
      348  (`123` → `"123"`, `true` → `"true"`). Lista e objeto viram o s
           eu texto JSON
      349  compacto, sem espaços (AMB-026).
      350 -**Origem:** ausente na política (AMB-018, AMB-021, AMB-022, AM
          -B-023, AMB-024, AMB-025, AMB-026)                             
      350 +**Origem:** ausente na política (AMB-018, AMB-021, AMB-022, AM
          +B-023, AMB-024, AMB-025, AMB-026, AMB-036)                    
      351  **Aceite:** uma despesa com `"data": "2026-07-32"` sai RECUSAD
           O/`DADO_INVALIDO`
      352  com `data` `"2026-07-32"` na saída, e as outras despesas do ar
           quivo têm o
      353  resultado de sempre. `"valor": "R$ 45,00"` sai com `valor_soli
           citado` nulo.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines, removed 1 line
      361  `"tem_nota_fiscal": null` vale `false`.
      362  `"categoria": ""` e `"categoria": 123` → RECUSADO/`DADO_INVALI
           DO`, e não
      363  `CATEGORIA_NAO_REEMBOLSAVEL`. `"fornecedor": 123` e `"descrica
           o": null`
      364 -não recusam a despesa.                                        
      364 +não recusam a despesa. `"moeda": " eur "` vale `EUR`. `"moeda"
          +: 978` e                                                      
      365 +`"moeda": "EURO"` → RECUSADO/`DADO_INVALIDO`.                 
      366  
      367  ### RN-004 — Valores não positivos
      368  

● Agora RN-004, RN-006, RN-007 e RN-008:

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 5 lines, removed 2 lines
      366  
      367  ### RN-004 — Valores não positivos
      368  
      369 -**Regra:** Uma despesa com `valor_solicitado` ≤ 0,00 (estorno,
          - cancelamento,                                                
      369 +**Regra:** Uma despesa com `valor_original` ≤ 0,00 (estorno, c
          +ancelamento,                                                  
      370  zero) é **RECUSADA** com `VALOR_NAO_POSITIVO`, não abate nenhu
           ma outra despesa
      371 -e não entra em `total_solicitado`.                            
      371 +e não entra em `total_solicitado`. O sinal não depende da moed
          +a (toda taxa é                                                
      372 +positiva), então a regra vale mesmo sem cotação. Uma despesa e
          +m moeda                                                       
      373 +estrangeira positiva cuja conversão arredonda para 0,00 real t
          +ambém é                                                       
      374 +recusada com `VALOR_NAO_POSITIVO`.                            
      375  **Origem:** ausente na política (AMB-012)
      376  **Aceite:** `d-009` (−45,00) → RECUSADO/`VALOR_NAO_POSITIVO`, 
           reembolsável 0,00.
      377  As despesas de transporte de 2026-07-11 não são afetadas.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 13 lines, removed 4 lines
      387  
      388  ### RN-006 — Categorias reembolsáveis
      389  
      390 -**Regra:** Só as categorias `alimentacao`, `transporte_urbano`
          - e `hospedagem`                                               
      391 -(depois da RN-002) são reembolsáveis. Qualquer outra é **RECUS
          -ADA**                                                         
      392 -integralmente com `CATEGORIA_NAO_REEMBOLSAVEL`.               
      393 -**Origem:** política do RH, item 9 (AMB-019)                  
      390 +**Regra:** Só é reembolsável a categoria (depois da RN-002) qu
          +e tem limite                                                  
      391 +**maior que zero** na tabela aplicável ao colaborador (RN-016)
          +. Qualquer outra                                              
      392 +é **RECUSADA** integralmente com `CATEGORIA_NAO_REEMBOLSAVEL`.
          + São dois casos,                                              
      393 +com o mesmo código e descrições diferentes:                   
      394 +- a categoria não está nem na tabela do centro de custo nem na
          + padrão → a                                                   
      395 +  descrição diz que a categoria não consta na política;       
      396 +- a categoria tem limite 0 na tabela do centro de custo → a de
          +scrição diz que                                               
      397 +  a categoria não é reembolsável **naquele centro de custo** e
          + cita o nome                                                  
      398 +  dele.                                                       
      399 +**Origem:** política do RH v3, item 9, e v4, item A (AMB-019, 
          +AMB-031)                                                      
      400  **Aceite:** `d-005` (`coworking`, 89,00) → RECUSADO/`CATEGORIA
           _NAO_REEMBOLSAVEL`.
      401 +Hospedagem de colaborador do CC-ENG-PLATAFORMA → RECUSADO/`CAT
          +EGORIA_NAO_REEMBOLSAVEL`,                                     
      402 +descrição cita "CC-ENG-PLATAFORMA". `representacao` na tabela 
          +padrão →                                                      
      403 +RECUSADO/`CATEGORIA_NAO_REEMBOLSAVEL`.                        
      404  
      405  ### RN-007 — Duplicatas
      406  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 4 lines, removed 2 lines
      406  
      407  **Regra:** Duas despesas são duplicatas quando têm a mesma `da
           ta`, a mesma
      408  categoria normalizada, o mesmo `fornecedor` (comparado sem dif
           erenciar
      409 -maiúsculas de minúsculas e sem espaços nas bordas) e o mesmo  
      410 -`valor_solicitado`, com `id` diferente. `fornecedor` é tratado
          - como texto                                                   
      409 +maiúsculas de minúsculas e sem espaços nas bordas), a mesma `m
          +oeda` e o                                                     
      410 +mesmo `valor_original`, com `id` diferente. Em BRL, `valor_ori
          +ginal` é o                                                    
      411 +próprio `valor_solicitado`. Despesas em moedas diferentes nunc
          +a são                                                         
      412 +duplicatas (AMB-038). `fornecedor` é tratado como texto       
      413  (RN-003). Ausente, nulo ou só com espaços vale como fornecedor
            **vazio**, que é comparado como qualquer outro valor:
      414  vazio é igual a vazio, e um fornecedor preenchido nunca é igua
           l a vazio.
      415  `descricao` e `tem_nota_fiscal` não entram no critério.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 1 line, removed 1 line
      416  Num grupo de duplicatas, **só a primeira ocorrência na ordem d
           a entrada**
      417  segue para as próximas regras. As demais são **RECUSADAS** com
            `DUPLICATA`. A
      418  descrição do motivo cita o `id` da ocorrência aceita e não pre
           ssupõe má-fé.
      419 -**Origem:** política do RH, item 8 (AMB-011)                  
      419 +**Origem:** política do RH, item 8 (AMB-011, AMB-038)         
      420  **Aceite:** `d-006` e `d-007` (2026-07-09, alimentação, Bistro
            Central, 54,90):
      421  `d-006` segue normalmente (APROVADO 54,90) e `d-007` → RECUSAD
           O/`DUPLICATA`.
      422  Duas despesas de alimentação de 40,00 na mesma data, as duas s
           em fornecedor →

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 4 lines, removed 1 line
      422  Duas despesas de alimentação de 40,00 na mesma data, as duas s
           em fornecedor →
      423  a 2ª RECUSADO/`DUPLICATA`. Se só uma delas tiver fornecedor, a
           s duas seguem
      424  normalmente. `"fornecedor": 123` e `"fornecedor": "123"` são o
            mesmo
      425 -fornecedor, e `"fornecedor": null` é igual a fornecedor ausent
          -e.                                                            
      425 +fornecedor, e `"fornecedor": null` é igual a fornecedor ausent
          +e. Duas                                                       
      426 +despesas iguais de 20,00, uma em EUR e outra em USD → as duas 
          +seguem                                                        
      427 +normalmente. Uma sem `moeda` e outra com `"moeda": "BRL"`, o r
          +esto igual → a                                                
      428 +2ª RECUSADO/`DUPLICATA`.                                      
      429  
      430  ### RN-008 — Nota fiscal obrigatória
      431  

● Update(specs\001-motor-reembolso\spec.md)  ⎿  Added 8 lines, removed 5 lines
      429  
      430  ### RN-008 — Nota fiscal obrigatória
      431  
      432 -**Regra:** Uma despesa com `valor_solicitado` **estritamente m
          -aior** que                                                    
      433 -R$ 100,00 e sem nota fiscal é **RECUSADA integralmente** com  
      434 -`NOTA_FISCAL_AUSENTE`. O limiar vale por despesa individual, u
          -sa o valor                                                    
      435 -solicitado (não o reembolsável) e não é ampliado pela viagem. 
      436 -**Origem:** política do RH, item 5 (AMB-004, AMB-005, AMB-006,
          - AMB-017)                                                     
      432 +**Regra:** Uma despesa com `valor_solicitado` **estritamente m
          +aior** que o                                                  
      433 +limiar de nota fiscal e sem nota fiscal é **RECUSADA integralm
          +ente** com                                                    
      434 +`NOTA_FISCAL_AUSENTE`. O limiar é o `nota_fiscal_obrigatoria_a
          +cima_de` da                                                   
      435 +tabela de limites (R$ 100,00 na v4), é o mesmo para todos os c
          +entros de custo                                               
      436 +e está em reais. O limiar vale por despesa individual, usa o v
          +alor solicitado                                               
      437 +**em reais, depois da conversão** (não o reembolsável nem o va
          +lor na moeda                                                  
      438 +original) e não é ampliado pela viagem.                       
      439 +**Origem:** política do RH v3, item 5, e v4, item B (AMB-004, 
          +AMB-005, AMB-006, AMB-017, AMB-038)                           
      440  **Aceite:** `d-003` (100,00, sem NF) **não** é recusado por no
           ta fiscal.
      441  `d-004` (100,01, sem NF) → RECUSADO/`NOTA_FISCAL_AUSENTE`.
      442  `d-013` (690,00, sem NF) → RECUSADO/`NOTA_FISCAL_AUSENTE`.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines, removed 1 line
      439  **Origem:** política do RH v3, item 5, e v4, item B (AMB-004, 
           AMB-005, AMB-006, AMB-017, AMB-038)
      440  **Aceite:** `d-003` (100,00, sem NF) **não** é recusado por no
           ta fiscal.
      441  `d-004` (100,01, sem NF) → RECUSADO/`NOTA_FISCAL_AUSENTE`.
      442 -`d-013` (690,00, sem NF) → RECUSADO/`NOTA_FISCAL_AUSENTE`.    
      442 +`e-005` (40,00 USD × 5,50 = R$ 220,00, sem NF) → RECUSADO/`NOT
          +A_FISCAL_AUSENTE`.                                            
      443 +`e-003` (14,50 EUR × 5,88 = R$ 85,26, sem NF) **não** é recusa
          +do por nota fiscal.                                           
      444  
      445  ### RN-009 — Limites diários por categoria
      446  

● Agora RN-009, RN-010 e RN-011:

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 17 lines, removed 6 lines
      445  ### RN-009 — Limites diários por categoria
      446  
      447  **Regra:** Para cada combinação (data, categoria), a soma dos 
           valores
      448 -reembolsáveis não passa de:                                   
      448 +reembolsáveis (em reais) não passa do limite da categoria na t
          +abela aplicável                                               
      449 +ao colaborador (RN-016). Categorias de periodicidade `dia` têm
          + o limite por                                                 
      450 +data de calendário. A hospedagem (periodicidade `diaria`) tem 
          +o limite por                                                  
      451 +noite, e as diárias são distribuídas por noite (RN-012). Nos d
          +ias de viagem,                                                
      452 +o limite das categorias `dia` é ampliado (RN-011). A hospedage
          +m nunca é                                                     
      453 +ampliada (AMB-020).                                           
      454  
      450 -| Categoria | Limite padrão | Limite em viagem (RN-011) |     
      451 -|---|---|---|                                                 
      452 -| `alimentacao` | R$ 60,00 por dia | R$ 90,00 por dia |       
      453 -| `transporte_urbano` | R$ 80,00 por dia | R$ 120,00 por dia |
      454 -| `hospedagem` | R$ 250,00 por noite (as diárias são distribuí
          -das por noite, ver RN-012) | R$ 250,00 por noite, sem ampliaçã
          -o (AMB-020) |                                                 
      455 +Valores da v4, só para referência (valem os do arquivo vigente
          +):                                                            
      456  
      457 +| Categoria | Padrão | CC-ENG-PLATAFORMA | CC-COMERCIAL | CC-A
          +DM |                                                          
      458 +|---|---|---|---|---|                                         
      459 +| `alimentacao` (dia) | 60,00 | 75,00 | 90,00 | 45,00 |       
      460 +| `transporte_urbano` (dia) | 80,00 | 80,00 | 150,00 | 60,00 |
      461 +| `hospedagem` (diária) | 250,00 | 0,00 (não reembolsável) | 4
          +00,00 | 250,00 (herdado do padrão) |                          
      462 +| `representacao` (dia) | — (não reembolsável) | — (não reembo
          +lsável) | 300,00 | — (não reembolsável) |                     
      463 +                                                              
      464 +Os casos de borda da seção 7 que não citam centro de custo usa
          +m a tabela                                                    
      465 +padrão, e os que não citam moeda usam BRL.                    
      466 +                                                              
      467  O limite é inclusivo: uma despesa que usa exatamente o saldo r
           estante é
      468  `APROVADO_INTEGRAL`. O "dia" é a data de calendário da despesa
           , sem distinção
      469  entre dia útil, fim de semana ou feriado. Só despesas que pass
           aram por todas as

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 5 lines, removed 3 lines
      468  `APROVADO_INTEGRAL`. O "dia" é a data de calendário da despesa
           , sem distinção
      469  entre dia útil, fim de semana ou feriado. Só despesas que pass
           aram por todas as
      470  regras anteriores (seção 8) consomem limite.
      471 -**Origem:** política do RH, itens 1, 2 e 3 (AMB-001, AMB-008, 
          -AMB-015, AMB-016)                                             
      472 -**Aceite:** uma despesa isolada de alimentação de 60,00 → APRO
          -VADO 60,00.                                                   
      473 -`d-012` (sábado, 47,20) → APROVADO 47,20.                     
      471 +**Origem:** política do RH v3, itens 1, 2 e 3, e v4, item A (A
          +MB-001, AMB-008, AMB-015, AMB-016, AMB-029, AMB-030)          
      472 +**Aceite:** uma despesa isolada de alimentação de 60,00, tabel
          +a padrão →                                                    
      473 +APROVADO 60,00. `d-012` (sábado, 47,20) → APROVADO 47,20. Alim
          +entação de                                                    
      474 +80,00 no CC-COMERCIAL → APROVADO 80,00 (limite 90,00). Aliment
          +ação de 50,00 no                                              
      475 +CC-ADM → PARCIAL 45,00.                                       
      476  
      477  ### RN-010 — Reembolso parcial e distribuição do limite no dia
      478  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 4 lines, removed 3 lines
      483  - recebe parte (> 0) → PARCIAL/`LIMITE_DIARIO_EXCEDIDO`, o exc
           edente é cortado;
      484  - saldo já zerado → RECUSADO/`LIMITE_DIARIO_ESGOTADO`.
      485  **Origem:** política do RH, item 4 (AMB-002, AMB-003)
      486 -**Aceite:** `d-001` (72,50) e `d-002` (38,00) em 2026-07-03: `
          -d-001` → PARCIAL                                              
      487 -60,00 e `d-002` → RECUSADO/`LIMITE_DIARIO_ESGOTADO` 0,00. `d-0
          -14` (61,00) →                                                 
      488 -PARCIAL 60,00.                                                
      486 +**Aceite:** na tabela padrão (60,00), alimentação de 72,50 e d
          +epois de 38,00                                                
      487 +na mesma data: a 1ª → PARCIAL 60,00 e a 2ª → RECUSADO/`LIMITE_
          +DIARIO_ESGOTADO`                                              
      488 +0,00. No CC-ENG-PLATAFORMA (75,00), `d-001` (72,50) e `d-002` 
          +(38,00) em                                                    
      489 +2026-07-03: `d-001` → APROVADO 72,50 e `d-002` → PARCIAL 2,50.
      490  
      491  ### RN-011 — Colaborador em viagem
      492  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 17 lines, removed 12 lines
      492  
      493  **Regra:** Uma data é **dia de viagem** quando é uma das noite
           s (D, D+1, …,
      494  D+N−1, ver RN-012) de ao menos uma despesa de hospedagem **ele
           gível**, ou
      495 -seja, que passou pelas etapas 2 a 7 da seção 8. O dia do check
          --out (D+N) não é                                              
      496 -dia de viagem. Nos dias de viagem, os limites de alimentação e
          - transporte                                                   
      497 -urbano são multiplicados por 1,5 (coluna "em viagem" da RN-009
          -). O limite de                                                
      498 -hospedagem **não** é ampliado e continua R$ 250,00 por noite (
          -AMB-020). Uma                                                 
      499 -hospedagem recusada (sem nota, duplicada, fora do período...) 
          -não torna a data                                              
      500 -dia de viagem.                                                
      501 -**Origem:** política do RH, item 6 (AMB-007)                  
      502 -**Aceite:** alimentação de 80,00 na mesma data de uma hospedag
          -em elegível →                                                 
      503 -APROVADO 80,00 (limite 90,00). Hospedagem de 1 diária em D e a
          -limentação de                                                 
      504 -80,00 em D+1 (check-out) → PARCIAL 60,00. Hospedagem de 2 diár
          -ias em D e                                                    
      505 -alimentação de 80,00 em D+1 → APROVADO 80,00. `d-013` (3 noite
          -s) é recusada por                                             
      506 -nota fiscal, então 2026-07-22 a 2026-07-24 **não** são dias de
          - viagem.                                                      
      495 +seja, que passou pelas etapas 2 a 8 da seção 8. O dia do check
          +-out (D+N) não é                                              
      496 +dia de viagem. Nos dias de viagem, o limite de **toda categori
          +a de                                                          
      497 +periodicidade `dia`** (alimentação, transporte urbano, represe
          +ntação) é                                                     
      498 +ampliado pelo `acrescimo_em_viagem_percentual` da tabela de li
          +mites (50% na                                                 
      499 +v4, ou seja, × 1,5), com o resultado exato em centavos (AMB-03
          +3). O limite de                                               
      500 +hospedagem **não** é ampliado (AMB-020). Uma hospedagem recusa
          +da (sem nota,                                                 
      501 +duplicada, fora do período, não reembolsável no centro de cust
          +o, sem                                                        
      502 +cotação...) não torna a data dia de viagem. Uma hospedagem PEN
          +DENTE (RN-018)                                                
      503 +é elegível e torna a data dia de viagem.                      
      504 +**Origem:** política do RH v3, item 6 (AMB-007, AMB-031, AMB-0
          +33)                                                           
      505 +**Aceite:** tabela padrão: alimentação de 80,00 na mesma data 
          +de uma                                                        
      506 +hospedagem elegível → APROVADO 80,00 (limite 90,00). Hospedage
          +m de 1 diária em                                              
      507 +D e alimentação de 80,00 em D+1 (check-out) → PARCIAL 60,00. H
          +ospedagem de 2                                                
      508 +diárias em D e alimentação de 80,00 em D+1 → APROVADO 80,00. `
          +d-013` (3 noites)                                             
      509 +é recusada, então 2026-07-22 a 2026-07-24 **não** são dias de 
          +viagem. No                                                    
      510 +CC-COMERCIAL, `e-008` (alimentação 95,00 em 23/07, noite de `e
          +-007`, que está                                               
      511 +PENDENTE) → APROVADO 95,00 (limite 135,00).                   
      512  
      513  ### RN-012 — Hospedagem com mais de uma diária
      514  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 2 lines, removed 1 line
      496  dia de viagem. Nos dias de viagem, o limite de **toda categori
           a de
      497  periodicidade `dia`** (alimentação, transporte urbano, represe
           ntação) é
      498  ampliado pelo `acrescimo_em_viagem_percentual` da tabela de li
           mites (50% na
      499 -v4, ou seja, × 1,5), com o resultado exato em centavos (AMB-03
          -3). O limite de                                               
      499 +v4, ou seja, × 1,5). Se o limite ampliado não der centavos exa
          +tos, ele é                                                    
      500 +arredondado pela regra da RN-001 (AMB-033). O limite de       
      501  hospedagem **não** é ampliado (AMB-020). Uma hospedagem recusa
           da (sem nota,
      502  duplicada, fora do período, não reembolsável no centro de cust
           o, sem
      503  cotação...) não torna a data dia de viagem. Uma hospedagem PEN
           DENTE (RN-018)

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 3 lines, removed 2 lines
      539  **Aceite:** "Hotel Rio - 2 diarias" → N = 2. "Airbnb 3 noites"
            → N = 3.
      540  "Hotel 5 estrelas" → N = 1 (5 não vem seguido de diária/noite)
           .
      541  "Hotel 5 estrelas - 2 diarias" → N = 2. "Hotel 1.5 diarias" → 
           N = 1
      542 -(e não 5). "Pousada" → N = 1. `descricao` ausente, nula ou `2`
          - (número) → N = 1. `d-010` (480,00, N = 2) → 240,00 na noite d
          -e 14/07 e                                                     
      543 -240,00 na de 15/07 → APROVADO 480,00. Exemplo de sobreposição,
          - com                                                          
      542 +(e não 5). "Pousada" → N = 1. `descricao` ausente, nula ou `2`
          + (número) → N = 1.                                            
      543 +Na tabela padrão (250,00 por noite): "Hotel Rio - 2 diarias", 
          +480,00, em 14/07                                              
      544 +→ 240,00 na noite de 14/07 e 240,00 na de 15/07 → APROVADO 480
          +,00. Exemplo de sobreposição, com                             
      545  `h1` = 14/07 "2 diarias" 480,00 e depois `h2` = 15/07 "1 diari
           a" 200,00:
      546  `h1` → 240 + 240 = APROVADO 480,00; `h2` → só restam 10,00 na 
           noite de 15/07
      547  → PARCIAL 10,00.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 3 lines, removed 1 line
      544  → 240,00 na noite de 14/07 e 240,00 na de 15/07 → APROVADO 480
           ,00. Exemplo de sobreposição, com
      545  `h1` = 14/07 "2 diarias" 480,00 e depois `h2` = 15/07 "1 diari
           a" 200,00:
      546  `h1` → 240 + 240 = APROVADO 480,00; `h2` → só restam 10,00 na 
           noite de 15/07
      547 -→ PARCIAL 10,00.                                              
      547 +→ PARCIAL 10,00. No CC-COMERCIAL (400,00 por noite), `e-007` (
          +"3 noites",                                                   
      548 +1.200,00) → 400,00 em cada noite, reembolsável 1.200,00 (sai P
          +ENDENTE pela                                                  
      549 +RN-018).                                                      
      550  
      551  ### RN-013 — Justificativa obrigatória
      552  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 9 lines, removed 6 lines
      559  ### RN-014 — Totais do resumo
      560  
      561  **Regra:** `resumo` é calculado conforme a seção 4, e
      562 -`total_nao_reembolsado = total_solicitado − total_reembolsavel
          -`, exato em                                                   
      563 -centavos.                                                     
      564 -**Origem:** objetivo do sistema                               
      565 -**Aceite:** a soma de `valor_reembolsavel` dos itens é igual a
      566 -`resumo.total_reembolsavel`, e as contagens por status somam  
      567 -`quantidade_itens`.                                           
      562 +`total_nao_reembolsado = total_solicitado − total_reembolsavel
          + − total_pendente`,                                           
      563 +exato em centavos. Todos os totais são em reais. Um item PENDE
          +NTE entra em                                                  
      564 +`total_solicitado` e em `total_pendente`, e não entra em `tota
          +l_reembolsavel`                                               
      565 +(AMB-041).                                                    
      566 +**Origem:** objetivo do sistema (AMB-041)                     
      567 +**Aceite:** a soma de `valor_reembolsavel` dos itens não PENDE
          +NTE é igual a                                                 
      568 +`resumo.total_reembolsavel`, a dos itens PENDENTE é igual a   
      569 +`resumo.total_pendente`, e as contagens por status (aprovados,
          + parciais,                                                    
      570 +recusados, pendentes) somam `quantidade_itens`.               
      571  
      572  ### RN-015 — Arquivo de entrada inválido
      573  

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 8 lines, removed 1 line
      581  `periodo.fim` que vêm vazios (texto vazio ou só com espaços), 
           nulos ou com
      582  tipo diferente de texto contam como **ausentes**. Um `colabora
           dor` ou
      583  `periodo` que não é objeto tem todos os seus campos ausentes (
           AMB-027).
      584 -**Origem:** interface fixa do desafio (AMB-027)               
      584 +                                                              
      585 +Também termina com erro, sem saída, a execução em que:        
      586 +- `colaborador.centro_custo` existe com tipo diferente de text
          +o (número,                                                    
      587 +  booleano, lista, objeto) (AMB-032);                         
      588 +- a tabela de limites ou o arquivo de câmbio não existe, não é
          + JSON válido ou                                               
      589 +  não segue o formato da seção 4 (RN-016, RN-017). A mensagem 
          +cita qual dos                                                 
      590 +  dois arquivos e o campo com problema.                       
      591 +**Origem:** interface fixa do desafio (AMB-027, AMB-028, AMB-0
          +32)                                                           
      592  **Aceite:** executar com um arquivo sem `periodo` resulta em e
           rro, mensagem que
      593  cita `periodo` e nenhum arquivo de saída. `"colaborador": {"id
           ": ""}` ou
      594  `{"id": 123}` → erro que cita `colaborador.id`. `"inicio": 202
           60701` → erro

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 104 lines
      593  cita `periodo` e nenhum arquivo de saída. `"colaborador": {"id
           ": ""}` ou
      594  `{"id": 123}` → erro que cita `colaborador.id`. `"inicio": 202
           60701` → erro
      595  que cita `periodo.inicio`. Um arquivo cujo conteúdo é uma list
           a (`[]`) → erro.
      596 +`"centro_custo": 42` → erro que cita `colaborador.centro_custo
          +`. Tabela de                                                  
      597 +limites com `"limite": -10` → erro que cita a tabela de limite
          +s e o campo.                                                  
      598 +Arquivo de câmbio ausente → erro que cita o arquivo de câmbio.
      599  
      600 +### RN-016 — Política por centro de custo                     
      601 +                                                              
      602 +**Regra:** Os limites vêm da tabela de limites mantida pelo fi
          +nanceiro (seção                                               
      603 +4), lida a cada execução. Nenhum limite, limiar ou percentual 
          +da política é                                                 
      604 +fixo no sistema. A **tabela aplicável** ao colaborador é monta
          +da assim:                                                     
      605 +1. Se `colaborador.centro_custo` está ausente, nulo ou vazio, 
          +ou se não há                                                  
      606 +   entrada para ele em `centros_custo`, vale a tabela `padrao`
          + inteira. O                                                   
      607 +   centro de custo é comparado com a normalização da RN-002 (A
          +MB-029, AMB-032).                                             
      608 +2. Se há entrada, cada categoria dela usa o limite do centro d
          +e custo. Cada                                                 
      609 +   categoria que não aparece no centro de custo usa o limite d
          +o `padrao`                                                    
      610 +   (AMB-030).                                                 
      611 +3. Uma categoria que não aparece em nenhum dos dois não é reem
          +bolsável                                                      
      612 +   (RN-006).                                                  
      613 +                                                              
      614 +Uma categoria com limite 0 no centro de custo **não** herda do
          + padrão: o 0 é a                                              
      615 +forma como o financeiro exclui a categoria (RN-006, AMB-031). 
          +O                                                             
      616 +`nota_fiscal_obrigatoria_acima_de` e o `acrescimo_em_viagem_pe
          +rcentual` são                                                 
      617 +únicos para todos os centros de custo. A `vigencia` não restri
          +nge nenhuma                                                   
      618 +despesa (AMB-034). Na saída, `politica.tabela` diz qual tabela
          + foi aplicada.                                                
      619 +                                                              
      620 +A tabela é **inválida** (RN-015) quando: não é um objeto; `moe
          +da_base` não é                                                
      621 +`BRL`; `padrao` ou `centros_custo` não são objetos; um limite 
          +não é número, é                                               
      622 +negativo ou tem mais de 2 casas decimais; a periodicidade não 
          +é `dia` ou                                                    
      623 +`diaria`, ou `diaria` aparece numa categoria que não é `hosped
          +agem`, ou                                                     
      624 +`hospedagem` não é `diaria`; `nota_fiscal_obrigatoria_acima_de
          +` ou                                                          
      625 +`acrescimo_em_viagem_percentual` estão ausentes, não são númer
          +os ou são                                                     
      626 +negativos; dois centros de custo (ou duas categorias da mesma 
          +tabela) ficam                                                 
      627 +iguais depois da normalização.                                
      628 +**Origem:** política do RH v4, item A (AMB-028, AMB-029, AMB-0
          +30, AMB-031, AMB-032, AMB-034)                                
      629 +**Aceite:** colaborador do `CC-SUPORTE-N2` (sem entrada) → `po
          +litica.tabela`                                                
      630 +`"padrao"`, alimentação limitada a 60,00. `" cc-comercial "` →
          + tabela do                                                    
      631 +CC-COMERCIAL. Colaborador sem `centro_custo` → padrão. Hospeda
          +gem de 300,00                                                 
      632 +no CC-ADM (sem hospedagem na tabela) → limite 250,00 do padrão
          + → PARCIAL                                                    
      633 +250,00. `representacao` no CC-SUPORTE-N2 → RECUSADO/`CATEGORIA
          +_NAO_REEMBOLSAVEL`.                                           
      634 +Trocar o limite de alimentação do padrão no arquivo para 70,00
          + muda o                                                       
      635 +resultado de uma alimentação de 65,00 de PARCIAL para APROVADO
          +, sem mudar o                                                 
      636 +sistema.                                                      
      637 +                                                              
      638 +### RN-017 — Moeda e conversão para reais                     
      639 +                                                              
      640 +**Regra:** Toda despesa tem uma moeda (RN-003: ausente vale `B
          +RL`). Em `BRL`,                                               
      641 +`valor_solicitado` = `valor_original`, `taxa_cambio` = 1 e `da
          +ta_cotacao` é                                                 
      642 +nulo. Em outra moeda, o valor é convertido para reais pela tax
          +a do arquivo de                                               
      643 +câmbio:                                                       
      644 +1. A **data da cotação** é a data da despesa, se o arquivo tem
          + cotação daquela                                              
      645 +   moeda nessa data. Senão, é a **data mais recente anterior**
          + à despesa que                                                
      646 +   tem cotação daquela moeda (a cotação vale até a próxima pub
          +licada). Não há                                               
      647 +   limite de dias para trás (AMB-035).                        
      648 +2. `valor_solicitado` = `valor_original` × taxa, arredondado p
          +ara centavos                                                  
      649 +   pela regra da RN-001 (AMB-037).                            
      650 +3. Se a moeda não tem nenhuma cotação até a data da despesa (m
          +oeda que não                                                  
      651 +   está no arquivo, ou despesa anterior à primeira cotação del
          +a), a despesa é                                               
      652 +   **RECUSADA** com `CAMBIO_INDISPONIVEL`, e `valor_solicitado
          +`,                                                            
      653 +   `taxa_cambio` e `data_cotacao` saem nulos. Só aquele item é
          + afetado                                                      
      654 +   (AMB-036).                                                 
      655 +                                                              
      656 +A conversão é calculada antes das regras de elegibilidade, par
          +a que todas usem                                              
      657 +o valor em reais, mas a recusa por falta de cotação só acontec
          +e na etapa 6 da                                               
      658 +seção 8. Uma despesa recusada antes (fora do período, categori
          +a não                                                         
      659 +reembolsável...) mantém o motivo dessa etapa (AMB-039). Todos 
          +os limites e o                                                
      660 +limiar de nota fiscal são comparados com o valor em reais.    
      661 +                                                              
      662 +O arquivo de câmbio é **inválido** (RN-015) quando: não é um o
          +bjeto;                                                        
      663 +`moeda_base` não é `BRL`; `taxas` não é objeto; uma chave de `
          +taxas` não é                                                  
      664 +uma data válida; uma moeda não tem 3 letras; uma taxa não é nú
          +mero ou não é                                                 
      665 +maior que zero.                                               
      666 +**Origem:** política do RH v4, item B (AMB-035, AMB-036, AMB-0
          +37, AMB-038, AMB-039)                                         
      667 +**Aceite:** `e-002` (22,00 EUR em 14/07) → taxa 5,93 de 14/07 
          +→ R$ 130,46.                                                  
      668 +`e-004` (30,00 EUR no sábado 18/07) → taxa 5,96 de sexta 17/07
          + →                                                            
      669 +`data_cotacao` "2026-07-17", R$ 178,80. `e-006` (55,00 GBP) → 
      670 +RECUSADO/`CAMBIO_INDISPONIVEL`, `valor_solicitado` nulo. EUR e
          +m 2026-07-10                                                  
      671 +(antes da primeira cotação, 13/07) → RECUSADO/`CAMBIO_INDISPON
          +IVEL`. EUR em                                                 
      672 +2026-06-30 num período de julho → RECUSADO/`FORA_DO_PERIODO`, 
          +e não                                                         
      673 +`CAMBIO_INDISPONIVEL`. `e-010` (sem `moeda`) → BRL, `taxa_camb
          +io` 1.                                                        
      674 +                                                              
      675 +### RN-018 — Aprovação manual de itens acima de R$ 500        
      676 +                                                              
      677 +**Regra:** Depois do limite diário (etapa 10 da seção 8), um i
          +tem com                                                       
      678 +`valor_reembolsavel` **estritamente maior** que R$ 500,00 (em 
          +reais) não é                                                  
      679 +aprovado automaticamente: sai com status **PENDENTE** e código
      680 +`REQUER_APROVACAO`, aguardando aprovação do gestor. O `valor_r
          +eembolsavel`                                                  
      681 +mostra o valor calculado, que é o que será pago se o gestor ap
          +rovar. Um item                                                
      682 +PENDENTE:                                                     
      683 +- consome o limite do dia normalmente (quem vem depois disputa
          + o saldo que                                                  
      684 +  sobrou);                                                    
      685 +- se for hospedagem, torna suas noites dias de viagem (RN-011)
          +;                                                             
      686 +- entra em `total_pendente` e não em `total_reembolsavel` (RN-
          +014);                                                         
      687 +- tem na descrição o valor calculado, o limiar de R$ 500,00 e,
          + se houve corte                                               
      688 +  de limite, o valor cortado.                                 
      689 +                                                              
      690 +O limiar de R$ 500,00 é fixo nesta spec: o comunicado do RH o 
          +define, e a                                                   
      691 +tabela de limites do financeiro não o traz (AMB-040). O limiar
          + usa o                                                        
      692 +reembolsável, não o solicitado: uma despesa de 1.200,00 cortad
          +a para 400,00                                                 
      693 +pelo limite não fica pendente.                                
      694 +**Origem:** política do RH v4, item C (AMB-040, AMB-041)      
      695 +**Aceite:** `e-007` (hospedagem 1.200,00, 3 × 400,00 no CC-COM
          +ERCIAL) →                                                     
      696 +PENDENTE/`REQUER_APROVACAO`, `valor_reembolsavel` 1.200,00, fo
          +ra do                                                         
      697 +`total_reembolsavel`. Reembolsável exatamente 500,00 → não fic
          +a pendente.                                                   
      698 +Reembolsável 500,01 → PENDENTE. Hospedagem de 1.200,00 com 1 d
          +iária na tabela                                               
      699 +padrão → PARCIAL 250,00, não PENDENTE.                        
      700 +                                                              
      701  ---
      702  
      703  ## 6. Ambiguidades identificadas e decisões

● Regras RN-016 a RN-018 adicionadas. Agora a seção 6 (ambiguidades):

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 3 lines, removed 1 line
      958  AMB-007, toda noite de hospedagem elegível já é dia de viagem.
            Se a hospedagem
      959  fosse ampliada, o limite de R$ 250 do item 3 nunca seria aplic
           ado.
      960  **Decisão:** não. A ampliação de 50% vale só para alimentação 
           e transporte
      961 -urbano. A hospedagem fica sempre em R$ 250,00 por noite.      
      961 +urbano. A hospedagem fica sempre em R$ 250,00 por noite. *(Atu
          +alizado na                                                    
      962 +v2.0: a ampliação vale para toda categoria de periodicidade `d
          +ia`, e a                                                      
      963 +hospedagem fica sempre no limite por noite da tabela aplicável
          +, ver AMB-033.)*                                              
      964  **Justificativa:** como a viagem é inferida pela própria hospe
           dagem, ampliar a
      965  hospedagem anularia o item 3 da política. Entre as duas leitur
           as, fica a que
      966  mantém todos os itens da política com efeito.

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 219 lines
      1086  do arquivo inteiro, e não de um item.
      1087  **Regra afetada:** RN-015
      1088  
      1089 +### AMB-028 — De onde vêm a tabela de limites e as taxas de c
           +âmbio                                                        
      1090 +                                                             
      1091 +**Texto original do RH (v4):** "O motor precisa ler a polític
           +a de fora, não de                                            
      1092 +dentro do código." / "As taxas estão em `cambio.json`."      
      1093 +**O que não está claro:** a interface `calcular --input --out
           +put` é fixa pelo                                             
      1094 +desafio. Os dois arquivos podem (a) ser indicados por novas o
           +pções na linha de                                            
      1095 +comando; (b) vir dentro do arquivo de entrada; (c) ficar num 
           +local fixo,                                                  
      1096 +conhecido pelo sistema.                                      
      1097 +**Decisão:** (c). Os dois arquivos ficam num local fixo e são
           + lidos a cada                                                
      1098 +execução. A interface não muda. A documentação de uso explica
           + que, para                                                   
      1099 +testar com outra tabela ou outras taxas, é preciso trocar ess
           +es arquivos.                                                 
      1100 +Arquivo ausente ou inválido interrompe a execução (RN-015).  
      1101 +**Justificativa:** decisão do usuário. A interface é fixa, e 
           +num sistema real                                             
      1102 +esses dados viriam de um serviço do financeiro, não de quem g
           +era o arquivo de                                             
      1103 +despesas. Deixar a tabela fora do arquivo de entrada impede q
           +ue quem pede o                                               
      1104 +reembolso escolha os próprios limites.                       
      1105 +**Regra afetada:** RN-015, RN-016, RN-017                    
      1106 +                                                             
      1107 +### AMB-029 — O que é "a política padrão"                    
      1108 +                                                             
      1109 +**Texto original do RH (v4):** "Alguns centros de custo não t
           +êm entrada na                                                
      1110 +tabela. Nesse caso, aplica-se a política padrão."            
      1111 +**O que não está claro:** "política padrão" pode ser (a) o bl
           +oco `padrao` da                                              
      1112 +tabela vigente; (b) as constantes da v3 (60/80/250). Também n
           +ão se diz o que                                              
      1113 +acontece com o colaborador **sem** centro de custo.          
      1114 +**Decisão:** (a) o bloco `padrao` da tabela vigente. Colabora
           +dor sem centro de                                            
      1115 +custo (ausente, nulo ou vazio) também usa o padrão.          
      1116 +**Justificativa:** a v4 manda ler a política de fora do códig
           +o. Usar as                                                   
      1117 +constantes da v3 manteria uma política escondida no sistema, 
           +que não mudaria                                              
      1118 +quando o financeiro alterasse o padrão. Hoje os valores coinc
           +idem, mas só por                                             
      1119 +acaso.                                                       
      1120 +**Regra afetada:** RN-016                                    
      1121 +                                                             
      1122 +### AMB-030 — Centro de custo que não lista todas as categori
           +as                                                           
      1123 +                                                             
      1124 +**Texto original do RH (v4):** "Cada centro de custo tem a su
           +a tabela."                                                   
      1125 +**O que não está claro:** o `CC-ADM` está na tabela, mas não 
           +tem                                                          
      1126 +`hospedagem`. (a) A tabela do centro de custo substitui a pad
           +rão inteira, e a                                             
      1127 +hospedagem não é reembolsável; (b) a categoria que falta herd
           +a do padrão.                                                 
      1128 +**Decisão:** (b). A categoria que falta usa o limite do padrã
           +o. Se ela também                                             
      1129 +não está no padrão, não é reembolsável.                      
      1130 +**Justificativa:** decisão do usuário. O financeiro exclui ca
           +tegorias de forma                                            
      1131 +explícita, com limite 0 (o `CC-ENG-PLATAFORMA` faz isso com h
           +ospedagem).                                                  
      1132 +Então, uma categoria que não aparece é uma que não foi altera
           +da para aquele                                               
      1133 +centro de custo.                                             
      1134 +**Regra afetada:** RN-006, RN-009, RN-016                    
      1135 +                                                             
      1136 +### AMB-031 — Categoria com limite 0 ("não reembolsa de forma
           + alguma")                                                    
      1137 +                                                             
      1138 +**Texto original do RH (v4):** "`CC-ENG-PLATAFORMA` não reemb
           +olsa                                                         
      1139 +`hospedagem` de forma alguma."                               
      1140 +**O que não está claro:** a tabela traz `limite: 0`. A despes
           +a pode (a) passar                                            
      1141 +pelas regras e ser recusada no limite (`LIMITE_DIARIO_ESGOTAD
           +O`), gerando dia                                             
      1142 +de viagem; (b) ser recusada como categoria não reembolsável, 
           +com o código que                                             
      1143 +já existe; (c) ganhar um código novo.                        
      1144 +**Decisão:** (b). RECUSADO/`CATEGORIA_NAO_REEMBOLSAVEL` na et
           +apa de categoria,                                            
      1145 +com uma descrição que cita o centro de custo. Por ser recusad
           +a nessa etapa,                                               
      1146 +ela não gera dia de viagem e vem antes da checagem de nota fi
           +scal. Limite 0                                               
      1147 +não herda do padrão.                                         
      1148 +**Justificativa:** decisão do usuário. "De forma alguma" é ex
           +clusão da                                                    
      1149 +categoria, e não um saldo que acabou: `LIMITE_DIARIO_ESGOTADO
           +` daria a                                                    
      1150 +entender que houve saldo. Um código novo acrescentaria pouco,
           + porque a                                                    
      1151 +descrição já diferencia os dois casos. Uma hospedagem que a e
           +mpresa não paga                                              
      1152 +não deve ampliar outros limites, assim como uma hospedagem re
           +cusada (AMB-007).                                            
      1153 +**Regra afetada:** RN-006, RN-011, RN-016                    
      1154 +                                                             
      1155 +### AMB-032 — Grafia e tipo do centro de custo               
      1156 +                                                             
      1157 +**Texto original do RH (v4):** a política não fala do assunto
           +.                                                            
      1158 +**O que não está claro:** `"cc-comercial"` ou `" CC-COMERCIAL
           + "` casam com                                                
      1159 +`CC-COMERCIAL`? E um `centro_custo` numérico?                
      1160 +**Decisão:** o centro de custo é comparado com a normalização
           + da RN-002.                                                  
      1161 +Ausente, nulo ou vazio → padrão. Tipo diferente de texto → o 
           +arquivo é                                                    
      1162 +recusado (RN-015).                                           
      1163 +**Justificativa:** a mesma da AMB-014: diferença de grafia é 
           +digitação. Já um                                             
      1164 +tipo errado não tem leitura segura, e o centro de custo decid
           +e todos os                                                   
      1165 +limites da execução. Cair no padrão em silêncio poderia pagar
           + mais ou menos                                               
      1166 +do que o devido em todos os itens, então o erro é do arquivo 
           +inteiro, como na                                             
      1167 +AMB-027.                                                     
      1168 +**Regra afetada:** RN-015, RN-016                            
      1169 +                                                             
      1170 +### AMB-033 — Ampliação de viagem nas categorias novas       
      1171 +                                                             
      1172 +**Texto original do RH:** v3: "Colaborador em viagem tem limi
           +tes ampliados em                                             
      1173 +50%." v4: a tabela traz `acrescimo_em_viagem_percentual: 50` 
           +e a categoria                                                
      1174 +nova `representacao`.                                        
      1175 +**O que não está claro:** a ampliação vale para `representaca
           +o`? E o                                                      
      1176 +percentual continua fixo em 50%?                             
      1177 +**Decisão:** o percentual vem da tabela. Ele vale para **toda
           + categoria de                                                
      1178 +periodicidade `dia`** (alimentação, transporte urbano, repres
           +entação), e                                                  
      1179 +nunca para a hospedagem (`diaria`). Um limite ampliado que nã
           +o dá centavos                                                
      1180 +exatos é arredondado pela RN-001.                            
      1181 +**Justificativa:** a política fala em "limites" sem restringi
           +r categoria. A                                               
      1182 +única exceção (AMB-020) existe porque a viagem é inferida pel
           +a própria                                                    
      1183 +hospedagem. Amarrar a regra à periodicidade, e não a uma list
           +a de nomes, faz                                              
      1184 +uma categoria nova seguir a regra sem mudar a spec.          
      1185 +**Regra afetada:** RN-009, RN-011                            
      1186 +                                                             
      1187 +### AMB-034 — Vigência e retroatividade                      
      1188 +                                                             
      1189 +**Texto original do RH (v4):** "Vigência imediata, retroativa
           + à competência                                               
      1190 +atual." A tabela traz `vigencia: 2026-07-01`.                
      1191 +**O que não está claro:** despesas com data anterior à vigênc
           +ia seguem a v3?                                              
      1192 +A vigência muda o que é elegível?                            
      1193 +**Decisão:** a tabela vigente vale para toda a execução, qual
           +quer que seja a                                              
      1194 +data da despesa. A `vigencia` só é lida. Quem decide a elegib
           +ilidade pela data                                            
      1195 +continua sendo o período (RN-005).                           
      1196 +**Justificativa:** a v4 é retroativa à competência atual, e d
           +espesas fora do                                              
      1197 +período já são recusadas pela RN-005. Manter a v3 ao lado da 
           +v4 exigiria                                                  
      1198 +guardar versões antigas da política, o que está fora de escop
           +o (seção 3).                                                 
      1199 +**Regra afetada:** RN-005, RN-016                            
      1200 +                                                             
      1201 +### AMB-035 — "A taxa da data da despesa" num dia sem cotação
      1202 +                                                             
      1203 +**Texto original do RH (v4):** "A conversão usa a taxa da dat
           +a da despesa, não                                            
      1204 +a taxa de hoje." O arquivo de câmbio avisa: "Cotações publica
           +das apenas em                                                
      1205 +dias úteis bancários."                                       
      1206 +**O que não está claro:** `e-004` é de um sábado (18/07), sem
           + cotação. (a)                                                
      1207 +Usar a última cotação anterior; (b) usar a próxima; (c) recus
           +ar a despesa.                                                
      1208 +**Decisão:** (a). Vale a cotação mais recente publicada até a
           + data da                                                     
      1209 +despesa, inclusive. Não há limite de dias para trás.         
      1210 +**Justificativa:** decisão do usuário. É a prática da PTAX: a
           + cotação vale até                                            
      1211 +a próxima ser publicada. A próxima cotação (b) ainda não exis
           +tia no dia do                                                
      1212 +gasto, e recusar (c) puniria o colaborador por viajar num fim
           + de semana.                                                  
      1213 +**Regra afetada:** RN-017                                    
      1214 +                                                             
      1215 +### AMB-036 — Moeda ausente, inválida ou sem cotação         
      1216 +                                                             
      1217 +**Texto original do RH (v4):** "A entrada agora pode trazer u
           +m campo `moeda`                                              
      1218 +(ISO 4217). Quando ausente, assume-se `BRL`."                
      1219 +**O que não está claro:** (1) `null`, `""` ou `"eur"` valem o
           + quê? (2) E uma                                              
      1220 +moeda válida que não está no arquivo de câmbio (`e-006`, GBP)
           +, ou uma despesa                                             
      1221 +anterior à primeira cotação?                                 
      1222 +**Decisão:** (1) nulo ou vazio vale `BRL`, como ausente. Um t
           +exto é comparado                                             
      1223 +sem diferenciar maiúsculas e sem espaços nas bordas. Formato 
           +que não é de 3                                               
      1224 +letras ou tipo que não é texto → `DADO_INVALIDO`. (2) RECUSAD
           +O com o novo                                                 
      1225 +código `CAMBIO_INDISPONIVEL`, só aquele item, com `valor_soli
           +citado` nulo.                                                
      1226 +**Justificativa:** decisão do usuário para (2). Falta de cota
           +ção não é erro de                                            
      1227 +preenchimento do colaborador (então não é `DADO_INVALIDO`) e 
           +não deve impedir o                                           
      1228 +cálculo das outras despesas (então não é erro do arquivo). O 
           +valor em reais sai                                           
      1229 +nulo porque ele não existe, pelo mesmo motivo da AMB-023. O t
           +ratamento de (1)                                             
      1230 +segue o da AMB-022 e o da AMB-014.                           
      1231 +**Regra afetada:** RN-003, RN-017                            
      1232 +                                                             
      1233 +### AMB-037 — Arredondamento na conversão                    
      1234 +                                                             
      1235 +**Texto original do RH (v4):** "Uma despesa em EUR é converti
           +da antes de ser                                              
      1236 +comparada ao limite."                                        
      1237 +**O que não está claro:** arredonda o valor original e depois
           + o convertido, ou                                            
      1238 +só uma vez, no fim? Com que regra?                           
      1239 +**Decisão:** o valor original é arredondado para centavos (RN
           +-001). O produto                                             
      1240 +pela taxa é arredondado de novo, com a mesma regra (meio para
           + o par).                                                     
      1241 +**Justificativa:** o valor original arredondado é o que apare
           +ce na saída, e a                                             
      1242 +conta `valor_original × taxa` tem de fechar com o que o leito
           +r vê. Usar a                                                 
      1243 +mesma regra de desempate evita dois critérios de arredondamen
           +to no sistema.                                               
      1244 +**Regra afetada:** RN-001, RN-017                            
      1245 +                                                             
      1246 +### AMB-038 — Nota fiscal e duplicata em moeda estrangeira   
      1247 +                                                             
      1248 +**Texto original do RH (v4):** "Os limites da política são se
           +mpre em BRL."                                                
      1249 +**O que não está claro:** (1) o limiar de nota fiscal ("acima
           + de R$ 100")                                                 
      1250 +compara o valor em reais ou na moeda original? (2) Duas despe
           +sas duplicadas                                               
      1251 +são comparadas pelo valor original ou pelo convertido?       
      1252 +**Decisão:** (1) em reais, depois da conversão. (2) pela mesm
           +a moeda e pelo                                               
      1253 +mesmo valor original.                                        
      1254 +**Justificativa:** (1) o limiar é um limite da política, e a 
           +v4 diz que os                                                
      1255 +limites são em reais. Comparar 40 USD com 100 deixaria sem no
           +ta um gasto de                                               
      1256 +R$ 220. (2) A cópia de um lançamento repete a moeda e o valor
           + digitados. Duas                                             
      1257 +despesas em moedas diferentes que por acaso dão o mesmo valor
           + em reais não                                                
      1258 +são o mesmo lançamento.                                      
      1259 +**Regra afetada:** RN-007, RN-008                            
      1260 +                                                             
      1261 +### AMB-039 — Em que etapa entra a falta de cotação          
      1262 +                                                             
      1263 +**Texto original do RH (v4):** a política não fala do assunto
           +.                                                            
      1264 +**O que não está claro:** uma despesa em moeda sem cotação qu
           +e também está                                                
      1265 +fora do período ou tem categoria não reembolsável: qual motiv
           +o prevalece?                                                 
      1266 +**Decisão:** a conversão é calculada no início, mas a recusa 
           +por falta de                                                 
      1267 +cotação é a etapa 6, depois de período e categoria. Uma despe
           +sa fora do                                                   
      1268 +período continua `FORA_DO_PERIODO`.                          
      1269 +**Justificativa:** decisão do usuário: "a regra de câmbio não
           + deve alterar"                                               
      1270 +o funcionamento do período. Período e categoria dizem se a de
           +spesa poderia                                                
      1271 +ser paga de qualquer jeito. A falta de cotação só importa par
           +a despesas que                                               
      1272 +poderiam ser pagas. Assim, os motivos de antes da v4 não muda
           +m.                                                           
      1273 +**Regra afetada:** RN-017, seção 8                           
      1274 +                                                             
      1275 +### AMB-040 — Qual valor dispara a aprovação manual          
      1276 +                                                             
      1277 +**Texto original do RH (v4):** "Itens cujo valor reembolsável
           + passe de R$ 500                                             
      1278 +não são mais aprovados automaticamente."                     
      1279 +**O que não está claro:** (1) "passe de" é > ou ≥? (2) O valo
           +r é o                                                        
      1280 +reembolsável (depois dos limites) ou o solicitado? (3) O limi
           +ar varia por                                                 
      1281 +centro de custo?                                             
      1282 +**Decisão:** (1) estritamente maior, como na AMB-004. (2) o r
           +eembolsável, em                                              
      1283 +reais, depois dos limites. (3) não, é fixo em R$ 500,00, porq
           +ue a tabela do                                               
      1284 +financeiro não o traz.                                       
      1285 +**Justificativa:** decisão do usuário para (2), seguindo o te
           +xto do RH:                                                   
      1286 +"valor reembolsável". O gestor aprova o que a empresa vai pag
           +ar, e um pedido                                              
      1287 +alto cortado para um valor pequeno pelo limite não precisa de
           + aprovação.                                                  
      1288 +**Regra afetada:** RN-018                                    
      1289 +                                                             
      1290 +### AMB-041 — Como o item pendente aparece na saída          
      1291 +                                                             
      1292 +**Texto original do RH (v4):** "Eles entram em estado de pend
           +ência aguardando                                             
      1293 +aprovação do gestor. O resultado deixa de ser apenas um valor
           +: cada item passa                                            
      1294 +a ter um estado."                                            
      1295 +**O que não está claro:** o item pendente mostra algum valor?
           + Soma no total a                                             
      1296 +reembolsar? Consome o limite do dia enquanto espera?         
      1297 +**Decisão:** status `PENDENTE`, código `REQUER_APROVACAO`. `v
           +alor_reembolsavel`                                           
      1298 +mostra o valor calculado. O item consome o limite do dia e ge
           +ra dia de viagem                                             
      1299 +(se for hospedagem), mas fica fora do `total_reembolsavel`. O
           + resumo ganha                                                
      1300 +`pendentes` e `total_pendente`.                              
      1301 +**Justificativa:** decisão do usuário. O gestor precisa ver q
           +uanto vai                                                    
      1302 +aprovar. Somar o pendente no total a reembolsar misturaria va
           +lor aprovado com                                             
      1303 +valor que ainda depende de decisão. Não consumir o limite exi
           +giria                                                        
      1304 +reprocessar depois da aprovação, e o sistema não guarda histó
           +rico entre                                                   
      1305 +execuções (seção 3).                                         
      1306 +**Regra afetada:** RN-011, RN-014, RN-018                    
      1307 +                                                             
      1308  ---
      1309  
      1310  ## 7. Casos de borda

● Agora as linhas novas da seção 7 (casos de borda):

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 36 lines
      1391  | `colaborador.id` vazio | `"colaborador": {"id": "  "}` | er
            ro que cita `colaborador.id`, nenhuma saída gerada | RN-015 |
      1392  | `periodo.inicio` não textual | `"inicio": 20260701` | erro 
            que cita `periodo.inicio`, nenhuma saída gerada | RN-015 |
      1393  | Arquivo que não é objeto | conteúdo `[]` | erro, nenhuma sa
            ída gerada | RN-015 |
      1394 +| Centro de custo sem entrada na tabela | `CC-SUPORTE-N2`, al
           +imentação 65,00 | tabela padrão, `politica.tabela` `"padrao"`
           + → PARCIAL 60,00 | RN-016 |                                  
      1395 +| Colaborador sem centro de custo | `centro_custo` ausente, a
           +limentação 65,00 | tabela padrão → PARCIAL 60,00 | RN-016 |  
      1396 +| Centro de custo com outra grafia | `" cc-comercial "`, alim
           +entação 85,00 | tabela do CC-COMERCIAL → APROVADO 85,00 | RN-
           +016 |                                                        
      1397 +| Centro de custo não textual | `"centro_custo": 42` | erro q
           +ue cita `colaborador.centro_custo`, nenhuma saída gerada | RN
           +-015 |                                                       
      1398 +| Categoria herdada do padrão | CC-ADM, hospedagem 1 diária 3
           +00,00 | limite 250,00 do padrão → PARCIAL 250,00 | RN-016 |  
      1399 +| Categoria só em outro centro de custo | tabela padrão, `rep
           +resentacao` 190,00 | RECUSADO `CATEGORIA_NAO_REEMBOLSAVEL` | 
           +RN-006, RN-016 |                                             
      1400 +| Categoria nova no centro de custo | CC-COMERCIAL, `represen
           +tacao` 340,00 com NF | PARCIAL 300,00 | RN-009, RN-016 |     
      1401 +| Categoria com limite zero | CC-ENG-PLATAFORMA, hospedagem 2
           +00,00 com NF | RECUSADO `CATEGORIA_NAO_REEMBOLSAVEL`, descriç
           +ão cita o centro de custo | RN-006 |                         
      1402 +| Limite zero não gera viagem | CC-ENG-PLATAFORMA, hospedagem
           + + alimentação 80,00, mesma data | hospedagem RECUSADO; alime
           +ntação PARCIAL 75,00 (sem ampliação) | RN-006, RN-011 |      
      1403 +| Limite zero vem antes da nota fiscal | CC-ENG-PLATAFORMA, h
           +ospedagem 690,00 sem NF | RECUSADO `CATEGORIA_NAO_REEMBOLSAVE
           +L` (não `NOTA_FISCAL_AUSENTE`) | RN-006, seção 8 |           
      1404 +| Representação em dia de viagem | CC-COMERCIAL, hospedagem e
           +legível + `representacao` 420,00 com NF, mesma data | limite 
           +450,00 → APROVADO 420,00 | RN-011 |                          
      1405 +| Tabela de limites inválida | limite negativo na tabela | er
           +ro que cita a tabela de limites, nenhuma saída gerada | RN-01
           +5, RN-016 |                                                  
      1406 +| Arquivo de câmbio ausente | — | erro que cita o arquivo de 
           +câmbio, nenhuma saída gerada | RN-015, RN-017 |              
      1407 +| Moeda ausente | sem `moeda`, 45,00 | BRL, `taxa_cambio` 1, 
           +`valor_solicitado` 45,00 | RN-003, RN-017 |                  
      1408 +| Moeda nula ou vazia | `"moeda": null` / `""` | vale BRL | R
           +N-003 |                                                      
      1409 +| Moeda em minúsculas | `"moeda": " eur "` | tratada como EUR
           + | RN-003, RN-017 |                                          
      1410 +| Moeda não textual | `"moeda": 978` | RECUSADO `DADO_INVALID
           +O`, `moeda` sai `978` | RN-003 |                             
      1411 +| Moeda com formato inválido | `"moeda": "EURO"` | RECUSADO `
           +DADO_INVALIDO` | RN-003 |                                    
      1412 +| Conversão em dia útil | 22,00 EUR em 2026-07-14 | taxa 5,93
           +, `data_cotacao` 2026-07-14, `valor_solicitado` 130,46 | RN-0
           +17 |                                                         
      1413 +| Conversão no fim de semana | 30,00 EUR em 2026-07-18 (sábad
           +o) | taxa 5,96 de 2026-07-17, `valor_solicitado` 178,80 | RN-
           +017 |                                                        
      1414 +| Antes da primeira cotação | 10,00 EUR em 2026-07-10 | RECUS
           +ADO `CAMBIO_INDISPONIVEL`, `valor_solicitado` nulo | RN-017 |
      1415 +| Moeda sem cotação | 55,00 GBP | RECUSADO `CAMBIO_INDISPONIV
           +EL`, `valor_solicitado` nulo, fora do `total_solicitado` | RN
           +-017, RN-014 |                                               
      1416 +| Estrangeira fora do período | 10,00 EUR em 2026-06-30, perí
           +odo de julho | RECUSADO `FORA_DO_PERIODO` (não `CAMBIO_INDISP
           +ONIVEL`) | RN-005, RN-017 |                                  
      1417 +| Estrangeira negativa sem cotação | −10,00 GBP | RECUSADO `V
           +ALOR_NAO_POSITIVO` | RN-004, RN-017 |                        
      1418 +| Arredondamento da conversão | 10,05 USD em 2026-07-13 (× 5,
           +42) | 54,471 → `valor_solicitado` 54,47 | RN-001, RN-017 |   
      1419 +| Nota fiscal sobre o valor convertido | 40,00 USD em 2026-07
           +-20 (× 5,50), sem NF | R$ 220,00 → RECUSADO `NOTA_FISCAL_AUSE
           +NTE` | RN-008, RN-017 |                                      
      1420 +| Estrangeira abaixo do limiar de NF | 14,50 EUR em 2026-07-1
           +5 (× 5,88), sem NF | R$ 85,26, não exige NF → segue para o li
           +mite | RN-008, RN-017 |                                      
      1421 +| Mesmo valor em moedas diferentes | mesma data/categoria/for
           +necedor, 20,00 EUR e 20,00 USD | não são duplicatas | RN-007 
           +|                                                            
      1422 +| BRL explícito e implícito | mesma data/categoria/fornecedor
           +/valor, sem `moeda` e `"BRL"` | 1ª segue; 2ª RECUSADO `DUPLIC
           +ATA` | RN-007 |                                              
      1423 +| Reembolsável exatamente 500,00 | CC-COMERCIAL, hospedagem "
           +2 diarias" 500,00 | APROVADO 500,00 (não fica pendente) | RN-
           +018 |                                                        
      1424 +| Reembolsável acima de 500,00 | CC-COMERCIAL, hospedagem "2 
           +diarias" 500,02 | PENDENTE `REQUER_APROVACAO`, `valor_reembol
           +savel` 500,02 | RN-018 |                                     
      1425 +| Solicitado alto cortado pelo limite | tabela padrão, hosped
           +agem 1 diária 1.200,00 | PARCIAL 250,00 (não fica pendente) |
           + RN-018 |                                                    
      1426 +| Pendente com corte de limite | CC-COMERCIAL, hospedagem "2 
           +diarias" 1.000,00 | 500 + 500 → 400 + 400 → PENDENTE 800,00, 
           +descrição cita o corte de 200,00 | RN-012, RN-018 |          
      1427 +| Pendente consome o limite | CC-COMERCIAL, hospedagem "2 dia
           +rias" 800,00 em D; depois hospedagem 1 diária 100,00 em D | 1
           +ª PENDENTE 800,00; 2ª RECUSADO `LIMITE_DIARIO_ESGOTADO` | RN-
           +010, RN-018 |                                                
      1428 +| Hospedagem pendente gera viagem | CC-COMERCIAL, hospedagem 
           +"3 noites" 1.200,00 em D; alimentação 95,00 em D+1 | hospedag
           +em PENDENTE; alimentação APROVADO 95,00 (limite 135,00) | RN-
           +011, RN-018 |                                                
      1429 +| Pendente fora do total reembolsável | um item PENDENTE 1.20
           +0,00 e um APROVADO 88,00 | `total_reembolsavel` 88,00, `total
           +_pendente` 1.200,00, `pendentes` 1 | RN-014, RN-018 |        
      1430  
      1431  ## 8. Ordem de aplicação das regras
      1432  

● Agora a seção 8 (ordem de aplicação):

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 28 lines, removed 15 lines
      1434  a despesa define o motivo e encerra a avaliação dela.** Uma d
            espesa recusada em
      1435  qualquer etapa não consome limite diário.
      1436  
      1437 -1. **Arredondamento e normalização** (RN-001, RN-002).       
      1437 +Antes de tudo, uma vez por execução, é montada a **tabela apl
           +icável** ao                                                  
      1438 +colaborador (RN-016).                                        
      1439 +                                                             
      1440 +1. **Arredondamento, normalização e conversão** (RN-001, RN-0
           +02, RN-017). A                                               
      1441 +   conversão para reais é calculada aqui quando há cotação. A
           + falta de                                                    
      1442 +   cotação ainda não recusa a despesa.                       
      1443  2. **Validação dos dados** (RN-003) → `DADO_INVALIDO`.
      1444  3. **Valor não positivo** (RN-004) → `VALOR_NAO_POSITIVO`.
      1445  4. **Período** (RN-005) → `FORA_DO_PERIODO`.
      1441 -5. **Categoria** (RN-006) → `CATEGORIA_NAO_REEMBOLSAVEL`.    
      1442 -6. **Duplicata** (RN-007) → `DUPLICATA`. Só compara despesas 
           -que passaram pelas                                           
      1443 -   etapas 1 a 5.                                             
      1444 -7. **Nota fiscal** (RN-008) → `NOTA_FISCAL_AUSENTE`.         
      1445 -8. **Dias de viagem** (RN-011): definidos pelas hospedagens q
           -ue sobraram                                                  
      1446 -   depois da etapa 7.                                        
      1447 -9. **Limite diário** (RN-009, RN-010, RN-012), nas despesas q
           -ue sobraram.                                                 
      1448 -   Antes, cada hospedagem é dividida em parcelas por noite (R
           -N-012). As                                                   
      1449 -   despesas e parcelas são agrupadas por (data, categoria) e 
           -processadas na                                               
      1450 -   ordem da entrada, com o limite ampliado nos dias de viagem
           -.                                                            
      1446 +5. **Categoria** (RN-006, na tabela aplicável) → `CATEGORIA_N
           +AO_REEMBOLSAVEL`.                                            
      1447 +6. **Câmbio** (RN-017) → `CAMBIO_INDISPONIVEL`.              
      1448 +7. **Duplicata** (RN-007) → `DUPLICATA`. Só compara despesas 
           +que passaram pelas                                           
      1449 +   etapas 1 a 6.                                             
      1450 +8. **Nota fiscal** (RN-008, sobre o valor em reais) → `NOTA_F
           +ISCAL_AUSENTE`.                                              
      1451 +9. **Dias de viagem** (RN-011): definidos pelas hospedagens q
           +ue sobraram                                                  
      1452 +   depois da etapa 8.                                        
      1453 +10. **Limite diário** (RN-009, RN-010, RN-012), nas despesas 
           +que sobraram.                                                
      1454 +    Antes, cada hospedagem é dividida em parcelas por noite (
           +RN-012). As                                                  
      1455 +    despesas e parcelas são agrupadas por (data, categoria) e
           + processadas na                                              
      1456 +    ordem da entrada, com o limite ampliado nos dias de viage
           +m.                                                           
      1457 +11. **Aprovação manual** (RN-018): um item com reembolsável a
           +cima de R$ 500,00                                            
      1458 +    passa a PENDENTE/`REQUER_APROVACAO`. Essa etapa não muda 
           +nenhum valor e                                               
      1459 +    não devolve saldo ao limite.                             
      1460  
      1461  Por que esta ordem: primeiro vêm as regras que tratam de **el
            egibilidade**
      1453 -(etapas 2 a 7), e só depois as regras de **quanto pagar** (et
           -apas 8 e 9). Os                                              
      1454 -dias de viagem são definidos depois da elegibilidade para que
           - uma hospedagem                                              
      1455 -recusada não amplie limites. Se o limite                     
      1462 +(etapas 2 a 8), e só depois as regras de **quanto pagar** (et
           +apas 9 e 10) e                                               
      1463 +de **quem aprova** (etapa 11). Os dias de viagem são definido
           +s depois da                                                  
      1464 +elegibilidade para que uma hospedagem recusada não amplie lim
           +ites. Se o limite                                            
      1465  fosse aplicado antes, uma despesa inelegível consumiria saldo
             do dia e
      1466  prejudicaria uma despesa legítima. A duplicata vem antes da n
            ota fiscal para
      1467  que a segunda cópia de um gasto seja sempre identificada como
             duplicata, não
      1459 -importa o que diga o indicador de nota.                      
      1468 +importa o que diga o indicador de nota. O câmbio vem depois d
           +e período e                                                  
      1469 +categoria para que a falta de cotação não troque o motivo de 
           +uma despesa que                                              
      1470 +não seria paga de qualquer jeito (AMB-039), e antes da nota f
           +iscal e do                                                   
      1471 +limite, que precisam do valor em reais. A aprovação manual ve
           +m por último                                                 
      1472 +porque depende do reembolsável final.                        
      1473  
      1474  ## 9. Critérios de aceite
      1475  

● Agora a seção 9 (critérios de aceite e resultados esperados):

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 7 lines, removed 2 lines
      1475  
      1476  O sistema está pronto quando:
      1477  
      1478 -- [ ] Processar `exemplos/despesas-exemplo.json` produz exata
           -mente os resultados                                          
      1479 -      por item da tabela abaixo.                             
      1478 +- [ ] Com a tabela de limites `exemplos/envelope/politica-v4.
           +json` e as taxas                                             
      1479 +      `exemplos/envelope/cambio.json`, processar `exemplos/de
           +spesas-exemplo.json`,                                        
      1480 +      `exemplos/envelope/despesas-envelope.json` e           
      1481 +      `exemplos/envelope/despesas-envelope-cc-desconhecido.js
           +on` produz                                                   
      1482 +      exatamente os resultados por item das tabelas abaixo.  
      1483 +- [ ] Mudar um limite na tabela de limites muda o resultado s
           +em mudar o                                                   
      1484 +      sistema (RN-016).                                      
      1485  - [ ] Cada linha da tabela da seção 7 tem um teste automatiza
            do que passa.
      1486  - [ ] Cada `RN-NNN` tem ao menos um teste automatizado cujo n
            ome cita o ID.
      1487  - [ ] A saída sempre respeita o schema da seção 4: um item po
            r despesa, na

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 61 lines, removed 12 lines
      1490  - [ ] Uma entrada inválida (RN-015) gera erro com mensagem e 
            nenhum arquivo de
      1491        saída.
      1492  
      1493 -Resultado esperado para `exemplos/despesas-exemplo.json`:    
      1493 +**Resultado esperado para `exemplos/despesas-exemplo.json`** 
           +(colaborador do                                              
      1494 +`CC-ENG-PLATAFORMA`: alimentação 75,00, transporte 80,00, hos
           +pedagem não                                                  
      1495 +reembolsável; tudo em BRL):                                  
      1496  
      1497  | id | solicitado | reembolsável | status | código |
      1498  |---|---|---|---|---|
      1497 -| d-001 | 72,50 | 60,00 | PARCIAL | `LIMITE_DIARIO_EXCEDIDO` 
           -|                                                            
      1498 -| d-002 | 38,00 | 0,00 | RECUSADO | `LIMITE_DIARIO_ESGOTADO` 
           -|                                                            
      1499 +| d-001 | 72,50 | 72,50 | APROVADO | `APROVADO_INTEGRAL` |   
      1500 +| d-002 | 38,00 | 2,50 | PARCIAL | `LIMITE_DIARIO_EXCEDIDO` |
      1501  | d-003 | 100,00 | 80,00 | PARCIAL | `LIMITE_DIARIO_EXCEDIDO`
             |
      1502  | d-004 | 100,01 | 0,00 | RECUSADO | `NOTA_FISCAL_AUSENTE` |
      1503  | d-005 | 89,00 | 0,00 | RECUSADO | `CATEGORIA_NAO_REEMBOLSAV
            EL` |
     ...
      1505  | d-007 | 54,90 | 0,00 | RECUSADO | `DUPLICATA` |
      1506  | d-008 | 41,00 | 0,00 | RECUSADO | `FORA_DO_PERIODO` |
      1507  | d-009 | −45,00 | 0,00 | RECUSADO | `VALOR_NAO_POSITIVO` |
      1506 -| d-010 | 480,00 | 480,00 | APROVADO | `APROVADO_INTEGRAL` | 
      1508 +| d-010 | 480,00 | 0,00 | RECUSADO | `CATEGORIA_NAO_REEMBOLSA
           +VEL` |                                                       
      1509  | d-011 | 33,33 | 33,33 | APROVADO | `APROVADO_INTEGRAL` |
      1510  | d-012 | 47,20 | 47,20 | APROVADO | `APROVADO_INTEGRAL` |
      1509 -| d-013 | 690,00 | 0,00 | RECUSADO | `NOTA_FISCAL_AUSENTE` | 
      1510 -| d-014 | 61,00 | 60,00 | PARCIAL | `LIMITE_DIARIO_EXCEDIDO` 
           -|                                                            
      1511 +| d-013 | 690,00 | 0,00 | RECUSADO | `CATEGORIA_NAO_REEMBOLSA
           +VEL` |                                                       
      1512 +| d-014 | 61,00 | 61,00 | APROVADO | `APROVADO_INTEGRAL` |   
      1513  
      1512 -Resumo esperado: `total_solicitado` 1.861,84 · `total_reembol
           -savel` 815,43 ·                                              
      1513 -`total_nao_reembolsado` 1.046,41 · aprovados 4 · parciais 3 ·
           - recusados 7.                                                
      1514 +Resumo esperado: `politica.tabela` "CC-ENG-PLATAFORMA" · `tot
           +al_solicitado`                                               
      1515 +1.861,84 · `total_reembolsavel` 351,43 · `total_pendente` 0,0
           +0 ·                                                          
      1516 +`total_nao_reembolsado` 1.510,41 · aprovados 5 · parciais 2 ·
           + recusados 7 ·                                               
      1517 +pendentes 0.                                                 
      1518  
      1515 -`d-010` são 240,00 por noite, dentro do limite de 250,00. Os 
           -dias de viagem do                                            
      1516 -exemplo são 2026-07-14 e 2026-07-15 (as 2 noites de `d-010`).
           - `d-011` (15/07, alimentação 33,33) tem limite de 90,00 e é a
           -provada                                                      
      1517 -integralmente, como seria sem viagem. 2026-07-22 a 24 não são
           - dias de viagem                                              
      1518 -porque `d-013` foi recusada.                                 
      1519 +As duas hospedagens (`d-010` e `d-013`) são recusadas na etap
           +a de categoria,                                              
      1520 +então o exemplo não tem dias de viagem, e `d-013` não chega à
           + nota fiscal.                                                
      1521 +`d-011` tem limite de 75,00. *(Na v1.3, com a política única 
           +v3, o resultado era                                          
      1522 +815,43 reembolsáveis: ver D-019 no `DECISIONS.md`.)*         
      1523  
      1524 +**Resultado esperado para `exemplos/envelope/despesas-envelop
           +e.json`**                                                    
      1525 +(`CC-COMERCIAL`: alimentação 90,00, transporte 150,00, hosped
           +agem 400,00 por                                              
      1526 +noite, representação 300,00; dias de viagem 2026-07-22 a 24, 
           +pelas noites de                                              
      1527 +`e-007`):                                                    
      1528 +                                                             
      1529 +| id | moeda | original | taxa (data) | solicitado | reembols
           +ável | status | código |                                     
      1530 +|---|---|---|---|---|---|---|---|                            
      1531 +| e-001 | BRL | 340,00 | 1 | 340,00 | 300,00 | PARCIAL | `LIM
           +ITE_DIARIO_EXCEDIDO` |                                       
      1532 +| e-002 | EUR | 22,00 | 5,93 (07-14) | 130,46 | 90,00 | PARCI
           +AL | `LIMITE_DIARIO_EXCEDIDO` |                              
      1533 +| e-003 | EUR | 14,50 | 5,88 (07-15) | 85,26 | 85,26 | APROVA
           +DO | `APROVADO_INTEGRAL` |                                   
      1534 +| e-004 | EUR | 30,00 | 5,96 (07-17) | 178,80 | 90,00 | PARCI
           +AL | `LIMITE_DIARIO_EXCEDIDO` |                              
      1535 +| e-005 | USD | 40,00 | 5,50 (07-20) | 220,00 | 0,00 | RECUSA
           +DO | `NOTA_FISCAL_AUSENTE` |                                 
      1536 +| e-006 | GBP | 55,00 | — | nulo | 0,00 | RECUSADO | `CAMBIO_
           +INDISPONIVEL` |                                              
      1537 +| e-007 | BRL | 1.200,00 | 1 | 1.200,00 | 1.200,00 | PENDENTE
           + | `REQUER_APROVACAO` |                                      
      1538 +| e-008 | BRL | 95,00 | 1 | 95,00 | 95,00 | APROVADO | `APROV
           +ADO_INTEGRAL` |                                              
      1539 +| e-009 | BRL | 120,00 | 1 | 120,00 | 0,00 | RECUSADO | `CATE
           +GORIA_NAO_REEMBOLSAVEL` |                                    
      1540 +| e-010 | BRL | 88,00 | 1 | 88,00 | 88,00 | APROVADO | `APROV
           +ADO_INTEGRAL` |                                              
      1541 +                                                             
      1542 +Resumo esperado: `politica.tabela` "CC-COMERCIAL" · `total_so
           +licitado`                                                    
      1543 +2.457,52 · `total_reembolsavel` 748,26 · `total_pendente` 1.2
           +00,00 ·                                                      
      1544 +`total_nao_reembolsado` 509,26 · aprovados 3 · parciais 3 · r
           +ecusados 3 ·                                                 
      1545 +pendentes 1.                                                 
      1546 +                                                             
      1547 +`e-004` é de um sábado e usa a cotação de sexta. `e-007` são 
           +400,00 por                                                   
      1548 +noite, no limite, e fica pendente porque o reembolsável passa
           + de 500,00. Como                                             
      1549 +continua elegível, torna 22 a 24/07 dias de viagem, e `e-008`
           + (23/07) tem                                                 
      1550 +limite de 135,00. `e-001` (13/07) não é dia de viagem.       
      1551 +                                                             
      1552 +**Resultado esperado para `exemplos/envelope/despesas-envelop
           +e-cc-desconhecido.json`**                                    
      1553 +(`CC-SUPORTE-N2`, sem entrada na tabela → tabela padrão; dia 
           +de viagem                                                    
      1554 +2026-07-17, pela noite de `f-002`):                          
      1555 +                                                             
      1556 +| id | moeda | original | taxa (data) | solicitado | reembols
           +ável | status | código |                                     
      1557 +|---|---|---|---|---|---|---|---|                            
      1558 +| f-001 | BRL | 58,00 | 1 | 58,00 | 58,00 | APROVADO | `APROV
           +ADO_INTEGRAL` |                                              
      1559 +| f-002 | BRL | 310,00 | 1 | 310,00 | 250,00 | PARCIAL | `LIM
           +ITE_DIARIO_EXCEDIDO` |                                       
      1560 +| f-003 | BRL | 190,00 | 1 | 190,00 | 0,00 | RECUSADO | `CATE
           +GORIA_NAO_REEMBOLSAVEL` |                                    
      1561 +| f-004 | USD | 12,00 | 5,48 (07-21) | 65,76 | 65,76 | APROVA
           +DO | `APROVADO_INTEGRAL` |                                   
      1562 +                                                             
      1563 +Resumo esperado: `politica.tabela` "padrao" · `total_solicita
           +do` 623,76 ·                                                 
      1564 +`total_reembolsavel` 373,76 · `total_pendente` 0,00 · `total_
           +nao_reembolsado`                                             
      1565 +250,00 · aprovados 2 · parciais 1 · recusados 1 · pendentes 0
           +.                                                            
      1566 +                                                             
      1567 +`f-003` (`representacao`) não está no padrão: só o CC-COMERCI
           +AL a reembolsa.                                              
      1568 +                                                             
      1569  ## 10. O que fica em aberto
      1570  
      1571  - **Indicador de viagem (AMB-007):** "noite de hospedagem na 
            data" é uma
● Vou conferir as somas por data e categoria do exemplo original, para validar a
  nova tabela:

  Ran 1 shell command (ctrl+o to expand)

● A tabela confere. Agora a seção 10 (o que fica em aberto):

● Update(specs\001-motor-reembolso\spec.md)
  ⎿  Added 17 lines
      1589    como duplicata, porque a entrada não traz horário. O risco 
            foi aceito porque
      1590    o caso é raro e o colaborador pode relançar a despesa com o
             fornecedor
      1591    detalhado.
      1592 +- **Local fixo da política e do câmbio (AMB-028):** simula um
           + serviço do                                                  
      1593 +  financeiro. Quando esse serviço existir, a leitura dos arqu
           +ivos deve ser                                                
      1594 +  trocada por ele, com registro em `DECISIONS.md`.           
      1595 +- **Cotação anterior sem limite de dias (AMB-035):** se o arq
           +uivo de câmbio                                               
      1596 +  ficar semanas sem cotação de uma moeda, a última taxa conti
           +nua valendo. Um                                              
      1597 +  limite de defasagem pode ser acrescentado se o financeiro p
           +edir.                                                        
      1598 +- **Moedas sem centavos ou com 3 casas (JPY, KWD):** o valor 
           +original é                                                   
      1599 +  arredondado para 2 casas como qualquer outro (RN-001). Com 
           +as moedas do                                                 
      1600 +  arquivo atual (USD, EUR), isso não muda nada.              
      1601 +- **Sem histórico de política (AMB-034):** a execução usa a t
           +abela vigente                                                
      1602 +  inteira. Reprocessar um mês antigo depois de uma mudança na
           + tabela dá outro                                             
      1603 +  resultado.                                                 
      1604 +- **Aprovação do gestor (AMB-041):** o sistema só marca o ite
           +m como PENDENTE.                                             
      1605 +  A decisão do gestor, e o que acontece com o saldo do dia se
           + ele recusar, fica                                           
      1606 +  fora do motor.                                             
      1607 +- **Limiar de R$ 500 fixo na spec (AMB-040):** se o financeir
           +o passar a                                                   
      1608 +  mantê-lo na tabela de limites, a RN-018 deve passar a lê-lo
           + de lá.                                                      

  Ran 1 shell command (ctrl+o to expand)

● Os valores fixos restantes estão em aceites marcados como "tabela padrão" ou
  no histórico das AMBs, então estão corretos. Vou agora adicionar a entrada no
  DECISIONS.md, começando por verificar o formato completo da D-018.

  Read 1 file (ctrl+o to expand)

● Update(specs\001-motor-reembolso\DECISIONS.md)
  ⎿  Added 104 lines
       17  
       18  ---
       19  
       20 +## D-019 — Envelope do Dia 2: Política v4 (itens A, B e C) · `
          +2026-09-30`                                                   
       21 +                                                              
       22 +**Gatilho:** envelope lacrado do Dia 2 (`exemplos/envelope/00-
          +ENVELOPE-LACRADO.md`),                                        
       23 +com o comunicado do RH "Política de Reembolso v4" e quatro arq
          +uivos: tabela de                                              
       24 +limites por centro de custo (`politica-v4.json`), taxas de câm
          +bio                                                           
       25 +(`cambio.json`) e dois conjuntos de despesas. O usuário pediu 
          +primeiro só os                                                
       26 +itens A e B. Durante as perguntas, decidiu incluir também o it
          +em C (opcional),                                              
       27 +por considerá-lo pequeno.                                     
       28 +                                                              
       29 +**O que mudou na spec (versão 1.3 → 2.0):**                   
       30 +- §1, §2: contexto da v4 (política por centro de custo, moeda 
          +estrangeira,                                                  
       31 +  aprovação manual).                                          
       32 +- §3: sai "Não converte moeda" e sai a lista fixa de três cate
          +gorias. Entram:                                               
       33 +  não busca cotações, não mantém a tabela nem as taxas, não gu
          +arda versões                                                  
       34 +  antigas da política, só marca a pendência (a aprovação fica 
          +fora do motor).                                               
       35 +- §4 entrada: `centro_custo` passa a decidir a tabela; novo ca
          +mpo                                                           
       36 +  `despesas[].moeda`; `valor` passa a ser na moeda da despesa;
          + formato dos dois                                             
       37 +  arquivos externos (tabela de limites e câmbio).             
       38 +- §4 saída: `politica.versao` e `politica.tabela`; por item `m
          +oeda`,                                                        
       39 +  `valor_original`, `taxa_cambio`, `data_cotacao`; `valor_soli
          +citado` passa a                                               
       40 +  ser em reais; status `PENDENTE`; resumo com `pendentes` e `t
          +otal_pendente`;                                               
       41 +  `total_nao_reembolsado = solicitado − reembolsável − pendent
          +e`. Códigos novos                                             
       42 +  `CAMBIO_INDISPONIVEL` (RECUSADO) e `REQUER_APROVACAO` (PENDE
          +NTE). Exemplo                                                 
       43 +  refeito com um item em EUR.                                 
       44 +- RNs alteradas: RN-001 (arredonda o original e o convertido),
          + RN-002                                                       
       45 +  (categorias reconhecidas vêm da tabela), RN-003 (validação d
          +e `moeda`;                                                    
       46 +  `CAMBIO_INDISPONIVEL` reserva o `id`), RN-004 (sinal pelo va
          +lor original),                                                
       47 +  RN-006 (limite > 0 na tabela aplicável; limite 0 = não reemb
          +olsável no                                                    
       48 +  centro de custo), RN-007 (duplicata compara moeda e valor or
          +iginal), RN-008                                               
       49 +  (limiar vem da tabela, comparado em reais), RN-009 (limites 
          +da tabela; a                                                  
       50 +  tabela da v3 vira referência dos valores da v4), RN-010 e RN
          +-012 (aceites                                                 
       51 +  refeitos), RN-011 (percentual vem da tabela; vale para toda 
          +categoria de                                                  
       52 +  periodicidade `dia`; hospedagem PENDENTE gera viagem; "etapa
          +s 2 a 8"),                                                    
       53 +  RN-014 (pendentes), RN-015 (centro de custo não textual e ar
          +quivos externos                                               
       54 +  inválidos).                                                 
       55 +- RNs novas: RN-016 (política por centro de custo), RN-017 (mo
          +eda e                                                         
       56 +  conversão), RN-018 (aprovação manual acima de R$ 500).      
       57 +- Novas AMB-028 a AMB-041. AMB-020 recebeu nota de atualização
          +.                                                             
       58 +- §7: 37 casos de borda novos. Os casos antigos continuam vale
          +ndo na tabela                                                 
       59 +  padrão e em BRL, o que foi explicitado na RN-009.           
       60 +- §8: nova etapa 6 (câmbio) e etapa 11 (aprovação manual). A c
          +onversão é                                                    
       61 +  calculada na etapa 1. As etapas 6 a 9 antigas viraram 7 a 10
          +.                                                             
       62 +- §9: tabela de `despesas-exemplo.json` refeita e tabelas nova
          +s para os dois                                                
       63 +  arquivos do envelope. §10: seis pontos em aberto novos.     
       64 +- Nove entradas em `Clarifications` (Session 2026-09-30).     
       65 +                                                              
       66 +**Como se chegou lá:** o Claude leu o envelope, a spec e os an
          +exos e fez três                                               
       67 +rodadas de perguntas. Decisões do usuário:                    
       68 +- política e câmbio em **local fixo**, porque a interface é fi
          +xa ("provavelmente                                            
       69 +  uma chamada de API num projeto real"), e o README precisa av
          +isar como trocar                                              
       70 +  esses arquivos (AMB-028);                                   
       71 +- categoria que falta no centro de custo herda do padrão; se n
          +em o padrão a                                                 
       72 +  tem, não é reembolsável (AMB-030);                          
       73 +- limite 0 → mesmo código `CATEGORIA_NAO_REEMBOLSAVEL` com des
          +crição nova. A                                                
       74 +  primeira resposta, "recusado num novo motivo de CATEGORIA_NA
          +O_REEMBOLSAVEL",                                              
       75 +  permitia duas leituras, e o Claude perguntou de novo (AMB-03
          +1);                                                           
       76 +- dia sem cotação usa a última cotação anterior (AMB-035);    
       77 +- o câmbio não muda a recusa por período (AMB-039);           
       78 +- moeda sem cotação → código novo `CAMBIO_INDISPONIVEL` (AMB-0
          +36);                                                          
       79 +- item C incluído. A resposta do usuário falava em "valor de d
          +espesa acima de                                               
       80 +  500", e o envelope diz "valor reembolsável". O Claude aponto
          +u a diferença e o                                             
       81 +  usuário escolheu o reembolsável (AMB-040). O pendente fica f
          +ora do total                                                  
       82 +  reembolsável (AMB-041).                                     
       83 +                                                              
       84 +O Claude propôs, e registrou para revisão, os pontos que as re
          +spostas não                                                   
       85 +cobriam: normalização e tipo do centro de custo (AMB-032), sig
          +nificado de                                                   
       86 +"política padrão" (AMB-029), vigência (AMB-034), formato da `m
          +oeda` e                                                       
       87 +arredondamento da conversão (AMB-036, AMB-037), limiar de nota
          + fiscal e                                                     
       88 +duplicata em moeda estrangeira (AMB-038), ampliação de viagem 
          +para                                                          
       89 +`representacao` (AMB-033) e o limiar de R$ 500 fixo na spec (A
          +MB-040).                                                      
       90 +                                                              
       91 +**Por quê:** mudança de requisito do RH. Ver AMB-028 a AMB-041
          +.                                                             
       92 +                                                              
       93 +**O que isso invalidou:**                                     
       94 +- As constantes da v3 fixas no sistema (limites, limiar de not
          +a, 50% de                                                     
       95 +  viagem) e a lista fechada de três categorias (RN-006, RN-009
          +, RN-011, e AMB-020                                           
       96 +  em parte).                                                  
       97 +- "Não converte moeda" e "não tem fluxo de aprovação" (§3).   
       98 +- `valor_solicitado` deixa de ser o `valor` arredondado: agora
          + é o valor em                                                 
       99 +  reais.                                                      
      100 +- **A tabela da §9 de `despesas-exemplo.json`.** O colaborador
          + do exemplo é do                                              
      101 +  `CC-ENG-PLATAFORMA`, e a v4 é retroativa a julho. Mudam d-00
          +1 (APROVADO                                                   
      102 +  72,50), d-002 (PARCIAL 2,50), d-010 e d-013 (`CATEGORIA_NAO_
          +REEMBOLSAVEL`,                                                
      103 +  sem dias de viagem) e d-014 (APROVADO 61,00). Total reembols
          +ável: de 815,43                                               
      104 +  para 351,43.                                                
      105 +- O schema de saída (campos novos, status novo).              
      106 +                                                              
      107 +**Tasks afetadas (a refazer ou estender em tasks novas, T-043 
          +em diante):**                                                 
      108 +T-002 (tipos), T-008 (validação de `moeda`), T-012 (sinal pelo
          + valor                                                        
      109 +original), T-014 (categoria pela tabela aplicável, limite 0), 
          +T-015 (duplicata                                              
      110 +com moeda), T-016 (limiar vindo da tabela, em reais), T-017 e 
          +T-022 (motor:                                                 
      111 +conversão, etapas 6 e 11), T-020 (percentual e categorias `dia
          +`), T-021                                                     
      112 +(limites da tabela), T-023 (motivos novos), T-024 (pendentes),
          + T-025 e T-038                                                
      113 +(leitura dos arquivos externos e erros), T-035 e T-037 (saída 
          +e schema), T-036                                              
      114 +(exemplo com a nova tabela), T-040 (bordas de arquivo), T-041 
          +(RN-016 a RN-018                                              
      115 +na rastreabilidade) e T-042 (seção do README sobre os arquivos
          + fixos). O                                                    
      116 +`plan.md` precisa trocar o módulo de constantes da política pe
          +la leitura da                                                 
      117 +tabela.                                                       
      118 +                                                              
      119 +**Custo:** `spec.md` (quase todas as seções) e `DECISIONS.md`.
          + Pendentes:                                                   
      120 +`plan.md`, `research.md`, `data-model.md`, `contracts/`, `task
          +s.md`.                                                        
      121 +                                                              
      122 +---                                                           
      123 +                                                              
      124  ## D-018 — Lacunas achadas no `/speckit-analyze` (RN-003, RN-0
           07, RN-012, RN-015, AMB-026, AMB-027) · `2026-09-29`
      125  
      126  **Gatilho:** `/speckit-analyze`, depois das tasks. A análise c
           ruzada apontou

● Bash(cd "d:/Usuario/Projetos/Dev/Apps/sdd-desafio" && sed -i 's/- §7: 37 casos
      de borda novos/- §7: 36 casos de borda novos/'
      specs/001-motor-reembolso/DECISIONS.md…)
  ⎿  Updated specs\001-motor-reembolso\DECISIONS.md (+1 -1)
      55  - RNs novas: RN-016 (política por centro de custo), RN-017 (moe
          da e
      56    conversão), RN-018 (aprovação manual acima de R$ 500).
      57  - Novas AMB-028 a AMB-041. AMB-020 recebeu nota de atualização.
      58 -- §7: 37 casos de borda novos. Os casos antigos continuam valen
         -do na tabela                                                   
      58 +- §7: 36 casos de borda novos. Os casos antigos continuam valen
         +do na tabela                                                   
      59    padrão e em BRL, o que foi explicitado na RN-009.
      60  - §8: nova etapa 6 (câmbio) e etapa 11 (aprovação manual). A co
          nversão é
      61    calculada na etapa 1. As etapas 6 a 9 antigas viraram 7 a 10.

  Ran 1 shell command (ctrl+o to expand)

● A spec está atualizada para a v4 (1.3 → 2.0) e registrei a mudança como D-019
  no DECISIONS.md. Ainda não fiz commit, porque o plano previa a sua revisão
  antes. Por decisão sua durante as perguntas, o item C também entrou.

  O que mais pesa
  - O resultado do exemplo original muda. O colaborador de
    exemplos/despesas-exemplo.json é do CC-ENG-PLATAFORMA, e a v4 vale
    retroativamente para julho. Com isso:
    - d-001 passa a APROVADO 72,50 e d-002 a PARCIAL 2,50;
    - d-014 passa a APROVADO 61,00;
    - d-010 e d-013 passam a CATEGORIA_NAO_REEMBOLSAVEL, e o exemplo deixa de
      ter dias de viagem;
    - o total reembolsável cai de 815,43 para 351,43.
  - A etapa de câmbio foi para depois de período e categoria (seção 8, nova
    etapa 6). Assim, uma despesa fora do período continua saindo
    FORA_DO_PERIODO, como você pediu.
  - A aprovação manual é a última etapa (11). O item PENDENTE consome o limite
    do dia e, se for hospedagem, gera dia de viagem, mas fica fora do
    total_reembolsavel.

  O que mudou na spec
  - Regras novas:
    - RN-016: política por centro de custo. Usa a tabela do centro de custo; o
      que faltar vem do padrão; o que não estiver em nenhum dos dois não é
      reembolsável.
    - RN-017: moeda e conversão, usando a última cotação até a data da despesa,
      com o código novo CAMBIO_INDISPONIVEL.
    - RN-018: aprovação manual quando o reembolsável passa de R$ 500, com o
      código REQUER_APROVACAO.
  - Regras ajustadas: RN-001, 002, 003, 004, 006, 007, 008, 009, 010, 011, 012,
    014 e 015. Os limites, o limiar da nota fiscal e o percentual de viagem
    deixam de ser fixos e passam a vir do arquivo.
  - Seções:
    - seção 4 com os campos novos e o formato dos dois arquivos externos;
    - ambiguidades AMB-028 a AMB-041;
    - 36 casos de borda novos;
    - seção 9 com a tabela do exemplo refeita e tabelas para os dois arquivos do
      envelope, que calculei à mão.

  Decisões que tomei sozinho (confira no diff)
  Estão registradas como ambiguidades, mas nenhuma das suas respostas cobria
  estes pontos:
  - Centro de custo: comparado sem diferenciar maiúsculas e espaços nas bordas.
    Se não for texto, o arquivo é recusado (AMB-032).
  - "Política padrão": é o bloco padrao do arquivo, não as constantes da v3
    (AMB-029).
  - Vigência: só é lida; não muda nenhum resultado (AMB-034).
  - moeda: ausente, nula ou vazia vale BRL. Precisa ter 3 letras; senão,
    DADO_INVALIDO (AMB-036).
  - Conversão: arredonda o valor original e depois o valor em reais, meio para o
    par (AMB-037).
  - Nota fiscal e duplicata: o limiar da nota compara o valor em reais. A
    duplicata compara moeda e valor original (AMB-038).
  - representacao em viagem: tem o limite ampliado. A regra vale para toda
    categoria com limite por dia (AMB-033).
  - R$ 500 do item C: fica fixo na spec, porque a tabela do financeiro não traz
    esse valor (AMB-040).

  Estado dos testes: npm test tem 3 falhas, todas em
  tests/rastreabilidade.test.ts. Isso é esperado: RN-016 a RN-018 e os casos de
  borda novos ainda não têm testes. O teste do exemplo ainda passa porque o
  código continua na v3. Agora a spec e o código divergem, e pela regra do
  projeto o código é o bug.

  Próximos passos: atualizar plan.md, research.md, data-model.md e contracts/ (a
  leitura da tabela substitui src/nucleo/politica.ts), depois criar as tasks
  T-043 em diante (incluindo a seção do README sobre os arquivos fixos) e fazer
  o commit docs(spec):. Quer que eu faça o commit agora ou siga para o plan.md?