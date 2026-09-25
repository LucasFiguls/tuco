// Seguro para el cliente (sin crypto): los tokens viven en suscripciones-server.ts

export const FRECUENCIAS = [7, 14, 30] as const;
export type Frecuencia = (typeof FRECUENCIAS)[number];

export const FRECUENCIA_LABEL: Record<Frecuencia, string> = {
  7: "Cada semana",
  14: "Cada 2 semanas",
  30: "Cada mes",
};

export function esFrecuencia(n: unknown): n is Frecuencia {
  return FRECUENCIAS.includes(n as Frecuencia);
}

export function linkSuscripcion(token: string) {
  return `/mi-suscripcion/${token}`;
}

/** Fechas de entrega como "YYYY-MM-DD" (se guardan a las 00:00 UTC, como los pedidos). */
export function fechaISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return fechaISO(d);
}

export interface ItemSuscripcion {
  id: string;
  cantidad: number;
}

export function parseItemsSuscripcion(json: unknown): ItemSuscripcion[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((i) => i && typeof i === "object" && typeof i.id === "string" && Number.isInteger(i.cantidad) && i.cantidad > 0)
    .map((i) => ({ id: i.id as string, cantidad: i.cantidad as number }));
}
