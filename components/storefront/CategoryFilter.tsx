"use client";

import { getTag } from "@/lib/tags";

interface FilterBarProps {
  categories: string[];
  availableTags: string[];
  activeCategory: string | null;
  menuDelDia: boolean;
  activeTags: string[];
  onCategoryChange: (cat: string | null) => void;
  onMenuDelDiaToggle: () => void;
  onTagToggle: (tag: string) => void;
  onReset: () => void;
}

export function CategoryFilter({
  categories,
  availableTags,
  activeCategory,
  menuDelDia,
  activeTags,
  onCategoryChange,
  onMenuDelDiaToggle,
  onTagToggle,
  onReset,
}: FilterBarProps) {
  const nothingActive = !activeCategory && !menuDelDia && activeTags.length === 0;

  return (
    <div className="space-y-3">

      {/* ── Fila 1: Todo / Menú del día / Categorías ───────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">

        {/* Todo */}
        <button
          onClick={onReset}
          className={`shrink-0 px-5 py-2 rounded-btn text-sm font-medium transition-all duration-200 border ${
            nothingActive
              ? "bg-brand-dark text-white border-brand-dark"
              : "bg-white text-brand-muted border-brand-border hover:border-brand-dark hover:text-brand-dark"
          }`}
        >
          Todo
        </button>

        <div className="w-px bg-brand-border shrink-0 self-stretch my-0.5" />

        {/* Menú del día */}
        <button
          onClick={onMenuDelDiaToggle}
          className={`shrink-0 px-5 py-2 rounded-btn text-sm font-medium transition-all duration-200 border ${
            menuDelDia
              ? "bg-brand-primary text-white border-brand-primary"
              : "bg-white text-brand-primary border-brand-primary/40 hover:border-brand-primary hover:bg-brand-cream"
          }`}
        >
          ★ Menú del día
        </button>

        {categories.length > 0 && (
          <div className="w-px bg-brand-border shrink-0 self-stretch my-0.5" />
        )}

        {/* Categorías — single-select, clic en activa la deselecciona */}
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(activeCategory === cat ? null : cat)}
            className={`shrink-0 px-5 py-2 rounded-btn text-sm font-medium transition-all duration-200 border ${
              activeCategory === cat
                ? "bg-brand-dark text-white border-brand-dark"
                : "bg-white text-brand-muted border-brand-border hover:border-brand-dark hover:text-brand-dark"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Fila 2: Etiquetas (multi-select) ────────────────────────────── */}
      {availableTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="shrink-0 font-body text-[11px] uppercase tracking-wider text-brand-muted pr-1">
            Filtros
          </span>
          {availableTags.map((tag) => {
            const cfg = getTag(tag);
            const isActive = activeTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`shrink-0 px-4 py-1.5 rounded-btn text-[12px] font-medium transition-all duration-200 border ${
                  isActive
                    ? "bg-brand-dark text-white border-brand-dark"
                    : `${cfg.className} hover:opacity-80`
                }`}
              >
                {isActive && <span className="mr-1">✓</span>}
                {cfg.label}
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
