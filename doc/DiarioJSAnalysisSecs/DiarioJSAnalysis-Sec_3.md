# Análise da Seção 3 — Estado e Persistência

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 3 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção atua como a ponte entre o estado da aplicação em memória e a camada de armazenamento físico (abstraída pelo módulo `Storage`). Ela define as variáveis que representam a "fonte da verdade" durante a sessão do usuário e as funções de alto nível que disparam as operações de leitura e escrita.

## 2. Funções e Dados

-   **`entries` (Array)**: Um array de objetos `Entry`. Esta é a fonte da verdade para a lista de todas as entradas carregadas em memória. A UI (como a lista na sidebar) é renderizada a partir deste array.

-   **`currentId` (String | null)**: Armazena o ID da entrada que está atualmente aberta no editor. Seu valor é `null` quando nenhuma entrada está selecionada (tela de boas-vindas).

-   **`loadData()`**:
    -   **Papel**: Carrega todas as entradas do `Storage` (seja IndexedDB ou localStorage) e preenche a variável `entries`.
    -   **Saída**: Retorna uma `Promise` que resolve quando os dados foram carregados.

-   **`saveEntry_store(entry)` / `removeEntry_store(id)`**:
    -   **Papel**: Funções wrapper que chamam os métodos `Storage.put(entry)` и `Storage.remove(id)`, respectivamente. Elas também incluem tratamento de erro básico, despachando eventos customizados em caso de falha.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 4), a lógica desta seção será dividida e se tornará o núcleo da camada de orquestração:

-   As variáveis `entries` e `currentId` serão movidas e encapsuladas no módulo **`app/state.js`**. Este módulo não permitirá a modificação direta dessas variáveis; em vez disso, exportará funções *getter* e *setter* (ex: `getEntries()`, `getCurrentId()`, `setCurrentId(id)`). Isso garante que o estado seja previsível e que as mudanças passem por um ponto de controle único.

-   As funções de persistência (`saveEntry_store`, `removeEntry_store`) serão absorvidas pelas lógicas de ações mais amplas no módulo **`app/actions.js`**. Por exemplo, a ação `deleteCurrentEntry` em `actions.js` será responsável por chamar tanto a mutação de estado (`state.removeEntry(id)`) quanto a operação de persistência (`storage.remove(id)`).