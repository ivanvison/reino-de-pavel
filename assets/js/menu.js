/* Menu movil (pvl-nav-). Igual que el resto de <helmet>, corre dos veces
   (parseo + remontaje de support.js), de ahi el candado global. Todo por
   delegacion en document, ya que el boton y el <nav> pueden remontarse. */
(function(){
  if (window.__pvlNavMenu) return;
  window.__pvlNavMenu = true;
  var doc = document;

  function backdrop(){
    var b = doc.getElementById('pvl-nav-backdrop');
    if (!b) {
      b = doc.createElement('div');
      b.id = 'pvl-nav-backdrop';
      doc.body.appendChild(b);
    }
    return b;
  }
  function abrir(){
    var nav = doc.getElementById('pvl-nav');
    var btn = doc.getElementById('pvl-nav-toggle');
    if (!nav || !btn) return;
    nav.classList.add('pvl-nav-open');
    btn.classList.add('pvl-nav-open');
    btn.setAttribute('aria-expanded', 'true');
    sincronizarFondo();
  }
  function cerrar(){
    var nav = doc.getElementById('pvl-nav');
    var btn = doc.getElementById('pvl-nav-toggle');
    if (!nav || !btn) return;
    nav.classList.remove('pvl-nav-open');
    btn.classList.remove('pvl-nav-open');
    btn.setAttribute('aria-expanded', 'false');
    cerrarGrupos();
  }
  /* Fondo oscurecido: visible mientras el menu movil o cualquier
     desplegable este abierto, igual que detras de un modal. */
  function hayAlgoAbierto(){
    return estaAbierto() || !!doc.querySelector('.pvl-nav-group-open');
  }
  function sincronizarFondo(){
    if (!hayAlgoAbierto()) {
      var viejo = doc.getElementById('pvl-nav-backdrop');
      if (viejo) viejo.classList.remove('pvl-nav-backdrop-show');
      return;
    }
    var b = backdrop();
    /* Un frame despues para que arranque la transicion de opacidad;
       se vuelve a comprobar por si se cerro en ese intervalo. */
    requestAnimationFrame(function(){
      if (hayAlgoAbierto()) b.classList.add('pvl-nav-backdrop-show');
    });
  }
  function estaAbierto(){
    var nav = doc.getElementById('pvl-nav');
    return !!(nav && nav.classList.contains('pvl-nav-open'));
  }

  /* Grupos con desplegable (El Reino, Documentos, Honores, Ministerios):
     mismo boton .pvl-nav-trigger + panel .pvl-nav-menu tanto en
     escritorio (desplegable flotante) como en movil (acordeon dentro del
     panel), solo cambia el CSS entre uno y otro. */
  function cerrarGrupos(exceptoGrupo){
    var grupos = doc.querySelectorAll('.pvl-nav-group');
    for (var i = 0; i < grupos.length; i++) {
      if (grupos[i] === exceptoGrupo) continue;
      grupos[i].classList.remove('pvl-nav-group-open');
      var btn = grupos[i].querySelector('.pvl-nav-trigger');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
    sincronizarFondo();
  }
  function alternarGrupo(grupo){
    var abierto = grupo.classList.contains('pvl-nav-group-open');
    cerrarGrupos(abierto ? null : grupo);
    grupo.classList.toggle('pvl-nav-group-open', !abierto);
    var btn = grupo.querySelector('.pvl-nav-trigger');
    if (btn) btn.setAttribute('aria-expanded', String(!abierto));
    sincronizarFondo();
  }

  doc.addEventListener('click', function(e){
    var t = e.target;
    if (t.closest && t.closest('#pvl-nav-toggle')) {
      e.preventDefault();
      if (estaAbierto()) cerrar(); else abrir();
      return;
    }
    var trigger = t.closest && t.closest('.pvl-nav-trigger');
    if (trigger) {
      e.preventDefault();
      var grupo = trigger.closest('.pvl-nav-group');
      if (grupo) alternarGrupo(grupo);
      return;
    }
    if (t.closest && t.closest('#pvl-nav a')) {
      cerrarGrupos();
      cerrar();
      return;
    }
    if (!(t.closest && t.closest('#pvl-nav'))) {
      cerrarGrupos();
      if (estaAbierto()) cerrar();
    }
  });
  doc.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    cerrarGrupos();
    if (estaAbierto()) cerrar();
  });
})();

/* Llegar a una sala desde otra pagina (pagina.html#seccion). El navegador
   busca el ancla al cargar, pero el cuerpo lo monta support.js despues, asi
   que no la encuentra. Se espera a que la seccion este visible y se lleva la
   vista hasta ella; una vez mas al terminar de cargar las imagenes, salvo que
   el visitante ya se haya movido. Mismo candado de doble ejecucion. */
(function(){
  if (window.__pvlAncla) return;
  window.__pvlAncla = true;
  var id = (location.hash || '').slice(1);
  try { id = decodeURIComponent(id); } catch (e) {}
  if (!id) return;
  var movido = false, listo = false;
  function ir(){
    var el = document.getElementById(id);
    if (!el || !el.offsetParent) return false;
    el.scrollIntoView();
    return true;
  }
  ['wheel', 'touchstart', 'keydown'].forEach(function(ev){
    window.addEventListener(ev, function(){ movido = true; }, { passive: true, once: true });
  });
  var n = 0;
  var t = setInterval(function(){
    if (ir() || ++n > 80) { clearInterval(t); listo = true; }
  }, 100);
  window.addEventListener('load', function(){
    setTimeout(function(){ if (listo && !movido) ir(); }, 300);
  });
})();

/* Salas del palacio (.pvl-wings): el bloque es identico en todas las paginas
   para que tools/sync-nav.mjs pueda copiarlo; aqui se marca la sala actual. */
(function(){
  if (window.__pvlSalas) return;
  window.__pvlSalas = true;
  var aqui = (location.pathname.split('/').pop() || 'index.html');
  if (aqui === 'index.html') aqui = 'reino-de-pavel.dc.html';
  function marcar(){
    var ls = document.querySelectorAll('.pvl-wings-grid a');
    for (var i = 0; i < ls.length; i++) {
      var es = ls[i].getAttribute('href') === aqui;
      if (es && ls[i].getAttribute('aria-current') !== 'page') ls[i].setAttribute('aria-current', 'page');
      else if (!es && ls[i].hasAttribute('aria-current')) ls[i].removeAttribute('aria-current');
    }
  }
  marcar();
  setInterval(marcar, 1000);
})();
