-- CreateEnum
CREATE TYPE "PaqueteInteres" AS ENUM ('P50', 'P75', 'P100', 'A_MEDIDA');

-- CreateEnum
CREATE TYPE "EstadoLead" AS ENUM ('NUEVO', 'CONTACTADO', 'PROPUESTA', 'GANADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "EstadoVoucher" AS ENUM ('DISPONIBLE', 'CANJEADO', 'ANULADO');

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "descuento_vouchers" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "leads_empresas" (
    "id" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "contacto_nombre" TEXT NOT NULL,
    "cargo" TEXT,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "cantidad_empleados" INTEGER,
    "paquete_interes" "PaqueteInteres" NOT NULL,
    "zona" TEXT NOT NULL,
    "comentarios" TEXT,
    "estado" "EstadoLead" NOT NULL DEFAULT 'NUEVO',
    "notas_internas" TEXT,
    "visto" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convenios" (
    "id" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "cuit" TEXT,
    "contacto_nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "vouchers_por_mes" INTEGER NOT NULL,
    "precio_por_vianda" DECIMAL(10,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "lead_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "convenios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voucher_lotes" (
    "id" TEXT NOT NULL,
    "convenio_id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "vence_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voucher_lotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "lote_id" TEXT NOT NULL,
    "estado" "EstadoVoucher" NOT NULL DEFAULT 'DISPONIBLE',
    "pedido_id" TEXT,
    "canjeado_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "convenios_lead_id_key" ON "convenios"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "voucher_lotes_convenio_id_periodo_key" ON "voucher_lotes"("convenio_id", "periodo");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_codigo_key" ON "vouchers"("codigo");

-- CreateIndex
CREATE INDEX "vouchers_lote_id_estado_idx" ON "vouchers"("lote_id", "estado");

-- AddForeignKey
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads_empresas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_lotes" ADD CONSTRAINT "voucher_lotes_convenio_id_fkey" FOREIGN KEY ("convenio_id") REFERENCES "convenios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "voucher_lotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- RLS sin policies: bloquea acceso vía anon key (PostgREST/Realtime).
-- Prisma conecta como owner de las tablas, por lo que no se ve afectado.
ALTER TABLE "leads_empresas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "convenios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "voucher_lotes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vouchers" ENABLE ROW LEVEL SECURITY;
