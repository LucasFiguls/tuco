import { prisma } from "./prisma";
import { TipoMovimiento } from "../app/generated/prisma/client";

/**
 * Descuenta el stock de los insumos en base a los items de un pedido.
 * Llama a esta función cuando un pedido pase a estado CONFIRMADO.
 */
export async function deductStockForPedido(pedidoId: string) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: {
      items: {
        include: {
          menu_item: {
            include: {
              receta: {
                include: {
                  ingredientes: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!pedido) {
    throw new Error("Pedido no encontrado");
  }

  // Ejecutamos todo dentro de una transacción para mantener la consistencia
  await prisma.$transaction(async (tx) => {
    for (const item of pedido.items) {
      const receta = item.menu_item.receta;
      if (!receta) continue; // Si no tiene receta asociada, no descontamos stock

      // Si el rendimiento de la receta es X, la cantidad de receta usada es (cantidad_pedida / rendimiento)
      // Ejemplo: si se piden 2 viandas y la receta rinde 1, factor = 2.
      // Si se piden 2 viandas y la receta rinde 20, factor = 0.1 (se consumió 10% del batch).
      const multiplier = item.cantidad / receta.rendimiento;

      for (const ingrediente of receta.ingredientes) {
        // La cantidad base a descontar
        const rawAmount = ingrediente.cantidad * multiplier;
        // Ajustamos por la merma esperada: cantidad final = cantidad bruta * (1 + merma/100)
        const finalAmount = rawAmount * (1 + (ingrediente.merma / 100));

        // 1. Actualizamos el stock_actual del Insumo
        await tx.insumo.update({
          where: { id: ingrediente.insumo_id },
          data: {
            stock_actual: {
              decrement: finalAmount,
            },
          },
        });

        // 2. Registramos el movimiento en el historial
        await tx.movimientoStock.create({
          data: {
            insumo_id: ingrediente.insumo_id,
            tipo: TipoMovimiento.SALIDA,
            cantidad: finalAmount,
            motivo: `Consumo por Pedido #${pedido.numero_pedido} (Item: ${item.menu_item.nombre})`,
            pedido_id: pedido.id,
          },
        });
      }
    }
  });

  return { success: true };
}
