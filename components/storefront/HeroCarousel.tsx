"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const SLIDES = [
  {
    backgroundImage:
      "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1920&q=80",
    eyebrow: "FATTO IN CASA",
    headline: "Comé rico,\nsin cocinar.",
    subheadline: "Viandas caseras listas para llevar.",
    ctaPrimary: { label: "Ver el menú de hoy", href: "#menu" },
    ctaSecondary: { label: "Cómo funciona", href: "#como-funciona" },
  },
  {
    backgroundImage:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1920&q=80",
    eyebrow: "MENÚ DE HOY",
    headline: "Cocinado hoy,\nen tu mesa hoy.",
    subheadline: "Retiro en el local o delivery a domicilio.",
    ctaPrimary: { label: "Pedir ahora", href: "#menu" },
    ctaSecondary: { label: "Ver combos", href: "#menu" },
  },
  {
    backgroundImage:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1920&q=80",
    eyebrow: "SIEMPRE FRESCO",
    headline: "Sin conservantes.\nSin vueltas.",
    subheadline: "Ingredientes reales, recetas de siempre.",
    ctaPrimary: { label: "Ver el menú", href: "#menu" },
    ctaSecondary: { label: "Contacto", href: "#contacto" },
  },
] as const;

const INTERVAL_MS = 5000;

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full min-h-[90svh] md:min-h-screen bg-brand-dark overflow-hidden">

      {/* ── Background images — crossfade ──────────────────────────────── */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.backgroundImage}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.backgroundImage}
            alt=""
            fill
            className="object-cover object-center"
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* ── Overlay — gradiente combinado (top siempre oscuro para navbar) ── */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.00) 50%, rgba(0,0,0,0.55) 100%)",
            "linear-gradient(to right,  rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.20) 60%, rgba(0,0,0,0.00) 100%)",
          ].join(", "),
        }}
      />

      {/* ── Slide content ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex h-full min-h-[90svh] md:min-h-screen">
        <div className="flex w-full items-end pb-28 justify-center md:items-center md:justify-start md:pb-0">
          {/*
            key={active} forces React to remount this div on each slide change,
            which re-triggers the CSS animation defined in globals.css.
          */}
          <div
            key={active}
            className="animate-slide-text text-center md:text-left px-6 md:pl-[10%] max-w-2xl"
          >
            <p className="font-body text-xs tracking-[0.2em] text-brand-primary uppercase mb-4">
              {SLIDES[active].eyebrow}
            </p>

            <h1
              className="font-display font-bold text-white whitespace-pre-line leading-[1.1] mb-5
                         text-[42px] md:text-[72px]"
            >
              {SLIDES[active].headline}
            </h1>

            <p className="font-body text-lg text-white/80 mb-8">
              {SLIDES[active].subheadline}
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <a
                href={SLIDES[active].ctaPrimary.href}
                className="inline-flex items-center justify-center font-medium rounded-btn
                           px-6 py-3 text-base bg-brand-primary text-white
                           hover:bg-brand-primary-hover transition-colors duration-200"
              >
                {SLIDES[active].ctaPrimary.label}
              </a>
              <a
                href={SLIDES[active].ctaSecondary.href}
                className="inline-flex items-center justify-center font-medium rounded-btn
                           px-6 py-3 text-base border border-white text-white
                           hover:bg-white/10 transition-colors duration-200"
              >
                {SLIDES[active].ctaSecondary.label}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dot indicators ──────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-btn transition-all duration-300 ${
              i === active ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
