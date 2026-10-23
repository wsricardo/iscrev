# Relatório: Estado Atual e Documentação de Referência do iScrev Notes

> **Data:** Agosto de 2026
> **Objetivo:** Servir como referência arquitetural, estrutural e de funções para a refatoração e construção da nova versão do iScrev Notes (incluindo o ecossistema XBoard).

---

## 1. Visão Geral e Estado Atual

O **iScrev Notes** consolidou-se como uma SPA (Single-Page Application) focada em ser um diário digital *local-first*, que funciona como um caderno pessoal com "presença humana". 

**Características da Stack Atual:**
- **Paradigma atual:** Zero build step, zero backend, ES5 encapsulado em IIFE. (Nota: O código em `xboard` já começa a usar classes ES6, o que aponta o caminho da refatoração).
- **Core:** Híbrido entre editor de texto puro (Markdown), renderização matemática síncrona (KaTeX) e desenho vetorial livre (SVG + Pointer Events).
- **Persistência:** `IndexedDB` com fallback transparente para `localStorage`.
- **Organização do Projeto:** Há uma clara separação entre a camada Institucional (páginas estáticas com CSS/JS próprios) e o SPA principal do Diário (`diario.js`, `diario.css`, `pdf-exporter.js`).
- **Necessidade de Refatoração:** Atualmente o `diario.js` concentra muitas responsabilidades (UI, State, Markdown, SVG Pen, Storage). A nova versão deve adotar módulos isolados (ES6 Modules) - semelhante ao modelo adotado no `xboard` com `core/`, `modules/` e `services/`.

---

## 2. Estrutura de Dados e Tipos de Objetos

O modelo de dados atual reflete o armazenamento das notas. É crucial manter as invariantes (ex: o corpo e o título **nunca** armazenam HTML, apenas o texto bruto) para evitar XSS e garantir interoperabilidade no `.md`.

### Objeto: `Entry`
Representa uma entrada/nota no diário.
- `id` *(string)*: Gerado via `base36(Date.now())` com sufixo aleatório.
- `title` *(string)*: Texto bruto.
- `body` *(string)*: Markdown + LaTeX bruto.
- `mood` *(string)*: Emoji Unicode ou string vazia.
- `strokes` *(Array de `Stroke`)*: Anotações da caneta.
- `createdAt` *(string)*: Data de criação em formato ISO 8601.
- `updatedAt` *(string)*: Última modificação em ISO 8601.

### Objeto: `Stroke`
Representa um traço contínuo do desenho manual.
- `pts` *(Array de Array)*: Lista de coordenadas em pares `[x, y]` absolutos relativas ao documento.
- `c` *(string)*: Cor em hexadecimal (whitelist restrita).
- `w` *(number)*: Espessura da linha em px (clamped entre `0.5` e `8`).

### Exportação Markdown (`.md`)
Os dados são exportados usando **YAML Front Matter**:
- Chaves localizadas (ex: `titulo`, `data`, `humor`).
- **`pen_strokes`**: Chave fixa contendo o array de `strokes` envelopado num objeto `{v:1, s:strokes}` convertido para **Base64** (`btoa`).

---

## 3. Módulos, Classes e Principais Funções (API Interna)

A arquitetura lógica atual baseia-se em módulos definidos por funções construtoras ou IIFEs que retornam objetos públicos. Na refatoração para ES6, estes blocos devem se tornar `Classes` ou `ES Modules`.

### 3.1. Módulo `Storage` (Persistência)
Abstrai a comunicação com o banco local usando Promises.
- `Storage.init()`: Decide entre IndexedDB e `localStorage` e prepara o db.
- `Storage.getAll()`: Retorna um *Promise* com a lista completa de objetos `Entry`.
- `Storage.put(entry)`: Insere ou atualiza um `Entry` usando a chave `id`.
- `Storage.remove(id)`: Remove a entrada do banco de dados.
- `Storage.backend()`: Retorna uma string identificando o motor de gravação atual.

*(Referência para nova versão: A classe `StorageService` do `xboard` expande essa lógica introduzindo os conceitos de "Session" e "Lessons").*

### 3.2. Módulo `Pen` (Desenho SVG)
Gerencia as interações do Pointer, renderização com Bezier Quadrática e hit-testing da borracha geométrica.
- **Listeners principais:** `onPointerDown`, `onPointerMove`, `onPointerUp`. Usa `setPointerCapture` para garantir traços rápidos.
- `toPathD(pts)`: Converte uma array de pontos numa path SVG usando o *ponto médio* como âncora para uma Curva Bezier Quadrática (`Q`), garantindo extrema suavidade.
- `rdp(pts, ε, inicio, fim)`: Implementação do algoritmo **Douglas-Peucker** (atualmente recursivo, sugerido migrar para iterativo). Simplifica o traçado removendo pontos colineares.
- `eraserHitTest(docX, docY)`: Borracha geométrica que itera os traços de trás para frente, usando distância euclidiana com um raio fixo (`HIT_RADIUS = 20px`), superando as limitações do DOM `pointer-events: stroke`.
- `rewire(id, handler)`: Função utilitária que usa `cloneNode` para limpar de forma robusta *listeners* duplicados nos botões de toolbar.

### 3.3. Pipeline de Markdown e LaTeX
A conversão do texto para HTML é dividida em tokens para preservar as tags matemáticas.
- `mdToHtml(src)`: Função principal que coordena a transformação. Usa Regex (`/\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g`) para isolar equações KaTeX de texto Markdown normal.
- `renderTex()`: Envia os tokens de equação isolados para a renderização do KaTeX síncrono.
- `convertMarkdown()`: Pega os tokens normais de texto, escapa caracteres em HTML (evitando XSS) e os processa com marcações leves (negrito, itálico, listas, blockquotes).

### 3.4. Ciclo de Vida da Entrada (CRUD e Auto-save)
- `openEntry(id)` / `newEntry()`: Gerenciam o estado de view da aplicação.
- `saveEntry()` / `saveEntry_store(entry)`: Consolida o estado da UI para o modelo `Entry` e envia para `Storage.put()`.
- `debSave()`: Função envelopada por um **Debounce de 1.8 segundos** (1800ms) executada ao editar texto, prevenindo excesso de IO. (Nota: Desenhos salvam quase instantaneamente, sem debounce rigoroso, pois os traços já são eventos discretos).

### 3.5. Funções de Experiência e UI
- `autoResizeTextarea(el)`: Recalcula a altura de forma dinâmica (`height = 'auto'`, seguido de `scrollHeight`) impedindo cortes de texto na tela.
- `syncScroll()` e *Wheel Forwarding*: Trata eventos de rodinha do mouse (`wheel`) em cima do Textarea para rolar globalmente o `.editor-area`, já que no layout a rolagem global pertence a outro container visando previnir o *bug de paralaxe nas pautas do caderno*.
- `applyLocale(lang)`: Módulo i18n sem recarregar a página, iterando sob um mapa predefinido (`TEXT_MAP`) em vez de iterar o DOM inteiro.

---

## 4. Diretrizes Arquiteturais para a Nova Versão

Ao refatorar a aplicação para utilizar módulos ES6 e/ou novos ecossistemas (como o que se percebe na arquitetura do **xboard** - CanvasEngine, HistoryManager), os seguintes pilares conceituais do iScrev devem ser mantidos:
1. **Ponto Único de Rolagem:** O `overflow-y` deve continuar concentrado numa única área (ex: `.editor-area`) para que a caneta em SVG/Canvas posicione suas coordenadas baseada no `scrollTop` de maneira previsível, evitando traços soltos pelo layout.
2. **Textarea com Pauta Local:** A pauta de fundo (linhas de caderno CSS) deve continuar fixada à própria área editável (`background-attachment: local`), para casar perfeitamente o texto com as linhas horizontais, independente de cabeçalhos anteriores.
3. **Migração do SVG para Canvas (Opcional):** A nova arquitetura XBoard utiliza HTML5 `<canvas>` via `CanvasEngine`. Se essa rota for seguida, o sistema de coordenadas e histórico (`strokes`) deverá ser compatibilizado com a estrutura de persistência existente, e precisaremos de uma rotina para re-desenhar o quadro durante as exportações (`redrawHistory`).
4. **Ancoragem Semântica (Evolução Prevista):** Evoluir o formato do ponto `x,y` do traçado (Stroke) para utilizar referências de posição baseadas em blocos de parágrafos/conteúdo (percentual) ou invés de píxels absolutos, impedindo que a formatação (ex: renderização mobile vs web) dessincronize o traçado da palavra de fundo.
