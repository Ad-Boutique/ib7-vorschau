/* IB-7 Wissensseiten v5 (Entwurf 13.10.2026): kleines Zusatz-Skript, Vanilla JS, defer, nach v10.js.
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

  var start = function () {
    initIngredients();
    doc.querySelectorAll('[data-vw-calc]').forEach(initCalc);
  };
  var done = false, once = function () { if (!done) { done = true; start(); } };
  if (doc.readyState === 'complete') once();
  else { doc.addEventListener('DOMContentLoaded', once); window.addEventListener('load', once); }
})();
