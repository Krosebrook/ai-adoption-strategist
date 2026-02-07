import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather user-specific context
    const userSettings = await base44.entities.UserSettings.filter({ user_email: user.email });
    const userDashboards = await base44.entities.CustomDashboard.filter({ user_email: user.email });
    const userFeedback = await base44.entities.AIFeedback.filter({ user_email: user.email });
    
    // Get user's active strategies and assessments
    const assessments = await base44.entities.Assessment.list();
    const strategies = await base44.entities.AdoptionStrategy.list();
    
    // Get recent system activity
    const recentRisks = await base44.entities.RiskAlert.filter({ status: 'new' }, '-created_date', 10);
    const trainingProgress = await base44.entities.TrainingProgress.filter({ user_email: user.email });

    // Build context for AI
    const contextPrompt = `You are an AI advisor providing personalized recommendations.
      
      User Profile:
      - Role: ${user.role}
      - Email: ${user.email}
      - Settings: ${JSON.stringify(userSettings[0] || {})}
      
      User Activity:
      - Completed Assessments: ${assessments.filter(a => a.status === 'completed').length}
      - Active Strategies: ${strategies.filter(s => s.status === 'active').length}
      - Recent Feedback: ${userFeedback.length} submissions
      - Training Progress: ${trainingProgress.length} modules
      
      Current System State:
      - Active Risks: ${recentRisks.length}
      - User's Priority Risks: ${JSON.stringify(recentRisks.slice(0, 3))}
      
      Based on this user's role, activity patterns, and current system state, generate 5-8 personalized, 
      actionable recommendations that will help them achieve their goals more effectively.
      
      Use current best practices in AI adoption, governance, and change management to inform your recommendations.
      Consider the user's role-specific needs and priorities.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: contextPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                priority: { 
                  type: "string",
                  enum: ["high", "medium", "low"]
                },
                category: {
                  type: "string",
                  enum: ["strategy", "risk", "training", "governance", "productivity"]
                },
                action_items: {
                  type: "array",
                  items: { type: "string" }
                },
                estimated_impact: { type: "string" },
                page_to_visit: { type: "string" }
              }
            }
          },
          personalization_note: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      recommendations: response.recommendations,
      personalization_note: response.personalization_note,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});