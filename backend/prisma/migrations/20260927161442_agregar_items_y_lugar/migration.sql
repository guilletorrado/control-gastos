-- AlterTable
ALTER TABLE "Gasto" ADD COLUMN     "lugar" TEXT;

-- CreateTable
CREATE TABLE "ItemGasto" (
    "id" SERIAL NOT NULL,
    "producto" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "gastoId" INTEGER NOT NULL,

    CONSTRAINT "ItemGasto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ItemGasto" ADD CONSTRAINT "ItemGasto_gastoId_fkey" FOREIGN KEY ("gastoId") REFERENCES "Gasto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
