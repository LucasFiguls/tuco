"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { Cart } from "./Cart";
import { useDrawerBackButton } from "@/hooks/useDrawerBackButton";

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, count, total } = useCart();
  const router = useRouter();
  const releaseHistory = useDrawerBackButton(drawerOpen, () => setDrawerOpen(false));

  function goToCheckout() {
    releaseHistory();        // prevent cleanup from calling history.back()
    setDrawerOpen(false);
    router.push("/checkout");
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden
      />

      {/* Panel lateral */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tu carrito"
        className={`fixed inset-y-0 right-0 w-full md:w-1/2 bg-tuco-white shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header del drawer */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-tuco-cream">
          <div>
            <h2 className="font-serif text-xl text-tuco-brown font-bold">Tu pedido</h2>
            {count > 0 && (
              <p className="text-xs text-tuco-brown-light mt-0.5">
                {count} {count === 1 ? "ítem" : "ítems"} · ${total.toLocaleString("es-AR")}
              </p>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-tuco-cream hover:bg-tuco-cream/80 flex items-center justify-center text-tuco-brown transition-colors"
            aria-label="Cerrar carrito"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Cart onCheckout={goToCheckout} />
        </div>
      </div>
    </>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="1" y1="1" x2="13" y2="13" />
      <line x1="13" y1="1" x2="1" y2="13" />
    </svg>
  );
}
