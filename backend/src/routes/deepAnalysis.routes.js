/**
 * Deep Analysis Routes
 * Endpoints for comprehensive three-phase analysis
 */

import { Router } from 'express';
import { runDeepAnalysis, getDeepAnalysisTokenStats } from '../services/deepAnalysis.service.js';
import { errorHandler } from '../middleware/error-handle.js';

const router = Router();

/**
 * POST /api/deep-analysis/run
 * Run complete three-phase deep analysis
 * 
 * Body:
 * - mainAccountId: string (required) - Main account UUID
 * - competitorIds: string[] (optional) - Competitor account UUIDs
 */
router.post('/run', async (req, res, next) => {
  try {
    const { mainAccountId, competitorIds = [] } = req.body;

    if (!mainAccountId) {
      return res.status(400).json({
        error: 'mainAccountId is required'
      });
    }

    console.log(`[API] POST /deep-analysis/run for account ${mainAccountId}`);
    
    const result = await runDeepAnalysis(mainAccountId, competitorIds);

    res.json({
      success: true,
      resultId: result.resultId,
      duration: result.duration,
      analysis: result.analysis,
      tokenStats: result.tokenStats
    });

  } catch (error) {
    console.error('[API] Error in /deep-analysis/run:', error.message);
    next(error);
  }
});

/**
 * GET /api/deep-analysis/token-stats
 * Get token usage statistics for deep analysis
 */
router.get('/token-stats', (req, res) => {
  try {
    const stats = getDeepAnalysisTokenStats();
    
    res.json({
      success: true,
      tokenStats: stats
    });

  } catch (error) {
    console.error('[API] Error in /deep-analysis/token-stats:', error.message);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * GET /api/deep-analysis/result/:id
 * Get deep analysis result by ID
 */
router.get('/result/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'Result ID is required'
      });
    }

    console.log(`[API] GET /deep-analysis/result/${id}`);

    // TODO: Implement database fetch
    // const result = await prisma.deepAnalysisResult.findUnique({
    //   where: { id },
    //   select: {
    //     id: true,
    //     accountId: true,
    //     competitorIds: true,
    //     phase1Result: true,
    //     phase2Result: true,
    //     phase3Result: true,
    //     createdAt: true
    //   }
    // });

    // if (!result) {
    //   return res.status(404).json({
    //     error: 'Analysis result not found'
    //   });
    // }

    res.json({
      success: true,
      message: 'Database fetch not yet implemented',
      resultId: id
    });

  } catch (error) {
    console.error('[API] Error in /deep-analysis/result:', error.message);
    next(error);
  }
});

// Error handling middleware
router.use(errorHandler);

export default router;
