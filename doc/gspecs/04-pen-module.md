# Especificação Técnica — 04. Módulo de Caneta (Pen)

Este documento especifica o funcionamento do módulo `Pen`, responsável por toda a funcionalidade de desenho manuscrito.

---

## 1. Arquitetura

O módulo `Pen` é implementado como uma IIFE (Immediately Invoked Function Expression) que retorna um objeto público (padrão "módulo revelador"). Todo o estado interno (traços, cor/espessura ativa, estado do desenho) é privado e encapsulado.

A comunicação com o resto da aplicação é feita através de um callback injetável, `_onStrokesChange`.

## 2. Sistema de Coordenadas

Os traços são armazenados em **coordenadas de documento**, não de viewport.

-   A coordenada `y` de um ponto é calculada como `e.clientY - svgRect.top + editorArea.scrollTop`.
-   Isso ancora os desenhos ao conteúdo do texto, não à janela do navegador.
-   Para que os traços apareçam na posição correta, o elemento `<g id="pen-layer">` dentro do SVG recebe uma transformação `transform="translate(0, -scrollTop)"` que é atualizada a cada evento de `scroll` do contêiner `.editor-area`.

## 3. Pipeline de um Traço

O ciclo de vida de um único traço, desde o clique até a persistência, segue este pipeline:

1.  **`pointerdown`**:
    -   O gesto de desenho é iniciado.
    -   Um array `rawPts` é criado para armazenar os pontos brutos do traço.
    -   Um elemento `<path>` temporário é criado e adicionado ao DOM para fornecer feedback visual imediato.

2.  **`pointermove`**:
    -   Novos pontos de coordenada são adicionados ao array `rawPts`.
    -   Para otimizar a performance, a atualização do atributo `d` do `<path>` é agrupada (batched) usando `requestAnimationFrame`. Apenas uma atualização de DOM é agendada por frame, evitando "jank" mesmo com uma alta frequência de eventos.

3.  **`pointerup`**:
    -   O gesto de desenho é finalizado.
    -   O array `rawPts` é processado pelo algoritmo de simplificação **Douglas-Peucker** (`simplify()`) para reduzir o número de pontos em 60-80% sem perda visual significativa.
    -   O novo objeto `Stroke` (com os pontos simplificados, cor e espessura) é adicionado ao array `strokes` em memória.
    -   O callback `_onStrokesChange` é invocado, sinalizando à aplicação principal que o estado dos traços mudou e precisa ser persistido imediatamente.

## 4. Algoritmos Principais

### Suavização de Traços (Bézier Quadrática)

Para criar traços suaves e naturais, a função `toPathD(pts)` não gera segmentos de linha retos (`L`). Em vez disso, para cada par de pontos, ela calcula o ponto médio e usa uma curva de **Bézier quadrática (`Q`)**. Isso resulta em curvas fluidas sem a necessidade de bibliotecas externas.

### Simplificação de Traços (Douglas-Peucker)

A função `simplify(pts, epsilon)` implementa o algoritmo Douglas-Peucker para reduzir a densidade de pontos de um traço.

-   **Tolerância (`DP_EPSILON`):** Um valor em pixels (e.g., `1.5`) que define o quão agressiva é a simplificação.
-   **Implementação:** A versão atual é recursiva. Uma melhoria futura seria convertê-la para uma versão iterativa para eliminar o risco teórico de estouro de pilha em traços extremamente complexos.

### Borracha Geométrica

A borracha não depende de hit-testing do DOM (`pointer-events: stroke`), que é impreciso para linhas finas. Em vez disso, ela usa um **hit-test geométrico**.

-   **Raio de Toque (`HIT_RADIUS`):** Um raio em pixels (e.g., `20px`) define a área de efeito da borracha.
-   **Lógica:** Ao clicar ou arrastar, a função `eraserHitTest(x, y)` itera por todos os pontos de todos os traços. Ela calcula a distância euclidiana ao quadrado entre o ponteiro e cada ponto. Se a distância for menor que o raio ao quadrado, o traço correspondente é identificado para remoção.
-   A iteração ocorre de trás para frente, priorizando os traços mais recentes.

## 5. API Pública do Módulo `Pen`

-   `init(svgEl, layerEl, editorAreaEl)`: Inicializa o módulo, armazena referências de DOM e anexa os listeners de eventos.
-   `activate() / deactivate()`: Ativa ou desativa a captura de `PointerEvents` no overlay SVG.
-   `load(savedStrokes: Stroke[])`: Carrega um array de traços, sanitiza os dados e os renderiza na tela.
-   `getStrokes(): Stroke[]`: Retorna o array atual de traços para persistência.
-   `undo()`: Remove o último traço adicionado.
-   `clear()`: Remove todos os traços (após confirmação).
-   `setColor(hex: string)`, `setWidth(px: number)`: Define os atributos da caneta.
-   `setEraser(active: boolean)`, `setPan(active: boolean)`: Alterna entre os modos de ferramenta.
-   `buildToolbar()`: Constrói dinamicamente os controles da barra de ferramentas da caneta (cores, espessuras) e anexa seus listeners, usando a função `rewire()` para evitar listeners duplicados.
-   `buildPrintSvg(): SVGElement | null`: Gera um SVG autônomo e com `viewBox` calculado para ser usado na exportação para PDF.
-   `_onStrokesChange: (strokes: Stroke[]) => void`: Callback a ser definido pela aplicação para receber notificações de mudança nos traços.

## 6. Constantes de Segurança

-   `MAX_STROKES`: Limita o número total de traços por entrada para proteger o desempenho e o armazenamento.
-   `MAX_PTS_RAW`: Limita o número de pontos brutos capturados durante um único gesto de desenho para proteger a memória do navegador.