import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "../../../generated/prisma"
import { authOptions } from "../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accounts = await prisma.connectedAccount.findMany({
      where: {
        customerId: session.user.customerId,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error("Error fetching connected accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { platform, accountId, accountName, accessToken } = await request.json()

    // Validate required fields
    if (!platform || !accountId || !accountName || !accessToken) {
      return NextResponse.json(
        { error: "Missing required fields: platform, accountId, accountName, accessToken" },
        { status: 400 }
      )
    }

    // Validate platform type
    const validPlatforms = ['meta', 'google_ads', 'ga4', 'tiktok']
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform. Must be one of: " + validPlatforms.join(', ') },
        { status: 400 }
      )
    }

    // Check if account already exists for this customer
    const existingAccount = await prisma.connectedAccount.findFirst({
      where: {
        customerId: session.user.customerId,
        platform,
        accountId,
        deletedAt: null
      }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: "Account already connected for this platform" },
        { status: 409 }
      )
    }

    // Create the connected account
    const connectedAccount = await prisma.connectedAccount.create({
      data: {
        customerId: session.user.customerId,
        platform,
        accountId,
        accountName,
        accessToken,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Don't return the access token in the response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessToken: _accessToken, refreshToken: _refreshToken, ...safeAccount } = connectedAccount

    return NextResponse.json(safeAccount, { status: 201 })
  } catch (error) {
    console.error("Error creating connected account:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 