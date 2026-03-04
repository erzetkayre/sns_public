/**
 * InstagramDashboardContent  v3
 * ──────────────────────────────
 * Render di dalam <SidebarInset> dari DashboardPage.
 *
 * FIXES v3:
 *  - Normalisasi field API: postType→type, metricsSnapshots→metrics,
 *    postHashtags[].hashtag.tag→hashtags, videoViewCount→views, dll.
 *  - ER formula sesuai schema: stored as decimal (0.0523 = 5.23%)
 *    Frontend menampilkan: engagementRate * 100 untuk persen
 *    Fallback kalkulasi manual jika snapshot tidak ada
 *  - Daily AI Analysis lengkap dari resultJson:
 *    Deep Analysis (hookAnalysisDetailed, overallAssessment, retentionPrediction,
 *    top3ActionableRecommendations, erCorrelationAnalysis, psychologicalTriggers)
 *    Video Analysis (videoStructureAnalysis, specificEditingTechniques,
 *    cutCompositionAnalysis, pacingRhythm, filmingMethodDetails, soundDesignAnalysis)
 *    Thumbnail/Post Rankings (themeIdentification, captionOverlayAnalysis,
 *    visualExpressionTechniques, competitiveGapAnalysis)
 */

import { useState, useEffect, useCallback } from "react"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts"
import {
  RefreshCw, TrendingUp, TrendingDown, Users, Heart,
  Eye, Video, Zap, Award, Calendar, Brain, X,
  Search, Clock, Image as ImageIcon, Sparkles,
  CheckCircle, ArrowRight, ChevronDown, ChevronUp,
  Music, Film, Camera, Layers, Target, AlertTriangle,
} from "lucide-react"
import { SectionHeader } from "@/components/instagram/shared/ui-primitives"

import { Button }   from "@/components/ui/button"
import { Badge }    from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// ── Section 1
// import { KPICards }          from "@/components/instagram/section1/KPICards"
import { TopPostsEmbed }     from "@/components/instagram/section1/TopPostsEmbed"
// import { ContentMix }        from "@/components/instagram/section1/ContentMix"
// import { AIAnalysis }        from "@/components/instagram/section1/AIAnalysis"
import { ERTrendChart, PerformanceChart } from "@/components/instagram/section1/EngagementCharts"
import type {
  Account, Post, RawPost, AnalysisResult, ComputedKPI,
  Job, CompetitorMetrics,
} from "@/components/instagram/shared/types"
import {
  normalizePost, normalizeAccount, computeKPI,
  computeCompetitorMetrics, toNum,
} from "@/components/instagram/shared/utils"
// ── Section 2
import {
  CompetitorTable, ERComparison,
  PerformanceBar, LocationHashtags,
} from "@/components/instagram/section2/CompetitorComponents"

// ── Section 3
import {
  TopPostsTable, Top3ERGrid,
  ContentDistributionComparison, AccountMetrics,
} from "@/components/instagram/section3/CrossAccountComponents"

// ── API ───────────────────────────────────────────────────────────────────────

const API_BASE = "/api"

const api = {
  getAccounts:        ()              => fetch(`${API_BASE}/ig/accounts`).then(r => r.json()),
  getAccountPosts:    (id: string, limit = 100) =>
    fetch(`${API_BASE}/ig/accounts/${id}/posts?limit=${limit}`).then(r => r.json()),
  getAccountAnalysis: (id: string, limit = 50) =>
    fetch(`${API_BASE}/ai/account/${id}/analysis?limit=${limit}`).then(r => r.json()),
  startScrape:        () => fetch(`${API_BASE}/ig/scrape`,  { method: "POST" }).then(r => r.json()),
  startAiAnalysis:    () => fetch(`${API_BASE}/ai/analyze`, { method: "POST" }).then(r => r.json()),
  getJobStatus:       (id: string)    => fetch(`${API_BASE}/ig/job/${id}`).then(r => r.json()),
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Account {
  id: string
  username: string
  fullName?: string
  accountType: "main" | "competitor"
  followersCount: number
  isVerified: boolean
  postCount?: number
  postsCount?: number     // alias from API
  followerHistory?: { followersCount: number; followers?: number; recordedAt: string }[]
}

// Raw API response shape (Prisma includes)
interface RawPost {
  id: string
  postType?: string     // Prisma enum: Video | Image | Sidecar
  type?: string         // if backend normalizes it
  caption?: string
  postedAt: string
  hashtags?: string[]                                     // pre-normalized
  postHashtags?: { hashtag: { tag: string } }[]          // Prisma join
  metricsSnapshots?: RawMetricSnapshot[]                  // latest snapshot
  metrics?: { views: number; likes: number; comments: number } // pre-normalized
}

interface RawMetricSnapshot {
  likesCount: number
  commentsCount: number
  shareCount?: number
  savedCount?: number
  videoViewCount: number
  videoPlayCount?: number
  engagementRate?: number | string  // Decimal stored as 0.0523 = 5.23%
  fetchedAt: string
}

// Normalized internal format
interface Post {
  id: string
  type: string
  caption?: string
  postedAt: string
  hashtags: string[]
  metrics?: { views: number; likes: number; comments: number; er?: number }
}

interface ComputedKPI {
  followers: number
  totalVideos: number
  totalImages: number
  totalSidecars: number
  avgViewsPerVideo: number
  avgLikesPerVideo: number
  avgErAllPosts: number      // sudah dalam %, mis: 2.34
  postingFreqPerWeek: number
}

// ── Deep AI Analysis Types (dari resultJson Gemini) ───────────────────────────

interface AiPost {
  postId: string
  caption?: string
  hookScore: number
  productionQuality: number
  engagementPotential: number
  overallScore: number
  analyzedAt: string
  resultJson?: GeminiResult | null
}

interface GeminiResult {
  summary?: string
  overallAssessment?: {
    overallScore: number
    contentQuality: number
    audienceResonance: number
    viralityPotential: number
    engagementPotential: number
    brandAlignment: number
    analysis?: string
  }
  hookAnalysisDetailed?: {
    overallHookScore: number
    hookEffectiveness: string
    improvementPotential?: string
    bestPracticeAlignment?: string
    psychologicalTriggers?: Record<string, boolean>
    firstSecond?: { scrollStoppingPower?: string; firstImpression?: string; visualImpactScore?: number }
    thirdSecond?: { valueProposition?: string; storyPromise?: string }
  }
  retentionPrediction?: {
    retentionScore: number
    hookEffectiveness: string
    endVideoCompletion: string
    midVideoEngagement: string
    dropOffPoints?: string
    analysis?: string
  }
  top3ActionableRecommendations?: {
    priority: number
    recommendation: string
    reasoning: string
  }[]
  erCorrelationAnalysis?: {
    likes: number
    views: number
    comments: number
    engagementRate: number
    erScore: number
    correlationAnalysis: string
    averageERFor100KAccount?: number
  }
  pacingRhythm?: {
    pacingScore: number
    overallPacing: string
    energyLevel: string
    rhythmEffectiveness: string
    viewerEngagementImpact: string
  }
  videoStructureAnalysis?: {
    structureQuality?: { overallScore: number; storyFlow: string; narrativeClarity: string }
    introduction?: { effectiveness: string; timeRange: string }
    climax?: { peakMoment: string; effectiveness: string; timeRange: string }
    conclusion?: { ctaType: string; effectiveness: string }
  }
  specificEditingTechniques?: {
    overallEditingScore: number
    fastCuts?: { usage: string; effectiveness: string }
    colorGrading?: { style: string; effectiveness: string }
    textAnimation?: { style: string; effectiveness: string }
  }
  soundDesignAnalysis?: {
    soundDesignScore: number
    bgmSelection?: { mood: string; appropriateness: string }
    sfxUsage?: { presence: string; potentialImprovement?: string }
    voiceOverNarration?: { presence: boolean; effectiveness: string }
  }
  themeIdentification?: {
    themeEffectivenessScore: number
    primaryTheme?: { category: string; description: string }
    uniqueAngle?: { hasUniqueAngle: boolean; differentiationFactor: string }
    targetAudience?: { audienceType: string; audienceFit: string }
    secondaryThemes?: { theme: string; description: string }[]
  }
  visualExpressionTechniques?: {
    visualExpressionScore: number
    colorPsychology?: { dominantColorPalette: string; colorMood: string }
    compositionTechniques?: { framing: string; ruleOfThirds: string }
    motionDynamicElements?: { motionQuality: string; motionPurpose: string }
    visualStyleConsistency?: { consistencyScore: number; styleDescription: string }
  }
  captionOverlayAnalysis?: {
    captionOverlayScore: number
    readability?: { overallReadability: string; fontStyle: string }
    callToAction?: { presence: boolean; effectiveness: string }
    contentRelevance?: { valueAdd: string }
  }
  competitiveGapAnalysis?: {
    competitiveGapScore: number
    differentiation?: { uniqueSellingPoints: string[]; marketPositioning: string }
    strengthsAgainstCompetitors?: string[]
    weaknessesAgainstCompetitors?: string[]
    opportunityAreas?: string[]
    threats?: string[]
  }
  filmingMethodDetails?: {
    overallProductionValue?: { productionQualityScore: number; budgetEstimate: string }
    lightingSetup?: { lightingScore: number; lightingMood: string; primaryLightSource: string }
    cameraEquipment?: { cameraTypeEstimate: string; cameraQuality: string }
    stabilizationSupport?: { stabilizationType: string; stabilizationQuality: string }
  }
}

interface AnalysisResult {
  account: { id: string; totalAnalyzed: number }
  aggregateScores: {
    averageHookScore: number
    averageProductionQuality: number
    averageEngagementPotential: number
    averageOverallScore: number
  }
  analyses: AiPost[]
}

interface Job {
  id: string
  status: "pending" | "running" | "completed" | "failed"
  postsCreated?: number
  postsUpdated?: number
  mediaDownloaded?: number
  errorMessage?: string
}

// ── API Response Normalizer ───────────────────────────────────────────────────
// Handles semua variasi field naming dari Prisma/Express

function normalizePosts(raw: RawPost): Post {
  // 1. type: postType (Prisma) atau type (pre-normalized)
  const type = raw.type ?? raw.postType ?? "Video"

  // 2. hashtags: bisa array string langsung, atau join table
  let hashtags: string[] = []
  if (Array.isArray(raw.hashtags)) {
    hashtags = raw.hashtags
  } else if (Array.isArray(raw.postHashtags)) {
    hashtags = raw.postHashtags.map(ph => ph.hashtag?.tag).filter(Boolean)
  }

  // 3. metrics: bisa pre-normalized atau dari metricsSnapshots[0]
  let metrics: Post["metrics"] | undefined
  if (raw.metrics) {
    metrics = raw.metrics
  } else if (raw.metricsSnapshots?.length) {
    const snap = raw.metricsSnapshots[0]
    const likes    = snap.likesCount     ?? 0
    const comments = snap.commentsCount  ?? 0
    const views    = snap.videoViewCount ?? 0
    // engagementRate di schema: Decimal 0.0523 = 5.23%
    // Kalikan 100 untuk tampilkan sebagai %
    const er = snap.engagementRate != null
      ? parseFloat(String(snap.engagementRate)) * 100
      : undefined
    metrics = { views, likes, comments, er }
  }

  return { id: raw.id, type, caption: raw.caption, postedAt: raw.postedAt, hashtags, metrics }
}

function normalizeAccounts(raw: Account): Account {
  return {
    ...raw,
    postCount: raw.postCount ?? raw.postsCount ?? 0,
  }
}

// ── Kalkulasi KPI dari posts ──────────────────────────────────────────────────

function computeKPIs(posts: Post[], followersCount: number): ComputedKPI {
  const videos   = posts.filter(p => p.type === "Video")
  const images   = posts.filter(p => p.type === "Image")
  const sidecars = posts.filter(p => p.type === "Sidecar")

  const avgViewsPerVideo = videos.length
    ? videos.reduce((s, p) => s + (p.metrics?.views ?? 0), 0) / videos.length : 0

  const avgLikesPerVideo = videos.length
    ? videos.reduce((s, p) => s + (p.metrics?.likes ?? 0), 0) / videos.length : 0

  // ER: gunakan stored ER dari snapshot jika ada, fallback ke kalkulasi manual
  const postsWithMetrics = posts.filter(p => p.metrics)
  const avgErAllPosts = (() => {
    if (!postsWithMetrics.length) return 0
    // Cek apakah ada stored ER dari snapshot
    const withStoredEr = postsWithMetrics.filter(p => p.metrics?.er != null)
    if (withStoredEr.length > 0) {
      return withStoredEr.reduce((s, p) => s + (p.metrics!.er ?? 0), 0) / withStoredEr.length
    }
    // Fallback: hitung manual jika punya followers
    if (!followersCount) return 0
    return postsWithMetrics.reduce((s, p) => {
      const l = p.metrics!.likes    ?? 0
      const c = p.metrics!.comments ?? 0
      return s + ((l * 2 + c * 5) / followersCount * 100)
    }, 0) / postsWithMetrics.length
  })()

  // Posting freq/week dari span tanggal
  let postingFreqPerWeek = 0
  if (posts.length >= 2) {
    const ts = posts.map(p => new Date(p.postedAt).getTime()).filter(Boolean).sort((a, b) => a - b)
    const weeks = (ts[ts.length - 1] - ts[0]) / 604_800_000
    postingFreqPerWeek = weeks > 0 ? posts.length / weeks : 0
  }

  return {
    followers:          followersCount,
    totalVideos:        videos.length,
    totalImages:        images.length,
    totalSidecars:      sidecars.length,
    avgViewsPerVideo:   Math.round(avgViewsPerVideo),
    avgLikesPerVideo:   Math.round(avgLikesPerVideo),
    avgErAllPosts:      parseFloat(avgErAllPosts.toFixed(2)),
    postingFreqPerWeek: parseFloat(postingFreqPerWeek.toFixed(1)),
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = {
  num: (n?: number | null) => {
    if (n == null || isNaN(n as number)) return "—"
    const x = n as number
    if (x >= 1_000_000) return `${(x / 1_000_000).toFixed(1)}M`
    if (x >= 1_000)     return `${(x / 1_000).toFixed(1)}K`
    return x.toLocaleString()
  },
  pct: (n?: number | null) => {
    if (n == null || isNaN(n as number)) return "—"
    return `${Number(n).toFixed(2)}%`
  },
  date: (d?: string | null) => {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
  },
  dateShort: (d?: string | null) => {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
  },
}

const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"]

// ── Micro Components ──────────────────────────────────────────────────────────

const ScoreBar = ({ value, max = 10, color = "#6366f1", label }: {
  value?: number; max?: number; color?: string; label?: string
}) => (
  <div className="flex items-center gap-2">
    {label && <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>}
    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, ((value ?? 0) / max) * 100)}%`, background: color }}
      />
    </div>
    <span className="text-xs font-mono font-semibold w-8 text-right">{value != null ? Number(value).toFixed(1) : "—"}</span>
  </div>
)

const TriggerBadge = ({ label, active }: { label: string; active: boolean }) => (
  <Badge
    variant={active ? "default" : "outline"}
    className={`text-[10px] px-2 py-0.5 gap-1 ${active ? "bg-primary/15 text-primary border-0" : "opacity-40"}`}
  >
    {active && <CheckCircle className="h-2.5 w-2.5" />}
    {label.replace(/([A-Z])/g, " $1").trim()}
  </Badge>
)

// ── KPI Cards ─────────────────────────────────────────────────────────────────

function KPICards({ account, kpi, loading }: {
  account?: Account; kpi?: ComputedKPI; loading: boolean
}) {
  const cards = [
    { label: "Total Videos",      value: kpi ? String(kpi.totalVideos) : "—",    icon: Video,      color: "text-amber-600",   bg: "bg-amber-500/10"   },
    { label: "Posts / Week",      value: kpi ? `${kpi.postingFreqPerWeek}×` : "—", icon: Calendar, color: "text-indigo-600",  bg: "bg-indigo-500/10"  },
    { label: "Avg ER (All Posts)", value: kpi ? fmt.pct(kpi.avgErAllPosts) : "—",  icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Avg Likes / Video", value: kpi ? fmt.num(kpi.avgLikesPerVideo) : "—", icon: Heart,   color: "text-rose-500",    bg: "bg-rose-500/10"    },
    { label: "Avg Views / Video", value: kpi ? fmt.num(kpi.avgViewsPerVideo) : "—", icon: Eye,     color: "text-sky-600",     bg: "bg-sky-500/10"     },
    { label: "Followers",         value: fmt.num(account?.followersCount),       icon: Users,      color: "text-violet-600",  bg: "bg-violet-500/10"  },
  ]

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
  )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <Card key={label} className="p-4 flex flex-col gap-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold mt-0.5 leading-none">{value}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ── Top Posts ─────────────────────────────────────────────────────────────────

function TopPosts({ posts, followersCount, loading }: {
  posts: Post[]; followersCount: number; loading: boolean
}) {
  const sorted = [...posts]
    .sort((a, b) => (b.metrics?.views ?? 0) - (a.metrics?.views ?? 0))
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>Top Posts</CardTitle><CardDescription>Sorted by video views</CardDescription></div>
        <Badge variant="outline">{posts.length} posts</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-5 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  {["#","Caption","Type","Views","Likes","Comments","ER","Date"].map(h => (
                    <th key={h} className={`text-xs font-medium text-muted-foreground py-2.5 ${["#","Caption"].includes(h)?"text-left px-5":"text-right px-3"} ${h==="Date"?"px-5":""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!sorted.length ? (
                  <tr><td colSpan={8} className="text-center py-10 text-xs text-muted-foreground">No posts yet — click "Fetch Post"</td></tr>
                ) : sorted.map((post, i) => {
                  const l = post.metrics?.likes    ?? 0
                  const c = post.metrics?.comments ?? 0
                  // Gunakan stored ER, fallback ke manual kalkulasi
                  const erVal = post.metrics?.er != null
                    ? post.metrics.er
                    : (followersCount > 0 ? (l*2+c*5)/followersCount*100 : null)
                  const er = erVal != null ? `${erVal.toFixed(2)}%` : "—"
                  return (
                    <tr key={post.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-2.5 text-xs text-muted-foreground font-mono">{i + 1}</td>
                      <td className="px-3 py-2.5 max-w-[160px]"><p className="truncate text-xs">{post.caption || "—"}</p></td>
                      <td className="px-3 py-2.5 text-right">
                        <Badge variant={post.type==="Video"?"default":post.type==="Image"?"secondary":"outline"} className="text-[10px]">
                          {post.type}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right text-xs font-medium">{fmt.num(post.metrics?.views)}</td>
                      <td className="px-3 py-2.5 text-right text-xs text-rose-500">{fmt.num(l)}</td>
                      <td className="px-3 py-2.5 text-right text-xs text-sky-500">{fmt.num(c)}</td>
                      <td className="px-3 py-2.5 text-right text-xs font-medium text-emerald-600">{er}</td>
                      <td className="px-5 py-2.5 text-right text-xs text-muted-foreground">{fmt.dateShort(post.postedAt)}</td>
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

// ── Content Distribution ──────────────────────────────────────────────────────

function ContentDistribution({ kpi, loading }: { kpi?: ComputedKPI; loading: boolean }) {
  const data = kpi ? [
    { name: "Video",   value: kpi.totalVideos,   color: "#6366f1" },
    { name: "Image",   value: kpi.totalImages,   color: "#f43f5e" },
    { name: "Sidecar", value: kpi.totalSidecars, color: "#10b981" },
  ].filter(d => d.value > 0) : []

  return (
    <Card>
      <CardHeader><CardTitle>Content Mix</CardTitle><CardDescription>Post type distribution</CardDescription></CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-44 rounded-lg" /> : !data.length ? (
          <div className="h-44 flex items-center justify-center text-xs text-muted-foreground">No data yet</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={0} dataKey="value">
                  {data.map((_, i) => <Cell key={i} fill={data[i].color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmt.num(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {data.map(d => {
                const total = data.reduce((s, x) => s + x.value, 0)
                return (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="text-xs font-medium">{fmt.num(d.value)} <span className="text-muted-foreground">({total > 0 ? ((d.value/total)*100).toFixed(0) : 0}%)</span></span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ── Engagement Chart ──────────────────────────────────────────────────────────
type MetricKey = "views" | "likes" | "comments" | "er"

const METRIC_CONFIG: Record<MetricKey, { label: string; color: string; axis: "l" | "r"; dash?: string }> = {
  views:    { label: "Views",    color: "#6366f1", axis: "l" },
  likes:    { label: "Likes",    color: "#f43f5e", axis: "l" },
  comments: { label: "Comments", color: "#10b981", axis: "l" },
  er:       { label: "ER (%)",   color: "#f59e0b", axis: "r", dash: "4 2" },
}

function EngagementChart({ posts, followersCount, loading }: {
  posts: Post[]; followersCount: number; loading: boolean
}) {
  const [activeMetrics, setActiveMetrics] = useState<Set<MetricKey>>(
    new Set(["views", "likes", "comments", "er"])
  )
  const [range, setRange] = useState<10 | 20 | 50>(20)

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        // Jangan hapus kalau hanya tersisa 1
        if (next.size === 1) return prev
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const data = [...posts]
    .filter(p => p.postedAt && p.metrics)
    .sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime())
    .slice(-range)
    .map(p => {
      const l = p.metrics!.likes    ?? 0
      const c = p.metrics!.comments ?? 0
      const er = p.metrics!.er != null
        ? p.metrics!.er
        : (followersCount > 0 ? parseFloat(((l*2+c*5)/followersCount*100).toFixed(2)) : 0)
      return { date: fmt.dateShort(p.postedAt), views: p.metrics!.views ?? 0, likes: l, comments: c, er }
    })

  // Apakah ada metric axis-r yang aktif?
  const hasRAxis = activeMetrics.has("er")
  // Apakah ada metric axis-l yang aktif?
  const hasLAxis = (["views", "likes", "comments"] as MetricKey[]).some(k => activeMetrics.has(k))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <CardTitle>Engagement Over Time</CardTitle>
            <CardDescription>Per-post trend</CardDescription>
          </div>
          {/* Range selector */}
          <div className="flex items-center gap-1 shrink-0">
            {([10, 20, 50] as const).map(n => (
              <button
                key={n}
                onClick={() => setRange(n)}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                  range === n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {n} posts
              </button>
            ))}
          </div>
        </div>

        {/* Metric toggle pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {(Object.entries(METRIC_CONFIG) as [MetricKey, typeof METRIC_CONFIG[MetricKey]][]).map(([key, cfg]) => {
            const active = activeMetrics.has(key)
            return (
              <button
                key={key}
                onClick={() => toggleMetric(key)}
                className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  active
                    ? "border-transparent text-white font-medium shadow-sm"
                    : "bg-transparent text-muted-foreground border-border opacity-50 hover:opacity-75"
                }`}
                style={active ? { background: cfg.color } : {}}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: active ? "rgba(255,255,255,0.8)" : cfg.color }}
                />
                {cfg.label}
              </button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <Skeleton className="h-56 rounded-lg" />
        ) : !data.length ? (
          <div className="h-56 flex items-center justify-center text-xs text-muted-foreground">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={data} margin={{ top: 4, right: hasRAxis ? 8 : 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              {hasLAxis && (
                <YAxis yAxisId="l" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => fmt.num(v)} />
              )}
              {hasRAxis && (
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              )}
              <Tooltip
                formatter={(v: number, n: string) => [
                  n === "ER (%)" ? `${Number(v).toFixed(2)}%` : fmt.num(v), n
                ]}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              {(Object.entries(METRIC_CONFIG) as [MetricKey, typeof METRIC_CONFIG[MetricKey]][]).map(([key, cfg]) =>
                activeMetrics.has(key) ? (
                  <Line
                    key={key}
                    yAxisId={cfg.axis}
                    type="monotone"
                    dataKey={key}
                    stroke={cfg.color}
                    strokeWidth={2}
                    dot={false}
                    name={cfg.label}
                    strokeDasharray={cfg.dash}
                    animationDuration={400}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ── Competitor Table ──────────────────────────────────────────────────────────

function CompetitorTables({ competitors, loading }: { competitors: Account[]; loading: boolean }) {
  return (
    <Card>
      <CardHeader><CardTitle>Competitor Accounts</CardTitle><CardDescription>Tracked competitor profiles</CardDescription></CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-5 space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left  text-xs font-medium text-muted-foreground px-5 py-2.5">Account</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-3 py-2.5">Followers</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-3 py-2.5">Posts</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {!competitors.length ? (
                  <tr><td colSpan={4} className="text-center py-8 text-xs text-muted-foreground">No competitor data</td></tr>
                ) : competitors.map(acc => (
                  <tr key={acc.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {acc.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-medium">@{acc.username}</p>
                          <p className="text-xs text-muted-foreground">{acc.fullName || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right text-xs font-medium">{fmt.num(acc.followersCount)}</td>
                    <td className="px-3 py-3 text-right text-xs">{acc.postCount ?? "—"}</td>
                    <td className="px-5 py-3 text-right">
                      <Badge variant={acc.isVerified ? "default" : "outline"} className="text-[10px]">
                        {acc.isVerified ? "✓ Verified" : "Active"}
                      </Badge>
                    </td>
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

// ── Competitor Chart ──────────────────────────────────────────────────────────

function CompetitorChart({ accounts, loading }: { accounts: Account[]; loading: boolean }) {
  const data = accounts.map(acc => ({
    name: `@${acc.username}`,
    followers: acc.followersCount || 0,
    isMain: acc.accountType === "main",
  }))
  return (
    <Card>
      <CardHeader><CardTitle>Follower Comparison</CardTitle><CardDescription>All tracked accounts</CardDescription></CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-52 rounded-lg" /> : !data.length ? (
          <div className="h-52 flex items-center justify-center text-xs text-muted-foreground">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => fmt.num(v)} />
              <Tooltip formatter={(v: number) => fmt.num(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="followers" name="Followers" radius={[4, 4, 0, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.isMain ? "#6366f1" : COLORS[(i + 1) % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ── Hashtag Table ─────────────────────────────────────────────────────────────

function HashtagTable({ posts, loading }: { posts: Post[]; loading: boolean }) {
  const map: Record<string, { tag: string; count: number; totalViews: number }> = {}
  posts.forEach(p => p.hashtags?.forEach(tag => {
    if (!map[tag]) map[tag] = { tag, count: 0, totalViews: 0 }
    map[tag].count++
    map[tag].totalViews += p.metrics?.views ?? 0
  }))
  const tags = Object.values(map).sort((a, b) => b.count - a.count).slice(0, 15)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>Top Hashtags</CardTitle><CardDescription>Most used across your posts</CardDescription></div>
        <Badge variant="outline">{tags.length} tags</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array(9).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : !tags.length ? (
          <div className="py-10 text-center text-xs text-muted-foreground">No hashtag data yet</div>
        ) : (
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {tags.map(t => (
              <div key={t.tag} className="rounded-lg border bg-muted/30 p-3 hover:bg-muted/60 transition-colors">
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs font-medium truncate text-primary">#{t.tag}</span>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">{t.count}×</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{fmt.num(t.totalViews)} views</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAILY AI ANALYSIS — 3 tabs dari resultJson Gemini
// ═══════════════════════════════════════════════════════════════════════════════

// Tab 1: Deep Analysis ─────────────────────────────────────────────────────────

function DeepAnalysisTab({ analyses, agg, loading }: {
  analyses: AiPost[]
  agg?: AnalysisResult["aggregateScores"]
  loading: boolean
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0)

  if (loading) return <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
  if (!analyses.length) return (
    <div className="py-10 text-center text-xs text-muted-foreground">
      No AI analysis yet — click "AI Analyze" to generate
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Aggregate Scores */}
      {agg && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Avg Hook",       value: agg.averageHookScore,           color: "#6366f1" },
            { label: "Avg Quality",    value: agg.averageProductionQuality,   color: "#f43f5e" },
            { label: "Avg Engagement", value: agg.averageEngagementPotential, color: "#10b981" },
            { label: "Avg Overall",    value: agg.averageOverallScore,        color: "#f59e0b" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg border p-3 space-y-2">
              <p className="text-xs text-muted-foreground">{label}</p>
              <ScoreBar value={value} color={color} />
            </div>
          ))}
        </div>
      )}

      {/* Radar Chart */}
      {agg && (
        <div className="rounded-lg border p-3">
          <p className="text-xs font-medium mb-1 text-muted-foreground">Score Overview</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={[
              { subject: "Hook",       A: agg.averageHookScore           },
              { subject: "Quality",    A: agg.averageProductionQuality   },
              { subject: "Engagement", A: agg.averageEngagementPotential },
              { subject: "Overall",    A: agg.averageOverallScore        },
            ]}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-post Accordion */}
      <p className="text-xs font-semibold text-muted-foreground">Per-Post Breakdown</p>
      {analyses.slice(0, 8).map((a, idx) => {
        const rj = a.resultJson
        return (
          <div key={a.postId} className="rounded-lg border overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left"
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            >
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-xs font-medium truncate">{a.caption || `Post ${idx + 1}`}</p>
                <p className="text-xs text-muted-foreground">{fmt.date(a.analyzedAt)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex gap-2.5">
                  {[
                    { l: "Hook",  v: a.hookScore,           c: "#6366f1" },
                    { l: "Prod",  v: a.productionQuality,   c: "#f43f5e" },
                    { l: "Eng",   v: a.engagementPotential, c: "#10b981" },
                    { l: "Score", v: a.overallScore,        c: "#f59e0b" },
                  ].map(({ l, v, c }) => (
                    <div key={l} className="text-center w-8">
                      <p className="text-xs font-bold" style={{ color: c }}>{v != null ? Number(v).toFixed(1) : "—"}</p>
                      <p className="text-[9px] text-muted-foreground">{l}</p>
                    </div>
                  ))}
                </div>
                {expandedIdx === idx
                  ? <ChevronUp  className="h-3.5 w-3.5 text-muted-foreground" />
                  : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                }
              </div>
            </button>

            {expandedIdx === idx && (
              <div className="px-4 pb-5 pt-3 border-t bg-muted/20 space-y-4">

                {/* Summary */}
                {rj?.summary && (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                    <p className="text-xs font-semibold mb-1 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Summary
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rj.summary}</p>
                  </div>
                )}

                {/* Overall Assessment */}
                {rj?.overallAssessment && (
                  <div>
                    <p className="text-xs font-semibold mb-2">Overall Assessment</p>
                    <div className="space-y-1.5">
                      {[
                        { label: "Overall Score",     value: rj.overallAssessment.overallScore,        color: "#f59e0b" },
                        { label: "Content Quality",   value: rj.overallAssessment.contentQuality,      color: "#6366f1" },
                        { label: "Audience Resonance",value: rj.overallAssessment.audienceResonance,   color: "#f43f5e" },
                        { label: "Virality Potential",value: rj.overallAssessment.viralityPotential,   color: "#10b981" },
                        { label: "Engagement Pot.",   value: rj.overallAssessment.engagementPotential, color: "#3b82f6" },
                        { label: "Brand Alignment",   value: rj.overallAssessment.brandAlignment,      color: "#8b5cf6" },
                      ].map(({ label, value, color }) => (
                        <ScoreBar key={label} label={label} value={value} color={color} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Hook Analysis */}
                {rj?.hookAnalysisDetailed && (
                  <div>
                    <p className="text-xs font-semibold mb-2">Hook Analysis</p>
                    <div className="space-y-2">
                      <ScoreBar label="Hook Score" value={rj.hookAnalysisDetailed.overallHookScore} color="#6366f1" />
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{rj.hookAnalysisDetailed.hookEffectiveness}</p>
                      {rj.hookAnalysisDetailed.improvementPotential && (
                        <div className="flex gap-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20 p-2.5">
                          <ArrowRight className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{rj.hookAnalysisDetailed.improvementPotential}</p>
                        </div>
                      )}
                      {rj.hookAnalysisDetailed.psychologicalTriggers && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">Psychological Triggers</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(rj.hookAnalysisDetailed.psychologicalTriggers).map(([k, v]) => (
                              <TriggerBadge key={k} label={k} active={!!v} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Retention Prediction */}
                {rj?.retentionPrediction && (
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs font-semibold mb-2">Retention Prediction</p>
                    <div className="space-y-1.5">
                      <ScoreBar label="Retention Score" value={rj.retentionPrediction.retentionScore} color="#10b981" />
                      <div className="grid grid-cols-1 gap-1 mt-1">
                        <p className="text-[11px]"><span className="text-muted-foreground">Hook:</span> {rj.retentionPrediction.hookEffectiveness}</p>
                        <p className="text-[11px]"><span className="text-muted-foreground">Mid-video:</span> {rj.retentionPrediction.midVideoEngagement}</p>
                        <p className="text-[11px]"><span className="text-muted-foreground">End:</span> {rj.retentionPrediction.endVideoCompletion}</p>
                        {rj.retentionPrediction.dropOffPoints && (
                          <p className="text-[11px]"><span className="text-muted-foreground">Drop-off:</span> {rj.retentionPrediction.dropOffPoints}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ER Correlation */}
                {rj?.erCorrelationAnalysis && (
                  <div>
                    <p className="text-xs font-semibold mb-2">ER Correlation</p>
                    <div className="grid grid-cols-4 gap-2 rounded-lg bg-muted/40 p-2.5 mb-2">
                      {[
                        { label: "Likes",    value: fmt.num(rj.erCorrelationAnalysis.likes)   },
                        { label: "Comments", value: fmt.num(rj.erCorrelationAnalysis.comments)},
                        { label: "Views",    value: fmt.num(rj.erCorrelationAnalysis.views)   },
                        { label: "ER",       value: `${(Number(rj.erCorrelationAnalysis.engagementRate) * 100).toFixed(3)}%` },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-center">
                          <p className="text-xs font-bold">{value}</p>
                          <p className="text-[10px] text-muted-foreground">{label}</p>
                        </div>
                      ))}
                    </div>
                    <ScoreBar label="ER Score" value={rj.erCorrelationAnalysis.erScore} color="#f59e0b" />
                    {rj.erCorrelationAnalysis.averageERFor100KAccount && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Benchmark 100K account: {(Number(rj.erCorrelationAnalysis.averageERFor100KAccount) * 100).toFixed(2)}%
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{rj.erCorrelationAnalysis.correlationAnalysis}</p>
                  </div>
                )}

                {/* Top Recommendations */}
                {rj?.top3ActionableRecommendations?.length && (
                  <div>
                    <p className="text-xs font-semibold mb-2">Top Recommendations</p>
                    <div className="space-y-2">
                      {rj.top3ActionableRecommendations.map((rec, ri) => (
                        <div key={ri} className="flex gap-2.5 rounded-lg border p-3">
                          <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {rec.priority}
                          </div>
                          <div>
                            <p className="text-xs font-medium leading-tight">
                              {typeof rec.recommendation === "string"
                                ? rec.recommendation.split(":")[0]
                                : ""}
                            </p>
                            {/* <p className="text-xs font-medium leading-tight">{rec.recommendation.split(":")[0]}</p> */}
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{rec.reasoning}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Tab 2: Video Analysis ────────────────────────────────────────────────────────

function VideoAnalysisTab({ analyses, loading }: { analyses: AiPost[]; loading: boolean }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  
  if (loading) return <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
  if (!analyses.length) return (
    <div className="py-10 text-center text-xs text-muted-foreground">No video analysis data yet</div>
  )

  const chartData = analyses.slice(0, 8).map((a, i) => {
    const rj = a.resultJson
    return {
      name:      `P${i + 1}`,
      hook:      a.hookScore,
      quality:   a.productionQuality,
      engagement: a.engagementPotential,
      overall:   a.overallScore,
      pacing:    rj?.pacingRhythm?.pacingScore ?? 0,
      editing:   rj?.specificEditingTechniques?.overallEditingScore ?? 0,
      sound:     rj?.soundDesignAnalysis?.soundDesignScore ?? 0,
    }
  })

  const selected = analyses[selectedIdx]
  const rj = selected?.resultJson

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="rounded-lg border p-3 bg-muted/20">
        <p className="text-xs font-medium mb-2 text-muted-foreground">Score Comparison</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="hook"     name="Hook"    fill="#6366f1" radius={[2,2,0,0]} />
            <Bar dataKey="pacing"   name="Pacing"  fill="#f43f5e" radius={[2,2,0,0]} />
            <Bar dataKey="editing"  name="Editing" fill="#10b981" radius={[2,2,0,0]} />
            <Bar dataKey="sound"    name="Sound"   fill="#f59e0b" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Post selector */}
      <div className="flex gap-2 flex-wrap">
        {analyses.slice(0, 8).map((a, i) => (
          <button
            key={a.postId}
            onClick={() => setSelectedIdx(i)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${selectedIdx === i ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted/50"}`}
          >
            P{i + 1} · {Number(a.overallScore ?? 0).toFixed(1)}
          </button>
        ))}
      </div>

      {selected && (
        <div className="space-y-3">
          {/* Caption + tier */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold">{selected.caption || `Post ${selectedIdx + 1}`}</p>
              <p className="text-xs text-muted-foreground">{fmt.date(selected.analyzedAt)}</p>
            </div>
            <Badge variant="outline" className={`text-[10px] shrink-0 ${
              (selected.overallScore ?? 0) >= 8.5 ? "bg-amber-400/15 text-amber-600 border-amber-400/30" :
              (selected.overallScore ?? 0) >= 7.5 ? "bg-primary/15 text-primary border-primary/20" :
              (selected.overallScore ?? 0) >= 6.5 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
              "bg-muted text-muted-foreground"
            }`}>
              {(selected.overallScore ?? 0) >= 8.5 ? "🏆 S-Tier" :
               (selected.overallScore ?? 0) >= 7.5 ? "A-Tier" :
               (selected.overallScore ?? 0) >= 6.5 ? "B-Tier" : "C-Tier"}
            </Badge>
          </div>

          {/* Pacing */}
          {rj?.pacingRhythm && (
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Film className="h-3.5 w-3.5 text-primary" /> Pacing & Rhythm</p>
              <ScoreBar label="Pacing Score" value={rj.pacingRhythm.pacingScore} color="#6366f1" />
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { l: "Overall",     v: rj.pacingRhythm.overallPacing         },
                  { l: "Energy",      v: rj.pacingRhythm.energyLevel            },
                  { l: "Viewer Imp.", v: rj.pacingRhythm.viewerEngagementImpact },
                ].map(({ l, v }) => (
                  <div key={l} className="text-center rounded bg-muted/50 px-2 py-1.5">
                    <p className="text-[10px] text-muted-foreground">{l}</p>
                    <p className="text-[11px] font-medium truncate">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Structure */}
          {rj?.videoStructureAnalysis && (
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-primary" /> Video Structure</p>
              {rj.videoStructureAnalysis.structureQuality && (
                <ScoreBar label="Structure Score" value={rj.videoStructureAnalysis.structureQuality.overallScore} color="#10b981" />
              )}
              <div className="space-y-1 mt-2">
                {rj.videoStructureAnalysis.introduction && (
                  <p className="text-[11px]"><span className="text-muted-foreground">Intro ({rj.videoStructureAnalysis.introduction.timeRange}):</span> {rj.videoStructureAnalysis.introduction.effectiveness}</p>
                )}
                {rj.videoStructureAnalysis.climax && (
                  <p className="text-[11px]"><span className="text-muted-foreground">Climax ({rj.videoStructureAnalysis.climax.timeRange}):</span> {rj.videoStructureAnalysis.climax.peakMoment}</p>
                )}
                {rj.videoStructureAnalysis.conclusion && (
                  <p className="text-[11px]"><span className="text-muted-foreground">CTA:</span> {rj.videoStructureAnalysis.conclusion.ctaType} — {rj.videoStructureAnalysis.conclusion.effectiveness}</p>
                )}
              </div>
            </div>
          )}

          {/* Editing Techniques */}
          {rj?.specificEditingTechniques && (
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Editing Techniques</p>
              <ScoreBar label="Editing Score" value={rj.specificEditingTechniques.overallEditingScore} color="#f43f5e" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                {rj.specificEditingTechniques.fastCuts && (
                  <div className="rounded bg-muted/40 p-2">
                    <p className="text-[10px] font-semibold mb-0.5">Fast Cuts</p>
                    <p className="text-[10px] text-muted-foreground">{rj.specificEditingTechniques.fastCuts.effectiveness}</p>
                  </div>
                )}
                {rj.specificEditingTechniques.colorGrading && (
                  <div className="rounded bg-muted/40 p-2">
                    <p className="text-[10px] font-semibold mb-0.5">Color Grading</p>
                    <p className="text-[10px] text-muted-foreground">{rj.specificEditingTechniques.colorGrading.style}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sound Design */}
          {rj?.soundDesignAnalysis && (
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Music className="h-3.5 w-3.5 text-primary" /> Sound Design</p>
              <ScoreBar label="Sound Score" value={rj.soundDesignAnalysis.soundDesignScore} color="#8b5cf6" />
              <div className="space-y-1 mt-2">
                {rj.soundDesignAnalysis.bgmSelection && (
                  <p className="text-[11px]"><span className="text-muted-foreground">BGM:</span> {rj.soundDesignAnalysis.bgmSelection.mood} — {rj.soundDesignAnalysis.bgmSelection.appropriateness}</p>
                )}
                {rj.soundDesignAnalysis.sfxUsage?.potentialImprovement && (
                  <div className="flex gap-1.5 mt-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{rj.soundDesignAnalysis.sfxUsage.potentialImprovement}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filming Method */}
          {rj?.filmingMethodDetails && (
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Camera className="h-3.5 w-3.5 text-primary" /> Production</p>
              {rj.filmingMethodDetails.overallProductionValue && (
                <ScoreBar label="Production Quality" value={rj.filmingMethodDetails.overallProductionValue.productionQualityScore} color="#3b82f6" />
              )}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {rj.filmingMethodDetails.lightingSetup && (
                  <div className="rounded bg-muted/40 p-2">
                    <p className="text-[10px] font-semibold mb-0.5">Lighting</p>
                    <ScoreBar value={rj.filmingMethodDetails.lightingSetup.lightingScore} max={10} color="#f59e0b" />
                    <p className="text-[10px] text-muted-foreground mt-1">{rj.filmingMethodDetails.lightingSetup.primaryLightSource}</p>
                  </div>
                )}
                {rj.filmingMethodDetails.stabilizationSupport && (
                  <div className="rounded bg-muted/40 p-2">
                    <p className="text-[10px] font-semibold mb-0.5">Stabilization</p>
                    <p className="text-[10px] text-muted-foreground">{rj.filmingMethodDetails.stabilizationSupport.stabilizationType}</p>
                    <p className="text-[10px] text-emerald-600">{rj.filmingMethodDetails.stabilizationSupport.stabilizationQuality}</p>
                  </div>
                )}
              </div>
              {rj.filmingMethodDetails.cameraEquipment && (
                <p className="text-[11px] text-muted-foreground mt-2">📷 {rj.filmingMethodDetails.cameraEquipment.cameraTypeEstimate}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Tab 3: Thumbnail / Visual Analysis ──────────────────────────────────────────

function ThumbnailAnalysisTab({ analyses, loading }: { analyses: AiPost[]; loading: boolean }) {
  const [selectedIdx, setSelectedIdx] = useState(0)

  if (loading) return <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
  if (!analyses.length) return (
    <div className="py-10 text-center text-xs text-muted-foreground">No analysis data yet</div>
  )

  const ranked = [...analyses].sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0))
  const selected = analyses[selectedIdx]
  const rj = selected?.resultJson

  return (
    <div className="space-y-4">
      {/* Rankings */}
      <div className="rounded-lg border p-4">
        <p className="text-xs font-semibold mb-3">Posts Ranked by Overall Score</p>
        <div className="space-y-2.5">
          {ranked.slice(0, 8).map((a, i) => (
            <div key={a.postId} className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                i === 0 ? "bg-amber-400 text-white" :
                i === 1 ? "bg-slate-300 text-slate-800" :
                i === 2 ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"
              }`}>{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate">{a.caption || `Post ${i + 1}`}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${((a.overallScore ?? 0)/10)*100}%`, background: "#6366f1" }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground w-8">{Number(a.overallScore ?? 0).toFixed(1)}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] shrink-0">
                {(a.overallScore ?? 0) >= 8.5 ? "S" : (a.overallScore ?? 0) >= 7.5 ? "A" : (a.overallScore ?? 0) >= 6.5 ? "B" : "C"}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Post selector for details */}
      <div className="flex gap-2 flex-wrap">
        {analyses.slice(0, 8).map((a, i) => (
          <button
            key={a.postId}
            onClick={() => setSelectedIdx(i)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${selectedIdx === i ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted/50"}`}
          >
            P{i + 1}
          </button>
        ))}
      </div>

      {selected && rj && (
        <div className="space-y-3">
          {/* Theme Identification */}
          {rj.themeIdentification && (
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-primary" /> Theme & Audience</p>
              <ScoreBar label="Theme Score" value={rj.themeIdentification.themeEffectivenessScore} color="#6366f1" />
              {rj.themeIdentification.primaryTheme && (
                <div className="mt-2">
                  <Badge variant="secondary" className="text-[10px] mb-1">{rj.themeIdentification.primaryTheme.category}</Badge>
                  <p className="text-[11px] text-muted-foreground">{rj.themeIdentification.primaryTheme.description}</p>
                </div>
              )}
              {rj.themeIdentification.targetAudience && (
                <div className="mt-2 rounded bg-muted/40 p-2">
                  <p className="text-[10px] font-semibold">Target Audience</p>
                  <p className="text-[11px] text-muted-foreground">{rj.themeIdentification.targetAudience.audienceType}</p>
                  <p className="text-[10px] text-emerald-600">Fit: {rj.themeIdentification.targetAudience.audienceFit}</p>
                </div>
              )}
              {rj.themeIdentification.uniqueAngle?.hasUniqueAngle && (
                <div className="flex gap-1.5 mt-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{rj.themeIdentification.uniqueAngle.differentiationFactor}</p>
                </div>
              )}
              {rj.themeIdentification.secondaryThemes?.length && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {rj.themeIdentification.secondaryThemes.map(st => (
                    <Badge key={st.theme} variant="outline" className="text-[9px]">{st.theme}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Visual Expression */}
          {rj.visualExpressionTechniques && (
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-primary" /> Visual Expression</p>
              <ScoreBar label="Visual Score" value={rj.visualExpressionTechniques.visualExpressionScore} color="#f43f5e" />
              <div className="space-y-1 mt-2">
                {rj.visualExpressionTechniques.colorPsychology && (
                  <p className="text-[11px]"><span className="text-muted-foreground">Color Mood:</span> {rj.visualExpressionTechniques.colorPsychology.colorMood}</p>
                )}
                {rj.visualExpressionTechniques.motionDynamicElements && (
                  <p className="text-[11px]"><span className="text-muted-foreground">Motion:</span> {rj.visualExpressionTechniques.motionDynamicElements.motionPurpose}</p>
                )}
                {rj.visualExpressionTechniques.visualStyleConsistency && (
                  <>
                    <ScoreBar label="Style Consistency" value={rj.visualExpressionTechniques.visualStyleConsistency.consistencyScore} color="#10b981" />
                    <p className="text-[11px] text-muted-foreground">{rj.visualExpressionTechniques.visualStyleConsistency.styleDescription}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Caption Overlay */}
          {rj.captionOverlayAnalysis && (
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold mb-2">Caption Overlay</p>
              <ScoreBar label="Caption Score" value={rj.captionOverlayAnalysis.captionOverlayScore} color="#f59e0b" />
              <div className="space-y-1 mt-2">
                {rj.captionOverlayAnalysis.readability && (
                  <p className="text-[11px]"><span className="text-muted-foreground">Readability:</span> {rj.captionOverlayAnalysis.readability.overallReadability}</p>
                )}
                {rj.captionOverlayAnalysis.callToAction && (
                  <p className="text-[11px]"><span className="text-muted-foreground">CTA:</span> {rj.captionOverlayAnalysis.callToAction.effectiveness}</p>
                )}
                {rj.captionOverlayAnalysis.contentRelevance && (
                  <p className="text-[11px] text-muted-foreground">{rj.captionOverlayAnalysis.contentRelevance.valueAdd}</p>
                )}
              </div>
            </div>
          )}

          {/* Competitive Gap */}
          {rj.competitiveGapAnalysis && (
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-primary" /> Competitive Analysis</p>
              <ScoreBar label="Competitive Gap" value={rj.competitiveGapAnalysis.competitiveGapScore} color="#8b5cf6" />

              {rj.competitiveGapAnalysis.differentiation?.uniqueSellingPoints?.length && (
                <div className="mt-2">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">Unique Selling Points</p>
                  <div className="space-y-1">
                    {rj.competitiveGapAnalysis.differentiation.uniqueSellingPoints.map((usp, i) => (
                      <div key={i} className="flex gap-1.5">
                        <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground">{usp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rj.competitiveGapAnalysis.opportunityAreas?.length && (
                <div className="mt-2">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">Opportunities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {rj.competitiveGapAnalysis.opportunityAreas.map((o, i) => (
                      <Badge key={i} variant="outline" className="text-[9px] bg-emerald-500/5 text-emerald-700 border-emerald-500/20">{o}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {rj.competitiveGapAnalysis.weaknessesAgainstCompetitors?.length && (
                <div className="mt-2">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">Weaknesses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {rj.competitiveGapAnalysis.weaknessesAgainstCompetitors.map((w, i) => (
                      <Badge key={i} variant="outline" className="text-[9px] bg-rose-500/5 text-rose-600 border-rose-500/20">{w}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Daily AI Analysis (wrapper) ───────────────────────────────────────────────

function DailyAIAnalysis({ result, loading, account }: {
  result?: AnalysisResult | null; loading: boolean
  account?: Account | null
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Daily AI Analysis</CardTitle>
              <CardDescription className="text-[11px]">
                {result?.account?.totalAnalyzed ?? 0} posts analyzed by Gemini AI
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-sm gap-1 px-2 py-0.5">
              {account?.username ? `@${account.username}` : "No account selected"}
            </Badge>
            <Badge variant="outline" className="text-sm gap-1 px-2 py-0.5">
              <Clock className="w-3 h-3" />
              {result?.analyses?.[0]?.analyzedAt ? fmt.date(result.analyses[0].analyzedAt) : "No data"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <Tabs defaultValue="deep" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-3">
            <TabsTrigger value="video"     className="text-xs gap-1.5"><Video      className="w-3.5 h-3.5" />Video Score</TabsTrigger>
            <TabsTrigger value="deep"      className="text-xs gap-1.5"><Search     className="w-3.5 h-3.5" />Video Analysis</TabsTrigger>
            <TabsTrigger value="thumbnail" className="text-xs gap-1.5"><ImageIcon  className="w-3.5 h-3.5" />Visual & Theme</TabsTrigger>
          </TabsList>
          <TabsContent value="deep">
            <DeepAnalysisTab analyses={result?.analyses ?? []} agg={result?.aggregateScores} loading={loading} />
          </TabsContent>
          <TabsContent value="video">
            <VideoAnalysisTab analyses={result?.analyses ?? []} loading={loading} />
          </TabsContent>
          <TabsContent value="thumbnail">
            <ThumbnailAnalysisTab analyses={result?.analyses ?? []} loading={loading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// ── Job Toast ─────────────────────────────────────────────────────────────────

function JobToast({ job, onDismiss }: { job?: Job | null; onDismiss: () => void }) {
  if (!job) return null
  const running = job.status === "running" || job.status === "pending"
  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-xl border bg-card shadow-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {running
            ? <RefreshCw className="h-4 w-4 text-primary animate-spin" />
            : job.status === "completed" ? <Award className="h-4 w-4 text-emerald-500" />
            : <X className="h-4 w-4 text-destructive" />
          }
          <p className="text-xs font-medium">
            {running ? "Job running…" : job.status === "completed" ? "Job completed" : "Job failed"}
          </p>
        </div>
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
      </div>
      {!running && (
        <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
          {(job.postsCreated   ?? 0) > 0 && <p>✓ {job.postsCreated} posts created</p>}
          {(job.postsUpdated   ?? 0) > 0 && <p>↻ {job.postsUpdated} posts updated</p>}
          {(job.mediaDownloaded ?? 0) > 0 && <p>↓ {job.mediaDownloaded} media files</p>}
          {job.errorMessage               && <p className="text-destructive">✗ {job.errorMessage}</p>}
        </div>
      )}
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────

export default function InstagramDashboardContent() {
  const [allAccounts, setAllAccounts] = useState<Account[]>([])
  const [selectedId,  setSelectedId]  = useState<string | null>(null)
  const [posts,       setPosts]       = useState<Post[]>([])
  const [analysis,    setAnalysis]    = useState<AnalysisResult | null>(null)
  const [activeJob,   setActiveJob]   = useState<Job | null>(null)
  const [kpi,         setKpi]         = useState<ComputedKPI | undefined>()

  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [loadingPosts,    setLoadingPosts]    = useState(false)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [fetchingJob,     setFetchingJob]     = useState(false)
  const [analyzingJob,    setAnalyzingJob]    = useState(false)

  const selectedAccount = allAccounts.find(a => a.id === selectedId)
  const competitors     = allAccounts.filter(a => a.accountType === "competitor")

  // Re-compute KPI setiap kali posts/account berubah
  useEffect(() => {
    if (selectedAccount && posts.length > 0) {
      setKpi(computeKPI(posts, selectedAccount.followersCount))
    } else {
      setKpi(undefined)
    }
  }, [posts, selectedAccount])

  const pollJob = useCallback((jobId: string) => {
    const tick = async () => {
      try {
        const job: Job = await api.getJobStatus(jobId)
        setActiveJob(job)
        if (job.status === "running" || job.status === "pending") setTimeout(tick, 3000)
        else loadAll()
      } catch (e) { console.error(e) }
    }
    tick()
  }, [])

  const loadAccountData = useCallback(async (id: string) => {
    setLoadingPosts(true); setLoadingAnalysis(true)
    try {
      const [pr, ar] = await Promise.allSettled([
        api.getAccountPosts(id, 100),
        api.getAccountAnalysis(id, 50),
      ])
      if (pr.status === "fulfilled" && pr.value.success) {
        // Normalize semua posts dari API response
        const rawPosts: RawPost[] = pr.value.posts ?? []
        setPosts(rawPosts.map(normalizePost))
      }
      if (ar.status === "fulfilled" && ar.value.success) {
        const raw = ar.value
        // Normalize: extract scores dari resultJson jika backend belum kirim sebagai top-level
        const toNum = (v: unknown) => parseFloat(String(v ?? 0)) || 0
        const normalizedAnalyses = (raw.analyses ?? []).map((a: any) => {
          const rj = a.resultJson
          // Semua score di-force ke number (resultJson bisa return string dari Gemini)
          return {
            ...a,
            hookScore:           toNum(a.hookScore           || rj?.hookAnalysisDetailed?.overallHookScore                               || rj?.overallAssessment?.overallScore),
            productionQuality:   toNum(a.productionQuality   || rj?.filmingMethodDetails?.overallProductionValue?.productionQualityScore || rj?.overallAssessment?.contentQuality),
            engagementPotential: toNum(a.engagementPotential || rj?.overallAssessment?.engagementPotential                               || rj?.erCorrelationAnalysis?.erScore),
            overallScore:        toNum(a.overallScore        || rj?.overallAssessment?.overallScore),
          }
        })
        setAnalysis({ ...raw, analyses: normalizedAnalyses })
      }
    } catch (e) { console.error(e) }
    finally { setLoadingPosts(false); setLoadingAnalysis(false) }
  }, [])

  const loadAll = useCallback(async () => {
    setLoadingAccounts(true)
    try {
      const res = await api.getAccounts()
      if (res.success && res.accounts) {
        const normalized = (res.accounts as Account[]).map(normalizeAccount)
        setAllAccounts(normalized)
        const main = normalized.find(a => a.accountType === "main")
        if (main) { setSelectedId(main.id); await loadAccountData(main.id) }
      }
    } catch (e) { console.error(e) }
    finally { setLoadingAccounts(false) }
  }, [loadAccountData])

  useEffect(() => { loadAll() }, [])
  useEffect(() => { if (selectedId) loadAccountData(selectedId) }, [selectedId])

  const handleFetchPost = async () => {
    if (fetchingJob) return; setFetchingJob(true)
    try {
      const r = await api.startScrape()
      if (r.success && r.jobId) { setActiveJob({ id: r.jobId, status: "running" }); pollJob(r.jobId) }
    } catch (e) { console.error(e) } finally { setFetchingJob(false) }
  }
  const [competitorPosts] = useState<Record<string, Post[]>>({})
  const competitorMetrics: CompetitorMetrics[] = competitors.map(acc => (
    computeCompetitorMetrics(acc, competitorPosts[acc.id] ?? [])
  ))
  const handleAIAnalyze = async () => {
    if (analyzingJob) return; setAnalyzingJob(true)
    try {
      const r = await api.startAiAnalysis()
      if (r.success && r.jobId) { setActiveJob({ id: r.jobId, status: "running" }); pollJob(r.jobId) }
    } catch (e) { console.error(e) } finally { setAnalyzingJob(false) }
  }
  // All posts by account for section 3
    const allPostsByAccount = allAccounts.map(acc => ({
      account: acc,
      posts:   acc.id === selectedId ? posts : (competitorPosts[acc.id] ?? []),
    }))
  const lastUpdated = selectedAccount?.followerHistory?.[0]?.recordedAt
    ? new Date(selectedAccount.followerHistory[0].recordedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
    : "—"

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          {/* Header */}
          <div className="px-4 lg:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">Dashboard</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Instagram Analytics · Last updated: {lastUpdated}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {allAccounts.length > 0 && (
                <select
                  className="h-8 rounded-lg border bg-background text-xs px-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={selectedId ?? ""}
                  onChange={e => setSelectedId(e.target.value)}
                >
                  {allAccounts.map(a => (
                    <option key={a.id} value={a.id}>@{a.username}{a.accountType === "main" ? " (mine)" : ""}</option>
                  ))}
                </select>
              )}
              {/* <Button variant="outline" size="sm" onClick={handleAIAnalyze} disabled={analyzingJob}>
                {analyzingJob ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                AI Analyze
              </Button>
              <Button variant="outline" size="sm" onClick={handleFetchPost} disabled={fetchingJob}>
                {fetchingJob ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Fetch Post
              </Button> */}
            </div>
          </div>

          {/* KPI */}
          <div className="px-4 lg:px-6">
            <h2 className="text-sm font-semibold mb-1">
              {selectedAccount ? `@${selectedAccount.username}` : "My Account"} Overview
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              {kpi
                ? `${posts.length} posts · ER dari PostMetricsSnapshot (engagementRate × 100)`
                : "Fetch posts untuk menghitung metrics"}
            </p>
            <KPICards account={selectedAccount} kpi={kpi} loading={loadingAccounts || loadingPosts} />
          </div>

          {/* Top Posts + Mix */}
          <div className="px-4 lg:px-6 grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TopPostsEmbed
                posts={posts}
                followersCount={selectedAccount?.followersCount ?? 0}
                username={selectedAccount?.username}
                loading={loadingPosts}
              />
            </div>
            <ContentDistribution kpi={kpi} loading={loadingPosts} />
          </div>

          {/* Engagement Chart */}
          {/* <div className="px-4 lg:px-6">
            <EngagementChart posts={posts} followersCount={selectedAccount?.followersCount ?? 0} loading={loadingPosts} />
          </div> */}

          {/* Daily AI Analysis */}
          <div className="px-4 lg:px-6">
            <DailyAIAnalysis result={analysis} loading={loadingAnalysis} account={selectedAccount} />
          </div>

          <div className="px-4 lg:px-6 grid lg:grid-cols-2 gap-4">
              <ERTrendChart
                posts={posts}
                followersCount={selectedAccount?.followersCount ?? 0}
                loading={loadingPosts}
              />
              <PerformanceChart
                posts={posts}
                loading={loadingPosts}
              />
            </div>
            
            {/* ════════════════════════════════════════════════════════════════
                SECTION 2: COMPETITOR OVERVIEW
            ════════════════════════════════════════════════════════════════ */}
            <section className="px-4 lg:px-6 space-y-5">
              <SectionHeader
                title="Competitor Overview"
                description={`${competitors.length} competitor accounts tracked`}
                badge={competitors.length ? `${competitors.length} accounts` : undefined}
                accent="#f43f5e"
              />
  
              {/* Row 1: Competitor Table + ER Comparison */}
              <div className="grid lg:grid-cols-2 gap-4">
                <CompetitorTable
                  competitors={competitorMetrics}
                  loading={loadingAccounts}
                />
                <ERComparison
                  competitors={competitorMetrics}
                  loading={loadingAccounts}
                />
              </div>
  
              {/* Row 2: Performance Bar (3) + Location/Hashtags (2) */}
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-5 lg:col-span-3">
                  <PerformanceBar
                    competitors={competitorMetrics}
                    loading={loadingAccounts}
                  />
                </div>
                <div className="col-span-5 lg:col-span-2">
                  <LocationHashtags
                    competitors={competitorMetrics}
                    loading={loadingAccounts}
                  />
                </div>
              </div>
            </section>
  
            {/* ════════════════════════════════════════════════════════════════
                SECTION 3: INSTAGRAM COMPETITOR ANALYSIS
            ════════════════════════════════════════════════════════════════ */}
            <section className="px-4 lg:px-6 space-y-5">
              <SectionHeader
                title="Instagram Competitor Analysis"
                description="Cross-account content intelligence · trends & gaps"
                badge="All accounts"
                accent="#10b981"
              />
  
              {/* Row 1: Top Posts Table (15 days) + Top 3 by ER */}
              <div className="grid lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                  <TopPostsTable
                    allPostsByAccount={allPostsByAccount}
                    loading={loadingAccounts || loadingPosts}
                  />
                </div>
                <div className="lg:col-span-2">
                  <Top3ERGrid
                    allPostsByAccount={allPostsByAccount}
                    loading={loadingAccounts || loadingPosts}
                  />
                </div>
              </div>
  
              {/* Row 2: Content Distribution + Account Metrics */}
              <div className="grid md:grid-cols-2 gap-4">
                <ContentDistributionComparison
                  allPostsByAccount={allPostsByAccount}
                  loading={loadingAccounts || loadingPosts}
                />
                <AccountMetrics
                  allPostsByAccount={allPostsByAccount}
                  loading={loadingAccounts || loadingPosts}
                />
              </div>
            </section>

          {/* Competitors */}
          {/* <div className="px-4 lg:px-6">
            <h2 className="text-sm font-semibold mb-1">Competitor Overview</h2>
            <p className="text-xs text-muted-foreground mb-3">Performance comparison of all tracked accounts</p>
            <div className="grid lg:grid-cols-2 gap-4">
              <CompetitorTable competitors={competitors} loading={loadingAccounts} />
              <CompetitorChart accounts={allAccounts} loading={loadingAccounts} />
            </div>
          </div> */}

          {/* Hashtags */}
          {/* <div className="px-4 lg:px-6">
            <HashtagTable posts={posts} loading={loadingPosts} />
          </div> */}

          {/* Empty state */}
          {/* {!loadingAccounts && !allAccounts.length && (
            <div className="px-4 lg:px-6">
              <Card className="p-8 text-center border-dashed">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">No data yet</h3>
                    <p className="text-xs text-muted-foreground mt-1">Click "Fetch Post" to start scraping</p>
                  </div>
                  <Button size="sm" onClick={handleFetchPost} disabled={fetchingJob}>
                    {fetchingJob ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    Start Fetching
                  </Button>
                </div>
              </Card>
            </div>
          )} */}

        </div>
      </div>
      <JobToast job={activeJob} onDismiss={() => setActiveJob(null)} />
    </div>
  )
}