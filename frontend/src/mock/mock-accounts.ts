// src/mock/mock-accounts.ts
import type { Account } from "@/components/instagram/shared/types"

export const MOCK_ACCOUNTS: Account[] = [
  {
    id:             "acc_main_001",
    username:       "mybrand.id",
    fullName:       "My Brand Indonesia",
    accountType:    "main",
    followersCount: 48_320,
    isVerified:     false,
    postsCount:     214,
    followerHistory: [
      { followersCount: 44_100, recordedAt: "2025-04-01T00:00:00.000Z" },
      { followersCount: 45_800, recordedAt: "2025-05-01T00:00:00.000Z" },
      { followersCount: 47_200, recordedAt: "2025-06-01T00:00:00.000Z" },
      { followersCount: 48_320, recordedAt: "2025-07-01T00:00:00.000Z" },
    ],
  },
  {
    id:             "acc_comp_001",
    username:       "competitor_alpha",
    fullName:       "Alpha Store Official",
    accountType:    "competitor",
    followersCount: 92_500,
    isVerified:     true,
    postsCount:     388,
    followerHistory: [
      { followersCount: 85_000, recordedAt: "2025-04-01T00:00:00.000Z" },
      { followersCount: 87_500, recordedAt: "2025-05-01T00:00:00.000Z" },
      { followersCount: 90_100, recordedAt: "2025-06-01T00:00:00.000Z" },
      { followersCount: 92_500, recordedAt: "2025-07-01T00:00:00.000Z" },
    ],
  },
  {
    id:             "acc_comp_002",
    username:       "brand_beta_idn",
    fullName:       "Beta Brand Indonesia",
    accountType:    "competitor",
    followersCount: 31_200,
    isVerified:     false,
    postsCount:     156,
    followerHistory: [
      { followersCount: 28_400, recordedAt: "2025-04-01T00:00:00.000Z" },
      { followersCount: 29_300, recordedAt: "2025-05-01T00:00:00.000Z" },
      { followersCount: 30_500, recordedAt: "2025-06-01T00:00:00.000Z" },
      { followersCount: 31_200, recordedAt: "2025-07-01T00:00:00.000Z" },
    ],
  },
]