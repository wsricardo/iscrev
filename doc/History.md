# História Técnica e Conceitual do iScrev Notes

> **Propósito:** Documentar a jornada de desenvolvimento do iScrev Notes, desde sua concepção filosófica e protótipos iniciais até a arquitetura atual e os desafios técnicos superados.

---

## 1. A Filosofia Original: Computação Acolhedora e Local-First

O iScrev Notes nasceu de uma premissa fundamental: criar um **espaço de escrita digital com a alma de um caderno físico**. A visão não era competir com suítes de produtividade complexas, mas oferecer um refúgio digital focado, privado e sem distrações.

Os pilares que guiaram as decisões iniciais foram:

-   **Privacidade Total (Local-First):** Os dados do usuário são seus e devem permanecer em seu dispositivo. A aplicação foi projetada para funcionar inteiramente no navegador, usando `localStorage` (nas fases iniciais) e depois `IndexedDB`, sem a necessidade de contas, login ou servidores na nuvem.
-   **Simplicidade Operacional (Zero Build Step):** O projeto foi deliberadamente construído sem a necessidade de frameworks modernos, transpiladores ou bundlers. O código-fonte é o código de produção, garantindo portabilidade, longevidade e facilidade de manutenção.
-   **Computação Acolhedora:** A interface e a experiência do usuário foram projetadas para serem intuitivas e confortáveis. A identidade visual, inspirada em papel, tinta e tipografia editorial, visa reduzir a fadiga cognitiva e criar um ambiente que convida à reflexão.
-   **Pensamento Híbrido:** Reconhecendo que o pensamento não é linear, a aplicação foi concebida para unificar três modos de expressão em uma única superfície:
    1.  **Texto Estruturado** com Markdown.
    2.  **Fórmulas Matemáticas** com LaTeX.
    3.  **Anotações Manuscritas** com uma caneta SVG.

---

## 2. Fase 1: O Monolito Funcional em Arquivo Único

As primeiras versões do iScrev Notes (ainda chamado "Meu Diário") materializaram a filosofia "zero build step" de forma literal: a aplicação inteira residia em um **único arquivo `diario.html`**. Este arquivo continha o HTML, o CSS em uma tag `<style>` e todo o código JavaScript em uma tag `<script>`.

### 2.1. Arquitetura Inicial

-   **Estrutura:** Um único arquivo HTML.
-   **JavaScript:** Todo o código era encapsulado em uma única **IIFE (Immediately Invoked Function Expression)** para evitar a poluição do escopo global. A organização era feita conceitualmente através de seções numeradas em comentários.
-   **Persistência:** Utilizava exclusivamente o `localStorage` para armazenar todas as entradas do diário em uma única chave (`meu_diario_v2`), como um array de objetos `Entry` serializado em JSON.
-   **Dependências:** As únicas dependências externas eram o Google Fonts e a biblioteca KaTeX (para LaTeX), ambas carregadas via CDN. O KaTeX era carregado de forma **síncrona** para garantir que `window.katex` estivesse sempre disponível quando o script principal executasse.

### 2.2. Implementações Notáveis da Fase Inicial

-   **Renderizador Markdown + LaTeX:** O pipeline `mdToHtml(src)` foi uma das primeiras implementações complexas. Ele funcionava em dois passos para garantir a integridade do LaTeX: primeiro, tokenizava a string para separar o texto do código LaTeX e, em seguida, aplicava a renderização apropriada a cada token.
-   **Internacionalização (i18n):** Um dicionário estático `I18N` e uma função `applyLocale()` permitiam a troca de idioma em tempo de execução sem recarregar a página, manipulando diretamente o DOM.

Esta arquitetura monolítica foi extremamente eficaz para a prototipação rápida e a validação das funcionalidades centrais.

---

## 3. Fase 2: Amadurecimento e Superação de Desafios Técnicos

Com o amadurecimento funcional, a simplicidade do monolito começou a revelar seus desafios. Esta fase foi marcada pela resolução de bugs complexos que exigiram um aprofundamento técnico significativo.

### 3.1. O Bug do Paralaxe: O Desafio Central

O bug mais crítico do projeto foi o desalinhamento entre o texto e o fundo de papel pautado durante a rolagem.

-   **Problema:** Ao rolar uma entrada longa, o texto se movia, mas as linhas do caderno ficavam paradas, criando um efeito de paralaxe que quebrava a imersão.
-   **Causa Raiz:** O `background-image` das linhas estava em um contêiner pai do elemento que continha o texto e que possuía a barra de rolagem.
-   **Solução Definitiva:** Após múltiplas tentativas, a solução foi reestruturar o layout para que:
    1.  O elemento `.editor-area` se tornasse o **único** contêiner de rolagem (`overflow-y: auto`).
    2.  O `textarea` (`#entry-raw`) tivesse sua rolagem desativada (`overflow: hidden`) e sua altura ajustada dinamicamente via JavaScript (`autoResizeTextarea`) para corresponder ao seu conteúdo.
    3.  Um novo `div` (`.notebook-bg`), filho direto de `.editor-area`, passasse a conter tanto o `textarea` quanto o `background-image` das linhas.

Dessa forma, texto e fundo passaram a existir no mesmo contexto de rolagem, movendo-se em perfeita sincronia.

### 3.2. A Evolução da Caneta (Módulo `Pen`)

O módulo da caneta foi o componente que mais evoluiu tecnicamente.

-   **Suavização de Traços:** Para criar uma sensação de escrita natural, a função `toPathD(pts)` foi implementada para gerar o atributo `d` do SVG usando **curvas de Bézier quadrática**, com o ponto médio entre dois pontos servindo como âncora.
-   **Otimização de Armazenamento:** Para evitar que as anotações manuscritas consumissem muito espaço no `localStorage`, o algoritmo **Douglas-Peucker** foi implementado na função `simplify(pts)`. Ele reduz o número de pontos de um traço em 60-80% sem perdas visuais significativas, diminuindo drasticamente o tamanho dos dados.
-   **Borracha Geométrica:** A implementação inicial da borracha, baseada em `pointer-events: stroke`, era imprecisa. Foi substituída por um **hit-test geométrico** (`eraserHitTest`), que calcula a distância euclidiana entre o ponteiro e os pontos dos traços, tornando a ação de apagar muito mais robusta e confiável.
-   **Exportação para PDF:** Foi descoberto que o SVG de overlay não funcionava na impressão. A solução foi criar a função `buildPrintSvg()`, que gera um SVG autossuficiente com um `viewBox` calculado a partir do bounding box real de todos os traços.

### 3.3. A Nova Camada de Persistência (`Storage`)

Com o aumento do uso, o limite de 5 MB do `localStorage` tornou-se uma preocupação.

-   **Migração para IndexedDB:** Foi criado o submódulo `Storage`, uma IIFE que abstrai a camada de persistência. Ele oferece uma API baseada em Promises e utiliza **IndexedDB** como backend principal, que oferece muito mais espaço de armazenamento.
-   **Fallback Transparente:** Caso o IndexedDB falhe ou não esteja disponível, o módulo `Storage` recorre automaticamente ao `localStorage`, garantindo que a aplicação continue funcionando.
-   **Migração de Dados:** Uma função `migrateFromLocalStorage()` foi adicionada ao processo de inicialização para mover automaticamente os dados de usuários antigos do `localStorage` para o IndexedDB na primeira execução.

---

## 4. Fase 3: A Expansão para um Ecossistema Web

Nesta fase, o iScrev Notes deixou de ser apenas um editor e se tornou um produto web mais completo, com uma presença institucional.

-   **Separação de Arquivos:** O monolito `diario.html` foi quebrado. A lógica JavaScript foi movida para `src/assets/js/diario.js`, o CSS para `src/assets/css/diario.css`, e módulos auxiliares como `pdf-exporter.js` foram criados.
-   **Páginas Institucionais:** Foram criadas páginas de `sobre`, `contato`, `privacidade` e `suporte`, com seu próprio CSS (`style.css`) e JS (`site-nav.js`).
-   **Recursos de PWA:** Foram adicionados um `manifest.json` e um `service-worker.js` para permitir a instalação do aplicativo e fornecer funcionalidade offline básica.

Apesar da separação de arquivos, a arquitetura de `diario.js` permaneceu como um **"monolito funcional em IIFE"**, concentrando múltiplas responsabilidades e mantendo um alto acoplamento interno.

---

## 5. Fase 4: O Presente e o Futuro — Rumo à Modularização

A arquitetura atual, embora funcional, atingiu seu limite de complexidade sustentável. O alto custo cognitivo para manutenção e o risco de regressões tornaram a modularização o próximo passo técnico inevitável.

### 5.1. O Diagnóstico

A análise aprofundada, consolidada em documentos como `CurrentArchitecture.md` e `ModularizationAnalysis.md`, revelou que `diario.js` acumulava responsabilidades de:
-   Internacionalização (i18n)
-   Renderização (Markdown/LaTeX)
-   Motor da Caneta (`Pen`)
-   Armazenamento (`Storage`)
-   Estado global da aplicação
-   CRUD de entradas
-   Lógica de UI (modais, sidebar, etc.)
-   Orquestração e inicialização

### 5.2. O Plano de Migração

Com base no diagnóstico, foi elaborado um plano de migração incremental para uma **arquitetura baseada em Módulos ECMAScript (ESM)**, detalhado em `GUIDE-Migration.md` e `MigrationPlan.md`. O plano propõe quebrar `diario.js` em módulos coesos, organizados em camadas:

-   `infra/`: Para módulos como `storage.js`.
-   `editor/`: Para o `pen.js` e `markdown.js`.
-   `ui/`: Para `sidebar.js`, `i18n.js`, `toast.js`, etc.
-   `app/`: Para orquestração, com `state.js`, `actions.js` e `bootstrap.js`.
-   `shared/`: Para utilitários puros.

O objetivo é transformar o código em um sistema com baixo acoplamento, alta coesão, dependências explícitas (`import`/`export`) e componentes testáveis, sem abandonar a filosofia "zero build step".

---

## 6. Conclusão: Uma Trajetória de Pragmatismo

A história do iScrev Notes é uma jornada de desenvolvimento pragmático. A arquitetura evoluiu não por modismos, mas em resposta a problemas concretos e desafios reais de usabilidade e engenharia.

Do monolito inicial, que permitiu velocidade e validação, à resolução de bugs complexos que forçaram o aprofundamento técnico, e agora à busca por uma modularização sustentável, cada fase reflete um estágio de maturidade do projeto. A trajetória demonstra um compromisso contínuo com a filosofia original de criar uma ferramenta de escrita que seja, acima de tudo, privada, robusta e acolhedora.