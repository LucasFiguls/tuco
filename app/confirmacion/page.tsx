"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

interface OrderSummary {
  numero: number;
  items: Array<{ nombre: string; cantidad: number; precio: number }>;
  total: number;
  modalidad: "RETIRO" | "DELIVERY";
  nombre: string;
}

function ConfirmacionContent() {
  const params = useSearchParams();
  const router = useRouter();
  const numero = params.get("numero");
  const [order, setOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("tuco_last_order");
      if (raw) {
        setOrder(JSON.parse(raw));
        sessionStorage.removeItem("tuco_last_order");
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-tuco-cream flex items-center justify-center px-4 py-12">
      <div className="bg-tuco-white rounded-3xl shadow-sm p-8 max-w-md w-full">
        {/* Ícono de éxito */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-tuco-green/10 flex items-center justify-center">
            <CheckIcon />
          </div>
        </div>

        {/* Mensaje principal */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl text-tuco-brown font-bold mb-2">
            ¡Pedido recibido!
          </h1>
          {numero && (
            <p className="text-tuco-brown-light text-sm mb-3">
              Pedido <span className="font-bold text-tuco-brown">#{numero}</span>
            </p>
          )}
          <p className="text-tuco-brown-light leading-relaxed">
            ¡Tu pedido fue recibido! Te contactamos a la brevedad para coordinar la entrega.
          </p>
        </div>

        {/* Resumen del pedido */}
        {order && (
          <div className="bg-tuco-cream rounded-2xl p-4 mb-6">
            <h2 className="text-xs font-semibold text-tuco-brown uppercase tracking-wider mb-3">
              Resumen
            </h2>
            <div className="space-y-1.5 mb-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-tuco-brown">
                    {item.cantidad}× {item.nombre}
                  </span>
                  <span className="font-medium text-tuco-brown">
                    ${(item.precio * item.cantidad).toLocaleString("es-AR")}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-sm pt-2 border-t border-tuco-brown/10">
              <span className="text-tuco-brown">Total</span>
              <span className="text-tuco-brown font-serif text-base">
                ${order.total.toLocaleString("es-AR")}
              </span>
            </div>
            <p className="text-xs text-tuco-brown-light mt-2">
              {order.modalidad === "DELIVERY" ? "🛵 Delivery" : "🏠 Retiro en local"}
            </p>
          </div>
        )}

        <button
          onClick={() => router.push("/")}
          className="w-full bg-tuco-red hover:bg-tuco-red-dark text-white font-semibold py-3.5 rounded-full transition-colors text-sm"
        >
          Ver el menú
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 16 13 23 26 9" />
    </svg>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Cargando...</p></div>}>
      <ConfirmacionContent />
    </Suspense>
  );
}
