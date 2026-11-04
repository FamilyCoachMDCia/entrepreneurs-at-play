# Auditoria de webdesign e experiência — Entrepreneurs at Play

Data: 04/11/2026. Projeto: C:/Users/Ithalo/Desktop/escola/entregas/site. Versão local inspecionada em [localhost:5173](http://localhost:5173/).

## 1. Parecer geral

A direção visual é consistente: o creme, o verde e o dourado combinam com educação e natureza; a Fraunces dá personalidade aos títulos; os desenhos, as folhas e o papel quadriculado sustentam uma linguagem própria. Os cartões The Hatch e The Studio diferenciam bem as duas propostas visualmente. O retrato da fundadora e os botões principais também têm uma boa base.

O site, porém, oferece muitas interações antes de resolver algumas necessidades básicas dos pais. Há problemas concretos de contraste, recorte em telas pequenas, navegação, sincronização de informações e confirmação de envio. Parte do conteúdo depende de virar cartões, passar o mouse ou atravessar uma sequência de rolagem fixa. A rotina apresentada é de The Studio; The Hatch ainda recebe pouca explicação prática.

**Não recomendo refazer a identidade visual. Recomendo corrigir os bugs, simplificar a navegação e organizar a página em torno das decisões das famílias.** A proposta precisa ser compreensível mesmo sem brincar com os elementos da interface.

Os achados abaixo distinguem falhas reproduzidas, condições confirmadas no código e recomendações de design. Não são todos equivalentes a bugs.

## 2. Método e limites

### O que foi inspecionado

- HTML, CSS, scripts de interface, seleção de percursos, animações, cena Three.js, loader, configuração de imagens, README e documento de preparação.
- Navegador em 1440 × 1000, 1024 × 768, 768 × 1024, 768 × 375, 390 × 844, 360 × 640 e 320 × 700.
- Carrossel e verso das fotos; perfis de aluno; seleção de idade e percurso; programação diária; comparador de imagens; cartões curriculares; FAQ; formulário vazio; menu por teclado; mudança de breakpoint sem recarregar; acesso direto a #visit.
- Build de produção e console da aba local.

Foi usado um servidor temporário do Vite para inspecionar os arquivos no navegador. A primeira tentativa de acesso estava limitada pelo ambiente; depois de iniciar o servidor com acesso local apropriado, a página foi inspecionada normalmente. Essa dificuldade inicial não foi classificada como defeito do site.

**Não foram enviados pedidos válidos, mensagens ou dados para terceiros.** O falso sucesso do formulário foi identificado no fluxo do código, sem disparar um e-mail de teste. O fluxo de envio foi interrompido na primeira fronteira sem integração configurada.

Testes por dimensão não substituem aparelhos reais, gestos de toque, Safari/iOS ou um teste completo com leitores de tela. Reduced motion foi revisado no código, sem alterar a preferência do sistema. Não foram executados Lighthouse, testes em 4G, avaliação jurídica, conferência de credenciais ou verificação externa das referências científicas. Não há base para atribuir uma nota formal de acessibilidade ou desempenho.

**Prioridades:** P1 = corrigir antes de publicar ou ampliar divulgação; P2 = melhoria importante; P3 = refinamento. Não foi identificado um achado P0.

## 3. Achados de funcionamento, layout e acessibilidade

### A01 — P1 · O texto no verso das fotos fica quase invisível

**Evidência: reproduzido.** Ao abrir a história da primeira foto do carrossel, o parágrafo aparece em cinza escuro sobre verde escuro. A cor calculada do texto é #4A4D44 e o fundo é #1F2A17, com contraste aproximado de 1,74:1. O problema não está na foto: a regra genérica dos parágrafos do cartão sobrescreve a cor clara do verso.

**Arquivos:** [main.css:454](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:454), [main.css:468](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:468) e [index.html:283](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:283).

**Possível solução:** definir explicitamente uma cor clara para os parágrafos de .card-back, ou restringir a regra escura ao resumo externo do cartão. Conferir também a legenda manuscrita e o controle de voltar à foto.

**Aceite:** abrir os oito versos e ler todos os parágrafos com facilidade, em desktop e celular, sem depender de brilho alto da tela.

### A02 — P1 · A abertura é cortada em 320 px

**Evidência: reproduzido em 320 × 700.** A área útil do documento tinha 305 px, mas .hero-copy ocupava aproximadamente 318 px e começava a 16 px da borda. Seu limite direito passava de 333 px. O final de Entrepreneurs e trechos do texto eram cortados; o botão secundário quebrava em duas linhas. O overflow oculto disfarça o excesso de largura sem resolver o recorte.

**Arquivos:** [main.css:212](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:212), [main.css:216](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:216), [main.css:223](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:223) e [main.css:269](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:269).

**Possível solução:** permitir que o item de grid encolha, com min-width: 0 e largura compatível com o contêiner; reduzir o piso do tamanho do título para telas estreitas. Revisar a coluna fixa de 132 px dos brinquedos: em larguras pequenas ela pode diminuir ou passar para outra posição.

**Aceite:** o nome completo, o parágrafo e os dois botões cabem em 320 px. Não usar overflow oculto como substituto para adaptação do conteúdo. Em 390 px, a abertura teve composição consideravelmente melhor.

### A03 — P1 · A programação fixa é mais alta que a tela em celulares baixos

**Evidência: reproduzido em 360 × 640.** Durante a sequência fixa, .day-pin tinha aproximadamente 775 px de altura. O bloco de descrições terminava perto de 685 px e a observação final perto de 751 px, abaixo dos 640 px visíveis. A rolagem continuava mudando o horário e a atividade enquanto parte do texto permanecia fora da tela.

**Arquivos:** [sections.js:240](C:/Users/Ithalo/Desktop/escola/entregas/site/src/sections.js:240) e [main.css:479](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:479).

**Possível solução:** desativar o pin em telas pequenas ou baixas e usar uma lista cronológica comum. Se o efeito for mantido, condicioná-lo à altura disponível e oferecer navegação explícita por etapas, com o conteúdo completo visível.

**Aceite:** em 360 × 640 e em orientação horizontal, horário, título e descrição de cada atividade podem ser lidos antes de avançar. A observação de que o exemplo é de The Studio não pode ficar inacessível durante a apresentação.

### A04 — P1 · O foco sai do menu móvel e entra no conteúdo escondido

**Evidência: reproduzido por teclado.** Com o menu aberto, o Tab percorreu os seis atalhos e o e-mail. O próximo foco foi Book a visit do hero, atrás da camada aberta. Não há contenção de foco nem fundo inert.

**Arquivos:** [ui.js:64](C:/Users/Ithalo/Desktop/escola/entregas/site/src/ui.js:64) e [index.html:109](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:109).

**Possível solução:** tratar a camada como menu modal acessível: foco inicial no conteúdo, contenção de Tab e Shift+Tab, fundo temporariamente inerte e retorno do foco ao acionador. Preservar Escape para fechar e bloquear a rolagem do fundo também quando Lenis não estiver ativo.

**Aceite:** nenhum elemento atrás do menu recebe foco ou interação enquanto ele estiver aberto; ao fechar, a posição do usuário é previsível.

### A05 — P1 · O menu não comporta telas baixas ou orientação horizontal

**Evidência: reproduzido em 768 × 375.** O menu tinha 375 px de altura, conteúdo com cerca de 586 px e overflow-y: visible. Founder, Questions, Book a visit e o e-mail ficavam total ou parcialmente abaixo da tela. O layout não oferece uma região própria de rolagem.

**Arquivo:** [main.css:192](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:192).

**Possível solução:** habilitar rolagem vertical no menu, adequar espaçamentos e tamanho das letras à altura e evitar que o rodapé do menu dispute espaço com a lista. Usar uma estrutura que respeite a área visível do dispositivo.

**Aceite:** todos os links e o botão de fechar ficam alcançáveis em 768 × 375, inclusive com teclado. O contato não se sobrepõe à lista.

### A06 — P1 · Cliques rápidos podem esconder o perfil de aluno selecionado

**Evidência: reproduzido.** Na sequência abrir The builder → clicar novamente para fechar → abrir The artist rapidamente, o painel terminou com hidden: true, embora The artist estivesse com aria-expanded: true. O conteúdo já havia mudado para The artist, mas continuava oculto. O callback da animação anterior de fechamento interfere no novo estado.

**Arquivo:** [sections.js:103](C:/Users/Ithalo/Desktop/escola/entregas/site/src/sections.js:103), especialmente o fechamento na linha 129 e a abertura na linha 148.

**Possível solução:** cancelar animações e callbacks pendentes ao trocar de estado; controlar a abertura por um único estado atual. Antes de esconder o painel no onComplete, conferir se aquela operação ainda é válida. Sincronizar hidden, altura e aria-expanded.

**Aceite:** repetir a sequência rápida entre diferentes perfis sem obter botão expandido com painel oculto, altura residual ou conteúdo da escolha anterior.

### A07 — P1 · Idade, percurso visual e formulário podem discordar

**Evidência: reproduzido.** Ao acionar Book a Studio visit a partir do estado inicial, foram observados ao mesmo tempo: cartão ativo Studio; slider com 4 anos; texto Your child would join The Hatch; formulário com 8 anos e recomendação The Studio.

O código também salva uma escolha ao simples hover ou foco do cartão. Ao restaurar Studio, usa 8 anos como padrão, e o CTA pode preencher 4 ou 8 anos quando o slider não corresponde ao percurso. Esses valores não representam necessariamente a idade informada pela família.

**Arquivo:** [pathways.js:21](C:/Users/Ithalo/Desktop/escola/entregas/site/src/pathways.js:21), [pathways.js:38](C:/Users/Ithalo/Desktop/escola/entregas/site/src/pathways.js:38) e [pathways.js:59](C:/Users/Ithalo/Desktop/escola/entregas/site/src/pathways.js:59).

**Possível solução:** separar prévia visual, percurso escolhido e idade realmente informada. Centralizar a atualização da recomendação e do formulário. Não transformar hover em preferência persistente. Se a idade não foi informada, deixar o campo vazio em vez de inventar uma idade representativa do grupo.

**Aceite:** após slider, foco, hover, clique, CTA e recarregamento, não existem recomendações contraditórias. Um CTA de percurso pode selecionar o interesse, mas só preenche a idade quando ela foi explicitamente fornecida.

### A08 — P1 · O formulário confirma envio sem ter enviado a solicitação

**Evidência: confirmado no código e na configuração renderizada.** O formulário atual não possui data-endpoint. Nesse caso, o JavaScript apenas abre um mailto e, logo em seguida, mostra Request sent e promete retorno em dois dias. Abrir o aplicativo de e-mail não confirma que a pessoa enviou a mensagem ou que ela foi recebida.

**Arquivos:** [ui.js:142](C:/Users/Ithalo/Desktop/escola/entregas/site/src/ui.js:142), especialmente as linhas 163–178; [index.html:571](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:571) e [README.md](C:/Users/Ithalo/Desktop/escola/entregas/site/README.md).

**Possível solução:** conectar um canal de recebimento aprovado e só mostrar sucesso após a confirmação apropriada. Enquanto houver mailto, usar uma ação como Preparar e-mail e explicar que ainda é preciso enviar no aplicativo. Solicitar uma visita também deve ser distinguido de reservar um horário.

Se o endpoint for conectado, acrescentar estado de envio, bloqueio de cliques duplicados, tratamento de falha e uma alternativa que preserve os dados digitados. Confirmar com a equipe o compromisso de retorno em dois dias.

**Aceite:** uma pessoa sem aplicativo de e-mail não recebe uma confirmação falsa. A interface informa exatamente o que aconteceu e qual é o próximo passo. O recebimento real deverá ser testado em ambiente próprio, sem pedidos de visitantes como teste.

### A09 — P2 · Os brinquedos desaparecem ao cruzar o breakpoint sem recarregar

**Evidência: reproduzido.** Após carregar em largura de celular e ampliar para 768 px, o canvas continuou dentro de .hero-toyslot, agora com display: none. O palco maior não tinha canvas, mas seu fallback também estava oculto pela classe has-webgl. O resultado é uma área visual vazia.

**Arquivos:** [main.js:73](C:/Users/Ithalo/Desktop/escola/entregas/site/src/main.js:73), [hero-toys.js:155](C:/Users/Ithalo/Desktop/escola/entregas/site/src/hero-toys.js:155) e [main.css:247](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:247).

**Possível solução:** reconfigurar a cena ao mudar a media query, mover/recriar o canvas com limpeza dos recursos anteriores ou adotar um único host responsivo. Ocultar o fallback apenas no host que realmente contém uma cena utilizável.

**Aceite:** testar 390 → 768 → 1440 → 390 sem reload e rotação de aparelho. O elemento gráfico aparece em todas as etapas, sem canvas duplicado ou área vazia.

### A10 — P2 · Os cartões curriculares mostram um estado diferente do anunciado

**Evidência: reproduzido.** Depois de clicar no primeiro cartão e pressionar Espaço para desfazer, aria-pressed ficou false, mas o cartão continuou exibindo o verso, porque o ponteiro ainda estava sobre ele. A transformação final permanecia em 180 graus. Hover e clique controlam a mesma aparência por mecanismos independentes.

**Arquivos:** [main.css:592](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:592) e [sections.js:323](C:/Users/Ithalo/Desktop/escola/entregas/site/src/sections.js:323).

**Possível solução:** usar uma única fonte de estado para abrir o detalhe. Hover pode elevar ou destacar o cartão, mas não deve contrariar o estado acionado por botão. Considerar aria-expanded para uma expansão de conteúdo, em vez de apresentar a ação como um botão de alternância sem significado claro.

**Aceite:** clique, Espaço e Enter produzem um estado visual e anunciado consistente, independentemente da posição do mouse.

### A11 — P2 · Os horários da programação são removidos da leitura acessível

**Evidência: confirmado no DOM e no CSS.** Em modo fixo, todos os elementos time originais ficam com display: none. Os horários visuais são clonados para .day-times, que está com aria-hidden: true. Assim, as duas representações dos horários ficam fora da leitura acessível. Também são criadas oito cópias de fotos, totalizando 16 imagens na seção, sem uma distinção acessível clara entre conteúdo e apresentação.

**Arquivos:** [index.html:365](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:365), [sections.js:249](C:/Users/Ithalo/Desktop/escola/entregas/site/src/sections.js:249) e [main.css:509](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:509).

**Possível solução:** manter uma lista cronológica semântica completa com horários e descrições. Tratar os clones usados na animação como decoração, sem duplicar sua leitura. Não esconder o único conteúdo que identifica quando cada atividade ocorre.

**Aceite:** a sequência pode ser lida por tecnologia assistiva com todos os horários, na ordem correta e sem duplicação de fotos. O mecanismo foi inspecionado no DOM; a validação final exige leitor de tela real.

### A12 — P2 · Frente e verso dos cartões permanecem expostos ao mesmo tempo

**Evidência: confirmado no DOM.** As fotos e os cartões curriculares usam transformações 3D e backface-visibility para esconder visualmente uma face, mas não atualizam hidden, aria-hidden ou uma estrutura equivalente. No snapshot, textos das duas faces já aparecem antes de abrir o cartão.

**Arquivos:** [index.html:283](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:283), [index.html:436](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:436), [sections.js:197](C:/Users/Ithalo/Desktop/escola/entregas/site/src/sections.js:197) e [main.css:594](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:594).

**Possível solução:** definir uma estrutura acessível única. Ou o texto é uma descrição estática sempre disponível, ou o botão revela uma região com estado sincronizado. Evitar que nomes de botões se tornem a concatenação de título, data e todo o texto das duas faces.

**Aceite:** a leitura e o nome da ação correspondem ao conteúdo disponível; não há repetição desnecessária nem informação essencial dependente da transformação visual.

### A13 — P2 · Algumas explicações só aparecem com mouse; outras exigem descoberta por gesto

**Evidência: confirmado no CSS e na inspeção.** As descrições dos quatro locais — fazenda, voo, cozinha e capitólio — começam invisíveis e só aparecem em .tile:hover dentro de uma media query de hover. Os blocos não têm controle equivalente para teclado ou toque. Já as setas do carrossel desaparecem abaixo de 768 px, deixando o gesto horizontal como principal forma de descobrir os últimos diferenciais.

**Arquivos:** [main.css:437](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:437), [main.css:549](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:549) e [index.html:396](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:396).

**Possível solução:** deixar as descrições dos locais visíveis ou oferecer expansão por botão. Manter controles compactos de navegação no carrossel, junto de uma indicação como 1 de 8. O carrossel já tem suporte de setas por teclado, o que deve ser preservado.

**Aceite:** toque e teclado permitem obter o mesmo conteúdo explicativo do mouse. Um visitante percebe que existem oito itens sem ter de adivinhar o gesto.

### A14 — P2 · As opções de movimento não cobrem toda a experiência

**Evidência: confirmado no código; reduced motion não foi alterado no sistema.** Pause announcements interrompe o ticker e o texto rotativo do hero, mas não a cena 3D, o selo giratório ou as folhas com animação contínua. O rótulo do botão fala apenas de anúncios; falta uma alternativa geral para os outros movimentos. Com reduce ativo, o ticker continua trocando de mensagem a cada quatro segundos, apenas sem a transição.

Além disso, o comentário de main.js diz que a rolagem suave é só para dispositivos com ponteiro, mas a condição real inicializa Lenis em qualquer dispositivo sem reduced motion.

**Arquivos:** [ui.js:20](C:/Users/Ithalo/Desktop/escola/entregas/site/src/ui.js:20), [main.js:18](C:/Users/Ithalo/Desktop/escola/entregas/site/src/main.js:18), [hero-toys.js:265](C:/Users/Ithalo/Desktop/escola/entregas/site/src/hero-toys.js:265), [growth-line.js](C:/Users/Ithalo/Desktop/escola/entregas/site/src/growth-line.js) e [main.css:257](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:257).

**Possível solução:** centralizar as preferências de movimento; manter anúncios estáticos em reduce; disponibilizar pausa para os efeitos autônomos restantes. Se a intenção for rolagem nativa no toque, aplicar de fato essa condição. Considerar mudanças da preferência com a página já aberta.

**Aceite:** em reduced motion, a informação é estável, sem pin ou rolagem animada inesperada; o visitante consegue interromper o movimento decorativo sem perder conteúdo.

### A15 — P2 · O foco de teclado desaparece sobre o verde da área de contato

**Evidência: confirmado nas cores.** O foco global usa #3B5E1A, exatamente a cor do fundo de .visit: contraste de 1:1 para o contorno contra essa superfície. Alguns controles internos têm tratamento próprio, mas links e controles como o e-mail e Copy dependem do foco global. Os controles de pausar a barra têm apenas 28 × 28 px.

**Arquivos:** [main.css:62](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:62), [main.css:165](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:165) e [main.css:695](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:695).

**Possível solução:** usar contorno creme ou dourado nas superfícies verdes e manter verde nas claras. Aumentar a área acionável da pausa para um alvo confortável, aproximadamente 44 px, reservando espaço para ela no ticker.

**Aceite:** o foco é visível em todos os controles do início ao rodapé, e o anúncio não passa por trás da pausa em telas estreitas. Os valores citados são cálculos de cor, não uma certificação de conformidade.

### A16 — P2 · As âncoras mudam a tela, mas não orientam o foco

**Evidência: confirmado no código.** O tratamento de âncoras faz rolagem e replaceState, sem mover o foco para o destino. O cabeçalho também pode ser escondido durante a navegação, sem uma exceção para foco de teclado. replaceState substitui o estado atual em vez de criar uma sequência de visitas entre seções.

**Arquivo:** [ui.js:48](C:/Users/Ithalo/Desktop/escola/entregas/site/src/ui.js:48) e [ui.js:91](C:/Users/Ithalo/Desktop/escola/entregas/site/src/ui.js:91).

**Possível solução:** após uma navegação deliberada, levar o foco ao título de destino com uma estratégia apropriada de tabindex; manter o cabeçalho visível quando contiver foco. Definir se Voltar deve recuperar a seção anterior e implementar essa decisão de forma consistente.

**Aceite:** ao usar um atalho, o próximo Tab parte de uma posição compreensível na seção de chegada. O link direto #visit chegou à área de contato no teste; não foi classificado como quebrado.

### A17 — P2 · O manifesto tem legibilidade reduzida como efeito de entrada

**Evidência: confirmado no código.** A mensagem principal começa com palavras em opacidade 0,15 e ganha contraste conforme a rolagem. Parte da apresentação da proposta fica deliberadamente difícil de ler até o usuário percorrer o efeito.

**Arquivo:** [sections.js:62](C:/Users/Ithalo/Desktop/escola/entregas/site/src/sections.js:62).

**Possível solução:** manter o texto em contraste legível e animar o sublinhado, uma cor secundária ou um destaque decorativo. A leitura da proposta não deve depender do avanço da rolagem.

**Aceite:** a pessoa pode parar em qualquer ponto da entrada da seção e ler a frase completa sem esforço.

## 4. Achados de organização, conteúdo e confiança

### A18 — P2 · A página é longa e a apresentação humana chega tarde

**Evidência: medição e recomendação de design.** Em 1440 × 1000, o documento tinha aproximadamente 17,1 mil px. A fundadora aparecia por volta de 13,6 mil px e o contato, perto de 16,2 mil px. O site apresenta percursos, manifesto, perfis, oito diferenciais, rotina, comparador, mentoria, onze matérias, números e escassez antes da apresentação principal da pessoa responsável.

**Arquivos:** [index.html](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html), [main.css:296](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:296) e [sections.js:240](C:/Users/Ithalo/Desktop/escola/entregas/site/src/sections.js:240).

**Possível solução:** antecipar um retrato compacto com nome e papel da fundadora, após a abertura ou os percursos. Consolidar informações repetidas; resumir diferenciais e currículo; tornar os detalhes opcionais. Manter CTA acessível sem exigir o percurso completo.

**Aceite:** nas primeiras telas, uma família identifica o que é o programa, para quem ele serve, quem o conduz e como começar. Avaliar a ordem por tarefas reais, sem usar somente redução de pixels como medida de qualidade.

### A19 — P1 · The Hatch tem presença visual, mas pouca explicação operacional

**Evidência: lacuna confirmada no conteúdo.** The Hatch tem cartão, faixa etária e um pequeno parágrafo, mas a programação detalhada é explicitamente de The Studio. Faltam respostas específicas sobre rotina dos pequenos, descanso, adaptação, autonomia, horários, participação em saídas e quais diferenciais se aplicam a cada grupo.

O adendo do plano registra justamente a necessidade de obter esses dados. As páginas próprias de The Hatch e The Studio, sugeridas no plano, não existem nesta implementação. Isso é uma diferença entre plano e entrega, não uma prova de que páginas separadas sejam obrigatórias.

**Arquivos:** [index.html:167](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:167), [index.html:378](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:378), [index.html:547](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:547) e [preparacao-entrepreneurs-at-play.md:603](C:/Users/Ithalo/Desktop/escola/entregas/site/preparacao-entrepreneurs-at-play.md:603).

**Possível solução:** obter o conteúdo da responsável e criar um resumo por percurso, com rotina, proposta e FAQ específicos. Pode ser feito por páginas próprias ou seções claras. Marcar os diferenciais como Hatch, Studio ou ambos. Não inventar uma rotina para preencher a lacuna.

**Aceite:** pais de uma criança de 2–6 anos conseguem avaliar a experiência sem extrapolar o exemplo de uma criança de 7–12 anos. O addendum confirma a alteração do escopo para 2–12; o antigo trecho 2–11 do plano não deve ser tratado isoladamente como regra atual.

### A20 — P2 · As informações que permitem planejar uma visita são insuficientes

**Evidência: confirmado na interface.** Localização é apenas Omaha area; preço é encaminhado para e-mail; a licença pendente aparece no FAQ. Há convite para visitar e um seletor de semanas, mas a pessoa ainda não tem informação suficiente para avaliar deslocamento, orçamento e estágio de preparação.

**Arquivos:** [index.html:548](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:548), [index.html:562](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:562) e [preparacao-entrepreneurs-at-play.md:603](C:/Users/Ithalo/Desktop/escola/entregas/site/preparacao-entrepreneurs-at-play.md:603).

**Possível solução:** criar um bloco curto de informações práticas com os dados confirmados. Se endereço e valores ainda não puderem ser publicados, explicar o que será informado e em qual etapa. Exibir de forma clara que a abertura está prevista e que o status informado é de licença pendente. Não publicar um endereço privado para completar o layout.

**Aceite:** o visitante entende o que já está definido e o que depende de confirmação. A opção de não divulgar preço pode ser mantida, mas deve vir com um caminho claro para obter a informação. Este é um achado de comunicação, não uma avaliação jurídica do programa.

### A21 — P2 · A seção de números precisa explicar e sustentar suas afirmações

**Evidência: confirmado no conteúdo.** A seção usa 1:2,5, onze princípios e mais de quatrocentos estudos atribuídos a Brookings, 2026, sem links para consultar essas bases. O 1:2,5 decorre de dois adultos para cinco crianças, enquanto o plano também prevê possibilidade de crescimento até doze. A página não delimita claramente essa relação à fase inicial.

**Arquivos:** [index.html:452](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:452), [sections.js:342](C:/Users/Ithalo/Desktop/escola/entregas/site/src/sections.js:342) e [preparacao-entrepreneurs-at-play.md:16](C:/Users/Ithalo/Desktop/escola/entregas/site/preparacao-entrepreneurs-at-play.md:16).

**Possível solução:** explicar a razão adulto/criança e a fase a que se aplica; acrescentar referências verificáveis para os números e uma explicação curta de como orientam o programa. Confirmar com a responsável as políticas e credenciais antes de apresentar afirmações como fatos públicos.

Para leitura acessível, preservar o número final em texto semântico: atualmente os contadores são zerados antes de entrar na tela e, no snapshot inicial, apareciam como 0 ou 0,0.

**Aceite:** cada estatística tem contexto e fonte, e uma leitura sem acompanhar a animação recebe o valor final. A auditoria não verificou se as afirmações científicas são verdadeiras; identificou falta de acesso à comprovação.

### A22 — P2 · Datas de visita e mensagens de disponibilidade exigem manutenção manual

**Evidência: confirmado no HTML.** As semanas do formulário são uma lista fixa entre novembro e dezembro, sem ano explícito. Abertura, selo, capacidade inicial e copyright também estão espalhados pelo HTML. Em 04/11/2026, as semanas listadas ainda são futuras; não foram classificadas como vencidas.

**Arquivos:** [index.html:85](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:85), [index.html:143](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:143), [index.html:578](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:578) e [index.html:609](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:609).

**Possível solução:** centralizar as datas e a disponibilidade em uma fonte de configuração. Retirar semanas passadas automaticamente ou usar uma solicitação de preferência sem aparência de agenda disponível. Mostrar o ano e explicar que uma semana preferida ainda precisa ser confirmada.

**Aceite:** após a passagem do tempo, não são oferecidas semanas vencidas nem mantidas mensagens incompatíveis com o estágio real de abertura. Mudanças de data não exigem procurar textos soltos em vários blocos.

## 5. Robustez, publicação e refinamento visual

### A23 — P2 · Uma falha de inicialização pode deixar a página coberta ou vazia

**Evidência: confirmado no código; falha de rede não foi simulada.** O HTML adiciona a classe js antes de o módulo principal iniciar. Essa classe ativa o loader e oculta os elementos data-reveal. Se o módulo falhar, não há um mecanismo independente que devolva o conteúdo. As seções aguardam document.fonts.ready, mas o loader pode prosseguir por timeout, criando dependência de ordem entre fontes, efeitos e medição.

**Arquivos:** [index.html:21](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:21), [main.css:121](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:121), [main.css:744](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:744), [main.js:36](C:/Users/Ithalo/Desktop/escola/entregas/site/src/main.js:36) e [loader.js:21](C:/Users/Ithalo/Desktop/escola/entregas/site/src/loader.js:21).

**Possível solução:** manter o conteúdo visível como padrão e aplicar o estado oculto apenas quando o efeito estiver pronto. Oferecer saída de emergência do loader e um caminho simples para ignorá-lo. Sincronizar a inicialização sem depender indefinidamente das fontes externas.

**Aceite:** falha do módulo, fontes bloqueadas ou rede lenta não impedem acesso a serviços e contato. O comentário HARD_CAP de 3,2 segundos não deve ser tratado como garantia do tempo total, porque a saída do loader também tem duração.

### A24 — P2 · A preparação para compartilhamento, indexação e erro 404 está incompleta

**Evidência: confirmado nos arquivos.** Há imagem Open Graph JPG existente, o que é positivo, mas sua referência é relativa. Não há canonical, og:url, sitemap.xml, robots.txt ou página 404 própria entre os arquivos inspecionados. Isso não prova um erro de hospedagem; faltam definições explícitas no projeto.

**Arquivos:** [index.html:12](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:12), [vite.config.js](C:/Users/Ithalo/Desktop/escola/entregas/site/vite.config.js) e [public](C:/Users/Ithalo/Desktop/escola/entregas/site/public).

**Possível solução:** definir o domínio final, usar URL absoluta para a imagem social, configurar canonical e og:url, e gerar sitemap conforme as páginas realmente publicadas. Criar uma experiência 404 com retorno útil. Se forem criadas páginas por percurso, incluir seus metadados próprios.

**Aceite:** validar a prévia social e uma URL inexistente na implantação de teste, além de conferir que os metadados apontam para o domínio correto. Não foi testada uma prévia de rede social ou uma implantação publicada nesta análise.

### A25 — P3 · A decoração disputa atenção com a leitura e com a identidade principal

**Evidência: recomendação de design.** Há quadriculado em quase toda a página, grão, linha de crescimento, folhas, sublinhados, brinquedos 3D, selo giratório, números animados, cartões que viram e conversa digitada. Individualmente, os recursos têm relação com a marca; em conjunto, a página oferece poucos momentos de descanso.

No topo e no loader, a marca FamilyCoachMD tem presença forte, enquanto o programa possui seu próprio nome. A relação de marca-mãe é explicada, mas pode ser mais rápida de entender. O cursor decorativo também chega a exibir drag sobre o botão de história da foto, cobrindo parte do controle com um círculo maior.

**Arquivos:** [main.css:21](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:21), [main.css:133](C:/Users/Ithalo/Desktop/escola/entregas/site/src/styles/main.css:133), [index.html:92](C:/Users/Ithalo/Desktop/escola/entregas/site/index.html:92), [ui.js:118](C:/Users/Ithalo/Desktop/escola/entregas/site/src/ui.js:118) e [hero-toys.js](C:/Users/Ithalo/Desktop/escola/entregas/site/src/hero-toys.js).

**Possível solução:** escolher um ou dois efeitos protagonistas e simplificar os demais. Suavizar ou retirar o grid em áreas densas, reduzir o grão e manter o cursor nativo sobre controles. Testar uma imagem humana/atividade real como apoio à abertura. Tornar Entrepreneurs at Play a identificação imediata, com a marca-mãe como endosso claro.

**Aceite:** na primeira leitura, a proposta e a ação principal recebem mais atenção que os efeitos. Comparar alternativas com pais, sem pressupor que remover toda a personalidade visual seja a solução.

### A26 — P2 · O fallback de Copy orienta uma ação que não foi preparada

**Evidência: confirmado no código; falha de clipboard não foi forçada.** Se navigator.clipboard.writeText falhar, o botão mostra Press Ctrl+C. Entretanto, o código não seleciona o endereço e não oferece outro mecanismo de cópia. A instrução pode copiar uma seleção anterior ou não copiar nada; também não corresponde à interação de um celular.

**Arquivo:** [ui.js:186](C:/Users/Ithalo/Desktop/escola/entregas/site/src/ui.js:186).

**Possível solução:** manter o e-mail selecionável, oferecer um campo próprio para seleção manual ou explicar que a cópia automática falhou. No celular, usar uma instrução compatível com toque. O link mailto já existente deve continuar disponível.

**Aceite:** uma falha de permissão não gera instrução enganosa; a pessoa ainda consegue obter o endereço com os controles normais do dispositivo.

## 6. Ordem sugerida para resolver

| Etapa | Achados | Resultado esperado |
|---|---|---|
| 1. Legibilidade e acesso | A01–A05 | Cartões legíveis, abertura sem corte e navegação utilizável em telas pequenas. |
| 2. Estado e contato | A06–A08 | Perfis estáveis, idade consistente e confirmação honesta da solicitação. |
| 3. Interações e acessibilidade | A09–A17 | Transições responsivas, estados coerentes e conteúdo disponível sem depender de hover ou animação. |
| 4. Conteúdo para decidir | A18–A22 | Informações por faixa etária, contexto dos números e dados práticos claros. |
| 5. Robustez e acabamento | A23–A26 | Fallbacks, publicação, hierarquia visual e contato manual confiáveis. |

Uma ordem de página mais direta para testar:

1. Abertura: o que é EP, para quem, onde, previsão de início e ação principal.
2. The Hatch e The Studio: diferenças e acesso aos detalhes adequados à idade.
3. Fundadora e equipe: apresentação humana curta, responsabilidades e credenciais confirmadas.
4. Rotina e diferenciais: exemplos por percurso, com leitura estática disponível.
5. Informações práticas: funcionamento, disponibilidade, localização e como obter valores.
6. FAQ e solicitação de visita.

Currículo completo, histórias das fotos e efeitos lúdicos podem permanecer como detalhes complementares. O visitante não precisa descobrir todos para compreender o programa.

## 7. Verificação dos fluxos

Foi aplicada a [skill de verificação](C:/Users/Ithalo/.codex/plugins/cache/openai-curated-remote/vercel/0.54.1/skills/verification/SKILL.md) ao fluxo central: uma família conhece o programa, identifica o percurso pela idade e solicita uma visita.

| Fronteira | Estado | Evidência |
|---|---|---|
| Servidor → página | Funcionou | Vite informou ready; a página foi aberta e inspecionada no navegador. |
| Página → seleção do percurso | Parcial | Slider e CTA respondem, mas foram reproduzidos os estados divergentes de A07. |
| Perfil do aluno → detalhe | Parcial | Abertura normal funciona; sequência rápida reproduziu A06. |
| Formulário → validação | Funcionou no teste vazio | Campos inválidos foram marcados e o foco foi levado ao primeiro; apareceu a mensagem de preenchimento. |
| Formulário → serviço de recebimento | Não configurado | data-endpoint ausente; o código segue para mailto. Esta foi a primeira fronteira quebrada do envio. |
| Serviço → recebimento/retorno | Não verificado | Nenhuma submissão válida foi realizada; não há evidência de entrega. |
| Retorno → confirmação visual | Incorreto no fallback | O código mostra Request sent mesmo após apenas abrir mailto. |

### O que também funcionou

- Carrossel responde ao controle Next e permite rolagem horizontal.
- Cartão da foto vira ao acionar o botão; sua legibilidade precisa da correção A01.
- O comparador responde ao teclado; Home levou a posição visual e o input a 0%.
- FAQ abriu a resposta consultada.
- O acesso direto a #visit chegou à seção.
- Não foram registrados avisos ou erros de console nas consultas da aba local.
- As imagens globais têm height: auto e as molduras principais usam proporções.
- O Three.js é separado do JavaScript principal; o renderer evita desenhar quando seu palco está fora da tela ou a aba está oculta.

### Build

npm run build concluiu com sucesso. Tamanhos informados pelo Vite:

| Artefato | Bruto | Gzip |
|---|---:|---:|
| HTML | 76,81 kB | 23,06 kB |
| CSS | 40,94 kB | 9,72 kB |
| JavaScript principal | 191,87 kB | 72,94 kB |
| Chunk dos brinquedos/Three.js | 510,20 kB | 131,62 kB |

Esses valores não são medições de tempo de carregamento. O chunk 3D é solicitado automaticamente após a abertura em dispositivos compatíveis. Reduzir efeitos e fontes pode ser avaliado, mas não foi demonstrado um problema de velocidade em hardware ou rede representativos.

## 8. Critérios para uma próxima revisão

- Repetir os cenários pequenos, incluindo 320 px de largura e 375/640 px de altura.
- Testar menu com Tab, Shift+Tab, Escape e rolagem em orientação horizontal.
- Repetir cliques rápidos nos perfis e nos controles de expansão.
- Confirmar sincronização de idade, percurso, recomendação e formulário, inclusive após recarregar.
- Testar mudança de breakpoint sem reload e rotação em aparelho real.
- Verificar reduced motion, leitura completa da programação e nomes dos cartões com leitor de tela.
- Testar sucesso, falha, demora e duplicidade do envio em ambiente de teste; conferir recebimento antes de considerar o fluxo concluído.
- Validar dados de The Hatch, informação prática e referências com a responsável.
- Conferir metadados e página 404 no domínio de teste.

O código de funcionamento do site não foi alterado nesta auditoria. O build regenerou dist, que está ignorada pelo Git; a entrega editorial é este arquivo Markdown.
