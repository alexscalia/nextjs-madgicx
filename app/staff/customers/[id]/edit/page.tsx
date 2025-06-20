import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { PrismaClient } from "../../../../generated/prisma"
import { authOptions } from "../../../../api/auth/[...nextauth]/route"
import { CustomerForm } from "@/components/staff/customer-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const prisma = new PrismaClient()

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCustomerPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  // Check if user is staff
  if (!session?.user?.role || !['Administrator', 'Support Agent'].includes(session.user.role)) {
    redirect('/auth/staff/signin')
  }

  // Await params (Next.js 15 requirement)
  const { id } = await params

  // Fetch customer data
  const customer = await prisma.customer.findUnique({
    where: {
      id: id,
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      companyName: true,
      plan: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  if (!customer) {
    notFound()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
        <p className="text-gray-600">Update customer information for {customer.name}</p>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>
            Update the customer details below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm 
            customer={customer} 
            mode="edit" 
          />
        </CardContent>
      </Card>
    </div>
  )
} 