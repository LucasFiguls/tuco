"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/storefront/CartContext";
import type { ProductoVacio } from "@/lib/vacio-data";
import {
  CAJA_SUGERIDA,
  TIPO_PLURAL,
  cajaParaCantidad,
  descuentoCaja,
  type Caja,
  type TipoVacio,
} from "@/lib/vacio";
import { ProductoCard } from "./ProductoCard";

const TIPOS: TipoVacio[] = ["PLATO", "BASE", "GUARNICION", "SALSA"];

const FILTROS_TAG = [
  { id: "veggie", label: "Veggie", tags: ["vegetariano", "vegano"] },
  { id: "sin_tacc", label: "Sin TACC", tags: ["sin_tacc", "apto_celiaco"] },
  { id: "proteina", label: "Alta proteína", tags: ["alto_proteina"] },
];

function precio(n: number) {
  return "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

interface ArmadorCajaProps {
  productos: ProductoVacio[];
  cajas: Caja[];
  cajaInicial: number | null;
  preview: boolean;
}

export function ArmadorCaja({ productos, cajas, cajaInicial, preview }: ArmadorCajaProps) {
  const router = useRouter();
  const { items, add, updateQty, caja, setCaja, hydrated } = useCart();
  const [tipo, setTipo] = useState<TipoVacio | "TODOS">("TODOS");
  const [tagFiltro, setTagFiltro] = useState<string | null>(null);
  const [panelMobile, setPanelMobile] = useState(false);

  // La caja de la URL (?caja=N) manda; si no hay ninguna elegida, la sugerida
  useEffect(() => {
    if (!hydrated) return;
    if (cajaInicial && cajas.some((c) => c.tamano === cajaInicial)) setCaja(cajaInicial);
    else if (!caja) setCaja(CAJA_SUGERIDA);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, cajaInicial]);

  const tamano = caja ?? CAJA_SUGERIDA;
  const enCaja = items.filter((i) => i.linea === "VACIO");
  const count = enCaja.reduce((s, i) => s + i.cantidad, 0);
  const subtotal = enCaja.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const descuento = descuentoCaja(subtotal, tamano, cajas);
  const pct = cajas.find((c) => c.tamano === tamano)?.descuento ?? 0;
  const faltan = tamano - count;
  const completa = faltan === 0;
  const siguiente = count > tamano ? cajaParaCantidad(count, cajas) : null;

  const visibles = productos.filter(
    (p) =>
      (tipo === "TODOS" || p.tipo === tipo) &&
      (!tagFiltro || FILTROS_TAG.find((f) => f.id === tagFiltro)!.tags.some((t) => p.tags.includes(t)))
  );

  // "Va bien con…": sugerencias de lo que ya está en la caja, que todavía no sumó
  const sugerencias = useMemo(() => {
    const ids = new Set(enCaja.map((i) => i.id));
    const sugeridos = new Set<string>();
    for (const i of enCaja) {
      const p = productos.find((x) => x.id === i.id);
      p?.va_bien_con.forEach((id) => !ids.has(id) && sugeridos.add(id));
    }
    return productos.filter((p) => sugeridos.has(p.id) && (p.disponible || preview)).slice(0, 2);
  }, [enCaja, productos, preview]);

  function llenarPorMi() {
    const candidatos = productos.filter((p) => p.disponible || preview);
    if (!candidatos.length) return;
    for (let i = 0; i < faltan; i++) {
      const p = candidatos[i % candidatos.length];
      add({ id: p.id, nombre: p.nombre, precio: p.precio, foto_url: p.foto_url, linea: "VACIO" });
    }
  }

  const resumen = (
    <ResumenCaja
      tamano={tamano}
      count={count}
      subtotal={subtotal}
      descuento={descuento}
      pct={pct}
      items={enCaja}
      sugerencias={sugerencias}
      onQty={updateQty}
      onSumar={(p) => add({ id: p.id, nombre: p.nombre, precio: p.precio, foto_url: p.foto_url, linea: "VACIO" })}
    />
  );

  const accion = (
    <div className="space-y-2">
      {siguiente ? (
        <button
          type="button"
          onClick={() => setCaja(siguiente.tamano)}
          className="w-full rounded-btn bg-brand-primary text-white font-body font-semibold py-3 hover:bg-brand-primary-hover"
        >
          Pasar a la caja de {siguiente.tamano}
          {siguiente.descuento > 0 && ` (−${siguiente.descuento}%)`}
        </button>
      ) : count > tamano ? (
        <p className="font-body text-sm text-red-700 bg-red-50 rounded-input px-3 py-2">
          Te pasaste por {count - tamano}. Quitá algunas bolsas para continuar.
        </p>
      ) : (
        <button
          type="button"
          disabled={!completa}
          onClick={() => router.push("/checkout")}
          className="w-full rounded-btn bg-brand-primary text-white font-body font-semibold py-3 hover:bg-brand-primary-hover disabled:bg-brand-border disabled:text-brand-muted disabled:cursor-not-allowed transition-colors"
        >
          {completa ? "Ir al checkout" : `Faltan ${faltan}`}
        </button>
      )}
      {count < tamano && (
        <button type="button" onClick={llenarPorMi} className="w-full font-body text-sm font-semibold text-brand-primary hover:text-brand-primary-hover py-1">
          Llenala por mí
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 pb-40 lg:pb-16">
      {preview && (
        <p className="mb-6 font-body text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-input px-4 py-3">
          Vista previa de admin: se muestran también los productos no disponibles.
        </p>
      )}

      <div className="mb-6">
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-2">Armá tu caja</p>
        <h1 className="font-display font-bold text-brand-dark text-[32px] md:text-[44px] leading-tight">
          Llená tu heladera como quieras
        </h1>
      </div>

      {/* ── Tamaño de caja ────────────────────────────────────────────── */}
      <div role="radiogroup" aria-label="Tamaño de caja" className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
        {cajas.map((c) => (
          <button
            key={c.tamano}
            role="radio"
            aria-checked={tamano === c.tamano}
            onClick={() => setCaja(c.tamano)}
            className={`rounded-input border px-2 py-3 font-body transition-all duration-200 ${
              tamano === c.tamano
                ? "bg-brand-primary border-brand-primary text-white"
                : "bg-white border-brand-border text-brand-dark hover:border-brand-primary"
            }`}
          >
            <span className="block text-lg sm:text-xl font-bold leading-none">{c.tamano}</span>
            <span className={`block text-[11px] sm:text-xs mt-1 ${tamano === c.tamano ? "text-white/85" : "text-brand-muted"}`}>
              {c.descuento ? `−${c.descuento}%` : "lista"}
            </span>
          </button>
        ))}
      </div>

      {/* ── Filtros ───────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-6 -mx-4 px-4">
        <Chip activo={tipo === "TODOS"} onClick={() => setTipo("TODOS")}>
          Todo
        </Chip>
        {TIPOS.map((t) => (
          <Chip key={t} activo={tipo === t} onClick={() => setTipo(t)}>
            {TIPO_PLURAL[t]}
          </Chip>
        ))}
        <span className="w-px bg-brand-border shrink-0 mx-1" aria-hidden />
        {FILTROS_TAG.map((f) => (
          <Chip key={f.id} activo={tagFiltro === f.id} onClick={() => setTagFiltro((cur) => (cur === f.id ? null : f.id))}>
            {f.label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* ── Grilla ──────────────────────────────────────────────────── */}
        <div>
          {visibles.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {visibles.map((p, i) => (
                <ProductoCard key={p.id} producto={p} priority={i < 3} />
              ))}
            </div>
          ) : (
            <p className="font-body text-brand-muted text-center py-16 bg-white rounded-card">
              {productos.length ? "No hay productos con ese filtro." : "Estamos preparando el menú. Volvé pronto."}
            </p>
          )}
        </div>

        {/* ── Caja: panel lateral en desktop ───────────────────────────── */}
        <aside className="hidden lg:block sticky top-28 bg-white rounded-card shadow-card p-5">
          {resumen}
          <div className="mt-5">{accion}</div>
        </aside>
      </div>

      {/* ── Caja: barra fija en mobile ──────────────────────────────────── */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-brand-border shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        {panelMobile && <div className="max-h-[55vh] overflow-y-auto px-4 pt-4">{resumen}</div>}
        <div className="px-4 py-3 space-y-2">
          <button
            type="button"
            onClick={() => setPanelMobile((v) => !v)}
            aria-expanded={panelMobile}
            className="w-full flex items-center justify-between font-body"
          >
            <span className="text-left">
              <span className="block font-semibold text-brand-dark">
                {count} de {tamano}
              </span>
              <Progreso count={count} tamano={tamano} className="w-32 mt-1" />
            </span>
            <span className="text-right text-sm">
              <span className="block font-semibold text-brand-dark">{precio(subtotal - descuento)}</span>
              <span className="text-brand-muted">{panelMobile ? "Ocultar caja ▼" : "Ver caja ▲"}</span>
            </span>
          </button>
          {accion}
        </div>
      </div>
    </div>
  );
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`shrink-0 font-body text-sm font-medium px-4 py-2 rounded-btn border transition-all duration-200 ${
        activo ? "bg-brand-dark border-brand-dark text-white" : "bg-white border-brand-border text-brand-dark hover:border-brand-dark"
      }`}
    >
      {children}
    </button>
  );
}

function Progreso({ count, tamano, className = "" }: { count: number; tamano: number; className?: string }) {
  const pct = Math.min(100, (count / tamano) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={tamano}
      aria-valuenow={count}
      className={`h-2 rounded-full bg-brand-light overflow-hidden ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ${count > tamano ? "bg-red-500" : count === tamano ? "bg-green-600" : "bg-brand-primary"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ResumenCaja({
  tamano,
  count,
  subtotal,
  descuento,
  pct,
  items,
  sugerencias,
  onQty,
  onSumar,
}: {
  tamano: number;
  count: number;
  subtotal: number;
  descuento: number;
  pct: number;
  items: Array<{ id: string; nombre: string; precio: number; cantidad: number }>;
  sugerencias: ProductoVacio[];
  onQty: (id: string, cantidad: number) => void;
  onSumar: (p: ProductoVacio) => void;
}) {
  const libres = Math.max(0, tamano - count);
  return (
    <div className="font-body">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-display text-xl font-bold text-brand-dark">Tu caja</h2>
        <span className="text-sm font-semibold text-brand-dark">
          {count} de {tamano}
        </span>
      </div>
      <Progreso count={count} tamano={tamano} />

      {items.length === 0 ? (
        <p className="text-sm text-brand-muted mt-4">Sumá bolsas desde el menú con el botón “+ Sumar”.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-2 text-sm">
              <span className="flex-1 min-w-0 truncate text-brand-dark">{i.nombre}</span>
              <button type="button" onClick={() => onQty(i.id, i.cantidad - 1)} aria-label={`Quitar ${i.nombre}`} className="w-7 h-7 rounded-full border border-brand-border hover:border-brand-dark">
                −
              </button>
              <span className="w-5 text-center font-semibold">{i.cantidad}</span>
              <button type="button" onClick={() => onQty(i.id, i.cantidad + 1)} aria-label={`Sumar ${i.nombre}`} className="w-7 h-7 rounded-full border border-brand-border hover:border-brand-dark">
                +
              </button>
            </li>
          ))}
        </ul>
      )}
      {libres > 0 && items.length > 0 && (
        <p className="text-xs text-brand-muted mt-3">
          {libres} lugar{libres === 1 ? "" : "es"} libre{libres === 1 ? "" : "s"}
        </p>
      )}

      {sugerencias.length > 0 && (
        <div className="mt-4 bg-brand-cream rounded-input p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">Va bien con…</p>
          <ul className="space-y-1.5">
            {sugerencias.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-brand-dark">{s.nombre}</span>
                <button type="button" onClick={() => onSumar(s)} className="shrink-0 font-semibold text-brand-primary hover:text-brand-primary-hover">
                  + Sumar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <dl className="mt-4 pt-4 border-t border-brand-border space-y-1 text-sm">
        <div className="flex justify-between text-brand-muted">
          <dt>Subtotal</dt>
          <dd>{precio(subtotal)}</dd>
        </div>
        {descuento > 0 && (
          <div className="flex justify-between text-brand-primary font-medium">
            <dt>Descuento caja de {tamano} (−{pct}%)</dt>
            <dd>−{precio(descuento)}</dd>
          </div>
        )}
        <div className="flex justify-between font-semibold text-brand-dark text-base pt-1">
          <dt>Total</dt>
          <dd>{precio(subtotal - descuento)}</dd>
        </div>
      </dl>
    </div>
  );
}
