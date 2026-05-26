# Análise Comparativa: Arquitetura Atual vs. Modularização Proposta

> **Produto:** iScrev Notes  
> **Escopo:** Comparativo entre a arquitetura monolítica de `diario.js` e a arquitetura modular proposta.  
> **Fontes:** `doc/doc-tech.md`, `doc/GUIDEModules.md`, `doc/SpecsModule.md`, `doc/cspecs/`

---

## 1. Objetivo

Este documento apresenta um resumo comparativo entre a arquitetura atual do iScrev Notes, centrada no arquivo monolítico `diario.js`, e a arquitetura-alvo modular especificada nos documentos de refatoração. O objetivo é destacar as principais diferenças, os benefícios da migração e o caminho proposto para alcançá-la.

---

## 2. Arquitetura Atual: Monolito Funcional em IIFE

A arquitetura atual, embora funcional e rica em recursos, concentra a quase totalidade da lógica da aplicação no arquivo `src/assets/js/diario.js`. Este arquivo opera como um "módulo implícito" gigante, encapsulado em uma IIFE (Immediately Invoked Function Expression) para evitar a poluição do escopo global.

-   **Estrutura:** Um único e extenso arquivo JavaScript, com responsabilidades divididas conceitualmente por meio de seções comentadas (ex: i18n, Pen, Storage, CRUD).
-   **Gerenciamento de Estado:** Depende de variáveis compartilhadas dentro do escopo da IIFE, como `entries`, `currentId` e `currentMode`, que funcionam como um estado global para toda a aplicação.
-   **Dependências e Acoplamento:** O acoplamento é alto e implícito. Componentes conceituais como `Pen` chamam diretamente funções do escopo externo (ex: `showToast`, `t`). A lógica de UI está fortemente misturada com a lógica de negócio e as chamadas de persistência.
-   **Pontos Fortes:**
    -   Simplicidade durante a fase inicial de prototipação.
    -   Agilidade para iterações rápidas quando todo o contexto está em um único local.
-   **Pontos Fracos:**
    -   Elevado custo cognitivo para manutenção e para a entrada de novos desenvolvedores.
    -   Alto risco de regressões, pois mudanças em uma seção podem gerar efeitos colaterais inesperados em outras.
    -   Dificuldade extrema para testar componentes de forma isolada.
    -   Reaproveitamento de código é praticamente impossível sem copiar e colar trechos.

---

## 3. Arquitetura-Alvo: Módulos ECMAScript (ESM)

A refatoração proposta visa uma **"arquitetura modular browser-first"**, utilizando módulos ES nativos para organizar o código de forma lógica e física, alinhada com os padrões modernos da web e mantendo a filosofia "zero build step".

-   **Estrutura:** O código é decomposto em múltiplos arquivos menores, organizados em diretórios que representam camadas arquiteturais: `infra/` (infraestrutura), `editor/` (mecânicas do editor), `ui/` (interação com o DOM), `app/` (orquestração) e `shared/` (utilitários).
-   **Gerenciamento de Estado:** Um módulo dedicado, `app/state.js`, gerenciará o estado da aplicação através de uma API explícita (`getEntries`, `setCurrentId`), evitando a manipulação direta e dispersa das variáveis de estado.
-   **Dependências e Acoplamento:** O acoplamento é baixo e explícito. As dependências são declaradas através de `import`/`export`. Os componentes recebem suas dependências via **injeção de dependência** (passando callbacks ou outros módulos para um construtor ou método `init`), conforme definido em `cspecs/10-modular-api-contracts.md`.
-   **Pontos Fortes:**
    -   **Sustentabilidade:** O código torna-se mais fácil de ler, entender e manter.
    -   **Segurança:** Fronteiras claras entre os módulos reduzem o risco de efeitos colaterais indesejados.
    -   **Testabilidade:** Módulos individuais podem ser testados de forma isolada.
    -   **Organização:** A estrutura de arquivos passa a refletir a arquitetura da aplicação, simplificando o desenvolvimento de novas funcionalidades.
-   **Pontos Fracos:**
    -   Leve aumento na complexidade inicial devido ao maior número de arquivos.
    -   Exige estritamente um servidor de desenvolvimento local (o que, na prática, já é um requisito do projeto).

---

## 4. Tabela Comparativa

| Característica | Arquitetura Atual (Monolito IIFE) | Arquitetura-Alvo (Módulos ES) |
| :--- | :--- | :--- |
| **Estrutura do Código** | Um único arquivo `diario.js` com seções comentadas. | Múltiplos arquivos organizados em diretórios por camada (`/infra`, `/ui`, `/editor`). |
| **Gerenciamento de Estado** | Variáveis compartilhadas no escopo da IIFE (`entries`, `currentId`). | Módulo dedicado (`app/state.js`) com API explícita. |
| **Dependências** | Implícitas e com alto acoplamento. Funções "globais" e acesso direto entre "módulos" conceituais. | Explícitas via `import`/`export`. Injeção de dependência para desacoplamento. |
| **Testabilidade** | Muito difícil. Requer o carregamento de todo o ambiente da aplicação. | Alta. Módulos podem ser testados isoladamente (testes unitários). |
| **Manutenção** | Difícil e arriscada. Alterações podem causar regressões inesperadas. | Simples e segura. O escopo de impacto de uma mudança é bem definido. |
| **Reuso de Código** | Praticamente inexistente. | Alto. Módulos como `storage.js` ou `shared/ids.js` podem ser reutilizados. |

---

## 5. O Caminho da Migração: Uma Ponte Incremental

A transição da arquitetura atual para a alvo não será uma reescrita completa ("big bang"). Conforme definido em `SpecsModule.md`, a migração seguirá uma estratégia faseada e incremental para minimizar riscos:

-   **Fase 1: Extração de Módulos Puros:** Isolar lógicas autocontidas como `storage.js` e funções utilitárias (`ids.js`, `dates.js`).
-   **Fase 2: Extração do Motor da Caneta (`Pen`):** Refatorar o componente mais complexo para uma classe ou factory com dependências injetadas.
-   **Fase 3: Separação da UI:** Extrair componentes de UI (`sidebar.js`, `toast.js`) e fazê-los comunicar via eventos ou callbacks.
-   **Fase 4: Orquestração:** Criar a camada final de orquestração (`app/state.js`, `app/actions.js`, `app/bootstrap.js`).
-   **Fase 5: Limpeza:** Remover código legado e finalizar a nova estrutura.

---

## 6. Conclusão

A arquitetura atual serviu bem ao projeto durante sua fase de rápido crescimento. Contudo, ela atingiu um ponto onde sua natureza monolítica começa a comprometer a sustentabilidade de longo prazo. A arquitetura modular proposta, baseada em recursos nativos do navegador, é o próximo passo lógico.

Essa refatoração tornará o iScrev Notes mais robusto, fácil de manter e mais bem preparado para o futuro, tudo isso enquanto preserva sua filosofia central de simplicidade. É um investimento direto na qualidade técnica e na longevidade do projeto.