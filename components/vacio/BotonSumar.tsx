"use client";

import { useCart } from "@/components/storefront/CartContext";
import { CAJA_SUGERIDA } from "@/lib/vacio";

interface BotonSumarProps {
  producto: { id: string; nombre: string; precio: number; foto_url: string | null };
  size?: "sm" | "md";
  label?: string;
}

/** "+" que suma una bolsa a la caja; si ya está, muestra el contador −/+. */
export function BotonSumar({ producto, size = "sm", label = "Sumar" }: BotonSumarProps) {
  const { items, add, updateQty, caja, setCaja } = useCart();
  const enCaja = items.find((i) => i.id === producto.id);

  function sumar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!caja) setCaja(CAJA_SUGERIDA);
    add({ id: producto.id, nombre: producto.nombre, precio: producto.precio, foto_url: producto.foto_url, linea: "VACIO" });
  }

  function restar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (enCaja) updateQty(producto.id, enCaja.cantidad - 1);
  }

  const alto = size === "md" ? "h-12 text-base" : "h-10 text-sm";

  if (!enCaja) {
    return (
      <button
        type="button"
        onClick={sumar}
        className={`${alto} w-full inline-flex items-center justify-center gap-1.5 rounded-btn font-body font-semibold border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200 active:scale-[0.98]`}
      >
        + {label}
      </button>
    );
  }

  return (
    <div className={`${alto} w-full flex items-center justify-between rounded-btn bg-brand-primary text-white font-body font-semibold`}>
      <button type="button" onClick={restar} aria-label={`Quitar ${producto.nombre}`} className="h-full px-4 hover:bg-black/10 rounded-l-btn">
        −
      </button>
      <span aria-live="polite">{enCaja.cantidad}</span>
      <button type="button" onClick={sumar} aria-label={`Sumar ${producto.nombre}`} className="h-full px-4 hover:bg-black/10 rounded-r-btn">
        +
      </button>
    </div>
  );
}
