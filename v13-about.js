/* IB-7 Prototyp: Über uns v7, Scroll-Scrub (Builder C, Runde 6, v13 mit Video, Runde 7). Vanilla JS, defer, nach v10.js.
   Eine kleine Funktion koppelt Effekte an die Scrollposition (requestAnimationFrame, IntersectionObserver):
   - [data-va-pin]: gepinnter Hero, Fortschritt p (0 bis 1) über die Pin-Strecke. Zitat [data-va-words] Wort für Wort,
     Name und Porträt über --va-p (CSS). Ist der Hero nicht gepinnt (Handy), läuft p von 0,5 (Zitat voll, Porträt folgt) über die ersten 0,3 Viewporthöhen auf 1.
   - [data-va-words] außerhalb des Hero: Wörter nach eigener Position im Viewport.
   - [data-va-fade] und [data-va-rise]: --va-e (0 bis 1) nach Position im Viewport, Wert in data-* = Staffel-Index.
   Bei reduzierter Bewegung und ohne JS bleibt alles im Endzustand (Klasse va-js wird dann nicht gesetzt).
   - [data-va-video]: Fundus-Video stumm in Schleife, nur sichtbar abspielen (IntersectionObserver), preload none.
     Bei reduzierter Bewegung und ohne JS bleibt das Poster stehen.
   Shopify-Abbildung: kleiner Web Component <ib7-scrub>. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  doc.querySelectorAll('[data-va-video]').forEach(function (v) {
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else { v.pause(); }
      });
    }, { threshold: 0.35 }).observe(v);
  });
  var clamp = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var items = [];

  function split(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', words.join(' '));
    el.textContent = '';
    return words.map(function (w, i) {
      var s = doc.createElement('span'); s.className = 'va-w'; s.setAttribute('aria-hidden', 'true'); s.textContent = w;
      el.appendChild(s); if (i < words.length - 1) el.appendChild(doc.createTextNode(' '));
      return s;
    });
  }
  function setWords(spans, p) {
    var on = Math.round(clamp(p) * spans.length);
    spans.forEach(function (s, i) { s.classList.toggle('is-on', i < on); });
  }
  /* Fortschritt eines Elements im Viewport: 0, wenn die Oberkante bei "from" (Anteil der Viewporthöhe) steht, 1 bei "to" */
  function inView(el, from, to, vh) {
    /* In gepinnten Bereichen (data-va-scope, nur wenn das Bild sticky ist) zählt die Oberkante des Bereichs, nicht des Elements */
    var scope = el.closest('[data-va-scope]');
    if (scope) { var m = scope.querySelector('.va-claim__media'); if (m && getComputedStyle(m).position === 'sticky') { el = scope; from -= 0.1; to -= 0.4; } }
    var top = el.getBoundingClientRect().top;
    return clamp((vh * from - top) / (vh * (from - to)));
  }

  var pin = doc.querySelector('[data-va-pin]');
  if (pin) {
    var hero = pin.querySelector('.va-hero'), quote = pin.querySelector('[data-va-words]');
    var hs = quote ? split(quote) : [];
    items.push({ el: pin, always: true, run: function (vh) {
      var p, sticky = getComputedStyle(hero).position === 'sticky';
      if (sticky) {
        var travel = pin.offsetHeight - hero.offsetHeight, stick = parseFloat(getComputedStyle(hero).top) || 0;
        p = travel > 0 ? clamp((stick - pin.getBoundingClientRect().top) / travel) : 1;
      } else {
        p = 0.5 + 0.5 * clamp(window.scrollY / (vh * 0.3));
      }
      hero.style.setProperty('--va-p', p.toFixed(3));
      setWords(hs, p / 0.5);
    } });
  }

  doc.querySelectorAll('[data-va-words]').forEach(function (el) {
    if (pin && pin.contains(el)) return;
    var spans = split(el);
    items.push({ el: el, run: function (vh) { setWords(spans, inView(el, 0.92, 0.5, vh)); } });
  });
  doc.querySelectorAll('[data-va-fade]').forEach(function (el) {
    var k = Number(el.getAttribute('data-va-fade')) || 0;
    items.push({ el: el, run: function (vh) { el.style.setProperty('--va-e', inView(el, 0.95 - k * 0.04, 0.62 - k * 0.04, vh).toFixed(3)); } });
  });
  doc.querySelectorAll('[data-va-rise]').forEach(function (el) {
    var v = el.getAttribute('data-va-rise'), k = Number(v) || 0;
    items.push({ el: el, run: function (vh) { el.style.setProperty('--va-e', inView(el, 1 - k * 0.07, 0.68 - k * 0.07, vh).toFixed(3)); } });
  });

  var visible = new Set(), ticking = false;
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
    schedule();
  }, { rootMargin: '20% 0px 20% 0px' }) : null;
  items.forEach(function (it) { if (io) io.observe(it.el); });

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    items.forEach(function (it) { if (!io || it.always || visible.has(it.el)) it.run(vh); });
  }
  function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  root.classList.add('va-js');
  items.forEach(function (it) { it.run(window.innerHeight); });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
})();
