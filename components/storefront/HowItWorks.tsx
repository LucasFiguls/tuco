const STEPS = [
  {
    numero: "01",
    titulo: "Elegís",
    descripcion: "Navegá el menú del día y sumá tus viandas favoritas al carrito.",
    icon: <MenuIcon />,
  },
  {
    numero: "02",
    titulo: "Pedís",
    descripcion: "Completá tus datos, elegí retiro en local o delivery y confirmás.",
    icon: <CartIcon />,
  },
  {
    numero: "03",
    titulo: "Coordinamos",
    descripcion: "Te contactamos para confirmar el pedido y coordinar los detalles.",
    icon: <ChatIcon />,
  },
  {
    numero: "04",
    titulo: "A comer",
    descripcion: "Retirás en el local o te llega directo a tu puerta. ¡Buen provecho!",
    icon: <HomeIcon />,
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-brand-dark py-16 md:py-24">
      <div className="max-w-[900px] mx-auto px-4">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center mb-14 md:mb-16">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">
            Simple como cocinar con amor
          </p>
          <h2 className="font-display font-bold text-white text-[32px] md:text-[48px] leading-tight">
            ¿Cómo funciona?
          </h2>
        </div>

        {/* ── Pasos ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-0">
          {STEPS.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center lg:px-4">

              {/* Línea punteada conectora — solo desktop */}
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="hidden lg:block absolute top-6 left-[calc(50%+28px)] right-0 border-t border-dashed border-white/15 z-0"
                />
              )}

              {/* Número decorativo */}
              <span className="font-display text-[64px] font-bold leading-none text-brand-primary opacity-30 absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none select-none">
                {step.numero}
              </span>

              {/* Ícono */}
              <div className="relative z-10 w-12 h-12 flex items-center justify-center mt-6">
                {step.icon}
              </div>

              {/* Texto */}
              <h3 className="font-display text-[20px] text-white font-semibold mt-4 mb-2">
                {step.titulo}
              </h3>
              <p className="font-body text-[14px] leading-[1.6] text-white/65">
                {step.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MenuIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6A1B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a9 9 0 100 18A9 9 0 0012 2z" />
      <path d="M8 12h8M8 8h8M8 16h5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6A1B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6A1B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6A1B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
