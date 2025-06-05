"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users2, BarChart3 } from "lucide-react"
import { getAuthError, showAuthError, showAuthSuccess } from "@/lib/auth-utils"

export default function SubCustomerSignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/subcustomer/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("subcustomer-signin", {
        email,
        password,
        redirect: false,
      })

      if (result?.error || result?.status === 401) {
        const authError = getAuthError(result)
        showAuthError(authError)
      } else if (result?.ok) {
        showAuthSuccess("Welcome back! Redirecting to dashboard...")
        router.push(callbackUrl)
      } else {
        const authError = getAuthError(result)
        showAuthError(authError)
      }
    } catch (error) {
      const authError = {
        type: 'network' as const,
        message: 'Connection failed',
        details: 'Unable to connect to authentication server. Please check your internet connection.'
      }
      showAuthError(authError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
            <Users2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sub-Customer Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your dedicated campaign workspace
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sub-Customer Login
            </CardTitle>
            <CardDescription>
              Sign in to your sub-account dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Sub-Account Access
              </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Sub-Customer Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="subcustomer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  "Access Sub-Customer Portal"
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-1">Sub-Account Access</p>
              <p className="text-xs text-blue-700">
                Your sub-customer account provides access to specific campaigns and analytics assigned by your parent customer.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Main customer?{" "}
            <a href="/auth/customer/signin" className="text-purple-600 hover:text-purple-500">
              Customer Login
            </a>
          </p>
          <p className="text-sm text-gray-500">
            Need support?{" "}
            <a href="/auth/staff/signin" className="text-blue-600 hover:text-blue-500">
              Contact Staff
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 