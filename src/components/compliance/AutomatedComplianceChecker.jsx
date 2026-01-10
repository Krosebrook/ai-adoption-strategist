import { base44 } from '@/api/base44Client';

/**
 * Automated Compliance Assessment Engine
 * Checks compliance with GDPR, HIPAA, SOC2, and other regulations
 */

const COMPLIANCE_FRAMEWORKS = {
  GDPR: {
    name: 'General Data Protection Regulation',
    key_requirements: [
      'Data Processing Lawfulness',
      'Right to Access',
      'Right to Erasure',
      'Data Portability',
      'Privacy by Design',
      'Data Protection Officer',
      'Breach Notification',
      'Cross-Border Data Transfer'
    ]
  },
  HIPAA: {
    name: 'Health Insurance Portability and Accountability Act',
    key_requirements: [
      'Administrative Safeguards',
      'Physical Safeguards',
      'Technical Safeguards',
      'Privacy Rule Compliance',
      'Security Rule Compliance',
      'Breach Notification Rule',
      'Business Associate Agreements',
      'Access Controls'
    ]
  },
  SOC2: {
    name: 'Service Organization Control 2',
    key_requirements: [
      'Security',
      'Availability',
      'Processing Integrity',
      'Confidentiality',
      'Privacy',
      'Access Controls',
      'Change Management',
      'Risk Assessment'
    ]
  },
  'PCI-DSS': {
    name: 'Payment Card Industry Data Security Standard',
    key_requirements: [
      'Secure Network',
      'Protect Cardholder Data',
      'Vulnerability Management',
      'Access Control Measures',
      'Network Monitoring',
      'Security Policy',
      'Encryption Standards',
      'Regular Testing'
    ]
  }
};

export async function assessComplianceRequirements(assessment, platform, strategy = null) {
  const requiredCompliance = assessment.compliance_requirements || [];
  
  if (requiredCompliance.length === 0) {
    return {
      overall_status: 'not_applicable',
      message: 'No compliance requirements specified',
      frameworks: []
    };
  }

  const prompt = `You are an expert compliance auditor specializing in AI system compliance. Assess compliance requirements for ${assessment.organization_name} adopting ${platform.platform_name}.

REQUIRED COMPLIANCE FRAMEWORKS:
${requiredCompliance.map(c => `- ${c}: ${COMPLIANCE_FRAMEWORKS[c]?.name || c}`).join('\n')}

ORGANIZATION CONTEXT:
- Departments: ${assessment.departments?.map(d => d.name).join(', ')}
- Data Handling: ${assessment.technical_constraints?.data_residency?.join(', ') || 'Not specified'}
- Cloud: ${assessment.technical_constraints?.cloud_preference || 'Any'}
- Business Goals: ${assessment.business_goals?.join(', ')}

${strategy ? `PLANNED IMPLEMENTATION:
- Phases: ${strategy.phased_rollout?.length || 0}
- Timeline: ${strategy.executive_summary?.timeline_overview}` : ''}

For each required compliance framework:
1. Assess current readiness level
2. Identify specific gaps and violations risks
3. Provide detailed, actionable remediation steps
4. Estimate compliance achievement timeline
5. Flag high-priority compliance items requiring immediate attention
6. Suggest AI platform configuration for compliance
7. Recommend documentation and policies needed`;

  const schema = {
    type: 'object',
    properties: {
      overall_compliance_score: {
        type: 'number',
        description: 'Overall compliance readiness 0-100'
      },
      overall_status: {
        type: 'string',
        enum: ['compliant', 'partially_compliant', 'non_compliant', 'not_applicable']
      },
      critical_gaps_count: {
        type: 'number',
        description: 'Number of critical compliance gaps'
      },
      estimated_compliance_timeline: {
        type: 'string',
        description: 'Estimated time to achieve full compliance'
      },
      frameworks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            framework: {
              type: 'string'
            },
            readiness_level: {
              type: 'string',
              enum: ['compliant', 'mostly_compliant', 'partially_compliant', 'non_compliant']
            },
            readiness_percentage: {
              type: 'number'
            },
            requirements_assessment: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  requirement: { type: 'string' },
                  status: { 
                    type: 'string',
                    enum: ['met', 'partially_met', 'not_met', 'not_applicable']
                  },
                  gap_description: { type: 'string' },
                  risk_level: {
                    type: 'string',
                    enum: ['critical', 'high', 'medium', 'low']
                  },
                  remediation_steps: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        step: { type: 'string' },
                        effort: { type: 'string' },
                        timeline: { type: 'string' },
                        owner: { type: 'string' },
                        priority: { type: 'string' }
                      }
                    }
                  },
                  platform_configuration: { type: 'string' },
                  documentation_needed: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            critical_actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  urgency: { type: 'string' },
                  consequence_if_not_addressed: { type: 'string' },
                  estimated_cost: { type: 'string' }
                }
              }
            },
            certification_path: {
              type: 'object',
              properties: {
                audit_required: { type: 'boolean' },
                certification_body: { type: 'string' },
                estimated_timeline: { type: 'string' },
                estimated_cost: { type: 'string' },
                prerequisites: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      recommended_policies: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            policy_name: { type: 'string' },
            purpose: { type: 'string' },
            key_elements: { type: 'array', items: { type: 'string' } },
            frameworks_addressed: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  };

  const complianceAssessment = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: schema
  });

  return {
    ...complianceAssessment,
    assessment_id: assessment.id,
    platform: platform.platform_name,
    assessed_date: new Date().toISOString()
  };
}