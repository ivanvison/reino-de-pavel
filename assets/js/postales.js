/* Estudio de Postales Reales (pvl-pos-). Mismo candado de doble ejecucion que
   el resto de <helmet>. El visitante elige un paisaje de Pavelandia (los mismos
   lugares del mapa), el saludo y un mensaje; anverso y reverso se dibujan en
   dos <canvas> en vivo y se descargan juntos como PNG con window.PavelLienzo.
   Nada sale del navegador: la postal no se envia, se "envia". */
(function(){
  if (window.__pvlPostales) return;
  window.__pvlPostales = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function uno(sel){
    var els = doc.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  function peregrino(){
    var m = doc.cookie.match(/(?:^|; )pavelense=([^;]*)/);
    if (m) { try { return decodeURIComponent(m[1]).trim(); } catch (e) { return String(m[1] || '').trim(); } }
    try { return (localStorage.getItem('pavelense') || '').trim(); } catch (e) { return ''; }
  }
  var W = 1200, H = 800;
  var LUGARES = {
    palacio: { es: 'Plaza del Palacio, Pavelópolis', en: 'Palace Square, Pavelópolis' },
    bucees: { es: 'El Buc-ee’s del Desierto', en: 'The Desert Buc-ee’s' },
    cumbre: { es: 'Cumbre del Non Plus Ultra, 8.849 m', en: 'Non Plus Ultra Summit, 8,849 m' },
    lago: { es: 'Orillas del Lago Iridiscente', en: 'Shores of Lake Iridescent' },
    puerto: { es: 'El Puerto Real', en: 'The Royal Port' }
  };

  /* --- paisajes --- */
  function cielo(c, a, b, hz){
    var g = c.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, a); g.addColorStop(1, b);
    c.fillStyle = g; c.fillRect(0, 0, W, hz);
  }
  function sol(c, x, y, r, col){ var g = c.createRadialGradient(x, y, 0, x, y, r * 3); g.addColorStop(0, col); g.addColorStop(.3, col); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 3, 0, Math.PI * 2); c.fill(); }
  function nube(c, x, y, s){ c.fillStyle = 'rgba(255,255,255,.85)'; [[0, 0, 40], [40, -14, 50], [90, 0, 38], [45, 10, 44]].forEach(function(p){ c.beginPath(); c.arc(x + p[0] * s, y + p[1] * s, p[2] * s, 0, Math.PI * 2); c.fill(); }); }
  function montes(c, base, col, picos){
    c.fillStyle = col; c.beginPath(); c.moveTo(0, base);
    picos.forEach(function(p){ c.lineTo(p[0], p[1]); }); c.lineTo(W, base); c.closePath(); c.fill();
  }
  function palacio(c){
    cielo(c, '#5b8fd6', '#f7d9b0', 560); sol(c, 960, 170, 46, 'rgba(255,236,170,1)');
    nube(c, 140, 150, 1); nube(c, 640, 110, .8);
    montes(c, 560, '#8aa3c9', [[0, 470], [180, 380], [360, 460], [560, 360], [800, 450], [1000, 380], [1200, 450]]);
    c.fillStyle = '#e8dcc4'; c.fillRect(0, 560, W, 240);
    c.fillStyle = '#d2c3a5'; for (var i = 0; i < 14; i++) c.fillRect(i * 90, 600 + (i % 2) * 30, 60, 6);
    /* palacio */
    c.fillStyle = '#f4efe2'; c.fillRect(380, 360, 440, 220);
    c.fillStyle = '#d8b25c'; c.fillRect(380, 350, 440, 14);
    c.fillStyle = '#f4efe2'; c.beginPath(); c.arc(600, 330, 90, Math.PI, 0); c.fill();
    c.fillStyle = '#d8b25c'; c.beginPath(); c.arc(600, 330, 90, Math.PI, 0); c.lineTo(690, 330); c.fill();
    c.fillStyle = '#f2a9dc'; c.fillRect(596, 200, 8, 50);
    c.fillStyle = '#86e7ea'; c.beginPath(); c.moveTo(604, 200); c.lineTo(650, 214); c.lineTo(604, 228); c.fill();
    for (var k = 0; k < 7; k++) { c.fillStyle = '#5b2a86'; c.fillRect(405 + k * 60, 410, 26, 60); c.fillStyle = '#d8b25c'; c.fillRect(400 + k * 60, 480, 36, 8); }
    c.fillStyle = '#5b2a86'; c.fillRect(570, 490, 60, 90);
    /* estatua del unicornio */
    c.fillStyle = '#d8b25c'; c.fillRect(250, 560, 60, 60); c.fillRect(890, 560, 60, 60);
    c.fillStyle = '#f4efe2'; c.beginPath(); c.ellipse(280, 535, 30, 18, 0, 0, Math.PI * 2); c.fill(); c.fillRect(296, 500, 12, 30); c.fillStyle = '#e9c874'; c.fillRect(304, 482, 4, 20);
  }
  function bucees(c){
    cielo(c, '#2b7bd6', '#ffd38a', 540); sol(c, 220, 160, 52, 'rgba(255,240,180,1)');
    c.fillStyle = '#e8b06a'; c.fillRect(0, 540, W, 260);
    c.fillStyle = '#d69a5a'; for (var d = 0; d < 6; d++) { c.beginPath(); c.moveTo(d * 240 - 60, 560); c.quadraticCurveTo(d * 240 + 60, 500, d * 240 + 180, 560); c.fill(); }
    c.fillStyle = '#c62828'; c.fillRect(300, 330, 640, 230);
    c.fillStyle = '#f2c200'; c.fillRect(280, 300, 680, 44);
    c.fillStyle = '#7a0f0f'; for (var i = 0; i < 9; i++) c.fillRect(330 + i * 68, 400, 44, 100);
    /* poste con el castor, a la derecha para no tapar el rotulo */
    c.fillStyle = '#7a0f0f'; c.fillRect(1046, 300, 12, 260);
    c.fillStyle = '#f2c200'; c.beginPath(); c.arc(1052, 250, 62, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#7a4a1e'; c.beginPath(); c.ellipse(1052, 262, 32, 26, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(1052, 230, 20, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.fillRect(1045, 238, 14, 9);
    c.fillStyle = '#1a1030'; c.font = "800 44px 'IBM Plex Sans', sans-serif"; c.textAlign = 'center'; c.fillText("BUC-EE'S", 620, 336);
    /* surtidores */
    for (var p = 0; p < 5; p++) { c.fillStyle = '#f4efe2'; c.fillRect(120 + p * 220, 620, 30, 70); c.fillStyle = '#c62828'; c.fillRect(120 + p * 220, 620, 30, 18); }
    c.fillStyle = '#3f8f4a'; c.fillRect(160, 470, 18, 90); c.fillRect(140, 500, 16, 30); c.fillRect(180, 490, 16, 34);
  }
  function cumbre(c){
    cielo(c, '#1b1150', '#86c5f0', 620);
    c.fillStyle = 'rgba(255,255,255,.8)'; for (var s = 0; s < 40; s++) c.fillRect((s * 137) % W, (s * 71) % 260, 2, 2);
    montes(c, 800, '#5a6c9a', [[0, 560], [200, 420], [380, 520], [600, 160], [820, 520], [1000, 400], [1200, 560]]);
    c.fillStyle = '#f4f7ff'; c.beginPath(); c.moveTo(600, 160); c.lineTo(690, 300); c.lineTo(640, 290); c.lineTo(600, 330); c.lineTo(560, 290); c.lineTo(515, 300); c.closePath(); c.fill();
    montes(c, 800, '#3a4670', [[0, 700], [260, 600], [520, 690], [760, 610], [1000, 680], [1200, 620]]);
    c.fillStyle = '#d8b25c'; c.fillRect(598, 110, 4, 52);
    c.fillStyle = '#f2a9dc'; c.beginPath(); c.moveTo(602, 110); c.lineTo(650, 124); c.lineTo(602, 138); c.fill();
    c.fillStyle = 'rgba(255,255,255,.75)'; c.font = "600 26px 'IBM Plex Mono', monospace"; c.textAlign = 'center'; c.fillText('8.849 m', 600, 96);
  }
  function lago(c){
    cielo(c, '#f2a9dc', '#ffe6b3', 440); sol(c, 600, 380, 60, 'rgba(255,230,160,1)');
    montes(c, 440, '#6d5aa8', [[0, 360], [200, 300], [420, 380], [640, 290], [880, 370], [1080, 300], [1200, 350]]);
    var g = c.createLinearGradient(0, 440, W, 800);
    g.addColorStop(0, '#86e7ea'); g.addColorStop(.5, '#f2a9dc'); g.addColorStop(1, '#e9c874');
    c.fillStyle = g; c.fillRect(0, 440, W, 360);
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3;
    for (var w = 0; w < 10; w++) { c.beginPath(); var y = 470 + w * 32; for (var x = 0; x <= W; x += 40) c.lineTo(x, y + Math.sin((x + w * 50) / 60) * 5); c.stroke(); }
    c.fillStyle = 'rgba(255,240,190,.5)'; c.fillRect(560, 440, 80, 360);
    /* unicornio bebiendo */
    c.fillStyle = '#f4efe2'; c.beginPath(); c.ellipse(260, 430, 70, 30, 0, 0, Math.PI * 2); c.fill();
    c.fillRect(200, 440, 12, 40); c.fillRect(230, 440, 12, 40); c.fillRect(290, 440, 12, 40); c.fillRect(310, 440, 12, 40);
    c.beginPath(); c.moveTo(310, 420); c.lineTo(360, 460); c.lineTo(345, 470); c.lineTo(300, 440); c.fill();
    c.fillStyle = '#e9c874'; c.beginPath(); c.moveTo(352, 452); c.lineTo(392, 430); c.lineTo(356, 462); c.fill();
    c.fillStyle = '#f2a9dc'; c.fillRect(190, 410, 14, 30);
  }
  function puerto(c){
    cielo(c, '#ffb38a', '#ffe1b8', 470); sol(c, 900, 420, 70, 'rgba(255,200,140,1)');
    c.fillStyle = '#2a5d8f'; c.fillRect(0, 470, W, 330);
    c.fillStyle = 'rgba(255,210,150,.55)'; for (var r = 0; r < 12; r++) c.fillRect(840 + (r % 3) * 30, 490 + r * 24, 120 - r * 6, 4);
    /* faro */
    c.fillStyle = '#f4efe2'; c.beginPath(); c.moveTo(150, 470); c.lineTo(180, 230); c.lineTo(230, 230); c.lineTo(260, 470); c.fill();
    c.fillStyle = '#c62828'; c.fillRect(170, 300, 70, 30); c.fillRect(165, 390, 80, 30);
    c.fillStyle = '#e9c874'; c.fillRect(185, 200, 40, 32);
    c.fillStyle = 'rgba(255,240,180,.35)'; c.beginPath(); c.moveTo(205, 214); c.lineTo(520, 150); c.lineTo(520, 280); c.fill();
    /* velero real */
    c.fillStyle = '#5b2a86'; c.beginPath(); c.moveTo(480, 560); c.lineTo(760, 560); c.lineTo(720, 610); c.lineTo(520, 610); c.fill();
    c.fillStyle = '#d8b25c'; c.fillRect(616, 330, 8, 232);
    c.fillStyle = '#f4efe2'; c.beginPath(); c.moveTo(624, 340); c.lineTo(740, 540); c.lineTo(624, 540); c.fill();
    c.fillStyle = '#86e7ea'; c.beginPath(); c.moveTo(616, 360); c.lineTo(520, 540); c.lineTo(616, 540); c.fill();
    c.fillStyle = '#f2a9dc'; c.beginPath(); c.moveTo(624, 330); c.lineTo(670, 344); c.lineTo(624, 358); c.fill();
    c.fillStyle = '#1b3a5c'; c.fillRect(980, 440, 220, 40);
  }
  var PINTORES = { palacio: palacio, bucees: bucees, cumbre: cumbre, lago: lago, puerto: puerto };

  function estado(){
    var f = uno('#pvl-pos-form'), e = { lugar: 'palacio', saludo: 'es', msg: '', para: '', de: '' };
    if (!f) return e;
    var r = f.querySelector('input[name="pvl-pos-lugar"]:checked'); if (r) e.lugar = r.value;
    var s = f.querySelector('input[name="pvl-pos-saludo"]:checked'); if (s) e.saludo = s.value;
    e.msg = (f.querySelector('#pvl-pos-msg') || {}).value || '';
    e.para = (f.querySelector('#pvl-pos-para') || {}).value || '';
    e.de = (f.querySelector('#pvl-pos-de') || {}).value || '';
    return e;
  }
  function anverso(c, e){
    c.save(); (PINTORES[e.lugar] || palacio)(c); c.restore();
    /* rotulo "Saludos desde Pavelandia" */
    var g = c.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#f4e0a8'); g.addColorStop(.4, '#d8b25c'); g.addColorStop(.7, '#f2a9dc'); g.addColorStop(1, '#86e7ea');
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.font = "italic 700 54px 'Bodoni Moda', Georgia, serif";
    c.lineWidth = 10; c.strokeStyle = 'rgba(27,17,80,.85)';
    var l1 = e.saludo === 'es' ? '¡Saludos desde' : 'Greetings from';
    c.strokeText(l1, 60, 110); c.fillStyle = '#fff'; c.fillText(l1, 60, 110);
    c.font = "900 128px 'Bodoni Moda', Georgia, serif";
    c.strokeText(e.saludo === 'es' ? 'Pavelandia!' : 'Pavelandia!', 52, 230); c.fillStyle = g; c.fillText('Pavelandia!', 52, 230);
    c.fillStyle = 'rgba(27,17,80,.75)'; c.fillRect(0, H - 56, W, 56);
    c.fillStyle = '#f4efe2'; c.font = "500 22px 'IBM Plex Mono', monospace";
    c.fillText(LUGARES[e.lugar][e.saludo].toUpperCase(), 40, H - 20);
    c.strokeStyle = '#fff'; c.lineWidth = 16; c.strokeRect(0, 0, W, H);
  }
  function reverso(c, e){
    var Lz = window.PavelLienzo;
    c.fillStyle = '#fbf6ea'; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(143,111,42,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(640, 80); c.lineTo(640, 720); c.stroke();
    c.fillStyle = '#8f6f2a'; c.font = "600 18px 'IBM Plex Mono', monospace"; c.textAlign = 'left';
    c.fillText(e.saludo === 'es' ? 'TARJETA POSTAL · CORREOS REALES DE PAVELANDIA' : 'POST CARD · ROYAL MAIL OF PAVELANDIA', 60, 60);
    c.fillStyle = '#201a33'; c.font = "italic 400 32px 'Bodoni Moda', Georgia, serif";
    var msg = (e.msg || (e.saludo === 'es' ? 'Ojalá estuvieras aquí. Bueno, no: ojalá fueras tan grande como esto. Un abrazo desde el Reino.' : 'Wish you were here. Well, no: wish you were this great. A hug from the Kingdom.')).slice(0, 220);
    var y = Lz ? Lz.envolver(c, msg, 60, 150, 540, 46) : 150;
    c.font = "italic 700 34px 'Bodoni Moda', Georgia, serif"; c.fillStyle = '#5b2a86';
    c.fillText('— ' + (e.de || peregrino() || (e.saludo === 'es' ? 'un peregrino' : 'a pilgrim')), 60, Math.min(y + 80, 700));
    /* sello de 5 G */
    c.save(); c.translate(1000, 90);
    c.fillStyle = '#fff'; c.fillRect(0, 0, 140, 170);
    c.fillStyle = '#1b1150'; c.fillRect(10, 10, 120, 150);
    c.fillStyle = '#d8b25c'; c.font = "900 64px 'Bodoni Moda', Georgia, serif"; c.textAlign = 'center'; c.fillText('5', 70, 92);
    c.font = "700 20px 'Bodoni Moda', Georgia, serif"; c.fillText('GRANDEZAS', 70, 122);
    c.fillStyle = '#f2a9dc'; c.font = "500 11px 'IBM Plex Mono', monospace"; c.fillText('REINO DE PAVEL', 70, 146);
    c.strokeStyle = '#fbf6ea'; c.setLineDash([6, 6]); c.lineWidth = 4; c.strokeRect(2, 2, 136, 166); c.setLineDash([]);
    c.restore();
    /* matasellos */
    c.save(); c.translate(900, 200); c.rotate(-.2);
    c.strokeStyle = 'rgba(158,31,51,.75)'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 70, 0, Math.PI * 2); c.stroke();
    c.fillStyle = 'rgba(158,31,51,.75)'; c.textAlign = 'center'; c.font = "700 16px 'IBM Plex Mono', monospace";
    c.fillText('PAVELÓPOLIS', 0, -12);
    c.font = "600 14px 'IBM Plex Mono', monospace";
    c.fillText(new Date().toLocaleDateString(e.saludo === 'es' ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short' }).toUpperCase(), 0, 12);
    c.fillText(e.saludo === 'es' ? 'AÑO 0' : 'YEAR 0', 0, 34);
    for (var w = 0; w < 5; w++) { c.beginPath(); for (var x = 80; x < 300; x += 10) c.lineTo(x, -40 + w * 20 + Math.sin(x / 14) * 6); c.stroke(); }
    c.restore();
    /* direccion */
    c.textAlign = 'left'; c.strokeStyle = 'rgba(32,26,51,.35)'; c.lineWidth = 2;
    for (var l = 0; l < 4; l++) { c.beginPath(); c.moveTo(700, 440 + l * 70); c.lineTo(1140, 440 + l * 70); c.stroke(); }
    c.fillStyle = '#201a33'; c.font = "italic 400 32px 'Bodoni Moda', Georgia, serif";
    c.fillText((e.para || (e.saludo === 'es' ? 'Para quien más lo necesite' : 'To whoever needs it most')).slice(0, 30), 704, 430);
    c.font = "400 26px 'Bodoni Moda', Georgia, serif";
    c.fillText(e.saludo === 'es' ? 'Fuera del Reino (por ahora)' : 'Outside the Kingdom (for now)', 704, 500);
    c.fillText(e.saludo === 'es' ? 'Planeta Tierra' : 'Planet Earth', 704, 570);
    c.font = "600 22px 'IBM Plex Mono', monospace"; c.fillText('CP 00000', 704, 640);
  }
  function pintar(){
    var a = uno('#pvl-pos-anverso'), b = uno('#pvl-pos-reverso');
    if (!a || !b) return;
    var e = estado(), clave = JSON.stringify(e);
    if (a.getAttribute('data-k') === clave) return;
    var go = function(){ anverso(a.getContext('2d'), e); reverso(b.getContext('2d'), e); a.setAttribute('data-k', clave); };
    if (window.PavelLienzo) window.PavelLienzo.conFuentes(go); else go();
  }
  function descargar(){
    var Lz = window.PavelLienzo; if (!Lz) return;
    var e = estado();
    Lz.conFuentes(function(){
      var c = Lz.nuevo(W, H * 2 + 40), x = c.getContext('2d');
      x.fillStyle = '#0b0620'; x.fillRect(0, 0, W, H * 2 + 40);
      x.save(); anverso(x, e); x.restore();
      x.save(); x.translate(0, H + 40); reverso(x, e); x.restore();
      Lz.descargar(c, (e.saludo === 'es' ? 'postal-pavelandia-' : 'postcard-pavelandia-') + e.lugar + '.png');
    });
  }
  /* radios: la plantilla pierde checked al montarse */
  function defectos(){
    var f = uno('#pvl-pos-form'); if (!f) return;
    if (!f.querySelector('input[name="pvl-pos-lugar"]:checked')) { var r = f.querySelector('input[name="pvl-pos-lugar"][value="palacio"]'); if (r) r.checked = true; }
    if (!f.querySelector('input[name="pvl-pos-saludo"]:checked')) { var s = f.querySelector('input[name="pvl-pos-saludo"][value="' + lang() + '"]'); if (s) s.checked = true; }
    var de = f.querySelector('#pvl-pos-de');
    if (de && !de.getAttribute('data-pvl-rellenado')) { de.setAttribute('data-pvl-rellenado', '1'); if (!de.value) de.value = peregrino(); }
  }
  doc.addEventListener('input', function(e){ if (e.target.closest && e.target.closest('#pvl-pos-form')) pintar(); });
  doc.addEventListener('change', function(e){ if (e.target.closest && e.target.closest('#pvl-pos-form')) pintar(); });
  doc.addEventListener('submit', function(e){ if (e.target && e.target.id === 'pvl-pos-form') { e.preventDefault(); descargar(); } });
  setInterval(function(){ defectos(); pintar(); }, 400);
})();
