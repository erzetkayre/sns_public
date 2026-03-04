// ─────────────────────────────────────────────────────────────────────────────
// instagram-dashboard-content-v2.tsx
// Main dashboard page — 3 sections, fully componentized
//
// SETUP: copy this file + the instagram/ folder to src/components/
// Then in your DashboardPage: import InstagramDashboardV2 from "@/components/instagram-dashboard-content-v2"
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react"
import { RefreshCw, Brain, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

// ── Shared
import { api } from "@/components/instagram/shared/api"
import {
  normalizePost, normalizeAccount, computeKPI,
  computeCompetitorMetrics, toNum,
} from "@/components/instagram/shared/utils"
import { SectionHeader, JobToast } from "@/components/instagram/shared/ui-primitives"
import type {
  Account, Post, RawPost, AnalysisResult, ComputedKPI,
  Job, CompetitorMetrics,
} from "@/components/instagram/shared/types"

// ── Section 1
import { KPICards }          from "@/components/instagram/section1/KPICards"
import { TopPostsEmbed }     from "@/components/instagram/section1/TopPostsEmbed"
import { ContentMix }        from "@/components/instagram/section1/ContentMix"
import { AIAnalysis }        from "@/components/instagram/section1/AIAnalysis"
import { ERTrendChart, PerformanceChart } from "@/components/instagram/section1/EngagementCharts"

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

// ─────────────────────────────────────────────────────────────────────────────

export default function InstagramDashboardV2() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [allAccounts,  setAllAccounts]  = useState<Account[]>([])
  const [selectedId,   setSelectedId]   = useState<string | null>(null)
  const [posts,        setPosts]        = useState<Post[]>([])
  const [analysis,     setAnalysis]     = useState<AnalysisResult | null>(null)
  const [activeJob,    setActiveJob]    = useState<Job | null>(null)
  const [kpi,          setKpi]          = useState<ComputedKPI | undefined>()

  // Posts per competitor (for section 2 & 3)
  const [competitorPosts, setCompetitorPosts] = useState<Record<string, Post[]>>({})

  // Loading states
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [loadingPosts,    setLoadingPosts]    = useState(false)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [fetchingJob,     setFetchingJob]     = useState(false)
  const [analyzingJob,    setAnalyzingJob]    = useState(false)

  const selectedAccount = allAccounts.find(a => a.id === selectedId)
  const mainAccounts    = allAccounts.filter(a => a.accountType === "main")
  const competitors     = allAccounts.filter(a => a.accountType === "competitor")

  // Build CompetitorMetrics for section 2
  const competitorMetrics: CompetitorMetrics[] = competitors.map(acc => (
    computeCompetitorMetrics(acc, competitorPosts[acc.id] ?? [])
  ))

  // All posts by account for section 3
  const allPostsByAccount = allAccounts.map(acc => ({
    account: acc,
    posts:   acc.id === selectedId ? posts : (competitorPosts[acc.id] ?? []),
  }))

  // Re-compute KPI whenever posts/account changes
  useEffect(() => {
    if (selectedAccount && posts.length) setKpi(computeKPI(posts, selectedAccount.followersCount))
    else setKpi(undefined)
  }, [posts, selectedAccount])

  // ── Job polling ───────────────────────────────────────────────────────────
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

  // ── Load one account's posts + analysis ──────────────────────────────────
  const loadAccountData = useCallback(async (id: string) => {
    setLoadingPosts(true); setLoadingAnalysis(true)
    try {
      const [pr, ar] = await Promise.allSettled([
        api.getAccountPosts(id, 100),
        api.getAccountAnalysis(id, 50),
      ])
      if (pr.status === "fulfilled" && pr.value.success) {
        const rawPosts: RawPost[] = pr.value.posts ?? []
        setPosts(rawPosts.map(normalizePost))
      }
      if (ar.status === "fulfilled" && ar.value.success) {
        const raw = ar.value
        const toNum2 = toNum
        const normalized = (raw.analyses ?? []).map((a: any) => {
          const rj = a.resultJson
          if (!rj) return a
          return {
            ...a,
            hookScore:           toNum2(a.hookScore           || rj.hookAnalysisDetailed?.overallHookScore                               || rj.overallAssessment?.overallScore),
            productionQuality:   toNum2(a.productionQuality   || rj.filmingMethodDetails?.overallProductionValue?.productionQualityScore || rj.overallAssessment?.contentQuality),
            engagementPotential: toNum2(a.engagementPotential || rj.overallAssessment?.engagementPotential                               || rj.erCorrelationAnalysis?.erScore),
            overallScore:        toNum2(a.overallScore        || rj.overallAssessment?.overallScore),
          }
        })
        setAnalysis({ ...raw, analyses: normalized })
      }
    } catch (e) { console.error(e) }
    finally { setLoadingPosts(false); setLoadingAnalysis(false) }
  }, [])

  // ── Load competitor posts (lightweight, for metrics only) ─────────────────
  const loadCompetitorPosts = useCallback(async (accounts: Account[]) => {
    const comps = accounts.filter(a => a.accountType === "competitor")
    const results = await Promise.allSettled(
      comps.map(acc => api.getAccountPosts(acc.id, 50).then(r => ({ id: acc.id, data: r })))
    )
    const map: Record<string, Post[]> = {}
    results.forEach(r => {
      if (r.status === "fulfilled" && r.value.data.success) {
        map[r.value.id] = (r.value.data.posts ?? []).map(normalizePost)
      }
    })
    setCompetitorPosts(map)
  }, [])

  // ── Load all ──────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoadingAccounts(true)
    try {
      const res = await api.getAccounts()
      if (res.success && res.accounts) {
        const normalized = (res.accounts as Account[]).map(normalizeAccount)
        setAllAccounts(normalized)
        const main = normalized.find(a => a.accountType === "main")
        if (main) {
          setSelectedId(main.id)
          await Promise.all([
            loadAccountData(main.id),
            loadCompetitorPosts(normalized),
          ])
        }
      }
    } catch (e) { console.error(e) }
    finally { setLoadingAccounts(false) }
  }, [loadAccountData, loadCompetitorPosts])

  useEffect(() => { loadAll() }, [])
  useEffect(() => { if (selectedId) loadAccountData(selectedId) }, [selectedId])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFetchPost = async () => {
    if (fetchingJob) return; setFetchingJob(true)
    try {
      const r = await api.startScrape()
      if (r.success && r.jobId) { setActiveJob({ id: r.jobId, status: "running" }); pollJob(r.jobId) }
    } catch (e) { console.error(e) } finally { setFetchingJob(false) }
  }

  const handleAIAnalyze = async () => {
    if (analyzingJob) return; setAnalyzingJob(true)
    try {
      const r = await api.startAiAnalysis()
      if (r.success && r.jobId) { setActiveJob({ id: r.jobId, status: "running" }); pollJob(r.jobId) }
    } catch (e) { console.error(e) } finally { setAnalyzingJob(false) }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 py-4 md:py-6">

          {/* ── Dashboard Header ─────────────────────────────────────────── */}
          <div className="px-4 lg:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Instagram Analytics</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Content intelligence platform · {allAccounts.length} accounts tracked
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {allAccounts.length > 0 && (
                <div className="relative">
                  <select
                    className="h-8 appearance-none rounded-lg border bg-background text-xs pl-3 pr-7 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={selectedId ?? ""}
                    onChange={e => setSelectedId(e.target.value)}
                  >
                    {allAccounts.map(a => (
                      <option key={a.id} value={a.id}>
                        @{a.username}{a.accountType === "main" ? " (main)" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-3.5 w-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleAIAnalyze} disabled={analyzingJob}>
                {analyzingJob ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                AI Analyze
              </Button>
              <Button variant="outline" size="sm" onClick={handleFetchPost} disabled={fetchingJob}>
                {fetchingJob ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Fetch Post
              </Button>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              SECTION 1: MY ACCOUNT OVERVIEW
          ════════════════════════════════════════════════════════════════ */}
          <section className="px-4 lg:px-6 space-y-5">
            <SectionHeader
              title="My Account Overview"
              description={selectedAccount ? `@${selectedAccount.username} · ${posts.length} posts loaded` : "Select an account"}
              badge={kpi ? `ER ${kpi.avgErAllPosts}%` : undefined}
              accent="#6366f1"
            />

            {/* Row 1: KPI Cards */}
            <KPICards
              account={selectedAccount}
              kpi={kpi}
              loading={loadingAccounts || loadingPosts}
            />

            {/* Row 2: Top 3 Posts Embed + Content Mix */}
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <TopPostsEmbed
                  posts={posts}
                  followersCount={selectedAccount?.followersCount ?? 0}
                  username={selectedAccount?.username}
                  loading={loadingPosts}
                />
              </div>
              <ContentMix kpi={kpi} loading={loadingPosts} />
            </div>

            {/* Row 3: AI Analysis */}
            <AIAnalysis
              result={analysis}
              posts={posts}
              loading={loadingAnalysis}
            />

            {/* Row 4: ER Trend + Performance Detail */}
            <div className="grid md:grid-cols-2 gap-4">
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
          </section>

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

        </div>
      </div>

      <JobToast job={activeJob} onDismiss={() => setActiveJob(null)} />
    </div>
  )
}
