/* Super Pavel World (pvl-sp-). Mismo candado de doble ejecucion que el resto
   de <helmet>. Un plataformas a la SNES en un <canvas>: buffer de 320x180
   escalado sin suavizado, baldosas de 16 px, paso fijo de 60 Hz. Todo se
   dibuja en codigo salvo la cabeza de Pavel (assets/juego/pavel-cabeza.png).
   Las teclas solo se capturan con el juego en marcha y enfocado, asi que la
   pagina sigue desplazandose con normalidad; se pausa solo al salir de la
   vista. Al empezar, pausa el himno. El record se guarda en localStorage. */
(function(){
  if (window.__pvlSuperPavel) return;
  window.__pvlSuperPavel = true;
  var doc = document;
  var GW = 320, GH = 180, T = 16;
  function L(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function tx(o){ return o[L()] || o.en; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }

  /* ---------- Sprites en codigo ---------- */
  function sprite(rows, pal){
    var c = doc.createElement('canvas'); c.width = rows[0].length; c.height = rows.length;
    var x = c.getContext('2d');
    for (var y = 0; y < rows.length; y++) for (var i = 0; i < rows[y].length; i++) {
      var ch = rows[y][i]; if (ch === '.' || !pal[ch]) continue;
      x.fillStyle = pal[ch]; x.fillRect(i, y, 1, 1);
    }
    return c;
  }
  var PU = { w: '#ffffff', s: '#cfcbe0', p: '#f2a9dc', q: '#86e7ea', y: '#e9c874', k: '#201a33', o: '#8f6f2a' };
  var UNI_TOP = [
    '...........y....',
    '..........yy....',
    '.........pww....',
    '........pqwwk...',
    '........pwwwwww.',
    '.pq....pwwwwwww.',
    'pqpwwwwwwwwws...',
    'qp.wwwwwwwwww...',
    '...wwwwwwwwws...'
  ];
  var PATAS = [
    ['...ww.ss..ww....', '...ww......ww...', '...oo......oo...'],
    ['...ww.ss.ww.....', '....ww...ww.....', '....oo....oo....'],
    ['..ww..ss...ww...', '.ww.........ww..', '.o...........o..']
  ];
  var SPR = {};
  function crearSprites(){
    SPR.uni = PATAS.map(function(p){ return sprite(UNI_TOP.concat(p), PU); });
    var PIr = { w: '#ffffff', s: '#cfcbe0', p: '#f2a9dc', q: '#e9c874', y: '#e9c874', k: '#201a33', o: '#8f6f2a' };
    SPR.uniIri = PATAS.map(function(p){ return sprite(UNI_TOP.concat(p), PIr); });
    var PR = { k: '#201a33', g: '#8a8494', d: '#6b6576', w: '#ffffff', o: '#4a3e22', r: '#d8443a' };
    SPR.rival = [
      sprite(['....kkkkkkkk....', '..kkggggggggkk..', '.kggggggggggggk.', 'kggkkggggggkkggk', 'kgggwkggggkwgggk', 'kgggwkggggkwgggk', 'kggggggggggggggk', '.kgggkkkkkkgggk.', '..kgggggggggk...', '...kkkkkkkkkk...', '..ooo......ooo..', '.oooo......oooo.'], PR),
      sprite(['....kkkkkkkk....', '..kkggggggggkk..', '.kggggggggggggk.', 'kggkkggggggkkggk', 'kgggwkggggkwgggk', 'kgggwkggggkwgggk', 'kggggggggggggggk', '.kgggkkkkkkgggk.', '...kgggggggggk..', '...kkkkkkkkkk...', '.ooo......ooo...', 'oooo......oooo..'], PR)
    ];
    SPR.rivalPlano = sprite(['................', '..kkkkkkkkkkkk..', '.kggkkggggkkggk.', 'kggggggggggggggk', '.kkkkkkkkkkkkkk.'], PR);
    var PC = { k: '#201a33', n: '#f4efe2', l: '#8a8494', h: '#2a1a63', f: '#e9c874', o: '#4a3e22', w: '#fff' };
    SPR.critico = [
      sprite(['.........hh.....', '........hwhh....', '........hkhh....', '..nnnnnnhhhh....', '.nlnlnlnnhh.....', 'nnnnnnnnnn......', 'nlnlnlnlnn......', 'nnnnnnnnnn......', '.nnnnnnnn.......', '..f..f..........', '.ff.ff..........'], PC),
      sprite(['.........hh.....', '........hwhh....', '........hkhh....', '..nnnnnnhhhh....', '.nlnlnlnnhh.....', 'nnnnnnnnnn......', 'nlnlnlnlnn......', 'nnnnnnnnnn......', '.nnnnnnnn.......', '...f..f.........', '..ff.ff.........'], PC)
    ];
    SPR.concha = sprite(['..nnnnnnnn..', '.nlnlnlnlnn.', 'nnnnnnnnnnnn', 'nlnlnlnlnlnn', 'nnnnnnnnnnnn', '.nlnlnlnlnn.', '..nnnnnnnn..'], PC);
    var PD = { p: '#f2a9dc', k: '#201a33', w: '#ffffff', q: '#86e7ea' };
    SPR.duda = [
      sprite(['.....pppppp.....', '....pppppppp....', '...ppkkkkkkpp...', 'w..pppppppkkp..w', 'ww.ppppppkkpp.ww', 'www.ppppkkppp.ww', '.ww.pppkkpppp.w.', '....pppkkppp....', '....pppppppp....', '.....ppkkpp.....', '......pppp......'], PD),
      sprite(['.....pppppp.....', '....pppppppp....', '...ppkkkkkkpp...', '...pppppppkkp...', '...ppppppkkpp...', 'w..pppppkkppp..w', 'ww.ppppkkpppp.ww', 'www.ppkkppp..www', '....pppppppp....', '.....ppkkpp.....', '......pppp......'], PD)
    ];
    var PK = { g: '#4f8a4a', d: '#2f5f2c', f: '#f2a9dc' };
    SPR.cactus = sprite(['......gg........', '.....gddg.......', '.....gddg..gg...', '.gg..gddg.gddg..', 'gddg.gddg.gddg..', 'gddg.gddg.gddg..', 'gddggggdggggdg..', '.gddddddddddg...', '..ggggddgggg....', '.....gddg.......', '.....gddg.......', '.....gddg.......', '.....gddg.......', '.....gddg.......', '....gddddg......', '....gggggg......'], PK);
  }
  var cabeza = new Image();
  cabeza.src = 'assets/juego/pavel-cabeza.png';

  /* ---------- Niveles ---------- */
  function nivel(ancho){
    var g = []; for (var y = 0; y < 11; y++) { g.push([]); for (var x = 0; x < ancho; x++) g[y].push('.'); }
    var n = { g: g, w: ancho, ents: [], deco: [], meta: 0, palacio: 0, check: null };
    n.suelo = function(a, b, top){ top = top === undefined ? 9 : top; for (var x = a; x <= b; x++) for (var y = top; y < 11; y++) g[y][x] = '#'; return n; };
    n.b = function(x, y, c){ if (x >= 0 && x < ancho) g[y][x] = c; return n; };
    n.fila = function(a, b, y, c){ for (var x = a; x <= b; x++) g[y][x] = c; return n; };
    n.tubo = function(x, h){ for (var y = 9 - h; y < 9; y++) { g[y][x] = 'p'; g[y][x + 1] = 'p'; } return n; };
    n.esc = function(x, h, dir){ for (var i = 0; i < h; i++) for (var y = 8 - i; y < 9; y++) g[y][dir > 0 ? x + i : x + h - 1 - i] = 'u'; return n; };
    n.e = function(tipo, x, y){ n.ents.push({ t: tipo, x: x, y: y === undefined ? 8 : y }); return n; };
    n.mon = function(a, b, y){ for (var x = a; x <= b; x++) n.ents.push({ t: 'moneda', x: x, y: y }); return n; };
    return n;
  }
  function nivel1(){
    var n = nivel(212);
    n.tema = 'dia'; n.nombre = { es: '1-1 · Pavelópolis', en: '1-1 · Pavelópolis' };
    n.suelo(0, 68).suelo(71, 86).suelo(90, 152).suelo(155, 211);
    n.b(16, 5, '?').b(20, 5, 'B').b(21, 5, 'M').b(22, 5, '?').b(23, 5, 'B').b(24, 5, '?').b(22, 1, '?');
    n.tubo(28, 2).tubo(38, 3).tubo(46, 4).tubo(57, 4);
    n.b(64, 4, '1');
    n.fila(77, 79, 5, 'B').b(78, 5, 'M').fila(80, 87, 1, 'B').fila(91, 93, 1, 'B').b(94, 1, '?').b(94, 5, 'B');
    n.b(100, 5, 'B').b(101, 5, 'S').b(106, 5, '?').b(109, 5, '?').b(109, 1, 'M').b(112, 5, '?');
    n.b(118, 5, 'B').fila(121, 123, 1, 'B').b(128, 1, 'B').fila(129, 130, 1, '?').b(131, 1, 'B').fila(129, 130, 5, 'B');
    n.esc(134, 4, 1).esc(140, 4, -1).esc(148, 5, 1).fila(153, 153, 4, 'u').fila(153, 153, 5, 'u').fila(153, 153, 6, 'u').fila(153, 153, 7, 'u').fila(153, 153, 8, 'u').esc(155, 4, -1);
    n.tubo(163, 2).fila(168, 169, 5, 'B').b(170, 5, '?').b(171, 5, 'B').tubo(179, 2);
    n.esc(181, 8, 1).fila(189, 189, 1, 'u');
    for (var y = 1; y < 9; y++) n.b(189, y, 'u');
    n.meta = 198; n.palacio = 203;
    n.e('rival', 22).e('rival', 40).e('rival', 51).e('rival', 53).e('rival', 80, 0).e('rival', 82, 0).e('rival', 97).e('rival', 99).e('critico', 107).e('rival', 114).e('rival', 116).e('rival', 124).e('rival', 126).e('rival', 128).e('rival', 130).e('duda', 140, 4).e('rival', 172).e('rival', 174);
    n.mon(32, 35, 5).mon(60, 62, 4).mon(72, 75, 6).mon(138, 141, 3).mon(158, 161, 6);
    return n;
  }
  function nivel2(){
    var n = nivel(214);
    n.tema = 'desierto'; n.nombre = { es: '1-2 · Desierto de los Rivales', en: '1-2 · Desert of Rivals' };
    n.suelo(0, 40).suelo(46, 70).suelo(76, 120).suelo(127, 160).suelo(166, 213);
    n.fila(41, 45, 6, '=').fila(71, 75, 5, '=').fila(121, 126, 6, '=').fila(161, 165, 5, '=');
    n.b(12, 5, '?').b(13, 5, 'M').b(14, 5, '?').fila(26, 29, 4, 'B').b(27, 4, 'R');
    n.e('cactus', 20).e('cactus', 34).e('cactus', 58).e('cactus', 64).e('cactus', 90).e('cactus', 112).e('cactus', 140).e('cactus', 150).e('cactus', 185);
    n.tubo(52, 3).tubo(96, 2).tubo(134, 3);
    n.fila(80, 84, 5, 'B').b(82, 5, 'S').b(82, 1, '1');
    n.check = 104; n.deco.push({ t: 'bucees', x: 104 });
    n.fila(108, 110, 5, '?').fila(146, 149, 4, 'B').b(147, 4, 'M').b(148, 1, '?');
    n.esc(176, 4, 1).esc(184, 8, 1);
    for (var y = 1; y < 9; y++) n.b(192, y, 'u');
    n.meta = 200; n.palacio = 205;
    n.e('rival', 24).e('rival', 26).e('duda', 44, 3).e('critico', 60).e('rival', 86).e('rival', 88).e('duda', 100, 3).e('duda', 118, 4).e('critico', 130).e('rival', 142).e('rival', 144).e('duda', 158, 3).e('rival', 170).e('rival', 172).e('critico', 178);
    n.mon(41, 45, 4).mon(71, 75, 3).mon(121, 126, 4).mon(161, 165, 3).mon(100, 103, 6);
    return n;
  }
  function nivel3(){
    var n = nivel(232);
    n.tema = 'noche'; n.nombre = { es: '1-3 · Monte Non Plus Ultra', en: '1-3 · Mount Non Plus Ultra' };
    n.suelo(0, 22).suelo(28, 40).suelo(47, 52).suelo(60, 90).suelo(97, 130).suelo(137, 232);
    n.fila(23, 27, 6, '=').fila(41, 46, 5, '=').fila(53, 55, 6, '=').fila(56, 59, 4, '=').fila(91, 96, 5, '=').fila(131, 136, 6, '=');
    n.b(8, 5, 'M').b(10, 5, '?').fila(32, 36, 5, 'B').b(34, 5, 'R').b(34, 1, '?');
    n.tubo(66, 3).tubo(74, 4).tubo(82, 5);
    n.fila(102, 108, 4, 'B').b(105, 4, 'S').b(105, 0, '1').fila(114, 116, 5, '?').b(115, 1, 'M');
    n.check = 140; n.deco.push({ t: 'bucees', x: 140 });
    n.esc(150, 4, 1).esc(158, 4, -1);
    /* Arena del jefe: muro de entrada y trono al fondo. */
    for (var y = 0; y < 6; y++) n.b(170, y, 'u');
    for (var y2 = 0; y2 < 9; y2++) n.b(231, y2, 'u');
    n.fila(178, 181, 5, '=').fila(205, 208, 5, '=').fila(190, 194, 3, '=');
    n.jefe = 215; n.trono = 225; n.arena = 172;
    n.e('rival', 14).e('duda', 25, 3).e('critico', 36).e('duda', 44, 2).e('rival', 64).e('rival', 70).e('critico', 86).e('duda', 93, 2).e('rival', 110).e('rival', 112).e('critico', 120).e('duda', 133, 3).e('rival', 146).e('rival', 162).e('critico', 165);
    n.mon(23, 27, 4).mon(41, 46, 3).mon(56, 59, 2).mon(91, 96, 3).mon(131, 136, 4);
    return n;
  }
  var NIVELES = [nivel1, nivel2, nivel3];

  /* ---------- Sonido ---------- */
  var ac = null, mudo = false, musicaOn = true, mus = { t: 0, i: 0, timer: null };
  function audio(){ if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (ac && ac.state === 'suspended') ac.resume(); return ac; }
  function tono(f, d, tipo, f2, vol, cuando){
    if (mudo || !ac) return;
    var t0 = cuando || ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo || 'square'; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
    g.gain.setValueAtTime(vol || .08, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + d + .02);
  }
  function arp(notas, paso, tipo){ if (!ac) return; var t0 = ac.currentTime; notas.forEach(function(f, i){ tono(f, paso * 1.4, tipo, null, .07, t0 + i * paso); }); }
  var SFX = {
    salto: function(){ tono(320, .14, 'square', 640, .06); },
    moneda: function(){ arp([988, 1319], .07); },
    pisar: function(){ tono(260, .12, 'triangle', 90, .12); },
    golpe: function(){ tono(140, .08, 'square', 90, .08); },
    poder: function(){ arp([523, 659, 784, 1047, 1319], .06); },
    dano: function(){ tono(500, .3, 'sawtooth', 120, .06); },
    muerte: function(){ arp([784, 659, 523, 392, 330, 262], .11, 'triangle'); },
    vida: function(){ arp([659, 784, 1319, 1047, 1175, 1568], .07); },
    patada: function(){ tono(180, .08, 'square', 400, .08); },
    rayo: function(){ tono(1200, .1, 'square', 600, .05); },
    meta: function(){ arp([392, 523, 659, 784, 1047, 1319, 1568], .09); },
    ladrillo: function(){ tono(90, .18, 'sawtooth', 40, .1); }
  };
  /* Tema original en do mayor, corcheas a 140 ppm. 0 = silencio. */
  var MEL = [72,0,76,79,77,76,74,72, 74,0,77,81,79,77,76,74, 72,0,76,79,84,83,81,79, 77,79,76,74,72,0,67,0,
             76,0,79,84,83,81,79,77, 76,0,74,76,77,79,81,0, 79,0,84,79,81,77,79,76, 74,76,72,74,71,0,72,0];
  var BAJ = [48,55,52,55,53,57,55,59, 48,55,52,55,50,57,55,53];
  function midi(n){ return 440 * Math.pow(2, (n - 69) / 12); }
  function musica(on){
    if (mus.timer) { clearInterval(mus.timer); mus.timer = null; }
    if (!on || !ac) return;
    var paso = 60 / 140 / 2;
    mus.t = ac.currentTime + .1;
    mus.timer = setInterval(function(){
      if (!ac || mudo || !musicaOn) return;
      while (mus.t < ac.currentTime + .25) {
        var n = MEL[mus.i % MEL.length];
        if (n) tono(midi(n), paso * .9, 'square', null, .035, mus.t);
        if (mus.i % 2 === 0) tono(midi(BAJ[(mus.i / 2) % BAJ.length]), paso * 1.6, 'triangle', null, .06, mus.t);
        mus.i++; mus.t += paso;
      }
    }, 80);
  }

  /* ---------- Estado ---------- */
  var J = { fase: 'titulo', nivelN: 0, vidas: 3, puntos: 0, monedas: 0, tiempo: 300, record: 0, n: null, cam: 0, f: 0, msj: null, msjT: 0, activo: false, pausa: false, checkOK: false };
  try { J.record = +localStorage.getItem('pavel-juego-record') || 0; } catch (e) {}
  var teclas = {}, previas = {};
  var P = null, ENT = [], PART = [], ITEMS = [], BALAS = [];

  function solido(c){ return c === '#' || c === 'B' || c === '?' || c === 'M' || c === 'R' || c === 'S' || c === '1' || c === 'u' || c === 'p' || c === 'U'; }
  function celda(x, y){ if (y < 0) return '.'; if (y > 10 || x < 0 || x >= J.n.w) return y > 10 ? '.' : '#'; return J.n.g[y][x]; }
  function setCelda(x, y, c){ if (y >= 0 && y < 11 && x >= 0 && x < J.n.w) J.n.g[y][x] = c; }

  function cargarNivel(i, desdeCheck){
    J.nivelN = i; J.n = NIVELES[i]();
    J.tiempo = 300; J.cam = 0; ENT = []; PART = []; ITEMS = []; BALAS = [];
    var x0 = (desdeCheck && J.n.check) ? J.n.check * T : 3 * T;
    var forma = P ? P.forma : 0;
    P = { x: x0, y: 8 * T - 2, w: 11, h: forma ? 24 : 17, vx: 0, vy: 0, suelo: false, dir: 1, forma: forma, inv: 0, estrella: 0, coyote: 0, buffer: 0, anim: 0, muerto: false, meta: false, disparo: 0 };
    P.y = 9 * T - P.h;
    J.n.ents.forEach(function(e){
      if (e.t === 'moneda') { ITEMS.push({ t: 'moneda', x: e.x * T + 4, y: e.y * T + 3, w: 8, h: 10, fija: true }); return; }
      if (desdeCheck && J.n.check && e.x < J.n.check + 4) return;
      ENT.push(enemigo(e.t, e.x * T, e.y * T));
    });
    J.jefeVivo = !!J.n.jefe; J.jefeCreado = false; J.jefeDespierto = false;
    J.fase = 'jugando'; J.checkOK = !!desdeCheck;
    aviso(tx(J.n.nombre), 150);
  }
  function enemigo(t, x, y){
    var e = { t: t, x: x, y: y, vx: -0.5, vy: 0, w: 14, h: 12, vivo: true, est: 'normal', timer: 0, dormido: true };
    if (t === 'critico') { e.h = 11; e.w = 13; }
    if (t === 'duda') { e.vx = -0.6; e.y0 = y; e.w = 14; e.h = 11; }
    if (t === 'rival' || t === 'critico') e.y = y + T - e.h;
    if (t === 'cactus') { e.vx = 0; e.w = 10; e.h = 15; e.y = 9 * T - 15; e.x = x + 3; }
    if (t === 'jefe') { e.w = 36; e.h = 30; e.vx = -0.8; e.vida = 3; e.y = 9 * T - 30; }
    return e;
  }
  function aviso(txt, dur){ J.msj = txt; J.msjT = dur || 120; }
  function sumar(p, x, y){ J.puntos += p; if (x !== undefined) PART.push({ t: 'txt', s: String(p), x: x, y: y, vy: -0.6, vida: 40 }); }
  function moneda(x, y){
    J.monedas++; sumar(200); SFX.moneda();
    if (J.monedas >= 100) { J.monedas -= 100; J.vidas++; SFX.vida(); }
    if (x !== undefined) PART.push({ t: 'moneda', x: x, y: y, vy: -4, vida: 26 });
  }

  /* ---------- Fisica ---------- */
  function choca(o, dx, dy){
    /* Mueve o por (dx,dy) contra baldosas solidas; devuelve que lados toco. */
    var res = { izq: 0, der: 0, arr: 0, abj: 0, celdaArr: null };
    o.x += dx;
    var x0 = Math.floor(o.x / T), x1 = Math.floor((o.x + o.w - .01) / T), y0 = Math.floor(o.y / T), y1 = Math.floor((o.y + o.h - .01) / T);
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
      if (!solido(celda(x, y))) continue;
      if (dx > 0) { o.x = x * T - o.w; res.der = 1; } else if (dx < 0) { o.x = (x + 1) * T; res.izq = 1; }
    }
    if (o.x < 0) { o.x = 0; res.izq = 1; }
    var antesAbajo = o.y + o.h;
    o.y += dy;
    x0 = Math.floor(o.x / T); x1 = Math.floor((o.x + o.w - .01) / T); y0 = Math.floor(o.y / T); y1 = Math.floor((o.y + o.h - .01) / T);
    for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) {
      var c = celda(xx, yy);
      if (c === '=' && dy > 0 && antesAbajo <= yy * T + .01) { o.y = yy * T - o.h; res.abj = 1; continue; }
      if (!solido(c)) continue;
      if (dy > 0) { o.y = yy * T - o.h; res.abj = 1; }
      else if (dy < 0) {
        o.y = (yy + 1) * T; res.arr = 1;
        var cx = Math.floor((o.x + o.w / 2) / T);
        res.celdaArr = solido(celda(cx, yy)) ? [cx, yy] : [xx, yy];
      }
    }
    return res;
  }
  function pulsado(k){ return !!teclas[k]; }
  function recien(k){ return !!teclas[k] && !previas[k]; }
  function izq(){ return pulsado('ArrowLeft') || pulsado('a') || pulsado('A') || pulsado('t-izq'); }
  function der(){ return pulsado('ArrowRight') || pulsado('d') || pulsado('D') || pulsado('t-der'); }
  function saltar(){ return pulsado(' ') || pulsado('z') || pulsado('Z') || pulsado('ArrowUp') || pulsado('w') || pulsado('W') || pulsado('t-a'); }
  function saltarYa(){ return recien(' ') || recien('z') || recien('Z') || recien('ArrowUp') || recien('w') || recien('W') || recien('t-a'); }
  function correr(){ return pulsado('x') || pulsado('X') || pulsado('Shift') || pulsado('t-b'); }
  function dispararYa(){ return recien('x') || recien('X') || recien('Shift') || recien('t-b'); }

  function golpearBloque(cx, cy){
    var c = celda(cx, cy);
    if (c === 'B') {
      if (P.forma > 0) { setCelda(cx, cy, '.'); SFX.ladrillo(); sumar(50); for (var i = 0; i < 4; i++) PART.push({ t: 'cascote', x: cx * T + 8, y: cy * T + 8, vx: (i % 2 ? 1.4 : -1.4), vy: -3 - (i > 1 ? 1.5 : 0), vida: 60 }); }
      else { SFX.golpe(); PART.push({ t: 'rebote', cx: cx, cy: cy, vida: 8 }); }
      matarEncima(cx, cy);
      return;
    }
    if (c === '?' || c === 'M' || c === 'R' || c === 'S' || c === '1') {
      setCelda(cx, cy, 'U');
      PART.push({ t: 'rebote', cx: cx, cy: cy, vida: 8, era: 'U' });
      if (c === '?') moneda(cx * T + 4, cy * T - 10);
      else {
        var tipo = c === 'M' ? (P.forma >= 1 ? 'cetro' : 'crin') : c === 'R' ? 'cetro' : c === 'S' ? 'estrella' : 'nuggets';
        ITEMS.push({ t: tipo, x: cx * T + 1, y: cy * T, w: 14, h: 14, vx: tipo === 'cetro' ? 0 : 0.9, vy: 0, sube: 16 });
        tono(400, .25, 'square', 900, .05);
      }
      matarEncima(cx, cy);
      return;
    }
    if (c !== '.') SFX.golpe();
  }
  function matarEncima(cx, cy){
    ENT.forEach(function(e){
      if (e.vivo && e.t !== 'cactus' && e.t !== 'jefe' && e.x + e.w > cx * T && e.x < cx * T + T && Math.abs(e.y + e.h - cy * T) < 4) { volcar(e); sumar(100, e.x, e.y); }
    });
  }
  function volcar(e){ e.vivo = false; e.est = 'volcado'; e.vy = -3; SFX.patada(); }

  function danar(){
    if (P.inv > 0 || P.estrella > 0 || P.muerto) return;
    if (P.forma > 0) { P.forma = P.forma === 2 ? 1 : 0; cambiarForma(P.forma); P.inv = 120; SFX.dano(); }
    else morir();
  }
  function cambiarForma(f){ var h = f ? 24 : 17; P.y += P.h - h; P.h = h; P.forma = f; }
  function morir(){
    if (P.muerto) return;
    P.muerto = true; P.vy = -5; P.vx = 0; J.fase = 'muerte'; J.timer = 160; musica(false); SFX.muerte();
  }

  function pasoJugador(){
    var acc = correr() ? .16 : .11, max = correr() ? 2.7 : 1.7;
    if (P.estrella) max += .4;
    var mov = (der() ? 1 : 0) - (izq() ? 1 : 0);
    if (P.meta) mov = 0;
    if (mov) { P.vx += mov * (P.suelo ? acc : acc * .7); P.dir = mov; }
    else if (P.suelo) { P.vx *= .82; if (Math.abs(P.vx) < .05) P.vx = 0; }
    P.vx = Math.max(-max, Math.min(max, P.vx));
    if (P.suelo) P.coyote = 6; else if (P.coyote > 0) P.coyote--;
    if (saltarYa()) P.buffer = 7; else if (P.buffer > 0) P.buffer--;
    if (P.buffer > 0 && P.coyote > 0) { P.vy = Math.abs(P.vx) > 2.2 ? -6.4 : -6; P.buffer = 0; P.coyote = 0; P.suelo = false; SFX.salto(); }
    var grav = (saltar() && P.vy < 0) ? .22 : .42;
    P.vy = Math.min(6.5, P.vy + grav);
    if (dispararYa() && P.forma === 2 && BALAS.length < 2) { BALAS.push({ x: P.x + (P.dir > 0 ? P.w : -6), y: P.y + 8, vx: 3.6 * P.dir, vy: 1, vida: 120 }); SFX.rayo(); }
    var r = choca(P, P.vx, 0);
    if (r.izq || r.der) P.vx = 0;
    var r2 = choca(P, 0, P.vy);
    P.suelo = false;
    if (r2.abj) { P.vy = 0; P.suelo = true; }
    if (r2.arr) { P.vy = 1; if (r2.celdaArr) golpearBloque(r2.celdaArr[0], r2.celdaArr[1]); }
    if (P.y > GH + 40) morir();
    if (P.inv > 0) P.inv--;
    if (P.estrella > 0) { P.estrella--; if (P.estrella === 0) musica(true); }
    P.anim += Math.abs(P.vx) * .12;
    /* Checkpoint del Buc-ee's. */
    if (J.n.check && !J.checkOK && P.x > J.n.check * T) { J.checkOK = true; aviso(tx({ es: '¡Buc-ee’s! Punto de control', en: 'Buc-ee’s! Checkpoint' }), 120); SFX.vida(); }
    /* Asta de bandera. */
    if (J.n.meta && !P.meta && P.x + P.w > J.n.meta * T + 6) {
      P.meta = true; P.x = J.n.meta * T + 6 - P.w; P.vx = 0; P.vy = 0;
      var altura = Math.max(0, Math.round((9 * T - (P.y + P.h)) / T));
      sumar([100, 400, 800, 2000, 4000, 5000][Math.min(5, Math.floor(altura / 1.6))], P.x, P.y);
      J.fase = 'meta'; J.timer = 0; musica(false); SFX.meta();
    }
  }

  function pasoEnemigos(){
    var vis0 = J.cam - 40, vis1 = J.cam + GW + 40;
    ENT.forEach(function(e){
      if (e.dormido && e.x < J.cam + GW + 24) e.dormido = false;
      if (e.dormido) return;
      if (e.est === 'volcado') { e.vy += .35; e.y += e.vy; e.x += e.vx * .5; return; }
      if (e.est === 'aplastado') { e.timer--; return; }
      if (e.t === 'cactus') { tocar(e); return; }
      if (e.t === 'duda') {
        e.timer++; e.x += e.vx; e.y = e.y0 + Math.sin(e.timer * .05) * 18;
        if (e.x < J.cam - 60) e.vivo = false;
        tocar(e); return;
      }
      if (e.t === 'jefe') { pasoJefe(e); return; }
      var vel = e.est === 'concha' ? e.vx : e.vx;
      e.vy = Math.min(6, e.vy + .35);
      var r = choca(e, vel, 0);
      if (r.izq || r.der) { e.vx = -e.vx; if (e.est === 'concha') SFX.golpe(); }
      var r2 = choca(e, 0, e.vy);
      if (r2.abj) e.vy = 0;
      if (e.y > GH + 30) e.vivo = false, e.est = 'fuera';
      if (e.est === 'concha' && e.vx) {
        ENT.forEach(function(o){ if (o !== e && o.vivo && o.t !== 'jefe' && o.t !== 'cactus' && caja(o, e)) { volcar(o); sumar(200, o.x, o.y); } });
      }
      e.timer++;
      tocar(e);
    });
    ENT = ENT.filter(function(e){ return !(e.est === 'aplastado' && e.timer <= 0) && e.est !== 'fuera' && !(e.est === 'volcado' && e.y > GH + 40) && !(e.t === 'duda' && !e.vivo && e.est === 'normal'); });
  }
  function caja(a, b){ return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function tocar(e){
    if (P.muerto || P.meta || !caja(P, e)) return;
    if (P.estrella > 0 && e.t !== 'jefe') { volcar(e); sumar(200, e.x, e.y); return; }
    if (e.t === 'cactus') { danar(); return; }
    var pisa = P.vy > 0 && (P.y + P.h) - e.y < 10;
    if (e.est === 'concha' && !e.vx) { e.vx = (P.x + P.w / 2 < e.x + e.w / 2) ? 3.4 : -3.4; e.timer = 0; SFX.patada(); sumar(100, e.x, e.y); P.inv = Math.max(P.inv, 10); return; }
    if (pisa) {
      P.vy = saltar() ? -6.2 : -3.8; P.y = e.y - P.h;
      if (e.t === 'jefe') { golpeJefe(e); return; }
      SFX.pisar(); sumar(100, e.x, e.y);
      if (e.t === 'critico') { e.est = 'concha'; e.vx = 0; e.h = 7; e.w = 12; e.y += 4; return; }
      e.est = 'aplastado'; e.timer = 30; e.vivo = false;
      return;
    }
    if (e.est === 'concha' && e.timer < 12) return;
    danar();
  }

  /* El Rey Rival: camina, salta, lanza criticas en arco. Tres pisotones. */
  function pasoJefe(e){
    e.timer++;
    if (e.golpeado > 0) e.golpeado--;
    if (P.x < J.n.arena * T) return;
    if (!J.jefeDespierto) { J.jefeDespierto = true; aviso(tx({ es: '¡EL REY RIVAL!', en: 'THE RIVAL KING!' }), 140); for (var y = 6; y < 9; y++) setCelda(J.n.arena - 2, y, 'u'); }
    e.vy = Math.min(6, e.vy + .3);
    var r = choca(e, e.vx, 0);
    if (r.izq || r.der) e.vx = -e.vx;
    var r2 = choca(e, 0, e.vy);
    if (r2.abj) { e.vy = 0; if (e.timer % 150 === 0) e.vy = -6.5; }
    if (e.timer % 100 === 50) BALAS.push({ mala: 1, x: e.x + e.w / 2, y: e.y, vx: (P.x < e.x ? -1 : 1) * (1.2 + Math.random()), vy: -4.5, vida: 200 });
    tocar(e);
  }
  function golpeJefe(e){
    if (e.golpeado > 0) return;
    e.vida--; e.golpeado = 60; SFX.pisar(); tono(150, .3, 'sawtooth', 60, .1);
    e.vx = (e.vx > 0 ? 1 : -1) * (1.1 + (3 - e.vida) * .35);
    sumar(1000, e.x, e.y);
    if (e.vida <= 0) { volcar(e); J.jefeVivo = false; aviso(tx({ es: '¡El Rey Rival ha caído!', en: 'The Rival King has fallen!' }), 160); SFX.meta(); for (var y = 1; y < 9; y++) setCelda(231, y, '.'); }
  }

  function pasoItems(){
    ITEMS.forEach(function(it){
      if (it.fija) { if (caja(P, it)) { it.fuera = true; moneda(); } return; }
      if (it.sube > 0) { it.y -= 1; it.sube--; return; }
      if (it.t === 'cetro') { if (caja(P, it)) cogerItem(it); return; }
      it.vy = Math.min(6, it.vy + .3);
      var r = choca(it, it.vx, 0); if (r.izq || r.der) it.vx = -it.vx;
      var r2 = choca(it, 0, it.vy); if (r2.abj) it.vy = it.t === 'estrella' ? -5 : 0;
      if (it.y > GH + 30) it.fuera = true;
      if (caja(P, it)) cogerItem(it);
    });
    ITEMS = ITEMS.filter(function(i){ return !i.fuera; });
  }
  function cogerItem(it){
    it.fuera = true;
    if (it.t === 'crin') { if (P.forma === 0) cambiarForma(1); SFX.poder(); sumar(1000, it.x, it.y); aviso(tx({ es: '¡Crin Iridiscente!', en: 'Iridescent Mane!' }), 90); }
    if (it.t === 'cetro') { if (P.forma === 0) cambiarForma(1); P.forma = 2; SFX.poder(); sumar(1000, it.x, it.y); aviso(tx({ es: '¡Cetro de Grandeza! (X para disparar)', en: 'Sceptre of Greatness! (X to fire)' }), 120); }
    if (it.t === 'estrella') { P.estrella = 600; SFX.poder(); sumar(1000, it.x, it.y); aviso(tx({ es: '¡Estrella Non Plus Ultra!', en: 'Non Plus Ultra Star!' }), 90); }
    if (it.t === 'nuggets') { J.vidas++; SFX.vida(); PART.push({ t: 'txt', s: '1UP', x: it.x, y: it.y, vy: -.6, vida: 50 }); aviso(tx({ es: 'Beaver Nuggets: ¡vida extra!', en: 'Beaver Nuggets: extra life!' }), 90); }
  }
  function pasoBalas(){
    BALAS.forEach(function(b){
      b.vida--;
      if (b.mala) {
        b.vy += .18; b.x += b.vx; b.y += b.vy;
        if (caja(P, { x: b.x - 4, y: b.y - 4, w: 8, h: 8 }) && !P.estrella) danar();
        if (b.y > GH) b.vida = 0;
        return;
      }
      b.vy += .3; b.x += b.vx;
      var o = { x: b.x, y: b.y, w: 6, h: 6 };
      var r = choca(o, 0, b.vy); b.y = o.y;
      if (r.abj) b.vy = -2.6;
      if (solido(celda(Math.floor((b.x + (b.vx > 0 ? 6 : 0)) / T), Math.floor((b.y + 3) / T)))) b.vida = 0;
      ENT.forEach(function(e){
        if (!e.vivo || b.vida <= 0 || !caja(o, e)) return;
        if (e.t === 'jefe') { b.vida = 0; if (!e.golpeado) { e.golpeado = 20; e.vida -= .34; tono(300, .1, 'square', 200, .06); if (e.vida <= 0) golpeJefe(Object.assign(e, { vida: 1, golpeado: 0 })); } return; }
        volcar(e); sumar(200, e.x, e.y); b.vida = 0;
      });
    });
    BALAS = BALAS.filter(function(b){ return b.vida > 0 && b.x > J.cam - 20 && b.x < J.cam + GW + 20; });
  }

  function paso(){
    J.f++;
    if (J.msjT > 0) J.msjT--;
    if (J.fase === 'jugando') {
      if (J.f % 40 === 0) { J.tiempo--; if (J.tiempo <= 0) morir(); }
      pasoJugador(); pasoEnemigos(); pasoItems(); pasoBalas();
      if (J.n.jefe && !J.jefeCreado && P.x > (J.n.arena - 6) * T) { J.jefeCreado = true; ENT.push(enemigo('jefe', J.n.jefe * T, 0)); }
      if (J.n.trono && !J.jefeVivo && J.jefeCreado && P.x > J.n.trono * T - 8) { J.fase = 'fin'; J.timer = 0; musica(false); SFX.meta(); guardarRecord(); }
    } else if (J.fase === 'muerte') {
      P.vy += .3; P.y += P.vy;
      if (--J.timer <= 0) {
        J.vidas--;
        if (J.vidas <= 0) { J.fase = 'gameover'; guardarRecord(); }
        else { P.forma = 0; cargarNivel(J.nivelN, J.checkOK); musica(true); }
      }
    } else if (J.fase === 'meta') {
      J.timer++;
      if (P.y + P.h < 9 * T) P.y = Math.min(9 * T - P.h, P.y + 2);
      else { P.x += 1.2; P.anim += .2; P.dir = 1; }
      if (J.tiempo > 0 && J.timer > 60) { J.tiempo = Math.max(0, J.tiempo - 3); J.puntos += 150; if (J.f % 4 === 0) tono(1400, .03, 'square', null, .03); }
      if (P.x > J.n.palacio * T + 8 && J.tiempo <= 0) {
        if (J.nivelN + 1 < NIVELES.length) { cargarNivel(J.nivelN + 1); musica(true); }
        else { J.fase = 'fin'; guardarRecord(); }
      }
    }
    PART.forEach(function(p){ p.vida--; if (p.t === 'txt') p.y += p.vy; if (p.t === 'moneda') { p.y += p.vy; p.vy += .3; } if (p.t === 'cascote') { p.x += p.vx; p.y += p.vy; p.vy += .3; } });
    PART = PART.filter(function(p){ return p.vida > 0; });
    if (P && J.fase !== 'titulo') {
      var objetivo = P.x - GW * .4;
      J.cam = Math.max(0, Math.min(J.n.w * T - GW, J.cam + (objetivo - J.cam) * .2));
      if (J.n.arena && J.jefeDespierto && J.jefeVivo) J.cam = Math.max(J.cam, J.n.arena * T - 8);
    }
    for (var k in teclas) previas[k] = teclas[k];
    for (var k2 in previas) if (!teclas[k2]) previas[k2] = false;
  }
  function guardarRecord(){ if (J.puntos > J.record) { J.record = J.puntos; try { localStorage.setItem('pavel-juego-record', String(J.record)); } catch (e) {} } pintarRecord(); }
  function pintarRecord(){ var r = doc.getElementById('pvl-sp-record'); if (r) r.textContent = String(J.record).padStart(6, '0'); }

  /* ---------- Dibujo ---------- */
  var cv = null, ctx = null, buf = null, bx = null;
  var TEMAS = {
    dia: { cielo: ['#6fa8ff', '#cfe6ff'], lejos: '#9fc6a0', cerca: '#6faa5f', suelo: '#d8b25c', junta: '#8f6f2a', cesped: ['#86e7ea', '#f2a9dc'] },
    desierto: { cielo: ['#8ac4ff', '#ffe5bd'], lejos: '#e8c99a', cerca: '#dcb57a', suelo: '#e2c084', junta: '#a8824a', cesped: ['#f4e0a8', '#e9c874'] },
    noche: { cielo: ['#120a38', '#3a2a7a'], lejos: '#2a2060', cerca: '#3d3480', suelo: '#c8d2ea', junta: '#7d88a8', cesped: ['#ffffff', '#cfe8ff'] }
  };
  function fondo(th){
    var g = bx.createLinearGradient(0, 0, 0, GH); g.addColorStop(0, th.cielo[0]); g.addColorStop(1, th.cielo[1]);
    bx.fillStyle = g; bx.fillRect(0, 0, GW, GH);
    var c = J.cam;
    if (J.n.tema === 'noche') {
      bx.fillStyle = '#fff';
      for (var i = 0; i < 40; i++) { var sx = ((i * 97 - c * .05) % GW + GW) % GW, sy = (i * 53) % 110; bx.fillRect(sx, sy, (i % 5 === 0) ? 2 : 1, (i % 5 === 0) ? 2 : 1); }
      bx.fillStyle = 'rgba(134,231,234,.18)'; bx.fillRect(0, 20 + Math.sin(J.f * .01) * 4, GW, 6);
      bx.fillStyle = 'rgba(242,169,220,.14)'; bx.fillRect(0, 30 + Math.sin(J.f * .013) * 5, GW, 5);
    } else {
      bx.fillStyle = 'rgba(255,255,255,.9)';
      for (var n = 0; n < 6; n++) { var nx = ((n * 140 - c * .2) % (GW + 120) + GW + 120) % (GW + 120) - 60, ny = 18 + (n * 37) % 50; nube(nx, ny); }
    }
    /* Colinas / dunas / montes lejanos, en dos capas de paralaje. */
    bx.fillStyle = th.lejos;
    for (var h = -1; h < 6; h++) { var hx = h * 120 - (c * .3) % 120; monte(hx, 140, 90, J.n.tema === 'noche' ? 70 : 40); }
    if (J.n.tema === 'noche') { bx.fillStyle = '#e8eef8'; for (var h2 = -1; h2 < 6; h2++) { var px = h2 * 120 - (c * .3) % 120; bx.beginPath(); bx.moveTo(px + 45 - 15, 140 - 70 + 22); bx.lineTo(px + 45, 140 - 70); bx.lineTo(px + 45 + 15, 140 - 70 + 22); bx.fill(); bx.fillStyle = '#e8eef8'; } }
    if (J.n.tema === 'dia') { /* El Palacio, al fondo. */ var pxp = 200 - (c * .15) % 900; bx.fillStyle = '#b9c9e8'; bx.fillRect(pxp, 100, 60, 40); bx.beginPath(); bx.arc(pxp + 30, 100, 18, Math.PI, 0); bx.fill(); bx.fillRect(pxp + 29, 70, 2, 14); bx.fillStyle = '#f2a9dc'; bx.fillRect(pxp + 31, 70, 8, 5); }
    bx.fillStyle = th.cerca;
    for (var k = -1; k < 8; k++) { var kx = k * 80 - (c * .55) % 80; monte(kx, 150, 70, 26); }
    if (J.n.tema === 'desierto') for (var q = 0; q < 5; q++) { var qx = q * 110 - (c * .55) % 110; bx.fillStyle = '#5b9a52'; bx.fillRect(qx + 30, 118, 4, 26); bx.fillRect(qx + 25, 124, 3, 10); bx.fillRect(qx + 25, 132, 6, 3); bx.fillRect(qx + 36, 120, 3, 9); bx.fillRect(qx + 33, 127, 6, 3); }
  }
  function nube(x, y){ bx.beginPath(); bx.arc(x, y, 9, 0, 7); bx.arc(x + 12, y - 4, 11, 0, 7); bx.arc(x + 25, y, 9, 0, 7); bx.fill(); bx.fillRect(x, y, 25, 8); }
  function monte(x, base, w, h){ bx.beginPath(); bx.moveTo(x, base); bx.quadraticCurveTo(x + w / 2, base - h * 2, x + w, base); bx.fill(); }
  function baldosa(c, x, y, cx, cy){
    var th = TEMAS[J.n.tema];
    if (c === '#') {
      bx.fillStyle = th.suelo; bx.fillRect(x, y, T, T);
      bx.fillStyle = th.junta; bx.fillRect(x, y + 7, T, 1); bx.fillRect(x, y + 15, T, 1); bx.fillRect(x + ((cy % 2) ? 4 : 11), y, 1, 7); bx.fillRect(x + ((cy % 2) ? 11 : 4), y + 8, 1, 7);
      if (celda(cx, cy - 1) !== '#') { bx.fillStyle = th.cesped[0]; bx.fillRect(x, y, T, 3); bx.fillStyle = th.cesped[1]; bx.fillRect(x, y + 3, T, 2); }
      return;
    }
    if (c === 'B') { bx.fillStyle = '#c47a3a'; bx.fillRect(x, y, T, T); bx.fillStyle = '#7a3f17'; bx.fillRect(x, y, T, 1); bx.fillRect(x, y + 7, T, 1); bx.fillRect(x, y + 15, T, 1); bx.fillRect(x + 7, y, 1, 7); bx.fillRect(x + 3, y + 8, 1, 7); bx.fillRect(x + 11, y + 8, 1, 7); return; }
    if (c === '?' || c === 'M' || c === 'R' || c === 'S' || c === '1') {
      var br = (Math.floor(J.f / 8) % 6);
      bx.fillStyle = br < 3 ? '#e9c874' : '#f4e0a8'; bx.fillRect(x, y, T, T);
      bx.fillStyle = '#8f6f2a'; bx.fillRect(x, y, T, 1); bx.fillRect(x, y + 15, T, 1); bx.fillRect(x, y, 1, T); bx.fillRect(x + 15, y, 1, T);
      bx.fillStyle = '#5a3a12'; bx.fillRect(x + 1, y + 1, 1, 1); bx.fillRect(x + 14, y + 1, 1, 1); bx.fillRect(x + 1, y + 14, 1, 1); bx.fillRect(x + 14, y + 14, 1, 1);
      bx.fillStyle = '#6b4f16'; bx.fillRect(x + 5, y + 3, 6, 2); bx.fillRect(x + 10, y + 4, 2, 4); bx.fillRect(x + 7, y + 7, 3, 2); bx.fillRect(x + 7, y + 9, 2, 2); bx.fillRect(x + 7, y + 12, 2, 2);
      return;
    }
    if (c === 'U') { bx.fillStyle = '#8f6f2a'; bx.fillRect(x, y, T, T); bx.fillStyle = '#5a3a12'; bx.fillRect(x, y + 15, T, 1); bx.fillRect(x + 15, y, 1, T); bx.fillRect(x + 2, y + 2, 1, 1); bx.fillRect(x + 13, y + 2, 1, 1); bx.fillRect(x + 2, y + 13, 1, 1); bx.fillRect(x + 13, y + 13, 1, 1); return; }
    if (c === 'u') { bx.fillStyle = J.n.tema === 'noche' ? '#9aa6c4' : '#b08a4a'; bx.fillRect(x, y, T, T); bx.fillStyle = 'rgba(0,0,0,.25)'; bx.fillRect(x, y + 15, T, 1); bx.fillRect(x + 15, y, 1, T); bx.fillStyle = 'rgba(255,255,255,.25)'; bx.fillRect(x, y, T, 1); bx.fillRect(x, y, 1, T); return; }
    if (c === 'p') {
      var top = celda(cx, cy - 1) !== 'p', izqT = celda(cx - 1, cy) !== 'p';
      bx.fillStyle = '#2a1a63'; bx.fillRect(x, y, T, T);
      bx.fillStyle = '#4a3a93'; bx.fillRect(x + (izqT ? 3 : 0), y, izqT ? 4 : 2, T);
      if (top) { bx.fillStyle = '#d8b25c'; bx.fillRect(x - (izqT ? 1 : 0), y, T + 1, 6); bx.fillStyle = '#f4e0a8'; bx.fillRect(x + (izqT ? 2 : 0), y + 1, izqT ? 4 : 2, 4); }
      return;
    }
    if (c === '=') { bx.fillStyle = '#fff'; bx.fillRect(x, y, T, 5); bx.fillStyle = '#cfe8ff'; bx.fillRect(x, y + 4, T, 2); bx.fillStyle = '#86e7ea'; bx.fillRect(x + ((cx % 2) ? 2 : 9), y + 1, 4, 1); return; }
  }
  function dibujarPavel(){
    if (!P || (P.inv > 0 && J.f % 4 < 2 && !P.muerto)) return;
    var grande = P.forma > 0;
    var fr = !P.suelo && !P.meta ? 2 : (Math.abs(P.vx) > .2 || P.meta ? (Math.floor(P.anim) % 2) : 0);
    var spr = (P.estrella > 0 || P.forma === 2) ? SPR.uniIri[fr] : SPR.uni[fr];
    var esc = grande ? 1.25 : 1;
    var sw = 16 * esc, sh = 12 * esc;
    var x = Math.round(P.x - J.cam + P.w / 2), pie = Math.round(P.y + P.h);
    bx.save();
    bx.translate(x, 0);
    if (P.dir < 0) bx.scale(-1, 1);
    if (P.estrella > 0) bx.filter = 'hue-rotate(' + (J.f * 12 % 360) + 'deg) saturate(2)';
    bx.drawImage(spr, -sw / 2, pie - sh, sw, sh);
    /* Jinete: camisa blanca y la cabeza de Pavel, a lo bobblehead. */
    var hx = -2 * esc, ty = pie - sh - 3 * esc;
    bx.fillStyle = '#f4f4f4'; bx.fillRect(hx - 2 * esc, ty, 5 * esc, 6 * esc);
    bx.fillStyle = '#e9c874'; if (P.forma === 2) bx.fillRect(hx + 3 * esc, ty - 3 * esc, 1, 7 * esc);
    var cw = grande ? 13 : 10, ch = cw * 1.42, bob = (P.suelo && Math.abs(P.vx) > .2) ? Math.round(Math.sin(P.anim * 3)) : 0;
    if (cabeza.complete && cabeza.naturalWidth) bx.drawImage(cabeza, hx - cw / 2 + .5, ty - ch + 3 + bob, cw, ch);
    else { bx.fillStyle = '#c68a5e'; bx.fillRect(hx - 4, ty - 10, 8, 10); }
    if (P.forma >= 1) { bx.fillStyle = '#e9c874'; bx.fillRect(hx - cw / 2 + 2, ty - ch + 1 + bob, cw - 4, 2); bx.fillRect(hx - cw / 2 + 2, ty - ch - 1 + bob, 2, 2); bx.fillRect(hx - 1, ty - ch - 2 + bob, 2, 3); bx.fillRect(hx + cw / 2 - 4, ty - ch - 1 + bob, 2, 2); }
    bx.restore();
  }
  function dibujarEnte(e){
    var x = Math.round(e.x - J.cam), y = Math.round(e.y);
    if (x < -40 || x > GW + 40) return;
    var paso = Math.floor(J.f / 10) % 2;
    bx.save();
    if (e.est === 'volcado') { bx.translate(x + e.w / 2, y + e.h / 2); bx.scale(1, -1); bx.translate(-x - e.w / 2, -y - e.h / 2); }
    if (e.t === 'rival') { if (e.est === 'aplastado') bx.drawImage(SPR.rivalPlano, x - 1, y + e.h - 5); else bx.drawImage(SPR.rival[paso], x - 1, y); }
    else if (e.t === 'critico') {
      if (e.est === 'concha') bx.drawImage(SPR.concha, x, y);
      else { if (e.vx > 0) { bx.translate(x + 16, 0); bx.scale(-1, 1); bx.drawImage(SPR.critico[paso], 0, y); } else bx.drawImage(SPR.critico[paso], x - 2, y); }
    }
    else if (e.t === 'duda') bx.drawImage(SPR.duda[paso], x - 1, y);
    else if (e.t === 'cactus') bx.drawImage(SPR.cactus, x - 3, y - 1);
    else if (e.t === 'jefe') {
      if (e.golpeado > 0 && J.f % 4 < 2) { bx.restore(); return; }
      bx.drawImage(SPR.rival[paso], x - 2, y + 2, 40, 30);
      bx.fillStyle = '#e9c874'; bx.fillRect(x + 8, y - 4, 22, 5); bx.fillRect(x + 8, y - 9, 4, 5); bx.fillRect(x + 17, y - 11, 4, 7); bx.fillRect(x + 26, y - 9, 4, 5);
      bx.fillStyle = '#d8443a'; bx.fillRect(x + 18, y - 3, 2, 2);
    }
    bx.restore();
  }
  function dibujarItem(it){
    var x = Math.round(it.x - J.cam), y = Math.round(it.y);
    if (x < -20 || x > GW + 20) return;
    if (it.t === 'moneda') { var a = Math.abs(Math.sin(J.f * .08 + it.x * .1)); var w = Math.max(2, 8 * a); bx.fillStyle = '#8f6f2a'; bx.fillRect(x + 4 - w / 2, y, w, 10); bx.fillStyle = '#e9c874'; bx.fillRect(x + 5 - w / 2, y + 1, Math.max(1, w - 2), 8); if (w > 5) { bx.fillStyle = '#8f6f2a'; bx.fillRect(x + 3, y + 3, 1, 5); bx.fillRect(x + 3, y + 3, 3, 1); bx.fillRect(x + 5, y + 3, 1, 3); bx.fillRect(x + 3, y + 5, 3, 1); } return; }
    if (it.t === 'crin') { var g = bx.createLinearGradient(x, y, x + 14, y + 14); g.addColorStop(0, '#86e7ea'); g.addColorStop(1, '#f2a9dc'); bx.fillStyle = g; bx.fillRect(x + 2, y + 2, 10, 10); bx.fillRect(x, y + 5, 14, 6); bx.fillStyle = '#fff'; bx.fillRect(x + 4, y + 4, 2, 2); return; }
    if (it.t === 'cetro') { bx.fillStyle = '#8f6f2a'; bx.fillRect(x + 6, y + 3, 2, 11); bx.fillStyle = '#e9c874'; bx.fillRect(x + 3, y, 8, 5); bx.fillStyle = J.f % 20 < 10 ? '#f2a9dc' : '#86e7ea'; bx.fillRect(x + 5, y + 1, 4, 3); return; }
    if (it.t === 'estrella') { bx.fillStyle = J.f % 8 < 4 ? '#f4e0a8' : '#f2a9dc'; bx.beginPath(); for (var i = 0; i < 10; i++) { var r = i % 2 ? 3 : 7, an = -Math.PI / 2 + i * Math.PI / 5; bx.lineTo(x + 7 + Math.cos(an) * r, y + 7 + Math.sin(an) * r); } bx.fill(); return; }
    if (it.t === 'nuggets') { bx.fillStyle = '#f5c400'; bx.fillRect(x + 1, y + 2, 12, 12); bx.fillStyle = '#e8312f'; bx.fillRect(x + 1, y + 2, 12, 3); bx.fillStyle = '#8a5a1a'; bx.fillRect(x + 4, y + 7, 2, 2); bx.fillRect(x + 8, y + 9, 2, 2); bx.fillRect(x + 6, y + 11, 2, 1); return; }
  }
  function dibujarMeta(){
    var n = J.n, c = J.cam;
    if (n.meta) {
      var x = n.meta * T + 7 - c;
      if (x > -20 && x < GW + 20) {
        bx.fillStyle = '#d8d2c4'; bx.fillRect(x, 9 * T - 150, 2, 150);
        bx.fillStyle = '#e9c874'; bx.beginPath(); bx.arc(x + 1, 9 * T - 152, 3, 0, 7); bx.fill();
        var fy = P && P.meta ? Math.min(9 * T - 30, P.y) : 9 * T - 146;
        bx.fillStyle = '#1b1150'; bx.fillRect(x - 18, fy, 18, 5); bx.fillStyle = '#d8b25c'; bx.fillRect(x - 18, fy + 5, 18, 3); bx.fillStyle = '#f2a9dc'; bx.fillRect(x - 18, fy + 8, 18, 4);
      }
    }
    var pal = n.palacio || n.trono;
    if (pal) {
      var px = pal * T - c;
      if (px > -100 && px < GW + 20) {
        bx.fillStyle = '#efe6cf'; bx.fillRect(px, 9 * T - 52, 64, 52);
        bx.fillStyle = '#d8b25c'; bx.fillRect(px - 3, 9 * T - 56, 70, 5);
        for (var i = 0; i < 5; i++) { bx.fillStyle = '#fbf6ea'; bx.fillRect(px + 4 + i * 12, 9 * T - 50, 4, 50); }
        var g = bx.createLinearGradient(px + 14, 0, px + 50, 0); g.addColorStop(0, '#86e7ea'); g.addColorStop(1, '#f2a9dc');
        bx.fillStyle = g; bx.beginPath(); bx.arc(px + 32, 9 * T - 56, 18, Math.PI, 0); bx.fill();
        bx.fillStyle = '#3b2a12'; bx.fillRect(px + 25, 9 * T - 22, 14, 22);
        if (n.trono) { bx.fillStyle = '#e9c874'; bx.fillRect(px + 26, 9 * T - 36, 12, 4); }
      }
    }
    n.deco.forEach(function(d){
      if (d.t !== 'bucees') return;
      var x = d.x * T - c;
      if (x < -60 || x > GW + 60) return;
      bx.fillStyle = '#7a7480'; bx.fillRect(x + 10, 9 * T - 56, 3, 56);
      bx.fillStyle = '#f5c400'; bx.beginPath(); bx.arc(x + 11, 9 * T - 66, 15, 0, 7); bx.fill();
      bx.strokeStyle = '#e8312f'; bx.lineWidth = 2; bx.stroke();
      bx.fillStyle = '#201a33'; bx.font = 'bold 6px sans-serif'; bx.textAlign = 'center'; bx.fillText('BUC-EE’S', x + 11, 9 * T - 64);
      bx.fillStyle = J.checkOK ? '#86e7ea' : '#d8443a'; bx.fillRect(x + 13, 9 * T - 50, 10, 6);
    });
  }
  function dibujar(){
    if (!ctx) return;
    var th = TEMAS[J.n ? J.n.tema : 'dia'];
    if (J.n) {
      fondo(th);
      dibujarMeta();
      var c0 = Math.floor(J.cam / T), c1 = Math.ceil((J.cam + GW) / T);
      for (var y = 0; y < 11; y++) for (var x = c0; x <= c1; x++) {
        var ch = celda(x, y); if (ch === '.') continue;
        var rb = 0;
        for (var i = 0; i < PART.length; i++) if (PART[i].t === 'rebote' && PART[i].cx === x && PART[i].cy === y) rb = -Math.sin((8 - PART[i].vida) / 8 * Math.PI) * 4;
        baldosa(ch, Math.round(x * T - J.cam), y * T + rb, x, y);
      }
      /* Las 11 filas miden 176 px: los 4 que faltan hasta 180 son suelo. */
      bx.fillStyle = th.suelo;
      for (var xs = c0; xs <= c1; xs++) if (celda(xs, 10) === '#') bx.fillRect(Math.round(xs * T - J.cam), 176, T, 4);
      ITEMS.forEach(dibujarItem);
      ENT.forEach(dibujarEnte);
      BALAS.forEach(function(b){ var x = Math.round(b.x - J.cam), y = Math.round(b.y); if (b.mala) { bx.fillStyle = '#f4efe2'; bx.fillRect(x - 4, y - 3, 8, 6); bx.fillStyle = '#8a8494'; bx.fillRect(x - 3, y - 1, 6, 1); bx.fillRect(x - 3, y + 1, 4, 1); } else { bx.fillStyle = ['#86e7ea', '#f2a9dc', '#f4e0a8'][J.f % 3]; bx.fillRect(x, y, 6, 6); } });
      dibujarPavel();
      PART.forEach(function(p){
        if (p.t === 'moneda') { bx.fillStyle = '#e9c874'; bx.fillRect(Math.round(p.x - J.cam), Math.round(p.y), 7, 9); }
        if (p.t === 'cascote') { bx.fillStyle = '#c47a3a'; bx.fillRect(Math.round(p.x - J.cam), Math.round(p.y), 5, 5); }
      });
    }
    /* Escalado al lienzo visible. */
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0, cv.width, cv.height);
    hud();
  }
  function texto(s, x, y, tam, color, alin, sombra){
    var k = cv.width / GW;
    ctx.font = '700 ' + Math.round(tam * k) + 'px "IBM Plex Mono", monospace';
    ctx.textAlign = alin || 'left'; ctx.textBaseline = 'top';
    if (sombra !== false) { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillText(s, x * k + Math.max(1, k * .7), y * k + Math.max(1, k * .7)); }
    ctx.fillStyle = color || '#fff'; ctx.fillText(s, x * k, y * k);
  }
  function hud(){
    var es = L() === 'es';
    if (J.fase !== 'titulo') {
      texto('PAVEL', 10, 6, 7); texto(String(J.puntos).padStart(6, '0'), 10, 14, 7);
      texto('G×' + String(J.monedas).padStart(2, '0'), 92, 14, 7, '#f4e0a8');
      texto(es ? 'MUNDO' : 'WORLD', 160, 6, 7, '#fff', 'center'); texto(J.n ? '1-' + (J.nivelN + 1) : '1-1', 160, 14, 7, '#fff', 'center');
      texto('♥×' + J.vidas, 218, 14, 7, '#f2a9dc');
      texto(es ? 'TIEMPO' : 'TIME', 310, 6, 7, '#fff', 'right'); texto(String(Math.max(0, J.tiempo)).padStart(3, '0'), 310, 14, 7, '#fff', 'right');
    }
    if (J.msjT > 0 && J.fase !== 'titulo') texto(J.msj, 160, 38, 9, '#f4e0a8', 'center');
    if (J.pausa && J.fase === 'jugando') { velo(); texto(es ? 'PAUSA' : 'PAUSED', 160, 72, 16, '#f4e0a8', 'center'); texto(es ? 'P o Enter para seguir' : 'P or Enter to resume', 160, 98, 7, '#fff', 'center'); }
    if (J.fase === 'titulo') pantallaTitulo(es);
    if (J.fase === 'gameover') { velo(); texto('GAME OVER', 160, 60, 18, '#f2a9dc', 'center'); texto(es ? 'Los Rivales celebran. Por poco tiempo.' : 'The Rivals celebrate. Not for long.', 160, 90, 7, '#fff', 'center'); texto((es ? 'Puntos ' : 'Score ') + J.puntos + '   ' + (es ? 'Récord ' : 'Best ') + J.record, 160, 106, 7, '#f4e0a8', 'center'); parpadeo(es ? 'ENTER / TOCA PARA REINTENTAR' : 'ENTER / TAP TO RETRY', 132); }
    if (J.fase === 'fin') { velo('rgba(27,17,80,.82)'); texto(es ? '¡EL REINO ESTÁ A SALVO!' : 'THE KINGDOM IS SAFE!', 160, 44, 13, '#f4e0a8', 'center'); texto(es ? 'Pavel recupera el trono. Como siempre.' : 'Pavel retakes the throne. As always.', 160, 70, 7, '#fff', 'center'); texto((es ? 'Puntos ' : 'Score ') + J.puntos, 160, 90, 9, '#86e7ea', 'center'); texto((es ? 'Récord ' : 'Best ') + J.record, 160, 104, 7, '#f2a9dc', 'center'); texto('EL NON PLUS ULTRA', 160, 122, 7, '#e9c874', 'center'); parpadeo(es ? 'ENTER / TOCA PARA JUGAR OTRA VEZ' : 'ENTER / TAP TO PLAY AGAIN', 146); }
  }
  function velo(c){ ctx.fillStyle = c || 'rgba(11,6,32,.7)'; ctx.fillRect(0, 0, cv.width, cv.height); }
  function parpadeo(s, y){ if (Math.floor(J.f / 30) % 2 === 0) texto(s, 160, y, 7, '#fff', 'center'); }
  function pantallaTitulo(es){
    var k = cv.width / GW;
    var g = ctx.createLinearGradient(0, 0, 0, cv.height); g.addColorStop(0, '#1b1150'); g.addColorStop(1, '#3a2a7a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#fff'; for (var i = 0; i < 50; i++) ctx.fillRect(((i * 61 + J.f * .2 * (i % 3 + 1)) % GW) * k, ((i * 37) % GH) * k, k, k);
    texto(es ? 'SÚPER' : 'SUPER', 160, 22, 10, '#86e7ea', 'center');
    texto('PAVEL WORLD', 160, 34, 22, '#f4e0a8', 'center');
    texto(es ? 'LA CRIN DORADA' : 'THE GOLDEN MANE', 160, 62, 7, '#f2a9dc', 'center');
    /* Pavel en el titulo. */
    bx.clearRect(0, 0, GW, GH);
    var guardado = { P: P, cam: J.cam };
    P = { x: 152, y: 98, w: 11, h: 24, vx: 1, vy: 0, suelo: true, dir: 1, forma: 1, inv: 0, estrella: 0, anim: J.f * .15, meta: false };
    J.cam = 0; dibujarPavel(); ctx.drawImage(buf, 0, 0, cv.width, cv.height);
    P = guardado.P; J.cam = guardado.cam;
    parpadeo(es ? 'ENTER O TOCA PARA EMPEZAR' : 'PRESS ENTER OR TAP TO START', 134);
    texto((es ? 'RÉCORD ' : 'BEST ') + String(J.record).padStart(6, '0'), 160, 150, 7, '#e9c874', 'center');
    texto('© ' + (es ? 'MINISTERIO DE OCIO DEL REINO' : 'KINGDOM MINISTRY OF LEISURE') + ' · MMXXVI', 160, 166, 5, 'rgba(244,239,226,.6)', 'center', false);
  }

  /* ---------- Bucle y controles ---------- */
  function lienzo(){
    var c = doc.getElementById('pvl-sp-canvas');
    if (!montado(c)) return false;
    if (c !== cv) {
      cv = c; ctx = cv.getContext('2d');
      if (!buf) { buf = doc.createElement('canvas'); buf.width = GW; buf.height = GH; bx = buf.getContext('2d'); bx.imageSmoothingEnabled = false; }
      if (!SPR.uni) crearSprites();
      pintarRecord();
    }
    var r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.max(320, Math.round(r.width * dpr)), h = Math.round(w * 9 / 16);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    return true;
  }
  var acum = 0, ultimo = 0, visible = true;
  function bucle(now){
    requestAnimationFrame(bucle);
    if (!lienzo()) return;
    var dt = Math.min(100, now - (ultimo || now)); ultimo = now;
    var corriendo = J.fase !== 'titulo' && !J.pausa && visible;
    if (corriendo || J.fase === 'titulo' || J.fase === 'fin' || J.fase === 'gameover') {
      acum += dt;
      while (acum >= 1000 / 60) { acum -= 1000 / 60; if (corriendo) paso(); else J.f++; }
    }
    if (visible) dibujar();
  }
  function empezar(){
    audio();
    var a = doc.getElementById('pavel-audio'); if (a && !a.paused) a.pause();
    setTimeout(function(){ var h = doc.getElementById('pavel-audio'); if (h && !h.paused && J.activo) h.pause(); }, 250);
    J.vidas = 3; J.puntos = 0; J.monedas = 0; P = null; J.jefeCreado = false; J.jefeDespierto = false;
    /* ?juego-nivel=2 o 3 empieza en ese mundo (para probarlo sin jugar los anteriores). */
    var nv = 0; try { nv = Math.max(0, Math.min(NIVELES.length - 1, (+new URLSearchParams(location.search).get('juego-nivel') || 1) - 1)); } catch (e) {}
    cargarNivel(nv); musica(true);
  }
  function activar(){
    J.activo = true;
    var w = doc.getElementById('pvl-sp-wrap'); if (w) w.classList.add('pvl-sp-activo');
  }
  var TECLAS = { ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, ' ': 1, z: 1, Z: 1, x: 1, X: 1, a: 1, A: 1, d: 1, D: 1, w: 1, W: 1, s: 1, S: 1, Shift: 1, Enter: 1, p: 1, P: 1, m: 1, M: 1, Escape: 1 };
  doc.addEventListener('keydown', function(e){
    if (!J.activo || !TECLAS[e.key]) return;
    if (e.target && e.target.closest && e.target.closest('input, textarea, select')) return;
    if (e.key === 'Escape') { if (J.fase === 'jugando') J.pausa = true; J.activo = false; var w = doc.getElementById('pvl-sp-wrap'); if (w) w.classList.remove('pvl-sp-activo'); return; }
    e.preventDefault();
    if (e.key === 'Enter') {
      if (J.fase === 'titulo' || J.fase === 'gameover' || J.fase === 'fin') { empezar(); return; }
      J.pausa = !J.pausa; return;
    }
    if (e.key === 'p' || e.key === 'P') { if (J.fase === 'jugando') J.pausa = !J.pausa; return; }
    if (e.key === 'm' || e.key === 'M') { mudo = !mudo; pintarMudo(); return; }
    teclas[e.key] = true;
  });
  doc.addEventListener('keyup', function(e){ if (TECLAS[e.key]) teclas[e.key] = false; });
  window.addEventListener('blur', function(){ teclas = {}; if (J.fase === 'jugando') J.pausa = true; });
  function pintarMudo(){ var b = doc.getElementById('pvl-sp-mudo'); if (b) { b.setAttribute('aria-pressed', mudo ? 'true' : 'false'); b.textContent = mudo ? '🔇' : '🔊'; } }
  doc.addEventListener('pointerdown', function(e){
    var t = e.target;
    var tb = t.closest && t.closest('[data-pvl-sp-tecla]');
    if (tb) { e.preventDefault(); activar(); audio(); teclas[tb.getAttribute('data-pvl-sp-tecla')] = true; tb.setPointerCapture && tb.setPointerCapture(e.pointerId); if (J.fase === 'titulo' || J.fase === 'gameover' || J.fase === 'fin') empezar(); return; }
    if (t.closest && t.closest('#pvl-sp-canvas')) {
      activar();
      if (J.fase === 'titulo' || J.fase === 'gameover' || J.fase === 'fin') empezar();
      else if (J.pausa) J.pausa = false;
      return;
    }
    if (t.closest && t.closest('#pvl-sp-mudo')) return;
    if (J.activo && !(t.closest && t.closest('#pvl-sp-wrap'))) { J.activo = false; if (J.fase === 'jugando') J.pausa = true; var w = doc.getElementById('pvl-sp-wrap'); if (w) w.classList.remove('pvl-sp-activo'); }
  });
  function soltar(e){ var tb = e.target.closest && e.target.closest('[data-pvl-sp-tecla]'); if (tb) teclas[tb.getAttribute('data-pvl-sp-tecla')] = false; }
  doc.addEventListener('pointerup', soltar);
  doc.addEventListener('pointercancel', soltar);
  doc.addEventListener('click', function(e){
    if (e.target.closest && e.target.closest('#pvl-sp-mudo')) { audio(); mudo = !mudo; pintarMudo(); }
    if (e.target.closest && e.target.closest('#pvl-sp-jugar')) { activar(); empezar(); var c = doc.getElementById('pvl-sp-canvas'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){ visible = es[0].isIntersecting; if (!visible && J.fase === 'jugando') J.pausa = true; ultimo = 0; });
    var mirar = setInterval(function(){ var c = doc.getElementById('pvl-sp-canvas'); if (montado(c)) { io.disconnect(); io.observe(c); if (c === cv) clearInterval(mirar); } }, 600);
  }
  requestAnimationFrame(bucle);
})();
