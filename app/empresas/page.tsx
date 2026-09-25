import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { HowItWorks } from "@/components/storefront/HowItWorks";
import { PaquetesEmpresas } from "@/components/empresas/PaquetesEmpresas";
import { CotizarForm } from "@/components/empresas/CotizarForm";
import {
  EmpresasHero,
  MetricasEmpresas,
  BeneficiosEmpresas,
  MenuPreview,
  TestimoniosEmpresas,
  FaqEmpresas,
} from "@/components/empresas/EmpresasSecciones";
import { PAQUETES, type PaqueteId } from "@/lib/empresas-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tuco para empresas — Vouchers de viandas caseras",
  description:
    "Convenios corporativos con paquetes mensuales de 50, 75 o 100 vouchers. Tu equipo canjea viandas caseras cuando quiere, con retiro o delivery.",
};

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ paquete?: string }>;
}) {
  const { paquete } = await searchParams;
  const paqueteInicial = PAQUETES.some((p) => p.id === paquete) ? (paquete as PaqueteId) : undefined;

  const [config, items] = await Promise.all([
    getConfig(),
    prisma.menuItem.findMany({
      where: { disponible: true, foto_url: { not: null } },
      orderBy: [{ menu_del_dia: "desc" }, { updated_at: "desc" }],
      select: { id: true, nombre: true, tagline: true, foto_url: true, categoria: true },
      take: 6,
    }),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <EmpresasHero />
        <MetricasEmpresas />
        <PaquetesEmpresas id="paquetes" enLanding />
        <HowItWorks
          modo="empresa"
          id="como-funciona-empresas"
          eyebrow="Así de simple"
          titulo="¿Cómo funcionan los vouchers?"
        />
        <BeneficiosEmpresas />
        <MenuPreview items={items} />
        <TestimoniosEmpresas />
        <FaqEmpresas />
        <CotizarForm paqueteInicial={paqueteInicial} whatsapp={config.whatsapp_numero} />
      </main>
      <Footer whatsapp={config.whatsapp_numero} />
      <CartDrawer />
    </>
  );
}
