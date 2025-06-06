"use client"

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { format } from 'date-fns'

interface Campaign {
  id: string
  name: string
  date: Date
  metrics: unknown
}

interface ChartDataPoint {
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    color: string
    name: string
    value: number
    dataKey: string
  }>
  label?: string
}

interface PerformanceChartProps {
  campaigns: Campaign[]
}

export function PerformanceChart({ campaigns }: PerformanceChartProps) {
  // Process data for the chart
  const processChartData = (): ChartDataPoint[] => {
    const isMetricsObject = (obj: unknown): obj is { spend?: number; impressions?: number; clicks?: number; conversions?: number } => {
      return obj !== null && typeof obj === 'object'
    }
    
    // Group campaigns by date and aggregate metrics
    const dataByDate = campaigns.reduce((acc, campaign) => {
      const dateKey = format(new Date(campaign.date), 'yyyy-MM-dd')
      const metrics = isMetricsObject(campaign.metrics) ? campaign.metrics : {}
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0
        }
      }
      
      acc[dateKey].spend += metrics.spend || 0
      acc[dateKey].impressions += metrics.impressions || 0
      acc[dateKey].clicks += metrics.clicks || 0
      acc[dateKey].conversions += metrics.conversions || 0
      
      return acc
    }, {} as Record<string, ChartDataPoint>)
    
    // Convert to array and sort by date
    return Object.values(dataByDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => ({
        ...item,
        date: format(new Date(item.date), 'MMM dd')
      }))
  }

  const chartData = processChartData()

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {
                entry.dataKey === 'spend' 
                  ? `$${entry.value.toLocaleString()}`
                  : entry.value.toLocaleString()
              }
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-sm">No performance data available</p>
          <p className="text-xs mt-1">Data will appear once campaigns start running</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
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
          <Line 
            type="monotone" 
            dataKey="spend" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
            name="Spend ($)"
          />
          <Line 
            type="monotone" 
            dataKey="impressions" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            name="Impressions"
          />
          <Line 
            type="monotone" 
            dataKey="clicks" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
            name="Clicks"
          />
          <Line 
            type="monotone" 
            dataKey="conversions" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
            name="Conversions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 