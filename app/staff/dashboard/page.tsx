import { getServerSession } from "next-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Building2, UserCheck, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"
import { PrismaClient } from "../../generated/prisma"

const prisma = new PrismaClient()

export default async function StaffDashboard() {
  const session = await getServerSession()
  
  // Get overview metrics
  const [customerCount, subcustomerCount, staffCount] = await Promise.all([
    prisma.customer.count({ where: { deletedAt: null } }),
    prisma.subCustomer.count({ where: { deletedAt: null } }),
    prisma.staffUser.count({ where: { deletedAt: null } })
  ])

  const quickActions = [
    {
      title: "Add New Customer",
      description: "Create a new customer account",
      href: "/staff/customers/new",
      icon: Plus,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Manage Customers",
      description: "View and edit customer accounts",
      href: "/staff/customers",
      icon: Users,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Sub-Customers",
      description: "Manage sub-customer accounts",
      href: "/staff/subcustomers",
      icon: Building2,
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Staff Management",
      description: "Manage staff users and roles",
      href: "/staff/users",
      icon: UserCheck,
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {session?.user?.name}! 
            <Badge variant="outline" className="ml-2">
              {session?.user?.role}
            </Badge>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerCount}</div>
            <p className="text-xs text-muted-foreground">Active customer accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sub-Customers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subcustomerCount}</div>
            <p className="text-xs text-muted-foreground">Active sub-accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffCount}</div>
            <p className="text-xs text-muted-foreground">Admin & support team</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card key={action.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.color.replace('hover:', '')}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription className="text-sm">{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href={action.href}>
                    <Button className={`w-full ${action.color}`}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest customer and system activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New customer registered</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Campaign performance report generated</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sub-customer account created</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 