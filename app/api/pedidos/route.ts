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
      nombre: string;
      precio: number;
      cantidad: number;
    }>;
  };

  if (!checkout || !items?.length) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  if (checkout.modalidad === "DELIVERY" && !checkout.direccion_entrega?.trim()) {
    return NextResponse.json({ error: "Dirección requerida para delivery" }, { status: 400 });
  }

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

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
      items: {
        create: items.map((i) => ({
          menu_item_id: i.id,
          cantidad: i.cantidad,
          precio_unitario: i.precio,
          subtotal: i.precio * i.cantidad,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(pedido, { status: 201 });
}
