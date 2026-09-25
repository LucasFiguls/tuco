import Link from "next/link";
import type { ProductoVacio } from "@/lib/vacio-data";
import { TIPO_LABEL, minutosMinimos } from "@/lib/vacio";
import { getTag } from "@/lib/tags";
import { ProductoImagen } from "./ProductoImagen";
import { BotonSumar } from "./BotonSumar";

function precio(n: number) {
  return "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

export function ProductoCard({ producto, priority = false }: { producto: ProductoVacio; priority?: boolean }) {
  const minutos = minutosMinimos(producto.regeneracion);
  return (
    <div className="group bg-white rounded-card overflow-hidden flex flex-col shadow-card hover:shadow-card-hover transition-all duration-200">
      <Link href={`/platos/${producto.slug}`} className="block">
        <div className="relative aspect-[4/3] bg-brand-cream overflow-hidden">
          <ProductoImagen src={producto.foto_url} alt={producto.nombre} priority={priority} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw" />
          <span className="absolute top-3 left-3 bg-white/95 font-body text-[11px] font-semibold uppercase tracking-wider text-brand-dark px-2.5 py-1 rounded-btn">
            {TIPO_LABEL[producto.tipo]}
          </span>
          {!producto.disponible && (
            <span className="absolute top-3 right-3 bg-brand-dark text-white font-body text-[11px] font-semibold px-2.5 py-1 rounded-btn">
              No disponible
            </span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/platos/${producto.slug}`} className="block">
          <h3 className="font-display text-[18px] font-semibold text-brand-dark leading-snug group-hover:text-brand-primary transition-colors">
            {producto.nombre}
          </h3>
        </Link>
        {producto.tagline && <p className="font-body text-sm text-brand-muted mt-1 line-clamp-2">{producto.tagline}</p>}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {producto.tags.slice(0, 2).map((t) => {
            const tag = getTag(t);
            return (
              <span key={t} className={`font-body text-[11px] px-2 py-0.5 rounded-btn ${tag.className}`}>
                {tag.label}
              </span>
            );
          })}
        </div>
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between font-body text-sm mb-3">
            <span className="font-semibold text-brand-dark">{precio(producto.precio)}</span>
            <span className="text-brand-muted">
              {minutos !== null && `${minutos} min`}
              {minutos !== null && producto.porcion_gramos && " · "}
              {producto.porcion_gramos && `${producto.porcion_gramos} g`}
            </span>
          </div>
          <BotonSumar producto={producto} />
        </div>
      </div>
    </div>
  );
}
