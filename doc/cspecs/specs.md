# iScrev Notes — CSpecs

> **Produto:** iScrev Notes  
> **Escopo:** aplicação principal em `src/diario.html` e código associado  
> **Abordagem:** Specification-Driven Development (SDD), com foco em especificações concretas da implementação atual

## 1. Objetivo

Este diretório reúne as **concrete specs** do iScrev Notes. Diferente de `doc/gspecs`, que descreve a visão geral e os contratos arquiteturais em nível mais amplo, `doc/cspecs` documenta:

- a estrutura real do runtime atual;
- os contratos de DOM, dados e módulos observados no código;
- as invariantes que futuras mudanças não devem quebrar;
- os fluxos operacionais que precisam continuar válidos após refactors.

Estas especificações devem ser tratadas como a referência canônica para mudanças na SPA do diário.

## 2. Regras de uso em SDD

1. Toda mudança relevante em comportamento deve começar pela atualização da `cspec` afetada.
2. Mudanças em HTML que alterem `id`, `class` ou semântica estrutural devem atualizar a especificação de contrato de DOM.
3. Mudanças em persistência, importação ou exportação exigem atualização explícita dos contratos de formato e compatibilidade.
4. Se o código divergir da especificação, a divergência deve ser resolvida de uma destas formas:
   - corrigir o código para voltar ao contrato descrito;
   - ou atualizar a `cspec` antes de consolidar o novo comportamento.
5. `doc/gspecs` continua útil para visão macro; `doc/cspecs` define o comportamento técnico concreto.
6. Refactors que não alterem comportamento ainda devem preservar as invariantes registradas aqui.

## 3. Índice

- `00-overview.md`
  Panorama técnico, princípios de arquitetura e diferenças importantes entre visão histórica e runtime atual.
- `01-runtime-and-dom-contract.md`
  Contrato estrutural de `diario.html`, dependências externas, elementos obrigatórios e pontos de acoplamento com JavaScript e CSS.
- `02-data-model-and-state.md`
  Tipos de dados, chaves de armazenamento, estado global e invariantes de runtime.
- `03-persistence-and-migration.md`
  Contrato do módulo `Storage`, IndexedDB, fallback para `localStorage`, migração e tratamento de falhas.
- `04-rendering-editor-and-equations.md`
  Pipeline de Markdown/LaTeX, superfície canônica renderizada, diálogo de equações e regras de edição.
- `05-pen-engine.md`
  Módulo `Pen`, coordenadas, desenho, borracha, pan, simplificação geométrica e integração com impressão.
- `06-entry-lifecycle-and-shell.md`
  Ciclo de vida das entradas, shell responsivo, sidebar, autosave, atalhos, fullscreen e modais auxiliares.
- `07-import-export-and-print.md`
  Protocolos de importação/exportação e o pipeline real de impressão e PDF.
- `08-i18n-and-localized-copy.md`
  Sistema de i18n, aplicação de locale, reconstrução de componentes traduzíveis e regras para novos textos.
- `09-quality-attributes-and-change-rules.md`
  Qualidades do sistema, riscos conhecidos, dívida técnica relevante e checklist de regressão orientado a SDD.

## 4. Fontes normativas principais

- `src/diario.html`
- `src/assets/js/diario.js`
- `src/assets/js/pdf-exporter.js`
- `src/assets/css/diario.css`
- `src/assets/js/ui.js`
- `src/service-worker.js`
- `src/iScrev-Notes-Historico-Tecnico.md`
- `doc/gspecs/*.md`

## 5. Convenção de leitura

- Quando este conjunto usar o termo **deve**, trata-se de requisito normativo.
- Quando usar **atual**, trata-se de comportamento observado no código.
- Quando usar **pode evoluir**, trata-se de espaço permitido para refactor sem quebrar contrato externo.
