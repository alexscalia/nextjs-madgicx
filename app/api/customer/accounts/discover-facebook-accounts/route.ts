import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"

interface DiscoveredAccount {
  facebookId: string
  accountId: string
  name: string
  currency: string
  timezone: string
  status: number
  business?: string
  businessName?: string
  spendCap?: string
  createdTime: string
}

// POST /api/customer/accounts/discover-facebook-accounts - Discover all Facebook ad accounts accessible by a token
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.customerId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      )
    }

    console.log('Discovering Facebook ad accounts...')

    // Fetch all ad accounts accessible by this token
    const adAccounts = await fetchAllAdAccounts(accessToken)

    return NextResponse.json({
      accounts: adAccounts,
      message: `Found ${adAccounts.length} accessible ad accounts`
    })

  } catch (error) {
    console.error("Error discovering Facebook accounts:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to discover Facebook accounts" },
      { status: 500 }
    )
  }
}

// Fetch all ad accounts accessible by the token
async function fetchAllAdAccounts(accessToken: string) {
  try {
    // Use Facebook Graph API to get all ad accounts the user/app has access to
    const adAccountsUrl = `https://graph.facebook.com/v18.0/me/adaccounts`
    
    // Fields to fetch for each ad account
    const fields = [
      'id',
      'account_id', 
      'name',
      'currency',
      'timezone_name',
      'account_status',
      'business',
      'business_name',
      'spend_cap',
      'created_time'
    ].join(',')

    const response = await fetch(`${adAccountsUrl}?fields=${fields}&limit=100&access_token=${accessToken}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Facebook API error:', errorData)
      throw new Error(`Facebook API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const accounts = data.data || []

    // Process and format the accounts
    const formattedAccounts = accounts.map((account: {
      id: string
      account_id: string
      name: string
      currency: string
      timezone_name: string
      account_status: number
      business?: string
      business_name?: string
      spend_cap?: string
      created_time: string
    }) => ({
      facebookId: account.id,
      accountId: account.account_id,
      name: account.name,
      currency: account.currency,
      timezone: account.timezone_name,
      status: account.account_status,
      business: account.business,
      businessName: account.business_name,
      spendCap: account.spend_cap,
      createdTime: account.created_time
    }))

    // Also try to get business accounts if the token has business permissions
    try {
      const businessAccounts = await fetchBusinessAdAccounts(accessToken)
      // Merge with regular ad accounts, avoiding duplicates
      const allAccountIds = new Set(formattedAccounts.map((acc: DiscoveredAccount) => acc.accountId))
      const uniqueBusinessAccounts = businessAccounts.filter((acc: DiscoveredAccount) => !allAccountIds.has(acc.accountId))
      formattedAccounts.push(...uniqueBusinessAccounts)
    } catch (businessError) {
      console.log('Could not fetch business accounts (normal if token has limited permissions):', businessError)
    }

    return formattedAccounts

  } catch (error) {
    console.error('Error fetching ad accounts:', error)
    throw error
  }
}

// Fetch ad accounts through business manager (additional coverage for agency tokens)
async function fetchBusinessAdAccounts(accessToken: string) {
  try {
    // Get businesses the token has access to
    const businessesUrl = `https://graph.facebook.com/v18.0/me/businesses`
    const businessFields = ['id', 'name', 'created_time'].join(',')
    
    const businessResponse = await fetch(`${businessesUrl}?fields=${businessFields}&access_token=${accessToken}`)
    
    if (!businessResponse.ok) {
      throw new Error('Could not fetch businesses')
    }

    const businessData = await businessResponse.json()
    const businesses = businessData.data || []

    const allAccounts = []

    // For each business, get its ad accounts
    for (const business of businesses) {
      try {
        const businessAdAccountsUrl = `https://graph.facebook.com/v18.0/${business.id}/adaccount`
        const accountFields = [
          'id',
          'account_id',
          'name', 
          'currency',
          'timezone_name',
          'account_status',
          'spend_cap',
          'created_time'
        ].join(',')

        const accountsResponse = await fetch(`${businessAdAccountsUrl}?fields=${accountFields}&access_token=${accessToken}`)
        
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json()
          const accounts = accountsData.data || []
          
          const formattedAccounts = accounts.map((account: {
            id: string
            account_id: string
            name: string
            currency: string
            timezone_name: string
            account_status: number
            spend_cap?: string
            created_time: string
          }) => ({
            facebookId: account.id,
            accountId: account.account_id,
            name: account.name,
            currency: account.currency,
            timezone: account.timezone_name,
            status: account.account_status,
            business: business.id,
            businessName: business.name,
            spendCap: account.spend_cap,
            createdTime: account.created_time
          }))

          allAccounts.push(...formattedAccounts)
        }
      } catch (accountError) {
        console.log(`Could not fetch accounts for business ${business.name}:`, accountError)
      }
    }

    return allAccounts

  } catch (error) {
    console.error('Error fetching business ad accounts:', error)
    throw error
  }
} 