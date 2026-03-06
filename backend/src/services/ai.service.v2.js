/**
 * ai.service.v2.js
 * ─────────────────────────────────────────────────────────────
 * Versi baru AI Analysis Service dengan:
 *   - responseSchema enforcement (fix inconsistency utama)
 *   - temperature: 0 (fix randomness)
 *   - Japanese prompt
 *   - Bug fixes dari ai.service.js lama
 *   - Satu fungsi analyzeAll dengan parameter language
 *
 * File lama (ai.service.js) TIDAK disentuh.
 * ─────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import { GoogleGenAI, createUserContent, createPartFromUri } from '@google/genai';
import { AI_CONFIG } from '../../test/ai.config.js';
import prisma from '../lib/prisma.js';
import { jsonrepair } from 'jsonrepair';
import { ANALYSIS_SCHEMA_HYBRID } from './gemini.schema.hybrid.js';

// ─────────────────────────────────────────────────────────────
// 1. CLIENT
// ─────────────────────────────────────────────────────────────

const ai = new GoogleGenAI({
  apiKey: AI_CONFIG.GEMINI_API_KEY,
});

// ─────────────────────────────────────────────────────────────
// 2. TOKEN TRACKER
// ─────────────────────────────────────────────────────────────

let tokenUsageStats = {
  totalRequests:     0,
  totalInputTokens:  0,
  totalOutputTokens: 0,
  totalTokens:       0,
};

export function getTokenUsageStats() {
  return {
    ...tokenUsageStats,
    averageTokensPerRequest:
      tokenUsageStats.totalRequests > 0
        ? Math.round(tokenUsageStats.totalTokens / tokenUsageStats.totalRequests)
        : 0,
  };
}

export function resetTokenUsageStats() {
  tokenUsageStats = {
    totalRequests: 0, totalInputTokens: 0,
    totalOutputTokens: 0, totalTokens: 0,
  };
  console.log('[AIv2] Token usage stats reset');
}

function recordTokenUsage(usageMetadata) {
  if (!usageMetadata) return;
  const input  = usageMetadata.promptTokenCount     ?? 0;
  const output = usageMetadata.candidatesTokenCount ?? 0;
  const total  = usageMetadata.totalTokenCount      ?? (input + output);
  tokenUsageStats.totalRequests++;
  tokenUsageStats.totalInputTokens  += input;
  tokenUsageStats.totalOutputTokens += output;
  tokenUsageStats.totalTokens       += total;
  console.log(`[AIv2] tokens → in:${input} out:${output} | cumulative:${tokenUsageStats.totalTokens}`);
}
// ─────────────────────────────────────────────────────────────
// 3. RESPONSE SCHEMA
//    Di-import dari gemini.schema.hybrid.js — hybrid strategy:
//    field kritis → strict enum, narasi → free-form string
// ─────────────────────────────────────────────────────────────

// Alias lokal supaya callGeminiWithSchema tidak perlu diubah
const ANALYSIS_SCHEMA = ANALYSIS_SCHEMA_HYBRID;


// ─────────────────────────────────────────────────────────────
// 4. PROMPT BUILDER — Japanese version
// ─────────────────────────────────────────────────────────────

function buildJapanesePrompt(postData) {
  const accountContext =
    postData.accountType === 'area_specific'
      ? '特定エリア特化型（例: 渋谷特化）→ エリア内での圧倒的な網羅性と専門性が求められる'
      : postData.accountType === 'general_tokyo'
      ? '東京全域カバー型 → 多様性と一貫したビジュアルブランディングが求められる'
      : 'ジェネラル型';

  const duration = postData.duration || 0;
  const segmentRule =
    duration <= 15 ? `3秒ごと（0-3, 3-6, 6-9, 9-12, 12-15秒）` :
    duration <= 30 ? `5秒ごと（0-5, 5-10, 10-15, 15-20, 20-25, 25-30秒）` :
    duration <= 60 ? `10秒ごと（0-10, 10-20, 20-30, 30-40, 40-50, 50-60秒）` :
    `15秒ごと`;

  return `
You're a video strategy analyst specializing in Instagram accounts with 100,000 followers.

[CRITICAL CONTEXT]
This account already has 100,000 followers. Therefore:
- "Fairly good" video quality isn't enough.
- Top 5-10% video quality is required.
- Find a critical differentiator, not just small improvements.

[Post Data]
Username: ${postData.username || ''}
Caption: ${postData.caption || 'None'}
Location: ${postData.location || 'None'}
Video Duration: ${postData.duration || 0} seconds
Views: ${postData.views || 0}
Likes: ${postData.likes || 0}
Comments: ${postData.comments || 0}
ER: ${postData.er || 0}%
Posted: ${postData.postedDate || ''}

[Account Type: ${postData.accountType || 'general'}]
${postData.accountType === 'area_specific' ?
'Area-specific (e.g., Shibuya) → Requires overwhelming coverage and expertise within the area':
postData.accountType === 'general_tokyo' ?
'Coverage of the entire Tokyo area → Requires diversity and consistent visual branding':
'General'}

[Analysis Framework - 100K Demographics]

[ENHANCED SECTION 1: ULTRA-DETAILED MINUTE-BY-MINUTE BREAKDOWN]
## Comprehensive Timeline Analysis with Granular Details

**CRITICAL RULES FOR DETAILED BREAKDOWN:**
- Segment video by length:
* Under 15 seconds: Every 3 seconds (0-3 seconds, 3-6 seconds, 6-9 seconds, 9-12 seconds, 12-15 seconds)
* 16-30 seconds: Every 5 seconds (0-5 seconds, 5-10 seconds, (10-15 seconds, 15-20 seconds, 20-25 seconds, 25-30 seconds)
* 31-60 seconds: Every 10 seconds (0-10 seconds, 10-20 seconds, 20-30 seconds, 30-40 seconds, 40-50 seconds, 50-60 seconds)
* Over 60 seconds: Every 15 seconds

**Record in detail for each segment:**

1. **Visual Content (What is shown) - Super detailed version:**
- Main Subject: The main subject (food/people/store/scenery/product)
- Subject Details: The specific state of the subject (e.g., ramen - steaming, three slices of pork, plenty of green onions)
- Background Elements: What is in the background (in-store decoration/windows/other customers/kitchen)
- Visual Hierarchy: Where the eye first goes (food in the center → text in the upper left → waiter in the background)
- Color Dominance: Dominant color (70% orange, 20% white, 10% brown)
- Lighting Mood: Lighting mood (Warm/Bright/Dramatic/Soft)

2. **Camera Movement (Detailed Version):**
- Movement Type: Stationary/Pan/Tilt/Zoom/Dolly/Handheld/Gimbal
- Movement Speed: Very Slow/Slow/Normal/Fast/Very Fast
- Movement Direction: Left → Right/Right → Left/Up → Down/Down → Up/Front → Back/Back → Front/Circular
- Movement Smoothness: Completely Smooth/Slightly Smooth/Slightly Shaky/Shaky
- Camera Angle During Movement: High Angle/Eye Level/Low Angle/Bird's Eye

3. **Cut Type & Transition (Detailed Version):**
- Transition Type: Hard Cut/Dissolve/Fade/Wipe/Match Cut/Jump Cut/Zoom Transition/None
- Transition Duration: Instantaneous (0.1 seconds) / Short (0.3 seconds) / Normal (0.5 seconds) / Long (1 second+)
- Transition Effect: Smooth / Jerky / Impactful / Natural
- Why This Transition: Scene Change / Maintaining Tempo / Emotional Change / Emphasis / Surprise

4. **Text Overlay (Text Display) - Super Detailed:**
- Text Presence: Yes / No
- Text Count: Number of texts in this segment (1 / 2 / 3 or more)
- Text Content Array: ["Text 1", "Text 2", "Text 3"]
- Text Size Array: ["Large", "Medium", "Small"] (Size of each text)
- Text Color Array: ["White", "Yellow", "Red"] (Color of each text)
- Text Position Array: ["Top Center", "Bottom Left", "Right"] (Position of each text)
- Text Animation Array: ["Bounce", "Fade In", "None"] (Animation of each text)
- Text Background Array: ["Translucent Black", "None", "Color Box"]
- Text Font Style: Bold/Normal/Italic/Outline (as much as possible)
- Text Timing: Display timing (at the beginning/midway/end of the segment/always on)
- Text Readability: Very Readable/Readable/Somewhat Difficult/Difficult
- Text-Visual Sync: Synchronization between text and visuals (Perfect/Good/Average/Somewhat out of sync)

5. **Key Moment & Story Beat (Detailed Version):**
- Moment Type: Hook/Build-up/Transition/Climax/Resolution/CTA/Filler
- Emotional Beat: Excitement/Curiosity/Surprise/Empathy/Relief/Tension/Relaxation/FOMO/Appetite/Aspiration
- Story Purpose: Attention-grabbing/Information/Emotional Engagement/Brand Impression/Engagement
- Viewer Action Expected: Continue watching/Like/Comment/Save/Share/Profile visit/Abandon risk
- Impact Level: Very strong/Strong/Medium/Weak/None
- Detailed Description: What's happening in this segment (120 characters)

6. **BGM & Audio Status** - Detailed Version:**
- BGM Status: Start/Ongoing/Volume change/Tempo change/Stop/Silence/Restart
- BGM Volume Level: High (90-100%)/Medium (50-80%)/Low (20-40%)/Very low (0-20%)/Mute
- BGM Energy: High energy/Medium energy/Low energy/Quiet
- Estimated SFX: Likelihood of sound effects used in this segment (Sizzle/Bang/Smack/Swipe/None)
- Audio-Visual Sync: Audio-visual synchronization (Perfect/Good/Average/Estimated lag)

7. **Emotional Tone & Pacing** - Detailed Version:**
- Emotional Tone: Excited/Calm/Tension/Relaxed/Curious/Surprised/Happy/Neutral
- Pace: Very Fast/Fast/Normal/Slow/Very Slow
- Energy Level: Very High/High/Medium/Low/Very Low
- Viewer Engagement: High Engagement Expectation/Normal/Low Engagement Risk

**Required Output Format**
Return each segment as an array. Minimum 3 segments, maximum 8 segments.

[ENHANCED SECTION 2: ULTRA-DETAILED HOOK ANALYSIS (0-3 seconds)]
## First 3 Seconds Breakdown - Frame-by-Frame Analysis

**Opening hooks are the lifeblood of any video. Second-by-Second Analysis:**

**Second 0 (0.0-1.0) - The Make-or-Break Moment:**
- Opening Frame Content: What appears in the first frame (specifically)
- Visual Impact Score: 1-10 (Does it instantly catch the viewer's eye?)
- First Impression: The viewer's first emotion (surprise/curiosity/appetite/beauty/excitement/confusion)
- Hook Type: Food porn/people/text/motion/surprise/story start
- Scroll-Stopping Power: Scroll-Stopping power (very strong/strong/average/weak)
- Color Impact: Color impression in the first second (vivid/warm/cool/monochrome/pastel)
- Movement in First Second: Is there movement in the first second? (intense/slow/still)
- Audio Hook (guess): Is there an audio hook in the first second? (intense sound/music starts/silence/can't guess)

**First Second (1.0-2.0) - Retention Builder:**
- What Happens: What happens in the first second
- Visual Development: How the video unfolds (zoom/pan/cut/continue/text added)
- Information Added: Is new information added (text/subject change/context)?
- Curiosity Gap: Does it increase the viewer's desire to continue?
- Emotional Transition: Emotional change from 0 to 1 second (maintaining excitement/increasing curiosity/rising anticipation)

**Second Second (2.0-3.0 seconds) - Commitment Phase:**
- What Happens: What happens in the second second?
- Story Promise: Is it clear what this video has to offer?
- Value Proposition: Why viewers should continue watching this video?
- CTA or Direction: Can viewers predict what comes next?
- Retention Lock: Is the viewer committed at the 3-second mark?

**3-Second Overall Score:**
- Overall Hook Score: 1-10
- Hook Effectiveness: Does 90%+ of viewers watch for at least 3 seconds?
- Improvement Potential: Room for further improvement in hooks
- Best Practice Alignment: Comparison with the hook standard of the top 5% of videos

**Psychological Triggers Used:**
- FOMO (Fear of Missing Out): Yes/No
- Curiosity Gap: Yes/No
- Visual Beauty: Yes/No
- Surprise/Shock: Yes/No
- Social Proof: Yes/No
- Scarcity: Yes/No
- Food Porn (for food content): Yes/No
- Emotional Connection: Yes/No

[SECTION 3: VIDEO STRUCTURE ANALYSIS (Intro/Climax Framework)]
## Narrative Structure Breakdown - Story Arc Analysis

**Break down a video into a classic story structure:**

**1. Introduction - 0-X seconds**
**2. Rising Action - X-Y seconds**
**3. Climax - Y-Z seconds**
**4. Falling Action - Z-W seconds**
**5. Conclusion - W-End seconds**

[SECTION 4: THEME IDENTIFICATION]
Primary Theme, Secondary Themes, Content Purpose, Target Audience, Content Tone, Unique Angle

[SECTION 5: VISUAL EXPRESSION TECHNIQUES]
Color Psychology, Composition Techniques, Motion & Dynamic Elements, Visual Effects & Overlays, Visual Hierarchy & Focus Control, Visual Style Consistency

[SECTION 6: FILMING METHOD DETAILS]
Camera Equipment, Stabilization & Support, Lighting Setup, Shooting Style, Focus & Depth of Field, Frame Rate & Shutter Speed, Audio Recording Quality, Post-Production Level, Overall Production Value
  
[EXISTING SECTIONS]
- BGM Change Points Tracking
- Specific Editing Techniques
- Camera Angles Analysis
- Cut Composition Analysis
-Caption Overlay Analysis
- Visual Appeal & Cinematography
- Sound Design Analysis
- Pacing & Rhythm
- Retention Prediction
- Competitive Gap Analysis
- ER Correlation Analysis
- Overall Assessment
- Top 3 Actionable Recommendations

[CRITICAL RULES]
1. Return only pure JSON (no Markdown)
2. Total scores are numeric (1-10, one decimal point is OK)
3. Make decisions definitively (no "it seems" or "it's possible")
4. Narrow improvement suggestions to "three things to do" (clear priorities)
5. ER correlation analysis is required (provide numerical evidence)
6. Analyze the entire video (beginning, middle, end)
7. Minute-by-Minute Breakdown: Required, very detailed, at least 3 segments
8. Hook Analysis (0-3 seconds): Required, broken down into 1-second segments
9. Video Structure: Required, clearly define intro/rising/climax/falling/conclusion
10. Theme Identification: Required, primary/secondary Please specify themes.
11. Visual Expression: Required. Detailed analysis of color, composition, movement, and effects.
12. Filming Method: Required. Inferential analysis of equipment, lighting, and style.

`.trim();
}

// ─────────────────────────────────────────────────────────────
// 5. VIDEO UPLOAD + POLLING
// ─────────────────────────────────────────────────────────────

async function uploadVideoToGemini(localPath) {
  if (!fs.existsSync(localPath)) {
    throw new Error(`Video file not found: ${localPath}`);
  }
  const fileSizeMb = fs.statSync(localPath).size / 1024 / 1024;
  console.log(`[AIv2] Uploading: ${localPath} (${fileSizeMb.toFixed(2)} MB)`);

  const mimeType = localPath.endsWith('.mp4') ? 'video/mp4' : 'video/quicktime';
  const uploadedFile = await ai.files.upload({
    file: localPath,
    config: { mimeType },
  });

  console.log(`[AIv2] Uploaded. URI: ${uploadedFile.uri} | name: ${uploadedFile.name}`);
  return uploadedFile;
}

async function waitForFileActive(fileName, maxAttempts = 30) {
  console.log(`[AIv2] Polling until ACTIVE: ${fileName}`);
  let file = await ai.files.get({ name: fileName });
  let attempts = 0;

  while (file.state === 'PROCESSING' && attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 10000)); // poll tiap 10 detik
    file = await ai.files.get({ name: fileName });
    attempts++;
    console.log(`[AIv2] state: ${file.state} (${attempts}/${maxAttempts})`);
  }

  if (file.state !== 'ACTIVE') {
    throw new Error(`File processing failed. Final state: ${file.state}`);
  }
  console.log(`[AIv2] File ACTIVE ✓`);
  return file;
}

// ─────────────────────────────────────────────────────────────
// 6. GEMINI CALL — with responseSchema (fix utama)
// ─────────────────────────────────────────────────────────────

async function callGeminiWithSchema(file, prompt) {
  console.log(`[AIv2] Calling ${AI_CONFIG.GEMINI_MODEL} | schema: ON | temp: 0`);

  const response = await ai.models.generateContent({
    model: AI_CONFIG.GEMINI_MODEL,
    contents: createUserContent([
      createPartFromUri(file.uri, file.mimeType),
      prompt,
    ]),
    config: {
      temperature:      0,          // ← fix: 0 bukan 0.3
      maxOutputTokens:  16000,
      responseMimeType: 'application/json',
      responseSchema:   ANALYSIS_SCHEMA,   // ← fix utama: schema enforcement
      systemInstruction:
        'あなたは10万フォロワーInstagramアカウント専門の動画分析AIです。' +
        '提供されたJSONスキーマに完全に準拠した純粋なJSONオブジェクトのみを返してください。' +
        'すべての必須フィールドを必ず埋めること。曖昧な値を禁止する。',
    },
  });

  recordTokenUsage(response.usageMetadata);

  // ── fix: guard dilakukan dalam urutan yang benar ──
  if (!response.candidates?.length) throw new Error('GEMINI_NO_CANDIDATES');

  const finishReason = response.candidates[0]?.finishReason;
  if (finishReason === 'MAX_TOKENS')  throw new Error('GEMINI_MAX_TOKENS');
  if (finishReason === 'SAFETY')      throw new Error('GEMINI_SAFETY_BLOCK');

  // ── fix: response.text adalah property, bukan fungsi ──
  const rawText =
    response.text ??
    response.candidates?.[0]?.content?.parts?.[0]?.text ??
    '';

  if (!rawText?.trim()) throw new Error('GEMINI_EMPTY_RESPONSE');

  return parseResponse(rawText);
}

// ─────────────────────────────────────────────────────────────
// 7. JSON PARSER
// ─────────────────────────────────────────────────────────────

function parseResponse(rawText) {
  let text = rawText.trim();

  // 1. Direct parse (expected path dengan responseSchema)
  if (text.startsWith('{')) {
    try { return JSON.parse(text); } catch (_) {}
  }

  // 2. Strip markdown fence
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim();
  if (fenced) {
    try { return JSON.parse(fenced); } catch (_) {}
  }

  // 3. Extract { ... } + json-repair sebagai last resort
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    const extracted = text.slice(start, end + 1);
    try { return JSON.parse(extracted); } catch (_) {}
    try {
      console.warn('[AIv2] json-repair digunakan — periksa schema/prompt jika sering terjadi');
      return JSON.parse(jsonrepair(extracted));
    } catch (_) {}
  }

  throw new Error('GEMINI_UNPARSEABLE_RESPONSE');
}

// ─────────────────────────────────────────────────────────────
// 8. MAIN PUBLIC FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Analyze satu video dengan prompt Bahasa Jepang + responseSchema.
 * Drop-in replacement untuk analyzeVideoWithGemini() dari ai.service.js lama.
 *
 * @param {{ localPath: string, postData: object }} videoData
 * @returns {Promise<object>} - hasil analisis yang sudah validated schema
 */
export async function analyzeVideoJP(videoData) {
  const { localPath, postData } = videoData;

  const uploaded   = await uploadVideoToGemini(localPath);
  const activeFile = await waitForFileActive(uploaded.name);
  const prompt     = buildJapanesePrompt(postData);
  const result     = await callGeminiWithSchema(activeFile, prompt);

  // Cleanup file di Gemini (hemat storage quota)
  try {
    await ai.files.delete(uploaded.name);
    console.log(`[AIv2] Cleaned up: ${uploaded.name}`);
  } catch (e) {
    console.warn(`[AIv2] Cleanup warning: ${e.message}`);
  }

  return result;
}

/**
 * Analyze semua video posts user — satu fungsi, satu language parameter.
 * Menggantikan duplikasi analyzeAllUserPosts + analyzeAllUserEnglishPosts.
 *
 * @param {string} userId
 * @param {'jp'|'en'} language - 'jp' = Japanese prompt (v2), 'en' = English (lama)
 * @returns {Promise<{total, analyzed, failed}>}
 */
export async function analyzeAllUserPostsV2(userId, language = 'jp') {
  const posts = await prisma.post.findMany({
    where: {
      account: { userId },
      postType: 'Video',
    },
    include: {
      account: true,
      mediaFiles:       { where: { mediaType: 'video' } },
      metricsSnapshots: { orderBy: { fetchedAt: 'desc' }, take: 1 },
    },
  });

  console.log(`[AIv2] Found ${posts.length} video posts | language: ${language}`);
  let analyzed = 0, failed = 0;

  for (const post of posts) {
    try {
      const videoMedia = post.mediaFiles[0];
      if (!videoMedia?.storageKey) {
        console.log(`[AIv2] No video for post ${post.id}, skipping`);
        continue;
      }

      const localPath = `public${videoMedia.storageKey}`;
      const metrics   = post.metricsSnapshots[0];

      const postData = {
        username:    post.account.username,
        caption:     post.caption,
        duration:    post.videoDuration ? Number(post.videoDuration) : 0,
        views:       metrics?.videoViewCount  || 0,
        likes:       metrics?.likesCount      || 0,
        comments:    metrics?.commentsCount   || 0,
        er:          metrics?.engagementRate  ? Number(metrics.engagementRate) * 100 : 0,
        postedDate:  post.postedAt?.toISOString(),
        accountType: post.account.accountType,
      };

      console.log(`[AIv2] Analyzing post ${post.id} (${language})...`);
      const startTime = Date.now();

      // language === 'jp' → pakai service v2 (JP prompt + schema)
      // language === 'en' → pakai service lama (tetap bisa dipanggil dari sini)
      let analysis;
      if (language === 'jp') {
        analysis = await analyzeVideoJP({ localPath, postData });
      } else {
        // Import lazy dari file lama agar tidak circular dependency
        const { analyzeVideoWithGemini } = await import('./ai.service.js');
        analysis = await analyzeVideoWithGemini({ localPath, postData });
      }

      const durationMs = Date.now() - startTime;
      await saveAnalysisV2(post.id, post.accountId, analysis, { durationMs }, language);
      analyzed++;

    } catch (err) {
      console.error(`[AIv2] Failed post ${post.id}: ${err.message}`);
      failed++;
    }
  }

  return { total: posts.length, analyzed, failed };
}

// ─────────────────────────────────────────────────────────────
// 9. DB SAVE
//    Fix: upsert pakai where clause yang benar
// ─────────────────────────────────────────────────────────────

export async function saveAnalysisV2(postId, accountId, analysis, tokenMeta = {}, language = 'jp') {
  // fix: upsert lama tidak punya where clause → error Prisma
  // Pakai create dengan try-catch untuk handle duplicate jika perlu
  try {
    const table = language === 'jp'
      ? prisma.aiAnalysisHistory          // JP → tabel yang sama dengan lama
      : prisma.aiEnglishAnalysisHistory;  // EN → tabel English

    const record = await table.upsert({
      where:  { postId },               // ← fix: where clause yang hilang di service lama
      update: {
        status:                'completed',
        resultJson:            analysis,
        summary:               analysis.summary || null,
        provider:              AI_CONFIG.GEMINI_MODEL,
        estimatedInputTokens:  tokenMeta.inputTokens  || null,
        estimatedOutputTokens: tokenMeta.outputTokens || null,
        durationMs:            tokenMeta.durationMs   || null,
      },
      create: {
        accountId,
        postId,
        analysisType: 'video',
        status:       'completed',
        resultJson:   analysis,
        summary:      analysis.summary || null,
        provider:     AI_CONFIG.GEMINI_MODEL,
        estimatedInputTokens:  tokenMeta.inputTokens  || null,
        estimatedOutputTokens: tokenMeta.outputTokens || null,
        durationMs:            tokenMeta.durationMs   || null,
      },
    });

    console.log(`[AIv2] Saved analysis for post ${postId} | id: ${record.id}`);
    return record;
  } catch (err) {
    console.error(`[AIv2] DB save failed for post ${postId}: ${err.message}`);
    throw err;
  }
}