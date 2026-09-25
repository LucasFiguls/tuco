import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    
    // Actualizar datos base de la receta
    const receta = await prisma.receta.update({
      where: { id: id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        rendimiento: body.rendimiento,
      }
    });

    // Si envían los ingredientes completos, reconstruimos la relación
    if (body.ingredientes && Array.isArray(body.ingredientes)) {
      await prisma.$transaction(async (tx) => {
        // Borramos los ingredientes actuales
        await tx.ingredienteReceta.deleteMany({
          where: { receta_id: id }
        });
        
        // Insertamos los nuevos
        let costo_total_calculado = 0;
        
        for (const ing of body.ingredientes) {
          await tx.ingredienteReceta.create({
            data: {
              receta_id: id,
              insumo_id: ing.insumo_id,
              cantidad: Number(ing.cantidad),
              merma: Number(ing.merma || 0)
            }
          });
          
          // Calcular el costo (obtenemos el costo unitario del insumo)
          const insumo = await tx.insumo.findUnique({ where: { id: ing.insumo_id } });
          if (insumo) {
            const costoIngrediente = (Number(ing.cantidad) * Number(insumo.costo_unitario)) * (1 + Number(ing.merma || 0) / 100);
            costo_total_calculado += costoIngrediente;
          }
        }
        
        // Guardamos el costo total cacheado en la Receta
        await tx.receta.update({
          where: { id: id },
          data: { costo_total: costo_total_calculado }
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar receta" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.receta.delete({
      where: { id: id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar receta" }, { status: 500 });
  }
}
