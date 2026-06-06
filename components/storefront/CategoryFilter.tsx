"use client";

interface CategoryFilterProps {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
  variant?: "pills" | "sidebar";
}

export function CategoryFilter({ categories, active, onChange, variant = "pills" }: CategoryFilterProps) {
  if (variant === "sidebar") {
    return (
      <div className="flex flex-col gap-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`text-left w-full px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 ${
              active === cat
                ? "bg-brand-dark text-white"
                : "text-brand-muted hover:text-brand-dark hover:bg-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 px-5 py-2 rounded-btn text-sm font-medium transition-all duration-200 border ${
            active === cat
              ? "bg-brand-dark text-white border-brand-dark"
              : "bg-white text-brand-muted border-brand-border hover:border-brand-dark hover:text-brand-dark"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
