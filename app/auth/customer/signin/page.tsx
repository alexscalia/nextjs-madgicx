"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Building2, TrendingUp } from "lucide-react"
import { getAuthError, showAuthError, showAuthSuccess } from "@/lib/auth-utils"

export default function CustomerSignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/customer/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("customer-signin", {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Customer Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your organization's campaigns and analytics
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Customer User Login
            </CardTitle>
            <CardDescription>
              Sign in with your individual user account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Organization Member
              </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Your Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@company.com"
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
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  "Access Customer Portal"
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Acme Corp:</strong> john@acmecorp.com / jane@acmecorp.com / bob@acmecorp.com</p>
                <p><strong>TechStartup:</strong> alice@techstartup.com / mike@techstartup.com</p>
                <p><strong>Password:</strong> password</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Sub-customer?{" "}
            <a href="/auth/subcustomer/signin" className="text-green-600 hover:text-green-500">
              Sub-Customer Login
            </a>
          </p>
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a href="/auth/staff/signin" className="text-blue-600 hover:text-blue-500">
              Staff Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 