/* Utilidades de lienzo (window.PavelLienzo) para las tarjetas descargables del
   Reino: titulo nobiliario, visado, decreto sellado, blason, postal, tarjeta de
   embarque. Nada sale del navegador: se dibuja en un <canvas> y se descarga
   como PNG con un enlace local, igual que la tarjeta de ciudadania. Mismo
   candado de doble ejecucion que el resto de <helmet>. */
(function(){
  if (window.PavelLienzo) return;
  var doc = document;

  /* Un <canvas> fuera del documento, del tamano pedido. */
  function nuevo(w, h){
    var c = doc.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  /* Espera a que las fuentes del sitio esten listas, para no dibujar con la de reserva. */
  function conFuentes(fn){
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(fn, fn); else fn();
  }

  /* Texto en varias lineas dentro de un ancho; devuelve la y de la ultima linea. */
  function envolver(ctx, texto, x, y, ancho, alto){
    var palabras = String(texto).split(/\s+/), linea = '', lineas = [];
    for (var i = 0; i < palabras.length; i++) {
      var prueba = linea ? linea + ' ' + palabras[i] : palabras[i];
      if (ctx.measureText(prueba).width > ancho && linea) { lineas.push(linea); linea = palabras[i]; }
      else linea = prueba;
    }
    if (linea) lineas.push(linea);
    for (var j = 0; j < lineas.length; j++) ctx.fillText(lineas[j], x, y + j * alto);
    return y + (lineas.length - 1) * alto;
  }

  /* Fondo violeta del Reino con marco dorado doble. */
  function marco(ctx, w, h, opciones){
    var o = opciones || {};
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, o.de || '#1b1150'); g.addColorStop(1, o.a || '#0b0620');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#d8b25c'; ctx.lineWidth = 6; ctx.strokeRect(22, 22, w - 44, h - 44);
    ctx.strokeStyle = 'rgba(216,178,92,.45)'; ctx.lineWidth = 2; ctx.strokeRect(36, 36, w - 72, h - 72);
  }

  /* Sello de cera con la P del monograma. */
  function sello(ctx, x, y, r, color){
    ctx.save();
    ctx.fillStyle = color || '#9e1f33';
    ctx.beginPath();
    for (var i = 0; i < 24; i++) {
      var a = i / 24 * Math.PI * 2, rr = r * (i % 2 ? .92 : 1);
      ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r * .72, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#f4d9a0';
    ctx.font = "700 " + Math.round(r * .9) + "px 'Bodoni Moda', Georgia, serif";
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('P', x, y + r * .04);
    ctx.restore();
  }

  /* Descarga el lienzo como PNG con el nombre dado. */
  function descargar(canvas, nombre){
    function enlace(url, liberar){
      var a = doc.createElement('a');
      a.href = url; a.download = nombre;
      doc.body.appendChild(a); a.click(); a.remove();
      if (liberar) setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
    }
    if (canvas.toBlob) canvas.toBlob(function(b){ if (b) enlace(URL.createObjectURL(b), true); }, 'image/png');
    else enlace(canvas.toDataURL('image/png'), false);
  }

  /* Nombre de archivo seguro a partir de un texto. */
  function slug(s){
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'pavel';
  }

  window.PavelLienzo = { nuevo: nuevo, conFuentes: conFuentes, envolver: envolver, marco: marco, sello: sello, descargar: descargar, slug: slug };
})();
