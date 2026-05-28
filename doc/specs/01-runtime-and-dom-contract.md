# CSpec 01 — Runtime e Contrato de DOM

## 1. Objetivo

Definir o contrato estrutural de `src/diario.html` para que mudanças em HTML, CSS ou JS não quebrem o acoplamento interno da aplicação.

## 2. Dependências de runtime

### 2.1 Dependências externas

- Google Analytics `gtag.js`
- Google Fonts
- KaTeX CSS
- KaTeX JS

### 2.2 Dependências locais

- `assets/css/diario.css`
- `assets/js/pdf-exporter.js`
- `assets/js/diario.js`
- `assets/js/ui.js`
- `manifest.json`
- `service-worker.js`

## 3. Ordem e semântica de carregamento

1. O HTML carrega fontes e KaTeX no `<head>`.
2. O script inline registra o service worker após o corpo.
3. `pdf-exporter.js`, `diario.js` e `ui.js` são carregados como `type="module"`.
4. O código de `diario.js` presume que todos os elementos de DOM já existem no momento de registrar listeners.

### 3.1 Requisito

Elementos usados por `document.getElementById(...)` em `diario.js` devem existir estaticamente em `diario.html`, a menos que a própria `cspec` e o código sejam atualizados em conjunto.

## 4. Estrutura canônica do shell

```text
body
├── .skip-link
├── .app
│   ├── aside.sidebar#sidebar
│   ├── button#sidebar-scrim
│   └── main.main#main-content
├── div#toast
├── div#eq-overlay
└── div#support-overlay
```

## 5. Elementos obrigatórios por subsistema

### 5.1 Sidebar e navegação

Devem existir:

- `#sidebar`
- `#lang-switcher`
- `#btn-home`
- `#btn-fullscreen`
- `#btn-new`
- `#btn-import-md`
- `#search-input`
- `#entries-list`
- `#sidebar-scrim`
- `#btn-sidebar-toggle`
- `#btn-sidebar-toggle-label`
- `#btn-sidebar-toggle-text`

### 5.2 Estado vazio

Devem existir:

- `#welcome`
- `#welcome-new`
- `#welcome-import`

### 5.3 Editor principal

Devem existir:

- `#editor-container`
- `#entry-date-display`
- `#entry-title`
- `#entry-raw`
- `#entry-preview`
- `#editor-area`
- `#notebook-tail`
- `#pen-svg`
- `#pen-layer`

### 5.4 Toolbars e botões de ação

Devem existir:

- `#fmt-btns`
- `#fmt-bold`
- `#fmt-italic`
- `#fmt-quote`
- `#fmt-list`
- `#btn-eq`
- `#mode-edit`
- `#mode-pen`
- `#mode-preview`
- `#mood-select`
- `#btn-export-md`
- `#btn-export-pdf`
- `#btn-delete`
- `#btn-save`
- `#pen-toolbar`
- `#pen-colors`
- `#pen-widths`
- `#pen-pan`
- `#pen-eraser`
- `#pen-undo`
- `#pen-clear`
- `#pen-stroke-count`

### 5.5 Status, legal e overlays

Devem existir:

- `#word-count`
- `#latex-hint`
- `#legal-support-trigger`
- `#toast`
- `#eq-overlay`
- `#eq-input`
- `#eq-preview-box`
- `#eq-inline-btn`
- `#eq-block-btn`
- `#eq-cancel`
- `#eq-insert`
- `#support-overlay`
- `#support-close`
- `#copy-pix-btn`
- `#pix-key-value`
- `#copy-status`

## 6. Contrato de classes de shell

### 6.1 Classes de estado no `body`

O CSS e o JS dependem destas classes:

- `sidebar-open`
- `sidebar-collapsed`
- `print-exporting`

### 6.2 Classes do overlay de caneta

`#pen-svg` depende de classes controladas por `Pen`:

- `pen-visible`
- `pen-active`
- `pen-pan`
- `pen-panning`
- `pen-eraser`

## 7. Contrato do editor

### 7.1 Scroll

`.editor-area` deve continuar sendo o único contêiner de scroll do editor. `#entry-raw` usa auto-resize e não pode voltar a ter scroll interno como comportamento normal.

### 7.2 Superfícies de edição

- `#entry-raw` é a superfície de edição bruta.
- `#entry-preview` é a superfície renderizada canônica.
- `#pen-svg` é a camada geométrica sobre a superfície canônica.

### 7.3 Requisito

Mudanças que alterem a relação espacial entre `#entry-preview`, `.editor-wrap`, `.editor-area` e `#pen-svg` devem ser acompanhadas por revisão do modelo de coordenadas descrito em `05-pen-engine.md`.

## 8. Contrato de acessibilidade mínima

O HTML atual estabelece estes compromissos:

- link de pulo para `#main-content`;
- `aria-label` em botões críticos;
- `role="img"` em SVG de anotações;
- `role="dialog"` e `aria-modal="true"` no modal de apoio;
- `role="status"` em mensagens de cópia do PIX;
- `aria-live="polite"` em feedback de cópia.

Novos controles equivalentes devem manter o mesmo nível mínimo de semântica.

## 9. Restrições de mudança

1. Renomear IDs sem atualizar `diario.js` é quebra de contrato.
2. Mover scripts para o `<head>` sem equivalente a `defer` ou sem reestruturar bootstrap quebra o contrato de inicialização.
3. Trocar o sistema de overlay de SVG por Canvas exige nova `cspec` para desenho, impressão e persistência.
4. Alterar o path do service worker registrado como `/service-worker.js` exige revisão de deployment, pois o caminho atual presume escopo na raiz da origem.
