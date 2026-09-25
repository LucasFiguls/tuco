import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductoVacio, getProductosVacio } from "@/lib/vacio-data";
import { getVacioPageContext, vacioMetadata } from "@/lib/vacio-page";
import { METODO_LABEL, TIPO_LABEL } from "@/lib/vacio";
import { getTag } from "@/lib/tags";
import { VacioShell } from "@/components/vacio/VacioShell";
import { ProductoImagen } from "@/components/vacio/ProductoImagen";
import { BotonSumar } from "@/components/vacio/BotonSumar";
import { ProductoCard } from "@/components/vacio/ProductoCard";
import { FreezerIcon, HeladeraIcon, MetodoIcon } from "@/components/vacio/Iconos";
import { Accordion } from "@/components/storefront/Accordion";
import { NutritionGrid } from "@/components/storefront/NutritionGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductoVacio(slug);
  return vacioMetadata({
    title: p ? `${p.nombre} — Tuco al vacío` : "Tuco al vacío",
    description: p?.tagline ?? "Vianda casera envasada al vacío.",
  });
}

function precio(n: number) {
  return "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

export default async function PlatoPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, ctx] = await Promise.all([params, getVacioPageContext()]);
  const producto = await getProductoVacio(slug, { preview: ctx.preview });
  if (!producto) notFound();

  const todos = producto.va_bien_con.length ? await getProductosVacio({ preview: ctx.preview }) : [];
  const combina = todos.filter((p) => producto.va_bien_con.includes(p.id)).slice(0, 3);
  const tieneNutricion = [producto.calorias, producto.proteinas, producto.carbohidratos, producto.grasas].some((v) => v !== null);

  return (
    <VacioShell whatsapp={ctx.config.whatsapp_numero}>
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-16">
        <nav className="font-body text-sm text-brand-muted mb-6">
          <Link href="/armar" className="hover:text-brand-primary">
            ← Volver al armador
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ── Fotos ──────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-card overflow-hidden bg-brand-cream">
              <ProductoImagen src={producto.foto_url} alt={producto.nombre} priority sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            {producto.foto_bolsa_url && (
              <div className="relative aspect-[16/7] rounded-card overflow-hidden bg-brand-cream">
                <ProductoImagen src={producto.foto_bolsa_url} alt={`${producto.nombre}, envasado al vacío`} sizes="(min-width: 1024px) 50vw, 100vw" />
                <span className="absolute bottom-3 left-3 bg-white/95 font-body text-xs font-semibold px-3 py-1 rounded-btn">
                  Así llega a tu casa
                </span>
              </div>
            )}
          </div>

          {/* ── Info ───────────────────────────────────────────────────── */}
          <div>
            {!producto.disponible && (
              <p className="mb-4 font-body text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-input px-4 py-2">
                Vista previa: este producto no está disponible.
              </p>
            )}
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-2">
              {TIPO_LABEL[producto.tipo]}
              {!!producto.porcion_gramos && ` · ${producto.porcion_gramos} g`}
            </p>
            <h1 className="font-display font-bold text-brand-dark text-[32px] md:text-[44px] leading-tight mb-3">{producto.nombre}</h1>
            {producto.tagline && <p className="font-body text-lg text-brand-muted mb-4">{producto.tagline}</p>}
            {producto.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {producto.tags.map((t) => {
                  const tag = getTag(t);
                  return (
                    <span key={t} className={`font-body text-xs px-2.5 py-1 rounded-btn ${tag.className}`}>
                      {tag.label}
                    </span>
                  );
                })}
              </div>
            )}
            <p className="font-body text-2xl font-bold text-brand-dark mb-5">{precio(producto.precio)}</p>
            <div className="max-w-xs mb-8">
              <BotonSumar producto={producto} size="md" label="Sumar a mi caja" />
            </div>

            {/* Regeneración */}
            {producto.regeneracion.length > 0 && (
              <section className="bg-white rounded-card shadow-card p-5 mb-4">
                <h2 className="font-display text-xl font-bold text-brand-dark mb-4">Cómo regenerarlo</h2>
                <ul className="space-y-3">
                  {producto.regeneracion.map((r) => (
                    <li key={r.metodo} className="flex gap-3">
                      <span className="w-10 h-10 shrink-0 rounded-full bg-brand-cream text-brand-primary flex items-center justify-center">
                        <MetodoIcon metodo={r.metodo} />
                      </span>
                      <div className="font-body">
                        <p className="font-semibold text-brand-dark">
                          {METODO_LABEL[r.metodo]} · {r.minutos} min
                        </p>
                        {r.pasos && <p className="text-sm text-brand-muted">{r.pasos}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
                <Link href="/como-regenerar" className="inline-block mt-4 font-body text-sm font-semibold text-brand-primary hover:text-brand-primary-hover">
                  Guía general de regeneración →
                </Link>
              </section>
            )}

            {/* Conservación */}
            {!!(producto.dias_heladera || producto.meses_freezer) && (
              <section className="bg-brand-frio-light rounded-card p-5 mb-4 font-body">
                <h2 className="font-display text-xl font-bold text-brand-dark mb-3">Conservación</h2>
                <ul className="space-y-2 text-brand-dark">
                  {!!producto.dias_heladera && (
                    <li className="flex items-center gap-3">
                      <span className="text-brand-frio"><HeladeraIcon /></span>
                      Heladera: hasta {producto.dias_heladera} días cerrado
                    </li>
                  )}
                  {!!producto.meses_freezer && (
                    <li className="flex items-center gap-3">
                      <span className="text-brand-frio"><FreezerIcon /></span>
                      Freezer: hasta {producto.meses_freezer} {producto.meses_freezer === 1 ? "mes" : "meses"}
                    </li>
                  )}
                </ul>
                <p className="text-sm text-brand-muted mt-3">Para descongelar, pasalo a la heladera la noche anterior.</p>
              </section>
            )}

            {/* Detalle */}
            <div className="border-b border-brand-border">
              {producto.descripcion && (
                <Accordion title="Descripción" defaultOpen>
                  <p className="font-body text-[15px] leading-relaxed text-brand-muted">{producto.descripcion}</p>
                </Accordion>
              )}
              {producto.ingredientes && (
                <Accordion title="Ingredientes">
                  <p className="font-body text-[15px] leading-relaxed text-brand-muted">{producto.ingredientes}</p>
                </Accordion>
              )}
              {producto.alergenos && (
                <Accordion title="Alérgenos">
                  <p className="font-body text-[15px] leading-relaxed text-brand-muted">{producto.alergenos}</p>
                </Accordion>
              )}
              {tieneNutricion && (
                <Accordion title="Información nutricional">
                  <NutritionGrid
                    calorias={producto.calorias}
                    proteinas={producto.proteinas}
                    carbohidratos={producto.carbohidratos}
                    grasas={producto.grasas}
                  />
                </Accordion>
              )}
            </div>
          </div>
        </div>

        {combina.length > 0 && (
          <section className="mt-16">
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-2">Combiná</p>
            <h2 className="font-display font-bold text-brand-dark text-[28px] md:text-[36px] leading-tight mb-6">Va bien con…</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {combina.map((p) => (
                <ProductoCard key={p.id} producto={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </VacioShell>
  );
}
