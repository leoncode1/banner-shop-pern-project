-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'SHIPPED');

-- CreateEnum
CREATE TYPE "BannerTier" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM', 'MINI');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerOption" (
    "id" TEXT NOT NULL,
    "tier" "BannerTier" NOT NULL,
    "widthFt" INTEGER NOT NULL,
    "heightFt" INTEGER NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddOn" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AddOn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "userId" TEXT,
    "bannerOptionId" TEXT NOT NULL,
    "notes" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OrderAddOns" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_OrderAddOns_AB_unique" ON "_OrderAddOns"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderAddOns_B_index" ON "_OrderAddOns"("B");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_bannerOptionId_fkey" FOREIGN KEY ("bannerOptionId") REFERENCES "BannerOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderAddOns" ADD CONSTRAINT "_OrderAddOns_A_fkey" FOREIGN KEY ("A") REFERENCES "AddOn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderAddOns" ADD CONSTRAINT "_OrderAddOns_B_fkey" FOREIGN KEY ("B") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
