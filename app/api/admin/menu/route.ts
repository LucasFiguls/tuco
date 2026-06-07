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
    include: { components: { orderBy: { orden: "asc" } } },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  type ComponentInput = { nombre: string; cantidad_label: string; foto_url?: string };
  const item = await prisma.menuItem.create({
    data: {
      nombre: body.nombre,
      descripcion: body.descripcion ?? null,
      precio: body.precio,
      categoria: body.categoria,
      disponible: body.disponible ?? true,
      foto_url: body.foto_url ?? null,
      calorias: body.calorias ? Number(body.calorias) : null,
      proteinas: body.proteinas ? Number(body.proteinas) : null,
      carbohidratos: body.carbohidratos ? Number(body.carbohidratos) : null,
      grasas: body.grasas ? Number(body.grasas) : null,
      ingredientes: body.ingredientes ?? null,
      tagline: body.tagline ?? null,
      tags: body.tags ?? [],
      components: body.components?.length
        ? {
            createMany: {
              data: (body.components as ComponentInput[]).map((c, i) => ({
                nombre: c.nombre,
                cantidad_label: c.cantidad_label,
                foto_url: c.foto_url || null,
                orden: i,
              })),
            },
          }
        : undefined,
    },
    include: { components: { orderBy: { orden: "asc" } } },
  });
  return NextResponse.json(item, { status: 201 });
}
