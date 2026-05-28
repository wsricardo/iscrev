# iScrev Notes — Documentação Técnica Consolidada

> Documento gerado a partir da análise do diretório `src/` e do material histórico em `doc/`.  
> Base principal analisada: `src/diario.html`, `src/assets/js/diario.js`, `src/assets/js/pdf-exporter.js`, `src/assets/js/support.js`, `src/assets/js/site-nav.js`, `src/service-worker.js`, `src/manifest.json`, páginas HTML públicas e arquivos de apoio em `src/assets/css/`.  
> Base histórica consultada: `doc/DOCUMENTACAO-v2g.md`, `doc/DOCUMENTACAO_v.md`, `doc/doc-tech.md` e `doc/src_old/diario_v9.html`.

---

## 1. Introdução: funcionamento e implementação

O iScrev Notes é um aplicativo web de escrita pessoal que combina três superfícies de expressão no mesmo fluxo: texto bruto com Markdown leve, fórmulas em LaTeX e anotações manuscritas em SVG. A aplicação principal vive em `src/diario.html` e opera como uma SPA local-first, sem backend próprio, sem contas de usuário e sem sincronização obrigatória. O dado permanece prioritariamente no navegador do usuário e o uso central do produto depende de APIs nativas do browser, não de frameworks.

Na prática, o fluxo principal do app é simples: o usuário cria uma entrada, escreve no `textarea`, alterna entre os modos Editar, Caneta e Preview, salva automaticamente ou manualmente, e pode exportar a anotação como Markdown ou PDF. O texto é persistido como texto puro, enquanto os rabiscos são armazenados como arrays de pontos, cores e espessuras. Isso mantém o modelo de dados relativamente enxuto e facilita a exportação e a reidratação das entradas.

A implementação atual não é mais a versão single-file descrita em parte da documentação antiga. O histórico em `doc/DOCUMENTACAO_v.md`, `doc/doc-tech.md` e `doc/src_old/diario_v9.html` mostra uma fase anterior em que o projeto era essencialmente um arquivo HTML único, com `localStorage` como backend exclusivo. A versão atual evoluiu para uma estrutura modular em `src/assets/js/`, introduziu `IndexedDB` com fallback para `localStorage`, separou páginas institucionais e acrescentou recursos de PWA, navegação institucional, página de apoio, assets SEO e documentação auxiliar embutida no próprio `src`.

Há, porém, uma nuance importante: embora documentos históricos e até trechos do README descrevam a stack como “ES5 puro”, o código atual usa recursos modernos de navegador e uma mistura de estilos. Exemplos concretos: scripts carregados com `type="module"` em `src/diario.html`, `Array.prototype.find()` em `src/assets/js/diario.js:2607`, `URLSearchParams` em `src/assets/js/support.js:285`, `Object.freeze` em `src/assets/js/support.js:4` e `const` com arrow functions em `src/service-worker.js:1-33`. Portanto, a filosofia segue “zero build step”, mas a compatibilidade real é de browsers modernos.

---

## 2. Arquitetura identificada no projeto

### 2.1 Estrutura geral de `src/`

```text
src/
├── diario.html
├── index.html
├── en.html
├── sobre.html
├── about.html
├── support.html
├── contato.html
├── contact.html
├── privacidade.html
├── privacy.html
├── manifest.json
├── service-worker.js
├── robots.txt
├── sitemap.xml
├── ads.txt
├── DOCUMENTACAO.md
├── Doc-old.md
├── iScrev-Notes-Historico-Tecnico.md
├── diario-backup.js
├── diario-old.css
├── assets/
│   ├── css/
│   │   ├── diario.css
│   │   ├── style.css
│   │   ├── support.css
│   │   └── style-blog.css
│   ├── js/
│   │   ├── diario.js
│   │   ├── pdf-exporter.js
│   │   ├── site-nav.js
│   │   ├── support.js
│   │   └── ui.js
│   └── img/
│       ├── favicon.svg
│       ├── apple-touch-icon.png
│       ├── icon-192.png
│       ├── icon-512.png
│       └── og-image.png
└── todos/
    ├── iScrev-Notes-SEO-Acessibilidade.md
    └── Relatorio-SEO-Acessibilidade-2026-03-29.md
```

### 2.2 Camadas funcionais

#### A. Núcleo do aplicativo de diário

- `src/diario.html`: shell da SPA do diário.
- `src/assets/css/diario.css`: layout, identidade visual, responsividade e regras do caderno digital.
- `src/assets/js/diario.js`: lógica principal do app.
- `src/assets/js/pdf-exporter.js`: exportação paginada para PDF.
- `src/assets/js/ui.js`: placeholder intencional para futuros helpers de UI.

#### B. Camada institucional e editorial

- `src/index.html` e `src/en.html`: landing pages em PT e EN.
- `src/sobre.html` e `src/about.html`: apresentação conceitual do projeto.
- `src/contato.html` e `src/contact.html`: canais de contato.
- `src/privacidade.html` e `src/privacy.html`: política de privacidade e termos.
- `src/support.html`: página de apoio com Stripe/PIX e troca de idioma via query string.
- `src/assets/css/style.css`: base visual compartilhada dessas páginas.
- `src/assets/css/support.css`: extensão visual específica da página de apoio.
- `src/assets/js/site-nav.js`: menu responsivo compartilhado nas páginas públicas.
- `src/assets/js/support.js`: lógica específica da página de apoio.

#### C. Camada PWA, SEO e publicação

- `src/manifest.json`: metadados de instalação.
- `src/service-worker.js`: cache offline básico.
- `src/robots.txt`, `src/sitemap.xml`, `src/ads.txt`: descoberta, indexação e monetização.

#### D. Camada histórica e de apoio técnico

- `src/DOCUMENTACAO.md`, `src/Doc-old.md`, `src/iScrev-Notes-Historico-Tecnico.md`: documentação embutida no diretório de código.
- `src/diario-backup.js` e `src/diario-old.css`: snapshots legados, não carregados por `diario.html`.
- `src/todos/*.md`: material de SEO, acessibilidade e manutenção.

### 2.3 Arquitetura de execução

O projeto adota uma arquitetura sem etapa de build, mas não puramente estática no sentido mais simples. O fluxo principal fica assim:

1. `src/diario.html` monta a interface do diário e registra o service worker (`src/diario.html:378-389`).
2. `src/assets/js/pdf-exporter.js` é carregado antes de `src/assets/js/diario.js` e expõe `window.PdfExporter`.
3. `src/assets/js/diario.js` inicializa i18n, storage, caneta, lista de entradas, modos do editor, exportação e atalhos.
4. `src/service-worker.js` aplica cache-first para um conjunto reduzido de assets principais.
5. `src/manifest.json` permite instalação em modo standalone.

### 2.4 Três estratégias de internacionalização no mesmo projeto

Um aspecto arquitetural marcante é que o projeto hoje usa **três estratégias diferentes de i18n**:

1. `diario.html` usa tradução dinâmica em runtime com dicionário interno `I18N` e persistência do idioma em `localStorage` (`src/assets/js/diario.js:22-423`).
2. `support.html` usa uma página única com cópias em `COPY`, escolha por `?lang=en` e reescrita de rotas/metadata em runtime (`src/assets/js/support.js:44-620`).
3. As demais páginas públicas usam arquivos duplicados por idioma (`index.html`/`en.html`, `sobre.html`/`about.html`, `contato.html`/`contact.html`, `privacidade.html`/`privacy.html`).

Isso funciona, mas cria uma heterogeneidade de manutenção que vale a pena registrar.

### 2.5 Evolução histórica identificada

Do material em `doc/` e do HTML legado em `doc/src_old/diario_v9.html`, a trajetória mais clara do projeto é:

- fase 1: app “Meu Diário”, single-file, `localStorage`, sem separação forte de assets;
- fase 2: crescimento da complexidade visual e resolução de bugs estruturais, especialmente paralaxe, borracha e impressão;
- fase 3: modularização em `src/assets/js/*`, introdução de `IndexedDB`, PWA, páginas institucionais, suporte SEO e página de apoio;
- fase 4: consolidação da marca “iScrev Notes” e abertura do projeto como experiência mais completa do que apenas o editor.

---

## 3. Estruturas de dados, funções, objetos e recursos do código

### 3.1 Recursos e APIs usados na construção

| Recurso | Onde aparece | Papel no projeto |
|---|---|---|
| Google Fonts | `src/diario.html`, `src/index.html`, `src/support.html` | Tipografia editorial do produto |
| KaTeX via CDN | `src/diario.html` | Renderização de LaTeX |
| IndexedDB | `src/assets/js/diario.js:1333-1496` | Persistência primária de entradas |
| `localStorage` | `src/assets/js/diario.js`, `src/assets/js/support.js` | Fallback de persistência e preferências |
| SVG + Pointer Events | `src/diario.html`, `src/assets/js/diario.js:536-1314` | Caneta manuscrita |
| `requestAnimationFrame` | `src/assets/js/diario.js:841-869` | Suavização do desenho |
| FileReader | `src/assets/js/diario.js:2459-2539` | Importação de Markdown |
| Blob + ObjectURL | `src/assets/js/diario.js:2180-2215` | Exportação de Markdown |
| `window.print()` | `src/assets/js/diario.js`, `src/assets/js/pdf-exporter.js` | Exportação PDF |
| Service Worker + Cache API | `src/diario.html:378-389`, `src/service-worker.js` | Offline básico |
| Fullscreen API | `src/assets/js/diario.js:2641-2702` | Tela cheia |
| `navigator.clipboard` | `src/assets/js/support.js:568-590` | Copiar chave PIX |
| Google AdSense | `src/index.html`, `src/ads.txt` | Monetização/publicidade |
| Stripe hospedado | `src/assets/js/support.js` | Apoio por checkout externo |
| PIX | `src/assets/js/support.js` | Apoio manual para público brasileiro |

### 3.2 Estruturas de dados principais

#### Entrada do diário (`Entry`)

Encontrada e inferida a partir de `src/assets/js/diario.js:1952-1964`, `1969-1978`, `2507-2527`.

```js
{
  id: string,
  title: string,
  body: string,
  mood: string,
  strokes: Stroke[],
  createdAt: string,
  updatedAt: string
}
```

Comentários:

- `title` e `body` guardam texto puro, nunca HTML.
- `mood` guarda emoji ou string vazia.
- `strokes` guarda a camada manuscrita.
- `createdAt` e `updatedAt` usam ISO 8601.

#### Traço manuscrito (`Stroke`)

Encontrado em `src/assets/js/diario.js:605-614`, `895-905`, `2449-2525` e no pipeline de PDF em `src/assets/js/pdf-exporter.js:328-474`.

```js
{
  pts: [ [x, y], [x, y], ... ],
  c: string,
  w: number
}
```

Comentários:

- `pts`: coordenadas do documento, não apenas da viewport.
- `c`: cor sanitizada contra a whitelist de `COLORS`.
- `w`: espessura validada e limitada.

#### Modelo de exportação PDF

Montado em `src/assets/js/diario.js:2217-2236` e consumido em `src/assets/js/pdf-exporter.js:146-841`.

```js
{
  title: string,
  dateText: string,
  lang: string,
  previewHtml: string,
  strokes: Stroke[],
  surfaceWidthPx: number
}
```

#### Estado da página de apoio

Encontrado em `src/assets/js/support.js:4-39`, `259-348`, `274-278`.

```js
CONFIG   // configuração congelada
COPY     // dicionário de textos PT/EN
ROUTES   // mapeamento de URLs por idioma
state    // amount, isCustom, method
dom      // cache de nós DOM relevantes
```

### 3.3 Arquivos HTML principais e sua função

| Arquivo | Papel | Observações |
|---|---|---|
| `src/diario.html` | Aplicativo principal do diário | Carrega `pdf-exporter.js`, `diario.js`, `ui.js` como módulos e registra service worker |
| `src/index.html` | Landing page em português | Carrega `style.css`, `site-nav.js`, metadados SEO e AdSense |
| `src/en.html` | Landing page em inglês | Variante da home |
| `src/sobre.html` / `src/about.html` | Páginas conceituais | Explicam identidade e proposta |
| `src/contato.html` / `src/contact.html` | Contato | Páginas institucionais simples |
| `src/privacidade.html` / `src/privacy.html` | Política/termos | Páginas legais |
| `src/support.html` | Página de apoio | Usa `support.js` + `site-nav.js` |

### 3.4 `src/assets/js/diario.js` — objeto central da aplicação

Arquivo de aproximadamente 106 KB, carregado como módulo, mas escrito como IIFE. É o núcleo técnico do iScrev Notes.

#### 3.4.1 Internacionalização

| Item | Onde está | Entrada | Saída | Comentário |
|---|---|---|---|---|
| `I18N` | `src/assets/js/diario.js:22` | — | objeto | Dicionário estático PT/EN do diário |
| `t(key)` | `src/assets/js/diario.js:272` | `key: string` | `string` | Resolve tradução com fallback para `pt` e depois para a própria chave |
| `applyLocale(lang)` | `src/assets/js/diario.js:284` | `lang: 'pt' \| 'en'` | `void` | Valida o idioma e delega a atualização real |
| `doApply(lang)` | `src/assets/js/diario.js:290` | `lang: 'pt' \| 'en'` | `void` | Atualiza texto, placeholders, tooltips, links legais, humor e estado dos botões |

Observações:

- O idioma ativo do diário é salvo em `localStorage['diario_lang']`.
- O dicionário inclui também labels de toolbar, toasts, confirmação, exportação e termos legais.

#### 3.4.2 Renderização de Markdown e LaTeX

| Função | Onde está | Entrada | Saída | Funcionamento |
|---|---|---|---|---|
| `renderTex(latex, display)` | `src/assets/js/diario.js:426` | `latex: string`, `display: boolean` | `string` HTML | Encapsula `katex.renderToString()` e trata erro visualmente |
| `escHtml(s)` | `src/assets/js/diario.js:440` | `s: any` | `string` | Escapa HTML e reduz risco de XSS em texto puro |
| `mdToHtml(src)` | `src/assets/js/diario.js:457` | `src: string` | `string` HTML | Tokeniza LaTeX inline/bloco e envia o restante ao conversor Markdown |
| `convertMarkdown(raw)` | `src/assets/js/diario.js:483` | `raw: string` | `string` HTML | Aplica Markdown básico, headings, blockquote, listas, código inline e quebras |

Observações:

- O pipeline primeiro separa LaTeX do texto comum e só depois converte o restante.
- Isso evita corromper expressões matemáticas ao escapar HTML cedo demais.

#### 3.4.3 Objeto `Pen`

Objeto declarado em `src/assets/js/diario.js:536-1314`.

##### Constantes e estado privado

| Item | Onde está | Comentário |
|---|---|---|
| `SVG_NS` | `src/assets/js/diario.js:539` | Namespace SVG |
| `MAX_STROKES = 500` | `src/assets/js/diario.js:542` | Limite de traços por entrada |
| `MAX_PTS_RAW = 2000` | `src/assets/js/diario.js:543` | Limite de pontos brutos por traço |
| `DP_EPSILON = 1.5` | `src/assets/js/diario.js:544` | Tolerância do Douglas-Peucker |
| `COLORS` | `src/assets/js/diario.js:547` | Paleta fixa da caneta |
| `WIDTHS` | `src/assets/js/diario.js:557` | Presets de espessura |
| `strokes` | `src/assets/js/diario.js:576` | Fonte da verdade da camada manuscrita atual |
| `eraserMode`, `panMode`, `drawing`, `rawPts` | `src/assets/js/diario.js:567-575` | Estado interno do gesto atual |

##### Helpers internos principais

| Função | Onde está | Entrada | Saída | Funcionamento |
|---|---|---|---|---|
| `sanitizeColor(c)` | `src/assets/js/diario.js:581` | `string` | `string` | Garante cor dentro da whitelist |
| `sanitizeWidth(w)` | `src/assets/js/diario.js:588` | `number \| string` | `number` | Limita espessura ao intervalo seguro |
| `sanitizePt(p)` | `src/assets/js/diario.js:594` | `[x, y]` | `[x, y]` | Converte para inteiros finitos |
| `sanitizeStrokes(arr)` | `src/assets/js/diario.js:605` | `any` | `Stroke[]` | Limpa estrutura importada/carregada antes de uso |
| `perpDist(p, a, b)` | `src/assets/js/diario.js:621` | 3 pontos | `number` | Distância perpendicular usada no simplificador |
| `rdp(pts, eps, s, e)` | `src/assets/js/diario.js:634` | pontos e faixa | `number[]` | Recursão interna do Douglas-Peucker |
| `simplify(pts, eps)` | `src/assets/js/diario.js:647` | `Point[]`, `eps` | `Point[]` | Reduz pontos preservando forma |
| `toPathD(pts)` | `src/assets/js/diario.js:664` | `Point[]` | `string` | Gera o atributo `d` do SVG com curvas quadráticas |
| `makeSvgPath(color, width)` | `src/assets/js/diario.js:684` | cor e espessura | `SVGPathElement` | Cria o path visual do traço |
| `syncScroll()` | `src/assets/js/diario.js:702` | — | `void` | Compensa o scroll no `g#pen-layer` |
| `onWheel(e)` | `src/assets/js/diario.js:710` | `WheelEvent` | `void` | Repassa rolagem para o editor |
| `getDocCoords(e)` | `src/assets/js/diario.js:726` | `PointerEvent` | `[x, y]` | Converte evento em coordenadas do documento |
| `rafFlush()` | `src/assets/js/diario.js:744` | — | `void` | Atualiza o path ativo no próximo frame |
| `renderAll()` | `src/assets/js/diario.js:754` | — | `void` | Recria toda a camada SVG com base em `strokes` |
| `eraserHitTest(docX, docY)` | `src/assets/js/diario.js:775` | `x`, `y` | `number` | Localiza o traço mais próximo para apagar |
| `eraseAt(docX, docY)` | `src/assets/js/diario.js:787` | `x`, `y` | `void` | Remove traço e notifica persistência |
| `notifyChange()` | `src/assets/js/diario.js:951` | — | `void` | Dispara o callback público `_onStrokesChange` |

##### Handlers de gesto

| Função | Onde está | Entrada | Saída | Comentário |
|---|---|---|---|---|
| `onPointerDown(e)` | `src/assets/js/diario.js:797` | `PointerEvent` | `void` | Inicia desenho, pan ou borracha |
| `onPointerMove(e)` | `src/assets/js/diario.js:828` | `PointerEvent` | `void` | Continua gesto ativo |
| `onPointerUp(e)` | `src/assets/js/diario.js:871` | `PointerEvent` | `void` | Finaliza traço, simplifica, persiste |
| `onPointerCancel(e)` | `src/assets/js/diario.js:919` | `PointerEvent` | `void` | Limpa gesto interrompido |
| `onEraserClick(e)` | `src/assets/js/diario.js:932` | `MouseEvent` | `void` | Compatibilidade adicional para apagar por clique |

##### API pública de `Pen`

| Método | Onde está | Entrada | Saída | Papel |
|---|---|---|---|---|
| `_onStrokesChange` | `src/assets/js/diario.js:971` | callback | — | Ponto de integração com o app |
| `init(svg, layer, editorArea)` | `src/assets/js/diario.js:979` | elementos DOM | `void` | Registra listeners e monta toolbar |
| `activate()` | `src/assets/js/diario.js:999` | — | `void` | Ativa captura de desenho |
| `deactivate()` | `src/assets/js/diario.js:1007` | — | `void` | Desativa overlay interativo |
| `showOverlay()` | `src/assets/js/diario.js:1015` | — | `void` | Mostra a camada manuscrita |
| `hideOverlay()` | `src/assets/js/diario.js:1021` | — | `void` | Oculta a camada manuscrita |
| `load(savedStrokes)` | `src/assets/js/diario.js:1039` | `Stroke[]` | `void` | Reidrata traços salvos/importados |
| `getStrokes()` | `src/assets/js/diario.js:1046` | — | `Stroke[]` | Expõe o array atual |
| `undo()` | `src/assets/js/diario.js:1049` | — | `void` | Remove o último traço |
| `clear()` | `src/assets/js/diario.js:1060` | — | `void` | Apaga todos os traços com confirmação |
| `setColor(color)` | `src/assets/js/diario.js:1070` | cor | `void` | Define cor ativa |
| `setWidth(width)` | `src/assets/js/diario.js:1077` | largura | `void` | Define espessura ativa |
| `setEraser(on)` | `src/assets/js/diario.js:1080` | `boolean` | `void` | Alterna borracha |
| `setPan(on)` | `src/assets/js/diario.js:1092` | `boolean` | `void` | Alterna modo mão |
| `buildPrintOverlay(surfaceWidth, surfaceHeight)` | `src/assets/js/diario.js:1115` | largura e altura | `SVGElement \| null` | Gera overlay alinhado à superfície canônica |
| `buildPrintSvg()` | `src/assets/js/diario.js:1160` | — | `SVGElement \| null` | Gera SVG standalone para impressão |
| `buildToolbar()` | `src/assets/js/diario.js:1230` | — | `void` | Cria swatches, larguras e rewire de botões |

#### 3.4.4 Objeto `Storage`

Objeto declarado em `src/assets/js/diario.js:1333-1496`.

| Item | Onde está | Entrada | Saída | Comentário |
|---|---|---|---|---|
| `DB_NAME = 'meu_diario_db'` | `src/assets/js/diario.js:1336` | — | — | Nome do banco IndexedDB |
| `STORE_NAME = 'entries'` | `src/assets/js/diario.js:1338` | — | — | Object store das entradas |
| `LS_KEY = 'meu_diario_v2'` | `src/assets/js/diario.js:1339` | — | — | Chave do fallback em `localStorage` |
| `init()` | `src/assets/js/diario.js:1349` | — | `Promise<void>` | Tenta abrir/criar IDB e cai para fallback silencioso |
| `getAll()` | `src/assets/js/diario.js:1413` | — | `Promise<Entry[]>` | Lê todas as entradas |
| `put(entry)` | `src/assets/js/diario.js:1424` | `Entry` | `Promise<void>` | Upsert por `id` |
| `remove(id)` | `src/assets/js/diario.js:1435` | `string` | `Promise<void>` | Remove entrada |
| `backend()` | `src/assets/js/diario.js:1446` | — | `'indexeddb' \| 'localstorage'` | Diagnóstico do backend ativo |
| `_lsGetAll()` | `src/assets/js/diario.js:1463` | — | `Entry[]` | Leitura de fallback |
| `_lsPut(entry)` | `src/assets/js/diario.js:1470` | `Entry` | `void` | Persistência de fallback |
| `_lsRemove(id)` | `src/assets/js/diario.js:1477` | `string` | `void` | Remoção de fallback |
| `_lsSave(all)` | `src/assets/js/diario.js:1482` | `Entry[]` | `void` | Salva JSON e dispara evento de quota se necessário |

#### 3.4.5 Estado, utilitários e navegação do diário

| Item/Função | Onde está | Entrada | Saída | Comentário |
|---|---|---|---|---|
| `entries` | `src/assets/js/diario.js:1507` | — | `Entry[]` | Fonte da verdade das entradas carregadas |
| `currentId` | `src/assets/js/diario.js:1508` | — | `string \| null` | Entrada atualmente aberta |
| `loadData()` | `src/assets/js/diario.js:1511` | — | `Promise<void>` | Carrega `entries` do backend |
| `saveEntry_store(entry)` | `src/assets/js/diario.js:1523` | `Entry` | `void` | Persiste uma única entrada |
| `removeEntry_store(id)` | `src/assets/js/diario.js:1534` | `string` | `void` | Remove uma entrada do backend |
| `uid()` | `src/assets/js/diario.js:1557` | — | `string` | Gera IDs baseados em tempo + aleatório |
| `fmtLong(iso)` | `src/assets/js/diario.js:1561` | `string` ISO | `string` | Data longa localizada |
| `fmtShort(iso)` | `src/assets/js/diario.js:1566` | `string` ISO | `string` | Data curta localizada |
| `isMobileShell()` | `src/assets/js/diario.js:1590` | — | `boolean` | Usa `matchMedia` para layout móvel |
| `isSidebarOpen()` | `src/assets/js/diario.js:1594` | — | `boolean` | Lê o estado lógico da sidebar |
| `syncSidebarToggleControl()` | `src/assets/js/diario.js:1600` | — | `void` | Sincroniza ícone/label do toggle |
| `setSidebarOpen(open)` | `src/assets/js/diario.js:1619` | `boolean` | `void` | Alterna drawer ou colapso lateral |
| `syncResponsiveShell()` | `src/assets/js/diario.js:1632` | — | `void` | Ajusta a shell conforme breakpoint e estado |
| `stripForSidebar(str)` | `src/assets/js/diario.js:1645` | `string` | `string` | Remove Markdown/LaTeX para preview de lista |
| `wordCount(str)` | `src/assets/js/diario.js:1649` | `string` | `number` | Conta palavras do texto visível |
| `showToast(msg)` | `src/assets/js/diario.js:1660` | `string` | `void` | Exibe notificação temporária |
| `renderList(q)` | `src/assets/js/diario.js:1676` | filtro opcional | `void` | Recria a lista de entradas |

#### 3.4.6 Superfície canônica, modos e impressão

| Função | Onde está | Entrada | Saída | Comentário |
|---|---|---|---|---|
| `renderCanonicalSurface()` | `src/assets/js/diario.js:1724` | — | `void` | Renderiza o preview HTML a partir do texto bruto |
| `alignNotebookTail(n)` | `src/assets/js/diario.js:1737` | `number` | `number` | Alinha altura extra às linhas do caderno |
| `getMaxStrokeY()` | `src/assets/js/diario.js:1741` | — | `number` | Mede a profundidade máxima dos traços |
| `resetNotebookTail()` | `src/assets/js/diario.js:1754` | — | `void` | Zera a cauda adicional do caderno |
| `syncNotebookTail()` | `src/assets/js/diario.js:1760` | — | `void` | Expande o fundo quando traços ultrapassam o conteúdo |
| `maybeGrowNotebookTail()` | `src/assets/js/diario.js:1782` | — | `void` | Crescimento progressivo próximo ao fim do scroll |
| `cloneRenderedPreview(source, target)` | `src/assets/js/diario.js:1806` | 2 elementos | `void` | Clona o preview já renderizado |
| `buildPrintStage(entry)` | `src/assets/js/diario.js:1813` | `Entry` | `HTMLElement \| null` | Monta o palco temporário de impressão |
| `setMode(m)` | `src/assets/js/diario.js:1881` | `'edit' \| 'pen' \| 'preview'` | `void` | Alterna a superfície de trabalho |

#### 3.4.7 CRUD, editor e stats

| Função | Onde está | Entrada | Saída | Comentário |
|---|---|---|---|---|
| `openEntry(id)` | `src/assets/js/diario.js:1929` | `string` | `void` | Abre entrada, reidrata UI e traços |
| `newEntry()` | `src/assets/js/diario.js:1952` | — | `void` | Cria entrada vazia e a abre |
| `saveEntry()` | `src/assets/js/diario.js:1969` | — | `void` | Copia DOM para o modelo e persiste |
| `deleteEntry()` | `src/assets/js/diario.js:1983` | — | `void` | Confirma, remove, reseta UI |
| `updateStats()` | `src/assets/js/diario.js:2016` | — | `void` | Atualiza contador de palavras |

#### 3.4.8 Diálogo de equação

| Item/Função | Onde está | Entrada | Saída | Comentário |
|---|---|---|---|---|
| `EQ_TMPLS` | `src/assets/js/diario.js:2058` | — | array | Presets como Fração, Integral, Baskara, Euler |
| `updateEqPreview()` | `src/assets/js/diario.js:2085` | — | `void` | Renderiza preview do LaTeX do modal |
| `eqBlock` | `src/assets/js/diario.js:2083` | — | `boolean` | Define inserção inline ou em bloco |

#### 3.4.9 Exportação e importação

| Função | Onde está | Entrada | Saída | Comentário |
|---|---|---|---|---|
| `exportMarkdown()` | `src/assets/js/diario.js:2180` | — | `void` | Gera `.md` com front matter e `pen_strokes` em base64 |
| `collectPdfExportModel(entry)` | `src/assets/js/diario.js:2217` | `Entry` | objeto | Prepara modelo para `PdfExporter` |
| `setPdfExportBusy(isBusy)` | `src/assets/js/diario.js:2241` | `boolean` | `void` | Bloqueia botão durante exportação |
| `canUseWindowPrint(targetWin)` | `src/assets/js/diario.js:2249` | `Window` | `boolean` | Testa disponibilidade de impressão |
| `waitForPrintLifecycle(targetWin, opts)` | `src/assets/js/diario.js:2253` | janela e opções | `Promise<void>` | Monitora ciclo de abertura/fechamento da impressão |
| `cleanupPrintStage(stage)` | `src/assets/js/diario.js:2344` | `HTMLElement` | `void` | Remove palco temporário |
| `runStagePrintJob(entry, onDispatched)` | `src/assets/js/diario.js:2349` | `Entry`, callback | `Promise<void>` | Executa impressão via superfície canônica |
| `getPdfErrorToastKey(err)` | `src/assets/js/diario.js:2375` | erro | `string` | Escolhe a chave de toast |
| `exportPDF()` | `src/assets/js/diario.js:2386` | — | `void` | Exporta por `window.print()` e cai para o paginator quando adequado |
| `importMarkdown()` | `src/assets/js/diario.js:2459` | — | `void` | Lê arquivo, parseia front matter e recria uma entrada |

#### 3.4.10 Auto-resize, autosave, fullscreen e inicialização

| Função/Item | Onde está | Entrada | Saída | Comentário |
|---|---|---|---|---|
| `autoResizeTextarea(el)` | `src/assets/js/diario.js:2560` | `HTMLTextAreaElement` | `void` | Faz o editor crescer sem scroll interno |
| `debSave()` | `src/assets/js/diario.js:2592` | — | `void` | Debounce de 1,8 s para salvamento automático |
| `Pen._onStrokesChange = ...` | `src/assets/js/diario.js:2606` | `Stroke[]` | `void` | Persistência imediata dos traços |
| `FS_ICON` | `src/assets/js/diario.js:2641` | — | objeto | SVGs de entrar/sair de fullscreen |
| `isFullscreen()` | `src/assets/js/diario.js:2657` | — | `boolean` | Estado atual da Fullscreen API |
| `updateFsIcon()` | `src/assets/js/diario.js:2670` | — | `void` | Sincroniza ícone e acessibilidade |
| `toggleFullscreen()` | `src/assets/js/diario.js:2690` | — | `void` | Entra/sai da tela cheia |
| `migrateFromLocalStorage()` | `src/assets/js/diario.js:2826` | — | `Promise<void>` | Migra legado para IndexedDB |

### 3.5 `src/assets/js/pdf-exporter.js`

Módulo autocontido que publica `window.PdfExporter`. Ele é usado quando o app quer exportar texto renderizado com paginação lógica e, no fluxo atual, funciona como fallback especialmente relevante quando não há traços manuscritos.

| Função/objeto | Onde está | Entrada | Saída | Comentário |
|---|---|---|---|---|
| `DEFAULTS` | `src/assets/js/pdf-exporter.js:6` | — | objeto | Formato, margens, delays e timeouts |
| `PAGE_FORMATS` | `src/assets/js/pdf-exporter.js:15` | — | objeto | A4 e Letter |
| `normalizeOptions(opts)` | `src/assets/js/pdf-exporter.js:124` | opções | objeto normalizado | Calcula medidas imprimíveis |
| `buildExportModel(input)` | `src/assets/js/pdf-exporter.js:146` | modelo bruto | objeto validado | Valida título, data, HTML, traços e largura |
| `sanitizePreviewTree(root)` | `src/assets/js/pdf-exporter.js:176` | `HTMLElement` | `HTMLElement` | Remove scripts e URLs perigosas |
| `normalizePreviewBlocks(previewHtml)` | `src/assets/js/pdf-exporter.js:203` | `string` | `Node[]` | Separa o HTML renderizado em blocos imprimíveis |
| `measureBlocks(blocks, surfaceWidthPx)` | `src/assets/js/pdf-exporter.js:291` | blocos e largura | objeto de medição | Mede alturas/topos em DOM oculto |
| `appendSpacerBlocks(...)` | `src/assets/js/pdf-exporter.js:356` | documento medido | novo documento | Acrescenta espaçadores quando os traços vão além do fluxo textual |
| `paginateBlocks(measuredBlocks, pageHeightLogicalPx)` | `src/assets/js/pdf-exporter.js:381` | blocos medidos | `Page[]` | Divide o documento em páginas |
| `buildPageOverlaySvg(...)` | `src/assets/js/pdf-exporter.js:418` | traços e faixa da página | `SVGElement \| null` | Sobrepõe desenho por página |
| `collectHeadAssets()` | `src/assets/js/pdf-exporter.js:559` | — | `string` HTML | Replica estilos relevantes no iframe |
| `buildPrintHtml(model, pages, opts, scale)` | `src/assets/js/pdf-exporter.js:585` | modelo e páginas | `string` HTML | Gera o documento final imprimível |
| `waitForPrintable(doc, timeoutMs)` | `src/assets/js/pdf-exporter.js:632` | documento | `Promise<void>` | Espera fontes/estilos ficarem prontos |
| `waitForPrintLifecycle(targetWin, opts)` | `src/assets/js/pdf-exporter.js:642` | janela e opções | `Promise<void>` | Gerencia o ciclo da impressão no iframe |
| `printInIframe(html, opts)` | `src/assets/js/pdf-exporter.js:737` | HTML e opções | `Promise<void>` | Cria iframe invisível, injeta HTML e dispara impressão |
| `exportEntry(input, options)` | `src/assets/js/pdf-exporter.js:816` | modelo + opções | `Promise<void>` | API principal do exportador |
| `isSupported()` | `src/assets/js/pdf-exporter.js:841` | — | `boolean` | Verifica suporte mínimo para impressão |

### 3.6 `src/assets/js/support.js`

Módulo da página de apoio. Não participa do diário em si, mas faz parte da arquitetura atual do produto.

| Item/Função | Onde está | Entrada | Saída | Comentário |
|---|---|---|---|---|
| `CONFIG` | `src/assets/js/support.js:4` | — | objeto congelado | Configura moeda, presets, links Stripe e chave PIX |
| `COPY` | `src/assets/js/support.js:44` | — | objeto | Dicionário PT/EN da página de apoio |
| `ROUTES` | `src/assets/js/support.js:259` | — | objeto | URLs por idioma |
| `state` | `src/assets/js/support.js:274` | — | objeto | Estado mínimo: valor, customização e método |
| `getLang()` | `src/assets/js/support.js:280` | — | `'pt' \| 'en'` | Lê `?lang=` ou idioma do navegador |
| `t(key)` | `src/assets/js/support.js:297` | `string` | `string` | Resolve cópia do idioma atual |
| `qs(id)` | `src/assets/js/support.js:304` | `string` | `HTMLElement \| null` | Helper de DOM |
| `dom` | `src/assets/js/support.js:308` | — | objeto | Cache dos nós relevantes |
| `activeUrl()` | `src/assets/js/support.js:350` | — | `string` | Canonical/OG da página ativa |
| `currentCurrency()` | `src/assets/js/support.js:356` | — | objeto | Moeda do idioma atual |
| `formatNumber(value)` | `src/assets/js/support.js:360` | `number` | `string` | Formatação localizada |
| `formatAmount(value)` | `src/assets/js/support.js:369` | `number` | `string` | Combina símbolo e valor |
| `sanitizeAmount(raw)` | `src/assets/js/support.js:373` | `string \| number` | `number \| null` | Limita o valor dentro do intervalo permitido |
| `getStripeLink()` | `src/assets/js/support.js:383` | — | `string` | Lê o link configurado para o valor atual |
| `isConfigured(link)` | `src/assets/js/support.js:390` | `string` | `boolean` | Verifica se o checkout Stripe foi configurado |
| `applyMeta()` | `src/assets/js/support.js:396` | — | `void` | Atualiza `<title>`, canonical e Open Graph |
| `applyCopy()` | `src/assets/js/support.js:409` | — | `void` | Reescreve os textos do DOM |
| `applyRoutes()` | `src/assets/js/support.js:449` | — | `void` | Troca links conforme idioma |
| `buildAmounts()` | `src/assets/js/support.js:473` | — | `void` | Constrói botões de presets e botão customizado |
| `setMethod(method)` | `src/assets/js/support.js:512` | `'stripe' \| 'pix'` | `void` | Define a aba ativa |
| `updateMethodPanels()` | `src/assets/js/support.js:517` | — | `void` | Sincroniza tablist e painéis |
| `updateStripeButton()` | `src/assets/js/support.js:528` | — | `void` | Habilita/desabilita CTA do Stripe |
| `updateSummary()` | `src/assets/js/support.js:547` | — | `void` | Atualiza resumo do valor |
| `render()` | `src/assets/js/support.js:551` | — | `void` | Re-render central da página |
| `handleCustomInput()` | `src/assets/js/support.js:558` | — | `void` | Lê o valor digitado pelo usuário |
| `copyPixKey()` | `src/assets/js/support.js:568` | — | `void` | Copia a chave PIX usando Clipboard API ou fallback |
| `showSuccessState()` | `src/assets/js/support.js:593` | — | `void` | Exibe mensagem após retorno do Stripe |
| `bindEvents()` | `src/assets/js/support.js:610` | — | `void` | Conecta todos os eventos da página |

### 3.7 `src/assets/js/site-nav.js`

| Função | Onde está | Entrada | Saída | Comentário |
|---|---|---|---|---|
| `bindNav(nav)` | `src/assets/js/site-nav.js:6` | `HTMLElement nav` | `void` | Ativa o menu responsivo, aria-expanded, fechamento por clique externo e `Escape` |

Observações:

- O módulo usa `matchMedia('(max-width: 720px)')`.
- É aplicado a todo `header nav` encontrado no DOM.

### 3.8 `src/assets/js/ui.js`

Arquivo propositalmente mínimo.

| Item | Onde está | Comentário |
|---|---|---|
| IIFE vazia/placeholder | `src/assets/js/ui.js:1-8` | Reserva espaço para helpers futuros sem conflitar com a gestão de sidebar feita por `diario.js` |

### 3.9 `src/service-worker.js`

| Item | Onde está | Papel |
|---|---|---|
| `CACHE = "iscrev-notes-v8"` | `src/service-worker.js:1` | Versão do cache |
| `ASSETS` | `src/service-worker.js:2-8` | Lista de assets pré-cacheados |
| listener `install` | `src/service-worker.js:10-15` | Abre cache, faz `addAll`, chama `skipWaiting()` |
| listener `activate` | `src/service-worker.js:18-28` | Remove caches antigos e chama `clients.claim()` |
| listener `fetch` | `src/service-worker.js:30-34` | Estratégia cache-first simples |

Observações:

- O cache cobre especialmente o diário e seus JS/CSS principais.
- Nem todas as páginas públicas estão no `ASSETS`.

### 3.10 `src/manifest.json`

| Chave | Valor atual | Comentário |
|---|---|---|
| `name` | `iScrev Notes` | Nome completo do app |
| `short_name` | `iScrev` | Nome curto |
| `start_url` | `/diario.html` | Supõe publicação na raiz do domínio |
| `display` | `standalone` | Comportamento de PWA instalada |
| `background_color` | `#f5efe0` | Papel/base visual |
| `theme_color` | `#c8843a` | Cor principal do produto |
| `icons` | `192`, `512`, `favicon.svg` | Assets de instalação |

### 3.11 CSS principal

#### `src/assets/css/diario.css`

- Define tokens visuais do diário logo no início (`src/assets/css/diario.css:1-13`).
- Mantém `.editor-area` como único scroll container e `.notebook-bg` como fundo do caderno.
- Traz ajustes específicos para estabilidade do layout multilíngue, como `min-width` em botões da toolbar.
- Carrega a semântica visual da caneta, do overlay SVG, dos modais, toasts, toolbar, sidebar e impressão.

#### `src/assets/css/style.css`

- Base visual compartilhada das páginas públicas.
- Define tokens, shell do site, navegação, heróis, seções, cards e grid editorial.
- Também contém estilos para a seção de blog da home, embora as páginas `/blog/` não estejam no diretório `src`.

#### `src/assets/css/support.css`

- Complementa `style.css` apenas para a página de apoio.
- Organiza card de contribuição, abas Stripe/PIX e detalhes de pagamento.

#### `src/assets/css/style-blog.css`

- Arquivo de estilo preparado para páginas do blog.
- O diretório `src` atual não contém páginas de blog usando esse CSS, mas há links para `/blog/` em páginas públicas.

---

## 4. Recomendações de manutenção, refatoração e possíveis pontos de risco

### 4.1 Recomendações de manutenção cotidiana

1. Ao alterar o layout do diário, preservar a regra estrutural mais importante do editor: `#editor-area` deve continuar sendo o único scroll container real e o fundo do caderno deve permanecer acoplado à superfície rolável. A documentação histórica mostra que mudanças nessa relação geraram bugs visuais difíceis.
2. Ao mexer em persistência, manter compatibilidade com o schema atual de `Entry` e com o campo `pen_strokes` do front matter exportado. Isso afeta importação, backup e qualquer migração futura.
3. Sempre que novos textos forem adicionados ao diário, atualizar `I18N` em `src/assets/js/diario.js`; para a página de apoio, atualizar `COPY`; para as páginas públicas bilíngues, revisar também os pares de arquivos HTML estáticos.
4. Sempre que houver publicação de novos assets críticos do diário, revisar `src/service-worker.js` e fazer bump da versão `CACHE`, caso contrário usuários podem continuar servidos por cache obsoleto.
5. Qualquer mudança em `manifest.json`, service worker e registro do service worker deve considerar que o projeto supõe publicação na raiz do domínio (`/diario.html`, `/service-worker.js`).

### 4.2 Prioridades de refatoração

1. Quebrar `src/assets/js/diario.js` em módulos menores, idealmente por responsabilidade: `i18n`, `storage`, `pen`, `editor`, `export`, `shell`.
2. Remover ou isolar trechos legados comentados dentro de `diario.js`, especialmente as antigas implementações de `loadData`, `saveData`, callbacks de persistência e inicialização.
3. Unificar a estratégia de internacionalização do projeto. Hoje há três abordagens coexistindo, o que aumenta custo cognitivo e risco de divergência entre páginas.
4. Introduzir smoke tests manuais ou automatizados para estes fluxos: criar entrada, desenhar, exportar/importar `.md`, exportar PDF, alternar idioma, trocar modo, excluir entrada e abrir o app offline.
5. Considerar externalizar configurações operacionais da página de apoio, principalmente links do Stripe, para reduzir edição manual no código-fonte.

### 4.3 Pontos de risco e possíveis bugs observados

#### Risco alto: importação Markdown parece usar função removida

- `importMarkdown()` chama `saveData()` em `src/assets/js/diario.js:2530`.
- A implementação ativa de `saveData()` não existe mais; há apenas uma versão comentada em `src/assets/js/diario.js:1548-1549`.
- Efeito provável: a importação pode cair no `catch` e mostrar erro genérico, mesmo quando o parsing estiver correto.

#### Risco médio: chave de toast divergente no diálogo de equações

- O clique em “Inserir” usa `showToast(t('toast.eqInserted'))` em `src/assets/js/diario.js:2148`.
- No dicionário `I18N`, a chave existente é `toast.eq`, não `toast.eqInserted`.
- Efeito provável: o usuário pode ver a própria chave crua em vez da mensagem traduzida.

#### Risco médio: inicialização duplicada e mistura de fluxo novo com legado

- Há uma cadeia assíncrona de inicialização iniciada em `src/assets/js/diario.js:2847`.
- Depois dela, ainda existem chamadas avulsas a `loadData()`, `applyLocale(currentLang)` e abertura da última entrada em `src/assets/js/diario.js:2875-2886`.
- Isso sugere código de transição não totalmente removido e pode gerar corridas sutis ou estado inicial inconsistente.

#### Risco médio: documentação histórica fala em ES5, mas o código atual já depende de APIs modernas

- Há `find`, `findIndex`, `URLSearchParams`, `Object.freeze`, scripts `type="module"`, `Promise`, `const` e arrow functions.
- Isso não é um defeito por si só, mas é uma divergência importante entre a descrição histórica da stack e a realidade atual do runtime.

#### Risco médio: PWA e publicação presumem raiz do domínio

- `manifest.json` usa `start_url: "/diario.html"`.
- `diario.html` registra o service worker em `/service-worker.js`.
- Esse desenho funciona bem em domínio raiz, mas dificulta deploy em subpastas sem ajustes.

#### Risco médio: service worker é simples e cobre apenas parte do produto

- O cache offline é curto e orientado ao diário.
- `support.html`, `support.css`, boa parte das páginas institucionais e alguns assets não aparecem no array `ASSETS`.
- A estratégia é cache-first para tudo, o que simplifica, mas aumenta o risco de conteúdo desatualizado após release.

#### Risco médio: página de apoio ainda não está operacional no fluxo Stripe

- `CONFIG.stripeLinks` está vazio em `src/assets/js/support.js:21-37`.
- O próprio código já trata isso e desabilita o botão quando não configurado, mas é um recurso estruturalmente pronto e funcionalmente incompleto.

#### Risco baixo a médio: sitemap não inclui toda a superfície pública

- `src/sitemap.xml` lista home, sobre/about, privacy/privacidade e contato/contact.
- `support.html` não aparece no sitemap atual, embora seja uma página pública com metadados próprios.
- Isso não quebra o site, mas reduz consistência de indexação.

#### Risco baixo: complexidade crescente do módulo `Pen`

- O módulo é bem encapsulado, mas concentra desenho, borracha, pan, toolbar, overlay de impressão e saneamento de dados.
- Como ele já é o trecho mais sensível da interface, qualquer alteração precisa ser regressada com cuidado.

#### Risco baixo: `style-blog.css` e assets de blog indicam superfície externa parcialmente fora do `src`

- Há links para `/blog/` em páginas públicas e um CSS específico para blog.
- Como as páginas do blog não estão no diretório analisado, a documentação do `src` não cobre esse subsistema por completo.

---

## 5. Resumo final do projeto, da estrutura e ideias de melhoria

O iScrev Notes hoje é mais do que um editor isolado: ele já se comporta como um pequeno ecossistema web com app principal, páginas institucionais, suporte offline parcial, assets de SEO, documentação histórica e uma superfície própria de apoio ao projeto. O coração técnico continua sendo o diário em `src/diario.html` e `src/assets/js/diario.js`, mas o restante do `src` mostra que o produto amadureceu para uma presença pública mais completa.

Arquiteturalmente, a evolução mais importante foi a saída de um modelo single-file com `localStorage` para um modelo modular sem build, com `IndexedDB`, separação de responsabilidades por arquivo e uma estratégia de exportação/importação bem mais sofisticada. Mesmo assim, o código ainda carrega traços visíveis dessa transição, o que ajuda a entender a história do projeto e também aponta onde a manutenção tende a ser mais delicada.

As melhorias mais valiosas no curto e médio prazo seriam: modularizar `diario.js`, unificar a estratégia de internacionalização, consolidar a inicialização do app, fortalecer o fluxo de importação/exportação com testes e revisar a cobertura do service worker. Essas mudanças aumentariam a confiança de manutenção sem exigir mudança de filosofia do projeto.

No plano de novos recursos, o produto ganharia bastante com organização semântica adicional, como tags, cadernos, filtros por humor e busca mais rica; com recursos de continuidade, como histórico/versões locais de entradas; e com uma camada opcional de sincronização criptografada que preserve a ideia local-first em vez de substituí-la. O potencial do app é alto justamente porque ele já resolve bem o caso central de uso e ainda tem espaço natural para crescer em torno dele.
