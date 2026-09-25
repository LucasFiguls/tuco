import type { MetodoRegeneracion } from "@/lib/vacio";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function MetodoIcon({ metodo, size = 22 }: { metodo: MetodoRegeneracion; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", ...base, "aria-hidden": true };
  switch (metodo) {
    case "BANO_MARIA":
      return (
        <svg {...p}>
          <path d="M4 10h16v6a4 4 0 01-4 4H8a4 4 0 01-4-4z" />
          <path d="M2 10h2M20 10h2M9 4c0 1.5 1 1.5 1 3M14 4c0 1.5 1 1.5 1 3" />
        </svg>
      );
    case "MICROONDAS":
      return (
        <svg {...p}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <rect x="6" y="8" width="9" height="8" rx="1" />
          <path d="M18 9v.01M18 12v.01M18 15v.01" />
        </svg>
      );
    case "SARTEN":
      return (
        <svg {...p}>
          <circle cx="9" cy="13" r="6" />
          <path d="M15 13h7" />
        </svg>
      );
    case "HORNO":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 8h18M7 5.5h.01M11 5.5h.01" />
          <rect x="7" y="11" width="10" height="7" rx="1" />
        </svg>
      );
  }
}

export function HeladeraIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M5 10h14M8 6v2M8 13v3" />
    </svg>
  );
}

export function FreezerIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M12 2v20M4.9 6.5l14.2 11M19.1 6.5L4.9 17.5" />
      <path d="M9 4l3 2 3-2M9 20l3-2 3 2" />
    </svg>
  );
}

export function CajaIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}
