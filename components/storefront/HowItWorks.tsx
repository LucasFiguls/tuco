"use client";

import { useState } from "react";
import Link from "next/link";
import { PASOS_EMPRESA, PASOS_PERSONA } from "@/lib/empresas-content";

type Paso = { numero: string; titulo: string; descripcion: string };

const GRUPOS = {
  persona: {
    tab: "Para vos",
    pasos: PASOS_PERSONA,
    icons: [<MenuIcon key="m" />, <CartIcon key="c" />, <ChatIcon key="ch" />, <HomeIcon key="h" />],
  },
  empresa: {
    tab: "Para tu empresa",
    pasos: PASOS_EMPRESA,
    icons: [<BoxIcon key="b" />, <TicketIcon key="t" />, <TeamIcon key="te" />, <RefreshIcon key="r" />],
  },
} as const;

type Grupo = keyof typeof GRUPOS;

interface HowItWorksProps {
  /** "dual" muestra tabs Personas / Empresas. */
  modo?: Grupo | "dual";
  id?: string;
  eyebrow?: string;
  titulo?: string;
}

export function HowItWorks({
  modo = "persona",
  id = "como-funciona",
  eyebrow = "Simple como cocinar con amor",
  titulo = "¿Cómo funciona?",
}: HowItWorksProps) {
  const [tab, setTab] = useState<Grupo>(modo === "empresa" ? "empresa" : "persona");
  const grupo = GRUPOS[tab];

  return (
    <section id={id} className="bg-brand-dark py-16 md:py-24 scroll-mt-20">
      <div className="max-w-[900px] mx-auto px-4">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="text-center mb-10 md:mb-12">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-primary mb-3">
            {eyebrow}
          </p>
          <h2 className="font-display font-bold text-white text-[32px] md:text-[48px] leading-tight">
            {titulo}
          </h2>
        </div>

        {/* ── Tabs (solo modo dual) ───────────────────────────────────────── */}
        {modo === "dual" && (
          <div role="tablist" className="flex justify-center mb-14">
            <div className="inline-flex p-1 rounded-btn bg-white/10">
              {(Object.keys(GRUPOS) as Grupo[]).map((g) => (
                <button
                  key={g}
                  role="tab"
                  aria-selected={tab === g}
                  onClick={() => setTab(g)}
                  className={`font-body text-sm font-semibold px-5 py-2 rounded-btn transition-all duration-200 ${
                    tab === g ? "bg-brand-primary text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {GRUPOS[g].tab}
                </button>
              ))}
            </div>
          </div>
        )}

        <Pasos key={tab} pasos={grupo.pasos} icons={grupo.icons} />

        {modo !== "persona" && tab === "empresa" && (
          <p className="mt-14 text-center font-body text-[15px] text-white/70">
            ¿Ya tenés un voucher?{" "}
            <Link href="/#menu" className="text-brand-primary font-semibold hover:underline">
              Armá tu pedido y canjealo en el checkout →
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

function Pasos({ pasos, icons }: { pasos: readonly Paso[]; icons: readonly React.ReactNode[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-0 animate-slide-text">
      {pasos.map((step, i) => (
        <div key={step.numero} className="relative flex flex-col items-center text-center lg:px-4">

          {/* Línea punteada conectora — solo desktop */}
          {i < pasos.length - 1 && (
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
            {icons[i]}
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

function BoxIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6A1B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6A1B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4z" />
      <path d="M13 5v2M13 11v2M13 17v2" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6A1B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0113 0" />
      <path d="M16 4.5a3.5 3.5 0 010 7M18 14a6.5 6.5 0 013.5 6" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF6A1B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11a8 8 0 00-14.9-3M4 13a8 8 0 0014.9 3" />
      <path d="M4 4v4h4M20 20v-4h-4" />
    </svg>
  );
}
