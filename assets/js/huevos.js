/* Huevos de pascua (pvl-egg-). Igual que los demas bloques de <helmet>, este
   se ejecuta dos veces (parseo + remontaje de support.js), de ahi el candado
   global. Nada de esto se guarda ni se envia a ningun sitio. */
(function(){
  if (window.__pvlEggs) return;
  window.__pvlEggs = true;
  var doc = document;

  function toast(esText, enText){
    var t = document.getElementById('pvl-egg-toast');
    if (!t) {
      t = doc.createElement('div');
      t.id = 'pvl-egg-toast';
      doc.body.appendChild(t);
    }
    var lang = (window.PavelI18N && window.PavelI18N.get()) || 'en';
    t.textContent = lang === 'es' ? esText : enText;
    t.classList.add('pvl-egg-show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function(){ t.classList.remove('pvl-egg-show'); }, 4200);
  }

  /* Codigo Konami: ↑↑↓↓←→←→BA */
  var KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  var progreso = 0;
  doc.addEventListener('keydown', function(e){
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    var esperado = KONAMI[progreso];
    if (k === esperado) {
      progreso++;
      if (progreso === KONAMI.length) {
        progreso = 0;
        doc.documentElement.classList.remove('pvl-egg-rainbow');
        void doc.documentElement.offsetWidth;
        doc.documentElement.classList.add('pvl-egg-rainbow');
        toast('Código reconocido. La grandeza cambia de color por un instante.', 'Code recognized. Greatness briefly changes color.');
      }
    } else {
      progreso = (k === KONAMI[0]) ? 1 : 0;
    }
  });

  /* Siete clics al escudo */
  var clicsEscudo = 0, clicsEscudoTimer = null;
  doc.addEventListener('click', function(e){
    var crest = e.target.closest && e.target.closest('#pvl-egg-crest');
    if (!crest) return;
    clicsEscudo++;
    clearTimeout(clicsEscudoTimer);
    clicsEscudoTimer = setTimeout(function(){ clicsEscudo = 0; }, 2500);
    if (clicsEscudo >= 7) {
      clicsEscudo = 0;
      crest.classList.remove('pvl-egg-crest-pulse');
      void crest.offsetWidth;
      crest.classList.add('pvl-egg-crest-pulse');
      toast('El escudo reconoce tu insistencia. Tres unicornios asienten.', 'The crest acknowledges your persistence. Three unicorns nod.');
    }
  });

  /* Bucles del himno: el <audio loop> nunca dispara "ended", asi que se
     cuenta cuando currentTime retrocede de cerca del final a cerca del
     principio. */
  var vueltasHimno = 0, ultimoTiempo = 0, avisado3 = false;
  doc.addEventListener('timeupdate', function(e){
    var a = e.target;
    if (!a || a.id !== 'pavel-audio') return;
    var d = a.duration || 0;
    if (d && ultimoTiempo > d * 0.85 && a.currentTime < d * 0.15) {
      vueltasHimno++;
      if (vueltasHimno === 3 && !avisado3) {
        avisado3 = true;
        toast('Tres vueltas al himno. Tu lealtad queda registrada.', 'Three loops of the anthem. Your loyalty is on record.');
      }
    }
    ultimoTiempo = a.currentTime;
  }, true);
})();
