/**
 * AI Analysis Routes
 * API endpoints for AI-powered content analysis
 */

import express from 'express';
import { analyzeVideoWithGemini, analyzeAllUserPosts, analyzeAllUserEnglishPosts, saveAnalysisToDatabase, saveEnglishAnalysisToDatabase, getTokenUsageStats, resetTokenUsageStats } from '../services/ai.service.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

/**
 * Note: Auth middleware disabled for testing
 * All endpoints use hardcoded test-user-id
 */

/**
 * POST /api/ai/analyze
 * Trigger AI analysis for all user's posts
 */
router.post('/analyze', async (req, res) => {
  try {
    const userId = 'test-user-id';

    console.log(`[AI] POST /analyze for user ${userId}`);

    // Create analysis job
    const fetchJob = await prisma.fetchJob.create({
      data: {
        userId,
        jobType: 'daily_update',
        status: 'running',
        apifyRunId: '',
        apifyDatasetId: ''
      }
    });

    res.status(202).json({
      success: true,
      message: 'AI analysis started',
      jobId: fetchJob.id
    });

    // Run analysis in background
    (async () => {
      try {
        console.log('[AI] Background: Starting analysis...');
        const result = await analyzeAllUserPosts(userId);
        console.log('[AI] Background: Analysis complete:', result);

        await prisma.fetchJob.update({
          where: { id: fetchJob.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            mediaDownloaded: result.analyzed,
            errorMessage: result.failed > 0 ? `${result.failed} posts failed` : null
          }
        });

        console.log(`[AI] ===== Analysis completed: ${result.analyzed}/${result.total} posts =====`);
      } catch (error) {
        console.error('[AI] Background error:', error.message);

        await prisma.fetchJob.update({
          where: { id: fetchJob.id },
          data: {
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date()
          }
        });
      }
    })();
  } catch (error) {
    console.error('[AI] Error starting analysis:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze/en', async (req, res) => {
  try {
    const userId = 'test-user-id';

    console.log(`[AI] POST /analyze in English for user ${userId}`);

    // Create analysis job
    const fetchJob = await prisma.fetchJob.create({
      data: {
        userId,
        jobType: 'daily_update',
        status: 'running',
        apifyRunId: '',
        apifyDatasetId: ''
      }
    });

    res.status(202).json({
      success: true,
      message: 'AI English analysis started',
      jobId: fetchJob.id
    });

    // Run analysis in background
    (async () => {
      try {
        console.log('[AI] Background: Starting english analysis...');
        const result = await analyzeAllUserEnglishPosts(userId);
        console.log('[AI] Background: Analysis complete:', result);

        await prisma.fetchJob.update({
          where: { id: fetchJob.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            mediaDownloaded: result.analyzed,
            errorMessage: result.failed > 0 ? `${result.failed} posts failed` : null
          }
        });

        console.log(`[AI] ===== English analysis completed: ${result.analyzed}/${result.total} posts =====`);
      } catch (error) {
        console.error('[AI] Background error:', error.message);

        await prisma.fetchJob.update({
          where: { id: fetchJob.id },
          data: {
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date()
          }
        });
      }
    })();
  } catch (error) {
    console.error('[AI] Error starting analysis:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/analyze/:postId
 * Analyze a single post by postId
 */
router.post('/analyze/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    // Get post from DB
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        account: true,
        mediaFiles: {
          where: { mediaType: 'video' }
        },
        metricsSnapshots: {
          orderBy: { fetchedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const videoMedia = post.mediaFiles[0];
    if (!videoMedia?.storageKey) {
      return res.status(400).json({ error: 'No video file found for this post' });
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
      }
    };

    console.log(`[AI] Starting single post analysis: ${postId}`);
    const startTime = Date.now();

    const analysis = await analyzeVideoWithGemini(videoData);
    const durationMs = Date.now() - startTime;

    const saved = await saveAnalysisToDatabase(post.id, post.accountId, analysis, { durationMs });

    res.json({
      success: true,
      postId,
      durationMs,
      analysisId: saved.id,
      analysis
    });

  } catch (error) {
    console.error('[AI] Error analyzing single post:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai/account/:accountId/analysis
 * Get AI analysis scores for all posts in an account
 */
// router.get('/account/:accountId/analysis', async (req, res) => {
//   try {
//     const accountId = req.params.accountId;
//     const limit = parseInt(req.query.limit) || 20;
//     const offset = parseInt(req.query.offset) || 0;

//     const analyses = await prisma.aiAnalysis.findMany({
//       where: {
//         post: {
//           accountId
//         }
//       },
//       include: {
//         post: {
//           select: {
//             id: true,
//             caption: true,
//             postedAt: true
//           }
//         }
//       },
//       orderBy: { analyzedAt: 'desc' },
//       skip: offset,
//       take: limit
//     });

//     // Calculate aggregate scores
//     const avgHook = analyses.reduce((sum, a) => sum + a.hookScore, 0) / analyses.length || 0;
//     const avgQuality = analyses.reduce((sum, a) => sum + a.productionQuality, 0) / analyses.length || 0;
//     const avgEngagement = analyses.reduce((sum, a) => sum + a.engagementPotential, 0) / analyses.length || 0;
//     const avgScore = analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length || 0;

//     res.json({
//       success: true,
//       account: {
//         id: accountId,
//         totalAnalyzed: analyses.length
//       },
//       aggregateScores: {
//         averageHookScore: parseFloat(avgHook.toFixed(2)),
//         averageProductionQuality: parseFloat(avgQuality.toFixed(2)),
//         averageEngagementPotential: parseFloat(avgEngagement.toFixed(2)),
//         averageOverallScore: parseFloat(avgScore.toFixed(2))
//       },
//       analyses: analyses.map(a => ({
//         postId: a.postId,
//         caption: a.post.caption?.substring(0, 100),
//         hookScore: a.hookScore,
//         productionQuality: a.productionQuality,
//         engagementPotential: a.engagementPotential,
//         overallScore: a.overallScore,
//         analyzedAt: a.analyzedAt
//       }))
//     });
//   } catch (error) {
//     console.error('[AI] Error fetching account analysis:', error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

router.get('/account/:accountId/analysis', async (req, res) => {
  try {
    const accountId = req.params.accountId;
    const limit     = parseInt(req.query.limit)  || 20;
    const offset    = parseInt(req.query.offset) || 0;

    const analyses = await prisma.aiAnalysisHistory.findMany({
    // const analyses = await prisma.aiEnglishAnalysisHistory.findMany({
      where: {
        accountId,
        status: 'completed',          // hanya yang berhasil
        postId:  { not: null },        // hanya analisis per-post (bukan deep/account)
        analysisType: { in: ['video', 'thumbnail'] }, // sesuaikan jika perlu
      },
      include: {
        post: {
          select: {
            id:       true,
            caption:  true,
            postedAt: true,
            postType: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip:   offset,
      take:   limit,
    });

    if (!analyses.length) {
      return res.json({
        success: true,
        account: { id: accountId, totalAnalyzed: 0 },
        aggregateScores: {
          averageHookScore:           0,
          averageProductionQuality:   0,
          averageEngagementPotential: 0,
          averageOverallScore:        0,
        },
        analyses: [],
      });
    }

    // ── Extract scores dari resultJson ──────────────────────────────────────
    // resultJson adalah field Json Prisma — sudah di-parse otomatis jadi object
    // Kita ambil scores dari dalam JSON Gemini kalau ada,
    // fallback ke field top-level di AiAnalysisHistory jika sudah disimpan terpisah.

    function extractScores(a) {
      // AiAnalysisHistory schema TIDAK punya kolom hookScore, productionQuality, dll.
      // Semua data ada di dalam resultJson (field Json Prisma).
      // Prisma otomatis parse Json → sudah berupa JS object.
      const rj = a.resultJson;

      const hookScore           = rj?.hookAnalysisDetailed?.overallHookScore
                                ?? rj?.overallAssessment?.overallScore
                                ?? 0;

      const productionQuality   = rj?.filmingMethodDetails?.overallProductionValue?.productionQualityScore
                                ?? rj?.specificEditingTechniques?.overallEditingScore
                                ?? rj?.overallAssessment?.contentQuality
                                ?? 0;

      const engagementPotential = rj?.overallAssessment?.engagementPotential
                                ?? rj?.erCorrelationAnalysis?.erScore
                                ?? 0;

      const overallScore        = rj?.overallAssessment?.overallScore
                                ?? 0;

      return { hookScore, productionQuality, engagementPotential, overallScore };
    }

    const scoredAnalyses = analyses.map(a => extractScores(a));

    const avg = (key) => {
      const vals = scoredAnalyses.map(s => s[key]).filter(v => v > 0);
      return vals.length ? parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2)) : 0;
    };

    res.json({
      success: true,
      account: {
        id:            accountId,
        totalAnalyzed: analyses.length,
      },
      aggregateScores: {
        averageHookScore:           avg('hookScore'),
        averageProductionQuality:   avg('productionQuality'),
        averageEngagementPotential: avg('engagementPotential'),
        averageOverallScore:        avg('overallScore'),
      },
      analyses: analyses.map((a, i) => {
        const scores = scoredAnalyses[i];
        return {
          postId:              a.postId,
          caption:             a.post?.caption?.substring(0, 150) ?? null,
          postType:            a.post?.postType ?? null,
          postedAt:            a.post?.postedAt ?? null,

          // Scores (top-level untuk chart & ranking)
          hookScore:           scores.hookScore,
          productionQuality:   scores.productionQuality,
          engagementPotential: scores.engagementPotential,
          overallScore:        scores.overallScore,

          analyzedAt:          a.createdAt,
          analysisType:        a.analysisType,
          durationMs:          a.durationMs ?? null,

          // ── INI YANG PENTING: sertakan resultJson lengkap ──────────────────
          // Frontend akan parse field-field berikut dari sini:
          //   pacingRhythm, hookAnalysisDetailed, retentionPrediction,
          //   top3ActionableRecommendations, erCorrelationAnalysis,
          //   videoStructureAnalysis, specificEditingTechniques,
          //   soundDesignAnalysis, filmingMethodDetails,
          //   themeIdentification, visualExpressionTechniques,
          //   captionOverlayAnalysis, competitiveGapAnalysis,
          //   overallAssessment, summary
          resultJson: a.resultJson ?? null,
        };
      }),
    });

  } catch (error) {
    console.error('[AI] Error fetching account analysis:', error.message);
    res.status(500).json({ error: error.message });
  }
});
export default router;
