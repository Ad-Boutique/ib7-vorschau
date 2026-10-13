/* IB-7 Prototyp v2: gemeinsame Teile, Produktseiten-Vorlage und Interaktionen.
   Shopify-Abbildung: header-group, footer-group, cart-drawer, main-product (+ Blocks), Web Components. */
(function () {
  'use strict';

  var eur = function (n) { return n.toLocaleString('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; };
  var FREE_SHIPPING = 100;

  /* ---------- Icons ---------- */
  var ICONS = {
    menu: '<path d="M3 7h18M3 12h18M3 17h12"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>', chevron: '<path d="M6 9l6 6 6-6"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    star: '<path fill="currentColor" stroke="none" d="M12 2.8l2.7 6 6.5.6-4.9 4.3 1.5 6.4L12 16.8 6.2 20.1l1.5-6.4L2.8 9.4l6.5-.6z"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    truck: '<path d="M2 6h12v10H2zM14 10h4l4 3v3h-8z"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
    repeat: '<path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2"/><path d="M20 4v4h-4M4 20v-4h4"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    leaf: '<path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19l7-7"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    swap: '<path d="M8 7l-4 5 4 5M16 7l4 5-4 5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/>',
    austria: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>'
  };
  var I = function (n, c) { return '<svg class="' + (c || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[n] || '') + '</svg>'; };
  var STARS = '<span class="stars" aria-hidden="true">' + I('star') + I('star') + I('star') + I('star') + I('star') + '</span>';
  var phImg = function (label) { return '<div class="ph-img"><span>' + I('image') + 'Bild-Platzhalter<br><strong>' + label + '</strong></span></div>'; };

  /* ---------- Daten (in Shopify: product, variant, Metafelder, Metaobjects) ---------- */
  var ING = [
    { n: 'Reishi', inci: 'Ganoderma Lucidum Extract', o: 'TCM', p: 'pulse', r: 'Aus der chinesischen Medizin überliefert.', img: 'assets/01-reishi.webp' },
    { n: 'Niacinamid', inci: 'Niacinamide', o: 'Moderne Forschung', p: 'both', r: 'Dosiert unterhalb der Schwelle, ab der mehr keinen Zusatznutzen bringt.' },
    { n: 'Ascorbyl Glucosid', inci: 'Ascorbyl Glucoside', o: 'Moderne Forschung', p: 'pulse', r: 'Stabilisiertes Vitamin-C-Derivat, wirksam im hautneutralen pH-Bereich.' },
    { n: 'Ectoin', inci: 'Ectoin', o: 'Biotechnologie', p: 'pulse', r: 'Schutz vor umweltbedingten Belastungen.' },
    { n: 'Hyaluron', inci: 'Sodium Hyaluronate', o: 'Moderne Forschung', p: 'pulse', r: 'Einmal im System, nicht drei Mal.' },
    { n: 'Acetyl Hexapeptide-8', inci: 'Acetyl Hexapeptide-8', o: 'Biotechnologie', p: 'pulse', r: 'Für die Mimikpartien.' },
    { n: 'sh-Oligopeptide-1', inci: 'sh-Oligopeptide-1', o: 'Biotechnologie', p: 'pulse', r: 'Biotechnologisch hergestelltes Signalpeptid.' },
    { n: 'Schisandra', inci: 'Schisandra Sphenanthera Fruit Extract', o: 'TCM', p: 'aura', r: 'Fruchtextrakt aus der chinesischen Medizin.', img: 'assets/02-schisandra.webp' },
    { n: 'Sheabutter', inci: 'Butyrospermum Parkii Butter', o: 'Westafrika', p: 'aura', r: 'Für die Barriere.', img: 'assets/03-shea.webp' },
    { n: 'Squalan', inci: 'Squalane', o: 'Mittelmeer, Olive', p: 'aura', r: 'Pflanzlich, aus Olive. Nährt, ohne zu beschweren.' },
    { n: 'Centella asiatica', inci: 'Centella Asiatica Extract', o: 'Ayurveda', p: 'aura', r: 'Aus Ayurveda und chinesischer Medizin.' },
    { n: 'Jojoba', inci: 'Simmondsia Chinensis Seed Oil', o: 'Sonora', p: 'aura', r: 'Pflanzliches Öl für den seidigen Abschluss.' },
    { n: 'Laminaria', inci: 'Laminaria Ochroleuca Extract', o: 'Atlantikküste', p: 'aura', r: 'Algenextrakt.' }
  ];
  window.IB7_ING = ING;

  var P = {
    duo: {
      id: 'duo', name: 'Das Perfect Duo', url: 'perfect-duo.html', img: 'assets/lineup-duo.webp',
      kicker: '02 + 04 · Serum + Creme · 2 x 50 ml', claim: 'Arbeitet. Schließt ein. Wirkt zusammen.',
      price: 179, compare: 228, unit: '1.790,00 € / 1 l', perUse: '1,07 €', size: '2 x 50 ml',
      lead: 'Die ersten zwei Produkte des Rituals. Was im Serum steckt, wiederholt die Creme nicht.',
      gallery: [['assets/lineup-duo.webp', 'contain', 'THE PULSE und THE AURA im 50-ml-Airless-Dispenser', '2 x 50 ml'], ['assets/06-gel.webp', '', 'Klarer Gel-Tropfen von THE PULSE', 'Serum, duftfrei'], ['assets/07-cream.webp', '', 'Seidige Creme von THE AURA', 'Creme, seidig'], ['assets/model-2.webp', '', 'Pflege wird unter dem Auge aufgetragen', 'Morgens und abends'], ['ph', '', 'Airless-Detail', ''], ['ph', '', 'Größenvergleich 50 ml', '']],
      bullets: ['<strong>Perfekt abgestimmt:</strong> was im Serum steckt, wiederholt die Creme nicht', '<strong>50 ml je Produkt</strong>, wo die Kategorie 30 ml gibt. Reicht rund 12 Wochen', 'Dermatologisch getestet: <strong>Irritationspotenzial 0,00</strong>'],
      chips: ['Niacinamid', 'Signalpeptide', 'Reishi', 'Squalan', 'Sheabutter'],
      ingr: ['Reishi', 'Schisandra', 'Sheabutter', 'Niacinamid', 'Ectoin', 'Squalan'],
      usage: 'Morgens und abends ein Pumpstoß THE PULSE auf die gereinigte Haut, einziehen lassen. Danach ein Pumpstoß THE AURA. Tagsüber Sonnenschutz.',
      inside: '<p><strong>THE PULSE:</strong> Niacinamid, Ascorbyl Glucosid, Ectoin, Hyaluron, Reishi, Acetyl Hexapeptide-8, Signalpeptide. Duftfrei.</p><p><strong>THE AURA:</strong> Squalan, Sheabutter, Centella, Schisandra, Vitamin E, Laminaria, Jojoba, Niacinamid, Peptide. Subtiler Duft.</p>',
      inci: '<p><strong>THE PULSE:</strong> Aqua, Niacinamide, Glycerin, Ascorbyl Glucoside, Sodium Hyaluronate, Ectoin, Ganoderma Lucidum Extract, Acetyl Hexapeptide-8, sh-Oligopeptide-1, … <span class="ph">vollständig folgt</span></p><p><strong>THE AURA:</strong> Aqua, Squalane, Butyrospermum Parkii Butter, Glycerin, Dimethicone, Niacinamide, Centella Asiatica Extract, Schisandra Sphenanthera Fruit Extract, … Parfum <span class="ph">vollständig folgt</span></p>'
    },
    pulse: {
      id: 'pulse', name: 'THE PULSE', url: 'the-pulse.html', img: 'assets/pulse.webp', partner: 'aura',
      kicker: '02 · Refining Serum · 50 ml', claim: 'Glättet. Verfeinert. Schützt.',
      price: 119, unit: '2.380,00 € / 1 l', perUse: '0,71 €', size: '50 ml', role: 'Serum',
      lead: 'Das Serum, das die Arbeit macht. Dünnflüssiges Gel, duftfrei, zieht sofort ein.',
      facts: [['Textur', 'dünnflüssiges Gel'], ['Duft', 'keiner'], ['pH', '5,3 bis 5,4']],
      gallery: [['assets/pulse.webp', 'contain', '02 THE PULSE Refining Serum, 50 ml', '50 ml'], ['assets/06-gel.webp', '', 'Klarer Gel-Tropfen', 'Gel, duftfrei'], ['assets/pulse-box.webp', 'contain', 'THE PULSE mit Faltschachtel', ''], ['assets/model-2.webp', '', 'Pflege wird aufgetragen', 'Morgens und abends'], ['ph', '', 'Anwendung im Bad', '']],
      bullets: ['Für ein <strong>sichtbar glatteres, ebenmäßiger wirkendes</strong> Hautbild', '<strong>Sieben Wirkstoffe</strong>, darunter Reishi und ein biotechnologisches Signalpeptid', 'Dermatologisch getestet: <strong>Irritationspotenzial 0,00</strong>'],
      chips: ['Duftfrei', 'Niacinamid', 'Vitamin C', 'Signalpeptide'],
      ingr: ['Reishi', 'Niacinamid', 'Ascorbyl Glucosid', 'Ectoin', 'Hyaluron', 'Acetyl Hexapeptide-8', 'sh-Oligopeptide-1'],
      usage: 'Morgens und abends ein Pumpstoß auf die gereinigte Haut, sanft verteilen, einziehen lassen. Danach THE AURA. Tagsüber Sonnenschutz.',
      inci: '<p>Aqua, Niacinamide, Glycerin, Ascorbyl Glucoside, Sodium Hyaluronate, Ectoin, Ganoderma Lucidum Extract, Acetyl Hexapeptide-8, sh-Oligopeptide-1, Nicotiana Benthamiana Hexapeptide-40 sh-Polypeptide-76, … <span class="ph">vollständig folgt</span></p>'
    },
    aura: {
      id: 'aura', name: 'THE AURA', url: 'the-aura.html', img: 'assets/aura.webp', partner: 'pulse',
      kicker: '04 · Harmonising Structure Cream · 50 ml', claim: 'Nährt. Balanciert. Verfeinert.',
      price: 109, unit: '2.180,00 € / 1 l', perUse: '0,65 €', size: '50 ml', role: 'Creme',
      lead: 'Die Creme, die einschließt. Zieht sehr schnell ein und hinterlässt weiche Haut.',
      facts: [['Textur', 'Creme, seidig'], ['Duft', 'subtil'], ['pH', '5,3 bis 5,4']],
      honest: 'THE AURA enthält Parfum und Silikone (Dimethicone, Polysilicone-11). Die Silikone sorgen für das schnelle Einziehen und den seidigen Abschluss. Wer beides meiden möchte, greift zu THE PULSE, das Serum ist duftfrei.',
      gallery: [['assets/aura.webp', 'contain', '04 THE AURA Structure Cream, 50 ml', '50 ml'], ['assets/07-cream.webp', '', 'Seidige Creme-Textur', 'Creme, seidig'], ['assets/aura-box.webp', 'contain', 'THE AURA mit Faltschachtel', ''], ['assets/model-2.webp', '', 'Pflege wird aufgetragen', 'Morgens und abends'], ['ph', '', 'Anwendung im Bad', '']],
      bullets: ['<strong>Stärkt die Hautbarriere</strong> und lässt gereizt wirkende Haut beruhigt erscheinen', 'Pflanzliches <strong>Squalan, Sheabutter, Centella, Schisandra</strong>, plus Peptide', 'Dermatologisch getestet: <strong>Irritationspotenzial 0,00</strong>'],
      chips: ['Squalan', 'Sheabutter', 'Centella', 'Peptide'],
      ingr: ['Schisandra', 'Sheabutter', 'Squalan', 'Centella asiatica', 'Jojoba', 'Laminaria', 'Niacinamid'],
      usage: 'Morgens und abends ein Pumpstoß nach THE PULSE, sanft einarbeiten. Tagsüber Sonnenschutz.',
      inci: '<p>Aqua, Squalane, Butyrospermum Parkii Butter, Glycerin, Dimethicone, Niacinamide, Centella Asiatica Extract, Schisandra Sphenanthera Fruit Extract, Laminaria Ochroleuca Extract, Simmondsia Chinensis Seed Oil, Tocopherol, Ethyl Ferulate, Polysilicone-11, Parfum, … <span class="ph">vollständig folgt</span></p>'
    }
  };
  window.IB7_P = P;

  /* ---------- Bausteine, die mehrere Seiten nutzen ---------- */
  var B = {};
  B.reviews = function (title) {
    var card = function (t) { return '<article class="review" role="listitem">' + STARS + '<p class="review__text">' + t + '</p><div class="review__meta"><span class="ph">Vorname I.</span><span class="verified">' + I('check') + 'Verifiziert</span></div></article>'; };
    return '<section class="section" id="bewertungen" aria-labelledby="rv-title"><div class="wrap stack-lg">' +
      '<div class="reviews-head"><div class="stack"><p class="kicker">Bewertungen</p><h2 class="h2" id="rv-title">' + (title || 'Was Kundinnen <em>nach 30 Tagen</em> sagen.') + '</h2></div>' +
      '<div class="score"><span class="score__num"><span class="ph">X,X</span></span>' + STARS + '<span class="small"><span class="ph">N</span> verifizierte Bewertungen bei Trusted Shops</span></div></div>' +
      '<div class="rail" role="list" aria-label="Bewertungen">' + card('Hier erscheint eine echte, verifizierte Bewertung aus Trusted Shops.') + card('Platz für eine Stimme zum Hautgefühl ab der ersten Anwendung.') + card('Platz für eine Stimme zum Ergebnis nach mehreren Wochen.') + card('Platz für eine Stimme zur einfachen Routine.') + '</div>' +
      '<a class="link" href="bewertungen.html">Alle Bewertungen ' + I('arrow') + '</a></div></section>';
  };
  B.guarantee = function (cta) {
    return '<section class="section section--tight"><div class="wrap"><div class="guarantee reveal">' +
      '<div class="seal"><span><b>30</b><small>Tage</small></span></div>' +
      '<div class="stack"><h2 class="h2">30 Tage geöffnet testen.</h2><p class="lead">Überzeugt es dich nicht, schickst du es zurück und bekommst dein Geld zurück. Ohne Begründung.</p></div>' +
      (cta || '<a class="btn btn--light" href="perfect-duo.html">Zum Perfect Duo ' + I('arrow') + '</a>') + '</div></div></section>';
  };
  B.ba = function () {
    return '<div class="ba reveal"><div class="ba__img ba__img--before">' + phImg('Vorher (echte Kundin)') + '</div>' +
      '<div class="ba__img ba__img--after">' + phImg('Nach 8 Wochen') + '</div>' +
      '<span class="ba__lbl ba__lbl--l">Vorher</span><span class="ba__lbl ba__lbl--r">Nach 8 Wochen</span>' +
      '<div class="ba__handle"><span>' + I('swap') + '</span></div><input type="range" min="0" max="100" value="50" aria-label="Vorher und Nachher vergleichen"></div>';
  };
  B.ingCard = function (x) {
    return '<article class="ingr reveal"><div class="ingr__media">' + (x.img ? '<img src="' + x.img + '" alt="' + x.n + ' als Rohstoff" loading="lazy" width="1200" height="896">' : phImg(x.n)) + '</div><div class="ingr__body"><span class="micro">' + x.o + '</span><h3 class="ingr__name">' + x.n + '</h3><p class="ingr__inci">' + x.inci + '</p><p class="small">' + x.r + '</p></div></article>';
  };
  window.IB7_B = B;

  /* ---------- Header, Menü, Warenkorb, Footer ---------- */
  var announce = '<div class="announce" role="region" aria-label="Hinweise"><p class="announce__item is-active">Versand frei ab 100 € nach AT und DE</p><p class="announce__item">30 Tage geöffnet testen, Geld zurück</p><p class="announce__item">Dermatologisch getestet · Irritationspotenzial 0,00</p></div>';

  function header(over, current) {
    var cur = function (k) { return current === k ? ' aria-current="page"' : ''; };
    return announce + '<header class="header' + (over ? ' header--over' : '') + '" data-header><div class="wrap header__bar">' +
      '<button class="icon-btn header__burger" type="button" aria-label="Menü öffnen" aria-controls="menu-drawer" aria-expanded="false" data-open="menu-drawer">' + I('menu') + '</button>' +
      '<nav class="header__nav" aria-label="Hauptnavigation">' +
      '<button class="nav-link" type="button" aria-expanded="false" aria-controls="dd-shop" data-dd="dd-shop">Shop ' + I('chevron') + '</button>' +
      '<button class="nav-link" type="button" aria-expanded="false" aria-controls="dd-ritual" data-dd="dd-ritual">Das Ritual ' + I('chevron') + '</button>' +
      '<a class="nav-link" href="bewertungen.html"' + cur('bewertungen') + '>Bewertungen</a>' +
      '<a class="nav-link" href="ueber-uns.html"' + cur('ueber') + '>Über uns</a></nav>' +
      '<a class="header__logo" href="./" aria-label="IB-7 Startseite"><img class="logo-blue" src="assets/logo-blue.svg" alt="IB-7" width="80" height="30"><img class="logo-white" src="assets/logo-white.svg" alt="IB-7" width="80" height="30"></a>' +
      '<div class="header__right"><a class="header__text-link nav-link" href="hilfe.html">Hilfe</a>' +
      '<button class="icon-btn" type="button" aria-label="Warenkorb öffnen" aria-controls="cart-drawer" data-open="cart-drawer">' + I('bag') + '<span class="cart-count" data-cart-count hidden>0</span></button></div></div>' +
      '<div class="dropdown" id="dd-shop"><div class="wrap mega">' +
      ['duo', 'pulse', 'aura'].map(function (k) { var p = P[k]; return '<a class="mega-card" href="' + p.url + '"><div class="mega-card__img"><img src="' + p.img + '" alt="" loading="lazy"></div><span class="mega-card__name">' + p.name + '</span><span class="mega-card__meta"><span>' + (k === 'duo' ? 'Serum + Creme' : p.role + ', 50 ml') + '</span><span class="num">' + eur(p.price) + '</span></span></a>'; }).join('') +
      '<a class="mega-promo" href="ritual-check.html"><span class="kicker">2 Minuten</span><span class="h3">Ritual-Check</span><span class="small" style="color:var(--on-night-mid)">Passt deine Routine zusammen? Finde heraus, womit du starten solltest.</span><span class="link">Check starten ' + I('arrow') + '</span></a>' +
      '</div><div class="wrap" style="padding-bottom:1.5rem"><a class="link" href="shop.html">Alle Produkte, auch die kommenden ' + I('arrow') + '</a></div></div>' +
      '<div class="dropdown" id="dd-ritual"><div class="wrap dropdown-list">' +
      '<a href="ritual.html"><strong>Das Ritual</strong><span class="small">Fünf Rollen, ein System</span></a>' +
      '<a href="the-mind.html"><strong>THE MIND</strong><span class="small">Wie das Ritual berechnet wurde</span></a>' +
      '<a href="inhaltsstoffe.html"><strong>Inhaltsstoffe</strong><span class="small">Jeder Wirkstoff mit Herkunft</span></a>' +
      '<a href="geprueft.html"><strong>Geprüft</strong><span class="small">Tests und Belege</span></a>' +
      '<a href="vergleich.html"><strong>Ritual oder Cocktail?</strong><span class="small">Der direkte Vergleich</span></a>' +
      '</div></div></header>';
  }

  var menuDrawer = '<div class="drawer drawer--left" id="menu-drawer" aria-hidden="true"><div class="drawer__scrim" data-close></div><div class="drawer__panel" role="dialog" aria-modal="true" aria-label="Menü">' +
    '<div class="drawer__head"><img src="assets/logo-blue.svg" alt="IB-7" style="height:1.35rem;width:auto"><button class="icon-btn" type="button" aria-label="Menü schließen" data-close>' + I('close') + '</button></div>' +
    '<div class="drawer__body"><div><p class="menu-group-title">Shop</p><div class="menu-products">' +
    ['duo', 'pulse', 'aura'].map(function (k) { var p = P[k]; return '<a class="menu-product" href="' + p.url + '"><img src="' + p.img + '" alt="">' + (k === 'duo' ? 'Perfect Duo' : p.name) + '<small class="num">' + eur(p.price) + '</small></a>'; }).join('') +
    '</div></div><div><p class="menu-group-title">Das Ritual</p><ul class="menu-list" role="list">' +
    '<li><a href="ritual.html">Das Ritual <small>5 Rollen</small></a></li><li><a href="the-mind.html">THE MIND <small>Methode</small></a></li><li><a href="inhaltsstoffe.html">Inhaltsstoffe</a></li><li><a href="geprueft.html">Geprüft</a></li><li><a href="vergleich.html">Ritual oder Cocktail?</a></li></ul></div>' +
    '<ul class="menu-list" role="list"><li><a href="bewertungen.html">Bewertungen</a></li><li><a href="ueber-uns.html">Über uns</a></li><li><a href="hilfe.html">Hilfe und Kontakt</a></li></ul>' +
    '<a class="menu-check" href="ritual-check.html" style="text-decoration:none"><span class="kicker">2 Minuten</span><span class="h3">Ritual-Check</span><span class="small" style="color:var(--on-night-mid)">Finde heraus, womit du starten solltest.</span><span class="link">Check starten ' + I('arrow') + '</span></a>' +
    '</div></div></div>';

  var cartDrawer = '<div class="drawer drawer--right" id="cart-drawer" aria-hidden="true"><div class="drawer__scrim" data-close></div><div class="drawer__panel" role="dialog" aria-modal="true" aria-label="Warenkorb">' +
    '<div class="drawer__head"><span class="drawer__title">Warenkorb <span class="num" data-cart-count-text></span></span><button class="icon-btn" type="button" aria-label="Warenkorb schließen" data-close>' + I('close') + '</button></div>' +
    '<div class="drawer__body" data-cart-body></div>' +
    '<div class="cart-foot" data-cart-foot hidden><div class="cart-foot__row"><span>Zwischensumme</span><strong class="num" data-cart-total></strong></div><p class="micro">inkl. MwSt., Versand im Checkout</p>' +
    '<a class="btn btn--block" href="#">Zur Kasse ' + I('arrow') + '</a><p class="micro" style="text-align:center">30 Tage geöffnet testen · sichere Zahlung</p>' +
    '<div class="pay-icons" style="justify-content:center"><span>Klarna</span><span>PayPal</span><span>Apple Pay</span><span>Visa</span><span>Mastercard</span><span>EPS</span></div></div></div></div>';

  var footer = '<footer class="footer"><div class="wrap"><div class="footer__top"><div class="stack-lg" style="gap:2rem">' +
    '<p class="footer__claim">Millenia of Wisdom.<br><em>Visionary Technology.</em></p>' +
    '<form class="stack" data-signup novalidate style="max-width:28rem"><label for="footer-email" style="font-family:var(--font-display);color:#fff">Wenn das Ritual wächst, erfährst du es zuerst.</label>' +
    '<div class="field"><input id="footer-email" type="email" placeholder="Deine E-Mail-Adresse" autocomplete="email" required><button class="btn btn--light" type="submit">Anmelden</button></div>' +
    '<p class="micro" style="color:var(--on-night-mid)" data-signup-msg>Kein Spam. Abmeldung jederzeit.</p></form>' +
    '<div class="footer__social"><a href="#" aria-label="Instagram">' + I('insta') + '</a><a href="#" aria-label="E-Mail">' + I('mail') + '</a></div></div>' +
    '<div class="footer__cols">' +
    '<div class="footer__col"><h4>Shop</h4><ul><li><a href="perfect-duo.html">Das Perfect Duo</a></li><li><a href="the-pulse.html">THE PULSE</a></li><li><a href="the-aura.html">THE AURA</a></li><li><a href="shop.html">Alle Produkte</a></li><li><a href="ritual-check.html">Ritual-Check</a></li></ul></div>' +
    '<div class="footer__col"><h4>Das Ritual</h4><ul><li><a href="ritual.html">Das Ritual</a></li><li><a href="the-mind.html">THE MIND</a></li><li><a href="inhaltsstoffe.html">Inhaltsstoffe</a></li><li><a href="geprueft.html">Geprüft</a></li><li><a href="vergleich.html">Ritual oder Cocktail?</a></li></ul></div>' +
    '<div class="footer__col"><h4>Hilfe</h4><ul><li><a href="hilfe.html#faq">Häufige Fragen</a></li><li><a href="hilfe.html#versand">Versand und Rückgabe</a></li><li><a href="hilfe.html#kontakt">Kontakt</a></li><li><a href="bewertungen.html">Bewertungen</a></li><li><a href="ueber-uns.html">Über uns</a></li></ul></div>' +
    '<div class="footer__col"><h4>Rechtliches</h4><ul><li><a href="#">Impressum</a></li><li><a href="#">Datenschutz</a></li><li><a href="#">AGB</a></li><li><a href="#">Widerrufsbelehrung</a></li><li><a href="#">Cookie-Einstellungen</a></li></ul></div></div></div>' +
    '<div class="footer__bottom"><span>© 2026 IB-7 Beauty Tech GmbH · Entwickelt in Austria · Tierversuchsfrei</span>' +
    '<div class="pay-icons"><span>Klarna</span><span>PayPal</span><span>Apple Pay</span><span>Visa</span><span>Mastercard</span><span>EPS</span></div><div class="pay-icons"><span>Trusted Shops Käuferschutz</span></div></div></div></footer>';

  /* ---------- Produktseite (Vorlage für Duo, PULSE, AURA) ---------- */
  function pdp(k) {
    var p = P[k], isDuo = k === 'duo';
    var gal = p.gallery.map(function (g, i) {
      var inner = g[0] === 'ph' ? phImg(g[2]) : '<img src="' + g[0] + '" alt="' + g[2] + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '>';
      return '<div class="gallery__slide' + (g[1] === 'contain' ? ' gallery__slide--contain' : '') + '">' + inner + (g[3] ? '<span class="gallery__tag">' + g[3] + '</span>' : '') + '</div>';
    }).join('');
    var dots = p.gallery.map(function (g, i) { return '<button type="button" data-dot="' + i + '" aria-label="Bild ' + (i + 1) + '"' + (i ? '' : ' aria-current="true"') + '></button>'; }).join('');
    var thumbs = p.gallery.map(function (g, i) { return '<button type="button" data-thumb="' + i + '" class="' + (g[1] === 'contain' ? 'is-contain' : '') + '" aria-label="Bild ' + (i + 1) + '"' + (i ? '' : ' aria-current="true"') + '>' + (g[0] === 'ph' ? '<span class="ph-thumb" style="display:block"></span>' : '<img src="' + g[0] + '" alt="">') + '</button>'; }).join('');
    var partner = p.partner ? P[p.partner] : null;
    var save = P.pulse.price + P.aura.price - P.duo.price;

    var choice = isDuo ? '<fieldset class="choice"><legend>Wähle dein Set</legend>' +
      '<label class="choice__opt"><input type="radio" name="pick" value="duo" checked><span><strong>Perfect Duo</strong><br><span class="small">THE PULSE + THE AURA</span></span><span class="num"><strong>179,00 €</strong><br><span class="price__was">228,00 €</span></span><span class="choice__flag">Beliebteste Wahl · spare ' + eur(save) + '</span></label>' +
      '<label class="choice__opt"><input type="radio" name="pick" value="pulse"><span><strong>Nur THE PULSE</strong><br><span class="small">Serum</span></span><span class="num">119,00 €</span></label>' +
      '<label class="choice__opt"><input type="radio" name="pick" value="aura"><span><strong>Nur THE AURA</strong><br><span class="small">Creme</span></span><span class="num">109,00 €</span></label></fieldset>' : '';
    var upgrade = partner ? '<a class="upgrade" href="perfect-duo.html"><img src="' + P.duo.img + '" alt=""><span class="stack" style="gap:.25rem"><strong style="font-family:var(--font-display);font-weight:500">Lieber gleich als Perfect Duo?</strong><span class="small">Zusammen mit ' + partner.name + ': 179,00 € statt 228,00 €, du sparst ' + eur(save) + '.</span><span class="link" style="min-height:auto">Zum Perfect Duo ' + I('arrow') + '</span></span></a>' : '';
    var facts = p.facts ? '<ul class="list list--row" role="list">' + p.facts.map(function (f) { return '<li><span class="small">' + f[0] + '</span><strong>' + f[1] + '</strong></li>'; }).join('') + '</ul>' : '';

    var buy = '<div class="buy">' +
      '<div class="stack" style="gap:.5rem"><span class="micro">' + p.kicker + '</span><h1 class="buy__title">' + p.name + '</h1><p class="buy__claim">' + p.claim + '</p>' +
      '<a class="rating" href="#bewertungen">' + STARS + '<span><span class="ph">X,X</span> · <span class="ph">N</span> Bewertungen</span></a></div>' +
      '<div class="price"><span class="price__now" data-dynamic="price">' + eur(p.price) + '</span>' + (p.compare ? '<span class="price__was">Einzeln ' + eur(p.compare) + '</span><span class="price__save">Du sparst ' + eur(p.compare - p.price) + '</span>' : '') +
      '<span class="price__unit" data-dynamic="unit-price">' + p.size + ' · ' + p.unit + ' · inkl. MwSt. · ' + p.perUse + ' pro Anwendung¹</span></div>' +
      '<ul class="bullets" role="list">' + p.bullets.map(function (b) { return '<li>' + I('check') + '<span>' + b + '</span></li>'; }).join('') + '</ul>' +
      '<div class="badges"><span class="chip">' + I('shield') + 'Dermatologisch getestet</span><span class="chip">' + I('flask') + 'Volle INCI</span>' + (k === 'pulse' ? '<span class="chip">' + I('drop') + 'Duftfrei</span>' : '') + '<span class="chip">' + I('austria') + 'Entwickelt in Austria</span></div>' +
      choice +
      '<button class="btn btn--block" type="button" data-add="' + (isDuo ? 'choice' : k) + '" data-main-atc>In den Warenkorb ' + I('arrow') + '</button>' +
      '<div class="express" aria-label="Express-Checkout"><span>Shop Pay</span><span>PayPal</span></div>' +
      '<ul class="promise" role="list"><li>' + I('shield') + '<span><strong>30 Tage geöffnet testen.</strong> Geld zurück ohne Begründung.</span></li><li>' + I('truck') + '<span><strong>Versand frei</strong>, in 1-2 Werktagen bei dir (AT, DE).</span></li><li>' + I('repeat') + '<span><strong>Kein Abo.</strong> Du bestellst nach, wenn du willst.</span></li></ul>' +
      upgrade +
      '<div class="acc"><details open><summary>Anwendung<i></i></summary><div class="acc__body"><p>' + p.usage + '</p>' + facts + '</div></details>' +
      (p.inside ? '<details><summary>Was ist drin<i></i></summary><div class="acc__body">' + p.inside + '</div></details>' : '') +
      '<details><summary>Vollständige Inhaltsstoffe (INCI)<i></i></summary><div class="acc__body small">' + p.inci + '</div></details>' +
      (p.honest ? '<details><summary>Ehrlich gesagt<i></i></summary><div class="acc__body"><p>' + p.honest + '</p></div></details>' : '') +
      '<details><summary>Versand und Rückgabe<i></i></summary><div class="acc__body"><p>Versand in 1-2 Werktagen nach Österreich und Deutschland, kostenlos ab 100 €. 30 Tage geöffnet testen, ohne Angabe von Gründen zurück. Haltbarkeit 6 Monate ab Öffnen.</p></div></details></div>' +
      '<p class="small">Fragen? <a class="inline-link" href="hilfe.html#kontakt">Schreib uns</a>, Antwort in 1 Werktag.</p>' +
      '<p class="micro">¹ Rechenbasis: ' + (isDuo ? 'je Produkt' : '') + ' ein Pumpstoß morgens und abends, rund 12 Wochen pro Dispenser.</p></div>';

    var top = '<div class="wrap"><nav class="crumbs" aria-label="Brotkrumen"><a href="./">IB-7</a><span aria-hidden="true">/</span><a href="shop.html">Shop</a><span aria-hidden="true">/</span><span>' + p.name + '</span></nav>' +
      '<div class="pdp"><div class="gallery"><div class="gallery__track" tabindex="0" aria-label="Produktbilder">' + gal + '</div><div class="gallery__dots">' + dots + '</div><div class="gallery__thumbs">' + thumbs + '</div></div>' + buy + '</div></div>' +
      '<div class="sticky-buy" aria-label="Schnellkauf"><img src="' + p.img + '" alt=""><div><p class="sticky-buy__name">' + p.name + '</p><p class="small num"><strong>' + eur(p.price) + '</strong>' + (p.compare ? ' <span class="price__was">' + eur(p.compare) + '</span>' : '') + '</p></div><button class="btn" type="button" data-add="' + k + '">In den Warenkorb</button></div>';

    var results = '<section class="section section--paper"><div class="wrap split">' + B.ba() +
      '<div class="stack-lg"><div class="stack"><p class="kicker">Ergebnisse</p><h2 class="h2">Ab Tag 1 spürbar. <em>Nach 8 bis 12 Wochen sichtbar.</em></h2><p class="lead">Textur und Hautgefühl merkst du ab der ersten Anwendung. Was sich strukturell verändert, braucht Zeit, bei jeder Hautpflege. Das sagen wir dir lieber vorher.</p></div>' +
      '<ul class="list list--row" role="list"><li><strong>Tag 1</strong><span class="small">weiches, gepflegtes Hautgefühl</span></li><li><strong>Woche 4</strong><span class="small">ebenmäßiger wirkender Teint</span></li><li><strong>Woche 8 bis 12</strong><span class="small">sichtbar verfeinertes Hautbild</span></li></ul>' +
      '<p class="micro">Vorher-Nachher nur mit echten, unbearbeiteten Fotos und Einwilligung der Kundin.</p></div></div></section>';

    var middle;
    if (isDuo) {
      middle = '<section class="section"><div class="wrap stack-lg"><div class="stack center" style="max-width:42rem;margin-inline:auto"><p class="kicker">Zwei Rollen</p><h2 class="h2">Was im Serum steckt, <em>wiederholt die Creme nicht.</em></h2></div>' +
        '<div class="two">' + [['pulse', '06-gel', 'Zuerst', 'THE PULSE arbeitet.', 'Zieht sofort ein und bringt sieben Wirkstoffe dorthin, wo sie gebraucht werden.'], ['aura', '07-cream', 'Danach', 'THE AURA schließt ein.', 'Stärkt die Barriere und schließt die Wirkstoffe des Serums ein.']].map(function (r, i) {
          return '<a class="step reveal" href="' + P[r[0]].url + '" style="text-decoration:none"><div class="step__media"><img src="assets/' + r[1] + '.webp" alt="" loading="lazy"></div><div class="step__body"><span class="step__no">' + (i + 1) + '</span><span class="micro">' + r[2] + '</span><h3 class="h3">' + r[3] + '</h3><p class="small">' + r[4] + '</p><span class="link" style="min-height:auto">' + P[r[0]].name + ' ansehen ' + I('arrow') + '</span></div></a>';
        }).join('') + '</div></div></section>' +
        '<section class="section section--paper"><div class="wrap stack-lg"><div class="stack" style="max-width:40rem"><p class="kicker">Der Vergleich</p><h2 class="h2">Ritual oder <em>Skincare-Cocktail?</em></h2></div>' + compareTable() + '</div></section>';
    } else {
      middle = '<section class="section"><div class="wrap split"><div class="media reveal" style="aspect-ratio:4/3"><img src="' + P.duo.img + '" alt="THE PULSE und THE AURA" loading="lazy" style="object-fit:contain;background:var(--paper);padding:6%"></div>' +
        '<div class="stack-lg"><div class="stack"><p class="kicker">Die Rolle im Ritual</p><h2 class="h2">' + p.name + ' ist stark. <em>Mit ' + partner.name + ' ist es komplett.</em></h2>' +
        '<p class="lead">' + (k === 'pulse' ? 'THE PULSE arbeitet, THE AURA schließt die Wirkstoffe ein und stärkt die Barriere.' : 'THE AURA schließt ein, THE PULSE liefert davor die Wirkstoffe, die die Creme bewusst nicht wiederholt.') + '</p></div>' +
        '<div class="price"><span class="price__now">179,00 €</span><span class="price__was">228,00 €</span><span class="price__save">Du sparst ' + eur(save) + '</span></div>' +
        '<div class="hero__actions"><button class="btn" type="button" data-add="duo">Perfect Duo in den Warenkorb ' + I('arrow') + '</button></div></div></div></section>';
    }

    var ingr = '<section class="section' + (isDuo ? '' : ' section--paper') + '"><div class="wrap stack-lg"><div class="head-row"><div class="stack"><p class="kicker">Was drin ist</p><h2 class="h2">Jeder Wirkstoff <em>hat eine Aufgabe.</em></h2></div><p class="lead">Wissen aus Jahrtausenden, dokumentierte Herkunft, moderne Biotechnologie. Nichts doppelt, nichts zur Dekoration.</p></div>' +
      '<div class="rail-m">' + ING.filter(function (x) { return p.ingr.indexOf(x.n) > -1 && x.img; }).concat(ING.filter(function (x) { return p.ingr.indexOf(x.n) > -1 && !x.img; })).slice(0, 3).map(B.ingCard).join('') + '</div>' +
      '<ul class="ingr-table" role="list" style="border-top:1px solid var(--line)">' + ING.filter(function (x) { return p.ingr.indexOf(x.n) > -1; }).map(function (x) { return '<li><strong style="font-family:var(--font-display);font-weight:500">' + x.n + '</strong><span class="small">' + x.r + '</span><span class="micro">' + x.o + '</span></li>'; }).join('') + '</ul>' +
      '<a class="link" href="inhaltsstoffe.html">Alle Inhaltsstoffe ' + I('arrow') + '</a></div></section>';

    var objections = '<section class="section' + (isDuo ? ' section--paper' : '') + '"><div class="wrap stack-lg"><div class="stack" style="max-width:40rem"><p class="kicker">Ehrlich gesagt</p><h2 class="h2">Deine Zweifel. <em>Unsere Antworten.</em></h2></div><div class="objections">' +
      [['„Das ist viel Geld.“', (isDuo ? 'Zwei Produkte mit je 50 ml, wo die Kategorie 30 ml gibt. Rund 12 Wochen Pflege, ' + p.perUse + ' pro Anwendung.' : '50 ml, wo die Kategorie 30 ml gibt. Rund 12 Wochen, ' + p.perUse + ' pro Anwendung.')],
       ['„Woher weiß ich, dass es wirkt?“', 'Gar nicht, bevor du es testest. Deshalb 30 Tage geöffnet testen, Geld zurück ohne Begründung.'],
       ['„Meine Haut ist empfindlich.“', 'Patch-Test mit 25 Proband:innen, 72 Stunden, Irritationspotenzial 0,00. Bei Allergien prüfe die volle INCI oder frag uns.'],
       [k === 'aura' ? '„Ich mag keinen Duft.“' : '„Brauche ich noch mehr?“', k === 'aura' ? 'THE AURA hat einen subtilen Duft. Wer ganz ohne Duft pflegen will, startet mit THE PULSE.' : 'Reinigung nach deinem Geschmack und Sonnenschutz am Tag. Sonst nichts.']].map(function (o) {
        return '<div class="objection reveal"><p class="objection__q">' + o[0] + '</p><p class="small">' + o[1] + '</p></div>';
      }).join('') + '</div></div></section>';

    var faq = '<section class="section"><div class="wrap faq-grid"><div class="stack"><p class="kicker">Fragen</p><h2 class="h2">Alles zu <em>' + p.name.replace('Das ', '') + '.</em></h2><p class="small">Noch offen? <a class="inline-link" href="hilfe.html#kontakt">Schreib uns</a>, Antwort in 1 Werktag.</p></div><div class="acc">' +
      '<details><summary>In welcher Reihenfolge trage ich auf?<i></i></summary><div class="acc__body"><p>Erst THE PULSE, kurz einziehen lassen, dann THE AURA. Morgens und abends.</p></div></details>' +
      '<details><summary>Wie lange reicht ein Dispenser?<i></i></summary><div class="acc__body"><p>Rund 12 Wochen bei einem Pumpstoß morgens und abends. Nach dem Öffnen 6 Monate haltbar.</p></div></details>' +
      '<details><summary>Kann ich es mit anderen Produkten kombinieren?<i></i></summary><div class="acc__body"><p>Reinigung und Sonnenschutz ja. Weitere Seren oder Cremes sind nicht nötig, sie würden die Abstimmung eher stören.</p></div></details>' +
      '<details><summary>Ist das ein Abo?<i></i></summary><div class="acc__body"><p>Nein. Du bestellst nach, wenn du willst.</p></div></details>' +
      '<details><summary>Ist IB-7 tierversuchsfrei?<i></i></summary><div class="acc__body"><p>Ja. Entwickelt in Austria von der IB-7 Beauty Tech GmbH.</p></div></details></div></div></section>';

    return top + results + middle + ingr + B.reviews() + objections + B.guarantee(isDuo ? '<button class="btn btn--light" type="button" data-add="duo">Duo in den Warenkorb ' + I('arrow') + '</button>' : null) + faq;
  }

  function compareTable() {
    return '<div class="compare-wrap reveal"><table class="compare"><thead><tr><th scope="col"><span class="sr">Kriterium</span></th><th scope="col">Cocktail aus 3 bis 5 Marken</th><th scope="col" class="is-us">IB-7 Perfect Duo</th></tr></thead><tbody>' +
      [['Aufeinander abgestimmt', 'Zufall', 'Als Ritual entwickelt'], ['Doppelte Wirkstoffe', 'Hyaluron 3- bis 5-mal', 'Jeder Wirkstoff einmal'], ['Schritte pro Routine', '4 bis 6', '2 Pumpstöße'], ['Preis pro Anwendung', 'schwer zu sagen', '1,07 €'], ['Volle INCI offen', 'teilweise', 'Ja, jede Zutat'], ['Risiko', 'Fehlkäufe', '30 Tage testen']].map(function (r) {
        return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td><td class="is-us">' + r[2] + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  window.IB7_compare = compareTable;

  /* ---------- Mount ---------- */
  function mount() {
    var h = document.querySelector('[data-include="header"]');
    if (h) h.outerHTML = header(h.hasAttribute('data-over'), h.getAttribute('data-current'));
    var pm = document.querySelector('[data-pdp]');
    if (pm) { pm.innerHTML = pdp(pm.getAttribute('data-pdp')); document.body.classList.add('pdp-page'); }
    document.querySelectorAll('[data-block]').forEach(function (el) { var f = B[el.getAttribute('data-block')]; if (f) el.outerHTML = f(); });
    var f = document.querySelector('[data-include="footer"]');
    if (f) f.outerHTML = footer;
    document.body.insertAdjacentHTML('beforeend', menuDrawer + cartDrawer);
    document.querySelectorAll('[data-icon]').forEach(function (el) { el.outerHTML = I(el.getAttribute('data-icon'), el.className); });
    document.querySelectorAll('[data-stars]').forEach(function (el) { el.outerHTML = STARS; });
    document.querySelectorAll('[data-ph]').forEach(function (el) { el.outerHTML = phImg(el.getAttribute('data-ph')); });
  }

  /* ---------- Drawer ---------- */
  var lastFocus = null;
  function openDrawer(id) {
    var d = document.getElementById(id); if (!d) return;
    lastFocus = document.activeElement;
    d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    document.querySelectorAll('[data-open="' + id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    var c = d.querySelector('.icon-btn[data-close]'); if (c) setTimeout(function () { c.focus(); }, 60);
  }
  function closeDrawers() {
    var any = document.querySelector('.drawer.is-open');
    document.querySelectorAll('.drawer.is-open').forEach(function (d) { d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true'); });
    document.querySelectorAll('[data-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    document.documentElement.style.overflow = '';
    if (any && lastFocus) lastFocus.focus();
  }

  /* ---------- Warenkorb ---------- */
  var cart = [];
  function addToCart(id) {
    var l = cart.find(function (x) { return x.id === id; });
    if (l) l.qty += 1; else cart.push({ id: id, qty: 1 });
    renderCart(); openDrawer('cart-drawer');
  }
  function renderCart() {
    var body = document.querySelector('[data-cart-body]'), foot = document.querySelector('[data-cart-foot]');
    var count = cart.reduce(function (s, l) { return s + l.qty; }, 0);
    var total = cart.reduce(function (s, l) { return s + l.qty * P[l.id].price; }, 0);
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = count; el.hidden = !count; });
    var ct = document.querySelector('[data-cart-count-text]'); if (ct) ct.textContent = count ? '(' + count + ')' : '';
    if (!body) return;
    if (!count) {
      foot.hidden = true;
      body.innerHTML = '<p class="lead" style="font-size:1rem">Dein Warenkorb ist noch leer.</p><a class="upgrade" href="perfect-duo.html"><img src="' + P.duo.img + '" alt=""><span class="stack" style="gap:.25rem"><strong style="font-family:var(--font-display);font-weight:500">Das Perfect Duo</strong><span class="small num">179,00 € statt 228,00 €</span><span class="link" style="min-height:auto">Ansehen ' + I('arrow') + '</span></span></a>';
      return;
    }
    foot.hidden = false;
    var missing = Math.max(0, FREE_SHIPPING - total);
    var html = '<div class="ship-bar"><span>' + (missing ? 'Noch <strong class="num">' + eur(missing) + '</strong> bis zum kostenlosen Versand' : 'Kostenloser Versand ist freigeschaltet') + '</span><div class="ship-bar__track"><div class="ship-bar__fill" style="width:' + Math.min(100, total / FREE_SHIPPING * 100) + '%"></div></div></div><div>';
    cart.forEach(function (l) {
      var p = P[l.id];
      html += '<div class="cart-line"><img src="' + p.img + '" alt=""><div><div class="cart-line__top"><span><strong style="font-family:var(--font-display);font-weight:500">' + p.name + '</strong><br><span class="micro">' + p.size + ' · ' + p.unit + '</span></span><span class="num">' + eur(p.price * l.qty) + '</span></div>' +
        '<div class="qty"><button type="button" aria-label="Menge verringern" data-qty="' + l.id + '" data-d="-1">−</button><output class="num">' + l.qty + '</output><button type="button" aria-label="Menge erhöhen" data-qty="' + l.id + '" data-d="1">+</button></div></div></div>';
    });
    html += '</div>';
    var single = cart.find(function (l) { return l.id === 'pulse' || l.id === 'aura'; });
    if (single && !cart.find(function (l) { return l.id === 'duo'; })) {
      var other = P[P[single.id].partner];
      html += '<div class="upgrade"><img src="' + P.duo.img + '" alt=""><span class="stack" style="gap:.35rem"><span class="small"><strong>Mit ' + other.name + ' wird es dein Perfect Duo.</strong> Du sparst ' + eur(P.pulse.price + P.aura.price - P.duo.price) + '.</span><button class="btn btn--ghost" type="button" data-upgrade style="min-height:2.6rem;justify-self:start">Auf das Duo wechseln</button></span></div>';
    }
    body.innerHTML = html;
    document.querySelector('[data-cart-total]').textContent = eur(total);
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    mount(); renderCart();
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    var items = document.querySelectorAll('.announce__item'), ai = 0;
    if (items.length > 1 && !reduce) setInterval(function () { items[ai].classList.remove('is-active'); ai = (ai + 1) % items.length; items[ai].classList.add('is-active'); }, 4500);

    var hdr = document.querySelector('[data-header]'), hero = document.querySelector('.hero');
    var over = hdr && hdr.classList.contains('header--over');
    var openDD = null;
    function onScroll() {
      if (!hdr) return;
      hdr.classList.toggle('is-scrolled', scrollY > 8);
      if (over && hero) hdr.classList.toggle('header--over', !openDD && scrollY < hero.offsetHeight - 120);
    }
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    function setDD(id) {
      document.querySelectorAll('.dropdown').forEach(function (d) { d.classList.toggle('is-open', d.id === id); });
      document.querySelectorAll('[data-dd]').forEach(function (b) { b.setAttribute('aria-expanded', String(b.getAttribute('data-dd') === id)); });
      openDD = id; if (id && hdr) hdr.classList.remove('header--over'); else onScroll();
    }
    document.querySelectorAll('[data-dd]').forEach(function (b) {
      b.addEventListener('click', function () { var id = b.getAttribute('data-dd'); if (matchMedia('(hover: hover)').matches) setDD(id); else setDD(openDD === id ? null : id); });
      b.addEventListener('mouseenter', function () { if (matchMedia('(hover: hover)').matches) setDD(b.getAttribute('data-dd')); });
    });
    if (hdr) hdr.addEventListener('mouseleave', function () { if (matchMedia('(hover: hover)').matches) setDD(null); });

    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-open],[data-close],[data-add],[data-qty],[data-upgrade],[data-thumb],[data-dot],[data-filter]');
      if (!t) return;
      if (t.hasAttribute('data-open')) { e.preventDefault(); openDrawer(t.getAttribute('data-open')); }
      else if (t.hasAttribute('data-close')) closeDrawers();
      else if (t.hasAttribute('data-add')) {
        e.preventDefault();
        var id = t.getAttribute('data-add');
        if (id === 'choice') { var c = document.querySelector('input[name="pick"]:checked'); id = c ? c.value : 'duo'; }
        addToCart(id);
      } else if (t.hasAttribute('data-qty')) {
        var l = cart.find(function (x) { return x.id === t.getAttribute('data-qty'); });
        if (l) { l.qty += Number(t.getAttribute('data-d')); if (l.qty < 1) cart.splice(cart.indexOf(l), 1); renderCart(); }
      } else if (t.hasAttribute('data-upgrade')) {
        cart = cart.filter(function (x) { return x.id !== 'pulse' && x.id !== 'aura'; });
        var d = cart.find(function (x) { return x.id === 'duo'; }); if (d) d.qty++; else cart.push({ id: 'duo', qty: 1 });
        renderCart();
      } else if (t.hasAttribute('data-thumb') || t.hasAttribute('data-dot')) {
        var i = Number(t.getAttribute('data-thumb') || t.getAttribute('data-dot'));
        var tr = document.querySelector('.gallery__track'), s = tr && tr.children[i];
        if (s) tr.scrollTo({ left: s.offsetLeft - tr.offsetLeft - parseFloat(getComputedStyle(tr).paddingLeft || 0), behavior: reduce ? 'auto' : 'smooth' });
      } else if (t.hasAttribute('data-filter')) {
        var v = t.getAttribute('data-filter');
        document.querySelectorAll('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === t)); });
        document.querySelectorAll('[data-prod]').forEach(function (r) { var pr = r.getAttribute('data-prod'); r.hidden = !(v === 'all' || pr === v || pr === 'both'); });
      }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDrawers(); setDD(null); } });

    document.querySelectorAll('[data-signup]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var inp = f.querySelector('input[type="email"]'), msg = f.querySelector('[data-signup-msg]');
        if (!inp.checkValidity() || !inp.value) { msg.textContent = 'Bitte gib eine gültige E-Mail-Adresse ein.'; inp.focus(); return; }
        msg.textContent = 'Danke. Bitte bestätige deine Anmeldung in der E-Mail, die wir dir geschickt haben (Demo).'; inp.value = '';
      });
    });

    var tr = document.querySelector('.gallery__track');
    if (tr) {
      var marks = document.querySelectorAll('[data-thumb],[data-dot]');
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) {
          if (x.isIntersecting && x.intersectionRatio > 0.6) {
            var i = Array.prototype.indexOf.call(tr.children, x.target);
            marks.forEach(function (m) { m.setAttribute('aria-current', String(Number(m.getAttribute('data-thumb') || m.getAttribute('data-dot')) === i)); });
          }
        });
      }, { root: tr, threshold: [0.6] });
      Array.prototype.forEach.call(tr.children, function (s) { io.observe(s); });
    }

    var sticky = document.querySelector('.sticky-buy'), atc = document.querySelector('[data-main-atc]');
    if (sticky && atc) new IntersectionObserver(function (en) { sticky.classList.toggle('is-visible', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }).observe(atc);

    document.querySelectorAll('.ba input').forEach(function (r) {
      var set = function () { r.closest('.ba').style.setProperty('--pos', r.value + '%'); };
      r.addEventListener('input', set); set();
    });

    // Optimum-Skala: Cocktail-Punkte wandern auf ihre Position, IB-7 bleibt im Optimum
    document.querySelectorAll('[data-scale]').forEach(function (sc) {
      var marks = sc.querySelectorAll('.srow__mark--mix');
      if (!reduce) marks.forEach(function (m) { m.style.left = '50%'; });
      new IntersectionObserver(function (en, obs) {
        if (!en[0].isIntersecting) return;
        marks.forEach(function (m, i) { setTimeout(function () { m.style.left = m.getAttribute('data-pos') + '%'; }, i * 120); });
        obs.disconnect();
      }, { threshold: 0.35 }).observe(sc);
      marks.forEach(function (m) { if (reduce) m.style.left = m.getAttribute('data-pos') + '%'; });
    });

    // Kennzahlen zählen hoch
    document.querySelectorAll('[data-count]').forEach(function (el) {
      if (reduce) return;
      var target = Number(el.getAttribute('data-count')), suffix = el.getAttribute('data-suffix') || '', dec = Number(el.getAttribute('data-dec') || 0);
      var fmt = function (v) { return v.toLocaleString('de-AT', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix; };
      el.textContent = fmt(0);
      new IntersectionObserver(function (en, obs) {
        if (!en[0].isIntersecting) return; obs.disconnect();
        var t0 = performance.now();
        (function tick(t) { var k = Math.min(1, (t - t0) / 1400); el.textContent = fmt(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(t0);
      }, { threshold: 0.5 }).observe(el);
    });

    // Quiz
    var quiz = document.querySelector('[data-quiz]');
    if (quiz) initQuiz(quiz);
  });

  function initQuiz(root) {
    var Q = [
      ['Wie viele Pflegeprodukte nutzt du gerade?', ['1 bis 2', '3 bis 4', '5 oder mehr']],
      ['Von wie vielen Marken stammen sie?', ['Eine Marke', 'Zwei Marken', 'Drei oder mehr']],
      ['Was wünschst du dir am meisten?', ['Glatteres, feineres Hautbild', 'Mehr Ruhe und Barriere', 'Beides, ohne Aufwand']],
      ['Wie stehst du zu Duft in Pflege?', ['Lieber ohne', 'Dezent ist okay', 'Egal']],
      ['Wie viel Zeit willst du morgens investieren?', ['Unter 1 Minute', '2 bis 5 Minuten', 'Gerne mehr']]
    ];
    var a = [], i = 0;
    function render() {
      if (i < Q.length) {
        root.innerHTML = '<div class="quiz__progress" aria-hidden="true"><b style="width:' + (i / Q.length * 100) + '%"></b></div><p class="micro">Frage ' + (i + 1) + ' von ' + Q.length + '</p><h2 class="h3" style="font-size:clamp(1.4rem,1.2rem + 1vw,2rem);font-weight:300">' + Q[i][0] + '</h2><div class="quiz__opts">' +
          Q[i][1].map(function (o, j) { return '<button class="quiz__opt" type="button" data-a="' + j + '">' + o + I('arrow') + '</button>'; }).join('') + '</div>' +
          (i ? '<button class="link" type="button" data-back style="border:0;background:none;justify-self:start;padding:0">Zurück</button>' : '');
        root.querySelectorAll('[data-a]').forEach(function (b) { b.addEventListener('click', function () { a[i] = Number(b.getAttribute('data-a')); i++; render(); }); });
        var bk = root.querySelector('[data-back]'); if (bk) bk.addEventListener('click', function () { i--; render(); });
        return;
      }
      var rec = 'duo';
      if (a[3] === 0 && a[2] === 0) rec = 'pulse';
      var p = P[rec];
      var mix = a[1] === 2 || a[0] === 2;
      root.innerHTML = '<div class="quiz__progress" aria-hidden="true"><b style="width:100%"></b></div><p class="kicker">Dein Ergebnis</p><h2 class="h2">' + (mix ? 'Deine Routine ist ein <em>Cocktail.</em>' : 'Gute Basis. <em>Jetzt abgestimmt.</em>') + '</h2>' +
        '<p class="lead">' + (mix ? 'Bei mehreren Marken überschneiden sich Wirkstoffe, während andere fehlen. ' : '') + 'Unsere Empfehlung für dich: <strong>' + p.name + '</strong>' + (rec === 'pulse' ? ', duftfrei und ideal für ein feineres Hautbild.' : ', zwei Pumpstöße morgens und abends, perfekt abgestimmt.') + '</p>' +
        '<a class="upgrade" href="' + p.url + '"><img src="' + p.img + '" alt=""><span class="stack" style="gap:.25rem"><strong style="font-family:var(--font-display);font-weight:500">' + p.name + '</strong><span class="small num">' + eur(p.price) + (p.compare ? ' statt ' + eur(p.compare) : '') + '</span><span class="link" style="min-height:auto">Ansehen ' + I('arrow') + '</span></span></a>' +
        '<form class="stack" data-signup novalidate><label for="quiz-email" class="small">Ergebnis und Tipps per E-Mail erhalten</label><div class="field"><input id="quiz-email" type="email" placeholder="Deine E-Mail-Adresse" autocomplete="email" required><button class="btn" type="submit">Senden</button></div><p class="micro" data-signup-msg>Kein Spam. Abmeldung jederzeit.</p></form>' +
        '<button class="link" type="button" data-restart style="border:0;background:none;justify-self:start;padding:0">Check neu starten</button>';
      root.querySelector('[data-restart]').addEventListener('click', function () { a = []; i = 0; render(); });
      var f = root.querySelector('[data-signup]');
      f.addEventListener('submit', function (e) { e.preventDefault(); var inp = f.querySelector('input'), m = f.querySelector('[data-signup-msg]'); if (!inp.value || !inp.checkValidity()) { m.textContent = 'Bitte gib eine gültige E-Mail-Adresse ein.'; return; } m.textContent = 'Danke, dein Ergebnis ist unterwegs (Demo).'; inp.value = ''; });
    }
    render();
  }
})();
