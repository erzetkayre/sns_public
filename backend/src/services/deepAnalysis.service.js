/**
 * Deep Analysis Service
 * Three-phase comprehensive account analysis
 * Migrated from legacy Google Apps Script system to Express/Prisma/Gemini
 */

import { GoogleGenAI } from '@google/genai';
import {
  getDeepAnalysisPhase1Prompt,
  getDeepAnalysisPhase2Prompt,
  getDeepAnalysisPhase3Prompt
} from '../config/deepAnalysisPrompts.js';
import { calculateEngagementRate, calculatePostMetrics } from './metricsCalculation.service.js';
import { getTopPostsByER, getLatestPost } from './topPostsSelection.service.js';
import prisma from '../lib/prisma.js';
import { AI_CONFIG } from '../../test/ai.config.js';

// Initialize Gemini client
const ai = new GoogleGenAI({
  apiKey: AI_CONFIG.GEMINI_API_KEY
});

// Token tracking for deep analysis
let deepAnalysisTokenStats = {
  totalRequests: 0,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalTokens: 0,
  phaseBreakdown: {
    phase1: { requests: 0, tokens: 0 },
    phase2: { requests: 0, tokens: 0 },
    phase3: { requests: 0, tokens: 0 }
  }
};

/**
 * Run complete three-phase deep analysis
 * @param {string} mainAccountId - Main account UUID
 * @param {Array<string>} competitorIds - Competitor account UUIDs
 * @returns {Promise<Object>} Complete analysis result
 */
export async function runDeepAnalysis(mainAccountId, competitorIds = []) {
  console.log(`[DEEP] Starting three-phase deep analysis...`);
  const startTime = Date.now();

  try {
    // Step 1: Gather all data
    console.log(`[DEEP] Step 1: Gathering data...`);
    const analysisData = await gatherAnalysisData(mainAccountId, competitorIds);

    // Step 2: Run Phase 1
    console.log(`[DEEP] Step 2: Running Phase 1 (Judgment + Comprehensiveness + Performance)...`);
    const phase1 = await executePhase1(analysisData);

    // Step 3: Run Phase 2
    console.log(`[DEEP] Step 3: Running Phase 2 (Appeal + Competitor Pattern + Script)...`);
    const phase2 = await executePhase2(analysisData, phase1);

    // Step 4: Run Phase 3
    console.log(`[DEEP] Step 4: Running Phase 3 (SWOT + Strategy + Summary)...`);
    const phase3 = await executePhase3(analysisData, phase1, phase2);

    // Step 5: Save to database
    console.log(`[DEEP] Step 5: Saving results to database...`);
    const dbRecord = await saveDeepAnalysisToDatabase(mainAccountId, competitorIds, {
      data: analysisData,
      phase1,
      phase2,
      phase3
    });

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    console.log(`[DEEP] ✅ Deep analysis complete (${duration} min)`);
    console.log(`[DEEP] Token Usage: ${deepAnalysisTokenStats.totalRequests} requests, ${deepAnalysisTokenStats.totalTokens} total tokens`);

    return {
      success: true,
      resultId: dbRecord.id,
      duration,
      analysis: {
        phase1,
        phase2,
        phase3
      },
      tokenStats: deepAnalysisTokenStats
    };

  } catch (error) {
    console.error(`[DEEP] Error in runDeepAnalysis:`, error.message);
    throw error;
  }
}

/**
 * Gather all data needed for analysis
 * Data from top posts, latest post, metrics, and captions
 */
async function gatherAnalysisData(mainAccountId, competitorIds) {
  console.log(`[DEEP] Gathering analysis data...`);

  // Get main account data
  const mainAccount = await prisma.watchedAccount.findUnique({
    where: { id: mainAccountId },
    select: { username: true, accountType: true, followersCount: true }
  });

  if (!mainAccount) {
    throw new Error(`Main account ${mainAccountId} not found`);
  }

  // Get top posts for main account
  const mainTop3 = await getTopPostsByER(mainAccountId, 3);
  const mainLatest = await getLatestPost(mainAccountId);

  // Get competitor data
  const competitorData = await Promise.all(
    competitorIds.map(async (compId) => {
      const compAccount = await prisma.watchedAccount.findUnique({
        where: { id: compId },
        select: { username: true, accountType: true, followersCount: true }
      });

      const compTop3 = await getTopPostsByER(compId, 3);

      return {
        accountId: compId,
        username: compAccount?.username || 'Unknown',
        accountType: compAccount?.accountType || 'general',
        followers: compAccount?.followersCount || 0,
        topPosts: compTop3
      };
    })
  );

  // Calculate metrics for analysis
  const mainMetrics = calculateAggregateMetrics([...mainTop3, mainLatest].filter(Boolean));
  const compMetrics = calculateAggregateMetrics(
    competitorData.flatMap(c => c.topPosts)
  );

  // Analyze caption patterns
  const mainCaptionAnalysis = analyzeCaptions([...mainTop3, mainLatest].filter(Boolean));
  const compCaptionAnalysis = analyzeCaptions(
    competitorData.flatMap(c => c.topPosts)
  );

  // Analyze location patterns
  const mainLocationAnalysis = analyzeLocations([...mainTop3, mainLatest].filter(Boolean));
  const compLocationAnalysis = analyzeLocations(
    competitorData.flatMap(c => c.topPosts)
  );

  // Analyze genre patterns
  const mainGenreAnalysis = analyzeGenres([...mainTop3, mainLatest].filter(Boolean));
  const compGenreAnalysis = analyzeGenres(
    competitorData.flatMap(c => c.topPosts)
  );

  // Analyze price positioning
  const mainPriceAnalysis = analyzePriceRanges([...mainTop3, mainLatest].filter(Boolean));
  const compPriceAnalysis = analyzePriceRanges(
    competitorData.flatMap(c => c.topPosts)
  );

  // Analyze caption structure
  const mainStructureAnalysis = analyzeCaptionStructure([...mainTop3, mainLatest].filter(Boolean));
  const compStructureAnalysis = analyzeCaptionStructure(
    competitorData.flatMap(c => c.topPosts)
  );

  // Determine comprehensiveness strategy
  const comprehensivenessStrategy = getComprehensivenessStrategy(mainAccount.accountType);

  return {
    mainAccountId,
    mainAccountName: mainAccount.username,
    accountType: mainAccount.accountType,
    mainPosts: [...mainTop3, mainLatest].filter(Boolean),
    competitorPosts: competitorData.flatMap(c => c.topPosts),
    mainMetrics,
    compMetrics,
    mainCaptionAnalysis,
    compCaptionAnalysis,
    mainLocationAnalysis,
    compLocationAnalysis,
    mainGenreAnalysis,
    compGenreAnalysis,
    mainPriceAnalysis,
    compPriceAnalysis,
    mainStructureAnalysis,
    compStructureAnalysis,
    comprehensivenessStrategy,
    competitorCount: competitorIds.length
  };
}

/**
 * Execute Phase 1: Judgment + Comprehensiveness + Performance
 */
async function executePhase1(analysisData) {
  console.log(`[DEEP] Executing Phase 1...`);

  const prompt = getDeepAnalysisPhase1Prompt(analysisData);
  const response = await callGeminiAPI(prompt, 'deep-analysis-phase1');

  deepAnalysisTokenStats.phaseBreakdown.phase1.requests += 1;
  deepAnalysisTokenStats.phaseBreakdown.phase1.tokens += response.tokensUsed || 0;

  return response.result;
}

/**
 * Execute Phase 2: Appeal + Competitor Pattern + Script
 */
async function executePhase2(analysisData, phase1Result) {
  console.log(`[DEEP] Executing Phase 2...`);

  const prompt = getDeepAnalysisPhase2Prompt(analysisData, phase1Result);
  const response = await callGeminiAPI(prompt, 'deep-analysis-phase2');

  deepAnalysisTokenStats.phaseBreakdown.phase2.requests += 1;
  deepAnalysisTokenStats.phaseBreakdown.phase2.tokens += response.tokensUsed || 0;

  return response.result;
}

/**
 * Execute Phase 3: SWOT + Strategy + Summary
 */
async function executePhase3(analysisData, phase1Result, phase2Result) {
  console.log(`[DEEP] Executing Phase 3...`);

  const prompt = getDeepAnalysisPhase3Prompt(analysisData, phase1Result, phase2Result);
  const response = await callGeminiAPI(prompt, 'deep-analysis-phase3');

  deepAnalysisTokenStats.phaseBreakdown.phase3.requests += 1;
  deepAnalysisTokenStats.phaseBreakdown.phase3.tokens += response.tokensUsed || 0;

  return response.result;
}

/**
 * Call Gemini API for analysis
 */
async function callGeminiAPI(prompt, analysisType) {
  try {
    console.log(`[DEEP] Calling Gemini for ${analysisType}...`);

    const response = await ai.models.generateContent({
      model: AI_CONFIG.GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.2,
        maxOutputTokens: 15000,
        responseMimeType: 'application/json',
        systemInstruction:
          'You are a JSON-only response AI. Always respond with pure JSON only. ' +
          'No markdown, no code fences. Start with { and end with }.'
      }
    });

    // Track tokens
    const inputTokens = response.usageMetadata?.promptTokenCount || 0;
    const outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
    const totalTokens = response.usageMetadata?.totalTokenCount || (inputTokens + outputTokens);

    deepAnalysisTokenStats.totalRequests += 1;
    deepAnalysisTokenStats.totalInputTokens += inputTokens;
    deepAnalysisTokenStats.totalOutputTokens += outputTokens;
    deepAnalysisTokenStats.totalTokens += totalTokens;

    console.log(`[DEEP] Tokens - Input: ${inputTokens}, Output: ${outputTokens}, Total: ${totalTokens}`);

    // Parse response
    const result = parseGeminiResponse(response.text);

    return {
      result,
      tokensUsed: totalTokens
    };

  } catch (error) {
    console.error(`[DEEP] Gemini API error:`, error.message);
    throw error;
  }
}

/**
 * Parse Gemini JSON response
 */
function parseGeminiResponse(responseText) {
  try {
    let cleaned = responseText.trim();

    // Strip markdown code fences if present
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Remove control characters
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');

    // Fix trailing commas
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('[DEEP] Error parsing JSON response:', error.message);
    console.error('[DEEP] Raw response preview:', responseText?.substring(0, 500));
    throw error;
  }
}

/**
 * Save deep analysis to database
 */
async function saveDeepAnalysisToDatabase(mainAccountId, competitorIds, analysisResults) {
  try {
    const record = await prisma.deepAnalysisResult.create({
      data: {
        accountId: mainAccountId,
        competitorIds,
        phase1Result: analysisResults.phase1,
        phase2Result: analysisResults.phase2,
        phase3Result: analysisResults.phase3,
        rawData: analysisResults.data,
        status: 'completed'
      }
    });

    console.log(`[DEEP] Saved analysis result: ${record.id}`);
    return record;
  } catch (error) {
    console.error('[DEEP] Error saving to database:', error.message);
    throw error;
  }
}

/**
 * Helper: Calculate aggregate metrics
 */
function calculateAggregateMetrics(posts) {
  if (posts.length === 0) {
    return {
      totalPosts: 0,
      avgER: 0,
      avgLikes: 0,
      avgComments: 0,
      avgViews: 0
    };
  }

  const ers = posts.map(p => parseFloat(p.calculatedMetrics?.er || 0));
  const likes = posts.map(p => p.calculatedMetrics?.likes || 0);
  const comments = posts.map(p => p.calculatedMetrics?.comments || 0);
  const views = posts.map(p => p.calculatedMetrics?.views || 0);

  return {
    totalPosts: posts.length,
    avgER: (ers.reduce((a, b) => a + b, 0) / posts.length).toFixed(2),
    avgLikes: Math.round(likes.reduce((a, b) => a + b, 0) / posts.length),
    avgComments: Math.round(comments.reduce((a, b) => a + b, 0) / posts.length),
    avgViews: Math.round(views.reduce((a, b) => a + b, 0) / posts.length)
  };
}

/**
 * Helper: Analyze captions for appeal types
 */
function analyzeCaptions(posts) {
  let emotionalCount = 0;
  let experientialCount = 0;
  let factualCount = 0;

  posts.forEach(post => {
    const caption = (post.caption || '').toLowerCase();

    // Simple keyword matching (can be enhanced)
    const emotionalWords = ['love', 'feel', 'heart', 'amazing', 'beautiful', 'perfect', 'happy'];
    const experientialWords = ['try', 'taste', 'experien', 'visit', 'explore', 'discover', 'enjoy'];
    const factualWords = ['new', 'recipe', 'ingredi', 'how to', 'step', 'method', 'perfect'];

    if (emotionalWords.some(w => caption.includes(w))) emotionalCount++;
    if (experientialWords.some(w => caption.includes(w))) experientialCount++;
    if (factualWords.some(w => caption.includes(w))) factualCount++;
  });

  const total = posts.length;

  return {
    avgEmotionalScore: ((emotionalCount / total) * 10).toFixed(1),
    avgExperientialScore: ((experientialCount / total) * 10).toFixed(1),
    avgFactualScore: ((factualCount / total) * 10).toFixed(1),
    emotionalCount,
    experientialCount,
    factualCount
  };
}

/**
 * Helper: Analyze location presence
 */
function analyzeLocations(posts) {
  const locationsUsed = posts
    .filter(p => p.location && p.location.trim())
    .map(p => p.location);

  const presenceRate = posts.length > 0 
    ? ((locationsUsed.length / posts.length) * 100).toFixed(0)
    : 0;

  return {
    presenceRate,
    areaCount: new Set(locationsUsed).size,
    areas: Array.from(new Set(locationsUsed)).slice(0, 5)
  };
}

/**
 * Helper: Analyze genre distribution
 */
function analyzeGenres(posts) {
  // Simplified genre analysis based on caption and content
  const genres = new Set();
  
  posts.forEach(post => {
    const caption = (post.caption || '').toLowerCase();
    if (caption.includes('recipe') || caption.includes('cooking')) genres.add('Recipes');
    if (caption.includes('restaurant') || caption.includes('cafe')) genres.add('Restaurants');
    if (caption.includes('style') || caption.includes('fashion')) genres.add('Lifestyle');
  });

  return {
    genreCount: genres.size,
    genres: Array.from(genres),
    diversityScore: Math.min(genres.size, 10) / 10 * 10
  };
}

/**
 * Helper: Analyze price ranges
 */
function analyzePriceRanges(posts) {
  const priceKeywords = {
    'budget': posts.filter(p => (p.caption || '').includes('cheap') || (p.caption || '').includes('affordable')).length,
    'mid': posts.filter(p => (p.caption || '').includes('standard') || (p.caption || '').includes('good')).length,
    'premium': posts.filter(p => (p.caption || '').includes('premium') || (p.caption || '').includes('luxury')).length
  };

  const covered = Object.values(priceKeywords).filter(v => v > 0).length;

  return {
    coverageCount: covered,
    ranges: priceKeywords
  };
}

/**
 * Helper: Analyze caption structure
 */
function analyzeCaptionStructure(posts) {
  const structures = posts.map(p => {
    const caption = (p.caption || '').split('\n')[0];
    if (caption.length < 50) return 'short';
    if (caption.length < 150) return 'medium';
    return 'long';
  });

  const typicalOrder = structures.length > 0
    ? structures.slice(0, 3).join(' → ')
    : 'unknown';

  return {
    typicalOrder,
    structures
  };
}

/**
 * Helper: Get comprehensiveness strategy
 */
function getComprehensivenessStrategy(accountType) {
  const strategies = {
    'restaurant': { focus: 'Menu & Location Coverage', priority: 'high' },
    'cafe': { focus: 'Atmosphere & Menu Diversity', priority: 'high' },
    'brand': { focus: 'Product Range Coverage', priority: 'high' },
    'general': { focus: 'Content Diversity', priority: 'medium' }
  };

  return strategies[accountType] || strategies.general;
}

/**
 * Get token usage statistics
 */
export function getDeepAnalysisTokenStats() {
  return deepAnalysisTokenStats;
}

/**
 * Reset token statistics
 */
export function resetDeepAnalysisTokenStats() {
  deepAnalysisTokenStats = {
    totalRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    phaseBreakdown: {
      phase1: { requests: 0, tokens: 0 },
      phase2: { requests: 0, tokens: 0 },
      phase3: { requests: 0, tokens: 0 }
    }
  };
  console.log('[DEEP] Token stats reset');
}

export default {
  runDeepAnalysis,
  getDeepAnalysisTokenStats,
  resetDeepAnalysisTokenStats
};
