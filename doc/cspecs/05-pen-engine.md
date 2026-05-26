# CSpec 05 — Motor de Caneta

## 1. Objetivo

Especificar o módulo `Pen`, sua geometria, ciclo de desenho e integrações com persistência, shell e impressão.

## 2. Arquitetura

`Pen` é uma IIFE com API pública e estado privado.

Responsabilidades:

- capturar `PointerEvents`;
- converter gesto em traços persistíveis;
- renderizar SVG no overlay;
- apagar, desfazer e limpar traços;
- sincronizar camada com scroll;
- construir toolbar dinâmica;
- fornecer SVGs auxiliares para impressão.

## 3. Estado interno relevante

- `svgEl`, `layerEl`, `editorAreaEl`
- `penColor`
- `penWidth`
- `eraserMode`
- `panMode`
- `panning`
- `drawing`
- `rawPts`
- `activePath`
- `rafId`
- `strokes`

## 4. Constantes de segurança

- `MAX_STROKES = 500`
- `MAX_PTS_RAW = 2000`
- `DP_EPSILON = 1.5`
- `HIT_RADIUS = 20`

Estas constantes fazem parte do contrato operacional e não devem ser removidas sem nova estratégia explícita de proteção.

## 5. Contrato geométrico

### 5.1 Sistema de coordenadas

Os pontos são armazenados em espaço de documento:

```js
x = clientX - rect.left
y = clientY - rect.top + editorAreaEl.scrollTop
```

### 5.2 Alinhamento visual

Como o SVG está absoluto sobre a viewport visível do editor, o grupo `#pen-layer` recebe:

```js
transform="translate(0, -scrollTop)"
```

### 5.3 Invariante

O alinhamento dos traços depende do par:

- coordenadas absolutas em documento;
- compensação de `scrollTop` no `transform` da layer.

Não é permitido alterar apenas um dos lados dessa relação.

## 6. Sanitização

### 6.1 Cor

Só são aceitas cores presentes em `COLORS`.

### 6.2 Espessura

`sanitizeWidth()` limita o valor ao intervalo `[0.5, 8]`.

### 6.3 Pontos

`sanitizePt()` converte coordenadas para inteiros finitos.

### 6.4 Carga de entrada

`sanitizeStrokes()`:

- exige `Array`;
- limita quantidade de traços;
- descarta traços malformados;
- limita quantidade de pontos por traço.

## 7. Pipeline de desenho

### 7.1 `pointerdown`

Se `panMode`:

- inicia arraste de scroll;
- captura o ponteiro.

Se `eraserMode`:

- apaga no `pointerdown`;
- captura o ponteiro para permitir apagar arrastando.

Caso contrário:

- inicia novo traço;
- cria `<path>` temporário;
- captura o ponteiro.

### 7.2 `pointermove`

- em pan: ajusta `editorAreaEl.scrollTop`;
- em borracha: apaga traços sob o percurso;
- em desenho: adiciona pontos, filtra micro-movimentos e agenda `requestAnimationFrame`.

### 7.3 `pointerup`

- cancela RAF pendente;
- descarta clique sem movimento;
- simplifica com Douglas-Peucker;
- persiste traço se ainda houver margem dentro de `MAX_STROKES`;
- notifica o app via `Pen._onStrokesChange`.

## 8. Suavização e simplificação

### 8.1 Suavização

`toPathD(pts)` usa curvas de Bézier quadrática para suavidade visual.

### 8.2 Simplificação

`simplify(pts, DP_EPSILON)` usa Douglas-Peucker recursivo.

### 8.3 Requisito

Refactors podem substituir a implementação por versão iterativa, mas a persistência deve continuar armazenando pontos simplificados, não a série bruta completa.

## 9. Borracha

O comportamento efetivo da borracha é geométrico, não baseado em hit-test visual do DOM.

Fluxo:

1. `eraserHitTest(docX, docY)` percorre os traços do fim para o início;
2. compara distância quadrática até os pontos;
3. retorna o primeiro traço dentro de `HIT_RADIUS`;
4. `eraseAt()` remove esse traço e re-renderiza.

## 10. Modo mão

`panMode` transforma o overlay em superfície de arraste de scroll.

Requisitos:

- ao ativar `panMode`, `eraserMode` deve ser desligado;
- ao ativar `eraserMode`, `panMode` deve ser desligado;
- o CSS de cursor deve refletir o modo ativo.

## 11. API pública

- `init(svgEl, layerEl, editorAreaEl)`
- `activate()`
- `deactivate()`
- `showOverlay()`
- `hideOverlay()`
- `load(savedStrokes)`
- `getStrokes()`
- `undo()`
- `clear()`
- `setColor(color)`
- `setWidth(width)`
- `setEraser(on)`
- `setPan(on)`
- `buildPrintOverlay(surfaceWidth, surfaceHeight)`
- `buildPrintSvg()`
- `buildToolbar()`

## 12. Toolbar dinâmica

`buildToolbar()` monta:

- botões de cor;
- botões de espessura;
- listeners de mão, borracha, desfazer e limpar.

O helper `rewire()` usa `cloneNode(true)` + `replaceChild()` para remover listeners antigos antes de religar botões. Isso é parte importante do contrato atual para evitar empilhamento de listeners após `applyLocale()`.

## 13. Integração com persistência

`Pen` não grava no storage diretamente. O módulo apenas chama:

```js
Pen._onStrokesChange(strokes)
```

O app é responsável por:

- atualizar `entry.strokes`;
- renovar `updatedAt`;
- persistir a entrada.

## 14. Integração com impressão

### 14.1 `buildPrintOverlay`

Cria um SVG absoluto alinhado à superfície renderizada inteira para o stage de impressão.

### 14.2 `buildPrintSvg`

Cria um SVG standalone com `viewBox` próprio, útil para exportação que não dependa do overlay original.

## 15. Critérios de aceitação

1. Traços continuam ancorados ao conteúdo durante scroll.
2. Borracha continua removendo traços com tolerância confortável.
3. `undo()` remove o último traço sem re-renderização completa obrigatória.
4. `Pen.load()` continua sendo o ponto de sanitização de traços externos.
