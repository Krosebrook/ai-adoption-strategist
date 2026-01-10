import { base44 } from '@/api/base44Client';

/**
 * Sophisticated Scenario Planning Engine
 * Generates multiple strategic options based on different risk appetites
 */

export async function generateScenarioPlans(assessment, platforms, riskAppetite = 'balanced') {
  const primaryPlatform = platforms[0];
  
  const riskProfiles = {
    conservative: {
      description: 'Minimize risk, slower rollout, proven technologies',
      characteristics: ['Low-risk phases', 'Extended timelines', 'Pilot-heavy approach', 'Maximum training', 'Gradual adoption']
    },
    balanced: {
      description: 'Balance risk and speed, standard best practices',
      characteristics: ['Moderate pace', 'Standard phases', 'Balanced pilot and rollout', 'Comprehensive training', 'Measured adoption']
    },
    aggressive: {
      description: 'Fast implementation, accept higher risk for speed',
      characteristics: ['Rapid deployment', 'Compressed timelines', 'Minimal pilots', 'Just-in-time training', 'Fast adoption']
    }
  };

  const prompt = `You are a strategic planning expert. Generate THREE distinct AI adoption scenario plans for ${assessment.organization_name} adopting ${primaryPlatform.platform_name}, each optimized for a different risk appetite.

ORGANIZATION CONTEXT:
- Departments: ${assessment.departments?.map(d => d.name).join(', ')}
- Total Users: ${assessment.departments?.reduce((sum, d) => sum + d.user_count, 0)}
- Business Goals: ${assessment.business_goals?.join(', ')}
- Pain Points: ${assessment.pain_points?.join(', ')}
- Budget Range: ${assessment.budget_constraints?.min_budget ? `$${assessment.budget_constraints.min_budget}-$${assessment.budget_constraints.max_budget}` : 'Not specified'}

Generate three scenarios:
1. CONSERVATIVE: ${riskProfiles.conservative.description}
2. BALANCED: ${riskProfiles.balanced.description}  
3. AGGRESSIVE: ${riskProfiles.aggressive.description}

For each scenario provide:
- Implementation timeline and phases
- Resource requirements and costs
- Risk assessment and mitigation
- Expected ROI with timeline
- Success probability
- Key trade-offs
- Recommended for specific conditions

Rank scenarios by potential ROI and business goal alignment.`;

  const schema = {
    type: 'object',
    properties: {
      scenarios: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            scenario_name: { 
              type: 'string',
              enum: ['Conservative', 'Balanced', 'Aggressive']
            },
            risk_appetite: { 
              type: 'string',
              enum: ['conservative', 'balanced', 'aggressive']
            },
            executive_summary: { type: 'string' },
            timeline: {
              type: 'object',
              properties: {
                total_duration: { type: 'string' },
                phase_count: { type: 'number' },
                timeline_comparison: { type: 'string' }
              }
            },
            phases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  phase_name: { type: 'string' },
                  duration: { type: 'string' },
                  key_activities: { type: 'array', items: { type: 'string' } },
                  deliverables: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            resources: {
              type: 'object',
              properties: {
                total_budget: { type: 'string' },
                team_size: { type: 'string' },
                external_consultants: { type: 'boolean' },
                budget_breakdown: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      category: { type: 'string' },
                      amount: { type: 'string' },
                      percentage: { type: 'number' }
                    }
                  }
                }
              }
            },
            risk_profile: {
              type: 'object',
              properties: {
                overall_risk_level: { 
                  type: 'string',
                  enum: ['low', 'moderate', 'high']
                },
                success_probability: { type: 'number' },
                key_risks: { type: 'array', items: { type: 'string' } },
                mitigation_approach: { type: 'string' }
              }
            },
            roi_projection: {
              type: 'object',
              properties: {
                year_1_roi: { type: 'number' },
                year_3_roi: { type: 'number' },
                payback_period: { type: 'string' },
                total_savings_estimate: { type: 'string' },
                roi_explanation: { type: 'string' }
              }
            },
            trade_offs: {
              type: 'object',
              properties: {
                advantages: { type: 'array', items: { type: 'string' } },
                disadvantages: { type: 'array', items: { type: 'string' } },
                best_suited_for: { type: 'array', items: { type: 'string' } }
              }
            },
            business_goal_alignment: {
              type: 'object',
              properties: {
                alignment_score: { type: 'number' },
                goals_addressed: { type: 'array', items: { type: 'string' } },
                alignment_explanation: { type: 'string' }
              }
            }
          }
        }
      },
      recommendation: {
        type: 'object',
        properties: {
          recommended_scenario: { 
            type: 'string',
            enum: ['Conservative', 'Balanced', 'Aggressive']
          },
          rationale: { type: 'string' },
          conditions_for_alternative: { type: 'string' }
        }
      },
      comparison_matrix: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            factor: { type: 'string' },
            conservative: { type: 'string' },
            balanced: { type: 'string' },
            aggressive: { type: 'string' }
          }
        }
      }
    }
  };

  const scenarioPlans = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: schema
  });

  // Sort scenarios by ROI and alignment
  if (scenarioPlans.scenarios) {
    scenarioPlans.scenarios.sort((a, b) => {
      const aScore = (a.roi_projection?.year_3_roi || 0) + (a.business_goal_alignment?.alignment_score || 0);
      const bScore = (b.roi_projection?.year_3_roi || 0) + (b.business_goal_alignment?.alignment_score || 0);
      return bScore - aScore;
    });
  }

  return {
    ...scenarioPlans,
    assessment_id: assessment.id,
    platform: primaryPlatform.platform_name,
    generated_date: new Date().toISOString()
  };
}