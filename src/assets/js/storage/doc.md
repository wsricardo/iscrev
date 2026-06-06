# Documentação da API: Módulo Storage (`db.js`)

## 1. Visão Geral

O módulo `db.js` é uma abstração assíncrona (baseada inteiramente em *Promises*) responsável pela persistência de dados local-first do **iScrev Notes**. 

Ele implementa o padrão **Facade**, escondendo a complexidade das transações do `IndexedDB` e gerenciando automaticamente um *fallback* (plano B) para o `localStorage` caso o navegador do usuário restrinja bancos de dados mais robustos (como em abas anônimas estritas).

---

## 2. Tabela de Referência da API

Abaixo está o resumo de todas as funções públicas exportadas pelo módulo para serem consumidas pela aplicação (ex: `core/actions.js` ou `core/bootstrap.js`).

| Função | Descrição Principal | Parâmetros (Dados de Entrada) | Retorno (Dados de Saída) |
| :--- | :--- | :--- | :--- |
| **`init()`** | Abre a conexão com o IndexedDB e cria o esquema caso não exista. Ativa o *fallback* se falhar. | *Nenhum* | `Promise<void>` |
| **`getAll()`** | Lê e retorna todo o histórico de notas salvas no dispositivo do usuário. | *Nenhum* | `Promise<Array<Entry>>` |
| **`put(entry)`**| Insere uma nova nota ou atualiza uma existente (Upsert) baseando-se no `id`. | `entry` *(Object)*: A nota completa. | `Promise<void>` |
| **`remove(id)`**| Deleta permanentemente uma nota do banco de dados a partir de seu ID. | `id` *(String)*: O ID único da nota. | `Promise<void>` |
| **`getBackend()`**| Função utilitária/diagnóstica que informa qual sistema de armazenamento está em uso. | *Nenhum* | `String` (`'indexeddb'` ou `'localstorage'`) |

---

## 3. Estrutura de Dados Envolvida (`Entry`)

As funções de gravação e leitura operam sobre a entidade principal do sistema, a `Entry` (Nota/Entrada). O banco de dados utiliza a propriedade `id` como **KeyPath** (chave primária).

Espera-se que o objeto `entry` trafegado pelo módulo possua a seguinte estrutura padrão:

```javascript
{
  id: "l5hxj9z0g8",           // (String) ID único gerado pela aplicação
  title: "Minha Reunião",     // (String) Título em texto puro
  body: "Anotações...",       // (String) Corpo cru contendo Markdown/LaTeX
  mood: "😊",                 // (String) Emoji representando o humor
  strokes: [                  // (Array) Traços do desenho SVG (Caneta)
    { pts: [,], c: "#1a1209", w: 2.5 }
  ],
  createdAt: "2026-05-31T18:32:03Z", // (String) Data de criação ISO
  updatedAt: "2026-05-31T18:32:03Z"  // (String) Data da última modificação ISO
}
```

---

## 4. Detalhamento das Funções

### `init()`
Deve ser a **primeira função a ser chamada** durante o ciclo de inicialização (bootstrap) do aplicativo, antes de qualquer operação de leitura ou escrita.

* **Comportamento:** Tenta abrir o banco `meu_diario_db`. Se não existir, cria a tabela `entries` com índice baseado em `id`.
* **Tratamento de Erro:** Nunca rejeita a Promise. Se o `IndexedDB` falhar (por restrição de privacidade ou disco), loga um aviso no console e redireciona todo o fluxo para `localStorage`.
* **Exemplo de uso:**
  ```javascript
  import * as db from './storage/db.js';
  await db.init();
  console.log("Banco de dados pronto!");
  ```

### `getAll()`
Recupera todas as anotações guardadas para preencher a interface ou a memória (Estado).

* **Comportamento:** Abre uma transação *readonly* no IndexedDB ou realiza o parsing (JSON) dos dados do localStorage.
* **Tratamento de Erro:** Em caso de corrupção do localStorage (JSON inválido), captura o erro silenciosamente e retorna uma lista vazia `[]` em vez de quebrar o app.
* **Exemplo de uso:**
  ```javascript
  const minhasNotas = await db.getAll();
  state.entries = minhasNotas;
  ```

### `put(entry)`
Salva as modificações no disco. Atua como um *Upsert*: insere se não existir, sobrescreve se já existir.

* **Comportamento:** Abre uma transação *readwrite*. O reconhecimento de "atualização" é feito automaticamente pelo IndexedDB baseando-se no `entry.id`. No fallback (`localStorage`), lê a array inteira, substitui o objeto e salva novamente.
* **Eventos:** No modo `localStorage`, se atingir o limite de espaço em disco (aprox. 5MB na web), dispara um evento global `storage:quota-exceeded` para a UI reagir.
* **Exemplo de uso:**
  ```javascript
  minhaNota.title = "Título Atualizado";
  minhaNota.updatedAt = new Date().toISOString();
  await db.put(minhaNota);
  ```

### `remove(id)`
Purga os dados de uma nota do armazenamento local.

* **Comportamento:** Abre transação *readwrite* e deleta o registro que corresponde ao `id` passado.
* **Exemplo de uso:**
  ```javascript
  await db.remove("l5hxj9z0g8");
  ```

### `getBackend()`
Informa em tempo real qual engine de persistência o módulo está utilizando. 

* **Retorno:** Pode ser útil caso a aplicação deseje exibir um aviso de "Modo de armazenamento limitado" caso retorne `'localstorage'`.
* **Exemplo de uso:**
  ```javascript
  console.log("Atualmente usando: " + db.getBackend());
  // Saída: Atualmente usando: indexeddb
  ```