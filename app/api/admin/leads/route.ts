import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // ?count=no-vistos → solo el conteo (para el badge del admin)
  if (new URL(request.url).searchParams.get("count") === "no-vistos") {
    const count = await prisma.leadEmpresa.count({ where: { visto: false } });
    return NextResponse.json({ count });
  }

  const leads = await prisma.leadEmpresa.findMany({
    orderBy: { created_at: "desc" },
    include: { convenio: { select: { id: true } } },
  });
  return NextResponse.json(leads);
}
