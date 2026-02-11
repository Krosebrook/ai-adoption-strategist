import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessment_id, forecast_years = 3 } = await req.json();
    const assessment = await base44.entities.Assessment.get(assessment_id);

    const prompt = `You are an AI industry analyst and futurist. Based on current trends and this organization's assessment, predict future AI landscape changes and provide strategic recommendations.

Current Assessment:
- Industry: ${assessment.departments?.map(d => d.name).join(', ')}
- Current Platform Choice: ${assessment.recommended_platforms?.[0]?.platform_name}
- Organization Size: ${assessment.departments?.reduce((sum, d) => sum + d.user_count, 0)} users
- Compliance Focus: ${assessment.compliance_requirements?.join(', ')}

Forecast Period: ${forecast_years} years

Provide predictions for:
1. AI technology evolution trends
2. Platform landscape changes (which platforms will dominate)
3. New capabilities that will emerge
4. Regulatory changes and compliance requirements
5. Cost trends (will AI get cheaper or more expensive?)
6. Integration ecosystem evolution
7. Specific recommendations for this organization to stay ahead
8. Timing for potential platform migrations or upgrades
9. Investment priorities for future-proofing
10. Emerging risks and opportunities`;

    const predictions = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          forecast_years: { type: 'number' },
          technology_trends: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                trend: { type: 'string' },
                timeline: { type: 'string' },
                impact_level: { type: 'string', enum: ['low', 'medium', 'high', 'transformative'] },
                description: { type: 'string' },
                organizational_action: { type: 'string' }
              }
            }
          },
          platform_predictions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                platform: { type: 'string' },
                predicted_market_position: { type: 'string' },
                key_developments: { type: 'array', items: { type: 'string' } },
                recommendation: { type: 'string' }
              }
            }
          },
          emerging_capabilities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                capability: { type: 'string' },
                availability_timeline: { type: 'string' },
                business_value: { type: 'string' },
                preparation_needed: { type: 'string' }
              }
            }
          },
          regulatory_outlook: {
            type: 'object',
            properties: {
              upcoming_regulations: { type: 'array', items: { type: 'string' } },
              compliance_preparation: { type: 'array', items: { type: 'string' } },
              risk_areas: { type: 'array', items: { type: 'string' } }
            }
          },
          cost_trends: {
            type: 'object',
            properties: {
              overall_direction: { type: 'string' },
              factors: { type: 'array', items: { type: 'string' } },
              budget_recommendations: { type: 'string' }
            }
          },
          strategic_recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                recommendation: { type: 'string' },
                priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                timeline: { type: 'string' },
                expected_benefit: { type: 'string' }
              }
            }
          },
          migration_considerations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                trigger: { type: 'string' },
                timing: { type: 'string' },
                preparation: { type: 'string' }
              }
            }
          },
          investment_priorities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                area: { type: 'string' },
                priority: { type: 'string' },
                rationale: { type: 'string' },
                timeline: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json(predictions);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});