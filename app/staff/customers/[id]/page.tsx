import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "../../../generated/prisma"
import { authOptions } from "../../../api/auth/[...nextauth]/route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Edit, Trash2, Mail, Building2, Calendar, CreditCard } from "lucide-react"
import Link from "next/link"


const prisma = new PrismaClient()

interface PageProps {
  params: { id: string }
}

export default async function CustomerDetailPage({ params }: PageProps) {
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
      email: true,
      companyName: true,
      plan: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h1>
          <p className="text-gray-600 mb-6">The customer you're looking for doesn't exist or has been deleted.</p>
          <Link href="/staff/customers">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'pro':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'basic':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/staff/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
            <p className="text-gray-600">View and manage customer information</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href={`/staff/customers/${customer.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Customer
            </Button>
          </Link>
                     <Button variant="outline" className="text-red-600 hover:text-red-700">
             <Trash2 className="h-4 w-4 mr-2" />
             Delete Customer
           </Button>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                                 <AvatarFallback className="bg-blue-600 text-white text-lg">
                   {customer.name ? customer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'N/A'}
                 </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xl">{customer.name}</div>
                <div className="text-sm text-gray-500 font-normal">{customer.email}</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Email Address</div>
                  <div className="text-sm text-gray-900">{customer.email}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Company</div>
                  <div className="text-sm text-gray-900">{customer.companyName}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Plan</div>
                  <div className="text-sm">
                    <Badge variant="outline" className={getPlanBadgeColor(customer.plan || 'basic')}>
                      {customer.plan || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Member Since</div>
                  <div className="text-sm text-gray-900">
                    {new Date(customer.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Status</div>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Last Updated</div>
              <div className="text-sm text-gray-900">
                {new Date(customer.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="text-sm font-medium text-gray-700 mb-3">Quick Actions</div>
              <div className="space-y-2">
                <Link href={`/staff/customers/${customer.id}/edit`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="w-full justify-start text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional sections could go here - Activity Log, Sub-customers, etc. */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Customer account activity and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity to display</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 