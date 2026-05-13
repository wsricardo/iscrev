Com base na análise aprofundada dos arquivos do projeto iScrev Notes, apresento uma documentação técnica completa que abrange sua estrutura, implementação, arquitetura e recomendações.

---

### **iScrev Notes: Documentação Técnica, Conceitual e Evolutiva**

> **Produto:** iScrev Notes  
> **Tipo:** Aplicação web *local-first* de diário digital e caderno de anotações  
> **Base tecnológica:** HTML5, CSS3, JavaScript ES5, KaTeX, IndexedDB, SVG  
> **Última revisão deste documento:** 13 de maio de 2026

---

### **1. Introdução: Funcionamento e Implementação**

O iScrev Notes é uma aplicação web de anotações e diário pessoal que se destaca por sua filosofia de "computação acolhedora" e arquitetura *local-first*. O projeto foi concebido para unir a simplicidade da escrita digital com a liberdade de um caderno físico, permitindo ao usuário combinar texto formatado com **Markdown**, equações matemáticas complexas com **LaTeX** e anotações manuscritas com uma **caneta SVG**.

A premissa fundamental é a privacidade e a autonomia do usuário: todos os dados são armazenados exclusivamente no navegador através do **IndexedDB**, sem necessidade de contas, login ou conexão com a nuvem. A implementação segue um paradigma de "zero complicação": não há frameworks modernos, etapa de compilação (*build step*) ou dependências externas, com exceção de fontes e da biblioteca KaTeX, carregadas via CDN. Isso garante portabilidade e simplicidade operacional, permitindo que a aplicação funcione imediatamente ao ser aberta no navegador.

O desenvolvimento é focado em baixa distração, utilizando uma identidade visual inspirada em papel, tinta e tipografia editorial para criar um ambiente de escrita imersivo e confortável.

---

### **2. Arquitetura do Projeto**

A arquitetura do iScrev Notes evoluiu de um protótipo de arquivo único para uma estrutura modular, priorizando a fidelidade da experiência do usuário sobre a pureza estrutural.

#### **2.1 Estrutura de Arquivos (`src/`)**

O desenvolvimento principal ocorre no diretório `src/`, que é espelhado para o diretório `docs/` para publicação (deploy).

```text
src/
|-- diario.html         -> A SPA (Single-Page Application) principal do diário.
|-- assets/
    |-- css/
    |   `-- diario.css  -> CSS da aplicação do diário.
    `-- js/
        |-- diario.js   -> Núcleo funcional do diário (lógica principal).
        |-- pdf-exporter.js -> Módulo de exportação para PDF paginado.
        `-- ... (outros arquivos de páginas institucionais)
```

*   **`diario.html`**: Contém a estrutura DOM da aplicação.
*   **`diario.css`**: Define toda a identidade visual, layout e responsividade, utilizando Variáveis CSS para o *theming*.
*   **`diario.js`**: O cérebro da aplicação, escrito em JavaScript (ES5) puro e encapsulado em uma IIFE (Immediately Invoked Function Expression) para isolar o escopo.

#### **2.2 Arquitetura de Layout (HTML/CSS)**

O layout é construído com **Flexbox** e se baseia em uma solução crítica para o "Bug do Paralaxe", que garante que o texto e as linhas do caderno rolem em perfeita sincronia.

*   **`.editor-area`**: É o **único** elemento com `overflow-y: auto`, funcionando como o contêiner de rolagem principal.
*   **`#entry-raw` (o `textarea`)**: Possui `overflow: hidden` e sua altura é ajustada dinamicamente via JavaScript para corresponder ao conteúdo, evitando uma barra de rolagem interna.
*   **`.notebook-bg`**: Um `div` que contém o fundo de papel pautado e cresce junto com o `textarea`, garantindo que texto e linhas estejam sempre sincronizados.

#### **2.3 Arquitetura JavaScript**

O código em `diario.js` é organizado em seções numeradas, cada uma com uma responsabilidade clara. A escolha pelo JavaScript ES5 puro e uma única IIFE garante máxima compatibilidade e evita a poluição do escopo global, uma prática importante para evitar conflitos com bibliotecas de terceiros como o KaTeX.

---

### **3. Funções, Estruturas de Dados e Recursos**

A seguir, uma documentação detalhada dos principais componentes lógicos encontrados em `assets/js/diario.js`.

#### **3.1 Estruturas de Dados Principais**

O modelo de dados é simples e robusto, com a invariante de que os campos de texto nunca armazenam HTML.

```javascript
// Localizado em: doc/doc-tech.md (Schema da Entrada)
interface Entry {
  id:        string;    // Gerado por uid() - Timestamp + aleatório
  title:     string;    // Texto puro
  body:      string;    // Texto puro (Markdown + LaTeX)
  mood:      string;    // Emoji ou string vazia
  strokes:   Stroke[];  // Array de anotações manuscritas
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
}

// Localizado em: doc/doc-tech.md (Schema da Entrada)
interface Stroke {
  pts: [number, number][]; // Pontos [x,y] simplificados
  c:   string;             // Cor em hexadecimal
  w:   number;             // Espessura em pixels
}
```

#### **3.2 Módulos e Funções Chave (em `diario.js`)**

##### **Seção 0: Internacionalização (i18n)**

*   **`I18N` (Objeto)**: Dicionário estático com as traduções para 'pt' e 'en'.
*   **`t(key)` (Função)**:
    *   **Entrada**: `key` (string) - A chave de tradução.
    *   **Saída**: A string traduzida, com fallback para 'pt' e, em último caso, para a própria chave.
    *   **Funcionamento**: Busca a tradução no idioma corrente; se não encontrar, tenta em português; se falhar, retorna a chave.
*   **`applyLocale(lang)` (Função)**:
    *   **Entrada**: `lang` (string) - O código do idioma ('pt' ou 'en').
    *   **Funcionamento**: Atualiza o DOM percorrendo um mapa explícito de IDs (`TEXT_MAP`), o que é mais performático do que seletores de atributo globais.

##### **Seção 1: Renderização Markdown e LaTeX**

*   **`mdToHtml(src)` (Função)**:
    *   **Entrada**: `src` (string) - O texto bruto da entrada.
    *   **Saída**: Uma string contendo o HTML renderizado.
    *   **Funcionamento**:
        1.  **Tokeniza**: Usa uma expressão regular para separar o texto em tokens de `texto`, `LaTeX inline` e `LaTeX em bloco`. Isso é crucial para não escapar caracteres especiais dentro do LaTeX.
        2.  **Converte**: Renderiza os tokens de LaTeX com `katex.renderToString()` e os de texto com um parser Markdown simples.

##### **Seção 2: Módulo de Caneta (Pen)**

Implementado como uma IIFE que retorna uma API pública (`Pen.init`, `Pen.load`, etc.).

*   **`Pen.init(svg, layer, editorArea)` (Função)**: Inicializa o módulo, configurando os listeners de eventos do ponteiro (`pointerdown`, `pointermove`, `pointerup`) e de rolagem.
*   **Coordenadas**: Os traços são armazenados em coordenadas de documento (incluindo `scrollTop`). A camada SVG (`<g id="pen-layer">`) é sincronizada com a rolagem através de uma transformação CSS (`transform: translate(0, -scrollTop)`).
*   **`toPathD(pts)` (Função)**:
    *   **Entrada**: `pts` (array de pontos `[x, y]`).
    *   **Saída**: Uma string para o atributo `d` de um `<path>` SVG.
    *   **Funcionamento**: Usa curvas de **Bézier quadrática**, utilizando o ponto médio entre dois pontos como âncora para criar traços suaves.
*   **`simplify(rawPts)` (Função)**:
    *   **Entrada**: `rawPts` (array de pontos brutos).
    *   **Saída**: Um array de pontos simplificado.
    *   **Funcionamento**: Implementa o algoritmo **Douglas-Peucker** para reduzir o número de pontos de um traço em 60-80%, otimizando o armazenamento.
*   **`eraserHitTest(docX, docY)` (Função)**:
    *   **Entrada**: Coordenadas `x` e `y` do ponteiro.
    *   **Saída**: O índice do traço a ser apagado ou -1.
    *   **Funcionamento**: Realiza um teste de acerto geométrico, verificando a distância euclidiana do ponteiro a todos os pontos de todos os traços, sendo mais robusto que o `pointer-events` do SVG.

##### **Seção 2.5: Módulo de Armazenamento (Storage)**

*   **`Storage.init()` (Função)**: Inicializa a camada de persistência. Tenta usar **IndexedDB** e, se falhar, recorre ao **localStorage** como fallback transparente.
*   **API baseada em Promises**: Funções como `Storage.getAll()`, `Storage.put(entry)` e `Storage.remove(id)` retornam Promises, permitindo operações assíncronas sem bloquear a interface.

##### **Outras Funções Notáveis**

*   **`autoResizeTextarea(el)` (Seção 12)**: Ajusta a altura do `textarea` para corresponder ao seu conteúdo (`scrollHeight`), eliminando a barra de rolagem interna.
*   **`debSave()` (Seção 13)**: Implementa um *debounce* de 1800ms para o salvamento automático, acionado durante a digitação para evitar operações de escrita excessivas.
*   **`exportMarkdown()` e `exportPDF()` (Seção 11)**: Gerenciam a exportação de notas. A exportação para Markdown embute os traços da caneta em Base64 dentro de um front matter YAML.

---

### **4. Manutenção, Refatoração e Riscos**

A análise do código e da documentação histórica revela pontos importantes para a manutenção e evolução do projeto.

#### **4.1 Manutenção**

*   **Adicionar um Novo Idioma**: Requer adicionar a tradução ao objeto `I18N` e o respectivo botão no HTML. É crucial verificar se os novos textos não quebram o layout da toolbar, ajustando o `min-width` dos botões se necessário.
*   **Modificar o Módulo `Pen`**: Novas cores e espessuras podem ser adicionadas simplesmente editando os arrays `COLORS` e `WIDTHS` no módulo. A toolbar é reconstruída automaticamente.
*   **Execução Local**: O projeto precisa ser servido via HTTP devido às políticas de CORS do navegador. Ferramentas como `python -m http.server` são recomendadas.

#### **4.2 Recomendações de Refatoração**

*   **Modularização para ES6**: O arquivo monolítico `diario.js` é o principal candidato à refatoração. Quebrá-lo em módulos ES6 (`pen.js`, `storage.js`, `i18n.js`) melhoraria drasticamente a manutenibilidade e a clareza do código.
*   **Douglas-Peucker Iterativo**: A implementação atual do algoritmo de simplificação de traços é recursiva. Convertê-la para uma versão iterativa (usando uma pilha) eliminaria o risco teórico de *stack overflow* em traços extremamente complexos.
*   **Centralizar Documentação**: A documentação técnica está distribuída em múltiplos arquivos (`doc/doc-tech.md`, `doc/DOCUMENTACAO_v.md`, etc.). Consolidá-las em uma única fonte de verdade facilitaria a consulta e manutenção.

#### **4.3 Pontos de Risco para Bugs**

*   **O Bug do Paralaxe**: A solução atual, que depende de uma estrutura de layout muito específica (`.editor-area` como único scroll container), é um ponto crítico. Qualquer alteração nessa estrutura pode reintroduzir o bug de desalinhamento entre o texto e o fundo pautado.
*   **Listeners Duplicados**: A função `rewire()` foi criada para evitar que múltiplos listeners de evento fossem adicionados aos mesmos botões (um bug que ocorreu na borracha). Qualquer novo componente dinâmico na UI deve adotar uma estratégia similar para evitar a duplicação de eventos.
*   **Gerenciamento de Estado**: O estado da aplicação (como `currentId` e o array `entries`) é gerenciado por variáveis globais dentro da IIFE. Em um projeto maior, isso poderia se tornar difícil de rastrear. A modularização para ES6 ajudaria a encapsular melhor o estado.

---

### **5. Conclusão e Melhorias Futuras**

O iScrev Notes é um exemplo notável de como é possível criar uma aplicação web rica, funcional e com uma forte identidade filosófica utilizando tecnologias web puras e padrões abertos. Sua arquitetura *local-first* e o design focado na "computação acolhedora" o diferenciam de outras ferramentas de anotação, oferecendo um espaço privado e imersivo para o pensamento. A combinação de texto, LaTeX e desenho manual em uma única superfície atende de forma elegante à natureza não-linear do processo criativo e de estudo.

A decisão de evitar frameworks e etapas de compilação, embora resulte em um código mais verboso (ES5), confere ao projeto uma simplicidade operacional e uma portabilidade admiráveis. A documentação histórica detalhada, especialmente sobre a resolução de bugs complexos como o "paralaxe", demonstra a maturidade adquirida ao longo do desenvolvimento iterativo. O projeto já superou a fase de protótipo e se apresenta como um produto coeso e funcional.

Para o futuro, a versatilidade do aplicativo pode ser ampliada com recursos que respeitem sua filosofia. A **modularização do código JavaScript para ES6** é o passo técnico mais importante para garantir a manutenibilidade a longo prazo. A implementação de um **Service Worker** mais robusto transformaria o iScrev Notes em um Progressive Web App (PWA) completo, com uma experiência offline ainda mais confiável.

Funcionalmente, a introdução de **âncoras semânticas para os traços** (vinculando-os a parágrafos específicos em vez de coordenadas absolutas) os tornaria resilientes a edições de texto. Outras melhorias poderiam incluir um sistema de **tags ou cadernos** para organização, a **compressão de dados de traços** para otimizar a exportação e, talvez, a exploração de **sincronização opcional e criptografada** entre dispositivos, sempre mantendo o controle nas mãos do usuário. Essas evoluções consolidariam o iScrev Notes como uma ferramenta de pensamento ainda mais poderosa, sem sacrificar a simplicidade e a privacidade que formam sua alma.