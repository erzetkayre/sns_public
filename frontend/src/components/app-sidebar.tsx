import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFileAi,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSession } from '@/lib/auth-client'
import { useNavigate } from 'react-router-dom'

// const data = {
//   // navClouds: [
//   //   {
//   //     title: "Capture",
//   //     icon: IconCamera,
//   //     isActive: true,
//   //     url: "#",
//   //     items: [
//   //       {
//   //         title: "Active Proposals",
//   //         url: "#",
//   //       },
//   //       {
//   //         title: "Archived",
//   //         url: "#",
//   //       },
//   //     ],
//   //   },
//   //   {
//   //     title: "Proposal",
//   //     icon: IconFileDescription,
//   //     url: "#",
//   //     items: [
//   //       {
//   //         title: "Active Proposals",
//   //         url: "#",
//   //       },
//   //       {
//   //         title: "Archived",
//   //         url: "#",
//   //       },
//   //     ],
//   //   },
//   //   {
//   //     title: "Prompts",
//   //     icon: IconFileAi,
//   //     url: "#",
//   //     items: [
//   //       {
//   //         title: "Active Proposals",
//   //         url: "#",
//   //       },
//   //       {
//   //         title: "Archived",
//   //         url: "#",
//   //       },
//   //     ],
//   //   },
//   // ],
//   // navSecondary: [
//   //   {
//   //     title: "Settings",
//   //     url: "#",
//   //     icon: IconSettings,
//   //   },
//   //   {
//   //     title: "Get Help",
//   //     url: "#",
//   //     icon: IconHelp,
//   //   },
//   //   {
//   //     title: "Search",
//   //     url: "#",
//   //     icon: IconSearch,
//   //   },
//   // ],
//   // documents: [
//   //   {
//   //     name: "Data Library",
//   //     url: "#",
//   //     icon: IconDatabase,
//   //   },
//   //   {
//   //     name: "Reports",
//   //     url: "#",
//   //     icon: IconReport,
//   //   },
//   //   {
//   //     name: "Word Assistant",
//   //     url: "#",
//   //     icon: IconFileWord,
//   //   },
//   // ],
// }

const navMain = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "MyAccount", url: "/my-account", icon: IconListDetails },
  { title: "Competitors", url: "/competitor", icon: IconChartBar },
  { title: "Summary and Analysis", url: "/summary-analysis", icon: IconFolder },
  { title: "AI Analysis", url: "/ai-analysis", icon: IconFileAi },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()

  if (isPending) return null

  if (!session?.user) {
    navigate("/login")
    return null
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">SNS Analytical</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
            name: session.user.name,
            email: session.user.email,
            avatar: session.user.image ?? "/avatars/default.jpg",
          }} />
      </SidebarFooter>
    </Sidebar>
  )
}
