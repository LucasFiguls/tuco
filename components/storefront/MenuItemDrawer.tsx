"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { useCart } from "./CartContext";
import { Accordion } from "./Accordion";
import { NutritionGrid } from "./NutritionGrid";

interface MenuItemDrawerProps {
  item: MenuItem | null;
  onClose: () => void;
}

const TAG_RULES: { pattern: RegExp; label: string; className: string }[] = [
  { pattern: /sin tacc|gluten/i,  label: "Sin TACC",    className: "bg-green-100 text-green-800" },
  { pattern: /vegano/i,           label: "Vegano",      className: "bg-green-100 text-green-800" },
  { pattern: /vegetarian[oa]/i,   label: "Vegetariano", className: "bg-green-100 text-green-800" },
  { pattern: /picante/i,          label: "Picante",     className: "bg-red-100 text-red-700" },
  { pattern: /sin sal/i,          label: "Sin sal",     className: "bg-slate-100 text-slate-600" },
  { pattern: /keto/i,             label: "Apto Keto",   className: "bg-amber-100 text-amber-700" },
];

function extractTags(text: string | null) {
  if (!text) return [];
  return TAG_RULES.filter((r) => r.pattern.test(text));
}

function formatPrice(n: number) {
  return "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

const hasNutrition = (item: MenuItem) =>
  item.calorias !== null ||
  item.proteinas !== null ||
  item.carbohidratos !== null ||
  item.grasas !== null;

export function MenuItemDrawer({ item, onClose }: MenuItemDrawerProps) {
  const { add, items, updateQty } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  const inCart = item ? items.find((i) => i.id === item.id) : undefined;
  const tags = extractTags(item?.descripcion ?? null);

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  const isOpen = !!item;

  return (
    <>
      {/* ── Overlay ──────────────────────────────────────────────────────── */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />

      {/* ── Panel ─────────────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={item?.nombre ?? "Detalle del plato"}
        className={`fixed top-0 right-0 z-50 h-full w-full md:w-1/2 bg-white flex flex-col
                    shadow-[−8px_0_32px_rgba(0,0,0,0.12)]
                    transition-transform duration-300 ease-out ${
                      isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
      >
        {item && (
          <>
            {/* ── Imagen ────────────────────────────────────────────────── */}
            <div className="relative h-[240px] md:h-[320px] bg-brand-cream shrink-0">
              {item.foto_url ? (
                <Image
                  src={item.foto_url}
                  alt={item.nombre}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 480px"
                  priority
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <svg width="56" height="56" viewBox="0 0 44 44" fill="none">
                    <circle cx="22" cy="24" r="15" fill="#F5F0E8" stroke="#D0C4B8" strokeWidth="1.2" />
                    <circle cx="22" cy="24" r="10" fill="#FDF6EE" stroke="#D0C4B8" strokeWidth="1" />
                  </svg>
                </div>
              )}

              {/* Badge categoría */}
              <span className="absolute top-3 left-3 bg-white/90 text-brand-primary text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-btn">
                {item.categoria}
              </span>

              {/* Botón cerrar */}
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
              >
                <XIcon />
              </button>
            </div>

            {/* ── Contenido scrollable ────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">

              <h2 className="font-display font-bold text-[28px] text-brand-dark leading-tight">
                {item.nombre}
              </h2>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag.label}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-btn ${tag.className}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}

              {item.descripcion && (
                <p className="font-body text-[15px] text-brand-muted leading-[1.6] mt-4">
                  {item.descripcion}
                </p>
              )}

              {hasNutrition(item) && (
                <div className="mt-6">
                  <Accordion title="Nutrición" defaultOpen>
                    <NutritionGrid
                      calorias={item.calorias}
                      proteinas={item.proteinas}
                      carbohidratos={item.carbohidratos}
                      grasas={item.grasas}
                    />
                  </Accordion>
                </div>
              )}

              {item.ingredientes && (
                <Accordion title="Ingredientes" defaultOpen>
                  <p className="font-body text-[14px] text-brand-muted leading-relaxed">
                    {item.ingredientes}
                  </p>
                </Accordion>
              )}
            </div>

            {/* ── Pie sticky ────────────────────────────────────────────── */}
            <div className="shrink-0 border-t border-brand-border px-6 py-4 flex items-center gap-4 bg-white">
              <span className="font-body text-[24px] font-bold text-brand-dark">
                {formatPrice(item.precio)}
              </span>

              {inCart ? (
                <div className="flex-1 flex items-center justify-center rounded-btn bg-brand-primary overflow-hidden">
                  <button
                    onClick={() => updateQty(item.id, inCart.cantidad - 1)}
                    className="text-white w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-black/10 transition-colors"
                    aria-label="Reducir cantidad"
                  >
                    −
                  </button>
                  <span className="text-white font-bold text-base flex-1 text-center select-none">
                    {inCart.cantidad}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, inCart.cantidad + 1)}
                    className="text-white w-12 h-12 flex items-center justify-center text-xl font-bold hover:bg-black/10 transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => add({ id: item.id, nombre: item.nombre, precio: item.precio, foto_url: item.foto_url })}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-body font-semibold text-[15px] py-3 rounded-btn transition-colors duration-200"
                >
                  <PlusIcon />
                  Agregar al carrito
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="6" y1="1" x2="6" y2="11" />
      <line x1="1" y1="6" x2="11" y2="6" />
    </svg>
  );
}
