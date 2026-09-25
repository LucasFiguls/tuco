"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

interface OrderSummary {
  numero: number;
  items: Array<{ nombre: string; cantidad: number; precio: number }>;
  total: number;
  subtotal?: number;
  descuento?: number;
  vouchers?: number;
  caja?: number | null;
  descuentoCaja?: number;
  envio?: number;
  descuentoSuscripcion?: number;
  suscripcionUrl?: string | null;
  frecuencia?: number | null;
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
            {!!order.descuentoCaja && (
              <div className="flex justify-between text-sm pb-1.5 text-tuco-green font-medium">
                <span>Descuento caja de {order.caja}</span>
                <span>−${order.descuentoCaja.toLocaleString("es-AR")}</span>
              </div>
            )}
            {!!order.descuentoSuscripcion && (
              <div className="flex justify-between text-sm pb-1.5 text-tuco-green font-medium">
                <span>Descuento suscripción</span>
                <span>−${order.descuentoSuscripcion.toLocaleString("es-AR")}</span>
              </div>
            )}
            {!!order.envio && (
              <div className="flex justify-between text-sm pb-1.5 text-tuco-brown">
                <span>Envío</span>
                <span>${order.envio.toLocaleString("es-AR")}</span>
              </div>
            )}
            {!!order.descuento && (
              <div className="flex justify-between text-sm pb-1.5 text-tuco-green font-medium">
                <span>🎟 {order.vouchers} voucher{order.vouchers === 1 ? "" : "s"} de tu empresa</span>
                <span>−${order.descuento.toLocaleString("es-AR")}</span>
              </div>
            )}
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

        {order?.suscripcionUrl && <LinkSuscripcion url={order.suscripcionUrl} frecuencia={order.frecuencia ?? null} />}

        {order?.caja && (
          <div className="bg-brand-frio-light rounded-2xl p-4 mb-6 text-sm text-brand-dark">
            <p className="font-semibold mb-1">Cuando recibas tu caja</p>
            <p>
              Guardá todo en la heladera. Lo que no vayas a comer en los próximos días, pasalo al freezer apenas llega.
              Cada bolsa trae cómo regenerarla.
            </p>
          </div>
        )}

        <button
          onClick={() => router.push(order?.caja ? "/armar" : "/")}
          className="w-full bg-tuco-red hover:bg-tuco-red-dark text-white font-semibold py-3.5 rounded-full transition-colors text-sm"
        >
          {order?.caja ? "Armar otra caja" : "Ver el menú"}
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

function LinkSuscripcion({ url, frecuencia }: { url: string; frecuencia: number | null }) {
  const [copiado, setCopiado] = useState(false);
  const completo = typeof window !== "undefined" ? window.location.origin + url : url;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(completo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {}
  }

  return (
    <div className="bg-brand-cream border border-brand-border rounded-2xl p-4 mb-6 text-sm text-brand-dark">
      <p className="font-semibold mb-1">🔁 Tu suscripción está activa</p>
      <p className="mb-3">
        Vas a recibir esta caja {frecuencia === 7 ? "cada semana" : frecuencia === 14 ? "cada 2 semanas" : "cada mes"}. Guardá
        este link privado: con él podés cambiar la caja, saltear una entrega, pausarla o cancelarla.{" "}
        <strong>No lo compartas.</strong>
      </p>
      <div className="flex gap-2">
        <a href={url} className="flex-1 text-center font-semibold bg-brand-primary text-white rounded-full py-2 hover:bg-brand-primary-hover">
          Ir a mi suscripción
        </a>
        <button type="button" onClick={copiar} className="px-4 rounded-full border border-brand-border font-semibold hover:bg-white">
          {copiado ? "¡Copiado!" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}
