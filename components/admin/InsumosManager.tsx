"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export function InsumosManager() {
  const [insumos, setInsumos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "", unidad_medida: "gr", costo_unitario: 0, stock_minimo: 0, proveedor: ""
  });
  
  // Stock Adjust state
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAjuste, setStockAjuste] = useState(0);
  const [motivoAjuste, setMotivoAjuste] = useState("");

  useEffect(() => {
    fetchInsumos();
  }, []);

  const fetchInsumos = async () => {
    try {
      const res = await fetch("/api/admin/insumos");
      if (res.ok) {
        const data = await res.json();
        setInsumos(data);
      }
    } catch (e) {
      toast.error("Error al cargar insumos");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/admin/insumos/${editingId}` : "/api/admin/insumos";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success(editingId ? "Insumo actualizado" : "Insumo creado");
        setShowModal(false);
        fetchInsumos();
      } else {
        toast.error("Error al guardar");
      }
    } catch (e) {
      toast.error("Error al guardar");
    }
  };

  const handleStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || stockAjuste === 0) return;

    try {
      const res = await fetch(`/api/admin/insumos/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ajuste_stock: stockAjuste, motivo_ajuste: motivoAjuste })
      });
      
      if (res.ok) {
        toast.success("Stock ajustado correctamente");
        setShowStockModal(false);
        fetchInsumos();
      } else {
        toast.error("Error al ajustar stock");
      }
    } catch (e) {
      toast.error("Error al ajustar stock");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Insumos ({insumos.length})</h1>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ nombre: "", unidad_medida: "gr", costo_unitario: 0, stock_minimo: 0, proveedor: "" });
            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-4 py-2 rounded-xl transition-colors"
        >
          + Nuevo Insumo
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Insumo</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Unidad</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Costo Unit.</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Stock Actual</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-400">Cargando...</td></tr>
            ) : insumos.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-400">No hay insumos registrados.</td></tr>
            ) : (
              insumos.map((insumo) => (
                <tr key={insumo.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{insumo.nombre}</div>
                    {insumo.proveedor && <div className="text-xs text-gray-400">{insumo.proveedor}</div>}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{insumo.unidad_medida}</td>
                  <td className="p-4 text-sm text-gray-600">${Number(insumo.costo_unitario).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`font-semibold text-sm ${insumo.stock_actual <= insumo.stock_minimo ? 'text-red-500' : 'text-green-600'}`}>
                      {insumo.stock_actual}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingId(insumo.id);
                        setFormData({
                          nombre: insumo.nombre, unidad_medida: insumo.unidad_medida, 
                          costo_unitario: Number(insumo.costo_unitario), stock_minimo: insumo.stock_minimo, proveedor: insumo.proveedor || ""
                        });
                        setShowModal(true);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => {
                        setEditingId(insumo.id);
                        setStockAjuste(0);
                        setMotivoAjuste("");
                        setShowStockModal(true);
                      }}
                      className="text-sm text-orange-500 hover:text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50"
                    >
                      Ajustar Stock
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar Insumo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-sm w-full max-w-md p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">{editingId ? "Editar Insumo" : "Nuevo Insumo"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                <input required type="text" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" 
                  value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unidad</label>
                  <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                    value={formData.unidad_medida} onChange={e => setFormData({...formData, unidad_medida: e.target.value})}>
                    <option value="gr">Gramos (gr)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="lt">Litros (lt)</option>
                    <option value="unidad">Unidad</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Costo Unit.</label>
                  <input required type="number" step="0.01" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" 
                    value={formData.costo_unitario} onChange={e => setFormData({...formData, costo_unitario: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stock Mínimo</label>
                  <input type="number" step="0.01" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" 
                    value={formData.stock_minimo} onChange={e => setFormData({...formData, stock_minimo: Number(e.target.value)})} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Proveedor</label>
                  <input type="text" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" 
                    value={formData.proveedor} onChange={e => setFormData({...formData, proveedor: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-5 py-2 rounded-xl transition-colors">Guardar</button>
                <button type="button" onClick={() => setShowModal(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajuste de Stock */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-sm w-full max-w-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Ajuste de Stock Manual</h2>
            <form onSubmit={handleStockAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ajuste (use negativos para restar)</label>
                <input required type="number" step="0.01" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" 
                  value={stockAjuste} onChange={e => setStockAjuste(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Motivo (opcional)</label>
                <input type="text" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" 
                  value={motivoAjuste} onChange={e => setMotivoAjuste(e.target.value)} placeholder="Ej: Compra, Merma, etc." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-5 py-2 rounded-xl transition-colors">Ajustar</button>
                <button type="button" onClick={() => setShowStockModal(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
