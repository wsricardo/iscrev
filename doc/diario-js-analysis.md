# Análise Estruturada de `diario.js`

> **Produto:** iScrev Notes  
> **Escopo:** Análise funcional e plano de migração para cada seção de `src/assets/js/diario.js`.  
> **Fontes:** `diario.js`, `MigrationPlan.md`, `10-modular-api-contracts.md`

---

## Introdução

Este documento fornece um resumo técnico detalhado de cada seção do arquivo monolítico `diario.js`. Para cada seção, descrevemos suas funções, parâmetros de entrada/saída e o plano de migração correspondente para a nova arquitetura modular, conforme o `MigrationPlan.md`.

---

## Seção 0 — Internacionalização (i18n)

### Análise da Seção

Esta seção gerencia a tradução da interface do usuário. Ela contém um dicionário estático e funções para aplicar o idioma selecionado aos elementos do DOM.

*   **Funções e Variáveis:**
    *   `I18N` (Objeto): Dicionário estático que armazena as strings de tradução para os idiomas 'pt' e 'en'.
    *   `currentLang` (Variável): Armazena o idioma ativo ('pt' ou 'en'), persistido no `localStorage`.
    *   `t(key)`:
        *   **Papel:** Retorna a string traduzida para uma chave específica.
        *   **Entrada:** `key` (string) - A chave de tradução (ex: 'btn.new').
        *   **Saída:** `string` - O texto traduzido no idioma atual, com fallback para português e, por fim, para a própria chave.
    *   `applyLocale(lang)`:
        *   **Papel:** Atualiza todos os textos da interface do usuário para o idioma selecionado.
        *   **Entrada:** `lang` (string) - O idioma a ser aplicado ('pt' ou 'en').
        *   **Saída:** `void` - Modifica diretamente o `textContent`, `innerHTML`, `placeholder` ou `title` de múltiplos elementos do DOM.

### Plano de Migração

Conforme a **Fase 3** do `MigrationPlan.md`, esta seção será extraída para o módulo `ui/i18n.js`.

*   **Objetivo:** Isolar a lógica de tradução em um módulo de UI dedicado. Em vez de manipular o DOM de toda a aplicação diretamente, a nova função `applyLocale` deverá, idealmente, emitir um evento (ex: `language-changed`) para que outros módulos de UI possam se atualizar de forma independente, reduzindo o acoplamento.

---

## Seção 1 — Renderização LaTeX + Markdown

### Análise da Seção

Responsável por converter o texto bruto da entrada, que contém uma mistura de Markdown e LaTeX, em HTML para exibição no modo de pré-visualização.

*   **Tecnologias Externas:**
    *   KaTeX: Biblioteca para renderização de matemática em TeX.
*   **Funções:**
    *   `renderTex(latex, display)`:
        *   **Papel:** Renderiza um trecho de código LaTeX para HTML.
        *   **Entrada:** `latex` (string), `display` (boolean - `true` para modo bloco, `false` para inline).
        *   **Saída:** `string` - O HTML correspondente à equação ou uma mensagem de erro.
    *   `escHtml(s)`:
        *   **Papel:** Escapa caracteres HTML para prevenir XSS.
        *   **Entrada:** `s` (string).
        *   **Saída:** `string` - A string com os caracteres escapados.
    *   `mdToHtml(src)`:
        *   **Papel:** Orquestra a conversão completa do corpo da nota. Primeiro, tokeniza a string para separar texto de LaTeX e, em seguida, aplica a renderização apropriada a cada token.
        *   **Entrada:** `src` (string) - O conteúdo bruto da nota.
        *   **Saída:** `string` - O HTML final pronto para ser inserido no DOM.
    *   `convertMarkdown(raw)`:
        *   **Papel:** Aplica um conjunto simples de regras de substituição para converter a sintaxe Markdown em tags HTML.
        *   **Entrada:** `raw` (string) - Um trecho de texto puro (sem LaTeX).
        *   **Saída:** `string` - O HTML correspondente.

### Plano de Migração

Conforme a **Fase 1** do `MigrationPlan.md`, esta seção será extraída para o módulo `editor/markdown.js`.

*   **Objetivo:** Criar um módulo "puro" e reutilizável, sem dependências de estado ou do DOM. Ele exportará as funções de renderização, que poderão ser importadas e utilizadas pela camada de UI (`ui/modes.js`) quando o modo de preview for ativado.

---

## Seção 2 — Módulo de Caneta (Pen)

### Análise da Seção

Este é o componente mais complexo, encapsulado em sua própria IIFE. Gerencia todo o ciclo de vida das anotações manuscritas, desde a captura de eventos até a renderização e persistência.

*   **Tecnologias Externas:**
    *   Pointer Events API: Unifica a entrada de mouse, toque e caneta.
*   **API Pública (Exposta pela IIFE):**
    *   `init(svgElement, layerElement, editorAreaElement)`: Inicializa o módulo com os elementos DOM necessários.
    *   `activate()` / `deactivate()`: Ativa e desativa a captura de eventos de desenho.
    *   `load(savedStrokes)`: Carrega e renderiza os traços de uma entrada.
    *   `getStrokes()`: Retorna o array de traços atual para persistência.
    *   `undo()`, `clear()`, `setColor(c)`, `setWidth(w)`, `setEraser(on)`, `setPan(on)`: Funções de controle da toolbar.
    *   `buildPrintSvg()` / `buildPrintOverlay()`: Gera o SVG para exportação.
*   **Comunicação:**
    *   `_onStrokesChange` (Callback): Função injetada pelo escopo externo para notificar sobre mudanças nos traços, acionando o salvamento imediato.

### Plano de Migração

Conforme a **Fase 2** do `MigrationPlan.md`, esta seção será refatorada e extraída para `editor/pen.js`.

*   **Objetivo:** Transformar a IIFE em uma classe ou factory function que recebe todas as suas dependências (elementos DOM e callbacks como `showToast` e `t`) via injeção no construtor. Isso quebrará o acoplamento implícito e tornará o módulo `Pen` totalmente independente e testável, conforme o contrato em `10-modular-api-contracts.md`.

---

## Seção 2.5 — Módulo de Armazenamento (Storage)

### Análise da Seção

Abstrai a camada de persistência de dados, oferecendo uma API assíncrona que lida com IndexedDB e tem um fallback para localStorage.

*   **Tecnologias Externas:**
    *   IndexedDB API: Banco de dados NoSQL do navegador.
*   **API Pública (Exposta pela IIFE):**
    *   `init()`:
        *   **Papel:** Inicializa a conexão com o banco de dados.
        *   **Saída:** `Promise<void>` - Resolve quando o backend está pronto.
    *   `getAll()`:
        *   **Papel:** Retorna todas as entradas armazenadas.
        *   **Saída:** `Promise<Entry[]>` - Resolve com um array de objetos `Entry`.
    *   `put(entry)`:
        *   **Papel:** Salva ou atualiza uma entrada.
        *   **Entrada:** `entry` (Objeto `Entry`).
        *   **Saída:** `Promise<void>`.
    *   `remove(id)`:
        *   **Papel:** Remove uma entrada pelo seu ID.
        *   **Entrada:** `id` (string).
        *   **Saída:** `Promise<void>`.
    *   `backend()`:
        *   **Papel:** Informa qual tecnologia de armazenamento está ativa.
        *   **Saída:** `'indexeddb'` ou `'localstorage'`.

### Plano de Migração

Conforme a **Fase 1** do `MigrationPlan.md`, esta é a primeira e mais segura extração a ser feita, movendo o código para `infra/storage.js`.

*   **Objetivo:** Isolar a camada de infraestrutura de persistência. O novo módulo exportará um objeto contendo a API pública, que será importado e utilizado pelo `app/actions.js` (na arquitetura final) para realizar as operações de salvamento e leitura.

---

## Seção 3 — Estado e Persistência

### Análise da Seção

Esta seção define o estado central da aplicação e as funções de alto nível que interagem com o módulo `Storage`.

*   **Variáveis de Estado:**
    *   `entries` (Array): A fonte da verdade em memória, contendo todos os objetos `Entry`.
    *   `currentId` (string | null): O ID da entrada atualmente aberta no editor.
*   **Funções:**
    *   `loadData()`: Carrega os dados do `Storage` para a variável `entries`.
    *   `saveEntry_store(entry)`: Persiste uma única entrada usando `Storage.put()`.
    *   `removeEntry_store(id)`: Remove uma entrada usando `Storage.remove()`.

### Plano de Migração

Conforme a **Fase 4** do `MigrationPlan.md`, esta lógica será movida para `app/state.js` e `app/actions.js`.

*   **Objetivo:**
    *   `app/state.js` encapsulará as variáveis `entries` e `currentId`, expondo funções `getter` e `setter` (ex: `getEntries()`, `setCurrentId(id)`). Isso tornará o fluxo de dados explícito.
    *   As funções de persistência (`saveEntry_store`, `removeEntry_store`) serão absorvidas pelas ações em `app/actions.js`, que orquestrarão a comunicação entre o estado e a camada de infraestrutura.

---

## Seção 4 — Utilitários

### Análise da Seção

Agrupa um conjunto de funções auxiliares usadas em várias partes da aplicação.

*   **Funções:**
    *   `uid()`: Gera um ID único para novas entradas.
    *   `fmtLong(iso)`, `fmtShort(iso)`: Formatam datas no padrão longo e curto.
    *   `isMobileShell()`, `isSidebarOpen()`, `setSidebarOpen(open)`, `syncSidebarToggleControl()`, `syncResponsiveShell()`: Funções que gerenciam o estado e o comportamento da barra lateral responsiva.
    *   `stripForSidebar(str)`: Remove formatação para exibir texto puro na lista de entradas.
    *   `wordCount(str)`: Conta as palavras de uma string.

### Plano de Migração

O conteúdo desta seção será distribuído conforme a responsabilidade:

*   `uid()` irá para `shared/ids.js` (**Fase 1**).
*   `fmtLong()` e `fmtShort()` irão para `shared/dates.js` (**Fase 1**).
*   As funções de controle da sidebar irão para `ui/sidebar.js` (**Fase 3**).
*   `wordCount()` e `stripForSidebar()` podem ir para um novo módulo `editor/stats.js` ou permanecer junto à lógica da sidebar que os consome.

---

## Seção 5 — Toast

### Análise da Seção

Controla a exibição de notificações não-intrusivas na parte inferior da tela.

*   **Função:**
    *   `showToast(msg)`:
        *   **Papel:** Exibe uma mensagem por um curto período.
        *   **Entrada:** `msg` (string) - A mensagem a ser exibida.
        *   **Saída:** `void` - Manipula o DOM do elemento `#toast`.

### Plano de Migração

Conforme a **Fase 3** do `MigrationPlan.md`, esta função será extraída para `ui/toast.js`.

*   **Objetivo:** Criar um módulo de UI dedicado para notificações. Outros módulos (como `app/actions.js` ou `editor/pen.js`) importarão e chamarão `showToast()` em vez de depender de uma função global.

---

## Seção 6 — Sidebar / Lista de Entradas

### Análise da Seção

Responsável por renderizar a lista de entradas na barra lateral, incluindo a funcionalidade de busca.

*   **Função:**
    *   `renderList(q)`:
        *   **Papel:** Filtra as entradas com base na query de busca, ordena por data de atualização e gera o HTML da lista.
        *   **Entrada:** `q` (string) - O termo de busca (opcional).
        *   **Saída:** `void` - Modifica o `innerHTML` do elemento `#entries-list` e adiciona listeners de clique aos itens.

### Plano de Migração

Conforme a **Fase 3** do `MigrationPlan.md`, esta lógica será movida para `ui/sidebar.js`.

*   **Objetivo:** Encapsular toda a gestão da sidebar em um único módulo. Ele irá importar dados de `app/state.js` para renderizar a lista e exportar funções ou ouvir eventos para interagir com o resto da aplicação.

---

## Seção 7 — Controle de Modo (edit | pen | preview)

### Análise da Seção

Gerencia a troca entre os três modos de visualização do editor, orquestrando a visibilidade dos elementos e o estado do módulo `Pen`.

*   **Funções:**
    *   `renderCanonicalSurface()`: Renderiza o conteúdo Markdown/LaTeX para o `div` de preview.
    *   `setMode(m)`:
        *   **Papel:** Função central que orquestra a mudança de modo.
        *   **Entrada:** `m` (string) - 'edit', 'pen' ou 'preview'.
        *   **Saída:** `void` - Altera estilos de `display`, chama `Pen.activate()`/`deactivate()` e foca nos elementos corretos.
    *   Funções de `NotebookTail`: Gerenciam o crescimento dinâmico da "página" do caderno para acomodar desenhos que ultrapassam o conteúdo de texto.

### Plano de Migração

Conforme a **Fase 3** do `MigrationPlan.md`, esta lógica será extraída para `ui/modes.js`.

*   **Objetivo:** Criar um módulo que controla a "máquina de estados" da UI do editor. Ele importará `Pen` de `editor/pen.js` e as funções de renderização de `editor/markdown.js` para orquestrar as transições de modo.

---

## Seção 8 — CRUD de Entradas

### Análise da Seção

Implementa as quatro operações fundamentais do ciclo de vida de uma entrada: Criar, Ler, Atualizar e Deletar.

*   **Funções:**
    *   `openEntry(id)`: Carrega os dados de uma entrada nos elementos do editor.
    *   `newEntry()`: Cria um novo objeto `Entry`, o persiste e o abre.
    *   `saveEntry()`: Coleta os dados do editor, atualiza o objeto `Entry` em memória e o persiste.
    *   `deleteEntry()`: Remove uma entrada e redefine a UI para o estado de boas-vindas.

### Plano de Migração

Conforme a **Fase 4** do `MigrationPlan.md`, estas funções serão o núcleo do módulo `app/actions.js`.

*   **Objetivo:** Centralizar as ações do usuário em um único local. O novo `actions.js` será o orquestrador principal, chamando funções dos módulos `app/state.js`, `infra/storage.js` e dos módulos de `ui` para executar uma operação completa.

---

## Seções 9, 10, 11, 13, 14 — Formatação, Diálogos, Exportação e Eventos

### Análise das Seções

*   **Seção 9 (Formatação):** Adiciona listeners de clique aos botões de formatação de Markdown.
*   **Seção 10 (Diálogo de Equação):** Controla o modal de inserção de LaTeX.
*   **Seção 11 (Exportação):** Contém `exportMarkdown()` e `exportPDF()`, além da lógica de `importMarkdown()`.
*   **Seção 13 (Tela Cheia):** Gerencia a Fullscreen API.
*   **Seção 14 (Atalhos e Eventos):** Configura a maioria dos `event listeners` da aplicação, incluindo atalhos de teclado.

### Plano de Migração

Esta lógica será distribuída em módulos específicos:

*   **Formatação e Diálogos:** Irão para módulos de UI como `ui/dialogs.js` e `ui/toolbar.js` (**Fase 3**).
*   **Exportação/Importação:** Serão movidas para `app/actions.js`, pois são ações de alto nível do usuário (**Fase 4**). A lógica específica de formatação do arquivo pode ser extraída para `editor/export-markdown.js`.
*   **Tela Cheia:** Pode ir para um módulo `infra/browser.js` ou `ui/shell.js` (**Fase 3**).
*   **Fiação de Eventos:** Será o principal conteúdo do `app/bootstrap.js`, que se tornará o ponto de conexão entre os módulos e o DOM (**Fase 4**).

---

## Seções 12 e 15 — Auto-Save e Inicialização

### Análise das Seções

*   **Seção 12 (Auto-Save):** Implementa a função `debSave()` para salvar automaticamente após um período de inatividade do usuário.
*   **Seção 15 (Inicialização):** Orquestra todo o processo de inicialização da aplicação: `Storage.init()`, migração de dados legados, `loadData()`, `Pen.init()` e abertura da última entrada.

### Plano de Migração

*   **Auto-Save:** A lógica de `debounce` será configurada em `app/bootstrap.js` e chamará a ação `saveCurrentEntry` de `app/actions.js` (**Fase 4**).
*   **Inicialização:** Todo o conteúdo da Seção 15 será a base para o novo módulo `app/bootstrap.js`. Ele será responsável por importar todos os outros módulos necessários e chamá-los na ordem correta para iniciar a aplicação (**Fase 4**). O `main.js` simplesmente importará e executará a função principal de `bootstrap.js` (**Fase 5**).