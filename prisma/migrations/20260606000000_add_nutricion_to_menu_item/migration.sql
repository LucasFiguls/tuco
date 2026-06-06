-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN "calorias" INTEGER,
                         ADD COLUMN "proteinas" DOUBLE PRECISION,
                         ADD COLUMN "carbohidratos" DOUBLE PRECISION,
                         ADD COLUMN "grasas" DOUBLE PRECISION,
                         ADD COLUMN "ingredientes" TEXT;
