/* Generador de decretos + Ministerio de Quejas + quiz "Que tan pavelense
   eres" + test psicologico de broma. Mismo candado de doble ejecucion que
   el resto de <helmet>. Nada de lo que se escribe aqui se guarda ni se
   envia a ningun sitio. */
(function(){
  if (window.__pvlPlay) return;
  window.__pvlPlay = true;
  var doc = document;
  function lang(){ return (window.PavelI18N && window.PavelI18N.get()) || 'en'; }

  /* support.js construye su plantilla de React a partir del HTML que encuentra
     dentro de <x-dc> y solo despues lo sustituye por #dc-root. Si pintamos
     dentro de <x-dc> antes de ese remontaje, los nodos generados aqui acaban
     formando parte de la plantilla; cuando el runtime relee el archivo y
     re-renderiza con la plantilla limpia, React intenta borrar esos nodos --
     que este script ya habia sustituido con innerHTML = '' -- y revienta con
     "removeChild: The node to be removed is not a child of this node".
     Por eso solo se pinta cuando el contenedor ya esta montado, es decir,
     cuando ha dejado de colgar de la plantilla cruda. */
  function montado(el){
    return !!el && (!el.closest || !el.closest('x-dc'));
  }

  /* ---------- Generador de decretos ---------- */
  var DECREE_OPEN = {
    es: function(t){ return 'Por la presente, el Ministerio de la Grandeza se pronuncia sobre ' + t + ' con la autoridad que le confiere no necesitar autorización de nadie.'; },
    en: function(t){ return 'By these presents, the Ministry of Greatness rules on ' + t + ' with the authority conferred by needing no one’s approval.'; }
  };
  var DECREE_MID = [
    { es: function(t){ return 'Queda establecido que ' + t + ' se interpretará siempre a favor de la grandeza, y en caso de duda, también.'; },
      en: function(t){ return 'It is hereby established that ' + t + ' shall always be interpreted in favor of greatness, and in case of doubt, also.'; } },
    { es: function(t){ return 'Se instruye a todo súbdito a considerar ' + t + ' un asunto resuelto, archivado y, en cierto modo, glorioso.'; },
      en: function(t){ return 'Every subject is instructed to consider ' + t + ' a settled, filed, and in some sense glorious matter.'; } },
    { es: function(t){ return 'El Ministerio reconoce la existencia de ' + t + ', le desea lo mejor, y sigue adelante sin cambiar nada.'; },
      en: function(t){ return 'The Ministry acknowledges the existence of ' + t + ', wishes it well, and proceeds without changing anything.'; } },
    { es: function(t){ return 'A partir de hoy, ' + t + ' entra en los anales del Reino, justo debajo del himno y justo encima del Descartes rectificado.'; },
      en: function(t){ return 'As of today, ' + t + ' enters the annals of the Kingdom, just below the anthem and just above the rectified Descartes.'; } }
  ];
  var DECREE_CLOSE = [
    { es: 'Cúmplase, publíquese y, si es posible, cántese de pie.', en: 'Let it be fulfilled, published, and, if possible, sung standing up.' },
    { es: 'Firmado en el cielo, sin necesidad de testigos.', en: 'Signed in heaven, no witnesses required.' },
    { es: 'Registrado bajo el Artículo I de la Constitución, como todo lo demás.', en: 'Filed under Article I of the Constitution, like everything else.' }
  ];
  var lastDecree = null;
  function renderDecree(){
    var out = doc.getElementById('pvl-decree-output');
    if (!out || !lastDecree) return;
    var L = lang();
    out.innerHTML = '';
    var p1 = doc.createElement('p'); p1.textContent = DECREE_OPEN[L](lastDecree.topic);
    var p2 = doc.createElement('p'); p2.textContent = DECREE_MID[lastDecree.mid][L](lastDecree.topic);
    var p3 = doc.createElement('p'); p3.style.fontWeight = '600'; p3.textContent = DECREE_CLOSE[lastDecree.close][L];
    out.appendChild(p1); out.appendChild(p2); out.appendChild(p3);
  }
  doc.addEventListener('submit', function(e){
    if (e.target && e.target.id === 'pvl-decree-form') {
      e.preventDefault();
      var inp = doc.getElementById('pvl-decree-input');
      var topic = String((inp && inp.value) || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      if (!topic) { if (inp) inp.focus(); return; }
      lastDecree = { topic: topic, mid: Math.floor(Math.random() * DECREE_MID.length), close: Math.floor(Math.random() * DECREE_CLOSE.length) };
      renderDecree();
    }
  });

  /* ---------- Ministerio de Quejas ---------- */
  var COMPLAINT_REPLIES = [
    { es: 'Su queja ha sido recibida y reclasificada como elogio.', en: 'Your complaint has been received and reclassified as praise.' },
    { es: 'El Ministerio le agradece su confianza y no hará nada al respecto.', en: 'The Ministry thanks you for your trust and will do nothing about it.' },
    { es: 'Esta queja se ha archivado junto a las demás, en un cajón que no existe.', en: 'This complaint has been filed alongside the others, in a drawer that does not exist.' },
    { es: 'Se le informa de que el Artículo I ya cubre este caso.', en: 'You are informed that Article I already covers this case.' },
    { es: 'Su inquietud es válida, pero la grandeza no admite enmiendas.', en: 'Your concern is valid, but greatness admits no amendments.' },
    { es: 'El Ministerio ha decidido, por unanimidad de un solo miembro, no opinar.', en: 'The Ministry has decided, by unanimous vote of one member, not to comment.' },
    { es: 'Gracias por escribir. Su carta ha sido enmarcada.', en: 'Thank you for writing. Your letter has been framed.' },
    { es: 'Esto se ha reenviado a un departamento que tampoco existe.', en: 'This has been forwarded to a department that also does not exist.' }
  ];
  var lastComplaint = null;
  function renderComplaint(){
    var out = doc.getElementById('pvl-complaints-output');
    if (!out || !lastComplaint) return;
    var L = lang();
    out.innerHTML = '';
    var box = doc.createElement('div');
    box.className = 'pvl-complaints-reply';
    var label = doc.createElement('div');
    label.style.cssText = "font:600 8.5px/1.4 'IBM Plex Mono',monospace;letter-spacing:.24em;color:#6b4f16";
    label.textContent = L === 'es' ? 'RESPUESTA OFICIAL' : 'OFFICIAL REPLY';
    var quote = doc.createElement('div');
    quote.className = 'pvl-complaints-quote';
    quote.textContent = '“' + lastComplaint.text + '”';
    var reply = doc.createElement('p');
    reply.style.cssText = "margin:0;font:300 14px/1.65 'IBM Plex Sans',sans-serif";
    reply.textContent = COMPLAINT_REPLIES[lastComplaint.idx][L];
    box.appendChild(label); box.appendChild(quote); box.appendChild(reply);
    out.appendChild(box);
  }
  doc.addEventListener('submit', function(e){
    if (e.target && e.target.id === 'pvl-complaints-form') {
      e.preventDefault();
      var inp = doc.getElementById('pvl-complaints-input');
      var text = String((inp && inp.value) || '').replace(/\s+/g, ' ').trim().slice(0, 240);
      if (!text) { if (inp) inp.focus(); return; }
      lastComplaint = { text: text, idx: Math.floor(Math.random() * COMPLAINT_REPLIES.length) };
      renderComplaint();
      if (inp) inp.value = '';
    }
  });

  /* ---------- Quiz "Que tan pavelense eres" ---------- */
  var QUIZ = [
    { es: '¿A qué hora te levantas a adorar la grandeza?', en: 'What time do you get up to worship greatness?',
      opts: [ { es:'No me acuesto.', en:"I don't sleep.", pts:4 }, { es:'Antes del amanecer.', en:'Before dawn.', pts:3 }, { es:'A una hora razonable.', en:'At a reasonable hour.', pts:2 }, { es:'Cuando Pavel lo decida.', en:'Whenever Pavel decides.', pts:4 } ] },
    { es: '¿Cuántos unicornios tienes?', en: 'How many unicorns do you own?',
      opts: [ { es:'Ninguno, todavía.', en:'None, yet.', pts:1 }, { es:'Uno, prestado.', en:'One, borrowed.', pts:2 }, { es:'Uno, propio.', en:'One, my own.', pts:3 }, { es:'Soy el unicornio de unicornios.', en:'I am the unicorn of unicorns.', pts:4 } ] },
    { es: '¿Con qué frecuencia escuchas el himno?', en: 'How often do you listen to the anthem?',
      opts: [ { es:'Nunca lo he oído.', en:"I've never heard it.", pts:1 }, { es:'De vez en cuando.', en:'Now and then.', pts:2 }, { es:'En bucle, de pie.', en:'On loop, standing up.', pts:4 }, { es:'Lo tarareo en sueños.', en:'I hum it in my sleep.', pts:3 } ] },
    { es: '¿Qué opinas del orden alfabético Pavel-grandeza?', en: 'What do you think of the Pavel-before-greatness alphabetical order?',
      opts: [ { es:'Nunca lo había pensado.', en:"I'd never thought about it.", pts:1 }, { es:'Tiene sentido.', en:'It makes sense.', pts:2 }, { es:'Es innegociable.', en:'It is non-negotiable.', pts:4 }, { es:'Lo defendería en un tribunal.', en:'I would defend it in court.', pts:3 } ] },
    { es: '¿Qué harías si Descartes dudara de ti?', en: 'What would you do if Descartes doubted you?',
      opts: [ { es:'Dudaría también.', en:'I would doubt too.', pts:1 }, { es:'Le recordaría el Artículo I.', en:'I would remind him of Article I.', pts:3 }, { es:'Le pediría una rectificación por escrito.', en:'I would ask for a written correction.', pts:4 }, { es:'Le ofrecería una copia del himno.', en:'I would offer him a copy of the anthem.', pts:2 } ] },
    { es: '¿Cuánto oro llevas puesto ahora mismo?', en: 'How much gold are you wearing right now?',
      opts: [ { es:'Ninguno.', en:'None.', pts:1 }, { es:'Un poco, discretamente.', en:'A little, discreetly.', pts:2 }, { es:'Bastante, con letter-spacing.', en:'Quite a lot, with letter-spacing.', pts:3 }, { es:'Soy dorado por dentro.', en:'I am gold on the inside.', pts:4 } ] }
  ];
  var RANKS = [
    { max:12, es:'Peregrino', en:'Pilgrim', descEs:'Vas por buen camino, literalmente.', descEn:'You are on the right path, literally.' },
    { max:17, es:'Ciudadano', en:'Citizen', descEs:'Existes porque Pavel existe, y lo sabes.', descEn:'You exist because Pavel exists, and you know it.' },
    { max:21, es:'Ministro', en:'Minister', descEs:'Casi tienes despacho propio.', descEn:'You almost have your own office.' },
    { max:99, es:'Casi Soberano', en:'Sovereign-Adjacent', descEs:'Solo te falta el trono. Y nacer antes del Big Bang.', descEn:'All you’re missing is the throne. And being born before the Big Bang.' }
  ];
  var quizIdx = 0, quizScore = 0, quizDone = false;
  function quizRestart(){ quizIdx = 0; quizScore = 0; quizDone = false; renderQuiz(); }
  function renderQuiz(){
    var body = doc.getElementById('pvl-quiz-body');
    var prog = doc.getElementById('pvl-quiz-progress');
    if (!body) return;
    var L = lang();
    body.innerHTML = '';
    if (quizDone) {
      if (prog) prog.textContent = '';
      var rank = RANKS[0];
      for (var r = 0; r < RANKS.length; r++) { if (quizScore <= RANKS[r].max) { rank = RANKS[r]; break; } }
      var lead = doc.createElement('div');
      lead.textContent = L === 'es' ? 'TU RANGO ES' : 'YOUR RANK IS';
      lead.style.cssText = "font:600 8.5px/1.4 'IBM Plex Mono',monospace;letter-spacing:.26em;color:#e9c874";
      var title = doc.createElement('div');
      title.className = 'pvl-quiz-rank';
      title.textContent = rank[L];
      var desc = doc.createElement('p');
      desc.style.cssText = "margin:14px 0 0;font:300 13.5px/1.6 'IBM Plex Sans',sans-serif;color:rgba(244,239,226,.75)";
      desc.textContent = L === 'es' ? rank.descEs : rank.descEn;
      var again = doc.createElement('button');
      again.type = 'button';
      again.style.cssText = 'margin-top:20px;padding:12px 18px;border:1px solid rgba(233,200,116,.5);background:transparent;color:#f4e0a8;font:600 11px/1 \'IBM Plex Sans\',sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer';
      again.textContent = L === 'es' ? 'Repetir el quiz' : 'Retake the quiz';
      again.addEventListener('click', quizRestart);
      body.appendChild(lead); body.appendChild(title); body.appendChild(desc); body.appendChild(again);
      return;
    }
    var q = QUIZ[quizIdx];
    if (prog) prog.textContent = (L === 'es' ? 'PREGUNTA ' : 'QUESTION ') + (quizIdx + 1) + ' / ' + QUIZ.length;
    var qEl = doc.createElement('div');
    qEl.style.cssText = "margin-top:8px;font-family:'Bodoni Moda',serif;font-size:19px;line-height:1.4;color:#f7f2e6";
    qEl.textContent = q[L];
    body.appendChild(qEl);
    for (var i = 0; i < q.opts.length; i++) {
      (function(opt){
        var b = doc.createElement('button');
        b.type = 'button';
        b.className = 'pvl-quiz-option';
        b.textContent = opt[L];
        b.addEventListener('click', function(){
          quizScore += opt.pts;
          quizIdx++;
          if (quizIdx >= QUIZ.length) quizDone = true;
          renderQuiz();
        });
        body.appendChild(b);
      })(q.opts[i]);
    }
  }
  var quizBooted = false;
  function bootQuiz(){
    if (quizBooted) return;
    if (!montado(doc.getElementById('pvl-quiz-body'))) return;
    quizBooted = true;
    renderQuiz();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', bootQuiz); else bootQuiz();
  /* La primera pasada puede correr antes de que support.js monte el
     contenido de <x-dc> (igual que le pasa a otros scripts de <helmet>),
     asi que #pvl-quiz-body podria no existir todavia -- se reintenta hasta
     que exista, en vez de dejar el quiz vacio para siempre. */
  var quizBootRetry = setInterval(function(){
    if (quizBooted) { clearInterval(quizBootRetry); return; }
    bootQuiz();
  }, 300);

  /* ---------- Test psicologico de broma (Ministerio del Fuero Interno) ---------- */
  var PSYCH_Q = [
    { blot: true,
      es: 'El Ministerio le muestra esta mancha de tinta oficial. ¿Qué ve?',
      en: 'The Ministry shows you this official inkblot. What do you see?',
      opts: [
        { es: 'La silueta de Pavel, evidentemente.', en: "Pavel's silhouette, obviously.", type: 'pilgrim' },
        { es: 'Un unicornio, evidentemente.', en: 'A unicorn, obviously.', type: 'unicorn' },
        { es: 'Un sello que todavía no han puesto.', en: 'A stamp that has not yet been applied.', type: 'decree' },
        { es: 'Un filósofo que debería disculparse.', en: 'A philosopher who ought to apologize.', type: 'cogito' }
      ] },
    { es: 'Despierta y todavía no ha pensado en Pavel. Usted:',
      en: 'You wake up and have not yet thought about Pavel. You:',
      opts: [
        { es: 'Contiene la respiración hasta que ocurra.', en: 'Hold your breath until it happens.', type: 'pilgrim' },
        { es: 'Tararea el himno: cuenta igual.', en: 'Hum the anthem: it still counts.', type: 'unicorn' },
        { es: 'Redacta una queja contra el amanecer.', en: 'Draft a complaint against sunrise.', type: 'decree' },
        { es: 'Duda de si despertar cuenta como existir.', en: 'Doubt whether waking counts as existing.', type: 'cogito' }
      ] },
    { es: 'Si fuera un árbol en el Reino, sería:',
      en: 'If you were a tree in the Kingdom, you would be:',
      opts: [
        { es: 'El que se inclina hacia el trono.', en: 'The one leaning toward the throne.', type: 'pilgrim' },
        { es: 'El que tiene un unicornio atado.', en: 'The one with a unicorn tied to it.', type: 'unicorn' },
        { es: 'Un formulario, archivado por error como árbol.', en: 'A form, incorrectly filed as a tree.', type: 'decree' },
        { es: 'Un árbol del que Descartes no está seguro.', en: 'A tree Descartes is not sure is there.', type: 'cogito' }
      ] },
    { es: 'Un peregrino discrepa con usted sobre la grandeza. Usted:',
      en: 'A pilgrim disagrees with you about greatness. You:',
      opts: [
        { es: 'Le invita a adorar hasta que deje de discrepar.', en: 'Invite them to worship until they stop.', type: 'pilgrim' },
        { es: 'Sonríe: la grandeza no discute.', en: 'Smile: greatness does not argue.', type: 'unicorn' },
        { es: 'Lo reenvía a un ministerio que no existe.', en: 'Forward it to a ministry that does not exist.', type: 'decree' },
        { es: 'Pregunta si alguno de los dos existe.', en: 'Ask whether either of you exists.', type: 'cogito' }
      ] },
    { es: 'Anoche soñó con:',
      en: 'Last night you dreamed of:',
      opts: [
        { es: 'El trono, otra vez.', en: 'The throne, again.', type: 'pilgrim' },
        { es: 'Volar, pero como el unicornio de unicornios.', en: 'Flying, but as the unicorn of unicorns.', type: 'unicorn' },
        { es: 'Una bandeja de quejas sin responder.', en: 'An inbox of unanswered complaints.', type: 'decree' },
        { es: 'Descartes pidiéndole una segunda opinión.', en: 'Descartes asking you for a second opinion.', type: 'cogito' }
      ] },
    { es: 'El Ministerio le ofrece un tratamiento. Usted elige:',
      en: 'The Ministry offers you a treatment. You choose:',
      opts: [
        { es: 'Más Pavel, de inmediato.', en: 'More Pavel, immediately.', type: 'pilgrim' },
        { es: 'Un unicornio de cortesía.', en: 'A complimentary unicorn.', type: 'unicorn' },
        { es: 'Un certificado sellado de que está bien.', en: 'A stamped certificate that you are fine.', type: 'decree' },
        { es: 'Una nota al pie en la Constitución.', en: 'A footnote in the Constitution.', type: 'cogito' }
      ] }
  ];
  var PSYCH_TYPES = {
    pilgrim: {
      code: 'PAVL',
      es: 'Peregrino Crónico', en: 'Chronic Pilgrim',
      axisEs: 'Pavel-Ansioso · Muy Leal', axisEn: 'Pavel-Anxious · Very Loyal',
      descEs: 'Comprueba varias veces al día si Pavel sigue existiendo. El Ministerio clasifica esto como salud.',
      descEn: 'You check several times a day that Pavel still exists. The Ministry classifies this as wellness.',
      rxEs: 'Tratamiento: acercarse al trono. No hay dosis máxima.',
      rxEn: 'Treatment: approach the throne. There is no maximum dose.'
    },
    unicorn: {
      code: 'UNIC',
      es: 'Unicornio-Seguro', en: 'Unicorn-Secure',
      axisEs: 'Imperturbable · Naturalmente Imperial', axisEn: 'Unbothered · Naturally Imperial',
      descEs: 'Ya vive como si el himno estuviera sonando. La terapia sería redundante, y un poco grosera.',
      descEn: 'You already live as if the anthem were playing. Therapy would be redundant, and a little rude.',
      rxEs: 'Tratamiento: mantener el bucle. El unicornio ya lo sabía.',
      rxEn: 'Treatment: keep the loop going. The unicorn already knew.'
    },
    decree: {
      code: 'DECR',
      es: 'Evitativo de Decretos', en: 'Decree-Avoidant',
      axisEs: 'Distante · Cumple por escrito', axisEn: 'Distant · Compliant on paper',
      descEs: 'Presenta quejas por deporte. El Ministerio ha diagnosticado esto como un hobby, y no piensa contestarle.',
      descEn: 'You file complaints for sport. The Ministry has diagnosed this as a hobby, and does not plan to reply.',
      rxEs: 'Tratamiento: un sello. El asunto queda resuelto, archivado y, en cierto modo, glorioso.',
      rxEn: 'Treatment: a stamp. The matter is settled, filed, and in some sense glorious.'
    },
    cogito: {
      code: 'COGT',
      es: 'Descartes-Ansioso', en: 'Descartes-Anxious',
      axisEs: 'Duda en continuo · Requiere Trono', axisEn: 'Doubts Continuously · Requires Throne',
      descEs: 'Piensa, por lo tanto entra en pánico, hasta que Pavel confirma que está. Cogito, ergo Pavel.',
      descEn: 'You think, therefore you panic, until Pavel confirms you. Cogito, ergo Pavel.',
      rxEs: 'Tratamiento: releer el Artículo I en voz alta, de pie, hasta que la duda se aburra.',
      rxEn: 'Treatment: reread Article I out loud, standing up, until the doubt gets bored.'
    }
  };
  var PSYCH_ORDER = ['pilgrim', 'unicorn', 'decree', 'cogito'];
  var psychIdx = 0, psychDone = false, psychTie = false, psychTally = { pilgrim: 0, unicorn: 0, decree: 0, cogito: 0 };
  function psychRestart(){
    psychIdx = 0; psychDone = false; psychTie = false;
    psychTally = { pilgrim: 0, unicorn: 0, decree: 0, cogito: 0 };
    renderPsych();
  }
  function pickPsychType(){
    var best = PSYCH_ORDER[0], bestN = psychTally[best] || 0;
    var i, n, ties = 0;
    for (i = 1; i < PSYCH_ORDER.length; i++) {
      n = psychTally[PSYCH_ORDER[i]] || 0;
      if (n > bestN) { best = PSYCH_ORDER[i]; bestN = n; }
    }
    for (i = 0; i < PSYCH_ORDER.length; i++) {
      if ((psychTally[PSYCH_ORDER[i]] || 0) === bestN) ties++;
    }
    return { key: best, tie: ties > 1 };
  }
  function renderPsych(){
    var body = doc.getElementById('pvl-psych-body');
    var prog = doc.getElementById('pvl-psych-progress');
    if (!body) return;
    var L = lang();
    body.innerHTML = '';
    if (psychDone) {
      if (prog) prog.textContent = '';
      var picked = pickPsychType();
      psychTie = picked.tie;
      var t = PSYCH_TYPES[picked.key];
      var lead = doc.createElement('div');
      lead.textContent = L === 'es' ? 'SU TIPO OFICIAL ES' : 'YOUR OFFICIAL TYPE IS';
      lead.style.cssText = "font:600 8.5px/1.4 'IBM Plex Mono',monospace;letter-spacing:.26em;color:#8f6f2a";
      var title = doc.createElement('div');
      title.className = 'pvl-psych-rank';
      title.textContent = t[L];
      var code = doc.createElement('div');
      code.className = 'pvl-psych-code';
      code.textContent = t.code + ' · ' + (L === 'es' ? t.axisEs : t.axisEn);
      var desc = doc.createElement('p');
      desc.style.cssText = "margin:14px 0 0;font:300 13.5px/1.6 'IBM Plex Sans',sans-serif;color:rgba(32,26,51,.75)";
      desc.textContent = L === 'es' ? t.descEs : t.descEn;
      var compat = doc.createElement('div');
      compat.style.cssText = "margin-top:16px;font:600 10px/1.4 'IBM Plex Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:#6b4f16";
      compat.textContent = L === 'es' ? 'Compatibilidad con Pavel: 100%' : 'Pavel compatibility: 100%';
      var rx = doc.createElement('p');
      rx.style.cssText = "margin:10px 0 0;font:300 13.5px/1.6 'IBM Plex Sans',sans-serif;color:rgba(32,26,51,.75)";
      rx.textContent = L === 'es' ? t.rxEs : t.rxEn;
      body.appendChild(lead); body.appendChild(title); body.appendChild(code);
      body.appendChild(desc); body.appendChild(compat); body.appendChild(rx);
      if (psychTie) {
        var tieEl = doc.createElement('p');
        tieEl.style.cssText = "margin:10px 0 0;font:300 12.5px/1.55 'IBM Plex Sans',sans-serif;color:rgba(32,26,51,.55);font-style:italic";
        tieEl.textContent = L === 'es'
          ? 'Empate estadístico: el Ministerio resuelve a favor de Pavel, como en todo lo demás.'
          : 'Statistical tie: the Ministry rules in favor of Pavel, as in everything else.';
        body.appendChild(tieEl);
      }
      var note = doc.createElement('p');
      note.style.cssText = "margin:16px 0 0;font:400 11.5px/1.55 'IBM Plex Sans',sans-serif;color:rgba(32,26,51,.5)";
      note.textContent = L === 'es'
        ? 'No es un diagnóstico. El Ministerio no está colegiado. Su psique no se guarda ni se envía a ningún sitio. Validez científica: revisada por pares (Pavel).'
        : 'This is not a diagnosis. The Ministry is not licensed. Your psyche is not stored or sent anywhere. Scientific validity: peer-reviewed (by Pavel).';
      var again = doc.createElement('button');
      again.type = 'button';
      again.style.cssText = 'margin-top:20px;padding:12px 18px;border:1px solid rgba(32,26,51,.35);background:#201a33;color:#f4efe2;font:600 11px/1 \'IBM Plex Sans\',sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer';
      again.textContent = L === 'es' ? 'Repetir el inventario' : 'Retake the inventory';
      again.addEventListener('click', psychRestart);
      body.appendChild(note); body.appendChild(again);
      return;
    }
    var q = PSYCH_Q[psychIdx];
    if (prog) prog.textContent = (L === 'es' ? 'ÍTEM ' : 'ITEM ') + (psychIdx + 1) + ' / ' + PSYCH_Q.length;
    if (q.blot) {
      var blot = doc.createElement('div');
      blot.className = 'pvl-psych-blot';
      blot.setAttribute('aria-hidden', 'true');
      var cap = doc.createElement('p');
      cap.className = 'pvl-psych-blot-caption';
      cap.textContent = L === 'es' ? 'Fig. 1 — Mancha oficial n.º 1' : 'Fig. 1 — Official blot no. 1';
      body.appendChild(blot); body.appendChild(cap);
    }
    var qEl = doc.createElement('div');
    qEl.style.cssText = "margin-top:8px;font-family:'Bodoni Moda',serif;font-size:19px;line-height:1.4;color:#201a33";
    qEl.textContent = q[L];
    body.appendChild(qEl);
    for (var i = 0; i < q.opts.length; i++) {
      (function(opt){
        var b = doc.createElement('button');
        b.type = 'button';
        b.className = 'pvl-psych-option';
        b.textContent = opt[L];
        b.addEventListener('click', function(){
          psychTally[opt.type] = (psychTally[opt.type] || 0) + 1;
          psychIdx++;
          if (psychIdx >= PSYCH_Q.length) psychDone = true;
          renderPsych();
        });
        body.appendChild(b);
      })(q.opts[i]);
    }
  }
  var psychBooted = false;
  function bootPsych(){
    if (psychBooted) return;
    if (!montado(doc.getElementById('pvl-psych-body'))) return;
    psychBooted = true;
    renderPsych();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', bootPsych); else bootPsych();
  var psychBootRetry = setInterval(function(){
    if (psychBooted) { clearInterval(psychBootRetry); return; }
    bootPsych();
  }, 300);

  doc.addEventListener('pavel:langchange', function(){
    renderDecree();
    renderComplaint();
    if (quizBooted) renderQuiz();
    if (psychBooted) renderPsych();
  });
})();
