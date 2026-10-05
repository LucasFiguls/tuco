import { getSession } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Cortamos antes de leer el cuerpo cuando el tamaño declarado ya excede el límite
  const declarado = Number(request.headers.get("content-length") ?? 0);
  if (declarado > MAX_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "La imagen no puede pesar más de 5 MB" }, { status: 413 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }
  if (!TIPOS.includes(file.type)) {
    return NextResponse.json({ error: "Formato no soportado: subí JPG, PNG, WebP o AVIF" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen no puede pesar más de 5 MB" }, { status: 413 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const url = await uploadImage(buffer);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Error al subir imagen a Cloudinary", err);
    return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 });
  }
}
