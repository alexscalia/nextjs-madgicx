import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "../../../../generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// GET /api/staff/customers/[id] - Get single customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    // Check if user is staff
    if (!session?.user?.role || !['Administrator', 'Support Agent'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: params.id,
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
      }
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/staff/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    // Check if user is staff
    if (!session?.user?.role || !['Administrator', 'Support Agent'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, companyName, plan, password } = body

    // Enhanced validation
    const validationErrors: string[] = []
    
    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
      validationErrors.push("Name must be at least 2 characters long")
    }
    
    if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
      validationErrors.push("Valid email is required")
    }
    
    if (companyName !== undefined && (typeof companyName !== 'string' || companyName.trim().length < 2)) {
      validationErrors.push("Company name must be at least 2 characters long")
    }
    
    if (plan !== undefined && typeof plan !== 'string') {
      validationErrors.push("Plan must be a valid string")
    }
    
    if (password !== undefined && (typeof password !== 'string' || password.length < 8)) {
      validationErrors.push("Password must be at least 8 characters long")
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors }, 
        { status: 400 }
      )
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id: params.id,
        deletedAt: null
      }
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Normalize email if provided
    const normalizedEmail = email ? email.toLowerCase().trim() : undefined

    // Check if email is being changed and if it conflicts with another customer
    if (normalizedEmail && normalizedEmail !== existingCustomer.email) {
      const emailConflict = await prisma.customer.findUnique({
        where: { email: normalizedEmail }
      })
      
      if (emailConflict && !emailConflict.deletedAt && emailConflict.id !== params.id) {
        return NextResponse.json(
          { error: "Email already in use by another customer" }, 
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (name !== undefined) updateData.name = name.trim()
    if (normalizedEmail !== undefined) updateData.email = normalizedEmail
    if (companyName !== undefined) updateData.companyName = companyName.trim()
    if (plan !== undefined) updateData.plan = plan

    // Hash new password if provided
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12)
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: updateData
    })

    // Return customer without password hash
    const { passwordHash: _, ...customerResponse } = customer
    return NextResponse.json(customerResponse)

  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/staff/customers/[id] - Soft delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    // Check if user is staff
    if (!session?.user?.role || !['Administrator', 'Support Agent'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id: params.id,
        deletedAt: null
      }
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Soft delete customer
    await prisma.customer.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ message: "Customer deleted successfully" })

  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 