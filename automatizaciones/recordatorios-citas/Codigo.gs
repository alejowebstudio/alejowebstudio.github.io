/**
 * Recordatorios de citas · Alejo Web Studio
 *
 * Qué hace, cada mañana a las 8:00:
 *  1. Busca en la hoja "Citas" las citas de MAÑANA que aún no tienen recordatorio.
 *  2. Si el cliente tiene correo, le envía un recordatorio por email.
 *  3. Si tiene teléfono, prepara en la hoja "WhatsApp de hoy" un enlace que abre
 *     WhatsApp con el mensaje ya escrito: el negocio solo pulsa y envía.
 *  4. Marca la cita como avisada para no repetir.
 *
 * Instalación: Extensiones > Apps Script, pega este archivo, guarda y ejecuta
 * "instalar" una vez (pide permiso para usar la hoja y enviar correos).
 * Gratis: una cuenta de Gmail puede enviar hasta 100 correos al día con Apps Script.
 */

var HOJA_CITAS = 'Citas';
var HOJA_AJUSTES = 'Ajustes';
var HOJA_WHATSAPP = 'WhatsApp de hoy';
var COLUMNAS = ['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Correo', 'Servicio', 'Recordatorio'];

/* ---------- Lógica pura (sin Google): se puede probar fuera ---------- */

function esFecha_(v) {
  return Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v.getTime());
}

function claveDia_(fecha) {
  return fecha.getFullYear() + '-' + ('0' + (fecha.getMonth() + 1)).slice(-2) + '-' + ('0' + fecha.getDate()).slice(-2);
}

function manana_(hoy) {
  var d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
  return claveDia_(d);
}

function horaTexto_(valor) {
  if (esFecha_(valor)) {
    return ('0' + valor.getHours()).slice(-2) + ':' + ('0' + valor.getMinutes()).slice(-2);
  }
  return String(valor || '').trim();
}

function limpiarTelefono_(tel, prefijoPais) {
  var digitos = String(tel || '').replace(/\D/g, '');
  if (!digitos) return '';
  var prefijo = String(prefijoPais || '').replace(/\D/g, '');
  if (prefijo && digitos.indexOf(prefijo) !== 0) digitos = prefijo + digitos;
  return digitos;
}

function correoValido_(c) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(c || '').trim());
}

function rellenar_(plantilla, datos) {
  return String(plantilla).replace(/\{(\w+)\}/g, function (_, k) {
    return datos[k] !== undefined ? datos[k] : '';
  });
}

/**
 * filas: arrays con COLUMNAS (sin cabecera). Devuelve qué hacer con cada una.
 */
function planificar_(filas, hoy, ajustes) {
  var objetivo = manana_(hoy);
  var acciones = [];
  for (var i = 0; i < filas.length; i++) {
    var f = filas[i];
    var fecha = esFecha_(f[0]) ? f[0] : (f[0] ? new Date(f[0]) : null);
    if (!fecha || isNaN(fecha.getTime())) continue;
    if (claveDia_(fecha) !== objetivo) continue;
    if (String(f[6] || '').trim() !== '') continue; // ya avisada
    var datos = {
      negocio: ajustes.negocio,
      cliente: String(f[2] || '').trim(),
      hora: horaTexto_(f[1]),
      servicio: String(f[5] || '').trim(),
      direccion: ajustes.direccion
    };
    var texto = rellenar_(ajustes.mensaje, datos);
    var tel = limpiarTelefono_(f[3], ajustes.prefijo);
    acciones.push({
      fila: i + 2, // +1 cabecera, +1 índice desde 1
      cliente: datos.cliente,
      hora: datos.hora,
      correo: correoValido_(f[4]) ? String(f[4]).trim() : '',
      asunto: rellenar_(ajustes.asunto, datos),
      texto: texto,
      whatsapp: tel ? 'https://wa.me/' + tel + '?text=' + encodeURIComponent(texto) : ''
    });
  }
  return acciones;
}

/* ---------- Parte de Google Sheets ---------- */

function leerAjustes_(libro) {
  var hoja = libro.getSheetByName(HOJA_AJUSTES);
  var valores = hoja.getRange(1, 1, hoja.getLastRow(), 2).getValues();
  var a = {};
  valores.forEach(function (v) { a[String(v[0]).trim()] = String(v[1]).trim(); });
  return {
    negocio: a['Nombre del negocio'] || 'Nuestro negocio',
    direccion: a['Dirección'] || '',
    prefijo: a['Prefijo del país'] || '',
    asunto: a['Asunto del correo'] || 'Recordatorio de tu cita en {negocio}',
    mensaje: a['Mensaje'] || 'Hola {cliente}, te recordamos tu cita de {servicio} mañana a las {hora} en {negocio}.'
  };
}

function enviarRecordatorios() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(HOJA_CITAS);
  var ultima = hoja.getLastRow();
  if (ultima < 2) return;
  var filas = hoja.getRange(2, 1, ultima - 1, COLUMNAS.length).getValues();
  var ajustes = leerAjustes_(libro);
  var acciones = planificar_(filas, new Date(), ajustes);

  var wa = libro.getSheetByName(HOJA_WHATSAPP) || libro.insertSheet(HOJA_WHATSAPP);
  wa.clearContents();
  wa.appendRow(['Hora', 'Cliente', 'Enviar por WhatsApp (pulsa y envía)']);

  var restantes = MailApp.getRemainingDailyQuota();
  acciones.forEach(function (a) {
    var marca = [];
    if (a.correo && restantes > 0) {
      MailApp.sendEmail({ to: a.correo, subject: a.asunto, body: a.texto, name: ajustes.negocio });
      restantes--;
      marca.push('correo');
    }
    if (a.whatsapp) {
      wa.appendRow([a.hora, a.cliente, a.whatsapp]);
      marca.push('WhatsApp preparado');
    }
    if (marca.length) {
      hoja.getRange(a.fila, 7).setValue(marca.join(' + ') + ' · ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM HH:mm'));
    }
  });
}

function instalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'enviarRecordatorios') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('enviarRecordatorios').timeBased().everyDays(1).atHour(8).create();
  enviarRecordatorios();
}

/* Exportación solo para pruebas fuera de Google (no afecta a Apps Script). */
if (typeof module !== 'undefined') {
  module.exports = { planificar_: planificar_, limpiarTelefono_: limpiarTelefono_, rellenar_: rellenar_, manana_: manana_ };
}
