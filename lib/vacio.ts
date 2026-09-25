// Línea "Tuco al vacío": cajas, descuentos, regeneración y entrega.
// Todo lo configurable se lee de Configuracion (clave/valor) con defaults acá.

export type TipoVacio = "PLATO" | "BASE" | "GUARNICION" | "SALSA";
export type MetodoRegeneracion = "BANO_MARIA" | "MICROONDAS" | "SARTEN" | "HORNO";

export interface PasoRegeneracion {
  metodo: MetodoRegeneracion;
  minutos: number;
  pasos?: string;
}

export interface Caja {
  tamano: number;
  descuento: number; // porcentaje
}

export const CAJAS_DEFAULT: Caja[] = [
  { tamano: 5, descuento: 0 },
  { tamano: 10, descuento: 5 },
  { tamano: 15, descuento: 10 },
  { tamano: 20, descuento: 15 },
];

export const CAJA_SUGERIDA = 10;

export const TIPO_LABEL: Record<TipoVacio, string> = {
  PLATO: "Plato completo",
  BASE: "Base",
  GUARNICION: "Guarnición",
  SALSA: "Salsa",
};

export const TIPO_PLURAL: Record<TipoVacio, string> = {
  PLATO: "Platos",
  BASE: "Bases",
  GUARNICION: "Guarniciones",
  SALSA: "Salsas",
};

export const METODO_LABEL: Record<MetodoRegeneracion, string> = {
  BANO_MARIA: "Baño María",
  MICROONDAS: "Microondas",
  SARTEN: "Sartén",
  HORNO: "Horno",
};

export const METODOS = Object.keys(METODO_LABEL) as MetodoRegeneracion[];

// ── Config ───────────────────────────────────────────────────────────────────

export function modoVacio(config: Record<string, string>): boolean {
  return config.modo_vacio === "true";
}

/** `vacio_descuentos` = "0,5,10,15" (uno por tamaño de CAJAS_DEFAULT). */
export function parseCajas(valor?: string): Caja[] {
  if (!valor) return CAJAS_DEFAULT;
  const pcts = valor.split(",").map((s) => Number(s.trim()));
  if (pcts.length !== CAJAS_DEFAULT.length || pcts.some((p) => !Number.isFinite(p) || p < 0 || p > 50)) {
    return CAJAS_DEFAULT;
  }
  return CAJAS_DEFAULT.map((c, i) => ({ ...c, descuento: pcts[i] }));
}

export function parseFranjas(valor?: string): string[] {
  const franjas = (valor ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return franjas.length ? franjas : ["9 a 13 hs", "14 a 18 hs"];
}

export function parseAnticipacionHoras(valor?: string): number {
  const n = Number(valor);
  return Number.isInteger(n) && n >= 0 && n <= 24 * 14 ? n : 48;
}

/** Descuento extra de la suscripción (%), sobre el subtotal. */
export function parseDescuentoSuscripcion(valor?: string): number {
  const n = Number(valor);
  return valor !== undefined && valor !== "" && Number.isFinite(n) && n >= 0 && n <= 30 ? n : 5;
}

export function parseCostoEnvio(valor?: string): number {
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export interface VacioConfig {
  cajas: Caja[];
  franjas: string[];
  anticipacionHoras: number;
  costoEnvio: number;
  /** % extra de descuento al suscribirse. */
  descuentoSuscripcion: number;
}

export function getVacioConfig(config: Record<string, string>): VacioConfig {
  return {
    cajas: parseCajas(config.vacio_descuentos),
    franjas: parseFranjas(config.vacio_franjas),
    anticipacionHoras: parseAnticipacionHoras(config.vacio_anticipacion_horas),
    costoEnvio: parseCostoEnvio(config.vacio_costo_envio),
    descuentoSuscripcion: parseDescuentoSuscripcion(config.vacio_descuento_suscripcion),
  };
}

// ── Precio de la caja ────────────────────────────────────────────────────────

export function descuentoCaja(subtotal: number, tamano: number, cajas: Caja[]): number {
  const caja = cajas.find((c) => c.tamano === tamano);
  if (!caja) return 0;
  return Math.round((subtotal * caja.descuento) / 100);
}

/** La caja más chica en la que entran `cantidad` bolsas (o null si supera la más grande). */
export function cajaParaCantidad(cantidad: number, cajas: Caja[]): Caja | null {
  return cajas.find((c) => c.tamano >= cantidad) ?? null;
}

// ── Fechas (Argentina, UTC-3 fijo) ───────────────────────────────────────────

const AR_OFFSET_MS = 3 * 3600_000;

/** Primera fecha de entrega válida (YYYY-MM-DD, hora argentina). */
export function fechaMinimaEntrega(anticipacionHoras: number, now = new Date()): string {
  const d = new Date(now.getTime() + anticipacionHoras * 3600_000 - AR_OFFSET_MS);
  return d.toISOString().slice(0, 10);
}

export function esFechaValida(fecha: string, anticipacionHoras: number, now = new Date()): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(fecha) && fecha >= fechaMinimaEntrega(anticipacionHoras, now);
}

// ── Regeneración ─────────────────────────────────────────────────────────────

export function parseRegeneracion(json: unknown): PasoRegeneracion[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter(
      (p): p is PasoRegeneracion =>
        !!p && typeof p === "object" && METODOS.includes((p as PasoRegeneracion).metodo) &&
        Number.isFinite(Number((p as PasoRegeneracion).minutos))
    )
    .map((p) => ({ metodo: p.metodo, minutos: Number(p.minutos), pasos: p.pasos ? String(p.pasos) : undefined }));
}

/** Tiempo más corto de regeneración, para mostrar en cards ("8 min"). */
export function minutosMinimos(regeneracion: PasoRegeneracion[]): number | null {
  return regeneracion.length ? Math.min(...regeneracion.map((r) => r.minutos)) : null;
}

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
