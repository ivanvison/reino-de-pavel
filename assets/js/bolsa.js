/* Bolsa de la Grandeza (pvl-bolsa-). Mismo candado de doble ejecucion que el
   resto de <helmet>. Todos los valores suben: un paseo aleatorio con deriva
   positiva y sin pasos negativos (por decreto), sembrado con la fecha para que
   la historia del dia sea la misma para todos, y que sigue cotizando cada pocos
   segundos mientras la pagina esta abierta. Sin datos reales, sin servidor.
   Con prefers-reduced-motion la cinta no se desplaza y el grafico no se anima. */
(function(){
  if (window.__pvlBolsa) return;
  window.__pvlBolsa = true;
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
  function prng(seed){
    return function(){
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var r = Math.imul(seed ^ seed >>> 15, 1 | seed);
      r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
      return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
  }
  var hoy = new Date();
  var rnd = prng(hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate());

  var VALORES = [
    { s: 'GRNDZ', es: 'La Grandeza', en: 'The Grandeza', p: 1000 },
    { s: 'UNICORN', es: 'Unicornio de Unicornios S.A.', en: 'Unicorn of Unicorns Inc.', p: 8849 },
    { s: 'BUCEE', es: 'Buc-ee’s del Desierto', en: 'Desert Buc-ee’s', p: 412 },
    { s: 'NPULTRA', es: 'Non Plus Ultra Holdings', en: 'Non Plus Ultra Holdings', p: 2600 },
    { s: 'NUGGET', es: 'Pepitas de Castor', en: 'Beaver Nuggets', p: 77 },
    { s: 'HIMNO', es: 'Derechos del Himno', en: 'Anthem Royalties', p: 333 },
    { s: 'IRIDS', es: 'Iridiscencia Futuros', en: 'Iridescence Futures', p: 1490 },
    { s: 'APLAUSO', es: 'Aplauso Nacional', en: 'National Applause', p: 64 }
  ];
  /* Historia de hoy: 60 puntos por valor, nunca bajan. */
  VALORES.forEach(function(v){
    v.h = [v.p];
    for (var i = 1; i < 60; i++) v.h.push(v.h[i - 1] * (1 + .0005 + rnd() * .0045));
    v.abre = v.h[0];
  });
  var INDICE = { s: 'PVL-100', h: [] };
  function indice(){
    INDICE.h = VALORES[0].h.map(function(_, i){
      var s = 0; VALORES.forEach(function(v){ s += v.h[i] / v.abre; }); return s / VALORES.length * 10000;
    });
  }
  indice();
  function cotizar(){
    VALORES.forEach(function(v){
      var u = v.h[v.h.length - 1];
      v.h.push(u * (1 + .0002 + Math.random() * .002));
      if (v.h.length > 90) v.h.shift();
    });
    indice();
  }
  var COMENTARIOS = [
    { es: 'Jornada histórica: por enésima vez consecutiva, todo sube. Los analistas no se explican cómo, pero tampoco se quejan.', en: 'Historic session: for the umpteenth consecutive time, everything rises. Analysts cannot explain how, but they are not complaining either.' },
    { es: 'UNICORN marca un nuevo máximo tras rumores de que Pavel lo miró. Fuentes de palacio confirman: lo miró.', en: 'UNICORN hits a new high on rumours that Pavel looked at it. Palace sources confirm: he did.' },
    { es: 'BUCEE se dispara por la demanda de pepitas. El regulador declara la subida "deliciosa".', en: 'BUCEE soars on nugget demand. The regulator declares the rally "delicious".' },
    { es: 'Corrección técnica de +0,4 %. En Pavelandia, las correcciones también son al alza.', en: 'Technical correction of +0.4%. In Pavelandia, corrections go up too.' },
    { es: 'La Grandeza (GRNDZ) supera al dólar, al euro y, según el Ministerio, a la gravedad.', en: 'The Grandeza (GRNDZ) overtakes the dollar, the euro and, according to the Ministry, gravity.' },
    { es: 'Se suspende la cotización de las acciones bajistas por falta de existencia.', en: 'Trading in bearish shares is suspended for lack of existence.' }
  ];
  var TASA = { usd: 0.0013, eur: 0.0011, mxn: 0.00007, gbp: 0.0015 };

  function dinero(n){ return n.toLocaleString(lang() === 'es' ? 'es-ES' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pct(v){ var u = v.h[v.h.length - 1]; return (u / v.abre - 1) * 100; }
  function pc(n){ return n.toLocaleString(lang() === 'es' ? 'es-ES' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  function txtTick(v){ return dinero(v.h[v.h.length - 1]) + ' ▲ +' + pc(pct(v)) + '%'; }
  /* La cinta se monta una vez (dos copias, para el bucle sin costura) y despues
     solo cambia el texto de cada precio: rehacerla reiniciaria la animacion. */
  function cinta(tc){
    var ps = tc.querySelectorAll('.pvl-bolsa-tick i');
    if (ps.length === VALORES.length * 2) {
      for (var i = 0; i < ps.length; i++) ps[i].textContent = txtTick(VALORES[i % VALORES.length]);
      return;
    }
    var items = VALORES.map(function(v){ return '<span class="pvl-bolsa-tick"><b>' + v.s + '</b> <i>' + txtTick(v) + '</i></span>'; }).join('');
    tc.innerHTML = items + items;
  }
  function grafico(serie, w, h){
    var min = Math.min.apply(null, serie), max = Math.max.apply(null, serie);
    var sx = w / (serie.length - 1), sy = (h - 24) / ((max - min) || 1);
    var pts = serie.map(function(v, i){ return (i * sx).toFixed(1) + ',' + (h - 10 - (v - min) * sy).toFixed(1); });
    var area = 'M0,' + h + ' L' + pts.join(' L') + ' L' + w + ',' + h + ' Z';
    var grid = '';
    for (var g = 1; g < 4; g++) grid += '<line x1="0" x2="' + w + '" y1="' + (h * g / 4) + '" y2="' + (h * g / 4) + '" stroke="rgba(244,239,226,.08)"/>';
    var u = pts[pts.length - 1].split(',');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" class="pvl-bolsa-svg" role="img" aria-label="PVL-100">' +
      '<defs><linearGradient id="pvl-bolsa-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(134,231,234,.45)"/><stop offset="1" stop-color="rgba(134,231,234,0)"/></linearGradient>' +
      '<linearGradient id="pvl-bolsa-l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#86e7ea"/><stop offset=".6" stop-color="#f2a9dc"/><stop offset="1" stop-color="#e9c874"/></linearGradient></defs>' +
      grid + '<path d="' + area + '" fill="url(#pvl-bolsa-g)"/>' +
      '<polyline points="' + pts.join(' ') + '" fill="none" stroke="url(#pvl-bolsa-l)" stroke-width="2.5" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="' + u[0] + '" cy="' + u[1] + '" r="4" fill="#e9c874"/></svg>';
  }

  var comentario = Math.floor(rnd() * COMENTARIOS.length);
  function pintar(){
    var r = uno('#pvl-bolsa-root');
    if (!r) return;
    var l = lang();
    var i0 = INDICE.h[0], iu = INDICE.h[INDICE.h.length - 1];
    var tc = r.querySelector('.pvl-bolsa-cinta-in');
    if (tc) cinta(tc);
    var c = r.querySelector('.pvl-bolsa-grafico');
    if (c) c.innerHTML = grafico(INDICE.h, 600, 220);
    var v = r.querySelector('.pvl-bolsa-valor');
    if (v) v.innerHTML = dinero(iu) + ' <i>▲ +' + pc((iu / i0 - 1) * 100) + '%</i>';
    var tb = r.querySelector('.pvl-bolsa-tabla tbody');
    if (tb) tb.innerHTML = VALORES.map(function(x){
      var u = x.h[x.h.length - 1];
      return '<tr><th scope="row"><b>' + x.s + '</b><span>' + esc(t(x)) + '</span></th><td>' + dinero(u) + '</td><td class="pvl-bolsa-up">▲ +' + pc(pct(x)) + '%</td><td class="pvl-bolsa-mini">' + grafico(x.h.slice(-30), 80, 24) + '</td></tr>';
    }).join('');
    var co = r.querySelector('.pvl-bolsa-coment');
    if (co && co.getAttribute('data-l') !== l + comentario) { co.textContent = t(COMENTARIOS[comentario]); co.setAttribute('data-l', l + comentario); }
    var h = r.querySelector('.pvl-bolsa-hora');
    if (h) h.textContent = new Date().toLocaleTimeString(l === 'es' ? 'es-ES' : 'en-GB');
    convertir();
  }
  function convertir(){
    var a = uno('#pvl-bolsa-monto'), m = uno('#pvl-bolsa-moneda'), o = uno('#pvl-bolsa-res');
    if (!a || !m || !o) return;
    var n = parseFloat(String(a.value).replace(',', '.'));
    if (!isFinite(n) || n < 0) { o.textContent = '—'; return; }
    var g = n / (TASA[m.value] || TASA.usd) * (VALORES[0].h[VALORES[0].h.length - 1] / VALORES[0].abre);
    o.textContent = g.toLocaleString(lang() === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 0 }) + ' G';
  }
  doc.addEventListener('input', function(e){ if (e.target && (e.target.id === 'pvl-bolsa-monto' || e.target.id === 'pvl-bolsa-moneda')) convertir(); });
  doc.addEventListener('change', function(e){ if (e.target && e.target.id === 'pvl-bolsa-moneda') convertir(); });
  doc.addEventListener('pavel:langchange', function(){ var r = uno('#pvl-bolsa-root'); if (r && r.getAttribute('data-l') !== lang()) { r.setAttribute('data-l', lang()); pintar(); } });

  var n = 0;
  setInterval(function(){
    var r = uno('#pvl-bolsa-root');
    if (!r) return;
    if (!r.getAttribute('data-pintado')) { r.setAttribute('data-pintado', '1'); pintar(); return; }
    if (++n % 8 === 0) {
      cotizar();
      if (n % 64 === 0) comentario = (comentario + 1) % COMENTARIOS.length;
      pintar();
    }
  }, 500);
})();
