import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const convenio = await prisma.convenio.findUnique({
    where: { id },
    include: {
      lotes: {
        orderBy: { periodo: "desc" },
        include: {
          vouchers: {
            orderBy: { codigo: "asc" },
            select: {
              id: true,
              codigo: true,
              estado: true,
              canjeado_at: true,
              pedido: { select: { numero_pedido: true, cliente_nombre: true } },
            },
          },
        },
      },
    },
  });
  if (!convenio) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(convenio);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};
  for (const k of ["empresa", "cuit", "contacto_nombre", "email", "telefono"] as const) {
    if (typeof body[k] === "string") data[k] = body[k].trim() || null;
  }
  if (body.vouchers_por_mes !== undefined) {
    const n = Number(body.vouchers_por_mes);
    if (!Number.isInteger(n) || n < 1 || n > 5000) {
      return NextResponse.json({ error: "Cantidad de vouchers inválida" }, { status: 400 });
    }
    data.vouchers_por_mes = n;
  }
  if (body.precio_por_vianda !== undefined) {
    data.precio_por_vianda = body.precio_por_vianda === "" || body.precio_por_vianda === null ? null : Number(body.precio_por_vianda);
  }
  if (body.activo !== undefined) data.activo = Boolean(body.activo);

  const convenio = await prisma.convenio.update({ where: { id }, data });
  return NextResponse.json(convenio);
}
