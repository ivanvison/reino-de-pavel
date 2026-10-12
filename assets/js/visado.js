/* Ventanilla de visados (pvl-vis-). Mismo candado de doble ejecucion que el
   resto de <helmet>. El visitante solicita la entrada; el Reino siempre la
   concede: se pinta un visado con su nombre, la fecha de entrada, un numero de
   decreto y una zona MRZ con digitos de control de verdad (7-3-1, ICAO 9303),
   cae el sello con un golpe y se puede descargar como PNG (window.PavelLienzo).
   Nada se guarda ni se envia. */
(function(){
  if (window.__pvlVisado) return;
  window.__pvlVisado = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function uno(sel){
    var els = doc.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  function t(o){ return o[lang()] || o.en; }
  function peregrino(){
    var m = doc.cookie.match(/(?:^|; )pavelense=([^;]*)/);
    if (m) { try { return decodeURIComponent(m[1]).trim(); } catch (e) { return String(m[1] || '').trim(); } }
    try { return (localStorage.getItem('pavelense') || '').trim(); } catch (e) { return ''; }
  }
  var quieto = false;
  try { quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var MOTIVOS = {
    peregrinacion: { es: 'Peregrinación', en: 'Pilgrimage' },
    adoracion: { es: 'Adoración', en: 'Adoration' },
    tributo: { es: 'Tributo', en: 'Tribute' },
    unicornio: { es: 'Acompañar a un unicornio', en: 'Accompanying a unicorn' },
    bucees: { es: 'Visitar el Buc-ee’s del desierto', en: 'Visiting the desert Buc-ee’s' }
  };

  /* MRZ: letras A-Z, digitos y '<'. */
  function mrzTexto(s){
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim().replace(/\s+/g, '<');
  }
  function digito(s){
    var pesos = [7, 3, 1], suma = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i), v = c === '<' ? 0 : /\d/.test(c) ? +c : c.charCodeAt(0) - 55;
      suma += v * pesos[i % 3];
    }
    return String(suma % 10);
  }
  function relleno(s, n){ s = s.slice(0, n); while (s.length < n) s += '<'; return s; }
  function aammdd(d){ return String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); }

  var visado = null;
  function emitir(nombre, motivo){
    var hoy = new Date();
    var num = 'PV' + String(Math.floor(Math.random() * 1e7)).padStart(7, '0');
    var partes = mrzTexto(nombre).split('<');
    var ap = partes.length > 1 ? partes.slice(1).join('<') : partes[0];
    var no = partes.length > 1 ? partes[0] : '';
    var l1 = relleno('V<PVL' + ap + '<<' + no, 44);
    var nac = '999999', cad = '999999';
    /* MRV-A: n.º + control, nacionalidad, nacimiento + control, sexo, caducidad + control, opcional */
    var l2 = relleno(num + digito(num) + 'PVL' + nac + digito(nac) + '<' + cad + digito(cad) + aammdd(hoy), 44);
    visado = {
      nombre: nombre, motivo: motivo, num: num,
      decreto: String(Math.floor(Math.random() * 900) + 100),
      fecha: hoy, mrz: [l1, l2]
    };
  }

  function fecha(d){ return d.toLocaleDateString(lang() === 'es' ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(); }
  function campo(et, val){ return '<div><dt>' + et + '</dt><dd>' + val + '</dd></div>'; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function pintar(golpe){
    var out = uno('#pvl-vis-out');
    if (!out) return;
    if (!visado) { out.hidden = true; return; }
    var v = visado;
    out.hidden = false;
    out.innerHTML = '<div class="pvl-vis-card">' +
      '<div class="pvl-vis-top"><span>' + esc(t({ es: 'IMPERIO DEL REINO DE PAVEL', en: 'EMPIRE OF THE KINGDOM OF PAVEL' })) + '</span><b>' + esc(t({ es: 'VISADO DE ENTRADA', en: 'ENTRY VISA' })) + '</b><span>N.º ' + v.num + '</span></div>' +
      '<dl class="pvl-vis-campos">' +
        campo(esc(t({ es: 'TITULAR', en: 'HOLDER' })), esc(v.nombre.toUpperCase())) +
        campo(esc(t({ es: 'MOTIVO', en: 'PURPOSE' })), esc(t(MOTIVOS[v.motivo]).toUpperCase())) +
        campo(esc(t({ es: 'ENTRADA', en: 'ENTRY' })), fecha(v.fecha)) +
        campo(esc(t({ es: 'VÁLIDO HASTA', en: 'VALID UNTIL' })), esc(t({ es: 'SIEMPRE', en: 'FOREVER' }))) +
        campo(esc(t({ es: 'ENTRADAS', en: 'ENTRIES' })), '∞') +
        campo(esc(t({ es: 'DECRETO', en: 'DECREE' })), 'N.º ' + v.decreto) +
      '</dl>' +
      '<div class="pvl-vis-mrz">' + esc(v.mrz[0]) + '<br>' + esc(v.mrz[1]) + '</div>' +
      '<div class="pvl-vis-sello' + (golpe && !quieto ? ' pvl-vis-golpe' : '') + '" aria-hidden="true"><div><small>' + esc(t({ es: 'MINISTERIO DE LA GRANDEZA', en: 'MINISTRY OF GREATNESS' })) + '</small><b>' + esc(t({ es: 'APROBADO', en: 'APPROVED' })) + '</b><small>' + fecha(v.fecha) + '</small></div></div>' +
      '</div>' +
      '<p class="pvl-vis-ok" role="status">' + esc(t({ es: 'Solicitud aprobada en 0,0 segundos. En Pavelandia, todas lo son.', en: 'Application approved in 0.0 seconds. In Pavelandia, they all are.' })) + '</p>' +
      '<button type="button" id="pvl-vis-descargar" class="pvl-vis-btn">' + esc(t({ es: 'Descargar el visado (PNG)', en: 'Download the visa (PNG)' })) + '</button>';
    out.setAttribute('data-l', lang());
  }

  function dibujar(){
    var Lz = window.PavelLienzo, v = visado, l = lang();
    var w = 1200, h = 780, c = Lz.nuevo(w, h), ctx = c.getContext('2d');
    ctx.fillStyle = '#f6f1e3'; ctx.fillRect(0, 0, w, h);
    /* guilloche */
    ctx.strokeStyle = 'rgba(96,74,166,.16)'; ctx.lineWidth = 1;
    for (var r = 20; r < 900; r += 14) { ctx.beginPath(); ctx.arc(260, 560, r, 0, Math.PI * 2); ctx.stroke(); }
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(242,169,220,.22)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(134,231,234,.2)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#d8b25c'; ctx.lineWidth = 6; ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = '#6b4f16'; ctx.font = "600 18px 'IBM Plex Mono', monospace"; ctx.textAlign = 'left';
    ctx.fillText(l === 'es' ? 'IMPERIO DEL REINO DE PAVEL' : 'EMPIRE OF THE KINGDOM OF PAVEL', 60, 80);
    ctx.fillStyle = '#201a33'; ctx.font = "700 44px 'Bodoni Moda', Georgia, serif";
    ctx.fillText(l === 'es' ? 'Visado de entrada' : 'Entry visa', 60, 132);
    ctx.textAlign = 'right'; ctx.font = "500 18px 'IBM Plex Mono', monospace"; ctx.fillStyle = 'rgba(32,26,51,.7)';
    ctx.fillText('N.º ' + v.num, w - 60, 80);
    ctx.fillText((l === 'es' ? 'TIPO ' : 'TYPE ') + 'C · PVL', w - 60, 110);
    ctx.textAlign = 'left';
    var filas = [
      [l === 'es' ? 'TITULAR' : 'HOLDER', v.nombre.toUpperCase()],
      [l === 'es' ? 'MOTIVO DEL VIAJE' : 'PURPOSE OF TRAVEL', MOTIVOS[v.motivo][l].toUpperCase()],
      [l === 'es' ? 'FECHA DE ENTRADA' : 'DATE OF ENTRY', fecha(v.fecha)],
      [l === 'es' ? 'VÁLIDO HASTA' : 'VALID UNTIL', l === 'es' ? 'SIEMPRE' : 'FOREVER'],
      [l === 'es' ? 'ENTRADAS AUTORIZADAS' : 'AUTHORISED ENTRIES', '∞'],
      [l === 'es' ? 'DECRETO DE CONCESIÓN' : 'GRANTING DECREE', 'N.º ' + v.decreto]
    ];
    for (var i = 0; i < filas.length; i++) {
      var x = 60 + (i % 2) * 420, y = 210 + Math.floor(i / 2) * 104;
      ctx.fillStyle = 'rgba(32,26,51,.55)'; ctx.font = "500 15px 'IBM Plex Mono', monospace";
      ctx.fillText(filas[i][0], x, y);
      ctx.fillStyle = '#201a33'; ctx.font = "600 28px 'IBM Plex Mono', monospace";
      var txt = filas[i][1]; while (ctx.measureText(txt).width > 390 && txt.length > 4) txt = txt.slice(0, -2) + '…';
      ctx.fillText(txt, x, y + 38);
    }
    ctx.fillStyle = 'rgba(32,26,51,.06)'; ctx.fillRect(14, h - 170, w - 28, 156);
    ctx.fillStyle = '#201a33'; ctx.font = "500 30px 'IBM Plex Mono', monospace";
    ctx.fillText(v.mrz[0], 50, h - 104); ctx.fillText(v.mrz[1], 50, h - 54);
    /* sello */
    ctx.save(); ctx.translate(w - 230, 300); ctx.rotate(-.18);
    ctx.strokeStyle = 'rgba(122,74,214,.85)'; ctx.fillStyle = 'rgba(122,74,214,.85)';
    ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 130, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 112, 0, Math.PI * 2); ctx.stroke();
    ctx.textAlign = 'center';
    ctx.font = "600 15px 'IBM Plex Mono', monospace"; ctx.fillText(l === 'es' ? 'MINISTERIO DE LA GRANDEZA' : 'MINISTRY OF GREATNESS', 0, -46);
    ctx.font = "700 40px 'Bodoni Moda', Georgia, serif"; ctx.fillText(l === 'es' ? 'APROBADO' : 'APPROVED', 0, 12);
    ctx.font = "600 18px 'IBM Plex Mono', monospace"; ctx.fillText(fecha(v.fecha), 0, 52);
    ctx.restore();
    return c;
  }

  doc.addEventListener('submit', function(e){
    if (!e.target || e.target.id !== 'pvl-vis-form') return;
    e.preventDefault();
    var f = e.target;
    var n = (f.querySelector('#pvl-vis-nombre').value || '').replace(/\s+/g, ' ').trim().slice(0, 36);
    if (!n) { f.querySelector('#pvl-vis-nombre').focus(); return; }
    var m = f.querySelector('#pvl-vis-motivo').value;
    if (!MOTIVOS[m]) m = 'peregrinacion';
    emitir(n, m);
    pintar(true);
  });
  doc.addEventListener('click', function(e){
    if (!(e.target.closest && e.target.closest('#pvl-vis-descargar'))) return;
    if (!visado || !window.PavelLienzo) return;
    window.PavelLienzo.conFuentes(function(){
      window.PavelLienzo.descargar(dibujar(), (lang() === 'es' ? 'visado-pavel-' : 'pavel-visa-') + window.PavelLienzo.slug(visado.nombre) + '.png');
    });
  });
  setInterval(function(){
    var inp = uno('#pvl-vis-nombre');
    if (inp && !inp.getAttribute('data-pvl-rellenado')) {
      inp.setAttribute('data-pvl-rellenado', '1');
      var p = peregrino(); if (p && !inp.value) inp.value = p;
    }
    var sel = uno('#pvl-vis-motivo');
    if (sel && sel.getAttribute('data-l') !== lang()) {
      var os = sel.options;
      for (var i = 0; i < os.length; i++) os[i].textContent = os[i].getAttribute('data-lbl-' + lang()) || os[i].textContent;
      sel.setAttribute('data-l', lang());
    }
    var out = uno('#pvl-vis-out');
    if (out && visado && (out.hidden || out.getAttribute('data-l') !== lang())) pintar(false);
  }, 400);
})();
