/**
 * AI Analysis Service
 * Integrates with Gemini Vision API using @google/genai SDK
 * Uses Files API for video upload (handles large files reliably)
 */

import fs from 'fs';
import { GoogleGenAI, createUserContent, createPartFromUri } from '@google/genai';
import { AI_CONFIG } from '../../test/ai.config.js';
import { getPrompt } from '../config/prompts.js';
import prisma from '../lib/prisma.js';
import { jsonrepair } from 'jsonrepair';

// Initialize Gemini client
const ai = new GoogleGenAI({ 
  apiKey: AI_CONFIG.GEMINI_API_KEY,
});

// Token usage tracking
let tokenUsageStats = {
  totalRequests: 0,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalTokens: 0
};

/**
 * Upload a video file to Gemini Files API
 * @param {string} localPath - Local file path
 * @returns {Promise<Object>} Uploaded file object with uri and mimeType
 */
async function uploadVideoToGemini(localPath) {
  if (!fs.existsSync(localPath)) {
    throw new Error(`Video file not found: ${localPath}`);
  }

  const fileSizeMb = fs.statSync(localPath).size / 1024 / 1024;
  console.log(`[AI] Uploading video: ${localPath} (${fileSizeMb.toFixed(10)} MB)`);

  const mimeType = localPath.endsWith('.mp4') ? 'video/mp4' : 'video/quicktime';

  const uploadedFile = await ai.files.upload({
    file: localPath,
    config: { mimeType },
  });

  console.log(`[AI] Upload response:`, JSON.stringify(uploadedFile, null, 2)); // ← debug log
  console.log(`[AI] Video uploaded successfully. URI: ${uploadedFile.uri}`);
  return uploadedFile;
}

/**
 * Wait for uploaded file to become ACTIVE (Gemini processes it async)
 * @param {string} fileName - File name from upload response
 * @returns {Promise<Object>} Active file object
 */
async function waitForFileActive(fileName) {
  console.log(`[AI] Waiting for file to be processed by Gemini...`);

  let file = await ai.files.get({ name: fileName }); // ← pass as object
  let attempts = 0;
  const maxAttempts = 30;

  console.log(`[AI] File response:`, JSON.stringify(file, null, 2)); // ← debug log

  while (file.state === 'PROCESSING' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    file = await ai.files.get({ name: fileName }); // ← pass as object
    attempts++;
    console.log(`[AI] File state: ${file.state} (attempt ${attempts}/${maxAttempts})`);
  }

  // Handle if state never becomes ACTIVE
  if (file.state !== 'ACTIVE') {
    console.error(`[AI] File state problem:`, JSON.stringify(file, null, 2));
    throw new Error(`File processing failed. Final state: ${file.state}`);
  }

  console.log(`[AI] File is ACTIVE and ready for analysis`);
  return file;
}

/**
 * Analyze video using Gemini Vision API
 * @param {Object} videoData - {localPath, postData}
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeVideoWithGemini(videoData) {
  const { localPath, postData } = videoData;

  // Step 1: Upload video to Gemini Files API
  const uploadedFile = await uploadVideoToGemini(localPath);

  // Step 2: Wait for file to be processed
  const activeFile = await waitForFileActive(uploadedFile.name);

  // Step 3: Get prompt from centralized config
  const prompt = getPrompt('INSTAGRAM_VIDEO_ANALYSIS', postData);

  // Step 4: Run analysis
  const analysisResult = await callGeminiWithFile(activeFile, prompt);

  // Step 5: Clean up uploaded file to save storage quota
  try {
    await ai.files.delete(uploadedFile.name);
    console.log(`[AI] Cleaned up uploaded file: ${uploadedFile.name}`);
  } catch (cleanupError) {
    console.warn(`[AI] Warning: Could not delete uploaded file: ${cleanupError.message}`);
  }

  return analysisResult;
}
export async function analyzeVideoWithGeminiEnglish(videoData) {
  const { localPath, postData } = videoData;

  // Step 1: Upload video to Gemini Files API
  const uploadedFile = await uploadVideoToGemini(localPath);

  // Step 2: Wait for file to be processed
  const activeFile = await waitForFileActive(uploadedFile.name);

  // Step 3: Get prompt from centralized config
  const prompt = getPrompt('INSTAGRAM_VIDEO_ANALYSIS_ENG', postData);

  // Step 4: Run analysis
  const analysisResult = await callGeminiWithFile(activeFile, prompt);

  // Step 5: Clean up uploaded file to save storage quota
  try {
    await ai.files.delete(uploadedFile.name);
    console.log(`[AI] Cleaned up uploaded file: ${uploadedFile.name}`);
  } catch (cleanupError) {
    console.warn(`[AI] Warning: Could not delete uploaded file: ${cleanupError.message}`);
  }

  return analysisResult;
}

/**
 * Call Gemini with an uploaded file URI
 * @param {Object} file - Active Gemini file object
 * @param {string} prompt - The analysis prompt
 * @returns {Promise<Object>} Parsed analysis result
 */
async function callGeminiWithFile(file, prompt) {
  console.log(`[AI] Calling Gemini ${AI_CONFIG.GEMINI_MODEL} with uploaded video...`);

  const response = await ai.models.generateContent({
    model: AI_CONFIG.GEMINI_MODEL,
    contents: createUserContent([
      createPartFromUri(file.uri, file.mimeType),
      prompt,
    ]),
    config: {
      temperature: 0.3,
      maxOutputTokens: 14000,
      responseMimeType: 'application/json',
      systemInstruction:
        'You are an expert Instagram video analyst for 100K+ follower accounts. ' +
        'Always respond in pure JSON format only. ' +
        'Analyze the entire video from start to finish with ULTRA-DETAILED granular analysis. ' +
        'Be highly critical and decisive. Use strict 100K account standards.',
    },
  });

  // Track token usage
  if (response.usageMetadata) {
    const inputTokens = response.usageMetadata.promptTokenCount || 0;
    const outputTokens = response.usageMetadata.candidatesTokenCount || 0;
    const totalTokens = response.usageMetadata.totalTokenCount || (inputTokens + outputTokens);

    tokenUsageStats.totalRequests++;
    tokenUsageStats.totalInputTokens += inputTokens;
    tokenUsageStats.totalOutputTokens += outputTokens;
    tokenUsageStats.totalTokens += totalTokens;

    console.log('[AI] ===== TOKEN USAGE =====');
    console.log(`[AI] Input: ${inputTokens} | Output: ${outputTokens} | Total: ${totalTokens}`);
    console.log(`[AI] Cumulative - Requests: ${tokenUsageStats.totalRequests} | Total Tokens: ${tokenUsageStats.totalTokens}`);
    console.log('[AI] =======================');
  }

  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason === 'MAX_TOKENS') {
    throw new Error('Gemini output truncated (MAX_TOKENS)');
  }
  const text =
  typeof response.text === 'function'
  ? await response.text()
  : response.text ??
  response.candidates?.[0]?.content?.parts?.[0]?.text ??
  '';
  
  if (!text.trim().endsWith('}')) {
    throw new Error('A response appears truncated');
  }
  if (!text || !text.trim()) {
    throw new Error('Empty Gemini response');
  }
  if (response.candidates?.length === 0) {
    throw new Error('No Gemini candidates returned');
  }
  console.log('[AI] Parsing Gemini response...');
  return parseGeminiResponse(text);
}

/**
 * Parse Gemini response and extract JSON
 * @param {string} responseText - Raw text from Gemini
 * @returns {Object} Parsed JSON object
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

    return JSON.parse(jsonrepair(cleaned));
  } catch (error) {
    console.error('[AI] Error parsing JSON response:', error.message);
    console.error('[AI] Raw response preview:', responseText?.substring(0, 500));
    throw error;
  }
}

/**
 * Save analysis to database (AiAnalysisHistory model)
 * @param {string} postId - UUID of the post
 * @param {string} accountId - UUID of the watched account
 * @param {Object} analysis - Parsed Gemini response
 * @param {Object} tokenMeta - Token usage metadata
 */
export async function saveAnalysisToDatabase(postId, accountId, analysis, tokenMeta = {}) {
  try {
    const record = await prisma.aiAnalysisHistory.upsert({
      data: {
        accountId,
        postId,
        analysisType: 'video',
        status: 'completed',
        resultJson: analysis,
        summary: analysis.summary || null,
        provider: AI_CONFIG.GEMINI_MODEL,
        estimatedInputTokens: tokenMeta.inputTokens || null,
        estimatedOutputTokens: tokenMeta.outputTokens || null,
        durationMs: tokenMeta.durationMs || null,
      },
    });

    console.log(`[AI] Saved analysis for post ${postId} (record: ${record.id})`);
    return record;
  } catch (error) {
    console.error('[AI] Error saving analysis to database:', error.message);
    throw error;
  }
}
export async function saveEnglishAnalysisToDatabase(postId, accountId, analysis, tokenMeta = {}) {
  try {
    const record = await prisma.aiEnglishAnalysisHistory.create({
      data: {
        accountId,
        postId,
        analysisType: 'video',
        status: 'completed',
        resultJson: analysis,
        summary: analysis.summary || null,
        provider: AI_CONFIG.GEMINI_MODEL,
        estimatedInputTokens: tokenMeta.inputTokens || null,
        estimatedOutputTokens: tokenMeta.outputTokens || null,
        durationMs: tokenMeta.durationMs || null,
      },
    });

    console.log(`[AI] Saved analysis for post ${postId} (record: ${record.id})`);
    return record;
  } catch (error) {
    console.error('[AI] Error saving analysis to database:', error.message);
    throw error;
  }
}

/**
 * Analyze all posts for a user
 * @param {string} userId
 * @returns {Promise<{total, analyzed, failed}>}
 */
export async function analyzeAllUserPosts(userId) {
  const posts = await prisma.post.findMany({
    where: {
      account: { userId },
      postType: 'Video',
    },
    include: {
      account: true,
      mediaFiles: {
        where: { mediaType: 'video' },
      },
      metricsSnapshots: {
        orderBy: { fetchedAt: 'desc' },
        take: 1,
      },
    },
  });

  console.log(`[AI] Found ${posts.length} video posts to analyze`);

  let analyzed = 0;
  let failed = 0;

  for (const post of posts) {
    try {
      const videoMedia = post.mediaFiles[0];
      if (!videoMedia?.storageKey) {
        console.log(`[AI] No video file for post ${post.id}, skipping...`);
        continue;
      }

      const localPath = `public${videoMedia.storageKey}`;
      const metrics = post.metricsSnapshots[0];

      const videoData = {
        localPath,
        postData: {
          username: post.account.username,
          caption: post.caption,
          duration: post.videoDuration ? Number(post.videoDuration) : 0,
          views: metrics?.videoViewCount || 0,
          likes: metrics?.likesCount || 0,
          comments: metrics?.commentsCount || 0,
          er: metrics?.engagementRate ? Number(metrics.engagementRate) * 100 : 0,
          postedDate: post.postedAt?.toISOString(),
          accountType: post.account.accountType,
        },
      };

      console.log(`[AI] Analyzing post ${post.id}...`);
      const startTime = Date.now();
      const analysis = await analyzeVideoWithGemini(videoData);
      const durationMs = Date.now() - startTime;

      await saveAnalysisToDatabase(post.id, post.accountId, analysis, {
        durationMs,
      });

      analyzed++;
    } catch (error) {
      console.error(`[AI] Failed to analyze post ${post.id}:`, error.message);
      failed++;
    }
  }

  return { total: posts.length, analyzed, failed };
}

export async function analyzeAllUserEnglishPosts(userId) {
  const posts = await prisma.post.findMany({
    where: {
      account: { userId },
      postType: 'Video',
    },
    include: {
      account: true,
      mediaFiles: {
        where: { mediaType: 'video' },
      },
      metricsSnapshots: {
        orderBy: { fetchedAt: 'desc' },
        take: 1,
      },
    },
  });

  console.log(`[AI] Found ${posts.length} video posts to analyze`);

  let analyzed = 0;
  let failed = 0;

  for (const post of posts) {
    try {
      const videoMedia = post.mediaFiles[0];
      if (!videoMedia?.storageKey) {
        console.log(`[AI] No video file for post ${post.id}, skipping...`);
        continue;
      }

      const localPath = `public${videoMedia.storageKey}`;
      const metrics = post.metricsSnapshots[0];

      const videoData = {
        localPath,
        postData: {
          username: post.account.username,
          caption: post.caption,
          duration: post.videoDuration ? Number(post.videoDuration) : 0,
          views: metrics?.videoViewCount || 0,
          likes: metrics?.likesCount || 0,
          comments: metrics?.commentsCount || 0,
          er: metrics?.engagementRate ? Number(metrics.engagementRate) * 100 : 0,
          postedDate: post.postedAt?.toISOString(),
          accountType: post.account.accountType,
        },
      };

      console.log(`[AI] Analyzing post ${post.id}...`);
      const startTime = Date.now();
      const analysis = await analyzeVideoWithGeminiEnglish(videoData);
      const durationMs = Date.now() - startTime;

      await saveEnglishAnalysisToDatabase(post.id, post.accountId, analysis, {
        durationMs,
      });

      analyzed++;
    } catch (error) {
      console.error(`[AI] Failed to analyze post ${post.id}:`, error.message);
      failed++;
    }
  }

  return { total: posts.length, analyzed, failed };
}

/**
 * Get token usage statistics
 */
export function getTokenUsageStats() {
  return {
    ...tokenUsageStats,
    averageTokensPerRequest:
      tokenUsageStats.totalRequests > 0
        ? Math.round(tokenUsageStats.totalTokens / tokenUsageStats.totalRequests)
        : 0,
  };
}

/**
 * Reset token usage statistics
 */
export function resetTokenUsageStats() {
  tokenUsageStats = {
    totalRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
  };
  console.log('[AI] Token usage stats reset');
}