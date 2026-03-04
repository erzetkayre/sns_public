-- AlterTable
ALTER TABLE "post_metrics_snapshots" ADD COLUMN     "savedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shareCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "deep_analysis_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "accountId" UUID NOT NULL,
    "competitorIds" UUID[],
    "status" "analysis_status" NOT NULL DEFAULT 'pending',
    "phase1Result" JSONB,
    "phase2Result" JSONB,
    "phase3Result" JSONB,
    "rawData" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "deep_analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deep_analysis_results_accountId_createdAt_idx" ON "deep_analysis_results"("accountId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "deep_analysis_results_status_createdAt_idx" ON "deep_analysis_results"("status", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "deep_analysis_results" ADD CONSTRAINT "deep_analysis_results_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "watched_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
