"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  TrendingUp
} from "lucide-react"

interface Campaign {
  id: string
  name: string
  platform: string
  status: string
  budget: number | null
  metrics: unknown
  connectedAccount?: {
    platform: string
    accountName: string
  } | null
}

interface TopCampaignsTableProps {
  campaigns: Campaign[]
}

type SortField = 'name' | 'spend' | 'impressions' | 'clicks' | 'conversions' | 'ctr' | 'cpc'
type SortDirection = 'asc' | 'desc'

export function TopCampaignsTable({ campaigns }: TopCampaignsTableProps) {
  const [sortField, setSortField] = useState<SortField>('spend')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Process campaigns data
  const processedCampaigns = campaigns.map(campaign => {
    const isMetricsObject = (obj: unknown): obj is { spend?: number; impressions?: number; clicks?: number; conversions?: number } => {
      return obj !== null && typeof obj === 'object'
    }
    
    const metrics = isMetricsObject(campaign.metrics) ? campaign.metrics : {}
    const spend = metrics.spend || 0
    const impressions = metrics.impressions || 0
    const clicks = metrics.clicks || 0
    const conversions = metrics.conversions || 0
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
    const cpc = clicks > 0 ? spend / clicks : 0

    return {
      ...campaign,
      calculatedMetrics: {
        spend,
        impressions,
        clicks,
        conversions,
        ctr,
        cpc
      }
    }
  })

  // Sort campaigns
  const sortedCampaigns = [...processedCampaigns].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortField) {
      case 'name':
        aValue = a.name
        bValue = b.name
        break
      case 'spend':
        aValue = a.calculatedMetrics.spend
        bValue = b.calculatedMetrics.spend
        break
      case 'impressions':
        aValue = a.calculatedMetrics.impressions
        bValue = b.calculatedMetrics.impressions
        break
      case 'clicks':
        aValue = a.calculatedMetrics.clicks
        bValue = b.calculatedMetrics.clicks
        break
      case 'conversions':
        aValue = a.calculatedMetrics.conversions
        bValue = b.calculatedMetrics.conversions
        break
      case 'ctr':
        aValue = a.calculatedMetrics.ctr
        bValue = b.calculatedMetrics.ctr
        break
      case 'cpc':
        aValue = a.calculatedMetrics.cpc
        bValue = b.calculatedMetrics.cpc
        break
      default:
        aValue = a.calculatedMetrics.spend
        bValue = b.calculatedMetrics.spend
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    // Both values should be numbers at this point
    const aNum = typeof aValue === 'number' ? aValue : 0
    const bNum = typeof bValue === 'number' ? bValue : 0
    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3" />
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3" />
      : <ArrowDown className="h-3 w-3" />
  }

  const getPlatformStyle = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'meta':
        return 'bg-blue-100 text-blue-800'
      case 'google_ads':
        return 'bg-green-100 text-green-800'
      case 'tiktok':
        return 'bg-pink-100 text-pink-800'
      case 'ga4':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-sm">No campaigns to display</p>
        <p className="text-xs mt-1">Create campaigns to see performance data</p>
      </div>
    )
  }

  // Show top 10 campaigns
  const topCampaigns = sortedCampaigns.slice(0, 10)

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                Campaign
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Status</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 text-right"
              onClick={() => handleSort('spend')}
            >
              <div className="flex items-center justify-end gap-1">
                Spend
                {getSortIcon('spend')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 text-right"
              onClick={() => handleSort('impressions')}
            >
              <div className="flex items-center justify-end gap-1">
                Impressions
                {getSortIcon('impressions')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 text-right"
              onClick={() => handleSort('clicks')}
            >
              <div className="flex items-center justify-end gap-1">
                Clicks
                {getSortIcon('clicks')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 text-right"
              onClick={() => handleSort('conversions')}
            >
              <div className="flex items-center justify-end gap-1">
                Conversions
                {getSortIcon('conversions')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 text-right"
              onClick={() => handleSort('ctr')}
            >
              <div className="flex items-center justify-end gap-1">
                CTR
                {getSortIcon('ctr')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 text-right"
              onClick={() => handleSort('cpc')}
            >
              <div className="flex items-center justify-end gap-1">
                CPC
                {getSortIcon('cpc')}
              </div>
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topCampaigns.map((campaign) => (
            <TableRow key={campaign.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium">{campaign.name}</div>
                  <div className="text-sm text-gray-500">
                    {campaign.connectedAccount?.accountName || 'Unknown Account'}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getPlatformStyle(campaign.platform)}>
                  {campaign.platform === 'meta' ? 'Meta' : 
                   campaign.platform === 'google_ads' ? 'Google Ads' :
                   campaign.platform === 'tiktok' ? 'TikTok' :
                   campaign.platform === 'ga4' ? 'GA4' :
                   campaign.platform}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusStyle(campaign.status)}>
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                ${campaign.calculatedMetrics.spend.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {campaign.calculatedMetrics.impressions.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {campaign.calculatedMetrics.clicks.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {campaign.calculatedMetrics.conversions.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {campaign.calculatedMetrics.ctr.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right">
                ${campaign.calculatedMetrics.cpc.toFixed(2)}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <a href={`/customer/campaigns/${campaign.id}`}>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 