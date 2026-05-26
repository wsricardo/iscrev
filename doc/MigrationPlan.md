# Plano de Migração para Arquitetura Modular

> **Produto:** iScrev Notes  
> **Escopo:** Roteiro de tarefas para a refatoração de `diario.js` em módulos ES.  
> **Fontes:** `SpecsModule.md`, `10-modular-api-contracts.md`, `ModularizationAnalysis.md`

---

## 1. Resumo do Objetivo

Este documento detalha o plano de ação para executar a migração da arquitetura monolítica do iScrev Notes, atualmente concentrada em `src/assets/js/diario.js`, para uma arquitetura modular baseada em ECMAScript Modules (ESM).

O objetivo é seguir a estratégia incremental definida em `SpecsModule.md` para transformar o código-fonte em um sistema mais organizado, sustentável e seguro, facilitando a manutenção e a adição de novas funcionalidades no futuro.

---

## 2. Lista de Tarefas da Migração

A migração será dividida em fases, permitindo que cada etapa seja concluída e validada de forma independente para minimizar riscos.
 

-   [ ] **Fase 0: Preparação do Ambiente**
    -   [v] Congelar o desenvolvimento de novas funcionalidades.
    -   [ ] Garantir que um servidor de desenvolvimento local seja o padrão para todos os contribuidores.
    -   [ ] Validar e atualizar o checklist de regressão manual (`CSpec 09`).

-   [ ] **Fase 1: Extração de Módulos Puros e de Infraestrutura**
    -   [ ] Extrair o submódulo `Storage` para `infra/storage.js`.
    -   [ ] Extrair utilitários (`uid`, formatadores de data) para `shared/ids.js` e `shared/dates.js`.
    -   [ ] Extrair as funções de renderização (`mdToHtml`, `renderTex`) para `editor/markdown.js`.

-   [ ] **Fase 2: Extração do Motor da Caneta (`Pen`)**
    -   [ ] Refatorar e extrair o submódulo `Pen` para `editor/pen.js`.
    -   [ ] Implementar injeção de dependência para os callbacks e helpers externos.

-   [ ] **Fase 3: Separação da Camada de UI**
    -   [ ] Extrair a lógica de internacionalização para `ui/i18n.js`.
    -   [ ] Extrair a função `showToast` para `ui/toast.js`.
    -   [ ] Extrair a lógica da `sidebar` e `renderList` para `ui/sidebar.js`.
    -   [ ] Extrair os controladores de modais (Equação e Apoio) para `ui/dialogs.js`.
    -   [ ] Extrair o controle de modos (`setMode`) para `ui/modes.js`.

-   [ ] **Fase 4: Orquestração de Estado e Ações**
    -   [ ] Criar `app/state.js` para gerenciar o estado da aplicação (`entries`, `currentId`).
    -   [ ] Criar `app/actions.js` para centralizar as ações do usuário (CRUD, import/export).
    -   [ ] Transformar o restante de `diario.js` em `app/bootstrap.js`, responsável pela inicialização.

-   [ ] **Fase 5: Limpeza Final e Consolidação**
    -   [ ] Criar o ponto de entrada final `main.js`.
    -   [ ] Remover o arquivo `diario.js` legado.
    -   [ ] Revisar e atualizar toda a documentação do projeto para refletir a nova arquitetura.

---

## 3. Detalhamento das Tarefas

### Fase 0: Preparação do Ambiente
Esta fase não envolve código, mas é crucial para garantir que a migração ocorra sem interrupções ou perda de qualidade. Congelar features evita que novo código seja adicionado à base antiga. A padronização do servidor local é um requisito técnico, pois módulos ES não funcionam sobre o protocolo `file://`.

### Fase 1: Extração de Módulos Puros e de Infraestrutura
O objetivo desta fase é começar pelas partes com menor acoplamento, que são mais fáceis e seguras de mover.

-   **Extrair `infra/storage.js`**:
    -   **O que fazer**: Mover o código da "Seção 2.5 — Módulo de Armazenamento" de `diario.js` para o novo arquivo.
    -   **Objetivo**: Isolar completamente a camada de persistência. O novo módulo exportará um objeto com as funções `init`, `getAll`, `put`, `remove` e `backend`, conforme o contrato em `10-modular-api-contracts.md`. O arquivo `diario.js` passará a importar e usar `Storage` em vez de tê-lo em seu escopo.
    -   **Relação com o antigo**: Substitui a IIFE `Storage` que já existe, formalizando-a como um módulo ES.

-   **Extrair `shared/*.js` e `editor/markdown.js`**:
    -   **O que fazer**: Mover as funções puras das seções "1 — Renderização" e "4 — Utilitários" para seus respectivos arquivos.
    -   **Objetivo**: Criar módulos reutilizáveis para tarefas específicas. `markdown.js` cuidará da conversão de texto, enquanto `ids.js` e `dates.js` fornecerão utilitários para todo o sistema.
    -   **Relação com o antigo**: Reduz o tamanho de `diario.js` ao remover funções que não dependem do estado da aplicação.

### Fase 2: Extração do Motor da Caneta (`Pen`)
Este é um dos passos mais críticos, pois isola o componente mais complexo da aplicação.

-   **Extrair `editor/pen.js`**:
    -   **O que fazer**: Mover o código da "Seção 2 — Módulo de Caneta" para o novo arquivo e refatorá-lo, preferencialmente como uma classe.
    -   **Objetivo**: Desacoplar o motor da caneta do resto da aplicação. Em vez de chamar funções globais como `showToast` ou `t`, a nova classe `Pen` receberá essas dependências em seu construtor (injeção de dependência), conforme especificado em `10-modular-api-contracts.md`.
    -   **Relação com o antigo**: Transforma a IIFE `Pen` em um módulo verdadeiramente independente e testável, quebrando um dos maiores pontos de acoplamento implícito em `diario.js`.

### Fase 3: Separação da Camada de UI
Esta fase foca em extrair toda a lógica que manipula diretamente o DOM e a apresentação visual.

-   **Extrair `ui/*.js`**:
    -   **O que fazer**: Mover as funções responsáveis pela internacionalização (Seção 0), toasts (Seção 5), sidebar (Seção 6), modais (Seção 10 e modal de apoio) e controle de modo (Seção 7) para seus respectivos módulos.
    -   **Objetivo**: Criar módulos de UI que gerenciam suas próprias partes do DOM. A comunicação com o resto do sistema deve ser feita por meio de eventos ou callbacks, não por chamadas diretas a funções de negócio. Por exemplo, `sidebar.js` ouvirá um evento "state-changed" para se re-renderizar, em vez de ser chamado diretamente por `saveEntry`.
    -   **Relação com o antigo**: Desmembra a mistura de lógica de UI e lógica de negócio, tornando o código de apresentação mais coeso e independente.

### Fase 4: Orquestração de Estado e Ações
Com as camadas de infraestrutura, engine e UI separadas, esta fase cria a "cola" que as une.

-   **Criar `app/state.js`**:
    -   **O que fazer**: Criar um novo módulo para encapsular as variáveis `entries` e `currentId` (da Seção 3).
    -   **Objetivo**: Centralizar o gerenciamento do estado. Em vez de ter variáveis "globais" dentro da IIFE, o estado será acessado e modificado apenas através de funções exportadas (`getEntries`, `setCurrentId`, etc.), tornando o fluxo de dados explícito e previsível.

-   **Criar `app/actions.js` e `app/bootstrap.js`**:
    -   **O que fazer**: Mover as funções de CRUD (Seção 8) e import/export (Seção 11) para `app/actions.js`. O código de inicialização (Seção 15) será limpo e movido para `app/bootstrap.js`.
    -   **Objetivo**: `actions.js` se tornará o orquestrador das operações do usuário, chamando os módulos de `state`, `storage` e `ui` conforme necessário. `bootstrap.js` terá a única responsabilidade de inicializar todos os módulos na ordem correta quando a aplicação carrega.
    -   **Relação com o antigo**: Formaliza o fluxo de controle da aplicação, que antes estava disperso por todo o arquivo `diario.js`.

### Fase 5: Limpeza Final e Consolidação
Esta é a etapa final para oficializar a nova arquitetura.

-   **Criar `main.js` e remover `diario.js`**:
    -   **O que fazer**: Criar um `main.js` minimalista que apenas importa e executa `app/bootstrap.js`. O `<script>` em `diario.html` será atualizado para apontar para `main.js`. O antigo `diario.js` pode finalmente ser removido.
    -   **Objetivo**: Concluir a migração, deixando a estrutura de arquivos limpa e alinhada com a arquitetura modular definida em `SpecsModule.md`. A atualização da documentação garante que o conhecimento sobre a nova estrutura seja preservado.