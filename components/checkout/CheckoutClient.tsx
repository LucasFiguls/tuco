"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/storefront/CartContext";
import type { CheckoutData } from "@/lib/types";
import { descuentoCaja, fechaMinimaEntrega, type VacioConfig } from "@/lib/vacio";

const MAX_VOUCHERS = 10;

interface VoucherAplicado {
  codigo: string;
  valido: boolean;
  empresa: string | null;
  motivo: string | null;
}

const HORARIOS = [
  "12:00", "12:30", "13:00", "13:30", "14:00",
  "19:00", "19:30", "20:00", "20:30", "21:00",
];

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

interface CheckoutClientProps {
  vacio: VacioConfig;
  /** Con la línea al vacío activa, los vouchers corporativos quedan ocultos. */
  vouchersVisibles: boolean;
}

export function CheckoutClient({ vacio, vouchersVisibles }: CheckoutClientProps) {
  const { items, total, clear, caja, count } = useCart();
  // Pedido de caja al vacío: todas las bolsas de la línea VACIO y un tamaño elegido
  const esCaja = caja !== null && items.length > 0 && items.every((i) => i.linea === "VACIO");
  const fechaMin = esCaja ? fechaMinimaEntrega(vacio.anticipacionHoras) : getTodayDate();
  const horarios = esCaja ? vacio.franjas : HORARIOS;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [telefonoTouched, setTelefonoTouched] = useState(false);
  const [vouchers, setVouchers] = useState<VoucherAplicado[]>([]);
  const [voucherInput, setVoucherInput] = useState("");
  const [validando, setValidando] = useState(false);

  const [form, setForm] = useState<CheckoutData>({
    cliente_nombre: "",
    cliente_telefono: "",
    modalidad: "RETIRO",
    direccion_entrega: "",
    fecha_entrega: fechaMin,
    hora_entrega: horarios[0],
    comentarios: "",
  });

  // El carrito se lee de localStorage después del primer render: si la fecha o la
  // franja elegidas no valen para una caja, se usan las primeras válidas
  const fechaEntrega = form.fecha_entrega >= fechaMin ? form.fecha_entrega : fechaMin;
  const horaEntrega = horarios.includes(form.hora_entrega) ? form.hora_entrega : horarios[0];

  function set(field: keyof CheckoutData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validarTelefono(tel: string): string {
    if (!tel.trim()) return "El teléfono es obligatorio";
    const digitos = tel.replace(/[\s\-\.\(\)\+]/g, "");
    if (!/^\d+$/.test(digitos)) return "Solo se permiten dígitos (ej: 1157571366)";
    if (digitos.length !== 10) return "Ingresá 10 dígitos sin el 0 ni el 15 (ej: 1157571366)";
    return "";
  }

  const telefonoError = telefonoTouched ? validarTelefono(form.cliente_telefono) : "";

  // Estimación en el cliente (el servidor recalcula): cada voucher cubre la vianda más cara
  const unidades = items.flatMap((i) => Array.from({ length: i.cantidad }, () => i.precio)).sort((a, b) => b - a);
  const validos = vouchers.filter((v) => v.valido);
  const descuento = esCaja ? 0 : unidades.slice(0, validos.length).reduce((s, p) => s + p, 0);
  const descCaja = esCaja ? descuentoCaja(total, caja!, vacio.cajas) : 0;
  const pctCaja = esCaja ? (vacio.cajas.find((c) => c.tamano === caja)?.descuento ?? 0) : 0;
  const envio = esCaja && form.modalidad === "DELIVERY" ? vacio.costoEnvio : 0;
  const cajaIncompleta = esCaja && count !== caja;
  const totalAPagar = total - descuento - descCaja + envio;
  const maxVouchers = Math.min(MAX_VOUCHERS, unidades.length);

  async function aplicarVoucher() {
    const codigo = voucherInput.trim();
    if (!codigo) return;
    if (validos.length >= maxVouchers) {
      setError(`Podés usar hasta ${maxVouchers} voucher${maxVouchers === 1 ? "" : "s"} en este pedido`);
      return;
    }
    setValidando(true);
    setError("");
    try {
      const res = await fetch("/api/vouchers/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigos: [codigo] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No pudimos validar el código");
      const r: VoucherAplicado = data.resultados[0];
      setVouchers((prev) => [...prev.filter((v) => v.codigo !== r.codigo), r]);
      if (r.valido) setVoucherInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setValidando(false);
    }
  }

  function quitarVoucher(codigo: string) {
    setVouchers((prev) => prev.filter((v) => v.codigo !== codigo));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!items.length) {
      setError("Tu carrito está vacío");
      return;
    }
    if (cajaIncompleta) {
      setError(`Tu caja tiene ${count} de ${caja} viandas. Completala antes de confirmar.`);
      return;
    }

    setTelefonoTouched(true);
    const telError = validarTelefono(form.cliente_telefono);
    if (telError) {
      setError(telError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkout: { ...form, fecha_entrega: fechaEntrega, hora_entrega: horaEntrega },
          items: items.map((i) => ({ id: i.id, cantidad: i.cantidad })),
          vouchers: esCaja ? [] : validos.map((v) => v.codigo),
          caja: esCaja ? caja : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al crear el pedido");
      }

      const pedido = await res.json();

      // Guardamos el resumen en sessionStorage para la pantalla de confirmación
      sessionStorage.setItem(
        "tuco_last_order",
        JSON.stringify({
          numero: pedido.numero_pedido,
          items,
          subtotal: total,
          descuento: Number(pedido.descuento_vouchers ?? 0),
          vouchers: validos.length,
          caja: esCaja ? caja : null,
          descuentoCaja: Number(pedido.descuento_caja ?? 0),
          envio: Number(pedido.costo_envio ?? 0),
          total: Number(pedido.total),
          modalidad: form.modalidad,
          nombre: form.cliente_nombre,
        })
      );

      clear();
      router.push(`/confirmacion?numero=${pedido.numero_pedido}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🛒</p>
          <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
          <button onClick={() => router.push(vouchersVisibles ? "/" : "/armar")} className="text-orange-500 font-medium">
            {vouchersVisibles ? "Ver menú" : "Armá tu caja"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            ← Volver
          </button>
          <h1 className="text-lg font-bold text-gray-900">Confirmar pedido</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">{esCaja ? `Tu caja de ${caja}` : "Resumen"}</h2>
            {esCaja && (
              <button type="button" onClick={() => router.push("/armar")} className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                Editar caja
              </button>
            )}
          </div>
          {cajaIncompleta && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3">
              Tu caja tiene {count} de {caja} viandas.{" "}
              <button type="button" onClick={() => router.push("/armar")} className="font-semibold underline">
                Completala
              </button>
            </p>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span className="text-gray-700">
                {item.cantidad}× {item.nombre}
              </span>
              <span className="font-medium">${(item.precio * item.cantidad).toLocaleString("es-AR")}</span>
            </div>
          ))}
          {descuento > 0 && (
            <>
              <div className="flex justify-between text-sm pt-3 border-t mt-3 text-gray-600">
                <span>Subtotal</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-sm py-1 text-violet-700 font-medium">
                <span>🎟 {validos.length} voucher{validos.length === 1 ? "" : "s"}</span>
                <span>−${descuento.toLocaleString("es-AR")}</span>
              </div>
            </>
          )}
          {esCaja && (descCaja > 0 || envio > 0) && (
            <>
              <div className="flex justify-between text-sm pt-3 border-t mt-3 text-gray-600">
                <span>Subtotal</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>
              {descCaja > 0 && (
                <div className="flex justify-between text-sm py-1 text-orange-600 font-medium">
                  <span>Descuento caja de {caja} (−{pctCaja}%)</span>
                  <span>−${descCaja.toLocaleString("es-AR")}</span>
                </div>
              )}
              {envio > 0 && (
                <div className="flex justify-between text-sm py-1 text-gray-600">
                  <span>Envío</span>
                  <span>${envio.toLocaleString("es-AR")}</span>
                </div>
              )}
            </>
          )}
          <div className={`flex justify-between font-bold text-base pt-3 border-t ${descuento > 0 || descCaja > 0 || envio > 0 ? "mt-1" : "mt-3"}`}>
            <span>{descuento > 0 || descCaja > 0 || envio > 0 ? "Total a pagar" : "Total"}</span>
            <span>${totalAPagar.toLocaleString("es-AR")}</span>
          </div>
        </div>

        {/* ── Vouchers de empresa ───────────────────────────────────────── */}
        {vouchersVisibles && !esCaja && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-1">¿Tenés vouchers de tu empresa?</h2>
          <p className="text-xs text-gray-500 mb-3">Cada voucher cubre una vianda del pedido.</p>
          <div className="flex gap-2">
            <input
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  aplicarVoucher();
                }
              }}
              placeholder="TUCO-XXXX-XXXX"
              maxLength={20}
              autoComplete="off"
              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="button"
              onClick={aplicarVoucher}
              disabled={validando || !voucherInput.trim()}
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border border-orange-500 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
            >
              {validando ? "…" : "Aplicar"}
            </button>
          </div>
          {vouchers.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {vouchers.map((v) => (
                <li
                  key={v.codigo}
                  className={`inline-flex items-center gap-2 text-xs font-medium rounded-full pl-3 pr-1.5 py-1 ${
                    v.valido ? "bg-violet-50 text-violet-800" : "bg-red-50 text-red-700"
                  }`}
                >
                  <span className="font-mono">{v.codigo}</span>
                  <span className="opacity-70">{v.valido ? `· ${v.empresa}` : `· ${v.motivo}`}</span>
                  <button
                    type="button"
                    onClick={() => quitarVoucher(v.codigo)}
                    aria-label={`Quitar ${v.codigo}`}
                    className="w-5 h-5 rounded-full hover:bg-black/10 leading-none"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-800">Tus datos</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre y apellido</label>
              <input
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={form.cliente_nombre}
                onChange={(e) => set("cliente_nombre", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="tel"
                inputMode="tel"
                placeholder="Ej: 1157571366"
                className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
                  telefonoError
                    ? "border-red-400 focus:ring-red-200"
                    : telefonoTouched && !telefonoError
                      ? "border-green-400 focus:ring-green-200"
                      : "border-gray-200 focus:ring-orange-300"
                }`}
                value={form.cliente_telefono}
                onChange={(e) => set("cliente_telefono", e.target.value)}
                onBlur={() => setTelefonoTouched(true)}
              />
              {telefonoError && (
                <p className="mt-1 text-xs text-red-500">{telefonoError}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-800">Entrega</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
              <div className="flex gap-3">
                {(["RETIRO", "DELIVERY"] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => set("modalidad", m)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      form.modalidad === m
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {m === "RETIRO" ? "🏠 Retiro en local" : esCaja ? "🛵 Envío a domicilio" : "🛵 Delivery"}
                  </button>
                ))}
              </div>
            </div>

            {form.modalidad === "DELIVERY" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  value={form.direccion_entrega}
                  onChange={(e) => set("direccion_entrega", e.target.value)}
                  placeholder="Calle 123, Piso 2, Depto B"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{esCaja ? "Fecha de entrega" : "Fecha"}</label>
                <input
                  required
                  type="date"
                  min={fechaMin}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  value={fechaEntrega}
                  onChange={(e) => set("fecha_entrega", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{esCaja ? "Franja horaria" : "Hora"}</label>
                <select
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  value={horaEntrega}
                  onChange={(e) => set("hora_entrega", e.target.value)}
                >
                  {horarios.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {esCaja && (
              <p className="text-xs text-gray-500 -mt-1">
                Cocinamos tu caja para vos: pedí con al menos {vacio.anticipacionHoras} hs de anticipación.
                {vacio.costoEnvio > 0 && ` Envío: $${vacio.costoEnvio.toLocaleString("es-AR")}. Retiro sin costo.`}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentarios adicionales
              </label>
              <textarea
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                value={form.comentarios}
                onChange={(e) => set("comentarios", e.target.value)}
                placeholder="Alergias, aclaraciones, etc."
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-base transition-colors"
          >
            {loading ? "Procesando..." : "Enviar pedido"}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Al confirmar, recibiremos tu pedido y te contactaremos para coordinar
          </p>
        </form>
      </div>
    </div>
  );
}
