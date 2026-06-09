import { saveEntry, newEntry, deleteEntry } from '../app/actions.js';
import { setMode, currentMode } from './modes.js';
import { isSidebarOpen, setSidebarOpen } from '../shared/utils.js';
import { toggleFullscreen } from './fullscreen.js';
import { Pen } from '../editor/pen.js';
import { showToast } from './toast.js';
import { t } from './i18n.js';

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 14 — ATALHOS DE TECLADO
   ────────────────────────────────────────────────────────────────── */

document.addEventListener('keydown', function (ev) {
  /* Ctrl+S / Cmd+S — salvar */
  if ((ev.ctrlKey || ev.metaKey) && ev.key === 's') {
    ev.preventDefault();
    saveEntry();
    showToast(t('toast.saved'));
    return;
  }
  /* Ctrl+Z / Cmd+Z — desfazer traço (apenas no modo caneta) */
  if ((ev.ctrlKey || ev.metaKey) && ev.key === 'z'
      && document.getElementById('mode-pen').classList.contains('active')) {
    ev.preventDefault();
    Pen.undo();
    return;
  }
  /* F — alternar tela cheia (apenas quando foco não está em input/textarea) */
  if (ev.key === 'F' && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
      ev.preventDefault();
      toggleFullscreen();
      return;
    }
  }
  /* Escape — fechar modal de equação */
  if (ev.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
    setSidebarOpen(false);
    return;
  }
  if (ev.key === 'Escape')
    document.getElementById('eq-overlay').classList.remove('open');
});


// Compatibilidade global
