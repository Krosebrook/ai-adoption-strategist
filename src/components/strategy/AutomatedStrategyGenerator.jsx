import { base44 } from '@/api/base44Client';

/**
 * Automated AI Adoption Strategy Generator
 * Creates comprehensive strategy documents with goals, KPIs, resource allocation, and phased rollout
 */

export async function generateComprehensiveStrategy(assessment, selectedPlatforms, userPriorities = {}) {
  const primaryPlatform = selectedPlatforms[0];
  
  const prompt = `You are an expert AI adoption strategist. Create a comprehensive AI adoption strategy document for ${assessment.organization_name}.

ASSESSMENT CONTEXT:
- Organization: ${assessment.organization_name}
- Primary Platform: ${primaryPlatform.platform_name}
- Departments: ${assessment.departments?.map(d => d.name).join(', ')}
- Total Users: ${assessment.departments?.reduce((sum, d) => sum + d.user_count, 0)}
- Business Goals: ${assessment.business_goals?.join(', ')}
- Pain Points: ${assessment.pain_points?.join(', ')}
- Compliance: ${assessment.compliance_requirements?.join(', ')}

USER PRIORITIES:
${userPriorities.focus_areas ? `Focus Areas: ${userPriorities.focus_areas.join(', ')}` : ''}
${userPriorities.timeline_preference ? `Timeline: ${userPriorities.timeline_preference}` : ''}
${userPriorities.risk_tolerance ? `Risk Tolerance: ${userPriorities.risk_tolerance}` : ''}

Create a detailed strategy document that includes:
1. Executive summary with vision and strategic objectives
2. Specific, measurable goals (SMART framework)
3. Key Performance Indicators (KPIs) with targets and measurement methods
4. Detailed resource allocation (budget, team, time) across phases
5. Phased rollout plan with milestones and dependencies
6. Change management initiatives and communication plan
7. Training program recommendations by role
8. Success metrics and governance structure`;

  const schema = {
    type: 'object',
    properties: {
      executive_summary: {
        type: 'object',
        properties: {
          vision_statement: { type: 'string' },
          strategic_objectives: { type: 'array', items: { type: 'string' } },
          expected_outcomes: { type: 'array', items: { type: 'string' } },
          timeline_overview: { type: 'string' },
          investment_summary: { type: 'string' }
        }
      },
      strategic_goals: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            goal: { type: 'string' },
            description: { type: 'string' },
            timeframe: { type: 'string' },
            success_criteria: { type: 'array', items: { type: 'string' } },
            owner: { type: 'string' },
            priority: { type: 'string', enum: ['high', 'medium', 'low'] }
          }
        }
      },
      kpis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            kpi_name: { type: 'string' },
            description: { type: 'string' },
            measurement_method: { type: 'string' },
            baseline: { type: 'string' },
            target: { type: 'string' },
            target_date: { type: 'string' },
            reporting_frequency: { type: 'string' },
            owner: { type: 'string' }
          }
        }
      },
      resource_allocation: {
        type: 'object',
        properties: {
          total_budget: { type: 'string' },
          budget_breakdown: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                amount: { type: 'string' },
                percentage: { type: 'number' },
                justification: { type: 'string' }
              }
            }
          },
          team_requirements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string' },
                fte: { type: 'number' },
                duration: { type: 'string' },
                skills: { type: 'array', items: { type: 'string' } },
                sourcing: { type: 'string', enum: ['internal', 'external', 'hybrid'] }
              }
            }
          },
          timeline_allocation: { type: 'string' }
        }
      },
      phased_rollout: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            phase: { type: 'string' },
            phase_number: { type: 'number' },
            duration: { type: 'string' },
            objectives: { type: 'array', items: { type: 'string' } },
            deliverables: { type: 'array', items: { type: 'string' } },
            milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  milestone: { type: 'string' },
                  target_date: { type: 'string' },
                  success_criteria: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            dependencies: { type: 'array', items: { type: 'string' } },
            risks: { type: 'array', items: { type: 'string' } },
            resource_needs: { type: 'string' }
          }
        }
      },
      change_management: {
        type: 'object',
        properties: {
          strategy_overview: { type: 'string' },
          stakeholder_analysis: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                stakeholder_group: { type: 'string' },
                impact_level: { type: 'string' },
                engagement_approach: { type: 'string' }
              }
            }
          },
          communication_plan: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                audience: { type: 'string' },
                message: { type: 'string' },
                channel: { type: 'string' },
                frequency: { type: 'string' },
                owner: { type: 'string' }
              }
            }
          },
          resistance_mitigation: { type: 'array', items: { type: 'string' } }
        }
      },
      training_program: {
        type: 'object',
        properties: {
          overview: { type: 'string' },
          training_tracks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string' },
                track_name: { type: 'string' },
                duration: { type: 'string' },
                modules: { type: 'array', items: { type: 'string' } },
                delivery_method: { type: 'string' },
                certification: { type: 'boolean' }
              }
            }
          },
          success_metrics: { type: 'array', items: { type: 'string' } }
        }
      },
      governance: {
        type: 'object',
        properties: {
          structure: { type: 'string' },
          decision_making: { type: 'string' },
          steering_committee: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string' },
                responsibilities: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          review_cadence: { type: 'string' }
        }
      }
    }
  };

  const strategy = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: schema
  });

  return {
    ...strategy,
    assessment_id: assessment.id,
    primary_platform: primaryPlatform.platform_name,
    generated_date: new Date().toISOString()
  };
}