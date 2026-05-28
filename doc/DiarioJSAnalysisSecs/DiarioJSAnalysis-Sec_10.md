# Análise da Seção 10 — Diálogo de Equação LaTeX

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 10 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção gerencia o modal (diálogo) de inserção de equações LaTeX. Ela fornece uma interface para que o usuário digite o código LaTeX, veja uma pré-visualização em tempo real e insira a equação formatada no editor de texto. Para facilitar o uso, o modal também oferece botões com templates de equações comuns.

## 2. Funções e Dados

-   **`EQ_TMPLS` (Array)**: Um array de objetos que define os templates de equações (ex: Fração, Raiz, Integral, Baskara). Cada objeto contém uma `label` para o botão e o `val` (código LaTeX) a ser inserido. Os botões são gerados dinamicamente a partir deste array.

-   **`eqBlock` (Variável)**: Uma variável booleana que controla o modo de inserção: `false` para inline (`$...$`) e `true` para bloco (`$$...$$`).

-   **`updateEqPreview()`**:
    -   **Papel**: Chamada a cada `input` no campo de texto do modal, esta função lê o código LaTeX digitado e o renderiza em tempo real na caixa de pré-visualização usando `katex.renderToString()`.
    -   **Entrada**: Nenhuma (lê o valor do DOM).
    -   **Saída**: Nenhuma (atualiza o `innerHTML` do preview).

-   **Event Listeners**:
    -   O botão `#btn-eq` abre o modal.
    -   Os botões de template preenchem o campo de input.
    -   Os botões de modo (inline/bloco) atualizam a variável `eqBlock` e o preview.
    -   O botão "Inserir" pega o código LaTeX, o envolve com os delimitadores (`$` ou `$$`) e o insere na posição do cursor no editor principal usando `ta.setRangeText()`.
    -   O botão "Cancelar", a tecla `Esc` ou um clique no fundo do overlay fecham o modal.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 3), a lógica desta seção será extraída para o módulo **`ui/dialogs.js`** (ou um mais específico, como `ui/equation-dialog.js`).

-   **Objetivo**: Encapsular toda a lógica de interação do modal de equação, tornando-o um componente de UI independente.
-   **Mudança Arquitetural**: O novo módulo não deve mais manipular o `textarea` principal diretamente. Em vez disso, ao clicar em "Inserir", ele deve despachar um evento customizado (ex: `new CustomEvent('insert-text', { detail: { text: '...' } })`). O módulo que gerencia o editor de texto (`app/bootstrap.js` ou um futuro `editor/textarea.js`) ouvirá esse evento e realizará a inserção. Isso desacopla completamente o modal da sua implementação de destino.