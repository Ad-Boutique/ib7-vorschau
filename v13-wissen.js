/* IB-7 Wissensseiten v6 (Entwurf 13.10.2026, Runde 7): Kopie von v10-wissen.js plus Scroll-Scrub, Vanilla JS, defer, nach v10.js.
   0 Scrub: [data-vw-scrub] setzt --vw-e (0 bis 1) nach Lage im Viewport, [data-vw-prog] setzt --vw-p (0 bis 1) am Abschnitt
     ("pass" = ganze Durchfahrt, sonst Einfahrt). Nur ohne reduzierte Bewegung, Klasse vw-js am html. Shopify: Web Component <ib7-scrub>.
   1 Inhaltsstoffe: [data-vw-pick] und #hash springen zu einem Wirkstoff (Szene oder Karte)
   2 Vergleich: Mini-Rechner [data-vw-calc] (nur Preisvergleich mit dem Duo)
   Shopify: je Funktion ein kleiner Web Component (ib7-wirkstoffe, ib7-rechner), kein Framework. */
(function () {
  'use strict';
  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var eur = function (n) { return n.toLocaleString('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

  /* ---------- 1 Wirkstoff anspringen ---------- */
  var show = function (id) {
    var el = doc.querySelector('[data-vw-id="' + id + '"]');
    if (!el) return false;
    if (el.classList.contains('v10-ingr__item')) {
      var b = el.querySelector('.v10-ingr__name');
      if (b) b.click(); /* v10.js scrollt im Szenen-Modus zum Abschnitt und wählt den Wirkstoff */
      if (reduce) el.scrollIntoView({ block: 'center' });
    } else {
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      el.classList.remove('vw-flash');
      void el.offsetWidth;
      el.classList.add('vw-flash');
    }
    return true;
  };
  var initIngredients = function () {
    doc.querySelectorAll('[data-vw-pick]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        if (show(b.getAttribute('data-vw-pick'))) e.preventDefault();
      });
    });
    var fromHash = function () {
      var id = decodeURIComponent((location.hash || '').slice(1));
      if (id) show(id);
    };
    window.addEventListener('hashchange', fromHash);
    if (location.hash) setTimeout(fromHash, 60);
  };

  /* ---------- 2 Mini-Rechner ---------- */
  var DUO = 179; /* im Shop aus Liquid (Summe der Duo-Variante), hier nur Entwurf */
  var initCalc = function (form) {
    var out = form.querySelector('[data-vw-out]');
    var inputs = form.querySelectorAll('input');
    var idle = out ? out.textContent : '';
    var run = function () {
      var sum = 0, n = 0;
      inputs.forEach(function (i) { var v = parseFloat(String(i.value).replace(',', '.')); if (v > 0) { sum += v; n++; } });
      if (!out) return;
      if (!n) { out.textContent = idle; return; }
      var diff = sum - DUO;
      out.textContent = (n === 1 ? 'Dein Produkt kostet ' : 'Deine ' + n + ' Produkte kosten zusammen ') + eur(sum) + ' €. Das Perfect Duo kostet ' + eur(DUO) + ' €' +
        (diff > 0 ? ', also ' + eur(diff) + ' € weniger.' : diff < 0 ? ', also ' + eur(-diff) + ' € mehr. Dafür bekommst du ein abgestimmtes Ritual, 2 x 50 ml und 30 Tage Testzeit.' : ', genauso viel.');
    };
    inputs.forEach(function (i) { i.addEventListener('input', run); });
    form.addEventListener('submit', function (e) { e.preventDefault(); run(); });
  };


  /* ---------- 0 Scroll-Scrub ---------- */
  (function () {
    if (reduce) return;
    var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
    var items = [];
    doc.querySelectorAll('[data-vw-scrub]').forEach(function (el) {
      var k = Number(el.getAttribute('data-vw-scrub')) || 0;
      items.push({ el: el, run: function (vh) {
        var top = el.getBoundingClientRect().top;
        el.style.setProperty('--vw-e', clamp((vh * (0.94 - k * 0.03) - top) / (vh * 0.3)).toFixed(3));
      } });
    });
    doc.querySelectorAll('[data-vw-prog]').forEach(function (el) {
      var pass = el.getAttribute('data-vw-prog') === 'pass';
      items.push({ el: el, run: function (vh) {
        var r = el.getBoundingClientRect();
        var p = pass ? clamp((vh - r.top) / (vh + r.height)) : clamp((vh * 0.9 - r.top) / (vh * 0.8));
        el.style.setProperty('--vw-p', p.toFixed(3));
      } });
    });
    if (!items.length) return;
    var visible = new Set(), ticking = false;
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
      schedule();
    }, { rootMargin: '30% 0px 30% 0px' }) : null;
    items.forEach(function (it) { if (io) io.observe(it.el); });
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      items.forEach(function (it) { if (!io || visible.has(it.el)) it.run(vh); });
    };
    var schedule = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    items.forEach(function (it) { it.run(window.innerHeight); });
    doc.documentElement.classList.add('vw-js');
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
  })();

  var start = function () {
    initIngredients();
    doc.querySelectorAll('[data-vw-calc]').forEach(initCalc);
  };
  var done = false, once = function () { if (!done) { done = true; start(); } };
  if (doc.readyState === 'complete') once();
  else { doc.addEventListener('DOMContentLoaded', once); window.addEventListener('load', once); }
})();
