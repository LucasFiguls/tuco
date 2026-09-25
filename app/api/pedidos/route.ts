import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { getSession } from "@/lib/auth";
import { esFechaValida } from "@/lib/vacio";
import { cotizarCaja } from "@/lib/caja";
import { esFrecuencia, linkSuscripcion, sumarDias } from "@/lib/suscripciones";
import { generarToken } from "@/lib/suscripciones-server";
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

interface Checkout {
  cliente_nombre: string;
  cliente_telefono: string;
  modalidad: "RETIRO" | "DELIVERY";
  direccion_entrega?: string;
  fecha_entrega: string;
  hora_entrega: string;
  comentarios?: string;
}

function datosCliente(checkout: Checkout) {
  return {
    cliente_nombre: checkout.cliente_nombre,
    cliente_telefono: checkout.cliente_telefono,
    modalidad: checkout.modalidad,
    direccion_entrega: checkout.direccion_entrega ?? null,
    fecha_entrega: new Date(checkout.fecha_entrega),
    hora_entrega: checkout.hora_entrega,
    comentarios: checkout.comentarios ?? null,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { checkout, items, vouchers: vouchersRaw = [], caja, suscripcion } = body as {
    checkout: Checkout;
    items: Array<{ id: string; cantidad: number }>;
    vouchers?: string[];
    /** Tamaño de caja (línea al vacío). */
    caja?: number;
    /** Recibir la misma caja cada N días (solo con caja). */
    suscripcion?: { frecuencia_dias: number };
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

  // Un admin logueado puede pedir productos no disponibles (vista previa de la línea al vacío)
  const preview = !!(await getSession());

  if (caja !== undefined) {
    return pedidoCaja({ checkout, items, caja, suscripcion, preview, conVouchers: vouchersRaw.length > 0 });
  }
  if (suscripcion) {
    return NextResponse.json({ error: "La suscripción es solo para cajas al vacío" }, { status: 400 });
  }

  // ── Pedido del menú caliente (con vouchers corporativos opcionales) ──────
  if (!Array.isArray(vouchersRaw) || vouchersRaw.length > MAX_VOUCHERS_POR_PEDIDO) {
    return NextResponse.json({ error: `Máximo ${MAX_VOUCHERS_POR_PEDIDO} vouchers por pedido` }, { status: 400 });
  }
  const codigos = [...new Set(vouchersRaw.map((c) => normalizarCodigo(String(c))))];

  // El precio se toma siempre de la DB, nunca del cliente
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.id) }, ...(preview ? {} : { disponible: true }) },
    select: { id: true, precio: true, categoria: true, linea: true },
  });
  const porId = new Map(menuItems.map((m) => [m.id, { precio: Number(m.precio), categoria: m.categoria, linea: m.linea }]));

  if (items.some((i) => !porId.has(i.id))) {
    return NextResponse.json({ error: "Algún producto ya no está disponible. Revisá tu carrito." }, { status: 409 });
  }
  if (items.some((i) => porId.get(i.id)!.linea === "VACIO")) {
    return NextResponse.json({ error: "Las viandas al vacío se piden en una caja. Elegí un tamaño de caja." }, { status: 400 });
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
          ...datosCliente(checkout),
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

// ── Caja al vacío (con suscripción opcional) ─────────────────────────────────

async function pedidoCaja({
  checkout,
  items,
  caja,
  suscripcion,
  preview,
  conVouchers,
}: {
  checkout: Checkout;
  items: Array<{ id: string; cantidad: number }>;
  caja: number;
  suscripcion?: { frecuencia_dias: number };
  preview: boolean;
  conVouchers: boolean;
}) {
  if (conVouchers) {
    return NextResponse.json({ error: "Los vouchers no aplican a cajas al vacío" }, { status: 400 });
  }
  if (suscripcion && !esFrecuencia(suscripcion.frecuencia_dias)) {
    return NextResponse.json({ error: "Frecuencia de suscripción inválida" }, { status: 400 });
  }

  const cot = await cotizarCaja(items, caja, { preview, modalidad: checkout.modalidad, suscripcion: !!suscripcion });
  if (!cot.ok) return NextResponse.json({ error: cot.error }, { status: cot.status });

  if (!esFechaValida(checkout.fecha_entrega, cot.vacio.anticipacionHoras)) {
    return NextResponse.json({ error: `Elegí una fecha con al menos ${cot.vacio.anticipacionHoras} hs de anticipación` }, { status: 400 });
  }
  if (!cot.vacio.franjas.includes(checkout.hora_entrega)) {
    return NextResponse.json({ error: "Elegí una franja horaria válida" }, { status: 400 });
  }

  const token = suscripcion ? generarToken() : null;

  const pedido = await prisma.$transaction(async (tx) => {
    const sus = suscripcion
      ? await tx.suscripcion.create({
          data: {
            token_hash: token!.hash,
            cliente_nombre: checkout.cliente_nombre,
            cliente_telefono: checkout.cliente_telefono,
            modalidad: checkout.modalidad,
            direccion_entrega: checkout.direccion_entrega ?? null,
            hora_entrega: checkout.hora_entrega,
            comentarios: checkout.comentarios ?? null,
            frecuencia_dias: suscripcion.frecuencia_dias,
            tamano_caja: caja,
            items: items.map((i) => ({ id: i.id, cantidad: i.cantidad })),
            // Esta primera entrega ya es el pedido de hoy: la próxima es un ciclo después
            proxima_entrega: new Date(sumarDias(checkout.fecha_entrega, suscripcion.frecuencia_dias)),
          },
        })
      : null;

    return tx.pedido.create({
      data: {
        ...datosCliente(checkout),
        tamano_caja: caja,
        descuento_caja: cot.descuentoCaja,
        descuento_suscripcion: cot.descuentoSuscripcion,
        costo_envio: cot.envio,
        total: cot.total,
        suscripcion_id: sus?.id ?? null,
        items: { create: cot.lineas },
      },
      include: { items: true },
    });
  });

  return NextResponse.json(
    { ...pedido, suscripcion_url: token ? linkSuscripcion(token.token) : null },
    { status: 201 }
  );
}
