# Especificação Técnica — 02. Camada de Persistência (Storage)

Este documento especifica a camada de abstração de persistência, encapsulada no módulo `Storage`.

---

## 1. Visão Geral

O módulo `Storage` fornece uma API unificada e baseada em Promises para interagir com o armazenamento do navegador. Ele abstrai a complexidade de lidar com IndexedDB e `localStorage`, permitindo que o resto da aplicação opere de forma agnóstica em relação ao backend de armazenamento ativo.

## 2. Estratégia de Persistência

O `Storage` implementa uma estratégia de duas camadas com fallback transparente:

1.  **Primária (IndexedDB):** A primeira tentativa é sempre usar a API IndexedDB, que é mais robusta, assíncrona e adequada para armazenar objetos maiores e em maior quantidade (como entradas com muitos traços manuscritos).
2.  **Fallback (`localStorage`):** Se o IndexedDB não estiver disponível (e.g., modo de navegação privada em alguns navegadores antigos) ou falhar na inicialização, o módulo automaticamente passa a operar sobre o `localStorage`.

A aplicação é notificada sobre erros de quota no `localStorage` através de um evento customizado (`storage:quota-exceeded`), permitindo que a UI reaja adequadamente.

## 3. API Pública

A API do módulo `Storage` é 100% assíncrona e baseada em Promises.

### `Storage.init(): Promise<void>`

Inicializa a camada de persistência. Tenta abrir o banco de dados IndexedDB. Em caso de falha, configura o modo de fallback para `localStorage`. Também executa a migração de dados legados do `localStorage` para o IndexedDB na primeira execução bem-sucedida.

### `Storage.getAll(): Promise<Entry[]>`

Retorna uma Promise que resolve com um array de todos os objetos `Entry` armazenados.

### `Storage.put(entry: Entry): Promise<void>`

Salva (insere ou atualiza) um único objeto `Entry`. A operação é um "upsert": se uma entrada com o mesmo `entry.id` já existe, ela é substituída; caso contrário, é criada.

### `Storage.remove(id: string): Promise<void>`

Remove uma `Entry` do armazenamento com base no seu `id`.

### `Storage.backend(): 'indexeddb' | 'localstorage'`

Retorna uma string indicando qual mecanismo de armazenamento está atualmente em uso. Útil para diagnóstico e depuração.

## 4. Migração Automática

Na primeira vez que `Storage.init()` consegue acesso ao IndexedDB, a função `migrateFromLocalStorage()` é chamada. Ela lê todas as entradas da chave legada no `localStorage` (`meu_diario_v2`), as insere no IndexedDB e, em seguida, define uma flag (`meu_diario_migrated`) no `localStorage` para garantir que a migração não seja executada novamente.