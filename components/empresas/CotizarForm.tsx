"use client";

import { useState } from "react";
import { PAQUETES, PAQUETE_LABEL, WHATSAPP_EMPRESAS_MSG, type PaqueteId } from "@/lib/empresas-content";
import { buildWaLink } from "@/lib/whatsapp";

interface CotizarFormProps {
  paqueteInicial?: PaqueteId;
  whatsapp?: string;
}

const INPUT =
  "w-full bg-white border border-brand-border rounded-input px-4 py-3 font-body text-[15px] text-brand-dark placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors";

const EMPTY = {
  empresa: "",
  contacto_nombre: "",
  cargo: "",
  email: "",
  telefono: "",
  cantidad_empleados: "",
  zona: "",
  comentarios: "",
  website: "", // honeypot
};

export function CotizarForm({ paqueteInicial = "P75", whatsapp }: CotizarFormProps) {
  const [form, setForm] = useState(EMPTY);
  const [paquete, setPaquete] = useState<PaqueteId>(paqueteInicial);
  const [status, setStatus] = useState<"idle" | "sending" | "ok">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  function set(field: keyof typeof EMPTY, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, paquete_interes: paquete }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.fields ?? {});
        throw new Error(data.error ?? "No pudimos enviar tu consulta");
      }
      setStatus("ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setStatus("idle");
    }
  }

  return (
    <section id="cotizar" className="bg-brand-dark py-16 md:py-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">

        {/* ── Copy ────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">
            Cotizá ahora
          </p>
          <h2 className="font-display font-bold text-white text-[32px] md:text-[48px] leading-tight mb-5">
            Armemos el convenio de tu equipo
          </h2>
          <p className="font-body text-base text-white/70 leading-relaxed mb-8">
            Contanos un poco de tu empresa y te enviamos una propuesta con el precio por vianda para el
            paquete que mejor les quede. Respondemos en menos de 24 hs hábiles.
          </p>
          {whatsapp && (
            <a
              href={buildWaLink(whatsapp, WHATSAPP_EMPRESAS_MSG)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-body text-[15px] font-semibold text-white/80 hover:text-white transition-colors"
            >
              ¿Preferís WhatsApp? Escribinos →
            </a>
          )}
        </div>

        {/* ── Formulario ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 bg-brand-cream rounded-card p-6 md:p-8">
          {status === "ok" ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">🍝</p>
              <h3 className="font-display text-[28px] font-bold text-brand-dark mb-2">¡Gracias!</h3>
              <p className="font-body text-brand-muted max-w-sm mx-auto">
                Recibimos tu consulta. En breve te contactamos con la propuesta para{" "}
                <strong className="text-brand-dark">{form.empresa}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <fieldset>
                <legend className="font-body text-sm font-semibold text-brand-dark mb-2">Paquete de interés</legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PAQUETES.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPaquete(p.id)}
                      aria-pressed={paquete === p.id}
                      className={`rounded-input border px-3 py-2.5 font-body text-sm font-medium transition-all duration-200 ${
                        paquete === p.id
                          ? "bg-brand-primary border-brand-primary text-white"
                          : "bg-white border-brand-border text-brand-dark hover:border-brand-primary"
                      }`}
                    >
                      {PAQUETE_LABEL[p.id]}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Empresa" error={errors.empresa}>
                  <input className={INPUT} value={form.empresa} onChange={(e) => set("empresa", e.target.value)} maxLength={120} required autoComplete="organization" />
                </Field>
                <Field label="Cantidad de empleados" error={errors.cantidad_empleados} optional>
                  <input className={INPUT} type="number" inputMode="numeric" min={1} max={100000} value={form.cantidad_empleados} onChange={(e) => set("cantidad_empleados", e.target.value)} />
                </Field>
                <Field label="Tu nombre" error={errors.contacto_nombre}>
                  <input className={INPUT} value={form.contacto_nombre} onChange={(e) => set("contacto_nombre", e.target.value)} maxLength={120} required autoComplete="name" />
                </Field>
                <Field label="Cargo" error={errors.cargo} optional>
                  <input className={INPUT} value={form.cargo} onChange={(e) => set("cargo", e.target.value)} maxLength={80} autoComplete="organization-title" />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input className={INPUT} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} maxLength={160} required autoComplete="email" />
                </Field>
                <Field label="Teléfono" error={errors.telefono}>
                  <input className={INPUT} type="tel" inputMode="tel" placeholder="Ej: 1157571366" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} maxLength={30} required autoComplete="tel" />
                </Field>
              </div>

              <Field label="Zona / barrio de la oficina" error={errors.zona}>
                <input className={INPUT} placeholder="Ej: Palermo, CABA" value={form.zona} onChange={(e) => set("zona", e.target.value)} maxLength={120} required />
              </Field>

              <Field label="Comentarios" error={errors.comentarios} optional>
                <textarea className={`${INPUT} resize-none`} rows={3} value={form.comentarios} onChange={(e) => set("comentarios", e.target.value)} maxLength={1000} placeholder="Restricciones alimentarias, varias sedes, fecha de inicio…" />
              </Field>

              {/* Honeypot: invisible para personas, los bots lo completan */}
              <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
                </label>
              </div>

              {error && (
                <p className="font-body text-sm text-red-700 bg-red-50 border border-red-100 rounded-input px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full inline-flex items-center justify-center font-body font-semibold rounded-btn px-6 py-4 text-base bg-brand-primary text-white hover:bg-brand-primary-hover transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
              >
                {status === "sending" ? "Enviando…" : "Quiero mi propuesta"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block font-body text-sm font-medium text-brand-dark mb-1.5">
        {label} {optional && <span className="text-brand-muted font-normal">(opcional)</span>}
      </span>
      {children}
      {error && <span className="block mt-1 font-body text-xs text-red-600">{error}</span>}
    </label>
  );
}
