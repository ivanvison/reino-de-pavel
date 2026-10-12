/* Hora Estandar de Pavel (pvl-hora-). Mismo candado de doble ejecucion que el
   resto de <helmet>. La Hora de Pavel es la del visitante adelantada un minuto:
   el Soberano siempre llega antes. La cuenta atras lee las fiestas de las
   fichas de #calendario (las montadas, no la plantilla de <x-dc>), asi que el
   calendario y la cuenta atras no pueden contradecirse. Nada se guarda. */
(function(){
  if (window.__pvlHora) return;
  window.__pvlHora = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function uno(sel){
    var els = doc.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  function t(o){ return o[lang()] || o.en; }
  function dos(n){ return (n < 10 ? '0' : '') + n; }

  var ADELANTO = 60 * 1000;
  var MESES = [
    { es: 'Grandeza', en: 'Greatness' }, { es: 'Unicornio', en: 'Unicorn' }, { es: 'Iridiscencia', en: 'Iridescence' },
    { es: 'Non Plus Ultra', en: 'Non Plus Ultra' }, { es: 'Castor', en: 'Beaver' }, { es: 'Corona', en: 'Crown' },
    { es: 'Himno', en: 'Anthem' }, { es: 'Cetro', en: 'Sceptre' }, { es: 'Oro', en: 'Gold' },
    { es: 'Aurora', en: 'Aurora' }, { es: 'Laurel', en: 'Laurel' }, { es: 'Vigilia', en: 'Vigil' }
  ];
  var DIAS = [
    { es: 'Día del Trono', en: 'Throneday' }, { es: 'Día del Unicornio', en: 'Unicornday' }, { es: 'Día del Cetro', en: 'Sceptreday' },
    { es: 'Día del Himno', en: 'Anthemday' }, { es: 'Día del Oro', en: 'Goldday' }, { es: 'Día del Castor', en: 'Beaverday' },
    { es: 'Día de la Corona', en: 'Crownday' }
  ];
  var HORAS = [
    [0, { es: 'Vigilia del Soberano', en: 'The Sovereign’s Vigil' }],
    [6, { es: 'Despertar Real', en: 'Royal Awakening' }],
    [9, { es: 'Audiencia de la Mañana', en: 'Morning Audience' }],
    [12, { es: 'Banquete del Mediodía', en: 'Noon Banquet' }],
    [15, { es: 'Siesta de Estado', en: 'State Siesta' }],
    [18, { es: 'Hora de la Adoración', en: 'Hour of Adoration' }],
    [21, { es: 'Nocturno Real', en: 'Royal Nocturne' }]
  ];
  var MES_EN = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };

  /* Lee las fiestas de las fichas del calendario: [{ m, d, es, en }] */
  function fiestas(){
    var grid = uno('#pvl-holiday-grid');
    if (!grid) return [];
    var out = [];
    var tiles = grid.querySelectorAll('.pvl-holiday-tile');
    for (var i = 0; i < tiles.length; i++) {
      var fecha = null, nombre = { es: '', en: '' };
      var spans = tiles[i].querySelectorAll('[data-lang="en"]');
      for (var j = 0; j < spans.length; j++) {
        var m = /^([A-Z]{3})\s*(\d+)$/.exec(spans[j].textContent.replace(/\s+/g, ' ').trim());
        if (m && MES_EN.hasOwnProperty(m[1])) { fecha = { m: MES_EN[m[1]], d: +m[2] }; break; }
      }
      var h3 = tiles[i].querySelector('h3');
      if (h3) {
        var es = h3.querySelector('[data-lang="es"]'), en = h3.querySelector('[data-lang="en"]');
        nombre = { es: es ? es.textContent : '', en: en ? en.textContent : '' };
      }
      if (fecha) out.push({ m: fecha.m, d: fecha.d, es: nombre.es, en: nombre.en });
    }
    return out;
  }

  /* La proxima fiesta desde `ahora`: { fecha, nombres[] } (dia 0 de enero = 31 de diciembre). */
  function proxima(ahora, lista){
    var hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    var mejor = null;
    for (var y = ahora.getFullYear(); y <= ahora.getFullYear() + 1; y++) {
      for (var i = 0; i < lista.length; i++) {
        var f = new Date(y, lista[i].m, lista[i].d);
        if (f < hoy) continue;
        if (!mejor || f < mejor.fecha) mejor = { fecha: f, nombres: [lista[i]] };
        else if (f.getTime() === mejor.fecha.getTime() && mejor.nombres.indexOf(lista[i]) === -1) mejor.nombres.push(lista[i]);
      }
    }
    return mejor;
  }

  function reloj(d){
    var h = d.getHours() % 12, m = d.getMinutes(), s = d.getSeconds();
    var ah = (h + m / 60) * 30, am = (m + s / 60) * 6, as = s * 6;
    var marcas = '';
    for (var i = 0; i < 12; i++) {
      var a = i * 30 * Math.PI / 180, r1 = i % 3 ? 84 : 78;
      marcas += '<line x1="' + (100 + Math.sin(a) * r1).toFixed(1) + '" y1="' + (100 - Math.cos(a) * r1).toFixed(1) + '" x2="' + (100 + Math.sin(a) * 90).toFixed(1) + '" y2="' + (100 - Math.cos(a) * 90).toFixed(1) + '" stroke="#e9c874" stroke-width="' + (i % 3 ? 2 : 4) + '"/>';
    }
    return '<svg viewBox="0 0 200 200" class="pvl-hora-svg" role="img" aria-label="' + dos(d.getHours()) + ':' + dos(m) + '">' +
      '<defs><radialGradient id="pvl-hora-g" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#2a1a66"/><stop offset="1" stop-color="#0d0725"/></radialGradient>' +
      '<linearGradient id="pvl-hora-i" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#86e7ea"/><stop offset=".5" stop-color="#f2a9dc"/><stop offset="1" stop-color="#e9c874"/></linearGradient></defs>' +
      '<circle cx="100" cy="100" r="96" fill="url(#pvl-hora-g)" stroke="url(#pvl-hora-i)" stroke-width="4"/>' + marcas +
      '<text x="100" y="62" text-anchor="middle" font-family="Bodoni Moda,serif" font-weight="700" font-size="22" fill="#e9c874">P</text>' +
      '<text x="100" y="146" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" letter-spacing="2" fill="rgba(244,239,226,.6)">PST</text>' +
      /* aguja de las horas: un cuerno de unicornio */
      '<g transform="rotate(' + ah.toFixed(2) + ' 100 100)"><path d="M100 46 L106 100 L94 100 Z" fill="url(#pvl-hora-i)"/><path d="M96 88l8-3M97 76l7-3M98 64l5-2" stroke="#0d0725" stroke-width="1.2"/></g>' +
      '<g transform="rotate(' + am.toFixed(2) + ' 100 100)"><rect x="98" y="24" width="4" height="78" rx="2" fill="#f4efe2"/></g>' +
      '<g transform="rotate(' + as.toFixed(2) + ' 100 100)"><line x1="100" y1="112" x2="100" y2="18" stroke="#f2a9dc" stroke-width="1.4"/></g>' +
      '<circle cx="100" cy="100" r="6" fill="#e9c874"/></svg>';
  }

  function pintar(){
    var r = uno('#pvl-hora-root');
    if (!r) return;
    var l = lang();
    var ahora = new Date(Date.now() + ADELANTO);
    var hora = HORAS[0][1];
    for (var i = 0; i < HORAS.length; i++) if (ahora.getHours() >= HORAS[i][0]) hora = HORAS[i][1];
    var lista = fiestas();
    var p = proxima(ahora, lista);
    var cuenta = '', titulo = '';
    if (p) {
      var hoy0 = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      var nombres = p.nombres.map(function(n){ return n[l] || n.en; }).join(l === 'es' ? ' y ' : ' and ');
      if (p.fecha.getTime() === hoy0.getTime()) {
        titulo = t({ es: '¡Hoy es fiesta nacional!', en: 'Today is a national holiday!' });
        cuenta = '<div class="pvl-hora-hoy">' + nombres + '</div>';
      } else {
        var ms = p.fecha - ahora, dd = Math.floor(ms / 864e5), hh = Math.floor(ms / 36e5) % 24, mm = Math.floor(ms / 6e4) % 60, ss = Math.floor(ms / 1e3) % 60;
        titulo = t({ es: 'Próxima fiesta nacional', en: 'Next national holiday' }) + ': ' + nombres;
        cuenta = '<div class="pvl-hora-cuenta">' +
          [[dd, { es: 'días', en: 'days' }], [hh, { es: 'horas', en: 'hours' }], [mm, { es: 'min', en: 'min' }], [ss, { es: 'seg', en: 'sec' }]].map(function(c){
            return '<div><b>' + (c[1].es === 'días' ? c[0] : dos(c[0])) + '</b><span>' + t(c[1]) + '</span></div>';
          }).join('') + '</div>' +
          '<div class="pvl-hora-fecha">' + p.fecha.toLocaleDateString(l === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '</div>';
      }
    }
    var pav = DIAS[ahora.getDay()][l] + ', ' + ahora.getDate() + ' ' + (l === 'es' ? 'de ' : '') + MESES[ahora.getMonth()][l] + (l === 'es' ? ', año 0' : ', Year 0');
    r.querySelector('.pvl-hora-reloj').innerHTML = reloj(ahora);
    r.querySelector('.pvl-hora-dig').textContent = dos(ahora.getHours()) + ':' + dos(ahora.getMinutes()) + ':' + dos(ahora.getSeconds());
    r.querySelector('.pvl-hora-nombre').textContent = hora[l] || hora.en;
    r.querySelector('.pvl-hora-pav').textContent = pav;
    r.querySelector('.pvl-hora-greg').textContent = t({ es: 'Calendario plebeyo: ', en: 'Commoner calendar: ' }) + ahora.toLocaleDateString(l === 'es' ? 'es-ES' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    r.querySelector('.pvl-hora-titulo').textContent = titulo || t({ es: 'Consultando el calendario…', en: 'Consulting the calendar…' });
    r.querySelector('.pvl-hora-cuenta-box').innerHTML = cuenta;
    var meses = r.querySelector('.pvl-hora-meses');
    if (meses && meses.getAttribute('data-l') !== l + ahora.getMonth()) {
      meses.innerHTML = MESES.map(function(m, i){
        return '<li' + (i === ahora.getMonth() ? ' aria-current="date"' : '') + '><span>' + dos(i + 1) + '</span>' + (m[l] || m.en) + '</li>';
      }).join('');
      meses.setAttribute('data-l', l + ahora.getMonth());
    }
  }
  setInterval(pintar, 1000);
  doc.addEventListener('pavel:langchange', pintar);
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', pintar); else pintar();
})();
