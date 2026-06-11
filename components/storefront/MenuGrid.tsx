"use client";

import { useState, useTransition } from "react";
import type { MenuItem } from "@/lib/types";
import { MenuCard } from "./MenuCard";
import { CategoryFilter } from "./CategoryFilter";
import { MenuItemDrawer } from "./MenuItemDrawer";

export function MenuGrid({ items }: { items: MenuItem[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [menuDelDia, setMenuDelDia]         = useState(false);
  const [activeTags, setActiveTags]         = useState<string[]>([]);
  const [gridVisible, setGridVisible]       = useState(true);
  const [selectedItem, setSelectedItem]     = useState<MenuItem | null>(null);
  const [, startTransition] = useTransition();

  const categories    = Array.from(new Set(items.map((i) => i.categoria))).sort();
  const availableTags = Array.from(new Set(items.flatMap((i) => i.tags ?? [])));

  const filtered = items.filter((item) => {
    if (activeCategory !== null && item.categoria !== activeCategory) return false;
    if (menuDelDia && !item.menu_del_dia) return false;
    if (activeTags.length > 0 && !activeTags.every((t) => (item.tags ?? []).includes(t))) return false;
    return true;
  });

  // Animación solo en cambio de categoría (contexto mayor)
  function handleCategoryChange(cat: string | null) {
    setGridVisible(false);
    setTimeout(() => {
      startTransition(() => setActiveCategory(cat));
      setGridVisible(true);
    }, 200);
  }

  function handleTagToggle(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleReset() {
    setGridVisible(false);
    setTimeout(() => {
      startTransition(() => {
        setActiveCategory(null);
        setMenuDelDia(false);
        setActiveTags([]);
      });
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

  return (
    <>
      <section id="menu" className="bg-brand-cream py-16 md:py-24">
        <div className="w-full px-6 lg:px-10 xl:px-14">

          {/* ── Header ────────────────────────────────────────────────────── */}
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

          {/* ── Filtros ───────────────────────────────────────────────────── */}
          <div className="mb-8">
            <CategoryFilter
              categories={categories}
              availableTags={availableTags}
              activeCategory={activeCategory}
              menuDelDia={menuDelDia}
              activeTags={activeTags}
              onCategoryChange={handleCategoryChange}
              onMenuDelDiaToggle={() => setMenuDelDia((v) => !v)}
              onTagToggle={handleTagToggle}
              onReset={handleReset}
            />
          </div>

          {/* ── Grid ─────────────────────────────────────────────────────── */}
          <div
            className={`grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 transition-opacity duration-200 ${
              gridVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {filtered.length > 0 ? (
              filtered.map((item, i) => (
                <MenuCard
                  key={item.id}
                  {...item}
                  priority={i === 0}
                  onSelect={() => setSelectedItem(item)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="font-body text-brand-muted text-sm">
                  No hay platos con esa combinación de filtros.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-3 font-body text-sm text-brand-primary hover:underline"
                >
                  Ver todos
                </button>
              </div>
            )}
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
