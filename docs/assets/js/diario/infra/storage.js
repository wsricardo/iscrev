

/* ══════════════════════════════════════════════════════════════════
   SEÇÃO 2.5 — MÓDULO DE ARMAZENAMENTO (Storage)

   Abstrai IndexedDB com fallback transparente para localStorage.
   A API pública é inteiramente baseada em Promises — o chamador
   nunca lida com a implementação subjacente.

   Hierarquia de decisão:
     1. IndexedDB disponível e inicializado → usa IDB
     2. IDB indisponível ou falha na abertura → usa localStorage
     3. localStorage também falha (QuotaExceededError) → notifica

   O módulo é inicializado em Seção 15 (Inicialização) antes de
   loadData(), garantindo que a camada de persistência esteja pronta
   quando o restante da aplicação precisar dela.
══════════════════════════════════════════════════════════════════ */

export const Storage = (function () {
  'use strict';

  var DB_NAME    = 'meu_diario_db';
  var DB_VERSION = 1;
  var STORE_NAME = 'entries';
  var LS_KEY     = 'meu_diario_v2';

  var db = null;        /* instância IDBDatabase, ou null se indisponível */
  var ready = false;    /* true após init() resolver */

  /* ── Inicialização ─────────────────────────────────────────────── */

  /**
   * Abre (ou cria) o banco IndexedDB.
   * Deve ser chamado uma vez antes de qualquer operação de leitura
   * ou escrita. Retorna Promise<void>.
   * Em caso de falha, define db=null e o módulo opera em fallback.
   */
  function init() {
    return new Promise(function (resolve) {
      if (!window.indexedDB) {
        ready = true;
        resolve();
        return;
      }

      var req = indexedDB.open(DB_NAME, DB_VERSION);

      /* Cria o object store na primeira abertura ou upgrade de versão */
      req.onupgradeneeded = function (ev) {
        var database = ev.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          /* keyPath:'id' mapeia diretamente ao campo id de Entry */
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      req.onsuccess = function (ev) {
        db = ev.target.result;

        /* Captura erros de conexão após abertura (ex: disco cheio) */
        db.onerror = function (e) {
          console.error('[Storage] IDB error:', e.target.error);
        };

        ready = true;
        resolve();
      };

      req.onerror = function () {
        /* IDB falhou: fallback silencioso para localStorage */
        db = null;
        ready = true;
        resolve();
      };

      req.onblocked = function () {
        /* Outra aba abriu o banco em versão antiga — aguarda */
        db = null;
        ready = true;
        resolve();
      };
    });
  }

  /* ── Operações IDB (privadas) ───────────────────────────────────── */

  /** Abre uma transação e retorna o object store. */
  function getStore(mode) {
    return db.transaction([STORE_NAME], mode).objectStore(STORE_NAME);
  }

  /** Wraps IDBRequest em Promise. */
  function idbRequest(req) {
    return new Promise(function (resolve, reject) {
      req.onsuccess = function () { resolve(req.result); };
      req.onerror   = function () { reject(req.error); };
    });
  }

  /* ── API pública ────────────────────────────────────────────────── */

  /**
   * Carrega todas as entradas.
   * @returns {Promise<Entry[]>}
   */
  function getAll() {
    if (db) {
      return idbRequest(getStore('readonly').getAll());
    }
    /* Fallback localStorage */
    return Promise.resolve(_lsGetAll());
  }

  /**
   * Persiste uma entrada (insert ou update por id).
   * @param {Entry} entry
   * @returns {Promise<void>}
   */
  function put(entry) {
    if (db) {
      return idbRequest(getStore('readwrite').put(entry));
    }
    return Promise.resolve(_lsPut(entry));
  }

  /**
   * Remove uma entrada pelo id.
   * @param {string} id
   * @returns {Promise<void>}
   */
  function remove(id) {
    if (db) {
      return idbRequest(getStore('readwrite').delete(id));
    }
    return Promise.resolve(_lsRemove(id));
  }

  /**
   * Informa qual backend está ativo.
   * Útil para diagnóstico e mensagens de status.
   * @returns {'indexeddb'|'localstorage'}
   */
  function backend() {
    return db ? 'indexeddb' : 'localstorage';
  }

  /* ── Fallback localStorage (privado) ────────────────────────────── */

  function _lsGetAll() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function _lsPut(entry) {
    var all = _lsGetAll();
    var idx = all.findIndex(function (e) { return e.id === entry.id; });
    if (idx >= 0) all[idx] = entry;
    else          all.unshift(entry);
    _lsSave(all);
  }

  function _lsRemove(id) {
    var all = _lsGetAll().filter(function (e) { return e.id !== id; });
    _lsSave(all);
  }

  function _lsSave(all) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(all));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        /* Notifica via evento customizado para o app exibir toast */
        document.dispatchEvent(new CustomEvent('storage:quota-exceeded'));
      }
    }
  }

  return { init: init, getAll: getAll, put: put, remove: remove, backend: backend };

}()); /* fim do módulo Storage */





// Compatibilidade global
window.Storage = Storage;
