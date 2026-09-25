// Contenido comercial de convenios corporativos (vouchers mensuales).
// Los bloques marcados DEMO son ficticios — proyecto de práctica.

export type PaqueteId = "P50" | "P75" | "P100" | "A_MEDIDA";

export const PAQUETES: Array<{
  id: PaqueteId;
  nombre: string;
  vouchers: string;
  bajada: string;
  items: string[];
  destacado?: boolean;
}> = [
  {
    id: "P50",
    nombre: "Piccolo",
    vouchers: "50",
    bajada: "Ideal para equipos chicos o para arrancar a probar.",
    items: ["50 vouchers por mes", "Canje en todo el menú", "Retiro o delivery"],
  },
  {
    id: "P75",
    nombre: "Medio",
    vouchers: "75",
    bajada: "El favorito de los equipos que almuerzan juntos.",
    items: ["75 vouchers por mes", "Mejor precio por vianda", "Retiro o delivery"],
    destacado: true,
  },
  {
    id: "P100",
    nombre: "Grande",
    vouchers: "100",
    bajada: "Para equipos grandes o para cubrir toda la semana.",
    items: ["100 vouchers por mes", "El menor precio por vianda", "Retiro o delivery"],
  },
  {
    id: "A_MEDIDA",
    nombre: "A medida",
    vouchers: "+100",
    bajada: "Más volumen, varias sedes o necesidades especiales.",
    items: ["Cantidad a definir", "Condiciones especiales", "Te armamos la propuesta"],
  },
];

export const PAQUETE_LABEL: Record<PaqueteId, string> = {
  P50: "50 vouchers",
  P75: "75 vouchers",
  P100: "100 vouchers",
  A_MEDIDA: "A medida",
};

export const PASOS_EMPRESA = [
  { numero: "01", titulo: "Elegís el paquete", descripcion: "50, 75 o 100 viandas por mes. Cuanto más grande, menor el precio por vianda." },
  { numero: "02", titulo: "Recibís los códigos", descripcion: "Todos los meses te enviamos los vouchers para que los repartas en tu equipo." },
  { numero: "03", titulo: "Tu equipo canjea", descripcion: "Cada persona pide cuando quiere, carga su código en el checkout y listo." },
  { numero: "04", titulo: "Renovás o ajustás", descripcion: "Mes a mes podés subir o bajar el paquete según cómo lo use tu equipo." },
];

export const PASOS_PERSONA = [
  { numero: "01", titulo: "Elegís", descripcion: "Navegá el menú del día y sumá tus viandas favoritas al carrito." },
  { numero: "02", titulo: "Pedís", descripcion: "Completá tus datos, elegí retiro en local o delivery y confirmás." },
  { numero: "03", titulo: "Coordinamos", descripcion: "Te contactamos para confirmar el pedido y coordinar los detalles." },
  { numero: "04", titulo: "A comer", descripcion: "Retirás en el local o te llega directo a tu puerta. ¡Buen provecho!" },
];

export const BENEFICIOS = [
  { titulo: "Comida casera de verdad", descripcion: "Recetas de la nonna, cocinadas todos los días. Nada de bandejas industriales." },
  { titulo: "Cero gestión para RR.HH.", descripcion: "Repartís los códigos y te olvidás. Nosotros nos ocupamos del resto." },
  { titulo: "Libertad para el equipo", descripcion: "Cada persona elige qué, cuándo y cómo pedir. Nadie queda atado a un menú fijo." },
  { titulo: "Costo previsible", descripcion: "Un paquete mensual cerrado. Sabés exactamente cuánto invertís cada mes." },
  { titulo: "Retiro o delivery", descripcion: "El voucher se usa igual que un pedido normal: en el local o a domicilio." },
  { titulo: "Crece con tu equipo", descripcion: "Pasás de 50 a 75 o 100 cuando lo necesites, sin contratos eternos." },
];

// DEMO — métricas ficticias
export const METRICAS = [
  { valor: "+1.200", label: "viandas por mes" },
  { valor: "25", label: "empresas con convenio" },
  { valor: "4.8★", label: "satisfacción promedio" },
];

// DEMO — testimonios ficticios
export const TESTIMONIOS = [
  { texto: "Pasamos de pedir cada uno por su lado a tener un beneficio que todos valoran. Y la lasagna es un clásico de los viernes.", autor: "Carolina M.", cargo: "Líder de RR.HH.", empresa: "Estudio Contable Ficticio" },
  { texto: "Lo que más nos gustó es que nadie está obligado a pedir el mismo día. Cada uno usa su voucher cuando quiere.", autor: "Martín R.", cargo: "Office Manager", empresa: "Agencia Demo" },
  { texto: "Arrancamos con 50 y a los dos meses pasamos a 100. Es comida que se siente casera de verdad.", autor: "Lucía P.", cargo: "Co-fundadora", empresa: "Startup de Prueba" },
];

export const FAQ = [
  { pregunta: "¿Qué pasa con los vouchers que no se usan?", respuesta: "Los vouchers valen durante el mes para el que se emitieron y vencen el último día. Si ves que sobran, al mes siguiente podés pasar a un paquete más chico." },
  { pregunta: "¿Cómo reparto los vouchers en mi equipo?", respuesta: "Te enviamos un listado con un código único por voucher. Vos decidís cómo repartirlos: uno por día, varios por persona, como mejor le sirva a tu equipo." },
  { pregunta: "¿Qué cubre cada voucher?", respuesta: "Cada voucher cubre una vianda del menú. Si alguien suma algo más al pedido, paga la diferencia como en cualquier pedido." },
  { pregunta: "¿Dónde y cómo se canjean?", respuesta: "En nuestro sitio, igual que un pedido normal: cada persona arma su carrito, carga su código en el checkout y elige retiro en el local o delivery." },
  { pregunta: "¿Puedo cambiar de paquete?", respuesta: "Sí. El paquete se define mes a mes, así que podés subir o bajar según cómo lo use tu equipo." },
  { pregunta: "¿Cómo se factura?", respuesta: "Facturamos el paquete mensual a la empresa. Te acompañamos con un resumen de cuántos vouchers se canjearon." },
];

export const WHATSAPP_EMPRESAS_MSG =
  "Hola Tuco! Quiero consultar por un convenio de vouchers para mi empresa.";
