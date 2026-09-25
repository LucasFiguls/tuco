-- CreateEnum
CREATE TYPE "LineaProducto" AS ENUM ('CALIENTE', 'VACIO');

-- CreateEnum
CREATE TYPE "TipoVacio" AS ENUM ('PLATO', 'BASE', 'GUARNICION', 'SALSA');

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "alergenos" TEXT,
ADD COLUMN     "dias_heladera" INTEGER,
ADD COLUMN     "foto_bolsa_url" TEXT,
ADD COLUMN     "linea" "LineaProducto" NOT NULL DEFAULT 'CALIENTE',
ADD COLUMN     "meses_freezer" INTEGER,
ADD COLUMN     "porcion_gramos" INTEGER,
ADD COLUMN     "regeneracion" JSONB,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tipo_vacio" "TipoVacio",
ADD COLUMN     "va_bien_con" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "costo_envio" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "descuento_caja" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tamano_caja" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "menu_items_slug_key" ON "menu_items"("slug");

