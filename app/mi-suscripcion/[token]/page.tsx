import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { cotizarCaja } from "@/lib/caja";
import { fechaMinimaEntrega, getVacioConfig } from "@/lib/vacio";
import { fechaISO, parseItemsSuscripcion } from "@/lib/suscripciones";
import { getSuscripcionPorToken } from "@/lib/suscripciones-server";
import { VacioShell } from "@/components/vacio/VacioShell";
import { MiSuscripcion } from "@/components/vacio/MiSuscripcion";

export const dynamic = "force-dynamic";

// Link privado: nunca se indexa ni viaja como referrer
export const metadata: Metadata = {
  title: "Mi suscripción — Tuco al vacío",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function MiSuscripcionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sus = await getSuscripcionPorToken(token);
  if (!sus) notFound();

  const config = await getConfig();
  const vacio = getVacioConfig(config);
  const items = parseItemsSuscripcion(sus.items);
  const hoy = fechaISO(new Date());

  const [productos, confirmado, cot] = await Promise.all([
    prisma.menuItem.findMany({
      where: { id: { in: items.map((i) => i.id) } },
      select: { id: true, nombre: true, precio: true, foto_url: true, disponible: true },
    }),
    prisma.pedido.findFirst({
      where: { suscripcion_id: sus.id, fecha_entrega: { gte: new Date(hoy) }, estado: { not: "CANCELADO" } },
      orderBy: { fecha_entrega: "asc" },
      select: { numero_pedido: true, fecha_entrega: true, hora_entrega: true },
    }),
    cotizarCaja(items, sus.tamano_caja, { modalidad: sus.modalidad, suscripcion: true }),
  ]);
  const porId = new Map(productos.map((p) => [p.id, p]));

  return (
    <VacioShell whatsapp={config.whatsapp_numero}>
      <MiSuscripcion
        token={token}
        suscripcion={{
          estado: sus.estado,
          cliente_nombre: sus.cliente_nombre,
          modalidad: sus.modalidad,
          direccion_entrega: sus.direccion_entrega,
          hora_entrega: sus.hora_entrega,
          frecuencia_dias: sus.frecuencia_dias,
          tamano_caja: sus.tamano_caja,
          proxima_entrega: fechaISO(sus.proxima_entrega),
        }}
        items={items.map((i) => {
          const p = porId.get(i.id);
          return {
            id: i.id,
            cantidad: i.cantidad,
            nombre: p?.nombre ?? "Producto discontinuado",
            precio: p ? Number(p.precio) : 0,
            foto_url: p?.foto_url ?? null,
            disponible: !!p?.disponible,
          };
        })}
        confirmado={
          confirmado
            ? { numero: confirmado.numero_pedido, fecha: fechaISO(confirmado.fecha_entrega), franja: confirmado.hora_entrega }
            : null
        }
        total={cot.ok ? cot.total : null}
        avisoCaja={cot.ok ? null : cot.error}
        franjas={vacio.franjas}
        fechaMin={fechaMinimaEntrega(vacio.anticipacionHoras)}
        descuentoSuscripcion={vacio.descuentoSuscripcion}
      />
    </VacioShell>
  );
}
