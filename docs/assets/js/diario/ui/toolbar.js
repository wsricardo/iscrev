import { debSave } from '../app/autosave.js';

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 9 — FORMATAÇÃO VIA TOOLBAR
   ────────────────────────────────────────────────────────────────── */

/* Botões [data-wrap]: envolvem a seleção com marcadores simétricos */
document.querySelectorAll('[data-wrap]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var ta  = document.getElementById('entry-raw');
    var w   = btn.dataset.wrap;
    var s   = ta.selectionStart, e = ta.selectionEnd;
    var sel = ta.value.slice(s, e) || 'texto';
    ta.setRangeText(w + sel + w, s, e, 'select');
    ta.focus();
    debSave();
  });
});

/* Botões [data-prefix]: inserem prefixo no início da linha atual */
document.querySelectorAll('[data-prefix]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var ta = document.getElementById('entry-raw');
    var p  = btn.dataset.prefix;
    var s  = ta.selectionStart;
    var ls = ta.value.lastIndexOf('\n', s - 1) + 1;
    ta.setRangeText(p, ls, ls, 'end');
    ta.focus();
    debSave();
  });
});


// Compatibilidade global
