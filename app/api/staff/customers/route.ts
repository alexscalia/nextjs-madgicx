import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "../../../generated/prisma"
import bcrypt from "bcryptjs"

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
    const whereClause: any = {
      deletedAt: null
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add plan filter
    if (plan) {
      whereClause.plan = plan
    }

    // Build order by clause
    const validSortFields = ['name', 'email', 'companyName', 'plan', 'createdAt', 'updatedAt']
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
          email: true,
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
    const { name, email, companyName, plan, password } = body

    // Enhanced validation
    const validationErrors: string[] = []
    
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      validationErrors.push("Name must be at least 2 characters long")
    }
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      validationErrors.push("Valid email is required")
    }
    
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2) {
      validationErrors.push("Company name must be at least 2 characters long")
    }
    
    if (!plan || typeof plan !== 'string') {
      validationErrors.push("Plan is required")
    }
    
    if (!password || typeof password !== 'string' || password.length < 8) {
      validationErrors.push("Password must be at least 8 characters long")
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors }, 
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingCustomer && !existingCustomer.deletedAt) {
      return NextResponse.json(
        { error: "Customer with this email already exists" }, 
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        companyName: companyName.trim(),
        plan,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Return customer without password hash
    const { passwordHash: _, ...customerResponse } = customer
    return NextResponse.json(customerResponse, { status: 201 })

  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 