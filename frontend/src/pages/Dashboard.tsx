import { useSession } from '@/lib/auth-client'
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// import InstagramDashboardContent from "@/components/instagram-dashboard-content"
import InstagramDashboardContent from "@/components/instagram-dashboard-content-v2"

export default function DashboardPage() {
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()

  if (isPending) return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  )

  if (!session) {
    navigate('/login')
    return null
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <InstagramDashboardContent />

      </SidebarInset>
    </SidebarProvider>
  )
}