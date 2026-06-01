"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";

const BANNER_MESSAGES = [
  "Retiro en local y delivery disponible",
  "Pedí antes de las 18 hs",
  "Pagá con transferencia bancaria",
];

export function Navbar() {
  const { count, setDrawerOpen } = useCart();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setBannerVisible(false);
      setTimeout(() => {
        setBannerIdx((i) => (i + 1) % BANNER_MESSAGES.length);
        setBannerVisible(true);
      }, 300);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-30">
      {/* Banner rotativo */}
      <div className="bg-tuco-red text-white text-xs text-center py-2 font-medium tracking-wide">
        <span
          className="inline-block transition-all duration-300"
          style={{ opacity: bannerVisible ? 1 : 0, transform: bannerVisible ? "translateY(0)" : "translateY(-4px)" }}
        >
          {BANNER_MESSAGES[bannerIdx]}
        </span>
      </div>

      {/* Barra principal */}
      <nav
        className={`bg-tuco-white border-b border-tuco-cream transition-shadow duration-200 ${
          scrolled ? "shadow-md" : "shadow-none"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="font-serif text-3xl font-bold text-tuco-red leading-none">Tuco</span>
            <span className="text-xs text-tuco-brown-light italic hidden sm:block pt-1">fatto in casa</span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-tuco-brown">
            <a href="#menu" className="hover:text-tuco-red transition-colors">Menú</a>
            <a href="#como-funciona" className="hover:text-tuco-red transition-colors">Cómo funciona</a>
            <a href="#contacto" className="hover:text-tuco-red transition-colors">Contacto</a>
          </div>

          {/* Botón carrito */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative flex items-center gap-2 bg-tuco-red hover:bg-tuco-red-dark text-white rounded-full pl-4 pr-5 py-2 text-sm font-semibold transition-colors shadow-sm"
          >
            <BagIcon />
            <span className="hidden sm:block">Carrito</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-tuco-green text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold leading-none">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}

function BagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
