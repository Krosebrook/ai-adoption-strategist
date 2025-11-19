import { base44 } from '@/api/base44Client';

export async function analyzeUnstructuredInput(text, context = 'pain_points') {
  try {
    const prompt = `Analyze this unstructured user input about their enterprise AI needs:

"${text}"

Context: ${context}

Extract and identify:
1. Specific pain points and challenges (be detailed)
2. Hidden requirements or concerns not explicitly stated
3. Industry-specific needs or constraints
4. Urgency indicators and priorities
5. Technical vs business focus
6. Compliance or security concerns mentioned

Provide structured analysis.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          pain_points: {
            type: "array",
            items: { type: "string" },
            description: "Extracted pain points"
          },
          hidden_requirements: {
            type: "array",
            items: { type: "string" }
          },
          compliance_concerns: {
            type: "array",
            items: { type: "string" }
          },
          integration_needs: {
            type: "array",
            items: { type: "string" }
          },
          urgency_level: {
            type: "string",
            enum: ["low", "medium", "high", "critical"]
          },
          technical_complexity: {
            type: "string",
            enum: ["low", "medium", "high"]
          },
          sentiment: {
            type: "string",
            enum: ["frustrated", "neutral", "optimistic", "urgent"]
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to analyze unstructured input:', error);
    return null;
  }
}

export async function refineScoringWithFeedback(assessmentData, feedbackAnalysis) {
  try {
    const prompt = `Based on historical user feedback analysis, refine the scoring weights for this assessment:

**Current Assessment:**
- Departments: ${assessmentData.departments?.map(d => d.name).join(', ')}
- Pain Points: ${assessmentData.pain_points?.join(', ')}
- Compliance: ${assessmentData.compliance_requirements?.join(', ')}

**Feedback Insights:**
${JSON.stringify(feedbackAnalysis, null, 2)}

Provide optimized scoring weights that better reflect user priorities based on feedback trends.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          roi_weight: { type: "number", description: "0-1 scale" },
          compliance_weight: { type: "number", description: "0-1 scale" },
          integration_weight: { type: "number", description: "0-1 scale" },
          pain_point_weight: { type: "number", description: "0-1 scale" },
          reasoning: { type: "string" }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to refine scoring:', error);
    return null;
  }
}

export async function analyzeFeedbackTrends() {
  try {
    const feedbacks = await base44.entities.Feedback.list('-created_date', 100);
    
    if (feedbacks.length === 0) {
      return null;
    }

    const feedbackSummary = feedbacks.map(f => ({
      rating: f.rating,
      usefulness: f.usefulness_score,
      comments: f.comments,
      missing_features: f.missing_features
    }));

    const prompt = `Analyze this user feedback data for an Enterprise AI Assessment Tool and provide insights:

${JSON.stringify(feedbackSummary, null, 2)}

Provide insights on:
1. Platform preference trends (if any patterns emerge from feedback)
2. Common concerns or satisfaction drivers
3. Recommended weighting adjustments for the recommendation algorithm (ROI, Compliance, Integration, Pain Points)

Return your analysis in the specified JSON format.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          platform_sentiment: {
            type: "object",
            description: "Sentiment analysis per platform if mentioned",
            properties: {
              google_gemini: { type: "number" },
              microsoft_copilot: { type: "number" },
              anthropic_claude: { type: "number" },
              openai_chatgpt: { type: "number" }
            }
          },
          common_concerns: {
            type: "array",
            items: { type: "string" },
            description: "Top concerns from user feedback"
          },
          satisfaction_drivers: {
            type: "array",
            items: { type: "string" },
            description: "What users value most"
          },
          weight_adjustments: {
            type: "object",
            description: "Suggested weight adjustments (0-1 scale)",
            properties: {
              roi_weight: { type: "number" },
              compliance_weight: { type: "number" },
              integration_weight: { type: "number" },
              pain_point_weight: { type: "number" }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to analyze feedback:', error);
    return null;
  }
}

export async function generatePlatformInsights(platform, assessment, roiData, complianceData, integrationData) {
  const platformName = platform.platform_name;
  const roi = roiData.find(r => r.platform === platform.platform);
  const compliance = complianceData[platform.platform];
  const integration = integrationData[platform.platform];

  const prompt = `As an enterprise AI consultant, provide detailed insights for ${platformName} based on this assessment data:

**ROI Metrics:**
- Annual Savings: $${roi?.net_annual_savings?.toLocaleString() || 0}
- 1-Year ROI: ${roi?.one_year_roi?.toFixed(0) || 0}%

**Compliance:**
- Compliance Score: ${compliance?.compliance_score?.toFixed(0) || 0}%
- Requirements: ${assessment.compliance_requirements?.join(', ') || 'None'}

**Integrations:**
- Integration Score: ${integration?.integration_score?.toFixed(0) || 0}%
- Desired Integrations: ${assessment.desired_integrations?.join(', ') || 'None'}

**Pain Points:**
${assessment.pain_points?.join('\n') || 'None specified'}

**Departments:**
${assessment.departments?.map(d => `${d.name}: ${d.user_count} users`).join('\n') || 'None'}

Provide:
1. Why this platform specifically addresses the pain points (be detailed)
2. Key strengths relevant to this organization's needs
3. Potential challenges or considerations
4. Quick wins they can expect in first 3 months

Return detailed, actionable insights in the JSON format.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          pain_point_analysis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pain_point: { type: "string" },
                how_platform_solves: { type: "string" },
                specific_features: { type: "array", items: { type: "string" } }
              }
            }
          },
          key_strengths: {
            type: "array",
            items: { type: "string" }
          },
          potential_challenges: {
            type: "array",
            items: { type: "string" }
          },
          quick_wins: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to generate platform insights:', error);
    return null;
  }
}

export async function generateImplementationRoadmap(platform, assessment) {
  const platformName = platform.platform_name;
  const totalUsers = assessment.departments?.reduce((sum, d) => sum + d.user_count, 0) || 0;

  const prompt = `Create a detailed implementation roadmap for deploying ${platformName} across an enterprise with:
- Total Users: ${totalUsers}
- Departments: ${assessment.departments?.map(d => d.name).join(', ')}
- Key Requirements: ${assessment.compliance_requirements?.join(', ')}
- Pain Points to Address: ${assessment.pain_points?.join(', ')}

Provide a comprehensive, phased implementation plan following enterprise best practices. Include pilot programs, training modules, change management, success metrics, and timeline estimates.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          phases: {
            type: "array",
            items: {
              type: "object",
              properties: {
                phase_name: { type: "string" },
                duration_weeks: { type: "number" },
                objectives: { type: "array", items: { type: "string" } },
                activities: { type: "array", items: { type: "string" } },
                success_metrics: { type: "array", items: { type: "string" } }
              }
            }
          },
          pilot_program: {
            type: "object",
            properties: {
              recommended_size: { type: "string" },
              ideal_departments: { type: "array", items: { type: "string" } },
              duration_weeks: { type: "number" },
              key_activities: { type: "array", items: { type: "string" } }
            }
          },
          training_modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                module_name: { type: "string" },
                target_audience: { type: "string" },
                duration_hours: { type: "number" },
                topics: { type: "array", items: { type: "string" } }
              }
            }
          },
          change_management: {
            type: "object",
            properties: {
              key_stakeholders: { type: "array", items: { type: "string" } },
              communication_plan: { type: "array", items: { type: "string" } },
              resistance_mitigation: { type: "array", items: { type: "string" } }
            }
          },
          success_metrics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                metric_name: { type: "string" },
                target_value: { type: "string" },
                measurement_method: { type: "string" }
              }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to generate implementation roadmap:', error);
    return null;
  }
}