import { base44 } from '@/api/base44Client';

/**
 * Advanced Risk Analysis Engine
 * Proactively identifies risks based on industry, compliance, and technical constraints
 * Provides detailed risk scoring and tailored mitigation strategies
 */

// Industry-specific risk profiles
const INDUSTRY_RISK_PROFILES = {
  healthcare: {
    critical_areas: ['data_privacy', 'regulatory_compliance', 'patient_safety', 'clinical_integration'],
    high_risk_factors: ['HIPAA violations', 'medical device integration', 'clinical decision support'],
    compliance_standards: ['HIPAA', 'HITECH', 'FDA', 'HL7']
  },
  finance: {
    critical_areas: ['data_security', 'regulatory_compliance', 'fraud_prevention', 'audit_trails'],
    high_risk_factors: ['PCI-DSS compliance', 'financial reporting accuracy', 'transaction integrity'],
    compliance_standards: ['PCI-DSS', 'SOX', 'GDPR', 'SOC2']
  },
  retail: {
    critical_areas: ['customer_data', 'payment_security', 'inventory_systems', 'customer_experience'],
    high_risk_factors: ['PCI compliance', 'supply chain integration', 'customer PII protection'],
    compliance_standards: ['PCI-DSS', 'GDPR', 'CCPA']
  },
  manufacturing: {
    critical_areas: ['operational_technology', 'supply_chain', 'iot_security', 'production_continuity'],
    high_risk_factors: ['production downtime', 'OT/IT convergence', 'supplier dependencies'],
    compliance_standards: ['ISO27001', 'ISO9001', 'NIST']
  },
  education: {
    critical_areas: ['student_privacy', 'accessibility', 'research_data', 'academic_integrity'],
    high_risk_factors: ['FERPA compliance', 'research data protection', 'accessibility standards'],
    compliance_standards: ['FERPA', 'COPPA', 'WCAG']
  }
};

/**
 * Analyze comprehensive risks using AI
 */
export async function analyzeAdvancedRisks(assessment, platform, implementationPlan = null) {
  const industry = inferIndustry(assessment);
  const industryProfile = INDUSTRY_RISK_PROFILES[industry] || INDUSTRY_RISK_PROFILES.retail;
  
  const prompt = `You are an expert AI risk analyst specializing in enterprise AI adoption risks.

ORGANIZATION PROFILE:
- Organization: ${assessment.organization_name}
- Industry: ${industry} (inferred)
- Total Users: ${assessment.departments?.reduce((sum, d) => sum + d.user_count, 0) || 0}
- Departments: ${assessment.departments?.map(d => d.name).join(', ') || 'Not specified'}

TECHNICAL CONSTRAINTS:
- Cloud Preference: ${assessment.technical_constraints?.cloud_preference || 'Any'}
- Data Residency: ${assessment.technical_constraints?.data_residency?.join(', ') || 'Not specified'}
- Existing Infrastructure: ${assessment.technical_constraints?.existing_infrastructure || 'Not specified'}
- API Requirements: ${assessment.technical_constraints?.api_requirements?.join(', ') || 'Not specified'}

COMPLIANCE REQUIREMENTS:
${assessment.compliance_requirements?.join(', ') || 'None specified'}

CRITICAL AREAS FOR ${industry.toUpperCase()} INDUSTRY:
${industryProfile.critical_areas.join(', ')}

HIGH-RISK FACTORS:
${industryProfile.high_risk_factors.join(', ')}

PLATFORM: ${platform.platform_name}

${implementationPlan ? `IMPLEMENTATION PLAN OVERVIEW:
- Duration: ${implementationPlan.overview?.estimated_duration}
- Complexity: ${implementationPlan.overview?.complexity_level}
- Phases: ${implementationPlan.phases?.length || 0}` : ''}

Conduct a comprehensive risk analysis that:
1. Identifies ALL potential risks specific to this industry, compliance needs, and technical environment
2. Analyzes each risk dimension: likelihood, impact, detectability
3. Provides detailed, actionable mitigation strategies tailored to this organization
4. Identifies risk interdependencies and cascading effects
5. Suggests proactive monitoring and early warning indicators

Focus on practical, high-impact risks that could derail the AI adoption.`;

  const schema = {
    type: 'object',
    properties: {
      executive_summary: {
        type: 'object',
        properties: {
          overall_risk_level: { type: 'string', enum: ['low', 'moderate', 'high', 'critical'] },
          total_risks_identified: { type: 'number' },
          critical_risk_count: { type: 'number' },
          key_concerns: { type: 'array', items: { type: 'string' } },
          recommendation: { type: 'string' }
        }
      },
      risk_categories: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: { 
              type: 'string',
              enum: ['technical', 'compliance', 'operational', 'financial', 'organizational', 'security', 'vendor']
            },
            category_risk_level: { type: 'string', enum: ['low', 'moderate', 'high', 'critical'] },
            risks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  risk_id: { type: 'string' },
                  risk_name: { type: 'string' },
                  description: { type: 'string' },
                  likelihood: { 
                    type: 'object',
                    properties: {
                      score: { type: 'number', minimum: 1, maximum: 5 },
                      rationale: { type: 'string' }
                    }
                  },
                  impact: {
                    type: 'object',
                    properties: {
                      score: { type: 'number', minimum: 1, maximum: 5 },
                      rationale: { type: 'string' },
                      affected_areas: { type: 'array', items: { type: 'string' } }
                    }
                  },
                  detectability: {
                    type: 'object',
                    properties: {
                      score: { type: 'number', minimum: 1, maximum: 5 },
                      rationale: { type: 'string' }
                    }
                  },
                  risk_priority_number: { type: 'number' },
                  risk_level: { type: 'string', enum: ['low', 'moderate', 'high', 'critical'] },
                  triggers: { type: 'array', items: { type: 'string' } },
                  early_warning_indicators: { type: 'array', items: { type: 'string' } },
                  mitigation_strategies: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        strategy: { type: 'string' },
                        type: { type: 'string', enum: ['preventive', 'detective', 'corrective'] },
                        effort: { type: 'string', enum: ['low', 'medium', 'high'] },
                        effectiveness: { type: 'string', enum: ['low', 'medium', 'high'] },
                        timeline: { type: 'string' },
                        owner: { type: 'string' },
                        implementation_steps: { type: 'array', items: { type: 'string' } }
                      }
                    }
                  },
                  contingency_plans: { type: 'array', items: { type: 'string' } },
                  related_risks: { type: 'array', items: { type: 'string' } },
                  industry_specific: { type: 'boolean' }
                }
              }
            }
          }
        }
      },
      risk_interdependencies: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            risk_ids: { type: 'array', items: { type: 'string' } },
            relationship: { type: 'string' },
            cascading_effect: { type: 'string' },
            combined_impact: { type: 'string' }
          }
        }
      },
      monitoring_framework: {
        type: 'object',
        properties: {
          key_risk_indicators: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                indicator: { type: 'string' },
                measurement: { type: 'string' },
                threshold: { type: 'string' },
                monitoring_frequency: { type: 'string' }
              }
            }
          },
          reporting_cadence: { type: 'string' },
          escalation_criteria: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  };

  try {
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    // Calculate RPN for each risk and enrich data
    if (analysis.risk_categories) {
      analysis.risk_categories.forEach(category => {
        category.risks?.forEach(risk => {
          const likelihood = risk.likelihood?.score || 3;
          const impact = risk.impact?.score || 3;
          const detectability = risk.detectability?.score || 3;
          risk.risk_priority_number = likelihood * impact * detectability;
          
          // Determine risk level based on RPN
          if (risk.risk_priority_number >= 75) risk.risk_level = 'critical';
          else if (risk.risk_priority_number >= 40) risk.risk_level = 'high';
          else if (risk.risk_priority_number >= 15) risk.risk_level = 'moderate';
          else risk.risk_level = 'low';
        });
      });
    }

    return {
      ...analysis,
      industry_context: industry,
      industry_profile: industryProfile,
      analysis_date: new Date().toISOString()
    };
  } catch (error) {
    console.error('Advanced risk analysis failed:', error);
    throw new Error('Failed to analyze risks');
  }
}

/**
 * Infer industry from business goals and pain points
 */
function inferIndustry(assessment) {
  const goals = (assessment.business_goals || []).join(' ').toLowerCase();
  const painPoints = (assessment.pain_points || []).join(' ').toLowerCase();
  const combined = goals + ' ' + painPoints;

  if (combined.match(/patient|healthcare|medical|clinical|hospital|hipaa/i)) return 'healthcare';
  if (combined.match(/financial|banking|trading|payment|transaction|fintech/i)) return 'finance';
  if (combined.match(/retail|ecommerce|customer|shopping|inventory/i)) return 'retail';
  if (combined.match(/manufacturing|production|supply chain|iot|factory/i)) return 'manufacturing';
  if (combined.match(/education|student|academic|learning|research/i)) return 'education';
  
  return 'general'; // Default
}

/**
 * Generate risk heat map data
 */
export function generateRiskHeatMap(riskAnalysis) {
  const heatMapData = [];
  
  riskAnalysis.risk_categories?.forEach(category => {
    category.risks?.forEach(risk => {
      heatMapData.push({
        risk_id: risk.risk_id,
        risk_name: risk.risk_name,
        category: category.category,
        likelihood: risk.likelihood?.score || 3,
        impact: risk.impact?.score || 3,
        detectability: risk.detectability?.score || 3,
        rpn: risk.risk_priority_number,
        risk_level: risk.risk_level
      });
    });
  });

  return heatMapData.sort((a, b) => b.rpn - a.rpn);
}

/**
 * Calculate overall risk score
 */
export function calculateOverallRiskScore(riskAnalysis) {
  if (!riskAnalysis.risk_categories) return 0;

  const allRisks = riskAnalysis.risk_categories.flatMap(cat => cat.risks || []);
  const totalRPN = allRisks.reduce((sum, risk) => sum + (risk.risk_priority_number || 0), 0);
  const avgRPN = totalRPN / allRisks.length;

  // Normalize to 0-100 scale
  return Math.min(100, Math.round((avgRPN / 125) * 100));
}