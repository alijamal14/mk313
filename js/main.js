// Main site interactions
(function() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open');
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Careers form validation (client-side only placeholder)
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(applyForm);
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
        // Emulate submission; in production send to backend / API
        success.hidden = false;
        applyForm.reset();
        setTimeout(()=> success.hidden = true, 5000);
      }
    });
  }
})();
