/* ==========================================================================
   JIWON BAEK — THE EVIDENCE GALLERY
   Vanilla JS: entrance, nav, scroll reveal, metric counters, exhibit rail,
   and the two expandable "archive" disclosures. No dependencies.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     ENTRANCE
     ------------------------------------------------------------------ */
  (function entrance() {
    const el = document.getElementById('entrance');
    const skipBtn = document.getElementById('entranceSkip');
    if (!el) return;

    const alreadySeen = sessionStorage.getItem('entranceShown') === '1';
    const skipAnimation = reduceMotion || alreadySeen;

    const finish = () => {
      el.classList.add('open');
      document.body.classList.remove('entrance-lock');
      sessionStorage.setItem('entranceShown', '1');
      window.setTimeout(() => {
        el.classList.add('hidden');
      }, skipAnimation ? 0 : 720);
    };

    if (skipAnimation) {
      el.classList.add('instant');
      finish();
      return;
    }

    document.body.classList.add('entrance-lock');
    // Kick off the word-cycle animation.
    requestAnimationFrame(() => el.classList.add('play'));

    const AUTO_DISMISS_MS = 1300;
    let dismissed = false;
    const timer = window.setTimeout(() => {
      if (!dismissed) { dismissed = true; finish(); }
    }, AUTO_DISMISS_MS);

    skipBtn.addEventListener('click', () => {
      if (dismissed) return;
      dismissed = true;
      window.clearTimeout(timer);
      finish();
    });
  })();

  /* ------------------------------------------------------------------
     NAV — scrolled state, mobile toggle, active-link tracking
     ------------------------------------------------------------------ */
  (function nav() {
    const navEl = document.getElementById('siteNav');
    const toggle = document.getElementById('navToggle');
    const mobile = document.getElementById('navMobile');
    if (!navEl) return;

    const onScroll = () => {
      navEl.classList.toggle('scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toggle && mobile) {
      toggle.addEventListener('click', () => {
        const isOpen = mobile.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      });
      mobile.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          mobile.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', 'Open menu');
        });
      });
    }

    const sectionIds = ['gallery', 'experience', 'about', 'contact'];
    const links = Array.from(document.querySelectorAll('.nav-links a'));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((l) => l.classList.remove('active'));
            const match = links.find((l) => l.getAttribute('href') === `#${entry.target.id}`);
            if (match) match.classList.add('active');
          });
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
      );
      sections.forEach((s) => spy.observe(s));
    }
  })();

  /* ------------------------------------------------------------------
     SCROLL REVEAL
     ------------------------------------------------------------------ */
  (function reveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    items.forEach((el) => io.observe(el));
  })();

  /* ------------------------------------------------------------------
     METRIC COUNTERS
     ------------------------------------------------------------------ */
  (function counters() {
    const counters = document.querySelectorAll('.count');
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      if (reduceMotion) { el.textContent = target; return; }

      const duration = 1100;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => io.observe(el));
  })();

  /* ------------------------------------------------------------------
     EXHIBIT RAIL — arrow controls + current-index counter
     ------------------------------------------------------------------ */
  (function exhibitRail() {
    const track = document.getElementById('railTrack');
    const prev = document.querySelector('.rail-prev');
    const next = document.querySelector('.rail-next');
    const counter = document.getElementById('railCurrent');
    if (!track) return;

    const cards = Array.from(track.children);

    const scrollByCard = (dir) => {
      const card = cards[0];
      if (!card) return;
      const amount = card.getBoundingClientRect().width + 22; // gap
      track.scrollBy({ left: dir * amount, behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    prev && prev.addEventListener('click', () => scrollByCard(-1));
    next && next.addEventListener('click', () => scrollByCard(1));

    if (counter && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
              const idx = cards.indexOf(entry.target);
              if (idx > -1) counter.textContent = String(idx + 1).padStart(2, '0');
            }
          });
        },
        { root: track, threshold: [0.6] }
      );
      cards.forEach((c) => io.observe(c));
    }
  })();

  /* ------------------------------------------------------------------
     EXPANDABLE DISCLOSURES — Data & Analytics Archive / Beyond Work
     ------------------------------------------------------------------ */
  function wireToggle(btnId, boxId, labelExpand, labelCollapse) {
    const btn = document.getElementById(btnId);
    const box = document.getElementById(boxId);
    const label = btn && btn.querySelector('.toggle-icon') && btn.querySelector('.toggle-icon').nextSibling;
    if (!btn || !box || !label) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      box.hidden = isOpen;
      label.textContent = ` ${isOpen ? labelExpand : labelCollapse}`;
    });
  }

  wireToggle('archiveToggle', 'archiveBox', 'View additional analytical work', 'Hide additional analytical work');
  wireToggle('beyondToggle', 'beyondBox', 'View earlier leadership', 'Hide earlier leadership');

  /* ------------------------------------------------------------------
     FOOTER YEAR
     ------------------------------------------------------------------ */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
