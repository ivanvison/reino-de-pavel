/* Karaoke del himno (pvl-kar-). Mismo candado de doble ejecucion que el resto
   de <helmet>. Lee el tiempo del <audio id="pavel-audio"> del reproductor de
   la portada (el mismo bucle, no otro audio) y resalta la linea que suena, con
   un unicornio que avanza sobre ella. La letra espanola es la autoritativa; la
   inglesa sigue los mismos tiempos. Los tiempos salen del perfil de energia de
   la grabacion (las caidas entre frases), no de un oido: si una linea entra
   tarde o pronto, se corrige en TIEMPOS y nada mas. */
(function(){
  if (window.__pvlKaraoke) return;
  window.__pvlKaraoke = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function uno(sel){
    var els = doc.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  /* [inicio, fin] de cada linea, en segundos, sobre la pista de 30,8 s. */
  var TIEMPOS = [[0.2, 4.7], [4.9, 7.9], [8.0, 12.4], [12.6, 17.2], [17.4, 22.1], [22.2, 30.6]];
  var LETRA = {
    es: ['Antes del Big Bang tu eterna luz brilló', '¡Oh, Pavel! De la existencia emanación', 'Unicornio de perfección sin par', 'En el léxico tu nombre es sinónimo de grandeza', '¡Tu legado es el Non Plus Ultra!', '¡Oh, Pavel! ¡Pavel, nombre inmortal!'],
    en: ['Before the Big Bang your eternal light shone', 'Oh, Pavel! From existence you emanate', 'Unicorn of peerless perfection', 'In the lexicon your name is synonymous with greatness', 'Your legacy is the Non Plus Ultra!', 'Oh, Pavel! Pavel, immortal name!']
  };
  var modo = 'letra';
  function audio(){ return doc.getElementById('pavel-audio'); }

  function montar(box){
    var l = lang();
    box.innerHTML = LETRA[l].map(function(txt, i){
      return '<p class="pvl-kar-linea" data-i="' + i + '"><span class="pvl-kar-txt">' + txt.replace(/[&<>]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }) + '</span></p>';
    }).join('') + '<div class="pvl-kar-uni" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 20c0-6 2-9 6-11l-1-3 3 2 5-6-2 9c3 2 3 5 2 8-2-1-4-1-6 0l-1 1z" fill="#f4efe2" stroke="#d8b25c" stroke-width="1"/><path d="M13 9l-1 4" stroke="#f2a9dc" stroke-width="1.5"/></svg></div>';
    box.setAttribute('data-l', l);
  }
  function pintar(){
    var card = uno('#pvl-kar-card');
    if (!card) return;
    card.setAttribute('data-pvl-kar', modo);
    var tabs = card.querySelectorAll('[data-pvl-kar-modo]');
    for (var k = 0; k < tabs.length; k++) tabs[k].setAttribute('aria-pressed', tabs[k].getAttribute('data-pvl-kar-modo') === modo ? 'true' : 'false');
    if (modo !== 'karaoke') return;
    var box = card.querySelector('#pvl-kar-lineas');
    if (!box) return;
    if (box.getAttribute('data-l') !== lang() || !box.querySelector('.pvl-kar-uni')) montar(box);
    var a = audio(), t = a ? a.currentTime : 0, sonando = a && !a.paused;
    var actual = -1;
    for (var i = 0; i < TIEMPOS.length; i++) if (t >= TIEMPOS[i][0] - 0.15 && t < TIEMPOS[i][1] + 0.15) actual = i;
    var ls = box.querySelectorAll('.pvl-kar-linea');
    for (var j = 0; j < ls.length; j++) {
      var p = j < actual ? 1 : j === actual ? Math.max(0, Math.min(1, (t - TIEMPOS[j][0]) / (TIEMPOS[j][1] - TIEMPOS[j][0]))) : 0;
      ls[j].classList.toggle('pvl-kar-on', j === actual);
      ls[j].classList.toggle('pvl-kar-ya', j < actual);
      ls[j].style.setProperty('--pvl-kar-p', (p * 100).toFixed(1) + '%');
    }
    var uni = box.querySelector('.pvl-kar-uni');
    if (uni) {
      var cur = actual >= 0 ? ls[actual] : null;
      if (cur && sonando) {
        var tx = cur.querySelector('.pvl-kar-txt'), pr = (t - TIEMPOS[actual][0]) / (TIEMPOS[actual][1] - TIEMPOS[actual][0]);
        uni.style.opacity = '1';
        uni.style.transform = 'translate(' + Math.round(tx.offsetLeft + Math.max(0, Math.min(1, pr)) * tx.offsetWidth - 11) + 'px,' + Math.round(cur.offsetTop - 20) + 'px)';
      } else uni.style.opacity = '0';
    }
    var est = card.querySelector('#pvl-kar-estado');
    if (est) {
      var l = lang();
      est.textContent = sonando ? (l === 'es' ? 'Cante de pie.' : 'Sing standing up.') : (l === 'es' ? 'El himno está en pausa: pulse «Cantar desde el principio».' : 'The anthem is paused: press “Sing from the top”.');
    }
  }
  doc.addEventListener('click', function(e){
    var m = e.target.closest && e.target.closest('[data-pvl-kar-modo]');
    if (m) { modo = m.getAttribute('data-pvl-kar-modo'); pintar(); return; }
    if (e.target.closest && e.target.closest('#pvl-kar-desde')) {
      var a = audio(); if (!a) return;
      modo = 'karaoke';
      a.currentTime = 0;
      var p = a.play(); if (p && p['catch']) p['catch'](function(){});
      pintar();
    }
  });
  setInterval(pintar, 100);
})();
