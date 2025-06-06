import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "../../../generated/prisma"
import { authOptions } from "../../../api/auth/[...nextauth]/route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Trash2, Mail, Building2, Calendar, CreditCard, Users, Shield, UserCheck } from "lucide-react"
import Link from "next/link"


const prisma = new PrismaClient()

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  // Check if user is staff
  if (!session?.user?.role || !['Administrator', 'Support Agent'].includes(session.user.role)) {
    redirect('/auth/staff/signin')
  }

  // Await params (Next.js 15 requirement)
  const { id } = await params

  // Fetch customer data with users
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
      users: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
          role: {
            select: {
              name: true,
              description: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })

  if (!customer) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h1>
                      <p className="text-gray-600 mb-6">The customer you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Link href="/staff/customers">
            <Button>
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

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
          <p className="text-gray-600">View and manage customer information</p>
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
                <div className="text-sm text-gray-500 font-normal">{customer.companyName}</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Customer Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Users
          </CardTitle>
          <CardDescription>Users with access to this customer account</CardDescription>
        </CardHeader>
        <CardContent>
          {customer.users && customer.users.length > 0 ? (
            <div className="space-y-4">
              {customer.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gray-600 text-white">
                        {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                                             <div className="flex items-center gap-2">
                         <span className="font-medium text-gray-900">{user.name || 'No Name'}</span>
                         {user.role.name === 'Owner' && (
                           <div title="Account Owner">
                             <Shield className="h-4 w-4 text-blue-600" />
                           </div>
                         )}
                       </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">{user.role.name}</div>
                      <div className="text-xs text-gray-500">{user.role.description}</div>
                    </div>
                    <Badge variant="outline" className={getStatusBadgeColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No users found for this customer</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
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