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
  Bell,
  Building2
} from "lucide-react"
import { AccountSelector } from "./account-selector"

export function CustomerTopBar() {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut()
  }

  // Helper function to get full name
  const getFullName = (user: { firstName?: string | null; middleName?: string | null; lastName?: string | null } | undefined) => {
    if (!user) return 'Customer User'
    const parts = [user.firstName, user.middleName, user.lastName].filter((part): part is string => Boolean(part))
    return parts.length > 0 ? parts.join(' ') : 'Customer User'
  }

  // Helper function to get initials
  const getInitials = (user: { firstName?: string | null; middleName?: string | null; lastName?: string | null } | undefined) => {
    if (!user) return 'C'
    const parts = [user.firstName, user.middleName, user.lastName].filter((part): part is string => Boolean(part))
    return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2) || 'C'
  }

  return (
    <>
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left side - Company Name */}
          <div className="flex items-center gap-6">
            {session?.user?.companyName && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {session.user.companyName}
                </span>
              </div>
            )}
          </div>

        {/* Right side - Account selector, notifications, and user info */}
        <div className="flex items-center gap-4">
          {/* Account Selector */}
          <AccountSelector />
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative cursor-pointer">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-600 rounded-full text-xs"></span>
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-600 text-white text-sm">
                      {getInitials(session?.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {session?.user?.firstName || getFullName(session?.user)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {session?.user?.customerRole || 'User'}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Mail className="h-4 w-4 mr-2" />
                Inbox
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      </div>


    </>
  )
} 