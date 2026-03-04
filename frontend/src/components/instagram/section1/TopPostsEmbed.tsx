// ─────────────────────────────────────────────────────────────────────────────
// section1/TopPostsEmbed.tsx
// Top 3 posts by ER — metric cards with Instagram URL link (no embed)
// ─────────────────────────────────────────────────────────────────────────────

import { ExternalLink, TrendingUp, Eye, Heart, MessageCircle, Play, Image, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fmt, getPostER, getInstagramUrl } from "@/components/instagram/shared/utils"
import type { Post } from "@/components/instagram/shared/types"

const MEDALS    = ["🥇", "🥈", "🥉"]
const MEDAL_BG  = [
  "border-amber-400/30 bg-gradient-to-br from-amber-400/8 to-transparent",
  "border-slate-300/30 bg-gradient-to-br from-slate-300/8 to-transparent",
  "border-amber-700/30 bg-gradient-to-br from-amber-700/8 to-transparent",
]
const TYPE_ICON = { Video: Play, Image: Image, Sidecar: Layers }

export function TopPostsEmbed({ posts, followersCount, username, loading }: {
  posts: Post[]; followersCount: number; username?: string; loading: boolean
}) {
  const top3 = [...posts]
    .filter(p => p.metrics)
    .sort((a, b) => getPostER(b, followersCount) - getPostER(a, followersCount))
    .slice(0, 3)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm">Top Posts by ER</CardTitle>
            <CardDescription className="text-xs">
              {username ? `@${username} · ` : ""}Highest engagement rate
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px]">Top 3</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : !top3.length ? (
          <div className="h-28 flex items-center justify-center text-xs text-muted-foreground">
            No post data — click "Fetch Post"
          </div>
        ) : top3.map((post, i) => {
          const er    = getPostER(post, followersCount)
          const igUrl = getInstagramUrl(post)
          const Icon  = TYPE_ICON[post.type as keyof typeof TYPE_ICON] ?? Play

          return (
            <div key={post.id} className={`rounded-xl border p-3 ${MEDAL_BG[i]}`}>
              {/* Top row: medal + caption + link */}
              <div className="flex items-start gap-2.5">
                <span className="text-lg shrink-0 leading-none mt-0.5">{MEDALS[i]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 gap-0.5 shrink-0">
                      <Icon className="h-2.5 w-2.5" />{post.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground shrink-0">{fmt.dateShort(post.postedAt)}</span>
                  </div>
                  <p className="text-xs font-medium leading-snug line-clamp-2 mb-2">
                    {post.caption || "No caption"}
                  </p>

                  {/* Metrics row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <TrendingUp className="h-3 w-3" />{fmt.pct(er)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Eye className="h-3 w-3" />{fmt.num(post.metrics?.views)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Heart className="h-3 w-3" />{fmt.num(post.metrics?.likes)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MessageCircle className="h-3 w-3" />{fmt.num(post.metrics?.comments)}
                    </span>
                    {igUrl && (
                      <a
                        href={igUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-1 text-[11px] text-primary hover:underline shrink-0"
                      >
                        View on Instagram <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}