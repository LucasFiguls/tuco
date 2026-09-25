"use client";

import { useEffect, useState } from "react";
import { interpolateTemplate } from "@/lib/whatsapp";

interface Config {
  whatsapp_numero: string;
  horarios: string;
  zonas_delivery: string;
}

const DEFAULTS: Config = {
  whatsapp_numero: "",
  horarios: "Lunes a viernes 12:00 a 14:00 y 19:00 a 21:00",
  zonas_delivery: "",
};

// ----- WhatsApp templates section -----

const ESTADOS_WA = ["PENDIENTE", "CONFIRMADO", "ENTREGADO", "CANCELADO"] as const;
type EstadoWA = (typeof ESTADOS_WA)[number];

const ESTADO_LABEL_WA: Record<EstadoWA, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const ESTADO_COLOR_WA: Record<EstadoWA, string> = {
  PENDIENTE: "text-amber-700 bg-amber-50 border-amber-200",
  CONFIRMADO: "text-blue-700 bg-blue-50 border-blue-200",
  ENTREGADO: "text-green-700 bg-green-50 border-green-200",
  CANCELADO: "text-red-700 bg-red-50 border-red-200",
};

const DEFAULT_PLANTILLAS: Record<EstadoWA, string> = {
  PENDIENTE:
    "Hola {{nombre}}! Recibimos tu pedido {{numero_pedido}} y lo estamos revisando. Te avisamos cuando esté confirmado.",
  CONFIRMADO:
    "Hola {{nombre}}! Tu pedido {{numero_pedido}} fue confirmado ✅ y estará listo a las {{hora}}. ¡Gracias por elegirnos!",
  ENTREGADO:
    "Hola {{nombre}}! Tu pedido {{numero_pedido}} fue entregado ✅. ¡Gracias por elegirnos! Esperamos verte pronto.",
  CANCELADO:
    "Hola {{nombre}}, lamentablemente tu pedido {{numero_pedido}} fue cancelado. Disculpá los inconvenientes.",
};

const PREVIEW_DATA = {
  nombre: "María",
  numero_pedido: 42,
  monto: "3500",
  hora: "13:00",
};

const VARS_DOC = ["{{nombre}}", "{{numero_pedido}}", "{{estado}}", "{{monto}}", "{{hora}}"];

interface WaTemplate {
  habilitado: boolean;
  plantilla: string;
}

function WhatsAppTemplatesSection() {
  const [templates, setTemplates] = useState<Record<EstadoWA, WaTemplate>>(() => {
    const init = {} as Record<EstadoWA, WaTemplate>;
    for (const e of ESTADOS_WA) init[e] = { habilitado: true, plantilla: DEFAULT_PLANTILLAS[e] };
    return init;
  });
  const [loadingWa, setLoadingWa] = useState(true);
  const [savingEstado, setSavingEstado] = useState<EstadoWA | null>(null);
  const [savedEstado, setSavedEstado] = useState<EstadoWA | null>(null);

  useEffect(() => {
    fetch("/api/admin/whatsapp-templates")
      .then((r) => r.json())
      .then((data) => {
        setTemplates((prev) => ({ ...prev, ...data }));
        setLoadingWa(false);
      })
      .catch(() => setLoadingWa(false));
  }, []);

  async function handleSaveEstado(estado: EstadoWA) {
    setSavingEstado(estado);
    await fetch(`/api/admin/whatsapp-templates/${estado}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templates[estado]),
    });
    setSavingEstado(null);
    setSavedEstado(estado);
    setTimeout(() => setSavedEstado(null), 2000);
  }

  if (loadingWa) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Plantillas de WhatsApp</h2>
      <p className="text-sm text-gray-500 mb-5">
        Mensajes pre-cargados que se abren al tocar el ícono de WhatsApp en cada pedido.
      </p>

      <div className="space-y-4">
        {ESTADOS_WA.map((estado) => {
          const t = templates[estado];
          const preview = interpolateTemplate(t.plantilla, {
            ...PREVIEW_DATA,
            estado,
          });

          return (
            <div key={estado} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${ESTADO_COLOR_WA[estado]}`}
                >
                  {ESTADO_LABEL_WA[estado]}
                </span>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-gray-600">Habilitado</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={t.habilitado}
                      onChange={(e) =>
                        setTemplates((prev) => ({
                          ...prev,
                          [estado]: { ...prev[estado], habilitado: e.target.checked },
                        }))
                      }
                    />
                    <div
                      className={`w-10 h-5 rounded-full transition-colors ${
                        t.habilitado ? "bg-[#25D366]" : "bg-gray-300"
                      }`}
                    />
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        t.habilitado ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </label>
              </div>

              <div>
                <textarea
                  rows={3}
                  disabled={!t.habilitado}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none disabled:bg-gray-50 disabled:text-gray-400"
                  value={t.plantilla}
                  onChange={(e) =>
                    setTemplates((prev) => ({
                      ...prev,
                      [estado]: { ...prev[estado], plantilla: e.target.value },
                    }))
                  }
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {VARS_DOC.map((v) => (
                    <span
                      key={v}
                      className="text-[11px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {t.habilitado && t.plantilla && (
                <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-600 border border-gray-100">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Preview
                  </p>
                  <p className="whitespace-pre-wrap">{preview}</p>
                </div>
              )}

              <button
                onClick={() => handleSaveEstado(estado)}
                disabled={savingEstado === estado}
                className="text-sm font-semibold px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white transition-colors"
              >
                {savingEstado === estado
                  ? "Guardando..."
                  : savedEstado === estado
                  ? "✓ Guardado"
                  : "Guardar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----- Main ConfiguracionForm -----

export function ConfiguracionForm() {
  const [config, setConfig] = useState<Config>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/configuracion")
      .then((r) => r.json())
      .then((data) => {
        setConfig({ ...DEFAULTS, ...data });
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/configuracion", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando...</div>;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Configuración</h1>

      <form onSubmit={handleSave} className="space-y-5 max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">WhatsApp y atención</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de WhatsApp del negocio
            </label>
            <input
              type="tel"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              value={config.whatsapp_numero}
              onChange={(e) => setConfig((p) => ({ ...p, whatsapp_numero: e.target.value }))}
              placeholder="5491112345678"
            />
            <p className="text-xs text-gray-400 mt-1">Formato internacional sin +, ej: 5491112345678</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horarios de atención
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              value={config.horarios}
              onChange={(e) => setConfig((p) => ({ ...p, horarios: e.target.value }))}
              placeholder="Lun-Vie 12:00 a 14:00 y 19:00 a 21:00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zonas de delivery habilitadas
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              value={config.zonas_delivery}
              onChange={(e) => setConfig((p) => ({ ...p, zonas_delivery: e.target.value }))}
              placeholder="Palermo, Recoleta, Almagro..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
        </button>
      </form>

      <div className="max-w-lg">
        <WhatsAppTemplatesSection />
      </div>
    </div>
  );
}
