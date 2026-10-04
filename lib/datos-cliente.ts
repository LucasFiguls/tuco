import type { Modalidad } from "@/lib/types";

// Datos de contacto que el cliente pidió recordar en este navegador (checkbox en el checkout, tildado por defecto).
// No incluye comentarios: pueden traer alergias (dato de salud).
const KEY = "tuco_datos_cliente";
const VERSION = 1;

export interface DatosCliente {
  cliente_nombre: string;
  cliente_telefono: string;
  modalidad: Modalidad;
  direccion_entrega: string;
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}

export function leerDatosCliente(): DatosCliente | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || d.v !== VERSION) return null;
    return {
      cliente_nombre: str(d.cliente_nombre, 100),
      cliente_telefono: str(d.cliente_telefono, 30),
      modalidad: d.modalidad === "DELIVERY" ? "DELIVERY" : "RETIRO",
      direccion_entrega: str(d.direccion_entrega, 300),
    };
  } catch {
    return null;
  }
}

export function guardarDatosCliente(d: DatosCliente) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        v: VERSION,
        cliente_nombre: d.cliente_nombre,
        cliente_telefono: d.cliente_telefono,
        modalidad: d.modalidad,
        direccion_entrega: d.direccion_entrega,
      })
    );
  } catch {
    // Storage bloqueado o lleno: el pedido igual sale, solo no se recuerda
  }
}

export function borrarDatosCliente() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // idem
  }
}
