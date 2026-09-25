import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { count } = await prisma.leadEmpresa.updateMany({
    where: { visto: false },
    data: { visto: true },
  });
  return NextResponse.json({ count });
}
