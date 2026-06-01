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
    <div className="bg-tuco-white rounded-2xl overflow-hidden flex flex-col group border border-tuco-cream hover:border-tuco-brown/20 hover:shadow-md transition-all duration-200">
      {/* Imagen */}
      <div className="relative h-40 bg-tuco-cream overflow-hidden">
        {foto_url ? (
          <Image
            src={foto_url}
            alt={nombre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <PlaceholderIcon />
          </div>
        )}
        {/* Badge categoría */}
        <span className="absolute top-2 left-2 bg-tuco-white/90 text-tuco-brown text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-tuco-cream">
          {categoria}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-serif font-bold text-tuco-brown text-base leading-snug mb-1">{nombre}</h3>
        {descripcion && (
          <p className="text-xs text-tuco-brown-light flex-1 mb-3 leading-relaxed line-clamp-2">{descripcion}</p>
        )}
        <div className="flex items-center justify-between mt-auto gap-2">
          <span className="font-serif text-lg font-bold text-tuco-brown">
            ${precio.toLocaleString("es-AR")}
          </span>
          <button
            onClick={() => add({ id, nombre, precio, foto_url })}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full transition-colors ${
              inCart
                ? "bg-tuco-green text-white hover:bg-tuco-green/90"
                : "bg-tuco-red text-white hover:bg-tuco-red-dark"
            }`}
          >
            {inCart ? (
              <>
                <CheckIcon />
                {inCart.cantidad}
              </>
            ) : (
              <>
                <PlusIcon />
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlaceholderIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="22" r="14" fill="#F5F0E8" stroke="#8D6E63" strokeWidth="1.2" />
      <circle cx="20" cy="22" r="10" fill="#FAFAF7" stroke="#8D6E63" strokeWidth="1" />
      <path d="M14 20 Q17 17 20 20 Q23 23 26 20" stroke="#C0392B" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      <line x1="9" y1="10" x2="9" y2="17" stroke="#8D6E63" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="10" x2="7" y2="13" stroke="#8D6E63" strokeWidth="1" strokeLinecap="round" />
      <line x1="9" y1="10" x2="9" y2="13" stroke="#8D6E63" strokeWidth="1" strokeLinecap="round" />
      <line x1="11" y1="10" x2="11" y2="13" stroke="#8D6E63" strokeWidth="1" strokeLinecap="round" />
      <line x1="31" y1="10" x2="31" y2="17" stroke="#8D6E63" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M31 10 Q34 12 31 15" stroke="#8D6E63" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="6" y1="1" x2="6" y2="11" />
      <line x1="1" y1="6" x2="11" y2="6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 6 5 9 10 3" />
    </svg>
  );
}
