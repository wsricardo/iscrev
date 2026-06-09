

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
export function renderTex(latex, display) {
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
export function escHtml(s) {
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
export function mdToHtml(src) {
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
export function convertMarkdown(raw) {
  var s = escHtml(raw);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.+?)\*/g,     '<em>$1</em>');

  s = s.replace(/^(#{1})\s+(.*)$/gm, '<h1>$2</h1>');
  s = s.replace(/^(#{2})\s+(.*)$/gm, '<h2>$2</h2>');
  s = s.replace(/^(#{3})\s+(.*)$/gm, '<h3>$2</h3>');
  s = s.replace(/^(#{4})\s+(.*)$/gm, '<h4>$2</h4>');
  s = s.replace(/^(#{5})\s+(.*)$/gm, '<h5>$2</h5>');
  s = s.replace(/^(#{6})\s+(.*)$/gm, '<h6>$2</h6>');

  s = s.replace(/\n/g, '<br>');
  //console.log('>' + s)
  
  s = s.replace(/`([^`]+)`/g,
    '<code style="font-family:\'JetBrains Mono\',monospace;font-size:.88em;'
    + 'background:rgba(200,132,58,.12);padding:1px 5px;border-radius:3px">$1</code>');

  var lines = s.split(/(\n)/), out = [], inUl = false;
  for (var i = 0; i < lines.length; i++) {
    var ln = lines[i];
    if (/^&gt;\s?/.test(ln)) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push('<blockquote>' + ln.replace(/^&gt;\s?/, '') + '</blockquote>');

    } else if ( ln == "\n") {
      out.push('<br>');
    
    } else if (/^[-*]\s/.test(ln)) {
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push('<li>' + ln.slice(2) + '</li>');
    } else {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (ln.trim()) out.push(ln );
    }
  }
  if (inUl) out.push('</ul>');
  return out.join('');
}


// Compatibilidade global
