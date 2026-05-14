# iScrev Notes — GuideModules

> Documento de orientação técnica para modularização do projeto, elaborado a partir da análise do estado atual do código e das documentações [DOCUMENTACAO-v2-codex.md](./DOCUMENTACAO-v2-codex.md) e [DOCUMENTACAO-v2g.md](./DOCUMENTACAO-v2g.md).  
> Escopo principal: arquitetura atual, portabilidade, migração para ECMAScript Modules e reorganização modular, com foco especial em `src/assets/js/diario.js`.

---

## 1. Resumo do projeto

O iScrev Notes é um aplicativo web local-first de diário digital e caderno de anotações. O núcleo do produto permite combinar texto em Markdown leve, fórmulas em LaTeX e anotações manuscritas em SVG na mesma superfície de trabalho. A aplicação principal está em `src/diario.html`, enquanto a lógica dominante está concentrada em `src/assets/js/diario.js`, com apoio de `pdf-exporter.js`, `site-nav.js`, `support.js`, `ui.js`, `service-worker.js` e dos estilos em `src/assets/css/`.

Do ponto de vista arquitetural, o projeto já não está na fase single-file descrita em parte da documentação histórica. Ele evoluiu para uma estrutura com separação por arquivos, introduziu `IndexedDB` como persistência principal, preservou fallback para `localStorage`, adicionou service worker, manifest, páginas institucionais e uma camada pública mais ampla. Ainda assim, o núcleo do app continua concentrado em um único arquivo JavaScript grande, com mais de uma responsabilidade operacional dentro da mesma IIFE.

O ponto mais importante para este guia é a seguinte constatação: o projeto já vive em uma zona híbrida. O HTML já carrega scripts com `type="module"`, mas o módulo principal ainda foi escrito no estilo clássico de encapsulamento por IIFE, com estado compartilhado local, forte acoplamento ao DOM e alguns vestígios de transição entre código legado e código novo. Em outras palavras, a migração para ECMAScript Modules não parte do zero; ela parte de uma base que já roda em navegadores modernos, mas ainda não explora a arquitetura modular de forma explícita.

---

## 2. Arquitetura, portabilidade e migração para ECMA6

### 2.1 Estado atual da arquitetura

O `src` hoje pode ser lido como quatro camadas:

1. `diario.html` + `diario.css` + `diario.js` + `pdf-exporter.js`: aplicativo principal.
2. `index.html`, `en.html`, `sobre.html`, `about.html`, `contato.html`, `contact.html`, `privacidade.html`, `privacy.html`, `support.html`: superfície pública institucional.
3. `manifest.json`, `service-worker.js`, `robots.txt`, `sitemap.xml`, `ads.txt`: publicação, PWA e SEO.
4. documentação interna e snapshots legados em `src/` e `doc/`.

No diário, a maior concentração de complexidade está em `src/assets/js/diario.js`. Hoje ele reúne, no mesmo arquivo:

- internacionalização;
- renderização Markdown + LaTeX;
- módulo da caneta (`Pen`);
- módulo de persistência (`Storage`);
- estado global da aplicação (`entries`, `currentId`, `currentMode`);
- lógica da shell responsiva;
- CRUD das entradas;
- exportação/importação;
- fullscreen;
- eventos de teclado;
- binding de eventos do DOM;
- inicialização.

Essa centralização funcionou bem para acelerar evolução funcional, mas hoje cria três efeitos colaterais:

1. custo alto de leitura e onboarding;
2. alto risco de regressões por acoplamento indireto;
3. dificuldade de reuso, teste e portabilidade fina por responsabilidade.

### 2.2 O que já é moderno no projeto, mesmo antes da migração

Embora parte da documentação ainda descreva o projeto como “ES5 puro”, o estado real já depende de um baseline de browsers modernos. Exemplos concretos:

- `src/diario.html` carrega `pdf-exporter.js`, `diario.js` e `ui.js` com `type="module"`;
- `support.js` usa `Object.freeze`, `URLSearchParams` e `navigator.clipboard`;
- `diario.js` já usa `Array.prototype.find()` em pontos do fluxo;
- o projeto depende de `Promise`, `IndexedDB`, `FileReader`, `Blob`, `URL.createObjectURL`, Fullscreen API, Service Worker e Cache API;
- o service worker atual usa `const` e arrow functions.

Isso importa porque a migração para ECMAScript Modules não é uma ruptura semântica total. O app já roda em ambiente capaz de suportar `import` e `export`; o que falta é reorganizar a arquitetura para usar isso a favor da manutenção.

### 2.3 O núcleo real do problema em `diario.js`

Hoje `diario.js` é um “módulo monolítico implícito”. Ele está encapsulado e relativamente bem seccionado por comentários, mas não separa formalmente:

- contratos públicos;
- dependências de infraestrutura;
- estado de domínio;
- camada de apresentação;
- detalhes de browser/platform APIs.

Isso aparece de forma clara em alguns exemplos do arquivo:

- `Pen` já se comporta como um módulo quase autônomo, mas ainda depende de `showToast`, `t`, `maybeGrowNotebookTail` e do callback injetado `_onStrokesChange`;
- `Storage` já possui API própria baseada em `Promise`, mas ainda está definido dentro do mesmo arquivo do app;
- a inicialização mistura fluxo novo (`Storage.init()`, migração para IndexedDB) com chamadas legadas adicionais a `loadData()` e `applyLocale(currentLang)`;
- o fluxo de importação/exportação cruza DOM, persistência, serialização e feedback visual dentro do mesmo escopo.

Em termos de modularização, isso significa que o trabalho não é “quebrar um arquivo grande em arquivos menores” apenas por estética. O trabalho real é explicitar fronteiras arquiteturais.

### 2.4 Fronteiras arquiteturais recomendadas

Uma migração saudável para ECMAScript Modules deveria adotar pelo menos cinco fronteiras:

#### A. Camada de domínio

Responsável por estruturas e regras estáveis do aplicativo.

Exemplos:

- `Entry`;
- `Stroke`;
- helpers de serialização de front matter;
- geração de IDs;
- formatação de datas;
- validação/sanitização de dados persistidos/importados.

Arquivos candidatos:

- `domain/entry-model.js`
- `domain/stroke-model.js`
- `domain/export-format.js`
- `domain/date-format.js`

#### B. Camada de infraestrutura

Responsável por integrações com APIs do navegador.

Exemplos:

- `IndexedDB` / `localStorage`;
- Fullscreen API;
- Clipboard API;
- Service Worker registration;
- FileReader / Blob / URL API.

Arquivos candidatos:

- `infra/storage.js`
- `infra/fullscreen.js`
- `infra/file-io.js`
- `infra/browser-capabilities.js`

#### C. Camada de engine/editor

Responsável pela mecânica do app principal, mas ainda desacoplada de wiring completo de interface.

Exemplos:

- `Pen`;
- renderização Markdown + KaTeX;
- paginação/exportação PDF;
- contagem de palavras;
- cálculo de expansão do caderno.

Arquivos candidatos:

- `editor/pen.js`
- `editor/render-markdown.js`
- `editor/notebook-surface.js`
- `editor/pdf-export.js`
- `editor/stats.js`

#### D. Camada de UI e apresentação

Responsável por DOM, textos, botões, modais, lista lateral, shell responsiva.

Exemplos:

- `applyLocale`;
- `renderList`;
- `showToast`;
- `setMode`;
- modal de equações;
- modal de apoio.

Arquivos candidatos:

- `ui/i18n.js`
- `ui/toast.js`
- `ui/sidebar.js`
- `ui/mode-toggle.js`
- `ui/equation-dialog.js`
- `ui/support-modal.js`

#### E. Camada de orquestração

Responsável por ligar tudo, definir ordem de boot e manter o estado central mínimo.

Arquivos candidatos:

- `app/state.js`
- `app/actions.js`
- `app/bootstrap.js`

### 2.5 Proposta de decomposição específica para `diario.js`

Uma decomposição prática, sem exagerar no número de arquivos, poderia ser:

```text
src/assets/js/diario/
├── main.js
├── app/
│   ├── bootstrap.js
│   ├── state.js
│   └── actions.js
├── ui/
│   ├── i18n.js
│   ├── toast.js
│   ├── sidebar.js
│   ├── modes.js
│   ├── equation-dialog.js
│   └── support-modal.js
├── editor/
│   ├── markdown.js
│   ├── notebook-surface.js
│   ├── pen.js
│   ├── export-markdown.js
│   ├── export-pdf.js
│   └── stats.js
├── infra/
│   ├── storage.js
│   ├── browser.js
│   ├── fullscreen.js
│   └── service-worker-register.js
└── shared/
    ├── ids.js
    ├── dates.js
    ├── events.js
    └── constants.js
```

#### Papel dos módulos sugeridos

`main.js`

- entry point carregado por `diario.html`;
- importa `bootstrap.js`;
- não concentra regra de negócio.

`app/state.js`

- define o estado de sessão do diário;
- centraliza `entries`, `currentId`, `currentMode`, `currentLang`;
- expõe getters e mutações pequenas, em vez de variáveis espalhadas.

`app/actions.js`

- concentra ações de alto nível:
  - `newEntry`
  - `openEntry`
  - `saveEntry`
  - `deleteEntry`
  - `importMarkdown`
  - `exportMarkdown`
  - `exportPDF`

`ui/i18n.js`

- contém `I18N`, `t()`, `applyLocale()`;
- não deveria conhecer diretamente detalhes de persistência;
- idealmente recebe callbacks para “re-renderizar peças dependentes”.

`editor/pen.js`

- exporta uma classe ou factory com API explícita;
- hoje é o melhor candidato a virar módulo independente quase sem perda semântica;
- deveria depender apenas de callbacks injetados, nunca de globais implícitos.

`infra/storage.js`

- já tem a melhor separação conceitual do arquivo atual;
- pode ser migrado primeiro;
- deve expor API estável do tipo `init`, `getAll`, `put`, `remove`, `backend`.

### 2.6 Portabilidade: o que muda com módulos ES

Migrar para módulos melhora organização, mas altera o contrato operacional do projeto em pontos importantes.

#### 2.6.1 Teste local deixa de tolerar `file://`

No navegador, módulos ES exigem carregamento com semântica de módulo e resolução correta por URL. Na prática:

- o projeto deve continuar sendo servido por HTTP durante desenvolvimento;
- abrir `diario.html` diretamente no sistema de arquivos tende a gerar erros de CORS;
- isso vale tanto para a migração quanto para o estado atual, já que `diario.html` já usa `type="module"`.

Conclusão:

- o guia de desenvolvimento deve passar a assumir servidor local como requisito padrão, não como observação opcional.

#### 2.6.2 `type="module"` já existe e deve ser assumido como baseline

No HTML do diário, a aplicação já carrega scripts como módulo. Isso traz consequências úteis:

- scripts de módulo entram em strict mode automaticamente;
- não precisam de `defer`, porque já são diferidos automaticamente;
- são executados uma única vez;
- `import` e `export` passam a ser válidos no entry point.

Conclusão:

- a migração pode preservar o carregamento atual por `type="module"` e substituir o corpo monolítico por imports progressivos.

#### 2.6.3 Fallback para browsers antigos é escolha de produto, não obrigação automática

Se a equipe quiser manter um fallback explícito para navegadores sem suporte a módulos ES, existem dois caminhos:

1. aceitar baseline moderno e não manter fallback;
2. oferecer `nomodule` com build/transpilação alternativa ou bundle clássico.

Na prática do iScrev Notes, a segunda opção só vale a pena se houver um requisito explícito de suporte a ambientes antigos. Caso contrário, o custo tende a ser maior do que o benefício.

#### 2.6.4 Import maps podem ajudar, mas não devem ser o primeiro passo

Import maps são úteis para:

- tornar imports mais legíveis;
- reduzir acoplamento a caminhos longos;
- criar aliases estáveis;
- facilitar substituição de versões/nomes sem tocar nos importadores.

Mas há duas ressalvas para este projeto:

1. o app atual usa caminhos locais simples, então a primeira migração pode viver bem só com imports relativos;
2. import maps não se aplicam da mesma forma ao service worker, e o app ainda tem uma estratégia SW clássica.

Conclusão:

- recomenda-se adiar import maps para uma fase 2 de ergonomia, depois da extração dos módulos reais.

#### 2.6.5 Módulos sem bundler preservam portabilidade, mas podem piorar carregamento

O modelo “sem build” tem uma vantagem clara: simplicidade operacional. O código-fonte continua muito próximo do código executado em produção. Isso combina com a filosofia do projeto.

Porém, há um custo:

- um grande número de módulos não agrupados vira uma árvore maior de requisições;
- isso pode atrasar interatividade se a decomposição for excessiva;
- portanto, a modularização deve ser arquitetural, não atomização indiscriminada.

Conclusão:

- preferir poucos módulos coesos a dezenas de arquivos minúsculos;
- só considerar bundler quando a árvore modular realmente começar a afetar a entrega do app.

### 2.7 Implicações específicas para o service worker

O service worker atual é simples, clássico e funcional. Migrá-lo para módulos ES imediatamente não é prioridade recomendada.

Motivos:

1. o ganho estrutural é menor do que no `diario.js`;
2. a compatibilidade de modules em service workers ainda exige mais cuidado do que no contexto `window`;
3. imports em SW são estáticos, e import maps não se aplicam ali do mesmo modo;
4. o SW atual ainda é pequeno o bastante para permanecer clássico.

Recomendação:

- manter `service-worker.js` clássico durante a primeira fase da migração do app;
- só modularizá-lo depois que o contrato de cache, preload e publicação estiver revisado;
- se no futuro houver necessidade de compartilhar configuração de cache com o app, avaliar duas alternativas:
  - duplicação pequena e explícita;
  - geração por build;
  - ou SW em módulo com fallback deliberado.

### 2.8 Estratégia recomendada de migração

#### Fase 0 — Preparação sem alteração comportamental

- congelar um mapa de responsabilidades do `diario.js`;
- registrar bugs e trechos legados conhecidos;
- documentar dependências entre `Pen`, `Storage`, i18n, exportação e DOM;
- definir baseline de navegador suportado.

#### Fase 1 — Extração de módulos puros

Extrair primeiro o que já é quase independente:

- `storage.js`
- `markdown.js`
- `dates.js`
- `ids.js`
- `stats.js`

Objetivo:

- começar pela parte com menos dependência de eventos e DOM.

#### Fase 2 — Extração do módulo `Pen`

Transformar `Pen` em módulo ES explícito com interface injetável:

- dependências via parâmetros;
- API pública clara;
- sem leitura implícita de helpers globais.

Esse é o passo mais importante da migração técnica.

#### Fase 3 — Separação de UI e ações

Migrar:

- sidebar;
- toast;
- modal de equação;
- support modal;
- fullscreen.

Aqui o objetivo é reduzir o acoplamento entre UI e domínio.

#### Fase 4 — Orquestração de estado e bootstrap

Criar:

- `state.js`
- `actions.js`
- `bootstrap.js`

Nesse ponto, o entry point do app passa a ser pequeno e declarativo.

#### Fase 5 — Limpeza de legado

Só depois da migração estrutural:

- remover blocos comentados antigos;
- eliminar chamadas duplicadas de inicialização;
- corrigir pontos pendentes como importação Markdown e chaves de toast divergentes;
- revisar documentação para refletir a nova realidade.

### 2.9 Riscos que a modularização precisa evitar

#### A. Modularização cosmética

Separar arquivos sem reduzir acoplamento apenas espalha complexidade. O critério deve ser responsabilidade, não volume de linhas.

#### B. Quebrar o eixo crítico do editor

O diário depende de uma relação delicada entre:

- `editor-area`;
- `notebook-bg`;
- sincronização do SVG;
- `autoResizeTextarea`;
- cálculo de expansão do caderno;
- renderização de preview.

Esses elementos devem continuar migrando em conjunto conceitual.

#### C. Extrair UI antes de estabilizar o estado

Sem um núcleo mínimo de estado e ações, a UI modularizada tende a recriar acoplamento por canais indiretos e event listeners dispersos.

#### D. Migrar tudo para classes sem necessidade

Nem toda modularização exige classes. No caso do iScrev Notes:

- `Pen` pode justificar classe ou factory;
- `Storage` pode continuar como módulo funcional;
- vários utilitários e renderizadores ficam melhores como funções puras.

### 2.10 Arquitetura-alvo recomendada

O melhor alvo para o projeto, no curto e médio prazo, não é “frameworkizar” o app, e sim chegar a um browser-first modular architecture com estas propriedades:

- entry point pequeno;
- módulos ES carregados diretamente no browser;
- estado explícito;
- infraestrutura separada da UI;
- engine do editor desacoplada;
- código ainda legível sem build obrigatório;
- possibilidade futura de bundling opcional, e não obrigação imediata.

Esse alvo preserva a identidade do iScrev Notes: simplicidade, portabilidade, independência de stack pesada e foco em experiência.

### 2.11 Síntese final

O projeto já atingiu o ponto em que modularizar `diario.js` não é mais uma melhoria estética, mas uma medida de sustentabilidade técnica. A boa notícia é que a base atual já oferece pistas claras de como fazer isso: `Pen` e `Storage` já são quase módulos; o HTML já usa `type="module"`; e a arquitetura do produto já está separada por áreas funcionais no `src/`.

A migração recomendada é incremental, browser-first e sem refactor total de uma vez. O melhor caminho é: extrair utilitários puros, isolar persistência, formalizar `Pen`, separar UI da orquestração e só depois limpar o legado restante. Com isso, o projeto ganha legibilidade, previsibilidade de manutenção, melhor portabilidade arquitetural e uma base mais segura para evoluções futuras.

---

## 3. Leituras relacionadas

As referências externas e internas usadas nesta análise estão listadas em [REFERENCES.md](./REFERENCES.md).
