/**
 * ai.routes.v2.js
 * ─────────────────────────────────────────────────────────────
 * Routes BARU untuk endpoint JP.
 * File lama (ai.routes.js) TIDAK disentuh.
 *
 * Cara daftarkan di app.js:
 *
 *   import aiRoutesV2 from './routes/ai.routes.v2.js';
 *   app.use('/api/ai/v2', aiRoutesV2);
 *
 * Endpoint yang tersedia di file ini:
 *   POST /api/ai/v2/analyze/jp           → semua post user, JP prompt + schema
 *   POST /api/ai/v2/analyze/jp/:postId   → satu post, JP prompt + schema
 *   GET  /api/ai/v2/account/:id/analysis → ambil hasil (reuse dari lama)
 *
 * Endpoint lama (dari ai.routes.js) tetap hidup di /api/ai/*
 * ─────────────────────────────────────────────────────────────
 */

import express from 'express';
import prisma from '../lib/prisma.js';
import {
  analyzeVideoJP,
  analyzeAllUserPostsV2,
  saveAnalysisV2,
  getTokenUsageStats,
  resetTokenUsageStats,
} from '../services/ai.service.v2.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// POST /api/ai/v2/analyze/jp
// Trigger analisis semua post user dengan prompt Jepang
// ─────────────────────────────────────────────────────────────
router.post('/analyze/jp', async (req, res) => {
  try {
    const userId = 'test-user-id'; // ganti dengan req.user.id saat auth aktif

    console.log(`[AIv2] POST /analyze/jp for user: ${userId}`);

    const fetchJob = await prisma.fetchJob.create({
      data: {
        userId,
        jobType:        'daily_update',
        status:         'running',
        apifyRunId:     '',
        apifyDatasetId: '',
      },
    });

    // Response langsung 202 — analisis jalan di background
    res.status(202).json({
      success:  true,
      message:  'AI analysis (JP) started in background',
      jobId:    fetchJob.id,
      language: 'jp',
    });

    // Background process
    (async () => {
      try {
        console.log('[AIv2] Background: Starting JP analysis...');
        const result = await analyzeAllUserPostsV2(userId, 'jp');
        console.log('[AIv2] Background: JP analysis complete:', result);

        await prisma.fetchJob.update({
          where: { id: fetchJob.id },
          data: {
            status:         'completed',
            completedAt:    new Date(),
            mediaDownloaded: result.analyzed,
            errorMessage:   result.failed > 0 ? `${result.failed} posts failed` : null,
          },
        });
      } catch (err) {
        console.error('[AIv2] Background error:', err.message);
        await prisma.fetchJob.update({
          where: { id: fetchJob.id },
          data: {
            status:       'failed',
            errorMessage: err.message,
            completedAt:  new Date(),
          },
        });
      }
    })();

  } catch (err) {
    console.error('[AIv2] Error starting JP analysis:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/ai/v2/analyze/jp/:postId
// Analisis satu post dengan prompt Jepang — untuk testing cepat
// ─────────────────────────────────────────────────────────────
router.post('/analyze/jp/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where:   { id: postId },
      include: {
        account:          true,
        mediaFiles:       { where: { mediaType: 'video' } },
        metricsSnapshots: { orderBy: { fetchedAt: 'desc' }, take: 1 },
      },
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const videoMedia = post.mediaFiles[0];
    if (!videoMedia?.storageKey) {
      return res.status(400).json({ success: false, error: 'No video file for this post' });
    }

    const localPath = `public${videoMedia.storageKey}`;
    const metrics   = post.metricsSnapshots[0];

    const videoData = {
      localPath,
      postData: {
        username:    post.account.username,
        caption:     post.caption,
        duration:    post.videoDuration ? Number(post.videoDuration) : 0,
        views:       metrics?.videoViewCount || 0,
        likes:       metrics?.likesCount     || 0,
        comments:    metrics?.commentsCount  || 0,
        er:          metrics?.engagementRate ? Number(metrics.engagementRate) * 100 : 0,
        postedDate:  post.postedAt?.toISOString(),
        accountType: post.account.accountType,
      },
    };

    console.log(`[AIv2] Single post JP analysis: ${postId}`);
    const startTime = Date.now();
    const analysis  = await analyzeVideoJP(videoData);
    const durationMs = Date.now() - startTime;

    const saved = await saveAnalysisV2(post.id, post.accountId, analysis, { durationMs }, 'jp');

    res.json({
      success:    true,
      postId,
      language:   'jp',
      durationMs,
      analysisId: saved.id,
      analysis,           // ← full result, berguna untuk debugging prompt
    });

  } catch (err) {
    console.error('[AIv2] Single post error:', err.message);

    // Error codes yang bisa di-handle di FE
    const statusMap = {
      GEMINI_MAX_TOKENS:         503,
      GEMINI_SAFETY_BLOCK:       400,
      GEMINI_EMPTY_RESPONSE:     502,
      GEMINI_UNPARSEABLE_RESPONSE: 502,
      GEMINI_NO_CANDIDATES:      502,
    };
    const status = statusMap[err.message] ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/ai/v2/jobs/:jobId
// Cek status background job
// ─────────────────────────────────────────────────────────────
router.get('/jobs/:jobId', async (req, res) => {
  try {
    const job = await prisma.fetchJob.findUnique({
      where: { id: req.params.jobId },
      select: {
        id:             true,
        status:         true,
        mediaDownloaded: true,
        errorMessage:   true,
        completedAt:    true,
        createdAt:      true,
      },
    });

    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/ai/v2/tokens
// Cek penggunaan token Gemini (monitoring)
// ─────────────────────────────────────────────────────────────
router.get('/tokens', (req, res) => {
  res.json({ success: true, stats: getTokenUsageStats() });
});

router.delete('/tokens', (req, res) => {
  resetTokenUsageStats();
  res.json({ success: true, message: 'Token stats reset' });
});

export default router;