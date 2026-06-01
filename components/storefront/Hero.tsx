export function Hero() {
  return (
    <section className="relative overflow-hidden bg-tuco-cream pt-14 pb-20 md:pt-20 md:pb-28">
      {/* Mancha decorativa fondo */}
      <div
        aria-hidden
        className="absolute -top-24 -right-24 w-[480px] h-[480px] bg-tuco-red opacity-[0.07] pointer-events-none"
        style={{ borderRadius: "60% 40% 30% 70% / 50% 60% 40% 50%" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-12 -left-12 w-64 h-64 bg-tuco-green opacity-[0.06] pointer-events-none"
        style={{ borderRadius: "40% 60% 70% 30% / 60% 30% 70% 40%" }}
      />

      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center relative">
        {/* Texto */}
        <div>
          <p className="text-tuco-red font-medium text-sm uppercase tracking-widest mb-4 italic">
            fatto in casa · viandas artesanales
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-tuco-brown leading-tight mb-5">
            Comé rico,
            <br />
            <span className="text-tuco-red">sin cocinar.</span>
          </h1>
          <p className="text-tuco-brown-light text-lg mb-8 leading-relaxed max-w-md">
            Viandas caseras listas para llevar. Cocinadas con amor, pensadas
            para tu semana. Retirás en el local o te las llevamos a casa.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#menu"
              className="bg-tuco-red hover:bg-tuco-red-dark text-white font-semibold px-7 py-3.5 rounded-full transition-colors shadow-sm text-sm"
            >
              Ver el menú de hoy
            </a>
            <a
              href="#como-funciona"
              className="border-2 border-tuco-brown text-tuco-brown hover:bg-tuco-brown hover:text-tuco-white font-semibold px-7 py-3.5 rounded-full transition-colors text-sm"
            >
              Cómo funciona
            </a>
          </div>
        </div>

        {/* Ilustración / placeholder foto */}
        <div className="hidden md:flex justify-center items-center">
          <div className="relative w-80 h-80">
            {/* Blob orgánico de fondo */}
            <div
              className="absolute inset-0 bg-tuco-white shadow-xl"
              style={{ borderRadius: "60% 40% 55% 45% / 45% 55% 45% 55%" }}
            />
            {/* Ícono plato */}
            <div className="absolute inset-0 flex items-center justify-center">
              <PlateIllustration />
            </div>
            {/* Detalles decorativos */}
            <div className="absolute -top-3 -right-3">
              <TomatoIcon />
            </div>
            <div className="absolute -bottom-2 -left-4">
              <BasilIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Separador wave */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden>
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8">
          <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40Z" fill="#FAFAF7" />
        </svg>
      </div>
    </section>
  );
}

function PlateIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Plato */}
      <circle cx="60" cy="65" r="42" fill="#F5F0E8" stroke="#6D4C41" strokeWidth="2" />
      <circle cx="60" cy="65" r="34" fill="#FAFAF7" stroke="#8D6E63" strokeWidth="1.5" />
      {/* Comida estilizada */}
      <ellipse cx="60" cy="65" rx="22" ry="18" fill="#C0392B" opacity="0.15" />
      <path d="M42 62 Q52 55 60 62 Q68 69 78 62" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M44 68 Q54 61 60 68 Q66 75 76 68" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Tenedor */}
      <line x1="28" y1="30" x2="28" y2="50" stroke="#6D4C41" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="30" x2="24" y2="38" stroke="#6D4C41" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="30" x2="28" y2="38" stroke="#6D4C41" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="30" x2="32" y2="38" stroke="#6D4C41" strokeWidth="1.5" strokeLinecap="round" />
      {/* Cuchillo */}
      <line x1="92" y1="30" x2="92" y2="50" stroke="#6D4C41" strokeWidth="2" strokeLinecap="round" />
      <path d="M92 30 Q96 35 92 42" stroke="#6D4C41" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function TomatoIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="20" r="13" fill="#C0392B" />
      <path d="M18 7 Q20 4 23 5" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M18 7 Q16 3 13 5" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="18" y1="7" x2="18" y2="11" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="14" cy="17" rx="3" ry="4" fill="#A93226" opacity="0.5" />
    </svg>
  );
}

function BasilIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 36 Q12 28 10 18 Q14 14 20 16 Q26 14 30 18 Q28 28 20 36Z" fill="#2E7D32" opacity="0.8" />
      <path d="M20 36 Q14 24 16 14" stroke="#1B5E20" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M16 20 Q12 16 10 18" stroke="#1B5E20" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M18 26 Q14 22 12 24" stroke="#1B5E20" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}
