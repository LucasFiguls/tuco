"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Lead } from "./LeadsKanban";

type EstadoVoucher = "DISPONIBLE" | "CANJEADO" | "ANULADO";

interface ConvenioResumen {
  id: string;
  empresa: string;
  cuit: string | null;
  contacto_nombre: string;
  email: string;
  telefono: string;
  vouchers_por_mes: number;
  precio_por_vianda: string | null;
  activo: boolean;
  lote_actual: string | null;
  uso: Record<EstadoVoucher, number>;
}

interface ConvenioDetalle extends Omit<ConvenioResumen, "lote_actual" | "uso"> {
  lotes: Array<{
    id: string;
    periodo: string;
    cantidad: number;
    vence_at: string;
    vouchers: Array<{
      id: string;
      codigo: string;
      estado: EstadoVoucher;
      canjeado_at: string | null;
      pedido: { numero_pedido: number; cliente_nombre: string } | null;
    }>;
  }>;
}

const INPUT =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300";

const PAQUETE_VOUCHERS: Record<Lead["paquete_interes"], number> = { P50: 50, P75: 75, P100: 100, A_MEDIDA: 100 };

function periodoLabel(p: string) {
  const [y, m] = p.split("-").map(Number);
  const label = new Date(y, m - 1, 1).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function siguientePeriodo(p: string) {
  const [y, m] = p.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

/** `prefill` (lead ganado) solo se lee al montar: el padre remonta al cambiar de tab. */
export function ConveniosManager({
  prefill,
  onCreado,
}: {
  prefill: Lead | null;
  onCreado: () => void;
}) {
  const [periodo, setPeriodo] = useState("");
  const [convenios, setConvenios] = useState<ConvenioResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, string> | null>(() =>
    prefill
      ? {
          lead_id: prefill.id,
          empresa: prefill.empresa,
          contacto_nombre: prefill.contacto_nombre,
          email: prefill.email,
          telefono: prefill.telefono,
          cuit: "",
          vouchers_por_mes: String(PAQUETE_VOUCHERS[prefill.paquete_interes]),
          precio_por_vianda: "",
        }
      : null
  );
  const [detalleId, setDetalleId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/convenios");
    if (res.ok) {
      const data = await res.json();
      setPeriodo(data.periodo);
      setConvenios(data.convenios);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/convenios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "No se pudo crear el convenio");
    toast.success("Convenio creado");
    setForm(null);
    onCreado();
    await load();
    setDetalleId(data.id);
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando...</div>;

  if (detalleId) {
    return (
      <ConvenioDetalleView
        id={detalleId}
        periodoActual={periodo}
        onVolver={() => {
          setDetalleId(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Uso de <strong className="text-gray-800">{periodoLabel(periodo)}</strong>
        </p>
        {!form && (
          <button
            onClick={() =>
              setForm({ empresa: "", contacto_nombre: "", email: "", telefono: "", cuit: "", vouchers_por_mes: "50", precio_por_vianda: "" })
            }
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl"
          >
            + Nuevo convenio
          </button>
        )}
      </div>

      {form && (
        <form onSubmit={crear} className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <h3 className="sm:col-span-2 font-semibold text-gray-800">
            Nuevo convenio {form.lead_id && <span className="text-xs text-green-700 font-normal">(desde lead ganado)</span>}
          </h3>
          {(
            [
              ["empresa", "Empresa", "text"],
              ["cuit", "CUIT (opcional)", "text"],
              ["contacto_nombre", "Contacto", "text"],
              ["email", "Email", "email"],
              ["telefono", "Teléfono", "tel"],
              ["vouchers_por_mes", "Vouchers por mes", "number"],
              ["precio_por_vianda", "Precio acordado por vianda (interno)", "number"],
            ] as const
          ).map(([k, label, type]) => (
            <label key={k} className="block">
              <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
              <input
                className={INPUT}
                type={type}
                value={form[k] ?? ""}
                onChange={(e) => setForm((f) => ({ ...f!, [k]: e.target.value }))}
                required={!["cuit", "precio_por_vianda"].includes(k)}
                min={type === "number" ? 1 : undefined}
              />
            </label>
          ))}
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={() => setForm(null)} className="text-sm text-gray-500 px-4 py-2">
              Cancelar
            </button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
              Crear convenio
            </button>
          </div>
        </form>
      )}

      {convenios.length === 0 && !form ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl">
          Todavía no hay convenios. Creá uno o ganá un lead en el embudo.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {convenios.map((c) => (
              <button
                key={c.id}
                onClick={() => setDetalleId(c.id)}
                className={`text-left bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow ${!c.activo ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900">{c.empresa}</span>
                  <span className="text-xs text-gray-500">{c.vouchers_por_mes}/mes</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  {c.contacto_nombre} {!c.activo && "· Inactivo"}
                </p>
                {c.lote_actual ? (
                  // El lote del mes en curso todavía no venció
                  <UsoBar canjeados={c.uso.CANJEADO} disponibles={c.uso.DISPONIBLE} anulados={c.uso.ANULADO} vencidos={0} />
                ) : (
                  <p className="text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5">
                    Sin vouchers emitidos este mes
                  </p>
                )}
              </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UsoBar({
  canjeados,
  disponibles,
  anulados,
  vencidos,
}: {
  canjeados: number;
  disponibles: number;
  anulados: number;
  vencidos: number;
}) {
  const total = canjeados + disponibles + anulados + vencidos || 1;
  return (
    <div>
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
        <div className="bg-green-500" style={{ width: `${(canjeados / total) * 100}%` }} />
        <div className="bg-gray-300" style={{ width: `${(vencidos / total) * 100}%` }} />
        <div className="bg-red-300" style={{ width: `${(anulados / total) * 100}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-gray-600">
        <strong className="text-green-700">{canjeados}</strong> canjeados · {disponibles} disponibles
        {vencidos > 0 && ` · ${vencidos} vencidos`}
        {anulados > 0 && ` · ${anulados} anulados`}
      </p>
    </div>
  );
}

function ConvenioDetalleView({
  id,
  periodoActual,
  onVolver,
}: {
  id: string;
  periodoActual: string;
  onVolver: () => void;
}) {
  const [c, setC] = useState<ConvenioDetalle | null>(null);
  const [loteAbierto, setLoteAbierto] = useState<string | null>(null);
  const [emitiendo, setEmitiendo] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/convenios/${id}`);
    if (res.ok) {
      const data: ConvenioDetalle = await res.json();
      setC(data);
      setLoteAbierto((cur) => cur ?? data.lotes[0]?.id ?? null);
    }
  }

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!c) return <div className="text-center py-12 text-gray-400">Cargando...</div>;

  const periodos = new Set(c.lotes.map((l) => l.periodo));
  const aEmitir = !periodos.has(periodoActual) ? periodoActual : siguientePeriodo(periodoActual);
  const puedeEmitir = c.activo && !periodos.has(aEmitir);

  async function emitir() {
    if (!confirm(`¿Emitir ${c!.vouchers_por_mes} vouchers para ${periodoLabel(aEmitir)}?`)) return;
    setEmitiendo(true);
    const res = await fetch(`/api/admin/convenios/${id}/lotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ periodo: aEmitir }),
    });
    const data = await res.json();
    setEmitiendo(false);
    if (!res.ok) return toast.error(data.error ?? "No se pudo emitir");
    toast.success(`Vouchers de ${periodoLabel(aEmitir)} emitidos`);
    setLoteAbierto(data.id);
    load();
  }

  async function toggleActivo() {
    await fetch(`/api/admin/convenios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !c!.activo }),
    });
    load();
  }

  async function anular(voucherId: string, codigo: string) {
    if (!confirm(`¿Anular el voucher ${codigo}? No se podrá usar.`)) return;
    const res = await fetch(`/api/admin/vouchers/${voucherId}/anular`, { method: "PATCH" });
    if (!res.ok) toast.error((await res.json()).error ?? "No se pudo anular");
    load();
  }

  return (
    <div className="space-y-4">
      <button onClick={onVolver} className="text-sm text-gray-500 hover:text-gray-700">
        ← Convenios
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {c.empresa} {!c.activo && <span className="text-xs font-semibold text-gray-500">(inactivo)</span>}
          </h2>
          <p className="text-sm text-gray-600">
            {c.contacto_nombre} · {c.email} · {c.telefono}
          </p>
          <p className="text-sm text-gray-600">
            {c.vouchers_por_mes} vouchers/mes
            {c.precio_por_vianda && ` · $${Number(c.precio_por_vianda).toLocaleString("es-AR")}/vianda`}
            {c.cuit && ` · CUIT ${c.cuit}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleActivo} className="text-sm border border-gray-200 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50">
            {c.activo ? "Desactivar" : "Reactivar"}
          </button>
          {puedeEmitir && (
            <button
              onClick={emitir}
              disabled={emitiendo}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl"
            >
              {emitiendo ? "Emitiendo…" : `Emitir vouchers de ${periodoLabel(aEmitir)}`}
            </button>
          )}
        </div>
      </div>

      {c.lotes.length === 0 && (
        <div className="text-center py-10 text-gray-400 bg-white rounded-2xl">Todavía no se emitieron vouchers.</div>
      )}

      {c.lotes.map((lote) => {
        // Los lotes vencen a fin de mes: un período anterior al actual ya venció
        const vencido = lote.periodo < periodoActual;
        const cuenta = { DISPONIBLE: 0, CANJEADO: 0, ANULADO: 0 };
        lote.vouchers.forEach((v) => cuenta[v.estado]++);
        const abierto = loteAbierto === lote.id;
        return (
          <div key={lote.id} className="bg-white rounded-2xl shadow-sm">
            <div className="p-4 flex flex-wrap items-center justify-between gap-3">
              <button onClick={() => setLoteAbierto(abierto ? null : lote.id)} className="text-left flex-1 min-w-[200px]">
                <p className="font-semibold text-gray-800">
                  {abierto ? "▼" : "▶"} {periodoLabel(lote.periodo)} {vencido && <span className="text-xs text-gray-400">(vencido)</span>}
                </p>
                <div className="mt-2 max-w-sm">
                  <UsoBar
                    canjeados={cuenta.CANJEADO}
                    disponibles={vencido ? 0 : cuenta.DISPONIBLE}
                    vencidos={vencido ? cuenta.DISPONIBLE : 0}
                    anulados={cuenta.ANULADO}
                  />
                </div>
              </button>
              <a
                href={`/api/admin/convenios/${c.id}/lotes/${lote.id}/csv`}
                className="text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                ⬇ Descargar CSV
              </a>
            </div>
            {abierto && (
              <div className="border-t border-gray-100 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-gray-500 text-left">
                    <tr>
                      <th className="px-4 py-2 font-medium">Código</th>
                      <th className="px-4 py-2 font-medium">Estado</th>
                      <th className="px-4 py-2 font-medium">Canje</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {lote.vouchers.map((v) => (
                      <tr key={v.id} className="border-t border-gray-50">
                        <td className="px-4 py-1.5 font-mono">{v.codigo}</td>
                        <td className="px-4 py-1.5">
                          {v.estado === "DISPONIBLE" && vencido ? (
                            <span className="text-gray-400">Vencido</span>
                          ) : v.estado === "CANJEADO" ? (
                            <span className="text-green-700 font-semibold">Canjeado</span>
                          ) : v.estado === "ANULADO" ? (
                            <span className="text-red-600">Anulado</span>
                          ) : (
                            <span className="text-gray-700">Disponible</span>
                          )}
                        </td>
                        <td className="px-4 py-1.5 text-gray-500">
                          {v.pedido && `#${v.pedido.numero_pedido} · ${v.pedido.cliente_nombre}`}
                          {v.canjeado_at && ` · ${new Date(v.canjeado_at).toLocaleDateString("es-AR")}`}
                        </td>
                        <td className="px-4 py-1.5 text-right">
                          {v.estado === "DISPONIBLE" && !vencido && (
                            <button onClick={() => anular(v.id, v.codigo)} className="text-red-500 hover:text-red-700">
                              Anular
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
