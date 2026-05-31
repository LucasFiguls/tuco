"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import { Cart } from "./Cart";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { count, total } = useCart();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg px-5 py-3 flex items-center gap-2 transition-all"
      >
        <span className="text-lg">🛒</span>
        {count > 0 && (
          <>
            <span className="font-semibold">{count}</span>
            <span className="text-sm opacity-90">· ${total.toLocaleString("es-AR")}</span>
          </>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="w-full max-w-sm bg-white h-full flex flex-col p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Tu pedido</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <Cart />
          </div>
        </div>
      )}
    </>
  );
}
