# Planejamento iScrev v2

Presente arquivo de migração para fins de planejamento de aspectos de arquitetura e definição de módulos a serem organizados referentes as funcionalidades conforme anteriormente definido em "diario.js".

---

## Estrutura de Módulos

```text
js/
|-- main.js               # Ponto de entrada (Conecta na página HTML, registra Service Worker e invoca o bootstrap)
|-- storage/
|   |-- db.js             # Abstração do IndexedDB com fallback para localStorage
|
|-- ui/                   # Módulo de UI
|   |-- shell.js          # Gerencia o layout principal, sidebar e modo responsivo
|   |-- toolbar.js        # Constrói e gerencia eventos das toolbars
|   |-- modes.js          # Controla a alternância entre os modos (edit, pen, preview)
|   |-- modals.js         # Lógica para os modais (equação, confirmação)
|   |-- toast.js          # Sistema de notificações (toast)
|
|-- pen/                  # Motor da Caneta SVG (Engine independente)
|   |-- pen.js            # Gerencia o overlay SVG, desenho, suavização (Bézier), borracha geométrica e simplificação
|
|-- editor/               # Mecânicas do Editor e Lógica de Transformação
|   |-- markdown.js       # Parser de Markdown e renderizador de LaTeX (via KaTeX)
|   |-- io.js             # Lógica de importação e exportação (Markdown, PDF)
|
|-- core/                 # Orquestração, Estado e Regras de Negócio
|   |-- bootstrap.js      # Script de inicialização (Instancia dependências e conecta os eventos da UI)
|   |-- state.js          # Fonte única da verdade (Guarda entries[] e currentId em memória)
|   |-- actions.js        # Regras de negócio do usuário (newEntry, deleteEntry, save)
|   |-- models.js         # Estrutura de dados e entidades (Factory para novo objeto Entry)
|
|       
|-- shared/               # Módulo de Utilitários Compartilhados
|   |-- utils.js          # Funções puras utilitárias (geração de UIDs, formatadores)
|   |-- constants.js      # Constantes do sistema (nomes de eventos customizados, tempos de debounce, chaves)
|   |-- i18n.js           # Dicionário e funções de internacionalização

```
