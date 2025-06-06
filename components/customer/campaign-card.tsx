"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal,
  Play,
  Pause,
  Edit3,
  Eye,
  RefreshCw,
  DollarSign,
  Target,
  MousePointer
} from "lucide-react"
import { formatDisplayCurrency, getCampaignCurrency } from "@/lib/currency"

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

interface CampaignCardProps {
  campaign: Campaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // Parse metrics safely with type guard
  const isMetricsObject = (obj: unknown): obj is { spend?: number; impressions?: number; clicks?: number; currency?: string } => {
    return obj !== null && typeof obj === 'object'
  }
  
  const metrics = isMetricsObject(campaign.metrics) ? campaign.metrics : {}
  const spend = metrics.spend || 0
  const impressions = metrics.impressions || 0
  const clicks = metrics.clicks || 0
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
  const cpc = clicks > 0 ? spend / clicks : 0
  const currency = getCampaignCurrency({ metrics: metrics || undefined })

  // Get platform styling
  const getPlatformStyle = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'meta':
      case 'facebook':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'google_ads':
      case 'google':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'tiktok':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'ga4':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get status styling
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'ended':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAction = async (action: string) => {
    setIsLoading(true)
    try {
      // TODO: Implement actual API calls
      console.log(`${action} campaign ${campaign.id}`)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success notification
      // TODO: Add toast notification
    } catch (error) {
      console.error(`Failed to ${action} campaign:`, error)
      // TODO: Show error notification
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge className={getPlatformStyle(campaign.platform)}>
                {campaign.platform === 'meta' ? 'Meta' : 
                 campaign.platform === 'google_ads' ? 'Google Ads' :
                 campaign.platform === 'tiktok' ? 'TikTok' :
                 campaign.platform === 'ga4' ? 'GA4' :
                 campaign.platform}
              </Badge>
              <Badge variant="outline" className={getStatusStyle(campaign.status)}>
                {campaign.status}
              </Badge>
            </div>
            
            <div>
              <CardTitle className="text-lg leading-tight">{campaign.name}</CardTitle>
              <CardDescription className="text-sm">
                {campaign.connectedAccount?.accountName || 'Unknown Account'}
              </CardDescription>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isLoading}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAction('view')}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('edit')}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Campaign
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('sync')}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {campaign.status.toLowerCase() === 'active' ? (
                <DropdownMenuItem onClick={() => handleAction('pause')}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Campaign
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleAction('resume')}>
                  <Play className="h-4 w-4 mr-2" />
                  Resume Campaign
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Budget Information */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Budget</span>
          </div>
          <div className="text-right">
            <div className="font-semibold">
              {campaign.budget ? formatDisplayCurrency(campaign.budget, currency) : 'No limit'}
            </div>
            <div className="text-xs text-gray-500">
              Spent: {formatDisplayCurrency(spend, currency)}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Eye className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Impressions</span>
            </div>
            <div className="font-semibold text-sm">{impressions.toLocaleString()}</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MousePointer className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-600">Clicks</span>
            </div>
            <div className="font-semibold text-sm">{clicks.toLocaleString()}</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-600">CTR</span>
            </div>
            <div className="font-semibold text-sm">{ctr.toFixed(2)}%</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-orange-600" />
              <span className="text-xs font-medium text-orange-600">CPC</span>
            </div>
            <div className="font-semibold text-sm">{formatDisplayCurrency(cpc, currency)}</div>
          </div>
        </div>

        {/* Campaign Dates */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          <div className="flex justify-between">
            <span>
              Started: {campaign.startDate ? 
                new Date(campaign.startDate).toLocaleDateString() : 
                'Not set'
              }
            </span>
            {campaign.endDate && (
              <span>
                Ends: {new Date(campaign.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 