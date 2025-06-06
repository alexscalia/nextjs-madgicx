"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"

interface CustomerActionsProps {
  customerId: string
  customerName: string
}

export function CustomerActions({ customerId, customerName }: CustomerActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete customer "${customerName}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/staff/customers/${customerId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        router.push('/staff/customers')
      } else {
        alert('Failed to delete customer. Please try again.')
      }
    } catch (error) {
      console.error('Failed to delete customer:', error)
      alert('Failed to delete customer. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      className="text-red-600 hover:text-red-700 hover:border-red-200"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4 mr-2" />
      )}
      Delete Customer
    </Button>
  )
} 