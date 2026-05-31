import type { CartItem, CheckoutData } from "./types";

export function buildWhatsAppUrl(
  items: CartItem[],
  checkout: CheckoutData,
  numeroPedido: number,
  total: number
): string {
  const numero = process.env.WHATSAPP_NUMBER ?? "";

  const lineasItems = items
    .map((i) => `  • ${i.cantidad}x ${i.nombre} — $${(i.precio * i.cantidad).toLocaleString("es-AR")}`)
    .join("\n");

  const modalidadTexto =
    checkout.modalidad === "DELIVERY"
      ? `Delivery a: ${checkout.direccion_entrega}`
      : "Retiro en local";

  const mensaje = `
🍽️ *Nuevo pedido Tuco #${numeroPedido}*

👤 *Cliente:* ${checkout.cliente_nombre}
📱 *Teléfono:* ${checkout.cliente_telefono}

📋 *Detalle:*
${lineasItems}

💰 *Total: $${total.toLocaleString("es-AR")}*

🚚 *Modalidad:* ${modalidadTexto}
📅 *Fecha:* ${checkout.fecha_entrega}
🕐 *Hora:* ${checkout.hora_entrega}
${checkout.comentarios ? `\n💬 *Comentarios:* ${checkout.comentarios}` : ""}
  `.trim();

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
