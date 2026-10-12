/* Nombre del peregrino en los nuevos certificados (Orden del Unicornio,
   Premio Pavel) + tarjeta de ciudadania descargable (pvl-share-). Mismo
   candado de doble ejecucion que el resto de <helmet>. Lee el nombre con
   la misma cookie/localStorage que "El Mundo de Pavel" -- no se guarda ni
   se envia nada nuevo. */
(function(){
  if (window.__pvlShare) return;
  window.__pvlShare = true;
  var doc = document;

  function leerNombrePeregrino(){
    var m = doc.cookie.match(/(?:^|; )pavelense=([^;]*)/);
    if (m) {
      try { return decodeURIComponent(m[1]).trim(); } catch (e) { return String(m[1] || '').trim(); }
    }
    try { return (localStorage.getItem('pavelense') || '').trim(); } catch (e) { return ''; }
  }
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }

  function pintarNombresPersonalizados(){
    var n = leerNombrePeregrino();
    var L = lang();
    var placeholder = L === 'es' ? 'PEREGRINO ANÓNIMO' : 'ANONYMOUS PILGRIM';
    var texto = n ? n.toUpperCase() : placeholder;
    var medal = doc.getElementById('pvl-medal-name');
    var prize = doc.getElementById('pvl-prize-name');
    if (medal) medal.textContent = texto;
    if (prize) prize.textContent = texto;
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', pintarNombresPersonalizados);
  else pintarNombresPersonalizados();
  setInterval(pintarNombresPersonalizados, 800);
  doc.addEventListener('pavel:langchange', pintarNombresPersonalizados);

  /* ---------- Tarjeta de ciudadania descargable ---------- */
  function dibujarTarjeta(nombre){
    var canvas = doc.getElementById('pvl-share-canvas');
    if (!canvas) return null;
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    var L = lang();

    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#1b1150');
    grad.addColorStop(1, '#150c3a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(216,178,92,.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, w - 40, h - 40);
    ctx.strokeStyle = 'rgba(216,178,92,.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(32, 32, w - 64, h - 64);

    var cx = w / 2;
    ctx.fillStyle = '#e9c874';
    ctx.beginPath();
    ctx.arc(cx, 150, 56, 0, Math.PI * 2);
    ctx.fillStyle = '#1b1150';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#e9c874';
    ctx.stroke();
    ctx.fillStyle = '#e9c874';
    ctx.font = "700 52px 'Bodoni Moda', Georgia, serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', cx, 158);

    ctx.fillStyle = 'rgba(244,239,226,.55)';
    ctx.font = "600 15px 'IBM Plex Mono', monospace";
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(L === 'es' ? 'CERTIFICADO DE CIUDADANÍA' : 'CERTIFICATE OF CITIZENSHIP', cx, 248);

    ctx.fillStyle = '#f7f2e6';
    ctx.font = "700 44px 'Bodoni Moda', Georgia, serif";
    ctx.fillText(L === 'es' ? 'Reino de Pavel' : 'Kingdom of Pavel', cx, 310);

    ctx.fillStyle = 'rgba(244,239,226,.82)';
    ctx.font = "300 20px 'IBM Plex Sans', sans-serif";
    var linea1 = L === 'es' ? 'Se hace constar que existe,' : 'This certifies that they exist,';
    var linea2 = L === 'es' ? 'y que existe porque Pavel existe:' : 'and exist because Pavel exists:';
    ctx.fillText(linea1, cx, 372);
    ctx.fillText(linea2, cx, 400);

    ctx.fillStyle = '#f4e0a8';
    ctx.font = "italic 700 46px 'Bodoni Moda', Georgia, serif";
    var nombreCorto = nombre.length > 28 ? nombre.slice(0, 28) + '…' : nombre;
    ctx.fillText(nombreCorto, cx, 470);
    ctx.strokeStyle = 'rgba(244,239,226,.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 220, 490);
    ctx.lineTo(cx + 220, 490);
    ctx.stroke();

    ctx.fillStyle = 'rgba(244,239,226,.55)';
    ctx.font = "500 13px 'IBM Plex Mono', monospace";
    ctx.fillText(L === 'es' ? 'CIUDADANÍA PAVELENSE · N.º 0000002' : 'PAVELIAN CITIZENSHIP · NO. 0000002', cx, 560);
    ctx.fillText(L === 'es' ? 'OTORGADO EN EL CIELO' : 'GRANTED IN HEAVEN', cx, 584);

    ctx.fillStyle = 'rgba(216,178,92,.6)';
    ctx.font = "600 11px 'IBM Plex Mono', monospace";
    ctx.fillText('EL NON PLUS ULTRA', cx, 700);

    return canvas;
  }

  function descargarTarjeta(){
    var msg = doc.getElementById('pvl-share-msg');
    var nombre = leerNombrePeregrino();
    if (!nombre) {
      if (msg) msg.style.display = 'block';
      return;
    }
    if (msg) msg.style.display = 'none';
    function dibujarYDescargar(){
      var canvas = dibujarTarjeta(nombre);
      if (!canvas || !canvas.toBlob) return;
      canvas.toBlob(function(blob){
        if (!blob) return;
        var url = URL.createObjectURL(blob);
        var a = doc.createElement('a');
        a.href = url;
        a.download = 'ciudadania-pavel-' + nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '.png';
        doc.body.appendChild(a);
        a.click();
        /* Se quita del padre que lo tenga en ese momento: si algo lo hubiera
           movido o sacado del DOM, doc.body.removeChild(a) tiraria un
           NotFoundError en mitad de la descarga. */
        if (a.parentNode) a.parentNode.removeChild(a);
        setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
      }, 'image/png');
    }
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(dibujarYDescargar); else dibujarYDescargar();
  }
  doc.addEventListener('click', function(e){
    if (e.target.closest && e.target.closest('#pvl-share-download-btn')) {
      e.preventDefault();
      descargarTarjeta();
    }
  });
})();
