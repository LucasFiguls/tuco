import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const configs = await prisma.configuracion.findMany();
  const result: Record<string, string> = {};
  for (const c of configs) result[c.clave] = c.valor;
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body: Record<string, string> = await request.json();

  await Promise.all(
    Object.entries(body).map(([clave, valor]) =>
      prisma.configuracion.upsert({
        where: { clave },
        update: { valor },
        create: { clave, valor },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
