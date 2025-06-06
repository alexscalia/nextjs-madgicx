import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "../../../../../generated/prisma"
import { authOptions } from "../../../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: accountId } = await params

    // Check if the account exists and belongs to this customer
    const account = await prisma.connectedAccount.findFirst({
      where: {
        id: accountId,
        customerId: session.user.customerId,
        deletedAt: null
      }
    })

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    if (!account.accessToken) {
      return NextResponse.json({ error: "Account is not connected" }, { status: 400 })
    }

    // TODO: Implement actual sync logic based on platform
    // For now, we'll just update the syncedAt timestamp
    
    const updatedAccount = await prisma.connectedAccount.update({
      where: { id: accountId },
      data: {
        syncedAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Don't return sensitive information
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessToken: _accessToken, refreshToken: _refreshToken, ...safeAccount } = updatedAccount

    return NextResponse.json({ 
      message: "Account synced successfully",
      account: safeAccount
    })
  } catch (error) {
    console.error("Error syncing connected account:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 