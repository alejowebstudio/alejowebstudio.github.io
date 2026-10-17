(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* Antes / después */
  var ba = $('.ba-stage');
  if (ba) {
    var r = $('.ba-range', ba);
    var set = function () { ba.style.setProperty('--p', r.value + '%'); };
    r.addEventListener('input', set); set();
  }

  /* Filtros de trabajos */
  var fl = $('.filters');
  if (fl) {
    fl.hidden = false;
    $$('button', fl).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        $$('button', fl).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        $$('#works .work').forEach(function (w) { w.hidden = !(f === 'todos' || w.getAttribute('data-cat') === f); });
      });
    });
  }

  /* Calculadora */
  var calc = $('#calculadora');
  if (!calc) return;
  calc.hidden = false;
  var fx = $('#cFx');
  function money(n) { return n + ' USD'; }
  function upd() {
    var base = $('input[name=base]:checked', calc);
    var bv = parseInt(base.value, 10), name = base.getAttribute('data-n');
    var shop = bv === 0, dyn = bv === 130;
    fx.disabled = !dyn;
    var lines = [], total = bv, fns = dyn ? $$('input:checked', fx).map(function (i) { return i.value; }) : [];
    lines.push([name, shop ? 'a medida' : money(bv)]);
    if (dyn) {
      if (fns.length) lines.push([fns[0], 'incluida']);
      fns.slice(1).forEach(function (f) { total += 30; lines.push([f, '+30']); });
    }
    if ($('#cEn').checked) { total += 25; lines.push(['Versión en inglés', '+25']); }
    var pg = Math.max(0, Math.min(10, parseInt($('#cPg').value, 10) || 0));
    if (pg) { total += 20 * pg; lines.push([pg + (pg > 1 ? ' páginas extra' : ' página extra'), '+' + 20 * pg]); }
    if ($('#cWa').checked) { total += 25; lines.push(['WhatsApp Business configurado', '+25']); }
    var mt = $('#cMt').checked;
    $('#cTot').textContent = shop ? 'A medida' : total;
    $('#cTot').nextElementSibling.textContent = shop ? 'presupuesto cerrado antes de empezar' : 'USD · pago único';
    var h = Math.ceil(total / 2);
    $('#cSplit').textContent = shop ? 'Te enviamos el precio exacto en 48 horas' : h + ' al empezar + ' + (total - h) + ' al terminar';
    $('#cLines').innerHTML = lines.map(function (l) { return '<li><span>' + l[0] + '</span><span>' + l[1] + '</span></li>'; }).join('');
    $('#cMon').hidden = !mt; $('#cMon').textContent = 'Después: mantenimiento de 10 USD al mes (hasta 3 cambios).';
    var sum = 'Quiero: ' + name + (dyn && fns.length ? ' (' + fns.join(', ') + ')' : '') + '\n' +
      lines.slice(1).map(function (l) { return '- ' + l[0] + (l[1] === 'incluida' ? ' (incluida)' : ' ' + l[1]); }).join('\n') +
      (mt ? '\n- Mantenimiento mensual 10 USD' : '') + '\nTotal calculado: ' + (shop ? 'a medida' : total + ' USD') +
      '\n\nNegocio:\nCiudad y país:\nWeb actual o Instagram:\nWhatsApp:\n';
    $('#cSend').href = 'https://mail.google.com/mail/?view=cm&fs=1&to=alejo.webstudio@gmail.com&su=' +
      encodeURIComponent('Presupuesto: ' + name + (shop ? '' : ' (' + total + ' USD)')) + '&body=' + encodeURIComponent(sum);
    calc._sum = sum;
  }
  calc.addEventListener('input', upd);
  calc.addEventListener('change', upd);
  $('#cCopy').addEventListener('click', function () {
    var b = this, t = 'Para: alejo.webstudio@gmail.com\n' + calc._sum;
    var ok = function () { b.textContent = '¡Copiado!'; setTimeout(function () { b.textContent = 'Copiar resumen'; }, 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function () {});
  });
  upd();
})();
