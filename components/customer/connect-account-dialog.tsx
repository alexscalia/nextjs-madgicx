"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, AlertCircle, Search, Building2, Calendar } from "lucide-react"

interface ConnectAccountDialogProps {
  customerId: string
}

const platforms = [
  { value: 'meta', label: 'Meta (Facebook)', description: 'Connect your Facebook Ads account' },
  { value: 'google_ads', label: 'Google Ads', description: 'Connect your Google Ads account' },
  { value: 'ga4', label: 'Google Analytics 4', description: 'Connect your GA4 property' },
  { value: 'tiktok', label: 'TikTok Ads', description: 'Connect your TikTok Ads account' },
]

interface DiscoveredAccount {
  facebookId: string
  accountId: string
  name: string
  currency: string
  timezone: string
  status: number
  business?: string
  businessName?: string
  spendCap?: string
  createdTime: string
}

export function ConnectAccountDialog({ customerId }: ConnectAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [discoveredAccounts, setDiscoveredAccounts] = useState<DiscoveredAccount[]>([])
  const [showDiscoveryMode, setShowDiscoveryMode] = useState(false)
  const [discoveryToken, setDiscoveryToken] = useState('')
  const [formData, setFormData] = useState({
    platform: '',
    accountId: '',
    accountName: '',
    accessToken: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/customer/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          customerId
        }),
      })

      if (response.ok) {
        setOpen(false)
        resetDialog()
        // Refresh the page to show the new account
        window.location.reload()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to connect account')
      }
          } catch {
        setError('Network error. Please try again.')
      } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDiscoverAccounts = async () => {
    if (!discoveryToken.trim()) {
      setError('Please enter an access token to discover accounts')
      return
    }

    setIsDiscovering(true)
    setError(null)
    setDiscoveredAccounts([])

    try {
      const response = await fetch('/api/customer/accounts/discover-facebook-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: discoveryToken.trim()
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setDiscoveredAccounts(data.accounts)
        if (data.accounts.length === 0) {
          setError('No Facebook ad accounts found with this token. Make sure the token has the required permissions.')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to discover accounts')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsDiscovering(false)
    }
  }

  const handleSelectDiscoveredAccount = (account: DiscoveredAccount) => {
    setFormData({
      platform: 'meta',
      accountId: account.accountId,
      accountName: account.businessName ? `${account.name} (${account.businessName})` : account.name,
      accessToken: discoveryToken
    })
    setShowDiscoveryMode(false)
  }

  const resetDialog = () => {
    setFormData({
      platform: '',
      accountId: '',
      accountName: '',
      accessToken: ''
    })
    setDiscoveredAccounts([])
    setShowDiscoveryMode(false)
    setDiscoveryToken('')
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) {
        resetDialog()
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Connect Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Connect New Account</DialogTitle>
            <DialogDescription>
              Connect your advertising platform account to start managing campaigns and analyzing performance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="platform">Platform</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(value) => handleInputChange('platform', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      <div>
                        <div className="font-medium">{platform.label}</div>
                        <div className="text-xs text-gray-500">{platform.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Facebook Account Discovery */}
            {formData.platform === 'meta' && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm text-blue-800">🔍 Account Discovery (Recommended)</CardTitle>
                      <CardDescription className="text-xs text-blue-600">
                        For agency tokens: Automatically find all accessible ad accounts
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDiscoveryMode(!showDiscoveryMode)}
                      className="text-blue-600 border-blue-300"
                    >
                      <Search className="h-3 w-3 mr-1" />
                      {showDiscoveryMode ? 'Manual' : 'Discover'}
                    </Button>
                  </div>
                </CardHeader>
                
                {showDiscoveryMode && (
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter your Facebook access token"
                        type="password"
                        value={discoveryToken}
                        onChange={(e) => setDiscoveryToken(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleDiscoverAccounts}
                        disabled={isDiscovering || !discoveryToken.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isDiscovering ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {discoveredAccounts.length > 0 && (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        <Label className="text-xs font-medium text-gray-600">
                          Found {discoveredAccounts.length} ad account(s). Click to select:
                        </Label>
                        {discoveredAccounts.map((account) => (
                          <Card 
                            key={account.accountId}
                            className="cursor-pointer hover:bg-gray-50 border transition-colors"
                            onClick={() => handleSelectDiscoveredAccount(account)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{account.name}</div>
                                  {account.businessName && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Building2 className="h-3 w-3" />
                                      {account.businessName}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      ID: {account.accountId}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {account.currency}
                                    </Badge>
                                    <Badge 
                                      variant={account.status === 1 ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {account.status === 1 ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                placeholder="Enter your account ID"
                value={formData.accountId}
                onChange={(e) => handleInputChange('accountId', e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="Enter a friendly name for this account"
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Enter your access token"
                value={formData.accessToken}
                onChange={(e) => handleInputChange('accessToken', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                This token is encrypted and stored securely. Never share your access tokens.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setOpen(false)
                resetDialog()
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.platform || !formData.accountId || !formData.accountName || !formData.accessToken}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Account
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 