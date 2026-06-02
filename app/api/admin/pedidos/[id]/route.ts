import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      items: {
        include: { menu_item: true },
      },
    },
  });

  if (!pedido) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(pedido);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { estado } = await request.json();

  const pedido = await prisma.pedido.update({
    where: { id },
    data: { estado },
    include: {
      items: {
        include: { menu_item: true },
      },
    },
  });
  return NextResponse.json(pedido);
}

// PATCH → marca un pedido individual como visto
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.pedido.update({ where: { id }, data: { visto: true } });
  return NextResponse.json({ ok: true });
}
