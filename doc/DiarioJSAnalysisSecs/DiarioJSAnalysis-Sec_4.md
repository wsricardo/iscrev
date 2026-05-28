# Análise da Seção 4 — Utilitários

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 4 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção agrupa um conjunto de funções auxiliares (helpers) que são usadas em diversas partes da aplicação. A maioria delas são funções puras, o que as torna candidatas ideais para extração em módulos compartilhados.

## 2. Funções e Dados

-   **`uid()`**:
    -   **Papel**: Gera um ID único para novas entradas. A implementação (`Date.now().toString(36) + Math.random().toString(36).slice(2, 7)`) cria um ID que é cronologicamente ordenável e possui um componente aleatório para evitar colisões.

-   **`fmtLong(iso)` / `fmtShort(iso)`**:
    -   **Papel**: Funções de formatação de data que usam a API `Intl.DateTimeFormat` (via `toLocaleDateString`) para exibir datas nos formatos longo e curto, respeitando o idioma atual (`currentLang`).

-   **Helpers do Shell Responsivo**:
    -   `mobileShellMq`: Uma instância de `window.matchMedia` para detectar se a tela é "mobile".
    -   `isMobileShell()`: Retorna se a media query acima é correspondida.
    -   `isSidebarOpen()` / `setSidebarOpen(open)` / `syncSidebarToggleControl()`: Um conjunto de funções que gerenciam o estado (aberto/fechado) da barra lateral, ajustando as classes CSS no `<body>` e atualizando o ícone do botão de toggle.

-   **`stripForSidebar(str)` / `wordCount(str)`**:
    -   **Papel**: `stripForSidebar` remove marcações Markdown e LaTeX de uma string para exibir um preview de texto puro. `wordCount` usa essa função para contar as palavras de uma entrada.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fases 1 e 3), esta seção será desmembrada em vários módulos especializados:

-   **`shared/ids.js`**: Receberá a função `uid()`.
-   **`shared/dates.js`**: Receberá as funções `fmtLong()` e `fmtShort()`.
-   **`ui/sidebar.js`**: Absorverá toda a lógica de gerenciamento do shell responsivo (`isMobileShell`, `setSidebarOpen`, etc.).
-   **`editor/stats.js`** (ou `shared/text.js`): Receberá as funções `stripForSidebar` e `wordCount`.