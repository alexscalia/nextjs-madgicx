import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CustomerTable } from "@/components/staff/customer-table"
import { CustomerTableSkeleton } from "@/components/staff/customer-table-skeleton"

export default function CustomersPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage customer accounts and settings</p>
        </div>
        <Link href="/staff/customers/new" className="cursor-pointer">
          <Button className="bg-green-600 hover:bg-green-700 cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            View and manage all customer accounts in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<CustomerTableSkeleton />}>
            <CustomerTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
} 