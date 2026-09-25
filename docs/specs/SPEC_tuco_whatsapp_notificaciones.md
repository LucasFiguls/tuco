# SPEC: Notificaciones WhatsApp por cambio de estado — Tuco Admin

## Contexto

Cuando el admin cambia el estado de un pedido, quiere poder notificar al cliente vía WhatsApp con un mensaje personalizado según el nuevo estado. Esta primera versión (MVP) usa el esquema `wa.me` con mensaje pre-cargado — abre WhatsApp Web/App en el navegador del admin, quien envía manualmente. No requiere API externa ni costo.

El diseño debe permitir una migración futura a WhatsApp Business API (envío automático) sin rediseñar el flujo.

---

## Alcance

### ✅ Lo que incluye este SPEC
- Ícono de WhatsApp en cada tarjeta de pedido (Kanban) que al presionarlo abre WhatsApp con mensaje pre-cargado.
- Plantillas de mensaje configurables por estado desde la pantalla de Configuración.
- Sección nueva en Configuración: "Plantillas de WhatsApp".
- Persistencia de plantillas en base de datos.

### ❌ Lo que NO incluye
- Envío automático de mensajes (sin intervención del admin).
- Integración con WhatsApp Business API / Twilio / Meta Cloud API.
- Historial de mensajes enviados.
- Confirmación de lectura o delivery.
- Cambios en la lógica de estados o en el Kanban más allá de agregar el ícono.

---

## Requerimiento funcional

### RF-01: Ícono de WhatsApp en tarjeta de pedido

Cada tarjeta del Kanban muestra un ícono de WhatsApp (SVG o emoji 📱, preferentemente el logo verde reconocible). El ícono:

- Es visible siempre en la tarjeta, no requiere hover.
- Al hacer click, construye el link `https://wa.me/<telefono>?text=<mensaje_codificado>` y lo abre en una nueva pestaña.
- El `<telefono>` es el número registrado en el pedido, normalizado al formato internacional (sin espacios, sin guiones, sin `+`, con código de país). El teléfono viene del campo existente en el pedido.
- El `<mensaje_codificado>` es la plantilla del estado actual del pedido, con las variables interpoladas (ver RF-03), codificada con `encodeURIComponent`.
- Si el pedido no tiene teléfono registrado, el ícono aparece deshabilitado (gris, sin acción, con tooltip "Sin teléfono registrado").
- Si no hay plantilla configurada para ese estado, el ícono abre WhatsApp sin texto pre-cargado (link básico `wa.me/<telefono>`).

### RF-02: Normalización del teléfono

El número debe enviarse en formato E.164 sin el `+`. Reglas para números argentinos:

- Si empieza con `0`: quitar el `0` y agregar `54` al inicio → `011 1234-5678` → `541112345678`
- Si empieza con `15`: es celular sin código de área, no normalizar automáticamente (marcar como inválido).
- Si ya empieza con `54`: usar tal cual.
- Si tiene caracteres no numéricos (espacios, guiones, paréntesis): limpiarlos antes de procesar.

Si el número no puede normalizarse con certeza, abrir igualmente el link con el número limpio (solo dígitos) y dejar que WhatsApp lo resuelva.

### RF-03: Variables de plantilla

Las plantillas soportan variables que se reemplazan al construir el mensaje. Variables disponibles:

| Variable | Valor |
|---|---|
| `{{nombre}}` | Nombre del cliente en el pedido |
| `{{numero_pedido}}` | Número de pedido (`#N`) |
| `{{estado}}` | Nombre del nuevo estado |
| `{{monto}}` | Monto total del pedido |
| `{{hora}}` | Hora de retiro del pedido |

Ejemplo de plantilla para estado "Confirmado":
```
Hola {{nombre}}! Tu pedido {{numero_pedido}} fue confirmado ✅ y estará listo a las {{hora}}. ¡Gracias por elegirnos!
```

### RF-04: Configuración de plantillas

En la pantalla de **Configuración** del admin, agregar una sección nueva: **"Plantillas de WhatsApp"**.

La sección muestra una sub-sección por cada estado existente:
- Pendiente
- Confirmado  
- Entregado
- Cancelado

Cada sub-sección tiene:
- **Toggle habilitado/deshabilitado**: si está deshabilitado, el ícono de WhatsApp para pedidos en ese estado aparece deshabilitado (gris).
- **Textarea de plantilla**: texto libre con soporte de variables `{{variable}}`. Mostrar las variables disponibles como referencia debajo del textarea (no clickeables, solo documentación visual).
- **Botón "Guardar"** por sección (o un único "Guardar todo" al final — decisión de implementación).
- **Preview en tiempo real**: debajo del textarea, mostrar el mensaje con variables reemplazadas por valores de ejemplo (`{{nombre}}` → "María", `{{numero_pedido}}` → "#42", etc.).

### RF-05: Persistencia de plantillas

Las plantillas se guardan en la base de datos (Prisma + PostgreSQL/Supabase). Modelo:

```prisma
model WhatsappTemplate {
  id        Int      @id @default(autoincrement())
  estado    String   @unique  // "PENDIENTE" | "CONFIRMADO" | "ENTREGADO" | "CANCELADO"
  habilitado Boolean @default(true)
  plantilla String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

API routes (Next.js):
- `GET /api/admin/whatsapp-templates` — devuelve todas las plantillas.
- `PUT /api/admin/whatsapp-templates/:estado` — actualiza plantilla y toggle de un estado.

Ambas rutas están protegidas con la misma autenticación que el resto del admin.

---

## Requerimiento técnico

- El link `wa.me` se construye **en el cliente** (sin llamada al backend al hacer click).
- No instalar librerías adicionales para esta feature — usar las ya disponibles en el proyecto.
- El ícono de WhatsApp es un SVG inline del logo oficial (verde #25D366).
- Utilidades en `lib/whatsapp.ts`: `normalizePhone`, `interpolateTemplate`, `buildWaLink`.

---

## Criterios de aceptación

1. Al hacer click en el ícono de WhatsApp de una tarjeta, se abre una nueva pestaña con WhatsApp Web y el mensaje pre-cargado según la plantilla del estado actual.
2. Las variables `{{nombre}}`, `{{numero_pedido}}`, `{{estado}}`, `{{monto}}`, `{{hora}}` se reemplazan correctamente en el mensaje.
3. Si el toggle de un estado está deshabilitado en Configuración, el ícono de esa tarjeta aparece gris y no hace nada al clickear.
4. Las plantillas se persisten en base de datos y sobreviven un reload de la página.
5. El preview en tiempo real en Configuración muestra el mensaje con valores de ejemplo mientras el admin escribe.
6. Si un pedido no tiene teléfono, el ícono está deshabilitado con tooltip informativo.
7. El resto de la aplicación no tiene regresiones.

---

## Migración futura a Business API

Cuando se quiera pasar a envío automático, los cambios necesarios serán:
- Reemplazar la función `buildWaLink()` por una llamada a `/api/admin/whatsapp-send`.
- El backend llama a Twilio/Meta API con la misma plantilla ya almacenada.
- Las plantillas, el modelo de datos y la pantalla de Configuración **no cambian**.

---

## Fuera de scope (explícito)

- Envío automático al cambiar estado (sin click del admin).
- Múltiples plantillas por estado.
- Soporte de imágenes o archivos en el mensaje.
- Tracking de si el mensaje fue enviado/leído.
- Soporte para números fuera de Argentina en esta versión.
