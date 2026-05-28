# Análise da Seção 8 — CRUD de Entradas

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 8 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção contém a lógica de negócio para as operações de **C**reate, **R**ead, **U**pdate e **D**elete (CRUD) sobre as entradas do diário. Essas funções orquestram a manipulação do estado em memória, a persistência no armazenamento e a atualização da interface do usuário.

## 2. Funções e Dados

-   **`openEntry(id)`**:
    -   **Papel**: Abre uma entrada existente no editor.
    -   **Fluxo**:
        1.  Define `currentId`.
        2.  Encontra a entrada no array `entries`.
        3.  Preenche os elementos do DOM (`#entry-title`, `#entry-raw`, etc.) com os dados da entrada.
        4.  Chama `Pen.load()` para carregar os traços.
        5.  Chama `setMode('edit')` para garantir que o editor esteja no modo correto.
        6.  Atualiza a lista na sidebar (`renderList()`) para marcar o item como ativo.

-   **`newEntry()`**:
    -   **Papel**: Cria uma nova entrada vazia.
    -   **Fluxo**: Cria um novo objeto `Entry` com um `id` único e timestamps, o adiciona ao início do array `entries`, o persiste com `saveEntry_store()` e o abre com `openEntry()`.

-   **`saveEntry()`**:
    -   **Papel**: Salva as alterações da entrada atualmente aberta.
    -   **Fluxo**: Lê os valores atuais do DOM (título, corpo, humor), obtém os traços de `Pen.getStrokes()`, atualiza o timestamp `updatedAt` da entrada em memória e a persiste com `saveEntry_store()`.

-   **`deleteEntry()`**:
    -   **Papel**: Remove a entrada atual.
    -   **Fluxo**: Pede confirmação ao usuário, remove a entrada do `Storage` e do array `entries`, redefine `currentId` para `null` e retorna a UI para o estado de boas-vindas.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 4), toda a lógica desta seção se tornará o coração do módulo **`app/actions.js`**.

-   **Objetivo**: Centralizar a lógica de negócio da aplicação, separando-a da UI e da camada de dados.
-   **Mudança Arquitetural**: O módulo `app/actions.js` exportará funções como `createNewEntry`, `saveCurrentEntry`, etc. Cada uma dessas funções será um orquestrador que chama os métodos apropriados dos outros módulos. Por exemplo, `deleteCurrentEntry` chamará `storage.remove()`, `state.removeEntry()` e `sidebar.render()`, coordenando a comunicação entre as diferentes camadas da nova arquitetura.