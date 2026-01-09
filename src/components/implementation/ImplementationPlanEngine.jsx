import { base44 } from '@/api/base44Client';

/**
 * AI-Driven Implementation Plan Generator
 * Generates comprehensive implementation plans with steps, roadblocks, and timelines
 */

export async function generateImplementationPlan(assessment, selectedPlatform, config = {}) {
  const includeAdvancedRisk = config.include_advanced_risk !== false;
  const methodology = config.methodology || 'agile';
  const teamRoles = config.team_roles || [];
  const phaseConstraints = config.phase_constraints || [];
  const additionalRequirements = config.additional_requirements || '';
  
  const platform = selectedPlatform.platform_name;
  const orgName = assessment.organization_name;
  const departments = assessment.departments || [];
  const totalUsers = departments.reduce((sum, d) => sum + d.user_count, 0);
  const complianceReqs = assessment.compliance_requirements || [];
  const integrations = assessment.desired_integrations || [];
  const businessGoals = assessment.business_goals || [];
  const technicalConstraints = assessment.technical_constraints || {};
  const budgetConstraints = assessment.budget_constraints || {};

  const prompt = `You are an expert AI implementation consultant. Generate a comprehensive, high-level implementation plan for ${orgName} to adopt ${platform}.

PROJECT MANAGEMENT METHODOLOGY: ${methodology.toUpperCase()}
${methodology === 'agile' ? 'Use iterative sprints, continuous feedback, and adaptive planning.' : ''}
${methodology === 'waterfall' ? 'Use sequential phases with clear gates and deliverables.' : ''}
${methodology === 'hybrid' ? 'Combine structured planning with iterative execution.' : ''}
${methodology === 'lean' ? 'Focus on value streams, waste elimination, and continuous improvement.' : ''}

${teamRoles.length > 0 ? `REQUIRED TEAM COMPOSITION:
${teamRoles.map(r => `- ${r.role}: ${r.count} person(s) ${r.required ? '(Required)' : ''}`).join('\n')}
Ensure your plan accounts for these specific roles and their responsibilities.` : ''}

${phaseConstraints.length > 0 ? `PHASE BUDGET & TIMELINE CONSTRAINTS:
${phaseConstraints.map(p => `- ${p.phase}: Budget $${p.budget.toLocaleString()}, Duration ${p.duration}`).join('\n')}
Your plan must respect these constraints and provide justification if adjustments are needed.` : ''}

${additionalRequirements ? `ADDITIONAL REQUIREMENTS:
${additionalRequirements}` : ''}

CONTEXT:
- Total Users: ${totalUsers}
- Departments: ${departments.map(d => `${d.name} (${d.user_count} users)`).join(', ')}
- Business Goals: ${businessGoals.join(', ') || 'Not specified'}
- Compliance Requirements: ${complianceReqs.join(', ') || 'None specified'}
- Required Integrations: ${integrations.slice(0, 10).join(', ')}
- Cloud Preference: ${technicalConstraints.cloud_preference || 'Any'}
- Budget: ${budgetConstraints.min_budget ? `$${budgetConstraints.min_budget}-$${budgetConstraints.max_budget} ${budgetConstraints.budget_period}` : 'Not specified'}
- ROI Projection: ${selectedPlatform.roi_score?.toFixed(0)}%

Generate a detailed implementation plan that includes:
1. Key implementation phases with realistic timelines
2. Specific action steps for each phase
3. Potential roadblocks/challenges with mitigation strategies
4. Resource requirements (team, budget, time)
5. Success criteria and KPIs for each phase
6. Quick wins for early momentum
7. Risk factors and contingency plans

Provide practical, actionable guidance that considers the organization's context.`;

  const schema = {
    type: 'object',
    properties: {
      overview: {
        type: 'object',
        properties: {
          executive_summary: { type: 'string' },
          estimated_duration: { type: 'string' },
          total_investment_required: { type: 'string' },
          complexity_level: { type: 'string', enum: ['low', 'medium', 'high', 'very_high'] }
        }
      },
      phases: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            phase_name: { type: 'string' },
            duration: { type: 'string' },
            timeline_start: { type: 'string' },
            objectives: { type: 'array', items: { type: 'string' } },
            key_activities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  activity: { type: 'string' },
                  owner: { type: 'string' },
                  dependencies: { type: 'array', items: { type: 'string' } },
                  effort_estimate: { type: 'string' }
                }
              }
            },
            deliverables: { type: 'array', items: { type: 'string' } },
            success_criteria: { type: 'array', items: { type: 'string' } },
            resource_requirements: {
              type: 'object',
              properties: {
                team_size: { type: 'string' },
                budget_estimate: { type: 'string' },
                skills_needed: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      potential_roadblocks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            roadblock: { type: 'string' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            probability: { type: 'string', enum: ['low', 'medium', 'high'] },
            impact: { type: 'string' },
            mitigation_strategy: { type: 'string' },
            contingency_plan: { type: 'string' }
          }
        }
      },
      quick_wins: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            win: { type: 'string' },
            timeline: { type: 'string' },
            effort: { type: 'string', enum: ['low', 'medium', 'high'] },
            impact: { type: 'string', enum: ['low', 'medium', 'high'] },
            implementation_steps: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      critical_success_factors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            factor: { type: 'string' },
            description: { type: 'string' },
            measurement: { type: 'string' }
          }
        }
      },
      recommended_team: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            role: { type: 'string' },
            responsibilities: { type: 'array', items: { type: 'string' } },
            time_commitment: { type: 'string' },
            skills_required: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  };

  try {
    const plan = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema
    });

    // Add advanced risk analysis if requested
    if (includeAdvancedRisk) {
      const { analyzeAdvancedRisks } = await import('../risk/AdvancedRiskAnalysisEngine');
      try {
        const advancedRiskAnalysis = await analyzeAdvancedRisks(assessment, selectedPlatform, plan);
        plan.advanced_risk_analysis = advancedRiskAnalysis;
      } catch (riskError) {
        console.error('Advanced risk analysis failed:', riskError);
        // Continue without advanced risk analysis
      }
    }

    return plan;
  } catch (error) {
    console.error('Implementation plan generation failed:', error);
    throw new Error('Failed to generate implementation plan');
  }
}

/**
 * Generate timeline visualization data
 */
export function generateTimelineData(plan) {
  if (!plan?.phases) return [];

  const timeline = [];
  let cumulativeWeeks = 0;

  plan.phases.forEach((phase, index) => {
    const durationMatch = phase.duration.match(/(\d+)/);
    const weeks = durationMatch ? parseInt(durationMatch[0]) : 4;

    timeline.push({
      phase: phase.phase_name,
      startWeek: cumulativeWeeks,
      endWeek: cumulativeWeeks + weeks,
      duration: weeks,
      objectives: phase.objectives?.length || 0,
      deliverables: phase.deliverables?.length || 0
    });

    cumulativeWeeks += weeks;
  });

  return timeline;
}

/**
 * Estimate overall project health score
 */
export function calculateProjectHealthScore(plan, assessment) {
  let score = 100;
  
  // Complexity penalty
  if (plan.overview?.complexity_level === 'very_high') score -= 20;
  else if (plan.overview?.complexity_level === 'high') score -= 10;
  
  // Roadblock risk
  const highSeverityRoadblocks = plan.potential_roadblocks?.filter(
    r => r.severity === 'critical' || r.severity === 'high'
  ).length || 0;
  score -= highSeverityRoadblocks * 5;
  
  // Budget fit
  if (assessment.budget_constraints?.flexibility === 'strict') score -= 10;
  
  // Positive factors
  const quickWinsCount = plan.quick_wins?.length || 0;
  score += Math.min(quickWinsCount * 2, 10);
  
  return Math.max(0, Math.min(100, score));
}