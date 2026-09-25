import type { Metadata } from "next";
import { getProductosVacio } from "@/lib/vacio-data";
import { getVacioPageContext, vacioMetadata } from "@/lib/vacio-page";
import { VacioShell } from "@/components/vacio/VacioShell";
import { ArmadorCaja } from "@/components/vacio/ArmadorCaja";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return vacioMetadata({
    title: "Armá tu caja — Tuco al vacío",
    description: "Elegí 5, 10, 15 o 20 viandas caseras envasadas al vacío y llená tu heladera.",
  });
}

export default async function ArmarPage({ searchParams }: { searchParams: Promise<{ caja?: string }> }) {
  const [{ caja }, ctx] = await Promise.all([searchParams, getVacioPageContext()]);
  const productos = await getProductosVacio({ preview: ctx.preview });

  return (
    <VacioShell whatsapp={ctx.config.whatsapp_numero}>
      <ArmadorCaja
        productos={productos}
        cajas={ctx.vacio.cajas}
        cajaInicial={caja ? Number(caja) : null}
        preview={ctx.preview}
      />
    </VacioShell>
  );
}
