# Guia de Migração para Arquitetura Modular do iScrev Notes

> **Propósito:** Discutir e definir a refatoração do `diario.js` para uma arquitetura baseada em módulos ES6, visando aumentar a manutenibilidade, facilitar a implementação de novas features e preparar o projeto para o futuro.

---

## 1. Diagnóstico e Motivação

A arquitetura atual do iScrev Notes, centrada no arquivo monolítico `src/assets/js/diario.js`, foi crucial para o rápido desenvolvimento e validação do produto. No entanto, com o amadurecimento do projeto, essa estrutura apresenta desafios:

*   **Alto Custo Cognitivo:** A densidade de responsabilidades em um único arquivo dificulta o entendimento do fluxo de dados e o impacto de alterações.
*   **Forte Acoplamento:** Módulos conceituais como `Pen`, `Storage` e o renderizador de Markdown estão fortemente acoplados ao DOM e ao estado global, tornando o teste isolado e o reuso de código quase impossíveis.
*   **Risco de Regressão:** Uma mudança em uma funcionalidade (ex: exportação) pode quebrar outra (ex: renderização da caneta) de forma inesperada.

A migração para uma arquitetura modular é um passo estratégico para garantir a saúde do código a longo prazo e destravar o potencial para novas funcionalidades, como:

*   Suporte a imagens e outros formatos de mídia.
*   Importação/Exportação para formatos como Opendocument (ODF).
*   Geração e inserção de gráficos e diagramas.
*   Suporte avançado a LaTeX.

## 2. Objetivos da Refatoração

*   **Isolar Responsabilidades:** Cada módulo deve ter um propósito claro e único.
*   **Definir Contratos Claros:** A comunicação entre os módulos deve ocorrer por meio de APIs (funções e objetos exportados), não pela manipulação de variáveis globais.
*   **Melhorar a Manutenibilidade:** Tornar o código mais fácil de ler, depurar e modificar.
*   **Facilitar Testes:** Permitir que a lógica de negócio (ex: `Storage`) seja testada de forma independente da UI.
*   **Adotar Padrões Modernos:** Utilizar módulos ES6 de forma consistente, alinhando o projeto às práticas atuais de desenvolvimento web.

## 3. Proposta de Estrutura de Módulos

A sugestão é quebrar o `diario.js` em uma estrutura de diretórios que separe lógica de negócio, manipulação de UI e o estado da aplicação.

```text
js/
|-- main.js               # Ponto de entrada: orquestra a inicialização
|
|-- core/
|   |-- storage.js        # Abstração do IndexedDB com fallback para localStorage
|   |-- i18n.js           # Dicionário e funções de internacionalização
|   |-- entry.js          # Definição do modelo de dados (Entry, Stroke)
|   `-- utils.js          # Funções utilitárias puras (uid, formatadores de data)
|
|-- editor/
|   |-- editor.js         # Gerencia o estado da entrada atual (currentId) e orquestra ações
|   |-- markdown.js       # Parser de Markdown e renderizador de LaTeX (via KaTeX)
|   |-- pen.js            # Módulo da caneta SVG (desenho, borracha, pan)
|   `-- io.js             # Lógica de importação e exportação (Markdown, PDF)
|
|-- ui/
    |-- shell.js          # Gerencia o layout principal, sidebar e modo responsivo
    |-- toolbar.js        # Constrói e gerencia eventos das toolbars
    |-- modes.js          # Controla a alternância entre os modos (edit, pen, preview)
    |-- modals.js         # Lógica para os modais (equação, confirmação)
    `-- toast.js          # Sistema de notificações (toast)
```

### Responsabilidades:

*   **`main.js`**: Substituirá o bloco de inicialização no final do `diario.js`. Será responsável por importar os módulos necessários, inicializar o `storage`, carregar os dados, montar a UI e "ligar" a aplicação.
*   **`core/`**: Conterá a lógica de negócio mais fundamental e desacoplada da UI. O `storage.js` e o `i18n.js` são candidatos perfeitos para serem os primeiros módulos extraídos.
*   **`editor/`**: Conterá a lógica central da experiência de edição. O `pen.js` já é um "módulo dentro de um módulo" e pode ser movido com poucas alterações em sua API pública. O `io.js` cuidará da complexidade de lidar com formatos de arquivo.
*   **`ui/`**: Agrupará todos os módulos que manipulam diretamente o DOM e gerenciam a interface do usuário. Isso separa a "aparência" do "funcionamento".

## 4. Roteiro de Migração Gradual

A refatoração não precisa ser um "big bang". Podemos seguir um caminho iterativo e seguro:

1.  **Extrair `storage.js`:** Mover a IIFE `Storage` para `core/storage.js` e exportar sua API pública. O `diario.js` passará a importar e usar este módulo.
2.  **Extrair `i18n.js`:** Mover o objeto `I18N` e as funções `t()` e `applyLocale()` para `core/i18n.js`.
3.  **Extrair `pen.js`:** Mover a IIFE `Pen` para `editor/pen.js`. Sua API já é bem definida, o que facilita a migração.
4.  **Criar `main.js`:** Começar a mover a lógica de inicialização do `diario.js` para o `main.js`, que passará a ser o script principal carregado pelo `diario.html`.
5.  **Refatorar o restante:** Com a base estabelecida, continuar a quebrar as seções restantes do `diario.js` nos módulos propostos (`ui/shell.js`, `editor/markdown.js`, etc.), substituindo gradualmente o código antigo por chamadas aos novos módulos.

## 5. Preparando para o Futuro: Um Ambiente Robusto para Estudo e Escrita

Esta nova arquitetura não é apenas uma organização de código; é a fundação para transformar o iScrev Notes em uma ferramenta de pensamento ainda mais poderosa.

#### **Escrita Técnica e Criativa:**
A separação clara entre o modelo de dados (`entry.js`), a lógica de renderização (`markdown.js`) e a de exportação (`io.js`) torna o sistema mais previsível e confiável. Isso é vital tanto para quem escreve um romance, que precisa de estabilidade, quanto para quem escreve um documento técnico, que depende da precisão da renderização.

#### **Suporte a Imagens e Gráficos:**
Com a nova estrutura, podemos criar um módulo `editor/media.js`. Sua responsabilidade seria gerenciar a inserção, o armazenamento (seja como base64 no `IndexedDB` ou como links) e a renderização de imagens ou gráficos SVG gerados. Isso evita sobrecarregar o `pen.js` ou o `markdown.js` com uma lógica que não lhes pertence.

#### **Suporte a Opendocument e LaTeX Avançado:**
A adição de novos formatos de importação/exportação se torna trivial. Bastaria adicionar um novo "parser" dentro do `editor/io.js` (ou em um diretório `formats/`) que saiba converter de/para ODF. Da mesma forma, se quisermos integrar um motor LaTeX mais potente no futuro, a mudança ficaria contida no `editor/markdown.js`, sem afetar o resto da aplicação.

---

### Conclusão

A migração para uma arquitetura modular é o próximo passo natural na evolução do iScrev Notes. É um investimento que pagará dividendos em forma de um desenvolvimento mais rápido, seguro e prazeroso. Ao abraçar essa mudança, preparamos o terreno para que o iScrev Notes não apenas continue a ser um espaço de escrita acolhedor, mas também se torne uma plataforma robusta e versátil para a construção do conhecimento.