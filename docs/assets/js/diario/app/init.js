import { Storage } from '../infra/storage.js';
import { applyLocale, currentLang } from '../ui/i18n.js';
import { loadData, entries } from './state.js';
import { Pen } from '../editor/pen.js';
import { syncResponsiveShell } from '../shared/utils.js';
import { openEntry } from './actions.js';

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 15 — INICIALIZAÇÃO
   ────────────────────────────────────────────────────────────────── */

/* ( new versin for use IndexedDB)
Inicializar módulo Storage e depois módulo Pen
*/
/* SEÇÃO 15 — INICIALIZAÇÃO */


export function migrateFromLocalStorage() {
  if (Storage.backend() !== 'indexeddb') return Promise.resolve();
  var lsKey = 'meu_diario_v2';
  var lsMigKey = 'meu_diario_migrated';
  if (localStorage.getItem(lsMigKey)) return Promise.resolve();

  var raw = localStorage.getItem(lsKey);
  if (!raw) return Promise.resolve();

  try {
    var old = JSON.parse(raw);
    return Promise.all(old.map(function (e) { return Storage.put(e); }))
      .then( function () {
        localStorage.setItem(lsMigKey, '1');
        /* Mantém o localStorage intacto como backup por segurança */
      }); 
  } catch (e) {
    return Promise.resolve();
  }
}

Storage.init()
.then( migrateFromLocalStorage )
.then( loadData )
.then( function () {
  return loadData();
}).then(function () {
  Pen.init(
    document.getElementById('pen-svg'),
    document.getElementById('pen-layer'),
    document.getElementById('editor-area')
  );
  applyLocale(currentLang);
  if (entries.length) {
    var latest = entries.slice().sort(function (a, b) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    })[0];
    openEntry(latest.id);
  }
});

syncResponsiveShell();



// Compatibilidade global
