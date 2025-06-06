/*
  Warnings:

  - You are about to drop the column `role` on the `CustomerUser` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `CustomerUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomerUser" DROP COLUMN "role",
ADD COLUMN     "roleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CustomerRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerRole_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomerUser" ADD CONSTRAINT "CustomerUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "CustomerRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
