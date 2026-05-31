import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const items = await prisma.menuItem.findMany({
    orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const item = await prisma.menuItem.create({
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion ?? null,
      precio: body.precio,
      categoria: body.categoria,
      disponible: body.disponible ?? true,
      foto_url: body.foto_url ?? null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
