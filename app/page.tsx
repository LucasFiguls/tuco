import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/storefront/Navbar";
import { HeroCarousel } from "@/components/storefront/HeroCarousel";
import { MenuGrid } from "@/components/storefront/MenuGrid";
import { HowItWorks } from "@/components/storefront/HowItWorks";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const items = await prisma.menuItem.findMany({
    where: { disponible: true },
    orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
  });

  const configuracion = await prisma.configuracion.findMany();
  const config = Object.fromEntries(
    configuracion.map((c: { clave: string; valor: string }) => [c.clave, c.valor])
  );

  const mappedItems = items.map((i) => ({
    ...i,
    precio: Number(i.precio),
    descripcion: i.descripcion ?? null,
    foto_url: i.foto_url ?? null,
    calorias: i.calorias ?? null,
    proteinas: i.proteinas ?? null,
    carbohidratos: i.carbohidratos ?? null,
    grasas: i.grasas ?? null,
    ingredientes: i.ingredientes ?? null,
  }));

  return (
    <>
      <Navbar />

      <main>
        <HeroCarousel />

        <div id="menu">
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

        <HowItWorks />
      </main>

      <Footer />
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
