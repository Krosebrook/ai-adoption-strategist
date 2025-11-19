import { base44 } from '@/api/base44Client';

export async function analyzeOverlookedRisks(assessment, allFeedback) {
  try {
    const prompt = `As an enterprise AI risk analyst, analyze this assessment data and user feedback to identify OVERLOOKED or HIDDEN risks:

**Assessment Data:**
- Organization: ${assessment.organization_name}
- Departments: ${assessment.departments?.map(d => `${d.name} (${d.user_count} users)`).join(', ')}
- Compliance: ${assessment.compliance_requirements?.join(', ')}
- Integrations: ${assessment.desired_integrations?.join(', ')}
- Pain Points: ${assessment.pain_points?.join(', ')}

**Current Compliance Scores:**
${JSON.stringify(assessment.compliance_scores, null, 2)}

**Current Integration Scores:**
${JSON.stringify(assessment.integration_scores, null, 2)}

**User Feedback Trends:**
${JSON.stringify(allFeedback.slice(0, 20), null, 2)}

Focus on:
1. Hidden technical debt or integration conflicts
2. Compliance gaps that weren't prioritized but should be
3. Scalability concerns based on user counts
4. Security vulnerabilities in chosen platforms
5. Change management risks
6. Vendor lock-in concerns

Provide actionable insights that executives might have missed.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          critical_risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                severity: { type: "string", enum: ["high", "medium", "low"] },
                description: { type: "string" },
                affected_platforms: { type: "array", items: { type: "string" } },
                mitigation: { type: "string" }
              }
            }
          },
          opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                potential_value: { type: "string" },
                description: { type: "string" },
                recommended_platforms: { type: "array", items: { type: "string" } }
              }
            }
          },
          hidden_costs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                estimated_annual_cost: { type: "number" },
                description: { type: "string" }
              }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to analyze overlooked risks:', error);
    return null;
  }
}

export async function suggestOptimalConfiguration(assessment, topPlatform) {
  try {
    const prompt = `As an enterprise AI deployment expert, suggest the OPTIMAL configuration for ${topPlatform.platform_name}:

**Organization Profile:**
- Size: ${assessment.departments?.reduce((sum, d) => sum + d.user_count, 0)} users
- Departments: ${assessment.departments?.map(d => d.name).join(', ')}
- Key Requirements: ${assessment.compliance_requirements?.join(', ')}

**Current Pain Points:**
${assessment.pain_points?.join('\n')}

Provide a detailed, actionable configuration plan including:
1. Licensing recommendations (tiers, features to enable/disable)
2. Phased rollout strategy
3. Integration architecture
4. Security configuration
5. Cost optimization strategies`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          licensing: {
            type: "object",
            properties: {
              recommended_tier: { type: "string" },
              essential_features: { type: "array", items: { type: "string" } },
              optional_features: { type: "array", items: { type: "string" } },
              estimated_cost_per_user: { type: "number" }
            }
          },
          rollout_phases: {
            type: "array",
            items: {
              type: "object",
              properties: {
                phase: { type: "string" },
                duration_weeks: { type: "number" },
                target_departments: { type: "array", items: { type: "string" } },
                objectives: { type: "array", items: { type: "string" } }
              }
            }
          },
          integration_architecture: {
            type: "object",
            properties: {
              recommended_connectors: { type: "array", items: { type: "string" } },
              api_strategy: { type: "string" },
              data_flow: { type: "string" }
            }
          },
          security_config: {
            type: "array",
            items: {
              type: "object",
              properties: {
                setting: { type: "string" },
                recommended_value: { type: "string" },
                rationale: { type: "string" }
              }
            }
          },
          cost_optimization: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strategy: { type: "string" },
                potential_savings: { type: "string" }
              }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to suggest optimal configuration:', error);
    return null;
  }
}

export async function generateDataDrivenSummary(assessment, allAssessments, allFeedback) {
  try {
    const prompt = `Generate an executive summary based on this assessment AND comparative analysis with historical data:

**Current Assessment:**
- Organization: ${assessment.organization_name}
- Recommended Platform: ${assessment.recommended_platforms?.[0]?.platform_name}
- ROI: ${assessment.roi_calculations?.[assessment.recommended_platforms?.[0]?.platform]?.one_year_roi}%

**Historical Context:**
- Total Assessments Completed: ${allAssessments.length}
- Average Feedback Rating: ${allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length || 0}

**Trends:**
${JSON.stringify({
  commonPlatforms: allAssessments.slice(0, 10).map(a => a.recommended_platforms?.[0]?.platform),
  feedbackInsights: allFeedback.slice(0, 10).map(f => ({ rating: f.rating, comments: f.comments }))
}, null, 2)}

Create an executive summary that:
1. Positions this assessment in context of industry trends
2. Highlights unique aspects of this organization
3. Provides clear action items
4. Includes confidence level and reasoning`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          key_findings: {
            type: "array",
            items: { type: "string" }
          },
          confidence_level: {
            type: "string",
            enum: ["high", "medium", "moderate"]
          },
          confidence_reasoning: { type: "string" },
          immediate_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string", enum: ["critical", "high", "medium"] },
                timeline: { type: "string" }
              }
            }
          },
          comparative_insights: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to generate data-driven summary:', error);
    return null;
  }
}

export async function refineWeightsFromFeedback(allFeedback, allAssessments) {
  try {
    const prompt = `Analyze feedback and assessment outcomes to refine scoring weights:

**Feedback Data:**
${JSON.stringify(allFeedback.map(f => ({
  rating: f.rating,
  recommendation_accurate: f.recommendation_accurate,
  roi_realistic: f.roi_realistic,
  risk_assessment_accurate: f.risk_assessment_accurate,
  comments: f.comments
})), null, 2)}

**Assessment Outcomes:**
${JSON.stringify(allAssessments.slice(0, 20).map(a => ({
  recommended: a.recommended_platforms?.[0]?.platform,
  roi: a.roi_calculations?.[a.recommended_platforms?.[0]?.platform]?.one_year_roi,
  compliance: a.compliance_scores?.[a.recommended_platforms?.[0]?.platform]?.compliance_score
})), null, 2)}

Based on user feedback accuracy patterns:
1. Which scoring dimensions users find most valuable?
2. Are we over-weighting or under-weighting certain factors?
3. What adjustments would improve recommendation accuracy?
4. Platform-specific bias corrections needed?`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_weights: {
            type: "object",
            properties: {
              roi_weight: { type: "number" },
              compliance_weight: { type: "number" },
              integration_weight: { type: "number" },
              pain_point_weight: { type: "number" }
            }
          },
          reasoning: { type: "string" },
          platform_adjustments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                adjustment_type: { type: "string" },
                reason: { type: "string" }
              }
            }
          },
          accuracy_metrics: {
            type: "object",
            properties: {
              current_accuracy_rate: { type: "number" },
              projected_accuracy_rate: { type: "number" }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to refine weights:', error);
    return null;
  }
}