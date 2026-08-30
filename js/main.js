// Main site interactions
(function() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  function setNavOpen(isOpen) {
    if (!navToggle || !mainNav) return;
    mainNav.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  }

  function closeNav() {
    setNavOpen(false);
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      setNavOpen(!expanded);
    });

    document.addEventListener('click', (e) => {
      if (!mainNav.classList.contains('open')) return;
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        closeNav();
      }
    });

    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeNav();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  // Careers form validation (client-side only placeholder)
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      ['name','email','area'].forEach(id => {
        const field = applyForm.querySelector('#'+id);
        const err = applyForm.querySelector(`[data-error-for="${id}"]`);
        if (!field) return;
        if (!field.value.trim()) { valid = false; if (err) err.textContent = 'Required'; }
        else if (id === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field.value)) { valid = false; if (err) err.textContent = 'Invalid email'; }
        else if (err) err.textContent = '';
      });

      const success = applyForm.querySelector('.form-success');
      if (valid && success) {
        success.hidden = false;
        applyForm.reset();
        setTimeout(()=> success.hidden = true, 5000);
      }
    });
  }
})();

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.error('Service worker registration failed:', err);
    });
  });
}
