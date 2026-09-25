import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import {
  MAX_VOUCHERS_POR_PEDIDO,
  MENSAJE_ESTADO,
  aplicarVouchers,
  validarCodigos,
  normalizarCodigo,
  parseCategoriasElegibles,
  whereCanjeable,
} from "@/lib/vouchers";
import { NextRequest, NextResponse } from "next/server";

class VoucherError extends Error {}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { checkout, items, vouchers: vouchersRaw = [] } = body as {
    checkout: {
      cliente_nombre: string;
      cliente_telefono: string;
      modalidad: "RETIRO" | "DELIVERY";
      direccion_entrega?: string;
      fecha_entrega: string;
      hora_entrega: string;
      comentarios?: string;
    };
    items: Array<{
      id: string;
      cantidad: number;
    }>;
    vouchers?: string[];
  };

  if (!checkout || !items?.length) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  if (checkout.modalidad === "DELIVERY" && !checkout.direccion_entrega?.trim()) {
    return NextResponse.json({ error: "Dirección requerida para delivery" }, { status: 400 });
  }

  if (items.some((i) => !Number.isInteger(i.cantidad) || i.cantidad < 1 || i.cantidad > 50)) {
    return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
  }

  if (!Array.isArray(vouchersRaw) || vouchersRaw.length > MAX_VOUCHERS_POR_PEDIDO) {
    return NextResponse.json({ error: `Máximo ${MAX_VOUCHERS_POR_PEDIDO} vouchers por pedido` }, { status: 400 });
  }
  const codigos = [...new Set(vouchersRaw.map((c) => normalizarCodigo(String(c))))];

  // El precio se toma siempre de la DB, nunca del cliente
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.id) }, disponible: true },
    select: { id: true, precio: true, categoria: true },
  });
  const porId = new Map(menuItems.map((m) => [m.id, { precio: Number(m.precio), categoria: m.categoria }]));

  if (items.some((i) => !porId.has(i.id))) {
    return NextResponse.json(
      { error: "Algún producto ya no está disponible. Revisá tu carrito." },
      { status: 409 }
    );
  }

  const lineas = items.map((i) => {
    const { precio } = porId.get(i.id)!;
    return { menu_item_id: i.id, cantidad: i.cantidad, precio_unitario: precio, subtotal: precio * i.cantidad };
  });
  const subtotal = lineas.reduce((sum, l) => sum + l.subtotal, 0);

  let descuento = 0;
  if (codigos.length) {
    const config = await getConfig();
    const aplicado = aplicarVouchers(
      items.map((i) => ({ ...porId.get(i.id)!, cantidad: i.cantidad })),
      codigos.length,
      parseCategoriasElegibles(config.vouchers_categorias_elegibles)
    );
    if (codigos.length > aplicado.unidadesElegibles) {
      return NextResponse.json(
        { error: `Cargaste ${codigos.length} vouchers pero tu pedido tiene ${aplicado.unidadesElegibles} viandas que se pueden cubrir. Quitá los que sobran.` },
        { status: 400 }
      );
    }
    descuento = aplicado.descuento;

    // Pre-chequeo fuera de la transacción: un rollback igual consume numero_pedido
    const invalidos = (await validarCodigos(codigos)).filter((r) => r.estado !== "VALIDO");
    if (invalidos.length) {
      return NextResponse.json(
        { error: `Revisá tus vouchers: ${invalidos.map((r) => `${r.codigo} (${MENSAJE_ESTADO[r.estado as keyof typeof MENSAJE_ESTADO].toLowerCase()})`).join(", ")}` },
        { status: 409 }
      );
    }
  }

  try {
    const pedido = await prisma.$transaction(async (tx) => {
      const creado = await tx.pedido.create({
        data: {
          cliente_nombre: checkout.cliente_nombre,
          cliente_telefono: checkout.cliente_telefono,
          modalidad: checkout.modalidad,
          direccion_entrega: checkout.direccion_entrega ?? null,
          fecha_entrega: new Date(checkout.fecha_entrega),
          hora_entrega: checkout.hora_entrega,
          comentarios: checkout.comentarios ?? null,
          descuento_vouchers: descuento,
          total: subtotal - descuento,
          items: { create: lineas },
        },
        include: { items: true },
      });

      if (codigos.length) {
        // Canje atómico: solo pasa si TODOS siguen disponibles en este instante
        const { count } = await tx.voucher.updateMany({
          where: { codigo: { in: codigos }, ...whereCanjeable() },
          data: { estado: "CANJEADO", pedido_id: creado.id, canjeado_at: new Date() },
        });
        if (count !== codigos.length) {
          throw new VoucherError("Alguno de tus vouchers ya no es válido. Revisalos e intentá de nuevo.");
        }
      }
      return creado;
    });

    return NextResponse.json(pedido, { status: 201 });
  } catch (e) {
    if (e instanceof VoucherError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    throw e;
  }
}
