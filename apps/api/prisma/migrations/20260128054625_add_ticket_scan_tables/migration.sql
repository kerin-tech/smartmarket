/*
  Warnings:

  - A unique constraint covering the columns `[ticket_scan_id]` on the table `purchases` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TicketScanStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "TicketScanItemStatus" AS ENUM ('PENDING', 'MATCHED', 'NEW', 'IGNORED', 'CONFIRMED');

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "ticket_scan_id" UUID;

-- CreateTable
CREATE TABLE "ticket_scans" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "image_public_id" VARCHAR(255) NOT NULL,
    "raw_text" TEXT,
    "status" "TicketScanStatus" NOT NULL DEFAULT 'PENDING',
    "store_id" UUID,
    "purchase_date" DATE,
    "items_count" INTEGER NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(12,2),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP,

    CONSTRAINT "ticket_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_scan_items" (
    "id" UUID NOT NULL,
    "ticket_scan_id" UUID NOT NULL,
    "raw_text" VARCHAR(500) NOT NULL,
    "detected_name" VARCHAR(255) NOT NULL,
    "detected_price" DECIMAL(12,2),
    "detected_quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "matched_product_id" UUID,
    "match_confidence" DOUBLE PRECISION,
    "status" "TicketScanItemStatus" NOT NULL DEFAULT 'PENDING',
    "final_product_id" UUID,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_scan_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_scans_user_id_idx" ON "ticket_scans"("user_id");

-- CreateIndex
CREATE INDEX "ticket_scans_status_idx" ON "ticket_scans"("status");

-- CreateIndex
CREATE INDEX "ticket_scans_created_at_idx" ON "ticket_scans"("created_at");

-- CreateIndex
CREATE INDEX "ticket_scan_items_ticket_scan_id_idx" ON "ticket_scan_items"("ticket_scan_id");

-- CreateIndex
CREATE INDEX "ticket_scan_items_status_idx" ON "ticket_scan_items"("status");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_ticket_scan_id_key" ON "purchases"("ticket_scan_id");

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_ticket_scan_id_fkey" FOREIGN KEY ("ticket_scan_id") REFERENCES "ticket_scans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_scans" ADD CONSTRAINT "ticket_scans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_scans" ADD CONSTRAINT "ticket_scans_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_scan_items" ADD CONSTRAINT "ticket_scan_items_ticket_scan_id_fkey" FOREIGN KEY ("ticket_scan_id") REFERENCES "ticket_scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_scan_items" ADD CONSTRAINT "ticket_scan_items_matched_product_id_fkey" FOREIGN KEY ("matched_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_scan_items" ADD CONSTRAINT "ticket_scan_items_final_product_id_fkey" FOREIGN KEY ("final_product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
