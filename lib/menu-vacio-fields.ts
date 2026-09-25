import { Prisma } from "@/app/generated/prisma/client";
import { parseRegeneracion, slugify, type TipoVacio } from "@/lib/vacio";

const TIPOS: TipoVacio[] = ["PLATO", "BASE", "GUARNICION", "SALSA"];

function entero(v: unknown): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Campos de la línea al vacío que acepta el admin del menú (POST/PUT). */
export function vacioFields(body: Record<string, unknown>) {
  const linea = body.linea === "VACIO" ? "VACIO" : "CALIENTE";
  if (linea === "CALIENTE") {
    return { linea, tipo_vacio: null, slug: null } as const;
  }
  const regeneracion = parseRegeneracion(body.regeneracion);
  return {
    linea,
    tipo_vacio: TIPOS.includes(body.tipo_vacio as TipoVacio) ? (body.tipo_vacio as TipoVacio) : "PLATO",
    slug: slugify(String(body.slug || body.nombre || "")) || null,
    porcion_gramos: entero(body.porcion_gramos),
    dias_heladera: entero(body.dias_heladera),
    meses_freezer: entero(body.meses_freezer),
    regeneracion: regeneracion.length ? (regeneracion as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
    foto_bolsa_url: typeof body.foto_bolsa_url === "string" && body.foto_bolsa_url ? body.foto_bolsa_url : null,
    alergenos: typeof body.alergenos === "string" && body.alergenos.trim() ? body.alergenos.trim() : null,
    va_bien_con: Array.isArray(body.va_bien_con) ? body.va_bien_con.map(String).slice(0, 10) : [],
  } as const;
}

/** El slug es único: un P2002 sobre slug se traduce en un mensaje claro. */
export function esSlugDuplicado(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}
