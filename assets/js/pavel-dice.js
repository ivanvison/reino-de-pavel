/* Pavel Dice (pvl-pd-). Mismo candado de doble ejecucion que el resto de
   <helmet>. Un "Simon": el Unicornio toca una secuencia cada vez mas larga con
   cuatro notas del himno y el visitante la repite. Raton, tacto (pointerdown)
   o teclado (1-4, flechas, Q W A S). Sonido con Web Audio, creado en el primer
   gesto. El record vive solo en el localStorage de este navegador. */
(function(){
  if (window.__pvlPavelDice) return;
  window.__pvlPavelDice = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function uno(sel){
    var els = doc.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  function t(o){ return o[lang()] || o.en; }
  var KEY = 'pvl-pavel-dice-record';
  function leerRecord(){ try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } }
  function guardarRecord(n){ try { localStorage.setItem(KEY, String(n)); } catch (e) {} }

  /* Cuatro notas del himno, en La mayor: La, Do#, Mi, La agudo. */
  var NOTAS = [440, 554.37, 659.25, 880];
  var ctx = null;
  function audio(){
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function sonar(i, dur, error){
    var a = audio(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain(), o2 = a.createOscillator();
    o.type = error ? 'sawtooth' : 'triangle'; o2.type = 'sine';
    o.frequency.value = error ? 110 : NOTAS[i]; o2.frequency.value = error ? 116 : NOTAS[i] * 2;
    var now = a.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(.22, now + .02);
    g.gain.exponentialRampToValueAtTime(.001, now + dur);
    var g2 = a.createGain(); g2.gain.value = .25;
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(a.destination);
    o.start(now); o2.start(now); o.stop(now + dur + .05); o2.stop(now + dur + .05);
  }

  var sec = [], paso = 0, fase = 'reposo', timers = [];
  function limpiar(){ timers.forEach(clearTimeout); timers = []; }
  function luz(i, ms){
    var p = uno('[data-pvl-pd="' + i + '"]');
    if (!p) return;
    p.classList.add('pvl-pd-on');
    timers.push(setTimeout(function(){ p.classList.remove('pvl-pd-on'); }, ms));
  }
  var ultimo = null;
  /* msg es una funcion que devuelve el texto en el idioma activo, para repintarlo al cambiar de idioma. */
  function estado(msg){
    if (typeof msg === 'function') ultimo = msg;
    var s = uno('#pvl-pd-estado'); if (s) s.textContent = ultimo ? ultimo() : '';
    var r = uno('#pvl-pd-ronda'); if (r) r.textContent = String(Math.max(0, sec.length));
    var b = uno('#pvl-pd-record'); if (b) b.textContent = String(leerRecord());
  }
  var ELOGIOS = [
    { es: 'Correcto. El Unicornio asiente.', en: 'Correct. The Unicorn nods.' },
    { es: 'Impecable. Se oye un aplauso lejano.', en: 'Flawless. Distant applause is heard.' },
    { es: 'Digno. Pavel levanta una ceja, con aprobación.', en: 'Worthy. Pavel raises an eyebrow, approvingly.' },
    { es: '¡Prodigioso! La corte se pone en pie.', en: 'Prodigious! The court rises to its feet.' },
    { es: '¡Legendario! Se encarga un retrato suyo, más pequeño que el de Pavel.', en: 'Legendary! A portrait of you is commissioned, smaller than Pavel’s.' },
    { es: '¡NON PLUS ULTRA! No hay más allá. Aun así, sigamos.', en: 'NON PLUS ULTRA! There is nothing beyond. Still, let us go on.' }
  ];
  function elogio(n){ return t(ELOGIOS[Math.min(ELOGIOS.length - 1, Math.floor((n - 1) / 3))]); }

  function tocarSecuencia(){
    fase = 'mostrando';
    limpiar();
    var pausa = Math.max(260, 620 - sec.length * 22), dur = pausa * .7;
    estado(function(){ return t({ es: 'El Unicornio canta… escuche.', en: 'The Unicorn sings… listen.' }); });
    sec.forEach(function(n, k){
      timers.push(setTimeout(function(){ luz(n, dur); sonar(n, dur / 1000); }, 500 + k * pausa));
    });
    timers.push(setTimeout(function(){ fase = 'turno'; paso = 0; estado(function(){ return t({ es: 'Su turno: repita la secuencia.', en: 'Your turn: repeat the sequence.' }); }); }, 500 + sec.length * pausa));
  }
  function empezar(){
    audio();
    sec = [Math.floor(Math.random() * 4)];
    tocarSecuencia();
  }
  function pulsar(i){
    if (fase !== 'turno') return;
    luz(i, 220); sonar(i, .25);
    if (i !== sec[paso]) {
      fase = 'fin';
      sonar(0, .6, true);
      var logrado = sec.length - 1;
      var rec = leerRecord();
      if (logrado > rec) guardarRecord(logrado);
      var nuevo = logrado > rec && logrado > 0;
      estado(function(){ return (nuevo ? t({ es: '¡Nuevo récord de adoración! ', en: 'New adoration record! ' }) : '') +
        t({ es: 'Nota equivocada. Adoración sostenida: ', en: 'Wrong note. Adoration sustained: ' }) + logrado + '. ' + t({ es: 'Pulse «Empezar» para volver a intentarlo.', en: 'Press “Start” to try again.' }); });
      var wrap = uno('#pvl-pd-tablero'); if (wrap) { wrap.classList.add('pvl-pd-mal'); setTimeout(function(){ wrap.classList.remove('pvl-pd-mal'); }, 500); }
      return;
    }
    paso++;
    if (paso === sec.length) {
      fase = 'mostrando';
      var n = sec.length;
      estado(function(){ return elogio(n); });
      sec.push(Math.floor(Math.random() * 4));
      timers.push(setTimeout(tocarSecuencia, 900));
    }
  }

  doc.addEventListener('pointerdown', function(e){
    var p = e.target.closest && e.target.closest('[data-pvl-pd]');
    if (p) { e.preventDefault(); audio(); pulsar(+p.getAttribute('data-pvl-pd')); }
  });
  doc.addEventListener('click', function(e){
    if (e.target.closest && e.target.closest('#pvl-pd-empezar')) empezar();
  });
  var TECLAS = { '1': 0, '2': 1, '3': 2, '4': 3, q: 0, w: 1, a: 2, s: 3, ArrowUp: 0, ArrowRight: 1, ArrowLeft: 2, ArrowDown: 3 };
  doc.addEventListener('keydown', function(e){
    var tab = uno('#pvl-pd-tablero');
    if (!tab || !tab.contains(doc.activeElement)) return;
    var k = TECLAS[e.key] !== undefined ? TECLAS[e.key] : TECLAS[String(e.key).toLowerCase()];
    if (k === undefined) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var foco = doc.activeElement && doc.activeElement.getAttribute && doc.activeElement.getAttribute('data-pvl-pd');
      if (foco !== null && foco !== undefined) { e.preventDefault(); pulsar(+foco); return; }
      if (doc.activeElement && doc.activeElement.id === 'pvl-pd-empezar') return;
      if (fase !== 'mostrando' && fase !== 'turno') { e.preventDefault(); empezar(); }
      return;
    }
    e.preventDefault();
    pulsar(k);
  });
  setInterval(function(){
    var r = uno('#pvl-pd-ronda');
    if (r && r.getAttribute('data-l') !== lang()) {
      r.setAttribute('data-l', lang());
      if (!ultimo) ultimo = function(){ return t({ es: 'Pulse «Empezar». El Unicornio cantará primero.', en: 'Press “Start”. The Unicorn will sing first.' }); };
      estado();
    }
  }, 400);
})();
