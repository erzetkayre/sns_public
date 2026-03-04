// ─────────────────────────────────────────────────────────────────────────────
// api.ts — Centralized API calls for Instagram Dashboard
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = "/api"

export const api = {
  getAccounts: () =>
    fetch(`${API_BASE}/ig/accounts`).then(r => r.json()),

  getAccountPosts: (id: string, limit = 100) =>
    fetch(`${API_BASE}/ig/accounts/${id}/posts?limit=${limit}`).then(r => r.json()),

  getAccountAnalysis: (id: string, limit = 50) =>
    fetch(`${API_BASE}/ai/account/${id}/analysis?limit=${limit}`).then(r => r.json()),

  startScrape: () =>
    fetch(`${API_BASE}/ig/scrape`, { method: "POST" }).then(r => r.json()),

  startAiAnalysis: () =>
    fetch(`${API_BASE}/ai/analyze`, { method: "POST" }).then(r => r.json()),

  getJobStatus: (id: string) =>
    fetch(`${API_BASE}/ig/job/${id}`).then(r => r.json()),
}
