import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const insumos = await prisma.insumo.findMany({
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(insumos);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener insumos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const insumo = await prisma.insumo.create({
      data: {
        nombre: body.nombre,
        unidad_medida: body.unidad_medida,
        costo_unitario: body.costo_unitario,
        stock_minimo: body.stock_minimo || 0,
        proveedor: body.proveedor,
      }
    });
    return NextResponse.json(insumo);
  } catch (error) {
    return NextResponse.json({ error: "Error al crear insumo" }, { status: 500 });
  }
}
