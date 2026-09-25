import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

// Sin caracteres ambiguos (0/O, 1/I/L)
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const PERIODO_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// Argentina es UTC-3 fijo (sin horario de verano)
const AR_OFFSET_HOURS = 3;

export const MAX_VOUCHERS_POR_PEDIDO = 10;

export function generarCodigo(): string {
  const bloque = () => Array.from({ length: 4 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
  return `TUCO-${bloque()}-${bloque()}`;
}

/** Acepta "tuco abcd efgh", "TUCOABCDEFGH", etc. → "TUCO-ABCD-EFGH". */
export function normalizarCodigo(raw: string): string {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.length === 12 && s.startsWith("TUCO")) return `TUCO-${s.slice(4, 8)}-${s.slice(8)}`;
  return s;
}

/** "YYYY-MM" del mes actual en hora argentina. */
export function periodoActual(now = new Date()): string {
  const ar = new Date(now.getTime() - AR_OFFSET_HOURS * 3600_000);
  return `${ar.getUTCFullYear()}-${String(ar.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function esPeriodoValido(periodo: string): boolean {
  return PERIODO_RE.test(periodo);
}

/** Último instante del mes (23:59:59.999 hora argentina). */
export function venceAt(periodo: string): Date {
  const [y, m] = periodo.split("-").map(Number);
  // Date.UTC con mes 0-based: `m` apunta al mes siguiente
  return new Date(Date.UTC(y, m, 1, AR_OFFSET_HOURS) - 1);
}

/** Filtro de vouchers que se pueden canjear ahora. */
export function whereCanjeable(now = new Date()): Prisma.VoucherWhereInput {
  return {
    estado: "DISPONIBLE",
    lote: { vence_at: { gt: now }, convenio: { activo: true } },
  };
}

export class LoteExistenteError extends Error {}

export async function emitirLote(convenioId: string, periodo: string, cantidad: number) {
  const existente = await prisma.voucherLote.findUnique({
    where: { convenio_id_periodo: { convenio_id: convenioId, periodo } },
  });
  if (existente) throw new LoteExistenteError(`Ya hay vouchers emitidos para ${periodo}`);

  // La colisión es ~imposible (31^8 combinaciones) pero reintentamos por las dudas
  for (let intento = 0; intento < 3; intento++) {
    const codigos = new Set<string>();
    while (codigos.size < cantidad) codigos.add(generarCodigo());
    try {
      return await prisma.$transaction(async (tx) => {
        const lote = await tx.voucherLote.create({
          data: { convenio_id: convenioId, periodo, cantidad, vence_at: venceAt(periodo) },
        });
        await tx.voucher.createMany({
          data: [...codigos].map((codigo) => ({ codigo, lote_id: lote.id })),
        });
        return lote;
      });
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === "P2002" && intento < 2) {
        // Si el unique que saltó es el del lote (carrera entre dos admins), no reintentamos
        const yaExiste = await prisma.voucherLote.findUnique({
          where: { convenio_id_periodo: { convenio_id: convenioId, periodo } },
        });
        if (yaExiste) throw new LoteExistenteError(`Ya hay vouchers emitidos para ${periodo}`);
        continue;
      }
      throw e;
    }
  }
  throw new Error("No se pudo emitir el lote");
}

export type EstadoValidacion = "VALIDO" | "INEXISTENTE" | "CANJEADO" | "ANULADO" | "VENCIDO" | "INACTIVO";

export async function validarCodigos(codigos: string[], now = new Date()) {
  const vouchers = await prisma.voucher.findMany({
    where: { codigo: { in: codigos } },
    select: {
      codigo: true,
      estado: true,
      lote: { select: { vence_at: true, convenio: { select: { empresa: true, activo: true } } } },
    },
  });
  const porCodigo = new Map(vouchers.map((v) => [v.codigo, v]));

  return codigos.map((codigo) => {
    const v = porCodigo.get(codigo);
    let estado: EstadoValidacion = "VALIDO";
    if (!v) estado = "INEXISTENTE";
    else if (v.estado === "CANJEADO") estado = "CANJEADO";
    else if (v.estado === "ANULADO") estado = "ANULADO";
    else if (!v.lote.convenio.activo) estado = "INACTIVO";
    else if (v.lote.vence_at <= now) estado = "VENCIDO";
    return { codigo, estado, empresa: estado === "VALIDO" ? v!.lote.convenio.empresa : null };
  });
}

export const MENSAJE_ESTADO: Record<Exclude<EstadoValidacion, "VALIDO">, string> = {
  INEXISTENTE: "Código inexistente",
  CANJEADO: "Ya fue usado",
  ANULADO: "Anulado",
  VENCIDO: "Vencido",
  INACTIVO: "Convenio inactivo",
};

/**
 * Cada voucher cubre 1 unidad; se aplican primero a las unidades más caras.
 * `categorias` vacío = todas elegibles.
 */
export function aplicarVouchers(
  lineas: Array<{ precio: number; cantidad: number; categoria: string }>,
  cantidadVouchers: number,
  categorias: string[] = []
) {
  const unidades = lineas
    .filter((l) => !categorias.length || categorias.includes(l.categoria))
    .flatMap((l) => Array.from({ length: l.cantidad }, () => l.precio))
    .sort((a, b) => b - a);
  const cubiertas = unidades.slice(0, cantidadVouchers);
  return {
    descuento: cubiertas.reduce((s, p) => s + p, 0),
    unidadesElegibles: unidades.length,
  };
}

export function parseCategoriasElegibles(valor?: string): string[] {
  return (valor ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
