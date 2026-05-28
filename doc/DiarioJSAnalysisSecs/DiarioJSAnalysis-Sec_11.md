# Análise da Seção 11 — Exportação e Importação

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 11 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção implementa as funcionalidades de importação e exportação de dados, que são cruciais para a filosofia *local-first* do projeto, garantindo que o usuário tenha total controle e portabilidade sobre suas notas.

## 2. Funções e Dados

### Exportação

-   **`exportMarkdown()`**:
    -   **Papel**: Gera um arquivo `.md` da entrada atual. O arquivo contém um *front matter* em formato YAML com metadados (título, data, humor) e os traços da caneta serializados, seguido pelo corpo da nota em Markdown.
    -   **Fluxo**:
        1.  Obtém os traços atuais de `Pen.getStrokes()`.
        2.  Serializa os traços para JSON e os codifica em **Base64** para evitar problemas de formatação no YAML. A chave `pen_strokes` é fixa e em inglês para garantir a interoperabilidade.
        3.  Cria o conteúdo do arquivo combinando o front matter e o corpo da nota.
        4.  Gera um `Blob`, cria uma URL de objeto (`URL.createObjectURL`) e simula um clique em um link de download (`<a>`) para iniciar o download.

-   **`exportPDF()`**:
    -   **Papel**: Prepara e dispara a impressão da entrada atual, que pode ser salva como PDF pelo diálogo de impressão do navegador.
    -   **Fluxo**: Utiliza uma estratégia dupla:
        1.  **`runStagePrintJob()`**: Para notas com traços, cria um "palco de impressão" (`#print-stage`) oculto que replica fielmente a aparência do modo `Preview`, incluindo um overlay SVG dos traços. A função `window.print()` é chamada, e o CSS (`@media print`) garante que apenas este palco seja impresso.
        2.  **`exportViaPaginator()`**: Se a primeira tentativa falhar (e a nota não tiver traços), ele usa o `pdf-exporter.js`, que realiza uma paginação lógica do conteúdo em um `iframe` para um controle mais fino sobre o layout do PDF.
    -   A função `waitForPrintLifecycle` gerencia o ciclo de vida do diálogo de impressão para fornecer feedback ao usuário (`toast.pdf`) no momento certo.

### Importação

-   **`importMarkdown()`**:
    -   **Papel**: Permite que o usuário selecione um arquivo `.md` (previamente exportado) e o importe como uma nova entrada.
    -   **Fluxo**:
        1.  Cria um `<input type="file">` programaticamente e o dispara.
        2.  Quando um arquivo é selecionado, usa a `FileReader` API para ler seu conteúdo.
        3.  Usa expressões regulares para extrair o *front matter* YAML e o corpo do texto.
        4.  Parseia os metadados do front matter, incluindo o título, humor e os `pen_strokes`.
        5.  Decodifica os traços de Base64 para JSON. O processo é tolerante a falhas: se os traços estiverem corrompidos, a importação continua apenas com o texto.
        6.  Cria um novo objeto `Entry`, o adiciona ao estado da aplicação, persiste e o abre no editor.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 4), a lógica de orquestração desta seção será movida para **`app/actions.js`**.

-   **Objetivo**: Centralizar as ações do usuário em um único local, separando a lógica de negócio da sua representação na UI.
-   **Mudança Arquitetural**:
    -   As funções `exportMarkdown`, `exportPDF` e `importMarkdown` serão exportadas por `app/actions.js`.
    -   A lógica específica de formatação do arquivo `.md` pode ser movida para um módulo dedicado **`editor/export-markdown.js`**.
    -   A lógica de preparação do PDF pode ir para **`editor/export-pdf.js`**.
    -   `app/actions.js` atuará como um orquestrador, chamando esses módulos específicos, bem como os módulos de `state` e `storage`, para completar a ação. Por exemplo, `importMarkdown` chamará `storage.put()` e `state.addEntry()` após parsear o arquivo.