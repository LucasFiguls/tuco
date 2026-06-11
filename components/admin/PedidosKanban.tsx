"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/Badge";
import { useAdminNotifications } from "./AdminNotificationsProvider";
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
  visto: boolean;
  created_at: string;
  updated_at: string;
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

const COLUMN_HEADER: Record<EstadoPedido, string> = {
  PENDIENTE: "bg-amber-50 border-amber-200 text-amber-800",
  CONFIRMADO: "bg-blue-50 border-blue-200 text-blue-800",
  ENTREGADO: "bg-green-50 border-green-200 text-green-800",
  CANCELADO: "bg-red-50 border-red-200 text-red-800",
};

const CHIP_ACTIVE: Record<EstadoPedido, string> = {
  PENDIENTE: "bg-amber-100 border-amber-300 text-amber-800",
  CONFIRMADO: "bg-blue-100 border-blue-300 text-blue-800",
  ENTREGADO: "bg-green-100 border-green-300 text-green-800",
  CANCELADO: "bg-red-100 border-red-300 text-red-800",
};

const COLUMN_OVER: Record<EstadoPedido, string> = {
  PENDIENTE: "ring-2 ring-amber-400 bg-amber-50/60",
  CONFIRMADO: "ring-2 ring-blue-400 bg-blue-50/60",
  ENTREGADO: "ring-2 ring-green-400 bg-green-50/60",
  CANCELADO: "ring-2 ring-red-400 bg-red-50/60",
};

// Preview flotante que sigue el cursor durante el drag
function CardPreview({ pedido }: { pedido: Pedido }) {
  return (
    <div className="bg-white rounded-card shadow-card-hover p-3 w-[220px] rotate-1 opacity-95">
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-sm text-gray-900">#{pedido.numero_pedido}</span>
        <span className="text-xs text-gray-400">{pedido.hora_entrega}</span>
      </div>
      <p className="text-sm font-medium text-gray-700 truncate">{pedido.cliente_nombre}</p>
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="font-semibold text-gray-800">
          ${Number(pedido.total).toLocaleString("es-AR")}
        </span>
        <span className="text-gray-500">
          {pedido.modalidad === "DELIVERY" ? "🛵 Delivery" : "🏠 Retiro"}
        </span>
      </div>
    </div>
  );
}

function PedidoCard({
  pedido,
  isExpanded,
  onExpand,
}: {
  pedido: Pedido;
  isExpanded: boolean;
  onExpand: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: pedido.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-card bg-white transition-all select-none ${
        !pedido.visto ? "ring-1 ring-brand-primary" : ""
      } ${isDragging ? "opacity-30 shadow-none" : "shadow-card"}`}
    >
      {/* Zona draggable: cabecera de la tarjeta */}
      <div
        className="p-3 cursor-grab active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-gray-900">#{pedido.numero_pedido}</span>
            {!pedido.visto && (
              <span className="text-[9px] font-bold bg-brand-primary text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                Nuevo
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {pedido.modalidad === "DELIVERY" ? "🛵" : "🏠"}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-700 truncate">{pedido.cliente_nombre}</p>
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="font-semibold text-gray-800">
            ${Number(pedido.total).toLocaleString("es-AR")}
          </span>
          <span className="text-gray-400">
            {`${parseInt(pedido.fecha_entrega.slice(8, 10))}/${parseInt(pedido.fecha_entrega.slice(5, 7))}`}
            {" · "}
            {pedido.hora_entrega}
          </span>
        </div>
      </div>

      {/* Toggle de detalle — fuera de la zona drag para no interferir */}
      <button
        className="w-full text-left px-3 pb-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        onClick={() => onExpand(pedido.id)}
      >
        {isExpanded ? "▲ Ocultar" : "▼ Detalle"}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2 space-y-1">
          {pedido.items.map((item, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-gray-600">
                {item.cantidad}× {item.menu_item.nombre}
              </span>
              <span className="font-medium">
                ${Number(item.subtotal).toLocaleString("es-AR")}
              </span>
            </div>
          ))}
          {pedido.direccion_entrega && (
            <p className="text-xs text-gray-500 pt-1">📍 {pedido.direccion_entrega}</p>
          )}
          {pedido.comentarios && (
            <p className="text-xs text-gray-500">💬 {pedido.comentarios}</p>
          )}
          <p className="text-xs text-gray-400">📞 {pedido.cliente_telefono}</p>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  estado,
  pedidos,
  expanded,
  onExpand,
}: {
  estado: EstadoPedido;
  pedidos: Pedido[];
  expanded: string | null;
  onExpand: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });

  return (
    <div className="flex flex-col min-w-[220px] flex-1">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-t-card border ${COLUMN_HEADER[estado]} mb-1`}
      >
        <span className="text-xs font-bold uppercase tracking-widest">
          {ESTADO_LABEL[estado]}
        </span>
        <span className="ml-auto text-xs font-bold bg-white/70 rounded-full w-5 h-5 flex items-center justify-center">
          {pedidos.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[300px] rounded-b-card p-2 space-y-2 transition-all bg-brand-light ${
          isOver ? COLUMN_OVER[estado] : ""
        }`}
      >
        {pedidos.length === 0 && (
          <div className="flex items-center justify-center h-16 text-xs text-gray-400 border-2 border-dashed border-brand-border rounded-xl">
            Sin pedidos
          </div>
        )}
        {pedidos.map((p) => (
          <PedidoCard
            key={p.id}
            pedido={p}
            isExpanded={expanded === p.id}
            onExpand={onExpand}
          />
        ))}
      </div>
    </div>
  );
}

export function PedidosKanban() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [estadosFiltro, setEstadosFiltro] = useState<EstadoPedido[]>([...ESTADOS]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activePedido, setActivePedido] = useState<Pedido | null>(null);
  const initialLoadDone = useRef(false);
  const { reloadTrigger } = useAdminNotifications();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  async function load({ silent = false }: { silent?: boolean } = {}) {
    if (!silent) setLoading(true);

    // 4 fetches paralelos para traer hasta 20 pedidos por columna sin tocar el backend
    const results = await Promise.all(
      ESTADOS.map((e) =>
        fetch(`/api/admin/pedidos?estado=${e}&page=1`).then((r) => r.json())
      )
    );
    setPedidos(results.flatMap((r) => (r.pedidos ?? []) as Pedido[]));
    if (!silent) setLoading(false);

    // PATCH después del render: los pedidos no vistos muestran badge NUEVO primero,
    // luego se marcan como vistos en la DB para la próxima recarga.
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetch("/api/admin/pedidos/marcar-vistos", { method: "PATCH" }).catch(() => {});
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (reloadTrigger > 0) load({ silent: true }); }, [reloadTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  async function cambiarEstado(id: string, estado: EstadoPedido) {
    // Optimistic update — la tarjeta salta de columna de inmediato
    setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)));
    await fetch(`/api/admin/pedidos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    load({ silent: true });
  }

  function handleDragStart({ active }: DragStartEvent) {
    const pedido = pedidos.find((p) => p.id === active.id);
    if (pedido) setActivePedido(pedido);
    setExpanded(null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActivePedido(null);
    if (!over) return;
    const pedido = pedidos.find((p) => p.id === active.id);
    if (!pedido || over.id === pedido.estado) return;
    cambiarEstado(active.id as string, over.id as EstadoPedido);
  }

  function handleExpand(id: string) {
    const isOpening = expanded !== id;
    setExpanded(isOpening ? id : null);
    if (isOpening) {
      const pedido = pedidos.find((p) => p.id === id);
      if (pedido && !pedido.visto) {
        setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, visto: true } : p)));
        fetch(`/api/admin/pedidos/${id}/visto`, { method: "PATCH" }).catch(() => {});
      }
    }
  }

  function toggleFiltro(estado: EstadoPedido) {
    setEstadosFiltro((prev) => {
      if (prev.includes(estado)) {
        return prev.length === 1 ? prev : prev.filter((e) => e !== estado);
      }
      return [...prev, estado];
    });
  }

  // PENDIENTE y CONFIRMADO: ASC por updated_at (el más viejo sin atención, arriba)
  // ENTREGADO y CANCELADO: DESC por updated_at (el más recientemente cerrado, arriba)
  function sortForColumn(list: Pedido[], estado: EstadoPedido): Pedido[] {
    const asc = estado === "PENDIENTE" || estado === "CONFIRMADO";
    return [...list].sort((a, b) => {
      const diff = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      return asc ? diff : -diff;
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Pedidos ({pedidos.length})</h1>
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map((e) => {
            const active = estadosFiltro.includes(e);
            return (
              <button
                key={e}
                onClick={() => toggleFiltro(e)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-btn border transition-all ${
                  active
                    ? CHIP_ACTIVE[e]
                    : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                {ESTADO_LABEL[e]}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4">
            {ESTADOS.filter((e) => estadosFiltro.includes(e)).map((estado) => (
              <KanbanColumn
                key={estado}
                estado={estado}
                pedidos={sortForColumn(pedidos.filter((p) => p.estado === estado), estado)}
                expanded={expanded}
                onExpand={handleExpand}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={null}>
            {activePedido ? <CardPreview pedido={activePedido} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
