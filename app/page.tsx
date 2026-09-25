import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/storefront/Navbar";
import { SplitHero } from "@/components/empresas/SplitHero";
import { PaquetesEmpresas } from "@/components/empresas/PaquetesEmpresas";
import { getConfig } from "@/lib/config";
import { getSession } from "@/lib/auth";
import { modoVacio, getVacioConfig } from "@/lib/vacio";
import { getProductosVacio } from "@/lib/vacio-data";
import { VacioShell } from "@/components/vacio/VacioShell";
import { VacioHome } from "@/components/vacio/VacioHome";
import { MenuGrid } from "@/components/storefront/MenuGrid";
import { HowItWorks } from "@/components/storefront/HowItWorks";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getConfig();

  // Flag "modo_vacio": la home pasa a ser la línea al vacío (menú caliente y empresas quedan ocultos)
  if (modoVacio(config)) {
    const productos = await getProductosVacio({ preview: !!(await getSession()) });
    return (
      <VacioShell whatsapp={config.whatsapp_numero} hero>
        <VacioHome productos={productos} cajas={getVacioConfig(config).cajas} heroImagen={config.vacio_hero_imagen} />
      </VacioShell>
    );
  }

  const items = await prisma.menuItem.findMany({
    where: { disponible: true, linea: "CALIENTE" },
    orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
    include: { components: { orderBy: { orden: "asc" } } },
  });

  const mappedItems = items.map((i) => ({
    ...i,
    precio: Number(i.precio),
    tagline: i.tagline ?? null,
    descripcion: i.descripcion ?? null,
    foto_url: i.foto_url ?? null,
    calorias: i.calorias ?? null,
    proteinas: i.proteinas ?? null,
    carbohidratos: i.carbohidratos ?? null,
    grasas: i.grasas ?? null,
    ingredientes: i.ingredientes ?? null,
    tags: i.tags,
    menu_del_dia: i.menu_del_dia,
    components: i.components.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      cantidad_label: c.cantidad_label,
      foto_url: c.foto_url ?? null,
      orden: c.orden,
    })),
  }));

  return (
    <>
      <Navbar />

      <main>
        <SplitHero />

        <div id="menu" className="scroll-mt-20">
          {config.zonas_delivery && (
            <div className="bg-brand-cream border-b border-brand-border px-4 py-3">
              <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-brand-muted">
                <PinIcon />
                <span><strong className="text-brand-dark">Zonas de delivery:</strong> {config.zonas_delivery}</span>
              </div>
            </div>
          )}
          <MenuGrid items={mappedItems} />
        </div>

        <PaquetesEmpresas />

        <HowItWorks modo="dual" />
      </main>

      <Footer whatsapp={config.whatsapp_numero} />
      <CartDrawer />
    </>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brand-primary">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
