import type { Metadata } from "next";
import Link from "next/link";
import { getVacioPageContext, vacioMetadata } from "@/lib/vacio-page";
import { FAQ_VACIO } from "@/lib/vacio-content";
import { VacioShell } from "@/components/vacio/VacioShell";
import { Accordion } from "@/components/storefront/Accordion";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return vacioMetadata({
    title: "Preguntas frecuentes — Tuco al vacío",
    description: "Conservación, regeneración, cajas, entrega y pagos de las viandas al vacío de Tuco.",
  });
}

export default async function PreguntasPage() {
  const ctx = await getVacioPageContext();
  return (
    <VacioShell whatsapp={ctx.config.whatsapp_numero}>
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-16">
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-2">Preguntas frecuentes</p>
        <h1 className="font-display font-bold text-brand-dark text-[32px] md:text-[48px] leading-tight mb-8">Todo sobre Tuco al vacío</h1>
        <div className="border-b border-brand-border">
          {FAQ_VACIO.map((f, i) => (
            <Accordion key={f.pregunta} title={f.pregunta} defaultOpen={i === 0}>
              <p className="font-body text-[15px] leading-relaxed text-brand-muted pr-8">{f.respuesta}</p>
            </Accordion>
          ))}
        </div>
        <p className="font-body text-brand-muted mt-8">
          ¿Te quedó otra duda?{" "}
          <a href="#contacto" className="font-semibold text-brand-primary hover:text-brand-primary-hover">
            Escribinos
          </a>
          . O directamente{" "}
          <Link href="/armar" className="font-semibold text-brand-primary hover:text-brand-primary-hover">
            armá tu caja
          </Link>
          .
        </p>
      </div>
    </VacioShell>
  );
}
