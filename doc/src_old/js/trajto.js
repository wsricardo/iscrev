/* ═══════════════════════════════════════════════════════════════════
   MEU DIÁRIO — Script principal
   Encapsulado em IIFE para evitar poluição do escopo global.
   KaTeX já disponível de forma síncrona (sem defer).
═══════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

/* ══════════════════════════════════════════════════════════════════
   SEÇÃO 0 — INTERNACIONALIZAÇÃO (i18n)

   Arquitectura: dicionário estático + varredura de IDs no DOM.
   • I18N[lang][key] → string traduzida
   • t(key)          → string do idioma ativo (fallback: 'pt')
   • applyLocale(lang) → atualiza todos os nós de texto do DOM
   • Idioma ativo persiste em localStorage['diario_lang']
   • Detecção automática via navigator.language na primeira visita
══════════════════════════════════════════════════════════════════ */

var I18N = {
  pt: {
    /* Logo */
    'logo.title':   'Meu Diário',
    'logo.sub':     'anotações pessoais',
    /* Sidebar */
    'lang.label':   'Idioma:',
    'fs.enter':     'Tela cheia',
    'fs.exit':      'Sair da tela cheia',
    'btn.new':      'Nova Entrada',
    'search.ph':    'Buscar entradas…',
    /* Welcome */
    'welcome.title':'Bem-vindo ao seu diário',
    'welcome.sub':  'Selecione uma entrada ou crie uma nova.',
    /* Toolbar formatting */
    'fmt.bold':     'Negrito (**texto**)',
    'fmt.italic':   'Itálico (*texto*)',
    'fmt.quote':    'Citação (> texto)',
    'fmt.list':     'Lista (- item)',
    'btn.eq':       'Equação',
    /* Toolbar modes */
    'mode.edit':    'Editar',
    'mode.pen':     'Caneta',
    'mode.preview': 'Preview',
    /* Toolbar actions */
    'btn.md':       'Markdown',
    'btn.md.title': 'Baixar como Markdown (.md)',
    'btn.pdf.title':'Exportar como PDF',
    'btn.delete':   'Excluir',
    'btn.save':     'Salvar',
    /* Pen toolbar */
    'pen.color':    'Cor:',
    'pen.width':    'Espessura:',
    'pen.eraser':   'Borracha',
    'pen.eraser.t': 'Borracha: arraste sobre um traço para apagá-lo',
    'pen.undo':     'Desfazer',
    'pen.undo.t':   'Desfazer último traço (Ctrl+Z)',
    'pen.clear':    'Limpar',
    'pen.clear.t':  'Apagar todos os traços',
    /* Pen colors */
    'col.ink':      'Tinta',
    'col.rust':     'Ferrugem',
    'col.amber':    'Âmbar',
    'col.blue':     'Azul',
    'col.green':    'Verde',
    'col.red':      'Vermelho',
    /* Pen widths */
    'w.thin':       'Fina',
    'w.normal':     'Normal',
    'w.thick':      'Grossa',
    /* Editor */
    'ed.title.ph':  'Título da entrada…',
    'ed.body.ph':   'Escreva aqui…  $inline$ ou $$bloco$$ para LaTeX.',
    /* Stats */
    'stats.word':   'palavra',
    'stats.words':  'palavras',
    'stats.hint':   'LaTeX: <b>$inline$</b> · <b>$$bloco$$</b>',
    /* Equation dialog */
    'eq.title':     'Inserir Equação LaTeX',
    'eq.desc':      'Digite o código LaTeX e confira a pré-visualização em tempo real.',
    'eq.inline':    'Inline \u00a0$…$',
    'eq.block':     'Bloco \u00a0$$…$$',
    'eq.prev.lbl':  'Pré-visualização',
    'eq.waiting':   'aguardando…',
    'eq.cancel':    'Cancelar',
    'eq.insert':    'Inserir',
    /* Mood */
    'mood.default':    '😐 Humor',
    'mood.happy':      '😊 Feliz',
    'mood.sad':        '😢 Triste',
    'mood.frustrated': '😤 Frustrado',
    'mood.calm':       '😌 Calmo',
    'mood.love':       '🥰 Apaixonado',
    'mood.tired':      '😴 Cansado',
    'mood.excited':    '🤩 Animado',
    'mood.anxious':    '😰 Ansioso',
    'mood.thoughtful': '🤔 Pensativo',
    /* Toasts */
    'toast.new':    'Nova entrada criada ✦',
    'toast.saved':  'Salvo ✓',
    'toast.del':    'Entrada excluída.',
    'toast.md':     'Markdown baixado ✓',
    'toast.pdf':    'PDF gerado ✓',
    'toast.eq':     'Equação inserida ✓',
    'toast.limit':  'Limite de traços atingido (500).',
    'toast.undo':   'Traço removido ↩',
    'toast.clear':  'Anotações limpas ✓',
    /* Confirms */
    'cf.del':       'Excluir esta entrada permanentemente?',
    'cf.clear':     'Apagar todas as anotações desta entrada?',
    /* List */
    'list.empty':   'Nenhuma entrada ainda.',
    'list.none':    'Nenhum resultado.',
    'list.untitled':'Sem título',
    'list.empty.b': 'Entrada vazia…',
    /* Strokes */
    'stroke.1':     'traço',
    'stroke.n':     'traços',
    /* Export */
    'exp.title':    'titulo',
    'exp.date':     'data',
    'exp.mood':     'humor',
    'exp.strokes':  'tracos',
    'exp.svg.lbl':  'Anotações manuscritas:'
  },

  en: {
    /* Logo */
    'logo.title':   'My Diary',
    'logo.sub':     'personal notes',
    /* Sidebar */
    'lang.label':   'Lang:',
    'fs.enter':     'Full screen',
    'fs.exit':      'Exit full screen',
    'btn.new':      'New Entry',
    'search.ph':    'Search entries…',
    /* Welcome */
    'welcome.title':'Welcome to your diary',
    'welcome.sub':  'Select an entry or create a new one.',
    /* Toolbar formatting */
    'fmt.bold':     'Bold (**text**)',
    'fmt.italic':   'Italic (*text*)',
    'fmt.quote':    'Blockquote (> text)',
    'fmt.list':     'List (- item)',
    'btn.eq':       'Equation',
    /* Toolbar modes */
    'mode.edit':    'Edit',
    'mode.pen':     'Pen',
    'mode.preview': 'Preview',
    /* Toolbar actions */
    'btn.md':       'Markdown',
    'btn.md.title': 'Download as Markdown (.md)',
    'btn.pdf.title':'Export as PDF',
    'btn.delete':   'Delete',
    'btn.save':     'Save',
    /* Pen toolbar */
    'pen.color':    'Color:',
    'pen.width':    'Width:',
    'pen.eraser':   'Eraser',
    'pen.eraser.t': 'Eraser: drag over a stroke to erase it',
    'pen.undo':     'Undo',
    'pen.undo.t':   'Undo last stroke (Ctrl+Z)',
    'pen.clear':    'Clear',
    'pen.clear.t':  'Clear all strokes',
    /* Pen colors */
    'col.ink':      'Ink',
    'col.rust':     'Rust',
    'col.amber':    'Amber',
    'col.blue':     'Blue',
    'col.green':    'Green',
    'col.red':      'Red',
    /* Pen widths */
    'w.thin':       'Thin',
    'w.normal':     'Normal',
    'w.thick':      'Thick',
    /* Editor */
    'ed.title.ph':  'Entry title…',
    'ed.body.ph':   'Write here…  $inline$ or $$block$$ for LaTeX.',
    /* Stats */
    'stats.word':   'word',
    'stats.words':  'words',
    'stats.hint':   'LaTeX: <b>$inline$</b> · <b>$$block$$</b>',
    /* Equation dialog */
    'eq.title':     'Insert LaTeX Equation',
    'eq.desc':      'Type the LaTeX code and check the live preview.',
    'eq.inline':    'Inline \u00a0$…$',
    'eq.block':     'Block \u00a0$$…$$',
    'eq.prev.lbl':  'Preview',
    'eq.waiting':   'waiting…',
    'eq.cancel':    'Cancel',
    'eq.insert':    'Insert',
    /* Mood */
    'mood.default':    '😐 Mood',
    'mood.happy':      '😊 Happy',
    'mood.sad':        '😢 Sad',
    'mood.frustrated': '😤 Frustrated',
    'mood.calm':       '😌 Calm',
    'mood.love':       '🥰 In love',
    'mood.tired':      '😴 Tired',
    'mood.excited':    '🤩 Excited',
    'mood.anxious':    '😰 Anxious',
    'mood.thoughtful': '🤔 Thoughtful',
    /* Toasts */
    'toast.new':    'New entry created ✦',
    'toast.saved':  'Saved ✓',
    'toast.del':    'Entry deleted.',
    'toast.md':     'Markdown downloaded ✓',
    'toast.pdf':    'PDF generated ✓',
    'toast.eq':     'Equation inserted ✓',
    'toast.limit':  'Stroke limit reached (500).',
    'toast.undo':   'Stroke undone ↩',
    'toast.clear':  'Annotations cleared ✓',
    /* Confirms */
    'cf.del':       'Permanently delete this entry?',
    'cf.clear':     'Clear all annotations for this entry?',
    /* List */
    'list.empty':   'No entries yet.',
    'list.none':    'No results.',
    'list.untitled':'Untitled',
    'list.empty.b': 'Empty entry…',
    /* Strokes */
    'stroke.1':     'stroke',
    'stroke.n':     'strokes',
    /* Export */
    'exp.title':    'title',
    'exp.date':     'date',
    'exp.mood':     'mood',
    'exp.strokes':  'strokes',
    'exp.svg.lbl':  'Handwritten annotations:'
  }
};

/* ── Idioma ativo ── */
var currentLang = (function () {
  var s = localStorage.getItem('diario_lang');
  if (s && I18N[s]) return s;
  return (navigator.language || '').startsWith('pt') ? 'pt' : 'en';
}());

/** Retorna string traduzida. Fallback: pt → chave crua. */
function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key])
      || (I18N.pt && I18N.pt[key])
      || key;
}

/**
 * Aplica o idioma ativo ao DOM inteiro.
 * Estratégia: IDs explícitos → textContent / innerHTML / placeholder / title.
 * Regenera o mood-select e reconstrói a pen toolbar.
 * @param {string} lang  'pt' | 'en'
 */
function applyLocale(lang) {
  if (!I18N[lang]) return;
  doApply(lang);
}

/* Núcleo da atualização — chamado dentro ou fora do fade */
function doApply(lang) {
    currentLang = lang;
    localStorage.setItem('diario_lang', lang);

    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

    var TEXT_MAP = [
      ['logo-title',        'logo.title',    'text'],
      ['logo-sub',          'logo.sub',      'text'],
      ['btn-new-label',     'btn.new',       'text'],
      ['welcome-title',     'welcome.title', 'text'],
      ['welcome-sub',       'welcome.sub',   'text'],
      ['btn-eq-label',      'btn.eq',        'text'],
      ['mode-edit-label',   'mode.edit',     'text'],
      ['mode-pen-label',    'mode.pen',      'text'],
      ['mode-preview-label','mode.preview',  'text'],
      ['btn-md-label',      'btn.md',        'text'],
      ['btn-delete-label',  'btn.delete',    'text'],
      ['btn-save-label',    'btn.save',      'text'],
      ['pen-color-label',   'pen.color',     'text'],
      ['pen-width-label',   'pen.width',     'text'],
      ['pen-eraser-label',  'pen.eraser',    'text'],
      ['pen-undo-label',    'pen.undo',      'text'],
      ['pen-clear-label',   'pen.clear',     'text'],
      ['latex-hint',        'stats.hint',    'html'],
      ['eq-title',          'eq.title',      'text'],
      ['eq-desc',           'eq.desc',       'text'],
      ['eq-inline-btn',     'eq.inline',     'text'],
      ['eq-block-btn',      'eq.block',      'text'],
      ['eq-preview-label',  'eq.prev.lbl',   'text'],
      ['eq-cancel',         'eq.cancel',     'text'],
      ['eq-insert',         'eq.insert',     'text'],
      ['search-input',      'search.ph',     'ph'],
      ['entry-title',       'ed.title.ph',   'ph'],
      ['entry-raw',         'ed.body.ph',    'ph'],
      ['btn-export-md',     'btn.md.title',  'title'],
      ['btn-export-pdf',    'btn.pdf.title', 'title'],
      ['btn-fullscreen',    'fs.enter',      'title'],
      ['pen-eraser',        'pen.eraser.t',  'title'],
      ['pen-undo',          'pen.undo.t',    'title'],
      ['pen-clear',         'pen.clear.t',   'title'],
      ['fmt-bold',          'fmt.bold',      'title'],
      ['fmt-italic',        'fmt.italic',    'title'],
      ['fmt-quote',         'fmt.quote',     'title'],
      ['fmt-list',          'fmt.list',      'title']
    ];

    TEXT_MAP.forEach(function (row) {
      var el = document.getElementById(row[0]);
      if (!el) return;
      var str = t(row[1]);
      if      (row[2] === 'html')  el.innerHTML    = str;
      else if (row[2] === 'ph')    el.placeholder  = str;
      else if (row[2] === 'title') el.title        = str;
      else                          el.textContent  = str;
    });

    var ew = document.getElementById('eq-waiting');
    if (ew) ew.textContent = t('eq.waiting');

    var MOODS = [
      { v:'',    k:'mood.default'    },
      { v:'😊', k:'mood.happy'      },
      { v:'😢', k:'mood.sad'        },
      { v:'😤', k:'mood.frustrated' },
      { v:'😌', k:'mood.calm'       },
      { v:'🥰', k:'mood.love'       },
      { v:'😴', k:'mood.tired'      },
      { v:'🤩', k:'mood.excited'    },
      { v:'😰', k:'mood.anxious'    },
      { v:'🤔', k:'mood.thoughtful' }
    ];
    var moodSel = document.getElementById('mood-select');
    if (moodSel) {
      var cur = moodSel.value;
      moodSel.innerHTML = MOODS.map(function (m) {
        return '<option value="' + m.v + '">' + t(m.k) + '</option>';
      }).join('');
      moodSel.value = cur;
    }

    document.querySelectorAll('#lang-switcher .lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    if (typeof Pen !== 'undefined' && Pen.buildToolbar) Pen.buildToolbar();
    if (typeof updateStats === 'function') updateStats();
    if (typeof renderList  === 'function')
      renderList(document.getElementById('search-input')
        ? document.getElementById('search-input').value : '');
}
/* fim doApply */

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 1 — RENDERIZAÇÃO LATEX + MARKDOWN
   ────────────────────────────────────────────────────────────────── */

/**
 * Converte string LaTeX em HTML usando katex.renderToString().
 * Em caso de erro (LaTeX inválido), retorna span com mensagem visual.
 * @param {string} latex  Código LaTeX sem delimitadores $
 * @param {boolean} display  true = bloco centralizado, false = inline
 * @returns {string} HTML string pronta para innerHTML
 */
function renderTex(latex, display) {
  try {
    return katex.renderToString(latex, {
      displayMode:  display,
      throwOnError: true,
      strict:       false
    });
  } catch (err) {
    return '<span style="color:#c0392b;font-family:monospace;font-size:.82em">'
      + escHtml(latex) + ' ⚠ ' + escHtml(err.message) + '</span>';
  }
}

/** Escapa caracteres HTML especiais para evitar XSS em texto exibido. */
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/**
 * Converte texto bruto (Markdown + LaTeX) em HTML renderizado.
 *
 * Algoritmo em dois passos:
 *  1. Tokenização: percorre a string e separa segmentos math ($$/$)
 *     dos segmentos de texto puro, preservando a ordem original.
 *  2. Conversão: cada token math vai direto para renderTex();
 *     cada token texto passa pelo conversor Markdown.
 *
 * Não usa placeholders nem DOM scanning — tudo síncrono em string.
 */
function mdToHtml(src) {
  var tokens = [];
  var re     = /\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g;
  var last   = 0, m;

  while ((m = re.exec(src)) !== null) {
    if (m.index > last)
      tokens.push({ k: 'text', v: src.slice(last, m.index) });
    if (m[1] !== undefined) tokens.push({ k: 'block',  v: m[1] });
    else                    tokens.push({ k: 'inline', v: m[2] });
    last = m.index + m[0].length;
  }
  if (last < src.length) tokens.push({ k: 'text', v: src.slice(last) });

  return tokens.map(function (tok) {
    if (tok.k === 'block')
      return '<div class="math-block">'
        + renderTex(tok.v.trim(), true) + '</div>';
    if (tok.k === 'inline')
      return '<span class="math-inline">'
        + renderTex(tok.v.trim(), false) + '</span>';
    return convertMarkdown(tok.v);
  }).join('');
}

/** Converte segmento de texto puro em HTML com Markdown básico. */
function convertMarkdown(raw) {
  var s = escHtml(raw);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/^(#{1})\s+(.*)$/gm, '<h1>$2</h1>');
  s = s.replace(/^(#{2})\s+(.*)$/gm, '<h2>$2</h2>');
  s = s.replace(/^(#{3})\s+(.*)$/gm, '<h3>$2</h3>');
  s = s.replace(/^(#{4})\s+(.*)$/gm, '<h4>$2</h4>');
  s = s.replace(/^(#{5})\s+(.*)$/gm, '<h5>$2</h5>');
  s = s.replace(/^(#{6})\s+(.*)$/gm, '<h6>$2</h6>');
  //console.log('>' + s)
  

  s = s.replace(/\*(.+?)\*/g,     '<em>$1</em>');
  s = s.replace(/`([^`]+)`/g,
    '<code style="font-family:\'JetBrains Mono\',monospace;font-size:.88em;'
    + 'background:rgba(200,132,58,.12);padding:1px 5px;border-radius:3px">$1</code>');

  var lines = s.split('\n'), out = [], inUl = false;
  
  for (var i = 0; i < lines.length; i++) {
    var ln = lines[i];
    if (/^&gt;\s?/.test(ln)) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push('<blockquote>' + ln.replace(/^&gt;\s?/, '') + '</blockquote>');
    } else if (/^[-*]\s/.test(ln)) {
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push('<li>' + ln.slice(2) + '</li>');
    } else {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (ln.trim()) out.push('<p>' + ln + '</p>');
    }
  }
  if (inUl) out.push('</ul>');
  return out.join('');
}

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
var Pen = (function () {

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

  /* ── Handlers de Pointer Events ──────────────────────────────────
     Usando Pointer Events API (unifica mouse, touch, stylus).
     setPointerCapture garante que move/up chegam mesmo fora do SVG. */

  function onPointerDown(e) {
    /* Aceita apenas botão primário (esquerdo ou toque) */
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();

    if (eraserMode) return; /* Eraser age no click, não no drag */

    drawing    = true;
    rawPts     = [getDocCoords(e)];
    activePath = makeSvgPath(penColor, penWidth);
    activePath.style.willChange = 'd'; /* hint GPU: este path vai mudar */
    layerEl.appendChild(activePath);

    /* Captura o ponteiro: garante que move/up chegam mesmo fora do SVG */
    svgEl.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!drawing) return;
    if (rawPts.length >= MAX_PTS_RAW) return; /* limite de segurança */
    e.preventDefault();

    var pt   = getDocCoords(e);
    var last = rawPts[rawPts.length - 1];

    /* Filtra micro-movimentos < 1px: reduz pontos redundantes */
    if (Math.abs(pt[0]-last[0]) < 1 && Math.abs(pt[1]-last[1]) < 1) return;

    rawPts.push(pt);

    /* Agenda atualização no próximo frame (apenas um RAF por vez) */
    if (rafId === null) rafId = requestAnimationFrame(rafFlush);
  }

  function onPointerUp(e) {
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

      /* Constrói controles da toolbar */
      this.buildToolbar();
    },

    /** Ativa o modo caneta (captura eventos, muda cursor). */
    activate: function () {
      svgEl.classList.add('pen-active');
      svgEl.classList.toggle('pen-eraser', eraserMode);
    },

    /** Desativa o modo caneta (apenas overlay visual, sem captura). */
    deactivate: function () {
      svgEl.classList.remove('pen-active', 'pen-eraser');
      /* Garante que nenhum traço fica em aberto */
      if (drawing) onPointerUp({ preventDefault: function(){}, pointerId: null });
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
      document.getElementById('pen-eraser').classList.remove('active');
    },

    /** Define espessura ativa (clamped ao intervalo [0.5, 8]). */
    setWidth: function (width) { penWidth = sanitizeWidth(width); },

    /** Liga/desliga modo borracha. */
    setEraser: function (on) {
      eraserMode = on;
      svgEl.classList.toggle('pen-eraser', on);
      /* Ativa pointer-events nos paths para hit-testing */
      var paths = layerEl.querySelectorAll('path');
      for (var i = 0; i < paths.length; i++)
        paths[i].style.pointerEvents = on ? 'stroke' : 'none';
    },

    /** Prepara o SVG para impressão (reseta transform de scroll). */
    prepareForPrint: function () {
      /* Congela a layer na posição 0 para impressão correta */
      layerEl.setAttribute('transform', 'translate(0,0)');
    },

    /** Restaura o SVG após impressão. */
    restoreAfterPrint: function () {
      syncScroll();
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

      /* ── Borracha ── */
      var eraserBtn = document.getElementById('pen-eraser');
      if (eraserBtn) {
        eraserBtn.addEventListener('click', function () {
          var on = !eraserMode;
          self.setEraser(on);
          eraserBtn.classList.toggle('active', on);
          /* Desmarca cor ativa visualmente */
          if (on && colorsEl)
            colorsEl.querySelectorAll('.pen-color-swatch')
              .forEach(function (x) { x.classList.remove('active'); });
        });
      }

      /* ── Desfazer / Limpar ── */
      var undoBtn  = document.getElementById('pen-undo');
      var clearBtn = document.getElementById('pen-clear');
      if (undoBtn)  undoBtn.addEventListener('click',  function () { self.undo();  });
      if (clearBtn) clearBtn.addEventListener('click', function () { self.clear(); });
    }
  };

})(); /* fim do módulo Pen */

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 3 — ESTADO E PERSISTÊNCIA
   ────────────────────────────────────────────────────────────────── */

var STORAGE_KEY = 'meu_diario_v2';
var entries     = [];   /* array de Entry — fonte da verdade */
var currentId   = null; /* ID da entrada aberta, ou null */

/** Carrega entries do localStorage. Em caso de JSON corrompido, inicia vazio. */
function loadData() {
  try { entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch (e) { entries = []; }
}

/** Persiste o array entries no localStorage. */
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 4 — UTILITÁRIOS
   ────────────────────────────────────────────────────────────────── */

/** Gera ID único: timestamp base36 + sufixo aleatório. */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function fmtLong(iso) {
  var loc = currentLang === 'en' ? 'en-US' : 'pt-BR';
  return new Date(iso).toLocaleDateString(loc,
    { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
}
function fmtShort(iso) {
  var loc = currentLang === 'en' ? 'en-US' : 'pt-BR';
  return new Date(iso).toLocaleDateString(loc,
    { day:'2-digit', month:'short', year:'numeric' });
}

/** Remove Markdown e LaTeX para exibir como texto puro na sidebar. */
function stripForSidebar(str) {
  return str.replace(/\*\*?|__?|`|^>\s?|^[-*]\s|\$\$?/gm, '').trim();
}

function wordCount(str) {
  var s = stripForSidebar(str);
  return s ? s.split(/\s+/).filter(Boolean).length : 0;
}

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 5 — TOAST
   ────────────────────────────────────────────────────────────────── */

var toastTimer;

function showToast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
}

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 6 — SIDEBAR / LISTA DE ENTRADAS
   ────────────────────────────────────────────────────────────────── */

/**
 * Re-renderiza a lista de entradas na sidebar.
 * @param {string} q  Filtro de busca (opcional)
 */
function renderList(q) {
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
      + '<div class="entry-item-date">' + fmtShort(e.updatedAt) + '</div>'
      + '<div class="entry-item-preview">'
      + escHtml(stripForSidebar(e.body).slice(0, 60) || t('list.empty.b'))
      + '</div></div>';
  }).join('');

  list.querySelectorAll('.entry-item').forEach(function (el) {
    el.addEventListener('click', function () { openEntry(el.dataset.id); });
  });
}

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 7 — CONTROLE DE MODO (edit | pen | preview)
   ────────────────────────────────────────────────────────────────── */

/**
 * Muda o modo do editor.
 *
 * 'edit'    → textarea visível, SVG passivo (apenas overlay)
 * 'pen'     → textarea visível com opacidade reduzida, SVG ativo
 * 'preview' → div renderizada visível, SVG passivo
 *
 * O SVG de anotações é sempre visível nos três modos; apenas
 * a captura de eventos e o cursor variam.
 */
function setMode(m) {
  var raw     = document.getElementById('entry-raw');
  var prev    = document.getElementById('entry-preview');
  var fmt     = document.getElementById('fmt-btns');
  var penTool = document.getElementById('pen-toolbar');

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
    Pen.deactivate();
    raw.focus();

  } else if (m === 'pen') {
    raw.style.display    = 'block';
    /* Texto visível porém levemente transparente para ver anotações */
    raw.style.opacity    = '0.45';
    prev.style.display   = 'none';
    fmt.style.display    = 'none';
    penTool.style.display= 'flex';
    Pen.activate();

  } else { /* preview */
    raw.style.display    = 'none';
    raw.style.opacity    = '1';
    prev.style.display   = 'block';
    fmt.style.display    = 'none';
    penTool.style.display= 'none';
    Pen.deactivate();
    /* KaTeX síncrono — renderiza diretamente */
    prev.innerHTML = mdToHtml(raw.value);
  }
}

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 8 — CRUD DE ENTRADAS
   ────────────────────────────────────────────────────────────────── */

function openEntry(id) {
  currentId = id;
  var e = entries.filter(function (x) { return x.id === id; })[0];
  if (!e) return;

  document.getElementById('welcome').style.display = 'none';
  document.getElementById('editor-container').style.display = 'flex';
  document.getElementById('entry-date-display').textContent = fmtLong(e.updatedAt);
  document.getElementById('entry-title').value = e.title;
  document.getElementById('entry-raw').value   = e.body;
  document.getElementById('mood-select').value = e.mood || '';

  /* Carrega traços manuscritos da entrada */
  Pen.load(e.strokes || []);

  updateStats();
  setMode('edit');
  renderList(document.getElementById('search-input').value);
}

function newEntry() {
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
  saveEntry_store( entry );
  openEntry(e.id);
  showToast(t('toast.new'));
}

function saveEntry() {
  if (!currentId) return;
  var e = entries.filter(function (x) { return x.id === currentId; })[0];
  if (!e) return;
  e.title     = document.getElementById('entry-title').value.trim();
  e.body      = document.getElementById('entry-raw').value;
  e.mood      = document.getElementById('mood-select').value;
  e.strokes   = Pen.getStrokes();
  e.updatedAt = new Date().toISOString();
  saveEntry_store( entry );
  renderList(document.getElementById('search-input').value);
}

function deleteEntry() {
  if (!currentId) return;
  if (!confirm(t('cf.del'))) return;
  entries   = entries.filter(function (x) { return x.id !== currentId; });
  currentId = null;
  saveData();
  Pen.load([]);
  Pen.deactivate();
  document.getElementById('editor-container').style.display = 'none';
  document.getElementById('welcome').style.display = 'flex';
  renderList();
  showToast(t('toast.del'));
}

function updateStats() {
  var n = wordCount(document.getElementById('entry-raw').value);
  document.getElementById('word-count').textContent =
    n + ' ' + (n === 1 ? t('stats.word') : t('stats.words'));
}

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

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 10 — DIÁLOGO DE EQUAÇÃO LATEX
   ────────────────────────────────────────────────────────────────── */

var EQ_TMPLS = [
  { label: 'Fração',     val: '\\frac{a}{b}'                                      },
  { label: 'Raiz',       val: '\\sqrt{x}'                                          },
  { label: 'Integral',   val: '\\int_0^{\\infty} f(x)\\,dx'                        },
  { label: 'Somatório',  val: '\\sum_{n=1}^{N} a_n'                               },
  { label: 'Limite',     val: '\\lim_{x \\to \\infty} f(x)'                        },
  { label: 'Baskara',    val: '\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}'               },
  { label: 'Euler',      val: 'e^{i\\pi}+1=0'                                     },
  { label: 'Derivada',   val: '\\frac{d}{dx}f(x)'                                 },
  { label: 'Gauss',      val: '\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx=\\sqrt{\\pi}' },
  { label: 'Matriz 2×2', val: '\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}'          },
  { label: 'Taylor',     val: '\\sum_{n=0}^{\\infty}\\frac{f^{(n)}(a)}{n!}(x-a)^n' }
];

/* Gera botões de template dinamicamente */
var tplBox = document.getElementById('eq-templates');
EQ_TMPLS.forEach(function (t) {
  var b = document.createElement('button');
  b.className   = 'eq-tpl';
  b.textContent = t.label;
  b.addEventListener('click', function () {
    document.getElementById('eq-input').value = t.val;
    updateEqPreview();
  });
  tplBox.appendChild(b);
});

var eqBlock = false;

function updateEqPreview() {
  var latex = document.getElementById('eq-input').value.trim();
  var box   = document.getElementById('eq-preview-box');
  if (!latex) {
    box.innerHTML = '<span style="color:rgba(26,18,9,.3);font-style:italic;font-size:.85rem">'
      + t('eq.waiting') + '</span>';
    return;
  }
  try {
    box.innerHTML = katex.renderToString(latex,
      { displayMode: eqBlock, throwOnError: true, strict: false });
  } catch (err) {
    box.innerHTML = '<span style="color:#c0392b;font-size:.8rem;font-family:monospace">'
      + escHtml(err.message) + '</span>';
  }
}

/* Toggle inline / bloco */
document.getElementById('eq-inline-btn').addEventListener('click', function () {
  eqBlock = false;
  document.getElementById('eq-inline-btn').classList.add('active');
  document.getElementById('eq-block-btn').classList.remove('active');
  updateEqPreview();
});
document.getElementById('eq-block-btn').addEventListener('click', function () {
  eqBlock = true;
  document.getElementById('eq-block-btn').classList.add('active');
  document.getElementById('eq-inline-btn').classList.remove('active');
  updateEqPreview();
});

document.getElementById('eq-input').addEventListener('input', updateEqPreview);

document.getElementById('btn-eq').addEventListener('click', function () {
  eqBlock = false;
  document.getElementById('eq-inline-btn').classList.add('active');
  document.getElementById('eq-block-btn').classList.remove('active');
  document.getElementById('eq-input').value = '';
  document.getElementById('eq-preview-box').innerHTML =
    '<span id="eq-waiting" style="color:rgba(26,18,9,.3);font-style:italic;font-size:.85rem">'
    + t('eq.waiting') + '</span>';
  document.getElementById('eq-overlay').classList.add('open');
  setTimeout(function () { document.getElementById('eq-input').focus(); }, 50);
});

document.getElementById('eq-cancel').addEventListener('click', function () {
  document.getElementById('eq-overlay').classList.remove('open');
});
document.getElementById('eq-overlay').addEventListener('click', function (ev) {
  if (ev.target === document.getElementById('eq-overlay'))
    document.getElementById('eq-overlay').classList.remove('open');
});

document.getElementById('eq-insert').addEventListener('click', function () {
  var latex = document.getElementById('eq-input').value.trim();
  if (!latex) return;
  var ta   = document.getElementById('entry-raw');
  var wrap = eqBlock ? '\n$$' + latex + '$$\n' : '$' + latex + '$';
  ta.setRangeText(wrap, ta.selectionStart, ta.selectionEnd, 'end');
  ta.focus();
  document.getElementById('eq-overlay').classList.remove('open');
  updateStats();
  debSave();
  showToast(t('toast.eqInserted'));
});

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 11 — EXPORTAÇÃO
   ────────────────────────────────────────────────────────────────── */

/**
 * Exporta a entrada atual como arquivo .md com front matter YAML.
 * Estratégia: Blob + <a download> — zero dependências, funciona
 * em todos os browsers modernos. O body já é Markdown puro.
 */
function exportMarkdown() {
  if (!currentId) return;
  var e = entries.filter(function (x) { return x.id === currentId; })[0];
  if (!e) return;

  var loc = currentLang === 'en' ? 'en-US' : 'pt-BR';
  var frontmatter = [
    '---',
    t('export.mdFrontTitle')   + ': ' + (e.title || t('list.untitled')),
    t('export.mdFrontDate')    + ': ' + new Date(e.updatedAt).toLocaleDateString(loc),
    t('export.mdFrontMood')    + ': ' + (e.mood  || '—'),
    t('export.mdFrontStrokes') + ': ' + (e.strokes ? e.strokes.length : 0),
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
  showToast(t('toast.mdDownloaded'));
}

/**
 * Exporta como PDF via window.print().
 * O @media print no CSS cuida do layout.
 * O SVG de anotações é incluído automaticamente por estar no DOM.
 */
function exportPDF() {
  if (!currentId) return;
  var e = entries.filter(function (x) { return x.id === currentId; })[0];
  if (!e) return;

  saveEntry();

  /* Renderiza preview com LaTeX */
  var prev = document.getElementById('entry-preview');
  prev.innerHTML = mdToHtml(document.getElementById('entry-raw').value);

  /* Elementos de cabeçalho injetados só para impressão */
  var titleEl = document.createElement('div');
  titleEl.id  = 'print-title';
  titleEl.textContent = e.title || t('list.untitled');

  var dateEl  = document.createElement('div');
  dateEl.id   = 'print-date';
  dateEl.textContent = fmtLong(e.updatedAt) + (e.mood ? '  ' + e.mood : '');

  prev.parentNode.insertBefore(titleEl, prev);
  prev.parentNode.insertBefore(dateEl,  prev);

  var wasHidden = prev.style.display === 'none';
  prev.style.display = 'block';

  window.print();

  prev.parentNode.removeChild(titleEl);
  prev.parentNode.removeChild(dateEl);
  if (wasHidden) prev.style.display = 'none';

  showToast(t('toast.pdf'));
}

document.getElementById('btn-export-md').addEventListener('click',  exportMarkdown);
document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 12 — AUTO-SAVE COM DEBOUNCE
   ────────────────────────────────────────────────────────────────── */

/*
  debSave() cancela o timer anterior e agenda saveEntry() para 1,8 s
  depois. saveEntry() só executa se o usuário parar de digitar por
  1,8 s. Evita gravações excessivas durante digitação contínua.
  O módulo Pen persiste imediatamente após cada traço (sem debounce)
  pois traços são eventos discretos, não contínuos.
*/
var debTimer;
function debSave() {
  clearTimeout(debTimer);
  debTimer = setTimeout(saveEntry, 1800);
}

document.getElementById('entry-raw').addEventListener('input', function () {
  updateStats(); debSave();
});
document.getElementById('entry-title').addEventListener('input', debSave);
document.getElementById('mood-select').addEventListener('change', debSave);

/* Callback do Pen: chamado após cada traço completo */
Pen._onStrokesChange = function (strokes) {
  if (!currentId) return;
  var e = entries.filter(function (x) { return x.id === currentId; })[0];
  if (!e) return;
  e.strokes   = strokes;
  e.updatedAt = new Date().toISOString();
  saveData(); /* persiste imediatamente — sem debounce */
};

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 13 — TELA CHEIA (Fullscreen API)

   Estratégia:
   • requestFullscreen() no document.documentElement — expande o
     browser inteiro para tela cheia do sistema operacional.
   • Prefixos: webkit (Safari), moz (Firefox antigo), ms (IE/Edge legado)
     cobertos por um helper que detecta o método disponível.
   • O ícone SVG troca entre expand ↔ compress via updateFsIcon().
   • fullscreenchange sincroniza o estado do botão quando o usuário
     pressiona Escape (sai do fullscreen sem clicar no botão).
   • O data-label e title do botão também são atualizados para
     refletir a ação disponível no idioma atual.
   ────────────────────────────────────────────────────────────────── */

/* SVG paths dos dois estados do ícone */
var FS_ICON = {
  /* Setas apontando para fora = entrar em fullscreen */
  expand: '<polyline points="15 3 21 3 21 9"/>'
        + '<polyline points="9 21 3 21 3 15"/>'
        + '<line x1="21" y1="3"  x2="14" y2="10"/>'
        + '<line x1="3"  y1="21" x2="10" y2="14"/>',
  /* Setas apontando para dentro = sair do fullscreen */
  compress: '<polyline points="4 14 10 14 10 20"/>'
          + '<polyline points="20 10 14 10 14 4"/>'
          + '<line x1="10" y1="14" x2="3"  y2="21"/>'
          + '<line x1="21" y1="3"  x2="14" y2="10"/>'
};

/**
 * Retorna true se o documento está em fullscreen em qualquer browser.
 */
function isFullscreen() {
  return !!(
    document.fullscreenElement    ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

/**
 * Atualiza o ícone e os atributos de acessibilidade do botão
 * para refletir o estado atual (fullscreen ativo ou inativo).
 */
function updateFsIcon() {
  var btn  = document.getElementById('btn-fullscreen');
  var icon = document.getElementById('fs-icon');
  if (!btn || !icon) return;

  var active = isFullscreen();
  var labelKey = active ? 'fs.exit' : 'fs.enter';
  var label    = t(labelKey);

  btn.classList.toggle('is-fullscreen', active);
  btn.setAttribute('data-label',  label);
  btn.setAttribute('title',       label);
  btn.setAttribute('aria-label',  label);
  icon.innerHTML = active ? FS_ICON.compress : FS_ICON.expand;
}

/**
 * Entra ou sai do fullscreen.
 * Trata prefixos para compatibilidade cross-browser.
 */
function toggleFullscreen() {
  if (!isFullscreen()) {
    /* Entrar em fullscreen — tenta o método disponível */
    var el  = document.documentElement;
    var req = el.requestFullscreen
           || el.webkitRequestFullscreen
           || el.mozRequestFullScreen
           || el.msRequestFullscreen;
    if (req) req.call(el);
  } else {
    /* Sair do fullscreen */
    var exit = document.exitFullscreen
            || document.webkitExitFullscreen
            || document.mozCancelFullScreen
            || document.msExitFullscreen;
    if (exit) exit.call(document);
  }
}

/* Sincroniza o botão quando o estado muda (inclusive via tecla Escape) */
document.addEventListener('fullscreenchange',       updateFsIcon);
document.addEventListener('webkitfullscreenchange', updateFsIcon);
document.addEventListener('mozfullscreenchange',    updateFsIcon);
document.addEventListener('MSFullscreenChange',     updateFsIcon);

document.getElementById('btn-fullscreen')
  .addEventListener('click', toggleFullscreen);

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
  if (ev.key === 'Escape')
    document.getElementById('eq-overlay').classList.remove('open');
});

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 14 — FIAÇÃO DE EVENTOS
   ────────────────────────────────────────────────────────────────── */

/* Botões do mode-toggle */
document.getElementById('mode-edit').addEventListener('click', function () {
  setMode('edit');
});
document.getElementById('mode-pen').addEventListener('click', function () {
  saveEntry(); /* garante dados salvos antes de mudar modo */
  setMode('pen');
});
document.getElementById('mode-preview').addEventListener('click', function () {
  saveEntry();
  setMode('preview');
});

/* Botões principais */
document.getElementById('btn-new').addEventListener('click', newEntry);
document.getElementById('btn-save').addEventListener('click', function () {
  saveEntry(); showToast(t('toast.saved'));
});
document.getElementById('btn-delete').addEventListener('click', deleteEntry);

/* Busca na sidebar */
document.getElementById('search-input').addEventListener('input', function (ev) {
  renderList(ev.target.value);
});

/* Seletor de idioma — botões de bandeira */
document.querySelectorAll('#lang-switcher .lang-btn').forEach(function (btn) {
  btn.addEventListener('click', function () { applyLocale(btn.dataset.lang); });
});

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 15 — INICIALIZAÇÃO
   ────────────────────────────────────────────────────────────────── */

/* 1. Inicializa o módulo Pen com os elementos do DOM */
Pen.init(
  document.getElementById('pen-svg'),
  document.getElementById('pen-layer'),
  document.getElementById('editor-area')
);

/* 2. Carrega dados do localStorage */
loadData();

/* 3. Aplica idioma — sem fade na inicialização (página ainda carregando) */
applyLocale(currentLang);

/* 4. Abre automaticamente a entrada mais recente */
if (entries.length) {
  var latest = entries.slice()
    .sort(function (a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); })[0];
  openEntry(latest.id);
}

})(); /* fim da IIFE */

/* ────────────────────────────────────────────────────────*/