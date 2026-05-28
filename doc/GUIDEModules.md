# Guia para a Migração à Arquitetura Modular (ESM)

> **Propósito:** Orientar a refatoração do núcleo do iScrev Notes, saindo de um arquivo monolítico (`diario.js`) para uma arquitetura baseada em Módulos ECMAScript (ESM).

---

## 1. Introdução e Justificativa

O iScrev Notes atingiu um estado de maturidade funcional notável. No entanto, sua arquitetura atual, centrada em um único arquivo JavaScript (`diario.js`) encapsulado em uma IIFE, atingiu o limite de sua complexidade sustentável. Este modelo, embora eficaz para a prototipação rápida, agora apresenta desafios significativos para a manutenção, evolução e teste do projeto.

A migração para uma arquitetura modular com **ES Modules (ESM)** é o próximo passo técnico crucial. O objetivo não é adotar uma nova tecnologia por modismo, mas sim resolver problemas concretos:

*   **Reduzir o Custo Cognitivo:** Facilitar o entendimento do código, permitindo que desenvolvedores foquem em uma parte do sistema de cada vez.
*   **Aumentar a Manutenibilidade:** Isolar responsabilidades, de modo que a alteração em um módulo (ex: `storage`) não quebre inesperadamente outro (ex: `pen`).
*   **Minimizar Riscos de Regressão:** Criar contratos claros (APIs) entre os módulos.
*   **Habilitar Testes Unitários:** Permitir o teste de funcionalidades de forma isolada.
*   **Preparar para o Futuro:** Criar uma base sólida e escalável para a implementação de novos recursos complexos, como suporte a imagens, gráficos, formatos como ODT e melhorias no pipeline do LaTeX.

Este documento serve como um espaço de discussão para a estruturação desses novos módulos.

---

## 2. Diagnóstico da Arquitetura Atual

A análise dos documentos (`CurrentArchitecture.md`, `DOCUMENTACAO-v2-codex.md`) e do próprio `diario.js` revela um padrão claro:

*   **Monólito Funcional:** O arquivo `diario.js` concentra múltiplas responsabilidades distintas:
    *   Gerenciamento de estado global (`entries`, `currentId`).
    *   Manipulação direta e massiva do DOM.
    *   Lógica de negócio (Caneta, Armazenamento, Renderização).
    *   Controle da interface do usuário (modais, toolbars, sidebar).
    *   Orquestração do ciclo de vida da aplicação.
*   **Alto Acoplamento:** As seções conceituais dentro do arquivo são fortemente acopladas. A lógica de renderização está misturada com a de salvamento, e o estado da caneta está diretamente ligado à manipulação do DOM principal.
*   **Dificuldade de Reuso:** Lógicas valiosas, como o módulo `Storage` ou o parser de Markdown, não podem ser facilmente reutilizadas em outras partes do projeto.

Essa estrutura foi fundamental para o projeto nascer, mas agora se tornou um gargalo para seu crescimento.

---

## 3. Proposta de Arquitetura Modular

A proposta é quebrar o `diario.js` em módulos coesos e com baixo acoplamento, utilizando a sintaxe nativa `import`/`export` do JavaScript.

### 3.1 Estrutura de Módulos Sugerida

Abaixo, uma possível organização dos novos arquivos dentro de `src/assets/js/modules/`:

*   **`main.js` (Ponto de Entrada)**
    *   **Responsabilidade:** Orquestrar a inicialização da aplicação. Importa os outros módulos, inicializa-os na ordem correta (ex: `Storage` primeiro, depois `Editor`) e conecta os eventos entre eles. Substituirá o bloco de inicialização no final do `diario.js`.

*   **`storage.js` (Camada de Infraestrutura)**
    *   **Responsabilidade:** Abstrair toda a persistência de dados. Conterá a lógica do IndexedDB com fallback para localStorage.
    *   **API Pública (Exemplo):** `init()`, `getAllEntries()`, `putEntry(entry)`, `removeEntry(id)`.

*   **`pen.js` (Camada de Domínio/UI)**
    *   **Responsabilidade:** Gerenciar toda a funcionalidade da caneta SVG: captura de eventos, desenho, suavização, simplificação (Douglas-Peucker), borracha e modo *pan*.
    *   **API Pública (Exemplo):** `init(svgElement)`, `loadStrokes(strokes)`, `getStrokes()`, `clear()`, `setTool(tool)`.

*   **`renderer.js` (Camada de Domínio)**
    *   **Responsabilidade:** Converter o texto bruto (Markdown + LaTeX) em HTML.
    *   **API Pública (Exemplo):** `mdToHtml(markdownString)`.

*   **`editor.js` (Camada de Aplicação/Estado)**
    *   **Responsabilidade:** Gerenciar o estado e a lógica da entrada ativa. Controla `currentId`, os modos (`edit`, `pen`, `preview`), o conteúdo do `textarea` e dispara o salvamento.
    *   **API Pública (Exemplo):** `openEntry(id)`, `newEntry()`, `saveCurrentEntry()`, `setMode(mode)`.

*   **`shell.js` (Camada de UI)**
    *   **Responsabilidade:** Controlar os elementos da interface "casca" da aplicação, que não estão diretamente ligados ao conteúdo da entrada. Isso inclui a sidebar, toolbars, modais (exceto os de conteúdo, como o de equação), e toasts.
    *   **API Pública (Exemplo):** `init()`, `toggleSidebar(open)`, `showToast(message)`.

*   **`i18n.js` (Camada de Infraestrutura/UI)**
    *   **Responsabilidade:** Gerenciar a internacionalização.
    *   **API Pública (Exemplo):** `t(key)`, `applyLocale(lang)`.

*   **`exporter.js` (Camada de Aplicação)**
    *   **Responsabilidade:** Lógica de exportação para Markdown e PDF.
    *   **API Pública (Exemplo):** `exportToMarkdown(entry)`, `exportToPdf(entry)`.

---

## 4. Estratégia de Refatoração Gradual

A migração não precisa ser um "big bang". Uma abordagem gradual e controlada é mais segura:

1.  **Preparar o Terreno:** Criar a nova estrutura de diretórios e o `main.js`. Alterar `diario.html` para carregar `main.js` como `type="module"`.
2.  **Extrair Módulos Puros:** Começar pelos módulos com menos dependências do DOM, como `storage.js` e `i18n.js`. Eles podem ser extraídos do `diario.js` quase que diretamente.
3.  **Isolar a `Pen`:** O módulo da caneta já é uma IIFE, o que facilita sua conversão para um módulo ES6 em `pen.js`.
4.  **Desconstruir o Restante:** Mover gradualmente as funções de `diario.js` para os novos módulos (`editor.js`, `shell.js`, `renderer.js`), substituindo as chamadas diretas por chamadas à API dos módulos.
5.  **Finalizar:** Uma vez que `diario.js` esteja vazio, ele pode ser removido com segurança.

---

## 5. Um Ambiente Robusto para o Futuro

Esta nova arquitetura não apenas resolve problemas atuais, mas também cria um ambiente mais confortável e robusto para o desenvolvimento, seja para escrita de um romance ou para a elaboração de um manuscrito técnico.

Com módulos bem definidos, a implementação de novas *features* se torna mais clara:

*   **Suporte a Imagens:** Um novo módulo `images.js` poderia gerenciar a inserção, o armazenamento no `storage` (como Data URL) e a renderização, sendo orquestrado pelo `editor.js` e `renderer.js` sem impactar os outros módulos.
*   **Formatos como Opendocument (ODT):** O `exporter.js` e um novo `importer.js` podem ser estendidos com bibliotecas de terceiros para suportar novos formatos, mantendo o núcleo do editor intacto.
*   **Geração de Gráficos:** Um módulo `charts.js` pode ser introduzido para permitir a criação e inserção de gráficos (ex: usando uma biblioteca como Chart.js ou D3), tratando-os como um tipo especial de bloco no `renderer.js`.
*   **Melhorias no LaTeX:** O `renderer.js` pode ser aprimorado com novas macros ou até mesmo substituído por um pipeline de renderização mais poderoso, sem exigir uma reescrita completa da aplicação.

---

## 6. Conclusão

A migração para uma arquitetura modular é um investimento estratégico na longevidade e na qualidade do iScrev Notes. Ela transformará a base de código de um bloco denso e acoplado para um ecossistema de componentes colaborativos e bem definidos.

Essa mudança não apenas facilitará a manutenção, mas também reacenderá o potencial de inovação do projeto, permitindo que ele cresça de forma sustentável para se tornar uma ferramenta de pensamento e escrita ainda mais poderosa, flexível e, acima de tudo, acolhedora.