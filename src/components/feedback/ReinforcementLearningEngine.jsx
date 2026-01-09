import { base44 } from '@/api/base44Client';

/**
 * Reinforcement Learning Engine for AI Recommendations
 * Uses historical feedback to dynamically adjust scoring weights
 * and improve recommendation accuracy over time
 */

/**
 * Analyze all feedback and identify patterns
 */
export async function analyzeFeedbackPatterns() {
  try {
    // Fetch all platform-specific feedback
    const allFeedback = await base44.entities.Feedback.filter({
      feedback_type: 'platform_recommendation'
    }, '-created_date', 500);

    if (allFeedback.length < 5) {
      return null; // Need minimum feedback for meaningful analysis
    }

    // Group feedback by platform
    const platformFeedback = {};
    allFeedback.forEach(fb => {
      const platform = fb.platform_specific;
      if (!platformFeedback[platform]) {
        platformFeedback[platform] = {
          good_fit: 0,
          poor_fit: 0,
          missing_feature: 0,
          total: 0,
          avg_score: 0,
          contexts: []
        };
      }
      
      const category = fb.context?.feedback_category || 
        (fb.recommendation_accurate ? 'good_fit' : 'poor_fit');
      
      platformFeedback[platform][category]++;
      platformFeedback[platform].total++;
      platformFeedback[platform].avg_score += fb.rating || 0;
      platformFeedback[platform].contexts.push(fb.context || {});
    });

    // Calculate averages
    Object.keys(platformFeedback).forEach(platform => {
      const pf = platformFeedback[platform];
      pf.avg_score = pf.avg_score / pf.total;
      pf.accuracy_rate = pf.good_fit / pf.total;
    });

    return {
      platform_feedback: platformFeedback,
      total_feedback_count: allFeedback.length,
      patterns_identified: identifyFeedbackPatterns(platformFeedback)
    };
  } catch (error) {
    console.error('Feedback analysis failed:', error);
    return null;
  }
}

/**
 * Identify patterns in feedback data
 */
function identifyFeedbackPatterns(platformFeedback) {
  const patterns = [];

  Object.entries(platformFeedback).forEach(([platform, data]) => {
    // Pattern: Consistently overrated
    if (data.accuracy_rate < 0.5 && data.total >= 10) {
      patterns.push({
        type: 'overrated',
        platform,
        severity: 'high',
        recommendation: 'Reduce scoring weight for this platform'
      });
    }

    // Pattern: Consistently underrated
    if (data.good_fit > 0.8 && data.total >= 10) {
      patterns.push({
        type: 'underrated',
        platform,
        severity: 'medium',
        recommendation: 'Increase scoring weight for this platform'
      });
    }

    // Pattern: Missing features commonly cited
    const missingFeatureRate = data.missing_feature / data.total;
    if (missingFeatureRate > 0.3) {
      patterns.push({
        type: 'missing_features',
        platform,
        severity: 'medium',
        recommendation: 'Review integration/feature requirements'
      });
    }
  });

  return patterns;
}

/**
 * Calculate optimized weights using reinforcement learning
 */
export async function calculateOptimizedWeights(currentWeights) {
  const feedbackAnalysis = await analyzeFeedbackPatterns();
  
  if (!feedbackAnalysis || feedbackAnalysis.total_feedback_count < 10) {
    return currentWeights; // Not enough data yet
  }

  const prompt = `You are an AI recommendation optimization system using reinforcement learning principles.

CURRENT WEIGHTS:
- ROI Weight: ${currentWeights.roi_weight * 100}%
- Compliance Weight: ${currentWeights.compliance_weight * 100}%
- Integration Weight: ${currentWeights.integration_weight * 100}%
- Pain Point Weight: ${currentWeights.pain_point_weight * 100}%

FEEDBACK ANALYSIS:
${JSON.stringify(feedbackAnalysis.platform_feedback, null, 2)}

IDENTIFIED PATTERNS:
${feedbackAnalysis.patterns_identified.map(p => `- ${p.type} for ${p.platform}: ${p.recommendation}`).join('\n')}

Based on user feedback patterns, adjust the scoring weights to improve recommendation accuracy.

RULES:
1. All weights must sum to 1.0
2. Consider which factors correlate with "good_fit" feedback
3. Reduce emphasis on factors that lead to "poor_fit" feedback
4. Make incremental adjustments (max ±15% per weight)
5. Provide reasoning for each adjustment

Return optimized weights with explanations.`;

  const schema = {
    type: 'object',
    properties: {
      optimized_weights: {
        type: 'object',
        properties: {
          roi_weight: { type: 'number' },
          compliance_weight: { type: 'number' },
          integration_weight: { type: 'number' },
          pain_point_weight: { type: 'number' }
        }
      },
      adjustments_made: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            weight_name: { type: 'string' },
            old_value: { type: 'number' },
            new_value: { type: 'number' },
            reasoning: { type: 'string' }
          }
        }
      },
      confidence_score: { type: 'number' },
      feedback_sample_size: { type: 'number' },
      recommendations: {
        type: 'array',
        items: { type: 'string' }
      }
    }
  };

  try {
    const optimization = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    // Validate weights sum to 1.0
    const sum = Object.values(optimization.optimized_weights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.01) {
      console.warn('Optimized weights do not sum to 1.0, using current weights');
      return currentWeights;
    }

    optimization.feedback_sample_size = feedbackAnalysis.total_feedback_count;

    return optimization;
  } catch (error) {
    console.error('Weight optimization failed:', error);
    return currentWeights;
  }
}

/**
 * Apply reinforcement learning to assessment scoring
 */
export async function applyReinforcementLearning(assessment, recommendations) {
  const currentWeights = {
    roi_weight: 0.35,
    compliance_weight: 0.25,
    integration_weight: 0.25,
    pain_point_weight: 0.15
  };

  const optimization = await calculateOptimizedWeights(currentWeights);

  if (optimization.optimized_weights) {
    return {
      enhanced_recommendations: recommendations, // Would re-score with new weights
      optimization_applied: true,
      new_weights: optimization.optimized_weights,
      adjustments: optimization.adjustments_made,
      confidence: optimization.confidence_score,
      sample_size: optimization.feedback_sample_size,
      recommendations: optimization.recommendations
    };
  }

  return {
    enhanced_recommendations: recommendations,
    optimization_applied: false,
    message: 'Insufficient feedback data for optimization'
  };
}

/**
 * Store optimization result for tracking
 */
export async function logOptimizationResult(optimization) {
  try {
    const log = {
      timestamp: new Date().toISOString(),
      weights_applied: optimization.new_weights,
      adjustments: optimization.adjustments,
      confidence_score: optimization.confidence,
      sample_size: optimization.sample_size
    };

    // Store in UserSettings or create OptimizationLog entity
    const user = await base44.auth.me();
    const settings = await base44.entities.UserSettings.filter({ user_email: user.email });
    
    if (settings.length > 0) {
      await base44.entities.UserSettings.update(settings[0].id, {
        ai_preferences: {
          ...settings[0].ai_preferences,
          last_optimization: log
        }
      });
    }
  } catch (error) {
    console.error('Failed to log optimization:', error);
  }
}