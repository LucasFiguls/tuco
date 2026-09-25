"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartContext";

const BANNER_MESSAGES = [
  "Pedí antes de las 18hs",
  "Retiro en local y delivery disponible",
  "Pagá con transferencia bancaria",
  "Convenios para empresas con vouchers mensuales",
];

const BANNER_VACIO = [
  "Armá tu caja de 5, 10, 15 o 20 viandas",
  "Envío a domicilio o retiro en el local",
  "Heladera o freezer: vos elegís cuándo",
];

const NAV_VACIO = [
  { label: "Armá tu caja",  href: "/armar" },
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Regenerar",     href: "/como-regenerar" },
  { label: "Preguntas",     href: "/preguntas" },
];

const NAV_LINKS = [
  { label: "Menú",          href: "/#menu" },
  { label: "Empresas",      href: "/empresas" },
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Contacto",      href: "#contacto" },
];

interface NavbarProps {
  /** "vacio" = línea al vacío (links y caja propios). */
  variant?: "caliente" | "vacio";
  /** Fondo sólido desde el inicio (páginas sin hero). */
  solid?: boolean;
}

export function Navbar({ variant = "caliente", solid = false }: NavbarProps = {}) {
  const { count, setDrawerOpen, caja } = useCart();
  const esVacio = variant === "vacio";
  const banner = esVacio ? BANNER_VACIO : BANNER_MESSAGES;
  const links = esVacio ? NAV_VACIO : NAV_LINKS;
  const cajaLabel = caja ? `Caja ${count}/${caja}` : "Armá tu caja";

  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badgeBump, setBadgeBump]   = useState(false);

  const prevCount = useRef(count);

  // Banner rotation: fade cada 4 s
  useEffect(() => {
    const t = setInterval(() => {
      setBannerVisible(false);
      setTimeout(() => {
        setBannerIdx((i) => (i + 1) % banner.length);
        setBannerVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(t);
  }, [banner.length]);

  // Scroll: >80px → navbar sólida
  // Usa RAF para que el navegador termine el scroll de anchor antes de medir
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Badge bounce cuando aumenta el count
  useEffect(() => {
    if (count > prevCount.current) {
      setBadgeBump(true);
      const t = setTimeout(() => setBadgeBump(false), 200);
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  // Cerrar menú mobile al hacer scroll
  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    window.addEventListener("scroll", close, { passive: true, once: true });
    return () => window.removeEventListener("scroll", close);
  }, [mobileOpen]);

  const solido      = scrolled || solid;
  const textColor   = solido ? "text-brand-dark"  : "text-white";
  const mutedColor  = solido ? "text-brand-muted"  : "text-white/70";

  return (
    <header className="sticky top-0 z-50">

      {/* ── Banner rotativo ─────────────────────────────────────────────── */}
      <div className="bg-tuco-red text-white text-center py-2">
        <span
          className="font-body text-[13px] transition-opacity duration-400"
          style={{ opacity: bannerVisible ? 1 : 0 }}
        >
          {banner[bannerIdx % banner.length]}
        </span>
      </div>

      {/* ── Barra principal ─────────────────────────────────────────────── */}
      <nav
        className={`transition-all duration-300 ${solido ? "bg-white/95 backdrop-blur-[12px] shadow-nav" : ""}`}
        style={
          solido
            ? undefined
            : { background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)" }
        }
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="font-display text-[28px] font-bold text-brand-primary leading-none">
              Tuco
            </span>
            <span className={`font-body text-[11px] hidden lg:block pt-1 transition-colors duration-300 ${mutedColor}`}>
              fatto in casa
            </span>
          </Link>

          {/* Links — desktop */}
          <div className="hidden md:flex items-center gap-5 lg:gap-7">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`font-body text-[14px] lg:text-[15px] font-medium whitespace-nowrap transition-colors duration-150 hover:text-brand-primary no-underline ${textColor}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Botón carrito — desktop */}
          <div className="flex items-center gap-3">
            {esVacio ? (
              <Link
                href="/armar"
                className={`hidden md:flex items-center gap-2 font-body font-semibold text-sm px-5 py-2.5 rounded-btn whitespace-nowrap transition-all duration-300 ${
                  solido
                    ? "bg-brand-primary text-white hover:bg-brand-primary-hover"
                    : "border border-white text-white hover:bg-white/10"
                }`}
              >
                <BoxIcon />
                {cajaLabel}
              </Link>
            ) : (
            <button
              onClick={() => setDrawerOpen(true)}
              className={`hidden md:flex relative items-center gap-2 font-body font-semibold text-sm px-5 py-2.5 rounded-btn transition-all duration-300 ${
                solido
                  ? "bg-brand-primary text-white hover:bg-brand-primary-hover"
                  : "border border-white text-white hover:bg-white/10"
              }`}
            >
              <CartIcon />
              Carrito
              <CartBadge count={count} bump={badgeBump} />
            </button>
            )}

            {/* Ícono carrito — mobile (sin pill) */}
            {esVacio ? (
              <Link
                href="/armar"
                className={`relative md:hidden p-2 transition-colors duration-300 ${textColor}`}
                aria-label={cajaLabel}
              >
                <BoxIcon />
                <CartBadge count={count} bump={badgeBump} />
              </Link>
            ) : (
            <button
              onClick={() => setDrawerOpen(true)}
              className={`relative md:hidden p-2 transition-colors duration-300 ${textColor}`}
              aria-label="Abrir carrito"
            >
              <CartIcon />
              <CartBadge count={count} bump={badgeBump} />
            </button>
            )}

            {/* Hamburguesa — mobile */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={`md:hidden p-2 transition-colors duration-300 ${textColor}`}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
            >
              <HamburgerIcon open={mobileOpen} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Panel mobile ────────────────────────────────────────────────── */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 z-40 bg-white border-b border-brand-border transition-all duration-300 overflow-hidden ${
          mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="px-6 py-2 pb-6">
          {links.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block font-display text-[24px] text-brand-dark py-4 transition-colors hover:text-brand-primary ${
                i < links.length - 1 ? "border-b border-brand-border" : ""
              }`}
            >
              {link.label}
            </a>
          ))}
          {esVacio ? (
            <Link
              href="/armar"
              onClick={() => setMobileOpen(false)}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-body font-semibold text-[15px] py-3 rounded-btn transition-colors duration-200"
            >
              <BoxIcon />
              {cajaLabel}
            </Link>
          ) : (
          <button
            onClick={() => { setMobileOpen(false); setDrawerOpen(true); }}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-body font-semibold text-[15px] py-3 rounded-btn transition-colors duration-200"
          >
            <CartIcon />
            Ver carrito {count > 0 && `(${count})`}
          </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function CartBadge({ count, bump }: { count: number; bump: boolean }) {
  if (count === 0) return null;
  return (
    <span
      className={`absolute -top-1 -right-1 bg-red-500 text-white font-body text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none ${
        bump ? "animate-badge-bounce" : ""
      }`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {/* Línea 1 */}
      <line
        x1="2" y1="5" x2="20" y2="5"
        style={{
          transformOrigin: "11px 5px",
          transform: open ? "translateY(6px) rotate(45deg)" : "none",
          transition: "transform 250ms ease",
        }}
      />
      {/* Línea 2 */}
      <line
        x1="2" y1="11" x2="20" y2="11"
        style={{
          opacity: open ? 0 : 1,
          transition: "opacity 150ms ease",
        }}
      />
      {/* Línea 3 */}
      <line
        x1="2" y1="17" x2="20" y2="17"
        style={{
          transformOrigin: "11px 17px",
          transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
          transition: "transform 250ms ease",
        }}
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
