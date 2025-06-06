"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// Card components removed as they're not used in this form
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"

interface Customer {
  id?: string
  name: string | null
  companyName: string | null
  plan: string | null
}

interface CustomerFormProps {
  customer?: Customer
  mode?: 'create' | 'edit'
}

interface FormErrors {
  [key: string]: string
}

export function CustomerForm({ customer, mode = 'create' }: CustomerFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    companyName: customer?.companyName || '',
    plan: customer?.plan || '',
    // Owner fields (only for create mode)
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPasswordConfirm: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Contact name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Contact name must be at least 2 characters'
    }
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters'
    }
    
    if (!formData.plan) {
      newErrors.plan = 'Plan selection is required'
    }

    // Owner validation (only for create mode)
    if (mode === 'create') {
      if (!formData.ownerName.trim()) {
        newErrors.ownerName = 'Owner name is required'
      } else if (formData.ownerName.trim().length < 2) {
        newErrors.ownerName = 'Owner name must be at least 2 characters'
      }

      if (!formData.ownerEmail.trim()) {
        newErrors.ownerEmail = 'Owner email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail.trim())) {
        newErrors.ownerEmail = 'Please enter a valid email address'
      }

      if (!formData.ownerPassword) {
        newErrors.ownerPassword = 'Password is required'
      } else if (formData.ownerPassword.length < 6) {
        newErrors.ownerPassword = 'Password must be at least 6 characters'
      }

      if (!formData.ownerPasswordConfirm) {
        newErrors.ownerPasswordConfirm = 'Password confirmation is required'
      } else if (formData.ownerPassword !== formData.ownerPasswordConfirm) {
        newErrors.ownerPasswordConfirm = 'Passwords do not match'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setGeneralError('')
    
    try {
      const url = mode === 'create' 
        ? '/api/staff/customers'
        : `/api/staff/customers/${customer?.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'
      
      // Prepare data
      const submitData = {
        name: formData.name.trim(),
        companyName: formData.companyName.trim(),
        plan: formData.plan,
        // Include owner data for create mode
        ...(mode === 'create' && {
          ownerName: formData.ownerName.trim(),
          ownerEmail: formData.ownerEmail.trim(),
          ownerPassword: formData.ownerPassword
        })
      }
      
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          // Handle validation errors from API
          const apiErrors: FormErrors = {}
          data.details.forEach((error: string) => {
            if (error.includes('Name') || error.includes('Contact')) apiErrors.name = error
            else if (error.includes('Company')) apiErrors.companyName = error
            else if (error.includes('Plan')) apiErrors.plan = error
            else if (error.includes('Owner name')) apiErrors.ownerName = error
            else if (error.includes('Owner email') || error.includes('Email')) apiErrors.ownerEmail = error
            else if (error.includes('Password')) apiErrors.ownerPassword = error
          })
          setErrors(apiErrors)
        } else {
          setGeneralError(data.error || 'An error occurred')
        }
        return
      }

      setSuccess(true)
      
      // Redirect after successful submission
      setTimeout(() => {
        router.push('/staff/customers')
      }, 1000)

    } catch {
      setGeneralError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Clear general error
    if (generalError) {
      setGeneralError('')
    }
  }

  if (success) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Customer {mode === 'create' ? 'created' : 'updated'} successfully! Redirecting...
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      {/* Company Information */}
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
          <p className="text-sm text-gray-600">Basic company details and plan selection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Name */}
           <div className="space-y-2">
             <Label htmlFor="name">Name *</Label>
             <Input
               id="name"
               type="text"
               value={formData.name}
               onChange={(e) => handleInputChange('name', e.target.value)}
               placeholder="Enter name for display"
               className={errors.name ? 'border-red-500' : ''}
             />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Enter company name"
              className={errors.companyName ? 'border-red-500' : ''}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>
        </div>

        {/* Plan */}
        <div className="space-y-2">
          <Label htmlFor="plan">Plan *</Label>
          <Select value={formData.plan} onValueChange={(value) => handleInputChange('plan', value)}>
            <SelectTrigger className={errors.plan ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          {errors.plan && (
            <p className="text-sm text-red-500">{errors.plan}</p>
          )}
        </div>
      </div>

      {/* Owner Information (only for create mode) */}
      {mode === 'create' && (
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-medium text-gray-900">Account Owner</h3>
            <p className="text-sm text-gray-600">Primary user who will manage this company account</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Owner Name */}
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Full Name *</Label>
              <Input
                id="ownerName"
                type="text"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                placeholder="Enter owner's full name"
                className={errors.ownerName ? 'border-red-500' : ''}
              />
              {errors.ownerName && (
                <p className="text-sm text-red-500">{errors.ownerName}</p>
              )}
            </div>

            {/* Owner Email */}
            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Owner Email *</Label>
              <Input
                id="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                placeholder="Enter owner's email address"
                className={errors.ownerEmail ? 'border-red-500' : ''}
              />
              {errors.ownerEmail && (
                <p className="text-sm text-red-500">{errors.ownerEmail}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Owner Password */}
            <div className="space-y-2">
              <Label htmlFor="ownerPassword">Password *</Label>
              <div className="relative">
                <Input
                  id="ownerPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.ownerPassword}
                  onChange={(e) => handleInputChange('ownerPassword', e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  className={errors.ownerPassword ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.ownerPassword && (
                <p className="text-sm text-red-500">{errors.ownerPassword}</p>
              )}
            </div>

            {/* Password Confirmation */}
            <div className="space-y-2">
              <Label htmlFor="ownerPasswordConfirm">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="ownerPasswordConfirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  value={formData.ownerPasswordConfirm}
                  onChange={(e) => handleInputChange('ownerPasswordConfirm', e.target.value)}
                  placeholder="Confirm password"
                  className={errors.ownerPasswordConfirm ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.ownerPasswordConfirm && (
                <p className="text-sm text-red-500">{errors.ownerPasswordConfirm}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Note:</strong> {mode === 'create' 
            ? 'This creates a company account with an initial owner user who can log in immediately. Additional users can be added later from the customer detail page.'
            : 'This updates the company information. To manage user accounts, navigate to the customer detail page.'
          }
        </AlertDescription>
      </Alert>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Company & Owner' : 'Update Company'}
        </Button>
      </div>
    </form>
  )
} 