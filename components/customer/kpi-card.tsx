"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign,
  Eye,
  MousePointer,
  Target,
  BarChart3,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap = {
  DollarSign,
  Eye,
  MousePointer,
  Target,
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  Minus
}

interface KPICardProps {
  title: string
  value: string
  trend?: number
  icon: keyof typeof iconMap
  iconColor?: string
  description?: string
}

export function KPICard({ 
  title, 
  value, 
  trend, 
  icon, 
  iconColor = "text-gray-600",
  description 
}: KPICardProps) {
  const Icon = iconMap[icon]
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return Minus
    return trend > 0 ? TrendingUp : TrendingDown
  }

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return "text-gray-500"
    return trend > 0 ? "text-green-600" : "text-red-600"
  }

  const getTrendText = () => {
    if (trend === undefined || trend === 0) return "No change"
    const percentage = Math.abs(trend).toFixed(1)
    return trend > 0 ? `+${percentage}%` : `-${percentage}%`
  }

  const TrendIcon = getTrendIcon()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
          {title}
          <Icon className={cn("h-4 w-4", iconColor)} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{value}</div>
          
          {trend !== undefined && (
            <div className="flex items-center gap-1">
              <TrendIcon className={cn("h-3 w-3", getTrendColor())} />
              <span className={cn("text-xs font-medium", getTrendColor())}>
                {getTrendText()}
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 