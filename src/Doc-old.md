> **AVISO: DOCUMENTAÇÃO LEGADA**
> Este documento descreve uma versão anterior do iScrev Notes que era um arquivo único e usava exclusivamente `localStorage`. A arquitetura atual é modular, utiliza IndexedDB e possui funcionalidades adicionais.
> 
> Para a documentação atualizada, consulte:
> - **Documentação Técnica Principal (`src/DOCUMENTACAO.md`)**
> - **Histórico Técnico Completo (`src/iScrev-Notes-Historico-Tecnico.md`)**

---
# Meu Diário — Documentação de Arquitetura e Implementação

> **Arquivo:** `diario.html` · **~2.730 linhas** · **~110 KB**  
> **Stack:** HTML5 · CSS3 · JavaScript ES5 · KaTeX 0.16.11  
> **Paradigma:** SPA single-file, zero build step, zero backend, zero dependências JS externas

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Estrutura do Arquivo](#2-estrutura-do-arquivo)
3. [HTML — Estrutura e Semântica](#3-html--estrutura-e-semântica)
4. [CSS — Sistema de Design e Layout](#4-css--sistema-de-design-e-layout)
5. [JavaScript — Módulos e Seções](#5-javascript--módulos-e-seções)
6. [Modelo de Dados](#6-modelo-de-dados)
7. [Fluxos de Dados Principais](#7-fluxos-de-dados-principais)
8. [Histórico de Desenvolvimento e Bugs Corrigidos](#8-histórico-de-desenvolvimento-e-bugs-corrigidos)

---

## 1. Visão Geral

O aplicativo é uma **SPA autocontida em um único arquivo HTML**. Não requer servidor, instalação, build ou banco de dados. Todo o dado persiste no `localStorage` do browser do usuário. A filosofia central é: abrir o arquivo em qualquer browser moderno e funcionar completamente offline.

### Funcionalidades

| Módulo | O que faz |
|--------|-----------|
| Editor de texto | Textarea com Markdown básico e suporte a LaTeX |
| Renderização LaTeX | Equações inline `$...$` e bloco `$$...$$` via KaTeX síncrono |
| Caneta manuscrita | Anotações SVG com suavização Bézier e borracha geométrica |
| Três modos | Editar / Caneta / Preview — cada um com UI e comportamento distintos |
| CRUD | Criar, abrir, salvar (auto + manual), excluir entradas |
| Busca | Filtro em tempo real por título e corpo |
| Humor | Emoji associado a cada entrada |
| Exportação Markdown | `.md` com YAML front matter incluindo traços em base64 |
| Exportação PDF | `window.print()` com SVG de anotações standalone |
| Importação Markdown | Lê `.md` exportado, restaura texto e traços manuscritos |
| Tela cheia | Fullscreen API nativa com ícone alternável e atalho de teclado |
| Internacionalização | PT/BR e EN com detecção automática e troca sem reload |

---

## 2. Estrutura do Arquivo

O projeto é composto por **três arquivos** que devem estar no mesmo diretório:

```
meu-diario/
├── diario.html   (~12 KB)  — estrutura HTML + referências
├── diario.css    (~25 KB)  — todo o CSS da aplicação
└── diario.js     (~77 KB)  — todo o JavaScript da aplicação
```

> **Versão single-file (legada):** o projeto foi originalmente desenvolvido como um único `diario.html` autocontido. A separação em três arquivos foi realizada preservando todo o comportamento. Para uso offline portátil, o single-file continua funcional.

### Como servir o projeto

Os arquivos precisam ser servidos via HTTP — não funcionam com o protocolo `file://` quando separados (o browser bloqueia carregamento de scripts locais por CORS). Opções simples:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code
# Extensão "Live Server" → botão "Go Live"
```

Depois acesse `http://localhost:8080/diario.html`.

> **`file://` e arquivos separados:** browsers modernos bloqueiam `<script src="...">` e `<link rel="stylesheet" href="...">` quando o HTML é aberto diretamente como arquivo local (`file://`). Para uso sem servidor, use a versão single-file original que embute CSS e JS em `<style>` e `<script>` inline.

### Estrutura interna de cada arquivo

```
diario.html  (~12 KB)
  ├── <head>
  │   ├── meta charset, viewport, title
  │   ├── Google Fonts (4 famílias, CDN assíncrono)
  │   ├── KaTeX CSS (CDN)
  │   ├── KaTeX JS  (CDN, SÍNCRONO — sem defer/async)
  │   └── <link rel="stylesheet" href="diario.css">
  └── <body>
      ├── .app → aside.sidebar + main.main
      ├── #toast
      ├── .eq-overlay
      └── <script src="diario.js">  ← ao final do body

diario.css  (~25 KB, 548 linhas)
  ├── Reset universal
  ├── Tokens de design (:root)
  ├── Base (html, body, .app)
  ├── Sidebar e filhos
  ├── Main + Toolbar + Pen toolbar
  ├── Editor wrap, editor-area, notebook-bg
  ├── #entry-raw, #entry-preview, #pen-svg
  ├── Header controls (lang-switcher, btn-fullscreen)
  ├── Toast, Welcome, Equação dialog
  ├── @media print
  └── @media responsive (max-width: 640px)

diario.js  (~77 KB, 1951 linhas)
  └── IIFE com 'use strict'
      ├── SEÇÃO 0  — i18n
      ├── SEÇÃO 1  — LaTeX + Markdown
      ├── SEÇÃO 2  — Módulo Pen (IIFE interna)
      ├── SEÇÃO 3  — Estado e Persistência
      ├── SEÇÃO 4  — Utilitários
      ├── SEÇÃO 5  — Toast
      ├── SEÇÃO 6  — Sidebar
      ├── SEÇÃO 7  — Controle de Modo
      ├── SEÇÃO 8  — CRUD
      ├── SEÇÃO 9  — Formatação Toolbar
      ├── SEÇÃO 10 — Diálogo de Equação
      ├── SEÇÃO 11 — Exportação + Importação
      ├── SEÇÃO 12 — Auto-resize + Wheel Forwarding
      ├── SEÇÃO 13 — Auto-save
      ├── SEÇÃO 14 — Fullscreen API
      ├── SEÇÃO 14 — Atalhos + Fiação (número duplicado — bug menor)
      └── SEÇÃO 15 — Inicialização
```

---

### Decisões de arquitetura do JavaScript

**Por que uma IIFE?**  
Todo o JS está em `(function(){ 'use strict'; ... })()`. Isso cria escopo privado — nenhuma variável polui `window`, evitando conflito com scripts externos como o KaTeX que escreve `window.katex`. Em arquivos `.js` separados, módulos ES6 seriam a alternativa moderna, mas a IIFE mantém compatibilidade com browsers que não suportam `type="module"`.

**Por que KaTeX é síncrono (sem `defer`)?**  
`mdToHtml()` chama `katex.renderToString()` diretamente e de forma síncrona. Se o script fosse `defer`, o usuário poderia clicar em Preview antes do KaTeX carregar e receber um erro. O `<script>` síncrono no `<head>` bloqueia o parser HTML até `window.katex` estar disponível, garantindo que a IIFE do `diario.js` (que está no final do `<body>`) sempre encontre a biblioteca pronta.

**Por que `diario.js` fica no final do `<body>`?**  
O script registra `addEventListener` em elementos criados no HTML. Se ficasse no `<head>`, o DOM ainda não teria sido parseado e todos os `getElementById` retornariam `null`. Posicionar ao final do `<body>` garante que o DOM completo está disponível no momento da execução — sem necessidade de `DOMContentLoaded`.



### Hierarquia DOM completa

```
body
└── .app  (display:flex, height:100vh — container raiz do layout)
    │
    ├── aside.sidebar  (width:280px fixo, flex-direction:column)
    │   ├── .sidebar-header  (logo + controles de header)
    │   │   ├── .logo
    │   │   │   ├── span#logo-title        ← i18n: "Meu Diário" / "My Diary"
    │   │   │   └── span#logo-sub          ← i18n: "anotações pessoais" / "personal notes"
    │   │   └── .header-controls  (space-between: idioma à esq, fullscreen à dir)
    │   │       ├── .lang-switcher#lang-switcher
    │   │       │   ├── button.lang-btn[data-lang="pt"]  ← PT com span.lang-code
    │   │       │   └── button.lang-btn[data-lang="en"]  ← EN com span.lang-code
    │   │       └── button#btn-fullscreen  ← SVG inline alternável expand/compress
    │   ├── button.btn-new#btn-new         ← ação principal: nova entrada
    │   ├── button.btn-import#btn-import-md ← ação secundária: importar .md
    │   ├── .search-wrap
    │   │   └── input#search-input         ← busca em tempo real
    │   └── .entries-list                  ← preenchida por renderList()
    │
    └── main.main  (flex:1, flex-direction:column)
        ├── div#welcome         ← exibido quando nenhuma entrada está aberta
        └── div#editor-container ← exibido com entrada aberta (display:flex)
            ├── div.toolbar     ← botões de formatação, modos, humor, ações
            ├── div.pen-toolbar ← visível só no modo caneta (cores, espessuras, ações)
            └── div.editor-wrap ← containing block do SVG overlay
                ├── div.editor-area#editor-area  ← ÚNICO scroll container
                │   └── div.notebook-bg          ← papel + conteúdo (bloco puro)
                │       ├── div.entry-date-display#entry-date-display
                │       ├── input#entry-title
                │       ├── textarea#entry-raw    ← modo editar e caneta
                │       └── div#entry-preview     ← modo preview (HTML renderizado)
                └── svg#pen-svg  ← overlay de anotações (position:absolute, inset:0)
                    └── g#pen-layer  ← filhos são <path> dos traços; recebe transform de scroll

div#toast         ← notificação flutuante (position:fixed)
div.eq-overlay    ← modal de inserção de equação (position:fixed)
    └── div.eq-dialog
```

### Atributos de dados usados pelo JavaScript

| Atributo | Elementos | Finalidade |
|----------|-----------|-----------|
| `data-lang` | `.lang-btn` | Código do idioma (`'pt'`, `'en'`) lido por `applyLocale` |
| `data-label` | `.lang-btn`, `#btn-fullscreen` | Texto do tooltip atualizado por i18n |
| `data-wrap` | `.toolbar-btn` | Delimitador simétrico para formatação (`**`, `*`) |
| `data-prefix` | `.toolbar-btn` | Prefixo de linha para formatação (`> `, `- `) |
| `data-id` | `.entry-item` | ID da entrada, lido no clique para `openEntry()` |
| `data-idx` | `<path>` no SVG | Índice do traço no array `strokes[]` (legacy do DOM hit-test) |

---

## 4. CSS — Sistema de Design e Layout

### 4.1 Tokens de Design (CSS Custom Properties)

Toda a paleta de cores passa pelos tokens definidos em `:root`. Alterar um token atualiza todo o projeto:

```css
:root {
  --ink:     #1a1209;              /* cor de tinta — texto principal */
  --paper:   #f5efe0;              /* fundo papel — área de edição */
  --paper2:  #ede6d0;              /* papel escuro — toolbar, stats-bar */
  --warm:    #c8843a;              /* laranja âmbar — destaque principal */
  --warm-lt: #e8b96a;              /* laranja claro — logo, texto secundário */
  --rust:    #8b3a1f;              /* ferrugem — cor secundária */
  --math-bg: #fdf6e8;              /* fundo de blocos de equação */
  --math-bd: rgba(200,132,58,.3);  /* borda de equação */
  --line:    rgba(200,132,58,.22); /* cor das linhas de caderno */
}
```

### 4.2 Tipografia

| Família | Origem | Uso no projeto |
|---------|--------|----------------|
| **Dancing Script** | Google Fonts | Logo, data de exibição da entrada |
| **Playfair Display** | Google Fonts | Título da entrada, cabeçalhos, tela de boas-vindas |
| **Lora** | Google Fonts | Corpo do texto, botões, labels, UI geral |
| **JetBrains Mono** | Google Fonts | Textarea de edição (código/Markdown), templates de equação |

### 4.3 Layout — Cadeia de Flex Containers

O layout é construído com flex containers aninhados. Cada nível tem uma responsabilidade única:

```
html/body (height:100%, overflow:hidden)
  └── .app (display:flex, height:100vh)
        ├── .sidebar (width:280px, flex-direction:column)
        │     ← largura fixa; cresce verticalmente para preencher a viewport
        │
        └── .main (flex:1, display:flex, flex-direction:column, overflow:hidden)
              ├── .toolbar (flex-wrap:wrap, min-height:50px)
              ├── .pen-toolbar (display:none por padrão)
              └── .editor-wrap (flex:1, position:relative, overflow:hidden)
                    ← containing block do #pen-svg (position:absolute)
                    ← overflow:hidden clipar o SVG nos limites visíveis
                    │
                    ├── .editor-area (flex:1, overflow-y:auto)
                    │     ← ÚNICO scroll container do projeto
                    │     ← sem display:flex (imprescindível para notebook-bg crescer)
                    │     └── .notebook-bg (bloco puro, min-height:100%)
                    │           ← cresce com o conteúdo
                    │           ← carrega background de linhas e margem
                    │
                    └── #pen-svg (position:absolute, inset:0, z-index:5)
                          ← cobre exatamente a área do editor-wrap
                          ← pointer-events:none por padrão (não bloqueia texto)
                          ← pointer-events:all quando .pen-active
```

### 4.4 O Efeito de Papel de Caderno

As linhas horizontais e a margem vermelha são geradas por CSS puro, sem imagens. O background fica no `.notebook-bg` (não no container de scroll), o que resolve o bug de paralaxe:

```css
.notebook-bg {
  min-height: 100%;
  padding: 28px 30px 28px 96px;

  background-image:
    /* Camada 1 (topo): margem vermelha vertical — 1.5px na posição 90px */
    linear-gradient(
      to right,
      transparent 89px,
      rgba(200,60,40,.18) 89px,
      rgba(200,60,40,.18) 90.5px,
      transparent 90.5px
    ),
    /* Camada 2 (base): linhas horizontais a cada 28px */
    repeating-linear-gradient(
      transparent,
      transparent 27px,
      var(--line) 27px,
      var(--line) 28px
    );
}
```

**Por que 28px?** O `#entry-raw` tem `line-height: 28px`. Cada linha de texto coincide com uma linha do papel — como em um caderno físico de pautas.

**Por que `min-height: 100%`?** Garante que o fundo cobre ao menos o viewport inteiro mesmo quando o conteúdo é curto. Quando o conteúdo cresce, `.notebook-bg` cresce com ele, estendendo as linhas.

### 4.5 Estabilidade de Layout na Troca de Idioma

Ao trocar de PT para EN, textos de botões mudam de comprimento ("Caneta" → "Pen"). Sem proteção, a toolbar teria saltos visuais. A solução é `min-width` fixo em cada botão, calculado para o texto mais longo entre os idiomas:

```css
.mode-btn   { min-width: 62px; }  /* "✒ Caneta" (PT) */
.btn-eq     { min-width: 88px; }  /* "∑ Equation" (EN) */
.btn-save   { min-width: 64px; }  /* "Salvar" (PT) */
.btn-delete { min-width: 66px; }  /* "Excluir" (PT) */
.pen-section-label { min-width: 68px; } /* "Espessura:" (PT) */
```

`min-height: 50px` na `.toolbar` evita que ela colapse para 2 linhas em um idioma e 1 linha no outro.

### 4.6 SVG Overlay de Anotações

```css
#pen-svg {
  position: absolute;
  inset: 0;           /* cobre todo o editor-wrap */
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;  /* transparente para mouse por padrão */
  touch-action: none;    /* evita scroll do browser durante desenho */
}
#pen-svg.pen-active { pointer-events: all; cursor: crosshair; }
#pen-svg.pen-eraser { cursor: cell; }
```

O SVG não tem `overflow:hidden` — o clip vem do `.editor-wrap` pai. Isso permite que o SVG use coordenadas de documento sem truncamento.

### 4.7 Seletor de Idioma — Pílulas Tipográficas

Cada botão é uma pílula com dimensões fixas (`width: 64px, height: 28px`) para que PT e EN ocupem exatamente o mesmo espaço. Estados:

- **Inativo:** `outline: 1.5px solid #3a2a12`, texto `#6a5030` apagado
- **Hover:** `outline-color: var(--warm)`, leve `translateY(-1px)`
- **Ativo:** `background: var(--warm)`, `box-shadow` laranja

Tooltip via `::after` com `content: attr(data-label)`, aparece abaixo com triângulo `::before`. O botão ativo não exibe tooltip (tem `display:none` nos pseudo-elementos).

### 4.8 Botão de Tela Cheia

Mesmo vocabulário visual das pílulas de idioma. Ícone SVG inline que troca entre expand e compress via `innerHTML` do elemento `#fs-icon`. O botão `.is-fullscreen` recebe fundo `var(--warm)` idêntico ao botão de idioma ativo.

### 4.9 CSS de Impressão (`@media print`)

Transforma o layout para exportação PDF:

```css
@media print {
  /* Oculta tudo que não é conteúdo */
  .sidebar, .toolbar, .pen-toolbar, .stats-bar { display:none !important }

  /* Desmonta o layout flex para fluxo de documento normal */
  html, body { overflow:visible; height:auto; background:#fff }
  .app        { display:block }

  /* Remove linhas de caderno da impressão */
  .notebook-bg { padding:0; background-image:none }

  /* Mostra preview HTML em vez do textarea */
  #entry-raw     { display:none !important }
  #entry-preview { display:block !important }

  /* Oculta o overlay — ele usa coordenadas de tela */
  #pen-svg { display:none !important }

  /* SVG standalone gerado por buildPrintSvg() aparece no fluxo */
  #print-svg-tmp { display:block !important; width:100% !important }
}
```

---

## 5. JavaScript — Módulos e Seções

Todo o código está dentro de uma IIFE (`use strict`). As seções são blocos consecutivos com comentários delimitadores, não módulos ES6 — compatibilidade máxima com browsers antigos.

### SEÇÃO 0 — Internacionalização (i18n)

**Papel:** fornecer strings traduzidas para todos os outros módulos e atualizar o DOM quando o idioma muda.

**Componentes:**

`I18N` — objeto estático com dois blocos (`pt`, `en`). Chaves seguem a convenção `modulo.elemento`:
```javascript
var I18N = {
  pt: { 'btn.new': 'Nova Entrada', 'mode.edit': 'Editar', ... },
  en: { 'btn.new': 'New Entry',    'mode.edit': 'Edit',   ... }
};
```

`currentLang` — IIFE de detecção automática na primeira visita:
```javascript
var currentLang = (function () {
  var s = localStorage.getItem('diario_lang');
  if (s && I18N[s]) return s;
  return (navigator.language || '').startsWith('pt') ? 'pt' : 'en';
}());
```

`t(key)` — função de tradução com duplo fallback:
```javascript
function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key])
      || (I18N.pt && I18N.pt[key])
      || key; // nunca retorna undefined
}
```

`applyLocale(lang)` → `doApply(lang)` — separadas para permitir chamada direta sem efeitos colaterais. `doApply` executa em sequência:
1. Atualiza `currentLang` e persiste no `localStorage`
2. Define `document.documentElement.lang` (acessibilidade)
3. Percorre `TEXT_MAP` (array de `[id, chave, tipo]`) e atualiza `textContent`, `placeholder` ou `title`
4. Recria as `<option>` do `#mood-select` preservando a seleção atual
5. Atualiza o estado ativo (`.active`) dos botões de idioma
6. Chama `Pen.buildToolbar()` para traduzir labels de cores e espessuras
7. Chama `updateStats()` para traduzir "palavra/palavras"
8. Chama `renderList()` para traduzir "Nenhuma entrada ainda"

**Por que `TEXT_MAP` em vez de `data-i18n`?** A abordagem de atributo `data-i18n` exigiria varredura DOM completa a cada troca. Com `TEXT_MAP` explícito, só os elementos que realmente mudam são tocados — sem querySelector global.

---

### SEÇÃO 1 — Renderização LaTeX e Markdown

**Papel:** converter texto Markdown+LaTeX bruto em HTML para o modo Preview.

**Pipeline `mdToHtml(src)`:**

```
src (string bruta)
  │
  ↓  tokenizar com regex /\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g
  │
  → array de tokens: { k: 'text'|'inline'|'block', v: string }
  │     ↑ preserva a ordem original do conteúdo
  │
  ↓  tokens.map()
       ├── k='block'  → renderTex(v, true)   → katex.renderToString(displayMode:true)
       ├── k='inline' → renderTex(v, false)  → katex.renderToString(displayMode:false)
       └── k='text'   → convertMarkdown(v)
             ├── escHtml()   → escapa &, <, >, "
             ├── **bold**    → <strong>
             ├── *italic*    → <em>
             ├── `code`      → <code>
             └── loop de linhas: > → blockquote, - → ul/li, else → p
```

**Por que tokenizar antes de escapar?** LaTeX usa `<` e `>` em expressões como `a < b`. Se `escHtml()` fosse aplicado antes da extração, o KaTeX receberia `a &lt; b` — código inválido. A tokenização isola o LaTeX antes de qualquer transformação.

`renderTex(latex, display)` — trata erros com visual inline em vermelho sem interromper o resto do preview:
```javascript
catch (err) {
  return '<span style="color:#c0392b">' + escHtml(latex) + ' ⚠ ' + escHtml(err.message) + '</span>';
}
```

---

### SEÇÃO 2 — Módulo de Caneta (SVG + Pointer Events)

**Papel:** capturar entrada de ponteiro, gerar traços SVG suaves, persistir e apagar anotações. É o módulo mais complexo do projeto.

**Padrão:** IIFE que retorna objeto com API pública. Todo o estado é privado.

**Variáveis privadas principais:**

| Variável | Tipo | Papel |
|----------|------|-------|
| `strokes` | `Stroke[]` | Array de traços persistidos |
| `drawing` | `boolean` | Se um traço está em progresso |
| `rawPts` | `[x,y][]` | Pontos brutos do traço atual |
| `activePath` | `SVGPathElement` | `<path>` provisório durante o desenho |
| `eraserMode` | `boolean` | Se a borracha está ativa |
| `penColor` | `string` | Cor ativa (whitelist) |
| `penWidth` | `number` | Espessura ativa (0.5–8px) |
| `rafId` | `number` | ID do `requestAnimationFrame` pendente |

**Constantes de segurança:**

| Constante | Valor | Proteção |
|-----------|-------|---------|
| `MAX_STROKES` | 500 | Limite de traços por entrada — protege `localStorage` |
| `MAX_PTS_RAW` | 2000 | Limite de pontos brutos durante desenho — protege RAM |
| `DP_EPSILON` | 1.5px | Tolerância do Douglas-Peucker |
| `HIT_RADIUS` | 20px | Raio da borracha geométrica |

#### Sistema de coordenadas

Os traços são armazenados em **coordenadas de documento**: `x` é relativo ao `#pen-svg`, `y` inclui `scrollTop` do `.editor-area`. A `<g id="pen-layer">` recebe `transform="translate(0,-scrollTop)"` a cada evento de scroll, mantendo os traços ancorados ao conteúdo.

```javascript
function getDocCoords(e) {
  var rect = svgEl.getBoundingClientRect();
  return [
    Math.round(e.clientX - rect.left),
    Math.round(e.clientY - rect.top + editorAreaEl.scrollTop) // coordenada de documento
  ];
}

function syncScroll() {
  layerEl.setAttribute('transform', 'translate(0,' + (-editorAreaEl.scrollTop) + ')');
}
```

#### Pipeline de um traço

```
pointerdown
  → getDocCoords(e)
  → rawPts = [coord]
  → makeSvgPath() → <path> provisório appended na layer

pointermove (×N vezes por segundo)
  → filtra micro-movimentos < 1px
  → rawPts.push(coord)
  → requestAnimationFrame(rafFlush) — só 1 RAF pendente por vez
      → activePath.setAttribute('d', toPathD(rawPts))

pointerup
  → cancela RAF pendente
  → simplify(rawPts, 1.5) — Douglas-Peucker
  → strokes.push({ pts: simplified, c, w })
  → path.dataset.idx = strokes.length - 1
  → notifyChange() → Pen._onStrokesChange → saveData() imediato
```

#### Suavização Bézier Quadrática

Em vez de linhas retas (`L`), cada segmento usa curva quadrática (`Q`) com o **ponto médio** como âncora:

```javascript
function toPathD(pts) {
  var d = 'M' + pts[0][0] + ',' + pts[0][1];
  for (var i = 1; i < pts.length - 1; i++) {
    var mx = (pts[i][0] + pts[i+1][0]) >> 1; // divisão inteira por 2
    var my = (pts[i][1] + pts[i+1][1]) >> 1;
    d += ' Q' + pts[i][0] + ',' + pts[i][1] + ' ' + mx + ',' + my;
  }
  return d + ' L' + pts[pts.length-1][0] + ',' + pts[pts.length-1][1];
}
```

O resultado são traços suaves e naturais sem biblioteca externa.

#### Algoritmo Douglas-Peucker

Reduz o número de pontos preservando a forma visual. Redução típica: 60–80%.

```
rdp(pts, ε=1.5, inicio, fim):
  1. Encontra o ponto mais distante da linha inicio→fim
  2. Se distância > ε: mantém e recursiona nos dois segmentos
  3. Se distância ≤ ε: descarta todos os pontos intermediários
```

#### Borracha — Hit-test Geométrico

Não usa `pointer-events: stroke` (hit area de ~2px, impraticável). Em vez disso, percorre os pontos armazenados de todos os traços usando distância euclidiana ao quadrado:

```javascript
function eraserHitTest(docX, docY) {
  var r2 = 20 * 20; // HIT_RADIUS²
  for (var i = strokes.length - 1; i >= 0; i--) { // trás pra frente = prioridade recente
    for (var j = 0; j < strokes[i].pts.length; j++) {
      var dx = strokes[i].pts[j][0] - docX;
      var dy = strokes[i].pts[j][1] - docY;
      if (dx*dx + dy*dy <= r2) return i;
    }
  }
  return -1;
}
```

A borracha age no `pointerdown` (feedback imediato) e no `pointermove` com botão pressionado (`e.buttons !== 0`), permitindo arrastar para apagar múltiplos traços.

#### `buildPrintSvg()` — SVG para PDF

O overlay `#pen-svg` usa `position:absolute` com coordenadas que incluem `scrollTop`. Em `@media print` não há viewport nem scrollTop — os traços ficariam fora da área. `buildPrintSvg()` gera um SVG autossuficiente:

1. Itera todos os pontos de todos os traços e calcula `minX`, `minY`, `maxX`, `maxY`
2. Define `viewBox = (minX-12) (minY-12) (width+24) (height+24)` com padding de 12px
3. Recria cada traço como `<path>` com as mesmas coordenadas — mas o `viewBox` as normaliza automaticamente
4. Retorna o `<svg>` com `width:100%` e altura proporcional ao bounding box

#### `buildToolbar()` e `rewire()`

`buildToolbar()` é chamada múltiplas vezes (uma em `init()`, outra em cada `applyLocale()`). Para evitar acúmulo de listeners nos botões de ação, usa `rewire(id, handler)`:

```javascript
function rewire(id, handler) {
  var oldBtn = document.getElementById(id);
  if (!oldBtn) return null;
  var newBtn = oldBtn.cloneNode(true); // cópia sem listeners
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  newBtn.addEventListener('click', handler);
  return newBtn;
}
```

`cloneNode(true)` cria cópia idêntica mas **sem nenhum event listener**. Ao substituir o original pela cópia, todos os listeners anteriores são removidos e um novo e único listener é adicionado. Aplicado a `pen-eraser`, `pen-undo` e `pen-clear`.

**API pública do módulo Pen:**

| Método | Descrição |
|--------|-----------|
| `init(svg, layer, editorArea)` | Inicializa, registra listeners, scroll sync |
| `activate() / deactivate()` | Liga/desliga captura de eventos no SVG |
| `load(savedStrokes)` | Carrega traços ao abrir entrada (sanitiza com `sanitizeStrokes()`) |
| `getStrokes()` | Retorna array atual para persistência |
| `undo()` | Remove o último traço |
| `clear()` | Remove todos os traços (com confirmação) |
| `setColor(hex)` | Define cor ativa (valida contra whitelist) |
| `setWidth(px)` | Define espessura (clamped 0.5–8) |
| `setEraser(bool)` | Liga/desliga modo borracha |
| `buildPrintSvg()` | Gera SVG standalone para PDF |
| `buildToolbar()` | Constrói/reconstrói controles da pen-toolbar |
| `_onStrokesChange` | Callback injetado pelo app para persistência imediata |

---

### SEÇÃO 3 — Estado e Persistência

**Papel:** ser a fonte da verdade em memória e a interface com o `localStorage`.

```javascript
var STORAGE_KEY = 'meu_diario_v2'; // chave no localStorage
var entries     = [];               // array de Entry — fonte da verdade
var currentId   = null;             // ID da entrada aberta, ou null
```

`loadData()` — protegida contra JSON corrompido:
```javascript
function loadData() {
  try { entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch (e) { entries = []; } // não quebra se o JSON estiver corrompido
}
```

`saveData()` — gravação simples. Candidata a `try/catch` para capturar `QuotaExceededError`.

---

### SEÇÃO 4 — Utilitários

**Papel:** funções puras usadas por múltiplos módulos.

| Função | Implementação resumida | Uso |
|--------|----------------------|-----|
| `uid()` | `Date.now().toString(36) + Math.random().toString(36).slice(2,7)` | ID de entrada — sortable por tempo |
| `fmtLong(iso)` | `toLocaleDateString(locale, {weekday:'long', day:'numeric', ...})` | Cabeçalho da entrada |
| `fmtShort(iso)` | `toLocaleDateString(locale, {day:'2-digit', month:'short', year:'numeric'})` | Lista da sidebar |
| `stripForSidebar(str)` | Regex remove `**`, `*`, `` ` ``, `> `, `- `, `$` | Preview de texto puro na sidebar |
| `wordCount(str)` | `stripForSidebar(str).split(/\s+/).filter(Boolean).length` | Contador de palavras na stats-bar |

---

### SEÇÃO 5 — Toast

**Papel:** notificações temporárias não-bloqueantes.

```javascript
var toastTimer;
function showToast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');   // CSS: opacity 0→1, translateY 10px→0
  clearTimeout(toastTimer);   // reseta se já visível
  toastTimer = setTimeout(function () {
    el.classList.remove('show');
  }, 2200);
}
```

`clearTimeout` garante que toasts em sequência rápida não se acumulam — cada novo reinicia o timer de 2,2 segundos.

---

### SEÇÃO 6 — Sidebar e Lista de Entradas

**Papel:** renderizar a lista de entradas com busca e ordenação.

`renderList(q)` — re-renderização completa a cada chamada:
1. Filtra `entries` pela query `q` em `title` e `body`
2. Ordena por `updatedAt` decrescente (mais recente primeiro)
3. Gera HTML com `Array.map()` e atribui ao `innerHTML` da lista
4. Rebinda listeners de clique nos itens gerados

Cada `entry-item` exibe: emoji de humor (se houver), título truncado, data formatada, preview do corpo sem marcações.

---

### SEÇÃO 7 — Controle de Modo

**Papel:** alternar entre os três modos de operação e ajustar a UI correspondente.

```javascript
function setMode(m) // m: 'edit' | 'pen' | 'preview'
```

| Modo | `#entry-raw` | `#entry-preview` | `#pen-svg` | `#fmt-btns` | `#pen-toolbar` |
|------|-------------|-----------------|-----------|-------------|----------------|
| `edit` | `block`, opacity 1 | `none` | passivo (pointer-events:none) | `flex` | `none` |
| `pen` | `block`, opacity 0.45 | `none` | **ativo** (.pen-active) | `none` | `flex` |
| `preview` | `none` | `block` + KaTeX | passivo | `none` | `none` |

**Detalhe crítico:** `style.display = ''` herda `display:none` do CSS. O código usa `'block'` explicitamente para garantir visibilidade.

**`autoResizeTextarea(raw)`** é chamado dentro de `setMode('edit')` para recalcular a altura do textarea após ele ser tornado visível. Sem isso, `scrollHeight` retornaria 0 com o elemento oculto.

---

### SEÇÃO 8 — CRUD de Entradas

**Papel:** operações sobre o array `entries[]`.

#### `openEntry(id)`
```
1. currentId = id
2. Mostra #editor-container, oculta #welcome
3. Preenche DOM: title, raw, mood
4. Pen.load(e.strokes)         ← sanitiza e renderiza traços
5. updateStats()
6. setMode('edit')             ← torna textarea visível
7. autoResizeTextarea(raw)     ← APÓS setMode (elemento visível = scrollHeight correto)
8. renderList()                ← marca item ativo na sidebar
```

#### `newEntry()`
Cria `Entry` com campos vazios, insere no início do array (`unshift`), persiste e chama `openEntry`.

#### `saveEntry()`
Lê `title`, `body`, `mood` do DOM, obtém `Pen.getStrokes()`, atualiza `updatedAt` e chama `saveData()`.

#### `deleteEntry()`
Confirma via `t('cf.del')`, filtra o array removendo a entrada, limpa o SVG, exibe `#welcome`.

#### `updateStats()`
Lê o textarea, conta palavras com `wordCount()`, atualiza `#word-count` com string traduzida.

---

### SEÇÃO 9 — Formatação via Toolbar

**Papel:** inserir marcações Markdown no textarea na posição do cursor.

**Dois padrões via atributos HTML:**

`[data-wrap]` — envolve a seleção simetricamente:
```javascript
// seleção "mundo" + wrap "**" → "**mundo**"
ta.setRangeText(w + sel + w, selectionStart, selectionEnd, 'select');
```

`[data-prefix]` — insere prefixo no início da linha atual:
```javascript
var lineStart = ta.value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
ta.setRangeText(prefix, lineStart, lineStart, 'end');
```

`setRangeText()` é nativo, manipula o valor do textarea e dispara eventos de forma consistente.

---

### SEÇÃO 10 — Diálogo de Equação LaTeX

**Papel:** assistir na inserção de equações com templates e preview em tempo real.

`EQ_TMPLS` — array de `{label, val}` com 11 templates comuns (Fração, Raiz, Integral, Baskara, Euler, etc.). Botões gerados dinamicamente via `createElement` — evita HTML repetitivo.

`updateEqPreview()` — chamada a cada `input` no textarea do diálogo:
```javascript
function updateEqPreview() {
  var latex = document.getElementById('eq-input').value.trim();
  // ... usa katex.renderToString() diretamente — síncrono, sem debounce
}
```

`eqBlock` — variável que controla se a inserção será inline (`$...$`) ou em bloco (`$$...$$`).

Fechamento: botão Cancelar, clique no overlay semitransparente, ou tecla `Escape`.

---

### SEÇÃO 11 — Exportação e Importação

#### `exportMarkdown()`

Gera arquivo `.md` com front matter YAML incluindo os traços da caneta:

```yaml
---
titulo: Minha nota
data: 17/03/2026
humor: 😊
tracos: 12                    ← contador legível por humanos
pen_strokes: eyJ2IjoxLCJzIjo...  ← base64 de {v:1, s:[...array de Stroke...]}
---

# Minha nota

Corpo em Markdown + LaTeX...
```

`pen_strokes` usa chave fixa em inglês (não traduzida) para que o parser de importação funcione independente do idioma da UI. Base64 evita problemas de escaping de `{`, `"`, `:` dentro do YAML.

**Fluxo:**
```
Pen.getStrokes()
  → JSON.stringify({ v:1, s:strokes })
  → btoa()
  → campo 'pen_strokes' no front matter
  → Blob('text/markdown')
  → URL.createObjectURL()
  → <a download> programático
  → URL.revokeObjectURL() após 100ms
```

#### `exportPDF()`

```
1. saveEntry()
2. prev.innerHTML = mdToHtml(raw.value)  ← renderiza LaTeX
3. Injeta #print-title e #print-date no DOM
4. Pen.buildPrintSvg()  → SVG com viewBox calculado → #print-svg-tmp
5. window.print()  ← @media print oculta sidebar/toolbar, mostra preview
6. Remove elementos temporários injetados
```

#### `importMarkdown()`

Abre seletor de arquivo nativo (`<input type="file" accept=".md">`), lê com `FileReader.readAsText('utf-8')` e parseia:

```
1. Extrai front matter: /^---\r?\n([\s\S]*?)\r?\n---/
2. Lê 'titulo:' ou 'title:' — aceita ambos os idiomas
3. Lê 'humor:' ou 'mood:'
4. Lê 'pen_strokes:' → atob() → JSON.parse()
     → valida { v:1, s:Array } antes de usar
     → strokes corrompidos: importa só texto (sem erro fatal)
5. Extrai body: tudo após o front matter, remove primeiro '# Título'
6. Cria Entry, entries.unshift(), saveData(), openEntry()
     → openEntry chama Pen.load(strokes) que sanitiza os dados
```

Tratamento de erros em dois níveis: `reader.onerror` para falha de leitura, `try/catch` global em `reader.onload` para parsing inválido. Ambos exibem `t('toast.importErr')`.

---

### SEÇÃO 12 — Auto-resize e Wheel Forwarding

**Papel:** manter o textarea sem scroll interno, garantindo que papel e texto rolam juntos.

`autoResizeTextarea(el)`:
```javascript
function autoResizeTextarea(el) {
  el.style.height = 'auto';          // reseta: browser recalcula scrollHeight do zero
  el.style.height = el.scrollHeight + 'px'; // aplica a altura real do conteúdo
}
```

O reset para `'auto'` é imprescindível: sem ele, ao apagar texto o `scrollHeight` reportaria a altura anterior e o textarea nunca encolheria.

**Wheel forwarding** — repassa eventos de scroll do textarea para o `.editor-area`:
```javascript
raw.addEventListener('wheel', function (e) {
  var delta = e.deltaY;
  if (e.deltaMode === 1) delta *= 20;                  // linhas → pixels
  if (e.deltaMode === 2) delta *= area.clientHeight;   // páginas → pixels
  area.scrollTop += delta;
  e.preventDefault(); // evita tentativa dupla do browser
}, { passive: false });
```

`deltaMode` converte as três possíveis unidades do evento wheel para pixels antes de aplicar ao `scrollTop`.

---

### SEÇÃO 13 — Auto-save com Debounce

**Papel:** salvar automaticamente sem sobrecarregar o `localStorage` durante digitação contínua.

```javascript
var debTimer;
function debSave() {
  clearTimeout(debTimer);
  debTimer = setTimeout(saveEntry, 1800); // 1,8 segundos sem digitar
}
```

Chamado por `input` no textarea, `input` no título e `change` no mood-select. O módulo Pen salva **imediatamente** após cada traço — sem debounce, pois traços são eventos discretos com baixa frequência.

`Pen._onStrokesChange` — callback injetado:
```javascript
Pen._onStrokesChange = function (strokes) {
  var e = entries.filter(/*...*/)[0];
  e.strokes   = strokes;
  e.updatedAt = new Date().toISOString();
  saveData(); // sem debounce
};
```

---

### SEÇÃO 14 — Fullscreen API

**Papel:** ativar/desativar fullscreen do sistema operacional com cobertura cross-browser.

```javascript
function toggleFullscreen() {
  if (!isFullscreen()) {
    var el = document.documentElement;
    (el.requestFullscreen || el.webkitRequestFullscreen ||
     el.mozRequestFullScreen || el.msRequestFullscreen).call(el);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen ||
     document.mozCancelFullScreen || document.msExitFullscreen).call(document);
  }
}
```

`updateFsIcon()` — sincroniza ícone e atributos quando o estado muda. Vinculada ao evento `fullscreenchange` (e prefixos), garantindo que o ícone se atualiza mesmo quando o usuário pressiona `Escape` para sair.

`FS_ICON.expand` / `FS_ICON.compress` — strings de SVG `<polyline>` e `<line>` trocadas via `innerHTML` do `#fs-icon`.

---

### SEÇÃO 14/15 — Atalhos de Teclado e Fiação de Eventos

**Atalhos registrados:**

| Tecla | Condição | Ação |
|-------|----------|------|
| `Ctrl/Cmd+S` | Qualquer | Salvar + toast |
| `Ctrl/Cmd+Z` | Modo caneta ativo | Desfazer último traço |
| `F` (maiúsculo) | Foco fora de INPUT/TEXTAREA | Alternar fullscreen |
| `Escape` | Modal equação aberto | Fechar modal |

**Fiação de eventos** — todos os `addEventListener` explícitos para elementos criados no HTML estático. O `<script>` fica no final do `<body>`, garantindo que o DOM está completamente parseado.

---

### SEÇÃO 15 — Inicialização

**Ordem obrigatória:**

```javascript
Pen.init(svgEl, layerEl, editorAreaEl); // 1. Registra listeners do SVG e scroll
loadData();                              // 2. entries[] carregado do localStorage
applyLocale(currentLang);               // 3. DOM traduzido, mood-select, pen toolbar
if (entries.length) openEntry(latest);  // 4. Abre a entrada mais recentemente editada
```

A ordem importa: `Pen.init` deve preceder `applyLocale` porque `applyLocale` chama `Pen.buildToolbar()` que depende de `svgEl` já estar definido.

---

## 6. Modelo de Dados

### Chaves no `localStorage`

| Chave | Tipo | Conteúdo |
|-------|------|---------|
| `meu_diario_v2` | JSON | Array de objetos `Entry` |
| `diario_lang` | string | `'pt'` ou `'en'` |

### Schema `Entry`

```typescript
interface Entry {
  id:        string;    // uid() — base36 timestamp + sufixo; ordenável cronologicamente
  title:     string;    // texto bruto — NUNCA HTML
  body:      string;    // Markdown + LaTeX bruto — NUNCA HTML
  mood:      string;    // emoji ou string vazia
  strokes:   Stroke[];  // anotações manuscritas
  createdAt: string;    // ISO 8601 — imutável após criação
  updatedAt: string;    // ISO 8601 — atualizado a cada saveEntry()
}

interface Stroke {
  pts: [number, number][]; // pontos [x,y] simplificados por Douglas-Peucker
  c:   string;             // cor hexadecimal (whitelist: 6 valores)
  w:   number;             // espessura em px (clamped 0.5–8)
}
```

**Invariante crítica:** `body` e `title` são sempre texto bruto. HTML nunca é persistido. A conversão ocorre apenas em memória em `mdToHtml()` no momento do preview.

### Formato do arquivo `.md` exportado

```yaml
---
titulo: Título da entrada          ← traduzido pelo i18n da UI no momento da exportação
data: 17/03/2026                   ← formatado pelo locale ativo
humor: 😊                          ← emoji ou —
tracos: 12                         ← contador legível, não usado na importação
pen_strokes: eyJ2IjoxLCJzIjpbXX0= ← base64(JSON({v:1, s:Stroke[]})), chave FIXA inglês
---

# Título da entrada

Corpo em Markdown...
```

---

## 7. Fluxos de Dados Principais

### Criar e escrever

```
"Nova Entrada" → newEntry()
  → Entry{id, title:'', body:'', strokes:[], ...}
  → entries.unshift(e) → saveData()
  → openEntry(e.id)
    → preenche DOM → Pen.load([]) → setMode('edit') → autoResize
  → usuário digita
    → 'input' → autoResize → updateStats → debSave
    → 1.8s de silêncio → saveEntry() → saveData()
```

### Desenhar com a caneta

```
"✒ Caneta" → saveEntry() → setMode('pen')
  → Pen.activate() → #pen-svg.pen-active
  → raw.opacity = 0.45 (texto como guia)
  → pointerdown → rawPts iniciado → RAF batching
  → pointermove × N → Bézier ao vivo → 60fps
  → pointerup → Douglas-Peucker → strokes.push()
  → Pen._onStrokesChange → saveData() imediato
```

### Exportar e reimportar

```
"⬇ Markdown" → exportMarkdown()
  → Pen.getStrokes() → btoa(JSON) → front matter
  → Blob → <a download> → arquivo .md

"Importar .md" → importMarkdown()
  → FileReader.readAsText()
  → parseia front matter → atob → JSON.parse
  → Entry{body, strokes} → entries.unshift → openEntry
  → Pen.load(strokes) → sanitizeStrokes → renderAll
  → traços aparecem exatamente onde foram desenhados
```

### Exportar PDF

```
"⬇ PDF" → exportPDF()
  → saveEntry()
  → mdToHtml(raw.value) → prev.innerHTML (KaTeX síncrono)
  → injeta #print-title, #print-date
  → Pen.buildPrintSvg() → bounding box → viewBox → <svg> standalone
  → injeta #print-svg-tmp no DOM
  → window.print() → @media print oculta UI, mostra conteúdo
  → remove elementos temporários
```

---

## 8. Histórico de Desenvolvimento e Bugs Corrigidos

Esta seção documenta a evolução do projeto, as decisões de design revisitadas e os bugs encontrados e corrigidos ao longo das versões desenvolvidas.

---

### 8.1 O Bug do Paralaxe — O Problema Central do Projeto

Este foi o bug mais difícil de resolver, exigindo três tentativas antes de chegar à solução correta.

#### Descrição

Ao rolar o conteúdo de uma entrada longa, as linhas do papel de caderno ficavam paradas enquanto o texto se movia. O efeito visual era de paralaxe — duas camadas se movendo em velocidades diferentes.

#### Tentativa 1 — `.main::before` com `position:absolute` (design original)

O background de linhas estava no pseudo-elemento `.main::before`:
```css
.main::before {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(...);
}
```
`.main` não scrolla. `.editor-area` scrolla. O background ficava fixo — paralaxe total.

#### Tentativa 2 — `background-attachment: local` no `.editor-area`

Mover o background para o container de scroll com `background-attachment: local`:
```css
.editor-area {
  background-image: repeating-linear-gradient(...);
  background-attachment: local;
}
```
**Falhou:** `background-attachment: local` com `display: flex` tem comportamento inconsistente entre browsers. O background não acompanhava o scroll de forma confiável.

#### Tentativa 3 — `.notebook-bg` com `flex:1` (quase correto, mas quebrado)

Criar um `div` filho `.notebook-bg` dentro do `.editor-area` para carregar o background:
```css
.editor-area  { display: flex; flex-direction: column; }
.notebook-bg  { flex: 1; background-image: linhas... }
#entry-raw    { flex: 1; }
```
**Falhou por dependência circular:** `flex: 1` em `.notebook-bg` significa `flex: 1 1 0`. O algoritmo flexbox determina o tamanho do item antes de considerar o conteúdo. O item era fixado em exatamente a altura do viewport (ex: 600px). O conteúdo que excedia 600px transbordava, mas o background só cobria os primeiros 600px — paralaxe abaixo da tela.

#### Solução definitiva — Bloco puro sem flex

```css
/* .editor-area: container de scroll puro, SEM display:flex */
.editor-area { flex:1; overflow-y:auto; }

/* .notebook-bg: bloco normal que cresce com o conteúdo */
.notebook-bg {
  min-height: 100%;
  padding: 28px 30px 28px 96px;
  /* SEM flex, SEM min-height artificial além de 100% */
  background-image: /* linhas e margem */;
}

/* #entry-raw: sem scroll próprio, cresce via autoResizeTextarea() */
#entry-raw { min-height: 60vh; overflow: hidden; }
```

**Por que funciona:** sem `display: flex` no `.editor-area`, ele é um container de scroll convencional. O `.notebook-bg` é um elemento de bloco que se dimensiona pelo seu conteúdo. Quando o textarea cresce (via `autoResizeTextarea`), `.notebook-bg` cresce com ele, estendendo o background. Ao rolar, o browser desloca o `.notebook-bg` inteiro — texto e linhas em sincronia perfeita.

**A regra fundamental:** background e texto devem estar no mesmo elemento filho do scroll container, e esse elemento não pode ter dimensão fixada pelo algoritmo flex.

---

### 8.2 Bug da Borracha — Listeners Duplicados

**Sintoma:** a borracha parecia ativar visualmente mas não apagava nada. Ao clicar, o modo alternava de `false→true` (listener 1) e imediatamente de `true→false` (listener 2).

**Causa raiz:** `buildToolbar()` é chamada 2 vezes — uma em `Pen.init()` e outra em `applyLocale()`. Cada chamada executava `eraserBtn.addEventListener('click', callback)` no **mesmo elemento HTML**. Com 2 listeners acumulados, cada clique executava ambos em sequência, sempre terminando com `eraserMode = false`.

**Solução:** função `rewire(id, handler)` que usa `cloneNode(true)` + `replaceChild`. Clonar o elemento cria uma cópia sem listeners. Ao substituir o original pela cópia, todos os listeners anteriores são removidos antes de adicionar o novo:

```javascript
function rewire(id, handler) {
  var oldBtn = document.getElementById(id);
  var newBtn = oldBtn.cloneNode(true); // cópia sem listeners
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  newBtn.addEventListener('click', handler);
  return newBtn;
}
```

---

### 8.3 Bug da Borracha — `e.preventDefault()` Prematura

**Sintoma:** a borracha não funcionava mesmo com o listener correto.

**Causa raiz:** `e.preventDefault()` em `pointerdown` suprime o evento `click` subsequente. A versão anterior da borracha dependia do evento `click` (`onEraserClick`). Com a `preventDefault` executando antes da verificação de `eraserMode`, o clique era cancelado antes de chegar à borracha.

**Solução:** verificar `eraserMode` antes de chamar `e.preventDefault()`. No modo borracha, chamar `eraseAt()` diretamente no `pointerdown` e ativar `setPointerCapture()` para permitir arrastar:

```javascript
function onPointerDown(e) {
  if (e.button !== 0) return;
  e.preventDefault();
  var coord = getDocCoords(e);
  if (eraserMode) {
    eraseAt(coord[0], coord[1]);    // hit-test geométrico
    svgEl.setPointerCapture(e.pointerId); // arrastar apaga múltiplos traços
    return;
  }
  // ... modo caneta
}
```

---

### 8.4 Bug da Borracha — DOM Hit-test vs Hit-test Geométrico

**Sintoma:** borracha com `pointer-events: stroke` nunca clicava nos traços, especialmente os finos.

**Causa raiz:** `pointer-events: stroke` só registra o evento se o ponteiro cair dentro da linha geométrica do traço — 2.5px de largura. Clicar nessa linha com precisão de pixel de forma consistente é humanamente impossível.

**Solução:** `eraserHitTest(docX, docY)` — percorre os pontos de todos os traços e retorna o índice do traço com algum ponto dentro de um raio de 20px. Usa distância ao quadrado para evitar `Math.sqrt`. Itera de trás para frente para priorizar traços mais recentes.

---

### 8.5 Bug do PDF — Desenhos Ausentes

**Sintoma:** o PDF gerado via `window.print()` não incluía os traços desenhados com a caneta.

**Causa raiz (dupla):**

1. O `#pen-svg` overlay usa `position: absolute` com coordenadas de documento (y inclui scrollTop). Em `@media print` não há viewport fixo nem scrollTop — os paths ficavam fora do retângulo visível do SVG.

2. `buildPrintSvg()` — a função que calculava o bounding box real e gerava SVG autossuficiente — foi removida em uma refatoração sem ser restaurada.

**Solução:** restaurar `buildPrintSvg()` na API do Pen. A função calcula `minX`, `minY`, `maxX`, `maxY` de todos os pontos, define um `viewBox` com 12px de padding, e recria os traços como `<path>` no novo SVG. O `@media print` oculta `#pen-svg` e exibe `#print-svg-tmp` (gerado por `buildPrintSvg()`).

---

### 8.6 Bug do Scroll do Textarea

**Sintoma:** ao usar a roda do mouse sobre o textarea, a página não rolava.

**Causa raiz:** textareas são elementos de formulário nativo. Mesmo com `overflow: hidden`, o browser ainda entrega eventos `wheel` ao textarea e não os buba para o `.editor-area`.

**Solução:** wheel forwarding manual com conversão de `deltaMode`:
```javascript
raw.addEventListener('wheel', function (e) {
  var delta = e.deltaY;
  if (e.deltaMode === 1) delta *= 20;                   // linhas → px
  if (e.deltaMode === 2) delta *= area.clientHeight;    // páginas → px
  area.scrollTop += delta;
  e.preventDefault();
}, { passive: false });
```

---

### 8.7 Numeração Duplicada das Seções

**Situação:** há dois blocos `SEÇÃO 14` no código — um para atalhos de teclado e outro para fiação de eventos. Não causa erro em tempo de execução, mas é confuso para manutenção.

**Correção pendente:** renomear o segundo `SEÇÃO 14` para `SEÇÃO 15` e o bloco de inicialização para `SEÇÃO 16`.

---

### 8.8 Resumo Cronológico das Versões

| Versão | Funcionalidades adicionadas |
|--------|-----------------------------|
| v1 | Editor básico, CRUD, localStorage, Markdown simples |
| v2 | KaTeX + diálogo de equação, módulo de caneta com Bézier e Douglas-Peucker |
| v3 | Exportação MD/PDF, modo preview, mood select, busca |
| v4 | i18n PT/EN com dicionário estático, seletor de idioma com pílulas |
| v5 | Borracha geométrica (hit-test por distância), `min-width` nos botões para estabilidade i18n |
| v6 | Fullscreen API, atalho `F`, ícone alternável expand/compress |
| v7 | Correção do paralaxe: `.notebook-bg` bloco puro + `autoResizeTextarea` + wheel forwarding |
| v8 | Correção da borracha: `rewire()` + hit-test geométrico restaurado + `eraseAt` no `pointerdown` |
| v9 | Correção do PDF: `buildPrintSvg()` restaurada + `#print-svg-tmp` em `@media print` |
| v10 | Importação de `.md`: `importMarkdown()` + protocolo base64 no front matter YAML |
