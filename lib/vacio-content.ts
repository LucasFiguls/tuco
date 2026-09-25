// Textos de la línea "Tuco al vacío". Los plazos genéricos quedan en la ficha
// de cada producto (dias_heladera / meses_freezer), no acá.

import type { MetodoRegeneracion } from "@/lib/vacio";

export const HERO_VACIO = {
  eyebrow: "Tuco al vacío",
  titulo: "Llená tu heladera\nde comida casera.",
  bajada:
    "Platos de la nonna envasados al vacío. Elegís 5, 10, 15 o 20, te los llevamos juntos y los regenerás en minutos.",
  // Provisoria (stock): se reemplaza subiendo la foto en Admin → Configuración → Tuco al vacío
  imagen:
    "https://images.unsplash.com/photo-1606859191214-25806e8e2423?auto=format&fit=crop&w=1920&q=80",
};

export const PASOS_VACIO = [
  { numero: "01", titulo: "Elegís el tamaño", descripcion: "Una caja de 5, 10, 15 o 20 bolsas. Cuanto más grande, más ahorrás." },
  { numero: "02", titulo: "Llenás la caja", descripcion: "Platos completos, bases, guarniciones y salsas. Combinalos como quieras." },
  { numero: "03", titulo: "Te la llevamos", descripcion: "Envío a domicilio el día que elijas, o retiro sin costo en el local." },
  { numero: "04", titulo: "Heladera o freezer", descripcion: "Guardás todo y regenerás cada bolsa en minutos, cuando tengas hambre." },
];

export const COMBINACIONES = [
  { base: "Verduras salteadas estilo indio", guarnicion: "Arroz blanco", resultado: "Una cena liviana" },
  { base: "Ragú de carne", guarnicion: "Puré de papas", resultado: "Un clásico de domingo" },
];

export const METODOS_GUIA: Record<MetodoRegeneracion, { resumen: string; pasos: string[] }> = {
  BANO_MARIA: {
    resumen: "El método que mejor respeta la textura. Ideal para salsas, guisos y purés.",
    pasos: [
      "Llená una olla con agua y llevala a hervor suave.",
      "Sumergí la bolsa cerrada, sin abrir.",
      "Dejala el tiempo que indica la etiqueta y abrila con cuidado: sale vapor.",
    ],
  },
  MICROONDAS: {
    resumen: "El más rápido. Ideal para porciones individuales.",
    pasos: [
      "Hacé un corte pequeño en una esquina de la bolsa.",
      "Calentá a potencia media el tiempo que indica la etiqueta.",
      "Revolvé a mitad de tiempo si es un plato con salsa.",
    ],
  },
  SARTEN: {
    resumen: "Para salteados y todo lo que queda mejor dorado.",
    pasos: [
      "Abrí la bolsa y volcá el contenido en una sartén caliente con un hilo de aceite.",
      "Revolvé a fuego medio hasta que esté caliente parejo.",
    ],
  },
  HORNO: {
    resumen: "Para gratinados, carnes y tartas.",
    pasos: [
      "Precalentá el horno a temperatura media.",
      "Pasá el contenido a una fuente y calentá el tiempo que indica la etiqueta.",
    ],
  },
};

export const CONSERVACION_GUIA = [
  { titulo: "En la heladera", texto: "Cada bolsa indica cuántos días dura cerrada en la heladera. Una vez abierta, consumila en el día." },
  { titulo: "En el freezer", texto: "Lo que no vayas a comer en esos días pasalo al freezer apenas lo recibís. Ahí dura meses." },
  { titulo: "Para descongelar", texto: "Pasá la bolsa del freezer a la heladera la noche anterior. No la descongeles a temperatura ambiente." },
];

export const FAQ_VACIO = [
  { pregunta: "¿Cuánto duran las viandas?", respuesta: "Cada bolsa indica en su etiqueta y en su ficha cuántos días dura en la heladera y cuántos meses en el freezer. Lo que no vayas a comer pronto, pasalo al freezer apenas lo recibís." },
  { pregunta: "¿Cómo las caliento?", respuesta: "Cada producto trae sus métodos y tiempos: baño María, microondas, sartén u horno. También tenés la guía completa en \"Cómo regenerar\" y un QR en cada bolsa." },
  { pregunta: "¿Puedo combinar platos, bases y guarniciones?", respuesta: "Sí. Cada bolsa ocupa un lugar en la caja, sea un plato completo, una base, una guarnición o una salsa. Armala como quieras." },
  { pregunta: "¿Cuánto ahorro con una caja más grande?", respuesta: "El descuento crece con el tamaño de la caja. Lo ves aplicado en el armador y en el checkout antes de confirmar." },
  { pregunta: "¿Cómo es la entrega?", respuesta: "Elegís envío a domicilio o retiro sin costo en el local, y el día y la franja horaria que te quedan cómodos, con algunos días de anticipación para que cocinemos tu caja." },
  { pregunta: "¿Cómo pago?", respuesta: "Por transferencia bancaria o en efectivo al recibir o retirar." },
];
