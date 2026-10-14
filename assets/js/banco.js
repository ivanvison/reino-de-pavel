/* Banco Nacional de Pavelandia (pvl-bk-).
   Mismo candado de doble ejecucion que el resto de <helmet>.
   - Banca en linea: sin contrasena, a proposito; el nombre de peregrino y un
     "nivel de devocion" bastan, y entran siempre. Nunca se pide una credencial.
   - Tarjetas: cuatro niveles en SVG con el nombre del titular; se descargan
     como PNG (window.PavelLienzo). El "numero" lleva letras e infinitos, asi
     que nunca tiene formato de tarjeta real.
   - Cuentas: alta en tres pasos, aprobada siempre, con numero e IBAN de broma
     (PV∞…, que no es un codigo de pais ISO) y certificado de bienvenida en PNG.
     El panel muestra saldo y movimientos sembrados con el nombre y la fecha; el
     extracto se imprime solo (window.print con la clase pvl-bk-imprime).
   - Prestamos e hipotecas, siempre aprobados; cambio de divisas con tipos
     sembrados con la fecha.
   La cuenta vive en localStorage ('pvl-banco'): solo este navegador, nada sale. */
(function(){
  if (window.__pvlBanco) return;
  window.__pvlBanco = true;
  var doc = document;
  var CLAVE = 'pvl-banco';
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function loc(){ return lang() === 'es' ? 'es-ES' : 'en-US'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function uno(sel){
    var els = doc.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  function t(o){ return o[lang()] || o.en; }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function limpio(s, n){ return String(s || '').replace(/\s+/g, ' ').trim().slice(0, n); }
  function peregrino(){
    var m = doc.cookie.match(/(?:^|; )pavelense=([^;]*)/);
    if (m) { try { return decodeURIComponent(m[1]).trim(); } catch (e) { return String(m[1] || '').trim(); } }
    try { return (localStorage.getItem('pavelense') || '').trim(); } catch (e) { return ''; }
  }
  function hash(s){ var h = 0x811c9dc5; s = String(s).toLowerCase(); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h; }
  function azar(sem){ var h = hash(sem); return function(){ h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0; h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0; return ((h ^ (h >>> 15)) >>> 0) / 4294967296; }; }
  function hoy(){ var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function g(n, dec){ return Number(n).toLocaleString(loc(), { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }); }
  function fecha(d){ return new Date(d).toLocaleDateString(loc(), { day: '2-digit', month: 'short', year: 'numeric' }); }

  /* ---------- la cuenta (solo este navegador) ---------- */
  function leer(){ try { var v = JSON.parse(localStorage.getItem(CLAVE) || 'null'); return v && v.nombre ? v : null; } catch (e) { return null; } }
  function guardar(c){ try { localStorage.setItem(CLAVE, JSON.stringify(c)); } catch (e) {} cuentaMem = c; }
  var cuentaMem = null;
  function cuenta(){ return leer() || cuentaMem; }
  var TIPOS = {
    corriente: { es: 'Corriente Grandeza', en: 'Grandeza Checking', k: 1 },
    ahorro: { es: 'Ahorro del Unicornio', en: 'Unicorn Savings', k: 3 },
    boveda: { es: 'Bóveda Real', en: 'Royal Vault', k: 40 }
  };
  function abrirCuenta(nombre, tipo){
    var h = hash(nombre + '|' + tipo + '|' + Date.now());
    var dig = String(h).padStart(10, '0') + String(hash(nombre)).padStart(10, '0');
    var c = {
      nombre: nombre, tipo: TIPOS[tipo] ? tipo : 'corriente', abierta: hoy(),
      num: '1A-' + dig.slice(0, 4) + '-' + dig.slice(4, 10),
      iban: 'PV∞' + dig.charAt(10) + ' PAVL ' + dig.slice(11, 15) + ' ' + dig.slice(15, 19) + ' ' + dig.slice(0, 4) + ' ∞'
    };
    guardar(c);
    return c;
  }
  /* Saldo y movimientos: sembrados con el nombre y el dia, deterministas. */
  var MOVS = [
    { es: 'Tributo recibido de un admirador', en: 'Tribute received from an admirer', s: 1, a: 800, b: 9000 },
    { es: 'Buc-ee’s Pavelópolis Norte · Beaver Nuggets', en: 'Buc-ee’s Pavelópolis North · Beaver Nuggets', s: -1, a: 9, b: 60 },
    { es: 'Pienso premium para unicornio', en: 'Premium unicorn feed', s: -1, a: 40, b: 400 },
    { es: 'Derechos de autor del himno', en: 'Anthem royalties', s: 1, a: 200, b: 3000 },
    { es: 'Intereses pagados en aplausos', en: 'Interest paid in applause', s: 1, a: 1, b: 99, ap: 1 },
    { es: 'Pavel Airlines · asiento 1A', en: 'Pavel Airlines · seat 1A', s: -1, a: 500, b: 4000 },
    { es: 'Duty Free PVL · himno en vinilo', en: 'PVL Duty Free · anthem on vinyl', s: -1, a: 30, b: 90 },
    { es: 'Devolución por exceso de grandeza', en: 'Refund for excess greatness', s: 1, a: 100, b: 1500 },
    { es: 'Brisket, Buc-ee’s del Desierto', en: 'Brisket, Desert Buc-ee’s', s: -1, a: 15, b: 80 },
    { es: 'Donativo a la Orden del Unicornio', en: 'Donation to the Order of the Unicorn', s: -1, a: 50, b: 700 }
  ];
  function movimientos(c){
    var out = [], hoyD = new Date(); hoyD.setHours(12, 0, 0, 0);
    for (var i = 0; i < 12; i++) {
      var d = new Date(hoyD.getTime() - i * 2.5 * 86400000);
      var r = azar(c.nombre + c.num + d.toDateString());
      var m = MOVS[Math.floor(r() * MOVS.length)];
      var imp = Math.round(m.a + r() * (m.b - m.a)) * (m.s > 0 ? TIPOS[c.tipo].k : 1);
      out.push({ d: d, m: m, imp: m.ap ? 0 : m.s * imp, ap: m.ap ? imp : 0 });
    }
    return out;
  }
  function saldo(c){
    var dias = Math.max(0, Math.round((Date.now() - new Date(c.abierta + 'T00:00:00').getTime()) / 86400000));
    return (100000 + hash(c.nombre) % 900000) * TIPOS[c.tipo].k + dias * 1111;
  }

  /* ---------- banca en linea ---------- */
  function entrar(f){
    var n = limpio(f.querySelector('#pvl-bk-usuario').value, 26) || peregrino() || t({ es: 'Peregrino anónimo', en: 'Anonymous pilgrim' });
    var dev = Number(f.querySelector('#pvl-bk-devocion').value) || 0;
    var c = cuenta();
    if (!c || c.nombre.toLowerCase() !== n.toLowerCase()) c = abrirCuenta(n, c ? c.tipo : 'corriente');
    var msg = uno('#pvl-bk-login-msg');
    if (msg) msg.textContent = (dev < 100 ? t({ es: 'Devoción detectada: ' + dev + ' %. El Banco la redondea a 100 %. ', en: 'Devotion detected: ' + dev + '%. The Bank rounds it up to 100%. ' }) : '') + t({ es: 'Bienvenido, ', en: 'Welcome, ' }) + n + '.';
    pintarPanel(true);
    var p = uno('#pvl-bk-panel');
    if (p && p.scrollIntoView) setTimeout(function(){ p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250);
  }

  /* ---------- tarjetas ---------- */
  var NIVELES = [
    { id: 'clasica', es: 'Clásica Grandeza', en: 'Classic Grandeza', de: '#3a1d6e', a: '#140a33', tx: '#f4e0a8', lim: 1e6,
      v: [{ es: '0 % TAE, porque las deudas están por debajo de Pavel', en: '0% APR, because debt is beneath Pavel' }, { es: 'Reembolso en cumplidos', en: 'Cashback in compliments' }, { es: 'Cuota anual: una reverencia', en: 'Annual fee: one bow' }] },
    { id: 'oro', es: 'Oro Adoración', en: 'Gold Adoration', de: '#f4d9a0', a: '#b8862e', tx: '#2a1a05', lim: 1e7,
      v: [{ es: 'Millas de adoración ilimitadas (UnicornMiles ×2 en Pavel Airlines)', en: 'Unlimited adoration miles (UnicornMiles ×2 on Pavel Airlines)' }, { es: 'Una Beaver Nugget gratis por visita a Buc-ee’s. Una.', en: 'One free Beaver Nugget per Buc-ee’s visit. One.' }, { es: 'Cuota anual: dos reverencias', en: 'Annual fee: two bows' }] },
    { id: 'platino', es: 'Platino Unicornio', en: 'Platinum Unicorn', de: '#eef1f8', a: '#9aa6bf', tx: '#1b1150', lim: 1e9,
      v: [{ es: 'Acceso a la Sala Non Plus Ultra del aeropuerto PVL', en: 'Access to the Non Plus Ultra Lounge at PVL airport' }, { es: 'Conserje que le da la razón en todo', en: 'A concierge who agrees with you on everything' }, { es: 'Seguro de viaje contra rivales (no existen)', en: 'Travel insurance against rivals (there are none)' }] },
    { id: 'infinita', es: 'Non Plus Ultra Infinita', en: 'Non Plus Ultra Infinite', de: '#17102e', a: '#000000', tx: '#e9c874', lim: Infinity,
      v: [{ es: 'Sin límite: no hay nada más allá', en: 'No limit: there is nothing beyond' }, { es: 'Aceptada donde se conozca a Pavel (en todas partes)', en: 'Accepted wherever Pavel is known (everywhere)' }, { es: 'Requisito: haber sido invitado por el Soberano', en: 'Requirement: an invitation from the Sovereign' }] }
  ];
  var nivelSel = 'oro';
  function nivel(id){ for (var i = 0; i < NIVELES.length; i++) if (NIVELES[i].id === id) return NIVELES[i]; return NIVELES[0]; }
  function limite(nv){ return isFinite(nv.lim) ? g(nv.lim) + ' G' : '∞'; }
  function numeroTarjeta(nv, nombre){ return 'PAVL ∞∞∞∞ ' + String(hash(nombre + nv.id) % 10000).padStart(4, '0') + ' 1A' + String(NIVELES.indexOf(nv) + 1).padStart(2, '0'); }
  function titular(){ var i = uno('#pvl-bk-titular'); return limpio(i && i.value, 24) || peregrino() || 'PAVEL NAVARRO'; }
  function svgTarjeta(nv, nombre, uid){
    var id = 'pvlbk' + uid + nv.id;
    return '<svg viewBox="0 0 856 540" class="pvl-bk-svg" role="img" aria-label="' + esc(t(nv)) + '">' +
      '<defs><linearGradient id="' + id + 'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + nv.de + '"/><stop offset="1" stop-color="' + nv.a + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#86e7ea"/><stop offset=".35" stop-color="#f2a9dc"/><stop offset=".7" stop-color="#e9c874"/><stop offset="1" stop-color="#b6f0c4"/></linearGradient>' +
      '<linearGradient id="' + id + 'c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e2a6"/><stop offset=".5" stop-color="#caa04a"/><stop offset="1" stop-color="#f0d690"/></linearGradient>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
      '<rect width="856" height="540" rx="38" fill="url(#' + id + 'f)"/>' +
      '<g opacity=".12" fill="none" stroke="' + nv.tx + '" stroke-width="1.4">' + guilloche() + '</g>' +
      '<rect width="856" height="540" rx="38" fill="url(#' + id + 'b)"/>' +
      '<text x="60" y="92" font-family="Bodoni Moda,Georgia,serif" font-style="italic" font-weight="900" font-size="40" fill="' + nv.tx + '">Banco Nacional</text>' +
      '<text x="60" y="124" font-family="IBM Plex Mono,monospace" font-size="17" letter-spacing="5" fill="' + nv.tx + '" opacity=".75">DE PAVELANDIA</text>' +
      '<circle cx="768" cy="92" r="40" fill="none" stroke="' + nv.tx + '" stroke-width="3"/><text x="768" y="108" text-anchor="middle" font-family="Bodoni Moda,Georgia,serif" font-weight="700" font-size="44" fill="' + nv.tx + '">P</text>' +
      '<rect x="70" y="190" width="104" height="80" rx="12" fill="url(#' + id + 'c)"/><g stroke="#8a6a24" stroke-width="2" fill="none" opacity=".7"><path d="M70 230h34M140 230h34M104 190v80M140 190v80M104 212h36M104 248h36"/></g>' +
      '<g fill="none" stroke="' + nv.tx + '" stroke-width="5" stroke-linecap="round" opacity=".8"><path d="M210 214a26 26 0 0 1 0 32"/><path d="M226 204a42 42 0 0 1 0 52"/><path d="M242 194a58 58 0 0 1 0 72"/></g>' +
      '<g transform="translate(700 210)"><ellipse cx="0" cy="0" rx="62" ry="44" fill="url(#' + id + 'h)" opacity=".92"/><path d="M-18 14c4-20 14-30 28-32l10-18 4 20c8 6 10 16 6 26z" fill="#fff" opacity=".7"/><ellipse cx="0" cy="0" rx="62" ry="44" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/></g>' +
      '<text x="70" y="356" font-family="IBM Plex Mono,monospace" font-weight="600" font-size="46" letter-spacing="3" fill="' + nv.tx + '">' + esc(numeroTarjeta(nv, nombre)) + '</text>' +
      '<text x="70" y="410" font-family="IBM Plex Mono,monospace" font-size="15" letter-spacing="3" fill="' + nv.tx + '" opacity=".7">' + esc(t({ es: 'VÁLIDA HASTA', en: 'VALID THRU' })) + '</text><text x="250" y="410" font-family="IBM Plex Mono,monospace" font-weight="600" font-size="24" fill="' + nv.tx + '">∞/∞</text>' +
      '<text x="70" y="470" font-family="IBM Plex Mono,monospace" font-weight="600" font-size="30" letter-spacing="2" fill="' + nv.tx + '">' + esc(nombre.toUpperCase().slice(0, 24)) + '</text>' +
      '<text x="70" y="506" font-family="IBM Plex Sans,sans-serif" font-weight="600" font-size="16" letter-spacing="4" fill="' + nv.tx + '" opacity=".8">' + esc(t(nv).toUpperCase()) + '</text>' +
      '<text x="796" y="494" text-anchor="end" font-family="Bodoni Moda,Georgia,serif" font-style="italic" font-weight="900" font-size="38" fill="' + nv.tx + '">UNICORN</text>' +
      '</svg>';
  }
  function guilloche(){
    var s = '';
    for (var k = 0; k < 7; k++) {
      var d = 'M0 ' + (300 + k * 18);
      for (var x = 0; x <= 856; x += 24) d += ' L' + x + ' ' + (300 + k * 18 + Math.sin(x / 60 + k) * 40).toFixed(1);
      s += '<path d="' + d + '"/>';
    }
    return s;
  }
  function pintarGama(){
    var box = uno('#pvl-bk-gama');
    if (!box) return;
    var n = titular(), clave = lang() + '|' + n + '|' + nivelSel;
    if (box.getAttribute('data-k') === clave) return;
    box.innerHTML = NIVELES.map(function(nv){
      var on = nv.id === nivelSel;
      return '<button type="button" role="radio" aria-checked="' + on + '" class="pvl-bk-nivel' + (on ? ' pvl-bk-on' : '') + '" data-pvl-bk-nivel="' + nv.id + '">' + svgTarjeta(nv, n, 'm') + '<b>' + esc(t(nv)) + '</b><span>' + esc(t({ es: 'Límite', en: 'Limit' })) + ': ' + limite(nv) + '</span></button>';
    }).join('');
    var nv = nivel(nivelSel);
    var vista = uno('#pvl-bk-tarjeta-vista');
    if (vista) vista.innerHTML = svgTarjeta(nv, n, 'v');
    var ven = uno('#pvl-bk-ventajas');
    if (ven) ven.innerHTML = '<h3>' + esc(t(nv)) + '</h3><p class="pvl-bk-limite">' + esc(t({ es: 'Límite de crédito', en: 'Credit limit' })) + ': <b>' + limite(nv) + '</b></p><ul>' + nv.v.map(function(v){ return '<li>' + esc(t(v)) + '</li>'; }).join('') + '</ul>';
    box.setAttribute('data-k', clave);
  }
  function dibujarTarjeta(){
    var Lz = window.PavelLienzo, nv = nivel(nivelSel), n = titular();
    var w = 1712, h = 1080, c = Lz.nuevo(w, h), x = c.getContext('2d');
    x.save(); x.scale(2, 2);
    function redondo(rx, ry, rw, rh, r){ x.beginPath(); x.moveTo(rx + r, ry); x.arcTo(rx + rw, ry, rx + rw, ry + rh, r); x.arcTo(rx + rw, ry + rh, rx, ry + rh, r); x.arcTo(rx, ry + rh, rx, ry, r); x.arcTo(rx, ry, rx + rw, ry, r); x.closePath(); }
    redondo(0, 0, 856, 540, 38); x.clip();
    var f = x.createLinearGradient(0, 0, 856, 540); f.addColorStop(0, nv.de); f.addColorStop(1, nv.a); x.fillStyle = f; x.fillRect(0, 0, 856, 540);
    x.globalAlpha = .12; x.strokeStyle = nv.tx; x.lineWidth = 1.4;
    for (var k = 0; k < 7; k++) { x.beginPath(); for (var px = 0; px <= 856; px += 12) { var py = 300 + k * 18 + Math.sin(px / 60 + k) * 40; if (px) x.lineTo(px, py); else x.moveTo(px, py); } x.stroke(); }
    x.globalAlpha = 1;
    var b = x.createLinearGradient(0, 0, 0, 540); b.addColorStop(0, 'rgba(255,255,255,.22)'); b.addColorStop(.5, 'rgba(255,255,255,0)'); x.fillStyle = b; x.fillRect(0, 0, 856, 540);
    x.fillStyle = nv.tx; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    x.font = "italic 900 40px 'Bodoni Moda', Georgia, serif"; x.fillText('Banco Nacional', 60, 92);
    x.globalAlpha = .75; x.font = "400 17px 'IBM Plex Mono', monospace"; x.fillText('D E   P A V E L A N D I A', 60, 124); x.globalAlpha = 1;
    x.strokeStyle = nv.tx; x.lineWidth = 3; x.beginPath(); x.arc(768, 92, 40, 0, Math.PI * 2); x.stroke();
    x.textAlign = 'center'; x.font = "700 44px 'Bodoni Moda', Georgia, serif"; x.fillText('P', 768, 108); x.textAlign = 'left';
    var ch = x.createLinearGradient(70, 190, 174, 270); ch.addColorStop(0, '#f6e2a6'); ch.addColorStop(.5, '#caa04a'); ch.addColorStop(1, '#f0d690');
    x.fillStyle = ch; redondo(70, 190, 104, 80, 12); x.fill();
    x.strokeStyle = 'rgba(138,106,36,.7)'; x.lineWidth = 2; x.beginPath(); x.moveTo(70, 230); x.lineTo(104, 230); x.moveTo(140, 230); x.lineTo(174, 230); x.moveTo(104, 190); x.lineTo(104, 270); x.moveTo(140, 190); x.lineTo(140, 270); x.moveTo(104, 212); x.lineTo(140, 212); x.moveTo(104, 248); x.lineTo(140, 248); x.stroke();
    x.strokeStyle = nv.tx; x.globalAlpha = .8; x.lineWidth = 5; x.lineCap = 'round';
    [26, 42, 58].forEach(function(r){ x.beginPath(); x.arc(184, 230, r, -.66, .66); x.stroke(); });
    x.globalAlpha = 1;
    var hol = x.createLinearGradient(638, 166, 762, 254); hol.addColorStop(0, '#86e7ea'); hol.addColorStop(.35, '#f2a9dc'); hol.addColorStop(.7, '#e9c874'); hol.addColorStop(1, '#b6f0c4');
    x.fillStyle = hol; x.beginPath(); x.ellipse(700, 210, 62, 44, 0, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 2; x.stroke();
    x.fillStyle = nv.tx;
    x.font = "600 46px 'IBM Plex Mono', monospace"; x.fillText(numeroTarjeta(nv, n), 70, 356);
    x.globalAlpha = .7; x.font = "400 15px 'IBM Plex Mono', monospace"; x.fillText(lang() === 'es' ? 'VÁLIDA HASTA' : 'VALID THRU', 70, 410); x.globalAlpha = 1;
    x.font = "600 24px 'IBM Plex Mono', monospace"; x.fillText('∞/∞', 250, 410);
    x.font = "600 30px 'IBM Plex Mono', monospace"; x.fillText(n.toUpperCase().slice(0, 24), 70, 470);
    x.globalAlpha = .8; x.font = "600 16px 'IBM Plex Sans', sans-serif"; x.fillText(t(nv).toUpperCase(), 70, 506); x.globalAlpha = 1;
    x.textAlign = 'right'; x.font = "italic 900 38px 'Bodoni Moda', Georgia, serif"; x.fillText('UNICORN', 796, 494);
    x.restore();
    return c;
  }

  /* ---------- alta de cuenta ---------- */
  var paso = 1;
  function irPaso(n){
    var f = uno('#pvl-bk-abrir');
    if (!f) return;
    paso = n;
    var fs = f.querySelectorAll('.pvl-bk-paso');
    for (var i = 0; i < fs.length; i++) fs[i].hidden = Number(fs[i].getAttribute('data-paso')) !== n;
    var lis = f.querySelectorAll('.pvl-bk-pasos li');
    for (var j = 0; j < lis.length; j++) lis[j].className = j < n ? 'pvl-bk-on' : '';
    var pn = f.querySelector('#pvl-bk-paso-n'); if (pn) pn.textContent = n;
    if (n === 2) { var nm = f.querySelector('#pvl-bk-abrir-nombre'); if (nm) { if (!nm.value) nm.value = peregrino(); nm.focus(); } }
  }
  function solicitar(f){
    var nm = f.querySelector('#pvl-bk-abrir-nombre'), jura = f.querySelector('#pvl-bk-jura');
    var n = limpio(nm.value, 26);
    if (!n) { nm.focus(); return; }
    if (!jura.checked) { jura.focus(); jura.parentNode.classList.add('pvl-bk-falta'); return; }
    jura.parentNode.classList.remove('pvl-bk-falta');
    var sel = f.querySelector('input[name="pvl-bk-tipo"]:checked');
    abrirCuenta(n, sel ? sel.value : 'corriente');
    irPaso(3);
    pintarAprobada(true);
    pintarPanel(true);
  }
  function pintarAprobada(forzar){
    var box = uno('#pvl-bk-aprobada'), c = cuenta();
    if (!box || !c) return;
    var clave = lang() + c.num;
    if (!forzar && box.getAttribute('data-k') === clave) return;
    box.innerHTML = '<div class="pvl-bk-sello" aria-hidden="true">' + esc(t({ es: 'APROBADA', en: 'APPROVED' })) + '</div>' +
      '<p>' + esc(t({ es: 'Su solicitud se aprobó en 0,000 segundos. El Banco no ha rechazado a nadie, nunca.', en: 'Your application was approved in 0.000 seconds. The Bank has never turned anyone down.' })) + '</p>' +
      '<dl class="pvl-bk-datos"><div><dt>' + esc(t({ es: 'Titular', en: 'Holder' })) + '</dt><dd>' + esc(c.nombre) + '</dd></div><div><dt>' + esc(t({ es: 'Cuenta', en: 'Account' })) + '</dt><dd>' + esc(t(TIPOS[c.tipo])) + '</dd></div><div><dt>' + esc(t({ es: 'Número', en: 'Number' })) + '</dt><dd>' + esc(c.num) + '</dd></div><div><dt>IBAN</dt><dd>' + esc(c.iban) + '</dd></div></dl>';
    box.setAttribute('data-k', clave);
  }
  function dibujarCertificado(){
    var Lz = window.PavelLienzo, c = cuenta(), l = lang();
    var w = 1600, h = 1100, cv = Lz.nuevo(w, h), x = cv.getContext('2d');
    Lz.marco(x, w, h);
    x.textAlign = 'center';
    x.fillStyle = '#d8b25c'; x.font = "500 22px 'IBM Plex Mono', monospace"; x.fillText(l === 'es' ? 'BANCO NACIONAL DE PAVELANDIA · REINO DE PAVEL' : 'NATIONAL BANK OF PAVELANDIA · KINGDOM OF PAVEL', w / 2, 130);
    x.fillStyle = '#f4e0a8'; x.font = "italic 900 76px 'Bodoni Moda', Georgia, serif"; x.fillText(l === 'es' ? 'Certificado de bienvenida' : 'Welcome certificate', w / 2, 250);
    x.fillStyle = 'rgba(244,239,226,.8)'; x.font = "300 28px 'IBM Plex Sans', sans-serif"; x.fillText(l === 'es' ? 'El Banco certifica que' : 'The Bank certifies that', w / 2, 340);
    x.fillStyle = '#f7f2e6'; x.font = "700 64px 'Bodoni Moda', Georgia, serif"; x.fillText(c.nombre, w / 2, 430);
    x.fillStyle = 'rgba(244,239,226,.8)'; x.font = "300 28px 'IBM Plex Sans', sans-serif";
    Lz.envolver(x, l === 'es' ? 'es titular de una cuenta ' + t(TIPOS[c.tipo]) + ', aprobada al instante, con saldo mínimo de lealtad inquebrantable e intereses pagaderos en aplausos.' : 'holds a ' + t(TIPOS[c.tipo]) + ' account, approved instantly, with a minimum balance of undying loyalty and interest payable in applause.', w / 2, 500, 1100, 42);
    x.font = "600 30px 'IBM Plex Mono', monospace"; x.fillStyle = '#e9c874';
    x.fillText((l === 'es' ? 'N.º ' : 'No. ') + c.num, w / 2, 660);
    x.fillText('IBAN ' + c.iban, w / 2, 710);
    x.fillStyle = 'rgba(244,239,226,.55)'; x.font = "400 20px 'IBM Plex Mono', monospace";
    x.fillText((l === 'es' ? 'ABIERTA EL ' : 'OPENED ') + fecha(c.abierta + 'T12:00:00').toUpperCase(), w / 2, 780);
    x.fillText(l === 'es' ? 'DOCUMENTO DE BROMA · NO ES UN BANCO REAL' : 'NOVELTY DOCUMENT · NOT A REAL BANK', w / 2, 1000);
    x.strokeStyle = 'rgba(216,178,92,.6)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(300, 900); x.lineTo(700, 900); x.stroke();
    x.fillStyle = 'rgba(244,239,226,.7)'; x.font = "italic 400 30px 'Bodoni Moda', Georgia, serif"; x.fillText('Pavel I', 500, 885);
    x.font = "400 16px 'IBM Plex Mono', monospace"; x.fillText(l === 'es' ? 'GOBERNADOR Y ÚNICO ACCIONISTA' : 'GOVERNOR AND SOLE SHAREHOLDER', 500, 930);
    Lz.sello(x, 1120, 880, 80);
    return cv;
  }

  /* ---------- panel y extracto ---------- */
  function pintarPanel(forzar){
    var box = uno('#pvl-bk-panel');
    if (!box) return;
    var c = cuenta(), l = lang(), clave = l + (c ? c.num + c.nombre : '-') + hoy();
    if (!forzar && box.getAttribute('data-k') === clave) return;
    box.setAttribute('data-k', clave);
    if (!c) {
      box.innerHTML = '<div class="pvl-bk-vacio"><div class="pvl-bk-kicker">' + esc(t({ es: 'SU PANEL', en: 'YOUR DASHBOARD' })) + '</div><p>' + esc(t({ es: 'Aún no tiene cuenta. Ábrala a la izquierda, o entre en la banca en línea: el Banco le abrirá una sobre la marcha.', en: 'You have no account yet. Open one on the left, or log in to online banking: the Bank will open one on the spot.' })) + '</p></div>';
      return;
    }
    var movs = movimientos(c), s = saldo(c), aplausos = movs.reduce(function(a, m){ return a + m.ap; }, 0);
    box.innerHTML =
      '<div class="pvl-bk-saldo"><div><small>' + esc(t(TIPOS[c.tipo]).toUpperCase()) + ' · ' + esc(c.num) + '</small><b>' + g(s, 2) + ' G</b><span>' + esc(c.nombre) + ' · IBAN ' + esc(c.iban) + '</span></div>' +
      '<div class="pvl-bk-aplausos"><small>' + esc(t({ es: 'INTERESES DEL MES', en: 'INTEREST THIS MONTH' })) + '</small><b>' + g(aplausos) + ' 👏</b></div></div>' +
      '<div class="pvl-bk-kicker">' + esc(t({ es: 'ÚLTIMOS MOVIMIENTOS', en: 'RECENT TRANSACTIONS' })) + '</div>' +
      '<ul class="pvl-bk-movs">' + movs.slice(0, 7).map(function(m){
        return '<li><span>' + esc(fecha(m.d)) + '</span><b>' + esc(t(m.m)) + '</b><i class="' + (m.ap || m.imp > 0 ? 'pvl-bk-mas' : 'pvl-bk-menos') + '">' + (m.ap ? '+' + g(m.ap) + ' 👏' : (m.imp > 0 ? '+' : '−') + g(Math.abs(m.imp), 2) + ' G') + '</i></li>';
      }).join('') + '</ul>' +
      '<div class="pvl-bk-botones"><button type="button" class="pvl-bk-btn" data-pvl-bk-extracto="ver">' + esc(t({ es: 'Ver el extracto', en: 'View statement' })) + '</button><button type="button" class="pvl-bk-btn pvl-bk-btn-2" data-pvl-bk-extracto="imprimir">' + esc(t({ es: 'Imprimir el extracto', en: 'Print statement' })) + '</button><button type="button" class="pvl-bk-btn pvl-bk-btn-2" id="pvl-bk-cert-png-2">' + esc(t({ es: 'Certificado (PNG)', en: 'Certificate (PNG)' })) + '</button><button type="button" class="pvl-bk-btn pvl-bk-btn-3" data-pvl-bk-cerrar>' + esc(t({ es: 'Cerrar la cuenta', en: 'Close the account' })) + '</button></div>';
    var ex = uno('#pvl-bk-extracto');
    if (ex && !ex.hidden) pintarExtracto();
  }
  function pintarExtracto(){
    var box = uno('#pvl-bk-extracto'), c = cuenta();
    if (!box || !c) return;
    var movs = movimientos(c).slice().reverse(), fin = saldo(c), neto = movs.reduce(function(a, m){ return a + m.imp; }, 0), corre = fin - neto;
    var ini = corre;
    box.innerHTML =
      '<div class="pvl-bk-ex-top"><div><b>Banco Nacional de Pavelandia</b><span>' + esc(t({ es: 'Palacio de la Grandeza · Plaza del Unicornio 1', en: 'Palace of Greatness · Unicorn Square 1' })) + '</span></div><div class="pvl-bk-ex-p">P</div></div>' +
      '<h3>' + esc(t({ es: 'Extracto de cuenta', en: 'Account statement' })) + '</h3>' +
      '<dl class="pvl-bk-datos pvl-bk-datos-claro"><div><dt>' + esc(t({ es: 'Titular', en: 'Holder' })) + '</dt><dd>' + esc(c.nombre) + '</dd></div><div><dt>' + esc(t({ es: 'Cuenta', en: 'Account' })) + '</dt><dd>' + esc(t(TIPOS[c.tipo])) + ' · ' + esc(c.num) + '</dd></div><div><dt>IBAN</dt><dd>' + esc(c.iban) + '</dd></div><div><dt>' + esc(t({ es: 'Periodo', en: 'Period' })) + '</dt><dd>' + esc(fecha(movs[0].d)) + ' – ' + esc(fecha(new Date())) + '</dd></div></dl>' +
      '<div class="pvl-bk-ex-scroll"><table class="pvl-bk-ex-tabla"><thead><tr><th scope="col">' + esc(t({ es: 'Fecha', en: 'Date' })) + '</th><th scope="col">' + esc(t({ es: 'Concepto', en: 'Description' })) + '</th><th scope="col">' + esc(t({ es: 'Importe', en: 'Amount' })) + '</th><th scope="col">' + esc(t({ es: 'Saldo', en: 'Balance' })) + '</th></tr></thead><tbody>' +
      '<tr><td></td><td><i>' + esc(t({ es: 'Saldo anterior', en: 'Opening balance' })) + '</i></td><td></td><td>' + g(ini, 2) + '</td></tr>' +
      movs.map(function(m){ corre += m.imp; return '<tr><td>' + esc(fecha(m.d)) + '</td><td>' + esc(t(m.m)) + '</td><td>' + (m.ap ? '+' + g(m.ap) + ' 👏' : (m.imp > 0 ? '+' : '−') + g(Math.abs(m.imp), 2)) + '</td><td>' + g(corre, 2) + '</td></tr>'; }).join('') +
      '</tbody></table></div>' +
      '<p class="pvl-bk-ex-pie">' + esc(t({ es: 'Saldo final: ', en: 'Closing balance: ' })) + '<b>' + g(fin, 2) + ' G</b>. ' + esc(t({ es: 'Documento de broma: el Banco Nacional de Pavelandia no es un banco real y las Grandezas no existen fuera del Reino.', en: 'Novelty document: the National Bank of Pavelandia is not a real bank and Grandezas do not exist outside the Kingdom.' })) + '</p>' +
      '<div class="pvl-bk-botones pvl-bk-no-imprimir"><button type="button" class="pvl-bk-btn" data-pvl-bk-extracto="imprimir">' + esc(t({ es: 'Imprimir', en: 'Print' })) + '</button><button type="button" class="pvl-bk-btn pvl-bk-btn-2" data-pvl-bk-extracto="cerrar">' + esc(t({ es: 'Cerrar', en: 'Close' })) + '</button></div>';
    box.setAttribute('data-l', lang());
  }
  function imprimir(){
    var ex = uno('#pvl-bk-extracto');
    if (!ex || !cuenta()) return;
    ex.hidden = false; pintarExtracto();
    doc.body.classList.add('pvl-bk-imprime');
    function quitar(){ doc.body.classList.remove('pvl-bk-imprime'); window.removeEventListener('afterprint', quitar); }
    window.addEventListener('afterprint', quitar);
    setTimeout(function(){ window.print(); setTimeout(quitar, 1000); }, 50);
  }

  /* ---------- prestamos ---------- */
  var FINES = {
    unicornio: { es: 'Un unicornio', en: 'A unicorn' }, bucees: { es: 'Beaver Nuggets al por mayor', en: 'Beaver Nuggets, wholesale' },
    estatua: { es: 'Una estatua de Pavel', en: 'A statue of Pavel' }, vinilo: { es: 'El himno en vinilo', en: 'The anthem on vinyl' },
    nada: { es: 'Nada; me gustan los préstamos', en: 'Nothing; I just like loans' }
  };
  var PARCELAS = {
    centro: { es: 'Pavelópolis Centro', en: 'Pavelópolis Central', p: 9000 }, norte: { es: 'Pavelópolis Norte', en: 'Pavelópolis North', p: 6500 },
    lago: { es: 'Orilla del Lago Iridiscente', en: 'Lake Iridescent shore', p: 12000 }, puerto: { es: 'Puerto Grandeza', en: 'Port Greatness', p: 5000 },
    'san-unicornio': { es: 'San Unicornio', en: 'San Unicornio', p: 7000 }, descartes: { es: 'Villa Descartes', en: 'Villa Descartes', p: 3300 },
    rival: { es: 'Isla del Rival', en: 'Rival Island', p: 1 }
  };
  var prestamo = null, hipoteca = null;
  function pintarPrestamo(){
    var out = uno('#pvl-bk-prestamo-out');
    if (!out || !prestamo) return;
    var p = prestamo;
    out.hidden = false;
    out.innerHTML = '<div class="pvl-bk-sello pvl-bk-sello-claro" aria-hidden="true">' + esc(t({ es: 'APROBADO', en: 'APPROVED' })) + '</div>' +
      '<dl class="pvl-bk-datos pvl-bk-datos-claro"><div><dt>' + esc(t({ es: 'Importe', en: 'Amount' })) + '</dt><dd>' + g(p.imp) + ' G</dd></div><div><dt>' + esc(t({ es: 'Finalidad', en: 'Purpose' })) + '</dt><dd>' + esc(t(FINES[p.fin])) + '</dd></div><div><dt>' + esc(t({ es: 'TAE', en: 'APR' })) + '</dt><dd>' + g(0, 2) + ' %</dd></div><div><dt>' + esc(t({ es: 'Plazo', en: 'Term' })) + '</dt><dd>' + p.plazo + ' ' + esc(t({ es: 'lunas', en: 'moons' })) + '</dd></div><div><dt>' + esc(t({ es: 'Cuota', en: 'Instalment' })) + '</dt><dd>' + esc(t({ es: 'Cuando la grandeza lo permita', en: 'Whenever greatness permits' })) + '</dd></div><div><dt>' + esc(t({ es: 'Total a devolver', en: 'Total repayable' })) + '</dt><dd>' + esc(t({ es: 'Su gratitud', en: 'Your gratitude' })) + '</dd></div></dl>';
    out.setAttribute('data-l', lang());
  }
  function pintarHipoteca(){
    var out = uno('#pvl-bk-hipoteca-out');
    if (!out || !hipoteca) return;
    var h = hipoteca, pc = PARCELAS[h.par], precio = pc.p * h.m2;
    out.hidden = false;
    out.innerHTML = '<div class="pvl-bk-sello pvl-bk-sello-claro" aria-hidden="true">' + esc(t({ es: 'APROBADA', en: 'APPROVED' })) + '</div>' +
      '<dl class="pvl-bk-datos pvl-bk-datos-claro"><div><dt>' + esc(t({ es: 'Parcela', en: 'Plot' })) + '</dt><dd>' + esc(t(pc)) + ' · ' + h.m2 + ' m²</dd></div><div><dt>' + esc(t({ es: 'Tasación', en: 'Valuation' })) + '</dt><dd>' + g(precio) + ' G</dd></div><div><dt>' + esc(t({ es: 'Entrada', en: 'Deposit' })) + '</dt><dd>' + esc(t({ es: 'Una reverencia', en: 'One bow' })) + '</dd></div><div><dt>' + esc(t({ es: 'Plazo', en: 'Term' })) + '</dt><dd>' + esc(t({ es: 'Hasta el fin de los tiempos', en: 'Until the end of time' })) + '</dd></div></dl>' +
      (h.par === 'rival' ? '<p class="pvl-bk-nota pvl-bk-nota-claro">' + esc(t({ es: 'La Isla del Rival se tasa en 1 G el m²: está pendiente de reconquista y el puente sigue en obras.', en: 'Rival Island is valued at 1 G per m²: it is pending reconquest and the bridge is still under construction.' })) + '</p>' : '');
    out.setAttribute('data-l', lang());
  }

  /* ---------- cambio de divisas ---------- */
  var MONEDAS = [
    ['USD', { es: 'Dólar estadounidense', en: 'US dollar' }, 1], ['EUR', { es: 'Euro', en: 'Euro' }, .92], ['GBP', { es: 'Libra esterlina', en: 'Pound sterling' }, .79],
    ['MXN', { es: 'Peso mexicano', en: 'Mexican peso' }, 18], ['COP', { es: 'Peso colombiano', en: 'Colombian peso' }, 4000], ['ARS', { es: 'Peso argentino', en: 'Argentine peso' }, 950],
    ['JPY', { es: 'Yen', en: 'Yen' }, 150], ['CHF', { es: 'Franco suizo', en: 'Swiss franc' }, .88], ['BTC', { es: 'Bitcoin', en: 'Bitcoin' }, .000016],
    ['NUG', { es: 'Beaver Nuggets (bolsas)', en: 'Beaver Nuggets (bags)' }, .2]
  ];
  /* Cuantos dolares vale una Grandeza hoy: entre 1.000 y 10.000, sembrado con la fecha. */
  function usdPorG(dia){ var r = azar('fx' + dia); return 1000 + Math.round(r() * 9000); }
  function ayer(){ var d = new Date(Date.now() - 86400000); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function pintarCambio(forzar){
    var sel = uno('#pvl-bk-fx-mon'), tb = uno('#pvl-bk-fx-tabla'), out = uno('#pvl-bk-fx-out'), imp = uno('#pvl-bk-fx-imp');
    if (!sel || !tb || !out) return;
    var l = lang(), k = usdPorG(hoy()), k0 = usdPorG(ayer());
    if (forzar || sel.getAttribute('data-l') !== l) {
      var v = sel.value || 'USD';
      sel.innerHTML = MONEDAS.map(function(m){ return '<option value="' + m[0] + '">' + m[0] + ' · ' + esc(t(m[1])) + '</option>'; }).join('');
      sel.value = v; sel.setAttribute('data-l', l);
      var sube = k >= k0;
      tb.innerHTML = MONEDAS.map(function(m){ var v1 = k * m[2]; return '<tr><td><b>' + m[0] + '</b> ' + esc(t(m[1])) + '</td><td>' + g(v1, v1 < 1 ? 4 : 2) + '</td><td class="pvl-bk-sube">▲ ' + (sube ? g((k / k0 - 1) * 100, 1) : g(Math.abs(hash(m[0] + hoy()) % 70) / 10, 1)) + ' %</td></tr>'; }).join('');
      var fe = uno('#pvl-bk-fx-fecha'); if (fe) fe.textContent = fecha(new Date());
    }
    var m = MONEDAS[0]; for (var i = 0; i < MONEDAS.length; i++) if (MONEDAS[i][0] === sel.value) m = MONEDAS[i];
    var cant = Math.max(0, Number(imp && imp.value) || 0), res = cant / (k * m[2]);
    var clave = l + sel.value + cant + k;
    if (!forzar && out.getAttribute('data-k') === clave) return;
    out.innerHTML = '<span>' + g(cant, 2) + ' ' + m[0] + ' =</span><b>' + g(res, res < 1 ? 6 : 2) + ' G</b><small>1 G = ' + g(k * m[2], k * m[2] < 1 ? 4 : 2) + ' ' + m[0] + ' · ' + esc(t({ es: 'Sus ahorros ahora valen algo de verdad.', en: 'Your savings are now worth something real.' })) + '</small>';
    out.setAttribute('data-k', clave);
  }

  /* ---------- eventos ---------- */
  doc.addEventListener('submit', function(e){
    var id = e.target && e.target.id;
    if (id === 'pvl-bk-login') { e.preventDefault(); entrar(e.target); }
    else if (id === 'pvl-bk-abrir') { e.preventDefault(); if (paso === 2) solicitar(e.target); }
    else if (id === 'pvl-bk-prestamo') {
      e.preventDefault();
      var f = e.target, fin = f.querySelector('#pvl-bk-finalidad').value;
      prestamo = { imp: Math.max(1, Math.min(999999999999, Math.round(Number(f.querySelector('#pvl-bk-importe').value) || 1))), fin: FINES[fin] ? fin : 'nada', plazo: Number(f.querySelector('#pvl-bk-plazo').value) || 12 };
      pintarPrestamo();
    } else if (id === 'pvl-bk-hipoteca') {
      e.preventDefault();
      var fh = e.target, par = fh.querySelector('#pvl-bk-parcela').value;
      hipoteca = { par: PARCELAS[par] ? par : 'centro', m2: Number(fh.querySelector('#pvl-bk-m2').value) || 120 };
      pintarHipoteca();
    } else if (id === 'pvl-bk-cambio') { e.preventDefault(); pintarCambio(true); }
  });
  doc.addEventListener('input', function(e){
    var id = e.target && e.target.id;
    if (id === 'pvl-bk-devocion') { var o = uno('#pvl-bk-devocion-v'); if (o) o.textContent = e.target.value; }
    else if (id === 'pvl-bk-plazo') { var o2 = uno('#pvl-bk-plazo-v'); if (o2) o2.textContent = e.target.value; }
    else if (id === 'pvl-bk-m2') { var o3 = uno('#pvl-bk-m2-v'); if (o3) o3.textContent = e.target.value; }
    else if (id === 'pvl-bk-fx-imp') pintarCambio();
    else if (id === 'pvl-bk-titular') pintarGama();
  });
  doc.addEventListener('change', function(e){
    var id = e.target && e.target.id;
    if (id === 'pvl-bk-fx-mon') pintarCambio();
    if (e.target && e.target.id === 'pvl-bk-jura' && e.target.checked) e.target.parentNode.classList.remove('pvl-bk-falta');
  });
  doc.addEventListener('click', function(e){
    var el = e.target.closest ? e.target : null;
    if (!el) return;
    var nv = el.closest('[data-pvl-bk-nivel]');
    if (nv) { nivelSel = nv.getAttribute('data-pvl-bk-nivel'); pintarGama(); return; }
    var ir = el.closest('[data-pvl-bk-ir]');
    if (ir) { irPaso(Number(ir.getAttribute('data-pvl-bk-ir'))); return; }
    var Lz = window.PavelLienzo;
    if (el.closest('#pvl-bk-tarjeta-png') && Lz) {
      Lz.conFuentes(function(){ Lz.descargar(dibujarTarjeta(), (lang() === 'es' ? 'tarjeta-' : 'card-') + nivelSel + '-' + Lz.slug(titular()) + '.png'); });
      return;
    }
    if ((el.closest('#pvl-bk-cert-png') || el.closest('#pvl-bk-cert-png-2')) && Lz && cuenta()) {
      Lz.conFuentes(function(){ Lz.descargar(dibujarCertificado(), (lang() === 'es' ? 'certificado-banco-' : 'bank-certificate-') + Lz.slug(cuenta().nombre) + '.png'); });
      return;
    }
    var ex = el.closest('[data-pvl-bk-extracto]');
    if (ex) {
      var acc = ex.getAttribute('data-pvl-bk-extracto'), box = uno('#pvl-bk-extracto');
      if (acc === 'imprimir') imprimir();
      else if (box && acc === 'ver') { box.hidden = false; pintarExtracto(); if (box.scrollIntoView) box.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      else if (box) box.hidden = true;
      return;
    }
    if (el.closest('[data-pvl-bk-cerrar]')) {
      if (!window.confirm(t({ es: '¿Cerrar la cuenta? El Banco la olvidará en este navegador (y llorará un poco).', en: 'Close the account? The Bank will forget it in this browser (and weep a little).' }))) return;
      try { localStorage.removeItem(CLAVE); } catch (er) {}
      cuentaMem = null;
      var bx = uno('#pvl-bk-extracto'); if (bx) bx.hidden = true;
      irPaso(1);
      pintarPanel(true);
    }
  });
  setInterval(function(){
    var lg = uno('#pvl-bk-login');
    if (lg && !lg.getAttribute('data-pvl-rellenado')) {
      lg.setAttribute('data-pvl-rellenado', '1');
      var u = lg.querySelector('#pvl-bk-usuario'), c = cuenta(); if (u && !u.value) u.value = (c && c.nombre) || peregrino();
      var tit = uno('#pvl-bk-titular'); if (tit && !tit.value) tit.value = (c && c.nombre) || peregrino();
    }
    var tipo = uno('#pvl-bk-tipo');
    if (tipo && tipo.getAttribute('data-l') !== lang()) { tipo.textContent = (hash(hoy()) % 2 ? g(0, 2) : '−' + g(.01, 2)) + ' %'; tipo.setAttribute('data-l', lang()); }
    var sf = uno('#pvl-bk-finalidad');
    if (sf && sf.getAttribute('data-l') !== lang()) {
      for (var i = 0; i < sf.options.length; i++) { var fo = FINES[sf.options[i].value]; if (fo) sf.options[i].textContent = t(fo); }
      sf.setAttribute('data-l', lang());
    }
    var sp = uno('#pvl-bk-parcela');
    if (sp && sp.getAttribute('data-l') !== lang()) {
      for (var j = 0; j < sp.options.length; j++) { var po = PARCELAS[sp.options[j].value]; if (po) sp.options[j].textContent = t(po); }
      sp.setAttribute('data-l', lang());
    }
    pintarGama();
    pintarPanel();
    pintarAprobada();
    pintarCambio();
    var po2 = uno('#pvl-bk-prestamo-out'); if (po2 && prestamo && (po2.hidden || po2.getAttribute('data-l') !== lang())) pintarPrestamo();
    var ho = uno('#pvl-bk-hipoteca-out'); if (ho && hipoteca && (ho.hidden || ho.getAttribute('data-l') !== lang())) pintarHipoteca();
    var ex = uno('#pvl-bk-extracto'); if (ex && !ex.hidden && ex.getAttribute('data-l') !== lang()) pintarExtracto();
  }, 500);
})();
