import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

const ESTADOS = ["PENDIENTE", "CONFIRMADO", "ENTREGADO", "CANCELADO"] as const;

const DEFAULT_PLANTILLAS: Record<string, string> = {
  PENDIENTE:
    "Hola {{nombre}}! Recibimos tu pedido {{numero_pedido}} y lo estamos revisando. Te avisamos cuando esté confirmado.",
  CONFIRMADO:
    "Hola {{nombre}}! Tu pedido {{numero_pedido}} fue confirmado ✅ y estará listo a las {{hora}}. ¡Gracias por elegirnos!",
  ENTREGADO:
    "Hola {{nombre}}! Tu pedido {{numero_pedido}} fue entregado ✅. ¡Gracias por elegirnos! Esperamos verte pronto.",
  CANCELADO:
    "Hola {{nombre}}, lamentablemente tu pedido {{numero_pedido}} fue cancelado. Disculpá los inconvenientes.",
};

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rows = await prisma.whatsappTemplate.findMany();
  const result: Record<string, { habilitado: boolean; plantilla: string }> = {};

  for (const estado of ESTADOS) {
    const row = rows.find((r) => r.estado === estado);
    result[estado] = {
      habilitado: row?.habilitado ?? true,
      plantilla: row?.plantilla ?? DEFAULT_PLANTILLAS[estado],
    };
  }

  return NextResponse.json(result);
}
