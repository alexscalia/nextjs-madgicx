"use client"

import { useEffect, useState } from 'react'
import { useAccount } from "@/lib/account-context"
import { CampaignCard } from "./campaign-card"
import { CreateCampaignDialog } from "./create-campaign-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Target,
  RefreshCw,
  DollarSign,
  Eye,
  MousePointer,
  Filter
} from "lucide-react"

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

interface ConnectedAccount {
  id: string
  platform: string
  accountName: string
}

interface CampaignsClientProps {
  initialCampaigns: Campaign[]
  connectedAccounts: ConnectedAccount[]
  customerId: string
}

export function CampaignsClient({ 
  initialCampaigns, 
  connectedAccounts, 
  customerId 
}: CampaignsClientProps) {
  const { selectedAccount } = useAccount()
  const [campaigns] = useState<Campaign[]>(initialCampaigns)

  // Filter campaigns by selected account
  const filteredCampaigns = selectedAccount 
    ? campaigns.filter(campaign => campaign.connectedAccountId === selectedAccount.id)
    : campaigns

  // Calculate metrics for filtered campaigns
  const getAggregateMetrics = () => {
    const isMetricsObject = (obj: unknown): obj is { spend?: number; impressions?: number; clicks?: number } => {
      return obj !== null && typeof obj === 'object'
    }
    
    const totalCampaigns = filteredCampaigns.length
    const activeCampaigns = filteredCampaigns.filter(c => c.status.toLowerCase() === 'active').length
    
    const totalSpend = filteredCampaigns.reduce((sum, campaign) => {
      const metrics = isMetricsObject(campaign.metrics) ? campaign.metrics : {}
      return sum + (metrics?.spend || 0)
    }, 0)
    const totalImpressions = filteredCampaigns.reduce((sum, campaign) => {
      const metrics = isMetricsObject(campaign.metrics) ? campaign.metrics : {}
      return sum + (metrics?.impressions || 0)
    }, 0)
    const totalClicks = filteredCampaigns.reduce((sum, campaign) => {
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

  // Refresh campaigns when account changes
  useEffect(() => {
    if (selectedAccount) {
      // Optionally fetch campaigns specific to the selected account
      // For now, we'll just use the existing campaigns
    }
  }, [selectedAccount])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600">
            {selectedAccount 
              ? `Manage campaigns for ${selectedAccount.accountName}`
              : "Manage your advertising campaigns across all platforms"
            }
          </p>
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
            customerId={customerId}
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
                  <a href="/customer/accounts" className="underline cursor-pointer">
                    Connect accounts
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Filter Info */}
      {selectedAccount && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {selectedAccount.platform === 'meta' ? 'f' : 
                 selectedAccount.platform === 'google_ads' ? 'G' : 
                 selectedAccount.platform === 'tiktok' ? 'T' : '?'}
              </div>
              <div>
                <p className="font-medium text-blue-800">
                  Showing campaigns for: {selectedAccount.accountName}
                </p>
                <p className="text-sm text-blue-600">
                  Switch accounts using the selector above to view other campaigns
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
              {selectedAccount ? `From ${selectedAccount.accountName}` : "Across all campaigns"}
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

      {/* Campaigns Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {selectedAccount ? `Campaigns from ${selectedAccount.accountName}` : "All Campaigns"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedAccount ? "No campaigns found" : "No campaigns yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {selectedAccount 
                  ? `No campaigns found for ${selectedAccount.accountName}. Try selecting a different account or create a new campaign.`
                  : "Create your first campaign to start tracking performance and managing your ads."
                }
              </p>
              <CreateCampaignDialog 
                customerId={customerId}
                connectedAccounts={connectedAccounts}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 