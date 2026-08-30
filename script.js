/* ═══════════════════════════════════════════════════════════════
   ComicFrame — script.js
   No frameworks, no dependencies.

   Progressive enhancement contract:
   • Nothing here is required for the page to render or convert.
     With JavaScript disabled, every heading, every paragraph and both
     store buttons are fully visible — the reveal animation's hidden
     state lives behind `html.motion`, which only JS ever adds.
   • Motion lives behind a single `html.motion` class, kept in sync with
     prefers-reduced-motion at runtime (not just at load).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  root.classList.add('js');

  /* ── 1. Motion switch ──────────────────────────────────────────
     A single class. Flipping the OS setting updates the page live. */
  function syncMotion() {
    root.classList.toggle('motion', !motionQuery.matches);
  }
  syncMotion();
  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', syncMotion);
  } else if (typeof motionQuery.addListener === 'function') {
    motionQuery.addListener(syncMotion);
  }

  /* ── 2. Scroll reveal ──────────────────────────────────────────
     The observer runs regardless of motion preference; the `.motion`
     class alone decides whether there is anything to animate. */
  var revealables = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.filter.call(
          el.parentElement ? el.parentElement.children : [],
          function (n) { return n.classList.contains('reveal'); }
        );
        var i = siblings.indexOf(el);
        if (i > 0) el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-in'); });
  }

  /* ── 3. Sticky nav state ─────────────────────────────────────── */
  var nav = document.querySelector('.nav');

  /* ── 4. Mobile store dock ────────────────────────────────────────
     Slides up once the hero's own store buttons have scrolled away, so
     the CTA is never off-screen. Without JS it simply sits there. */
  var dock = document.getElementById('dockbar');
  var hero = document.querySelector('.hero');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-stuck', y > 12);
    if (dock && hero) {
      dock.classList.toggle('is-up', y > hero.offsetHeight * 0.72);
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ── 5. Mobile menu — a real disclosure (aria-expanded/-controls) ── */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');

  if (burger && menu) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
    };

    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        burger.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenu(false);
    }, { passive: true });
  }

  /* ── 6. Hero parallax tilt ───────────────────────────────────────
     Pointer-driven, so it is gated to hover-capable large screens and
     never competes with touch. Fully skipped under reduced motion. */
  var bay = document.getElementById('bay');
  var stage = bay && bay.querySelector('[data-tilt]');
  var canTilt = window.matchMedia('(hover: hover) and (min-width: 1081px)');

  if (bay && stage) {
    var raf = null;
    var tilt = { x: 0, y: 0 };

    var apply = function () {
      raf = null;
      stage.style.transform =
        'perspective(1100px) rotateY(' + tilt.x + 'deg) rotateX(' + tilt.y + 'deg)';
    };

    var reset = function () { stage.style.transform = ''; };

    bay.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (!canTilt.matches || motionQuery.matches) { reset(); return; }
      var r = bay.getBoundingClientRect();
      tilt.x = (((e.clientX - r.left) / r.width - 0.5) * 11).toFixed(2);
      tilt.y = (-((e.clientY - r.top) / r.height - 0.5) * 8).toFixed(2);
      if (!raf) raf = requestAnimationFrame(apply);
    });

    bay.addEventListener('pointerleave', reset);
    canTilt.addEventListener && canTilt.addEventListener('change', reset);
  }

  /* ── 7. FAQ: one panel open at a time ────────────────────────── */
  var faqs = Array.prototype.slice.call(document.querySelectorAll('.faq .qa'));
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqs.forEach(function (other) { if (other !== d) other.open = false; });
    });
  });
})();
