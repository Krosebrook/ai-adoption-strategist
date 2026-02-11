import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assessment_id } = await req.json();
    const assessment = await base44.entities.Assessment.get(assessment_id);
    
    // Get infrastructure analysis if available
    let infrastructureContext = '';
    try {
      const infraAnalysis = await base44.functions.invoke('analyzeInfrastructure', { assessment_id });
      infrastructureContext = `Infrastructure Score: ${infraAnalysis.data.infrastructure_score}/100`;
    } catch (e) {
      // Infrastructure analysis not available
    }

    const prompt = `You are an AI readiness assessment expert. Generate a comprehensive AI Readiness Score with actionable insights.

Assessment Data:
- Organization: ${assessment.organization_name}
- Departments: ${assessment.departments?.length || 0} departments with ${assessment.departments?.reduce((sum, d) => sum + d.user_count, 0)} total users
- Pain Points: ${assessment.pain_points?.join(', ')}
- Compliance Requirements: ${assessment.compliance_requirements?.join(', ')}
- Budget: ${JSON.stringify(assessment.budget_constraints)}
- Top Platform: ${assessment.recommended_platforms?.[0]?.platform_name}
${infrastructureContext}

Generate a detailed AI Readiness Score covering:
1. Overall readiness score (0-100) with breakdown by category
2. Organizational readiness (leadership, culture, change management)
3. Technical readiness (infrastructure, data, security)
4. Team readiness (skills, training, adoption willingness)
5. Process readiness (workflows, governance, compliance)
6. Financial readiness (budget, ROI understanding)
7. Specific actionable insights for improvement in each category
8. Priority action items with timelines
9. Quick wins vs long-term initiatives
10. Success metrics to track progress`;

    const readinessScore = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_readiness_score: { type: 'number', description: '0-100' },
          category_scores: {
            type: 'object',
            properties: {
              organizational: { type: 'number' },
              technical: { type: 'number' },
              team: { type: 'number' },
              process: { type: 'number' },
              financial: { type: 'number' }
            }
          },
          readiness_level: {
            type: 'string',
            enum: ['not_ready', 'early_stage', 'developing', 'ready', 'advanced']
          },
          organizational_readiness: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              strengths: { type: 'array', items: { type: 'string' } },
              gaps: { type: 'array', items: { type: 'string' } },
              actions: { type: 'array', items: { type: 'string' } }
            }
          },
          technical_readiness: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              strengths: { type: 'array', items: { type: 'string' } },
              gaps: { type: 'array', items: { type: 'string' } },
              actions: { type: 'array', items: { type: 'string' } }
            }
          },
          team_readiness: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              strengths: { type: 'array', items: { type: 'string' } },
              gaps: { type: 'array', items: { type: 'string' } },
              actions: { type: 'array', items: { type: 'string' } }
            }
          },
          process_readiness: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              strengths: { type: 'array', items: { type: 'string' } },
              gaps: { type: 'array', items: { type: 'string' } },
              actions: { type: 'array', items: { type: 'string' } }
            }
          },
          financial_readiness: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              strengths: { type: 'array', items: { type: 'string' } },
              gaps: { type: 'array', items: { type: 'string' } },
              actions: { type: 'array', items: { type: 'string' } }
            }
          },
          priority_actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action: { type: 'string' },
                category: { type: 'string' },
                priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                timeline: { type: 'string' },
                impact: { type: 'string' },
                effort: { type: 'string', enum: ['low', 'medium', 'high'] }
              }
            }
          },
          quick_wins: { type: 'array', items: { type: 'string' } },
          long_term_initiatives: { type: 'array', items: { type: 'string' } },
          success_metrics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                metric: { type: 'string' },
                target: { type: 'string' },
                timeline: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Update assessment with readiness score
    await base44.asServiceRole.entities.Assessment.update(assessment_id, {
      ai_readiness_score: readinessScore
    });

    return Response.json(readinessScore);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});