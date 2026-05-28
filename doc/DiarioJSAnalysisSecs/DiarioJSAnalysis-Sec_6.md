# Análise da Seção 6 — Sidebar / Lista de Entradas

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 6 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção é responsável por uma das partes mais importantes da interface: a renderização da lista de entradas na barra lateral. Ela lida com a ordenação, a filtragem (busca) e a atualização visual da lista.

## 2. Funções e Dados

-   **`renderList(q)`**:
    -   **Papel**: A única função desta seção. Ela re-renderiza completamente a lista de entradas a cada chamada.
    -   **Entrada**: `q` (String) - Um termo de busca opcional.
    -   **Fluxo**:
        1.  Ordena uma cópia do array `entries` pela data de atualização (`updatedAt`), da mais recente para a mais antiga.
        2.  Se um termo de busca `q` for fornecido, filtra o array ordenado, mantendo apenas as entradas cujo título ou corpo (em minúsculas) contenham o termo.
        3.  Gera o HTML para cada item da lista usando `Array.map()`. Cada item é marcado com a classe `.active` se seu ID corresponder a `currentId`.
        4.  Define o `innerHTML` do elemento `#entries-list` com o HTML gerado.
        5.  Adiciona `event listeners` de clique a cada novo item da lista para chamar `openEntry(id)`.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 3), esta seção será extraída para o módulo **`ui/sidebar.js`**.

-   **Objetivo**: Encapsular toda a lógica relacionada à barra lateral, incluindo a renderização da lista e o gerenciamento do seu estado responsivo (que virá da Seção 4).
-   **Mudança Arquitetural**: O novo módulo `sidebar.js` exportará uma função `render()`. Em vez de ler diretamente as variáveis globais `entries` e `currentId`, ele as receberá como parâmetros: `render(entries, currentId, query)`. Alternativamente, e de forma mais robusta, o módulo ouvirá um evento de "mudança de estado" e buscará os dados necessários do módulo `app/state.js` para se re-renderizar.