"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TAG_CONFIG } from "@/lib/tags";
import { METODOS, METODO_LABEL, TIPO_LABEL, slugify, type MetodoRegeneracion, type TipoVacio } from "@/lib/vacio";

interface RegeneracionForm {
  metodo: MetodoRegeneracion;
  minutos: string;
  pasos: string;
}

type Linea = "CALIENTE" | "VACIO";

interface ComponentForm {
  nombre: string;
  cantidad_label: string;
  foto_url: string;
}

interface MenuItem {
  id: string;
  nombre: string;
  tagline: string;
  descripcion: string | null;
  precio: string;
  categoria: string;
  disponible: boolean;
  foto_url: string | null;
  calorias: string;
  proteinas: string;
  carbohidratos: string;
  grasas: string;
  ingredientes: string;
  tags: string[];
  menu_del_dia: boolean;
  components: ComponentForm[];
  receta_id: string | null;
  linea: Linea;
  tipo_vacio: TipoVacio;
  slug: string;
  porcion_gramos: string;
  dias_heladera: string;
  meses_freezer: string;
  regeneracion: RegeneracionForm[];
  foto_bolsa_url: string | null;
  alergenos: string;
  va_bien_con: string[];
}

const EMPTY: Omit<MenuItem, "id"> = {
  nombre: "",
  tagline: "",
  descripcion: "",
  precio: "",
  categoria: "",
  disponible: true,
  foto_url: null,
  calorias: "",
  proteinas: "",
  carbohidratos: "",
  grasas: "",
  ingredientes: "",
  tags: [],
  menu_del_dia: false,
  components: [],
  receta_id: null,
  linea: "CALIENTE",
  tipo_vacio: "PLATO",
  slug: "",
  porcion_gramos: "",
  dias_heladera: "",
  meses_freezer: "",
  regeneracion: [],
  foto_bolsa_url: null,
  alergenos: "",
  va_bien_con: [],
};

const str = (v: unknown) => (v != null ? String(v) : "");

export function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [recetas, setRecetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<MenuItem, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [newCatMode, setNewCatMode] = useState(false);
  const [lineaFiltro, setLineaFiltro] = useState<Linea>("CALIENTE");

  async function load() {
    setLoading(true);
    const [res, recRes] = await Promise.all([
      fetch("/api/admin/menu"),
      fetch("/api/admin/recetas")
    ]);
    const data = await res.json();
    setRecetas(await recRes.json());
    setItems(data.map((i: Record<string, unknown>) => ({
      ...i,
      calorias:      i.calorias      != null ? String(i.calorias)      : "",
      proteinas:     i.proteinas     != null ? String(i.proteinas)     : "",
      carbohidratos: i.carbohidratos != null ? String(i.carbohidratos) : "",
      grasas:        i.grasas        != null ? String(i.grasas)        : "",
      ingredientes:  i.ingredientes  ?? "",
      tagline:       i.tagline       ?? "",
      descripcion:   i.descripcion   ?? null,
      foto_url:      i.foto_url      ?? null,
      tags:          Array.isArray(i.tags) ? i.tags : [],
      menu_del_dia:  Boolean(i.menu_del_dia),
      receta_id:     (i.receta_id as string) ?? null,
      linea:          (i.linea as Linea) ?? "CALIENTE",
      tipo_vacio:     (i.tipo_vacio as TipoVacio) ?? "PLATO",
      slug:           str(i.slug),
      porcion_gramos: str(i.porcion_gramos),
      dias_heladera:  str(i.dias_heladera),
      meses_freezer:  str(i.meses_freezer),
      regeneracion:   Array.isArray(i.regeneracion)
        ? (i.regeneracion as Record<string, unknown>[]).map((r) => ({
            metodo:  r.metodo as MetodoRegeneracion,
            minutos: str(r.minutos),
            pasos:   str(r.pasos),
          }))
        : [],
      foto_bolsa_url: (i.foto_bolsa_url as string) ?? null,
      alergenos:      str(i.alergenos),
      va_bien_con:    Array.isArray(i.va_bien_con) ? (i.va_bien_con as string[]) : [],
      components: Array.isArray(i.components)
        ? (i.components as Record<string, unknown>[]).map((c) => ({
            nombre:         String(c.nombre ?? ""),
            cantidad_label: String(c.cantidad_label ?? ""),
            foto_url:       String(c.foto_url ?? ""),
          }))
        : [],
    })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm({ ...EMPTY, linea: lineaFiltro });
    setNewCatMode(false);
    setCreating(true);
    setEditing(null);
  }

  function openEdit(item: MenuItem) {
    setNewCatMode(false);
    setForm({
      nombre:        item.nombre,
      tagline:       item.tagline,
      descripcion:   item.descripcion ?? "",
      precio:        item.precio,
      categoria:     item.categoria,
      disponible:    item.disponible,
      foto_url:      item.foto_url,
      calorias:      item.calorias,
      proteinas:     item.proteinas,
      carbohidratos: item.carbohidratos,
      grasas:        item.grasas,
      ingredientes:  item.ingredientes,
      tags:          item.tags,
      menu_del_dia:  item.menu_del_dia,
      receta_id:     item.receta_id,
      components:    item.components,
      linea:          item.linea,
      tipo_vacio:     item.tipo_vacio,
      slug:           item.slug,
      porcion_gramos: item.porcion_gramos,
      dias_heladera:  item.dias_heladera,
      meses_freezer:  item.meses_freezer,
      regeneracion:   item.regeneracion,
      foto_bolsa_url: item.foto_bolsa_url,
      alergenos:      item.alergenos,
      va_bien_con:    item.va_bien_con,
    });
    setEditing(item);
    setCreating(false);
  }

  function closeForm() {
    setEditing(null);
    setCreating(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, campo: "foto_url" | "foto_bolsa_url" = "foto_url") {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error al subir imagen" }));
        alert(err.error ?? "Error al subir imagen");
        return;
      }
      const data = await res.json();
      setForm((p) => ({ ...p, [campo]: data.url }));
    } finally {
      setUploadingImg(false);
    }
  }

  function updateComponent(idx: number, field: keyof ComponentForm, value: string) {
    setForm((p) => {
      const updated = [...p.components];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...p, components: updated };
    });
  }

  function addComponent() {
    setForm((p) => ({
      ...p,
      components: [...p.components, { nombre: "", cantidad_label: "", foto_url: "" }],
    }));
  }

  function removeComponent(idx: number) {
    setForm((p) => ({ ...p, components: p.components.filter((_, i) => i !== idx) }));
  }

  function toggleTag(key: string, checked: boolean) {
    setForm((p) => ({
      ...p,
      tags: checked ? [...p.tags, key] : p.tags.filter((t) => t !== key),
    }));
  }

  function updateRegeneracion(idx: number, field: keyof RegeneracionForm, value: string) {
    setForm((p) => {
      const updated = [...p.regeneracion];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...p, regeneracion: updated };
    });
  }

  function toggleVaBienCon(id: string, checked: boolean) {
    setForm((p) => ({
      ...p,
      va_bien_con: checked ? [...p.va_bien_con, id] : p.va_bien_con.filter((x) => x !== id),
    }));
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      ...form,
      precio:        parseFloat(form.precio),
      categoria:     form.categoria.trim(),
      calorias:      form.calorias      !== "" ? form.calorias      : null,
      proteinas:     form.proteinas     !== "" ? form.proteinas     : null,
      carbohidratos: form.carbohidratos !== "" ? form.carbohidratos : null,
      grasas:        form.grasas        !== "" ? form.grasas        : null,
      ingredientes:  form.ingredientes  || null,
      tagline:       form.tagline       || null,
      tags:          form.tags,
      menu_del_dia:  form.menu_del_dia,
      receta_id:     form.receta_id || null,
      regeneracion:  form.regeneracion
        .filter((r) => r.minutos !== "")
        .map((r) => ({ metodo: r.metodo, minutos: Number(r.minutos), pasos: r.pasos || undefined })),
      components:    form.components
        .filter((c) => c.nombre.trim())
        .map((c) => ({ ...c, foto_url: c.foto_url || null })),
    };
    const res = await fetch(editing ? `/api/admin/menu/${editing.id}` : "/api/admin/menu", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "No se pudo guardar");
      return;
    }
    closeForm();
    load();
  }

  async function toggleMenuDelDia(id: string, current: boolean) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, menu_del_dia: !current } : i));
    const res = await fetch(`/api/admin/menu/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menu_del_dia: !current }),
    });
    if (!res.ok) {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, menu_del_dia: current } : i));
    }
  }

  async function toggleDisponible(id: string, current: boolean) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, disponible: !current } : i));
    const res = await fetch(`/api/admin/menu/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: !current }),
    });
    if (!res.ok) {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, disponible: current } : i));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este ítem?")) return;
    await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
    load();
  }

  const showForm = creating || !!editing;
  const esVacio = form.linea === "VACIO";
  const lista = items.filter((i) => i.linea === lineaFiltro);
  const otrosVacio = items.filter((i) => i.linea === "VACIO" && i.id !== editing?.id);
  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Menú</h1>
          <div className="inline-flex p-1 rounded-xl bg-gray-100">
            {(["CALIENTE", "VACIO"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLineaFiltro(l)}
                className={`text-sm font-semibold px-3 py-1 rounded-lg transition-colors ${
                  lineaFiltro === l ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {l === "CALIENTE" ? "Caliente" : "Al vacío"} ({items.filter((i) => i.linea === l).length})
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={openCreate}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-4 py-2 rounded-xl transition-colors"
        >
          + Nuevo ítem
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-800">
            {editing ? "Editar ítem" : "Nuevo ítem"}
          </h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Línea</label>
            <div className="inline-flex p-1 rounded-xl bg-gray-100">
              {(["CALIENTE", "VACIO"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, linea: l }))}
                  className={`text-sm font-semibold px-3 py-1 rounded-lg ${form.linea === l ? "bg-white text-orange-600 shadow-sm" : "text-gray-500"}`}
                >
                  {l === "CALIENTE" ? "Menú caliente" : "Al vacío"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Datos principales ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
              <input className={inputCls} value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
              {(() => {
                const cats = [...new Set(items.map((i) => i.categoria))].sort();
                if (cats.length === 0 || newCatMode) {
                  return (
                    <div className="flex gap-2">
                      <input
                        autoFocus={newCatMode}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        value={form.categoria}
                        onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
                        placeholder="Nombre de la categoría"
                      />
                      {newCatMode && (
                        <button type="button" onClick={() => { setNewCatMode(false); setForm((p) => ({ ...p, categoria: cats[0] ?? "" })); }} className="text-xs text-gray-400 hover:text-gray-600 px-2">
                          ✕
                        </button>
                      )}
                    </div>
                  );
                }
                return (
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                    value={form.categoria}
                    onChange={(e) => {
                      if (e.target.value === "__nueva__") { setNewCatMode(true); setForm((p) => ({ ...p, categoria: "" })); }
                      else { setForm((p) => ({ ...p, categoria: e.target.value })); }
                    }}
                  >
                    {cats.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    <option value="__nueva__">+ Nueva categoría…</option>
                  </select>
                );
              })()}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio</label>
              <input type="number" step="0.01" min="0" className={inputCls} value={form.precio} onChange={(e) => setForm((p) => ({ ...p, precio: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="disponible" checked={form.disponible} onChange={(e) => setForm((p) => ({ ...p, disponible: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
              <label htmlFor="disponible" className="text-sm text-gray-700">Disponible</label>
            </div>
            {!esVacio && <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="menu_del_dia" checked={form.menu_del_dia} onChange={(e) => setForm((p) => ({ ...p, menu_del_dia: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
              <label htmlFor="menu_del_dia" className="text-sm text-gray-700">Menú del día ★</label>
            </div>}
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Receta Asignada (Control de Stock)</label>
              <select className={inputCls + " bg-white"} value={form.receta_id || ""} onChange={(e) => setForm(p => ({ ...p, receta_id: e.target.value || null }))}>
                <option value="">Sin receta (No descuenta stock)</option>
                {recetas.map(r => <option key={r.id} value={r.id}>{r.nombre} (Rinde: {r.rendimiento})</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tagline</label>
            <input
              className={inputCls}
              value={form.tagline}
              placeholder="Frase corta y apetitosa (ej: Pollo a la parrilla con vegetales de estación)"
              onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <textarea
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              value={form.descripcion ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Foto</label>
            <div className="flex items-center gap-3">
              {form.foto_url && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                  <Image src={form.foto_url} alt="foto" fill className="object-cover" />
                </div>
              )}
              <label className="cursor-pointer text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors">
                {uploadingImg ? "Subiendo..." : "Subir imagen"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {form.foto_url && (
                <button onClick={() => setForm((p) => ({ ...p, foto_url: null }))} className="text-xs text-red-400 hover:text-red-600">Quitar</button>
              )}
            </div>
          </div>

          {/* ── Línea al vacío ────────────────────────────────────────────── */}
          {esVacio && (
            <div className="pt-2 border-t border-gray-100 space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Al vacío</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de bolsa</label>
                  <select className={inputCls + " bg-white"} value={form.tipo_vacio} onChange={(e) => setForm((p) => ({ ...p, tipo_vacio: e.target.value as TipoVacio }))}>
                    {(Object.keys(TIPO_LABEL) as TipoVacio[]).map((t) => (
                      <option key={t} value={t}>{TIPO_LABEL[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">URL de la ficha</label>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    /platos/
                    <input className={inputCls} value={form.slug} placeholder={slugify(form.nombre) || "lomo-al-roquefort"} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Porción (g)</label>
                  <input type="number" min="1" className={inputCls} value={form.porcion_gramos} onChange={(e) => setForm((p) => ({ ...p, porcion_gramos: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Días en heladera</label>
                    <input type="number" min="1" className={inputCls} value={form.dias_heladera} onChange={(e) => setForm((p) => ({ ...p, dias_heladera: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Meses en freezer</label>
                    <input type="number" min="1" className={inputCls} value={form.meses_freezer} onChange={(e) => setForm((p) => ({ ...p, meses_freezer: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Foto de la bolsa</label>
                <div className="flex items-center gap-3">
                  {form.foto_bolsa_url && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                      <Image src={form.foto_bolsa_url} alt="bolsa" fill className="object-cover" />
                    </div>
                  )}
                  <label className="cursor-pointer text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors">
                    {uploadingImg ? "Subiendo..." : "Subir imagen"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "foto_bolsa_url")} />
                  </label>
                  {form.foto_bolsa_url && (
                    <button onClick={() => setForm((p) => ({ ...p, foto_bolsa_url: null }))} className="text-xs text-red-400 hover:text-red-600">Quitar</button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Alérgenos</label>
                <input className={inputCls} value={form.alergenos} placeholder="Contiene lácteos y gluten" onChange={(e) => setForm((p) => ({ ...p, alergenos: e.target.value }))} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600">Regeneración</label>
                  <button
                    type="button"
                    onClick={() => {
                      const libre = METODOS.find((m) => !form.regeneracion.some((r) => r.metodo === m));
                      if (libre) setForm((p) => ({ ...p, regeneracion: [...p.regeneracion, { metodo: libre, minutos: "", pasos: "" }] }));
                    }}
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                  >
                    + Método
                  </button>
                </div>
                {form.regeneracion.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Sin métodos. Sumá al menos uno para que la ficha muestre cómo calentarlo.</p>
                ) : (
                  <div className="space-y-2">
                    {form.regeneracion.map((r, idx) => (
                      <div key={idx} className="grid grid-cols-[140px_90px_1fr_auto] gap-2 items-start">
                        <select className={inputCls + " bg-white"} value={r.metodo} onChange={(e) => updateRegeneracion(idx, "metodo", e.target.value)}>
                          {METODOS.map((m) => (
                            <option key={m} value={m}>{METODO_LABEL[m]}</option>
                          ))}
                        </select>
                        <input type="number" min="1" className={inputCls} placeholder="min" value={r.minutos} onChange={(e) => updateRegeneracion(idx, "minutos", e.target.value)} />
                        <input className={inputCls} placeholder="Pasos (opcional)" value={r.pasos} onChange={(e) => updateRegeneracion(idx, "pasos", e.target.value)} />
                        <button type="button" onClick={() => setForm((p) => ({ ...p, regeneracion: p.regeneracion.filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 p-2" aria-label="Quitar método">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {otrosVacio.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Va bien con…</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {otrosVacio.map((o) => (
                      <label key={o.id} className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={form.va_bien_con.includes(o.id)}
                          onChange={(e) => toggleVaBienCon(o.id, e.target.checked)}
                          className="w-4 h-4 accent-orange-500 flex-shrink-0"
                        />
                        {o.nombre} <span className="text-xs text-gray-400">· {TIPO_LABEL[o.tipo_vacio]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Información nutricional ──────────────────────────────────── */}
          <div className="pt-2 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Información nutricional <span className="font-normal normal-case">(opcional)</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Calorías (kcal)</label>
                <input type="number" min="0" step="1" className={inputCls} value={form.calorias} placeholder="ej: 450" onChange={(e) => setForm((p) => ({ ...p, calorias: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Proteínas (g)</label>
                <input type="number" min="0" step="0.1" className={inputCls} value={form.proteinas} placeholder="ej: 28.5" onChange={(e) => setForm((p) => ({ ...p, proteinas: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Carbohidratos (g)</label>
                <input type="number" min="0" step="0.1" className={inputCls} value={form.carbohidratos} placeholder="ej: 45" onChange={(e) => setForm((p) => ({ ...p, carbohidratos: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Grasas (g)</label>
                <input type="number" min="0" step="0.1" className={inputCls} value={form.grasas} placeholder="ej: 12" onChange={(e) => setForm((p) => ({ ...p, grasas: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ingredientes</label>
              <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" value={form.ingredientes} placeholder="Pasta, salsa de tomate, albahaca…" onChange={(e) => setForm((p) => ({ ...p, ingredientes: e.target.value }))} />
            </div>
          </div>

          {/* ── Etiquetas ─────────────────────────────────────────────────── */}
          <div className="pt-2 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Etiquetas</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(TAG_CONFIG).map(([key, cfg]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.tags.includes(key)}
                    onChange={(e) => toggleTag(key, e.target.checked)}
                    className="w-4 h-4 accent-orange-500 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700">{cfg.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Componentes del plato ─────────────────────────────────────── */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Componentes del plato <span className="font-normal normal-case">(opcional)</span>
              </h3>
              <button type="button" onClick={addComponent} className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                + Agregar
              </button>
            </div>
            {form.components.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Sin componentes. Usá "+ Agregar" para añadir ingredientes o porciones.</p>
            ) : (
              <div className="space-y-2">
                {form.components.map((comp, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        placeholder="Nombre (ej: Milanesa)"
                        value={comp.nombre}
                        onChange={(e) => updateComponent(idx, "nombre", e.target.value)}
                      />
                      <input
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        placeholder="Cantidad (ej: 200 g)"
                        value={comp.cantidad_label}
                        onChange={(e) => updateComponent(idx, "cantidad_label", e.target.value)}
                      />
                      <input
                        className="col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        placeholder="URL de foto Cloudinary (opcional)"
                        value={comp.foto_url}
                        onChange={(e) => updateComponent(idx, "foto_url", e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeComponent(idx)}
                      className="text-red-400 hover:text-red-600 p-2 mt-0.5 flex-shrink-0"
                      aria-label="Eliminar componente"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || uploadingImg}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium text-sm px-5 py-2 rounded-xl transition-colors"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button onClick={closeForm} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : (
        <div className="space-y-2">
          {lista.length === 0 && (
            <p className="text-center py-12 text-gray-400 bg-white rounded-2xl">
              {lineaFiltro === "VACIO" ? "Todavía no hay productos al vacío." : "No hay ítems en el menú caliente."}
            </p>
          )}
          {lista.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm flex items-center gap-4 p-4">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {item.foto_url ? (
                  <Image src={item.foto_url} alt={item.nombre} fill className="object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-2xl">🍽️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">{item.nombre}</span>
                  {item.linea === "VACIO" && (
                    <span className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">{TIPO_LABEL[item.tipo_vacio]}</span>
                  )}
                  {item.tags.length > 0 && (
                    <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                      {item.tags.length} etiqueta{item.tags.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {item.components.length > 0 && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      {item.components.length} componente{item.components.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.categoria} · ${Number(item.precio).toLocaleString("es-AR")}
                  {item.tagline && ` · ${item.tagline}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {item.linea === "CALIENTE" && <button
                  onClick={() => toggleMenuDelDia(item.id, item.menu_del_dia)}
                  title={item.menu_del_dia ? "Quitar del menú del día" : "Marcar como menú del día"}
                  className={`text-xl leading-none transition-colors ${item.menu_del_dia ? "text-yellow-400" : "text-gray-300 hover:text-gray-400"}`}
                >
                  ★
                </button>}
                <button
                  onClick={() => toggleDisponible(item.id, item.disponible)}
                  role="switch"
                  aria-checked={item.disponible}
                  aria-label={item.disponible ? "Disponible" : "No disponible"}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    item.disponible ? "bg-orange-500" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    item.disponible ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </button>
                <button onClick={() => openEdit(item)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                  Editar
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-sm text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
