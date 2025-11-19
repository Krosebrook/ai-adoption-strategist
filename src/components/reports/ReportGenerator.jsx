import { base44 } from '@/api/base44Client';

export async function generateExecutiveReport(assessment, insights = null) {
  const topPlatform = assessment.recommended_platforms?.[0];
  const roi = assessment.roi_calculations?.[topPlatform?.platform];

  const prompt = `Generate a comprehensive EXECUTIVE REPORT for this AI platform assessment:

**Organization:** ${assessment.organization_name}
**Recommended Platform:** ${topPlatform?.platform_name}
**Assessment Date:** ${assessment.assessment_date}

**Key Metrics:**
- ROI (1-year): ${roi?.one_year_roi?.toFixed(0)}%
- Annual Savings: $${roi?.net_annual_savings?.toLocaleString()}
- Compliance Score: ${assessment.compliance_scores?.[topPlatform?.platform]?.compliance_score?.toFixed(0)}%
- Total Users: ${assessment.departments?.reduce((sum, d) => sum + d.user_count, 0)}

**Pain Points:**
${assessment.pain_points?.join('\n')}

${insights ? `**AI Insights:**\n${JSON.stringify(insights, null, 2)}` : ''}

Create an executive-level report with:
1. Executive Summary (150 words max)
2. Strategic Recommendation
3. Financial Impact Summary
4. Key Risk Factors
5. Implementation Overview
6. Next Steps

Use clear, business-focused language appropriate for C-suite executives.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: prompt,
    response_json_schema: {
      type: "object",
      properties: {
        executive_summary: { type: "string" },
        strategic_recommendation: { type: "string" },
        financial_impact: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_metrics: { type: "array", items: { type: "string" } }
          }
        },
        risk_factors: { type: "array", items: { type: "string" } },
        implementation_overview: { type: "string" },
        next_steps: { type: "array", items: { type: "string" } }
      }
    }
  });

  return response;
}

export async function generateTechnicalReport(assessment) {
  const topPlatform = assessment.recommended_platforms?.[0];

  const prompt = `Generate a detailed TECHNICAL REPORT for implementing ${topPlatform?.platform_name}:

**Organization:** ${assessment.organization_name}
**Departments:** ${assessment.departments?.map(d => d.name).join(', ')}
**Integrations:** ${assessment.desired_integrations?.join(', ')}
**Compliance:** ${assessment.compliance_requirements?.join(', ')}

**Integration Scores:**
${JSON.stringify(assessment.integration_scores?.[topPlatform?.platform], null, 2)}

Create a technical implementation report with:
1. Technical Architecture Overview
2. Integration Requirements & Specifications
3. Security & Compliance Configuration
4. API & Data Flow Design
5. Infrastructure Requirements
6. Testing & Validation Plan

Use technical language appropriate for IT teams and architects.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: prompt,
    response_json_schema: {
      type: "object",
      properties: {
        architecture_overview: { type: "string" },
        integration_specifications: {
          type: "array",
          items: {
            type: "object",
            properties: {
              system: { type: "string" },
              integration_method: { type: "string" },
              requirements: { type: "string" }
            }
          }
        },
        security_config: { type: "string" },
        api_design: { type: "string" },
        infrastructure: {
          type: "array",
          items: { type: "string" }
        },
        testing_plan: {
          type: "array",
          items: {
            type: "object",
            properties: {
              phase: { type: "string" },
              tests: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    }
  });

  return response;
}

export async function generateFinancialReport(assessment) {
  const roiData = Object.values(assessment.roi_calculations || {});

  const prompt = `Generate a comprehensive FINANCIAL ANALYSIS REPORT:

**Organization:** ${assessment.organization_name}
**Total Users:** ${assessment.departments?.reduce((sum, d) => sum + d.user_count, 0)}

**ROI Data (All Platforms):**
${JSON.stringify(roiData, null, 2)}

Create a financial report with:
1. Total Cost of Ownership (TCO) Analysis
2. ROI Comparison Across Platforms
3. Cost-Benefit Analysis
4. Break-even Analysis
5. Budget Requirements & Timeline
6. Financial Risk Assessment

Use financial terminology appropriate for CFO/Finance teams.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: prompt,
    response_json_schema: {
      type: "object",
      properties: {
        tco_analysis: {
          type: "object",
          properties: {
            summary: { type: "string" },
            year_one: { type: "number" },
            year_three: { type: "number" }
          }
        },
        platform_comparison: {
          type: "array",
          items: {
            type: "object",
            properties: {
              platform: { type: "string" },
              total_cost: { type: "number" },
              net_savings: { type: "number" },
              roi_percent: { type: "number" }
            }
          }
        },
        cost_benefit_summary: { type: "string" },
        breakeven_timeline: { type: "string" },
        budget_requirements: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              amount: { type: "number" },
              timing: { type: "string" }
            }
          }
        },
        financial_risks: { type: "array", items: { type: "string" } }
      }
    }
  });

  return response;
}

export async function generateCustomReport(assessment, template) {
  const sections = template.sections.filter(s => s.enabled).sort((a, b) => a.order - b.order);
  
  const prompt = `Generate a CUSTOM REPORT based on this template:

**Template:** ${template.name}
**Detail Level:** ${template.formatting?.detail_level || 'detailed'}

**Sections to Include:**
${sections.map(s => `- ${s.title} (${s.type})`).join('\n')}

**Assessment Data:**
${JSON.stringify(assessment, null, 2)}

Generate content for each section specified in the template.`;

  const sectionSchemas = sections.reduce((acc, section) => {
    acc[section.type] = { type: "string" };
    return acc;
  }, {});

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: prompt,
    response_json_schema: {
      type: "object",
      properties: sectionSchemas
    }
  });

  return response;
}