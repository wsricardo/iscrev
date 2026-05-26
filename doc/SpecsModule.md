# iScrev Notes — Especificação de Arquitetura Modular

> **Produto:** iScrev Notes  
> **Escopo:** Refatoração modular da aplicação principal (`diario.js`)  
> **Fontes:** `GUIDEModules.md`, `doc/cspecs/`, `doc/doc-tech.md`

---

## 1. Objetivo

Este documento estabelece a especificação técnica para a refatoração da aplicação iScrev Notes, atualmente concentrada no arquivo monolítico `src/assets/js/diario.js`, para uma **arquitetura modular baseada em ECMAScript Modules (ESM)**.

O objetivo principal não é estético, mas sim de **sustentabilidade técnica**. A modularização visa:
- **Reduzir o acoplamento:** Isolar responsabilidades para que mudanças em um subsistema (ex: `Storage`) não quebrem inesperadamente outro (ex: `Pen`).
- **Aumentar a coesão:** Agrupar códigos relacionados em módulos com fronteiras claras.
- **Melhorar a legibilidade e manutenção:** Facilitar a compreensão do código, o onboarding de novos contribuidores e a correção de bugs.
- **Habilitar testes e reuso:** Criar módulos com APIs explícitas que possam ser testados isoladamente e reutilizados.
- **Simplificar a adição de novas features:** Fornecer uma base organizada e segura para a evolução futura do produto.

Esta especificação consolida as recomendações do `GUIDEModules.md` e as aterra nos contratos concretos definidos nos `CSpecs`.

---

## 2. Diagnóstico da Arquitetura Atual

A aplicação principal, embora funcional e rica em recursos, concentra a vasta maioria de sua lógica em `src/assets/js/diario.js`. Este arquivo funciona como um **"módulo monolítico implícito"**, encapsulado em uma IIFE.

### 2.1 Responsabilidades Acopladas em `diario.js`

Conforme a análise do `GUIDEModules.md`, o arquivo único atualmente gerencia:
- Internacionalização (i18n)
- Renderização de Markdown e LaTeX
- O motor da caneta (`Pen`)
- A camada de persistência (`Storage`)
- O estado global da aplicação
- O CRUD das entradas
- Lógica de importação e exportação
- Gerenciamento do shell responsivo e da UI
- Vinculação de eventos e inicialização (bootstrap)

Este acoplamento elevado resulta em alto custo de leitura, risco de regressões e dificuldade de reuso.

### 2.2 Ponto de Partida

A migração não parte do zero. O projeto já utiliza `type="module"` em `diario.html` e depende de APIs de navegadores modernos. A base já é compatível com ESM; o que falta é a reorganização arquitetural para tirar proveito disso.

---

## 3. Arquitetura-Alvo Proposta

A arquitetura-alvo para o iScrev Notes é uma **"browser-first modular architecture"**. Isso significa que o projeto continuará a ser executado diretamente no navegador, sem um passo de *build* obrigatório, mas com seu código organizado em módulos ES nativos.

### 3.1 Princípios da Arquitetura-Alvo

- **Ponto de Entrada Mínimo:** O script carregado pelo HTML (`main.js`) deve ser pequeno e apenas orquestrar a inicialização.
- **Estado Explícito:** O estado da aplicação deve ser centralizado e gerenciado através de uma API clara, em vez de variáveis globais espalhadas.
- **Separação de Camadas:** A lógica deve ser dividida em camadas com responsabilidades distintas.
- **Código Legível:** A estrutura de arquivos deve refletir a arquitetura, tornando o código legível sem ferramentas complexas.

### 3.2 Camadas Arquiteturais

A refatoração seguirá a separação em cinco camadas conceituais:

#### A. Camada de Domínio
Responsável pelas regras e estruturas de dados centrais do aplicativo, independentes de tecnologia.
*Exemplos:* Modelo `Entry`, modelo `Stroke`, regras de validação, geradores de ID.

#### B. Camada de Infraestrutura
Responsável pela integração com APIs externas ao app, como as do navegador.
*Exemplos:* Módulo de storage (IndexedDB/localStorage), APIs de Fullscreen, Clipboard, FileReader.

#### C. Camada de Engine/Editor
Responsável pela mecânica do editor principal, mas desacoplada da UI final.
*Exemplos:* Motor da caneta (`Pen`), renderizador Markdown/KaTeX, exportador de PDF.

#### D. Camada de UI e Apresentação
Responsável por interagir com o DOM, renderizar componentes e gerenciar a apresentação visual.
*Exemplos:* Sidebar, toasts, modais, internacionalização da UI.

#### E. Camada de Orquestração
Responsável por conectar todas as outras camadas, gerenciar o estado da sessão e inicializar a aplicação.
*Exemplos:* Gerenciador de estado, ações do usuário (`newEntry`, `saveEntry`), bootstrap.

---

## 4. Estrutura de Módulos Específica

A seguir, a decomposição de `diario.js` em uma estrutura de diretórios e arquivos modular. Cada módulo deve aderir aos contratos definidos nos `CSpecs` correspondentes.

```text
src/assets/js/diario/
├── main.js                   // Ponto de entrada principal
├── app/
│   ├── bootstrap.js          // Orquestra a inicialização
│   ├── state.js                // Gerencia o estado (CSpec 02)
│   └── actions.js              // Ações de alto nível (CSpec 06)
├── ui/
│   ├── i18n.js                 // Lógica de internacionalização (CSpec 08)
│   ├── toast.js                // Módulo de notificações
│   ├── sidebar.js              // Lógica da sidebar e lista (CSpec 06)
│   ├── modes.js                // Controle dos modos (edit, pen, preview)
│   └── dialogs.js              // Gerenciador de modais (equação, apoio)
├── editor/
│   ├── markdown.js             // Renderizador Markdown/LaTeX (CSpec 04)
│   ├── pen.js                  // Motor da caneta (CSpec 05)
│   ├── notebook-surface.js     // Gerencia a superfície do caderno (CSpec 04)
│   ├── export-markdown.js      // Lógica de exportação .md (CSpec 07)
│   └── export-pdf.js           // Lógica de exportação .pdf (CSpec 07)
├── infra/
│   ├── storage.js              // Camada de persistência (CSpec 03)
│   ├── browser.js              // Helpers de APIs do browser (fullscreen, clipboard)
│   └── service-worker-register.js // Lógica de registro do SW
└── shared/
    ├── ids.js                  // Gerador de UID (CSpec 02)
    ├── dates.js                // Formatadores de data
    ├── events.js               // Hub de eventos customizados (se necessário)
    └── constants.js            // Constantes compartilhadas
```

### 4.1 Papel e Contrato dos Módulos Chave

- **`main.js`**: Substituirá `diario.js` em `diario.html`. Sua única função é importar e executar `app/bootstrap.js`.

- **`app/bootstrap.js`**: Orquestrará a sequência de inicialização descrita em `CSpec 06`, resolvendo as redundâncias atuais. Ele chamará `Storage.init()`, `Pen.init()`, `applyLocale()`, etc., na ordem correta.

- **`app/state.js`**: Exportará funções para acessar e modificar o estado (`getEntries`, `getCurrentId`, `setCurrentId`), encapsulando as variáveis globais `entries` e `currentId` e aderindo ao modelo de dados de `CSpec 02`.

- **`app/actions.js`**: Exportará funções como `createNewEntry`, `saveCurrentEntry`, `deleteCurrentEntry`. Essas ações orquestrarão chamadas para os módulos de estado, UI e infraestrutura, seguindo o ciclo de vida de `CSpec 06`.

- **`infra/storage.js`**: Será a extração direta do objeto `Storage` de `diario.js`. Sua API (init, getAll, put, remove) deve seguir estritamente o contrato de `CSpec 03`. Esta é a primeira e mais segura extração a ser feita.

- **`editor/pen.js`**: Será a extração do objeto `Pen`. Deve ser transformado em uma classe ou factory function que recebe suas dependências (callbacks, elementos DOM) via construtor ou método `init`, em vez de acessar globais. Sua API pública e geometria devem respeitar `CSpec 05`.

- **`editor/markdown.js`**: Conterá as funções `mdToHtml`, `renderTex`, etc., seguindo o pipeline de `CSpec 04`.

- **`ui/i18n.js`**: Conterá o dicionário `I18N` e as funções `t()` e `applyLocale()`, conforme `CSpec 08`. `applyLocale` deverá emitir eventos ou usar callbacks para notificar outros módulos da UI sobre a necessidade de re-renderização, em vez de chamá-los diretamente.

- **`ui/sidebar.js`**: Gerenciará a renderização da lista de entradas, o filtro de busca e o comportamento responsivo da sidebar, conforme `CSpec 01` e `CSpec 06`.

---

## 5. Estratégia de Migração Incremental

A refatoração não deve ser um "big bang". Ela deve seguir uma estratégia faseada para minimizar riscos e permitir validação contínua. A ordem recomendada, baseada em `GUIDEModules.md`, é:

#### **Fase 0: Preparação**
- Congelar o desenvolvimento de novas features.
- Garantir que o ambiente de desenvolvimento use um servidor local, pois `file://` não funcionará com módulos ES.
- Validar que o checklist de regressão manual de `CSpec 09` está atualizado.

#### **Fase 1: Extração de Módulos Puros e de Infraestrutura**
1.  Criar `infra/storage.js` e migrar o objeto `Storage`. Atualizar `diario.js` para importar e usar este módulo.
2.  Criar módulos em `shared/` (`ids.js`, `dates.js`) e `editor/markdown.js`. Substituir as funções em `diario.js` por importações.
*Objetivo:* Começar pelas partes com menor acoplamento com o DOM e o estado da UI.

#### **Fase 2: Extração do Motor da Caneta (`Pen`)**
1.  Criar `editor/pen.js`.
2.  Refatorar `Pen` para receber suas dependências (como `showToast`, `t`, e o callback de `_onStrokesChange`) via injeção de dependência.
3.  Atualizar `diario.js` para instanciar e configurar o módulo `Pen`.
*Objetivo:* Isolar o componente mais complexo da aplicação.

#### **Fase 3: Separação da UI**
1.  Extrair `ui/i18n.js`, `ui/toast.js`, `ui/sidebar.js` e `ui/dialogs.js`.
2.  Refatorar esses módulos para que operem em seus respectivos elementos DOM (`#sidebar`, `#toast`, etc.) e se comuniquem com o resto do app via eventos ou callbacks, não por chamadas diretas a funções de negócio.
*Objetivo:* Desacoplar a lógica de apresentação do domínio e das ações.

#### **Fase 4: Orquestração de Estado e Ações**
1.  Criar `app/state.js` para gerenciar o estado.
2.  Criar `app/actions.js` para conter a lógica de orquestração do CRUD.
3.  Refatorar o restante de `diario.js` para se tornar `app/bootstrap.js`, que apenas conecta as peças.
*Objetivo:* Explicitar o fluxo de dados e o controle da aplicação.

#### **Fase 5: Limpeza Final**
1.  Após a migração, renomear o `diario.js` original e criar o `main.js` final.
2.  Remover código legado, comentários obsoletos e chamadas duplicadas na inicialização.
3.  Atualizar toda a documentação para refletir a nova arquitetura.

---

## 6. Riscos e Regras a Serem Observadas

A modularização deve seguir critérios arquiteturais, não estéticos.

### 6.1 Riscos a Evitar

- **Modularização Cosmética:** Apenas mover código para outros arquivos sem reduzir o acoplamento real. Os módulos devem ser coesos e independentes.
- **Quebrar o Eixo Crítico do Editor:** A relação geométrica entre `.editor-area`, `#entry-preview` e `#pen-svg` é delicada e fundamental para o alinhamento dos traços. Esses elementos devem ser migrados em conjunto conceitual, respeitando `CSpec 04` e `CSpec 05`.
- **Abuso de Classes:** Nem todo módulo precisa ser uma classe. `Storage` e `markdown` funcionam bem como módulos de funções puras. `Pen` pode ser uma classe ou uma factory. A forma deve seguir a função.

### 6.2 Regras de Mudança

1.  **Contrato de DOM:** Qualquer alteração nos IDs e classes listados em `CSpec 01` deve ser refletida nos módulos de UI correspondentes.
2.  **Contrato de Dados:** A estrutura de `Entry` e `Stroke` (`CSpec 02`) e o protocolo de import/export (`CSpec 07`) são as APIs de dados do sistema. Módulos não devem violá-las.
3.  **Service Worker:** O `service-worker.js` pode permanecer como um script clássico em um primeiro momento. Sua modularização é uma tarefa separada e de menor prioridade, conforme discutido em `GUIDEModules.md`.

---

## 7. Conclusão

A transição para uma arquitetura modular é o passo natural e necessário para garantir a longevidade e a qualidade do iScrev Notes. Ao seguir esta especificação, que une a visão de futuro do `GUIDEModules.md` com a realidade concreta dos `CSpecs`, o projeto ganhará uma base de código mais legível, previsível e robusta.

O resultado final preservará a filosofia do iScrev Notes — simplicidade, portabilidade e foco na experiência — enquanto habilita um ciclo de desenvolvimento mais seguro e ágil para o futuro.

---

## 8. Leituras Relacionadas

- `doc/GUIDEModules.md`
- `doc/cspecs/00-overview.md` a `09-quality-attributes-and-change-rules.md`
- `doc/REFERENCES.md`