/**
 * iScrev Notes - Módulo de Storage
 * Padrão: Facade / Singleton Nativo ESM
 * Responsabilidade: Abstrair a persistência de dados (IndexedDB com fallback para LocalStorage).
 */

// --- Constantes Internas ---
const IDB_NAME = 'meu_diario_db';
const IDB_VERSION = 1;
const STORE_NAME = 'entries';
const LS_KEY = 'meu_diario_v2'; // Chave legado do LocalStorage

// --- Estado Interno Protegido ---
let db = null;
let useLocalStorage = false;

// --- Funções de Inicialização ---

/**
 * Inicializa a conexão com o banco de dados.
 * @returns {Promise<void>}
 */
export function init() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn('[Storage] IndexedDB não suportado. Ativando fallback para LocalStorage.');
      useLocalStorage = true;
      return resolve();
    }

    const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);

    req.onupgradeneeded = (ev) => {
      const database = ev.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    req.onsuccess = (ev) => {
      db = ev.target.result;
      
      // Tratamento genérico de erros da conexão
      db.onerror = (err) => {
        console.error('[Storage] Erro no IndexedDB:', err.target.error);
        document.dispatchEvent(new CustomEvent('storage:error'));
      };
      
      resolve();
    };

    req.onerror = (ev) => {
      console.error('[Storage] Falha ao abrir IndexedDB. Ativando fallback.', ev.target.error);
      useLocalStorage = true;
      resolve(); // Resolvemos mesmo com erro, para permitir a degradação para o LocalStorage
    };
  });
}

// --- Funções de CRUD (A API Pública) ---

/**
 * Retorna todas as entradas salvas.
 * @returns {Promise<Array>} Array de objetos Entry.
 */
export function getAll() {
  return new Promise((resolve, reject) => {
    if (useLocalStorage) {
      try {
        const data = JSON.parse(localStorage.getItem(LS_KEY)) || [];
        return resolve(data);
      } catch (err) {
        return resolve([]); // Retorna array vazio em caso de JSON corrompido
      }
    }

    if (!db) return reject(new Error('IndexedDB não inicializado.'));

    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = (ev) => reject(ev.target.error);
  });
}

/**
 * Salva ou atualiza uma entrada.
 * @param {Object} entry Objeto Entry a ser salvo.
 * @returns {Promise<void>}
 */
export function put(entry) {
  return new Promise((resolve, reject) => {
    if (useLocalStorage) {
      try {
        let data = JSON.parse(localStorage.getItem(LS_KEY)) || [];
        const idx = data.findIndex(e => e.id === entry.id);
        if (idx > -1) data[idx] = entry;
        else data.unshift(entry);
        
        localStorage.setItem(LS_KEY, JSON.stringify(data));
        return resolve();
      } catch (err) {
        if (err.name === 'QuotaExceededError') {
          document.dispatchEvent(new CustomEvent('storage:quota-exceeded'));
        }
        return reject(err);
      }
    }

    if (!db) return reject(new Error('IndexedDB não inicializado.'));

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(entry); // Como schema tem keyPath: 'id', basta passar o objeto

    req.onsuccess = () => resolve();
    req.onerror = (ev) => reject(ev.target.error);
  });
}

/**
 * Remove uma entrada pelo ID.
 * @param {string} id ID da entrada.
 * @returns {Promise<void>}
 */
export function remove(id) {
  return new Promise((resolve, reject) => {
    if (useLocalStorage) {
      let data = JSON.parse(localStorage.getItem(LS_KEY)) || [];
      data = data.filter(e => e.id !== id);
      localStorage.setItem(LS_KEY, JSON.stringify(data));
      return resolve();
    }

    if (!db) return reject(new Error('IndexedDB não inicializado.'));

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = (ev) => reject(ev.target.error);
  });
}

/**
 * Utilitário para verificar em qual backend o sistema está operando no momento.
 * @returns {string} 'indexeddb' ou 'localstorage'
 */
export function getBackend() {
  return useLocalStorage ? 'localstorage' : 'indexeddb';
}