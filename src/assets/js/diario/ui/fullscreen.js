import { showToast } from './toast.js';
import { t } from './i18n.js';

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
export let FS_ICON = {
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
export function isFullscreen() {
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
export function updateFsIcon() {
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
export function toggleFullscreen() {
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


// Compatibilidade global
