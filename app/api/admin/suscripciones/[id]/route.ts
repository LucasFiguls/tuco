import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { fechaMinimaEntrega, getVacioConfig } from "@/lib/vacio";
import { fechaISO } from "@/lib/suscripciones";
import { NextRequest, NextResponse } from "next/server";

const ESTADOS = ["ACTIVA", "PAUSADA", "CANCELADA"] as const;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const { estado } = await request.json();
  if (!ESTADOS.includes(estado)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }
  const sus = await prisma.suscripcion.findUnique({ where: { id } });
  if (!sus) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  // Al reanudar, una próxima entrega vencida pasa a la primera fecha válida
  const fechaMin = fechaMinimaEntrega(getVacioConfig(await getConfig()).anticipacionHoras);
  const proxima = estado === "ACTIVA" && fechaISO(sus.proxima_entrega) < fechaMin ? new Date(fechaMin) : undefined;

  await prisma.suscripcion.update({ where: { id }, data: { estado, ...(proxima && { proxima_entrega: proxima }) } });
  return NextResponse.json({ ok: true });
}
