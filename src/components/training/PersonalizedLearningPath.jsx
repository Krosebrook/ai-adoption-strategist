import { base44 } from '@/api/base44Client';

/**
 * AI-Powered Personalized Learning Path Generator
 * Creates role-based learning paths with interactive content and assessments
 */

export async function generatePersonalizedLearningPath(user, assessment, selectedPlatform, strategy = null) {
  const prompt = `You are an expert AI training curriculum designer. Create a personalized learning path for ${user.full_name || user.email}.

USER CONTEXT:
- Role: ${user.role}
- Email: ${user.email}

ORGANIZATION CONTEXT:
- Organization: ${assessment.organization_name}
- AI Platform: ${selectedPlatform.platform_name}
- Business Goals: ${assessment.business_goals?.join(', ')}
${strategy ? `- Strategic Focus: ${strategy.executive_summary?.strategic_objectives?.join(', ')}` : ''}

Create a comprehensive learning path that includes:
1. Skill assessment and gap analysis
2. Personalized module sequence based on role
3. Interactive tutorials with hands-on exercises
4. Knowledge check quizzes after each module
5. Real-world use case scenarios
6. Certification milestones
7. Estimated completion time and learning pace recommendations`;

  const schema = {
    type: 'object',
    properties: {
      learning_path_overview: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          total_duration: { type: 'string' },
          difficulty_level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          prerequisites: { type: 'array', items: { type: 'string' } }
        }
      },
      skill_assessment: {
        type: 'object',
        properties: {
          current_skills: { type: 'array', items: { type: 'string' } },
          skill_gaps: { type: 'array', items: { type: 'string' } },
          priority_areas: { type: 'array', items: { type: 'string' } }
        }
      },
      learning_modules: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            module_id: { type: 'string' },
            module_name: { type: 'string' },
            description: { type: 'string' },
            duration: { type: 'string' },
            difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
            learning_objectives: { type: 'array', items: { type: 'string' } },
            content_sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  section_title: { type: 'string' },
                  content_type: { type: 'string', enum: ['text', 'video', 'interactive', 'quiz'] },
                  content: { type: 'string' },
                  estimated_time: { type: 'string' }
                }
              }
            },
            hands_on_exercises: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  exercise_title: { type: 'string' },
                  description: { type: 'string' },
                  steps: { type: 'array', items: { type: 'string' } },
                  expected_outcome: { type: 'string' }
                }
              }
            },
            quiz: {
              type: 'object',
              properties: {
                quiz_title: { type: 'string' },
                passing_score: { type: 'number' },
                questions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      question: { type: 'string' },
                      type: { type: 'string', enum: ['multiple_choice', 'true_false', 'short_answer'] },
                      options: { type: 'array', items: { type: 'string' } },
                      correct_answer: { type: 'string' },
                      explanation: { type: 'string' }
                    }
                  }
                }
              }
            },
            use_cases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  scenario: { type: 'string' },
                  challenge: { type: 'string' },
                  solution_approach: { type: 'string' },
                  key_takeaways: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      },
      certification_path: {
        type: 'object',
        properties: {
          certification_name: { type: 'string' },
          milestones: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                milestone: { type: 'string' },
                requirements: { type: 'array', items: { type: 'string' } },
                achievement_criteria: { type: 'string' }
              }
            }
          },
          final_assessment: { type: 'string' }
        }
      },
      recommended_pace: {
        type: 'object',
        properties: {
          hours_per_week: { type: 'number' },
          completion_timeline: { type: 'string' },
          suggested_schedule: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  };

  const learningPath = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: schema
  });

  return {
    ...learningPath,
    user_email: user.email,
    platform: selectedPlatform.platform_name,
    assessment_id: assessment.id,
    generated_date: new Date().toISOString()
  };
}