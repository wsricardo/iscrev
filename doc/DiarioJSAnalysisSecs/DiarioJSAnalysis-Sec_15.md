# Análise da Seção 15 — Inicialização

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 15 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta é a seção final do script, responsável por iniciar ("bootstrap") a aplicação. Ela orquestra a sequência de inicialização, garantindo que os dados sejam carregados, os módulos sejam preparados e a interface esteja pronta para o usuário. A versão atual já reflete a transição para o IndexedDB, incluindo um passo de migração de dados legados.

## 2. Funções e Dados

-   **`migrateFromLocalStorage()`**:
    -   **Papel**: Uma função de uso único que verifica se os dados já foram migrados do `localStorage` antigo para o novo backend IndexedDB. Se não, ela lê os dados do `localStorage`, os insere no IndexedDB via `Storage.put()` e marca a migração como concluída.

-   **Cadeia de Promises de Inicialização**:
    -   O processo de inicialização é uma cadeia de `.then()` que garante a ordem correta das operações assíncronas:
        1.  **`Storage.init()`**: Inicializa a conexão com o banco de dados.
        2.  **`migrateFromLocalStorage()`**: Executa a migração de dados, se necessário.
        3.  **`loadData()`**: Carrega todas as entradas do `Storage` para a memória (`entries` array).
        4.  **`Pen.init()`**: Inicializa o módulo da caneta, passando os elementos DOM necessários.
        5.  **`applyLocale()`**: Aplica o idioma à interface.
        6.  **Abre a última entrada**: Se houver entradas, ordena por data de atualização e chama `openEntry()` para a mais recente.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 4), o conteúdo desta seção será a base para o módulo **`app/bootstrap.js`**.

-   **Objetivo**: Ter um módulo com a única responsabilidade de inicializar a aplicação.
-   **Mudança Arquitetural**: `bootstrap.js` importará todos os módulos necessários (`Storage`, `Pen`, `state`, `actions`, `i18n`, etc.). Ele conterá a cadeia de inicialização, chamando os métodos `init()` de cada módulo na ordem correta e, ao final, configurando os event listeners (lógica da Seção 14). O novo ponto de entrada da aplicação, `main.js`, apenas importará e executará a função principal de `bootstrap.js`.