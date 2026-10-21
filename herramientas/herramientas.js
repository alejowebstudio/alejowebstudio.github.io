(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
  function copy(text, btn) {
    var done = function () { var t = btn.textContent; btn.textContent = '¡Copiado!'; setTimeout(function () { btn.textContent = t; }, 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else fallback();
    function fallback() { var i = $('wlink'); i.focus(); i.select(); try { document.execCommand('copy'); done(); } catch (e) {} }
  }

  /* ---------- 1. WhatsApp + QR ---------- */
  var CC = [['51', 'Perú'], ['593', 'Ecuador'], ['591', 'Bolivia'], ['57', 'Colombia'], ['52', 'México'], ['56', 'Chile'], ['54', 'Argentina'], ['595', 'Paraguay'], ['598', 'Uruguay'], ['58', 'Venezuela'], ['502', 'Guatemala'], ['503', 'El Salvador'], ['504', 'Honduras'], ['505', 'Nicaragua'], ['506', 'Costa Rica'], ['507', 'Panamá'], ['1', 'Rep. Dominicana / EE. UU.'], ['34', 'España']];
  CC.forEach(function (c) { var o = document.createElement('option'); o.value = c[0]; o.textContent = c[1] + ' +' + c[0]; $('wcc').appendChild(o); });
  function wa() {
    var num = $('wnum').value.replace(/\D/g, '').replace(/^0+/, '');
    var msg = $('wmsg').value.trim();
    var ok = num.length >= 6;
    var link = ok ? 'https://wa.me/' + $('wcc').value + num + (msg ? '?text=' + encodeURIComponent(msg) : '') : '';
    $('wlink').value = link || 'https://wa.me/…';
    $('wtry').href = link || '#';
    var cv = $('wqr'), ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    if (!ok) { $('wcap').textContent = 'Escribe tu número para generar el QR.'; $('wdl').setAttribute('aria-disabled', 'true'); $('wdl').href = '#'; return; }
    try {
      var qr = qrcode(0, 'M'); qr.addData(link); qr.make();
      var n = qr.getModuleCount(), size = 640, margin = 4, cell = Math.floor(size / (n + margin * 2));
      cv.width = cv.height = cell * (n + margin * 2);
      ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); ctx.fillStyle = '#0F1B33';
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect((c + margin) * cell, (r + margin) * cell, cell, cell);
      $('wdl').href = cv.toDataURL('image/png'); $('wdl').setAttribute('aria-disabled', 'false');
      $('wcap').textContent = 'Escanéalo con la cámara del celular para probarlo.';
    } catch (e) { $('wcap').textContent = 'El mensaje es demasiado largo para el QR. Acórtalo un poco.'; }
  }
  ['wcc', 'wnum', 'wmsg'].forEach(function (id) { $(id).addEventListener('input', wa); });
  $('wcopy').addEventListener('click', function () { if ($('wlink').value.indexOf('…') < 0) copy($('wlink').value, $('wcopy')); });
  $('wdl').addEventListener('click', function (e) { if (this.getAttribute('aria-disabled') === 'true') e.preventDefault(); });
  $('wtry').addEventListener('click', function (e) { if (this.getAttribute('href') === '#') e.preventDefault(); });
  wa();

  /* ---------- 2. Vista previa en Google ---------- */
  function cut(s, n) { return s.length > n ? s.slice(0, n - 1).trim() + '…' : s; }
  function g() {
    var t = $('gt').value.trim(), d = $('gd').value.trim(), u = $('gu').value.trim().replace(/^https?:\/\//, '').replace(/\/$/, '') || 'tunegocio.com';
    var name = (t.split(/[|·\-–]/)[0] || u).trim();
    $('sf').textContent = (name[0] || 'W').toUpperCase();
    $('sn').textContent = name; $('su').textContent = 'https://' + u;
    $('st').textContent = cut(t || 'Sin título', 60);
    $('sd').textContent = cut(d || 'Google elegirá un trozo de texto de tu página, que puede no ser el que quieres.', 158);
    var tc = $('gtc'), dc = $('gdc');
    tc.textContent = t.length + ' / 60 caracteres'; tc.className = 'cnt ' + (t.length >= 25 && t.length <= 60 ? 'ok' : 'bad');
    dc.textContent = d.length + ' / 155 caracteres'; dc.className = 'cnt ' + (d.length >= 70 && d.length <= 158 ? 'ok' : 'bad');
    var low = (t + ' ' + d).toLowerCase(), tips = [];
    tips.push([t.length >= 25 && t.length <= 60, t.length > 60 ? 'El título es largo: Google lo cortará.' : t.length < 25 ? 'El título es corto: añade qué haces y dónde.' : 'Buen largo de título.']);
    tips.push([d.length >= 70 && d.length <= 158, d.length > 158 ? 'La descripción se cortará: déjala en unos 150 caracteres.' : d.length < 70 ? 'La descripción es corta: cuenta qué ofreces y cómo contactarte.' : 'Buen largo de descripción.']);
    tips.push([/\b(en|de)\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/.test(t + ' ' + d), 'Incluye tu ciudad: la gente busca "dentista en Arequipa", no solo "dentista".']);
    tips.push([/(whatsapp|cita|llám|reserv|pide|escríb|pedido)/.test(low), 'Invita a actuar: "pide tu cita", "escríbenos por WhatsApp".']);
    tips.push([!/^(home|inicio|index)\b/.test(t.toLowerCase()) && t.length > 0, 'No uses "Home" o "Inicio" como título: no dice nada de tu negocio.']);
    $('gtips').innerHTML = tips.map(function (x) { return '<li class="' + (x[0] ? '' : 'no') + '">' + esc(x[1]) + '</li>'; }).join('');
  }
  ['gt', 'gd', 'gu'].forEach(function (id) { $(id).addEventListener('input', g); });
  g();

  /* ---------- 3. Test de tu web ---------- */
  var Q = [
    ['¿Tu web carga y se ve bien en el celular?', 15, 'Hacer que la web se vea bien en el celular (es por donde entra la mayoría).'],
    ['¿Aparece el candado (HTTPS) y no dice "No seguro"?', 15, 'Activar HTTPS para que Chrome no la marque como "No seguro".'],
    ['¿Hay un botón de WhatsApp visible sin bajar?', 15, 'Poner un botón de WhatsApp fijo, visible desde el primer momento.'],
    ['¿Están tus precios o al menos "desde…"?', 10, 'Mostrar precios orientativos: evita preguntas y filtra clientes.'],
    ['¿Están la dirección, el mapa y el horario?', 10, 'Añadir dirección, mapa y horario actualizados.'],
    ['¿El año del pie de página es el actual?', 10, 'Actualizar el pie (un "© 2019" da sensación de abandono).'],
    ['¿Los iconos de redes llevan a tus perfiles reales?', 10, 'Revisar que cada icono de redes lleve a tu perfil.'],
    ['¿La pestaña del navegador dice tu nombre y tu ciudad?', 15, 'Cambiar el título por "Tu negocio | Qué haces en tu ciudad".']
  ];
  var ans = {};
  Q.forEach(function (q, i) {
    var d = document.createElement('div'); d.className = 'qi';
    d.innerHTML = '<span>' + esc(q[0]) + '</span><span class="seg" role="group" aria-label="Respuesta"><button type="button" data-v="1">Sí</button><button type="button" data-v="0">No</button><button type="button" data-v="2">No sé</button></span>';
    d.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        ans[i] = +b.getAttribute('data-v');
        d.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        result();
      });
    });
    $('qs').appendChild(d);
  });
  function result() {
    var n = Object.keys(ans).length;
    if (n < Q.length) { $('res').innerHTML = '<p class="empty-r">Te faltan ' + (Q.length - n) + ' preguntas.</p>'; return; }
    var score = 0, fixes = [];
    Q.forEach(function (q, i) { if (ans[i] === 1) score += q[1]; else fixes.push([q[1], q[2]]); });
    fixes.sort(function (a, b) { return b[0] - a[0]; });
    var v = score >= 85 ? ['Tu web está en buena forma', 'Solo quedan detalles. Si quieres, te decimos cuáles gratis.', 'var(--ok)', 'Mantenimiento (10 USD/mes) o un cambio suelto'] :
      score >= 55 ? ['Tu web funciona, pero pierde clientes', 'Con unos arreglos concretos puede traerte bastantes más contactos.', 'var(--accent)', 'Renovar tu web (60 USD)'] :
        ['Tu web te está quitando clientes', 'Lo más rentable suele ser rehacerla: rápida, segura y pensada para el celular.', 'var(--bad)', 'Renovar tu web (60 USD) o una web nueva (75 USD)'];
    var body = 'Hice el test de mi web y saqué ' + score + '/100.\nLo que me falta:\n' + fixes.map(function (f) { return '- ' + f[1]; }).join('\n') + '\n\nMi web:\nNegocio:\nCiudad y país:\n';
    var gm = 'https://mail.google.com/mail/?view=cm&fs=1&to=alejo.webstudio@gmail.com&su=' + encodeURIComponent('Test de mi web: ' + score + '/100') + '&body=' + encodeURIComponent(body);
    $('res').innerHTML = '<div class="score"><div class="ring" style="--v:' + score + ';--c:' + v[2] + '"><span>' + score + '</span></div><div class="verdict"><h3>' + v[0] + '</h3><p>' + v[1] + '</p></div></div>' +
      (fixes.length ? '<p style="margin-top:20px;font-weight:600">Arregla primero:</p><ol class="fixes">' + fixes.slice(0, 4).map(function (f) { return '<li>' + esc(f[1]) + '</li>'; }).join('') + '</ol>' : '<p style="margin:18px 0">No encontramos fallos básicos. ¡Bien hecho!</p>') +
      '<div class="planrec"><span class="hint">Lo que te recomendamos</span><b>' + v[3] + '</b></div>' +
      '<a class="btn btn-primary" target="_blank" rel="noopener" href="' + esc(gm) + '">Enviarnos el resultado y pedir maqueta</a>';
  }
})();
