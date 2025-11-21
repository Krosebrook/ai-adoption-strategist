import { base44 } from '@/api/base44Client';

/**
 * Generate personalized training module using AI
 */
export async function generateTrainingModule(assessment, platform, userRole) {
  const prompt = `Create a comprehensive, personalized training module for ${platform} tailored to a ${userRole} role.

**Organization Context:**
- Organization: ${assessment.organization_name}
- AI Maturity: ${assessment.ai_assessment_score?.maturity_level || 'beginner'}
- Key Goals: ${assessment.business_goals?.join(', ')}
- Pain Points: ${assessment.pain_points?.join(', ')}

**Training Requirements:**
1. Generate learning objectives specific to this role and organization
2. Create detailed sections covering platform features, best practices, and use cases
3. Include practical examples relevant to their industry
4. Design interactive exercises that test understanding
5. Provide hands-on activities for real-world application
6. Create an assessment quiz to validate learning

Make the content engaging, practical, and directly applicable to their business needs.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          difficulty_level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          estimated_duration: { type: "string" },
          prerequisites: { type: "array", items: { type: "string" } },
          content: {
            type: "object",
            properties: {
              overview: { type: "string" },
              learning_objectives: {
                type: "array",
                items: { type: "string" }
              },
              sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    examples: { type: "array", items: { type: "string" } },
                    exercises: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          question: { type: "string" },
                          type: { type: "string", enum: ["multiple_choice", "true_false", "short_answer"] },
                          options: { type: "array", items: { type: "string" } },
                          correct_answer: { type: "string" }
                        }
                      }
                    }
                  }
                }
              },
              practical_activities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    steps: { type: "array", items: { type: "string" } }
                  }
                }
              },
              assessment_quiz: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correct_answer: { type: "string" },
                    explanation: { type: "string" }
                  }
                }
              }
            }
          },
          tags: { type: "array", items: { type: "string" } }
        }
      }
    });

    return {
      ...response,
      assessment_id: assessment.id,
      platform,
      user_role: userRole
    };
  } catch (error) {
    console.error('Failed to generate training module:', error);
    throw error;
  }
}

/**
 * Generate AI-driven feedback based on user progress
 */
export async function generateProgressFeedback(module, progress) {
  const prompt = `Provide personalized AI feedback for a user's training progress.

**Training Module:** ${module.title} - ${module.platform}
**Progress:** ${progress.progress_percentage}% complete
**Time Spent:** ${progress.time_spent_minutes} minutes
**Completed Sections:** ${progress.completed_sections?.length || 0} of ${module.content?.sections?.length || 0}
**Quiz Scores:** ${progress.quiz_scores?.map(s => `${s.score}/${s.total_questions}`).join(', ') || 'None yet'}

Analyze their progress and provide:
1. Constructive feedback on their learning pace and comprehension
2. Identification of strengths and areas needing improvement
3. Specific recommendations for next steps
4. Encouragement and motivation tailored to their progress`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          overall_assessment: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          areas_for_improvement: { type: "array", items: { type: "string" } },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                priority: { type: "string", enum: ["high", "medium", "low"] },
                action: { type: "string" },
                reasoning: { type: "string" }
              }
            }
          },
          suggested_next_modules: { type: "array", items: { type: "string" } },
          motivational_message: { type: "string" },
          estimated_completion_date: { type: "string" }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to generate feedback:', error);
    throw error;
  }
}

/**
 * Identify skill gaps and suggest training priorities
 */
export async function analyzeSkillGaps(assessment, userRole) {
  const prompt = `Analyze skill gaps for a ${userRole} role in this organization planning to adopt ${assessment.recommended_platforms?.[0]?.platform_name}.

**Organization Profile:**
- Maturity Level: ${assessment.ai_assessment_score?.maturity_level || 'beginner'}
- Departments: ${assessment.departments?.map(d => d.name).join(', ')}
- Business Goals: ${assessment.business_goals?.join(', ')}
- Technical Constraints: ${JSON.stringify(assessment.technical_constraints)}

Identify specific skill gaps and recommend training priorities for this role.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          role_requirements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                importance: { type: "string", enum: ["critical", "high", "medium", "low"] },
                current_level: { type: "string", enum: ["none", "basic", "intermediate", "advanced"] },
                required_level: { type: "string", enum: ["basic", "intermediate", "advanced", "expert"] }
              }
            }
          },
          priority_training_areas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                area: { type: "string" },
                urgency: { type: "string" },
                rationale: { type: "string" },
                estimated_training_time: { type: "string" }
              }
            }
          },
          recommended_learning_path: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return response;
  } catch (error) {
    console.error('Failed to analyze skill gaps:', error);
    throw error;
  }
}