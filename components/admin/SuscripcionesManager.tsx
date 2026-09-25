"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { buildWaLink } from "@/lib/whatsapp";
import { FRECUENCIA_LABEL, sumarDias, type Frecuencia } from "@/lib/suscripciones";

type Estado = "ACTIVA" | "PAUSADA" | "CANCELADA";

interface Suscripcion {
  id: string;
  estado: Estado;
  cliente_nombre: string;
  cliente_telefono: string;
  modalidad: "RETIRO" | "DELIVERY";
  direccion_entrega: string | null;
  hora_entrega: string;
  frecuencia_dias: number;
  tamano_caja: number;
  proxima_entrega: string;
  _count: { pedidos: number };
  pedidos: Array<{ numero_pedido: number; fecha_entrega: string; total: string }>;
}

interface Resultado {
  creados: Array<{ cliente: string; numero_pedido: number; fecha: string }>;
  errores: Array<{ cliente: string; fecha: string; error: string }>;
}

const ESTADO_CLASS: Record<Estado, string> = {
  ACTIVA: "bg-green-100 text-green-800",
  PAUSADA: "bg-amber-100 text-amber-800",
  CANCELADA: "bg-gray-100 text-gray-500",
};

function fechaCorta(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${Number(d)}/${Number(m)}${y !== String(new Date().getFullYear()) ? `/${y}` : ""}`;
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export function SuscripcionesManager() {
  const [lista, setLista] = useState<Suscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Estado | "TODAS">("ACTIVA");
  const [hasta, setHasta] = useState(() => sumarDias(hoyISO(), 7));
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [link, setLink] = useState<{ id: string; url: string } | null>(null);

  async function load() {
    const res = await fetch("/api/admin/suscripciones");
    if (res.ok) setLista(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const aGenerar = lista.filter((s) => s.estado === "ACTIVA" && s.proxima_entrega.slice(0, 10) <= hasta).length;

  async function generar() {
    if (!confirm(`¿Generar los pedidos de las entregas hasta el ${fechaCorta(hasta)}?`)) return;
    setGenerando(true);
    const res = await fetch("/api/admin/suscripciones/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hasta }),
    });
    const data = await res.json();
    setGenerando(false);
    if (!res.ok) return toast.error(data.error ?? "No se pudieron generar los pedidos");
    setResultado(data);
    toast.success(`${data.creados.length} pedido${data.creados.length === 1 ? "" : "s"} generado${data.creados.length === 1 ? "" : "s"}`);
    load();
  }

  async function cambiarEstado(s: Suscripcion, estado: Estado) {
    if (estado === "CANCELADA" && !confirm(`¿Cancelar la suscripción de ${s.cliente_nombre}?`)) return;
    const res = await fetch(`/api/admin/suscripciones/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    if (!res.ok) return toast.error("No se pudo actualizar");
    load();
  }

  async function nuevoLink(s: Suscripcion) {
    if (!confirm("Se genera un link nuevo y el anterior deja de funcionar. ¿Continuar?")) return;
    const res = await fetch(`/api/admin/suscripciones/${s.id}/link`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "No se pudo generar el link");
    setLink({ id: s.id, url: window.location.origin + data.url });
  }

  const visibles = lista.filter((s) => filtro === "TODAS" || s.estado === filtro);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Suscripciones</h1>
        <div className="flex flex-wrap gap-2">
          {(["ACTIVA", "PAUSADA", "CANCELADA", "TODAS"] as const).map((e) => (
            <button
              key={e}
              onClick={() => setFiltro(e)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-btn border ${
                filtro === e ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              {e === "TODAS" ? "Todas" : e.charAt(0) + e.slice(1).toLowerCase() + "s"} (
              {e === "TODAS" ? lista.length : lista.filter((s) => s.estado === e).length})
            </button>
          ))}
        </div>
      </div>

      {/* ── Generar pedidos ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-gray-600 mb-1">Generar pedidos con entrega hasta</span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
        </label>
        <button
          onClick={generar}
          disabled={generando || aGenerar === 0}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl"
        >
          {generando ? "Generando…" : `Generar pedidos (${aGenerar})`}
        </button>
        <p className="text-xs text-gray-500 basis-full">
          Crea un pedido por cada entrega de suscripciones activas hasta esa fecha y adelanta la próxima entrega. Los pedidos aparecen en
          el kanban. Si una caja tiene productos no disponibles, se informa y no se genera.
        </p>
      </div>

      {resultado && (
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 text-sm">
          <div className="flex justify-between mb-2">
            <p className="font-semibold text-gray-800">Resultado</p>
            <button onClick={() => setResultado(null)} className="text-xs text-gray-400">
              Cerrar
            </button>
          </div>
          {resultado.creados.length === 0 && resultado.errores.length === 0 && <p className="text-gray-500">No había entregas para generar.</p>}
          <ul className="space-y-1">
            {resultado.creados.map((c) => (
              <li key={c.numero_pedido} className="text-green-700">
                ✓ #{c.numero_pedido} · {c.cliente} · {fechaCorta(c.fecha)}
              </li>
            ))}
            {resultado.errores.map((e, i) => (
              <li key={i} className="text-red-600">
                ✕ {e.cliente} · {fechaCorta(e.fecha)}: {e.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {link && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 mb-6 text-sm">
          <p className="font-semibold text-sky-900 mb-1">Link nuevo (el anterior ya no funciona)</p>
          <p className="font-mono text-xs break-all text-sky-900 mb-3">{link.url}</p>
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(link.url).then(() => toast.success("Link copiado"))}
              className="text-xs font-semibold border border-sky-300 rounded-lg px-3 py-1.5"
            >
              Copiar
            </button>
            {(() => {
              const s = lista.find((x) => x.id === link.id);
              return s ? (
                <a
                  href={buildWaLink(s.cliente_telefono, `Hola ${s.cliente_nombre}! Este es el link para gestionar tu suscripción de Tuco: ${link.url}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold bg-[#25D366] text-white rounded-lg px-3 py-1.5"
                >
                  Enviar por WhatsApp
                </a>
              ) : null;
            })()}
            <button onClick={() => setLink(null)} className="text-xs text-gray-500 px-2">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : visibles.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl">No hay suscripciones en este estado.</div>
      ) : (
        <div className="space-y-2">
          {visibles.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[220px]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{s.cliente_nombre}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ESTADO_CLASS[s.estado]}`}>{s.estado.toLowerCase()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Caja de {s.tamano_caja} · {FRECUENCIA_LABEL[s.frecuencia_dias as Frecuencia] ?? `cada ${s.frecuencia_dias} días`} ·{" "}
                  {s.modalidad === "DELIVERY" ? "Envío" : "Retiro"} · {s.hora_entrega}
                </p>
                <p className="text-xs text-gray-500">
                  {s.estado === "ACTIVA" && (
                    <>
                      Próxima: <strong className="text-gray-800">{fechaCorta(s.proxima_entrega)}</strong> ·{" "}
                    </>
                  )}
                  {s._count.pedidos} pedido{s._count.pedidos === 1 ? "" : "s"}
                  {s.pedidos[0] && ` · último #${s.pedidos[0].numero_pedido} (${fechaCorta(s.pedidos[0].fecha_entrega)})`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => nuevoLink(s)} className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                  Link para el cliente
                </button>
                {s.estado === "ACTIVA" && (
                  <button onClick={() => cambiarEstado(s, "PAUSADA")} className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                    Pausar
                  </button>
                )}
                {s.estado === "PAUSADA" && (
                  <button onClick={() => cambiarEstado(s, "ACTIVA")} className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                    Reanudar
                  </button>
                )}
                {s.estado !== "CANCELADA" && (
                  <button onClick={() => cambiarEstado(s, "CANCELADA")} className="text-xs font-semibold text-red-500 px-2 py-1.5">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
