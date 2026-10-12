/* El Mundo de Pavel -- audiencia en la corte.
   Mismo candado que el himno: support.js remonta el <helmet> y el cuerpo,
   asi que el script corre dos veces y los elementos se buscan en cada uso. */
(function(){
  if (window.__mundoPavel) return;
  window.__mundoPavel = true;

  var COOKIE = 'pavelense';
  var doc = document;
  var keys = Object.create(null);

  /* Insignias/logros (pvl-badge-). Persistidas en localStorage porque son
     un progreso del visitante que tiene sentido recordar entre visitas; el
     nombre del peregrino ya se guarda igual, asi que este es el mismo nivel
     de dato (nada se envia a ningun sitio). */
  var BADGE_KEY = 'pavel-badges';
  var LANG_SEEN_KEY = 'pavel-langs-vistos';
  var BADGES = {
    'primera-reverencia': { n: 'I', es: 'Primera reverencia', en: 'First bow' },
    'gracias-real': { n: 'II', es: 'Gracias reales', en: 'Royal thanks' },
    'primer-unicornio': { n: 'III', es: 'Primer unicornio invocado', en: 'First unicorn summoned' },
    'cincuenta-adoraciones': { n: 'IV', es: 'Cincuenta adoraciones', en: 'Fifty acts of worship' },
    'bilingue': { n: 'V', es: 'Súbdito bilingüe', en: 'Bilingual subject' }
  };
  var state = {
    abierto: false,
    jugando: false,
    nombre: '',
    x: 0,
    y: 0,
    last: 0,
    raf: 0,
    adoraciones: 0,
    adorando: false,
    agradecido: false,
    unicornio: false
  };

  function $(id){ return doc.getElementById(id); }
  function leerNombre(){
    var m = doc.cookie.match(/(?:^|; )pavelense=([^;]*)/);
    if (m) {
      try { return decodeURIComponent(m[1]).trim(); } catch (e) { return String(m[1]||'').trim(); }
    }
    try { return (localStorage.getItem(COOKIE) || '').trim(); } catch (e) { return ''; }
  }
  function guardarNombre(n){
    n = String(n || '').replace(/\s+/g, ' ').trim().slice(0, 32);
    if (!n) return '';
    doc.cookie = COOKIE + '=' + encodeURIComponent(n) + '; path=/; max-age=31536000; SameSite=Lax; Secure';
    try { localStorage.setItem(COOKIE, n); } catch (e) {}
    doc.documentElement.setAttribute('data-pavelense', n);
    return n;
  }
  function pintarSitio(){
    var n = state.nombre || leerNombre();
    if (!n) return;
    var chip = $('pavel-ciudadano');
    var chipN = $('pavel-ciudadano-nombre');
    var saludo = $('pavel-saludo');
    if (chip && chipN) {
      chipN.textContent = n;
      chip.style.display = '';
    }
    if (saludo) {
      var langS = (window.PavelI18N && window.PavelI18N.get()) || 'en';
      saludo.textContent = langS === 'es'
        ? ('El Ministerio te reconoce, ' + n + '. Existes porque Pavel existe.')
        : ('The Ministry recognizes you, ' + n + '. You exist because Pavel exists.');
      saludo.style.display = '';
    }
  }
  function abrir(){
    var ov = $('pavel-mundo');
    if (!ov) return;
    state.abierto = true;
    ov.className = (ov.className.replace(/\bpvl-abierto\b/g,'') + ' pvl-abierto').replace(/^\s+/, '');
    ov.setAttribute('aria-hidden', 'false');
    doc.documentElement.style.overflow = 'hidden';
    var n = leerNombre();
    if (n) {
      state.nombre = n;
      pintarSitio();
      mostrarJuego();
    } else {
      mostrarPuerta();
      var inp = $('pavel-nombre-input');
      if (inp) setTimeout(function(){ inp.focus(); }, 40);
    }
  }
  function cerrar(){
    var ov = $('pavel-mundo');
    if (ov) {
      ov.className = ov.className.replace(/\bpvl-abierto\b/g,'').replace(/\s+/g,' ').trim();
      ov.setAttribute('aria-hidden', 'true');
    }
    state.abierto = false;
    state.jugando = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;
    keys = Object.create(null);
    doc.documentElement.style.overflow = '';
  }
  function mostrarPuerta(){
    var g = $('pavel-mundo-gate'), j = $('pavel-mundo-juego');
    if (g) g.style.display = '';
    if (j) j.style.display = 'none';
    state.jugando = false;
  }
  function mostrarJuego(){
    var g = $('pavel-mundo-gate'), j = $('pavel-mundo-juego');
    if (g) g.style.display = 'none';
    if (j) j.style.display = 'flex';
    state.adoraciones = 0;
    state.agradecido = false;
    state.adorando = false;
    state.unicornio = false;
    var globo = $('pavel-globo');
    if (globo) globo.style.display = 'none';
    var trono = $('pavel-trono');
    if (trono) trono.className = 'pvl-trono';
    var uni = $('pavel-unicornio-viaje');
    if (uni) uni.className = 'pvl-unicornio';
    var pn = $('pavel-peregrino-nombre');
    if (pn) pn.textContent = state.nombre;
    pintarContador();
    pintarInsignias();
    var esc = $('pavel-escenario');
    state.x = esc ? esc.clientWidth * 0.5 : 400;
    state.y = esc ? esc.clientHeight * 0.82 : 320;
    state.last = 0;
    state.jugando = true;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(tick);
    var dlg = $('pavel-mundo-dialogo');
    if (dlg) dlg.setAttribute('tabindex', '-1');
  }
  function pintarContador(){
    var el = $('pavel-adoraciones');
    if (el) el.textContent = String(state.adoraciones);
  }
  function leerInsignias(){
    try {
      var v = JSON.parse(localStorage.getItem(BADGE_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function guardarInsignias(arr){
    try { localStorage.setItem(BADGE_KEY, JSON.stringify(arr)); } catch (e) {}
  }
  function pintarInsignias(){
    var arr = leerInsignias();
    var tiles = doc.querySelectorAll('[data-pvl-badge]');
    for (var i = 0; i < tiles.length; i++) {
      var id = tiles[i].getAttribute('data-pvl-badge');
      tiles[i].classList.toggle('pvl-badge-earned', arr.indexOf(id) !== -1);
    }
  }
  var insigniaToastTimer = null;
  function mostrarInsigniaToast(id){
    var meta = BADGES[id];
    if (!meta) return;
    var t = $('pvl-badge-toast');
    if (!t) {
      t = doc.createElement('div');
      t.id = 'pvl-badge-toast';
      doc.body.appendChild(t);
    }
    var L = (window.PavelI18N && window.PavelI18N.get()) || 'en';
    var etiqueta = L === 'es' ? 'Nueva distinción' : 'New distinction';
    t.textContent = etiqueta + ' ' + meta.n + ' · ' + meta[L];
    t.classList.add('pvl-badge-show');
    if (insigniaToastTimer) clearTimeout(insigniaToastTimer);
    insigniaToastTimer = setTimeout(function(){ t.classList.remove('pvl-badge-show'); }, 4200);
  }
  function desbloquear(id){
    if (!BADGES[id]) return;
    var arr = leerInsignias();
    if (arr.indexOf(id) === -1) {
      arr.push(id);
      guardarInsignias(arr);
      pintarInsignias();
      mostrarInsigniaToast(id);
    }
  }
  function registrarIdiomaVisto(){
    var L = (window.PavelI18N && window.PavelI18N.get()) || 'en';
    var vistos = [];
    try {
      vistos = JSON.parse(localStorage.getItem(LANG_SEEN_KEY) || '[]');
      if (!Array.isArray(vistos)) vistos = [];
    } catch (e) { vistos = []; }
    if (vistos.indexOf(L) === -1) {
      vistos.push(L);
      try { localStorage.setItem(LANG_SEEN_KEY, JSON.stringify(vistos)); } catch (e) {}
    }
    if (vistos.indexOf('es') !== -1 && vistos.indexOf('en') !== -1) desbloquear('bilingue');
  }
  function pintarJugador(){
    var p = $('pavel-peregrino');
    if (!p) return;
    p.style.left = state.x + 'px';
    p.style.top = state.y + 'px';
    var moving = !!(keys.ArrowLeft||keys.ArrowRight||keys.ArrowUp||keys.ArrowDown||keys.a||keys.A||keys.d||keys.D||keys.w||keys.W||keys.s||keys.S||keys._padL||keys._padR||keys._padU||keys._padD);
    p.className = 'pvl-peregrino' + (state.adorando ? ' pvl-inclinado' : '') + (moving && !state.adorando ? ' pvl-camina' : '');
  }
  function tick(now){
    if (!state.abierto || !state.jugando) return;
    if (!state.last) state.last = now;
    var dt = Math.min((now - state.last) / 1000, 0.05);
    state.last = now;
    var dx = 0, dy = 0;
    if (keys.ArrowLeft || keys.a || keys.A || keys._padL) dx -= 1;
    if (keys.ArrowRight || keys.d || keys.D || keys._padR) dx += 1;
    if (keys.ArrowUp || keys.w || keys.W || keys._padU) dy -= 1;
    if (keys.ArrowDown || keys.s || keys.S || keys._padD) dy += 1;
    if ((dx || dy) && !state.adorando) {
      var len = Math.hypot(dx, dy) || 1;
      state.x += (dx / len) * 190 * dt;
      state.y += (dy / len) * 190 * dt;
    }
    var esc = $('pavel-escenario');
    if (esc) {
      var w = esc.clientWidth, h = esc.clientHeight;
      state.x = Math.max(28, Math.min(w - 28, state.x));
      state.y = Math.max(118, Math.min(h - 12, state.y));
    }
    pintarJugador();
    state.raf = requestAnimationFrame(tick);
  }
  function chispas(){
    var esc = $('pavel-escenario');
    if (!esc) return;
    var langM = (window.PavelI18N && window.PavelI18N.get()) || 'en';
    var marks = ['✦', (langM === 'es' ? '¡Oh, Pavel!' : 'Oh, Pavel!'), '✧','P','★'];
    for (var i = 0; i < 5; i++) {
      var s = doc.createElement('div');
      var esGrito = i === 1;
      s.className = esGrito ? 'pvl-chispa pvl-chispa-texto' : 'pvl-chispa';
      s.textContent = marks[i];
      s.style.left = (state.x + (i - 2) * 18) + 'px';
      s.style.top = (state.y - 62) + 'px';
      if (!esGrito) s.style.animationDelay = (i * 0.05) + 's';
      esc.appendChild(s);
      setTimeout(function(el){ if (el && el.parentNode) el.parentNode.removeChild(el); }, esGrito ? 2700 : 1100, s);
    }
  }
  function adorar(){
    if (!state.jugando || state.adorando) return;
    state.adorando = true;
    state.adoraciones += 1;
    if (state.adoraciones === 1) desbloquear('primera-reverencia');
    if (state.adoraciones === 50) desbloquear('cincuenta-adoraciones');
    pintarContador();
    pintarJugador();
    chispas();
    var agentes = doc.querySelectorAll('#pavel-escenario .pvl-agente');
    for (var i = 0; i < agentes.length; i++) {
      agentes[i].className = 'pvl-agente pvl-reverencia';
    }
    if (state.adoraciones >= 10 && !state.agradecido) {
      state.agradecido = true;
      desbloquear('gracias-real');
      var globo = $('pavel-globo-texto');
      var wrap = $('pavel-globo');
      var trono = $('pavel-trono');
      if (globo) {
        var langG = (window.PavelI18N && window.PavelI18N.get()) || 'en';
        globo.textContent = langG === 'es'
          ? ('Gracias ' + state.nombre + ' por tus adoraciones')
          : ('Thank you ' + state.nombre + ' for your worship');
      }
      if (wrap) wrap.style.display = '';
      if (trono) trono.className = 'pvl-trono pvl-gracias';
    }
    setTimeout(function(){
      state.adorando = false;
      var ag = doc.querySelectorAll('#pavel-escenario .pvl-agente');
      for (var j = 0; j < ag.length; j++) ag[j].className = 'pvl-agente';
      pintarJugador();
    }, 920);
  }
  function registrarNombre(){
    var inp = $('pavel-nombre-input');
    var n = guardarNombre(inp && inp.value);
    if (!n) { if (inp) inp.focus(); return; }
    state.nombre = n;
    pintarSitio();
    mostrarJuego();
  }
  function invocarUnicornio(){
    if (!state.jugando || state.unicornio) return;
    var uni = $('pavel-unicornio-viaje');
    if (!uni) return;
    state.unicornio = true;
    uni.classList.add('pvl-viaja');
    desbloquear('primer-unicornio');
  }
  function teclaJuego(k){
    return k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown' ||
      k === ' ' || k === 'w' || k === 'a' || k === 's' || k === 'd' ||
      k === 'W' || k === 'A' || k === 'S' || k === 'D';
  }

  doc.addEventListener('click', function(e){
    var t = e.target;
    if (!t.closest) return;
    if (t.closest('#pavel-abrir-mundo')) { e.preventDefault(); abrir(); return; }
    if (t.closest('#pavel-mundo-cerrar')) { e.preventDefault(); cerrar(); return; }
    if (t.id === 'pavel-mundo') { cerrar(); return; }
    if (t.closest('#pavel-btn-adorar')) { e.preventDefault(); adorar(); return; }
    if (t.closest('#pavel-btn-unicornio')) { e.preventDefault(); invocarUnicornio(); return; }
  });

  doc.addEventListener('submit', function(e){
    if (e.target && e.target.id === 'pavel-nombre-form') {
      e.preventDefault();
      registrarNombre();
    }
  });

  doc.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && state.abierto) { e.preventDefault(); cerrar(); return; }
    if (!state.abierto || !state.jugando) return;
    if (!teclaJuego(e.key)) return;
    if (e.key === ' ' || e.key.indexOf('Arrow') === 0) e.preventDefault();
    keys[e.key] = true;
    if (e.key === ' ' && !e.repeat) adorar();
  });
  doc.addEventListener('keyup', function(e){
    if (teclaJuego(e.key)) keys[e.key] = false;
  });

  doc.addEventListener('pointerdown', function(e){
    var b = e.target.closest && e.target.closest('[data-pvl-dir]');
    if (!b || !state.jugando) return;
    e.preventDefault();
    keys['_pad' + b.getAttribute('data-pvl-dir')] = true;
  });
  doc.addEventListener('pointerup', function(e){
    var dirs = ['_padL','_padR','_padU','_padD'];
    for (var i = 0; i < dirs.length; i++) keys[dirs[i]] = false;
  });
  doc.addEventListener('pointercancel', function(){
    keys._padL = keys._padR = keys._padU = keys._padD = false;
  });

  doc.addEventListener('animationend', function(e){
    if (e.target && e.target.id === 'pavel-unicornio-viaje' && e.animationName === 'pvl-viaje') {
      e.target.classList.remove('pvl-viaja');
      state.unicornio = false;
    }
  });

  function arranque(){
    state.nombre = leerNombre();
    if (state.nombre) {
      guardarNombre(state.nombre);
      pintarSitio();
    }
    pintarInsignias();
    registrarIdiomaVisto();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', arranque);
  else arranque();
  setInterval(function(){ if (leerNombre()) pintarSitio(); }, 800);
  doc.addEventListener('pavel:langchange', function(){
    registrarIdiomaVisto();
    if (state.nombre) pintarSitio();
    if (state.agradecido) {
      var globo = $('pavel-globo-texto');
      if (globo) {
        var lang = (window.PavelI18N && window.PavelI18N.get()) || 'en';
        globo.textContent = lang === 'es'
          ? ('Gracias ' + state.nombre + ' por tus adoraciones')
          : ('Thank you ' + state.nombre + ' for your worship');
      }
    }
  });
})();
