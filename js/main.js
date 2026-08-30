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

  /* --- Contact form ------------------------------------------------------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');
    var openedAt = Date.now();

    function setError(field, msg) {
      var wrap = form.querySelector('#cf-' + field);
      var slot = form.querySelector('[data-error-for="' + field + '"]');
      if (slot) slot.textContent = msg || '';
      if (wrap && wrap.parentNode) {
        if (msg) wrap.parentNode.setAttribute('data-invalid', '');
        else wrap.parentNode.removeAttribute('data-invalid');
        wrap.setAttribute('aria-invalid', msg ? 'true' : 'false');
      }
    }

    function say(msg, state) {
      if (!status) return;
      status.textContent = msg;
      if (state) status.setAttribute('data-state', state);
      else status.removeAttribute('data-state');
    }

    function validate(values) {
      var errors = {};
      if (!values.name) errors.name = 'Please tell us your name.';
      if (!values.email) errors.email = 'Please add an email address.';
      else if (!/^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$/.test(values.email)) errors.email = 'That email address does not look right.';
      if (!values.message) errors.message = 'Please describe what you need.';
      else if (values.message.length < 20) errors.message = 'A little more detail would help us reply usefully.';
      return errors;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var values = {
        name: form.querySelector('#cf-name').value.trim(),
        email: form.querySelector('#cf-email').value.trim(),
        message: form.querySelector('#cf-message').value.trim(),
        company: form.querySelector('#cf-company').value.trim(),
        elapsed: Date.now() - openedAt
      };

      ['name', 'email', 'message'].forEach(function (f) { setError(f, ''); });

      var errors = validate(values);
      var bad = Object.keys(errors);
      if (bad.length) {
        bad.forEach(function (f) { setError(f, errors[f]); });
        say('Please check the highlighted fields.', 'error');
        var firstBad = form.querySelector('#cf-' + bad[0]);
        if (firstBad) firstBad.focus();
        return;
      }

      submit.disabled = true;
      say('Sending…');

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { ok: res.ok, status: res.status, data: data };
          });
        })
        .then(function (result) {
          if (result.ok && result.data.ok) {
            form.reset();
            openedAt = Date.now();
            say('Thank you — your brief is with us. We will reply to the address you gave.', 'ok');
            return;
          }
          if (result.status === 422 && result.data.errors) {
            Object.keys(result.data.errors).forEach(function (f) { setError(f, result.data.errors[f]); });
            say('Please check the highlighted fields.', 'error');
            return;
          }
          throw new Error('unavailable');
        })
        .catch(function () {
          // Never strand the visitor: point at a channel that always works.
          say('That did not send. Please email info@mk313.com or message us on WhatsApp and we will pick it up.', 'error');
        })
        .then(function () {
          submit.disabled = false;
        });
    });
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
