import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET → cantidad de pedidos no vistos (para el badge inicial del sidebar)
export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const count = await prisma.pedido.count({ where: { visto: false } });
  return NextResponse.json({ count });
}

// PATCH → marca todos los pedidos no vistos como vistos
export async function PATCH() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  await prisma.pedido.updateMany({ where: { visto: false }, data: { visto: true } });
  return NextResponse.json({ ok: true });
}
