-- AlterTable
ALTER TABLE "ticket_scan_items" ADD COLUMN     "flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "item_code" VARCHAR(50),
ADD COLUMN     "parse_confidence" DOUBLE PRECISION,
ADD COLUMN     "unit" VARCHAR(10) DEFAULT 'UN';

-- AlterTable
ALTER TABLE "ticket_scans" ADD COLUMN     "detected_store_key" VARCHAR(50),
ADD COLUMN     "detected_store_name" VARCHAR(100),
ADD COLUMN     "detection_confidence" DOUBLE PRECISION,
ADD COLUMN     "parser_used" VARCHAR(50);

-- CreateIndex
CREATE INDEX "ticket_scans_detected_store_key_idx" ON "ticket_scans"("detected_store_key");
