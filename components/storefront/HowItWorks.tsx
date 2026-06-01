const STEPS = [
  {
    numero: "01",
    titulo: "Elegís",
    descripcion: "Navegá el menú del día, elegí tus viandas favoritas y sumalas al carrito.",
    icon: <MenuIcon />,
  },
  {
    numero: "02",
    titulo: "Pedís",
    descripcion: "Completás tus datos, elegís retiro en local o delivery y confirmás tu pedido.",
    icon: <BagIcon />,
  },
  {
    numero: "03",
    titulo: "Coordinamos",
    descripcion: "Te contactamos por WhatsApp para confirmar el pedido y coordinar los detalles.",
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
    <section id="como-funciona" className="bg-tuco-cream py-20 md:py-28">
      {/* Separador superior */}
      <div aria-hidden className="-mt-20 mb-12">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8">
          <path d="M0 0 C360 40 1080 40 1440 0 L1440 40 L0 40Z" fill="#FAFAF7" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-tuco-red font-medium text-sm uppercase tracking-widest italic mb-3">
            simple como cocinar con amor
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-tuco-brown">
            ¿Cómo funciona?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center group">
              {/* Línea conectora (solo desktop) */}
              {i < STEPS.length - 1 && (
                <div aria-hidden className="hidden lg:block absolute top-9 left-[calc(50%+36px)] right-0 h-px bg-tuco-brown/20 z-0" />
              )}
              {/* Ícono */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-tuco-white border-2 border-tuco-cream flex items-center justify-center mb-5 shadow-sm group-hover:border-tuco-red transition-colors">
                {step.icon}
              </div>
              {/* Número */}
              <span className="text-xs font-bold text-tuco-red uppercase tracking-widest mb-1 font-serif italic">
                {step.numero}
              </span>
              <h3 className="font-serif text-xl text-tuco-brown font-bold mb-2">{step.titulo}</h3>
              <p className="text-sm text-tuco-brown-light leading-relaxed">{step.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MenuIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a9 9 0 100 18A9 9 0 0012 2z" />
      <path d="M8 12h8M8 8h8M8 16h5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
