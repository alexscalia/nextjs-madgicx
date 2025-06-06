import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectedAccountCard } from "../../../components/customer/connected-account-card"
import { ConnectAccountDialog } from "../../../components/customer/connect-account-dialog"
import { 
  Plug,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

// Define the ConnectedAccount type to match Prisma schema
interface ConnectedAccount {
  id: string
  customerId: string
  platform: string
  accountId: string
  accountName: string
  accessToken: string | null
  refreshToken: string | null
  syncedAt: Date | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const prisma = new PrismaClient()

export default async function ConnectedAccountsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.customerId) {
    return <div>Unauthorized</div>
  }

  // Fetch connected accounts for this customer
  const connectedAccounts: ConnectedAccount[] = await prisma.connectedAccount.findMany({
    where: {
      customerId: session.user.customerId,
      deletedAt: null
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const getAccountStats = () => {
    const total = connectedAccounts.length
    const active = connectedAccounts.filter((acc: ConnectedAccount) => acc.accessToken).length
    const platforms = [...new Set(connectedAccounts.map((acc: ConnectedAccount) => acc.platform))].length
    
    return { total, active, platforms }
  }

  const stats = getAccountStats()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Connected Accounts</h1>
          <p className="text-gray-600">Manage your advertising platform connections</p>
        </div>
        <ConnectAccountDialog customerId={session.user.customerId} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Plug className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{stats.active}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">{stats.platforms}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Your Connected Accounts</CardTitle>
          <CardDescription>
            Manage your advertising platform connections and sync settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectedAccounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedAccounts.map((account: ConnectedAccount) => (
                <ConnectedAccountCard 
                  key={account.id} 
                  account={account}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Plug className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Connected Accounts</h3>
              <p className="text-gray-500 mb-6">
                Connect your advertising platforms to start managing campaigns and analyzing performance.
              </p>
              <ConnectAccountDialog customerId={session.user.customerId} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 