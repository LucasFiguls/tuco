"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import type { EstadoPedido } from "@/lib/types";

interface MenuItem {
  nombre: string;
  precio: string;
}

interface PedidoItem {
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
  menu_item: MenuItem;
}

interface Pedido {
  id: string;
  numero_pedido: number;
  cliente_nombre: string;
  cliente_telefono: string;
  modalidad: "RETIRO" | "DELIVERY";
  direccion_entrega: string | null;
  fecha_entrega: string;
  hora_entrega: string;
  comentarios: string | null;
  estado: EstadoPedido;
  total: string;
  created_at: string;
  items: PedidoItem[];
}

const ESTADOS: EstadoPedido[] = ["PENDIENTE", "CONFIRMADO", "ENTREGADO", "CANCELADO"];

const ESTADO_BADGE: Record<EstadoPedido, "warning" | "info" | "success" | "error"> = {
  PENDIENTE: "warning",
  CONFIRMADO: "info",
  ENTREGADO: "success",
  CANCELADO: "error",
};

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export function PedidosList() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (estadoFiltro) params.set("estado", estadoFiltro);
    const res = await fetch(`/api/admin/pedidos?${params}`);
    const data = await res.json();
    setPedidos(data.pedidos ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, [page, estadoFiltro]);

  async function cambiarEstado(id: string, estado: EstadoPedido) {
    await fetch(`/api/admin/pedidos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Pedidos ({total})</h1>
        <select
          value={estadoFiltro}
          onChange={(e) => { setEstadoFiltro(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="">Todos</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Sin pedidos</div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                className="w-full text-left p-4"
                onClick={() => setExpanded(expanded === pedido.id ? null : pedido.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">#{pedido.numero_pedido}</span>
                    <span className="font-medium text-gray-700">{pedido.cliente_nombre}</span>
                    <Badge variant={ESTADO_BADGE[pedido.estado]}>{ESTADO_LABEL[pedido.estado]}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>${Number(pedido.total).toLocaleString("es-AR")}</span>
                    <span>{pedido.hora_entrega}</span>
                    <span>{expanded === pedido.id ? "▲" : "▼"}</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  <span>{pedido.modalidad === "DELIVERY" ? "🛵 Delivery" : "🏠 Retiro"}</span>
                  <span>{new Date(pedido.fecha_entrega).toLocaleDateString("es-AR")}</span>
                  <span>{pedido.cliente_telefono}</span>
                </div>
              </button>

              {expanded === pedido.id && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                  <div className="space-y-1.5 mb-4">
                    {pedido.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.cantidad}× {item.menu_item.nombre}</span>
                        <span className="font-medium">${Number(item.subtotal).toLocaleString("es-AR")}</span>
                      </div>
                    ))}
                  </div>

                  {pedido.direccion_entrega && (
                    <p className="text-sm text-gray-500 mb-2">📍 {pedido.direccion_entrega}</p>
                  )}
                  {pedido.comentarios && (
                    <p className="text-sm text-gray-500 mb-3">💬 {pedido.comentarios}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {ESTADOS.filter((e) => e !== pedido.estado).map((e) => (
                      <button
                        key={e}
                        onClick={() => cambiarEstado(pedido.id, e)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        → {ESTADO_LABEL[e]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">Pág. {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 20 >= total}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
