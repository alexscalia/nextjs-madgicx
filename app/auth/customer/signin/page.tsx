"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Building2, TrendingUp, AlertCircle } from "lucide-react"
import { getAuthError } from "@/lib/auth-utils"

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

function CustomerSignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false
  })
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/customer/dashboard"

  // Email validation
  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return "Email is required"
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address"
    }
    if (email.length > 254) {
      return "Email address is too long"
    }
    return undefined
  }

  // Password validation
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Password is required"
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long"
    }
    if (password.length > 128) {
      return "Password is too long"
    }
    return undefined
  }

  // Real-time validation
  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (touched.email) {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(value),
        general: undefined
      }))
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (touched.password) {
      setErrors(prev => ({
        ...prev,
        password: validatePassword(value),
        general: undefined
      }))
    }
  }

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(email) }))
    } else {
      setErrors(prev => ({ ...prev, password: validatePassword(password) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({ email: true, password: true })
    
    // Validate all fields
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    
    const newErrors: FormErrors = {}
    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError
    
    setErrors(newErrors)
    
    // Don't submit if there are validation errors
    if (emailError || passwordError) {
      return
    }

    setIsLoading(true)
    setErrors({ general: undefined }) // Clear any previous general errors

    try {
      const result = await signIn("customer-signin", {
        email,
        password,
        redirect: false,
      })

      if (result?.error || result?.status === 401) {
        const authError = getAuthError(result)
        setErrors({ general: authError.details || authError.message })
        setPassword("") // Clear password on bad credentials
      } else if (result?.ok) {
        router.push(callbackUrl)
      } else {
        const authError = getAuthError(result)
        setErrors({ general: authError.details || authError.message })
        setPassword("") // Clear password on authentication failure
      }
    } catch {
      const errorMessage = 'Unable to connect to authentication server. Please check your internet connection.'
      setErrors({ general: errorMessage })
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
            Sign in to access your organization&apos;s campaigns and analytics
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

            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Your Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@company.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  required
                  disabled={isLoading}
                  className={errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  required
                  disabled={isLoading}
                  className={errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                disabled={isLoading || !!errors.email || !!errors.password}
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
                <p><strong>Acme Corp:</strong> john@acmecorp.com (Owner) / jane@acmecorp.com (Editor) / bob@acmecorp.com (Viewer)</p>
                <p><strong>TechStartup:</strong> alice@techstartup.com (Owner) / mike@techstartup.com (Editor)</p>
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

export default function CustomerSignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerSignInForm />
    </Suspense>
  )
} 