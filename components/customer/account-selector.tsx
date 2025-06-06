"use client"

import { useState, useEffect } from 'react'
import { ChevronDown, Search, Plus, Building2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAccount } from "@/lib/account-context"
import { cn } from "@/lib/utils"

interface ConnectedAccount {
  id: string
  platform: string
  accountId: string
  accountName: string
  accessToken: string
  refreshToken?: string | null
  expiresAt?: Date | null
  isActive: boolean
  currency?: string
  createdAt: Date
  updatedAt: Date
}

interface AccountSelectorProps {
  onNewAccount?: () => void
}

export function AccountSelector({ onNewAccount }: AccountSelectorProps) {
  const { selectedAccount, accounts, setSelectedAccount, setAccounts, isLoading, setIsLoading } = useAccount()
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // Fetch accounts on mount
  useEffect(() => {
    fetchAccounts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/customer/accounts', {
        credentials: 'include',
      })
      if (response.ok) {
        const data: ConnectedAccount[] = await response.json()
        setAccounts(data)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter accounts based on search term
  const filteredAccounts = accounts.filter(account =>
    account.accountName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'meta':
      case 'facebook':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            f
          </div>
        )
      case 'google_ads':
      case 'google':
        return (
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
            G
          </div>
        )
      case 'tiktok':
        return (
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
            T
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
        )
    }
  }

  const handleAccountSelect = (account: ConnectedAccount) => {
    setSelectedAccount(account)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleNewAccount = () => {
    setIsOpen(false)
    onNewAccount?.()
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <div>
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "flex items-center gap-3 px-4 py-2 h-auto bg-white hover:bg-gray-50 border border-gray-200 text-left justify-start",
            "text-gray-900 rounded-lg min-w-[240px]"
          )}
        >
          {selectedAccount ? (
            <>
              {getPlatformIcon(selectedAccount.platform)}
              <div className="flex-1">
                <div className="font-medium text-gray-900 truncate">
                  {selectedAccount.accountName}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500">{accounts.length}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Select Account</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-[400px] p-0 bg-white border-gray-200 shadow-lg"
        align="start"
      >
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Account List */}
        <div className="max-h-80 overflow-y-auto">
          {filteredAccounts.map((account) => (
            <button
              key={account.id}
              onClick={() => handleAccountSelect(account)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left",
                selectedAccount?.id === account.id && "bg-blue-50 border-r-2 border-blue-500"
              )}
            >
              {getPlatformIcon(account.platform)}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {account.accountName}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {account.platform === 'meta' ? 'Meta' : 
                   account.platform === 'google_ads' ? 'Google Ads' :
                   account.platform === 'tiktok' ? 'TikTok' :
                   account.platform}
                </div>
              </div>
            </button>
          ))}

          {filteredAccounts.length === 0 && searchTerm && (
            <div className="px-4 py-8 text-center text-gray-400">
              <div className="text-sm">No accounts found</div>
              <div className="text-xs mt-1">Try adjusting your search</div>
            </div>
          )}
        </div>

        {/* New Ad Account Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleNewAccount}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" />
            New Ad Account
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 