import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { assessmentId, forceRegenerate = false } = body;

    // Check for existing path
    const existingPaths = await base44.entities.LearningPath.filter({ 
      user_email: user.email,
      status: 'active'
    });

    if (existingPaths.length > 0 && !forceRegenerate) {
      return Response.json({
        success: true,
        path: existingPaths[0],
        message: 'Using existing learning path'
      });
    }

    // Gather user context
    const userProgress = await base44.entities.TrainingProgress.filter({ 
      user_email: user.email 
    });
    
    const completedModules = userProgress.filter(p => p.status === 'completed');
    const failedModules = userProgress.filter(p => p.status === 'failed');
    
    // Get all available modules
    const allModules = await base44.entities.TrainingModule.list();
    
    // Get assessment if provided
    let assessment = null;
    if (assessmentId) {
      try {
        assessment = await base44.entities.Assessment.get(assessmentId);
      } catch (e) {
        // Assessment not found, continue without it
      }
    }

    // Get user's recent feedback and activity
    const recentFeedback = await base44.entities.AIFeedback.filter({ 
      user_email: user.email 
    }, '-created_date', 10);

    // Build AI prompt for personalized path generation
    const prompt = `You are an expert learning path designer for AI adoption training.

User Profile:
- Role: ${user.role}
- Email: ${user.email}
- Completed Modules: ${completedModules.length}
- Failed Attempts: ${failedModules.length}

Available Training Modules:
${JSON.stringify(allModules.map(m => ({
  id: m.id,
  title: m.title,
  platform: m.platform,
  difficulty: m.difficulty_level,
  skills: m.skills_covered,
  prerequisites: m.prerequisites,
  duration: m.estimated_duration
})))}

User's Training History:
${JSON.stringify(userProgress.map(p => ({
  module_id: p.module_id,
  status: p.status,
  best_score: p.best_score,
  time_spent: p.time_spent_minutes
})))}

${assessment ? `Assessment Results: ${JSON.stringify({
  platforms: assessment.recommended_platforms?.slice(0, 2),
  pain_points: assessment.pain_points,
  business_goals: assessment.business_goals
})}` : ''}

Based on:
1. The user's role and current skill level
2. Their training history and performance
3. Assessment results (if available)
4. Industry best practices for AI adoption training

Generate a personalized learning path that:
- Identifies specific skill gaps with priorities
- Recommends modules in optimal learning sequence
- Explains why each module is recommended
- Sets realistic milestones
- Provides personalization notes

Focus on practical skills needed for successful AI adoption in their role.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          path_name: { type: "string" },
          identified_skill_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                current_level: { type: "string" },
                target_level: { type: "string" },
                priority: { type: "string" },
                gap_description: { type: "string" }
              }
            }
          },
          recommended_modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                module_id: { type: "string" },
                sequence_order: { type: "number" },
                rationale: { type: "string" },
                addresses_gaps: {
                  type: "array",
                  items: { type: "string" }
                },
                is_required: { type: "boolean" }
              }
            }
          },
          milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                milestone_name: { type: "string" },
                modules_required: {
                  type: "array",
                  items: { type: "string" }
                },
                skills_achieved: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          total_estimated_hours: { type: "number" },
          personalization_notes: { type: "string" }
        }
      }
    });

    // Create the learning path
    const learningPath = await base44.entities.LearningPath.create({
      user_email: user.email,
      path_name: response.path_name,
      user_role: user.role,
      assessment_id: assessmentId,
      ai_generated: true,
      identified_skill_gaps: response.identified_skill_gaps,
      recommended_modules: response.recommended_modules,
      milestones: response.milestones.map(m => ({ ...m, completed: false })),
      total_estimated_hours: response.total_estimated_hours,
      progress_percentage: 0,
      status: 'active',
      personalization_notes: response.personalization_notes,
      last_updated: new Date().toISOString()
    });

    // Log the action
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: user.email,
      action_type: 'create',
      entity_type: 'LearningPath',
      entity_id: learningPath.id,
      success: true
    });

    return Response.json({
      success: true,
      path: learningPath,
      message: 'Personalized learning path generated'
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});