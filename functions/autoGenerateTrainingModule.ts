import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessment_id, user_role, platform, skill_gaps } = await req.json();
    
    if (!assessment_id || !user_role || !platform) {
      return Response.json({ 
        error: 'assessment_id, user_role, and platform are required' 
      }, { status: 400 });
    }

    const assessment = await base44.entities.Assessment.get(assessment_id);
    
    // Analyze skill gaps if not provided
    let gaps = skill_gaps;
    if (!gaps) {
      const gapAnalysis = await base44.functions.invoke('analyzeSkillGaps', {
        assessment_id,
        user_role
      });
      gaps = gapAnalysis.data;
    }

    const prompt = `You are an expert instructional designer and AI training specialist. Create a comprehensive, interactive training module.

Platform: ${platform}
Target Role: ${user_role}
Organization Context: ${assessment.organization_name}
Pain Points: ${assessment.pain_points?.join(', ')}
Skill Gaps: ${JSON.stringify(gaps?.priority_training_areas || [])}

Create a detailed training module with:
1. Module title and description
2. Learning objectives (specific, measurable)
3. Difficulty level assessment
4. Estimated duration
5. Skills covered
6. Module structure with 4-6 sections, each containing:
   - Section title
   - Content (detailed, practical explanation)
   - Real-world examples specific to their organization
   - Interactive exercises (multiple choice, scenarios, code exercises)
7. Practical hands-on activities with validation criteria
8. Final assessment quiz (10-15 questions)
9. Prerequisites
10. Certification criteria

Make it practical, engaging, and tailored to ${user_role} working with ${platform}.`;

    const moduleContent = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          difficulty_level: { 
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced']
          },
          estimated_duration: { type: 'string' },
          skills_covered: { type: 'array', items: { type: 'string' } },
          content: {
            type: 'object',
            properties: {
              overview: { type: 'string' },
              learning_objectives: { type: 'array', items: { type: 'string' } },
              sections: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    section_id: { type: 'string' },
                    title: { type: 'string' },
                    content: { type: 'string' },
                    examples: { type: 'array', items: { type: 'string' } },
                    interactive_exercises: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          exercise_id: { type: 'string' },
                          type: { 
                            type: 'string',
                            enum: ['multiple_choice', 'code_exercise', 'scenario_analysis', 'drag_drop', 'fill_blank']
                          },
                          question: { type: 'string' },
                          options: { type: 'array', items: { type: 'string' } },
                          correct_answer: { type: 'string' },
                          hint: { type: 'string' },
                          explanation: { type: 'string' },
                          points: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              },
              practical_activities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    activity_id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    steps: { type: 'array', items: { type: 'string' } },
                    validation_criteria: { type: 'array', items: { type: 'string' } }
                  }
                }
              },
              assessment_quiz: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    question_id: { type: 'string' },
                    question: { type: 'string' },
                    type: { 
                      type: 'string',
                      enum: ['multiple_choice', 'true_false', 'short_answer']
                    },
                    options: { type: 'array', items: { type: 'string' } },
                    correct_answer: { type: 'string' },
                    explanation: { type: 'string' },
                    points: { type: 'number' }
                  }
                }
              }
            }
          },
          prerequisites: { type: 'array', items: { type: 'string' } },
          passing_score: { type: 'number' },
          tags: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Create the training module
    const trainingModule = await base44.entities.TrainingModule.create({
      assessment_id,
      platform,
      user_role,
      ...moduleContent,
      certificate_enabled: true
    });

    // Create personalized learning path entry
    await base44.entities.LearningPath.create({
      user_email: user.email,
      path_name: `${platform} - ${user_role} Training Path`,
      user_role,
      assessment_id,
      ai_generated: true,
      identified_skill_gaps: gaps?.priority_training_areas || [],
      recommended_modules: [{
        module_id: trainingModule.id,
        sequence_order: 1,
        rationale: `Generated to address skill gaps for ${user_role}`,
        addresses_gaps: gaps?.priority_training_areas?.map(g => g.area) || [],
        estimated_completion_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        is_required: true
      }],
      total_estimated_hours: parseInt(moduleContent.estimated_duration) || 4,
      status: 'active',
      personalization_notes: `Auto-generated training path based on assessment for ${assessment.organization_name}`
    });

    return Response.json({
      success: true,
      module: trainingModule,
      message: 'Training module and learning path created successfully'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});