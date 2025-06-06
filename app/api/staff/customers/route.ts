import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "../../../generated/prisma"
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET /api/staff/customers - Get all customers with pagination, search, and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is staff
    if (!session?.user?.role || !['Administrator', 'Support Agent'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const plan = searchParams.get('plan') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Validate pagination parameters
    const validatedPage = Math.max(1, page)
    const validatedLimit = Math.min(Math.max(1, limit), 100) // Max 100 per page
    const skip = (validatedPage - 1) * validatedLimit

    // Build where clause
    const whereClause: {
      deletedAt: null
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' }
        companyName?: { contains: string; mode: 'insensitive' }
      }>
      plan?: string
    } = {
      deletedAt: null
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add plan filter
    if (plan) {
      whereClause.plan = plan
    }

    // Build order by clause
    const validSortFields = ['name', 'companyName', 'plan', 'createdAt', 'updatedAt']
    const sortDirection: 'asc' | 'desc' = sortOrder === 'asc' ? 'asc' : 'desc'
    const orderBy = validSortFields.includes(sortBy) 
      ? { [sortBy]: sortDirection }
      : { createdAt: sortDirection }

    // Get customers with pagination
    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          companyName: true,
          plan: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy,
        skip,
        take: validatedLimit
      }),
      prisma.customer.count({
        where: whereClause
      })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / validatedLimit)
    const hasNextPage = validatedPage < totalPages
    const hasPrevPage = validatedPage > 1

    return NextResponse.json({
      customers,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/staff/customers - Create new customer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is staff
    if (!session?.user?.role || !['Administrator', 'Support Agent'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, companyName, plan, ownerName, ownerEmail, ownerPassword } = body

    // Enhanced validation
    const validationErrors: string[] = []
    
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      validationErrors.push("Contact name must be at least 2 characters long")
    }
    
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2) {
      validationErrors.push("Company name must be at least 2 characters long")
    }
    
    if (!plan || typeof plan !== 'string') {
      validationErrors.push("Plan is required")
    }

    // Owner validation
    if (!ownerName || typeof ownerName !== 'string' || ownerName.trim().length < 2) {
      validationErrors.push("Owner name must be at least 2 characters long")
    }

    if (!ownerEmail || typeof ownerEmail !== 'string') {
      validationErrors.push("Owner email is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim())) {
      validationErrors.push("Please enter a valid owner email address")
    }

    if (!ownerPassword || typeof ownerPassword !== 'string' || ownerPassword.length < 6) {
      validationErrors.push("Owner password must be at least 6 characters long")
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors }, 
        { status: 400 }
      )
    }

    // Check if owner email already exists
    const existingUser = await prisma.customerUser.findUnique({
      where: { email: ownerEmail.trim().toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Validation failed", details: ["Owner email address is already in use"] }, 
        { status: 400 }
      )
    }

    // Get the "Owner" role
    const ownerRole = await prisma.customerRole.findFirst({
      where: { name: 'Owner' }
    })

    if (!ownerRole) {
      return NextResponse.json(
        { error: "Owner role not found. Please contact support." }, 
        { status: 500 }
      )
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(ownerPassword, 12)

    // Create customer and owner user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create customer
      const customer = await tx.customer.create({
        data: {
          name: name.trim(),
          companyName: companyName.trim(),
          plan,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // Create owner user
      const ownerUser = await tx.customerUser.create({
        data: {
          name: ownerName.trim(),
          email: ownerEmail.trim().toLowerCase(),
          customerId: customer.id,
          roleId: ownerRole.id,
          passwordHash,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      return { customer, ownerUser }
    })

    // Return success response (without password hash)
    return NextResponse.json({
      customer: result.customer,
      owner: {
        id: result.ownerUser.id,
        name: result.ownerUser.name,
        email: result.ownerUser.email
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 