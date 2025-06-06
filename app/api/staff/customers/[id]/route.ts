import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { PrismaClient } from "../../../../generated/prisma"

const prisma = new PrismaClient()

// GET /api/staff/customers/[id] - Get single customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is staff
    if (!session?.user?.role || !['Administrator', 'Support Agent'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const customer = await prisma.customer.findUnique({
      where: {
        id: id,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        companyName: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is staff
    if (!session?.user?.role || !['Administrator', 'Support Agent'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, companyName, plan } = body

    // Enhanced validation
    const validationErrors: string[] = []
    
    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
      validationErrors.push("Name must be at least 2 characters long")
    }
    
    if (companyName !== undefined && (typeof companyName !== 'string' || companyName.trim().length < 2)) {
      validationErrors.push("Company name must be at least 2 characters long")
    }
    
    if (plan !== undefined && typeof plan !== 'string') {
      validationErrors.push("Plan must be a valid string")
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
        id: id,
        deletedAt: null
      }
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: {
      name?: string
      companyName?: string
      plan?: string
      updatedAt: Date
    } = {
      updatedAt: new Date()
    }

    if (name !== undefined) updateData.name = name.trim()
    if (companyName !== undefined) updateData.companyName = companyName.trim()
    if (plan !== undefined) updateData.plan = plan

    // Update customer
    const customer = await prisma.customer.update({
      where: { id: id },
      data: updateData
    })

    return NextResponse.json(customer)

  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/staff/customers/[id] - Soft delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is staff
    if (!session?.user?.role || !['Administrator', 'Support Agent'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id: id,
        deletedAt: null
      }
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Soft delete customer
    await prisma.customer.update({
      where: { id: id },
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