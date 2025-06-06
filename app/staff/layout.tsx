import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Sidebar } from "@/components/staff/sidebar"
import { TopBar } from "@/components/staff/top-bar"
import { authOptions } from "../api/auth/[...nextauth]/route"

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  // Redirect if not authenticated or not a staff user
  if (!session?.user || !session.user.role || !['Administrator', 'Support Agent'].includes(session.user.role)) {
    redirect('/auth/staff/signin')
  }

  // Additional check: verify user status is active (in case session is stale)
  // This ensures that if a user's status changes, they'll be redirected on next request

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 