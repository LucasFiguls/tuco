import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { cotizarCaja } from "@/lib/caja";
import { fechaISO, parseItemsSuscripcion, sumarDias } from "@/lib/suscripciones";

/** Token del link privado: solo se guarda su hash; el link se muestra una vez. */
export function generarToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getSuscripcionPorToken(token: string) {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  return prisma.suscripcion.findUnique({ where: { token_hash: hashToken(token) } });
}

// Tope por suscripción y por corrida, por si se generan muchas semanas atrasadas
const MAX_ENTREGAS_POR_CORRIDA = 5;

export interface ResultadoGeneracion {
  creados: Array<{ suscripcion_id: string; cliente: string; numero_pedido: number; fecha: string }>;
  errores: Array<{ suscripcion_id: string; cliente: string; fecha: string; error: string }>;
}

/**
 * Crea los pedidos de las suscripciones activas con entrega hasta `hasta` (YYYY-MM-DD)
 * y adelanta su próxima entrega. Un pedido por suscripción y fecha (índice único).
 */
export async function generarPedidosSuscripciones(hasta: string): Promise<ResultadoGeneracion> {
  const res: ResultadoGeneracion = { creados: [], errores: [] };
  const limite = new Date(`${hasta}T00:00:00.000Z`);

  const suscripciones = await prisma.suscripcion.findMany({
    where: { estado: "ACTIVA", proxima_entrega: { lte: limite } },
    orderBy: { proxima_entrega: "asc" },
  });

  for (const s of suscripciones) {
    let fecha = fechaISO(s.proxima_entrega);
    for (let n = 0; n < MAX_ENTREGAS_POR_CORRIDA && fecha <= hasta; n++) {
      const cot = await cotizarCaja(parseItemsSuscripcion(s.items), s.tamano_caja, {
        modalidad: s.modalidad,
        suscripcion: true,
      });
      if (!cot.ok) {
        res.errores.push({ suscripcion_id: s.id, cliente: s.cliente_nombre, fecha, error: cot.error });
        break;
      }
      const siguiente = sumarDias(fecha, s.frecuencia_dias);
      try {
        const pedido = await prisma.$transaction(async (tx) => {
          const p = await tx.pedido.create({
            data: {
              cliente_nombre: s.cliente_nombre,
              cliente_telefono: s.cliente_telefono,
              modalidad: s.modalidad,
              direccion_entrega: s.direccion_entrega,
              fecha_entrega: new Date(fecha),
              hora_entrega: s.hora_entrega,
              comentarios: s.comentarios,
              tamano_caja: s.tamano_caja,
              descuento_caja: cot.descuentoCaja,
              descuento_suscripcion: cot.descuentoSuscripcion,
              costo_envio: cot.envio,
              total: cot.total,
              suscripcion_id: s.id,
              items: { create: cot.lineas },
            },
          });
          await tx.suscripcion.update({ where: { id: s.id }, data: { proxima_entrega: new Date(siguiente) } });
          return p;
        });
        res.creados.push({ suscripcion_id: s.id, cliente: s.cliente_nombre, numero_pedido: pedido.numero_pedido, fecha });
      } catch (e) {
        // Ya existía el pedido de esa fecha (otra corrida): solo se adelanta la próxima entrega
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          await prisma.suscripcion.update({ where: { id: s.id }, data: { proxima_entrega: new Date(siguiente) } });
        } else {
          throw e;
        }
      }
      fecha = siguiente;
    }
  }
  return res;
}
