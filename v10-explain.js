/* IB-7 Erklär-Szenen v10 (Entwurf 13.10.2026). Vanilla JS, keine Bibliothek, defer.
   Vertrag: section.v10-scene[data-scene] mit li.v10-scene__step (Reihenfolge = Schritt 0..n-1),
   darin button.v10-scene__btn; Grafik in .v10-scene__vis: entweder figure[data-scene-vis="i"] (Bildwechsel)
   oder eine SVG, die über data-step an der Szene gesteuert wird (CSS).
   Ausgabe: data-step und --i an der Szene, .is-active an Schritt und .is-on an Bild, aria-current am Button.
   Gepinnt nur mit JS und ohne reduzierte Bewegung (.is-live), sonst ruhige Liste mit allen Texten.
   Punktfelder: svg[data-scene-field="sources|combos"] werden einmal gezeichnet (auch ohne Bewegung).
   Runde 5: Ebenen [data-scene-layer="i" | "a-b" | "a+"] bekommen .is-on im passenden Schritt (Variante .v10-scene--layers).
   Ein passiver Scroll-Listener mit requestAnimationFrame. Shopify: Web Component <ib7-scene>. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  var seed = 7, rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  var dot = function (svg, x, y, r, o) { var c = doc.createElementNS(NS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r); c.setAttribute('class', 'dot'); c.setAttribute('opacity', o); svg.insertBefore(c, svg.firstChild); };
  doc.querySelectorAll('svg[data-scene-field="sources"]').forEach(function (svg) { for (var i = 0; i < 140; i++) dot(svg, (8 + rnd() * 304).toFixed(1), (8 + rnd() * 184).toFixed(1), (0.8 + rnd() * 1.8).toFixed(1), (0.25 + rnd() * 0.6).toFixed(2)); });
  doc.querySelectorAll('svg[data-scene-field="combos"]').forEach(function (svg) {
    var keep = { 5: 1, 18: 1, 23: 1, 37: 1, 44: 1, 52: 1, 61: 1, 70: 1, 79: 1, 86: 1, 95: 1, 101: 1, 110: 1, 118: 1 };
    for (var r = 0, k = 0; r < 8; r++) for (var c = 0; c < 16; c++, k++) dot(svg, 20 + c * 18.6, 30 + r * 19, keep[k] ? 4 : 2, keep[k] ? 1 : 0.25);
  });

  var scenes = [];
  doc.querySelectorAll('[data-scene]').forEach(function (el) {
    var steps = Array.prototype.slice.call(el.querySelectorAll('.v10-scene__step'));
    if (!steps.length) return;
    var vis = el.querySelectorAll('[data-scene-vis]');
    /* Runde 5: Ebenen je Schritt. [data-scene-layer="2"] nur in Schritt 2, "1-3" von 1 bis 3, "2+" ab Schritt 2
       (zählt ab 0). So kann eine SVG über alle Schritte weitergeführt werden (z. B. Sternfeld bei THE MIND). */
    var layers = Array.prototype.slice.call(el.querySelectorAll('[data-scene-layer]')).map(function (l) {
      var v = (l.getAttribute('data-scene-layer') || '').trim(), m = v.match(/^(\d+)(?:\s*-\s*(\d+)|(\+))?$/), a = m ? Number(m[1]) : 0;
      return { el: l, a: a, b: m ? (m[3] ? 999 : (m[2] ? Number(m[2]) : a)) : 999 };
    });
    var paintLayers = function (i) { layers.forEach(function (l) { l.el.classList.toggle('is-on', i >= l.a && i <= l.b); }); };
    var sc = { el: el, steps: steps, vis: vis, i: -1 };
    sc.set = function (i) {
      if (i === sc.i) return;
      sc.i = i;
      el.setAttribute('data-step', i);
      el.style.setProperty('--i', i);
      steps.forEach(function (s, k) {
        s.classList.toggle('is-active', k === i);
        var b = s.querySelector('.v10-scene__btn');
        if (b) { if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); }
      });
      vis.forEach(function (v) { v.classList.toggle('is-on', Number(v.getAttribute('data-scene-vis')) === i); });
      paintLayers(i);
    };
    if (layers.length) el.classList.add('has-layers');
    if (reduce) { paintLayers(steps.length - 1); return; }   /* ruhiger Endzustand: alle Texte, Grafik fertig (Ebenen des letzten Schritts) */
    el.style.setProperty('--n', steps.length);
    el.classList.add('is-live');
    steps.forEach(function (s, k) {
      var b = s.querySelector('.v10-scene__btn');
      if (!b) return;
      b.addEventListener('click', function () {
        var r = el.getBoundingClientRect(), span = el.offsetHeight - window.innerHeight;
        window.scrollTo({ top: window.scrollY + r.top + Math.max(0, span) * (k + 0.5) / steps.length, behavior: 'smooth' });
        sc.set(k);
      });
      b.addEventListener('keydown', function (e) {
        var to = null, n = steps.length;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') to = Math.min(n - 1, k + 1);
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') to = Math.max(0, k - 1);
        if (to === null || to === k) return;
        e.preventDefault();
        var nb = steps[to].querySelector('.v10-scene__btn'); if (nb) { nb.focus(); nb.click(); }
      });
    });
    sc.set(0);
    scenes.push(sc);
  });
  if (!scenes.length) return;
  root.classList.add('v10x-on');

  var raf = 0;
  var tick = function () {
    raf = 0;
    var vh = window.innerHeight;
    scenes.forEach(function (sc) {
      var r = sc.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = Math.min(0.9999, Math.max(0, -r.top / Math.max(1, r.height - vh)));
      sc.set(Math.floor(p * sc.steps.length));
    });
  };
  var request = function () { if (!raf) raf = requestAnimationFrame(tick); };
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  request();
})();
