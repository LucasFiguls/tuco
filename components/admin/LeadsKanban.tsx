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
import { toast } from "sonner";
import { buildWaLink } from "@/lib/whatsapp";
import { PAQUETE_LABEL, type PaqueteId } from "@/lib/empresas-content";
import { useAdminNotifications } from "./AdminNotificationsProvider";

export type EstadoLead = "NUEVO" | "CONTACTADO" | "PROPUESTA" | "GANADO" | "PERDIDO";

export interface Lead {
  id: string;
  empresa: string;
  contacto_nombre: string;
  cargo: string | null;
  email: string;
  telefono: string;
  cantidad_empleados: number | null;
  paquete_interes: PaqueteId;
  zona: string;
  comentarios: string | null;
  estado: EstadoLead;
  notas_internas: string | null;
  visto: boolean;
  created_at: string;
  convenio: { id: string } | null;
}

const ESTADOS: EstadoLead[] = ["NUEVO", "CONTACTADO", "PROPUESTA", "GANADO", "PERDIDO"];

const ESTADO_LABEL: Record<EstadoLead, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  PROPUESTA: "Propuesta",
  GANADO: "Ganado",
  PERDIDO: "Perdido",
};

const COLUMN_HEADER: Record<EstadoLead, string> = {
  NUEVO: "bg-amber-50 border-amber-200 text-amber-800",
  CONTACTADO: "bg-blue-50 border-blue-200 text-blue-800",
  PROPUESTA: "bg-violet-50 border-violet-200 text-violet-800",
  GANADO: "bg-green-50 border-green-200 text-green-800",
  PERDIDO: "bg-gray-100 border-gray-200 text-gray-600",
};

const COLUMN_OVER: Record<EstadoLead, string> = {
  NUEVO: "ring-2 ring-amber-400 bg-amber-50/60",
  CONTACTADO: "ring-2 ring-blue-400 bg-blue-50/60",
  PROPUESTA: "ring-2 ring-violet-400 bg-violet-50/60",
  GANADO: "ring-2 ring-green-400 bg-green-50/60",
  PERDIDO: "ring-2 ring-gray-400 bg-gray-50/60",
};

function fecha(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function CardPreview({ lead }: { lead: Lead }) {
  return (
    <div className="bg-white rounded-card shadow-card-hover p-3 w-[220px] rotate-1 opacity-95">
      <p className="font-bold text-sm text-gray-900 truncate">{lead.empresa}</p>
      <p className="text-xs text-gray-500 truncate">{lead.contacto_nombre}</p>
    </div>
  );
}

function LeadCard({
  lead,
  isExpanded,
  onExpand,
  onNotas,
  onCrearConvenio,
}: {
  lead: Lead;
  isExpanded: boolean;
  onExpand: (id: string) => void;
  onNotas: (id: string, notas: string) => void;
  onCrearConvenio: (lead: Lead) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });
  const [notas, setNotas] = useState(lead.notas_internas ?? "");

  const waMsg = `Hola ${lead.contacto_nombre}! Te escribimos de Tuco por la consulta de convenio para ${lead.empresa}.`;

  return (
    <div
      ref={setNodeRef}
      className={`rounded-card bg-white transition-all select-none ${
        !lead.visto ? "ring-1 ring-brand-primary" : ""
      } ${isDragging ? "opacity-30 shadow-none" : "shadow-card"}`}
    >
      <div className="p-3 cursor-grab active:cursor-grabbing" {...listeners} {...attributes}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-bold text-sm text-gray-900 truncate">{lead.empresa}</span>
          {!lead.visto && (
            <span className="shrink-0 text-[9px] font-bold bg-brand-primary text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
              Nuevo
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 truncate">{lead.contacto_nombre}</p>
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="font-semibold text-gray-800">{PAQUETE_LABEL[lead.paquete_interes]}</span>
          <span className="text-gray-400">{fecha(lead.created_at)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 pb-2">
        <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => onExpand(lead.id)}>
          {isExpanded ? "▲ Ocultar" : "▼ Detalle"}
        </button>
        <a
          href={buildWaLink(lead.telefono, waMsg)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-semibold text-[#128C7E] hover:underline"
        >
          WhatsApp
        </a>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2 space-y-1.5 text-xs text-gray-600">
          {lead.cargo && <p>👤 {lead.cargo}</p>}
          <p>
            ✉️{" "}
            <a className="text-blue-600 hover:underline break-all" href={`mailto:${lead.email}`}>
              {lead.email}
            </a>
          </p>
          <p>📞 {lead.telefono}</p>
          <p>📍 {lead.zona}</p>
          {lead.cantidad_empleados && <p>👥 {lead.cantidad_empleados} empleados</p>}
          {lead.comentarios && <p className="whitespace-pre-line">💬 {lead.comentarios}</p>}
          <label className="block pt-1">
            <span className="block font-semibold text-gray-700 mb-1">Notas internas</span>
            <textarea
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              onBlur={() => notas !== (lead.notas_internas ?? "") && onNotas(lead.id, notas)}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="Precio ofrecido, degustación, próximos pasos…"
            />
          </label>
          {lead.estado === "GANADO" &&
            (lead.convenio ? (
              <p className="text-green-700 font-semibold">✓ Convenio creado</p>
            ) : (
              <button
                onClick={() => onCrearConvenio(lead)}
                className="w-full mt-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg"
              >
                Crear convenio
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function Column({
  estado,
  leads,
  ...cardProps
}: {
  estado: EstadoLead;
  leads: Lead[];
  expanded: string | null;
  onExpand: (id: string) => void;
  onNotas: (id: string, notas: string) => void;
  onCrearConvenio: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });
  return (
    <div className="flex flex-col min-w-[210px] flex-1">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-t-card border ${COLUMN_HEADER[estado]} mb-1`}>
        <span className="text-xs font-bold uppercase tracking-widest">{ESTADO_LABEL[estado]}</span>
        <span className="ml-auto text-xs font-bold bg-white/70 rounded-full w-5 h-5 flex items-center justify-center">
          {leads.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[300px] rounded-b-card p-2 space-y-2 transition-all bg-brand-light ${
          isOver ? COLUMN_OVER[estado] : ""
        }`}
      >
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-16 text-xs text-gray-400 border-2 border-dashed border-brand-border rounded-xl">
            Sin leads
          </div>
        )}
        {leads.map((l) => (
          <LeadCard
            key={l.id}
            lead={l}
            isExpanded={cardProps.expanded === l.id}
            onExpand={cardProps.onExpand}
            onNotas={cardProps.onNotas}
            onCrearConvenio={cardProps.onCrearConvenio}
          />
        ))}
      </div>
    </div>
  );
}

export function LeadsKanban({
  onCrearConvenio,
  reloadKey,
}: {
  onCrearConvenio: (lead: Lead) => void;
  reloadKey: number;
}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [active, setActive] = useState<Lead | null>(null);
  const initialLoadDone = useRef(false);
  const { setUnseenLeads } = useAdminNotifications();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  async function load() {
    const res = await fetch("/api/admin/leads");
    if (res.ok) setLeads(await res.json());
    setLoading(false);

    // Igual que pedidos: se muestran los NUEVO y después se marcan como vistos
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      setUnseenLeads(0);
      fetch("/api/admin/leads/marcar-vistos", { method: "PATCH" }).catch(() => {});
    }
  }

  useEffect(() => {
    load();
  }, [reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function patch(id: string, data: Partial<Pick<Lead, "estado" | "notas_internas">>) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("No se pudo guardar el cambio");
      load();
    }
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActive(leads.find((l) => l.id === active.id) ?? null);
    setExpanded(null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActive(null);
    if (!over) return;
    const lead = leads.find((l) => l.id === active.id);
    if (!lead || over.id === lead.estado) return;
    patch(lead.id, { estado: over.id as EstadoLead });
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando...</div>;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {ESTADOS.map((estado) => (
          <Column
            key={estado}
            estado={estado}
            leads={leads.filter((l) => l.estado === estado)}
            expanded={expanded}
            onExpand={(id) => setExpanded((cur) => (cur === id ? null : id))}
            onNotas={(id, notas_internas) => patch(id, { notas_internas })}
            onCrearConvenio={onCrearConvenio}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>{active ? <CardPreview lead={active} /> : null}</DragOverlay>
    </DndContext>
  );
}
