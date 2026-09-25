import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { TipoMovimiento } from "@/app/generated/prisma/client";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    
    // Si se envía un "ajuste_stock", creamos el movimiento y actualizamos el stock real
    if (body.ajuste_stock !== undefined) {
      const cantidad_ajuste = Number(body.ajuste_stock);
      if (cantidad_ajuste !== 0) {
        await prisma.$transaction(async (tx) => {
          await tx.insumo.update({
            where: { id: id },
            data: { stock_actual: { increment: cantidad_ajuste } }
          });
          
          await tx.movimientoStock.create({
            data: {
              insumo_id: id,
              tipo: cantidad_ajuste > 0 ? TipoMovimiento.ENTRADA : TipoMovimiento.SALIDA,
              cantidad: Math.abs(cantidad_ajuste),
              motivo: body.motivo_ajuste || "Ajuste manual de stock"
            }
          });
        });
      }
    }

    // Actualizamos el resto de los datos (nombre, costo, etc)
    const updateData: any = {};
    if (body.nombre) updateData.nombre = body.nombre;
    if (body.unidad_medida) updateData.unidad_medida = body.unidad_medida;
    if (body.costo_unitario !== undefined) updateData.costo_unitario = body.costo_unitario;
    if (body.stock_minimo !== undefined) updateData.stock_minimo = body.stock_minimo;
    if (body.proveedor !== undefined) updateData.proveedor = body.proveedor;

    if (Object.keys(updateData).length > 0) {
      await prisma.insumo.update({
        where: { id: id },
        data: updateData
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar insumo" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.insumo.delete({
      where: { id: id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar insumo" }, { status: 500 });
  }
}
