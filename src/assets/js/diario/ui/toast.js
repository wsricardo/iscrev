import { t } from './i18n.js';

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 5 — TOAST
   ────────────────────────────────────────────────────────────────── */

export let toastTimer;

export function showToast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
}


// Compatibilidade global
