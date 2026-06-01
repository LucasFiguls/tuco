"use client";

import { useState } from "react";
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
  const categorias = ["Todo", ...Array.from(new Set(items.map((i) => i.categoria))).sort()];
  const [activeCategory, setActiveCategory] = useState("Todo");

  const filtered = activeCategory === "Todo" ? items : items.filter((i) => i.categoria === activeCategory);

  // Cuando es "Todo", agrupamos por categoría. Cuando hay filtro, mostramos grid plano.
  const byCategory = filtered.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const key = activeCategory === "Todo" ? item.categoria : "items";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  if (!items.length) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 rounded-full bg-tuco-cream flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8D6E63" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a9 9 0 100 18A9 9 0 0012 2z" />
            <path d="M8 12h8M8 8h8M8 16h5" />
          </svg>
        </div>
        <p className="font-serif text-xl text-tuco-brown font-semibold mb-1">Menú no disponible</p>
        <p className="text-sm text-tuco-brown-light">Volvé a chequear más tarde</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtro por categoría */}
      {categorias.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-colors border ${
                activeCategory === cat
                  ? "bg-tuco-red text-white border-tuco-red"
                  : "bg-tuco-white text-tuco-brown border-tuco-cream hover:border-tuco-brown-light"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid de items */}
      <div className="space-y-12">
        {Object.entries(byCategory).map(([categoria, catItems]) => (
          <section key={categoria}>
            {activeCategory === "Todo" && (
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-serif text-2xl text-tuco-brown font-bold capitalize">
                  {categoria}
                </h2>
                <div className="flex-1 h-px bg-tuco-brown/10" />
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
    </div>
  );
}
