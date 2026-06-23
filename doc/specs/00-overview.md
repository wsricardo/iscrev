# CSpec 00 — Visão Geral da Implementação (Atualizada)

## 1. Escopo

Esta especificação descreve a implementação atual do ecossistema **iScrev**, centrada nas seguintes aplicações principais:

- **iScrev Notes:** (`src/diario.html` e `src/assets/js/diario/`) - SPA de diário e anotações.
- **iScrev XBoard:** (`src/xboard/index.html` e `src/xboard/js/`) - Lousa digital baseada em Canvas.
- **Páginas Institucionais e Blog:** (`index.html`, `pt.html`, e Pelican em `pelican/`) - Landing pages e blog gerados estaticamente.

## 2. Caracterização do sistema

O ecossistema iScrev é focado em ferramentas *Local-first*, englobando:

- **iScrev Notes:** Edição em texto puro, formatação Markdown leve (com proteção XSS), renderização LaTeX via KaTeX, anotações manuscritas em SVG, persistência via IndexedDB e exportação PDF/Markdown.
- **iScrev XBoard:** Renderização baseada em `<canvas>` com controle de histórico, gerenciamento de mídias (PDF, vídeo, gravação local), biblioteca de aulas e múltiplos fundos (linhas, grades).
- **Service Workers:** Estratégias PWA resilientes (Stale-While-Revalidate com `.catch()` seguro) para acesso offline ininterrupto de ambas as aplicações.

## 3. Princípios arquiteturais vigentes

### 3.1 Local-first e Privacidade
A fonte primária de verdade é o navegador local. Não existe backend de aplicação, bancos de dados em nuvem ou necessidade de conta. Todo processamento ocorre no lado do cliente.

### 3.2 Modularização e Clean Code
Ambas as aplicações (*Notes* e *XBoard*) abandonaram os "monólitos de código". O *iScrev Notes* possui um entrypoint `diario.js` que apenas orquestra importações de `src/assets/js/diario/` (dividido em `app`, `editor`, `infra`, `shared`, `ui`). O *XBoard* segue a mesma padronização em `src/xboard/js/modules/`.

### 3.3 Superfície canônica renderizada (Notes)
O `textarea` não é mais a superfície de visualização predominante. A referência visual compartilhada de `pen` e `preview` é o HTML renderizado.

### 3.4 Fallback progressivo e Segurança
O sistema favorece a funcionalidade com degradação elegante e segurança por design:
- IndexedDB cai para `localStorage`.
- Parsing Markdown neutraliza XSS (protocolos `javascript:`, `data:`).
- Redes offlines falham graciosamente via SW em vez de quebrar a Promise.

## 4. Topologia de runtime

```text
src/
├── index.html / pt.html (Institucional)
├── diario.html (iScrev Notes)
│   ├── assets/js/diario.js (Orquestrador ES Modules)
│   ├── assets/js/diario/ (Módulos: app, editor, infra, shared, ui)
│   └── service-worker.js
└── xboard/ (iScrev XBoard)
    ├── index.html
    ├── sw.js (PWA próprio do XBoard)
    └── js/ (Módulos Core e Services)
```

## 5. Invariantes globais

1. O modelo de dados do *Notes* continua centrado em `entries` e persistência local.
2. A geometria de desenho livre do *Notes* usa SVG, enquanto o *XBoard* usa Raster (Canvas 2D).
3. Exportação Markdown deve continuar imune a scripts maliciosos.
4. Automação de infraestrutura (Build e Sync) baseia-se unicamente em caminhos relativos em Python (`os.path.dirname(__file__)`), garantindo portabilidade cross-platform e CI/CD.

## 6. Diferenças relevantes em relação à documentação histórica

Estas diferenças são vitais para compreender o código hoje:

### 6.1 Refatoração Modular
O arquivo `diario.js` **não concentra** mais todas as responsabilidades. Ele atua apenas como um agregador global (`window.*`) para dependências menores e testáveis.

### 6.2 Service Workers com Tratamento PWA
Tanto `diario.html` quanto `xboard/index.html` possuem Service Workers com tratamentos completos contra quebras de rede (Network Falls).

### 6.3 Pelican Integrado
O blog do projeto é parte intrínseca do build e gera dinamicamente os endpoints JSON (`latest.json`) consumidos assincronamente pelas Landing Pages.

## 7. Diretriz para evolução

Mudanças futuras devem preservar:
- A separação entre *Notes* e *XBoard*, mantendo as responsabilidades de UX distintas (uma orientada a documentos, a outra orientada a aulas/whiteboard).
- A portabilidade dos scripts de build (sem caminhos de máquina locais rígidos).
- Os padrões rigorosos de ausência de backend, mantendo a confiança na filosofia *Local-first*.
