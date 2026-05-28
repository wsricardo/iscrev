# Análise Estruturada de `src/assets/js/diario.js`

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico das seções, funções e plano de migração para o arquivo `diario.js`.  
> **Fontes:** `diario.js`, `MigrationPlan.md`, `CurrentArchitecture.md`

---

## Introdução

Este documento oferece uma análise detalhada do arquivo `diario.js`, o cérebro da aplicação iScrev Notes. Ele está estruturado em capítulos que correspondem diretamente às seções numeradas no código-fonte, explicando o papel de cada função e como cada parte se encaixa no plano de migração para uma arquitetura modular.

---

## Seção 0 — Internacionalização (i18n)

### Resumo e Explicação

Esta seção é responsável por toda a lógica de tradução da interface do usuário. Ela permite que o aplicativo alterne entre português ('pt') e inglês ('en') sem a necessidade de recarregar a página. A arquitetura se baseia em um dicionário estático e na manipulação direta do DOM para aplicar os textos.

### Funções e Dados

-   **`I18N` (Objeto)**: Um objeto que armazena todos os textos da UI, organizado por idioma (`pt`, `en`) e por chaves de tradução (ex: `'btn.new'`).
-   **`currentLang` (Variável)**: Armazena o idioma ativo ('pt' ou 'en'), detectado a partir do `localStorage` ou do `navigator.language`.
-   **`t(key)`**:
    -   **Papel**: Retorna a string de texto para uma chave específica no idioma atual.
    -   **Entrada**: `key` (String) - A chave de tradução (ex: `'toast.saved'`).
    -   **Saída**: (String) - O texto traduzido, com fallback para português e, em último caso, para a própria chave.
-   **`applyLocale(lang)`**:
    -   **Papel**: Função pública que inicia a aplicação do idioma na UI.
    -   **Entrada**: `lang` (String) - O código do idioma a ser aplicado ('pt' ou 'en').
    -   **Saída**: Nenhuma.
-   **`doApply(lang)`**:
    -   **Papel**: O núcleo da lógica de tradução. Percorre um mapa de IDs do DOM (`TEXT_MAP`) e atualiza o `textContent`, `placeholder` ou `title` de cada elemento. Também reconstrói componentes dinâmicos como o seletor de humor e a toolbar da caneta.
    -   **Entrada**: `lang` (String) - O código do idioma.
    -   **Saída**: Nenhuma.

### Plano de Migração

Conforme o `MigrationPlan.md` (Fase 3), esta seção será extraída para o módulo **`ui/i18n.js`**.

-   **Objetivo**: Isolar a lógica de tradução. O novo módulo exportará as funções `t()` e `applyLocale()`.
-   **Mudança Arquitetural**: Em vez de chamar diretamente funções de outros módulos (como `Pen.buildToolbar()`), a nova função `applyLocale` deverá se comunicar de forma desacoplada, preferencialmente emitindo um evento customizado (ex: `'language-changed'`) que outros módulos de UI possam ouvir para se atualizarem.

---

## Seção 1 — Renderização LaTeX + Markdown

### Resumo e Explicação

Esta seção contém o pipeline de conversão que transforma o texto bruto de uma entrada (uma mistura de Markdown e LaTeX) em HTML seguro e formatado para exibição nos modos "Preview" e "Pen".

### Funções e Dados

-   **`renderTex(latex, display)`**:
    -   **Papel**: Renderiza uma string de código LaTeX em HTML usando a biblioteca KaTeX.
    -   **Entrada**: `latex` (String), `display` (Boolean) - `true` para modo bloco, `false` para inline.
    -   **Saída**: (String) - O HTML da equação renderizada ou uma mensagem de erro.
-   **`escHtml(s)`**:
    -   **Papel**: Escapa caracteres HTML (`<`, `>`, `&`, `"`) para prevenir ataques de XSS.
    -   **Entrada**: `s` (String) - Texto a ser escapado.
    -   **Saída**: (String) - Texto seguro.
-   **`mdToHtml(src)`**:
    -   **Papel**: Orquestra a conversão completa. Primeiro, tokeniza a string para separar o texto do LaTeX e, em seguida, processa cada token adequadamente.
    -   **Entrada**: `src` (String) - O conteúdo bruto da entrada.
    -   **Saída**: (String) - O HTML final e completo.
-   **`convertMarkdown(raw)`**:
    -   **Papel**: Aplica um conjunto simples de regras de substituição (RegEx) para converter sintaxe Markdown básica (negrito, itálico, listas, etc.) em HTML.
    -   **Entrada**: `raw` (String) - Um segmento de texto puro (sem LaTeX).
    -   **Saída**: (String) - O HTML correspondente.

### Plano de Migração

Conforme o `MigrationPlan.md` (Fase 1), esta seção será extraída para o módulo **`editor/markdown.js`**.

-   **Objetivo**: Criar um módulo de função pura, sem estado, dedicado à conversão de texto.
-   **Mudança Arquitetural**: Sendo um conjunto de funções puras, a extração é de baixo risco. O novo módulo exportará `mdToHtml`, que será importado e utilizado pelo futuro módulo `ui/modes.js` ou `editor/notebook-surface.js` quando for necessário renderizar o preview.

---

## Seção 2 — Módulo de Caneta (Pen)

### Resumo e Explicação

Este é o componente mais complexo da aplicação, encapsulado em sua própria IIFE para simular um módulo privado. Ele gerencia toda a interação de desenho vetorial (SVG), incluindo:
- Captura de eventos de ponteiro (mouse, toque, caneta) via Pointer Events API.
- Suavização de traços com curvas de Bézier.
- Simplificação de traços com o algoritmo Douglas-Peucker para otimizar o armazenamento.
- Modos de borracha e rolagem (pan).
- Geração de SVGs para exportação e impressão.

### Funções e Dados (API Pública da IIFE)

-   **`init(...)`**: Inicializa o módulo, recebendo os elementos DOM essenciais.
-   **`activate()` / `deactivate()`**: Ativa e desativa a captura de eventos de desenho.
-   **`load(savedStrokes)`**: Carrega e renderiza os traços de uma entrada.
-   **`getStrokes()`**: Retorna o array de traços atual para persistência.
-   **`undo()` / `clear()`**: Gerencia o histórico de traços.
-   **`setColor(c)` / `setWidth(w)`**: Altera os atributos da caneta.
-   **`setEraser(on)` / `setPan(on)`**: Alterna entre os modos de ferramenta.
-   **`buildPrintOverlay(...)` / `buildPrintSvg()`**: Gera as saídas SVG para exportação.
-   **`buildToolbar()`**: Reconstrói dinamicamente a barra de ferramentas da caneta.

### Plano de Migração

Conforme o `MigrationPlan.md` (Fase 2), esta seção será extraída para o módulo **`editor/pen.js`**.

-   **Objetivo**: Isolar completamente o motor da caneta, transformando-o em um componente reutilizável e testável.
-   **Mudança Arquitetural**: Esta é uma das migrações mais importantes. O objeto `Pen` será refatorado para uma `class` ou *factory function*. Suas dependências externas (como `showToast` e `t`) não serão mais acessadas globalmente; em vez disso, serão fornecidas via **injeção de dependência** através do construtor, conforme definido em `10-modular-api-contracts.md`.

---

## Seção 2.5 — Módulo de Armazenamento (Storage)

### Resumo e Explicação

Assim como o `Pen`, esta seção é uma IIFE que abstrai a camada de persistência de dados. Ela oferece uma API assíncrona (baseada em Promises) e gerencia de forma transparente o uso de IndexedDB como banco de dados principal, com fallback para `localStorage` caso o IndexedDB não esteja disponível.

### Funções e Dados (API Pública da IIFE)

-   **`init()`**:
    -   **Papel**: Inicializa a conexão com o banco de dados. Deve ser chamada antes de qualquer outra operação.
    -   **Saída**: `Promise<void>` que resolve quando o backend está pronto.
-   **`getAll()`**:
    -   **Papel**: Retorna todas as entradas armazenadas.
    -   **Saída**: `Promise<Entry[]>` com um array de todas as entradas.
-   **`put(entry)`**:
    -   **Papel**: Salva ou atualiza uma entrada (operação de *upsert*).
    -   **Entrada**: `entry` (Object) - O objeto da entrada a ser salvo.
    -   **Saída**: `Promise<void>`.
-   **`remove(id)`**:
    -   **Papel**: Remove uma entrada pelo seu ID.
    -   **Entrada**: `id` (String) - O ID da entrada a ser removida.
    -   **Saída**: `Promise<void>`.
-   **`backend()`**:
    -   **Papel**: Informa qual tecnologia de armazenamento está sendo usada.
    -   **Saída**: (String) - `'indexeddb'` ou `'localstorage'`.

### Plano de Migração

Conforme o `MigrationPlan.md` (Fase 1), esta é a **primeira seção a ser migrada**, para o arquivo **`infra/storage.js`**.

-   **Objetivo**: Isolar a camada de infraestrutura de persistência do resto da lógica da aplicação.
-   **Mudança Arquitetural**: A extração é direta. O novo módulo exportará um objeto contendo as funções da API pública. O arquivo `diario.js` será modificado para importar este módulo e usar suas funções (ex: `import Storage from './infra/storage.js'`).

---

## Seção 3 — Estado e Persistência

### Resumo e Explicação

Esta seção define o estado em memória da aplicação e as funções de alto nível que o conectam à camada de armazenamento.

### Funções e Dados

-   **`entries` (Array)**: A fonte da verdade para a lista de todas as entradas carregadas em memória.
-   **`currentId` (String | null)**: O ID da entrada que está atualmente aberta no editor.
-   **`loadData()`**: Carrega todas as entradas do `Storage` para a variável `entries`.
-   **`saveEntry_store(entry)`**: Persiste uma única entrada no `Storage`.
-   **`removeEntry_store(id)`**: Remove uma única entrada do `Storage`.

### Plano de Migração

Conforme o `MigrationPlan.md` (Fase 4), esta lógica será dividida:

-   As variáveis `entries` e `currentId` serão encapsuladas no módulo **`app/state.js`**. Este módulo exportará funções como `getEntries()`, `getCurrentId()`, `setCurrentId(id)`, etc., para garantir que o estado não seja modificado diretamente de qualquer lugar.
-   As funções de persistência serão parte das operações orquestradas pelo módulo **`app/actions.js`**.

---

## Seções 4 a 7 e 9 a 10 — Utilitários e Lógica de UI

### Resumo e Explicação

Este conjunto de seções agrupa diversas funcionalidades focadas na interface do usuário e em tarefas auxiliares:
-   **Seção 4 (Utilitários)**: Funções como `uid()`, formatadores de data e helpers do shell responsivo.
-   **Seção 5 (Toast)**: A função `showToast()` para exibir notificações.
-   **Seção 6 (Sidebar)**: A função `renderList()` para desenhar a lista de entradas.
-   **Seção 7 (Controle de Modo)**: A função `setMode()` para alternar entre os modos de edição.
-   **Seção 9 (Formatação)**: Listeners para os botões da barra de formatação de Markdown.
-   **Seção 10 (Diálogo de Equação)**: Lógica para o modal de inserção de LaTeX.

### Plano de Migração

Conforme o `MigrationPlan.md` (Fases 1 e 3), essas seções serão desmembradas em módulos de UI e compartilhados:

-   **`shared/ids.js`** e **`shared/dates.js`** receberão as funções da Seção 4.
-   **`ui/toast.js`** receberá a `showToast()` da Seção 5.
-   **`ui/sidebar.js`** receberá a `renderList()` e os helpers de shell da Seção 6.
-   **`ui/modes.js`** receberá a `setMode()` da Seção 7.
-   **`ui/dialogs.js`** receberá a lógica do modal de equação da Seção 10.
-   A lógica da Seção 9 será parte da fiação de eventos em `app/bootstrap.js`.

---

## Seções 8 e 11 — Ações do Usuário (CRUD e Exportação)

### Resumo e Explicação

Estas seções contêm as funções que representam as principais ações que um usuário pode realizar.
-   **Seção 8 (CRUD)**: Funções `newEntry`, `openEntry`, `saveEntry` e `deleteEntry`. Elas orquestram a manipulação do estado, a persistência e a atualização da UI.
-   **Seção 11 (Exportação)**: Funções `exportMarkdown`, `exportPDF` e `importMarkdown`.

### Plano de Migração

Conforme o `MigrationPlan.md` (Fase 4), toda essa lógica será o coração do módulo **`app/actions.js`**.

-   **Objetivo**: Centralizar a lógica de negócio da aplicação. Uma função como `deleteEntry` em `actions.js` será responsável por chamar `state.removeEntry()`, `storage.remove()` e `ui.renderList()`, orquestrando a comunicação entre as camadas.

---

## Seções 12, 13, 14 e 15 — Lógica de Aplicação e Inicialização

### Resumo e Explicação

Este grupo final de seções lida com o comportamento geral da aplicação e sua inicialização.
-   **Seção 12 (Auto-Save)**: Lógica de `debounce` para o salvamento automático.
-   **Seção 13 (Tela Cheia)**: Funções para gerenciar o modo de tela cheia.
-   **Seção 14 (Fiação de Eventos)**: Onde a maioria dos `addEventListener` é configurada.
-   **Seção 15 (Inicialização)**: O ponto de entrada que executa quando o script carrega, inicializando o `Storage`, o `Pen` e carregando a primeira entrada.

### Plano de Migração

Conforme o `MigrationPlan.md` (Fases 4 e 5), o destino dessas seções é:

-   A lógica de tela cheia (Seção 13) irá para **`infra/browser.js`**.
-   As Seções 12, 14 e 15 serão a base para o módulo **`app/bootstrap.js`**. Este módulo será responsável por "ligar os pontos": inicializar todos os outros módulos e configurar todos os event listeners que conectam a UI às ações.
-   Finalmente, um novo arquivo **`main.js`** será criado, cuja única função será importar e executar `app/bootstrap.js`, servindo como o ponto de entrada limpo e final da aplicação.