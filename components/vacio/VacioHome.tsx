import Image from "next/image";
import Link from "next/link";
import type { ProductoVacio } from "@/lib/vacio-data";
import { CAJA_SUGERIDA, METODOS, METODO_LABEL, type Caja } from "@/lib/vacio";
import { COMBINACIONES, FAQ_VACIO, HERO_VACIO, PASOS_VACIO } from "@/lib/vacio-content";
import { Accordion } from "@/components/storefront/Accordion";
import { ProductoCard } from "./ProductoCard";
import { CajaIcon, FreezerIcon, HeladeraIcon, MetodoIcon } from "./Iconos";

const CTA =
  "inline-flex items-center justify-center font-body font-semibold rounded-btn px-7 py-3.5 text-base bg-brand-primary text-white hover:bg-brand-primary-hover transition-all duration-200 active:scale-[0.98]";

export function VacioHome({
  productos,
  cajas,
  heroImagen,
}: {
  productos: ProductoVacio[];
  cajas: Caja[];
  heroImagen?: string;
}) {
  return (
    <>
      <Hero imagen={heroImagen || HERO_VACIO.imagen} />
      <Pasos />
      <SelectorCajas cajas={cajas} />
      {productos.length > 0 && <Destacados productos={productos.slice(0, 8)} />}
      <Combina />
      <RegenerarConservar />
      <Faq />
      <CtaFinal />
    </>
  );
}

function Hero({ imagen }: { imagen: string }) {
  return (
    <section className="-mt-16 relative min-h-[88svh] flex items-end md:items-center bg-brand-dark overflow-hidden">
      <Image src={imagen} alt="" fill priority sizes="100vw" className="object-cover object-center" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.6) 100%)",
            "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 100%)",
          ].join(", "),
        }}
      />
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16 pt-32 md:py-0 animate-slide-text">
        <p className="font-body text-xs tracking-[0.2em] text-brand-primary uppercase mb-4">{HERO_VACIO.eyebrow}</p>
        <h1 className="font-display font-bold text-white whitespace-pre-line leading-[1.1] mb-5 text-[42px] md:text-[72px] max-w-3xl">
          {HERO_VACIO.titulo}
        </h1>
        <p className="font-body text-lg md:text-xl text-white/80 mb-8 max-w-xl">{HERO_VACIO.bajada}</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/armar" className={CTA}>
            Armá tu caja
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex items-center justify-center font-body font-medium rounded-btn px-7 py-3.5 text-base border border-white text-white hover:bg-white/10 transition-colors duration-200"
          >
            Cómo funciona
          </a>
        </div>
      </div>
    </section>
  );
}

function Pasos() {
  return (
    <section id="como-funciona" className="bg-brand-dark py-16 md:py-24 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">Así de simple</p>
          <h2 className="font-display font-bold text-white text-[32px] md:text-[48px] leading-tight">¿Cómo funciona?</h2>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PASOS_VACIO.map((p) => (
            <li key={p.numero} className="text-center lg:text-left">
              <span className="font-display text-[48px] font-bold leading-none text-brand-primary/40">{p.numero}</span>
              <h3 className="font-display text-[20px] text-white font-semibold mt-2 mb-2">{p.titulo}</h3>
              <p className="font-body text-[15px] leading-relaxed text-white/65">{p.descripcion}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SelectorCajas({ cajas }: { cajas: Caja[] }) {
  return (
    <section className="bg-brand-light py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">Elegí tu caja</p>
          <h2 className="font-display font-bold text-brand-dark text-[32px] md:text-[48px] leading-tight mb-4">
            ¿Cuántas viandas querés?
          </h2>
          <p className="font-body text-base md:text-lg text-brand-muted">
            Cada bolsa ocupa un lugar, sea un plato, una base, una guarnición o una salsa.{" "}
            <strong className="text-brand-dark">Cuanto más grande la caja, más ahorrás.</strong>
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {cajas.map((c) => {
            const sugerida = c.tamano === CAJA_SUGERIDA;
            return (
              <Link
                key={c.tamano}
                href={`/armar?caja=${c.tamano}`}
                className={`relative bg-white rounded-card p-6 text-center shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 ${
                  sugerida ? "ring-2 ring-brand-primary" : ""
                }`}
              >
                {sugerida && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white font-body text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-btn whitespace-nowrap">
                    La más elegida
                  </span>
                )}
                <span className="inline-flex text-brand-primary mb-2">
                  <CajaIcon size={28} />
                </span>
                <p className="font-display font-bold text-brand-dark text-5xl leading-none">{c.tamano}</p>
                <p className="font-body text-sm text-brand-muted mt-1 mb-4">viandas</p>
                <p className={`font-body text-sm font-semibold ${c.descuento ? "text-brand-primary" : "text-brand-muted"}`}>
                  {c.descuento ? `${c.descuento}% de descuento` : "Precio de lista"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Destacados({ productos }: { productos: ProductoVacio[] }) {
  return (
    <section className="bg-brand-cream py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">Esta semana en la cocina</p>
            <h2 className="font-display font-bold text-brand-dark text-[32px] md:text-[48px] leading-tight">Para llenar la heladera</h2>
          </div>
          <Link href="/armar" className="font-body text-[15px] font-semibold text-brand-primary hover:text-brand-primary-hover">
            Ver todo el menú →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {productos.map((p, i) => (
            <ProductoCard key={p.id} producto={p} priority={i < 4} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Combina() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">Combiná como quieras</p>
          <h2 className="font-display font-bold text-brand-dark text-[32px] md:text-[48px] leading-tight">
            Una base, una guarnición,
            <br className="hidden sm:block" /> una cena distinta
          </h2>
        </div>
        <div className="space-y-4">
          {COMBINACIONES.map((c) => (
            <div key={c.base} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-body">
              <span className="flex-1 bg-brand-cream rounded-card px-5 py-4 text-center font-semibold text-brand-dark">{c.base}</span>
              <span className="text-center text-2xl font-bold text-brand-primary" aria-hidden>+</span>
              <span className="flex-1 bg-brand-cream rounded-card px-5 py-4 text-center font-semibold text-brand-dark">{c.guarnicion}</span>
              <span className="text-center text-2xl font-bold text-brand-primary" aria-hidden>=</span>
              <span className="flex-1 bg-brand-primary/10 ring-2 ring-brand-primary rounded-card px-5 py-4 text-center font-semibold text-brand-dark">
                {c.resultado}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RegenerarConservar() {
  return (
    <section className="bg-brand-light py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-card p-8 shadow-card">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">Regenerala en minutos</p>
          <h2 className="font-display font-bold text-brand-dark text-[28px] md:text-[36px] leading-tight mb-6">
            Cada bolsa trae cómo calentarla
          </h2>
          <ul className="grid grid-cols-2 gap-3 mb-6">
            {METODOS.map((m) => (
              <li key={m} className="flex items-center gap-3 bg-brand-cream rounded-input px-4 py-3 font-body text-sm font-medium text-brand-dark">
                <span className="text-brand-primary">
                  <MetodoIcon metodo={m} />
                </span>
                {METODO_LABEL[m]}
              </li>
            ))}
          </ul>
          <Link href="/como-regenerar" className="font-body text-[15px] font-semibold text-brand-primary hover:text-brand-primary-hover">
            Ver la guía completa →
          </Link>
        </div>
        <div className="bg-brand-frio-light rounded-card p-8">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-frio mb-3">Heladera o freezer</p>
          <h2 className="font-display font-bold text-brand-dark text-[28px] md:text-[36px] leading-tight mb-6">
            El vacío conserva el sabor
          </h2>
          <ul className="space-y-4 font-body text-[15px] text-brand-dark">
            <li className="flex gap-3">
              <span className="text-brand-frio shrink-0">
                <HeladeraIcon />
              </span>
              <span>
                <strong>En la heladera</strong>, cerrada, dura los días que indica cada bolsa.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-brand-frio shrink-0">
                <FreezerIcon />
              </span>
              <span>
                <strong>En el freezer</strong> dura meses. Lo que no vayas a comer pronto, congelalo apenas llega.
              </span>
            </li>
          </ul>
          <p className="font-body text-sm text-brand-muted mt-6">Sin conservantes: solo cocina casera y envasado al vacío.</p>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">Preguntas frecuentes</p>
          <h2 className="font-display font-bold text-brand-dark text-[32px] md:text-[48px] leading-tight">Lo que siempre nos preguntan</h2>
        </div>
        <div className="border-b border-brand-border">
          {FAQ_VACIO.slice(0, 4).map((f) => (
            <Accordion key={f.pregunta} title={f.pregunta}>
              <p className="font-body text-[15px] leading-relaxed text-brand-muted pr-8">{f.respuesta}</p>
            </Accordion>
          ))}
        </div>
        <p className="text-center mt-6">
          <Link href="/preguntas" className="font-body text-[15px] font-semibold text-brand-primary hover:text-brand-primary-hover">
            Ver todas las preguntas →
          </Link>
        </p>
      </div>
    </section>
  );
}

function CtaFinal() {
  return (
    <section className="bg-brand-primary py-16 md:py-20">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-display font-bold text-white text-[32px] md:text-[48px] leading-tight mb-6">
          Tu heladera, llena de comida casera
        </h2>
        <Link
          href="/armar"
          className="inline-flex items-center justify-center font-body font-semibold rounded-btn px-8 py-4 text-base bg-white text-brand-primary hover:bg-brand-cream transition-all duration-200 active:scale-[0.98]"
        >
          Armá tu caja
        </Link>
      </div>
    </section>
  );
}
