/* Decreto sellado (pvl-dsel-). Mismo candado de doble ejecucion que el resto
   de <helmet>. Lee el decreto que ministerios.js acaba de redactar en
   #pvl-decree-output (en el idioma activo), lo copia sobre un pergamino con
   sello de cera y lo descarga como PNG con window.PavelLienzo. No toca el
   generador: solo lee lo que pinto. Nada se guarda ni se envia. */
(function(){
  if (window.__pvlDecretoSello) return;
  window.__pvlDecretoSello = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }
  function montado(el){ return !!el && (!el.closest || !el.closest('x-dc')); }
  function uno(sel){
    var els = doc.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) if (montado(els[i])) return els[i];
    return null;
  }
  /* Los parrafos del decreto redactado, o [] si aun no hay ninguno. */
  function parrafos(){
    var out = uno('#pvl-decree-output');
    if (!out) return [];
    var ps = out.querySelectorAll('p');
    var r = [];
    for (var i = 0; i < ps.length; i++) if (!ps[i].classList.contains('pvl-decree-empty')) r.push(ps[i].textContent.trim());
    return r.filter(Boolean);
  }
  function numero(txt){
    var h = 0x811c9dc5;
    for (var i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return String(1000 + h % 9000);
  }

  function pergamino(ctx, w, h){
    var g = ctx.createRadialGradient(w / 2, h * .45, h * .1, w / 2, h / 2, h * .75);
    g.addColorStop(0, '#f6ead0'); g.addColorStop(.7, '#ead6ad'); g.addColorStop(1, '#c9a46a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    /* fibras y manchas del papel, con semilla fija para que cada decreto sea igual de viejo */
    var s = 7;
    function r(){ s = (s * 16807) % 2147483647; return s / 2147483647; }
    for (var i = 0; i < 900; i++) {
      ctx.fillStyle = 'rgba(120,80,30,' + (r() * .06).toFixed(3) + ')';
      ctx.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3);
    }
    for (var j = 0; j < 14; j++) {
      ctx.fillStyle = 'rgba(140,95,40,' + (r() * .05 + .02).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(r() * w, r() * h, 20 + r() * 60, 0, Math.PI * 2); ctx.fill();
    }
    /* bordes tostados */
    var b = ctx.createLinearGradient(0, 0, w, 0);
    b.addColorStop(0, 'rgba(110,70,25,.35)'); b.addColorStop(.06, 'rgba(110,70,25,0)'); b.addColorStop(.94, 'rgba(110,70,25,0)'); b.addColorStop(1, 'rgba(110,70,25,.35)');
    ctx.fillStyle = b; ctx.fillRect(0, 0, w, h);
    var v = ctx.createLinearGradient(0, 0, 0, h);
    v.addColorStop(0, 'rgba(110,70,25,.3)'); v.addColorStop(.05, 'rgba(110,70,25,0)'); v.addColorStop(.95, 'rgba(110,70,25,0)'); v.addColorStop(1, 'rgba(110,70,25,.3)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(107,79,22,.55)'; ctx.lineWidth = 2; ctx.strokeRect(54, 54, w - 108, h - 108);
    ctx.strokeStyle = 'rgba(107,79,22,.3)'; ctx.lineWidth = 1; ctx.strokeRect(64, 64, w - 128, h - 128);
  }

  function dibujar(ps){
    var Lz = window.PavelLienzo, l = lang();
    var w = 1100, h = 1400, c = Lz.nuevo(w, h), ctx = c.getContext('2d');
    pergamino(ctx, w, h);
    var n = numero(ps.join(' '));
    ctx.textAlign = 'center'; ctx.fillStyle = '#6b4f16';
    ctx.font = "600 18px 'IBM Plex Mono', monospace";
    ctx.fillText(l === 'es' ? 'IMPERIO DEL REINO DE PAVEL · GABINETE DEL SOBERANO' : 'EMPIRE OF THE KINGDOM OF PAVEL · OFFICE OF THE SOVEREIGN', w / 2, 140);
    ctx.fillStyle = '#1b1150';
    ctx.font = "900 64px 'Bodoni Moda', Georgia, serif";
    ctx.fillText(l === 'es' ? 'Decreto Real' : 'Royal Decree', w / 2, 230);
    ctx.fillStyle = '#8f6f2a';
    ctx.font = "500 20px 'IBM Plex Mono', monospace";
    ctx.fillText((l === 'es' ? 'N.º ' : 'NO. ') + n + ' · ' + (l === 'es' ? 'AÑO 0' : 'YEAR 0'), w / 2, 274);
    ctx.strokeStyle = 'rgba(107,79,22,.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(w / 2 - 180, 306); ctx.lineTo(w / 2 + 180, 306); ctx.stroke();
    ctx.textAlign = 'left'; ctx.fillStyle = '#2a1f14';
    var y = 380;
    for (var i = 0; i < ps.length; i++) {
      var ult = i === ps.length - 1;
      ctx.font = ult ? "italic 600 32px 'Bodoni Moda', Georgia, serif" : "400 30px 'Bodoni Moda', Georgia, serif";
      y = Lz.envolver(ctx, (i === 0 ? '' : '') + ps[i], 140, y, w - 280, 46) + 76;
    }
    /* firma */
    ctx.textAlign = 'center'; ctx.fillStyle = '#1b1150';
    ctx.font = "italic 700 46px 'Bodoni Moda', Georgia, serif";
    ctx.fillText('Pavel', 380, Math.max(y + 40, 1120));
    ctx.strokeStyle = '#1b1150'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(230, Math.max(y + 60, 1140)); ctx.lineTo(530, Math.max(y + 60, 1140)); ctx.stroke();
    ctx.fillStyle = '#6b4f16'; ctx.font = "500 15px 'IBM Plex Mono', monospace";
    ctx.fillText(l === 'es' ? 'EL SOBERANO' : 'THE SOVEREIGN', 380, Math.max(y + 88, 1168));
    ctx.fillText(new Date().toLocaleDateString(l === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long' }).toUpperCase(), 380, Math.max(y + 112, 1192));
    /* cinta y sello */
    var sx = 790, sy = Math.max(y + 60, 1140);
    ctx.fillStyle = '#5b2a86';
    ctx.beginPath(); ctx.moveTo(sx - 30, sy); ctx.lineTo(sx - 60, sy + 150); ctx.lineTo(sx - 30, sy + 130); ctx.lineTo(sx - 10, sy + 160); ctx.lineTo(sx, sy); ctx.fill();
    ctx.fillStyle = '#c99a3f';
    ctx.beginPath(); ctx.moveTo(sx + 30, sy); ctx.lineTo(sx + 60, sy + 150); ctx.lineTo(sx + 30, sy + 130); ctx.lineTo(sx + 10, sy + 160); ctx.lineTo(sx, sy); ctx.fill();
    Lz.sello(ctx, sx, sy, 78);
    ctx.fillStyle = 'rgba(107,79,22,.7)'; ctx.font = "500 14px 'IBM Plex Mono', monospace";
    ctx.fillText(l === 'es' ? 'EL NON PLUS ULTRA' : 'THE NON PLUS ULTRA', w / 2, h - 90);
    return { canvas: c, n: n };
  }

  doc.addEventListener('click', function(e){
    if (!(e.target.closest && e.target.closest('#pvl-dsel-btn'))) return;
    e.preventDefault();
    var ps = parrafos();
    if (!ps.length || !window.PavelLienzo) return;
    window.PavelLienzo.conFuentes(function(){
      var r = dibujar(ps);
      window.PavelLienzo.descargar(r.canvas, (lang() === 'es' ? 'decreto-real-' : 'royal-decree-') + r.n + '.png');
    });
  });
  /* El boton aparece en cuanto hay un decreto que sellar. */
  setInterval(function(){
    var b = uno('#pvl-dsel-btn');
    if (b) { var hay = parrafos().length > 0; if (b.hidden === hay) b.hidden = !hay; }
  }, 400);
})();
