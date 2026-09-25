import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; loteId: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id, loteId } = await params;
  const lote = await prisma.voucherLote.findFirst({
    where: { id: loteId, convenio_id: id },
    include: { convenio: { select: { empresa: true } }, vouchers: { orderBy: { codigo: "asc" } } },
  });
  if (!lote) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const vence = lote.vence_at.toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
  const rows = [
    "codigo,estado,vence",
    ...lote.vouchers.map((v) => `${v.codigo},${v.estado},${vence}`),
  ];
  const slug = lote.convenio.empresa.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return new NextResponse(rows.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vouchers-${slug || "empresa"}-${lote.periodo}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
