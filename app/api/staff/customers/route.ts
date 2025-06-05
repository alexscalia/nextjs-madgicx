import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "../../../generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// GET /api/staff/customers - Get all customers
export async function GET() {
  try {
    const session = await getServerSession()
    
    // Check if user is staff
    if (!session?.user?.role || !['Administrator', 'Support Agent'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customers = await prisma.customer.findMany({
      where: {
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
        // Don't include passwordHash in the response
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/staff/customers - Create new customer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    // Check if user is staff
    if (!session?.user?.role || !['Administrator', 'Support Agent'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, companyName, plan, password } = body

    // Validate required fields
    if (!name || !email || !companyName || !plan || !password) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      )
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email }
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
        name,
        email,
        companyName,
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