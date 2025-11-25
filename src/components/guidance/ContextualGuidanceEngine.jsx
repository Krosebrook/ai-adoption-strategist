import { base44 } from '@/api/base44Client';

/**
 * Generate contextual guidance based on user's current page and progress
 */
export async function generateContextualGuidance(page, userRole, onboardingProgress, recentActivity) {
  const prompt = `Provide contextual guidance for a ${userRole} user on the "${page}" page.

**User Progress:**
- Steps Completed: ${onboardingProgress?.steps_completed || 0}/${onboardingProgress?.total_steps || 5}
- Modules Explored: ${onboardingProgress?.modules_explored?.join(', ') || 'None'}
- Time on Platform: ${onboardingProgress?.time_spent_minutes || 0} minutes

**Recent Activity:**
${recentActivity?.slice(0, 5).map(a => `- ${a.action}: ${a.description}`).join('\n') || 'No recent activity'}

**Page Context: ${page}**

Provide:
1. A brief contextual tip for this specific page
2. 3 proactive suggestions based on their progress
3. Feature recommendations they haven't explored
4. Workflow guidance for complex tasks on this page`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          contextual_tip: {
            type: "object",
            properties: {
              title: { type: "string" },
              message: { type: "string" },
              action_label: { type: "string" },
              action_target: { type: "string" }
            }
          },
          proactive_suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                suggestion: { type: "string" },
                reason: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          unexplored_features: {
            type: "array",
            items: {
              type: "object",
              properties: {
                feature: { type: "string" },
                benefit: { type: "string" },
                page: { type: "string" }
              }
            }
          },
          workflow_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step: { type: "number" },
                action: { type: "string" },
                tip: { type: "string" }
              }
            }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to generate guidance:', error);
    throw error;
  }
}

/**
 * Generate interactive tooltips for page elements
 */
export async function generateInteractiveTooltips(page, userExperience) {
  const prompt = `Generate helpful tooltips for key elements on the "${page}" page for a ${userExperience} user.

Create tooltips that:
1. Explain what each key feature does
2. Provide pro tips for power users
3. Highlight keyboard shortcuts if applicable
4. Suggest next actions`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          tooltips: {
            type: "array",
            items: {
              type: "object",
              properties: {
                element_id: { type: "string" },
                element_selector: { type: "string" },
                title: { type: "string" },
                content: { type: "string" },
                pro_tip: { type: "string" },
                shortcut: { type: "string" }
              }
            }
          }
        }
      }
    });

    return response.tooltips || [];
  } catch (error) {
    console.error('Failed to generate tooltips:', error);
    return [];
  }
}