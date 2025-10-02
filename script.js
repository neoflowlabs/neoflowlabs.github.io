// ===== Helpers
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// ===== Mobile menu
const hamburger  = $('.hamburger');
const mobileMenu = $('.mobile-menu');
let lastFocus = null;

function openMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.add('open');
  document.body.classList.add('body-lock');   // requires .body-lock { overflow:hidden; } in CSS
  lastFocus = document.activeElement;
  // Focus first link for accessibility
  const firstLink = $('a', mobileMenu);
  firstLink && firstLink.focus();
  document.addEventListener('keydown', trapFocus);
}

function closeMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  document.body.classList.remove('body-lock');
  document.removeEventListener('keydown', trapFocus);
  // Restore focus
  lastFocus && lastFocus.focus && lastFocus.focus();
}

function trapFocus(e) {
  if (e.key === 'Escape') return closeMenu();
  if (e.key !== 'Tab') return;

  const focusables = $$('a, button, [tabindex]:not([tabindex="-1"])', mobileMenu)
    .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
  if (!focusables.length) return;

  const first = focusables[0];
  const last  = focusables[focusables.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    last.focus();
    e.preventDefault();
  } else if (!e.shiftKey && document.activeElement === last) {
    first.focus();
    e.preventDefault();
  }
}

hamburger && hamburger.addEventListener('click', () => {
  mobileMenu?.classList.contains('open') ? closeMenu() : openMenu();
});

// Close menu when a link is tapped/clicked
mobileMenu && mobileMenu.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') closeMenu();
});

// Optional: close if backdrop (empty area) is clicked
mobileMenu && mobileMenu.addEventListener('mousedown', (e) => {
  if (e.target === mobileMenu) closeMenu();
});

// ===== Active link highlight (desktop + mobile)
(function setActiveNav() {
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  $$('.nav-links a, .mobile-menu a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === current) a.classList.add('active');
    else a.classList.remove('active');
  });
})();

// ===== Reveal on scroll (respects reduced motion)
(function revealOnScroll(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = $$('.fade-in, .slide-up');
  if (prefersReduced) {
    targets.forEach(el => el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.classList.add('revealed');
        obs.unobserve(ent.target);
      }
    });
  }, { threshold: 0.2 });
  targets.forEach(el => io.observe(el));
})();

// ===== Contact form AJAX with success/error + double-submit guard
(function(){
  const form = $('#contact-form');
  if (!form) return;
  const status = $('#form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn) {
      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.dataset.originalText = originalText || '';
      submitBtn.textContent = 'Sending...';
    }

    const data = new FormData(form);
    try {
      const response = await fetch(form.action, {
        method: form.method || 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        status.textContent = '✅ Thanks, your message has been sent!';
        status.classList.remove('error');
        status.style.display = 'block';
        form.reset();
      } else {
        let msg = '❌ Oops! Something went wrong.';
        try {
          const resJson = await response.json();
          if (resJson?.errors?.length) {
            msg = '❌ ' + resJson.errors.map(e => e.message).join(', ');
          }
        } catch(_) {}
        status.textContent = msg;
        status.classList.add('error');
        status.style.display = 'block';
      }
    } catch (err) {
      status.textContent = '❌ Could not send message. Please try again later.';
      status.classList.add('error');
      status.style.display = 'block';
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText || 'Send Message';
      }
    }
  });
})();
