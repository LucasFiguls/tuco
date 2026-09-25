import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { checkout, items } = body as {
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

  // El precio se toma siempre de la DB, nunca del cliente
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.id) }, disponible: true },
    select: { id: true, precio: true },
  });
  const precios = new Map(menuItems.map((m) => [m.id, Number(m.precio)]));

  if (items.some((i) => !precios.has(i.id))) {
    return NextResponse.json(
      { error: "Algún producto ya no está disponible. Revisá tu carrito." },
      { status: 409 }
    );
  }

  const lineas = items.map((i) => {
    const precio = precios.get(i.id)!;
    return { menu_item_id: i.id, cantidad: i.cantidad, precio_unitario: precio, subtotal: precio * i.cantidad };
  });
  const total = lineas.reduce((sum, l) => sum + l.subtotal, 0);

  const pedido = await prisma.pedido.create({
    data: {
      cliente_nombre: checkout.cliente_nombre,
      cliente_telefono: checkout.cliente_telefono,
      modalidad: checkout.modalidad,
      direccion_entrega: checkout.direccion_entrega ?? null,
      fecha_entrega: new Date(checkout.fecha_entrega),
      hora_entrega: checkout.hora_entrega,
      comentarios: checkout.comentarios ?? null,
      total,
      items: { create: lineas },
    },
    include: { items: true },
  });

  return NextResponse.json(pedido, { status: 201 });
}
