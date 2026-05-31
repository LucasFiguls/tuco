export type Modalidad = "RETIRO" | "DELIVERY";
export type EstadoPedido = "PENDIENTE" | "CONFIRMADO" | "ENTREGADO" | "CANCELADO";

export interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  foto_url: string | null;
  cantidad: number;
}

export interface CheckoutData {
  cliente_nombre: string;
  cliente_telefono: string;
  modalidad: Modalidad;
  direccion_entrega?: string;
  fecha_entrega: string;
  hora_entrega: string;
  comentarios?: string;
}
