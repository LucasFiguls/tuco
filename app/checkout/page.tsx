"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/storefront/CartContext";
import type { CheckoutData } from "@/lib/types";

const HORARIOS = [
  "12:00", "12:30", "13:00", "13:30", "14:00",
  "19:00", "19:30", "20:00", "20:30", "21:00",
];

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CheckoutData>({
    cliente_nombre: "",
    cliente_telefono: "",
    modalidad: "RETIRO",
    direccion_entrega: "",
    fecha_entrega: getTodayDate(),
    hora_entrega: HORARIOS[0],
    comentarios: "",
  });

  function set(field: keyof CheckoutData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!items.length) {
      setError("Tu carrito está vacío");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkout: form, items }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al crear el pedido");
      }

      const pedido = await res.json();

      // Guardamos el resumen en sessionStorage para la pantalla de confirmación
      sessionStorage.setItem(
        "tuco_last_order",
        JSON.stringify({
          numero: pedido.numero_pedido,
          items,
          total,
          modalidad: form.modalidad,
          nombre: form.cliente_nombre,
        })
      );

      clear();
      router.push(`/confirmacion?numero=${pedido.numero_pedido}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🛒</p>
          <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
          <button onClick={() => router.push("/")} className="text-orange-500 font-medium">
            Ver menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-900">Confirmar pedido</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">Resumen</h2>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span className="text-gray-700">
                {item.cantidad}× {item.nombre}
              </span>
              <span className="font-medium">${(item.precio * item.cantidad).toLocaleString("es-AR")}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-base pt-3 border-t mt-3">
            <span>Total</span>
            <span>${total.toLocaleString("es-AR")}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-800">Tus datos</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre y apellido</label>
              <input
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={form.cliente_nombre}
                onChange={(e) => set("cliente_nombre", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                required
                type="tel"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={form.cliente_telefono}
                onChange={(e) => set("cliente_telefono", e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-800">Entrega</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
              <div className="flex gap-3">
                {(["RETIRO", "DELIVERY"] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => set("modalidad", m)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      form.modalidad === m
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {m === "RETIRO" ? "🏠 Retiro en local" : "🛵 Delivery"}
                  </button>
                ))}
              </div>
            </div>

            {form.modalidad === "DELIVERY" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  value={form.direccion_entrega}
                  onChange={(e) => set("direccion_entrega", e.target.value)}
                  placeholder="Calle 123, Piso 2, Depto B"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  required
                  type="date"
                  min={getTodayDate()}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  value={form.fecha_entrega}
                  onChange={(e) => set("fecha_entrega", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <select
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  value={form.hora_entrega}
                  onChange={(e) => set("hora_entrega", e.target.value)}
                >
                  {HORARIOS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentarios adicionales
              </label>
              <textarea
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                value={form.comentarios}
                onChange={(e) => set("comentarios", e.target.value)}
                placeholder="Alergias, aclaraciones, etc."
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-base transition-colors"
          >
            {loading ? "Procesando..." : "Enviar pedido"}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Al confirmar, recibiremos tu pedido y te contactaremos para coordinar
          </p>
        </form>
      </div>
    </div>
  );
}
