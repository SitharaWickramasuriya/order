/*
  Warnings:

  - You are about to drop the column `location` on the `Center` table. All the data in the column will be lost.
  - You are about to drop the column `batchDate` on the `DeliverySchedule` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `DeliverySchedule` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `DeliverySchedule` table. All the data in the column will be lost.
  - You are about to drop the column `goodsReceivedNoteId` on the `GoodsReceivedItem` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `sentTo` on the `NotificationLog` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to drop the column `address` on the `Supplier` table. All the data in the column will be lost.
  - Added the required column `grnId` to the `GoodsReceivedItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `PurchaseOrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Center" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Center" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "Center";
DROP TABLE "Center";
ALTER TABLE "new_Center" RENAME TO "Center";
CREATE UNIQUE INDEX "Center_name_key" ON "Center"("name");
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Customer" ("address", "createdAt", "id", "name", "phone", "updatedAt") SELECT "address", "createdAt", "id", "name", "phone", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
CREATE TABLE "new_DeliverySchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "windowStart" DATETIME NOT NULL,
    "windowEnd" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DeliverySchedule" ("createdAt", "id", "status", "windowEnd", "windowStart") SELECT "createdAt", "id", "status", "windowEnd", "windowStart" FROM "DeliverySchedule";
DROP TABLE "DeliverySchedule";
ALTER TABLE "new_DeliverySchedule" RENAME TO "DeliverySchedule";
CREATE TABLE "new_GoodsReceivedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grnId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "GoodsReceivedItem_grnId_fkey" FOREIGN KEY ("grnId") REFERENCES "GoodsReceivedNote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GoodsReceivedItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GoodsReceivedItem" ("id", "productId", "quantity") SELECT "id", "productId", "quantity" FROM "GoodsReceivedItem";
DROP TABLE "GoodsReceivedItem";
ALTER TABLE "new_GoodsReceivedItem" RENAME TO "GoodsReceivedItem";
CREATE TABLE "new_Inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "centerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Inventory_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Inventory" ("centerId", "id", "productId", "quantity", "updatedAt") SELECT "centerId", "id", "productId", "quantity", "updatedAt" FROM "Inventory";
DROP TABLE "Inventory";
ALTER TABLE "new_Inventory" RENAME TO "Inventory";
CREATE UNIQUE INDEX "Inventory_centerId_productId_key" ON "Inventory"("centerId", "productId");
CREATE TABLE "new_NotificationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_NotificationLog" ("channel", "createdAt", "id", "message", "orderId") SELECT "channel", "createdAt", "id", "message", "orderId" FROM "NotificationLog";
DROP TABLE "NotificationLog";
ALTER TABLE "new_NotificationLog" RENAME TO "NotificationLog";
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNo" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "deliveryScheduleId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "channel" TEXT NOT NULL DEFAULT 'ONLINE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_deliveryScheduleId_fkey" FOREIGN KEY ("deliveryScheduleId") REFERENCES "DeliverySchedule" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("channel", "createdAt", "customerId", "deliveryScheduleId", "id", "notes", "orderNo", "status", "updatedAt") SELECT "channel", "createdAt", "customerId", "deliveryScheduleId", "id", "notes", "orderNo", "status", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");
CREATE TABLE "new_OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("id", "orderId", "price", "productId", "quantity") SELECT "id", "orderId", "price", "productId", "quantity" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("category", "createdAt", "description", "id", "imageUrl", "itemCode", "name", "price", "updatedAt") SELECT "category", "createdAt", "description", "id", "imageUrl", "itemCode", "name", "price", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_itemCode_key" ON "Product"("itemCode");
CREATE TABLE "new_PurchaseOrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PurchaseOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PurchaseOrderItem" ("id", "productId", "purchaseOrderId", "quantity") SELECT "id", "productId", "purchaseOrderId", "quantity" FROM "PurchaseOrderItem";
DROP TABLE "PurchaseOrderItem";
ALTER TABLE "new_PurchaseOrderItem" RENAME TO "PurchaseOrderItem";
CREATE TABLE "new_Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Supplier" ("createdAt", "id", "name", "phone", "updatedAt") SELECT "createdAt", "id", "name", "phone", "updatedAt" FROM "Supplier";
DROP TABLE "Supplier";
ALTER TABLE "new_Supplier" RENAME TO "Supplier";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
