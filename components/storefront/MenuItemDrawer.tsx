"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { MenuItem } from "@/lib/types";
import { useCart } from "./CartContext";
import { useDrawerBackButton } from "@/hooks/useDrawerBackButton";
import { getTag } from "@/lib/tags";

interface MenuItemDrawerProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function MenuItemDrawer({ item, onClose }: MenuItemDrawerProps) {
  const { add, items, updateQty } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inCart = item ? items.find((i) => i.id === item.id) : undefined;
  const isOpen = !!item;

  useDrawerBackButton(isOpen, onClose);

  // Reset scroll to top whenever a new item opens
  useEffect(() => {
    if (item && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [item?.id]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = item ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  const nutritionChips = item
    ? [
        { value: item.calorias != null ? String(item.calorias) : null, label: "kcal" },
        { value: item.proteinas != null ? `${item.proteinas}g` : null, label: "prot" },
        { value: item.carbohidratos != null ? `${item.carbohidratos}g` : null, label: "carb" },
        { value: item.grasas != null ? `${item.grasas}g` : null, label: "grasas" },
      ].filter((c): c is { value: string; label: string } => c.value !== null)
    : [];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item?.nombre ?? "Detalle del plato"}
        className={`fixed top-0 right-0 z-50 h-full w-full md:w-1/2 bg-white flex flex-col
                    shadow-[-8px_0_32px_rgba(0,0,0,0.12)]
                    transition-transform duration-300 ease-out ${
                      isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
      >
        {item && (
          <>
            {/* ── Hero image ──────────────────────────────────────────────── */}
            <div className="relative h-64 md:h-72 bg-brand-cream shrink-0">
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
                  <PlaceholderIcon />
                </div>
              )}

              {/* Gradient fade bottom */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

              {/* Category badge */}
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brand-primary text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-btn shadow-sm">
                {item.categoria}
              </span>

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 active:scale-95 transition-all duration-150"
              >
                <XIcon />
              </button>
            </div>

            {/* ── Scrollable body ──────────────────────────────────────────── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="px-6 pt-5 pb-6 space-y-5">

                {/* Title + tagline */}
                <div>
                  <h2 className="font-display font-bold text-[28px] leading-tight text-brand-dark">
                    {item.nombre}
                  </h2>
                  {item.tagline && (
                    <p className="font-body text-[15px] text-brand-muted mt-1.5 leading-snug">
                      {item.tagline}
                    </p>
                  )}
                </div>

                {/* Nutrition chips */}
                {nutritionChips.length > 0 && (
                  <div className="flex gap-2">
                    {nutritionChips.map((chip) => (
                      <div key={chip.label} className="flex-1 bg-brand-light rounded-card px-2 py-3 text-center">
                        <p className="font-body font-bold text-[16px] text-brand-dark leading-none">
                          {chip.value}
                        </p>
                        <p className="font-body text-[10px] text-brand-muted uppercase tracking-wide mt-1">
                          {chip.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                {(item.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => {
                      const cfg = getTag(tag);
                      return (
                        <span
                          key={tag}
                          className={`font-body text-[12px] font-medium px-3 py-1 rounded-btn ${cfg.className}`}
                        >
                          {cfg.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Description */}
                {item.descripcion && (
                  <p className="font-body text-[15px] text-brand-muted leading-[1.7]">
                    {item.descripcion}
                  </p>
                )}

                {/* "Tu Tuco viene con" */}
                {(item.components ?? []).length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="font-display font-semibold text-[17px] text-brand-dark whitespace-nowrap">
                        Tu Tuco viene con
                      </h3>
                      <div className="flex-1 h-px bg-brand-border" />
                    </div>
                    <div className="space-y-3">
                      {item.components.map((c) => (
                        <div key={c.id} className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-brand-light flex-shrink-0">
                            {c.foto_url ? (
                              <Image
                                src={c.foto_url}
                                alt={c.nombre}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : (
                              <div className="h-full flex items-center justify-center">
                                <ComponentPlaceholderIcon />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-[14px] font-medium text-brand-dark leading-tight">
                              {c.nombre}
                            </p>
                            <p className="font-body text-[12px] text-brand-muted mt-0.5">
                              {c.cantidad_label}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* ── Sticky footer ─────────────────────────────────────────────── */}
            <div className="shrink-0 border-t border-brand-border px-6 py-4 flex items-center gap-4 bg-white">
              <span className="font-body text-[24px] font-bold text-brand-dark">
                ${item.precio.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </span>

              {inCart ? (
                <div className="flex-1 flex items-center justify-center rounded-btn bg-brand-primary overflow-hidden h-12">
                  <button
                    onClick={() => updateQty(item.id, inCart.cantidad - 1)}
                    className="text-white w-12 h-full flex items-center justify-center text-xl font-bold hover:bg-black/10 transition-colors"
                    aria-label="Reducir cantidad"
                  >
                    −
                  </button>
                  <span className="text-white font-bold text-base flex-1 text-center select-none">
                    {inCart.cantidad}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, inCart.cantidad + 1)}
                    className="text-white w-12 h-full flex items-center justify-center text-xl font-bold hover:bg-black/10 transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => add({
                    id: item.id,
                    nombre: item.nombre,
                    precio: item.precio,
                    foto_url: item.foto_url,
                  })}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-body font-semibold text-[15px] h-12 rounded-btn transition-colors duration-200 active:scale-[0.98]"
                >
                  <PlusIcon />
                  Agregar al pedido
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

function PlaceholderIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="34" r="22" fill="#F5F0E8" stroke="#E8E0D5" strokeWidth="1.5" />
      <circle cx="32" cy="34" r="14" fill="#FDF6EE" stroke="#E8E0D5" strokeWidth="1" />
    </svg>
  );
}

function ComponentPlaceholderIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D0C4B8" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  );
}
