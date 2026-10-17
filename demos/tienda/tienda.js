(function () {
  'use strict';
  var P = [
    { id: 1, n: 'Cumbre Clásico', c: 'Molido', o: 'Chocolate, nuez, cuerpo medio', p: 12, col: '#B4532A', pop: 9, tag: 'Más vendido' },
    { id: 2, n: 'Finca El Mirador', c: 'Grano', o: 'Panela, naranja, acidez brillante', p: 15, col: '#3F6B4A', pop: 8 },
    { id: 3, n: 'Geisha de altura', c: 'Grano', o: 'Jazmín, durazno, té negro', p: 24, col: '#6E4A8A', pop: 6, tag: 'Edición limitada' },
    { id: 4, n: 'Descafeinado suave', c: 'Molido', o: 'Caramelo, galleta, sin cafeína', p: 13, col: '#7A6A58', pop: 4 },
    { id: 5, n: 'Espresso Volcán', c: 'Grano', o: 'Cacao amargo, especias, intenso', p: 14, col: '#2A1E16', pop: 7 },
    { id: 6, n: 'Cápsulas Cumbre x10', c: 'Cápsulas', o: 'Compatibles con Nespresso', p: 7, col: '#C7893C', pop: 5 },
    { id: 7, n: 'Prensa francesa 600 ml', c: 'Accesorios', o: 'Vidrio y acero, para 4 tazas', p: 22, col: '#4C6B7A', pop: 3 },
    { id: 8, n: 'Pack degustación', c: 'Packs', o: '3 cafés de 100 g para probar', p: 18, col: '#9A3B4E', pop: 8, tag: 'Ideal para regalar' }
  ];
  var $ = function (id) { return document.getElementById(id); };
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem('cumbre-cart') || '{}') || {}; } catch (e) { cart = {}; }
  var cat = 'Todos';
  function save() { try { localStorage.setItem('cumbre-cart', JSON.stringify(cart)); } catch (e) {} }
  function money(v) { return v.toFixed(2) + ' USD'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }

  var cats = ['Todos'].concat(P.map(function (p) { return p.c; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
  cats.forEach(function (c) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = c;
    b.setAttribute('aria-pressed', c === cat ? 'true' : 'false');
    b.addEventListener('click', function () { cat = c; [].forEach.call($('cats').children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); render(); });
    $('cats').appendChild(b);
  });
  $('q').addEventListener('input', render);
  $('sort').addEventListener('change', render);

  function render() {
    var q = $('q').value.trim().toLowerCase(), s = $('sort').value;
    var list = P.filter(function (p) { return (cat === 'Todos' || p.c === cat) && (!q || (p.n + ' ' + p.o).toLowerCase().indexOf(q) >= 0); });
    list.sort(function (a, b) { return s === 'asc' ? a.p - b.p : s === 'desc' ? b.p - a.p : b.pop - a.pop; });
    $('grid').innerHTML = list.length ? list.map(function (p) {
      return '<article class="p"><div class="bag" style="background:color-mix(in srgb,' + p.col + ' 16%, #F4EDE2)">' +
        (p.tag ? '<span class="tag">' + esc(p.tag) + '</span>' : '') +
        '<div class="pk" style="--c:' + p.col + '"><span>' + esc(p.n.split(' ')[0]) + '</span></div></div>' +
        '<h3>' + esc(p.n) + '</h3><p class="notes">' + esc(p.o) + '</p>' +
        '<div class="row"><span class="price">' + money(p.p) + '</span><button class="add" data-id="' + p.id + '">Añadir</button></div></article>';
    }).join('') : '<p class="empty">No encontramos cafés con esa búsqueda.</p>';
  }
  $('grid').addEventListener('click', function (e) {
    var b = e.target.closest('.add'); if (!b) return;
    var id = b.getAttribute('data-id'); cart[id] = (cart[id] || 0) + 1; save(); totals();
    b.textContent = '✓ Añadido'; b.classList.add('ok');
    setTimeout(function () { b.textContent = 'Añadir'; b.classList.remove('ok'); }, 1100);
  });

  function totals() {
    var n = 0, sub = 0, lines = [];
    Object.keys(cart).forEach(function (id) {
      var p = P.filter(function (x) { return String(x.id) === id; })[0]; if (!p || cart[id] < 1) { delete cart[id]; return; }
      n += cart[id]; sub += p.p * cart[id]; lines.push([p, cart[id]]);
    });
    var ship = sub >= 40 ? 0 : parseFloat($('zone').value);
    $('count').textContent = n;
    $('sub').textContent = money(sub); $('shipv').textContent = sub >= 40 && $('zone').value !== '0' ? 'Gratis' : money(ship);
    $('total').textContent = money(sub + ship);
    $('items').innerHTML = lines.length ? lines.map(function (l) {
      return '<div class="it"><div><div class="n">' + esc(l[0].n) + '</div><div class="s">' + money(l[0].p) + ' c/u</div></div>' +
        '<div class="q"><button data-d="-1" data-id="' + l[0].id + '" aria-label="Quitar uno">−</button><span>' + l[1] + '</span><button data-d="1" data-id="' + l[0].id + '" aria-label="Añadir uno">+</button></div></div>';
    }).join('') : '<p class="empty" style="padding:30px 0">Tu carrito está vacío.</p>';
    var name = $('cname').value.trim();
    var ok = lines.length && name.length > 1;
    var msg = 'Hola, soy ' + name + '. Quiero hacer este pedido:\n' + lines.map(function (l) { return '• ' + l[1] + ' x ' + l[0].n + ' (' + money(l[0].p * l[1]) + ')'; }).join('\n') +
      '\nEntrega: ' + $('zone').options[$('zone').selectedIndex].text + '\nTotal: ' + money(sub + ship);
    $('send').href = ok ? 'https://wa.me/?text=' + encodeURIComponent(msg) : '#';
    $('send').setAttribute('aria-disabled', ok ? 'false' : 'true');
    save();
  }
  $('items').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-id]'); if (!b) return;
    var id = b.getAttribute('data-id'); cart[id] = (cart[id] || 0) + parseInt(b.getAttribute('data-d'), 10); totals();
  });
  $('zone').addEventListener('change', totals);
  $('cname').addEventListener('input', totals);
  function open(v) { $('drawer').hidden = !v; $('scrim').hidden = !v; if (v) $('closeCart').focus(); else $('openCart').focus(); }
  $('openCart').addEventListener('click', function () { open(true); });
  $('closeCart').addEventListener('click', function () { open(false); });
  $('scrim').addEventListener('click', function () { open(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('drawer').hidden) open(false); });
  render(); totals();
})();
