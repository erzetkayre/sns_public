// ─────────────────────────────────────────────────────────────────────────────
// section3/CrossAccountComponents.tsx
// Row 1: TopPostsTable (past 15 days) + Top3ERGrid (all accounts)
// Row 2: ContentDistribution comparison + AccountMetricGraphs
// ─────────────────────────────────────────────────────────────────────────────

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts"
import { ExternalLink, TrendingUp, Heart, MessageCircle, Eye, Play, Image, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fmt, getPostER, getInstagramUrl, CHART_COLORS } from "@/components/instagram/shared/utils"
import type { Post, Account, CompetitorMetrics } from "@/components/instagram/shared/types"

// ── Top Posts Table (past 15 days, all accounts) ──────────────────────────────

interface TopPostsTableProps {
  allPostsByAccount: { account: Account; posts: Post[] }[]
  loading: boolean
}

export function TopPostsTable({ allPostsByAccount, loading }: TopPostsTableProps) {
  const cutoff = Date.now() - 15 * 24 * 60 * 60 * 1000

  const rows = allPostsByAccount.flatMap(({ account, posts }) =>
    posts
      .filter(p => new Date(p.postedAt).getTime() >= cutoff && p.metrics)
      .map(p => ({ account, post: p }))
  )
  .sort((a, b) => (b.post.metrics?.views ?? 0) - (a.post.metrics?.views ?? 0))
  .slice(0, 15)

  const TypeIcon = { Video: Play, Image: Image, Sidecar: Layers }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Top Posts — Last 15 Days</CardTitle>
        <CardDescription className="text-xs">All accounts · Sorted by views</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-5 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-9 rounded-lg" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/40">
                  {["#", "Account", "Type", "Views", "Likes", "Comments", "URL"].map((h, i) => (
                    <th key={h} className={`text-xs font-medium text-muted-foreground py-2.5 ${i <= 1 ? "text-left px-4" : "text-right px-3"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!rows.length ? (
                  <tr><td colSpan={7} className="text-center py-8 text-xs text-muted-foreground">No posts in past 15 days</td></tr>
                ) : rows.map(({ account, post }, i) => {
                  const Icon = TypeIcon[post.type as keyof typeof TypeIcon] ?? Play
                  const igUrl = getInstagramUrl(post)
                  return (
                    <tr key={post.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2 text-xs text-muted-foreground font-mono w-8">{i + 1}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                            {account.username?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs">@{account.username}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Badge variant="outline" className="text-[9px] gap-0.5 px-1.5">
                          <Icon className="h-2.5 w-2.5" />{post.type}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-right text-xs font-medium">{fmt.num(post.metrics?.views)}</td>
                      <td className="px-3 py-2 text-right text-xs text-rose-500">{fmt.num(post.metrics?.likes)}</td>
                      <td className="px-3 py-2 text-right text-xs text-sky-500">{fmt.num(post.metrics?.comments)}</td>
                      <td className="px-3 py-2 text-right">
                        {igUrl ? (
                          <a href={igUrl} target="_blank" rel="noopener noreferrer"
                             className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                            View <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ) : <span className="text-[10px] text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Top 3 Posts by ER — All Accounts Grid ────────────────────────────────────

interface Top3ERGridProps {
  allPostsByAccount: { account: Account; posts: Post[] }[]
  loading: boolean
}

export function Top3ERGrid({ allPostsByAccount, loading }: Top3ERGridProps) {
  const allPosts = allPostsByAccount.flatMap(({ account, posts }) =>
    posts.filter(p => p.metrics).map(p => ({ account, post: p }))
  )

  const top3 = allPosts
    .sort((a, b) => getPostER(b.post, b.account.followersCount) - getPostER(a.post, a.account.followersCount))
    .slice(0, 3)

  const medals = ["🥇", "🥈", "🥉"]
  const medalBg = [
    "from-amber-400/15 to-transparent border-amber-400/30",
    "from-slate-300/15 to-transparent border-slate-300/30",
    "from-amber-700/15 to-transparent border-amber-700/30",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Top 3 Posts by ER</CardTitle>
        <CardDescription className="text-xs">Across all accounts (main + competitors)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : !top3.length ? (
          <div className="h-20 flex items-center justify-center text-xs text-muted-foreground">No data</div>
        ) : top3.map(({ account, post }, i) => {
          const er = getPostER(post, account.followersCount)
          const igUrl = getInstagramUrl(post)
          return (
            <div key={post.id} className={`rounded-xl border bg-gradient-to-br ${medalBg[i]} p-3`}>
              <div className="flex items-start gap-2.5">
                <span className="text-base shrink-0 mt-0.5">{medals[i]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-semibold text-primary">@{account.username}</span>
                    <Badge variant="outline" className="text-[9px] px-1">{post.type}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{post.caption || "No caption"}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <TrendingUp className="h-3 w-3" /> {fmt.pct(er)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Eye className="h-2.5 w-2.5" /> {fmt.num(post.metrics?.views)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Heart className="h-2.5 w-2.5" /> {fmt.num(post.metrics?.likes)}
                    </span>
                  </div>
                </div>
                {igUrl && (
                  <a href={igUrl} target="_blank" rel="noopener noreferrer"
                     className="shrink-0 p-1 rounded hover:bg-white/20 transition-colors opacity-50 hover:opacity-100">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ── Content Distribution Comparison ──────────────────────────────────────────

interface ContentDistributionProps {
  allPostsByAccount: { account: Account; posts: Post[] }[]
  loading: boolean
}

export function ContentDistributionComparison({ allPostsByAccount, loading }: ContentDistributionProps) {
  const data = allPostsByAccount.map(({ account, posts }) => ({
    name:    `@${account.username}`,
    Video:   posts.filter(p => p.type === "Video").length,
    Image:   posts.filter(p => p.type === "Image").length,
    Sidecar: posts.filter(p => p.type === "Sidecar").length,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Content Distribution</CardTitle>
        <CardDescription className="text-xs">Video · Image · Carousel across accounts</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-52 rounded-lg" /> : !data.length ? (
          <div className="h-52 flex items-center justify-center text-xs text-muted-foreground">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Video"   name="Video"   fill="#6366f1" radius={[2,2,0,0]} stackId="a" />
              <Bar dataKey="Image"   name="Image"   fill="#f43f5e" radius={[0,0,0,0]} stackId="a" />
              <Bar dataKey="Sidecar" name="Sidecar" fill="#10b981" radius={[2,2,0,0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ── Account Metrics Graph (likes, avg comments, views) ────────────────────────

interface AccountMetricsProps {
  allPostsByAccount: { account: Account; posts: Post[] }[]
  loading: boolean
}

export function AccountMetrics({ allPostsByAccount, loading }: AccountMetricsProps) {
  const data = allPostsByAccount.map(({ account, posts }) => {
    const pm = posts.filter(p => p.metrics)
    const avg = (key: "likes" | "comments" | "views") =>
      pm.length ? Math.round(pm.reduce((s, p) => s + (p.metrics![key] ?? 0), 0) / pm.length) : 0
    return {
      name:     `@${account.username}`,
      likes:    avg("likes"),
      comments: avg("comments"),
      views:    avg("views"),
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Account Metrics Graph</CardTitle>
        <CardDescription className="text-xs">Avg Likes · Avg Comments · Avg Views per post</CardDescription>
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
              <Bar dataKey="likes"    name="Avg Likes"    fill="#f43f5e" radius={[2,2,0,0]} />
              <Bar dataKey="comments" name="Avg Comments" fill="#10b981" radius={[2,2,0,0]} />
              <Bar dataKey="views"    name="Avg Views"    fill="#6366f1" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
