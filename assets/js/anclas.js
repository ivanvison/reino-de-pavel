/* Old deep links (issue #18). Every section used to live on this page, so links
   like reino-de-pavel.dc.html#visa are out there. A section that moved to its
   own page is redirected there, keeping ?ref= and the anchor. Runs in the real
   <head>, before support.js, so the redirect happens before anything renders. */
(function(){
  var MOVED = {"banda-sonora": "banda-sonora.html", "bandera": "el-reino.html", "biblioteca": "biblioteca.html", "calendario": "documentos.html", "ciudadania": "documentos.html", "constitucion": "el-reino.html", "decreto": "ministerios.html", "descargas": "descargas.html", "descartes": "el-reino.html", "documentos": "documentos.html", "emblema": "el-reino.html", "juego": "arcade.html", "moneda": "documentos.html", "orden-unicornio": "honores.html", "papeleria": "documentos.html", "premio-pavel": "honores.html", "pvl-changelog": "cronica.html", "quejas": "ministerios.html", "quiz": "ministerios.html", "test-psi": "ministerios.html", "visa": "documentos.html"};
  function go(){
    var id = (location.hash || '').slice(1);
    try { id = decodeURIComponent(id); } catch (e) {}
    if (Object.prototype.hasOwnProperty.call(MOVED, id)) location.replace(MOVED[id] + location.search + '#' + id);
  }
  go();
  window.addEventListener('hashchange', go);
})();
