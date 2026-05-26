# Especificação Técnica — 05. Protocolo de Importação e Exportação

Este documento especifica os formatos de arquivo e os protocolos para as funcionalidades de importação e exportação do iScrev Notes.

---

## 1. Exportação para Markdown (`.md`)

A exportação para Markdown gera um arquivo de texto puro (`.md`) que contém todo o conteúdo da entrada, incluindo os traços manuscritos.

### Formato do Arquivo

O arquivo é composto por um cabeçalho **YAML Front Matter** seguido pelo corpo da anotação.

```yaml
---
titulo: Título da entrada
data: 17/03/2026
humor: 😊
tracos: 12
pen_strokes: eyJ2IjoxLCJzIjpbXX0=
---

# Título da entrada

Corpo em Markdown com **negrito**, *itálico* e $fórmulas$.
```

### Campos do Front Matter

-   `titulo`, `data`, `humor`: Metadados legíveis por humanos. Os nomes das chaves e o formato da data são localizados de acordo com o idioma da UI no momento da exportação.
-   `tracos`: Um contador numérico de traços, apenas para informação. Não é usado na importação.
-   `pen_strokes`: O campo mais importante. Contém os dados dos traços manuscritos.
    -   **Formato:** Uma string em **Base64**.
    -   **Conteúdo:** O resultado de `btoa(JSON.stringify({v: 1, s: Stroke[]}))`. O objeto contém uma versão (`v`) e o array de traços (`s`).
    -   **Chave Fixa:** A chave `pen_strokes` é **sempre em inglês** e não é traduzida. Isso garante que o processo de importação funcione de forma consistente, independentemente do idioma em que o arquivo foi exportado.

## 2. Importação de Markdown

A importação lê um arquivo `.md` (ou `.txt`, `.markdown`) e recria a entrada correspondente no diário.

1.  O arquivo é lido como texto usando `FileReader`.
2.  O Front Matter é extraído usando uma expressão regular (`/^---\r?\n([\s\S]*?)\r?\n---/`).
3.  O parser lê as chaves `titulo` (ou `title`) e `humor` (ou `mood`).
4.  O parser lê a chave `pen_strokes`, decodifica a string de Base64 (`atob()`) e faz o parse do JSON (`JSON.parse()`).
5.  **Validação:** O objeto de traços decodificado é validado para garantir que possui a estrutura esperada (`{v: 1, s: Array}`). Se a estrutura for inválida ou os dados estiverem corrompidos, a importação prossegue apenas com o texto, sem falhar completamente.
6.  O corpo da anotação é extraído do restante do arquivo.
7.  Uma nova `Entry` é criada, adicionada ao topo da lista de entradas e aberta na UI.

## 3. Exportação para PDF

A exportação para PDF utiliza duas estratégias distintas, escolhidas automaticamente com base no conteúdo da entrada.

### Fluxo A: Sem Traços (via `PdfExporter`)

Se a entrada não contém traços manuscritos (`strokes.length === 0`), a exportação é delegada ao módulo `pdf-exporter.js`.

-   **Lógica:** Este módulo realiza uma paginação lógica do conteúdo HTML renderizado. Ele mede a altura dos blocos de conteúdo em um DOM oculto para determinar as quebras de página.
-   **Execução:** Ele gera um documento HTML completo e paginado, o injeta em um `<iframe>` invisível e chama `window.print()` nesse iframe.
-   **Vantagem:** Produz PDFs paginados de forma mais limpa para documentos longos de apenas texto.

### Fluxo B: Com Traços (via `buildPrintStage`)

Se a entrada contém traços, a prioridade é preservar o alinhamento geométrico exato entre os traços e o texto.

-   **Lógica:** Uma "área de impressão" (`#print-stage`) temporária é criada no DOM. O conteúdo renderizado (texto + SVG dos traços) é replicado nesta área. O SVG é gerado pela função `Pen.buildPrintSvg()`, que cria um SVG autônomo com um `viewBox` que engloba todos os traços.
-   **Execução:** A aplicação chama `window.print()` na janela principal. Regras de CSS em `@media print` ocultam toda a UI da aplicação, exceto a área de impressão.
-   **Vantagem:** Garante fidelidade visual absoluta (WYSIWYG), pois o que é impresso é uma réplica exata do que o usuário vê nos modos "Preview" e "Caneta".