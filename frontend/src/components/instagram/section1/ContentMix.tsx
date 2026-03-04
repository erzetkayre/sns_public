// ─────────────────────────────────────────────────────────────────────────────
// section1/ContentMix.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fmt } from "@/components/instagram/shared/utils"
import type { ComputedKPI } from "@/components/instagram/shared/types"

interface ContentMixProps {
  kpi?: ComputedKPI
  loading: boolean
}

const MIX_COLORS = { Video: "#6366f1", Image: "#f43f5e", Sidecar: "#10b981" }

export function ContentMix({ kpi, loading }: ContentMixProps) {
  const data = kpi ? [
    { name: "Video",   value: kpi.totalVideos,   color: MIX_COLORS.Video   },
    { name: "Image",   value: kpi.totalImages,   color: MIX_COLORS.Image   },
    { name: "Sidecar", value: kpi.totalSidecars, color: MIX_COLORS.Sidecar },
  ].filter(d => d.value > 0) : []

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Content Mix</CardTitle>
        <CardDescription className="text-xs">Post type distribution</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-44 rounded-lg" /> : !data.length ? (
          <div className="h-44 flex items-center justify-center text-xs text-muted-foreground">No data yet</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                  {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v: number, name: string) => [fmt.num(v), name]}
                  contentStyle={{ borderRadius: 8, fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-1">
              {data.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs text-muted-foreground">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{fmt.num(d.value)}</span>
                    <span className="text-[10px] text-muted-foreground">
                      ({total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
