import { t, currentLang } from '../ui/i18n.js';
import { uid, fmtLong, wordCount, isMobileShell, setSidebarOpen } from '../shared/utils.js';
import { entries, setEntries, currentId, setCurrentId, saveEntry_store, removeEntry_store } from './state.js';
import { Storage } from '../infra/storage.js';
import { setMode, renderCanonicalSurface, resetNotebookTail } from '../ui/modes.js';
import { Pen } from '../editor/pen.js';
import { renderList } from '../ui/sidebar.js';
import { showToast } from '../ui/toast.js';
import { autoResizeTextarea } from '../editor/export.js';

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 8 — CRUD DE ENTRADAS
   ────────────────────────────────────────────────────────────────── */

export function openEntry(id) {
  setCurrentId(id);
  var e = entries.filter(function (x) { return x.id === id; })[0];
  if (!e) return;

  document.getElementById('welcome').style.display = 'none';
  document.getElementById('editor-container').style.display = 'flex';
  document.getElementById('entry-date-display').textContent = fmtLong(e.updatedAt, currentLang);
  document.getElementById('entry-title').value = e.title;
  document.getElementById('entry-raw').value   = e.body;
  document.getElementById('mood-select').value = e.mood || '';

  resetNotebookTail();
  Pen.load(e.strokes || []);
  updateStats();
  setMode('edit');
  /* Chamado APÓS setMode para garantir display:block no textarea.
     Com display:none o scrollHeight retorna 0. */
  autoResizeTextarea(document.getElementById('entry-raw'));
  renderList(document.getElementById('search-input').value);
  if (isMobileShell()) setSidebarOpen(false);
}

export function newEntry() {
  var now = new Date().toISOString();
  var e = {
    id:        uid(),
    title:     '',
    body:      '',
    mood:      '',
    strokes:   [],   /* campo de anotações manuscritas */
    createdAt: now,
    updatedAt: now
  };
  entries.unshift(e);
  saveEntry_store(e);
  openEntry(e.id);
  showToast(t('toast.new'));
}

export function saveEntry() {
  if (!currentId) return;
  var e = entries.filter(function (x) { return x.id === currentId; })[0];
  if (!e) return;
  e.title     = document.getElementById('entry-title').value.trim();
  e.body      = document.getElementById('entry-raw').value;
  e.mood      = document.getElementById('mood-select').value;
  e.strokes   = Pen.getStrokes();
  e.updatedAt = new Date().toISOString();
  saveEntry_store(e);
  renderList(document.getElementById('search-input').value);
}


export function deleteEntry() {
  if (!currentId) return;
  if (!confirm(t('cf.del'))) return;
  removeEntry_store(currentId);              /* ← grava remoção no IDB */
  setEntries(entries.filter(function (x) { return x.id !== currentId; }));
  setCurrentId(null);

  Pen.load([]);
  resetNotebookTail();
  Pen.deactivate();
  document.getElementById('editor-container').style.display = 'none';
  document.getElementById('welcome').style.display = 'flex';
  renderList();
  setSidebarOpen(true);
  showToast(t('toast.del'));

}


/*function deleteEntry() {
  if (!currentId) return;
  if (!confirm(t('cf.del'))) return;
  entries   = entries.filter(function (x) { return x.id !== currentId; });
  setCurrentId(null);
  saveData();
  Pen.load([]);
  Pen.deactivate();
  document.getElementById('editor-container').style.display = 'none';
  document.getElementById('welcome').style.display = 'flex';
  renderList();
  showToast(t('toast.del'));
}*/

export function updateStats() {
  var n = wordCount(document.getElementById('entry-raw').value);
  document.getElementById('word-count').textContent =
    n + ' ' + (n === 1 ? t('stats.word') : t('stats.words'));
}


// Compatibilidade global
