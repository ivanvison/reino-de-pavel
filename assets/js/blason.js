/* Taller de blasones (pvl-bl-). Mismo candado de doble ejecucion que el resto
   de <helmet>. El blason se compone en SVG con piezas de la paleta nacional:
   forma del escudo, esmalte del campo, particion y segundo esmalte, mueble y su
   esmalte, tenantes, nombre de la casa y lema. Las opciones son radios del
   formulario #pvl-bl-form, asi que el estado vive en el DOM y sobrevive al
   idioma. Se descarga en SVG o en PNG (la imagen pasa por un data: URL, que la
   CSP ya permite en img-src). Nada se guarda ni se envia. */
(function(){
  if (window.__pvlBlason) return;
  window.__pvlBlason = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function uno(sel){
    var els = doc.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var DEF = { forma: 'clasico', campo: 'violeta', part: 'ninguna', part2: 'gules', mueble: 'unicornio', mueble2: 'oro', ten: 'unicornios' };
  var ESMALTES = {
    violeta: '#1b1150', oro: '#d8b25c', plata: '#ece7db', gules: '#9e1f33',
    rosa: '#f2a9dc', turquesa: '#3fb8c4', iris: 'url(#pvl-bl-iris)'
  };
  var FORMAS = {
    clasico: 'M110 70H290V190C290 270 236 310 200 332C164 310 110 270 110 190Z',
    frances: 'M110 70H290V250Q290 300 242 305Q210 308 200 332Q190 308 158 305Q110 300 110 250Z',
    iberico: 'M110 70H290V240A90 90 0 0 1 110 240Z',
    losange: 'M200 58L304 200L200 342L96 200Z'
  };
  function particion(p, c){
    switch (p) {
      case 'palo': return '<rect x="200" y="40" width="120" height="320" fill="' + c + '"/>';
      case 'faja': return '<rect x="80" y="200" width="240" height="160" fill="' + c + '"/>';
      case 'cuartel': return '<rect x="200" y="40" width="120" height="160" fill="' + c + '"/><rect x="80" y="200" width="120" height="160" fill="' + c + '"/>';
      case 'banda': return '<path d="M80 40H140L320 300V360H260L80 100Z" fill="' + c + '"/>';
      case 'chevron': return '<path d="M80 330L200 190L320 330V280L200 140L80 280Z" fill="' + c + '"/>';
      default: return '';
    }
  }
  var MUEBLES = {
    unicornio: '<path d="M-38 58c0-26 10-42 30-50l-6-14 14 8 20-42-8 48c12 8 14 22 8 36-8-6-18-6-26 0l-6 14z"/><path d="M14-40l-6 36" stroke="currentColor" stroke-width="5" fill="none"/>',
    estrella: '<path d="M0-56l13 40 42 1-34 25 13 40L0 25l-34 25 13-40-34-25 42-1z"/>',
    corona: '<path d="M-48 30l8-52 22 24 18-36 18 36 22-24 8 52z"/><rect x="-48" y="30" width="96" height="14"/>',
    cetro: '<rect x="-5" y="-30" width="10" height="92" rx="4"/><circle cx="0" cy="-42" r="16"/><rect x="-18" y="-20" width="36" height="7"/>',
    castor: '<ellipse cx="0" cy="18" rx="38" ry="28"/><circle cx="0" cy="-22" r="20"/><ellipse cx="0" cy="54" rx="28" ry="10"/>',
    monograma: '<text x="0" y="34" text-anchor="middle" font-family="Bodoni Moda, Georgia, serif" font-weight="900" font-size="104">P</text>'
  };
  function tenante(t, lado){
    var s = lado < 0 ? 'translate(400 0) scale(-1 1)' : '';
    var g = '';
    if (t === 'unicornios') g = '<path d="M290 330c4-60 14-110 34-140l-10-22 22 10 30-56-12 64c16 14 20 34 10 56-12-10-26-8-38 2l-6 86z" fill="#f4efe2" stroke="#d8b25c" stroke-width="3"/><path d="M346 122l-8 50" stroke="#d8b25c" stroke-width="5"/><path d="M300 200c14 4 26 16 30 30" stroke="#f2a9dc" stroke-width="6" fill="none"/>';
    else if (t === 'castores') g = '<ellipse cx="335" cy="270" rx="32" ry="48" fill="#a86b3c" stroke="#d8b25c" stroke-width="3"/><circle cx="338" cy="205" r="24" fill="#b97a48" stroke="#d8b25c" stroke-width="3"/><rect x="332" y="214" width="12" height="9" fill="#fff"/><ellipse cx="335" cy="324" rx="30" ry="10" fill="#6b4226"/>';
    else if (t === 'leones') g = '<path d="M300 330c0-50 10-90 30-112-12-10-14-30-2-42 14-14 36-10 44 6 8 18-2 34-16 40 8 30 6 70-6 108z" fill="#d8b25c" stroke="#8f6f2a" stroke-width="3"/><circle cx="350" cy="182" r="5" fill="#1b1150"/>';
    return g ? '<g transform="' + s + '">' + g + '</g>' : '';
  }

  function estado(){
    var f = uno('#pvl-bl-form');
    var e = { forma: DEF.forma, campo: DEF.campo, part: DEF.part, part2: DEF.part2, mueble: DEF.mueble, mueble2: DEF.mueble2, ten: DEF.ten, casa: '', lema: '' };
    if (!f) return e;
    ['forma', 'campo', 'part', 'part2', 'mueble', 'mueble2', 'ten'].forEach(function(k){
      var r = f.querySelector('input[name="pvl-bl-' + k + '"]:checked');
      if (r) e[k] = r.value;
    });
    var c = f.querySelector('#pvl-bl-casa'), l = f.querySelector('#pvl-bl-lema');
    e.casa = c ? c.value.trim().slice(0, 32) : '';
    e.lema = l ? l.value.trim().slice(0, 40) : '';
    return e;
  }

  function svg(e, conTexto){
    var l = lang();
    var forma = FORMAS[e.forma] || FORMAS.clasico;
    var m2 = ESMALTES[e.mueble2] || ESMALTES.oro;
    var lema = e.lema || (l === 'es' ? 'Por la gracia de Pavel' : 'By the grace of Pavel');
    var casa = e.casa ? (l === 'es' ? 'Casa de ' : 'House of ') + e.casa : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 ' + (conTexto ? 480 : 420) + '" role="img" aria-label="' + esc(casa || (l === 'es' ? 'Blasón' : 'Coat of arms')) + '">' +
      '<defs><linearGradient id="pvl-bl-iris" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#86e7ea"/><stop offset=".5" stop-color="#f2a9dc"/><stop offset="1" stop-color="#e9c874"/></linearGradient>' +
      '<clipPath id="pvl-bl-clip"><path d="' + forma + '"/></clipPath>' +
      '<radialGradient id="pvl-bl-luz" cx="40%" cy="30%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
      tenante(e.ten, 1) + tenante(e.ten, -1) +
      /* corona */
      '<g transform="translate(200 52)"><path d="M-46 14l8-34 20 18 18-30 18 30 20-18 8 34z" fill="#d8b25c" stroke="#8f6f2a" stroke-width="2"/><rect x="-46" y="12" width="92" height="9" fill="#d8b25c" stroke="#8f6f2a" stroke-width="2"/><circle cx="0" cy="-17" r="4" fill="#f2a9dc"/></g>' +
      '<g clip-path="url(#pvl-bl-clip)"><rect x="80" y="40" width="240" height="320" fill="' + (ESMALTES[e.campo] || ESMALTES.violeta) + '"/>' +
      particion(e.part, ESMALTES[e.part2] || ESMALTES.oro) +
      '<g transform="translate(200 ' + (e.forma === 'losange' ? 200 : 186) + ') scale(1.12)" fill="' + m2 + '" color="' + m2 + '" stroke="rgba(20,10,40,.55)" stroke-width="2.5" stroke-linejoin="round">' + (MUEBLES[e.mueble] || '') + '</g>' +
      '<rect x="80" y="40" width="240" height="320" fill="url(#pvl-bl-luz)"/></g>' +
      '<path d="' + forma + '" fill="none" stroke="#d8b25c" stroke-width="6"/>' +
      '<path d="' + forma + '" fill="none" stroke="#8f6f2a" stroke-width="1.5" transform="translate(200 200) scale(.93) translate(-200 -200)"/>' +
      /* cinta del lema */
      '<g transform="translate(0 362)"><path d="M70 10h260l-14 22 14 22H70l14-22z" fill="#f4efe2" stroke="#d8b25c" stroke-width="2.5"/>' +
      '<text x="200" y="38" text-anchor="middle" font-family="Bodoni Moda, Georgia, serif" font-style="italic" font-weight="700" font-size="' + (lema.length > 26 ? 13 : 16) + '" fill="#1b1150">' + esc(lema) + '</text></g>' +
      (conTexto && casa ? '<text x="200" y="460" text-anchor="middle" font-family="Bodoni Moda, Georgia, serif" font-weight="700" font-size="24" fill="#d8b25c">' + esc(casa) + '</text>' : '') +
      '</svg>';
  }

  /* La plantilla pierde el atributo checked al montarse: se marca el valor por defecto de cada grupo vacio. */
  function marcarDefecto(f){
    for (var k in DEF) {
      if (f.querySelector('input[name="pvl-bl-' + k + '"]:checked')) continue;
      var r = f.querySelector('input[name="pvl-bl-' + k + '"][value="' + DEF[k] + '"]');
      if (r) r.checked = true;
    }
  }
  function pintar(){
    var f0 = uno('#pvl-bl-form');
    if (f0) marcarDefecto(f0);
    var p = uno('#pvl-bl-prev');
    if (!p) return;
    var e = estado();
    var clave = JSON.stringify(e) + lang();
    if (p.getAttribute('data-k') === clave) return;
    p.innerHTML = svg(e, true);
    p.setAttribute('data-k', clave);
  }

  function aleatorio(){
    var f = uno('#pvl-bl-form');
    if (!f) return;
    ['forma', 'campo', 'part', 'part2', 'mueble', 'mueble2', 'ten'].forEach(function(k){
      var rs = f.querySelectorAll('input[name="pvl-bl-' + k + '"]');
      if (rs.length) rs[Math.floor(Math.random() * rs.length)].checked = true;
    });
    /* Que el mueble no se pierda en un campo del mismo esmalte. */
    var e = estado();
    if (e.mueble2 === e.campo) { var o = f.querySelector('input[name="pvl-bl-mueble2"][value="' + (e.campo === 'oro' ? 'plata' : 'oro') + '"]'); if (o) o.checked = true; }
    pintar();
  }

  function nombreArchivo(ext){
    var e = estado();
    var Lz = window.PavelLienzo;
    return (lang() === 'es' ? 'blason-' : 'crest-') + (Lz ? Lz.slug(e.casa || 'pavel') : 'pavel') + '.' + ext;
  }
  function bajarSVG(){
    var a = doc.createElement('a');
    a.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(estado(), true));
    a.download = nombreArchivo('svg');
    doc.body.appendChild(a); a.click(); a.remove();
  }
  function bajarPNG(){
    var Lz = window.PavelLienzo;
    if (!Lz) return;
    var e = estado(), l = lang();
    var img = new Image();
    img.onload = function(){
      Lz.conFuentes(function(){
        var w = 1000, h = 1250, c = Lz.nuevo(w, h), ctx = c.getContext('2d');
        Lz.marco(ctx, w, h);
        ctx.drawImage(img, 100, 110, 800, 840);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#d8b25c'; ctx.font = "600 20px 'IBM Plex Mono', monospace";
        ctx.fillText(l === 'es' ? 'ARMAS CONCEDIDAS POR EL REINO DE PAVEL' : 'ARMS GRANTED BY THE KINGDOM OF PAVEL', w / 2, 86);
        ctx.fillStyle = '#f7f2e6'; ctx.font = "700 54px 'Bodoni Moda', Georgia, serif";
        ctx.fillText(e.casa ? (l === 'es' ? 'Casa de ' : 'House of ') + e.casa : (l === 'es' ? 'Casa vasalla' : 'Vassal house'), w / 2, 1040);
        ctx.fillStyle = 'rgba(244,239,226,.6)'; ctx.font = "500 18px 'IBM Plex Mono', monospace";
        ctx.fillText((l === 'es' ? 'VASALLA DEL REINO · ' : 'VASSAL OF THE KINGDOM · ') + new Date().toLocaleDateString(l === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long' }).toUpperCase() + (l === 'es' ? ' · AÑO 0' : ' · YEAR 0'), w / 2, 1090);
        Lz.sello(ctx, w - 140, h - 140, 52);
        Lz.descargar(c, nombreArchivo('png'));
      });
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(e, false));
  }

  doc.addEventListener('change', function(e){ if (e.target && e.target.closest && e.target.closest('#pvl-bl-form')) pintar(); });
  doc.addEventListener('input', function(e){ if (e.target && e.target.closest && e.target.closest('#pvl-bl-form')) pintar(); });
  doc.addEventListener('submit', function(e){ if (e.target && e.target.id === 'pvl-bl-form') e.preventDefault(); });
  doc.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('[data-pvl-bl]');
    if (!t) return;
    e.preventDefault();
    var a = t.getAttribute('data-pvl-bl');
    if (a === 'azar') aleatorio(); else if (a === 'svg') bajarSVG(); else if (a === 'png') bajarPNG();
  });
  setInterval(pintar, 400);
  doc.addEventListener('pavel:langchange', pintar);
})();
