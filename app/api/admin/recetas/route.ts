import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const recetas = await prisma.receta.findMany({
      include: {
        ingredientes: {
          include: { insumo: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(recetas);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener recetas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const receta = await prisma.receta.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        rendimiento: body.rendimiento || 1,
        costo_total: 0, // Se calculará después al agregar ingredientes
      }
    });
    return NextResponse.json(receta);
  } catch (error) {
    return NextResponse.json({ error: "Error al crear receta" }, { status: 500 });
  }
}
