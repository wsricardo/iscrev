# Análise da Seção 9 — Formatação via Toolbar

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 9 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção contém a lógica para os botões de formatação de Markdown da barra de ferramentas (negrito, itálico, citação, lista). Ela manipula diretamente o texto no `textarea` principal com base na seleção do usuário.

## 2. Funções e Dados

Não há funções nomeadas nesta seção, apenas `event listeners` configurados diretamente. A lógica se baseia em atributos `data-*` nos botões HTML:

-   **Botões `[data-wrap]` (Negrito, Itálico)**:
    -   **Lógica**: Ao clicar, obtêm o marcador (ex: `**`) do atributo `data-wrap`. Usam a API `textarea.setRangeText()` para envolver o texto selecionado com o marcador. Se nada estiver selecionado, envolvem a palavra "texto" como placeholder.

-   **Botões `[data-prefix]` (Citação, Lista)**:
    -   **Lógica**: Ao clicar, obtêm o prefixo (ex: `> `) do atributo `data-prefix`. Encontram o início da linha atual da seleção e usam `setRangeText()` para inserir o prefixo nesse ponto.

Após cada operação, o foco é devolvido ao `textarea` e o salvamento automático (`debSave()`) é acionado.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 4), a lógica de configuração dos `event listeners` desta seção será movida para **`app/bootstrap.js`**.

-   **Objetivo**: Centralizar toda a "fiação" de eventos da aplicação em um único local.
-   **Mudança Arquitetural**: A lógica de manipulação do `textarea` em si é bastante específica da UI. Ela pode permanecer dentro dos callbacks dos listeners em `bootstrap.js` ou, em uma refatoração mais profunda, ser parte de um módulo de UI dedicado ao editor de texto (ex: `editor/text-editor.js`), que por sua vez seria inicializado pelo `bootstrap`.