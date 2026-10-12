/* Coronacion (pvl-cor-). Mismo candado de doble ejecucion que el resto de
   <helmet>. La primera vez que alguien llega a la portada, el Reino lo nombra
   caballero: desciende la corona, se le pide su nombre de peregrino (el mismo
   que usa "El Mundo de Pavel": cookie "pavelense" + localStorage), se le
   confiere un titulo y se le ensenan tres salas. Se puede saltar en cualquier
   momento (boton o Esc). Una marca en localStorage ("pvl-coronado") evita que
   se repita; el enlace "Revivir mi coronacion" de la portada la vuelve a abrir.
   Los clics dentro de la ceremonia cuentan como el primer gesto del visitante,
   asi que el himno arranca igual que sin ella. Nada sale del navegador. */
(function(){
  if (window.__pvlCoronacion) return;
  window.__pvlCoronacion = true;
  var doc = document;
  var MARCA = 'pvl-coronado', COOKIE = 'pavelense';
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function t(o){ return o[lang()] || o.en; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function leerNombre(){
    var m = doc.cookie.match(/(?:^|; )pavelense=([^;]*)/);
    if (m) { try { return decodeURIComponent(m[1]).trim(); } catch (e) { return String(m[1] || '').trim(); } }
    try { return (localStorage.getItem(COOKIE) || '').trim(); } catch (e) { return ''; }
  }
  /* Igual que guardarNombre() de mundo.js, para que todo el sitio lo lea. */
  function guardarNombre(n){
    n = String(n || '').replace(/\s+/g, ' ').trim().slice(0, 32);
    if (!n) return '';
    doc.cookie = COOKIE + '=' + encodeURIComponent(n) + '; path=/; max-age=31536000; SameSite=Lax; Secure';
    try { localStorage.setItem(COOKIE, n); } catch (e) {}
    doc.documentElement.setAttribute('data-pavelense', n);
    return n;
  }
  function coronado(){ try { return localStorage.getItem(MARCA) === '1'; } catch (e) { return true; } }
  function marcar(){ try { localStorage.setItem(MARCA, '1'); } catch (e) {} }

  var TITULOS = [
    { es: 'Peregrino de la Primera Luz', en: 'Pilgrim of the First Light' },
    { es: 'Caballero del Unicornio Menor', en: 'Knight of the Lesser Unicorn' },
    { es: 'Custodia del Aplauso Eterno', en: 'Keeper of the Eternal Applause' },
    { es: 'Paladín de la Pepita Dorada', en: 'Paladin of the Golden Nugget' },
    { es: 'Vigía del Non Plus Ultra', en: 'Watcher of the Non Plus Ultra' }
  ];
  function titulo(n){
    var h = 0; for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
    return TITULOS[h % TITULOS.length];
  }
  var CORONA = '<svg viewBox="0 0 120 80" class="pvl-cor-corona" aria-hidden="true"><defs><linearGradient id="pvl-cor-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4e0a8"/><stop offset=".5" stop-color="#d8b25c"/><stop offset="1" stop-color="#8f6f2a"/></linearGradient></defs><path d="M10 64l6-48 22 22 22-34 22 34 22-22 6 48z" fill="url(#pvl-cor-g)" stroke="#8f6f2a" stroke-width="2"/><rect x="10" y="62" width="100" height="12" rx="2" fill="url(#pvl-cor-g)" stroke="#8f6f2a" stroke-width="2"/><circle cx="60" cy="68" r="4" fill="#b3263a"/><circle cx="34" cy="68" r="3" fill="#3fb8c4"/><circle cx="86" cy="68" r="3" fill="#3fb8c4"/><circle cx="60" cy="10" r="4" fill="#f2a9dc"/></svg>';

  var capa = null, paso = 0, nombre = '', volver = null;
  function pintar(){
    if (!capa) return;
    var caja = capa.querySelector('.pvl-cor-caja');
    var l = lang();
    var html = '';
    if (paso === 0) {
      html = CORONA +
        '<div class="pvl-cor-kicker">' + esc(t({ es: 'CEREMONIA DE CORONACIÓN', en: 'CORONATION CEREMONY' })) + '</div>' +
        '<h2 id="pvl-cor-titulo">' + esc(t({ es: 'Bienvenido al Reino de Pavel', en: 'Welcome to the Kingdom of Pavel' })) + '</h2>' +
        '<p>' + esc(t({ es: 'Nadie entra en el Reino sin ser antes coronado. Diga su nombre, peregrino.', en: 'No one enters the Kingdom without first being crowned. State your name, pilgrim.' })) + '</p>' +
        '<form class="pvl-cor-form" data-pvl-cor-form><label for="pvl-cor-nombre" class="pvl-vh">' + esc(t({ es: 'Su nombre', en: 'Your name' })) + '</label>' +
        '<input id="pvl-cor-nombre" type="text" maxlength="32" autocomplete="given-name" value="' + esc(nombre || leerNombre()) + '" placeholder="' + esc(t({ es: 'Su nombre', en: 'Your name' })) + '">' +
        '<button type="submit">' + esc(t({ es: 'Ser coronado', en: 'Be crowned' })) + '</button></form>';
    } else if (paso === 1) {
      var tt = titulo(nombre);
      html = '<div class="pvl-cor-corona-cae">' + CORONA + '</div>' +
        '<div class="pvl-cor-kicker">' + esc(t({ es: 'POR LA GRACIA DE PAVEL', en: 'BY THE GRACE OF PAVEL' })) + '</div>' +
        '<h2 id="pvl-cor-titulo">' + esc(t({ es: 'Levántese, ', en: 'Arise, ' })) + esc(nombre) + '</h2>' +
        '<p class="pvl-cor-titulo">' + esc(t(tt)) + '</p>' +
        '<p>' + esc(t({ es: 'El Reino le reconoce desde hoy como súbdito. El Soberano, como siempre, ya lo sabía.', en: 'From this day the Kingdom recognises you as a subject. The Sovereign, as ever, already knew.' })) + '</p>' +
        '<button type="button" class="pvl-cor-sig" data-pvl-cor-sig>' + esc(t({ es: 'Ver lo mejor del Reino →', en: 'See the best of the Kingdom →' })) + '</button>';
    } else {
      var salas = [
        ['#himno', { es: 'El himno', en: 'The anthem' }, { es: 'Escúchelo de pie. Ahora con karaoke.', en: 'Hear it standing up. Now with karaoke.' }, '♪'],
        ['#mapa', { es: 'El mapa', en: 'The map' }, { es: 'Pavelandia entera, con cinco Buc-ee’s.', en: 'All of Pavelandia, with five Buc-ee’s.' }, '◈'],
        ['#juego', { es: 'El videojuego', en: 'The video game' }, { es: 'Súper Pavel World: recupere el trono.', en: 'Súper Pavel World: reclaim the throne.' }, '★']
      ];
      html = '<div class="pvl-cor-kicker">' + esc(t({ es: 'TRES SALAS PARA EMPEZAR', en: 'THREE HALLS TO BEGIN WITH' })) + '</div>' +
        '<h2 id="pvl-cor-titulo">' + esc(t({ es: '¿Por dónde empieza, ', en: 'Where will you begin, ' })) + esc(nombre) + '?</h2>' +
        '<div class="pvl-cor-salas">' + salas.map(function(s){
          return '<a href="' + s[0] + '" data-pvl-cor-ir><span class="pvl-cor-ico">' + s[3] + '</span><b>' + esc(t(s[1])) + '</b><small>' + esc(t(s[2])) + '</small></a>';
        }).join('') + '</div>' +
        '<button type="button" class="pvl-cor-sig" data-pvl-cor-fin>' + esc(t({ es: 'Entrar en la portada', en: 'Enter the home page' })) + '</button>';
    }
    caja.querySelector('.pvl-cor-cuerpo').innerHTML = html;
    caja.setAttribute('data-l', l);
    var pasos = capa.querySelectorAll('.pvl-cor-pasos i');
    for (var i = 0; i < pasos.length; i++) pasos[i].classList.toggle('pvl-cor-hecho', i <= paso);
    var foco = caja.querySelector('#pvl-cor-nombre') || caja.querySelector('[data-pvl-cor-sig],[data-pvl-cor-fin]');
    if (foco) foco.focus();
  }
  function abrir(){
    if (capa) return;
    volver = doc.activeElement;
    paso = 0; nombre = leerNombre();
    capa = doc.createElement('div');
    capa.className = 'pvl-cor';
    capa.setAttribute('role', 'dialog');
    capa.setAttribute('aria-modal', 'true');
    capa.setAttribute('aria-labelledby', 'pvl-cor-titulo');
    capa.innerHTML = '<div class="pvl-cor-caja"><div class="pvl-cor-lang pvl-lang-switch" role="group" aria-label="Language / Idioma"><button type="button" data-lang-btn="en">EN</button><button type="button" data-lang-btn="es">ES</button></div><div class="pvl-cor-pasos" aria-hidden="true"><i></i><i></i><i></i></div><div class="pvl-cor-cuerpo"></div>' +
      '<button type="button" class="pvl-cor-saltar" data-pvl-cor-saltar></button></div>';
    doc.body.appendChild(capa);
    pintarSaltar();
    pintar();
  }
  function pintarSaltar(){ var b = capa && capa.querySelector('[data-pvl-cor-saltar]'); if (b) b.textContent = t({ es: 'Saltar la ceremonia', en: 'Skip the ceremony' }); }
  function cerrar(){
    if (!capa) return;
    marcar();
    capa.remove(); capa = null;
    if (volver && volver.focus) try { volver.focus(); } catch (e) {}
  }
  doc.addEventListener('submit', function(e){
    if (!e.target || !e.target.hasAttribute || !e.target.hasAttribute('data-pvl-cor-form')) return;
    e.preventDefault();
    var inp = e.target.querySelector('#pvl-cor-nombre');
    var n = guardarNombre(inp ? inp.value : '');
    if (!n) { if (inp) inp.focus(); return; }
    nombre = n; paso = 1; marcar(); pintar();
  });
  doc.addEventListener('click', function(e){
    var c = e.target.closest && e.target.closest('[data-pvl-coronar]');
    if (c) { e.preventDefault(); abrir(); return; }
    if (!capa) return;
    if (e.target.closest('[data-pvl-cor-saltar]') || e.target.closest('[data-pvl-cor-fin]')) { cerrar(); return; }
    if (e.target.closest('[data-pvl-cor-sig]')) { paso = 2; pintar(); return; }
    var ir = e.target.closest('[data-pvl-cor-ir]');
    if (ir) {
      e.preventDefault();
      var id = ir.getAttribute('href').slice(1);
      cerrar();
      var dest = null, els = doc.querySelectorAll('#' + id);
      for (var i = 0; i < els.length; i++) if (!els[i].closest('x-dc')) dest = els[i];
      if (dest) dest.scrollIntoView();
    }
  });
  doc.addEventListener('keydown', function(e){
    if (!capa) return;
    if (e.key === 'Escape') { e.preventDefault(); cerrar(); return; }
    if (e.key === 'Tab') {
      var f = capa.querySelectorAll('button, a[href], input');
      if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && doc.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  doc.addEventListener('pavel:langchange', function(){
    if (capa && capa.querySelector('.pvl-cor-caja').getAttribute('data-l') !== lang()) { pintarSaltar(); pintar(); }
  });
  /* Primera visita: solo en la portada, sin ancla (un enlace profundo va a lo suyo), una vez montado el cuerpo. */
  var intentos = 0;
  var esperar = setInterval(function(){
    if (++intentos > 50) { clearInterval(esperar); return; }
    if (coronado() || location.hash) { clearInterval(esperar); return; }
    var hero = doc.querySelector('#pavel-abrir-mundo');
    if (hero && !hero.closest('x-dc')) { clearInterval(esperar); setTimeout(abrir, 900); }
  }, 200);
})();
