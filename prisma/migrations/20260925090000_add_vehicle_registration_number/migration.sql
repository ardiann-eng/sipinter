ALTER TABLE "Item" ADD COLUMN "registrationNumber" TEXT;

CREATE UNIQUE INDEX "Item_registrationNumber_key" ON "Item"("registrationNumber");
