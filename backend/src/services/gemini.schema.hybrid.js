/**
 * HYBRID SCHEMA STRATEGY
 * ─────────────────────────────────────────────────────────────
 * STRICT enum enforcement → field yang dipakai FE untuk:
 *   - Render badge/chip (grade, impact, status)
 *   - Sorting & filtering (scores, priority)
 *   - Conditional display (boolean flags)
 *   - Chart data (numeric scores)
 *
 * FREE-FORM string → field narasi yang:
 *   - Hanya ditampilkan sebagai teks biasa
 *   - Tidak dipakai untuk logic/filter/sort
 *   - Penyebab utama "too many states" kalau di-enum
 *
 * Estimasi pengurangan states: ~65%
 * ─────────────────────────────────────────────────────────────
 */

export const ANALYSIS_SCHEMA_HYBRID = {
  type: 'object',
  properties: {

    // ── Subtitle ─────────────────────────────────────────────
    // STRICT: dipakai FE untuk conditional render
    subtitleDetected: { type: 'boolean' },
    subtitleLanguage: { type: 'string', enum: ['English', 'Japanese', 'Mixed', 'None'] },
    subtitleType:     { type: 'string', enum: ['On-screen', 'Spoken', 'Both', 'None'] },
    subtitleClarity:  { type: 'string', enum: ['Clear', 'Medium', 'Poor', 'None'] },
    subtitleArray:    { type: 'array', items: { type: 'string' } },

    // ── Voice-over ───────────────────────────────────────────
    // STRICT: dipakai FE untuk badge & filter
    voiceOverDetected:   { type: 'boolean' },
    voiceOverType:       { type: 'string', enum: ['None', 'Factual', 'Personal', 'Mixed'] },
    voiceOverTone:       { type: 'string', enum: ['Informative', 'Emotional', 'Energetic', 'Calm', 'Neutral', 'None'] },
    voiceOverTranscript: { type: 'array', items: { type: 'string' } },

    // ── Narration Depth ──────────────────────────────────────
    narrationDepthAnalysis: {
      type: 'object',
      properties: {
        storytellingDepthScore:   { type: 'number' },                                                            // STRICT: chart
        personalStoryPresent:     { type: 'boolean' },                                                           // STRICT: badge
        emotionalConnectionLevel: { type: 'string', enum: ['High', 'Medium', 'Low', 'None'] },                   // STRICT: badge
        personalityVisibility:    { type: 'string', enum: ['Strong', 'Moderate', 'Weak', 'None'] },              // STRICT: badge
        narrativeStyle:           { type: 'string', enum: ['Objective', 'Review', 'Personal Story', 'Character-driven'] }, // STRICT: filter
        explanation:              { type: 'string' },                                                            // free-form: teks biasa
      },
      required: ['storytellingDepthScore', 'personalStoryPresent', 'emotionalConnectionLevel',
                 'personalityVisibility', 'narrativeStyle', 'explanation'],
    },

    // ── Narration Personality ────────────────────────────────
    narrationPersonalityEvaluation: {
      type: 'object',
      properties: {
        humanVoicePresent:      { type: 'boolean' },                                                // STRICT
        voiceCategory:          { type: 'string', enum: ['None', 'Factual', 'Personal', 'Mixed'] },// STRICT
        personalityStrength:    { type: 'string', enum: ['Strong', 'Moderate', 'Weak', 'None'] },  // STRICT
        emotionalStorytelling:  { type: 'string', enum: ['Strong', 'Medium', 'Weak', 'None'] },    // STRICT
        factualVsPersonalRatio: { type: 'string' },   // free-form: "80% factual / 20% personal"
        creatorBondPotential:   { type: 'string', enum: ['High', 'Medium', 'Low'] },               // STRICT
        improvementFocus:       { type: 'string' },   // free-form: teks rekomendasi
      },
      required: ['humanVoicePresent', 'voiceCategory', 'personalityStrength',
                 'emotionalStorytelling', 'factualVsPersonalRatio', 'creatorBondPotential', 'improvementFocus'],
    },

    // ── Minute-by-Minute Breakdown ───────────────────────────
    // PENYEBAB UTAMA "too many states":
    //   - texts[] nested di dalam segments[] → dihapus enum, jadi free-form
    //   - purpose, direction, description → free-form
    //   - Enum yang benar-benar dipakai FE tetap strict
    minuteByMinuteBreakdown: {
      type: 'object',
      properties: {
        totalDuration: { type: 'number' },
        segmentSize:   { type: 'string' },
        segmentCount:  { type: 'number' },
        segments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timeRange: { type: 'string' },

              visualContent: {
                type: 'object',
                properties: {
                  mainSubject:        { type: 'string' },          // free-form
                  subjectDetails:     { type: 'string' },          // free-form
                  backgroundElements: { type: 'string' },          // free-form
                  visualHierarchy:    { type: 'string' },          // free-form
                  colorDominance:     { type: 'string' },          // free-form
                  lightingMood:       { type: 'string', enum: ['Warm', 'Bright', 'Dramatic', 'Soft', 'Mixed'] }, // STRICT: filter
                },
                required: ['mainSubject', 'subjectDetails', 'backgroundElements',
                           'visualHierarchy', 'colorDominance', 'lightingMood'],
              },

              cameraMovement: {
                type: 'object',
                properties: {
                  movementType: { type: 'string', enum: ['Stationary', 'Pan', 'Tilt', 'Zoom', 'Dolly', 'Handheld', 'Gimbal', 'Mixed'] }, // STRICT
                  speed:        { type: 'string', enum: ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'] },                          // STRICT
                  direction:    { type: 'string' },                                                                                       // free-form
                  smoothness:   { type: 'string', enum: ['Completely Smooth', 'Slightly Smooth', 'Slightly Shaky', 'Shaky'] },            // STRICT
                  angle:        { type: 'string', enum: ['High Angle', 'Eye Level', 'Low Angle', "Bird's Eye"] },                        // STRICT
                },
                required: ['movementType', 'speed', 'direction', 'smoothness', 'angle'],
              },

              cutAndTransition: {
                type: 'object',
                properties: {
                  transitionType: { type: 'string', enum: ['Hard Cut', 'Dissolve', 'Fade', 'Wipe', 'Match Cut', 'Jump Cut', 'Zoom Transition', 'None'] }, // STRICT
                  duration:       { type: 'string', enum: ['Instantaneous', 'Short', 'Normal', 'Long'] },                                                  // STRICT
                  effect:         { type: 'string', enum: ['Smooth', 'Jerky', 'Impactful', 'Natural'] },                                                   // STRICT
                  purpose:        { type: 'string' },                                                                                                       // free-form
                },
                required: ['transitionType', 'duration', 'effect', 'purpose'],
              },

              // textOverlay: texts[] nested array DIHAPUS ENUM-NYA
              // Ini kontributor terbesar "too many states"
              // FE cukup dapat textPresence (boolean) + textCount + raw content
              textOverlay: {
                type: 'object',
                properties: {
                  textPresence:   { type: 'boolean' },   // STRICT: conditional render
                  textCount:      { type: 'number' },    // STRICT: counter
                  textContent:    { type: 'string' },    // free-form: semua teks digabung jadi 1 string
                  readability:    { type: 'string', enum: ['Very Readable', 'Readable', 'Somewhat Difficult', 'Difficult', 'N/A'] }, // STRICT
                  textVisualSync: { type: 'string', enum: ['Perfect', 'Good', 'Average', 'Somewhat out of sync', 'N/A'] },          // STRICT
                },
                required: ['textPresence', 'textCount', 'textContent', 'readability', 'textVisualSync'],
              },

              keyMoment: {
                type: 'object',
                properties: {
                  momentType:           { type: 'string', enum: ['Hook', 'Build-up', 'Transition', 'Climax', 'Resolution', 'CTA', 'Filler'] }, // STRICT: timeline chip
                  emotionalBeat:        { type: 'string' },                                                                                     // free-form
                  storyPurpose:         { type: 'string' },                                                                                     // free-form
                  viewerActionExpected: { type: 'string', enum: ['Continue watching', 'Like', 'Comment', 'Save', 'Share', 'Profile visit', 'Abandon risk'] }, // STRICT: badge
                  impactLevel:          { type: 'string', enum: ['Very strong', 'Strong', 'Medium', 'Weak', 'None'] },                          // STRICT: badge
                  description:          { type: 'string' },                                                                                     // free-form
                },
                required: ['momentType', 'emotionalBeat', 'storyPurpose',
                           'viewerActionExpected', 'impactLevel', 'description'],
              },

              bgmAudioStatus: {
                type: 'object',
                properties: {
                  status:          { type: 'string', enum: ['Start', 'Ongoing', 'Volume change', 'Tempo change', 'Stop', 'Silence', 'Restart', 'Unknown'] }, // STRICT
                  volumeLevel:     { type: 'string', enum: ['High', 'Medium', 'Low', 'Very Low', 'Mute', 'Unknown'] },                                       // STRICT
                  energy:          { type: 'string', enum: ['High energy', 'Medium energy', 'Low energy', 'Quiet', 'Unknown'] },                             // STRICT
                  estimatedSFX:    { type: 'string' },                                                                                                       // free-form
                  audioVisualSync: { type: 'string', enum: ['Perfect', 'Good', 'Average', 'Estimated lag', 'Unknown'] },                                     // STRICT
                },
                required: ['status', 'volumeLevel', 'energy', 'estimatedSFX', 'audioVisualSync'],
              },

              emotionalToneAndPacing: {
                type: 'object',
                properties: {
                  tone:        { type: 'string' },                                                                              // free-form
                  pace:        { type: 'string', enum: ['Very Fast', 'Fast', 'Normal', 'Slow', 'Very Slow'] },                 // STRICT
                  energyLevel: { type: 'string', enum: ['Very High', 'High', 'Medium', 'Low', 'Very Low'] },                  // STRICT
                  engagement:  { type: 'string', enum: ['High Engagement Expected', 'Normal', 'Low Engagement Risk'] },       // STRICT
                },
                required: ['tone', 'pace', 'energyLevel', 'engagement'],
              },
            },
            required: ['timeRange', 'visualContent', 'cameraMovement', 'cutAndTransition',
                       'textOverlay', 'keyMoment', 'bgmAudioStatus', 'emotionalToneAndPacing'],
          },
        },
        narrativeFlow: { type: 'string' },  // free-form
        pacing:        { type: 'string' },  // free-form
        score:         { type: 'number' },  // STRICT: chart
        analysis:      { type: 'string' },  // free-form
      },
      required: ['totalDuration', 'segmentSize', 'segmentCount', 'segments',
                 'narrativeFlow', 'pacing', 'score', 'analysis'],
    },

    // ── Hook Analysis ────────────────────────────────────────
    hookAnalysisDetailed: {
      type: 'object',
      properties: {
        firstSecond: {
          type: 'object',
          properties: {
            timeRange:             { type: 'string' },
            openingFrameContent:   { type: 'string' },                                                                  // free-form
            visualImpactScore:     { type: 'number' },                                                                  // STRICT: score
            firstImpression:       { type: 'string' },                                                                  // free-form
            hookType:              { type: 'string' },                                                                  // free-form
            scrollStoppingPower:   { type: 'string', enum: ['Very Strong', 'Strong', 'Average', 'Weak'] },             // STRICT: badge
            colorImpact:           { type: 'string' },                                                                  // free-form
            movementInFirstSecond: { type: 'string', enum: ['Intense', 'Slow', 'Still'] },                             // STRICT
            audioHook:             { type: 'string' },                                                                  // free-form
          },
          required: ['timeRange', 'openingFrameContent', 'visualImpactScore', 'firstImpression',
                     'hookType', 'scrollStoppingPower', 'colorImpact', 'movementInFirstSecond', 'audioHook'],
        },
        secondSecond: {
          type: 'object',
          properties: {
            timeRange:           { type: 'string' },
            whatHappens:         { type: 'string' },          // free-form
            visualDevelopment:   { type: 'string' },          // free-form
            informationAdded:    { type: 'string' },          // free-form
            curiosityGap:        { type: 'string', enum: ['High', 'Medium', 'Low'] }, // STRICT
            emotionalTransition: { type: 'string' },          // free-form
          },
          required: ['timeRange', 'whatHappens', 'visualDevelopment',
                     'informationAdded', 'curiosityGap', 'emotionalTransition'],
        },
        thirdSecond: {
          type: 'object',
          properties: {
            timeRange:        { type: 'string' },
            whatHappens:      { type: 'string' },    // free-form
            storyPromise:     { type: 'string' },    // free-form
            valueProposition: { type: 'string' },    // free-form
            ctaOrDirection:   { type: 'string' },    // free-form
            retentionLock:    { type: 'string', enum: ['Confirmed', 'Likely', 'Uncertain', 'At Risk'] }, // STRICT: badge
          },
          required: ['timeRange', 'whatHappens', 'storyPromise',
                     'valueProposition', 'ctaOrDirection', 'retentionLock'],
        },
        overallHookScore:      { type: 'number' },   // STRICT: score display
        hookEffectiveness:     { type: 'string' },   // free-form
        improvementPotential:  { type: 'string' },   // free-form
        bestPracticeAlignment: { type: 'string' },   // free-form
        psychologicalTriggers: {
          type: 'object',
          properties: {
            fomo:               { type: 'boolean' }, // STRICT: semua boolean
            curiosityGap:       { type: 'boolean' },
            visualBeauty:       { type: 'boolean' },
            surprise:           { type: 'boolean' },
            socialProof:        { type: 'boolean' },
            scarcity:           { type: 'boolean' },
            foodPorn:           { type: 'boolean' },
            emotionalConnection:{ type: 'boolean' },
          },
          required: ['fomo', 'curiosityGap', 'visualBeauty', 'surprise',
                     'socialProof', 'scarcity', 'foodPorn', 'emotionalConnection'],
        },
        analysis: { type: 'string' }, // free-form
      },
      required: ['firstSecond', 'secondSecond', 'thirdSecond', 'overallHookScore',
                 'hookEffectiveness', 'improvementPotential', 'bestPracticeAlignment',
                 'psychologicalTriggers', 'analysis'],
    },

    // ── Video Structure ──────────────────────────────────────
    videoStructureAnalysis: {
      type: 'object',
      properties: {
        introduction: {
          type: 'object',
          properties: {
            timeRange:       { type: 'string' },
            purpose:         { type: 'string' },   // free-form
            whatHappens:     { type: 'string' },   // free-form
            keyElements:     { type: 'array', items: { type: 'string' } },
            effectiveness:   { type: 'string', enum: ['Very Effective', 'Effective', 'Average', 'Weak'] }, // STRICT
            engagementLevel: { type: 'string', enum: ['High', 'Medium', 'Low'] },                         // STRICT
          },
          required: ['timeRange', 'purpose', 'whatHappens', 'keyElements', 'effectiveness', 'engagementLevel'],
        },
        risingAction: {
          type: 'object',
          properties: {
            timeRange:       { type: 'string' },
            purpose:         { type: 'string' },   // free-form
            whatHappens:     { type: 'string' },   // free-form
            keyElements:     { type: 'array', items: { type: 'string' } },
            tensionBuilding: { type: 'string' },   // free-form
            informationFlow: { type: 'string', enum: ['Appropriate', 'Too Fast', 'Too Slow', 'Uneven'] }, // STRICT
            effectiveness:   { type: 'string', enum: ['Very Effective', 'Effective', 'Average', 'Weak'] }, // STRICT
          },
          required: ['timeRange', 'purpose', 'whatHappens', 'keyElements',
                     'tensionBuilding', 'informationFlow', 'effectiveness'],
        },
        climax: {
          type: 'object',
          properties: {
            timeRange:       { type: 'string' },
            climaxType:      { type: 'string', enum: ['Visual', 'Emotional', 'Informational', 'Combined'] }, // STRICT
            peakMoment:      { type: 'string' },   // free-form
            visualPeak:      { type: 'string' },   // free-form
            emotionalPeak:   { type: 'string' },   // free-form
            whyThisIsClimax: { type: 'string' },   // free-form
            effectiveness:   { type: 'string', enum: ['Very Effective', 'Effective', 'Average', 'Weak'] }, // STRICT
          },
          required: ['timeRange', 'climaxType', 'peakMoment', 'visualPeak',
                     'emotionalPeak', 'whyThisIsClimax', 'effectiveness'],
        },
        fallingAction: {
          type: 'object',
          properties: {
            timeRange:   { type: 'string' },
            purpose:     { type: 'string' },   // free-form
            whatHappens: { type: 'string' },   // free-form
            presence:    { type: 'string', enum: ['Present', 'None', 'Minimal'] }, // STRICT
          },
          required: ['timeRange', 'purpose', 'whatHappens', 'presence'],
        },
        conclusion: {
          type: 'object',
          properties: {
            timeRange:       { type: 'string' },
            purpose:         { type: 'string' },   // free-form
            whatHappens:     { type: 'string' },   // free-form
            ctaPresence:     { type: 'boolean' },  // STRICT
            ctaType:         { type: 'string' },   // free-form
            emotionalClose:  { type: 'string' },   // free-form
            finalImpression: { type: 'string', enum: ['Very Strong', 'Strong', 'Average', 'Weak'] }, // STRICT
            effectiveness:   { type: 'string', enum: ['Very Effective', 'Effective', 'Average', 'Weak'] }, // STRICT
          },
          required: ['timeRange', 'purpose', 'whatHappens', 'ctaPresence',
                     'ctaType', 'emotionalClose', 'finalImpression', 'effectiveness'],
        },
        structureQuality: {
          type: 'object',
          properties: {
            overallScore:                { type: 'number' },  // STRICT
            storyFlow:                   { type: 'string', enum: ['Very Smooth', 'Smooth', 'Average', 'Choppy'] },       // STRICT
            narrativeClarity:            { type: 'string', enum: ['Very Clear', 'Clear', 'Average', 'Unclear'] },        // STRICT
            pacingAcrossStructure:       { type: 'string', enum: ['Optimal', 'Good', 'Uneven', 'Poor'] },                // STRICT
            classicalStructureAdherence: { type: 'string', enum: ['Full', 'Almost', 'Partial', 'None'] },               // STRICT
            structureEffectiveness:      { type: 'string', enum: ['Very High', 'High', 'Medium', 'Low'] },              // STRICT
          },
          required: ['overallScore', 'storyFlow', 'narrativeClarity',
                     'pacingAcrossStructure', 'classicalStructureAdherence', 'structureEffectiveness'],
        },
        structureRecommendations: {
          type: 'object',
          properties: {
            introductionLength: { type: 'string', enum: ['Too Long', 'Appropriate', 'Too Short'] }, // STRICT
            climaxPosition:     { type: 'string', enum: ['Too Early', 'Appropriate', 'Too Late'] }, // STRICT
            conclusionStrength: { type: 'string', enum: ['Very Strong', 'Strong', 'Weak', 'Missing'] }, // STRICT
          },
          required: ['introductionLength', 'climaxPosition', 'conclusionStrength'],
        },
        analysis: { type: 'string' }, // free-form
      },
      required: ['introduction', 'risingAction', 'climax', 'fallingAction',
                 'conclusion', 'structureQuality', 'structureRecommendations', 'analysis'],
    },

    // ── Theme ────────────────────────────────────────────────
    themeIdentification: {
      type: 'object',
      properties: {
        primaryTheme: {
          type: 'object',
          properties: {
            category:    { type: 'string' },   // free-form: terlalu banyak kategori untuk di-enum
            confidence:  { type: 'string', enum: ['Clear', 'Likely', 'Uncertain'] }, // STRICT
            description: { type: 'string' },   // free-form
          },
          required: ['category', 'confidence', 'description'],
        },
        secondaryThemes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              theme:       { type: 'string' }, // free-form
              description: { type: 'string' }, // free-form
            },
            required: ['theme', 'description'],
          },
        },
        contentPurpose: {
          type: 'object',
          properties: {
            primaryPurpose:     { type: 'string' },  // free-form
            purposeClarity:     { type: 'string', enum: ['Very Clear', 'Clear', 'Somewhat Clear', 'Unclear'] }, // STRICT
            purposeAchievement: { type: 'string', enum: ['Fully', 'Almost', 'Partially', 'Not Achieved'] },     // STRICT
          },
          required: ['primaryPurpose', 'purposeClarity', 'purposeAchievement'],
        },
        targetAudience: {
          type: 'object',
          properties: {
            audienceType:     { type: 'string' },  // free-form
            audienceInterest: { type: 'string' },  // free-form
            audienceFit:      { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor'] }, // STRICT
          },
          required: ['audienceType', 'audienceInterest', 'audienceFit'],
        },
        contentTone: {
          type: 'object',
          properties: {
            toneType:            { type: 'string' },  // free-form
            toneConsistency:     { type: 'string', enum: ['Fully Consistent', 'Mostly Consistent', 'Inconsistent'] },           // STRICT
            toneAppropriateness: { type: 'string', enum: ['Highly Appropriate', 'Appropriate', 'Somewhat Inappropriate', 'Inappropriate'] }, // STRICT
          },
          required: ['toneType', 'toneConsistency', 'toneAppropriateness'],
        },
        uniqueAngle: {
          type: 'object',
          properties: {
            hasUniqueAngle:        { type: 'boolean' }, // STRICT
            description:           { type: 'string' },  // free-form
            differentiationFactor: { type: 'string', enum: ['Highly Differentiated', 'Differentiated', 'Somewhat Differentiated', 'Generic'] }, // STRICT
          },
          required: ['hasUniqueAngle', 'description', 'differentiationFactor'],
        },
        themeEffectivenessScore: { type: 'number' }, // STRICT
        analysis:                { type: 'string' }, // free-form
      },
      required: ['primaryTheme', 'secondaryThemes', 'contentPurpose', 'targetAudience',
                 'contentTone', 'uniqueAngle', 'themeEffectivenessScore', 'analysis'],
    },

    // ── Visual Expression ────────────────────────────────────
    visualExpressionTechniques: {
      type: 'object',
      properties: {
        colorPsychology: {
          type: 'object',
          properties: {
            dominantColorPalette: { type: 'string' },  // free-form
            colorMood:            { type: 'string' },  // free-form
            colorPurpose:         { type: 'string' },  // free-form
            colorConsistency:     { type: 'string', enum: ['Complete', 'Mostly', 'Partial', 'Inconsistent'] }, // STRICT
            colorTransitions:     { type: 'string' },  // free-form
            colorGradingStyle:    { type: 'string', enum: ['Natural', 'Cinematic', 'Vintage', 'Vibrant', 'Desaturated', 'Custom'] }, // STRICT
          },
          required: ['dominantColorPalette', 'colorMood', 'colorPurpose',
                     'colorConsistency', 'colorTransitions', 'colorGradingStyle'],
        },
        compositionTechniques: {
          type: 'object',
          properties: {
            ruleOfThirds:     { type: 'string', enum: ['Always', 'Frequently', 'Occasionally', 'Rarely', 'None'] }, // STRICT
            leadingLines:     { type: 'string', enum: ['Effective', 'Present', 'Minimal', 'None'] },                // STRICT
            symmetry:         { type: 'string', enum: ['Strong', 'Present', 'Minimal', 'None'] },                  // STRICT
            framing:          { type: 'string', enum: ['Strong', 'Present', 'Minimal', 'None'] },                  // STRICT
            negativeSpace:    { type: 'string', enum: ['Effective', 'Average', 'Underused', 'None'] },             // STRICT
            depthLayering:    { type: 'string', enum: ['Very Effective', 'Effective', 'Average', 'None'] },        // STRICT
            subjectPlacement: { type: 'string' }, // free-form
          },
          required: ['ruleOfThirds', 'leadingLines', 'symmetry', 'framing',
                     'negativeSpace', 'depthLayering', 'subjectPlacement'],
        },
        motionDynamicElements: {
          type: 'object',
          properties: {
            subjectMotion:     { type: 'string' },  // free-form
            motionQuality:     { type: 'string', enum: ['Very Smooth', 'Smooth', 'Average', 'Choppy'] },      // STRICT
            motionPurpose:     { type: 'string' },  // free-form
            speedVariation:    { type: 'string', enum: ['Dynamic', 'Normal', 'Static', 'Mixed'] },            // STRICT
            motionEmotionLink: { type: 'string', enum: ['Strong', 'Moderate', 'Slight', 'None'] },            // STRICT
          },
          required: ['subjectMotion', 'motionQuality', 'motionPurpose', 'speedVariation', 'motionEmotionLink'],
        },
        visualEffectsOverlays: {
          type: 'object',
          properties: {
            overlayTypesUsed:     { type: 'array', items: { type: 'string' } },
            overlayPurpose:       { type: 'string' },  // free-form
            overlayEffectiveness: { type: 'string', enum: ['Very Effective', 'Effective', 'Average', 'Ineffective', 'None'] }, // STRICT
            graphicElements:      { type: 'string' },  // free-form
            graphicIntegration:   { type: 'string', enum: ['Seamless', 'Good', 'Average', 'Poor', 'None'] }, // STRICT
          },
          required: ['overlayTypesUsed', 'overlayPurpose', 'overlayEffectiveness',
                     'graphicElements', 'graphicIntegration'],
        },
        visualHierarchyFocus: {
          type: 'object',
          properties: {
            primaryFocus:        { type: 'string', enum: ['Very Clear', 'Clear', 'Average', 'Unclear'] }, // STRICT
            focusTechniques:     { type: 'array', items: { type: 'string' } },
            visualFlow:          { type: 'string', enum: ['Natural', 'Guided', 'Confusing', 'None'] },   // STRICT
            attentionManagement: { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor'] },     // STRICT
          },
          required: ['primaryFocus', 'focusTechniques', 'visualFlow', 'attentionManagement'],
        },
        visualStyleConsistency: {
          type: 'object',
          properties: {
            consistencyScore:     { type: 'number' }, // STRICT
            styleDescription:     { type: 'string' }, // free-form
            styleAppropriateness: { type: 'string', enum: ['Highly Appropriate', 'Appropriate', 'Average', 'Inappropriate'] }, // STRICT
          },
          required: ['consistencyScore', 'styleDescription', 'styleAppropriateness'],
        },
        visualExpressionScore: { type: 'number' }, // STRICT
        analysis:              { type: 'string' },  // free-form
      },
      required: ['colorPsychology', 'compositionTechniques', 'motionDynamicElements',
                 'visualEffectsOverlays', 'visualHierarchyFocus', 'visualStyleConsistency',
                 'visualExpressionScore', 'analysis'],
    },

    // ── Filming Method ───────────────────────────────────────
    filmingMethodDetails: {
      type: 'object',
      properties: {
        cameraEquipment: {
          type: 'object',
          properties: {
            cameraTypeEstimate:  { type: 'string', enum: ['Smartphone', 'Mirrorless', 'DSLR', 'Action Camera', 'Unknown'] }, // STRICT
            cameraQuality:       { type: 'string', enum: ['Professional', 'Advanced Amateur', 'Amateur', 'Unknown'] },       // STRICT
            evidenceForEstimate: { type: 'string' }, // free-form
          },
          required: ['cameraTypeEstimate', 'cameraQuality', 'evidenceForEstimate'],
        },
        stabilizationSupport: {
          type: 'object',
          properties: {
            stabilizationType:    { type: 'string', enum: ['Gimbal', 'Tripod', 'Handheld', 'OIS Only', 'Unknown'] },                          // STRICT
            stabilizationQuality: { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor'] },                                         // STRICT
            handheldVsStabilized: { type: 'string', enum: ['Fully Stabilized', 'Mostly Stabilized', 'Mixed', 'Handheld'] },                   // STRICT
          },
          required: ['stabilizationType', 'stabilizationQuality', 'handheldVsStabilized'],
        },
        lightingSetup: {
          type: 'object',
          properties: {
            primaryLightSource:    { type: 'string', enum: ['Natural Light', 'Ring Light', 'Softbox', 'Mixed', 'Unknown'] }, // STRICT
            lightQuality:          { type: 'string', enum: ['Professional', 'Soft', 'Harsh', 'Mixed'] },                    // STRICT
            lightDirection:        { type: 'string', enum: ['Front', 'Side', 'Back', 'Top', 'Mixed'] },                    // STRICT
            lightColorTemperature: { type: 'string', enum: ['Warm', 'Neutral', 'Cool', 'Mixed'] },                         // STRICT
            lightingConsistency:   { type: 'string', enum: ['Consistent', 'Mostly Consistent', 'Inconsistent'] },          // STRICT
            shadowManagement:      { type: 'string', enum: ['Professional', 'Good', 'Soft', 'Harsh', 'Poor'] },            // STRICT
            lightingMood:          { type: 'string' },  // free-form
            lightingScore:         { type: 'number' },  // STRICT
          },
          required: ['primaryLightSource', 'lightQuality', 'lightDirection', 'lightColorTemperature',
                     'lightingConsistency', 'shadowManagement', 'lightingMood', 'lightingScore'],
        },
        shootingStyle: {
          type: 'object',
          properties: {
            styleCategory:     { type: 'string' },  // free-form
            professionalLevel: { type: 'string', enum: ['Professional', 'Advanced Amateur', 'Amateur'] }, // STRICT
            styleConsistency:  { type: 'string', enum: ['Consistent', 'Mostly Consistent', 'Inconsistent'] }, // STRICT
          },
          required: ['styleCategory', 'professionalLevel', 'styleConsistency'],
        },
        focusDepthOfField: {
          type: 'object',
          properties: {
            dofUsage:       { type: 'string', enum: ['Shallow', 'Deep', 'Mixed', 'Unknown'] },                           // STRICT
            focusTechnique: { type: 'string', enum: ['Autofocus', 'Manual', 'Mixed', 'Unknown'] },                      // STRICT
            focusAccuracy:  { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor'] },                         // STRICT
            bokehQuality:   { type: 'string', enum: ['Professional', 'Good', 'Average', 'Minimal', 'None'] },           // STRICT
            dofPurpose:     { type: 'string' }, // free-form
          },
          required: ['dofUsage', 'focusTechnique', 'focusAccuracy', 'bokehQuality', 'dofPurpose'],
        },
        frameRateShutterSpeed: {
          type: 'object',
          properties: {
            estimatedFrameRate: { type: 'string', enum: ['24fps', '30fps', '60fps', '120fps', 'Unknown'] },              // STRICT
            motionBlur:         { type: 'string', enum: ['Cinematic', 'Good', 'Minimal', 'Excessive'] },                // STRICT
            frameRatePurpose:   { type: 'string', enum: ['Standard', 'Cinematic', 'Slow Motion', 'Smooth'] },          // STRICT
          },
          required: ['estimatedFrameRate', 'motionBlur', 'frameRatePurpose'],
        },
        audioRecordingQuality: {
          type: 'object',
          properties: {
            audioQualityEstimate: { type: 'string', enum: ['Professional', 'Good', 'Average', 'Poor', 'Unknown'] }, // STRICT
            likelyAudioSetup:     { type: 'string', enum: ['External Mic', 'Lavalier', 'Built-in', 'Unknown'] },    // STRICT
          },
          required: ['audioQualityEstimate', 'likelyAudioSetup'],
        },
        postProductionLevel: {
          type: 'object',
          properties: {
            editComplexity:             { type: 'string', enum: ['High', 'Medium', 'Low', 'Minimal'] },                         // STRICT
            colorGradingLevel:          { type: 'string', enum: ['Professional', 'Advanced', 'Basic', 'None'] },                // STRICT
            vfxUsage:                   { type: 'string', enum: ['Heavy', 'Moderate', 'Minimal', 'None'] },                     // STRICT
            postProductionTimeEstimate: { type: 'string' }, // free-form: "1-2 hours"
          },
          required: ['editComplexity', 'colorGradingLevel', 'vfxUsage', 'postProductionTimeEstimate'],
        },
        overallProductionValue: {
          type: 'object',
          properties: {
            productionQualityScore: { type: 'number' }, // STRICT
            budgetEstimate:         { type: 'string', enum: ['High', 'Medium', 'Low', 'Minimal'] }, // STRICT
            professionalVsDIY:      { type: 'string' }, // free-form: "30% Professional / 70% DIY"
          },
          required: ['productionQualityScore', 'budgetEstimate', 'professionalVsDIY'],
        },
        analysis: { type: 'string' }, // free-form
      },
      required: ['cameraEquipment', 'stabilizationSupport', 'lightingSetup', 'shootingStyle',
                 'focusDepthOfField', 'frameRateShutterSpeed', 'audioRecordingQuality',
                 'postProductionLevel', 'overallProductionValue', 'analysis'],
    },

    // ── BGM ──────────────────────────────────────────────────
    bgmChangePointsTracking: {
      type: 'object',
      properties: {
        totalBgmChanges:    { type: 'number' },   // STRICT
        hasIdentifiableBgm: { type: 'boolean' },  // STRICT
        changePoints: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timeStamp:   { type: 'string' },
              changeType:  { type: 'string', enum: ['Start', 'Volume Up', 'Volume Down', 'Tempo Change', 'Track Switch', 'Stop', 'Fade Out'] }, // STRICT
              description: { type: 'string' },  // free-form
              impact:      { type: 'string', enum: ['High', 'Medium', 'Low'] }, // STRICT
            },
            required: ['timeStamp', 'changeType', 'description', 'impact'],
          },
        },
        overallBgmStrategy:  { type: 'string' },  // free-form
        bgmEmotionAlignment: { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor', 'None'] }, // STRICT
        analysis:            { type: 'string' },  // free-form
      },
      required: ['totalBgmChanges', 'hasIdentifiableBgm', 'changePoints',
                 'overallBgmStrategy', 'bgmEmotionAlignment', 'analysis'],
    },

    // ── Editing ──────────────────────────────────────────────
    specificEditingTechniques: {
      type: 'object',
      properties: {
        cutFrequency:       { type: 'string', enum: ['Very High', 'High', 'Medium', 'Low', 'Very Low'] }, // STRICT
        dominantTransition: { type: 'string' },   // free-form
        rhythmicEditing:    { type: 'boolean' },  // STRICT
        beatSyncEditing:    { type: 'boolean' },  // STRICT
        jumpCutsUsed:       { type: 'boolean' },  // STRICT
        slowMotionUsed:     { type: 'boolean' },  // STRICT
        timelapseUsed:      { type: 'boolean' },  // STRICT
        splitScreenUsed:    { type: 'boolean' },  // STRICT
        textAnimationStyle: { type: 'string' },   // free-form
        editingScore:       { type: 'number' },   // STRICT
        editingConsistency: { type: 'string', enum: ['Consistent', 'Mostly Consistent', 'Inconsistent'] }, // STRICT
        analysis:           { type: 'string' },   // free-form
      },
      required: ['cutFrequency', 'dominantTransition', 'rhythmicEditing', 'beatSyncEditing',
                 'jumpCutsUsed', 'slowMotionUsed', 'timelapseUsed', 'splitScreenUsed',
                 'textAnimationStyle', 'editingScore', 'editingConsistency', 'analysis'],
    },

    // ── Camera Angles ────────────────────────────────────────
    cameraAnglesAnalysis: {
      type: 'object',
      properties: {
        primaryAngle:       { type: 'string', enum: ['Eye Level', 'High Angle', 'Low Angle', "Bird's Eye", 'Dutch Tilt', 'Mixed'] }, // STRICT
        angleVariety:       { type: 'string', enum: ['High', 'Medium', 'Low'] }, // STRICT
        anglesPurpose:      { type: 'string' },  // free-form
        mostImpactfulAngle: { type: 'string' },  // free-form
        angleScore:         { type: 'number' },  // STRICT
        analysis:           { type: 'string' },  // free-form
      },
      required: ['primaryAngle', 'angleVariety', 'anglesPurpose', 'mostImpactfulAngle', 'angleScore', 'analysis'],
    },

    // ── Cut Composition ──────────────────────────────────────
    cutCompositionAnalysis: {
      type: 'object',
      properties: {
        totalEstimatedCuts:  { type: 'number' },  // STRICT
        averageShotDuration: { type: 'string' },  // free-form: "2.3 seconds"
        cutRhythm:           { type: 'string', enum: ['Consistent', 'Varied', 'Erratic'] }, // STRICT
        compositionScore:    { type: 'number' },  // STRICT
        shortestShot:        { type: 'string' },  // free-form
        longestShot:         { type: 'string' },  // free-form
        analysis:            { type: 'string' },  // free-form
      },
      required: ['totalEstimatedCuts', 'averageShotDuration', 'cutRhythm',
                 'compositionScore', 'shortestShot', 'longestShot', 'analysis'],
    },

    // ── Caption ──────────────────────────────────────────────
    captionOverlayAnalysis: {
      type: 'object',
      properties: {
        overallCaptionStrategy:  { type: 'string' },  // free-form
        captionConsistency:      { type: 'string', enum: ['Consistent', 'Mostly Consistent', 'Inconsistent', 'None'] }, // STRICT
        captionReadabilityScore: { type: 'number' },  // STRICT
        captionTimingAccuracy:   { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor', 'N/A'] },            // STRICT
        brandingIntegration:     { type: 'string', enum: ['Strong', 'Moderate', 'Weak', 'None'] },                     // STRICT
        captionScore:            { type: 'number' },  // STRICT
        analysis:                { type: 'string' },  // free-form
      },
      required: ['overallCaptionStrategy', 'captionConsistency', 'captionReadabilityScore',
                 'captionTimingAccuracy', 'brandingIntegration', 'captionScore', 'analysis'],
    },

    // ── Visual Appeal ────────────────────────────────────────
    visualAppealCinematography: {
      type: 'object',
      properties: {
        aestheticScore:         { type: 'number' },  // STRICT
        cinematographyScore:    { type: 'number' },  // STRICT
        productionValueScore:   { type: 'number' },  // STRICT
        overallVisualScore:     { type: 'number' },  // STRICT
        strengths:              { type: 'array', items: { type: 'string' } },
        weaknesses:             { type: 'array', items: { type: 'string' } },
        competitiveVisualLevel: { type: 'string', enum: ['Top 5%', 'Top 10%', 'Top 25%', 'Average', 'Below Average'] }, // STRICT
        analysis:               { type: 'string' },  // free-form
      },
      required: ['aestheticScore', 'cinematographyScore', 'productionValueScore', 'overallVisualScore',
                 'strengths', 'weaknesses', 'competitiveVisualLevel', 'analysis'],
    },

    // ── Sound Design ─────────────────────────────────────────
    soundDesignAnalysis: {
      type: 'object',
      properties: {
        bgmGenre:          { type: 'string' },  // free-form: terlalu banyak genre untuk di-enum
        bgmTempo:          { type: 'string', enum: ['Very Fast', 'Fast', 'Medium', 'Slow', 'Very Slow', 'Unknown'] }, // STRICT
        bgmMoodMatch:      { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor', 'None'] },               // STRICT
        sfxUsage:          { type: 'string', enum: ['Heavy', 'Moderate', 'Minimal', 'None'] },                       // STRICT
        audioBalance:      { type: 'string', enum: ['Well Balanced', 'BGM Heavy', 'Voice Heavy', 'Unbalanced'] },   // STRICT
        soundScore:        { type: 'number' },  // STRICT
        trendingAudioUsed: { type: 'boolean' }, // STRICT
        analysis:          { type: 'string' },  // free-form
      },
      required: ['bgmGenre', 'bgmTempo', 'bgmMoodMatch', 'sfxUsage',
                 'audioBalance', 'soundScore', 'trendingAudioUsed', 'analysis'],
    },

    // ── Pacing ───────────────────────────────────────────────
    pacingRhythm: {
      type: 'object',
      properties: {
        overallPace:        { type: 'string', enum: ['Very Fast', 'Fast', 'Medium', 'Slow', 'Very Slow'] },                  // STRICT
        pacingConsistency:  { type: 'string', enum: ['Consistent', 'Mostly Consistent', 'Variable', 'Erratic'] },           // STRICT
        rhythmScore:        { type: 'number' },  // STRICT
        energyCurve:        { type: 'string', enum: ['Rising', 'Falling', 'Peak-Valley', 'Flat', 'Explosive Start'] },      // STRICT
        retentionOptimized: { type: 'boolean' }, // STRICT
        analysis:           { type: 'string' },  // free-form
      },
      required: ['overallPace', 'pacingConsistency', 'rhythmScore',
                 'energyCurve', 'retentionOptimized', 'analysis'],
    },

    // ── Retention ────────────────────────────────────────────
    retentionPrediction: {
      type: 'object',
      properties: {
        predicted3SecRetention:   { type: 'number' },  // STRICT: chart
        predicted50PctRetention:  { type: 'number' },  // STRICT: chart
        predicted100PctRetention: { type: 'number' },  // STRICT: chart
        dropOffRisk:              { type: 'string', enum: ['High', 'Medium', 'Low'] }, // STRICT: badge
        dropOffPoints:            { type: 'array', items: { type: 'string' } },
        retentionScore:           { type: 'number' },  // STRICT
        analysis:                 { type: 'string' },  // free-form
      },
      required: ['predicted3SecRetention', 'predicted50PctRetention', 'predicted100PctRetention',
                 'dropOffRisk', 'dropOffPoints', 'retentionScore', 'analysis'],
    },

    // ── Competitive Gap ──────────────────────────────────────
    competitiveGapAnalysis: {
      type: 'object',
      properties: {
        overallCompetitiveLevel: { type: 'string', enum: ['Top 5%', 'Top 10%', 'Top 25%', 'Average', 'Below Average'] }, // STRICT
        keyStrengths:            { type: 'array', items: { type: 'string' } },
        criticalGaps:            { type: 'array', items: { type: 'string' } },
        differentiatorScore:     { type: 'number' },  // STRICT
        top10PctGapSummary:      { type: 'string' },  // free-form
        analysis:                { type: 'string' },  // free-form
      },
      required: ['overallCompetitiveLevel', 'keyStrengths', 'criticalGaps',
                 'differentiatorScore', 'top10PctGapSummary', 'analysis'],
    },

    // ── ER Correlation ───────────────────────────────────────
    erCorrelationAnalysis: {
      type: 'object',
      properties: {
        currentER:             { type: 'number' },  // STRICT
        benchmarkER:           { type: 'number' },  // STRICT
        erPerformance:         { type: 'string', enum: ['Exceptional', 'Above Average', 'Average', 'Below Average', 'Poor'] }, // STRICT
        likesCorrelation:      { type: 'string' },  // free-form
        commentsCorrelation:   { type: 'string' },  // free-form
        viewsCorrelation:      { type: 'string' },  // free-form
        erDrivers:             { type: 'array', items: { type: 'string' } },
        erDetractors:          { type: 'array', items: { type: 'string' } },
        erImprovementPotential:{ type: 'string' },  // free-form
        analysis:              { type: 'string' },  // free-form
      },
      required: ['currentER', 'benchmarkER', 'erPerformance', 'likesCorrelation',
                 'commentsCorrelation', 'viewsCorrelation', 'erDrivers', 'erDetractors',
                 'erImprovementPotential', 'analysis'],
    },

    // ── Overall Assessment ───────────────────────────────────
    overallAssessment: {
      type: 'object',
      properties: {
        overallScore:             { type: 'number' },  // STRICT: score display utama
        contentQualityScore:      { type: 'number' },  // STRICT
        technicalQualityScore:    { type: 'number' },  // STRICT
        engagementPotentialScore: { type: 'number' },  // STRICT
        viralPotentialScore:      { type: 'number' },  // STRICT
        grade:                    { type: 'string', enum: ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D'] }, // STRICT: grade badge
        topStrengths:             { type: 'array', items: { type: 'string' } },
        criticalWeaknesses:       { type: 'array', items: { type: 'string' } },
        meets100KStandard:        { type: 'boolean' }, // STRICT: pass/fail badge
        analysis:                 { type: 'string' },  // free-form
      },
      required: ['overallScore', 'contentQualityScore', 'technicalQualityScore',
                 'engagementPotentialScore', 'viralPotentialScore', 'grade',
                 'topStrengths', 'criticalWeaknesses', 'meets100KStandard', 'analysis'],
    },

    // ── Top 3 Recommendations ────────────────────────────────
    // priority: string bukan number — Gemini tidak support enum number
    top3ActionableRecommendations: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          priority:       { type: 'string', enum: ['1', '2', '3'] },                                                         // STRICT (string!)
          impact:         { type: 'string', enum: ['High', 'Medium', 'Low'] },                                               // STRICT
          category:       { type: 'string', enum: ['Content', 'Technical', 'Engagement', 'Visual', 'Audio', 'Structure'] }, // STRICT
          recommendation: { type: 'string' },  // free-form: teks rekomendasi
          reason:         { type: 'string' },  // free-form: alasan
          expectedResult: { type: 'string' },  // free-form: hasil yang diharapkan
        },
        required: ['priority', 'impact', 'category', 'recommendation', 'reason', 'expectedResult'],
      },
    },

    summary: { type: 'string' }, // free-form: ringkasan JP 300-400 karakter
  },

  required: [
    'subtitleDetected', 'subtitleLanguage', 'subtitleType', 'subtitleClarity', 'subtitleArray',
    'voiceOverDetected', 'voiceOverType', 'voiceOverTone', 'voiceOverTranscript',
    'narrationDepthAnalysis', 'narrationPersonalityEvaluation',
    'minuteByMinuteBreakdown', 'hookAnalysisDetailed', 'videoStructureAnalysis',
    'themeIdentification', 'visualExpressionTechniques', 'filmingMethodDetails',
    'bgmChangePointsTracking', 'specificEditingTechniques', 'cameraAnglesAnalysis',
    'cutCompositionAnalysis', 'captionOverlayAnalysis', 'visualAppealCinematography',
    'soundDesignAnalysis', 'pacingRhythm', 'retentionPrediction',
    'competitiveGapAnalysis', 'erCorrelationAnalysis', 'overallAssessment',
    'top3ActionableRecommendations', 'summary',
  ],
};