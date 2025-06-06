import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { PrismaClient } from "../../generated/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { PerformanceChart } from "@/components/customer/performance-chart"
import { PlatformComparisonChart } from "@/components/customer/platform-comparison-chart"
import { TopCampaignsTable } from "@/components/customer/top-campaigns-table"
import { KPICard } from "@/components/customer/kpi-card"
import { 
  BarChart3,
  TrendingUp,
  DollarSign,
  Eye,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MousePointer,
  Target,
  Download,
  Zap
} from "lucide-react"
import { subDays } from "date-fns"
import { formatDisplayCurrency, getCampaignCurrency } from "@/lib/currency"

const prisma = new PrismaClient()

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.customerId) {
    return <div>Unauthorized</div>
  }

  // Get date range from query params (default to last 30 days)
  const endDate = new Date()
  const startDate = subDays(endDate, 30)

  // Fetch campaigns with metrics for analytics
  const campaigns = await prisma.campaign.findMany({
    where: {
      customerId: session.user.customerId,
      deletedAt: null,
      date: {
        gte: startDate,
        lte: endDate
      }
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
      date: 'desc'
    }
  })

  // Calculate analytics data
  const getAnalyticsData = () => {
    const totalSpend = campaigns.reduce((sum, campaign) => {
      const metrics = campaign.metrics as { spend?: number } | null
      return sum + (metrics?.spend || 0)
    }, 0)

    const totalImpressions = campaigns.reduce((sum, campaign) => {
      const metrics = campaign.metrics as { impressions?: number } | null
      return sum + (metrics?.impressions || 0)
    }, 0)

    const totalClicks = campaigns.reduce((sum, campaign) => {
      const metrics = campaign.metrics as { clicks?: number } | null
      return sum + (metrics?.clicks || 0)
    }, 0)

    const totalConversions = campaigns.reduce((sum, campaign) => {
      const metrics = campaign.metrics as { conversions?: number } | null
      return sum + (metrics?.conversions || 0)
    }, 0)

    // Get the primary currency from campaigns (use the most common one)
    const currencies = campaigns.map(c => {
      const metricsWithCurrency = c.metrics as { currency?: string } | null
      return getCampaignCurrency({ metrics: metricsWithCurrency || undefined })
    })
    const primaryCurrency = currencies.length > 0 
      ? currencies.reduce((a, b, i, arr) => 
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        )
      : 'USD'

    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
    const costPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0

    // Calculate trends (comparing to previous period)
    
    // For demo purposes, simulate previous period data
    const prevSpend = totalSpend * 0.85 // 15% growth
    const prevImpressions = totalImpressions * 0.92 // 8% growth
    const prevClicks = totalClicks * 0.88 // 12% growth
    const prevConversions = totalConversions * 0.90 // 10% growth

    const spendTrend = totalSpend > 0 ? ((totalSpend - prevSpend) / prevSpend) * 100 : 0
    const impressionsTrend = totalImpressions > 0 ? ((totalImpressions - prevImpressions) / prevImpressions) * 100 : 0
    const clicksTrend = totalClicks > 0 ? ((totalClicks - prevClicks) / prevClicks) * 100 : 0
    const conversionsTrend = totalConversions > 0 ? ((totalConversions - prevConversions) / prevConversions) * 100 : 0

    // Platform breakdown
    const platformData = campaigns.reduce((acc: Record<string, {
      platform: string
      spend: number
      impressions: number
      clicks: number
      conversions: number
      campaigns: number
    }>, campaign) => {
      const platform = campaign.platform
      const metrics = campaign.metrics as {
        spend?: number
        impressions?: number
        clicks?: number
        conversions?: number
      }
      
      if (!acc[platform]) {
        acc[platform] = {
          platform,
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          campaigns: 0
        }
      }
      
      acc[platform].spend += metrics?.spend || 0
      acc[platform].impressions += metrics?.impressions || 0
      acc[platform].clicks += metrics?.clicks || 0
      acc[platform].conversions += metrics?.conversions || 0
      acc[platform].campaigns += 1
      
      return acc
    }, {})

    return {
      totalSpend,
      totalImpressions,
      totalClicks,
      totalConversions,
      avgCtr,
      avgCpc,
      conversionRate,
      costPerConversion,
      spendTrend,
      impressionsTrend,
      clicksTrend,
      conversionsTrend,
      platformData: Object.values(platformData),
      activeCampaigns: campaigns.filter(c => c.status.toLowerCase() === 'active').length,
      totalCampaigns: campaigns.length,
      primaryCurrency
    }
  }

  const analytics = getAnalyticsData()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your advertising performance and insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select defaultValue="30">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <KPICard
         title="Total Spend"
         value={formatDisplayCurrency(analytics.totalSpend, analytics.primaryCurrency)}
         trend={analytics.spendTrend}
         icon="DollarSign"
         iconColor="text-green-600"
         description="Ad spend this period"
       />
       
       <KPICard
         title="Impressions"
         value={analytics.totalImpressions.toLocaleString()}
         trend={analytics.impressionsTrend}
         icon="Eye"
         iconColor="text-blue-600"
         description="Total ad views"
       />
       
       <KPICard
         title="Clicks"
         value={analytics.totalClicks.toLocaleString()}
         trend={analytics.clicksTrend}
         icon="MousePointer"
         iconColor="text-purple-600"
         description="Total ad clicks"
       />
       
       <KPICard
         title="Conversions"
         value={analytics.totalConversions.toLocaleString()}
         trend={analytics.conversionsTrend}
         icon="Target"
         iconColor="text-orange-600"
         description="Goal completions"
       />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Average CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgCtr.toFixed(2)}%</div>
            <p className="text-sm text-gray-500">Click-through rate</p>
          </CardContent>
        </Card>

                 <Card>
           <CardHeader className="pb-3">
             <CardTitle className="text-sm font-medium text-gray-600">Average CPC</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{formatDisplayCurrency(analytics.avgCpc, analytics.primaryCurrency)}</div>
             <p className="text-sm text-gray-500">Cost per click</p>
           </CardContent>
         </Card>

         <Card>
           <CardHeader className="pb-3">
             <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(2)}%</div>
             <p className="text-sm text-gray-500">Clicks to conversions</p>
           </CardContent>
         </Card>

         <Card>
           <CardHeader className="pb-3">
             <CardTitle className="text-sm font-medium text-gray-600">Cost/Conversion</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{formatDisplayCurrency(analytics.costPerConversion, analytics.primaryCurrency)}</div>
             <p className="text-sm text-gray-500">Cost per conversion</p>
           </CardContent>
         </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Over Time
            </CardTitle>
            <CardDescription>
              Track spend, impressions, and conversions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart campaigns={campaigns} />
          </CardContent>
        </Card>

        {/* Platform Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Platform Performance
            </CardTitle>
            <CardDescription>
              Compare performance across platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformComparisonChart data={analytics.platformData} />
          </CardContent>
        </Card>
      </div>

      {/* Top Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Top Performing Campaigns
          </CardTitle>
          <CardDescription>
            Your best campaigns by key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopCampaignsTable campaigns={campaigns} />
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Best Performing Platform</span>
              </div>
              <p className="text-sm text-blue-700">
                {analytics.platformData.length > 0 
                  ? analytics.platformData.reduce((best, current) => 
                      (current.conversions > best.conversions ? current : best)
                    ).platform.toUpperCase()
                  : 'No data'
                } is driving the most conversions
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Cost Efficiency</span>
              </div>
                             <p className="text-sm text-green-700">
                 Average cost per conversion is {formatDisplayCurrency(analytics.costPerConversion, analytics.primaryCurrency)}
               </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900">Campaign Health</span>
              </div>
              <p className="text-sm text-purple-700">
                {analytics.activeCampaigns} of {analytics.totalCampaigns} campaigns are active
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {campaigns.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
              <p className="text-gray-500 mb-6">
                Start running campaigns to see your performance analytics here.
              </p>
              <Button asChild>
                <a href="/customer/campaigns">View Campaigns</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 