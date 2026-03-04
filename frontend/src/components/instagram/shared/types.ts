// ─────────────────────────────────────────────────────────────────────────────
// types.ts — Shared interfaces for Instagram Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export interface Account {
  id: string
  username: string
  fullName?: string
  accountType: "main" | "competitor"
  followersCount: number
  isVerified: boolean
  postCount?: number
  postsCount?: number
  followerHistory?: { followersCount: number; followers?: number; recordedAt: string }[]
}

// Raw API shape from Prisma includes
export interface RawPost {
  id: string
  postType?: string
  type?: string
  caption?: string
  postedAt: string
  shortCode?: string        // for Instagram embed URL
  permalink?: string        // direct IG link if stored
  thumbnailUrl?: string     // from mediaFiles
  hashtags?: string[]
  postHashtags?: { hashtag: { tag: string } }[]
  metricsSnapshots?: RawMetricSnapshot[]
  metrics?: { views: number; likes: number; comments: number }
  location?: string | null
}

export interface RawMetricSnapshot {
  likesCount: number
  commentsCount: number
  shareCount?: number
  savedCount?: number
  videoViewCount: number
  videoPlayCount?: number
  engagementRate?: number | string
  fetchedAt: string
}

// Normalized internal format
export interface Post {
  id: string
  type: string
  caption?: string
  postedAt: string
  hashtags: string[]
  shortCode?: string
  permalink?: string
  thumbnailUrl?: string
  location?: string | null
  metrics?: {
    views: number
    likes: number
    comments: number
    er?: number             // already in %, e.g. 2.34
  }
}

export interface ComputedKPI {
  followers: number
  totalVideos: number
  totalImages: number
  totalSidecars: number
  avgViewsPerVideo: number
  avgLikesPerVideo: number
  avgErAllPosts: number
  postingFreqPerWeek: number
}

// ── Gemini AI Result ──────────────────────────────────────────────────────────

export interface GeminiResult {
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

export interface AiPost {
  postId: string
  caption?: string
  postType?: string
  postedAt?: string
  hookScore: number
  productionQuality: number
  engagementPotential: number
  overallScore: number
  analyzedAt: string
  resultJson?: GeminiResult | null
}

export interface AnalysisResult {
  account: { id: string; totalAnalyzed: number }
  aggregateScores: {
    averageHookScore: number
    averageProductionQuality: number
    averageEngagementPotential: number
    averageOverallScore: number
  }
  analyses: AiPost[]
}

export interface Job {
  id: string
  status: "pending" | "running" | "completed" | "failed"
  postsCreated?: number
  postsUpdated?: number
  mediaDownloaded?: number
  errorMessage?: string
}

// ── Competitor data with computed metrics ────────────────────────────────────

export interface CompetitorMetrics {
  account: Account
  posts: Post[]
  avgER: number
  avgLikes: number
  avgComments: number
  avgViews: number
  topHashtags: { tag: string; count: number }[]
  topLocations: { location: string; count: number }[]
}
