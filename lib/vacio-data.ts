import { prisma } from "@/lib/prisma";
import { parseRegeneracion, type PasoRegeneracion, type TipoVacio } from "@/lib/vacio";

export interface ProductoVacio {
  id: string;
  slug: string;
  nombre: string;
  tagline: string | null;
  descripcion: string | null;
  precio: number;
  tipo: TipoVacio;
  disponible: boolean;
  foto_url: string | null;
  foto_bolsa_url: string | null;
  porcion_gramos: number | null;
  dias_heladera: number | null;
  meses_freezer: number | null;
  regeneracion: PasoRegeneracion[];
  ingredientes: string | null;
  alergenos: string | null;
  tags: string[];
  calorias: number | null;
  proteinas: number | null;
  carbohidratos: number | null;
  grasas: number | null;
  va_bien_con: string[];
}

const ORDEN_TIPO: Record<TipoVacio, number> = { PLATO: 0, BASE: 1, GUARNICION: 2, SALSA: 3 };

type Row = Awaited<ReturnType<typeof prisma.menuItem.findMany>>[number];

function toProducto(i: Row): ProductoVacio {
  return {
    id: i.id,
    slug: i.slug ?? i.id,
    nombre: i.nombre,
    tagline: i.tagline,
    descripcion: i.descripcion,
    precio: Number(i.precio),
    tipo: i.tipo_vacio ?? "PLATO",
    disponible: i.disponible,
    foto_url: i.foto_url,
    foto_bolsa_url: i.foto_bolsa_url,
    porcion_gramos: i.porcion_gramos,
    dias_heladera: i.dias_heladera,
    meses_freezer: i.meses_freezer,
    regeneracion: parseRegeneracion(i.regeneracion),
    ingredientes: i.ingredientes,
    alergenos: i.alergenos,
    tags: i.tags,
    calorias: i.calorias,
    proteinas: i.proteinas,
    carbohidratos: i.carbohidratos,
    grasas: i.grasas,
    va_bien_con: i.va_bien_con,
  };
}

/** `preview` (admin logueado) incluye los no disponibles para revisar antes de publicar. */
export async function getProductosVacio({ preview = false } = {}): Promise<ProductoVacio[]> {
  const rows = await prisma.menuItem.findMany({
    where: { linea: "VACIO", ...(preview ? {} : { disponible: true }) },
    orderBy: [{ nombre: "asc" }],
  });
  return rows
    .map(toProducto)
    .sort((a, b) => ORDEN_TIPO[a.tipo] - ORDEN_TIPO[b.tipo] || a.nombre.localeCompare(b.nombre));
}

export async function getProductoVacio(slug: string, { preview = false } = {}) {
  const row = await prisma.menuItem.findFirst({
    where: { linea: "VACIO", OR: [{ slug }, { id: slug }], ...(preview ? {} : { disponible: true }) },
  });
  return row ? toProducto(row) : null;
}
