/* SartthiCRM — Premium motion & interactions */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initAll() {
    initHeroParallax();
    initOverviewTabs();
    initStickyCta();
    initMouseGlow();
    initWorkflowLines();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  function initHeroParallax() {
    const stage = document.querySelector('.hero-stage');
    if (!stage || prefersReduced) return;

    const floats = stage.querySelectorAll('.float-card');
    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      floats.forEach((el, i) => {
        const depth = (i + 1) * 6;
        el.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
      const frame = stage.querySelector('.browser-frame');
      if (frame) {
        frame.style.transform = `rotateY(${-4 + x * 4}deg) rotateX(${2 - y * 4}deg)`;
      }
    });
    stage.addEventListener('mouseleave', () => {
      floats.forEach((el) => { el.style.transform = ''; });
      const frame = stage.querySelector('.browser-frame');
      if (frame) frame.style.transform = '';
    });
  }

  function initOverviewTabs() {
    const tabs = document.querySelectorAll('.ov-tab');
    const cards = document.querySelectorAll('.ov-card');
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        cards.forEach((card) => {
          const show = filter === 'all' || card.dataset.cat === filter;
          card.classList.toggle('hidden', !show);
        });
      });
    });
  }

  function initStickyCta() {
    const bar = document.getElementById('sticky-cta');
    if (!bar) return;
    const hero = document.querySelector('.hero-premium');
    if (!hero) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        const show = !entry.isIntersecting;
        bar.classList.toggle('visible', show);
        document.body.classList.toggle('has-sticky-cta', show);
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    obs.observe(hero);
  }

  function initMouseGlow() {
    const spotlight = document.querySelector('.spotlight-sec');
    if (!spotlight || prefersReduced) return;

    spotlight.addEventListener('mousemove', (e) => {
      const rect = spotlight.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      spotlight.style.setProperty('--mouse-x', `${x}%`);
      spotlight.style.setProperty('--mouse-y', `${y}%`);
    });
  }

  function initWorkflowLines() {
    const canvas = document.querySelector('.workflow-canvas');
    if (!canvas || prefersReduced) return;

    const svg = canvas.querySelector('.wf-svg-lines');
    if (!svg) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          svg.querySelectorAll('.wf-line').forEach((l) => l.classList.add('active'));
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(canvas);
  }
})();
