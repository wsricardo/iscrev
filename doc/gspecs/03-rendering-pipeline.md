# Especificação Técnica — 03. Pipeline de Renderização (Markdown/LaTeX)

Este documento especifica o processo de conversão de texto bruto (Markdown com LaTeX) para HTML, realizado pela função `mdToHtml`.

---

## 1. Visão Geral

A função `mdToHtml(source: string): string` é responsável por transformar o conteúdo bruto de uma entrada em HTML seguro e formatado para ser exibido no modo "Preview". O pipeline é projetado para lidar corretamente com a coexistência de sintaxe Markdown e LaTeX.

## 2. Pipeline de Conversão

O processo ocorre em duas etapas principais para garantir que a sintaxe LaTeX não seja corrompida pelo parser de Markdown.

### Etapa 1: Tokenização

A string de origem é percorrida por uma expressão regular para separar o conteúdo em "tokens" de texto comum e de LaTeX.

-   **Regex:** `/\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g`
-   **Saída:** Um array de objetos, preservando a ordem original.
    ```typescript
    type Token = {
      k: 'text' | 'inline' | 'block'; // Tipo de token
      v: string;                      // Conteúdo do token
    };
    ```
    -   `'block'`: Corresponde a `$$...$$` (LaTeX em modo de exibição).
    -   `'inline'`: Corresponde a `$...$` (LaTeX em modo inline).
    -   `'text'`: Qualquer texto que não corresponda a uma expressão LaTeX.

**Justificativa:** Esta etapa é crucial. Ela isola o código LaTeX antes que qualquer escape de HTML seja aplicado. Se o HTML fosse escapado primeiro, uma expressão como `$a < b$` se tornaria `$a &lt; b$`, que é inválido para o KaTeX.

### Etapa 2: Conversão e Composição

O array de tokens é iterado, e cada token é processado de acordo com seu tipo:

1.  **Tokens `block` e `inline`:** O conteúdo (`v`) é passado para a função `renderTex(latex, isBlock)`.
    -   Esta função envolve `katex.renderToString()`.
    -   **Tratamento de Erro:** Se o KaTeX lançar um erro, a função `renderTex` **deve** capturá-lo e retornar um elemento `<span>` formatado em vermelho, contendo o código LaTeX original e a mensagem de erro. Isso evita que um erro de sintaxe em uma fórmula quebre a renderização de toda a entrada.

2.  **Tokens `text`:** O conteúdo (`v`) é passado para a função `convertMarkdown(text)`.
    -   Primeiro, o texto é sanitizado com `escHtml()` para escapar caracteres como `<`, `>` e `&`.
    -   Em seguida, um conjunto simples de regras de substituição baseadas em regex é aplicado para converter:
        -   `**negrito**` → `<strong>negrito</strong>`
        -   `*itálico*` → `<em>itálico</em>`
        -   `` `código` `` → `<code>código</code>`
        -   Linhas começando com `> ` → `<blockquote>`
        -   Linhas começando com `- ` → `<ul><li>...</li></ul>`
        -   Parágrafos são envolvidos em tags `<p>`.

O resultado final é a concatenação de todas as strings HTML geradas, produzindo o corpo final para o preview.