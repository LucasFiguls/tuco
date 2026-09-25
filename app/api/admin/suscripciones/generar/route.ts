import { getSession } from "@/lib/auth";
import { generarPedidosSuscripciones } from "@/lib/suscripciones-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { hasta } = await request.json().catch(() => ({}));
  if (typeof hasta !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(hasta)) {
    return NextResponse.json({ error: "Fecha inválida (YYYY-MM-DD)" }, { status: 400 });
  }
  return NextResponse.json(await generarPedidosSuscripciones(hasta));
}
