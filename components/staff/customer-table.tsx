"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Customer {
  id: string
  name: string
  email: string
  companyName: string
  plan: string
  status: string
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ApiResponse {
  customers: Customer[]
  pagination: PaginationInfo
}

export function CustomerTable() {
  const router = useRouter()
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [currentPage, planFilter, statusFilter, sortBy, sortOrder])

  // Debounce search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    const timeout = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1) // Reset to first page on search
      } else {
        fetchCustomers()
      }
    }, 500)
    
    setSearchTimeout(timeout)
    
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [searchTerm])

  const buildApiUrl = () => {
    const params = new URLSearchParams()
    params.set('page', currentPage.toString())
    params.set('limit', '10')
    if (searchTerm) params.set('search', searchTerm)
    if (planFilter && planFilter !== 'all') params.set('plan', planFilter)
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
    params.set('sortBy', sortBy)
    params.set('sortOrder', sortOrder)
    
    return `/api/staff/customers?${params.toString()}`
  }

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch(buildApiUrl(), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const apiData: ApiResponse = await response.json()
        setData(apiData)
      } else {
        console.error('Failed to fetch customers:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (customerId: string, customerName: string) => {
    if (confirm(`Are you sure you want to delete customer "${customerName}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/staff/customers/${customerId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (response.ok) {
          fetchCustomers() // Refresh the list
        } else {
          alert('Failed to delete customer. Please try again.')
        }
      } catch (error) {
        console.error('Failed to delete customer:', error)
        alert('Failed to delete customer. Please try again.')
      }
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800'
      case 'pro':
        return 'bg-blue-100 text-blue-800'
      case 'basic':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null
    return sortOrder === "asc" ? "↑" : "↓"
  }

  if (loading && !data) {
    return <div className="text-center py-8">Loading customers...</div>
  }

  const { customers, pagination } = data || { customers: [], pagination: null }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search customers by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {pagination && (
          <div className="text-sm text-gray-500">
            {pagination.totalCount} total customers
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('name')}
              >
                Customer <SortIcon field="name" />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('companyName')}
              >
                Company <SortIcon field="companyName" />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('plan')}
              >
                Plan <SortIcon field="plan" />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon field="status" />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('createdAt')}
              >
                Created <SortIcon field="createdAt" />
              </TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchTerm || (planFilter && planFilter !== 'all') || (statusFilter && statusFilter !== 'all') ? 'No customers found matching your criteria.' : 'No customers found.'}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/staff/customers/${customer.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{customer.companyName}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPlanBadgeColor(customer.plan)}>
                      {customer.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/staff/customers/${customer.id}`} className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/staff/customers/${customer.id}/edit`} className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Customer
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 cursor-pointer"
                          onClick={() => handleDelete(customer.id, customer.name)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages} 
            ({((pagination.page - 1) * pagination.limit) + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount})
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + Math.max(1, pagination.page - 2)
                if (pageNum > pagination.totalPages) return null
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              }).filter(Boolean)}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 