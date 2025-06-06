import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { PrismaClient } from "../../generated/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CampaignCard } from "@/components/customer/campaign-card"
import { CreateCampaignDialog } from "@/components/customer/create-campaign-dialog"
import { 
  Target,
  Filter,
  DollarSign,
  Eye,
  MousePointer,
  RefreshCw
} from "lucide-react"

const prisma = new PrismaClient()

// Define Campaign interface to match our database schema
interface Campaign {
  id: string
  customerId: string
  subCustomerId: string | null
  connectedAccountId: string | null
  platform: string
  campaignId: string
  name: string
  status: string
  budget: number | null
  startDate: Date | null
  endDate: Date | null
  metrics: unknown
  date: Date
  createdAt: Date
  updatedAt: Date
  connectedAccount?: {
    platform: string
    accountName: string
  } | null
}

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.customerId) {
    return <div>Unauthorized</div>
  }

  // Fetch campaigns for this customer from connected accounts
  const campaigns: Campaign[] = await prisma.campaign.findMany({
    where: {
      customerId: session.user.customerId,
      deletedAt: null
    },
    include: {
      connectedAccount: {
        select: {
          platform: true,
          accountName: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Fetch connected accounts to see which platforms are available
  const connectedAccounts = await prisma.connectedAccount.findMany({
    where: {
      customerId: session.user.customerId,
      deletedAt: null,
      accessToken: {
        not: null
      }
    },
    select: {
      id: true,
      platform: true,
      accountName: true
    }
  })

  // Calculate aggregate metrics
  const getAggregateMetrics = () => {
    const totalCampaigns = campaigns.length
    const activeCampaigns = campaigns.filter(c => c.status.toLowerCase() === 'active').length
    
    const isMetricsObject = (obj: unknown): obj is { spend?: number; impressions?: number; clicks?: number } => {
      return obj !== null && typeof obj === 'object'
    }
    
    const totalSpend = campaigns.reduce((sum, campaign) => {
      const metrics = isMetricsObject(campaign.metrics) ? campaign.metrics : {}
      return sum + (metrics?.spend || 0)
    }, 0)
    const totalImpressions = campaigns.reduce((sum, campaign) => {
      const metrics = isMetricsObject(campaign.metrics) ? campaign.metrics : {}
      return sum + (metrics?.impressions || 0)
    }, 0)
    const totalClicks = campaigns.reduce((sum, campaign) => {
      const metrics = isMetricsObject(campaign.metrics) ? campaign.metrics : {}
      return sum + (metrics?.clicks || 0)
    }, 0)
    
    return {
      totalCampaigns,
      activeCampaigns,
      totalSpend,
      totalImpressions,
      totalClicks,
      avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    }
  }

  const metrics = getAggregateMetrics()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600">Manage your advertising campaigns across all platforms</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
          {campaigns.length === 0 && connectedAccounts.length > 0 && (
            <form action="/api/customer/campaigns/sample" method="POST">
              <Button type="submit" variant="outline" size="sm">
                <Target className="h-4 w-4 mr-2" />
                Generate Sample Data
              </Button>
            </form>
          )}
          <CreateCampaignDialog 
            customerId={session.user.customerId}
            connectedAccounts={connectedAccounts}
          />
        </div>
      </div>

      {/* Connected Accounts Status */}
      {connectedAccounts.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">No Connected Accounts</p>
                <p className="text-sm text-yellow-600">
                  Connect your advertising accounts to start managing campaigns.{" "}
                  <a href="/customer/accounts" className="underline">
                    Connect accounts
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{metrics.totalCampaigns}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {metrics.activeCampaigns} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">${metrics.totalSpend.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">{metrics.totalImpressions.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Total reach
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Average CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold">{metrics.avgCtr.toFixed(2)}%</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Click-through rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search campaigns..."
                className="w-full"
                // TODO: Add search functionality
              />
            </div>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="meta">Meta (Facebook)</SelectItem>
                <SelectItem value="google_ads">Google Ads</SelectItem>
                <SelectItem value="tiktok">TikTok Ads</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="spend_high">Highest Spend</SelectItem>
                <SelectItem value="spend_low">Lowest Spend</SelectItem>
                <SelectItem value="performance">Best Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Campaigns</CardTitle>
          <CardDescription>
            Manage and monitor your advertising campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Found</h3>
              <p className="text-gray-500 mb-6">
                {connectedAccounts.length > 0 
                  ? "Create your first campaign or sync existing ones from your connected accounts."
                  : "Connect your advertising accounts to start managing campaigns."
                }
              </p>
              {connectedAccounts.length > 0 ? (
                <CreateCampaignDialog 
                  customerId={session.user.customerId}
                  connectedAccounts={connectedAccounts}
                />
              ) : (
                <Button asChild>
                  <a href="/customer/accounts">Connect Accounts</a>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 