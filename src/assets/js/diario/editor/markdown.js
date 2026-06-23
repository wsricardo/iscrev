

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


/** Converte segmento de texto puro em HTML com Máquina de Estados (State Machine). */
export function convertMarkdown(raw) {
  const lines = raw.split('\n');
  let htmlOut = '';
  
  let state = {
    inList: false,
    inCodeBlock: false,
    inTable: false,
    inBlockquote: false
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\r$/, '');

    // Escapar tags HTML (prevenção de XSS)
    line = escHtml(line);

    // 1. Bloco de Código (Crase tripla)
    if (line.startsWith('```')) {
      if (state.inCodeBlock) {
        htmlOut += '</code></pre>\n';
        state.inCodeBlock = false;
      } else {
        htmlOut += '<pre style="background:rgba(200,132,58,.08);padding:10px;border-radius:6px;overflow-x:auto;"><code style="font-family:\'JetBrains Mono\',monospace;font-size:.88em;color:#8b3a1f;">\n';
        state.inCodeBlock = true;
      }
      continue;
    }

    if (state.inCodeBlock) {
      htmlOut += line + '\n';
      continue;
    }

    // 2. Listas
    if (/^[-*]\s/.test(line)) {
      if (!state.inList) {
        htmlOut += '<ul>\n';
        state.inList = true;
      }
      htmlOut += '<li>' + parseInlineRules(line.slice(2)) + '</li>\n';
      continue;
    } else if (state.inList) {
      htmlOut += '</ul>\n';
      state.inList = false;
    }

    // 3. Blockquotes
    if (/^&gt;\s?/.test(line)) {
      if (!state.inBlockquote) {
        htmlOut += '<blockquote>\n';
        state.inBlockquote = true;
      }
      htmlOut += parseInlineRules(line.replace(/^&gt;\s?/, '')) + '<br>\n';
      continue;
    } else if (state.inBlockquote) {
      htmlOut += '</blockquote>\n';
      state.inBlockquote = false;
    }

    // 4. Tabelas Básicas
    if (line.includes('|') && line.trim().startsWith('|')) {
      if (!state.inTable) {
        htmlOut += '<div class="table-wrapper"><table style="width:100%;border-collapse:collapse;margin:10px 0;">\n<tbody>\n';
        state.inTable = true;
      }
      if (line.includes('---')) continue; 
      
      const cells = line.split('|').filter(c => c.trim() !== '');
      htmlOut += '<tr style="border-bottom:1px solid rgba(200,132,58,.3)">' + cells.map(c => '<td style="padding:6px 12px;">' + parseInlineRules(c.trim()) + '</td>').join('') + '</tr>\n';
      continue;
    } else if (state.inTable) {
      htmlOut += '</tbody>\n</table></div>\n';
      state.inTable = false;
    }

    // 5. Cabeçalhos
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      htmlOut += '<h' + level + '>' + parseInlineRules(headingMatch[2]) + '</h' + level + '>\n';
      continue;
    }

    // 6. Parágrafos / Quebras
    if (line.trim() === '') {
      htmlOut += '<br>\n';
    } else {
      htmlOut += parseInlineRules(line) + '<br>\n';
    }
  }

  // Fechar estados órfãos
  if (state.inList) htmlOut += '</ul>\n';
  if (state.inBlockquote) htmlOut += '</blockquote>\n';
  if (state.inTable) htmlOut += '</tbody>\n</table></div>\n';
  if (state.inCodeBlock) htmlOut += '</code></pre>\n';

  return htmlOut;
}

function parseInlineRules(text) {
  let s = text;
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Links Inline: [Texto](URL) com sanitização de XSS
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, text, url) {
    let cleanUrl = url.trim();
    if (/^(javascript|data|vbscript):/i.test(cleanUrl)) {
      cleanUrl = '#'; // Bloqueia execução de scripts e payloads
    }
    return '<a href="' + cleanUrl + '" target="_blank" rel="noopener noreferrer" style="color:#c8843a;text-decoration:none;border-bottom:1px dashed #c8843a;">' + text + '</a>';
  });
  
  // Código Inline
  s = s.replace(/`([^`]+)`/g, '<code style="font-family:\'JetBrains Mono\',monospace;font-size:.88em;background:rgba(200,132,58,.12);padding:1px 5px;border-radius:3px">$1</code>');
  return s;
}



// Compatibilidade global
