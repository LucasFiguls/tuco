"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";

export function Cart() {
  const { items, remove, updateQty, total, clear, setDrawerOpen } = useCart();
  const router = useRouter();

  function goToCheckout() {
    setDrawerOpen(false);
    router.push("/checkout");
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-tuco-cream flex items-center justify-center mb-4">
          <EmptyCartIcon />
        </div>
        <p className="font-serif text-lg text-tuco-brown font-semibold mb-1">Tu carrito está vacío</p>
        <p className="text-sm text-tuco-brown-light">Agregá viandas desde el menú</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Lista de ítems */}
      <div className="flex-1 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-tuco-cream/50 rounded-xl border border-tuco-cream">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-tuco-brown truncate">{item.nombre}</p>
              <p className="text-xs text-tuco-brown-light mt-0.5">
                ${item.precio.toLocaleString("es-AR")} c/u
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => updateQty(item.id, item.cantidad - 1)}
                className="w-7 h-7 rounded-full bg-tuco-white border border-tuco-cream hover:border-tuco-brown-light text-tuco-brown flex items-center justify-center text-sm font-bold transition-colors"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-semibold text-tuco-brown">{item.cantidad}</span>
              <button
                onClick={() => updateQty(item.id, item.cantidad + 1)}
                className="w-7 h-7 rounded-full bg-tuco-white border border-tuco-cream hover:border-tuco-brown-light text-tuco-brown flex items-center justify-center text-sm font-bold transition-colors"
              >
                +
              </button>
              <button
                onClick={() => remove(item.id)}
                className="ml-1 w-6 h-6 flex items-center justify-center text-tuco-brown-light hover:text-tuco-red transition-colors"
                aria-label={`Eliminar ${item.nombre}`}
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-5 mt-4 border-t border-tuco-cream">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-tuco-brown">Total</span>
          <span className="font-serif text-2xl font-bold text-tuco-brown">
            ${total.toLocaleString("es-AR")}
          </span>
        </div>
        <button
          onClick={goToCheckout}
          className="w-full bg-tuco-red hover:bg-tuco-red-dark text-white font-bold py-3.5 rounded-full text-sm transition-colors shadow-sm"
        >
          Confirmar pedido
        </button>
        <button
          onClick={clear}
          className="w-full mt-2 text-xs text-tuco-brown-light hover:text-tuco-brown py-2 transition-colors"
        >
          Vaciar carrito
        </button>
      </div>
    </div>
  );
}

function EmptyCartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8D6E63" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}
