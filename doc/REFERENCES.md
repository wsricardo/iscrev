# Referências usadas na elaboração do GUIDEModules

Este arquivo reúne as fontes internas e externas consultadas para compor o documento `GUIDEModules.md`, com foco em arquitetura atual, modularização, portabilidade e migração gradual para ECMAScript 2015+ (ES6+) no projeto iScrev Notes.

Data de consulta principal: `2026-05-14`

## 1. Fontes internas do projeto

### Documentação já existente

- `doc/DOCUMENTACAO-v2-codex.md`
  - Base consolidada do estado atual do projeto.
  - Usada para recuperar a visão geral da aplicação, os fluxos principais, os módulos funcionais já identificados, riscos técnicos e pontos de manutenção.

- `doc/DOCUMENTACAO-v2g.md`
  - Documento complementar com histórico descritivo da estrutura do projeto.
  - Usado para comparar a documentação anterior com a implementação atual e orientar o novo guia sobre modularização e evolução arquitetural.

### Código-fonte e estrutura efetivamente analisados

- `src/diario.html`
  - Fonte usada para confirmar o modo atual de carregamento do app principal.
  - Serviu para identificar a presença de `<script type="module">` no bootstrap do diário e o registro do `service-worker.js`.

- `src/assets/js/diario.js`
  - Principal base técnica usada no `GUIDEModules.md`.
  - Foi analisado especialmente para mapear:
    - fluxo de inicialização e bootstrap;
    - responsabilidades misturadas no mesmo arquivo;
    - objetos centrais como `Pen` e `Storage`;
    - rotinas de CRUD de entradas;
    - exportação/importação;
    - duplicações de carga e reidratação da interface.
  - Pontos observados no arquivo incluem, entre outros:
    - `applyLocale` por volta da linha `304`;
    - `Pen` por volta da linha `565`;
    - `Storage` por volta da linha `1362`;
    - `loadData` por volta da linha `1540`;
    - `setMode` por volta da linha `1910`;
    - `openEntry`, `newEntry` e `saveEntry` por volta das linhas `1958`, `1981` e `1998`;
    - `exportMarkdown` e `exportPDF` por volta das linhas `2209` e `2415`;
    - `importMarkdown` por volta da linha `2488`;
    - `migrateFromLocalStorage` por volta da linha `2886`;
    - bloco final de bootstrap e sincronização responsiva nas linhas finais do arquivo.

## 2. Fontes externas sobre ECMAScript, módulos e portabilidade

### MDN Web Docs

- MDN Web Docs. "JavaScript modules"
  - Link: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules>
  - Motivo de uso:
    - Referência principal para a sintaxe e o modelo mental de módulos nativos do navegador.
    - Fundamentou a discussão sobre `export`, `import`, isolamento de escopo e reorganização do `diario.js` em arquivos menores.

- MDN Web Docs. "`import`"
  - Link: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import>
  - Motivo de uso:
    - Usado para sustentar a parte do guia que trata de imports estáticos, resolução por caminho/URL e restrições do uso de módulos em navegadores.

- MDN Web Docs. "`HTMLScriptElement.noModule`"
  - Link: <https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement/noModule>
  - Motivo de uso:
    - Apoio à discussão sobre compatibilidade e estratégias de fallback para ambientes legados, caso o projeto queira manter suporte a navegadores sem módulos nativos.

### web.dev

- web.dev. "JavaScript import maps are now supported cross-browser"
  - Link: <https://web.dev/blog/import-maps-in-all-modern-browsers>
  - Motivo de uso:
    - Referência para a parte do guia que menciona uma futura organização mais limpa de imports sem depender imediatamente de bundler.
    - Usada especialmente na avaliação de portabilidade e legibilidade dos caminhos de dependência.

- web.dev. "ES modules in service workers"
  - Link: <https://web.dev/articles/es-modules-in-sw>
  - Motivo de uso:
    - Sustentou a seção que diferencia a migração do código da interface da migração do `service-worker.js`.
    - Importante para explicar por que a adoção de módulos no service worker deve ser tratada com mais cautela que no código principal da aplicação.

### Guias e livros online

- Dr. Axel Rauschmayer. "Exploring JavaScript (ES2025 Edition) - Modules ES6"
  - Link: <https://exploringjs.com/js/book/ch_modules.html>
  - Motivo de uso:
    - Livro online usado como apoio conceitual sobre organização modular, reutilização e limites entre módulos.
    - Serviu como referência complementar para defender uma migração gradual, com fronteiras bem definidas entre domínio, infraestrutura e interface.

- Google. "Google JavaScript Style Guide"
  - Link: <https://google.github.io/styleguide/jsguide>
  - Motivo de uso:
    - Guia de boas práticas utilizado como apoio para recomendações de manutenção, legibilidade, responsabilidade por módulo e organização de funções.
    - Não foi usado como regra obrigatória do projeto, mas como referência de qualidade para modularização e consistência.

## 3. Observações sobre o uso das referências

- As fontes externas foram usadas como apoio conceitual e de boas práticas, não como substitutas da leitura do código do projeto.
- As conclusões do `GUIDEModules.md` foram guiadas primeiro pela implementação real encontrada em `src`, principalmente no arquivo `src/assets/js/diario.js`.
- A documentação externa foi usada para:
  - validar nomenclatura e modelo de módulos ES;
  - embasar recomendações de portabilidade;
  - sustentar estratégias de migração progressiva;
  - separar o que já é compatível com uma arquitetura modular do que ainda depende de refatoração interna.
