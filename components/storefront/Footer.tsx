const NAV_LINKS = [
  { label: "Menú del día",    href: "#menu" },
  { label: "Cómo funciona",  href: "#como-funciona" },
  { label: "Contacto",       href: "#contacto" },
];

const INFO_ITEMS = [
  "Lunes a viernes · 8 a 18hs",
  "CABA y GBA",
  "Efectivo · Transferencia bancaria",
];

export function Footer() {
  return (
    <footer id="contacto" className="bg-[#111111]">

      {/* ── Contenido principal ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">

        {/* Columna 1 — Marca */}
        <div>
          <p className="font-display text-[24px] font-bold text-brand-primary leading-none mb-1">
            Tuco
          </p>
          <p className="font-body text-[12px] italic text-white/40 mb-4">fatto in casa</p>
          <p className="font-body text-[14px] text-white/55 leading-relaxed max-w-[240px] mb-6">
            Viandas caseras en Buenos Aires.
            Cocinamos con amor para que vos no tengas que hacerlo.
          </p>
          <a
            href="https://wa.me/5491100000000"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-body text-[14px] text-white/70 hover:text-white transition-colors"
          >
            <WhatsAppIcon />
            Escribinos
          </a>
        </div>

        {/* Columna 2 — Navegación */}
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.15em] text-white/40 mb-5">
            Menú
          </p>
          <ul className="space-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-body text-[14px] text-white/70 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3 — Info */}
        <div>
          <p className="font-body text-[11px] uppercase tracking-[0.15em] text-white/40 mb-5">
            Info
          </p>
          <ul className="space-y-3">
            {INFO_ITEMS.map((item) => (
              <li key={item} className="font-body text-[14px] text-white/70">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Copyright ───────────────────────────────────────────────────── */}
      <div className="border-t border-white/10 py-6 text-center">
        <p className="font-body text-[13px] text-white/30">
          © 2026 Tuco · Tutti i diritti riservati
        </p>
      </div>
    </footer>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
