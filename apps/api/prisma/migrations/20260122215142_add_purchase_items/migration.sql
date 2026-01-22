/*
  Warnings:

  - You are about to drop the column `price` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `purchases` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `purchases` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_product_id_fkey";

-- DropIndex
DROP INDEX "purchases_product_id_idx";

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "price",
DROP COLUMN "product_id",
DROP COLUMN "quantity",
ADD COLUMN     "updated_at" TIMESTAMP NOT NULL;

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" UUID NOT NULL,
    "purchase_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "purchase_items_purchase_id_idx" ON "purchase_items"("purchase_id");

-- CreateIndex
CREATE INDEX "purchase_items_product_id_idx" ON "purchase_items"("product_id");

-- CreateIndex
CREATE INDEX "purchases_user_id_date_idx" ON "purchases"("user_id", "date");

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
