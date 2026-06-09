import { Storage } from '../infra/storage.js';

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 3 — ESTADO E PERSISTÊNCIA
   ────────────────────────────────────────────────────────────────── */

//var STORAGE_KEY = 'meu_diario_v2';
export let entries     = [];   /* array de Entry — fonte da verdade */
export let currentId   = null; /* ID da entrada aberta, ou null */

/** Carrega entries[] do backend ativo. Retorna Promise.  */
export function loadData() {
  return Storage.getAll().then( function ( all ) {
    entries.length = 0; all.forEach(function(e) { entries.push(e); });
  });

}

/**
 * Persiste uma única entrada no backend.
 * Mais eficiente que gravar o array inteiro a cada alteração.
 * @param {Entry} entry
 */
export function saveEntry_store(entry) {
  Storage.put(entry).catch(function (err) {
    console.error('[Storage] put failed:', err);
    document.dispatchEvent(new CustomEvent('storage:error'));
  });
}

/**
 * Remove uma entrada do backend.
 * @param {string} id
 */
export function removeEntry_store(id) {
  Storage.remove(id).catch(function (err) {
    console.error('[Storage] remove failed:', err);
  });
}


/** Carrega entries do localStorage. Em caso de JSON corrompido, inicia vazio. */
//function loadData() {
//  try { entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
//  catch (e) { entries = []; }
//}

/** Persiste o array entries no localStorage. */
//function saveData() {
//  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
//}

export function setEntries(val) { entries = val; }
export function setCurrentId(val) { currentId = val; }


// Compatibilidade global
window.entries = entries; window.currentId = currentId;
