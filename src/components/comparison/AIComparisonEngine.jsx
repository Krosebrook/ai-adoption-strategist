import { base44 } from '@/api/base44Client';

/**
 * Generate comprehensive AI-powered side-by-side platform comparison
 */
export async function generateAIComparison(assessment, selectedPlatforms) {
  const platformsData = selectedPlatforms.map(platform => {
    const normalized = platform.toLowerCase().replace(/ /g, '_');
    const recommendation = assessment.recommended_platforms?.find(p => p.platform_name === platform);
    const roi = assessment.roi_calculations?.[normalized];
    const compliance = assessment.compliance_scores?.[normalized];
    const integration = assessment.integration_scores?.[normalized];
    
    return {
      name: platform,
      score: recommendation?.score || 0,
      justification: recommendation?.justification || '',
      pros: recommendation?.pros || [],
      cons: recommendation?.cons || [],
      roi_1yr: roi?.one_year_roi || 0,
      roi_3yr: roi?.three_year_roi || 0,
      annual_savings: roi?.total_annual_savings || 0,
      platform_cost: roi?.total_cost || 0,
      compliance_score: compliance?.overall_score || 0,
      integration_score: integration?.overall_score || 0
    };
  });

  const prompt = `You are an enterprise AI consultant. Provide a comprehensive side-by-side comparison of these AI platforms for ${assessment.organization_name}.

Organization Context:
- Pain Points: ${assessment.pain_points?.join(', ') || 'Not specified'}
- Departments: ${assessment.departments?.map(d => d.name).join(', ') || 'Not specified'}
- Compliance Requirements: ${assessment.compliance_requirements?.join(', ') || 'None'}
- Desired Integrations: ${assessment.desired_integrations?.join(', ') || 'None'}
- Budget: $${assessment.budget_constraints?.min_budget || 0} - $${assessment.budget_constraints?.max_budget || 0}

Platforms to Compare:
${JSON.stringify(platformsData, null, 2)}

Provide a detailed comparison analyzing:
1. Overall suitability ranking with reasoning
2. Strengths and weaknesses of each platform
3. Pricing analysis (value for money, hidden costs, scaling considerations)
4. Use case suitability (which scenarios each platform excels in)
5. Implementation complexity comparison
6. Long-term strategic fit
7. Final recommendation with justification`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        executive_summary: { type: 'string' },
        platform_rankings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string' },
              rank: { type: 'number' },
              reasoning: { type: 'string' },
              overall_fit_score: { type: 'number' }
            }
          }
        },
        strengths_weaknesses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string' },
              top_strengths: { type: 'array', items: { type: 'string' } },
              key_weaknesses: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        pricing_analysis: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string' },
              value_rating: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'] },
              cost_structure: { type: 'string' },
              hidden_costs: { type: 'array', items: { type: 'string' } },
              scaling_considerations: { type: 'string' }
            }
          }
        },
        use_case_suitability: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string' },
              best_for: { type: 'array', items: { type: 'string' } },
              not_ideal_for: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        implementation_comparison: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string' },
              complexity: { type: 'string', enum: ['low', 'medium', 'high'] },
              time_to_value: { type: 'string' },
              required_resources: { type: 'string' },
              key_challenges: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        strategic_fit: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string' },
              alignment_score: { type: 'number' },
              long_term_viability: { type: 'string' },
              innovation_potential: { type: 'string' },
              ecosystem_lock_in: { type: 'string' }
            }
          }
        },
        final_recommendation: {
          type: 'object',
          properties: {
            recommended_platform: { type: 'string' },
            justification: { type: 'string' },
            alternative_consideration: { type: 'string' },
            implementation_priority: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  });

  return response;
}