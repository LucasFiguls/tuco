"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";

export function Cart() {
  const { items, remove, updateQty, total, clear } = useCart();
  const router = useRouter();

  if (!items.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-5xl mb-3">🛒</p>
        <p className="text-sm">Tu carrito está vacío</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.nombre}</p>
              <p className="text-xs text-gray-500">${item.precio.toLocaleString("es-AR")} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item.id, item.cantidad - 1)}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-sm hover:bg-gray-100"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-medium">{item.cantidad}</span>
              <button
                onClick={() => updateQty(item.id, item.cantidad + 1)}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-sm hover:bg-gray-100"
              >
                +
              </button>
              <button
                onClick={() => remove(item.id)}
                className="ml-1 text-red-400 hover:text-red-600 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-100 mt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-gray-700">Total</span>
          <span className="text-xl font-bold text-gray-900">
            ${total.toLocaleString("es-AR")}
          </span>
        </div>
        <button
          onClick={() => router.push("/checkout")}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Confirmar pedido
        </button>
        <button
          onClick={clear}
          className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600 py-2"
        >
          Vaciar carrito
        </button>
      </div>
    </div>
  );
}
