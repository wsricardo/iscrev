# Meu Diário — Documentação de Arquitetura e Implementação

> **Arquivo:** `diario.html` · **~2.430 linhas** · **~100 KB**  
> **Stack:** HTML5 · CSS3 · JavaScript ES5 · KaTeX 0.16.11  
> **Paradigma:** SPA single-file, zero build step, zero backend

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Estrutura do Arquivo](#2-estrutura-do-arquivo)
3. [HTML — Estrutura e Semântica](#3-html--estrutura-e-semântica)
4. [CSS — Sistema de Design e Layout](#4-css--sistema-de-design-e-layout)
   - 4.1 [Tokens de Design](#41-tokens-de-design)
   - 4.2 [Layout Principal — Flexbox](#42-layout-principal--flexbox)
   - 4.3 [O Efeito de Papel de Caderno](#43-o-efeito-de-papel-de-caderno)
   - 4.4 [Toolbar e Controles](#44-toolbar-e-controles)
   - 4.5 [Seletor de Idioma e Tela Cheia](#45-seletor-de-idioma-e-tela-cheia)
   - 4.6 [CSS de Impressão](#46-css-de-impressão)
5. [JavaScript — Módulos e Seções](#5-javascript--módulos-e-seções)
   - 5.0 [Internacionalização (i18n)](#50-internacionalização-i18n)
   - 5.1 [Renderização LaTeX e Markdown](#51-renderização-latex-e-markdown)
   - 5.2 [Módulo de Caneta (SVG + Pointer Events)](#52-módulo-de-caneta-svg--pointer-events)
   - 5.3 [Estado e Persistência](#53-estado-e-persistência)
   - 5.4 [Utilitários](#54-utilitários)
   - 5.5 [Toast](#55-toast)
   - 5.6 [Sidebar e Lista de Entradas](#56-sidebar-e-lista-de-entradas)
   - 5.7 [Controle de Modo](#57-controle-de-modo)
   - 5.8 [CRUD de Entradas](#58-crud-de-entradas)
   - 5.9 [Formatação via Toolbar](#59-formatação-via-toolbar)
   - 5.10 [Diálogo de Equação LaTeX](#510-diálogo-de-equação-latex)
   - 5.11 [Exportação](#511-exportação)
   - 5.12 [Auto-resize e Wheel Forwarding](#512-auto-resize-e-wheel-forwarding)
   - 5.13 [Auto-save com Debounce](#513-auto-save-com-debounce)
   - 5.14 [Tela Cheia (Fullscreen API)](#514-tela-cheia-fullscreen-api)
   - 5.15 [Atalhos de Teclado e Fiação de Eventos](#515-atalhos-de-teclado-e-fiação-de-eventos)
   - 5.16 [Inicialização](#516-inicialização)
6. [Modelo de Dados](#6-modelo-de-dados)
7. [O Bug do Paralaxe — Diagnóstico e Solução](#7-o-bug-do-paralaxe--diagnóstico-e-solução)
8. [Atalhos de Teclado](#8-atalhos-de-teclado)
9. [Guia de Manutenção](#9-guia-de-manutenção)

---

## 1. Visão Geral

O aplicativo é uma **SPA (Single Page Application) autocontida em um único arquivo HTML**. Não precisa de servidor, instalação, build ou banco de dados. Todo o dado do usuário fica no `localStorage` do browser.

### Funcionalidades

| Área | Funcionalidade |
|------|---------------|
| Editor | Textarea com Markdown (`**bold**`, `*italic*`, `> quote`, `- list`) |
| LaTeX | Equações inline `$...$` e bloco `$$...$$` via KaTeX síncrono |
| Caneta | SVG com Bézier, borracha geométrica, cores, espessuras |
| Modos | Editar / Caneta / Preview — layout e captura de eventos mudam |
| CRUD | Criar, abrir, salvar (auto + manual), excluir entradas |
| Busca | Filtro em tempo real por título e corpo |
| Humor | Emoji associado a cada entrada |
| Exportação | `.md` com YAML front matter + PDF via `window.print()` |
| Tela cheia | Fullscreen API nativa com ícone e atalho `F` |
| i18n | PT/EN com detecção automática via `navigator.language` |

---

## 2. Estrutura do Arquivo

```
diario.html
├── <head>          (linhas 1–15)
│   ├── meta charset, viewport, title
│   ├── Google Fonts (4 famílias, assíncrono)
│   ├── KaTeX CSS
│   └── KaTeX JS  ← SÍNCRONO (sem defer/async)
│
├── <style>         (linhas 16–430)
│   ├── Reset
│   ├── Tokens CSS (:root)
│   ├── Base (html, body, .app)
│   ├── Sidebar
│   ├── Main
│   ├── Toolbar principal
│   ├── Pen toolbar
│   ├── Editor wrap + notebook-bg + pen SVG
│   ├── Preview
│   ├── Header controls (lang + fullscreen)
│   ├── Toast
│   ├── Equation dialog
│   ├── @media print
│   └── @media responsive
│
├── <body>          (linhas 431–745)
│   ├── .app
│   │   ├── .sidebar
│   │   └── .main → #editor-container
│   ├── #toast
│   └── .eq-overlay
│
└── <script>        (linhas 746–2427)
    ├── IIFE encapsulando todo o código
    ├── SEÇÃO 0  — i18n
    ├── SEÇÃO 1  — LaTeX + Markdown
    ├── SEÇÃO 2  — Módulo Pen (IIFE interno)
    ├── SEÇÃO 3  — Estado e Persistência
    ├── SEÇÃO 4  — Utilitários
    ├── SEÇÃO 5  — Toast
    ├── SEÇÃO 6  — Sidebar
    ├── SEÇÃO 7  — Controle de Modo
    ├── SEÇÃO 8  — CRUD
    ├── SEÇÃO 9  — Formatação Toolbar
    ├── SEÇÃO 10 — Diálogo de Equação
    ├── SEÇÃO 11 — Exportação
    ├── SEÇÃO 12 — Auto-resize + Wheel Forwarding
    ├── SEÇÃO 13 — Auto-save
    ├── SEÇÃO 14 — Fullscreen
    ├── SEÇÃO 14 — Atalhos + Fiação  ← número duplicado (bug menor)
    └── SEÇÃO 15 — Inicialização
```

> **Por que uma IIFE?**  
> Todo o JavaScript está encapsulado em `(function(){ 'use strict'; ... })()`. Isso cria um escopo privado — nenhuma variável ou função polui `window`, reduzindo riscos de conflito com scripts externos (ex: KaTeX).

---

## 3. HTML — Estrutura e Semântica

### Hierarquia DOM completa

```
body
└── .app  (display:flex, height:100vh)
    │
    ├── aside.sidebar  (width:280px, fixo)
    │   ├── .sidebar-header
    │   │   ├── .logo
    │   │   │   ├── span#logo-title       ← i18n: "Meu Diário"
    │   │   │   └── span#logo-sub         ← i18n: "anotações pessoais"
    │   │   └── .header-controls
    │   │       ├── .lang-switcher#lang-switcher
    │   │       │   ├── button.lang-btn[data-lang="pt"]
    │   │       │   └── button.lang-btn[data-lang="en"]
    │   │       └── button#btn-fullscreen
    │   ├── button#btn-new
    │   ├── .search-wrap
    │   │   └── input#search-input
    │   └── .entries-list  ← preenchida via JS (renderList)
    │
    └── main.main  (flex:1)
        ├── div#welcome              ← visível sem entrada selecionada
        └── div#editor-container     ← visível com entrada selecionada
            ├── div.toolbar          ← botões principais
            ├── div.pen-toolbar#pen-toolbar  ← visível só no modo caneta
            └── div.editor-wrap      ← containing block do SVG
                ├── div.editor-area#editor-area  ← ÚNICO scroll container
                │   └── div.notebook-bg          ← paper + texto juntos
                │       ├── div.entry-date-display#entry-date-display
                │       ├── input#entry-title
                │       ├── textarea#entry-raw    ← modo edição
                │       └── div#entry-preview     ← modo preview
                └── svg#pen-svg      ← overlay de anotações (position:absolute)
                    └── g#pen-layer  ← recebe transform de scroll
```

### Convenções de atributos usadas pelo JavaScript

| Atributo | Elemento | Uso |
|----------|----------|-----|
| `data-lang` | `.lang-btn` | Código do idioma (`'pt'`, `'en'`) |
| `data-label` | `.lang-btn`, `#btn-fullscreen` | Texto do tooltip (atualizado por i18n) |
| `data-wrap` | `.toolbar-btn` | Caractere de envolvimento para formatação |
| `data-prefix` | `.toolbar-btn` | Prefixo de linha para formatação |
| `data-i18n` | vários | Chave do dicionário i18n (legado, alguns elementos usam IDs diretos) |
| `data-idx` | `<path>` no SVG | Índice do traço para a borracha |

---

## 4. CSS — Sistema de Design e Layout

### 4.1 Tokens de Design

Definidos em `:root` como CSS Custom Properties. **Toda** a paleta de cores passa por aqui — alterar um token atualiza todo o projeto:

```css
:root {
  --ink:     #1a1209;              /* tinta — texto principal */
  --paper:   #f5efe0;              /* papel — fundo da área de edição */
  --paper2:  #ede6d0;              /* papel escuro — toolbar e stats */
  --warm:    #c8843a;              /* laranja âmbar — cor de destaque */
  --warm-lt: #e8b96a;              /* laranja claro — logo, destaque suave */
  --rust:    #8b3a1f;              /* ferrugem — cor secundária */
  --math-bg: #fdf6e8;              /* fundo de blocos de equação */
  --math-bd: rgba(200,132,58,.3);  /* borda de equação */
  --line:    rgba(200,132,58,.22); /* linhas de caderno */
}
```

### Tipografia

| Família | CDN | Uso no projeto |
|---------|-----|---------------|
| **Dancing Script** | Google Fonts | Logo, data da entrada |
| **Playfair Display** | Google Fonts | Título da entrada, cabeçalhos |
| **Lora** | Google Fonts | Corpo, botões, UI geral |
| **JetBrains Mono** | Google Fonts | Textarea (edição), código inline |

### 4.2 Layout Principal — Flexbox

O layout usa uma cadeia de flex containers aninhados:

```
body (height:100%)
  └── .app (display:flex, height:100vh)
        ├── .sidebar (width:280px, flex-direction:column)
        └── .main (flex:1, flex-direction:column)
              ├── .toolbar
              ├── .pen-toolbar
              └── .editor-wrap (flex:1, position:relative, overflow:hidden)
                    ├── .editor-area (flex:1, overflow-y:auto)
                    │     └── .notebook-bg (bloco, min-height:100%)
                    └── #pen-svg (position:absolute, inset:0)
```

**Pontos críticos do layout:**

- `.editor-wrap` tem `overflow:hidden` para clipar o `#pen-svg` que é `position:absolute; inset:0`.
- `.editor-area` tem `flex:1` para preencher `.editor-wrap` verticalmente e `overflow-y:auto` para ser o único container de scroll.
- `.notebook-bg` é um **bloco puro** (sem `display:flex`), com `min-height:100%`. Isso garante que o fundo de linhas preenche ao menos o viewport e cresce com o conteúdo.

### 4.3 O Efeito de Papel de Caderno

O visual de caderno (linhas horizontais + margem vermelha vertical) é gerado em CSS puro, sem imagens:

```css
.notebook-bg {
  min-height: 100%;
  padding: 28px 30px 28px 96px;
  background-image:
    /* Camada 1: margem vermelha vertical — 1.5px na posição 90px */
    linear-gradient(
      to right,
      transparent 89px,
      rgba(200,60,40,.18) 89px,
      rgba(200,60,40,.18) 90.5px,
      transparent 90.5px
    ),
    /* Camada 2: linhas horizontais a cada 28px */
    repeating-linear-gradient(
      transparent,
      transparent 27px,
      var(--line) 27px,
      var(--line) 28px
    );
}
```

**Por que 28px?** O textarea `#entry-raw` tem `line-height: 28px`. As linhas de caderno a cada 28px ficam perfeitamente alinhadas com cada linha de texto — exatamente como em um caderno físico de pautas.

**Por que dois gradientes empilhados?** `background-image` aceita múltiplas camadas separadas por vírgula. A primeira camada (mais acima) é a margem, a segunda são as linhas. O `background-color` subjacente continua sendo `var(--paper)` (herdado de `.main`).

> Veja a [Seção 7](#7-o-bug-do-paralaxe--diagnóstico-e-solução) para o histórico do bug de paralaxe e como a posição desse background foi o centro da solução.

### 4.4 Toolbar e Controles

**`min-width` nos botões para estabilidade de layout entre idiomas:**

Quando o usuário troca de idioma, os textos dos botões mudam de comprimento ("Caneta" → "Pen"). Sem `min-width`, os botões encolhem e a toolbar muda de altura, causando um salto visual. Cada botão tem um `min-width` calculado para o texto mais longo entre os idiomas:

```css
.mode-btn   { min-width: 62px; }  /* "✒ Caneta" (PT) */
.btn-eq     { min-width: 88px; }  /* "∑ Equation" (EN) */
.btn-save   { min-width: 64px; }  /* "Salvar" (PT) */
.btn-delete { min-width: 66px; }  /* "Excluir" (PT) */
```

**`min-height: 50px` na `.toolbar`:** O `flex-wrap: wrap` na toolbar pode quebrar os botões para 2 linhas dependendo do idioma/tamanho. O `min-height` garante que a toolbar nunca colapsa abaixo de 1 linha.

### 4.5 Seletor de Idioma e Tela Cheia

Os controles do header da sidebar (`lang-switcher` + `btn-fullscreen`) ficam em `.header-controls` com `justify-content: space-between`. Os botões de idioma são pílulas tipográficas com:

- **Dimensões fixas:** `width: 64px; height: 28px` — os dois botões PT e EN têm o mesmo tamanho, sem deslocamento ao trocar.
- **Estados visuais:** inativo (borda sutil `#3a2a12`, texto `#6a5030`), hover (`outline-color: var(--warm)`), ativo (`background: var(--warm)`).
- **Tooltip:** implementado via `::after` e `::before` com `content: attr(data-label)`, aparece abaixo ao hover.

O botão de fullscreen segue o mesmo vocabulário visual mas com `width: 32px` e ícone SVG inline que troca entre expand/compress.

### 4.6 CSS de Impressão

O bloco `@media print` transforma o layout para exportação em PDF:

```css
@media print {
  /* Oculta tudo que não é conteúdo */
  .sidebar, .toolbar, .pen-toolbar, .stats-bar, .toast, .eq-overlay { display:none !important }

  /* Normaliza o layout */
  html, body { overflow:visible; height:auto; background:#fff }
  .app        { display:block }
  .main       { overflow:visible; background:#fff }

  /* Remove background de linhas (não imprime linhas de caderno) */
  .notebook-bg { padding:0; background-image:none; min-height:0 }

  /* Mostra apenas o preview renderizado */
  #entry-raw     { display:none !important }
  #entry-preview { display:block !important; min-height:0 }

  /* Oculta o SVG overlay (é substituído pelo #print-svg-tmp) */
  #pen-svg { display:none !important }

  /* SVG standalone gerado por Pen.buildPrintSvg() */
  #print-svg-tmp { display:block !important; width:100% !important }
}
```

**Por que o SVG de anotações é substituído para PDF?**  
O `#pen-svg` usa `position:absolute` e coordenadas de documento (com scroll offset). Em `@media print` não há viewport nem scrollTop — o SVG colapsaria. `Pen.buildPrintSvg()` gera um SVG autossuficiente com `viewBox` calculado a partir do bounding box real dos traços, eliminando a dependência de coordenadas de tela.

---

## 5. JavaScript — Módulos e Seções

Todo o código está dentro de uma IIFE com `'use strict'`, dividida em 16 seções numeradas.

### 5.0 Internacionalização (i18n)

**Padrão:** dicionário estático + varredura de IDs.

```javascript
var I18N = {
  pt: { 'btn.new': 'Nova Entrada', 'mode.edit': 'Editar', ... },
  en: { 'btn.new': 'New Entry',    'mode.edit': 'Edit',   ... }
};
```

**Fluxo de atualização:**

```
applyLocale(lang)
  └── doApply(lang)
        ├── currentLang = lang
        ├── localStorage.setItem('diario_lang', lang)
        ├── document.documentElement.lang = 'pt-BR' | 'en'
        ├── TEXT_MAP.forEach → atualiza textContent / placeholder / title
        ├── Recria options do #mood-select
        ├── Atualiza .active dos botões de idioma
        ├── Pen.buildToolbar()  → reconstrói labels de cores/espessuras
        ├── updateStats()       → traduz "palavra/palavras"
        └── renderList()        → traduz "Nenhuma entrada ainda"
```

**Detecção automática na primeira visita:**
```javascript
var currentLang = (function () {
  var s = localStorage.getItem('diario_lang');
  if (s && I18N[s]) return s;
  return (navigator.language || '').startsWith('pt') ? 'pt' : 'en';
}());
```

**`t(key)` — função de tradução com fallback:**
```javascript
function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key])
      || (I18N.pt && I18N.pt[key])
      || key;  // nunca retorna undefined
}
```

**Adicionando um novo idioma:**
1. Adicionar `I18N.xx = { ...todas as chaves... }`
2. Adicionar botão em `#lang-switcher` no HTML
3. Revisar `min-width` dos botões de toolbar se o novo idioma tiver textos mais longos

---

### 5.1 Renderização LaTeX e Markdown

**Por que KaTeX é carregado de forma síncrona (sem `defer`)?**

`mdToHtml()` chama `katex.renderToString()` diretamente. Se o script fosse `defer`, haveria condição de corrida: o usuário poderia clicar em "Preview" antes do KaTeX estar disponível e receber um erro. O carregamento síncrono bloqueia o parser HTML até o KaTeX estar pronto, garantindo que `window.katex` existe antes da IIFE executar.

**Pipeline `mdToHtml(src)`:**

```
src (string bruta com Markdown e LaTeX)
  │
  ├─ Regex /\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g
  │   → Tokeniza em segmentos: {k:'text'|'block'|'inline', v:...}
  │   → Preserva a ordem original (texto entre equações não é perdido)
  │
  └─ tokens.map()
       ├── k='block'  → renderTex(v, true)   → katex.renderToString(displayMode:true)
       ├── k='inline' → renderTex(v, false)  → katex.renderToString(displayMode:false)
       └── k='text'   → convertMarkdown(v)
             ├── escHtml()      → escapa &, <, >, "
             ├── **bold**       → <strong>
             ├── *italic*       → <em>
             ├── `code`         → <code>
             └── Loop de linhas → <blockquote>, <ul>/<li>, <p>
```

**Por que tokenizar ANTES de escapar HTML?**

Se o texto fosse escapado primeiro, expressões LaTeX como `a < b` dentro de `$a < b$` chegariam ao KaTeX como `a &lt; b` — inválido. A tokenização extrai o LaTeX puro antes de qualquer transformação de HTML.

**`renderTex(latex, display)` — tratamento de erros:**
```javascript
function renderTex(latex, display) {
  try {
    return katex.renderToString(latex, { displayMode: display, throwOnError: true });
  } catch (err) {
    // Mostra o LaTeX inválido em vermelho com a mensagem de erro
    return '<span style="color:#c0392b;...">' + escHtml(latex) + ' ⚠ ' + escHtml(err.message) + '</span>';
  }
}
```

---

### 5.2 Módulo de Caneta (SVG + Pointer Events)

Implementado como **IIFE que retorna uma API pública** (padrão módulo revelador). Todo o estado interno (`strokes[]`, `penColor`, `drawing`, etc.) é privado.

#### Sistema de coordenadas

```
.editor-wrap (position:relative)
  ├── .editor-area (overflow-y:auto, scrollable)
  │     └── .notebook-bg → conteúdo de texto
  └── #pen-svg (position:absolute, inset:0)
        └── <g id="pen-layer" transform="translate(0, -scrollTop)">
              └── <path> × N  ← coordenadas de DOCUMENTO
```

Os traços são armazenados em **coordenadas de documento** (`y = y_viewport + scrollTop`). O `<g>` recebe `transform="translate(0, -scrollTop)"` a cada evento de scroll do `.editor-area`, mantendo os traços ancorados ao conteúdo:

```javascript
editorAreaEl.addEventListener('scroll', function () {
  layerEl.setAttribute('transform',
    'translate(0,' + (-editorAreaEl.scrollTop) + ')');
}, { passive: true });
```

#### Pipeline de um traço

```
pointerdown
  → getDocCoords(e): [x, y + scrollTop]
  → rawPts = [coord]
  → makeSvgPath() cria <path> provisório na layer

pointermove (× dezenas por segundo)
  → filtra micro-movimentos < 1px
  → rawPts.push(coord)
  → requestAnimationFrame → rafFlush() atualiza path 1×/frame (batching)

pointerup
  → cancela RAF pendente
  → simplify(rawPts, 1.5) — Douglas-Peucker
  → strokes.push({ pts: simplified, c: penColor, w: penWidth })
  → notifyChange() → Pen._onStrokesChange → saveData() imediato
```

#### Algoritmo Douglas-Peucker (simplificação de traços)

Reduz o número de pontos preservando a forma visual. Redução típica: 60–80%.

```
Antes:  • • • • • • • • • •  (100 pontos brutos)
Depois:   •       •     •    (15 pontos — ε=1.5px)
```

Funções: `perpDist(p, a, b)` → `rdp(pts, eps, s, e)` → `simplify(pts, eps)`

#### Suavização por Bézier Quadrática

Em vez de `L` (linha reta entre pontos), usa `Q` (curva quadrática) com o **ponto médio** como âncora:

```javascript
function toPathD(pts) {
  var d = 'M' + pts[0];
  for (var i = 1; i < pts.length - 1; i++) {
    var mx = (pts[i][0] + pts[i+1][0]) >> 1;  // shift: divisão inteira por 2
    var my = (pts[i][1] + pts[i+1][1]) >> 1;
    d += ' Q' + pts[i] + ' ' + mx + ',' + my;
  }
  return d + ' L' + pts[pts.length-1];
}
```

Resultado visual: traços suaves e naturais sem nenhuma biblioteca externa.

#### Borracha — hit-testing geométrico

Em vez de `pointer-events: stroke` (hit area de 2px — impraticável), percorre os pontos dos traços:

```javascript
var HIT_RADIUS = 20; // px de tolerância
function eraserHitTest(docX, docY) {
  var r2 = HIT_RADIUS * HIT_RADIUS; // evita sqrt
  for (var i = strokes.length - 1; i >= 0; i--) { // trás para frente = prioridade recente
    for (var j = 0; j < strokes[i].pts.length; j++) {
      var dx = strokes[i].pts[j][0] - docX;
      var dy = strokes[i].pts[j][1] - docY;
      if (dx*dx + dy*dy <= r2) return i;
    }
  }
  return -1;
}
```

A borracha é ativada no `pointerdown` (feedback imediato) e no `pointermove` com botão pressionado (arrastar apaga múltiplos traços).

#### `requestAnimationFrame` — batching de DOM

`pointermove` dispara 60–120× por segundo. Atualizar o `<path>` em cada evento causaria jank. O batching garante no máximo 1 atualização de DOM por frame:

```javascript
function onPointerMove(e) {
  rawPts.push(getDocCoords(e));
  if (rafId === null)
    rafId = requestAnimationFrame(rafFlush); // único RAF pendente por vez
}
function rafFlush() {
  rafId = null;
  activePath.setAttribute('d', toPathD(rawPts)); // 1 update por frame
}
```

#### Limites de segurança

| Constante | Valor | Proteção |
|-----------|-------|---------|
| `MAX_STROKES` | 500 | Protege o `localStorage` (~5 MB) |
| `MAX_PTS_RAW` | 2000 | Protege memória durante desenho |
| `DP_EPSILON` | 1.5px | Controla agressividade da simplificação |
| `HIT_RADIUS` | 20px | Tolerância da borracha |
| `COLORS` (whitelist) | 6 valores | Impede injeção de cor arbitrária |

#### `buildPrintSvg()` — SVG para PDF

O `#pen-svg` overlay não pode ser usado para impressão (coordenadas absolutas + dependência de viewport). `buildPrintSvg()` gera um SVG standalone:

```javascript
// 1. Calcula bounding box de todos os pontos
// 2. viewBox = bounding box + 12px padding
// 3. Recria cada traço como <path> usando toPathD()
// 4. Retorna <svg> com width:100% e height proporcional
```

O SVG resultante é inserido no fluxo normal do documento antes de `window.print()` e removido após.

---

### 5.3 Estado e Persistência

```javascript
var STORAGE_KEY = 'meu_diario_v2'; // chave no localStorage
var entries     = [];               // array de Entry — fonte da verdade
var currentId   = null;             // ID da entrada aberta, ou null
```

**`loadData()`** — leitura com proteção:
```javascript
function loadData() {
  try { entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch (e) { entries = []; } // JSON corrompido → inicia vazio, sem quebrar
}
```

**`saveData()`** — gravação simples:
```javascript
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
```

> ⚠ **Limitação conhecida:** se o `localStorage` estiver cheio (~5 MB), `setItem` lança `QuotaExceededError` silenciosamente. O usuário perde dados sem aviso. Melhoria futura: envolver em `try/catch` e exibir toast de aviso.

---

### 5.4 Utilitários

| Função | Implementação | Uso |
|--------|--------------|-----|
| `uid()` | `Date.now().toString(36) + Math.random().toString(36).slice(2,7)` | ID de entrada |
| `fmtLong(iso)` | `toLocaleDateString('pt-BR', {weekday:'long',...})` | Cabeçalho da entrada |
| `fmtShort(iso)` | `toLocaleDateString('pt-BR', {day:'2-digit',...})` | Lista da sidebar |
| `stripForSidebar(t)` | Regex remove `**`, `*`, `` ` ``, `> `, `- `, `$` | Preview de texto puro |
| `wordCount(t)` | `stripForSidebar(t).split(/\s+/).filter(Boolean).length` | Contador de palavras |

---

### 5.5 Toast

```javascript
var toastTimer;
function showToast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');       // CSS: opacity:0→1, translateY:10px→0
  clearTimeout(toastTimer);       // reinicia se já estava visível
  toastTimer = setTimeout(function () {
    el.classList.remove('show');  // desaparece após 2,2s
  }, 2200);
}
```

O `clearTimeout` garante que toasts rápidos em sequência não se acumulam — cada novo toast reinicia o timer.

---

### 5.6 Sidebar e Lista de Entradas

```javascript
function renderList(q) {
  var filtered = entries.slice()
    .sort(function (a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); })
    .filter(function (e) {
      return e.title.toLowerCase().indexOf(q) !== -1
          || e.body.toLowerCase().indexOf(q) !== -1;
    });
  list.innerHTML = filtered.map(function (e) { ... }).join('');
  // rebinda listeners de clique (innerHTML recria os elementos)
}
```

**Re-renderização completa** a cada chamada. Para o volume típico de um diário pessoal, a simplicidade supera o custo. Para coleções grandes (500+ entradas), considerar renderização incremental com diff.

---

### 5.7 Controle de Modo

```javascript
function setMode(m) // m: 'edit' | 'pen' | 'preview'
```

| Modo | `#entry-raw` | `#entry-preview` | `#pen-svg` | `#fmt-btns` | `#pen-toolbar` |
|------|-------------|-----------------|-----------|-------------|----------------|
| `edit` | `block`, opacity 1 | `none` | passivo | `flex` | `none` |
| `pen` | `block`, opacity 0.45 | `none` | **ativo** | `none` | `flex` |
| `preview` | `none` | `block` + KaTeX | passivo | `none` | `none` |

**Detalhe crítico:** `style.display = ''` (string vazia) herda o `display:none` do CSS. Sempre usar `'block'` explicitamente para exibir elementos que têm `display:none` na folha de estilos.

**Auto-resize ao entrar em `edit`:** `autoResizeTextarea(raw)` é chamado dentro de `setMode('edit')` para recalcular a altura do textarea após ele ser tornado visível.

---

### 5.8 CRUD de Entradas

#### `openEntry(id)`
```
1. Define currentId
2. Mostra #editor-container, oculta #welcome
3. Preenche DOM: title, raw, mood
4. Pen.load(e.strokes)
5. updateStats()
6. setMode('edit')          ← torna textarea visível
7. autoResizeTextarea(raw)  ← APÓS setMode (elemento visível = scrollHeight correto)
8. renderList()             ← marca item ativo na sidebar
```

> **Por que `autoResizeTextarea` é chamado DEPOIS de `setMode`?**
> Com `display:none`, `scrollHeight` retorna 0. O textarea ficaria com height:0px. Ao abrir a entrada, nada seria visível. A ordem correta é: torna visível (`setMode`) → então mede (`autoResizeTextarea`).

#### `newEntry()`
Cria `Entry` com campos vazios, insere no início do array (`unshift`), persiste e abre.

#### `saveEntry()`
Lê título, corpo e humor do DOM, atualiza o objeto `Entry`, inclui `Pen.getStrokes()`, atualiza `updatedAt` e persiste.

#### `deleteEntry()`
Confirma via `t('cf.del')`, filtra o array, limpa o SVG (`Pen.load([])`), exibe #welcome.

---

### 5.9 Formatação via Toolbar

Dois padrões de botão, ambos operam diretamente no `#entry-raw` via `setRangeText()`:

**`[data-wrap]` — envolvimento simétrico:**
```javascript
// seleção "mundo" + wrap "**" → "**mundo**"
ta.setRangeText(w + sel + w, selectionStart, selectionEnd, 'select');
```

**`[data-prefix]` — prefixo de linha:**
```javascript
// encontra início da linha atual
var lineStart = ta.value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
ta.setRangeText(prefix, lineStart, lineStart, 'end');
```

---

### 5.10 Diálogo de Equação LaTeX

- `EQ_TMPLS` — array de `{label, val}` com 11 templates comuns.
- Botões gerados programaticamente via `createElement` (evita HTML repetitivo).
- Preview em tempo real: `katex.renderToString()` a cada `input` — síncrono, sem debounce necessário.
- Inserção: `setRangeText()` na posição do cursor em `#entry-raw`.
- Fechamento: botão Cancelar, clique no overlay, ou `Escape`.

---

### 5.11 Exportação

#### Markdown — `exportMarkdown()`

```
Entry.body (Markdown puro com LaTeX intacto)
  → front matter YAML (título, data, humor, contagem de traços)
  → "# titulo\n\n" + body
  → new Blob([content], { type: 'text/markdown;charset=utf-8' })
  → URL.createObjectURL(blob)
  → <a download="titulo.md"> programático
  → URL.revokeObjectURL() após 100ms (libera memória)
```

#### PDF — `exportPDF()`

```
1. saveEntry()
2. mdToHtml(raw.value) → prev.innerHTML  (KaTeX síncrono)
3. Injeta #print-title e #print-date no DOM
4. Pen.buildPrintSvg() → SVG com viewBox calculado → injetado após preview
5. window.print()  ← @media print oculta tudo exceto conteúdo
6. Remove elementos temporários após print()
```

---

### 5.12 Auto-resize e Wheel Forwarding

**Por que estas funções existem:**

O textarea `#entry-raw` tem `overflow:hidden`. Sem isso, ele teria seu próprio contexto de scroll interno, desacoplado do `.editor-area`. O papel de caderno ficaria parado enquanto o texto rolava — exatamente o bug de paralaxe descrito na Seção 7. Com `overflow:hidden`, o textarea não scrolla internamente e precisa crescer com o conteúdo via JS.

**`autoResizeTextarea(el)`:**
```javascript
function autoResizeTextarea(el) {
  el.style.height = 'auto';           // reseta: browser recalcula scrollHeight
  el.style.height = el.scrollHeight + 'px'; // aplica altura real do conteúdo
}
```

O reset para `'auto'` é essencial: sem ele, ao apagar texto, `scrollHeight` reportaria a altura anterior e o textarea nunca encolheria.

**Wheel forwarding:**

Mesmo com `overflow:hidden`, alguns browsers ainda capturam eventos `wheel` no textarea sem bublar para o pai. O forwarding manual garante que o scroll chega ao `.editor-area`:

```javascript
raw.addEventListener('wheel', function (e) {
  var delta = e.deltaY;
  if (e.deltaMode === 1) delta *= 20;              // linhas → pixels
  if (e.deltaMode === 2) delta *= area.clientHeight; // páginas → pixels
  area.scrollTop += delta;
  e.preventDefault(); // evita tentativa dupla do browser
}, { passive: false });
```

---

### 5.13 Auto-save com Debounce

```javascript
var debTimer;
function debSave() {
  clearTimeout(debTimer);
  debTimer = setTimeout(saveEntry, 1800); // 1,8 segundos
}
```

Chamado por: `input` no textarea, `input` no título, `change` no mood. O módulo Pen salva **imediatamente** após cada traço completo — sem debounce, pois traços são eventos discretos.

---

### 5.14 Tela Cheia (Fullscreen API)

```javascript
function toggleFullscreen() {
  if (!isFullscreen()) {
    document.documentElement.requestFullscreen
      || document.documentElement.webkitRequestFullscreen
      || ...
  } else {
    document.exitFullscreen || document.webkitExitFullscreen || ...
  }
}
```

Prefixos cobertos: sem prefixo (padrão), `-webkit-` (Safari), `-moz-` (Firefox legado), `-ms-` (IE/Edge legado).

O evento `fullscreenchange` (e prefixos) chama `updateFsIcon()` — sincroniza o ícone quando o usuário sai via `Escape` sem clicar no botão.

---

### 5.15 Atalhos de Teclado e Fiação de Eventos

| Atalho | Contexto | Ação |
|--------|----------|------|
| `Ctrl/Cmd + S` | Qualquer | Salvar entrada |
| `Ctrl/Cmd + Z` | Modo caneta ativo | Desfazer último traço |
| `F` (maiúsculo) | Foco fora de input | Alternar tela cheia |
| `Escape` | Modal equação aberto | Fechar modal |

> **Nota:** há dois blocos "SEÇÃO 14" no código (atalhos e fiação). Isso é um bug menor de numeração — não afeta o funcionamento mas deve ser corrigido em manutenção.

---

### 5.16 Inicialização

```javascript
// Ordem obrigatória:
Pen.init(svgEl, layerEl, editorAreaEl); // 1. SVG listeners registrados
loadData();                              // 2. entries[] carregado do localStorage
applyLocale(currentLang);               // 3. DOM traduzido, mood-select, pen toolbar
if (entries.length) openEntry(latest);  // 4. entrada mais recente aberta
```

O script está no final do `<body>` — o DOM está completamente parseado quando os `addEventListener` são registrados.

---

## 6. Modelo de Dados

### Chaves no `localStorage`

| Chave | Tipo | Conteúdo |
|-------|------|---------|
| `meu_diario_v2` | JSON array | Array de `Entry` |
| `diario_lang` | string | `'pt'` ou `'en'` |

### Schema `Entry`

```typescript
interface Entry {
  id:        string;    // uid() — base36 timestamp + sufixo aleatório
  title:     string;    // texto bruto — NUNCA HTML
  body:      string;    // Markdown + LaTeX bruto — NUNCA HTML
  mood:      string;    // emoji ou string vazia
  strokes:   Stroke[];  // anotações manuscritas
  createdAt: string;    // ISO 8601 — imutável após criação
  updatedAt: string;    // ISO 8601 — atualizado a cada save
}

interface Stroke {
  pts: [number, number][]; // pontos [x, y] simplificados (inteiros)
  c:   string;             // cor (whitelist de 6 valores)
  w:   number;             // espessura em px (0.5–8)
}
```

**Invariante crítica:** `body` e `title` são sempre texto puro. HTML nunca é persistido. A conversão ocorre somente em memória em `mdToHtml()` no momento do preview.

### Estimativa de tamanho no `localStorage`

| Cenário | Tamanho |
|---------|---------|
| Entrada de texto (~500 palavras) | ~3 KB |
| Entrada com 50 traços manuscritos | ~10 KB |
| Limite total do `localStorage` | ~5 MB |
| Entradas médias antes de atingir limite | ~400 entradas |

---

## 7. O Bug do Paralaxe — Diagnóstico e Solução

Esta seção documenta o problema mais complexo encontrado no projeto: o **desalinhamento do papel de caderno com o texto ao fazer scroll**.

### Descrição do bug

Ao rolar o conteúdo de uma entrada longa, as linhas horizontais do papel de caderno ficavam paradas enquanto o texto se movia. O efeito visual era de duas camadas se movendo em velocidades diferentes — o paralaxe clássico.

### Primeira tentativa — `background-attachment: local` (falhou)

A primeira abordagem foi mover o background de linhas de `.main::before` para o `.editor-area` com `background-attachment: local`:

```css
/* TENTATIVA 1 — NÃO FUNCIONOU */
.editor-area {
  background-image: repeating-linear-gradient(...);
  background-attachment: local; /* deveria rolar com o conteúdo */
}
```

**Por que falhou:** `background-attachment: local` é suportado na spec mas tem comportamento inconsistente quando o elemento usa `display: flex`. Em alguns browsers o background não seguia o scroll do conteúdo.

### Segunda tentativa — div wrapper `.notebook-bg` (falhou)

Para contornar o problema com `background-attachment`, o background foi movido para um `div` filho dentro do `.editor-area`:

```css
/* TENTATIVA 2 — FALHOU PELA DEPENDÊNCIA CIRCULAR */
.editor-area  { display: flex; flex-direction: column; }
.notebook-bg  { flex: 1; background-image: linhas... }
#entry-raw    { flex: 1; }
```

**Por que falhou:** `flex: 1` em `.notebook-bg` dentro de um flex container é equivalente a `flex: 1 1 0`. Com `flex-basis: 0`, o algoritmo flexbox determina o tamanho do item **primeiro** e só depois considera o conteúdo. Com `overflow-y: auto` no pai, o item era fixado em exatamente a altura do viewport (ex: 600px). O conteúdo do textarea que excedia 600px transbordava o item, mas o background de linhas só cobria os primeiros 600px. Ao rolar abaixo disso, o texto aparecia sem linhas.

Adicionalmente, `flex: 1` em `#entry-raw` dentro de `.notebook-bg` criava uma dependência circular: o filho tentava preencher o pai, e o pai dependia do filho para saber sua altura. O resultado era colapso ou altura imprevisível.

### Solução definitiva — bloco puro sem flex

```css
/* SOLUÇÃO FINAL */
.editor-area {
  flex: 1;           /* necessário para preencher .editor-wrap */
  overflow-y: auto;  /* único scroll container — sem display:flex */
}

.notebook-bg {
  min-height: 100%;  /* ao menos viewport; cresce com conteúdo */
  padding: 28px 30px 28px 96px;
  /* SEM display:flex, SEM flex:1 */
  background-image:
    linear-gradient(to right, ...),  /* margem vermelha */
    repeating-linear-gradient(...);  /* linhas de caderno */
}

#entry-raw {
  display: block;
  min-height: 60vh;
  overflow: hidden;  /* sem scroll interno */
  /* SEM flex:1 */
}
```

**Por que funciona:**

1. `.editor-area` sem `display: flex` é um **container de scroll convencional** (block com overflow-y: auto). Seu único filho `.notebook-bg` é um elemento de bloco normal.

2. `.notebook-bg` se dimensiona pelo seu conteúdo. `min-height: 100%` garante que ele preenche o viewport mesmo quando o conteúdo é curto. Quando o conteúdo cresce (textarea com muitas linhas), `.notebook-bg` cresce junto.

3. O background de linhas está no `.notebook-bg`. Como é um elemento de bloco **dentro** do scroll container, ele **se move naturalmente** com o scroll — não precisa de `background-attachment`, não precisa de transform, não precisa de nenhuma propriedade especial. É o comportamento padrão do DOM.

4. `#entry-raw` com `overflow: hidden` não tem scroll interno. `autoResizeTextarea()` mantém a altura do textarea igual ao seu `scrollHeight` — o textarea cresce em vez de rolar. Com isso, papel e texto vivem no mesmo contexto de scroll e sempre se movem juntos.

### Diagrama comparativo

```
ANTES (com paralaxe):
.main (background de linhas — FIXO)
  └── .editor-area (overflow-y: auto)
        └── #entry-raw (scroll interno próprio — SEPARADO do background)

DEPOIS (sem paralaxe):
.editor-area (overflow-y: auto — único scroll)
  └── .notebook-bg (background de linhas — MOVE COM O SCROLL)
        └── #entry-raw (overflow:hidden + autoResize — sem scroll próprio)
```

A regra fundamental é: **o background e o texto devem estar no mesmo contexto de scroll**. A única forma garantida de isso acontecer é que ambos sejam filhos do mesmo container de scroll, e o textarea não tenha seu próprio mecanismo de scroll.

---

## 8. Atalhos de Teclado

| Atalho | Condição | Ação |
|--------|----------|------|
| `Ctrl+S` / `Cmd+S` | Qualquer | Salvar + toast |
| `Ctrl+Z` / `Cmd+Z` | Modo caneta ativo | Desfazer último traço |
| `F` (maiúsculo) | Foco fora de input/textarea | Alternar tela cheia |
| `Escape` | Modal equação aberto | Fechar modal |

---

## 9. Guia de Manutenção

### Corrigir numeração duplicada da Seção 14
Renomear a segunda "SEÇÃO 14 — FIAÇÃO DE EVENTOS" para SEÇÃO 15, e "SEÇÃO 15 — INICIALIZAÇÃO" para SEÇÃO 16.

### Adicionar novo idioma
1. `I18N.xx = { ...copiar todas as chaves de I18N.pt... }`
2. `<button class="lang-btn" data-lang="xx">` no HTML
3. Revisar `min-width` dos botões se textos forem mais longos

### Adicionar cor à caneta
Em `buildToolbar()` no módulo Pen, array `COLORS_LABELED`:
```javascript
{ hex: '#valor', key: 'col.novakey' }
// + adicionar 'col.novakey': 'Nome' em I18N.pt e I18N.en
```

### Alterar intervalo do auto-save
```javascript
debTimer = setTimeout(saveEntry, 1800); // ← ms
```

### Alterar cores do tema
Apenas em `:root` — o restante herda:
```css
:root { --warm: #nova-cor; }
```

### Adicionar template de equação
Array `EQ_TMPLS` (Seção 10):
```javascript
{ label: 'Nome', val: '\\comando{latex}' }
```

### Migrar dados de versão anterior
```javascript
// Adicionar antes de loadData() na inicialização
var v1 = localStorage.getItem('meu_diario_v1');
if (v1 && !localStorage.getItem('meu_diario_v2')) {
  localStorage.setItem('meu_diario_v2', v1);
}
```
