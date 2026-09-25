import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { normalizePhone } from "@/lib/whatsapp";
import { periodoActual } from "@/lib/vouchers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const periodo = periodoActual();
  const convenios = await prisma.convenio.findMany({
    orderBy: [{ activo: "desc" }, { empresa: "asc" }],
    include: { lotes: { where: { periodo }, select: { id: true } } },
  });

  // Uso del mes en curso por convenio
  const loteIds = convenios.flatMap((c) => c.lotes.map((l) => l.id));
  const grupos = loteIds.length
    ? await prisma.voucher.groupBy({
        by: ["lote_id", "estado"],
        where: { lote_id: { in: loteIds } },
        _count: { _all: true },
      })
    : [];

  return NextResponse.json({
    periodo,
    convenios: convenios.map((c) => {
      const loteId = c.lotes[0]?.id;
      const uso = { DISPONIBLE: 0, CANJEADO: 0, ANULADO: 0 };
      for (const g of grupos) if (g.lote_id === loteId) uso[g.estado] = g._count._all;
      const { lotes, ...rest } = c;
      void lotes;
      return { ...rest, lote_actual: loteId ?? null, uso };
    }),
  });
}

export async function POST(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const vouchers = Number(body.vouchers_por_mes);
  if (!body.empresa?.trim() || !body.contacto_nombre?.trim() || !body.email?.trim() || !body.telefono?.trim()) {
    return NextResponse.json({ error: "Completá empresa, contacto, email y teléfono" }, { status: 400 });
  }
  if (!Number.isInteger(vouchers) || vouchers < 1 || vouchers > 5000) {
    return NextResponse.json({ error: "Cantidad de vouchers inválida" }, { status: 400 });
  }

  const convenio = await prisma.$transaction(async (tx) => {
    const creado = await tx.convenio.create({
      data: {
        empresa: String(body.empresa).trim(),
        cuit: body.cuit?.trim() || null,
        contacto_nombre: String(body.contacto_nombre).trim(),
        email: String(body.email).trim().toLowerCase(),
        telefono: normalizePhone(String(body.telefono)),
        vouchers_por_mes: vouchers,
        precio_por_vianda: body.precio_por_vianda ? Number(body.precio_por_vianda) : null,
        lead_id: body.lead_id || null,
      },
    });
    if (body.lead_id) {
      await tx.leadEmpresa.update({ where: { id: body.lead_id }, data: { estado: "GANADO" } });
    }
    return creado;
  });

  return NextResponse.json(convenio, { status: 201 });
}
