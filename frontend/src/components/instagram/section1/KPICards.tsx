// ─────────────────────────────────────────────────────────────────────────────
// section1/KPICards.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Users, Eye, Heart, TrendingUp, Video, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fmt } from "@/components/instagram/shared/utils"
import type { Account, ComputedKPI } from "@/components/instagram/shared/types"

interface KPICardsProps {
  account?: Account
  kpi?: ComputedKPI
  loading: boolean
}

export function KPICards({ account, kpi, loading }: KPICardsProps) {
  const cards = [
    {
      label: "Followers",
      value: fmt.num(account?.followersCount),
      icon: Users,
      color: "text-violet-600",
      bg: "bg-violet-500/10",
      accent: "#7c3aed",
    },
    {
      label: "Avg Views / Video",
      value: kpi ? fmt.num(kpi.avgViewsPerVideo) : "—",
      icon: Eye,
      color: "text-sky-600",
      bg: "bg-sky-500/10",
      accent: "#0284c7",
    },
    {
      label: "Avg Likes / Video",
      value: kpi ? fmt.num(kpi.avgLikesPerVideo) : "—",
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      accent: "#f43f5e",
    },
    {
      label: "Avg ER",
      value: kpi ? fmt.pct(kpi.avgErAllPosts) : "—",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      accent: "#10b981",
      sub: "ER = (Likes×2 + Comments×5) / Followers",
    },
    {
      label: "Total Videos",
      value: kpi ? String(kpi.totalVideos) : "—",
      icon: Video,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
      accent: "#d97706",
      sub: kpi ? `+${kpi.totalImages} img · ${kpi.totalSidecars} carousel` : undefined,
    },
    {
      label: "Posts / Week",
      value: kpi ? `${kpi.postingFreqPerWeek}×` : "—",
      icon: Calendar,
      color: "text-indigo-600",
      bg: "bg-indigo-500/10",
      accent: "#4f46e5",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map(({ label, value, icon: Icon, color, bg, sub, accent }) => (
        <Card key={label} className="p-4 flex flex-col gap-2 overflow-hidden relative group hover:shadow-md transition-shadow">
          {/* Subtle accent line on hover */}
          <div
            className="absolute top-0 left-0 w-full h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: accent }}
          />
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold mt-0.5 leading-none">{value}</p>
            {sub && <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{sub}</p>}
          </div>
        </Card>
      ))}
    </div>
  )
}
