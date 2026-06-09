import { Storage } from '../infra/storage.js';
import { applyLocale } from '../ui/i18n.js';
import { loadData } from './state.js';
import { Pen } from '../editor/pen.js';
import { syncResponsiveShell } from '../shared/utils.js';

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

/* 1. Inicializa o módulo Pen com os elementos do DOM */
/*Pen.init(
  document.getElementById('pen-svg'),
  document.getElementById('pen-layer'),
  document.getElementById('editor-area')
);*/

/* 2. Carrega dados do localStorage */
loadData();

/* 3. Aplica idioma — sem fade na inicialização (página ainda carregando) */
applyLocale(currentLang);

/* 4. Abre automaticamente a entrada mais recente */
if (entries.length) {
  var latest = entries.slice()
    .sort(function (a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); })[0];
  openEntry(latest.id);
}

syncResponsiveShell();



// Compatibilidade global
