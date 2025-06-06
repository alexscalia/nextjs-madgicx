import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "../../../generated/prisma"

const prisma = new PrismaClient()

// GET /api/customer/campaigns - Fetch all campaigns for the authenticated customer
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.customerId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const campaigns = await prisma.campaign.findMany({
      where: {
        customerId: session.user.customerId,
        deletedAt: null
      },
      include: {
        connectedAccount: {
          select: {
            platform: true,
            accountName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    )
  }
}

// POST /api/customer/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.customerId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      platform,
      connectedAccountId,
      objective,
      budget,
      budgetType,
      startDate,
      endDate,
      description
    } = body

    // Validate required fields
    if (!name || !platform || !connectedAccountId || !objective || !budget || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify the connected account belongs to this customer
    const connectedAccount = await prisma.connectedAccount.findFirst({
      where: {
        id: connectedAccountId,
        customerId: session.user.customerId,
        deletedAt: null
      }
    })

    if (!connectedAccount) {
      return NextResponse.json(
        { error: "Connected account not found" },
        { status: 404 }
      )
    }

    // Generate a unique campaign ID for the platform
    const campaignId = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create the campaign with initial mock metrics
    const campaign = await prisma.campaign.create({
      data: {
        customerId: session.user.customerId,
        connectedAccountId,
        platform,
        campaignId,
        name,
        status: 'paused', // Start in paused state
        budget,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        metrics: {
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0,
          objective,
          budgetType,
          description: description || null
        },
        date: new Date()
      },
      include: {
        connectedAccount: {
          select: {
            platform: true,
            accountName: true
          }
        }
      }
    })

    // TODO: Here you would normally make API calls to the actual advertising platform
    // to create the campaign remotely. For now, we're just storing it locally.
    
    console.log(`Created campaign ${campaign.name} for ${platform}`)

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    )
  }
} 