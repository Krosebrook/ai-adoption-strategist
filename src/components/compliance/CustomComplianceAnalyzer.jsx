import { base44 } from '@/api/base44Client';

/**
 * Analyze uploaded custom compliance documents
 */
export async function analyzeCustomComplianceDocument(fileUrl, platforms) {
  const prompt = `Analyze the uploaded compliance document and evaluate how each AI platform aligns with its requirements.

**Platforms to Evaluate:**
${platforms.map(p => `- ${p}`).join('\n')}

**Analysis Required:**
1. Extract key compliance requirements from the document
2. Identify specific obligations, controls, and standards mentioned
3. Evaluate each platform's ability to meet these requirements
4. Identify gaps where platforms may not fully comply
5. Suggest specific configurations or controls to address gaps
6. Recommend strategy adjustments needed for compliance

Provide detailed, actionable analysis.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [fileUrl],
      response_json_schema: {
        type: "object",
        properties: {
          document_summary: {
            type: "object",
            properties: {
              document_type: { type: "string" },
              regulatory_framework: { type: "string" },
              scope: { type: "string" },
              effective_date: { type: "string" }
            }
          },
          extracted_requirements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                requirement_id: { type: "string" },
                category: { type: "string" },
                description: { type: "string" },
                criticality: { type: "string", enum: ["critical", "high", "medium", "low"] },
                specific_controls: { type: "array", items: { type: "string" } }
              }
            }
          },
          platform_assessments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                overall_compliance_score: { type: "number" },
                status: { type: "string", enum: ["compliant", "partially_compliant", "non_compliant", "needs_review"] },
                compliant_areas: { type: "array", items: { type: "string" } },
                gaps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      requirement_id: { type: "string" },
                      gap_description: { type: "string" },
                      severity: { type: "string" },
                      remediation_effort: { type: "string" }
                    }
                  }
                },
                recommended_configurations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      setting: { type: "string" },
                      recommended_value: { type: "string" },
                      purpose: { type: "string" }
                    }
                  }
                }
              }
            }
          },
          strategy_adjustments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                area: { type: "string" },
                current_approach: { type: "string" },
                recommended_change: { type: "string" },
                rationale: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          implementation_roadmap: {
            type: "array",
            items: {
              type: "object",
              properties: {
                phase: { type: "string" },
                duration: { type: "string" },
                activities: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to analyze compliance document:', error);
    throw error;
  }
}

/**
 * Compare multiple compliance documents
 */
export async function compareComplianceDocuments(fileUrls, platforms) {
  const prompt = `Compare multiple compliance documents and create a unified compliance matrix for AI platform evaluation.

**Platforms:** ${platforms.join(', ')}

Analyze all uploaded documents and:
1. Identify overlapping requirements across documents
2. Find unique requirements per document
3. Create a consolidated compliance checklist
4. Prioritize requirements by criticality and frequency
5. Provide platform-specific recommendations`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: fileUrls,
      response_json_schema: {
        type: "object",
        properties: {
          documents_analyzed: { type: "number" },
          consolidated_requirements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                requirement: { type: "string" },
                sources: { type: "array", items: { type: "string" } },
                criticality: { type: "string" },
                platform_coverage: { type: "object", additionalProperties: true }
              }
            }
          },
          platform_rankings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                overall_score: { type: "number" },
                strengths: { type: "array", items: { type: "string" } },
                critical_gaps: { type: "array", items: { type: "string" } }
              }
            }
          },
          recommended_platform: { type: "string" },
          recommendation_rationale: { type: "string" }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to compare compliance documents:', error);
    throw error;
  }
}