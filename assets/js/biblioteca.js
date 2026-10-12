/* Biblioteca Real (pvl-lib-). Mismo candado de doble ejecucion que el resto
   de <helmet>. La escritura elegida (pavelense = derecha a izquierda, o la
   traduccion plebeya) vive en <html data-pvl-script> y en localStorage; el
   CSS hace el resto, asi que sobrevive a los remontajes de support.js. Los
   numeros de la Biblioteca van "en mayuscula": en numeros romanos. Nada de lo
   que se escribe en la Sala de Correcciones se guarda ni se envia. */
(function(){
  if (window.__pvlLibrary) return;
  window.__pvlLibrary = true;
  var doc = document;
  var KEY = 'pavel-lib-script';
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }

  function leer(){
    try { var v = localStorage.getItem(KEY); if (v === 'pavel' || v === 'plebe') return v; } catch (e) {}
    return 'pavel';
  }
  var escritura = leer();
  function aplicar(){
    doc.documentElement.setAttribute('data-pvl-script', escritura);
    var bs = doc.querySelectorAll('[data-pvl-script-btn]');
    for (var i = 0; i < bs.length; i++) {
      bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-pvl-script-btn') === escritura ? 'true' : 'false');
    }
  }
  doc.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-pvl-script-btn]');
    if (!b) return;
    escritura = b.getAttribute('data-pvl-script-btn');
    try { localStorage.setItem(KEY, escritura); } catch (err) {}
    aplicar();
  });
  aplicar();
  /* Los botones pueden remontarse con aria-pressed de la plantilla. */
  setInterval(aplicar, 500);

  function romano(n){
    var t = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    var s = '';
    for (var i = 0; i < t.length; i++) while (n >= t[i][0]) { s += t[i][1]; n -= t[i][0]; }
    return s;
  }
  function azar(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }

  function mayus(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
  var TITULO = {
    es: function(t){ return t + ' (edición corregida)'; },
    en: function(t){ return t + ' (corrected edition)'; }
  };
  var ENTRADAS = [
    { es: function(t, y){ return 'Se creía que ' + t + ' había sido inventado en el año ' + y + '. Falso: en el año ' + y + ' simplemente se le ocurrió a alguien pedirle permiso a Pavel, que lo había concebido mucho antes, durante una siesta.'; },
      en: function(t, y){ return 'It was believed that ' + t + ' was invented in the year ' + y + '. False: in the year ' + y + ' someone merely thought to ask Pavel’s permission; he had conceived it long before, during a nap.'; } },
    { es: function(t, y){ return 'Los historiadores sitúan el origen de ' + t + ' hacia el año ' + y + '. Omiten que su único propósito, desde el primer día, fue entretener al Soberano durante IV minutos y medio.'; },
      en: function(t, y){ return 'Historians place the origin of ' + t + ' around the year ' + y + '. They omit that its sole purpose, from day one, was to entertain the Sovereign for IV and a half minutes.'; } },
    { es: function(t, y){ return 'Primera mención documentada de ' + t + ': año ' + y + ', en una carta a Pavel que decía, textualmente, «esto también es por usted».'; },
      en: function(t, y){ return 'First documented mention of ' + t + ': the year ' + y + ', in a letter to Pavel that read, verbatim, “this one is for you too.”'; } },
    { es: function(t, y){ return 'Durante siglos, ' + t + ' fue atribuido a la casualidad. Tras XL años de investigación, la Biblioteca confirma que la casualidad es uno de los seudónimos de Pavel.'; },
      en: function(t, y){ return 'For centuries, ' + t + ' was attributed to chance. After XL years of research, the Library confirms that chance is one of Pavel’s pen names.'; } },
    { es: function(t, y){ return 'En el año ' + y + ', ' + t + ' intentó existir sin mencionar a Pavel. Duró III días. La versión actual, debidamente agradecida, es la que usted conoce.'; },
      en: function(t, y){ return 'In the year ' + y + ', ' + t + ' tried to exist without mentioning Pavel. It lasted III days. The current version, duly grateful, is the one you know.'; } }
  ];
  var ultima = null;
  function pintar(){
    var out = doc.getElementById('pvl-lib-output');
    if (!ultima || !montado(out)) return;
    var L = lang();
    out.innerHTML = '';
    var ref = doc.createElement('div');
    ref.style.cssText = "margin-top:14px;font:500 9px/1.4 'IBM Plex Mono',monospace;letter-spacing:.18em;color:rgba(32,26,51,.55)";
    ref.textContent = (L === 'es' ? 'VOLUMEN ' : 'VOLUME ') + ultima.vol + ' · ' + (L === 'es' ? 'PÁGINA ' : 'PAGE ') + ultima.pag;
    var h = doc.createElement('h4');
    h.textContent = TITULO[L](mayus(ultima.tema));
    var p = doc.createElement('p');
    p.className = 'pvl-lib-text';
    p.textContent = ENTRADAS[ultima.idx][L](ultima.tema, ultima.anio);
    var firma = doc.createElement('p');
    firma.className = 'pvl-lib-text';
    firma.style.fontWeight = '600';
    firma.textContent = L === 'es' ? 'Corregido por orden del Soberano. La versión anterior queda derogada.' : 'Corrected by order of the Sovereign. The previous version is hereby repealed.';
    out.appendChild(ref); out.appendChild(h); out.appendChild(p); out.appendChild(firma);
  }
  doc.addEventListener('submit', function(e){
    if (!e.target || e.target.id !== 'pvl-lib-form') return;
    e.preventDefault();
    var inp = doc.getElementById('pvl-lib-input');
    var tema = String((inp && inp.value) || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    if (!tema) { if (inp) inp.focus(); return; }
    ultima = { tema: tema, idx: azar(0, ENTRADAS.length - 1), anio: romano(azar(300, 1999)), vol: romano(azar(13, 99)), pag: romano(azar(1, 999)) };
    pintar();
  });
  doc.addEventListener('pavel:langchange', pintar);
})();
