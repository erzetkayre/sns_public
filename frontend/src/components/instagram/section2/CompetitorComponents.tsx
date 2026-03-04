// ─────────────────────────────────────────────────────────────────────────────
// section2/CompetitorComponents.tsx
// Row 1: CompetitorTable + ERComparison
// Row 2: PerformanceBar (3:2) + LocationHashtags column
// ─────────────────────────────────────────────────────────────────────────────

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Cell,
} from "recharts"
import { MapPin, Hash, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fmt, CHART_COLORS } from "@/components/instagram/shared/utils"
import type { CompetitorMetrics } from "@/components/instagram/shared/types"

// ── Competitor Table ──────────────────────────────────────────────────────────

interface CompetitorTableProps {
  competitors: CompetitorMetrics[]
  loading: boolean
}

export function CompetitorTable({ competitors, loading }: CompetitorTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Competitor Accounts</CardTitle>
        <CardDescription className="text-xs">Followers · Avg ER · Avg Likes · Avg Comments</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-5 space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  {["Account", "Followers", "Avg ER", "Avg Likes", "Avg Comments"].map((h, i) => (
                    <th key={h} className={`text-xs font-medium text-muted-foreground py-2.5 ${i === 0 ? "text-left px-5" : "text-right px-3"} ${i === 4 ? "pr-5" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!competitors.length ? (
                  <tr><td colSpan={5} className="text-center py-8 text-xs text-muted-foreground">No competitor data</td></tr>
                ) : competitors.map((cm, i) => (
                  <tr key={cm.account.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                        >
                          {cm.account.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-medium">@{cm.account.username}</p>
                          <p className="text-[10px] text-muted-foreground">{cm.account.fullName || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right text-xs font-medium">{fmt.num(cm.account.followersCount)}</td>
                    <td className="px-3 py-3 text-right">
                      <span className={`text-xs font-bold ${cm.avgER >= 2 ? "text-emerald-600" : cm.avgER >= 1 ? "text-amber-600" : "text-rose-500"}`}>
                        {fmt.pct(cm.avgER)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-xs">{fmt.num(cm.avgLikes)}</td>
                    <td className="px-5 py-3 text-right text-xs">{fmt.num(cm.avgComments)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── ER Comparison Grid ────────────────────────────────────────────────────────

interface ERComparisonProps {
  competitors: CompetitorMetrics[]
  loading: boolean
}

export function ERComparison({ competitors, loading }: ERComparisonProps) {
  const data = competitors.map(cm => ({
    name: `@${cm.account.username}`,
    er:   cm.avgER,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">ER Comparison</CardTitle>
        <CardDescription className="text-xs">Average engagement rate across accounts</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-44 rounded-lg" /> : !data.length ? (
          <div className="h-44 flex items-center justify-center text-xs text-muted-foreground">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 20, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
              <Tooltip formatter={(v: number) => [`${Number(v).toFixed(2)}%`, "Avg ER"]} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="er" name="Avg ER" radius={[0, 4, 4, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.er >= 2 ? "#10b981" : d.er >= 1 ? "#f59e0b" : "#f43f5e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ── Performance Comparison Bar Chart ─────────────────────────────────────────

interface PerformanceBarProps {
  competitors: CompetitorMetrics[]
  loading: boolean
}

export function PerformanceBar({ competitors, loading }: PerformanceBarProps) {
  const data = competitors.map(cm => ({
    name:     `@${cm.account.username}`,
    posts:    cm.posts.length,
    likes:    cm.avgLikes,
    comments: cm.avgComments,
    views:    cm.avgViews,
  }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">Performance Comparison</CardTitle>
        <CardDescription className="text-xs">Posts · Avg Likes · Avg Comments · Avg Views</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-52 rounded-lg" /> : !data.length ? (
          <div className="h-52 flex items-center justify-center text-xs text-muted-foreground">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => fmt.num(v)} />
              <Tooltip formatter={(v: number, n: string) => [fmt.num(v), n]} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="posts"    name="Posts"         fill="#6366f1" radius={[2,2,0,0]} />
              <Bar dataKey="likes"    name="Avg Likes"     fill="#f43f5e" radius={[2,2,0,0]} />
              <Bar dataKey="comments" name="Avg Comments"  fill="#10b981" radius={[2,2,0,0]} />
              <Bar dataKey="views"    name="Avg Views"     fill="#f59e0b" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ── Top Locations & Hashtags Column ──────────────────────────────────────────

interface LocationHashtagsProps {
  competitors: CompetitorMetrics[]
  loading: boolean
}

export function LocationHashtags({ competitors, loading }: LocationHashtagsProps) {
  // Aggregate across all competitors
  const locationMap: Record<string, number> = {}
  const hashtagMap: Record<string, number> = {}

  competitors.forEach(cm => {
    cm.topLocations.forEach(({ location, count }) => {
      locationMap[location] = (locationMap[location] ?? 0) + count
    })
    cm.topHashtags.forEach(({ tag, count }) => {
      hashtagMap[tag] = (hashtagMap[tag] ?? 0) + count
    })
  })

  const topLocations = Object.entries(locationMap)
    .sort(([, a], [, b]) => b - a).slice(0, 3)
  const topHashtags = Object.entries(hashtagMap)
    .sort(([, a], [, b]) => b - a).slice(0, 3)

  const ListCard = ({ title, icon: Icon, items, color, emptyMsg }: {
    title: string; icon: React.ElementType
    items: [string, number][]; color: string; emptyMsg: string
  }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" style={{ color }} /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)
        ) : !items.length ? (
          <p className="text-xs text-muted-foreground py-2">{emptyMsg}</p>
        ) : items.map(([label, count], i) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
              <span className="text-xs truncate max-w-[120px]">{label}</span>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0">{count}×</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )

  return (
    <div className="flex flex-col gap-3 h-full">
      <ListCard
        title="Top Locations"
        icon={MapPin}
        items={topLocations}
        color="#6366f1"
        emptyMsg="No location data"
      />
      <ListCard
        title="Top Hashtags"
        icon={Hash}
        items={topHashtags}
        color="#f43f5e"
        emptyMsg="No hashtag data"
      />
    </div>
  )
}
