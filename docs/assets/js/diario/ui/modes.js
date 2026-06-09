import { t, currentLang } from './i18n.js';
import { fmtLong } from '../shared/utils.js';
import { entries, currentId } from '../app/state.js';
import { mdToHtml } from '../editor/markdown.js';
import { Pen } from '../editor/pen.js';
import { autoResizeTextarea } from '../editor/export.js';

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 7 — CONTROLE DE MODO (edit | pen | preview)
   ────────────────────────────────────────────────────────────────── */

/**
 * Muda o modo do editor.
 *
 * 'edit'    → textarea visível, preview e traços ocultos
 * 'pen'     → preview renderizado visível, SVG ativo
 * 'preview' → preview renderizado visível, SVG passivo
 *
 * Preview e Pen compartilham a mesma superfície canônica renderizada.
 * Edit é modo-fonte: exibe apenas Markdown cru para edição.
 */
export function renderCanonicalSurface() {
  var raw  = document.getElementById('entry-raw');
  var prev = document.getElementById('entry-preview');
  prev.innerHTML = mdToHtml(raw.value);
}

export let currentMode = 'edit';
export let NOTEBOOK_LINE_PX = 28;
export let NOTEBOOK_TAIL_STEP = NOTEBOOK_LINE_PX * 12;
export let NOTEBOOK_TAIL_PAD = NOTEBOOK_LINE_PX * 4;
export let NOTEBOOK_TAIL_TRIGGER = 180;
export let notebookTailExtraPx = 0;

export let NOTEBOOK_TAIL_X_STEP = 300;
export let NOTEBOOK_TAIL_X_TRIGGER = 180;
export let notebookTailExtraX_Px = 0;

export function alignNotebookTail(n) {
  return Math.max(0, Math.ceil(n / NOTEBOOK_LINE_PX) * NOTEBOOK_LINE_PX);
}

export function getMaxStrokeY() {
  var strokes = Pen.getStrokes();
  var maxY = 0;

  for (var i = 0; i < strokes.length; i++) {
    var pts = strokes[i].pts;
    for (var j = 0; j < pts.length; j++) {
      if (pts[j][1] > maxY) maxY = pts[j][1];
    }
  }
  return maxY;
}

export function getMaxStrokeX() {
  var strokes = Pen.getStrokes();
  var maxX = 0;

  for (var i = 0; i < strokes.length; i++) {
    var pts = strokes[i].pts;
    for (var j = 0; j < pts.length; j++) {
      if (pts[j][0] > maxX) maxX = pts[j][0];
    }
  }
  return maxX;
}

export function resetNotebookTail() {
  notebookTailExtraPx = 0;
  notebookTailExtraX_Px = 0;
  var tail = document.getElementById('notebook-tail');
  if (tail) tail.style.height = '0px';
  var tailX = document.getElementById('notebook-tail-x');
  if (tailX) tailX.style.width = '0px';
}

export function syncNotebookTail() {
  var tail = document.getElementById('notebook-tail');
  var tailX = document.getElementById('notebook-tail-x');
  if (!tail || !tailX) return;

  if (currentMode !== 'pen' && currentMode !== 'preview') {
    tail.style.height = '0px';
    tailX.style.width = '0px';
    return;
  }

  var contentBottom = tail.offsetTop;
  var neededFromStrokes = Math.max(
    0,
    getMaxStrokeY() + NOTEBOOK_TAIL_PAD - contentBottom
  );
  var nextExtra = Math.max(
    notebookTailExtraPx,
    alignNotebookTail(neededFromStrokes)
  );

  tail.style.height = nextExtra + 'px';

  var contentRight = document.getElementById('editor-area').clientWidth;
  var neededFromStrokesX = Math.max(
    0,
    getMaxStrokeX() + NOTEBOOK_TAIL_PAD - contentRight
  );
  var nextExtraX = Math.max(
    notebookTailExtraX_Px,
    neededFromStrokesX
  );

  tailX.style.width = nextExtraX + 'px';
}

export function maybeGrowNotebookTail() {
  if (currentMode !== 'pen') return;

  var area = document.getElementById('editor-area');
  if (!area) return;

  var changed = false;
  if (area.scrollTop + area.clientHeight >= area.scrollHeight - NOTEBOOK_TAIL_TRIGGER) {
    notebookTailExtraPx += NOTEBOOK_TAIL_STEP;
    changed = true;
  }
  
  if (area.scrollLeft + area.clientWidth >= area.scrollWidth - NOTEBOOK_TAIL_X_TRIGGER) {
    notebookTailExtraX_Px += NOTEBOOK_TAIL_X_STEP;
    changed = true;
  }

  if (changed) syncNotebookTail();
}

/**
 * Monta uma superfície temporária de impressão que replica Preview/Pen.
 *
 * Estratégia:
 *  1. Clona o HTML já renderizado do preview canônico.
 *  2. Recria cabeçalho (data/título) com a mesma ordem visual da tela.
 *  3. Sobrepõe um SVG absoluto com o mesmo sistema de coordenadas da caneta.
 *
 * O stage fica fora da UI ativa e só é revelado em @media print quando
 * body.print-exporting estiver presente.
 */
export function cloneRenderedPreview(sourceEl, targetEl) {
  if (!sourceEl || !targetEl) return;
  Array.prototype.slice.call(sourceEl.childNodes).forEach(function (node) {
    targetEl.appendChild(node.cloneNode(true));
  });
}

export function buildPrintStage(entry) {
  var editorContainer = document.getElementById('editor-container');
  var editorWrap      = document.querySelector('.editor-wrap');
  var prev            = document.getElementById('entry-preview');
  var dateDisplay     = document.getElementById('entry-date-display');
  var titleInput      = document.getElementById('entry-title');
  var existingStage   = document.getElementById('print-stage');

  if (!editorContainer || !editorWrap || !prev) return null;
  if (existingStage && existingStage.parentNode)
    existingStage.parentNode.removeChild(existingStage);

  var stage = document.createElement('div');
  stage.id = 'print-stage';
  stage.setAttribute('aria-hidden', 'true');
  stage.style.position   = 'absolute';
  stage.style.left       = '-100000px';
  stage.style.top        = '0';
  stage.style.display    = 'block';
  stage.style.visibility = 'hidden';

  var surface = document.createElement('div');
  surface.id = 'print-stage-surface';
  surface.style.width = Math.max(1, Math.round(editorWrap.getBoundingClientRect().width)) + 'px';

  var dateEl = document.createElement('div');
  dateEl.id = 'print-stage-date';
  dateEl.textContent =
    (dateDisplay ? dateDisplay.textContent : fmtLong(entry.updatedAt, currentLang))
    + (entry.mood ? '  ' + entry.mood : '');

  var titleEl = document.createElement('div');
  titleEl.id = 'print-stage-title';
  titleEl.textContent =
    (titleInput && titleInput.value.trim())
      ? titleInput.value.trim()
      : (entry.title || t('list.untitled'));

  var previewEl = document.createElement('div');
  previewEl.id = 'print-stage-preview';
  cloneRenderedPreview(prev, previewEl);

  surface.appendChild(dateEl);
  surface.appendChild(titleEl);
  surface.appendChild(previewEl);
  stage.appendChild(surface);
  editorContainer.appendChild(stage);

  var surfaceWidth  = surface.getBoundingClientRect().width;
  var surfaceHeight = Math.max(surface.scrollHeight, surface.offsetHeight);
  var overlay       = Pen.buildPrintOverlay(surfaceWidth, surfaceHeight);

  if (overlay) {
    surface.appendChild(overlay);
    var overlayHeight = parseFloat(overlay.getAttribute('height')) || surfaceHeight;
    if (overlayHeight > surfaceHeight)
      surface.style.minHeight = Math.ceil(overlayHeight) + 'px';
  }

  stage.style.position   = '';
  stage.style.left       = '';
  stage.style.top        = '';
  stage.style.display    = '';
  stage.style.visibility = '';

  return stage;
}

export function setMode(m) {
  var raw     = document.getElementById('entry-raw');
  var prev    = document.getElementById('entry-preview');
  var fmt     = document.getElementById('fmt-btns');
  var penTool = document.getElementById('pen-toolbar');

  currentMode = m;

  /* Atualiza botões do mode-toggle */
  document.getElementById('mode-edit').classList.toggle('active',    m === 'edit');
  document.getElementById('mode-pen').classList.toggle('active',     m === 'pen');
  document.getElementById('mode-preview').classList.toggle('active', m === 'preview');

  if (m === 'edit') {
    raw.style.display    = 'block';
    raw.style.opacity    = '1';
    prev.style.display   = 'none';
    fmt.style.display    = 'flex';
    penTool.style.display= 'none';
    syncNotebookTail();
    Pen.hideOverlay();
    autoResizeTextarea(raw);
    raw.focus();

  } else {
    renderCanonicalSurface();
    raw.style.display    = 'none';
    raw.style.opacity    = '1';
    prev.style.display   = 'block';
    fmt.style.display    = 'none';
    syncNotebookTail();
    Pen.showOverlay();

    if (m === 'pen') {
      penTool.style.display= 'flex';
      Pen.activate();

    } else { /* preview */
      penTool.style.display= 'none';
      Pen.deactivate();
    }
  }
}


// Compatibilidade global
window.currentMode = currentMode;
