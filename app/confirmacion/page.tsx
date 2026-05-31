"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function ConfirmacionContent() {
  const params = useSearchParams();
  const router = useRouter();
  const numero = params.get("numero");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm p-8 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido enviado!</h1>
        <p className="text-gray-500 mb-2">
          Tu pedido <span className="font-bold text-gray-800">#{numero}</span> fue recibido.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Se abrió WhatsApp para confirmar con el local. Si no se abrió, contactanos directamente.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Ver menú
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Cargando...</p></div>}>
      <ConfirmacionContent />
    </Suspense>
  );
}
