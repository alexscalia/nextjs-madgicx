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
  business?: string | { id: string; name: string }
  businessName?: string
  spendCap?: string
  createdTime: string
  iconUrl?: string
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
      'created_time',
      'promoted_object'
    ].join(',')

    const response = await fetch(`${adAccountsUrl}?fields=${fields}&limit=100&access_token=${accessToken}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Facebook API error:', errorData)
      throw new Error(`Facebook API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const accounts = data.data || []

    // Process and format the accounts with business icons
    const formattedAccounts = await Promise.all(accounts.map(async (account: {
      id: string
      account_id: string
      name: string
      currency: string
      timezone_name: string
      account_status: number
      business?: string | { id: string; name: string }
      business_name?: string
      spend_cap?: string
      created_time: string
    }) => {
      let iconUrl = null
      
      // Try to fetch page profile picture (more accurate for brands)
      if (account.business) {
        const businessId = typeof account.business === 'object' ? account.business.id : account.business
        try {
          iconUrl = await fetchPageProfilePicture(businessId, accessToken)
          console.log(`✅ Fetched page icon for business ${businessId}: ${iconUrl}`)
        } catch (error) {
          console.log(`❌ Could not fetch page icon for ${businessId}:`, error)
          // Fallback to business picture if page picture fails
          try {
            iconUrl = await fetchBusinessProfilePicture(businessId, accessToken)
            console.log(`🔄 Fallback: Fetched business icon for ${businessId}: ${iconUrl}`)
          } catch (fallbackError) {
            console.log(`❌ Could not fetch business icon either for ${businessId}:`, fallbackError)
            
            // Last resort: try to get picture directly from ad account
            try {
              const adAccountPictureUrl = `https://graph.facebook.com/v18.0/${account.id}/picture?type=large&redirect=false&access_token=${accessToken}`
              const adAccountResponse = await fetch(adAccountPictureUrl)
              if (adAccountResponse.ok) {
                const adAccountData = await adAccountResponse.json()
                if (adAccountData.data && adAccountData.data.url && !adAccountData.data.is_silhouette) {
                  iconUrl = adAccountData.data.url
                  console.log(`🎯 Last resort: Found ad account picture: ${iconUrl}`)
                }
              }
            } catch (adAccountError) {
              console.log(`❌ Ad account picture also failed:`, adAccountError)
            }
            
            console.log(`⚠️  No icon found for business ${businessId} - will show platform icon`)
          }
        }

        if (!iconUrl) {
          console.log(`⚠️  Final result: No iconUrl for business ${businessId}`)
        }
      } else {
        console.log(`No business ID for account ${account.account_id}`)
      }

      return {
        facebookId: account.id,
        accountId: account.account_id,
        name: account.name,
        currency: account.currency,
        timezone: account.timezone_name,
        status: account.account_status,
        business: account.business,
        businessName: account.business_name,
        spendCap: account.spend_cap,
        createdTime: account.created_time,
        iconUrl
      }
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
          
          const formattedAccounts = await Promise.all(accounts.map(async (account: {
            id: string
            account_id: string
            name: string
            currency: string
            timezone_name: string
            account_status: number
            spend_cap?: string
            created_time: string
          }) => {
            let iconUrl = null
            
            // Try to fetch page profile picture (more accurate for brands)
            try {
              iconUrl = await fetchPageProfilePicture(business.id, accessToken)
              console.log(`Fetched page icon for business ${business.id}: ${iconUrl}`)
            } catch (error) {
              console.log(`Could not fetch page icon for ${business.id}:`, error)
              // Fallback to business picture if page picture fails
              try {
                iconUrl = await fetchBusinessProfilePicture(business.id, accessToken)
                console.log(`Fallback: Fetched business icon for ${business.id}: ${iconUrl}`)
              } catch (fallbackError) {
                console.log(`Could not fetch business icon either for ${business.id}:`, fallbackError)
              }
            }

            return {
              facebookId: account.id,
              accountId: account.account_id,
              name: account.name,
              currency: account.currency,
              timezone: account.timezone_name,
              status: account.account_status,
              business: business.id,
              businessName: business.name,
              spendCap: account.spend_cap,
              createdTime: account.created_time,
              iconUrl
            }
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

// Fetch Facebook page profile picture (better for brands)
async function fetchPageProfilePicture(businessId: string, accessToken: string): Promise<string | null> {
  try {
    // First, get the pages associated with this business
    const pagesUrl = `https://graph.facebook.com/v18.0/${businessId}/pages?access_token=${accessToken}`
    console.log(`Fetching pages for business: ${pagesUrl}`)
    
    const pagesResponse = await fetch(pagesUrl)
    
    if (!pagesResponse.ok) {
      console.log(`Failed to fetch pages: ${pagesResponse.status} ${pagesResponse.statusText}`)
      throw new Error('Failed to fetch business pages')
    }

    const pagesData = await pagesResponse.json()
    console.log(`Pages response:`, pagesData)
    
    if (pagesData.data && pagesData.data.length > 0) {
      // Use the first page (usually the main brand page)
      const mainPage = pagesData.data[0]
      const pageId = mainPage.id
      
      // Fetch the page profile picture
      const pictureUrl = `https://graph.facebook.com/v18.0/${pageId}/picture?type=large&redirect=false&access_token=${accessToken}`
      console.log(`Fetching page picture from: ${pictureUrl}`)
      
      const pictureResponse = await fetch(pictureUrl)
      
      if (!pictureResponse.ok) {
        console.log(`Failed to fetch page picture: ${pictureResponse.status} ${pictureResponse.statusText}`)
        throw new Error('Failed to fetch page picture')
      }

      const pictureData = await pictureResponse.json()
      console.log(`Page picture response:`, pictureData)
      
      // Facebook returns the actual picture URL in the data.url field when redirect=false
      if (pictureData.data && pictureData.data.url && !pictureData.data.is_silhouette) {
        console.log(`Found page picture URL: ${pictureData.data.url}`)
        return pictureData.data.url
      }
    }
    
    console.log(`No pages or page pictures found for business ${businessId}`)
    return null
  } catch (error) {
    console.log('Error fetching page profile picture:', error)
    return null
  }
}

// Fetch business profile picture (fallback)
async function fetchBusinessProfilePicture(businessId: string, accessToken: string): Promise<string | null> {
  try {
    const pictureUrl = `https://graph.facebook.com/v18.0/${businessId}/picture?type=large&redirect=false&access_token=${accessToken}`
    console.log(`Fetching business picture from: ${pictureUrl}`)
    
    const response = await fetch(pictureUrl)
    
    if (!response.ok) {
      console.log(`Facebook API error: ${response.status} ${response.statusText}`)
      throw new Error('Failed to fetch business picture')
    }

    const data = await response.json()
    console.log(`Facebook picture response:`, data)
    
    // Facebook returns the actual picture URL in the data.url field when redirect=false
    if (data.data && data.data.url && !data.data.is_silhouette) {
      console.log(`Found business picture URL: ${data.data.url}`)
      return data.data.url
    }
    
    console.log(`No picture found for business ${businessId} (silhouette or no data)`)
    return null
  } catch (error) {
    console.log('Error fetching business profile picture:', error)
    return null
  }
} 