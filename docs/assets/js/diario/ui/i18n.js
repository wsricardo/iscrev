import { syncSidebarToggleControl } from '../shared/utils.js';

/* ══════════════════════════════════════════════════════════════════
   SEÇÃO 0 — INTERNACIONALIZAÇÃO (i18n)

   Arquitectura: dicionário estático + varredura de IDs no DOM.
   • I18N[lang][key] → string traduzida
   • t(key)          → string do idioma ativo (fallback: 'pt')
   • applyLocale(lang) → atualiza todos os nós de texto do DOM
   • Idioma ativo persiste em localStorage['diario_lang']
   • Detecção automática via navigator.language na primeira visita
══════════════════════════════════════════════════════════════════ */



export let I18N = {
  pt: {
    /* Logo */
    'logo.title':   'iScrev Notes',
    'logo.sub':     'anotações pessoais',
    /* Sidebar */
    'lang.label':   'Idioma:',
    'home.link':    'Início',
    'sidebar.show': 'Mostrar lista de entradas',
    'sidebar.hide': 'Ocultar lista de entradas',
    'fs.enter':     'Tela cheia',
    'fs.exit':      'Sair da tela cheia',
    'btn.new':      'Nova Entrada',
    'btn.import':   'Importar .md',
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
    'pen.pan':      'Mão',
    'pen.pan.t':    'Mão: arraste para rolar a página',
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
    'legal.prefix': 'Privacidade e uso:',
    'legal.support':'Apoie',
    'legal.privacy':'Política',
    'legal.terms':  'Termos',
    /* Equation dialog */
    'eq.title':     'Inserir Equação LaTeX',
    'eq.desc':      'Digite o código LaTeX e confira a pré-visualização em tempo real.',
    'eq.inline':    'Inline \u00a0$…$',
    'eq.block':     'Bloco \u00a0$$…$$',
    'eq.prev.lbl':  'Pré-visualização',
    'eq.waiting':   'aguardando…',
    'eq.cancel':    'Cancelar',
    'eq.insert':    'Inserir',
    /* Support modal */
    'sup.title': 'Ajude a manter o iScrev Notes vivo',
    'sup.desc': 'Se o iScrev Notes te ajuda a escrever e organizar ideias, você pode apoiar a manutenção do projeto.',
    'sup.p1': 'Seu apoio ajuda com domínio, hospedagem e melhorias do app.',
    'sup.p2': 'Os pagamentos acontecem na página de apoio, separada do diário.',
    'sup.p3': 'Suas notas continuam aqui enquanto você decide com calma.',
    'sup.note': 'A página de apoio abre em outra aba para preservar sua sessão atual.',
    'sup.close': 'Agora não',
    'sup.open': 'Abrir página de apoio',
    'sup.stripe.hint': 'Pagamento seguro via Apple Pay, Google Pay ou Cartão de Crédito.',
    'sup.stripe.btn': 'Apoiar via Stripe',
    /* PIX copy */
    'pix.label': 'Apoie com PIX',
    'pix.copy': 'Copiar',
    'pix.copied': 'Copiado!',
    'pix.copy.success': 'Chave copiada!',
    'pix.copy.error': 'Falha ao copiar.',
    'pix.copy.manual': 'Copia manual necessária.',
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
    'toast.pdf':    'Diálogo de impressão aberto. Use "Salvar em PDF" no navegador.',
    'toast.pdfErr': 'Não foi possível preparar a impressão desta entrada.',
    'toast.pdfUnavailable': 'A impressão não está disponível neste navegador.',
    'toast.eq':     'Equação inserida ✓',
    'toast.imported':  'Entrada importada ✓',
    'toast.importErr': 'Arquivo inválido ou corrompido.',
    'toast.limit':  'Limite de traços atingido (500).',
    'toast.undo':   'Traço removido ↩',
    'toast.clear':  'Anotações limpas ✓',
    'toast.quotaExceeded': 'Armazenamento cheio. Exporte e exclua entradas antigas.',
    'toast.storageError':  'Erro ao salvar. Verifique o armazenamento do browser.',
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
    'logo.title':   'iScrev Notes',
    'logo.sub':     'personal notes',
    /* Sidebar */
    'lang.label':   'Lang:',
    'home.link':    'Home',
    'sidebar.show': 'Show entry list',
    'sidebar.hide': 'Hide entry list',
    'fs.enter':     'Full screen',
    'fs.exit':      'Exit full screen',
    'btn.new':      'New Entry',
    'btn.import':   'Import .md',
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
    'pen.pan':      'Pan',
    'pen.pan.t':    'Pan: drag to scroll the page',
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
    'legal.prefix': 'Privacy & use:',
    'legal.support':'Support',
    'legal.privacy':'Policy',
    'legal.terms':  'Terms',
    /* Equation dialog */
    'eq.title':     'Insert LaTeX Equation',
    'eq.desc':      'Type the LaTeX code and check the live preview.',
    'eq.inline':    'Inline \u00a0$…$',
    'eq.block':     'Block \u00a0$$…$$',
    'eq.prev.lbl':  'Preview',
    'eq.waiting':   'waiting…',
    'eq.cancel':    'Cancel',
    'eq.insert':    'Insert',
    /* Support modal */
    'sup.title': 'Help keep iScrev Notes alive',
    'sup.desc': 'If iScrev Notes helps you write and organize ideas, you can support the project\'s maintenance.',
    'sup.p1': 'Your support helps with domain, hosting, and app improvements.',
    'sup.p2': 'Payments are handled on the support page, separate from the diary.',
    'sup.p3': 'Your notes will remain here while you decide.',
    'sup.note': 'The support page opens in a new tab to preserve your current session.',
    'sup.close': 'Not now',
    'sup.open': 'Open support page',
    'sup.stripe.hint': 'Secure payment via Apple Pay, Google Pay, or Credit Card.',
    'sup.stripe.btn': 'Support via Stripe',
    /* PIX copy */
    'pix.label': 'Support with PIX (Brazil Only)',
    'pix.copy': 'Copy',
    'pix.copied': 'Copied!',
    'pix.copy.success': 'Key copied!',
    'pix.copy.error': 'Failed to copy.',
    'pix.copy.manual': 'Manual copy needed.',
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
    'toast.pdf':    'Print dialog opened. Use your browser\'s "Save as PDF".',
    'toast.pdfErr': 'Could not prepare printing for this entry.',
    'toast.pdfUnavailable': 'Printing is not available in this browser.',
    'toast.eq':     'Equation inserted ✓',
    'toast.imported':  'Entry imported ✓',
    'toast.importErr': 'Invalid or corrupted file.',
    'toast.limit':  'Stroke limit reached (500).',
    'toast.undo':   'Stroke undone ↩',
    'toast.clear':  'Annotations cleared ✓',
    'toast.quotaExceeded': 'Storage full. Export and delete old entries.',
'toast.storageError':  'Error saving. Check your browser\'s storage.',
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
export let currentLang = (function () {
  var s = localStorage.getItem('diario_lang');
  if (s && I18N[s]) return s;
  return 'en';
}());

/** Retorna string traduzida. Fallback: pt → chave crua. */
export function t(key) {
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
export function applyLocale(lang) {
  if (!I18N[lang]) return;
  doApply(lang);
}

/* Núcleo da atualização — chamado dentro ou fora do fade */
export function doApply(lang) {
    currentLang = lang;
    localStorage.setItem('diario_lang', lang);

    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

    var TEXT_MAP = [
      ['logo-title',        'logo.title',    'text'],
      ['logo-sub',          'logo.sub',      'text'],
      ['btn-new-label',     'btn.new',       'text'],
      ['btn-import-label',  'btn.import',    'text'],
      ['welcome-new-label', 'btn.new',       'text'],
      ['welcome-import-label','btn.import',  'text'],
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
      ['pen-pan-label',     'pen.pan',       'text'],
      ['pen-eraser-label',  'pen.eraser',    'text'],
      ['pen-undo-label',    'pen.undo',      'text'],
      ['pen-clear-label',   'pen.clear',     'text'],
      ['latex-hint',        'stats.hint',    'html'],
      ['legal-prefix',      'legal.prefix',  'text'],
      ['legal-support-label','legal.support','text'],
      ['legal-privacy-label','legal.privacy','text'],
      ['legal-terms-label', 'legal.terms',   'text'],
      ['eq-title',          'eq.title',      'text'],
      ['eq-desc',           'eq.desc',       'text'],
      ['eq-inline-btn',     'eq.inline',     'text'],
      ['eq-block-btn',      'eq.block',      'text'],
      ['eq-preview-label',  'eq.prev.lbl',   'text'],
      ['eq-cancel',         'eq.cancel',     'text'],
      ['eq-insert',         'eq.insert',     'text'],
      ['support-title',       'sup.title',     'text'],
      ['support-desc',        'sup.desc',      'text'],
      ['support-point-1',     'sup.p1',        'text'],
      ['support-point-2',     'sup.p2',        'text'],
      ['support-point-3',     'sup.p3',        'text'],
      ['support-note',        'sup.note',      'text'],
      ['support-close',       'sup.close',     'text'],
      ['support-page-link',   'sup.open',      'text'],
      ['pix-label',           'pix.label',     'text'],
      ['copy-pix-label',      'pix.copy',      'text'],
      ['support-stripe-hint', 'sup.stripe.hint', 'text'],
      ['support-stripe-btn',  'sup.stripe.btn',  'text'],
      ['search-input',      'search.ph',     'ph'],
      ['entry-title',       'ed.title.ph',   'ph'],
      ['entry-raw',         'ed.body.ph',    'ph'],
      ['btn-export-md',     'btn.md.title',  'title'],
      ['btn-export-pdf',    'btn.pdf.title', 'title'],
      ['btn-fullscreen',    'fs.enter',      'title'],
      ['pen-pan',           'pen.pan.t',     'title'],
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

    var legalPrivacy = document.getElementById('legal-privacy-link');
    if (legalPrivacy) {
      legalPrivacy.href = lang === 'pt'
        ? 'privacidade.html#privacidade'
        : 'privacy.html#privacy-policy';
    }

    var legalTerms = document.getElementById('legal-terms-link');
    if (legalTerms) {
      legalTerms.href = lang === 'pt'
        ? 'privacidade.html#termos'
        : 'privacy.html#terms-of-use';
    }

    var supportPix = document.getElementById('support-pix-card');
    var supportStripe = document.getElementById('support-stripe-card');
    if (supportPix && supportStripe) {
      if (lang === 'pt') {
        supportPix.style.display = 'block';
        supportStripe.style.display = 'block';
      } else {
        supportPix.style.display = 'none';
        supportStripe.style.display = 'block';
      }
    }

    syncSidebarToggleControl();

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

    var homeBtn = document.getElementById('btn-home');
    if (homeBtn) {
      var homeLabel = t('home.link');
      homeBtn.setAttribute('data-label', homeLabel);
      homeBtn.setAttribute('title', homeLabel);
      homeBtn.setAttribute('aria-label', homeLabel);
      homeBtn.setAttribute('href', lang === 'pt' ? 'pt.html' : 'index.html');
    }

    if (typeof Pen !== 'undefined' && Pen.buildToolbar) Pen.buildToolbar();
    if (typeof updateStats === 'function') updateStats();
    if (typeof renderList  === 'function')
      renderList(document.getElementById('search-input')
        ? document.getElementById('search-input').value : '');
}
/* fim doApply */


// Compatibilidade global
window.I18N = I18N; window.t = t; window.applyLocale = applyLocale; window.currentLang = currentLang;
