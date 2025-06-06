import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { PrismaClient } from "../../generated/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  Users, 
  Activity,
  DollarSign,
  Eye,
  MousePointer
} from "lucide-react"

const prisma = new PrismaClient()

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.customerId) {
    return <div>Unauthorized</div>
  }

  // Fetch customer data with users
  const customer = await prisma.customer.findUnique({
    where: {
      id: session.user.customerId,
      deletedAt: null
    },
    select: {
      id: true,
      name: true,
      companyName: true,
      plan: true,
      createdAt: true,
      users: {
        where: {
          deletedAt: null
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          role: {
            select: {
              name: true
            }
          }
        }
      }
    }
  })

  if (!customer) {
    return <div>Customer not found</div>
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

  // Mock data for demonstration - in real app this would come from campaigns/analytics APIs
  const mockMetrics = {
    totalCampaigns: 12,
    activeUsers: customer.users.filter(u => u.status === 'ACTIVE').length,
    totalSpend: 24563,
    impressions: 1245678,
    clicks: 15234,
    conversions: 456
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user.name}!</h1>
        <p className="text-gray-600">Here's your account overview for {customer.companyName}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active users in your team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockMetrics.totalSpend.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.conversions}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your account information and plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Company</span>
              <span className="text-sm text-gray-600">{customer.companyName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan</span>
              <Badge variant="outline" className={getPlanBadgeColor(customer.plan || 'basic')}>
                {customer.plan || 'Basic'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Member Since</span>
              <span className="text-sm text-gray-600">
                {new Date(customer.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short'
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Team Size</span>
              <span className="text-sm text-gray-600">{customer.users.length} users</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Overview
            </CardTitle>
            <CardDescription>Key metrics from your campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">
                  {mockMetrics.impressions.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600">Impressions</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <MousePointer className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">
                  {mockMetrics.clicks.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">Clicks</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">
                  {((mockMetrics.clicks / mockMetrics.impressions) * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-purple-600">CTR</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>Users with access to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customer.users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="h-8 w-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{user.name || 'No Name'}</div>
                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {user.role.name}
                    </Badge>
                    <span className={`text-xs ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest updates and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity to display</p>
            <p className="text-sm mt-1">Activity will appear here as you use the platform</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 