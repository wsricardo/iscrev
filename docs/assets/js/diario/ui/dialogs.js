import { t } from './i18n.js';
import { renderTex, escHtml } from '../editor/markdown.js';
import { debSave } from '../app/autosave.js';
import { showToast } from './toast.js';

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 10 — DIÁLOGO DE EQUAÇÃO LATEX
   ────────────────────────────────────────────────────────────────── */

export let EQ_TMPLS = [
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
export let tplBox = document.getElementById('eq-templates');
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

export let eqBlock = false;

export function updateEqPreview() {
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


// Compatibilidade global
