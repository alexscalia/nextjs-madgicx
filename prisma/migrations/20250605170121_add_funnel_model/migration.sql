-- CreateTable
CREATE TABLE "Funnel" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "subCustomerId" INTEGER,
    "platform" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "conversions" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Funnel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Funnel" ADD CONSTRAINT "Funnel_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funnel" ADD CONSTRAINT "Funnel_subCustomerId_fkey" FOREIGN KEY ("subCustomerId") REFERENCES "SubCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
