/* Reproductor del himno "El Ruir del Unicornio".
   Este bloque se ejecuta dos veces -- una al parsear el documento y otra
   cuando support.js lo remonta en <head> -- asi que el candado global evita
   registrar los oyentes por duplicado (dos oyentes = play seguido de pause).
   Todo se delega en document porque el cuerpo se monta despues. */
(function(){
  if (window.__himnoPavel) return;
  window.__himnoPavel = true;

  var doc = document;
  function $(id){ return doc.getElementById(id); }
  function audio(){ return $('pavel-audio'); }
  function fmt(s){ if(!isFinite(s)||s<0) s=0; var m=Math.floor(s/60),r=Math.floor(s%60); return m+':'+(r<10?'0':'')+r; }

  /* Reproductor minimo (pvl-mini-): solo movil, ver el media query. Igual
     que #pvl-nav-backdrop, se crea una vez y se cuelga de <body> para que
     el position:fixed sea de verdad relativo al viewport. Un
     IntersectionObserver sobre #pavel-player lo muestra en cuanto el
     reproductor grande sale de pantalla por arriba, y lo oculta al volver. */
  function miniPlayer(){
    var m = $('pvl-mini-player');
    if (m) return m;
    m = doc.createElement('div');
    m.id = 'pvl-mini-player';
    m.innerHTML =
      '<button id="pavel-mini-toggle" type="button" aria-label="Play the anthem" data-aria-es="Reproducir el himno" data-aria-en="Play the anthem">' +
        '<svg id="pavel-mini-icon-play" width="14" height="14" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true"><path d="M4.5 2.6 15 9 4.5 15.4z"></path></svg>' +
        '<svg id="pavel-mini-icon-pause" width="14" height="14" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true" style="display:none"><path d="M4 2.5h3.4v13H4zm6.6 0H14v13h-3.4z"></path></svg>' +
      '</button>' +
      '<div class="pvl-mini-title"><span data-lang="es">El Ruir del Unicornio</span><span data-lang="en">The Roar of the Unicorn</span></div>' +
      '<div id="pvl-mini-track"><div id="pvl-mini-progress"></div></div>';
    doc.body.appendChild(m);
    if (window.PavelI18N) window.PavelI18N.apply(window.PavelI18N.get());
    return m;
  }

  function paint(){
    var a=audio(); if(!a) return;
    /* El lienzo descarta los atributos sin valor, asi que el bucle se fija aqui. */
    if(!a.loop) a.loop=true;
    var d=a.duration||0,bar=$('pavel-progress'),out=$('pavel-time'),
        ip=$('pavel-icon-play'),ia=$('pavel-icon-pause'),btn=$('pavel-toggle'),
        mbar=$('pvl-mini-progress'),mip=$('pavel-mini-icon-play'),mia=$('pavel-mini-icon-pause'),mbtn=$('pavel-mini-toggle');
    if(bar) bar.style.right=(d?(100-(a.currentTime/d)*100):100)+'%';
    if(out) out.textContent=fmt(a.currentTime)+' / '+fmt(d);
    if(mbar) mbar.style.right=(d?(100-(a.currentTime/d)*100):100)+'%';
    var playing=!a.paused&&!a.ended;
    if(ip) ip.style.display=playing?'none':'';
    if(ia) ia.style.display=playing?'':'none';
    if(mip) mip.style.display=playing?'none':'';
    if(mia) mia.style.display=playing?'':'none';
    if(btn||mbtn){
      var lang=(window.PavelI18N&&window.PavelI18N.get())||'en';
      var es=lang==='es';
      var label=playing?(es?'Pausar el himno':'Pause the anthem'):(es?'Reproducir el himno':'Play the anthem');
      [btn,mbtn].forEach(function(b){
        if(!b) return;
        b.setAttribute('data-aria-es','Pausar el himno');
        b.setAttribute('data-aria-en','Pause the anthem');
        b.setAttribute('aria-label',label);
      });
    }
  }

  function start(){
    var a=audio(); if(!a) return null;
    var p=a.play();
    if(p&&p.then) p.then(paint)['catch'](function(){});
    return p;
  }

  doc.addEventListener('click',function(e){
    var a=audio(); if(!a) return;
    var t=e.target;
    if(t.closest&&(t.closest('#pavel-toggle')||t.closest('#pavel-mini-toggle'))){
      if(a.paused){ start(); } else { a.pause(); }
      paint();
      return;
    }
    var track=t.closest&&t.closest('#pavel-track');
    if(track){
      var d=a.duration; if(!isFinite(d)||!d) return;
      var r=track.getBoundingClientRect();
      a.currentTime=Math.min(Math.max((e.clientX-r.left)/r.width,0),1)*d;
      paint();
    }
  });

  /* Muestra/oculta el reproductor minimo segun si #pavel-player sigue a la
     vista. Un IntersectionObserver con threshold:0 no sirve aqui: si el
     usuario hace un scroll rapido, el elemento puede saltar de "0% visible
     por debajo" a "0% visible por encima" sin que la ratio cruce nunca el
     umbral, y el observer no vuelve a disparar. En su lugar se mide
     getBoundingClientRect() en cada scroll (con rAF para no saturar). */
  var miniRaf=false;
  function checkMiniVisibility(){
    miniRaf=false;
    var target=$('pavel-player'), m=$('pvl-mini-player');
    if(!target||!m) return;
    var r=target.getBoundingClientRect();
    m.classList.toggle('pvl-mini-show', r.bottom<0);
  }
  function onMiniScroll(){
    if(miniRaf) return;
    miniRaf=true;
    requestAnimationFrame(checkMiniVisibility);
  }
  miniPlayer();
  doc.addEventListener('scroll', onMiniScroll, { passive:true, capture:true });
  window.addEventListener('resize', onMiniScroll);
  checkMiniVisibility();
  /* Resync periodico (mismo patron que el resto del archivo): support.js
     remonta el arbol, asi que #pavel-player/#pvl-mini-player pueden haber
     sido reemplazados por nodos nuevos entre dos scrolls. */
  setInterval(checkMiniVisibility, 800);

  /* Sin arranque automatico. El himno solo suena cuando el visitante pulsa
     play (#pavel-toggle o #pvl-mini-toggle), gestionado por el click de arriba.
     Antes se intentaba reproducir al cargar la portada y, si el navegador lo
     bloqueaba, al primer gesto del visitante en cualquier parte de la pagina;
     esa reproduccion automatica se retiro a peticion del propietario. */

  setInterval(paint,200);
})();
