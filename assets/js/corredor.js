/* Carrera del Unicornio (pvl-cr-). Mismo candado de doble ejecucion que el
   resto de <helmet>. Un corredor infinito a la SNES en un <canvas> de 320x180
   escalado sin suavizado: Pavel cabalga el unicornio por el desierto, salta a
   los rivales y los cactus y recoge Grandezas. Todo dibujado en codigo salvo la
   cabeza de Pavel (assets/juego/pavel-cabeza.png), la misma de Super Pavel
   World. Sonido con Web Audio. Las teclas solo se capturan mientras la partida
   esta activa (clic en el lienzo o en "Jugar"); un clic fuera, Esc o cambiar de
   pestana la pausan. El record vive solo en el localStorage de este navegador. */
(function(){
  if (window.__pvlCorredor) return;
  window.__pvlCorredor = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function uno(sel){
    var els = doc.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  function t(o){ return o[lang()] || o.en; }
  var W = 320, H = 180, SUELO = 148;
  var KEY = 'pvl-corredor-record';
  function leerRecord(){ try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } }
  function guardarRecord(n){ try { localStorage.setItem(KEY, String(n)); } catch (e) {} }

  var cabeza = new Image();
  cabeza.src = 'assets/juego/pavel-cabeza.png';

  /* --- sonido --- */
  var ac = null, mudo = false;
  function audio(){
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  function bip(f1, f2, dur, tipo, vol){
    if (mudo) return;
    var a = audio(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain(), now = a.currentTime;
    o.type = tipo || 'square';
    o.frequency.setValueAtTime(f1, now);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + dur);
    g.gain.setValueAtTime(vol || .06, now);
    g.gain.exponentialRampToValueAtTime(.0005, now + dur);
    o.connect(g); g.connect(a.destination);
    o.start(now); o.stop(now + dur + .02);
  }

  /* --- estado --- */
  var J = { fase: 'titulo', activo: false, pausa: false, x: 0, vel: 2.2, py: 0, vy: 0, suelo: true, saltos: 0,
    obst: [], mon: [], puntos: 0, monedas: 0, record: leerRecord(), f: 0, sig: 60, sigM: 40, flash: 0 };
  function reiniciar(){
    J.fase = 'jugando'; J.pausa = false; J.x = 0; J.vel = 2.2; J.py = 0; J.vy = 0; J.suelo = true; J.saltos = 0;
    J.obst = []; J.mon = []; J.puntos = 0; J.monedas = 0; J.f = 0; J.sig = 70; J.sigM = 40;
  }
  function saltar(){
    if (J.fase !== 'jugando') { reiniciar(); bip(523, 784, .15, 'square', .05); return; }
    if (J.pausa) { J.pausa = false; return; }
    if (J.saltos < 2) { J.vy = J.saltos ? -4.4 : -5.2; J.suelo = false; J.saltos++; bip(J.saltos === 1 ? 392 : 523, J.saltos === 1 ? 660 : 880, .12); }
  }

  /* --- logica --- */
  function paso(){
    if (J.fase !== 'jugando' || J.pausa) return;
    J.f++;
    J.vel = Math.min(5.2, 2.2 + J.f / 1400);
    J.x += J.vel;
    J.puntos = Math.floor(J.x / 6) + J.monedas * 10;
    J.vy += .28; J.py += J.vy;
    if (J.py >= 0) { J.py = 0; J.vy = 0; J.suelo = true; J.saltos = 0; }
    if (--J.sig <= 0) {
      var tipos = ['rival', 'cactus', 'critico'];
      var tp = tipos[Math.floor(Math.random() * (J.f > 600 ? 3 : 2))];
      J.obst.push({ t: tp, x: W + 10, w: tp === 'cactus' ? 10 : 12, h: tp === 'cactus' ? 18 : tp === 'critico' ? 20 : 14, vuela: tp === 'critico' && Math.random() < .5 });
      J.sig = Math.max(34, 90 - J.f / 60) + Math.random() * 60;
    }
    if (--J.sigM <= 0) {
      var alto = Math.random() < .5 ? 20 : 48;
      for (var k = 0; k < 3; k++) J.mon.push({ x: W + 10 + k * 14, y: SUELO - alto - 8, v: true });
      J.sigM = 70 + Math.random() * 90;
    }
    var px = 64, py = SUELO + J.py;
    J.obst.forEach(function(o){ o.x -= J.vel; });
    J.mon.forEach(function(m){ m.x -= J.vel; });
    J.obst = J.obst.filter(function(o){ return o.x > -30; });
    J.mon = J.mon.filter(function(m){ return m.x > -10 && m.v; });
    /* colisiones: caja del jinete 22x24 aprox. */
    for (var i = 0; i < J.obst.length; i++) {
      var o = J.obst[i], oy = o.vuela ? SUELO - 34 : SUELO - o.h;
      if (px + 10 > o.x && px - 10 < o.x + o.w && py - 4 > oy && py - 26 < oy + o.h) { morir(); return; }
    }
    J.mon.forEach(function(m){
      if (m.v && Math.abs(m.x - px) < 12 && Math.abs(m.y - (py - 16)) < 16) { m.v = false; J.monedas++; bip(988, 1319, .08, 'square', .04); }
    });
  }
  function morir(){
    J.fase = 'fin'; J.flash = 10;
    bip(330, 110, .45, 'sawtooth', .07);
    if (J.puntos > J.record) { J.record = J.puntos; guardarRecord(J.record); J.nuevo = true; } else J.nuevo = false;
  }

  /* --- dibujo --- */
  function rect(c, x, y, w, h, col){ c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); }
  function fondo(c){
    var g = c.createLinearGradient(0, 0, 0, SUELO);
    g.addColorStop(0, '#140a33'); g.addColorStop(.6, '#3a1d6e'); g.addColorStop(1, '#c4559a');
    c.fillStyle = g; c.fillRect(0, 0, W, SUELO);
    for (var i = 0; i < 26; i++) { var sx = ((i * 53) - J.x * .05) % W; if (sx < 0) sx += W; rect(c, sx, (i * 37) % 70, 1, 1, i % 3 ? '#f4efe2' : '#86e7ea'); }
    /* sol */
    c.fillStyle = '#e9c874'; c.beginPath(); c.arc(250, 96, 22, 0, Math.PI * 2); c.fill();
    /* montes lejanos (Non Plus Ultra) */
    c.fillStyle = '#2a1650';
    for (var m = -1; m < 5; m++) {
      var mx = m * 110 - (J.x * .2) % 110;
      c.beginPath(); c.moveTo(mx, SUELO); c.lineTo(mx + 55, SUELO - 58 - (m & 1) * 18); c.lineTo(mx + 110, SUELO); c.fill();
    }
    /* dunas */
    c.fillStyle = '#d69a5a';
    for (var d = -1; d < 6; d++) {
      var dx = d * 80 - (J.x * .5) % 80;
      c.beginPath(); c.moveTo(dx, SUELO); c.quadraticCurveTo(dx + 40, SUELO - 16, dx + 80, SUELO); c.fill();
    }
    rect(c, 0, SUELO, W, H - SUELO, '#e3b06b');
    rect(c, 0, SUELO, W, 2, '#f4d9a0');
    for (var s = 0; s < 18; s++) { var gx = (s * 23 - J.x) % W; if (gx < 0) gx += W; rect(c, gx, SUELO + 8 + (s % 3) * 7, 3, 1, '#b8823e'); }
    /* el Buc-ee's al fondo, de vez en cuando */
    var bx = 560 - (J.x * .5) % 900;
    if (bx > -60 && bx < W) { rect(c, bx, SUELO - 26, 50, 26, '#c62828'); rect(c, bx - 2, SUELO - 30, 54, 5, '#f2c200'); c.fillStyle = '#1a1030'; c.font = '7px monospace'; c.fillText("BUC-EE'S", bx + 6, SUELO - 14); }
  }
  function jinete(c){
    var x = 64, y = SUELO + J.py, galope = J.suelo && J.fase === 'jugando' ? Math.floor(J.f / 5) % 2 : 0;
    /* unicornio */
    rect(c, x - 14, y - 16, 26, 10, '#f4efe2');          /* cuerpo */
    rect(c, x + 8, y - 24, 8, 10, '#f4efe2');             /* cuello */
    rect(c, x + 12, y - 28, 10, 7, '#f4efe2');            /* cabeza */
    rect(c, x + 18, y - 33, 2, 6, '#e9c874');             /* cuerno */
    rect(c, x + 20, y - 36, 1, 3, '#e9c874');
    rect(c, x + 17, y - 26, 2, 2, '#1b1150');             /* ojo */
    rect(c, x + 6, y - 26, 3, 12, '#f2a9dc');              /* crin */
    rect(c, x + 4, y - 22, 3, 8, '#86e7ea');
    rect(c, x - 18, y - 16, 5, 3, '#f2a9dc');              /* cola */
    rect(c, x - 20, y - 14, 4, 3, '#86e7ea');
    var p1 = galope ? 2 : 0;
    rect(c, x - 12, y - 6, 3, 6 - p1, '#f4efe2'); rect(c, x - 5, y - 6, 3, 6 - (2 - p1), '#f4efe2');
    rect(c, x + 3, y - 6, 3, 6 - p1, '#f4efe2'); rect(c, x + 9, y - 6, 3, 6 - (2 - p1), '#f4efe2');
    /* Pavel: capa violeta y la cabeza de verdad */
    rect(c, x - 6, y - 28, 10, 12, '#5b2a86');
    rect(c, x - 9, y - 26, 4, 10, '#d8b25c');
    if (cabeza.complete && cabeza.naturalWidth) c.drawImage(cabeza, x - 9, y - 44, 16, 16);
    else rect(c, x - 6, y - 40, 10, 10, '#c98a5c');
    /* corona */
    rect(c, x - 6, y - 47, 10, 3, '#e9c874'); rect(c, x - 6, y - 50, 2, 3, '#e9c874'); rect(c, x - 2, y - 51, 2, 4, '#e9c874'); rect(c, x + 2, y - 50, 2, 3, '#e9c874');
  }
  function obstaculo(c, o){
    var y = o.vuela ? SUELO - 34 : SUELO - o.h, pasoA = Math.floor(J.f / 8) % 2;
    if (o.t === 'cactus') { rect(c, o.x + 3, y, 4, o.h, '#3f8f4a'); rect(c, o.x, y + 5, 3, 6, '#3f8f4a'); rect(c, o.x + 7, y + 3, 3, 6, '#3f8f4a'); }
    else if (o.t === 'rival') { rect(c, o.x, y + 3, 12, 9, '#6d6a80'); rect(c, o.x + 2, y, 8, 5, '#8c89a0'); rect(c, o.x + 3, y + 1, 2, 2, '#fff'); rect(c, o.x + 1 + pasoA * 6, y + 12, 3, 2, '#3b3950'); }
    else { /* critico con pancarta */ rect(c, o.x + 3, y + 6, 6, 12, '#3b3950'); rect(c, o.x + 4, y + 1, 4, 5, '#c98a5c'); rect(c, o.x - 3, y - 6 + pasoA, 16, 7, '#f4efe2'); rect(c, o.x + 5, y + 1 + pasoA, 1, 6, '#6b4226'); c.fillStyle = '#b3263a'; c.font = '6px monospace'; c.fillText('BOO', o.x - 2, y + pasoA); }
  }
  function moneda(c, m){
    var a = Math.abs(Math.sin((J.f + m.x) / 8));
    c.fillStyle = '#e9c874'; c.fillRect(Math.round(m.x - 3 * a), m.y - 4, Math.max(1, Math.round(6 * a)), 8);
    c.fillStyle = '#8f6f2a'; if (a > .5) c.fillRect(Math.round(m.x) - 1, m.y - 2, 1, 4);
  }
  function hud(c){
    c.fillStyle = 'rgba(11,6,32,.55)'; c.fillRect(0, 0, W, 14);
    c.fillStyle = '#f4efe2'; c.font = '8px monospace';
    c.fillText((lang() === 'es' ? 'GRANDEZA ' : 'GREATNESS ') + String(J.puntos).padStart(5, '0'), 6, 10);
    c.fillStyle = '#e9c874'; c.fillText('G×' + J.monedas, 132, 10);
    c.fillStyle = '#86e7ea'; c.fillText((lang() === 'es' ? 'RÉCORD ' : 'BEST ') + String(J.record).padStart(5, '0'), 220, 10);
  }
  function cartel(c, l1, l2, l3){
    c.fillStyle = 'rgba(11,6,32,.78)'; c.fillRect(40, 44, 240, 76);
    c.strokeStyle = '#d8b25c'; c.strokeRect(40.5, 44.5, 239, 75);
    c.textAlign = 'center';
    c.fillStyle = '#e9c874'; c.font = 'bold 12px monospace'; c.fillText(l1, W / 2, 66);
    c.fillStyle = '#f4efe2'; c.font = '8px monospace'; c.fillText(l2, W / 2, 86);
    if (l3) { c.fillStyle = '#f2a9dc'; c.fillText(l3, W / 2, 104); }
    c.textAlign = 'left';
  }
  function dibujar(){
    var cv = uno('#pvl-cr-canvas');
    if (!cv) return;
    var c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;
    fondo(c);
    J.mon.forEach(function(m){ if (m.v) moneda(c, m); });
    J.obst.forEach(function(o){ obstaculo(c, o); });
    jinete(c);
    hud(c);
    var l = lang();
    if (J.fase === 'titulo') cartel(c, l === 'es' ? 'CARRERA DEL UNICORNIO' : 'UNICORN RUNNER', l === 'es' ? 'ESPACIO / TOQUE: SALTAR (DOBLE SALTO)' : 'SPACE / TAP: JUMP (DOUBLE JUMP)', l === 'es' ? 'PULSE PARA EMPEZAR' : 'PRESS TO START');
    else if (J.fase === 'fin') cartel(c, l === 'es' ? '¡LOS RIVALES TE ALCANZARON!' : 'THE RIVALS CAUGHT UP!', (l === 'es' ? 'GRANDEZA: ' : 'GREATNESS: ') + J.puntos + (J.nuevo ? (l === 'es' ? ' · ¡NUEVO RÉCORD!' : ' · NEW RECORD!') : ''), l === 'es' ? 'PULSE PARA VOLVER A CABALGAR' : 'PRESS TO RIDE AGAIN');
    else if (J.pausa) cartel(c, l === 'es' ? 'PAUSA' : 'PAUSED', l === 'es' ? 'PULSE PARA SEGUIR' : 'PRESS TO CONTINUE');
    if (J.flash > 0) { c.fillStyle = 'rgba(255,255,255,' + (J.flash / 14) + ')'; c.fillRect(0, 0, W, H); J.flash--; }
  }
  function bucle(){
    paso(); dibujar();
    requestAnimationFrame(bucle);
  }
  requestAnimationFrame(bucle);

  /* --- control --- */
  function activar(){
    J.activo = true; audio();
    var w = uno('#pvl-cr-wrap'); if (w) w.classList.add('pvl-cr-activo');
  }
  function desactivar(){
    J.activo = false;
    if (J.fase === 'jugando') J.pausa = true;
    var w = uno('#pvl-cr-wrap'); if (w) w.classList.remove('pvl-cr-activo');
  }
  doc.addEventListener('pointerdown', function(e){
    var t0 = e.target;
    if (t0.closest && t0.closest('#pvl-cr-mudo')) return;
    if (t0.closest && (t0.closest('#pvl-cr-canvas') || t0.closest('#pvl-cr-jugar'))) { e.preventDefault(); activar(); saltar(); return; }
    if (J.activo && !(t0.closest && t0.closest('#pvl-cr-wrap'))) desactivar();
  });
  doc.addEventListener('click', function(e){
    if (e.target.closest && e.target.closest('#pvl-cr-mudo')) {
      mudo = !mudo;
      var b = uno('#pvl-cr-mudo'); if (b) b.setAttribute('aria-pressed', mudo ? 'true' : 'false');
    }
  });
  doc.addEventListener('keydown', function(e){
    if (!J.activo) return;
    if (e.key === 'Escape') { desactivar(); return; }
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'Enter') { e.preventDefault(); saltar(); }
    else if (e.key === 'p' || e.key === 'P') { if (J.fase === 'jugando') J.pausa = !J.pausa; }
  });
  doc.addEventListener('visibilitychange', function(){ if (doc.hidden && J.fase === 'jugando') J.pausa = true; });
})();
