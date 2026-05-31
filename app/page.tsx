import { prisma } from "@/lib/prisma";
import { MenuGrid } from "@/components/storefront/MenuGrid";
import { CartDrawer } from "@/components/storefront/CartDrawer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const items = await prisma.menuItem.findMany({
    where: { disponible: true },
    orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
  });

  const configuracion = await prisma.configuracion.findMany();
  const config = Object.fromEntries(configuracion.map((c: { clave: string; valor: string }) => [c.clave, c.valor]));

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-orange-500">Tuco</h1>
            <p className="text-xs text-gray-500">Viandas para llevar</p>
          </div>
          {config.horarios && (
            <p className="text-sm text-gray-600 hidden sm:block">{config.horarios}</p>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {config.zonas_delivery && (
          <div className="mb-6 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-sm text-orange-800">
            <span className="font-medium">Zonas de delivery:</span> {config.zonas_delivery}
          </div>
        )}

        <MenuGrid items={items.map((i) => ({ ...i, precio: Number(i.precio), descripcion: i.descripcion ?? null, foto_url: i.foto_url ?? null }))} />
      </main>

      <CartDrawer />
    </div>
  );
}
