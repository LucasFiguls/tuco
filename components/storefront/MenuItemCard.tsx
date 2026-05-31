"use client";

import Image from "next/image";
import { useCart } from "./CartContext";

interface MenuItemCardProps {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: string;
  foto_url: string | null;
}

export function MenuItemCard({ id, nombre, descripcion, precio, categoria, foto_url }: MenuItemCardProps) {
  const { add, items } = useCart();
  const inCart = items.find((i) => i.id === id);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="relative h-44 bg-gray-50">
        {foto_url ? (
          <Image
            src={foto_url}
            alt={nombre}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-medium text-orange-500 uppercase tracking-wide mb-1">
          {categoria}
        </span>
        <h3 className="font-semibold text-gray-900 mb-1">{nombre}</h3>
        {descripcion && (
          <p className="text-sm text-gray-500 flex-1 mb-3">{descripcion}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-gray-900">
            ${precio.toLocaleString("es-AR")}
          </span>
          <button
            onClick={() => add({ id, nombre, precio, foto_url })}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-4 py-2 rounded-xl transition-colors"
          >
            {inCart ? `Agregar (${inCart.cantidad})` : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
