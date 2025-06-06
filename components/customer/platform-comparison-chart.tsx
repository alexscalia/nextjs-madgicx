"use client"

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

interface PlatformData {
  platform: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  campaigns: number
}

interface PlatformComparisonChartProps {
  data: PlatformData[]
}

export function PlatformComparisonChart({ data }: PlatformComparisonChartProps) {
  // Process data for the chart
  const chartData = data.map(item => ({
    ...item,
    platform: item.platform === 'meta' ? 'Meta' : 
              item.platform === 'google_ads' ? 'Google Ads' :
              item.platform === 'tiktok' ? 'TikTok' :
              item.platform === 'ga4' ? 'GA4' :
              item.platform
  }))

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'meta':
        return '#3b82f6'
      case 'google ads':
        return '#10b981'
      case 'tiktok':
        return '#ec4899'
      case 'ga4':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p>Spend: <span className="font-medium">${data.spend.toLocaleString()}</span></p>
            <p>Impressions: <span className="font-medium">{data.impressions.toLocaleString()}</span></p>
            <p>Clicks: <span className="font-medium">{data.clicks.toLocaleString()}</span></p>
            <p>Conversions: <span className="font-medium">{data.conversions.toLocaleString()}</span></p>
            <p>Campaigns: <span className="font-medium">{data.campaigns}</span></p>
          </div>
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-sm">No platform data available</p>
          <p className="text-xs mt-1">Connect accounts to see platform comparison</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="platform" 
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="spend" 
            fill="#10b981"
            name="Spend ($)"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="conversions" 
            fill="#f59e0b"
            name="Conversions"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 