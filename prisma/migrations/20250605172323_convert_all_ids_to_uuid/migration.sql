/*
  Warnings:

  - The primary key for the `Ad` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Campaign` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ConnectedAccount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CustomerUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Funnel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Report` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `StaffUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SubCustomer` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Ad" DROP CONSTRAINT "Ad_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_connectedAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_subCustomerId_fkey";

-- DropForeignKey
ALTER TABLE "ConnectedAccount" DROP CONSTRAINT "ConnectedAccount_customerId_fkey";

-- DropForeignKey
ALTER TABLE "ConnectedAccount" DROP CONSTRAINT "ConnectedAccount_subCustomerId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerUser" DROP CONSTRAINT "CustomerUser_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Funnel" DROP CONSTRAINT "Funnel_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Funnel" DROP CONSTRAINT "Funnel_subCustomerId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_subCustomerId_fkey";

-- DropForeignKey
ALTER TABLE "SubCustomer" DROP CONSTRAINT "SubCustomer_customerId_fkey";

-- AlterTable
ALTER TABLE "Ad" DROP CONSTRAINT "Ad_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "campaignId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Ad_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Ad_id_seq";

-- AlterTable
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ALTER COLUMN "subCustomerId" SET DATA TYPE TEXT,
ALTER COLUMN "connectedAccountId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Campaign_id_seq";

-- AlterTable
ALTER TABLE "ConnectedAccount" DROP CONSTRAINT "ConnectedAccount_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ALTER COLUMN "subCustomerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ConnectedAccount_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ConnectedAccount_id_seq";

-- AlterTable
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Customer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Customer_id_seq";

-- AlterTable
ALTER TABLE "CustomerUser" DROP CONSTRAINT "CustomerUser_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "CustomerUser_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CustomerUser_id_seq";

-- AlterTable
ALTER TABLE "Funnel" DROP CONSTRAINT "Funnel_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ALTER COLUMN "subCustomerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Funnel_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Funnel_id_seq";

-- AlterTable
ALTER TABLE "Report" DROP CONSTRAINT "Report_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ALTER COLUMN "subCustomerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Report_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Report_id_seq";

-- AlterTable
ALTER TABLE "StaffUser" DROP CONSTRAINT "StaffUser_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "StaffUser_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "StaffUser_id_seq";

-- AlterTable
ALTER TABLE "SubCustomer" DROP CONSTRAINT "SubCustomer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "SubCustomer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SubCustomer_id_seq";

-- AddForeignKey
ALTER TABLE "CustomerUser" ADD CONSTRAINT "CustomerUser_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCustomer" ADD CONSTRAINT "SubCustomer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectedAccount" ADD CONSTRAINT "ConnectedAccount_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectedAccount" ADD CONSTRAINT "ConnectedAccount_subCustomerId_fkey" FOREIGN KEY ("subCustomerId") REFERENCES "SubCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_subCustomerId_fkey" FOREIGN KEY ("subCustomerId") REFERENCES "SubCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_connectedAccountId_fkey" FOREIGN KEY ("connectedAccountId") REFERENCES "ConnectedAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funnel" ADD CONSTRAINT "Funnel_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funnel" ADD CONSTRAINT "Funnel_subCustomerId_fkey" FOREIGN KEY ("subCustomerId") REFERENCES "SubCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_subCustomerId_fkey" FOREIGN KEY ("subCustomerId") REFERENCES "SubCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
