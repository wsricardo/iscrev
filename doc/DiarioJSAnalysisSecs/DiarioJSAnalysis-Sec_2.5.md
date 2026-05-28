# Análise da Seção 2.5 — Módulo de Armazenamento (Storage)

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 2.5 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`, `10-modular-api-contracts.md`

---

## 1. Resumo e Explicação

Assim como o `Pen`, esta seção é uma IIFE que abstrai a camada de persistência de dados. Ela oferece uma API assíncrona, totalmente baseada em Promises, e gerencia de forma transparente o uso de IndexedDB como banco de dados principal. Caso o IndexedDB não esteja disponível ou falhe na inicialização, o módulo automaticamente recorre ao `localStorage` como fallback, sem que o resto da aplicação precise saber.

## 2. Funções e Dados (API Pública da IIFE)

-   **`init()`**:
    -   **Papel**: Inicializa a conexão com o banco de dados. Tenta abrir o IndexedDB e, em caso de sucesso, prepara o `objectStore`. Se falhar, o módulo se prepara para usar o `localStorage`. Deve ser chamada antes de qualquer outra operação.
    -   **Saída**: `Promise<void>` que resolve quando o backend (IDB ou LS) está pronto.

-   **`getAll()`**:
    -   **Papel**: Retorna todas as entradas armazenadas.
    -   **Saída**: `Promise<Entry[]>` que resolve com um array de todas as entradas.

-   **`put(entry)`**:
    -   **Papel**: Salva ou atualiza uma única entrada (operação de *upsert*).
    -   **Entrada**: `entry` (Object) - O objeto da entrada a ser salvo.
    -   **Saída**: `Promise<void>`.

-   **`remove(id)`**:
    -   **Papel**: Remove uma entrada pelo seu ID.
    -   **Entrada**: `id` (String) - O ID da entrada a ser removida.
    -   **Saída**: `Promise<void>`.

-   **`backend()`**:
    -   **Papel**: Informa qual tecnologia de armazenamento está sendo usada no momento. Útil para diagnóstico.
    -   **Saída**: (String) - `'indexeddb'` ou `'localstorage'`.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 1), esta é a **primeira seção a ser migrada**, para o arquivo **`infra/storage.js`**.

-   **Objetivo**: Isolar a camada de infraestrutura de persistência do resto da lógica da aplicação. Por já ter uma API clara e ser autocontido, é o candidato ideal para iniciar a refatoração com baixo risco.
-   **Mudança Arquitetural**: A extração é direta. O novo módulo `infra/storage.js` exportará um objeto contendo as funções da API pública, seguindo o contrato definido em `10-modular-api-contracts.md`. O arquivo `diario.js` será então modificado para importar este módulo (`import Storage from './infra/storage.js'`) e usar suas funções, em vez de tê-lo definido em seu próprio escopo.