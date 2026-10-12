/* Street View premium del Mapa del Reino (pvl-sv2-). Mismo candado de doble
   ejecucion que el resto de <helmet>. mapa.js llama a
   window.PavelStreetView.abrir(contenedor, id, opciones) y este motor pinta la
   escena en un <canvas>: proyeccion cilindrica de 360° sin costuras, capas a
   distintas distancias (montes, dunas, edificios, objetos cercanos) con
   paralaje al arrastrar, suelo en perspectiva con la carretera hacia su punto
   de fuga, bruma, sombras segun el sol, reflejos en el agua, nubes, pajaros,
   un unicornio que pasea y banderas al viento; modo nocturno con ventanas
   encendidas; mirada en dos ejes con inercia, zoom (rueda, botones, pellizco,
   teclado), tira de miniaturas, minimapa con el cono de vision, flechas para
   caminar al punto siguiente, pantalla completa y descarga de la vista.
   Todo en el navegador: sin teselas ni servicios ni origenes nuevos. Con
   prefers-reduced-motion no hay animacion ambiental ni inercia. */
(function(){
  if (window.PavelStreetView) return;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function t(o){ return o[lang()] || o.en; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var quieto = false;
  try { quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var TAU = Math.PI * 2;
  function ang(a){ a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; }
  function lerp(a, b, k){ return a + (b - a) * k; }
  function mezcla(c1, c2, k){
    var a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
    var r = Math.round(lerp(a >> 16, b >> 16, k)), g = Math.round(lerp(a >> 8 & 255, b >> 8 & 255, k)), bl = Math.round(lerp(a & 255, b & 255, k));
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }
  function rnd(seed){ return function(){ seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }

  /* ================= Escenas =================
     Angulos en radianes desde el norte, en sentido horario; distancias y
     alturas en metros. La camara esta a 1,7 m del suelo. */
  var CH = 1.7;
  var ESC = {
    'palacio': { vista: 0, cielo: ['#5d9bf0', '#dff0ff'], bruma: '#e6eefa', suelo: ['#cdbf9f', '#e4dac2'], sol: [1.1, .45],
      capas: [{ d: 900, h: 70, c: '#9fb2d4', s: 3 }, { d: 300, h: 26, c: '#8aa27d', s: 9 }],
      carretera: [{ b: 0, w: 4, c: '#8f8a80', linea: '#f4efe2' }],
      objetos: [
        { t: 'palacio', b: 0, d: 120 }, { t: 'bandera', b: 0.012, d: 120, h: 44 },
        { t: 'estatua', b: 0.7, d: 14 }, { t: 'farola', b: 0.42, d: 12 }, { t: 'farola', b: -0.42, d: 12 }, { t: 'farola', b: 0.17, d: 34 }, { t: 'farola', b: -0.17, d: 34 }, { t: 'farola', b: 0.09, d: 64 }, { t: 'farola', b: -0.09, d: 64 },
        { t: 'tienda', b: 2.3, d: 20, n: 'PASTELERÍA GRANDEZA', c: '#f2a9dc' }, { t: 'tienda', b: 2.75, d: 20, n: 'BARBERÍA REAL', c: '#86e7ea' },
        { t: 'tienda', b: -2.3, d: 20, n: 'LIBRERÍA PAVEL', c: '#e9c874' }, { t: 'tienda', b: -2.75, d: 20, n: 'CAFÉ NON PLUS', c: '#b9a6ff' },
        { t: 'cartel', b: -0.75, d: 13, n: 'PLAZA UNICORNIO', s: { es: 'Centro del universo', en: 'Centre of the universe' } },
        { t: 'arbol', b: 1.55, d: 16 }, { t: 'arbol', b: -1.55, d: 16 }, { t: 'arbol', b: 1.9, d: 24 }, { t: 'arbol', b: -1.9, d: 24 }
      ], unicornio: 22 },
    'bucees-desierto': { vista: 1.15, cielo: ['#4f97ef', '#ffe7bd'], bruma: '#f6e3c4', suelo: ['#d9a865', '#efcf98'], sol: [-0.9, .6],
      capas: [{ d: 1200, h: 90, c: '#d6b38a', s: 4 }, { d: 250, h: 9, c: '#e2bb7c', s: 12, duna: 1 }],
      carretera: [{ b: 0.4, w: 5, c: '#55524f', linea: '#f2c200' }],
      objetos: [
        { t: 'bucees', b: 1.35, d: 85, w: 140 }, { t: 'surtidores', b: 1.05, d: 40 },
        { t: 'cactus', b: -1.2, d: 12 }, { t: 'cactus', b: -2.1, d: 25 }, { t: 'cactus', b: 2.6, d: 18 },
        { t: 'cartel', b: 0.62, d: 10, n: 'BUC-EE’S', s: { es: 'Siguiente: 41 km', en: 'Next one: 41 km' } }
      ], unicornio: 26, calor: 1 },
    'bucees-norte': { vista: 0.5, cielo: ['#4d8ff0', '#e3f1ff'], bruma: '#e2ecf6', suelo: ['#6f9e55', '#a9cc8c'], sol: [2.0, .5],
      capas: [{ d: 1000, h: 110, c: '#9fb0c6', s: 2 }, { d: 300, h: 30, c: '#6d955a', s: 7 }],
      carretera: [{ b: -0.2, w: 5, c: '#5d5a56', linea: '#f4efe2' }],
      objetos: [
        { t: 'bucees', b: 0.7, d: 60, w: 90 }, { t: 'surtidores', b: 0.45, d: 28 },
        { t: 'arbol', b: -1.0, d: 14 }, { t: 'arbol', b: -1.3, d: 22 }, { t: 'arbol', b: -1.7, d: 12 }, { t: 'arbol', b: 2.4, d: 15 }, { t: 'arbol', b: 2.8, d: 26 }, { t: 'arbol', b: -2.6, d: 18 },
        { t: 'cartel', b: -0.45, d: 9, n: 'PAVELÓPOLIS', s: { es: '14 km · Palacio', en: '14 km · Palace' } }
      ], unicornio: 20 },
    'lago': { vista: 0.35, cielo: ['#7aaaf5', '#fde6f4'], bruma: '#f3e6f4', suelo: ['#78b06a', '#a9d39a'], sol: [0.2, .3],
      capas: [{ d: 1100, h: 160, c: '#a796d4', s: 5 }, { d: 420, h: 40, c: '#5e8c56', s: 8 }],
      agua: { a0: -1.3, a1: 1.6, d: 9, c: ['#86e7ea', '#f2a9dc', '#9fb6f2'] },
      objetos: [
        { t: 'arbol', b: 2.0, d: 10 }, { t: 'arbol', b: 2.4, d: 14 }, { t: 'arbol', b: -1.8, d: 11 }, { t: 'arbol', b: -2.3, d: 16 }, { t: 'arbol', b: 3.0, d: 20 },
        { t: 'barca', b: 0.6, d: 60 }, { t: 'cartel', b: 2.5, d: 10, n: { es: 'PROHIBIDO NADAR', en: 'NO SWIMMING' }, s: { es: 'salvo unicornios', en: 'unicorns excepted' } }
      ], unicornio: 13 },
    'monte': { vista: 0.15, cielo: ['#1c3478', '#9ec4ff'], bruma: '#dfe8ff', suelo: ['#e9eef8', '#ffffff'], sol: [-2.4, .25],
      capas: [{ d: 3000, h: -260, c: '#8fa4cf', s: 6 }, { d: 1500, h: -380, c: '#6f86b9', s: 8 }],
      marDeNubes: 1,
      objetos: [
        { t: 'bandera', b: 0.05, d: 16, h: 7 }, { t: 'mirador', b: 1.4, d: 9 }, { t: 'bucees', b: -1.6, d: 24, w: 30 },
        { t: 'cartel', b: 0.95, d: 10, n: '8.849 m', s: { es: 'Cumbre Non Plus Ultra', en: 'Non Plus Ultra summit' } }
      ], unicornio: 9, nieve: 1 },
    'desierto': { vista: 0.15, cielo: ['#5fa2f2', '#fff0cf'], bruma: '#fbebcf', suelo: ['#d9b073', '#f0d59f'], sol: [0, .7],
      capas: [{ d: 1500, h: 60, c: '#dcbf92', s: 6 }, { d: 300, h: 14, c: '#e7c487', s: 13, duna: 1 }, { d: 90, h: 4, c: '#e9c98f', s: 21, duna: 1 }],
      objetos: [
        { t: 'cactus', b: -0.6, d: 9 }, { t: 'cactus', b: 0.9, d: 22 }, { t: 'cactus', b: 2.2, d: 14 }, { t: 'cactus', b: -2.4, d: 30 },
        { t: 'cartel', b: 0.15, d: 8, n: { es: 'RIVALES CENSADOS', en: 'RIVALS ON RECORD' }, s: '0' }
      ], unicornio: 18, calor: 1 },
    'puerto': { vista: 0.15, cielo: ['#5aa0f0', '#e2f2ff'], bruma: '#e4eef8', suelo: ['#9a917f', '#b8ae9b'], sol: [1.9, .35],
      capas: [{ d: 2500, h: 50, c: '#9fb6d6', s: 3 }],
      agua: { a0: -1.4, a1: 1.5, d: 6, c: ['#2f6fb0', '#4f93cf', '#3a80c2'] },
      objetos: [
        { t: 'faro', b: -0.9, d: 45 }, { t: 'barco', b: 0.3, d: 150 }, { t: 'barco', b: 1.0, d: 260, k: .7 },
        { t: 'grua', b: 2.2, d: 30 }, { t: 'contenedores', b: 2.7, d: 22 }, { t: 'farola', b: -2.4, d: 8 },
        { t: 'cartel', b: -2.0, d: 7, n: { es: 'EXPORTACIONES', en: 'EXPORTS' }, s: { es: 'Grandeza a granel', en: 'Greatness, in bulk' } }
      ], unicornio: 0 }
  };

  /* ================= Estado ================= */
  var S = null; /* sesion abierta */
  function nuevaSesion(cont, id, op){
    return { cont: cont, id: id, op: op || {}, yaw: 0, pitch: -0.02, fov: 1.45, vy: 0, vp: 0, sway: 0, noche: false,
      t0: performance.now(), t: 0, raf: 0, sucio: true, flechas: [], arrastre: null, punteros: {}, trans: 0, transA: null,
      nubes: [], pajaros: [], ruido: null };
  }

  /* ================= Pintura ================= */
  function pintar(s, ctx, W, H, opciones){
    var e = ESC[s.id]; if (!e) return;
    var o = opciones || {};
    var yaw = o.yaw !== undefined ? o.yaw : s.yaw, pitch = o.pitch !== undefined ? o.pitch : s.pitch, fov = o.fov || s.fov;
    var F = W / fov, cx = W / 2, hz = H / 2 + pitch * F, sway = o.sway !== undefined ? o.sway : s.sway, tm = o.t !== undefined ? o.t : s.t;
    var noche = o.noche !== undefined ? o.noche : s.noche;
    var luces = [];
    function X(b, d){ return cx + ang(b - yaw) * F + sway * (6 / Math.max(d, 1)) * F * .02; }
    function visible(b, half){ return Math.abs(ang(b - yaw)) < fov / 2 + (half || 0.2); }
    function suelo(d){ return hz + (CH / d) * F; }
    function px(d){ return F / d; } /* pixeles por metro a distancia d */

    /* --- cielo --- */
    var c0 = noche ? '#070418' : e.cielo[0], c1 = noche ? '#2a1a66' : e.cielo[1];
    var g = ctx.createLinearGradient(0, hz - F * .9, 0, hz);
    g.addColorStop(0, c0); g.addColorStop(1, c1);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, Math.max(0, hz + 2));
    if (noche) {
      var r = rnd(7);
      ctx.fillStyle = '#fff';
      for (var i = 0; i < 160; i++) {
        var sb = r() * TAU, se = r() * .9 + .05, sx = X(sb, 1e6), sy = hz - Math.tan(se) * F;
        if (sx > -2 && sx < W + 2 && sy < hz) { ctx.globalAlpha = .4 + .6 * Math.abs(Math.sin(tm * .002 + i)); ctx.fillRect(sx, sy, 1.6, 1.6); }
      }
      ctx.globalAlpha = 1;
    }
    /* sol o luna */
    var sunB = e.sol[0], sunE = e.sol[1];
    if (visible(sunB, .5)) {
      var sx2 = X(sunB, 1e6), sy2 = hz - Math.tan(sunE) * F;
      var rg = ctx.createRadialGradient(sx2, sy2, 0, sx2, sy2, F * .35);
      rg.addColorStop(0, noche ? 'rgba(240,240,255,.95)' : 'rgba(255,250,220,1)'); rg.addColorStop(.08, noche ? 'rgba(220,225,255,.8)' : 'rgba(255,240,190,.9)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(sx2, sy2, F * .35, 0, TAU); ctx.fill();
      ctx.fillStyle = noche ? '#f4f4ff' : '#fff8d8'; ctx.beginPath(); ctx.arc(sx2, sy2, F * .028, 0, TAU); ctx.fill();
    }
    /* nubes */
    s.nubes.forEach(function(n){
      if (!visible(n.b, .4)) return;
      var nx = X(n.b, 1e6), ny = hz - Math.tan(n.e) * F, sz = n.s * F * .05;
      ctx.fillStyle = noche ? 'rgba(120,110,170,.35)' : 'rgba(255,255,255,.82)';
      for (var k = 0; k < 5; k++) { ctx.beginPath(); ctx.ellipse(nx + (k - 2) * sz * .7, ny + Math.sin(k * 2.1) * sz * .15, sz * (0.6 + (k % 2) * .25), sz * .38, 0, 0, TAU); ctx.fill(); }
    });
    /* pajaros */
    if (!noche) s.pajaros.forEach(function(p){
      if (!visible(p.b, .2)) return;
      var bx = X(p.b, 1e6), by = hz - Math.tan(p.e) * F, a = Math.sin(tm * .012 + p.f) * 4;
      ctx.strokeStyle = 'rgba(40,30,60,.75)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(bx - 7, by - a); ctx.quadraticCurveTo(bx - 3, by - 3, bx, by); ctx.quadraticCurveTo(bx + 3, by - 3, bx + 7, by - a); ctx.stroke();
    });

    /* --- capas lejanas (montes, dunas) --- */
    e.capas.forEach(function(L, li){
      var bru = Math.min(.75, L.d / 2200);
      var col = noche ? mezcla(L.c.indexOf('#') === 0 ? L.c : '#888888', '#1b1150', .7) : mezcla(L.c, e.bruma, bru);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (var x = 0; x <= W + 4; x += 4) {
        var b = yaw + (x - cx) / F;
        var h = L.duna ? (Math.sin(b * L.s) * .6 + Math.sin(b * L.s * 2.3 + 1) * .4 + 1) * L.h * .5
          : (Math.sin(b * L.s + li) * .5 + Math.sin(b * L.s * 2.7 + 2) * .3 + Math.sin(b * L.s * 6.1) * .12 + .6) * L.h;
        var y = hz - ((h - CH) / L.d) * F;
        ctx.lineTo(x - sway * (6 / L.d) * F * .02, y);
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      /* nieve en las cumbres altas */
      if (!L.duna && L.h > 100 && !noche) {
        ctx.save(); ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(0, hz - (L.h * .95 / L.d) * F, W, (L.h * .25 / L.d) * F);
        ctx.restore();
      }
    });
    if (e.marDeNubes) {
      ctx.fillStyle = noche ? 'rgba(80,70,130,.6)' : 'rgba(255,255,255,.9)';
      for (var mx = -40; mx < W + 40; mx += 34) {
        var mb = yaw + (mx - cx) / F;
        var my = hz + F * .05 + Math.sin(mb * 9 + tm * .0003) * 4;
        ctx.beginPath(); ctx.ellipse(mx, my, 34, 12 + Math.abs(Math.sin(mb * 5)) * 8, 0, 0, TAU); ctx.fill();
      }
    }

    /* --- suelo --- */
    /* en la cumbre el suelo acaba en el borde de la cima: mas alla, el mar de nubes y los montes de abajo */
    var dFin = e.marDeNubes ? 28 : 1e6, ySuelo0 = e.marDeNubes ? suelo(dFin) : hz;
    var gs = ctx.createLinearGradient(0, ySuelo0, 0, H);
    gs.addColorStop(0, noche ? '#1a1236' : mezcla(e.suelo[1], e.bruma, e.marDeNubes ? .1 : .6)); gs.addColorStop(1, noche ? '#0d0820' : e.suelo[0]);
    ctx.fillStyle = gs;
    if (e.marDeNubes) { /* borde irregular de la cima */
      ctx.beginPath(); ctx.moveTo(0, H);
      for (var xe = 0; xe <= W + 6; xe += 6) { var be = yaw + (xe - cx) / F; ctx.lineTo(xe, ySuelo0 + (Math.sin(be * 7) * .5 + Math.sin(be * 17 + 1) * .3) * F * .012); }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    } else ctx.fillRect(0, Math.max(0, hz), W, H - hz);
    /* textura del suelo en perspectiva */
    ctx.fillStyle = noche ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.045)';
    for (var dd = 2; dd < Math.min(200, dFin); dd *= 1.22) { var yy = suelo(dd); ctx.fillRect(0, yy, W, Math.max(1, (CH / dd - CH / (dd * 1.08)) * F)); }
    if (e.nieve && !noche) { ctx.fillStyle = 'rgba(255,255,255,.6)'; for (var sn = 0; sn < 50; sn++) { var sbn = (sn * 2.399) % TAU; if (visible(sbn)) { var sd = 3 + (sn * 7) % 30; ctx.fillRect(X(sbn, sd), suelo(sd), 3, 1.5); } } }

    /* --- agua y reflejos --- */
    var agua = e.agua;
    if (agua) {
      ctx.save();
      ctx.beginPath();
      var a0 = agua.a0, a1 = agua.a1;
      for (var xa = 0; xa <= W; xa += 6) {
        var ba = yaw + (xa - cx) / F, rel = ang(ba - (a0 + a1) / 2), half = (a1 - a0) / 2;
        var dW = Math.abs(rel) < half ? agua.d / Math.max(.2, Math.cos(Math.min(1.3, Math.abs(rel) / half * 1.2))) : 1e5;
        var ya = suelo(Math.min(dW, 1e5));
        if (xa === 0) ctx.moveTo(xa, hz); ctx.lineTo(xa, Math.min(H, ya));
      }
      ctx.lineTo(W, hz); ctx.closePath();
      ctx.clip();
      var gw = ctx.createLinearGradient(0, hz, 0, H);
      gw.addColorStop(0, noche ? '#2a1a66' : mezcla(agua.c[0], e.cielo[1], .45)); gw.addColorStop(.5, noche ? '#140c3a' : agua.c[1]); gw.addColorStop(1, noche ? '#0b0620' : agua.c[2]);
      ctx.fillStyle = gw; ctx.fillRect(0, hz, W, H - hz);
      /* reflejo del cielo, el sol y los montes: espejo vertical en el horizonte */
      ctx.globalAlpha = .28;
      ctx.translate(0, hz * 2); ctx.scale(1, -1);
      e.capas.forEach(function(L){
        ctx.fillStyle = noche ? '#2a1a66' : L.c;
        ctx.beginPath(); ctx.moveTo(0, hz);
        for (var x = 0; x <= W + 4; x += 6) { var b = yaw + (x - cx) / F; var h = (Math.sin(b * L.s) * .5 + Math.sin(b * L.s * 2.7 + 2) * .3 + .6) * Math.abs(L.h); ctx.lineTo(x, hz - ((h - CH) / L.d) * F); }
        ctx.lineTo(W, hz); ctx.closePath(); ctx.fill();
      });
      if (visible(sunB, .3)) { ctx.fillStyle = noche ? 'rgba(230,230,255,.9)' : 'rgba(255,245,200,1)'; ctx.beginPath(); ctx.ellipse(X(sunB, 1e6), hz - Math.tan(sunE) * F, F * .03, F * .06, 0, 0, TAU); ctx.fill(); }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      if (o.escala) ctx.setTransform(o.escala, 0, 0, o.escala, 0, 0);
      /* ondas */
      ctx.strokeStyle = noche ? 'rgba(200,190,255,.12)' : 'rgba(255,255,255,.35)'; ctx.lineWidth = 1;
      for (var wv = 0; wv < 22; wv++) {
        var wd = 4 + wv * wv * .9, wy = suelo(wd);
        ctx.beginPath();
        for (var wx = 0; wx <= W; wx += 12) ctx.lineTo(wx, wy + Math.sin(wx * .05 + tm * .002 * (quieto ? 0 : 1) + wv) * Math.max(.6, 3 / Math.sqrt(wd)));
        ctx.stroke();
      }
      ctx.restore();
    }

    /* --- carreteras --- */
    (e.carretera || []).forEach(function(R){
      [R.b, R.b + Math.PI].forEach(function(rb){
        if (!visible(rb, 1.2)) return;
        var izq = [], der = [];
        for (var d = 1.2; d < 600; d *= 1.15) {
          var off = Math.atan(R.w / d);
          izq.push([X(rb - off, d), suelo(d)]); der.push([X(rb + off, d), suelo(d)]);
        }
        ctx.fillStyle = noche ? '#14102a' : R.c;
        ctx.beginPath(); ctx.moveTo(izq[0][0], izq[0][1]);
        izq.forEach(function(p){ ctx.lineTo(p[0], p[1]); }); for (var k = der.length - 1; k >= 0; k--) ctx.lineTo(der[k][0], der[k][1]);
        ctx.closePath(); ctx.fill();
        /* linea central discontinua */
        ctx.fillStyle = R.linea;
        for (var dd2 = 1.6; dd2 < 220; dd2 *= 1.3) {
          var y1 = suelo(dd2), y2 = suelo(dd2 * 1.12), x1 = X(rb, dd2), x2 = X(rb, dd2 * 1.12), wl = Math.max(.5, .12 / dd2 * F);
          ctx.beginPath(); ctx.moveTo(x1 - wl, y1); ctx.lineTo(x2 - wl * .9, y2); ctx.lineTo(x2 + wl * .9, y2); ctx.lineTo(x1 + wl, y1); ctx.fill();
        }
      });
    });

    /* --- objetos, de lejos a cerca --- */
    var objs = (e.objetos || []).slice();
    if (e.unicornio && !o.sinVida) objs.push({ t: 'unicornio', b: (tm * (quieto ? 0 : .00004) + .9) % TAU, d: e.unicornio });
    objs.sort(function(a, b){ return b.d - a.d; });
    objs.forEach(function(ob){
      var half = Math.atan(((ob.w || 30) / 2) / ob.d) + .1;
      if (!visible(ob.b, half)) return;
      var x = X(ob.b, ob.d), y = suelo(ob.d), k = px(ob.d);
      var niebla = Math.min(.6, ob.d / 400);
      /* sombra hacia el lado contrario al sol */
      var lado = ang(sunB - ob.b) > 0 ? -1 : 1;
      var sw0 = ob.w || SOMBRA[ob.t] || 0;
      if (!noche && sw0) {
        var alto = ALTO[ob.t] || 3;
        ctx.fillStyle = 'rgba(30,20,50,.2)';
        ctx.beginPath(); ctx.ellipse(x + lado * (sw0 * .5 + alto * .35) * k, y + 1, (sw0 * .5 + alto * .35) * k, Math.max(1, k * Math.min(1.4, sw0 * .12)), 0, 0, TAU); ctx.fill();
      }
      ctx.save();
      /* bruma atmosferica: lo lejano se funde con el cielo */
      if (!noche && niebla > .05) ctx.globalAlpha = 1 - niebla * .55;
      DIB[ob.t] && DIB[ob.t](ctx, x, y, k, ob, { tm: tm, noche: noche, luces: luces, lado: lado, F: F });
      ctx.restore();
    });

    /* --- noche: oscurecer y encender luces --- */
    if (noche) {
      ctx.fillStyle = 'rgba(8,4,30,.35)'; ctx.fillRect(0, 0, W, H);
      luces.forEach(function(l){
        var rg2 = ctx.createRadialGradient(l[0], l[1], 0, l[0], l[1], l[2] * 4);
        rg2.addColorStop(0, 'rgba(255,220,140,.9)'); rg2.addColorStop(.25, 'rgba(255,200,120,.35)'); rg2.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.fillStyle = rg2; ctx.beginPath(); ctx.arc(l[0], l[1], l[2] * 4, 0, TAU); ctx.fill();
      });
    }
    /* calima del desierto */
    if (e.calor && !noche && !quieto && !o.sinVida) {
      ctx.fillStyle = 'rgba(255,240,210,.08)';
      for (var hq = 0; hq < 6; hq++) ctx.fillRect(0, hz - 6 + hq * 3 + Math.sin(tm * .004 + hq) * 1.5, W, 2);
    }
    /* bruma en el horizonte */
    var gh = ctx.createLinearGradient(0, hz - F * .08, 0, hz + F * .06);
    var hcol = noche ? '42,26,102' : (function(c){ var n = parseInt(c.slice(1), 16); return (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255); })(e.bruma);
    gh.addColorStop(0, 'rgba(' + hcol + ',0)'); gh.addColorStop(.5, 'rgba(' + hcol + ',.35)'); gh.addColorStop(1, 'rgba(' + hcol + ',0)');
    ctx.fillStyle = gh; ctx.fillRect(0, hz - F * .08, W, F * .14);

    /* --- flechas para caminar a otros puntos --- */
    if (!o.sinUI) {
      s.flechas = [];
      (s.op.vecinos || []).forEach(function(v){
        if (!visible(v.b, .05)) return;
        var d = 12, ax = X(v.b, d), ay = suelo(d), k2 = Math.max(px(d), 26);
        ctx.save();
        ctx.translate(ax, ay);
        ctx.scale(1, .45);
        ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.strokeStyle = 'rgba(27,17,80,.6)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, -k2 * 1.4); ctx.lineTo(k2 * 1.1, k2 * .4); ctx.lineTo(0, -k2 * .2); ctx.lineTo(-k2 * 1.1, k2 * .4); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
        ctx.font = "600 12px 'IBM Plex Sans', sans-serif"; ctx.textAlign = 'center';
        var tw = ctx.measureText(v.n).width + 14;
        ctx.fillStyle = 'rgba(27,17,80,.78)'; ctx.fillRect(ax - tw / 2, ay + k2 * .5, tw, 20);
        ctx.fillStyle = '#fff'; ctx.fillText(v.n, ax, ay + k2 * .5 + 14);
        s.flechas.push({ id: v.id, x: ax, y: ay, r: Math.max(26, k2 * 1.4), ty: ay + k2 * .5 + 20 });
      });
    }

    /* --- grano y vineta: aspecto de camara --- */
    if (!o.sinUI) {
      if (s.ruido) { ctx.globalAlpha = .06; ctx.fillStyle = ctx.createPattern(s.ruido, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      var vg = ctx.createRadialGradient(cx, H / 2, Math.min(W, H) * .35, cx, H / 2, Math.max(W, H) * .75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    }
  }

  /* Ancho (m) de la base que proyecta sombra y altura aproximada, por tipo. */
  var SOMBRA = { palacio: 64, estatua: 3, farola: .5, tienda: 9, cartel: 3.4, arbol: 3.5, cactus: 1.4, surtidores: 26, mirador: 4, faro: 6, grua: 2, contenedores: 15, bandera: .4, unicornio: 2.2 };
  var ALTO = { palacio: 22, estatua: 6, farola: 4.5, tienda: 7, cartel: 4, arbol: 6, cactus: 3.4, surtidores: 6, mirador: 2, faro: 30, grua: 18, contenedores: 6, bandera: 6, unicornio: 2.4 };

  /* ================= Objetos =================
     Cada uno recibe (ctx, x, ySuelo, pixelesPorMetro, objeto, info). */
  function caja(ctx, x, y, w, h, col, lado, k){
    var g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    var claro = mezcla(col, '#ffffff', .18), oscuro = mezcla(col, '#000000', .2);
    g.addColorStop(0, lado < 0 ? claro : oscuro); g.addColorStop(1, lado < 0 ? oscuro : claro);
    ctx.fillStyle = g; ctx.fillRect(x - w / 2, y - h, w, h);
    /* oclusion ambiental en la base */
    var ao = ctx.createLinearGradient(0, y - Math.min(h, k * 1.2), 0, y);
    ao.addColorStop(0, 'rgba(0,0,0,0)'); ao.addColorStop(1, 'rgba(0,0,0,.25)');
    ctx.fillStyle = ao; ctx.fillRect(x - w / 2, y - Math.min(h, k * 1.2), w, Math.min(h, k * 1.2));
  }
  function ventanas(ctx, x0, y0, w, h, cols, filas, k, info, color){
    var vw = w / (cols * 1.8), vh = h / (filas * 2);
    for (var i = 0; i < cols; i++) for (var j = 0; j < filas; j++) {
      var vx = x0 + (i + .4) * w / cols, vy = y0 + (j + .5) * h / filas;
      var lit = info.noche && ((i * 7 + j * 3) % 5 !== 0);
      ctx.fillStyle = lit ? '#ffd98a' : (color || 'rgba(60,70,110,.55)');
      ctx.fillRect(vx, vy, vw, vh);
      if (lit) info.luces.push([vx + vw / 2, vy + vh / 2, Math.max(2, vw * .6)]);
    }
  }
  var DIB = {
    palacio: function(c, x, y, k, o, info){
      var w = 64 * k, h = 22 * k;
      caja(c, x, y, w, h, '#f1ebdc', info.lado, k);
      c.fillStyle = '#d8b25c'; c.fillRect(x - w / 2, y - h - 1.5 * k, w, 1.5 * k);
      ventanas(c, x - w / 2, y - h, w, h * .8, 12, 2, k, info, 'rgba(91,42,134,.75)');
      /* columnas y puerta */
      c.fillStyle = '#e4dac2'; for (var i = 0; i < 6; i++) c.fillRect(x - 8 * k + i * 3.1 * k, y - 12 * k, 1.1 * k, 12 * k);
      c.fillStyle = '#5b2a86'; c.fillRect(x - 2.4 * k, y - 7 * k, 4.8 * k, 7 * k);
      /* cupula con brillo */
      var gd = c.createRadialGradient(x - 4 * k, y - h - 12 * k, 1, x, y - h - 6 * k, 14 * k);
      gd.addColorStop(0, '#fff2c0'); gd.addColorStop(.4, '#e9c874'); gd.addColorStop(1, '#a8802f');
      c.fillStyle = gd; c.beginPath(); c.arc(x, y - h, 12 * k, Math.PI, 0); c.fill();
      c.fillStyle = '#f1ebdc'; c.fillRect(x - 13 * k, y - h, 26 * k, 1.2 * k);
      c.fillStyle = '#d8b25c'; c.fillRect(x - .4 * k, y - h - 18 * k, .8 * k, 6 * k);
      /* torres */
      [-1, 1].forEach(function(sg){ caja(c, x + sg * 30 * k, y, 8 * k, 30 * k, '#efe6d0', info.lado, k); c.fillStyle = '#5b2a86'; c.beginPath(); c.moveTo(x + sg * 30 * k - 5 * k, y - 30 * k); c.lineTo(x + sg * 30 * k, y - 38 * k); c.lineTo(x + sg * 30 * k + 5 * k, y - 30 * k); c.fill(); });
    },
    bandera: function(c, x, y, k, o, info){
      var h = (o.h || 8) * k, fw = Math.max(10, (o.h || 8) * .45 * k), fh = fw * .62;
      c.fillStyle = '#8f6f2a'; c.fillRect(x - .08 * k - 1, y - h, Math.max(1.5, .16 * k), h);
      var cols = ['#1b1150', '#d8b25c', '#86e7ea', '#f2a9dc'];
      for (var i = 0; i < 4; i++) {
        c.fillStyle = cols[i]; c.beginPath();
        for (var s2 = 0; s2 <= 12; s2++) { var u = s2 / 12, wv = Math.sin(u * 5 - info.tm * .006 * (quieto ? 0 : 1)) * fh * .12 * u; c.lineTo(x + u * fw, y - h + i * fh / 4 + wv); }
        for (var s3 = 12; s3 >= 0; s3--) { var u2 = s3 / 12, wv2 = Math.sin(u2 * 5 - info.tm * .006 * (quieto ? 0 : 1)) * fh * .12 * u2; c.lineTo(x + u2 * fw, y - h + (i + 1) * fh / 4 + wv2); }
        c.fill();
      }
    },
    estatua: function(c, x, y, k, o, info){
      caja(c, x, y, 3 * k, 2.2 * k, '#d8b25c', info.lado, k);
      c.fillStyle = '#efe7d4';
      c.beginPath(); c.ellipse(x, y - 3.6 * k, 1.6 * k, .9 * k, 0, 0, TAU); c.fill();
      c.fillRect(x + .8 * k, y - 5.4 * k, .6 * k, 1.8 * k); c.beginPath(); c.ellipse(x + 1.4 * k, y - 5.5 * k, .7 * k, .4 * k, 0, 0, TAU); c.fill();
      c.fillStyle = '#e9c874'; c.fillRect(x + 1.7 * k, y - 6.6 * k, .15 * k + 1, k);
      [-1.1, -.4, .4, 1.1].forEach(function(dx){ c.fillStyle = '#efe7d4'; c.fillRect(x + dx * k - .15 * k, y - 3 * k, .3 * k, .8 * k); });
    },
    farola: function(c, x, y, k, o, info){
      c.fillStyle = '#2a2440'; c.fillRect(x - .08 * k, y - 4.5 * k, Math.max(1, .16 * k), 4.5 * k);
      c.fillStyle = info.noche ? '#ffe7a8' : '#d8b25c'; c.beginPath(); c.arc(x, y - 4.6 * k, Math.max(1.5, .3 * k), 0, TAU); c.fill();
      if (info.noche) info.luces.push([x, y - 4.6 * k, Math.max(3, .6 * k)]);
    },
    tienda: function(c, x, y, k, o, info){
      var w = 9 * k, h = 7 * k;
      caja(c, x, y, w, h, '#efe6d6', info.lado, k);
      c.fillStyle = o.c; c.fillRect(x - w / 2, y - h * .62, w, h * .14);
      for (var i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#fff' : o.c; c.fillRect(x - w / 2 + i * w / 6, y - h * .48, w / 6, h * .08); }
      ventanas(c, x - w / 2, y - h, w, h * .32, 3, 1, k, info);
      c.fillStyle = info.noche ? '#ffd98a' : 'rgba(120,150,190,.6)'; c.fillRect(x - w * .4, y - h * .38, w * .5, h * .34);
      if (info.noche) info.luces.push([x - w * .15, y - h * .2, Math.max(3, k * .9)]);
      c.fillStyle = '#5b2a86'; c.fillRect(x + w * .18, y - h * .38, w * .2, h * .38);
      if (k > 9) { c.fillStyle = '#1b1150'; c.font = '700 ' + Math.round(k * .62) + "px 'IBM Plex Sans', sans-serif"; c.textAlign = 'center'; c.fillText(o.n, x, y - h * .5); }
    },
    cartel: function(c, x, y, k, o, info){
      var w = 3.4 * k, h = 1.5 * k;
      c.fillStyle = '#6b6f78'; c.fillRect(x - w * .35, y - 2.6 * k, Math.max(1, .12 * k), 2.6 * k); c.fillRect(x + w * .33, y - 2.6 * k, Math.max(1, .12 * k), 2.6 * k);
      c.fillStyle = '#1b1150'; c.fillRect(x - w / 2, y - 2.6 * k - h, w, h);
      c.strokeStyle = '#d8b25c'; c.lineWidth = Math.max(1, k * .06); c.strokeRect(x - w / 2 + k * .08, y - 2.6 * k - h + k * .08, w - k * .16, h - k * .16);
      if (k > 6) {
        var n = typeof o.n === 'string' ? o.n : t(o.n), sb = typeof o.s === 'string' ? o.s : (o.s ? t(o.s) : '');
        c.textAlign = 'center'; c.fillStyle = '#e9c874'; c.font = '700 ' + Math.round(k * .36) + "px 'IBM Plex Sans', sans-serif"; c.fillText(n, x, y - 2.6 * k - h * .5);
        c.fillStyle = '#f4efe2'; c.font = '400 ' + Math.round(k * .26) + "px 'IBM Plex Sans', sans-serif"; c.fillText(sb, x, y - 2.6 * k - h * .16);
      }
    },
    arbol: function(c, x, y, k, o, info){
      c.fillStyle = '#6b4a2e'; c.fillRect(x - .2 * k, y - 2.4 * k, .4 * k, 2.4 * k);
      var g = c.createRadialGradient(x - info.lado * k, y - 4.6 * k, k * .3, x, y - 4 * k, 2.8 * k);
      g.addColorStop(0, info.noche ? '#2b4a3a' : '#8cc46f'); g.addColorStop(1, info.noche ? '#13241c' : '#3f7a3a');
      c.fillStyle = g; c.beginPath(); c.arc(x, y - 4.2 * k, 2.2 * k, 0, TAU); c.arc(x - 1.2 * k, y - 3.4 * k, 1.5 * k, 0, TAU); c.arc(x + 1.2 * k, y - 3.4 * k, 1.5 * k, 0, TAU); c.fill();
    },
    cactus: function(c, x, y, k){
      c.fillStyle = '#3f8f4a';
      var r = Math.max(1, .3 * k);
      c.fillRect(x - r, y - 3.4 * k, r * 2, 3.4 * k); c.beginPath(); c.arc(x, y - 3.4 * k, r, Math.PI, 0); c.fill();
      c.fillRect(x - 1.2 * k, y - 2.4 * k, r * 1.6, 1.2 * k); c.fillRect(x - 1.2 * k, y - 2.4 * k, .9 * k, r * 1.4);
      c.fillRect(x + .5 * k, y - 2.9 * k, .9 * k, r * 1.4); c.fillRect(x + 1.1 * k, y - 3.6 * k, r * 1.6, 1.4 * k);
      c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(x - r * .5, y - 3.4 * k, r * .4, 3.4 * k);
    },
    bucees: function(c, x, y, k, o, info){
      var w = (o.w || 100) * k, h = 12 * k;
      caja(c, x, y, w, h, '#c62828', info.lado, k);
      c.fillStyle = '#f2c200'; c.fillRect(x - w / 2 - k, y - h - 2 * k, w + 2 * k, 2.2 * k);
      ventanas(c, x - w / 2, y - h * .8, w, h * .5, Math.max(4, Math.round((o.w || 100) / 8)), 1, k, info, 'rgba(120,20,20,.8)');
      /* logotipo con el castor */
      var ly = y - h - 9 * k, r = 6 * k;
      c.fillStyle = '#7a0f0f'; c.fillRect(x - .5 * k, ly, k, 9 * k);
      c.fillStyle = '#f2c200'; c.beginPath(); c.arc(x, ly, r, 0, TAU); c.fill();
      c.fillStyle = '#7a4a1e'; c.beginPath(); c.ellipse(x, ly + r * .2, r * .52, r * .44, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(x, ly - r * .28, r * .32, 0, TAU); c.fill();
      c.fillStyle = '#fff'; c.fillRect(x - r * .12, ly - r * .14, r * .24, r * .14);
      if (info.noche) { info.luces.push([x, ly, r]); }
      if (k > 3) { c.fillStyle = '#1a1030'; c.font = '800 ' + Math.round(k * 2.2) + "px 'IBM Plex Sans', sans-serif"; c.textAlign = 'center'; c.fillText("BUC-EE'S", x, y - h - .3 * k); }
    },
    surtidores: function(c, x, y, k, o, info){
      var w = 26 * k;
      c.fillStyle = '#f4efe2'; c.fillRect(x - w / 2, y - 6 * k, w, 1.2 * k);
      c.fillStyle = '#c62828'; c.fillRect(x - w / 2, y - 6.4 * k, w, .5 * k);
      for (var i = 0; i < 5; i++) { var px2 = x - w / 2 + (i + .5) * w / 5; c.fillStyle = '#b9b2a6'; c.fillRect(px2 - .2 * k, y - 4.8 * k, .4 * k, 4.8 * k); c.fillStyle = '#f4efe2'; c.fillRect(px2 - .5 * k, y - 1.6 * k, k, 1.6 * k); c.fillStyle = '#c62828'; c.fillRect(px2 - .5 * k, y - 1.6 * k, k, .4 * k); }
      if (info.noche) for (var j = 0; j < 5; j++) info.luces.push([x - w / 2 + (j + .5) * w / 5, y - 4.9 * k, Math.max(3, k * .8)]);
    },
    mirador: function(c, x, y, k, o, info){
      c.fillStyle = '#8f6f2a'; c.fillRect(x - 2 * k, y - 1.1 * k, 4 * k, .25 * k);
      [-1.8, -.6, .6, 1.8].forEach(function(dx){ c.fillRect(x + dx * k - .06 * k, y - 1.1 * k, .12 * k + 1, 1.1 * k); });
      c.fillStyle = '#2a2440'; c.fillRect(x - .1 * k, y - 1.6 * k, .2 * k + 1, 1.6 * k); c.fillRect(x - .5 * k, y - 1.9 * k, k, .4 * k);
    },
    faro: function(c, x, y, k, o, info){
      c.fillStyle = '#f4efe2'; c.beginPath(); c.moveTo(x - 3 * k, y); c.lineTo(x - 1.8 * k, y - 26 * k); c.lineTo(x + 1.8 * k, y - 26 * k); c.lineTo(x + 3 * k, y); c.fill();
      c.fillStyle = '#e8312f'; c.fillRect(x - 2.6 * k, y - 9 * k, 5.2 * k, 3 * k); c.fillRect(x - 2.1 * k, y - 19 * k, 4.2 * k, 3 * k);
      c.fillStyle = '#ffe9a8'; c.fillRect(x - 1.6 * k, y - 29 * k, 3.2 * k, 3 * k);
      c.fillStyle = '#2a2440'; c.beginPath(); c.moveTo(x - 2 * k, y - 29 * k); c.lineTo(x, y - 31 * k); c.lineTo(x + 2 * k, y - 29 * k); c.fill();
      var rot = quieto ? .5 : (info.tm * .0012) % TAU;
      var lx = x, ly = y - 27.5 * k, rr = info.F * .8;
      c.fillStyle = info.noche ? 'rgba(255,240,180,.28)' : 'rgba(255,240,180,.12)';
      c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx + Math.cos(rot) * rr, ly - 12 * k + Math.sin(rot) * 20); c.lineTo(lx + Math.cos(rot + .15) * rr, ly + 12 * k + Math.sin(rot) * 20); c.fill();
      if (info.noche) info.luces.push([lx, ly, Math.max(6, k * 2)]);
    },
    barco: function(c, x, y, k, o, info){
      var s2 = o.k || 1, bob = Math.sin(info.tm * .002 * (quieto ? 0 : 1) + o.b * 3) * k * .25, m = k * s2;
      y += bob;
      /* casco con franja dorada, cubierta, puente y chimenea */
      c.fillStyle = info.noche ? '#3a2f7a' : '#1b1150';
      c.beginPath(); c.moveTo(x - 34 * m, y - 6 * m); c.lineTo(x + 38 * m, y - 6 * m); c.lineTo(x + 30 * m, y + 1.5 * m); c.lineTo(x - 30 * m, y + 1.5 * m); c.closePath(); c.fill();
      c.fillStyle = '#d8b25c'; c.fillRect(x - 33 * m, y - 4.2 * m, 69 * m, Math.max(1, .8 * m));
      c.fillStyle = '#f4efe2'; c.fillRect(x - 30 * m, y - 7 * m, 60 * m, Math.max(1, m));
      [['#d8b25c', -24], ['#86e7ea', -14], ['#f2a9dc', -4], ['#c62828', 6]].forEach(function(p){ c.fillStyle = p[0]; c.fillRect(x + p[1] * m, y - 12 * m, 9 * m, 5 * m); });
      c.fillStyle = '#f4efe2'; c.fillRect(x + 18 * m, y - 16 * m, 12 * m, 9 * m);
      ventanas(c, x + 18 * m, y - 16 * m, 12 * m, 4 * m, 4, 1, k, info, 'rgba(60,70,110,.7)');
      c.fillStyle = '#c62828'; c.fillRect(x + 25 * m, y - 21 * m, 3 * m, 5 * m);
      if (info.noche) { info.luces.push([x - 30 * m, y - 7 * m, Math.max(2, m)]); info.luces.push([x + 36 * m, y - 7 * m, Math.max(2, m)]); }
      /* reflejo y estela */
      c.globalAlpha = .22; c.fillStyle = info.noche ? '#3a2f7a' : '#1b1150'; c.fillRect(x - 30 * m, y + 1.5 * m, 60 * m, 5 * m); c.globalAlpha = 1;
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - 40 * m, y + .5 * m, 8 * m, Math.max(1, .5 * m));
    },
    barca: function(c, x, y, k, o, info){
      var bob = Math.sin(info.tm * .0025 * (quieto ? 0 : 1)) * k * .2; y += bob;
      c.fillStyle = '#8f5a2e'; c.beginPath(); c.moveTo(x - 3 * k, y - .6 * k); c.lineTo(x + 3 * k, y - .6 * k); c.lineTo(x + 2.2 * k, y + .3 * k); c.lineTo(x - 2.2 * k, y + .3 * k); c.fill();
      c.fillStyle = '#f4efe2'; c.beginPath(); c.moveTo(x, y - .6 * k); c.lineTo(x, y - 4.4 * k); c.lineTo(x + 2.2 * k, y - .9 * k); c.fill();
      c.globalAlpha = .25; c.fillStyle = '#f4efe2'; c.beginPath(); c.moveTo(x, y + .4 * k); c.lineTo(x, y + 3.4 * k); c.lineTo(x + 2 * k, y + .6 * k); c.fill(); c.globalAlpha = 1;
    },
    grua: function(c, x, y, k){
      c.strokeStyle = '#d8b25c'; c.lineWidth = Math.max(1, .5 * k);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 18 * k); c.lineTo(x + 14 * k, y - 18 * k); c.moveTo(x - 4 * k, y - 18 * k); c.lineTo(x, y - 18 * k); c.moveTo(x + 10 * k, y - 18 * k); c.lineTo(x + 10 * k, y - 9 * k); c.stroke();
      c.fillStyle = '#86e7ea'; c.fillRect(x + 8.5 * k, y - 9 * k, 3 * k, 2 * k);
    },
    contenedores: function(c, x, y, k, o, info){
      var cols = ['#c62828', '#3fb8c4', '#d8b25c', '#5b2a86', '#f2a9dc'];
      for (var i = 0; i < 5; i++) for (var j = 0; j < 2 + (i % 2); j++) caja(c, x - 7 * k + i * 3 * k, y - j * 2.6 * k, 2.8 * k, 2.5 * k, cols[(i + j) % 5], info.lado, k);
    },
    unicornio: function(c, x, y, k, o, info){
      var paso = Math.sin(info.tm * .012 * (quieto ? 0 : 1)) * .35;
      var dir = 1;
      c.fillStyle = 'rgba(30,20,50,.2)'; c.beginPath(); c.ellipse(x, y + 1, 1.4 * k, .25 * k, 0, 0, TAU); c.fill();
      c.fillStyle = '#f7f3ea';
      [-0.9, -.5, .45, .85].forEach(function(dx, i){ var a = (i % 2 ? paso : -paso); c.save(); c.translate(x + dx * k, y - 1.05 * k); c.rotate(a * dir); c.fillRect(-.09 * k, 0, .18 * k + 1, 1.05 * k); c.restore(); });
      c.beginPath(); c.ellipse(x, y - 1.35 * k, 1.15 * k, .48 * k, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(x + .8 * k, y - 1.6 * k); c.lineTo(x + 1.3 * k, y - 2.4 * k); c.lineTo(x + 1.6 * k, y - 2.25 * k); c.lineTo(x + 1.15 * k, y - 1.35 * k); c.fill();
      c.beginPath(); c.ellipse(x + 1.55 * k, y - 2.35 * k, .38 * k, .2 * k, .3, 0, TAU); c.fill();
      c.fillStyle = '#e9c874'; c.beginPath(); c.moveTo(x + 1.5 * k, y - 2.5 * k); c.lineTo(x + 1.75 * k, y - 3.1 * k); c.lineTo(x + 1.7 * k, y - 2.45 * k); c.fill();
      c.fillStyle = '#f2a9dc'; c.fillRect(x + .9 * k, y - 2.3 * k, .25 * k, .8 * k);
      c.fillStyle = '#86e7ea'; c.fillRect(x - 1.35 * k, y - 1.55 * k, .3 * k, .7 * k);
    }
  };

  /* ================= Interfaz ================= */
  function nombreDe(id){ var p = (S && S.op.puntos || []).filter(function(q){ return q.id === id; })[0]; return p ? p.n : id; }
  function construir(s){
    var l = lang();
    s.cont.innerHTML =
      '<div class="pvl-sv2" tabindex="0" aria-roledescription="Street View" aria-label="' + esc(nombreDe(s.id)) + '">' +
        '<canvas class="pvl-sv2-lienzo"></canvas>' +
        '<div class="pvl-sv2-bar"><div><div class="pvl-sv2-k">Street View · ' + esc(t({ es: 'Ministerio de Cartografía Real', en: 'Ministry of Royal Cartography' })) + '</div><div class="pvl-sv2-n">' + esc(nombreDe(s.id)) + '</div></div>' +
          '<div class="pvl-sv2-acciones">' +
            '<button type="button" data-pvl-sv2="noche" aria-pressed="' + (s.noche ? 'true' : 'false') + '" title="' + esc(t({ es: 'Nocturno real', en: 'Royal nocturne' })) + '">' + (s.noche ? '☀' : '☾') + '</button>' +
            '<button type="button" data-pvl-sv2="pantalla" title="' + esc(t({ es: 'Pantalla completa', en: 'Fullscreen' })) + '">⛶</button>' +
            '<button type="button" data-pvl-sv2="foto" title="' + esc(t({ es: 'Descargar esta vista', en: 'Download this view' })) + '">⤓</button>' +
            '<button type="button" data-pvl-map-cerrar-sv title="' + esc(t({ es: 'Salir de Street View', en: 'Exit Street View' })) + '" aria-label="' + esc(t({ es: 'Salir de Street View', en: 'Exit Street View' })) + '">×</button>' +
          '</div></div>' +
        '<button type="button" class="pvl-sv2-flecha pvl-sv2-izq" data-pvl-sv2="izq" aria-label="' + esc(t({ es: 'Girar a la izquierda', en: 'Turn left' })) + '">‹</button>' +
        '<button type="button" class="pvl-sv2-flecha pvl-sv2-der" data-pvl-sv2="der" aria-label="' + esc(t({ es: 'Girar a la derecha', en: 'Turn right' })) + '">›</button>' +
        '<div class="pvl-sv2-zoom"><button type="button" data-pvl-sv2="mas" aria-label="' + esc(t({ es: 'Acercar', en: 'Zoom in' })) + '">+</button><button type="button" data-pvl-sv2="menos" aria-label="' + esc(t({ es: 'Alejar', en: 'Zoom out' })) + '">−</button></div>' +
        '<div class="pvl-sv2-mini" aria-hidden="true"><canvas width="150" height="106"></canvas><div class="pvl-sv2-brujula">N</div></div>' +
        '<div class="pvl-sv2-tira" role="group" aria-label="' + esc(t({ es: 'Puntos de vista', en: 'Viewpoints' })) + '">' +
          (s.op.puntos || []).map(function(p){ return '<button type="button" data-pvl-sv2-ir="' + esc(p.id) + '"' + (p.id === s.id ? ' aria-current="true"' : '') + '><canvas width="128" height="72"></canvas><span>' + esc(p.n) + '</span></button>'; }).join('') +
        '</div>' +
        '<div class="pvl-sv2-pista">' + esc(t({ es: 'Arrastre para mirar (arriba y abajo también) · rueda o pellizco para acercar · flechas del suelo para caminar', en: 'Drag to look (up and down too) · wheel or pinch to zoom · ground arrows to walk' })) + '</div>' +
      '</div>';
    s.raiz = s.cont.querySelector('.pvl-sv2');
    s.canvas = s.raiz.querySelector('.pvl-sv2-lienzo');
    s.l = l;
    miniaturas(s);
    medir(s);
  }
  function miniaturas(s){
    var bs = s.raiz.querySelectorAll('[data-pvl-sv2-ir] canvas');
    for (var i = 0; i < bs.length; i++) {
      var id = bs[i].parentNode.getAttribute('data-pvl-sv2-ir');
      var c = bs[i].getContext('2d');
      var tmp = { id: id, op: s.op, nubes: s.nubes, pajaros: [], flechas: [], ruido: null, sway: 0, t: 0, noche: s.noche };
      pintar(tmp, c, 128, 72, { yaw: 0, pitch: 0, fov: 1.6, sway: 0, t: 0, sinUI: 1, sinVida: 1, noche: s.noche });
    }
  }
  function medir(s){
    var r = s.raiz.getBoundingClientRect();
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    s.W = Math.max(200, r.width); s.H = Math.max(160, r.height);
    s.dpr = dpr;
    s.canvas.width = Math.round(s.W * dpr); s.canvas.height = Math.round(s.H * dpr);
    s.canvas.style.width = s.W + 'px'; s.canvas.style.height = s.H + 'px';
    s.sucio = true;
  }
  function minimapa(s){
    var c = s.raiz.querySelector('.pvl-sv2-mini canvas'); if (!c) return;
    var x = c.getContext('2d'), W = 150, H = 106;
    x.clearRect(0, 0, W, H);
    x.fillStyle = 'rgba(13,7,37,.85)'; x.fillRect(0, 0, W, H);
    /* la isla, aproximada */
    x.fillStyle = '#7fa66b'; x.beginPath(); x.ellipse(W * .5, H * .55, W * .4, H * .38, -.15, 0, TAU); x.fill();
    x.fillStyle = '#e9cf98'; x.beginPath(); x.ellipse(W * .72, H * .55, W * .14, H * .16, 0, 0, TAU); x.fill();
    x.fillStyle = '#e9eef8'; x.beginPath(); x.moveTo(W * .5, H * .12); x.lineTo(W * .56, H * .28); x.lineTo(W * .44, H * .28); x.fill();
    var yo = null;
    (s.op.puntos || []).forEach(function(p){
      var px = p.x / 2000 * W, py = p.y / 1400 * H;
      if (p.id === s.id) yo = [px, py];
      x.fillStyle = p.id === s.id ? '#f2c200' : '#4c8dff'; x.beginPath(); x.arc(px, py, p.id === s.id ? 4 : 2.6, 0, TAU); x.fill();
    });
    if (yo) {
      var a = s.yaw - Math.PI / 2, h = s.fov / 2;
      x.fillStyle = 'rgba(242,194,0,.35)'; x.beginPath(); x.moveTo(yo[0], yo[1]); x.arc(yo[0], yo[1], 26, a - h, a + h); x.closePath(); x.fill();
    }
    var b = s.raiz.querySelector('.pvl-sv2-brujula'); if (b) b.style.transform = 'rotate(' + (-s.yaw * 180 / Math.PI).toFixed(1) + 'deg)';
  }
  function ruido(){
    var c = doc.createElement('canvas'); c.width = c.height = 96;
    var x = c.getContext('2d'), d = x.createImageData(96, 96), r = rnd(11);
    for (var i = 0; i < d.data.length; i += 4) { var v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0);
    return c;
  }
  function vecinos(s){
    var yo = (s.op.puntos || []).filter(function(p){ return p.id === s.id; })[0];
    if (!yo) return [];
    return (s.op.puntos || []).filter(function(p){ return p.id !== s.id; }).map(function(p){
      return { id: p.id, n: p.n, b: Math.atan2(p.x - yo.x, -(p.y - yo.y)), dist: Math.hypot(p.x - yo.x, p.y - yo.y) };
    }).sort(function(a, b){ return a.dist - b.dist; }).slice(0, 3);
  }

  /* ================= Bucle ================= */
  function cuadro(now){
    var s = S;
    if (!s || !s.cont.isConnected || s.cont.hidden) { if (s) s.raf = 0; return; }
    var dt = Math.min(50, now - (s.ult || now)); s.ult = now;
    s.t = now - s.t0;
    var animar = !quieto;
    /* inercia */
    if (!s.arrastre && (Math.abs(s.vy) > 1e-5 || Math.abs(s.vp) > 1e-5)) {
      s.yaw = ang(s.yaw + s.vy * dt); s.pitch = Math.max(-.5, Math.min(.45, s.pitch + s.vp * dt));
      s.vy *= Math.pow(.9, dt / 16); s.vp *= Math.pow(.9, dt / 16);
      if (Math.abs(s.vy) < 1e-5) s.vy = 0; if (Math.abs(s.vp) < 1e-5) s.vp = 0;
      s.sucio = true;
    }
    s.sway += ((s.arrastre ? s.vy * 900 : 0) - s.sway) * .12;
    if (Math.abs(s.sway) > .01) s.sucio = true;
    if (animar) {
      s.nubes.forEach(function(n){ n.b = ang(n.b + n.v * dt); });
      s.pajaros.forEach(function(p){ p.b = ang(p.b + p.v * dt); p.e += Math.sin(s.t * .001 + p.f) * .00003 * dt; });
      s.sucio = true;
    }
    if (s.trans > 0) { s.trans = Math.max(0, s.trans - dt / 380); s.sucio = true; }
    if (s.sucio) {
      var ctx = s.canvas.getContext('2d');
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      pintar(s, ctx, s.W, s.H, { escala: s.dpr });
      if (s.trans > 0 && s.transA) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = s.trans; var z = 1 + (1 - s.trans) * .35; ctx.drawImage(s.transA, -(z - 1) * s.canvas.width / 2, -(z - 1) * s.canvas.height / 2, s.canvas.width * z, s.canvas.height * z); ctx.globalAlpha = 1; }
      minimapa(s);
      s.sucio = false;
    }
    s.raf = requestAnimationFrame(cuadro);
  }
  function arrancar(){ if (S && !S.raf) { S.ult = 0; S.raf = requestAnimationFrame(cuadro); } S && (S.sucio = true); }

  /* ================= API ================= */
  function abrir(cont, id, op){
    if (!ESC[id]) return false;
    var prev = S && S.cont === cont ? S : null;
    var s = nuevaSesion(cont, id, op);
    if (prev) { s.noche = prev.noche; s.nubes = prev.nubes; s.pajaros = prev.pajaros; s.ruido = prev.ruido; if (prev.canvas) { var snap = doc.createElement('canvas'); snap.width = prev.canvas.width; snap.height = prev.canvas.height; snap.getContext('2d').drawImage(prev.canvas, 0, 0); s.transA = snap; s.trans = quieto ? 0 : 1; } }
    if (!s.nubes.length) { var r = rnd(3); for (var i = 0; i < 14; i++) s.nubes.push({ b: r() * TAU, e: .08 + r() * .3, s: .6 + r() * 1.4, v: .000006 + r() * .00001 }); }
    if (!s.pajaros.length) { var r2 = rnd(5); for (var j = 0; j < 7; j++) s.pajaros.push({ b: r2() * TAU, e: .12 + r2() * .12, v: .00004 + r2() * .00003, f: r2() * 6 }); }
    if (!s.ruido) s.ruido = ruido();
    s.op.vecinos = vecinos(s);
    /* mirar hacia lo importante de la escena */
    s.yaw = ESC[id].vista || 0;
    if (s.op.camara) { var cm = s.op.camara; s.yaw = cm.yaw; s.pitch = cm.pitch; s.fov = cm.fov; s.noche = cm.noche; s.op.camara = null; }
    S = s;
    cont.hidden = false;
    construir(s);
    s.raiz.focus({ preventScroll: true });
    arrancar();
    return true;
  }

  /* --- eventos (delegados; el contenedor se remonta con cada escena) --- */
  function dentro(e){ return S && S.raiz && S.raiz.contains(e.target); }
  doc.addEventListener('pointerdown', function(e){
    if (!dentro(e) || e.target.closest('button')) return;
    var s = S;
    s.punteros[e.pointerId] = { x: e.clientX, y: e.clientY };
    try { s.canvas.setPointerCapture(e.pointerId); } catch (er) {}
    var ids = Object.keys(s.punteros);
    if (ids.length === 1) { s.arrastre = { x: e.clientX, y: e.clientY, t: performance.now(), x0: e.clientX, y0: e.clientY }; s.vy = s.vp = 0; }
    else { s.arrastre = null; s.pinza = { d: dist2(s), fov: s.fov }; }
    arrancar();
  });
  function dist2(s){ var p = Object.keys(s.punteros).map(function(k){ return s.punteros[k]; }); return p.length < 2 ? 0 : Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); }
  doc.addEventListener('pointermove', function(e){
    var s = S; if (!s || !s.punteros[e.pointerId]) return;
    s.punteros[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (s.pinza && Object.keys(s.punteros).length === 2) { var d = dist2(s); if (s.pinza.d > 0) { s.fov = Math.max(.75, Math.min(1.9, s.pinza.fov * s.pinza.d / d)); s.sucio = true; } return; }
    if (!s.arrastre) return;
    var now = performance.now(), F = s.W / s.fov;
    var dx = e.clientX - s.arrastre.x, dy = e.clientY - s.arrastre.y, dtt = Math.max(1, now - s.arrastre.t);
    s.yaw = ang(s.yaw - dx / F); s.pitch = Math.max(-.5, Math.min(.45, s.pitch + dy / F));
    if (!quieto) { s.vy = -dx / F / dtt; s.vp = dy / F / dtt; }
    s.arrastre.x = e.clientX; s.arrastre.y = e.clientY; s.arrastre.t = now;
    s.sucio = true;
  });
  function soltar(e){
    var s = S; if (!s || !s.punteros[e.pointerId]) return;
    var a = s.arrastre;
    delete s.punteros[e.pointerId];
    if (Object.keys(s.punteros).length < 2) s.pinza = null;
    if (a && Math.hypot(e.clientX - a.x0, e.clientY - a.y0) < 6) {
      /* un toque: ¿una flecha del suelo? */
      var r = s.canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      for (var i = 0; i < s.flechas.length; i++) { var f = s.flechas[i]; if (Math.hypot(px - f.x, py - f.y) < f.r || (Math.abs(px - f.x) < 60 && py > f.y && py < f.ty)) { caminar(f.id); break; } }
    }
    s.arrastre = null;
  }
  doc.addEventListener('pointerup', soltar);
  doc.addEventListener('pointercancel', soltar);
  doc.addEventListener('wheel', function(e){
    if (!dentro(e)) return;
    e.preventDefault();
    S.fov = Math.max(.75, Math.min(1.9, S.fov * (e.deltaY > 0 ? 1.08 : 1 / 1.08)));
    S.sucio = true; arrancar();
  }, { passive: false });
  function caminar(id){
    var s = S; if (!s) return;
    if (s.op.alCaminar) s.op.alCaminar(id);
    abrir(s.cont, id, s.op);
  }
  doc.addEventListener('click', function(e){
    if (!dentro(e)) return;
    var s = S, b = e.target.closest('[data-pvl-sv2]');
    if (b) {
      var a = b.getAttribute('data-pvl-sv2');
      if (a === 'izq' || a === 'der') { s.vy = 0; s.yaw = ang(s.yaw + (a === 'izq' ? -.5 : .5)); }
      else if (a === 'mas') s.fov = Math.max(.75, s.fov / 1.2);
      else if (a === 'menos') s.fov = Math.min(1.9, s.fov * 1.2);
      else if (a === 'noche') { s.noche = !s.noche; b.setAttribute('aria-pressed', s.noche ? 'true' : 'false'); b.textContent = s.noche ? '☀' : '☾'; miniaturas(s); }
      else if (a === 'pantalla') { var el = s.raiz; if (doc.fullscreenElement) doc.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen().catch(function(){}); }
      else if (a === 'foto') foto(s);
      s.sucio = true; arrancar(); return;
    }
    var ir = e.target.closest('[data-pvl-sv2-ir]');
    if (ir) { var id = ir.getAttribute('data-pvl-sv2-ir'); if (id !== s.id) caminar(id); }
  });
  doc.addEventListener('keydown', function(e){
    var s = S; if (!s || !s.raiz || !s.raiz.contains(doc.activeElement)) return;
    var k = e.key, hecho = true;
    if (k === 'ArrowLeft') s.yaw = ang(s.yaw - .12);
    else if (k === 'ArrowRight') s.yaw = ang(s.yaw + .12);
    else if (k === 'ArrowUp') s.pitch = Math.min(.45, s.pitch + .06);
    else if (k === 'ArrowDown') s.pitch = Math.max(-.5, s.pitch - .06);
    else if (k === '+' || k === '=') s.fov = Math.max(.75, s.fov / 1.15);
    else if (k === '-') s.fov = Math.min(1.9, s.fov * 1.15);
    else hecho = false;
    if (hecho) { e.preventDefault(); s.sucio = true; arrancar(); }
  });
  doc.addEventListener('fullscreenchange', function(){ if (S && S.raiz) { medir(S); arrancar(); } });
  window.addEventListener('resize', function(){ if (S && S.raiz && S.raiz.isConnected) { medir(S); arrancar(); } });
  doc.addEventListener('pavel:langchange', function(){
    var s = S; if (!s || !s.raiz || !s.raiz.isConnected || s.cont.hidden || s.l === lang()) return;
    if (s.op.traducir) s.op.traducir(s.op);
    s.op.vecinos = vecinos(s);
    construir(s); arrancar();
  });
  function foto(s){
    var c = s.canvas;
    var nombre = 'pavelandia-street-view-' + s.id + '.png';
    if (window.PavelLienzo) { window.PavelLienzo.descargar(c, nombre); return; }
    c.toBlob(function(b){ if (!b) return; var u = URL.createObjectURL(b), a = doc.createElement('a'); a.href = u; a.download = nombre; doc.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(u); }, 4000); });
  }

  function camara(){ return S ? { yaw: S.yaw, pitch: S.pitch, fov: S.fov, noche: S.noche } : null; }
  window.PavelStreetView = { abrir: abrir, camara: camara, escenas: Object.keys(ESC) };
})();
