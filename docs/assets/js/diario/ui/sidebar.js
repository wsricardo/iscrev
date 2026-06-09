import { t, currentLang } from './i18n.js';
import { fmtShort, stripForSidebar } from '../shared/utils.js';
import { entries, currentId, setCurrentId } from '../app/state.js';
import { openEntry, newEntry } from '../app/actions.js';
import { escHtml } from '../editor/markdown.js';

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 6 — SIDEBAR / LISTA DE ENTRADAS
   ────────────────────────────────────────────────────────────────── */

/**
 * Re-renderiza a lista de entradas na sidebar.
 * @param {string} q  Filtro de busca (opcional)
 */
export function renderList(q) {
  q = (q || '').toLowerCase();
  var list = document.getElementById('entries-list');

  var filtered = entries.slice()
    .sort(function (a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); })
    .filter(function (e) {
      return e.title.toLowerCase().indexOf(q) !== -1
          || e.body.toLowerCase().indexOf(q) !== -1;
    });

  if (!filtered.length) {
    list.innerHTML = '<div class="no-entries">'
      + (q ? t('list.none') : t('list.empty'))
      + '</div>';
    return;
  }

  list.innerHTML = filtered.map(function (e) {
    return '<div class="entry-item' + (e.id === currentId ? ' active' : '')
      + '" data-id="' + e.id + '">'
      + (e.mood ? '<span class="entry-item-mood">' + e.mood + '</span>' : '')
      + '<div class="entry-item-title">' + escHtml(e.title || t('list.untitled')) + '</div>'
      + '<div class="entry-item-date">' + fmtShort(e.updatedAt, currentLang) + '</div>'
      + '<div class="entry-item-preview">'
      + escHtml(stripForSidebar(e.body).slice(0, 60) || t('list.empty.b'))
      + '</div></div>';
  }).join('');

  list.querySelectorAll('.entry-item').forEach(function (el) {
    el.addEventListener('click', function () { openEntry(el.dataset.id); });
  });
}


// Compatibilidade global
