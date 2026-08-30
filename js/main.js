/* MK313 — site interactions */
(function () {
  'use strict';

  /* --- Current year ------------------------------------------------------ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* --- Mobile navigation ------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  var scrim = document.querySelector('.nav-scrim');
  var isOpen = false;

  function setNav(open) {
    if (!toggle || !nav) return;
    isOpen = open;
    nav.classList.toggle('is-open', open);
    if (scrim) scrim.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  function closeNav(returnFocus) {
    if (!isOpen) return;
    setNav(false);
    if (returnFocus && toggle) toggle.focus();
  }

  if (toggle && nav) {
    // The drawer transitions `visibility`, so it is not focusable until the
    // transition has run. Move focus once it settles, with a timed fallback.
    function focusDrawer() {
      var first = nav.querySelector('a');
      if (!isOpen || !first || nav.contains(document.activeElement)) return;
      first.focus();
    }

    toggle.addEventListener('click', function () {
      setNav(!isOpen);
      if (!isOpen) return;
      nav.addEventListener('transitionend', function onEnd(e) {
        if (e.target !== nav) return;
        nav.removeEventListener('transitionend', onEnd);
        focusDrawer();
      });
      window.setTimeout(focusDrawer, 400);
    });

    if (scrim) scrim.addEventListener('click', function () { closeNav(false); });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav(true);
    });

    // Keep focus inside the drawer while it is open.
    document.addEventListener('focusin', function (e) {
      if (!isOpen) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      var first = nav.querySelector('a');
      if (first) first.focus();
    });

    var wide = window.matchMedia('(min-width: 901px)');
    var onWide = function (e) { if (e.matches) closeNav(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else if (wide.addListener) wide.addListener(onWide);
  }

  /* --- Reveal on scroll --------------------------------------------------- */
  var targets = document.querySelectorAll('[data-reveal]');

  function showAll() {
    for (var i = 0; i < targets.length; i++) targets[i].classList.add('is-in');
  }

  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showAll();
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    for (var j = 0; j < targets.length; j++) observer.observe(targets[j]);

    // Safety net: never leave content hidden if something goes wrong.
    window.setTimeout(showAll, 3000);
  }
})();

/* --- Service worker ------------------------------------------------------ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function (err) {
      console.error('Service worker registration failed:', err);
    });
  });
}
