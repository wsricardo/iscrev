# Análise da Seção 12 — Auto-Save com Debounce

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 12 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção implementa a funcionalidade de salvamento automático, que é crucial para a experiência de "baixa fricção" do iScrev Notes. Para evitar gravações excessivas no banco de dados durante a digitação contínua, a estratégia utilizada é o **debounce**: a operação de salvamento só é executada após um período de inatividade do usuário.

## 2. Funções e Dados

-   **`debTimer` (Variável)**: Armazena o ID do timer retornado por `setTimeout`. É usado para cancelar o salvamento pendente se o usuário voltar a digitar.

-   **`debSave()`**:
    -   **Papel**: Função de debounce. Cada vez que é chamada, ela limpa o timer anterior (`clearTimeout`) e agenda uma nova chamada à função `saveEntry()` para 1800ms (1.8 segundos) no futuro.
    -   **Disparadores**: É chamada nos eventos `input` do título e do corpo da nota, e no evento `change` do seletor de humor.

-   **`Pen._onStrokesChange` (Callback)**:
    -   **Papel**: Este callback é injetado no módulo `Pen` e é chamado **imediatamente** após a conclusão de cada traço. Ele atualiza os dados do traço na entrada atual e a persiste no `Storage`.
    -   **Justificativa**: Traços são eventos discretos e de menor frequência que a digitação. Salvá-los imediatamente, sem debounce, garante que nenhum desenho seja perdido caso o usuário feche a aba logo após desenhar.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 4), a lógica desta seção será configurada no módulo **`app/bootstrap.js`**.

-   **Objetivo**: Conectar os eventos da UI (que serão gerenciados por módulos de UI) às ações de salvamento (que estarão em `app/actions.js`).
-   **Mudança Arquitetural**: `app/bootstrap.js` será responsável por adicionar os `event listeners` aos elementos do DOM. O callback desses listeners chamará a função `debSave`. A própria função `debSave` pode residir em `app/bootstrap.js` ou em `app/actions.js`, e ela chamará a ação `saveCurrentEntry()` (que estará em `app/actions.js`). O callback `_onStrokesChange` será passado para a instância do `Pen` durante a inicialização em `bootstrap.js`.