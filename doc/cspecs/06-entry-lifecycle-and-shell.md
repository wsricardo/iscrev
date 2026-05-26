# CSpec 06 — Ciclo de Vida das Entradas e Shell da UI

## 1. Objetivo

Descrever os fluxos centrais de uso da SPA: bootstrap, abertura de entrada, CRUD, sidebar, responsividade, atalhos e utilidades de shell.

## 2. Bootstrap real

O bootstrap nominal é:

1. `Storage.init()`
2. `migrateFromLocalStorage()`
3. `loadData()`
4. `loadData()` novamente
5. `Pen.init(...)`
6. `applyLocale(currentLang)`
7. se houver entradas, abrir a mais recente

### 2.1 Observação

A segunda chamada de `loadData()` é redundante. Ela deve ser tratada como detalhe acidental atual, não como requisito de produto.

## 3. Abertura de entrada

`openEntry(id)` deve:

1. definir `currentId`;
2. localizar a entrada em `entries`;
3. esconder o estado de boas-vindas;
4. mostrar `#editor-container`;
5. preencher data, título, corpo e humor;
6. resetar `#notebook-tail`;
7. carregar traços com `Pen.load()`;
8. atualizar estatísticas;
9. entrar em `edit`;
10. redimensionar `textarea`;
11. re-renderizar a lista;
12. fechar a sidebar no mobile.

## 4. Criação de entrada

`newEntry()` deve:

- gerar novo `id`;
- criar timestamps `createdAt` e `updatedAt`;
- iniciar `title`, `body`, `mood` e `strokes` vazios;
- inserir a entrada no início de `entries`;
- persistir imediatamente;
- abrir a nova entrada;
- exibir toast.

## 5. Salvamento

### 5.1 `saveEntry()`

`saveEntry()` lê o estado do DOM e atualiza a entrada atual:

- `title`
- `body`
- `mood`
- `strokes`
- `updatedAt`

Em seguida:

- persiste com `saveEntry_store(e)`;
- re-renderiza a lista filtrada da sidebar.

### 5.2 Autosave

`debSave()` usa debounce de `1800ms`.

Acionadores:

- `input` em `#entry-raw`
- `input` em `#entry-title`
- `change` em `#mood-select`

### 5.3 Persistência de traços

Traços não usam debounce textual. Eles são persistidos por `Pen._onStrokesChange`.

## 6. Exclusão

`deleteEntry()` deve:

1. exigir confirmação;
2. remover do backend;
3. remover de `entries`;
4. limpar `currentId`;
5. limpar traços carregados;
6. resetar notebook tail;
7. esconder o editor;
8. mostrar a tela de boas-vindas;
9. re-renderizar a lista;
10. abrir sidebar;
11. exibir toast.

## 7. Lista e busca

### 7.1 Ordenação

A lista é sempre ordenada por `updatedAt` descendente.

### 7.2 Filtro

O filtro aplica `toLowerCase()` e pesquisa em:

- `title`
- `body`

### 7.3 Estado vazio

Quando não houver resultados:

- com query: usa `t('list.none')`;
- sem query: usa `t('list.empty')`.

## 8. Shell responsivo

### 8.1 Breakpoint lógico

`mobileShellMq = window.matchMedia('(max-width: 900px)')`

### 8.2 Estado desktop

- usa `body.sidebar-collapsed` para recolher;
- não usa drawer.

### 8.3 Estado mobile

- usa `body.sidebar-open` como drawer;
- `#sidebar-scrim` fecha o painel;
- ao abrir uma entrada, a sidebar fecha.

### 8.4 Requisito

O controle da sidebar deve continuar baseado em classes no `body`, não em `style.display` inline.

## 9. Notebook tail

O crescimento do “papel” no fim do documento é controlado por:

- `resetNotebookTail()`
- `syncNotebookTail()`
- `maybeGrowNotebookTail()`

### 9.1 Função

Garantir espaço visual quando traços ou navegação em modo caneta avançam para além do conteúdo textual renderizado.

## 10. Fullscreen

`toggleFullscreen()` cobre:

- `requestFullscreen`
- `webkitRequestFullscreen`
- `mozRequestFullScreen`
- `msRequestFullscreen`

`updateFsIcon()` sincroniza ícone, `title`, `aria-label` e `data-label`.

## 11. Atalhos de teclado

- `Ctrl+S` / `Cmd+S`: salvar
- `Ctrl+Z` / `Cmd+Z`: desfazer traço no modo caneta
- `F`: alternar fullscreen quando foco não está em campo de texto
- `Escape`: fechar sidebar mobile ou modal de equação

## 12. Modal de apoio

O modal de apoio e PIX é parte do shell atual. Seu contrato inclui:

- abrir sem sair da entrada;
- fechar por botão, clique no overlay ou `Escape`;
- copiar chave PIX via `navigator.clipboard` quando disponível;
- fornecer mensagem manual quando clipboard não estiver disponível.

## 13. Regras de mudança

1. Mudanças em bootstrap devem manter a ordem lógica `storage -> dados -> pen -> locale -> abertura inicial`.
2. Mudanças em responsividade devem preservar a acessibilidade e a previsibilidade do drawer.
3. Mudanças em atalhos devem evitar conflitos com edição de texto.
