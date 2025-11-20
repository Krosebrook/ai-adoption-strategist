import { base44 } from '@/api/base44Client';

export async function generateCustomReport(template, assessment) {
  const report = {
    title: template.name,
    type: template.type,
    sections: []
  };

  for (const section of template.sections) {
    if (!section.enabled) continue;

    const sectionContent = await generateSectionContent(section, assessment);
    report.sections.push({
      title: section.title,
      type: section.type,
      content: sectionContent,
      order: section.order
    });
  }

  return report;
}

async function generateSectionContent(section, assessment) {
  const { type, ai_enhanced, title } = section;

  // Base content generation
  let content = generateBaseContent(type, assessment);

  // Apply AI enhancement if enabled
  if (ai_enhanced) {
    content = await enhanceWithAI(content, type, assessment, title);
  }

  return content;
}

function generateBaseContent(type, assessment) {
  switch (type) {
    case 'overview':
      return {
        organization: assessment.organization_name,
        date: assessment.assessment_date,
        departments: assessment.departments?.length || 0,
        summary: assessment.executive_summary?.substring(0, 500) || 'No summary available'
      };

    case 'recommendations':
      return {
        platforms: assessment.recommended_platforms?.map(p => ({
          name: p.platform_name,
          score: p.score,
          justification: p.justification
        })) || []
      };

    case 'roi':
      const roiData = Object.values(assessment.roi_calculations || {});
      return {
        platforms: roiData.map(roi => ({
          platform: roi.platform,
          annual_savings: roi.net_annual_savings,
          one_year_roi: roi.one_year_roi,
          three_year_roi: roi.three_year_roi
        }))
      };

    case 'compliance':
      return {
        requirements: assessment.compliance_requirements || [],
        scores: assessment.compliance_scores || {}
      };

    case 'risks':
      return {
        compliance_gaps: assessment.compliance_scores ? 
          Object.entries(assessment.compliance_scores)
            .filter(([_, data]) => data.not_certified?.length > 0)
            .map(([platform, data]) => ({
              platform,
              gaps: data.not_certified
            })) : [],
        integration_challenges: assessment.integration_scores ?
          Object.entries(assessment.integration_scores)
            .filter(([_, data]) => data.not_supported?.length > 0)
            .map(([platform, data]) => ({
              platform,
              challenges: data.not_supported
            })) : []
      };

    case 'implementation':
      return {
        departments: assessment.departments || [],
        timeline: 'Estimated 3-6 months',
        phases: ['Planning', 'Pilot', 'Rollout', 'Optimization']
      };

    case 'technical_specs':
      return {
        integrations: assessment.desired_integrations || [],
        compliance: assessment.compliance_requirements || [],
        user_count: assessment.departments?.reduce((sum, d) => sum + (d.user_count || 0), 0) || 0
      };

    case 'custom_text':
      return {
        text: 'Custom section content will be generated here'
      };

    default:
      return {};
  }
}

async function enhanceWithAI(content, type, assessment, customTitle) {
  try {
    const prompt = buildEnhancementPrompt(content, type, assessment, customTitle);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: getEnhancementSchema(type)
    });

    return {
      ...content,
      ai_insights: response
    };
  } catch (error) {
    console.error('Failed to enhance section with AI:', error);
    return content;
  }
}

function buildEnhancementPrompt(content, type, assessment, customTitle) {
  const basePrompt = `You are analyzing an enterprise AI platform assessment for ${assessment.organization_name}.

**Assessment Context:**
- Departments: ${assessment.departments?.map(d => d.name).join(', ')}
- Pain Points: ${assessment.pain_points?.join(', ')}
- Compliance Requirements: ${assessment.compliance_requirements?.join(', ')}

**Section Type:** ${type}
${customTitle ? `**Custom Section Title:** ${customTitle}` : ''}

**Current Data:**
${JSON.stringify(content, null, 2)}

Provide detailed, actionable insights for this section that go beyond the raw data.`;

  const typeSpecificPrompts = {
    overview: 'Summarize the key highlights and strategic implications.',
    recommendations: 'Explain why these platforms were recommended and what makes them stand out.',
    roi: 'Analyze the ROI data and provide investment recommendations with risk factors.',
    compliance: 'Assess compliance readiness and identify critical gaps.',
    risks: 'Identify top risks and provide mitigation strategies.',
    implementation: 'Create a detailed implementation roadmap with success factors.',
    technical_specs: 'Provide technical recommendations and architecture considerations.',
    ai_insights: 'Generate strategic insights based on the assessment data.',
    custom_text: `Generate relevant content for the section titled "${customTitle}".`
  };

  return `${basePrompt}\n\n${typeSpecificPrompts[type] || 'Provide relevant insights for this section.'}`;
}

function getEnhancementSchema(type) {
  const schemas = {
    overview: {
      type: "object",
      properties: {
        key_highlights: { type: "array", items: { type: "string" } },
        strategic_implications: { type: "string" },
        executive_recommendation: { type: "string" }
      }
    },
    recommendations: {
      type: "object",
      properties: {
        detailed_analysis: { type: "array", items: {
          type: "object",
          properties: {
            platform: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            considerations: { type: "array", items: { type: "string" } }
          }
        }},
        comparison_insights: { type: "string" }
      }
    },
    roi: {
      type: "object",
      properties: {
        investment_recommendation: { type: "string" },
        risk_factors: { type: "array", items: { type: "string" } },
        break_even_analysis: { type: "string" }
      }
    },
    risks: {
      type: "object",
      properties: {
        critical_risks: { type: "array", items: {
          type: "object",
          properties: {
            risk: { type: "string" },
            severity: { type: "string" },
            mitigation: { type: "string" }
          }
        }},
        overall_assessment: { type: "string" }
      }
    },
    implementation: {
      type: "object",
      properties: {
        roadmap_phases: { type: "array", items: {
          type: "object",
          properties: {
            phase: { type: "string" },
            duration: { type: "string" },
            key_activities: { type: "array", items: { type: "string" } }
          }
        }},
        success_factors: { type: "array", items: { type: "string" } }
      }
    }
  };

  return schemas[type] || {
    type: "object",
    properties: {
      insights: { type: "array", items: { type: "string" } },
      recommendations: { type: "string" }
    }
  };
}

export function formatCustomReportForDisplay(report) {
  return report.sections.sort((a, b) => a.order - b.order);
}