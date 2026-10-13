/* IB-7 Prototyp: Marke und Einstieg, System v10 (Builder C, Runde 3). Vanilla JS, defer, nach v10.js. Nur für die Seiten
   index-v10, ueber-uns-v5, bewertungen-v5, hilfe-v5, ritual-check-v5.
   1 Hero-Video bei reduzierter Bewegung anhalten
   2 FAQ-Navigation (Hilfe): aktuelle Gruppe per aria-current
   3 Ritual-Check: Quiz mit einer Frage pro Screen, Ergebnis als Optimum-Einordnung (keine Diagnose)
   Shopify-Abbildung: ein Web Component <ib7-ritual-check> in einer Section, Ergebnislogik als reine Funktion,
   E-Mail über {% form 'customer' %} mit contact[tags]. Alle Texte stehen hier fest im Code, es gibt keine
   Nutzereingaben, die in HTML geschrieben werden (nur der Text der festen Antworten). */
(function () {
  'use strict';
  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1 Hero-Video ---------- */
  var heroVideo = function () {
    if (!reduce) return;
    doc.querySelectorAll('.hero__media video').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
  };

  /* ---------- 2 FAQ-Navigation (Hilfe) ---------- */
  var navSpy = function () {
    var links = Array.prototype.slice.call(doc.querySelectorAll('.v10-faqnav a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (c) { var t = doc.getElementById(c.getAttribute('href').slice(1)); if (t) map[t.id] = c; });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        var id = x.target.id;
        if (!x.isIntersecting) { if (map[id]) map[id].removeAttribute('aria-current'); return; }
        links.forEach(function (c) { c.removeAttribute('aria-current'); });
        if (map[id]) map[id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-25% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(doc.getElementById(id)); });
  };

  /* ---------- 3 Ritual-Check ---------- */
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';
  var ARR = '<span class="v10-arr" aria-hidden="true"></span>';

  /* Fragen nach 06: eine pro Screen, 5 Fragen, danach Ergebnis, E-Mail optional */
  var Q = [
    { q: 'Wie viele Produkte nutzt du morgens und abends zusammen?', a: ['1 bis 2', '3 bis 4', '5 oder mehr'] },
    { q: 'Von wie vielen Marken stammen sie?', a: ['Von einer Marke', 'Von 2 bis 3 Marken', 'Von 4 oder mehr Marken'] },
    { q: 'Was ist dir am wichtigsten?', a: ['Feuchtigkeit', 'Glätte und Hautbild', 'Barriere und Ruhe', 'Ausstrahlung', 'Alles in Balance'] },
    { q: 'Kennst du das?', a: ['Pilling', 'Spannen', 'Haut wirkt gereizt', 'Nichts davon'] },
    { q: 'Wie viel Zeit willst du in deine Routine investieren?', a: ['Etwa 2 Minuten', 'Etwa 5 Minuten', 'Mehr'] }
  ];
  var STATE = {
    under: { text: 'Wahrscheinlich unterdosiert', at: '16%' },
    good: { text: 'Im Optimum', at: '50%' },
    over: { text: 'Wahrscheinlich überdosiert', at: '84%' }
  };

  /* reine Funktion: Antworten rein, Einordnung raus. Keine Diagnose, nur Orientierung (06). */
  var evaluate = function (a) {
    var p = a[0], b = a[1], f = a[2], s = a[3], t = a[4];
    var mix = b >= 1 || p === 2;
    var focus = ['Feuchtigkeit', 'Anti-Aging', 'Barriere', 'Anti-Aging', null][f];
    var cats = [
      { n: 'Feuchtigkeit', st: mix ? 'over' : 'good' },
      { n: 'Anti-Aging', st: p === 0 ? 'under' : (b === 2 ? 'over' : 'good') },
      { n: 'Longevity', st: 'under' },
      { n: 'Barriere', st: (s === 1 || s === 2) ? 'under' : (b === 2 ? 'over' : 'good') },
      { n: 'Schutz', st: p === 0 ? 'under' : 'good' }
    ];
    var tips = [];
    if (b === 2) tips.push('Bei 4 oder mehr Marken ist Hyaluron fast sicher doppelt im Regal.');
    else if (b === 1) tips.push('Bei 2 bis 3 Marken überschneiden sich Wirkstoffe schnell, ohne dass es auffällt.');
    if (p === 2) tips.push('Fünf oder mehr Produkte heißen mehr Schritte, mehr Doppelungen und mehr Lücken zwischen den Formeln.');
    if (s === 0) tips.push('Pilling zeigt häufig, dass Texturen und Wirkstoffe nicht aufeinander abgestimmt sind.');
    if (s === 1) tips.push('Spannen kann ein Hinweis sein, dass Feuchtigkeit nicht gehalten wird. Eine abschließende Creme hilft, sie zu halten.');
    if (s === 2) tips.push('Wenn deine Haut gereizt wirkt, starte langsam und prüfe die INCI. Bei anhaltenden Beschwerden sprich mit einer Ärztin oder einem Arzt.');
    if (t === 0 && tips.length < 3) tips.push('Zwei Pumpstöße, morgens und abends: das passt in deine Zeit.');
    if (!tips.length) tips.push('Deine Basis ist schlank. Genau dort zahlt sich eine abgestimmte Routine aus: nichts doppelt, nichts fehlt.');
    return { mix: mix, focus: focus, cats: cats, tips: tips.slice(0, 3), gentle: s === 2 };
  };

  var initQuiz = function (host) {
    var answers = [], i = 0;
    host.innerHTML = '<div class="vm-progress" role="progressbar" aria-label="Fortschritt" aria-valuemin="0" aria-valuemax="' + Q.length + '" aria-valuenow="0"><i></i></div><div class="vm-stage"></div>';
    var bar = host.querySelector('.vm-progress'), fill = bar.querySelector('i'), stage = host.querySelector('.vm-stage');
    var progress = function (n) { bar.setAttribute('aria-valuenow', String(n)); fill.style.setProperty('--p', String(n / Q.length)); };
    var focusHead = function (el) {
      if (!el) return;
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
      var r = host.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight * 0.5) host.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    };

    var ask = function (n, move) {
      i = n; progress(n);
      var opts = Q[n].a.map(function (label, k) {
        return '<label class="v10-size"><input type="radio" name="vm-q' + n + '" value="' + k + '"' + (answers[n] === k ? ' checked' : '') + '><span class="v10-size__name">' + label + '</span>' + ARROW + '</label>';
      }).join('');
      stage.innerHTML = '<fieldset class="vm-step"><legend><span class="v10-micro">Frage ' + (n + 1) + ' von ' + Q.length + '</span><span class="vm-q" id="vm-q">' + Q[n].q + '</span></legend><div class="vm-opts">' + opts + '</div>' +
        (n ? '<div class="vm-nav"><button class="link vm-linkbtn" type="button" data-back>Zurück</button></div>' : '') + '</fieldset>';
      var go = function () { window.setTimeout(function () { if (n + 1 < Q.length) ask(n + 1, true); else result(true); }, reduce ? 0 : 220); };
      stage.querySelectorAll('label.v10-size').forEach(function (lab) {
        var r = lab.querySelector('input');
        r.addEventListener('change', function () { answers[n] = Number(r.value); });
        /* echter Klick oder Tipp (detail > 0) springt weiter, Pfeiltasten wählen nur, Enter oder Leertaste bestätigen */
        lab.addEventListener('click', function (e) { if (e.detail > 0) { r.checked = true; answers[n] = Number(r.value); go(); } });
        r.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && r.checked) { e.preventDefault(); answers[n] = Number(r.value); go(); } });
      });
      var back = stage.querySelector('[data-back]');
      if (back) back.addEventListener('click', function () { ask(n - 1, true); });
      if (move) focusHead(stage.querySelector('.vm-q'));
    };

    var result = function (move) {
      progress(Q.length);
      var r = evaluate(answers);
      var rows = r.cats.map(function (c) {
        var s = STATE[c.st];
        return '<li class="is-' + c.st + '"><span class="vm-score__word">' + c.n + (r.focus === c.n ? ' <span class="v10-tag v10-tag--mist">Dein Fokus</span>' : '') + '</span><div class="vm-score__side"><span class="vm-score__state">' + s.text + '</span><div class="vm-scale" aria-hidden="true"><i data-at="' + s.at + '"></i></div></div></li>';
      }).join('');
      var tips = r.tips.map(function (t) { return '<li>' + CHECK + '<span>' + t + '</span></li>'; }).join('');
      var head = r.mix ? 'Deine Routine ist ein <em>Cocktail.</em>' : 'Gute Basis. <em>Jetzt abgestimmt.</em>';
      var lead = r.mix ? 'Bei mehreren Produkten und Marken überschneiden sich Wirkstoffe, während andere fehlen. Das ist deine Einordnung, nach deinen Antworten.' : 'Du hast eine schlanke Basis. Das ist deine Einordnung, nach deinen Antworten.';
      stage.innerHTML = '<div class="vm-result">' +
        '<div class="vm-result__head"><span class="v10-label"><b>06</b> / Dein Ritual-Score</span><h2 class="v10-h2" id="vm-res" tabindex="-1">' + head + '</h2><p class="v10-lead">' + lead + '</p></div>' +
        '<div><div class="vm-legend" aria-hidden="true"><span>unterdosiert</span><span>Optimum</span><span>überdosiert</span></div><ul class="vm-score">' + rows + '</ul></div>' +
        '<div class="stack"><h3 class="v10-h3">Was auffällt</h3><ul class="vm-tips" role="list">' + tips + '</ul></div>' +
        '<div class="v10-rx__duo"><img src="assets/v6/duo.webp" alt="" width="495" height="1000"><div><b>Unsere Empfehlung: das Perfect Duo</b><p>179,00 € statt 228,00 €, du sparst 49,00 €. Zwei Pumpstöße, morgens und abends.</p>' +
        (r.gentle ? '<p><a class="inline-link" href="the-pulse-v6.html">Vorsichtig starten? THE PULSE ist duftfrei.</a></p>' : '') + '</div><div class="v10-actions"><a class="btn btn--light" href="perfect-duo-v7.html">Zum Perfect Duo ' + ARR + '</a></div></div>' +
        '<p class="v10-micro vm-disclaimer">Orientierung auf Basis deiner fünf Antworten. Keine Hautdiagnose und keine medizinische Beratung.</p>' +
        '<div class="vm-mailbox"><h3 class="v10-h3">Ergebnis und Tipps per E-Mail (optional)</h3>' +
        '<form novalidate><label class="v10-visually-hidden" for="vm-mail">E-Mail-Adresse</label><input id="vm-mail" type="email" placeholder="E-Mail-Adresse" autocomplete="email">' +
        '<label class="vm-consent"><input id="vm-consent" type="checkbox"><span>Ich möchte das Ergebnis und Tipps von IB-7 per E-Mail erhalten und kann mich jederzeit abmelden. <span class="ph">[PLATZHALTER] Link zur Datenschutzerklärung</span></span></label>' +
        '<div><button class="btn btn--frame" type="submit">Ergebnis senden</button></div><p class="v10-small" data-msg aria-live="polite"></p></form></div>' +
        '<div class="vm-nav"><button class="link vm-linkbtn" type="button" data-restart>Check neu starten</button><button class="link vm-linkbtn" type="button" data-back>Antworten ändern</button></div></div>';
      window.requestAnimationFrame(function () { window.requestAnimationFrame(function () { stage.querySelectorAll('[data-at]').forEach(function (el) { el.style.setProperty('--at', el.getAttribute('data-at')); }); }); });
      stage.querySelector('[data-restart]').addEventListener('click', function () { answers = []; ask(0, true); });
      stage.querySelector('[data-back]').addEventListener('click', function () { ask(Q.length - 1, true); });
      var f = stage.querySelector('form');
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var inp = f.querySelector('#vm-mail'), ok = f.querySelector('#vm-consent'), msg = f.querySelector('[data-msg]');
        if (!inp.value || !inp.checkValidity()) { msg.textContent = 'Bitte gib eine gültige E-Mail-Adresse ein, oder lies dein Ergebnis einfach hier.'; inp.focus(); return; }
        if (!ok.checked) { msg.textContent = 'Bitte bestätige den Erhalt der E-Mails.'; ok.focus(); return; }
        msg.textContent = 'Danke, dein Ergebnis ist unterwegs (Entwurf, nichts wurde versendet).';
        inp.value = ''; ok.checked = false;
      });
      if (move) focusHead(stage.querySelector('#vm-res'));
    };

    ask(0, false);
  };

  /* ---------- 4 Kontaktformular (Hilfe): Demo ohne Versand ---------- */
  var initContact = function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = f.querySelector('[data-msg]'), mail = f.querySelector('input[type="email"]'), body = f.querySelector('textarea');
      if (!mail.value || !mail.checkValidity()) { msg.textContent = 'Bitte gib eine gültige E-Mail-Adresse ein.'; mail.focus(); return; }
      if (!body.value.trim()) { msg.textContent = 'Bitte schreib uns kurz, worum es geht.'; body.focus(); return; }
      msg.textContent = 'Danke, wir melden uns innerhalb von 1 Werktag (Entwurf, nichts wurde versendet).';
      f.reset();
    });
  };

  var start = function () {
    heroVideo();
    navSpy();
    doc.querySelectorAll('[data-vm-quiz]').forEach(initQuiz);
    doc.querySelectorAll('[data-vm-contact]').forEach(initContact);
  };
  var done = false, once = function () { if (!done) { done = true; start(); } };
  if (doc.readyState === 'complete' || doc.readyState === 'interactive') once();
  else doc.addEventListener('DOMContentLoaded', once);
})();
