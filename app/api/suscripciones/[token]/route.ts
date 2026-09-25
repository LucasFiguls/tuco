import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { cotizarCaja } from "@/lib/caja";
import { esFechaValida, fechaMinimaEntrega, getVacioConfig } from "@/lib/vacio";
import { esFrecuencia, fechaISO, sumarDias } from "@/lib/suscripciones";
import { getSuscripcionPorToken } from "@/lib/suscripciones-server";
import { NextRequest, NextResponse } from "next/server";

type Accion =
  | { accion: "pausar" | "reanudar" | "saltear" | "cancelar" }
  | { accion: "frecuencia"; frecuencia_dias: number }
  | { accion: "reprogramar"; fecha: string }
  | { accion: "entrega"; modalidad: "RETIRO" | "DELIVERY"; direccion_entrega?: string; hora_entrega: string }
  | { accion: "caja"; tamano: number; items: Array<{ id: string; cantidad: number }> };

function error(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

/** El cliente gestiona su suscripción con el link privado (sin cuenta). */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sus = await getSuscripcionPorToken(token);
  if (!sus) return error("Suscripción no encontrada", 404);
  if (sus.estado === "CANCELADA") return error("La suscripción está cancelada");

  const body = (await request.json().catch(() => null)) as Accion | null;
  if (!body) return error("Datos inválidos");

  const vacio = getVacioConfig(await getConfig());
  const fechaMin = fechaMinimaEntrega(vacio.anticipacionHoras);
  const proxima = fechaISO(sus.proxima_entrega);
  let data: Parameters<typeof prisma.suscripcion.update>[0]["data"];

  switch (body.accion) {
    case "pausar":
      data = { estado: "PAUSADA" };
      break;
    case "reanudar":
      // Si la próxima entrega quedó en el pasado, pasa a la primera fecha válida
      data = { estado: "ACTIVA", proxima_entrega: new Date(proxima < fechaMin ? fechaMin : proxima) };
      break;
    case "saltear":
      if (sus.estado !== "ACTIVA") return error("Solo podés saltear entregas de una suscripción activa");
      data = { proxima_entrega: new Date(sumarDias(proxima, sus.frecuencia_dias)) };
      break;
    case "cancelar":
      data = { estado: "CANCELADA" };
      break;
    case "frecuencia":
      if (!esFrecuencia(body.frecuencia_dias)) return error("Frecuencia inválida");
      data = { frecuencia_dias: body.frecuencia_dias };
      break;
    case "reprogramar":
      if (!esFechaValida(body.fecha, vacio.anticipacionHoras)) {
        return error(`Elegí una fecha con al menos ${vacio.anticipacionHoras} hs de anticipación`);
      }
      data = { proxima_entrega: new Date(body.fecha) };
      break;
    case "entrega":
      if (!["RETIRO", "DELIVERY"].includes(body.modalidad)) return error("Modalidad inválida");
      if (body.modalidad === "DELIVERY" && !body.direccion_entrega?.trim()) return error("Dirección requerida para envío");
      if (!vacio.franjas.includes(body.hora_entrega)) return error("Elegí una franja horaria válida");
      data = {
        modalidad: body.modalidad,
        direccion_entrega: body.modalidad === "DELIVERY" ? body.direccion_entrega!.trim().slice(0, 300) : null,
        hora_entrega: body.hora_entrega,
      };
      break;
    case "caja": {
      const items = Array.isArray(body.items) ? body.items.map((i) => ({ id: String(i.id), cantidad: Number(i.cantidad) })) : [];
      const cot = await cotizarCaja(items, Number(body.tamano), { modalidad: sus.modalidad, suscripcion: true });
      if (!cot.ok) return error(cot.error, cot.status);
      data = { tamano_caja: Number(body.tamano), items };
      break;
    }
    default:
      return error("Acción inválida");
  }

  await prisma.suscripcion.update({ where: { id: sus.id }, data });
  return NextResponse.json({ ok: true });
}
