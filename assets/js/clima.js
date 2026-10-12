/* Servicio Meteorologico Nacional (pvl-clima-). Mismo candado de doble
   ejecucion que el resto de <helmet>. El pronostico sale de la fecha: un
   generador con semilla del dia, asi que cambia cada dia, es el mismo para
   todos ese dia y nunca, por decreto, es malo. Se pinta dentro de
   #pvl-clima-root (el montado, no la plantilla de <x-dc>) y se repinta solo
   cuando cambia el idioma o el dia. Nada se guarda ni se envia. */
(function(){
  if (window.__pvlClima) return;
  window.__pvlClima = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function raiz(){
    var els = doc.querySelectorAll('#pvl-clima-root');
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  function t(o){ return o[lang()] || o.en; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* mulberry32 con semilla del dia */
  function prng(seed){
    return function(){
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var r = Math.imul(seed ^ seed >>> 15, 1 | seed);
      r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
      return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
  }
  function semilla(d){ return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }

  var ESTADOS = [
    { k: 'glorioso', es: 'Glorioso', en: 'Glorious',
      d: { es: 'Sol pleno sobre el Reino. Se recomienda gafas: la grandeza refleja.', en: 'Full sun over the Kingdom. Sunglasses advised: greatness reflects.' } },
    { k: 'llovizna', es: 'Llovizna iridiscente', en: 'Iridescent drizzle',
      d: { es: 'Gotas de colores que no mojan, solo embellecen.', en: 'Coloured drops that do not wet, only embellish.' } },
    { k: 'castor', es: 'Vientos de castor', en: 'Beaver winds',
      d: { es: 'Rachas cálidas desde el Buc-ee’s del desierto, con aroma a pepitas.', en: 'Warm gusts from the desert Buc-ee’s, smelling of nuggets.' } },
    { k: 'adoracion', es: 'Adoración total', en: 'Total adoration',
      d: { es: 'Cielo despejado y aplausos dispersos durante todo el día.', en: 'Clear skies and scattered applause throughout the day.' } },
    { k: 'arcoiris', es: 'Arcoíris doble', en: 'Double rainbow',
      d: { es: 'Uno para el Soberano y otro, por cortesía, para el resto.', en: 'One for the Sovereign and, out of courtesy, one for everyone else.' } },
    { k: 'aurora', es: 'Aurora real', en: 'Royal aurora',
      d: { es: 'Luces violeta y oro sobre el Monte Non Plus Ultra.', en: 'Violet and gold lights over Mount Non Plus Ultra.' } }
  ];
  var REGIONES = [
    { es: 'Pavelópolis', en: 'Pavelópolis' },
    { es: 'Cordillera Non Plus Ultra', en: 'Non Plus Ultra Range' },
    { es: 'Lago Iridiscente', en: 'Lake Iridescent' },
    { es: 'Bosque Descartes', en: 'Descartes Forest' },
    { es: 'Desierto de los Rivales', en: 'Desert of Rivals' },
    { es: 'El Puerto', en: 'The Port' }
  ];
  var DIAS = { es: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
  var AVISOS = [
    { es: 'AVISO AMARILLO por niveles extremos de grandeza en toda la isla.', en: 'YELLOW WARNING for extreme levels of greatness across the island.' },
    { es: 'AVISO por tráfico denso de unicornios en la autopista del palacio.', en: 'ADVISORY for heavy unicorn traffic on the palace highway.' },
    { es: 'AVISO por ovaciones fuertes en la Plaza del Unicornio. Abríguese el ego.', en: 'ADVISORY for strong ovations in Unicorn Square. Wrap up your ego.' },
    { es: 'Sin avisos. El Reino está, como siempre, perfecto.', en: 'No warnings. The Kingdom is, as always, perfect.' }
  ];

  /* Iconos SVG en la paleta de la bandera. */
  function icono(k, size){
    var s = size || 56;
    var sol = '<circle cx="32" cy="30" r="12" fill="#e9c874"/><g stroke="#e9c874" stroke-width="3" stroke-linecap="round">' +
      [0, 45, 90, 135, 180, 225, 270, 315].map(function(a){ var r = a * Math.PI / 180; return '<line x1="' + (32 + Math.cos(r) * 17).toFixed(1) + '" y1="' + (30 + Math.sin(r) * 17).toFixed(1) + '" x2="' + (32 + Math.cos(r) * 23).toFixed(1) + '" y2="' + (30 + Math.sin(r) * 23).toFixed(1) + '"/>'; }).join('') + '</g>';
    var nube = function(x, y, c){ return '<g fill="' + (c || '#f4efe2') + '"><circle cx="' + (x - 9) + '" cy="' + y + '" r="8"/><circle cx="' + x + '" cy="' + (y - 5) + '" r="10"/><circle cx="' + (x + 10) + '" cy="' + y + '" r="8"/><rect x="' + (x - 17) + '" y="' + y + '" width="35" height="8" rx="4"/></g>'; };
    var g = '';
    if (k === 'glorioso') g = sol + '<path d="M26 30l4 4 8-9" fill="none" stroke="#1b1150" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
    else if (k === 'llovizna') g = nube(32, 26) + ['#86e7ea', '#f2a9dc', '#e9c874', '#b9a6ff'].map(function(c, i){ return '<line x1="' + (20 + i * 8) + '" y1="40" x2="' + (17 + i * 8) + '" y2="50" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>'; }).join('');
    else if (k === 'castor') g = '<g fill="none" stroke="#86e7ea" stroke-width="3" stroke-linecap="round"><path d="M8 22h30a6 6 0 1 0-6-6"/><path d="M8 32h42a6 6 0 1 1-6 6"/><path d="M8 42h22"/></g><ellipse cx="50" cy="20" rx="6" ry="4" fill="#c99a3f"/>';
    else if (k === 'adoracion') g = sol + '<g fill="#f2a9dc"><path d="M14 50c0-4 6-4 6 0 0 3-6 6-6 6s-6-3-6-6c0-4 6-4 6 0z" transform="translate(-2 -6)"/><path d="M14 50c0-4 6-4 6 0 0 3-6 6-6 6s-6-3-6-6c0-4 6-4 6 0z" transform="translate(38 -2)"/></g>';
    else if (k === 'arcoiris') g = ['#f2a9dc', '#e9c874', '#86e7ea', '#b9a6ff'].map(function(c, i){ return '<path d="M' + (8 + i * 5) + ' 46a' + (24 - i * 5) + ' ' + (24 - i * 5) + ' 0 0 1 ' + (48 - i * 10) + ' 0" fill="none" stroke="' + c + '" stroke-width="4"/>'; }).join('') + nube(14, 46) + nube(52, 46);
    else g = '<path d="M4 44c10-14 18-6 28-18s20-6 28-14" fill="none" stroke="#86e7ea" stroke-width="4" stroke-linecap="round" opacity=".9"/><path d="M4 52c12-12 20-4 30-14s18-4 26-10" fill="none" stroke="#f2a9dc" stroke-width="4" stroke-linecap="round" opacity=".8"/><path d="M32 6l2 5 5 .5-4 3 1.2 5L32 17l-4.2 2.5L29 14.5l-4-3 5-.5z" fill="#e9c874"/>';
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 64 64" aria-hidden="true">' + g + '</svg>';
  }

  function pronostico(fecha){
    var r = prng(semilla(fecha));
    function de(a){ return a[Math.floor(r() * a.length)]; }
    function entre(a, b){ return a + Math.floor(r() * (b - a + 1)); }
    var hoy = {
      estado: de(ESTADOS), max: entre(24, 31), min: entre(17, 22),
      grandeza: entre(86, 99), viento: entre(4, 19), aplausos: entre(40, 95),
      trafico: de([{ es: 'ligero', en: 'light' }, { es: 'moderado', en: 'moderate' }, { es: 'majestuoso', en: 'majestic' }]),
      uv: de([{ es: 'Iridiscente', en: 'Iridescent' }, { es: 'Áureo', en: 'Golden' }, { es: 'Real', en: 'Royal' }]),
      aviso: de(AVISOS)
    };
    var dias = [];
    for (var i = 1; i <= 5; i++) {
      var d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + i);
      dias.push({ fecha: d, estado: de(ESTADOS), max: entre(24, 31), min: entre(16, 22), grandeza: entre(85, 100) });
    }
    var regiones = REGIONES.map(function(n){ return { n: n, estado: de(ESTADOS), t: entre(18, 33) }; });
    return { hoy: hoy, dias: dias, regiones: regiones };
  }

  function boletin(fecha){
    return 'SMN-' + fecha.getFullYear() + '-' + String(Math.floor((fecha - new Date(fecha.getFullYear(), 0, 1)) / 864e5) + 1).padStart(3, '0');
  }

  function pintar(r){
    var l = lang();
    var hoyF = new Date();
    var p = pronostico(hoyF);
    var h = p.hoy;
    var fechaTxt = hoyF.toLocaleDateString(l === 'es' ? 'es-ES' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    var html = '' +
      '<div class="pvl-clima-aviso" role="note">' + esc(t(h.aviso)) + '</div>' +
      '<div class="pvl-clima-grid">' +
        '<div class="pvl-clima-hoy">' +
          '<div class="pvl-clima-kicker">' + esc(t({ es: 'BOLETÍN ', en: 'BULLETIN ' })) + boletin(hoyF) + ' · ' + esc(fechaTxt) + '</div>' +
          '<div class="pvl-clima-main">' + icono(h.estado.k, 96) +
            '<div><div class="pvl-clima-temp">' + h.max + '°<span>/' + h.min + '° G</span></div>' +
            '<div class="pvl-clima-estado">' + esc(t(h.estado)) + '</div></div></div>' +
          '<p class="pvl-clima-desc">' + esc(t(h.estado.d)) + '</p>' +
          '<dl class="pvl-clima-datos">' +
            '<div><dt>' + esc(t({ es: 'Probabilidad de grandeza', en: 'Chance of greatness' })) + '</dt><dd>' + h.grandeza + '%</dd></div>' +
            '<div><dt>' + esc(t({ es: 'Vientos de castor', en: 'Beaver winds' })) + '</dt><dd>' + h.viento + ' km/h</dd></div>' +
            '<div><dt>' + esc(t({ es: 'Aplausos dispersos', en: 'Scattered applause' })) + '</dt><dd>' + h.aplausos + '%</dd></div>' +
            '<div><dt>' + esc(t({ es: 'Tráfico de unicornios', en: 'Unicorn traffic' })) + '</dt><dd>' + esc(t(h.trafico)) + '</dd></div>' +
            '<div><dt>' + esc(t({ es: 'Índice UV', en: 'UV index' })) + '</dt><dd>' + esc(t(h.uv)) + '</dd></div>' +
            '<div><dt>' + esc(t({ es: 'Probabilidad de mal tiempo', en: 'Chance of bad weather' })) + '</dt><dd>0%</dd></div>' +
          '</dl>' +
        '</div>' +
        '<div class="pvl-clima-lado">' +
          '<div class="pvl-clima-kicker">' + esc(t({ es: 'PRÓXIMOS CINCO DÍAS', en: 'NEXT FIVE DAYS' })) + '</div>' +
          '<ol class="pvl-clima-dias">' + p.dias.map(function(d){
            return '<li><span class="pvl-clima-dia">' + DIAS[l][d.fecha.getDay()] + ' ' + d.fecha.getDate() + '</span>' + icono(d.estado.k, 40) +
              '<span class="pvl-clima-dn">' + esc(t(d.estado)) + '</span><span class="pvl-clima-dt">' + d.max + '° / ' + d.min + '°</span></li>';
          }).join('') + '</ol>' +
          '<div class="pvl-clima-kicker" style="margin-top:26px">' + esc(t({ es: 'POR REGIONES', en: 'BY REGION' })) + '</div>' +
          '<ul class="pvl-clima-regiones">' + p.regiones.map(function(g){
            return '<li>' + icono(g.estado.k, 28) + '<span>' + esc(t(g.n)) + '</span><b>' + g.t + '°</b></li>';
          }).join('') + '</ul>' +
          '<a class="pvl-clima-mapa" href="reino-de-pavel.dc.html#mapa">' + esc(t({ es: 'Ver el mapa del Reino →', en: 'See the map of the Kingdom →' })) + '</a>' +
        '</div>' +
      '</div>' +
      '<p class="pvl-clima-pie">' + esc(t({ es: '° G: grados Grandeza. El Servicio Meteorológico Nacional no pronostica mal tiempo porque no lo hay. Fuente: la ventana del palacio.', en: '° G: degrees of Greatness. The National Weather Service does not forecast bad weather because there is none. Source: the palace window.' })) + '</p>';
    r.innerHTML = html;
  }

  var hecho = '';
  function tick(){
    var r = raiz();
    if (!r) return;
    var clave = lang() + '|' + new Date().toDateString();
    if (r.getAttribute('data-pvl-clima') === clave && hecho === clave) return;
    pintar(r);
    r.setAttribute('data-pvl-clima', clave);
    hecho = clave;
  }
  setInterval(tick, 400);
  doc.addEventListener('pavel:langchange', tick);
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', tick); else tick();
})();
