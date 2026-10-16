# Recordatorios de citas automáticos

Automatización gratuita para clínicas, veterinarias, talleres y peluquerías, hecha con Google Sheets y Apps Script.

**Qué hace cada mañana a las 8:00**

1. Busca en la hoja **Citas** las citas de mañana que aún no tienen recordatorio.
2. Envía un correo de recordatorio a los clientes que tienen correo.
3. Prepara en la hoja **WhatsApp de hoy** un enlace por cliente que abre WhatsApp con el mensaje ya escrito: el negocio solo pulsa y envía.
4. Marca cada cita como avisada para no repetir.

**Instalación (10 minutos)**

1. Sube `Plantilla_citas.xlsx` a Google Drive y ábrela con Google Sheets.
2. En la hoja **Ajustes**, cambia las celdas amarillas (nombre, dirección, prefijo del país y mensaje).
3. Menú **Extensiones → Apps Script**, borra lo que haya, pega `Codigo.gs` y guarda.
4. Elige la función `instalar` y pulsa **Ejecutar**. Google pide permiso para usar la hoja y enviar correos: acéptalo con la cuenta del negocio.

**Límites**

- Una cuenta gratuita de Gmail puede enviar hasta 100 correos al día con Apps Script ([cuotas de Google](https://developers.google.com/apps-script/guides/services/quotas)).
- Los mensajes de WhatsApp no se envían solos: enviarlos automáticamente exige la API de WhatsApp Business, que cobra por mensaje. Con el enlace preparado el negocio envía cada uno en un toque, gratis.

Hecho por [Alejo Web Studio](https://alejowebstudio.github.io).
