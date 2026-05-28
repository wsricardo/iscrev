# CSpec 02 — Modelo de Dados e Estado

## 1. Objetivo

Formalizar os modelos de dados persistidos e o estado em memória usados pela SPA do diário.

## 2. Tipos principais

### 2.1 `Entry`

```ts
type Entry = {
  id: string;
  title: string;
  body: string;
  mood: string;
  strokes: Stroke[];
  createdAt: string;
  updatedAt: string;
};
```

#### Regras

- `id` deve ser único dentro de `entries`.
- `title` pode ser vazio.
- `body` pode ser vazio.
- `mood` é uma string curta, normalmente vazia ou um emoji presente no seletor de humor.
- `strokes` deve ser um array, mesmo quando vazio.
- `createdAt` e `updatedAt` usam `Date.prototype.toISOString()`.

### 2.2 `Stroke`

```ts
type Stroke = {
  pts: Point[];
  c: string;
  w: number;
};

type Point = [number, number];
```

#### Regras

- `pts.length` deve ser no mínimo `2` para um traço persistido.
- `c` deve pertencer à whitelist de cores do módulo `Pen`.
- `w` deve ser sanitizado para o intervalo `[0.5, 8]`.
- coordenadas são inteiras em pixels CSS e referidas ao espaço de documento.

### 2.3 `PdfExportModel`

```ts
type PdfExportModel = {
  title: string;
  dateText: string;
  lang: string;
  previewHtml: string;
  strokes: Stroke[];
  surfaceWidthPx: number;
};
```

Este objeto não é persistido; ele serve como contrato entre `diario.js` e `pdf-exporter.js`.

## 3. Chaves e identificadores persistentes

### 3.1 IndexedDB

- banco: `meu_diario_db`
- versão: `1`
- object store: `entries`
- `keyPath`: `id`

### 3.2 `localStorage`

- dados legados/fallback: `meu_diario_v2`
- flag de migração: `meu_diario_migrated`
- idioma da UI: `diario_lang`

### 3.3 Protocolo de exportação

- campo de traços no front matter: `pen_strokes`

## 4. Estado global do app

### 4.1 Estado de dados

- `entries: Entry[]`
- `currentId: string | null`

### 4.2 Estado de apresentação

- `currentLang: 'pt' | 'en'`
- `currentMode: 'edit' | 'pen' | 'preview'`
- `pdfExportBusy: boolean`

### 4.3 Estado do crescimento de superfície

- `NOTEBOOK_LINE_PX`
- `NOTEBOOK_TAIL_STEP`
- `NOTEBOOK_TAIL_PAD`
- `NOTEBOOK_TAIL_TRIGGER`
- `notebookTailExtraPx`

## 5. Invariantes de estado

1. `entries` é a lista canônica em memória.
2. `currentId === null` representa ausência de entrada aberta.
3. Quando `currentId !== null`, operações de salvar, exportar e excluir atuam apenas sobre a entrada com esse `id`.
4. `updatedAt` deve ser renovado em saves explícitos, autosave e mudanças de traço.
5. `Pen.getStrokes()` e `entry.strokes` devem convergir após `saveEntry()` ou `Pen._onStrokesChange`.
6. O idioma ativo deve ser persistido em `localStorage['diario_lang']`.

## 6. Geração de IDs

`uid()` usa:

```js
Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
```

### Implicações

- não é UUID;
- é suficiente para unicidade prática local;
- não deve ser reinterpretado semanticamente em outras partes do sistema.

## 7. Sanitização de traços

Os dados em `entry.strokes` entram no runtime por duas vias:

- leitura do backend (`Storage.getAll()`);
- importação Markdown.

Em ambos os casos, o contrato efetivo só se torna válido após `Pen.load()` aplicar:

- limite máximo de traços;
- validação de estrutura;
- sanitização de pontos;
- sanitização de cor;
- sanitização de espessura.

## 8. Estado derivado

O app calcula dinamicamente:

- contagem de palavras;
- lista filtrada da sidebar;
- data formatada longa e curta;
- HTML renderizado do preview;
- altura extra do `#notebook-tail`;
- disponibilidade visual do shell responsivo.

Esses valores não devem ser persistidos.

## 9. Regras para evolução do modelo

1. Adicionar campos a `Entry` exige atualização desta especificação e avaliação de compatibilidade com IndexedDB, fallback `localStorage` e exportação Markdown.
2. Alterar a estrutura de `Stroke` exige novo versionamento do protocolo de import/export.
3. Estados puramente visuais não devem ser promovidos a persistência sem necessidade clara de produto.
