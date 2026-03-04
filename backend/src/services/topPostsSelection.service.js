/**
 * Top Posts Selection Service
 * Utilities for selecting and ranking posts by engagement
 */

import prisma from '../lib/prisma.js';
import { computePostMetrics } from './metricsCalculation.service.js';

/**
 * Get top N posts by Engagement Rate
 */
export async function getTopPostsByER(accountId, limit = 3) {
  try {
    const posts = await prisma.post.findMany({
      where: { accountId },
      include: {
        metricsSnapshots: {
          orderBy: { fetchedAt: 'desc' },
          take: 1
        },
        hashtags: true
      },
      orderBy: {
        metricsSnapshots: {
          _count: 'desc'
        }
      },
      take: limit
    });

    // Compute metrics for each post
    return posts.map(post => ({
      ...post,
      calculatedMetrics: computePostMetrics(post.metricsSnapshots[0] || {})
    }));
  } catch (error) {
    console.error(`[POSTS] Error getting top posts by ER for ${accountId}:`, error.message);
    return [];
  }
}

/**
 * Get latest post
 */
export async function getLatestPost(accountId) {
  try {
    const post = await prisma.post.findFirst({
      where: { accountId },
      include: {
        metricsSnapshots: {
          orderBy: { fetchedAt: 'desc' },
          take: 1
        },
        hashtags: true
      },
      orderBy: { lastUpdatedAt: 'desc' },
      take: 1
    });

    if (!post) return null;

    return {
      ...post,
      calculatedMetrics: computePostMetrics(post.metricsSnapshots[0] || {})
    };
  } catch (error) {
    console.error(`[POSTS] Error getting latest post for ${accountId}:`, error.message);
    return null;
  }
}

/**
 * Get posts in date range
 */
export async function getPostsInDateRange(accountId, startDate, endDate, limit = 10) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        accountId,
        postedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        metricsSnapshots: {
          orderBy: { fetchedAt: 'desc' },
          take: 1
        },
        hashtags: true
      },
      orderBy: { postedAt: 'desc' },
      take: limit
    });

    // Compute metrics for each post
    return posts.map(post => ({
      ...post,
      calculatedMetrics: computePostMetrics(post.metricsSnapshots[0] || {})
    }));
  } catch (error) {
    console.error(`[POSTS] Error getting posts in date range:`, error.message);
    return [];
  }
}

export default {
  getTopPostsByER,
  getLatestPost,
  getPostsInDateRange
};
