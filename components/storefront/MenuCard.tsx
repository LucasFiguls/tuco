"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { useCart } from "./CartContext";
import { getTag } from "@/lib/tags";

interface MenuCardProps extends MenuItem {
  onSelect: () => void;
}

function formatPrice(n: number) {
  return "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

export function MenuCard({
  id, nombre, descripcion, precio, categoria, foto_url,
  calorias, proteinas, tags, menu_del_dia, onSelect, ...rest
}: MenuCardProps) {
  void rest;
  const { add, items, updateQty } = useCart();
  const inCart = items.find((i) => i.id === id);
  const tagBadges = (tags ?? []).map((t) => getTag(t));

  const nutritionLine = [
    calorias  && `${calorias} kcal`,
    proteinas && `${proteinas}g prot.`,
  ].filter(Boolean).join(" · ");

  return (
    <div
      onClick={onSelect}
      className="group bg-white rounded-card overflow-hidden flex flex-col shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-[250ms] ease-out cursor-pointer"
    >
      {/* ── Imagen ──────────────────────────────────────────────────────── */}
      <div className="relative aspect-[3/2] sm:aspect-[4/3] bg-brand-cream overflow-hidden shrink-0">
        {foto_url ? (
          <Image
            src={foto_url}
            alt={nombre}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <PlaceholderIcon />
          </div>
        )}
        <span className="absolute top-3 left-3 bg-white/90 text-brand-primary text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-btn">
          {categoria}
        </span>
        {menu_del_dia && (
          <span className="absolute top-3 right-3 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm text-[14px] leading-none">
            ★
          </span>
        )}
      </div>

      {/* ── Cuerpo ──────────────────────────────────────────────────────── */}
      <div className="p-5 flex flex-col flex-1">

        {nutritionLine && (
          <p className="font-body text-[12px] text-brand-muted mb-1.5">
            {nutritionLine}
          </p>
        )}

        <h3 className="font-display font-bold text-brand-dark text-[17px] lg:text-[20px] leading-[1.25] line-clamp-2">
          {nombre}
        </h3>

        {descripcion && (
          <p className="font-body text-[13px] text-brand-muted mt-2 line-clamp-2 leading-relaxed">
            {descripcion}
          </p>
        )}

        {tagBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tagBadges.map((tag) => (
              <span key={tag.label} className={`text-[10px] font-medium px-2 py-0.5 rounded-btn ${tag.className}`}>
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* ── Precio + botón ──────────────────────────────────────────── */}
        <div
          className="mt-auto pt-4 border-t border-brand-border"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-body text-[20px] font-bold text-brand-dark block mb-3">
            {formatPrice(precio)}
          </span>

          {inCart ? (
            <div className="flex items-center rounded-btn bg-brand-primary overflow-hidden w-full">
              <button
                onClick={() => updateQty(id, inCart.cantidad - 1)}
                className="text-white w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-black/10 transition-colors"
                aria-label="Reducir cantidad"
              >
                −
              </button>
              <span className="text-white font-bold text-sm flex-1 text-center select-none">
                {inCart.cantidad}
              </span>
              <button
                onClick={() => updateQty(id, inCart.cantidad + 1)}
                className="text-white w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-black/10 transition-colors"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => add({ id, nombre, precio, foto_url })}
              className="w-full flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-body text-[14px] font-semibold py-2.5 rounded-btn transition-colors duration-200"
            >
              <PlusIcon />
              Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PlaceholderIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="24" r="15" fill="#F5F0E8" stroke="#D0C4B8" strokeWidth="1.2" />
      <circle cx="22" cy="24" r="10" fill="#FDF6EE" stroke="#D0C4B8" strokeWidth="1" />
      <path d="M16 22 Q19 19 22 22 Q25 25 28 22" stroke="#C8BDB5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="6" y1="1" x2="6" y2="11" />
      <line x1="1" y1="6" x2="11" y2="6" />
    </svg>
  );
}
