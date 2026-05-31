"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  categoria: string;
  disponible: boolean;
  foto_url: string | null;
}

const EMPTY: Omit<MenuItem, "id"> = {
  nombre: "",
  descripcion: "",
  precio: "",
  categoria: "",
  disponible: true,
  foto_url: null,
};

export function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<MenuItem, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/menu");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm(EMPTY);
    setCreating(true);
    setEditing(null);
  }

  function openEdit(item: MenuItem) {
    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion ?? "",
      precio: item.precio,
      categoria: item.categoria,
      disponible: item.disponible,
      foto_url: item.foto_url,
    });
    setEditing(item);
    setCreating(false);
  }

  function closeForm() {
    setEditing(null);
    setCreating(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
      setForm((p) => ({ ...p, foto_url: data.url }));
    } finally {
      setUploadingImg(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const payload = { ...form, precio: parseFloat(form.precio) };
    if (editing) {
      await fetch(`/api/admin/menu/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    closeForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este ítem?")) return;
    await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
    load();
  }

  const showForm = creating || !!editing;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Menú ({items.length} ítems)</h1>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={form.categoria}
                onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
                placeholder="Ej: Almuerzo, Cena, Postres"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={form.precio}
                onChange={(e) => setForm((p) => ({ ...p, precio: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="disponible"
                checked={form.disponible}
                onChange={(e) => setForm((p) => ({ ...p, disponible: e.target.checked }))}
                className="w-4 h-4 accent-orange-500"
              />
              <label htmlFor="disponible" className="text-sm text-gray-700">Disponible</label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <textarea
              rows={2}
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
                <button
                  onClick={() => setForm((p) => ({ ...p, foto_url: null }))}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Quitar
                </button>
              )}
            </div>
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
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm flex items-center gap-4 p-4"
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {item.foto_url ? (
                  <Image src={item.foto_url} alt={item.nombre} fill className="object-cover" />
                ) : (
                  <div className="h-full flex items-center justify-center text-2xl">🍽️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{item.nombre}</span>
                  {!item.disponible && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{item.categoria} · ${Number(item.precio).toLocaleString("es-AR")}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(item)}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-sm text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
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
