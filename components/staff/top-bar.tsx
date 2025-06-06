"use client"

import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  LogOut, 
  ChevronDown,
  Bell
} from "lucide-react"

export function TopBar() {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut()
  }

  // Helper function to get full name
  const getFullName = (user: { firstName?: string | null; middleName?: string | null; lastName?: string | null } | undefined) => {
    if (!user) return 'Staff User'
    const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : 'Staff User'
  }

  // Helper function to get initials
  const getInitials = (user: { firstName?: string | null; middleName?: string | null; lastName?: string | null } | undefined) => {
    if (!user) return 'S'
    const parts = [user.firstName, user.middleName, user.lastName].filter((part): part is string => Boolean(part))
    return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2) || 'S'
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - can be used for breadcrumbs or page title in future */}
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Madgicx</h1>
          <span className="ml-2 text-sm text-gray-500">Staff Portal</span>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full text-xs"></span>
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {getInitials(session?.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {session?.user?.firstName || getFullName(session?.user)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {session?.user?.role || 'Staff'}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Inbox
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}