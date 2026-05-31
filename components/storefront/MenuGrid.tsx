"use client";

import { MenuItemCard } from "./MenuItemCard";

interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string | number;
  categoria: string;
  disponible: boolean;
  foto_url: string | null;
}

export function MenuGrid({ items }: { items: MenuItem[] }) {
  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.categoria]) acc[item.categoria] = [];
    acc[item.categoria].push(item);
    return acc;
  }, {});

  if (!items.length) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-5xl mb-4">🍽️</p>
        <p className="text-lg font-medium">Menú no disponible por el momento</p>
        <p className="text-sm mt-1">Volvé a chequear más tarde</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {Object.entries(byCategory).map(([categoria, catItems]) => (
        <section key={categoria}>
          <h2 className="text-xl font-bold text-gray-800 mb-4 capitalize">{categoria}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {catItems.map((item) => (
              <MenuItemCard
                key={item.id}
                id={item.id}
                nombre={item.nombre}
                descripcion={item.descripcion}
                precio={Number(item.precio)}
                categoria={item.categoria}
                foto_url={item.foto_url}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
