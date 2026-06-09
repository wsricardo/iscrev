import { t } from '../ui/i18n.js';
import { uid } from '../shared/utils.js';
import { maybeGrowNotebookTail } from '../ui/modes.js';
import { showToast } from '../ui/toast.js';

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 2 — MÓDULO DE CANETA (SVG + Pointer Events)

   Arquitetura:
   • IIFE que retorna uma API pública (padrão módulo revelador)
   • Estado interno completamente privado
   • Comunicação com o app via callback _onStrokesChange
   • Coordenadas em espaço de documento (scroll-aware)
   • Bézier quadrática para suavização de traços
   • Douglas-Peucker para simplificação antes de persistir
   • requestAnimationFrame para batching de atualizações DOM
   ────────────────────────────────────────────────────────────────── */
export const Pen = (function () {

  /* ── Namespace SVG (obrigatório para createElementNS) ── */
  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* ── Limites de segurança ── */
  var MAX_STROKES = 500;   // traços por entrada (protege localStorage)
  var MAX_PTS_RAW = 2000;  // pontos brutos por traço (protege memória)
  var DP_EPSILON  = 1.5;   // tolerância Douglas-Peucker em pixels CSS

  /* ── Paleta de cores (whitelist explícita — sem input livre) ── */
  var COLORS = [
    { hex: '#1a1209', key: 'col.ink'   },
    { hex: '#8b3a1f', key: 'col.rust'  },
    { hex: '#c8843a', key: 'col.amber' },
    { hex: '#1a3a6b', key: 'col.blue'  },
    { hex: '#2d5a27', key: 'col.green' },
    { hex: '#8b1f1f', key: 'col.red'   }
  ];

  /* ── Presets de espessura ── */
  var WIDTHS = [
    { v: 1.5, key: 'w.thin'   },
    { v: 2.5, key: 'w.normal' },
    { v: 4.5, key: 'w.thick'  }
  ];

  /* ── Estado interno (privado) ── */
  var svgEl, layerEl, editorAreaEl;
  var penColor   = COLORS[0].hex;
  var penWidth   = WIDTHS[1].v;
  var eraserMode = false;
  var panMode    = false;
  var panning    = false;
  var panStartY  = 0;
  var panStartScrollTop = 0;
  var drawing    = false;
  var rawPts     = [];         // pontos brutos do traço atual
  var activePath = null;       // <path> SVG sendo desenhado
  var rafId      = null;       // ID do requestAnimationFrame pendente
  var strokes    = [];         // traços persistidos [{pts,c,w}]

  /* ── Validação / sanitização ──────────────────────────────────── */

  /** Aceita apenas cores da whitelist COLORS. */
  function sanitizeColor(c) {
    for (var i = 0; i < COLORS.length; i++)
      if (COLORS[i].hex === c) return c;
    return COLORS[0].hex;
  }

  /** Garante espessura dentro do intervalo [0.5, 8]. */
  function sanitizeWidth(w) {
    var n = parseFloat(w);
    return isFinite(n) ? Math.min(Math.max(n, 0.5), 8) : WIDTHS[1].v;
  }

  /** Garante que um ponto é par de inteiros finitos. */
  function sanitizePt(p) {
    return [
      Math.round(isFinite(p[0]) ? p[0] : 0),
      Math.round(isFinite(p[1]) ? p[1] : 0)
    ];
  }

  /**
   * Valida e sanitiza o array de traços carregado do localStorage.
   * Rejeita entradas malformadas; limita tamanhos; valida tipos.
   */
  function sanitizeStrokes(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, MAX_STROKES).reduce(function (acc, s) {
      if (!s || !Array.isArray(s.pts) || s.pts.length < 2) return acc;
      acc.push({
        pts: s.pts.slice(0, MAX_PTS_RAW).map(sanitizePt),
        c:   sanitizeColor(s.c),
        w:   sanitizeWidth(s.w)
      });
      return acc;
    }, []);
  }

  /* ── Algoritmo de simplificação de traços (Douglas-Peucker) ─────
     Reduz o número de pontos preservando a forma visual.
     Redução típica: 50–80% dos pontos originais são eliminados.
     Isso diminui drasticamente o tamanho no localStorage.         */

  /** Distância perpendicular de ponto p à linha a→b. */
  function perpDist(p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    if (dx === 0 && dy === 0) {
      var ex = p[0]-a[0], ey = p[1]-a[1];
      return Math.sqrt(ex*ex + ey*ey);
    }
    var t = ((p[0]-a[0])*dx + (p[1]-a[1])*dy) / (dx*dx + dy*dy);
    t = Math.max(0, Math.min(1, t));
    var fx = p[0] - (a[0]+t*dx), fy = p[1] - (a[1]+t*dy);
    return Math.sqrt(fx*fx + fy*fy);
  }

  /** Recursão interna do DP — retorna índices a manter (excluindo start/end). */
  function rdp(pts, eps, s, e) {
    if (e - s < 2) return [];
    var maxD = 0, maxI = s;
    for (var i = s+1; i < e; i++) {
      var d = perpDist(pts[i], pts[s], pts[e]);
      if (d > maxD) { maxD = d; maxI = i; }
    }
    if (maxD > eps) {
      return rdp(pts, eps, s, maxI).concat([maxI], rdp(pts, eps, maxI, e));
    }
    return [];
  }

  /** Aplica Douglas-Peucker e retorna array simplificado de pontos. */
  function simplify(pts, eps) {
    if (pts.length <= 2) return pts;
    var keep = [0].concat(rdp(pts, eps, 0, pts.length-1))
                  .concat([pts.length-1]);
    /* Ordena e deduplica índices */
    keep.sort(function (a, b) { return a - b; });
    var u = [keep[0]];
    for (var i = 1; i < keep.length; i++)
      if (keep[i] !== u[u.length-1]) u.push(keep[i]);
    return u.map(function (idx) { return pts[idx]; });
  }

  /* ── Geração de path SVG com Bézier quadrática ──────────────────
     Em vez de L (linha reta), usa Q (curva quadrática) passando
     pelo ponto médio entre o ponto atual e o próximo.
     Isso produz traços suaves e naturais sem biblioteca externa.  */

  /** Converte array de pontos em string do atributo d do SVG. */
  function toPathD(pts) {
    if (!pts || pts.length === 0) return '';
    if (pts.length === 1)
      return 'M' + pts[0][0] + ',' + pts[0][1];

    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var i = 1; i < pts.length - 1; i++) {
      /* Ponto médio = âncora da curva Bézier */
      var mx = (pts[i][0] + pts[i+1][0]) >> 1; // divisão inteira por 2
      var my = (pts[i][1] + pts[i+1][1]) >> 1;
      d += ' Q' + pts[i][0] + ',' + pts[i][1] + ' ' + mx + ',' + my;
    }
    var L = pts[pts.length-1];
    d += ' L' + L[0] + ',' + L[1];
    return d;
  }

  /* ── Criação de elemento <path> SVG ────────────────────────────── */

  /** Cria <path> com atributos visuais; usa createElementNS (seguro). */
  function makeSvgPath(color, width) {
    var p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('fill',             'none');
    p.setAttribute('stroke',           color);
    p.setAttribute('stroke-width',     width);
    p.setAttribute('stroke-linecap',   'round');
    p.setAttribute('stroke-linejoin',  'round');
    /* pointer-events:none por padrão; ativado para 'stroke' no modo borracha */
    p.style.pointerEvents = 'none';
    return p;
  }

  /* ── Sincronização com scroll ────────────────────────────────────
     O SVG é position:absolute sobre o editor-wrap (viewport fixo).
     Para que traços sejam scroll-aware, a camada <g> recebe um
     transform translate(0, -scrollTop), alinhando coordenadas de
     documento com a janela visual atual.                           */

  /** Aplica transform de scroll ao pen-layer. */
  function syncScroll() {
    if (layerEl && editorAreaEl) {
      layerEl.setAttribute('transform',
        'translate(0,' + (-editorAreaEl.scrollTop) + ')');
    }
  }

  /** Repassa wheel/trackpad para o único scroll container da aplicação. */
  function onWheel(e) {
    if (!editorAreaEl) return;
    var delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 20;
    if (e.deltaMode === 2) delta *= editorAreaEl.clientHeight;
    editorAreaEl.scrollTop += delta;
    maybeGrowNotebookTail();
    e.preventDefault();
  }

  /* ── Coordenadas scroll-aware ─────────────────────────────────── */

  /**
   * Converte evento de ponteiro em coordenadas de documento.
   * x: relativo ao SVG (viewport)
   * y: relativo ao SVG + scrollTop (documento)
   */
  function getDocCoords(e) {
    var rect = svgEl.getBoundingClientRect();
    return [
      Math.round(e.clientX - rect.left),
      Math.round(e.clientY - rect.top + editorAreaEl.scrollTop)
    ];
  }

  /* ── RAF batching ────────────────────────────────────────────────
     Durante o desenho, pointermove dispara dezenas de vezes por
     segundo. Em vez de atualizar o DOM em cada evento, acumulamos
     pontos e só atualizamos o path no próximo frame de animação.
     Isso garante 60fps suaves sem atualizações desnecessárias.    */

  /** Executado no próximo frame: atualiza o path em desenho. */
  function rafFlush() {
    rafId = null;
    if (activePath && rawPts.length >= 2) {
      activePath.setAttribute('d', toPathD(rawPts));
    }
  }

  /* ── Renderização de todos os traços ─────────────────────────────*/

  /** Re-renderiza a layer completa a partir do array strokes[]. */
  function renderAll() {
    /* Remove todos os filhos sem recriar o elemento <g> (preserva transform) */
    while (layerEl.firstChild) layerEl.removeChild(layerEl.firstChild);

    for (var i = 0; i < strokes.length; i++) {
      var s = strokes[i];
      var p = makeSvgPath(s.c, s.w);
      p.setAttribute('d', toPathD(s.pts));
      /* data-idx permite que o eraser identifique o traço sem busca linear */
      p.dataset.idx = i;
      if (eraserMode) p.style.pointerEvents = 'stroke';
      layerEl.appendChild(p);
    }
    updateCount();
  }

  /* ── Hit-testing geométrico para borracha ───────────────────────
     Busca o traço mais próximo de (docX, docY) dentro de HIT_RADIUS.
     Itera de trás para frente: traço mais recente tem prioridade.
     Usa distância ao quadrado para evitar Math.sqrt desnecessário.  */
  var HIT_RADIUS = 20;

  function eraserHitTest(docX, docY) {
    var r2 = HIT_RADIUS * HIT_RADIUS;
    for (var i = strokes.length - 1; i >= 0; i--) {
      var pts = strokes[i].pts;
      for (var j = 0; j < pts.length; j++) {
        var dx = pts[j][0] - docX;
        var dy = pts[j][1] - docY;
        if (dx * dx + dy * dy <= r2) return i;
      }
    }
    return -1;
  }

  function eraseAt(docX, docY) {
    var idx = eraserHitTest(docX, docY);
    if (idx === -1) return;
    strokes.splice(idx, 1);
    renderAll();
    notifyChange();
  }

  /* ── Handlers de Pointer Events ──────────────────────────────────
     Usando Pointer Events API (unifica mouse, touch, stylus).
     setPointerCapture garante que move/up chegam mesmo fora do SVG. */

  function onPointerDown(e) {
    /* Aceita apenas botão primário (esquerdo ou toque) */
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();

    if (panMode) {
      panning = true;
      panStartY = e.clientY;
      panStartScrollTop = editorAreaEl.scrollTop;
      svgEl.classList.add('pen-panning');
      svgEl.setPointerCapture(e.pointerId);
      return;
    }

    var coord = getDocCoords(e);

    /* ── Modo borracha: apaga no pointerdown e captura para arrastar ─ */
    if (eraserMode) {
      eraseAt(coord[0], coord[1]);
      /* setPointerCapture permite arrastar apagando múltiplos traços */
      svgEl.setPointerCapture(e.pointerId);
      return;
    }

    /* ── Modo caneta ── */
    drawing    = true;
    rawPts     = [coord];
    activePath = makeSvgPath(penColor, penWidth);
    activePath.style.willChange = 'd';
    layerEl.appendChild(activePath);
    svgEl.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (panMode) {
      if (!panning) return;
      e.preventDefault();
      editorAreaEl.scrollTop = Math.max(
        0,
        panStartScrollTop - Math.round(e.clientY - panStartY)
      );
      maybeGrowNotebookTail();
      return;
    }

    e.preventDefault();

    /* Borracha arrastada: apaga traços sob o caminho do ponteiro */
    if (eraserMode) {
      if (e.buttons === 0) return; /* botão solto: não apaga */
      var coord = getDocCoords(e);
      eraseAt(coord[0], coord[1]);
      return;
    }

    if (!drawing) return;
    if (rawPts.length >= MAX_PTS_RAW) return;

    var pt   = getDocCoords(e);
    var last = rawPts[rawPts.length - 1];
    /* Filtra micro-movimentos < 1px: reduz pontos redundantes */
    if (Math.abs(pt[0]-last[0]) < 1 && Math.abs(pt[1]-last[1]) < 1) return;
    rawPts.push(pt);
    if (rafId === null) rafId = requestAnimationFrame(rafFlush);
  }

  function onPointerUp(e) {
    if (panning) {
      panning = false;
      svgEl.classList.remove('pen-panning');
      e.preventDefault();
      return;
    }

    if (!drawing) return;
    drawing = false;
    e.preventDefault();

    /* Cancela RAF pendente — vamos atualizar agora */
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }

    /* Libera hint GPU */
    if (activePath) activePath.style.willChange = 'auto';

    /* Clique simples sem movimento: descarta */
    if (rawPts.length < 2) {
      if (activePath && activePath.parentNode)
        layerEl.removeChild(activePath);
      activePath = null; rawPts = []; return;
    }

    /* Simplifica pontos com Douglas-Peucker antes de persistir */
    var simplified = simplify(rawPts, DP_EPSILON);

    /* Guarda traço se dentro do limite */
    if (strokes.length < MAX_STROKES) {
      var stroke = { pts: simplified, c: penColor, w: penWidth };
      strokes.push(stroke);
      /* Atualiza o path com dados simplificados e registra índice */
      activePath.setAttribute('d', toPathD(simplified));
      activePath.dataset.idx = strokes.length - 1;
    } else {
      /* Limite atingido: remove o path provisório */
      layerEl.removeChild(activePath);
      showToast(typeof t === 'function' ? t('toast.limit') : 'Limite de traços atingido (500).');
    }

    activePath = null; rawPts = [];
    updateCount();
    notifyChange(); /* persiste imediatamente após cada traço completo */
  }

  function onPointerCancel(e) {
    /* Ponteiro cancelado (ex: ligação telefônica em mobile): finaliza traço */
    if (panning) {
      panning = false;
      svgEl.classList.remove('pen-panning');
    }
    if (drawing) onPointerUp(e);
  }

  /* ── Borracha: remove traço clicado ──────────────────────────────
     Em modo borracha, pointer-events:'stroke' nos paths permite
     que o browser detecte cliques sobre a linha do traço.          */

  function onEraserClick(e) {
    if (!eraserMode) return;
    var target = e.target;
    /* Sobe o DOM até encontrar um path com data-idx */
    while (target && target !== layerEl) {
      if (target.dataset && target.dataset.idx !== undefined) {
        var idx = parseInt(target.dataset.idx, 10);
        if (isFinite(idx) && idx >= 0 && idx < strokes.length) {
          strokes.splice(idx, 1);
          renderAll(); /* re-renderiza para atualizar índices */
          notifyChange();
        }
        return;
      }
      target = target.parentNode;
    }
  }

  /* ── Comunicação com o app ────────────────────────────────────── */

  /** Notifica o app que os traços mudaram (callback injetado via API). */
  function notifyChange() {
    if (typeof Pen._onStrokesChange === 'function')
      Pen._onStrokesChange(strokes);
  }

  /* ── UI helpers ─────────────────────────────────────────────────── */

  function updateCount() {
    var el = document.getElementById('pen-stroke-count');
    if (!el) return;
    var n = strokes.length;
    var lbl = typeof t === 'function'
      ? (n === 1 ? t('stroke.1') : t('stroke.n'))
      : (n === 1 ? 'traço' : 'traços');
    el.textContent = n ? n + ' ' + lbl : '';
  }

  function syncToolButtons() {
    var panBtn = document.getElementById('pen-pan');
    if (panBtn) panBtn.classList.toggle('active', panMode);
    var eraserBtn = document.getElementById('pen-eraser');
    if (eraserBtn) eraserBtn.classList.toggle('active', eraserMode);
  }

  /* ── API pública ─────────────────────────────────────────────────── */
  return {

    /** Callback injetado pelo app para receber notificação de mudanças. */
    _onStrokesChange: null,

    /**
     * Inicializa o módulo. Deve ser chamado uma vez após o DOM estar pronto.
     * @param {SVGElement} svgElement  Elemento #pen-svg
     * @param {SVGGElement} layerElement  Elemento #pen-layer
     * @param {HTMLElement} editorAreaElement  Elemento #editor-area (scrollável)
     */
    init: function (svgElement, layerElement, editorAreaElement) {
      svgEl        = svgElement;
      layerEl      = layerElement;
      editorAreaEl = editorAreaElement;

      /* Scroll: atualiza transform da layer quando editor-area rola */
      editorAreaEl.addEventListener('scroll', syncScroll, { passive: true });

      /* Pointer Events no SVG */
      svgEl.addEventListener('pointerdown',   onPointerDown);
      svgEl.addEventListener('pointermove',   onPointerMove);
      svgEl.addEventListener('pointerup',     onPointerUp);
      svgEl.addEventListener('pointercancel', onPointerCancel);
      svgEl.addEventListener('click',         onEraserClick);
      svgEl.addEventListener('wheel',         onWheel, { passive: false });

      /* Constrói controles da toolbar */
      this.buildToolbar();
    },

    /** Ativa o modo caneta (captura eventos, muda cursor). */
    activate: function () {
      svgEl.classList.add('pen-active');
      svgEl.classList.toggle('pen-eraser', eraserMode);
      svgEl.classList.toggle('pen-pan', !eraserMode && panMode);
      svgEl.classList.remove('pen-panning');
    },

    /** Desativa o modo caneta (apenas overlay visual, sem captura). */
    deactivate: function () {
      panning = false;
      svgEl.classList.remove('pen-active', 'pen-eraser', 'pen-pan', 'pen-panning');
      /* Garante que nenhum traço fica em aberto */
      if (drawing) onPointerUp({ preventDefault: function(){}, pointerId: null });
    },

    /** Torna o overlay visível nas superfícies canônicas (preview/pen). */
    showOverlay: function () {
      svgEl.classList.add('pen-visible');
      syncScroll();
    },

    /** Oculta completamente o overlay no modo edição-fonte. */
    hideOverlay: function () {
      this.deactivate();
      svgEl.classList.remove('pen-visible');
    },

    /**
     * Carrega traços de uma entrada.
     * @param {Array} savedStrokes  Array de {pts,c,w} do localStorage
     */
    load: function (savedStrokes) {
      strokes = sanitizeStrokes(savedStrokes || []);
      syncScroll();
      renderAll();
    },

    /** Retorna cópia dos traços atuais para persistência. */
    getStrokes: function () { return strokes; },

    /** Remove o último traço (Ctrl+Z). */
    undo: function () {
      if (!strokes.length) return;
      strokes.pop();
      /* Remove o último path da layer diretamente (mais rápido que renderAll) */
      var last = layerEl.lastChild;
      if (last) layerEl.removeChild(last);
      updateCount();
      notifyChange();
      showToast(typeof t === 'function' ? t('toast.undo') : 'Traço removido ↩');
    },

    /** Remove todos os traços com confirmação. */
    clear: function () {
      if (!strokes.length) return;
      if (!confirm(typeof t === 'function' ? t('cf.clear') : 'Apagar todas as anotações desta entrada?')) return;
      strokes = [];
      renderAll();
      notifyChange();
      showToast(typeof t === 'function' ? t('toast.clear') : 'Anotações limpas ✓');
    },

    /** Define cor ativa (apenas cores da whitelist). */
    setColor: function (color) {
      penColor   = sanitizeColor(color);
      eraserMode = false;
      svgEl.classList.remove('pen-eraser');
      syncToolButtons();
    },

    /** Define espessura ativa (clamped ao intervalo [0.5, 8]). */
    setWidth: function (width) { penWidth = sanitizeWidth(width); },

    /** Liga/desliga modo borracha. */
    setEraser: function (on) {
      eraserMode = !!on;
      if (eraserMode) panMode = false;
      svgEl.classList.toggle('pen-eraser',
        eraserMode && svgEl.classList.contains('pen-active'));
      svgEl.classList.remove('pen-pan', 'pen-panning');
      syncToolButtons();
      /* pointer-events nos paths permanece 'none':
         o hit-test é geométrico (eraserHitTest), não via DOM */
    },

    /** Liga/desliga modo mão/pan para rolagem por arraste. */
    setPan: function (on) {
      panMode = !!on;
      if (panMode) eraserMode = false;
      panning = false;
      svgEl.classList.remove('pen-eraser', 'pen-panning');
      svgEl.classList.toggle('pen-pan',
        panMode && svgEl.classList.contains('pen-active'));
      syncToolButtons();
    },

    /**
     * Gera um overlay SVG alinhado à superfície canônica inteira.
     *
     * Diferente de buildPrintSvg(), este método preserva o sistema de
     * coordenadas do modo Pen/Preview: origem em (0,0) no topo da área
     * visível do editor e y em espaço de documento.
     *
     * @param {number} surfaceWidth  Largura da superfície canônica em px
     * @param {number} surfaceHeight Altura mínima do conteúdo em px
     * @returns {SVGElement|null} SVG absoluto pronto para sobrepor o preview
     */
    buildPrintOverlay: function (surfaceWidth, surfaceHeight) {
      if (!strokes.length) return null;

      var PAD  = 12;
      var maxX = Math.max(1, Math.round(surfaceWidth  || 0));
      var maxY = Math.max(1, Math.round(surfaceHeight || 0));

      for (var i = 0; i < strokes.length; i++) {
        var pts = strokes[i].pts;
        for (var j = 0; j < pts.length; j++) {
          if (pts[j][0] > maxX) maxX = pts[j][0];
          if (pts[j][1] > maxY) maxY = pts[j][1];
        }
      }

      maxX += PAD;
      maxY += PAD;

      var svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('xmlns',   SVG_NS);
      svg.setAttribute('viewBox', '0 0 ' + maxX + ' ' + maxY);
      svg.setAttribute('width',   maxX);
      svg.setAttribute('height',  maxY);
      svg.setAttribute('role',       'img');
      svg.setAttribute('aria-label', 'Anotações manuscritas');
      svg.id = 'print-overlay-tmp';
      svg.style.position = 'absolute';
      svg.style.left     = '0';
      svg.style.top      = '0';
      svg.style.width    = maxX + 'px';
      svg.style.height   = maxY + 'px';
      svg.style.pointerEvents = 'none';

      for (var k = 0; k < strokes.length; k++) {
        var s = strokes[k];
        var p = document.createElementNS(SVG_NS, 'path');
        p.setAttribute('fill',            'none');
        p.setAttribute('stroke',          s.c);
        p.setAttribute('stroke-width',    s.w);
        p.setAttribute('stroke-linecap',  'round');
        p.setAttribute('stroke-linejoin', 'round');
        p.setAttribute('d', toPathD(s.pts));
        svg.appendChild(p);
      }
      return svg;
    },

    /**
     * Gera um <svg> standalone para impressão/PDF.
     *
     * Por que não reutilizar o #pen-svg overlay?
     *   O overlay usa position:absolute + coordenadas de documento
     *   (y inclui scrollTop). Em @media print não há viewport fixo
     *   nem scrollTop. Sem viewBox, os paths ficam fora da área visível.
     *
     * Solução: calcular o bounding box real de todos os traços e
     *   usar como viewBox. O SVG resultante é autossuficiente —
     *   sem transforms, sem dependência de tela.
     *
     * @returns {SVGElement|null} SVG pronto para injeção, ou null se sem traços
     */
    buildPrintSvg: function () {
      if (!strokes.length) return null;

      /* 1. Bounding box de todos os pontos */
      var minX =  Infinity, minY =  Infinity;
      var maxX = -Infinity, maxY = -Infinity;
      for (var i = 0; i < strokes.length; i++) {
        var pts = strokes[i].pts;
        for (var j = 0; j < pts.length; j++) {
          if (pts[j][0] < minX) minX = pts[j][0];
          if (pts[j][1] < minY) minY = pts[j][1];
          if (pts[j][0] > maxX) maxX = pts[j][0];
          if (pts[j][1] > maxY) maxY = pts[j][1];
        }
      }
      if (!isFinite(minX)) return null;

      /* 2. viewBox com padding */
      var PAD = 12;
      var vbX = minX - PAD, vbY = minY - PAD;
      var vbW = Math.max(1, (maxX - minX) + PAD * 2);
      var vbH = Math.max(1, (maxY - minY) + PAD * 2);

      /* 3. Cria SVG com dimensões explícitas */
      var svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('xmlns',   SVG_NS);
      svg.setAttribute('viewBox', vbX + ' ' + vbY + ' ' + vbW + ' ' + vbH);
      svg.setAttribute('width',   '100%');
      svg.setAttribute('height',  Math.round(vbH) + 'px');
      svg.style.display   = 'block';
      svg.style.maxWidth  = '100%';
      svg.style.marginTop = '20px';
      svg.setAttribute('role',       'img');
      svg.setAttribute('aria-label', 'Anotações manuscritas');

      /* 4. Recria cada traço como <path> */
      for (var k = 0; k < strokes.length; k++) {
        var s = strokes[k];
        var p = document.createElementNS(SVG_NS, 'path');
        p.setAttribute('fill',            'none');
        p.setAttribute('stroke',          s.c);
        p.setAttribute('stroke-width',    s.w);
        p.setAttribute('stroke-linecap',  'round');
        p.setAttribute('stroke-linejoin', 'round');
        p.setAttribute('d', toPathD(s.pts));
        svg.appendChild(p);
      }
      return svg;
    },

    /**
     * Constrói os controles da pen-toolbar dinamicamente.
     * Geração por JS evita HTML repetitivo e facilita manutenção.
     */
    buildToolbar: function () {
      var self = this;

      /* ── Cores ── */
      var colorsEl = document.getElementById('pen-colors');
      if (colorsEl) {
        colorsEl.innerHTML = '';
        COLORS.forEach(function (c) {
          var label = typeof t === 'function' ? t(c.key) : c.key;
          var btn = document.createElement('button');
          btn.className = 'pen-color-swatch' + (c.hex === penColor ? ' active' : '');
          btn.style.background = c.hex;
          btn.title = label;
          btn.setAttribute('aria-label', (typeof t === 'function' ? t('pen.color') : 'Cor:') + ' ' + label);
          btn.addEventListener('click', function () {
            self.setColor(c.hex);
            colorsEl.querySelectorAll('.pen-color-swatch')
              .forEach(function (x) { x.classList.remove('active'); });
            btn.classList.add('active');
          });
          colorsEl.appendChild(btn);
        });
      }

      /* ── Espessuras ── */
      var widthsEl = document.getElementById('pen-widths');
      if (widthsEl) {
        widthsEl.innerHTML = '';
        WIDTHS.forEach(function (w) {
          var label = typeof t === 'function' ? t(w.key) : w.key;
          var btn = document.createElement('button');
          btn.className = 'pen-width-btn' + (w.v === penWidth ? ' active' : '');
          btn.title     = label + ' (' + w.v + 'px)';
          btn.setAttribute('aria-label', (typeof t === 'function' ? t('pen.width') : 'Espessura:') + ' ' + label);
          /* Miniatura SVG ilustrando a espessura */
          btn.innerHTML = '<svg width="28" height="14" aria-hidden="true">'
            + '<line x1="4" y1="7" x2="24" y2="7"'
            + ' stroke="currentColor"'
            + ' stroke-width="' + w.v + '"'
            + ' stroke-linecap="round"/></svg>';
          btn.addEventListener('click', function () {
            self.setWidth(w.v);
            widthsEl.querySelectorAll('.pen-width-btn')
              .forEach(function (x) { x.classList.remove('active'); });
            btn.classList.add('active');
          });
          widthsEl.appendChild(btn);
        });
      }

      /* ── Mão, Borracha, Desfazer, Limpar ─────────────────────────
         cloneNode(true) + replaceChild remove TODOS os listeners
         anteriores. Necessário porque buildToolbar() é chamada mais
         de uma vez (init + applyLocale), e addEventListener empilha
         listeners sem remover os antigos. Com 2 listeners no botão
         da borracha, cada clique liga e imediatamente desliga o modo,
         resultando em eraserMode=false após o clique. ── */
      function rewire(id, handler) {
        var oldBtn = document.getElementById(id);
        if (!oldBtn) return null;
        var newBtn = oldBtn.cloneNode(true); /* cópia sem listeners */
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);
        newBtn.addEventListener('click', handler);
        return newBtn;
      }

      rewire('pen-pan', function () {
        self.setPan(!panMode);
      });

      rewire('pen-eraser', function () {
        self.setEraser(!eraserMode);
        if (eraserMode && colorsEl)
          colorsEl.querySelectorAll('.pen-color-swatch')
            .forEach(function (x) { x.classList.remove('active'); });
      });

      rewire('pen-undo',  function () { self.undo();  });
      rewire('pen-clear', function () { self.clear(); });
      syncToolButtons();
    }
  };

})(); /* fim do módulo Pen */



// Compatibilidade global
window.Pen = Pen;
