/* Museo Real (pvl-mus-). Mismo candado de doble ejecucion que el resto de
   <helmet>. Ocho reliquias dibujadas en SVG; la galeria se pinta en
   #pvl-mus-galeria y cada pieza abre un visor (dialogo modal) con la obra
   ampliable —rueda, botones, pellizco o arrastre— y su cartela. Todo en el
   navegador. Esc o el boton cierran; el foco vuelve a la pieza. */
(function(){
  if (window.__pvlMuseo) return;
  window.__pvlMuseo = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function uno(sel){
    var els = doc.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  function t(o){ return o[lang()] || o.en; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var DEFS = '<defs><linearGradient id="pvl-mus-oro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4e0a8"/><stop offset=".5" stop-color="#d8b25c"/><stop offset="1" stop-color="#8f6f2a"/></linearGradient>' +
    '<linearGradient id="pvl-mus-iri" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#86e7ea"/><stop offset=".5" stop-color="#f2a9dc"/><stop offset="1" stop-color="#e9c874"/></linearGradient>' +
    '<radialGradient id="pvl-mus-luz" cx="50%" cy="20%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>';
  var PIEZAS = [
    { id: 'herradura', n: { es: 'La Primera Herradura', en: 'The First Horseshoe' }, f: { es: 'Era pre-Big Bang', en: 'Pre-Big Bang era' }, m: { es: 'Oro macizo, polvo cósmico', en: 'Solid gold, cosmic dust' },
      d: { es: 'Desprendida del casco del Unicornio de los Unicornios al frenar ante Pavel, que ya estaba aquí. Se considera el primer objeto del universo y el segundo más importante.', en: 'Shed from the hoof of the Unicorn of Unicorns as it braked before Pavel, who was already here. Considered the first object in the universe and the second most important.' },
      s: '<path d="M60 170c-30-40-30-110 10-140 20-15 40-20 60-20s40 5 60 20c40 30 40 100 10 140" fill="none" stroke="url(#pvl-mus-oro)" stroke-width="30" stroke-linecap="round"/>' + [0, 1, 2, 3, 4, 5].map(function(i){ var a = Math.PI * (0.95 + i * 0.22); return '<circle cx="' + (130 + Math.cos(a) * 74).toFixed(1) + '" cy="' + (95 + Math.sin(a) * 74).toFixed(1) + '" r="5" fill="#5a4210"/>'; }).join('') + '<path d="M70 60q60-40 120 0" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none"/>', link: 'reino-de-pavel.dc.html#juego' },
    { id: 'cetro', n: { es: 'El Cetro Original', en: 'The Original Sceptre' }, f: { es: 'Año 0', en: 'Year 0' }, m: { es: 'Oro, cuarzo iridiscente', en: 'Gold, iridescent quartz' },
      d: { es: 'Nunca ha sido empuñado: Pavel gobierna con la mirada. Se exhibe por si algún día hiciera falta, cosa que el Ministerio considera improbable.', en: 'It has never been wielded: Pavel rules with a glance. It is displayed in case it is ever needed, which the Ministry considers unlikely.' },
      s: '<rect x="121" y="70" width="18" height="170" rx="8" fill="url(#pvl-mus-oro)"/><path d="M110 92h40M112 130h36M112 180h36" stroke="#8f6f2a" stroke-width="5"/><circle cx="130" cy="52" r="34" fill="url(#pvl-mus-iri)" stroke="url(#pvl-mus-oro)" stroke-width="8"/><path d="M130 10l8 14h-16z" fill="#d8b25c"/><circle cx="120" cy="42" r="9" fill="#fff" opacity=".55"/>', link: 'el-reino.html#emblema' },
    { id: 'pepita', n: { es: 'La Auténtica Pepita de Castor', en: 'The True Beaver Nugget' }, f: { es: 'Buc-ee’s del Desierto, año 0', en: 'Desert Buc-ee’s, Year 0' }, m: { es: 'Maíz, azúcar, mantequilla, devoción', en: 'Corn, sugar, butter, devotion' },
      d: { es: 'La primera pepita servida en el Buc-ee’s más grande del universo conocido. Pavel la miró y decidió no comérsela, por respeto. Está asegurada en ∞ Grandezas.', en: 'The first nugget served at the largest Buc-ee’s in the known universe. Pavel looked at it and chose not to eat it, out of respect. It is insured for ∞ Grandezas.' },
      s: '<path d="M60 150c-20-40 10-90 60-96 40-6 90 20 86 70-4 44-48 66-90 60-28-4-46-14-56-34z" fill="#c98a3c"/><path d="M80 110c20-10 40-6 50 6M120 150c18-4 34-14 40-30M90 90c10-6 24-6 32 0" stroke="#8a5420" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="110" cy="96" rx="34" ry="14" fill="#fff" opacity=".22"/><circle cx="96" cy="130" r="4" fill="#f4e0a8"/><circle cx="150" cy="110" r="3" fill="#f4e0a8"/>', link: 'reino-de-pavel.dc.html#mapa' },
    { id: 'borrador', n: { es: 'El Borrador de la Constitución', en: 'The Draft of the Constitution' }, f: { es: 'Víspera del Año 0', en: 'Eve of Year 0' }, m: { es: 'Pergamino, tinta violeta', en: 'Parchment, violet ink' },
      d: { es: 'La única versión en la que hay algo tachado: un octavo artículo que decía «Pavel también puede equivocarse». Se tachó al instante, por imposible.', en: 'The only version with something crossed out: an eighth article reading “Pavel can also be wrong”. It was struck out at once, as impossible.' },
      s: '<path d="M50 20h150l10 14v190H40V34z" fill="#efe1bf" stroke="#b48a46" stroke-width="3"/>' + [50, 70, 90, 110, 130].map(function(y){ return '<path d="M64 ' + y + 'h' + (110 - y / 4) + '" stroke="#5b2a86" stroke-width="4" stroke-linecap="round"/>'; }).join('') + '<path d="M64 162h120" stroke="#5b2a86" stroke-width="4"/><path d="M58 158l132 10" stroke="#b3263a" stroke-width="6" stroke-linecap="round"/><circle cx="170" cy="200" r="16" fill="#9e1f33"/><text x="170" y="206" text-anchor="middle" font-size="16" font-weight="700" fill="#f4d9a0" font-family="Bodoni Moda,serif">P</text>', link: 'el-reino.html#constitucion' },
    { id: 'crin', n: { es: 'Mechón de Crin Iridiscente', en: 'Lock of Iridescent Mane' }, f: { es: 'Recogido en el Monte Non Plus Ultra', en: 'Gathered on Mount Non Plus Ultra' }, m: { es: 'Crin de unicornio, cinta de oro', en: 'Unicorn mane, gold ribbon' },
      d: { es: 'Donado voluntariamente por el unicornio tras una sesión de peinado real. Cambia de color según quién lo mire; con Pavel delante, brilla.', en: 'Donated willingly by the unicorn after a royal grooming session. Changes colour depending on who looks at it; with Pavel in front of it, it shines.' },
      s: [0, 1, 2, 3, 4].map(function(i){ return '<path d="M' + (90 + i * 12) + ' 40C' + (60 + i * 18) + ' 100 ' + (150 + i * 6) + ' 140 ' + (100 + i * 14) + ' 220" fill="none" stroke="url(#pvl-mus-iri)" stroke-width="12" stroke-linecap="round" opacity="' + (1 - i * .12) + '"/>'; }).join('') + '<rect x="96" y="60" width="64" height="16" rx="6" fill="url(#pvl-mus-oro)"/>', link: 'el-reino.html#bandera' },
    { id: 'primer-aplauso', n: { es: 'El Eco del Primer Aplauso', en: 'The Echo of the First Applause' }, f: { es: 'Plaza del Unicornio, año 0', en: 'Unicorn Square, Year 0' }, m: { es: 'Sonido embotellado, cristal soplado', en: 'Bottled sound, blown glass' },
      d: { es: 'Capturado en una botella en el instante en que el universo vio a Pavel. Si se acerca el oído, aún se oye. Si no se oye, el problema es del oído.', en: 'Captured in a bottle the instant the universe saw Pavel. Put your ear close and it can still be heard. If it cannot, the fault is the ear’s.' },
      s: '<path d="M104 20h52v30c0 10 36 28 36 80v86c0 10-8 16-16 16H84c-8 0-16-6-16-16v-86c0-52 36-70 36-80z" fill="rgba(134,231,234,.35)" stroke="#86e7ea" stroke-width="4"/><rect x="100" y="8" width="60" height="18" rx="4" fill="#a8824a"/>' + [0, 1, 2].map(function(i){ return '<path d="M' + (100 - i * 6) + ' ' + (150 - i * 18) + 'q30-' + (20 + i * 6) + ' 60 0" fill="none" stroke="#f2a9dc" stroke-width="4" stroke-linecap="round"/>'; }).join('') + '<rect x="80" y="70" width="12" height="120" rx="6" fill="#fff" opacity=".3"/>', link: 'reino-de-pavel.dc.html#himno' },
    { id: 'gafas', n: { es: 'Las Gafas de la Duda', en: 'The Spectacles of Doubt' }, f: { es: 'Siglo XVII', en: '17th century' }, m: { es: 'Carey, cristal, arrepentimiento', en: 'Tortoiseshell, glass, regret' },
      d: { es: 'Las gafas con las que Descartes dudó de todo salvo de lo único indudable. Los cristales están empañados: de vergüenza, según la restauradora.', en: 'The spectacles through which Descartes doubted everything except the one indubitable thing. The lenses are fogged: from shame, according to the restorer.' },
      s: '<circle cx="80" cy="120" r="44" fill="rgba(200,210,230,.45)" stroke="#5a3a1c" stroke-width="10"/><circle cx="180" cy="120" r="44" fill="rgba(200,210,230,.45)" stroke="#5a3a1c" stroke-width="10"/><path d="M124 116q6-10 12 0" stroke="#5a3a1c" stroke-width="8" fill="none"/><path d="M36 110l-26-24M224 110l26-24" stroke="#5a3a1c" stroke-width="8" stroke-linecap="round"/><path d="M60 100l20-14M160 100l20-14" stroke="#fff" stroke-width="4" opacity=".6"/>', link: 'el-reino.html#descartes' },
    { id: 'corona', n: { es: 'La Corona de Repuesto', en: 'The Spare Crown' }, f: { es: 'Año 0 (por si acaso)', en: 'Year 0 (just in case)' }, m: { es: 'Oro, rubí, turquesa, optimismo', en: 'Gold, ruby, turquoise, optimism' },
      d: { es: 'Forjada por si la corona titular se perdía. Nunca se ha perdido. La de repuesto vive aquí, ligeramente ofendida por no haber salido nunca.', en: 'Forged in case the official crown was lost. It never has been. The spare lives here, slightly offended at never having gone out.' },
      s: '<path d="M40 180l14-110 44 50 32-80 32 80 44-50 14 110z" fill="url(#pvl-mus-oro)" stroke="#8f6f2a" stroke-width="4"/><rect x="40" y="176" width="180" height="30" rx="4" fill="url(#pvl-mus-oro)" stroke="#8f6f2a" stroke-width="4"/><circle cx="130" cy="191" r="10" fill="#b3263a"/><circle cx="80" cy="191" r="7" fill="#3fb8c4"/><circle cx="180" cy="191" r="7" fill="#3fb8c4"/><circle cx="130" cy="40" r="9" fill="#f2a9dc"/>', link: 'honores.html#titulo' }
  ];
  function obra(p, cls){ return '<svg viewBox="0 0 260 240" class="' + cls + '" role="img" aria-label="' + esc(t(p.n)) + '">' + DEFS + '<rect width="260" height="240" fill="url(#pvl-mus-luz)"/>' + p.s + '</svg>'; }

  function galeria(){
    var g = uno('#pvl-mus-galeria');
    if (!g || g.getAttribute('data-l') === lang()) return;
    g.innerHTML = PIEZAS.map(function(p, i){
      return '<li><button type="button" class="pvl-mus-pieza" data-pvl-mus="' + i + '">' +
        '<span class="pvl-mus-vitrina">' + obra(p, 'pvl-mus-mini') + '</span>' +
        '<span class="pvl-mus-num">' + (lang() === 'es' ? 'Pieza ' : 'Exhibit ') + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="pvl-mus-nom">' + esc(t(p.n)) + '</span></button></li>';
    }).join('');
    g.setAttribute('data-l', lang());
  }

  /* Visor */
  var visor = null, actual = -1, z = 1, px = 0, py = 0, volver = null;
  function aplicar(){
    var o = visor && visor.querySelector('.pvl-mus-obra');
    if (o) o.style.transform = 'translate(' + px + 'px,' + py + 'px) scale(' + z + ')';
    var zz = visor && visor.querySelector('.pvl-mus-zoomval');
    if (zz) zz.textContent = Math.round(z * 100) + '%';
  }
  function zoom(f, cx, cy){
    var nz = Math.max(1, Math.min(6, z * f));
    if (cx !== undefined) { px = cx - (cx - px) * nz / z; py = cy - (cy - py) * nz / z; }
    z = nz;
    if (z === 1) { px = 0; py = 0; }
    aplicar();
  }
  function abrir(i){
    cerrar(true);
    var p = PIEZAS[i]; if (!p) return;
    actual = i; z = 1; px = 0; py = 0;
    volver = doc.activeElement;
    visor = doc.createElement('div');
    visor.className = 'pvl-mus-visor';
    visor.setAttribute('role', 'dialog');
    visor.setAttribute('aria-modal', 'true');
    visor.setAttribute('data-l', lang());
    visor.setAttribute('aria-label', t(p.n));
    var l = lang();
    visor.innerHTML = '<div class="pvl-mus-caja">' +
      '<div class="pvl-mus-escena"><div class="pvl-mus-obra">' + obra(p, 'pvl-mus-grande') + '</div>' +
        '<div class="pvl-mus-zoom"><button type="button" data-pvl-mus-z="-1" aria-label="' + (l === 'es' ? 'Alejar' : 'Zoom out') + '">−</button><span class="pvl-mus-zoomval">100%</span><button type="button" data-pvl-mus-z="1" aria-label="' + (l === 'es' ? 'Acercar' : 'Zoom in') + '">+</button></div>' +
        '<div class="pvl-mus-ayuda">' + (l === 'es' ? 'Rueda, pellizco o botones para ampliar · arrastre para mover' : 'Wheel, pinch or buttons to zoom · drag to move') + '</div></div>' +
      '<aside class="pvl-mus-cartela">' +
        '<div class="pvl-mus-num">' + (l === 'es' ? 'PIEZA ' : 'EXHIBIT ') + String(i + 1).padStart(2, '0') + ' / ' + PIEZAS.length + '</div>' +
        '<h3>' + esc(t(p.n)) + '</h3>' +
        '<dl><div><dt>' + (l === 'es' ? 'Datación' : 'Date') + '</dt><dd>' + esc(t(p.f)) + '</dd></div><div><dt>' + (l === 'es' ? 'Materiales' : 'Materials') + '</dt><dd>' + esc(t(p.m)) + '</dd></div></dl>' +
        '<p>' + esc(t(p.d)) + '</p>' +
        '<p class="pvl-mus-aviso">' + (l === 'es' ? 'No tocar: la grandeza es frágil.' : 'Do not touch: greatness is fragile.') + '</p>' +
        '<a href="' + p.link + '" class="pvl-mus-link">' + (l === 'es' ? 'Ver la sala relacionada →' : 'See the related hall →') + '</a>' +
        '<div class="pvl-mus-nav"><button type="button" data-pvl-mus-ir="-1">← ' + (l === 'es' ? 'Anterior' : 'Previous') + '</button><button type="button" data-pvl-mus-ir="1">' + (l === 'es' ? 'Siguiente' : 'Next') + ' →</button></div>' +
      '</aside>' +
      '<button type="button" class="pvl-mus-cerrar" data-pvl-mus-cerrar aria-label="' + (l === 'es' ? 'Cerrar' : 'Close') + '">×</button></div>';
    doc.body.appendChild(visor);
    doc.documentElement.style.overflow = 'hidden';
    var c = visor.querySelector('.pvl-mus-cerrar'); if (c) c.focus();
    var esc0 = visor.querySelector('.pvl-mus-escena');
    esc0.addEventListener('wheel', function(e){
      e.preventDefault();
      var r = esc0.getBoundingClientRect();
      zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
    }, { passive: false });
    var punteros = {}, ini = null;
    esc0.addEventListener('pointerdown', function(e){
      if (e.target.closest('button')) return;
      punteros[e.pointerId] = { x: e.clientX, y: e.clientY };
      esc0.setPointerCapture(e.pointerId);
      ini = null;
    });
    esc0.addEventListener('pointermove', function(e){
      if (!punteros[e.pointerId]) return;
      var ids = Object.keys(punteros);
      if (ids.length === 2) {
        var a = punteros[ids[0]], b = punteros[ids[1]];
        var d0 = Math.hypot(a.x - b.x, a.y - b.y);
        punteros[e.pointerId] = { x: e.clientX, y: e.clientY };
        a = punteros[ids[0]]; b = punteros[ids[1]];
        var d1 = Math.hypot(a.x - b.x, a.y - b.y);
        if (d0 > 0) zoom(d1 / d0);
        return;
      }
      var p0 = punteros[e.pointerId];
      if (z > 1) { px += e.clientX - p0.x; py += e.clientY - p0.y; aplicar(); }
      punteros[e.pointerId] = { x: e.clientX, y: e.clientY };
    });
    function fin(e){ delete punteros[e.pointerId]; }
    esc0.addEventListener('pointerup', fin);
    esc0.addEventListener('pointercancel', fin);
  }
  function cerrar(sinFoco){
    if (!visor) return;
    visor.remove(); visor = null;
    doc.documentElement.style.overflow = '';
    if (!sinFoco && volver && volver.focus) volver.focus();
  }
  doc.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-pvl-mus]');
    if (b) { abrir(+b.getAttribute('data-pvl-mus')); return; }
    if (!visor) return;
    if (e.target.closest('[data-pvl-mus-cerrar]') || e.target === visor) { cerrar(); return; }
    var zb = e.target.closest('[data-pvl-mus-z]');
    if (zb) { zoom(+zb.getAttribute('data-pvl-mus-z') > 0 ? 1.4 : 1 / 1.4); return; }
    var ir = e.target.closest('[data-pvl-mus-ir]');
    if (ir) { var v = volver; abrir((actual + +ir.getAttribute('data-pvl-mus-ir') + PIEZAS.length) % PIEZAS.length); volver = v; return; }
    if (e.target.closest('.pvl-mus-link')) cerrar(true);
  });
  doc.addEventListener('keydown', function(e){
    if (!visor) return;
    if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var v = volver; abrir((actual + (e.key === 'ArrowRight' ? 1 : -1) + PIEZAS.length) % PIEZAS.length); volver = v; }
    else if (e.key === '+' || e.key === '=') zoom(1.4);
    else if (e.key === '-') zoom(1 / 1.4);
    else if (e.key === 'Tab') {
      var f = visor.querySelectorAll('button, a[href]');
      if (!f.length) return;
      var a = f[0], z0 = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z0.focus(); }
      else if (!e.shiftKey && doc.activeElement === z0) { e.preventDefault(); a.focus(); }
    }
  });
  doc.addEventListener('pavel:langchange', function(){ galeria(); if (visor && visor.getAttribute('data-l') !== lang()) { var v = volver; abrir(actual); volver = v; visor.setAttribute('data-l', lang()); } });
  setInterval(galeria, 400);
})();
