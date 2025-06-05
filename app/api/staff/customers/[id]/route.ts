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

    // Check if email is being changed and if it conflicts with another customer
    if (email && email !== existingCustomer.email) {
      const emailConflict = await prisma.customer.findUnique({
        where: { email }
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

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (companyName) updateData.companyName = companyName
    if (plan) updateData.plan = plan

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