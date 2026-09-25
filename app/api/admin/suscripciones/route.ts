import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const suscripciones = await prisma.suscripcion.findMany({
    orderBy: [{ estado: "asc" }, { proxima_entrega: "asc" }],
    omit: { token_hash: true },
    include: {
      _count: { select: { pedidos: true } },
      pedidos: { orderBy: { fecha_entrega: "desc" }, take: 1, select: { numero_pedido: true, fecha_entrega: true, total: true } },
    },
  });
  return NextResponse.json(suscripciones);
}
