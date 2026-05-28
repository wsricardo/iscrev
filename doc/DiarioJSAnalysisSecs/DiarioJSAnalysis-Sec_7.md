# Análise da Seção 7 — Controle de Modo (edit | pen | preview)

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 7 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção gerencia a troca entre os três modos de operação do editor: "Edit", "Pen" e "Preview". Ela orquestra a visibilidade dos diferentes componentes da UI (o `textarea` de edição, o preview renderizado, o overlay da caneta e as barras de ferramentas) para criar uma experiência de usuário coesa.

## 2. Funções e Dados

-   **`currentMode` (Variável)**: Armazena o modo ativo no momento (`'edit'`, `'pen'`, ou `'preview'`).

-   **`renderCanonicalSurface()`**:
    -   **Papel**: Lê o conteúdo do `textarea` (`#entry-raw`) e o converte para HTML usando `mdToHtml()`, atualizando o conteúdo do `div` de preview (`#entry-preview`). Esta é a "superfície canônica" compartilhada pelos modos Pen e Preview.

-   **`setMode(m)`**:
    -   **Papel**: A função central que executa a troca de modo.
    -   **Entrada**: `m` (String) - O modo para o qual se deve alternar.
    -   **Lógica**:
        -   **`'edit'`**: Mostra o `textarea` e a barra de formatação; oculta o preview e a barra da caneta; desativa o overlay do `Pen`.
        -   **`'pen'`**: Renderiza a superfície canônica; oculta o `textarea`; mostra a barra da caneta; ativa o overlay do `Pen`.
        -   **`'preview'`**: Renderiza a superfície canônica; oculta o `textarea` e a barra da caneta; desativa o overlay do `Pen`.
    -   Ela também atualiza a classe `.active` nos botões de modo para refletir o estado atual.

-   **Helpers de `notebook-tail`**:
    -   Um conjunto de funções (`syncNotebookTail`, `maybeGrowNotebookTail`, etc.) que gerenciam a altura do "papel de caderno", garantindo que ele se estenda dinamicamente para acomodar os desenhos da caneta que ultrapassam o conteúdo do texto.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 3), esta seção será extraída para o módulo **`ui/modes.js`**.

-   **Objetivo**: Isolar a lógica de controle de modo, que é puramente uma responsabilidade da camada de apresentação (UI).
-   **Mudança Arquitetural**: O novo módulo exportará a função `setMode(mode)`. Ele importará e chamará funções de outros módulos de UI (como `pen.activate()` ou `pen.deactivate()`) e do módulo de renderização (`markdown.mdToHtml()`). A variável `currentMode` será gerenciada pelo módulo de estado central, `app/state.js`, e `setMode` a atualizará através de uma chamada a `state.setCurrentMode(mode)`.