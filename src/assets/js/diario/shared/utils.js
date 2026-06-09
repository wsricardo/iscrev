

/* ──────────────────────────────────────────────────────────────────
   SEÇÃO 4 — UTILITÁRIOS
   ────────────────────────────────────────────────────────────────── */

/** Gera ID único: timestamp base36 + sufixo aleatório. */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function fmtLong(iso) {
  var loc = currentLang === 'en' ? 'en-US' : 'pt-BR';
  return new Date(iso).toLocaleDateString(loc,
    { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
}
export function fmtShort(iso) {
  var loc = currentLang === 'en' ? 'en-US' : 'pt-BR';
  return new Date(iso).toLocaleDateString(loc,
    { day:'2-digit', month:'short', year:'numeric' });
}

export let mobileShellMq = window.matchMedia('(max-width: 900px)');
export let SIDEBAR_ICONS = {
  show:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"'
    + ' stroke-linecap="round" stroke-linejoin="round">'
    + '<rect x="2.75" y="3.5" width="18.5" height="17" rx="3"/>'
    + '<line x1="8.5" y1="3.5" x2="8.5" y2="20.5"/>'
    + '<polyline points="11,8 15,12 11,16"/>'
    + '</svg>',
  hide:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"'
    + ' stroke-linecap="round" stroke-linejoin="round">'
    + '<rect x="2.75" y="3.5" width="18.5" height="17" rx="3"/>'
    + '<line x1="8.5" y1="3.5" x2="8.5" y2="20.5"/>'
    + '<polyline points="15,8 11,12 15,16"/>'
    + '</svg>'
};

export function isMobileShell() {
  return mobileShellMq.matches;
}

export function isSidebarOpen() {
  return isMobileShell()
    ? document.body.classList.contains('sidebar-open')
    : !document.body.classList.contains('sidebar-collapsed');
}

export function syncSidebarToggleControl() {
  var btn = document.getElementById('btn-sidebar-toggle');
  var icon = document.getElementById('btn-sidebar-toggle-label');
  var text = document.getElementById('btn-sidebar-toggle-text');
  if (!btn || !icon) return;

  var open = isSidebarOpen();
  var label = t(open ? 'sidebar.hide' : 'sidebar.show');

  btn.classList.toggle('is-open', open);
  btn.classList.toggle('is-closed', !open);
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  btn.setAttribute('aria-label', label);
  btn.setAttribute('title', label);
  btn.setAttribute('data-label', label);
  icon.innerHTML = open ? SIDEBAR_ICONS.hide : SIDEBAR_ICONS.show;
  if (text) text.textContent = label;
}

export function setSidebarOpen(open) {
  if (isMobileShell()) {
    document.body.classList.remove('sidebar-collapsed');
    document.body.classList.toggle('sidebar-open', !!open);
    syncSidebarToggleControl();
    return;
  }

  document.body.classList.remove('sidebar-open');
  document.body.classList.toggle('sidebar-collapsed', !open);
  syncSidebarToggleControl();
}

export function syncResponsiveShell() {
  if (!isMobileShell()) {
    document.body.classList.remove('sidebar-open');
    syncSidebarToggleControl();
    return;
  }

  document.body.classList.remove('sidebar-collapsed');
  document.body.classList.toggle('sidebar-open', !currentId);
  syncSidebarToggleControl();
}

/** Remove Markdown e LaTeX para exibir como texto puro na sidebar. */
export function stripForSidebar(str) {
  return str.replace(/\*\*?|__?|`|^>\s?|^[-*]\s|\$\$?/gm, '').trim();
}

export function wordCount(str) {
  var s = stripForSidebar(str);
  return s ? s.split(/\s+/).filter(Boolean).length : 0;
}


// Compatibilidade global
