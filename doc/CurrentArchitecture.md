# Resumo da Arquitetura Atual do iScrev Notes

> **Produto:** iScrev Notes  
> **Escopo:** Análise da arquitetura atual, com foco em `src/assets/js/diario.js`.  
> **Fontes:** `doc/doc-tech.md`, `doc/ModularizationAnalysis.md`, `src/assets/js/diario.js`

---

## 1. Visão Geral

O iScrev Notes é uma SPA (*Single-Page Application*) com uma filosofia **local-first**, onde todos os dados do usuário são armazenados no próprio navegador, sem a necessidade de servidores ou contas online. A arquitetura foi deliberadamente mantida simples, seguindo um princípio de **"zero build step"**: o código-fonte é o código de produção, sem a necessidade de transpiladores ou bundlers.

Atualmente, a arquitetura da aplicação principal (`diario.html`) pode ser descrita como um **monolito funcional**. A vasta maioria da lógica está concentrada no arquivo `src/assets/js/diario.js`, que é encapsulado em uma única IIFE (*Immediately Invoked Function Expression*) para evitar a poluição do escopo global. Embora funcional, essa abordagem centraliza múltiplas responsabilidades em um único local.

---

## 2. Estrutura de Diretórios (`src/`)

O diretório `src/` contém todos os arquivos de desenvolvimento da aplicação e das páginas institucionais.

```text
src/
|-- index.html, sobre.html, en.html, about.html -> Páginas institucionais.
|-- diario.html         -> A SPA (Single-Page Application) principal do diário.
|-- assets/
    |-- css/
    |   |-- style.css   -> CSS das páginas institucionais.
    |   `-- diario.css  -> CSS da aplicação do diário.
    `-- js/
        |-- diario.js   -> Núcleo funcional do diário (lógica principal).
        |-- pdf-exporter.js -> Módulo de exportação para PDF paginado.
        |-- site-nav.js -> Lógica de navegação do site institucional.
        `-- ui.js       -> Placeholder para futuros helpers de UI.
```

### Descrição dos Arquivos Principais

-   **`diario.html`**: Define toda a estrutura do DOM da aplicação, incluindo as toolbars, a área de edição, os modais e os overlays. É o ponto de entrada da SPA.
-   **`assets/css/diario.css`**: Contém todo o estilo da aplicação, desde o layout responsivo e os tokens de design (cores, fontes) até a estilização do "papel de caderno" e as regras para impressão.
-   **`assets/js/diario.js`**: O cérebro da aplicação. Um arquivo único que gerencia estado, manipulação de DOM, lógica de negócio e interações do usuário.
-   **`assets/js/pdf-exporter.js`**: Um módulo auxiliar, carregado em `diario.html`, que fornece uma lógica de paginação para exportar entradas (sem traços) para PDF.

---

## 3. Análise de `diario.js`

O arquivo `diario.js` é organizado conceitualmente em seções numeradas através de comentários. Cada seção agrupa uma responsabilidade específica da aplicação.

### Estrutura das Seções

-   **Seção 0 — Internacionalização (i18n)**
    -   Contém o dicionário de traduções `I18N` e as funções `t()` e `applyLocale()` para aplicar o idioma à interface.

-   **Seção 1 — Renderização LaTeX + Markdown**
    -   Responsável por converter o texto puro da entrada em HTML. Inclui as funções `mdToHtml()` e `renderTex()`, que processam Markdown e equações LaTeX (via KaTeX).

-   **Seção 2 — Módulo de Caneta (Pen)**
    -   Um "módulo dentro do módulo", encapsulado em sua própria IIFE. Gerencia toda a lógica de desenho em SVG, incluindo a captura de eventos de ponteiro, suavização de traços (Bézier), simplificação (Douglas-Peucker), borracha e modo de rolagem (pan).

-   **Seção 2.5 — Módulo de Armazenamento (Storage)**
    -   Outro submódulo em uma IIFE que abstrai a persistência de dados. Oferece uma API baseada em Promises para interagir com o IndexedDB, com um fallback transparente para o localStorage.

-   **Seção 3 — Estado e Persistência**
    -   Define as variáveis de estado globais da aplicação (`entries`, `currentId`) e as funções de alto nível para carregar e salvar dados usando o módulo `Storage`.

-   **Seção 4 — Utilitários**
    -   Contém funções auxiliares diversas, como gerador de ID (`uid`), formatadores de data, e helpers para gerenciar o estado da sidebar responsiva.

-   **Seção 5 — Toast**
    -   Lógica para exibir notificações breves (toasts) na parte inferior da tela.

-   **Seção 6 — Sidebar / Lista de Entradas**
    -   Controla a renderização da lista de entradas na barra lateral, incluindo a lógica de busca/filtragem.

-   **Seção 7 — Controle de Modo (edit | pen | preview)**
    -   Gerencia a troca entre os três modos de visualização do editor, orquestrando a visibilidade do `textarea`, do preview renderizado e do overlay da caneta.

-   **Seção 8 — CRUD de Entradas**
    -   Implementa as operações de Criar (`newEntry`), Ler (`openEntry`), Atualizar (`saveEntry`) e Deletar (`deleteEntry`).

-   **Seção 9 — Formatação via Toolbar**
    -   Lógica para os botões de formatação de Markdown (negrito, itálico, etc.), que manipulam o texto no `textarea`.

-   **Seção 10 — Diálogo de Equação LaTeX**
    -   Controla o modal de inserção de equações, incluindo a pré-visualização em tempo real.

-   **Seção 11 — Exportação**
    -   Contém as funções `exportMarkdown()` e `exportPDF()`, que preparam e disparam o download ou a impressão da entrada atual. Inclui também a lógica de importação de arquivos `.md`.

-   **Seção 12 — Auto-Save com Debounce**
    -   Implementa o salvamento automático com um `debounce` para evitar gravações excessivas no banco de dados durante a digitação.

-   **Seção 13 — Tela Cheia (Fullscreen API)**
    -   Gerencia a funcionalidade de tela cheia do navegador.

-   **Seção 14 — Atalhos de Teclado e Fiação de Eventos**
    -   Centraliza a configuração da maioria dos `event listeners` da aplicação, desde atalhos como `Ctrl+S` até os cliques nos botões principais.

-   **Seção 15 — Inicialização**
    -   Orquestra o processo de bootstrap da aplicação: inicializa o `Storage`, migra dados legados se necessário, carrega os dados, inicializa o módulo `Pen` e abre a entrada mais recente.

---

## 4. Pontos Fortes e Fracos da Arquitetura Atual

Esta arquitetura monolítica foi uma escolha pragmática que trouxe benefícios, mas que agora apresenta desafios para a evolução do projeto.

### Pontos Fortes

-   **Simplicidade na Prototipação:** Durante a fase inicial do projeto, ter toda a lógica em um único arquivo permitiu um desenvolvimento rápido e iterativo.
-   **Agilidade Inicial:** Com todo o contexto em um só lugar, a implementação de novas funcionalidades que tocavam em várias partes do sistema era direta.

### Pontos Fracos

-   **Elevado Custo Cognitivo:** O tamanho e a densidade de `diario.js` tornam difícil para um desenvolvedor (novo ou antigo) entender o fluxo completo da aplicação e o impacto de suas alterações.
-   **Alto Risco de Regressões:** O forte acoplamento entre as seções significa que uma mudança em uma parte (ex: `Pen`) pode quebrar inesperadamente outra (ex: `Exportação`).
-   **Dificuldade de Testes:** É praticamente impossível testar uma funcionalidade (como o `Storage`) de forma isolada sem carregar todo o ambiente da aplicação.
-   **Baixo Reuso de Código:** Lógicas úteis (como o `Storage` ou o parser de Markdown) não podem ser facilmente reutilizadas em outras partes do projeto ou em projetos futuros.

---

## 5. Conclusão

A arquitetura atual, centrada em `diario.js`, foi fundamental para que o iScrev Notes atingisse seu estado funcional e rico em recursos. No entanto, ela atingiu seu limite de complexidade sustentável.

A análise revela a necessidade clara de uma refatoração para uma arquitetura modular, conforme detalhado nos documentos `doc/GUIDEModules.md` e `doc/SpecsModule.md`. A migração para módulos ES6 é o próximo passo natural para garantir a manutenibilidade, a segurança e a escalabilidade do projeto a longo prazo.