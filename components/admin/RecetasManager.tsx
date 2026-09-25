"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export function RecetasManager() {
  const [recetas, setRecetas] = useState<any[]>([]);
  const [insumos, setInsumos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "", descripcion: "", rendimiento: 1
  });
  
  // Ingredients state for the recipe being edited
  const [recetaIngredientes, setRecetaIngredientes] = useState<any[]>([]);
  const [newIngrediente, setNewIngrediente] = useState({ insumo_id: "", cantidad: 0, merma: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resRec, resIns] = await Promise.all([
        fetch("/api/admin/recetas"),
        fetch("/api/admin/insumos")
      ]);
      if (resRec.ok && resIns.ok) {
        setRecetas(await resRec.json());
        setInsumos(await resIns.json());
      }
    } catch (e) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isNew = !editingId;
      const url = isNew ? `/api/admin/recetas` : `/api/admin/recetas/${editingId}`;
      const method = isNew ? "POST" : "PUT";
      
      const payload = isNew 
        ? formData
        : { ...formData, ingredientes: recetaIngredientes };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success(isNew ? "Receta creada. Ahora puedes editarla para agregar insumos." : "Receta actualizada");
        setShowModal(false);
        fetchData();
      } else {
        toast.error("Error al guardar");
      }
    } catch (e) {
      toast.error("Error al guardar");
    }
  };

  const addIngredientToForm = () => {
    if (!newIngrediente.insumo_id || newIngrediente.cantidad <= 0) return;
    const insumoRef = insumos.find(i => i.id === newIngrediente.insumo_id);
    
    setRecetaIngredientes([...recetaIngredientes, { 
      ...newIngrediente, 
      insumo: insumoRef
    }]);
    setNewIngrediente({ insumo_id: "", cantidad: 0, merma: 0 });
  };

  const removeIngredientFromForm = (idx: number) => {
    const arr = [...recetaIngredientes];
    arr.splice(idx, 1);
    setRecetaIngredientes(arr);
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Recetas ({recetas.length})</h1>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ nombre: "", descripcion: "", rendimiento: 1 });
            setRecetaIngredientes([]);
            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-4 py-2 rounded-xl transition-colors"
        >
          + Nueva Receta
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : recetas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No hay recetas registradas.</div>
      ) : (
        <div className="space-y-3">
          {recetas.map((receta) => (
            <div key={receta.id} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{receta.nombre}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      Rinde: {receta.rendimiento}
                    </span>
                    {receta.ingredientes.length > 0 && (
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                        {receta.ingredientes.length} insumo{receta.ingredientes.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Costo total: ${Number(receta.costo_total).toFixed(2)}
                    {receta.rendimiento > 1 && ` · Por porción: $${(Number(receta.costo_total) / receta.rendimiento).toFixed(2)}`}
                  </p>
                  {receta.ingredientes.length > 0 && (
                    <div className="text-xs text-gray-500 mt-2">
                      {receta.ingredientes.map((ing: any, i: number) => (
                        <span key={ing.id}>
                          {ing.cantidad} {ing.insumo.unidad_medida} {ing.insumo.nombre}
                          {ing.merma > 0 && <span className="text-red-400"> (+{ing.merma}%)</span>}
                          {i < receta.ingredientes.length - 1 ? " · " : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-lg font-bold text-orange-500">${(Number(receta.costo_total) / receta.rendimiento).toFixed(2)}</span>
                  <button 
                    onClick={() => {
                      setEditingId(receta.id);
                      setFormData({ nombre: receta.nombre, descripcion: receta.descripcion || "", rendimiento: receta.rendimiento });
                      setRecetaIngredientes(receta.ingredientes.map((i: any) => ({
                        insumo_id: i.insumo_id, cantidad: i.cantidad, merma: i.merma, insumo: i.insumo
                      })));
                      setShowModal(true);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm w-full max-w-2xl p-5 my-8 space-y-4">
            <h2 className="font-semibold text-gray-800">{editingId ? "Editar Receta" : "Nueva Receta"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                  <input required type="text" className={inputCls}
                    value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rendimiento (Porciones)</label>
                  <input required type="number" step="0.1" className={inputCls}
                    value={formData.rendimiento} onChange={e => setFormData({...formData, rendimiento: Number(e.target.value)})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                <textarea rows={2} className={inputCls + " resize-none"}
                  value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
              </div>

              {editingId && (
                <div className="pt-2 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ingredientes</h3>
                  
                  {recetaIngredientes.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {recetaIngredientes.map((ing, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-xl text-sm">
                          <span>{ing.cantidad} {ing.insumo?.unidad_medida} — {ing.insumo?.nombre} {ing.merma > 0 && `(${ing.merma}% merma)`}</span>
                          <button type="button" onClick={() => removeIngredientFromForm(idx)} className="text-red-400 hover:text-red-600 p-1">✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 items-end bg-gray-50 p-3 rounded-xl">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Insumo</label>
                      <select className={inputCls + " bg-white"}
                        value={newIngrediente.insumo_id} onChange={e => setNewIngrediente({...newIngrediente, insumo_id: e.target.value})}>
                        <option value="">Seleccionar...</option>
                        {insumos.map(ins => (
                          <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidad_medida})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Cant.</label>
                      <input type="number" step="0.01" className={inputCls}
                        value={newIngrediente.cantidad} onChange={e => setNewIngrediente({...newIngrediente, cantidad: Number(e.target.value)})} />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-500 mb-1">% Merma</label>
                      <input type="number" step="0.1" className={inputCls}
                        value={newIngrediente.merma} onChange={e => setNewIngrediente({...newIngrediente, merma: Number(e.target.value)})} />
                    </div>
                    <button type="button" onClick={addIngredientToForm} className="bg-gray-800 text-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-900 transition-colors">Agregar</button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm px-5 py-2 rounded-xl transition-colors">Guardar Receta</button>
                <button type="button" onClick={() => setShowModal(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
