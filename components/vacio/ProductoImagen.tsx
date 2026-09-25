import Image from "next/image";

/** Foto del producto o, si todavía no hay, un placeholder de bolsa al vacío. */
export function ProductoImagen({
  src,
  alt,
  sizes,
  priority = false,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  if (src) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />;
  }
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-brand-frio-light text-brand-frio">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 3h12l-1 3H7z" />
        <path d="M7 6c-1 3-1 12 0 15h10c1-3 1-12 0-15" />
        <path d="M9 11h6M9 15h4" />
      </svg>
      <span className="font-body text-[11px] uppercase tracking-wider">Foto próximamente</span>
    </div>
  );
}
