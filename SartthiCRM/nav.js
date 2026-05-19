/* Shared Nav + Utilities for SartthiCRM */
const NAV_HTML = `
<div id="spb"></div>
<div id="toast"><span><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span><span id="toast-msg">Done!</span></div>
<header id="hdr">
  <a class="logo" href="index.html">
    <div class="logo-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
    <div class="logo-text">Sartthi<span>CRM</span></div>
  </a>
  <nav id="desktop-nav">
    <div class="nav-link has-drop" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false">Products
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
      <div class="drop drop-sm">
        <a class="di" href="product-it-sales.html"><div class="di-ico" style="background:#EFF6FF"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div><div><div class="di-name">IT Sales & Support CRM</div><div class="di-sub">Pipeline, tickets, client mgmt</div></div></a>
        <a class="di" href="product-ca.html"><div class="di-ico" style="background:#F0FDF4"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v17"/><path d="M5 20h14"/><path d="M22 8h-4l-3-5H9L6 8H2"/><path d="M2 8l2 6h16l2-6"/></svg></div><div><div class="di-name">CA Practice Manager CRM</div><div class="di-sub">GST, ITR, compliance calendar</div></div></a>
        <a class="di" href="product-retail.html"><div class="di-ico" style="background:#FEFCE8"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div><div><div class="di-name">Retail & Distribution CRM</div><div class="di-sub">Inventory, orders, distributor</div></div></a>
      </div>
    </div>
    <a class="nav-link" href="features.html">Features</a>
    <a class="nav-link" href="integrations.html">Integrations</a>
    <a class="nav-link" href="use-cases.html">Use Cases</a>
    <div class="nav-link has-drop" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false">Company
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
      <div class="drop drop-sm">
        <a class="di" href="about.html"><div class="di-ico" style="background:var(--sky-l)"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M8 14h.01M12 14h.01M16 14h.01"/></svg></div><div><div class="di-name">About Sartthi AI</div><div class="di-sub">Mission, team & values</div></div></a>
        <a class="di" href="partners.html"><div class="di-ico" style="background:#F0FDF4"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2-.9-2-2v-4a2 2 0 0 1 2-2h3"/><path d="M16 3v2a4 4 0 0 1 4 4h3c1.1 0 2 .9 2 2v4a2 2 0 0 1-2 2h-3"/></svg></div><div><div class="di-name">Partners</div><div class="di-sub">Become a partner</div></div></a>
        <a class="di" href="contact.html"><div class="di-ico" style="background:#FEFCE8"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div><div><div class="di-name">Contact & Support</div><div class="di-sub">Talk to our team</div></div></a>
      </div>
    </div>
  </nav>
  <div class="hdr-r">
    <a class="btn-ghost-sm" href="auth.html">Sign In</a>
    <a class="btn-nav" href="auth.html#register">Start Free Trial →</a>
    <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
<div class="mobile-nav" id="mobile-nav" aria-hidden="true">
  <div class="mobile-nav-panel">
    <a href="product-it-sales.html">IT Sales CRM</a>
    <a href="product-ca.html">CA Practice Manager</a>
    <a href="product-retail.html">Retail & Distribution</a>
    <a href="features.html">Features</a>
    <a href="integrations.html">Integrations</a>
    <a href="use-cases.html">Use Cases</a>
    <a href="about.html">About</a>
    <a href="partners.html">Partners</a>
    <a href="contact.html">Contact</a>
    <a href="auth.html">Sign In</a>
    <a class="mn-cta" href="auth.html#register">Start Free Trial →</a>
  </div>
</div>`;

const FOOTER_HTML = `
<footer>
  <div class="ft container">
    <div>
      <div class="flogo"><div class="flogo-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div><div class="flogo-txt">Sartthi<span>CRM</span></div></div>
      <div class="ftagline">India's most powerful domain-specific CRM. Built for IT, CA Firms &amp; Retail — powered by Sartthi AI, Ahilyanagar.</div>
      <div class="fcontact-quick">
        <a href="https://wa.me/917083373681" class="fcontact-item">💬 +91 70833 73681</a>
        <a href="mailto:connect@sartthi.com" class="fcontact-item">✉ connect@sartthi.com</a>
      </div>
      <div class="fsocs"><a class="fsoc" href="#">in</a><a class="fsoc" href="#">X</a><a class="fsoc" href="#">YT</a></div>
    </div>
    <div><div class="fch">Products</div><ul class="flinks"><li><a href="product-it-sales.html">IT Sales & Support CRM</a></li><li><a href="product-ca.html">CA Practice Manager CRM</a></li><li><a href="product-retail.html">Retail & Distribution CRM</a></li></ul></div>
    <div><div class="fch">Platform</div><ul class="flinks"><li><a href="features.html">Features</a></li><li><a href="integrations.html">Integrations</a></li><li><a href="use-cases.html">Use Cases</a></li></ul></div>
    <div><div class="fch">Company</div><ul class="flinks"><li><a href="about.html">About Sartthi AI</a></li><li><a href="partners.html">Partners</a></li><li><a href="contact.html">Contact Us</a></li></ul></div>
    <div><div class="fch">Legal</div><ul class="flinks"><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Service</a></li><li><a href="#">Refund Policy</a></li></ul></div>
  </div>
  <div class="fb container"><div class="fcp">© 2025 Sartthi AI Pvt. Ltd. (The Tech Factory) · Sartthi, next to Greenways Motors, Kaushalya Nagar, Ahmednagar–Aurangabad Rd, Surya Nagar, Ahilyanagar, Maharashtra 414003</div><div class="flegal"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Refund</a></div></div>
</footer>`;

function injectPremiumAssets() {
  if (!document.querySelector('link[href="home.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'home.css';
    document.head.appendChild(link);
  }
  const page = location.pathname.split('/').pop() || 'index.html';
  if (page !== 'auth.html' && !document.querySelector('script[src="motion.js"]')) {
    const script = document.createElement('script');
    script.src = 'motion.js';
    script.async = false;
    document.body.appendChild(script);
  }
}

function injectStickyCta() {
  const page = location.pathname.split('/').pop() || 'index.html';
  if (page === 'auth.html' || document.getElementById('sticky-cta')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div id="sticky-cta" class="sticky-cta" role="region" aria-label="Start trial">
      <div class="sticky-cta-inner">
        <p class="sticky-cta-text">Ready to grow? <span>14-day free trial — no credit card.</span></p>
        <div class="sticky-cta-actions">
          <a class="btn-ghost-sm" href="contact.html">Book Demo</a>
          <a class="btn-nav" href="auth.html#register">Start Free Trial →</a>
        </div>
      </div>
    </div>`);
}

document.addEventListener('DOMContentLoaded', () => {
  injectPremiumAssets();
  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
  document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);
  injectStickyCta();

  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav .nav-link[href]').forEach((a) => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  const spb = document.getElementById('spb');
  const hdr = document.getElementById('hdr');
  window.addEventListener('scroll', () => {
    if (spb) spb.style.width = (scrollY / (document.body.scrollHeight - innerHeight) * 100) + '%';
    if (hdr) hdr.classList.toggle('scrolled', scrollY > 20);
  }, { passive: true });

  const toggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open);
      mobileNav.setAttribute('aria-hidden', !open);
    });
    mobileNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
      });
    });
  }

  const dropParents = Array.from(document.querySelectorAll('.has-drop'));
  if (dropParents.length) {
    dropParents.forEach((item) => {
      item.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = item.classList.toggle('open');
        item.setAttribute('aria-expanded', isOpen);
        dropParents.forEach((other) => {
          if (other !== item) other.classList.remove('open');
        });
      });
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          item.click();
        }
      });
    });

    document.addEventListener('click', () => {
      dropParents.forEach((item) => item.classList.remove('open'));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        dropParents.forEach((item) => item.classList.remove('open'));
      }
    });
  }

  initAnim();
});

function initAnim() {
  setTimeout(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('[data-anim]').forEach((el) => {
      el.classList.remove('visible');
      obs.observe(el);
    });
    const sObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('staggered');
          sObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('[data-stagger]').forEach((el) => {
      el.classList.remove('staggered');
      sObs.observe(el);
    });
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !e.target.dataset.done) {
          e.target.dataset.done = 1;
          const t = +e.target.dataset.t;
          const dur = 1800;
          let s = null;
          const step = (ts) => {
            if (!s) s = ts;
            const p = Math.min((ts - s) / dur, 1);
            e.target.textContent = Math.round((1 - Math.pow(1 - p, 3)) * t).toLocaleString();
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.count').forEach((c) => cObs.observe(c));
  }, 50);
}

function showToast(msg, dur = 3500) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

function toggleFaq(q) {
  const item = q.parentElement;
  document.querySelectorAll('.faq-item.open').forEach((i) => { if (i !== item) i.classList.remove('open'); });
  item.classList.toggle('open');
}
