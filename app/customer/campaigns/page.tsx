import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { PrismaClient } from "../../generated/prisma"
import { CampaignsClient } from "@/components/customer/campaigns-client"

const prisma = new PrismaClient()

// Define Campaign interface to match our database schema
interface Campaign {
  id: string
  customerId: string
  subCustomerId: string | null
  connectedAccountId: string | null
  platform: string
  campaignId: string
  name: string
  status: string
  budget: number | null
  startDate: Date | null
  endDate: Date | null
  metrics: unknown
  date: Date
  createdAt: Date
  updatedAt: Date
  connectedAccount?: {
    platform: string
    accountName: string
  } | null
}

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.customerId) {
    return <div>Unauthorized</div>
  }

  // Fetch campaigns for this customer from connected accounts
  const campaigns: Campaign[] = await prisma.campaign.findMany({
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

  // Fetch connected accounts to see which platforms are available
  const connectedAccounts = await prisma.connectedAccount.findMany({
    where: {
      customerId: session.user.customerId,
      deletedAt: null,
      accessToken: {
        not: null
      }
    },
    select: {
      id: true,
      platform: true,
      accountName: true
    }
  })

  return (
    <div className="p-6">
      <CampaignsClient
        initialCampaigns={campaigns}
        connectedAccounts={connectedAccounts}
        customerId={session.user.customerId}
      />
    </div>
  )
} 