/*
  Warnings:

  - You are about to drop the column `role` on the `StaffUser` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `StaffUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StaffUser" DROP COLUMN "role",
ADD COLUMN     "roleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "StaffRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StaffRole_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StaffUser" ADD CONSTRAINT "StaffUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "StaffRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
