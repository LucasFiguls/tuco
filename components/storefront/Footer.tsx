export function Footer() {
  return (
    <footer id="contacto" className="bg-tuco-brown text-tuco-cream">
      {/* Wave superior */}
      <div aria-hidden>
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8 block">
          <path d="M0 40 C360 0 1080 0 1440 40 L1440 0 L0 0Z" fill="#F5F0E8" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-10 pb-14 grid sm:grid-cols-2 md:grid-cols-3 gap-10">
        {/* Marca */}
        <div>
          <h3 className="font-serif text-3xl text-white font-bold mb-1">Tuco</h3>
          <p className="italic text-xs text-tuco-cream/60 mb-4">fatto in casa</p>
          <p className="text-sm text-tuco-cream/75 leading-relaxed">
            Viandas artesanales con el sabor de la cocina de siempre.
            Cocinamos con ingredientes frescos y mucho amor.
          </p>
          {/* Redes sociales */}
          <div className="flex gap-3 mt-5">
            <SocialLink label="Instagram" href="#">
              <InstagramIcon />
            </SocialLink>
            <SocialLink label="Facebook" href="#">
              <FacebookIcon />
            </SocialLink>
          </div>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contacto</h4>
          <ul className="space-y-3 text-sm text-tuco-cream/75">
            <li className="flex items-start gap-2">
              <PinIcon />
              <span>Buenos Aires, Argentina</span>
            </li>
            <li className="flex items-start gap-2">
              <ClockIcon />
              <span>Lun–Vie, 10:00–20:00 hs</span>
            </li>
            <li>
              <a
                href="https://wa.me/5491100000000"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-tuco-green hover:text-white transition-colors font-medium"
              >
                <WhatsAppIcon />
                Escribinos por WhatsApp
              </a>
            </li>
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Pedidos</h4>
          <ul className="space-y-2 text-sm text-tuco-cream/75">
            <li>Retiro en local sin costo</li>
            <li>Delivery según zona</li>
            <li>Pedí antes de las 18 hs</li>
            <li>Pagá con transferencia</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-tuco-cream/10 text-center text-xs text-tuco-cream/35 py-5">
        © {new Date().getFullYear()} Tuco · Viandas caseras · Hecho con amor
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      className="w-8 h-8 rounded-full border border-tuco-cream/20 hover:border-tuco-cream/60 flex items-center justify-center text-tuco-cream/60 hover:text-white transition-colors"
    >
      {children}
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
