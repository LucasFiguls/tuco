-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Modalidad" AS ENUM ('RETIRO', 'DELIVERY');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA');

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "categoria" TEXT NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "foto_url" TEXT,
    "calorias" INTEGER,
    "proteinas" DOUBLE PRECISION,
    "carbohidratos" DOUBLE PRECISION,
    "grasas" DOUBLE PRECISION,
    "ingredientes" TEXT,
    "tagline" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "menu_del_dia" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "receta_id" TEXT,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_item_components" (
    "id" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidad_label" TEXT NOT NULL,
    "foto_url" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_item_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "numero_pedido" SERIAL NOT NULL,
    "cliente_nombre" TEXT NOT NULL,
    "cliente_telefono" TEXT NOT NULL,
    "modalidad" "Modalidad" NOT NULL,
    "direccion_entrega" TEXT,
    "fecha_entrega" TIMESTAMP(3) NOT NULL,
    "hora_entrega" TEXT NOT NULL,
    "comentarios" TEXT,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE',
    "total" DECIMAL(10,2) NOT NULL,
    "visto" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_items" (
    "id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedido_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_templates" (
    "id" SERIAL NOT NULL,
    "estado" TEXT NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "plantilla" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insumos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "costo_unitario" DECIMAL(10,2) NOT NULL,
    "stock_actual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock_minimo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proveedor" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_stock" (
    "id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT,
    "pedido_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recetas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "rendimiento" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "costo_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredientes_receta" (
    "id" TEXT NOT NULL,
    "receta_id" TEXT NOT NULL,
    "insumo_id" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "merma" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredientes_receta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_clave_key" ON "configuracion"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_templates_estado_key" ON "whatsapp_templates"("estado");

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "recetas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_components" ADD CONSTRAINT "menu_item_components_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredientes_receta" ADD CONSTRAINT "ingredientes_receta_receta_id_fkey" FOREIGN KEY ("receta_id") REFERENCES "recetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredientes_receta" ADD CONSTRAINT "ingredientes_receta_insumo_id_fkey" FOREIGN KEY ("insumo_id") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

