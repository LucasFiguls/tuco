import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { LoteExistenteError, emitirLote, esPeriodoValido, periodoActual } from "@/lib/vouchers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const convenio = await prisma.convenio.findUnique({ where: { id } });
  if (!convenio) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!convenio.activo) return NextResponse.json({ error: "El convenio está inactivo" }, { status: 400 });

  const periodo = typeof body.periodo === "string" ? body.periodo : periodoActual();
  if (!esPeriodoValido(periodo) || periodo < periodoActual()) {
    return NextResponse.json({ error: "Período inválido (YYYY-MM, actual o futuro)" }, { status: 400 });
  }
  const cantidad = body.cantidad !== undefined ? Number(body.cantidad) : convenio.vouchers_por_mes;
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 5000) {
    return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
  }

  try {
    const lote = await emitirLote(id, periodo, cantidad);
    return NextResponse.json(lote, { status: 201 });
  } catch (e) {
    if (e instanceof LoteExistenteError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    throw e;
  }
}
