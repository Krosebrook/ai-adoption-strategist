import { base44 } from '@/api/base44Client';
import { analyzeStakeholderPerspectives } from '../stakeholder/StakeholderAnalysisEngine';

/**
 * Stakeholder-Aware Implementation Planning Engine
 * Generates implementation plans that consider stakeholder conflicts and assign tasks to roles/agents
 */

export async function generateStakeholderAwareImplementationPlan(assessment, stakeholderAnalysis, strategy = null) {
  const topPlatform = assessment.recommended_platforms?.[0];
  
  const prompt = `You are creating an AI adoption implementation plan that accounts for multi-stakeholder perspectives.

ASSESSMENT:
- Organization: ${assessment.organization_name}
- Platform: ${topPlatform?.platform_name}
- Maturity: ${assessment.ai_assessment_score?.maturity_level}
- Departments: ${assessment.departments?.map(d => d.name).join(', ')}

STAKEHOLDER ANALYSIS:
- Overall Alignment: ${stakeholderAnalysis.overall_alignment_score}%
- Active Conflicts: ${stakeholderAnalysis.conflicts?.length || 0}
- Key Conflicts: ${stakeholderAnalysis.conflicts?.slice(0, 3).map(c => c.issue).join('; ')}

${stakeholderAnalysis.conflicts?.length > 0 ? `
MAJOR STAKEHOLDER CONFLICTS TO ADDRESS:
${stakeholderAnalysis.conflicts.slice(0, 5).map(c => 
  `- ${c.stakeholder_a} vs ${c.stakeholder_b}: ${c.issue} (${c.impact})`
).join('\n')}
` : ''}

STAKEHOLDER PRIORITIES:
${stakeholderAnalysis.stakeholder_analyses?.map(s => 
  `- ${s.role_name}: ${s.must_haves?.slice(0, 2).join(', ')}`
).join('\n')}

Generate a phased implementation plan that:
1. Addresses stakeholder conflicts early
2. Assigns tasks to specific stakeholder roles (Security Engineer, Engineering Manager, UX Designer, etc.)
3. Includes AI agent assignments where appropriate (e.g., SecurityAdvisor agent for security tasks)
4. Phases work to build alignment progressively
5. Includes conflict resolution checkpoints`;

  const schema = {
    type: 'object',
    properties: {
      plan_title: { type: 'string' },
      executive_summary: { type: 'string' },
      alignment_strategy: {
        type: 'object',
        properties: {
          overview: { type: 'string' },
          conflict_resolution_approach: { type: 'string' },
          consensus_building_activities: { type: 'array', items: { type: 'string' } }
        }
      },
      phases: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            phase_name: { type: 'string' },
            duration: { type: 'string' },
            objectives: { type: 'array', items: { type: 'string' } },
            stakeholder_focus: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  stakeholder_role: { type: 'string' },
                  focus_areas: { type: 'array', items: { type: 'string' } },
                  success_criteria: { type: 'string' }
                }
              }
            },
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  task_title: { type: 'string' },
                  description: { type: 'string' },
                  assigned_to_role: { type: 'string' },
                  assigned_to_agent: { type: 'string', description: 'AI agent name if applicable' },
                  priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                  estimated_effort: { type: 'string' },
                  dependencies: { type: 'array', items: { type: 'string' } },
                  conflict_mitigation: { type: 'string', description: 'How this task addresses stakeholder conflicts' }
                }
              }
            },
            conflict_checkpoints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  checkpoint_name: { type: 'string' },
                  stakeholders_involved: { type: 'array', items: { type: 'string' } },
                  decision_needed: { type: 'string' },
                  facilitation_guide: { type: 'string' }
                }
              }
            }
          }
        }
      },
      risk_mitigation_by_stakeholder: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            stakeholder_role: { type: 'string' },
            key_risks: { type: 'array', items: { type: 'string' } },
            mitigation_strategies: { type: 'array', items: { type: 'string' } },
            agent_support: { type: 'string', description: 'Which AI agent can help' }
          }
        }
      },
      agent_collaboration_model: {
        type: 'object',
        properties: {
          overview: { type: 'string' },
          agent_assignments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                agent_name: { type: 'string' },
                role_in_implementation: { type: 'string' },
                tasks: { type: 'array', items: { type: 'string' } },
                collaborates_with_roles: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      success_metrics: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            metric: { type: 'string' },
            stakeholder_perspective: { type: 'string' },
            target: { type: 'string' },
            measurement_method: { type: 'string' }
          }
        }
      }
    }
  };

  return await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: schema
  });
}

export async function createTasksFromPlan(plan, strategyId, assessmentId) {
  const tasks = [];
  
  for (const phase of plan.phases || []) {
    for (const task of phase.tasks || []) {
      tasks.push({
        resource_type: 'strategy',
        resource_id: strategyId,
        title: task.task_title,
        description: `${task.description}\n\n**Conflict Mitigation:** ${task.conflict_mitigation || 'N/A'}\n**Assigned Agent:** ${task.assigned_to_agent || 'N/A'}`,
        assigned_to: task.assigned_to_role,
        status: 'todo',
        priority: task.priority,
        phase: phase.phase_name,
        dependencies: task.dependencies || []
      });
    }
  }
  
  if (tasks.length > 0) {
    await base44.entities.Task.bulkCreate(tasks);
  }
  
  return tasks;
}