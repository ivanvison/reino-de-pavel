/* Mapa del Reino (pvl-map-). Mismo candado de doble ejecucion que el resto
   de <helmet>. El pais entero es un SVG generado aqui: sin teselas, sin API
   de mapas, sin origenes nuevos. Se pinta dentro de #pvl-map-root solo cuando
   el contenedor ya esta montado (ver montado() en el bloque del decreto) y se
   vuelve a pintar si support.js lo remonta. Vistas: mapa, satelite, relieve y
   real; capas: trafico de unicornios; modo Street View con panoramas de 360.
   Las etiquetas se repintan solo si el idioma cambia de verdad, porque
   pavel:langchange se dispara cada 400 ms. */
(function(){
  if (window.__pvlMap) return;
  window.__pvlMap = true;
  var doc = document;
  var NS = 'http://www.w3.org/2000/svg';
  var W = 2000, H = 1400;
  function L(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function t(o){ return o[L()] || o.en; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Geografia ---------- */
  function suave(pts, cerrado){
    /* Catmull-Rom -> Bezier, para costas y rios sin esquinas. */
    var n = pts.length, d = 'M' + pts[0][0] + ' ' + pts[0][1];
    var lim = cerrado ? n : n - 1;
    for (var i = 0; i < lim; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      if (!cerrado) { if (i === 0) p0 = p1; if (i + 2 >= n) p3 = p2; }
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += 'C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0] + ' ' + p2[1];
    }
    return d + (cerrado ? 'Z' : '');
  }
  var COSTA = [[300,520],[360,380],[480,300],[620,250],[760,200],[900,230],[1020,180],[1160,210],[1300,190],[1440,250],[1560,330],[1680,420],[1760,560],[1740,700],[1790,830],[1720,960],[1600,1050],[1460,1120],[1300,1180],[1150,1150],[1020,1220],[880,1190],[740,1210],[600,1150],[480,1060],[380,960],[300,840],[250,700]];
  var ISLAS = [
    [[1855,235],[1900,228],[1915,262],[1880,290],[1848,270]],
    [[150,1130],[200,1120],[215,1160],[175,1185],[140,1165]],
    [[235,1215],[275,1205],[290,1240],[255,1262],[228,1245]],
    [[110,1245],[140,1240],[150,1268],[118,1282]],
    [[1020,1300],[1060,1290],[1110,1310],[1090,1340],[1040,1345]]
  ];
  var LAGO = [[720,630],[760,575],[840,560],[915,595],[925,660],[870,710],[780,712],[728,680]];
  var BOSQUE = [[330,560],[420,500],[560,520],[640,600],[650,760],[600,880],[480,930],[360,880],[300,760]];
  var DESIERTO = [[1330,470],[1500,430],[1660,500],[1720,640],[1720,820],[1640,930],[1480,960],[1360,880],[1320,700]];
  var RIOS = [
    [[1000,380],[960,450],[905,520],[850,570]],
    [[760,705],[700,800],[640,900],[600,1000],[590,1150]],
    [[1150,385],[1190,480],[1210,600],[1160,760],[1090,900],[1045,1030],[1030,1170]]
  ];
  var PICOS = [[640,330,60],[720,300,80],[800,290,90],[880,300,110],[1000,280,150],[1100,300,110],[1190,290,90],[1270,320,70],[1350,330,55]];
  var CIUDAD = { x: 1000, y: 720, r: 95 };
  var CARRETERAS = [
    { id: 'u1', cls: 'hw', ref: 'U-1', pts: [[300,560],[450,760],[640,750],[860,760],[1000,720],[1180,800],[1400,790],[1540,760],[1700,700]] },
    { id: 'u2', cls: 'hw', ref: 'U-2', pts: [[720,420],[860,480],[1000,560],[1000,720],[1040,880],[1060,1000],[1030,1110]] },
    { id: 'u3', cls: 'hw', ref: 'U-3', pts: [[1000,720],[1120,820],[1260,900]] },
    { id: 's1', cls: 'sec', pts: [[720,420],[800,380],[880,400],[940,360],[1000,340]] },
    { id: 's2', cls: 'sec', pts: [[1540,760],[1600,880],[1520,1000],[1400,1080],[1260,900]] },
    { id: 's3', cls: 'sec', pts: [[450,760],[420,900],[520,1040],[700,1120],[880,1150],[1030,1110]] },
    { id: 's4', cls: 'sec', pts: [[1700,700],[1760,560],[1800,430],[1830,330]] }
  ];

  /* ---------- Lugares ---------- */
  var B = { es: 'Gasolinera, tienda, embajada', en: 'Fuel, store, embassy' };
  var POIS = [
    { id: 'palacio', x: 1000, y: 700, ico: '🏰', big: 1, n: { es: 'Palacio de la Grandeza', en: 'Palace of Greatness' }, k: { es: 'Residencia oficial · Plaza Unicornio 1', en: 'Official residence · Unicorn Square 1' }, d: { es: 'Sede del Soberano y kilómetro cero del universo. Todas las rutas empiezan y terminan aquí.', en: 'Seat of the Sovereign and kilometre zero of the universe. Every route starts and ends here.' }, sv: 'palacio' },
    { id: 'biblioteca', x: 965, y: 752, ico: '📚', n: { es: 'Biblioteca Real', en: 'Royal Library' }, k: { es: 'Biblioteca', en: 'Library' }, d: { es: 'XII volúmenes, todos de derecha a izquierda. Préstamos solo en escritura pavelense.', en: 'XII volumes, all right to left. Loans in Pavelian script only.' }, href: 'biblioteca.html' },
    { id: 'estadio', x: 1090, y: 785, ico: '🏟️', n: { es: 'Estadio del Maratón', en: 'Marathon Stadium' }, k: { es: 'Estadio · aforo: 1', en: 'Stadium · capacity: 1' }, d: { es: 'Meta oficial de los XLII km de Filípides. Siempre lleno: Pavel ocupa todas las butacas en espíritu.', en: 'Official finish line of Pheidippides’ XLII km. Always full: Pavel fills every seat in spirit.' } },
    { id: 'monte', x: 1000, y: 280, ico: '🏔️', big: 1, n: { es: 'Monte Non Plus Ultra', en: 'Mount Non Plus Ultra' }, k: { es: 'Cumbre · 8.849 m (uno más que el Everest)', en: 'Summit · 8,849 m (one more than Everest)' }, d: { es: 'El punto más alto del planeta, por decreto. En la cima hay una bandera, un mirador y, cómo no, un Buc-ee’s.', en: 'The highest point on the planet, by decree. At the top: a flag, a lookout and, naturally, a Buc-ee’s.' }, sv: 'monte' },
    { id: 'lago', x: 820, y: 640, ico: '🌈', n: { es: 'Lago Iridiscente', en: 'Lake Iridescent' }, k: { es: 'Lago · agua de siete colores', en: 'Lake · seven-colour water' }, d: { es: 'Sus aguas cambian de color según el humor del Soberano. Hoy: magnánimo.', en: 'Its waters change colour with the Sovereign’s mood. Today: magnanimous.' }, sv: 'lago' },
    { id: 'bosque', x: 470, y: 640, ico: '🌲', n: { es: 'Bosque de Descartes', en: 'Descartes Forest' }, k: { es: 'Parque nacional', en: 'National park' }, d: { es: 'Cada árbol duda de todo menos de Pavel. Se recomienda pensar en voz baja.', en: 'Every tree doubts everything except Pavel. Visitors are asked to think quietly.' } },
    { id: 'desierto', x: 1560, y: 600, ico: '🏜️', n: { es: 'Desierto de los Rivales', en: 'Desert of Rivals' }, k: { es: 'Desierto · rivales censados: 0', en: 'Desert · rivals on record: 0' }, d: { es: 'Kilómetros de arena donde viven todos los rivales de Pavel. Está completamente vacío.', en: 'Miles of sand where all of Pavel’s rivals live. It is completely empty.' }, sv: 'desierto' },
    { id: 'aeropuerto', x: 1260, y: 900, ico: '✈️', n: { es: 'Aeropuerto Internacional Pavel I', en: 'Pavel I International Airport' }, k: { es: 'Aeropuerto · código PVL', en: 'Airport · code PVL' }, d: { es: 'Una sola puerta de embarque, la G1 de Grandeza. Los unicornios tienen prioridad de pista.', en: 'A single gate, G1 for Greatness. Unicorns have runway priority.' } },
    { id: 'puerto', x: 1030, y: 1135, ico: '⚓', n: { es: 'Puerto Grandeza', en: 'Port Greatness' }, k: { es: 'Puerto y ciudad costera', en: 'Port and coastal town' }, d: { es: 'Por aquí salen las exportaciones del Reino: grandeza, en contenedores de tamaño estándar.', en: 'The Kingdom’s exports leave from here: greatness, in standard-size containers.' }, sv: 'puerto' },
    { id: 'faro', x: 292, y: 545, ico: '🗼', n: { es: 'Faro de la Grandeza', en: 'Lighthouse of Greatness' }, k: { es: 'Faro', en: 'Lighthouse' }, d: { es: 'Su luz no guía barcos: señala dónde está Pavel, por si alguien lo olvidara.', en: 'Its light guides no ships: it shows where Pavel is, in case anyone forgets.' } },
    { id: 'cascada', x: 1185, y: 470, ico: '💧', n: { es: 'Cascada del Himno', en: 'Anthem Falls' }, k: { es: 'Cascada', en: 'Waterfall' }, d: { es: 'El agua cae en compás de cuatro por cuatro, al ritmo de «El Ruir del Unicornio».', en: 'The water falls in four-four time, to the beat of “The Roar of the Unicorn”.' } },
    { id: 'rival', x: 1880, y: 258, ico: '🏝️', n: { es: 'Isla del Rival', en: 'Rival Island' }, k: { es: 'Isla · pendiente de reconquista', en: 'Island · pending reconquest' }, d: { es: 'Deshabitada. Un puente en obras desde 2019 la unirá al Reino «muy pronto».', en: 'Uninhabited. A bridge under construction since 2019 will join it to the Kingdom “very soon”.' } },
    { id: 'san-unicornio', x: 720, y: 420, ico: '🦄', n: { es: 'San Unicornio', en: 'San Unicornio' }, k: { es: 'Villa de montaña', en: 'Mountain town' }, d: { es: 'Cuna de todos los unicornios del Reino. Los semáforos son arcoíris.', en: 'Birthplace of every unicorn in the Kingdom. The traffic lights are rainbows.' } },
    { id: 'villa-descartes', x: 450, y: 760, ico: '🏘️', n: { es: 'Villa Descartes', en: 'Villa Descartes' }, k: { es: 'Villa', en: 'Town' }, d: { es: 'Población: piensa, luego existe. Hermanada con Pavelópolis por obligación.', en: 'Population: thinks, therefore is. Twinned with Pavelópolis by obligation.' } },
    { id: 'oasis', x: 1540, y: 760, ico: '🌴', n: { es: 'Oasis del Himno', en: 'Anthem Oasis' }, k: { es: 'Oasis', en: 'Oasis' }, d: { es: 'La única sombra del desierto, con wifi y cobertura total de la grandeza de Pavel.', en: 'The desert’s only shade, with wifi and full coverage of Pavel’s greatness.' } },
    /* Buc-ee's: varios, como se pidio. */
    { id: 'bucees-desierto', x: 1400, y: 790, bucees: 1, big: 1, n: { es: 'Buc-ee’s del Desierto', en: 'Desert Buc-ee’s' }, k: { es: 'El Buc-ee’s más grande del universo conocido · 240 surtidores', en: 'The largest Buc-ee’s in the known universe · 240 pumps' }, d: { es: 'Visible desde el espacio en la vista satélite. Baños declarados patrimonio nacional; las Beaver Nuggets, moneda de curso legal junto a la Grandeza.', en: 'Visible from space in satellite view. Its restrooms are national heritage; Beaver Nuggets are legal tender alongside the Grandeza.' }, sv: 'bucees-desierto' },
    { id: 'bucees-norte', x: 1000, y: 560, bucees: 1, n: { es: 'Buc-ee’s Pavelópolis Norte', en: 'Buc-ee’s Pavelópolis North' }, k: { es: 'Autopista U-2, salida 1', en: 'U-2 highway, exit 1' }, d: { es: 'Última parada antes del Palacio. Los peregrinos llenan el depósito y el alma.', en: 'Last stop before the Palace. Pilgrims fill the tank and the soul.' }, sv: 'bucees-norte' },
    { id: 'bucees-bosque', x: 640, y: 750, bucees: 1, n: { es: 'Buc-ee’s del Bosque', en: 'Forest Buc-ee’s' }, k: { es: 'Autopista U-1', en: 'U-1 highway' }, d: { es: 'Rodeado de árboles que dudan de todo, salvo de la calidad del brisket.', en: 'Surrounded by trees that doubt everything except the brisket.' } },
    { id: 'bucees-puerto', x: 1062, y: 1000, bucees: 1, n: { es: 'Buc-ee’s Puerto Grandeza', en: 'Buc-ee’s Port Greatness' }, k: { es: 'Autopista U-2 · abierto 25 h al día', en: 'U-2 highway · open 25 hours a day' }, d: { es: 'Con muelle propio: los barcos repostan aquí también.', en: 'With its own pier: ships refuel here too.' } },
    { id: 'bucees-cumbre', x: 1035, y: 300, bucees: 1, n: { es: 'Buc-ee’s Cumbre', en: 'Summit Buc-ee’s' }, k: { es: 'A 8.849 m · el más alto del mundo', en: 'At 8,849 m · the highest in the world' }, d: { es: 'Oxígeno embotellado en la sección de bebidas. Los sherpas lo recomiendan.', en: 'Bottled oxygen in the drinks aisle. Sherpas recommend it.' } }
  ];
  var CIUDADES = [
    { x: 1000, y: 842, n: { es: 'PAVELÓPOLIS', en: 'PAVELÓPOLIS' }, cap: 1 },
    { x: 720, y: 455, n: { es: 'San Unicornio', en: 'San Unicornio' } },
    { x: 450, y: 795, n: { es: 'Villa Descartes', en: 'Villa Descartes' } },
    { x: 1030, y: 1170, n: { es: 'Puerto Grandeza', en: 'Port Greatness' } },
    { x: 1540, y: 795, n: { es: 'Oasis del Himno', en: 'Anthem Oasis' } }
  ];
  var REGIONES = [
    { x: 1000, y: 165, n: { es: 'CORDILLERA NON PLUS ULTRA', en: 'NON PLUS ULTRA RANGE' } },
    { x: 470, y: 545, n: { es: 'BOSQUE DE DESCARTES', en: 'DESCARTES FOREST' } },
    { x: 1530, y: 498, n: { es: 'DESIERTO DE LOS RIVALES', en: 'DESERT OF RIVALS' } },
    { x: 1000, y: 1320, n: { es: 'MAR DE LA GRANDEZA', en: 'SEA OF GREATNESS' }, mar: 1 },
    { x: 150, y: 330, n: { es: 'OCÉANO PAVELENSE', en: 'PAVELIAN OCEAN' }, mar: 1 },
    { x: 1660, y: 1260, n: { es: 'RESTO DEL MUNDO (sin interés)', en: 'REST OF THE WORLD (of no interest)' }, mar: 1 }
  ];

  /* ---------- Dibujo del mundo ---------- */
  function mundo(){
    var s = [];
    s.push('<defs>' +
      '<filter id="pvl-map-sat" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse"><feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="5" seed="11" result="r"/>' +
      '<feColorMatrix in="r" type="matrix" values="0 0 0 0 .2  0 0 0 0 .36  0 0 0 0 .14  1.6 -0.6 0 0 -.15" result="g"/>' +
      '<feFlood flood-color="#7a6a3f" result="b"/><feComposite in="g" in2="b" operator="over" result="c"/>' +
      '<feComposite in="c" in2="SourceGraphic" operator="in"/></filter>' +
      '<filter id="pvl-map-satd" filterUnits="userSpaceOnUse" x="0" y="0" width="2000" height="1400"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="3" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 .86  0 0 0 0 .7  0 0 0 0 .45  0 0 0 -1.2 1.1"/><feComposite in2="SourceGraphic" operator="in"/></filter>' +
      '<filter id="pvl-map-satw" filterUnits="userSpaceOnUse" x="-1500" y="-1000" width="5000" height="3400"><feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves="3" seed="2"/><feColorMatrix type="matrix" values="0 0 0 0 .03  0 0 0 0 .16  0 0 0 0 .3  0 0 0 .6 .55"/><feComposite in2="SourceGraphic" operator="in"/></filter>' +
      '<filter id="pvl-map-nubes" filterUnits="userSpaceOnUse" x="-1500" y="-1000" width="5000" height="3400"><feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="4" seed="9"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.4 1.25"/></filter>' +
      '<linearGradient id="pvl-map-iri" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#86e7ea"/><stop offset=".5" stop-color="#f2a9dc"/><stop offset="1" stop-color="#f4e0a8"/></linearGradient>' +
      '<radialGradient id="pvl-map-oro" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#f4e0a8"/><stop offset=".6" stop-color="#d8b25c"/><stop offset="1" stop-color="#8f6f2a"/></radialGradient>' +
      '<pattern id="pvl-map-arena" width="26" height="14" patternUnits="userSpaceOnUse"><path d="M0 10q6.5-6 13 0t13 0" fill="none" stroke="#d9c08a" stroke-width="1.4"/></pattern>' +
      '<pattern id="pvl-map-pinos" width="34" height="30" patternUnits="userSpaceOnUse"><path d="M8 22l6-12 6 12z M24 28l5-10 5 10z" fill="#9fcf95"/></pattern>' +
      '<pattern id="pvl-map-estrellas" width="90" height="90" patternUnits="userSpaceOnUse"><circle cx="12" cy="20" r="1.4" fill="#fff"/><circle cx="60" cy="48" r="1" fill="#ffe8bd"/><circle cx="34" cy="76" r="1.2" fill="#f2a9dc"/><circle cx="80" cy="12" r=".8" fill="#86e7ea"/></pattern>' +
      '<clipPath id="pvl-map-tierra"><path d="' + suave(COSTA, true) + '"/></clipPath>' +
      '</defs>');
    s.push('<rect class="m-mar" x="-4000" y="-4000" width="10000" height="9400"/>');
    s.push('<rect class="m-estrellas" x="-4000" y="-4000" width="10000" height="9400" fill="url(#pvl-map-estrellas)"/>');
    s.push('<rect class="m-sat m-satw" x="-1500" y="-1000" width="5000" height="3400" filter="url(#pvl-map-satw)" fill="#000"/>');
    /* Bajos y oleaje: anillos alrededor de la costa. */
    s.push('<path class="m-bajo" d="' + suave(COSTA, true) + '"/>');
    var tierra = suave(COSTA, true);
    s.push('<path class="m-tierra" d="' + tierra + '"/>');
    ISLAS.forEach(function(p){ s.push('<path class="m-tierra m-isla" d="' + suave(p, true) + '"/>'); });
    s.push('<g class="m-sat"><path d="' + tierra + '" filter="url(#pvl-map-sat)" fill="#000"/>');
    ISLAS.forEach(function(p){ s.push('<path d="' + suave(p, true) + '" filter="url(#pvl-map-sat)" fill="#000"/>'); });
    s.push('<path d="' + suave(DESIERTO, true) + '" filter="url(#pvl-map-satd)" fill="#000"/></g>');
    s.push('<path class="m-bosque" d="' + suave(BOSQUE, true) + '"/>');
    s.push('<path class="m-bosque-pat" d="' + suave(BOSQUE, true) + '" fill="url(#pvl-map-pinos)"/>');
    s.push('<path class="m-desierto" d="' + suave(DESIERTO, true) + '"/>');
    s.push('<path class="m-desierto-pat" d="' + suave(DESIERTO, true) + '" fill="url(#pvl-map-arena)"/>');
    /* Relieve: curvas de nivel alrededor de cada pico, recortadas a la tierra. */
    var rel = '<g class="m-relieve" clip-path="url(#pvl-map-tierra)">';
    PICOS.forEach(function(p){
      for (var k = 6; k >= 1; k--) {
        var rx = p[2] * k * 0.55 + 20, ry = p[2] * k * 0.32 + 12;
        rel += '<ellipse cx="' + p[0] + '" cy="' + (p[1] + 30) + '" rx="' + rx + '" ry="' + ry + '" class="m-nivel m-nivel' + k + '"/>';
      }
    });
    [[470,700,90],[1550,700,60],[1100,1000,50]].forEach(function(p){
      for (var k = 3; k >= 1; k--) rel += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + (p[2] * k) + '" ry="' + (p[2] * k * .6) + '" class="m-nivel m-nivel' + k + '"/>';
    });
    s.push(rel + '</g>');
    /* Montes. */
    var mon = '<g class="m-montes">';
    PICOS.forEach(function(p){
      var x = p[0], y = p[1], h = p[2] * 0.75, w = p[2] * 0.7;
      mon += '<path class="m-monte" d="M' + (x - w) + ' ' + (y + h * .55) + 'L' + x + ' ' + (y - h * .45) + 'L' + (x + w) + ' ' + (y + h * .55) + 'Z"/>' +
        '<path class="m-nieve" d="M' + (x - w * .3) + ' ' + (y - h * .45 + h * .3) + 'L' + x + ' ' + (y - h * .45) + 'L' + (x + w * .3) + ' ' + (y - h * .45 + h * .3) + 'L' + (x + w * .1) + ' ' + (y - h * .45 + h * .22) + 'L' + (x - w * .1) + ' ' + (y - h * .45 + h * .3) + 'Z"/>';
    });
    s.push(mon + '</g>');
    RIOS.forEach(function(r){ s.push('<path class="m-rio" d="' + suave(r, false) + '"/>'); });
    s.push('<path class="m-lago" d="' + suave(LAGO, true) + '"/>');
    /* Ciudad: manzanas en cuadricula dentro de un circulo. */
    var c = '<g class="m-ciudad"><circle cx="' + CIUDAD.x + '" cy="' + CIUDAD.y + '" r="' + CIUDAD.r + '" class="m-urbano"/>';
    for (var gx = -90; gx <= 90; gx += 22) for (var gy = -90; gy <= 90; gy += 22) {
      if (gx * gx + gy * gy < 82 * 82 && !(Math.abs(gx) < 20 && Math.abs(gy + 20) < 20)) c += '<rect class="m-manzana" x="' + (CIUDAD.x + gx - 8) + '" y="' + (CIUDAD.y + gy - 8) + '" width="16" height="16" rx="1.5"/>';
    }
    [[450,760,40],[720,420,34],[1030,1120,38],[1540,760,30]].forEach(function(v){
      c += '<circle cx="' + v[0] + '" cy="' + v[1] + '" r="' + v[2] + '" class="m-urbano"/>';
      for (var a = 0; a < 7; a++) { var ang = a * 0.9, rr = v[2] * .55; c += '<rect class="m-manzana" x="' + (v[0] + Math.cos(ang) * rr - 6) + '" y="' + (v[1] + Math.sin(ang) * rr - 6) + '" width="12" height="12" rx="1"/>'; }
    });
    s.push(c + '</g>');
    /* Pista del aeropuerto. */
    s.push('<g class="m-aero"><rect x="1215" y="925" width="140" height="16" rx="3" transform="rotate(-18 1285 933)" class="m-pista"/></g>');
    /* El Buc-ee's del desierto se ve desde el espacio. */
    s.push('<rect class="m-bucees-techo" x="1366" y="805" width="70" height="34" rx="3"/>');
    /* Carreteras: anillo + autopistas + secundarias. */
    s.push('<g class="m-vias">');
    s.push('<circle class="m-via m-sec" cx="' + CIUDAD.x + '" cy="' + CIUDAD.y + '" r="128" fill="none"/>');
    CARRETERAS.forEach(function(r){
      var d = suave(r.pts, false);
      s.push('<path class="m-via-borde m-' + r.cls + '" d="' + d + '"/><path id="pvl-map-ruta-' + r.id + '" class="m-via m-' + r.cls + '" d="' + d + '"/>');
    });
    s.push('<path class="m-puente" d="M1830 330L1848 295"/>');
    s.push('</g>');
    s.push('<rect class="m-sat m-nubes" x="-1500" y="-1000" width="5000" height="3400" filter="url(#pvl-map-nubes)" fill="#fff"/>');
    s.push('<g id="pvl-map-ruta"></g><g id="pvl-map-trafico"></g>');
    s.push('<g id="pvl-map-etiquetas"></g><g id="pvl-map-pines"></g>');
    return s.join('');
  }

  function etiquetas(){
    var s = '';
    REGIONES.forEach(function(r){ s += '<text class="m-lbl m-region' + (r.mar ? ' m-lbl-mar' : '') + '" x="' + r.x + '" y="' + r.y + '">' + esc(t(r.n)) + '</text>'; });
    CIUDADES.forEach(function(cu){ s += '<text class="m-lbl ' + (cu.cap ? 'm-capital' : 'm-villa') + '" x="' + cu.x + '" y="' + cu.y + '">' + esc(t(cu.n)) + '</text>'; });
    CARRETERAS.forEach(function(r){
      if (!r.ref) return;
      var p = r.pts[Math.floor(r.pts.length / 2) - (r.id === 'u2' ? 1 : 0)];
      s += '<g class="m-escudo" data-x="' + p[0] + '" data-y="' + (p[1] - 2) + '"><rect x="-17" y="-10" width="34" height="20" rx="4"/><text y="4">' + r.ref + '</text></g>';
    });
    return s;
  }

  function pines(){
    var s = '';
    POIS.forEach(function(p){
      var cls = 'm-pin' + (p.bucees ? ' m-pin-bucees' : '') + (p.big ? ' m-pin-big' : '') + (p.sv ? ' m-pin-sv' : '');
      s += '<g class="' + cls + '" data-pvl-poi="' + p.id + '" data-x="' + p.x + '" data-y="' + p.y + '" tabindex="0" role="button" aria-label="' + esc(t(p.n)) + '">';
      if (p.bucees) {
        s += '<path class="m-pin-gota" d="M0 0C-4-8-15-13-15-25a15 15 0 0 1 30 0C15-13 4-8 0 0z"/><circle cy="-25" r="10.5" class="m-pin-bc"/><text y="-21" class="m-pin-b">B</text>';
      } else {
        s += '<path class="m-pin-gota" d="M0 0C-4-8-15-13-15-25a15 15 0 0 1 30 0C15-13 4-8 0 0z"/><text y="-19.5" class="m-pin-ico">' + p.ico + '</text>';
      }
      s += '<circle class="m-pin-sv-dot" cx="0" cy="0" r="9"/>';
      s += '<text class="m-pin-lbl" x="18" y="-20">' + esc(t(p.n)) + '</text></g>';
    });
    return s;
  }

  /* ---------- Estado y camara ---------- */
  var st = { vista: 'mapa', sv: false, trafico: true, cx: 1000, cy: 720, z: 1, sel: null, ruta: null, lang: null };
  var raiz = null, svg = null, vw = 800, vh = 520;

  function escala(){ return Math.min(vw / W, vh / H) * st.z * 1.04; }
  function camara(){
    if (!svg) return;
    var s = escala(), w = vw / s, h = vh / s;
    st.cx = Math.max(w / 2 - 200, Math.min(W - w / 2 + 200, st.cx));
    st.cy = Math.max(h / 2 - 150, Math.min(H - h / 2 + 150, st.cy));
    if (w > W + 400) st.cx = W / 2;
    if (h > H + 300) st.cy = H / 2;
    svg.setAttribute('viewBox', (st.cx - w / 2).toFixed(1) + ' ' + (st.cy - h / 2).toFixed(1) + ' ' + w.toFixed(1) + ' ' + h.toFixed(1));
    /* --k = unidades del mundo por pixel: pines y textos con tamano de pantalla fijo. */
    var k = 1 / s;
    svg.style.setProperty('--k', k);
    var gs = svg.querySelectorAll('[data-x]');
    var ks = k;
    for (var i = 0; i < gs.length; i++) gs[i].setAttribute('transform', 'translate(' + gs[i].getAttribute('data-x') + ' ' + gs[i].getAttribute('data-y') + ') scale(' + ks.toFixed(3) + ')');
    raiz.classList.toggle('pvl-map-z2', st.z >= 1.8);
    raiz.classList.toggle('pvl-map-z4', st.z >= 3.5);
    var esc1 = raiz.querySelector('.pvl-map-escala-txt');
    if (esc1) {
      /* 1 unidad = 0,1 km. La barra mide 80 px. */
      var km = 80 / s * 0.1;
      esc1.textContent = (km >= 1 ? km.toFixed(km < 10 ? 1 : 0) : (km * 1000).toFixed(0)) + (km >= 1 ? ' km' : ' m');
    }
  }
  var anim = null;
  function volar(x, y, z){
    if (anim) cancelAnimationFrame(anim);
    var a = { x: st.cx, y: st.cy, z: st.z }, t0 = performance.now(), dur = reducido ? 1 : 650;
    z = Math.max(1, Math.min(10, z));
    function paso(now){
      var p = Math.min(1, (now - t0) / dur), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      st.cx = a.x + (x - a.x) * e; st.cy = a.y + (y - a.y) * e; st.z = Math.exp(Math.log(a.z) + (Math.log(z) - Math.log(a.z)) * e);
      camara();
      if (p < 1) anim = requestAnimationFrame(paso); else anim = null;
    }
    anim = requestAnimationFrame(paso);
  }
  function zoomEn(f, px, py){
    var s = escala();
    var wx = st.cx + ((px === undefined ? vw / 2 : px) - vw / 2) / s;
    var wy = st.cy + ((py === undefined ? vh / 2 : py) - vh / 2) / s;
    var z2 = Math.max(1, Math.min(10, st.z * f));
    var s2 = s * z2 / st.z;
    st.cx = wx - ((px === undefined ? vw / 2 : px) - vw / 2) / s2;
    st.cy = wy - ((py === undefined ? vh / 2 : py) - vh / 2) / s2;
    st.z = z2;
    camara();
  }

  /* ---------- Interfaz ---------- */
  var VISTAS = [
    ['mapa', { es: 'Mapa', en: 'Map' }], ['satelite', { es: 'Satélite', en: 'Satellite' }],
    ['relieve', { es: 'Relieve', en: 'Terrain' }], ['real', { es: 'Real', en: 'Royal' }]
  ];
  function ui(){
    var v = VISTAS.map(function(x){ return '<button type="button" data-pvl-map-vista="' + x[0] + '">' + esc(t(x[1])) + '</button>'; }).join('');
    return '<div class="pvl-map-top">' +
      '<form class="pvl-map-buscar" data-pvl-map-buscar><input type="search" list="pvl-map-lista" placeholder="' + esc(t({ es: 'Buscar en el Reino', en: 'Search the Kingdom' })) + '" aria-label="' + esc(t({ es: 'Buscar un lugar', en: 'Search for a place' })) + '"><datalist id="pvl-map-lista">' +
      POIS.map(function(p){ return '<option value="' + esc(t(p.n)) + '">'; }).join('') + '</datalist><button type="submit" aria-label="' + esc(t({ es: 'Buscar', en: 'Search' })) + '"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="5"/><path d="M11 11l4 4"/></svg></button></form>' +
      '<div class="pvl-map-chips"><button type="button" data-pvl-map-capa="bucees">⛽ Buc-ee’s</button><button type="button" data-pvl-map-capa="trafico">🦄 ' + esc(t({ es: 'Tráfico', en: 'Traffic' })) + '</button><button type="button" data-pvl-map-capa="sv">🧍 Street View</button></div></div>' +
      '<div class="pvl-map-vistas" role="group" aria-label="' + esc(t({ es: 'Vista del mapa', en: 'Map view' })) + '">' + v + '</div>' +
      '<div class="pvl-map-zoom"><button type="button" data-pvl-map-zoom="1" aria-label="Zoom +">+</button><button type="button" data-pvl-map-zoom="-1" aria-label="Zoom −">−</button><button type="button" data-pvl-map-zoom="0" aria-label="' + esc(t({ es: 'Volver a Pavel', en: 'Back to Pavel' })) + '" title="' + esc(t({ es: 'Volver a Pavel', en: 'Back to Pavel' })) + '">◎</button></div>' +
      '<div class="pvl-map-escala"><div class="pvl-map-escala-bar"></div><span class="pvl-map-escala-txt"></span></div>' +
      '<div class="pvl-map-copy">© ' + esc(t({ es: 'Ministerio de Cartografía Real · datos del mapa: Pavel', en: 'Ministry of Royal Cartography · map data: Pavel' })) + '</div>' +
      '<div class="pvl-map-ficha" hidden></div>' +
      '<div class="pvl-map-sv" hidden></div>' +
      '<div class="pvl-map-pista">' + esc(t({ es: 'Arrastra para moverte · rueda o pellizca para acercar', en: 'Drag to move · scroll or pinch to zoom' })) + '</div>';
  }
  function pintarUI(){
    var bs = raiz.querySelectorAll('[data-pvl-map-vista]');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-pvl-map-vista') === st.vista ? 'true' : 'false');
    var cs = raiz.querySelectorAll('[data-pvl-map-capa]');
    for (var j = 0; j < cs.length; j++) {
      var c = cs[j].getAttribute('data-pvl-map-capa');
      cs[j].setAttribute('aria-pressed', (c === 'sv' ? st.sv : c === 'trafico' ? st.trafico : raiz.classList.contains('pvl-map-solo-bucees')) ? 'true' : 'false');
    }
    raiz.className = raiz.className.replace(/\bpvl-map-v-\S+/g, '').trim() + ' pvl-map-v-' + st.vista;
    raiz.classList.toggle('pvl-map-modo-sv', st.sv);
  }

  function montar(){
    var r = doc.getElementById('pvl-map-root');
    if (!montado(r)) return false;
    if (r.querySelector('svg.pvl-map-svg')) return true;
    raiz = r;
    raiz.classList.add('pvl-map');
    raiz.innerHTML = '<svg class="pvl-map-svg" xmlns="' + NS + '" role="img" aria-label="' + esc(t({ es: 'Mapa interactivo del Reino de Pavel', en: 'Interactive map of the Kingdom of Pavel' })) + '">' + mundo() + '</svg>' + ui();
    svg = raiz.querySelector('svg.pvl-map-svg');
    st.lang = L();
    svg.querySelector('#pvl-map-etiquetas').innerHTML = etiquetas();
    svg.querySelector('#pvl-map-pines').innerHTML = pines();
    medir(); pintarUI(); camara(); eventos();
    if (st.sel) ficha(st.sel);
    return true;
  }
  function medir(){
    var b = raiz.getBoundingClientRect();
    vw = Math.max(200, b.width); vh = Math.max(200, b.height);
  }
  function relabel(){
    if (!raiz || st.lang === L()) return;
    st.lang = L();
    var abierto = st.sel;
    var svA = st.sv;
    raiz.innerHTML = '';
    svg = null;
    montar();
    st.sv = svA;
    pintarUI();
    if (abierto) ficha(abierto);
  }

  /* ---------- Ficha de lugar ---------- */
  function poi(id){ for (var i = 0; i < POIS.length; i++) if (POIS[i].id === id) return POIS[i]; return null; }
  function ficha(id){
    var p = poi(id); if (!p || !raiz) return;
    st.sel = id;
    var f = raiz.querySelector('.pvl-map-ficha');
    var dist = Math.round(Math.hypot(p.x - 1000, p.y - 700) * 0.1);
    var min = Math.max(1, Math.round(dist / 1.9));
    var estrellas = '★★★★★';
    f.innerHTML = '<button type="button" class="pvl-map-x" data-pvl-map-cerrar aria-label="' + esc(t({ es: 'Cerrar', en: 'Close' })) + '">×</button>' +
      '<div class="pvl-map-ficha-k">' + esc(t(p.k)) + '</div>' +
      '<h4>' + esc(t(p.n)) + '</h4>' +
      '<div class="pvl-map-ficha-r"><span>5,0</span> ' + estrellas + ' <em>(' + esc(t({ es: '1 reseña: Pavel', en: '1 review: Pavel' })) + ')</em></div>' +
      '<p>' + esc(t(p.d)) + '</p>' +
      '<div class="pvl-map-ficha-b">' +
      '<button type="button" data-pvl-map-ruta="' + p.id + '">↪ ' + esc(t({ es: 'Cómo llegar', en: 'Directions' })) + '</button>' +
      (p.sv ? '<button type="button" data-pvl-map-abrir-sv="' + p.sv + '">🧍 Street View</button>' : '') +
      (p.href ? '<a href="' + p.href + '">' + esc(t({ es: 'Visitar la sección', en: 'Visit the section' })) + ' →</a>' : '') +
      '</div><div class="pvl-map-ficha-eta"></div>';
    if (st.ruta === id) eta(p, dist, min);
    f.hidden = false;
    var gs = raiz.querySelectorAll('[data-pvl-poi]');
    for (var i = 0; i < gs.length; i++) gs[i].classList.toggle('m-pin-on', gs[i].getAttribute('data-pvl-poi') === id);
  }
  function eta(p, dist, min){
    var e = raiz.querySelector('.pvl-map-ficha-eta');
    if (e) e.textContent = p.id === 'palacio'
      ? t({ es: 'Ya está usted en el centro del universo. Distancia: 0 km.', en: 'You are already at the centre of the universe. Distance: 0 km.' })
      : t({ es: 'Desde el Palacio: ' + dist + ' km · ' + min + ' min a lomos de unicornio (Pavel llega antes).', en: 'From the Palace: ' + dist + ' km · ' + min + ' min by unicorn (Pavel gets there first).' });
  }
  function ruta(id){
    var p = poi(id); if (!p) return;
    st.ruta = id;
    var g = svg.querySelector('#pvl-map-ruta');
    var mx = (1000 + p.x) / 2 + (p.y - 700) * .25, my = (700 + p.y) / 2 - (p.x - 1000) * .25;
    g.innerHTML = '<path class="m-ruta-borde" d="M1000 700Q' + mx + ' ' + my + ' ' + p.x + ' ' + p.y + '"/><path class="m-ruta" d="M1000 700Q' + mx + ' ' + my + ' ' + p.x + ' ' + p.y + '"/>';
    var dist = Math.round(Math.hypot(p.x - 1000, p.y - 700) * 0.1);
    eta(p, dist, Math.max(1, Math.round(dist / 1.9)));
    var minx = Math.min(1000, p.x), maxx = Math.max(1000, p.x), miny = Math.min(700, p.y), maxy = Math.max(700, p.y);
    var z = Math.min(vw / ((maxx - minx + 260) * Math.min(vw / W, vh / H) * 1.04), vh / ((maxy - miny + 260) * Math.min(vw / W, vh / H) * 1.04));
    z = Math.max(1, Math.min(3.2, z * .85));
    /* La ficha tapa la izquierda en escritorio: corre el encuadre. */
    var corr = vw > 640 ? 175 / (Math.min(vw / W, vh / H) * 1.04 * z) : 0;
    volar((minx + maxx) / 2 - corr, (miny + maxy) / 2, z);
  }

  /* ---------- Trafico de unicornios ---------- */
  var coches = [], ultimo = 0, visible = true;
  function prepararTrafico(){
    coches = [];
    var g = svg && svg.querySelector('#pvl-map-trafico'); if (!g) return;
    g.innerHTML = '';
    ['u1', 'u2', 'u3', 's1', 's2', 's3'].forEach(function(id, n){
      var path = svg.querySelector('#pvl-map-ruta-' + id); if (!path) return;
      var len = path.getTotalLength();
      var cuantos = id.charAt(0) === 'u' ? 5 : 2;
      for (var i = 0; i < cuantos; i++) {
        var el = doc.createElementNS(NS, 'text');
        el.setAttribute('class', 'm-coche');
        el.textContent = '🦄';
        g.appendChild(el);
        coches.push({ el: el, path: path, len: len, pos: (i / cuantos + n * .13) * len, v: (18 + (i * 7 + n * 5) % 16) * (i % 2 ? -1 : 1) });
      }
    });
  }
  function tick(now){
    requestAnimationFrame(tick);
    if (!svg || !st.trafico || !visible || reducido) return;
    var dt = Math.min(.1, (now - (ultimo || now)) / 1000); ultimo = now;
    if (!coches.length || !coches[0].el.isConnected) prepararTrafico();
    var k = 1 / escala();
    for (var i = 0; i < coches.length; i++) {
      var c = coches[i];
      c.pos = (c.pos + c.v * dt + c.len) % c.len;
      var p = c.path.getPointAtLength(c.pos);
      c.el.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') scale(' + (c.v < 0 ? -k : k).toFixed(3) + ' ' + k.toFixed(3) + ')');
    }
  }

  /* ---------- Street View ---------- */
  var PW = 2400, PH = 600, HZ = 340;
  function cielo(a, b){ return '<defs><linearGradient id="pvl-sv-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs><rect width="' + PW + '" height="' + HZ + '" fill="url(#pvl-sv-c)"/>'; }
  function suelo(c){ return '<rect y="' + HZ + '" width="' + PW + '" height="' + (PH - HZ) + '" fill="' + c + '"/>'; }
  function lejos(c, amp, seed){
    var d = 'M0 ' + HZ;
    for (var x = 0; x <= PW; x += 60) d += 'L' + x + ' ' + (HZ - 20 - Math.abs(Math.sin(x * .004 + seed) * amp) - Math.abs(Math.sin(x * .013 + seed * 2) * amp * .4));
    return '<path d="' + d + 'L' + PW + ' ' + HZ + 'Z" fill="' + c + '"/>';
  }
  function via(x, c){
    return '<path d="M' + (x - 420) + ' ' + PH + 'L' + (x - 10) + ' ' + HZ + 'L' + (x + 10) + ' ' + HZ + 'L' + (x + 420) + ' ' + PH + 'Z" fill="' + (c || '#55525e') + '"/>' +
      '<path d="M' + x + ' ' + PH + 'L' + x + ' ' + HZ + '" stroke="#f4e0a8" stroke-width="6" stroke-dasharray="40 34"/>';
  }
  function sol(x, y){ return '<circle cx="' + x + '" cy="' + y + '" r="46" fill="#fff4c4" opacity=".9"/><circle cx="' + x + '" cy="' + y + '" r="90" fill="#fff4c4" opacity=".18"/>'; }
  function cartel(x, txt, sub){
    return '<g transform="translate(' + x + ' 0)"><rect x="-4" y="' + (HZ - 40) + '" width="8" height="150" fill="#6b6576"/><rect x="-120" y="' + (HZ - 110) + '" width="240" height="74" rx="6" fill="#1f6b3a" stroke="#fff" stroke-width="3"/>' +
      '<text x="0" y="' + (HZ - 76) + '" text-anchor="middle" font-family="IBM Plex Sans,sans-serif" font-weight="600" font-size="22" fill="#fff">' + esc(txt) + '</text>' +
      (sub ? '<text x="0" y="' + (HZ - 50) + '" text-anchor="middle" font-family="IBM Plex Sans,sans-serif" font-size="16" fill="#e6f3ea">' + esc(sub) + '</text>' : '') + '</g>';
  }
  function bucees(x, w){
    w = w || 900;
    var s = '<g transform="translate(' + x + ' 0)">';
    /* Marquesina de surtidores. */
    s += '<rect x="' + (-w / 2 - 420) + '" y="' + (HZ - 70) + '" width="380" height="16" fill="#f1efe9"/><rect x="' + (-w / 2 - 420) + '" y="' + (HZ - 76) + '" width="380" height="8" fill="#e8312f"/>';
    for (var i = 0; i < 6; i++) s += '<rect x="' + (-w / 2 - 400 + i * 62) + '" y="' + (HZ - 54) + '" width="8" height="80" fill="#d6d3cc"/><rect x="' + (-w / 2 - 392 + i * 62) + '" y="' + (HZ + 6) + '" width="24" height="44" rx="3" fill="#e8312f"/>';
    /* Tienda. */
    s += '<rect x="' + (-w / 2) + '" y="' + (HZ - 110) + '" width="' + w + '" height="150" fill="#f3e9d3"/><rect x="' + (-w / 2) + '" y="' + (HZ - 126) + '" width="' + w + '" height="20" fill="#e8312f"/>' +
      '<rect x="' + (-w / 2) + '" y="' + (HZ - 110) + '" width="' + w + '" height="10" fill="#f5c400"/>';
    for (var j = 0; j < w / 110 - 1; j++) s += '<rect x="' + (-w / 2 + 40 + j * 110) + '" y="' + (HZ - 72) + '" width="70" height="90" fill="#8fb7c9" opacity=".8"/>';
    s += '<text x="0" y="' + (HZ - 140) + '" text-anchor="middle" font-family="Bodoni Moda,serif" font-weight="700" font-size="46" fill="#201a33">Buc-ee’s</text>';
    /* Poste con el disco amarillo. */
    s += '<rect x="' + (w / 2 + 120) + '" y="' + (HZ - 230) + '" width="14" height="270" fill="#7a7480"/><circle cx="' + (w / 2 + 127) + '" cy="' + (HZ - 260) + '" r="78" fill="#f5c400" stroke="#e8312f" stroke-width="8"/>' +
      '<text x="' + (w / 2 + 127) + '" y="' + (HZ - 250) + '" text-anchor="middle" font-family="IBM Plex Sans,sans-serif" font-weight="700" font-size="30" fill="#201a33">Buc-ee’s</text>' +
      '<rect x="' + (w / 2 + 52) + '" y="' + (HZ - 168) + '" width="150" height="40" rx="4" fill="#201a33"/><text x="' + (w / 2 + 127) + '" y="' + (HZ - 141) + '" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-weight="600" font-size="20" fill="#f5c400">G 1,99</text>';
    return s + '</g>';
  }
  function palacio(x){
    var s = '<g transform="translate(' + x + ' 0)">';
    s += '<rect x="-420" y="' + (HZ - 150) + '" width="840" height="190" fill="#efe6cf"/><rect x="-440" y="' + (HZ - 166) + '" width="880" height="20" fill="#d8b25c"/>';
    for (var i = 0; i < 11; i++) s += '<rect x="' + (-400 + i * 78) + '" y="' + (HZ - 146) + '" width="22" height="186" fill="#fbf6ea"/>';
    s += '<path d="M-180 ' + (HZ - 166) + 'Q0 ' + (HZ - 400) + ' 180 ' + (HZ - 166) + 'Z" fill="url(#pvl-sv-iri)"/><rect x="-4" y="' + (HZ - 380) + '" width="8" height="70" fill="#8f6f2a"/>' +
      '<path d="M4 ' + (HZ - 380) + 'h70v20h-70z" fill="#1b1150"/><path d="M4 ' + (HZ - 360) + 'h70v10h-70z" fill="#d8b25c"/><path d="M4 ' + (HZ - 350) + 'h70v14h-70z" fill="#f2a9dc"/>' +
      '<rect x="-60" y="' + (HZ - 60) + '" width="120" height="100" rx="60" fill="#3b2a12"/>' +
      '<defs><linearGradient id="pvl-sv-iri" x1="0" x2="1"><stop offset="0" stop-color="#86e7ea"/><stop offset=".5" stop-color="#f2a9dc"/><stop offset="1" stop-color="#f4e0a8"/></linearGradient></defs>';
    return s + '</g>';
  }
  function estatua(x){
    return '<g transform="translate(' + x + ' 0)"><rect x="-60" y="' + (HZ - 10) + '" width="120" height="70" fill="#cfc6b0"/>' +
      '<text x="0" y="' + (HZ - 12) + '" text-anchor="middle" font-size="150">🦄</text>' +
      '<text x="0" y="' + (HZ + 40) + '" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" fill="#4a3e22">PAVEL I · EL NON PLUS ULTRA</text></g>';
  }
  function dunas(c){
    var s = '';
    for (var i = 0; i < 7; i++) s += '<ellipse cx="' + (i * 380 + 120) + '" cy="' + (HZ + 30) + '" rx="300" ry="70" fill="' + c + '"/>';
    return s;
  }
  function cactus(x, k){
    k = k || 1;
    return '<g transform="translate(' + x + ' ' + (HZ + 40) + ') scale(' + k + ')" fill="#4f8a4a"><rect x="-10" y="-130" width="20" height="130" rx="10"/><rect x="-44" y="-90" width="16" height="50" rx="8"/><rect x="-44" y="-50" width="44" height="14" rx="7"/><rect x="28" y="-110" width="16" height="60" rx="8"/><rect x="0" y="-60" width="44" height="14" rx="7"/></g>';
  }
  function arboles(c, desde, hasta, y){
    var s = '';
    for (var x = desde; x < hasta; x += 70) s += '<path d="M' + x + ' ' + (y || HZ + 10) + 'l36 -' + (90 + (x % 50)) + 'l36 ' + (90 + (x % 50)) + 'z" fill="' + c + '"/>';
    return s;
  }
  function agua(){ return '<rect y="' + (HZ + 10) + '" width="' + PW + '" height="140" fill="url(#pvl-sv-agua)"/><defs><linearGradient id="pvl-sv-agua" x1="0" x2="1"><stop offset="0" stop-color="#86e7ea"/><stop offset=".33" stop-color="#9fb6f2"/><stop offset=".66" stop-color="#f2a9dc"/><stop offset="1" stop-color="#86e7ea"/></linearGradient></defs>'; }
  var ESCENAS = {
    'palacio': { n: { es: 'Plaza Unicornio 1, Pavelópolis', en: 'Unicorn Square 1, Pavelópolis' }, f: function(){ return cielo('#7fb6ff', '#dff0ff') + sol(1900, 110) + lejos('#b9c7da', 40, 1) + suelo('#d8cfb8') + palacio(1200) + estatua(380) + via(2050, '#bdb39b') + cartel(1700, 'Plaza Unicornio', '1 · ' + t({ es: 'Centro del universo', en: 'Centre of the universe' })); } },
    'bucees-desierto': { n: { es: 'Buc-ee’s del Desierto, autopista U-1', en: 'Desert Buc-ee’s, U-1 highway' }, f: function(){ return cielo('#8ac4ff', '#ffe9c2') + sol(500, 90) + lejos('#e8c99a', 30, 4) + suelo('#e9cf98') + dunas('#e2c084') + via(300) + bucees(1300, 1100) + cactus(2150) + cactus(2300, .7) + cartel(560, t({ es: 'Siguiente Buc-ee’s', en: 'Next Buc-ee’s' }), '41 km'); } },
    'bucees-norte': { n: { es: 'Buc-ee’s Pavelópolis Norte, U-2 salida 1', en: 'Buc-ee’s Pavelópolis North, U-2 exit 1' }, f: function(){ return cielo('#6fa8ff', '#e3f1ff') + lejos('#a6b4c7', 90, 2) + lejos('#8aa36f', 30, 7) + suelo('#9cc27f') + via(2200) + bucees(1050, 800) + arboles('#4f7d3d', 0, 300) + cartel(1850, 'Pavelópolis', '14 km · ' + t({ es: 'Palacio', en: 'Palace' })); } },
    'lago': { n: { es: 'Orilla del Lago Iridiscente', en: 'Shore of Lake Iridescent' }, f: function(){ return cielo('#8fb9ff', '#fde6f4') + sol(1400, 120) + lejos('#b7a6d9', 110, 3) + suelo('#9fcf95') + agua() + arboles('#4f7d3d', 1900, 2400, HZ + 160) + arboles('#5d8c48', 0, 400, HZ + 170) + cartel(700, t({ es: 'Prohibido nadar', en: 'No swimming' }), t({ es: 'salvo unicornios', en: 'unicorns excepted' })); } },
    'monte': { n: { es: 'Cumbre del Monte Non Plus Ultra · 8.849 m', en: 'Summit of Mount Non Plus Ultra · 8,849 m' }, f: function(){ return cielo('#1e3c8c', '#9ec4ff') + sol(300, 80) + lejos('#e9eef8', 50, 5) + suelo('#f4f6fb') + '<path d="M0 ' + (HZ + 60) + 'Q600 ' + (HZ - 20) + ' 1200 ' + (HZ + 40) + 'T2400 ' + (HZ + 50) + 'V600H0z" fill="#e6ebf5"/>' + palacioBandera(900) + bucees(1700, 520) + cartel(400, '8.849 m', t({ es: 'Everest: 8.848 m', en: 'Everest: 8,848 m' })); } },
    'desierto': { n: { es: 'Desierto de los Rivales', en: 'Desert of Rivals' }, f: function(){ return cielo('#9cc9ff', '#fff0cf') + sol(1200, 70) + suelo('#ecd29c') + dunas('#e4c486') + cactus(400) + cactus(1700, .8) + cactus(2100, 1.2) + cartel(1150, t({ es: 'Rivales censados', en: 'Rivals on record' }), '0'); } },
    'puerto': { n: { es: 'Muelle de Puerto Grandeza', en: 'Port Greatness pier' }, f: function(){ return cielo('#79b4ff', '#e2f2ff') + sol(1700, 140) + '<rect y="' + (HZ - 10) + '" width="' + PW + '" height="200" fill="#3f7fc0"/>' + suelo2() + faro(600) + barco(1300) + barco(1900, .6) + cartel(2200, t({ es: 'Exportaciones', en: 'Exports' }), t({ es: 'Grandeza a granel', en: 'Greatness, in bulk' })); } }
  };
  function suelo2(){ return '<rect y="' + (HZ + 170) + '" width="' + PW + '" height="200" fill="#a99f8c"/><rect y="' + (HZ + 160) + '" width="' + PW + '" height="14" fill="#7d7464"/>'; }
  function faro(x){ return '<g transform="translate(' + x + ' 0)"><path d="M-40 ' + (HZ + 170) + 'L-24 ' + (HZ - 160) + 'H24L40 ' + (HZ + 170) + 'Z" fill="#fff"/><path d="M-34 ' + (HZ + 40) + 'H34L31 ' + (HZ - 10) + 'H-31Z M-27 ' + (HZ - 70) + 'H27L25 ' + (HZ - 110) + 'H-25Z" fill="#e8312f"/><rect x="-28" y="' + (HZ - 200) + '" width="56" height="40" fill="#f4e0a8"/><path d="M28 ' + (HZ - 180) + 'L400 ' + (HZ - 240) + 'L400 ' + (HZ - 120) + 'Z" fill="#fff4c4" opacity=".35"/></g>'; }
  function barco(x, k){ k = k || 1; return '<g transform="translate(' + x + ' ' + (HZ + 60) + ') scale(' + k + ')"><path d="M-200 0H200L160 60H-160Z" fill="#1b1150"/><rect x="-140" y="-70" width="90" height="70" fill="#d8b25c"/><rect x="-40" y="-70" width="90" height="70" fill="#86e7ea"/><rect x="60" y="-70" width="90" height="70" fill="#f2a9dc"/><text x="0" y="40" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="20" fill="#f4e0a8">GRANDEZA I</text></g>'; }
  function palacioBandera(x){ return '<g transform="translate(' + x + ' 0)"><rect x="-4" y="' + (HZ - 220) + '" width="8" height="260" fill="#8f6f2a"/><rect x="4" y="' + (HZ - 220) + '" width="150" height="40" fill="#1b1150"/><rect x="4" y="' + (HZ - 180) + '" width="150" height="20" fill="#d8b25c"/><rect x="4" y="' + (HZ - 160) + '" width="150" height="40" fill="url(#pvl-sv-iri2)"/><defs><linearGradient id="pvl-sv-iri2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86e7ea"/><stop offset="1" stop-color="#f2a9dc"/></linearGradient></defs></g>'; }

  var svx = 0;
  function abrirSV(id){
    var e = ESCENAS[id]; if (!e || !raiz) return;
    var cont = raiz.querySelector('.pvl-map-sv');
    var dibujo = e.f();
    svx = 0;
    cont.innerHTML = '<div class="pvl-map-sv-pano" data-pvl-sv-pano><svg viewBox="0 0 ' + (PW * 2) + ' ' + PH + '" preserveAspectRatio="xMinYMid slice" xmlns="' + NS + '"><g>' + dibujo + '</g><g transform="translate(' + PW + ' 0)">' + dibujo.replace(/id="(pvl-sv-[^"]+)"/g, 'id="$1-b"').replace(/url\(#(pvl-sv-[^)]+)\)/g, 'url(#$1-b)') + '</g></svg></div>' +
      '<div class="pvl-map-sv-bar"><div><div class="pvl-map-sv-k">Street View · ' + esc(t({ es: 'Ministerio de Cartografía Real', en: 'Ministry of Royal Cartography' })) + '</div><div class="pvl-map-sv-n">' + esc(t(e.n)) + '</div></div>' +
      '<button type="button" data-pvl-map-cerrar-sv aria-label="' + esc(t({ es: 'Salir de Street View', en: 'Exit Street View' })) + '">×</button></div>' +
      '<button type="button" class="pvl-map-sv-flecha pvl-map-sv-izq" data-pvl-sv-girar="-1" aria-label="' + esc(t({ es: 'Girar a la izquierda', en: 'Turn left' })) + '">‹</button>' +
      '<button type="button" class="pvl-map-sv-flecha pvl-map-sv-der" data-pvl-sv-girar="1" aria-label="' + esc(t({ es: 'Girar a la derecha', en: 'Turn right' })) + '">›</button>' +
      '<div class="pvl-map-sv-brujula" aria-hidden="true">N</div>' +
      '<div class="pvl-map-sv-pista">' + esc(t({ es: 'Arrastra para mirar alrededor · 360°', en: 'Drag to look around · 360°' })) + '</div>';
    cont.hidden = false;
    girar(0);
  }
  function girar(dx){
    var pano = raiz && raiz.querySelector('[data-pvl-sv-pano] svg'); if (!pano) return;
    var ancho = pano.getBoundingClientRect().width / 2;
    if (!ancho) return;
    svx = ((svx + dx) % ancho + ancho) % ancho;
    pano.style.transform = 'translateX(' + (-svx).toFixed(1) + 'px)';
    var b = raiz.querySelector('.pvl-map-sv-brujula');
    if (b) b.style.transform = 'rotate(' + (-svx / ancho * 360).toFixed(1) + 'deg)';
  }

  /* ---------- Eventos ---------- */
  var listos = false;
  function eventos(){
    if (listos) return;
    listos = true;
    var punteros = {}, arrastre = null, pellizco = null, svArr = null, movido = false;
    doc.addEventListener('pointerdown', function(e){
      if (!raiz || !raiz.contains(e.target)) return;
      if (e.target.closest('button, a, input, form, .pvl-map-ficha')) return;
      var pano = e.target.closest('[data-pvl-sv-pano]');
      if (pano) { svArr = { x: e.clientX }; e.preventDefault(); return; }
      if (!e.target.closest('svg.pvl-map-svg')) return;
      punteros[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(punteros);
      movido = false;
      if (ids.length === 1) arrastre = { x: e.clientX, y: e.clientY, cx: st.cx, cy: st.cy };
      if (ids.length === 2) { var a = punteros[ids[0]], b = punteros[ids[1]]; pellizco = { d: Math.hypot(a.x - b.x, a.y - b.y), z: st.z }; arrastre = null; }
      raiz.classList.add('pvl-map-arrastrando');
    });
    doc.addEventListener('pointermove', function(e){
      if (svArr) { girar(svArr.x - e.clientX); svArr.x = e.clientX; return; }
      if (!punteros[e.pointerId]) return;
      punteros[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(punteros);
      if (pellizco && ids.length === 2) {
        var a = punteros[ids[0]], b = punteros[ids[1]];
        var r = raiz.getBoundingClientRect();
        zoomEn(pellizco.z * Math.hypot(a.x - b.x, a.y - b.y) / pellizco.d / st.z, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
        movido = true;
        return;
      }
      if (arrastre) {
        var dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) movido = true;
        var s = escala();
        st.cx = arrastre.cx - dx / s; st.cy = arrastre.cy - dy / s;
        camara();
      }
    });
    function fin(e){
      svArr = null;
      if (!punteros[e.pointerId]) return;
      delete punteros[e.pointerId];
      if (Object.keys(punteros).length < 2) pellizco = null;
      if (!Object.keys(punteros).length) {
        arrastre = null;
        if (raiz) raiz.classList.remove('pvl-map-arrastrando');
        if (!movido) toque(e);
      }
    }
    doc.addEventListener('pointerup', fin);
    doc.addEventListener('pointercancel', fin);
    function toque(e){
      var el = doc.elementFromPoint(e.clientX, e.clientY);
      var g = el && el.closest && el.closest('[data-pvl-poi]');
      if (!g) return;
      var p = poi(g.getAttribute('data-pvl-poi'));
      if (st.sv && p.sv) { abrirSV(p.sv); return; }
      ficha(p.id);
      if (st.z < 2.2) volar(p.x, p.y, 2.6); else volar(p.x, p.y, st.z);
    }
    doc.addEventListener('wheel', function(e){
      if (!raiz || !raiz.contains(e.target) || !e.target.closest('svg.pvl-map-svg')) return;
      e.preventDefault();
      var r = raiz.getBoundingClientRect();
      zoomEn(Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0016)), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    doc.addEventListener('keydown', function(e){
      var g = e.target && e.target.closest && e.target.closest('[data-pvl-poi]');
      if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); var p = poi(g.getAttribute('data-pvl-poi')); ficha(p.id); volar(p.x, p.y, Math.max(st.z, 2.6)); }
      if (e.key === 'Escape' && raiz) { var sv = raiz.querySelector('.pvl-map-sv'); if (sv && !sv.hidden) sv.hidden = true; }
    });
    doc.addEventListener('click', function(e){
      if (!raiz || !raiz.contains(e.target)) return;
      var b;
      if ((b = e.target.closest('[data-pvl-map-vista]'))) { st.vista = b.getAttribute('data-pvl-map-vista'); pintarUI(); return; }
      if ((b = e.target.closest('[data-pvl-map-capa]'))) {
        var c = b.getAttribute('data-pvl-map-capa');
        if (c === 'sv') st.sv = !st.sv;
        else if (c === 'trafico') { st.trafico = !st.trafico; raiz.classList.toggle('pvl-map-sin-trafico', !st.trafico); }
        else if (c === 'bucees') { raiz.classList.toggle('pvl-map-solo-bucees'); if (raiz.classList.contains('pvl-map-solo-bucees')) volar(1150, 700, 1); }
        pintarUI(); return;
      }
      if ((b = e.target.closest('[data-pvl-map-zoom]'))) {
        var z = +b.getAttribute('data-pvl-map-zoom');
        if (z === 0) volar(1000, 700, 3); else volar(st.cx, st.cy, st.z * (z > 0 ? 1.6 : 1 / 1.6));
        return;
      }
      if (e.target.closest('[data-pvl-map-cerrar]')) { raiz.querySelector('.pvl-map-ficha').hidden = true; st.sel = null; st.ruta = null; svg.querySelector('#pvl-map-ruta').innerHTML = ''; var on = raiz.querySelectorAll('.m-pin-on'); for (var i = 0; i < on.length; i++) on[i].classList.remove('m-pin-on'); return; }
      if ((b = e.target.closest('[data-pvl-map-ruta]'))) { ruta(b.getAttribute('data-pvl-map-ruta')); return; }
      if ((b = e.target.closest('[data-pvl-map-abrir-sv]'))) { abrirSV(b.getAttribute('data-pvl-map-abrir-sv')); return; }
      if (e.target.closest('[data-pvl-map-cerrar-sv]')) { raiz.querySelector('.pvl-map-sv').hidden = true; return; }
      if ((b = e.target.closest('[data-pvl-sv-girar]'))) { var pano = raiz.querySelector('[data-pvl-sv-pano] svg'); girar(+b.getAttribute('data-pvl-sv-girar') * (pano ? pano.getBoundingClientRect().width / 16 : 100)); return; }
    });
    doc.addEventListener('submit', function(e){
      if (!e.target || !e.target.hasAttribute || !e.target.hasAttribute('data-pvl-map-buscar')) return;
      e.preventDefault();
      var q = String(e.target.querySelector('input').value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
      if (!q) return;
      var norm = function(s){ return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
      var hit = null;
      for (var i = 0; i < POIS.length && !hit; i++) if (norm(POIS[i].n.es).indexOf(q) >= 0 || norm(POIS[i].n.en).indexOf(q) >= 0) hit = POIS[i];
      if (!hit && /bucee|buc-ee|gas|fuel|nafta/.test(q)) hit = poi('bucees-desierto');
      if (!hit && /pavel|rey|king|sobera|sovere/.test(q)) hit = poi('palacio');
      if (hit) { ficha(hit.id); volar(hit.x, hit.y, 2.8); }
      else {
        var f = raiz.querySelector('.pvl-map-ficha');
        f.innerHTML = '<button type="button" class="pvl-map-x" data-pvl-map-cerrar aria-label="×">×</button><h4>' + esc(t({ es: 'Sin resultados', en: 'No results' })) + '</h4><p>' + esc(t({ es: '«' + q + '» no existe en el Reino. Si fuera importante, estaría cerca de Pavel.', en: '“' + q + '” does not exist in the Kingdom. If it mattered, it would be near Pavel.' })) + '</p>';
        f.hidden = false;
      }
    });
    window.addEventListener('resize', function(){ if (raiz) { medir(); camara(); girar(0); } });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(es){ visible = es[0].isIntersecting; ultimo = 0; });
      var mirar = setInterval(function(){ if (raiz) { io.observe(raiz); clearInterval(mirar); } }, 500);
    }
    requestAnimationFrame(tick);
  }

  /* Montaje y remontajes. */
  setInterval(function(){
    if (!montar()) return;
    if (raiz && !raiz.isConnected) { raiz = null; svg = null; montar(); }
    relabel();
    if (raiz) { var b = raiz.getBoundingClientRect(); if (Math.abs(b.width - vw) > 2 || Math.abs(b.height - vh) > 2) { medir(); camara(); } }
  }, 600);
})();
