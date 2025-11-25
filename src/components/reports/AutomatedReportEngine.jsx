import { base44 } from '@/api/base44Client';

/**
 * Generate performance summary report
 */
export async function generatePerformanceSummaryReport(strategies, assessments, dateRange) {
  const prompt = `Generate a comprehensive performance summary report for AI adoption initiatives.

**Date Range:** ${dateRange.start} to ${dateRange.end}

**Active Strategies:** ${strategies.length}
${strategies.map(s => `- ${s.organization_name}: ${s.platform} (${s.status}) - Progress: ${s.progress_tracking?.overall_progress || 0}%`).join('\n')}

**Assessments Completed:** ${assessments.length}
${assessments.slice(0, 5).map(a => `- ${a.organization_name}: Top recommendation - ${a.recommended_platforms?.[0]?.platform_name}`).join('\n')}

Generate:
1. Executive summary with key metrics
2. Progress analysis across all strategies
3. Platform adoption trends
4. Key achievements and milestones
5. Areas requiring attention
6. Recommendations for next period`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          report_type: { type: "string" },
          generated_at: { type: "string" },
          executive_summary: { type: "string" },
          key_metrics: {
            type: "object",
            properties: {
              total_strategies: { type: "number" },
              average_progress: { type: "number" },
              assessments_completed: { type: "number" },
              risks_mitigated: { type: "number" }
            }
          },
          progress_analysis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strategy: { type: "string" },
                progress: { type: "number" },
                status: { type: "string" },
                highlights: { type: "array", items: { type: "string" } }
              }
            }
          },
          platform_trends: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                adoption_count: { type: "number" },
                trend: { type: "string" }
              }
            }
          },
          achievements: { type: "array", items: { type: "string" } },
          attention_areas: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    return { ...response, report_type: 'performance_summary', generated_at: new Date().toISOString() };
  } catch (error) {
    console.error('Failed to generate performance report:', error);
    throw error;
  }
}

/**
 * Generate predictive ROI and risk analysis report
 */
export async function generatePredictiveReport(strategy, assessment) {
  const prompt = `Generate a predictive ROI and risk analysis report for ${strategy.organization_name}.

**Strategy Details:**
- Platform: ${strategy.platform}
- Current Phase: ${strategy.progress_tracking?.current_phase}
- Overall Progress: ${strategy.progress_tracking?.overall_progress || 0}%
- Active Risks: ${strategy.risk_analysis?.identified_risks?.filter(r => r.status !== 'resolved').length || 0}

**Assessment ROI Data:**
${JSON.stringify(assessment?.roi_calculations || {}, null, 2)}

**Risk Profile:**
${strategy.risk_analysis?.identified_risks?.map(r => `- ${r.category}: ${r.description} (${r.severity})`).join('\n') || 'No risks identified'}

Generate:
1. 12-month ROI forecast with confidence intervals
2. Risk trajectory prediction
3. Cost vs benefit analysis
4. Success probability assessment
5. Key risk indicators to monitor
6. Mitigation effectiveness forecast`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          report_type: { type: "string" },
          roi_forecast: {
            type: "object",
            properties: {
              month_3: { type: "number" },
              month_6: { type: "number" },
              month_12: { type: "number" },
              confidence_level: { type: "string" },
              key_drivers: { type: "array", items: { type: "string" } }
            }
          },
          risk_trajectory: {
            type: "object",
            properties: {
              current_risk_score: { type: "number" },
              predicted_score_3m: { type: "number" },
              predicted_score_6m: { type: "number" },
              trend: { type: "string" }
            }
          },
          cost_benefit: {
            type: "object",
            properties: {
              total_investment: { type: "number" },
              projected_savings: { type: "number" },
              net_benefit: { type: "number" },
              payback_period: { type: "string" }
            }
          },
          success_probability: {
            type: "object",
            properties: {
              overall: { type: "number" },
              factors: { type: "array", items: { type: "string" } }
            }
          },
          key_indicators: { type: "array", items: { type: "string" } },
          mitigation_forecast: { type: "array", items: { type: "string" } }
        }
      }
    });

    return { ...response, report_type: 'predictive_analysis', generated_at: new Date().toISOString() };
  } catch (error) {
    console.error('Failed to generate predictive report:', error);
    throw error;
  }
}

/**
 * Generate compliance gap report
 */
export async function generateComplianceGapReport(assessment, strategy) {
  const prompt = `Generate a compliance gap report for ${assessment.organization_name}.

**Required Compliance:**
${assessment.compliance_requirements?.join(', ') || 'None specified'}

**Current Compliance Scores:**
${JSON.stringify(assessment.compliance_scores || {}, null, 2)}

**Platform:** ${strategy?.platform || assessment.recommended_platforms?.[0]?.platform}

Generate:
1. Compliance gap analysis by requirement
2. Risk exposure assessment
3. Remediation recommendations
4. Timeline for compliance achievement
5. Resource requirements
6. Regulatory update alerts`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          report_type: { type: "string" },
          gap_analysis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                requirement: { type: "string" },
                current_status: { type: "string" },
                gap_severity: { type: "string" },
                details: { type: "string" }
              }
            }
          },
          risk_exposure: {
            type: "object",
            properties: {
              overall_risk: { type: "string" },
              financial_exposure: { type: "string" },
              reputational_risk: { type: "string" }
            }
          },
          remediation_plan: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                timeline: { type: "string" },
                resources: { type: "string" }
              }
            }
          },
          compliance_timeline: { type: "string" },
          resource_requirements: { type: "array", items: { type: "string" } },
          regulatory_alerts: { type: "array", items: { type: "string" } }
        }
      }
    });

    return { ...response, report_type: 'compliance_gap', generated_at: new Date().toISOString() };
  } catch (error) {
    console.error('Failed to generate compliance report:', error);
    throw error;
  }
}