# Análise da Seção 1 — Renderização LaTeX + Markdown

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 1 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção contém o pipeline de conversão que transforma o texto bruto de uma entrada (uma mistura de Markdown e LaTeX) em HTML seguro e formatado para exibição nos modos "Preview" e "Pen". A estratégia é robusta, pois isola o código LaTeX antes de aplicar qualquer transformação no resto do texto, evitando que caracteres especiais do LaTeX sejam corrompidos.

## 2. Funções e Dados

-   **`renderTex(latex, display)`**:
    -   **Papel**: Renderiza uma string de código LaTeX em HTML usando a biblioteca KaTeX.
    -   **Entrada**: `latex` (String), `display` (Boolean) - `true` para modo bloco (`$$...$$`), `false` para inline (`$...$`).
    -   **Saída**: (String) - O HTML da equação renderizada. Em caso de erro de sintaxe no LaTeX, retorna uma `<span>` com a mensagem de erro, evitando que a renderização da página inteira quebre.

-   **`escHtml(s)`**:
    -   **Papel**: Escapa caracteres HTML especiais (`<`, `>`, `&`, `"`) para prevenir ataques de Cross-Site Scripting (XSS) ao exibir conteúdo gerado pelo usuário.
    -   **Entrada**: `s` (String) - Texto a ser escapado.
    -   **Saída**: (String) - Texto seguro para ser inserido via `innerHTML`.

-   **`mdToHtml(src)`**:
    -   **Papel**: Orquestra a conversão completa. Primeiro, usa uma expressão regular para "tokenizar" a string, separando segmentos de texto puro dos segmentos de LaTeX. Em seguida, processa cada token adequadamente.
    -   **Entrada**: `src` (String) - O conteúdo bruto da entrada.
    -   **Saída**: (String) - O HTML final e completo, pronto para ser exibido.

-   **`convertMarkdown(raw)`**:
    -   **Papel**: Aplica um conjunto simples de regras de substituição (RegEx) para converter sintaxe Markdown básica (negrito, itálico, listas, blockquotes, etc.) em tags HTML.
    -   **Entrada**: `raw` (String) - Um segmento de texto puro (já sem LaTeX).
    -   **Saída**: (String) - O HTML correspondente.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 1), esta seção será extraída para o módulo **`editor/markdown.js`**.

-   **Objetivo**: Criar um módulo de função pura, sem estado, dedicado exclusivamente à conversão de texto. Isso o torna altamente reutilizável e fácil de testar.
-   **Mudança Arquitetural**: Sendo um conjunto de funções puras (a saída depende apenas da entrada), a extração é de baixo risco. O novo módulo exportará a função principal `mdToHtml`, que será importada e utilizada pelo futuro módulo `ui/modes.js` ou `editor/notebook-surface.js` sempre que for necessário renderizar o preview de uma entrada.