import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/storefront/Navbar";
import { Hero } from "@/components/storefront/Hero";
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
  }));

  return (
    <>
      <Navbar />

      <main>
        <Hero />

        {/* Sección menú */}
        <section id="menu" className="bg-tuco-white py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-tuco-red font-medium text-sm uppercase tracking-widest italic mb-3">
                fresco, casero, rico
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-tuco-brown">
                El menú de hoy
              </h2>
            </div>

            {config.zonas_delivery && (
              <div className="mb-8 bg-tuco-cream border border-tuco-brown/10 rounded-xl px-5 py-3 text-sm text-tuco-brown flex items-center gap-2">
                <PinIcon />
                <span><strong>Zonas de delivery:</strong> {config.zonas_delivery}</span>
              </div>
            )}

            <MenuGrid items={mappedItems} />
          </div>
        </section>

        <HowItWorks />
      </main>

      <Footer />
      <CartDrawer />
    </>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
