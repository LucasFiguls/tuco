import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const ESTADOS = ["NUEVO", "CONTACTADO", "PROPUESTA", "GANADO", "PERDIDO"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const data: { estado?: (typeof ESTADOS)[number]; notas_internas?: string | null; visto?: boolean } = {};

  if (body.estado !== undefined) {
    if (!ESTADOS.includes(body.estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
    data.estado = body.estado;
  }
  if (body.notas_internas !== undefined) {
    data.notas_internas = String(body.notas_internas).slice(0, 4000) || null;
  }
  if (body.visto !== undefined) data.visto = Boolean(body.visto);

  const lead = await prisma.leadEmpresa.update({ where: { id }, data });
  return NextResponse.json(lead);
}
