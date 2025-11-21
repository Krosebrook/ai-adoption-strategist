import { base44 } from '@/api/base44Client';

/**
 * Fetch real-time market trends for AI platforms
 */
export async function fetchMarketTrends() {
  const prompt = `Provide current market intelligence on enterprise AI platforms (OpenAI ChatGPT, Google Gemini, Microsoft Copilot, Anthropic Claude):

1. Recent model releases and capability updates (last 3-6 months)
2. Industry adoption rate trends and statistics
3. Emerging AI regulations and compliance changes
4. Pricing changes and market dynamics
5. Key competitive shifts and market positioning

Focus on factual, verifiable information that impacts enterprise decision-making.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        model_releases: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string' },
              release: { type: 'string' },
              date: { type: 'string' },
              key_features: { type: 'array', items: { type: 'string' } },
              impact: { type: 'string', enum: ['high', 'medium', 'low'] }
            }
          }
        },
        adoption_trends: {
          type: 'object',
          properties: {
            overall_growth_rate: { type: 'string' },
            enterprise_adoption: { type: 'string' },
            key_statistics: { type: 'array', items: { type: 'string' } },
            trending_use_cases: { type: 'array', items: { type: 'string' } }
          }
        },
        regulatory_updates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              regulation: { type: 'string' },
              region: { type: 'string' },
              status: { type: 'string' },
              timeline: { type: 'string' },
              impact_on_enterprises: { type: 'string' }
            }
          }
        },
        pricing_trends: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string' },
              change: { type: 'string' },
              details: { type: 'string' }
            }
          }
        },
        competitive_landscape: {
          type: 'object',
          properties: {
            market_leaders: { type: 'array', items: { type: 'string' } },
            emerging_challengers: { type: 'array', items: { type: 'string' } },
            key_differentiators: { type: 'array', items: { type: 'string' } }
          }
        },
        forecast_implications: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  });

  return {
    ...response,
    last_updated: new Date().toISOString()
  };
}

/**
 * Analyze market trends impact on specific assessment
 */
export async function analyzeMarketImpact(assessment, marketTrends) {
  const topPlatform = assessment.recommended_platforms?.[0]?.platform_name || 'Unknown';
  
  const prompt = `Based on current market trends, analyze the impact on this organization's AI adoption strategy:

Organization: ${assessment.organization_name}
Recommended Platform: ${topPlatform}
Current Maturity: ${assessment.ai_assessment_score?.maturity_level || 'beginner'}

Market Context:
${JSON.stringify(marketTrends, null, 2)}

Provide specific insights on:
1. How recent developments affect their chosen platform
2. Regulatory changes that may impact their timeline
3. Market trends that strengthen or weaken their decision
4. Recommended adjustments to their strategy`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        platform_impact: {
          type: 'object',
          properties: {
            positive_developments: { type: 'array', items: { type: 'string' } },
            concerns: { type: 'array', items: { type: 'string' } },
            competitive_advantage: { type: 'string' }
          }
        },
        regulatory_considerations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              issue: { type: 'string' },
              urgency: { type: 'string', enum: ['high', 'medium', 'low'] },
              recommendation: { type: 'string' }
            }
          }
        },
        strategy_adjustments: {
          type: 'array',
          items: { type: 'string' }
        },
        risk_mitigation: {
          type: 'array',
          items: { type: 'string' }
        },
        opportunity_score: {
          type: 'number',
          description: 'Score 0-100 indicating market opportunity'
        }
      }
    }
  });

  return response;
}