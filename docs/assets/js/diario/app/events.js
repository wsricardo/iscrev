import { Storage } from '../infra/storage.js';
import { loadData } from './state.js';
import { applyLocale, t } from '../ui/i18n.js';
import { newEntry, saveEntry, deleteEntry } from './actions.js';
import { isSidebarOpen, setSidebarOpen, mobileShellMq, syncResponsiveShell } from '../shared/utils.js';
import { exportMarkdown, exportPDF, importMarkdown } from '../editor/export.js';

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
document.getElementById('btn-import-md').addEventListener('click', importMarkdown);
document.getElementById('welcome-new').addEventListener('click', newEntry);
document.getElementById('welcome-import').addEventListener('click', importMarkdown);
document.getElementById('btn-save').addEventListener('click', function () {
  saveEntry(); 
  showToast(t('toast.saved'));
});
document.getElementById('btn-delete').addEventListener('click', deleteEntry);
document.getElementById('btn-sidebar-toggle').addEventListener('click', function () {
  setSidebarOpen(!isSidebarOpen());
});
document.getElementById('sidebar-scrim').addEventListener('click', function () {
  setSidebarOpen(false);
});

/* Busca na sidebar */
document.getElementById('search-input').addEventListener('input', function (ev) {
  renderList(ev.target.value);
});

/* Seletor de idioma — botões de bandeira */
document.querySelectorAll('#lang-switcher .lang-btn').forEach(function (btn) {
  btn.addEventListener('click', function () { applyLocale(btn.dataset.lang); });
});

if (mobileShellMq.addEventListener)
  mobileShellMq.addEventListener('change', syncResponsiveShell);
else if (mobileShellMq.addListener)
  mobileShellMq.addListener(syncResponsiveShell);

/*
 dois eventos customizados 
 que o app deve escutar para exibir toasts informativos 
 despachados neste módulo.
*/
document.addEventListener('storage:quota-exceeded', function () {
  showToast(t('toast.quotaExceeded'));
});
document.addEventListener('storage:error', function () {
  showToast(t('toast.storageError'));
});

/* --- Modal de Apoio --- */
export let supportOverlay = document.getElementById('support-overlay');
export let supportTrigger = document.getElementById('legal-support-trigger');
export let supportClose = document.getElementById('support-close');

if (supportTrigger && supportOverlay && supportClose) {
  supportTrigger.addEventListener('click', function () {
    supportOverlay.classList.add('open');
    supportOverlay.setAttribute('aria-hidden', 'false');
  });

  function closeSupportModal() {
    supportOverlay.classList.remove('open');
    supportOverlay.setAttribute('aria-hidden', 'true');
  }

  supportClose.addEventListener('click', closeSupportModal);

  supportOverlay.addEventListener('click', function (ev) {
    if (ev.target === supportOverlay) {
      closeSupportModal();
    }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && supportOverlay.classList.contains('open')) {
      closeSupportModal();
    }
  });

  var copyBtn = document.getElementById('copy-pix-btn');
  var pixKeyEl = document.getElementById('pix-key-value');
  var copyStatusEl = document.getElementById('copy-status');
  var copyLabelEl = document.getElementById('copy-pix-label');

  if (copyBtn && pixKeyEl && copyStatusEl && copyLabelEl) {
    copyBtn.addEventListener('click', function () {
      var pixKey = pixKeyEl.textContent;
      if (!navigator.clipboard) {
        copyStatusEl.textContent = t('pix.copy.manual');
        return;
      }

      navigator.clipboard.writeText(pixKey).then(function () {
        copyLabelEl.textContent = t('pix.copied');
        copyBtn.classList.add('copied');
        copyStatusEl.textContent = t('pix.copy.success');
        copyStatusEl.style.color = '#28a745';

        setTimeout(function () {
          copyLabelEl.textContent = t('pix.copy');
          copyBtn.classList.remove('copied');
          copyStatusEl.textContent = '';
          copyStatusEl.style.color = '';
        }, 2500);
      }, function (err) {
        copyStatusEl.textContent = t('pix.copy.error');
        console.error('Erro ao copiar a chave PIX: ', err);
      });
    });
  }
}


// Compatibilidade global
