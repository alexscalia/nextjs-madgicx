-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "subCustomerId" INTEGER,
    "type" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileUrl" TEXT NOT NULL,
    "visibleToSubCustomers" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_subCustomerId_fkey" FOREIGN KEY ("subCustomerId") REFERENCES "SubCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
