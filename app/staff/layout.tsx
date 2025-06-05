import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Sidebar } from "@/components/staff/sidebar"
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
} 