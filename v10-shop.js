/* IB-7 Prototyp v10-shop.js (Entwurf 13.10.2026, Builder A, Präfix vs-). Vanilla JS, defer, nach ib7.js und v10.js.
   Set-/Optionswahl: Preis im Button und Preiszeile unter dem Namen folgen der Auswahl (Daten aus ib7.js: window.IB7_P).
   Shopify: Variantenwahl mit Section Rendering API (Preis, Grundpreis, Preis pro Anwendung aus Liquid). */
(function () {
  'use strict';
  var eur = function (n) { return n.toLocaleString('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; };
  var start = function () {
    var btn = document.querySelector('[data-vs-price]'), box = document.querySelector('[data-price-box]'), P = window.IB7_P;
    var radios = document.querySelectorAll('input[name="pick"]');
    if (!btn || !P || radios.length < 2) return;
    var render = function (k) {
      var p = P[k]; if (!p) return;
      btn.textContent = eur(p.price);
      if (!box) return;
      var h = '<b>' + eur(p.price) + '</b> ';
      if (p.compare) h += '<span>statt <s>' + eur(p.compare) + '</s></span> <span class="vs-save">Du sparst ' + eur(p.compare - p.price) + '</span>';
      else h += '<span>' + p.unit + ' · ' + p.perUse + ' pro Anwendung¹</span>';
      box.innerHTML = h;
    };
    radios.forEach(function (r) { r.addEventListener('change', function () { if (r.checked) render(r.value); }); });
  };
  var done = false, once = function () { if (!done) { done = true; start(); } };
  if (document.readyState === 'complete') once();
  else { document.addEventListener('DOMContentLoaded', once); window.addEventListener('load', once); }
})();
