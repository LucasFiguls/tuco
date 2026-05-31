import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const where = estado ? { estado: estado as never } : {};

  const [pedidos, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      include: {
        items: {
          include: { menu_item: true },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pedido.count({ where }),
  ]);

  return NextResponse.json({ pedidos, total, page, limit });
}
