"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  LayoutDashboard, 
  BarChart3, 
  Target, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Dashboard",
    href: "/customer/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Campaigns",
    href: "/customer/campaigns",
    icon: Target,
  },
  {
    name: "Analytics", 
    href: "/customer/analytics",
    icon: BarChart3,
  },
  {
    name: "Team",
    href: "/customer/team",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/customer/settings",
    icon: Settings,
  },
]

export function CustomerSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/customer/signin" })
  }

  return (
    <div className={cn(
      "bg-white shadow-lg transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-green-600">Madgicx</h1>
              <p className="text-sm text-gray-500">Customer Portal</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Company & User Profile */}
      <div className="p-4">
        {!collapsed && session?.user?.companyName && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 truncate">
                {session.user.companyName}
              </span>
            </div>
          </div>
        )}
        
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-green-600 text-white text-sm">
              {session?.user?.name?.[0]?.toUpperCase() || 'C'}
            </AvatarFallback>
          </Avatar>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || 'Customer User'}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {session?.user?.role || 'User'}
                </Badge>
              </div>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full mt-3 justify-start text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  )
} 