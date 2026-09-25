import type { Metadata } from "next";
import Link from "next/link";
import { getVacioPageContext, vacioMetadata } from "@/lib/vacio-page";
import { METODOS, METODO_LABEL } from "@/lib/vacio";
import { CONSERVACION_GUIA, METODOS_GUIA } from "@/lib/vacio-content";
import { VacioShell } from "@/components/vacio/VacioShell";
import { MetodoIcon } from "@/components/vacio/Iconos";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return vacioMetadata({
    title: "Cómo regenerar tus viandas — Tuco al vacío",
    description: "Baño María, microondas, sartén u horno: cómo calentar cada vianda al vacío y cómo conservarla.",
  });
}

export default async function ComoRegenerarPage() {
  const ctx = await getVacioPageContext();
  return (
    <VacioShell whatsapp={ctx.config.whatsapp_numero}>
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-16">
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-2">Guía</p>
        <h1 className="font-display font-bold text-brand-dark text-[32px] md:text-[48px] leading-tight mb-4">Cómo regenerar tus viandas</h1>
        <p className="font-body text-lg text-brand-muted mb-10 max-w-2xl">
          Cada bolsa trae en su etiqueta los métodos y tiempos recomendados. Estos son los pasos generales; los tiempos
          exactos de cada producto están en su ficha y en el QR de la bolsa.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {METODOS.map((m) => (
            <section key={m} className="bg-white rounded-card shadow-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-11 h-11 rounded-full bg-brand-cream text-brand-primary flex items-center justify-center">
                  <MetodoIcon metodo={m} size={24} />
                </span>
                <h2 className="font-display text-xl font-bold text-brand-dark">{METODO_LABEL[m]}</h2>
              </div>
              <p className="font-body text-sm text-brand-muted mb-3">{METODOS_GUIA[m].resumen}</p>
              <ol className="font-body text-[15px] text-brand-dark space-y-1.5 list-decimal pl-5">
                {METODOS_GUIA[m].pasos.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <section className="bg-brand-frio-light rounded-card p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-brand-dark mb-5">Conservación</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CONSERVACION_GUIA.map((c) => (
              <div key={c.titulo}>
                <h3 className="font-body font-semibold text-brand-frio mb-1">{c.titulo}</h3>
                <p className="font-body text-[15px] text-brand-dark">{c.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center mt-10">
          <Link href="/armar" className="inline-flex items-center justify-center font-body font-semibold rounded-btn px-7 py-3.5 bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors">
            Armá tu caja
          </Link>
        </p>
      </div>
    </VacioShell>
  );
}
