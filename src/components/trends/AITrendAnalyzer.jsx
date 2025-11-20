import { base44 } from '@/api/base44Client';

/**
 * Analyze assessment trends using AI
 */
export async function analyzeTrends(assessments) {
  if (!assessments || assessments.length < 2) {
    return null;
  }

  // Sort by date
  const sortedAssessments = [...assessments].sort((a, b) => 
    new Date(a.assessment_date) - new Date(b.assessment_date)
  );

  // Calculate trend metrics
  const metrics = sortedAssessments.map(a => ({
    date: a.assessment_date,
    org: a.organization_name,
    overall_score: a.ai_assessment_score?.overall_score || 0,
    readiness: a.ai_assessment_score?.readiness_score || 0,
    risk: a.ai_assessment_score?.risk_score || 0,
    maturity: a.ai_assessment_score?.maturity_level || 'beginner',
    compliance_avg: Object.values(a.compliance_scores || {}).reduce((sum, c) => 
      sum + (c.compliance_score || 0), 0) / Math.max(Object.keys(a.compliance_scores || {}).length, 1),
    top_platform: a.recommended_platforms?.[0]?.platform_name || 'N/A'
  }));

  const prompt = `You are an AI adoption trend analyst. Analyze the following assessment data over time and provide insights:

Assessment Timeline:
${JSON.stringify(metrics, null, 2)}

Total Assessments: ${assessments.length}
Time Period: ${sortedAssessments[0].assessment_date} to ${sortedAssessments[sortedAssessments.length - 1].assessment_date}

Analyze:
1. Overall trend direction (improving/declining/stable)
2. Key changes in AI readiness across organizations
3. Risk level patterns and changes
4. Maturity progression across assessments
5. Compliance score trends
6. Platform preference shifts
7. Actionable recommendations for future assessments

Provide specific, data-driven insights with percentages and comparisons.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          trend_direction: {
            type: 'string',
            enum: ['improving', 'declining', 'stable', 'mixed']
          },
          overall_summary: {
            type: 'string',
            description: 'High-level summary of trends'
          },
          readiness_trend: {
            type: 'object',
            properties: {
              direction: { type: 'string' },
              average_change: { type: 'number' },
              insight: { type: 'string' }
            }
          },
          risk_trend: {
            type: 'object',
            properties: {
              direction: { type: 'string' },
              average_change: { type: 'number' },
              insight: { type: 'string' }
            }
          },
          maturity_progression: {
            type: 'object',
            properties: {
              beginner_count: { type: 'number' },
              intermediate_count: { type: 'number' },
              advanced_count: { type: 'number' },
              expert_count: { type: 'number' },
              insight: { type: 'string' }
            }
          },
          compliance_insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                finding: { type: 'string' },
                impact: { type: 'string', enum: ['positive', 'negative', 'neutral'] }
              }
            }
          },
          platform_trends: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                platform: { type: 'string' },
                trend: { type: 'string' },
                reason: { type: 'string' }
              }
            }
          },
          recommendations: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          forecast: {
            type: 'object',
            properties: {
              predicted_direction: { type: 'string' },
              confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
              reasoning: { type: 'string' }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to analyze trends:', error);
    throw error;
  }
}