# Especificação Técnica — 06. Shell da UI e Modos de Operação

Este documento especifica a estrutura de layout principal (a "shell") da aplicação, seus modos de operação e seu comportamento responsivo.

---

## 1. Estrutura de Layout Principal

O layout da aplicação é construído com uma cadeia de Flexbox containers.

```
body
└── .app (display: flex, height: 100dvh)
    ├── .sidebar (width: 280px)
    └── .main (flex: 1, display: flex, flex-direction: column)
        ├── .toolbar
        ├── .pen-toolbar
        └── .editor-wrap (flex: 1, position: relative)
            ├── .editor-area (overflow-y: auto)
            └── #pen-svg (position: absolute)
```

### Princípio Fundamental do Scroll

O elemento `.editor-area` é o **único contêiner de scroll** em toda a aplicação. O `textarea` (`#entry-raw`) possui `overflow: hidden` e sua altura é ajustada dinamicamente via JavaScript para crescer com o conteúdo. Esta decisão arquitetural é crítica para evitar o "bug do paralaxe", garantindo que o fundo do caderno e o texto rolem sempre em perfeita sincronia.

## 2. Modos de Operação

A aplicação opera em três modos distintos, controlados pela função `setMode(mode)`. A troca de modo altera a visibilidade e o comportamento dos elementos principais da área de edição.

### Modo `edit`
-   **Superfície:** O `textarea#entry-raw` está visível e interativo.
-   **Toolbars:** A barra de formatação de texto (`.toolbar`) está visível. A barra da caneta (`#pen-toolbar`) está oculta.
-   **Caneta:** O overlay SVG (`#pen-svg`) está passivo (`pointer-events: none`).

### Modo `pen`
-   **Superfície:** O `textarea#entry-raw` permanece no DOM, mas com opacidade reduzida para servir como guia. O overlay `#pen-svg` está ativo (`pointer-events: all`) para capturar o desenho.
-   **Toolbars:** A barra da caneta (`#pen-toolbar`) está visível.
-   **Comportamento:** O fundo do caderno (`#notebook-tail`) cresce dinamicamente conforme o usuário desenha perto do final da página, criando a sensação de "papel infinito".

### Modo `preview`
-   **Superfície:** O `div#entry-preview`, contendo o HTML renderizado a partir do Markdown/LaTeX, está visível. O `textarea` está oculto.
-   **Toolbars:** Ambas as barras de ferramentas estão ocultas.
-   **Caneta:** O overlay SVG está visível para mostrar os traços existentes, mas está passivo (`pointer-events: none`).

## 3. Responsividade

A shell da aplicação se adapta a diferentes tamanhos de tela através de Media Queries.

### Breakpoint `≤ 900px` (Mobile Shell)
-   A `.sidebar` se transforma em um "drawer" lateral.
-   Ela é posicionada com `position: fixed` e fica oculta fora da tela (`transform: translateX(-100%)`).
-   O estado de abertura é controlado pela classe `.sidebar-open` no elemento `<body>`.
-   Quando aberta, um "scrim" (fundo semitransparente) cobre a área de conteúdo principal.
-   O controle é feito exclusivamente via classes CSS, sem manipulação de `style.display` em JavaScript, para garantir a integridade do layout flex interno da sidebar.

### Breakpoint `≤ 640px` (Telas Pequenas)
-   Ajustes finos são aplicados, como redução de `padding`, diminuição da largura da sidebar (`min(88vw, 240px)`) e reorganização dos controles do cabeçalho.