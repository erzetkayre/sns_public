/**
 * Instagram Scraping Routes
 * API endpoints for managing Instagram account scraping
 */

import express from 'express';
import { IG_CONFIG } from '../../test/ig.config.js';
import { startApifyRun, waitForActorToFinish, fetchApifyData } from '../services/apify.service.js';
import { processAndSaveAccounts, processAndSavePosts, getUserAccounts } from '../services/instagram.service.js';
import { downloadUserMedia, downloadPostMedia, getMediaPath } from '../services/media.service.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

/**
 * Middleware to extract userId from request
 * DISABLED FOR TESTING - will use default test user
 */
function extractUserId(req, res, next) {
  // Use test user ID by default
  req.userId = 'test-user-id';
  next();
}

router.use(extractUserId);

/**
 * GET /api/ig/debug/raw
 * Debug endpoint - fetch raw Apify data without saving
 */
router.get('/debug/raw', async (req, res) => {
  try {
    console.log('[IG] DEBUG: Fetching raw Apify data...');

    const accountUsernames = [IG_CONFIG.ACCOUNTS.MAIN, ...IG_CONFIG.ACCOUNTS.COMPETITORS];
    console.log(`[IG] DEBUG: Accounts: ${accountUsernames.join(', ')}`);

    // Start run
    const { runId, datasetId } = await startApifyRun(accountUsernames);
    console.log(`[IG] DEBUG: Run ${runId} started`);

    // Wait
    await waitForActorToFinish(runId);
    console.log(`[IG] DEBUG: Run completed`);

    // Fetch
    const rawData = await fetchApifyData(datasetId);
    console.log(`[IG] DEBUG: Fetched ${rawData.length} items`);

    // Return only first 2 items with full structure for inspection
    const sample = rawData.slice(0, 2).map(post => ({
      id: post.id,
      ownerUsername: post.ownerUsername,
      type: post.type,
      productType: post.productType,
      timestamp: post.timestamp,
      taken_at: post.taken_at,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      videoViewCount: post.videoViewCount,
      videoPlayCount: post.videoPlayCount,
      followersCount: post.followersCount,
      ownerFollowersCount: post.ownerFollowersCount,
      owner: post.owner,
      caption: (post.caption || '').substring(0, 200),
      hashtags: post.hashtags,
      displayUrl: post.displayUrl,
      display_url: post.display_url,
      videoUrl: post.videoUrl,
      video_url: post.video_url,
      videoDuration: post.videoDuration,
      shortCode: post.shortCode,
      code: post.code,
      url: post.url,
      _allKeys: Object.keys(post).sort()
    }));

    res.json({
      success: true,
      totalInDataset: rawData.length,
      samplePosts: sample
    });
  } catch (error) {
    console.error('[IG] DEBUG ERROR:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/ig/test
 * Test endpoint to verify Apify connection and data flow
 */
router.get('/test', async (req, res) => {
  try {
    console.log('[IG] TEST: Starting test sequence...');

    const accountUsernames = [IG_CONFIG.ACCOUNTS.MAIN, ...IG_CONFIG.ACCOUNTS.COMPETITORS];
    console.log(`[IG] TEST: Testing with accounts: ${accountUsernames.join(', ')}`);

    // Test 1: Start Apify run
    console.log('[IG] TEST: Starting Apify run...');
    const { runId, datasetId } = await startApifyRun(accountUsernames);
    console.log(`[IG] TEST: Apify runId: ${runId}`);
    console.log(`[IG] TEST: Apify datasetId: ${datasetId}`);

    // Test 2: Wait for completion
    console.log('[IG] TEST: Waiting for Apify to complete...');
    await waitForActorToFinish(runId);
    console.log('[IG] TEST: Apify completed successfully');

    // Test 3: Fetch data
    console.log('[IG] TEST: Fetching data from dataset...');
    const rawData = await fetchApifyData(datasetId);
    console.log(`[IG] TEST: Fetched ${rawData.length} items from Apify`);

    if (rawData.length > 0) {
      const sample = rawData[0];
      console.log('[IG] TEST: Sample post structure:');
      console.log(`  - id: ${sample.id}`);
      console.log(`  - ownerUsername: ${sample.ownerUsername}`);
      console.log(`  - type: ${sample.type}`);
      console.log(`  - caption: ${(sample.caption || '').substring(0, 100)}...`);
      console.log(`  - likesCount: ${sample.likesCount}`);
      console.log(`  - commentsCount: ${sample.commentsCount}`);
      console.log(`  - followersCount: ${sample.followersCount}`);
    }

    // Test 4: Filter valid posts
    const validPosts = rawData.filter(item => !item.error && item.id);
    console.log(`[IG] TEST: Valid posts: ${validPosts.length}`);

    // Test 5: Process accounts
    console.log('[IG] TEST: Processing accounts...');
    const savedAccounts = await processAndSaveAccounts(validPosts, req.userId);
    console.log(`[IG] TEST: Saved accounts: ${savedAccounts.length}`);
    savedAccounts.forEach(acc => {
      console.log(`  - ${acc.username} (${acc.followersCount} followers, ID: ${acc.id})`);
    });

    // Test 6: Process posts
    const accountsMap = new Map(savedAccounts.map(acc => [acc.username, acc]));
    console.log('[IG] TEST: Processing posts...');
    const stats = await processAndSavePosts(validPosts, accountsMap);
    console.log(`[IG] TEST: Post stats:`);
    console.log(`  - Created: ${stats.postsCreated}`);
    console.log(`  - Updated: ${stats.postsUpdated}`);
    console.log(`  - Media: ${stats.mediaCreated}`);

    // Test 7: Verify in database
    console.log('[IG] TEST: Verifying database...');
    const dbAccounts = await prisma.watchedAccount.findMany({
      where: { userId: req.userId },
      include: { posts: true, followerHistory: true }
    });
    console.log(`[IG] TEST: DB accounts: ${dbAccounts.length}`);
    dbAccounts.forEach(acc => {
      console.log(`  - ${acc.username}: ${acc.posts.length} posts, history: ${acc.followerHistory.length}`);
    });

    res.json({
      success: true,
      message: 'Test completed successfully',
      test: {
        apifyRunId: runId,
        apifyDatasetId: datasetId,
        rawDataCount: rawData.length,
        validPostsCount: validPosts.length,
        savedAccountsCount: savedAccounts.length,
        postStats: stats,
        dbAccountsCount: dbAccounts.length
      }
    });
  } catch (error) {
    console.error('[IG] TEST ERROR:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

/**
 * POST /api/ig/scrape
 * Start a new Instagram scraping job
 */
router.post('/scrape', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const accountUsernames = [IG_CONFIG.ACCOUNTS.MAIN, ...IG_CONFIG.ACCOUNTS.COMPETITORS];

    console.log(`[IG] Starting scrape for ${accountUsernames.length} accounts...`);

    // Create fetch job record
    const fetchJob = await prisma.fetchJob.create({
      data: {
        userId,
        jobType: 'daily_update',
        status: 'running',
        apifyRunId: '', // Will be updated
        apifyDatasetId: ''
      }
    });

    res.status(202).json({
      success: true,
      message: 'Scraping job started',
      jobId: fetchJob.id
    });

    // Run scraping in background
    (async () => {
      try {
        // Start Apify run
        const { runId, datasetId } = await startApifyRun(accountUsernames);

        // Update job with run IDs
        await prisma.fetchJob.update({
          where: { id: fetchJob.id },
          data: {
            apifyRunId: runId,
            apifyDatasetId: datasetId
          }
        });

        console.log(`[IG] Apify run started: ${runId}`);

        // Wait for completion
        await waitForActorToFinish(runId);

        // Fetch raw data
        const rawData = await fetchApifyData(datasetId);
        console.log(`[IG] Fetched ${rawData.length} items from Apify`);

        // Filter valid posts
        const validPosts = rawData.filter(item => !item.error && item.id);

        // Process accounts
        const savedAccounts = await processAndSaveAccounts(validPosts, userId);

        // Create account map for post saving
        const accountsMap = new Map(savedAccounts.map(acc => [acc.username, acc]));

        // Process posts
        const postStats = await processAndSavePosts(validPosts, accountsMap);

        // Update job to completed
        await prisma.fetchJob.update({
          where: { id: fetchJob.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            postsCreated: postStats.postsCreated,
            postsUpdated: postStats.postsUpdated,
            mediaDownloaded: postStats.mediaCreated,
            accountsFetched: savedAccounts.map(a => a.username)
          }
        });

        console.log(`[IG] Scraping completed: ${postStats.postsCreated} posts created, ${postStats.postsUpdated} updated`);
      } catch (error) {
        console.error('[IG] Scraping error:', error.message);

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
    console.error('[IG] Error starting scrape:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ig/job/:jobId
 * Get scraping job status
 */
router.get('/job/:jobId', async (req, res) => {
  try {
    const job = await prisma.fetchJob.findUnique({
      where: { id: req.params.jobId },
      include: { accountMetricsSnapshots: true }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      id: job.id,
      status: job.status,
      jobType: job.jobType,
      accountsFetched: job.accountsFetched,
      postsCreated: job.postsCreated,
      postsUpdated: job.postsUpdated,
      mediaDownloaded: job.mediaDownloaded,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      errorMessage: job.errorMessage
    });
  } catch (error) {
    console.error('[IG] Error fetching job:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ig/accounts
 * Get all watched accounts for user
 */
router.get('/accounts', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const accounts = await getUserAccounts(userId);

    res.json({
      success: true,
      accounts: accounts.map(acc => ({
        id: acc.id,
        username: acc.username,
        fullName: acc.fullName,
        accountType: acc.accountType,
        followersCount: acc.followersCount,
        isVerified: acc.isVerified,
        postCount: acc.posts.length,
        lastChecked: acc.followersFetchedAt,
        followerHistory: acc.followerHistory.map(h => ({
          followers: h.followersCount,
          recordedAt: h.recordedAt
        }))
      }))
    });
  } catch (error) {
    console.error('[IG] Error fetching accounts:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ig/accounts/:accountId/posts
 * Get posts for specific account
 */
router.get('/accounts/:accountId/posts', async (req, res) => {
  try {
    const accountId = req.params.accountId;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const account = await prisma.watchedAccount.findUnique({
      where: { id: accountId },
      include: {
        posts: {
          include: {
            metricsSnapshots: { orderBy: { fetchedAt: 'desc' }, take: 1 },
            mediaFiles: true,
            hashtags: { include: { hashtag: true } }
          },
          orderBy: { postedAt: 'desc' },
          skip: offset,
          take: limit
        }
      }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      success: true,
      account: {
        id: account.id,
        username: account.username,
        followers: account.followersCount
      },
      posts: account.posts.map(post => ({
        id: post.id,
        igPostId: post.igPostId,
        type: post.postType,
        caption: post.caption,
        url: post.url,
        postedAt: post.postedAt,
        displayUrl: post.displayUrl,
        videoUrl: post.videoUrl,
        metrics: post.metricsSnapshots[0] ? {
          likes: post.metricsSnapshots[0].likesCount,
          comments: post.metricsSnapshots[0].commentsCount,
          views: post.metricsSnapshots[0].videoViewCount
        } : null,
        media: post.mediaFiles.map(m => ({
          type: m.mediaType,
          url: m.originalUrl
        })),
        hashtags: post.hashtags.map(h => h.hashtag.tag)
      }))
    });
  } catch (error) {
    console.error('[IG] Error fetching posts:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ig/media/download
 * Download all media files (photos/videos) for user's posts
 */
router.post('/media/download', async (req, res) => {
  try {
    console.log('[IG] ===== POST /media/download START =====');
    const userId = req.userId;
    console.log('[IG] userId extracted:', userId);

    if (!userId) {
      console.log('[IG] No userId!');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log(`[IG] Creating fetch job for user ${userId}...`);

    // Create a job record
    const fetchJob = await prisma.fetchJob.create({
      data: {
        userId,
        jobType: 'daily_update',
        status: 'running',
        apifyRunId: '',
        apifyDatasetId: ''
      }
    });

    console.log('[IG] Fetch job created with ID:', fetchJob.id);

    res.status(202).json({
      success: true,
      message: 'Media download started',
      jobId: fetchJob.id
    });

    // Run download in background
    (async () => {
      try {
        console.log('[IG] Background: Starting downloadUserMedia...');
        const result = await downloadUserMedia(userId);
        console.log('[IG] Background: Download completed:', result);

        await prisma.fetchJob.update({
          where: { id: fetchJob.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            mediaDownloaded: result.downloaded,
            errorMessage: result.downloaded === result.total ? null : `Downloaded ${result.downloaded}/${result.total}`
          }
        });

        console.log(`[IG] ===== Media download completed: ${result.downloaded}/${result.total} files =====`);
      } catch (error) {
        console.error('[IG] ===== Background error =====');
        console.error('[IG] Error message:', error.message);
        console.error('[IG] Error stack:', error.stack);

        try {
          await prisma.fetchJob.update({
            where: { id: fetchJob.id },
            data: {
              status: 'failed',
              errorMessage: error.message,
              completedAt: new Date()
            }
          });
        } catch (updateError) {
          console.error('[IG] Failed to update job:', updateError.message);
        }
      }
    })();
  } catch (error) {
    console.error('[IG] ===== Sync error in /media/download =====');
    console.error('[IG] Error message:', error.message);
    console.error('[IG] Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ig/posts/:postId/media/download
 * Download media for specific post
 */
router.post('/posts/:postId/media/download', async (req, res) => {
  try {
    const postId = req.params.postId;

    console.log(`[IG] Downloading media for post ${postId}...`);

    const downloaded = await downloadPostMedia(postId);

    res.json({
      success: true,
      message: `Downloaded ${downloaded} media files`,
      filesDownloaded: downloaded
    });
  } catch (error) {
    console.error('[IG] Error downloading post media:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ig/media/:mediaId
 * Get media file information - MUST BE LAST (wildcard route)
 */
router.get('/media/:mediaId', async (req, res) => {
  try {
    const mediaId = req.params.mediaId;

    const mediaInfo = await getMediaPath(mediaId);

    res.json({
      success: true,
      media: {
        localPath: mediaInfo.localPath,
        originalUrl: mediaInfo.originalUrl,
        mediaType: mediaInfo.mediaType,
        fileSize: mediaInfo.fileSize
      }
    });
  } catch (error) {
    console.error('[IG] Error fetching media:', error.message);
    res.status(404).json({ error: error.message });
  }
});

export default router;
