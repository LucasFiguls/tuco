"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CartItem } from "@/lib/types";

interface CartContextValue {
  items: CartItem[];
  add: (item: Omit<CartItem, "cantidad">) => void;
  remove: (id: string) => void;
  updateQty: (id: string, cantidad: number) => void;
  clear: () => void;
  total: number;
  count: number;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  /** Tamaño de caja elegido en la línea al vacío (null = pedido común). */
  caja: number | null;
  setCaja: (tamano: number | null) => void;
  /** true cuando ya se leyó localStorage (evita pisar lo guardado). */
  hydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "tuco_cart";
const CAJA_KEY = "tuco_caja";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [caja, setCaja] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
      const storedCaja = Number(localStorage.getItem(CAJA_KEY));
      if (storedCaja > 0) setCaja(storedCaja);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    try {
      if (caja) localStorage.setItem(CAJA_KEY, String(caja));
      else localStorage.removeItem(CAJA_KEY);
    } catch {}
  }, [caja]);

  function add(item: Omit<CartItem, "cantidad">) {
    if ((item.linea ?? "CALIENTE") === "CALIENTE") setCaja(null);
    setItems((prev) => {
      // Una caja al vacío y un pedido caliente no se mezclan
      if (prev.some((i) => (i.linea ?? "CALIENTE") !== (item.linea ?? "CALIENTE"))) {
        prev = [];
      }
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQty(id: string, cantidad: number) {
    if (cantidad <= 0) return remove(id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, cantidad } : i))
    );
  }

  function clear() {
    setItems([]);
    setCaja(null);
  }

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const count = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, total, count, drawerOpen, setDrawerOpen, caja, setCaja, hydrated }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
