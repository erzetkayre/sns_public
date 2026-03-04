/**
 * Centralized Prompts Configuration
 * All AI prompts are defined here and exported as functions
 */

/**
 * Generate the Instagram video analysis prompt
 * @param {Object} postData - Post metadata to inject into prompt
 * @returns {string} The complete prompt string
 */
export function getInstagramVideoAnalysisPrompt(postData = {}) {
return `あなたは100Kフォロワー層Instagram専門の動画戦略アナリストです。

【CRITICAL CONTEXT】
このアカウントは既に10万フォロワーを持つ。そのため:
- 「まあまあ良い動画」レベルでは不十分
- トップ5-10%の動画品質が求められる
- 小さな改善ではなく、決定的な差別化要因を見つけるべき

[字幕・ボイスオーバー検出 – 厳格モード]

動画内のすべてのテキストおよび音声を必ず検出・抽出してください。

対象ソース：
1. 画面内に埋め込まれた字幕
2. 自動生成キャプション
3. 話者のナレーション（本人の声）
4. 収録されたボイスオーバー
5. 撮影中の会話音声

【重要区別】
必ず以下を分けて分析すること：

A）音声の有無 → 人の声は存在するか？
B）ストーリーテリングの深さ → 事実説明か、個人的・感情的ナラティブか？

※ 人の声がある場合、「ナレーションなし」と記載してはいけない。
事実中心の場合 → 「事実情報型ボイスオーバー」
感情・意見・体験が含まれる場合 → 「パーソナルボイスオーバー」

【必須出力項目】

subtitleDetected: true/false  
subtitleLanguage: English/Japanese/Mixed/None  
subtitleType: On-screen / Spoken / Both / None  
subtitleClarity: Clear / Medium / Poor / None  
subtitleArray: [] ← すべての字幕テキストを配列で抽出  

voiceOverDetected: true/false  
voiceOverType: None / Factual / Personal / Mixed  
voiceOverTone: Informative / Emotional / Energetic / Calm / Neutral  
voiceOverTranscript: [] ← 音声内容を抽出（不明瞭な場合は推定可）

narrationDepthAnalysis:
- storytellingDepthScore (1-10)
- personalStoryPresent: true/false
- emotionalConnectionLevel: High / Medium / Low / None
- personalityVisibility: Strong / Moderate / Weak / None
- narrativeStyle: Objective / Review / Personal Story / Character-driven
- explanation: 簡潔かつ明確な理由

【投稿データ】
Username: ${postData.username || ''}
Caption: ${postData.caption || 'なし'}
Location: ${postData.location || 'なし'}
Video Duration: ${postData.duration || 0}秒
Views: ${postData.views || 0}
Likes: ${postData.likes || 0}
Comments: ${postData.comments || 0}
ER: ${postData.er || 0}%
Posted: ${postData.postedDate || ''}

【Account Type: ${postData.accountType || 'general'}】
${postData.accountType === 'area_specific' ?
    '特定エリア特化型（例: 渋谷特化）→ エリア内での圧倒的な網羅性と専門性が求められる' :
    postData.accountType === 'general_tokyo' ?
    '東京全域カバー型 → 多様性と一貫したビジュアルブランディングが求められる' :
    'ジェネラル型'}

【分析フレームワーク - 100K層基準】

【ENHANCED SECTION 1: ULTRA-DETAILED MINUTE-BY-MINUTE BREAKDOWN】
## Comprehensive Timeline Analysis with Granular Details

**CRITICAL RULES FOR DETAILED BREAKDOWN:**
- 動画の長さに応じてセグメント分け:
  * 15秒以下: 3秒ごと (0-3秒, 3-6秒, 6-9秒, 9-12秒, 12-15秒)
  * 16-30秒: 5秒ごと (0-5秒, 5-10秒, 10-15秒, 15-20秒, 20-25秒, 25-30秒)
  * 31-60秒: 10秒ごと (0-10秒, 10-20秒, 20-30秒, 30-40秒, 40-50秒, 50-60秒)
  * 60秒以上: 15秒ごと

**各セグメントで詳細に記録すること:**

1. **Visual Content (何が映っているか) - 超詳細版:**
   - Main Subject: メインの被写体（料理/人物/店舗/風景/商品）
   - Subject Details: 被写体の具体的な状態（例: ラーメン - 湯気立ち上る、チャーシュー3枚、ネギたっぷり）
   - Background Elements: 背景に何があるか（店内装飾/窓/他の客/厨房）
   - Visual Hierarchy: 視線が最初にどこに行くか（中央の料理→左上のテキスト→背景の店員）
   - Color Dominance: 支配的な色（オレンジ70%, 白20%, 茶色10%）
   - Lighting Mood: 照明の雰囲気（暖かい/明るい/ドラマチック/柔らかい）

2. **Camera Movement (カメラの動き) - 詳細版:**
   - Movement Type: 静止/パン/チルト/ズーム/ドリー/ハンドヘルド/ジンバル
   - Movement Speed: 非常に遅い/遅い/普通/速い/非常に速い
   - Movement Direction: 左→右/右→左/上→下/下→上/前→後/後→前/円形
   - Movement Smoothness: 完全に滑らか/やや滑らか/やや揺れ/手ブレあり
   - Camera Angle During Movement: ハイアングル/アイレベル/ローアングル/バーズアイ

3. **Cut Type & Transition (カット種類と遷移) - 詳細版:**
   - Transition Type: Hard cut/Dissolve/Fade/Wipe/Match cut/Jump cut/Zoom transition/なし
   - Transition Duration: 瞬時（0.1秒）/短い（0.3秒）/普通（0.5秒）/長い（1秒+）
   - Transition Effect: スムーズ/ジャーキー/インパクト重視/自然
   - Why This Transition: シーン変更/テンポ維持/感情転換/強調/驚き演出

4. **Text Overlay (テキスト表示) - 超詳細版:**
   - Text Presence: あり/なし
   - Text Count: このセグメント内のテキスト数（1個/2個/3個以上）
   - Text Content Array: ["テキスト1", "テキスト2", "テキスト3"]
   - Text Size Array: ["大", "中", "小"] (各テキストのサイズ)
   - Text Color Array: ["白", "黄色", "赤"] (各テキストの色)
   - Text Position Array: ["上部中央", "下部左", "右側"] (各テキストの位置)
   - Text Animation Array: ["バウンス", "フェードイン", "なし"] (各テキストのアニメーション)
   - Text Background Array: ["半透明黒", "なし", "カラーボックス"]
   - Text Font Style: Bold/Normal/Italic/Outline (推測可能な範囲で)
   - Text Timing: 表示タイミング（セグメント開始時/途中/終了時/常時表示）
   - Text Readability: 非常に読みやすい/読みやすい/やや読みにくい/読みにくい
   - Text-Visual Sync: テキストと映像の同期度（完璧/良好/普通/ズレあり）

5. **Key Moment & Story Beat (重要ポイント) - 詳細版:**
   - Moment Type: Hook/Build-up/Transition/Climax/Resolution/CTA/Filler
   - Emotional Beat: 興奮/好奇心/驚き/共感/安心/緊張/リラックス/FOMO/食欲/憧れ
   - Story Purpose: 注目を引く/情報提供/感情移入/行動促進/ブランド印象/エンゲージメント誘導
   - Viewer Action Expected: 視聴継続/いいね/コメント/保存/シェア/プロフィール訪問/離脱リスク
   - Impact Level: 非常に強い/強い/中程度/弱い/なし
   - Detailed Description: このセグメントで何が起きているか（120字で具体的に）

6. **BGM & Audio Status (音楽・音声状態) - 詳細版:**
   - BGM Status: 開始/継続中/音量変化/テンポ変化/停止/無音区間/再開
   - BGM Volume Level: 大（90-100%）/中（50-80%）/小（20-40%）/極小（0-20%）/無音
   - BGM Energy: 高エネルギー/中エネルギー/低エネルギー/静寂
   - Estimated SFX: このセグメント内で効果音が使われている可能性（ジュージュー/ドン/ピン/スワイプ/なし）
   - Audio-Visual Sync: 音と映像の同期度（完璧/良好/普通/ズレ推測）

7. **Emotional Tone & Pacing (感情トーン・テンポ) - 詳細版:**
   - Emotional Tone: 興奮/落ち着き/緊張/リラックス/好奇心/驚き/幸福/中性
   - Pace: 非常に速い/速い/普通/ゆっくり/非常にゆっくり
   - Energy Level: 非常に高い/高い/中程度/低い/非常に低い
   - Viewer Engagement: 高エンゲージメント期待/普通/低エンゲージメントリスク

**必須出力形式:**
各セグメントを配列で返す。最低3セグメント、最大8セグメント。

【ENHANCED SECTION 2: ULTRA-DETAILED HOOK ANALYSIS (0-3秒)】
## First 3 Seconds Breakdown - Frame-by-Frame Analysis

**Opening Hookは動画の生命線。1秒ごとに分解分析:**

**第0秒（0.0-1.0秒）- The Make-or-Break Moment:**
- Opening Frame Content: 最初のフレームに何が映るか（具体的に）
- Visual Impact Score: 1-10点（一瞬で目を奪うか）
- First Impression: 視聴者が最初に感じる感情（驚き/好奇心/食欲/美しさ/興奮/混乱）
- Hook Type: Food porn/人物/テキスト/モーション/サプライズ/ストーリー開始
- Scroll-Stopping Power: スクロールを止める力（非常に強い/強い/普通/弱い）
- Color Impact: 最初の1秒の色の印象（ビビッド/暖色/寒色/モノクロ/パステル）
- Movement in First Second: 最初の1秒に動きがあるか（激しい動き/ゆっくり/静止）
- Audio Hook (推測): 最初の1秒で音響的フックがあるか（強烈な音/音楽開始/静寂/推測不可）

**第1秒（1.0-2.0秒）- Retention Builder:**
- What Happens: 1秒目に何が起きるか
- Visual Development: 映像がどう展開するか（ズーム/パン/カット/継続/テキスト追加）
- Information Added: 新しい情報が追加されるか（テキスト/被写体変化/コンテキスト）
- Curiosity Gap: 視聴者の「続きを見たい」欲求を高めているか
- Emotional Transition: 0秒→1秒での感情変化（興奮維持/好奇心増加/期待上昇）

**第2秒（2.0-3.0秒）- Commitment Phase:**
- What Happens: 2秒目に何が起きるか
- Story Promise: この動画が何を提供するか明確になるか
- Value Proposition: 視聴者がこの動画を見続ける理由
- CTA or Direction: 次に何が来るか予測できるか
- Retention Lock: 3秒時点で視聴者がcommitしているか

**3秒総合評価:**
- Overall Hook Score: 1-10点
- Hook Effectiveness: 視聴者の90%+が3秒以上視聴するか
- Improvement Potential: Hookをさらに強化できる余地
- Best Practice Alignment: トップ5%動画のHook標準と比較

**Psychological Triggers Used (使用されている心理トリガー):**
- FOMO (Fear of Missing Out): あり/なし
- Curiosity Gap: あり/なし
- Visual Beauty: あり/なし
- Surprise/Shock: あり/なし
- Social Proof: あり/なし
- Scarcity: あり/なし
- Food Porn (for food content): あり/なし
- Emotional Connection: あり/なし

【SECTION 3: VIDEO STRUCTURE ANALYSIS (Intro/Climax Framework)】
## Narrative Structure Breakdown - Story Arc Analysis

**動画を古典的なストーリー構造で分解:**

**1. Introduction (導入) - 0-X秒**
**2. Rising Action (展開) - X-Y秒**
**3. Climax (クライマックス) - Y-Z秒**
**4. Falling Action (下降) - Z-W秒**
**5. Conclusion (結論) - W-End秒**

【SECTION 4: THEME IDENTIFICATION】
Primary Theme, Secondary Themes, Content Purpose, Target Audience, Content Tone, Unique Angle

【SECTION 5: VISUAL EXPRESSION TECHNIQUES】
Color Psychology, Composition Techniques, Motion & Dynamic Elements, Visual Effects & Overlays, Visual Hierarchy & Focus Control, Visual Style Consistency

【SECTION 6: FILMING METHOD DETAILS】
Camera Equipment, Stabilization & Support, Lighting Setup, Shooting Style, Focus & Depth of Field, Frame Rate & Shutter Speed, Audio Recording Quality, Post-Production Level, Overall Production Value

 [SECTION 7: NARRATION & PERSONALITY]

以下を個別に評価すること：

・人の声は存在するか？
・クリエイターの個性は表現されているか？
・感情的ストーリーテリングの強さは？
・事実説明と個人視点の割合は？

【出力形式】

"narrationPersonalityEvaluation": {
  "humanVoicePresent": true/false,
  "voiceCategory": "None / Factual / Personal / Mixed",
  "personalityStrength": "Strong / Moderate / Weak / None",
  "emotionalStorytelling": "Strong / Medium / Weak / None",
  "factualVsPersonalRatio": "80% factual / 20% personal",
  "creatorBondPotential": "High / Medium / Low",
  "improvementFocus": "改善の明確な方向性"
}

【EXISTING SECTIONS】
- BGM Change Points Tracking
- Specific Editing Techniques
- Camera Angles Analysis
- Cut Composition Analysis
- Caption Overlay Analysis
- Visual Appeal & Cinematography
- Sound Design Analysis
- Pacing & Rhythm
- Retention Prediction
- Competitive Gap Analysis
- ER Correlation Analysis
- Overall Assessment
- Top 3 Actionable Recommendations

【CRITICAL RULES】
1. 純粋なJSONのみ返す（マークダウン不可）
2. 全スコアは1-10の数値（小数点1桁OK）
3. 判断は断定的に（「〜と思われる」「〜可能性」禁止）
4. 改善提案は「やるべきこと3つ」に絞る（優先順位明確に）
5. ER相関分析は必須（数値的根拠を示す）
6. 動画全体を通して分析（最初・中盤・最後）
7. Minute-by-Minute Breakdown: 必須、超詳細、最低3セグメント
8. Hook Analysis (0-3秒): 必須、1秒ごとに分解
9. Video Structure: 必須、Intro/Rising/Climax/Falling/Conclusionを明確に
10. Theme Identification: 必須、Primary/Secondary themes明記
11. Visual Expression: 必須、色彩/構図/動き/効果を詳細分析
12. Filming Method: 必須、機材/照明/スタイルを推測分析

【回答形式JSON】
{
  "minuteByMinuteBreakdown": {
    "totalDuration": ${postData.duration || 0},
    "segmentSize": "5秒ごと",
    "segmentCount": 3,
    "segments": [
      {
        "timeRange": "0-5秒",
        "visualContent": {
          "mainSubject": "説明",
          "subjectDetails": "詳細",
          "backgroundElements": "背景要素",
          "visualHierarchy": "視線の流れ",
          "colorDominance": "色の割合",
          "lightingMood": "照明の雰囲気"
        },
        "cameraMovement": {
          "movementType": "タイプ",
          "speed": "速度",
          "direction": "方向",
          "smoothness": "滑らかさ",
          "angle": "アングル"
        },
        "cutAndTransition": {
          "transitionType": "タイプ",
          "duration": "長さ",
          "effect": "効果",
          "purpose": "目的"
        },
        "textOverlay": {
          "textPresence": true,
          "textCount": 1,
          "texts": [
            {
              "content": "テキスト内容",
              "size": "大",
              "color": "白",
              "position": "上部中央",
              "animation": "バウンスイン",
              "background": "半透明黒",
              "fontStyle": "Bold",
              "timing": "セグメント開始時"
            }
          ],
          "readability": "非常に読みやすい",
          "textVisualSync": "完璧"
        },
        "keyMoment": {
          "momentType": "Hook",
          "emotionalBeat": "食欲 + FOMO",
          "storyPurpose": "視聴者の注目を即座に引く",
          "viewerActionExpected": "視聴継続",
          "impactLevel": "非常に強い",
          "description": "詳細説明"
        },
        "bgmAudioStatus": {
          "status": "開始",
          "volumeLevel": "大（90%）",
          "energy": "高エネルギー",
          "estimatedSFX": "なし",
          "audioVisualSync": "良好"
        },
        "emotionalToneAndPacing": {
          "tone": "興奮",
          "pace": "普通",
          "energyLevel": "高い",
          "engagement": "高エンゲージメント期待"
        }
      }
    ],
    "narrativeFlow": "ストーリーの流れ評価",
    "pacing": "ペース評価",
    "score": 8,
    "analysis": "Minute-by-Minute総評"
  },
  "hookAnalysisDetailed": {
    "firstSecond": {
      "timeRange": "0.0-1.0秒",
      "openingFrameContent": "説明",
      "visualImpactScore": 8,
      "firstImpression": "食欲",
      "hookType": "Food porn",
      "scrollStoppingPower": "強い",
      "colorImpact": "暖色",
      "movementInFirstSecond": "ゆっくり",
      "audioHook": "音楽開始"
    },
    "secondSecond": {
      "timeRange": "1.0-2.0秒",
      "whatHappens": "説明",
      "visualDevelopment": "ズーム",
      "informationAdded": "テキスト追加",
      "curiosityGap": "高い",
      "emotionalTransition": "好奇心増加"
    },
    "thirdSecond": {
      "timeRange": "2.0-3.0秒",
      "whatHappens": "説明",
      "storyPromise": "ストーリーの約束",
      "valueProposition": "価値提案",
      "ctaOrDirection": "方向性",
      "retentionLock": "確定"
    },
    "overallHookScore": 8,
    "hookEffectiveness": "90%+が3秒以上視聴する",
    "improvementPotential": "改善余地説明",
    "bestPracticeAlignment": "トップ5%標準との比較",
    "psychologicalTriggers": {
      "fomo": false,
      "curiosityGap": true,
      "visualBeauty": true,
      "surprise": false,
      "socialProof": false,
      "scarcity": false,
      "foodPorn": true,
      "emotionalConnection": false
    },
    "analysis": "Hook詳細総評"
  },
  "videoStructureAnalysis": {
    "introduction": {
      "timeRange": "0-5秒",
      "purpose": "視聴者を引き込む",
      "whatHappens": "説明",
      "keyElements": ["Hook", "テーマ提示"],
      "effectiveness": "効果的",
      "engagementLevel": "高"
    },
    "risingAction": {
      "timeRange": "5-20秒",
      "purpose": "情報提供",
      "whatHappens": "説明",
      "keyElements": ["詳細情報", "感情構築"],
      "tensionBuilding": "緊張構築あり",
      "informationFlow": "適切",
      "effectiveness": "効果的"
    },
    "climax": {
      "timeRange": "20-25秒",
      "climaxType": "Visual",
      "peakMoment": "最重要瞬間",
      "visualPeak": "視覚的ピーク",
      "emotionalPeak": "感情的ピーク",
      "whyThisIsClimax": "理由",
      "effectiveness": "効果的"
    },
    "fallingAction": {
      "timeRange": "なし",
      "purpose": "なし",
      "whatHappens": "なし",
      "presence": "なし"
    },
    "conclusion": {
      "timeRange": "25-30秒",
      "purpose": "締めくくり",
      "whatHappens": "説明",
      "ctaPresence": true,
      "ctaType": "フォロー促進",
      "emotionalClose": "満足感",
      "finalImpression": "強い",
      "effectiveness": "効果的"
    },
    "structureQuality": {
      "overallScore": 8,
      "storyFlow": "滑らか",
      "narrativeClarity": "明確",
      "pacingAcrossStructure": "最適",
      "classicalStructureAdherence": "ほぼ",
      "structureEffectiveness": "高い"
    },
    "structureRecommendations": {
      "introductionLength": "適切",
      "climaxPosition": "適切",
      "conclusionStrength": "適切"
    },
    "analysis": "構造総評"
  },
  "themeIdentification": {
    "primaryTheme": {
      "category": "Showcase",
      "confidence": "明確",
      "description": "テーマ説明"
    },
    "secondaryThemes": [
      { "theme": "テーマ名", "description": "説明" },
      { "theme": "なし", "description": "なし" },
      { "theme": "なし", "description": "なし" }
    ],
    "contentPurpose": {
      "primaryPurpose": "To engage",
      "purposeClarity": "明確",
      "purposeAchievement": "ほぼ"
    },
    "targetAudience": {
      "audienceType": "Foodies",
      "audienceInterest": "発見",
      "audienceFit": "良好"
    },
    "contentTone": {
      "toneType": "Casual",
      "toneConsistency": "完全に一貫",
      "toneAppropriateness": "適切"
    },
    "uniqueAngle": {
      "hasUniqueAngle": true,
      "description": "独自性説明",
      "differentiationFactor": "差別化あり"
    },
    "themeEffectivenessScore": 8,
    "analysis": "テーマ総評"
  },
  "visualExpressionTechniques": {
    "colorPsychology": {
      "dominantColorPalette": "オレンジ、白、茶",
      "colorMood": "暖かい",
      "colorPurpose": "食欲増進",
      "colorConsistency": "完全に",
      "colorTransitions": "一貫",
      "colorGradingStyle": "ナチュラル"
    },
    "compositionTechniques": {
      "ruleOfThirds": "時々",
      "leadingLines": "なし",
      "symmetry": "なし",
      "framing": "なし",
      "negativeSpace": "普通",
      "depthLayering": "効果的",
      "subjectPlacement": "中央寄せ"
    },
    "motionDynamicElements": {
      "subjectMotion": "料理の調理",
      "motionQuality": "滑らか",
      "motionPurpose": "リアリティ",
      "speedVariation": "ノーマル",
      "motionEmotionLink": "やや"
    },
    "visualEffectsOverlays": {
      "overlayTypesUsed": ["なし"],
      "overlayPurpose": "なし",
      "overlayEffectiveness": "なし",
      "graphicElements": "なし",
      "graphicIntegration": "なし"
    },
    "visualHierarchyFocus": {
      "primaryFocus": "明確",
      "focusTechniques": ["ボケ効果", "照明"],
      "visualFlow": "自然",
      "attentionManagement": "ほぼ"
    },
    "visualStyleConsistency": {
      "consistencyScore": 8,
      "styleDescription": "カジュアル",
      "styleAppropriateness": "適切"
    },
    "visualExpressionScore": 8,
    "analysis": "視覚表現総評"
  },
  "filmingMethodDetails": {
    "cameraEquipment": {
      "cameraTypeEstimate": "スマートフォン",
      "cameraQuality": "アマチュア上級",
      "evidenceForEstimate": "判断理由"
    },
    "stabilizationSupport": {
      "stabilizationType": "ジンバル",
      "stabilizationQuality": "良好",
      "handheldVsStabilized": "完全安定"
    },
    "lightingSetup": {
      "primaryLightSource": "自然光",
      "lightQuality": "柔らかい",
      "lightDirection": "フロント",
      "lightColorTemperature": "暖色",
      "lightingConsistency": "一貫",
      "shadowManagement": "ソフト",
      "lightingMood": "明るく元気",
      "lightingScore": 8
    },
    "shootingStyle": {
      "styleCategory": "カジュアルvlog",
      "professionalLevel": "アマ上級",
      "styleConsistency": "一貫"
    },
    "focusDepthOfField": {
      "dofUsage": "シャロー",
      "focusTechnique": "オートフォーカス",
      "focusAccuracy": "良好",
      "bokehQuality": "普通",
      "dofPurpose": "被写体分離"
    },
    "frameRateShutterSpeed": {
      "estimatedFrameRate": "30fps",
      "motionBlur": "適切",
      "frameRatePurpose": "標準"
    },
    "audioRecordingQuality": {
      "audioQualityEstimate": "不明",
      "likelyAudioSetup": "不明"
    },
    "postProductionLevel": {
      "editComplexity": "中程度",
      "colorGradingLevel": "基本的",
      "vfxUsage": "なし",
      "postProductionTimeEstimate": "1-2時間"
    },
    "overallProductionValue": {
      "productionQualityScore": 7,
      "budgetEstimate": "ロー",
      "professionalVsDIY": "20%プロ"
    },
    "analysis": "撮影手法総評"
  },
  "bgmChangePointsTracking": {},
  "specificEditingTechniques": {},
  "cameraAnglesAnalysis": {},
  "cutCompositionAnalysis": {},
  "captionOverlayAnalysis": {},
  "visualAppealCinematography": {},
  "soundDesignAnalysis": {},
  "pacingRhythm": {},
  "retentionPrediction": {},
  "competitiveGapAnalysis": {},
  "erCorrelationAnalysis": {},
  "overallAssessment": {},
  "top3ActionableRecommendations": [],
  "summary": "総評400字"
}

REMINDER: 純粋なJSONのみ。{ で始まり } で終わる。マークダウン不可。`;
}

export function getInstagramVideoAnalysisPromptEng(postData = {}) {
  return `You're a video strategy analyst specializing in Instagram accounts with 100,000 followers.

[CRITICAL CONTEXT]
This account already has 100,000 followers. Therefore:
- "Fairly good" video quality isn't enough.
- Top 5-10% video quality is required.
- Find a critical differentiator, not just small improvements.

[SUBTITLE & VOICE-OVER DETECTION – STRICT MODE]

The AI MUST detect and extract ALL text and spoken audio inside the video.

Sources:
1. On-screen subtitles
2. Auto captions
3. Spoken narration (creator voice)
4. Voice-over recording
5. Dialogue captured during filming

CRITICAL DISTINCTION:
Separate clearly:

A) Audio Presence → Is there a human voice speaking?
B) Storytelling Depth → Is it factual info or personal/emotional narrative?

DO NOT say “no narration” if a human voice exists.
If voice is factual → classify as "Factual Voice-over"
If voice includes emotion/opinion/story → classify as "Personal Voice-over"

REQUIRED OUTPUT FIELDS:

subtitleDetected: true/false
subtitleLanguage: English/Japanese/Mixed/None
subtitleType: On-screen / Spoken / Both / None
subtitleClarity: Clear / Medium / Poor / None
subtitleArray: []  ← Extract ALL visible subtitle texts as array

voiceOverDetected: true/false
voiceOverType: None / Factual / Personal / Mixed
voiceOverTone: Informative / Emotional / Energetic / Calm / Neutral
voiceOverTranscript: [] ← Extract spoken words (exact if clear, estimate if unclear)

narrationDepthAnalysis:
- storytellingDepthScore (1-10)
- personalStoryPresent: true/false
- emotionalConnectionLevel: High / Medium / Low / None
- personalityVisibility: Strong / Moderate / Weak / None
- narrativeStyle: Objective / Review / Personal Story / Character-driven
- explanation: short but clear reasoning

[Post Data]
Username: ${postData.username || ''}
Caption: ${postData.caption || 'None'}
Location: ${postData.location || 'None'}
Video Duration: ${postData.duration || 0} seconds
Views: ${postData.views || 0}
Likes: ${postData.likes || 0}
Comments: ${postData.comments || 0}
ER: ${postData.er || 0}%
Posted: ${postData.postedDate || ''}

[Account Type: ${postData.accountType || 'general'}]
${postData.accountType === 'area_specific' ?
'Area-specific (e.g., Shibuya) → Requires overwhelming coverage and expertise within the area':
postData.accountType === 'general_tokyo' ?
'Coverage of the entire Tokyo area → Requires diversity and consistent visual branding':
'General'}

[Analysis Framework - 100K Demographics]

[ENHANCED SECTION 1: ULTRA-DETAILED MINUTE-BY-MINUTE BREAKDOWN]
## Comprehensive Timeline Analysis with Granular Details

**CRITICAL RULES FOR DETAILED BREAKDOWN:**
- Segment video by length:
* Under 15 seconds: Every 3 seconds (0-3 seconds, 3-6 seconds, 6-9 seconds, 9-12 seconds, 12-15 seconds)
* 16-30 seconds: Every 5 seconds (0-5 seconds, 5-10 seconds, (10-15 seconds, 15-20 seconds, 20-25 seconds, 25-30 seconds)
* 31-60 seconds: Every 10 seconds (0-10 seconds, 10-20 seconds, 20-30 seconds, 30-40 seconds, 40-50 seconds, 50-60 seconds)
* Over 60 seconds: Every 15 seconds

**Record in detail for each segment:**

1. **Visual Content (What is shown) - Super detailed version:**
- Main Subject: The main subject (food/people/store/scenery/product)
- Subject Details: The specific state of the subject (e.g., ramen - steaming, three slices of pork, plenty of green onions)
- Background Elements: What is in the background (in-store decoration/windows/other customers/kitchen)
- Visual Hierarchy: Where the eye first goes (food in the center → text in the upper left → waiter in the background)
- Color Dominance: Dominant color (70% orange, 20% white, 10% brown)
- Lighting Mood: Lighting mood (Warm/Bright/Dramatic/Soft)

2. **Camera Movement (Detailed Version):**
- Movement Type: Stationary/Pan/Tilt/Zoom/Dolly/Handheld/Gimbal
- Movement Speed: Very Slow/Slow/Normal/Fast/Very Fast
- Movement Direction: Left → Right/Right → Left/Up → Down/Down → Up/Front → Back/Back → Front/Circular
- Movement Smoothness: Completely Smooth/Slightly Smooth/Slightly Shaky/Shaky
- Camera Angle During Movement: High Angle/Eye Level/Low Angle/Bird's Eye

3. **Cut Type & Transition (Detailed Version):**
- Transition Type: Hard Cut/Dissolve/Fade/Wipe/Match Cut/Jump Cut/Zoom Transition/None
- Transition Duration: Instantaneous (0.1 seconds) / Short (0.3 seconds) / Normal (0.5 seconds) / Long (1 second+)
- Transition Effect: Smooth / Jerky / Impactful / Natural
- Why This Transition: Scene Change / Maintaining Tempo / Emotional Change / Emphasis / Surprise

4. **Text Overlay (Text Display) - Super Detailed:**
- Text Presence: Yes / No
- Text Count: Number of texts in this segment (1 / 2 / 3 or more)
- Text Content Array: ["Text 1", "Text 2", "Text 3"]
- Text Size Array: ["Large", "Medium", "Small"] (Size of each text)
- Text Color Array: ["White", "Yellow", "Red"] (Color of each text)
- Text Position Array: ["Top Center", "Bottom Left", "Right"] (Position of each text)
- Text Animation Array: ["Bounce", "Fade In", "None"] (Animation of each text)
- Text Background Array: ["Translucent Black", "None", "Color Box"]
- Text Font Style: Bold/Normal/Italic/Outline (as much as possible)
- Text Timing: Display timing (at the beginning/midway/end of the segment/always on)
- Text Readability: Very Readable/Readable/Somewhat Difficult/Difficult
- Text-Visual Sync: Synchronization between text and visuals (Perfect/Good/Average/Somewhat out of sync)

5. **Key Moment & Story Beat (Detailed Version):**
- Moment Type: Hook/Build-up/Transition/Climax/Resolution/CTA/Filler
- Emotional Beat: Excitement/Curiosity/Surprise/Empathy/Relief/Tension/Relaxation/FOMO/Appetite/Aspiration
- Story Purpose: Attention-grabbing/Information/Emotional Engagement/Brand Impression/Engagement
- Viewer Action Expected: Continue watching/Like/Comment/Save/Share/Profile visit/Abandon risk
- Impact Level: Very strong/Strong/Medium/Weak/None
- Detailed Description: What's happening in this segment (120 characters)

6. **BGM & Audio Status** - Detailed Version:**
- BGM Status: Start/Ongoing/Volume change/Tempo change/Stop/Silence/Restart
- BGM Volume Level: High (90-100%)/Medium (50-80%)/Low (20-40%)/Very low (0-20%)/Mute
- BGM Energy: High energy/Medium energy/Low energy/Quiet
- Estimated SFX: Likelihood of sound effects used in this segment (Sizzle/Bang/Smack/Swipe/None)
- Audio-Visual Sync: Audio-visual synchronization (Perfect/Good/Average/Estimated lag)

7. **Emotional Tone & Pacing** - Detailed Version:**
- Emotional Tone: Excited/Calm/Tension/Relaxed/Curious/Surprised/Happy/Neutral
- Pace: Very Fast/Fast/Normal/Slow/Very Slow
- Energy Level: Very High/High/Medium/Low/Very Low
- Viewer Engagement: High Engagement Expectation/Normal/Low Engagement Risk

**Required Output Format**
Return each segment as an array. Minimum 3 segments, maximum 8 segments.

[ENHANCED SECTION 2: ULTRA-DETAILED HOOK ANALYSIS (0-3 seconds)]
## First 3 Seconds Breakdown - Frame-by-Frame Analysis

**Opening hooks are the lifeblood of any video. Second-by-Second Analysis:**

**Second 0 (0.0-1.0) - The Make-or-Break Moment:**
- Opening Frame Content: What appears in the first frame (specifically)
- Visual Impact Score: 1-10 (Does it instantly catch the viewer's eye?)
- First Impression: The viewer's first emotion (surprise/curiosity/appetite/beauty/excitement/confusion)
- Hook Type: Food porn/people/text/motion/surprise/story start
- Scroll-Stopping Power: Scroll-Stopping power (very strong/strong/average/weak)
- Color Impact: Color impression in the first second (vivid/warm/cool/monochrome/pastel)
- Movement in First Second: Is there movement in the first second? (intense/slow/still)
- Audio Hook (guess): Is there an audio hook in the first second? (intense sound/music starts/silence/can't guess)

**First Second (1.0-2.0) - Retention Builder:**
- What Happens: What happens in the first second
- Visual Development: How the video unfolds (zoom/pan/cut/continue/text added)
- Information Added: Is new information added (text/subject change/context)?
- Curiosity Gap: Does it increase the viewer's desire to continue?
- Emotional Transition: Emotional change from 0 to 1 second (maintaining excitement/increasing curiosity/rising anticipation)

**Second Second (2.0-3.0 seconds) - Commitment Phase:**
- What Happens: What happens in the second second?
- Story Promise: Is it clear what this video has to offer?
- Value Proposition: Why viewers should continue watching this video?
- CTA or Direction: Can viewers predict what comes next?
- Retention Lock: Is the viewer committed at the 3-second mark?

**3-Second Overall Score:**
- Overall Hook Score: 1-10
- Hook Effectiveness: Does 90%+ of viewers watch for at least 3 seconds?
- Improvement Potential: Room for further improvement in hooks
- Best Practice Alignment: Comparison with the hook standard of the top 5% of videos

**Psychological Triggers Used:**
- FOMO (Fear of Missing Out): Yes/No
- Curiosity Gap: Yes/No
- Visual Beauty: Yes/No
- Surprise/Shock: Yes/No
- Social Proof: Yes/No
- Scarcity: Yes/No
- Food Porn (for food content): Yes/No
- Emotional Connection: Yes/No

[SECTION 3: VIDEO STRUCTURE ANALYSIS (Intro/Climax Framework)]
## Narrative Structure Breakdown - Story Arc Analysis

**Break down a video into a classic story structure:**

**1. Introduction - 0-X seconds**
**2. Rising Action - X-Y seconds**
**3. Climax - Y-Z seconds**
**4. Falling Action - Z-W seconds**
**5. Conclusion - W-End seconds**

[SECTION 4: THEME IDENTIFICATION]
Primary Theme, Secondary Themes, Content Purpose, Target Audience, Content Tone, Unique Angle

[SECTION 5: VISUAL EXPRESSION TECHNIQUES]
Color Psychology, Composition Techniques, Motion & Dynamic Elements, Visual Effects & Overlays, Visual Hierarchy & Focus Control, Visual Style Consistency

[SECTION 6: FILMING METHOD DETAILS]
Camera Equipment, Stabilization & Support, Lighting Setup, Shooting Style, Focus & Depth of Field, Frame Rate & Shutter Speed, Audio Recording Quality, Post-Production Level, Overall Production Value

[SECTION 7: NARRATION & PERSONALITY]
Evaluate separately:
- Human voice present?
- Is personality visible?
- Emotional storytelling strength?
- Ratio factual vs personal?

Output:
"narrationPersonalityEvaluation": {
  "humanVoicePresent": true/false,
  "voiceCategory": "None / Factual / Personal / Mixed",
  "personalityStrength": "Strong / Moderate / Weak / None",
  "emotionalStorytelling": "Strong / Medium / Weak / None",
  "factualVsPersonalRatio": "80% factual / 20% personal",
  "creatorBondPotential": "High / Medium / Low",
  "improvementFocus": "Clear improvement direction"
}
  
[EXISTING SECTIONS]
- BGM Change Points Tracking
- Specific Editing Techniques
- Camera Angles Analysis
- Cut Composition Analysis
-Caption Overlay Analysis
- Visual Appeal & Cinematography
- Sound Design Analysis
- Pacing & Rhythm
- Retention Prediction
- Competitive Gap Analysis
- ER Correlation Analysis
- Overall Assessment
- Top 3 Actionable Recommendations

[CRITICAL RULES]
1. Return only pure JSON (no Markdown)
2. Total scores are numeric (1-10, one decimal point is OK)
3. Make decisions definitively (no "it seems" or "it's possible")
4. Narrow improvement suggestions to "three things to do" (clear priorities)
5. ER correlation analysis is required (provide numerical evidence)
6. Analyze the entire video (beginning, middle, end)
7. Minute-by-Minute Breakdown: Required, very detailed, at least 3 segments
8. Hook Analysis (0-3 seconds): Required, broken down into 1-second segments
9. Video Structure: Required, clearly define intro/rising/climax/falling/conclusion
10. Theme Identification: Required, primary/secondary Please specify themes.
11. Visual Expression: Required. Detailed analysis of color, composition, movement, and effects.
12. Filming Method: Required. Inferential analysis of equipment, lighting, and style.

[Answer Format JSON]
{
"subtitleDetected": true/false,
"subtitleLanguage": "English/Japanese/Mixed/None",
"subtitleType": "On-screen / Spoken / Both / None",
"subtitleClarity": "Clear / Medium / Poor / None",
"subtitleArray": [],
"voiceOverDetected": false,
"voiceOverType": "",
"voiceOverTone": "",
"voiceOverTranscript": [],
"narrationDepthAnalysis": {},
"narrationPersonalityEvaluation": {},
"minuteByMinuteBreakdown": {
"totalDuration": ${postData.duration || 0},
"segmentSize": "Every 5 seconds",
"segmentCount": 3,
"segments": [
{
"timeRange": "0-5 seconds",
"visualContent": {
"mainSubject": "Description",
"subjectDetails": "Details",
"backgroundElements": "Background Elements",
"visualHierarchy": "Gaze Flow",
"colorDominance": "Color Proportion",
"lightingMood": "Lighting Mood"
},
"cameraMovement": {
"movementType": "Type",
"speed": "Speed",
"direction": "Direction",
"smoothness": "Smoothness",
"angle": "Angle"
},
"cutAndTransition": {
"transitionType": "Type",
"duration": "Length",
"effect": "Effect",
"purpose": "Purpose"
},
"textOverlay": {
"textPresence": true,
"textCount": 1,
"texts": [
{
"content": "Text content",
"size": "Large",
"color": "White",
"position": "Top center",
"animation": "Bounce in",
"background": "Translucent black",
"fontStyle": "Bold",
"timing": "At the start of the segment"
}
],
"readability": "Very readable",
"textVisualSync": "Perfect"
},
"keyMoment": {
"momentType": "Hook",
"emotionalBeat": "Appetite + FOMO",
"storyPurpose": "Immediately captures viewer attention",
"viewerActionExpected": "Continue watching",
"impactLevel": "Very strong",
"description": "Detailed description"
},
"bgmAudioStatus": {
"status": "Start",
"volumeLevel": "High (90%)",
"energy": "High energy",
"estimatedSFX": "None",
"audioVisualSync": "Good"
},
"emotionalToneAndPacing": {
"tone": "Excitement",
"pace": "Normal",
"energyLevel": "High",
"engagement": "High engagement expected"
}
}
],
"narrativeFlow": "Story flow evaluation",
"pacing": "Pace evaluation",
"score": 8,
"analysis": "Minute-by-Minute Summary"
},
"hookAnalysisDetailed": {
"firstSecond": {
"timeRange": "0.0-1.0 seconds",
"openingFrameContent": "Description",
"visualImpactScore": 8,
"firstImpression": "Appetite",
"hookType": "Food porn",
"scrollStoppingPower": "Strong",
"colorImpact": "Warm colors",
"movementInFirstSecond": "Slow",
"audioHook": "Music starts"
},
"secondSecond": {
"timeRange": "1.0-2.0 seconds",
"whatHappens": "Description",
"visualDevelopment": "Zoom",
"informationAdded": "Text added",
"curiosityGap": "High",
"emotionalTransition": "Increased curiosity"
},
"thirdSecond": {
"timeRange": "2.0-3.0 seconds",
"whatHappens": "Explanation",
"storyPromise": "Story Promise",
"valueProposition": "Value Proposition",
"ctaOrDirection": "Direction",
"retentionLock": "Confirmation"
},
"overallHookScore": 8,
"hookEffectiveness": "90%+ watch for 3 seconds or more",
"improvementPotential": "Explanation of room for improvement",
"bestPracticeAlignment": "Compared to top 5% norm",
"psychologicalTriggers": {
"fomo": false,
"curiosityGap": true,
"visualBeauty": true,
"surprise": false,
"socialProof": false,
"scarcity": false,
"foodPorn": true,
"emotionalConnection": false
},
"analysis": "Hook Detailed Review"
},
"videoStructureAnalysis": {
"introduction": {
"timeRange": "0-5 seconds",
"purpose": "Engage the viewer",
"whatHappens": "Explanation",
"keyElements": ["Hook", "Theme Presentation"],
"effectiveness": "Effective",
"engagementLevel": "High"
},
"risingAction": {
"timeRange": "5-20 seconds",
"purpose": "Information",
"whatHappens": "Explanation",
"keyElements": ["Detailed Information", "Emotion Building"],
"tensionBuilding": "Tension-building",
"informationFlow": "Appropriate",
"effectiveness": "Effective"
},
"climax": {
"timeRange": "20-25 seconds",
"climaxType": "Visual",
"peakMoment": "Moment of the moment",
"visualPeak": "Visual peak",
"emotionalPeak": "Emotional peak",
"whyThisIsClimax": "Reason",
"effectiveness": "Effective"
},
"fallingAction": {
"timeRange": "None",
"purpose": "None",
"whatHappens": "None",
"presence": "None"
},
"conclusion": {
"timeRange": "25-30 seconds",
"purpose": "Conclusion",
"whatHappens": "Explanation",
"ctaPresence": true,
"ctaType": "Follow-up promotion",
"emotionalClose": "Satisfaction",
"finalImpression": "Strong",
"effectiveness": "Effective"
},
"structureQuality": {
"overallScore": 8,
"storyFlow": "Smooth",
"narrativeClarity": "Clear",
"pacingAcrossStructure": "Optimal",
"classicalStructureAdherence": "Almost",
"structureEffectiveness": "High"
},
"structureRecommendations": {
"introductionLength": "Appropriate",
"climaxPosition": "Appropriate",
"conclusionStrength": "Appropriate"
},
"analysis": "Overall structure review"
},
"themeIdentification": {
"primaryTheme": {
"category": "Showcase",
"confidence": "Clear",
"description": "Theme description"
},
"secondaryThemes": [
{ "theme": "Theme Name", "description": "Description" },
{ "theme": "None", "description": "None" },
{ "theme": "None", "description": "None" }
],
"contentPurpose": {
"primaryPurpose": "To engage",
"purposeClarity": "Clear",
"purposeAchievement": "Almost"
},
"targetAudience": {
"audienceType": "Foodies",
"audienceInterest": "Discovery",
"audienceFit": "Good"
},
"contentTone": {
"toneType": "Casual",
"toneConsistency": "Fully Consistent",
"toneAppropriateness": "Appropriate"
},
"uniqueAngle": {
"hasUniqueAngle": true,
"description": "Uniqueness Description",
"differentiationFactor": "Differentiated"
},
"themeEffectivenessScore": 8,
"analysis": "Overall Theme Review"
},
"visualExpressionTechniques": {
"colorPsychology": {
"dominantColorPalette": "Orange, White, Brown",
"colorMood": "Warm",
"colorPurpose": "Appetite Stimulating",
"colorConsistency": "Complete",
"colorTransitions": "Consistent",
"colorGradingStyle": "Natural"
},
"compositionTechniques": {
"ruleOfThirds": "Occasionally",
"leadingLines": "None",
"symmetry": "None",
"framing": "None",
"negativeSpace": "Average",
"depthLayering": "Effective",
"subjectPlacement": "Centered"
},
"motionDynamicElements": {
"subjectMotion": "Cooking food",
"motionQuality": "Smooth",
"motionPurpose": "Realistic",
"speedVariation": "Normal",
"motionEmotionLink": "Slight"
},
"visualEffectsOverlays": {
"overlayTypesUsed": ["None"],
"overlayPurpose": "None",
"overlayEffectiveness": "None",
"graphicElements": "None",
"graphicIntegration": "None"
},
"visualHierarchyFocus": {
"primaryFocus": "Clear",
"focusTechniques": ["Bokeh", "Lighting"],
"visualFlow": "Natural",
"attentionManagement": "Almost"
},
"visualStyleConsistency": {
"consistencyScore": 8,
"styleDescription": "Casual",
"styleAppropriateness": "Appropriate"
},
"visualExpressionScore": 8,
"analysis": "Visual Expression Overall Evaluation"
},
"filmingMethodDetails": {
"cameraEquipment": {
"cameraTypeEstimate": "Smartphone",
"cameraQuality": "Advanced Amateur",
"evidenceForEstimate": "Reason for Evaluation"
},
"stabilizationSupport": {
"stabilizationType": "Gimbal",
"stabilizationQuality": "Good",
"handheldVsStabilized": "Fully Stabilized"
},
"lightingSetup": {
"primaryLightSource": "Natural Light",
"lightQuality": "Soft",
"lightDirection": "Front",
"lightColorTemperature": "Warm",
"lightingConsistency": "Consistent",
"shadowManagement": "Soft",
"lightingMood": "Bright and Lively",
"lightingScore": 8
},
"shootingStyle": {
"styleCategory": "Casual Vlog",
"professionalLevel": "Advanced Amateur",
"styleConsistency": "Consistent"
},
"focusDepthOfField": {
"dofUsage": "Shallow",
"focusTechnique": "Autofocus",
"focusAccuracy": "Good",
"bokehQuality": "Average",
"dofPurpose": "Subject Separation"
},
"frameRateShutterSpeed": {
"estimatedFrameRate": "30fps",
"motionBlur": "Good",
"frameRatePurpose": "Standard" 
}, 
"audioRecordingQuality": { 
"audioQualityEstimate": "Unknown", 
"likelyAudioSetup": "Unknown" 
}, 
"postProductionLlevel": {
"editComplexity": "Medium",
"colorGradingLevel": "Basic",
"vfxUsage": "None",
"postProductionTimeEstimate": "1-2 hours"
},
"overallProductionValue": {
"productionQualityScore": 7,
"budgetEstimate": "Low",
"professionalVsDIY": "20% Professional"
},
"analysis": "Overall Filming Techniques"
},
"bgmChangePointsTracking": {},
"specificEditingTechniques": {},
"cameraAnglesAnalysis": {},
"cutCompositionAnalysis": {},
"captionOverlayAnalysis": {},
"visualAppealCinematography": {},
"soundDesignAnalysis": {},
"pacingRhythm": {},
"retentionPrediction": {},
"competitiveGapAnalysis": {},
"erCorrelationAnalysis": {},
"overallAssessment": {},
"top3ActionableRecommendations": [],
"summary": "400 characters overall"
}

REMINDER: Pure JSON only. Starts with { and ends with }. Markdown not allowed. `;
}

/**
 * Prompt registry — add more prompt types here as needed
 */
export const PROMPTS = {
  INSTAGRAM_VIDEO_ANALYSIS: getInstagramVideoAnalysisPrompt,
  INSTAGRAM_VIDEO_ANALYSIS_ENG: getInstagramVideoAnalysisPromptEng,
};

/**
 * Generic prompt getter
 * @param {string} promptKey - Key from PROMPTS registry
 * @param {Object} params - Parameters to inject into the prompt
 * @returns {string} The rendered prompt
 */
export function getPrompt(promptKey, params = {}) {
  const promptFn = PROMPTS[promptKey];
  if (!promptFn) {
    throw new Error(`Prompt not found: ${promptKey}`);
  }
  return promptFn(params);
}