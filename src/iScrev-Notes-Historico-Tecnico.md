# iScrev Notes — Histórico Técnico e Documental Completo

> **Produto:** iScrev Notes  
> **Classificação:** SPA (Single-Page Application) de diário digital pessoal  
> **Stack:** HTML5 · CSS3 · JavaScript ES5 · KaTeX 0.16.11  
> **Paradigma:** zero build step · zero backend · zero dependências JS externas (exceto KaTeX)  
> **Persistência:** IndexedDB com fallback transparente para localStorage  
> **Última atualização deste documento:** março de 2026  

---

## Sumário

1. [Idealização e Filosofia do Projeto](#1-idealização-e-filosofia-do-projeto)
2. [Estrutura Atual de Arquivos](#2-estrutura-atual-de-arquivos)
3. [Tecnologias, Especificações e Justificativas](#3-tecnologias-especificações-e-justificativas)
4. [Arquitetura CSS e Sistema de Layout](#4-arquitetura-css-e-sistema-de-layout)
5. [Arquitetura JavaScript — Módulos e Seções](#5-arquitetura-javascript--módulos-e-seções)
6. [Modelo de Dados](#6-modelo-de-dados)
7. [Fases do Desenvolvimento](#7-fases-do-desenvolvimento)
8. [Bugs Documentados e Soluções Adotadas](#8-bugs-documentados-e-soluções-adotadas)
9. [Camada Institucional — Páginas do Site](#9-camada-institucional--páginas-do-site)
10. [Exportação e Importação — Protocolos](#10-exportação-e-importação--protocolos)
11. [Sugestões de Melhoria](#11-sugestões-de-melhoria)
12. [Otimizações de SEO](#12-otimizações-de-seo)
13. [Referências e Recursos Externos](#13-referências-e-recursos-externos)

---

## 1. Idealização e Filosofia do Projeto

### 1.1 Origem da Ideia

O iScrev Notes surgiu da observação de que ferramentas digitais de escrita tendem a ser frias, genéricas ou excessivamente complexas. O conceito central foi criar um diário que se comportasse como um caderno físico de pautas: acolhedor, imediato e sem barreiras entre a intenção e o registro.

A premissa técnica que guiou todas as decisões foi deliberadamente restritiva: **nenhum framework, nenhuma ferramenta de build, nenhum servidor**. O aplicativo deve funcionar ao abrir um único arquivo em qualquer browser moderno. Essa restrição não é uma limitação — é uma filosofia. Cada decisão de arquitetura foi avaliada contra o critério: *isso adiciona complexidade real ou apenas complexidade de ferramenta?*

### 1.2 Três Pilares de Design

**Calor visual.** A paleta foi construída em torno de tons de papel quente (`#f5efe0`), âmbar (`#c8843a`) e ferrugem suave (`#8b3a1f`). A tipografia combina `Playfair Display` para títulos, `Lora` para corpo e `Dancing Script` para elementos decorativos como datas, reproduzindo a estética de um caderno manuscrito de qualidade.

**Legibilidade prolongada.** Cada detalhe tipográfico — espaçamento de linha de 28px, contraste calibrado, fonte monoespaçada `JetBrains Mono` na área de edição — foi pensado para sessões longas de escrita ou estudo.

**Baixa fricção.** O fluxo principal é: abrir → escrever → fechar. Não há login, sincronização, onboarding ou configuração. O auto-save com debounce de 1,8 segundos garante que o usuário nunca perca conteúdo sem precisar pensar nisso.

### 1.3 Funcionalidades do Núcleo

| Módulo | Capacidade |
|--------|------------|
| Editor de texto | Textarea nativa com Markdown básico e suporte a LaTeX |
| Renderização LaTeX | Equações inline `$...$` e bloco `$$...$$` via KaTeX síncrono |
| Caneta manuscrita | Anotações SVG com Bézier quadrática, borracha geométrica e pan |
| Três modos de uso | Editar · Caneta · Preview — cada um com UI e comportamento distintos |
| CRUD completo | Criar · Abrir · Salvar (auto + manual) · Excluir entradas |
| Busca em tempo real | Filtro simultâneo em título e corpo de todas as entradas |
| Mood tracker | Emoji associado a cada entrada, exportável no front matter |
| Exportação Markdown | `.md` com YAML front matter e traços manuscritos em base64 |
| Exportação PDF | Baseada em `window.print()` com SVG standalone para anotações |
| Importação Markdown | Lê `.md` exportado, restaura texto, mood e traços manuscritos |
| Tela cheia | Fullscreen API nativa com ícone alternável e atalho `F` |
| Internacionalização | PT-BR e EN com detecção automática e troca sem reload de página |
| Persistência dual | IndexedDB como primário, localStorage como fallback transparente |

---

## 2. Estrutura Atual de Arquivos

O projeto evoluiu de um single-file para uma estrutura separada por responsabilidade. A disposição atual é:

```
projeto/
├── index.html              ← Home institucional em português
├── sobre.html              ← Página "sobre" em português
├── en.html                 ← Home institucional em inglês
├── about.html              ← Página "about" em inglês
├── diario.html             ← Interface principal do app de diário
├── DOCUMENTACAO.md         ← Documentação técnica corrente
├── Doc-old.md              ← Histórico preservado da fase single-file
├── diario-old.css          ← Snapshot legado de CSS (referência)
└── assets/
    ├── css/
    │   ├── style.css       ← Estilos das páginas institucionais
    │   └── diario.css      ← Estilos da aplicação do diário
    └── js/
        ├── diario.js       ← Lógica principal do diário (~2000 linhas)
        ├── pdf-exporter.js ← Módulo de exportação PDF paginado
        ├── ui.js           ← Placeholder de helpers de interface
        └── site-nav.js     ← Comportamento da navegação institucional
```

### Papel de cada arquivo JavaScript

**`diario.js`** é o núcleo da aplicação. Contém, dentro de uma única IIFE com `'use strict'`, os seguintes blocos funcionais: sistema de i18n, renderização LaTeX e Markdown, módulo `Pen` (caneta SVG), módulo `Storage` (persistência dual), CRUD de entradas, controle de modos, exportação, importação, auto-save, fullscreen e toda a fiação de eventos.

**`pdf-exporter.js`** é um módulo autônomo que expõe `window.PdfExporter`. Ele realiza paginação lógica do conteúdo, medição de blocos via DOM oculto, composição de SVG por página para os traços manuscritos, geração de HTML completo e impressão via iframe invisível. É utilizado apenas para entradas sem traços; quando há traços, o fluxo legado `buildPrintStage() + window.print()` é preferido para preservar a geometria canônica.

**`site-nav.js`** gerencia o toggle responsivo do menu de navegação das páginas institucionais, sem qualquer acoplamento com o diário.

**`ui.js`** existe atualmente como placeholder documentado. A sidebar é controlada exclusivamente por `diario.js` via classes no `<body>`.

---

## 3. Tecnologias, Especificações e Justificativas

### 3.1 JavaScript ES5

**Decisão:** todo o código JavaScript usa sintaxe ES5 (sem `const`, `let`, arrow functions, destructuring, template literals, módulos).

**Justificativa:** compatibilidade máxima com browsers antigos, especialmente Safari no iOS que, em algumas versões de WebView, apresentava comportamento inconsistente com ES6+ em contextos de SPA sem transpilação. A IIFE global substitui módulos ES6, evitando qualquer dependência de bundler.

**Custo:** verbosidade maior (ex: `function` em vez de `=>`; `var` em vez de `const`). O trade-off foi considerado aceitável dado o escopo do projeto.

**Referência técnica:** [ECMAScript 5.1 Specification — ECMA-262](https://www.ecma-international.org/ecma-262/5.1/)

### 3.2 KaTeX 0.16.11

KaTeX é a única dependência externa aprovada. Carregado de forma **síncrona** no `<head>` (sem `defer` ou `async`), garantindo que `katex.renderToString()` esteja disponível no momento em que qualquer código do app executar.

```html
<!-- Carregamento SÍNCRONO — obrigatório para uso imediato em mdToHtml() -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
```

**Por que KaTeX e não MathJax?** KaTeX é substancialmente mais rápido (renderização síncrona em microssegundos vs. assíncrona em MathJax), tem API mais simples e gera HTML+CSS puro sem SVG externo, compatível com exportação via `window.print()`.

**Referência:** [KaTeX Documentation](https://katex.org/docs/api.html) · [KaTeX Support Table](https://katex.org/docs/support_table.html)

### 3.3 IndexedDB com fallback localStorage

O módulo `Storage` implementa uma abstração baseada em Promises com duas camadas:

```
Hierarquia de decisão em Storage.init():
  1. window.indexedDB disponível → abre banco "meu_diario_db" (v1)
  2. IDB indisponível ou falha → opera sobre localStorage (chave "meu_diario_v2")
  3. localStorage QuotaExceededError → dispara evento customizado "storage:quota-exceeded"
```

**IndexedDB** suporta valores de até vários MB por entrada, transações ACID e não bloqueia a thread principal em operações grandes. É apropriado para entradas com muitos traços manuscritos.

**localStorage** suporta no máximo ~5MB no total por origem. Adequado como fallback para cenários onde IDB não está disponível (modo privado em alguns browsers antigos, por exemplo).

**Migração automática:** na primeira execução com IDB disponível, `migrateFromLocalStorage()` lê os dados do localStorage legado e os insere no IDB, marcando a migração com a chave `meu_diario_migrated` para não repetir.

**Referência:** [MDN — IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) · [MDN — Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)

### 3.4 Pointer Events API

O módulo `Pen` usa exclusivamente a **Pointer Events API** em vez de `MouseEvent` + `TouchEvent` separados. Isso unifica mouse, touch e stylus em três eventos: `pointerdown`, `pointermove`, `pointerup`.

`setPointerCapture(pointerId)` garante que `pointermove` e `pointerup` continuem chegando ao SVG mesmo quando o ponteiro sai da área, evitando traços abandonados em gestos rápidos.

```javascript
svgEl.setPointerCapture(e.pointerId);
// A partir daqui, todos os eventos deste pointer são entregues ao svgEl,
// independente de onde o cursor estiver na tela.
```

**Referência:** [W3C Pointer Events Level 3](https://www.w3.org/TR/pointerevents3/) · [MDN — Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)

### 3.5 Fullscreen API

Implementada com cobertura completa de prefixos de browser:

```javascript
var req = el.requestFullscreen
       || el.webkitRequestFullscreen  // Safari
       || el.mozRequestFullScreen     // Firefox legado
       || el.msRequestFullscreen;     // IE/Edge legado
```

O evento `fullscreenchange` (e variantes prefixadas) sincroniza o estado do botão quando o usuário sai via tecla `Escape`, garantindo consistência visual.

**Referência:** [MDN — Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)

### 3.6 Tipografia via Google Fonts

| Família | Pesos carregados | Uso |
|---------|-----------------|-----|
| Dancing Script | 600, 700 | Logo, datas de entradas |
| Playfair Display | 400, 700, itálico | Títulos, welcome, h1–h6 |
| Lora | 400, 500, itálico | Corpo de texto, botões, labels |
| JetBrains Mono | 400, 500 | Editor de Markdown, código inline, templates de equação |

Carregadas via `<link>` com `rel="preconnect"` para o domínio `fonts.googleapis.com`, reduzindo a latência da primeira conexão.

### 3.7 SVG para Anotações Manuscritas

Os traços são representados como elementos `<path>` dentro de um `<svg>` com `position:absolute` sobre a área de edição. A camada `<g id="pen-layer">` recebe `transform="translate(0,-scrollTop)"` a cada evento de scroll, mantendo os traços ancorados ao conteúdo do documento independentemente da posição de rolagem.

**Por que SVG e não Canvas?** SVG mantém os traços como objetos individuais (fácil remoção, hit-testing geométrico, exportação direta para PDF). Canvas seria mais eficiente em renderização, mas requereria serialização separada para persistência e exportação. Para o volume típico de traços (até 500 por entrada), SVG é computacionalmente adequado.

**Referência:** [MDN — SVG path element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path) · [SVG Path Commands](https://www.w3.org/TR/SVG/paths.html#PathData)

---

## 4. Arquitetura CSS e Sistema de Layout

### 4.1 Tokens de Design (CSS Custom Properties)

```css
:root {
  --ink:     #1a1209;              /* tinta — cor primária de texto */
  --paper:   #f5efe0;              /* papel — fundo da área de edição */
  --paper2:  #ede6d0;              /* papel escuro — toolbar, stats-bar */
  --warm:    #c8843a;              /* âmbar — cor de destaque principal */
  --warm-lt: #e8b96a;              /* âmbar claro — logo, textos secundários */
  --rust:    #8b3a1f;              /* ferrugem — cor secundária */
  --math-bg: #fdf6e8;              /* fundo de blocos de equação */
  --math-bd: rgba(200,132,58,.3);  /* borda de equação */
  --line:    rgba(200,132,58,.22); /* cor das linhas de caderno */
}
```

Alterar qualquer token aqui se propaga por todo o projeto sem necessidade de busca e substituição.

### 4.2 Cadeia de Flex Containers

O layout usa flex containers aninhados. Cada nível tem uma responsabilidade única e precisa:

```
html/body (height:100%, overflow:hidden)
  └── .app (display:flex, height:100dvh)
        ├── .sidebar (width:280px, flex-direction:column)
        └── .main (flex:1, flex-direction:column, overflow:hidden)
              ├── .toolbar (flex-wrap:wrap, min-height:50px)
              ├── .pen-toolbar (display:none por padrão)
              └── .editor-wrap (flex:1, position:relative, overflow:hidden)
                    ├── .editor-area (flex:1, overflow-y:auto) ← ÚNICO SCROLL
                    │     └── .notebook-bg (bloco puro, min-height:100%)
                    │           ├── .entry-date-display
                    │           ├── #entry-title
                    │           ├── #entry-raw (textarea)
                    │           ├── #entry-preview
                    │           └── #notebook-tail (spacer para caneta)
                    └── #pen-svg (position:absolute, inset:0)
```

**Princípio fundamental:** `.editor-area` é o **único** elemento com `overflow-y:auto` em toda a aplicação. Qualquer outro elemento com scroll introduziria conflitos de hit-testing para a caneta e inconsistências no `scrollTop` usado para sincronização dos traços.

### 4.3 O Efeito de Papel de Caderno

As linhas horizontais são geradas por CSS puro no `#entry-raw` (textarea), não no contêiner pai. Essa decisão resolve um problema de alinhamento que existiu em versões anteriores:

```css
#entry-raw {
  line-height: 28px;
  background-image: repeating-linear-gradient(
    transparent,
    transparent 27px,
    var(--line) 27px,
    var(--line) 28px
  );
  background-attachment: local;
  background-position: 0 0;
}
```

**Por que no `#entry-raw` e não no `.notebook-bg`?** O `.notebook-bg` contém elementos de altura variável antes do textarea (data, título), totalizando aproximadamente 128px de offset. Como `128 ÷ 28 = 4,57` (número não inteiro), qualquer background aplicado ao contêiner ficaria desalinhado com o texto digitado. No textarea, o background começa em `y=0` exatamente onde o cursor começa — alinhamento perfeito e automático.

A margem vermelha vertical permanece no `.notebook-bg`:

```css
.notebook-bg {
  background-image: linear-gradient(
    to right,
    transparent 89px,
    rgba(200,60,40,.18) 89px,
    rgba(200,60,40,.18) 90.5px,
    transparent 90.5px
  );
}
```

### 4.4 Responsividade em Duas Quebras

**≤ 900px (mobile shell):** a sidebar torna-se um drawer posicionado (`position:fixed`), oculto por padrão via `transform:translateX(-100%)`. Um scrim semitransparente (`div.sidebar-scrim`) aparece sobre o conteúdo quando o drawer está aberto. A classe `.sidebar-open` no `<body>` controla o estado via CSS exclusivamente — sem `style.display` inline.

**≤ 640px (pequenos):** ajustes adicionais de padding, largura da sidebar reduzida para `min(88vw, 240px)`, e reorganização dos controles do header em layout centrado.

### 4.5 Estabilidade de Layout na Troca de Idioma

Ao trocar PT → EN, textos de botões mudam de comprimento ("Caneta" → "Pen"). Para evitar reflow visual, cada botão tem `min-width` calculado para o texto mais longo entre os idiomas:

```css
.mode-btn   { min-width: 62px; }  /* "✒ Caneta" (PT) */
.btn-eq     { min-width: 88px; }  /* "∑ Equation" (EN) */
.btn-save   { min-width: 64px; }  /* "Salvar" (PT) */
.btn-delete { min-width: 66px; }  /* "Excluir" (PT) */
```

---

## 5. Arquitetura JavaScript — Módulos e Seções

Todo o código do diário está dentro de uma IIFE com `'use strict'`. As seções são blocos consecutivos delimitados por comentários, não módulos ES6 — mantendo compatibilidade máxima.

### SEÇÃO 0 — Internacionalização (i18n)

O sistema usa um dicionário estático com dois blocos (`pt`, `en`). A função `t(key)` tem triplo fallback: idioma ativo → português → chave bruta (nunca retorna `undefined`).

`applyLocale(lang)` percorre um mapa explícito `TEXT_MAP` de `[id, chave, tipo]` e atualiza seletivamente `textContent`, `placeholder` ou `title` apenas nos elementos que realmente mudam — sem `querySelectorAll('[data-i18n]')` global. Depois reconstrói o `#mood-select` preservando a seleção atual e chama `Pen.buildToolbar()` para traduzir as labels da pen toolbar.

**Por que `TEXT_MAP` explícito e não `data-i18n`?** A abordagem de atributo exige varredura DOM completa a cada troca de idioma. O mapa explícito toca apenas os ~35 elementos que realmente têm texto traduzível — mais eficiente e mais fácil de auditar.

### SEÇÃO 1 — Renderização LaTeX e Markdown

O pipeline `mdToHtml(src)` opera em dois passos:

**Passo 1 — Tokenização:** a regex `/\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g` percorre a string e separa tokens de tipo `block` (LaTeX em bloco), `inline` (LaTeX inline) e `text` (Markdown puro), preservando a ordem original.

**Por que tokenizar antes de escapar HTML?** LaTeX usa `<` e `>` em expressões como `a < b`. Se `escHtml()` fosse aplicado antes da extração, o KaTeX receberia `a &lt; b` — código inválido. A tokenização isola o LaTeX antes de qualquer transformação de texto.

**Passo 2 — Conversão:** tokens `block` e `inline` vão para `renderTex()` (KaTeX síncrono). Tokens `text` passam por `convertMarkdown()`, que aplica `escHtml()` e converte `**bold**`, `*italic*`, `# heading`, `> blockquote`, `- list`, `` `code` `` para HTML.

Erros de LaTeX são exibidos inline com formatação vermelha sem interromper o restante do preview:
```javascript
catch (err) {
  return '<span style="color:#c0392b">' + escHtml(latex) + ' ⚠ ' + escHtml(err.message) + '</span>';
}
```

### SEÇÃO 2 — Módulo Pen (SVG + Pointer Events)

O módulo usa o padrão **IIFE revelador** — retorna um objeto com API pública; todo o estado é privado. A comunicação com o app ocorre via callback injetado: `Pen._onStrokesChange`.

**Constantes de segurança:**

| Constante | Valor | Proteção |
|-----------|-------|---------|
| `MAX_STROKES` | 500 | Limite de traços por entrada — protege o banco de dados |
| `MAX_PTS_RAW` | 2000 | Limite de pontos brutos durante desenho — protege RAM |
| `DP_EPSILON` | 1.5px | Tolerância do algoritmo Douglas-Peucker |
| `HIT_RADIUS` | 20px | Raio geométrico da borracha |

**Pipeline de um traço completo:**

```
pointerdown → coordenadas de documento → rawPts iniciado → <path> provisório
pointermove × N → filtra micro-movimentos < 1px → rawPts.push → RAF batching
pointerup → cancela RAF → Douglas-Peucker(rawPts, ε=1.5) → strokes.push
          → notifyChange() → Pen._onStrokesChange → Storage.put(entry)
```

**Suavização com Bézier quadrática:** em vez de segmentos retos (`L`), cada par de pontos consecutivos usa curva quadrática (`Q`) com o **ponto médio** como âncora. Isso produz traços suaves e naturais sem nenhuma biblioteca externa:

```javascript
function toPathD(pts) {
  var d = 'M' + pts[0][0] + ',' + pts[0][1];
  for (var i = 1; i < pts.length - 1; i++) {
    var mx = (pts[i][0] + pts[i+1][0]) >> 1; // ponto médio (divisão por 2)
    var my = (pts[i][1] + pts[i+1][1]) >> 1;
    d += ' Q' + pts[i][0] + ',' + pts[i][1] + ' ' + mx + ',' + my;
  }
  return d + ' L' + pts[pts.length-1][0] + ',' + pts[pts.length-1][1];
}
```

**Douglas-Peucker iterativo:** após cada traço concluído, o array de pontos brutos (até 2000) é simplificado. A redução típica é de 60–80% dos pontos, diminuindo drasticamente o espaço em disco sem impacto visual perceptível.

```
rdp(pts, ε, inicio, fim):
  1. Encontra o ponto mais distante da linha inicio→fim
  2. Se distância > ε: mantém e recursiona nos dois segmentos
  3. Se distância ≤ ε: descarta todos os pontos intermediários
```

> **Nota de implementação:** a versão atual usa recursão. Para traços com muitos pontos brutos próximos ao limite `MAX_PTS_RAW`, há risco teórico de stack overflow. A conversão para implementação iterativa (usando uma pilha explícita) é uma melhoria pendente de baixo custo e alta segurança.

**Borracha geométrica (hit-test por distância):** não usa `pointer-events: stroke` (área de click de ~2px, impraticável). Percorre todos os pontos armazenados usando distância euclidiana ao quadrado, com raio de 20px. Itera de trás para frente para priorizar traços mais recentes:

```javascript
function eraserHitTest(docX, docY) {
  var r2 = 20 * 20; // HIT_RADIUS² — evita Math.sqrt desnecessário
  for (var i = strokes.length - 1; i >= 0; i--) {
    for (var j = 0; j < strokes[i].pts.length; j++) {
      var dx = strokes[i].pts[j][0] - docX;
      var dy = strokes[i].pts[j][1] - docY;
      if (dx*dx + dy*dy <= r2) return i;
    }
  }
  return -1;
}
```

**`rewire(id, handler)` — remoção de listeners acumulados:** `buildToolbar()` é chamada múltiplas vezes (em `init()` e em cada `applyLocale()`). Para evitar acumulação de listeners nos botões de ação, `rewire` usa `cloneNode(true)` para criar uma cópia sem listeners e substitui o original:

```javascript
function rewire(id, handler) {
  var oldBtn = document.getElementById(id);
  var newBtn = oldBtn.cloneNode(true); // cópia idêntica, sem nenhum listener
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  newBtn.addEventListener('click', handler);
  return newBtn;
}
```

### SEÇÃO 2.5 — Módulo Storage

Abstração de persistência com API 100% baseada em Promises. O chamador (o restante do app) nunca precisa saber se está falando com IDB ou localStorage.

```javascript
Storage.init()    // abre IDB ou ativa fallback
Storage.getAll()  // Promise<Entry[]>
Storage.put(entry) // Promise<void> — insert ou update por entry.id
Storage.remove(id) // Promise<void>
Storage.backend()  // 'indexeddb' | 'localstorage'
```

### SEÇÕES 3–15 — Demais Componentes

**CRUD (`openEntry`, `newEntry`, `saveEntry`, `deleteEntry`):** todas as operações de escrita usam `saveEntry_store(entry)` que chama `Storage.put()`. A exclusão usa `removeEntry_store(id)` que chama `Storage.remove()`. O array em memória `entries[]` é a fonte da verdade; o banco é um espelho persistido.

**Auto-save com debounce:** `debSave()` cancela e reagenda `saveEntry()` com 1800ms de delay. O módulo Pen salva **imediatamente** após cada traço via `_onStrokesChange` — sem debounce, pois traços são eventos discretos com baixa frequência.

**Auto-resize do textarea:** `autoResizeTextarea(el)` define `height = 'auto'` (força recálculo) e então `height = el.scrollHeight + 'px'`. O reset para `'auto'` é imprescindível: sem ele, ao apagar texto o elemento nunca encolheria.

**Wheel forwarding:** o textarea captura eventos de scroll mesmo com `overflow:hidden`. Um listener `wheel` com `{ passive: false }` repassa o `deltaY` (convertendo `deltaMode` 0→px, 1→linhas×20, 2→páginas) para `editorAreaEl.scrollTop`.

---

## 6. Modelo de Dados

### 6.1 Schema de Entry

```typescript
interface Entry {
  id:        string;    // base36(Date.now()) + sufixo aleatório; ordenável por tempo
  title:     string;    // texto bruto — NUNCA HTML armazenado
  body:      string;    // Markdown + LaTeX bruto — NUNCA HTML armazenado
  mood:      string;    // emoji unicode ou string vazia
  strokes:   Stroke[];  // anotações manuscritas simplificadas por Douglas-Peucker
  createdAt: string;    // ISO 8601 — imutável após criação
  updatedAt: string;    // ISO 8601 — atualizado a cada saveEntry()
}

interface Stroke {
  pts: [number, number][]; // pares [x,y] em coordenadas de documento
  c:   string;             // cor hexadecimal (whitelist de 6 valores)
  w:   number;             // espessura em px — clamped para intervalo [0.5, 8]
}
```

**Invariante crítica:** `body` e `title` armazenam sempre texto bruto. A conversão para HTML ocorre apenas em memória em `mdToHtml()` no momento da renderização do preview. Armazenar HTML criaria riscos de XSS e tornaria o arquivo exportado ilegível como Markdown.

### 6.2 Chaves de Armazenamento

| Chave / Store | Tipo | Conteúdo |
|---------------|------|---------|
| IDB: `"meu_diario_db"` / store `"entries"` | Object store | Array de Entry, keyPath `id` |
| localStorage: `"meu_diario_v2"` | JSON string | Array de Entry (fallback) |
| localStorage: `"diario_lang"` | string | `'pt'` ou `'en'` |
| localStorage: `"meu_diario_migrated"` | string `"1"` | Flag de migração IDB concluída |

### 6.3 Formato do Arquivo `.md` Exportado

```yaml
---
titulo: Título da entrada
data: 17/03/2026
humor: 😊
tracos: 12                                    ← contador legível (não usado na importação)
pen_strokes: eyJ2IjoxLCJzIjpbXX0=             ← base64(JSON({v:1, s:Stroke[]}))
---

# Título da entrada

Corpo em Markdown com **negrito**, *itálico* e $fórmulas$.
```

A chave `pen_strokes` é sempre em inglês (não traduzida pela i18n), garantindo que o parser de importação funcione independente do idioma em que o arquivo foi exportado.

---

## 7. Fases do Desenvolvimento

### Fase 1 — Prova de Conceito (single-file)

O projeto começou como um único `diario.html` autocontido (~2.730 linhas, ~110KB). Editor básico com textarea, CRUD simples, localStorage puro e Markdown básico. Sem LaTeX, sem caneta, sem exportação.

**Aprendizado desta fase:** a restrição single-file é viável e oferece portabilidade total, mas começa a prejudicar a manutenção acima de ~2000 linhas.

### Fase 2 — Renderização LaTeX

Integração do KaTeX com o pipeline `mdToHtml()`. Criação do diálogo de inserção de equações com 11 templates e preview em tempo real. Definição do padrão de tokenização para separar Markdown de LaTeX antes de qualquer escape HTML.

### Fase 3 — Módulo de Caneta SVG

Implementação do módulo `Pen` completo: Pointer Events API, Bézier quadrática, Douglas-Peucker, sistema de coordenadas de documento com `syncScroll()`, borracha geométrica por hit-test, RAF batching para 60fps.

### Fase 4 — Internacionalização PT/EN

Criação do dicionário `I18N` estático, função `t()` com fallback triplo, `applyLocale()` com `TEXT_MAP` explícito, seletor de idioma com pílulas tipográficas e tooltip via `::after`.

### Fase 5 — Exportação e Importação Markdown

Protocolo de exportação com YAML front matter e traços em base64. Importação com FileReader, parsing do front matter, reconstrução da entrada e validação estrutural dos traços antes de carregar.

### Fase 6 — Fullscreen API e Atalhos de Teclado

Fullscreen cross-browser com prefixos, ícone SVG alternável expand/compress, atalho `F`, sincronização via `fullscreenchange`.

### Fase 7 — Correção do Paralaxe (bug crítico de layout)

Refatoração completa do sistema de scroll. Remoção do `display:flex` do `.editor-area` e do `flex:1` do `.notebook-bg`. Movimentação das linhas de caderno para o `#entry-raw` via `background-attachment: local`. Implementação do `autoResizeTextarea()` e wheel forwarding.

### Fase 8 — Correção da Borracha e Listeners Duplicados

Introdução de `rewire()` para evitar acumulação de listeners na borracha e demais botões da pen toolbar. Migração do hit-test de DOM para geométrico. Melhora do `pointerdown` para verificar `eraserMode` antes de `e.preventDefault()`.

### Fase 9 — Exportação PDF Corrigida e buildPrintSvg()

Restauração de `buildPrintSvg()` com cálculo correto de bounding box e `viewBox`. CSS `@media print` atualizado com `#print-svg-tmp`. Introdução do `buildPrintStage()` para replicar a superfície canônica do Preview/Pen.

### Fase 10 — Camada Institucional

Criação das páginas `index.html`, `sobre.html`, `en.html`, `about.html` com `style.css` independente do diário. Sistema de navegação responsivo via `site-nav.js`. Padronização do nome do produto para **iScrev Notes**.

### Fase 11 — Separação em Arquivos e IndexedDB

Refatoração do single-file para três arquivos separados (`diario.html`, `diario.css`, `diario.js`). Criação do módulo `Storage` com suporte a IndexedDB. Migração automática do localStorage legado. Módulo `pdf-exporter.js` extraído como arquivo independente com paginação lógica e impressão via iframe.

### Fase 12 — Responsividade Completa e Sidebar Drawer

Implementação do drawer responsivo com scrim, animação via `transform`, breakpoint em 900px. Botão `btn-sidebar-toggle` na toolbar principal. `syncResponsiveShell()` e `isMobileShell()` para comportamento adaptativo.

### Fase 13 — Blog Bilíngue, Gerenciador Flask CMS e Funcionalidades Editoriais

Adoção do plugin `i18n_subsites` do Pelican para gerar o blog principal em Inglês (`/blog/`) e um sub-site completo em Português (`/pt/blog/`). O cabeçalho e templates como `base.html` e `article.html` foram refatorados com Jinja2 para utilizar URLs absolutas a partir da raiz (`/`) nas dependências de front-end (evitando quebra de CSS ao navegar nos sub-sites) e renderizar adequadamente a troca de idioma para traduções (mapeando a rota `article.translations[0].url`).
Para evitar complexidade no gerenciamento de arquivos Pelican bilíngues, foi desenvolvido um CMS dedicado com Flask (`blog_manager`) rodando localmente na porta 5001. A ferramenta permite:
- **Sincronização Build/Src:** Compilar o Pelican e mover diretamente `docs/` para `src/` em um botão, habilitando acesso contínuo pelo ambiente de desenvolvimento (`http.server`).
- **Auto-tradução Embutida:** Integração de `deep-translator` em uma rota `/api/translate` chamada de forma assíncrona pelo cliente para popular a versão em inglês a partir da versão em português.
- **Preview Markdown Interativo:** Integração de `marked.js` no ambiente de edição para preview instantâneo dos arquivos em desenvolvimento.

---

## 8. Bugs Documentados e Soluções Adotadas

### Bug 8.1 — Paralaxe nas Linhas de Caderno ★ (mais crítico)

**Sintoma:** ao rolar conteúdo longo, as linhas horizontais do papel ficavam paradas enquanto o texto se movia — efeito de paralaxe.

**Raiz:** o background estava em `.main::before` (position:absolute, não scrolla) ou em `.editor-area` com `display:flex` (onde `background-attachment:local` tem comportamento inconsistente).

**Tentativa 1 — `.main::before`:** background fixo, paralaxe total.

**Tentativa 2 — `background-attachment:local` em `.editor-area`:** falhou em combinação com `display:flex`.

**Tentativa 3 — `.notebook-bg` com `flex:1`:** dependência circular de altura no algoritmo flexbox. O background cobria apenas o viewport, não o conteúdo abaixo.

**Solução definitiva:** remover `display:flex` do `.editor-area` e `flex:1` do `.notebook-bg`. O `.notebook-bg` torna-se um bloco normal que cresce com seu conteúdo. As linhas horizontais foram movidas para o `#entry-raw` com `background-attachment:local` — onde funcionam de forma nativa e confiável.

**Regra derivada:** background e texto devem estar no mesmo elemento filho do scroll container, e esse elemento não pode ter altura fixada pelo algoritmo flex.

### Bug 8.2 — Borracha Não Apagava (listeners duplicados)

**Sintoma:** clicar na borracha parecia ativá-la visualmente, mas ela não apagava nada. O estado alternava `false→true→false` em um único clique.

**Raiz:** `buildToolbar()` chamada 2 vezes (`init()` + `applyLocale()`). Cada chamada executava `eraserBtn.addEventListener('click', callback)` no mesmo elemento. Com 2 listeners, cada clique executava ambos em sequência, terminando sempre em `eraserMode = false`.

**Solução:** função `rewire(id, handler)` usando `cloneNode(true)` + `replaceChild`. O clone é idêntico ao original mas **sem nenhum event listener**. Ao substituir o botão pelo clone, todos os listeners anteriores são descartados automaticamente.

### Bug 8.3 — Borracha Não Apagava (preventDefault prematuro)

**Sintoma:** mesmo com listener único, a borracha não funcionava.

**Raiz:** `e.preventDefault()` em `pointerdown` suprime o evento `click` subsequente. A versão anterior dependia de `click` para a borracha; com a prevenção antecipada, o clique nunca chegava.

**Solução:** verificar `eraserMode` antes de `e.preventDefault()`. No modo borracha, chamar `eraseAt()` diretamente no `pointerdown` e usar `setPointerCapture()` para suportar arrasto:

```javascript
function onPointerDown(e) {
  if (e.button !== 0) return;
  e.preventDefault();
  var coord = getDocCoords(e);
  if (eraserMode) {
    eraseAt(coord[0], coord[1]);
    svgEl.setPointerCapture(e.pointerId);
    return;
  }
  // ... inicia traço de caneta
}
```

### Bug 8.4 — DOM Hit-test Ineficaz na Borracha

**Sintoma:** `pointer-events: stroke` quase nunca registrava cliques nos traços finos.

**Raiz:** a área de hit-test de `pointer-events: stroke` corresponde à largura visual do traço — ~2.5px. Clicar dentro de 2.5px com precisão consistente é humanamente impossível.

**Solução:** `eraserHitTest()` com raio geométrico de 20px — 8× maior que a espessura visual máxima. Rápido, previsível e sem dependência do motor de rendering do browser.

### Bug 8.5 — Desenhos Ausentes no PDF

**Sintoma:** o PDF gerado não incluía os traços da caneta.

**Raiz (dupla):** (1) o `#pen-svg` overlay usa coordenadas de documento (y inclui scrollTop) — em `@media print` não há scrollTop, então os paths ficavam fora do retângulo visível. (2) a função `buildPrintSvg()` havia sido removida em uma refatoração sem restauração.

**Solução:** restaurar `buildPrintSvg()` que calcula o bounding box real de todos os traços, define um `viewBox` autossuficiente com padding de 12px, e recria os traços como `<path>` no novo SVG. O CSS `@media print` oculta o `#pen-svg` original e exibe o SVG standalone gerado.

### Bug 8.6 — Scroll do Textarea Não Propagava

**Sintoma:** usar a roda do mouse sobre o textarea não rolava a página.

**Raiz:** textareas são elementos de formulário nativo que interceptam eventos `wheel` mesmo com `overflow:hidden`.

**Solução:** wheel forwarding manual com conversão de `deltaMode`:

```javascript
raw.addEventListener('wheel', function (e) {
  var delta = e.deltaY;
  if (e.deltaMode === 1) delta *= 20;                  // linhas → px
  if (e.deltaMode === 2) delta *= area.clientHeight;   // páginas → px
  area.scrollTop += delta;
  e.preventDefault();
}, { passive: false });
```

### Bug 8.7 — Sidebar Não Restaurava Corretamente

**Sintoma:** ao fechar e reabrir a sidebar, ela aparecia incorretamente.

**Raiz:** a restauração usava `display:block` em vez de `display:flex`, quebrando a direção de coluna do flexbox interno da sidebar.

**Solução:** controle da sidebar exclusivamente via classes CSS (`.sidebar-open`, `.sidebar-collapsed`) no `<body>`, sem manipulação de `style.display` inline em lugar nenhum.

### Bug 8.8 — Chave i18n Incorreta para Toast de Equação

**Sintoma:** toast "undefined" ao inserir equação.

**Raiz:** o código usava `t('toast.eq')` mas a chave correta no dicionário era `t('toast.eqInserted')`.

**Solução:** unificação da chave para `'toast.eq'` em ambos os idiomas e correção no `addEventListener` do botão de inserção.

---

## 9. Camada Institucional — Páginas do Site

As quatro páginas institucionais (`index.html`, `sobre.html`, `en.html`, `about.html`) foram criadas com identidade visual derivada do diário, mas com uma folha de estilo independente (`style.css`) para não contaminar o CSS da aplicação.

**Características do `style.css`:**

Utiliza CSS Custom Properties alinhadas ao diário (`--paper`, `--warm`, `--rust`), tipografia idêntica, porém com layout baseado em CSS Grid (não Flex como no diário). O sistema de grid responsivo quebra de 3 colunas para 2 (≤980px) e para 1 (≤720px).

A navegação (`site-nav.js`) gerencia um toggle de menu hamburger para viewports ≤720px, com animação de abertura/fechamento via classes CSS e fechamento ao clicar fora ou pressionar `Escape`.

**Estrutura de navegação entre idiomas:**

```
PT: index.html ↔ sobre.html  →  diario.html
EN: en.html    ↔ about.html  →  diario.html
```

Os botões de troca de idioma nas páginas institucionais são links `<a>` simples (não requerem JavaScript), enquanto no diário são botões com `applyLocale()` dinâmica.

---

## 10. Exportação e Importação — Protocolos

### 10.1 Exportação Markdown

```
exportMarkdown()
  1. Coleta Entry atual
  2. Pen.getStrokes() → JSON.stringify({v:1, s:strokes}) → btoa()
  3. Monta front matter YAML com campos localizados + pen_strokes fixo
  4. Concatena "# Título\n\n" + entry.body
  5. new Blob([content], {type:'text/markdown;charset=utf-8'})
  6. URL.createObjectURL() → <a download> programático → URL.revokeObjectURL()
```

### 10.2 Importação Markdown

```
importMarkdown()
  1. <input type="file" accept=".md,.markdown,.txt"> → FileReader.readAsText('utf-8')
  2. Extrai front matter: /^---\r?\n([\s\S]*?)\r?\n---/
  3. Lê 'titulo:' ou 'title:' (aceita ambos os idiomas)
  4. Lê 'humor:' ou 'mood:'
  5. Lê 'pen_strokes:' → atob() → JSON.parse()
     → valida {v:1, s:Array} antes de usar
     → strokes corrompidos: importa só texto (sem erro fatal)
  6. Remove "# Título\n\n" do início do body
  7. Cria Entry, entries.unshift(), Storage.put(), openEntry()
     → openEntry chama Pen.load(strokes) que sanitiza os dados
```

### 10.3 Exportação PDF — Dois Fluxos

**Fluxo A (sem traços):** `PdfExporter.exportEntry(model, opts)` — pagina o conteúdo logicamente, mede blocos via DOM oculto, gera HTML completo, imprime via iframe invisível. Suporta A4 e Letter.

**Fluxo B (com traços):** `buildPrintStage(entry) + window.print()` — replica a superfície canônica do Preview/Pen em um estágio temporário fora da UI, revelado apenas durante `window.print()` via classe `.print-exporting` no `<body>`. Preserva a geometria exata dos traços relativa ao conteúdo.

A escolha entre os fluxos é automática em `exportPDF()`:
```javascript
if (model.strokes && model.strokes.length) {
  fallbackPrint(); // Fluxo B
  return;
}
exporter.exportEntry(model, opts); // Fluxo A
```

---

## 11. Sugestões de Melhoria

### 11.1 Douglas-Peucker Iterativo

A implementação atual usa recursão. Em casos extremos (traços próximos a `MAX_PTS_RAW = 2000` pontos com padrões geométricos que forçam profundidade máxima de recursão), há risco de stack overflow. Conversão para implementação iterativa com pilha explícita:

```javascript
function rdpIterative(pts, eps) {
  var stack = [[0, pts.length - 1]];
  var keep = new Array(pts.length).fill(false);
  keep[0] = keep[pts.length - 1] = true;
  while (stack.length) {
    var range = stack.pop();
    var s = range[0], e = range[1];
    var maxD = 0, maxI = s;
    for (var i = s + 1; i < e; i++) {
      var d = perpDist(pts[i], pts[s], pts[e]);
      if (d > maxD) { maxD = d; maxI = i; }
    }
    if (maxD > eps) {
      keep[maxI] = true;
      stack.push([s, maxI], [maxI, e]);
    }
  }
  return pts.filter(function(_, i) { return keep[i]; });
}
```

### 11.2 Migração para Módulos ES6 (build step opcional)

Separar o `diario.js` em módulos menores (`i18n.js`, `pen.js`, `storage.js`, `editor.js`) melhoraria radicalmente a manutenibilidade. Para manter a compatibilidade sem bundler, usar `<script type="module">` com `nomodule` fallback:

```html
<script type="module" src="assets/js/diario.js"></script>
<script nomodule src="assets/js/diario.legacy.js"></script>
```

Isso exige um servidor HTTP (não funciona com `file://`), mas o projeto já tem essa dependência na versão multi-arquivo.

### 11.3 IndexedDB com Worker de Background

Para entradas muito longas com muitos traços, `Storage.put()` ainda ocorre na thread principal. Um `ServiceWorker` ou `SharedWorker` poderia processar as gravações em background, liberando a thread principal durante o desenho:

```javascript
// Conceito simplificado
navigator.serviceWorker.controller.postMessage({
  type: 'PUT_ENTRY', payload: entry
});
```

### 11.4 Âncoragem Semântica de Traços

O sistema atual armazena coordenadas de traços em espaço de documento absoluto. Ao alternar entre modos editar/preview (que têm alturas de conteúdo diferentes por conta do markdown renderizado), traços podem ficar desalinhados com o texto ao qual se referem.

A solução projetada (Path 2, arquitetura block-level) armazenaria traços com referência relativa ao bloco de conteúdo mais próximo:

```javascript
// Estrutura do ponto semântico
{ bi: 3, yf: 0.42, xf: 0.78 }
// bi = índice do bloco de conteúdo
// yf = fração vertical dentro do bloco
// xf = fração horizontal dentro do bloco
```

Essa abordagem tornaria os traços robustos a redimensionamentos, mudanças de modo e reflow de conteúdo.

### 11.5 Exportação PDF via Canvas/png

Para entradas com traços manuscritos, o Fluxo B (`window.print()`) depende do diálogo de impressão do sistema operacional e não produz um arquivo `.pdf` diretamente. Uma solução mais controlada seria rasterizar o preview em um `<canvas>` via `html2canvas` (ou equivalente puro) e emitir o JPEG como data URL para um gerador de PDF minimalista — mantendo alinhado com a filosofia anti-dependências.

### 11.6 Compressão de Traços

O base64 dos traços no front matter do `.md` pode ser grande para entradas com muitos traços. Uma melhoria seria aplicar deflate/LZ77 antes do base64:

```javascript
// Usando CompressionStream (disponível em browsers modernos)
async function compressStrokes(strokes) {
  var json = JSON.stringify({v:1, s:strokes});
  var stream = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate'));
  var compressed = await new Response(stream).arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(compressed)));
}
```

Redução típica esperada: 60–75% para traços com muitos pontos similares.

### 11.7 Modo Offline com Service Worker

Um `ServiceWorker` básico que armazene em cache os assets do app (HTML, CSS, JS, fontes do KaTeX, Google Fonts) permitiria uso completamente offline após a primeira visita:

```javascript
// service-worker.js (conceito)
var CACHE = 'iscrev-v1';
var ASSETS = [
  '/diario.html', '/assets/css/diario.css', '/assets/js/diario.js',
  '/assets/js/pdf-exporter.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js',
  // fontes e CSS do KaTeX...
];
```

**Referência:** [MDN — Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)

---

## 12. Otimizações de SEO

### 12.1 Páginas Institucionais

As páginas institucionais têm `<meta name="description">` adequado, mas faltam algumas otimizações:

**Open Graph e Twitter Cards** — adicionar nas `<head>` de todas as páginas institucionais:

```html
<meta property="og:title"       content="iScrev Notes | Diário digital com alma de caderno">
<meta property="og:description" content="Escreva, rabisque e organize pensamentos...">
<meta property="og:type"        content="website">
<meta property="og:url"         content="https://seudominio.com/index.html">
<meta property="og:image"       content="https://seudominio.com/assets/og-cover.png">
<meta name="twitter:card"       content="summary_large_image">
```

**Structured Data (JSON-LD)** — para o app:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "iScrev Notes",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0" }
}
</script>
```

**`<link rel="canonical">`** — em cada página, apontar para a versão autoritativa:

```html
<link rel="canonical" href="https://seudominio.com/index.html">
```

**Hreflang** — indicar a relação entre versões PT e EN:

```html
<link rel="alternate" hreflang="pt-BR" href="https://seudominio.com/index.html">
<link rel="alternate" hreflang="en"    href="https://seudominio.com/en.html">
```

### 12.2 Performance e Core Web Vitals

**Preload de fontes críticas** — `Dancing Script` e `Playfair Display` são renderizados acima da dobra e podem causar FOUT (Flash of Unstyled Text):

```html
<link rel="preload" as="style"
  href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:wght@700&display=swap">
```

**`font-display: swap`** — já incluso via Google Fonts com `&display=swap`, mas vale confirmar que o parâmetro está presente em todos os `<link>` de fontes.

**LCP (Largest Contentful Paint)** — o `<h1>` das páginas institucionais é o elemento candidato a LCP. Como usa `Playfair Display` (fonte externa), adicionar `<link rel="preload">` explícito para o arquivo de fonte mais usado acelera a renderização.

**Meta viewport correto** — já presente em todas as páginas:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 12.3 Acessibilidade como Fator SEO

**Atributos `aria-label`** — já presentes nos botões principais, mas faltam em alguns controles dinâmicos gerados pelo `Pen.buildToolbar()`. Os botões de cor e espessura já têm `aria-label` calculado, o que é correto.

**Contraste de cores** — os tons de texto sobre fundo papel (`--ink: #1a1209` sobre `--paper: #f5efe0`) atingem ratio de aproximadamente 12:1, bem acima do mínimo WCAG AA de 4.5:1.

**`lang` no `<html>`** — corretamente implementado e atualizado dinamicamente no diário (`document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'`).

### 12.4 Sitemap e robots.txt

Para domínio próprio, adicionar:

```xml
<!-- sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://seudominio.com/</loc><priority>1.0</priority></url>
  <url><loc>https://seudominio.com/sobre.html</loc><priority>0.8</priority></url>
  <url><loc>https://seudominio.com/en.html</loc><priority>0.9</priority></url>
  <url><loc>https://seudominio.com/about.html</loc><priority>0.7</priority></url>
</urlset>
```

```
# robots.txt
User-agent: *
Allow: /
Disallow: /assets/js/
Sitemap: https://seudominio.com/sitemap.xml
```

---

## 13. Referências e Recursos Externos

### 13.1 APIs e Especificações Web (usadas no projeto)

| Recurso | URL |
|---------|-----|
| ECMAScript 5.1 Spec | https://www.ecma-international.org/ecma-262/5.1/ |
| W3C Pointer Events Level 3 | https://www.w3.org/TR/pointerevents3/ |
| MDN — Pointer Events | https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events |
| MDN — IndexedDB API | https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API |
| MDN — Fullscreen API | https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API |
| MDN — SVG path element | https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path |
| W3C SVG Path Data | https://www.w3.org/TR/SVG/paths.html#PathData |
| MDN — setPointerCapture | https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture |
| MDN — background-attachment | https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment |
| MDN — CSS Custom Properties | https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties |

### 13.2 KaTeX

| Recurso | URL |
|---------|-----|
| KaTeX — Documentação da API | https://katex.org/docs/api.html |
| KaTeX — Tabela de suporte LaTeX | https://katex.org/docs/support_table.html |
| KaTeX — Opções de renderização | https://katex.org/docs/options.html |
| Repositório GitHub | https://github.com/KaTeX/KaTeX |

### 13.3 Algoritmos Utilizados

| Algoritmo | Referência |
|-----------|-----------|
| Douglas-Peucker (simplificação de polilinha) | Ramer, U. (1972). "An iterative procedure for the polygonal approximation of plane curves". Computer Graphics and Image Processing. |
| Bézier quadrática para suavização de traços | Mortenson, M. (1985). Geometric Modeling. Wiley. |
| Base64 encoding | RFC 4648 — https://datatracker.ietf.org/doc/html/rfc4648 |

### 13.4 Recursos para Ampliação

| Tópico | Recurso |
|--------|---------|
| Service Worker e PWA | https://web.dev/learn/pwa/ |
| CompressionStream API | https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream |
| CSS Houdini (Worklets) | https://developer.mozilla.org/en-US/docs/Web/API/CSS_Painting_API |
| IndexedDB com Promises (Dexie.js) | https://dexie.org/ (alternativa mais ergonômica ao IDB nativo) |
| Web Animations API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API |
| Core Web Vitals | https://web.dev/articles/vitals |
| WCAG 2.2 (acessibilidade) | https://www.w3.org/TR/WCAG22/ |
| Schema.org SoftwareApplication | https://schema.org/SoftwareApplication |
| Open Graph Protocol | https://ogp.me/ |
| Google Fonts — otimização de carregamento | https://fonts.google.com/knowledge/using_type/using_web_fonts |
| MDN — Using Service Workers | https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers |
| Excalidraw (referência de UX para caneta) | https://excalidraw.com/ |
| perfect-freehand (biblioteca de traços suaves) | https://github.com/steveruizok/perfect-freehand |
| Artigo: "Building a drawing app" (CSS-Tricks) | https://css-tricks.com/building-progress-ring-quickly/ |
| ISO 32000 (especificação PDF) | https://www.iso.org/standard/75839.html |

### 13.5 Ferramentas de Diagnóstico Recomendadas

| Ferramenta | Finalidade | URL |
|------------|-----------|-----|
| Lighthouse | Auditoria de performance, SEO e acessibilidade | https://developer.chrome.com/docs/lighthouse/overview/ |
| WebPageTest | Análise detalhada de carregamento | https://www.webpagetest.org/ |
| axe DevTools | Auditoria de acessibilidade | https://www.deque.com/axe/ |
| BrowserStack | Teste cross-browser, incluindo iOS Safari | https://www.browserstack.com/ |
| Chrome DevTools Performance | Profiling de runtime e flame charts | (DevTools → Performance) |
| Can I Use | Compatibilidade de APIs entre browsers | https://caniuse.com/ |

---

*Documento gerado em março de 2026. Mantido como registro técnico vivo do projeto iScrev Notes.*
