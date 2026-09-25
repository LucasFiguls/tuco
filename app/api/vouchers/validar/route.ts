import { NextRequest, NextResponse } from "next/server";
import { MAX_VOUCHERS_POR_PEDIDO, MENSAJE_ESTADO, normalizarCodigo, validarCodigos } from "@/lib/vouchers";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const raw: unknown = body?.codigos;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_VOUCHERS_POR_PEDIDO) {
    return NextResponse.json({ error: "Lista de códigos inválida" }, { status: 400 });
  }

  const codigos = [...new Set(raw.map((c) => normalizarCodigo(String(c)).slice(0, 20)))];
  const resultados = await validarCodigos(codigos);

  // Solo válido/inválido + empresa: nunca saldo ni datos del convenio
  return NextResponse.json({
    resultados: resultados.map((r) => ({
      codigo: r.codigo,
      valido: r.estado === "VALIDO",
      empresa: r.empresa,
      motivo: r.estado === "VALIDO" ? null : MENSAJE_ESTADO[r.estado],
    })),
  });
}
