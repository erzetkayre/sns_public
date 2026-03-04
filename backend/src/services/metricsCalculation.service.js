/**
 * Metrics Calculation Service
 * Utility functions for calculating post and account metrics
 */

/**
 * Calculate Engagement Rate
 * ER = (Likes + Comments + Shares) / Views * 100
 */
export function calculateEngagementRate(likeCount = 0, commentCount = 0, shareCount = 0, viewCount = 0) {
  if (viewCount === 0) return 0;
  
  const engagements = likeCount + commentCount + shareCount;
  const er = (engagements / viewCount) * 100;
  
  return Math.round(er * 100) / 100; // Round to 2 decimals
}

/**
 * Compute metrics from PostMetricsSnapshot
 * Converts snapshot data to calculatedMetrics format
 */
export function computePostMetrics(snapshot) {
  if (!snapshot || !snapshot.id) {
    // Return empty metrics if no snapshot
    return {
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      plays: 0,
      saves: 0,
      er: 0,
      likeRate: 0,
      commentRate: 0,
      shareRate: 0,
      saveRate: 0,
      playRate: 0,
      avgEngagementValue: 0
    };
  }

  const likes = snapshot.likesCount || 0;
  const comments = snapshot.commentsCount || 0;
  const shares = snapshot.shareCount || 0;
  const saves = snapshot.savedCount || 0;
  const views = snapshot.videoViewCount || 0;
  const plays = snapshot.videoPlayCount || 0;

  return {
    likes,
    comments,
    shares,
    views,
    plays,
    saves,
    er: calculateEngagementRate(likes, comments, shares, views),
    likeRate: views > 0 ? parseFloat(((likes / views) * 100).toFixed(2)) : 0,
    commentRate: views > 0 ? parseFloat(((comments / views) * 100).toFixed(2)) : 0,
    shareRate: views > 0 ? parseFloat(((shares / views) * 100).toFixed(2)) : 0,
    saveRate: views > 0 ? parseFloat(((saves / views) * 100).toFixed(2)) : 0,
    playRate: plays > 0 && views > 0 ? parseFloat(((plays / views) * 100).toFixed(2)) : 0,
    avgEngagementValue: views > 0 ? parseFloat(((likes + comments + shares + saves) / views).toFixed(4)) : 0
  };
}

/**
 * Calculate post metrics with rate calculations
 * Legacy function - kept for backwards compatibility
 */
export function calculatePostMetrics(post, followerCount = 1) {
  const likes = post.likeCount || post.likesCount || 0;
  const comments = post.commentCount || post.commentsCount || 0;
  const shares = post.shareCount || 0;
  const views = post.viewCount || post.videoViewCount || 0;
  const saves = post.savedCount || post.savedCount || 0;

  return {
    likes,
    comments,
    shares,
    views,
    saves,
    er: calculateEngagementRate(likes, comments, shares, views),
    likeRate: views > 0 ? ((likes / views) * 100).toFixed(2) : 0,
    commentRate: views > 0 ? ((comments / views) * 100).toFixed(2) : 0,
    shareRate: views > 0 ? ((shares / views) * 100).toFixed(2) : 0,
    saveRate: views > 0 ? ((saves / views) * 100).toFixed(2) : 0,
    avgEngagementValue: views > 0 ? ((likes + comments + shares + saves) / views).toFixed(4) : 0
  };
}

/**
 * Calculate account-level metrics
 */
export function calculateAccountMetrics(posts = []) {
  if (posts.length === 0) {
    return {
      totalPosts: 0,
      avgER: 0,
      avgLikes: 0,
      avgComments: 0,
      avgViews: 0,
      totalEngagements: 0,
      totalViews: 0
    };
  }

  const metrics = posts.map(p => 
    calculatePostMetrics(p)
  );

  const avgER = metrics.reduce((sum, m) => sum + m.er, 0) / metrics.length;
  const avgLikes = metrics.reduce((sum, m) => sum + m.likes, 0) / metrics.length;
  const avgComments = metrics.reduce((sum, m) => sum + m.comments, 0) / metrics.length;
  const avgViews = metrics.reduce((sum, m) => sum + m.views, 0) / metrics.length;
  const totalEngagements = metrics.reduce((sum, m) => sum + (m.likes + m.comments + m.shares), 0);
  const totalViews = metrics.reduce((sum, m) => sum + m.views, 0);

  return {
    totalPosts: posts.length,
    avgER: avgER.toFixed(2),
    avgLikes: Math.round(avgLikes),
    avgComments: Math.round(avgComments),
    avgViews: Math.round(avgViews),
    totalEngagements,
    totalViews,
    metrics
  };
}

/**
 * Compare two accounts' metrics
 */
export function compareAccountMetrics(mainMetrics, competitorMetrics) {
  const mainER = parseFloat(mainMetrics.avgER || 0);
  const compER = parseFloat(competitorMetrics.avgER || 0);

  return {
    mainAccount: mainMetrics,
    competitor: competitorMetrics,
    erDifference: (mainER - compER).toFixed(2),
    erPercentageDifference: compER > 0 ? (((mainER - compER) / compER) * 100).toFixed(1) : 'N/A',
    isMainAccountSuperior: mainER > compER,
    likeDifference: mainMetrics.avgLikes - competitorMetrics.avgLikes,
    commentDifference: mainMetrics.avgComments - competitorMetrics.avgComments
  };
}

export default {
  calculateEngagementRate,
  calculatePostMetrics,
  calculateAccountMetrics,
  compareAccountMetrics
};
