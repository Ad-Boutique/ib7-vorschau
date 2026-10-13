/* IB-7 Prototyp v12-home.js (Entwurf 13.10.2026, Builder A, Präfix vh-). Vanilla JS, defer, nach v10.js. Kein v10-explain mehr.
   1 Science-Szene .vh-sci (POUCH "03 / THE SCIENCE"): kontinuierlich an den Scroll gekoppelt, kein Schrittwechsel.
     Setzt auf .vh-sci__stage die Variablen --a (Phase A 0..1: Punkte laufen durch, Produkt dreht), --b (Phase B 0..1: Ende mit Karten),
     --p (Gesamtfortschritt), --rot, --pty, --ps, --iy. Variante Produkt: PULSE, AURA, Duo (Überblendung bei etwa 1/3 und 2/3),
     im Ende folgt das Produkt der gewählten Karte (Hover, Fokus, Tipp). Ohne JS oder bei reduzierter Bewegung bleibt die Section statisch.
   2 Wort-Reihe .vh-words: Wörter blenden versetzt ein, gekoppelt an die Scrollposition.
   Shopify: je Funktion ein kleiner Web Component, kein Framework. */
(function () {
  'use strict';
  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 990px)');
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { return t * t * (3 - 2 * t); };
  var queue = [], ticking = false;
  var request = function (fn) {
    if (queue.indexOf(fn) < 0) queue.push(fn);
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; var q = queue.slice(); queue.length = 0; q.forEach(function (f) { f(); }); });
  };

  var scene = function (el) {
    var stage = el.querySelector('.vh-sci__stage'), win = el.querySelector('.vh-sci__window'), list = el.querySelector('.vh-sci__items');
    var items = Array.prototype.slice.call(el.querySelectorAll('.vh-sci__item'));
    var figs = Array.prototype.slice.call(el.querySelectorAll('.vh-prod')), cards = Array.prototype.slice.call(el.querySelectorAll('[data-vh-pick]'));
    if (!stage || !win || !list || !items.length) return;
    var canSticky = window.CSS && CSS.supports && CSS.supports('position', 'sticky');
    if (reduce || !canSticky) return;
    el.classList.add('is-live');

    var pick = 'duo', last = '', centers = [], winH = 0, headH = 0, vh = 0, A = 0;
    var show = function (k) {
      if (k === last) return; last = k;
      figs.forEach(function (f) { f.classList.toggle('is-on', f.getAttribute('data-vh-prod') === k); });
    };
    var marks = function (end) {
      cards.forEach(function (c) { c.classList.toggle('is-pick', end && c.getAttribute('data-vh-pick') === pick && !!c.querySelector('.v10-plus')); });
    };
    var measure = function () {
      winH = win.offsetHeight; vh = window.innerHeight;
      headH = parseFloat(getComputedStyle(doc.documentElement).getPropertyValue('--header-h')) || 0;
      var hd = doc.querySelector('.v10-header, header');
      if (hd && !headH) headH = hd.offsetHeight;
      centers = items.map(function (li) { return li.offsetTop + li.offsetHeight / 2; });
    };
    var center = function (pos) {
      var n = centers.length - 1, i = clamp(Math.floor(pos), 0, Math.max(0, n - 1));
      if (n < 1) return centers[0];
      return lerp(centers[i], centers[i + 1], clamp(pos - i));
    };
    var update = function () {
      var r = el.getBoundingClientRect(), scrollable = el.offsetHeight - stage.offsetHeight;
      if (scrollable <= 0) return;
      var top = parseFloat(getComputedStyle(stage).top) || headH;
      var p = clamp(-(r.top - top) / scrollable);
      var e = clamp((vh - r.top) / Math.max(1, vh - top));        /* Einfahren der Bühne über die helle Section */
      var split = 0.7;
      A = clamp(p / split);
      var B = clamp((p - split) / (1 - split));
      var d = wide.matches;
      var iy = winH * (d ? 0.32 : 0.36) - center(A * (items.length - 1));
      var rise = clamp(e * 0.5 + clamp(A / 0.3) * 0.5);            /* Produkt taucht unten auf und steigt */
      var pty = lerp(d ? 58 : 34, 0, ease(rise));
      var rot = lerp(-14, 12, ease(A)) - 10 * (1 - e);
      var eb = ease(B);
      if (B > 0) rot = lerp(12, d ? 5 : -4, eb);
      var ps = d ? lerp(1, 0.94, eb) : lerp(1, 0.46, ease(clamp(B * 2.5)));
      stage.style.setProperty('--p', p.toFixed(4));
      stage.style.setProperty('--a', A.toFixed(4));
      stage.style.setProperty('--b', B.toFixed(4));
      stage.style.setProperty('--iy', iy.toFixed(1));
      stage.style.setProperty('--pty', pty.toFixed(2));
      stage.style.setProperty('--rot', rot.toFixed(2));
      stage.style.setProperty('--ps', ps.toFixed(3));
      var pos = A * (items.length - 1);
      items.forEach(function (li, i) { li.style.opacity = clamp(1 - Math.abs(i - pos) * 0.75, 0.2, 1).toFixed(2); });
      var end = B > 0.3;
      el.classList.toggle('is-end', end);
      var k = end ? pick : (A < 0.33 ? 'pulse' : (A < 0.66 ? 'aura' : 'duo'));
      show(k); marks(end);
    };
    var onScroll = function () { request(update); };
    var remeasure = function () { measure(); request(update); };
    measure(); update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);
    if (wide.addEventListener) wide.addEventListener('change', remeasure);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(remeasure);

    var choose = function (c) { pick = c.getAttribute('data-vh-pick'); if (el.classList.contains('is-end')) { show(pick); marks(true); } };
    cards.forEach(function (c) {
      c.addEventListener('mouseenter', function () { choose(c); });
      c.addEventListener('focusin', function () { choose(c); });
      c.addEventListener('click', function (e) { if (!e.target.closest('.v10-plus')) choose(c); });
    });
  };

  var words = function (w) {
    var lis = Array.prototype.slice.call(w.querySelectorAll('.vh-words__row li'));
    if (!lis.length || reduce) return;
    var update = function () {
      var vh = window.innerHeight, r = w.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      var t = clamp((vh * 0.92 - r.top) / (vh * 0.5));
      lis.forEach(function (li, i) {
        var v = clamp(t * 1.8 - i * 0.28);
        li.style.setProperty('--w', ease(v).toFixed(3));
      });
    };
    update();
    window.addEventListener('scroll', function () { request(update); }, { passive: true });
    window.addEventListener('resize', function () { request(update); });
  };

  var start = function () {
    doc.querySelectorAll('.vh-sci').forEach(scene);
    var w = doc.querySelector('.vh-words'); if (w) words(w);
  };
  var done = false, once = function () { if (!done) { done = true; start(); } };
  if (doc.readyState === 'complete' || doc.readyState === 'interactive') once();
  else { doc.addEventListener('DOMContentLoaded', once); window.addEventListener('load', once); }
})();
