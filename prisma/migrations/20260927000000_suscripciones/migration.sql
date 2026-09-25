-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('ACTIVA', 'PAUSADA', 'CANCELADA');

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "descuento_suscripcion" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "suscripcion_id" TEXT;

-- CreateTable
CREATE TABLE "suscripciones" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "estado" "EstadoSuscripcion" NOT NULL DEFAULT 'ACTIVA',
    "cliente_nombre" TEXT NOT NULL,
    "cliente_telefono" TEXT NOT NULL,
    "modalidad" "Modalidad" NOT NULL,
    "direccion_entrega" TEXT,
    "hora_entrega" TEXT NOT NULL,
    "comentarios" TEXT,
    "frecuencia_dias" INTEGER NOT NULL,
    "tamano_caja" INTEGER NOT NULL,
    "items" JSONB NOT NULL,
    "proxima_entrega" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suscripciones_token_hash_key" ON "suscripciones"("token_hash");

-- CreateIndex
CREATE INDEX "suscripciones_estado_proxima_entrega_idx" ON "suscripciones"("estado", "proxima_entrega");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_suscripcion_id_fecha_entrega_key" ON "pedidos"("suscripcion_id", "fecha_entrega");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_suscripcion_id_fkey" FOREIGN KEY ("suscripcion_id") REFERENCES "suscripciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- RLS sin policies: bloquea acceso vía anon key (tiene teléfonos y direcciones).
ALTER TABLE "suscripciones" ENABLE ROW LEVEL SECURITY;
