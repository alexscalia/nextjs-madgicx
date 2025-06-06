"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Trash2,
  Settings,
  ExternalLink
} from "lucide-react"

interface ConnectedAccount {
  id: string
  platform: string
  accountId: string
  accountName: string
  accessToken: string | null
  refreshToken: string | null
  iconUrl?: string | null
  syncedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

interface ConnectedAccountCardProps {
  account: ConnectedAccount
}

export function ConnectedAccountCard({ account }: ConnectedAccountCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getPlatformInfo = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'meta':
        return {
          name: 'Meta (Facebook)',
          color: 'bg-blue-600',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50'
        }
      case 'google_ads':
        return {
          name: 'Google Ads',
          color: 'bg-green-600', 
          textColor: 'text-green-700',
          bgColor: 'bg-green-50'
        }
      case 'ga4':
        return {
          name: 'Google Analytics 4',
          color: 'bg-orange-600',
          textColor: 'text-orange-700', 
          bgColor: 'bg-orange-50'
        }
      case 'tiktok':
        return {
          name: 'TikTok Ads',
          color: 'bg-pink-600',
          textColor: 'text-pink-700',
          bgColor: 'bg-pink-50'
        }
      default:
        return {
          name: platform,
          color: 'bg-gray-600',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50'
        }
    }
  }

  const handleSync = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/customer/accounts/${account.id}/sync`, {
        method: 'POST'
      })
      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncCampaigns = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/customer/accounts/${account.id}/sync-campaigns`, {
        method: 'POST'
      })
      if (response.ok) {
        // Show success message
        alert('Campaigns synced successfully! Visit the Campaigns page to see your data.')
      } else {
        const errorData = await response.json()
        alert(`Sync failed: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Campaign sync failed:', error)
      alert('Campaign sync failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (confirm(`Are you sure you want to disconnect ${account.accountName}?`)) {
      try {
        const response = await fetch(`/api/customer/accounts/${account.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          window.location.reload()
        }
      } catch (error) {
        console.error('Disconnect failed:', error)
      }
    }
  }

  const platformInfo = getPlatformInfo(account.platform)
  const isConnected = !!account.accessToken
  const lastSynced = account.syncedAt 
    ? new Date(account.syncedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Never'

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {account.iconUrl ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img 
                  src={account.iconUrl} 
                  alt="Business logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to platform icon if image fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
                {/* Fallback platform icon */}
                <div className={`w-10 h-10 rounded-lg ${platformInfo.color} flex items-center justify-center`} style={{ marginTop: '-100%' }}>
                  <span className="text-white font-bold text-sm">
                    {platformInfo.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-lg ${platformInfo.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">
                  {platformInfo.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <CardTitle className="text-sm font-medium">{platformInfo.name}</CardTitle>
              <p className="text-xs text-gray-500">{account.accountName}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSync} disabled={!isConnected || isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Sync Account
              </DropdownMenuItem>
              {account.platform === 'meta' && (
                <DropdownMenuItem onClick={handleSyncCampaigns} disabled={!isConnected || isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Sync Campaigns
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Platform
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Disconnected
                </Badge>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Account ID</span>
          <span className="text-sm font-mono text-gray-900">{account.accountId}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Last Synced</span>
          <span className="text-sm text-gray-900">{lastSynced}</span>
        </div>
        
        <div className="pt-2 border-t">
          <div className="text-xs text-gray-500">
            Connected {new Date(account.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 