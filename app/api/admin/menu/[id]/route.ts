import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  return await getSession();
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion ?? null,
      precio: body.precio,
      categoria: body.categoria,
      disponible: body.disponible,
      foto_url: body.foto_url ?? null,
      calorias: body.calorias ? Number(body.calorias) : null,
      proteinas: body.proteinas ? Number(body.proteinas) : null,
      carbohidratos: body.carbohidratos ? Number(body.carbohidratos) : null,
      grasas: body.grasas ? Number(body.grasas) : null,
      ingredientes: body.ingredientes ?? null,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
