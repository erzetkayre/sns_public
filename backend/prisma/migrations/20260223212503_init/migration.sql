-- CreateEnum
CREATE TYPE "account_type" AS ENUM ('main', 'competitor');

-- CreateEnum
CREATE TYPE "post_type" AS ENUM ('Video', 'Image', 'Sidecar');

-- CreateEnum
CREATE TYPE "media_type" AS ENUM ('thumbnail', 'video', 'carousel_image');

-- CreateEnum
CREATE TYPE "analysis_type" AS ENUM ('thumbnail', 'video', 'deep');

-- CreateEnum
CREATE TYPE "analysis_status" AS ENUM ('pending', 'running', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "job_type" AS ENUM ('initial', 'daily_update');

-- CreateEnum
CREATE TYPE "job_status" AS ENUM ('pending', 'running', 'completed', 'failed');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watched_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "igUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT,
    "accountType" "account_type" NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "profilePicUrl" TEXT,
    "bio" TEXT,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "postsCount" INTEGER NOT NULL DEFAULT 0,
    "followersFetchedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watched_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follower_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "accountId" UUID NOT NULL,
    "followersCount" INTEGER NOT NULL,
    "followingCount" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follower_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "accountId" UUID NOT NULL,
    "igPostId" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "postType" "post_type" NOT NULL,
    "productType" TEXT,
    "caption" TEXT,
    "url" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isCommentsDisabled" BOOLEAN NOT NULL DEFAULT false,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "displayUrl" TEXT,
    "videoUrl" TEXT,
    "audioUrl" TEXT,
    "videoDuration" DECIMAL(8,2),
    "dimensionsHeight" INTEGER,
    "dimensionsWidth" INTEGER,
    "altText" TEXT,
    "locationName" TEXT,
    "locationId" TEXT,
    "musicArtist" TEXT,
    "musicSong" TEXT,
    "musicAudioId" TEXT,
    "usesOriginalAudio" BOOLEAN,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "firstFetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hashtags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hashtags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_hashtags" (
    "postId" UUID NOT NULL,
    "hashtagId" UUID NOT NULL,

    CONSTRAINT "post_hashtags_pkey" PRIMARY KEY ("postId","hashtagId")
);

-- CreateTable
CREATE TABLE "post_mentions" (
    "postId" UUID NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "post_mentions_pkey" PRIMARY KEY ("postId","username")
);

-- CreateTable
CREATE TABLE "media_files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "postId" UUID NOT NULL,
    "mediaType" "media_type" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "storageKey" TEXT,
    "originalUrl" TEXT,
    "fileSizeMb" DECIMAL(8,2),
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_metrics_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "postId" UUID NOT NULL,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "videoViewCount" INTEGER NOT NULL DEFAULT 0,
    "videoPlayCount" INTEGER NOT NULL DEFAULT 0,
    "engagementRate" DECIMAL(10,6),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_metrics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_metrics_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "accountId" UUID NOT NULL,
    "fetchJobId" UUID,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "followerGrowth" INTEGER NOT NULL DEFAULT 0,
    "followerGrowthPct" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "previousFollowers" INTEGER NOT NULL DEFAULT 0,
    "totalPostsScraped" INTEGER NOT NULL DEFAULT 0,
    "totalVideos" INTEGER NOT NULL DEFAULT 0,
    "totalImages" INTEGER NOT NULL DEFAULT 0,
    "totalSidecars" INTEGER NOT NULL DEFAULT 0,
    "postingFreqPerDay" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "postingFreqPerWeek" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "videoFreqPerDay" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "videoFreqPerWeek" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "imageFreqPerDay" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "imageFreqPerWeek" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "sidecarFreqPerDay" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "sidecarFreqPerWeek" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "totalVideoViews" BIGINT NOT NULL DEFAULT 0,
    "totalVideoPlays" BIGINT NOT NULL DEFAULT 0,
    "totalLikesVideo" BIGINT NOT NULL DEFAULT 0,
    "totalCommentsVideo" BIGINT NOT NULL DEFAULT 0,
    "totalLikesImage" BIGINT NOT NULL DEFAULT 0,
    "totalCommentsImage" BIGINT NOT NULL DEFAULT 0,
    "totalLikesSidecar" BIGINT NOT NULL DEFAULT 0,
    "totalCommentsSidecar" BIGINT NOT NULL DEFAULT 0,
    "avgViewsPerVideo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "avgPlaysPerVideo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "avgLikesPerVideo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "avgCommentsPerVideo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "avgLikesPerImage" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "avgCommentsPerImage" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "avgLikesPerSidecar" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "avgCommentsPerSidecar" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "avgErVideo" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "avgErImage" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "avgErSidecar" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "avgErImageSidecar" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "avgErAllPosts" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "avgErLast15Days" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_metrics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analysis_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "accountId" UUID NOT NULL,
    "postId" UUID,
    "fetchJobId" UUID,
    "analysisType" "analysis_type" NOT NULL,
    "status" "analysis_status" NOT NULL DEFAULT 'pending',
    "resultJson" JSONB,
    "summary" TEXT,
    "errorMessage" TEXT,
    "provider" TEXT,
    "estimatedInputTokens" INTEGER,
    "estimatedOutputTokens" INTEGER,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_analysis_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fetch_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "jobType" "job_type" NOT NULL,
    "status" "job_status" NOT NULL DEFAULT 'pending',
    "accountsFetched" TEXT[],
    "postsCreated" INTEGER NOT NULL DEFAULT 0,
    "postsUpdated" INTEGER NOT NULL DEFAULT 0,
    "mediaDownloaded" INTEGER NOT NULL DEFAULT 0,
    "apifyRunId" TEXT,
    "apifyDatasetId" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "fetch_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "watched_accounts_userId_accountType_idx" ON "watched_accounts"("userId", "accountType");

-- CreateIndex
CREATE UNIQUE INDEX "watched_accounts_userId_igUserId_key" ON "watched_accounts"("userId", "igUserId");

-- CreateIndex
CREATE INDEX "follower_history_accountId_recordedAt_idx" ON "follower_history"("accountId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "posts_accountId_postedAt_idx" ON "posts"("accountId", "postedAt" DESC);

-- CreateIndex
CREATE INDEX "posts_accountId_postType_idx" ON "posts"("accountId", "postType");

-- CreateIndex
CREATE INDEX "posts_postedAt_idx" ON "posts"("postedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "posts_accountId_igPostId_key" ON "posts"("accountId", "igPostId");

-- CreateIndex
CREATE UNIQUE INDEX "hashtags_tag_key" ON "hashtags"("tag");

-- CreateIndex
CREATE INDEX "media_files_postId_mediaType_idx" ON "media_files"("postId", "mediaType");

-- CreateIndex
CREATE INDEX "post_metrics_snapshots_postId_fetchedAt_idx" ON "post_metrics_snapshots"("postId", "fetchedAt" DESC);

-- CreateIndex
CREATE INDEX "post_metrics_snapshots_fetchedAt_idx" ON "post_metrics_snapshots"("fetchedAt" DESC);

-- CreateIndex
CREATE INDEX "account_metrics_snapshots_accountId_calculatedAt_idx" ON "account_metrics_snapshots"("accountId", "calculatedAt" DESC);

-- CreateIndex
CREATE INDEX "ai_analysis_history_accountId_analysisType_createdAt_idx" ON "ai_analysis_history"("accountId", "analysisType", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "fetch_jobs_userId_startedAt_idx" ON "fetch_jobs"("userId", "startedAt" DESC);

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watched_accounts" ADD CONSTRAINT "watched_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follower_history" ADD CONSTRAINT "follower_history_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "watched_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "watched_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_hashtags" ADD CONSTRAINT "post_hashtags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_hashtags" ADD CONSTRAINT "post_hashtags_hashtagId_fkey" FOREIGN KEY ("hashtagId") REFERENCES "hashtags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_mentions" ADD CONSTRAINT "post_mentions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_metrics_snapshots" ADD CONSTRAINT "post_metrics_snapshots_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_metrics_snapshots" ADD CONSTRAINT "account_metrics_snapshots_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "watched_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_metrics_snapshots" ADD CONSTRAINT "account_metrics_snapshots_fetchJobId_fkey" FOREIGN KEY ("fetchJobId") REFERENCES "fetch_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analysis_history" ADD CONSTRAINT "ai_analysis_history_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "watched_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analysis_history" ADD CONSTRAINT "ai_analysis_history_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analysis_history" ADD CONSTRAINT "ai_analysis_history_fetchJobId_fkey" FOREIGN KEY ("fetchJobId") REFERENCES "fetch_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fetch_jobs" ADD CONSTRAINT "fetch_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
