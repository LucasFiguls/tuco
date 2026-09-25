import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/whatsapp";
import { NextRequest, NextResponse } from "next/server";

const PAQUETES = ["P50", "P75", "P100", "A_MEDIDA"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Honeypot: respondemos OK sin guardar para no darle pistas al bot
  if (str(body.website, 200)) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const data = {
    empresa: str(body.empresa, 120),
    contacto_nombre: str(body.contacto_nombre, 120),
    cargo: str(body.cargo, 80) || null,
    email: str(body.email, 160).toLowerCase(),
    telefono: str(body.telefono, 30),
    zona: str(body.zona, 120),
    comentarios: str(body.comentarios, 1000) || null,
    paquete_interes: body.paquete_interes,
    cantidad_empleados:
      body.cantidad_empleados === "" || body.cantidad_empleados == null
        ? null
        : Number(body.cantidad_empleados),
  };

  const fields: Record<string, string> = {};
  if (!data.empresa) fields.empresa = "Contanos el nombre de la empresa";
  if (!data.contacto_nombre) fields.contacto_nombre = "Ingresá tu nombre";
  if (!EMAIL_RE.test(data.email)) fields.email = "Ingresá un email válido";
  const digitos = data.telefono.replace(/\D/g, "");
  if (digitos.length < 8 || digitos.length > 15) fields.telefono = "Ingresá un teléfono válido";
  if (!data.zona) fields.zona = "Indicá la zona de la oficina";
  if (!PAQUETES.includes(data.paquete_interes)) fields.paquete_interes = "Elegí un paquete";
  if (
    data.cantidad_empleados !== null &&
    (!Number.isInteger(data.cantidad_empleados) || data.cantidad_empleados < 1 || data.cantidad_empleados > 100000)
  ) {
    fields.cantidad_empleados = "Cantidad inválida";
  }

  if (Object.keys(fields).length) {
    return NextResponse.json({ error: "Revisá los datos marcados", fields }, { status: 400 });
  }

  await prisma.leadEmpresa.create({
    data: { ...data, telefono: normalizePhone(data.telefono) },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
