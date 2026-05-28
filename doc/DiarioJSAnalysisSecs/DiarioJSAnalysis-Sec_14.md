# Análise da Seção 14 — Atalhos e Fiação de Eventos

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 14 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção é o centro nevrálgico que conecta as interações do usuário (cliques e teclas) às funções lógicas da aplicação. Ela é dividida em duas partes principais: atalhos de teclado globais e a "fiação" (configuração) dos `event listeners` para os botões da interface.

## 2. Funções e Dados

### Atalhos de Teclado

Um único `event listener` no `document` para o evento `keydown` gerencia todos os atalhos:
-   **`Ctrl/Cmd + S`**: Previne a ação padrão do navegador e chama `saveEntry()` e `showToast()`.
-   **`Ctrl/Cmd + Z`**: Apenas no modo "Caneta", previne a ação padrão e chama `Pen.undo()`.
-   **`F`**: Apenas se o foco não estiver em um campo de texto, chama `toggleFullscreen()`.
-   **`Escape`**: Fecha a barra lateral (se aberta em modo mobile) ou o modal de equação.

### Fiação de Eventos (`Event Wiring`)

Esta parte do código consiste em uma série de chamadas `document.getElementById(...).addEventListener('click', ...)`. Ela conecta os botões da UI às suas respectivas funções:
-   **Botões de modo**: Chamam `setMode()`.
-   **Botões de ação principal**: Chamam `newEntry`, `importMarkdown`, `saveEntry`, `deleteEntry`, etc.
-   **Busca na sidebar**: O `input` da busca chama `renderList()` para filtrar os resultados.
-   **Seletor de idioma**: Os botões de bandeira chamam `applyLocale()`.
-   **Eventos customizados**: Registra listeners para `storage:quota-exceeded` e `storage:error` para exibir toasts de erro.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 4), toda esta lógica de configuração será a principal responsabilidade do módulo **`app/bootstrap.js`**.

-   **Objetivo**: Ter um local único e claro onde todas as partes da aplicação são "conectadas".
-   **Mudança Arquitetural**: `bootstrap.js` importará as funções de ação de `app/actions.js` e as funções de UI de módulos em `ui/`. Ele então adicionará os `event listeners` aos elementos do DOM, fazendo a ponte entre a UI e a lógica de negócio. Isso torna o fluxo de controle da aplicação explícito e fácil de seguir.