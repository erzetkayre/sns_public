// ─────────────────────────────────────────────────────────────────────────────
// ui-primitives.tsx — Reusable micro-components for Instagram Dashboard
// ─────────────────────────────────────────────────────────────────────────────

import type { ComponentType } from "react"
import { X, RefreshCw, Award, CheckCircle, TrendingUp, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { scoreColor, SCORE_COLORS, toNum } from "@/components/instagram/shared/utils"
import type { Job } from "@/components/instagram/shared/types"

// ── ScoreBar ──────────────────────────────────────────────────────────────────

export function ScoreBar({ value, max = 10, color, label, showColorScale = false }: {
  value?: number; max?: number; color?: string; label?: string; showColorScale?: boolean
}) {
  const numVal = toNum(value)
  const sc = showColorScale ? scoreColor(numVal, max) : null
  const barColor = color ?? (sc ? SCORE_COLORS[sc].bar : "#6366f1")

  return (
    <div className="flex items-center gap-2 min-w-0">
      {label && <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{label}</span>}
      <div className="flex-1 min-w-0 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, (numVal / max) * 100)}%`, background: barColor }}
        />
      </div>
      <span className={`text-xs font-mono font-semibold w-8 text-right ${sc ? SCORE_COLORS[sc].text : ""}`}>
        {numVal.toFixed(1)}
      </span>
    </div>
  )
}

// ── Delta ─────────────────────────────────────────────────────────────────────

export function Delta({ value }: { value?: number }) {
  if (value == null) return null
  const pos = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${pos ? "text-emerald-600" : "text-rose-500"}`}>
      {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {pos ? "+" : ""}{value}
    </span>
  )
}

// ── TriggerBadge ──────────────────────────────────────────────────────────────

export function TriggerBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={`text-[10px] px-2 py-0.5 gap-1 ${active ? "bg-primary/15 text-primary border-0" : "opacity-40"}`}
    >
      {active && <CheckCircle className="h-2.5 w-2.5" />}
      {label.replace(/([A-Z])/g, " $1").trim()}
    </Badge>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────

export function SectionHeader({
  title, description, badge, accent = "#6366f1"
}: {
  title: string; description?: string; badge?: string; accent?: string
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-1 h-8 rounded-full shrink-0 mt-0.5" style={{ background: accent }} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold tracking-tight">{title}</h2>
          {badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{badge}</span>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: ComponentType<{ className?: string }>; title: string; description?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Job Toast ─────────────────────────────────────────────────────────────────

export function JobToast({ job, onDismiss }: { job?: Job | null; onDismiss: () => void }) {
  if (!job) return null
  const running = job.status === "running" || job.status === "pending"
  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-xl border bg-card shadow-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {running
            ? <RefreshCw className="h-4 w-4 text-primary animate-spin" />
            : job.status === "completed" ? <Award className="h-4 w-4 text-emerald-500" />
            : <X className="h-4 w-4 text-destructive" />}
          <p className="text-xs font-medium">
            {running ? "Job running…" : job.status === "completed" ? "Job completed" : "Job failed"}
          </p>
        </div>
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {!running && (
        <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
          {(job.postsCreated ?? 0) > 0 && <p>✓ {job.postsCreated} posts created</p>}
          {(job.postsUpdated ?? 0) > 0 && <p>↻ {job.postsUpdated} posts updated</p>}
          {(job.mediaDownloaded ?? 0) > 0 && <p>↓ {job.mediaDownloaded} media files</p>}
          {job.errorMessage && <p className="text-destructive">✗ {job.errorMessage}</p>}
        </div>
      )}
    </div>
  )
}