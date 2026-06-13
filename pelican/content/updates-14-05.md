Title: Atualização de Maio no iScrev Notes: PIX, arquitetura local-first e o próximo salto do diário
Date: 2026-05-14 20:30
Category: Anuncios
Tags: atualizacoes, arquitetura, javascript, local-first, pix, desenvolvimento
Slug: updates-14-05-2026
Author: WSRicardo
Summary: Um panorama mais técnico e humano da fase atual do iScrev Notes: novo fluxo de apoio via PIX, refinamentos de interface, documentação consolidada e os próximos passos para modularizar o núcleo JavaScript do app.
Lang: en

![Ilustração de escrita e concentração em um ambiente acolhedor](/images/AlanaBeatriz-Cafeteria-iScrev.png)

Maio foi um daqueles momentos em que um projeto independente amadurece por dentro e por fora ao mesmo tempo.

Teve melhoria visível, como o ajuste da experiência de apoio ao projeto e o refinamento do modal de PIX dentro do diário. Mas também teve aquele trabalho menos “instagramável” e muito mais importante para o futuro do app: leitura de código, revisão de arquitetura, consolidação de documentação técnica e definição dos próximos passos para modularizar o núcleo do iScrev Notes com mais clareza e segurança.

Se você chegou agora, aqui vai o contexto rápido: o iScrev Notes nasceu para ser um espaço de escrita mais calmo, privado e direto. A ideia nunca foi competir com plataformas inchadas nem depender de conta, feed ou nuvem obrigatória. O objetivo continua sendo o mesmo: entregar um caderno digital local-first em que texto, fórmulas e rabiscos convivem sem atrito.

## De onde o projeto veio e onde ele está agora

O histórico documentado no diretório `doc` mostra com bastante clareza a evolução do iScrev Notes. O projeto começou mais próximo de um experimento single-file, concentrando estrutura, estilo e comportamento em uma base muito mais compacta. Hoje ele já opera em um estágio bem mais maduro:

- o aplicativo principal vive em `src/diario.html`;
- o núcleo funcional está concentrado em `src/assets/js/diario.js`;
- a exportação em PDF foi separada em `src/assets/js/pdf-exporter.js`;
- a página de apoio ganhou lógica própria em `src/assets/js/support.js`;
- a persistência passou a usar `IndexedDB` como armazenamento principal, com fallback para `localStorage`;
- a experiência pública do projeto ganhou páginas institucionais, manifesto, service worker e organização visual mais consistente.

Tecnicamente, o iScrev hoje é uma aplicação web local-first que combina três superfícies de expressão na mesma entrada:

- texto em Markdown leve;
- fórmulas renderizadas com LaTeX;
- traços manuscritos persistidos como dados SVG.

Esse trio é, honestamente, uma das partes mais bonitas do projeto. Não é só recurso por recurso. É uma tentativa de respeitar como a cabeça realmente funciona quando a gente estuda, rascunha, escreve, apaga, reorganiza e pensa ao mesmo tempo.

## O que entrou nesta fase

Uma das mudanças mais importantes foi a reorganização da página de apoio para refletir a fase real do projeto, sem prometer fluxo que ainda não existe. Em vez de manter uma camada híbrida e confusa, a página `support.html` foi ajustada para operar unicamente com apoio via PIX, em BRL, com conteúdo em português e inglês deixando claro que opções internacionais serão implementadas futuramente.

Além disso, o próprio modal de apoio dentro do diário foi refinado para conversar melhor com a identidade visual do app. O bloco da chave PIX recebeu um tratamento visual mais alinhado à linguagem de papel, tinta e ferrugem que o site já usa, com tipografia monoespaçada, botão de cópia mais legível e um fluxo mais honesto: copiar, conferir e transferir com calma, sem interromper a sessão atual do usuário.

Do ponto de vista de implementação, isso significou simplificar o caminho de apoio e reduzir ruído na interface. Em vez de tentar simular uma plataforma de pagamentos mais complexa do que a fase atual comporta, o projeto assumiu uma solução pequena, prática e coerente com a sua proposta de leveza.

![Ilustração de continuidade, horizonte e construção de longo prazo](/images/AlanaBeatriz-praia.png)

## O que a análise técnica revelou

Nesta etapa também houve uma leitura mais profunda do estado atual do código, cruzando o que existe em `src` com a documentação antiga e com a documentação consolidada mais recente. O resultado foi importante porque mostrou, com mais precisão, que o iScrev Notes já não está naquela fase de “app simples de um arquivo só”, mas também ainda não chegou ao ponto ideal de modularização explícita.

Hoje o projeto vive em uma zona híbrida bem interessante:

- o HTML principal já carrega scripts com `type="module"`;
- o app usa APIs modernas como `IndexedDB`, `Promise`, `FileReader`, `Blob`, `URL.createObjectURL`, `Service Worker`, `Cache API`, `Fullscreen API` e `navigator.clipboard`;
- ao mesmo tempo, `diario.js` ainda concentra muita responsabilidade dentro de um arquivo grande, com estrutura em IIFE e forte acoplamento ao DOM.

Na prática, `src/assets/js/diario.js` acumula quase tudo:

- internacionalização do diário;
- renderização de Markdown e LaTeX;
- lógica da caneta e dos traços;
- camada de armazenamento;
- estado global da aplicação;
- CRUD das entradas;
- importação e exportação;
- atalhos e eventos;
- shell responsiva;
- inicialização geral do app.

Isso não é “errado” no sentido dramático da palavra. Na verdade, foi uma estratégia eficiente para acelerar a evolução funcional do projeto. Só que agora o custo de manutenção começa a aparecer com mais clareza. Ler, testar, alterar e garantir que uma mudança não afete outra parte do fluxo exige mais atenção do que deveria.

Durante a revisão, alguns pontos de dívida técnica ficaram especialmente evidentes:

- o bootstrap do diário ainda carrega vestígios de inicialização duplicada;
- o projeto convive hoje com estratégias diferentes de internacionalização entre o diário, a página support e as páginas institucionais;
- alguns caminhos ainda mantêm chamadas e convenções legadas que merecem refatoração cuidadosa.

A boa notícia é que isso foi documentado com bastante detalhe. O conteúdo consolidado em `DOCUMENTACAO-v2-codex.md` e o guia `GUIDEModules.md` abriram um mapa mais claro para o próximo ciclo de evolução. E isso ajuda muito, porque projeto independente não cresce só com inspiração: cresce com diagnóstico técnico honesto.

## O próximo salto: modularizar sem perder a alma

O passo técnico mais importante daqui para frente é reorganizar o núcleo do diário em módulos menores e com fronteiras mais explícitas.

A direção já está relativamente clara:

- extrair a camada de armazenamento para um módulo próprio;
- isolar o módulo da caneta e seus contratos;
- separar internacionalização, UI e ações de alto nível;
- reduzir o acoplamento entre DOM, estado e regras do editor;
- preparar o terreno para uma migração progressiva para ECMAScript Modules de forma mais real e menos cosmética.

Traduzindo para um português bem direto: a ideia não é “enfeitar” o código com moda de arquitetura. A ideia é deixar o iScrev Notes mais fácil de manter, mais seguro para evoluir e mais robusto para receber novos recursos sem virar um labirinto.

Também houve avanço importante na documentação do próprio projeto. Isso inclui organização de material técnico, leitura da evolução histórica do código e registro de recomendações de manutenção, riscos e refatoração. Esse tipo de trabalho às vezes passa despercebido para quem olha só a interface, mas é exatamente o que permite que um software continue vivo daqui a seis meses, um ano, dois anos.

## Por que isso importa para quem usa

Se você usa o iScrev Notes para escrever, estudar, planejar aula, montar raciocínio matemático, fazer diário ou simplesmente organizar ideias, esse tipo de melhoria faz diferença de verdade.

Quando a base técnica fica mais clara:

- o app tende a quebrar menos;
- novos recursos entram com menos risco;
- a experiência fica mais consistente entre páginas e modos de uso;
- a manutenção deixa de ser um improviso permanente e passa a ser uma construção intencional.

Em outras palavras: esse ciclo não foi só sobre “uma página nova” ou “um botão mais bonito”. Foi sobre preparar o iScrev Notes para continuar crescendo sem perder o que o torna especial.

![Ilustração de energia, rotina e disciplina no processo criativo](/images/AlanaBeatriz-saude-academia.png)

## Quem está por trás do projeto

O iScrev Notes é criado e mantido por **Wandeson Ricardo**, programador brasileiro autodidata, que vem desenvolvendo o projeto com uma mistura muito boa de teimosia, cuidado e vontade real de construir ferramentas mais humanas.

Se você quiser acompanhar mais de perto:

- GitHub do autor: [github.com/wsricardo](https://github.com/wsricardo)
- repositório do projeto no GitHub: [github.com/wsricardo/iscrev](https://github.com/wsricardo/iscrev)
- perfil e site pessoal: [www.wsricardo.com.br](https://www.wsricardo.com.br)
- blog pessoal: [wsricardo.blogspot.com](https://wsricardo.blogspot.com)

## Acompanhe, use e ajude a divulgar

Se o iScrev Notes faz sentido para você, há algumas formas muito valiosas de apoiar o projeto:

- usar o app e acompanhar as próximas atualizações;
- compartilhar o site com amigos, estudantes, professores, pesquisadores e pessoas que gostam de escrever;
- divulgar o projeto nas redes, em grupos e em comunidades que valorizem software leve, web aberta e privacidade;
- e, para quem estiver no Brasil, considerar um apoio pela [página de apoio](/support.html).

Projeto independente cresce muito na base da confiança e da circulação. Se você gostou da proposta, fique por perto. Tem bastante coisa boa sendo construída aqui, com calma, com estudo e com vontade de fazer o iScrev Notes durar.
