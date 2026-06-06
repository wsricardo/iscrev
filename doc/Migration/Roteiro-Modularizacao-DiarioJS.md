# Roteiro de Modularização do `diario.js`

> **Produto:** iScrev Notes  
> **Escopo:** Organização proposta para modularizar cada seção de `src/assets/js/diario.js`.  
> **Base:** `doc/Migration/GUIDE-Migration.md`, `doc/Migration/MigrationPlan.md`, `doc/SpecsModule.md`, `doc/specs/10-modular-api-contracts.md`, `doc/DiarioJSAnalysis.md` e seções atuais de `diario.js`.

---

## 1. Objetivo deste roteiro

Este documento transforma o plano geral de migração em um roteiro operacional por seção do `diario.js`. A ideia não é apenas "quebrar o arquivo em vários arquivos", mas criar módulos com fronteiras claras, APIs pequenas e dependências explícitas.

O `diario.js` atual já está organizado por seções conceituais. Isso é uma vantagem: a migração pode preservar essa leitura, extraindo cada bloco para um módulo coerente sem alterar comportamento em massa.

Princípios para a migração:

- **Migração incremental:** extrair um subsistema por vez, mantendo o app funcional entre etapas.
- **ESM browser-first:** usar `import` e `export` nativos, sem exigir bundler.
- **Estado explícito:** substituir variáveis compartilhadas da IIFE por `app/state.js`.
- **Dependências injetadas:** módulos complexos, especialmente `Pen`, recebem DOM e callbacks por configuração.
- **UI separada da regra:** módulos em `ui/` manipulam DOM; módulos em `editor/`, `infra/` e `shared/` evitam depender da apresentação quando possível.
- **Contratos antes de limpeza:** primeiro mover preservando API; depois simplificar chamadas internas.

---

## 2. Estrutura-alvo sugerida

A estrutura abaixo segue a separação por camadas definida nos documentos de migração e nos contratos modulares.

```text
src/assets/js/diario/
+-- main.js
+-- app/
|   +-- bootstrap.js
|   +-- state.js
|   +-- actions.js
|   +-- autosave.js
+-- editor/
|   +-- markdown.js
|   +-- pen.js
|   +-- text-formatting.js
|   +-- notebook-surface.js
|   +-- import-markdown.js
|   +-- export-markdown.js
|   +-- export-pdf.js
+-- ui/
|   +-- i18n.js
|   +-- toast.js
|   +-- sidebar.js
|   +-- modes.js
|   +-- dialogs.js
|   +-- support-dialog.js
|   +-- toolbar.js
|   +-- keyboard.js
+-- infra/
|   +-- storage.js
|   +-- browser.js
|   +-- files.js
|   +-- clipboard.js
+-- shared/
    +-- ids.js
    +-- dates.js
    +-- dom.js
    +-- events.js
    +-- constants.js
    +-- entry.js
```

### Papel das camadas

| Camada | Responsabilidade | Exemplos |
| :--- | :--- | :--- |
| `shared/` | Funções puras, modelos e constantes sem dependência de DOM. | `uid()`, datas, modelo `Entry`, nomes de eventos. |
| `infra/` | Integração com APIs do navegador e persistência. | IndexedDB, localStorage, Fullscreen, FileReader, Clipboard. |
| `editor/` | Mecânicas centrais do editor e formatos de conteúdo. | Markdown/LaTeX, caneta SVG, import/export. |
| `ui/` | Componentes de interface e manipulação direta do DOM. | Sidebar, toast, modais, toolbar, i18n aplicado ao DOM. |
| `app/` | Orquestração, estado da sessão e fluxo de inicialização. | `state`, `actions`, `bootstrap`, autosave. |

---

## 3. Mapa geral: seção atual para módulo futuro

| Seção atual em `diario.js` | Responsabilidade | Módulo principal sugerido | Fase do plano |
| :--- | :--- | :--- | :--- |
| Seção 0 | Internacionalização | `ui/i18n.js` | Fase 3 |
| Seção 1 | Markdown + LaTeX | `editor/markdown.js` | Fase 1 |
| Seção 2 | Motor da caneta | `editor/pen.js` | Fase 2 |
| Seção 2.5 | Persistência | `infra/storage.js` | Fase 1 |
| Seção 3 | Estado e persistência de alto nível | `app/state.js` e `app/actions.js` | Fase 4 |
| Seção 4 | Utilitários | `shared/ids.js`, `shared/dates.js`, `shared/dom.js` | Fase 1 |
| Seção 5 | Toast | `ui/toast.js` | Fase 3 |
| Seção 6 | Sidebar/lista | `ui/sidebar.js` | Fase 3 |
| Seção 7 | Modos edit/pen/preview | `ui/modes.js` | Fase 3 |
| Seção 8 | CRUD de entradas | `app/actions.js` | Fase 4 |
| Seção 9 | Formatação via toolbar | `editor/text-formatting.js` e `ui/toolbar.js` | Fase 3/4 |
| Seção 10 | Diálogo de equação | `ui/dialogs.js` | Fase 3 |
| Seção 11 | Exportação/importação | `editor/export-markdown.js`, `editor/import-markdown.js`, `editor/export-pdf.js` | Fase 4 |
| Seção 12 | Autosave e callbacks da caneta | `app/autosave.js` e `app/actions.js` | Fase 4 |
| Seção 13 | Fullscreen | `infra/browser.js` e `ui/toolbar.js` | Fase 3 |
| Seção 14 | Atalhos de teclado | `ui/keyboard.js` | Fase 4 |
| Seção 14 duplicada | Fiação de eventos | `app/bootstrap.js` | Fase 4 |
| Seção 15 | Inicialização | `app/bootstrap.js` e `main.js` | Fase 5 |

> Observação: a documentação arquitetural registra que há duas seções marcadas como "Seção 14" no `diario.js`: uma para atalhos de teclado e outra para fiação de eventos. Este roteiro separa as duas responsabilidades em `ui/keyboard.js` e `app/bootstrap.js`, sem exigir renumeração imediata no código legado.

---

## 4. Contratos de comunicação recomendados

Para evitar que os novos arquivos reproduzam o mesmo acoplamento da IIFE, a comunicação entre módulos deve seguir três padrões simples.

### 4.1 Importação direta para funções puras

Use quando o módulo não precisa de estado externo nem DOM.

```js
import { mdToHtml } from '../editor/markdown.js';
import { formatDate } from '../shared/dates.js';
```

### 4.2 Injeção de dependência para motores com estado

Use quando o módulo precisa de DOM, callbacks ou serviços externos.

```js
import { Pen } from '../editor/pen.js';
import { showToast } from '../ui/toast.js';
import { t } from '../ui/i18n.js';

const pen = new Pen({
  svgElement: document.getElementById('pen-svg'),
  layerElement: document.getElementById('pen-layer'),
  editorAreaElement: document.getElementById('editor-area'),
  onStrokesChange: actions.updateCurrentEntryStrokes,
  showToast,
  t
});
```

### 4.3 Eventos customizados para avisos transversais

Use quando uma camada de infraestrutura precisa avisar a aplicação sem conhecer a UI.

```js
document.dispatchEvent(new CustomEvent('storage:quota-exceeded'));
document.dispatchEvent(new CustomEvent('app:state-changed'));
document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang } }));
```

---

## 5. Roteiro por seção

### 5.1 Seção 0 - Internacionalização (`ui/i18n.js`)

**Responsabilidade atual:** manter o dicionário `I18N`, detectar idioma ativo, persistir `diario_lang`, traduzir strings com `t(key)` e atualizar textos do DOM com `applyLocale(lang)`.

**Problema atual:** `applyLocale()` manipula muitos elementos diretamente e também aciona componentes dinâmicos, como mood select e toolbar da caneta. Isso cria acoplamento da tradução com outros subsistemas.

**Organização sugerida:**

```text
ui/
+-- i18n.js
```

**API sugerida:**

```js
export function getCurrentLang() {}
export function setCurrentLang(lang) {}
export function t(key) {}
export function applyLocale(lang, root = document) {}
```

**Exemplo de módulo:**

```js
const STORAGE_KEY = 'diario_lang';

const I18N = {
  pt: {
    'btn.new': 'Nova Entrada'
  },
  en: {
    'btn.new': 'New Entry'
  }
};

let currentLang = detectInitialLang();

export function t(key) {
  return I18N[currentLang]?.[key] || I18N.pt?.[key] || key;
}

export function applyLocale(lang, root = document) {
  currentLang = I18N[lang] ? lang : 'pt';
  localStorage.setItem(STORAGE_KEY, currentLang);

  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  document.dispatchEvent(
    new CustomEvent('i18n:changed', { detail: { lang: currentLang } })
  );
}
```

**Como migrar sem quebrar:**

1. Mover `I18N`, `currentLang`, `t()` e `applyLocale()` para `ui/i18n.js`.
2. Manter temporariamente o mesmo mapa de IDs usado por `doApply()`.
3. Trocar chamadas diretas a `Pen.buildToolbar()` por evento `i18n:changed`.
4. Fazer `toolbar.js`, `sidebar.js` e `pen.js` ouvirem esse evento quando precisarem reconstruir labels.

---

### 5.2 Seção 1 - Renderização LaTeX + Markdown (`editor/markdown.js`)

**Responsabilidade atual:** converter conteúdo bruto da entrada em HTML seguro para preview, preservando blocos e trechos inline de LaTeX renderizados pelo KaTeX.

**Por que deve sair cedo:** é um conjunto de funções quase puras. Depende basicamente da entrada textual e de `window.katex`, não do estado da aplicação.

**Organização sugerida:**

```text
editor/
+-- markdown.js
```

**API sugerida:**

```js
export function escHtml(value) {}
export function renderTex(latex, display) {}
export function convertMarkdown(raw) {}
export function mdToHtml(source) {}
```

**Exemplo de uso:**

```js
import { mdToHtml } from '../editor/markdown.js';

export function renderPreview({ rawElement, previewElement }) {
  previewElement.innerHTML = mdToHtml(rawElement.value);
}
```

**Cuidados específicos:**

- Preservar o fallback quando KaTeX não éstiver disponível.
- Preservar escaping HTML antes de aplicar regras Markdown.
- Evitar que `markdown.js` acesse `entryRaw`, `entryPreview`, `currentId` ou qualquer elemento global.
- Se o pipeline crescer, separar depois em `latex.js` e `markdown-inline.js`; não fazer isso na primeira extração.

---

### 5.3 Seção 2 - Módulo de Caneta (`editor/pen.js`)

**Responsabilidade atual:** gerenciar desenho SVG com Pointer Events, suavização por Bezier, simplificação Douglas-Peucker, borracha, pan, undo, clear, toolbar da caneta e geração de SVG para impressão/exportação.

**Problema atual:** a IIFE `Pen` já é um módulo conceitual, mas ainda acessa dependências do escopo externo, como tradução, toast, confirmação e callback de salvamento.

**Organização sugerida:**

```text
editor/
+-- pen.js
+-- notebook-surface.js
```

`pen.js` deve cuidar do motor de traços. `notebook-surface.js` pode ficar responsável, em uma etapa posterior, por alinhar preview, camada SVG, altura do caderno e superfície de impressão.

**API sugerida conforme contrato:**

```js
export class Pen {
  constructor(options) {}
  activate() {}
  deactivate() {}
  showOverlay() {}
  hideOverlay() {}
  load(savedStrokes) {}
  getStrokes() {}
  undo() {}
  clear() {}
  setColor(color) {}
  setWidth(width) {}
  setEraser(enabled) {}
  setPan(enabled) {}
  buildToolbar() {}
  buildPrintSvg() {}
}
```

**Exemplo de instânciação:**

```js
const pen = new Pen({
  svgElement: document.getElementById('pen-svg'),
  layerElement: document.getElementById('pen-layer'),
  editorAreaElement: document.getElementById('editor-area'),
  toolbarElement: document.getElementById('pen-toolbar'),
  onStrokesChange: (strokes) => actions.updateCurrentEntryStrokes(strokes),
  confirm: (message) => window.confirm(message),
  showToast,
  t
});
```

**Como migrar sem quebrar:**

1. Mover a IIFE inteira para `editor/pen.js`.
2. Trocar variáveis fechadas da IIFE por propriedades privadas da instância.
3. Receber elementos DOM no `constructor` ou em `init(options)`.
4. Receber `showToast`, `t`, `confirm` e `onStrokesChange` via injeção.
5. Manter a representação atual de `Stroke` para não quebrar persistência e exportação.
6. Só depois separar a construção da toolbar para `ui/toolbar.js`, se fizer sentido.

**Regra de segurança:** não alterar ao mesmo tempo geometria do overlay, formato dos traços e exportação PDF. Esses três pontos são altamente acoplados.

---

### 5.4 Seção 2.5 - Storage (`infra/storage.js`)

**Responsabilidade atual:** inicializar IndexedDB, prover fallback para `localStorage`, ler todas as entradas, salvar uma entrada, remover uma entrada e informar o backend ativo.

**Por que deve ser uma das primeiras extrações:** a API já está clara (`init`, `getAll`, `put`, `remove`, `backend`) e o módulo já evita manipular UI diretamente, usando eventos para erros.

**Organização sugerida:**

```text
infra/
+-- storage.js
```

**API pública obrigatória:**

```js
export async function init() {}
export async function getAll() {}
export async function put(entry) {}
export async function remove(id) {}
export function backend() {}
```

**Exemplo de uso:**

```js
import * as Storage from '../infra/storage.js';

await Storage.init();
const entries = await Storage.getAll();
await Storage.put(entry);
```

**Cuidados específicos:**

- Preservar nomes atuais: banco `meu_diario_db`, store `entries`, fallback `meu_diario_v2`.
- Preservar eventos `storage:quota-exceeded` e `storage:error`.
- Manter `migrateFromLocalStorage()` fora do módulo ou como função exportada separada em `infra/storage-migration.js`; a migração é parte do bootstrap, não do CRUD cotidiano.

---

### 5.5 Seção 3 - Estado e Persistência (`app/state.js` + `app/actions.js`)

**Responsabilidade atual:** manter `entries`, `currentId`, carregar dados do storage, salvar entrada e remover entrada.

**Problema atual:** `entries` e `currentId` funcionam como estado global privado da IIFE, acessado por várias seções. Isso dificulta rastrear quem muda o que.

**Organização sugerida:**

```text
app/
+-- state.js
+-- actions.js
```

**API sugerida para `state.js`:**

```js
let entries = [];
let currentId = null;

export function getEntries() {
  return entries.slice();
}

export function setEntries(nextEntries) {
  entries = nextEntries.slice();
  notify();
}

export function getCurrentId() {
  return currentId;
}

export function setCurrentId(id) {
  currentId = id;
  notify();
}

export function getCurrentEntry() {
  return entries.find((entry) => entry.id === currentId) || null;
}

function notify() {
  document.dispatchEvent(new CustomEvent('app:state-changed'));
}
```

**Papel de `actions.js`:**

`actions.js` não deve ser apenas um depósito de funções. Ele deve orquestrar operações completas:

```js
export async function loadEntries() {
  const entries = await Storage.getAll();
  state.setEntries(entries);
  return entries;
}

export async function saveCurrentEntry(patch) {
  const entry = state.updateCurrentEntry(patch);
  await Storage.put(entry);
  document.dispatchEvent(new CustomEvent('entry:saved', { detail: { entry } }));
}
```

**Como dividir:**

- `state.js`: guarda e altera estado em memória.
- `actions.js`: chama `state`, `storage`, `sidebar`, `modes`, `toast` e demais módulos para realizar fluxos de usuário.
- `storage.js`: persiste, mas não sabe qual entrada está aberta.

---

### 5.6 Seção 4 - Utilitários (`shared/*.js`)

**Responsabilidade atual:** gerar IDs, formatar datas, contar palavras, limpar Markdown para sidebar e executar helpers de shell responsivo.

**Problema atual:** a seção mistura funções puras com helpers de DOM. A extração deve separar essas naturezas.

**Organização sugerida:**

```text
shared/
+-- ids.js
+-- dates.js
+-- dom.js
+-- entry.js

editor/
+-- stats.js

ui/
+-- sidebar.js
```

**Distribuição recomendada:**

| Função atual | Destino sugerido | Motivo |
| :--- | :--- | :--- |
| `uid()` | `shared/ids.js` | Função pura de domínio. |
| Formatadores de data | `shared/dates.js` | Reuso em sidebar, exportação e UI. |
| `wordCount()` | `editor/stats.js` | Métrica do conteúdo textual. |
| `stripForSidebar()` | `ui/sidebar.js` ou `editor/stats.js` | Se usado só na lista, manter perto da sidebar. |
| Helpers responsivos da sidebar | `ui/sidebar.js` ou `ui/shell.js` | Dependem de DOM e layout. |

**Exemplo:**

```js
// shared/ids.js
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
```

```js
// editor/stats.js
export function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}
```

---

### 5.7 Seção 5 - Toast (`ui/toast.js`)

**Responsabilidade atual:** exibir notificações temporárias para salvamento, erro, importação, exportação, limite de traços etc.

**Organização sugerida:**

```text
ui/
+-- toast.js
```

**API sugerida:**

```js
let toastElement;
let toastTimer;

export function initToast(element) {
  toastElement = element;
}

export function showToast(message, options = {}) {
  if (!toastElement) return;

  clearTimeout(toastTimer);
  toastElement.textContent = message;
  toastElement.classList.add('is-visible');

  toastTimer = setTimeout(() => {
    toastElement.classList.remove('is-visible');
  }, options.duration || 2200);
}
```

**Eventos que pode ouvir no bootstrap:**

```js
document.addEventListener('storage:quota-exceeded', () => {
  showToast(t('toast.quotaExceeded'));
});

document.addEventListener('storage:error', () => {
  showToast(t('toast.storageError'));
});
```

**Regra:** `toast.js` não deve importar `Storage`, `state` ou `Pen`. Ele apenas mostra mensagens.

---

### 5.8 Seção 6 - Sidebar / Lista de Entradas (`ui/sidebar.js`)

**Responsabilidade atual:** renderizar a lista de entradas, aplicar busca, destacar a entrada atual e controlar comportamento responsivo da sidebar/drawer.

**Organização sugerida:**

```text
ui/
+-- sidebar.js
+-- shell.js
```

Se a sidebar continuar pequena, `shell.js` pode ser dispensado e o comportamento responsivo pode ficar em `sidebar.js`.

**API sugerida:**

```js
export function initSidebar(options) {}
export function renderSidebar(entries, currentId, query = '') {}
export function setSidebarOpen(open) {}
export function syncResponsiveShell() {}
```

**Exemplo de inicialização:**

```js
initSidebar({
  listElement: document.getElementById('entry-list'),
  searchElement: document.getElementById('search'),
  sidebarElement: document.getElementById('sidebar'),
  onSelectEntry: actions.openEntry
});
```

**Padrão de atualização recomendado:**

```js
document.addEventListener('app:state-changed', () => {
  renderSidebar(state.getEntries(), state.getCurrentId(), getSidebarQuery());
});
```

**Cuidados específicos:**

- Não fazer `sidebar.js` salvar entrada diretamente.
- Receber `entries` e `currentId` como parâmetros ou buscar via `state` apenas se essa dependência for assumida de forma explícita.
- Preservar acessibilidade dos botões e títulos já traduzidos por `i18n`.

---

### 5.9 Seção 7 - Controle de Modo (`ui/modes.js`)

**Responsabilidade atual:** alternar entre `edit`, `pen` e `preview`, controlar visibilidade de textarea, preview, overlay SVG, toolbar da caneta e renderização Markdown.

**Organização sugerida:**

```text
ui/
+-- modes.js

editor/
+-- markdown.js
```

**API sugerida:**

```js
export function initModes(options) {}
export function setMode(mode) {}
export function getMode() {}
```

**Exemplo:**

```js
let currentMode = 'edit';
let deps;

export function initModes(options) {
  deps = options;
}

export function setMode(mode) {
  currentMode = mode;

  deps.rawElement.hidden = mode !== 'edit';
  deps.previewElement.hidden = mode === 'edit';

  if (mode === 'preview' || mode === 'pen') {
    deps.previewElement.innerHTML = deps.mdToHtml(deps.rawElement.value);
  }

  if (mode === 'pen') {
    deps.pen.showOverlay();
    deps.pen.activate();
  } else {
    deps.pen.deactivate();
    if (mode === 'edit') deps.pen.hideOverlay();
  }

  document.dispatchEvent(new CustomEvent('editor:mode-changed', { detail: { mode } }));
}
```

**Cuidados específicos:**

- `modes.js` pode depender de uma instância de `Pen`, mas deve recebe-la via `initModes`.
- A renderização Markdown deve vir de `editor/markdown.js`, não ser copiada.
- A altura/alinhamento da superfície do caderno deve ser validada ao alternar modos.

---

### 5.10 Seção 8 - CRUD de Entradas (`app/actions.js`)

**Responsabilidade atual:** criar, abrir, salvar e excluir entradas, sincronizando estado, storage, DOM, caneta, sidebar e toasts.

**Problema atual:** essas funções são o centro do acoplamento da aplicação. Elas sabem de tudo porque tudo está no mesmo escopo.

**Organização sugerida:**

```text
app/
+-- actions.js
```

**API sugerida:**

```js
export async function createEntry() {}
export async function openEntry(id) {}
export async function saveCurrentEntry(options = {}) {}
export async function deleteCurrentEntry() {}
export async function updateCurrentEntryStrokes(strokes) {}
```

**Exemplo de criação:**

```js
export async function createEntry() {
  const entry = createBlankEntry();
  state.prependEntry(entry);
  state.setCurrentId(entry.id);

  await Storage.put(entry);
  editorView.loadEntry(entry);
  sidebar.renderSidebar(state.getEntries(), entry.id);
  showToast(t('toast.new'));

  return entry;
}
```

**Regra de desenho do módulo:**

- `actions.js` pode importar `state` e `Storage`.
- `actions.js` pode chamar funções de UI, mas isso deve ficar explícito nas importações ou ser recebido por `configureActions(deps)`.
- `actions.js` deve ser o unico lugar onde uma ação de usuário atravessa várias camadas.

---

### 5.11 Seção 9 - Formatação via Toolbar (`editor/text-formatting.js` + `ui/toolbar.js`)

**Responsabilidade atual:** aplicar negrito, itálico, citação e lista ao texto selecionado no `textarea`, usando botões com `data-wrap` e `data-prefix`.

**Organização sugerida:**

```text
editor/
+-- text-formatting.js

ui/
+-- toolbar.js
```

**Divisão recomendada:**

- `editor/text-formatting.js`: regras de transformação de texto e seleção.
- `ui/toolbar.js`: registra listeners nos botões e chama as funções do editor.

**Exemplo de função pura/com DOM controlado:**

```js
export function wrapSelection(textarea, before, after = before) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);

  textarea.setRangeText(before + selected + after, start, end, 'select');
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}
```

**Exemplo de toolbar:**

```js
export function initFormattingToolbar(root, textarea) {
  root.querySelectorAll('[data-wrap]').forEach((button) => {
    button.addEventListener('click', () => {
      wrapSelection(textarea, button.dataset.wrap);
    });
  });
}
```

**Cuidados específicos:**

- Preservar `selectionStart`, `selectionEnd` e foco do textarea.
- Disparar `input` para manter autosave e stats funcionando.
- Não misturar estes listeners com o bootstrap final além da chamada de inicialização.

---

### 5.12 Seção 10 - Diálogo de Equação LaTeX (`ui/dialogs.js`)

**Responsabilidade atual:** abrir modal de equação, alternar inline/bloco, gerar preview KaTeX em tempo real, inserir sintaxe no textarea e fechar modal.

**Organização sugerida:**

```text
ui/
+-- dialogs.js
```

**API sugerida:**

```js
export function initEquationDialog(options) {}
export function openEquationDialog() {}
export function closeEquationDialog() {}
```

**Exemplo:**

```js
initEquationDialog({
  dialogElement: document.getElementById('eq-dialog'),
  inputElement: document.getElementById('eq-input'),
  previewElement: document.getElementById('eq-preview'),
  textareaElement: document.getElementById('entry-raw'),
  renderTex,
  showToast,
  t
});
```

**Cuidados específicos:**

- O diálogo deve receber `renderTex` de `editor/markdown.js`.
- A inserção no textarea deve reutilizar helper de `text-formatting.js` ou uma função compartilhada de manipulação de seleção.
- O módulo não deve salvar a entrada diretamente; deve disparar `input` ou chamar callback `onInsert`.

---

### 5.13 Seção 11 - Exportação e Importação (`editor/export-*` + `infra/files.js`)

**Responsabilidade atual:** exportar Markdown com front matter, exportar PDF/impressão, importar Markdown e reconstruir entrada com texto, metadados e traços.

**Problema atual:** a seção mistura regras de formato, APIs de arquivo, DOM de impressão e estado atual da aplicação.

**Organização sugerida:**

```text
editor/
+-- export-markdown.js
+-- import-markdown.js
+-- export-pdf.js

infra/
+-- files.js
```

**Divisão recomendada:**

| Responsabilidade | Destino |
| :--- | :--- |
| Montar conteúdo `.md` com front matter | `editor/export-markdown.js` |
| Parsear front matter e corpo importado | `editor/import-markdown.js` |
| Ler arquivo selecionado pelo usuário | `infra/files.js` |
| Criar Blob e disparar download | `infra/files.js` |
| Preparar stage de impressão/PDF | `editor/export-pdf.js` |

**Exemplo:**

```js
// editor/export-markdown.js
export function entryToMarkdown(entry) {
  return [
    '---',
    `title: ${JSON.stringify(entry.title || '')}`,
    `date: ${JSON.stringify(entry.date || '')}`,
    `mood: ${JSON.stringify(entry.mood || '')}`,
    `strokes: ${JSON.stringify(entry.strokes || [])}`,
    '---',
    '',
    entry.body || ''
  ].join('\n');
}
```

```js
// app/actions.js
export async function exportCurrentEntryAsMarkdown() {
  const entry = state.getCurrentEntry();
  if (!entry) return;

  const markdown = entryToMarkdown(entry);
  downloadText(markdown, `${entry.title || 'entrada'}.md`, 'text/markdown');
  showToast(t('toast.md'));
}
```

**Cuidados específicos:**

- O protocolo Markdown atual é informal; qualquer mudança deve ser compatível com arquivos já exportados.
- Exportação PDF deve validar notas com e sem traços.
- `export-pdf.js` deve receber `Pen` ou `buildPrintSvg` por dependência, não importar uma instância global escondida.

---

### 5.14 Seção 12 - Auto-save com Debounce (`app/autosave.js`)

**Responsabilidade atual:** salvar texto automaticamente após alterações, redimensionar textarea, encaminhar wheel/scroll e persistir traços da caneta via callback.

**Organização sugerida:**

```text
app/
+-- autosave.js

editor/
+-- notebook-surface.js
```

**Divisão recomendada:**

- `app/autosave.js`: debounce, agendamento e cancelamento de salvamento textual.
- `app/actions.js`: operação real de salvar a entrada atual.
- `editor/notebook-surface.js`: auto-resize, sync de altura, alinhamento e comportamento de scroll.
- `editor/pen.js`: chama `onStrokesChange(strokes)` ao concluir um traço.

**Exemplo:**

```js
let timer = null;

export function scheduleAutosave(callback, delay = 600) {
  clearTimeout(timer);
  timer = setTimeout(callback, delay);
}

export function cancelAutosave() {
  clearTimeout(timer);
  timer = null;
}
```

**Exemplo de uso:**

```js
rawElement.addEventListener('input', () => {
  scheduleAutosave(() => actions.saveCurrentEntry({ silent: true }));
});
```

**Cuidados específicos:**

- Texto pode usar debounce; traços devem continuar persistindo imediatamente após cada traço completo.
- O callback da caneta deve chamar uma ação especifica, por exemplo `updateCurrentEntryStrokes(strokes)`.
- Auto-resize e alinhamento visual não devem ser alterados junto com a extração do debounce.

---

### 5.15 Seção 13 - Tela Cheia (`infra/browser.js` + `ui/toolbar.js`)

**Responsabilidade atual:** entrar/sair de fullscreen, tratar variações da Fullscreen API e sincronizar ícone/botão com o estado atual.

**Organização sugerida:**

```text
infra/
+-- browser.js

ui/
+-- toolbar.js
```

**API sugerida para `infra/browser.js`:**

```js
export function isFullscreen() {}
export async function enterFullscreen(element = document.documentElement) {}
export async function exitFullscreen() {}
export async function toggleFullscreen(element) {}
```

**API sugerida para UI:**

```js
export function initFullscreenButton(button, options) {}
export function syncFullscreenButton(button, active) {}
```

**Exemplo:**

```js
document.addEventListener('fullscreenchange', () => {
  syncFullscreenButton(fullscreenButton, isFullscreen());
});
```

**Cuidados específicos:**

- Manter suporte cross-browser já éxistente, se houver prefixos usados no código atual.
- `infra/browser.js` não deve conhecer ícones nem labels.
- `toolbar.js` usa `t('fs.enter')` e `t('fs.exit')` para atualizar titulo/texto.

---

### 5.16 Seção 14 - Atalhos de Teclado (`ui/keyboard.js`)

**Responsabilidade atual:** configurar atalhos como Escape, Ctrl+S, Ctrl+Z e outros comportamentos de teclado associados ao editor, sidebar e caneta.

**Organização sugerida:**

```text
ui/
+-- keyboard.js
```

**API sugerida:**

```js
export function initKeyboardShortcuts(options) {
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      options.saveCurrentEntry();
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'z' && options.isPenMode()) {
      event.preventDefault();
      options.pen.undo();
    }

    if (event.key === 'Escape') {
      options.closeTransientUi();
    }
  });
}
```

**Cuidados específicos:**

- Atalhos devem respeitar foco em inputs, textarea e modais.
- `keyboard.js` não deve importar `Pen` diretamente; deve receber a instância ou callbacks.
- Essa seção deve ser separada da fiação geral de eventos porque tem regras próprias de prioridade e foco.

---

### 5.17 Seção 14 duplicada - Fiação de Eventos (`app/bootstrap.js`)

**Responsabilidade atual:** registrar a maior parte dos `addEventListener`: botões principais, busca, seletor de idioma, modais, eventos de storage, support modal e controles gerais.

**Organização sugerida:**

```text
app/
+-- bootstrap.js
```

**Papel correto do bootstrap:**

`bootstrap.js` deve conectar módulos, não conter regras extensas. Se um listener tiver lógica relevante, essa lógica deve morar no módulo responsável e o bootstrap deve apenas chamar `initX()`.

**Exemplo de bootstrap de eventos:**

```js
function bindEvents(deps) {
  deps.newButton.addEventListener('click', deps.actions.createEntry);
  deps.saveButton.addEventListener('click', () => deps.actions.saveCurrentEntry());
  deps.deleteButton.addEventListener('click', deps.actions.deleteCurrentEntry);

  deps.searchInput.addEventListener('input', () => {
    deps.sidebar.renderSidebar(
      deps.state.getEntries(),
      deps.state.getCurrentId(),
      deps.searchInput.value
    );
  });

  document.addEventListener('storage:quota-exceeded', () => {
    deps.showToast(deps.t('toast.quotaExceeded'));
  });
}
```

**Regra:** se `bootstrap.js` passar de "inicializa e conecta" para "implementa funcionalidade", a funcionalidade deve virar módulo próprio.

---

### 5.18 Seção 15 - Inicialização (`app/bootstrap.js` + `main.js`)

**Responsabilidade atual:** iniciar Storage, migrar localStorage legado, carregar dados, inicializar Pen, aplicar idioma, sincronizar shell responsivo e abrir a entrada mais recente.

**Organização sugerida:**

```text
src/assets/js/diario/main.js
src/assets/js/diario/app/bootstrap.js
```

**`main.js` deve ser mínimo:**

```js
import { bootstrap } from './app/bootstrap.js';

bootstrap().catch((error) => {
  console.error('Falha ao iniciar o diario:', error);
});
```

**Exemplo de fluxo em `bootstrap.js`:**

```js
export async function bootstrap() {
  const dom = collectDom();

  initToast(dom.toast);
  await Storage.init();
  await migrateFromLocalStorage();
  await actions.loadEntries();

  const pen = new Pen({
    svgElement: dom.penSvg,
    layerElement: dom.penLayer,
    editorAreaElement: dom.editorArea,
    onStrokesChange: actions.updateCurrentEntryStrokes,
    showToast,
    t
  });

  initModes({
    rawElement: dom.entryRaw,
    previewElement: dom.entryPreview,
    pen,
    mdToHtml
  });

  initSidebar({
    listElement: dom.entryList,
    searchElement: dom.search,
    onSelectEntry: actions.openEntry
  });

  bindEvents({ dom, pen });
  applyLocale(getCurrentLang());
  openLatestEntryIfAvailable();
}
```

**Cuidados específicos:**

- Consolidar resíduos legados de inicialização citados na `CSpec 09`, como chamadas soltas a `loadData()`, `applyLocale(currentLang)` e `syncResponsiveShell()`.
- Garantir que `Storage.init()` rode antes de qualquer leitura.
- Garantir que a migração de `localStorage` rode antes da primeira renderização baseada em dados.
- Manter abertura automática da entrada mais recente.

---

## 6. Ordem recomendada de execução

### Fase 0 - Preparação

1. Confirmar que `src/diario.html` carrega scripts como `type="module"`.
2. Usar servidor local durante desenvolvimento, pois ESM não deve depender de `file://`.
3. Registrar checklist manual de regressão antes da primeira extração.
4. Evitar novas features durante a migração.

### Fase 1 - Baixo risco

1. Criar `src/assets/js/diario/infra/storage.js`.
2. Criar `src/assets/js/diario/shared/ids.js`.
3. Criar `src/assets/js/diario/shared/dates.js`.
4. Criar `src/assets/js/diario/editor/markdown.js`.
5. Atualizar `diario.js` para importar esses módulos, ainda mantendo o restante monolítico.

### Fase 2 - Motor complexo

1. Criar `editor/pen.js`.
2. Converter a IIFE `Pen` em classe ou factory.
3. Injetar DOM, `showToast`, `t`, `confirm` e `onStrokesChange`.
4. Validar desenho, borracha, undo, clear, pan, scroll, impressão e persistência de traços.

### Fase 3 - UI

1. Extrair `ui/toast.js`.
2. Extrair `ui/i18n.js`.
3. Extrair `ui/sidebar.js`.
4. Extrair `ui/modes.js`.
5. Extrair `ui/dialogs.js`, `ui/support-dialog.js` e `ui/toolbar.js`.

### Fase 4 - Orquestração

1. Criar `app/state.js`.
2. Criar `app/actions.js`.
3. Criar `app/autosave.js`.
4. Criar `ui/keyboard.js`.
5. Transformar a fiação de eventos em funções de `app/bootstrap.js`.

### Fase 5 - Ponto de entrada final

1. Criar `main.js`.
2. Atualizar `src/diario.html` para carregar `assets/js/diario/main.js`.
3. Remover chamadas legadas duplicadas.
4. Remover `diario.js` apenas quando o comportamento estiver coberto pelo novo bootstrap.
5. Atualizar documentação e checklist de regressão.

---

## 7. Exemplo de árvore após a primeira etapa

A primeira etapa não precisa mover tudo. Um estado intermediário saudável seria:

```text
src/assets/js/
+-- diario.js
+-- pdf-exporter.js
+-- ui.js
+-- diario/
    +-- infra/
    |   +-- storage.js
    +-- shared/
    |   +-- ids.js
    |   +-- dates.js
    +-- editor/
        +-- markdown.js
```

Neste ponto, `diario.js` ainda existe, mas já passa a importar funções extraídas:

```js
import * as Storage from './diario/infra/storage.js';
import { uid } from './diario/shared/ids.js';
import { mdToHtml } from './diario/editor/markdown.js';
```

Esse formato permite validar a migração por partes antes de criar o `main.js` final.

---

## 8. Checklist de validação por módulo

### Storage

- `Storage.init()` resolve com IndexedDB disponível.
- Fallback para `localStorage` continua funcional.
- `getAll()`, `put()` e `remove()` preservam estrutura `Entry`.
- Eventos de erro continuam sendo disparados.

### Markdown/LaTeX

- Preview renderiza Markdown básico.
- LaTeX inline e bloco continuam funcionando.
- HTML perigoso continua escapado.
- Falha no KaTeX não quebra o editor.

### Pen

- Desenhar com mouse, touch e caneta funciona.
- Borracha remove traços esperados.
- Undo remove último traço.
- Clear pede confirmação e limpa.
- Pan não desenha acidentalmente.
- Traços persistem após reload.
- Exportação/impressão mantém alinhamento.

### UI

- Sidebar renderiza lista, busca e item ativo.
- Toasts aparecem e somem.
- PT/EN atualiza textos, placeholders, tooltips, mood e toolbar.
- Modais abrem, fecham e respeitam Escape.
- Modos `edit`, `pen` e `preview` alternam sem sobreposição visual.

### App

- Criar entrada.
- Abrir entrada existente.
- Salvar manualmente.
- Autosave textual.
- Excluir entrada.
- Importar Markdown.
- Exportar Markdown.
- Exportar PDF/imprimir.
- Reabrir app e carregar entrada mais recente.

---

## 9. Regras para evitar modularização cosmética

1. Um módulo novo deve esconder detalhes internos e expor uma API menor que o bloco original.
2. Um módulo não deve depender de variáveis globais do antigo `diario.js`.
3. Um módulo de `infra/` não deve importar UI.
4. Um módulo de `shared/` não deve acessar DOM.
5. Um módulo de `ui/` pode manipular DOM, mas não deve persistir dados diretamente.
6. `app/actions.js` deve concentrar fluxos de usuário que atravessam várias camadas.
7. `app/bootstrap.js` deve inicializar e conectar módulos, não virar um novo monolito.
8. Mudanças em formato de `Entry`, `Stroke` ou Markdown exportado exigem estratégia de compatibilidade.
9. Mudanças em overlay, preview, scroll ou impressão exigem validação visual e manual.

---

## 10. Resultado esperado

Ao final da migração, o `diario.js` deixa de ser o centro do sistema. O app passa a ter:

- um `main.js` pequeno;
- um `bootstrap.js` responsável apenas por inicializar e conectar;
- estado explícito em `app/state.js`;
- ações de usuário em `app/actions.js`;
- persistência isolada em `infra/storage.js`;
- motor da caneta testável em `editor/pen.js`;
- renderização Markdown/LaTeX reaproveitável em `editor/markdown.js`;
- UI organizada por superfícies (`sidebar`, `toast`, `dialogs`, `modes`, `toolbar`).

Essa organização preserva os pontos fortes do iScrev Notes - escrita local-first, caderno com texto, fórmula e manuscrito, baixa fricção e confiabilidade - enquanto reduz o custo de evoluir o produto.
