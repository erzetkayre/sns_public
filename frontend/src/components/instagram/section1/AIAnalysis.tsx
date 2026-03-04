// ─────────────────────────────────────────────────────────────────────────────
// section1/AIAnalysis.tsx  — v2 (overflow-safe rewrite)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, type ReactNode } from "react"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Search, Video, Image as ImageIcon, ChevronDown, ChevronUp,
  Sparkles, ArrowRight, CheckCircle, Clock, AlertTriangle,
  Zap, Film, Music, Camera, Layers, Target, Award, Eye,
  Lightbulb, TrendingUp, Rocket, Star, ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScoreBar, TriggerBadge } from "@/components/instagram/shared/ui-primitives"
import {
  fmt, toNum, scoreColor, SCORE_COLORS, PRIORITY_CONFIG, getInstagramUrl,
} from "@/components/instagram/shared/utils"
import type { AnalysisResult, AiPost, Post } from "@/components/instagram/shared/types"

// ── tiny helpers ──────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: number }) {
  const cfg = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG[3]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${cfg.bg} ${cfg.text}`}>
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

function ScoreBadge({ score, label }: { score: number; label?: string }) {
  const sc = scoreColor(score)
  const cfg = SCORE_COLORS[sc]
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg border shrink-0 font-bold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {toNum(score).toFixed(1)}{label && <span className="font-normal opacity-70 text-[10px]">{label}</span>}
    </span>
  )
}

// Section header inside cards
function SLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold mb-2">{children}</p>
}

// ── Next Action Card ──────────────────────────────────────────────────────────

function NextActionCard({ rec }: { rec: { priority: number; recommendation: string; reasoning: string } }) {
  const cfg = PRIORITY_CONFIG[rec.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG[3]
  const Icon = rec.priority === 1 ? Rocket : rec.priority === 2 ? Zap : Lightbulb
  return (
    <div className="rounded-xl border p-3 min-w-0" style={{ borderColor: cfg.dot + "40", background: cfg.dot + "08" }}>
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: cfg.dot + "20" }}>
          <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: cfg.dot }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <PriorityBadge priority={rec.priority} />
          </div>
          <p className="text-xs font-semibold leading-tight mb-1 break-words">{rec.recommendation.split(":")[0]}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed break-words">{rec.reasoning}</p>
        </div>
      </div>
    </div>
  )
}

// ── Account-level Next Actions ────────────────────────────────────────────────

function NextContentActions({ analyses }: { analyses: AiPost[] }) {
  const allRecs = analyses.flatMap(a => a.resultJson?.top3ActionableRecommendations ?? [])
  const byPriority: Record<number, string[]> = { 1: [], 2: [], 3: [] }
  allRecs.forEach(rec => {
    if (!rec?.recommendation) return
    const k = Math.min(3, Math.max(1, parseInt(String(rec.priority ?? 3), 10) || 3))
    const short = rec.recommendation.split(":")[0]
    if (!byPriority[k]) byPriority[k] = []
    if (!byPriority[k].some(r => r.toLowerCase().slice(0, 20) === short.toLowerCase().slice(0, 20)))
      byPriority[k].push(short)
  })
  if (!Object.values(byPriority).some(v => v.length)) return null
  return (
    <div className="rounded-xl border p-4 bg-primary/5 min-w-0">
      <p className="text-sm font-bold mb-0.5 flex items-center gap-2">
        <Rocket className="h-4 w-4 text-primary shrink-0" /> Suggested Next Content Actions
      </p>
      <p className="text-xs text-muted-foreground mb-3">Based on {analyses.length} analyzed posts</p>
      <div className="space-y-2">
        {([1, 2, 3] as const).map(p => {
          if (!byPriority[p]?.length) return null
          const cfg = PRIORITY_CONFIG[p]
          const Icon = p === 1 ? Rocket : p === 2 ? Zap : Lightbulb
          return (
            <div key={p} className="rounded-lg p-3 min-w-0" style={{ background: cfg.dot + "10" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: cfg.dot }} />
                <span className={`text-[11px] font-bold ${cfg.text}`}>{cfg.label}</span>
              </div>
              <ul className="space-y-1">
                {byPriority[p].slice(0, 3).map((rec, i) => (
                  <li key={i} className="flex gap-2 text-[11px] text-muted-foreground min-w-0">
                    <ArrowRight className="h-3 w-3 shrink-0 mt-0.5" style={{ color: cfg.dot }} />
                    <span className="break-words min-w-0">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 1 — Deep Analysis
// ═════════════════════════════════════════════════════════════════════════════

function DeepAnalysisTab({ analyses, agg, posts, loading }: {
  analyses: AiPost[]
  agg?: AnalysisResult["aggregateScores"]
  posts: Post[]
  loading: boolean
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0)

  if (loading) return <div className="space-y-2">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
  if (!analyses.length) return <div className="py-10 text-center text-xs text-muted-foreground">No AI analysis yet — click "AI Analyze"</div>

  return (
    <div className="space-y-4 min-w-0">

      {/* Aggregate score cards */}
      {agg && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Avg Hook",       value: agg.averageHookScore,           color: "#6366f1" },
            { label: "Avg Quality",    value: agg.averageProductionQuality,   color: "#f43f5e" },
            { label: "Avg Engagement", value: agg.averageEngagementPotential, color: "#10b981" },
            { label: "Avg Overall",    value: agg.averageOverallScore,        color: "#f59e0b" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg border p-2.5 space-y-1.5 min-w-0">
              <p className="text-[10px] text-muted-foreground truncate">{label}</p>
              <ScoreBar value={value} color={color} showColorScale />
            </div>
          ))}
        </div>
      )}

      {/* Radar chart */}
      {agg && (
        <div className="rounded-lg border p-3 bg-muted/20 min-w-0">
          <p className="text-xs font-semibold mb-2 text-muted-foreground">Score Overview</p>
          <div className="w-full" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { subject: "Hook",    A: agg.averageHookScore           },
                { subject: "Quality", A: agg.averageProductionQuality   },
                { subject: "Engage",  A: agg.averageEngagementPotential },
                { subject: "Overall", A: agg.averageOverallScore        },
              ]}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-post accordion */}
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Per-Post Breakdown</p>
      {analyses.slice(0, 10).map((a, idx) => {
        const rj  = a.resultJson
        const url = getInstagramUrl(posts.find(p => p.id === a.postId) ?? {} as Post)
        return (
          <div key={a.postId} className="rounded-xl border overflow-hidden min-w-0">

            {/* Accordion header */}
            <button
              className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/30 transition-colors text-left min-w-0"
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-xs font-medium truncate">{a.caption || `Post ${idx + 1}`}</p>
                  {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer"
                       onClick={e => e.stopPropagation()}
                       className="shrink-0 opacity-40 hover:opacity-100">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">{fmt.date(a.analyzedAt)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <ScoreBadge score={toNum(a.overallScore)} />
                {expandedIdx === idx
                  ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              </div>
            </button>

            {/* Expanded body */}
            {expandedIdx === idx && rj && (
              <div className="px-3 pb-4 pt-3 border-t bg-muted/10 space-y-3 min-w-0">

                {/* Mini score pills */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { l: "Hook", v: a.hookScore, c: "#6366f1" },
                    { l: "Prod", v: a.productionQuality, c: "#f43f5e" },
                    { l: "Eng",  v: a.engagementPotential, c: "#10b981" },
                  ].map(({ l, v, c }) => (
                    <div key={l} className="rounded-lg px-2.5 py-1.5 text-center" style={{ background: c + "15" }}>
                      <p className="text-xs font-bold" style={{ color: c }}>{toNum(v).toFixed(1)}</p>
                      <p className="text-[9px] text-muted-foreground">{l}</p>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                {rj.summary && (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 min-w-0">
                    <p className="text-xs font-semibold mb-1 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" /> Summary
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed break-words">{rj.summary}</p>
                  </div>
                )}

                {/* Overall scores */}
                {rj.overallAssessment && (
                  <div className="min-w-0">
                    <SLabel>Overall Assessment</SLabel>
                    <div className="space-y-1.5">
                      {[
                        { label: "Overall",    value: rj.overallAssessment.overallScore,        color: "#f59e0b" },
                        { label: "Quality",    value: rj.overallAssessment.contentQuality,      color: "#6366f1" },
                        { label: "Resonance",  value: rj.overallAssessment.audienceResonance,   color: "#f43f5e" },
                        { label: "Virality",   value: rj.overallAssessment.viralityPotential,   color: "#10b981" },
                        { label: "Engagement", value: rj.overallAssessment.engagementPotential, color: "#3b82f6" },
                        { label: "Brand",      value: rj.overallAssessment.brandAlignment,      color: "#8b5cf6" },
                      ].map(({ label, value, color }) => (
                        <ScoreBar key={label} label={label} value={toNum(value)} color={color} showColorScale />
                      ))}
                    </div>
                    {rj.overallAssessment.analysis && (
                      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed break-words">{rj.overallAssessment.analysis}</p>
                    )}
                  </div>
                )}

                {/* Hook */}
                {rj.hookAnalysisDetailed && (
                  <div className="rounded-lg border p-3 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <p className="text-xs font-semibold flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" /> Hook Analysis
                      </p>
                      <ScoreBadge score={toNum(rj.hookAnalysisDetailed.overallHookScore)} label="/10" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-2 break-words">{rj.hookAnalysisDetailed.hookEffectiveness}</p>
                    {rj.hookAnalysisDetailed.improvementPotential && (
                      <div className="flex gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-2.5 min-w-0">
                        <ArrowRight className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground leading-relaxed break-words">{rj.hookAnalysisDetailed.improvementPotential}</p>
                      </div>
                    )}
                    {rj.hookAnalysisDetailed.psychologicalTriggers && (
                      <div className="mt-2 min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">Psychological Triggers</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(rj.hookAnalysisDetailed.psychologicalTriggers).map(([k, v]) => (
                            <TriggerBadge key={k} label={k} active={!!v} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Retention */}
                {rj.retentionPrediction && (
                  <div className="rounded-lg bg-muted/40 p-3 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <p className="text-xs font-semibold flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" /> Retention
                      </p>
                      <ScoreBadge score={toNum(rj.retentionPrediction.retentionScore)} label="/10" />
                    </div>
                    <div className="space-y-0.5 text-[11px]">
                      <p><span className="text-muted-foreground">Hook (0-3s): </span>{rj.retentionPrediction.hookEffectiveness}</p>
                      <p><span className="text-muted-foreground">Mid-video: </span>{rj.retentionPrediction.midVideoEngagement}</p>
                      <p><span className="text-muted-foreground">End: </span>{rj.retentionPrediction.endVideoCompletion}</p>
                      {rj.retentionPrediction.dropOffPoints && (
                        <p className="text-amber-600"><span className="text-muted-foreground">Drop-off: </span>{rj.retentionPrediction.dropOffPoints}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ER Correlation */}
                {rj.erCorrelationAnalysis && (
                  <div className="min-w-0">
                    <SLabel>ER Correlation</SLabel>
                    <div className="grid grid-cols-4 gap-1.5 rounded-lg bg-muted/40 p-2.5 mb-2">
                      {[
                        { l: "Views",    v: fmt.num(rj.erCorrelationAnalysis.views)    },
                        { l: "Likes",    v: fmt.num(rj.erCorrelationAnalysis.likes)    },
                        { l: "Comments", v: fmt.num(rj.erCorrelationAnalysis.comments) },
                        { l: "ER",       v: `${(toNum(rj.erCorrelationAnalysis.engagementRate) * 100).toFixed(3)}%` },
                      ].map(({ l, v }) => (
                        <div key={l} className="text-center">
                          <p className="text-xs font-bold truncate">{v}</p>
                          <p className="text-[9px] text-muted-foreground">{l}</p>
                        </div>
                      ))}
                    </div>
                    <ScoreBar label="ER Score" value={toNum(rj.erCorrelationAnalysis.erScore)} color="#f59e0b" showColorScale />
                    {rj.erCorrelationAnalysis.averageERFor100KAccount && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Benchmark 100K: {(toNum(rj.erCorrelationAnalysis.averageERFor100KAccount) * 100).toFixed(2)}%
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed break-words">{rj.erCorrelationAnalysis.correlationAnalysis}</p>
                  </div>
                )}

                {/* Recommendations */}
                {rj.top3ActionableRecommendations?.length && (
                  <div className="min-w-0">
                    <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <Rocket className="h-3.5 w-3.5 text-primary shrink-0" /> Next Actions
                    </p>
                    <div className="space-y-2">
                      {rj.top3ActionableRecommendations.map(rec => (
                        <NextActionCard key={rec.priority} rec={rec} />
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

// ═════════════════════════════════════════════════════════════════════════════
// TAB 2 — Video Analysis
// ═════════════════════════════════════════════════════════════════════════════

function VideoAnalysisTab({ analyses, loading }: { analyses: AiPost[]; loading: boolean }) {
  const [idx, setIdx] = useState(0)

  if (loading) return <div className="space-y-2">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
  if (!analyses.length) return <div className="py-10 text-center text-xs text-muted-foreground">No video analysis data yet</div>

  const chartData = analyses.slice(0, 8).map((a, i) => ({
    name:    `P${i + 1}`,
    hook:    toNum(a.hookScore),
    pacing:  toNum(a.resultJson?.pacingRhythm?.pacingScore),
    editing: toNum(a.resultJson?.specificEditingTechniques?.overallEditingScore),
    sound:   toNum(a.resultJson?.soundDesignAnalysis?.soundDesignScore),
  }))

  const sel = analyses[idx]
  const rj  = sel?.resultJson

  return (
    <div className="space-y-4 min-w-0">

      {/* Bar chart comparison */}
      <div className="rounded-lg border p-3 bg-muted/20 min-w-0">
        <p className="text-xs font-semibold mb-2 text-muted-foreground">Video Scores Comparison</p>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 2, right: 2, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="hook"    name="Hook"    fill="#6366f1" radius={[2,2,0,0]} />
              <Bar dataKey="pacing"  name="Pacing"  fill="#f43f5e" radius={[2,2,0,0]} />
              <Bar dataKey="editing" name="Editing" fill="#10b981" radius={[2,2,0,0]} />
              <Bar dataKey="sound"   name="Sound"   fill="#f59e0b" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Post selector */}
      <div className="flex gap-1.5 flex-wrap min-w-0">
        {analyses.slice(0, 8).map((a, i) => {
          const sc = scoreColor(toNum(a.overallScore))
          return (
            <button key={a.postId} onClick={() => setIdx(i)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors shrink-0 ${
                idx === i ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted/50"
              }`}>
              P{i + 1}
              <span className={`ml-1 text-[10px] font-bold ${idx === i ? "text-white/80" : SCORE_COLORS[sc].text}`}>
                {toNum(a.overallScore).toFixed(1)}
              </span>
            </button>
          )
        })}
      </div>

      {sel && (
        <div className="space-y-3 min-w-0">
          {/* Post header */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{sel.caption || `Post ${idx + 1}`}</p>
              <p className="text-[10px] text-muted-foreground">{fmt.date(sel.analyzedAt)}</p>
            </div>
            <Badge variant="outline" className={`text-[10px] shrink-0 ${
              toNum(sel.overallScore) >= 8.5 ? "bg-amber-400/15 text-amber-600 border-amber-400/30" :
              toNum(sel.overallScore) >= 7.5 ? "bg-primary/15 text-primary border-primary/20" :
              toNum(sel.overallScore) >= 6.5 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
              "bg-muted text-muted-foreground"
            }`}>
              {toNum(sel.overallScore) >= 8.5 ? "🏆 S-Tier" :
               toNum(sel.overallScore) >= 7.5 ? "A-Tier" :
               toNum(sel.overallScore) >= 6.5 ? "B-Tier" : "C-Tier"}
            </Badge>
          </div>

          {/* Pacing */}
          {rj?.pacingRhythm && (
            <div className="rounded-lg border p-3 min-w-0">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Film className="h-3.5 w-3.5 text-primary shrink-0" /> Pacing & Rhythm</p>
              <ScoreBar value={toNum(rj.pacingRhythm.pacingScore)} label="Score" showColorScale />
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {[
                  { l: "Pacing",  v: rj.pacingRhythm.overallPacing },
                  { l: "Energy",  v: rj.pacingRhythm.energyLevel },
                  { l: "Impact",  v: rj.pacingRhythm.viewerEngagementImpact },
                ].map(({ l, v }) => (
                  <div key={l} className="rounded bg-muted/50 px-2 py-1.5 text-center min-w-0">
                    <p className="text-[9px] text-muted-foreground">{l}</p>
                    <p className="text-[10px] font-medium truncate">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video structure */}
          {rj?.videoStructureAnalysis && (
            <div className="rounded-lg border p-3 min-w-0">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-primary shrink-0" /> Video Structure</p>
              {rj.videoStructureAnalysis.structureQuality && (
                <ScoreBar label="Structure" value={toNum(rj.videoStructureAnalysis.structureQuality.overallScore)} showColorScale />
              )}
              <div className="space-y-0.5 mt-2 text-[11px] break-words">
                {rj.videoStructureAnalysis.introduction && (
                  <p><span className="text-muted-foreground">Intro ({rj.videoStructureAnalysis.introduction.timeRange}): </span>{rj.videoStructureAnalysis.introduction.effectiveness}</p>
                )}
                {rj.videoStructureAnalysis.climax && (
                  <p><span className="text-muted-foreground">Climax ({rj.videoStructureAnalysis.climax.timeRange}): </span>{rj.videoStructureAnalysis.climax.peakMoment}</p>
                )}
                {rj.videoStructureAnalysis.conclusion && (
                  <p><span className="text-muted-foreground">CTA: </span>{rj.videoStructureAnalysis.conclusion.ctaType} — {rj.videoStructureAnalysis.conclusion.effectiveness}</p>
                )}
              </div>
            </div>
          )}

          {/* Editing */}
          {rj?.specificEditingTechniques && (
            <div className="rounded-lg border p-3 min-w-0">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary shrink-0" /> Editing</p>
              <ScoreBar label="Score" value={toNum(rj.specificEditingTechniques.overallEditingScore)} showColorScale />
              <div className="grid grid-cols-2 gap-2 mt-2">
                {rj.specificEditingTechniques.fastCuts && (
                  <div className="rounded bg-muted/40 p-2 min-w-0">
                    <p className="text-[10px] font-semibold mb-0.5">Fast Cuts</p>
                    <p className="text-[10px] text-muted-foreground break-words">{rj.specificEditingTechniques.fastCuts.effectiveness}</p>
                  </div>
                )}
                {rj.specificEditingTechniques.colorGrading && (
                  <div className="rounded bg-muted/40 p-2 min-w-0">
                    <p className="text-[10px] font-semibold mb-0.5">Color Grade</p>
                    <p className="text-[10px] text-muted-foreground break-words">{rj.specificEditingTechniques.colorGrading.style}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sound */}
          {rj?.soundDesignAnalysis && (
            <div className="rounded-lg border p-3 min-w-0">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Music className="h-3.5 w-3.5 text-primary shrink-0" /> Sound Design</p>
              <ScoreBar label="Score" value={toNum(rj.soundDesignAnalysis.soundDesignScore)} showColorScale />
              <div className="space-y-0.5 mt-2 text-[11px]">
                {rj.soundDesignAnalysis.bgmSelection && (
                  <p><span className="text-muted-foreground">BGM: </span>{rj.soundDesignAnalysis.bgmSelection.mood} — {rj.soundDesignAnalysis.bgmSelection.appropriateness}</p>
                )}
                {rj.soundDesignAnalysis.sfxUsage?.potentialImprovement && (
                  <div className="flex gap-1.5 mt-1 min-w-0">
                    <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground break-words">{rj.soundDesignAnalysis.sfxUsage.potentialImprovement}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Production */}
          {rj?.filmingMethodDetails && (
            <div className="rounded-lg border p-3 min-w-0">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Camera className="h-3.5 w-3.5 text-primary shrink-0" /> Production</p>
              {rj.filmingMethodDetails.overallProductionValue && (
                <ScoreBar label="Quality" value={toNum(rj.filmingMethodDetails.overallProductionValue.productionQualityScore)} showColorScale />
              )}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {rj.filmingMethodDetails.lightingSetup && (
                  <div className="rounded bg-muted/40 p-2 min-w-0">
                    <p className="text-[10px] font-semibold mb-0.5">Lighting</p>
                    <ScoreBar value={toNum(rj.filmingMethodDetails.lightingSetup.lightingScore)} showColorScale />
                    <p className="text-[10px] text-muted-foreground mt-0.5 break-words">{rj.filmingMethodDetails.lightingSetup.primaryLightSource}</p>
                  </div>
                )}
                {rj.filmingMethodDetails.stabilizationSupport && (
                  <div className="rounded bg-muted/40 p-2 min-w-0">
                    <p className="text-[10px] font-semibold mb-0.5">Stabilization</p>
                    <p className="text-[10px] text-muted-foreground break-words">{rj.filmingMethodDetails.stabilizationSupport.stabilizationType}</p>
                    <p className="text-[10px] text-emerald-600">{rj.filmingMethodDetails.stabilizationSupport.stabilizationQuality}</p>
                  </div>
                )}
              </div>
              {rj.filmingMethodDetails.cameraEquipment && (
                <p className="text-[11px] text-muted-foreground mt-2 break-words">📷 {rj.filmingMethodDetails.cameraEquipment.cameraTypeEstimate}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 3 — Visual & Theme
// ═════════════════════════════════════════════════════════════════════════════

function VisualThemeTab({ analyses, loading }: { analyses: AiPost[]; loading: boolean }) {
  const [idx, setIdx] = useState(0)

  if (loading) return <div className="space-y-2">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
  if (!analyses.length) return <div className="py-10 text-center text-xs text-muted-foreground">No analysis data yet</div>

  const ranked = [...analyses].sort((a, b) => toNum(b.overallScore) - toNum(a.overallScore))
  const sel = analyses[idx]
  const rj  = sel?.resultJson

  return (
    <div className="space-y-4 min-w-0">

      {/* Ranking list */}
      <div className="rounded-xl border p-3 min-w-0">
        <p className="text-xs font-semibold mb-2.5">Ranked by Overall Score</p>
        <div className="space-y-2">
          {ranked.slice(0, 8).map((a, i) => {
            const sc = scoreColor(toNum(a.overallScore))
            return (
              <div key={a.postId} className="flex items-center gap-2.5 min-w-0">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                  i === 0 ? "bg-amber-400 text-white" :
                  i === 1 ? "bg-slate-300 text-slate-800" :
                  i === 2 ? "bg-amber-600/80 text-white" : "bg-muted text-muted-foreground"
                }`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] truncate">{a.caption || `Post ${i + 1}`}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(toNum(a.overallScore)/10)*100}%`, background: SCORE_COLORS[sc].bar }} />
                    </div>
                    <span className={`text-[10px] font-mono w-7 text-right shrink-0 ${SCORE_COLORS[sc].text}`}>{toNum(a.overallScore).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Post selector */}
      <div className="flex gap-1.5 flex-wrap min-w-0">
        {analyses.slice(0, 8).map((a, i) => (
          <button key={a.postId} onClick={() => setIdx(i)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors shrink-0 ${
              idx === i ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted/50"
            }`}>
            P{i + 1}
          </button>
        ))}
      </div>

      {sel && rj && (
        <div className="space-y-3 min-w-0">

          {/* Theme */}
          {rj.themeIdentification && (
            <div className="rounded-lg border p-3 min-w-0">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-primary shrink-0" /> Theme & Audience</p>
              <ScoreBar label="Theme" value={toNum(rj.themeIdentification.themeEffectivenessScore)} showColorScale />
              {rj.themeIdentification.primaryTheme && (
                <div className="mt-2 min-w-0">
                  <Badge variant="secondary" className="text-[10px] mb-1">{rj.themeIdentification.primaryTheme.category}</Badge>
                  <p className="text-[11px] text-muted-foreground break-words">{rj.themeIdentification.primaryTheme.description}</p>
                </div>
              )}
              {rj.themeIdentification.targetAudience && (
                <div className="mt-2 rounded bg-muted/40 p-2 min-w-0">
                  <p className="text-[10px] font-semibold">Target Audience</p>
                  <p className="text-[11px] text-muted-foreground break-words">{rj.themeIdentification.targetAudience.audienceType}</p>
                  <p className="text-[10px] text-emerald-600">Fit: {rj.themeIdentification.targetAudience.audienceFit}</p>
                </div>
              )}
              {rj.themeIdentification.uniqueAngle?.hasUniqueAngle && (
                <div className="flex gap-1.5 mt-2 min-w-0">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground break-words">{rj.themeIdentification.uniqueAngle.differentiationFactor}</p>
                </div>
              )}
              {rj.themeIdentification.secondaryThemes?.length && (
                <div className="mt-2 flex flex-wrap gap-1.5 min-w-0">
                  {rj.themeIdentification.secondaryThemes.map(st => (
                    <Badge key={st.theme} variant="outline" className="text-[9px]">{st.theme}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Visual */}
          {rj.visualExpressionTechniques && (
            <div className="rounded-lg border p-3 min-w-0">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-primary shrink-0" /> Visual Expression</p>
              <ScoreBar label="Visual" value={toNum(rj.visualExpressionTechniques.visualExpressionScore)} showColorScale />
              <div className="space-y-0.5 mt-2 text-[11px]">
                {rj.visualExpressionTechniques.colorPsychology && (
                  <p><span className="text-muted-foreground">Color Mood: </span>{rj.visualExpressionTechniques.colorPsychology.colorMood}</p>
                )}
                {rj.visualExpressionTechniques.visualStyleConsistency && (
                  <>
                    <ScoreBar label="Consistency" value={toNum(rj.visualExpressionTechniques.visualStyleConsistency.consistencyScore)} showColorScale />
                    <p className="text-muted-foreground break-words">{rj.visualExpressionTechniques.visualStyleConsistency.styleDescription}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Competitive Gap */}
          {rj.competitiveGapAnalysis && (
            <div className="rounded-lg border p-3 min-w-0">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-primary shrink-0" /> Competitive Gap</p>
              <ScoreBar label="Gap Score" value={toNum(rj.competitiveGapAnalysis.competitiveGapScore)} showColorScale />
              {rj.competitiveGapAnalysis.differentiation?.uniqueSellingPoints?.length && (
                <div className="mt-2 min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">Unique Selling Points</p>
                  {rj.competitiveGapAnalysis.differentiation.uniqueSellingPoints.map((usp, i) => (
                    <div key={i} className="flex gap-1.5 mb-1 min-w-0">
                      <Star className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-muted-foreground break-words">{usp}</p>
                    </div>
                  ))}
                </div>
              )}
              {rj.competitiveGapAnalysis.opportunityAreas?.length && (
                <div className="mt-2 min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">Opportunities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {rj.competitiveGapAnalysis.opportunityAreas.map((o, i) => (
                      <Badge key={i} variant="outline" className="text-[9px] bg-emerald-500/5 text-emerald-700 border-emerald-500/20">{o}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {rj.competitiveGapAnalysis.weaknessesAgainstCompetitors?.length && (
                <div className="mt-2 min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">To Improve</p>
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

// ═════════════════════════════════════════════════════════════════════════════
// Main Export
// ═════════════════════════════════════════════════════════════════════════════

export function AIAnalysis({ result, posts, loading }: {
  result?: AnalysisResult | null; posts: Post[]; loading: boolean
}) {
  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-bold">AI Content Analysis</CardTitle>
              <CardDescription className="text-[11px]">
                {result?.account?.totalAnalyzed ?? 0} posts analyzed · Gemini AI
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            {result?.analyses?.[0]?.analyzedAt ? fmt.date(result.analyses[0].analyzedAt) : "No data"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4 min-w-0 overflow-hidden">
        {(result?.analyses?.length ?? 0) > 0 && (
          <NextContentActions analyses={result!.analyses} />
        )}

        {/* Key: isolate Tabs in its own overflow container */}
        <div className="w-full min-w-0 overflow-hidden">
          <Tabs defaultValue="deep">
            <TabsList className="w-full grid grid-cols-3 mb-3">
              <TabsTrigger value="deep"   className="text-xs gap-1"><Search    className="w-3 h-3 shrink-0" />Deep</TabsTrigger>
              <TabsTrigger value="video"  className="text-xs gap-1"><Video     className="w-3 h-3 shrink-0" />Video</TabsTrigger>
              <TabsTrigger value="visual" className="text-xs gap-1"><ImageIcon className="w-3 h-3 shrink-0" />Visual</TabsTrigger>
            </TabsList>
            {/* Each TabsContent gets a hard overflow guard */}
            <div className="w-full min-w-0 overflow-hidden">
              <TabsContent value="deep" className="mt-0">
                <DeepAnalysisTab analyses={result?.analyses ?? []} agg={result?.aggregateScores} posts={posts} loading={loading} />
              </TabsContent>
              <TabsContent value="video" className="mt-0">
                <VideoAnalysisTab analyses={result?.analyses ?? []} loading={loading} />
              </TabsContent>
              <TabsContent value="visual" className="mt-0">
                <VisualThemeTab analyses={result?.analyses ?? []} loading={loading} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}