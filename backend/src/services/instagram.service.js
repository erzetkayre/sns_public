/**
 * Instagram Data Processing Service
 * Handles transformation and storage of Instagram data to database
 */

import prisma from '../lib/prisma.js';
import { IG_CONFIG } from '../../test/ig.config.js';

/**
 * Extract engagement metrics from raw post data
 */
function extractMetrics(post) {
  return {
    likes: post.likesCount ?? post.likeCount ?? 0,
    comments: post.commentsCount ?? post.commentCount ?? 0,
    shares: post.shareCount ?? post.shares ?? 0,
    saves: post.savedCount ?? post.saves ?? 0,
    views: post.videoViewCount ?? post.viewCount ?? 0,
    plays: post.videoPlayCount ?? post.playCount ?? 0
  };
}

/**
 * Determine post type from raw data
 */
function mapPostType(post) {
  const type = post.type || post.productType || '';
  if (type === 'Video' || type === 'clips' || type === 'Reel') return 'Video';
  if (type === 'Image') return 'Image';
  if (type === 'Sidecar') return 'Sidecar';
  return 'Image'; // default
}

/**
 * Determine account type (main or competitor)
 */
function mapAccountType(username) {
  return username === IG_CONFIG.ACCOUNTS.MAIN ? 'main' : 'competitor';
}

/**
 * Process and save/update watched accounts
 */
export async function processAndSaveAccounts(rawData, userId = 'test-user-001') {
  // Ensure test user exists if using default
  if (userId === 'test-user-001') {
    try {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: 'test@example.com',
          emailVerified: true,
          name: 'Test User'
        }
      });
    } catch (error) {
      console.warn('[IG] Could not ensure test user exists:', error.message);
    }
  }

  const accountsMap = new Map();

  // Group data by account
  rawData.forEach(post => {
    if (!post.ownerUsername) return;

    const username = post.ownerUsername;
    if (!accountsMap.has(username)) {
      accountsMap.set(username, {
        username,
        fullName: post.ownerFullName || post.owner?.full_name || '',
        followers: 0,
        posts: []
      });
    }

    // Update followers count (use latest value)
    const followers = post.followersCount ?? post.owner?.followersCount ?? post.owner?.followers_count ?? 0;
    if (followers > accountsMap.get(username).followers) {
      accountsMap.get(username).followers = followers;
    }

    accountsMap.get(username).posts.push(post);
  });

  const savedAccounts = [];

  for (const [username, accountData] of accountsMap.entries()) {
    try {
      const accountType = mapAccountType(username);

      const account = await prisma.watchedAccount.upsert({
        where: { userId_igUserId: { userId, igUserId: username } },
        update: {
          fullName: accountData.fullName,
          followersCount: accountData.followers,
          postsCount: accountData.posts.length,
          followersFetchedAt: new Date()
        },
        create: {
          userId,
          igUserId: username,
          username,
          fullName: accountData.fullName,
          accountType,
          followersCount: accountData.followers,
          postsCount: accountData.posts.length,
          followersFetchedAt: new Date()
        }
      });

      // Save follower history
      await prisma.followerHistory.create({
        data: {
          accountId: account.id,
          followersCount: accountData.followers,
          followingCount: 0,
          recordedAt: new Date()
        }
      });

      savedAccounts.push(account);
      console.log(`[IG] Saved account: ${username} (${accountData.followers} followers)`);
    } catch (error) {
      console.error(`[IG] ERROR saving account ${username}:`, error.message);
      if (error.meta) console.error(`[IG] Database error details:`, error.meta);
    }
  }

  return savedAccounts;
}

/**
 * Process and save/update posts with media and metrics
 */
export async function processAndSavePosts(rawData, accountsMap) {
  let postsCreated = 0;
  let postsUpdated = 0;
  let mediaCreated = 0;

  for (const post of rawData) {
    if (!post.id || !post.ownerUsername) continue;

    const account = accountsMap.get(post.ownerUsername);
    if (!account) continue;

    try {
      const metrics = extractMetrics(post);
      const postType = mapPostType(post);
      const postedAt = new Date(post.timestamp || post.taken_at || Date.now());

      // Extract hashtags from caption
      const hashtags = extractHashtags(post.caption || '');
      const mentions = extractMentions(post.caption || '');

      // Check if post already exists
      const existingPost = await prisma.post.findUnique({
        where: { accountId_igPostId: { accountId: account.id, igPostId: post.id } }
      });

      const isNewPost = !existingPost;

      // Upsert post
      const savedPost = await prisma.post.upsert({
        where: { accountId_igPostId: { accountId: account.id, igPostId: post.id } },
        update: {
          caption: (post.caption || '').substring(0, 2200),
          url: post.url,
          isPinned: post.pinned || false,
          isCommentsDisabled: post.isCommentsDisabled || false,
          isSponsored: post.isSponsored || false,
          displayUrl: post.displayUrl || post.display_url || '',
          videoUrl: post.videoUrl || post.video_url || '',
          videoDuration: post.videoDuration ? parseFloat(post.videoDuration) : null,
          dimensionsHeight: post.dimensionsHeight || null,
          dimensionsWidth: post.dimensionsWidth || null,
          locationName: post.locationName || post.location?.name || null,
          locationId: post.locationId || null,
          musicArtist: post.musicInfo?.artist_name || null,
          musicSong: post.musicInfo?.song_name || null,
          musicAudioId: post.musicInfo?.audio_id || null,
          usesOriginalAudio: post.musicInfo?.uses_original_audio || false,
          lastUpdatedAt: new Date()
        },
        create: {
          accountId: account.id,
          igPostId: post.id,
          shortCode: post.shortCode || post.code || '',
          postType,
          caption: (post.caption || '').substring(0, 2200),
          url: post.url,
          isPinned: post.pinned || false,
          isCommentsDisabled: post.isCommentsDisabled || false,
          isSponsored: post.isSponsored || false,
          displayUrl: post.displayUrl || post.display_url || '',
          videoUrl: post.videoUrl || post.video_url || '',
          videoDuration: post.videoDuration ? parseFloat(post.videoDuration) : null,
          dimensionsHeight: post.dimensionsHeight || null,
          dimensionsWidth: post.dimensionsWidth || null,
          locationName: post.locationName || post.location?.name || null,
          locationId: post.locationId || null,
          musicArtist: post.musicInfo?.artist_name || null,
          musicSong: post.musicInfo?.song_name || null,
          musicAudioId: post.musicInfo?.audio_id || null,
          usesOriginalAudio: post.musicInfo?.uses_original_audio || false,
          postedAt,
          productType: post.productType || ''
        }
      });

      // Track creation vs update
      if (isNewPost) {
        postsCreated++;
      } else {
        postsUpdated++;
      }

      // Save metrics snapshot
      try {
        console.log(`[IG] Saving metrics for post ${post.id}:`, JSON.stringify(metrics));
        await prisma.postMetricsSnapshot.create({
          data: {
            postId: savedPost.id,
            likesCount: metrics.likes >= 0 ? metrics.likes : 0,
            commentsCount: metrics.comments,
            videoViewCount: metrics.views,
            videoPlayCount: metrics.plays,
            fetchedAt: new Date()
            // shareCount and savedCount will be added in next migration
          }
        });
        console.log(`[IG] ✅ Metrics saved for post ${post.id}`);
      } catch (metricsError) {
        console.error(`[IG] ERROR saving metrics for post ${post.id}:`, metricsError.message);
        throw metricsError;
      }

      // Save hashtags
      if (hashtags.length > 0) {
        for (const tag of hashtags) {
          try {
            const hashtag = await prisma.hashtag.upsert({
              where: { tag },
              update: {},
              create: { tag }
            });

            await prisma.postHashtag.upsert({
              where: { postId_hashtagId: { postId: savedPost.id, hashtagId: hashtag.id } },
              update: {},
              create: { postId: savedPost.id, hashtagId: hashtag.id }
            });
          } catch (error) {
            console.warn(`[IG] Error saving hashtag "${tag}":`, error.message);
          }
        }
      }

      // Save mentions
      if (mentions.length > 0) {
        for (const username of mentions) {
          try {
            await prisma.postMention.upsert({
              where: { postId_username: { postId: savedPost.id, username } },
              update: {},
              create: { postId: savedPost.id, username }
            });
          } catch (error) {
            console.warn(`[IG] Error saving mention "@${username}":`, error.message);
          }
        }
      }

      // Save media files (carousel items, thumbnails, videos)
      if (post.displayUrl) {
        await saveMediaFile(savedPost.id, post.displayUrl, 'thumbnail', 0);
        mediaCreated++;
      }

      if (post.videoUrl) {
        await saveMediaFile(savedPost.id, post.videoUrl, 'video', 0);
        mediaCreated++;
      }

      // Handle carousel images
      if (Array.isArray(post.imageUrls)) {
        for (let i = 0; i < post.imageUrls.length; i++) {
          await saveMediaFile(savedPost.id, post.imageUrls[i], 'carousel_image', i);
          mediaCreated++;
        }
      }
    } catch (error) {
      console.error(`[IG] Error saving post ${post.id}:`, error.message);
    }
  }

  return { postsCreated, postsUpdated, mediaCreated };
}

/**
 * Save media file record
 */
async function saveMediaFile(postId, url, mediaType, position) {
  try {
    if (!url) return;

    // Check if already exists
    const existing = await prisma.mediaFile.findFirst({
      where: {
        postId,
        position,
        mediaType
      }
    });

    if (existing) {
      // Update existing
      await prisma.mediaFile.update({
        where: { id: existing.id },
        data: { originalUrl: url }
      });
    } else {
      // Create new
      await prisma.mediaFile.create({
        data: {
          postId,
          mediaType,
          position,
          originalUrl: url,
          mimeType: 'image/jpeg' // Default, would be updated if we download
        }
      });
    }
  } catch (error) {
    console.warn(`[IG] Error saving media file:`, error.message);
  }
}

/**
 * Extract hashtags from caption
 */
function extractHashtags(caption) {
  if (!caption) return [];
  const matches = caption.match(/#[\w]+/g) || [];
  return matches.map(tag => tag.replace('#', '').toLowerCase()).filter(tag => tag.length > 0);
}

/**
 * Extract mentions from caption
 */
function extractMentions(caption) {
  if (!caption) return [];
  const matches = caption.match(/@[\w.]+/g) || [];
  return matches.map(mention => mention.replace('@', '').toLowerCase()).filter(mention => mention.length > 0);
}

/**
 * Get all accounts for a user
 */
export async function getUserAccounts(userId) {
  return prisma.watchedAccount.findMany({
    where: { userId },
    include: {
      posts: { select: { id: true } },
      followerHistory: { orderBy: { recordedAt: 'desc' }, take: 2 }
    }
  });
}
