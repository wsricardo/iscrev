# CSpec 03 — Persistência e Migração

## 1. Objetivo

Especificar a camada de persistência atual, seus fallbacks e o processo de migração de dados legados.

## 2. Módulo responsável

O contrato é implementado pela IIFE `Storage` em `src/assets/js/diario.js`.

API pública:

- `Storage.init(): Promise<void>`
- `Storage.getAll(): Promise<Entry[]>`
- `Storage.put(entry: Entry): Promise<void>`
- `Storage.remove(id: string): Promise<void>`
- `Storage.backend(): 'indexeddb' | 'localstorage'`

## 3. Estratégia de backend

### 3.1 Backend preferencial

O sistema deve tentar IndexedDB primeiro.

### 3.2 Fallback

Se IndexedDB estiver indisponível, falhar ao abrir, ou ficar bloqueado, o sistema deve continuar operando com `localStorage`.

### 3.3 Requisito funcional

O restante da aplicação não deve depender diretamente de qual backend está ativo. Essa abstração é responsabilidade do módulo `Storage`.

## 4. Inicialização

`Storage.init()` segue esta sequência:

1. verifica `window.indexedDB`;
2. se indisponível, marca `ready` e resolve em modo fallback;
3. se disponível, abre `meu_diario_db` na versão `1`;
4. em `onupgradeneeded`, cria `entries` com `keyPath: 'id'` se necessário;
5. em `onsuccess`, armazena a instância `db`;
6. em `onerror` ou `onblocked`, cai silenciosamente para fallback.

## 5. Semântica das operações

### 5.1 `getAll()`

- em IndexedDB, usa `objectStore.getAll()`;
- em fallback, desserializa `localStorage['meu_diario_v2']`;
- se o JSON do fallback estiver corrompido, retorna array vazio.

### 5.2 `put(entry)`

- em IndexedDB, usa `put`, portanto faz upsert por `id`;
- em fallback, procura `entry.id`;
  - se existir, substitui;
  - se não existir, insere no início do array;
- quota excedida no fallback dispara evento customizado.

### 5.3 `remove(id)`

- em IndexedDB, usa `delete(id)`;
- em fallback, filtra o array e salva novamente.

## 6. Eventos de erro observáveis

O módulo usa eventos no `document` para sinalizar problemas ao app:

- `storage:quota-exceeded`
- `storage:error`

### 6.1 Requisito

Mudanças futuras podem enriquecer a telemetria interna, mas não devem remover esses eventos sem substituir seu papel na UX.

## 7. Migração automática

Após `Storage.init()`, o bootstrap chama `migrateFromLocalStorage()`.

### 7.1 Condições de execução

A migração só ocorre quando:

- o backend ativo é `indexeddb`;
- a flag `meu_diario_migrated` ainda não existe;
- `localStorage['meu_diario_v2']` contém dados legíveis.

### 7.2 Procedimento

1. ler o JSON legado;
2. converter para array;
3. executar `Storage.put(e)` para cada entrada;
4. gravar `meu_diario_migrated = '1'`;
5. manter os dados do `localStorage` como backup.

### 7.3 Requisito

A migração é idempotente por meio da flag. Não deve haver limpeza destrutiva automática do backup legado sem decisão explícita de produto.

## 8. Persistência incremental

O estado atual da aplicação não salva o array inteiro a cada alteração. Em vez disso:

- `saveEntry_store(entry)` persiste apenas a entrada alterada;
- `removeEntry_store(id)` remove apenas a entrada-alvo;
- `Pen._onStrokesChange` persiste apenas a entrada corrente.

Isto é requisito de eficiência e deve ser preservado em refactors.

## 9. Resiliência

O contrato atual privilegia disponibilidade:

- falha do IndexedDB não bloqueia o app;
- corrupção do fallback não quebra o bootstrap;
- falha de `pen_strokes` em importação não invalida o texto da nota.

## 10. Riscos conhecidos

- IndexedDB e `localStorage` não compartilham transações;
- `localStorage` é limitado em tamanho e síncrono;
- não há checksum nem versionamento próprio das entradas além do protocolo de traços;
- a dupla chamada de `loadData()` no bootstrap é redundante e deve ser tratada como dívida técnica, não como requisito.

## 11. Critérios de aceitação para mudanças

1. O app continua abrindo sem backend remoto.
2. Entradas antigas continuam legíveis após upgrade.
3. Falhas de quota no fallback continuam emitindo feedback ao usuário.
4. O bootstrap continua funcional quando IndexedDB falha.
