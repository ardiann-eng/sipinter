ALTER TABLE "ReturnVerification" ADD COLUMN "resolutionNote" TEXT;
ALTER TABLE "ReturnVerification" ADD COLUMN "resolvedAt" DATETIME;
ALTER TABLE "ReturnVerification" ADD COLUMN "serviceableReturnConfirmed" BOOLEAN NOT NULL DEFAULT false;
