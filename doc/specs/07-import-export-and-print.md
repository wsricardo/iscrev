# CSpec 07 — Importação, Exportação e Impressão

## 1. Objetivo

Definir os contratos de interoperabilidade de arquivo e o pipeline atual de impressão/PDF.

## 2. Exportação Markdown

`exportMarkdown()` produz um arquivo `.md` com:

1. front matter YAML;
2. heading `# Título`;
3. corpo Markdown cru da entrada.

### 2.1 Estrutura

```yaml
---
titulo: Minha entrada
data: 20/05/2026
humor: 😊
tracos: 3
pen_strokes: eyJ2IjoxLCJzIjpbLi4uXX0=
---

# Minha entrada

Conteúdo da nota...
```

### 2.2 Regras

- os rótulos de `titulo`, `data`, `humor` e `tracos` são localizados;
- `pen_strokes` é fixo e não pode ser traduzido;
- o valor de `pen_strokes` é `btoa(JSON.stringify({ v: 1, s: strokes }))`.

### 2.3 Nome do arquivo

O nome deriva do título, sanitizando caracteres inválidos para nome de arquivo.

## 3. Importação Markdown

`importMarkdown()` aceita:

- `.md`
- `.markdown`
- `.txt`

### 3.1 Parsing

1. tenta extrair front matter por regex;
2. lê `titulo|title`;
3. lê `humor|mood`;
4. lê `pen_strokes`;
5. remove o primeiro heading `# ...` do corpo exportado;
6. cria nova `Entry`;
7. persiste e abre.

### 3.2 Tolerância a falhas

- front matter ausente: usa o arquivo todo como corpo;
- título ausente: usa primeiro heading ou nome do arquivo;
- `pen_strokes` corrompido: importa texto sem falha fatal;
- erro de leitura: mostra toast de erro.

## 4. Compatibilidade de protocolo

### 4.1 Garantia atual

Arquivos exportados pela versão atual devem ser reimportáveis pela própria aplicação mantendo:

- título;
- corpo;
- humor;
- traços manuscritos válidos.

### 4.2 Regra de evolução

Se a estrutura de `Stroke` mudar, o campo `v` precisa ser tratado como versionador real do protocolo.

## 5. Impressão e PDF no `diario.js`

O fluxo atual de `exportPDF()` faz:

1. `saveEntry()`
2. `renderCanonicalSurface()`
3. `collectPdfExportModel(entry)`
4. tenta `runStagePrintJob(entry, notifyPrintDialog)`
5. se falhar e não houver traços, pode tentar `PdfExporter.exportEntry(...)`

### 5.1 Implicação importante

O stage print é o caminho primário atual. O paginator não é mais o caminho principal nominal, e sim fallback.

## 6. Stage print

`buildPrintStage(entry)` cria uma superfície temporária:

- cabeçalho com data e humor;
- título;
- clone do preview já renderizado;
- overlay SVG com `Pen.buildPrintOverlay(...)`.

O `body.print-exporting` faz o CSS de impressão revelar apenas esse stage.

## 7. `pdf-exporter.js`

### 7.1 API pública

`window.PdfExporter` expõe:

- `exportEntry(input, options)`
- `isSupported()`

### 7.2 Modelo de entrada

Espera:

- `title`
- `dateText`
- `lang`
- `previewHtml`
- `strokes`
- `surfaceWidthPx`

### 7.3 Pipeline interno resumido

1. normaliza opções de página;
2. sanitiza o HTML do preview;
3. converte o preview em blocos de fluxo;
4. mede os blocos em DOM oculto;
5. calcula caudas/spacers conforme altura lógica;
6. pagina blocos;
7. compõe HTML de impressão em iframe invisível;
8. espera recursos;
9. dispara `print()`.

## 8. Regras de impressão

1. O HTML do preview é a base visual para exportação.
2. Traços devem permanecer alinhados com o conteúdo renderizado.
3. A impressão não deve depender da visibilidade normal da UI do app.
4. O CSS `@media print` em `diario.css` faz parte do contrato funcional.

## 9. Critérios de aceitação

1. Exportar e importar uma nota simples preserva texto e título.
2. Exportar e importar uma nota com traços preserva anotações válidas.
3. Impressão continua exibindo conteúdo sem toolbars e sem sidebar.
4. Entradas com fórmulas LaTeX continuam imprimíveis.
