# Análise da Seção 13 — Tela Cheia (Fullscreen API)

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 13 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção gerencia a funcionalidade de tela cheia do navegador, proporcionando uma experiência de escrita mais imersiva. A implementação lida com a natureza prefixada da Fullscreen API para garantir compatibilidade entre diferentes navegadores.

## 2. Funções e Dados

-   **`FS_ICON` (Objeto)**: Contém as strings SVG para os dois estados do ícone do botão: `expand` (para entrar em tela cheia) e `compress` (para sair).

-   **`isFullscreen()`**:
    -   **Papel**: Uma função auxiliar que verifica se o documento está atualmente em modo de tela cheia, checando as propriedades prefixadas (`fullscreenElement`, `webkitFullscreenElement`, etc.).
    -   **Saída**: (Boolean).

-   **`updateFsIcon()`**:
    -   **Papel**: Sincroniza a aparência e os atributos de acessibilidade do botão de tela cheia com o estado atual. Ela atualiza o ícone SVG, o `title` e outros atributos `aria-*`.
    -   **Disparadores**: É chamada sempre que o estado de tela cheia muda, inclusive quando o usuário pressiona a tecla `Esc` para sair do modo, graças aos event listeners `fullscreenchange`.

-   **`toggleFullscreen()`**:
    -   **Papel**: A função principal que é chamada quando o usuário clica no botão. Ela verifica o estado atual com `isFullscreen()` e chama o método apropriado (`requestFullscreen` ou `exitFullscreen`), novamente testando as versões prefixadas para garantir a execução.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 5), a lógica desta seção será movida para o módulo **`infra/browser.js`** ou um mais específico, como **`infra/fullscreen.js`**.

-   **Objetivo**: Isolar a interação com APIs específicas do navegador em um módulo de infraestrutura.
-   **Mudança Arquitetural**: O novo módulo exportará a função `toggleFullscreen` e talvez `isFullscreen`. O `event listener` do botão, que conecta a UI a esta funcionalidade, será configurado em `app/bootstrap.js`. A função `updateFsIcon` provavelmente se tornará parte de um módulo de UI que gerencia a barra de ferramentas superior.