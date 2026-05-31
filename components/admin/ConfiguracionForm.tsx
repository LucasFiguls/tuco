"use client";

import { useEffect, useState } from "react";

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
    </div>
  );
}
