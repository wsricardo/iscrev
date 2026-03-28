# iScrev Notes - Documentacao Tecnica Atual

## 1. Visao geral

O projeto hoje e composto por duas camadas principais:

1. Uma camada institucional com paginas de apresentacao em PT-BR e EN.
2. Uma aplicacao principal de diario digital em `diario.html`.

O nome atual do produto e **iScrev Notes**.

O repositorio nao esta mais no estado descrito pelas documentacoes antigas baseadas em "single-file puro". A versao atual usa arquivos separados para HTML, CSS e JavaScript, e combina conteudo institucional com a aplicacao do diario.

---

## 2. Estrutura atual em `src/`

```text
src/
|-- index.html
|-- sobre.html
|-- en.html
|-- about.html
|-- diario.html
|-- DOCUMENTACAO.md
|-- Doc-old.md
|-- diario-backup.js
|-- diario-old.css
`-- assets/
    |-- css/
    |   |-- style.css
    |   `-- diario.css
    `-- js/
        |-- diario.js
        `-- ui.js
```

### Papel de cada arquivo principal

- `index.html`: home institucional em portugues.
- `sobre.html`: pagina institucional "sobre" em portugues.
- `en.html`: home institucional em ingles.
- `about.html`: pagina institucional "about" em ingles.
- `diario.html`: interface principal do app de diario.
- `assets/css/style.css`: estilo compartilhado das paginas institucionais.
- `assets/css/diario.css`: estilo da aplicacao do diario.
- `assets/js/diario.js`: logica principal do diario.
- `assets/js/ui.js`: comportamento pequeno de interface, hoje focado no toggle da sidebar.
- `Doc-old.md`: documentacao anterior preservada como historico.

---

## 3. Camada institucional

As paginas institucionais foram redesenhadas para conversar visualmente com o diario principal, mas sem copiar a interface do editor.

### Paginas

- `index.html`: apresenta o produto, beneficios, fluxo e CTA para abrir `diario.html`.
- `sobre.html`: explica proposta, principios e publico-alvo.
- `en.html`: equivalente em ingles da home.
- `about.html`: equivalente em ingles da pagina sobre.

### Estilo visual

O arquivo `assets/css/style.css` usa uma linguagem alinhada ao `diario.css`:

- fundos em tons de papel quente;
- acentos ambar e ferrugem;
- tipografia editorial com `Playfair Display`, `Lora`, `Dancing Script` e `JetBrains Mono`;
- cartoes suaves, bordas discretas e sombras leves;
- navegacao com alternancia PT/EN;
- CTA principal apontando para `diario.html`.

### Objetivo da camada institucional

Essa camada existe para:

- apresentar o iScrev Notes como produto;
- explicar rapidamente a proposta;
- criar uma entrada mais clara para o diario;
- manter navegacao simples entre conteudo institucional e aplicacao.

---

## 4. Aplicacao principal do diario

O app principal continua em `diario.html`, com estilos em `assets/css/diario.css` e logica em `assets/js/diario.js`.

### Funcionalidades centrais

- criacao e edicao de entradas;
- modo editar, caneta e preview;
- Markdown basico;
- renderizacao LaTeX com KaTeX;
- anotações manuscritas em SVG;
- busca de entradas;
- mood por emoji;
- importacao e exportacao em Markdown;
- exportacao em PDF via `window.print()`;
- troca de idioma PT/EN;
- fullscreen;
- persistencia local.

### Estrutura visual do diario

`diario.html` e organizado em:

- sidebar;
- tela principal;
- toolbar de edicao;
- toolbar da caneta;
- area de edicao com visual de caderno;
- modal de equacoes;
- toast de notificacao.

### Identidade visual do diario

`assets/css/diario.css` define a identidade-base do produto:

- papel quente (`--paper`);
- tinta escura (`--ink`);
- destaque ambar (`--warm`);
- tom ferrugem (`--rust`);
- visual de caderno com linhas e margem vertical;
- componentes com aparencia acolhedora e analogica.

---

## 5. JavaScript do diario

O arquivo `assets/js/diario.js` concentra quase toda a logica do app.

### Modulos ou blocos mais importantes

- i18n estatico PT/EN;
- renderizacao Markdown + LaTeX;
- modulo `Pen` para desenho SVG;
- modulo `Storage` para persistencia;
- CRUD de entradas;
- import/export;
- fullscreen;
- atalhos de teclado;
- inicializacao da aplicacao.

### Persistencia

O projeto nao esta mais apenas em `localStorage`.

Hoje a logica de persistencia usa:

1. `IndexedDB` quando disponivel.
2. `localStorage` como fallback.

No codigo, isso aparece no modulo `Storage`.

### Arquivos de apoio

- `assets/js/ui.js`: hoje controla o esconder/mostrar da sidebar.
- `diario-backup.js`: snapshot legado de JS.
- `diario-old.css`: snapshot legado de CSS.

---

## 6. Fluxos principais do app

### Criar e editar

1. Usuario cria uma nova entrada.
2. O app abre a entrada no editor.
3. Texto, mood e tracos podem ser alterados.
4. O salvamento acontece por acoes diretas e por autosave.

### Desenhar

1. Usuario muda para modo caneta.
2. O SVG sobreposto passa a capturar eventos.
3. O modulo `Pen` cria e persiste os tracos.

### Exportar

- Markdown: gera arquivo `.md` com front matter.
- PDF: usa preview renderizado e `window.print()`.

### Importar

1. Usuario escolhe um `.md`.
2. O front matter e lido.
3. Texto, mood e tracos sao reconstruidos.
4. A nova entrada e aberta no diario.

---

## 7. Internacionalizacao

O projeto hoje tem duas frentes de idioma:

### Paginas institucionais

- portugues: `index.html` e `sobre.html`
- ingles: `en.html` e `about.html`

### Diario

O diario usa i18n interno em `assets/js/diario.js`, com troca de idioma por botoes na sidebar.

O nome do app foi padronizado para **iScrev Notes** tanto em PT quanto em EN.

---

## 8. Dependencias externas

Mesmo sendo um projeto simples de frontend, o app depende de CDNs para alguns recursos:

- Google Fonts;
- KaTeX CSS;
- KaTeX JS.

Isso significa que a experiencia nao e totalmente "offline puro" em todas as situacoes, principalmente na primeira carga sem cache.

---

## 9. Estado tecnico atual

Esta documentacao descreve o estado real do projeto melhor do que a documentacao antiga, mas ainda existem pontos tecnicos de atencao:

- o repositorio mistura camada institucional nova com historico antigo;
- ha arquivos legados mantidos por seguranca e referencia;
- o `diario.js` ainda carrega historico de refatoracao e blocos comentados;
- a migracao para `Storage` convive com restos de codigo legado e deve ser consolidada;
- a pasta `doc/` ainda guarda documentacoes antigas de outras fases do projeto.

Em outras palavras: a identidade visual e a estrutura de entrada do produto ja estao mais consistentes, mas o nucleo do diario ainda merece uma rodada de consolidacao tecnica.

---

## 10. Recomendacoes para manutencao

### Curto prazo

- consolidar a camada de persistencia no diario;
- revisar inicializacao do app para remover duplicidade;
- alinhar toasts, chaves de i18n e funcoes legadas;
- revisar `ui.js` e decidir se ele continua separado.

### Medio prazo

- atualizar os arquivos em `doc/` para refletirem a arquitetura atual;
- decidir o que permanece como legado e o que pode ser removido;
- avaliar uma pequena organizacao por modulos no JS do diario.

### Conteudo e produto

- manter as paginas institucionais sincronizadas com o estado real do app;
- usar sempre o nome `iScrev Notes`;
- preservar a linguagem visual centrada em papel, ambar e ferrugem suave.

---

## 11. Historico local

O arquivo anterior de documentacao foi preservado como:

`src/Doc-old.md`

Ele serve como referencia historica, mas nao deve mais ser tratado como fonte principal sobre o estado atual do projeto.
