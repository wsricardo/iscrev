(function (global) {
'use strict';

var MM_TO_PX = 96 / 25.4;
var SURFACE_PAD_TOP = 28;
var DEFAULTS = {
  format: 'a4',
  marginMm: 12,
  cleanupDelayMs: 45000,
  resourceTimeoutMs: 2500,
  focusDelayMs: 800,
  minDialogMs: 350
};

var PAGE_FORMATS = {
  a4:     { widthMm: 210,   heightMm: 297   },
  letter: { widthMm: 215.9, heightMm: 279.4 }
};

var EXPORT_SURFACE_CSS = [
  ':root{',
    '--ink:#1a1209;',
    '--warm:#c8843a;',
    '--rust:#8b3a1f;',
    '--math-bg:#fdf6e8;',
    '--math-bd:rgba(200,132,58,.3);',
  '}',
  '.pdfx-surface{',
    'position:relative;',
    'box-sizing:border-box;',
    'padding:28px 30px 28px 96px;',
    'color:var(--ink);',
    'font-family:\'Lora\',Georgia,serif;',
  '}',
  '.pdfx-date{',
    'font-family:\'Dancing Script\',cursive;',
    'font-size:1.05rem;',
    'color:var(--rust);',
    'margin-bottom:8px;',
    'opacity:.8;',
  '}',
  '.pdfx-title{',
    'font-family:\'Playfair Display\',serif;',
    'font-size:2rem;',
    'font-weight:700;',
    'color:var(--ink);',
    'margin-bottom:18px;',
    'line-height:1.2;',
    'border-bottom:2px solid rgba(200,132,58,.25);',
    'padding-bottom:12px;',
  '}',
  '.pdfx-flow-block{',
    'font-family:\'Lora\',serif;',
    'font-size:1.05rem;',
    'line-height:28px;',
    'color:var(--ink);',
    'margin-bottom:14px;',
  '}',
  '.pdfx-flow-block strong{font-weight:600;}',
  '.pdfx-flow-block em{font-style:italic;}',
  '.pdfx-flow-block code{',
    'font-family:\'JetBrains Mono\',monospace;',
    'font-size:.88em;',
    'background:rgba(200,132,58,.12);',
    'padding:1px 5px;',
    'border-radius:3px;',
  '}',
  '.pdfx-surface blockquote{',
    'border-left:3px solid var(--warm);',
    'padding-left:16px;',
    'margin:12px 0;',
    'color:var(--rust);',
    'font-style:italic;',
  '}',
  '.pdfx-surface ul{padding-left:22px;margin-bottom:12px;}',
  '.pdfx-surface li{margin-bottom:4px;}',
  '.pdfx-surface .math-block{',
    'background:var(--math-bg);',
    'border:1px solid var(--math-bd);',
    'border-radius:6px;',
    'padding:14px 20px;',
    'margin:16px 0;',
    'overflow:visible;',
    'text-align:center;',
    'page-break-inside:avoid;',
    'break-inside:avoid;',
  '}',
  '.pdfx-surface .math-inline{display:inline;}',
  '.pdfx-spacer-block{height:0;margin:0;padding:0;}',
  '.pdfx-page-overlay{',
    'position:absolute;',
    'left:0;',
    'top:0;',
    'z-index:2;',
    'pointer-events:none;',
  '}',
  '.pdfx-scale{transform-origin:top left;}',
  '.katex{color:var(--ink);}',
  '.katex-display{margin:.4em 0!important;}'
].join('');

function mmToPx(mm) {
  return mm * MM_TO_PX;
}

function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeStyleText(text) {
  return String(text || '').replace(/<\/style/gi, '<\\/style');
}

function normalizeOptions(opts) {
  var next = {};
  var key;

  for (key in DEFAULTS) next[key] = DEFAULTS[key];
  opts = opts || {};
  for (key in opts) next[key] = opts[key];

  if (!PAGE_FORMATS[next.format]) next.format = DEFAULTS.format;
  next.page = PAGE_FORMATS[next.format];
  next.marginMm = Math.max(6, parseFloat(next.marginMm) || DEFAULTS.marginMm);
  next.printableWidthPx = Math.max(
    1,
    Math.round(mmToPx(next.page.widthMm - next.marginMm * 2))
  );
  next.printableHeightPx = Math.max(
    1,
    Math.round(mmToPx(next.page.heightMm - next.marginMm * 2))
  );
  return next;
}

function buildExportModel(input) {
  if (!input) throw new Error('pdf_exporter_missing_model');

  var model = {
    title: input.title || '',
    dateText: input.dateText || '',
    lang: input.lang || document.documentElement.lang || 'pt-BR',
    previewHtml: input.previewHtml || '',
    strokes: Array.isArray(input.strokes) ? input.strokes : [],
    surfaceWidthPx: Math.max(1, Math.round(input.surfaceWidthPx || 0))
  };

  if (!model.surfaceWidthPx)
    throw new Error('pdf_exporter_missing_surface_width');

  return model;
}

function createFlowBlock(doc) {
  var el = doc.createElement('div');
  el.className = 'pdfx-flow-block';
  return el;
}

function isBlockElement(node) {
  if (!node || node.nodeType !== 1) return false;
  if (node.classList && node.classList.contains('math-inline')) return false;
  return /^(P|DIV|UL|OL|BLOCKQUOTE|H1|H2|H3|H4|H5|H6|PRE|TABLE|HR)$/i.test(node.tagName);
}

function sanitizePreviewTree(root) {
  Array.prototype.slice.call(
    root.querySelectorAll('script,iframe,object,embed,meta,link,style')
  ).forEach(function (node) {
    if (node.parentNode) node.parentNode.removeChild(node);
  });

  Array.prototype.slice.call(root.querySelectorAll('*')).forEach(function (node) {
    Array.prototype.slice.call(node.attributes).forEach(function (attr) {
      var name = attr.name.toLowerCase();
      var value = attr.value || '';

      if (name.indexOf('on') === 0) {
        node.removeAttribute(attr.name);
        return;
      }

      if ((name === 'href' || name === 'src' || name === 'xlink:href')
          && /^\s*javascript:/i.test(value)) {
        node.removeAttribute(attr.name);
      }
    });
  });

  return root;
}

function normalizePreviewBlocks(previewHtml) {
  var root = document.createElement('div');
  var blocks = [];
  var flow = null;

  root.innerHTML = previewHtml || '';
  sanitizePreviewTree(root);

  function flushFlow() {
    if (!flow) return;
    if (!flow.textContent.trim() && !flow.querySelector('br, span, strong, em, code')) {
      flow = null;
      return;
    }
    blocks.push(flow);
    flow = null;
  }

  Array.prototype.slice.call(root.childNodes).forEach(function (node) {
    if (node.nodeType === 3) {
      if (!node.textContent.trim()) return;
      if (!flow) flow = createFlowBlock(document);
      flow.appendChild(document.createTextNode(node.textContent));
      return;
    }

    if (node.nodeType !== 1) return;

    if (isBlockElement(node)) {
      flushFlow();
      blocks.push(node.cloneNode(true));
      return;
    }

    if (!flow) flow = createFlowBlock(document);
    flow.appendChild(node.cloneNode(true));
  });

  flushFlow();

  if (!blocks.length) {
    var blank = createFlowBlock(document);
    blank.innerHTML = '&nbsp;';
    blocks.push(blank);
  }

  return blocks;
}

function createContentBlocks(model) {
  var blocks = [];
  var dateEl = document.createElement('div');
  var titleEl = document.createElement('div');

  dateEl.className = 'pdfx-date';
  dateEl.textContent = model.dateText || '';
  blocks.push(dateEl);

  titleEl.className = 'pdfx-title';
  titleEl.textContent = model.title || '';
  blocks.push(titleEl);

  return blocks.concat(normalizePreviewBlocks(model.previewHtml));
}

function createMeasureHost(surfaceWidthPx) {
  var host = document.createElement('div');
  var style = document.createElement('style');
  var surface = document.createElement('div');

  host.style.position = 'absolute';
  host.style.left = '-100000px';
  host.style.top = '0';
  host.style.visibility = 'hidden';
  host.style.pointerEvents = 'none';
  host.style.width = surfaceWidthPx + 'px';

  style.textContent = EXPORT_SURFACE_CSS;
  surface.className = 'pdfx-surface';
  surface.style.width = surfaceWidthPx + 'px';

  host.appendChild(style);
  host.appendChild(surface);
  document.body.appendChild(host);

  return { host: host, surface: surface };
}

function measureBlocks(blocks, surfaceWidthPx) {
  var host = createMeasureHost(surfaceWidthPx);
  var measured = [];
  var surfaceRect, logicalHeight, nodes;

  try {
    blocks.forEach(function (block) {
      host.surface.appendChild(block.cloneNode(true));
    });

    nodes = Array.prototype.slice.call(host.surface.children);
    surfaceRect = host.surface.getBoundingClientRect();
    logicalHeight = Math.max(1, Math.ceil(host.surface.scrollHeight));

    nodes.forEach(function (node, index) {
      measured.push({
        node: blocks[index].cloneNode(true),
        top: Math.round(node.getBoundingClientRect().top - surfaceRect.top)
      });
    });

    measured.forEach(function (item, index) {
      var nextTop = index + 1 < measured.length
        ? measured[index + 1].top
        : logicalHeight;
      item.slotHeight = Math.max(1, nextTop - item.top);
    });

    return {
      blocks: measured,
      logicalHeight: logicalHeight
    };
  } finally {
    if (host.host.parentNode) host.host.parentNode.removeChild(host.host);
  }
}

function getStrokeBounds(stroke) {
  var minY = Infinity;
  var maxY = -Infinity;
  var pts = stroke && stroke.pts;

  if (!Array.isArray(pts) || !pts.length) return null;

  pts.forEach(function (pt) {
    if (!Array.isArray(pt) || pt.length < 2) return;
    if (pt[1] < minY) minY = pt[1];
    if (pt[1] > maxY) maxY = pt[1];
  });

  if (!isFinite(minY) || !isFinite(maxY)) return null;
  return { minY: minY, maxY: maxY };
}

function getMaxStrokeY(strokes) {
  var maxY = 0;

  strokes.forEach(function (stroke) {
    var bounds = getStrokeBounds(stroke);
    if (bounds && bounds.maxY > maxY) maxY = bounds.maxY;
  });

  return maxY;
}

function appendSpacerBlocks(measuredDoc, targetHeightPx, pageBodyLogicalPx) {
  var blocks = measuredDoc.blocks.slice();
  var currentTop = measuredDoc.logicalHeight;
  var spacerChunk = Math.max(1, pageBodyLogicalPx);

  while (currentTop < targetHeightPx) {
    var chunk = Math.min(spacerChunk, targetHeightPx - currentTop);
    var spacer = document.createElement('div');
    spacer.className = 'pdfx-spacer-block';
    spacer.style.height = chunk + 'px';
    blocks.push({
      node: spacer,
      top: currentTop,
      slotHeight: chunk,
      isSpacer: true
    });
    currentTop += chunk;
  }

  return {
    blocks: blocks,
    logicalHeight: Math.max(measuredDoc.logicalHeight, targetHeightPx)
  };
}

function paginateBlocks(measuredBlocks, pageHeightLogicalPx) {
  var pageBodyLogicalPx = Math.max(1, pageHeightLogicalPx - SURFACE_PAD_TOP);
  var pages = [];
  var pageBlocks = [];
  var usedHeight = 0;

  function pushPage() {
    if (!pageBlocks.length) return;

    var first = pageBlocks[0];
    pages.push({
      sourceStartY: Math.max(0, first.top - SURFACE_PAD_TOP),
      sourceSpan: SURFACE_PAD_TOP + usedHeight,
      blocks: pageBlocks.map(function (item) {
        return item.node.cloneNode(true);
      })
    });

    pageBlocks = [];
    usedHeight = 0;
  }

  measuredBlocks.forEach(function (block) {
    if (!block.isSpacer && block.slotHeight > pageBodyLogicalPx)
      throw new Error('pdf_exporter_block_too_tall');

    if (pageBlocks.length && usedHeight + block.slotHeight > pageBodyLogicalPx)
      pushPage();

    pageBlocks.push(block);
    usedHeight += block.slotHeight;
  });

  pushPage();
  return pages;
}

function buildPageOverlaySvg(strokes, sourceStartY, sourceSpan, surfaceWidthPx) {
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var sourceEndY = sourceStartY + sourceSpan;
  var svg = document.createElementNS(SVG_NS, 'svg');
  var group = document.createElementNS(SVG_NS, 'g');
  var hasPath = false;

  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('viewBox', '0 0 ' + surfaceWidthPx + ' ' + sourceSpan);
  svg.setAttribute('width', surfaceWidthPx);
  svg.setAttribute('height', sourceSpan);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Anotações manuscritas');
  svg.classList.add('pdfx-page-overlay');

  group.setAttribute('transform', 'translate(0,' + (-sourceStartY) + ')');
  svg.appendChild(group);

  strokes.forEach(function (stroke) {
    var bounds = getStrokeBounds(stroke);
    var path;

    if (!bounds) return;
    if (bounds.maxY < sourceStartY || bounds.minY > sourceEndY) return;

    path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', stroke.c || '#1a1209');
    path.setAttribute('stroke-width', stroke.w || 2.5);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('d', toPathD(stroke.pts || []));
    group.appendChild(path);
    hasPath = true;
  });

  return hasPath ? svg : null;
}

function toPathD(pts) {
  if (!pts || !pts.length) return '';
  if (pts.length === 1) return 'M' + pts[0][0] + ',' + pts[0][1];

  var d = 'M' + pts[0][0] + ',' + pts[0][1];
  var i, mx, my, last;

  for (i = 1; i < pts.length - 1; i++) {
    mx = (pts[i][0] + pts[i + 1][0]) / 2;
    my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ' Q' + pts[i][0] + ',' + pts[i][1] + ' ' + mx + ',' + my;
  }

  last = pts[pts.length - 1];
  d += ' L' + last[0] + ',' + last[1];
  return d;
}

function buildPrintCss(model, opts, scale) {
  return [
    '@page{size:' + opts.format + ';margin:' + opts.marginMm + 'mm;}',
    'html,body{margin:0;padding:0;background:#fff;color:#1a1209;',
      '-webkit-print-color-adjust:exact;print-color-adjust:exact;}',
    'body{font-family:\'Lora\',Georgia,serif;}',
    '.pdfx-doc{width:' + opts.printableWidthPx + 'px;margin:0 auto;}',
    '.pdfx-page{',
      'width:' + opts.printableWidthPx + 'px;',
      'min-height:' + opts.printableHeightPx + 'px;',
      'overflow:hidden;',
    '}',
    '.pdfx-page-frame{',
      'position:relative;',
      'width:' + opts.printableWidthPx + 'px;',
      'min-height:' + opts.printableHeightPx + 'px;',
      'overflow:hidden;',
    '}',
    '.pdfx-scale{transform:scale(' + scale + ');}',
    '.pdfx-surface{width:' + model.surfaceWidthPx + 'px;}'
  ].join('');
}

function buildPagesMarkup(model, pages, scale) {
  var wrapper = document.createElement('div');
  wrapper.className = 'pdfx-doc';

  pages.forEach(function (page) {
    var pageEl = document.createElement('section');
    var frameEl = document.createElement('div');
    var scaleEl = document.createElement('div');
    var surfaceEl = document.createElement('div');
    var overlayEl;

    pageEl.className = 'pdfx-page';
    frameEl.className = 'pdfx-page-frame';
    scaleEl.className = 'pdfx-scale';
    surfaceEl.className = 'pdfx-surface';

    scaleEl.style.width = model.surfaceWidthPx + 'px';
    scaleEl.style.height = Math.max(1, Math.ceil(page.sourceSpan * scale)) + 'px';
    surfaceEl.style.minHeight = Math.max(1, Math.ceil(page.sourceSpan)) + 'px';

    page.blocks.forEach(function (block) {
      surfaceEl.appendChild(block);
    });

    overlayEl = buildPageOverlaySvg(
      model.strokes,
      page.sourceStartY,
      page.sourceSpan,
      model.surfaceWidthPx
    );

    if (overlayEl) surfaceEl.appendChild(overlayEl);
    scaleEl.appendChild(surfaceEl);
    frameEl.appendChild(scaleEl);
    pageEl.appendChild(frameEl);
    wrapper.appendChild(pageEl);
  });

  return wrapper.innerHTML;
}

function shouldCloneStyleTag(node) {
  var text = node.textContent || '';
  return /katex|font-face/i.test(text);
}

function shouldCloneStylesheet(link) {
  var href = link.getAttribute('href') || '';
  var url;

  if (!href) return false;
  if (/katex|fonts\.googleapis\.com/i.test(href)) return true;

  try {
    url = new URL(href, document.baseURI);
    return url.origin === window.location.origin && /\.css(?:$|[?#])/i.test(url.pathname);
  } catch (err) {
    return false;
  }
}

function collectHeadAssets() {
  var assets = [];

  Array.prototype.slice.call(
    document.querySelectorAll('link[rel="stylesheet"], style')
  ).forEach(function (node) {
    if (node.tagName === 'STYLE') {
      if (!shouldCloneStyleTag(node)) return;
      assets.push('<style>' + escapeStyleText(node.textContent) + '</style>');
      return;
    }

    if (!shouldCloneStylesheet(node)) return;

    try {
      assets.push(
        '<link rel="stylesheet" href="'
        + escapeHtml(new URL(node.getAttribute('href'), document.baseURI).href)
        + '">'
      );
    } catch (err) {}
  });

  return assets.join('');
}

function buildPrintHtml(model, pages, opts, scale) {
  var css = EXPORT_SURFACE_CSS + buildPrintCss(model, opts, scale);
  var lang = escapeHtml(model.lang || document.documentElement.lang || 'pt-BR');
  var headAssets = collectHeadAssets();

  return [
    '<!DOCTYPE html>',
    '<html lang="' + lang + '">',
    '<head>',
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '<title>' + escapeHtml(model.title || 'Export PDF') + '</title>',
      headAssets,
      '<style>' + escapeStyleText(css) + '</style>',
    '</head>',
    '<body>',
      buildPagesMarkup(model, pages, scale),
    '</body>',
    '</html>'
  ].join('');
}

function waitForStyles(doc, timeoutMs) {
  var links = Array.prototype.slice.call(doc.querySelectorAll('link[rel="stylesheet"]'));

  return Promise.all(links.map(function (link) {
    return new Promise(function (resolve) {
      var done = false;

      function finish() {
        if (done) return;
        done = true;
        resolve();
      }

      if (link.sheet) {
        finish();
        return;
      }

      link.addEventListener('load', finish, { once: true });
      link.addEventListener('error', finish, { once: true });
      setTimeout(finish, timeoutMs);
    });
  }));
}

function waitForPrintable(doc, timeoutMs) {
  var fontsReady = doc.fonts && doc.fonts.ready
    ? doc.fonts.ready.catch(function () {})
    : Promise.resolve();

  return waitForStyles(doc, timeoutMs)
    .then(function () { return fontsReady; })
    .then(function () { return delay(180); });
}

function waitForPrintLifecycle(targetWin, opts) {
  opts = opts || {};

  return new Promise(function (resolve, reject) {
    var ownerWin = opts.ownerWindow || window;
    var ownerDoc = ownerWin.document || document;
    var done = false;
    var startedAt = Date.now();
    var cleanupFns = [];
    var finishDelayMs = Math.max(200, opts.focusDelayMs || DEFAULTS.focusDelayMs);
    var minDialogMs = Math.max(250, opts.minDialogMs || DEFAULTS.minDialogMs);
    var fallbackMs = Math.max(5000, opts.cleanupDelayMs || DEFAULTS.cleanupDelayMs);

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

    if (!targetWin || typeof targetWin.print !== 'function') {
      fail(new Error('pdf_exporter_print_unavailable'));
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

function cleanupFrame(frame) {
  if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
}

function printInIframe(html, opts) {
  return new Promise(function (resolve, reject) {
    var frame = document.createElement('iframe');
    var ready = false;
    var cleaned = false;

    function cleanup() {
      if (cleaned) return;
      cleaned = true;
      cleanupFrame(frame);
    }

    function finishReady() {
      var doc;
      var win;

      if (ready) return;
      ready = true;

      try {
        doc = frame.contentDocument || frame.contentWindow.document;
        win = frame.contentWindow;
      } catch (err) {
        cleanup();
        reject(err);
        return;
      }

      waitForPrintable(doc, opts.resourceTimeoutMs)
        .then(function () {
          return waitForPrintLifecycle(win, {
            ownerWindow: window,
            cleanupDelayMs: opts.cleanupDelayMs,
            focusDelayMs: opts.focusDelayMs,
            minDialogMs: opts.minDialogMs,
            onDispatched: opts.onDispatched
          });
        })
        .then(function () {
          cleanup();
          resolve();
        })
        .catch(function (err) {
          cleanup();
          reject(err);
        });
    }

    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    frame.style.opacity = '0';
    frame.style.pointerEvents = 'none';
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('tabindex', '-1');
    frame.addEventListener('load', finishReady, { once: true });

    document.body.appendChild(frame);

    try {
      if ('srcdoc' in frame) {
        frame.srcdoc = html;
      } else {
        var doc = frame.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
        setTimeout(finishReady, 0);
      }
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}

function exportEntry(input, options) {
  var opts = normalizeOptions(options);
  var model = buildExportModel(input);
  var scale = opts.printableWidthPx / model.surfaceWidthPx;
  var pageHeightLogicalPx = Math.max(1, Math.floor(opts.printableHeightPx / scale));
  var blocks = createContentBlocks(model);
  var measuredDoc = measureBlocks(blocks, model.surfaceWidthPx);
  var docTargetHeight = Math.max(
    measuredDoc.logicalHeight,
    Math.ceil(getMaxStrokeY(model.strokes) + SURFACE_PAD_TOP)
  );
  var measuredWithTail = appendSpacerBlocks(
    measuredDoc,
    docTargetHeight,
    Math.max(1, pageHeightLogicalPx - SURFACE_PAD_TOP)
  );
  var pages = paginateBlocks(measuredWithTail.blocks, pageHeightLogicalPx);
  var html;

  if (!pages.length) throw new Error('pdf_exporter_empty_document');

  html = buildPrintHtml(model, pages, opts, scale);
  return printInIframe(html, opts);
}

function isSupported() {
  return !!(document && document.body && typeof window.print === 'function');
}

global.PdfExporter = {
  exportEntry: exportEntry,
  isSupported: isSupported
};

}(window));
