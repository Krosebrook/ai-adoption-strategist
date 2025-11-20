import { base44 } from '@/api/base44Client';

/**
 * Generate AI-driven assessment score
 */
export async function generateAIAssessmentScore(assessment) {
  const prompt = `You are an AI adoption assessment expert. Analyze the following enterprise AI assessment and provide a comprehensive scoring.

Organization: ${assessment.organization_name}
Departments: ${assessment.departments?.map(d => `${d.name} (${d.user_count} users)`).join(', ')}
Pain Points: ${assessment.pain_points?.join(', ')}
Compliance Requirements: ${assessment.compliance_requirements?.join(', ')}
Desired Integrations: ${assessment.desired_integrations?.join(', ')}

Top Recommended Platform: ${assessment.recommended_platforms?.[0]?.platform || 'N/A'}
ROI Summary: ${JSON.stringify(assessment.roi_calculations || {})}
Compliance Scores: ${JSON.stringify(assessment.compliance_scores || {})}

Based on this assessment, provide:
1. Overall readiness score (0-100) for AI adoption
2. Risk assessment score (0-100) - lower is better
3. Maturity level (beginner/intermediate/advanced/expert)
4. Key risk areas with mitigation strategies
5. Organizational strengths
6. Priority improvement areas with recommendations
7. Best practices specific to this organization

Be specific, actionable, and consider the organization's context.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: {
            type: 'number',
            description: 'Overall assessment quality score 0-100'
          },
          readiness_score: {
            type: 'number',
            description: 'AI readiness score 0-100'
          },
          risk_score: {
            type: 'number',
            description: 'Risk score 0-100, lower is better'
          },
          maturity_level: {
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced', 'expert']
          },
          key_risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                area: { type: 'string' },
                severity: { 
                  type: 'string',
                  enum: ['low', 'medium', 'high']
                },
                description: { type: 'string' },
                mitigation: { type: 'string' }
              }
            }
          },
          strengths: {
            type: 'array',
            items: { type: 'string' }
          },
          improvement_areas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                area: { type: 'string' },
                priority: { 
                  type: 'string',
                  enum: ['low', 'medium', 'high']
                },
                recommendation: { type: 'string' }
              }
            }
          },
          best_practices: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to generate AI assessment score:', error);
    throw error;
  }
}