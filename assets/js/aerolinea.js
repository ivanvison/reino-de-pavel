/* Pavel Airlines y el Aeropuerto Internacional Non Plus Ultra (pvl-air-).
   Mismo candado de doble ejecucion que el resto de <helmet>.
   - Reserva: origen libre, destino siempre PVL; tarifa en Grandezas segun la
     cabina; emite una tarjeta de embarque que se descarga como PNG
     (window.PavelLienzo).
   - Panel de salidas y llegadas a paletas: sembrado con la hora, se renueva
     cada pocos segundos; todo "A TIEMPO" o "ADELANTADO POR DECRETO". Con
     prefers-reduced-motion las paletas cambian sin girar.
   - UnicornMiles: el nivel del peregrino sale de su nombre (cookie pavelense).
   Nada sale del navegador. */
(function(){
  if (window.__pvlAerolinea) return;
  window.__pvlAerolinea = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function uno(sel){
    var els = doc.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  function t(o){ return o[lang()] || o.en; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function peregrino(){
    var m = doc.cookie.match(/(?:^|; )pavelense=([^;]*)/);
    if (m) { try { return decodeURIComponent(m[1]).trim(); } catch (e) { return String(m[1] || '').trim(); } }
    try { return (localStorage.getItem('pavelense') || '').trim(); } catch (e) { return ''; }
  }
  function hash(s){ var h = 0x811c9dc5; s = String(s).toLowerCase(); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h; }
  var quieto = false;
  try { quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------- Reserva ---------- */
  var CABINAS = {
    economica: { es: 'Económica', en: 'Economy', k: 1, cl: 'Y' },
    grandeza: { es: 'Grandeza', en: 'Greatness', k: 3, cl: 'G' },
    primera: { es: 'Primera entre Ninguna', en: 'First-Among-None', k: 9, cl: 'F' },
    suite: { es: 'Suite Real del Unicornio', en: 'Royal Unicorn Suite', k: 40, cl: 'R' }
  };
  var reserva = null;
  function emitir(f){
    var nombre = (f.querySelector('#pvl-air-nombre').value || '').replace(/\s+/g, ' ').trim().slice(0, 30);
    var origen = (f.querySelector('#pvl-air-origen').value || '').replace(/\s+/g, ' ').trim().slice(0, 30);
    if (!nombre) { f.querySelector('#pvl-air-nombre').focus(); return; }
    if (!origen) { f.querySelector('#pvl-air-origen').focus(); return; }
    var cab = f.querySelector('#pvl-air-cabina').value; if (!CABINAS[cab]) cab = 'economica';
    var fecha = f.querySelector('#pvl-air-fecha').value;
    var h = hash(nombre + origen);
    var dist = 800 + h % 9000;
    reserva = {
      nombre: nombre, origen: origen, cab: cab, fecha: fecha ? new Date(fecha + 'T12:00:00') : new Date(),
      vuelo: 'PV ' + (100 + h % 900), puerta: '∞', asiento: '1A', grupo: { es: 'Adoradores', en: 'Adorers' },
      tarifa: Math.round(dist * CABINAS[cab].k * 1.7), loc: (h.toString(36).toUpperCase() + 'PAVEL').slice(0, 6),
      cod: origen.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X'),
      millas: dist
    };
    pintarReserva();
  }
  function fmtFecha(d){ return d.toLocaleDateString(lang() === 'es' ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(); }
  function pintarReserva(){
    var out = uno('#pvl-air-out');
    if (!out) return;
    if (!reserva) { out.hidden = true; return; }
    var r = reserva, l = lang();
    out.hidden = false;
    out.innerHTML =
      '<div class="pvl-air-tarifa"><span>' + esc(t({ es: 'Tarifa', en: 'Fare' })) + '</span><b>' + r.tarifa.toLocaleString(l === 'es' ? 'es-ES' : 'en-US') + ' G</b><small>' + esc(t({ es: 'tasas, sonrisas y aplausos incluidos', en: 'taxes, smiles and applause included' })) + '</small></div>' +
      '<div class="pvl-air-bp" role="group" aria-label="' + esc(t({ es: 'Tarjeta de embarque', en: 'Boarding pass' })) + '">' +
        '<div class="pvl-air-bp-main">' +
          '<div class="pvl-air-bp-top"><b>PAVEL AIRLINES</b><span>' + esc(t({ es: 'TARJETA DE EMBARQUE', en: 'BOARDING PASS' })) + '</span></div>' +
          '<div class="pvl-air-bp-ruta"><div><small>' + esc(t({ es: 'DE', en: 'FROM' })) + '</small><b>' + esc(r.cod) + '</b><span>' + esc(r.origen.toUpperCase()) + '</span></div><div class="pvl-air-bp-avion">✈</div><div><small>' + esc(t({ es: 'A', en: 'TO' })) + '</small><b>PVL</b><span>NON PLUS ULTRA INTL</span></div></div>' +
          '<dl class="pvl-air-bp-datos">' +
            '<div><dt>' + esc(t({ es: 'PASAJERO', en: 'PASSENGER' })) + '</dt><dd>' + esc(r.nombre.toUpperCase()) + '</dd></div>' +
            '<div><dt>' + esc(t({ es: 'VUELO', en: 'FLIGHT' })) + '</dt><dd>' + r.vuelo + '</dd></div>' +
            '<div><dt>' + esc(t({ es: 'FECHA', en: 'DATE' })) + '</dt><dd>' + fmtFecha(r.fecha) + '</dd></div>' +
            '<div><dt>' + esc(t({ es: 'CABINA', en: 'CABIN' })) + '</dt><dd>' + esc(t(CABINAS[r.cab]).toUpperCase()) + '</dd></div>' +
            '<div><dt>' + esc(t({ es: 'PUERTA', en: 'GATE' })) + '</dt><dd>' + r.puerta + '</dd></div>' +
            '<div><dt>' + esc(t({ es: 'ASIENTO', en: 'SEAT' })) + '</dt><dd>' + r.asiento + '</dd></div>' +
            '<div><dt>' + esc(t({ es: 'GRUPO', en: 'GROUP' })) + '</dt><dd>' + esc(t(r.grupo).toUpperCase()) + '</dd></div>' +
            '<div><dt>' + esc(t({ es: 'LOCALIZADOR', en: 'BOOKING REF' })) + '</dt><dd>' + r.loc + '</dd></div>' +
          '</dl>' +
          '<div class="pvl-air-barras" aria-hidden="true">' + barras(r.loc + r.vuelo) + '</div>' +
        '</div>' +
        '<div class="pvl-air-bp-talon"><small>' + esc(t({ es: 'VUELO', en: 'FLIGHT' })) + '</small><b>' + r.vuelo + '</b><small>' + esc(t({ es: 'ASIENTO', en: 'SEAT' })) + '</small><b>1A</b><small>' + esc(t({ es: 'PUERTA', en: 'GATE' })) + '</small><b>∞</b></div>' +
      '</div>' +
      '<p class="pvl-air-ok" role="status">' + esc(t({ es: 'Reserva confirmada. Todos los asientos son el 1A; el embarque es siempre por la puerta ∞. Ha ganado ', en: 'Booking confirmed. Every seat is 1A; boarding is always at gate ∞. You have earned ' })) + r.millas.toLocaleString() + ' UnicornMiles.</p>' +
      '<button type="button" id="pvl-air-descargar" class="pvl-air-btn">' + esc(t({ es: 'Descargar la tarjeta de embarque (PNG)', en: 'Download the boarding pass (PNG)' })) + '</button>';
    out.setAttribute('data-l', l);
  }
  function barras(s){
    var h = hash(s), out = '';
    for (var i = 0; i < 64; i++) { h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0; out += '<i style="width:' + (1 + h % 4) + 'px"></i>'; }
    return out;
  }
  function dibujarPase(){
    var Lz = window.PavelLienzo, r = reserva, l = lang();
    var w = 1400, h = 560, c = Lz.nuevo(w, h), x = c.getContext('2d');
    x.fillStyle = '#fbf7ec'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#1b1150'; x.fillRect(0, 0, w, 96);
    var g = x.createLinearGradient(0, 96, w, 96); g.addColorStop(0, '#86e7ea'); g.addColorStop(.5, '#f2a9dc'); g.addColorStop(1, '#e9c874');
    x.fillStyle = g; x.fillRect(0, 96, w, 8);
    x.fillStyle = '#e9c874'; x.font = "900 italic 40px 'Bodoni Moda', Georgia, serif"; x.textAlign = 'left'; x.fillText('Pavel Airlines', 40, 62);
    x.fillStyle = '#f4efe2'; x.font = "600 18px 'IBM Plex Mono', monospace"; x.textAlign = 'right'; x.fillText(l === 'es' ? 'TARJETA DE EMBARQUE · ' + t(CABINAS[r.cab]).toUpperCase() : 'BOARDING PASS · ' + t(CABINAS[r.cab]).toUpperCase(), 1000, 60);
    x.strokeStyle = '#c9b78f'; x.setLineDash([10, 8]); x.lineWidth = 2; x.beginPath(); x.moveTo(1040, 0); x.lineTo(1040, h); x.stroke(); x.setLineDash([]);
    x.textAlign = 'left';
    x.fillStyle = 'rgba(32,26,51,.55)'; x.font = "500 16px 'IBM Plex Mono', monospace"; x.fillText(l === 'es' ? 'DE' : 'FROM', 40, 160); x.fillText(l === 'es' ? 'A' : 'TO', 560, 160);
    x.fillStyle = '#1b1150'; x.font = "700 92px 'IBM Plex Mono', monospace"; x.fillText(r.cod, 36, 250); x.fillText('PVL', 556, 250);
    x.fillStyle = '#5b2a86'; x.font = "700 64px 'IBM Plex Sans', sans-serif"; x.fillText('✈', 360, 240);
    x.fillStyle = 'rgba(32,26,51,.7)'; x.font = "500 18px 'IBM Plex Mono', monospace"; x.fillText(r.origen.toUpperCase().slice(0, 24), 40, 282); x.fillText('NON PLUS ULTRA INTL', 560, 282);
    var campos = [[l === 'es' ? 'PASAJERO' : 'PASSENGER', r.nombre.toUpperCase()], [l === 'es' ? 'VUELO' : 'FLIGHT', r.vuelo], [l === 'es' ? 'FECHA' : 'DATE', fmtFecha(r.fecha)], [l === 'es' ? 'PUERTA' : 'GATE', '∞'], [l === 'es' ? 'ASIENTO' : 'SEAT', '1A'], [l === 'es' ? 'GRUPO' : 'GROUP', t(r.grupo).toUpperCase()]];
    for (var i = 0; i < campos.length; i++) {
      var cx = 40 + (i % 3) * 330, cy = 340 + Math.floor(i / 3) * 80;
      x.fillStyle = 'rgba(32,26,51,.5)'; x.font = "500 14px 'IBM Plex Mono', monospace"; x.fillText(campos[i][0], cx, cy);
      x.fillStyle = '#201a33'; x.font = "700 26px 'IBM Plex Mono', monospace"; var v = campos[i][1]; while (x.measureText(v).width > 300 && v.length > 3) v = v.slice(0, -2) + '…'; x.fillText(v, cx, cy + 32);
    }
    /* codigo de barras */
    var hh = hash(r.loc + r.vuelo), bx = 40;
    x.fillStyle = '#201a33';
    while (bx < 980) { hh = Math.imul(hh ^ (hh >>> 13), 0x5bd1e995) >>> 0; var bw = 2 + hh % 5; x.fillRect(bx, 494, bw, 46); bx += bw + 2 + (hh >> 5) % 4; }
    /* talon */
    x.fillStyle = '#1b1150'; x.font = "700 22px 'IBM Plex Mono', monospace";
    [[l === 'es' ? 'VUELO' : 'FLIGHT', r.vuelo], [l === 'es' ? 'ASIENTO' : 'SEAT', '1A'], [l === 'es' ? 'PUERTA' : 'GATE', '∞'], ['PNR', r.loc]].forEach(function(p, k){
      x.fillStyle = 'rgba(32,26,51,.5)'; x.font = "500 14px 'IBM Plex Mono', monospace"; x.fillText(p[0], 1080, 170 + k * 90);
      x.fillStyle = '#1b1150'; x.font = "700 34px 'IBM Plex Mono', monospace"; x.fillText(p[1], 1080, 208 + k * 90);
    });
    Lz.sello(x, 1300, 470, 44);
    return c;
  }

  /* ---------- Panel de vuelos a paletas ---------- */
  var DESTINOS = [
    { es: 'BUC-EE’S INTERNACIONAL', en: 'BUC-EE’S INTERNATIONAL' }, { es: 'MONTE NON PLUS ULTRA', en: 'MOUNT NON PLUS ULTRA' },
    { es: 'EL PUERTO', en: 'THE PORT' }, { es: 'LAGO IRIDISCENTE', en: 'LAKE IRIDESCENT' },
    { es: 'PAVELÓPOLIS CENTRO', en: 'PAVELÓPOLIS CENTRAL' }, { es: 'DESIERTO DE LOS RIVALES', en: 'DESERT OF RIVALS' },
    { es: 'BOSQUE DESCARTES', en: 'DESCARTES FOREST' }, { es: 'MADRID', en: 'MADRID' }, { es: 'HOUSTON', en: 'HOUSTON' },
    { es: 'CIUDAD DE MÉXICO', en: 'MEXICO CITY' }, { es: 'TOKIO', en: 'TOKYO' }, { es: 'LA LUNA (RIVAL)', en: 'THE MOON (RIVAL)' }
  ];
  var ESTADOS = [
    { es: 'A TIEMPO', en: 'ON TIME' }, { es: 'A TIEMPO', en: 'ON TIME' }, { es: 'ADELANTADO · DECRETO', en: 'EARLY · BY DECREE' },
    { es: 'EMBARCANDO', en: 'BOARDING' }, { es: 'A TIEMPO', en: 'ON TIME' }, { es: 'ATERRIZÓ CON APLAUSOS', en: 'LANDED · APPLAUSE' }
  ];
  function fila(i, base){
    var h = hash('v' + (base + i));
    var hr = new Date(Date.now() + (i * 13 + 5) * 60000);
    return {
      hora: String(hr.getHours()).padStart(2, '0') + ':' + String(Math.floor(hr.getMinutes() / 5) * 5).padStart(2, '0'),
      vuelo: 'PV' + (100 + h % 900), dest: DESTINOS[h % DESTINOS.length], puerta: h % 7 === 0 ? '∞' : String.fromCharCode(65 + h % 6) + (1 + h % 20),
      est: ESTADOS[(h >> 3) % ESTADOS.length]
    };
  }
  function paletas(txt, n){
    txt = String(txt).toUpperCase(); var s = '';
    for (var i = 0; i < n; i++) s += '<span class="pvl-air-p">' + esc(txt.charAt(i) || ' ') + '</span>';
    return s;
  }
  var tick = 0;
  function pintarPanel(forzar){
    var tb = uno('#pvl-air-panel tbody');
    if (!tb) return;
    var l = lang(), base = Math.floor(Date.now() / 30000);
    var clave = l + base;
    if (!forzar && tb.getAttribute('data-k') === clave) return;
    var nuevas = [];
    for (var i = 0; i < 8; i++) nuevas.push(fila(i, base));
    var filas = tb.querySelectorAll('tr');
    if (filas.length !== 8) {
      tb.innerHTML = nuevas.map(function(f){
        return '<tr><td>' + paletas(f.hora, 5) + '</td><td>' + paletas(f.vuelo, 5) + '</td><td>' + paletas(t(f.dest), 22) + '</td><td>' + paletas(f.puerta, 3) + '</td><td class="pvl-air-est">' + paletas(t(f.est), 20) + '</td></tr>';
      }).join('');
    } else {
      nuevas.forEach(function(f, i){
        var tds = filas[i].children, vals = [[f.hora, 5], [f.vuelo, 5], [t(f.dest), 22], [f.puerta, 3], [t(f.est), 20]];
        vals.forEach(function(v, k){
          var ps = tds[k].querySelectorAll('.pvl-air-p'), txt = String(v[0]).toUpperCase();
          for (var j = 0; j < ps.length; j++) {
            var ch = txt.charAt(j) || ' ';
            if (ps[j].textContent !== ch) {
              ps[j].textContent = ch;
              if (!quieto) { ps[j].classList.remove('pvl-air-gira'); void ps[j].offsetWidth; ps[j].classList.add('pvl-air-gira'); }
            }
          }
        });
      });
    }
    tb.setAttribute('data-k', clave);
    var rel = uno('#pvl-air-reloj');
    if (rel) rel.textContent = new Date().toLocaleTimeString(l === 'es' ? 'es-ES' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  /* ---------- UnicornMiles ---------- */
  var NIVELES = [
    { es: 'Peregrino', en: 'Pilgrim', m: 0 }, { es: 'Ciudadano', en: 'Citizen', m: 25000 },
    { es: 'Ministro', en: 'Minister', m: 250000 }, { es: 'Casi Soberano', en: 'Sovereign-Adjacent', m: 2500000 }
  ];
  function pintarMillas(){
    var box = uno('#pvl-air-millas');
    if (!box) return;
    var n = peregrino(), l = lang(), clave = l + n;
    if (box.getAttribute('data-k') === clave) return;
    var millas = n ? 1000 + hash(n) % 300000 : 0;
    var nivel = NIVELES[0]; NIVELES.forEach(function(v){ if (millas >= v.m) nivel = v; });
    var sig = NIVELES[NIVELES.indexOf(nivel) + 1];
    box.innerHTML = '<div class="pvl-air-socio"><small>CLUB NON PLUS ULTRA</small><b>' + esc(n || t({ es: 'Socio anónimo', en: 'Anonymous member' })) + '</b><span>' + esc(t(nivel)).toUpperCase() + '</span></div>' +
      '<div class="pvl-air-millas-n"><b>' + millas.toLocaleString(l === 'es' ? 'es-ES' : 'en-US') + '</b> UnicornMiles</div>' +
      (sig ? '<div class="pvl-air-barra"><i style="width:' + Math.min(100, millas / sig.m * 100).toFixed(1) + '%"></i></div><p>' + esc(t({ es: 'Le faltan ', en: 'You need ' })) + (sig.m - millas).toLocaleString(l === 'es' ? 'es-ES' : 'en-US') + esc(t({ es: ' millas para ', en: ' more miles for ' })) + esc(t(sig)) + '. ' + esc(t({ es: 'El nivel Soberano no existe: ya está ocupado.', en: 'There is no Sovereign tier: it is already taken.' })) + '</p>' : '<p>' + esc(t({ es: 'Ha alcanzado el nivel máximo al que puede aspirar un mortal.', en: 'You have reached the highest tier a mortal may aspire to.' })) + '</p>') +
      (n ? '' : '<p class="pvl-air-nota">' + esc(t({ es: 'Regístrese como peregrino en la portada para acumular millas a su nombre.', en: 'Register as a pilgrim on the home page to earn miles in your name.' })) + '</p>');
    box.setAttribute('data-k', clave);
  }

  /* ---------- eventos ---------- */
  doc.addEventListener('submit', function(e){
    if (e.target && e.target.id === 'pvl-air-form') { e.preventDefault(); emitir(e.target); }
  });
  doc.addEventListener('click', function(e){
    if (!(e.target.closest && e.target.closest('#pvl-air-descargar'))) return;
    if (!reserva || !window.PavelLienzo) return;
    window.PavelLienzo.conFuentes(function(){
      window.PavelLienzo.descargar(dibujarPase(), (lang() === 'es' ? 'tarjeta-embarque-' : 'boarding-pass-') + window.PavelLienzo.slug(reserva.nombre) + '.png');
    });
  });
  setInterval(function(){
    var f = uno('#pvl-air-form');
    if (f && !f.getAttribute('data-pvl-rellenado')) {
      f.setAttribute('data-pvl-rellenado', '1');
      var n = f.querySelector('#pvl-air-nombre'); if (n && !n.value) n.value = peregrino();
      var d = f.querySelector('#pvl-air-fecha'); if (d && !d.value) { var hoy = new Date(); d.value = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0'); }
    }
    var sel = uno('#pvl-air-cabina');
    if (sel && sel.getAttribute('data-l') !== lang()) {
      for (var i = 0; i < sel.options.length; i++) { var c = CABINAS[sel.options[i].value]; if (c) sel.options[i].textContent = t(c); }
      sel.setAttribute('data-l', lang());
    }
    var out = uno('#pvl-air-out');
    if (out && reserva && (out.hidden || out.getAttribute('data-l') !== lang())) pintarReserva();
    var tb = uno('#pvl-air-panel tbody');
    pintarPanel(tb && tb.getAttribute('data-k') && tb.getAttribute('data-k').slice(0, 2) !== lang());
    pintarMillas();
  }, 500);
})();
