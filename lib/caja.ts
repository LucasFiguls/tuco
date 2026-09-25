import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { descuentoCaja, getVacioConfig, type VacioConfig } from "@/lib/vacio";

export interface ItemCaja {
  id: string;
  cantidad: number;
}

export type CotizacionCaja =
  | { ok: false; error: string; status: number }
  | {
      ok: true;
      vacio: VacioConfig;
      lineas: Array<{ menu_item_id: string; cantidad: number; precio_unitario: number; subtotal: number }>;
      subtotal: number;
      descuentoCaja: number;
      descuentoSuscripcion: number;
      envio: number;
      total: number;
    };

/**
 * Precio de una caja al vacío, siempre con datos de la DB: valida tamaño, que todas
 * las bolsas sean de la línea y estén disponibles (salvo `preview` de admin) y que
 * la cantidad coincida con el tamaño.
 */
export async function cotizarCaja(
  items: ItemCaja[],
  tamano: number | undefined,
  opts: { preview?: boolean; modalidad: "RETIRO" | "DELIVERY"; suscripcion?: boolean }
): Promise<CotizacionCaja> {
  const config = await getConfig();
  const vacio = getVacioConfig(config);

  if (!vacio.cajas.some((c) => c.tamano === tamano)) {
    return { ok: false, error: "Elegí un tamaño de caja válido", status: 400 };
  }
  if (!items.length || items.some((i) => !Number.isInteger(i.cantidad) || i.cantidad < 1 || i.cantidad > 50)) {
    return { ok: false, error: "Cantidad inválida", status: 400 };
  }

  const productos = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.id) }, ...(opts.preview ? {} : { disponible: true }) },
    select: { id: true, precio: true, linea: true, nombre: true },
  });
  const porId = new Map(productos.map((p) => [p.id, p]));

  const faltantes = items.filter((i) => !porId.has(i.id));
  if (faltantes.length) {
    return { ok: false, error: "Algún producto ya no está disponible. Revisá tu caja.", status: 409 };
  }
  if (items.some((i) => porId.get(i.id)!.linea !== "VACIO")) {
    return { ok: false, error: "La caja solo puede tener viandas al vacío", status: 400 };
  }
  const bolsas = items.reduce((s, i) => s + i.cantidad, 0);
  if (bolsas !== tamano) {
    return { ok: false, error: `Tu caja tiene ${bolsas} de ${tamano} viandas. Completala antes de confirmar.`, status: 400 };
  }

  const lineas = items.map((i) => {
    const precio = Number(porId.get(i.id)!.precio);
    return { menu_item_id: i.id, cantidad: i.cantidad, precio_unitario: precio, subtotal: precio * i.cantidad };
  });
  const subtotal = lineas.reduce((s, l) => s + l.subtotal, 0);
  const descCaja = descuentoCaja(subtotal, tamano!, vacio.cajas);
  const descSusc = opts.suscripcion ? Math.round((subtotal * vacio.descuentoSuscripcion) / 100) : 0;
  const envio = opts.modalidad === "DELIVERY" ? vacio.costoEnvio : 0;

  return {
    ok: true,
    vacio,
    lineas,
    subtotal,
    descuentoCaja: descCaja,
    descuentoSuscripcion: descSusc,
    envio,
    total: subtotal - descCaja - descSusc + envio,
  };
}
