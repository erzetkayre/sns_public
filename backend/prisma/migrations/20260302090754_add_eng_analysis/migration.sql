-- CreateTable
CREATE TABLE "ai_english_analysis_history" (
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

    CONSTRAINT "ai_english_analysis_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_english_analysis_history_accountId_analysisType_createdA_idx" ON "ai_english_analysis_history"("accountId", "analysisType", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "ai_english_analysis_history" ADD CONSTRAINT "ai_english_analysis_history_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "watched_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_english_analysis_history" ADD CONSTRAINT "ai_english_analysis_history_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_english_analysis_history" ADD CONSTRAINT "ai_english_analysis_history_fetchJobId_fkey" FOREIGN KEY ("fetchJobId") REFERENCES "fetch_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
