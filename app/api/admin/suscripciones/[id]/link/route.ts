import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { linkSuscripcion } from "@/lib/suscripciones";
import { generarToken } from "@/lib/suscripciones-server";
import { NextRequest, NextResponse } from "next/server";

/** Genera un link nuevo: el anterior deja de funcionar (solo se guarda el hash). */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const { token, hash } = generarToken();
  await prisma.suscripcion.update({ where: { id }, data: { token_hash: hash } });
  return NextResponse.json({ url: linkSuscripcion(token) });
}
