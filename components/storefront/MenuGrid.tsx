"use client";

import { useState, useTransition } from "react";
import type { MenuItem } from "@/lib/types";
import { MenuCard } from "./MenuCard";
import { CategoryFilter } from "./CategoryFilter";
import { MenuItemDrawer } from "./MenuItemDrawer";

export function MenuGrid({ items }: { items: MenuItem[] }) {
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [gridVisible, setGridVisible]       = useState(true);
  const [selectedItem, setSelectedItem]     = useState<MenuItem | null>(null);
  const [, startTransition] = useTransition();

  const categories = ["Todo", ...Array.from(new Set(items.map((i) => i.categoria))).sort()];

  const filtered = activeCategory === "Todo"
    ? items
    : items.filter((i) => i.categoria === activeCategory);

  function handleCategoryChange(cat: string) {
    setGridVisible(false);
    setTimeout(() => {
      startTransition(() => setActiveCategory(cat));
      setGridVisible(true);
    }, 200);
  }

  if (!items.length) {
    return (
      <section id="menu" className="bg-brand-cream py-20 md:py-28">
        <div className="text-center max-w-6xl mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-card">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8BDB5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a9 9 0 100 18A9 9 0 0012 2z" />
              <path d="M8 12h8M8 8h8M8 16h5" />
            </svg>
          </div>
          <p className="font-display text-xl text-brand-dark font-semibold mb-1">Menú no disponible</p>
          <p className="font-body text-sm text-brand-muted">Volvé a chequear más tarde</p>
        </div>
      </section>
    );
  }

  const hasSidebar = categories.length > 2;

  return (
    <>
      <section id="menu" className="bg-brand-cream py-16 md:py-24">
        <div className="w-full px-6 lg:px-10 xl:px-14">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="text-center mb-10 md:mb-14 max-w-2xl mx-auto">
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-2">
              Fresco · Casero · Rico
            </p>
            <h2 className="font-display font-bold text-brand-dark text-[32px] md:text-[48px] leading-tight mb-3">
              El menú de hoy
            </h2>
            <p className="font-body text-base text-brand-muted max-w-[480px] mx-auto">
              Cocinado cada día con ingredientes frescos. Retirás en el local o te lo llevamos a casa.
            </p>
          </div>

          {/* ── Layout: sidebar + grid ─────────────────────────────────────── */}
          <div className={hasSidebar ? "lg:flex lg:items-start lg:gap-10 xl:gap-14" : ""}>

            {/* Sidebar — solo desktop */}
            {hasSidebar && (
              <aside className="hidden lg:block w-44 xl:w-48 shrink-0 sticky top-24">
                <p className="font-body text-[11px] uppercase tracking-[0.18em] text-brand-muted mb-4 px-1">
                  Tipo de plato
                </p>
                <CategoryFilter
                  categories={categories}
                  active={activeCategory}
                  onChange={handleCategoryChange}
                  variant="sidebar"
                />
              </aside>
            )}

            {/* Área principal */}
            <div className="flex-1 min-w-0">

              {/* Pills — solo mobile/tablet */}
              {hasSidebar && (
                <div className="lg:hidden mb-7">
                  <CategoryFilter
                    categories={categories}
                    active={activeCategory}
                    onChange={handleCategoryChange}
                    variant="pills"
                  />
                </div>
              )}

              {/* Grid */}
              <div
                className={`grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 transition-opacity duration-200 ${
                  gridVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                {filtered.map((item) => (
                  <MenuCard
                    key={item.id}
                    {...item}
                    onSelect={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <MenuItemDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}
