import { base44 } from '@/api/base44Client';

/**
 * Predict future ROI based on historical data and trends
 */
export async function predictFutureROI(assessment, historicalAssessments = [], marketTrends = null) {
  const currentROI = assessment.roi_calculations || {};
  const platform = assessment.recommended_platforms?.[0]?.platform_name || 'Unknown';
  
  // Gather historical ROI data
  const historicalData = historicalAssessments
    .filter(a => a.roi_calculations && a.recommended_platforms?.[0])
    .map(a => ({
      date: a.assessment_date,
      platform: a.recommended_platforms[0].platform_name,
      roi: Object.values(a.roi_calculations)[0]?.one_year_roi || 0,
      three_year: Object.values(a.roi_calculations)[0]?.three_year_roi || 0,
      org: a.organization_name
    }));

  const prompt = `You are a financial analyst specializing in AI ROI projections. Analyze the data and predict future ROI.

Current Assessment:
- Organization: ${assessment.organization_name}
- Platform: ${platform}
- Current 1-Year ROI: ${Object.values(currentROI)[0]?.one_year_roi?.toFixed(1) || 0}%
- Current 3-Year ROI: ${Object.values(currentROI)[0]?.three_year_roi?.toFixed(1) || 0}%
- Total Annual Savings: $${Object.values(currentROI)[0]?.total_annual_savings?.toLocaleString() || 0}
- Departments: ${assessment.departments?.length || 0}
- Total Users: ${assessment.departments?.reduce((sum, d) => sum + (d.user_count || 0), 0) || 0}

Historical Data (${historicalData.length} assessments):
${JSON.stringify(historicalData, null, 2)}

Market Context:
- AI adoption growing at 30-40% annually
- Average enterprise AI ROI: 150-200% over 3 years
- Maturity curve: Initial 6-12 months show 20-40% gains, accelerating thereafter

${marketTrends ? `\nReal-time Market Intelligence:
- Recent Model Releases: ${JSON.stringify(marketTrends.model_releases?.slice(0, 3))}
- Adoption Trends: ${marketTrends.adoption_trends?.overall_growth_rate}
- Pricing Changes: ${JSON.stringify(marketTrends.pricing_trends)}
- Forecast Implications: ${marketTrends.forecast_implications?.join('; ')}` : ''}

Provide a detailed ROI forecast for Years 1-3 with realistic projections, confidence levels, and key assumptions. Factor in the latest market developments.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        year_1_forecast: {
          type: 'object',
          properties: {
            roi_percentage: { type: 'number' },
            savings: { type: 'number' },
            confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
            key_drivers: { type: 'array', items: { type: 'string' } }
          }
        },
        year_2_forecast: {
          type: 'object',
          properties: {
            roi_percentage: { type: 'number' },
            savings: { type: 'number' },
            confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
            key_drivers: { type: 'array', items: { type: 'string' } }
          }
        },
        year_3_forecast: {
          type: 'object',
          properties: {
            roi_percentage: { type: 'number' },
            savings: { type: 'number' },
            confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
            key_drivers: { type: 'array', items: { type: 'string' } }
          }
        },
        cumulative_value: {
          type: 'object',
          properties: {
            total_savings: { type: 'number' },
            total_roi: { type: 'number' },
            payback_months: { type: 'number' }
          }
        },
        risk_factors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              factor: { type: 'string' },
              impact: { type: 'string', enum: ['low', 'medium', 'high'] },
              mitigation: { type: 'string' }
            }
          }
        },
        growth_assumptions: {
          type: 'array',
          items: { type: 'string' }
        },
        recommendation: { type: 'string' }
      }
    }
  });

  return response;
}

/**
 * Predict future risks and compliance challenges
 */
export async function predictRisksAndCompliance(assessment, historicalAssessments = [], marketTrends = null) {
  const currentRisks = assessment.ai_assessment_score?.key_risks || [];
  const complianceReqs = assessment.compliance_requirements || [];
  
  const prompt = `You are a cybersecurity and compliance expert. Predict future risks and compliance challenges for AI deployment.

Current Assessment:
- Organization: ${assessment.organization_name}
- Risk Score: ${assessment.ai_assessment_score?.risk_score || 0}/100
- Current Risks: ${JSON.stringify(currentRisks)}
- Compliance Requirements: ${JSON.stringify(complianceReqs)}
- Platform: ${assessment.recommended_platforms?.[0]?.platform_name || 'N/A'}
- Maturity: ${assessment.ai_assessment_score?.maturity_level || 'beginner'}

Industry Trends:
- AI regulations evolving rapidly (EU AI Act, US Executive Orders)
- Data privacy requirements becoming stricter
- Increased focus on AI ethics and bias
- Growing concern about model security and adversarial attacks
- Supply chain vulnerabilities in AI systems

${marketTrends ? `\nLatest Regulatory Updates:
${JSON.stringify(marketTrends.regulatory_updates, null, 2)}

Current Competitive Dynamics:
${JSON.stringify(marketTrends.competitive_landscape)}` : ''}

Predict risks and compliance challenges for the next 6-24 months with likelihood and severity, incorporating the latest regulatory developments.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        predicted_risks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              risk_type: { type: 'string' },
              description: { type: 'string' },
              likelihood: { type: 'string', enum: ['low', 'medium', 'high'] },
              severity: { type: 'string', enum: ['low', 'medium', 'high'] },
              timeline: { type: 'string' },
              mitigation_strategy: { type: 'string' }
            }
          }
        },
        compliance_challenges: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              regulation: { type: 'string' },
              challenge: { type: 'string' },
              deadline: { type: 'string' },
              effort_required: { type: 'string', enum: ['low', 'medium', 'high'] },
              action_plan: { type: 'string' }
            }
          }
        },
        emerging_threats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              threat: { type: 'string' },
              description: { type: 'string' },
              probability: { type: 'string' }
            }
          }
        },
        overall_risk_trajectory: {
          type: 'string',
          enum: ['improving', 'stable', 'increasing']
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  });

  return response;
}

/**
 * Predict AI maturity progression roadmap
 */
export async function predictMaturityRoadmap(assessment, historicalAssessments = [], marketTrends = null) {
  const currentMaturity = assessment.ai_assessment_score?.maturity_level || 'beginner';
  const readiness = assessment.ai_assessment_score?.readiness_score || 0;
  
  // Calculate maturity progression from historical data
  const maturityProgression = historicalAssessments
    .sort((a, b) => new Date(a.assessment_date) - new Date(b.assessment_date))
    .map(a => ({
      date: a.assessment_date,
      level: a.ai_assessment_score?.maturity_level || 'beginner',
      readiness: a.ai_assessment_score?.readiness_score || 0
    }));

  const prompt = `You are an AI transformation consultant. Predict the organization's AI maturity progression over 1-3 years.

Current State:
- Maturity Level: ${currentMaturity}
- Readiness Score: ${readiness}/100
- Organization: ${assessment.organization_name}
- Platform: ${assessment.recommended_platforms?.[0]?.platform_name || 'N/A'}
- Departments: ${assessment.departments?.length || 0}

Historical Progression:
${JSON.stringify(maturityProgression, null, 2)}

Maturity Levels:
- Beginner: Initial exploration, basic use cases
- Intermediate: Scaled deployment, multiple use cases
- Advanced: Strategic integration, custom solutions
- Expert: AI-first culture, innovation leadership

Industry Benchmarks:
- Beginner → Intermediate: 6-12 months
- Intermediate → Advanced: 12-18 months
- Advanced → Expert: 18-24 months

${marketTrends ? `\nMarket Dynamics Affecting Timeline:
- Adoption Trends: ${marketTrends.adoption_trends?.enterprise_adoption}
- Recent Innovations: ${marketTrends.model_releases?.map(r => r.release).join(', ')}
- Key Market Statistics: ${marketTrends.adoption_trends?.key_statistics?.join('; ')}` : ''}

Create a realistic maturity roadmap with milestones, required investments, and success metrics, factoring in current market acceleration.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        current_state: {
          type: 'object',
          properties: {
            level: { type: 'string' },
            strengths: { type: 'array', items: { type: 'string' } },
            gaps: { type: 'array', items: { type: 'string' } }
          }
        },
        year_1_projection: {
          type: 'object',
          properties: {
            target_level: { type: 'string' },
            probability: { type: 'string', enum: ['low', 'medium', 'high'] },
            key_milestones: { type: 'array', items: { type: 'string' } },
            required_investments: { type: 'array', items: { type: 'string' } },
            success_metrics: { type: 'array', items: { type: 'string' } }
          }
        },
        year_2_projection: {
          type: 'object',
          properties: {
            target_level: { type: 'string' },
            probability: { type: 'string', enum: ['low', 'medium', 'high'] },
            key_milestones: { type: 'array', items: { type: 'string' } },
            required_investments: { type: 'array', items: { type: 'string' } },
            success_metrics: { type: 'array', items: { type: 'string' } }
          }
        },
        year_3_projection: {
          type: 'object',
          properties: {
            target_level: { type: 'string' },
            probability: { type: 'string', enum: ['low', 'medium', 'high'] },
            key_milestones: { type: 'array', items: { type: 'string' } },
            required_investments: { type: 'array', items: { type: 'string' } },
            success_metrics: { type: 'array', items: { type: 'string' } }
          }
        },
        critical_dependencies: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              dependency: { type: 'string' },
              impact: { type: 'string' },
              mitigation: { type: 'string' }
            }
          }
        },
        acceleration_opportunities: {
          type: 'array',
          items: { type: 'string' }
        },
        potential_roadblocks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              roadblock: { type: 'string' },
              likelihood: { type: 'string' },
              solution: { type: 'string' }
            }
          }
        },
        overall_trajectory: { type: 'string' }
      }
    }
  });

  return response;
}