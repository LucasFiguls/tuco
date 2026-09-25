export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("54")) return digits;
  if (digits.startsWith("0")) return "54" + digits.slice(1);
  return digits;
}

export function interpolateTemplate(
  template: string,
  data: {
    nombre: string;
    numero_pedido: number;
    estado: string;
    monto: string;
    hora: string;
  }
): string {
  const estadoLabel: Record<string, string> = {
    PENDIENTE: "Pendiente",
    CONFIRMADO: "Confirmado",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
  };
  return template
    .replace(/\{\{nombre\}\}/g, data.nombre)
    .replace(/\{\{numero_pedido\}\}/g, `#${data.numero_pedido}`)
    .replace(/\{\{estado\}\}/g, estadoLabel[data.estado] ?? data.estado)
    .replace(/\{\{monto\}\}/g, `$${Number(data.monto).toLocaleString("es-AR")}`)
    .replace(/\{\{hora\}\}/g, data.hora);
}

export function buildWaLink(phone: string, message?: string): string {
  const normalized = normalizePhone(phone);
  const base = `https://wa.me/${normalized}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
