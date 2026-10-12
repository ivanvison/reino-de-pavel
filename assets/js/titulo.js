/* Tu Titulo Real (pvl-tit-). Mismo candado de doble ejecucion que el resto de
   <helmet>. El titulo sale de un hash del nombre (FNV-1a sobre el nombre en
   minusculas y sin tildes), asi que el mismo nombre recibe siempre el mismo
   titulo. Los bancos de palabras van en paralelo: el indice elegido da la misma
   pieza en espanol y en ingles. La patente se dibuja con window.PavelLienzo.
   Nada se guarda ni se envia. */
(function(){
  if (window.__pvlTitulo) return;
  window.__pvlTitulo = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function uno(sel){
    var els = doc.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  function peregrino(){
    var m = doc.cookie.match(/(?:^|; )pavelense=([^;]*)/);
    if (m) { try { return decodeURIComponent(m[1]).trim(); } catch (e) { return String(m[1] || '').trim(); } }
    try { return (localStorage.getItem('pavelense') || '').trim(); } catch (e) { return ''; }
  }

  var TRATAMIENTO = [
    { es: 'Su Excelencia', en: 'Their Excellency' }, { es: 'Su Ilustrísima', en: 'The Most Illustrious' },
    { es: 'Su Serenidad', en: 'The Most Serene' }, { es: 'Su Magnificencia', en: 'The Magnificent' },
    { es: 'Su Alteza Menor', en: 'Their Lesser Highness' }, { es: 'Su Grandeza Delegada', en: 'Their Delegated Greatness' },
    { es: 'Su Reverberancia', en: 'Their Reverberance' }, { es: 'Su Iridiscencia', en: 'Their Iridescence' }
  ];
  var EPITETO = [
    { es: 'de la Crin Iridiscente', en: 'of the Iridescent Mane' }, { es: 'del Aplauso Fácil', en: 'of the Easy Applause' },
    { es: 'de la Reverencia Perfecta', en: 'of the Perfect Bow' }, { es: 'de las Mil Pepitas', en: 'of the Thousand Nuggets' },
    { es: 'del Himno en Bucle', en: 'of the Looping Anthem' }, { es: 'de la Siesta de Estado', en: 'of the State Siesta' },
    { es: 'del Monte Non Plus Ultra', en: 'of Mount Non Plus Ultra' }, { es: 'del Lago Iridiscente', en: 'of Lake Iridescent' },
    { es: 'de la Mirada Leal', en: 'of the Loyal Gaze' }, { es: 'del Buc-ee’s del Desierto', en: 'of the Desert Buc-ee’s' },
    { es: 'de la Ovación Interminable', en: 'of the Endless Ovation' }, { es: 'del Cogito Corregido', en: 'of the Corrected Cogito' }
  ];
  var OFICIO = [
    { es: 'Portaestandarte de la Iridiscente', en: 'Standard-Bearer of the Iridescent' },
    { es: 'Vigía del Tercer Unicornio', en: 'Keeper of the Third Unicorn' },
    { es: 'Guardasellos de la Pepita Dorada', en: 'Keeper of the Seal of the Golden Nugget' },
    { es: 'Heraldo del Himno Eterno', en: 'Herald of the Eternal Anthem' },
    { es: 'Cronista Menor del Non Plus Ultra', en: 'Lesser Chronicler of the Non Plus Ultra' },
    { es: 'Centinela del Trono Vacío (está Pavel)', en: 'Sentinel of the Empty Throne (Pavel is on it)' },
    { es: 'Sumiller de la Fuente Real', en: 'Sommelier of the Royal Fountain' },
    { es: 'Testigo Oficial de la Grandeza', en: 'Official Witness of Greatness' },
    { es: 'Intérprete del Silencio Real', en: 'Interpreter of the Royal Silence' },
    { es: 'Agente del Castor de la Abundancia', en: 'Agent of the Beaver of Abundance' }
  ];
  var JURAMENTO = [
    { es: 'con juramento de admiración eterna al Non Plus Ultra', en: 'Sworn to Eternal Admiration of the Non Plus Ultra' },
    { es: 'que jamás dudó de Pavel', en: 'Who Never Once Doubted Pavel' },
    { es: 'leal hasta el último estribillo', en: 'Loyal to the Last Chorus' },
    { es: 'que se inclina antes de que se lo pidan', en: 'Who Bows Before Being Asked' },
    { es: 'aplaudidor de primera fila', en: 'Front-Row Applauder' },
    { es: 'por la gracia de Pavel y nadie más', en: 'By the Grace of Pavel and No One Else' }
  ];

  function hash(s){
    var h = 0x811c9dc5;
    s = String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h >>> 0;
  }
  function titulo(nombre){
    var h = hash(nombre);
    function pick(a, k){ return a[Math.floor(h / k) % a.length]; }
    return {
      trat: pick(TRATAMIENTO, 1), epi: pick(EPITETO, 7), ofi: pick(OFICIO, 89), jur: pick(JURAMENTO, 997),
      num: String(h % 10000).padStart(4, '0')
    };
  }
  function texto(n, tt, l){
    return tt.trat[l] + ' ' + n + ' ' + tt.epi[l] + ', ' + tt.ofi[l] + ', ' + tt.jur[l] + '.';
  }

  var actual = null; /* el nombre otorgado */
  function pintar(){
    var out = uno('#pvl-tit-out');
    if (!out) return;
    var l = lang();
    if (!actual) { out.hidden = true; return; }
    var tt = titulo(actual);
    out.hidden = false;
    out.querySelector('.pvl-tit-texto').textContent = texto(actual, tt, l);
    out.querySelector('.pvl-tit-num').textContent = (l === 'es' ? 'Patente de nobleza N.º ' : 'Letters patent No. ') + tt.num;
    out.setAttribute('data-l', l);
  }

  function dibujar(nombre){
    var Lz = window.PavelLienzo;
    var l = lang(), tt = titulo(nombre);
    var w = 1200, h = 675, c = Lz.nuevo(w, h), ctx = c.getContext('2d');
    Lz.marco(ctx, w, h);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#d8b25c';
    ctx.font = "600 16px 'IBM Plex Mono', monospace";
    ctx.fillText(l === 'es' ? 'IMPERIO DEL REINO DE PAVEL · PATENTE DE NOBLEZA' : 'EMPIRE OF THE KINGDOM OF PAVEL · LETTERS PATENT OF NOBILITY', w / 2, 92);
    ctx.fillStyle = '#f4efe2';
    ctx.font = "300 22px 'IBM Plex Sans', sans-serif";
    ctx.fillText(l === 'es' ? 'Por la presente, el Soberano confiere a' : 'The Sovereign hereby confers upon', w / 2, 150);
    ctx.fillStyle = '#e9c874';
    ctx.font = "italic 700 50px 'Bodoni Moda', Georgia, serif";
    ctx.fillText(tt.trat[l] + ' ' + nombre, w / 2, 222);
    ctx.fillStyle = '#f7f2e6';
    ctx.font = "700 32px 'Bodoni Moda', Georgia, serif";
    var y = Lz.envolver(ctx, tt.epi[l].charAt(0).toUpperCase() + tt.epi[l].slice(1) + ', ' + tt.ofi[l] + ',', w / 2, 296, 960, 44);
    ctx.fillStyle = '#f2a9dc';
    ctx.font = "italic 400 26px 'Bodoni Moda', Georgia, serif";
    Lz.envolver(ctx, tt.jur[l] + '.', w / 2, y + 54, 960, 36);
    ctx.fillStyle = 'rgba(244,239,226,.6)';
    ctx.font = "500 14px 'IBM Plex Mono', monospace";
    ctx.fillText((l === 'es' ? 'N.º ' : 'NO. ') + tt.num + ' · ' + new Date().toLocaleDateString(l === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase() + (l === 'es' ? ' · AÑO 0' : ' · YEAR 0'), w / 2, 585);
    ctx.fillText(l === 'es' ? 'EL NON PLUS ULTRA' : 'THE NON PLUS ULTRA', w / 2, 610);
    Lz.sello(ctx, w - 150, h - 150, 56);
    return c;
  }

  function otorgar(){
    var inp = uno('#pvl-tit-nombre');
    var n = inp ? inp.value.replace(/\s+/g, ' ').trim().slice(0, 40) : '';
    if (!n) { if (inp) inp.focus(); return; }
    actual = n;
    pintar();
  }
  doc.addEventListener('click', function(e){
    if (e.target.closest && e.target.closest('#pvl-tit-btn')) { e.preventDefault(); otorgar(); return; }
    if (e.target.closest && e.target.closest('#pvl-tit-descargar')) {
      e.preventDefault();
      if (!actual || !window.PavelLienzo) return;
      var n = actual;
      window.PavelLienzo.conFuentes(function(){ window.PavelLienzo.descargar(dibujar(n), 'titulo-real-' + window.PavelLienzo.slug(n) + '.png'); });
    }
  });
  doc.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && e.target && e.target.id === 'pvl-tit-nombre') { e.preventDefault(); otorgar(); }
  });
  function tick(){
    var inp = uno('#pvl-tit-nombre');
    if (inp && !inp.getAttribute('data-pvl-rellenado')) {
      inp.setAttribute('data-pvl-rellenado', '1');
      var p = peregrino();
      if (p && !inp.value) inp.value = p;
    }
    var out = uno('#pvl-tit-out');
    if (out && actual && out.getAttribute('data-l') !== lang()) pintar();
    if (out && actual && out.hidden) pintar();
  }
  setInterval(tick, 400);
  doc.addEventListener('pavel:langchange', tick);
})();
