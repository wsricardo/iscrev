import { entries, currentId, saveEntry_store } from './state.js';
import { saveEntry, updateStats } from './actions.js';
import { Pen } from '../editor/pen.js';
import { syncNotebookTail, maybeGrowNotebookTail } from '../ui/modes.js';
import { autoResizeTextarea } from '../editor/export.js';

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 12 — AUTO-SAVE COM DEBOUNCE

/*
  debSave() cancela o timer anterior e agenda saveEntry() para 1,8 s
  depois. saveEntry() só executa se o usuário parar de digitar por
  1,8 s. Evita gravações excessivas durante digitação contínua.
  O módulo Pen persiste imediatamente após cada traço (sem debounce)
  pois traços são eventos discretos, não contínuos.
*/
export let debTimer;
export function debSave() {
  clearTimeout(debTimer);
  debTimer = setTimeout(saveEntry, 1800);
}

document.getElementById('entry-raw').addEventListener('input', function () {
  autoResizeTextarea(this);
  updateStats(); debSave();
});
document.getElementById('entry-title').addEventListener('input', debSave);
document.getElementById('mood-select').addEventListener('change', debSave);


/*Callback do Pen: chamado após cada traço completo (new version, IndexedDB)*/
Pen._onStrokesChange = function (strokes) {
  var e = entries.find(function (x) { return x.id === currentId; });
  if (!e) return;
  e.strokes   = strokes;
  e.updatedAt = new Date().toISOString();
  saveEntry_store(e);    /* persiste só esta entrada, sem tocar as demais */
  syncNotebookTail();
};

/* Callback do Pen: chamado após cada traço completo */
/*Pen._onStrokesChange = function (strokes) {
  if (!currentId) return;
  var e = entries.filter(function (x) { return x.id === currentId; })[0];
  if (!e) return;
  e.strokes   = strokes;
  e.updatedAt = new Date().toISOString();
  saveData(); /* persiste imediatamente — sem debounce *\/
};*/


// Compatibilidade global
