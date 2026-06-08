export type Modalidad = "RETIRO" | "DELIVERY";

export interface MenuItemComponent {
  id: string;
  nombre: string;
  cantidad_label: string;
  foto_url: string | null;
  orden: number;
}

export interface MenuItem {
  id: string;
  nombre: string;
  tagline: string | null;
  descripcion: string | null;
  precio: number;
  categoria: string;
  disponible: boolean;
  foto_url: string | null;
  calorias: number | null;
  proteinas: number | null;
  carbohidratos: number | null;
  grasas: number | null;
  ingredientes: string | null;
  tags: string[];
  menu_del_dia: boolean;
  components: MenuItemComponent[];
}

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
