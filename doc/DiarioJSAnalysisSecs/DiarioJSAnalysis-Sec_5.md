# Análise da Seção 5 — Toast

> **Produto:** iScrev Notes  
> **Escopo:** Detalhamento técnico da Seção 5 de `diario.js`.  
> **Fontes:** `diario.js`, `DiarioJSAnalysis.md`, `MigrationPlan.md`

---

## 1. Resumo e Explicação

Esta seção implementa a funcionalidade de "toast", que são pequenas notificações não-bloqueantes que aparecem na parte inferior da tela para fornecer feedback ao usuário sobre ações concluídas (ex: "Salvo ✓", "Entrada excluída.").

## 2. Funções e Dados

-   **`toastTimer` (Variável)**: Armazena o ID do timer retornado por `setTimeout`. É usado para garantir que o toast desapareça após um período e para cancelar timers pendentes se um novo toast for exibido.

-   **`showToast(msg)`**:
    -   **Papel**: A única função pública desta seção. Ela recebe uma mensagem, a exibe no elemento `#toast`, e usa classes CSS para controlar a animação de entrada e saída.
    -   **Lógica**: Ao ser chamada, ela cancela qualquer `setTimeout` anterior (`clearTimeout(toastTimer)`), garantindo que toasts disparados em rápida sucessão não se acumulem ou se comportem de maneira inesperada. Um novo timer é então configurado para remover a classe `.show` após 2.2 segundos, ocultando o toast.

## 3. Plano de Migração

Conforme o `MigrationPlan.md` (Fase 3), esta seção será extraída para o módulo **`ui/toast.js`**.

-   **Objetivo**: Criar um componente de UI dedicado e autocontido para notificações.
-   **Mudança Arquitetural**: O novo módulo exportará a função `showToast`. Outros módulos que precisam exibir notificações (como `app/actions.js` ou `editor/pen.js`) importarão e chamarão esta função. No caso do `Pen`, a função `showToast` será passada via injeção de dependência para manter o desacoplamento.