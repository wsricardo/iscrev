Title: Nova Engine Markdown e Geração de PDF aprimorada
Date: 2026-06-09 19:00
Category: Atualizacoes
Tags: atualizacoes, markdown, pdf, desenvolvimento, arquitetura
Slug: nova-engine-markdown-e-pdf
Author: WSRicardo
Summary: Mais uma atualização arquitetural focada em confiabilidade: desenvolvemos um interpretador Markdown customizado baseado em Máquina de Estados e blindamos a física do papel para a exportação de PDFs de alta fidelidade.
Lang: pt

Continuando o nosso ritmo acelerado de melhorias no iScrev Notes, acabamos de enviar para o ar atualizações que mudam completamente a forma como a aplicação entende o que você digita e como ela transforma isso em um documento exportável.

Se a última atualização focou no [apoio ao projeto e limpeza de código](/blog/updates-09-06-2026.html), esta foca inteiramente na **estabilidade e na experiência de uso durante a escrita e desenho**.

## O Novo Motor Markdown Interno

Até hoje, o iScrev usava um sistema bem simples (baseado em Expressões Regulares) para converter seu texto em negrito, listas e citações. O problema dessa abordagem é que ela era frágil: misturar parágrafos com listas ou citações costumava quebrar a formatação da sua nota.

Para honrar a filosofia "Zero Dependências" (não queríamos inflar o aplicativo instalando plugins de terceiros como o `marked.js`), nós construímos o nosso próprio "State Machine Parser" do zero. 

A nova engine lê o texto linha a linha, memorizando inteligentemente o estado lógico da estrutura. Isso nos trouxe poderes instantâneos:

1. **Tabelas Nativas:** Agora você pode construir tabelas Markdown clássicas. Elas ganharam um envelopamento de CSS próprio, permitindo rolagem horizontal individual caso fiquem muito largas.
2. **Blocos de Código Multilinha:** Usando as três crases (` ``` `), desenvolvedores agora podem armazenar trechos longos de código com a fonte correta e áreas de rolagem independentes.
3. **Listas Indestrutíveis:** Agora você pode quebrar linhas à vontade entre os itens da sua lista sem quebrar a estrutura semântica HTML.

E tudo isso sem comprometer em nada a proteção anti-XSS ou a precisão do nosso motor LaTeX embutido.

## A "Física" do Papel e Exportação Perfeita para PDF

O segundo grande foco foi resolver o temido problema de dessincronização da Caneta (Pen) em telas de tamanhos diferentes.

Antigamente, se você escrevesse algo e usasse a caneta para grifar, e depois movesse o aplicativo para uma janela menor, o texto "encolhia" (sofria *reflow* e quebrava linhas precocemente), mas o SVG da caneta ficava no mesmo lugar. O resultado? Notas e PDFs completamente embaralhados.

Agora nós **endurecemos o papel digital**. 
Quando usado no desktop, o caderno sempre preservará uma proporção cristalizada de tamanho "Sulfite A4" (~800px). Se você espremer a janela, o papel não vai "amassar"; em vez disso, criaremos inteligentemente uma barra de rolagem para você navegar nele. 

Com isso, unimos dois cenários:
- A sua arte e grifos à caneta *nunca* mais irão se desalinhar do texto digitado.
- Ao clicar em "Salvar PDF" (Ctrl+P / Command+P), o navegador sempre irá ler a folha em formato A4, gerando PDFs com uma fidelidade de corte absurda, sem depender de pesados conversores de PDF instalados na máquina.

No **celular**, nós usamos comportamento inteligente: o layout flutua livremente (100%), permitindo leitura e digitação agradáveis de ponta a ponta sem rolagem lateral forçada.

Continuamos evoluindo a arquitetura para garantir que o iScrev seja a mais leve, segura e rápida ferramenta de anotações híbrida que você possa acessar pelo navegador. 

Aproveite as melhorias e sinta-se livre para usar as novas tabelas e blocos de código!
