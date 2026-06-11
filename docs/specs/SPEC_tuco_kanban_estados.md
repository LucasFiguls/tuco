# SPEC: Kanban de estados para pedidos — Tuco Admin

## Contexto

La pantalla de administración (`/admin` → tab "Pedidos") actualmente muestra los pedidos en una lista vertical. Cada pedido expandido expone botones de transición de estado (`→ Confirmado`, `→ Entregado`, `→ Cancelado`).

Este SPEC describe **únicamente** el cambio de UX para gestionar el estado de los pedidos: reemplazar los botones de transición inline por un tablero tipo Kanban con columnas por estado, donde los pedidos se arrastran entre columnas.

---

## Alcance

### ✅ Lo que cambia
- La **vista de la pantalla de Pedidos** en el panel admin pasa de lista a tablero Kanban.
- El mecanismo para cambiar el estado de un pedido: de botones inline a **drag & drop entre columnas**.

### ❌ Lo que NO cambia
- Los **estados definidos** y su lógica de negocio (Pendiente, Confirmado, Entregado, Cancelado).
- La **lógica de backend** que actualiza el estado del pedido (misma función/endpoint que hoy).
- Los **datos mostrados** en cada tarjeta de pedido (nombre, fecha, monto, tipo, teléfono).
- El **filtro "Todos"** (dropdown de filtro por estado).
- La navegación: tabs Pedidos / Menú / Configuración y el botón Salir.
- La vista de **Menú** y **Configuración** — sin tocar.
- El **código de autenticación/sesión** ni ningún otro módulo fuera de la vista de pedidos.

---

## Requerimiento funcional

### RF-01: Tablero Kanban

La vista de pedidos muestra **4 columnas**, una por estado, en este orden de izquierda a derecha:

| Columna | Estado |
|---|---|
| 1 | Pendiente |
| 2 | Confirmado |
| 3 | Entregado |
| 4 | Cancelado |

Cada pedido se representa como una **tarjeta** ubicada en la columna que corresponde a su estado actual.

### RF-02: Tarjeta de pedido

Cada tarjeta debe mostrar, como mínimo:
- Número de pedido (`#N`)
- Nombre del cliente
- Monto total
- Fecha y hora de entrega/retiro (formato `dd/MM · HH:MM`)
- Tipo (Retiro / Delivery — si aplica)

No es necesario mostrar el detalle de ítems en la tarjeta. El detalle puede estar disponible en un click/expand posterior si ya existía esa funcionalidad — pero ese comportamiento **no se modifica**.

### RF-03: Drag & drop

- El usuario puede **arrastrar una tarjeta** desde su columna actual y **soltarla en otra columna** para cambiar el estado del pedido.
- Al soltar la tarjeta en una columna destino válida, se debe invocar la **misma lógica de actualización de estado** que hoy usan los botones inline.
- Durante el arrastre, la tarjeta debe tener feedback visual (opacidad reducida, cursor `grabbing`).
- La columna destino debe tener feedback visual al recibir un elemento en hover (highlight de borde o fondo).

### RF-04: Transiciones válidas

Respetar las mismas transiciones que hoy permiten los botones. Si hoy el sistema permite mover libremente entre cualquier estado (sin restricciones de flujo), el Kanban debe hacer lo mismo. Si hay restricciones, deben mantenerse y el drop en columna inválida debe descartarse silenciosamente (sin error visible).

### RF-05: Filtro

El dropdown de filtro existente ("Todos", "Pendiente", etc.) **se mantiene**. Al seleccionar un estado, el tablero muestra solo las tarjetas de ese estado (o todas si es "Todos"). Las columnas vacías se muestran igual (vacías, con encabezado visible).

### RF-07: Ordenamiento de tarjetas por columna

El orden de las tarjetas dentro de cada columna sigue este criterio, basado en `created_at`:

| Columna | Orden | Criterio |
|---|---|---|
| Pendiente | ASC (más viejo arriba) | Requieren atención — el más antiguo tiene prioridad |
| Confirmado | ASC (más viejo arriba) | Idem — en curso, el más antiguo debe entregarse primero |
| Entregado | DESC (más nuevo arriba) | Consulta histórica — lo más reciente es lo relevante |
| Cancelado | DESC (más nuevo arriba) | Consulta histórica — lo más reciente es lo relevante |

El ordenamiento es client-side sobre los datos ya cargados.

### RF-06: Contador por columna

Cada columna muestra el count de tarjetas que contiene, junto al nombre del estado. Igual que en la imagen de referencia de Jira (ej: `EN CURSO 4`).

---

## Stack técnico del proyecto

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + TypeScript
- **Estilos**: Tailwind CSS v4
- **DB/ORM**: Prisma + PostgreSQL (Supabase)
- **Notificaciones**: Sonner (ya instalado)

## Requerimiento técnico

- Instalar **`@dnd-kit/core`** y **`@dnd-kit/utilities`** como dependencia de drag & drop. Es la librería estándar para React moderno y compatible con Next.js App Router. No usar otras alternativas.
- Agregar `"use client"` al componente Kanban (necesario por los event handlers de DnD en Next.js App Router).
- El estado local del tablero debe sincronizarse con el backend al hacer drop (mismo mecanismo que hoy).
- La pantalla debe ser **responsive básico**: en mobile, las columnas pueden apilarse verticalmente (scroll horizontal o stack), sin romper la funcionalidad.
- No modificar los archivos de rutas, autenticación, o cualquier módulo fuera del componente de vista de pedidos.

---

## Criterios de aceptación

1. La pantalla de Pedidos carga mostrando las 4 columnas con los pedidos en su estado actual.
2. Arrastrar una tarjeta a otra columna actualiza el estado en el backend y la tarjeta queda en la nueva columna.
3. El filtro sigue funcionando.
4. Los estados y su nomenclatura son exactamente los mismos que antes del refactor.
5. El resto de la aplicación (Menú, Configuración, lógica de negocio) funciona sin cambios.
6. No hay regresiones en la funcionalidad existente.

---

## Referencias visuales

- **UX objetivo**: Tablero Jira — columnas con cards, drag & drop entre columnas, contador por columna.
- **UX actual**: Lista vertical con botones de transición inline por pedido.

---

## Fuera de scope (explícito)

- Ordenamiento dentro de una columna por drag & drop.
- Persistencia del orden de tarjetas dentro de una columna.
- Agregar nuevos estados.
- Edición de datos del pedido desde el Kanban.
- Notificaciones o webhooks al cambiar estado.
