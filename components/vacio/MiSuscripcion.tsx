"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/storefront/CartContext";
import { FRECUENCIAS, FRECUENCIA_LABEL, type Frecuencia } from "@/lib/suscripciones";

interface Props {
  token: string;
  suscripcion: {
    estado: "ACTIVA" | "PAUSADA" | "CANCELADA";
    cliente_nombre: string;
    modalidad: "RETIRO" | "DELIVERY";
    direccion_entrega: string | null;
    hora_entrega: string;
    frecuencia_dias: number;
    tamano_caja: number;
    proxima_entrega: string;
  };
  items: Array<{ id: string; cantidad: number; nombre: string; precio: number; foto_url: string | null; disponible: boolean }>;
  confirmado: { numero: number; fecha: string; franja: string } | null;
  total: number | null;
  avisoCaja: string | null;
  franjas: string[];
  fechaMin: string;
  descuentoSuscripcion: number;
}

function fechaLarga(iso: string) {
  const t = new Date(`${iso}T12:00:00`).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function precio(n: number) {
  return "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

const ESTADO_LABEL = { ACTIVA: "Activa", PAUSADA: "Pausada", CANCELADA: "Cancelada" } as const;
const ESTADO_CLASS = {
  ACTIVA: "bg-green-100 text-green-800",
  PAUSADA: "bg-amber-100 text-amber-800",
  CANCELADA: "bg-gray-200 text-gray-600",
} as const;

const BTN = "rounded-btn px-4 py-2 font-body text-sm font-semibold transition-colors disabled:opacity-50";

export function MiSuscripcion(props: Props) {
  const { token, suscripcion: s, items, confirmado, total, avisoCaja, franjas, fechaMin, descuentoSuscripcion } = props;
  const router = useRouter();
  const { clear, setCaja, add } = useCart();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [editEntrega, setEditEntrega] = useState(false);
  const [entrega, setEntrega] = useState({
    modalidad: s.modalidad,
    direccion_entrega: s.direccion_entrega ?? "",
    hora_entrega: franjas.includes(s.hora_entrega) ? s.hora_entrega : franjas[0],
  });
  const [fecha, setFecha] = useState(s.proxima_entrega >= fechaMin ? s.proxima_entrega : fechaMin);

  const cancelada = s.estado === "CANCELADA";

  async function accion(body: Record<string, unknown>, mensaje: string) {
    setEnviando(true);
    setError("");
    setOk("");
    try {
      const res = await fetch(`/api/suscripciones/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No pudimos guardar el cambio");
      setOk(mensaje);
      setEditEntrega(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setEnviando(false);
    }
  }

  function editarCaja() {
    // La caja de la suscripción pasa al armador; al guardar vuelve acá
    clear();
    setCaja(s.tamano_caja);
    for (const i of items.filter((x) => x.disponible)) {
      for (let n = 0; n < i.cantidad; n++) {
        add({ id: i.id, nombre: i.nombre, precio: i.precio, foto_url: i.foto_url, linea: "VACIO" });
      }
    }
    router.push(`/armar?caja=${s.tamano_caja}&suscripcion=${encodeURIComponent(token)}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-10 pb-16 font-body">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-primary">Mi suscripción</p>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-btn ${ESTADO_CLASS[s.estado]}`}>{ESTADO_LABEL[s.estado]}</span>
      </div>
      <h1 className="font-display font-bold text-brand-dark text-[32px] md:text-[44px] leading-tight mb-6">
        Hola, {s.cliente_nombre.split(" ")[0]}
      </h1>

      {(error || ok) && (
        <p
          role="status"
          className={`mb-6 text-sm rounded-input px-4 py-3 ${error ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-800 border border-green-100"}`}
        >
          {error || ok}
        </p>
      )}

      {/* ── Próximas entregas ───────────────────────────────────────────── */}
      {!cancelada && (
        <section className="bg-white rounded-card shadow-card p-6 mb-5">
          {confirmado && (
            <p className="text-sm bg-brand-frio-light text-brand-dark rounded-input px-4 py-3 mb-4">
              <strong>Entrega confirmada:</strong> {fechaLarga(confirmado.fecha)}, {confirmado.franja} (pedido #{confirmado.numero}). Los
              cambios que hagas ahora aplican a la entrega siguiente.
            </p>
          )}
          <h2 className="font-display text-xl font-bold text-brand-dark mb-1">
            {s.estado === "PAUSADA" ? "Suscripción pausada" : "Próxima entrega"}
          </h2>
          {s.estado === "ACTIVA" ? (
            <p className="text-brand-dark text-lg">{fechaLarga(s.proxima_entrega)}</p>
          ) : (
            <p className="text-brand-muted">No vas a recibir entregas hasta que la reanudes.</p>
          )}
          <p className="text-sm text-brand-muted mt-1">
            {FRECUENCIA_LABEL[s.frecuencia_dias as Frecuencia] ?? `Cada ${s.frecuencia_dias} días`} ·{" "}
            {s.modalidad === "DELIVERY" ? `Envío a ${s.direccion_entrega}` : "Retiro en el local"} · {s.hora_entrega}
          </p>

          <div className="flex flex-wrap gap-2 mt-5">
            {s.estado === "ACTIVA" ? (
              <>
                <button
                  disabled={enviando}
                  onClick={() => confirm("¿Saltear la próxima entrega?") && accion({ accion: "saltear" }, "Listo: salteamos la próxima entrega.")}
                  className={`${BTN} border border-brand-border text-brand-dark hover:border-brand-dark`}
                >
                  Saltear la próxima
                </button>
                <button
                  disabled={enviando}
                  onClick={() => accion({ accion: "pausar" }, "Suscripción pausada.")}
                  className={`${BTN} border border-brand-border text-brand-dark hover:border-brand-dark`}
                >
                  Pausar
                </button>
              </>
            ) : (
              <button
                disabled={enviando}
                onClick={() => accion({ accion: "reanudar" }, "¡Suscripción reanudada!")}
                className={`${BTN} bg-brand-primary text-white hover:bg-brand-primary-hover`}
              >
                Reanudar
              </button>
            )}
          </div>

          {s.estado === "ACTIVA" && (
            <div className="mt-5 pt-5 border-t border-brand-border flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="block text-sm font-medium text-brand-dark mb-1">Cambiar la fecha de la próxima</span>
                <input
                  type="date"
                  min={fechaMin}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="border border-brand-border rounded-input px-3 py-2 text-sm"
                />
              </label>
              <button
                disabled={enviando || fecha === s.proxima_entrega}
                onClick={() => accion({ accion: "reprogramar", fecha }, "Fecha actualizada.")}
                className={`${BTN} bg-brand-dark text-white`}
              >
                Guardar fecha
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── La caja ─────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-card shadow-card p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-brand-dark">Tu caja de {s.tamano_caja}</h2>
          {!cancelada && (
            <button onClick={editarCaja} className="text-sm font-semibold text-brand-primary hover:text-brand-primary-hover">
              Cambiar la caja
            </button>
          )}
        </div>
        {avisoCaja && (
          <p className="text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-input px-4 py-3 mb-4">
            {avisoCaja} Cambiá la caja para que la próxima entrega salga completa.
          </p>
        )}
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between text-sm">
              <span className={i.disponible ? "text-brand-dark" : "text-brand-muted line-through"}>
                {i.cantidad}× {i.nombre}
              </span>
              {!i.disponible && <span className="text-xs text-amber-700">No disponible</span>}
            </li>
          ))}
        </ul>
        {total !== null && (
          <p className="mt-4 pt-4 border-t border-brand-border flex justify-between font-semibold text-brand-dark">
            <span>Total por entrega (con −{descuentoSuscripcion}% de suscripción)</span>
            <span>{precio(total)}</span>
          </p>
        )}
      </section>

      {/* ── Frecuencia y entrega ────────────────────────────────────────── */}
      {!cancelada && (
        <section className="bg-white rounded-card shadow-card p-6 mb-5 space-y-5">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-dark mb-3">Frecuencia</h2>
            <div className="grid grid-cols-3 gap-2">
              {FRECUENCIAS.map((f) => (
                <button
                  key={f}
                  disabled={enviando}
                  aria-pressed={s.frecuencia_dias === f}
                  onClick={() => s.frecuencia_dias !== f && accion({ accion: "frecuencia", frecuencia_dias: f }, "Frecuencia actualizada.")}
                  className={`rounded-input border px-3 py-2.5 text-sm font-medium ${
                    s.frecuencia_dias === f ? "bg-brand-primary border-brand-primary text-white" : "border-brand-border text-brand-dark hover:border-brand-primary"
                  }`}
                >
                  {FRECUENCIA_LABEL[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-5 border-t border-brand-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl font-bold text-brand-dark">Entrega</h2>
              {!editEntrega && (
                <button onClick={() => setEditEntrega(true)} className="text-sm font-semibold text-brand-primary">
                  Cambiar
                </button>
              )}
            </div>
            {editEntrega ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {(["RETIRO", "DELIVERY"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEntrega((p) => ({ ...p, modalidad: m }))}
                      className={`flex-1 rounded-input border py-2 text-sm font-medium ${
                        entrega.modalidad === m ? "bg-brand-primary border-brand-primary text-white" : "border-brand-border text-brand-dark"
                      }`}
                    >
                      {m === "RETIRO" ? "Retiro en el local" : "Envío a domicilio"}
                    </button>
                  ))}
                </div>
                {entrega.modalidad === "DELIVERY" && (
                  <input
                    value={entrega.direccion_entrega}
                    onChange={(e) => setEntrega((p) => ({ ...p, direccion_entrega: e.target.value }))}
                    placeholder="Calle 123, Piso 2, Depto B"
                    maxLength={300}
                    className="w-full border border-brand-border rounded-input px-3 py-2 text-sm"
                  />
                )}
                <select
                  value={entrega.hora_entrega}
                  onChange={(e) => setEntrega((p) => ({ ...p, hora_entrega: e.target.value }))}
                  className="w-full border border-brand-border rounded-input px-3 py-2 text-sm bg-white"
                >
                  {franjas.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    disabled={enviando}
                    onClick={() => accion({ accion: "entrega", ...entrega }, "Datos de entrega actualizados.")}
                    className={`${BTN} bg-brand-dark text-white`}
                  >
                    Guardar
                  </button>
                  <button onClick={() => setEditEntrega(false)} className={`${BTN} text-brand-muted`}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-brand-dark">
                {s.modalidad === "DELIVERY" ? `Envío a ${s.direccion_entrega}` : "Retiro en el local"} · {s.hora_entrega}
              </p>
            )}
          </div>
        </section>
      )}

      {cancelada ? (
        <p className="text-center text-brand-muted">
          Esta suscripción está cancelada. Si querés volver,{" "}
          <Link href="/armar" className="font-semibold text-brand-primary">
            armá una caja nueva
          </Link>
          .
        </p>
      ) : (
        <p className="text-center">
          <button
            disabled={enviando}
            onClick={() =>
              confirm("¿Cancelar la suscripción? No vas a recibir más entregas.") &&
              accion({ accion: "cancelar" }, "Suscripción cancelada.")
            }
            className="text-sm text-red-600 hover:text-red-700 underline"
          >
            Cancelar suscripción
          </button>
        </p>
      )}
    </div>
  );
}
