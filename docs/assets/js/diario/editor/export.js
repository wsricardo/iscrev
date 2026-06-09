import { entries, currentId, saveEntry_store } from '../app/state.js';
import { convertMarkdown, renderTex } from './markdown.js';
import { Pen } from './pen.js';
import { setMode, buildPrintStage, maybeGrowNotebookTail, renderCanonicalSurface } from '../ui/modes.js';
import { showToast } from '../ui/toast.js';
import { t, currentLang } from '../ui/i18n.js';
import { saveEntry, openEntry } from '../app/actions.js';

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 11 — EXPORTAÇÃO
   ────────────────────────────────────────────────────────────────── */

/**
 * Exporta a entrada atual como arquivo .md com front matter YAML.
 *
 * Estrutura do arquivo exportado:
 * ───────────────────────────────
 *   ---
 *   titulo: Minha nota
 *   data: 17/03/2026
 *   humor: 😊
 *   tracos: 12
 *   pen_strokes: <base64 de {v:1, s:[...array de Stroke...]}>
 *   ---
 *
 *   # Minha nota
 *
 *   Corpo em Markdown + LaTeX puro...
 * ───────────────────────────────
 *
 * O campo pen_strokes usa chave fixa em inglês (machine-readable),
 * independente do idioma da UI. O valor base64 evita conflitos de
 * escaping com caracteres especiais JSON dentro do YAML.
 *
 * O campo 'tracos' é um contador legível por humanos.
 * O campo 'pen_strokes' contém os dados reais para importação.
 */
export function exportMarkdown() {
  if (!currentId) return;
  var e = entries.filter(function (x) { return x.id === currentId; })[0];
  if (!e) return;

  var loc      = currentLang === 'en' ? 'en-US' : 'pt-BR';
  var strokes  = Pen.getStrokes();
  var strokesB64 = '';
  try {
    strokesB64 = btoa(JSON.stringify({ v: 1, s: strokes }));
  } catch (err) {
    strokesB64 = btoa(JSON.stringify({ v: 1, s: [] }));
  }

  var frontmatter = [
    '---',
    t('exp.title')   + ': ' + (e.title || t('list.untitled')),
    t('exp.date')    + ': ' + new Date(e.updatedAt).toLocaleDateString(loc),
    t('exp.mood')    + ': ' + (e.mood  || '\u2014'),
    t('exp.strokes') + ': ' + strokes.length,
    'pen_strokes: '  + strokesB64,   /* chave fixa — usada pelo importMarkdown */
    '---', ''
  ].join('\n');

  var content = frontmatter + '# ' + (e.title || t('list.untitled')) + '\n\n' + e.body;
  var blob    = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  var url     = URL.createObjectURL(blob);
  var a       = document.createElement('a');
  a.href      = url;
  a.download  = (e.title || 'entrada').replace(/[\\/:*?"<>|]/g, '-') + '.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 100);
  showToast(t('toast.md'));
}

export function collectPdfExportModel(entry) {
  var titleInput = document.getElementById('entry-title');
  var dateDisplay = document.getElementById('entry-date-display');
  var preview = document.getElementById('entry-preview');
  var editorWrap = document.querySelector('.editor-wrap');

  return {
    title: (titleInput && titleInput.value.trim())
      ? titleInput.value.trim()
      : (entry.title || t('list.untitled')),
    dateText: dateDisplay
      ? dateDisplay.textContent + (entry.mood ? '  ' + entry.mood : '')
      : fmtLong(entry.updatedAt),
    lang: document.documentElement.lang || (currentLang === 'en' ? 'en' : 'pt-BR'),
    previewHtml: preview ? preview.innerHTML : '',
    strokes: Pen.getStrokes(),
    surfaceWidthPx: editorWrap
      ? Math.max(1, Math.round(editorWrap.getBoundingClientRect().width))
      : 1
  };
}

export let pdfExportBusy = false;

export function setPdfExportBusy(isBusy) {
  var btn = document.getElementById('btn-export-pdf');
  pdfExportBusy = !!isBusy;
  if (!btn) return;
  btn.disabled = pdfExportBusy;
  btn.setAttribute('aria-busy', pdfExportBusy ? 'true' : 'false');
}

export function canUseWindowPrint(targetWin) {
  return !!(targetWin && typeof targetWin.print === 'function');
}

export function waitForPrintLifecycle(targetWin, opts) {
  opts = opts || {};

  return new Promise(function (resolve, reject) {
    var ownerWin = opts.ownerWindow || window;
    var ownerDoc = ownerWin.document || document;
    var done = false;
    var startedAt = Date.now();
    var cleanupFns = [];
    var minDialogMs = Math.max(250, opts.minDialogMs || 350);
    var finishDelayMs = Math.max(200, opts.finishDelayMs || 800);
    var fallbackMs = Math.max(5000, opts.fallbackMs || 45000);

    function cleanup() {
      while (cleanupFns.length) cleanupFns.pop()();
    }

    function finish() {
      if (done) return;
      done = true;
      cleanup();
      resolve();
    }

    function fail(err) {
      if (done) return;
      done = true;
      cleanup();
      reject(err);
    }

    function finishSoon() {
      setTimeout(finish, finishDelayMs);
    }

    function maybeFinish() {
      if (Date.now() - startedAt < minDialogMs) return;
      finishSoon();
    }

    function onAfterPrint() {
      finishSoon();
    }

    function onFocus() {
      maybeFinish();
    }

    function onVisibilityChange() {
      if (ownerDoc.visibilityState === 'visible') maybeFinish();
    }

    if (!canUseWindowPrint(targetWin)) {
      fail(new Error('pdf_print_unavailable'));
      return;
    }

    if (typeof targetWin.addEventListener === 'function') {
      targetWin.addEventListener('afterprint', onAfterPrint);
      cleanupFns.push(function () {
        targetWin.removeEventListener('afterprint', onAfterPrint);
      });
    }

    if (typeof ownerWin.addEventListener === 'function') {
      ownerWin.addEventListener('focus', onFocus);
      cleanupFns.push(function () {
        ownerWin.removeEventListener('focus', onFocus);
      });
    }

    if (ownerDoc && typeof ownerDoc.addEventListener === 'function') {
      ownerDoc.addEventListener('visibilitychange', onVisibilityChange);
      cleanupFns.push(function () {
        ownerDoc.removeEventListener('visibilitychange', onVisibilityChange);
      });
    }

    var timeoutId = setTimeout(finish, fallbackMs);
    cleanupFns.push(function () { clearTimeout(timeoutId); });

    try {
      if (typeof targetWin.focus === 'function') targetWin.focus();
      targetWin.print();
      if (typeof opts.onDispatched === 'function') opts.onDispatched();
    } catch (err) {
      fail(err);
    }
  });
}

export function cleanupPrintStage(stage) {
  document.body.classList.remove('print-exporting');
  if (stage && stage.parentNode) stage.parentNode.removeChild(stage);
}

export function runStagePrintJob(entry, onDispatched) {
  var printStage = buildPrintStage(entry);

  if (!printStage)
    return Promise.reject(new Error('pdf_print_stage_unavailable'));
  if (!canUseWindowPrint(window)) {
    cleanupPrintStage(printStage);
    return Promise.reject(new Error('pdf_print_unavailable'));
  }

  document.body.classList.add('print-exporting');

  return waitForPrintLifecycle(window, {
    ownerWindow: window,
    fallbackMs: 45000,
    finishDelayMs: 800,
    minDialogMs: 350,
    onDispatched: onDispatched
  }).then(function () {
    cleanupPrintStage(printStage);
  }, function (err) {
    cleanupPrintStage(printStage);
    throw err;
  });
}

export function getPdfErrorToastKey(err) {
  return err && err.message === 'pdf_print_unavailable'
    ? 'toast.pdfUnavailable'
    : 'toast.pdfErr';
}

/**
 * Exporta como PDF via window.print().
 * Cria uma superfície temporária de impressão que replica Preview/Pen
 * e a revela apenas durante a chamada a window.print().
 */
export function exportPDF() {
  if (!currentId) return;
  var e = entries.filter(function (x) { return x.id === currentId; })[0];
  var model;
  var notifiedOpen = false;
  if (!e) return;
  if (pdfExportBusy) return;

  saveEntry();
  renderCanonicalSurface();
  model = collectPdfExportModel(e);

  function notifyPrintDialog() {
    if (notifiedOpen) return;
    notifiedOpen = true;
    showToast(t('toast.pdf'));
  }

  function finishWithError(err) {
    console.error('[pdf-export]', err);
    setPdfExportBusy(false);
    showToast(t(getPdfErrorToastKey(err)));
  }

  setPdfExportBusy(true);

  runStagePrintJob(e, notifyPrintDialog).then(function () {
    setPdfExportBusy(false);
  }, function (err) {
    finishWithError(err);
  });
}

document.getElementById('btn-export-md').addEventListener('click',  exportMarkdown);
document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);

/**
 * Importa um arquivo .md e cria uma nova entrada.
 *
 * Protocolo de parsing:
 * ─────────────────────
 * 1. Extrai o front matter YAML (bloco entre os dois "---")
 * 2. Lê os campos localizáveis (titulo/title, humor/mood) com
 *    regex case-insensitive que aceita ambos os idiomas
 * 3. Lê o campo fixo "pen_strokes" (sempre em inglês)
 *    → atob() → JSON.parse() → array de Stroke → Pen.load() sanitiza
 * 4. Extrai o body: tudo após o front matter, removendo o
 *    primeiro heading "# Título" que exportMarkdown adiciona
 * 5. Cria Entry, persiste e abre
 *
 * Tratamento de erros:
 *   • front matter ausente: trata o arquivo inteiro como body
 *   • pen_strokes ausente/corrompido: importa só o texto (sem erro fatal)
 *   • arquivo ilegível: mostra toast de erro
 */
export function importMarkdown() {
  var input    = document.createElement('input');
  input.type   = 'file';
  input.accept = '.md,.markdown,.txt';

  input.addEventListener('change', function () {
    var file = input.files && input.files[0];
    if (!file) return;

    var reader = new FileReader();

    reader.onload = function (ev) {
      try {
        var raw = ev.target.result;

        /* ── 1. Front matter ───────────────────────────────────────── */
        var fmRegex  = /^---\r?\n([\s\S]*?)\r?\n---/;
        var fmMatch  = raw.match(fmRegex);
        var fm       = fmMatch ? fmMatch[1] : '';
        var afterFm  = fmMatch ? raw.slice(fmMatch[0].length).trim() : raw.trim();

        /* ── 2. Título ─────────────────────────────────────────────── */
        /* Aceita "titulo:", "title:" ou qualquer chave que o i18n gere */
        var titleMatch = fm.match(/(?:^|\n)(?:titulo|title)\s*:\s*(.+)/i);
        var title = titleMatch ? titleMatch[1].trim() : '';

        /* Fallback: primeiro heading do body */
        if (!title) {
          var hMatch = afterFm.match(/^#\s+(.+)/m);
          title = hMatch ? hMatch[1].trim() : file.name.replace(/\.(md|markdown|txt)$/i, '');
        }

        /* ── 3. Humor ──────────────────────────────────────────────── */
        var moodMatch = fm.match(/(?:^|\n)(?:humor|mood)\s*:\s*(.+)/i);
        var mood      = moodMatch ? moodMatch[1].trim() : '';
        if (mood === '\u2014' || mood === '-') mood = '';

        /* ── 4. Traços manuscritos ─────────────────────────────────── */
        var strokes      = [];
        var strokesMatch = fm.match(/(?:^|\n)pen_strokes\s*:\s*([A-Za-z0-9+/=]+)/);
        if (strokesMatch) {
          try {
            var decoded = JSON.parse(atob(strokesMatch[1].trim()));
            /* Verifica versão e estrutura antes de usar */
            if (decoded && decoded.v === 1 && Array.isArray(decoded.s)) {
              strokes = decoded.s;
            }
          } catch (decodeErr) {
            /* Strokes corrompidos: importa só o texto */
            strokes = [];
          }
        }

        /* ── 5. Body ───────────────────────────────────────────────── */
        /* Remove o "# Título\n\n" que exportMarkdown adiciona no topo */
        var body = afterFm.replace(/^#[^\n]+\n\n?/, '').trim();

        /* ── 6. Cria e abre a entrada ──────────────────────────────── */
        var now   = new Date().toISOString();
        var entry = {
          id:        uid(),
          title:     title,
          body:      body,
          mood:      mood,
          strokes:   strokes,   /* Pen.load() (chamado em openEntry) sanitiza */
          createdAt: now,
          updatedAt: now
        };
        entries.unshift(entry);
        saveEntry_store( entry );
        openEntry(entry.id);    /* abre + chama Pen.load(entry.strokes) */
        showToast(t('toast.imported'));

      } catch (parseErr) {
        showToast(t('toast.importErr'));
      }
    };

    reader.onerror = function () {
      showToast(t('toast.importErr'));
    };

    reader.readAsText(file, 'utf-8');
  });

  /* Dispara o seletor de arquivo */
  input.click();
}

/* ── Textarea auto-resize + wheel forwarding ─────────────────────────
   Problema: textarea com overflow:hidden ainda captura eventos wheel
   em alguns browsers, impedindo o scroll do .editor-area.
   Solução em duas partes:
     1. autoResizeTextarea — faz o textarea crescer com o conteúdo
        (sem scroll interno). Técnica: height='auto' → scrollHeight.
     2. wheel forwarding — repassa o deltaY para .editor-area
        com conversão de unidades (deltaMode 0=px, 1=linhas, 2=páginas).
        preventDefault evita que o browser tente mover o textarea.
────────────────────────────────────────────────────────────────────── */
export function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

(function () {
  var raw  = document.getElementById('entry-raw');
  var area = document.getElementById('editor-area');

  raw.addEventListener('wheel', function (e) {
    var deltaY = e.deltaY;
    var deltaX = e.deltaX;
    if (e.deltaMode === 1) { deltaY *= 20; deltaX *= 20; }
    if (e.deltaMode === 2) { deltaY *= area.clientHeight; deltaX *= area.clientWidth; }
    area.scrollTop += deltaY;
    area.scrollLeft += deltaX;
    maybeGrowNotebookTail();
    e.preventDefault();
  }, { passive: false });

  area.addEventListener('scroll', maybeGrowNotebookTail, { passive: true });
}());


// Compatibilidade global
