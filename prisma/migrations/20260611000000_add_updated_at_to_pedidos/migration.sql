-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now();
