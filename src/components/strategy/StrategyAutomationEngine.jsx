import { base44 } from '@/api/base44Client';

/**
 * Generate comprehensive AI adoption strategy from assessment
 */
export async function generateAdoptionStrategy(assessment) {
  const platform = assessment.recommended_platforms?.[0]?.platform_name;
  
  const prompt = `Create a comprehensive, actionable AI adoption strategy for ${assessment.organization_name} implementing ${platform}.

**Assessment Context:**
- Organization: ${assessment.organization_name}
- AI Maturity: ${assessment.ai_assessment_score?.maturity_level || 'beginner'}
- Departments: ${assessment.departments?.map(d => `${d.name} (${d.user_count} users)`).join(', ')}
- Business Goals: ${assessment.business_goals?.join(', ')}
- Pain Points: ${assessment.pain_points?.join(', ')}
- Budget: ${JSON.stringify(assessment.budget_constraints)}
- Compliance: ${assessment.compliance_requirements?.join(', ')}

Generate a strategic roadmap with:
1. Executive summary and vision statement
2. Multi-phase implementation plan with timelines
3. Quick wins to demonstrate value early
4. Long-term transformation goals
5. Detailed activities, deliverables, and success metrics per phase`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          roadmap: {
            type: "object",
            properties: {
              executive_summary: { type: "string" },
              vision_statement: { type: "string" },
              phases: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phase_name: { type: "string" },
                    duration: { type: "string" },
                    objectives: { type: "array", items: { type: "string" } },
                    key_activities: { type: "array", items: { type: "string" } },
                    deliverables: { type: "array", items: { type: "string" } },
                    success_metrics: { type: "array", items: { type: "string" } }
                  }
                }
              },
              quick_wins: { type: "array", items: { type: "string" } },
              long_term_goals: { type: "array", items: { type: "string" } }
            }
          },
          milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                milestone_name: { type: "string" },
                target_date: { type: "string" },
                status: { type: "string" },
                progress_percentage: { type: "number" },
                dependencies: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    return {
      assessment_id: assessment.id,
      organization_name: assessment.organization_name,
      platform,
      ...response,
      progress_tracking: {
        overall_progress: 0,
        current_phase: response.roadmap?.phases?.[0]?.phase_name,
        achievements: [],
        blockers: []
      },
      started_at: new Date().toISOString(),
      status: 'draft'
    };
  } catch (error) {
    console.error('Failed to generate adoption strategy:', error);
    throw error;
  }
}

/**
 * Proactively identify and analyze risks
 */
export async function identifyRisks(assessment, strategy) {
  const prompt = `Conduct a comprehensive risk analysis for ${assessment.organization_name}'s AI adoption strategy.

**Strategy Context:**
- Platform: ${strategy.platform}
- Current Phase: ${strategy.progress_tracking?.current_phase}
- Progress: ${strategy.progress_tracking?.overall_progress}%
- Organization Maturity: ${assessment.ai_assessment_score?.maturity_level}

**Known Context:**
- Technical Constraints: ${JSON.stringify(assessment.technical_constraints)}
- Budget: ${JSON.stringify(assessment.budget_constraints)}
- Compliance Requirements: ${assessment.compliance_requirements?.join(', ')}
- Existing Blockers: ${strategy.progress_tracking?.blockers?.join(', ') || 'None'}

Identify ALL potential risks across categories: technical, organizational, financial, compliance, and operational. For each risk, provide:
- Detailed description and impact
- Severity and probability assessment
- Comprehensive mitigation plan with specific actions
- Responsible parties and timelines`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          identified_risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk_id: { type: "string" },
                category: { type: "string" },
                description: { type: "string" },
                severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                probability: { type: "string", enum: ["very_high", "high", "medium", "low", "very_low"] },
                impact: { type: "string" },
                mitigation_plan: {
                  type: "object",
                  properties: {
                    strategy: { type: "string" },
                    actions: { type: "array", items: { type: "string" } },
                    responsible_party: { type: "string" },
                    timeline: { type: "string" }
                  }
                },
                status: { type: "string" }
              }
            }
          },
          risk_score: { type: "number", description: "Overall risk score 0-100" }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to identify risks:', error);
    throw error;
  }
}

/**
 * Monitor progress and generate real-time recommendations
 */
export async function monitorAndRecommend(strategy, recentActivity) {
  const prompt = `Analyze the current progress of ${strategy.organization_name}'s AI adoption and provide real-time strategic recommendations.

**Current Status:**
- Platform: ${strategy.platform}
- Overall Progress: ${strategy.progress_tracking?.overall_progress}%
- Current Phase: ${strategy.progress_tracking?.current_phase}
- Recent Achievements: ${strategy.progress_tracking?.achievements?.join(', ') || 'None'}
- Active Blockers: ${strategy.progress_tracking?.blockers?.join(', ') || 'None'}
- Active Risks: ${strategy.risk_analysis?.identified_risks?.filter(r => r.status !== 'resolved').length || 0}

**Recent Activity:**
${recentActivity || 'No recent updates provided'}

Analyze the situation and provide:
1. Performance assessment (excellent/on_track/needs_attention/critical)
2. Key insights about progress and trajectory
3. Concerns or warning signs
4. Specific, actionable recommendations for course correction or acceleration
5. Priority level for each recommendation`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          performance_rating: { type: "string", enum: ["excellent", "on_track", "needs_attention", "critical"] },
          key_insights: { type: "array", items: { type: "string" } },
          concerns: { type: "array", items: { type: "string" } },
          recommended_adjustments: { type: "array", items: { type: "string" } },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["acceleration", "course_correction", "risk_alert", "optimization"] },
                recommendation: { type: "string" },
                rationale: { type: "string" },
                priority: { type: "string", enum: ["critical", "high", "medium", "low"] }
              }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to monitor and recommend:', error);
    throw error;
  }
}

/**
 * Create checkpoint analysis
 */
export async function createCheckpoint(strategy) {
  const completedMilestones = strategy.milestones?.filter(m => m.status === 'completed').map(m => m.milestone_name) || [];
  const activeRisks = strategy.risk_analysis?.identified_risks?.filter(r => r.status !== 'resolved').length || 0;

  const analysis = await monitorAndRecommend(strategy, null);

  return {
    strategy_id: strategy.id,
    checkpoint_date: new Date().toISOString(),
    progress_snapshot: {
      overall_progress: strategy.progress_tracking?.overall_progress || 0,
      completed_milestones: completedMilestones,
      active_risks: activeRisks,
      team_velocity: completedMilestones.length
    },
    ai_analysis: {
      performance_rating: analysis.performance_rating,
      key_insights: analysis.key_insights,
      concerns: analysis.concerns,
      recommended_adjustments: analysis.recommended_adjustments
    }
  };
}