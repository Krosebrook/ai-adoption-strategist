import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences
    let prefs = await base44.entities.NotificationPreferences.filter({ user_email: user.email });
    if (!prefs || prefs.length === 0) {
      // Create default preferences
      prefs = [await base44.entities.NotificationPreferences.create({
        user_email: user.email,
        enabled_types: ['recommendation', 'alert', 'achievement'],
        minimum_priority: 'medium'
      })];
    }
    const preferences = prefs[0];

    // Gather user context
    const [strategies, riskAlerts, trainingProgress, learningPaths] = await Promise.all([
      base44.entities.AdoptionStrategy.filter({ status: 'active' }, '-created_date', 5),
      base44.entities.RiskAlert.filter({ status: 'new' }, '-created_date', 10),
      base44.entities.TrainingProgress.filter({ user_email: user.email, status: 'in_progress' }),
      base44.entities.LearningPath.filter({ user_email: user.email, status: 'active' })
    ]);

    const notifications = [];

    // Critical risk alerts
    const criticalRisks = riskAlerts.filter(r => r.severity === 'critical');
    if (criticalRisks.length > 0 && preferences.enabled_types.includes('alert')) {
      notifications.push({
        user_email: user.email,
        type: 'alert',
        priority: 'critical',
        title: `${criticalRisks.length} Critical Risk${criticalRisks.length > 1 ? 's' : ''} Detected`,
        message: 'Immediate attention required for critical risk alerts',
        action_url: createPageUrl('RiskMonitoring'),
        action_label: 'View Risks'
      });
    }

    // Learning path progress
    if (learningPaths.length > 0 && preferences.enabled_types.includes('reminder')) {
      const path = learningPaths[0];
      const recommendedModules = path.recommended_modules || [];
      const nextModule = recommendedModules.find(m => {
        const prog = trainingProgress.find(p => p.module_id === m.module_id);
        return !prog || prog.status !== 'completed';
      });

      if (nextModule) {
        notifications.push({
          user_email: user.email,
          type: 'reminder',
          priority: 'medium',
          title: 'Continue Your Learning Journey',
          message: `You have ${recommendedModules.length} modules in your learning path`,
          action_url: createPageUrl('Training'),
          action_label: 'Continue Learning'
        });
      }
    }

    // Strategy milestones
    for (const strategy of strategies) {
      const milestones = strategy.milestones || [];
      const upcomingMilestones = milestones.filter(m => 
        m.status === 'in_progress' || m.status === 'not_started'
      );
      
      if (upcomingMilestones.length > 0 && preferences.enabled_types.includes('update')) {
        notifications.push({
          user_email: user.email,
          type: 'update',
          priority: 'medium',
          title: 'Strategy Milestone Update',
          message: `${upcomingMilestones.length} milestone${upcomingMilestones.length > 1 ? 's' : ''} pending for ${strategy.organization_name}`,
          action_url: createPageUrl('StrategyAutomation'),
          action_label: 'View Strategy'
        });
      }
    }

    // AI-generated personalized recommendations
    if (preferences.enabled_types.includes('recommendation')) {
      const prompt = `As an AI assistant for enterprise AI adoption, analyze the user's current context and generate 1-2 highly relevant, actionable recommendations.

User Role: ${user.role}
Active Strategies: ${strategies.length}
Critical Risks: ${criticalRisks.length}
In-Progress Training: ${trainingProgress.length}
Learning Paths: ${learningPaths.length}

Generate specific, personalized recommendations that would help this user succeed in their AI adoption journey. Focus on immediate, high-impact actions.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  message: { type: "string" },
                  priority: { type: "string" },
                  action_label: { type: "string" }
                }
              }
            }
          }
        }
      });

      for (const rec of (response.recommendations || []).slice(0, 2)) {
        notifications.push({
          user_email: user.email,
          type: 'recommendation',
          priority: rec.priority || 'medium',
          title: rec.title,
          message: rec.message,
          action_label: rec.action_label
        });
      }
    }

    // Create notifications (filter by minimum priority)
    const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    const minPriority = priorityOrder[preferences.minimum_priority] || 2;
    
    const filteredNotifications = notifications.filter(n => 
      priorityOrder[n.priority] >= minPriority
    );

    const created = [];
    for (const notification of filteredNotifications) {
      const notif = await base44.asServiceRole.entities.Notification.create(notification);
      created.push(notif);
    }

    return Response.json({
      success: true,
      created: created.length,
      notifications: created
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});

function createPageUrl(pageName) {
  return `/${pageName}`;
}