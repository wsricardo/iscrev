# CSpec 04 — Renderização, Editor e Equações

## 1. Objetivo

Definir o pipeline textual da aplicação, a relação entre modo-fonte e superfície canônica, e o contrato do diálogo de equações.

## 2. Superfícies do editor

### 2.1 `edit`

- superfície principal: `textarea#entry-raw`
- conteúdo: Markdown cru + marcadores LaTeX
- toolbar visível: formatação textual
- overlay de caneta: oculto

### 2.2 `pen`

- superfície principal: `div#entry-preview`
- conteúdo: HTML resultante de `mdToHtml(entry.body)`
- overlay de caneta: visível e ativo
- toolbar visível: `#pen-toolbar`

### 2.3 `preview`

- superfície principal: `div#entry-preview`
- conteúdo: igual ao modo `pen`
- overlay de caneta: visível e passivo
- toolbar de caneta: oculta

### 2.4 Invariante

`pen` e `preview` compartilham a mesma superfície canônica renderizada. Qualquer mudança futura deve preservar essa unidade ou redefinir explicitamente o modelo de coordenadas de anotações.

## 3. Pipeline `mdToHtml`

### 3.1 Etapa 1 — tokenização

Regex usada:

```js
/\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g
```

O algoritmo separa:

- `text`
- `block`
- `inline`

### 3.2 Etapa 2 — renderização

- tokens `block` viram `<div class="math-block">...</div>`;
- tokens `inline` viram `<span class="math-inline">...</span>`;
- tokens `text` passam por `convertMarkdown(raw)`.

## 4. Regras de LaTeX

### 4.1 Renderização

`renderTex(latex, display)` chama `katex.renderToString()` com:

- `displayMode`
- `throwOnError: true`
- `strict: false`

### 4.2 Falha tolerante

Se KaTeX lançar erro, o app deve renderizar um `<span>` visual de erro, sem abortar o restante da composição HTML.

## 5. Regras de Markdown suportadas

O parser atual é propositalmente restrito. Ele suporta:

- `**negrito**`
- `*itálico*`
- headings `#` até `######`
- blockquote com `>`
- lista com `-` ou `*`
- código inline com crases

### 5.1 Observação

O sistema atual não pretende implementar CommonMark completo. Mudanças que ampliem o parser devem preservar:

- escape de HTML antes de aplicar substituições textuais;
- isolamento do LaTeX antes da conversão Markdown;
- segurança mínima contra injeção acidental de HTML vindo do corpo da nota.

## 6. `convertMarkdown(raw)`

Fluxo atual:

1. aplica `escHtml(raw)`;
2. substitui negrito e itálico;
3. substitui headings por regex;
4. substitui `\n` por `<br>`;
5. substitui código inline;
6. percorre linhas para compor blockquotes e listas;
7. concatena o HTML final.

### 6.1 Observação técnica

Como o algoritmo mistura substituição por regex e laço de linhas, mudanças futuras devem ser validadas com exemplos contendo listas, blockquotes, headings e fórmulas mistas.

## 7. Diálogo de equações

### 7.1 Estruturas principais

- `EQ_TMPLS`
- `eqBlock`
- `#eq-overlay`
- `#eq-input`
- `#eq-preview-box`

### 7.2 Fluxo

1. usuário clica em `#btn-eq`;
2. modal abre em modo inline por padrão;
3. templates populam `#eq-input`;
4. `updateEqPreview()` renderiza em tempo real;
5. inserir equação grava no `textarea` com:
   - `$latex$` para inline;
   - `\n$$latex$$\n` para bloco;
6. modal fecha;
7. app atualiza estatísticas e agenda autosave.

## 8. Contagem de palavras

`wordCount(str)` depende de `stripForSidebar(str)`, que remove marcadores simples de Markdown e LaTeX antes de contar tokens.

### 8.1 Requisito

A contagem é aproximada e voltada a UX. Ela não precisa ser linguisticamente perfeita, mas deve continuar estável e barata computacionalmente.

## 9. Auto-resize do `textarea`

`autoResizeTextarea(el)` ajusta:

```js
el.style.height = 'auto';
el.style.height = el.scrollHeight + 'px';
```

Esse comportamento é parte do contrato de layout porque evita scroll interno e preserva `.editor-area` como único scroll container.

## 10. Regras de mudança

1. Alterar o parser Markdown exige validar exportação, preview e impressão.
2. Alterar a marcação HTML do preview exige revisar `pdf-exporter.js` e `buildPrintStage()`.
3. Remover KaTeX síncrono do `<head>` exige replanejar todo o uso de `renderTex()` e `updateEqPreview()`.
