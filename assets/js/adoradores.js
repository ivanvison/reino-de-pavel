/* Tabla de adoradores (broma, sin backend) + convocatoria/enlace de
   invitacion (pvl-board- / pvl-invite-). Mismo candado de doble ejecucion
   que el resto de <helmet>. Lee el nombre del peregrino con la misma
   cookie/localStorage que "El Mundo de Pavel"; el enlace de invitacion es
   solo texto generado en el navegador, nunca se envia a ningun sitio. */
(function(){
  if (window.__pvlGrowth) return;
  window.__pvlGrowth = true;
  var doc = document;

  function leerNombrePeregrino(){
    var m = doc.cookie.match(/(?:^|; )pavelense=([^;]*)/);
    if (m) {
      try { return decodeURIComponent(m[1]).trim(); } catch (e) { return String(m[1] || '').trim(); }
    }
    try { return (localStorage.getItem('pavelense') || '').trim(); } catch (e) { return ''; }
  }
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }

  /* ---------- Tabla de adoradores (broma) ---------- */
  function pintarTabla(){
    var el = doc.getElementById('pvl-board-line1');
    if (!el) return;
    var n = leerNombrePeregrino();
    var L = lang();
    if (n) {
      el.textContent = L === 'es' ? ('1. ' + n + ', que existe.') : ('1. ' + n + ', who exists.');
    } else {
      el.textContent = L === 'es' ? '1. Tú, en cuanto te registres en El Mundo de Pavel.' : '1. You, once you register in The World of Pavel.';
    }
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', pintarTabla);
  else pintarTabla();
  setInterval(pintarTabla, 800);
  doc.addEventListener('pavel:langchange', pintarTabla);

  /* ---------- Convocatoria / enlace de invitacion ---------- */
  function baseUrl(){
    try { return new URL('reino-de-pavel.dc.html', location.href).href; } catch (e) { return location.origin + location.pathname; }
  }
  function pintarEnlace(){
    var inp = doc.getElementById('pvl-invite-link');
    if (!inp) return;
    var n = leerNombrePeregrino();
    var url = baseUrl();
    if (n) url += '?ref=' + encodeURIComponent(n);
    inp.value = url;
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', pintarEnlace);
  else pintarEnlace();
  setInterval(pintarEnlace, 800);

  function copiarEnlace(){
    var inp = doc.getElementById('pvl-invite-link');
    var status = doc.getElementById('pvl-invite-status');
    if (!inp) return;
    var L = lang();
    function marcarCopiado(){
      if (status) status.textContent = L === 'es' ? 'Convocatoria copiada.' : 'Summons copied.';
    }
    function marcarFallo(){
      inp.focus();
      inp.select();
      if (status) status.textContent = L === 'es' ? 'No se pudo copiar solo: seleccionado, cópielo con Ctrl/Cmd+C.' : 'Could not copy automatically: selected, copy it with Ctrl/Cmd+C.';
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inp.value).then(marcarCopiado, marcarFallo);
    } else {
      marcarFallo();
    }
    setTimeout(function(){ if (status) status.textContent = ''; }, 5000);
  }
  doc.addEventListener('click', function(e){
    if (e.target.closest && e.target.closest('#pvl-invite-copy')) {
      e.preventDefault();
      copiarEnlace();
    }
  });

  /* ---------- "Convocatoria recibida de..." si se llega con ?ref= ---------- */
  function pintarReferido(){
    var box = doc.getElementById('pvl-invite-referred-by');
    if (!box) return;
    var params;
    try { params = new URLSearchParams(location.search); } catch (e) { return; }
    var ref = (params.get('ref') || '').trim().slice(0, 32);
    if (!ref) return;
    var es = doc.getElementById('pvl-invite-referrer-es');
    var en = doc.getElementById('pvl-invite-referrer-en');
    if (es) es.textContent = ref;
    if (en) en.textContent = ref;
    box.classList.remove('pvl-hide');
    box.style.removeProperty('display');
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', pintarReferido);
  else pintarReferido();
  /* Mismo motivo que el reintento del quiz: #pvl-invite-referred-by podria
     no existir todavia si support.js aun no ha montado <x-dc>. */
  var referidoTries = 0;
  var referidoRetry = setInterval(function(){
    referidoTries++;
    if (doc.getElementById('pvl-invite-referred-by') || referidoTries > 20) { clearInterval(referidoRetry); return; }
    pintarReferido();
  }, 300);
})();
