/* Banda sonora (pvl-st-). Mismo candado de doble ejecucion que el resto de
   <helmet>. No hay reproduccion automatica: el iframe de youtube-nocookie
   solo se crea cuando el visitante pulsa una pista, y entonces sigue con el
   resto de la lista. El himno y YouTube no suenan a la vez: elegir una pista
   de YouTube pausa #pavel-audio, y elegir el himno quita el iframe. */
(function(){
  if (window.__pvlSoundtrack) return;
  window.__pvlSoundtrack = true;
  var doc = document;
  var ORDEN = ["anthem", "Szdziw4tI9o", "weFJHtcxJt0", "04854XqcfCY", "HgzGwKwLmgM", "GC5E8ie2pdM", "bWcASV2sey0", "btPJPFnesV4", "AxWejrVYcCg", "9jK-NcRmVcw", "7ufkMTshjz8", "tF_ggG5dY5U", "imeXSRNRMeg", "suQC8d-YkeU", "y6120QOlsfU", "dQw4w9WgXcQ"];
  var META = {"anthem": {"es": "El Ruir del Unicornio", "en": "The Roar of the Unicorn", "artist": "Pavel Navarro"}, "Szdziw4tI9o": {"es": "Also sprach Zarathustra", "en": "Also sprach Zarathustra", "artist": "Richard Strauss · Berliner Philharmoniker"}, "weFJHtcxJt0": {"es": "¡Aleluya!", "en": "Hallelujah!", "artist": "G. F. Händel"}, "04854XqcfCY": {"es": "We Are the Champions", "en": "We Are the Champions", "artist": "Queen"}, "HgzGwKwLmgM": {"es": "Don't Stop Me Now", "en": "Don't Stop Me Now", "artist": "Queen"}, "GC5E8ie2pdM": {"es": "The Best", "en": "The Best", "artist": "Tina Turner"}, "bWcASV2sey0": {"es": "Holding Out for a Hero", "en": "Holding Out for a Hero", "artist": "Bonnie Tyler"}, "btPJPFnesV4": {"es": "Eye of the Tiger", "en": "Eye of the Tiger", "artist": "Survivor"}, "AxWejrVYcCg": {"es": "Gonna Fly Now (Rocky)", "en": "Gonna Fly Now (Rocky)", "artist": "Bill Conti"}, "9jK-NcRmVcw": {"es": "The Final Countdown", "en": "The Final Countdown", "artist": "Europe"}, "7ufkMTshjz8": {"es": "1492: La conquista del paraíso", "en": "1492: Conquest of Paradise", "artist": "Vangelis"}, "tF_ggG5dY5U": {"es": "La copa de la vida", "en": "The Cup of Life", "artist": "Ricky Martin"}, "imeXSRNRMeg": {"es": "La negra tiene tumbao", "en": "La negra tiene tumbao", "artist": "Celia Cruz"}, "suQC8d-YkeU": {"es": "Ojalá que llueva café", "en": "Ojalá que llueva café", "artist": "Juan Luis Guerra 4.40"}, "y6120QOlsfU": {"es": "Sandstorm", "en": "Sandstorm", "artist": "Darude"}, "dQw4w9WgXcQ": {"es": "Never Gonna Give You Up", "en": "Never Gonna Give You Up", "artist": "Rick Astley"}};
  var actual = null;
  var reposo = null;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function himno(){ return doc.getElementById('pavel-audio'); }

  function src(id){
    var yt = ORDEN.filter(function(v){ return v !== 'anthem'; });
    var i = yt.indexOf(id);
    var resto = yt.slice(i + 1).concat(yt.slice(0, i));
    return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1&playlist=' + resto.join(',');
  }
  function iframe(id){
    var f = doc.createElement('iframe');
    f.src = src(id);
    f.title = 'YouTube: ' + META[id][lang()] + ' \u2014 ' + META[id].artist;
    f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    return f;
  }
  function pintar(){
    var rows = doc.querySelectorAll('[data-pvl-track]');
    for (var i = 0; i < rows.length; i++) rows[i].classList.toggle('pvl-st-on', rows[i].getAttribute('data-pvl-track') === actual);
    var now = doc.getElementById('pvl-st-now');
    if (now && actual) {
      var m = META[actual];
      now.textContent = (lang() === 'es' ? 'Sonando: ' : 'Now playing: ') + m[lang()] + ' \u2014 ' + m.artist;
    }
    /* Si support.js remonto el reproductor, vuelve a poner el iframe. */
    var p = doc.getElementById('pvl-st-player');
    if (actual && actual !== 'anthem' && montado(p) && !p.querySelector('iframe')) {
      p.innerHTML = '';
      p.appendChild(iframe(actual));
    }
  }
  doc.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-pvl-track-btn]');
    if (!b) return;
    var id = b.getAttribute('data-pvl-track-btn');
    var a = himno();
    var p = doc.getElementById('pvl-st-player');
    if (id === 'anthem') {
      /* Antes de repintar: apply() dispara pavel:langchange, y pintar()
         volveria a poner el iframe si aun creyera que suena YouTube. */
      actual = 'anthem';
      if (montado(p) && reposo !== null) {
        p.innerHTML = reposo;
        if (window.PavelI18N) window.PavelI18N.apply(window.PavelI18N.get());
      }
      if (a) { a.currentTime = 0; var pr = a.play(); if (pr && pr['catch']) pr['catch'](function(){}); }
    } else {
      if (a && !a.paused) a.pause();
      /* El primer gesto de la pagina arranca el himno en pointerdown; se
         vuelve a pausar en cuanto ese play() se resuelva. */
      setTimeout(function(){ var h = himno(); if (h && !h.paused) h.pause(); }, 250);
      actual = id;
      if (montado(p)) {
        if (reposo === null) reposo = p.innerHTML;
        p.innerHTML = '';
        p.appendChild(iframe(id));
      }
    }
    pintar();
  });
  doc.addEventListener('pavel:langchange', pintar);
  setInterval(pintar, 700);
})();
