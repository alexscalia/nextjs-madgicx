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
import { Plus, Loader2, AlertCircle } from "lucide-react"

interface ConnectAccountDialogProps {
  customerId: string
}

const platforms = [
  { value: 'meta', label: 'Meta (Facebook)', description: 'Connect your Facebook Ads account' },
  { value: 'google_ads', label: 'Google Ads', description: 'Connect your Google Ads account' },
  { value: 'ga4', label: 'Google Analytics 4', description: 'Connect your GA4 property' },
  { value: 'tiktok', label: 'TikTok Ads', description: 'Connect your TikTok Ads account' },
]

export function ConnectAccountDialog({ customerId }: ConnectAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        setFormData({
          platform: '',
          accountId: '',
          accountName: '',
          accessToken: ''
        })
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Connect Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
              onClick={() => setOpen(false)}
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