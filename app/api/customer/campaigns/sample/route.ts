import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { PrismaClient } from "../../../../generated/prisma"

const prisma = new PrismaClient()

// POST /api/customer/campaigns/sample - Create sample campaigns for testing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.customerId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get connected accounts for this customer
    const connectedAccounts = await prisma.connectedAccount.findMany({
      where: {
        customerId: session.user.customerId,
        deletedAt: null
      }
    })

    if (connectedAccounts.length === 0) {
      return NextResponse.json(
        { error: "No connected accounts found. Please connect an account first." },
        { status: 400 }
      )
    }

    // Sample campaign data
    const sampleCampaigns = [
      {
        name: "Black Friday Sale - Meta Ads",
        platform: "meta",
        objective: "conversions",
        budget: 500,
        status: "active",
        metrics: {
          spend: 342.50,
          impressions: 45832,
          clicks: 1247,
          conversions: 89,
          ctr: 2.72,
          cpc: 0.27,
          cpm: 7.47,
          objective: "conversions",
          budgetType: "daily"
        }
      },
      {
        name: "Holiday Campaign 2024",
        platform: "meta", 
        objective: "traffic",
        budget: 200,
        status: "active",
        metrics: {
          spend: 178.90,
          impressions: 23441,
          clicks: 892,
          conversions: 45,
          ctr: 3.81,
          cpc: 0.20,
          cpm: 7.63,
          objective: "traffic",
          budgetType: "daily"
        }
      },
      {
        name: "Brand Awareness Q4",
        platform: "meta",
        objective: "awareness", 
        budget: 300,
        status: "paused",
        metrics: {
          spend: 256.30,
          impressions: 67291,
          clicks: 534,
          conversions: 12,
          ctr: 0.79,
          cpc: 0.48,
          cpm: 3.81,
          objective: "awareness",
          budgetType: "daily"
        }
      }
    ]

    const createdCampaigns = []
    
    // Create sample campaigns
    for (const campaignData of sampleCampaigns) {
      // Find a connected account for this platform
      const account = connectedAccounts.find(acc => acc.platform === campaignData.platform)
      
      if (account) {
        const campaignId = `${campaignData.platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const campaign = await prisma.campaign.create({
          data: {
            customerId: session.user.customerId,
            connectedAccountId: account.id,
            platform: campaignData.platform,
            campaignId,
            name: campaignData.name,
            status: campaignData.status,
            budget: campaignData.budget,
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            endDate: null,
            metrics: campaignData.metrics,
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
        
        createdCampaigns.push(campaign)
      }
    }

    console.log(`Created ${createdCampaigns.length} sample campaigns`)

    return NextResponse.json({
      message: `Created ${createdCampaigns.length} sample campaigns`,
      campaigns: createdCampaigns
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating sample campaigns:", error)
    return NextResponse.json(
      { error: "Failed to create sample campaigns" },
      { status: 500 }
    )
  }
} 