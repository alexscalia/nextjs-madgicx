import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../auth/[...nextauth]/route"
import { PrismaClient } from "../../../../../generated/prisma"

const prisma = new PrismaClient()

// POST /api/customer/accounts/[id]/sync-campaigns - Sync campaigns from Facebook Marketing API
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.customerId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the connected account
    const connectedAccount = await prisma.connectedAccount.findFirst({
      where: {
        id,
        customerId: session.user.customerId,
        deletedAt: null
      }
    })

    if (!connectedAccount || !connectedAccount.accessToken) {
      return NextResponse.json(
        { error: "Connected account not found or access token missing" },
        { status: 404 }
      )
    }

    // Only sync Meta (Facebook) accounts for now
    if (connectedAccount.platform !== 'meta') {
      return NextResponse.json(
        { error: "Campaign sync only supported for Meta accounts currently" },
        { status: 400 }
      )
    }

    console.log(`Syncing campaigns for Meta account ${connectedAccount.accountName}...`)

    // First, fetch account info to get currency
    const accountInfo = await fetchFacebookAccountInfo(
      connectedAccount.accessToken,
      connectedAccount.accountId
    )

    // Store currency info in the account (we'll use this for campaign data)
    const accountCurrency = accountInfo.currency || 'USD'

    // Fetch campaigns from Facebook Marketing API
    const campaignData = await fetchFacebookCampaigns(
      connectedAccount.accessToken,
      connectedAccount.accountId
    )

    // Store campaigns in database
    const syncedCampaigns = []
    for (const fbCampaign of campaignData) {
      // Check if campaign already exists
      const existingCampaign = await prisma.campaign.findFirst({
        where: {
          campaignId: fbCampaign.id,
          connectedAccountId: connectedAccount.id
        }
      })

      const campaignData = {
        customerId: session.user.customerId,
        connectedAccountId: connectedAccount.id,
        platform: 'meta',
        campaignId: fbCampaign.id,
        name: fbCampaign.name,
        status: fbCampaign.status.toLowerCase(),
        budget: fbCampaign.daily_budget ? parseInt(fbCampaign.daily_budget) / 100 : null, // Convert from cents
        startDate: fbCampaign.start_time ? new Date(fbCampaign.start_time) : null,
        endDate: fbCampaign.stop_time ? new Date(fbCampaign.stop_time) : null,
        metrics: {
          spend: parseFloat(fbCampaign.insights?.spend || '0'),
          impressions: parseInt(fbCampaign.insights?.impressions || '0'),
          clicks: parseInt(fbCampaign.insights?.clicks || '0'),
          conversions: parseInt(fbCampaign.insights?.conversions || '0'),
          ctr: parseFloat(fbCampaign.insights?.ctr || '0'),
          cpc: parseFloat(fbCampaign.insights?.cpc || '0'),
          cpm: parseFloat(fbCampaign.insights?.cpm || '0'),
          objective: fbCampaign.objective,
          budgetType: fbCampaign.daily_budget ? 'daily' : 'lifetime',
          currency: accountCurrency
        },
        date: new Date()
      }

      let campaign
      if (existingCampaign) {
        // Update existing campaign
        campaign = await prisma.campaign.update({
          where: { id: existingCampaign.id },
          data: campaignData
        })
      } else {
        // Create new campaign
        campaign = await prisma.campaign.create({
          data: campaignData
        })
      }

      syncedCampaigns.push(campaign)
    }

    // Update the connected account sync timestamp
    await prisma.connectedAccount.update({
      where: { id: connectedAccount.id },
      data: { syncedAt: new Date() }
    })

    console.log(`Successfully synced ${syncedCampaigns.length} campaigns from Facebook`)

    return NextResponse.json({
      message: `Successfully synced ${syncedCampaigns.length} campaigns`,
      campaigns: syncedCampaigns
    })

  } catch (error) {
    console.error("Error syncing campaigns:", error)
    return NextResponse.json(
      { error: "Failed to sync campaigns" },
      { status: 500 }
    )
  }
}

// Fetch Facebook account info to get currency
async function fetchFacebookAccountInfo(accessToken: string, accountId: string) {
  try {
    const accountUrl = `https://graph.facebook.com/v18.0/act_${accountId}`
    const fields = ['currency', 'timezone_name', 'name'].join(',')
    
    const response = await fetch(`${accountUrl}?fields=${fields}&access_token=${accessToken}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Facebook account API error:', errorData)
      throw new Error(`Facebook account API error: ${errorData.error?.message || 'Unknown error'}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching Facebook account info:', error)
    throw error
  }
}

// Fetch campaigns from Facebook Marketing API
async function fetchFacebookCampaigns(accessToken: string, accountId: string) {
  try {
    // Facebook Marketing API endpoint for campaigns
    const campaignsUrl = `https://graph.facebook.com/v18.0/act_${accountId}/campaigns`
    
    // Fields to fetch for each campaign
    const fields = [
      'id',
      'name', 
      'status',
      'objective',
      'daily_budget',
      'lifetime_budget',
      'start_time',
      'stop_time',
      'created_time',
      'updated_time'
    ].join(',')

    // Fetch campaigns
    const campaignsResponse = await fetch(`${campaignsUrl}?fields=${fields}&access_token=${accessToken}`)
    
    if (!campaignsResponse.ok) {
      const errorData = await campaignsResponse.json()
      console.error('Facebook API error:', errorData)
      throw new Error(`Facebook API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const campaignsData = await campaignsResponse.json()
    const campaigns = campaignsData.data || []

    // Fetch insights (performance metrics) for each campaign
    const campaignsWithInsights = await Promise.all(
              campaigns.map(async (campaign: { id: string; name: string; status: string; objective?: string; insights?: { spend?: string } }) => {
        try {
          // Fetch insights for this campaign
          const insightsUrl = `https://graph.facebook.com/v18.0/${campaign.id}/insights`
          const insightsFields = [
            'spend',
            'impressions', 
            'clicks',
            'conversions',
            'ctr',
            'cpc',
            'cpm'
          ].join(',')

          const insightsResponse = await fetch(
            `${insightsUrl}?fields=${insightsFields}&access_token=${accessToken}&date_preset=last_30d`
          )

          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json()
            const insights = insightsData.data?.[0] || {} // Get first insights record
            
            return {
              ...campaign,
              insights
            }
          } else {
            console.warn(`Failed to fetch insights for campaign ${campaign.id}`)
            return {
              ...campaign,
              insights: {}
            }
          }
        } catch (error) {
          console.warn(`Error fetching insights for campaign ${campaign.id}:`, error)
          return {
            ...campaign,
            insights: {}
          }
        }
      })
    )

    return campaignsWithInsights

  } catch (error) {
    console.error('Error fetching Facebook campaigns:', error)
    throw error
  }
} 