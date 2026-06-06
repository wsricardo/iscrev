# Módulo de Storage (`db.js`) - iScrev Notes

Este diretório contém a camada de infraestrutura de dados do iScrev Notes. O arquivo `db.js` é o responsável exclusivo por salvar, ler e deletar as notas do usuário diretamente no navegador, garantindo a premissa **Local-First** do aplicativo.

Abaixo, explicamos detalhadamente a arquitetura, os padrões de projeto (Design Patterns) e as metodologias aplicadas neste código.

---

## 1. Padrões de Projeto (Design Patterns)

O código foi desenhado utilizando dois padrões de projeto fundamentais para manter a organização e o baixo acoplamento:

### A. Padrão Facade (Fachada)
A API nativa do `IndexedDB` é poderosa, mas extremamente complexa. Ela exige a abertura de conexões, gerenciamento de versões, transações, cursores e escuta de eventos (callbacks). 

O padrão **Facade** serve para "esconder" toda essa complexidade atrás de uma interface simples (uma fachada). O restante do aplicativo (como o módulo de UI ou o Editor) não precisa saber o que é uma transação ou um *object store*. Eles apenas chamam `db.put(nota)` e o `db.js` faz todo o trabalho pesado nos bastidores.

### B. Singleton Nativo via ESM (ECMAScript Modules)
No passado, para garantir que apenas uma conexão com o banco de dados existisse, era necessário escrever lógicas complexas de "Singleton" (garantir uma única instância de um objeto). 

Hoje, ao usar módulos nativos do JavaScript (`import` / `export`), o próprio navegador resolve isso. Quando o arquivo `db.js` é importado pela primeira vez, ele é executado e as variáveis `let db` e `let useLocalStorage` ficam guardadas na memória. Se 10 arquivos diferentes importarem o `db.js`, todos eles compartilharão o mesmo escopo e a mesma conexão com o banco.

---

## 2. Metodologias e Lógicas Aplicadas

### Graceful Degradation (Degradação Graciosa) / Fallback
O módulo não assume que tudo vai dar certo. Alguns navegadores (como o Firefox em modo anônimo super estrito) podem bloquear o acesso ao `IndexedDB`.

Para evitar que o aplicativo quebre, implementamos o conceito de **Fallback**:
1. O `init()` tenta abrir o IndexedDB.
2. Se ocorrer um erro (`req.onerror`), ele não trava o app. Ele apenas emite um aviso (`console.error`), altera a variável de estado `useLocalStorage = true` e resolve a inicialização.
3. A partir desse momento, funções como `put()` e `getAll()` verificam essa variável e passam a salvar os dados silenciosamente no `localStorage`.

### Promises e Assincronicidade
Como a leitura de disco pelo navegador (IndexedDB) não é imediata, o JavaScript usa operações assíncronas. Todo o módulo `db.js` envelopa os eventos clássicos (`onsuccess`, `onerror`) em **Promises**. Isso permite que o restante do aplicativo use a sintaxe moderna e limpa `await db.init()` ou `.then()`.

---

## 3. Dissecação do Código

* **Variáveis de Estado (`db` e `useLocalStorage`):** Estão fora das funções exportadas. Como não têm a palavra `export` na frente, são privadas. Nenhum outro arquivo consegue modificá-las diretamente (Encapsulamento).
* **`init()`:** Responsável pelo *bootstrap* da conexão. O evento `onupgradeneeded` é engatilhado pelo navegador apenas se o banco não existir ou se a versão (`IDB_VERSION`) mudar. É aqui que criamos a "tabela" (`createObjectStore`).
* **`getAll()`, `put()`, `remove()`:** A API pública. Perceba que em todas elas a primeira coisa que o código faz é verificar `if (useLocalStorage)`. Se for verdadeiro, ele entra no bloco `try/catch` do `localStorage` padrão. Se for falso, ele desce para criar uma transação no `IndexedDB`.

---

## 4. Guia de Estudos

Para dominar completamente os conceitos utilizados neste arquivo, recomendamos os seguintes materiais:

### Sobre IndexedDB e Armazenamento no Navegador
* **MDN Web Docs: Usando IndexedDB**: O guia oficial da Mozilla. Essencial para entender os conceitos de banco de dados no lado do cliente.
* **Web.dev: Storage for the Web**: Artigo do Google sobre qual API de armazenamento escolher dependendo do caso de uso.

### Sobre Promises e Assincronicidade
* **MDN Web Docs: Usando Promises**: Explica como criar (`new Promise(resolve, reject)`) e consumir código assíncrono.
* **JavaScript.info: Promises**: Um tutorial iterativo muito didático sobre promessas, async e await.

### Sobre Padrões de Projeto em JavaScript
* **Refactoring.guru: Facade Pattern**: Explicação visual e teórica brilhante sobre o padrão Fachada.
* **JavaScript Modules (ESM)**: Como a exportação e importação nativa funcionam por baixo dos panos.

### Arquitetura "Local-First"
* **Local-first software**: O manifesto original (em inglês) da Ink & Switch que fundamenta a filosofia por trás de aplicativos como o iScrev Notes.