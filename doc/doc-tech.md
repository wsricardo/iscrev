# iScrev Notes — Documentação Técnica

> **Produto:** iScrev Notes  
> **Classificação:** SPA (Single-Page Application) de diário digital pessoal  
> **Stack:** HTML5 · CSS3 · JavaScript ES5 · KaTeX · IndexedDB com fallback para localStorage  
> **Paradigma:** Local-first, zero build step, zero dependências de runtime (exceto CDNs)

---

## 1. Filosofia e Arquitetura

O iScrev Notes foi construído com uma filosofia de **computação acolhedora** e **privacidade em primeiro lugar (local-first)**. As decisões técnicas foram guiadas por restrições deliberadas para manter a simplicidade operacional e a independência de ferramentas externas.

-   **Zero Build Step:** O projeto não requer transpiladores, bundlers ou qualquer ferramenta de compilação. O código-fonte é o código de produção, facilitando a manutenção e a portabilidade.
-   **Vanilla JS (ES5):** O uso de JavaScript puro em sua especificação ES5 garante máxima compatibilidade com navegadores, incluindo WebViews mais antigas, sem a necessidade de polyfills complexos. O código é encapsulado em uma única **IIFE (Immediately Invoked Function Expression)** para evitar a poluição do escopo global.
-   **Local-First:** Todos os dados do usuário são armazenados no cliente, utilizando **IndexedDB** como camada primária e **localStorage** como fallback transparente. Não há necessidade de contas, login ou conexão com a nuvem.
-   **Fidelidade da Experiência:** A arquitetura prioriza a fidelidade da experiência do usuário sobre a pureza estrutural. Muitas decisões de implementação surgiram de problemas reais de interface, resultando em um produto guiado por iteração concreta.

---

## 2. Estrutura do Projeto

O repositório está organizado em diretórios com responsabilidades claras:

```text
/
|-- src/            -> Diretório principal de desenvolvimento.
|-- docs/           -> Espelho público de `src/`, usado para deploy (GitHub Pages).
|-- doc/            -> Documentação técnica e histórica.
|-- README.md       -> Documentação geral do projeto.
|-- EN.md           -> Versão em inglês do README.
`-- ...
```

### Estrutura de `src/`

```text
src/
|-- index.html, sobre.html, en.html, about.html -> Páginas institucionais.
|-- diario.html         -> A SPA (Single-Page Application) principal do diário.
|-- assets/
    |-- css/
    |   |-- style.css   -> CSS das páginas institucionais.
    |   `-- diario.css  -> CSS da aplicação do diário.
    `-- js/
        |-- diario.js   -> Núcleo funcional do diário (lógica principal).
        |-- pdf-exporter.js -> Módulo de exportação para PDF paginado.
        |-- site-nav.js -> Lógica de navegação do site institucional.
        `-- ui.js       -> Placeholder para futuros helpers de UI.
```

**Fluxo de Desenvolvimento:** O desenvolvimento é feito em `src/`. Para publicar, as alterações devem ser espelhadas manualmente para o diretório `docs/`.

---

## 3. Arquitetura da Aplicação Principal (`diario.html`)

### 3.1. HTML e CSS

O layout é construído com **Flexbox** e se baseia em uma cadeia de contêineres aninhados. O ponto mais crítico da arquitetura de layout é a solução para o **"Bug do Paralaxe"**:

-   `.editor-area` é o **único** elemento com `overflow-y: auto`. Ele não usa `display: flex`.
-   `.notebook-bg` é um filho direto do `.editor-area` e se comporta como um bloco puro que cresce com o conteúdo. Ele contém o `background-image` das linhas do caderno.
-   `#entry-raw` (o `textarea`) tem `overflow: hidden` e sua altura é ajustada dinamicamente via JavaScript (`autoResizeTextarea`) para corresponder ao seu `scrollHeight`.

Essa estrutura garante que o texto e as linhas do caderno estejam no mesmo contexto de rolagem, movendo-se em perfeita sincronia.

Os tokens de design (cores, fontes) são gerenciados por **CSS Custom Properties** em `:root`, permitindo a fácil customização do tema.

### 3.2. JavaScript (`diario.js`)

O arquivo `diario.js` é o cérebro da aplicação, contido em uma única IIFE para isolamento de escopo. Ele é organizado em seções numeradas, cada uma com uma responsabilidade clara.

#### Módulos Principais (Conceituais)

**1. Internacionalização (i18n - Seção 0):**
-   Utiliza um dicionário estático `I18N` com as traduções.
-   A função `t(key)` retorna a string traduzida com fallback para 'pt' e depois para a própria chave.
-   `applyLocale(lang)` atualiza o DOM percorrendo um mapa explícito de IDs (`TEXT_MAP`), o que é mais performático do que seletores de atributo globais.

**2. Renderização Markdown e LaTeX (Seção 1):**
-   O pipeline `mdToHtml(src)` funciona em dois passos para garantir a integridade do LaTeX:
    1.  **Tokenização:** Uma RegEx (`/\$\$...|\$.../g`) separa a string em tokens de texto, LaTeX inline e LaTeX em bloco.
    2.  **Conversão:** Os tokens de LaTeX são enviados para `katex.renderToString()`. Os tokens de texto são escapados (`escHtml`) e então convertidos por um parser Markdown simples.
-   **KaTeX** é carregado de forma **síncrona** no `<head>` para garantir que `window.katex` esteja sempre disponível quando `mdToHtml` for chamado.

**3. Módulo de Caneta (Pen - Seção 2):**
-   É o módulo mais complexo, implementado como uma IIFE que retorna uma API pública (`Pen.init`, `Pen.load`, etc.).
-   **Coordenadas:** Os traços são armazenados em coordenadas de documento (incluindo `scrollTop`), e a camada SVG (`<g id="pen-layer">`) é sincronizada com o scroll via `transform: translate(0, -scrollTop)`.
-   **Pipeline de um Traço:**
    1.  `pointerdown`: Inicia o array de pontos brutos (`rawPts`).
    2.  `pointermove`: Adiciona pontos e agenda a atualização do path SVG via `requestAnimationFrame` para garantir 60fps.
    3.  `pointerup`:
        -   Simplifica os pontos com o algoritmo **Douglas-Peucker** (`simplify(rawPts)`), reduzindo o tamanho dos dados em 60-80%.
        -   Salva o traço simplificado no array `strokes`.
        -   Notifica o app para persistência imediata via callback.
-   **Suavização:** A função `toPathD(pts)` usa curvas de **Bézier quadrática** (`Q`), utilizando o ponto médio entre dois pontos como âncora, para criar traços suaves e orgânicos.
-   **Borracha:** Utiliza um **hit-test geométrico** (`eraserHitTest`) que verifica a distância euclidiana dos pontos do ponteiro a todos os pontos de todos os traços, dentro de um raio de 20px. É mais robusto que o `pointer-events: stroke` do SVG.

**4. Módulo de Armazenamento (Storage - Seção 2.5):**
-   Abstrai a persistência com uma API baseada em Promises (`Storage.init`, `Storage.getAll`, `Storage.put`, `Storage.remove`).
-   **Backend Duplo:** Tenta inicializar o **IndexedDB**. Se falhar, utiliza o **localStorage** como fallback transparente. O resto da aplicação não precisa saber qual backend está ativo.
-   **Migração:** Na primeira execução, migra automaticamente os dados de um `localStorage` legado para o IndexedDB.

---

## 4. Modelo de Dados e Persistência

### Schema da Entrada (`Entry`)

```typescript
interface Entry {
  id:        string;    // Gerado por uid() - Timestamp + aleatório
  title:     string;    // Texto puro
  body:      string;    // Texto puro (Markdown + LaTeX)
  mood:      string;    // Emoji ou string vazia
  strokes:   Stroke[];  // Array de anotações manuscritas
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
}

interface Stroke {
  pts: [number, number][]; // Pontos [x,y] simplificados
  c:   string;             // Cor em hexadecimal
  w:   number;             // Espessura em pixels
}
```

**Invariante Crítica:** Os campos `title` e `body` **nunca** armazenam HTML. A conversão para HTML é feita em tempo de execução, apenas para exibição no modo Preview.

### Auto-Save

O salvamento automático é acionado por um `debounce` de 1800ms nos eventos de `input` do título e do corpo. No entanto, as alterações feitas com a caneta (módulo `Pen`) são salvas **imediatamente** após a conclusão de cada traço, através do callback `Pen._onStrokesChange`, para garantir que nenhum desenho seja perdido.

---

## 5. Fluxos de Exportação

### Exportação para Markdown (`.md`)

Gera um arquivo de texto com um front matter YAML, seguido pelo corpo da nota.

```yaml
---
titulo: Título da Entrada
data: 29/03/2026
humor: 😊
tracos: 15
pen_strokes: eyJ2IjoxLCJzIjpbXX0= # Base64(JSON.stringify({v:1, s:Stroke[]}))
---

# Título da Entrada

Corpo da nota em Markdown...
```

-   A chave `pen_strokes` é fixa (em inglês) para garantir a interoperabilidade na importação.
-   Os traços são serializados para JSON, convertidos para **Base64** e embutidos no front matter.

### Exportação para PDF

O projeto utiliza dois fluxos distintos para a exportação em PDF, escolhidos automaticamente:

1.  **Fluxo A (Sem Traços - `pdf-exporter.js`):**
    -   Para entradas que contêm apenas texto, o módulo `pdf-exporter.js` é utilizado.
    -   Ele realiza uma paginação lógica do conteúdo, medindo os blocos de texto em um DOM oculto e distribuindo-os em páginas (A4 ou Letter).
    -   A impressão é acionada através de um `iframe` invisível.

2.  **Fluxo B (Com Traços - Fallback `window.print()`):**
    -   Quando uma entrada contém anotações manuscritas, a prioridade é preservar a geometria exata dos traços em relação ao texto.
    -   Nesse caso, o app cria um "palco de impressão" (`#print-stage`) que replica visualmente a superfície do modo `Preview`/`Pen`.
    -   Um overlay SVG (`Pen.buildPrintOverlay`) é gerado com todas as anotações e posicionado sobre o texto.
    -   A função nativa `window.print()` é chamada, e o CSS (`@media print`) garante que apenas este "palco" seja impresso.

Essa abordagem mista é uma decisão pragmática que prioriza a fidelidade visual acima de uma solução única que poderia comprometer o alinhamento dos desenhos.

---

## 6. Manutenção e Desenvolvimento

### Adicionando um Novo Idioma

1.  **Dicionário:** Adicione um novo bloco de tradução (ex: `I18N.fr = { ... }`) em `diario.js`, traduzindo todas as chaves existentes.
2.  **HTML:** Adicione o botão correspondente no seletor de idiomas (`#lang-switcher`) em `diario.html`.
3.  **CSS:** Verifique se os novos textos não quebram o layout da toolbar. Se necessário, ajuste o `min-width` dos botões em `diario.css`.

### Modificando o Módulo `Pen`

-   **Cores e Espessuras:** Para adicionar novas opções, basta editar os arrays `COLORS` e `WIDTHS` no topo do módulo `Pen`. A toolbar será reconstruída automaticamente.
-   **Algoritmos:** As funções de suavização (`toPathD`) e simplificação (`simplify`) são autocontidas e podem ser otimizadas ou substituídas sem afetar o resto do módulo, desde que a assinatura seja mantida.

### Executando Localmente

Devido às políticas de segurança dos navegadores (CORS), os arquivos (`.js`, `.css`) não podem ser carregados via protocolo `file://`. É necessário servir a pasta `src/` (ou `docs/`) através de um servidor HTTP local.

```bash
# Com Python 3
python -m http.server

# Com Node.js (requer 'serve' instalado globalmente ou via npx)
npx serve
```

Acesse `http://localhost:8000/diario.html` (ou a porta indicada pelo servidor).

---

## 7. Possíveis Melhorias Futuras

-   **Modularização para ES6:** Refatorar o monolítico `diario.js` em módulos ES6 (`pen.js`, `storage.js`, etc.) para melhorar a manutenibilidade. Isso introduziria a necessidade de um servidor local para todos os desenvolvedores, mas o projeto já tem essa premissa.
-   **Service Worker (PWA):** Implementar um Service Worker para cachear os assets da aplicação (HTML, CSS, JS, fontes), permitindo o uso totalmente offline após a primeira visita e melhorando a performance.
-   **Âncora Semântica de Traços:** Atualmente, os traços são armazenados com coordenadas absolutas. Uma arquitetura mais robusta armazenaria a posição dos traços de forma relativa ao bloco de texto mais próximo, tornando-os resilientes a edições de texto e reflows.
-   **Compressão de Traços:** Antes de converter para Base64 na exportação, aplicar um algoritmo de compressão (como `CompressionStream API`) ao JSON dos traços para reduzir o tamanho do arquivo `.md`.
-   **Douglas-Peucker Iterativo:** A implementação atual do algoritmo de simplificação é recursiva. Convertê-la para uma versão iterativa (usando uma pilha explícita) eliminaria o risco teórico de *stack overflow* em traços extremamente complexos.