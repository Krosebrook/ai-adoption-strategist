import { base44 } from '@/api/base44Client';

export async function generateDetailedJustifications(recommendations, assessment, preferences = null) {
  const enhancedRecommendations = [];

  for (const rec of recommendations.slice(0, 3)) {
    const justification = await generateJustification(rec, assessment, preferences);
    enhancedRecommendations.push({
      ...rec,
      ai_justification: justification.summary,
      strengths: justification.strengths,
      considerations: justification.considerations,
      data_driven_rationale: justification.data_rationale
    });
  }

  return enhancedRecommendations;
}

async function generateJustification(recommendation, assessment, preferences) {
  try {
    const prompt = `Provide a detailed, data-driven justification for why ${recommendation.platform_name} was recommended for ${assessment.organization_name}.

**Scoring Breakdown:**
- Overall Score: ${recommendation.score?.toFixed(1)}/100
- ROI Score: ${recommendation.roi_score?.toFixed(1)}
- Compliance Score: ${recommendation.compliance_score?.toFixed(1)}
- Integration Score: ${recommendation.integration_score?.toFixed(1)}
- Pain Point Score: ${recommendation.pain_point_score?.toFixed(1)}

**Weights Applied:**
${JSON.stringify(recommendation.weights_used, null, 2)}

**Assessment Data:**
- Pain Points: ${assessment.pain_points?.join(', ')}
- Compliance Requirements: ${assessment.compliance_requirements?.join(', ')}
- Desired Integrations: ${assessment.desired_integrations?.join(', ')}
- Departments: ${assessment.departments?.map(d => d.name).join(', ')}

${preferences ? `**User Priorities:**
- Business Priorities: ${preferences.business_priorities}
- Constraints: ${preferences.constraints}
- Risk Tolerance: ${preferences.risk_tolerance}` : ''}

Provide:
1. A compelling 2-3 sentence summary explaining why this platform is recommended
2. List of key strengths (3-5 items) directly linked to their assessment data
3. Important considerations or trade-offs (2-3 items)
4. A data-driven rationale explaining how the scoring led to this recommendation`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          considerations: { type: "array", items: { type: "string" } },
          data_rationale: { type: "string" }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to generate justification:', error);
    return {
      summary: recommendation.justification,
      strengths: [],
      considerations: [],
      data_rationale: ''
    };
  }
}