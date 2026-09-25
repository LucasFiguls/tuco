import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const VALID_ESTADOS = ["PENDIENTE", "CONFIRMADO", "ENTREGADO", "CANCELADO"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ estado: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { estado } = await params;
  const estadoUp = estado.toUpperCase();

  if (!VALID_ESTADOS.includes(estadoUp)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const { habilitado, plantilla } = await request.json();

  await prisma.whatsappTemplate.upsert({
    where: { estado: estadoUp },
    update: { habilitado, plantilla },
    create: { estado: estadoUp, habilitado, plantilla },
  });

  return NextResponse.json({ ok: true });
}
