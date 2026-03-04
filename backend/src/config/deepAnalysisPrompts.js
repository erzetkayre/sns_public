/**
 * Deep Analysis Prompts Configuration
 * Three-phase analysis for comprehensive account comparison
 * Language: Japanese (日本語)
 */

/**
 * Phase 1: 判定 + 包括性 + パフォーマンス
 * アカウントの全体状態、コンテンツカバレッジ、メトリクスパフォーマンスを評価
 */
export function getDeepAnalysisPhase1Prompt(analysis) {
  const {
    mainAccountName,
    accountType,
    mainMetrics,
    compMetrics,
    mainCaptionAnalysis,
    compCaptionAnalysis,
    mainLocationAnalysis,
    compLocationAnalysis,
    mainGenreAnalysis,
    compGenreAnalysis,
    mainPriceAnalysis,
    compPriceAnalysis,
    comprehensivenessStrategy
  } = analysis;

  return `あなたは100Kフォロワー層SNS戦略アナリストです。

【重要出力ルール】
1. 応答はJSONオブジェクトのみ
2. マークダウン記号（\`\`\`json）を使用しない
3. { で始まり } で終わる
4. すべての必須フィールドを含める

【データサマリー - ${mainAccountName}】
投稿数: ${mainMetrics.totalPosts}件, ER: ${mainMetrics.avgER}%, いいね: ${mainMetrics.avgLikes}, コメント: ${mainMetrics.avgComments}
アピール スコア - 感情: ${mainCaptionAnalysis.avgEmotionalScore}/10, 体験: ${mainCaptionAnalysis.avgExperientialScore}/10, ファクト: ${mainCaptionAnalysis.avgFactualScore}/10
コンテンツカバレッジ - 位置: ${mainLocationAnalysis.presenceRate}%, エリア数: ${mainLocationAnalysis.areaCount}, ジャンル数: ${mainGenreAnalysis.genreCount}, 価格帯: ${mainPriceAnalysis.coverageCount}/6

【競合平均値】
ER: ${compMetrics.avgER}%, 感情: ${compCaptionAnalysis.avgEmotionalScore}/10, 体験: ${compCaptionAnalysis.avgExperientialScore}/10, ファクト: ${compCaptionAnalysis.avgFactualScore}/10
位置カバレッジ: ${compLocationAnalysis.presenceRate}%, ジャンル数: ${compGenreAnalysis.genreCount}, 価格帯: ${compPriceAnalysis.coverageCount}/6

【必須JSON構造】※ すべてのフィールドは必須
{
  "judgmentSummary": {
    "overallState": "SUPERIOR|EQUIVALENT|INFERIOR",
    "overallStateRationale": "判定理由（150文字以内）",
    "mainStrategicProblem": "最大の課題（80文字以内）",
    "mainProblemCategory": "ER|Appeal|Coverage|Script",
    "ignoreTheseForNow": ["非重要課題1", "非重要課題2", "非重要課題3"],
    "decisionRationale": "何故この問題に焦点を当てるか（200文字以上）"
  },
  "comprehensivenessAnalysisWithMarketContext": {
    "accountType": "${accountType}",
    "evaluationAxis": "${comprehensivenessStrategy.focus}",
    "mainAccountCoverage": {
      "genreCoverage": {
        "total": ${mainGenreAnalysis.genreCount},
        "percentage": "${Math.round((mainGenreAnalysis.genreCount/15)*100)}%",
        "diversityScore": ${mainGenreAnalysis.diversityScore || 6}/10
      },
      "priceRangeCoverage": {
        "total": "${mainPriceAnalysis.coverageCount}/6",
        "distribution": "カバレッジ評価（100文字）"
      },
      "areaCoverage": {
        "total": ${mainLocationAnalysis.areaCount},
        "presenceRate": "${mainLocationAnalysis.presenceRate}%"
      }
    },
    "competitorCoverage": {
      "genreCoverage": ${compGenreAnalysis.genreCount},
      "priceRangeCoverage": "${compPriceAnalysis.coverageCount}/6",
      "areaCoverage": ${compLocationAnalysis.areaCount}
    },
    "state": "SUPERIOR|EQUIVALENT|INFERIOR",
    "isStrengthOrWeakness": "strength|weakness",
    "marketContextJudgment": "市場分析（250文字以上）",
    "actionRequired": true,
    "priority": 1,
    "specificRecommendation": "具体的なアクション（100文字以内）"
  },
  "performanceAnalysis": {
    "erComparison": {
      "main": ${mainMetrics.avgER},
      "competitor": ${compMetrics.avgER},
      "gap": ${(parseFloat(mainMetrics.avgER) - parseFloat(compMetrics.avgER)).toFixed(2)},
      "verdict": "SUPERIOR|EQUIVALENT|INFERIOR",
      "reason": "パフォーマンス評価（100文字）"
    },
    "engagementBreakdown": {
      "likesComparison": "比較分析（80文字）",
      "commentsComparison": "比較分析（80文字）"
    }
  },
  "superiority": {
    "overallAccountState": {
      "state": "SUPERIOR|EQUIVALENT|INFERIOR",
      "erGap": ${(parseFloat(mainMetrics.avgER) - parseFloat(compMetrics.avgER)).toFixed(2)},
      "judgment": "評価（150文字）",
      "actionRequired": true,
      "priority": 1
    },
    "comprehensivenessWithContext": {
      "state": "SUPERIOR|EQUIVALENT|INFERIOR",
      "judgment": "評価（200文字）",
      "actionRequired": true,
      "priority": 1
    }
  }
}

注意: JSON のみ。{ で始まり } で終わる。`;
}

/**
 * Phase 2: アピール分析 + 競合パターン + スクリプト改善
 * コンテンツのアピール種別、パターン、行レベルの改善を分析
 */
export function getDeepAnalysisPhase2Prompt(analysis, phase1Result) {
  const {
    mainAccountName,
    mainPosts,
    mainCaptionAnalysis,
    compCaptionAnalysis,
    mainStructureAnalysis,
    compStructureAnalysis
  } = analysis;

  const topPostsCaptions = mainPosts.slice(0, 3).map((post, idx) => 
    `投稿 ${idx + 1} (ER: ${post.calculatedMetrics?.er || 'N/A'}%): "${(post.caption || '').substring(0, 150)}..."`
  ).join('\n');

  return `あなたは100Kフォロワー層SNS戦略アナリストです。

【重要出力ルール】
1. 応答はJSONオブジェクトのみ
2. マークダウン記号（\`\`\`json）を使用しない
3. { で始まり } で終わる
4. すべての必須フィールドを含める

【Phase 1の結果】
アカウント状態: ${phase1Result.judgmentSummary?.overallState || '情報不足'}
主な問題: ${phase1Result.judgmentSummary?.mainStrategicProblem || '不足'}

【コンテンツデータ - ${mainAccountName}】
アピール スコア - 感情: ${mainCaptionAnalysis.avgEmotionalScore}/10, 体験: ${mainCaptionAnalysis.avgExperientialScore}/10, ファクト: ${mainCaptionAnalysis.avgFactualScore}/10
典型的なパターン: ${mainStructureAnalysis.typicalOrder}
競合パターン: ${compStructureAnalysis.typicalOrder}

【トップ3投稿キャプション】
${topPostsCaptions}

【必須JSON構造】
{
  "appealAnalysisVolumeAndOrder": {
    "volumeAnalysis": {
      "mainAccountVolume": {
        "emotional": {"frequency": "X投稿Y%", "scoreAverage": ${mainCaptionAnalysis.avgEmotionalScore}},
        "experiential": {"frequency": "X投稿Y%", "scoreAverage": ${mainCaptionAnalysis.avgExperientialScore}},
        "factual": {"frequency": "X投稿Y%", "scoreAverage": ${mainCaptionAnalysis.avgFactualScore}}
      },
      "competitorVolume": {
        "emotional": {"frequency": "%", "scoreAverage": ${compCaptionAnalysis.avgEmotionalScore}},
        "experiential": {"frequency": "%", "scoreAverage": ${compCaptionAnalysis.avgExperientialScore}},
        "factual": {"frequency": "%", "scoreAverage": ${compCaptionAnalysis.avgFactualScore}}
      }
    },
    "orderAnalysis": {
      "mainTypicalOrder": "${mainStructureAnalysis.typicalOrder}",
      "competitorTypicalOrder": "${compStructureAnalysis.typicalOrder}",
      "optimalOrderFor": "推奨順序の説明",
      "gapAnalysis": "ギャップ分析（200文字）"
    },
    "state": "SUPERIOR|EQUIVALENT|INFERIOR",
    "judgment": "アピール戦略の評価（200文字）",
    "actionRequired": true,
    "priority": 1
  },
  "competitorPatternRecognition": {
    "informationPlacementOrder": {
      "competitorOrder": "パターン説明（250文字）",
      "mainAccountOrder": "パターン説明",
      "gap": "ギャップの影響（200文字）",
      "recommendation": "改善推奨（100文字）"
    },
    "appealSkewPattern": {
      "competitorSkew": "アピール分布（200文字）",
      "mainAccountSkew": "アピール分布",
      "skewComparison": "比較（200文字）",
      "optimalSkew": "推奨バランス"
    },
    "buzzPostAnalysis": {
      "topPostsPattern": "成功パターン",
      "appealDistribution": "分布分析",
      "timingPattern": "タイミング観察"
    },
    "learningOpportunity": "学習ポイント（150文字）"
  },
  "scriptImprovementRowLevel": {
    "improvements": [
      {
        "postNumber": 1,
        "postER": "${mainPosts[0]?.calculatedMetrics?.er || 'N/A'}%",
        "location": "最初のフック",
        "currentText": "${(mainPosts[0]?.caption || '').substring(0, 50)}...",
        "recommendedText": "改善されたスクリプト（80文字）",
        "changeType": "感情的アピール追加",
        "rationale": "理由（150文字）",
        "expectedImpact": "期待される改善（80文字）",
        "priority": 1
      },
      {
        "postNumber": 2,
        "postER": "${mainPosts[1]?.calculatedMetrics?.er || 'N/A'}%",
        "location": "中盤セクション",
        "currentText": "現在のスクリプト",
        "recommendedText": "改善版",
        "changeType": "スクリプト最適化タイプ",
        "rationale": "理由（150文字）",
        "expectedImpact": "期待される改善（80文字）",
        "priority": 2
      },
      {
        "postNumber": 3,
        "postER": "${mainPosts[2]?.calculatedMetrics?.er || 'N/A'}%",
        "location": "最終行（CTA）",
        "currentText": "現在の終了文",
        "recommendedText": "改善されたCTA",
        "changeType": "CTA最適化",
        "rationale": "理由（150文字）",
        "expectedImpact": "期待される改善（80文字）",
        "priority": 1
      }
    ],
    "summaryOfChanges": "全体的な戦略（250文字）"
  },
  "superiority": {
    "contentStrategyHealth": {
      "state": "SUPERIOR|EQUIVALENT|INFERIOR",
      "appealBalanceGap": 1.5,
      "judgment": "評価（150文字）",
      "actionRequired": true,
      "priority": 2
    },
    "appealVolumeAndOrder": {
      "state": "SUPERIOR|EQUIVALENT|INFERIOR",
      "judgment": "評価（200文字）",
      "actionRequired": true,
      "priority": 1
    }
  }
}

注意: JSON のみ。{ で始まり } で終わる。`;
}

/**
 * Phase 3: SWOT + 戦略 + サマリー + ベンチマーク
 * 戦略的推奨、アクション計画、パフォーマンスベンチマーク
 */
export function getDeepAnalysisPhase3Prompt(analysis, phase1Result, phase2Result) {
  const {
    mainAccountName,
    mainMetrics,
    compMetrics,
    mainCaptionAnalysis,
    compCaptionAnalysis
  } = analysis;

  return `あなたは100Kフォロワー層SNS戦略アナリストです。

【重要出力ルール】
1. 応答はJSONオブジェクトのみ
2. マークダウン記号（\`\`\`json）を使用しない
3. { で始まり } で終わる
4. すべての必須フィールドを含める

【Phase 1 & 2の結果】
全体状態: ${phase1Result.judgmentSummary?.overallState || '許容'}
主な問題: ${phase1Result.judgmentSummary?.mainStrategicProblem || '不足'}
アピール状態: ${phase2Result.appealAnalysisVolumeAndOrder?.state || '許容'}

【必須JSON構造】
{
  "swotAnalysis": {
    "strengths": [
      "強み1とデータサポート（80文字）",
      "強み2とデータサポート（80文字）",
      "強み3とデータサポート（80文字）"
    ],
    "weaknesses": [
      "弱み1とデータ（80文字）",
      "弱み2とデータ（80文字）",
      "弱み3とデータ（80文字）"
    ],
    "opportunities": [
      "機会1（80文字）",
      "機会2（80文字）"
    ],
    "threats": [
      "脅威1（80文字）",
      "脅威2（80文字）"
    ]
  },
  "crossSwotStrategy": {
    "SO_strategy": {
      "strategy": "強みを機会に活用（150文字）",
      "implementation": "実装方法（200文字）",
      "expectedImpact": "期待される結果（100文字）",
      "isRecommended": true,
      "recommendationLevel": "HIGHLY_RECOMMENDED|RECOMMENDED|OPTIONAL"
    },
    "WO_strategy": {
      "strategy": "弱みを機会で克服（150文字）",
      "implementation": "実装方法（200文字）",
      "expectedImpact": "期待される結果（100文字）",
      "isRecommended": false,
      "recommendationLevel": "OPTIONAL|DEFER"
    },
    "ST_strategy": {
      "strategy": "強みで脅威に対抗（150文字）",
      "implementation": "実装方法（150文字）",
      "expectedImpact": "期待される結果（80文字）",
      "isRecommended": false,
      "recommendationLevel": "HOLD"
    },
    "WT_strategy": {
      "strategy": "弱みと脅威の影響を最小化（150文字）",
      "implementation": "実装方法（150文字）",
      "expectedImpact": "期待される結果（80文字）",
      "isRecommended": false,
      "recommendationLevel": "DEFER"
    },
    "singleChosenStrategy": "SO|WO|ST|WT",
    "chosenStrategyRationale": "この戦略を選ぶ理由（250文字）"
  },
  "decisiveStrategicAction": {
    "singleMostImportantStrategy": {
      "strategy": "優先アクション（150文字）",
      "category": "ER|Appeal|Coverage|Script|Growth",
      "currentState": "現在の状態",
      "targetState": "ターゲット状態（30日間）",
      "rationale": "なぜこれが優先か（300文字）",
      "implementation": [
        {
          "phase": "1-5日目",
          "actions": ["アクション1: 具体的なステップ", "アクション2: 具体的なステップ"],
          "detail": "詳細な実装計画（200文字）",
          "example": "具体例"
        },
        {
          "phase": "6-10日目",
          "actions": ["アクション1", "アクション2"],
          "detail": "詳細な実装計画（200文字）",
          "example": "具体例"
        },
        {
          "phase": "11-15日目",
          "actions": ["アクション1"],
          "detail": "詳細な実装計画（200文字）",
          "example": "具体例"
        }
      ],
      "expectedOutcome15Days": {
        "primaryMetric": "ERまたはエンゲージメント",
        "currentValue": "${mainMetrics.avgER}%",
        "expectedValue": "ターゲット値と計算",
        "secondaryMetrics": [
          {"metric": "いいね", "current": "${mainMetrics.avgLikes}", "expected": "ターゲット値"},
          {"metric": "コメント", "current": "${mainMetrics.avgComments}", "expected": "ターゲット値"}
        ],
        "confidenceLevel": "high|medium|low",
        "calculationBasis": "どうやってプロジェクションに到達したか（250文字）"
      }
    },
    "doNotDoTheseForNow": [
      {
        "action": "延期するアクション（80文字）",
        "category": "Content|Timing|Platform",
        "reason": "今は延期する理由（150文字）",
        "whenToReconsider": "いつ再検討するか（例: Day 15後）"
      },
      {
        "action": "延期するアクション（80文字）",
        "category": "Content|Timing|Platform",
        "reason": "今は延期する理由（150文字）",
        "whenToReconsider": "いつ再検討するか"
      },
      {
        "action": "延期するアクション（80文字）",
        "category": "Content|Timing|Platform",
        "reason": "今は延期する理由（150文字）",
        "whenToReconsider": "いつ再検討するか"
      }
    ]
  },
  "mainAccountDiagnosis": {
    "appealTypeDiagnosis": {
      "emotional": {
        "score": ${mainCaptionAnalysis.avgEmotionalScore},
        "verdict": "Strong|Adequate|Weak|Insufficient",
        "comparison": "vs 競合他社（80文字）"
      },
      "experiential": {
        "score": ${mainCaptionAnalysis.avgExperientialScore},
        "verdict": "Strong|Adequate|Weak|Insufficient",
        "comparison": "vs 競合他社（80文字）"
      },
      "factual": {
        "score": ${mainCaptionAnalysis.avgFactualScore},
        "verdict": "Strong|Adequate|Weak|Insufficient",
        "comparison": "vs 競合他社（80文字）"
      },
      "summary": "全体的なアピール診断（150文字）"
    }
  },
  "contentStrategy": {
    "recommendedAppealType": {
      "primary": "Emotional|Experiential|Factual",
      "secondary": "Emotional|Experiential|Factual",
      "reason": "戦略の理由（150文字）",
      "implementation": "実装方法（100文字）"
    },
    "contentThemes": [
      "テーマ1と説明（80文字）",
      "テーマ2と説明（80文字）",
      "テーマ3と説明（80文字）"
    ],
    "optimizationStrategy": "コンテンツ最適化計画（150文字）"
  },
  "actionableAdvice": {
    "increaseSaves": [
      "実行可能なアドバイス（80文字）",
      "実行可能なアドバイス（80文字）"
    ],
    "increaseEngagement": [
      "実行可能なアドバイス（80文字）",
      "実行可能なアドバイス（80文字）"
    ],
    "increaseFollowers": [
      "実行可能なアドバイス（80文字）",
      "実行可能なアドバイス（80文字）"
    ]
  },
  "performanceBenchmarks": [
    {
      "title": "🎯 総合評価",
      "content": "包括的な判定（300文字）",
      "winner": "${mainAccountName}|競合|同等",
      "state": "SUPERIOR|EQUIVALENT|INFERIOR",
      "improvementPriority": "CRITICAL|HIGH|MEDIUM|LOW"
    },
    {
      "title": "📊 ERパフォーマンス",
      "content": "ER分析（250文字）",
      "winner": "${mainAccountName}|競合|同等",
      "state": "SUPERIOR|EQUIVALENT|INFERIOR",
      "scoreGap": ${(parseFloat(mainMetrics.avgER) - parseFloat(compMetrics.avgER)).toFixed(2)},
      "improvementPriority": "CRITICAL|HIGH|MEDIUM|LOW"
    },
    {
      "title": "🎭 アピール戦略",
      "content": "アピール効果（300文字）",
      "winner": "${mainAccountName}|競合|同等",
      "state": "SUPERIOR|EQUIVALENT|INFERIOR",
      "improvementPriority": "CRITICAL|HIGH|MEDIUM"
    },
    {
      "title": "✍️ スクリプト品質",
      "content": "スクリプト効果（250文字）",
      "winner": null,
      "improvementPriority": "CRITICAL|HIGH"
    },
    {
      "title": "💡 戦略方向",
      "content": "戦略評価（300文字）",
      "winner": null,
      "improvementPriority": "CRITICAL"
    }
  ],
  "summary": "完全なサマリー（400文字）: アカウント状態を含める、主な問題、トップ3アクション、15日間のER予測、主要な戦略的洞察。",
  "overallWinner": "${mainAccountName}|競合|同等",
  "keyInsights": [
    "メトリクス付きのアカウント状態（150文字）",
    "競争ギャップ分析（150文字）",
    "15日間のアクション計画（150文字）",
    "戦略的フォーカス（150文字）"
  ]
}

注意: JSON のみ。{ で始まり } で終わる。`;
}

export default {
  getDeepAnalysisPhase1Prompt,
  getDeepAnalysisPhase2Prompt,
  getDeepAnalysisPhase3Prompt
};
