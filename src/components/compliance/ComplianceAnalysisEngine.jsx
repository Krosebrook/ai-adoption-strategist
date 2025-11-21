import { base44 } from '@/api/base44Client';

// Comprehensive compliance regulation database
const COMPLIANCE_REGULATIONS = {
  'GDPR': {
    name: 'General Data Protection Regulation',
    region: 'EU',
    keyRequirements: ['Data encryption', 'Right to be forgotten', 'Data portability', 'Consent management', 'Data breach notification', 'Privacy by design'],
    aiPlatformRequirements: ['Data residency controls', 'Audit logs', 'Access controls', 'Data retention policies']
  },
  'HIPAA': {
    name: 'Health Insurance Portability and Accountability Act',
    region: 'US',
    keyRequirements: ['PHI protection', 'Access controls', 'Audit controls', 'Encryption', 'Business associate agreements'],
    aiPlatformRequirements: ['HIPAA-compliant infrastructure', 'BAA support', 'PHI isolation', 'Audit trails']
  },
  'PCI-DSS': {
    name: 'Payment Card Industry Data Security Standard',
    region: 'Global',
    keyRequirements: ['Network security', 'Cardholder data protection', 'Vulnerability management', 'Access control', 'Monitoring'],
    aiPlatformRequirements: ['PCI-certified hosting', 'Data tokenization', 'Network segmentation', 'Security monitoring']
  },
  'SOC 2': {
    name: 'Service Organization Control 2',
    region: 'Global',
    keyRequirements: ['Security', 'Availability', 'Processing integrity', 'Confidentiality', 'Privacy'],
    aiPlatformRequirements: ['SOC 2 Type II certification', 'Security controls', 'Incident response', 'Change management']
  },
  'ISO 27001': {
    name: 'Information Security Management',
    region: 'Global',
    keyRequirements: ['Risk assessment', 'Security policies', 'Asset management', 'Access control', 'Incident management'],
    aiPlatformRequirements: ['ISO 27001 certification', 'ISMS implementation', 'Security documentation', 'Regular audits']
  },
  'CCPA': {
    name: 'California Consumer Privacy Act',
    region: 'California, US',
    keyRequirements: ['Data disclosure', 'Right to deletion', 'Opt-out rights', 'Non-discrimination', 'Data security'],
    aiPlatformRequirements: ['Consumer data rights', 'Data inventory', 'Opt-out mechanisms', 'Privacy notices']
  },
  'FERPA': {
    name: 'Family Educational Rights and Privacy Act',
    region: 'US',
    keyRequirements: ['Student records protection', 'Consent requirements', 'Access rights', 'Record amendment'],
    aiPlatformRequirements: ['Educational data protection', 'Parental consent', 'Student data isolation', 'Access logs']
  }
};

/**
 * Analyze assessment for compliance with specified regulations
 */
export async function analyzeCompliance(assessment) {
  const regulations = assessment.compliance_requirements || [];
  const platforms = assessment.recommended_platforms || [];
  const painPoints = assessment.pain_points || [];
  const integrations = assessment.desired_integrations || [];
  const technicalConstraints = assessment.technical_constraints || {};

  const prompt = `You are an expert compliance analyst specializing in AI platform deployments. Analyze this organization's AI assessment for compliance risks and requirements.

**Organization Profile:**
- Name: ${assessment.organization_name}
- Industry: ${assessment.ai_insights?.industry || 'Not specified'}
- Departments: ${assessment.departments?.map(d => d.name).join(', ')}
- Total Users: ${assessment.departments?.reduce((sum, d) => sum + d.user_count, 0)}

**Required Compliance Standards:**
${regulations.map(reg => `- ${reg}: ${COMPLIANCE_REGULATIONS[reg]?.name || reg}`).join('\n')}

**Recommended AI Platforms:**
${platforms.map(p => `- ${p.platform_name} (Score: ${p.score})`).join('\n')}

**Technical Constraints:**
- Cloud Preference: ${technicalConstraints.cloud_preference || 'Any'}
- Data Residency: ${technicalConstraints.data_residency?.join(', ') || 'Not specified'}
- Existing Infrastructure: ${technicalConstraints.existing_infrastructure || 'Not specified'}

**Pain Points & Use Cases:**
${painPoints.join('\n- ')}

**Required Integrations:**
${integrations.join(', ')}

**Compliance Regulation Details:**
${regulations.map(reg => {
  const regInfo = COMPLIANCE_REGULATIONS[reg];
  if (!regInfo) return `${reg}: Custom regulation`;
  return `
${reg} (${regInfo.name}):
- Region: ${regInfo.region}
- Key Requirements: ${regInfo.keyRequirements.join(', ')}
- AI Platform Requirements: ${regInfo.aiPlatformRequirements.join(', ')}`;
}).join('\n')}

**TASK:**
Conduct a comprehensive compliance analysis:

1. **Regulation Coverage**: For each required compliance standard, assess how well the recommended platforms meet requirements
2. **Risk Assessment**: Identify specific compliance risks based on use cases, data types, and platform capabilities
3. **Gap Analysis**: Highlight gaps between current assessment and full compliance
4. **Mitigation Strategies**: Provide actionable steps to address each compliance risk
5. **Platform-Specific Compliance**: Evaluate each recommended platform's compliance posture

Provide detailed, actionable compliance analysis with specific references to regulations.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          overall_compliance_score: {
            type: "number",
            description: "Overall compliance readiness score 0-100"
          },
          compliance_status: {
            type: "string",
            enum: ["compliant", "partially_compliant", "non_compliant", "needs_review"]
          },
          regulation_analysis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                regulation: { type: "string" },
                compliance_level: { type: "string", enum: ["full", "partial", "none"] },
                coverage_percentage: { type: "number" },
                met_requirements: { type: "array", items: { type: "string" } },
                unmet_requirements: { type: "array", items: { type: "string" } },
                platform_support: {
                  type: "object",
                  additionalProperties: {
                    type: "object",
                    properties: {
                      supports: { type: "boolean" },
                      certification_level: { type: "string" },
                      notes: { type: "string" }
                    }
                  }
                }
              }
            }
          },
          identified_risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                risk_id: { type: "string" },
                regulation: { type: "string" },
                risk_type: { type: "string" },
                severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                description: { type: "string" },
                affected_platforms: { type: "array", items: { type: "string" } },
                potential_impact: { type: "string" },
                likelihood: { type: "string", enum: ["high", "medium", "low"] },
                mitigation_steps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      step: { type: "string" },
                      priority: { type: "string" },
                      effort: { type: "string" },
                      timeline: { type: "string" }
                    }
                  }
                }
              }
            }
          },
          compliance_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                gap_area: { type: "string" },
                regulation: { type: "string" },
                description: { type: "string" },
                priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                remediation_plan: { type: "string" },
                estimated_effort: { type: "string" },
                dependencies: { type: "array", items: { type: "string" } }
              }
            }
          },
          platform_compliance_ratings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                overall_rating: { type: "number" },
                certifications: { type: "array", items: { type: "string" } },
                strengths: { type: "array", items: { type: "string" } },
                weaknesses: { type: "array", items: { type: "string" } },
                recommended_for: { type: "array", items: { type: "string" } }
              }
            }
          },
          immediate_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                urgency: { type: "string", enum: ["immediate", "within_30_days", "within_90_days"] },
                responsible_party: { type: "string" },
                success_criteria: { type: "string" }
              }
            }
          },
          long_term_recommendations: {
            type: "array",
            items: { type: "string" }
          },
          audit_readiness: {
            type: "object",
            properties: {
              current_readiness: { type: "string", enum: ["ready", "partially_ready", "not_ready"] },
              estimated_time_to_ready: { type: "string" },
              critical_requirements: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to analyze compliance:', error);
    throw error;
  }
}

/**
 * Generate regulation-specific compliance report
 */
export async function generateComplianceReport(assessment, complianceAnalysis, regulationName) {
  const regulation = COMPLIANCE_REGULATIONS[regulationName];
  const relevantRisks = complianceAnalysis.identified_risks?.filter(r => r.regulation === regulationName) || [];
  const relevantGaps = complianceAnalysis.compliance_gaps?.filter(g => g.regulation === regulationName) || [];
  const regulationAnalysis = complianceAnalysis.regulation_analysis?.find(r => r.regulation === regulationName);

  const prompt = `Generate a formal compliance report for ${regulationName} (${regulation?.name || regulationName}) for regulatory submission or audit purposes.

**Organization:** ${assessment.organization_name}
**Assessment Date:** ${assessment.assessment_date}
**Report Type:** ${regulationName} Compliance Assessment

**Compliance Status:**
- Overall Score: ${complianceAnalysis.overall_compliance_score}/100
- Status: ${complianceAnalysis.compliance_status}
- ${regulationName} Coverage: ${regulationAnalysis?.coverage_percentage || 0}%

**Identified Risks (${relevantRisks.length}):**
${relevantRisks.map(r => `- ${r.risk_type} (${r.severity}): ${r.description}`).join('\n')}

**Compliance Gaps (${relevantGaps.length}):**
${relevantGaps.map(g => `- ${g.gap_area} (${g.priority}): ${g.description}`).join('\n')}

**Recommended Platforms:**
${assessment.recommended_platforms?.map(p => p.platform_name).join(', ')}

Generate a professional, audit-ready compliance report with:
1. Executive Summary
2. Scope and Methodology
3. Compliance Status Assessment
4. Risk Analysis
5. Gap Analysis
6. Remediation Plan
7. Timeline and Milestones
8. Appendices

Format for regulatory submission. Use formal, precise language.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          report_metadata: {
            type: "object",
            properties: {
              report_title: { type: "string" },
              regulation: { type: "string" },
              organization: { type: "string" },
              report_date: { type: "string" },
              prepared_by: { type: "string" },
              version: { type: "string" }
            }
          },
          executive_summary: { type: "string" },
          scope_and_methodology: { type: "string" },
          compliance_status: {
            type: "object",
            properties: {
              overall_assessment: { type: "string" },
              compliance_percentage: { type: "number" },
              key_findings: { type: "array", items: { type: "string" } },
              certification_status: { type: "string" }
            }
          },
          detailed_requirements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                requirement_id: { type: "string" },
                requirement_name: { type: "string" },
                status: { type: "string", enum: ["met", "partially_met", "not_met", "not_applicable"] },
                evidence: { type: "string" },
                notes: { type: "string" }
              }
            }
          },
          risk_analysis: {
            type: "object",
            properties: {
              summary: { type: "string" },
              critical_risks: { type: "array", items: { type: "string" } },
              risk_matrix: { type: "string" },
              risk_mitigation_plan: { type: "string" }
            }
          },
          gap_analysis: {
            type: "object",
            properties: {
              identified_gaps: { type: "array", items: { type: "string" } },
              impact_assessment: { type: "string" },
              priority_ranking: { type: "array", items: { type: "string" } }
            }
          },
          remediation_plan: {
            type: "array",
            items: {
              type: "object",
              properties: {
                gap_addressed: { type: "string" },
                remediation_actions: { type: "array", items: { type: "string" } },
                timeline: { type: "string" },
                responsible_party: { type: "string" },
                resources_required: { type: "string" },
                success_criteria: { type: "string" }
              }
            }
          },
          implementation_timeline: {
            type: "object",
            properties: {
              phase_1: { type: "string" },
              phase_2: { type: "string" },
              phase_3: { type: "string" },
              estimated_completion: { type: "string" }
            }
          },
          recommendations: { type: "array", items: { type: "string" } },
          appendices: {
            type: "object",
            properties: {
              glossary: { type: "array", items: { type: "string" } },
              references: { type: "array", items: { type: "string" } },
              supporting_documentation: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to generate compliance report:', error);
    throw error;
  }
}

/**
 * Auto-flag compliance risks during assessment
 */
export async function autoFlagComplianceRisks(assessmentData) {
  const prompt = `As a compliance risk detection system, analyze this in-progress AI assessment for potential compliance issues.

**Current Assessment Data:**
- Departments: ${assessmentData.departments?.map(d => d.name).join(', ')}
- Pain Points: ${assessmentData.pain_points?.join(', ')}
- Integrations: ${assessmentData.desired_integrations?.join(', ')}
- Compliance Requirements: ${assessmentData.compliance_requirements?.join(', ')}
- Cloud Preference: ${assessmentData.technical_constraints?.cloud_preference}
- Data Residency: ${assessmentData.technical_constraints?.data_residency?.join(', ')}

Scan for potential compliance red flags and risks that should be addressed before finalizing the assessment.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          flagged_risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                flag_type: { type: "string", enum: ["data_residency", "integration_risk", "certification_gap", "use_case_risk", "insufficient_controls"] },
                severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                regulation: { type: "string" },
                description: { type: "string" },
                recommendation: { type: "string" },
                blocking: { type: "boolean" }
              }
            }
          },
          warnings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                warning: { type: "string" },
                suggestion: { type: "string" }
              }
            }
          },
          missing_information: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to auto-flag risks:', error);
    throw error;
  }
}