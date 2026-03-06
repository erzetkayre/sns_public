import { GoogleGenAI } from "@google/genai";

const ANALYSIS_SCHEMA = {
type: 'object',
properties: {
    // Minute-by-Minute Breakdown
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
                    //  Visual Content Analysis
                    visualContent: {
                        type: 'object',
                        properties: {
                            mainSubject:       { type: 'string' },
                            subjectDetails:    { type: 'string' },
                            backgroundElements:{ type: 'string' },
                            visualHierarchy:   { type: 'string' },
                            colorDominance:    { type: 'string' },
                            lightingMood:      { type: 'string', enum: ['Warm', 'Bright', 'Dramatic', 'Soft', 'Mixed'] },
                        },
                        required: ['mainSubject', 'subjectDetails', 'backgroundElements',
                                'visualHierarchy', 'colorDominance', 'lightingMood'],
                    },
                    // Camera Movement Analysis
                    cameraMovement: {
                        type: 'object',
                        properties: {
                            movementType: { type: 'string', enum: ['Stationary', 'Pan', 'Tilt', 'Zoom', 'Dolly', 'Handheld', 'Gimbal', 'Mixed'] },
                            speed:        { type: 'string', enum: ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'] },
                            direction:    { type: 'string' },
                            smoothness:   { type: 'string', enum: ['Completely Smooth', 'Slightly Smooth', 'Slightly Shaky', 'Shaky'] },
                            angle:        { type: 'string', enum: ['High Angle', 'Eye Level', 'Low Angle', "Bird's Eye"] },
                        },
                        required: ['movementType', 'speed', 'direction', 'smoothness', 'angle'],
                    },
                    // Cut and Transition Analysis
                    cutAndTransition: {
                        type: 'object',
                        properties: {
                            transitionType: { type: 'string', enum: ['Hard Cut', 'Dissolve', 'Fade', 'Wipe', 'Match Cut', 'Jump Cut', 'Zoom Transition', 'None'] },
                            duration:       { type: 'string', enum: ['Instantaneous', 'Short', 'Normal', 'Long'] },
                            effect:         { type: 'string', enum: ['Smooth', 'Jerky', 'Impactful', 'Natural'] },
                            purpose:        { type: 'string' },
                        },
                        required: ['transitionType', 'duration', 'effect', 'purpose'],
                    },
                    // Text Overlay Analysis
                    textOverlay: {
                        type: 'object',
                        properties: {
                            textPresence: { type: 'boolean' },
                            textCount:    { type: 'number' },
                            texts: {
                                type: 'array',
                                items: {
                                type: 'object',
                                properties: {
                                    content:    { type: 'string' },
                                    size:       { type: 'string', enum: ['Large', 'Medium', 'Small'] },
                                    color:      { type: 'string' },
                                    position:   { type: 'string' },
                                    animation:  { type: 'string' },
                                    background: { type: 'string' },
                                    fontStyle:  { type: 'string', enum: ['Bold', 'Normal', 'Italic', 'Outline'] },
                                    timing:     { type: 'string' },
                                },
                                required: ['content', 'size', 'color', 'position', 'animation', 'background', 'fontStyle', 'timing'],
                                },
                            },
                            readability:    { type: 'string', enum: ['Very Readable', 'Readable', 'Somewhat Difficult', 'Difficult', 'N/A'] },
                            textVisualSync: { type: 'string', enum: ['Perfect', 'Good', 'Average', 'Somewhat out of sync', 'N/A'] },
                        },
                        required: ['textPresence', 'textCount', 'texts', 'readability', 'textVisualSync'],
                    },
                    // Key Moment Analysis
                    keyMoment: {
                        type: 'object',
                        properties: {
                            momentType:           { type: 'string', enum: ['Hook', 'Build-up', 'Transition', 'Climax', 'Resolution', 'CTA', 'Filler'] },
                            emotionalBeat:        { type: 'string' },
                            storyPurpose:         { type: 'string' },
                            viewerActionExpected: { type: 'string', enum: ['Continue watching', 'Like', 'Comment', 'Save', 'Share', 'Profile visit', 'Abandon risk'] },
                            impactLevel:          { type: 'string', enum: ['Very strong', 'Strong', 'Medium', 'Weak', 'None'] },
                            description:          { type: 'string' },
                        },
                        required: ['momentType', 'emotionalBeat', 'storyPurpose',
                                'viewerActionExpected', 'impactLevel', 'description'],
                    },
                    // BGM and Audio Analysis
                    bgmAudioStatus: {
                        type: 'object',
                        properties: {
                            status:         { type: 'string', enum: ['Start', 'Ongoing', 'Volume change', 'Tempo change', 'Stop', 'Silence', 'Restart', 'Unknown'] },
                            volumeLevel:    { type: 'string', enum: ['High', 'Medium', 'Low', 'Very Low', 'Mute', 'Unknown'] },
                            energy:         { type: 'string', enum: ['High energy', 'Medium energy', 'Low energy', 'Quiet', 'Unknown'] },
                            estimatedSFX:   { type: 'string' },
                            audioVisualSync:{ type: 'string', enum: ['Perfect', 'Good', 'Average', 'Estimated lag', 'Unknown'] },
                        },
                        required: ['status', 'volumeLevel', 'energy', 'estimatedSFX', 'audioVisualSync'],
                    },
                    // Emotional Tone and Pacing Analysis
                    emotionalToneAndPacing: {
                        type: 'object',
                        properties: {
                            tone:        { type: 'string' },
                            pace:        { type: 'string', enum: ['Very Fast', 'Fast', 'Normal', 'Slow', 'Very Slow'] },
                            energyLevel: { type: 'string', enum: ['Very High', 'High', 'Medium', 'Low', 'Very Low'] },
                            engagement:  { type: 'string', enum: ['High Engagement Expected', 'Normal', 'Low Engagement Risk'] },
                        },
                        required: ['tone', 'pace', 'energyLevel', 'engagement'],
                    },
                },
                required: ['timeRange', 'visualContent', 'cameraMovement', 'cutAndTransition',
                        'textOverlay', 'keyMoment', 'bgmAudioStatus', 'emotionalToneAndPacing'],
            },
        },
        narrativeFlow: { type: 'string' },
        pacing:        { type: 'string' },
        score:         { type: 'number' },
        analysis:      { type: 'string' },
    },
    required: ['totalDuration', 'segmentSize', 'segmentCount', 'segments',
                'narrativeFlow', 'pacing', 'score', 'analysis'],
    },

    // Hook Analysis
    hookAnalysisDetailed: {
    type: 'object',
    properties: {
        firstSecond: {
        type: 'object',
            properties: {
                timeRange:             { type: 'string' },
                openingFrameContent:   { type: 'string' },
                visualImpactScore:     { type: 'number' },
                firstImpression:       { type: 'string' },
                hookType:              { type: 'string' },
                scrollStoppingPower:   { type: 'string', enum: ['Very Strong', 'Strong', 'Average', 'Weak'] },
                colorImpact:           { type: 'string' },
                movementInFirstSecond: { type: 'string', enum: ['Intense', 'Slow', 'Still'] },
                audioHook:             { type: 'string' },
            },
        required: ['timeRange', 'openingFrameContent', 'visualImpactScore', 'firstImpression',
                    'hookType', 'scrollStoppingPower', 'colorImpact', 'movementInFirstSecond', 'audioHook'],
        },
        secondSecond: {
        type: 'object',
            properties: {
                timeRange:          { type: 'string' },
                whatHappens:        { type: 'string' },
                visualDevelopment:  { type: 'string' },
                informationAdded:   { type: 'string' },
                curiosityGap:       { type: 'string', enum: ['High', 'Medium', 'Low'] },
                emotionalTransition:{ type: 'string' },
            },
        required: ['timeRange', 'whatHappens', 'visualDevelopment',
                    'informationAdded', 'curiosityGap', 'emotionalTransition'],
        },
        thirdSecond: {
        type: 'object',
            properties: {
                timeRange:        { type: 'string' },
                whatHappens:      { type: 'string' },
                storyPromise:     { type: 'string' },
                valueProposition: { type: 'string' },
                ctaOrDirection:   { type: 'string' },
                retentionLock:    { type: 'string', enum: ['Confirmed', 'Likely', 'Uncertain', 'At Risk'] },
            },
        required: ['timeRange', 'whatHappens', 'storyPromise',
                    'valueProposition', 'ctaOrDirection', 'retentionLock'],
        },
        overallHookScore:       { type: 'number' },
        hookEffectiveness:      { type: 'string' },
        improvementPotential:   { type: 'string' },
        bestPracticeAlignment:  { type: 'string' },
        psychologicalTriggers: {
        type: 'object',
            properties: {
                fomo:              { type: 'boolean' },
                curiosityGap:      { type: 'boolean' },
                visualBeauty:      { type: 'boolean' },
                surprise:          { type: 'boolean' },
                socialProof:       { type: 'boolean' },
                scarcity:          { type: 'boolean' },
                foodPorn:          { type: 'boolean' },
                emotionalConnection:{ type: 'boolean' },
            },
        required: ['fomo', 'curiosityGap', 'visualBeauty', 'surprise',
                    'socialProof', 'scarcity', 'foodPorn', 'emotionalConnection'],
        },
        analysis: { type: 'string' },
    },
    required: ['firstSecond', 'secondSecond', 'thirdSecond', 'overallHookScore',
                'hookEffectiveness', 'improvementPotential', 'bestPracticeAlignment',
                'psychologicalTriggers', 'analysis'],
    },

    // Video Structure 
    videoStructureAnalysis: {
    type: 'object',
    properties: {
        introduction: {
            type: 'object',
            properties: {
                timeRange:       { type: 'string' },
                purpose:         { type: 'string' },
                whatHappens:     { type: 'string' },
                keyElements:     { type: 'array', items: { type: 'string' } },
                effectiveness:   { type: 'string', enum: ['Very Effective', 'Effective', 'Average', 'Weak'] },
                engagementLevel: { type: 'string', enum: ['High', 'Medium', 'Low'] },
            },
            required: ['timeRange', 'purpose', 'whatHappens', 'keyElements', 'effectiveness', 'engagementLevel'],
        },
        risingAction: {
            type: 'object',
            properties: {
                timeRange:       { type: 'string' },
                purpose:         { type: 'string' },
                whatHappens:     { type: 'string' },
                keyElements:     { type: 'array', items: { type: 'string' } },
                tensionBuilding: { type: 'string' },
                informationFlow: { type: 'string', enum: ['Appropriate', 'Too Fast', 'Too Slow', 'Uneven'] },
                effectiveness:   { type: 'string', enum: ['Very Effective', 'Effective', 'Average', 'Weak'] },
            },
            required: ['timeRange', 'purpose', 'whatHappens', 'keyElements',
                        'tensionBuilding', 'informationFlow', 'effectiveness'],
        },
        climax: {
            type: 'object',
            properties: {
                timeRange:       { type: 'string' },
                climaxType:      { type: 'string', enum: ['Visual', 'Emotional', 'Informational', 'Combined'] },
                peakMoment:      { type: 'string' },
                visualPeak:      { type: 'string' },
                emotionalPeak:   { type: 'string' },
                whyThisIsClimax: { type: 'string' },
                effectiveness:   { type: 'string', enum: ['Very Effective', 'Effective', 'Average', 'Weak'] },
            },
            required: ['timeRange', 'climaxType', 'peakMoment', 'visualPeak',
                        'emotionalPeak', 'whyThisIsClimax', 'effectiveness'],
        },
        fallingAction: {
            type: 'object',
            properties: {
                timeRange:   { type: 'string' },
                purpose:     { type: 'string' },
                whatHappens: { type: 'string' },
                presence:    { type: 'string', enum: ['Present', 'None', 'Minimal'] },
            },
            required: ['timeRange', 'purpose', 'whatHappens', 'presence'],
        },
        conclusion: {
            type: 'object',
            properties: {
                timeRange:       { type: 'string' },
                purpose:         { type: 'string' },
                whatHappens:     { type: 'string' },
                ctaPresence:     { type: 'boolean' },
                ctaType:         { type: 'string' },
                emotionalClose:  { type: 'string' },
                finalImpression: { type: 'string', enum: ['Very Strong', 'Strong', 'Average', 'Weak'] },
                effectiveness:   { type: 'string', enum: ['Very Effective', 'Effective', 'Average', 'Weak'] },
            },
            required: ['timeRange', 'purpose', 'whatHappens', 'ctaPresence',
                        'ctaType', 'emotionalClose', 'finalImpression', 'effectiveness'],
        },
        structureQuality: {
            type: 'object',
            properties: {
                overallScore:                { type: 'number' },
                storyFlow:                   { type: 'string', enum: ['Very Smooth', 'Smooth', 'Average', 'Choppy'] },
                narrativeClarity:            { type: 'string', enum: ['Very Clear', 'Clear', 'Average', 'Unclear'] },
                pacingAcrossStructure:       { type: 'string', enum: ['Optimal', 'Good', 'Uneven', 'Poor'] },
                classicalStructureAdherence: { type: 'string', enum: ['Full', 'Almost', 'Partial', 'None'] },
                structureEffectiveness:      { type: 'string', enum: ['Very High', 'High', 'Medium', 'Low'] },
            },
            required: ['overallScore', 'storyFlow', 'narrativeClarity',
                        'pacingAcrossStructure', 'classicalStructureAdherence', 'structureEffectiveness'],
        },
        structureRecommendations: {
            type: 'object',
            properties: {
                introductionLength: { type: 'string', enum: ['Too Long', 'Appropriate', 'Too Short'] },
                climaxPosition:     { type: 'string', enum: ['Too Early', 'Appropriate', 'Too Late'] },
                conclusionStrength: { type: 'string', enum: ['Very Strong', 'Strong', 'Weak', 'Missing'] },
            },
            required: ['introductionLength', 'climaxPosition', 'conclusionStrength'],
        },
        analysis: { type: 'string' },
    },
    required: ['introduction', 'risingAction', 'climax', 'fallingAction',
                'conclusion', 'structureQuality', 'structureRecommendations', 'analysis'],
    },

    // Theme Identification 
    themeIdentification: {
    type: 'object',
    properties: {
        primaryTheme: {
            type: 'object',
            properties: {
                category:    { type: 'string' },
                confidence:  { type: 'string', enum: ['Clear', 'Likely', 'Uncertain'] },
                description: { type: 'string' },
            },
            required: ['category', 'confidence', 'description'],
        },
        secondaryThemes: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                theme:       { type: 'string' },
                description: { type: 'string' },
                },
                required: ['theme', 'description'],
            },
        },
        contentPurpose: {
            type: 'object',
            properties: {
                primaryPurpose:    { type: 'string' },
                purposeClarity:    { type: 'string', enum: ['Very Clear', 'Clear', 'Somewhat Clear', 'Unclear'] },
                purposeAchievement:{ type: 'string', enum: ['Fully', 'Almost', 'Partially', 'Not Achieved'] },
            },
            required: ['primaryPurpose', 'purposeClarity', 'purposeAchievement'],
        },
        targetAudience: {
            type: 'object',
            properties: {
                audienceType:    { type: 'string' },
                audienceInterest:{ type: 'string' },
                audienceFit:     { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor'] },
            },
            required: ['audienceType', 'audienceInterest', 'audienceFit'],
        },
        contentTone: {
            type: 'object',
            properties: {
                toneType:            { type: 'string' },
                toneConsistency:     { type: 'string', enum: ['Fully Consistent', 'Mostly Consistent', 'Inconsistent'] },
                toneAppropriateness: { type: 'string', enum: ['Highly Appropriate', 'Appropriate', 'Somewhat Inappropriate', 'Inappropriate'] },
            },
            required: ['toneType', 'toneConsistency', 'toneAppropriateness'],
        },
        uniqueAngle: {
            type: 'object',
            properties: {
                hasUniqueAngle:       { type: 'boolean' },
                description:          { type: 'string' },
                differentiationFactor:{ type: 'string', enum: ['Highly Differentiated', 'Differentiated', 'Somewhat Differentiated', 'Generic'] },
            },
            required: ['hasUniqueAngle', 'description', 'differentiationFactor'],
        },
        themeEffectivenessScore: { type: 'number' },
        analysis: { type: 'string' },
    },
    required: ['primaryTheme', 'secondaryThemes', 'contentPurpose', 'targetAudience',
                'contentTone', 'uniqueAngle', 'themeEffectivenessScore', 'analysis'],
    },

    // Visual Expression 
    visualExpressionTechniques: {
    type: 'object',
    properties: {
        colorPsychology: {
            type: 'object',
            properties: {
                dominantColorPalette: { type: 'string' },
                colorMood:            { type: 'string' },
                colorPurpose:         { type: 'string' },
                colorConsistency:     { type: 'string', enum: ['Complete', 'Mostly', 'Partial', 'Inconsistent'] },
                colorTransitions:     { type: 'string' },
                colorGradingStyle:    { type: 'string', enum: ['Natural', 'Cinematic', 'Vintage', 'Vibrant', 'Desaturated', 'Custom'] },
            },
            required: ['dominantColorPalette', 'colorMood', 'colorPurpose',
                        'colorConsistency', 'colorTransitions', 'colorGradingStyle'],
        },
        compositionTechniques: {
            type: 'object',
            properties: {
                ruleOfThirds:     { type: 'string', enum: ['Always', 'Frequently', 'Occasionally', 'Rarely', 'None'] },
                leadingLines:     { type: 'string', enum: ['Effective', 'Present', 'Minimal', 'None'] },
                symmetry:         { type: 'string', enum: ['Strong', 'Present', 'Minimal', 'None'] },
                framing:          { type: 'string', enum: ['Strong', 'Present', 'Minimal', 'None'] },
                negativeSpace:    { type: 'string', enum: ['Effective', 'Average', 'Underused', 'None'] },
                depthLayering:    { type: 'string', enum: ['Very Effective', 'Effective', 'Average', 'None'] },
                subjectPlacement: { type: 'string' },
            },
            required: ['ruleOfThirds', 'leadingLines', 'symmetry', 'framing',
                        'negativeSpace', 'depthLayering', 'subjectPlacement'],
        },
        motionDynamicElements: {
            type: 'object',
            properties: {
                subjectMotion:    { type: 'string' },
                motionQuality:    { type: 'string', enum: ['Very Smooth', 'Smooth', 'Average', 'Choppy'] },
                motionPurpose:    { type: 'string' },
                speedVariation:   { type: 'string', enum: ['Dynamic', 'Normal', 'Static', 'Mixed'] },
                motionEmotionLink:{ type: 'string', enum: ['Strong', 'Moderate', 'Slight', 'None'] },
            },
            required: ['subjectMotion', 'motionQuality', 'motionPurpose', 'speedVariation', 'motionEmotionLink'],
        },
        visualEffectsOverlays: {
            type: 'object',
            properties: {
                overlayTypesUsed:    { type: 'array', items: { type: 'string' } },
                overlayPurpose:      { type: 'string' },
                overlayEffectiveness:{ type: 'string', enum: ['Very Effective', 'Effective', 'Average', 'Ineffective', 'None'] },
                graphicElements:     { type: 'string' },
                graphicIntegration:  { type: 'string', enum: ['Seamless', 'Good', 'Average', 'Poor', 'None'] },
            },
            required: ['overlayTypesUsed', 'overlayPurpose', 'overlayEffectiveness',
                        'graphicElements', 'graphicIntegration'],
        },
        visualHierarchyFocus: {
            type: 'object',
            properties: {
                primaryFocus:      { type: 'string', enum: ['Very Clear', 'Clear', 'Average', 'Unclear'] },
                focusTechniques:   { type: 'array', items: { type: 'string' } },
                visualFlow:        { type: 'string', enum: ['Natural', 'Guided', 'Confusing', 'None'] },
                attentionManagement:{ type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor'] },
            },
            required: ['primaryFocus', 'focusTechniques', 'visualFlow', 'attentionManagement'],
        },
        visualStyleConsistency: {
            type: 'object',
            properties: {
                consistencyScore:      { type: 'number' },
                styleDescription:      { type: 'string' },
                styleAppropriateness:  { type: 'string', enum: ['Highly Appropriate', 'Appropriate', 'Average', 'Inappropriate'] },
            },
            required: ['consistencyScore', 'styleDescription', 'styleAppropriateness'],
        },
        visualExpressionScore: { type: 'number' },
        analysis: { type: 'string' },
    },
    required: ['colorPsychology', 'compositionTechniques', 'motionDynamicElements',
                'visualEffectsOverlays', 'visualHierarchyFocus', 'visualStyleConsistency',
                'visualExpressionScore', 'analysis'],
    },

    // Filming Method 
    filmingMethodDetails: {
    type: 'object',
    properties: {
        cameraEquipment: {
            type: 'object',
            properties: {
                cameraTypeEstimate:  { type: 'string', enum: ['Smartphone', 'Mirrorless', 'DSLR', 'Action Camera', 'Unknown'] },
                cameraQuality:       { type: 'string', enum: ['Professional', 'Advanced Amateur', 'Amateur', 'Unknown'] },
                evidenceForEstimate: { type: 'string' },
            },
            required: ['cameraTypeEstimate', 'cameraQuality', 'evidenceForEstimate'],
        },
        stabilizationSupport: {
            type: 'object',
            properties: {
                stabilizationType: { type: 'string', enum: ['Gimbal', 'Tripod', 'Handheld', 'OIS Only', 'Unknown'] },
                stabilizationQuality: { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor'] },
                handheldVsStabilized: { type: 'string', enum: ['Fully Stabilized', 'Mostly Stabilized', 'Mixed', 'Handheld'] },
            },
            required: ['stabilizationType', 'stabilizationQuality', 'handheldVsStabilized'],
        },
        lightingSetup: {
            type: 'object',
            properties: {
                primaryLightSource:    { type: 'string', enum: ['Natural Light', 'Ring Light', 'Softbox', 'Mixed', 'Unknown'] },
                lightQuality:          { type: 'string', enum: ['Professional', 'Soft', 'Harsh', 'Mixed'] },
                lightDirection:        { type: 'string', enum: ['Front', 'Side', 'Back', 'Top', 'Mixed'] },
                lightColorTemperature: { type: 'string', enum: ['Warm', 'Neutral', 'Cool', 'Mixed'] },
                lightingConsistency:   { type: 'string', enum: ['Consistent', 'Mostly Consistent', 'Inconsistent'] },
                shadowManagement:      { type: 'string', enum: ['Professional', 'Good', 'Soft', 'Harsh', 'Poor'] },
                lightingMood:          { type: 'string' },
                lightingScore:         { type: 'number' },
            },
            required: ['primaryLightSource', 'lightQuality', 'lightDirection', 'lightColorTemperature',
                        'lightingConsistency', 'shadowManagement', 'lightingMood', 'lightingScore'],
        },
        shootingStyle: {
            type: 'object',
            properties: {
                styleCategory:     { type: 'string' },
                professionalLevel: { type: 'string', enum: ['Professional', 'Advanced Amateur', 'Amateur'] },
                styleConsistency:  { type: 'string', enum: ['Consistent', 'Mostly Consistent', 'Inconsistent'] },
            },
            required: ['styleCategory', 'professionalLevel', 'styleConsistency'],
        },
        focusDepthOfField: {
            type: 'object',
            properties: {
                dofUsage:     { type: 'string', enum: ['Shallow', 'Deep', 'Mixed', 'Unknown'] },
                focusTechnique:{ type: 'string', enum: ['Autofocus', 'Manual', 'Mixed', 'Unknown'] },
                focusAccuracy: { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor'] },
                bokehQuality:  { type: 'string', enum: ['Professional', 'Good', 'Average', 'Minimal', 'None'] },
                dofPurpose:    { type: 'string' },
            },
            required: ['dofUsage', 'focusTechnique', 'focusAccuracy', 'bokehQuality', 'dofPurpose'],
        },
        frameRateShutterSpeed: {
            type: 'object',
            properties: {
                estimatedFrameRate: { type: 'string', enum: ['24fps', '30fps', '60fps', '120fps', 'Unknown'] },
                motionBlur:         { type: 'string', enum: ['Cinematic', 'Good', 'Minimal', 'Excessive'] },
                frameRatePurpose:   { type: 'string', enum: ['Standard', 'Cinematic', 'Slow Motion', 'Smooth'] },
            },
            required: ['estimatedFrameRate', 'motionBlur', 'frameRatePurpose'],
        },
        audioRecordingQuality: {
            type: 'object',
            properties: {
                audioQualityEstimate: { type: 'string', enum: ['Professional', 'Good', 'Average', 'Poor', 'Unknown'] },
                likelyAudioSetup:     { type: 'string', enum: ['External Mic', 'Lavalier', 'Built-in', 'Unknown'] },
            },
            required: ['audioQualityEstimate', 'likelyAudioSetup'],
        },
        postProductionLevel: {
            type: 'object',
            properties: {
                editComplexity:            { type: 'string', enum: ['High', 'Medium', 'Low', 'Minimal'] },
                colorGradingLevel:         { type: 'string', enum: ['Professional', 'Advanced', 'Basic', 'None'] },
                vfxUsage:                  { type: 'string', enum: ['Heavy', 'Moderate', 'Minimal', 'None'] },
                postProductionTimeEstimate:{ type: 'string' },
            },
            required: ['editComplexity', 'colorGradingLevel', 'vfxUsage', 'postProductionTimeEstimate'],
        },
        overallProductionValue: {
            type: 'object',
            properties: {
                productionQualityScore: { type: 'number' },
                budgetEstimate:         { type: 'string', enum: ['High', 'Medium', 'Low', 'Minimal'] },
                professionalVsDIY:      { type: 'string' },
            },
            required: ['productionQualityScore', 'budgetEstimate', 'professionalVsDIY'],
        },
        analysis: { type: 'string' },
    },
    required: ['cameraEquipment', 'stabilizationSupport', 'lightingSetup', 'shootingStyle',
                'focusDepthOfField', 'frameRateShutterSpeed', 'audioRecordingQuality',
                'postProductionLevel', 'overallProductionValue', 'analysis'],
    },

    // BGM Change Points 
    bgmChangePointsTracking: {
    type: 'object',
    properties: {
        totalBgmChanges: { type: 'number' },
        hasIdentifiableBgm: { type: 'boolean' },
        changePoints: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
            timeStamp:   { type: 'string' },
            changeType:  { type: 'string', enum: ['Start', 'Volume Up', 'Volume Down', 'Tempo Change', 'Track Switch', 'Stop', 'Fade Out'] },
            description: { type: 'string' },
            impact:      { type: 'string', enum: ['High', 'Medium', 'Low'] },
            },
            required: ['timeStamp', 'changeType', 'description', 'impact'],
        },
        },
        overallBgmStrategy: { type: 'string' },
        bgmEmotionAlignment: { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor', 'None'] },
        analysis: { type: 'string' },
    },
    required: ['totalBgmChanges', 'hasIdentifiableBgm', 'changePoints',
                'overallBgmStrategy', 'bgmEmotionAlignment', 'analysis'],
    },

    // Specific Editing Techniques 
    specificEditingTechniques: {
    type: 'object',
    properties: {
        cutFrequency:         { type: 'string', enum: ['Very High', 'High', 'Medium', 'Low', 'Very Low'] },
        dominantTransition:   { type: 'string' },
        rhythmicEditing:      { type: 'boolean' },
        beatSyncEditing:      { type: 'boolean' },
        jumpCutsUsed:         { type: 'boolean' },
        slowMotionUsed:       { type: 'boolean' },
        timelapseUsed:        { type: 'boolean' },
        splitScreenUsed:      { type: 'boolean' },
        textAnimationStyle:   { type: 'string' },
        editingScore:         { type: 'number' },
        editingConsistency:   { type: 'string', enum: ['Consistent', 'Mostly Consistent', 'Inconsistent'] },
        analysis: { type: 'string' },
    },
    required: ['cutFrequency', 'dominantTransition', 'rhythmicEditing', 'beatSyncEditing',
                'jumpCutsUsed', 'slowMotionUsed', 'timelapseUsed', 'splitScreenUsed',
                'textAnimationStyle', 'editingScore', 'editingConsistency', 'analysis'],
    },

    // Camera Angles
    cameraAnglesAnalysis: {
    type: 'object',
    properties: {
        primaryAngle:      { type: 'string', enum: ['Eye Level', 'High Angle', 'Low Angle', "Bird's Eye", 'Dutch Tilt', 'Mixed'] },
        angleVariety:      { type: 'string', enum: ['High', 'Medium', 'Low'] },
        anglesPurpose:     { type: 'string' },
        mostImpactfulAngle:{ type: 'string' },
        angleScore:        { type: 'number' },
        analysis:          { type: 'string' },
    },
    required: ['primaryAngle', 'angleVariety', 'anglesPurpose', 'mostImpactfulAngle', 'angleScore', 'analysis'],
    },

    // Cut Composition 
    cutCompositionAnalysis: {
    type: 'object',
    properties: {
        totalEstimatedCuts:   { type: 'number' },
        averageShotDuration:  { type: 'string' },
        cutRhythm:            { type: 'string', enum: ['Consistent', 'Varied', 'Erratic'] },
        compositionScore:     { type: 'number' },
        shortestShot:         { type: 'string' },
        longestShot:          { type: 'string' },
        analysis:             { type: 'string' },
    },
    required: ['totalEstimatedCuts', 'averageShotDuration', 'cutRhythm',
                'compositionScore', 'shortestShot', 'longestShot', 'analysis'],
    },

    // Caption Overlay 
    captionOverlayAnalysis: {
    type: 'object',
    properties: {
        overallCaptionStrategy: { type: 'string' },
        captionConsistency:     { type: 'string', enum: ['Consistent', 'Mostly Consistent', 'Inconsistent', 'None'] },
        captionReadabilityScore:{ type: 'number' },
        captionTimingAccuracy:  { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor', 'N/A'] },
        brandingIntegration:    { type: 'string', enum: ['Strong', 'Moderate', 'Weak', 'None'] },
        captionScore:           { type: 'number' },
        analysis:               { type: 'string' },
    },
    required: ['overallCaptionStrategy', 'captionConsistency', 'captionReadabilityScore',
                'captionTimingAccuracy', 'brandingIntegration', 'captionScore', 'analysis'],
    },

    // Visual Appeal & Cinematography 
    visualAppealCinematography: {
    type: 'object',
    properties: {
        aestheticScore:         { type: 'number' },
        cinematographyScore:    { type: 'number' },
        productionValueScore:   { type: 'number' },
        overallVisualScore:     { type: 'number' },
        strengths:              { type: 'array', items: { type: 'string' } },
        weaknesses:             { type: 'array', items: { type: 'string' } },
        competitiveVisualLevel: { type: 'string', enum: ['Top 5%', 'Top 10%', 'Top 25%', 'Average', 'Below Average'] },
        analysis:               { type: 'string' },
    },
    required: ['aestheticScore', 'cinematographyScore', 'productionValueScore', 'overallVisualScore',
                'strengths', 'weaknesses', 'competitiveVisualLevel', 'analysis'],
    },

    // Sound Design 
    soundDesignAnalysis: {
    type: 'object',
    properties: {
        bgmGenre:            { type: 'string' },
        bgmTempo:            { type: 'string', enum: ['Very Fast', 'Fast', 'Medium', 'Slow', 'Very Slow', 'Unknown'] },
        bgmMoodMatch:        { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Poor', 'None'] },
        sfxUsage:            { type: 'string', enum: ['Heavy', 'Moderate', 'Minimal', 'None'] },
        audioBalance:        { type: 'string', enum: ['Well Balanced', 'BGM Heavy', 'Voice Heavy', 'Unbalanced'] },
        soundScore:          { type: 'number' },
        trendingAudioUsed:   { type: 'boolean' },
        analysis:            { type: 'string' },
    },
    required: ['bgmGenre', 'bgmTempo', 'bgmMoodMatch', 'sfxUsage',
                'audioBalance', 'soundScore', 'trendingAudioUsed', 'analysis'],
    },

    // Pacing & Rhythm 
    pacingRhythm: {
    type: 'object',
    properties: {
        overallPace:         { type: 'string', enum: ['Very Fast', 'Fast', 'Medium', 'Slow', 'Very Slow'] },
        pacingConsistency:   { type: 'string', enum: ['Consistent', 'Mostly Consistent', 'Variable', 'Erratic'] },
        rhythmScore:         { type: 'number' },
        energyCurve:         { type: 'string', enum: ['Rising', 'Falling', 'Peak-Valley', 'Flat', 'Explosive Start'] },
        retentionOptimized:  { type: 'boolean' },
        analysis:            { type: 'string' },
    },
    required: ['overallPace', 'pacingConsistency', 'rhythmScore',
                'energyCurve', 'retentionOptimized', 'analysis'],
    },

    // Retention Prediction 
    retentionPrediction: {
    type: 'object',
    properties: {
        predicted3SecRetention:  { type: 'number' },
        predicted50PctRetention: { type: 'number' },
        predicted100PctRetention:{ type: 'number' },
        dropOffRisk:             { type: 'string', enum: ['High', 'Medium', 'Low'] },
        dropOffPoints:           { type: 'array', items: { type: 'string' } },
        retentionScore:          { type: 'number' },
        analysis:                { type: 'string' },
    },
    required: ['predicted3SecRetention', 'predicted50PctRetention', 'predicted100PctRetention',
                'dropOffRisk', 'dropOffPoints', 'retentionScore', 'analysis'],
    },

    // Competitive Gap Analysis 
    competitiveGapAnalysis: {
    type: 'object',
    properties: {
        overallCompetitiveLevel: { type: 'string', enum: ['Top 5%', 'Top 10%', 'Top 25%', 'Average', 'Below Average'] },
        keyStrengths:            { type: 'array', items: { type: 'string' } },
        criticalGaps:            { type: 'array', items: { type: 'string' } },
        differentiatorScore:     { type: 'number' },
        top10PctGapSummary:      { type: 'string' },
        analysis:                { type: 'string' },
    },
    required: ['overallCompetitiveLevel', 'keyStrengths', 'criticalGaps',
                'differentiatorScore', 'top10PctGapSummary', 'analysis'],
    },

    // ER Correlation Analysis 
    erCorrelationAnalysis: {
    type: 'object',
    properties: {
        currentER:            { type: 'number' },
        benchmarkER:          { type: 'number' },
        erPerformance:        { type: 'string', enum: ['Exceptional', 'Above Average', 'Average', 'Below Average', 'Poor'] },
        likesCorrelation:     { type: 'string' },
        commentsCorrelation:  { type: 'string' },
        viewsCorrelation:     { type: 'string' },
        erDrivers:            { type: 'array', items: { type: 'string' } },
        erDetractors:         { type: 'array', items: { type: 'string' } },
        erImprovementPotential:{ type: 'string' },
        analysis:             { type: 'string' },
    },
    required: ['currentER', 'benchmarkER', 'erPerformance', 'likesCorrelation',
                'commentsCorrelation', 'viewsCorrelation', 'erDrivers', 'erDetractors',
                'erImprovementPotential', 'analysis'],
    },

    // Overall Assessment
    overallAssessment: {
    type: 'object',
    properties: {
        overallScore:           { type: 'number' },
        contentQualityScore:    { type: 'number' },
        technicalQualityScore:  { type: 'number' },
        engagementPotentialScore:{ type: 'number' },
        viralPotentialScore:    { type: 'number' },
        grade:                  { type: 'string', enum: ['S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D'] },
        topStrengths:           { type: 'array', items: { type: 'string' } },
        criticalWeaknesses:     { type: 'array', items: { type: 'string' } },
        meets100KStandard:      { type: 'boolean' },
        analysis:               { type: 'string' },
    },
    required: ['overallScore', 'contentQualityScore', 'technicalQualityScore',
                'engagementPotentialScore', 'viralPotentialScore', 'grade',
                'topStrengths', 'criticalWeaknesses', 'meets100KStandard', 'analysis'],
    },

    // Top 3 Recommendations
    top3ActionableRecommendations: {
    type: 'array',
    minItems: 3,
    maxItems: 3,
    items: {
        type: 'object',
        properties: {
        priority:       { type: 'number', enum: [1, 2, 3] },
        impact:         { type: 'string', enum: ['High', 'Medium', 'Low'] },
        category:       { type: 'string', enum: ['Content', 'Technical', 'Engagement', 'Visual', 'Audio', 'Structure'] },
        recommendation: { type: 'string' },
        reason:         { type: 'string' },
        expectedResult: { type: 'string' },
        },
        required: ['priority', 'impact', 'category', 'recommendation', 'reason', 'expectedResult'],
    },
    },

    // Summary 
    summary: { type: 'string' },
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

function buildAnalysisPrompt(postData) {
  const accountContext =
    postData.accountType === 'area_specific'
      ? 'Area-specific (e.g., Shibuya) → Requires overwhelming local coverage and expertise'
      : postData.accountType === 'general_tokyo'
      ? 'General Tokyo coverage → Requires diversity and consistent visual branding'
      : 'General account';

  return `
You're a video strategy analyst specializing in Instagram accounts with 100,000 followers.

[CRITICAL CONTEXT]
This account already has 100,000 followers. Therefore:
- "Fairly good" video quality isn't enough.
- Top 5-10% video quality is required.
- Find a critical differentiator, not just small improvements.

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

`.trim();
}
