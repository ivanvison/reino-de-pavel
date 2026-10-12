/* Recetario real (pvl-rec-). Mismo candado de doble ejecucion que el resto de
   <helmet>. A partir del plato que escribe el visitante se compone una receta
   pomposa con bancos de palabras paralelos (el mismo indice da la misma pieza
   en espanol y en ingles), sembrados con un hash del plato: el mismo plato,
   la misma receta. Todo en el navegador; nada se guarda ni se envia. */
(function(){
  if (window.__pvlRecetario) return;
  window.__pvlRecetario = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function uno(sel){
    var els = doc.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function prng(seed){
    return function(){
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var r = Math.imul(seed ^ seed >>> 15, 1 | seed);
      r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r;
      return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
  }
  function hash(s){
    var h = 0x811c9dc5;
    s = String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h;
  }

  var TITULO = [
    { es: function(p){ return p + ' a la Grandeza'; }, en: function(p){ return p + ' à la Grandeur'; } },
    { es: function(p){ return p + ' del Non Plus Ultra'; }, en: function(p){ return p + ' Non Plus Ultra'; } },
    { es: function(p){ return p + ' del Palacio Iridiscente'; }, en: function(p){ return p + ' from the Iridescent Palace'; } },
    { es: function(p){ return p + ' como lo soñó Pavel'; }, en: function(p){ return p + ' as Pavel Dreamt It'; } },
    { es: function(p){ return p + ', Edición Real del Unicornio'; }, en: function(p){ return p + ', Royal Unicorn Edition'; } }
  ];
  var INGREDIENTES = [
    { es: 'pizca de polvo de oro de 24 quilates', en: 'pinch of 24-carat gold dust' },
    { es: 'puñado de pepitas de castor del Buc-ee’s', en: 'handful of Buc-ee’s beaver nuggets' },
    { es: 'gotas de agua del Lago Iridiscente', en: 'drops of Lake Iridescent water' },
    { es: 'hebras de crin de unicornio (donadas voluntariamente)', en: 'strands of unicorn mane (donated willingly)' },
    { es: 'cucharadas de aplauso batido', en: 'tablespoons of whipped applause' },
    { es: 'hojas de laurel del Premio Pavel', en: 'bay leaves from the Pavel Prize' },
    { es: 'tazas de nieve del Monte Non Plus Ultra', en: 'cups of Mount Non Plus Ultra snow' },
    { es: 'suspiros de admiración, a temperatura ambiente', en: 'sighs of admiration, at room temperature' },
    { es: 'Grandezas de mantequilla real', en: 'Grandezas of royal butter' },
    { es: 'compases del himno, picados finos', en: 'bars of the anthem, finely chopped' },
    { es: 'pétalos de rosa iridiscente', en: 'iridescent rose petals' },
    { es: 'gramos de humildad (opcional; Pavel nunca la usa)', en: 'grams of humility (optional; Pavel never uses it)' }
  ];
  var PASOS = [
    { es: function(p){ return 'Precaliente el horno a la temperatura exacta del entusiasmo nacional (unos 250 °G).'; }, en: function(p){ return 'Preheat the oven to the exact temperature of national enthusiasm (about 250 °G).'; } },
    { es: function(p){ return 'Presente ' + p + ' ante un retrato de Pavel y espere a que se sienta honrado.'; }, en: function(p){ return 'Present the ' + p + ' to a portrait of Pavel and wait until it feels honoured.'; } },
    { es: function(p){ return 'Mezcle todo en un cuenco de oro, siempre en el sentido de las agujas del reloj real.'; }, en: function(p){ return 'Mix everything in a golden bowl, always clockwise by the royal clock.'; } },
    { es: function(p){ return 'Añada las pepitas de castor de una en una, anunciando cada una por su nombre.'; }, en: function(p){ return 'Add the beaver nuggets one at a time, announcing each by name.'; } },
    { es: function(p){ return 'Deje reposar mientras suena «El Ruir del Unicornio». Si termina, vuelva a empezar.'; }, en: function(p){ return 'Let it rest while «El Ruir del Unicornio» plays. If it ends, start again.'; } },
    { es: function(p){ return 'Glasee ' + p + ' con iridiscencia hasta que refleje su propia grandeza.'; }, en: function(p){ return 'Glaze the ' + p + ' with iridescence until it reflects its own greatness.'; } },
    { es: function(p){ return 'Hornee hasta que esté dorado. Si no se dora, explíquele quién es Pavel.'; }, en: function(p){ return 'Bake until golden. If it will not brown, explain to it who Pavel is.'; } },
    { es: function(p){ return 'Emplate sobre vajilla con el escudo de los tres unicornios, centrado al milímetro.'; }, en: function(p){ return 'Plate on china bearing the three-unicorn crest, centred to the millimetre.'; } },
    { es: function(p){ return 'Sirva de pie y con una reverencia. Los comensales también se levantan.'; }, en: function(p){ return 'Serve standing, with a bow. The diners rise as well.'; } }
  ];
  var NOTAS = [
    { es: 'Nota del Chef Real: si el plato sale mal, la culpa es del horno, que ha sido desterrado.', en: 'Royal Chef’s note: if the dish fails, the oven is to blame, and has been exiled.' },
    { es: 'Nota del Chef Real: Pavel lo probó una vez y dijo «bien». Desde entonces es Patrimonio del Reino.', en: 'Royal Chef’s note: Pavel tasted it once and said "fine". It has been a Heritage of the Kingdom ever since.' },
    { es: 'Nota del Chef Real: marida con agua del Lago Iridiscente o, en su defecto, con cualquier cosa servida en copa de oro.', en: 'Royal Chef’s note: pairs with Lake Iridescent water or, failing that, anything served in a golden goblet.' },
    { es: 'Nota del Chef Real: se puede congelar, pero no se recomienda: la grandeza no se recalienta.', en: 'Royal Chef’s note: it can be frozen, but this is not advised: greatness does not reheat.' }
  ];

  var plato = null;
  function receta(p){
    var r = prng(hash(p)), l = lang();
    function de(a){ return a[Math.floor(r() * a.length)]; }
    var ing = INGREDIENTES.slice().sort(function(){ return r() - .5; }).slice(0, 6);
    var cantidades = [1, 2, 3, 7, 12, 99];
    var pasos = PASOS.slice().sort(function(){ return r() - .5; }).slice(0, 5);
    var tit = de(TITULO), nota = de(NOTAS);
    var raciones = 1 + Math.floor(r() * 3);
    return {
      titulo: tit[l](p.charAt(0).toUpperCase() + p.slice(1)),
      meta: (l === 'es' ? 'Para ' : 'Serves ') + raciones + (l === 'es' ? (raciones === 1 ? ' soberano' : ' soberanos (uno de verdad)') : (raciones === 1 ? ' sovereign' : ' sovereigns (one of them real)')) + ' · ' + (l === 'es' ? 'Tiempo: 0 minutos; Pavel no espera' : 'Time: 0 minutes; Pavel does not wait') + ' · ' + (l === 'es' ? 'Dificultad: real' : 'Difficulty: royal'),
      ing: [(l === 'es' ? '1 ' + p + ' de la mejor calidad (la de Pavel)' : '1 ' + p + ' of the finest quality (Pavel’s)')].concat(ing.map(function(x, i){ return cantidades[i] + ' ' + x[l]; })),
      pasos: pasos.map(function(x){ return x[l](p); }),
      nota: nota[l]
    };
  }
  function pintar(){
    var out = uno('#pvl-rec-out');
    if (!out) return;
    if (!plato) { out.hidden = true; return; }
    var rc = receta(plato), l = lang();
    out.hidden = false;
    out.innerHTML = '<div class="pvl-rec-kicker">' + (l === 'es' ? 'RECETARIO DE LA COCINA REAL · FICHA N.º ' : 'ROYAL KITCHEN RECIPE BOOK · CARD NO. ') + String(hash(plato) % 1000).padStart(3, '0') + '</div>' +
      '<h3>' + esc(rc.titulo) + '</h3><p class="pvl-rec-meta">' + esc(rc.meta) + '</p>' +
      '<div class="pvl-rec-cols"><div><h4>' + (l === 'es' ? 'Ingredientes' : 'Ingredients') + '</h4><ul>' + rc.ing.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<div><h4>' + (l === 'es' ? 'Elaboración' : 'Method') + '</h4><ol>' + rc.pasos.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></div></div>' +
      '<p class="pvl-rec-nota">' + esc(rc.nota) + '</p>';
    out.setAttribute('data-l', l);
  }
  doc.addEventListener('submit', function(e){
    if (!e.target || e.target.id !== 'pvl-rec-form') return;
    e.preventDefault();
    var inp = e.target.querySelector('#pvl-rec-plato');
    var p = inp ? inp.value.replace(/\s+/g, ' ').trim().slice(0, 48) : '';
    if (!p) { if (inp) inp.focus(); return; }
    plato = p;
    pintar();
  });
  setInterval(function(){
    var out = uno('#pvl-rec-out');
    if (out && plato && (out.hidden || out.getAttribute('data-l') !== lang())) pintar();
  }, 400);
})();
