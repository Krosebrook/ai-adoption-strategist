import { base44 } from '@/api/base44Client';

/**
 * AI-Powered Comprehensive Report Generator
 * Generates detailed reports on assessments, strategies, risks, and compliance
 */

export async function generateComprehensiveReport(config) {
  const {
    reportType = 'comprehensive', // comprehensive, executive, technical, compliance
    assessmentId = null,
    strategyId = null,
    includeAssessment = true,
    includeStrategy = true,
    includeRisks = true,
    includeCompliance = true,
    includeROI = true,
    audienceLevel = 'executive', // executive, technical, stakeholder
    format = 'detailed' // summary, detailed, comprehensive
  } = config;

  let assessment = null;
  let strategy = null;
  let risks = [];

  // Fetch required data
  if (assessmentId) {
    const assessments = await base44.entities.Assessment.filter({ id: assessmentId });
    assessment = assessments[0];
  }

  if (strategyId) {
    const strategies = await base44.entities.AdoptionStrategy.filter({ id: strategyId });
    strategy = strategies[0];
  }

  const prompt = `You are an expert business analyst. Generate a comprehensive ${audienceLevel}-level report in ${format} format.

REPORT TYPE: ${reportType}
AUDIENCE: ${audienceLevel} (${audienceLevel === 'executive' ? 'C-suite, focus on business value' : audienceLevel === 'technical' ? 'IT teams, focus on implementation' : 'Stakeholders, balanced view'})

${assessment ? `ASSESSMENT DATA:
- Organization: ${assessment.organization_name}
- Platform Recommended: ${assessment.recommended_platforms?.[0]?.platform_name}
- Maturity Level: ${assessment.ai_assessment_score?.maturity_level}
- Readiness Score: ${assessment.ai_assessment_score?.overall_score}/100
- Key Strengths: ${assessment.ai_assessment_score?.strengths?.slice(0, 3).join(', ')}
- Improvement Areas: ${assessment.ai_assessment_score?.improvement_areas?.slice(0, 3).map(a => a.area).join(', ')}` : ''}

${strategy ? `STRATEGY DATA:
- Status: ${strategy.status}
- Current Phase: ${strategy.progress_tracking?.current_phase}
- Progress: ${strategy.progress_tracking?.overall_progress}%
- Phases: ${strategy.roadmap?.phases?.length}
- Active Risks: ${strategy.risk_analysis?.identified_risks?.filter(r => r.status !== 'resolved').length}` : ''}

Generate a report with the following sections based on what's included:
${includeAssessment ? '1. Executive Summary of Assessment' : ''}
${includeStrategy ? '2. Strategy Progress & Status' : ''}
${includeRisks ? '3. Risk Analysis & Mitigation' : ''}
${includeCompliance ? '4. Compliance Status & Gaps' : ''}
${includeROI ? '5. ROI Projection & Financial Analysis' : ''}
6. Key Recommendations
7. Next Steps & Action Items

Use clear, actionable language appropriate for ${audienceLevel} audience.`;

  const schema = {
    type: 'object',
    properties: {
      report_title: { type: 'string' },
      generated_date: { type: 'string' },
      executive_summary: {
        type: 'object',
        properties: {
          overview: { type: 'string' },
          key_findings: { type: 'array', items: { type: 'string' } },
          critical_actions: { type: 'array', items: { type: 'string' } }
        }
      },
      assessment_section: includeAssessment ? {
        type: 'object',
        properties: {
          readiness_analysis: { type: 'string' },
          platform_recommendation_rationale: { type: 'string' },
          organizational_strengths: { type: 'array', items: { type: 'string' } },
          areas_for_improvement: { type: 'array', items: { type: 'string' } }
        }
      } : { type: 'null' },
      strategy_section: includeStrategy ? {
        type: 'object',
        properties: {
          implementation_status: { type: 'string' },
          progress_analysis: { type: 'string' },
          milestones_achieved: { type: 'array', items: { type: 'string' } },
          upcoming_milestones: { type: 'array', items: { type: 'string' } },
          timeline_assessment: { type: 'string' }
        }
      } : { type: 'null' },
      risk_section: includeRisks ? {
        type: 'object',
        properties: {
          risk_overview: { type: 'string' },
          critical_risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                risk: { type: 'string' },
                impact: { type: 'string' },
                mitigation_status: { type: 'string' }
              }
            }
          },
          risk_trend: { type: 'string', enum: ['improving', 'stable', 'deteriorating'] }
        }
      } : { type: 'null' },
      compliance_section: includeCompliance ? {
        type: 'object',
        properties: {
          compliance_summary: { type: 'string' },
          frameworks_status: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                framework: { type: 'string' },
                status: { type: 'string' },
                gaps: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          remediation_timeline: { type: 'string' }
        }
      } : { type: 'null' },
      roi_section: includeROI ? {
        type: 'object',
        properties: {
          financial_summary: { type: 'string' },
          projected_savings: { type: 'string' },
          roi_timeline: { type: 'string' },
          cost_breakdown: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                amount: { type: 'string' },
                justification: { type: 'string' }
              }
            }
          }
        }
      } : { type: 'null' },
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
            recommendation: { type: 'string' },
            rationale: { type: 'string' },
            timeline: { type: 'string' },
            expected_impact: { type: 'string' }
          }
        }
      },
      action_items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            action: { type: 'string' },
            owner: { type: 'string' },
            due_date: { type: 'string' },
            dependencies: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      appendix: {
        type: 'object',
        properties: {
          data_sources: { type: 'array', items: { type: 'string' } },
          methodology: { type: 'string' },
          assumptions: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  };

  const report = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: schema
  });

  return {
    ...report,
    config,
    assessment_id: assessmentId,
    strategy_id: strategyId,
    generated_at: new Date().toISOString()
  };
}