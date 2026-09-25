import Image from "next/image";
import Link from "next/link";
import { BENEFICIOS, METRICAS, TESTIMONIOS, FAQ } from "@/lib/empresas-content";
import { Accordion } from "@/components/storefront/Accordion";

// ── Hero ─────────────────────────────────────────────────────────────────────

export function EmpresasHero() {
  return (
    <section className="-mt-16 relative min-h-[80svh] md:min-h-[85vh] flex items-end md:items-center bg-brand-dark overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1920&q=80"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.55) 100%)",
            "linear-gradient(to right, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 100%)",
          ].join(", "),
        }}
      />
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16 pt-32 md:py-0 animate-slide-text">
        <p className="font-body text-xs tracking-[0.2em] text-brand-primary uppercase mb-4">
          Convenios corporativos
        </p>
        <h1 className="font-display font-bold text-white leading-[1.1] mb-5 text-[42px] md:text-[72px] max-w-3xl">
          La nonna, en tu oficina.
        </h1>
        <p className="font-body text-lg md:text-xl text-white/80 mb-8 max-w-xl">
          Un paquete mensual de vouchers para que tu equipo coma casero cuando quiera. Vos repartís
          los códigos; nosotros cocinamos.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="#cotizar"
            className="inline-flex items-center justify-center font-medium rounded-btn px-6 py-3 text-base bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors duration-200 active:scale-[0.98]"
          >
            Cotizá ahora
          </a>
          <a
            href="#paquetes"
            className="inline-flex items-center justify-center font-medium rounded-btn px-6 py-3 text-base border border-white text-white hover:bg-white/10 transition-colors duration-200"
          >
            Ver paquetes
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Métricas (DEMO) ──────────────────────────────────────────────────────────

export function MetricasEmpresas() {
  return (
    <section className="bg-white border-b border-brand-border">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {METRICAS.map((m) => (
          <div key={m.label}>
            <p className="font-display font-bold text-brand-primary text-[40px] leading-none">{m.valor}</p>
            <p className="font-body text-sm text-brand-muted mt-2">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Beneficios ───────────────────────────────────────────────────────────────

export function BeneficiosEmpresas() {
  return (
    <section className="bg-brand-cream py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">
            Por qué Tuco
          </p>
          <h2 className="font-display font-bold text-brand-dark text-[32px] md:text-[48px] leading-tight">
            Un beneficio que tu equipo sí usa
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFICIOS.map((b, i) => (
            <div key={b.titulo} className="bg-white rounded-card p-6 shadow-card">
              <span className="font-display text-[28px] font-bold text-brand-primary/40 leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-[20px] font-semibold text-brand-dark mt-3 mb-2">{b.titulo}</h3>
              <p className="font-body text-[15px] leading-relaxed text-brand-muted">{b.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Menú preview ─────────────────────────────────────────────────────────────

export function MenuPreview({
  items,
}: {
  items: Array<{ id: string; nombre: string; tagline: string | null; foto_url: string | null; categoria: string }>;
}) {
  if (!items.length) return null;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">
              Qué van a comer
            </p>
            <h2 className="font-display font-bold text-brand-dark text-[32px] md:text-[48px] leading-tight">
              Un vistazo al menú
            </h2>
          </div>
          <Link href="/#menu" className="font-body text-[15px] font-semibold text-brand-primary hover:text-brand-primary-hover">
            Ver el menú completo →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {items.map((it) => (
            <div key={it.id} className="bg-brand-cream rounded-card overflow-hidden">
              <div className="relative aspect-[4/3] bg-brand-light">
                {it.foto_url && (
                  <Image src={it.foto_url} alt={it.nombre} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
                )}
              </div>
              <div className="p-4">
                <p className="font-body text-[11px] uppercase tracking-wider text-brand-muted">{it.categoria}</p>
                <p className="font-display text-[18px] font-semibold text-brand-dark leading-snug">{it.nombre}</p>
                {it.tagline && <p className="font-body text-sm text-brand-muted mt-1 line-clamp-2">{it.tagline}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonios (DEMO) ───────────────────────────────────────────────────────

export function TestimoniosEmpresas() {
  return (
    <section className="bg-brand-light py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">
            Lo que dicen
          </p>
          <h2 className="font-display font-bold text-brand-dark text-[32px] md:text-[48px] leading-tight">
            Equipos que ya comen casero
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIOS.map((t) => (
            <figure key={t.autor} className="bg-white rounded-card p-6 shadow-card flex flex-col">
              <span aria-hidden className="font-display text-[56px] leading-none text-brand-primary/30">“</span>
              <blockquote className="font-body text-[15px] leading-relaxed text-brand-dark flex-1 -mt-4">
                {t.texto}
              </blockquote>
              <figcaption className="mt-5 pt-4 border-t border-brand-border">
                <p className="font-body text-sm font-semibold text-brand-dark">{t.autor}</p>
                <p className="font-body text-xs text-brand-muted">{t.cargo} · {t.empresa}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────

export function FaqEmpresas() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">
            Preguntas frecuentes
          </p>
          <h2 className="font-display font-bold text-brand-dark text-[32px] md:text-[48px] leading-tight">
            Todo sobre los vouchers
          </h2>
        </div>
        <div className="border-b border-brand-border">
          {FAQ.map((f) => (
            <Accordion key={f.pregunta} title={f.pregunta}>
              <p className="font-body text-[15px] leading-relaxed text-brand-muted pr-8">{f.respuesta}</p>
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
}
