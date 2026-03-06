// ─────────────────────────────────────────────────────────────────────────────
// utils.ts — Shared utilities for Instagram Dashboard
// ─────────────────────────────────────────────────────────────────────────────

import type { Account, Post, RawPost, ComputedKPI, CompetitorMetrics } from "./types"

// ── Formatters ────────────────────────────────────────────────────────────────

export const fmt = {
  num: (n?: number | null): string => {
    if (n == null || isNaN(n as number)) return "—"
    const x = n as number
    if (x >= 1_000_000) return `${(x / 1_000_000).toFixed(1)}M`
    if (x >= 1_000) return `${(x / 1_000).toFixed(1)}K`
    return x.toLocaleString()
  },
  pct: (n?: number | null): string => {
    if (n == null || isNaN(n as number)) return "—"
    return `${Number(n).toFixed(2)}%`
  },
  date: (d?: string | null): string => {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
  },
  dateShort: (d?: string | null): string => {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
  },
  score: (n?: number | null): string => {
    if (n == null || isNaN(n as number)) return "—"
    return Number(n).toFixed(1)
  },
}

export const toNum = (v: unknown): number => parseFloat(String(v ?? 0)) || 0

// ── Score color helper ────────────────────────────────────────────────────────

export function scoreColor(score: number, max = 10): "red" | "yellow" | "green" {
  const pct = (score / max) * 100
  if (pct >= 70) return "green"
  if (pct >= 40) return "yellow"
  return "red"
}

export const SCORE_COLORS = {
  red:    { bg: "bg-red-500/10",    text: "text-red-500",    border: "border-red-500/20",    bar: "#ef4444" },
  yellow: { bg: "bg-amber-500/10",  text: "text-amber-500",  border: "border-amber-500/20",  bar: "#f59e0b" },
  green:  { bg: "bg-emerald-500/10",text: "text-emerald-600",border: "border-emerald-500/20",bar: "#10b981" },
}

// Priority badge for recommendations
export const PRIORITY_CONFIG = {
  1: { label: "High Impact", bg: "bg-red-500/10",    text: "text-red-500",    dot: "#ef4444" },
  2: { label: "Quick Win",   bg: "bg-amber-500/10",  text: "text-amber-600",  dot: "#f59e0b" },
  3: { label: "Long Term",   bg: "bg-sky-500/10",    text: "text-sky-600",    dot: "#3b82f6" },
}

// ── Instagram embed URL ───────────────────────────────────────────────────────

export function getInstagramUrl(post: Post): string | null {
  if (post.permalink) return post.permalink
  if (post.shortCode) return `https://www.instagram.com/p/${post.shortCode}/`
  return null
}

// ── Normalizers ───────────────────────────────────────────────────────────────

export function normalizePost(raw: RawPost): Post {
  const type = raw.type ?? raw.postType ?? "Video"

  let hashtags: string[] = []
  if (Array.isArray(raw.hashtags)) {
    hashtags = raw.hashtags
  } else if (Array.isArray(raw.postHashtags)) {
    hashtags = raw.postHashtags.map(ph => ph.hashtag?.tag).filter(Boolean)
  }

  let metrics: Post["metrics"] | undefined
  if (raw.metrics) {
    metrics = raw.metrics
  } else if (raw.metricsSnapshots?.length) {
    const snap = raw.metricsSnapshots[0]
    const likes = snap.likesCount ?? 0
    const comments = snap.commentsCount ?? 0
    const views = snap.videoViewCount ?? 0
    const er = snap.engagementRate != null
      ? parseFloat(String(snap.engagementRate)) * 100
      : undefined
    metrics = { views, likes, comments, er }
  }

  return {
    id: raw.id,
    type,
    caption: raw.caption,
    postedAt: raw.postedAt,
    hashtags,
    shortCode: raw.shortCode,
    permalink: raw.permalink,
    thumbnailUrl: raw.thumbnailUrl,
    location: raw.location,
    metrics,
  }
}

export function normalizeAccount(raw: Account): Account {
  return { ...raw, postCount: raw.postCount ?? raw.postsCount ?? 0 }
}

// ── KPI Computation ───────────────────────────────────────────────────────────

export function computeKPI(posts: Post[], followersCount: number): ComputedKPI {
  const videos = posts.filter(p => p.type === "Video")
  const images = posts.filter(p => p.type === "Image")
  const sidecars = posts.filter(p => p.type === "Sidecar")

  const avgViewsPerVideo = videos.length
    ? videos.reduce((s, p) => s + (p.metrics?.views ?? 0), 0) / videos.length : 0

  const avgLikesPerVideo = videos.length
    ? videos.reduce((s, p) => s + (p.metrics?.likes ?? 0), 0) / videos.length : 0

  const postsWithMetrics = posts.filter(p => p.metrics)
  const avgErAllPosts = (() => {
    if (!postsWithMetrics.length) return 0
    const withStoredEr = postsWithMetrics.filter(p => p.metrics?.er != null)
    if (withStoredEr.length > 0) {
      return withStoredEr.reduce((s, p) => s + (p.metrics!.er ?? 0), 0) / withStoredEr.length
    }
    if (!followersCount) return 0
    return postsWithMetrics.reduce((s, p) => {
      const l = p.metrics!.likes ?? 0
      const c = p.metrics!.comments ?? 0
      return s + ((l * 2 + c * 5) / followersCount * 100)
    }, 0) / postsWithMetrics.length
  })()

  let postingFreqPerWeek = 0
  if (posts.length >= 2) {
    const ts = posts.map(p => new Date(p.postedAt).getTime()).filter(Boolean).sort((a, b) => a - b)
    const weeks = (ts[ts.length - 1] - ts[0]) / 604_800_000
    postingFreqPerWeek = weeks > 0 ? posts.length / weeks : 0
  }

  return {
    followers: followersCount,
    totalVideos: videos.length,
    totalImages: images.length,
    totalSidecars: sidecars.length,
    avgViewsPerVideo: Math.round(avgViewsPerVideo),
    avgLikesPerVideo: Math.round(avgLikesPerVideo),
    avgErAllPosts: parseFloat(avgErAllPosts.toFixed(2)),
    postingFreqPerWeek: parseFloat(postingFreqPerWeek.toFixed(1)),
  }
}

// ── Post ER ───────────────────────────────────────────────────────────────────

export function getPostER(post: Post, followersCount: number): number {
  if (post.metrics?.er != null) return post.metrics.er
  if (!followersCount || !post.metrics) return 0
  const l = post.metrics.likes ?? 0
  const c = post.metrics.comments ?? 0
  return parseFloat(((l * 2 + c * 5) / followersCount * 100).toFixed(2))
}

// ── Competitor Metrics Computation ───────────────────────────────────────────

export function computeCompetitorMetrics(account: Account, posts: Post[]): CompetitorMetrics {
  const postsWithMetrics = posts.filter(p => p.metrics)

  const avgER = postsWithMetrics.length
    ? postsWithMetrics.reduce((s, p) => s + getPostER(p, account.followersCount), 0) / postsWithMetrics.length : 0

  const avgLikes = postsWithMetrics.length
    ? postsWithMetrics.reduce((s, p) => s + (p.metrics?.likes ?? 0), 0) / postsWithMetrics.length : 0

  const avgComments = postsWithMetrics.length
    ? postsWithMetrics.reduce((s, p) => s + (p.metrics?.comments ?? 0), 0) / postsWithMetrics.length : 0

  const avgViews = postsWithMetrics.length
    ? postsWithMetrics.reduce((s, p) => s + (p.metrics?.views ?? 0), 0) / postsWithMetrics.length : 0

  // Hashtag frequency
  const hashtagMap: Record<string, number> = {}
  posts.forEach(p => p.hashtags?.forEach(tag => { hashtagMap[tag] = (hashtagMap[tag] ?? 0) + 1 }))
  const topHashtags = Object.entries(hashtagMap)
    .sort(([, a], [, b]) => b - a).slice(0, 3)
    .map(([tag, count]) => ({ tag, count }))

  // Location frequency
  const locationMap: Record<string, number> = {}
  posts.forEach(p => {
    if (p.location) locationMap[p.location] = (locationMap[p.location] ?? 0) + 1
  })
  const topLocations = Object.entries(locationMap)
    .sort(([, a], [, b]) => b - a).slice(0, 3)
    .map(([location, count]) => ({ location, count }))

  return {
    account,
    posts,
    avgER: parseFloat(avgER.toFixed(2)),
    avgLikes: Math.round(avgLikes),
    avgComments: Math.round(avgComments),
    avgViews: Math.round(avgViews),
    topHashtags,
    topLocations,
  }
}

// ── Chart colors ──────────────────────────────────────────────────────────────

export const CHART_COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"]
