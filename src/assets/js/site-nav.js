(function () {
'use strict';

var mq = window.matchMedia('(max-width: 720px)');

function bindNav(nav) {
  var navToggle = nav.querySelector('.nav-toggle');
  var navGroup = nav.querySelector('.nav-group');
  var openLabel;
  var closeLabel;

  if (!navToggle || !navGroup) return;

  openLabel = navToggle.getAttribute('data-open-label') || navToggle.getAttribute('aria-label') || 'Open menu';
  closeLabel = navToggle.getAttribute('data-close-label') || 'Close menu';

  function setNavOpen(open) {
    var on = !!open && mq.matches;
    nav.classList.toggle('nav-open', on);
    navToggle.setAttribute('aria-expanded', on ? 'true' : 'false');
    navToggle.setAttribute('aria-label', on ? closeLabel : openLabel);

    if (mq.matches) navGroup.setAttribute('aria-hidden', on ? 'false' : 'true');
    else navGroup.removeAttribute('aria-hidden');
  }

  function syncNav() {
    if (!mq.matches) {
      nav.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', openLabel);
      navGroup.removeAttribute('aria-hidden');
      return;
    }

    navToggle.setAttribute('aria-label', nav.classList.contains('nav-open') ? closeLabel : openLabel);
    navGroup.setAttribute('aria-hidden', nav.classList.contains('nav-open') ? 'false' : 'true');
  }

  navToggle.addEventListener('click', function () {
    if (!mq.matches) return;
    setNavOpen(!nav.classList.contains('nav-open'));
  });

  document.addEventListener('click', function (ev) {
    if (!mq.matches || !nav.classList.contains('nav-open')) return;
    if (nav.contains(ev.target)) return;
    setNavOpen(false);
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && nav.classList.contains('nav-open'))
      setNavOpen(false);
  });

  navGroup.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      setNavOpen(false);
    });
  });

  if (mq.addEventListener) {
    mq.addEventListener('change', syncNav);
  } else if (mq.addListener) {
    mq.addListener(syncNav);
  }

  syncNav();
}

document.querySelectorAll('header nav').forEach(bindNav);

}());

document.addEventListener('DOMContentLoaded', () => {
    const authorModal = document.getElementById('author-modal');
    const openBtn = document.getElementById('btn-open-author');
    const closeBtn = document.getElementById('btn-close-author');

    if (openBtn && authorModal) {
        openBtn.addEventListener('click', () => {
            authorModal.showModal();
        });
    }

    if (closeBtn && authorModal) {
        closeBtn.addEventListener('click', () => {
            authorModal.close();
        });
    }
    
    if (authorModal) {
        authorModal.addEventListener('click', (e) => {
            const dialogDimensions = authorModal.getBoundingClientRect()
            if (
                e.clientX < dialogDimensions.left ||
                e.clientX > dialogDimensions.right ||
                e.clientY < dialogDimensions.top ||
                e.clientY > dialogDimensions.bottom
            ) {
                authorModal.close();
            }
        });
    }
});
