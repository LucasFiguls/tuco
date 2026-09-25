"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";
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

// ── Store sobre localStorage (useSyncExternalStore) ─────────────────────────

interface CartState {
  items: CartItem[];
  caja: number | null;
}

const EMPTY: CartState = { items: [], caja: null };
let snapshot: CartState | null = null;
const listeners = new Set<() => void>();

function readStorage(): CartState {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    const caja = Number(localStorage.getItem(CAJA_KEY));
    return { items: Array.isArray(items) ? items : [], caja: caja > 0 ? caja : null };
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): CartState {
  if (!snapshot) snapshot = readStorage();
  return snapshot;
}

function setState(update: (prev: CartState) => CartState) {
  snapshot = update(getSnapshot());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot.items));
    if (snapshot.caja) localStorage.setItem(CAJA_KEY, String(snapshot.caja));
    else localStorage.removeItem(CAJA_KEY);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Otra pestaña cambió el carrito: releer
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === CAJA_KEY) {
      snapshot = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { items, caja } = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function add(item: Omit<CartItem, "cantidad">) {
    setState((prev) => {
      let current = prev.items;
      // Una caja al vacío y un pedido caliente no se mezclan
      if (current.some((i) => (i.linea ?? "CALIENTE") !== (item.linea ?? "CALIENTE"))) {
        current = [];
      }
      const existing = current.find((i) => i.id === item.id);
      const next = existing
        ? current.map((i) => (i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i))
        : [...current, { ...item, cantidad: 1 }];
      return { items: next, caja: (item.linea ?? "CALIENTE") === "CALIENTE" ? null : prev.caja };
    });
  }

  function remove(id: string) {
    setState((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));
  }

  function updateQty(id: string, cantidad: number) {
    if (cantidad <= 0) return remove(id);
    setState((prev) => ({ ...prev, items: prev.items.map((i) => (i.id === id ? { ...i, cantidad } : i)) }));
  }

  function clear() {
    setState(() => EMPTY);
  }

  function setCaja(tamano: number | null) {
    setState((prev) => ({ ...prev, caja: tamano }));
  }

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const count = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, add, remove, updateQty, clear, total, count, drawerOpen, setDrawerOpen, caja, setCaja, hydrated }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
