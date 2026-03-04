// routes/report.route.js

import { Router } from 'express';
import PDFDocument from "pdfkit";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/generate-report/:postId", async (req, res) => {
  try {
    const { postId } = req.params;

    const data = await prisma.$queryRawUnsafe(`
      SELECT 
          a."accountId",
          a."postId",
          a."resultJson",
          a."summary",
          p."url",
          u."igUserId"
      FROM ai_english_analysis_history a
      JOIN posts p ON a."postId" = p."id"
      JOIN watched_accounts u ON p."accountId" = u."id"
      WHERE a."postId" = $1
    `, postId);

    if (!data.length) {
      return res.status(404).json({ message: "Data not found" });
    }

    const row = data[0];
    const result = row.resultJson;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=analysis-${postId}.pdf`
    );

    doc.pipe(res);

    // =========================
    // 1. Judul Video
    // =========================
    doc.fontSize(20).text("VIDEO ANALYSIS REPORT", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(14).text("Video URL:");
    doc.fontSize(12).fillColor("blue").text(row.url);
    doc.fillColor("black");
    doc.moveDown(2);

    // =========================
    // 2. Score Summary
    // =========================
    doc.fontSize(16).text("Score Summary", { underline: true });
    doc.moveDown();

    const scoreSummary = [
      ["Overall Score", result.overallAssessment?.score],
      ["Hook Score", result.hookAnalysisDetailed?.overallHookScore],
      ["ER", result.erCorrelationAnalysis?.er],
      ["Pacing / Rhythm", result.minuteByMinuteBreakdown?.score],
      ["Cinematography", result.filmingMethodDetails?.overallProductionValue?.productionQualityScore],
      ["Theme Effectiveness", result.themeIdentification?.themeEffectivenessScore],
      ["Views", result.erCorrelationAnalysis?.views]
    ];

    scoreSummary.forEach(([label, value]) => {
      doc.fontSize(12).text(`${label}: ${value ?? "-"}`);
    });

    doc.moveDown(2);

    // =========================
    // 3. Executive Summary
    // =========================
    doc.fontSize(16).text("Executive Summary", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(result.summary || "-");
    doc.moveDown(2);

    // =========================
    // 4. Psychological Triggers
    // =========================
    doc.fontSize(16).text("Psychological Triggers", { underline: true });
    doc.moveDown();

    const triggers = result.hookAnalysisDetailed?.psychologicalTriggers || {};

    const triggerStatus = (val) =>
      val === true ? "ACTIVE" : val === false ? "OFF" : "PARTIAL";

    Object.entries(triggers).forEach(([key, value]) => {
      doc.text(`${key}: ${triggerStatus(value)}`);
    });

    doc.moveDown(2);

    // =========================
    // 5. Scene Breakdown
    // =========================
    doc.fontSize(16).text("Scene Breakdown", { underline: true });
    doc.moveDown();

    result.minuteByMinuteBreakdown?.segments?.forEach((seg) => {
      doc.fontSize(12).text(
        `${seg.timeRange} | ${seg.keyMoment?.momentType}`
      );
      doc.text(`Impact: ${seg.keyMoment?.impactLevel}`);
      doc.text(`Description: ${seg.keyMoment?.description}`);
      doc.moveDown();
    });

    // =========================
    // 6. Strengths
    // =========================
    doc.addPage();
    doc.fontSize(16).text("Strengths", { underline: true });
    doc.moveDown();

    result.overallAssessment?.strengths?.forEach((s) => {
      doc.text(`• ${s}`);
    });

    doc.moveDown(2);

    // =========================
    // 7. Weaknesses
    // =========================
    doc.fontSize(16).text("Areas to Improve", { underline: true });
    doc.moveDown();

    result.overallAssessment?.weaknesses?.forEach((w) => {
      doc.text(`• ${w}`);
    });

    doc.moveDown(2);

    // =========================
    // 8. Top 3 Recommendations
    // =========================
    doc.fontSize(16).text("Top 3 Recommendations", { underline: true });
    doc.moveDown();

    result.top3ActionableRecommendations?.forEach((r) => {
      doc.text(`Priority: ${r.priority}`);
      doc.text(`Recommendation: ${r.recommendation}`);
      doc.text(`Rationale: ${r.rationale}`);
      doc.moveDown();
    });

    // =========================
    // 9. Subtitle & Voice Over
    // =========================
    doc.addPage();
    doc.fontSize(16).text("Subtitle & Voice Over", { underline: true });
    doc.moveDown();

    doc.text("Subtitles:");
    result.subtitleArray?.forEach((sub) => {
      doc.text(`- ${sub}`);
    });

    doc.moveDown();

    const narration = result.narrationPersonalityEvaluation;
    doc.text("Narration Personality Evaluation:");
    Object.entries(narration || {}).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating PDF" });
  }
});

export default router;