import { base44 } from '@/api/base44Client';

/**
 * Generate personalized onboarding flow for new user
 */
export async function generateOnboardingFlow(user, assessment = null) {
  const prompt = `Create a personalized onboarding flow for a new user of an Enterprise AI Decision Platform.

**User Profile:**
- Name: ${user.full_name}
- Email: ${user.email}
- Role: ${user.role || 'user'}

${assessment ? `**Assessment Context:**
- Organization: ${assessment.organization_name}
- Recommended Platform: ${assessment.recommended_platforms?.[0]?.platform_name}
- Departments: ${assessment.departments?.map(d => d.name).join(', ')}
- Business Goals: ${assessment.business_goals?.join(', ')}
- Pain Points: ${assessment.pain_points?.join(', ')}
- Maturity Level: ${assessment.ai_assessment_score?.maturity_level}` : 'No assessment data available yet.'}

**Available Platform Features:**
1. Assessment - AI-powered needs assessment wizard
2. Strategy Automation - Automated roadmap and risk management
3. Training - Personalized AI training modules
4. Platform Comparison - Side-by-side AI platform analysis
5. Predictive Analytics - ROI forecasting and risk prediction
6. Reports - Custom report generation
7. Executive Dashboard - High-level metrics

Create a personalized onboarding experience with:
1. A warm, role-appropriate welcome message
2. Priority goals based on their role and context
3. Recommended first steps (features to explore first)
4. Suggested modules in order of relevance
5. Interactive tips for key features`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          personalized_path: {
            type: "object",
            properties: {
              welcome_message: { type: "string" },
              priority_goals: { type: "array", items: { type: "string" } },
              recommended_first_steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    step: { type: "string" },
                    description: { type: "string" },
                    feature: { type: "string" },
                    priority: { type: "string", enum: ["high", "medium", "low"] }
                  }
                }
              }
            }
          },
          suggested_modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                module_name: { type: "string" },
                page: { type: "string" },
                relevance: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          interactive_tips: {
            type: "array",
            items: {
              type: "object",
              properties: {
                tip_id: { type: "string" },
                page: { type: "string" },
                element: { type: "string" },
                message: { type: "string" }
              }
            }
          }
        }
      }
    });

    return {
      user_email: user.email,
      user_role: user.role || 'user',
      assessment_id: assessment?.id,
      status: 'in_progress',
      ...response,
      interactive_tips: response.interactive_tips?.map(tip => ({ ...tip, completed: false })),
      progress: {
        steps_completed: 0,
        total_steps: response.personalized_path?.recommended_first_steps?.length || 5,
        modules_explored: [],
        time_spent_minutes: 0
      }
    };
  } catch (error) {
    console.error('Failed to generate onboarding:', error);
    throw error;
  }
}

/**
 * Get contextual guidance for current page
 */
export async function getContextualGuidance(page, userRole, onboardingFlow) {
  const prompt = `Provide contextual guidance for a ${userRole} user viewing the "${page}" page.

**User's Onboarding Status:**
- Steps Completed: ${onboardingFlow?.progress?.steps_completed || 0}/${onboardingFlow?.progress?.total_steps || 5}
- Modules Explored: ${onboardingFlow?.progress?.modules_explored?.join(', ') || 'None yet'}

**Current Page: ${page}**

Provide:
1. A brief explanation of what this page offers
2. 3 key actions they should take
3. Pro tips specific to their role
4. Next recommended step after this page`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          page_overview: { type: "string" },
          key_actions: { type: "array", items: { type: "string" } },
          pro_tips: { type: "array", items: { type: "string" } },
          next_step: {
            type: "object",
            properties: {
              page: { type: "string" },
              reason: { type: "string" }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to get contextual guidance:', error);
    throw error;
  }
}