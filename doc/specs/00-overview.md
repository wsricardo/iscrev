# CSpec 00 — Visão Geral da Implementação

## 1. Escopo

Esta especificação descreve a implementação atual da aplicação principal do iScrev Notes, centrada em:

- `src/diario.html`
- `src/assets/js/diario.js`
- `src/assets/js/pdf-exporter.js`
- `src/assets/css/diario.css`
- `src/service-worker.js`

Não cobre em profundidade as páginas institucionais (`index.html`, `sobre.html`, `en.html`, `about.html`), exceto quando elas influenciam o shell do diário ou a navegação.

## 2. Caracterização do sistema

O iScrev Notes é uma SPA local-first de diário e anotações pessoais com:

- edição em texto puro;
- formatação Markdown leve;
- renderização LaTeX via KaTeX;
- anotações manuscritas em SVG;
- persistência local via IndexedDB com fallback para `localStorage`;
- exportação em Markdown e impressão/PDF;
- shell responsivo com sidebar;
- internacionalização PT/EN sem recarregar a página.

## 3. Princípios arquiteturais vigentes

### 3.1 Local-first

A fonte primária de verdade dos dados do usuário é o navegador local. Não existe backend de aplicação nem sincronização remota no runtime atual.

### 3.2 HTML/CSS/JS diretos

O núcleo do diário opera sem framework de UI, sem bundler e sem importações internas entre módulos. O carregamento usa `type="module"` em `diario.html`, mas os scripts se comportam como módulos autônomos ou IIFEs.

### 3.3 Superfície canônica renderizada

O comportamento atual do app não usa mais o `textarea` como superfície visual comum entre todos os modos. A referência visual compartilhada de `pen` e `preview` é o HTML renderizado por `mdToHtml()`.

### 3.4 Fallback progressivo

O sistema favorece a funcionalidade com degradação elegante:

- IndexedDB cai para `localStorage`;
- importação tolera front matter ausente ou `pen_strokes` corrompido;
- KaTeX inválido não quebra o preview inteiro;
- PDF usa mais de uma estratégia de impressão conforme a situação.

## 4. Topologia de runtime

```text
diario.html
├── assets/css/diario.css
├── KaTeX CSS + JS (CDN)
├── pdf-exporter.js
├── diario.js
├── ui.js
└── service-worker.js (registrado em runtime)
```

### 4.1 Papel dos arquivos

- `diario.html`
  Define shell, overlays, toolbars, IDs consultados pelo JS e ordem de carregamento.
- `diario.js`
  Contém i18n, renderização, caneta, persistência, CRUD, import/export, shell responsivo, fullscreen, atalhos e bootstrap.
- `pdf-exporter.js`
  Expõe `window.PdfExporter` para paginação e impressão em iframe.
- `diario.css`
  Define os tokens visuais, o layout do shell, o papel pautado, o overlay SVG e as regras de impressão.
- `ui.js`
  Atualmente é placeholder; não controla a aplicação principal.
- `service-worker.js`
  Faz cache de assets e aplica estratégia `stale-while-revalidate` simples.

## 5. Invariantes globais

1. `entries` é a fonte de verdade em memória para a lista de entradas.
2. `currentId` é `null` ou corresponde a uma entrada presente em `entries`.
3. `.editor-area` é o único contêiner de scroll do editor.
4. `#pen-svg` é um overlay absoluto; os traços são ancorados em coordenadas de documento, não em viewport.
5. `pen` e `preview` compartilham a mesma superfície renderizada.
6. Exportação Markdown deve continuar legível por humanos e reimportável pela aplicação.
7. A chave `pen_strokes` deve permanecer estável até haver versionamento explícito do protocolo.
8. A troca de idioma não deve exigir reload.

## 6. Diferenças relevantes em relação à documentação histórica

Estas diferenças são importantes para evitar que `gspecs` antigas orientem mudanças incorretas:

### 6.1 Modo `pen`

O comportamento atual usa preview renderizado como superfície visual do modo `pen`. O `textarea` é ocultado em `setMode('pen')`.

### 6.2 Estratégia de PDF

O comportamento atual tenta primeiro `runStagePrintJob()` mesmo para entradas sem traços. O uso de `PdfExporter.exportEntry()` é um fallback, não o primeiro caminho nominal do fluxo.

### 6.3 Service worker

Existe service worker funcional no repositório atual, com cache de assets locais e URLs externas do KaTeX e Google Fonts.

## 7. Limites desta implementação

- `diario.js` concentra muitas responsabilidades em um único arquivo.
- Não há suíte automatizada de testes.
- A especificação do protocolo Markdown ainda depende de regex tolerante, não de parser formal.
- A renderização Markdown é propositalmente parcial, não compatível com CommonMark completo.

## 8. Diretriz para evolução

Mudanças futuras podem modularizar internamente o código, desde que preservem:

- os contratos de DOM descritos em `01-runtime-and-dom-contract.md`;
- os formatos de dados em `02` e `07`;
- os eventos e invariantes de persistência em `03`;
- a geometria do sistema de caneta em `05`.
