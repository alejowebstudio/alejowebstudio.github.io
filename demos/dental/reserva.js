(function () {
  'use strict';
  var T = [['Limpieza', 40], ['Blanqueamiento', 90], ['Valoración de ortodoncia', 30], ['Valoración de implantes', 30], ['Revisión', 30]];
  var HOURS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
  var DN = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  var MN = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var st = { t: null, d: null, h: null };
  var $ = function (id) { return document.getElementById(id); };

  function btn(cls, html, on) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = cls; b.innerHTML = html; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', on); return b;
  }
  function press(group, el) {
    [].forEach.call(group.children, function (c) { c.setAttribute('aria-pressed', c === el ? 'true' : 'false'); });
  }
  // pseudo-aleatorio estable por día para simular huecos ocupados
  function busy(date, i) { var n = date.getDate() * 31 + date.getMonth() * 7 + i * 13; return (n % 5) === 0 || (n % 7) === 0; }

  T.forEach(function (t) {
    $('treatments').appendChild(btn('opt', t[0], function (e) { st.t = t; press($('treatments'), e.currentTarget); upd(); }));
  });
  var today = new Date(); today.setHours(0, 0, 0, 0);
  for (var k = 1; k <= 14; k++) {
    (function (d) {
      var b = btn('day', DN[d.getDay()] + '<b>' + d.getDate() + '</b>', function (e) { st.d = d; st.h = null; press($('days'), e.currentTarget); hours(); upd(); });
      if (d.getDay() === 0) b.disabled = true;
      $('days').appendChild(b);
    })(new Date(today.getTime() + k * 864e5));
  }
  function hours() {
    var h = $('hours'); h.innerHTML = '';
    HOURS.forEach(function (x, i) {
      var b = btn('opt', x, function (e) { st.h = x; press(h, e.currentTarget); upd(); });
      if (busy(st.d, i) || (st.d.getDay() === 6 && i > 6)) { b.disabled = true; b.title = 'Ocupado'; }
      h.appendChild(b);
    });
  }
  function fmt(d) { return DN[d.getDay()].toLowerCase() + ' ' + d.getDate() + ' de ' + MN[d.getMonth()]; }
  function upd() {
    var n = $('name').value.trim();
    $('s2').className = st.t && st.d ? 'on' : '';
    $('s3').className = st.t && st.d && st.h && n ? 'on' : '';
    if (st.t && st.d && st.h) {
      $('sum').innerHTML = '<b>' + st.t[0] + '</b> · ' + fmt(st.d) + ' a las <b>' + st.h + '</b> · ' + st.t[1] + ' min';
    }
    $('go').disabled = !(st.t && st.d && st.h && n.length > 1);
  }
  $('name').addEventListener('input', upd);
  $('go').addEventListener('click', function () {
    $('doneText').textContent = $('name').value.trim() + ', te esperamos el ' + fmt(st.d) + ' a las ' + st.h + ' para tu ' + st.t[0].toLowerCase() + '.';
    $('form').hidden = true; $('done').hidden = false;
  });
  $('again').addEventListener('click', function () { location.reload(); });
})();
