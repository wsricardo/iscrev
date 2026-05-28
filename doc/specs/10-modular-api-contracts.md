# CSpec 10 — Contratos de API dos Módulos

> **Produto:** iScrev Notes  
> **Escopo:** Definição das APIs públicas dos módulos refatorados  
> **Fonte:** `doc/SpecsModule.md`

---

## 1. Objetivo

Este documento define os contratos de API (Application Programming Interface) para os novos módulos do iScrev Notes, conforme a arquitetura proposta em `SpecsModule.md`.

O objetivo é estabelecer interfaces claras e estáveis entre as camadas do sistema, permitindo que os módulos sejam desenvolvidos, testados e mantidos de forma independente. Cada contrato especifica os métodos públicos, seus parâmetros, tipos de retorno e quaisquer eventos ou callbacks que o módulo utilize para se comunicar com o restante da aplicação.

---

## 2. Contrato do Módulo: `infra/storage.js`

O módulo `storage.js` abstrai a camada de persistência de dados, oferecendo uma API assíncrona baseada em Promises. Ele gerencia internamente o uso de IndexedDB com fallback para localStorage.

### 2.1 API Pública

O módulo deve exportar um objeto com as seguintes funções:

```javascript
/**
 * Inicializa a camada de persistência. Tenta abrir o IndexedDB e,
 * em caso de falha, prepara o fallback para localStorage.
 * Deve ser chamado uma única vez no bootstrap da aplicação.
 * @returns {Promise<void>} Uma promise que resolve quando o backend está pronto.
 */
function init();

/**
 * Retorna todas as entradas armazenadas.
 * @returns {Promise<Entry[]>} Uma promise que resolve com um array de objetos Entry.
 */
function getAll();

/**
 * Salva ou atualiza uma única entrada (upsert).
 * @param {Entry} entry - O objeto da entrada a ser persistido.
 * @returns {Promise<void>} Uma promise que resolve quando a operação termina.
 */
function put(entry);

/**
 * Remove uma entrada pelo seu ID.
 * @param {string} id - O ID da entrada a ser removida.
 * @returns {Promise<void>} Uma promise que resolve quando a operação termina.
 */
function remove(id);

/**
 * Retorna o nome do backend de armazenamento atualmente ativo.
 * @returns {'indexeddb' | 'localstorage'}
 */
function backend();
```

### 2.2 Eventos Despachados

O módulo `storage.js` deve despachar eventos customizados no objeto `document` para notificar a aplicação sobre erros de armazenamento que exigem a atenção do usuário.

- **`storage:quota-exceeded`**: Disparado quando uma operação de escrita falha porque o limite de armazenamento do navegador foi atingido.
- **`storage:error`**: Disparado para outros erros genéricos de escrita no banco de dados.

---

## 3. Contrato do Módulo: `editor/pen.js`

O módulo `pen.js` encapsula toda a lógica do motor da caneta, incluindo desenho, borracha, modo de rolagem (pan), e a geração de SVGs para exibição e impressão. Ele será refatorado para receber suas dependências via injeção, em vez de acessar o escopo global.

### 3.1 Instanciação e Dependências

O módulo deve ser instanciado através de uma classe ou factory function que recebe um objeto de configuração com suas dependências.

```javascript
const pen = new Pen({
  // Elementos DOM essenciais
  svgElement: document.getElementById('pen-svg'),
  layerElement: document.getElementById('pen-layer'),
  editorAreaElement: document.getElementById('editor-area'),

  // Callbacks para interagir com outros módulos
  onStrokesChange: (strokes) => { /* ... */ }, // Notifica sobre mudanças nos traços
  showToast: (message) => { /* ... */ },       // Exibe uma notificação (toast)
  t: (key) => { /* ... */ }                     // Função de internacionalização
});
```

### 3.2 API Pública

A instância do `Pen` deve expor os seguintes métodos:

```javascript
/** Ativa o modo caneta, permitindo desenho, borracha ou pan. */
function activate();

/** Desativa o modo caneta, tornando o overlay SVG passivo. */
function deactivate();

/** Torna a camada de traços visível. */
function showOverlay();

/** Oculta completamente a camada de traços. */
function hideOverlay();

/**
 * Carrega um array de traços em uma entrada, limpando os anteriores.
 * @param {Stroke[]} savedStrokes - O array de traços a ser renderizado.
 */
function load(savedStrokes);

/** Retorna uma cópia do array de traços atual. */
function getStrokes();

/** Desfaz o último traço adicionado. */
function undo();

/** Apaga todos os traços da entrada atual (deve pedir confirmação). */
function clear();

/** Define a cor ativa da caneta. */
function setColor(color);

/** Define a espessura ativa da caneta. */
function setWidth(width);

/** Ativa ou desativa o modo borracha. */
function setEraser(enabled);

/** Ativa ou desativa o modo de rolagem (pan). */
function setPan(enabled);

/** (Re)constrói a toolbar da caneta (cores, espessuras, ferramentas). */
function buildToolbar();
```