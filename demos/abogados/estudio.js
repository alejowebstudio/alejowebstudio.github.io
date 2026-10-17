(function () {
  'use strict';
  // Acordeón de áreas
  [].forEach.call(document.querySelectorAll('.area button'), function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
      b.nextElementSibling.hidden = open;
    });
  });

  // Evaluador de casos
  var Q = [
    { q: '¿De qué trata tu caso?', k: 'area', o: ['Trabajo o despido', 'Familia o herencia', 'Alquiler o deudas', 'Mi empresa o negocio'] },
    { q: '¿En qué punto estás?', k: 'fase', o: ['Solo quiero informarme', 'Recibí una carta o notificación', 'Ya hay un juicio en marcha'] },
    { q: '¿Hay alguna fecha límite?', k: 'plazo', o: ['Sí, en menos de 15 días', 'Sí, en más de 15 días', 'No lo sé', 'No'] }
  ];
  var DOCS = {
    'Trabajo o despido': ['Contrato de trabajo', 'Últimas nóminas o boletas', 'Carta de despido o liquidación'],
    'Familia o herencia': ['Documentos de identidad', 'Partidas de nacimiento o matrimonio', 'Títulos de propiedad, si los hay'],
    'Alquiler o deudas': ['Contrato de alquiler o préstamo', 'Recibos y comprobantes de pago', 'Mensajes o cartas recibidas'],
    'Mi empresa o negocio': ['Escritura o registro de la empresa', 'Contratos o facturas implicados', 'Correos con la otra parte']
  };
  var a = {}, i = 0, box = document.getElementById('box');
  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
  function step() {
    if (i >= Q.length) return result();
    var s = Q[i];
    box.innerHTML = '<p class="prog">Pregunta ' + (i + 1) + ' de ' + Q.length + '</p><p class="q">' + s.q + '</p><div class="ch">' +
      s.o.map(function (o) { return '<button type="button">' + esc(o) + '</button>'; }).join('') + '</div>' +
      (i ? '<button type="button" class="back">← Volver</button>' : '');
    [].forEach.call(box.querySelectorAll('.ch button'), function (b) {
      b.addEventListener('click', function () { a[s.k] = b.textContent; i++; step(); });
    });
    var bk = box.querySelector('.back'); if (bk) bk.addEventListener('click', function () { i--; step(); });
    var first = box.querySelector('.ch button'); if (first && i) first.focus();
  }
  function result() {
    var urgent = a.plazo === 'Sí, en menos de 15 días' || a.fase === 'Ya hay un juicio en marcha';
    box.innerHTML = '<div class="res"><p class="prog">Resultado</p><h3>' + (urgent ? 'Caso con prioridad alta' : 'Caso para consulta inicial') + '</h3>' +
      '<p>' + (urgent ? 'Por los plazos, conviene que hablemos en las próximas 24 horas. No esperes a tener todos los papeles.' : 'Agenda la consulta gratuita y trae estos documentos para aprovecharla al máximo.') + '</p>' +
      '<dl><dt>Área</dt><dd>' + esc(a.area) + '</dd><dt>Situación</dt><dd>' + esc(a.fase) + '</dd><dt>Plazo</dt><dd>' + esc(a.plazo) + '</dd></dl>' +
      '<p><b>Documentos a preparar:</b></p><ul style="color:var(--muted);padding-left:18px;margin:6px 0 16px">' + DOCS[a.area].map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul>' +
      '<label>Tu nombre<input id="evn" autocomplete="name"></label>' +
      '<button type="button" class="solid" id="evs" disabled>Solicitar consulta</button> <button type="button" class="back" id="evr">Empezar de nuevo</button></div>';
    var n = document.getElementById('evn'), s = document.getElementById('evs');
    n.addEventListener('input', function () { s.disabled = n.value.trim().length < 2; });
    s.addEventListener('click', function () {
      box.innerHTML = '<div class="res"><p class="prog">Solicitud enviada</p><h3>Gracias, ' + esc(n.value.trim()) + '.</h3><p>En la web real, el estudio recibiría ahora tu caso ordenado por correo y te respondería en menos de 24 horas.</p><button type="button" class="back" id="evr">Evaluar otro caso</button></div>';
      document.getElementById('evr').addEventListener('click', reset);
    });
    document.getElementById('evr').addEventListener('click', reset);
  }
  function reset() { a = {}; i = 0; step(); }
  step();
})();
