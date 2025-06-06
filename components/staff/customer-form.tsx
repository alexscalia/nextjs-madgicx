"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

interface Customer {
  id?: string
  name: string | null
  email: string
  companyName: string | null
  plan: string | null
  password?: string
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
    email: customer?.email || '',
    companyName: customer?.companyName || '',
    plan: customer?.plan || '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters'
    }
    
    if (!formData.plan) {
      newErrors.plan = 'Plan selection is required'
    }
    
    if (mode === 'create' && !formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
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
      
      // Prepare data - only include password if it's provided
      const submitData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        companyName: formData.companyName.trim(),
        plan: formData.plan
      }
      
      if (formData.password) {
        submitData.password = formData.password
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
            if (error.includes('Name')) apiErrors.name = error
            else if (error.includes('email')) apiErrors.email = error
            else if (error.includes('Company')) apiErrors.companyName = error
            else if (error.includes('Plan')) apiErrors.plan = error
            else if (error.includes('Password')) apiErrors.password = error
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

    } catch (error) {
      setGeneralError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof Customer, value: string) => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter customer's full name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email address"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Password {mode === 'create' ? '*' : '(leave blank to keep current)'}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          placeholder={mode === 'create' ? 'Enter a secure password' : 'Enter new password (optional)'}
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password}</p>
        )}
        {mode === 'create' && (
          <p className="text-sm text-gray-500">
            Password must be at least 8 characters long
          </p>
        )}
      </div>

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
          {mode === 'create' ? 'Create Customer' : 'Update Customer'}
        </Button>
      </div>
    </form>
  )
} 