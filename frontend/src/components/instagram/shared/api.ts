// ─────────────────────────────────────────────────────────────────────────────
// api.ts — Centralized API calls for Instagram Dashboard
// ─────────────────────────────────────────────────────────────────────────────

import { mockApi } from "@/mock"
const USE_MOCK = true
const API_BASE = "/api"

// export const api = {
//   getAccounts: () =>
//     fetch(`${API_BASE}/ig/accounts`).then(r => r.json()),

//   getAccountPosts: (id: string, limit = 100) =>
//     fetch(`${API_BASE}/ig/accounts/${id}/posts?limit=${limit}`).then(r => r.json()),

//   getAccountAnalysis: (id: string, limit = 50) =>
//     fetch(`${API_BASE}/ai/account/${id}/analysis?limit=${limit}`).then(r => r.json()),

//   startScrape: () =>
//     fetch(`${API_BASE}/ig/scrape`, { method: "POST" }).then(r => r.json()),

//   startAiAnalysis: () =>
//     fetch(`${API_BASE}/ai/analyze`, { method: "POST" }).then(r => r.json()),

//   getJobStatus: (id: string) =>
//     fetch(`${API_BASE}/ig/job/${id}`).then(r => r.json()),
// }

export const api = {
  async getAccounts() {
    if (USE_MOCK) return mockApi.getAccounts()
    return fetch(`${API_BASE}/ig/accounts`).then(r => r.json())
  },

  async getAccountPosts(id: string, limit = 100) {
    if (USE_MOCK) return mockApi.getAccountPosts(id, limit)
    return fetch(`${API_BASE}/ig/accounts/${id}/posts?limit=${limit}`).then(r => r.json())
  },

  async getAccountAnalysis(id: string, limit = 50) {
    if (USE_MOCK) return mockApi.getAccountAnalysis(id, limit)
    return fetch(`${API_BASE}/ai/account/${id}/analysis?limit=${limit}`).then(r => r.json())
  },

  async startScrape() {
    if (USE_MOCK) return mockApi.startScrape()
    return fetch(`${API_BASE}/ig/scrape`, { method: "POST" }).then(r => r.json())
  },

  async startAiAnalysis() {
    if (USE_MOCK) return mockApi.startAiAnalysis()
    return fetch(`${API_BASE}/ai/analyze`, { method: "POST" }).then(r => r.json())
  },

  async getJobStatus(id: string) {
    if (USE_MOCK) return mockApi.getJobStatus(id)
    return fetch(`${API_BASE}/ig/job/${id}`).then(r => r.json())
  },
}

