/* IB-7 Prototyp v10: gemeinsames Verhalten aller v5-Seiten und index-v10 (Entwurf 13.10.2026). Vanilla JS, defer, nach ib7.js.
   Basis v9.js (umbenannt), neu in Runde 4: 14 Ritual-Explorer, 15 Mengen-Stepper.
   1 Links auf die neuen Dateien umschreiben (auch in Header, Footer, Menü, Warenkorb von ib7.js)
   2 Entwurfs-Notizen [data-notes]
   3 Einmaliges Einblenden [data-reveal] -> .is-in
   4 Inhaltsstoff-Spotlight [data-spot] (Klick, Tipp, Pfeiltasten)
   5 Produktgalerie [data-gallery] (Thumbnails, Punkte, Wischen)
   6 Laufband [data-marquee] (Pause-Knopf, Pause außerhalb des Sichtbereichs)
   7 Demo-Formulare [data-demo-form] ohne Versand
   8 Filter-Chips [data-v10-filter] / [data-v10-cat], ausgeblendete Spotlight-Auswahl wird zurückgesetzt
   9 Kaufleiste .v10-buybar weicht Footer, Formularen, fokussierten Eingabefeldern und gepinnten Szenen aus (.is-off)
  10 Inhaltsstoff-Vollbild-Szene [data-ingr] (Modus scroll: gepinnt, je Wirkstoff ein Bildschirm; Modus tap: Klick/Pfeiltasten)
  11 Wort-Reihe [data-words] leuchtet beim Durchscrollen Wort für Wort auf
  12 Ansichts-Fortschritt [data-v10-progress] schreibt --v10-p (0 bis 1), z. B. sanfter Zoom im Vollbild
  13 Bildzähler der Galerie [data-gallery-count] ("1 / 5")
  14 Ritual-Explorer [data-rx]: Rolle wählen (Tabs, Pfeiltasten), Morgens/Abends, Detail, Reihenfolge
     (Runde 5: Tageszeit folgt der Auswahl, Karte wird nach dem Tippen ins Bild geholt)
  15 Mengen-Stepper [data-qty] (minus/plus, 1 bis 9)
  16 Header und Footer im POUCH-Stil (html.v10-chrome, nur mit main.v10)
   Shopify: je Funktion ein kleiner Web Component, kein Framework. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('v10-js'); /* [data-reveal] nur unterhalb des ersten Bildschirms einsetzen, dann blitzt nichts */

  /* ---------- 0 Seitenwechsel landet oben (Wunsch Daniel 13.10.) ----------
     Browser und Artefakt-Vorschau sollen keine alte Scroll-Position wiederherstellen. Nur ein Anker (#...) springt gezielt. */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (err) { /* egal */ }
  var touched = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (t) { window.addEventListener(t, function () { touched = true; }, { passive: true, once: true }); });
  var toTop = function () { if (touched || location.hash) return; window.scrollTo(0, 0); if (doc.scrollingElement) doc.scrollingElement.scrollTop = 0; };
  toTop();
  window.addEventListener('pageshow', function (e) { if (e.persisted) touched = false; toTop(); });

  /* ---------- 1 Links ---------- */
  var MAP = {
    'shop.html': 'shop-v5.html', 'perfect-duo.html': 'perfect-duo-v6.html', 'the-pulse.html': 'the-pulse-v5.html',
    'the-aura.html': 'the-aura-v5.html', 'vergleich.html': 'vergleich-v5.html', 'ritual.html': 'ritual-v7.html',
    'the-mind.html': 'the-mind-v6.html', 'inhaltsstoffe.html': 'inhaltsstoffe-v5.html', 'geprueft.html': 'geprueft-v5.html',
    'ueber-uns.html': 'ueber-uns-v8.html', 'bewertungen.html': 'bewertungen-v5.html', 'hilfe.html': 'hilfe-v6.html',
    'ritual-check.html': 'ritual-check-v5.html', 'index.html': 'index-v13.html', './': 'index-v13.html', '.': 'index-v13.html', 'index-v8.html': 'index-v13.html', 'index-v9.html': 'index-v13.html', '': null
  };
  ['shop', 'perfect-duo', 'the-pulse', 'the-aura', 'vergleich', 'ritual', 'the-mind', 'inhaltsstoffe', 'geprueft', 'ueber-uns', 'bewertungen', 'hilfe', 'ritual-check'].forEach(function (n) { MAP[n + '-v3.html'] = n + '-v5.html'; MAP[n + '-v4.html'] = n + '-v5.html'; });
  /* Neuere Einzelseiten (z. B. index-v11, ueber-uns-v6) setzen am html-Element data-v10-links='{"alt.html":"neu.html"}'.
     Ohne das Attribut bleibt jede bestehende v10/v5-Seite unverändert. */
  /* Stand 13.10.2026: aktuelle Versionen sind Startseite v13, Über uns v8, Ritual v7, Perfect Duo v6, THE MIND v6 und Hilfe v6; alle übrigen v5-Seiten verlinken dorthin */
  var OVR = { 'index-v13.html': 'index-v13.html', 'index-v13.html': 'index-v13.html', 'index-v13.html': 'index-v13.html', 'ueber-uns-v8.html': 'ueber-uns-v8.html', 'ueber-uns-v8.html': 'ueber-uns-v8.html', 'ueber-uns-v8.html': 'ueber-uns-v8.html', 'ritual-v7.html': 'ritual-v7.html', 'the-mind-v6.html': 'the-mind-v6.html', 'hilfe-v6.html': 'hilfe-v6.html', 'ritual-v7.html': 'ritual-v7.html', 'perfect-duo-v6.html': 'perfect-duo-v6.html' };
  try { var own = JSON.parse(root.getAttribute('data-v10-links') || '{}') || {}; for (var k in own) OVR[k] = own[k]; } catch (err) { /* Standard behalten */ }
  var rewrite = function (a) {
    var href = a.getAttribute('href');
    if (href === null || /^(https?:|mailto:|tel:|#)/.test(href)) return;
    var hash = '', q = href.indexOf('#');
    if (q > -1) { hash = href.slice(q); href = href.slice(0, q); }
    var to = MAP[href];
    for (var n = 0; n < 6 && OVR[to || href] && OVR[to || href] !== (to || href); n++) to = OVR[to || href]; /* Kette, z. B. ritual-v5 > v6 > v7 */
    if (to) a.setAttribute('href', to + hash);
  };
  var rewriteAll = function (scope) { (scope || doc).querySelectorAll('a[href]').forEach(rewrite); };
  /* auch für später gerenderte Teile (Warenkorb), direkt beim Klick */
  doc.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href]'); if (a) rewrite(a); }, true);

  /* ---------- 2 Notizen ---------- */
  var KEY = 'ib7-v10-notes';
  var setNotes = function (on) {
    root.classList.toggle('v10-notes-on', on);
    doc.querySelectorAll('[data-notes]').forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (err) { /* Speicher gesperrt: egal */ }
  };

  /* ---------- 4 Spotlight ---------- */
  var initSpot = function (el) {
    var tabs = Array.prototype.slice.call(el.querySelectorAll('[data-spot-tab]'));
    var panels = el.querySelectorAll('[data-spot-panel]'), imgs = el.querySelectorAll('[data-spot-img]');
    if (!tabs.length) return;
    var list = el.querySelector('.v10-spot__list');
    if (list) { list.setAttribute('role', 'tablist'); list.setAttribute('aria-orientation', 'vertical'); }
    var uid = 'spot' + Math.random().toString(36).slice(2, 7);
    tabs.forEach(function (t, k) {
      var pn = panels[k];
      t.setAttribute('role', 'tab'); t.id = t.id || uid + '-t' + k;
      if (pn) { pn.setAttribute('role', 'tabpanel'); pn.id = pn.id || uid + '-p' + k; pn.setAttribute('aria-labelledby', t.id); t.setAttribute('aria-controls', pn.id); }
      if (t.parentElement && t.parentElement.tagName === 'LI') t.parentElement.setAttribute('role', 'presentation');
    });
    var select = function (k, focus) {
      tabs.forEach(function (t, j) { var on = j === k; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
      panels.forEach(function (pn, j) { pn.hidden = j !== k; });
      imgs.forEach(function (im) { im.classList.toggle('is-on', Number(im.getAttribute('data-spot-img')) === k); });
      if (focus) tabs[k].focus();
    };
    var start = Math.max(0, tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; }));
    select(start, false);
    el.classList.add('is-ready');
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { select(k, false); });
      t.addEventListener('keydown', function (e) {
        /* Pfeiltasten springen nur über sichtbare Einträge (Filter blendet per hidden aus) */
        var vis = tabs.filter(function (x) { return !x.closest('[hidden]'); }), n = vis.length, cur = vis.indexOf(t), to = null;
        if (!n || cur < 0) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') to = vis[(cur + 1) % n];
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') to = vis[(cur - 1 + n) % n];
        else if (e.key === 'Home') to = vis[0]; else if (e.key === 'End') to = vis[n - 1];
        if (to) { e.preventDefault(); select(tabs.indexOf(to), true); }
      });
    });
  };

  /* ---------- 5 Galerie ---------- */
  var initGallery = function (g) {
    var track = g.querySelector('[data-gallery-track]');
    if (!track) return;
    var slides = track.children, marks = g.querySelectorAll('[data-gallery-go]');
    var count = g.querySelector('[data-gallery-count]');
    var mark = function (i) {
      marks.forEach(function (m) { m.setAttribute('aria-current', Number(m.getAttribute('data-gallery-go')) === i ? 'true' : 'false'); });
      if (count) count.textContent = (i + 1) + ' / ' + slides.length;
    };
    marks.forEach(function (m) {
      m.addEventListener('click', function () {
        var i = Number(m.getAttribute('data-gallery-go')), s = slides[i];
        if (s) track.scrollTo({ left: s.offsetLeft - track.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
        mark(i);
      });
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting && x.intersectionRatio > 0.6) mark(Array.prototype.indexOf.call(slides, x.target)); });
      }, { root: track, threshold: [0.6] });
      Array.prototype.forEach.call(slides, function (s) { io.observe(s); });
    }
    track.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      track.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    });
  };

  /* ---------- 6 Laufband ---------- */
  var initMarquee = function (m) {
    var btn = m.querySelector('[data-marquee-toggle]'), user = false;
    if (btn) btn.addEventListener('click', function () {
      user = !m.classList.contains('is-paused');
      m.classList.toggle('is-paused', user);
      btn.setAttribute('aria-pressed', user ? 'true' : 'false');
      btn.setAttribute('aria-label', user ? 'Laufband abspielen' : 'Laufband anhalten');
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) {
      if (!user) m.classList.toggle('is-paused', !en[0].isIntersecting);
    }).observe(m);
  };

  /* ---------- 7 Demo-Formulare ---------- */
  var initForm = function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = f.querySelector('[data-demo-msg]'), inp = f.querySelector('input[type="email"]');
      if (inp && (!inp.value || !inp.checkValidity())) { if (msg) msg.textContent = 'Bitte gib eine gültige E-Mail-Adresse ein.'; inp.focus(); return; }
      if (msg) msg.textContent = f.getAttribute('data-demo-form') || 'Danke. Im Shop sendet Shopify die Bestätigung (Entwurf, nichts wurde versendet).';
      f.reset();
    });
  };

  /* ---------- 8 Filter ---------- */
  var initFilter = function (group) {
    var btns = group.querySelectorAll('[data-v10-filter]'), scope = doc.querySelector(group.getAttribute('data-v10-filters') || 'main');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-v10-filter');
        btns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        scope.querySelectorAll('[data-v10-cat]').forEach(function (item) {
          var cats = ' ' + item.getAttribute('data-v10-cat') + ' ';
          item.hidden = !(v === 'all' || cats.indexOf(' ' + v + ' ') > -1);
        });
        /* ausgeblendete Auswahl im Spotlight zurücksetzen: erster sichtbarer Eintrag wird gewählt */
        scope.querySelectorAll('[data-spot-tab][aria-selected="true"]').forEach(function (sel) {
          if (!sel.closest('[hidden]')) return;
          var spot = sel.closest('[data-spot]') || scope, first = null;
          spot.querySelectorAll('[data-spot-tab]').forEach(function (x) { if (!first && !x.closest('[hidden]')) first = x; });
          if (first) first.click();
        });
      });
    });
  };

  /* ---------- 9 Kaufleiste ausweichen ---------- */
  var initBuybar = function (bar) {
    if (!('IntersectionObserver' in window)) return;
    var zones = doc.querySelectorAll('footer, main form'), seen = new Map(), focus = false;
    var update = function () {
      var hit = false;
      seen.forEach(function (v) { if (v) hit = true; });
      bar.classList.toggle('is-off', hit || focus);
    };
    /* zählt erst, wenn die Zone über das untere Fünftel des Bildschirms ragt */
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { seen.set(x.target, x.isIntersecting); });
      update();
    }, { rootMargin: '0px 0px -20% 0px' });
    zones.forEach(function (z) { io.observe(z); });
    /* Runde 5: während eine Szene gepinnt ist (.is-live), weicht die Leiste ebenfalls, damit der Fuß der Bühne
       ("168 Anwendungen", Rechenbasis, Belege-Link) am kleinen Handy frei bleibt. Zone = mittleres Fünftel. */
    var io2 = new IntersectionObserver(function (en) {
      en.forEach(function (x) { seen.set(x.target, x.isIntersecting && x.target.classList.contains('is-live')); });
      update();
    }, { rootMargin: '-40% 0px -40% 0px' });
    doc.querySelectorAll('[data-scene], [data-ingr]').forEach(function (z) { io2.observe(z); });
    var isField = function (t) { return t && t.matches && t.matches('input:not([type="radio"]):not([type="checkbox"]):not([type="range"]), select, textarea'); };
    doc.addEventListener('focusin', function (e) { if (isField(e.target)) { focus = true; update(); } });
    doc.addEventListener('focusout', function (e) { if (isField(e.target)) { focus = false; update(); } });
    /* Absicherung zu ib7.js: springt der Hauptbutton bei schnellem Wischen in einem Frame von unten nach oben,
       meldet der IntersectionObserver nichts. Ein passiver Scroll-Listener prüft die Lage zusätzlich. */
    var atc = doc.querySelector('[data-main-atc]'), queued = false;
    if (atc) addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; bar.classList.toggle('is-visible', atc.getBoundingClientRect().bottom < 0); });
    }, { passive: true });
  };


  /* ---------- 10 Inhaltsstoff-Vollbild-Szene ---------- */
  var scrollScenes = [];
  var initIngr = function (el) {
    var items = Array.prototype.slice.call(el.querySelectorAll('.v10-ingr__item'));
    var shots = el.querySelectorAll('[data-ingr-shot]');
    if (!items.length) return;
    var mode = el.getAttribute('data-ingr') === 'tap' ? 'tap' : 'scroll';
    if (mode === 'scroll' && reduce) return;               /* ruhiger Endzustand: Liste mit allen Texten */
    el.style.setProperty('--n', items.length);
    el.classList.add('is-live');
    var cur = -1;
    var set = function (i) {
      if (i === cur) return;
      cur = i;
      items.forEach(function (it, k) {
        it.classList.toggle('is-active', k === i);
        var b = it.querySelector('.v10-ingr__name');
        if (b) b.setAttribute('aria-pressed', k === i ? 'true' : 'false');
      });
      shots.forEach(function (s) { s.classList.toggle('is-on', Number(s.getAttribute('data-ingr-shot')) === i); });
    };
    set(0);
    items.forEach(function (it, k) {
      var b = it.querySelector('.v10-ingr__name');
      if (!b) return;
      b.addEventListener('click', function () {
        if (mode === 'tap') { set(k); return; }
        /* Modus scroll: zum Abschnitt des Wirkstoffs springen */
        var r = el.getBoundingClientRect(), span = el.offsetHeight - window.innerHeight;
        window.scrollTo({ top: window.scrollY + r.top + span * (k + 0.5) / items.length, behavior: reduce ? 'auto' : 'smooth' });
        set(k);
      });
      b.addEventListener('keydown', function (e) {
        var to = null, n = items.length;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') to = (k + 1) % n;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') to = (k - 1 + n) % n;
        if (to === null) return;
        e.preventDefault();
        var nb = items[to].querySelector('.v10-ingr__name');
        if (nb) { nb.focus(); nb.click(); }
      });
    });
    if (mode === 'scroll') scrollScenes.push({ el: el, n: items.length, set: set });
  };

  /* ---------- 11 Wort-Reihe ---------- */
  var wordRows = [];
  var initWords = function (el) {
    var words = el.querySelectorAll('.v10-words__row li');
    if (!words.length || reduce) return;
    el.classList.add('is-live');
    wordRows.push({ el: el, words: words });
  };

  /* ---------- 12 Ansichts-Fortschritt ---------- */
  var progEls = [];

  /* ein passiver Scroll-Listener für 10 bis 12 */
  var raf = 0;
  var tick = function () {
    raf = 0;
    var vh = window.innerHeight;
    scrollScenes.forEach(function (sc) {
      var r = sc.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = Math.min(0.9999, Math.max(0, -r.top / Math.max(1, r.height - vh)));
      sc.set(Math.floor(p * sc.n));
    });
    wordRows.forEach(function (w) {
      var r = w.el.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.55)));
      var on = Math.round(p * w.words.length);
      w.words.forEach(function (li, k) { li.classList.toggle('is-on', k < on); });
    });
    progEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      el.style.setProperty('--v10-p', Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))).toFixed(3));
    });
  };
  var request = function () { if (!raf) raf = requestAnimationFrame(tick); };


  /* ---------- 14 Ritual-Explorer ---------- */
  var initRx = function (el) {
    var picks = Array.prototype.slice.call(el.querySelectorAll('[data-rx-pick]'));
    var panels = el.querySelectorAll('[data-rx-panel]');
    var times = el.querySelectorAll('[data-rx-time]');
    var flows = el.querySelectorAll('[data-rx-flow]');
    if (!picks.length) return;
    var list = el.querySelector('.v10-rx__picks');
    if (list) { list.setAttribute('role', 'tablist'); list.setAttribute('aria-label', 'Rollen des Rituals'); }
    picks.forEach(function (b) {
      var k = b.getAttribute('data-rx-pick'), pn = el.querySelector('[data-rx-panel="' + k + '"]');
      b.setAttribute('role', 'tab'); b.id = b.id || 'rx-t' + k;
      if (b.parentElement) b.parentElement.setAttribute('role', 'presentation');
      if (pn) { pn.setAttribute('role', 'tabpanel'); pn.id = pn.id || 'rx-p' + k; pn.setAttribute('aria-labelledby', b.id); b.setAttribute('aria-controls', pn.id); }
    });
    var time = 'am', cur = null;
    var whenOf = function (b) { return ' ' + (b.getAttribute('data-rx-when') || 'am pm') + ' '; };
    var has = function (b, t) { return whenOf(b).indexOf(' ' + t + ' ') > -1; };
    var pickOf = function (k) { return picks.filter(function (b) { return b.getAttribute('data-rx-pick') === k; })[0]; };
    var paint = function () {
      times.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-rx-time') === time ? 'true' : 'false'); });
      flows.forEach(function (f) { f.hidden = f.getAttribute('data-rx-flow') !== time; });
      /* Rollen, die zu dieser Tageszeit nicht dran sind, werden gedimmt (bleiben wählbar) */
      picks.forEach(function (b) { b.classList.toggle('is-off', !has(b, time)); });
    };
    /* Runde 5: Auswahl und Tageszeit widersprechen sich nie. Wer bei "Morgens" 03 (nur abends) antippt,
       landet bei "Abends"; wer auf "Morgens" schaltet, während 03 gewählt ist, bekommt die Rolle davor (02). */
    var select = function (k, focus) {
      var pb = pickOf(k);
      if (!pb) return;
      cur = k;
      if (!has(pb, time)) { var other = time === 'am' ? 'pm' : 'am'; if (has(pb, other)) { time = other; paint(); } }
      picks.forEach(function (b) { var on = b === pb; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-rx-panel') !== k; });
      el.querySelectorAll('[data-rx-step]').forEach(function (s) { s.classList.toggle('is-now', s.getAttribute('data-rx-step') === k); });
    };
    var setTime = function (t) {
      time = t; paint();
      var pb = cur && pickOf(cur);
      if (pb && !has(pb, t)) {
        var i = picks.indexOf(pb), alt = null;
        for (var d = 1; d < picks.length && !alt; d++) { if (i - d >= 0 && has(picks[i - d], t)) alt = picks[i - d]; else if (i + d < picks.length && has(picks[i + d], t)) alt = picks[i + d]; }
        if (alt) select(alt.getAttribute('data-rx-pick'), false);
      }
    };
    /* Antwort in den Blick holen: am Handy steht die Karte direkt unter den Kacheln, nach dem Tippen nur so weit
       scrollen, bis sie ganz sichtbar ist (scroll-margin hält Header und Kaufleiste frei). */
    var reveal = function () {
      var pn = el.querySelector('[data-rx-panel]:not([hidden])');
      if (!pn || !pn.scrollIntoView) return;
      var r = pn.getBoundingClientRect();
      if (r.top >= 0 && r.bottom <= window.innerHeight) return;
      pn.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    };
    var start = picks.filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0] || picks[0];
    paint();
    select(start.getAttribute('data-rx-pick'), false);
    el.classList.add('is-ready');
    picks.forEach(function (b, i) {
      b.addEventListener('click', function () { select(b.getAttribute('data-rx-pick'), false); reveal(); });
      b.addEventListener('keydown', function (e) {
        var n = picks.length, to = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (i - 1 + n) % n;
        else if (e.key === 'Home') to = 0; else if (e.key === 'End') to = n - 1;
        if (to !== null) { e.preventDefault(); select(picks[to].getAttribute('data-rx-pick'), true); }
      });
    });
    times.forEach(function (b) { b.addEventListener('click', function () { setTime(b.getAttribute('data-rx-time')); }); });
    /* Ablaufkette ist eine reine Anzeige (Runde 5): nicht fokussierbar, für Screenreader als Liste lesbar */
    flows.forEach(function (f) { f.setAttribute('aria-label', 'Reihenfolge ' + (f.getAttribute('data-rx-flow') === 'pm' ? 'abends' : 'morgens')); });
    el.querySelectorAll('[data-rx-go]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); select(a.getAttribute('data-rx-go'), true); }); });
  };

  /* ---------- 15 Mengen-Stepper ---------- */
  var initQty = function (q) {
    var inp = q.querySelector('input'), dec = q.querySelector('[data-qty-dec]'), inc = q.querySelector('[data-qty-inc]');
    if (!inp) return;
    var set = function (v) { v = Math.max(1, Math.min(9, v || 1)); inp.value = v; if (dec) dec.disabled = v <= 1; if (inc) inc.disabled = v >= 9; };
    if (dec) dec.addEventListener('click', function () { set(Number(inp.value) - 1); });
    if (inc) inc.addEventListener('click', function () { set(Number(inp.value) + 1); });
    inp.addEventListener('change', function () { set(Number(inp.value)); });
    set(Number(inp.value));
  };


  /* ---------- 16 Header und Footer im POUCH-Stil (nur Seiten mit main.v10) ----------
     ib7.js rendert Header, Menü, Warenkorb und Footer im v2-Look. Hier werden nach dem Rendern nur Klassen gesetzt,
     die Hauptnavigation als Pillen neu gefüllt (aktive Seite markiert) und die Footer-Spalten neu beschriftet.
     Drawer, Warenkorb und Newsletter-Formular von ib7.js bleiben dieselben Elemente und funktionieren weiter. */
  var NAV = [['shop-v5.html', 'Shop'], ['ritual-v7.html', 'Ritual'], ['the-mind-v6.html', 'THE MIND'], ['ueber-uns-v8.html', 'Über uns'], ['hilfe-v6.html', 'Hilfe']];
  var NAV_OF = {
    'shop-v5.html': 0, 'perfect-duo-v6.html': 0, 'the-pulse-v5.html': 0, 'the-aura-v5.html': 0,
    'ritual-v7.html': 1, 'vergleich-v5.html': 1, 'ritual-check-v5.html': 1,
    'the-mind-v6.html': 2, 'inhaltsstoffe-v5.html': 2, 'geprueft-v5.html': 2,
    'ueber-uns-v8.html': 3, 'bewertungen-v5.html': 3, 'hilfe-v6.html': 4
  };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var initChrome = function () {
    if (!doc.querySelector('main.v10')) return;
    root.classList.add('v10-chrome');
    var here = (location.pathname.split('/').pop() || '').toLowerCase(), act = NAV_OF.hasOwnProperty(here) ? NAV_OF[here] : -1;
    var nav = doc.querySelector('.header__nav');
    if (nav) {
      nav.classList.add('v10-pillnav');
      nav.innerHTML = NAV.map(function (n, k) { return '<a class="nav-link" href="' + n[0] + '"' + (k === act ? ' aria-current="page"' : '') + '>' + esc(n[1]) + '</a>'; }).join('');
    }
    var right = doc.querySelector('.header__right');
    if (right) {
      var help = right.querySelector('.header__text-link'); if (help) help.remove();
      right.insertAdjacentHTML('afterbegin', '<a class="header__text-link v10-hlink" href="shop-v5.html">Suche</a><a class="header__text-link v10-hlink" href="#konto">Konto</a>');
      var burger = doc.querySelector('.header__burger'); if (burger) right.appendChild(burger);   /* Handy: Menü rechts neben dem Warenkorb */
    }
    var logo = doc.querySelector('.header__logo'); if (logo) logo.setAttribute('href', 'index-v13.html');
    var foot = doc.querySelector('.footer');
    if (foot) {
      foot.classList.add('v10-footer');
      var cols = foot.querySelector('.footer__cols');
      var C = [
        ['01', 'Shop', [['perfect-duo-v6.html', 'Das Perfect Duo'], ['the-pulse-v5.html', 'THE PULSE'], ['the-aura-v5.html', 'THE AURA'], ['shop-v5.html', 'Alle Produkte'], ['ritual-check-v5.html', 'Ritual-Check']]],
        ['02', 'Wissen', [['ritual-v7.html', 'Das Ritual'], ['the-mind-v6.html', 'THE MIND'], ['inhaltsstoffe-v5.html', 'Inhaltsstoffe'], ['geprueft-v5.html', 'Geprüft'], ['vergleich-v5.html', 'Ritual oder Cocktail?']]],
        ['03', 'Hilfe', [['hilfe-v6.html#faq', 'Häufige Fragen'], ['hilfe-v6.html#versand', 'Versand und Rückgabe'], ['hilfe-v6.html#kontakt', 'Kontakt'], ['bewertungen-v5.html', 'Bewertungen'], ['ueber-uns-v8.html', 'Über uns']]],
        ['04', 'Rechtliches', [['#', 'Impressum'], ['#', 'Datenschutz'], ['#', 'AGB'], ['#', 'Widerrufsbelehrung'], ['#', 'Cookie-Einstellungen']]]
      ];
      if (cols) cols.innerHTML = C.map(function (c) { return '<div class="footer__col"><h4><b>' + c[0] + '</b> / ' + esc(c[1]) + '</h4><ul>' + c[2].map(function (l) { return '<li><a href="' + l[0] + '">' + esc(l[1]) + '</a></li>'; }).join('') + '</ul></div>'; }).join('');
      var lbl = foot.querySelector('label[for="footer-email"]'); if (lbl) lbl.classList.add('v10-footer__nl');
    }
  };

  var start = function () {
    initChrome();
    rewriteAll();
    var stored = false;
    try { stored = localStorage.getItem(KEY) === '1'; } catch (err) { stored = false; }
    if (stored) setNotes(true);
    doc.querySelectorAll('[data-notes]').forEach(function (b) { b.addEventListener('click', function () { setNotes(!root.classList.contains('v10-notes-on')); }); });
    /* Mobile-Review 2: Notizen-Knopf in den Header, damit er weder Text noch Kaufleiste verdeckt */
    var hdrRight = doc.querySelector('.header__right');
    if (hdrRight) doc.querySelectorAll('.v10-notes-btn').forEach(function (b) { b.classList.add('v10-notes-btn--header'); hdrRight.insertBefore(b, hdrRight.firstChild); });

    var rev = doc.querySelectorAll('[data-reveal]');
    if (!reduce && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
      }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
      rev.forEach(function (el) { io.observe(el); });
    } else rev.forEach(function (el) { el.classList.add('is-in'); });

    doc.querySelectorAll('[data-spot]').forEach(initSpot);
    doc.querySelectorAll('[data-gallery]').forEach(initGallery);
    doc.querySelectorAll('[data-marquee]').forEach(initMarquee);
    doc.querySelectorAll('[data-demo-form]').forEach(initForm);
    doc.querySelectorAll('[data-v10-filters]').forEach(initFilter);
    doc.querySelectorAll('.sticky-buy.v10-buybar').forEach(initBuybar);
    if (!reduce) root.classList.add('v10-motion');
    doc.querySelectorAll('[data-ingr]').forEach(initIngr);
    doc.querySelectorAll('[data-rx]').forEach(initRx);
    doc.querySelectorAll('[data-qty]').forEach(initQty);
    doc.querySelectorAll('[data-words]').forEach(initWords);
    if (!reduce) progEls = Array.prototype.slice.call(doc.querySelectorAll('[data-v10-progress]'));
    if (scrollScenes.length || wordRows.length || progEls.length) {
      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('resize', request, { passive: true });
      request();
    }
  };
  /* ib7.js rendert Header, Footer und Warenkorb in seinem DOMContentLoaded-Handler, der vorher registriert wurde */
  /* Bei defer ist readyState schon "interactive", DOMContentLoaded kommt aber noch: darauf warten. */
  var done = false, once = function () { if (!done) { done = true; start(); } };
  if (doc.readyState === 'complete') once();
  else { doc.addEventListener('DOMContentLoaded', once); window.addEventListener('load', once); }
})();
