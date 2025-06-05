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
  Users, 
  Building2, 
  UserCheck, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Dashboard",
    href: "/staff/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Customers",
    href: "/staff/customers",
    icon: Users,
  },
  {
    name: "Sub-Customers",
    href: "/staff/subcustomers", 
    icon: Building2,
  },
  {
    name: "Staff Users",
    href: "/staff/users",
    icon: UserCheck,
  },
  {
    name: "Settings",
    href: "/staff/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/staff/signin" })
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
              <h1 className="text-xl font-bold text-blue-600">Madgicx</h1>
              <p className="text-sm text-gray-500">Staff Portal</p>
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
                  ? "bg-blue-100 text-blue-700 border border-blue-200" 
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

      {/* User Profile */}
      <div className="p-4">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              {session?.user?.name?.[0]?.toUpperCase() || 'S'}
            </AvatarFallback>
          </Avatar>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || 'Staff User'}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {session?.user?.role || 'Staff'}
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