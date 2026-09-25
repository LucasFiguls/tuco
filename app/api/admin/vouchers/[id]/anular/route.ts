import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  // Solo se anulan vouchers sin usar
  const { count } = await prisma.voucher.updateMany({
    where: { id, estado: "DISPONIBLE" },
    data: { estado: "ANULADO" },
  });
  if (!count) {
    return NextResponse.json({ error: "Solo se pueden anular vouchers disponibles" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
