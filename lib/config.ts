import { prisma } from "@/lib/prisma";

/** Configuracion (clave/valor) como objeto plano. */
export async function getConfig(): Promise<Record<string, string>> {
  const rows = await prisma.configuracion.findMany();
  return Object.fromEntries(rows.map((c) => [c.clave, c.valor]));
}
