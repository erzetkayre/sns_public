// ─────────────────────────────────────────────────────────────────────────────
// section1/EngagementCharts.tsx
// Row 4: Daily ER trend + Detailed Performance (likes/comments/views)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react"
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fmt, getPostER } from "@/components/instagram/shared/utils"
import type { Post } from "@/components/instagram/shared/types"

// ── ER Trend Chart ────────────────────────────────────────────────────────────

interface ERTrendChartProps {
  posts: Post[]
  followersCount: number
  loading: boolean
}

export function ERTrendChart({ posts, followersCount, loading }: ERTrendChartProps) {
  const [range, setRange] = useState<10 | 20 | 50>(20)

  const data = [...posts]
    .filter(p => p.postedAt && p.metrics)
    .sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime())
    .slice(-range)
    .map(p => ({
      date: fmt.dateShort(p.postedAt),
      er: getPostER(p, followersCount),
    }))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Daily ER Trend</CardTitle>
            <CardDescription className="text-xs">Engagement rate per post over time</CardDescription>
          </div>
          <div className="flex gap-1">
            {([10, 20, 50] as const).map(n => (
              <button
                key={n}
                onClick={() => setRange(n)}
                className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
                  range === n ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? <Skeleton className="h-44 rounded-lg" /> : !data.length ? (
          <div className="h-44 flex items-center justify-center text-xs text-muted-foreground">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip
                formatter={(v: number) => [`${Number(v).toFixed(2)}%`, "ER"]}
                contentStyle={{ borderRadius: 8, fontSize: 11 }}
              />
              <Line
                type="monotone" dataKey="er" stroke="#f59e0b" strokeWidth={2}
                dot={{ r: 3, fill: "#f59e0b" }} name="ER (%)"
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ── Performance Detail Chart ──────────────────────────────────────────────────

type MetricKey = "views" | "likes" | "comments"

const METRICS: { key: MetricKey; label: string; color: string }[] = [
  { key: "views",    label: "Views",    color: "#6366f1" },
  { key: "likes",    label: "Likes",    color: "#f43f5e" },
  { key: "comments", label: "Comments", color: "#10b981" },
]

interface PerformanceChartProps {
  posts: Post[]
  loading: boolean
}

export function PerformanceChart({ posts, loading }: PerformanceChartProps) {
  const [active, setActive] = useState<Set<MetricKey>>(new Set(["views", "likes", "comments"]))
  const [range, setRange] = useState<10 | 20 | 50>(20)

  const toggle = (key: MetricKey) => setActive(prev => {
    const next = new Set(prev)
    if (next.has(key) && next.size > 1) next.delete(key)
    else next.add(key)
    return next
  })

  const data = [...posts]
    .filter(p => p.postedAt && p.metrics)
    .sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime())
    .slice(-range)
    .map(p => ({
      date:     fmt.dateShort(p.postedAt),
      views:    p.metrics!.views    ?? 0,
      likes:    p.metrics!.likes    ?? 0,
      comments: p.metrics!.comments ?? 0,
    }))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm">Detailed Performance</CardTitle>
            <CardDescription className="text-xs">Likes · Comments · Views per post</CardDescription>
          </div>
          <div className="flex gap-1">
            {([10, 20, 50] as const).map(n => (
              <button
                key={n}
                onClick={() => setRange(n)}
                className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
                  range === n ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        {/* Metric toggle pills */}
        <div className="flex gap-2 pt-1 flex-wrap">
          {METRICS.map(({ key, label, color }) => {
            const on = active.has(key)
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  on ? "border-transparent text-white font-medium" : "text-muted-foreground border-border opacity-50 hover:opacity-75"
                }`}
                style={on ? { background: color } : {}}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: on ? "rgba(255,255,255,0.8)" : color }} />
                {label}
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? <Skeleton className="h-44 rounded-lg" /> : !data.length ? (
          <div className="h-44 flex items-center justify-center text-xs text-muted-foreground">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => fmt.num(v)} />
              <Tooltip
                formatter={(v: number, n: string) => [fmt.num(v), n]}
                contentStyle={{ borderRadius: 8, fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {METRICS.filter(m => active.has(m.key)).map(m => (
                <Bar key={m.key} dataKey={m.key} name={m.label} fill={m.color} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
