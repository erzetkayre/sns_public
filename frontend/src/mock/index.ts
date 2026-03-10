// src/mock/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Entry point — re-export semua data + mockApi
// ─────────────────────────────────────────────────────────────────────────────

import type { Job } from "@/components/instagram/shared/types"

export { MOCK_ACCOUNTS }                        from "./mock-accounts"
export { POSTS_MAIN }                           from "./mock-posts-main"
export { POSTS_COMP_001, POSTS_COMP_002 }       from "./mock-posts-competitors"
export { ANALYSIS_MAIN }                        from "./mock-analysis"

import { MOCK_ACCOUNTS }                        from "./mock-accounts"
import { POSTS_MAIN }                           from "./mock-posts-main"
import { POSTS_COMP_001, POSTS_COMP_002 }       from "./mock-posts-competitors"
import { ANALYSIS_MAIN }                        from "./mock-analysis"
import type { RawPost }                         from "@/components/instagram/shared/types"

// ── Lookup maps ───────────────────────────────────────────────────────────────

export const ALL_POSTS_BY_ACCOUNT: Record<string, RawPost[]> = {
  acc_main_001: POSTS_MAIN,
  acc_comp_001: POSTS_COMP_001,
  acc_comp_002: POSTS_COMP_002,
}

export const ALL_ANALYSIS_BY_ACCOUNT = {
  acc_main_001: ANALYSIS_MAIN,
}

// ── Fake delay ────────────────────────────────────────────────────────────────

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))
let _jobCounter = 1

// ── mockApi ───────────────────────────────────────────────────────────────────

export const mockApi = {
  async getAccounts() {
    await delay(400)
    return { success: true, accounts: MOCK_ACCOUNTS }
  },

  async getAccountPosts(accountId: string, limit = 100) {
    await delay(300)
    const posts = (ALL_POSTS_BY_ACCOUNT[accountId] ?? []).slice(0, limit)
    return { success: true, accountId, posts, total: posts.length }
  },

  async getAccountAnalysis(accountId: string, limit = 50) {
    await delay(350)
    const result = ALL_ANALYSIS_BY_ACCOUNT[accountId as keyof typeof ALL_ANALYSIS_BY_ACCOUNT]
    if (!result) return { success: false, accountId, analyses: [], aggregateScores: null }
    return { ...result, analyses: result.analyses.slice(0, limit) }
  },

  async startScrape() {
    await delay(150)
    return { success: true, jobId: `job_scrape_${_jobCounter++}` }
  },

  async startAiAnalysis() {
    await delay(150)
    return { success: true, jobId: `job_analyze_${_jobCounter++}` }
  },

  async getJobStatus(jobId: string): Promise<Job> {
    await delay(250)
    return {
      id:              jobId,
      status:          "completed",
      postsCreated:    jobId.includes("scrape") ? 15 : 0,
      postsUpdated:    jobId.includes("scrape") ? 0 : 15,
      mediaDownloaded: jobId.includes("scrape") ? 15 : 0,
    }
  },
}