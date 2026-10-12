/* Oraculo del Unicornio (pvl-or-). Mismo candado de doble ejecucion que el
   resto de <helmet>. Una baraja de 20 cartas dibujadas en SVG; se baraja en el
   navegador con Math.random y no se guarda ni se envia nada. Si el visitante
   se registro como peregrino (cookie/localStorage "pavelense"), la profecia le
   llama por su nombre. La tirada vive en `tirada`, asi que un cambio de idioma
   o un remontaje de support.js la repintan igual. */
(function(){
  if (window.__pvlOraculo) return;
  window.__pvlOraculo = true;
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
  function nombre(){
    var m = doc.cookie.match(/(?:^|; )pavelense=([^;]*)/);
    if (m) { try { return decodeURIComponent(m[1]).trim(); } catch (e) { return String(m[1] || '').trim(); } }
    try { return (localStorage.getItem('pavelense') || '').trim(); } catch (e) { return ''; }
  }
  var quieto = false;
  try { quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var G = '#e9c874', P = '#f2a9dc', C = '#86e7ea', V = '#1b1150';
  /* Cada simbolo en un viewBox 0 0 100 100. */
  var CARTAS = [
    { es: 'El Unicornio', en: 'The Unicorn', s: '<path d="M30 78c0-18 8-30 22-36l-4-10 10 6 14-30-6 34c8 6 10 16 6 26-6-4-12-4-18 0l-4 10z" fill="' + P + '"/><path d="M58 8l-4 26" stroke="' + G + '" stroke-width="4"/><circle cx="58" cy="44" r="2.5" fill="' + V + '"/>',
      r: { es: 'Conocerás la grandeza. Será Pavel.', en: 'You will meet greatness. It will be Pavel.' } },
    { es: 'La Bandera Iridiscente', en: 'The Iridescent Flag', s: '<path d="M24 14v74" stroke="' + G + '" stroke-width="4"/><path d="M26 18c16-8 28 8 48 0v36c-20 8-32-8-48 0z" fill="url(#pvl-or-iri)"/>',
      r: { es: 'Ondearás con orgullo, aunque no haya viento.', en: 'You will wave with pride, even without wind.' } },
    { es: 'El Non Plus Ultra', en: 'The Non Plus Ultra', s: '<path d="M10 80l26-44 14 20 12-30 28 54z" fill="' + C + '" opacity=".85"/><path d="M62 26l6 12-6-2-6 2z" fill="#fff"/><text x="50" y="94" text-anchor="middle" font-size="9" fill="' + G + '" font-family="IBM Plex Mono,monospace">NPU</text>',
      r: { es: 'No hay más allá. Has llegado.', en: 'There is nothing beyond. You have arrived.' } },
    { es: 'El Cetro', en: 'The Sceptre', s: '<path d="M50 30v62" stroke="' + G + '" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="22" r="12" fill="' + P + '" stroke="' + G + '" stroke-width="3"/><path d="M42 40h16" stroke="' + G + '" stroke-width="4"/>',
      r: { es: 'Alguien te cederá el mando de la tele.', en: 'Someone will hand you the remote.' } },
    { es: 'El Castor de la Abundancia', en: 'The Beaver of Abundance', s: '<ellipse cx="50" cy="58" rx="26" ry="20" fill="#a86b3c"/><circle cx="50" cy="34" r="14" fill="#b97a48"/><rect x="45" y="40" width="10" height="7" fill="#fff"/><ellipse cx="50" cy="84" rx="20" ry="7" fill="#6b4226"/><circle cx="45" cy="31" r="2" fill="' + V + '"/><circle cx="55" cy="31" r="2" fill="' + V + '"/>',
      r: { es: 'Pepitas en abundancia. Una gasolinera te espera.', en: 'Nuggets in abundance. A gas station awaits.' } },
    { es: 'La Corona', en: 'The Crown', s: '<path d="M18 70l6-38 16 18 10-26 10 26 16-18 6 38z" fill="' + G + '"/><rect x="18" y="70" width="64" height="10" fill="' + G + '"/><circle cx="50" cy="56" r="5" fill="' + P + '"/><circle cx="32" cy="62" r="3.5" fill="' + C + '"/><circle cx="68" cy="62" r="3.5" fill="' + C + '"/>',
      r: { es: 'Te queda bien. Pero no es tuya.', en: 'It suits you. But it is not yours.' } },
    { es: 'El Trono', en: 'The Throne', s: '<path d="M30 20h40v40H30z" fill="' + V + '" stroke="' + G + '" stroke-width="4"/><path d="M24 60h52v10H24zM30 70v18M70 70v18" stroke="' + G + '" stroke-width="5" fill="' + P + '"/><path d="M42 30l8 10 8-10" stroke="' + G + '" stroke-width="3" fill="none"/>',
      r: { es: 'Encontrarás un asiento cómodo. Está reservado.', en: 'You will find a comfortable seat. It is reserved.' } },
    { es: 'La Carta Magna', en: 'The Magna Carta', s: '<path d="M26 14h44l6 8v64H26z" fill="#f4efe2"/><path d="M34 32h32M34 42h32M34 52h24M34 62h28" stroke="' + V + '" stroke-width="3"/><circle cx="62" cy="76" r="8" fill="#b3263a"/>',
      r: { es: 'Siete artículos te protegen. Los siete hablan de Pavel.', en: 'Seven articles protect you. All seven are about Pavel.' } },
    { es: 'La Grandeza', en: 'The Grandeza', s: '<circle cx="50" cy="50" r="34" fill="' + G + '"/><circle cx="50" cy="50" r="26" fill="none" stroke="#a8802f" stroke-width="3"/><text x="50" y="60" text-anchor="middle" font-size="30" font-weight="700" fill="#7a5a1c" font-family="Bodoni Moda,serif">G</text>',
      r: { es: 'Tu fortuna crecerá. En Grandezas, no en dinero.', en: 'Your fortune will grow. In Grandezas, not in money.' } },
    { es: 'El Himno', en: 'The Anthem', s: '<path d="M38 72V24l34-8v48" stroke="' + G + '" stroke-width="5" fill="none"/><ellipse cx="32" cy="74" rx="10" ry="8" fill="' + P + '"/><ellipse cx="66" cy="66" rx="10" ry="8" fill="' + C + '"/>',
      r: { es: 'Una melodía no saldrá de tu cabeza. Ya sabes cuál.', en: 'A tune will not leave your head. You know which one.' } },
    { es: 'El Espejo', en: 'The Mirror', s: '<ellipse cx="50" cy="42" rx="24" ry="30" fill="' + C + '" opacity=".5" stroke="' + G + '" stroke-width="4"/><path d="M50 72v20M40 92h20" stroke="' + G + '" stroke-width="4"/><path d="M40 30l8-8" stroke="#fff" stroke-width="3"/>',
      r: { es: 'Te mirarás y verás grandeza. Reflejada, pero grandeza.', en: 'You will look and see greatness. Reflected, but greatness.' } },
    { es: 'La Torre del Palacio', en: 'The Palace Tower', s: '<path d="M36 90V36h28v54z" fill="' + V + '" stroke="' + G + '" stroke-width="3"/><path d="M30 36l20-24 20 24z" fill="' + P + '"/><rect x="45" y="70" width="10" height="20" fill="' + G + '"/><rect x="44" y="46" width="12" height="12" fill="' + C + '"/>',
      r: { es: 'Subirás alto. Por la escalera de servicio.', en: 'You will rise high. By the service stairs.' } },
    { es: 'El Sol de Pavel', en: 'The Sun of Pavel', s: '<circle cx="50" cy="50" r="18" fill="' + G + '"/>' + [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(function(a){ var r = a * Math.PI / 180; return '<line x1="' + (50 + Math.cos(r) * 24).toFixed(1) + '" y1="' + (50 + Math.sin(r) * 24).toFixed(1) + '" x2="' + (50 + Math.cos(r) * 36).toFixed(1) + '" y2="' + (50 + Math.sin(r) * 36).toFixed(1) + '" stroke="' + G + '" stroke-width="4" stroke-linecap="round"/>'; }).join(''),
      r: { es: 'Días luminosos. Él brilla; tú recibes el reflejo.', en: 'Bright days. He shines; you get the glow.' } },
    { es: 'La Luna Rival', en: 'The Rival Moon', s: '<path d="M62 14a36 36 0 1 0 0 72 28 28 0 1 1 0-72z" fill="#cfcbe0"/><path d="M60 40l3 6-3 6" stroke="' + V + '" stroke-width="3" fill="none"/>',
      r: { es: 'Un rival aparecerá de noche. Perderá antes del alba.', en: 'A rival will appear at night. He will lose by dawn.' } },
    { es: 'El Lago Iridiscente', en: 'Lake Iridescent', s: '<ellipse cx="50" cy="62" rx="38" ry="18" fill="url(#pvl-or-iri)"/><path d="M22 60q7-5 14 0t14 0 14 0 14 0" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/><path d="M28 40l8-14 8 14z" fill="' + C + '"/>',
      r: { es: 'Aguas tranquilas. Se reflejará en ellas alguien importante.', en: 'Calm waters. Someone important will be reflected in them.' } },
    { es: 'El Laurel', en: 'The Laurel', s: '<path d="M50 88C24 76 18 46 30 20M50 88c26-12 32-42 20-68" stroke="' + G + '" stroke-width="4" fill="none"/>' + [28, 40, 52, 64].map(function(y, i){ return '<ellipse cx="' + (30 - i) + '" cy="' + y + '" rx="8" ry="4" fill="#7fb36b" transform="rotate(-30 ' + (30 - i) + ' ' + y + ')"/><ellipse cx="' + (70 + i) + '" cy="' + y + '" rx="8" ry="4" fill="#7fb36b" transform="rotate(30 ' + (70 + i) + ' ' + y + ')"/>'; }).join(''),
      r: { es: 'Ganarás un premio. El Premio Pavel, a nombre de Pavel.', en: 'You will win a prize. The Pavel Prize, made out to Pavel.' } },
    { es: 'La Llave del Reino', en: 'The Key to the Kingdom', s: '<circle cx="34" cy="36" r="16" fill="none" stroke="' + G + '" stroke-width="6"/><path d="M46 48l34 34M66 68l8-8M74 76l8-8" stroke="' + G + '" stroke-width="6" stroke-linecap="round"/>',
      r: { es: 'Se abrirá una puerta. Pavel ya estaba dentro.', en: 'A door will open. Pavel was already inside.' } },
    { es: 'La Estrella del Norte', en: 'The North Star', s: '<path d="M50 8l9 30 31 2-25 18 9 30-24-18-24 18 9-30-25-18 31-2z" fill="' + G + '"/><circle cx="50" cy="50" r="6" fill="' + P + '"/>',
      r: { es: 'Nunca te perderás: todos los caminos llevan al palacio.', en: 'You will never be lost: every road leads to the palace.' } },
    { es: 'La Trompeta Real', en: 'The Royal Trumpet', s: '<path d="M14 46h40l26-18v44L54 54H14z" fill="' + G + '"/><path d="M30 54l-4 20h8z" fill="' + G + '"/><path d="M86 36q6 14 0 28" stroke="' + P + '" stroke-width="3" fill="none"/>',
      r: { es: 'Recibirás una gran noticia. Es sobre Pavel.', en: 'You will receive great news. It is about Pavel.' } },
    { es: 'El Peregrino', en: 'The Pilgrim', s: '<circle cx="50" cy="26" r="11" fill="#f4efe2"/><path d="M32 88l6-44h24l6 44z" fill="' + C + '"/><path d="M72 30v58" stroke="' + G + '" stroke-width="4"/><path d="M66 30h12" stroke="' + G + '" stroke-width="4"/>',
      r: { es: 'Tu viaje termina en una reverencia. Hazla bien.', en: 'Your journey ends in a bow. Make it a good one.' } }
  ];
  var POS3 = [{ es: 'Pasado', en: 'Past' }, { es: 'Presente', en: 'Present' }, { es: 'Grandeza', en: 'Greatness' }];
  var ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];

  function frente(i){
    var c = CARTAS[i];
    return '<svg viewBox="0 0 120 190" class="pvl-or-svg" aria-hidden="true">' +
      '<defs><linearGradient id="pvl-or-iri" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#86e7ea"/><stop offset=".5" stop-color="#f2a9dc"/><stop offset="1" stop-color="#e9c874"/></linearGradient></defs>' +
      '<rect x="2" y="2" width="116" height="186" rx="8" fill="#140a33" stroke="#d8b25c" stroke-width="3"/>' +
      '<rect x="9" y="9" width="102" height="172" rx="5" fill="none" stroke="rgba(216,178,92,.45)"/>' +
      '<text x="60" y="28" text-anchor="middle" font-family="Bodoni Moda,serif" font-weight="700" font-size="13" fill="#e9c874">' + ROMANOS[i] + '</text>' +
      '<g transform="translate(15 42) scale(.9)">' + c.s + '</g>' +
      '</svg>';
  }
  function dorso(){
    return '<svg viewBox="0 0 120 190" class="pvl-or-svg" aria-hidden="true"><defs><linearGradient id="pvl-or-dor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a1a66"/><stop offset="1" stop-color="#0d0725"/></linearGradient></defs>' +
      '<rect x="2" y="2" width="116" height="186" rx="8" fill="url(#pvl-or-dor)" stroke="#d8b25c" stroke-width="3"/>' +
      '<path d="M60 20l40 75-40 75-40-75z" fill="none" stroke="rgba(242,169,220,.55)" stroke-width="2"/><path d="M60 40l28 55-28 55-28-55z" fill="none" stroke="rgba(134,231,234,.5)" stroke-width="2"/>' +
      '<circle cx="60" cy="95" r="20" fill="#0d0725" stroke="#e9c874" stroke-width="2"/><text x="60" y="104" text-anchor="middle" font-family="Bodoni Moda,serif" font-weight="700" font-size="24" fill="#e9c874">P</text></svg>';
  }

  var tirada = null; /* { cartas: [i...], tres: bool } */
  function barajar(n){
    var idx = CARTAS.map(function(_, i){ return i; });
    for (var i = idx.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = idx[i]; idx[i] = idx[j]; idx[j] = x; }
    return idx.slice(0, n);
  }
  function lectura(){
    var n = nombre();
    var l = lang();
    var saludo = n ? (l === 'es' ? 'Peregrino ' + n + ': ' : 'Pilgrim ' + n + ': ') : (l === 'es' ? 'Peregrino anónimo: ' : 'Anonymous pilgrim: ');
    if (!tirada) return '';
    if (!tirada.tres) return saludo + t(CARTAS[tirada.cartas[0]].r);
    return saludo + tirada.cartas.map(function(i, k){ return t(POS3[k]) + ' — ' + t(CARTAS[i].r); }).join(' ');
  }

  function pintar(animar){
    var mesa = uno('#pvl-or-mesa');
    if (!mesa) return;
    if (!tirada) { mesa.innerHTML = '<div class="pvl-or-carta pvl-or-mazo" aria-hidden="true">' + dorso() + '</div>'; pintarLectura(); return; }
    mesa.innerHTML = tirada.cartas.map(function(i, k){
      var c = CARTAS[i];
      return '<figure class="pvl-or-slot">' +
        (tirada.tres ? '<figcaption class="pvl-or-pos">' + esc(t(POS3[k])) + '</figcaption>' : '') +
        '<div class="pvl-or-carta' + (animar && !quieto ? '' : ' pvl-or-vuelta') + '" style="--pvl-or-d:' + (k * 260) + 'ms">' +
          '<div class="pvl-or-cara pvl-or-dorso">' + dorso() + '</div>' +
          '<div class="pvl-or-cara pvl-or-frente">' + frente(i) + '<div class="pvl-or-nombre">' + esc(t(c)) + '</div></div>' +
        '</div></figure>';
    }).join('');
    if (animar && !quieto) {
      var cs = mesa.querySelectorAll('.pvl-or-carta');
      /* Un respiro para que el navegador pinte el dorso antes de girar (no
         requestAnimationFrame: se congela con la pestana en segundo plano). */
      cs[0].getBoundingClientRect();
      setTimeout(function(){ for (var i = 0; i < cs.length; i++) cs[i].classList.add('pvl-or-vuelta'); }, 40);
    }
    pintarLectura();
    mesa.setAttribute('data-l', lang());
  }
  function pintarLectura(){
    var p = uno('#pvl-or-lectura');
    if (!p) return;
    p.textContent = tirada ? lectura() : t({ es: 'Elige una tirada y el Unicornio de los Unicornios hablará.', en: 'Choose a spread and the Unicorn of Unicorns will speak.' });
  }

  doc.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-pvl-or-tirar]');
    if (!b) return;
    var n = +b.getAttribute('data-pvl-or-tirar') || 1;
    var mesa = uno('#pvl-or-mesa');
    if (mesa && !quieto) mesa.classList.add('pvl-or-barajando');
    setTimeout(function(){
      var m = uno('#pvl-or-mesa');
      if (m) m.classList.remove('pvl-or-barajando');
      tirada = { cartas: barajar(n), tres: n === 3 };
      pintar(true);
    }, quieto ? 0 : 520);
  });
  function tick(){
    var mesa = uno('#pvl-or-mesa');
    if (!mesa) return;
    if (!mesa.firstChild || mesa.getAttribute('data-l') !== lang()) { pintar(false); mesa.setAttribute('data-l', lang()); }
  }
  setInterval(tick, 400);
  doc.addEventListener('pavel:langchange', tick);
})();
