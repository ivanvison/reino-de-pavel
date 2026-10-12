/* Interruptor de idioma EN/ES. Igual que el himno, este bloque se ejecuta dos
   veces (parseo + remontaje de support.js), de ahi el candado global. Guarda
   la eleccion en localStorage (por defecto ingles) y alterna .pvl-hide en
   cada nodo [data-lang], ademas de refrescar atributos alt/placeholder que
   llevan su traduccion en data-alt-es/en y data-ph-es/en. Dispara
   "pavel:langchange" para que los demas scripts repinten sus textos dinamicos. */
(function(){
  if (window.PavelI18N) return;
  var doc = document;
  var KEY = 'pavel-lang';
  var cur = 'en';

  function read(){
    try {
      var v = localStorage.getItem(KEY);
      if (v === 'es' || v === 'en') return v;
    } catch (e) {}
    return 'en';
  }

  function apply(lang){
    if (lang !== 'es' && lang !== 'en') lang = 'en';
    cur = lang;
    doc.documentElement.setAttribute('lang', lang);
    doc.documentElement.setAttribute('data-lang', lang);

    var nodes = doc.querySelectorAll('[data-lang]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i], nl = n.getAttribute('data-lang');
      if (nl === 'es' || nl === 'en') n.classList.toggle('pvl-hide', nl !== lang);
    }
    var altNodes = doc.querySelectorAll('[data-alt-en]');
    for (var j = 0; j < altNodes.length; j++) {
      var an = altNodes[j];
      an.setAttribute('alt', lang === 'es' ? (an.getAttribute('data-alt-es') || '') : (an.getAttribute('data-alt-en') || ''));
    }
    var phNodes = doc.querySelectorAll('[data-ph-en]');
    for (var k = 0; k < phNodes.length; k++) {
      var pn = phNodes[k];
      pn.setAttribute('placeholder', lang === 'es' ? (pn.getAttribute('data-ph-es') || '') : (pn.getAttribute('data-ph-en') || ''));
    }
    var lblNodes = doc.querySelectorAll('[data-aria-en]');
    for (var l = 0; l < lblNodes.length; l++) {
      var ln = lblNodes[l];
      ln.setAttribute('aria-label', lang === 'es' ? (ln.getAttribute('data-aria-es') || '') : (ln.getAttribute('data-aria-en') || ''));
    }
    var btns = doc.querySelectorAll('[data-lang-btn]');
    for (var m = 0; m < btns.length; m++) {
      var b = btns[m], active = b.getAttribute('data-lang-btn') === lang;
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
      b.classList.toggle('pvl-lang-active', active);
    }
    try { doc.dispatchEvent(new CustomEvent('pavel:langchange', { detail: { lang: lang } })); } catch (e) {}
  }

  function set(lang){
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    apply(lang);
  }

  window.PavelI18N = { get: function(){ return cur; }, set: set, apply: apply };

  doc.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('[data-lang-btn]');
    if (t) set(t.getAttribute('data-lang-btn'));
  });

  function boot(){ apply(read()); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot();

  /* support.js remonta/re-renderiza el contenido de <x-dc> de forma asincrona
     despues del arranque (igual que le pasa al reproductor del himno), lo
     que sustituye los nodos y borraria las clases .pvl-hide ya aplicadas.
     Un resync periodico (barato: solo unas pasadas de querySelectorAll)
     mantiene sincronizado el idioma visible pase lo que pase con el remontaje. */
  setInterval(function(){ apply(cur); }, 400);
})();
