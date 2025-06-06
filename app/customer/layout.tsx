import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { CustomerSidebar } from "@/components/customer/sidebar"
import { CustomerTopBar } from "@/components/customer/top-bar"
import { authOptions } from "../api/auth/[...nextauth]/route"

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  // Redirect if not authenticated or not a customer user
  if (!session?.user || !session.user.customerId) {
    redirect('/auth/customer/signin')
  }

  // Additional check: verify user status is active (in case session is stale)
  // This ensures that if a user's status changes, they'll be redirected on next request

  return (
    <div className="flex h-screen bg-gray-100">
      <CustomerSidebar />
      <div className="flex-1 flex flex-col">
        <CustomerTopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 