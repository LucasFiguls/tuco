import Image from "next/image";

const PANELES = [
  {
    eyebrow: "Para vos",
    headline: "Comé rico,\nsin cocinar.",
    subheadline: "Viandas caseras, con retiro en el local o delivery.",
    image:
      "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1400&q=80",
    ctaPrimary: { label: "Ver el menú de hoy", href: "#menu" },
    ctaSecondary: { label: "Cómo funciona", href: "#como-funciona" },
  },
  {
    eyebrow: "Para tu empresa",
    headline: "La nonna,\nen tu oficina.",
    subheadline: "Paquetes mensuales de vouchers para que tu equipo coma casero.",
    image:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1400&q=80",
    ctaPrimary: { label: "Ver paquetes", href: "#empresas" },
    ctaSecondary: { label: "Cotizá tu convenio", href: "/empresas#cotizar" },
  },
] as const;

/** Hero de la home: B2C y B2B con el mismo peso visual. */
export function SplitHero() {
  return (
    <section className="-mt-16 grid grid-cols-1 md:grid-cols-2 bg-brand-dark">
      {PANELES.map((p, i) => (
        <div
          key={p.eyebrow}
          className="group relative overflow-hidden min-h-[70svh] md:min-h-[88vh] flex items-end"
        >
          <Image
            src={p.image}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.10) 35%, rgba(0,0,0,0.75) 100%)",
            }}
          />
          {i === 0 && (
            <div aria-hidden className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-white/15 z-10" />
          )}

          <div className="relative z-10 w-full px-6 pb-12 pt-28 md:px-12 md:pb-16 animate-slide-text">
            <p className="font-body text-xs tracking-[0.2em] text-brand-primary uppercase mb-4">
              {p.eyebrow}
            </p>
            <h1 className="font-display font-bold text-white whitespace-pre-line leading-[1.1] mb-4 text-[40px] md:text-[56px] lg:text-[64px]">
              {p.headline}
            </h1>
            <p className="font-body text-lg text-white/80 mb-8 max-w-md">{p.subheadline}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={p.ctaPrimary.href}
                className="inline-flex items-center justify-center font-medium rounded-btn px-6 py-3 text-base bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors duration-200 active:scale-[0.98]"
              >
                {p.ctaPrimary.label}
              </a>
              <a
                href={p.ctaSecondary.href}
                className="inline-flex items-center justify-center font-medium rounded-btn px-6 py-3 text-base border border-white text-white hover:bg-white/10 transition-colors duration-200"
              >
                {p.ctaSecondary.label}
              </a>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
